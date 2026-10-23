'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Wallet, Plus, Minus, Copy, Check } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { CURRENT_DATA, WEEKS_PER_MONTH } from '@/constants/wageConfig';
import AnnualSalaryPanel from './AnnualSalaryPanel';
import s from './salary.module.css';

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
  holidayOn: boolean, deduction: KRDeduction
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
  const dRate        = CURRENT_DATA.KR.deductions[deduction];
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
  deduction: USDeduction
) {
  const regH = reg.hoursPerDay * reg.daysPerWeek;
  const otH  = ot.hoursPerDay  * ot.daysPerWeek;
  const holH = hol.hoursPerDay * hol.daysPerWeek;

  const regPay = regH * hW;
  const otPay  = otH  * hW * ot.multiplier;
  const holPay = holH * hW * hol.multiplier;

  const weeklyGross  = regPay + otPay + holPay;
  const monthlyGross = weeklyGross * WEEKS_PER_MONTH;
  const dRate        = CURRENT_DATA.US.deductions[deduction];
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
    <div className={s.sal_mult_row}>
      {MULTIPLIERS.map(m => (
        <button
          key={m}
          className={`${s.sal_mult_btn} ${value === m ? s.sal_mult_btn_active : ''}`}
          onClick={() => onChange(m)}
        >
          ×{m.toFixed(1)}
        </button>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */

export default function SalaryCalcClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [country, setCountry]       = useState<Country>('KR');
  const [krMode, setKrMode]         = useState<KRMode>('annual');
  // 입력 중인 문자열을 그대로 보관해야 "7." 같은 소수점 입력이 가능하다
  const [wageText, setWageText]     = useState(String(CURRENT_DATA.KR.minWage));
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
  const insurancePct = (CURRENT_DATA.KR.deductions.insurance * 100).toFixed(2);

  const switchCountry = (c: Country) => {
    setCountry(c);
    setWageText(String(c === 'KR' ? CURRENT_DATA.KR.minWage : CURRENT_DATA.US.minWage));
    setRegular(DEFAULT_REG);
    setOvertime(DEFAULT_OT);
    setSpecial(DEFAULT_OT);
  };

  const fmt = (n: number) =>
    isKRW
      ? `₩${Math.round(n).toLocaleString()}`
      : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const kr = calcKR(hourlyWage, regular, overtime, special, holidayOn, krDeduction);
  const us = calcUS(hourlyWage, regular, overtime, special, usDeduction);
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
      <header className={s.sal_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Wallet size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.sal_title}>{isKo ? '2026 연봉·급여 실수령액 계산기' : '2026 Salary & Take-Home Pay Calculator'}</h1>
        <p className={s.sal_subtitle}>{isKo ? '연봉·월급은 4대보험과 소득세까지, 시급은 주휴수당·잔업·특근까지 계산합니다' : 'Korean salary after social insurance and income tax, plus hourly pay with overtime.'}</p>
      </header>

      {/* Country Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        {(['KR', 'US'] as Country[]).map(c => (
          <button key={c} onClick={() => switchCountry(c)} style={{
            padding: '0.75rem 2rem', borderRadius: '2rem', border: '1px solid #e2e8f0',
            background: country === c ? '#8b5cf6' : 'white',
            color: country === c ? 'white' : '#64748b',
            fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {c === 'KR' ? '🇰🇷 KOREA' : '🇺🇸 USA'}
          </button>
        ))}
      </div>

      {/* KR 계산 방식: 연봉·월급 / 시급·알바 */}
      {isKRW && (
        <div role="tablist" aria-label={isKo ? '계산 방식' : 'Calculation mode'} style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {(['annual', 'hourly'] as KRMode[]).map(m => (
            <button key={m} role="tab" aria-selected={krMode === m} onClick={() => setKrMode(m)} style={{
              padding: '0.6rem 1.5rem', borderRadius: '0.75rem',
              border: `1.5px solid ${krMode === m ? 'var(--primary)' : 'var(--border)'}`,
              background: krMode === m ? 'var(--surface-hover)' : 'var(--surface)',
              color: krMode === m ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
            }}>
              {m === 'annual'
                ? (isKo ? '💼 연봉·월급 실수령액' : '💼 Annual / Monthly Salary')
                : (isKo ? '⏱️ 시급·알바 (주휴수당)' : '⏱️ Hourly / Part-time')}
            </button>
          ))}
        </div>
      )}

      {showAnnual ? <AnnualSalaryPanel isKo={isKo} /> : (
      <div className={s.sal_main_grid}>
        {/* ── Left: Input Panel ── */}
        <div className={s.sal_card}>

          {/* 시급 */}
          <div className={s.sal_input_group}>
            <label className={s.sal_label}>{isKo ? '시급 (Hourly Wage)' : 'Hourly Wage'}</label>
            <div style={{ position: 'relative' }}>
              <input
                className={s.sal_input}
                inputMode="decimal"
                value={wageText}
                onChange={e => {
                  const [int, ...dec] = e.target.value.replace(/[^0-9.]/g, '').split('.');
                  setWageText(dec.length ? `${int}.${dec.join('').slice(0, 2)}` : int);
                }}
                placeholder="0"
              />
              <span style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: '#94a3b8', fontSize: '1.25rem' }}>
                {isKRW ? '₩' : '$'}
              </span>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
              {isKRW
                ? `2026 최저시급 ₩${CURRENT_DATA.KR.minWage.toLocaleString()}`
                : `Federal min. wage $${CURRENT_DATA.US.minWage.toFixed(2)}`}
            </div>
          </div>

          {/* ── 주당 근무형태 ── */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
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
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.25rem' }}>{isKo ? '시간/일' : 'hrs/day'}</div>
                  <MiniStepper value={regular.hoursPerDay} min={0} max={24} unit="h"
                    onChange={v => setRegular(b => ({ ...b, hoursPerDay: v }))} />
                </div>
                <span style={{ color: '#cbd5e1', fontWeight: 700, marginTop: 16 }}>×</span>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.25rem' }}>{isKo ? '근무일수/주' : 'days/wk'}</div>
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
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginLeft: 'auto', fontWeight: 600 }}>
                  {isKo ? '일반근무 후 연장' : 'after regular hrs'}
                </span>
              </div>
              <div className={s.sal_block_inputs}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.25rem' }}>{isKo ? '시간/일' : 'hrs/day'}</div>
                  <MiniStepper value={overtime.hoursPerDay} min={0} max={12} unit="h"
                    onChange={v => setOvertime(b => ({ ...b, hoursPerDay: v }))} />
                </div>
                <span style={{ color: '#cbd5e1', fontWeight: 700, marginTop: 16 }}>×</span>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.25rem' }}>{isKo ? '근무일수/주' : 'days/wk'}</div>
                  <MiniStepper value={overtime.daysPerWeek} min={0} max={7} unit={isKo ? '일' : 'd'}
                    onChange={v => setOvertime(b => ({ ...b, daysPerWeek: v }))} />
                </div>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.35rem' }}>{isKo ? '시급 배율' : 'Pay Rate'}</div>
                <MultiplierPicker value={overtime.multiplier} onChange={v => setOvertime(b => ({ ...b, multiplier: v }))} />
              </div>
              {overtime.hoursPerDay * overtime.daysPerWeek > 0 && (
                <div className={s.sal_block_preview} style={{ color: '#f59e0b' }}>
                  {isKo ? '주' : 'wk'} {overtime.hoursPerDay * overtime.daysPerWeek}h × {overtime.multiplier}x → {fmt(overtime.hoursPerDay * overtime.daysPerWeek * hourlyWage * overtime.multiplier)}
                </div>
              )}
            </div>

            {/* 특근 / Holiday Work */}
            <div className={s.sal_work_block}>
              <div className={s.sal_block_label}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                {isKo ? '특근 (휴일근로)' : 'Holiday / Special Work'}
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginLeft: 'auto', fontWeight: 600 }}>
                  {isKo ? '휴일·별도 근무' : 'weekend/holiday'}
                </span>
              </div>
              <div className={s.sal_block_inputs}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.25rem' }}>{isKo ? '시간/일' : 'hrs/day'}</div>
                  <MiniStepper value={special.hoursPerDay} min={0} max={24} unit="h"
                    onChange={v => setSpecial(b => ({ ...b, hoursPerDay: v }))} />
                </div>
                <span style={{ color: '#cbd5e1', fontWeight: 700, marginTop: 16 }}>×</span>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.25rem' }}>{isKo ? '근무일수/주' : 'days/wk'}</div>
                  <MiniStepper value={special.daysPerWeek} min={0} max={7} unit={isKo ? '일' : 'd'}
                    onChange={v => setSpecial(b => ({ ...b, daysPerWeek: v }))} />
                </div>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.35rem' }}>{isKo ? '시급 배율' : 'Pay Rate'}</div>
                <MultiplierPicker value={special.multiplier} onChange={v => setSpecial(b => ({ ...b, multiplier: v }))} />
              </div>
              {special.hoursPerDay * special.daysPerWeek > 0 && (
                <div className={s.sal_block_preview} style={{ color: '#ef4444' }}>
                  {isKo ? '주' : 'wk'} {special.hoursPerDay * special.daysPerWeek}h × {special.multiplier}x → {fmt(special.hoursPerDay * special.daysPerWeek * hourlyWage * special.multiplier)}
                </div>
              )}
            </div>
          </div>

          {/* ── 추가 옵션 ── */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
            <div className={s.sal_section_title}>{isKo ? '추가 옵션' : 'Options'}</div>

            {isKRW ? (
              <>
                {/* 주휴수당 토글 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{isKo ? '주휴수당 포함' : 'Include Weekly Holiday Pay'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {isKo ? `일반근무 주 15시간 이상 대상 | 현재: ${kr.totalH > 0 ? (regular.hoursPerDay * regular.daysPerWeek >= 15 ? '✅ 해당' : '❌ 미해당') : '-'}` : '15+ regular hrs/wk required'}
                    </div>
                  </div>
                  <button onClick={() => setHolidayOn(v => !v)} style={{
                    width: '44px', height: '24px', borderRadius: '12px',
                    background: holidayOn ? '#8b5cf6' : '#cbd5e1',
                    position: 'relative', border: 'none', cursor: 'pointer', flexShrink: 0,
                  }}>
                    <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: holidayOn ? '23px' : '3px', transition: 'left 0.2s' }} />
                  </button>
                </div>

                {/* 공제 선택 */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(['none', 'withholdingTax', 'insurance'] as KRDeduction[]).map(k => (
                    <button key={k} onClick={() => setKrDeduction(k)} style={{
                      flex: 1, minWidth: 80, padding: '0.6rem 0.5rem', borderRadius: '0.75rem',
                      border: `1.5px solid ${krDeduction === k ? '#8b5cf6' : '#e2e8f0'}`,
                      background: krDeduction === k ? '#f5f3ff' : 'white',
                      color: krDeduction === k ? '#8b5cf6' : '#64748b',
                      fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
                    }}>
                      {k === 'none' ? (isKo ? '공제 전' : 'Gross') : k === 'withholdingTax' ? '3.3%' : (isKo ? `4대보험 ${insurancePct}%` : `${insurancePct}% Insurance`)}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(['none', 'fica', 'ficaFederal'] as USDeduction[]).map(u => (
                  <button key={u} onClick={() => setUsDeduction(u)} style={{
                    flex: 1, minWidth: 90, padding: '0.6rem 0.5rem', borderRadius: '0.75rem',
                    border: `1.5px solid ${usDeduction === u ? '#8b5cf6' : '#e2e8f0'}`,
                    background: usDeduction === u ? '#f5f3ff' : 'white',
                    color: usDeduction === u ? '#8b5cf6' : '#64748b',
                    fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
                  }}>
                    {u === 'none' ? 'Gross' : u === 'fica' ? 'FICA 7.65%' : 'FICA+Federal ~22%'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Receipt ── */}
        <div className={s.sal_receipt}>
          <div className={s.sal_receipt_header}>
            <div className={s.sal_receipt_label}>{isKo ? '예상 월 실수령액' : 'Estimated Monthly Net'}</div>
            <div className={s.sal_receipt_net}>{fmt(res.monthlyNet)}</div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', opacity: 0.85, fontWeight: 700 }}>
              {isKo ? `총 주 ${res.totalH}시간 근무` : `Total ${res.totalH}h / week`}
            </div>
          </div>

          <div className={s.sal_receipt_body}>
            {/* 주급 명세 */}
            <div style={{ padding: '0.75rem 2rem 0', fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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

            <div style={{ borderTop: '1.5px dashed #e2e8f0', margin: '0.5rem 2rem' }} />

            <ReceiptRow
              label={isKo ? '주 총급여' : 'Weekly Gross'}
              value={fmt(res.weeklyGross)}
            />

            <div style={{ padding: '0.5rem 2rem', background: '#f8fafc', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
              × {WEEKS_PER_MONTH.toFixed(3)} {isKo ? '주/월' : 'wks/mo'}
            </div>

            {/* 월급 명세 */}
            <div style={{ padding: '0.5rem 2rem 0', fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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

          <div style={{ padding: '1rem 2rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.6 }}>
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
        <ShareBar title={isKo ? '2026 연봉·급여 실수령액 계산기' : 'Korean Salary & Take-Home Pay Calculator'} description={isKo ? '4대보험·소득세 공제 후 월 실수령액 계산' : 'Monthly take-home pay after insurance and income tax'} />
        <RelatedTools toolId="utilities/finance/salary-calc" />
        <div className={s.sal_ad_placeholder}>AD</div>
        <SeoSection
          ko={{
            title: '연봉·급여 실수령액 계산기란 무엇인가요?',
            description: '세전 연봉이나 월급을 입력하면 2026년 기준 4대보험(국민연금 4.75%, 건강보험 3.595%, 장기요양보험, 고용보험 0.9%)과 근로소득세·지방소득세를 공제한 실제 통장 입금액을 계산해 주는 도구입니다. 근로소득세는 국세청이 회사의 매월 원천징수 기준으로 쓰는 근로소득 간이세액표(2026년 3월 1일 이후 지급분)를 그대로 적용하므로, 부양가족 수와 8~20세 자녀 수에 따라 달라지는 세액까지 반영됩니다. 예를 들어 연봉 4,000만 원(퇴직금 별도, 식대 비과세 20만 원, 본인 1명)이라면 월 세전 약 333만 원에서 약 39만 8천 원이 공제되어 월 실수령액은 약 293만 원입니다. 아르바이트나 교대 근무처럼 시급으로 받는 경우에는 "시급·알바" 탭에서 2026년 최저시급 10,320원 기준으로 주휴수당·잔업·특근 수당을 포함한 월급을 계산할 수 있습니다. 연봉 협상, 이직 제안 비교, 생활비 계획처럼 "그래서 한 달에 실제로 얼마를 받는지"가 궁금할 때 바로 활용해 보세요.',
            useCases: [
              { icon: '💼', title: '이직·연봉 협상 전 비교', desc: '제안받은 연봉 두 개를 차례로 입력해 월 실수령액 차이를 확인하세요. 연봉 500만 원 차이가 실제 통장에서는 월 약 30만~40만 원 차이라는 것처럼, 세후 기준으로 판단할 수 있습니다.' },
              { icon: '👨‍👩‍👧', title: '부양가족에 따른 세금 차이 확인', desc: '배우자와 8~20세 자녀 수를 바꿔 가며 매월 떼이는 근로소득세가 얼마나 줄어드는지 확인할 수 있습니다. 같은 연봉 5,000만 원도 4인 가족(자녀 2명)이면 소득세가 월 약 4만 원으로 줄어듭니다.' },
              { icon: '⏰', title: '알바 월급과 주휴수당 계산', desc: '시급·알바 탭에서 하루 근무 시간과 주 근무일수를 넣으면 주 15시간 이상일 때 붙는 주휴수당과 잔업·특근 수당까지 합친 월급을 바로 계산합니다.' },
              { icon: '📋', title: '급여명세서 검증', desc: '회사에서 받은 급여명세서의 국민연금·건강보험·소득세 금액이 계산 결과와 크게 다르다면 비과세 항목이나 부양가족 신고 내용이 맞는지 인사팀에 확인해 볼 수 있습니다.' },
            ],
            steps: [
              { step: '계산 방식 선택', desc: '월급이나 연봉을 받는 직장인은 "연봉·월급 실수령액" 탭을, 시급으로 받는 아르바이트·교대 근무자는 "시급·알바" 탭을 선택합니다.' },
              { step: '연봉 또는 월급 입력', desc: '세전 금액을 입력합니다. 연봉에 퇴직금이 포함된 계약(연봉을 13으로 나눠 지급)이라면 "퇴직금 포함" 체크박스를 켜면 월 급여가 1/13로 계산됩니다.' },
              { step: '비과세액과 가족 수 설정', desc: '식대처럼 세금이 붙지 않는 금액(식대는 월 20만 원까지 비과세)을 입력하고, 본인을 포함한 부양가족 수와 8~20세 자녀 수를 +/- 버튼으로 설정합니다.' },
              { step: '공제 내역 확인', desc: '오른쪽 영수증에서 국민연금·건강보험·장기요양·고용보험·근로소득세·지방소득세가 각각 얼마인지, 최종 월 실수령액과 연 실수령액이 얼마인지 확인합니다.' },
            ],
            faqs: [
              { q: '연봉 3,000만·4,000만·5,000만 원의 월 실수령액은 얼마인가요?', a: '본인 1명, 식대 비과세 월 20만 원, 퇴직금 별도 기준으로 연봉 3,000만 원은 월 약 224만 원, 4,000만 원은 월 약 293만 원, 5,000만 원은 월 약 357만 원입니다. 부양가족이 늘어나면 근로소득세가 줄어 실수령액이 더 많아지며, 페이지의 연봉별 실수령액 표에서 다른 연봉도 확인할 수 있습니다.' },
              { q: '2026년 4대보험 요율은 얼마인가요?', a: '근로자 부담 기준으로 국민연금 4.75%(2026년부터 보험료율 9.5%), 건강보험 3.595%(보험료율 7.19%), 장기요양보험은 건강보험료의 13.14%, 고용보험 0.9%로 합계 약 9.72%입니다. 산재보험은 사업주가 전액 부담하므로 월급에서 공제되지 않습니다. 국민연금은 기준소득월액 상한(659만 원)이 있어 그 이상 소득에는 더 붙지 않습니다.' },
              { q: '근로소득세는 어떻게 계산되나요?', a: '회사는 매달 국세청 근로소득 간이세액표에 따라 소득세를 원천징수하고, 지방소득세는 그 소득세의 10%입니다. 이 계산기는 2026년 3월 1일 이후 지급분에 적용되는 간이세액표(100% 기준)와 8~20세 자녀 세액공제(1명 20,830원, 2명 45,830원)를 그대로 반영합니다. 최종 세금은 다음 해 연말정산에서 확정됩니다.' },
              { q: '주휴수당은 어떻게 계산되나요?', a: '시급·알바 탭에서 1주 소정근로시간이 15시간 이상이면 (주 소정근로시간 ÷ 40) × 8 × 시급만큼 주휴수당이 붙습니다. 주 40시간 이상 일하면 8시간분이 최대이며, 잔업·특근 시간은 주휴수당 계산에 포함되지 않습니다. 2026년 최저시급 10,320원으로 주 40시간 일하면 주휴수당 포함 월 약 215만 원입니다.' },
            ],
          }}
          en={{
            title: 'What is the Korean Salary & Take-Home Pay Calculator?',
            description: 'Enter a gross annual salary or monthly pay and this calculator shows what actually lands in your bank account in Korea after the 2026 social insurance contributions (National Pension 4.75%, Health Insurance 3.595%, Long-term Care, Employment Insurance 0.9%) and income tax. Income tax follows the official simplified withholding tax table that Korean employers use every month (payments from March 1, 2026), so it reflects the number of dependents and children aged 8 to 20. For example, a ₩40,000,000 salary with severance paid separately, a ₩200,000 tax-free meal allowance and no dependents comes to about ₩3,333,000 gross per month, roughly ₩398,000 in deductions and about ₩2,936,000 take-home. Paid by the hour? The Hourly tab uses the 2026 Korean minimum wage of ₩10,320 and adds weekly holiday pay, overtime and holiday shifts. A US mode with FICA and an estimated federal rate is also included for comparison.',
            useCases: [
              { icon: '💼', title: 'Comparing Job Offers in Korea', desc: 'Enter two salary offers one after the other to see the real monthly difference after tax. A ₩5,000,000 gap in annual salary is often only ₩300,000–400,000 more per month in your account.' },
              { icon: '👨‍👩‍👧', title: 'Effect of Dependents on Tax', desc: 'Change the number of dependents and children aged 8–20 to see how much monthly income tax drops. A family of four on ₩50,000,000 pays roughly ₩42,000 a month in income tax instead of ₩190,000.' },
              { icon: '⏰', title: 'Part-time and Shift Pay', desc: 'Use the Hourly tab to enter daily hours and days per week. It adds Korea\'s weekly holiday pay for 15+ hours a week, plus overtime and holiday multipliers.' },
              { icon: '📋', title: 'Checking Your Payslip', desc: 'If the pension, health insurance or income tax on your payslip differs a lot from this estimate, ask HR whether your non-taxable items and dependent declaration are recorded correctly.' },
            ],
            steps: [
              { step: 'Choose a Mode', desc: 'Salaried employees should use "Annual / Monthly Salary". Part-time or shift workers paid by the hour should use the "Hourly / Part-time" tab.' },
              { step: 'Enter Your Pay', desc: 'Type your gross annual salary or monthly pay. If your contract bundles severance into the annual figure (paid in 13 parts), tick "includes severance" to divide by 13.' },
              { step: 'Set Allowances and Dependents', desc: 'Enter monthly non-taxable pay such as the meal allowance (tax-free up to ₩200,000), then set dependents including yourself and the number of children aged 8–20.' },
              { step: 'Review the Breakdown', desc: 'The receipt lists pension, health, long-term care, employment insurance, income tax and local income tax separately, with your monthly and annual take-home pay.' },
            ],
            faqs: [
              { q: 'How much is take-home pay on a ₩40 million salary in Korea?', a: 'With severance paid separately, a ₩200,000 monthly tax-free meal allowance and no dependents, a ₩40,000,000 salary gives about ₩2,936,000 per month after insurance and tax. ₩30,000,000 gives about ₩2,244,000 and ₩50,000,000 about ₩3,572,000. More dependents lower income tax and raise take-home pay.' },
              { q: 'What are the 2026 Korean social insurance rates?', a: 'The employee share is National Pension 4.75% (total rate rose to 9.5% in 2026), Health Insurance 3.595% (total 7.19%), Long-term Care at 13.14% of the health premium and Employment Insurance 0.9%, about 9.72% in total. Industrial accident insurance is paid entirely by the employer. Pension is capped at a ₩6,590,000 monthly income base.' },
              { q: 'How is Korean income tax withheld?', a: 'Employers withhold income tax each month using the National Tax Service simplified withholding table, and local income tax is 10% of that amount. This calculator uses the table for payments from March 1, 2026 at the 100% option, including the child credit of ₩20,830 for one child and ₩45,830 for two. The final tax is settled in the year-end tax adjustment.' },
              { q: 'How is weekly holiday pay calculated?', a: 'In the Hourly tab, if scheduled hours are 15 or more per week, weekly holiday pay is (weekly scheduled hours ÷ 40) × 8 × hourly wage, capped at 8 hours of pay at 40 hours. Overtime and holiday shifts do not count. At the 2026 minimum wage of ₩10,320 and 40 hours a week, monthly pay including holiday pay is about ₩2,152,000.' },
            ],
          }}
        />
      </div>
    </div>
  );
}
