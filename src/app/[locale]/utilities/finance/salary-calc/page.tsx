'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { 
  Building2, 
  Wallet, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Calendar, 
  CreditCard,
  Info,
  CheckCircle2,
  DollarSign,
  Briefcase,
  History,
  Coins,
  ArrowRight,
  Calculator,
  PieChart,
  BarChart3,
  BadgeCent,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  HelpCircle,
  Plus,
  Minus
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { CURRENT_DATA, WEEKS_PER_MONTH } from '@/constants/wageConfig';
import s from './salary.module.css';

type Country = 'KR' | 'US';
type KRDeduction = 'none' | 'withholdingTax' | 'insurance';
type USDeduction = 'none' | 'fica';

/* ─── Calculation helpers ─── */

function calcKR(hW: number, hPD: number, dPW: number, weeklyHolidayOn: boolean, deduction: KRDeduction) {
  const cfg = CURRENT_DATA.KR;
  const weeklyHours = hPD * dPW;
  const weeklyRegular = weeklyHours * hW;
  const weeklyHoliday = weeklyHolidayOn && weeklyHours >= cfg.weeklyHoliday.minHoursForEligibility
    ? (Math.min(weeklyHours, cfg.weeklyHoliday.weekCapHours) / cfg.weeklyHoliday.weekCapHours) * cfg.weeklyHoliday.paidHoursPerWeek * hW
    : 0;
  const weeklyGross = weeklyRegular + weeklyHoliday;
  const monthlyGross = weeklyGross * WEEKS_PER_MONTH;
  const dRate = cfg.deductions[deduction];
  const monthlyDeduction = monthlyGross * dRate;
  const monthlyNet = monthlyGross - monthlyDeduction;
  return { weeklyHours, weeklyRegular, weeklyHoliday, weeklyGross, monthlyGross, monthlyDeduction, monthlyNet, dRate, dailyPay: hPD * hW };
}

function calcUS(hW: number, hPD: number, dPW: number, deduction: USDeduction) {
  const cfg = CURRENT_DATA.US;
  const weeklyHours = hPD * dPW;
  const regularHours = Math.min(weeklyHours, cfg.overtime.thresholdHours);
  const overtimeHours = Math.max(0, weeklyHours - cfg.overtime.thresholdHours);
  const weeklyRegular = regularHours * hW;
  const weeklyOvertime = overtimeHours * hW * cfg.overtime.multiplier;
  const weeklyGross = weeklyRegular + weeklyOvertime;
  const monthlyGross = weeklyGross * WEEKS_PER_MONTH;
  const dRate = cfg.deductions[deduction];
  const monthlyDeduction = monthlyGross * dRate;
  const monthlyNet = monthlyGross - monthlyDeduction;
  return { weeklyHours, regularHours, overtimeHours, weeklyRegular, weeklyOvertime, weeklyGross, monthlyGross, monthlyDeduction, monthlyNet, dRate, dailyPay: hW * hPD };
}

/* ─── Main Component ─── */

export default function NetPayPage() {
  const t = useTranslations('SalaryCalc'); // Assuming localized strings exist
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [country, setCountry] = useState<Country>('KR');
  const [hourlyWage, setHourlyWage] = useState(CURRENT_DATA.KR.minWage);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [weeklyHolidayOn, setWeeklyHolidayOn] = useState(true);
  const [krDeduction, setKrDeduction] = useState<KRDeduction>('insurance');
  const [usDeduction, setUsDeduction] = useState<USDeduction>('fica');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const switchCountry = (c: Country) => {
    setCountry(c);
    setHourlyWage(c === 'KR' ? CURRENT_DATA.KR.minWage : CURRENT_DATA.US.minWage);
  };

  const kr = calcKR(hourlyWage, hoursPerDay, daysPerWeek, weeklyHolidayOn, krDeduction);
  const us = calcUS(hourlyWage, hoursPerDay, daysPerWeek, usDeduction);
  const result = country === 'KR' ? kr : us;
  const isKRW = country === 'KR';

  const fmt = (n: number) => {
    if (isKRW) return `₩${Math.round(n).toLocaleString()}`;
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!isClient) return null;

  return (
    <div className={s.sal_container}>
      <NavigationActions />
      <header className={s.sal_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Briefcase size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.sal_title}>{isKo ? '급여 & 실수령액 계산기' : 'Salary & Net Pay Calc'}</h1>
        <p className={s.sal_subtitle}>{isKo ? '각종 수당과 세금을 포함해 실제로 받는 월급을 확인하세요' : 'Calculate your real take-home pay after taxes and allowances.'}</p>
      </header>

      {/* Country Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        {(['KR', 'US'] as Country[]).map(c => (
          <button 
            key={c} 
            onClick={() => switchCountry(c)}
            style={{ padding: '0.75rem 2rem', borderRadius: '2rem', border: '1px solid #e2e8f0', background: country === c ? '#8b5cf6' : 'white', color: country === c ? 'white' : '#64748b', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {c === 'KR' ? '🇰🇷 KOREA' : '🇺🇸 USA'}
          </button>
        ))}
      </div>

      <div className={s.sal_main_grid}>
        {/* Left: Input Panel */}
        <div className={s.sal_card}>
          <div className={s.sal_input_group}>
            <label className={s.sal_label}>{isKo ? '시금 (Hourly Wage)' : 'Hourly Wage'}</label>
            <div style={{ position: 'relative' }}>
              <input 
                className={s.sal_input} 
                value={hourlyWage} 
                onChange={e => setHourlyWage(parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0)}
                placeholder="0"
              />
              <span style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: '#94a3b8', fontSize: '1.25rem' }}>
                {isKRW ? '₩' : '$'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label className={s.sal_label}>{isKo ? '일일 근무시간' : 'Hours/Day'}</label>
              <div className={s.sal_stepper}>
                <button className={s.sal_step_btn} onClick={() => setHoursPerDay(Math.max(1, hoursPerDay-1))}><Minus size={18} /></button>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1e293b' }}>{hoursPerDay}h</div>
                <button className={s.sal_step_btn} onClick={() => setHoursPerDay(Math.min(24, hoursPerDay+1))}><Plus size={18} /></button>
              </div>
            </div>
            <div>
              <label className={s.sal_label}>{isKo ? '주당 근무일수' : 'Days/Week'}</label>
              <div className={s.sal_stepper}>
                <button className={s.sal_step_btn} onClick={() => setDaysPerWeek(Math.max(1, daysPerWeek-1))}><Minus size={18} /></button>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1e293b' }}>{daysPerWeek}d</div>
                <button className={s.sal_step_btn} onClick={() => setDaysPerWeek(Math.min(7, daysPerWeek+1))}><Plus size={18} /></button>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
            <label className={s.sal_label}>{isKo ? '추가 옵션' : 'Options'}</label>
            
            {isKRW ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{isKo ? '주휴수당 포함' : 'Include Weekly Holiday Pay'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{isKo ? '주 15시간 이상 근무 시 대상' : '15+ hrs/wk'}</div>
                  </div>
                  <button 
                    onClick={() => setWeeklyHolidayOn(!weeklyHolidayOn)}
                    style={{ width: '44px', height: '24px', borderRadius: '12px', background: weeklyHolidayOn ? '#8b5cf6' : '#cbd5e1', position: 'relative', border: 'none', cursor: 'pointer' }}
                  >
                    <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: weeklyHolidayOn ? '23px' : '3px', transition: 'left 0.2s' }} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {(['none', 'withholdingTax', 'insurance'] as KRDeduction[]).map(k => (
                    <button 
                      key={k} 
                      onClick={() => setKrDeduction(k)}
                      style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: krDeduction === k ? '#f5f3ff' : 'white', borderColor: krDeduction === k ? '#8b5cf6' : '#e2e8f0', color: krDeduction === k ? '#8b5cf6' : '#64748b', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}
                    >
                      {k === 'none' ? (isKo ? '공제 전' : 'Gross') : k === 'withholdingTax' ? '3.3%' : (isKo ? '4대보험(9.4%)' : '9.4% Tax')}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['none', 'fica'] as USDeduction[]).map(u => (
                  <button 
                    key={u} 
                    onClick={() => setUsDeduction(u)}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: usDeduction === u ? '#f5f3ff' : 'white', borderColor: usDeduction === u ? '#8b5cf6' : '#e2e8f0', color: usDeduction === u ? '#8b5cf6' : '#64748b', fontSize: '0.8rem', fontWeight: 700 }}
                  >
                    {u === 'none' ? 'Gross' : 'FICA (7.65%)'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Receipt Dashboard */}
        <div className={s.sal_receipt}>
          <div className={s.sal_receipt_header}>
            <div className={s.sal_receipt_label}>{isKo ? '예상 월 실수령액' : 'Estimated Net Pay'}</div>
            <div className={s.sal_receipt_net}>{fmt(result.monthlyNet)}</div>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', opacity: 0.8, fontWeight: 700 }}>
              {isKo ? '각종 보험 및 세금 공제 후' : 'After taxes and deductions'}
            </div>
          </div>
          <div className={s.sal_receipt_body}>
            <div className={s.sal_receipt_row}>
              <span className={s.sal_row_label}>{isKo ? '주당 근무시간' : 'Weekly Hours'}</span>
              <span className={s.sal_row_value}>{result.weeklyHours}h</span>
            </div>
            
            {!isKRW && us.overtimeHours > 0 && (
              <div className={s.sal_receipt_row}>
                <span className={s.sal_row_label} style={{ color: '#ef4444' }}>{isKo ? '연장근로 수당' : 'Overtime Benefit'}</span>
                <span className={s.sal_row_value} style={{ color: '#ef4444' }}>+{fmt(us.weeklyOvertime)}</span>
              </div>
            )}

            {isKRW && kr.weeklyHoliday > 0 && (
              <div className={s.sal_receipt_row}>
                <span className={s.sal_row_label} style={{ color: '#10b981' }}>{isKo ? '주휴수당' : 'Weekly Holiday'}</span>
                <span className={s.sal_row_value} style={{ color: '#10b981' }}>+{fmt(kr.weeklyHoliday)}</span>
              </div>
            )}

            <div className={s.sal_receipt_row}>
              <span className={s.sal_row_label}>{isKo ? '월 총 급여 (세전)' : 'Monthly Gross'}</span>
              <span className={s.sal_row_value}>{fmt(result.monthlyGross)}</span>
            </div>

            <div className={s.sal_receipt_row}>
              <span className={s.sal_row_label} style={{ color: '#ef4444' }}>{isKo ? '세금 및 공제' : 'Deductions'} ({(result.dRate*100).toFixed(1)}%)</span>
              <span className={s.sal_row_value} style={{ color: '#ef4444' }}>-{fmt(result.monthlyDeduction)}</span>
            </div>

            <div className={s.sal_receipt_row} style={{ background: '#fdfbff', padding: '1.5rem 2rem' }}>
              <span className={s.sal_row_label} style={{ color: '#8b5cf6', fontWeight: 900 }}>{isKo ? '최종 실수령액' : 'Net Take-home'}</span>
              <span className={s.sal_row_value} style={{ fontSize: '1.5rem', color: '#8b5cf6', fontWeight: 950 }}>{fmt(result.monthlyNet)}</span>
            </div>
          </div>
          <div style={{ padding: '1.25rem 2rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.5 }}>
            {isKo ? '* 실제 수령액은 거주 지역의 지방세 및 개인 소득 수준에 따라 차이가 있을 수 있습니다.' : '* Estimated results may vary based on state taxes and personal deductions.'}
          </div>
        </div>
      </div>

      {/* Standard Bottom Sections */}
      <div style={{ width: '100%' }}>
        <ShareBar title={isKo ? '급여 & 실수령액 계산기' : 'Salary Calculator'} description={isKo ? '세후 월급을 정확하게 계산하세요' : 'Calculate your real monthly income'} />
        <RelatedTools toolId="fintech/salary" />
        <div className={s.sal_ad_placeholder}>{isKo ? '광고 영역' : 'Ad Space'}</div>
        <SeoSection
          ko={{
            title: '2026년 급여 및 실수령액 가이드',
            description: '한국의 주휴수당과 4대보험, 미국의 FICA 세금을 반영한 정확한 실수령액 계산법을 알아보세요.',
            useCases: [{ icon: '💰', title: '취업 전 연봉 협상', desc: '세후 실수령액을 미리 파악해 유리한 조건으로 협상하세요.' }],
            steps: [{ step: '1', desc: '근무 국가 선택 및 시급 입력' }],
            faqs: [{ q: '주휴수당이 포함되나요?', a: '주 15시간 이상 근무 시 자동으로 반영되도록 설정 가능합니다.' }]
          }}
          en={{
            title: '2026 Salary & Net Pay Guide',
            description: 'Understand how taxes and overtime impact your take-home pay in Korea and the US.',
            useCases: [{ icon: '💼', title: 'Plan Your Budget', desc: 'Get an accurate estimate of your monthly cash flow.' }],
            steps: [{ step: '1', desc: 'Select country and enter your hourly rate' }],
            faqs: [{ q: 'What about state taxes?', a: 'This tool provides a federal baseline. State taxes vary.' }]
          }}
        />
      </div>
    </div>
  );
}
