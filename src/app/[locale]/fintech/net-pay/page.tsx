'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { useSpring, useTransform, motion } from 'framer-motion';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import { CURRENT_DATA, WEEKS_PER_MONTH } from '@/constants/wageConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

type Country = 'KR' | 'US';
type KRDeduction = 'none' | 'withholdingTax' | 'insurance';
type USDeduction = 'none' | 'fica';

// ─── Animated Number ─────────────────────────────────────────────────────────

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const spring = useSpring(value, { stiffness: 80, damping: 20 });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  const display = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);

  return <motion.span>{display}</motion.span>;
}

// ─── Calculation helpers ───────────────────────────────────────────────────────

function calcKR(
  hourlyWage: number,
  hoursPerDay: number,
  daysPerWeek: number,
  weeklyHolidayOn: boolean,
  deduction: KRDeduction,
) {
  const cfg = CURRENT_DATA.KR;
  const weeklyHours = hoursPerDay * daysPerWeek;
  const weeklyRegular = weeklyHours * hourlyWage;

  // 주휴수당: 주 15h 이상이고 토글 ON
  const weeklyHoliday =
    weeklyHolidayOn && weeklyHours >= cfg.weeklyHoliday.minHoursForEligibility
      ? (Math.min(weeklyHours, cfg.weeklyHoliday.weekCapHours) / cfg.weeklyHoliday.weekCapHours) *
        cfg.weeklyHoliday.paidHoursPerWeek *
        hourlyWage
      : 0;

  const weeklyGross = weeklyRegular + weeklyHoliday;
  const monthlyGross = weeklyGross * WEEKS_PER_MONTH;
  const deductionRate = cfg.deductions[deduction];
  const monthlyDeduction = monthlyGross * deductionRate;
  const monthlyNet = monthlyGross - monthlyDeduction;

  return {
    weeklyHours,
    weeklyRegular,
    weeklyHoliday,
    weeklyGross,
    monthlyGross,
    monthlyDeduction,
    monthlyNet,
    deductionRate,
    dailyPay: hoursPerDay * hourlyWage,
    isHolidayEligible: weeklyHours >= cfg.weeklyHoliday.minHoursForEligibility,
  };
}

function calcUS(
  hourlyWage: number,
  hoursPerDay: number,
  daysPerWeek: number,
  deduction: USDeduction,
) {
  const cfg = CURRENT_DATA.US;
  const weeklyHours = hoursPerDay * daysPerWeek;
  const regularHours = Math.min(weeklyHours, cfg.overtime.thresholdHours);
  const overtimeHours = Math.max(0, weeklyHours - cfg.overtime.thresholdHours);

  const weeklyRegular = regularHours * hourlyWage;
  const weeklyOvertime = overtimeHours * hourlyWage * cfg.overtime.multiplier;
  const weeklyGross = weeklyRegular + weeklyOvertime;
  const monthlyGross = weeklyGross * WEEKS_PER_MONTH;
  const deductionRate = cfg.deductions[deduction];
  const monthlyDeduction = monthlyGross * deductionRate;
  const monthlyNet = monthlyGross - monthlyDeduction;

  return {
    weeklyHours,
    regularHours,
    overtimeHours,
    weeklyRegular,
    weeklyOvertime,
    weeklyGross,
    monthlyGross,
    monthlyDeduction,
    monthlyNet,
    deductionRate,
    dailyPay: (regularHours / daysPerWeek) * hourlyWage + (overtimeHours > 0 ? (overtimeHours / daysPerWeek) * hourlyWage * 1.5 : 0),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NetPayPage() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [country, setCountry] = useState<Country>('KR');
  const [hourlyWage, setHourlyWage] = useState(CURRENT_DATA.KR.minWage);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [weeklyHolidayOn, setWeeklyHolidayOn] = useState(true);
  const [krDeduction, setKrDeduction] = useState<KRDeduction>('insurance');
  const [usDeduction, setUsDeduction] = useState<USDeduction>('fica');

  // Switch defaults when country changes
  const switchCountry = (c: Country) => {
    setCountry(c);
    setHourlyWage(c === 'KR' ? CURRENT_DATA.KR.minWage : CURRENT_DATA.US.minWage);
    setHoursPerDay(8);
    setDaysPerWeek(5);
  };

  const kr = calcKR(hourlyWage, hoursPerDay, daysPerWeek, weeklyHolidayOn, krDeduction);
  const us = calcUS(hourlyWage, hoursPerDay, daysPerWeek, usDeduction);
  const result = country === 'KR' ? kr : us;

  const isCurrencyKRW = country === 'KR';
  const currencySymbol = isCurrencyKRW ? '₩' : '$';
  const lastUpdated = isCurrencyKRW ? CURRENT_DATA.KR.lastUpdated : CURRENT_DATA.US.lastUpdated;
  const lastUpdatedDisplay = isKo
    ? `기준일: ${lastUpdated.replace(/-/g, '년 ').replace('년 ', '년 ').split('년 ').map((v, i) => i === 0 ? v + '년' : i === 1 ? v + '월' : v + '일').join(' ')}`
    : `Data as of: ${new Date(lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`;

  const fmtKRW = (n: number) => `₩${Math.round(n).toLocaleString()}`;
  const fmtUSD = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmt = (n: number) => isCurrencyKRW ? fmtKRW(n) : fmtUSD(n);

  const T = {
    title:      isKo ? '글로벌 실수령액 시급 계산기' : 'Global Net Pay Calculator',
    subtitle:   isKo ? '세금 공제 후 실제로 손에 쥐는 금액을 계산합니다' : 'Calculate your actual take-home pay after deductions',
    hourlyWage: isKo ? '시급' : 'Hourly Wage',
    hpd:        isKo ? '일일 근무시간' : 'Hours / Day',
    dpw:        isKo ? '주당 근무일수' : 'Days / Week',
    options:    isKo ? '계산 옵션' : 'Options',
    weeklyHol:  isKo ? '주휴수당 포함' : 'Include Weekly Holiday Pay',
    weeklyTip:  isKo ? '주 15시간 이상 근무 시 주휴수당(유급 휴무) 대상입니다.' : 'Applicable when working 15+ hours/week.',
    deduction:  isKo ? '세금 / 공제 방식' : 'Tax / Deduction',
    monthlyNet: isKo ? '예상 월 실수령액' : 'Est. Monthly Take-Home',
    weekly:     isKo ? '주급 (세전)' : 'Weekly Gross',
    monthly:    isKo ? '월급 (세전)' : 'Monthly Gross',
    deducted:   isKo ? '공제액' : 'Deductions',
    daily:      isKo ? '일급' : 'Daily Pay',
    overtime:   isKo ? '연장수당' : 'Overtime Pay',
    holiday:    isKo ? '주휴수당' : 'Holiday Allowance',
    weekHrs:    isKo ? '주당 근무시간' : 'Weekly Hours',
    disclaimer: isKo
      ? '이 결과는 추정치이며, 실제 수령액은 개인 상황·지역별 세율에 따라 달라질 수 있습니다.'
      : 'This is an estimate. Actual pay may differ based on state taxes, local laws, and personal circumstances.',
    usDisclaimer: isKo
      ? 'FICA(연방 사회보장세 7.65%) 기준 추정치입니다. 주(State)별 소득세에 따라 실제 수령액은 달라질 수 있습니다.'
      : 'Based on federal FICA (7.65%). State income taxes are not included — actual net pay may be lower.',
    minWageBadge: isKo ? '2026년 최저임금' : '2026 Fed. Min. Wage',
  };

  // KR deduction labels
  const krDeductionLabels: Record<KRDeduction, string> = {
    none: isKo ? '공제 없음' : 'No Deduction',
    withholdingTax: isKo ? '원천징수 3.3%' : 'Withholding 3.3%',
    insurance: isKo ? '4대보험 9.4%' : 'Insurance 9.4%',
  };

  const usDeductionLabels: Record<USDeduction, string> = {
    none: isKo ? '공제 없음' : 'No Deduction',
    fica: isKo ? 'FICA 7.65%' : 'FICA 7.65%',
  };

  // ── Stepper helper ─────────────────────────────────────────────────────────

  const Stepper = ({ value, min, max, step = 1, onChange }: {
    value: number; min: number; max: number; step?: number; onChange: (v: number) => void;
  }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <button onClick={() => onChange(Math.max(min, value - step))} style={stepBtn}>−</button>
      <span style={{ minWidth: '2.5rem', textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
        {value}
      </span>
      <button onClick={() => onChange(Math.min(max, value + step))} style={stepBtn}>+</button>
    </div>
  );

  return (
    <div>
      <NavigationActions />

      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{T.title}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{T.subtitle}</p>
        <span style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--surface-hover)', borderRadius: '1rem', padding: '0.2rem 0.75rem', border: '1px solid var(--border)' }}>
          📅 {lastUpdatedDisplay}
        </span>
      </header>

      {/* ── Country tab ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: '2rem', padding: '4px', gap: '4px' }}>
          {(['KR', 'US'] as Country[]).map(c => (
            <button
              key={c}
              onClick={() => switchCountry(c)}
              style={{
                padding: '0.55rem 2rem',
                borderRadius: '2rem',
                border: 'none',
                background: country === c ? 'var(--primary)' : 'transparent',
                color: country === c ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>{c === 'KR' ? '🇰🇷' : '🇺🇸'}</span>
              <span>{c === 'KR' ? (isKo ? '한국' : 'Korea') : (isKo ? '미국' : 'USA')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── Left: Inputs + Options ── */}
        <div style={{ flex: '1 1 300px', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Inputs */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <p style={sLabel}>{isKo ? '근무 조건 입력' : 'Work Conditions'}</p>

            {/* Hourly wage */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={fieldLabel}>{T.hourlyWage}</label>
                <span style={{ fontSize: '0.7rem', background: 'rgba(249,115,22,0.12)', color: 'var(--primary)', borderRadius: '0.75rem', padding: '0.15rem 0.6rem', fontWeight: 700 }}>
                  {T.minWageBadge}: {isCurrencyKRW ? `₩${CURRENT_DATA.KR.minWage.toLocaleString()}` : `$${CURRENT_DATA.US.minWage}`}
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  value={hourlyWage}
                  min={isCurrencyKRW ? CURRENT_DATA.KR.minWage : CURRENT_DATA.US.minWage}
                  step={isCurrencyKRW ? 10 : 0.25}
                  onChange={e => setHourlyWage(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%', padding: '0.85rem 1rem 0.85rem 2.25rem',
                    fontSize: '1.4rem', fontWeight: 800,
                    border: '2px solid var(--border)', borderRadius: 'var(--radius-md)',
                    background: 'var(--surface)', color: 'var(--text-primary)',
                    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Hours / day */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={fieldLabel}>{T.hpd}</label>
              <Stepper value={hoursPerDay} min={1} max={24} onChange={setHoursPerDay} />
            </div>

            {/* Days / week */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={fieldLabel}>{T.dpw}</label>
              <Stepper value={daysPerWeek} min={1} max={7} onChange={setDaysPerWeek} />
            </div>
          </div>

          {/* Options */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <p style={sLabel}>{T.options}</p>

            {country === 'KR' && (
              <>
                {/* Weekly holiday toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {T.weeklyHol}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: kr.isHolidayEligible ? '#10b981' : 'var(--text-muted)' }}>
                      {kr.isHolidayEligible
                        ? (isKo ? `✓ ${kr.weeklyHours}시간/주 — 대상` : `✓ ${kr.weeklyHours}h/wk — Eligible`)
                        : (isKo ? `✗ ${kr.weeklyHours}시간/주 (15시간 미만 — 미해당)` : `✗ ${kr.weeklyHours}h/wk (< 15h — Not eligible)`)}
                    </div>
                  </div>
                  <button
                    onClick={() => setWeeklyHolidayOn(v => !v)}
                    style={{
                      width: '3rem', height: '1.6rem', borderRadius: '1rem', border: 'none',
                      background: weeklyHolidayOn ? 'var(--primary)' : 'var(--border)',
                      cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '3px',
                      left: weeklyHolidayOn ? 'calc(100% - 1.3rem)' : '3px',
                      width: '1.1rem', height: '1.1rem', borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s',
                    }} />
                  </button>
                </div>

                {/* KR deduction */}
                <div>
                  <label style={{ ...fieldLabel, marginBottom: '0.5rem', display: 'block' }}>{T.deduction}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {(Object.keys(krDeductionLabels) as KRDeduction[]).map(key => (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: krDeduction === key ? 700 : 400, color: krDeduction === key ? 'var(--primary)' : 'var(--text-secondary)' }}>
                        <input type="radio" name="kr-deduction" checked={krDeduction === key} onChange={() => setKrDeduction(key)} style={{ accentColor: 'var(--primary)' }} />
                        {krDeductionLabels[key]}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {country === 'US' && (
              <>
                {/* US deduction */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ ...fieldLabel, marginBottom: '0.5rem', display: 'block' }}>{T.deduction}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {(Object.keys(usDeductionLabels) as USDeduction[]).map(key => (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: usDeduction === key ? 700 : 400, color: usDeduction === key ? 'var(--primary)' : 'var(--text-secondary)' }}>
                        <input type="radio" name="us-deduction" checked={usDeduction === key} onChange={() => setUsDeduction(key)} style={{ accentColor: 'var(--primary)' }} />
                        {usDeductionLabels[key]}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Overtime info */}
                {us.overtimeHours > 0 && (
                  <div style={{ padding: '0.75rem', background: 'rgba(249,115,22,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(249,115,22,0.2)', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                    ⏱️ {isKo ? `연장근로 ${us.overtimeHours.toFixed(1)}시간/주 → 1.5배 할증 적용` : `${us.overtimeHours.toFixed(1)} overtime hrs/wk → 1.5× rate applied`}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Right: Receipt Dashboard ── */}
        <div style={{ flex: '1 1 320px', minWidth: '300px' }}>
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
          }}>
            {/* Receipt header */}
            <div style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                {T.monthlyNet}
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1 }}>
                <AnimatedNumber value={Math.round(result.monthlyNet)} prefix={currencySymbol} />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', marginTop: '0.5rem' }}>
                {isKo ? '(세금 공제 후 예상 월 수령액)' : '(estimated after deductions)'}
              </div>
            </div>

            {/* Receipt body */}
            <div style={{ background: 'var(--surface)', padding: '0' }}>

              {/* Receipt rows */}
              {[
                { label: T.weekHrs, value: `${result.weeklyHours}${isKo ? '시간' : 'h'}`, highlight: false },
                { label: T.daily, value: fmt(result.dailyPay), highlight: false },
                ...(country === 'KR' && kr.weeklyHoliday > 0 ? [
                  { label: T.holiday, value: `+${fmt(kr.weeklyHoliday)}`, highlight: true },
                ] : []),
                ...(country === 'US' && us.overtimeHours > 0 ? [
                  { label: `${T.overtime} (${us.overtimeHours.toFixed(1)}h × 1.5×)`, value: `+${fmtUSD(us.weeklyOvertime)}`, highlight: true },
                ] : []),
                { label: T.weekly, value: fmt(result.weeklyGross), highlight: false },
              ].map((row, i) => (
                <div key={i} style={receiptRow}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: row.highlight ? '#10b981' : 'var(--text-primary)' }}>{row.value}</span>
                </div>
              ))}

              {/* Divider */}
              <div style={{ borderTop: '1px dashed var(--border)', margin: '0 1.25rem' }} />

              <div style={receiptRow}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{T.monthly}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(result.monthlyGross)}</span>
              </div>

              <div style={receiptRow}>
                <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                  {T.deducted} ({(result.deductionRate * 100).toFixed(1)}%)
                </span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>
                  −{fmt(result.monthlyDeduction)}
                </span>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '2px solid var(--primary)', margin: '0 1.25rem' }} />

              {/* Net total row */}
              <div style={{ ...receiptRow, padding: '1rem 1.25rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {T.monthlyNet}
                </span>
                <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--primary)' }}>
                  <AnimatedNumber value={Math.round(result.monthlyNet)} prefix={currencySymbol} />
                </span>
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{ background: 'var(--surface-hover)', padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                ⚠️ {country === 'US' ? T.usDisclaimer : T.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEO ── */}
      <SeoSection
        ko={{
          title: '2026년 주휴수당 계산법과 미국 연장근로 수당 규정 완전 가이드',
          description: '2026년 한국 최저임금은 시급 10,030원으로, 전년 대비 인상되었습니다. 주휴수당은 주 15시간 이상 근무하는 모든 근로자에게 적용되는 유급 휴무 수당으로, (주당 근무시간 ÷ 40시간) × 8시간 × 시급 공식으로 계산합니다. 미국에서는 주 40시간 초과분에 대해 1.5배 할증 임금이 연방법(FLSA)으로 보장됩니다. 4대보험 근로자 부담률은 국민연금 4.5%, 건강보험 3.545%, 고용보험 0.9%, 장기요양 0.457%를 합산한 약 9.4%이며, 이를 월급에서 공제한 금액이 실수령액입니다. 원천징수 3.3%는 프리랜서·단기 알바에 적용되는 세율입니다.',
          useCases: [
            { icon: '💼', title: '아르바이트 실수령액 확인', desc: '시급과 근무시간을 입력하면 주휴수당 포함 월 실수령액을 즉시 계산합니다.' },
            { icon: '📋', title: '근로계약 전 비교', desc: '여러 조건을 비교해 세금 공제 방식별 실제 차이를 확인합니다.' },
            { icon: '🇺🇸', title: '미국 취업 연봉 환산', desc: '시급과 주당 근무시간으로 월 실수령액(FICA 공제 후)을 계산합니다.' },
            { icon: '⏱️', title: '연장근로 수당 계산', desc: '미국 모드에서 주 40시간 초과 시 1.5배 할증 수당이 자동 반영됩니다.' },
          ],
          steps: [
            { step: '국가 선택 (KR / US)', desc: '상단 탭에서 한국 또는 미국 기준을 선택합니다. 최저임금과 통화 기호가 자동으로 변경됩니다.' },
            { step: '시급 및 근무 조건 입력', desc: '시급, 일일 근무시간, 주당 근무일수를 입력합니다. 최저임금 배지를 참고하세요.' },
            { step: '공제 방식 선택', desc: '공제 없음 · 원천징수 3.3% · 4대보험 9.4% 중 본인 상황에 맞는 방식을 선택합니다.' },
            { step: '월 실수령액 확인', desc: '영수증 스타일 대시보드에서 주급 → 월급 → 공제 내역 → 최종 실수령액을 확인합니다.' },
          ],
          faqs: [
            { q: '2026년 최저임금은 얼마인가요?', a: '2026년 한국 최저임금은 시급 10,030원입니다. 주 40시간(209시간/월) 기준 월 환산액은 약 2,096,270원입니다.' },
            { q: '주휴수당은 어떻게 계산하나요?', a: '주휴수당 공식: (주당 근무시간 ÷ 40) × 8시간 × 시급. 주 5일 8시간 근무 시 8시간분의 시급을 추가로 받습니다. 단, 주 15시간 미만 근무자는 해당되지 않습니다.' },
            { q: '4대보험과 원천징수 3.3% 중 어느 것이 적용되나요?', a: '정규직·계약직은 4대보험(국민연금+건강보험+고용보험+장기요양) 약 9.4%가 적용됩니다. 프리랜서·단기 아르바이트로 3.3% 원천징수 세율이 적용되는 경우는 사업소득으로 처리됩니다.' },
            { q: '미국 FICA란 무엇인가요?', a: 'FICA(Federal Insurance Contributions Act)는 사회보장세(Social Security 6.2%)와 메디케어세(Medicare 1.45%)를 합한 연방 의무 세금으로 총 7.65%입니다. 이 계산기는 주(State) 소득세는 포함하지 않으므로 실제 세후 수령액은 더 낮을 수 있습니다.' },
          ],
        }}
        en={{
          title: '2026 Weekly Holiday Pay Guide & US Overtime Rules Explained',
          description: "Korea's 2026 minimum wage is ₩10,030/hour. Weekly holiday pay (주휴수당) is a paid day off mandated for workers who work 15+ hours/week, calculated as (weekly hours ÷ 40) × 8 hours × hourly wage. In the US, the Fair Labor Standards Act (FLSA) guarantees 1.5× pay for all hours over 40/week. FICA deductions (7.65%) cover Social Security (6.2%) and Medicare (1.45%). Korea's national insurance covers four programs — national pension (4.5%), health insurance (3.545%), employment insurance (0.9%), and long-term care (0.457%) — totaling approximately 9.4% of gross pay deducted from the employee.",
          useCases: [
            { icon: '💼', title: 'Part-Time Take-Home Check', desc: 'Enter hourly wage and hours to instantly see monthly net pay including weekly holiday allowance.' },
            { icon: '📋', title: 'Job Offer Comparison', desc: 'Compare different schedules and deduction methods to see the real difference in net pay.' },
            { icon: '🇺🇸', title: 'US Salary to Monthly', desc: 'Convert your US hourly wage to monthly net pay after FICA deductions.' },
            { icon: '⏱️', title: 'Overtime Pay Calculator', desc: 'In US mode, hours beyond 40/week are automatically calculated at 1.5× rate.' },
          ],
          steps: [
            { step: 'Select Country (KR / US)', desc: 'Click the KR or US tab. The minimum wage default and currency symbol update automatically.' },
            { step: 'Enter Hourly Wage & Schedule', desc: 'Set your hourly wage, daily hours, and days per week using the inputs and stepper buttons.' },
            { step: 'Choose Deduction Type', desc: 'Select your applicable deduction: none, 3.3% withholding, 9.4% insurance (KR) or FICA 7.65% (US).' },
            { step: 'Read the Receipt', desc: 'The receipt dashboard breaks down daily pay → weekly gross → monthly gross → deductions → net pay.' },
          ],
          faqs: [
            { q: "What is Korea's 2026 minimum wage?", a: "Korea's 2026 minimum wage is ₩10,030 per hour. Working 209 hours/month (standard 40h/week basis), that equates to approximately ₩2,096,270/month gross before deductions." },
            { q: 'How is weekly holiday pay calculated?', a: 'Formula: (weekly work hours ÷ 40) × 8 hours × hourly wage. For a standard 5-day/40-hour week, this equals 8 extra hours of pay. Workers must work at least 15 hours/week to qualify.' },
            { q: 'What is the difference between 3.3% and 9.4% in Korea?', a: 'The 3.3% rate applies to freelancers and short-term gig workers as business income withholding. The 9.4% covers the employee share of four national insurance programs (pension, health, employment, long-term care) applied to regular employment contracts.' },
            { q: 'Why does the US result not include state taxes?', a: 'State income tax rates vary widely — from 0% (Texas, Florida) to over 13% (California). This calculator applies only federal FICA (7.65%) to give a consistent baseline. Your actual net pay depends on your state of residence.' },
          ],
        }}
      />
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const sLabel: React.CSSProperties = {
  fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem',
};

const fieldLabel: React.CSSProperties = {
  fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)',
};

const stepBtn: React.CSSProperties = {
  width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--border)', background: 'var(--surface-hover)',
  color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.15s',
};

const receiptRow: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '0.7rem 1.25rem', borderBottom: '1px solid var(--border)',
};
