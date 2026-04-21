'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Wallet, Plus, Minus } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { CURRENT_DATA, WEEKS_PER_MONTH } from '@/constants/wageConfig';
import s from './salary.module.css';

type Country = 'KR' | 'US';
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
  const [hourlyWage, setHourlyWage] = useState(CURRENT_DATA.KR.minWage);
  const [regular, setRegular]       = useState<WorkBlock>(DEFAULT_REG);
  const [overtime, setOvertime]     = useState<WorkBlock>(DEFAULT_OT);
  const [special, setSpecial]       = useState<WorkBlock>(DEFAULT_OT);
  const [holidayOn, setHolidayOn]   = useState(true);
  const [krDeduction, setKrDeduction] = useState<KRDeduction>('insurance');
  const [usDeduction, setUsDeduction] = useState<USDeduction>('fica');
  const [isClient, setIsClient]     = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const isKRW = country === 'KR';

  const switchCountry = (c: Country) => {
    setCountry(c);
    setHourlyWage(c === 'KR' ? CURRENT_DATA.KR.minWage : CURRENT_DATA.US.minWage);
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

  if (!isClient) return null;

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
        <h1 className={s.sal_title}>{isKo ? '급여 & 실수령액 계산기' : 'Salary & Net Pay Calc'}</h1>
        <p className={s.sal_subtitle}>{isKo ? '일반·잔업·특근 수당을 포함한 실수령액을 계산하세요' : 'Calculate take-home pay with regular, overtime & holiday pay.'}</p>
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

      <div className={s.sal_main_grid}>
        {/* ── Left: Input Panel ── */}
        <div className={s.sal_card}>

          {/* 시급 */}
          <div className={s.sal_input_group}>
            <label className={s.sal_label}>{isKo ? '시급 (Hourly Wage)' : 'Hourly Wage'}</label>
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
                      {k === 'none' ? (isKo ? '공제 전' : 'Gross') : k === 'withholdingTax' ? '3.3%' : (isKo ? '4대보험 9.4%' : '9.4% Insurance')}
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
            {isKo
              ? '* 지방세 및 개인 소득 수준에 따라 실제 수령액은 차이가 있을 수 있습니다.'
              : '* State/local taxes and personal deductions may further reduce net pay.'}
          </div>
        </div>
      </div>

      {/* Standard Bottom Sections */}
      <div style={{ width: '100%' }}>
        <ShareBar title={isKo ? '급여 & 실수령액 계산기' : 'Salary Calculator'} description={isKo ? '일반·잔업·특근 수당 포함 실수령액 계산' : 'Calculate net pay with overtime & holiday pay'} />
        <RelatedTools toolId="utilities/finance/salary-calc" />
        <div className={s.sal_ad_placeholder}>{isKo ? '광고 영역' : 'Ad Space'}</div>
        <SeoSection
          ko={{
            title: '급여 및 실수령액 계산기란 무엇인가요?',
            description: '시간당 임금을 기반으로 일반근무·잔업(연장근로)·특근(휴일근로) 수당을 각각 설정하고, 세금과 보험료를 공제한 실제 통장 입금액을 계산해주는 도구입니다. 한국의 경우 근로기준법에 따른 주휴수당(주 15시간 이상 근무 시 자동 적용), 3.3% 원천징수세, 4대보험(국민연금·건강보험·고용보험·산재보험 근로자 부담분 약 9.4%)을 지원합니다. 미국은 연방 FLSA 기준 연장근로 수당(1.5x), FICA 세금(사회보장세 6.2% + 메디케어 1.45% = 7.65%), 연방소득세 추정(FICA 포함 약 22%)을 지원합니다. 잔업은 일반근무 뒤 연장하는 개념으로 일·주 단위로 시간과 배율(1.5x~3x)을 별도 설정할 수 있으며, 특근은 휴일이나 별도 근무일에 해당합니다. 아르바이트생, 계약직, 일용직, 교대 근무자, HR 담당자 등 다양한 근무 형태를 가진 누구나 자신의 패턴에 맞게 입력하면 주급과 월급을 즉시 비교할 수 있습니다.',
            useCases: [
              { icon: '💰', title: '취업 전 연봉 협상', desc: '제안받은 시급과 예상 근무 패턴을 입력해 세후 실수령액을 미리 계산하고, 생활비 대비 적정 여부를 판단하여 협상에 활용하세요.' },
              { icon: '⏰', title: '잔업·특근 수당 확인', desc: '잔업 시간과 배율을 설정해 연장근로 수당이 월급에 얼마나 더해지는지 즉시 계산할 수 있습니다. 계약서와 비교하는 용도로도 활용하세요.' },
              { icon: '🏦', title: '아르바이트 월 수입 예측', desc: '주휴수당 포함 여부와 4대보험 공제를 선택해 실제 통장에 입금되는 금액을 정확히 파악하고 월별 생활비 계획을 세울 수 있습니다.' },
              { icon: '🌍', title: '한미 급여 체계 비교', desc: '한국과 미국 버튼을 전환하며 각국의 세금·수당 체계에 따른 실수령액 차이를 비교하여 이직이나 해외취업 결정에 활용하세요.' },
            ],
            steps: [
              { step: '국가 선택', desc: '상단 🇰🇷 KOREA 또는 🇺🇸 USA 버튼을 클릭하면 해당 국가의 최저임금과 세금 체계가 자동 적용됩니다. 시급을 입력하면 이후 모든 계산에 반영됩니다.' },
              { step: '근무형태 설정', desc: '일반근무, 잔업(연장근로), 특근(휴일근로) 각각의 하루 시간과 주당 근무일수를 +/- 버튼으로 설정합니다. 잔업과 특근은 시급 배율(1.5x~3x)도 선택하세요.' },
              { step: '추가 옵션 선택', desc: '한국: 주휴수당 ON/OFF 토글과 공제 방식(공제 전·3.3%·4대보험 9.4%)을 선택합니다. 미국: FICA 또는 FICA+연방세 추정 중 선택합니다.' },
              { step: '영수증 확인', desc: '오른쪽 영수증에서 주급 상세(일반·잔업·특근·주휴), 월 총급여, 공제액, 최종 실수령액을 한눈에 확인합니다.' },
            ],
            faqs: [
              { q: '주휴수당 계산 기준이 어떻게 되나요?', a: '주휴수당은 일반근무(소정근로시간) 기준으로만 계산됩니다. 잔업·특근 시간은 포함되지 않습니다. 공식은 (소정근로시간 ÷ 40) × 8 × 시급이며, 주 15시간 이상 근무 시 자동 적용됩니다. 최대는 주 40시간 이상 시 8시간분 시급입니다.' },
              { q: '잔업과 특근의 차이가 무엇인가요?', a: '잔업(연장근로)은 정규 근무 뒤 같은 날 추가로 일하는 것을 의미하며, 특근(휴일근로)은 주휴일이나 별도로 지정된 날에 출근하는 것입니다. 둘 다 시급 배율(1.5x~3x)을 설정할 수 있으며, 실제 계약서에 명시된 배율을 입력하면 됩니다.' },
              { q: '4대보험 9.4%는 정확한가요?', a: '본 계산기는 국민연금 4.5%, 건강보험 3.545%, 장기요양보험 0.455%, 고용보험 0.9%를 합산한 근사치를 사용합니다. 실제 공제액은 소득 수준 및 회사 규모에 따라 소폭 차이가 있으며, 정확한 금액은 급여명세서에서 확인하세요.' },
              { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
            ],
          }}
          en={{
            title: 'What is a Salary & Net Pay Calculator?',
            description: 'This calculator lets you configure regular work, overtime, and holiday/special shifts separately — each with their own hours, days, and pay multiplier — then calculates your actual take-home pay after taxes and deductions. For Korea, it supports Weekly Holiday Pay (auto-applied when regular hours exceed 15/week), 3.3% withholding tax, and the Four Major Insurances (~9.4% employee share). For the US, it supports overtime pay (1.5x–3x multiplier), FICA taxes (7.65%), and combined FICA + estimated federal income tax (~22%). Whether you work a standard 5-day schedule, add overtime shifts, or take on weekend special work, you can model any combination and instantly see the weekly and monthly pay breakdown.',
            useCases: [
              { icon: '💼', title: 'Job Offer Evaluation', desc: 'Input the proposed hourly wage and your expected work pattern to calculate take-home pay and determine whether it meets your financial needs before accepting.' },
              { icon: '⏰', title: 'Overtime Pay Verification', desc: 'Set your overtime hours and multiplier to see exactly how much extra pay you earn per month — useful for checking whether your payslip matches your contract.' },
              { icon: '🎓', title: 'Part-time Budget Planning', desc: 'Calculate monthly income from part-time or shift work, including weekly holiday pay in Korea, to accurately plan your monthly budget and expenses.' },
              { icon: '🌏', title: 'Korea vs. US Pay Comparison', desc: 'Switch between countries to compare how each tax system affects your take-home pay — helpful for evaluating international job offers or relocation decisions.' },
            ],
            steps: [
              { step: 'Select Country', desc: 'Click 🇰🇷 KOREA or 🇺🇸 USA to switch wage systems. Each country preloads its minimum wage and auto-applies its respective tax/insurance rules.' },
              { step: 'Configure Work Blocks', desc: 'Set hours/day and days/week for Regular Work, Overtime, and Holiday/Special Work separately. For overtime and holiday, select a pay multiplier (1.5x to 3x) that matches your contract.' },
              { step: 'Set Deductions', desc: 'Korea: toggle Weekly Holiday Pay and choose your deduction type (Gross / 3.3% / 9.4% insurance). USA: select None, FICA only (7.65%), or FICA + estimated Federal (~22%).' },
              { step: 'Review Pay Receipt', desc: 'The right panel shows a full weekly breakdown (regular, overtime, holiday, weekly holiday pay), monthly gross, deductions, and your final net take-home amount.' },
            ],
            faqs: [
              { q: 'How is Weekly Holiday Pay calculated in Korea?', a: 'Only regular (scheduled) work hours count toward weekly holiday pay eligibility — overtime and special shifts are excluded. The formula is: (regular weekly hours ÷ 40) × 8 × hourly wage. The maximum is 8 hours of pay when regular hours reach or exceed 40 per week.' },
              { q: 'What is the difference between Overtime and Holiday Work?', a: 'Overtime refers to extended hours worked after regular shifts on the same day. Holiday/Special Work refers to working on designated rest days or public holidays. Both can be assigned separate multipliers (1.5x–3x) to match your actual employment contract.' },
              { q: 'Is the Korean 9.4% insurance rate accurate?', a: 'The 9.4% is a simplified employee-side estimate: National Pension 4.5%, Health Insurance 3.545%, Long-term Care 0.455%, Employment Insurance 0.9%. Actual deductions vary slightly by income level and company size — always verify against your payslip.' },
              { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
            ],
          }}
        />
      </div>
    </div>
  );
}
