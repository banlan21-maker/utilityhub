'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import { parseHwpFile, type HwpParseResult } from '@/lib/hwp-parser';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { FileType } from 'lucide-react';
import s from './hwp-pdf-converter.module.css';
import { ui } from '@/app/components/ui';

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

export default function HwpConverterClient({ seo }: { seo?: React.ReactNode }) {
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

      <ToolHeader icon={<FileType />} title={t('title')} subtitle={t('description')} />

      <div className={`${ui.card} ${s.panel}`}>
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
            <button onClick={() => convertFile('pdf')} disabled={isConverting} className={`${ui.button} ${ui.primary} ${ui.lg} ${s.btn_main}`}>
              {isConverting && conversionType === 'pdf' ? t('converting') : t('download_pdf')}
            </button>
            <button onClick={() => convertFile('docx')} disabled={isConverting} className={`${ui.button} ${ui.primary} ${ui.lg} ${s.btn_main}`}>
              {isConverting && conversionType === 'docx' ? t('converting') : t('download_docx')}
            </button>
          </div>
        )}

        {done && (
          <div className={s.result_box}>
            <h3 className={s.result_title}>✅ {t('done')}</h3>
            <p className={s.notice}>{t('stats', { count: paragraphs.length })}</p>
            {warning && <p className={`${ui.notice} ${ui.amber} ${s.alert}`} role="alert">{warning}</p>}
            <div className={s.button_row}>
              {pdfBlob && (
                <button onClick={downloadPdf} className={`${ui.button} ${ui.primary} ${ui.lg} ${s.btn_main}`}>{t('download_pdf')}</button>
              )}
              {docxBlob && (
                <button onClick={downloadDocx} className={`${ui.button} ${ui.primary} ${ui.lg} ${s.btn_main}`}>{t('download_docx')}</button>
              )}
            </div>
            <p className={s.notice}>{t('notice')}</p>
            <button onClick={resetConverter} className={`${ui.button} ${ui.secondary} ${ui.sm} ${s.btn_reset}`}>{t('reset')}</button>
          </div>
        )}

        {error && <p className={`${ui.notice} ${ui.red} ${s.alert}`} role="alert">{error}</p>}
      </div>

      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="utilities/document/hwp-pdf-converter" />

      {seo}
    </div>
  );
}
