'use client';

import { useState, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import JSZip from 'jszip';
import { ui } from '@/app/components/ui';
import { Upload, FileImage, FileText, Download, Trash2, GripVertical, Shield, Settings } from 'lucide-react';

// ⚠️ jsPDF / pdfjs-dist 는 모듈 최상단에서 import 하면 안 된다.
// pdfjs-dist 가 import 시점에 브라우저 전용 전역(DOMMatrix)을 참조해
// 서버(Node) SSR에서 ReferenceError 로 라우트 전체가 크래시 → raw HTML 이 빈 껍데기가 됨.
// 따라서 두 라이브러리는 사용하는 핸들러 안에서 동적 import 한다(브라우저에서만 로드).

type ConversionMode = 'images-to-pdf' | 'pdf-to-images';
type PaperSize = 'auto' | 'a4';
type Orientation = 'portrait' | 'landscape';
type Margin = 0 | 10 | 20;

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface PDFImage {
  id: string;
  dataUrl: string;
  pageNumber: number;
}

export default function ImgPdfConverterClient({ seo }: { seo?: React.ReactNode }) {
  const locale = useLocale();
  const isKorean = locale === 'ko';

  const [mode, setMode] = useState<ConversionMode>('images-to-pdf');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [pdfImages, setPdfImages] = useState<PDFImage[]>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // PDF 설정
  const [paperSize, setPaperSize] = useState<PaperSize>('auto');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [margin, setMargin] = useState<Margin>(10);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // 이미지 파일 추가
  const handleImageFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newImages: ImageFile[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push({
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: e.target?.result as string,
          });
          if (newImages.length === files.length) {
            setImages((prev) => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }, []);

  // PDF 파일 처리
  const handlePdfFile = useCallback(async (file: File) => {
    if (!file.type.includes('pdf')) return;

    setConverting(true);
    setProgress(0);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.mjs';
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const extractedImages: PDFImage[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          } as any).promise;

          extractedImages.push({
            id: Math.random().toString(36).substr(2, 9),
            dataUrl: canvas.toDataURL('image/png'),
            pageNumber: i,
          });
        }

        setProgress(Math.round((i / totalPages) * 100));
      }

      setPdfImages(extractedImages);
    } catch (error) {
      console.error('PDF 처리 중 오류:', error);
      alert(isKorean ? 'PDF 파일 처리 중 오류가 발생했습니다.' : 'Error processing PDF file.');
    } finally {
      setConverting(false);
      setProgress(0);
    }
  }, [isKorean]);

  // 이미지를 PDF로 변환
  const convertImagesToPdf = useCallback(async () => {
    if (images.length === 0) return;

    setConverting(true);
    setProgress(0);

    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: paperSize === 'a4' ? 'a4' : undefined,
      });

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgElement = new Image();
        imgElement.src = img.preview;

        await new Promise((resolve) => {
          imgElement.onload = () => {
            const imgWidth = imgElement.naturalWidth;
            const imgHeight = imgElement.naturalHeight;

            let pdfWidth: number;
            let pdfHeight: number;

            if (paperSize === 'a4') {
              const a4Width = orientation === 'portrait' ? 210 : 297;
              const a4Height = orientation === 'portrait' ? 297 : 210;

              pdfWidth = a4Width - margin * 2;
              pdfHeight = (imgHeight / imgWidth) * pdfWidth;

              if (pdfHeight > a4Height - margin * 2) {
                pdfHeight = a4Height - margin * 2;
                pdfWidth = (imgWidth / imgHeight) * pdfHeight;
              }
            } else {
              pdfWidth = imgWidth * 0.264583; // px to mm
              pdfHeight = imgHeight * 0.264583;

              if (i > 0) {
                pdf.addPage([pdfWidth + margin * 2, pdfHeight + margin * 2]);
              }
            }

            if (i > 0 && paperSize === 'a4') {
              pdf.addPage();
            }

            pdf.addImage(img.preview, 'JPEG', margin, margin, pdfWidth, pdfHeight);
            resolve(null);
          };
        });

        setProgress(Math.round(((i + 1) / images.length) * 100));
      }

      pdf.save('converted.pdf');
    } catch (error) {
      console.error('PDF 변환 중 오류:', error);
      alert(isKorean ? 'PDF 변환 중 오류가 발생했습니다.' : 'Error converting to PDF.');
    } finally {
      setConverting(false);
      setProgress(0);
    }
  }, [images, paperSize, orientation, margin, isKorean]);

  // PDF 이미지를 ZIP으로 다운로드
  const downloadImagesAsZip = useCallback(async () => {
    if (pdfImages.length === 0) return;

    setConverting(true);
    setProgress(0);

    try {
      const zip = new JSZip();

      pdfImages.forEach((img, index) => {
        const base64Data = img.dataUrl.split(',')[1];
        zip.file(`page-${img.pageNumber}.png`, base64Data, { base64: true });
        setProgress(Math.round(((index + 1) / pdfImages.length) * 100));
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted-images.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('ZIP 생성 중 오류:', error);
      alert(isKorean ? 'ZIP 파일 생성 중 오류가 발생했습니다.' : 'Error creating ZIP file.');
    } finally {
      setConverting(false);
      setProgress(0);
    }
  }, [pdfImages, isKorean]);

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="max-w-[var(--tool-width-wide)] mx-auto">
      <NavigationActions />

      <ToolHeader
        icon={<FileImage />}
        title={isKorean ? '이미지 ↔ PDF 변환기' : 'Image ↔ PDF Converter'}
        subtitle={isKorean
          ? '100% 로컬 처리 | 서버 전송 없음 | 무제한 무료'
          : '100% Local Processing | No Server Upload | Unlimited Free'}
      >
        {/* Security Badge */}
        <div className={`${ui.badge} ${ui.blue}`} style={{ marginTop: '1rem', whiteSpace: 'normal' }}>
          <Shield size={14} />
          {isKorean ? '100% 오프라인 처리 (파일이 서버로 전송되지 않습니다)' : '100% Offline Processing (Files never leave your device)'}
        </div>
      </ToolHeader>

      {/* Mode Toggle */}
      <div className="animate-slide-up" style={{ marginBottom: '2rem' }}>
        <div className={ui.segmented}>
          <button
            onClick={() => {
              setMode('images-to-pdf');
              setImages([]);
              setPdfImages([]);
            }}
            className={`${ui.segment} ${mode === 'images-to-pdf' ? ui.segmentActive : ''}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <FileImage size={24} />
            {isKorean ? '이미지 → PDF' : 'Images → PDF'}
          </button>
          <button
            onClick={() => {
              setMode('pdf-to-images');
              setImages([]);
              setPdfImages([]);
            }}
            className={`${ui.segment} ${mode === 'pdf-to-images' ? ui.segmentActive : ''}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <FileText size={24} />
            {isKorean ? 'PDF → 이미지' : 'PDF → Images'}
          </button>
        </div>
      </div>

      {/* Images to PDF Mode */}
      {mode === 'images-to-pdf' && (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Settings Panel */}
          <div className={ui.card}>
            <h3 className={ui.cardTitle}>
              <Settings size={20} />
              {isKorean ? 'PDF 설정' : 'PDF Settings'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className={ui.field}>
                <label className={ui.label}>
                  {isKorean ? '용지 크기' : 'Paper Size'}
                </label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                  className={ui.input}
                >
                  <option value="auto">{isKorean ? '자동 (이미지 크기)' : 'Auto (Image Size)'}</option>
                  <option value="a4">A4</option>
                </select>
              </div>
              <div className={ui.field}>
                <label className={ui.label}>
                  {isKorean ? '방향' : 'Orientation'}
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as Orientation)}
                  className={ui.input}
                >
                  <option value="portrait">{isKorean ? '세로' : 'Portrait'}</option>
                  <option value="landscape">{isKorean ? '가로' : 'Landscape'}</option>
                </select>
              </div>
              <div className={ui.field}>
                <label className={ui.label}>
                  {isKorean ? '여백' : 'Margin'}
                </label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value) as Margin)}
                  className={ui.input}
                >
                  <option value={0}>{isKorean ? '없음' : 'None'}</option>
                  <option value={10}>{isKorean ? '작게 (10mm)' : 'Small (10mm)'}</option>
                  <option value={20}>{isKorean ? '크게 (20mm)' : 'Large (20mm)'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleImageFiles(e.dataTransfer.files);
            }}
            className="glass-panel"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              border: '3px dashed var(--border)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.background = 'var(--tint-violet-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--surface)';
            }}
          >
            <Upload size={48} style={{ margin: '0 auto 1rem', color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {isKorean ? '이미지 파일을 드래그하거나 클릭하여 업로드' : 'Drag & Drop Images or Click to Upload'}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {isKorean ? 'JPG, PNG, WebP 지원' : 'Supports JPG, PNG, WebP'}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleImageFiles(e.target.files)}
            style={{ display: 'none' }}
          />

          {/* Image List */}
          {images.length > 0 && (
            <div className={ui.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <h3 className={ui.cardTitle} style={{ margin: 0 }}>
                  {isKorean ? `업로드된 이미지 (${images.length}개)` : `Uploaded Images (${images.length})`}
                </h3>
                <button
                  onClick={convertImagesToPdf}
                  disabled={converting}
                  className={`${ui.button} ${ui.primary}`}
                >
                  <Download size={18} />
                  {converting ? `${isKorean ? '변환 중...' : 'Converting...'} ${progress}%` : isKorean ? 'PDF로 변환' : 'Convert to PDF'}
                </button>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                💡 {isKorean ? '드래그하여 순서를 변경할 수 있습니다' : 'Drag to reorder images'}
              </p>

              {converting && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--border)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: 'var(--primary-fill)',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'grab',
                      border: '2px solid var(--border)',
                      opacity: draggedIndex === index ? 0.5 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <img
                      src={img.preview}
                      alt={img.file.name}
                      style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      left: '0.5rem',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}>
                      <GripVertical size={12} />
                      {index + 1}
                    </div>
                    <button
                      onClick={() => removeImage(img.id)}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PDF to Images Mode */}
      {mode === 'pdf-to-images' && (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Upload Zone */}
          <div
            onClick={() => pdfInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handlePdfFile(file);
            }}
            className="glass-panel"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              border: '3px dashed var(--border)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.background = 'var(--tint-violet-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--surface)';
            }}
          >
            <Upload size={48} style={{ margin: '0 auto 1rem', color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {isKorean ? 'PDF 파일을 드래그하거나 클릭하여 업로드' : 'Drag & Drop PDF or Click to Upload'}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {isKorean ? 'PDF 파일 지원' : 'Supports PDF files'}
            </p>
          </div>

          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePdfFile(file);
            }}
            style={{ display: 'none' }}
          />

          {/* Extracted Images */}
          {pdfImages.length > 0 && (
            <div className={ui.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <h3 className={ui.cardTitle} style={{ margin: 0 }}>
                  {isKorean ? `추출된 이미지 (${pdfImages.length}페이지)` : `Extracted Images (${pdfImages.length} pages)`}
                </h3>
                <button
                  onClick={downloadImagesAsZip}
                  disabled={converting}
                  className={`${ui.button} ${ui.primary}`}
                >
                  <Download size={18} />
                  {converting ? `${isKorean ? 'ZIP 생성 중...' : 'Creating ZIP...'} ${progress}%` : isKorean ? 'ZIP으로 다운로드' : 'Download as ZIP'}
                </button>
              </div>

              {converting && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--border)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: 'var(--primary-fill)',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {pdfImages.map((img) => (
                  <div
                    key={img.id}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '2px solid var(--border)',
                    }}
                  >
                    <img
                      src={img.dataUrl}
                      alt={`Page ${img.pageNumber}`}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '0.5rem',
                      left: '0.5rem',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}>
                      {isKorean ? `페이지 ${img.pageNumber}` : `Page ${img.pageNumber}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Standard Bottom Sections */}
      <div style={{ width: '100%', maxWidth: '896px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <ShareBar
          title={isKorean ? '이미지 ↔ PDF 변환기' : 'Image ↔ PDF Converter'}
          description={isKorean ? '이미지를 PDF로, PDF를 이미지로 변환하는 무료 도구' : 'Free tool to convert images to PDF and PDF to images'}
        />
        <RelatedTools toolId="utilities/document/img-pdf-converter" />
      </div>

      {/* SEO Section */}
      {seo}

      {/* Disclaimer */}
      <div className={ui.card} style={{ marginTop: '2rem', borderLeft: '4px solid var(--color-primary)' }}>
        <h3 className={ui.cardTitle} style={{ marginBottom: '0.5rem' }}>
          {isKorean ? '⚖️ 면책 조항' : '⚖️ Disclaimer'}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {isKorean
            ? '본 도구는 사용자의 브라우저 메모리 내에서만 작동하며, 어떤 파일도 외부 서버로 전송하거나 저장하지 않습니다. 모든 변환 작업은 클라이언트 측에서 처리되어 개인정보 보호가 완벽하게 보장됩니다.'
            : 'This tool operates exclusively within your browser memory and does not transmit or store any files on external servers. All conversion processes are handled client-side, ensuring complete privacy protection.'}
        </p>
      </div>
    </div>
  );
}
