'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Plus,
  Minus,
  Receipt,
  ShoppingBag,
  Wallet,
  Sparkles,
  ArrowRight,
  Calculator,
  Info,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Package,
  TrendingDown,
  Activity,
  History,
  Coins,
  ArrowUpRight,
  PieChart,
  BarChart3
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './interest.module.css';

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

export default function InterestCalcClient() {
  const t = useTranslations('Interest');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [type, setType] = useState<InterestType>('compound');
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [duration, setDuration] = useState('');
  const [period, setPeriod] = useState<Period>('year');
  const [freq, setFreq] = useState<CompoundFreq>(12);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const fmt = (n: number) => Math.round(n).toLocaleString(isKo ? 'ko-KR' : 'en-US');

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

  if (!isClient) return null;

  return (
    <div className={s.int_container}>
      <NavigationActions />
      <header className={s.int_header}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <TrendingUp size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.int_title}>{t('title')}</h1>
        <p className={s.int_subtitle}>{t('description')}</p>
      </header>

      <section className={s.int_panel}>
        {/* Type Toggle */}
        <div className={s.int_type_tabs}>
          <button
            className={`${s.int_type_btn} ${type === 'simple' ? s.int_type_btn_active : ''}`}
            onClick={() => setType('simple')}
          >
            {t('type.simple')}
          </button>
          <button
            className={`${s.int_type_btn} ${type === 'compound' ? s.int_type_btn_active : ''}`}
            onClick={() => setType('compound')}
          >
            {t('type.compound')}
          </button>
        </div>

        {/* Inputs */}
        <div className={s.int_input_group}>
          <label className={s.int_label}>{t('label.principal')}</label>
          <div style={{ position: 'relative' }}>
            <input
              className={s.int_input}
              value={principal}
              onChange={e => setPrincipal(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0"
            />
            <span style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#94a3b8' }}>{isKo ? '원' : ''}</span>
          </div>
        </div>

        <div className={s.int_input_group}>
          <label className={s.int_label}>{t('label.rate')} (p.a.)</label>
          <div style={{ position: 'relative' }}>
            <input
              className={s.int_input}
              value={rate}
              onChange={e => setRate(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
            />
            <span style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#94a3b8' }}>%</span>
          </div>
        </div>

        <div className={s.int_input_group}>
          <label className={s.int_label}>{t('label.duration')}</label>
          <div className={s.int_duration_row}>
            <input
              className={s.int_input}
              style={{ flex: 1 }}
              value={duration}
              onChange={e => setDuration(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0"
            />
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {(['year', 'month', 'day'] as Period[]).map(per => (
                <button
                  key={per}
                  className={`${s.int_period_btn} ${period === per ? s.int_period_btn_active : ''}`}
                  onClick={() => setPeriod(per)}
                >
                  {t(`period.${per}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {type === 'compound' && (
          <div className={s.int_input_group}>
            <label className={s.int_label}>{t('label.compoundFreq')}</label>
            <div className={s.int_freq_tabs}>
              {FREQ_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`${s.int_freq_btn} ${freq === opt.value ? s.int_freq_btn_active : ''}`}
                  onClick={() => setFreq(opt.value)}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result Area */}
        {hasResult && (
          <div className={s.int_result_box} style={{ animation: 'bounceIn 0.5s ease-out' }}>
            <div className={s.int_result_grid}>
              <div>
                <div className={s.int_result_item_label}>{t('result.principal')}</div>
                <div className={s.int_result_item_value}>{fmt(p)}</div>
              </div>
              <div>
                <div className={s.int_result_item_label}>{t('result.interest')}</div>
                <div className={s.int_result_item_value} style={{ color: '#10b981' }}>+{fmt(interest)}</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
              <div className={s.int_result_total_label}>{t('result.total')}</div>
              <div className={s.int_result_total_value}>{fmt(total)}{isKo ? '원' : ''}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem', fontWeight: 600 }}>
                {t('result.effectiveRate', { rate: (interest / p * 100).toFixed(2) })}
              </div>
            </div>
          </div>
        )}

        {/* Chart View */}
        {hasResult && yearlyData.length > 1 && (
          <div className={s.int_breakdown}>
            <div className={s.int_breakdown_title}>
              <BarChart3 size={16} style={{ display: 'inline', marginRight: '6px' }} />
              {t('result.yearlyBreakdown')}
            </div>
            {yearlyData.map(d => (
              <div key={d.year} className={s.int_year_bar_row}>
                <div className={s.int_year_bar_header}>
                  <span className={s.int_year_label}>{isKo ? `${d.year}년차` : `Year ${d.year}`}</span>
                  <span className={s.int_year_value}>{fmt(d.total)}</span>
                </div>
                <div className={s.int_bar_bg}>
                  <div className={s.int_bar_fill} style={{ width: `${(d.total / maxTotal) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Standard Bottom Sections */}
      <div style={{ width: '100%' }}>
        <ShareBar title={t('title')} description={t('description')} />
        <RelatedTools toolId="utilities/finance/interest-calc" />
        <div className={s.int_ad_placeholder}>{isKo ? '광고 영역' : 'Ad Space'}</div>
        <SeoSection
          ko={{
            title: '단리·복리 이자 계산기란 무엇인가요?',
            description: '이자 계산기는 예금, 적금, 투자 상품에서 발생하는 이자 수익을 정확하게 예측하는 금융 도구입니다. 단리(Simple Interest)는 원금에만 이자가 붙는 방식으로, 매 기간 동일한 금액의 이자가 발생합니다. 반면 복리(Compound Interest)는 "이자에 이자가 붙는" 방식으로, 시간이 지날수록 기하급수적으로 수익이 증가하는 것이 특징입니다. 본 계산기는 두 가지 방식을 모두 지원하며, 복리의 경우 연복리, 반기복리, 분기복리, 월복리, 일복리 등 다양한 복리 주기를 설정할 수 있어 실제 금융 상품과 동일한 조건으로 시뮬레이션이 가능합니다. 은행 예금 이자, P2P 투자 수익, 대출 이자 부담, 장기 투자 수익률 등 다양한 재무 계획 수립 시 활용하면 미래 자산 가치를 명확히 파악하고 현명한 투자 결정을 내릴 수 있습니다.',
            useCases: [
              { icon: '📈', title: '복리 효과 시뮬레이션', desc: '장기 투자 시 단리와 복리의 수익 차이를 그래프로 비교하여 복리의 마법을 실감할 수 있습니다.' },
              { icon: '🏦', title: '예적금 만기 금액 예측', desc: '은행 정기예금이나 적금 가입 전 만기 시 받을 총액과 이자 소득을 미리 계산하여 상품을 비교할 수 있습니다.' },
              { icon: '💰', title: '투자 수익률 계산', desc: 'P2P 대출, 채권, 배당주 등 다양한 투자 상품의 연평균 수익률을 입력하여 목표 금액 달성 시기를 예측할 수 있습니다.' },
              { icon: '📊', title: '대출 이자 부담 분석', desc: '학자금 대출이나 신용대출의 이자율과 기간을 입력하여 총 상환 이자를 계산하고 조기 상환 전략을 수립할 수 있습니다.' }
            ],
            steps: [
              { step: '계산 방식 선택', desc: '상단 탭에서 "단리(Simple)" 또는 "복리(Compound)" 중 원하는 계산 방식을 선택합니다. 일반적으로 예적금은 복리, 대출은 단리 방식을 사용합니다.' },
              { step: '원금 및 금리 입력', desc: '초기 투자금(원금)과 연 이자율(%)을 입력합니다. 프리셋 버튼을 활용하면 일반적인 금액(100만원~1억원)을 빠르게 입력할 수 있습니다.' },
              { step: '기간 및 복리 주기 설정', desc: '투자 기간을 연/월/일 단위로 입력하고, 복리 선택 시 복리 주기(연복리, 월복리 등)를 설정하여 실제 상품 조건과 동일하게 맞춥니다.' },
              { step: '결과 확인 및 비교', desc: '결과 패널에서 총 이자, 최종 금액, 실효 이자율을 확인하고, 단리/복리 비교 버튼으로 두 방식의 차이를 한눈에 파악합니다.' }
            ],
            faqs: [
              { q: '단리와 복리의 차이가 무엇인가요?', a: '단리는 원금에만 이자가 붙어 매 기간 동일한 이자가 발생하는 반면, 복리는 원금에 이자가 더해진 금액에 다시 이자가 붙어 시간이 지날수록 수익이 기하급수적으로 증가합니다. 예: 1000만원, 연 5%, 10년 기준 → 단리 1500만원, 복리 약 1629만원' },
              { q: '월복리와 연복리 중 어느 것이 더 유리한가요?', a: '동일한 연 이자율이라면 복리 주기가 짧을수록(일복리 > 월복리 > 연복리) 더 자주 이자가 재투자되어 최종 수익이 높아집니다. 실제 은행 상품은 대부분 월복리 또는 분기복리를 적용합니다.' },
              { q: '실효 이자율(APY)이란 무엇인가요?', a: '복리 효과를 반영한 실제 연간 수익률입니다. 명목 이자율이 5%라도 월복리로 계산하면 실효 이자율은 약 5.12%가 되어, 실제로는 더 높은 수익을 얻게 됩니다.' },
              { q: '대출 이자도 이 계산기로 계산할 수 있나요?', a: '네, 가능합니다. 단, 대부분의 대출은 원리금 균등상환 방식으로 매월 원금과 이자를 함께 갚기 때문에 본 계산기의 단순 이자 계산과는 차이가 있을 수 있습니다. 정확한 대출 상환 계획은 은행의 대출 상담을 권장합니다.' }
            ]
          }}
          en={{
            title: 'What is a Simple vs Compound Interest Calculator?',
            description: 'An interest calculator is a financial tool that accurately predicts earnings from savings accounts, fixed deposits, and investment products. Simple interest applies a fixed rate only to the principal amount, generating the same interest each period. Compound interest, on the other hand, is "interest on interest," where earnings grow exponentially over time as interest is reinvested. This calculator supports both methods and offers various compounding frequencies for compound interest—annual, semi-annual, quarterly, monthly, and daily—allowing you to simulate real-world financial products precisely. Whether you\'re calculating bank deposit interest, P2P investment returns, loan interest costs, or long-term investment growth, this tool helps you visualize future asset values and make informed financial decisions.',
            useCases: [
              { icon: '📈', title: 'Compound Effect Simulation', desc: 'Compare simple vs compound interest growth over time with visual charts to truly understand the "magic" of compounding.' },
              { icon: '🏦', title: 'Savings Maturity Prediction', desc: 'Calculate the total amount and interest income you\'ll receive at maturity before signing up for bank time deposits or savings accounts.' },
              { icon: '💰', title: 'Investment Return Projection', desc: 'Input annual returns for P2P lending, bonds, dividend stocks, or other assets to forecast when you\'ll reach your financial goals.' },
              { icon: '📊', title: 'Loan Interest Analysis', desc: 'Estimate total interest payments on student loans or personal loans, and plan early repayment strategies to minimize costs.' }
            ],
            steps: [
              { step: 'Choose Calculation Method', desc: 'Select "Simple" or "Compound" from the top tabs. Typically, savings use compound interest while loans use simple interest.' },
              { step: 'Enter Principal and Rate', desc: 'Input your initial investment (principal) and annual interest rate (%). Use preset buttons for quick entry of common amounts (1k~10M).' },
              { step: 'Set Period and Frequency', desc: 'Enter investment duration in years/months/days. For compound interest, select compounding frequency (annual, monthly, etc.) to match actual product terms.' },
              { step: 'Review Results and Compare', desc: 'Check the results panel for total interest, final amount, and effective annual rate (APY). Use the comparison button to see simple vs compound side-by-side.' }
            ],
            faqs: [
              { q: 'What\'s the difference between simple and compound interest?', a: 'Simple interest applies only to the principal, generating the same interest each period. Compound interest applies to principal plus accumulated interest, growing exponentially. Example: $10k at 5% for 10 years → Simple: $15k, Compound: ~$16.29k.' },
              { q: 'Is monthly compounding better than annual?', a: 'Yes, the more frequent the compounding (daily > monthly > annual), the more often interest is reinvested, leading to higher final returns. Most bank products use monthly or quarterly compounding.' },
              { q: 'What is the effective annual rate (APY)?', a: 'APY is the actual annual return after accounting for compounding. A 5% nominal rate compounded monthly yields an effective rate of about 5.12%, meaning you earn more than the stated rate.' },
              { q: 'Can I use this for loan interest?', a: 'Yes, but note that most loans use amortized repayment schedules where you pay both principal and interest monthly. This calculator provides simple estimates; consult your lender for exact repayment plans.' }
            ]
          }}
        />
      </div>
    </div>
  );
}
