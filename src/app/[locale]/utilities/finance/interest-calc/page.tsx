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

export default function InterestPage() {
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
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Coins size={40} color="#8b5cf6" />
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
        <RelatedTools toolId="fintech/interest" />
        <div className={s.int_ad_placeholder}>{isKo ? '광고 영역' : 'Ad Space'}</div>
        <SeoSection
          ko={{
            title: '단리·복리 이자 계산 가이드',
            description: '기간과 이율에 따른 이자 수익을 미리 보세요. 복리의 마법이 자산을 어떻게 불려주는지 확인하세요.',
            useCases: [{ icon: '📈', title: '복공 효과 시뮬레이션', desc: '장기 투자의 힘 확인하기' }],
            steps: [{ step: '1', desc: '원금과 금리, 기간 입력' }],
            faqs: [{ q: '월복리와 연복리의 차이는?', a: '자주 복리 계산될수록 더 큰 이자가 발생합니다.' }]
          }}
          en={{
            title: 'Simple vs Compound Interest Guide',
            description: 'Maximize your savings by understanding interest calculations. Visualize wealth growth over time.',
            useCases: [{ icon: '🏦', title: 'Savings Prep', desc: 'Project bank earnings accurately' }],
            steps: [{ step: '1', desc: 'Input principal, rate, and period' }],
            faqs: [{ q: 'Is compound better?', a: 'Generally yes, as you earn interest on interest.' }]
          }}
        />
      </div>
    </div>
  );
}
