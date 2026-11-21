'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Calculator, Copy, Check } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  addVat, splitVat, generalReturn, simplifiedReturn,
  SIMPLIFIED_INDUSTRIES, SIMPLIFIED_EXEMPT_UNDER, SIMPLIFIED_THRESHOLD, FOREIGN_RATES,
  type SimplifiedIndustryId,
} from '@/lib/vat';
import s from './vat.module.css';
import { ui } from '@/app/components/ui';

type Tab = 'basic' | 'general' | 'simplified';

const digits = (v: string) => Number(v.replace(/[^0-9]/g, '')) || 0;
const money = (v: string) => { const n = digits(v); return n ? n.toLocaleString('ko-KR') : ''; };

export default function VatCalcClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('Vat');
  const locale = useLocale();
  const isKo = locale === 'ko';
  const won = (n: number) => `${Math.round(n).toLocaleString(isKo ? 'ko-KR' : 'en-US')}${isKo ? '원' : ' KRW'}`;

  const [tab, setTab] = useState<Tab>('basic');

  // 부가세 넣기·빼기
  const [mode, setMode] = useState<'add' | 'split'>('add');
  const [amountText, setAmountText] = useState('');
  const [rate, setRate] = useState(10);
  const [copied, setCopied] = useState(false);

  // 일반과세자
  const [salesText, setSalesText] = useState('');
  const [purchaseText, setPurchaseText] = useState('');
  const [inputIncludesVat, setInputIncludesVat] = useState(false);

  // 간이과세자
  const [industry, setIndustry] = useState<SimplifiedIndustryId>('retail');
  const [sSalesText, setSSalesText] = useState('');
  const [sPurchaseText, setSPurchaseText] = useState('');

  const amount = digits(amountText);
  const split = amount > 0 ? (mode === 'add' ? addVat(amount, rate / 100) : splitVat(amount, rate / 100)) : null;

  const toSupply = (v: number) => (inputIncludesVat ? splitVat(v).supply : v);
  const sales = digits(salesText), purchases = digits(purchaseText);
  const gen = sales > 0 ? generalReturn(toSupply(sales), toSupply(purchases)) : null;

  const sSales = digits(sSalesText), sPurchases = digits(sPurchaseText);
  const simp = sSales > 0 ? simplifiedReturn(sSales, sPurchases, industry) : null;

  const handleCopy = async () => {
    if (!split) return;
    const lines = [
      `${isKo ? '공급가액' : 'Net amount'}: ${won(split.supply)}`,
      `${isKo ? '부가세' : 'VAT'} (${rate}%): ${won(split.vat)}`,
      `${isKo ? '합계' : 'Total'}: ${won(split.total)}`,
      `theutilhub.com/${locale}/utilities/finance/vat-calc`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* 클립보드 권한이 없으면 무시 */ }
  };

  // 컴포넌트가 아니라 함수로 호출해야 렌더마다 입력창이 새로 만들어져 포커스가 빠지는 일이 없다
  const moneyInput = ({ id, label, value, onChange, placeholder, hint }: {
    id: string; label: string; value: string; onChange: (v: string) => void; placeholder: string; hint?: string;
  }) => (
    <div className={ui.field}>
      <label className={ui.label} htmlFor={id}>{label}</label>
      <div className={ui.inputGroup}>
        <input id={id} className={`${ui.input} ${ui.inputLg}`} inputMode="numeric" placeholder={placeholder}
          value={value} onChange={e => onChange(money(e.target.value))} />
        <span className={ui.unit}>{isKo ? '원' : 'KRW'}</span>
      </div>
      {hint && <p className={ui.hint}>{hint}</p>}
    </div>
  );

  const simpMax = simp ? Math.max(simp.payable, simp.generalEquivalent, 1) : 1;

  return (
    <div className={s.container}>
      <NavigationActions />
      <ToolHeader icon={<Calculator />} title={t('title')} subtitle={t('description')} />

      <div className={`${ui.segmented} ${s.tabs}`} role="tablist" aria-label={isKo ? '계산 종류' : 'Calculator type'}>
        {([
          ['basic', isKo ? '부가세 넣기·빼기' : 'Add / remove VAT', isKo ? '공급가액 ↔ 합계' : 'Net ↔ gross'],
          ['general', isKo ? '부가세 신고 (일반과세자)' : 'VAT return (general)', isKo ? '매출세액 − 매입세액' : 'Output − input tax'],
          ['simplified', isKo ? '간이과세자 부가세' : 'Simplified taxpayer', isKo ? '업종별 부가가치율' : 'Industry rates'],
        ] as const).map(([k, label, sub]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k}
            className={`${ui.segment} ${tab === k ? ui.segmentActive : ''}`} onClick={() => setTab(k)}>
            {label}<small>{sub}</small>
          </button>
        ))}
      </div>

      {/* ── 부가세 넣기·빼기 ── */}
      {tab === 'basic' && (
        <section className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{isKo ? '부가세 넣기·빼기' : 'Add or remove VAT'}</h2>
          <div className={`${ui.chips} ${ui.grow}`}>
            <button type="button" className={`${ui.chip} ${mode === 'add' ? ui.chipActive : ''}`} aria-pressed={mode === 'add'} onClick={() => setMode('add')}>
              {isKo ? '공급가액 → 합계' : 'Net → total'}
            </button>
            <button type="button" className={`${ui.chip} ${mode === 'split' ? ui.chipActive : ''}`} aria-pressed={mode === 'split'} onClick={() => setMode('split')}>
              {isKo ? '합계 → 공급가액·세액' : 'Total → net + VAT'}
            </button>
          </div>
          {moneyInput({ id: "vt-amount", value: amountText, onChange: setAmountText, placeholder: mode === 'add' ? '100,000' : '110,000', label: mode === 'add' ? t('label.supplyAmount') : t('label.totalAmount') })}
          <div className={s.foreign}>
            <span>{isKo ? '세율' : 'Rate'}:</span>
            <button type="button" className={`${ui.chip} ${ui.pill} ${rate === 10 ? ui.chipActive : ''}`} onClick={() => setRate(10)}>{isKo ? '한국·일본 10%' : 'Korea / Japan 10%'}</button>
            {FOREIGN_RATES.filter(f => f.rate !== 10).map(f => (
              <button key={f.en} type="button" className={`${ui.chip} ${ui.pill} ${rate === f.rate ? ui.chipActive : ''}`} onClick={() => setRate(f.rate)}>
                {isKo ? f.ko : f.en} {f.rate}%
              </button>
            ))}
          </div>

          {split && (
            <>
              <div className={s.receipt} aria-live="polite">
                <div className={s.row}><span>{isKo ? '공급가액' : 'Net amount'}</span><span className={s.val}>{won(split.supply)}</span></div>
                <div className={s.row}>
                  <span>{isKo ? `부가세 (${rate}%)` : `VAT (${rate}%)`}<span className={s.row_sub}>
                    {mode === 'add' ? (isKo ? '원 미만 절사' : 'rounded down') : (isKo ? '합계 − 공급가액' : 'total − net')}
                  </span></span>
                  <span className={s.val}>{won(split.vat)}</span>
                </div>
                <div className={`${s.row} ${s.row_total}`}><span>{isKo ? '합계 (부가세 포함)' : 'Total incl. VAT'}</span><span className={s.val}>{won(split.total)}</span></div>
              </div>
              <button type="button" className={`${ui.button} ${ui.secondary} ${s.copy_btn}`} onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? (isKo ? '복사됨' : 'Copied') : (isKo ? '결과 복사' : 'Copy')}
              </button>
            </>
          )}
        </section>
      )}

      {/* ── 일반과세자 신고 ── */}
      {tab === 'general' && (
        <section className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{isKo ? '부가세 신고 예상: 일반과세자' : 'VAT return estimate: general taxpayer'}</h2>
          <p className={s.hint}>
            {isKo
              ? '개인 일반과세자는 6개월마다(1월·7월 25일까지) 신고합니다. 그 기간 매출에서 받은 부가세(매출세액)에서, 사업용으로 산 물건·서비스에 낸 부가세(매입세액)를 뺀 금액을 냅니다.'
              : 'Individual general taxpayers file every six months (by 25 January and 25 July). You pay the VAT collected on sales minus the VAT paid on business purchases.'}
          </p>
          <div className={`${ui.chips} ${ui.grow}`}>
            <button type="button" className={`${ui.chip} ${!inputIncludesVat ? ui.chipActive : ''}`} aria-pressed={!inputIncludesVat} onClick={() => setInputIncludesVat(false)}>
              {isKo ? '공급가액(부가세 제외)으로 입력' : 'Enter net amounts'}
            </button>
            <button type="button" className={`${ui.chip} ${inputIncludesVat ? ui.chipActive : ''}`} aria-pressed={inputIncludesVat} onClick={() => setInputIncludesVat(true)}>
              {isKo ? '부가세 포함 금액으로 입력' : 'Enter VAT-inclusive amounts'}
            </button>
          </div>
          <div className={s.grid2}>
            {moneyInput({ id: "vt-sales", value: salesText, onChange: setSalesText, placeholder: "50,000,000", label: isKo ? '6개월 매출 합계' : 'Six-month sales' })}
            {moneyInput({ id: "vt-purch", value: purchaseText, onChange: setPurchaseText, placeholder: "20,000,000", label: isKo ? '공제 가능한 매입 합계' : 'Deductible purchases', hint: isKo ? '세금계산서·사업용 카드·지출증빙 현금영수증을 받은 매입만' : 'Only purchases with tax invoices, business cards or receipts' })}
          </div>
          {gen && (
            <>
              <div className={`${s.verdict} ${gen.payable >= 0 ? s.verdict_pay : s.verdict_refund}`} aria-live="polite">
                <div className={s.verdict_label}>{gen.payable >= 0 ? (isKo ? '예상 납부세액' : 'Estimated VAT to pay') : (isKo ? '예상 환급세액' : 'Estimated refund')}</div>
                <div className={s.verdict_num}>{won(Math.abs(gen.payable))}</div>
              </div>
              <div className={s.receipt}>
                <div className={s.row}><span>{isKo ? '매출세액' : 'Output tax'}<span className={s.row_sub}>{isKo ? '매출 공급가액 × 10%' : 'net sales × 10%'}</span></span><span className={s.val}>{won(gen.outputTax)}</span></div>
                <div className={s.row}><span>{isKo ? '매입세액' : 'Input tax'}<span className={s.row_sub}>{isKo ? '매입 공급가액 × 10%' : 'net purchases × 10%'}</span></span><span className={`${s.val} ${s.val_minus}`}>-{won(gen.inputTax)}</span></div>
                <div className={`${s.row} ${s.row_total}`}><span>{isKo ? '납부(+) / 환급(−)' : 'Pay (+) / refund (−)'}</span><span className={s.val}>{won(gen.payable)}</span></div>
              </div>
              <p className={s.field_hint}>
                {isKo
                  ? '※ 신용카드 매출세액공제, 전자신고세액공제, 예정고지로 미리 낸 세액, 불공제 매입(접대비·비영업용 승용차 등)은 반영하지 않았습니다.'
                  : '※ Card sales credit, e-filing credit, prepaid interim tax and non-deductible purchases are not included.'}
              </p>
            </>
          )}
        </section>
      )}

      {/* ── 간이과세자 ── */}
      {tab === 'simplified' && (
        <section className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{isKo ? '간이과세자 부가세' : 'Simplified taxpayer VAT'}</h2>
          <p className={s.hint}>
            {isKo
              ? `직전 연도 매출(공급대가)이 ${(SIMPLIFIED_THRESHOLD / 10000).toLocaleString('ko-KR')}만 원 미만인 개인사업자는 간이과세를 받을 수 있습니다(부동산임대업·과세유흥장소는 4,800만 원). 1년(1~12월) 매출에 업종별 부가가치율과 10%를 곱하고, 매입액의 0.5%를 뺍니다.`
              : `Individuals with prior-year sales under ₩${SIMPLIFIED_THRESHOLD.toLocaleString('en-US')} can be simplified taxpayers. Tax = annual sales × industry value-added rate × 10% − 0.5% of purchases.`}
          </p>
          <div>
            <label className={ui.label} htmlFor="vt-ind">{isKo ? '업종' : 'Industry'}</label>
            <select id="vt-ind" className={ui.input} value={industry} onChange={e => setIndustry(e.target.value as SimplifiedIndustryId)}>
              {SIMPLIFIED_INDUSTRIES.map(x => <option key={x.id} value={x.id}>{(x.rate * 100).toFixed(0)}% · {isKo ? x.ko : x.en}</option>)}
            </select>
          </div>
          <div className={s.grid2}>
            {moneyInput({ id: "vt-ssales", value: sSalesText, onChange: setSSalesText, placeholder: "80,000,000", label: isKo ? '1년 매출 (부가세 포함 공급대가)' : 'Annual sales incl. VAT' })}
            {moneyInput({ id: "vt-spurch", value: sPurchaseText, onChange: setSPurchaseText, placeholder: "30,000,000", label: isKo ? '1년 매입 (세금계산서 등, 부가세 포함)' : 'Annual purchases incl. VAT' })}
          </div>
          {simp && (
            <>
              <div className={`${s.verdict} ${simp.exempt ? s.verdict_exempt : s.verdict_pay}`} aria-live="polite">
                <div className={s.verdict_label}>{simp.exempt ? (isKo ? '납부의무 면제' : 'Exempt from payment') : (isKo ? '예상 납부세액 (1년)' : 'Estimated VAT (year)')}</div>
                <div className={s.verdict_num}>{won(simp.payable)}</div>
                {simp.exempt && (
                  <div className={s.verdict_sub}>
                    {isKo
                      ? `1년 매출 ${(SIMPLIFIED_EXEMPT_UNDER / 10000).toLocaleString('ko-KR')}만 원 미만이라 내지 않습니다 (계산상 ${won(simp.payableBeforeExemption)}). 신고는 해야 합니다.`
                      : `Sales under ₩${SIMPLIFIED_EXEMPT_UNDER.toLocaleString('en-US')} — no payment (calculated ${won(simp.payableBeforeExemption)}), but you must still file.`}
                  </div>
                )}
              </div>
              <div className={s.receipt}>
                <div className={s.row}>
                  <span>{isKo ? '매출 × 부가가치율 × 10%' : 'Sales × value-added rate × 10%'}<span className={s.row_sub}>{isKo ? `부가가치율 ${(simp.valueAddedRate * 100).toFixed(0)}% → 매출의 ${(simp.valueAddedRate * 10).toFixed(1)}%` : `rate ${(simp.valueAddedRate * 100).toFixed(0)}% → ${(simp.valueAddedRate * 10).toFixed(1)}% of sales`}</span></span>
                  <span className={s.val}>{won(simp.grossTax)}</span>
                </div>
                <div className={s.row}><span>{isKo ? '매입액 × 0.5% 공제' : 'Purchases × 0.5% credit'}</span><span className={`${s.val} ${s.val_minus}`}>-{won(simp.purchaseCredit)}</span></div>
                <div className={`${s.row} ${s.row_total}`}><span>{isKo ? '납부세액' : 'VAT payable'}</span><span className={s.val}>{won(simp.payable)}</span></div>
              </div>
              <h3 className={ui.cardTitle} style={{ fontSize: "1rem", margin: 0 }}>{isKo ? '같은 매출·매입이 일반과세자라면' : 'If you were a general taxpayer'}</h3>
              <div className={s.bars}>
                <div className={s.bar_row}>
                  <span>{isKo ? '간이과세자' : 'Simplified'}</span>
                  <div className={s.bar_track}><div className={`${s.bar_fill} ${s.bar_a}`} style={{ width: `${Math.max(2, simp.payable / simpMax * 100)}%` }} /></div>
                  <span className={s.bar_val}>{won(simp.payable)}</span>
                </div>
                <div className={s.bar_row}>
                  <span>{isKo ? '일반과세자' : 'General'}</span>
                  <div className={s.bar_track}><div className={`${s.bar_fill} ${s.bar_b}`} style={{ width: `${Math.max(2, Math.max(0, simp.generalEquivalent) / simpMax * 100)}%` }} /></div>
                  <span className={s.bar_val}>{won(simp.generalEquivalent)}</span>
                </div>
              </div>
              <p className={s.field_hint}>
                {isKo
                  ? '※ 간이과세자는 매입이 많아도 환급이 없고, 세금계산서를 발급하지 못하는 경우(직전 연도 매출 4,800만 원 미만)가 있습니다. 매입이 매출보다 큰 창업 초기에는 일반과세자가 유리할 수 있습니다.'
                  : '※ Simplified taxpayers get no refunds even with large purchases, so a general registration can pay off in a start-up year with heavy investment.'}
              </p>
            </>
          )}
        </section>
      )}

      <p className={s.source_note}>
        {isKo
          ? '근거: 부가가치세법 제30조(세율 10%), 제37조(일반과세자 납부세액), 제63조(간이과세자 업종별 부가가치율·매입액 0.5% 공제, 2021. 7. 1. 이후), 제69조(공급대가 4,800만 원 미만 납부의무 면제), 간이과세 기준 1억 400만 원(2024. 7. 1. 이후). 신용카드 매출세액공제 등은 반영하지 않은 추정치입니다.'
          : 'Basis: Korean VAT Act art. 30 (10%), art. 37 (general), art. 63 (simplified rates and 0.5% credit, from July 2021), art. 69 (exemption under ₩48M), simplified threshold ₩104M (from July 2024). Card sales credits are not included.'}
      </p>

      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="utilities/finance/vat-calc" />
      {seo}
    </div>
  );
}
