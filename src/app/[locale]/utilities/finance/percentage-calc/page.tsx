import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isKo = params.locale === "ko";
  const title = isKo
    ? "퍼센트 계산기 — 할인·증감률·비율·역산 | Utility Hub"
    : "Percentage Calculator — Discount, Change, Ratio | Utility Hub";
  const description = isKo
    ? "할인율, 증감률, 비율, 역산 4가지 퍼센트 계산을 하나의 도구에서 즉시 처리하세요."
    : "Calculate discounts, percentage change, ratios, and reverse percentages instantly in one tool.";
  const canonical = `https://www.theutilhub.com/${params.locale}/utilities/finance/percentage-calc`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/finance/percentage-calc`,
        en: `https://www.theutilhub.com/en/utilities/finance/percentage-calc`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Utility Hub",
      locale: isKo ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "퍼센트 계산기",
  "alternateName": "Percentage Calculator",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/finance/percentage-calc",
  "description": "할인율 계산, 증감률 계산, 비율 계산, 역산 4가지 퍼센트 연산을 하나의 도구에서 제공하는 무료 계산기입니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "할인율 계산과 역산의 차이가 무엇인가요?", "acceptedAnswer": { "@type": "Answer", "text": "할인율 계산은 원래 가격에서 할인율(%)을 적용해 최종 결제 금액과 절약 금액을 구하는 방식입니다. 역산은 반대로 이미 할인된 금액과 할인율을 알고 있을 때 원래 정가를 찾아내는 계산입니다. 예를 들어 세일 후 가격이 70,000원이고 할인율이 30%라면, 역산으로 원래 정가 100,000원을 구할 수 있습니다." } },
    { "@type": "Question", "name": "증감률은 어떻게 계산되나요?", "acceptedAnswer": { "@type": "Answer", "text": "증감률은 ((새 값 - 이전 값) / 이전 값) × 100 공식으로 계산됩니다. 결과가 양수면 증가, 음수면 감소를 의미합니다. 예: 이전 값 50,000원 → 새 값 65,000원이면 (65,000 - 50,000) / 50,000 × 100 = 30% 증가입니다." } },
    { "@type": "Question", "name": "비율 계산 모드는 언제 사용하나요?", "acceptedAnswer": { "@type": "Answer", "text": "비율 계산은 전체 중 특정 부분이 차지하는 비중(%)을 구할 때 사용합니다. 예를 들어 총 매출 500만원 중 특정 상품 매출이 150만원이라면, 비율 계산으로 150 / 500 × 100 = 30%라는 점유율을 즉시 알 수 있습니다. 성적 점수, 예산 집행률, 달성률 등 다양한 상황에 활용할 수 있습니다." } },
    { "@type": "Question", "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." } }
  ]
};

'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { 
  Percent, 
  TrendingUp, 
  Hash, 
  RotateCcw, 
  Sparkles,
  ArrowRight,
  TrendingDown,
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './percent.module.css';

type Mode = 'discount' | 'change' | 'ratio' | 'reverse';

interface Result {
  label: string;
  value: string;
  highlight?: boolean;
}

export default function PercentPage() {
  const t = useTranslations('Percent');
  const locale = useLocale();
  const isKo = locale === 'ko';
  
  const [mode, setMode] = useState<Mode>('discount');
  const [isClient, setIsClient] = useState(false);

  // States
  const [origPrice, setOrigPrice] = useState('');
  const [discRate, setDiscRate] = useState('');
  const [oldVal, setOldVal] = useState('');
  const [newVal, setNewVal] = useState('');
  const [part, setPart] = useState('');
  const [total, setTotal] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [appliedRate, setAppliedRate] = useState('');

  useEffect(() => { setIsClient(true); }, []);

  const fmt = (n: number, decimals = 2) => n.toLocaleString(isKo ? 'ko-KR' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals });

  const discountResults = (): Result[] => {
    const orig = parseFloat(origPrice);
    const rate = parseFloat(discRate);
    if (!isFinite(orig) || !isFinite(rate)) return [];
    const saved = orig * (rate / 100);
    const final = orig - saved;
    return [
      { label: t('result.discountAmount'), value: `${fmt(saved)}${isKo ? '원' : ''}` },
      { label: t('result.finalPrice'), value: `${fmt(final)}${isKo ? '원' : ''}`, highlight: true },
    ];
  };

  const changeResults = (): Result[] => {
    const o = parseFloat(oldVal);
    const n = parseFloat(newVal);
    if (!isFinite(o) || !isFinite(n) || o === 0) return [];
    const rate = ((n - o) / o) * 100;
    const diff = n - o;
    const sign = diff >= 0 ? '+' : '';
    return [
      { label: t('result.difference'), value: `${sign}${fmt(diff)}` },
      { label: t('result.changeRate'), value: `${sign}${fmt(rate)}%`, highlight: true },
    ];
  };

  const ratioResults = (): Result[] => {
    const p = parseFloat(part);
    const tot = parseFloat(total);
    if (!isFinite(p) || !isFinite(tot) || tot === 0) return [];
    const ratio = (p / tot) * 100;
    return [
      { label: t('result.ratio'), value: `${fmt(ratio)}%`, highlight: true },
    ];
  };

  const reverseResults = (): Result[] => {
    const final = parseFloat(finalPrice);
    const rate = parseFloat(appliedRate);
    if (!isFinite(final) || !isFinite(rate)) return [];
    const orig = final / (1 - rate / 100);
    const saved = orig - final;
    return [
      { label: t('result.originalPrice'), value: `${fmt(orig)}${isKo ? '원' : ''}`, highlight: true },
      { label: t('result.discountAmount'), value: `${fmt(saved)}${isKo ? '원' : ''}` },
    ];
  };

  const results = mode === 'discount' ? discountResults() : mode === 'change' ? changeResults() : mode === 'ratio' ? ratioResults() : reverseResults();

  if (!isClient) return null;

  return (
    <div className={s.fin_container}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <NavigationActions />

      <header className={s.fin_header}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Percent size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.fin_title}>{t('title')}</h1>
        <p className={s.fin_subtitle}>{t('description')}</p>
      </header>

      {/* Mode Switcher */}
      <div className={s.fin_tabs}>
        {[
          { id: 'discount', label: t('mode.discount'), icon: <ArrowDownToLine size={20} /> },
          { id: 'change', label: t('mode.change'), icon: <TrendingUp size={20} /> },
          { id: 'ratio', label: t('mode.ratio'), icon: <Activity size={20} /> },
          { id: 'reverse', label: t('mode.reverse'), icon: <RotateCcw size={20} /> },
        ].map(m => (
          <button 
            key={m.id} 
            onClick={() => setMode(m.id as Mode)} 
            className={`${s.fin_tab_btn} ${mode === m.id ? s.fin_tab_btn_active : ''}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {m.icon}
              {m.label}
            </div>
          </button>
        ))}
      </div>

      {/* Main Panel */}
      <section className={s.fin_panel}>
        {mode === 'discount' && (
          <>
            <div className={s.fin_input_group}>
              <label className={s.fin_label}>{t('label.originalPrice')}</label>
              <input value={origPrice} onChange={e => setOrigPrice(e.target.value.replace(/[^0-9.]/g, ''))} className={s.fin_input} placeholder="0" />
              <span className={s.fin_suffix}>{isKo ? '원' : ''}</span>
            </div>
            <div className={s.fin_input_group}>
              <label className={s.fin_label}>{t('label.discountRate')}</label>
              <input value={discRate} onChange={e => setDiscRate(e.target.value.replace(/[^0-9.]/g, ''))} className={s.fin_input} placeholder="0" />
              <span className={s.fin_suffix}>%</span>
            </div>
          </>
        )}

        {mode === 'change' && (
          <>
            <div className={s.fin_input_group}>
              <label className={s.fin_label}>{isKo ? '이전 값' : 'Old Value'}</label>
              <input value={oldVal} onChange={e => setOldVal(e.target.value.replace(/[^0-9.]/g, ''))} className={s.fin_input} placeholder="0" />
            </div>
            <div className={s.fin_input_group}>
              <label className={s.fin_label}>{isKo ? '새 값' : 'New Value'}</label>
              <input value={newVal} onChange={e => setNewVal(e.target.value.replace(/[^0-9.]/g, ''))} className={s.fin_input} placeholder="0" />
            </div>
          </>
        )}

        {mode === 'ratio' && (
          <>
            <div className={s.fin_input_group}>
              <label className={s.fin_label}>{isKo ? '부분 값' : 'Partial Value'}</label>
              <input value={part} onChange={e => setPart(e.target.value.replace(/[^0-9.]/g, ''))} className={s.fin_input} placeholder="0" />
            </div>
            <div className={s.fin_input_group}>
              <label className={s.fin_label}>{isKo ? '전체 값' : 'Total Value'}</label>
              <input value={total} onChange={e => setTotal(e.target.value.replace(/[^0-9.]/g, ''))} className={s.fin_input} placeholder="0" />
            </div>
          </>
        )}

        {mode === 'reverse' && (
          <>
            <div className={s.fin_input_group}>
              <label className={s.fin_label}>{isKo ? '현재 가격' : 'Current Price'}</label>
              <input value={finalPrice} onChange={e => setFinalPrice(e.target.value.replace(/[^0-9.]/g, ''))} className={s.fin_input} placeholder="0" />
              <span className={s.fin_suffix}>{isKo ? '원' : ''}</span>
            </div>
            <div className={s.fin_input_group}>
              <label className={s.fin_label}>{isKo ? '할인율' : 'Discount Rate'}</label>
              <input value={appliedRate} onChange={e => setAppliedRate(e.target.value.replace(/[^0-9.]/g, ''))} className={s.fin_input} placeholder="0" />
              <span className={s.fin_suffix}>%</span>
            </div>
          </>
        )}

        {/* Results Area */}
        {results.length > 0 && (
          <div className={s.fin_result_card} style={{ animation: 'bounceIn 0.5s ease-out' }}>
            {results.map((res, i) => (
              <div key={i} className={s.fin_result_item}>
                <span className={s.fin_result_label}>{res.label}</span>
                <span className={s.fin_result_value} style={{ fontSize: res.highlight ? '1.75rem' : '1.1rem' }}>
                  {res.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Standard Bottom Sections */}
      <div style={{ width: '100%' }}>
        <ShareBar title={t('title')} description={t('description')} />
        <RelatedTools toolId="utilities/finance/percentage-calc" />
        <div className={s.fin_ad_placeholder}>{isKo ? '광고 영역' : 'Ad Space'}</div>
        <SeoSection
          ko={{
            title: '퍼센트 계산기란 무엇인가요?',
            description: '퍼센트 계산기는 일상과 비즈니스에서 가장 자주 필요한 4가지 퍼센트 연산을 하나의 도구에서 즉시 처리할 수 있는 무료 계산기입니다. [할인율 계산]은 원래 가격과 할인율을 입력하면 최종 결제금액과 절약 금액을 바로 보여줍니다. [증감률 계산]은 이전 값과 새 값을 입력하면 증가 또는 감소한 비율(%)을 구해주며, 주식 수익률·매출 변화·물가 상승률 비교에 유용합니다. [비율 계산]은 전체 중 부분이 차지하는 비중(%)을 계산하여 점유율·달성률·예산 집행률 분석에 활용할 수 있습니다. [역산 계산]은 세일 후 가격과 할인율을 알고 있을 때 원래 정가를 찾아내는 기능으로, 온라인 쇼핑 중 정가 확인이나 가격 협상 시 유용합니다. 별도의 앱 설치나 회원가입 없이 브라우저에서 바로 사용할 수 있으며, 모바일과 PC 모두 최적화되어 있습니다.',
            useCases: [
              { icon: '🏷️', title: '쇼핑 할인 금액 계산', desc: '마트나 온라인 쇼핑몰에서 "30% 할인" 상품의 실제 결제 금액과 절약 금액을 미리 계산하여 예산을 초과하지 않고 현명한 구매 결정을 내릴 수 있습니다.' },
              { icon: '📈', title: '주식·투자 수익률 확인', desc: '주식이나 펀드의 매수가와 현재가를 입력하면 증감률 탭에서 수익률(%)과 실제 손익 금액을 즉시 계산하여 포트폴리오 성과를 한눈에 파악할 수 있습니다.' },
              { icon: '📊', title: '매출·목표 달성률 분석', desc: '이번 달 목표 매출과 실제 매출을 입력하면 달성률(%)을 즉시 계산하여 팀 보고나 개인 성과 분석에 활용할 수 있습니다. 비율 탭에서 부분값과 전체값만 입력하면 됩니다.' },
              { icon: '🔄', title: '정가 역산 — 원래 가격 찾기', desc: '세일 후 가격이 35,000원이고 할인율이 30%라면, 역산 탭에서 원래 정가 50,000원을 즉시 구할 수 있습니다. 온라인 쇼핑 중 정가 확인이나 가격 협상 전 기준가 파악에 유용합니다.' },
            ],
            steps: [
              { step: '계산 모드 선택', desc: '상단 탭에서 원하는 계산 유형을 선택합니다. 할인율(쇼핑 절약), 증감률(투자·매출 변화), 비율(점유율·달성률), 역산(정가 찾기) 중 상황에 맞는 탭을 클릭하면 입력 필드가 즉시 바뀝니다.' },
              { step: '값 입력', desc: '선택한 모드에 맞는 숫자를 두 개의 입력창에 입력합니다. 예를 들어 할인율 탭에서는 원래 가격과 할인율(%)을, 증감률 탭에서는 이전 값과 새 값을 각각 입력합니다.' },
              { step: '결과 확인', desc: '두 값이 모두 입력되면 아래 결과 카드에 주요 수치가 자동으로 표시됩니다. 할인율 탭은 최종 가격과 절약 금액을, 증감률 탭은 변화율(%)과 차이 금액을 함께 보여줍니다.' },
              { step: '다른 모드로 전환', desc: '탭을 클릭하면 이전 입력값이 초기화되고 새 모드에 맞는 입력창이 나타납니다. 여러 계산을 연속으로 수행할 경우 각 탭을 전환하며 빠르게 작업할 수 있습니다.' },
            ],
            faqs: [
              { q: '할인율 계산과 역산의 차이가 무엇인가요?', a: '할인율 계산은 원래 가격에서 할인율을 적용해 최종 결제금액을 구합니다. 역산은 반대로 이미 할인된 금액과 할인율을 알고 있을 때 원래 정가를 찾는 방식입니다. 예: 세일 후 70,000원이고 할인율 30% → 역산으로 정가 100,000원 도출.' },
              { q: '증감률은 어떻게 계산되나요?', a: '증감률은 ((새 값 - 이전 값) ÷ 이전 값) × 100 공식으로 계산됩니다. 양수이면 증가, 음수이면 감소를 의미합니다. 예: 이전 50,000원 → 새 값 65,000원 → 증감률 +30%. 주식 수익률, 물가 상승률, 월별 매출 비교 등에 활용하세요.' },
              { q: '비율 계산 모드는 언제 사용하나요?', a: '전체 중 특정 부분이 차지하는 비중(%)을 구할 때 사용합니다. 예: 총 매출 500만원 중 A 상품 매출 150만원 → 비율 30%. 예산 집행률, 출석률, 목표 달성률, 시장 점유율 등 다양한 상황에서 활용할 수 있습니다.' },
              { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
            ],
          }}
          en={{
            title: 'What is a Percentage Calculator?',
            description: 'A percentage calculator is a versatile financial tool that handles the four most common percentage operations in everyday life and business — all in one place. The Discount tab calculates the final price and savings amount when a discount rate is applied to an original price, making it ideal for shopping decisions. The Change tab computes the percentage increase or decrease between two values, which is essential for tracking stock returns, sales growth, and price fluctuations. The Ratio tab finds what percentage a part represents of a whole, useful for market share analysis, budget execution rates, and performance tracking. The Reverse tab works backward: given a discounted price and the discount rate, it recovers the original list price — handy when you want to verify a product\'s true retail value. No installation or sign-up is required; the tool works entirely in your browser and is optimized for both mobile and desktop use.',
            useCases: [
              { icon: '🏷️', title: 'Shopping Discount Calculation', desc: 'Enter the original price and discount rate to instantly see the final payment amount and how much you save — helping you decide whether a sale is genuinely worth it before adding items to your cart.' },
              { icon: '📈', title: 'Investment Return Tracking', desc: 'Input your purchase price and current value in the Change tab to calculate your return rate (%) and actual profit or loss amount, giving you a clear picture of your investment performance at a glance.' },
              { icon: '📊', title: 'Sales & Goal Achievement Rate', desc: 'Use the Ratio tab to calculate the percentage of a target achieved. Input actual sales and total target to instantly see your achievement rate for monthly reports, team reviews, or personal goal tracking.' },
              { icon: '🔄', title: 'Reverse Lookup — Find the Original Price', desc: 'If a product is priced at $70 after a 30% discount, the Reverse tab instantly calculates the original price of $100. Useful for verifying retailer claims and preparing for price negotiations.' },
            ],
            steps: [
              { step: 'Select a Calculation Mode', desc: 'Click the tab that matches your need: Discount (shopping savings), Change (growth or decline rate), Ratio (part-to-whole percentage), or Reverse (recover original price from discounted value and rate).' },
              { step: 'Enter Your Values', desc: 'Fill in the two input fields that appear for the selected mode. For example, in Discount mode enter the original price and discount rate; in Change mode enter the old value and the new value.' },
              { step: 'Read the Result', desc: 'Results appear automatically in the card below as soon as both fields are filled. Discount mode shows the final price and savings; Change mode shows the percentage change and the numerical difference between the two values.' },
              { step: 'Switch Modes Freely', desc: 'Click any tab to switch calculation modes — inputs reset so you can start a fresh calculation. Use this to quickly run multiple different percentage calculations in sequence without reloading the page.' },
            ],
            faqs: [
              { q: 'What is the difference between Discount and Reverse calculation?', a: 'Discount calculates the final price after applying a percentage off an original price. Reverse works backward: given the post-discount price and the discount rate, it recovers the original list price. Example: $70 after 30% off → Reverse gives the original price of $100.' },
              { q: 'How is percentage change calculated?', a: 'Percentage change = ((New Value - Old Value) / Old Value) × 100. A positive result means an increase; negative means a decrease. Example: old value 50,000 → new value 65,000 = +30% change. Useful for stock returns, price inflation, and monthly sales comparisons.' },
              { q: 'When should I use the Ratio tab?', a: 'Use Ratio when you need to find what percentage a part is of a whole. Enter the partial value and the total value to get the percentage. For example, 150 out of 500 = 30%. Great for market share, budget utilization, attendance rates, and goal completion tracking.' },
              { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
            ],
          }}
        />
      </div>
    </div>
  );
}
