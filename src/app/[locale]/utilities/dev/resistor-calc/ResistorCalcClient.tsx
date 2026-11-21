'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Plug } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { ui } from '@/app/components/ui';

// --- Constants & Tables ---

const ACCENT_ORANGE = '#f97316';

const COLOR_TABLE = [
  { name: 'Black', code: '#000000', value: 0, multiplier: 1, tolerance: null, ppm: null, text: 'white' },
  { name: 'Brown', code: '#8B4513', value: 1, multiplier: 10, tolerance: 1, ppm: 100, text: 'white' },
  { name: 'Red', code: '#FF0000', value: 2, multiplier: 100, tolerance: 2, ppm: 50, text: 'white' },
  { name: 'Orange', code: '#FFA500', value: 3, multiplier: 1000, tolerance: null, ppm: 15, text: 'black' },
  { name: 'Yellow', code: '#FFFF00', value: 4, multiplier: 10000, tolerance: null, ppm: 25, text: 'black' },
  { name: 'Green', code: '#008000', value: 5, multiplier: 100000, tolerance: 0.5, ppm: null, text: 'white' },
  { name: 'Blue', code: '#0000FF', value: 6, multiplier: 1000000, tolerance: 0.25, ppm: 10, text: 'white' },
  { name: 'Violet', code: '#EE82EE', value: 7, multiplier: 10000000, tolerance: 0.1, ppm: 5, text: 'black' },
  { name: 'Gray', code: '#808080', value: 8, multiplier: 100000000, tolerance: 0.05, ppm: null, text: 'white' },
  { name: 'White', code: '#FFFFFF', value: 9, multiplier: 1000000000, tolerance: null, ppm: null, text: 'black' },
  { name: 'Gold', code: '#D4AF37', value: null, multiplier: 0.1, tolerance: 5, ppm: null, text: 'black' },
  { name: 'Silver', code: '#C0C0C0', value: null, multiplier: 0.01, tolerance: 10, ppm: null, text: 'black' },
];

const E96_VALUE_TABLE: Record<string, number> = {
  '01': 100, '02': 102, '03': 105, '04': 107, '05': 110, '06': 113, '07': 115, '08': 118, '09': 121, '10': 124,
  '11': 127, '12': 130, '13': 133, '14': 137, '15': 140, '16': 143, '17': 147, '18': 150, '19': 154, '20': 158,
  '21': 162, '22': 165, '23': 169, '24': 174, '25': 178, '26': 182, '27': 187, '28': 191, '29': 196, '30': 200,
  '31': 205, '32': 210, '33': 215, '34': 221, '35': 226, '36': 232, '37': 237, '38': 243, '39': 249, '40': 255,
  '41': 261, '42': 267, '43': 274, '44': 280, '45': 287, '46': 294, '47': 301, '48': 309, '49': 316, '50': 324,
  '51': 332, '52': 340, '53': 348, '54': 357, '55': 365, '56': 374, '57': 383, '58': 392, '59': 402, '60': 412,
  '61': 422, '62': 432, '63': 442, '64': 453, '65': 464, '66': 475, '67': 487, '68': 499, '69': 511, '70': 523,
  '71': 536, '72': 549, '73': 562, '74': 576, '75': 590, '76': 604, '77': 619, '78': 634, '79': 649, '80': 665,
  '81': 681, '82': 698, '83': 715, '84': 732, '85': 750, '86': 768, '87': 787, '88': 806, '89': 825, '90': 845,
  '91': 866, '92': 887, '93': 909, '94': 931, '95': 953, '96': 976,
};
const E96_MULT_TABLE: Record<string, number> = {
  'Y': 0.01, 'X': 0.1, 'A': 1, 'B': 10, 'C': 100, 'D': 1000, 'E': 10000, 'F': 100000, 'H': 10, 'Z': 0.01, 'R': 0.01, 'S': 1,
};

// --- Utilities ---

const formatOhm = (val: number) => {
  if (val >= 1000000) return (val / 1000000).toFixed(2).replace(/\.00$/, '') + ' MΩ';
  if (val >= 1000) return (val / 1000).toFixed(2).replace(/\.00$/, '') + ' kΩ';
  return val.toFixed(2).replace(/\.00$/, '') + ' Ω';
};

// --- Components ---

const ShadcnTabs = ({ active, onChange, tabs }: { active: string, onChange: (id: string) => void, tabs: { id: string, label: string }[] }) => (
  <div className={ui.segmented} style={{ marginBottom: '2rem' }}>
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`${ui.segment} ${active === tab.id ? ui.segmentActive : ''}`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

const ResistorGraphic = ({ bands, colors }: { bands: number, colors: string[] }) => (
  <svg width="320" height="100" viewBox="0 0 320 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="47" width="320" height="6" rx="3" fill="#94A3B8" /> {/* Leads */}
    <rect x="65" y="20" width="190" height="60" rx="30" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" /> {/* Body */}
    <g>
      {Array.from({ length: bands }).map((_, i) => {
        const spacing = 190 / (bands + 1);
        const xPos = 65 + spacing * (i + 1) - 6;
        return (
          <motion.rect
            key={i}
            x={xPos} y="20" width="12" height="60"
            fill={colors[i]}
            initial={false}
            animate={{ fill: colors[i] }}
            transition={{ duration: 0.3 }}
          />
        );
      })}
    </g>
  </svg>
);

const SmdGraphic = ({ code }: { code: string }) => (
  <svg width="240" height="120" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="120" rx="8" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
    <rect x="0" y="0" width="30" height="120" fill="#94A3B8" /> {/* Left contact */}
    <rect x="210" y="0" width="30" height="120" fill="#94A3B8" /> {/* Right contact */}
    <text x="120" y="75" textAnchor="middle" fill="white" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '48px', fontWeight: 600 }}>
      {code || 'CODE'}
    </text>
  </svg>
);

export default function ResistorCalcClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('Resistor');
  const [activeTab, setActiveTab] = useState('band');
  const [bandCount, setBandCount] = useState<number>(4);
  const [selectedColors, setSelectedColors] = useState(['Brown', 'Black', 'Red', 'Gold', 'Brown', 'Brown']);
  const [smdCode, setSmdCode] = useState('');

  // --- Calculations ---

  const bandResult = useMemo(() => {
    const c = selectedColors.map(name => COLOR_TABLE.find(color => color.name === name)!);
    let ohm = 0;
    let tol = '';
    let ppm = '';

    if (bandCount === 4) {
      ohm = (c[0].value! * 10 + c[1].value!) * c[2].multiplier!;
      tol = c[3].tolerance ? `±${c[3].tolerance}%` : '';
    } else {
      ohm = (c[0].value! * 100 + c[1].value! * 10 + c[2].value!) * c[3].multiplier!;
      tol = c[4].tolerance ? `±${c[4].tolerance}%` : '';
      if (bandCount === 6) ppm = c[5].ppm ? `${c[5].ppm} ppm` : '';
    }
    return { ohm: formatOhm(ohm), tol, ppm };
  }, [bandCount, selectedColors]);

  const smdResult = useMemo(() => {
    const code = smdCode.trim().toUpperCase();
    if (!code) return { ohm: '--', tol: '--' };
    if (/^\d{3}$/.test(code)) {
      const v = parseInt(code.substring(0, 2)), m = Math.pow(10, parseInt(code[2]));
      return { ohm: formatOhm(v * m), tol: '±5%' };
    }
    if (/^\d{4}$/.test(code)) {
      const v = parseInt(code.substring(0, 3)), m = Math.pow(10, parseInt(code[3]));
      return { ohm: formatOhm(v * m), tol: '±1%' };
    }
    if (code.includes('R')) {
      const val = parseFloat(code.replace('R', '.'));
      return { ohm: formatOhm(val), tol: code.length === 3 ? '±5%' : '±1%' };
    }
    if (/^\d{2}[A-Z]$/.test(code)) {
      const b = E96_VALUE_TABLE[code.substring(0, 2)], m = E96_MULT_TABLE[code[2]];
      if (b && m !== undefined) return { ohm: formatOhm(b * m), tol: '±1%' };
    }
    return { ohm: 'Invalid', tol: '--' };
  }, [smdCode]);

  return (
    <div style={{ maxWidth: 'var(--tool-width)', margin: '0 auto', paddingBottom: '5rem' }}>
      <NavigationActions />

      <ToolHeader icon={<Plug />} title={t('title')} subtitle={t('description')} />

      <ShadcnTabs
        active={activeTab}
        onChange={setActiveTab}
        tabs={[{ id: 'band', label: t('tabBand') }, { id: 'smd', label: t('tabSmd') }]}
      />

      <div className={ui.card} style={{ marginBottom: '2rem', minHeight: '400px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'band' ? (
            <motion.div key="band" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

              <div className={ui.chips} style={{ justifyContent: 'center', marginBottom: '2.5rem' }}>
                {[4, 5, 6].map(b => (
                  <button key={b} onClick={() => setBandCount(b)} className={`${ui.chip} ${ui.pill} ${bandCount === b ? ui.chipActive : ''}`}>{b} {t('bands')}</button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3.5rem' }}>
                <ResistorGraphic bands={bandCount} colors={selectedColors.map(n => COLOR_TABLE.find(c => c.name === n)!.code)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.5rem' }}>
                {Array.from({ length: bandCount }).map((_, i) => (
                  <div key={i} className={ui.field}>
                    <label className={ui.label}>{t(`bandLabel${i + 1}`)}</label>
                    <select
                      value={selectedColors[i]}
                      onChange={e => {
                        const next = [...selectedColors]; next[i] = e.target.value; setSelectedColors(next);
                      }}
                      className={ui.input}
                    >
                      {COLOR_TABLE.map(color => {
                        const skip = (bandCount === 4 && ((i < 2 && color.value === null) || (i === 2 && color.multiplier === null) || (i === 3 && color.tolerance === null))) ||
                                     (bandCount >= 5 && ((i < 3 && color.value === null) || (i === 3 && color.multiplier === null) || (i === 4 && color.tolerance === null) || (i === 5 && color.ppm === null)));
                        return !skip && <option key={color.name} value={color.name}>{color.name}</option>;
                      })}
                    </select>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} key={bandResult.ohm} style={{ fontSize: '4.5rem', fontWeight: 900, color: ACCENT_ORANGE }}>{bandResult.ohm}</motion.div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <span className={`${ui.badge} ${ui.gray}`} style={{ fontSize: '1rem', padding: '0.25rem 0.75rem' }}>{bandResult.tol || '±--%'}</span>
                  {bandResult.ppm && <span className={`${ui.badge} ${ui.gray}`} style={{ fontSize: '1rem', padding: '0.25rem 0.75rem' }}>{bandResult.ppm}</span>}
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div key="smd" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                <label className={ui.label} style={{ display: 'block', marginBottom: '1rem' }}>{t('enterSmdCode')}</label>
                <input
                  value={smdCode} onChange={e => setSmdCode(e.target.value)}
                  placeholder="e.g. 103, 1002, 01C" maxLength={4}
                  className={`${ui.input} ${ui.inputLg}`}
                  style={{ fontSize: '3rem', textAlign: 'center', fontWeight: 500, fontFamily: 'monospace', minHeight: '96px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem 0' }}>
                <SmdGraphic code={smdCode.toUpperCase()} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <motion.div key={smdResult.ohm} initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ fontSize: '4.5rem', fontWeight: 900, color: 'var(--tint-green-fg)' }}>{smdResult.ohm}</motion.div>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{smdResult.tol} ({t('smdHint')})</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ShareBar
        title={activeTab === 'band' ? `${t('sharePre')} ${bandResult.ohm}` : `${t('sharePreSmd')} ${smdResult.ohm}`}
        description={t('description')}
      />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/dev/resistor-calc" />


      {seo}
    </div>
  );
}
