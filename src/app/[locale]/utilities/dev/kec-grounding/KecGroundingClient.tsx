'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Zap } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './kec-grounding.module.css';
import { ui } from '@/app/components/ui';

const STANDARD_SQ = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];

const K_VALUES = {
  'cu-pvc': { value: 115, label: 'Cu 도체 / PVC 절연' },
  'cu-xlpe': { value: 143, label: 'Cu 도체 / XLPE 절연' },
  'al-pvc': { value: 76, label: 'Al 도체 / PVC 절연' },
  'al-xlpe': { value: 94, label: 'Al 도체 / XLPE 절연' },
};

export default function KecGroundingClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('KECGrounding');
  const [activeTab, setActiveTab] = useState<'method-a' | 'method-b'>('method-a');
  const [phaseConductor, setPhaseConductor] = useState<string>('');
  const [resultA, setResultA] = useState<number | null>(null);
  const [faultCurrent, setFaultCurrent] = useState<string>('');
  const [breakTime, setBreakTime] = useState<string>('');
  const [kValue, setKValue] = useState<string>('cu-pvc');
  const [resultB, setResultB] = useState<number | null>(null);

  const findRecommendedSize = (calculatedSize: number): number => {
    return STANDARD_SQ.find(size => size >= calculatedSize) || STANDARD_SQ[STANDARD_SQ.length - 1];
  };

  const calculateMethodA = (S: number) => {
    let minSize: number;
    if (S <= 16) minSize = S;
    else if (S <= 35) minSize = 16;
    else minSize = S / 2;
    setResultA(minSize);
  };

  const calculateMethodB = (I: number, t: number, k: number) => {
    const minSize = Math.sqrt(I * I * t) / k;
    setResultB(minSize);
  };

  const handlePhaseConductorChange = (value: string) => {
    setPhaseConductor(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) calculateMethodA(numValue);
    else setResultA(null);
  };

  React.useEffect(() => {
    const I = parseFloat(faultCurrent);
    const t = parseFloat(breakTime);
    const k = K_VALUES[kValue as keyof typeof K_VALUES].value;
    if (!isNaN(I) && !isNaN(t) && I > 0 && t > 0) calculateMethodB(I, t, k);
    else setResultB(null);
  }, [faultCurrent, breakTime, kValue]);

  const activeResult = activeTab === 'method-a' ? resultA : resultB;
  const recommendedSize = activeResult !== null ? findRecommendedSize(activeResult) : null;

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className={s.page_container}>
        <NavigationActions />

        <ToolHeader icon={<Zap />} title={t('title')} subtitle={t('subtitle')} />

        <div className={`${ui.card} ${s.panel}`}>
          <h2 className={ui.cardTitle}>🧮 {t('calculatorTitle')}</h2>

          <div className={`${ui.segmented} ${s.tab_bar}`}>
            <button
              onClick={() => setActiveTab('method-a')}
              className={`${ui.segment} ${activeTab === 'method-a' ? ui.segmentActive : ''}`}
              aria-label={t('tabA')}
            >{t('tabA')}</button>
            <button
              onClick={() => setActiveTab('method-b')}
              className={`${ui.segment} ${activeTab === 'method-b' ? ui.segmentActive : ''}`}
              aria-label={t('tabB')}
            >{t('tabB')}</button>
          </div>

          {activeTab === 'method-a' && (
            <div>
              <div className={`${ui.notice} ${ui.blue} ${s.info}`}>
                <div>
                  <strong>📌 {t('tabAInfo')}</strong>
                  <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                    <li>S ≤ 16㎟ → {t('tabARule1')}</li>
                    <li>16㎟ &lt; S ≤ 35㎟ → {t('tabARule2')}</li>
                    <li>S &gt; 35㎟ → {t('tabARule3')}</li>
                  </ul>
                </div>
              </div>
              <div className={ui.field}>
                <label className={ui.label}>{t('phaseConductorLabel')}</label>
                <div className={ui.inputGroup}>
                  <input type="number" placeholder="16" value={phaseConductor} onChange={(e) => handlePhaseConductorChange(e.target.value)} min="0" step="0.1" className={`${ui.input} ${ui.inputLg}`} />
                  <span className={ui.unit}>㎟</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'method-b' && (
            <div>
              <div className={`${ui.notice} ${ui.amber} ${s.info}`}>
                <div>
                  <strong>📌 {t('tabBInfo')}</strong>
                  <p style={{ fontFamily: 'monospace', marginTop: '0.5rem' }}>S = √(I² × t) / k</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className={ui.field}>
                  <label className={ui.label}>{t('faultCurrentLabel')}</label>
                  <div className={ui.inputGroup}>
                    <input type="number" placeholder="1000" value={faultCurrent} onChange={(e) => setFaultCurrent(e.target.value)} className={`${ui.input} ${ui.inputLg}`} style={{ paddingRight: '5rem' }} />
                    <span className={ui.unit}>A (RMS)</span>
                  </div>
                </div>
                <div className={ui.field}>
                  <label className={ui.label}>{t('breakTimeLabel')}</label>
                  <div className={ui.inputGroup}>
                    <input type="number" placeholder="1" value={breakTime} onChange={(e) => setBreakTime(e.target.value)} className={`${ui.input} ${ui.inputLg}`} style={{ paddingRight: '4rem' }} />
                    <span className={ui.unit}>{t('seconds')}</span>
                  </div>
                </div>
                <div className={ui.field}>
                  <label className={ui.label}>{t('kValueLabel')}</label>
                  <select value={kValue} onChange={(e) => setKValue(e.target.value)} className={ui.input}>
                    {Object.entries(K_VALUES).map(([key, data]) => <option key={key} value={key}>{data.label} (k = {data.value})</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {activeResult !== null && (
          <div className={`${ui.card} ${s.panel}`}>
            <h2 className={ui.cardTitle}>✓ {t('resultTitle')}</h2>
            <div style={{ textAlign: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('theoreticalMin')}</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{activeResult.toFixed(2)} ㎟</p>
            </div>
            <div className={ui.result} style={{ textAlign: 'center' }}>
              <p className={ui.resultLabel}>{t('recommendedSize')}</p>
              <p className={`${ui.resultValue} ${s.result_number}`}>{recommendedSize}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>SQ (㎟)</p>
              <p className={ui.hint} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--tint-violet-border)' }}>{t('standardCableNote')}</p>
            </div>
            <div className={`${ui.notice} ${ui.amber}`} style={{ marginTop: '1.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{t('warningTitle')}</p>
                <p style={{ color: 'var(--text-secondary)' }}>{t('warningText')}</p>
              </div>
            </div>
          </div>
        )}

        {/* 공유하기 */}
        <ShareBar title={t('title')} description={t('subtitle')} />

        {/* 추천 도구 */}
        <RelatedTools toolId="utilities/dev/kec-grounding" />


        {seo}
      </div>
    </div>
  );
}
