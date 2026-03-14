'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import NavigationActions from '@/app/components/NavigationActions';

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
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('description')}</p>
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
    </div>
  );
}
