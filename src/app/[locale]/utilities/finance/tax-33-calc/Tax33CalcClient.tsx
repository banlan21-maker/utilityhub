'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Receipt, Copy, CheckCircle2 } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  withholding, grossForNet, annualSettlement, monthlyInsurance,
  BASIC_DEDUCTION_PER_PERSON, STANDARD_TAX_CREDIT, REGIONAL_2026,
} from '@/lib/freelanceTax';
import s from './tax.module.css';

const digits = (v: string) => Number(v.replace(/[^0-9]/g, '')) || 0;
const money = (v: string) => { const n = digits(v); return n ? n.toLocaleString('ko-KR') : ''; };

export default function Tax33CalcClient() {
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
      <header className={s.tax_header}>
        <div className={s.icon_wrap}><Receipt size={40} /></div>
        <h1 className={s.tax_title}>{t('title')}</h1>
        <p className={s.tax_subtitle}>{t('description')}</p>
      </header>

      <div role="note" className={s.notice}>{t('country_notice')}</div>

      {/* ── ① 이번 계약 ── */}
      <section className={s.card}>
        <div className={s.step_label}>STEP 1</div>
        <h2 className={s.card_title}>{isKo ? '이번 계약: 3.3% 떼고 얼마 받나' : 'This payment: net after 3.3%'}</h2>
        <div className={s.tabs} role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'normal'} className={`${s.tab} ${mode === 'normal' ? s.tab_active : ''}`}
            onClick={() => { setMode('normal'); setAmountText(''); }}>{t('mode_normal')}</button>
          <button type="button" role="tab" aria-selected={mode === 'reverse'} className={`${s.tab} ${mode === 'reverse' ? s.tab_active : ''}`}
            onClick={() => { setMode('reverse'); setAmountText(''); }}>{t('mode_reverse')}</button>
        </div>
        <div>
          <label className={s.field_label} htmlFor="tx-amount">{mode === 'normal' ? t('label.gross') : t('input_label_net')}</label>
          <div className={s.input_wrap}>
            <input id="tx-amount" className={s.input} inputMode="numeric" placeholder="3,000,000"
              value={amountText} onChange={e => setAmountText(money(e.target.value))} />
            <span className={s.suffix}>{isKo ? '원' : 'KRW'}</span>
          </div>
          <div className={s.presets}>
            {[50, 100, 200, 300, 500, 1000].map(v => (
              <button key={v} type="button" className={s.preset} onClick={() => setAmountText((v * 10000).toLocaleString('ko-KR'))}>
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
            <button type="button" className={s.copy_btn} onClick={handleCopy}>
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />} {copied ? t('copy_done') : t('copy_button')}
            </button>
          </>
        )}
      </section>

      {/* ── ② 5월 종합소득세 ── */}
      <section className={s.card}>
        <div className={s.step_label}>STEP 2</div>
        <h2 className={s.card_title}>{isKo ? '5월 종합소득세: 환급받을까, 더 낼까' : 'May income tax: refund or extra payment?'}</h2>
        <p className={s.hint}>
          {isKo
            ? '1년 동안 뗀 3.3%는 "미리 낸 세금"입니다. 5월에 경비를 빼고 실제 세금을 계산해 미리 낸 세금이 더 많으면 돌려받고, 적으면 더 냅니다.'
            : 'The 3.3% withheld during the year is tax paid in advance. In May the real tax is worked out after expenses; if you prepaid more you get a refund, otherwise you pay the difference.'}
        </p>
        <div>
          <label className={s.field_label} htmlFor="tx-rev">{isKo ? '1년간 받은 계약 금액 합계 (세전)' : 'Total gross payments for the year'}</label>
          <div className={s.input_wrap}>
            <input id="tx-rev" className={s.input} inputMode="numeric" placeholder="30,000,000"
              value={revenueText} onChange={e => setRevenueText(money(e.target.value))} />
            <span className={s.suffix}>{isKo ? '원' : 'KRW'}</span>
          </div>
          {w && (
            <button type="button" className={s.link_btn} style={{ marginTop: '0.6rem' }}
              onClick={() => setRevenueText((w.gross * 12).toLocaleString('ko-KR'))}>
              {isKo ? `위 계약 금액 × 12개월로 채우기 (${won(w.gross * 12)})` : `Fill with the amount above × 12 (${won(w.gross * 12)})`}
            </button>
          )}
        </div>

        <div>
          <span className={s.field_label}>{isKo ? '필요경비' : 'Business expenses'}</span>
          <div className={s.tabs}>
            <button type="button" className={`${s.chip} ${expenseMode === 'rate' ? s.chip_active : ''}`} aria-pressed={expenseMode === 'rate'} onClick={() => setExpenseMode('rate')}>
              {isKo ? '경비율(%)로' : 'By rate (%)'}
            </button>
            <button type="button" className={`${s.chip} ${expenseMode === 'amount' ? s.chip_active : ''}`} aria-pressed={expenseMode === 'amount'} onClick={() => setExpenseMode('amount')}>
              {isKo ? '실제 경비 금액으로' : 'By amount'}
            </button>
          </div>
          <div style={{ marginTop: '0.6rem' }}>
            {expenseMode === 'rate' ? (
              <div className={s.input_wrap}>
                <input className={s.input} type="number" inputMode="decimal" min="0" max="100" step="0.1"
                  aria-label={isKo ? '경비율' : 'Expense rate'} placeholder={isKo ? '예: 60' : 'e.g. 60'}
                  value={expenseRateText} onChange={e => setExpenseRateText(e.target.value)} />
                <span className={s.suffix}>%</span>
              </div>
            ) : (
              <div className={s.input_wrap}>
                <input className={s.input} inputMode="numeric" aria-label={isKo ? '경비 금액' : 'Expense amount'} placeholder="18,000,000"
                  value={expenseAmountText} onChange={e => setExpenseAmountText(money(e.target.value))} />
                <span className={s.suffix}>{isKo ? '원' : 'KRW'}</span>
              </div>
            )}
            <p className={s.field_hint}>
              {isKo
                ? '장부를 쓰지 않는 소규모 프리랜서는 업종별 단순경비율로 신고하는 경우가 많습니다. 본인 업종코드의 경비율은 홈택스 → 조회/발급 → 기준·단순경비율에서 확인하세요.'
                : 'Small freelancers without books usually file with the simple expense rate for their business code. Look it up on Hometax (기준·단순경비율).'}
            </p>
          </div>
        </div>

        <div className={s.grid2}>
          <div>
            <label className={s.field_label} htmlFor="tx-dep">{isKo ? '기본공제 인원 (본인 포함)' : 'Dependents incl. yourself'}</label>
            <select id="tx-dep" className={s.input} style={{ paddingRight: '1rem' }} value={dependents} onChange={e => setDependents(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}{isKo ? '명' : ''}</option>)}
            </select>
            <p className={s.field_hint}>{isKo ? `1인당 ${BASIC_DEDUCTION_PER_PERSON / 10000}만 원 공제` : `₩${BASIC_DEDUCTION_PER_PERSON.toLocaleString('en-US')} per person`}</p>
          </div>
          <div>
            <label className={s.field_label} htmlFor="tx-pen">{isKo ? '그해 낸 국민연금 (선택)' : 'National pension paid (optional)'}</label>
            <div className={s.input_wrap}>
              <input id="tx-pen" className={s.input} inputMode="numeric" placeholder="0"
                value={pensionText} onChange={e => setPensionText(money(e.target.value))} />
              <span className={s.suffix}>{isKo ? '원' : 'KRW'}</span>
            </div>
            <p className={s.field_hint}>{isKo ? '지역가입자로 낸 연금은 전액 소득공제' : 'Fully deductible'}</p>
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
            <p className={s.field_hint}>
              {isKo
                ? '※ 월급(근로소득)이 함께 있으면 두 소득을 합산해 세율이 올라가고 표준세액공제 대신 근로자 공제가 적용되므로, 실제 세금은 이 추정보다 많아질 수 있습니다.'
                : '※ With salary income, both incomes are combined at higher rates and the standard credit does not apply, so the real tax can be higher than this estimate.'}
            </p>
          </>
        )}
      </section>

      {/* ── ③ 건강보험·국민연금 ── */}
      <section className={s.card}>
        <div className={s.step_label}>STEP 3</div>
        <h2 className={s.card_title}>{isKo ? '매달 건강보험·국민연금 (추정)' : 'Monthly health insurance & pension (estimate)'}</h2>
        <p className={s.hint}>
          {isKo
            ? '프리랜서의 보험료는 3.3%처럼 계약금에서 떼지 않습니다. 5월에 신고한 소득금액(수입 − 경비)을 기준으로 그해 11월부터 매달 따로 고지됩니다.'
            : 'Freelancer premiums are not deducted from each payment. They are billed monthly from November, based on the income (revenue − expenses) declared in May.'}
        </p>
        <div className={s.tabs}>
          <button type="button" className={`${s.chip} ${!employee ? s.chip_active : ''}`} aria-pressed={!employee} onClick={() => setEmployee(false)}>
            {isKo ? '프리랜서만 (지역가입자)' : 'Freelance only (regional)'}
          </button>
          <button type="button" className={`${s.chip} ${employee ? s.chip_active : ''}`} aria-pressed={employee} onClick={() => setEmployee(true)}>
            {isKo ? '직장인 부업' : 'Side job with salary'}
          </button>
        </div>
        {!ins ? (
          <p className={s.field_hint}>{isKo ? 'STEP 2에 연간 수입과 경비를 넣으면 계산됩니다.' : 'Fill in STEP 2 to see the estimate.'}</p>
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
            <div className={s.info_box}>
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
      <div className={s.ad_slot}>AD</div>
      <SeoSection
        ko={{
          title: '프리랜서 3.3% 세금 계산기는 무엇을 계산하나요?',
          description: '프리랜서·강사·디자이너처럼 사업소득을 받는 사람은 계약금에서 3.3%(소득세 3% + 지방소득세 0.3%)를 떼고 받습니다. 이 계산기는 세 가지를 한 번에 보여줍니다. 첫째, 이번 계약에서 통장에 들어오는 금액입니다. 세금은 10원 미만을 버리고 계산하므로 300만 원 계약이면 소득세 90,000원과 지방소득세 9,000원을 뗀 2,901,000원이 입금됩니다. 받고 싶은 금액에서 계약 금액을 거꾸로 구하는 역산도 됩니다. 둘째, 5월 종합소득세 신고 때 환급받을지 더 낼지입니다. 1년간 뗀 3.3%는 미리 낸 세금이라, 수입에서 경비를 빼고 기본공제(1인 150만 원)와 표준세액공제(7만 원)를 적용한 실제 세금과 비교합니다. 예를 들어 1년 수입 3,000만 원, 경비율 60%, 본인만 공제받으면 약 37만 원을 돌려받습니다. 셋째, 신고한 소득금액을 기준으로 매달 내게 될 건강보험료와 국민연금을 2026년 지역가입자 요율로 추정합니다.',
          useCases: [
            { icon: '💸', title: '계약금 실수령액 확인', desc: '300만 원 계약이면 99,000원이 원천징수되고 2,901,000원이 입금됩니다. 견적을 낼 때 원하는 실수령액에서 계약 금액을 역산해 손해 보지 않는 단가를 정할 수 있습니다.' },
            { icon: '🔁', title: '5월 환급금 미리 보기', desc: '1년간 뗀 3.3%와 실제 세금을 비교해 종합소득세 신고 때 환급받을지, 더 낼지 미리 확인합니다. 수입 3,000만 원·경비율 60%라면 약 37만 원 환급입니다.' },
            { icon: '🏥', title: '프리랜서 전환 후 보험료 대비', desc: '회사를 나와 프리랜서가 되면 건강보험·국민연금을 전액 본인이 냅니다. 소득금액 1,200만 원이면 매달 약 17만 6천 원이 고지될 수 있어 생활비 계획에 반영할 수 있습니다.' },
            { icon: '👔', title: '직장인 부업 소득 점검', desc: '월급 외 부업 소득이 연 2,000만 원을 넘으면 초과분에 건강보험료가 추가됩니다. 부업 규모를 늘리기 전에 추가 보험료를 미리 확인할 수 있습니다.' },
          ],
          steps: [
            { step: '계약 금액 입력', desc: '세전 계약 금액을 넣으면 소득세 3%, 지방소득세 0.3%, 실수령액이 바로 나옵니다. 역산 탭에서는 받고 싶은 금액을 넣어 필요한 계약 금액을 구합니다.' },
            { step: '연간 수입과 경비 입력', desc: '1년 동안 받은 계약 금액 합계와 경비율(또는 실제 경비)을 입력합니다. 경비율은 홈택스의 기준·단순경비율 조회에서 본인 업종코드로 확인할 수 있습니다.' },
            { step: '공제 정보 입력', desc: '본인을 포함한 기본공제 인원과, 지역가입자로 낸 국민연금이 있으면 그 금액을 넣습니다. 둘 다 과세표준을 줄여 세금을 낮춥니다.' },
            { step: '환급·보험료 확인', desc: '예상 환급액 또는 추가 납부액, 미리 낸 세금과 실제 세금 비교 막대, 매달 낼 건강보험·국민연금 추정액을 확인하고 결과를 복사해 둡니다.' },
          ],
          faqs: [
            { q: '3.3%는 왜 3.3%인가요?', a: '사업소득을 지급하는 쪽이 소득세 3%를 원천징수하고(소득세법 제129조), 그 소득세의 10%를 지방소득세로 함께 뗍니다. 3% + 0.3% = 3.3%입니다. 세금은 10원 미만을 버리므로 금액에 따라 3.3%보다 몇 원 적을 수 있습니다.' },
            { q: '3.3% 뗀 돈은 돌려받을 수 있나요?', a: '다음 해 5월 종합소득세 신고 때 실제 세금과 정산합니다. 수입에서 경비를 빼고 공제를 적용한 실제 세금이 미리 낸 3.3%보다 적으면 차액을 돌려받고, 많으면 더 냅니다. 소득이 적거나 경비율이 높을수록 환급받는 경우가 많습니다.' },
            { q: '경비율은 어디서 알 수 있나요?', a: '장부를 쓰지 않는 소규모 사업자는 업종별로 정해진 단순경비율이나 기준경비율로 경비를 인정받습니다. 홈택스 → 조회/발급 → 기준·단순경비율에서 업종코드로 조회할 수 있습니다. 직전 연도 수입이 많으면 단순경비율을 쓸 수 없고 기준경비율이나 장부 기장이 필요합니다.' },
            { q: '프리랜서 건강보험료는 얼마나 나오나요?', a: '지역가입자는 소득금액(수입 − 경비)을 12로 나눈 월 소득에 2026년 건강보험료율 7.19%를 곱하고, 장기요양보험료(건강보험료의 13.14%)를 더합니다. 국민연금은 월 소득의 9.5%를 전액 본인이 냅니다. 재산에 붙는 보험료는 별도라 실제 고지액은 더 많을 수 있습니다.' },
          ],
        }}
        en={{
          title: 'What does the Korean 3.3% freelancer tax calculator work out?',
          description: 'Freelancers in Korea who receive business income have 3.3% withheld from each payment: 3% income tax plus 0.3% local income tax. This calculator covers three things. First, the amount that reaches your account: tax is rounded down to 10 KRW, so a ₩3,000,000 payment has ₩90,000 income tax and ₩9,000 local tax withheld, leaving ₩2,901,000, and it can work backwards from the net amount you want. Second, whether you will get a refund or owe more at the May comprehensive income tax filing, by comparing the tax prepaid through withholding with the real tax after expenses, the ₩1.5M basic deduction per person and the ₩70,000 standard credit. With ₩30M of revenue, a 60% expense rate and no dependents, the refund is about ₩374,000. Third, the monthly health insurance and national pension you will be billed as a regional subscriber, using 2026 rates.',
          useCases: [
            { icon: '💸', title: 'Net Amount per Payment', desc: 'A ₩3,000,000 contract has ₩99,000 withheld and pays ₩2,901,000. Work backwards from the net you need to quote a fair gross amount.' },
            { icon: '🔁', title: 'Preview Your May Refund', desc: 'Compare a year of 3.3% withholding with the real tax to see whether you will get money back. ₩30M revenue at a 60% expense rate gives roughly a ₩374,000 refund.' },
            { icon: '🏥', title: 'Premiums After Going Freelance', desc: 'As a regional subscriber you pay health insurance and pension in full. With ₩12M of business income, expect about ₩176,000 a month.' },
            { icon: '👔', title: 'Side Income on Top of Salary', desc: 'If non-salary income exceeds ₩20M a year, the excess adds a health premium. Check the extra cost before growing a side business.' },
          ],
          steps: [
            { step: 'Enter the Payment', desc: 'Type the gross contract amount to see 3% income tax, 0.3% local tax and the net amount. The reverse tab finds the gross needed for a target net.' },
            { step: 'Enter Annual Revenue and Expenses', desc: 'Enter the year\'s total gross payments and your expense rate or actual expenses. Look up your business code\'s simple expense rate on Hometax.' },
            { step: 'Add Deductions', desc: 'Set the number of dependents including yourself and any national pension you paid as a regional subscriber. Both lower the tax base.' },
            { step: 'Read the Estimate', desc: 'See the refund or extra payment, a bar comparing prepaid and actual tax, and estimated monthly premiums, then copy the result.' },
          ],
          faqs: [
            { q: 'Why exactly 3.3%?', a: 'The payer withholds 3% income tax (Income Tax Act art. 129) and 10% of that as local income tax: 3% + 0.3% = 3.3%. Tax is rounded down to 10 KRW, so the amount can be a few won below 3.3%.' },
            { q: 'Can I get the 3.3% back?', a: 'It is settled at the May comprehensive income tax filing. If the real tax after expenses and deductions is lower than what was withheld, the difference is refunded; if higher, you pay more. Low income or high expense rates often mean a refund.' },
            { q: 'Where do I find my expense rate?', a: 'Small businesses without books use the simple or standard expense rate for their business code, listed on Hometax under 기준·단순경비율. Above certain revenue levels the simple rate no longer applies.' },
            { q: 'How much health insurance will I pay?', a: 'Regional subscribers pay 7.19% of monthly income (business income ÷ 12) in 2026, plus long-term care at 13.14% of that premium, and national pension of 9.5% paid in full. Property-based premiums are extra.' },
          ],
        }}
      />
    </div>
  );
}
