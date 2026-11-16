'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';
import { Crop } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';

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

export default function ImageResizerClient() {
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

  const presetBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.4rem 0.7rem',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid',
    borderColor: active ? 'var(--primary)' : 'var(--border)',
    background: active ? 'rgba(249,115,22,0.12)' : 'var(--surface)',
    color: active ? 'var(--primary)' : 'var(--text-secondary)',
    fontWeight: active ? 700 : 500,
    fontSize: '0.78rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.15rem',
    lineHeight: 1.2,
  });

  return (
    <div>
      <NavigationActions />

      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Crop size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{T.title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{T.subtitle}</p>
      </header>

      {!src ? (
        /* ── Drop zone ── */
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            background: dragging ? 'rgba(249,115,22,0.06)' : 'var(--surface)',
            padding: '4.5rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✂️</div>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{T.drop}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{T.dropSub}</p>
          <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
        </div>
      ) : (
        /* ── Editor ── */
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── Left: Controls ── */}
          <div style={{ flex: '0 0 290px', minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* SNS Presets */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <p style={sectionLabel}>{T.presets}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p)}
                    style={presetBtnStyle(activePreset === p.id)}
                    title={p.badge}
                  >
                    <span>{isKo ? p.labelKo : p.label}</span>
                    {p.badge && (
                      <span style={{ fontSize: '0.62rem', color: activePreset === p.id ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 400 }}>
                        {p.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom size */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <p style={sectionLabel}>{T.custom}</p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={microLabel}>W (px)</label>
                  <input
                    type="number"
                    placeholder="1080"
                    value={customW}
                    onChange={e => setCustomW(e.target.value)}
                    style={numInput}
                  />
                </div>
                <span style={{ color: 'var(--text-muted)', marginTop: '1.2rem', fontWeight: 700 }}>×</span>
                <div style={{ flex: 1 }}>
                  <label style={microLabel}>H (px)</label>
                  <input
                    type="number"
                    placeholder="1080"
                    value={customH}
                    onChange={e => setCustomH(e.target.value)}
                    style={numInput}
                  />
                </div>
                <button
                  onClick={applyCustom}
                  style={{
                    marginTop: '1.2rem',
                    padding: '0.55rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--primary)',
                    background: 'rgba(249,115,22,0.1)',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {T.apply}
                </button>
              </div>
              {outputW > 0 && outputH > 0 && (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  📐 {isKo ? '출력 크기' : 'Output'}: {outputW} × {outputH}px
                </p>
              )}
            </div>

            {/* Transform */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <p style={sectionLabel}>{T.transform}</p>
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
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface-hover)',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Output format */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <p style={sectionLabel}>{T.format}</p>
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                {(['jpeg', 'png', 'webp'] as OutputFormat[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setOutputFormat(f)}
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid',
                      borderColor: outputFormat === f ? 'var(--primary)' : 'var(--border)',
                      background: outputFormat === f ? 'rgba(249,115,22,0.1)' : 'var(--surface)',
                      color: outputFormat === f ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      transition: 'all 0.15s',
                    }}
                  >
                    {f === 'jpeg' ? 'JPG' : f.toUpperCase()}
                  </button>
                ))}
              </div>

              {outputFormat !== 'png' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={microLabel}>{T.quality}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range" min="0.1" max="1" step="0.05"
                    value={quality}
                    onChange={e => setQuality(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                </>
              )}
            </div>

            {/* Action buttons */}
            <button
              onClick={download}
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(249,115,22,0.4)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(249,115,22,0.5)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(249,115,22,0.4)'; }}
            >
              ✂️ {T.download}
            </button>

            <button
              onClick={reset}
              style={{
                width: '100%',
                padding: '0.65rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              🔄 {T.newImg}
            </button>
          </div>

          {/* ── Right: Cropper ── */}
          <div style={{ flex: '1 1 400px', minWidth: '300px' }}>
            <div className="glass-panel" style={{ padding: '1rem', overflow: 'hidden' }}>
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
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
              {isKo ? '드래그로 크롭 영역을 조절하세요' : 'Drag to adjust the crop area'}
            </p>
          </div>
        </div>
      )}

      {/* ── SEO ── */}
    </div>
  );
}

// ─── Shared micro styles ──────────────────────────────────────────────────────

const sectionLabel: React.CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '0.6rem',
};

const microLabel: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: '0.25rem',
};

const numInput: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.6rem',
  fontSize: '0.9rem',
  fontWeight: 600,
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
};
