'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { FileSearch, AlertTriangle, X, AlertCircle, Download, RefreshCw } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './pdf-ocr.module.css';

const LANGUAGE_OPTIONS = [
  { value: 'kor+eng', label: '한국어 + 영어 (기본값)' },
  { value: 'eng', label: '영어만' },
  { value: 'kor', label: '한국어만' },
  { value: 'jpn+eng', label: '일본어 + 영어' },
  { value: 'chi_sim+eng', label: '중국어(간체) + 영어' },
];

const QUALITY_OPTIONS = [
  { value: 1.5, label: '표준 (1.5× — 빠름, 작은 파일)' },
  { value: 2.0, label: '고품질 (2.0× — 권장)' },
  { value: 3.0, label: '최고품질 (3.0× — 느림)' },
];

const QUALITY_OPTIONS_EN = [
  { value: 1.5, label: 'Standard (1.5× — fast, smaller file)' },
  { value: 2.0, label: 'High Quality (2.0× — recommended)' },
  { value: 3.0, label: 'Best Quality (3.0× — slow)' },
];

export default function PdfOcrClient() {
  const t = useTranslations('pdf-ocr');
  const locale = useLocale();
  const isKo = locale === 'ko';

  // ── State ──
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [language, setLanguage] = useState('kor+eng');
  const [scale, setScale] = useState(2.0);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [maxPages, setMaxPages] = useState(999);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [largeFileWarning, setLargeFileWarning] = useState('');
  const [estimatedSize, setEstimatedSize] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [savedPdfRef, setSavedPdfRef] = useState<{ save: () => void; name: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Mobile detection ──
  useEffect(() => {
    const isMobile = /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent);
    const isLowMemory =
      (navigator as any).deviceMemory !== undefined &&
      (navigator as any).deviceMemory < 4;

    if (isMobile || isLowMemory) {
      setIsMobileDevice(true);
      setScale(1.0);
      setMaxPages(10);
      setShowMobileWarning(true);
    }
  }, []);

  const estimateOutputSize = (f: File, numPages: number, sc: number) => {
    const kbPerPage = sc === 1.0 ? 200 : sc === 2.0 ? 500 : 900;
    const estimatedKB = kbPerPage * numPages;
    const estimatedMB = (estimatedKB / 1024).toFixed(1);
    return isKo
      ? `약 ${estimatedMB}MB 예상 (원본: ${(f.size / 1024 / 1024).toFixed(1)}MB)`
      : `~${estimatedMB}MB estimated (original: ${(f.size / 1024 / 1024).toFixed(1)}MB)`;
  };

  // ── File handling ──
  const handleFile = useCallback(
    async (f: File) => {
      if (!f) return;
      if (f.type !== 'application/pdf') {
        setError(isKo ? 'PDF 파일만 업로드 가능합니다.' : 'Only PDF files are supported.');
        return;
      }
      if (f.size > 100 * 1024 * 1024) {
        setError(
          isKo
            ? '파일 크기가 너무 큽니다. 100MB 이하 PDF를 사용해주세요.'
            : 'File too large. Please use a PDF under 100MB.'
        );
        return;
      }

      setFile(f);
      setError('');
      setIsDone(false);
      setLargeFileWarning('');
      setEstimatedSize('');

      try {
        const pdfjsLib = await import('pdfjs-dist');
        // Use unpkg CDN matching the exact installed version to avoid worker mismatch
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const arrayBuffer = await f.arrayBuffer();
        const pdfDocCheck = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPagesCheck = pdfDocCheck.numPages;

        if (isMobileDevice && numPagesCheck > maxPages) {
          setError(
            isKo
              ? `모바일 환경에서는 최대 ${maxPages}페이지까지 처리 가능합니다. PC에서 접속하시면 제한 없이 사용할 수 있습니다.`
              : `Mobile browsers are limited to ${maxPages} pages. Please use a PC for unlimited processing.`
          );
          setFile(null);
          return;
        }

        if (numPagesCheck > 50) {
          const estimatedMinutes = Math.ceil(numPagesCheck * 20 / 60);
          setLargeFileWarning(
            isKo
              ? `${numPagesCheck}페이지 PDF입니다. 약 ${estimatedMinutes}분 이상 소요될 수 있습니다.`
              : `This PDF has ${numPagesCheck} pages. This may take over ${estimatedMinutes} minutes.`
          );
        }

        setEstimatedSize(estimateOutputSize(f, Math.min(numPagesCheck, maxPages), scale));
      } catch {
        // ignore size estimation errors
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMobileDevice, maxPages, scale, isKo]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeFile = () => {
    setFile(null);
    setError('');
    setIsDone(false);
    setLargeFileWarning('');
    setEstimatedSize('');
    setSavedPdfRef(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Main OCR processing ──
  const processOCR = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError('');
    setIsDone(false);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const { createWorker } = await import('tesseract.js');
      const jspdfModule = await import('jspdf');
      const { jsPDF } = jspdfModule;
      const GState = (jspdfModule as any).GState ?? (jsPDF as any).GState;

      // STEP 1: Load PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = Math.min(pdfDoc.numPages, maxPages);
      setTotalPages(numPages);

      // STEP 2: Tesseract worker
      const worker = await createWorker(language);

      // STEP 3: jsPDF instance (set up from first page dimensions)
      const firstPage = await pdfDoc.getPage(1);
      const firstViewport = firstPage.getViewport({ scale: 1.0 });
      const pdf = new jsPDF({
        orientation: firstViewport.width > firstViewport.height ? 'l' : 'p',
        unit: 'pt',
        format: [firstViewport.width, firstViewport.height],
      });

      // STEP 4: Per-page processing — single canvas reused for memory
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setCurrentPage(pageNum);
        setProgress(Math.round(((pageNum - 1) / numPages) * 100));

        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvas, viewport }).promise;

        // JPEG quality 0.75 to prevent file size explosion
        const imgData = canvas.toDataURL('image/jpeg', 0.75);

        const pageViewport = page.getViewport({ scale: 1.0 });
        const pageW = pageViewport.width;
        const pageH = pageViewport.height;

        if (pageNum > 1) {
          pdf.addPage([pageW, pageH], pageW > pageH ? 'l' : 'p');
        }

        // Insert original image
        pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH);

        // STEP 5: OCR
        const result = await worker.recognize(canvas);
        const ocrData = result.data as any;

        // STEP 6: Invisible text overlay
        const scaleRatio = 1 / scale;
        pdf.setTextColor(0, 0, 0);
        pdf.setGState(new GState({ opacity: 0 }));

        (ocrData.words || []).forEach((word: any) => {
          if (!word.text.trim()) return;
          if (word.confidence < 30) return;

          const x = word.bbox.x0 * scaleRatio;
          const y = word.bbox.y0 * scaleRatio;
          const w = (word.bbox.x1 - word.bbox.x0) * scaleRatio;
          const h = (word.bbox.y1 - word.bbox.y0) * scaleRatio;

          const fontSize = Math.max(6, h * 0.85);
          pdf.setFontSize(fontSize);
          pdf.text(word.text, x, y + h, { baseline: 'bottom' });
        });

        pdf.setGState(new GState({ opacity: 1 }));

        // Release canvas memory per page
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // STEP 7: Terminate worker
      await worker.terminate();

      // Release canvas completely
      canvas.width = 0;
      canvas.height = 0;

      setProgress(100);

      // STEP 8: Auto-download
      const originalName = file.name.replace(/\.pdf$/i, '');
      const outputName = isKo ? `${originalName}_검색가능.pdf` : `${originalName}_searchable.pdf`;
      pdf.save(outputName);

      // Save reference for re-download
      setSavedPdfRef({ save: () => pdf.save(outputName), name: outputName });
      setIsDone(true);
    } catch (err: any) {
      console.error('OCR error:', err);
      if (err?.message?.includes('memory') || err?.message?.includes('OOM')) {
        setError(
          isKo
            ? '메모리가 부족합니다. 품질을 "표준(1.5×)"으로 낮추거나 PC에서 다시 시도해주세요.'
            : 'Out of memory. Try lowering quality to "Standard (1.5×)" or use a PC.'
        );
      } else {
        setError(
          isKo
            ? '처리 중 오류가 발생했습니다. 다시 시도해주세요.'
            : 'An error occurred. Please try again.'
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const qualityOptions = isKo ? QUALITY_OPTIONS : QUALITY_OPTIONS_EN;

  return (
    <div className={s.container}>
      <NavigationActions />

      {/* Header */}
      <header className={s.header}>
        <div className={s.icon_wrap}>
          <FileSearch size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.title}>{t('title')}</h1>
        <p className={s.subtitle}>{t('description')}</p>
      </header>

      {/* Mobile warning */}
      {showMobileWarning && (
        <div className={s.mobileWarning}>
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <strong>{isKo ? 'PC 환경을 권장합니다' : 'PC recommended'}</strong>
            <p>
              {isKo
                ? '모바일 브라우저는 메모리 한계로 인해 많은 페이지의 PDF 처리 시 브라우저가 강제 종료될 수 있습니다.'
                : 'Mobile browsers may crash when processing large PDFs due to memory limits.'}
            </p>
            <p>
              {isKo
                ? `모바일에서는 품질이 자동으로 낮아지고 최대 10페이지로 제한됩니다.`
                : `On mobile, quality is automatically reduced and limited to 10 pages.`}
            </p>
            <p>
              {isKo
                ? '정확한 결과를 위해 PC에서 접속하시길 권장합니다.'
                : 'For best results, please use a PC.'}
            </p>
          </div>
          <button
            className={s.mobileWarnClose}
            onClick={() => setShowMobileWarning(false)}
            aria-label={isKo ? '경고 닫기' : 'Close warning'}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main panel */}
      {!isProcessing && !isDone && (
        <div className={s.panel}>
          {/* Upload zone */}
          {!file ? (
            <div
              className={`${s.upload_zone} ${isDragging ? s.upload_zone_drag : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              role="button"
              tabIndex={0}
              aria-label={isKo ? 'PDF 파일 업로드' : 'Upload PDF file'}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <div className={s.upload_icon}>📄</div>
              <p className={s.upload_text}>
                {isKo ? 'PDF 파일을 드래그하거나 클릭하세요' : 'Drag & drop or click to upload PDF'}
              </p>
              <p className={s.upload_hint}>
                {isKo
                  ? `지원 형식: PDF / 최대 100MB${isMobileDevice ? ' / 모바일: 최대 10페이지' : ''}`
                  : `Supports: PDF / Max 100MB${isMobileDevice ? ' / Mobile: max 10 pages' : ''}`}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={handleInputChange}
                aria-label={isKo ? 'PDF 파일 선택' : 'Select PDF file'}
              />
            </div>
          ) : (
            <div className={s.file_info}>
              <div style={{ flex: 1 }}>
                <p className={s.file_name}>📄 {file.name}</p>
                <p className={s.file_meta}>
                  {isKo ? `파일 크기: ${(file.size / 1024 / 1024).toFixed(1)}MB` : `Size: ${(file.size / 1024 / 1024).toFixed(1)}MB`}
                </p>
                {estimatedSize && (
                  <p className={s.file_size_warn}>
                    ⚠️ {isKo ? '변환 후 예상 크기: ' : 'Estimated size after conversion: '}{estimatedSize}
                  </p>
                )}
              </div>
              <button
                className={s.file_remove}
                onClick={removeFile}
                aria-label={isKo ? '파일 제거' : 'Remove file'}
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Language option */}
          <div>
            <label className={s.field_label}>
              {isKo ? 'OCR 언어' : 'OCR Language'}
            </label>
            <select
              className={s.select_field}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label={isKo ? 'OCR 언어 선택' : 'Select OCR language'}
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quality option */}
          <div>
            <label className={s.field_label}>
              {isKo ? '렌더링 품질' : 'Rendering Quality'}
            </label>
            {isMobileDevice && (
              <p className={s.quality_fixed_note}>
                {isKo
                  ? '⚠️ 모바일 환경: 품질이 표준(1.0×)으로 자동 고정됩니다.'
                  : '⚠️ Mobile: Quality is automatically fixed to Standard (1.0×).'}
              </p>
            )}
            <div className={s.quality_group}>
              {qualityOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`${s.quality_label} ${scale === opt.value ? s.quality_active : ''} ${isMobileDevice ? s.quality_disabled : ''}`}
                >
                  <input
                    type="radio"
                    className={s.quality_radio}
                    name="quality"
                    value={opt.value}
                    checked={scale === opt.value}
                    onChange={() => !isMobileDevice && setScale(opt.value)}
                    disabled={isMobileDevice}
                    aria-label={opt.label}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Large file warning */}
          {largeFileWarning && (
            <div className={s.large_warn}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>{isKo ? '⚠️ 페이지 수가 많습니다' : '⚠️ Large document detected'}</strong>
                <br />
                {largeFileWarning}
                <br />
                {isKo ? '브라우저 탭을 닫지 마세요.' : 'Do not close the browser tab.'}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className={s.error_box}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                {error}
                <br />
                <button className={s.error_retry} onClick={() => setError('')} aria-label={isKo ? '다시 시도' : 'Retry'}>
                  {isKo ? '다시 시도' : 'Retry'}
                </button>
              </div>
            </div>
          )}

          {/* Convert button */}
          <button
            className={s.convert_btn}
            onClick={processOCR}
            disabled={!file || isProcessing}
            aria-label={isKo ? '검색 가능한 PDF로 변환하기' : 'Convert to searchable PDF'}
          >
            🔍 {isKo ? '검색 가능한 PDF로 변환하기' : 'Convert to Searchable PDF'}
          </button>
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <div className={s.progress_box}>
          <p className={s.progress_title}>
            🔄 {isKo ? 'OCR 처리 중...' : 'Processing OCR...'}
          </p>
          <p className={s.progress_page}>
            {isKo
              ? `${currentPage} / ${totalPages} 페이지 처리 중`
              : `Processing page ${currentPage} of ${totalPages}`}
          </p>
          <div className={s.progress_bar_wrap}>
            <div className={s.progress_bar_fill} style={{ width: `${progress}%` }} />
          </div>
          <p className={s.progress_pct}>{progress}%</p>
          <p className={s.progress_warn}>
            {isKo
              ? '⚠️ 브라우저 탭을 닫으면 처음부터 다시 시작해야 합니다.'
              : '⚠️ Closing this tab will restart the process from the beginning.'}
          </p>
        </div>
      )}

      {/* Done */}
      {isDone && !isProcessing && (
        <div className={s.done_box}>
          <p style={{ fontSize: '2rem' }}>✅</p>
          <p className={s.done_title}>{isKo ? '변환 완료!' : 'Conversion complete!'}</p>
          <p className={s.done_filename}>{savedPdfRef?.name}</p>
          <p className={s.done_note}>
            {isKo ? '자동으로 다운로드되었습니다.' : 'The file has been downloaded automatically.'}
          </p>
          <div className={s.done_actions}>
            <button
              className={s.done_btn_primary}
              onClick={() => savedPdfRef?.save()}
              aria-label={isKo ? '다시 다운로드' : 'Download again'}
            >
              <Download size={16} />
              {isKo ? '다시 다운로드' : 'Download again'}
            </button>
            <button
              className={s.done_btn_secondary}
              onClick={removeFile}
              aria-label={isKo ? '새 파일 변환' : 'Convert new file'}
            >
              <RefreshCw size={16} style={{ marginRight: '0.3rem' }} />
              {isKo ? '새 파일 변환' : 'Convert new file'}
            </button>
          </div>
        </div>
      )}

      {/* Usage info box */}
      <div className={s.info_box}>
        <p className={s.info_title}>
          💡 {isKo ? '이 툴이 가장 효과적인 경우' : 'Best use cases'}
        </p>
        <div className={s.info_section}>
          <p className={s.info_subtitle}>{isKo ? '✅ 적합한 문서' : '✅ Works well'}</p>
          {(isKo
            ? ['스캔된 계약서·공문서·세금계산서', '팩스로 받은 문서', '텍스트 위주 스캔 자료', '부재 목록, 자재표 등 표 형태 문서']
            : ['Scanned contracts, official documents, invoices', 'Faxed documents', 'Text-heavy scanned materials', 'Parts lists and material tables']
          ).map((item, i) => (
            <div key={i} className={s.info_item}>✅ {item}</div>
          ))}
        </div>
        <hr className={s.info_divider} />
        <div className={s.info_section}>
          <p className={`${s.info_subtitle} ${s.info_item_warn}`}>{isKo ? '⚠️ 인식률이 낮을 수 있는 경우' : '⚠️ Lower accuracy expected'}</p>
          {(isKo
            ? ['선(Line)이 글자와 겹치는 복잡한 CAD 도면', '치수선이 밀집된 설계 도면', '손글씨 주석이 혼재된 문서', '저해상도 스캔 (150dpi 미만)']
            : ['Complex CAD drawings with overlapping lines and text', 'Dense engineering drawings with dimension lines', 'Documents with mixed handwriting', 'Low-resolution scans (below 150dpi)']
          ).map((item, i) => (
            <div key={i} className={`${s.info_item} ${s.info_item_warn}`}>⚠️ {item}</div>
          ))}
        </div>
        <hr className={s.info_divider} />
        <div className={s.info_section}>
          <p className={s.info_subtitle}>⚡ {isKo ? '처리 시간 안내' : 'Processing time'}</p>
          <div className={s.info_item}>
            {isKo
              ? '• 페이지당 약 10~30초 (PC 성능에 따라 다름)'
              : '• ~10–30 seconds per page (depends on PC performance)'}
          </div>
          <div className={s.info_item}>
            {isKo
              ? '• PC 권장 (모바일은 최대 10페이지 제한)'
              : '• PC recommended (mobile limited to 10 pages)'}
          </div>
        </div>
        <hr className={s.info_divider} />
        <div className={s.info_section}>
          <p className={s.info_subtitle}>🔒 {isKo ? '개인정보 보호' : 'Privacy protection'}</p>
          <div className={s.info_item}>
            {isKo ? '• 파일이 서버로 전송되지 않습니다' : '• Files never leave your browser'}
          </div>
          <div className={s.info_item}>
            {isKo ? '• 모든 처리가 내 브라우저에서만 실행됩니다' : '• All processing is done entirely client-side'}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className={s.disclaimer}>
        <h4>⚠️ {isKo ? '사용 전 반드시 확인하세요' : 'Important notices before use'}</h4>
        <h5>{isKo ? '[인식률]' : '[Accuracy]'}</h5>
        <p>
          {isKo
            ? 'OCR 인식률은 깨끗한 인쇄 텍스트 기준 95~99%입니다. 선과 글자가 겹치는 도면, 저해상도 스캔, 손글씨는 인식률이 크게 낮아질 수 있습니다.'
            : 'OCR accuracy is 95–99% for clean printed text. Accuracy drops significantly for drawings with overlapping lines, low-resolution scans, or handwriting.'}
        </p>
        <h5>{isKo ? '[파일 크기]' : '[File size]'}</h5>
        <p>
          {isKo
            ? '변환 후 파일 크기가 원본보다 크게 증가합니다. PDF의 모든 페이지가 이미지로 변환되어 저장되기 때문입니다. (예: 원본 2MB → 변환 후 약 10~30MB)'
            : 'The converted file will be larger than the original because every page is stored as a JPEG image. (e.g., 2MB original → ~10–30MB converted)'}
        </p>
        <h5>{isKo ? '[중요 문서]' : '[Important documents]'}</h5>
        <p>
          {isKo
            ? '변환 결과는 참고용입니다. 중요한 내용은 반드시 원본 문서와 대조하세요.'
            : 'Conversion results are for reference only. Always verify important content against the original document.'}
        </p>
      </div>

      {/* Bottom 7 sections */}
      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="document/pdf-ocr" />
      <div className="w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">
        AD
      </div>
      <SeoSection
        ko={{
          title: 'PDF 검색 변환기란 무엇인가요?',
          description:
            'PDF 검색 변환기는 스캔된 계약서, 공문서, 팩스 문서처럼 텍스트 검색이 불가한 이미지형 PDF를 Ctrl+F로 검색 가능한 PDF로 변환해주는 도구입니다. Mozilla의 pdf.js로 각 페이지를 이미지로 변환한 뒤, Google이 개발한 Tesseract OCR 엔진으로 텍스트와 위치 좌표를 추출하고, jsPDF로 원본 이미지 위에 투명한 텍스트 레이어를 얹어 검색 가능한 PDF를 생성합니다. 한국어와 영어를 포함한 다국어를 지원하며, 모든 처리가 브라우저 안에서만 이루어져 파일이 서버로 전송되지 않아 기밀 문서도 안심하고 변환할 수 있습니다. 스캔 텍스트가 깨끗한 계약서·공문서에서 높은 인식률을 보이며, PC 환경에서의 사용을 권장합니다.',
          useCases: [
            {
              icon: '📄',
              title: '스캔 계약서·공문서 검색',
              desc: '팩스나 스캐너로 받은 계약서, 공문서를 검색 가능한 형태로 변환하세요. 특정 조항이나 날짜, 금액을 키워드로 즉시 찾을 수 있어 문서 관리 효율이 크게 향상됩니다.',
            },
            {
              icon: '🧾',
              title: '세금계산서·영수증 디지털화',
              desc: '스캔된 세금계산서나 영수증을 검색 가능한 PDF로 변환하면 거래처명, 금액, 날짜를 키워드로 빠르게 찾을 수 있어 세무·회계 업무 처리 속도가 빨라집니다.',
            },
            {
              icon: '📚',
              title: '오래된 문서 아카이브',
              desc: '종이 문서를 스캔해 보관 중인 오래된 자료를 검색 가능한 디지털 아카이브로 전환하세요. 원본 이미지 품질은 그대로 유지하면서 텍스트 검색 기능만 추가됩니다.',
            },
            {
              icon: '📋',
              title: '자재표·부재 목록 검색',
              desc: '텍스트와 선이 분리된 표 형태의 자재표, 부재 목록 PDF에서 특정 자재명이나 규격을 키워드로 빠르게 검색할 수 있습니다.',
            },
          ],
          steps: [
            {
              step: 'PDF 업로드',
              desc: '변환할 PDF 파일을 업로드합니다. 파일을 드래그해서 놓거나 업로드 영역을 클릭해 선택하세요. 최대 100MB, PDF 형식만 지원하며, 모바일에서는 최대 10페이지로 제한됩니다.',
            },
            {
              step: '옵션 설정',
              desc: 'OCR 언어와 렌더링 품질을 설정합니다. 한국어가 포함된 문서는 "한국어 + 영어"를 선택하고, 품질은 "고품질(2.0×)"을 권장합니다. 변환 후 예상 파일 크기가 표시되니 확인하세요.',
            },
            {
              step: '변환 시작',
              desc: '[검색 가능한 PDF로 변환하기] 버튼을 클릭합니다. 페이지 수에 따라 수 분이 소요될 수 있으므로 처리 중 브라우저 탭을 닫지 마세요. 진행 상황이 실시간으로 표시됩니다.',
            },
            {
              step: '다운로드 확인',
              desc: '변환이 완료되면 검색 가능한 PDF가 자동으로 다운로드됩니다. Adobe Reader나 브라우저에서 Ctrl+F를 눌러 원하는 키워드를 검색하세요. 파일 크기는 원본보다 커질 수 있습니다.',
            },
          ],
          faqs: [
            {
              q: '변환 후 파일 크기가 왜 크게 늘어나나요?',
              a: '원본 PDF가 벡터(선) 기반으로 가볍게 만들어진 경우에도, 변환 과정에서 모든 페이지가 JPEG 이미지로 변환되어 PDF에 삽입됩니다. 이 때문에 원본이 2MB였던 PDF가 변환 후 10~30MB로 커질 수 있습니다. 파일 크기를 줄이려면 렌더링 품질을 "표준(1.5×)"으로 낮춰보세요. 업로드 후 예상 변환 크기를 미리 확인할 수 있습니다.',
            },
            {
              q: '모바일에서는 왜 10페이지로 제한되나요?',
              a: '모바일 브라우저는 탭당 사용 가능한 메모리에 엄격한 한도가 있습니다. 특히 아이폰 사파리에서 고해상도로 많은 페이지를 처리하면 메모리 초과로 브라우저 탭이 강제 종료될 수 있어 10페이지로 제한합니다. 제한 없이 사용하려면 PC에서 접속해 주세요.',
            },
            {
              q: 'CAD 도면은 잘 변환되지 않나요?',
              a: '선과 글자가 겹치는 복잡한 CAD 도면은 Tesseract OCR 엔진이 선을 노이즈로 인식해 글자를 누락할 수 있습니다. 치수선이 밀집된 설계 도면보다는 텍스트와 선이 분리된 자재표, 부재 목록, 스캔된 계약서·공문서에서 높은 인식률을 보입니다.',
            },
            {
              q: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
              a: '이 툴의 OCR 변환 결과는 참고용으로만 제공됩니다. OCR 인식 과정에서 오탈자나 누락이 발생할 수 있으므로, 공식적인 용도로 사용 시에는 반드시 원본 문서와 대조하여 확인하시기 바랍니다.',
            },
          ],
        }}
        en={{
          title: 'What is PDF OCR Converter?',
          description:
            'PDF OCR Converter transforms image-only PDFs — scanned contracts, official documents, and faxed files — into fully searchable PDFs where you can use Ctrl+F to find any text instantly. It works by using pdf.js (Mozilla) to render each PDF page as a canvas image, Tesseract.js (Google OCR engine) to extract text and coordinates with confidence scoring, and jsPDF to overlay an invisible searchable text layer on top of the original image. The original image quality is completely preserved. Multi-language support includes Korean, English, Japanese, and Chinese. All processing happens entirely in your browser — files are never uploaded to any server, making it safe for confidential contracts and personal documents. OCR accuracy reaches 95–99% for clean printed text. Mobile devices are limited to 10 pages due to memory constraints; PC use is strongly recommended for large documents.',
          useCases: [
            {
              icon: '📄',
              title: 'Searchable contracts & official docs',
              desc: 'Convert faxed or scanned contracts and official documents into searchable PDFs. Find specific clauses, dates, or amounts instantly with Ctrl+F, dramatically improving document management efficiency.',
            },
            {
              icon: '🧾',
              title: 'Invoice & receipt digitization',
              desc: 'Turn scanned invoices and receipts into searchable PDFs. Quickly locate vendor names, amounts, and dates by keyword — speeding up accounting and tax document workflows.',
            },
            {
              icon: '📚',
              title: 'Document archive modernization',
              desc: 'Convert old scanned paper documents stored as image-only PDFs into searchable digital archives. The original image quality is fully preserved while adding full-text search capability.',
            },
            {
              icon: '📋',
              title: 'Parts lists & material tables',
              desc: 'Search parts lists, material schedules, and bill-of-materials PDFs where text and lines are cleanly separated. Find specific part names or specifications in seconds.',
            },
          ],
          steps: [
            {
              step: 'Upload PDF',
              desc: 'Upload the PDF you want to convert. Drag and drop it onto the upload area, or click to open the file picker. Maximum 100MB, PDF format only. Mobile browsers are limited to 10 pages.',
            },
            {
              step: 'Set options',
              desc: 'Choose your OCR language and rendering quality. For documents containing Korean, select "Korean + English." The recommended quality setting is "High Quality (2.0×)." The estimated output file size is shown after upload.',
            },
            {
              step: 'Start conversion',
              desc: 'Click the "Convert to Searchable PDF" button. Conversion may take several minutes depending on the page count. Do not close the browser tab during processing — real-time progress is displayed.',
            },
            {
              step: 'Download and verify',
              desc: 'The searchable PDF downloads automatically when done. Open it in Adobe Reader or any PDF viewer and press Ctrl+F to search. Note that the converted file will be larger than the original.',
            },
          ],
          faqs: [
            {
              q: 'Why is the converted file so much larger than the original?',
              a: 'Even if the original PDF used compact vector graphics, every page is converted to a JPEG image during processing and embedded in the output PDF. A 2MB original can become 10–30MB after conversion. To reduce the size, lower the quality setting to "Standard (1.5×)." The estimated output size is shown after you upload the file.',
            },
            {
              q: 'Why is mobile limited to 10 pages?',
              a: 'Mobile browsers enforce strict per-tab memory limits. On iPhone Safari in particular, processing high-resolution multi-page PDFs can cause the browser tab to crash due to memory overflow. The 10-page limit prevents this. For unlimited processing, please use a desktop PC.',
            },
            {
              q: 'Does it work well on CAD drawings?',
              a: 'Complex CAD drawings where lines overlap with text are challenging for the Tesseract OCR engine, which may misidentify lines as noise and miss characters. Best results come from text-heavy documents like contracts, invoices, and material tables where text and graphic lines are cleanly separated.',
            },
            {
              q: 'Can I use the results as official documents?',
              a: 'Results are for reference only. OCR recognition may introduce typos or omissions. For any official or legally binding use, always verify the converted content against the original source document.',
            },
          ],
        }}
      />
    </div>
  );
}
