'use client';

import { useState, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import { Upload, FileImage, FileText, Download, Trash2, GripVertical, Shield, Settings } from 'lucide-react';

// PDF.js worker 설정
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

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

export default function ImagePdfConverterPage() {
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
    <div className="max-w-6xl mx-auto">
      <NavigationActions />

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <FileImage size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
          {isKorean ? '이미지 ↔ PDF 변환기' : 'Image ↔ PDF Converter'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {isKorean
            ? '100% 로컬 처리 | 서버 전송 없음 | 무제한 무료'
            : '100% Local Processing | No Server Upload | Unlimited Free'}
        </p>

        {/* Security Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
          color: 'white',
          padding: '0.5rem 1.5rem',
          borderRadius: '50px',
          fontSize: '0.9rem',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)',
          marginTop: '1rem'
        }}>
          <Shield size={18} />
          {isKorean ? '100% 오프라인 처리 (파일이 서버로 전송되지 않습니다)' : '100% Offline Processing (Files never leave your device)'}
        </div>
      </header>

      {/* Mode Toggle */}
      <div className="glass-panel animate-slide-up" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setMode('images-to-pdf');
              setImages([]);
              setPdfImages([]);
            }}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '1.5rem',
              borderRadius: '12px',
              border: mode === 'images-to-pdf' ? '3px solid #1d4ed8' : '2px solid var(--border)',
              background: mode === 'images-to-pdf' ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' : 'var(--surface)',
              color: mode === 'images-to-pdf' ? 'white' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
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
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '1.5rem',
              borderRadius: '12px',
              border: mode === 'pdf-to-images' ? '3px solid #1d4ed8' : '2px solid var(--border)',
              background: mode === 'pdf-to-images' ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' : 'var(--surface)',
              color: mode === 'pdf-to-images' ? 'white' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
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
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Settings size={20} style={{ color: '#1d4ed8' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {isKorean ? 'PDF 설정' : 'PDF Settings'}
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {isKorean ? '용지 크기' : 'Paper Size'}
                </label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="auto">{isKorean ? '자동 (이미지 크기)' : 'Auto (Image Size)'}</option>
                  <option value="a4">A4</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {isKorean ? '방향' : 'Orientation'}
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as Orientation)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="portrait">{isKorean ? '세로' : 'Portrait'}</option>
                  <option value="landscape">{isKorean ? '가로' : 'Landscape'}</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {isKorean ? '여백' : 'Margin'}
                </label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value) as Margin)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
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
              e.currentTarget.style.borderColor = '#1d4ed8';
              e.currentTarget.style.background = 'rgba(29, 78, 216, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--surface)';
            }}
          >
            <Upload size={48} style={{ margin: '0 auto 1rem', color: '#1d4ed8' }} />
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
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {isKorean ? `업로드된 이미지 (${images.length}개)` : `Uploaded Images (${images.length})`}
                </h3>
                <button
                  onClick={convertImagesToPdf}
                  disabled={converting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: converting ? '#94a3b8' : 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                    color: 'white',
                    fontWeight: 700,
                    cursor: converting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
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
                      background: 'linear-gradient(90deg, #1d4ed8, #1e40af)',
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
              e.currentTarget.style.borderColor = '#1d4ed8';
              e.currentTarget.style.background = 'rgba(29, 78, 216, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--surface)';
            }}
          >
            <Upload size={48} style={{ margin: '0 auto 1rem', color: '#1d4ed8' }} />
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
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {isKorean ? `추출된 이미지 (${pdfImages.length}페이지)` : `Extracted Images (${pdfImages.length} pages)`}
                </h3>
                <button
                  onClick={downloadImagesAsZip}
                  disabled={converting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: converting ? '#94a3b8' : 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                    color: 'white',
                    fontWeight: 700,
                    cursor: converting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
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
                      background: 'linear-gradient(90deg, #1d4ed8, #1e40af)',
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
        <RelatedTools toolId="document/img-pdf" />
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

      {/* SEO Section */}
      <SeoSection
        ko={{
          title: '이미지 ↔ PDF 변환기 - 100% 무료 온라인 도구',
          description: '이미지를 PDF로, PDF를 이미지로 변환하는 무료 온라인 도구입니다. 서버 전송 없이 브라우저에서 100% 로컬 처리되어 안전하고 빠릅니다. 무제한 무료 사용, 회원가입 불필요!',
          useCases: [
            {
              icon: '📄',
              title: '문서 제출용 PDF 생성',
              desc: '여러 장의 신분증, 증명서 사본을 하나의 PDF 파일로 합쳐서 이메일이나 온라인 제출 시스템에 업로드하세요. 순서를 자유롭게 조정할 수 있습니다.',
            },
            {
              icon: '🎨',
              title: '포트폴리오 & 프레젠테이션',
              desc: '디자인 작업물, 사진, 일러스트를 전문적인 PDF 포트폴리오로 제작하세요. 용지 크기와 여백을 설정하여 인쇄용 품질로 만들 수 있습니다.',
            },
            {
              icon: '🖼️',
              title: 'PDF 문서 이미지 추출',
              desc: 'PDF 파일에서 특정 페이지나 전체 페이지를 고화질 이미지(PNG)로 추출하세요. 웹사이트, SNS, 프레젠테이션에 바로 사용할 수 있습니다.',
            },
            {
              icon: '🛡️',
              title: '100% 프라이버시 보장',
              desc: '모든 변환 작업이 브라우저 내에서 처리되어 파일이 서버로 전송되지 않습니다. 민감한 문서도 안전하게 처리할 수 있습니다.',
            },
          ],
          steps: [
            {
              step: '1. 변환 모드 선택',
              desc: '상단에서 "이미지 → PDF" 또는 "PDF → 이미지" 모드를 선택합니다.',
            },
            {
              step: '2. 파일 업로드',
              desc: '드래그 앤 드롭 영역에 파일을 끌어다 놓거나, 클릭하여 파일을 선택합니다.',
            },
            {
              step: '3. 설정 조정 (이미지→PDF)',
              desc: '용지 크기(Auto/A4), 방향(세로/가로), 여백(없음/작게/크게)을 선택하고, 드래그하여 이미지 순서를 조정합니다.',
            },
            {
              step: '4. 변환 및 다운로드',
              desc: '"PDF로 변환" 또는 "ZIP으로 다운로드" 버튼을 클릭하여 완성된 파일을 다운로드합니다.',
            },
          ],
          faqs: [
            {
              q: '파일 용량 제한이 있나요?',
              a: '서버를 사용하지 않고 브라우저 메모리 내에서 처리되므로, 기기의 메모리에 따라 다릅니다. 일반적으로 수십 MB의 이미지나 PDF도 문제없이 처리할 수 있습니다. 대용량 파일의 경우 최신 브라우저와 충분한 RAM을 권장합니다.',
            },
            {
              q: '변환된 파일은 어디로 저장되나요?',
              a: '변환된 PDF 또는 ZIP 파일은 브라우저의 기본 다운로드 폴더에 저장됩니다. 서버에는 어떤 데이터도 전송되거나 저장되지 않습니다.',
            },
            {
              q: '이미지 순서를 바꿀 수 있나요?',
              a: '네! "이미지 → PDF" 모드에서 썸네일을 마우스로 드래그하여 자유롭게 순서를 변경할 수 있습니다. 좌측 상단의 숫자로 현재 순서를 확인할 수 있습니다.',
            },
            {
              q: 'PDF 품질은 어떻게 되나요?',
              a: '원본 이미지의 해상도를 최대한 유지합니다. "용지 크기"를 "Auto"로 설정하면 이미지 원본 크기 그대로 PDF에 삽입되며, "A4"로 설정하면 A4 용지에 맞춰 조정됩니다.',
            },
            {
              q: '모바일에서도 사용할 수 있나요?',
              a: '네! 스마트폰과 태블릿에서도 정상적으로 작동합니다. 단, 대용량 파일 처리 시 기기 성능에 따라 속도 차이가 있을 수 있습니다.',
            },
          ],
        }}
        en={{
          title: 'Image ↔ PDF Converter - 100% Free Online Tool',
          description: 'Free online tool to convert images to PDF and PDF to images. 100% local processing in your browser without server upload. Unlimited free usage, no registration required!',
          useCases: [
            {
              icon: '📄',
              title: 'Document Submission',
              desc: 'Combine multiple ID copies and certificates into a single PDF for email or online submission. Easily reorder pages by dragging.',
            },
            {
              icon: '🎨',
              title: 'Portfolio & Presentation',
              desc: 'Create professional PDF portfolios from your design work, photos, and illustrations. Configure paper size and margins for print quality.',
            },
            {
              icon: '🖼️',
              title: 'Extract Images from PDF',
              desc: 'Extract specific or all pages from PDF files as high-quality PNG images. Ready to use on websites, social media, and presentations.',
            },
            {
              icon: '🛡️',
              title: '100% Privacy Guaranteed',
              desc: 'All conversion happens in your browser. Files never leave your device. Safe for sensitive documents.',
            },
          ],
          steps: [
            {
              step: '1. Select Conversion Mode',
              desc: 'Choose "Images → PDF" or "PDF → Images" mode at the top.',
            },
            {
              step: '2. Upload Files',
              desc: 'Drag and drop files into the upload zone or click to select files.',
            },
            {
              step: '3. Adjust Settings (Images→PDF)',
              desc: 'Select paper size (Auto/A4), orientation (Portrait/Landscape), margin (None/Small/Large), and drag to reorder images.',
            },
            {
              step: '4. Convert & Download',
              desc: 'Click "Convert to PDF" or "Download as ZIP" to download your converted file.',
            },
          ],
          faqs: [
            {
              q: 'Is there a file size limit?',
              a: 'Since processing happens in your browser memory, the limit depends on your device\'s RAM. Generally, files up to tens of MB work fine. For large files, we recommend modern browsers with sufficient RAM.',
            },
            {
              q: 'Where are converted files saved?',
              a: 'Converted PDF or ZIP files are saved to your browser\'s default download folder. No data is sent to or stored on any server.',
            },
            {
              q: 'Can I reorder images?',
              a: 'Yes! In "Images → PDF" mode, drag thumbnails to reorder them freely. The number in the top-left corner shows the current order.',
            },
            {
              q: 'What about PDF quality?',
              a: 'Original image resolution is preserved. "Auto" paper size uses the original image dimensions, while "A4" scales to fit A4 paper.',
            },
            {
              q: 'Does it work on mobile?',
              a: 'Yes! It works on smartphones and tablets. However, processing speed may vary based on device performance for large files.',
            },
          ],
        }}
      />

      {/* Disclaimer */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem', borderLeft: '4px solid #1d4ed8' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
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
