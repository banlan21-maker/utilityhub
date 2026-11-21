'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';
import { Crop } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { ui } from '@/app/components/ui';

// cropperjs CSS (bundled inside react-cropper's node_modules)
import 'react-cropper/node_modules/cropperjs/dist/cropper.css';

// SSR-safe dynamic import
const Cropper = dynamic(() => import('react-cropper').then(m => m.default ?? m), {
  ssr: false,
  loading: () => (
    <div style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
      Loading editor…
    </div>
  ),
});

// ─── Presets ──────────────────────────────────────────────────────────────────

interface Preset {
  id: string;
  ratio: number;      // NaN = free
  w: number;
  h: number;
  label: string;
  labelKo: string;
  badge: string;
  icon: string;
}

const PRESETS: Preset[] = [
  { id: 'free',     ratio: NaN,      w: 0,    h: 0,    label: 'Free',        labelKo: '자유',      badge: '',             icon: '✏️' },
  { id: '1:1',      ratio: 1,        w: 1080, h: 1080, label: '1:1',         labelKo: '1:1',       badge: 'Instagram',    icon: '📷' },
  { id: '4:5',      ratio: 4/5,      w: 1080, h: 1350, label: '4:5',         labelKo: '4:5',       badge: 'IG Portrait',  icon: '📸' },
  { id: '9:16',     ratio: 9/16,     w: 1080, h: 1920, label: '9:16',        labelKo: '스토리',     badge: 'Reels/Story',  icon: '📱' },
  { id: '16:9',     ratio: 16/9,     w: 1280, h: 720,  label: '16:9',        labelKo: '가로',      badge: 'YouTube',      icon: '▶️' },
  { id: '4:3',      ratio: 4/3,      w: 1200, h: 900,  label: '4:3',         labelKo: '4:3',       badge: '',             icon: '🖼️' },
  { id: 'og',       ratio: 1200/630, w: 1200, h: 630,  label: 'OG Image',    labelKo: 'OG 이미지', badge: 'Web SEO',      icon: '🌐' },
  { id: 'twitter',  ratio: 1200/628, w: 1200, h: 628,  label: 'X / Twitter', labelKo: 'X포스트',   badge: 'Twitter/X',    icon: '𝕏' },
  { id: 'fb',       ratio: 1200/628, w: 1200, h: 628,  label: 'FB Post',     labelKo: 'FB 포스트', badge: 'Facebook',     icon: '👍' },
  { id: 'yt-banner',ratio: 2560/423, w: 2560, h: 423,  label: 'YT Banner',   labelKo: 'YT 배너',  badge: 'YouTube',      icon: '🎬' },
];

type OutputFormat = 'jpeg' | 'png' | 'webp';

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageResizerClient({ seo }: { seo?: React.ReactNode }) {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const inputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<any>(null);

  const [src, setSrc] = useState('');
  const [dragging, setDragging] = useState(false);
  const [activePreset, setActivePreset] = useState('free');
  const [customW, setCustomW] = useState('');
  const [customH, setCustomH] = useState('');
  const [outputW, setOutputW] = useState(0);
  const [outputH, setOutputH] = useState(0);
  const [flipXState, setFlipXState] = useState(1);
  const [flipYState, setFlipYState] = useState(1);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [quality, setQuality] = useState(0.9);

  const getCropper = () => cropperRef.current?.cropper as any;

  // ── File handling ─────────────────────────────────────────────────────────

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      setSrc(e.target?.result as string);
      setActivePreset('free');
      setCustomW('');
      setCustomH('');
      setOutputW(0);
      setOutputH(0);
      setFlipXState(1);
      setFlipYState(1);
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // ── Preset & ratio ────────────────────────────────────────────────────────

  const applyPreset = (p: Preset) => {
    setActivePreset(p.id);
    setOutputW(p.w);
    setOutputH(p.h);
    setCustomW(p.w ? String(p.w) : '');
    setCustomH(p.h ? String(p.h) : '');
    getCropper()?.setAspectRatio(isNaN(p.ratio) ? NaN : p.ratio);
  };

  const applyCustom = () => {
    const w = parseInt(customW) || 0;
    const h = parseInt(customH) || 0;
    setOutputW(w);
    setOutputH(h);
    setActivePreset('free');
    if (w && h) getCropper()?.setAspectRatio(w / h);
  };

  // ── Transform ─────────────────────────────────────────────────────────────

  const rotate = (deg: number) => getCropper()?.rotate(deg);

  const flipH = () => {
    const next = flipXState * -1;
    setFlipXState(next);
    getCropper()?.scaleX(next);
  };

  const flipV = () => {
    const next = flipYState * -1;
    setFlipYState(next);
    getCropper()?.scaleY(next);
  };

  // ── Download ──────────────────────────────────────────────────────────────

  const download = () => {
    const cropper = getCropper();
    if (!cropper) return;
    const opts = outputW && outputH ? { width: outputW, height: outputH } : {};
    const canvas: HTMLCanvasElement = cropper.getCroppedCanvas(opts);
    const mime = outputFormat === 'png' ? 'image/png' : outputFormat === 'webp' ? 'image/webp' : 'image/jpeg';
    const q = outputFormat === 'png' ? undefined : quality;
    const dataUrl = canvas.toDataURL(mime, q);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `cropped.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`;
    a.click();
  };

  const reset = () => {
    setSrc('');
    if (inputRef.current) inputRef.current.value = '';
  };

  // ─────────────────────────────────────────────────────────────────────────

  const T = {
    title:    isKo ? '이미지 리사이저 & 크롭' : 'Image Resizer & Cropper',
    subtitle: isKo ? 'SNS 규격 프리셋으로 빠르게, 자유 편집도 지원' : 'Quick SNS presets or custom crop — rotate, flip, resize',
    drop:     isKo ? '이미지를 드래그하거나 클릭하여 선택' : 'Drag & drop or click to select',
    dropSub:  isKo ? 'JPG, PNG, WebP, GIF 지원' : 'JPG, PNG, WebP, GIF supported',
    presets:  isKo ? 'SNS / 비율 프리셋' : 'SNS / Ratio Presets',
    custom:   isKo ? '직접 크기 입력' : 'Custom Size',
    apply:    isKo ? '적용' : 'Apply',
    transform:isKo ? '변형' : 'Transform',
    format:   isKo ? '저장 형식' : 'Output Format',
    quality:  isKo ? '품질' : 'Quality',
    download: isKo ? '크롭 & 다운로드' : 'Crop & Download',
    newImg:   isKo ? '새 이미지' : 'New Image',
  };

  return (
    <div>
      <NavigationActions />

      <ToolHeader icon={<Crop />} title={T.title} subtitle={T.subtitle} />

      {!src ? (
        /* ── Drop zone ── */
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          style={{
            maxWidth: 'var(--tool-width-narrow)',
            margin: '0 auto',
            border: `2px dashed ${dragging ? 'var(--color-primary)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-card)',
            background: dragging ? 'var(--color-primary-light)' : 'var(--surface)',
            padding: '4.5rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✂️</div>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{T.drop}</p>
          <p className={ui.hint}>{T.dropSub}</p>
          <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
        </div>
      ) : (
        /* ── Editor ── */
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── Left: Controls ── */}
          <div style={{ flex: '0 0 290px', minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* SNS Presets */}
            <div className={ui.card}>
              <p className={ui.cardTitle}>{T.presets}</p>
              <div className={ui.chips} style={{ gap: '0.4rem' }}>
                {PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p)}
                    className={`${ui.chip} ${ui.pill} ${activePreset === p.id ? ui.chipActive : ''}`}
                    style={{ flexDirection: 'column', gap: '0.15rem', lineHeight: 1.2 }}
                    title={p.badge}
                  >
                    <span>{isKo ? p.labelKo : p.label}</span>
                    {p.badge && (
                      <span style={{ fontSize: '0.62rem', color: activePreset === p.id ? 'var(--color-primary)' : 'var(--text-muted)', fontWeight: 400 }}>
                        {p.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom size */}
            <div className={ui.card}>
              <p className={ui.cardTitle}>{T.custom}</p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label className={ui.label} style={{ display: 'block', marginBottom: '0.25rem' }}>W (px)</label>
                  <input
                    type="number"
                    placeholder="1080"
                    value={customW}
                    onChange={e => setCustomW(e.target.value)}
                    className={ui.input}
                  />
                </div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700, lineHeight: 'var(--control-h)' }}>×</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label className={ui.label} style={{ display: 'block', marginBottom: '0.25rem' }}>H (px)</label>
                  <input
                    type="number"
                    placeholder="1080"
                    value={customH}
                    onChange={e => setCustomH(e.target.value)}
                    className={ui.input}
                  />
                </div>
                <button
                  onClick={applyCustom}
                  className={`${ui.button} ${ui.secondary}`}
                  style={{ padding: '0 0.8rem' }}
                >
                  {T.apply}
                </button>
              </div>
              {outputW > 0 && outputH > 0 && (
                <p className={ui.hint} style={{ marginTop: '0.5rem' }}>
                  📐 {isKo ? '출력 크기' : 'Output'}: {outputW} × {outputH}px
                </p>
              )}
            </div>

            {/* Transform */}
            <div className={ui.card}>
              <p className={ui.cardTitle}>{T.transform}</p>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[
                  { label: '↺ -90°', fn: () => rotate(-90) },
                  { label: '↻ +90°', fn: () => rotate(90) },
                  { label: '↔ Flip H', fn: flipH },
                  { label: '↕ Flip V', fn: flipV },
                ].map(btn => (
                  <button
                    key={btn.label}
                    onClick={btn.fn}
                    className={`${ui.button} ${ui.secondary} ${ui.sm}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Output format */}
            <div className={ui.card}>
              <p className={ui.cardTitle}>{T.format}</p>
              <div className={ui.segmented} style={{ marginBottom: '1rem' }}>
                {(['jpeg', 'png', 'webp'] as OutputFormat[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setOutputFormat(f)}
                    className={`${ui.segment} ${outputFormat === f ? ui.segmentActive : ''}`}
                  >
                    {f === 'jpeg' ? 'JPG' : f.toUpperCase()}
                  </button>
                ))}
              </div>

              {outputFormat !== 'png' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span className={ui.label}>{T.quality}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range" min="0.1" max="1" step="0.05"
                    value={quality}
                    onChange={e => setQuality(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                  />
                </>
              )}
            </div>

            {/* Action buttons */}
            <button
              onClick={download}
              className={`${ui.button} ${ui.primary} ${ui.lg} ${ui.block}`}
            >
              ✂️ {T.download}
            </button>

            <button
              onClick={reset}
              className={`${ui.button} ${ui.secondary} ${ui.block}`}
            >
              🔄 {T.newImg}
            </button>
          </div>

          {/* ── Right: Cropper ── */}
          <div style={{ flex: '1 1 400px', minWidth: '300px' }}>
            <div className={ui.card} style={{ padding: '1rem', overflow: 'hidden' }}>
              <Cropper
                ref={cropperRef}
                src={src}
                style={{ height: 460, width: '100%' }}
                aspectRatio={NaN}
                guides
                viewMode={1}
                dragMode="move"
                background
                responsive
                autoCropArea={0.85}
                checkOrientation={false}
              />
            </div>
            <p className={ui.hint} style={{ marginTop: '0.5rem', textAlign: 'center' }}>
              {isKo ? '드래그로 크롭 영역을 조절하세요' : 'Drag to adjust the crop area'}
            </p>
          </div>
        </div>
      )}

      {/* ── SEO ── */}
      <div style={{ maxWidth: 'var(--tool-width)', margin: '0 auto' }}>
        {/* 공유하기 */}
        <ShareBar title={T.title} description={T.subtitle} />

        {/* 추천 도구 */}
        <RelatedTools toolId="utilities/utility/image-resizer" />


        {seo}
      </div>
    </div>
  );
}
