'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import { parseHwpFile, type HwpParseResult } from '@/lib/hwp-parser';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { FileType } from 'lucide-react';
import s from './hwp-pdf-converter.module.css';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// A4 (96dpi 기준 794 × 1123px)
const PAGE_W = 794;
const PAGE_H = 1123;
const PAGE_PAD = 56;
const CONTENT_H = PAGE_H - PAGE_PAD * 2;

const isTableRow = (p: string) => p.includes('\t');

function sanitizeFileName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, '_').replace(/\.(hwpx?|HWPX?)$/, '') || 'converted-document';
}

/** 한 쪽보다 긴 문단을 비슷한 길이로 나눈다(가능하면 공백에서 자름) */
function splitLong(text: string, parts: number): string[] {
  const out: string[] = [];
  let rest = text;
  for (let k = parts; k > 1; k--) {
    const target = Math.round(rest.length / k);
    let cut = rest.lastIndexOf(' ', target);
    if (cut < target * 0.6) cut = target;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  out.push(rest);
  return out.filter(Boolean);
}

/** 미리보기·PDF용 문단 렌더: 탭이 있으면 표의 한 행으로 그린다 */
function Block({ text }: { text: string }) {
  if (isTableRow(text)) {
    const cells = text.split('\t');
    return (
      <div className={s.doc_row} style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}>
        {cells.map((c, i) => <div key={i} className={s.doc_cell}>{c}</div>)}
      </div>
    );
  }
  return <p className={s.doc_p}>{text}</p>;
}

export default function HwpConverterClient() {
  const t = useTranslations('HwpConverter');

  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionType, setConversionType] = useState<'pdf' | 'docx' | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [pages, setPages] = useState<string[][]>([]);
  const [stage, setStage] = useState<'idle' | 'measure' | 'capture'>('idle');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);

  const validateAndSetFile = (f: File) => {
    const ext = f.name.toLowerCase().split('.').pop();
    if (ext !== 'hwp' && ext !== 'hwpx') {
      setError(t('error_supported'));
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError(t('size_error'));
      return;
    }
    setFile(f);
    setPdfBlob(null);
    setDocxBlob(null);
    setError(null);
    setWarning(null);
    setParagraphs([]);
    setPages([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  // ① 측정: 문단 높이를 재서 쪽 경계에서 문단이 잘리지 않도록 나눈다
  useEffect(() => {
    if (stage !== 'measure' || !measureRef.current) return;
    const nodes = Array.from(measureRef.current.children) as HTMLElement[];
    const heights = nodes.map(n => {
      const cs = getComputedStyle(n);
      return n.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
    });

    // 한 쪽보다 긴 문단은 나눠서 다시 잰다
    if (heights.some(h => h > CONTENT_H)) {
      setParagraphs(prev => prev.flatMap((p, i) =>
        heights[i] > CONTENT_H && !isTableRow(p) ? splitLong(p, Math.ceil(heights[i] / (CONTENT_H * 0.9))) : [p]));
      return;
    }

    const grouped: string[][] = [];
    let cur: string[] = [];
    let used = 0;
    paragraphs.forEach((p, i) => {
      if (used + heights[i] > CONTENT_H && cur.length) {
        grouped.push(cur);
        cur = [];
        used = 0;
      }
      cur.push(p);
      used += heights[i];
    });
    if (cur.length) grouped.push(cur);
    setPages(grouped);
    setStage('capture');
  }, [stage, paragraphs]);

  // ② 캡처: 쪽마다 따로 이미지로 만들어 PDF에 넣는다
  useEffect(() => {
    if (stage !== 'capture' || !pagesRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageEls = Array.from(pagesRef.current!.children) as HTMLElement[];
        for (let i = 0; i < pageEls.length; i++) {
          const canvas = await html2canvas(pageEls[i], { scale: 2, backgroundColor: '#ffffff', logging: false, width: PAGE_W, height: PAGE_H });
          if (cancelled) return;
          if (i > 0) doc.addPage();
          doc.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297);
        }
        setPdfBlob(doc.output('blob'));
      } catch (err) {
        console.error('PDF render error:', err);
        setError(t('error'));
      } finally {
        if (!cancelled) {
          setIsConverting(false);
          setStage('idle');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [stage, t]);

  const buildDocx = async (paras: string[]) => {
    // 연속된 표 행은 Word 표 하나로 묶는다
    const children: (Paragraph | Table)[] = [];
    for (let i = 0; i < paras.length;) {
      if (isTableRow(paras[i])) {
        const rows: string[][] = [];
        while (i < paras.length && isTableRow(paras[i])) rows.push(paras[i++].split('\t'));
        const cols = Math.max(...rows.map(r => r.length));
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: rows.map(r => new TableRow({
            children: Array.from({ length: cols }, (_, c) => new TableCell({
              width: { size: Math.floor(100 / cols), type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun(r[c] ?? '')] })],
            })),
          })),
        }));
        children.push(new Paragraph({ children: [] }));
      } else {
        children.push(new Paragraph({ children: [new TextRun(paras[i++])], spacing: { after: 160 } }));
      }
    }
    return Packer.toBlob(new Document({ sections: [{ properties: {}, children }] }));
  };

  const convertFile = async (type: 'pdf' | 'docx') => {
    if (!file) return;
    setIsConverting(true);
    setConversionType(type);
    setError(null);
    setWarning(null);

    try {
      const result: HwpParseResult = await parseHwpFile(file);
      if (result.partial) setWarning(t(`partial_${result.reason ?? 'no-body'}` as 'partial_encrypted'));
      if (result.paragraphs.length === 0) {
        setError(t('error'));
        setIsConverting(false);
        return;
      }
      setParagraphs(result.paragraphs);

      if (type === 'docx') {
        setDocxBlob(await buildDocx(result.paragraphs));
        setIsConverting(false);
      } else {
        setStage('measure');
      }
    } catch (err) {
      console.error(err);
      setError(t('error'));
      setIsConverting(false);
    }
  };

  const downloadPdf = () => {
    if (pdfBlob && file) saveAs(pdfBlob, `${sanitizeFileName(file.name)}.pdf`);
  };

  const downloadDocx = () => {
    if (docxBlob && file) saveAs(docxBlob, `${sanitizeFileName(file.name)}.docx`);
  };

  const resetConverter = () => {
    setFile(null);
    setPdfBlob(null);
    setDocxBlob(null);
    setError(null);
    setWarning(null);
    setParagraphs([]);
    setPages([]);
    setStage('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const done = pdfBlob !== null || docxBlob !== null;

  return (
    <div className={s.container}>
      {/* PDF용 숨김 렌더 영역: 측정용 1열 + 쪽별 페이지 */}
      <div aria-hidden="true" className={s.offscreen}>
        {stage === 'measure' && (
          <div ref={measureRef} className={s.doc_page_body} style={{ width: PAGE_W - PAGE_PAD * 2 }}>
            {paragraphs.map((p, i) => <Block key={i} text={p} />)}
          </div>
        )}
        {stage === 'capture' && (
          <div ref={pagesRef}>
            {pages.map((pg, i) => (
              <div key={i} className={s.doc_page} style={{ width: PAGE_W, height: PAGE_H, padding: PAGE_PAD }}>
                <div className={s.doc_page_body}>
                  {pg.map((p, j) => <Block key={j} text={p} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NavigationActions />

      <header className={s.header}>
        <div className={s.icon_wrap}><FileType size={40} /></div>
        <h1 className={s.title}>{t('title')}</h1>
        <p className={s.subtitle}>{t('description')}</p>
      </header>

      <div className={s.panel}>
        <div
          role="button"
          tabIndex={0}
          aria-label={t('dropzone')}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`${s.dropzone} ${isDragging ? s.dropzone_active : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".hwp,.hwpx"
            aria-label={t('uploadLabel')}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <span className={s.dropzone_icon}>{isDragging ? '📥' : '📂'}</span>
          <p className={s.dropzone_label}>{file ? file.name : t('dropzone')}</p>
          <p className={s.dropzone_hint}>{t('supported')}</p>
        </div>
        <p className={s.privacy}>🔒 {t('privacy')}</p>

        {file && !done && (
          <div className={s.button_row}>
            <button onClick={() => convertFile('pdf')} disabled={isConverting} className={s.btn_pdf}>
              {isConverting && conversionType === 'pdf' ? t('converting') : t('download_pdf')}
            </button>
            <button onClick={() => convertFile('docx')} disabled={isConverting} className={s.btn_docx}>
              {isConverting && conversionType === 'docx' ? t('converting') : t('download_docx')}
            </button>
          </div>
        )}

        {done && (
          <div className={s.result_box}>
            <h3 className={s.result_title}>✅ {t('done')}</h3>
            <p className={s.notice}>{t('stats', { count: paragraphs.length })}</p>
            {warning && <p className={s.warning} role="alert">{warning}</p>}
            <div className={s.button_row}>
              {pdfBlob && (
                <button onClick={downloadPdf} className={`${s.btn_download} ${s.btn_download_pdf}`}>{t('download_pdf')}</button>
              )}
              {docxBlob && (
                <button onClick={downloadDocx} className={`${s.btn_download} ${s.btn_download_docx}`}>{t('download_docx')}</button>
              )}
            </div>
            <p className={s.notice}>{t('notice')}</p>
            <button onClick={resetConverter} className={s.btn_reset}>{t('reset')}</button>
          </div>
        )}

        {error && <p className={s.error} role="alert">{error}</p>}
      </div>

      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="utilities/document/hwp-pdf-converter" />
      <div className={s.ad_slot}>AD</div>

      <SeoSection
        ko={{
          title: 'HWP·HWPX를 PDF·Word로 바꾸는 변환기란?',
          description: '한글 프로그램(한컴오피스)으로 만든 .hwp, .hwpx 파일의 글자와 표를 PDF나 Word(.docx)로 바꾸는 무료 도구입니다. 맥, 아이폰, 안드로이드, 회사 PC처럼 한글 프로그램이 없는 곳에서 받은 공문서·안내문·서식의 내용을 확인하거나, 편집하기 쉬운 Word로 옮길 때 씁니다. HWP는 압축된 본문을 직접 풀어 문서 끝까지 읽고, HWPX는 문서 안의 XML에서 문단을 읽으며, 표는 칸을 나눠 PDF와 Word에 표로 옮깁니다. PDF는 쪽 경계에서 문단이 잘리지 않도록 나눠 만듭니다. 파일은 서버로 올라가지 않고 이 브라우저 안에서만 처리되므로 이력서·계약서처럼 개인정보가 담긴 문서도 밖으로 나가지 않습니다. 다만 글꼴, 글자 크기, 줄 간격, 이미지, 도형, 쪽 배치 같은 서식은 옮겨지지 않으므로, 원본 모양 그대로 제출해야 하는 서류는 한글 프로그램이나 한컴독스에서 PDF로 저장하는 것이 좋습니다.',
          useCases: [
            { icon: '🍎', title: '맥·스마트폰에서 HWP 내용 확인', desc: '이메일로 받은 HWP 안내문이나 공문서를 한글 프로그램 없이 열어야 할 때 PDF로 바꿔 내용을 바로 읽습니다. 설치 없이 브라우저만 있으면 됩니다.' },
            { icon: '✏️', title: 'Word로 옮겨 편집', desc: 'HWP 서식이나 보고서 내용을 Word(.docx)로 옮겨 이어서 편집합니다. 표는 Word 표로 들어가 칸 내용을 그대로 고칠 수 있습니다.' },
            { icon: '🔒', title: '개인정보가 담긴 문서', desc: '이력서, 계약서, 신청서처럼 민감한 문서도 파일이 서버로 전송되지 않고 브라우저 안에서만 변환되어 외부에 남지 않습니다.' },
            { icon: '📋', title: '보도자료·공고문 내용 정리', desc: '정부 보도자료나 공고문 HWP에서 본문과 표 내용을 뽑아 PDF로 보관하거나 Word로 옮겨 요약·인용할 때 씁니다.' },
          ],
          steps: [
            { step: '파일 선택', desc: '영역을 눌러 .hwp 또는 .hwpx 파일을 고르거나 끌어다 놓습니다. 최대 10MB까지 지원하며, 파일명에 한글이 있어도 됩니다.' },
            { step: '변환 형식 선택', desc: '읽기·보관용이면 PDF, 내용을 고쳐 쓸 거라면 Word(.docx)를 누릅니다. 변환은 브라우저 안에서 바로 진행됩니다.' },
            { step: '결과 확인', desc: '변환된 문단 수가 표시됩니다. 암호가 걸렸거나 배포용으로 잠긴 문서는 본문을 읽을 수 없어 앞부분만 변환되며, 이 경우 경고가 함께 나옵니다.' },
            { step: '다운로드', desc: '다운로드 버튼을 누르면 원본 파일명 그대로 .pdf 또는 .docx 파일이 저장됩니다.' },
          ],
          faqs: [
            { q: 'HWP와 HWPX 모두 끝까지 변환되나요?', a: '네. HWP는 파일 안의 압축된 본문을 풀어서, HWPX는 본문 XML을 읽어서 문서 끝까지 글자와 표를 변환합니다. 단, 암호가 걸린 문서나 배포용 문서는 본문이 잠겨 있어 한글 프로그램이 저장해 둔 미리보기(앞부분)만 변환되며 화면에 경고가 표시됩니다.' },
            { q: '원본과 모양이 똑같이 나오나요?', a: '아니요. 이 도구는 글자와 표 내용을 옮기는 방식이라 글꼴, 글자 크기, 줄 간격, 이미지, 도형, 쪽 나눔은 원본과 다릅니다. 모양 그대로의 PDF가 필요하면 한글 프로그램이나 한컴독스에서 "PDF로 저장"을 쓰세요.' },
            { q: '파일이 서버에 저장되나요?', a: '아니요. 파일은 어디에도 전송되지 않고 지금 쓰는 브라우저 안에서만 읽고 변환합니다. 창을 닫으면 메모리에서도 사라집니다.' },
            { q: 'PDF에서 글자를 검색하거나 복사할 수 있나요?', a: '현재 PDF는 쪽마다 이미지로 만들어지므로 글자 검색·복사가 되지 않습니다. 글자를 고르거나 복사해야 한다면 Word(.docx)로 변환하세요.' },
          ],
        }}
        en={{
          title: 'What does this HWP/HWPX to PDF and Word converter do?',
          description: 'It converts the text and tables of Hancom Hangul .hwp and .hwpx files to PDF or Word (.docx), free and without Hancom Office. Use it on a Mac, phone or office PC to read Korean notices, forms and official documents, or move their content into Word for editing. HWP files are read by decompressing the document body to the very end, HWPX files by reading their XML, and tables are carried over as real tables in both PDF and Word. PDF pages are split between paragraphs so lines are never cut in half. Files are never uploaded; everything happens inside your browser, so résumés and contracts stay on your device. Fonts, sizes, spacing, images, shapes and page layout are not preserved, so for submissions that must look exactly like the original, save to PDF from Hangul or Hancom Docs instead.',
          useCases: [
            { icon: '🍎', title: 'Read HWP on Mac or Mobile', desc: 'Open a Korean notice or official HWP document from email without Hancom Office by converting it to PDF in the browser.' },
            { icon: '✏️', title: 'Edit in Word', desc: 'Move the content of an HWP form or report into Word to keep editing. Tables arrive as Word tables you can change cell by cell.' },
            { icon: '🔒', title: 'Private Documents', desc: 'Résumés, contracts and applications are converted locally and never sent to a server.' },
            { icon: '📋', title: 'Press Releases and Notices', desc: 'Pull the body text and tables out of Korean government press releases to archive as PDF or quote in Word.' },
          ],
          steps: [
            { step: 'Choose a File', desc: 'Click or drag in an .hwp or .hwpx file up to 10MB. Korean filenames are fine.' },
            { step: 'Pick a Format', desc: 'Choose PDF for reading and archiving or Word (.docx) to keep editing. Conversion runs in your browser.' },
            { step: 'Check the Result', desc: 'The number of converted paragraphs is shown. Password-protected or distribution-locked files only convert their preview, with a warning.' },
            { step: 'Download', desc: 'The .pdf or .docx file is saved with the original filename.' },
          ],
          faqs: [
            { q: 'Are both HWP and HWPX converted to the end?', a: 'Yes. HWP bodies are decompressed and HWPX XML is read through to the end, including tables. Password-protected and distribution documents keep their body locked, so only the stored preview (the beginning) is converted and a warning is shown.' },
            { q: 'Will it look exactly like the original?', a: 'No. Only text and tables are carried over; fonts, sizes, spacing, images, shapes and page breaks differ. For an exact copy, use "Save as PDF" in Hangul or Hancom Docs.' },
            { q: 'Is my file uploaded?', a: 'No. The file is read and converted entirely inside your browser and is gone when you close the tab.' },
            { q: 'Can I search or copy text in the PDF?', a: 'Not yet — each PDF page is an image. Convert to Word (.docx) if you need selectable text.' },
          ],
        }}
      />
    </div>
  );
}
