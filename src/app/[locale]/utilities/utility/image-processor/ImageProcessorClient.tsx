'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Image } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';

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

export default function ImageProcessorClient() {
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

  const savingColor = savingPct >= 30 ? '#10b981' : savingPct >= 10 ? '#f59e0b' : 'var(--text-secondary)';

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
          <Image size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{T.title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{T.subtitle}</p>
      </header>

      {/* ── Security badge ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: '2rem',
        padding: '0.6rem 1.25rem',
        maxWidth: '640px',
        margin: '0 auto 2rem',
        fontSize: '0.82rem',
        color: '#059669',
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
            maxWidth: '640px',
            margin: '0 auto',
            border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            background: dragging
              ? 'rgba(249,115,22,0.06)'
              : 'var(--surface)',
            padding: '4rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🖼️</div>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{T.dropTitle}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{T.dropSub}</p>
          {error && <p style={{ marginTop: '1rem', color: '#ef4444', fontSize: '0.875rem', fontWeight: 600 }}>{error}</p>}
          <input ref={inputRef} type="file" accept="image/*" onChange={onInputChange} style={{ display: 'none' }} />
        </div>
      ) : (
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* ── Controls ── */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

              {/* Quality slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={labelStyle}>{T.quality}</label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1" max="1.0" step="0.05"
                  value={quality}
                  onChange={e => setQuality(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  <span>{isKo ? '최소' : 'Min'}</span>
                  <span>{isKo ? '최대 (원본)' : 'Max (Original)'}</span>
                </div>
              </div>

              {/* Max width */}
              <div>
                <label style={{ ...labelStyle, marginBottom: '0.5rem', display: 'block' }}>{T.maxWidth}</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[800, 1280, 1920, 2560].map(w => (
                    <button
                      key={w}
                      onClick={() => setMaxWidthPx(w)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid',
                        borderColor: maxWidthPx === w ? 'var(--primary)' : 'var(--border)',
                        background: maxWidthPx === w ? 'rgba(249,115,22,0.1)' : 'var(--surface-hover)',
                        color: maxWidthPx === w ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {w}px
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats dashboard ── */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>

              {/* Original */}
              <div style={{ textAlign: 'center', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-hover)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{T.original}</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatSize(original.size)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{original.width} × {original.height}</div>
              </div>

              {/* Saving */}
              <div style={{ textAlign: 'center', padding: '1rem', borderRadius: 'var(--radius-md)', background: loading ? 'var(--surface-hover)' : 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))', border: loading ? 'none' : '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{T.saving}</div>
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
              <div style={{ textAlign: 'center', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-hover)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{T.compressed}</div>
                {loading ? (
                  <div style={{ fontSize: '1.35rem', color: 'var(--primary)' }}>⏳</div>
                ) : (
                  <>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>{compressed ? formatSize(compressed.size) : '—'}</div>
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
                    background: 'linear-gradient(90deg, var(--primary), #f59e0b)',
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
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{T.preview}</span>
              <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '3px', gap: '2px' }}>
                {(['original', 'compressed'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setPreview(tab)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'calc(var(--radius-md) - 1px)',
                      border: 'none',
                      background: preview === tab ? 'var(--primary)' : 'transparent',
                      color: preview === tab ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {tab === 'original' ? T.original : T.compressed}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 20px 20px', position: 'relative', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading && preview === 'compressed' ? (
                <div style={{ padding: '3rem', color: 'var(--text-muted)', fontWeight: 600 }}>{T.processing}</div>
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
              style={{
                flex: '1 1 200px',
                padding: '0.9rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: (!compressed || loading) ? 'var(--border)' : 'linear-gradient(135deg, #f97316, #ea580c)',
                color: (!compressed || loading) ? 'var(--text-muted)' : '#fff',
                cursor: (!compressed || loading) ? 'not-allowed' : 'pointer',
                boxShadow: (!compressed || loading) ? 'none' : '0 4px 14px rgba(249,115,22,0.4)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>⬇️</span> {T.download}
            </button>
            <button
              onClick={reset}
              style={{
                padding: '0.9rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              🔄 {T.reset}
            </button>
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>{error}</p>}
        </div>
      )}

      {/* ── SEO Section ── */}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};
