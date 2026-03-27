'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';

type InterestType = 'simple' | 'compound';
type Period = 'year' | 'month' | 'day';
type CompoundFreq = 1 | 2 | 4 | 12 | 365;

const FREQ_OPTIONS: { value: CompoundFreq; labelKey: string }[] = [
  { value: 1, labelKey: 'freq.yearly' },
  { value: 2, labelKey: 'freq.semiannual' },
  { value: 4, labelKey: 'freq.quarterly' },
  { value: 12, labelKey: 'freq.monthly' },
  { value: 365, labelKey: 'freq.daily' },
];

function InputField({ label, value, onChange, suffix, note }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  note?: string;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        <span>{label}</span>
        {note && <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.7 }}>{note}</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
          style={{
            width: '100%',
            padding: `0.8rem ${suffix ? '3rem' : '1rem'} 0.8rem 1rem`,
            fontSize: '1.1rem',
            fontWeight: 600,
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
        {suffix && (
          <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

function YearBar({ year, total, maxTotal }: { year: number; total: number; maxTotal: number }) {
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const fmt = (n: number) => Math.round(n).toLocaleString('ko-KR');
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
        <span>{year}년차</span>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(total)}원</span>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--primary), #10b981)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}

export default function InterestPage() {
  const t = useTranslations('Interest');
  const [type, setType] = useState<InterestType>('compound');
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [duration, setDuration] = useState('');
  const [period, setPeriod] = useState<Period>('year');
  const [freq, setFreq] = useState<CompoundFreq>(12);

  const fmt = (n: number) => Math.round(n).toLocaleString('ko-KR');

  // Convert duration to years
  const durationYears = useMemo(() => {
    const d = parseFloat(duration) || 0;
    if (period === 'year') return d;
    if (period === 'month') return d / 12;
    return d / 365;
  }, [duration, period]);

  const p = parseFloat(principal) || 0;
  const r = (parseFloat(rate) || 0) / 100;
  const t_years = durationYears;

  const simpleInterest = p * r * t_years;
  const simpleTotal = p + simpleInterest;

  const compoundTotal = p * Math.pow(1 + r / freq, freq * t_years);
  const compoundInterest = compoundTotal - p;

  const interest = type === 'simple' ? simpleInterest : compoundInterest;
  const total = type === 'simple' ? simpleTotal : compoundTotal;
  const effectiveYears = Math.ceil(t_years);

  // Year-by-year breakdown (up to 30 years)
  const yearlyData = useMemo(() => {
    if (p <= 0 || r <= 0 || t_years <= 0) return [];
    const maxYears = Math.min(Math.ceil(t_years), 30);
    return Array.from({ length: maxYears }, (_, i) => {
      const y = i + 1;
      const val = type === 'simple'
        ? p + p * r * Math.min(y, t_years)
        : p * Math.pow(1 + r / freq, freq * Math.min(y, t_years));
      return { year: y, total: val };
    });
  }, [p, r, t_years, type, freq]);

  const maxTotal = yearlyData.length ? yearlyData[yearlyData.length - 1].total : 0;
  const hasResult = p > 0 && r > 0 && t_years > 0;


  const periods: { id: Period; label: string }[] = [
    { id: 'year', label: t('period.year') },
    { id: 'month', label: t('period.month') },
    { id: 'day', label: t('period.day') },
  ];

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('description')}</p>
      </header>

      <div className="glass-panel" style={{ padding: 'var(--page-padding)', maxWidth: '520px', margin: '0 auto' }}>

        {/* Type toggle */}
        <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '1.5rem' }}>
          {(['simple', 'compound'] as InterestType[]).map(tp => (
            <button
              key={tp}
              onClick={() => setType(tp)}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                border: 'none',
                background: type === tp ? 'var(--primary)' : 'transparent',
                color: type === tp ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tp === 'simple' ? `📐 ${t('type.simple')}` : `📈 ${t('type.compound')}`}
            </button>
          ))}
        </div>

        <InputField label={t('label.principal')} value={principal} onChange={setPrincipal} suffix="원" note={t('note.principal')} />
        <InputField label={t('label.rate')} value={rate} onChange={setRate} suffix="%" note={t('note.rate')} />

        {/* Duration + period */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('label.duration')}
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                inputMode="decimal"
                value={duration}
                onChange={e => setDuration(e.target.value.replace(/[^0-9.]/g, ''))}
                style={{ width: '100%', padding: '0.8rem 1rem', fontSize: '1.1rem', fontWeight: 600, border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {periods.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  style={{
                    padding: '0 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid',
                    borderColor: period === p.id ? 'var(--primary)' : 'var(--border)',
                    background: period === p.id ? 'var(--primary)' : 'var(--surface)',
                    color: period === p.id ? '#fff' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compound frequency */}
        {type === 'compound' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('label.compoundFreq')}
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {FREQ_OPTIONS.map(fo => (
                <button
                  key={fo.value}
                  onClick={() => setFreq(fo.value)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid',
                    borderColor: freq === fo.value ? 'var(--primary)' : 'var(--border)',
                    background: freq === fo.value ? 'rgba(79,70,229,0.1)' : 'var(--surface)',
                    color: freq === fo.value ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {t(fo.labelKey)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result summary */}
        {hasResult && (
          <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(16,185,129,0.08))', border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{t('result.principal')}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(p)}원</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{t('result.interest')}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>+{fmt(interest)}원</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{t('result.total')}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-1px' }}>{fmt(total)}원</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                {t('result.effectiveRate', { rate: (interest / p * 100).toFixed(2) })}
              </div>
            </div>
          </div>
        )}

        {/* Compound vs Simple comparison */}
        {hasResult && type === 'compound' && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-hover)', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('result.vsSimple')}</span>
            <span style={{ fontWeight: 700, color: '#10b981' }}>+{fmt(compoundInterest - simpleInterest)}원</span>
          </div>
        )}

        {/* Yearly breakdown chart */}
        {hasResult && yearlyData.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              {t('result.yearlyBreakdown')}
            </p>
            {yearlyData.map(d => (
              <YearBar key={d.year} year={d.year} total={d.total} maxTotal={maxTotal} />
            ))}
          </div>
        )}
      </div>

      <RelatedTools toolId="fintech/interest" />

      {/* Ad placeholder */}
      <div style={{ maxWidth: '520px', margin: '1.5rem auto 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '300px', height: '250px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📢</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>광고 영역</span>
          <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>300 × 250</span>
        </div>
      </div>

      <SeoSection
        ko={{
          title: '이자 계산기(단리/복리)란 무엇인가요?',
          description: '이자 계산기는 원금, 연이율, 기간을 입력해 단리 또는 복리 방식으로 이자와 만기 원리금을 계산하는 도구입니다. 은행 예금, 적금, 대출 이자, 투자 수익 등을 미리 시뮬레이션해 재무 계획을 세울 수 있습니다. 월복리, 분기복리, 연복리 등 다양한 복리 계산 주기를 지원하며, 연도별 원리금 증가 추이도 시각화해줍니다.',
          useCases: [
            { icon: '🏦', title: '예금 이자 계산', desc: '은행 정기예금의 만기 시 수령 금액을 단리·복리로 미리 계산해 최적의 예금 상품을 비교합니다.' },
            { icon: '📈', title: '투자 수익 시뮬레이션', desc: '복리 효과를 활용해 장기 투자 시 원금이 얼마나 불어나는지 연도별로 확인합니다.' },
            { icon: '🏠', title: '대출 이자 파악', desc: '원금과 금리를 입력해 단순 이자 총액을 계산하고, 대출 조건 비교에 활용합니다.' },
            { icon: '🎯', title: '재무 목표 설정', desc: '목표 금액을 달성하기 위한 기간과 수익률을 역으로 시뮬레이션합니다.' },
          ],
          steps: [
            { step: '이자 방식 선택', desc: '단리(원금에만 이자 부과) 또는 복리(이자에도 이자 부과) 중 선택합니다.' },
            { step: '원금·금리·기간 입력', desc: '투자 원금, 연이율(%), 기간(년/월/일)을 입력합니다. 복리의 경우 이자 계산 주기도 선택합니다.' },
            { step: '결과 및 추이 확인', desc: '만기 원리금, 이자 총액, 연도별 원리금 증가 추이 차트를 확인합니다.' },
          ],
          faqs: [
            { q: '단리와 복리의 차이는 무엇인가요?', a: '단리는 원금에만 이자가 붙지만, 복리는 발생한 이자에도 이자가 붙습니다. 기간이 길수록 복리의 효과가 극적으로 커집니다.' },
            { q: '월복리와 연복리 중 어떤 게 유리한가요?', a: '같은 금리라면 복리 계산 주기가 짧을수록(월복리 > 분기복리 > 연복리) 최종 수익이 더 높습니다.' },
            { q: '세전·세후 이자 계산이 가능한가요?', a: '현재는 세전 이자를 계산합니다. 한국 이자소득세(15.4%)를 직접 차감해 세후 수익을 계산하세요.' },
          ],
        }}
        en={{
          title: 'What is a Simple & Compound Interest Calculator?',
          description: 'An interest calculator lets you enter a principal, annual interest rate, and duration to calculate simple or compound interest and the final maturity amount. Use it to simulate bank deposit returns, investment growth, loan interest, and more — helping you plan your finances with confidence. Supports multiple compounding frequencies (daily, monthly, quarterly, annually) and visualizes year-by-year growth.',
          useCases: [
            { icon: '🏦', title: 'Bank Deposit Returns', desc: 'Pre-calculate the maturity amount for fixed deposits using simple or compound interest to compare products.' },
            { icon: '📈', title: 'Investment Simulation', desc: 'See how the power of compounding grows your principal over time with a year-by-year breakdown.' },
            { icon: '🏠', title: 'Loan Interest Estimate', desc: 'Enter the principal and rate to calculate the total interest on a loan and compare financing options.' },
            { icon: '🎯', title: 'Financial Goal Planning', desc: 'Simulate the rate or duration needed to reach a target amount and plan your savings strategy.' },
          ],
          steps: [
            { step: 'Choose Interest Type', desc: 'Select simple interest (interest on principal only) or compound interest (interest on interest).' },
            { step: 'Enter Principal, Rate & Duration', desc: 'Input the principal amount, annual interest rate (%), and the investment period in years, months, or days. For compound, choose the compounding frequency.' },
            { step: 'View Results & Chart', desc: 'See the maturity amount, total interest earned, and a year-by-year growth chart.' },
          ],
          faqs: [
            { q: 'What is the difference between simple and compound interest?', a: 'Simple interest is calculated only on the principal, while compound interest is calculated on the principal plus accumulated interest. The difference grows dramatically over longer periods.' },
            { q: 'Is monthly compounding better than annual compounding?', a: 'Yes — for the same annual rate, more frequent compounding (monthly > quarterly > annually) yields a higher final return.' },
            { q: 'Does this calculator show after-tax interest?', a: 'Currently, it calculates pre-tax interest. To estimate after-tax returns in Korea, subtract the 15.4% interest income tax from the interest shown.' },
          ],
        }}
      />
    </div>
  );
}
