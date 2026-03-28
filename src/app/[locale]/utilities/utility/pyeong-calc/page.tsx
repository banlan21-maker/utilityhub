'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useCallback } from 'react';
import { Ruler } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';

/* 1 평 = 3.30579 m² (법정 환산 계수) */
const PYEONG_TO_SQM = 3.30579;

/* 아파트 표준 전용면적 프리셋 */
interface Preset {
  sqm: number;
  nameKo: string;
  nameEn: string;
}
const PRESETS: Preset[] = [
  { sqm: 33,  nameKo: '10평형',  nameEn: '10 pyeong' },
  { sqm: 49,  nameKo: '15평형',  nameEn: '15 pyeong' },
  { sqm: 59,  nameKo: '59㎡ (17.8평)', nameEn: '59㎡ (17.8 py)' },
  { sqm: 74,  nameKo: '74㎡ (22.4평)', nameEn: '74㎡ (22.4 py)' },
  { sqm: 84,  nameKo: '84㎡ (25.4평)', nameEn: '84㎡ (25.4 py)' },
  { sqm: 102, nameKo: '102㎡ (30.9평)', nameEn: '102㎡ (30.9 py)' },
  { sqm: 115, nameKo: '115㎡ (34.8평)', nameEn: '115㎡ (34.8 py)' },
  { sqm: 135, nameKo: '135㎡ (40.8평)', nameEn: '135㎡ (40.8 py)' },
  { sqm: 165, nameKo: '165㎡ (49.9평)', nameEn: '165㎡ (49.9 py)' },
];

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);
  return (
    <button
      onClick={copy}
      style={{
        padding: '0.3rem 0.75rem',
        fontSize: '0.78rem',
        fontWeight: 600,
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        background: copied ? 'var(--primary)' : 'var(--surface-hover)',
        color: copied ? '#fff' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {copied ? '✓ 복사됨' : '📋 복사'}
    </button>
  );
}

type Direction = 'pyeong2sqm' | 'sqm2pyeong';

export default function AreaPage() {
  const t = useTranslations('Area');
  const locale = useLocale();

  const [direction, setDirection] = useState<Direction>('sqm2pyeong');
  const [inputVal, setInputVal] = useState('');
  const [decimals, setDecimals] = useState(2);

  const num = parseFloat(inputVal) || 0;

  const sqm    = direction === 'sqm2pyeong' ? num : num * PYEONG_TO_SQM;
  const pyeong = direction === 'pyeong2sqm' ? num : num / PYEONG_TO_SQM;

  const fmtNum = (n: number) => n.toFixed(decimals);

  const resultSqm    = fmtNum(sqm);
  const resultPyeong = fmtNum(pyeong);

  const hasResult = num > 0;

  /* 가장 가까운 아파트 프리셋 */
  const nearestPreset = hasResult
    ? PRESETS.reduce((best, p) =>
        Math.abs(p.sqm - sqm) < Math.abs(best.sqm - sqm) ? p : best
      )
    : null;

  const handlePreset = (p: Preset) => {
    if (direction === 'sqm2pyeong') {
      setInputVal(String(p.sqm));
    } else {
      setInputVal(fmtNum(p.sqm / PYEONG_TO_SQM));
    }
  };

  return (
    <div>
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
          <Ruler size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('description')}</p>
      </header>

      <div className="glass-panel" style={{ padding: 'var(--page-padding)', maxWidth: '520px', margin: '0 auto' }}>

        {/* Direction toggle */}
        <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '1.5rem' }}>
          {(['sqm2pyeong', 'pyeong2sqm'] as Direction[]).map(d => (
            <button
              key={d}
              onClick={() => { setDirection(d); setInputVal(''); }}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                border: 'none',
                background: direction === d ? 'var(--primary)' : 'transparent',
                color: direction === d ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {d === 'sqm2pyeong' ? `㎡ → ${t('unit.pyeong')}` : `${t('unit.pyeong')} → ㎡`}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {direction === 'sqm2pyeong' ? t('label.sqm') : t('label.pyeong')}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              inputMode="decimal"
              placeholder={direction === 'sqm2pyeong' ? '84' : '25.4'}
              value={inputVal}
              onChange={e => setInputVal(e.target.value.replace(/[^0-9.]/g, ''))}
              style={{
                width: '100%',
                padding: '0.9rem 3.5rem 0.9rem 1rem',
                fontSize: '1.4rem',
                fontWeight: 700,
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem' }}>
              {direction === 'sqm2pyeong' ? '㎡' : t('unit.pyeong')}
            </span>
          </div>
        </div>

        {/* Decimal precision */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {t('label.decimals')}
          </span>
          {[0, 1, 2, 3, 4].map(d => (
            <button
              key={d}
              onClick={() => setDecimals(d)}
              style={{
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid',
                borderColor: decimals === d ? 'var(--primary)' : 'var(--border)',
                background: decimals === d ? 'rgba(79,70,229,0.1)' : 'var(--surface)',
                color: decimals === d ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Preset buttons */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            {t('label.presets')}
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {PRESETS.map(p => (
              <button
                key={p.sqm}
                onClick={() => handlePreset(p)}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: nearestPreset?.sqm === p.sqm && hasResult ? 'rgba(79,70,229,0.1)' : 'var(--surface-hover)',
                  borderColor: nearestPreset?.sqm === p.sqm && hasResult ? 'var(--primary)' : 'var(--border)',
                  color: nearestPreset?.sqm === p.sqm && hasResult ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {locale === 'ko' ? p.nameKo : p.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {hasResult && (
          <div style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ background: 'var(--primary)', padding: '0.7rem 1.25rem' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}>{t('result.title')}</span>
            </div>

            <div style={{ background: 'var(--surface)' }}>
              {/* Primary result */}
              <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, rgba(79,70,229,0.07), rgba(16,185,129,0.07))' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  {direction === 'sqm2pyeong'
                    ? `${inputVal} ㎡ =`
                    : `${inputVal} ${t('unit.pyeong')} =`}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-1px' }}>
                      {direction === 'sqm2pyeong' ? resultPyeong : resultSqm}
                    </span>
                    <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600, marginLeft: '0.4rem' }}>
                      {direction === 'sqm2pyeong' ? t('unit.pyeong') : '㎡'}
                    </span>
                  </div>
                  <CopyButton value={direction === 'sqm2pyeong' ? resultPyeong : resultSqm} />
                </div>
              </div>

              {/* Reverse reference */}
              <div style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  {direction === 'sqm2pyeong' ? `${t('result.ref')} (㎡)` : `${t('result.ref')} (${t('unit.pyeong')})`}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {direction === 'sqm2pyeong' ? `${resultSqm} ㎡` : `${resultPyeong} ${t('unit.pyeong')}`}
                  </span>
                  <CopyButton value={direction === 'sqm2pyeong' ? resultSqm : resultPyeong} />
                </div>
              </div>

              {/* Nearest preset match */}
              {nearestPreset && (
                <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(245,158,11,0.06)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>🏠 {t('result.nearest')}</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {locale === 'ko' ? nearestPreset.nameKo : nearestPreset.nameEn}
                    {' '}({nearestPreset.sqm}㎡ ≈ {fmtNum(nearestPreset.sqm / PYEONG_TO_SQM)}{t('unit.pyeong')})
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conversion table */}
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
            {t('table.title')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', fontSize: '0.82rem' }}>
            <div style={{ padding: '0.5rem 0.75rem', background: 'var(--surface-hover)', fontWeight: 700, color: 'var(--text-muted)' }}>㎡</div>
            <div style={{ padding: '0.5rem 0.75rem', background: 'var(--surface-hover)', fontWeight: 700, color: 'var(--text-muted)' }}>{t('unit.pyeong')}</div>
            {[33, 49, 59, 74, 84, 102, 115, 135, 165].map(s => (
              <>
                <div key={`s${s}`} style={{ padding: '0.45rem 0.75rem', borderTop: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 500 }}>{s} ㎡</div>
                <div key={`p${s}`} style={{ padding: '0.45rem 0.75rem', borderTop: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 600 }}>{(s / PYEONG_TO_SQM).toFixed(1)} {t('unit.pyeong')}</div>
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Ad placeholder */}
      <div style={{ maxWidth: '520px', margin: '1.5rem auto 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '300px', height: '250px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📢</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>광고 영역</span>
          <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>300 × 250</span>
        </div>
      </div>

      <RelatedTools toolId="utilities/area" />

      <SeoSection
        ko={{
          title: '평수-제곱미터(㎡) 변환기란 무엇인가요?',
          description: '평(坪)은 한국·일본에서 사용하는 전통 면적 단위로, 1평은 약 3.30579㎡에 해당합니다. 아파트, 오피스텔, 상가 등 부동산 매물을 볼 때 공급면적, 전용면적이 ㎡로 표기되어 있어 직관적으로 이해하기 어렵습니다. 이 변환기는 ㎡를 평으로, 평을 ㎡로 즉시 변환하며, 59㎡·84㎡ 등 아파트 표준 전용면적 프리셋과 소수점 자리수 조절 기능을 제공해 부동산 거래에 필요한 면적 계산을 빠르게 처리합니다.',
          useCases: [
            { icon: '🏠', title: '아파트 전용면적 파악', desc: '59㎡, 84㎡ 등 흔히 표기되는 전용면적이 실제 몇 평인지 즉시 확인합니다.' },
            { icon: '🏢', title: '상가·오피스 면적 계산', desc: '임대차 계약서의 ㎡ 기준 면적을 평으로 환산해 평당 임대료를 계산합니다.' },
            { icon: '🌐', title: '해외 부동산 비교', desc: '㎡ 단위로 표기되는 해외 부동산 매물을 평 기준으로 변환해 국내 기준으로 비교합니다.' },
            { icon: '📐', title: '인테리어·리모델링 설계', desc: '시공 면적을 평과 ㎡로 동시 확인해 자재 발주량이나 단가 계산에 활용합니다.' },
          ],
          steps: [
            { step: '변환 방향 선택', desc: '㎡ → 평 또는 평 → ㎡ 방향을 선택합니다.' },
            { step: '면적 입력 또는 프리셋 선택', desc: '숫자를 직접 입력하거나, 59㎡·84㎡ 등 아파트 표준 프리셋 버튼을 클릭합니다.' },
            { step: '결과 확인 및 복사', desc: '변환 결과가 즉시 표시됩니다. 소수점 자리수를 조절하고, 복사 버튼으로 결과를 가져가세요.' },
          ],
          faqs: [
            { q: '1평은 몇 ㎡인가요?', a: '1평은 정확히 3.30578512㎡이며, 통상 3.3058㎡로 계산합니다. 법적으로는 1평 = 400/121㎡(약 3.30579㎡)로 정의됩니다.' },
            { q: '아파트 전용면적 84㎡는 몇 평인가요?', a: '84 ÷ 3.30579 ≈ 25.4평입니다. 흔히 "25평형 아파트"라고 부르는 평형입니다.' },
            { q: '공급면적과 전용면적의 차이는 무엇인가요?', a: '전용면적은 현관문 안쪽 실내 면적만을 의미하고, 공급면적은 전용면적에 계단·복도 등 공용 면적(주거공용면적)을 합산한 면적입니다.' },
          ],
        }}
        en={{
          title: 'What is a Pyeong to Square Meter (㎡) Converter?',
          description: 'Pyeong (평) is a traditional area unit used in South Korea and Japan. One pyeong equals approximately 3.30579 m². Real estate listings in Korea display apartment sizes in ㎡ (exclusive area), which can be hard to visualize for those accustomed to pyeong. This converter instantly switches between ㎡ and pyeong, offers preset buttons for standard apartment sizes (59㎡, 84㎡, etc.), and lets you control decimal precision — everything you need for property research and transactions.',
          useCases: [
            { icon: '🏠', title: 'Apartment Size Check', desc: 'Instantly convert 59㎡, 84㎡, and other common exclusive areas into pyeong to understand actual living space.' },
            { icon: '🏢', title: 'Commercial Lease Calculation', desc: 'Convert ㎡-based lease areas to pyeong to calculate per-pyeong rent and compare locations.' },
            { icon: '🌐', title: 'Overseas Property Comparison', desc: 'Convert international property listings from m² into pyeong for familiar Korean-market comparison.' },
            { icon: '📐', title: 'Interior & Renovation Planning', desc: 'View construction areas in both units simultaneously for accurate material ordering and cost estimation.' },
          ],
          steps: [
            { step: 'Choose Conversion Direction', desc: 'Select ㎡ → pyeong or pyeong → ㎡ using the toggle at the top.' },
            { step: 'Enter Area or Select Preset', desc: 'Type in a value manually or click a preset button for standard apartment sizes like 59㎡ or 84㎡.' },
            { step: 'View Result & Copy', desc: 'The converted value appears instantly. Adjust decimal places as needed and copy the result with one click.' },
          ],
          faqs: [
            { q: 'How many square meters is one pyeong?', a: 'One pyeong equals exactly 400/121 m² ≈ 3.30579 m². In practice, 3.3058 m² is commonly used for calculations.' },
            { q: 'How many pyeong is an 84㎡ apartment?', a: '84 ÷ 3.30579 ≈ 25.4 pyeong. This is commonly referred to as a "25-pyeong apartment" in Korea.' },
            { q: 'What is the difference between exclusive area and supply area?', a: 'Exclusive area (전용면적) covers only the interior of your unit. Supply area (공급면적) adds shared spaces like hallways and stairwells.' },
          ],
        }}
      />
    </div>
  );
}
