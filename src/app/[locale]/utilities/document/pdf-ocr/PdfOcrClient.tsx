'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { FileSearch, AlertTriangle, X, AlertCircle, Download, RefreshCw } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './pdf-ocr.module.css';
import { ui } from '@/app/components/ui';

const LANGUAGE_OPTIONS = [
  { value: 'kor+eng', label: '한국어 + 영어 (기본값)' },
  { value: 'eng', label: '영어만' },
  { value: 'kor', label: '한국어만' },
  { value: 'jpn+eng', label: '일본어 + 영어' },
  { value: 'chi_sim+eng', label: '중국어(간체) + 영어' },
];

const LANGUAGE_OPTIONS_EN = [
  { value: 'kor+eng', label: 'Korean + English (default)' },
  { value: 'eng', label: 'English only' },
  { value: 'kor', label: 'Korean only' },
  { value: 'jpn+eng', label: 'Japanese + English' },
  { value: 'chi_sim+eng', label: 'Chinese (Simplified) + English' },
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

export default function PdfOcrClient({ seo }: { seo?: React.ReactNode }) {
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
      const { PDFDocument } = await import('pdf-lib');

      // STEP 1: Load PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = Math.min(pdfDoc.numPages, maxPages);
      setTotalPages(numPages);

      // STEP 2: Tesseract worker
      const worker = await createWorker(language);

      // Set DPI so Tesseract outputs correct page dimensions in the PDF.
      // When canvas is rendered at `scale` factor (e.g. 2.0×), pixels are 2× larger.
      // Telling Tesseract "this image is at 144 DPI" makes it output a page of
      // (pixels / 144dpi * 72pt) = original pt dimensions. Without this the output
      // PDF pages would be `scale` times larger than the original.
      try {
        await (worker as any).setParameters({ user_defined_dpi: Math.round(72 * scale) });
      } catch {
        // setParameters may not be available in all Tesseract.js versions; continue anyway
      }

      // STEP 3: Per-page processing — single canvas reused for memory
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const pagePdfs: Uint8Array[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setCurrentPage(pageNum);
        setProgress(Math.round(((pageNum - 1) / numPages) * 100));

        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // White background avoids transparent areas being black in the output PDF
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvas, viewport }).promise;

        // STEP 4: Tesseract generates a "sandwich PDF" — image + properly-encoded
        // invisible text layer. This correctly handles Korean/Japanese/Chinese
        // Unicode because Tesseract uses its own internal font mapping, unlike
        // jsPDF which only supports Latin-1 with default fonts.
        const { data } = await worker.recognize(canvas, {}, { pdf: true });
        const pagePdfBytes = (data as any).pdf as Uint8Array | undefined;
        if (pagePdfBytes && pagePdfBytes.length > 0) {
          pagePdfs.push(pagePdfBytes);
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // STEP 5: Terminate worker and release canvas
      await worker.terminate();
      canvas.width = 0;
      canvas.height = 0;

      if (pagePdfs.length === 0) {
        throw new Error('No pages were processed successfully');
      }

      setProgress(95);

      // STEP 6: Merge all per-page PDFs into one document using pdf-lib
      const mergedPdf = await PDFDocument.create();
      for (const pdfBytes of pagePdfs) {
        const pageDoc = await PDFDocument.load(pdfBytes);
        const copied = await mergedPdf.copyPages(pageDoc, pageDoc.getPageIndices());
        copied.forEach(p => mergedPdf.addPage(p));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const originalName = file.name.replace(/\.pdf$/i, '');
      const outputName = isKo ? `${originalName}_검색가능.pdf` : `${originalName}_searchable.pdf`;

      // STEP 7: Auto-download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Save reference for re-download; revoke object URL after 5 minutes
      setSavedPdfRef({
        save: () => {
          const a2 = document.createElement('a');
          a2.href = blobUrl;
          a2.download = outputName;
          document.body.appendChild(a2);
          a2.click();
          document.body.removeChild(a2);
        },
        name: outputName,
      });
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5 * 60 * 1000);

      setProgress(100);
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
  const languageOptions = isKo ? LANGUAGE_OPTIONS : LANGUAGE_OPTIONS_EN;

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<FileSearch />} title={t('title')} subtitle={t('description')} />

      {/* Mobile warning */}
      {showMobileWarning && (
        <div className={`${ui.notice} ${ui.amber} ${s.mobileWarning}`}>
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
        <div className={`${ui.card} ${s.panel}`}>
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
          <div className={ui.field}>
            <label className={ui.label}>
              {isKo ? 'OCR 언어' : 'OCR Language'}
            </label>
            <select
              className={ui.input}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label={isKo ? 'OCR 언어 선택' : 'Select OCR language'}
            >
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quality option */}
          <div className={ui.field}>
            <label className={ui.label}>
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
            <div className={`${ui.notice} ${ui.amber}`}>
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
            <div className={`${ui.notice} ${ui.red}`}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                {error}
                <br />
                <button className={`${ui.button} ${ui.danger} ${ui.sm} ${s.error_retry}`} onClick={() => setError('')} aria-label={isKo ? '다시 시도' : 'Retry'}>
                  {isKo ? '다시 시도' : 'Retry'}
                </button>
              </div>
            </div>
          )}

          {/* Convert button */}
          <button
            className={`${ui.button} ${ui.primary} ${ui.lg} ${ui.block}`}
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
        <div className={`${ui.card} ${s.progress_box}`}>
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
              className={`${ui.button} ${ui.primary}`}
              onClick={() => savedPdfRef?.save()}
              aria-label={isKo ? '다시 다운로드' : 'Download again'}
            >
              <Download size={16} />
              {isKo ? '다시 다운로드' : 'Download again'}
            </button>
            <button
              className={`${ui.button} ${ui.secondary}`}
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
      <div className={`${ui.card} ${s.info_box}`}>
        <p className={ui.cardTitle} style={{ margin: 0 }}>
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
      <div className={`${ui.notice} ${ui.amber} ${s.disclaimer}`}>
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
      <RelatedTools toolId="utilities/document/pdf-ocr" />
      {seo}
    </div>
  );
}
