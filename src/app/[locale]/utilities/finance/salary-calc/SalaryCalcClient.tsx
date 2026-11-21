'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Wallet, Plus, Minus, Copy, Check } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { WEEKS_PER_MONTH, currentKrYear, krInsurance, krYears, wageData } from '@/constants/wageConfig';
import AnnualSalaryPanel from './AnnualSalaryPanel';
import s from './salary.module.css';
import { ui } from '@/app/components/ui';

type Country = 'KR' | 'US';
type KRMode = 'annual' | 'hourly';
type KRDeduction = 'none' | 'withholdingTax' | 'insurance';
type USDeduction = 'none' | 'fica' | 'ficaFederal';

const MULTIPLIERS = [1.5, 2.0, 2.5, 3.0];

interface WorkBlock {
  hoursPerDay: number;
  daysPerWeek: number;
  multiplier: number;
}

const DEFAULT_REG: WorkBlock = { hoursPerDay: 8, daysPerWeek: 5, multiplier: 1.0 };
const DEFAULT_OT: WorkBlock  = { hoursPerDay: 0, daysPerWeek: 0, multiplier: 1.5 };

/* ─── KR Calculation ─── */
function calcKR(
  hW: number,
  reg: WorkBlock, ot: WorkBlock, sp: WorkBlock,
  holidayOn: boolean, deduction: KRDeduction, year: number
) {
  const regH = reg.hoursPerDay * reg.daysPerWeek;
  const otH  = ot.hoursPerDay  * ot.daysPerWeek;
  const spH  = sp.hoursPerDay  * sp.daysPerWeek;

  const regPay = regH * hW;
  const otPay  = otH  * hW * ot.multiplier;
  const spPay  = spH  * hW * sp.multiplier;

  const holidayPay = holidayOn && regH >= 15
    ? (Math.min(regH, 40) / 40) * 8 * hW
    : 0;

  const weeklyGross  = regPay + otPay + spPay + holidayPay;
  const monthlyGross = weeklyGross * WEEKS_PER_MONTH;
  const dRate        = wageData(year).KR.deductions[deduction];
  const deductAmt    = monthlyGross * dRate;

  return {
    totalH: regH + otH + spH,
    regH, otH, spH,
    regPay, otPay, spPay, holidayPay,
    weeklyGross, monthlyGross, deductAmt,
    monthlyNet: monthlyGross - deductAmt,
    dRate,
  };
}

/* ─── US Calculation ─── */
function calcUS(
  hW: number,
  reg: WorkBlock, ot: WorkBlock, hol: WorkBlock,
  deduction: USDeduction, year: number
) {
  const regH = reg.hoursPerDay * reg.daysPerWeek;
  const otH  = ot.hoursPerDay  * ot.daysPerWeek;
  const holH = hol.hoursPerDay * hol.daysPerWeek;

  const regPay = regH * hW;
  const otPay  = otH  * hW * ot.multiplier;
  const holPay = holH * hW * hol.multiplier;

  const weeklyGross  = regPay + otPay + holPay;
  const monthlyGross = weeklyGross * WEEKS_PER_MONTH;
  const dRate        = wageData(year).US.deductions[deduction];
  const deductAmt    = monthlyGross * dRate;

  return {
    totalH: regH + otH + holH,
    regH, otH, holH,
    regPay, otPay, holPay,
    weeklyGross, monthlyGross, deductAmt,
    monthlyNet: monthlyGross - deductAmt,
    dRate,
  };
}

/* ─── Sub-components ─── */

function MiniStepper({
  value, min, max, onChange, unit,
}: { value: number; min: number; max: number; onChange: (v: number) => void; unit: string }) {
  return (
    <div className={s.sal_mini_stepper}>
      <button className={s.sal_mini_btn} onClick={() => onChange(Math.max(min, value - 1))}><Minus size={12} /></button>
      <span className={s.sal_mini_val}>{value}{unit}</span>
      <button className={s.sal_mini_btn} onClick={() => onChange(Math.min(max, value + 1))}><Plus size={12} /></button>
    </div>
  );
}

function MultiplierPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className={ui.chips}>
      {MULTIPLIERS.map(m => (
        <button
          key={m}
          className={`${ui.chip} ${ui.pill} ${value === m ? ui.chipActive : ''}`}
          onClick={() => onChange(m)}
        >
          ×{m.toFixed(1)}
        </button>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */

export default function SalaryCalcClient({ seo, initialYear }: { seo?: React.ReactNode; initialYear: number }) {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [country, setCountry]       = useState<Country>('KR');
  const [krMode, setKrMode]         = useState<KRMode>('annual');
  // 입력 중인 문자열을 그대로 보관해야 "7." 같은 소수점 입력이 가능하다
  // 기준 연도: 서버가 준 올해(한국 시간)로 시작하고, 브라우저에서 한 번 더 확인한다
  const [year, setYear]             = useState(initialYear);
  const years = krYears();
  const data = wageData(year);
  const [wageText, setWageText]     = useState(String(wageData(initialYear).KR.minWage));
  const hourlyWage = parseFloat(wageText) || 0;
  const [regular, setRegular]       = useState<WorkBlock>(DEFAULT_REG);
  const [overtime, setOvertime]     = useState<WorkBlock>(DEFAULT_OT);
  const [special, setSpecial]       = useState<WorkBlock>(DEFAULT_OT);
  const [holidayOn, setHolidayOn]   = useState(true);
  const [krDeduction, setKrDeduction] = useState<KRDeduction>('insurance');
  const [usDeduction, setUsDeduction] = useState<USDeduction>('fica');
  const [copied, setCopied]         = useState(false);


  const isKRW = country === 'KR';
  const showAnnual = isKRW && krMode === 'annual';
  const insurancePct = (data.KR.deductions.insurance * 100).toFixed(2);
  const pending = krInsurance(year).pending;

  // 해가 바뀐 뒤 캐시된 화면을 열었을 때: 올해로 맞춘다 (최저시급 그대로였으면 함께 바꾼다)
  useEffect(() => {
    const now = currentKrYear();
    if (now === initialYear) return;
    void Promise.resolve().then(() => {
      setYear(now);
      setWageText((w) => (w === String(wageData(initialYear).KR.minWage) ? String(wageData(now).KR.minWage) : w));
    });
  }, [initialYear]);

  const changeYear = (y: number) => {
    // 시급이 그 해 최저시급 그대로였으면 새 연도 최저시급으로 바꿔 준다
    if (isKRW && wageText === String(data.KR.minWage)) setWageText(String(wageData(y).KR.minWage));
    setYear(y);
  };

  const switchCountry = (c: Country) => {
    setCountry(c);
    setWageText(String(c === 'KR' ? data.KR.minWage : data.US.minWage));
    setRegular(DEFAULT_REG);
    setOvertime(DEFAULT_OT);
    setSpecial(DEFAULT_OT);
  };

  const fmt = (n: number) =>
    isKRW
      ? `₩${Math.round(n).toLocaleString()}`
      : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const kr = calcKR(hourlyWage, regular, overtime, special, holidayOn, krDeduction, year);
  const us = calcUS(hourlyWage, regular, overtime, special, usDeduction, year);
  const res = isKRW ? kr : us;

  const handleCopy = () => {
    const r = isKRW ? kr : us;
    const lines = [
      isKo ? '급여 & 실수령액 계산기' : 'Salary & Net Pay Calculator',
      `${isKo ? '주 총급여' : 'Weekly Gross'}: ${fmt(r.weeklyGross)}`,
      `${isKo ? '월 총급여' : 'Monthly Gross'}: ${fmt(r.monthlyGross)}`,
      `${isKo ? '공제액' : 'Deductions'}: -${fmt(r.deductAmt)} (${(r.dRate * 100).toFixed(1)}%)`,
      `${isKo ? '최종 실수령액' : 'Net Take-Home'}: ${fmt(r.monthlyNet)}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  /* ─── Receipt rows helper ─── */
  const ReceiptRow = ({
    label, value, color, sub,
  }: { label: string; value: string; color?: string; sub?: string }) => (
    <div className={s.sal_receipt_row}>
      <span className={s.sal_row_label} style={color ? { color } : undefined}>
        {label}
        {sub && <span style={{ display: 'block', fontSize: '0.65rem', opacity: 0.7 }}>{sub}</span>}
      </span>
      <span className={s.sal_row_value} style={color ? { color } : undefined}>{value}</span>
    </div>
  );

  return (
    <div className={s.sal_container}>
      <NavigationActions />
      <ToolHeader
        icon={<Wallet />}
        title={isKo ? `${year} 연봉·급여 실수령액 계산기` : `${year} Salary & Take-Home Pay Calculator`}
        subtitle={isKo ? '연봉·월급은 4대보험과 소득세까지, 시급은 주휴수당·잔업·특근까지 계산합니다' : 'Korean salary after social insurance and income tax, plus hourly pay with overtime.'}
      />

      {/* Country Tabs */}
      <div className={`${ui.segmented} ${s.sal_seg}`}>
        {(['KR', 'US'] as Country[]).map(c => (
          <button key={c} onClick={() => switchCountry(c)} className={`${ui.segment} ${country === c ? ui.segmentActive : ''}`}>
            {c === 'KR' ? '🇰🇷 KOREA' : '🇺🇸 USA'}
          </button>
        ))}
      </div>

      {/* KR 계산 방식: 연봉·월급 / 시급·알바 */}
      {isKRW && (
        <div role="tablist" aria-label={isKo ? '계산 방식' : 'Calculation mode'} className={`${ui.segmented} ${s.sal_seg}`}>
          {(['annual', 'hourly'] as KRMode[]).map(m => (
            <button key={m} role="tab" aria-selected={krMode === m} onClick={() => setKrMode(m)} className={`${ui.segment} ${krMode === m ? ui.segmentActive : ''}`}>
              {m === 'annual'
                ? (isKo ? '💼 연봉·월급 실수령액' : '💼 Annual / Monthly Salary')
                : (isKo ? '⏱️ 시급·알바 (주휴수당)' : '⏱️ Hourly / Part-time')}
            </button>
          ))}
        </div>
      )}

      {/* 기준 연도 (한국 요율·최저시급) */}
      {isKRW && years.length > 1 && (
        <div className={`${ui.field} ${s.sal_seg}`}>
          <span className={ui.label}>{isKo ? '기준 연도' : 'Rate year'}</span>
          <div className={`${ui.chips} ${ui.grow}`}>
            {years.map((y) => (
              <button key={y} type="button" aria-pressed={year === y} className={`${ui.chip} ${year === y ? ui.chipActive : ''}`} onClick={() => changeYear(y)}>
                {isKo ? `${y}년` : y}
              </button>
            ))}
          </div>
          {pending.map((p) => (
            <span key={p.name} className={ui.hint}>
              {isKo ? `${p.name}: 아직 확정되지 않았습니다.${p.note ? ` ${p.note}` : ''}` : `The ${year} employment insurance rate is not finalised yet, so the current rate is used.`}
            </span>
          ))}
        </div>
      )}

      {showAnnual ? <AnnualSalaryPanel isKo={isKo} year={year} /> : (
      <div className={s.sal_main_grid}>
        {/* ── Left: Input Panel ── */}
        <div className={ui.card}>

          {/* 시급 */}
          <div className={`${ui.field} ${s.sal_input_group}`}>
            <label className={ui.label}>{isKo ? '시급 (Hourly Wage)' : 'Hourly Wage'}</label>
            <div className={ui.inputGroup}>
              <input
                className={`${ui.input} ${ui.inputLg}`}
                inputMode="decimal"
                value={wageText}
                onChange={e => {
                  const [int, ...dec] = e.target.value.replace(/[^0-9.]/g, '').split('.');
                  setWageText(dec.length ? `${int}.${dec.join('').slice(0, 2)}` : int);
                }}
                placeholder="0"
              />
              <span className={ui.unit}>
                {isKRW ? '₩' : '$'}
              </span>
            </div>
            <div className={ui.hint}>
              {isKRW
                ? (isKo ? `${year}년 최저시급 ₩${data.KR.minWage.toLocaleString()}` : `${year} Korean minimum wage ₩${data.KR.minWage.toLocaleString()}`)
                : `Federal min. wage $${data.US.minWage.toFixed(2)}`}
            </div>
          </div>

          {/* ── 주당 근무형태 ── */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div className={s.sal_section_title}>
              {isKo ? '주당 근무형태' : 'Weekly Work Schedule'}
            </div>

            {/* 일반 근무 */}
            <div className={s.sal_work_block}>
              <div className={s.sal_block_label}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
                {isKo ? '일반 근무' : 'Regular Work'}
              </div>
              <div className={s.sal_block_inputs}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>{isKo ? '시간/일' : 'hrs/day'}</div>
                  <MiniStepper value={regular.hoursPerDay} min={0} max={24} unit="h"
                    onChange={v => setRegular(b => ({ ...b, hoursPerDay: v }))} />
                </div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700, marginTop: 16 }}>×</span>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>{isKo ? '근무일수/주' : 'days/wk'}</div>
                  <MiniStepper value={regular.daysPerWeek} min={0} max={7} unit={isKo ? '일' : 'd'}
                    onChange={v => setRegular(b => ({ ...b, daysPerWeek: v }))} />
                </div>
              </div>
              {regular.hoursPerDay * regular.daysPerWeek > 0 && (
                <div className={s.sal_block_preview}>
                  {isKo ? '주' : 'wk'} {regular.hoursPerDay * regular.daysPerWeek}h → {fmt(regular.hoursPerDay * regular.daysPerWeek * hourlyWage)}
                </div>
              )}
            </div>

            {/* 잔업 / Overtime */}
            <div className={s.sal_work_block}>
              <div className={s.sal_block_label}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                {isKo ? '잔업 (연장근로)' : 'Overtime'}
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto', fontWeight: 600 }}>
                  {isKo ? '일반근무 후 연장' : 'after regular hrs'}
                </span>
              </div>
              <div className={s.sal_block_inputs}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>{isKo ? '시간/일' : 'hrs/day'}</div>
                  <MiniStepper value={overtime.hoursPerDay} min={0} max={12} unit="h"
                    onChange={v => setOvertime(b => ({ ...b, hoursPerDay: v }))} />
                </div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700, marginTop: 16 }}>×</span>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>{isKo ? '근무일수/주' : 'days/wk'}</div>
                  <MiniStepper value={overtime.daysPerWeek} min={0} max={7} unit={isKo ? '일' : 'd'}
                    onChange={v => setOvertime(b => ({ ...b, daysPerWeek: v }))} />
                </div>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem' }}>{isKo ? '시급 배율' : 'Pay Rate'}</div>
                <MultiplierPicker value={overtime.multiplier} onChange={v => setOvertime(b => ({ ...b, multiplier: v }))} />
              </div>
              {overtime.hoursPerDay * overtime.daysPerWeek > 0 && (
                <div className={s.sal_block_preview} style={{ color: 'var(--tint-amber-fg)' }}>
                  {isKo ? '주' : 'wk'} {overtime.hoursPerDay * overtime.daysPerWeek}h × {overtime.multiplier}x → {fmt(overtime.hoursPerDay * overtime.daysPerWeek * hourlyWage * overtime.multiplier)}
                </div>
              )}
            </div>

            {/* 특근 / Holiday Work */}
            <div className={s.sal_work_block}>
              <div className={s.sal_block_label}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                {isKo ? '특근 (휴일근로)' : 'Holiday / Special Work'}
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto', fontWeight: 600 }}>
                  {isKo ? '휴일·별도 근무' : 'weekend/holiday'}
                </span>
              </div>
              <div className={s.sal_block_inputs}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>{isKo ? '시간/일' : 'hrs/day'}</div>
                  <MiniStepper value={special.hoursPerDay} min={0} max={24} unit="h"
                    onChange={v => setSpecial(b => ({ ...b, hoursPerDay: v }))} />
                </div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700, marginTop: 16 }}>×</span>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>{isKo ? '근무일수/주' : 'days/wk'}</div>
                  <MiniStepper value={special.daysPerWeek} min={0} max={7} unit={isKo ? '일' : 'd'}
                    onChange={v => setSpecial(b => ({ ...b, daysPerWeek: v }))} />
                </div>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem' }}>{isKo ? '시급 배율' : 'Pay Rate'}</div>
                <MultiplierPicker value={special.multiplier} onChange={v => setSpecial(b => ({ ...b, multiplier: v }))} />
              </div>
              {special.hoursPerDay * special.daysPerWeek > 0 && (
                <div className={s.sal_block_preview} style={{ color: 'var(--tint-red-fg)' }}>
                  {isKo ? '주' : 'wk'} {special.hoursPerDay * special.daysPerWeek}h × {special.multiplier}x → {fmt(special.hoursPerDay * special.daysPerWeek * hourlyWage * special.multiplier)}
                </div>
              )}
            </div>
          </div>

          {/* ── 추가 옵션 ── */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <div className={s.sal_section_title}>{isKo ? '추가 옵션' : 'Options'}</div>

            {isKRW ? (
              <>
                {/* 주휴수당 토글 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '1rem', background: 'var(--surface-hover)', borderRadius: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{isKo ? '주휴수당 포함' : 'Include Weekly Holiday Pay'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {isKo ? `일반근무 주 15시간 이상 대상 | 현재: ${kr.totalH > 0 ? (regular.hoursPerDay * regular.daysPerWeek >= 15 ? '✅ 해당' : '❌ 미해당') : '-'}` : '15+ regular hrs/wk required'}
                    </div>
                  </div>
                  <button onClick={() => setHolidayOn(v => !v)} style={{
                    width: '44px', height: '24px', borderRadius: '12px',
                    background: holidayOn ? 'var(--primary-fill)' : 'var(--text-muted)',
                    position: 'relative', border: 'none', cursor: 'pointer', flexShrink: 0,
                  }}>
                    <div style={{ width: '18px', height: '18px', background: 'var(--surface)', borderRadius: '50%', position: 'absolute', top: '3px', left: holidayOn ? '23px' : '3px', transition: 'left 0.2s' }} />
                  </button>
                </div>

                {/* 공제 선택 */}
                <div className={`${ui.chips} ${ui.grow}`}>
                  {(['none', 'withholdingTax', 'insurance'] as KRDeduction[]).map(k => (
                    <button key={k} onClick={() => setKrDeduction(k)} className={`${ui.chip} ${krDeduction === k ? ui.chipActive : ''}`}>
                      {k === 'none' ? (isKo ? '공제 전' : 'Gross') : k === 'withholdingTax' ? '3.3%' : (isKo ? `4대보험 ${insurancePct}%` : `${insurancePct}% Insurance`)}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className={`${ui.chips} ${ui.grow}`}>
                {(['none', 'fica', 'ficaFederal'] as USDeduction[]).map(u => (
                  <button key={u} onClick={() => setUsDeduction(u)} className={`${ui.chip} ${usDeduction === u ? ui.chipActive : ''}`}>
                    {u === 'none' ? 'Gross' : u === 'fica' ? 'FICA 7.65%' : 'FICA+Federal ~22%'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Receipt ── */}
        <div className={`${s.sal_receipt} light-island`}>
          <div className={s.sal_receipt_header}>
            <div className={s.sal_receipt_label}>{isKo ? '예상 월 실수령액' : 'Estimated Monthly Net'}</div>
            <div className={s.sal_receipt_net}>{fmt(res.monthlyNet)}</div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', opacity: 0.85, fontWeight: 700 }}>
              {isKo ? `총 주 ${res.totalH}시간 근무` : `Total ${res.totalH}h / week`}
            </div>
          </div>

          <div className={s.sal_receipt_body}>
            {/* 주급 명세 */}
            <div style={{ padding: '0.75rem 2rem 0', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isKo ? '주급 상세' : 'Weekly Detail'}
            </div>

            <ReceiptRow
              label={isKo ? '일반근무' : 'Regular'}
              sub={`${regular.hoursPerDay}h × ${regular.daysPerWeek}${isKo ? '일' : 'd'} = ${regular.hoursPerDay * regular.daysPerWeek}h`}
              value={fmt(res.regPay)}
            />

            {res.otPay > 0 && (
              <ReceiptRow
                label={isKo ? '잔업수당' : 'Overtime'}
                sub={`${overtime.hoursPerDay}h × ${overtime.daysPerWeek}${isKo ? '일' : 'd'} × ${overtime.multiplier}x`}
                value={`+${fmt(res.otPay)}`}
                color="#f59e0b"
              />
            )}

            {(isKRW ? kr.spPay : us.holPay) > 0 && (
              <ReceiptRow
                label={isKo ? '특근수당' : 'Holiday Pay'}
                sub={`${special.hoursPerDay}h × ${special.daysPerWeek}${isKo ? '일' : 'd'} × ${special.multiplier}x`}
                value={`+${fmt(isKRW ? kr.spPay : us.holPay)}`}
                color="#ef4444"
              />
            )}

            {isKRW && kr.holidayPay > 0 && (
              <ReceiptRow
                label={isKo ? '주휴수당' : 'Weekly Holiday'}
                sub={isKo ? `소정근로 ${regular.hoursPerDay * regular.daysPerWeek}h 기준` : `based on ${regular.hoursPerDay * regular.daysPerWeek}h/wk`}
                value={`+${fmt(kr.holidayPay)}`}
                color="#10b981"
              />
            )}

            <div style={{ borderTop: '1.5px dashed var(--border)', margin: '0.5rem 2rem' }} />

            <ReceiptRow
              label={isKo ? '주 총급여' : 'Weekly Gross'}
              value={fmt(res.weeklyGross)}
            />

            <div style={{ padding: '0.5rem 2rem', background: 'var(--surface-hover)', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              × {WEEKS_PER_MONTH.toFixed(3)} {isKo ? '주/월' : 'wks/mo'}
            </div>

            {/* 월급 명세 */}
            <div style={{ padding: '0.5rem 2rem 0', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isKo ? '월급 명세' : 'Monthly Detail'}
            </div>

            <ReceiptRow
              label={isKo ? '월 총급여 (세전)' : 'Monthly Gross'}
              value={fmt(res.monthlyGross)}
            />
            <ReceiptRow
              label={isKo ? `공제 (${(res.dRate * 100).toFixed(1)}%)` : `Deductions (${(res.dRate * 100).toFixed(1)}%)`}
              value={`-${fmt(res.deductAmt)}`}
              color="#ef4444"
            />

            <div className={s.sal_receipt_row} style={{ background: '#fdfbff', padding: '1.5rem 2rem' }}>
              <span className={s.sal_row_label} style={{ color: '#8b5cf6', fontWeight: 900 }}>{isKo ? '최종 실수령액' : 'Net Take-Home'}</span>
              <span className={s.sal_row_value} style={{ fontSize: '1.4rem', color: '#8b5cf6', fontWeight: 950 }}>{fmt(res.monthlyNet)}</span>
            </div>
          </div>

          <div style={{ padding: '1rem 2rem', background: 'var(--surface-hover)', borderTop: '1px solid var(--border)', fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {isKRW
              ? (isKo
                ? '* 4대보험 모드는 보험료만 공제하며 근로소득세·지방소득세는 포함하지 않습니다. 세금까지 반영한 실수령액은 상단 "연봉·월급 실수령액" 탭에서 확인하세요.'
                : '* Insurance mode deducts social insurance only, not income tax. Use the "Annual / Monthly Salary" tab for take-home pay after income tax.')
              : (isKo
                ? '* 주·지방 세금 및 개인 공제에 따라 실제 수령액은 달라질 수 있습니다.'
                : '* State/local taxes and personal deductions may further reduce net pay.')}
          </div>
          <div className={s.sal_copy_row}>
            <button
              className={`${s.sal_copy_btn} ${copied ? s.sal_copy_btn_done : ''}`}
              onClick={handleCopy}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? (isKo ? '복사됨!' : 'Copied!') : (isKo ? '결과 복사' : 'Copy Result')}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Standard Bottom Sections */}
      <div style={{ width: '100%' }}>
        <ShareBar title={isKo ? `${year} 연봉·급여 실수령액 계산기` : 'Korean Salary & Take-Home Pay Calculator'} description={isKo ? '4대보험·소득세 공제 후 월 실수령액 계산' : 'Monthly take-home pay after insurance and income tax'} />
        <RelatedTools toolId="utilities/finance/salary-calc" />
        {seo}
      </div>
    </div>
  );
}
