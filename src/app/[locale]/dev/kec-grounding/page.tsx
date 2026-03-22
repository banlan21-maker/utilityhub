'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';

const STANDARD_SQ = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];

const K_VALUES = {
  'cu-pvc': { value: 115, label: 'Cu 도체 / PVC 절연' },
  'cu-xlpe': { value: 143, label: 'Cu 도체 / XLPE 절연' },
  'al-pvc': { value: 76, label: 'Al 도체 / PVC 절연' },
  'al-xlpe': { value: 94, label: 'Al 도체 / XLPE 절연' },
};

export default function KECGroundingPage() {
  const t = useTranslations('KECGrounding');
  const [activeTab, setActiveTab] = useState<'method-a' | 'method-b'>('method-a');
  const [phaseConductor, setPhaseConductor] = useState<string>('');
  const [resultA, setResultA] = useState<number | null>(null);
  const [faultCurrent, setFaultCurrent] = useState<string>('');
  const [breakTime, setBreakTime] = useState<string>('');
  const [kValue, setKValue] = useState<string>('cu-pvc');
  const [resultB, setResultB] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f8fafc, #e0f2fe, #f8fafc)' }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '2rem 1rem' }}>
        <NavigationActions />

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>⚡ {t('title')}</h1>
          <p style={{ color: '#64748b' }}>{t('subtitle')}</p>
        </div>

        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>🧮 {t('calculatorTitle')}</h2>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0' }}>
            <button onClick={() => setActiveTab('method-a')} style={{ padding: '0.75rem 1.5rem', border: 'none', background: activeTab === 'method-a' ? '#3b82f6' : 'transparent', color: activeTab === 'method-a' ? 'white' : '#64748b', borderRadius: '0.5rem 0.5rem 0 0', cursor: 'pointer', fontWeight: '600' }}>{t('tabA')}</button>
            <button onClick={() => setActiveTab('method-b')} style={{ padding: '0.75rem 1.5rem', border: 'none', background: activeTab === 'method-b' ? '#3b82f6' : 'transparent', color: activeTab === 'method-b' ? 'white' : '#64748b', borderRadius: '0.5rem 0.5rem 0 0', cursor: 'pointer', fontWeight: '600' }}>{t('tabB')}</button>
          </div>

          {activeTab === 'method-a' && (
            <div>
              <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#1e40af' }}>
                <strong>📌 {t('tabAInfo')}</strong>
                <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  <li>S ≤ 16㎟ → {t('tabARule1')}</li>
                  <li>16㎟ &lt; S ≤ 35㎟ → {t('tabARule2')}</li>
                  <li>S &gt; 35㎟ → {t('tabARule3')}</li>
                </ul>
              </div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('phaseConductorLabel')}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="number" placeholder="16" value={phaseConductor} onChange={(e) => handlePhaseConductorChange(e.target.value)} min="0" step="0.1" style={{ flex: 1, padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} />
                <div style={{ padding: '0.75rem 1rem', background: '#f1f5f9', borderRadius: '0.5rem', fontWeight: '500' }}>㎟</div>
              </div>
            </div>
          )}

          {activeTab === 'method-b' && (
            <div>
              <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#92400e' }}>
                <strong>📌 {t('tabBInfo')}</strong>
                <p style={{ fontFamily: 'monospace', marginTop: '0.5rem' }}>S = √(I² × t) / k</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('faultCurrentLabel')}</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" placeholder="1000" value={faultCurrent} onChange={(e) => setFaultCurrent(e.target.value)} style={{ flex: 1, padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} />
                    <div style={{ padding: '0.75rem 1rem', background: '#f1f5f9', borderRadius: '0.5rem' }}>A (RMS)</div>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('breakTimeLabel')}</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" placeholder="1" value={breakTime} onChange={(e) => setBreakTime(e.target.value)} style={{ flex: 1, padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} />
                    <div style={{ padding: '0.75rem 1rem', background: '#f1f5f9', borderRadius: '0.5rem' }}>{t('seconds')}</div>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('kValueLabel')}</label>
                  <select value={kValue} onChange={(e) => setKValue(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: 'white' }}>
                    {Object.entries(K_VALUES).map(([key, data]) => <option key={key} value={key}>{data.label} (k = {data.value})</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {activeResult !== null && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '2rem', border: '2px solid #3b82f6' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>✓ {t('resultTitle')}</h2>
            <div style={{ textAlign: 'center', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>{t('theoreticalMin')}</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#475569' }}>{activeResult.toFixed(2)} ㎟</p>
            </div>
            <div style={{ textAlign: 'center', background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)', color: 'white', borderRadius: '1rem', padding: '2rem' }}>
              <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>{t('recommendedSize')}</p>
              <p style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{recommendedSize}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>SQ (㎟)</p>
              <p style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.3)' }}>{t('standardCableNote')}</p>
            </div>
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '0.5rem', padding: '1rem', marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{t('warningTitle')}</p>
                <p>{t('warningText')}</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>{t('recommendedTools')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[1,2,3].map(n => <a key={n} href="#" style={{ background: 'white', borderRadius: '1rem', padding: '1rem', boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)', textDecoration: 'none' }}><div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{n===1?'⚡':n===2?'🔌':'📊'}</div><h4 style={{ fontWeight: 'bold', color: '#1e293b' }}>{t(`tool${n}`)}</h4></a>)}
          </div>
        </div>

        <div style={{ width: '100%', minHeight: '90px', background: 'rgba(241, 245, 249, 0.5)', border: '2px dashed #cbd5e1', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.875rem', margin: '2rem 0' }}>{t('adPlaceholder')}</div>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '0.75rem', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{t('section1Title')}</h2>
          <div style={{ color: '#64748b', lineHeight: 1.7 }}>
            <p style={{ marginBottom: '0.75rem' }}>{t('section1Para1')}</p>
            <p style={{ marginBottom: '0.75rem' }}>{t('section1Para2')}</p>
            <p>{t('section1Para3')}</p>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '0.75rem', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{t('section2Title')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[1,2,3,4].map(n => <div key={n} style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)' }}><div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{n===1?'🏗️':n===2?'🏭':n===3?'📐':'🎓'}</div><h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{t(`useCase${n}Title`)}</h3><p style={{ fontSize: '0.875rem', color: '#64748b' }}>{t(`useCase${n}Desc`)}</p></div>)}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '0.75rem', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{t('section3Title')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1,2,3,4].map(s => <div key={s} style={{ display: 'flex', gap: '1rem' }}><div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>{s}</div><div><h3 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{t(`step${s}Title`)}</h3><p style={{ color: '#64748b' }}>{t(`step${s}Desc`)}</p></div></div>)}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '0.75rem', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{t('section4Title')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[1,2,3,4,5].map(n => <div key={n} style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem', background: 'white' }}><button onClick={() => setExpandedFaq(expandedFaq === n ? null : n)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: '500' }}><span><strong style={{ color: '#3b82f6' }}>Q.</strong> {t(`faq${n}Q`)}</span><span style={{ fontSize: '1.25rem' }}>{expandedFaq === n ? '−' : '+'}</span></button>{expandedFaq === n && <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', color: '#64748b' }}><strong style={{ color: '#3b82f6' }}>A.</strong> {t(`faq${n}A`)}</div>}</div>)}
          </div>
          <div style={{ marginTop: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#475569' }}><strong>{t('disclaimerTitle')}</strong><br />{t('disclaimerText')}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
