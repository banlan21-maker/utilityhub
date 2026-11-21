'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Type } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './font-preview.module.css';
import { ui } from '@/app/components/ui';

// ── Font Data ──────────────────────────────────────────────────────────────
type FontCategory = 'sans-serif' | 'serif' | 'monospace' | 'display';
type FontLang = 'latin' | 'korean';

interface FontInfo {
  name: string;
  family: string;        // CSS font-family value
  googleId: string;      // Google Fonts URL param (e.g. "Noto+Sans+KR")
  weights: string;       // e.g. "400;600;700"
  lang: FontLang;
  category: FontCategory;
  tag: string;
  tagEn?: string; // 영문 페이지용 태그 (한국어 폰트)
}

const LATIN_FONTS: FontInfo[] = [
  { name: 'Inter',            family: "'Inter', sans-serif",            googleId: 'Inter',            weights: '400;600;700', lang: 'latin', category: 'sans-serif', tag: 'Modern' },
  { name: 'Roboto',           family: "'Roboto', sans-serif",           googleId: 'Roboto',           weights: '400;700',     lang: 'latin', category: 'sans-serif', tag: 'Classic' },
  { name: 'Open Sans',        family: "'Open Sans', sans-serif",        googleId: 'Open+Sans',        weights: '400;600;700', lang: 'latin', category: 'sans-serif', tag: 'Friendly' },
  { name: 'Poppins',          family: "'Poppins', sans-serif",          googleId: 'Poppins',          weights: '400;600;700', lang: 'latin', category: 'sans-serif', tag: 'Geometric' },
  { name: 'Montserrat',       family: "'Montserrat', sans-serif",       googleId: 'Montserrat',       weights: '400;600;700', lang: 'latin', category: 'sans-serif', tag: 'Bold' },
  { name: 'Raleway',          family: "'Raleway', sans-serif",          googleId: 'Raleway',          weights: '400;600;700', lang: 'latin', category: 'sans-serif', tag: 'Elegant' },
  { name: 'Lato',             family: "'Lato', sans-serif",             googleId: 'Lato',             weights: '400;700',     lang: 'latin', category: 'sans-serif', tag: 'Humanist' },
  { name: 'Playfair Display', family: "'Playfair Display', serif",      googleId: 'Playfair+Display', weights: '400;600;700', lang: 'latin', category: 'serif',      tag: 'Editorial' },
  { name: 'Merriweather',     family: "'Merriweather', serif",          googleId: 'Merriweather',     weights: '400;700',     lang: 'latin', category: 'serif',      tag: 'Reading' },
  { name: 'Source Code Pro',  family: "'Source Code Pro', monospace",   googleId: 'Source+Code+Pro',  weights: '400;600',     lang: 'latin', category: 'monospace',  tag: 'Code' },
];

const KOREAN_FONTS: FontInfo[] = [
  { name: 'Noto Sans KR',   family: "'Noto Sans KR', sans-serif",   googleId: 'Noto+Sans+KR',   weights: '400;600;700', lang: 'korean', category: 'sans-serif', tag: '표준체', tagEn: 'Standard' },
  { name: 'Nanum Gothic',   family: "'Nanum Gothic', sans-serif",   googleId: 'Nanum+Gothic',   weights: '400;700',     lang: 'korean', category: 'sans-serif', tag: '고딕체', tagEn: 'Gothic' },
  { name: 'Nanum Myeongjo', family: "'Nanum Myeongjo', serif",      googleId: 'Nanum+Myeongjo', weights: '400;700',     lang: 'korean', category: 'serif',      tag: '명조체', tagEn: 'Myeongjo (Serif)' },
  { name: 'Do Hyeon',       family: "'Do Hyeon', sans-serif",       googleId: 'Do+Hyeon',       weights: '400',         lang: 'korean', category: 'display',    tag: '둥근 고딕', tagEn: 'Rounded Gothic' },
  { name: 'Black Han Sans', family: "'Black Han Sans', sans-serif", googleId: 'Black+Han+Sans', weights: '400',         lang: 'korean', category: 'display',    tag: '임팩트', tagEn: 'Impact' },
  { name: 'Gamja Flower',   family: "'Gamja Flower', cursive",      googleId: 'Gamja+Flower',   weights: '400',         lang: 'korean', category: 'display',    tag: '손글씨', tagEn: 'Handwriting' },
  { name: 'Gowun Dodum',    family: "'Gowun Dodum', sans-serif",    googleId: 'Gowun+Dodum',    weights: '400',         lang: 'korean', category: 'sans-serif', tag: '도움체', tagEn: 'Dodum' },
  { name: 'Gowun Batang',   family: "'Gowun Batang', serif",        googleId: 'Gowun+Batang',   weights: '400',         lang: 'korean', category: 'serif',      tag: '바탕체', tagEn: 'Batang' },
  { name: 'Sunflower',      family: "'Sunflower', sans-serif",      googleId: 'Sunflower',      weights: '300;500;700', lang: 'korean', category: 'sans-serif', tag: '경쾌한', tagEn: 'Lively' },
  { name: 'Jua',            family: "'Jua', sans-serif",            googleId: 'Jua',            weights: '400',         lang: 'korean', category: 'display',    tag: '귀여운', tagEn: 'Cute' },
];

// Curated harmony pairs (latin + korean)
const HARMONY_PAIRS = [
  { latin: LATIN_FONTS[0],  korean: KOREAN_FONTS[0],  vibe: 'Modern & Clean' },
  { latin: LATIN_FONTS[3],  korean: KOREAN_FONTS[4],  vibe: 'Bold & Impactful' },
  { latin: LATIN_FONTS[7],  korean: KOREAN_FONTS[2],  vibe: 'Editorial & Classic' },
  { latin: LATIN_FONTS[5],  korean: KOREAN_FONTS[8],  vibe: 'Elegant & Refined' },
  { latin: LATIN_FONTS[9],  korean: KOREAN_FONTS[1],  vibe: 'Dev & Technical' },
];

// ── Font Loader ────────────────────────────────────────────────────────────
const loadedFonts = new Set<string>();

function loadGoogleFont(font: FontInfo) {
  if (loadedFonts.has(font.googleId)) return;
  loadedFonts.add(font.googleId);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${font.googleId}:wght@${font.weights}&display=swap`;
  document.head.appendChild(link);
}

// ── CSS snippet builder ────────────────────────────────────────────────────
function buildCssSnippet(font: FontInfo): string {
  const url = `https://fonts.googleapis.com/css2?family=${font.googleId}:wght@${font.weights}&display=swap`;
  return `/* HTML <head> */\n<link href="${url}" rel="stylesheet">\n\n/* CSS */\nfont-family: ${font.family};`;
}

// ── Font Card ──────────────────────────────────────────────────────────────
function FontCard({ font, previewText, fontSize, copied, onCopy }: {
  font: FontInfo;
  previewText: string;
  fontSize: number;
  copied: boolean;
  onCopy: (font: FontInfo) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const [loaded, setLoaded] = useState(loadedFonts.has(font.googleId));

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadGoogleFont(font);
          // Small delay to let font render
          setTimeout(() => setLoaded(true), 300);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [font]);

  const categoryTint: Record<FontCategory, string> = {
    'sans-serif': 'blue',
    'serif':      'pink',
    'monospace':  'green',
    'display':    'amber',
  };
  const tint = categoryTint[font.category];
  const catStyle = { background: `var(--tint-${tint}-bg)`, borderColor: `var(--tint-${tint}-border)`, color: `var(--tint-${tint}-fg)` };

  return (
    <div
      ref={cardRef}
      className={`${ui.card} ${s.fontCard}`}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{font.name}</h3>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
            <span className={ui.badge} style={catStyle}>
              {font.category}
            </span>
            <span className={`${ui.badge} ${ui.gray}`}>
              {locale === 'ko' || !font.tagEn ? font.tag : font.tagEn}
            </span>
          </div>
        </div>
        <button
          onClick={() => onCopy(font)}
          className={`${ui.button} ${ui.secondary} ${ui.sm} ${copied ? ui.green : ''} ${s.copyBtn}`}
        >
          {copied ? '✓ Copied' : '</> CSS'}
        </button>
      </div>

      {/* Preview */}
      <div style={{ minHeight: '4rem', display: 'flex', alignItems: 'center' }}>
        {loaded ? (
          <p style={{
            fontFamily: font.family,
            fontSize: `${fontSize}px`,
            margin: 0,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            wordBreak: 'break-word',
            transition: 'font-size 0.2s',
          }}>
            {previewText || (font.lang === 'korean' ? '가나다라마바사 한글 폰트 미리보기' : 'The quick brown fox jumps over the lazy dog')}
          </p>
        ) : (
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Loading font…</span>
          </div>
        )}
      </div>

      {/* Weight samples */}
      {loaded && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
          {font.weights.split(';').map(w => (
            <span key={w} style={{ fontFamily: font.family, fontSize: '0.8rem', fontWeight: Number(w), color: 'var(--text-secondary)' }}>
              {w === '400' ? 'Regular' : w === '500' ? 'Medium' : w === '600' ? 'SemiBold' : w === '700' ? 'Bold' : `w${w}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Harmony Card ───────────────────────────────────────────────────────────
function HarmonyCard({ pair, koText, enText, fontSize }: {
  pair: typeof HARMONY_PAIRS[0];
  koText: string;
  enText: string;
  fontSize: number;
}) {
  const [loaded, setLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadGoogleFont(pair.latin);
          loadGoogleFont(pair.korean);
          setTimeout(() => setLoaded(true), 400);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pair]);

  return (
    <div ref={cardRef} className={`${ui.card} ${s.harmonyCard}`}>
      {/* Pair header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pair.latin.name}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pair.korean.name}</span>
        </div>
        <span className={`${ui.badge} ${ui.violet}`}>
          {pair.vibe}
        </span>
      </div>

      {loaded ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Latin side */}
          <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #6366f1' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>ENGLISH · {pair.latin.name}</span>
            <p style={{ fontFamily: pair.latin.family, fontSize: `${fontSize}px`, margin: '0.5rem 0 0', lineHeight: 1.5, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
              {enText || 'Design for humans, not machines.'}
            </p>
          </div>
          {/* Korean side */}
          <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #a855f7' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>KOREAN · {pair.korean.name}</span>
            <p style={{ fontFamily: pair.korean.family, fontSize: `${fontSize}px`, margin: '0.5rem 0 0', lineHeight: 1.6, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
              {koText || '사람을 위한 디자인, 기계가 아닌.'}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ height: '6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Loading fonts…</span>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
type Tab = 'latin' | 'korean' | 'harmony';

export default function FontPreviewClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('FontCompare');

  const [tab, setTab] = useState<Tab>('latin');
  const [enText, setEnText]   = useState('');
  const [koText, setKoText]   = useState('');
  const [fontSize, setFontSize] = useState(22);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback((font: FontInfo) => {
    const snippet = buildCssSnippet(font);
    navigator.clipboard.writeText(snippet).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = snippet;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
    setCopiedId(font.googleId);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const tabList: { key: Tab; label: string }[] = [
    { key: 'latin',   label: t('tab_latin') },
    { key: 'korean',  label: t('tab_korean') },
    { key: 'harmony', label: t('tab_harmony') },
  ];

  const activePreviewText = tab === 'korean' ? koText : enText;

  return (
    <>
      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ maxWidth: 'var(--tool-width)', margin: '0 auto', width: '100%' }}>
        <NavigationActions />

        {/* Tool Start Card - V4 Standard */}
        <ToolHeader icon={<Type />} title={t('title')} subtitle={t('description')} />

        {/* ── Controls ── */}
        <div className={`${ui.card} ${s.controls}`}>

          {/* Tab switcher */}
          <div className={ui.segmented}>
            {tabList.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`${ui.segment} ${tab === key ? ui.segmentActive : ''}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Text inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: tab === 'harmony' ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
            {tab !== 'korean' && (
              <div className={ui.field}>
                <label className={ui.label}>
                  {t('en_input_label')}
                </label>
                <input
                  type="text"
                  value={enText}
                  onChange={e => setEnText(e.target.value)}
                  placeholder={t('en_placeholder')}
                  className={ui.input}
                />
              </div>
            )}
            {tab !== 'latin' && (
              <div className={ui.field}>
                <label className={ui.label}>
                  {t('ko_input_label')}
                </label>
                <input
                  type="text"
                  value={koText}
                  onChange={e => setKoText(e.target.value)}
                  placeholder={t('ko_placeholder')}
                  className={ui.input}
                />
              </div>
            )}
          </div>

          {/* Font size slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label className={ui.label} style={{ whiteSpace: 'nowrap' }}>
              {t('size_label')}: <strong style={{ color: 'var(--text-primary)' }}>{fontSize}px</strong>
            </label>
            <input
              type="range" min={12} max={48} value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              style={{ flex: 1, cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* ── Font Grid ── */}
        {tab === 'harmony' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('harmony_hint')}
            </p>
            {HARMONY_PAIRS.map((pair, i) => (
              <HarmonyCard key={i} pair={pair} koText={koText} enText={enText} fontSize={fontSize} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {(tab === 'latin' ? LATIN_FONTS : KOREAN_FONTS).map(font => (
              <FontCard
                key={font.googleId}
                font={font}
                previewText={tab === 'korean' ? koText : enText}
                fontSize={fontSize}
                copied={copiedId === font.googleId}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2rem', lineHeight: 1.6 }}>
          {t('footer_note')}
        </p>

        {/* 공유하기 */}
        <ShareBar title={t('title')} description={t('description')} />

        {/* 추천 도구 */}
        <RelatedTools toolId="utilities/design/font-preview" />

      </div>

      {seo}
    </>
  );
}
