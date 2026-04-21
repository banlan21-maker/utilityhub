'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Zap } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './kec-grounding.module.css';

// --- JSON-LD Schemas ---
const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "KEC 접지선 굵기 계산기",
  "alternateName": "KEC Grounding Conductor Calculator",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/dev/kec-grounding",
  "description": "한국전기설비규정(KEC) 143조 기준으로 접지선 최소 단면적을 자동 계산하는 전기 설계 전문가용 무료 온라인 도구입니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "KEC 143조 접지선 굵기 기준이란 무엇인가요?", "acceptedAnswer": { "@type": "Answer", "text": "한국전기설비규정(KEC) 143조는 보호접지도체의 최소 단면적을 규정합니다. 상 도체 단면적 S가 16㎟ 이하이면 접지선 = S, 16~35㎟ 이면 접지선 = 16㎟, 35㎟ 초과이면 접지선 = S/2로 선정합니다." } },
    { "@type": "Question", "name": "열 단락 계산법(방법 B)은 언제 사용하나요?", "acceptedAnswer": { "@type": "Answer", "text": "단락전류 크기와 차단 시간을 알고 있을 때, S = √(I²×t)/k 공식으로 접지선 굵기를 정밀 계산합니다. 고장전류가 크거나 차단 시간이 긴 특수 환경에서 방법 A보다 더 작은 단면적을 선정할 수 있어 경제적입니다." } },
    { "@type": "Question", "name": "k값은 어떻게 결정하나요?", "acceptedAnswer": { "@type": "Answer", "text": "k값은 도체 재질(구리/알루미늄)과 절연 종류(PVC/XLPE)에 따라 다릅니다. Cu/PVC=115, Cu/XLPE=143, Al/PVC=76, Al/XLPE=94를 사용하며, 본 도구에서 드롭다운으로 선택할 수 있습니다." } },
    { "@type": "Question", "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." } }
  ]
};

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className={s.page_container}>
        <NavigationActions />

        <header className={s.header}>
          <div className={s.icon_wrap}>
            <Zap size={40} color="#8b5cf6" />
          </div>
          <h1 className={s.title}>{t('title')}</h1>
          <p className={s.subtitle}>{t('subtitle')}</p>
        </header>

        <div className={`glass-panel ${s.panel}`}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>🧮 {t('calculatorTitle')}</h2>

          <div className={s.tab_bar}>
            <button
              onClick={() => setActiveTab('method-a')}
              className={`${s.tab_btn} ${activeTab === 'method-a' ? s.tab_btn_active : s.tab_btn_inactive}`}
              aria-label={t('tabA')}
            >{t('tabA')}</button>
            <button
              onClick={() => setActiveTab('method-b')}
              className={`${s.tab_btn} ${activeTab === 'method-b' ? s.tab_btn_active : s.tab_btn_inactive}`}
              aria-label={t('tabB')}
            >{t('tabB')}</button>
          </div>

          {activeTab === 'method-a' && (
            <div>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                <strong>📌 {t('tabAInfo')}</strong>
                <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  <li>S ≤ 16㎟ → {t('tabARule1')}</li>
                  <li>16㎟ &lt; S ≤ 35㎟ → {t('tabARule2')}</li>
                  <li>S &gt; 35㎟ → {t('tabARule3')}</li>
                </ul>
              </div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>{t('phaseConductorLabel')}</label>
              <div className={s.input_row}>
                <input type="number" placeholder="16" value={phaseConductor} onChange={(e) => handlePhaseConductorChange(e.target.value)} min="0" step="0.1" className={s.input_field} />
                <div className={s.unit_badge}>㎟</div>
              </div>
            </div>
          )}

          {activeTab === 'method-b' && (
            <div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                <strong>📌 {t('tabBInfo')}</strong>
                <p style={{ fontFamily: 'monospace', marginTop: '0.5rem' }}>S = √(I² × t) / k</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>{t('faultCurrentLabel')}</label>
                  <div className={s.input_row}>
                    <input type="number" placeholder="1000" value={faultCurrent} onChange={(e) => setFaultCurrent(e.target.value)} className={s.input_field} />
                    <div className={s.unit_badge}>A (RMS)</div>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>{t('breakTimeLabel')}</label>
                  <div className={s.input_row}>
                    <input type="number" placeholder="1" value={breakTime} onChange={(e) => setBreakTime(e.target.value)} className={s.input_field} />
                    <div className={s.unit_badge}>{t('seconds')}</div>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>{t('kValueLabel')}</label>
                  <select value={kValue} onChange={(e) => setKValue(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    {Object.entries(K_VALUES).map(([key, data]) => <option key={key} value={key}>{data.label} (k = {data.value})</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {activeResult !== null && (
          <div className="glass-panel" style={{ borderRadius: '1rem', padding: '2rem', marginBottom: '2rem', border: '2px solid #3b82f6' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>✓ {t('resultTitle')}</h2>
            <div style={{ textAlign: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('theoreticalMin')}</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{activeResult.toFixed(2)} ㎟</p>
            </div>
            <div style={{ textAlign: 'center', background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)', color: 'white', borderRadius: '1rem', padding: '2rem' }}>
              <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>{t('recommendedSize')}</p>
              <p className={s.result_number}>{recommendedSize}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>SQ (㎟)</p>
              <p style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.3)' }}>{t('standardCableNote')}</p>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '0.5rem', padding: '1rem', marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
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

        {/* 광고 영역 */}
        <div style={{
          width: '100%',
          minHeight: '90px',
          background: 'rgba(226, 232, 240, 0.3)',
          border: '1px dashed #cbd5e1',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontSize: '0.875rem',
          margin: '2rem 0'
        }}>광고 영역</div>

        <SeoSection
          ko={{
            title: 'KEC 접지선 굵기 계산기란 무엇인가요?',
            description: '한국전기설비규정(KEC) 143조는 전기 설비에서 감전 사고를 방지하기 위한 보호접지도체(접지선)의 최소 단면적을 규정합니다. 이 계산기는 KEC 143조의 두 가지 산정 방법을 모두 지원합니다. 방법 A(비례법)는 상 도체 굵기를 기준으로 접지선 최소 굵기를 즉시 산출하며, 방법 B(열 단락 계산법)는 S = √(I²×t)/k 공식에 고장전류(A), 차단 시간(초), 도체·절연 재질별 k값을 적용해 정밀하게 계산합니다. 계산 결과는 실제 시장에서 유통되는 표준 SQ(공칭 단면적)로 자동 올림하여 제시하므로, 현장에서 즉시 자재를 선정할 수 있습니다. 전기공학 설계자, 전기기사 시험 준비생, 현장 시공 기술자 모두에게 유용한 전문 도구입니다.',
            useCases: [
              { icon: '🏗️', title: '신축 건물 전기 설계', desc: '설계도 작성 시 분전반별 상 도체 굵기를 기준으로 KEC 143조 방법 A를 적용해 각 회로의 보호접지도체 굵기를 일괄 산출합니다.' },
              { icon: '🏭', title: '산업 설비 고장 전류 계산', desc: '변압기 2차측 단락전류와 차단기 동작 시간, 케이블 재질(Cu/Al, PVC/XLPE)을 입력해 방법 B로 정밀한 접지선 굵기를 계산합니다.' },
              { icon: '📐', title: '전기기사 시험 준비', desc: 'KEC 143조 접지선 굵기 계산 공식(방법 A·B)을 실제 입력값으로 검증하며 시험에 나오는 계산 유형을 반복 학습합니다.' },
              { icon: '🎓', title: '현장 시공 및 감리', desc: '시공 현장에서 기존 설계의 접지선 굵기 적정성을 빠르게 검토하고, 변경 사항 발생 시 즉시 재계산하여 규정 준수 여부를 확인합니다.' },
            ],
            steps: [
              { step: '계산 방법 선택', desc: '상단 탭에서 [방법 A (비례법)] 또는 [방법 B (열 단락 계산법)]를 선택합니다. 단락전류 데이터가 없으면 방법 A, 정밀 계산이 필요하면 방법 B를 사용합니다.' },
              { step: '입력값 입력', desc: '방법 A에서는 상 도체 단면적(㎟)을 입력합니다. 방법 B에서는 고장전류(A, RMS), 차단기 동작 시간(초), 케이블 도체·절연 재질(Cu/PVC, Cu/XLPE, Al/PVC, Al/XLPE)을 선택합니다.' },
              { step: '계산 결과 확인', desc: '이론 최솟값(㎟)과 실제 시장 표준 SQ로 올림된 추천 굵기가 표시됩니다. 추천 굵기는 KEC 143조를 만족하는 가장 경제적인 최소 규격입니다.' },
              { step: '자재 선정 및 적용', desc: '계산된 추천 SQ를 설계 도면에 반영하거나 자재 발주 시 기준으로 활용합니다. 반드시 해당 설비의 관할 전기안전공사 및 감리자와 최종 확인하시기 바랍니다.' },
            ],
            faqs: [
              { q: 'KEC 143조 접지선 굵기 기준이란 무엇인가요?', a: '한국전기설비규정(KEC) 143조는 보호접지도체의 최소 단면적을 규정합니다. 상 도체 단면적 S가 16㎟ 이하이면 접지선 = S, 16~35㎟이면 접지선 = 16㎟, 35㎟ 초과이면 접지선 = S/2로 선정합니다. 이 기준은 IEC 60364-5-54를 근거로 하며, 고장 시 발생하는 열에너지로부터 도체를 보호하기 위해 설정된 최솟값입니다.' },
              { q: '열 단락 계산법(방법 B)은 언제 사용하나요?', a: '단락전류 크기와 차단 시간을 알고 있을 때 S = √(I²×t)/k 공식으로 접지선 굵기를 정밀 계산합니다. 고장전류가 크거나 차단 시간이 긴 특수 환경, 또는 경제성을 위해 방법 A보다 작은 단면적을 선정하고 싶을 때 적용합니다.' },
              { q: 'k값은 어떻게 결정하나요?', a: 'k값은 도체 재질(구리/알루미늄)과 절연 종류(PVC/XLPE)에 따라 달라집니다. Cu/PVC = 115, Cu/XLPE = 143, Al/PVC = 76, Al/XLPE = 94의 값을 사용합니다. 이 값은 KEC 143조 및 IEC 60364-5-54의 부속서 B 표에서 규정하며, 본 도구 드롭다운에서 선택할 수 있습니다.' },
              { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
            ],
          }}
          en={{
            title: 'What is the KEC Grounding Conductor Calculator?',
            description: 'Article 143 of the Korean Electrical Code (KEC) specifies the minimum cross-sectional area of protective earthing conductors (grounding wires) required to prevent electric shock in electrical installations. This calculator supports both calculation methods defined in KEC 143. Method A (proportional) instantly determines the minimum grounding conductor size based on the phase conductor cross-section. Method B (adiabatic equation) applies the formula S = √(I²×t)/k, using fault current (A), disconnection time (s), and a material-dependent k-factor for copper or aluminum conductors with PVC or XLPE insulation. Results are automatically rounded up to the nearest standard cable cross-section (SQ) available in the market, allowing immediate material procurement. This tool is designed for electrical engineers, electrician exam candidates, and on-site construction technicians.',
            useCases: [
              { icon: '🏗️', title: 'New Building Electrical Design', desc: 'Apply KEC 143 Method A across all circuits in a distribution panel to determine grounding wire sizes in bulk during the design phase.' },
              { icon: '🏭', title: 'Industrial Fault Current Calculation', desc: 'Enter transformer secondary short-circuit current, breaker trip time, and cable material to precisely calculate grounding conductor size using Method B.' },
              { icon: '📐', title: 'Electrician Exam Preparation', desc: 'Verify KEC 143 grounding calculations (Method A and B) with real input values to practice the formula types that appear on the exam.' },
              { icon: '🎓', title: 'On-Site Construction & Inspection', desc: 'Quickly verify the adequacy of grounding conductor sizes on-site and recalculate immediately when design changes occur to ensure code compliance.' },
            ],
            steps: [
              { step: 'Select Calculation Method', desc: 'Choose Method A (proportional) from the top tab if you only know the phase conductor size, or Method B (adiabatic) if you have fault current and disconnection time data.' },
              { step: 'Enter Input Values', desc: 'For Method A, enter the phase conductor cross-section in mm². For Method B, enter fault current (A, RMS), disconnection time (seconds), and select the cable material combination (Cu/PVC, Cu/XLPE, Al/PVC, or Al/XLPE).' },
              { step: 'Review Results', desc: 'The theoretical minimum size and the recommended standard SQ size (rounded up to the nearest commercially available cable) are displayed. The recommended size is the most economical minimum that satisfies KEC 143.' },
              { step: 'Apply to Design', desc: 'Incorporate the recommended SQ into your electrical drawings or material orders. Always verify the final specification with the supervising electrical engineer and local authority.' },
            ],
            faqs: [
              { q: 'What is the KEC Article 143 grounding conductor standard?', a: 'KEC Article 143 (based on IEC 60364-5-54) specifies minimum protective earthing conductor cross-sections: if phase conductor S ≤ 16mm², grounding = S; if 16mm² < S ≤ 35mm², grounding = 16mm²; if S > 35mm², grounding = S/2. These minimums protect the conductor from heat damage during a fault.' },
              { q: 'When should I use the adiabatic equation (Method B)?', a: 'Use Method B when you know the prospective fault current and the disconnection time of the protective device. The formula S = √(I²×t)/k may yield a smaller cross-section than Method A, offering a more economical solution for circuits with large fault currents or short disconnection times.' },
              { q: 'How is the k-factor determined?', a: 'The k-factor depends on conductor material and insulation type as defined in KEC 143 and IEC 60364-5-54 Annex B: Cu/PVC = 115, Cu/XLPE = 143, Al/PVC = 76, Al/XLPE = 94. Select the appropriate combination from the dropdown in this tool.' },
              { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
            ],
          }}
        />
      </div>
    </div>
  );
}
