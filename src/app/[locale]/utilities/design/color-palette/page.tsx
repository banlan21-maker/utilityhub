'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import { Palette } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';

// ── WCAG Algorithm ─────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function linearize(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map(linearize);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number | null {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  if (l1 === null || l2 === null) return null;
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── Trending Palettes ──────────────────────────────────────────────────────
interface Palette {
  name: string;
  tag: string;
  bg: string;
  text: string;
  accent: string;
}

const PALETTES: Palette[] = [
  {
    name: 'Minimal Clean',
    tag: 'Minimal',
    bg: '#FFFFFF',
    text: '#111827',
    accent: '#6366f1',
  },
  {
    name: 'Pastel Dream',
    tag: 'Pastel',
    bg: '#FDF4FF',
    text: '#581c87',
    accent: '#c084fc',
  },
  {
    name: 'Tech Dark',
    tag: 'Dark',
    bg: '#0f172a',
    text: '#e2e8f0',
    accent: '#38bdf8',
  },
  {
    name: 'Ocean Breeze',
    tag: 'Blue',
    bg: '#eff6ff',
    text: '#1e3a8a',
    accent: '#3b82f6',
  },
  {
    name: 'Warm Amber',
    tag: 'Warm',
    bg: '#fffbeb',
    text: '#78350f',
    accent: '#f59e0b',
  },
];

// ── Badge level helper ─────────────────────────────────────────────────────
interface LevelResult {
  pass: boolean;
  label: string;
  color: string;
  bg: string;
}

function getLevel(ratio: number, large: boolean): LevelResult {
  const aaaThreshold = large ? 4.5 : 7;
  const aaThreshold  = large ? 3.0 : 4.5;

  if (ratio >= aaaThreshold) return { pass: true,  label: 'AAA', color: '#065f46', bg: '#d1fae5' };
  if (ratio >= aaThreshold)  return { pass: true,  label: 'AA',  color: '#1e40af', bg: '#dbeafe' };
  return                             { pass: false, label: 'Fail', color: '#991b1b', bg: '#fee2e2' };
}

// ── Preview text sizes ─────────────────────────────────────────────────────
const PREVIEW_TEXTS = [
  { label: 'Heading (24px)', size: '1.5rem', weight: 700, large: true },
  { label: 'Body (16px)',    size: '1rem',   weight: 400, large: false },
  { label: 'Small (12px)',   size: '0.75rem',weight: 400, large: false },
  { label: 'Button (14px)',  size: '0.875rem',weight: 600, large: false },
];

// ── Component ──────────────────────────────────────────────────────────────
export default function ColorCheckerPage() {
  const t = useTranslations('ColorChecker');

  const [bgColor,  setBgColor]  = useState('#FFFFFF');
  const [txtColor, setTxtColor] = useState('#111827');

  const ratio = contrastRatio(bgColor, txtColor);
  const ratioDisplay = ratio !== null ? ratio.toFixed(2) : '—';

  const normalLevel = ratio !== null ? getLevel(ratio, false) : null;
  const largeLevel  = ratio !== null ? getLevel(ratio, true)  : null;

  const applyPalette = useCallback((p: Palette) => {
    setBgColor(p.bg);
    setTxtColor(p.text);
  }, []);

  // ratio bar fill (capped at 21)
  const barPct = ratio !== null ? Math.min((ratio / 21) * 100, 100) : 0;
  const barColor =
    ratio === null ? '#9ca3af'
    : ratio >= 7   ? '#10b981'
    : ratio >= 4.5 ? '#3b82f6'
    : ratio >= 3   ? '#f59e0b'
    : '#ef4444';

  const inputStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    outline: 'none',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    fontFamily: 'monospace',
    flex: 1,
    minWidth: 0,
  };

  return (
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
          <Palette size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {t('description')}
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>

        {/* ── Left: Pickers + Score ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Color pickers */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t('pick_colors')}</h2>

            {/* BG */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{t('bg_label')}</label>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
                />
                <input
                  type="text"
                  value={bgColor}
                  maxLength={7}
                  onChange={e => setBgColor(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{t('text_label')}</label>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={txtColor}
                  onChange={e => setTxtColor(e.target.value)}
                  style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
                />
                <input
                  type="text"
                  value={txtColor}
                  maxLength={7}
                  onChange={e => setTxtColor(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Swap button */}
            <button
              onClick={() => { const tmp = bgColor; setBgColor(txtColor); setTxtColor(tmp); }}
              style={{
                padding: '0.55rem', fontSize: '0.85rem', fontWeight: 500,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              ⇅ {t('swap')}
            </button>
          </div>

          {/* Score card */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t('wcag_score')}</h2>

            {/* Big ratio number */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 800, color: barColor, lineHeight: 1 }}>
                {ratioDisplay}
              </span>
              <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>: 1</span>
            </div>

            {/* Bar */}
            <div>
              <div style={{ height: '10px', borderRadius: '999px', background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${barPct}%`,
                  background: barColor,
                  borderRadius: '999px',
                  transition: 'width 0.4s ease, background 0.4s ease',
                }} />
              </div>
              {/* Threshold markers */}
              <div style={{ position: 'relative', height: '1.4rem', marginTop: '0.2rem' }}>
                {[{ pct: (3 / 21) * 100, label: '3:1' }, { pct: (4.5 / 21) * 100, label: '4.5:1' }, { pct: (7 / 21) * 100, label: '7:1' }].map(m => (
                  <div key={m.label} style={{ position: 'absolute', left: `${m.pct}%`, transform: 'translateX(-50%)', fontSize: '0.65rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {m.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Pass/Fail badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { key: 'normal_text', level: normalLevel, desc: t('normal_text') },
                { key: 'large_text',  level: largeLevel,  desc: t('large_text') },
              ].map(({ key, level, desc }) => (
                <div key={key} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{desc}</span>
                  {level ? (
                    <span style={{
                      fontSize: '1rem', fontWeight: 700, padding: '0.25rem 0.75rem',
                      borderRadius: '999px', background: level.bg, color: level.color,
                    }}>
                      {level.pass ? '✓ ' : '✗ '}{level.label}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>—</span>
                  )}
                </div>
              ))}
            </div>

            {/* WCAG guide note */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, padding: '0.75rem', background: 'var(--surface)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>WCAG 2.1 기준</strong><br />
              AA 일반 텍스트: 4.5:1 이상 &nbsp;|&nbsp; AA 큰 텍스트(18px+): 3:1 이상<br />
              AAA 일반 텍스트: 7:1 이상 &nbsp;|&nbsp; AAA 큰 텍스트: 4.5:1 이상
            </div>
          </div>
        </div>

        {/* ── Right: Preview ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Live preview */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t('preview')}</h2>

            <div style={{
              background: bgColor, color: txtColor,
              borderRadius: 'var(--radius-md)', padding: '2rem',
              display: 'flex', flexDirection: 'column', gap: '1rem',
              boxShadow: 'var(--shadow-md)',
              transition: 'background 0.3s, color 0.3s',
            }}>
              {PREVIEW_TEXTS.map(pt => (
                <div key={pt.label}>
                  <span style={{ fontSize: '0.6rem', opacity: 0.5, fontFamily: 'monospace' }}>{pt.label}</span>
                  <p style={{ margin: 0, fontSize: pt.size, fontWeight: pt.weight, color: txtColor }}>
                    The quick brown fox jumps over the lazy dog.
                  </p>
                </div>
              ))}

              {/* Button preview */}
              <button style={{
                marginTop: '0.5rem',
                padding: '0.6rem 1.25rem',
                background: txtColor,
                color: bgColor,
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'default',
                alignSelf: 'flex-start',
              }}>
                Sample Button
              </button>
            </div>

            {/* Per-size breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {PREVIEW_TEXTS.map(pt => {
                const lv = ratio !== null ? getLevel(ratio, pt.large) : null;
                return (
                  <div key={pt.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{pt.label}</span>
                    {lv ? (
                      <span style={{
                        padding: '0.15rem 0.6rem', borderRadius: '999px',
                        fontWeight: 700, fontSize: '0.75rem',
                        background: lv.bg, color: lv.color,
                      }}>
                        {lv.pass ? '✓ ' : '✗ '}{lv.label}
                      </span>
                    ) : <span>—</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trending Palettes */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>{t('trending_title')}</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{t('trending_hint')}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {PALETTES.map(p => {
                const r = contrastRatio(p.bg, p.text);
                const lv = r !== null ? getLevel(r, false) : null;
                const active = bgColor === p.bg && txtColor === p.text;
                return (
                  <button
                    key={p.name}
                    onClick={() => applyPalette(p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.85rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                      background: active ? 'var(--primary-light, rgba(99,102,241,0.08))' : 'var(--surface)',
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseOver={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface-hover)'; } }}
                    onMouseOut={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; } }}
                  >
                    {/* Color swatch */}
                    <div style={{ display: 'flex', flexShrink: 0 }}>
                      <div style={{ width: '2.2rem', height: '2.2rem', borderRadius: '6px 0 0 6px', background: p.bg, border: '1px solid var(--border)' }} />
                      <div style={{ width: '2.2rem', height: '2.2rem', borderRadius: '0 6px 6px 0', background: p.text, border: '1px solid var(--border)' }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{p.name}</span>
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '999px', background: 'var(--border)', color: 'var(--text-secondary)' }}>
                          {p.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', fontFamily: 'monospace' }}>
                        {p.bg} · {p.text}
                      </div>
                    </div>

                    {/* Score */}
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {r !== null ? r.toFixed(1) : '—'}:1
                      </span>
                      {lv && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '999px', background: lv.bg, color: lv.color }}>
                          {lv.label}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <SeoSection
        ko={{
          title: "색상 팔레트 & WCAG 가독성 검사기란 무엇인가요?",
          description: "색상 대비 검사기(Color Contrast Checker)는 두 색상 간의 명도 대비(Contrast Ratio)를 WCAG 2.1(Web Content Accessibility Guidelines) 기준으로 즉시 계산해주는 웹 접근성 도구입니다. 텍스트와 배경색의 조합이 시각 장애인, 색맹 사용자, 고령 사용자를 포함한 모든 사람이 읽기에 충분한 대비를 가지는지 AA/AAA 기준으로 판별합니다. 트렌딩 팔레트를 클릭 한 번으로 적용하고, 디자이너·개발자·PM 누구나 쉽게 접근성을 검증할 수 있습니다.",
          useCases: [
            { icon: '🎨', title: 'UI/UX 디자인 시스템 구축', desc: '버튼 색상, 폼 레이블, 알림 메시지 등 UI 컴포넌트의 텍스트-배경 조합이 WCAG 기준을 충족하는지 검증합니다.' },
            { icon: '♿', title: '웹 접근성(Accessibility) 준수', desc: '공공기관, 금융, 교육 사이트 등 법적으로 웹 접근성 준수가 필요한 서비스의 색상 대비를 사전에 검토합니다.' },
            { icon: '📊', title: '프레젠테이션 & 인포그래픽', desc: '발표 자료, 대시보드, 차트의 색상 조합을 검사해 빔프로젝터 환경이나 인쇄물에서도 선명하게 보이도록 합니다.' },
            { icon: '🎯', title: '마케팅 & 브랜드 디자인', desc: '브랜드 컬러 기반의 배너, 이메일 뉴스레터, SNS 게시물 디자인 시 텍스트 가독성을 확보합니다.' },
          ],
          steps: [
            { step: '배경색 & 텍스트색 선택', desc: '색상 피커에서 배경색과 텍스트(전경)색을 선택하거나 HEX 코드를 직접 입력합니다. ↔ 버튼으로 두 색상을 스왑할 수 있습니다.' },
            { step: 'WCAG 점수 확인', desc: '일반 텍스트(16px) AA/AAA, 큰 텍스트(18px+) AA/AAA 기준 4가지 합격/불합격 배지를 즉시 확인합니다.' },
            { step: '트렌딩 팔레트 적용', desc: '하단의 트렌딩 팔레트 카드를 클릭하면 해당 색상 조합이 즉시 적용됩니다. 다양한 팔레트를 빠르게 비교해보세요.' },
          ],
          faqs: [
            { q: 'WCAG AA와 AAA 기준의 차이는 무엇인가요?', a: 'AA는 대부분의 웹사이트에서 요구되는 최소 기준입니다. 일반 텍스트 4.5:1, 큰 텍스트 3:1 이상이 필요합니다. AAA는 더 엄격한 향상된 기준으로, 일반 텍스트 7:1, 큰 텍스트 4.5:1이 필요합니다. 대부분의 프로젝트는 AA 충족을 목표로 합니다.' },
            { q: '색맹 사용자를 위한 색상 선택 팁이 있나요?', a: '빨강-초록(적록색맹)과 파랑-노랑(청황색맹) 조합은 피하세요. 색상만으로 정보를 전달하지 말고 아이콘, 패턴, 텍스트를 함께 사용하세요. 대비비 4.5:1 이상을 유지하면 색맹 사용자에게도 대부분 읽기 쉽습니다.' },
            { q: 'HEX 코드 없이 색상을 입력할 수 있나요?', a: '현재는 HEX 코드 입력과 색상 피커를 지원합니다. rgb(255,255,255) 형식은 직접 지원하지 않으므로, RGB to HEX 변환 후 입력하거나 색상 피커를 사용하세요.' },
          ],
        }}
        en={{
          title: "What is a Color Palette & WCAG Readability Checker?",
          description: "This Color Contrast Checker calculates the luminance contrast ratio between two colors according to WCAG 2.1 (Web Content Accessibility Guidelines) and determines whether the combination passes AA or AAA standards for both normal and large text. It helps designers, developers, and PMs verify that text is readable for all users — including those with visual impairments, color blindness, or age-related vision changes. Apply trending palettes with a single click and verify accessibility instantly.",
          useCases: [
            { icon: '🎨', title: 'UI/UX Design Systems', desc: 'Verify that button colors, form labels, and notification messages meet WCAG contrast requirements before shipping.' },
            { icon: '♿', title: 'Web Accessibility Compliance', desc: 'Pre-validate color contrast for government, financial, and educational sites where accessibility compliance is legally required.' },
            { icon: '📊', title: 'Presentations & Infographics', desc: 'Ensure dashboard charts and slide decks remain legible on projectors and in print by checking contrast ratios in advance.' },
            { icon: '🎯', title: 'Marketing & Brand Design', desc: 'Confirm text legibility in brand-colored banners, email newsletters, and social media posts.' },
          ],
          steps: [
            { step: 'Pick background & text colors', desc: 'Use the color pickers or enter HEX codes directly. Use the ↔ button to swap colors instantly.' },
            { step: 'Check WCAG scores', desc: 'Pass/Fail badges for Normal Text AA/AAA and Large Text AA/AAA appear immediately.' },
            { step: 'Apply trending palettes', desc: 'Click any palette card below to apply that color combination instantly and compare options quickly.' },
          ],
          faqs: [
            { q: "What's the difference between WCAG AA and AAA?", a: 'AA is the minimum standard required for most websites: 4.5:1 contrast for normal text, 3:1 for large text. AAA is the enhanced level: 7:1 for normal text, 4.5:1 for large text. Most projects target AA compliance.' },
            { q: 'Any color selection tips for color-blind users?', a: 'Avoid red-green (protanopia/deuteranopia) and blue-yellow (tritanopia) combinations. Never rely on color alone to convey information — pair it with icons, patterns, or text labels. Maintaining a 4.5:1+ contrast ratio generally ensures readability for most color-blind users too.' },
            { q: 'Can I enter colors in RGB format?', a: 'Currently only HEX codes and the color picker are supported. Convert RGB to HEX first, or use the color picker to select your color visually.' },
          ],
        }}
      />
    </div>
  );
}
