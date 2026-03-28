'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Image } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';

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
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = URL.createObjectURL(file);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageCompressorPage() {
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
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <SeoSection
          ko={{
            title: '이미지 압축이 웹 성능과 SEO에 중요한 이유',
            description: '이미지는 일반적으로 웹페이지 전체 용량의 50~70%를 차지합니다. 이미지를 최적화하면 페이지 로딩 속도가 빨라지고, Google의 Core Web Vitals 지표 중 LCP(Largest Contentful Paint) 점수가 향상됩니다. LCP는 검색 순위에 직접 영향을 주는 핵심 SEO 지표로, 구글은 2.5초 이내의 LCP를 "Good"으로 평가합니다. 이 압축기는 클라이언트 사이드에서만 동작해 이미지가 서버로 전송되지 않으므로 민감한 이미지도 안심하고 압축할 수 있습니다.',
            useCases: [
              { icon: '🚀', title: 'Core Web Vitals 개선', desc: '이미지 최적화로 LCP·CLS 점수를 향상시켜 Google 검색 순위를 개선합니다.' },
              { icon: '📱', title: '모바일 데이터 절약', desc: '압축된 이미지는 모바일 사용자의 데이터 사용량과 로딩 시간을 줄입니다.' },
              { icon: '🖼️', title: 'SNS 업로드 최적화', desc: '인스타그램, 카카오톡 등 SNS에 업로드할 이미지를 적정 용량으로 줄입니다.' },
              { icon: '💼', title: '이메일 첨부 파일 축소', desc: '용량 제한이 있는 이메일에 첨부하기 위해 이미지 크기를 줄입니다.' },
            ],
            steps: [
              { step: '이미지 업로드', desc: '드래그 앤 드롭 또는 클릭으로 JPG, PNG, WebP, GIF 이미지를 선택합니다.' },
              { step: '품질 및 해상도 설정', desc: '품질 슬라이더(10~100%)와 최대 너비를 조절하며 용량과 화질의 균형을 맞춥니다.' },
              { step: '결과 확인 및 다운로드', desc: '절감률과 미리보기를 확인한 후 다운로드 버튼으로 압축 이미지를 저장합니다.' },
            ],
            faqs: [
              { q: '이미지가 서버로 전송되나요?', a: '아니요. 이 도구는 완전히 브라우저에서 동작하며, 이미지 데이터는 인터넷을 통해 전송되지 않습니다. 개인 사진, 회사 자료 등 민감한 이미지도 안전하게 사용할 수 있습니다.' },
              { q: '품질 슬라이더를 어떻게 설정하면 좋나요?', a: '일반 웹사이트 이미지는 70~80%, 블로그 섬네일은 60~70%, 배경 이미지는 50~60%를 권장합니다. 미리보기로 화질을 확인하며 조절하세요.' },
              { q: 'PNG를 압축하면 투명도가 유지되나요?', a: '네. PNG 파일은 PNG 형식을 유지하므로 투명 배경(알파 채널)이 그대로 보존됩니다.' },
              { q: 'LCP란 무엇인가요?', a: 'LCP(Largest Contentful Paint)는 페이지에서 가장 큰 콘텐츠 요소가 렌더링되는 시간입니다. 구글 Core Web Vitals의 핵심 지표로, 2.5초 이내면 Good, 4.0초 초과면 Poor로 분류됩니다. 이미지 압축은 LCP 개선의 가장 효과적인 방법 중 하나입니다.' },
            ],
          }}
          en={{
            title: 'Why Image Compression Matters for SEO and Web Performance',
            description: 'Images typically account for 50–70% of total webpage size. Optimizing images speeds up page loading and improves your LCP (Largest Contentful Paint) score — a Core Web Vitals metric that directly affects Google search rankings. Google rates an LCP under 2.5 seconds as "Good." This compressor runs entirely in your browser, so images are never transmitted to a server, making it safe for sensitive photos and business assets.',
            useCases: [
              { icon: '🚀', title: 'Improve Core Web Vitals', desc: 'Optimizing images boosts LCP and CLS scores, improving Google search rankings.' },
              { icon: '📱', title: 'Save Mobile Data', desc: 'Compressed images reduce data usage and loading times for mobile visitors.' },
              { icon: '🖼️', title: 'Social Media Uploads', desc: 'Reduce image size for optimal uploads to Instagram, Twitter, and other platforms.' },
              { icon: '💼', title: 'Email Attachments', desc: 'Shrink images to fit email attachment size limits without sacrificing too much quality.' },
            ],
            steps: [
              { step: 'Upload an Image', desc: 'Drag & drop or click to select a JPG, PNG, WebP, or GIF file.' },
              { step: 'Adjust Quality & Resolution', desc: 'Use the quality slider (10–100%) and max-width presets to balance file size and quality.' },
              { step: 'Preview & Download', desc: 'Check the savings percentage and preview, then download your compressed image.' },
            ],
            faqs: [
              { q: 'Is my image uploaded to a server?', a: 'No. This tool runs entirely in your browser using JavaScript. Your image data never leaves your device, making it safe for sensitive photos and business documents.' },
              { q: 'What quality setting should I use?', a: 'For general web images, 70–80% is a good starting point. For blog thumbnails, try 60–70%. For background images, 50–60% often works well. Use the preview to find the right balance.' },
              { q: 'Will PNG transparency be preserved?', a: 'Yes. PNG files are kept as PNG, so transparency (alpha channel) is fully preserved after compression.' },
              { q: 'What is LCP and why does it matter?', a: 'LCP (Largest Contentful Paint) measures how long it takes for the largest content element to render. It is a core Google ranking signal — under 2.5s is "Good," over 4.0s is "Poor." Image compression is one of the most effective ways to improve LCP.' },
            ],
          }}
        />
      </div>
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
