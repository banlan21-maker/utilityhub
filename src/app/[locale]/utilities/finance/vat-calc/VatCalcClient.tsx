'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Calculator, Copy, Check } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  addVat, splitVat, generalReturn, simplifiedReturn,
  SIMPLIFIED_INDUSTRIES, SIMPLIFIED_EXEMPT_UNDER, SIMPLIFIED_THRESHOLD, FOREIGN_RATES,
  type SimplifiedIndustryId,
} from '@/lib/vat';
import s from './vat.module.css';

type Tab = 'basic' | 'general' | 'simplified';

const digits = (v: string) => Number(v.replace(/[^0-9]/g, '')) || 0;
const money = (v: string) => { const n = digits(v); return n ? n.toLocaleString('ko-KR') : ''; };

export default function VatCalcClient() {
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
    <div>
      <label className={s.field_label} htmlFor={id}>{label}</label>
      <div className={s.input_wrap}>
        <input id={id} className={s.input} inputMode="numeric" placeholder={placeholder}
          value={value} onChange={e => onChange(money(e.target.value))} />
        <span className={s.suffix}>{isKo ? '원' : 'KRW'}</span>
      </div>
      {hint && <p className={s.field_hint}>{hint}</p>}
    </div>
  );

  const simpMax = simp ? Math.max(simp.payable, simp.generalEquivalent, 1) : 1;

  return (
    <div className={s.container}>
      <NavigationActions />
      <header className={s.header}>
        <div className={s.icon_wrap}><Calculator size={40} /></div>
        <h1 className={s.title}>{t('title')}</h1>
        <p className={s.subtitle}>{t('description')}</p>
      </header>

      <div className={s.tabs} role="tablist" aria-label={isKo ? '계산 종류' : 'Calculator type'}>
        {([
          ['basic', isKo ? '부가세 넣기·빼기' : 'Add / remove VAT', isKo ? '공급가액 ↔ 합계' : 'Net ↔ gross'],
          ['general', isKo ? '부가세 신고 (일반과세자)' : 'VAT return (general)', isKo ? '매출세액 − 매입세액' : 'Output − input tax'],
          ['simplified', isKo ? '간이과세자 부가세' : 'Simplified taxpayer', isKo ? '업종별 부가가치율' : 'Industry rates'],
        ] as const).map(([k, label, sub]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k}
            className={`${s.tab} ${tab === k ? s.tab_active : ''}`} onClick={() => setTab(k)}>
            {label}<small>{sub}</small>
          </button>
        ))}
      </div>

      {/* ── 부가세 넣기·빼기 ── */}
      {tab === 'basic' && (
        <section className={s.card}>
          <h2 className={s.card_title}>{isKo ? '부가세 넣기·빼기' : 'Add or remove VAT'}</h2>
          <div className={s.chips}>
            <button type="button" className={`${s.chip} ${mode === 'add' ? s.chip_active : ''}`} aria-pressed={mode === 'add'} onClick={() => setMode('add')}>
              {isKo ? '공급가액 → 합계' : 'Net → total'}
            </button>
            <button type="button" className={`${s.chip} ${mode === 'split' ? s.chip_active : ''}`} aria-pressed={mode === 'split'} onClick={() => setMode('split')}>
              {isKo ? '합계 → 공급가액·세액' : 'Total → net + VAT'}
            </button>
          </div>
          {moneyInput({ id: "vt-amount", value: amountText, onChange: setAmountText, placeholder: mode === 'add' ? '100,000' : '110,000', label: mode === 'add' ? t('label.supplyAmount') : t('label.totalAmount') })}
          <div className={s.foreign}>
            <span>{isKo ? '세율' : 'Rate'}:</span>
            <button type="button" className={`${s.mini} ${rate === 10 ? s.mini_active : ''}`} onClick={() => setRate(10)}>{isKo ? '한국·일본 10%' : 'Korea / Japan 10%'}</button>
            {FOREIGN_RATES.filter(f => f.rate !== 10).map(f => (
              <button key={f.en} type="button" className={`${s.mini} ${rate === f.rate ? s.mini_active : ''}`} onClick={() => setRate(f.rate)}>
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
              <button type="button" className={s.copy_btn} onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? (isKo ? '복사됨' : 'Copied') : (isKo ? '결과 복사' : 'Copy')}
              </button>
            </>
          )}
        </section>
      )}

      {/* ── 일반과세자 신고 ── */}
      {tab === 'general' && (
        <section className={s.card}>
          <h2 className={s.card_title}>{isKo ? '부가세 신고 예상: 일반과세자' : 'VAT return estimate: general taxpayer'}</h2>
          <p className={s.hint}>
            {isKo
              ? '개인 일반과세자는 6개월마다(1월·7월 25일까지) 신고합니다. 그 기간 매출에서 받은 부가세(매출세액)에서, 사업용으로 산 물건·서비스에 낸 부가세(매입세액)를 뺀 금액을 냅니다.'
              : 'Individual general taxpayers file every six months (by 25 January and 25 July). You pay the VAT collected on sales minus the VAT paid on business purchases.'}
          </p>
          <div className={s.chips}>
            <button type="button" className={`${s.chip} ${!inputIncludesVat ? s.chip_active : ''}`} aria-pressed={!inputIncludesVat} onClick={() => setInputIncludesVat(false)}>
              {isKo ? '공급가액(부가세 제외)으로 입력' : 'Enter net amounts'}
            </button>
            <button type="button" className={`${s.chip} ${inputIncludesVat ? s.chip_active : ''}`} aria-pressed={inputIncludesVat} onClick={() => setInputIncludesVat(true)}>
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
        <section className={s.card}>
          <h2 className={s.card_title}>{isKo ? '간이과세자 부가세' : 'Simplified taxpayer VAT'}</h2>
          <p className={s.hint}>
            {isKo
              ? `직전 연도 매출(공급대가)이 ${(SIMPLIFIED_THRESHOLD / 10000).toLocaleString('ko-KR')}만 원 미만인 개인사업자는 간이과세를 받을 수 있습니다(부동산임대업·과세유흥장소는 4,800만 원). 1년(1~12월) 매출에 업종별 부가가치율과 10%를 곱하고, 매입액의 0.5%를 뺍니다.`
              : `Individuals with prior-year sales under ₩${SIMPLIFIED_THRESHOLD.toLocaleString('en-US')} can be simplified taxpayers. Tax = annual sales × industry value-added rate × 10% − 0.5% of purchases.`}
          </p>
          <div>
            <label className={s.field_label} htmlFor="vt-ind">{isKo ? '업종' : 'Industry'}</label>
            <select id="vt-ind" className={s.select} value={industry} onChange={e => setIndustry(e.target.value as SimplifiedIndustryId)}>
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
              <h3 className={s.card_title} style={{ fontSize: '1rem' }}>{isKo ? '같은 매출·매입이 일반과세자라면' : 'If you were a general taxpayer'}</h3>
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
      <div className={s.ad_slot}>AD</div>
      <SeoSection
        ko={{
          title: '부가세 계산기로 무엇을 계산할 수 있나요?',
          description: '한국 부가가치세율은 10%입니다. 이 계산기는 세 가지 상황을 다룹니다. 첫째, 견적서나 세금계산서를 쓸 때 공급가액에 부가세를 더하거나, 부가세 포함 금액에서 공급가액과 세액을 나눕니다. 110,000원이면 공급가액 100,000원과 부가세 10,000원이고, 10,000원처럼 딱 나누어지지 않는 금액은 공급가액 9,091원과 부가세 909원으로 합계가 항상 맞게 나눕니다. 둘째, 개인 일반과세자가 1월·7월 부가세 신고 때 낼 세금을 미리 계산합니다. 6개월 매출 5,000만 원, 공제 가능한 매입 2,000만 원(모두 공급가액)이면 매출세액 500만 원에서 매입세액 200만 원을 뺀 300만 원을 냅니다. 셋째, 간이과세자의 1년 부가세를 업종별 부가가치율(15~40%)로 계산하고 같은 조건의 일반과세자와 비교합니다. 매출 8,000만 원, 매입 3,000만 원인 음식점이라면 간이과세자는 105만 원, 일반과세자는 약 454만 원입니다.',
          useCases: [
            { icon: '🧾', title: '견적서·세금계산서 금액 나누기', desc: '부가세 포함 1,100만 원 견적을 공급가액 1,000만 원과 세액 100만 원으로 나누거나, 공급가액에 10%를 더해 합계를 정합니다. 나누어지지 않는 금액도 원 단위로 합계가 맞습니다.' },
            { icon: '📅', title: '1월·7월 부가세 신고 준비', desc: '6개월 매출과 세금계산서·카드 매입을 넣어 낼 세금을 미리 확인합니다. 매입이 매출보다 많은 기간에는 환급 예상액이 나옵니다.' },
            { icon: '🏪', title: '간이 vs 일반 과세 유형 비교', desc: '창업 전에 예상 매출과 매입으로 간이과세자와 일반과세자의 세금 차이를 막대로 비교합니다. 매입이 큰 창업 초기에는 환급이 되는 일반과세자가 유리할 수 있습니다.' },
            { icon: '🛍️', title: '해외 거래 가격 계산', desc: '일본 10%, 싱가포르 9%, 독일 19%, 영국·프랑스 20% 세율로 바꿔 해외 판매가나 구매가에서 세금 몫을 분리할 수 있습니다.' },
          ],
          steps: [
            { step: '계산 종류 선택', desc: '금액만 나누려면 "부가세 넣기·빼기", 신고할 세금을 보려면 "부가세 신고(일반과세자)" 또는 "간이과세자 부가세" 탭을 고릅니다.' },
            { step: '금액 입력', desc: '공급가액 또는 합계, 6개월 매출·매입, 간이과세자라면 1년 매출·매입과 업종을 입력합니다. 쉼표는 자동으로 들어갑니다.' },
            { step: '결과 확인', desc: '공급가액·세액·합계, 납부 또는 환급 예상액, 간이과세자 납부의무 면제 여부와 일반과세자 비교 막대를 확인합니다.' },
            { step: '복사해서 활용', desc: '결과를 복사해 견적서·세금계산서 작성이나 신고 준비 메모에 붙여 넣습니다. 최종 신고는 홈택스 또는 세무대리인과 확인하세요.' },
          ],
          faqs: [
            { q: '부가세 포함 금액에서 공급가액은 어떻게 구하나요?', a: '합계를 1.1로 나누면 공급가액이고, 합계에서 공급가액을 빼면 부가세입니다. 110,000원이면 공급가액 100,000원, 부가세 10,000원입니다. 딱 나누어지지 않으면 공급가액을 원 단위로 반올림하고 세액은 차액으로 정해 합계가 맞도록 합니다.' },
            { q: '일반과세자는 부가세를 얼마나 내나요?', a: '신고 기간(개인은 6개월) 매출세액(매출 공급가액의 10%)에서 세금계산서·사업용 카드 등으로 증빙한 매입세액을 뺀 금액을 냅니다. 매입세액이 더 크면 환급받습니다. 신용카드 매출세액공제 등은 이 계산에 포함되지 않습니다.' },
            { q: '간이과세자 부가세는 어떻게 계산하나요?', a: '1년 매출(부가세 포함)에 업종별 부가가치율(소매·음식점 15%, 제조 20%, 숙박 25%, 건설·운수·정보통신 30%, 전문서비스·부동산임대 40%)과 10%를 곱하고, 세금계산서 등을 받은 매입액의 0.5%를 뺍니다. 1년 매출이 4,800만 원 미만이면 납부의무가 면제되지만 신고는 해야 합니다.' },
            { q: '간이과세자가 되는 기준은 얼마인가요?', a: '2024년 7월부터 직전 연도 매출(공급대가)이 1억 400만 원 미만인 개인사업자는 간이과세를 적용받을 수 있습니다. 부동산임대업과 과세유흥장소는 4,800만 원 미만이 기준이며, 일부 업종과 지역은 간이과세를 받을 수 없습니다.' },
          ],
        }}
        en={{
          title: 'What can this VAT calculator work out?',
          description: 'Korea\'s VAT rate is 10%. This calculator covers three situations. First, adding VAT to a net price or splitting a VAT-inclusive total for quotes and tax invoices: ₩110,000 is ₩100,000 net plus ₩10,000 VAT, and an awkward amount like ₩10,000 splits into ₩9,091 and ₩909 so the total always matches. Second, estimating what an individual general taxpayer pays at the January or July VAT return: ₩50M of six-month sales and ₩20M of deductible purchases (both net) give ₩5M output tax minus ₩2M input tax, so ₩3M to pay. Third, a simplified taxpayer\'s annual VAT using the industry value-added rates of 15–40%, compared with what a general taxpayer would pay: a restaurant with ₩80M sales and ₩30M purchases pays ₩1.05M as a simplified taxpayer versus about ₩4.55M as a general taxpayer. Rates for Japan, Singapore, Germany, the UK and France are also available.',
          useCases: [
            { icon: '🧾', title: 'Quotes and Tax Invoices', desc: 'Split an ₩11M VAT-inclusive quote into ₩10M net and ₩1M VAT, or add 10% to a net price. Amounts that do not divide evenly still add up to the won.' },
            { icon: '📅', title: 'January and July VAT Returns', desc: 'Enter six months of sales and deductible purchases to see the VAT you will owe, or the refund when purchases exceed sales.' },
            { icon: '🏪', title: 'Simplified vs General Registration', desc: 'Compare the two registration types before starting a business. With heavy start-up purchases, a general registration can mean a refund.' },
            { icon: '🛍️', title: 'Foreign Prices', desc: 'Switch to Japan 10%, Singapore 9%, Germany 19% or UK and France 20% to separate the tax from foreign prices.' },
          ],
          steps: [
            { step: 'Pick a Calculation', desc: 'Use "Add / remove VAT" to split amounts, or the general or simplified taxpayer tabs to estimate the VAT to pay.' },
            { step: 'Enter Amounts', desc: 'Enter a net or total amount, six-month sales and purchases, or annual sales, purchases and industry for simplified taxpayers. Commas are added automatically.' },
            { step: 'Read the Result', desc: 'See the net, VAT and total, the payment or refund estimate, simplified-taxpayer exemption and a comparison with general taxation.' },
            { step: 'Copy and Use', desc: 'Copy the result into your quote, invoice or filing notes. Confirm the final return on Hometax or with a tax accountant.' },
          ],
          faqs: [
            { q: 'How do I get the net amount from a VAT-inclusive total?', a: 'Divide the total by 1.1 for the net amount; the VAT is the total minus the net. ₩110,000 is ₩100,000 net and ₩10,000 VAT. When it does not divide evenly the net is rounded to the won and the VAT is the difference.' },
            { q: 'How much VAT does a general taxpayer pay?', a: 'Output tax (10% of net sales) minus input tax backed by tax invoices or business cards for the filing period, six months for individuals. If input tax is larger you get a refund. Card sales credits are not included here.' },
            { q: 'How is simplified taxpayer VAT calculated?', a: 'Annual VAT-inclusive sales × the industry value-added rate (retail/restaurants 15%, manufacturing 20%, lodging 25%, construction/transport/IT 30%, professional services/real estate 40%) × 10%, minus 0.5% of documented purchases. Sales under ₩48M are exempt from payment but must be filed.' },
            { q: 'Who can be a simplified taxpayer?', a: 'Since July 2024, individuals with prior-year sales under ₩104M, or under ₩48M for real-estate rental and entertainment venues. Some industries and areas are excluded.' },
          ],
        }}
      />
    </div>
  );
}
