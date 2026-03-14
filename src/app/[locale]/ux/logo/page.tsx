'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState, useCallback, useEffect } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';

// ── Types ──────────────────────────────────────────────────────────────────
type Shape = 'circle' | 'rounded' | 'square' | 'hexagon';
type FontWeight = 'normal' | 'bold' | '600';

interface LogoConfig {
  text: string;
  emoji: string;
  bgColor: string;
  textColor: string;
  shape: Shape;
  fontSize: number;
  fontWeight: FontWeight;
  useGradient: boolean;
  gradientColor: string;
  showEmoji: boolean;
}

const PRESET_PALETTES = [
  { bg: '#6d28d9', text: '#ffffff', grad: '#a855f7', label: 'Purple' },
  { bg: '#1e40af', text: '#ffffff', grad: '#3b82f6', label: 'Blue' },
  { bg: '#065f46', text: '#ffffff', grad: '#10b981', label: 'Green' },
  { bg: '#9f1239', text: '#ffffff', grad: '#f43f5e', label: 'Rose' },
  { bg: '#92400e', text: '#ffffff', grad: '#f59e0b', label: 'Amber' },
  { bg: '#0f172a', text: '#e2e8f0', grad: '#334155', label: 'Dark' },
  { bg: '#f8fafc', text: '#0f172a', grad: '#e2e8f0', label: 'Light' },
];

const EMOJI_PRESETS = ['🚀', '⚡', '🌟', '🎯', '💎', '🔥', '🌈', '🎨', '🦁', '🐉', '🌊', '🍀'];

const SHAPES: { value: Shape; label: string }[] = [
  { value: 'circle', label: '●' },
  { value: 'rounded', label: '▣' },
  { value: 'square', label: '■' },
  { value: 'hexagon', label: '⬡' },
];

// ── Canvas drawing ─────────────────────────────────────────────────────────
function drawLogo(canvas: HTMLCanvasElement, config: LogoConfig, size: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const pad = size * 0.06;
  const r = (size - pad * 2) / 2;

  // Draw background shape
  ctx.save();
  ctx.beginPath();
  if (config.shape === 'circle') {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  } else if (config.shape === 'square') {
    ctx.rect(pad, pad, size - pad * 2, size - pad * 2);
  } else if (config.shape === 'rounded') {
    const rr = r * 0.35;
    const x0 = pad, y0 = pad, w = size - pad * 2, h = size - pad * 2;
    ctx.moveTo(x0 + rr, y0);
    ctx.lineTo(x0 + w - rr, y0);
    ctx.arcTo(x0 + w, y0, x0 + w, y0 + rr, rr);
    ctx.lineTo(x0 + w, y0 + h - rr);
    ctx.arcTo(x0 + w, y0 + h, x0 + w - rr, y0 + h, rr);
    ctx.lineTo(x0 + rr, y0 + h);
    ctx.arcTo(x0, y0 + h, x0, y0 + h - rr, rr);
    ctx.lineTo(x0, y0 + rr);
    ctx.arcTo(x0, y0, x0 + rr, y0, rr);
    ctx.closePath();
  } else if (config.shape === 'hexagon') {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }
  ctx.clip();

  // Background fill
  if (config.useGradient) {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, config.gradientColor);
    grad.addColorStop(1, config.bgColor);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = config.bgColor;
  }
  ctx.fillRect(0, 0, size, size);
  ctx.restore();

  // Content: emoji or text
  if (config.showEmoji && config.emoji) {
    ctx.font = `${Math.round(size * 0.42)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.emoji, cx, cy + size * 0.02);
  } else if (config.text) {
    const letters = config.text.trim().slice(0, 2).toUpperCase();
    ctx.fillStyle = config.textColor;
    ctx.font = `${config.fontWeight} ${Math.round(size * (config.fontSize / 100))}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letters, cx, cy);
  }
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function LogoGeneratorPage() {
  const t = useTranslations('LogoGenerator');

  const [config, setConfig] = useState<LogoConfig>({
    text: 'AB',
    emoji: '🚀',
    bgColor: '#6d28d9',
    textColor: '#ffffff',
    shape: 'rounded',
    fontSize: 45,
    fontWeight: 'bold',
    useGradient: true,
    gradientColor: '#a855f7',
    showEmoji: false,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const previewRef = useRef<HTMLCanvasElement>(null);
  const thumb16Ref = useRef<HTMLCanvasElement>(null);
  const thumb32Ref = useRef<HTMLCanvasElement>(null);
  const thumb64Ref = useRef<HTMLCanvasElement>(null);
  const thumb128Ref = useRef<HTMLCanvasElement>(null);

  const updateConfig = useCallback((patch: Partial<LogoConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
    setGenerated(false);
  }, []);

  // Live preview re-draw
  useEffect(() => {
    if (previewRef.current) drawLogo(previewRef.current, config, 256);
    if (thumb16Ref.current) drawLogo(thumb16Ref.current, config, 16);
    if (thumb32Ref.current) drawLogo(thumb32Ref.current, config, 32);
    if (thumb64Ref.current) drawLogo(thumb64Ref.current, config, 64);
    if (thumb128Ref.current) drawLogo(thumb128Ref.current, config, 128);
  }, [config]);

  // Generate & download ZIP
  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      const sizes = [
        { name: 'favicon-16x16.png', size: 16 },
        { name: 'favicon-32x32.png', size: 32 },
        { name: 'favicon-48x48.png', size: 48 },
        { name: 'apple-touch-icon.png', size: 180 },
        { name: 'android-chrome-192x192.png', size: 192 },
        { name: 'android-chrome-512x512.png', size: 512 },
        { name: 'logo-1024x1024.png', size: 1024 },
      ];

      const toBlob = (size: number): Promise<Blob> => new Promise(resolve => {
        const c = document.createElement('canvas');
        drawLogo(c, config, size);
        c.toBlob(b => resolve(b!), 'image/png');
      });

      for (const { name, size } of sizes) {
        const blob = await toBlob(size);
        const buf = await blob.arrayBuffer();
        zip.file(name, buf);
      }

      // site.webmanifest
      const manifest = {
        name: config.text || 'My App',
        short_name: config.text?.slice(0, 12) || 'App',
        icons: [
          { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        theme_color: config.bgColor,
        background_color: config.bgColor,
        display: 'standalone',
      };
      zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));

      // favicon.ico (32×32 PNG wrapped)
      const icoBlob = await toBlob(32);
      zip.file('favicon.ico', await icoBlob.arrayBuffer());

      // README
      const readme = `# Favicon Package\n\nGenerated by Utility Hub Logo Generator.\n\n## Files\n${sizes.map(s => `- ${s.name} (${s.size}×${s.size})`).join('\n')}\n- favicon.ico\n- site.webmanifest\n\n## Usage (Next.js)\n\nPlace all files in /public and add to layout.tsx:\n\`\`\`tsx\nimport type { Metadata } from 'next';\nexport const metadata: Metadata = {\n  icons: {\n    icon: '/favicon.ico',\n    apple: '/apple-touch-icon.png',\n  },\n};\n\`\`\`\n`;
      zip.file('README.md', readme);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'favicon-package.zip';
      a.click();
      URL.revokeObjectURL(url);
      setGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  }, [config]);

  const inputStyle: React.CSSProperties = {
    padding: '0.6rem 0.75rem',
    fontSize: '0.95rem',
    borderRadius: 'var(--radius-sm)',
    outline: 'none',
    color: 'var(--text-primary)',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    marginBottom: '0.35rem',
    display: 'block',
  };

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  };

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('description')}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) minmax(260px, 2fr)', gap: '2rem', alignItems: 'start' }}>

        {/* ── Left: Preview ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>{t('preview')}</h2>

            {/* Main 256px preview */}
            <canvas
              ref={previewRef}
              style={{ borderRadius: '1rem', boxShadow: 'var(--shadow-lg)' }}
            />

            {/* Small size previews */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {([{ ref: thumb16Ref, sz: 16 }, { ref: thumb32Ref, sz: 32 }, { ref: thumb64Ref, sz: 64 }, { ref: thumb128Ref, sz: 128 }] as const).map(({ ref, sz }) => (
                <div key={sz} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <canvas
                    ref={ref}
                    style={{ borderRadius: sz <= 32 ? '3px' : '8px', display: 'block' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{sz}px</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              style={{
                width: '100%', padding: '0.9rem',
                fontSize: '1rem', fontWeight: 600,
                backgroundColor: generated ? '#10b981' : 'var(--primary)',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                transition: 'background-color 0.2s, opacity 0.2s',
                opacity: isGenerating ? 0.7 : 1,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
              }}
              onMouseOver={e => { if (!isGenerating) e.currentTarget.style.backgroundColor = generated ? '#059669' : 'var(--primary-hover)'; }}
              onMouseOut={e => { e.currentTarget.style.backgroundColor = generated ? '#10b981' : 'var(--primary)'; }}
            >
              {isGenerating ? t('generating') : generated ? t('downloaded') : t('download')}
            </button>

            {generated && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
                {t('download_hint')}
              </p>
            )}
          </div>

          {/* File list */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{t('includes')}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                'favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png',
                'favicon-48x48.png', 'apple-touch-icon.png (180×180)',
                'android-chrome-192x192.png', 'android-chrome-512x512.png',
                'logo-1024x1024.png', 'site.webmanifest', 'README.md',
              ].map(f => (
                <li key={f} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: '#10b981' }}>✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Right: Controls ── */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          {/* Mode toggle */}
          <div>
            <span style={labelStyle}>{t('content_type')}</span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[
                { value: false, label: t('use_text') },
                { value: true, label: t('use_emoji') },
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => updateConfig({ showEmoji: opt.value })}
                  style={{
                    flex: 1, padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 500, fontSize: '0.9rem',
                    backgroundColor: config.showEmoji === opt.value ? 'var(--primary)' : 'var(--surface)',
                    color: config.showEmoji === opt.value ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${config.showEmoji === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text input */}
          {!config.showEmoji && (
            <div style={sectionStyle}>
              <label style={labelStyle}>{t('text_label')}</label>
              <input
                type="text"
                value={config.text}
                maxLength={3}
                placeholder="AB"
                onChange={e => updateConfig({ text: e.target.value })}
                style={inputStyle}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('text_hint')}</span>
            </div>
          )}

          {/* Emoji picker */}
          {config.showEmoji && (
            <div style={sectionStyle}>
              <label style={labelStyle}>{t('emoji_label')}</label>
              <input
                type="text"
                value={config.emoji}
                placeholder="🚀"
                onChange={e => updateConfig({ emoji: e.target.value })}
                style={{ ...inputStyle, fontSize: '1.5rem', textAlign: 'center' }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                {EMOJI_PRESETS.map(em => (
                  <button
                    key={em}
                    onClick={() => updateConfig({ emoji: em })}
                    style={{
                      fontSize: '1.35rem', width: '2.5rem', height: '2.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${config.emoji === em ? 'var(--primary)' : 'var(--border)'}`,
                      background: config.emoji === em ? 'var(--primary-light, rgba(109,40,217,0.1))' : 'var(--surface)',
                      cursor: 'pointer',
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shape */}
          <div style={sectionStyle}>
            <label style={labelStyle}>{t('shape_label')}</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {SHAPES.map(s => (
                <button
                  key={s.value}
                  onClick={() => updateConfig({ shape: s.value })}
                  style={{
                    flex: 1, padding: '0.6rem',
                    fontSize: '1.3rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${config.shape === s.value ? 'var(--primary)' : 'var(--border)'}`,
                    background: config.shape === s.value ? 'var(--primary-light, rgba(109,40,217,0.1))' : 'var(--surface)',
                    cursor: 'pointer', transition: 'all 0.2s',
                    color: 'var(--text-primary)',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color presets */}
          <div style={sectionStyle}>
            <label style={labelStyle}>{t('palette_label')}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {PRESET_PALETTES.map(p => (
                <button
                  key={p.label}
                  onClick={() => updateConfig({ bgColor: p.bg, textColor: p.text, gradientColor: p.grad })}
                  title={p.label}
                  style={{
                    width: '2.25rem', height: '2.25rem',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${p.grad}, ${p.bg})`,
                    border: `2px solid ${config.bgColor === p.bg ? 'var(--primary)' : 'transparent'}`,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    outline: config.bgColor === p.bg ? '2px solid var(--primary)' : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Custom colors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={sectionStyle}>
              <label style={labelStyle}>{t('bg_color')}</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={config.bgColor}
                  onChange={e => updateConfig({ bgColor: e.target.value })}
                  style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', padding: '2px' }}
                />
                <input
                  type="text"
                  value={config.bgColor}
                  onChange={e => updateConfig({ bgColor: e.target.value })}
                  style={{ ...inputStyle, flex: 1, fontFamily: 'monospace' }}
                />
              </div>
            </div>
            <div style={sectionStyle}>
              <label style={labelStyle}>{t('text_color')}</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={config.textColor}
                  onChange={e => updateConfig({ textColor: e.target.value })}
                  style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', padding: '2px' }}
                />
                <input
                  type="text"
                  value={config.textColor}
                  onChange={e => updateConfig({ textColor: e.target.value })}
                  style={{ ...inputStyle, flex: 1, fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>

          {/* Gradient toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>{t('gradient_label')}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {config.useGradient && (
                <input
                  type="color"
                  value={config.gradientColor}
                  onChange={e => updateConfig({ gradientColor: e.target.value })}
                  style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: '2px' }}
                />
              )}
              <button
                onClick={() => updateConfig({ useGradient: !config.useGradient })}
                style={{
                  width: '3rem', height: '1.6rem',
                  borderRadius: '999px',
                  background: config.useGradient ? 'var(--primary)' : 'var(--border)',
                  position: 'relative', cursor: 'pointer', border: 'none',
                  transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: '3px',
                  left: config.useGradient ? 'calc(100% - 1.3rem)' : '3px',
                  width: '1rem', height: '1rem',
                  borderRadius: '50%', background: 'white',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>
          </div>

          {/* Font size (text mode only) */}
          {!config.showEmoji && (
            <div style={sectionStyle}>
              <label style={labelStyle}>{t('font_size')}: {config.fontSize}%</label>
              <input
                type="range"
                min={25}
                max={70}
                value={config.fontSize}
                onChange={e => updateConfig({ fontSize: Number(e.target.value) })}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          )}

          {/* Font weight (text mode only) */}
          {!config.showEmoji && (
            <div style={sectionStyle}>
              <label style={labelStyle}>{t('font_weight')}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['normal', '600', 'bold'] as FontWeight[]).map(w => (
                  <button
                    key={w}
                    onClick={() => updateConfig({ fontWeight: w })}
                    style={{
                      flex: 1, padding: '0.5rem',
                      fontWeight: w, fontSize: '0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${config.fontWeight === w ? 'var(--primary)' : 'var(--border)'}`,
                      background: config.fontWeight === w ? 'var(--primary-light, rgba(109,40,217,0.1))' : 'var(--surface)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    {w === 'normal' ? t('weight_normal') : w === '600' ? t('weight_medium') : t('weight_bold')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <SeoSection
        title="AI 로고 & 파비콘 패키지 생성기란 무엇인가요?"
        description="파비콘 생성기(Favicon Generator)는 텍스트 또는 이모지를 입력하고 색상과 모양을 선택하면 favicon.ico, 16×16, 32×32, 48×48, 192×192, 512×512 PNG, Apple Touch Icon, site.webmanifest까지 포함한 완전한 파비콘 패키지를 ZIP으로 다운로드할 수 있는 도구입니다. 로고 디자이너 없이도 5분 안에 프로페셔널한 브랜드 아이덴티티를 구축할 수 있습니다. 브라우저 탭 아이콘, PWA 앱 아이콘, 홈 화면 바로가기까지 한 번에 모두 커버됩니다."
        useCases={[
          { icon: '🚀', title: '스타트업 & 사이드 프로젝트', desc: '빠르게 MVP를 론칭할 때 로고 디자인에 시간을 쓰지 않고도 즉시 사용 가능한 파비콘과 로고를 생성합니다.' },
          { icon: '💼', title: '개인 포트폴리오 & 블로그', desc: '개인 사이트의 브랜드를 간단한 이니셜이나 이모지로 표현하고, 모든 디바이스에서 일관된 아이콘을 제공합니다.' },
          { icon: '🛒', title: '쇼핑몰 & 서비스 사이트', desc: 'Shopify, Vercel, Netlify 등으로 배포한 사이트에 즉시 적용할 수 있는 완전한 파비콘 세트를 한 번에 생성합니다.' },
          { icon: '🎨', title: '프로토타입 & 디자인 시안', desc: '클라이언트에게 디자인 시안을 제시할 때 임시 파비콘으로 실제감을 높이거나, 컨셉 아이디어를 빠르게 시각화합니다.' },
        ]}
        steps={[
          { step: '콘텐츠 유형 선택 (텍스트 / 이모지)', desc: "브랜드 이니셜 1~2자(예: 'UH') 또는 이모지(예: 🚀)를 선택해 로고 내용을 입력합니다." },
          { step: '모양 & 색상 커스터마이징', desc: '원형/라운드/정사각형/육각형 중 배경 모양을 선택하고, 프리셋 팔레트 또는 커스텀 색상 피커로 브랜드 컬러를 적용합니다.' },
          { step: 'ZIP 다운로드 & 프로젝트 적용', desc: "'다운로드' 버튼을 클릭하면 모든 크기의 파비콘과 site.webmanifest가 포함된 ZIP 파일이 생성됩니다. 압축 해제 후 프로젝트의 /public 폴더에 넣으면 완성입니다." },
        ]}
        faqs={[
          { q: 'ZIP 파일에 포함된 파일들을 어디에 놓아야 하나요?', a: 'Next.js, React, Vue.js 프로젝트는 /public 폴더, 정적 HTML은 루트 디렉토리에 넣으세요. HTML의 <head>에 site.webmanifest 링크와 apple-touch-icon 링크를 추가하면 모든 디바이스에서 올바르게 표시됩니다. 다운로드된 ZIP에 README가 포함되어 있습니다.' },
          { q: '이 도구로 만든 로고를 상업적으로 사용해도 되나요?', a: '텍스트와 색상을 직접 조합해 Canvas API로 생성한 이미지이므로 저작권 문제 없이 자유롭게 상업적으로 활용하실 수 있습니다. 단, 입력한 이모지의 경우 플랫폼별 이모지 디자인의 저작권에 주의하세요.' },
          { q: '고해상도 로고(SVG 또는 1024px 이상 PNG)도 가능한가요?', a: '현재 최대 512×512 PNG를 제공합니다. SVG 포맷은 추후 업데이트 예정입니다. 대형 인쇄용 로고가 필요하다면 생성된 PNG를 벡터 변환 도구(예: Vectorizer.ai)를 통해 SVG로 변환하는 것을 권장합니다.' },
        ]}
      />
    </div>
  );
}
