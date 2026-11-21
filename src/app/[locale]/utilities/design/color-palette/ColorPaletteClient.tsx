'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import { Palette } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './color-palette.module.css';
import { ui } from '@/app/components/ui';

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
  tone: 'green' | 'blue' | 'red';
}

function getLevel(ratio: number, large: boolean): LevelResult {
  const aaaThreshold = large ? 4.5 : 7;
  const aaThreshold  = large ? 3.0 : 4.5;

  if (ratio >= aaaThreshold) return { pass: true,  label: 'AAA', tone: 'green' };
  if (ratio >= aaThreshold)  return { pass: true,  label: 'AA',  tone: 'blue' };
  return                             { pass: false, label: 'Fail', tone: 'red' };
}

// ── Preview text sizes ─────────────────────────────────────────────────────
const PREVIEW_TEXTS = [
  { label: 'Heading (24px)', size: '1.5rem', weight: 700, large: true },
  { label: 'Body (16px)',    size: '1rem',   weight: 400, large: false },
  { label: 'Small (12px)',   size: '0.75rem',weight: 400, large: false },
  { label: 'Button (14px)',  size: '0.875rem',weight: 600, large: false },
];

// ── Component ──────────────────────────────────────────────────────────────
export default function ColorPaletteClient({ seo }: { seo?: React.ReactNode }) {
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

  return (
    <div style={{ maxWidth: 'var(--tool-width)', margin: '0 auto', width: '100%' }}>
      <NavigationActions />

      {/* Tool Start Card - V4 Standard */}
      <ToolHeader icon={<Palette />} title={t('title')} subtitle={t('description')} />

      <div className={s.layout}>

        {/* ── Left: Pickers + Score ── */}
        <div className={s.column}>

          {/* Color pickers */}
          <div className={`${ui.card} ${s.panel}`}>
            <h2 className={`${ui.cardTitle} ${s.title}`}>{t('pick_colors')}</h2>

            {/* BG */}
            <div className={ui.field}>
              <label className={ui.label}>{t('bg_label')}</label>
              <div className={s.pickRow}>
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className={s.colorInput}
                />
                <input
                  type="text"
                  value={bgColor}
                  maxLength={7}
                  onChange={e => setBgColor(e.target.value)}
                  className={`${ui.input} ${s.hexInput}`}
                />
              </div>
            </div>

            {/* Text */}
            <div className={ui.field}>
              <label className={ui.label}>{t('text_label')}</label>
              <div className={s.pickRow}>
                <input
                  type="color"
                  value={txtColor}
                  onChange={e => setTxtColor(e.target.value)}
                  className={s.colorInput}
                />
                <input
                  type="text"
                  value={txtColor}
                  maxLength={7}
                  onChange={e => setTxtColor(e.target.value)}
                  className={`${ui.input} ${s.hexInput}`}
                />
              </div>
            </div>

            {/* Swap button */}
            <button
              onClick={() => { const tmp = bgColor; setBgColor(txtColor); setTxtColor(tmp); }}
              className={`${ui.button} ${ui.secondary} ${ui.block}`}
            >
              ⇅ {t('swap')}
            </button>
          </div>

          {/* Score card */}
          <div className={`${ui.card} ${s.panel}`}>
            <h2 className={`${ui.cardTitle} ${s.title}`}>{t('wcag_score')}</h2>

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
            <div className={s.levelGrid}>
              {[
                { key: 'normal_text', level: normalLevel, desc: t('normal_text') },
                { key: 'large_text',  level: largeLevel,  desc: t('large_text') },
              ].map(({ key, level, desc }) => (
                <div key={key} className={`${ui.card} ${s.levelBox}`}>
                  <span className={ui.hint} style={{ textAlign: 'center' }}>{desc}</span>
                  {level ? (
                    <span className={`${ui.badge} ${ui[level.tone]}`}>
                      {level.pass ? '✓ ' : '✗ '}{level.label}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>—</span>
                  )}
                </div>
              ))}
            </div>

            {/* WCAG guide note */}
            <div className={`${ui.notice} ${ui.gray}`}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>{t('wcag_guide_title')}</strong><br />
                {t('wcag_aa_normal')} &nbsp;|&nbsp; {t('wcag_aa_large')}<br />
                {t('wcag_aaa_normal')} &nbsp;|&nbsp; {t('wcag_aaa_large')}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Preview ── */}
        <div className={s.column}>

          {/* Live preview */}
          <div className={`${ui.card} ${s.panel}`}>
            <h2 className={`${ui.cardTitle} ${s.title}`}>{t('preview')}</h2>

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
                      <span className={`${ui.badge} ${ui[lv.tone]}`}>
                        {lv.pass ? '✓ ' : '✗ '}{lv.label}
                      </span>
                    ) : <span>—</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trending Palettes */}
          <div className={`${ui.card} ${s.panel}`}>
            <div>
              <h2 className={`${ui.cardTitle} ${s.title}`}>{t('trending_title')}</h2>
              <p className={`${ui.hint} ${s.subtitle}`}>{t('trending_hint')}</p>
            </div>

            <div className={s.paletteList}>
              {PALETTES.map(p => {
                const r = contrastRatio(p.bg, p.text);
                const lv = r !== null ? getLevel(r, false) : null;
                const active = bgColor === p.bg && txtColor === p.text;
                return (
                  <button
                    key={p.name}
                    onClick={() => applyPalette(p)}
                    className={`${ui.chip} ${active ? ui.chipActive : ''} ${s.paletteBtn}`}
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
                        <span className={`${ui.badge} ${ui.gray}`}>
                          {p.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)', marginTop: '0.15rem', fontFamily: 'monospace' }}>
                        {p.bg} · {p.text}
                      </div>
                    </div>

                    {/* Score */}
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {r !== null ? r.toFixed(1) : '—'}:1
                      </span>
                      {lv && (
                        <span className={`${ui.badge} ${ui[lv.tone]}`}>
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

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/design/color-palette" />


      {seo}
    </div>
  );
}
