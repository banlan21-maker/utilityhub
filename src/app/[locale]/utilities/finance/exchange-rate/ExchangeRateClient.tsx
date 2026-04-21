'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeftRight, Activity, Clock } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './exchange.module.css';

interface Currency {
  code: string;
  nameKo: string;
  nameEn: string;
  symbol: string;
  flag: string;
}

const CURRENCIES: Currency[] = [
  { code: 'USD', nameKo: '미국',        nameEn: 'USA',         symbol: '$',   flag: '🇺🇸' },
  { code: 'KRW', nameKo: '한국',        nameEn: 'Korea',       symbol: '₩',   flag: '🇰🇷' },
  { code: 'EUR', nameKo: '유럽',        nameEn: 'Europe',      symbol: '€',   flag: '🇪🇺' },
  { code: 'JPY', nameKo: '일본',        nameEn: 'Japan',       symbol: '¥',   flag: '🇯🇵' },
  { code: 'CNY', nameKo: '중국',        nameEn: 'China',       symbol: '¥',   flag: '🇨🇳' },
  { code: 'GBP', nameKo: '영국',        nameEn: 'UK',          symbol: '£',   flag: '🇬🇧' },
  { code: 'HKD', nameKo: '홍콩',        nameEn: 'Hong Kong',   symbol: '$',   flag: '🇭🇰' },
  { code: 'SGD', nameKo: '싱가포르',    nameEn: 'Singapore',   symbol: '$',   flag: '🇸🇬' },
  { code: 'AUD', nameKo: '호주',        nameEn: 'Australia',   symbol: '$',   flag: '🇦🇺' },
  { code: 'CAD', nameKo: '캐나다',      nameEn: 'Canada',      symbol: '$',   flag: '🇨🇦' },
  { code: 'THB', nameKo: '태국',        nameEn: 'Thailand',    symbol: '฿',   flag: '🇹🇭' },
  { code: 'VND', nameKo: '베트남',      nameEn: 'Vietnam',     symbol: '₫',   flag: '🇻🇳' },
  { code: 'PHP', nameKo: '필리핀',      nameEn: 'Philippines', symbol: '₱',   flag: '🇵🇭' },
  { code: 'CHF', nameKo: '스위스',      nameEn: 'Switzerland', symbol: 'Fr',  flag: '🇨🇭' },
  { code: 'INR', nameKo: '인도',        nameEn: 'India',       symbol: '₹',   flag: '🇮🇳' },
  { code: 'MYR', nameKo: '말레이시아',  nameEn: 'Malaysia',    symbol: 'RM',  flag: '🇲🇾' },
  { code: 'IDR', nameKo: '인도네시아',  nameEn: 'Indonesia',   symbol: 'Rp',  flag: '🇮🇩' },
  { code: 'NZD', nameKo: '뉴질랜드',    nameEn: 'New Zealand', symbol: '$',   flag: '🇳🇿' },
  { code: 'TWD', nameKo: '대만',        nameEn: 'Taiwan',      symbol: 'NT$', flag: '🇹🇼' },
  { code: 'AED', nameKo: '아랍에미리트', nameEn: 'UAE',        symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'TRY', nameKo: '튀르키예',    nameEn: 'Türkiye',     symbol: '₺',   flag: '🇹🇷' },
];

const INTEGER_CURRENCIES = new Set(['KRW', 'JPY', 'VND', 'IDR']);

function formatRate(v: number, toCurrency: string): string {
  return INTEGER_CURRENCIES.has(toCurrency)
    ? Math.round(v).toLocaleString()
    : v.toFixed(2);
}

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

/* ─── Sparkline ─── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const W = 600, H = 140, PAD = 10;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2) - 10;
    return `${x},${y}`;
  });

  // Fix: first point appears only once (M pts[0] L pts[1]...)
  const linePath = `M ${pts[0]} L ${pts.slice(1).join(' L ')}`;
  const areaPath = `${linePath} L ${W - PAD},${H - PAD} L ${PAD},${H - PAD} Z`;

  const [lastX, lastY] = pts[pts.length - 1].split(',').map(Number);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '120px', display: 'block' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkGrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="6" fill={color} stroke="white" strokeWidth="2" />
    </svg>
  );
}

/* ─── Main ─── */
export default function ExchangeRateClient() {
  const t = useTranslations('Currency');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('KRW');
  const [amount, setAmount] = useState('1');
  const [rate, setRate] = useState<number | null>(null);
  const [history, setHistory] = useState<{ date: string; rate: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const fromCur = CURRENCIES.find(c => c.code === from)!;
  const toCur   = CURRENCIES.find(c => c.code === to)!;

  const fetchRate = useCallback(async (f: string, t2: string) => {
    if (f === t2) { setRate(1); return; }
    setLoading(true);
    setError(null);
    try {
      let fetched = false;
      try {
        const res = await fetchWithTimeout(`https://api.frankfurter.app/latest?from=${f}&to=${t2}`, 5000);
        if (res.ok) {
          const data = await res.json();
          if (data.rates?.[t2]) {
            setRate(data.rates[t2]);
            setLastUpdated(new Date().toLocaleTimeString(isKo ? 'ko-KR' : 'en-US'));
            fetched = true;
          }
        }
      } catch { /* fall through */ }

      if (!fetched) {
        const res2 = await fetchWithTimeout(`https://open.er-api.com/v6/latest/${f}`, 8000);
        if (!res2.ok) throw new Error();
        const data2 = await res2.json();
        if (!data2.rates?.[t2]) throw new Error();
        setRate(data2.rates[t2]);
        setLastUpdated(new Date().toLocaleTimeString(isKo ? 'ko-KR' : 'en-US'));
      }
    } catch {
      setError(t('error'));
      setRate(null);
    } finally {
      setLoading(false);
    }
  }, [isKo, t]);

  const fetchHistory = useCallback(async (f: string, t2: string) => {
    if (f === t2) { setHistory([]); return; }
    setChartLoading(true);
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      const fmt = (d: Date) => d.toISOString().split('T')[0];

      let entries: { date: string; rate: number }[] = [];
      try {
        const res = await fetchWithTimeout(
          `https://api.frankfurter.app/${fmt(start)}..${fmt(end)}?from=${f}&to=${t2}`,
          6000
        );
        if (res.ok) {
          const data = await res.json();
          entries = Object.entries(data.rates as Record<string, Record<string, number>>)
            .map(([date, rates]) => ({ date, rate: rates[t2] }))
            .sort((a, b) => a.date.localeCompare(b.date));
        }
      } catch { /* fall through */ }

      if (entries.length === 0) {
        const dates: string[] = [];
        for (let i = 0; i < 10; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i * 3);
          dates.push(fmt(d));
        }
        const results = await Promise.allSettled(
          dates.map(async (date) => {
            const res = await fetchWithTimeout(
              `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/${f.toLowerCase()}.json`,
              5000
            );
            const data = await res.json();
            const r = data[f.toLowerCase()]?.[t2.toLowerCase()];
            return r ? { date, rate: r as number } : null;
          })
        );
        entries = results
          .filter((r): r is PromiseFulfilledResult<{ date: string; rate: number }> =>
            r.status === 'fulfilled' && r.value !== null)
          .map(r => r.value)
          .sort((a, b) => a.date.localeCompare(b.date));
      }

      setHistory(entries);
    } catch {
      setHistory([]);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchRate(from, to);
      fetchHistory(from, to);
    }
  }, [from, to, fetchRate, fetchHistory, isClient]);

  const swap = () => { setFrom(to); setTo(from); };

  const numericAmount = parseFloat(amount) || 0;
  const converted = rate !== null ? numericAmount * rate : null;
  const historyRates = history.map(h => h.rate);

  const formatConverted = (v: number) => {
    if (INTEGER_CURRENCIES.has(to)) return v.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
    return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  if (!isClient) return null;

  return (
    <div className={s.ex_container}>
      <NavigationActions />
      <header className={s.ex_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <ArrowLeftRight size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.ex_title}>{t('title')}</h1>
        <p className={s.ex_subtitle}>{t('description')}</p>
      </header>

      <section className={s.ex_panel}>
        {/* Amount Input */}
        <div className={s.ex_input_group}>
          <label className={s.ex_label}>{t('amount')}</label>
          <div className={s.ex_amount_input_wrapper}>
            <span className={s.ex_amount_symbol}>{fromCur.symbol}</span>
            <input
              className={s.ex_amount_input}
              value={amount}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                setAmount(v);
              }}
              inputMode="decimal"
              placeholder="0"
              aria-label={isKo ? '환전할 금액 입력' : 'Enter amount to convert'}
            />
          </div>
        </div>

        {/* Currency Selectors */}
        <div className={s.ex_selector_row}>
          <div>
            <label className={s.ex_label}>{t('from')}</label>
            <select value={from} onChange={e => setFrom(e.target.value)} className={s.ex_select} aria-label={isKo ? '출발 통화' : 'From currency'}>
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} ({isKo ? c.nameKo : c.nameEn})
                </option>
              ))}
            </select>
          </div>
          <button onClick={swap} className={s.ex_swap_btn} title={t('swap')} aria-label={t('swap')}>
            <ArrowLeftRight size={24} />
          </button>
          <div>
            <label className={s.ex_label}>{t('to')}</label>
            <select value={to} onChange={e => setTo(e.target.value)} className={s.ex_select} aria-label={isKo ? '도착 통화' : 'To currency'}>
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} ({isKo ? c.nameKo : c.nameEn})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        <div className={s.ex_result_display}>
          {loading ? (
            <div style={{ color: '#94a3b8', fontSize: '1.25rem', fontWeight: 700 }}>{t('loading')}</div>
          ) : error ? (
            <div style={{ color: '#ef4444' }}>{error}</div>
          ) : converted !== null ? (
            <>
              <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 800 }}>
                {fromCur.flag} {from} {numericAmount.toLocaleString()} =
              </div>
              <div className={s.ex_result_main}>
                {toCur.symbol} {formatConverted(converted)}
              </div>
              <div style={{ fontSize: '1.1rem', color: '#8b5cf6', fontWeight: 900 }}>
                {toCur.flag} {to}
              </div>
              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                <span>1 {from} = {formatRate(rate!, to)} {to}</span>
                <span><Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />{lastUpdated}</span>
              </div>
            </>
          ) : null}
        </div>

        {/* 30-Day Chart */}
        {historyRates.length > 1 && (
          <div className={s.ex_chart_box}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={16} color="#8b5cf6" />
                {t('chart_title')}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                {isKo ? '30일 최저' : 'Min'} {formatRate(Math.min(...historyRates), to)} ·{' '}
                {isKo ? '최고' : 'Max'} {formatRate(Math.max(...historyRates), to)}
              </div>
            </div>
            {chartLoading ? (
              <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0' }}>Loading...</div>
            ) : (
              <Sparkline data={historyRates} color="#8b5cf6" />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              <span>{history[0].date}</span>
              <span>{history[history.length - 1].date}</span>
            </div>
          </div>
        )}

        {/* Quick Ref */}
        {rate !== null && (
          <div className={s.ex_ref_grid}>
            {[10, 100, 1000].map(v => (
              <div key={v} className={s.ex_ref_item}>
                <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{v} {from}</div>
                <div style={{ fontWeight: 800, color: '#1e293b' }}>{toCur.symbol} {formatConverted(v * rate)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div style={{ width: '100%' }}>
        <ShareBar title={t('title')} description={t('description')} />
        <RelatedTools toolId="utilities/finance/exchange-rate" />
        <div className={s.ex_ad_placeholder}>{isKo ? '광고 영역' : 'Ad Space'}</div>
        <SeoSection
          ko={{
            title: '실시간 환율 계산기란 무엇인가요?',
            description: '환율 계산기는 전 세계 주요 통화 간의 환전 비율을 실시간으로 계산하여 외화 금액을 자국 화폐로 변환해주는 필수 금융 도구입니다. 본 계산기는 미국 달러(USD), 유로(EUR), 일본 엔(JPY), 중국 위안(CNY), 영국 파운드(GBP) 등 20개 이상의 주요 통화를 지원하며, 유럽중앙은행(ECB) 공식 환율 데이터 기반의 Frankfurter API를 통해 매 영업일 업데이트되는 정확한 환율을 제공합니다. 단순한 환전 계산을 넘어 최근 30일간의 환율 추이를 시각적인 차트로 보여주어 환율 변동 패턴을 파악할 수 있으며, 전일 대비 상승/하락률을 퍼센티지로 표시하여 환전 타이밍을 판단하는 데 도움을 줍니다. 해외여행 경비 계산, 해외 직구 결제 예상 금액 산출, 국제 송금 비용 예측, 외화 투자 수익률 계산 등 다양한 상황에서 활용할 수 있으며, 특히 환율이 급변하는 시기에 실시간으로 확인하여 손해를 최소화하고 유리한 시점에 거래할 수 있도록 지원합니다.',
            useCases: [
              { icon: '✈️', title: '해외여행 경비 계획', desc: '호텔, 식사, 관광 비용 등 현지 통화 가격을 원화로 환산하여 여행 예산을 정확하게 수립하고 환전 금액을 결정할 수 있습니다.' },
              { icon: '🛒', title: '해외 직구 및 구매 대행', desc: '아마존, 이베이 등 해외 쇼핑몰의 달러/유로 가격을 실시간 환율로 계산하여 배송비 포함 최종 결제 금액을 미리 파악할 수 있습니다.' },
              { icon: '💸', title: '국제 송금 및 환전 타이밍', desc: '최근 30일 환율 추이 차트를 보고 환율이 낮을 때 환전하거나 높을 때 송금하는 등 최적의 거래 시점을 선택할 수 있습니다.' },
              { icon: '📈', title: '외화 자산 가치 평가', desc: '해외 주식, 채권, 부동산 등 외화 표시 자산의 현재 가치를 원화로 환산하여 포트폴리오 전체 수익률을 정확히 계산할 수 있습니다.' },
            ],
            steps: [
              { step: '출발/도착 통화 선택', desc: '상단의 통화 선택 드롭다운에서 출발 통화(예: KRW 원화)와 도착 통화(예: USD 달러)를 클릭하여 선택합니다. 양방향 화살표 버튼으로 통화를 빠르게 바꿀 수 있습니다.' },
              { step: '금액 입력', desc: '환전하려는 금액을 숫자로 입력하면, 실시간으로 상대 통화 금액이 자동 계산되어 하단에 표시됩니다. 소수점 입력도 가능합니다.' },
              { step: '환율 추이 확인', desc: '화면 하단의 차트에서 최근 30일간 환율 변동 흐름을 확인하고, 현재 환율이 고점인지 저점인지 판단합니다.' },
              { step: '환전 또는 송금 결정', desc: '계산된 금액과 환율 트렌드를 종합하여 지금 환전할지, 조금 더 기다릴지 결정합니다. 결과 화면을 캡처하거나 메모하여 은행 방문 시 참고자료로 활용하세요.' },
            ],
            faqs: [
              { q: '환율 데이터는 어디서 가져오나요?', a: '본 계산기는 유럽중앙은행(ECB) 공식 환율을 기반으로 한 Frankfurter API를 사용합니다. 매 영업일 업데이트되며, 주말과 공휴일에는 마지막 영업일의 환율이 표시됩니다.' },
              { q: '실제 은행 환전 시 이 환율과 동일한가요?', a: '아닙니다. 본 계산기는 기준 환율(중간값)을 제공하며, 실제 은행이나 환전소는 매매기준율에 수수료를 가산한 현찰 살 때/팔 때 환율을 적용합니다. 보통 기준 환율 대비 1~3% 정도 차이가 발생할 수 있습니다.' },
              { q: '환율이 유리할 때는 언제인가요?', a: '일반적으로 해외여행이나 직구 시 원화 가치가 높아(환율 하락) 적은 원화로 많은 외화를 살 수 있을 때 유리하고, 해외 수입이나 외화 자산 매도 시에는 환율이 높을 때 유리합니다. 30일 차트에서 환율 저점을 참고하세요.' },
              { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
            ],
          }}
          en={{
            title: 'What is a Real-Time Currency Exchange Calculator?',
            description: 'A currency exchange calculator is an essential financial tool that converts amounts between global currencies using real-time exchange rates. This calculator supports 20+ major currencies including US Dollar (USD), Euro (EUR), Japanese Yen (JPY), Chinese Yuan (CNY), British Pound (GBP), and more, powered by the Frankfurter API which sources official rates from the European Central Bank (ECB) and updates daily on business days. Beyond simple conversions, it visualizes 30-day exchange rate trends with interactive charts and helps users identify optimal timing for currency exchange or international transactions. Whether you\'re planning travel budgets, calculating overseas shopping costs, estimating international remittance fees, or evaluating foreign investment returns, this tool provides accurate, up-to-date information to minimize losses and maximize value in cross-border financial activities.',
            useCases: [
              { icon: '✈️', title: 'Travel Budget Planning', desc: 'Convert hotel, meal, and tour prices from local currencies to your home currency to set accurate travel budgets and decide how much cash to exchange.' },
              { icon: '🛒', title: 'Online Shopping & Importing', desc: 'Calculate total costs in your currency for items on Amazon, eBay, or other foreign e-commerce sites, including shipping, to avoid payment surprises.' },
              { icon: '💸', title: 'Remittance Timing Optimization', desc: 'Review the 30-day chart to identify low-rate periods for buying foreign currency or high-rate periods for sending money abroad, maximizing savings.' },
              { icon: '📈', title: 'Foreign Asset Valuation', desc: 'Convert the value of overseas stocks, bonds, or real estate holdings to your home currency to accurately track portfolio performance and returns.' },
            ],
            steps: [
              { step: 'Select Currency Pair', desc: 'Click the currency dropdown menus at the top to choose your source currency (e.g., USD) and target currency (e.g., KRW). Use the swap button to quickly reverse the pair.' },
              { step: 'Enter Amount', desc: 'Type the amount you want to convert into the input field. The converted amount appears instantly below. Decimal values are supported.' },
              { step: 'Review Rate Trends', desc: 'Check the 30-day chart at the bottom to see recent exchange rate movements and gauge whether rates are currently high or low.' },
              { step: 'Make Exchange Decision', desc: 'Combine the calculated amount and trend analysis to decide whether to exchange now or wait. Screenshot or note the result for reference when visiting a bank or exchange service.' },
            ],
            faqs: [
              { q: 'Where does the exchange rate data come from?', a: 'This calculator uses the Frankfurter API, which is based on official rates published by the European Central Bank (ECB). Data updates every business day; weekend and holiday rates reflect the last trading day.' },
              { q: 'Will banks offer the same rate?', a: 'No. This calculator shows the mid-market (interbank) rate. Banks and exchange services add margins to create "buy" and "sell" rates, typically 1-3% higher or lower than the mid-market rate depending on the transaction direction.' },
              { q: 'When is the best time to exchange currency?', a: 'For travel or shopping abroad, exchange when your home currency is strong (lower exchange rate = more foreign currency per unit). For receiving foreign income, exchange when rates are high. Use the 30-day chart to spot trends and lows.' },
              { q: 'Can I compare multiple currencies at once?', a: 'The current version supports 1:1 currency pair comparisons. To compare multiple currencies, fix your base currency and switch the target currency for each calculation, then note the results manually for side-by-side comparison.' },
            ],
          }}
        />
      </div>
    </div>
  );
}
