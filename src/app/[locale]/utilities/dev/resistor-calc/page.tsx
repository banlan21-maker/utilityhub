'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Plug } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import RelatedTools from '@/app/components/RelatedTools';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';

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
  <div style={{ display: 'flex', background: 'var(--surface-hover)', padding: '4px', borderRadius: '10px', marginBottom: '2rem' }}>
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        style={{
          flex: 1, padding: '10px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600,
          position: 'relative', overflow: 'hidden', transition: 'color 0.2s',
          color: active === tab.id ? 'var(--text-primary)' : 'var(--text-muted)'
        }}
      >
        {active === tab.id && (
          <motion.div
            layoutId="tab-bg"
            style={{ position: 'absolute', inset: 0, background: 'var(--surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 0 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
          />
        )}
        <span style={{ position: 'relative', zIndex: 10 }}>{tab.label}</span>
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

export default function ResistorCalculator() {
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
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '5rem' }}>
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
          <Plug size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('description')}</p>
      </header>

      <ShadcnTabs 
        active={activeTab} 
        onChange={setActiveTab} 
        tabs={[{ id: 'band', label: t('tabBand') }, { id: 'smd', label: t('tabSmd') }]} 
      />

      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', minHeight: '400px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'band' ? (
            <motion.div key="band" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
                {[4, 5, 6].map(b => (
                  <button key={b} onClick={() => setBandCount(b)} style={{
                    padding: '8px 24px', borderRadius: 'full', border: '1px solid',
                    background: bandCount === b ? 'var(--surface-hover)' : 'none',
                    borderColor: bandCount === b ? ACCENT_ORANGE : 'var(--border)',
                    color: bandCount === b ? ACCENT_ORANGE : 'var(--text-muted)',
                    fontWeight: 700, fontSize: '0.85rem'
                  }}>{b} {t('bands')}</button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3.5rem' }}>
                <ResistorGraphic bands={bandCount} colors={selectedColors.map(n => COLOR_TABLE.find(c => c.name === n)!.code)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.5rem' }}>
                {Array.from({ length: bandCount }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t(`bandLabel${i + 1}`)}</label>
                    <select 
                      value={selectedColors[i]} 
                      onChange={e => {
                        const next = [...selectedColors]; next[i] = e.target.value; setSelectedColors(next);
                      }}
                      style={{
                        padding: '10px', borderRadius: '8px', background: 'var(--background)',
                        border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.85rem'
                      }}
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
                  <span className="glass-panel" style={{ padding: '4px 12px', fontSize: '1rem', fontWeight: 700 }}>{bandResult.tol || '±--%'}</span>
                  {bandResult.ppm && <span className="glass-panel" style={{ padding: '4px 12px', fontSize: '1rem', fontWeight: 700 }}>{bandResult.ppm}</span>}
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div key="smd" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>{t('enterSmdCode')}</label>
                <input 
                  value={smdCode} onChange={e => setSmdCode(e.target.value)} 
                  placeholder="e.g. 103, 1002, 01C" maxLength={4}
                  style={{
                    width: '100%', fontSize: '3rem', textAlign: 'center', fontWeight: 500, fontFamily: 'monospace',
                    padding: '20px', borderRadius: '16px', background: 'var(--background)', border: '2px solid var(--border)',
                    color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = ACCENT_ORANGE}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem 0' }}>
                <SmdGraphic code={smdCode.toUpperCase()} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <motion.div key={smdResult.ohm} initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ fontSize: '4.5rem', fontWeight: 900, color: '#10b981' }}>{smdResult.ohm}</motion.div>
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

      <RelatedTools toolId="dev/resistor" />

      <SeoSection
        ko={{
          title: '통합 저항기 판독기란 무엇인가요?',
          description: '전기 및 전자 공학에서 저항값은 회로 설계의 가장 기본이 되는 요소입니다. 통합 저항기 판독기는 리드형(띠색) 저항기와 표면 실장형(SMD) 저항기의 복잡한 코드를 실시간 그래픽과 함께 즉시 변환해주는 전문가용 도구입니다. 4색, 5색, 6색 띠 저항 판독은 물론, 3/4자리 및 고정밀 EIA-96 SMD 코드까지 완벽하게 지원하며 100% 클라이언트 사이드에서 작동하여 개인 정보를 안전하게 보호합니다.',
          useCases: [
            { icon: '🏭', title: '부품 분류 및 정리', desc: '부품함에 섞여 있는 저항기들의 색상을 보고 값을 즉시 판별하여 체계적으로 정리할 때 유용합니다.' },
            { icon: '📐', title: '회로 설계 및 검증', desc: '회로 설계 과정에서 필요한 저항값이 실제 어떤 색상 띠를 가지는지 시각적으로 미리 확인해볼 수 있습니다.' },
            { icon: '⚙️', title: 'SMD 수리 작업', desc: '육안으로 확인하기 어려운 작은 SMD 칩의 코드를 입력하여 정확한 스펙을 확인하고 교체 부품을 찾습니다.' },
            { icon: '🎓', title: '공학 교육', desc: '전자공학 입문자들이 저항기 색상 코드 체계를 직관적으로 학습하고 이해하는 데 최적의 도구입니다.' },
          ],
          steps: [
            { step: '판독 모드 선택', desc: '[띠색 계산기] 또는 [SMD 코드 판독기] 중 원하는 방식을 상단 탭에서 선택하세요.' },
            { step: '데이터 입력', desc: '띠색 모드에서는 각 위치의 색상을 선택하고, SMD 모드에서는 칩 표면의 코드를 텍스트로 입력하세요.' },
            { step: '결과값 및 오차 확인', desc: '중앙의 저항기 그래픽이 변하는 것을 확인하며 하단의 최종 저항값(Ω/kΩ/MΩ)과 오차율을 확인하세요.' },
          ],
          faqs: [
            { q: 'EIA-96 코드는 무엇인가요?', a: '오차 1% 미만의 고정밀 저항기에서 사용되는 코드로, 두 자리 숫자 인덱스와 한 자리 문자로 구성됩니다. 일반적인 배수법과 다르니 본 도구의 자동 판별 기능을 사용하는 것이 정확합니다.' },
            { q: '저항기에 띠가 6개인 경우는 무엇을 의미하나요?', a: '6번째 띠는 온도 계수(Temperature Coefficient)를 의미하며, 온도 변화에 따라 저항값이 얼마나 변하는지(PPM/K)를 나타냅니다.' },
            { q: '단위가 왜 kΩ이나 MΩ으로 바뀌나요?', a: '가독성을 위해 1,000Ω 이상은 kΩ으로, 1,000,000Ω 이상은 MΩ으로 직관적으로 자동 변환하여 표시합니다.' },
          ],
        }}
        en={{
          title: 'What is an Integrated Resistor Calculator?',
          description: 'In electrical and electronic engineering, resistance is the most fundamental element of circuit design. The Integrated Resistor Calculator is a professional-grade tool that instantly decodes leaded (color band) and surface-mount (SMD) resistors. It supports 4, 5, and 6-band color codes, as well as 3/4-digit and high-precision EIA-96 SMD codes. Operating 100% client-side, it ensures your data is never sent to a server, providing a fast and secure experience for engineers and hobbyists.',
          useCases: [
            { icon: '🏭', title: 'Component Sorting', desc: 'Quickly identify the value of scattered resistors by their color bands to organize your parts bin.' },
            { icon: '📐', title: 'Circuit Validation', desc: 'Visually confirm what color bands a target resistance value should have during the prototyping phase.' },
            { icon: '⚙️', title: 'SMD Repair', desc: 'Enter the small code on a surface-mount chip to verify its specs and find an appropriate replacement.' },
            { icon: '🎓', title: 'Engineering Education', desc: 'A perfect tool for beginners to intuitively learn and understand the resistor color code standards.' },
          ],
          steps: [
            { step: 'Choose Mode', desc: 'Select between [Color Band] or [SMD Code] from the top selector tabs.' },
            { step: 'Enter Details', desc: 'Select colors for each band or type the alphanumeric code on the SMD chip.' },
            { step: 'Check Value & Tolerance', desc: 'Watch the resistor graphic update real-time and view the final value (Ω/kΩ/MΩ) at the bottom.' },
          ],
          faqs: [
            { q: 'What is the EIA-96 code?', a: 'It is a high-precision code used for resistors with <1% tolerance, consisting of 2 digits (index) and 1 letter (multiplier). It differs from standard systems, so auto-decoding is recommended.' },
            { q: 'What does a 6th band represent?', a: 'The sixth band represents the Temperature Coefficient, indicating how much the resistance changes per degree (PPM/K).' },
            { q: 'Why do units change to kΩ or MΩ?', a: 'For readability, values above 1,000Ω are formatted as kΩ, and values above 1,000,000Ω are shown as MΩ.' },
          ],
        }}
      />
    </div>
  );
}
