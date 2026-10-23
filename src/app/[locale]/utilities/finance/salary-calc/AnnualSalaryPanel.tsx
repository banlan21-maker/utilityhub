'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { calcKRNetPay } from '@/lib/krPayroll';
import { KR_INSURANCE_2026 as INS } from '@/constants/wageConfig';
import s from './salary.module.css';

type Basis = 'annual' | 'monthly';

const won = (n: number) => `₩${Math.round(n).toLocaleString('ko-KR')}`;
const digitsOnly = (v: string) => Number(v.replace(/[^0-9]/g, '')) || 0;

/** 연봉별 실수령액 표에 쓰는 연봉(만원) */
const TABLE_SALARIES = [2500, 3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 10000];
const TABLE_NON_TAXABLE = 200_000;

function Stepper({ value, min, max, onChange, unit, label }: {
  value: number; min: number; max: number; onChange: (v: number) => void; unit: string; label: string;
}) {
  return (
    <div className={s.sal_mini_stepper} role="group" aria-label={label}>
      <button type="button" className={s.sal_mini_btn} aria-label={`${label} -1`} onClick={() => onChange(Math.max(min, value - 1))}><Minus size={12} /></button>
      <span className={s.sal_mini_val}>{value}{unit}</span>
      <button type="button" className={s.sal_mini_btn} aria-label={`${label} +1`} onClick={() => onChange(Math.min(max, value + 1))}><Plus size={12} /></button>
    </div>
  );
}

const chip = (active: boolean): React.CSSProperties => ({
  flex: 1, minWidth: 80, padding: '0.6rem 0.5rem', borderRadius: '0.75rem',
  border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
  background: active ? 'var(--surface-hover)' : 'var(--surface)',
  color: active ? 'var(--primary)' : 'var(--text-secondary)',
  fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
});

const smallLabel: React.CSSProperties = { fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem' };

export default function AnnualSalaryPanel({ isKo }: { isKo: boolean }) {
  const [basis, setBasis] = useState<Basis>('annual');
  const [amountText, setAmountText] = useState('40,000,000');
  const [severanceIncluded, setSeveranceIncluded] = useState(false);
  const [nonTaxableText, setNonTaxableText] = useState('200,000');
  const [family, setFamily] = useState(1);
  const [children, setChildren] = useState(0);

  const amount = digitsOnly(amountText);
  const nonTaxable = digitsOnly(nonTaxableText);
  const months = basis === 'annual' && severanceIncluded ? 13 : 12;
  const monthlyGross = basis === 'annual' ? Math.floor(amount / months) : amount;
  const r = calcKRNetPay({ monthlyGross, nonTaxable, family, children });

  const onMoney = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = digitsOnly(e.target.value);
    setter(n ? n.toLocaleString('ko-KR') : '');
  };

  const Row = ({ label, value, sub, minus }: { label: string; value: number; sub?: string; minus?: boolean }) => (
    <div className={s.sal_receipt_row}>
      <span className={s.sal_row_label}>
        {label}
        {sub && <span style={{ display: 'block', fontSize: '0.65rem', opacity: 0.7 }}>{sub}</span>}
      </span>
      <span className={s.sal_row_value} style={minus ? { color: 'var(--text-secondary)' } : undefined}>
        {minus ? `-${won(value)}` : won(value)}
      </span>
    </div>
  );

  const T = isKo ? {
    basis: '입력 기준', annual: '연봉', monthly: '월급(세전)',
    amount: basis === 'annual' ? '연봉 (세전)' : '월급 (세전)',
    severance: '연봉에 퇴직금 포함 (÷13)',
    nonTaxable: '월 비과세액 (식대 등)', nonTaxableHint: '식대는 월 20만 원까지 비과세',
    family: '부양가족 수 (본인 포함)', children: '8~20세 자녀 수',
    net: '예상 월 실수령액', annualNet: '연 실수령액',
    detail: '월 공제 내역', gross: '월 급여 (세전)', taxable: '과세 대상 급여',
    pension: '국민연금', health: '건강보험', ltc: '장기요양보험', employment: '고용보험',
    incomeTax: '근로소득세', localTax: '지방소득세', total: '공제 합계', final: '월 실수령액',
    note: '* 2026년 4대보험 요율과 근로소득 간이세액표(2026. 3. 1. 이후 지급분, 100% 기준)로 계산한 추정치입니다. 실제 원천징수액은 회사의 비과세 항목·세액 선택(80/100/120%)에 따라 다를 수 있고, 최종 세금은 연말정산에서 확정됩니다.',
    tableTitle: '2026년 연봉별 실수령액 표',
    tableNote: `부양가족 1명(본인), 월 비과세 ${won(TABLE_NON_TAXABLE)}, 퇴직금 별도 기준`,
    colSalary: '연봉', colMonthly: '월 세전', colDeduct: '월 공제', colNet: '월 실수령액',
    salaryLabel: (man: number) => man >= 10000 ? `${man / 10000}억 원` : `${man.toLocaleString('ko-KR')}만 원`,
  } : {
    basis: 'Input basis', annual: 'Annual salary', monthly: 'Monthly (gross)',
    amount: basis === 'annual' ? 'Annual salary (gross, KRW)' : 'Monthly pay (gross, KRW)',
    severance: 'Salary includes severance pay (÷13)',
    nonTaxable: 'Monthly non-taxable pay (meals, etc.)', nonTaxableHint: 'Meal allowance is tax-free up to ₩200,000/month',
    family: 'Dependents (incl. yourself)', children: 'Children aged 8–20',
    net: 'Estimated Monthly Take-Home', annualNet: 'Annual take-home',
    detail: 'Monthly deductions', gross: 'Monthly gross', taxable: 'Taxable pay',
    pension: 'National Pension', health: 'Health Insurance', ltc: 'Long-term Care', employment: 'Employment Insurance',
    incomeTax: 'Income tax', localTax: 'Local income tax', total: 'Total deductions', final: 'Monthly take-home',
    note: '* Estimate based on 2026 Korean social insurance rates and the official simplified withholding tax table (payments from March 1, 2026, 100% option). Actual withholding depends on your employer\'s non-taxable items and withholding option; final tax is settled in the year-end tax adjustment.',
    tableTitle: '2026 Korean Take-Home Pay by Annual Salary',
    tableNote: `1 dependent (yourself), ${won(TABLE_NON_TAXABLE)}/month non-taxable, severance excluded`,
    colSalary: 'Annual salary', colMonthly: 'Monthly gross', colDeduct: 'Deductions', colNet: 'Monthly net',
    salaryLabel: (man: number) => `₩${(man * 10000).toLocaleString('en-US')}`,
  };

  return (
    <>
      <div className={s.sal_main_grid}>
        {/* ── 입력 ── */}
        <div className={s.sal_card}>
          <div className={s.sal_input_group}>
            <div style={smallLabel}>{T.basis}</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" style={chip(basis === 'annual')} aria-pressed={basis === 'annual'}
                onClick={() => { setBasis('annual'); setAmountText((monthlyGross * 12).toLocaleString('ko-KR')); }}>
                {T.annual}
              </button>
              <button type="button" style={chip(basis === 'monthly')} aria-pressed={basis === 'monthly'}
                onClick={() => { setBasis('monthly'); setAmountText(monthlyGross.toLocaleString('ko-KR')); }}>
                {T.monthly}
              </button>
            </div>
          </div>

          <div className={s.sal_input_group}>
            <label className={s.sal_label} htmlFor="annual-amount">{T.amount}</label>
            <div style={{ position: 'relative' }}>
              <input id="annual-amount" className={s.sal_input} inputMode="numeric" value={amountText}
                onChange={onMoney(setAmountText)} placeholder="0" />
              <span style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: 'var(--text-muted)', fontSize: '1.25rem' }}>₩</span>
            </div>
            {basis === 'annual' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" checked={severanceIncluded} onChange={e => setSeveranceIncluded(e.target.checked)} />
                {T.severance}
              </label>
            )}
          </div>

          <div className={s.sal_input_group}>
            <label className={s.sal_label} htmlFor="annual-nontax">{T.nonTaxable}</label>
            <input id="annual-nontax" className={s.sal_input} inputMode="numeric" value={nonTaxableText}
              onChange={onMoney(setNonTaxableText)} placeholder="0" />
            <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{T.nonTaxableHint}</div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={smallLabel}>{T.family}</div>
              <Stepper label={T.family} value={family} min={1} max={20} unit={isKo ? '명' : ''}
                onChange={v => { setFamily(v); setChildren(c => Math.min(c, v - 1)); }} />
            </div>
            <div>
              <div style={smallLabel}>{T.children}</div>
              <Stepper label={T.children} value={children} min={0} max={Math.max(0, family - 1)} unit={isKo ? '명' : ''}
                onChange={setChildren} />
            </div>
          </div>
        </div>

        {/* ── 결과 ── */}
        <div className={s.sal_receipt} aria-live="polite">
          <div className={s.sal_receipt_header}>
            <div className={s.sal_receipt_label}>{T.net}</div>
            <div className={s.sal_receipt_net}>{won(r.monthlyNet)}</div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', opacity: 0.85, fontWeight: 700 }}>
              {T.annualNet} {won(r.monthlyNet * 12)}
            </div>
          </div>
          <div className={s.sal_receipt_body}>
            <Row label={T.gross} value={r.monthlyGross} />
            {nonTaxable > 0 && <Row label={T.taxable} value={r.taxable} />}
            <div style={{ borderTop: '1.5px dashed var(--border)', margin: '0.5rem 2rem' }} />
            <Row label={T.pension} sub={`${(INS.pension * 100).toFixed(2)}%`} value={r.pension} minus />
            <Row label={T.health} sub={`${(INS.health * 100).toFixed(3)}%`} value={r.health} minus />
            <Row label={T.ltc} sub={isKo ? `건강보험료의 ${(INS.longTermCareOfHealth * 100).toFixed(2)}%` : `${(INS.longTermCareOfHealth * 100).toFixed(2)}% of health ins.`} value={r.longTermCare} minus />
            <Row label={T.employment} sub={`${(INS.employment * 100).toFixed(1)}%`} value={r.employment} minus />
            <Row label={T.incomeTax} sub={isKo ? '간이세액표 기준' : 'withholding table'} value={r.incomeTax} minus />
            <Row label={T.localTax} sub={isKo ? '소득세의 10%' : '10% of income tax'} value={r.localTax} minus />
            <div style={{ borderTop: '1.5px dashed var(--border)', margin: '0.5rem 2rem' }} />
            <Row label={T.total} value={r.totalDeduction} minus />
            <div className={s.sal_receipt_row} style={{ padding: '1.5rem 2rem' }}>
              <span className={s.sal_row_label} style={{ color: 'var(--primary)', fontWeight: 900 }}>{T.final}</span>
              <span className={s.sal_row_value} style={{ fontSize: '1.4rem', color: 'var(--primary)', fontWeight: 950 }}>{won(r.monthlyNet)}</span>
            </div>
          </div>
          <div style={{ padding: '1rem 2rem', borderTop: '1px solid var(--border)', fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {T.note}
          </div>
        </div>
      </div>

      {/* ── 연봉별 실수령액 표 (서버 렌더에도 포함되는 정적 계산값) ── */}
      <section className={s.sal_card} style={{ marginTop: '2rem' }} aria-labelledby="salary-table-title">
        <h2 id="salary-table-title" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>{T.tableTitle}</h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{T.tableNote}</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: 420 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)', textAlign: 'right' }}>
                <th scope="col" style={{ textAlign: 'left', padding: '0.5rem' }}>{T.colSalary}</th>
                <th scope="col" style={{ padding: '0.5rem' }}>{T.colMonthly}</th>
                <th scope="col" style={{ padding: '0.5rem' }}>{T.colDeduct}</th>
                <th scope="col" style={{ padding: '0.5rem' }}>{T.colNet}</th>
              </tr>
            </thead>
            <tbody>
              {TABLE_SALARIES.map(man => {
                const row = calcKRNetPay({ monthlyGross: Math.floor((man * 10000) / 12), nonTaxable: TABLE_NON_TAXABLE, family: 1, children: 0 });
                return (
                  <tr key={man} style={{ borderBottom: '1px solid var(--border)', textAlign: 'right', color: 'var(--text-primary)' }}>
                    <th scope="row" style={{ textAlign: 'left', padding: '0.5rem', fontWeight: 700 }}>{T.salaryLabel(man)}</th>
                    <td style={{ padding: '0.5rem' }}>{won(row.monthlyGross)}</td>
                    <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>-{won(row.totalDeduction)}</td>
                    <td style={{ padding: '0.5rem', fontWeight: 800, color: 'var(--primary)' }}>{won(row.monthlyNet)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
