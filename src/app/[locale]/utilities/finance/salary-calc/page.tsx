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
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Wallet size={40} color="#8b5cf6" />
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
            title: '급여 및 실수령액 계산기란 무엇인가요?',
            description: '시간당 임금을 입력하면 주급, 월급, 그리고 각종 세금과 공제를 제외한 실제 통장에 입금되는 실수령액을 자동으로 계산해주는 도구입니다. 한국과 미국 두 나라의 임금 체계를 지원하며, 한국의 경우 주휴수당(주 15시간 이상 근무 시 지급되는 유급 휴일 수당)과 4대보험(국민연금, 건강보험, 고용보험, 산재보험) 공제를 반영하고, 미국의 경우 연장근로 수당(주 40시간 초과 시 1.5배 임금)과 FICA 세금(사회보장세 6.2% + 메디케어 1.45% = 7.65%)을 자동 계산합니다. 아르바이트생, 파트타임 근로자, 계약직, 정규직 입사 예정자, HR 담당자 등 누구나 쉽게 사용할 수 있으며, 근무 시간과 일수를 조절하면 다양한 근무 형태에 따른 예상 수입을 즉시 비교할 수 있어 취업 전 연봉 협상이나 생활비 계획 수립에 매우 유용합니다. 특히 최저임금 인상 시기나 이직을 고려하는 시점에 활용하면 실질적인 소득 변화를 명확히 파악할 수 있습니다.',
            useCases: [
              { icon: '💰', title: '취업 전 연봉 협상', desc: '면접 제안받은 시급/월급을 입력해 세후 실수령액을 계산하고, 생활비 대비 적정한지 판단하여 협상에 활용하세요.' },
              { icon: '📅', title: '근무 시간 최적화', desc: '주 5일과 주 6일, 하루 8시간과 10시간 근무 등 다양한 조합을 시뮬레이션하여 가장 효율적인 근무 패턴을 찾을 수 있습니다.' },
              { icon: '🏦', title: '아르바이트 수입 계산', desc: '학생이나 부업으로 아르바이트할 때 주휴수당 포함 여부에 따른 실수령액 차이를 확인하고 근로계약서를 검토할 수 있습니다.' },
              { icon: '🌍', title: '한미 급여 비교', desc: '한국과 미국 간 이직을 고려할 때 각국의 세금 체계와 수당을 반영한 실제 소득을 비교하여 현실적인 결정을 내릴 수 있습니다.' }
            ],
            steps: [
              { step: '국가 선택', desc: '상단의 🇰🇷 KOREA 또는 🇺🇸 USA 버튼을 클릭하여 적용할 임금 체계를 선택합니다. 각 국가별로 최저임금과 수당 계산 방식이 자동 적용됩니다.' },
              { step: '시급 및 근무 조건 입력', desc: '시급(Hourly Wage)과 일일 근무시간(Hours/Day), 주당 근무일수(Days/Week)를 입력합니다. +/- 버튼으로 간편하게 조정 가능합니다.' },
              { step: '추가 옵션 설정', desc: '한국: 주휴수당 포함 여부와 공제 방식(공제 전/3.3% 원천징수/4대보험 9.4%) 선택. 미국: FICA 세금 포함 여부 선택.' },
              { step: '실수령액 확인', desc: '오른쪽 영수증 스타일 대시보드에서 주당 근무시간, 각종 수당, 세금 공제, 최종 월 실수령액을 시각적으로 확인합니다.' }
            ],
            faqs: [
              { q: '주휴수당은 어떤 조건에서 받을 수 있나요?', a: '대한민국 근로기준법에 따라 주 15시간 이상 근무하고 소정의 근로일을 개근한 근로자는 유급 주휴일을 받을 권리가 있습니다. 본 계산기는 주 15시간 이상 근무 시 자동으로 주휴수당(1일 8시간 기준)을 포함하여 계산합니다.' },
              { q: '4대보험 공제율 9.4%는 정확한가요?', a: '본 계산기는 간이 추정치로, 국민연금 4.5%, 건강보험 3.545%, 장기요양보험 0.455%, 고용보험 0.9% 등을 합산한 근사치입니다. 실제 공제액은 회사 부담분과 개인 부담분이 다르며, 정확한 금액은 급여명세서를 통해 확인하세요.' },
              { q: '미국의 연장근로(Overtime) 수당은 어떻게 계산되나요?', a: '미국 연방 근로기준법(FLSA)에 따라 주 40시간을 초과하는 근무시간에 대해서는 통상 시급의 1.5배를 지급해야 합니다. 본 계산기는 주당 근무시간이 40시간을 넘으면 자동으로 초과분에 1.5배 수당을 적용합니다.' },
              { q: '이 계산기로 정규직 연봉도 계산할 수 있나요?', a: '네, 가능합니다. 연봉을 12개월과 월 평균 근로시간(보통 209시간)으로 나누어 시급을 역산한 후 입력하면, 4대보험과 소득세를 제외한 실수령액을 대략적으로 예측할 수 있습니다. 단, 상여금이나 성과급은 별도 계산이 필요합니다.' }
            ]
          }}
          en={{
            title: 'What is a Salary & Net Pay Calculator?',
            description: 'This calculator instantly computes your weekly pay, monthly salary, and actual take-home amount after taxes and deductions based on your hourly wage. It supports both Korean and US wage systems: in Korea, it includes weekly holiday pay (for workers exceeding 15 hours per week) and deducts the Four Major Insurances (National Pension 4.5%, Health Insurance 3.545%, Employment Insurance, and Industrial Accident Insurance totaling ~9.4%), while in the US, it calculates overtime pay (1.5x rate for hours beyond 40 per week) and FICA taxes (Social Security 6.2% + Medicare 1.45% = 7.65%). Whether you\'re a part-time worker, contractor, full-time employee, or HR professional, this tool allows you to compare different work schedules and predict real income for budgeting, salary negotiations, and career planning. It\'s especially useful when evaluating job offers, planning for minimum wage increases, or considering relocation between countries.',
            useCases: [
              { icon: '💼', title: 'Job Offer Evaluation', desc: 'Enter the proposed hourly or annual rate from a job offer to calculate your actual take-home pay and determine if it meets your financial needs.' },
              { icon: '📊', title: 'Work Schedule Optimization', desc: 'Compare different combinations of hours per day and days per week to find the most efficient work pattern that maximizes your income.' },
              { icon: '🎓', title: 'Part-time Income Planning', desc: 'Students and side hustlers can calculate their part-time earnings, including weekly holiday pay in Korea, to budget their expenses accurately.' },
              { icon: '🌏', title: 'International Pay Comparison', desc: 'Relocating between Korea and the US? Compare net incomes under each country\'s tax system to make an informed decision about your career move.' }
            ],
            steps: [
              { step: 'Select Country', desc: 'Click 🇰🇷 KOREA or 🇺🇸 USA at the top to apply the appropriate wage system. Each country has different minimum wage and allowance rules.' },
              { step: 'Enter Wage and Schedule', desc: 'Input your Hourly Wage, Hours per Day, and Days per Week. Use +/- buttons for quick adjustments to see how changes affect your pay.' },
              { step: 'Configure Deductions', desc: 'Korea: Toggle weekly holiday pay and choose deduction type (None/3.3% Tax/9.4% Insurance). USA: Toggle FICA tax inclusion.' },
              { step: 'Review Net Pay Dashboard', desc: 'Check the receipt-style dashboard on the right showing weekly hours, allowances, tax deductions, and final monthly net take-home pay.' }
            ],
            faqs: [
              { q: 'What is weekly holiday pay in Korea?', a: 'Under Korean Labor Standards Act, workers who work 15+ hours per week and maintain perfect attendance are entitled to one paid day off per week. This calculator automatically includes this allowance (8 hours at your hourly rate) when weekly hours exceed 15.' },
              { q: 'Are the Four Major Insurance rates accurate?', a: 'The 9.4% deduction is a simplified estimate combining National Pension (4.5%), Health Insurance (3.545%), Long-term Care (0.455%), and Employment Insurance (0.9%). Actual amounts vary between employer and employee portions—check your payslip for exact figures.' },
              { q: 'How is US overtime pay calculated?', a: 'Under the Fair Labor Standards Act (FLSA), hours worked beyond 40 in a week must be paid at 1.5 times the regular hourly rate. This calculator automatically applies the 1.5x multiplier to overtime hours.' },
              { q: 'Can I use this for salaried positions?', a: 'Yes! Divide your annual salary by 12 months and approximate monthly hours (usually 173-209 hours) to get an estimated hourly rate, then input it here. Note that bonuses and performance pay are not included in this calculation.' }
            ]
          }}
        />
      </div>
    </div>
  );
}
