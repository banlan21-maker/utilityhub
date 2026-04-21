'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect, useCallback } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import { parseHwpx, parseLegacyHwp } from '@/lib/hwp-parser';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { FileType } from 'lucide-react';
import s from './hwp-pdf-converter.module.css';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function sanitizeFileName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, '_').split('.')[0] || 'converted-document';
}

export default function HwpConverterClient() {
  const t = useTranslations('HwpConverter');

  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionType, setConversionType] = useState<'pdf' | 'docx' | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingPdfCapture, setPendingPdfCapture] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const pdfFileNameRef = useRef('');

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      // No blob URLs created; pdfBlob is stored as Blob directly
    };
  }, []);

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
    setParagraphs([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  // After paragraphs are rendered, capture with html2canvas
  const captureAndMakePdf = useCallback(async () => {
    if (!previewRef.current) return;
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('pdf-preview-root');
          if (el) { el.style.height = 'auto'; el.style.overflow = 'visible'; }
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const doc = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const blob = doc.output('blob');
      setPdfBlob(blob);
    } catch (err) {
      console.error('PDF render error:', err);
      setError(t('error'));
    } finally {
      setIsConverting(false);
      setPendingPdfCapture(false);
    }
  }, [t]);

  // Poll DOM readiness with requestAnimationFrame instead of setTimeout
  useEffect(() => {
    if (!pendingPdfCapture || paragraphs.length === 0) return;

    let rafId: number;
    const checkAndCapture = () => {
      const el = previewRef.current;
      if (el && el.querySelectorAll('p').length === paragraphs.length) {
        captureAndMakePdf();
      } else {
        rafId = requestAnimationFrame(checkAndCapture);
      }
    };
    rafId = requestAnimationFrame(checkAndCapture);
    return () => cancelAnimationFrame(rafId);
  }, [pendingPdfCapture, paragraphs, captureAndMakePdf]);

  const convertFile = async (type: 'pdf' | 'docx') => {
    if (!file) return;
    setIsConverting(true);
    setConversionType(type);
    setError(null);

    try {
      let contentPages: string[];
      if (file.name.toLowerCase().endsWith('.hwpx')) {
        contentPages = await parseHwpx(file);
      } else {
        contentPages = await parseLegacyHwp(file);
      }
      setParagraphs(contentPages);

      if (type === 'docx') {
        const doc = new Document({
          sections: [{
            properties: {},
            children: contentPages.map(p => new Paragraph({
              children: [new TextRun(p)],
              spacing: { after: 200 },
            })),
          }],
        });
        const blob = await Packer.toBlob(doc);
        setDocxBlob(blob);
        setIsConverting(false);
      } else {
        // Signal useEffect to capture after DOM renders
        pdfFileNameRef.current = sanitizeFileName(file.name);
        setPendingPdfCapture(true);
      }
    } catch (err) {
      console.error(err);
      setError(t('error'));
      setIsConverting(false);
    }
  };

  const downloadPdf = () => {
    if (pdfBlob && file) {
      saveAs(pdfBlob, `${sanitizeFileName(file.name)}.pdf`);
    }
  };

  const downloadDocx = () => {
    if (docxBlob && file) {
      saveAs(docxBlob, `${sanitizeFileName(file.name)}.docx`);
    }
  };

  const resetConverter = () => {
    setFile(null);
    setPdfBlob(null);
    setDocxBlob(null);
    setError(null);
    setParagraphs([]);
    setPendingPdfCapture(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const done = pdfBlob !== null || docxBlob !== null;

  return (
    <div className={s.container}>
      {/* Hidden preview for html2canvas */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '800px' }}>
        <div
          ref={previewRef}
          id="pdf-preview-root"
          style={{
            width: '800px', padding: '40px', background: 'white', color: 'black',
            fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
            lineHeight: '1.6', fontSize: '16px', whiteSpace: 'pre-wrap',
          }}
        >
          {paragraphs.map((p, i) => (
            <p key={i} style={{ marginBottom: '1.5em', wordBreak: 'break-all' }}>{p}</p>
          ))}
        </div>
      </div>

      <NavigationActions />

      <header className={s.header}>
        <div style={{
          display: 'inline-flex', padding: '1rem', background: 'white',
          borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem',
        }}>
          <FileType size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.title}>{t('title')}</h1>
        <p className={s.subtitle}>{t('description')}</p>
      </header>

      <div className={s.panel}>
        {/* Drop zone */}
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

        {/* Conversion buttons */}
        {file && !done && (
          <div className={s.button_row}>
            <button
              onClick={() => convertFile('pdf')}
              disabled={isConverting}
              className={s.btn_pdf}
            >
              {isConverting && conversionType === 'pdf' ? t('converting') : t('download_pdf')}
            </button>
            <button
              onClick={() => convertFile('docx')}
              disabled={isConverting}
              className={s.btn_docx}
            >
              {isConverting && conversionType === 'docx' ? t('converting') : t('download_docx')}
            </button>
          </div>
        )}

        {/* Result */}
        {done && (
          <div className={s.result_box}>
            <h3 className={s.result_title}>✅ {t('done')}</h3>
            <div className={s.button_row}>
              {pdfBlob && (
                <button onClick={downloadPdf} className={`${s.btn_download} ${s.btn_download_pdf}`}>
                  {t('download_pdf')}
                </button>
              )}
              {docxBlob && (
                <button onClick={downloadDocx} className={`${s.btn_download} ${s.btn_download_docx}`}>
                  {t('download_docx')}
                </button>
              )}
            </div>
            <p className={s.notice}>{t('notice')}</p>
            <button onClick={resetConverter} className={s.btn_reset}>{t('reset')}</button>
          </div>
        )}

        {error && <p className={s.error}>{error}</p>}
      </div>

      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="utilities/document/hwp-pdf-converter" />
      <div className="w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">AD</div>

      <SeoSection
        ko={{
          title: "HWP/HWPX to PDF 변환기란 무엇인가요?",
          description: "HWP(한글 워드 프로세서) 및 HWPX 파일을 PDF 또는 Word(DOCX) 형식으로 변환하는 무료 온라인 도구입니다. 한컴오피스가 설치되지 않은 맥(Mac), 리눅스, 아이폰·안드로이드 스마트폰 등 모든 환경에서 즉시 사용할 수 있습니다. 업무용 공문서, 취업 서류, 학교 레포트 등을 PDF로 변환해 이메일 첨부나 온라인 접수 시스템에 제출하거나, Word 형식으로 변환해 편집을 이어갈 때 유용합니다. HWPX(한컴 표준 XML 형식)와 HWP(레거시 바이너리 형식)를 모두 지원하며, HWPX 파일이 레이아웃과 글꼴 측면에서 더 정확한 변환 결과를 제공합니다. 변환에 사용된 파일은 처리 후 즉시 삭제되어 개인정보가 안전하게 보호됩니다.",
          useCases: [
            { icon: '🎓', title: '취업 & 학교 서류 제출', desc: '자기소개서, 이력서, 레포트 등 한글 문서를 PDF로 변환해 이메일 첨부나 온라인 원서 접수 시 제출합니다. 어느 기기에서도 동일하게 열리는 PDF 형식이 필수입니다.' },
            { icon: '🍎', title: '맥(Mac) & 아이폰 사용자', desc: '한컴오피스가 없는 Apple 기기에서 HWP 파일을 열 수 없을 때, PDF로 변환해 바로 확인합니다. 설치 없이 브라우저만으로 즉시 사용 가능합니다.' },
            { icon: '🤝', title: '문서 공유 & 호환성 확보', desc: '거래처, 동료, 고객에게 문서를 공유할 때 HWP보다 PDF가 어떤 기기에서도 동일하게 열립니다. 레이아웃 깨짐 없이 안전하게 공유할 수 있습니다.' },
            { icon: '📁', title: '문서 아카이빙 & 장기 보관', desc: 'HWP 형식은 버전에 따라 호환 문제가 생길 수 있어, 중요 문서는 PDF로 변환해 장기 보관하는 것이 안전합니다. PDF는 10년 후에도 동일하게 열립니다.' },
          ],
          steps: [
            { step: 'HWP 또는 HWPX 파일 선택', desc: '파일 선택 버튼을 클릭하거나 파일을 드래그 앤 드롭합니다. .hwp, .hwpx 형식 모두 지원하며, 파일명에 한글이 포함되어도 정상적으로 처리됩니다.' },
            { step: '변환 형식 선택', desc: '"PDF로 다운로드" 또는 "Word(DOCX)로 다운로드" 버튼 중 원하는 형식을 선택합니다. PDF는 레이아웃 보존, DOCX는 추가 편집이 필요할 때 선택하세요.' },
            { step: '변환 완료 대기', desc: '버튼 클릭 즉시 변환이 시작됩니다. 파일 크기에 따라 수 초에서 수십 초가 소요될 수 있습니다. 변환 중에는 버튼이 비활성화됩니다.' },
            { step: '파일 다운로드', desc: '변환 완료 후 "다운로드" 버튼을 클릭하면 파일이 저장됩니다. 브라우저의 기본 다운로드 폴더에 저장되며, 원본 파일명을 유지한 채 확장자만 변경됩니다.' },
          ],
          faqs: [
            { q: 'HWP와 HWPX 중 어느 형식이 더 잘 변환되나요?', a: 'HWPX 형식이 훨씬 정확하게 변환됩니다. HWPX는 국제 표준 XML 기반이라 구조 파악이 용이하고, HWP(바이너리)는 레거시 형식이라 일부 요소가 다르게 표현될 수 있습니다. 한컴오피스 2014 이상에서 "다른 이름으로 저장 → HWPX"로 먼저 변환 후 업로드를 권장합니다.' },
            { q: '변환된 PDF에서 글꼴이 깨지거나 다르게 보입니다', a: '서버에 설치된 폰트와 원본 문서에서 사용한 폰트가 다를 경우 대체 폰트로 표시됩니다. 주요 한글 폰트(맑은 고딕, 나눔고딕 등)는 기본 지원되며, HCR 바탕·HCR 돋움 등 한컴 전용 폰트는 깨질 수 있습니다. HWPX로 먼저 변환 후 업로드하면 개선될 수 있습니다.' },
            { q: '업로드한 파일은 서버에 저장되나요?', a: '변환에 사용된 파일은 처리 후 즉시 삭제되며 서버에 보관되지 않습니다. 개인정보가 포함된 이력서, 공문서, 계약서 등 중요 문서도 안심하고 변환하실 수 있습니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: "What is an HWP/HWPX to PDF Converter?",
          description: "A free online tool that converts HWP (Hangul Word Processor) and HWPX files to PDF or Word (DOCX) format. Ideal for Mac, Linux, or smartphone users without Hancom Office installed who need to view, submit, or further edit HWP documents. Common use cases include submitting job applications and academic reports as PDFs, sharing documents with overseas partners who lack Hancom Office, and preserving important files in a universally readable format. Both HWPX (Hancom standard XML) and HWP (legacy binary) formats are supported. HWPX produces significantly more accurate conversion results in terms of layout and typography. All uploaded files are deleted immediately after conversion to protect your privacy.",
          useCases: [
            { icon: '🎓', title: 'Job Applications & Academic Submissions', desc: 'Convert cover letters, resumes, and reports written in Hancom Hangul to PDF for email attachments or online application portals. PDF ensures consistent rendering on any device the recipient uses.' },
            { icon: '🍎', title: 'Mac & iPhone Users', desc: "When you can't open an HWP file on an Apple device without Hancom Office, convert it to PDF for instant viewing directly in Safari or Preview. No installation required." },
            { icon: '🤝', title: 'Document Sharing & Cross-Platform Compatibility', desc: 'PDFs open identically on any device and OS, unlike HWP files — making them the safer choice when sharing with clients, partners, or colleagues who may not have Hancom Office.' },
            { icon: '📁', title: 'Long-Term Document Archiving', desc: 'HWP format can develop version compatibility issues over time. Converting important documents to PDF ensures they will open correctly a decade from now, regardless of software changes.' },
          ],
          steps: [
            { step: 'Select an HWP or HWPX file', desc: 'Click the upload area or drag and drop your file. Both .hwp and .hwpx formats are accepted, including files with Korean characters in their name.' },
            { step: 'Choose output format', desc: 'Select "Download as PDF" to preserve the layout, or "Download as Word (DOCX)" if you need to continue editing the document after conversion.' },
            { step: 'Wait for conversion', desc: 'Conversion begins immediately after clicking. Processing typically takes a few seconds to around a minute depending on file size. The button will be disabled during conversion.' },
            { step: 'Download your file', desc: "Click the download button when conversion is complete. The file saves to your browser's default downloads folder with the original filename and the new extension." },
          ],
          faqs: [
            { q: 'Which format converts more accurately — HWP or HWPX?', a: 'HWPX converts much more accurately. HWPX is based on international XML standards, making the structure easy to parse, while HWP is a legacy binary format that can render some elements differently. We recommend saving as HWPX first in Hancom Office 2014 or later before uploading.' },
            { q: 'Fonts appear broken or different in the converted PDF', a: 'If the fonts in your original document differ from those installed on the server, fallback fonts are substituted. Major Korean fonts (Malgun Gothic, NanumGothic, etc.) are supported by default. Hancom-exclusive fonts such as HCR Batang may not render correctly. Converting to HWPX first often improves the result.' },
            { q: 'Is my uploaded file stored on the server?', a: 'No. Files are deleted immediately after conversion and are never retained on the server. Resumes, official documents, and contracts containing personal information can all be converted with confidence.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        }}
      />
    </div>
  );
}
