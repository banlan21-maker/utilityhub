'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef } from 'react';
import { useLocale } from 'next-intl';
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

export default function HwpConverterPage() {
  const t = useTranslations('HwpConverter');
  const locale = useLocale();
  const isKorean = locale === 'ko';
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionType, setConversionType] = useState<'pdf' | 'docx' | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.toLowerCase().split('.').pop();
      if (ext === 'hwp' || ext === 'hwpx') {
        setFile(selectedFile);
        setPdfUrl(null);
        setDocxBlob(null);
        setError(null);
        setParagraphs([]);
      } else {
        setError(t('error_supported'));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const ext = droppedFile.name.toLowerCase().split('.').pop();
      if (ext === 'hwp' || ext === 'hwpx') {
        setFile(droppedFile);
        setPdfUrl(null);
        setDocxBlob(null);
        setError(null);
        setParagraphs([]);
      } else {
        setError(t('error_supported'));
      }
    }
  };

  const sanitizeFileName = (name: string) => {
    return name.replace(/[\\/:*?"<>|]/g, '_').split('.')[0] || 'converted-document';
  };

  const convertFile = async (type: 'pdf' | 'docx') => {
    if (!file) return;

    setIsConverting(true);
    setConversionType(type);
    setError(null);

    try {
      let contentPages: string[] = [];
      
      if (file.name.toLowerCase().endsWith('.hwpx')) {
        contentPages = await parseHwpx(file);
      } else if (file.name.toLowerCase().endsWith('.hwp')) {
        contentPages = await parseLegacyHwp(file);
      } else {
        throw new Error('Unsupported format');
      }

      setParagraphs(contentPages);

      if (type === 'docx') {
        // Word Conversion
        const doc = new Document({
          sections: [{
            properties: {},
            children: contentPages.map(p => new Paragraph({
              children: [new TextRun(p)],
              spacing: { after: 200 }
            }))
          }]
        });

        const blob = await Packer.toBlob(doc);
        setDocxBlob(blob);
        saveAs(blob, `${sanitizeFileName(file.name)}.docx`);
        setIsConverting(false);
      } else {
        // PDF Conversion (Enhanced)
        setTimeout(async () => {
          if (!previewRef.current) return;

          try {
            const canvas = await html2canvas(previewRef.current, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff',
              windowWidth: 800, // Ensure fixed width during capture
              onclone: (clonedDoc) => {
                const element = clonedDoc.getElementById('pdf-preview-root');
                if (element) {
                  element.style.height = 'auto'; // Let it expand
                  element.style.overflow = 'visible';
                }
              }
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

            const fileName = `${sanitizeFileName(file.name)}.pdf`;
            const blob = doc.output('blob');
            saveAs(blob, fileName);
            
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
          } catch (err) {
            console.error('Render error:', err);
            setError(t('error'));
          } finally {
            setIsConverting(false);
          }
        }, 1000); // Increased delay for rendering
      }
    } catch (err) {
      console.error(err);
      setError(t('error'));
      setIsConverting(false);
    }
  };

  const resetConverter = () => {
    setFile(null);
    setPdfUrl(null);
    setDocxBlob(null);
    setError(null);
    setParagraphs([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <NavigationActions />
      {/* Hidden Preview for html2canvas */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '800px' }}>
        <div 
          ref={previewRef}
          id="pdf-preview-root"
          style={{ 
            width: '800px', 
            padding: '40px', 
            background: 'white', 
            color: 'black',
            fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
            lineHeight: '1.6',
            fontSize: '16px',
            whiteSpace: 'pre-wrap'
          }}
        >
          {paragraphs.map((p, i) => (
            <p key={i} style={{ marginBottom: '1.5em', wordBreak: 'break-all' }}>{p}</p>
          ))}
        </div>
      </div>
      <header style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <FileType size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('description')}</p>
      </header>

      <div className="glass-panel" style={{ padding: 'var(--page-padding)', textAlign: 'center' }}>
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: isDragging ? '2px solid var(--primary)' : '2px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '4rem 2rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: isDragging ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--surface-hover)',
            marginBottom: '2rem',
            transform: isDragging ? 'scale(1.02)' : 'scale(1)'
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".hwp,.hwpx"
            style={{ display: 'none' }}
          />
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>{isDragging ? '📥' : '📂'}</span>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {file ? file.name : t('dropzone')}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {t('supported')}
          </p>
        </div>

        {file && !pdfUrl && !docxBlob && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => convertFile('pdf')}
              disabled={isConverting}
              style={{
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                backgroundColor: isConverting && conversionType === 'pdf' ? 'var(--text-muted)' : 'var(--primary)',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                transition: 'all 0.2s',
                boxShadow: 'var(--shadow-md)',
                minWidth: '200px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isConverting && conversionType === 'pdf' ? t('converting') : t('download_pdf')}
            </button>
            <button
              onClick={() => convertFile('docx')}
              disabled={isConverting}
              style={{
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                backgroundColor: isConverting && conversionType === 'docx' ? 'var(--text-muted)' : 'var(--secondary)',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                transition: 'all 0.2s',
                boxShadow: 'var(--shadow-md)',
                minWidth: '200px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isConverting && conversionType === 'docx' ? t('converting') : t('download_docx')}
            </button>
          </div>
        )}

        {(pdfUrl || docxBlob) && (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '1rem', color: 'var(--success)' }}>✅ 변환 완료!</h3>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {pdfUrl && (
                <button
                  onClick={() => {
                    const fileName = `${sanitizeFileName(file?.name || '')}.pdf`;
                    // Fetch the blob from the URL if needed, or better, store blob in state
                    fetch(pdfUrl).then(res => res.blob()).then(blob => {
                      saveAs(blob, fileName);
                    });
                  }}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {t('download_pdf')}
                </button>
              )}
              {docxBlob && (
                <button
                  onClick={() => saveAs(docxBlob, `${sanitizeFileName(file?.name || '')}.docx`)}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: 'var(--secondary)',
                    color: 'white',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {t('download_docx')}
                </button>
              )}
            </div>
            
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {t('notice')}
            </p>
            
            <button
              onClick={resetConverter}
              style={{
                marginTop: '1.5rem',
                padding: '0.6rem 1.2rem',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {t('reset')}
            </button>
          </div>
        )}

        {error && (
          <p style={{ color: '#ef4444', marginTop: '1rem', fontWeight: 600 }}>
            {error}
          </p>
        )}
      </div>

      {/* Standard Bottom Sections */}
      <div style={{ width: '100%', maxWidth: '896px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <ShareBar
          title={isKorean ? 'HWP → PDF 변환기' : 'HWP → PDF Converter'}
          description={isKorean ? 'HWP/HWPX 파일을 PDF로 변환하는 무료 도구' : 'Free tool to convert HWP/HWPX files to PDF'}
        />
        <RelatedTools toolId="document/hwp-pdf" />
        <div style={{
          width: '100%',
          minHeight: '90px',
          background: 'rgba(241, 245, 249, 0.5)',
          border: '1px dashed #cbd5e1',
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontSize: '0.875rem',
          margin: '2rem 0',
        }}>
          {isKorean ? '광고 영역' : 'Ad Space'}
        </div>
      </div>

      <SeoSection
        ko={{
          title: "HWP/HWPX to PDF 변환기란 무엇인가요?",
          description: "HWP(Hangul Word Processor) 파일을 PDF로 변환하는 온라인 도구입니다. 한컴오피스가 설치되지 않은 맥(Mac), 리눅스, 스마트폰 등에서 HWP 파일을 열어야 할 때, 또는 PDF 형태로 제출·공유해야 할 때 즉시 사용할 수 있습니다. 이 HWP PDF 변환기는 파일을 업로드하면 서버에서 변환 후 다운로드 링크를 제공합니다. HWPX(한컴 표준 XML 형식)와 HWP(레거시 바이너리 형식) 모두 지원하며, HWPX 파일이 더 정확한 변환 결과를 제공합니다.",
          useCases: [
            { icon: '🎓', title: '취업 & 학교 서류 제출', desc: '자기소개서, 이력서, 레포트 등 한글 문서를 PDF로 변환해 이메일 첨부나 온라인 원서 접수 시 제출합니다.' },
            { icon: '🍎', title: '맥(Mac) & 아이폰 사용자', desc: '한컴오피스가 없는 Apple 기기에서 HWP 파일을 열 수 없을 때, PDF로 변환해 바로 확인합니다.' },
            { icon: '🤝', title: '문서 공유 & 호환성 확보', desc: '거래처, 동료, 고객에게 문서를 공유할 때 HWP보다 PDF가 어떤 기기에서도 동일하게 열립니다.' },
            { icon: '📁', title: '문서 아카이빙 & 장기 보관', desc: 'HWP 형식은 버전에 따라 호환 문제가 생길 수 있어, 중요 문서는 PDF로 변환해 장기 보관하는 것이 안전합니다.' },
          ],
          steps: [
            { step: 'HWP 또는 HWPX 파일 선택', desc: '파일 선택 버튼을 클릭하거나 파일을 드래그 앤 드롭합니다. .hwp, .hwpx 형식 모두 지원합니다.' },
            { step: '자동 변환 대기', desc: '파일 선택 즉시 서버에서 변환이 시작됩니다. 파일 크기에 따라 수 초에서 수십 초가 소요될 수 있습니다.' },
            { step: 'PDF 다운로드', desc: '변환 완료 후 PDF 다운로드 버튼이 활성화됩니다. 클릭하면 변환된 PDF 파일이 다운로드됩니다.' },
          ],
          faqs: [
            { q: 'HWP와 HWPX 중 어느 형식이 더 잘 변환되나요?', a: 'HWPX 형식이 훨씬 정확하게 변환됩니다. HWPX는 국제 표준 XML 기반이라 구조 파악이 용이하고, HWP(바이너리)는 레거시 형식이라 일부 요소가 다르게 표현될 수 있습니다. 한컴오피스 2014 이상에서 "다른 이름으로 저장 → HWPX"로 먼저 변환 후 업로드를 권장합니다.' },
            { q: '변환된 PDF에서 글꼴이 깨집니다', a: '서버에 설치된 폰트와 원본 문서에서 사용한 폰트가 다를 경우 대체 폰트로 표시됩니다. 주요 한글 폰트(맑은 고딕, 나눔고딕 등)는 기본 지원되며, 특수 폰트는 깨질 수 있습니다.' },
            { q: '업로드한 파일은 서버에 저장되나요?', a: '변환에 사용된 파일은 처리 후 즉시 삭제되며 서버에 보관되지 않습니다. 개인정보가 포함된 중요 문서도 안심하고 변환하실 수 있습니다.' },
          ],
        }}
        en={{
          title: "What is an HWP/HWPX to PDF Converter?",
          description: "An online tool that converts HWP (Hangul Word Processor) files to PDF. Ideal for Mac, Linux, or smartphone users without Hancom Office installed who need to open or submit HWP documents as PDFs. Both HWPX (Hancom standard XML format) and HWP (legacy binary format) are supported; HWPX produces more accurate conversion results.",
          useCases: [
            { icon: '🎓', title: 'Job Applications & Academic Submissions', desc: 'Convert cover letters, resumes, and reports written in Hancom to PDF for email attachments or online application portals.' },
            { icon: '🍎', title: 'Mac & iPhone Users', desc: "When you can't open an HWP file on an Apple device without Hancom Office, convert it to PDF for instant viewing." },
            { icon: '🤝', title: 'Document Sharing & Compatibility', desc: 'PDFs open identically on any device, unlike HWP — making them the better choice when sharing with clients, partners, or colleagues.' },
            { icon: '📁', title: 'Long-Term Document Archiving', desc: 'HWP format can have version compatibility issues over time. Convert important documents to PDF for safe, format-agnostic long-term storage.' },
          ],
          steps: [
            { step: 'Select an HWP or HWPX file', desc: 'Click the file picker or drag and drop a file. Both .hwp and .hwpx formats are supported.' },
            { step: 'Wait for automatic conversion', desc: 'Conversion starts immediately after file selection. Processing time varies by file size, from a few seconds to up to a minute.' },
            { step: 'Download the PDF', desc: 'Once conversion is complete, the PDF download button becomes active. Click it to download the converted file.' },
          ],
          faqs: [
            { q: 'Which format converts more accurately — HWP or HWPX?', a: 'HWPX converts much more accurately. HWPX is based on international XML standards, making the structure easy to parse, while HWP is a legacy binary format that can render some elements differently. We recommend saving as HWPX first in Hancom Office 2014 or later before uploading.' },
            { q: 'Fonts are broken in the converted PDF', a: 'If the fonts used in the original document differ from those installed on the server, fallback fonts are substituted. Major Korean fonts (Malgun Gothic, NanumGothic, etc.) are supported by default; custom or specialized fonts may not render correctly.' },
            { q: 'Is my uploaded file stored on the server?', a: 'No. Files are deleted immediately after conversion and are never retained on the server. Sensitive documents can be converted with confidence.' },
          ],
        }}
      />
    </div>
  );
}
