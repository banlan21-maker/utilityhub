'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Receipt, Copy, CheckCircle2 } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  withholding, grossForNet, annualSettlement, monthlyInsurance,
  BASIC_DEDUCTION_PER_PERSON, STANDARD_TAX_CREDIT, REGIONAL_2026,
} from '@/lib/freelanceTax';
import s from './tax.module.css';
import { ui } from '@/app/components/ui';

const digits = (v: string) => Number(v.replace(/[^0-9]/g, '')) || 0;
const money = (v: string) => { const n = digits(v); return n ? n.toLocaleString('ko-KR') : ''; };

export default function Tax33CalcClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('Tax33');
  const locale = useLocale();
  const isKo = locale === 'ko';
  const won = (n: number) => `${Math.round(n).toLocaleString(isKo ? 'ko-KR' : 'en-US')}${isKo ? '원' : ' KRW'}`;

  // ① 이번 계약
  const [mode, setMode] = useState<'normal' | 'reverse'>('normal');
  const [amountText, setAmountText] = useState('');
  const [copied, setCopied] = useState(false);

  // ② 연간 정산
  const [revenueText, setRevenueText] = useState('');
  const [expenseMode, setExpenseMode] = useState<'rate' | 'amount'>('rate');
  const [expenseRateText, setExpenseRateText] = useState('');
  const [expenseAmountText, setExpenseAmountText] = useState('');
  const [dependents, setDependents] = useState(1);
  const [pensionText, setPensionText] = useState('');

  // ③ 보험료
  const [employee, setEmployee] = useState(false);

  const amount = digits(amountText);
  const w = amount > 0 ? (mode === 'normal' ? withholding(amount) : grossForNet(amount)) : null;

  const revenue = digits(revenueText);
  const expenseRate = Math.min(100, Math.max(0, parseFloat(expenseRateText) || 0));
  const expenses = expenseMode === 'rate' ? Math.floor(revenue * expenseRate / 100) : digits(expenseAmountText);
  const expenseReady = expenseMode === 'rate' ? expenseRateText.trim() !== '' : expenseAmountText.trim() !== '';
  const annual = revenue > 0 && expenseReady
    ? annualSettlement({ revenue, expenses, dependents, pensionPaid: digits(pensionText) })
    : null;
  const ins = annual ? monthlyInsurance(annual.incomeAmount, employee) : null;

  const handleCopy = async () => {
    if (!w) return;
    const lines = [
      `[${isKo ? '3.3% 세금 계산' : '3.3% tax'}]`,
      `${isKo ? '계약 금액(세전)' : 'Gross'}: ${won(w.gross)}`,
      `${isKo ? '소득세 3%' : 'Income tax 3%'}: -${won(w.incomeTax)}`,
      `${isKo ? '지방소득세 0.3%' : 'Local tax 0.3%'}: -${won(w.localTax)}`,
      `${isKo ? '실수령액' : 'Net'}: ${won(w.net)}`,
      ...(annual ? [`${isKo ? '종합소득세 예상' : 'Annual estimate'}: ${annual.balanceTotal <= 0 ? (isKo ? '환급 ' : 'refund ') : (isKo ? '추가 납부 ' : 'pay ')}${won(Math.abs(annual.balanceTotal))}`] : []),
      `theutilhub.com/${locale}/utilities/finance/tax-33-calc`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* 클립보드 권한이 없으면 무시 */ }
  };

  const maxBar = annual ? Math.max(annual.prepaidTax, annual.decidedTax, 1) : 1;
  const barPct = (v: number) => `${Math.max(2, (v / maxBar) * 100)}%`;

  return (
    <div className={s.tax_container}>
      <NavigationActions />
      <ToolHeader icon={<Receipt />} title={t('title')} subtitle={t('description')} />

      <div role="note" className={`${ui.notice} ${ui.amber} ${s.notice}`}>{t('country_notice')}</div>

      {/* ── ① 이번 계약 ── */}
      <section className={`${ui.card} ${s.card}`}>
        <div className={ui.badge}>STEP 1</div>
        <h2 className={ui.cardTitle}>{isKo ? '이번 계약: 3.3% 떼고 얼마 받나' : 'This payment: net after 3.3%'}</h2>
        <div className={ui.segmented} role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'normal'} className={`${ui.segment} ${mode === 'normal' ? ui.segmentActive : ''}`}
            onClick={() => { setMode('normal'); setAmountText(''); }}>{t('mode_normal')}</button>
          <button type="button" role="tab" aria-selected={mode === 'reverse'} className={`${ui.segment} ${mode === 'reverse' ? ui.segmentActive : ''}`}
            onClick={() => { setMode('reverse'); setAmountText(''); }}>{t('mode_reverse')}</button>
        </div>
        <div className={ui.field}>
          <label className={ui.label} htmlFor="tx-amount">{mode === 'normal' ? t('label.gross') : t('input_label_net')}</label>
          <div className={ui.inputGroup}>
            <input id="tx-amount" className={`${ui.input} ${ui.inputLg}`} inputMode="numeric" placeholder="3,000,000"
              value={amountText} onChange={e => setAmountText(money(e.target.value))} />
            <span className={ui.unit}>{isKo ? '원' : 'KRW'}</span>
          </div>
          <div className={ui.chips}>
            {[50, 100, 200, 300, 500, 1000].map(v => (
              <button key={v} type="button" className={`${ui.chip} ${ui.pill}`} onClick={() => setAmountText((v * 10000).toLocaleString('ko-KR'))}>
                {isKo ? `${v}만원` : `₩${(v * 10000).toLocaleString('en-US')}`}
              </button>
            ))}
          </div>
        </div>

        {w && (
          <>
            <div className={s.receipt} aria-live="polite">
              <div className={s.row}>
                <span>{mode === 'reverse' ? t('result_label_required_gross') : (isKo ? '계약 금액 (세전)' : 'Gross amount')}</span>
                <span className={s.val}>{won(w.gross)}</span>
              </div>
              <div className={s.row}>
                <span>{t('result.bizTax')} 3%<span className={s.row_sub}>{isKo ? '10원 미만 절사' : 'rounded down to 10 KRW'}</span></span>
                <span className={`${s.val} ${s.val_minus}`}>-{won(w.incomeTax)}</span>
              </div>
              <div className={s.row}>
                <span>{t('result.localTax')}<span className={s.row_sub}>{isKo ? '소득세의 10% (= 0.3%)' : '10% of income tax (= 0.3%)'}</span></span>
                <span className={`${s.val} ${s.val_minus}`}>-{won(w.localTax)}</span>
              </div>
              <div className={`${s.row} ${s.row_total}`}>
                <span>{isKo ? '통장에 들어오는 금액' : 'Amount received'}</span>
                <span className={s.val}>{won(w.net)}</span>
              </div>
            </div>
            <button type="button" className={`${ui.button} ${ui.secondary} ${s.copy_btn}`} onClick={handleCopy}>
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />} {copied ? t('copy_done') : t('copy_button')}
            </button>
          </>
        )}
      </section>

      {/* ── ② 5월 종합소득세 ── */}
      <section className={`${ui.card} ${s.card}`}>
        <div className={ui.badge}>STEP 2</div>
        <h2 className={ui.cardTitle}>{isKo ? '5월 종합소득세: 환급받을까, 더 낼까' : 'May income tax: refund or extra payment?'}</h2>
        <p className={s.hint}>
          {isKo
            ? '1년 동안 뗀 3.3%는 "미리 낸 세금"입니다. 5월에 경비를 빼고 실제 세금을 계산해 미리 낸 세금이 더 많으면 돌려받고, 적으면 더 냅니다.'
            : 'The 3.3% withheld during the year is tax paid in advance. In May the real tax is worked out after expenses; if you prepaid more you get a refund, otherwise you pay the difference.'}
        </p>
        <div className={ui.field}>
          <label className={ui.label} htmlFor="tx-rev">{isKo ? '1년간 받은 계약 금액 합계 (세전)' : 'Total gross payments for the year'}</label>
          <div className={ui.inputGroup}>
            <input id="tx-rev" className={`${ui.input} ${ui.inputLg}`} inputMode="numeric" placeholder="30,000,000"
              value={revenueText} onChange={e => setRevenueText(money(e.target.value))} />
            <span className={ui.unit}>{isKo ? '원' : 'KRW'}</span>
          </div>
          {w && (
            <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm} ${s.link_btn}`}
              onClick={() => setRevenueText((w.gross * 12).toLocaleString('ko-KR'))}>
              {isKo ? `위 계약 금액 × 12개월로 채우기 (${won(w.gross * 12)})` : `Fill with the amount above × 12 (${won(w.gross * 12)})`}
            </button>
          )}
        </div>

        <div className={ui.field}>
          <span className={ui.label}>{isKo ? '필요경비' : 'Business expenses'}</span>
          <div className={`${ui.chips} ${ui.grow}`}>
            <button type="button" className={`${ui.chip} ${expenseMode === 'rate' ? ui.chipActive : ''}`} aria-pressed={expenseMode === 'rate'} onClick={() => setExpenseMode('rate')}>
              {isKo ? '경비율(%)로' : 'By rate (%)'}
            </button>
            <button type="button" className={`${ui.chip} ${expenseMode === 'amount' ? ui.chipActive : ''}`} aria-pressed={expenseMode === 'amount'} onClick={() => setExpenseMode('amount')}>
              {isKo ? '실제 경비 금액으로' : 'By amount'}
            </button>
          </div>
          <div className={ui.field} style={{ marginTop: '0.2rem' }}>
            {expenseMode === 'rate' ? (
              <div className={ui.inputGroup}>
                <input className={`${ui.input} ${ui.inputLg}`} type="number" inputMode="decimal" min="0" max="100" step="0.1"
                  aria-label={isKo ? '경비율' : 'Expense rate'} placeholder={isKo ? '예: 60' : 'e.g. 60'}
                  value={expenseRateText} onChange={e => setExpenseRateText(e.target.value)} />
                <span className={ui.unit}>%</span>
              </div>
            ) : (
              <div className={ui.inputGroup}>
                <input className={`${ui.input} ${ui.inputLg}`} inputMode="numeric" aria-label={isKo ? '경비 금액' : 'Expense amount'} placeholder="18,000,000"
                  value={expenseAmountText} onChange={e => setExpenseAmountText(money(e.target.value))} />
                <span className={ui.unit}>{isKo ? '원' : 'KRW'}</span>
              </div>
            )}
            <p className={ui.hint}>
              {isKo
                ? '장부를 쓰지 않는 소규모 프리랜서는 업종별 단순경비율로 신고하는 경우가 많습니다. 본인 업종코드의 경비율은 홈택스 → 조회/발급 → 기준·단순경비율에서 확인하세요.'
                : 'Small freelancers without books usually file with the simple expense rate for their business code. Look it up on Hometax (기준·단순경비율).'}
            </p>
          </div>
        </div>

        <div className={s.grid2}>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="tx-dep">{isKo ? '기본공제 인원 (본인 포함)' : 'Dependents incl. yourself'}</label>
            <select id="tx-dep" className={ui.input} value={dependents} onChange={e => setDependents(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}{isKo ? '명' : ''}</option>)}
            </select>
            <p className={ui.hint}>{isKo ? `1인당 ${BASIC_DEDUCTION_PER_PERSON / 10000}만 원 공제` : `₩${BASIC_DEDUCTION_PER_PERSON.toLocaleString('en-US')} per person`}</p>
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="tx-pen">{isKo ? '그해 낸 국민연금 (선택)' : 'National pension paid (optional)'}</label>
            <div className={ui.inputGroup}>
              <input id="tx-pen" className={`${ui.input} ${ui.inputLg}`} inputMode="numeric" placeholder="0"
                value={pensionText} onChange={e => setPensionText(money(e.target.value))} />
              <span className={ui.unit}>{isKo ? '원' : 'KRW'}</span>
            </div>
            <p className={ui.hint}>{isKo ? '지역가입자로 낸 연금은 전액 소득공제' : 'Fully deductible'}</p>
          </div>
        </div>

        {annual && (
          <>
            <div className={`${s.verdict} ${annual.balanceTotal <= 0 ? s.verdict_refund : s.verdict_pay}`} aria-live="polite">
              <div className={s.verdict_label}>
                {annual.balanceTotal <= 0 ? (isKo ? '예상 환급액' : 'Estimated refund') : (isKo ? '예상 추가 납부액' : 'Estimated extra payment')}
              </div>
              <div className={s.verdict_num}>{won(Math.abs(annual.balanceTotal))}</div>
              <div className={s.verdict_sub}>
                {isKo
                  ? `소득세 ${won(Math.abs(annual.balanceIncomeTax))} + 지방소득세 ${won(Math.abs(annual.balanceLocalTax))}`
                  : `income tax ${won(Math.abs(annual.balanceIncomeTax))} + local tax ${won(Math.abs(annual.balanceLocalTax))}`}
              </div>
            </div>

            <div className={s.bars}>
              <div className={s.bar_row}>
                <span>{isKo ? '미리 낸 소득세 (3%)' : 'Prepaid (3%)'}</span>
                <div className={s.bar_track}><div className={`${s.bar_fill} ${s.bar_prepaid}`} style={{ width: barPct(annual.prepaidTax) }} /></div>
                <span className={s.bar_val}>{won(annual.prepaidTax)}</span>
              </div>
              <div className={s.bar_row}>
                <span>{isKo ? '실제 낼 소득세' : 'Actual tax'}</span>
                <div className={s.bar_track}><div className={`${s.bar_fill} ${s.bar_decided}`} style={{ width: barPct(annual.decidedTax) }} /></div>
                <span className={s.bar_val}>{won(annual.decidedTax)}</span>
              </div>
            </div>

            <div className={s.receipt}>
              <div className={s.row}><span>{isKo ? '수입 금액' : 'Revenue'}</span><span className={s.val}>{won(revenue)}</span></div>
              <div className={s.row}><span>{isKo ? '필요경비' : 'Expenses'}</span><span className={`${s.val} ${s.val_minus}`}>-{won(expenses)}</span></div>
              <div className={s.row}><span>{isKo ? '소득금액' : 'Business income'}</span><span className={s.val}>{won(annual.incomeAmount)}</span></div>
              <div className={s.row}><span>{isKo ? '소득공제 (기본공제·연금)' : 'Deductions'}</span><span className={`${s.val} ${s.val_minus}`}>-{won(annual.deductions)}</span></div>
              <div className={s.row}><span>{isKo ? '과세표준' : 'Tax base'}</span><span className={s.val}>{won(annual.taxBase)}</span></div>
              <div className={s.row}><span>{isKo ? '산출세액 (6~45% 누진세율)' : 'Tax at 6–45% rates'}</span><span className={s.val}>{won(annual.calculatedTax)}</span></div>
              <div className={s.row}>
                <span>{isKo ? '표준세액공제' : 'Standard tax credit'}<span className={s.row_sub}>{isKo ? `근로소득이 없는 경우 연 ${STANDARD_TAX_CREDIT / 10000}만 원` : `₩${STANDARD_TAX_CREDIT.toLocaleString('en-US')} without salary income`}</span></span>
                <span className={`${s.val} ${s.val_minus}`}>-{won(annual.calculatedTax - annual.decidedTax)}</span>
              </div>
              <div className={`${s.row} ${s.row_total}`}><span>{isKo ? '결정세액 (소득세)' : 'Final income tax'}</span><span className={s.val}>{won(annual.decidedTax)}</span></div>
            </div>
            <p className={ui.hint}>
              {isKo
                ? '※ 월급(근로소득)이 함께 있으면 두 소득을 합산해 세율이 올라가고 표준세액공제 대신 근로자 공제가 적용되므로, 실제 세금은 이 추정보다 많아질 수 있습니다.'
                : '※ With salary income, both incomes are combined at higher rates and the standard credit does not apply, so the real tax can be higher than this estimate.'}
            </p>
          </>
        )}
      </section>

      {/* ── ③ 건강보험·국민연금 ── */}
      <section className={`${ui.card} ${s.card}`}>
        <div className={ui.badge}>STEP 3</div>
        <h2 className={ui.cardTitle}>{isKo ? '매달 건강보험·국민연금 (추정)' : 'Monthly health insurance & pension (estimate)'}</h2>
        <p className={s.hint}>
          {isKo
            ? '프리랜서의 보험료는 3.3%처럼 계약금에서 떼지 않습니다. 5월에 신고한 소득금액(수입 − 경비)을 기준으로 그해 11월부터 매달 따로 고지됩니다.'
            : 'Freelancer premiums are not deducted from each payment. They are billed monthly from November, based on the income (revenue − expenses) declared in May.'}
        </p>
        <div className={`${ui.chips} ${ui.grow}`}>
          <button type="button" className={`${ui.chip} ${!employee ? ui.chipActive : ''}`} aria-pressed={!employee} onClick={() => setEmployee(false)}>
            {isKo ? '프리랜서만 (지역가입자)' : 'Freelance only (regional)'}
          </button>
          <button type="button" className={`${ui.chip} ${employee ? ui.chipActive : ''}`} aria-pressed={employee} onClick={() => setEmployee(true)}>
            {isKo ? '직장인 부업' : 'Side job with salary'}
          </button>
        </div>
        {!ins ? (
          <p className={ui.hint}>{isKo ? 'STEP 2에 연간 수입과 경비를 넣으면 계산됩니다.' : 'Fill in STEP 2 to see the estimate.'}</p>
        ) : (
          <>
            <div className={s.receipt} aria-live="polite">
              <div className={s.row}>
                <span>{employee ? (isKo ? '보험료 대상 월 소득 (2천만 원 초과분)' : 'Monthly income over ₩20M') : (isKo ? '월 소득 (소득금액 ÷ 12)' : 'Monthly income (÷ 12)')}</span>
                <span className={s.val}>{won(ins.monthlyIncome)}</span>
              </div>
              <div className={s.row}><span>{isKo ? '건강보험' : 'Health insurance'}<span className={s.row_sub}>{(REGIONAL_2026.health * 100).toFixed(2)}%</span></span><span className={s.val}>{won(ins.health)}</span></div>
              <div className={s.row}><span>{isKo ? '장기요양보험' : 'Long-term care'}<span className={s.row_sub}>{isKo ? `건강보험료의 ${(REGIONAL_2026.longTermCareOfHealth * 100).toFixed(2)}%` : `${(REGIONAL_2026.longTermCareOfHealth * 100).toFixed(2)}% of health`}</span></span><span className={s.val}>{won(ins.longTermCare)}</span></div>
              {!employee && (
                <div className={s.row}><span>{isKo ? '국민연금 (전액 본인 부담)' : 'National pension (paid in full)'}<span className={s.row_sub}>{(REGIONAL_2026.pension * 100).toFixed(1)}%</span></span><span className={s.val}>{won(ins.pension)}</span></div>
              )}
              <div className={`${s.row} ${s.row_total}`}><span>{isKo ? '매달 합계 (추정)' : 'Monthly total (est.)'}</span><span className={s.val}>{won(ins.total)}</span></div>
            </div>
            <div className={`${ui.notice} ${ui.blue}`}>
              {employee
                ? (isKo
                  ? '직장인은 회사에서 건강보험·국민연금을 내므로, 월급 외 소득이 연 2,000만 원을 넘을 때만 초과분에 건강보험료(소득월액보험료)가 추가됩니다. 국민연금은 추가되지 않습니다.'
                  : 'Employees already pay through their employer. Only income above ₩20M a year outside salary adds a health premium; no extra pension.')
                : (isKo
                  ? '재산(주택·토지 등)에 붙는 건강보험료와 최저보험료는 빠져 있어 실제 고지액은 더 많을 수 있습니다. 가족 중 직장가입자의 피부양자로 등록되면 건강보험료가 없을 수 있지만, 사업소득이 있으면 피부양자 자격이 제한됩니다. 월 소득이 80만 원 미만이면 국민연금 보험료 지원을 받을 수 있습니다.'
                  : 'Property-based health premiums and the minimum premium are not included, so the actual bill may be higher. Dependent status under a family member may waive health premiums but is limited when you have business income.')}
            </div>
          </>
        )}
        <p className={s.source_note}>
          {isKo
            ? '근거: 원천징수 소득세 3%(소득세법 제129조)와 지방소득세 10%(지방세법 제103조의13), 10원 미만 절사(국고금관리법 제47조), 종합소득세 기본세율(소득세법 제55조), 기본공제 150만 원, 표준세액공제 7만 원, 2026년 건강보험료율 7.19%·장기요양 13.14%·국민연금 9.5%. 실제 세액은 업종 경비율, 다른 소득, 각종 공제·감면에 따라 달라집니다.'
            : 'Basis: 3% withholding (Income Tax Act art. 129) plus 10% local tax, 10 KRW rounding, basic tax rates (art. 55), ₩1.5M basic deduction, ₩70,000 standard credit, 2026 health 7.19%, long-term care 13.14%, pension 9.5%. Actual tax depends on expense rates, other income and credits.'}
        </p>
      </section>

      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="utilities/finance/tax-33-calc" />
      {seo}
    </div>
  );
}
