'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Image as ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import { ui } from '@/app/components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageInfo {
  file: File;
  url: string;
  size: number;
  width: number;
  height: number;
  name: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getSaving(original: number, compressed: number): string {
  if (original === 0) return '0%';
  const pct = ((original - compressed) / original) * 100;
  return `${pct.toFixed(1)}%`;
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise(resolve => {
    const img = document.createElement('img') as HTMLImageElement;
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = URL.createObjectURL(file);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageProcessorClient({ seo }: { seo?: React.ReactNode }) {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const dropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [original, setOriginal] = useState<ImageInfo | null>(null);
  const [compressed, setCompressed] = useState<ImageInfo | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [maxWidthPx, setMaxWidthPx] = useState(1920);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<'original' | 'compressed'>('compressed');
  const [error, setError] = useState('');

  // Auto-compress when settings change
  useEffect(() => {
    if (original) compress(original.file, quality, maxWidthPx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, maxWidthPx]);

  const compress = useCallback(async (file: File, q: number, maxW: number) => {
    setLoading(true);
    setError('');
    try {
      const result = await imageCompression(file, {
        maxSizeMB: 50,
        maxWidthOrHeight: maxW,
        useWebWorker: true,
        initialQuality: q,
        fileType: file.type as any,
      });
      const url = URL.createObjectURL(result);
      const dims = await getImageDimensions(result);
      setCompressed({
        file: result,
        url,
        size: result.size,
        width: dims.width,
        height: dims.height,
        name: file.name,
      });
    } catch {
      setError(isKo ? '압축 중 오류가 발생했습니다.' : 'An error occurred during compression.');
    } finally {
      setLoading(false);
    }
  }, [isKo]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(isKo ? '이미지 파일만 지원합니다.' : 'Only image files are supported.');
      return;
    }
    setError('');
    setCompressed(null);

    const url = URL.createObjectURL(file);
    const dims = await getImageDimensions(file);
    const info: ImageInfo = { file, url, size: file.size, width: dims.width, height: dims.height, name: file.name };
    setOriginal(info);
    compress(file, quality, maxWidthPx);
  }, [quality, maxWidthPx, compress, isKo]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const download = () => {
    if (!compressed) return;
    const a = document.createElement('a');
    a.href = compressed.url;
    const ext = compressed.name.split('.').pop();
    a.download = `compressed_${compressed.name.replace(`.${ext}`, '')}.${ext}`;
    a.click();
  };

  const reset = () => {
    setOriginal(null);
    setCompressed(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const T = {
    title:     isKo ? '이미지 압축기' : 'Image Compressor',
    subtitle:  isKo ? '브라우저에서 직접 이미지를 압축합니다. 서버 업로드 없음.' : 'Compress images directly in your browser. No server upload.',
    badge:     isKo ? '귀하의 이미지는 서버에 업로드되지 않고 브라우저에서 안전하게 처리됩니다' : 'Your images are processed locally in your browser and never uploaded to any server',
    dropTitle: isKo ? '이미지를 드래그하거나 클릭하여 선택' : 'Drag & drop an image or click to select',
    dropSub:   isKo ? 'JPG, PNG, WebP, GIF 지원 · 최대 50MB' : 'Supports JPG, PNG, WebP, GIF · Max 50MB',
    quality:   isKo ? '압축 품질' : 'Quality',
    maxWidth:  isKo ? '최대 너비 (px)' : 'Max Width (px)',
    original:  isKo ? '원본' : 'Original',
    compressed:isKo ? '압축 후' : 'Compressed',
    saving:    isKo ? '절감률' : 'Saved',
    size:      isKo ? '파일 크기' : 'File Size',
    resolution:isKo ? '해상도' : 'Resolution',
    download:  isKo ? '압축 이미지 다운로드' : 'Download Compressed Image',
    reset:     isKo ? '새 이미지 선택' : 'Choose New Image',
    processing:isKo ? '압축 중...' : 'Compressing...',
    preview:   isKo ? '미리보기' : 'Preview',
  };

  const savingPct = original && compressed
    ? parseFloat(getSaving(original.size, compressed.size))
    : 0;

  const savingColor = savingPct >= 30 ? 'var(--tint-green-fg)' : savingPct >= 10 ? 'var(--tint-amber-fg)' : 'var(--text-secondary)';

  return (
    <div>
      <NavigationActions />

      <ToolHeader icon={<ImageIcon />} title={T.title} subtitle={T.subtitle} />

      {/* ── Security badge ── */}
      <div className={`${ui.notice} ${ui.green}`} style={{
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: 'var(--tool-width-narrow)',
        margin: '0 auto 2rem',
        fontWeight: 600,
        textAlign: 'center',
      }}>
        <span>🔒</span>
        <span>{T.badge}</span>
      </div>

      {!original ? (
        /* ── Drop zone ── */
        <div
          ref={dropRef}
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
            padding: '4rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🖼️</div>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{T.dropTitle}</p>
          <p className={ui.hint}>{T.dropSub}</p>
          {error && <p className={ui.error} style={{ marginTop: '1rem' }}>{error}</p>}
          <input ref={inputRef} type="file" accept="image/*" onChange={onInputChange} style={{ display: 'none' }} />
        </div>
      ) : (
        <div style={{ maxWidth: 'var(--tool-width-narrow)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* ── Controls ── */}
          <div className={ui.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

              {/* Quality slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label className={ui.label}>{T.quality}</label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1" max="1.0" step="0.05"
                  value={quality}
                  onChange={e => setQuality(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
                <div className={ui.hint} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                  <span>{isKo ? '최소' : 'Min'}</span>
                  <span>{isKo ? '최대 (원본)' : 'Max (Original)'}</span>
                </div>
              </div>

              {/* Max width */}
              <div>
                <label className={ui.label} style={{ marginBottom: '0.5rem', display: 'block' }}>{T.maxWidth}</label>
                <div className={ui.chips} style={{ gap: '0.4rem' }}>
                  {[800, 1280, 1920, 2560].map(w => (
                    <button
                      key={w}
                      onClick={() => setMaxWidthPx(w)}
                      className={`${ui.chip} ${ui.pill} ${maxWidthPx === w ? ui.chipActive : ''}`}
                    >
                      {w}px
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats dashboard ── */}
          <div className={ui.card}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>

              {/* Original */}
              <div style={{ textAlign: 'center', padding: '1rem', borderRadius: 'var(--radius-control)', background: 'var(--surface-hover)' }}>
                <div style={statLabelStyle}>{T.original}</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatSize(original.size)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{original.width} × {original.height}</div>
              </div>

              {/* Saving */}
              <div style={{ textAlign: 'center', padding: '1rem', borderRadius: 'var(--radius-control)', background: loading ? 'var(--surface-hover)' : 'var(--tint-green-bg)', border: loading ? 'none' : '1px solid var(--tint-green-border)' }}>
                <div style={statLabelStyle}>{T.saving}</div>
                {loading ? (
                  <div style={{ fontSize: '1.35rem', color: 'var(--text-muted)' }}>⏳</div>
                ) : (
                  <>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: savingColor }}>
                      {compressed ? getSaving(original.size, compressed.size) : '—'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {compressed ? `↓ ${formatSize(original.size - compressed.size)}` : ''}
                    </div>
                  </>
                )}
              </div>

              {/* Compressed */}
              <div style={{ textAlign: 'center', padding: '1rem', borderRadius: 'var(--radius-control)', background: 'var(--surface-hover)' }}>
                <div style={statLabelStyle}>{T.compressed}</div>
                {loading ? (
                  <div style={{ fontSize: '1.35rem', color: 'var(--color-primary)' }}>⏳</div>
                ) : (
                  <>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)' }}>{compressed ? formatSize(compressed.size) : '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{compressed ? `${compressed.width} × ${compressed.height}` : ''}</div>
                  </>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {compressed && !loading && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${100 - Math.min(savingPct, 100)}%`,
                    background: 'var(--color-primary)',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  <span>{isKo ? `압축 후: ${Math.round(100 - Math.min(savingPct, 100))}%` : `After: ${Math.round(100 - Math.min(savingPct, 100))}%`}</span>
                  <span>{isKo ? `절감: ${Math.round(Math.min(savingPct, 100))}%` : `Saved: ${Math.round(Math.min(savingPct, 100))}%`}</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Preview ── */}
          <div className={ui.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span className={ui.label}>{T.preview}</span>
              <div className={ui.segmented}>
                {(['original', 'compressed'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setPreview(tab)}
                    className={`${ui.segment} ${preview === tab ? ui.segmentActive : ''}`}
                  >
                    {tab === 'original' ? T.original : T.compressed}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 20px 20px', position: 'relative', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading && preview === 'compressed' ? (
                <div style={{ padding: '3rem', color: '#64748b', fontWeight: 600 }}>{T.processing}</div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={(preview === 'original' ? original?.url : compressed?.url) ?? ''}
                  alt={preview}
                  style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }}
                />
              )}
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={download}
              disabled={!compressed || loading}
              className={`${ui.button} ${ui.primary} ${ui.lg}`}
              style={{ flex: '1 1 200px' }}
            >
              <span>⬇️</span> {T.download}
            </button>
            <button
              onClick={reset}
              className={`${ui.button} ${ui.secondary} ${ui.lg}`}
            >
              🔄 {T.reset}
            </button>
          </div>

          {error && <p className={ui.error} style={{ textAlign: 'center' }}>{error}</p>}
        </div>
      )}

      {/* ── SEO Section ── */}
      <div style={{ maxWidth: 'var(--tool-width-narrow)', margin: '0 auto' }}>
        {/* 공유하기 */}
        <ShareBar title={T.title} description={T.subtitle} />

        {/* 추천 도구 */}
        <RelatedTools toolId="utilities/utility/image-processor" />


        {seo}
      </div>
    </div>
  );
}

const statLabelStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.4rem',
};
