'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import { parseHwpx, parseLegacyHwp } from '@/lib/hwp-parser';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

export default function HwpConverterPage() {
  const t = useTranslations('HwpConverter');
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
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('description')}
        </p>
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
    </div>
  );
}
