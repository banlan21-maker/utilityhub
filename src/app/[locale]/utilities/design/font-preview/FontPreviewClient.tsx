'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Type } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import SeoSection from '@/app/components/SeoSection';
import s from './font-preview.module.css';

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
  { name: 'Noto Sans KR',   family: "'Noto Sans KR', sans-serif",   googleId: 'Noto+Sans+KR',   weights: '400;600;700', lang: 'korean', category: 'sans-serif', tag: '표준체' },
  { name: 'Nanum Gothic',   family: "'Nanum Gothic', sans-serif",   googleId: 'Nanum+Gothic',   weights: '400;700',     lang: 'korean', category: 'sans-serif', tag: '고딕체' },
  { name: 'Nanum Myeongjo', family: "'Nanum Myeongjo', serif",      googleId: 'Nanum+Myeongjo', weights: '400;700',     lang: 'korean', category: 'serif',      tag: '명조체' },
  { name: 'Do Hyeon',       family: "'Do Hyeon', sans-serif",       googleId: 'Do+Hyeon',       weights: '400',         lang: 'korean', category: 'display',    tag: '둥근 고딕' },
  { name: 'Black Han Sans', family: "'Black Han Sans', sans-serif", googleId: 'Black+Han+Sans', weights: '400',         lang: 'korean', category: 'display',    tag: '임팩트' },
  { name: 'Gamja Flower',   family: "'Gamja Flower', cursive",      googleId: 'Gamja+Flower',   weights: '400',         lang: 'korean', category: 'display',    tag: '손글씨' },
  { name: 'Gowun Dodum',    family: "'Gowun Dodum', sans-serif",    googleId: 'Gowun+Dodum',    weights: '400',         lang: 'korean', category: 'sans-serif', tag: '도움체' },
  { name: 'Gowun Batang',   family: "'Gowun Batang', serif",        googleId: 'Gowun+Batang',   weights: '400',         lang: 'korean', category: 'serif',      tag: '바탕체' },
  { name: 'Sunflower',      family: "'Sunflower', sans-serif",      googleId: 'Sunflower',      weights: '300;500;700', lang: 'korean', category: 'sans-serif', tag: '경쾌한' },
  { name: 'Jua',            family: "'Jua', sans-serif",            googleId: 'Jua',            weights: '400',         lang: 'korean', category: 'display',    tag: '귀여운' },
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

  const categoryColors: Record<FontCategory, { bg: string; color: string }> = {
    'sans-serif': { bg: '#dbeafe', color: '#1e3a8a' },
    'serif':      { bg: '#fce7f3', color: '#831843' },
    'monospace':  { bg: '#dcfce7', color: '#14532d' },
    'display':    { bg: '#fef9c3', color: '#78350f' },
  };
  const catStyle = categoryColors[font.category];

  return (
    <div
      ref={cardRef}
      className="glass-panel"
      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{font.name}</h3>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '999px', background: catStyle.bg, color: catStyle.color }}>
              {font.category}
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'var(--border)', color: 'var(--text-secondary)' }}>
              {font.tag}
            </span>
          </div>
        </div>
        <button
          onClick={() => onCopy(font)}
          style={{
            padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${copied ? '#10b981' : 'var(--border)'}`,
            background: copied ? '#ecfdf5' : 'var(--surface)',
            color: copied ? '#065f46' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
          }}
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
            <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
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
    <div ref={cardRef} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Pair header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pair.latin.name}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pair.korean.name}</span>
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.65rem', borderRadius: '999px', background: 'linear-gradient(90deg, #6366f1, #a855f7)', color: 'white' }}>
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
          <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Loading fonts…</span>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
type Tab = 'latin' | 'korean' | 'harmony';

export default function FontPreviewClient() {
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

      <div style={{ maxWidth: '896px', margin: '0 auto', width: '100%' }}>
        <NavigationActions />

        {/* Tool Start Card - V4 Standard */}
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '1rem',
            background: 'white',
            borderRadius: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            marginBottom: '1.5rem'
          }}>
            <Type size={40} color="#8b5cf6" />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
            {t('title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            {t('description')}
          </p>
        </header>

        {/* ── Controls ── */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tabList.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: '0.5rem 1.25rem', fontWeight: 600, fontSize: '0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${tab === key ? 'var(--primary)' : 'var(--border)'}`,
                  background: tab === key ? 'var(--primary)' : 'var(--surface)',
                  color: tab === key ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Text inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: tab === 'harmony' ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
            {tab !== 'korean' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {t('en_input_label')}
                </label>
                <input
                  type="text"
                  value={enText}
                  onChange={e => setEnText(e.target.value)}
                  placeholder={t('en_placeholder')}
                  style={{
                    padding: '0.65rem 0.9rem', fontSize: '0.95rem',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                    outline: 'none', background: 'var(--surface)', color: 'var(--text-primary)',
                  }}
                />
              </div>
            )}
            {tab !== 'latin' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {t('ko_input_label')}
                </label>
                <input
                  type="text"
                  value={koText}
                  onChange={e => setKoText(e.target.value)}
                  placeholder={t('ko_placeholder')}
                  style={{
                    padding: '0.65rem 0.9rem', fontSize: '0.95rem',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                    outline: 'none', background: 'var(--surface)', color: 'var(--text-primary)',
                  }}
                />
              </div>
            )}
          </div>

          {/* Font size slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
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

        {/* 광고 영역 */}
        <div className={s.ad_placeholder}>광고 영역</div>
      </div>

      <SeoSection
        ko={{
          title: "다국어 폰트 비교기란 무엇인가요?",
          description: "구글 폰트 비교기(Google Fonts Comparator)는 영문 폰트와 한국어 폰트를 나란히 미리보기하고 CSS 코드를 한 번에 복사할 수 있는 온라인 폰트 탐색 도구입니다. 디자이너나 개발자가 프로젝트에 맞는 폰트를 선택할 때, 수십 개의 구글 폰트를 한 화면에서 비교하고 영문·한글 조화 탭으로 최적의 폰트 페어링까지 찾을 수 있습니다. 폰트는 화면에 보일 때만 레이지 로딩되므로 페이지 성능에도 영향이 없습니다.",
          useCases: [
            { icon: '🖥️', title: '웹사이트 & 앱 폰트 선정', desc: '헤딩용 폰트와 본문용 폰트를 함께 미리보며, 실제 문장으로 가독성과 분위기를 비교해 최적의 조합을 찾습니다.' },
            { icon: '📱', title: '한·영 혼용 디자인 최적화', desc: '한국어와 영어를 함께 사용하는 서비스에서 두 언어가 자연스럽게 어우러지는 폰트 페어링을 Harmony 탭에서 쉽게 찾습니다.' },
            { icon: '✍️', title: '블로그 & 미디어 타이포그래피', desc: '긴 글을 읽기 편한 폰트, 제목을 돋보이게 하는 폰트를 다양한 크기로 미리 보며 블로그 스타일을 결정합니다.' },
            { icon: '🎨', title: '브랜드 아이덴티티 수립', desc: '브랜드 성격(모던/클래식/캐주얼 등)에 맞는 폰트를 탐색하고, CSS 스니펫을 바로 복사해 디자인 시스템에 적용합니다.' },
          ],
          steps: [
            { step: '탭 선택 (영문 / 한글 / Harmony)', desc: '영문 폰트, 한국어 폰트, 또는 한·영 조화 페어링 탭을 선택합니다.' },
            { step: '미리보기 텍스트 & 크기 조절', desc: '상단 입력창에 실제 사용할 문장을 입력하고 폰트 크기를 조절해 실제 환경과 유사하게 미리봅니다.' },
            { step: 'CSS 복사 & 프로젝트 적용', desc: '마음에 드는 폰트 카드의 복사 버튼을 클릭하면 Google Fonts <link> 코드와 font-family CSS가 클립보드에 복사됩니다.' },
            { step: '폰트 페어링 최종 결정', desc: 'Harmony 탭에서 한국어-영어 폰트 조합을 비교하고 헤딩·본문 폰트를 확정합니다. 복사한 CSS 스니펫을 디자인 시스템 문서에 바로 붙여넣어 팀 전체가 동일한 폰트 기준을 공유할 수 있습니다.' },
          ],
          faqs: [
            { q: '구글 폰트는 무료로 사용할 수 있나요?', a: '네. Google Fonts에 등록된 모든 폰트는 SIL Open Font License 또는 Apache License로 제공되어 개인·상업적 용도 모두 무료로 사용할 수 있습니다. 별도 저작권 표기도 필요하지 않습니다.' },
            { q: '폰트를 불러오는 속도가 너무 느립니다', a: '이 도구는 IntersectionObserver를 이용해 화면에 보이는 카드의 폰트만 레이지 로드합니다. 한 번 로드된 폰트는 캐시되어 재방문 시 즉시 표시됩니다. 느린 경우 브라우저 캐시를 지우거나 네트워크 환경을 확인하세요.' },
            { q: '눈누(NoonNU) 폰트도 지원되나요?', a: '현재는 Google Fonts를 통해 제공되는 한국어 폰트를 지원합니다. 눈누 전용 폰트는 향후 업데이트에서 추가할 예정입니다. 필요한 폰트가 있으면 피드백 게시판에 남겨주세요.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: "What is a Multilingual Font Comparator?",
          description: "A Google Fonts Comparator lets designers and developers preview English and Korean fonts side by side and copy CSS code in one click. Compare dozens of Google Fonts on a single screen and use the Harmony tab to find the perfect Korean-English font pairing. Fonts are lazy-loaded only when visible, so there's no impact on page performance.",
          useCases: [
            { icon: '🖥️', title: 'Website & App Font Selection', desc: 'Preview heading and body fonts together with real sentences to compare readability and mood and find the optimal combination.' },
            { icon: '📱', title: 'Mixed Korean-English Design', desc: 'For services that use both Korean and English, use the Harmony tab to easily find pairings where the two scripts complement each other naturally.' },
            { icon: '✍️', title: 'Blog & Media Typography', desc: 'Preview easy-to-read fonts for long articles and eye-catching fonts for titles at various sizes to define your blog\'s typographic style.' },
            { icon: '🎨', title: 'Brand Identity Development', desc: 'Explore fonts that match your brand personality (modern/classic/casual) and copy the CSS snippet directly into your design system.' },
          ],
          steps: [
            { step: 'Select a tab (Latin / Korean / Harmony)', desc: 'Choose the Latin fonts tab, Korean fonts tab, or the Korean-English Harmony pairing tab.' },
            { step: 'Set preview text & font size', desc: 'Enter the actual sentence you plan to use and adjust the font size slider to preview it in a realistic context.' },
            { step: 'Copy CSS & apply to project', desc: 'Click the copy button on any font card to copy the Google Fonts <link> tag and font-family CSS to your clipboard.' },
            { step: 'Finalize font pairing', desc: 'Use the Harmony tab to compare Korean-English font combinations and confirm your heading and body fonts. Paste the copied CSS snippet into your design system documentation so the entire team shares the same typographic standards.' },
          ],
          faqs: [
            { q: 'Are Google Fonts free to use?', a: 'Yes. All fonts on Google Fonts are provided under the SIL Open Font License or Apache License, making them free for both personal and commercial use. No attribution is required.' },
            { q: 'Font loading is too slow', a: 'This tool uses IntersectionObserver to lazy-load only the fonts for cards currently in view. Once loaded, fonts are cached for instant display on subsequent visits. If it\'s slow, try clearing your browser cache or checking your network.' },
            { q: 'Are NoonNU fonts supported?', a: 'Currently only Korean fonts available through Google Fonts are supported. NoonNU-exclusive fonts are planned for a future update. If you need a specific font, leave a request on the feedback board.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        }}
      />
    </>
  );
}
