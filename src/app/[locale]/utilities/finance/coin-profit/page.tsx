import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isKo = params.locale === "ko";
  const title = isKo
    ? "코인 수익률 계산기 — 실시간 암호화폐 손익 | Utility Hub"
    : "Crypto Profit Calculator — Real-Time Coin P&L | Utility Hub";
  const description = isKo
    ? "비트코인·알트코인 매수가와 수량을 입력하면 실시간 시세로 수익률과 손익 금액을 즉시 계산합니다."
    : "Enter your crypto buy price and quantity to instantly calculate profit, loss, and ROI with live prices.";
  const canonical = `https://www.theutilhub.com/${params.locale}/utilities/finance/coin-profit`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/finance/coin-profit`,
        en: `https://www.theutilhub.com/en/utilities/finance/coin-profit`,
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
  "name": "코인 수익률 계산기",
  "alternateName": "Crypto Profit Calculator",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/finance/coin-profit",
  "description": "CoinGecko 실시간 API를 통해 비트코인·이더리움 등 주요 암호화폐의 매수가 대비 현재 수익률과 손익 금액을 즉시 계산하는 무료 도구입니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "코인 가격은 실시간으로 업데이트되나요?", "acceptedAnswer": { "@type": "Answer", "text": "네. CoinGecko API를 통해 실시간 시세를 가져오며, 새로 고침 버튼을 누르거나 코인을 다시 선택하면 최신 가격으로 업데이트됩니다. 30초 이내의 캐시가 적용되어 API 호출을 최소화합니다." } },
    { "@type": "Question", "name": "어떤 코인을 지원하나요?", "acceptedAnswer": { "@type": "Answer", "text": "CoinGecko 시가총액 상위 코인 목록을 지원합니다. 비트코인(BTC), 이더리움(ETH), 리플(XRP), 솔라나(SOL), 도지코인(DOGE) 등 주요 알트코인을 포함한 수십 종의 암호화폐를 이름 또는 심볼로 검색할 수 있습니다." } },
    { "@type": "Question", "name": "KRW와 USD 중 어떤 기준으로 계산하나요?", "acceptedAnswer": { "@type": "Answer", "text": "상단 기준 통화 버튼에서 KRW(원화) 또는 USD(달러) 중 원하는 통화를 선택할 수 있습니다. 선택한 통화 기준으로 코인 목록과 현재가가 모두 표시되며, 매수 단가도 동일 통화 기준으로 입력하면 됩니다." } },
    { "@type": "Question", "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." } }
  ]
};

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { 
  Plus, 
  Trash2, 
  RefreshCcw, 
  TrendingUp, 
  TrendingDown, 
  History, 
  Info, 
  Settings, 
  Search, 
  Share2,
  DollarSign,
  Bitcoin,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Sparkles
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './coin.module.css';

/* ─── Fiat & Types ─── */
interface FiatCurrency {
  code: string;
  symbol: string;
  label: string;
  flag: string;
  locale: string;
  decimals: number;
}

const FIAT: FiatCurrency[] = [
  { code: 'krw', symbol: '₩', label: 'KRW', flag: '🇰🇷', locale: 'ko-KR', decimals: 0 },
  { code: 'usd', symbol: '$', label: 'USD', flag: '🇺🇸', locale: 'en-US', decimals: 2 },
];

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const priceCache = new Map<string, { price: number; ts: number }>();
const CACHE_TTL = 30_000;

/* ─── Main Component ─── */

export default function CryptoPage() {
  const t = useTranslations('Crypto');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [fiatCode, setFiatCode] = useState('krw');
  const [coins, setCoins] = useState<Coin[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [buyPrice, setBuyPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [fetchingCoins, setFetchingCoins] = useState(true);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [lastPriceTime, setLastPriceTime] = useState('');
  const [isClient, setIsClient] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsClient(true); }, []);

  const fiat = FIAT.find(f => f.code === fiatCode)!;

  const formatMoney = useCallback((v: number) => {
    return (v < 0 ? '-' : '') + fiat.symbol + Math.abs(v).toLocaleString(fiat.locale, {
      minimumFractionDigits: fiat.decimals,
      maximumFractionDigits: fiat.decimals,
    });
  }, [fiat]);

  const fetchCoinList = useCallback(async (curr: string) => {
    setFetchingCoins(true);
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${curr}&order=market_cap_desc&per_page=50&page=1`);
      if (!res.ok) throw new Error();
      setCoins(await res.json());
    } catch {
      // Fallback
      setCoins([
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png', current_price: 0, price_change_percentage_24h: 0 },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png', current_price: 0, price_change_percentage_24h: 0 },
      ]);
    } finally {
      setFetchingCoins(false);
    }
  }, []);

  useEffect(() => { if (isClient) fetchCoinList(fiatCode); }, [fiatCode, fetchCoinList, isClient]);

  const refreshPrice = useCallback(async (coin: Coin, curr: string) => {
    const key = `${coin.id}:${curr}`;
    const cached = priceCache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setSelectedCoin(prev => prev ? { ...prev, current_price: cached!.price } : prev);
      return;
    }
    setFetchingPrice(true);
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=${curr}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const p = data[coin.id]?.[curr] ?? coin.current_price;
      priceCache.set(key, { price: p, ts: Date.now() });
      setSelectedCoin(prev => prev ? { ...prev, current_price: p } : prev);
      setLastPriceTime(new Date().toLocaleTimeString(isKo ? 'ko-KR' : 'en-US'));
    } catch { /* Error toast handled elsewhere */ }
    finally { setFetchingPrice(false); }
  }, [isKo]);

  const selectCoin = (coin: Coin) => {
    setSelectedCoin(coin);
    setQuery(coin.name);
    setShowDropdown(false);
    refreshPrice(coin, fiatCode);
  };

  const filtered = query.trim()
    ? coins.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.symbol.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
    : coins.slice(0, 5);

  const numBuy = parseFloat(buyPrice) || 0;
  const numQty = parseFloat(quantity) || 0;
  const curPrice = selectedCoin?.current_price ?? 0;
  const totalInvested = numBuy * numQty;
  const currentValue = curPrice * numQty;
  const profit = currentValue - totalInvested;
  const profitRate = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
  const isProfit = profit >= 0;

  if (!isClient) return null;

  return (
    <div className={s.coin_container}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <NavigationActions />
      <header className={s.coin_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Bitcoin size={40} color="#f7931a" />
        </div>
        <h1 className={s.coin_title}>{isKo ? '코인 수익률 계산기' : 'Crypto Profit Calc'}</h1>
        <p className={s.coin_subtitle}>{isKo ? '보유하신 코인의 실시간 수익과 수익률을 즉시 확인하세요' : 'Track your crypto gains and losses with real-time market prices.'}</p>
      </header>

      <section className={s.coin_card}>
        {/* Currency Switch */}
        <div className={s.coin_selector_group}>
          <label className={s.coin_label}>{isKo ? '기준 통화' : 'Base Currency'}</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {FIAT.map(f => (
              <button 
                key={f.code} 
                onClick={() => setFiatCode(f.code)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #334155', background: fiatCode === f.code ? '#8b5cf6' : '#1e293b', color: '#fff', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {f.flag} {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Coin Finder */}
        <div className={s.coin_selector_group} ref={searchRef} style={{ position: 'relative' }}>
          <label className={s.coin_label}>{isKo ? '코인 검색' : 'Search Coin'}</label>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              className={s.coin_input} 
              style={{ paddingLeft: '2.75rem' }}
              value={query}
              onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder={isKo ? "비트코인, 리플, ...." : "Search coin name or symbol"}
            />
          </div>
          {showDropdown && (
            <div className={s.coin_dropdown}>
              {filtered.map(c => (
                <div key={c.id} className={s.coin_drop_item} onClick={() => selectCoin(c)}>
                  <img src={c.image} width={24} height={24} style={{ borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{c.symbol.toUpperCase()}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: c.price_change_percentage_24h >= 0 ? '#ef4444' : '#3b82f6', fontWeight: 800 }}>
                    {c.price_change_percentage_24h >= 0 ? '+' : ''}{c.price_change_percentage_24h.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Coin Price Banner */}
        {selectedCoin && (
          <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #334155', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={selectedCoin.image} width={40} height={40} style={{ borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800 }}>{selectedCoin.name} {isKo ? '실시간 가격' : 'LIVE PRICE'}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc' }}>
                {fetchingPrice ? <span className="animate-pulse">...</span> : formatMoney(selectedCoin.current_price)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button 
                onClick={() => refreshPrice(selectedCoin, fiatCode)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b5cf6' }}
              >
                <RefreshCcw size={20} className={fetchingPrice ? 'animate-spin' : ''} />
              </button>
              {lastPriceTime && <div style={{ fontSize: '0.6rem', color: '#475569', marginTop: '0.2rem' }}>{lastPriceTime}</div>}
            </div>
          </div>
        )}

        {/* Final Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label className={s.coin_label}>{isKo ? '매수 단가' : 'Buy Price'}</label>
            <input className={s.coin_input} value={buyPrice} onChange={e => setBuyPrice(e.target.value.replace(/[^0-9.]/g, ''))} placeholder={fiat.symbol + ' 0'} />
          </div>
          <div>
            <label className={s.coin_label}>{isKo ? '보유 수량' : 'Quantity'}</label>
            <input className={s.coin_input} value={quantity} onChange={e => setQuantity(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0" />
          </div>
        </div>

        {/* Results */}
        {totalInvested > 0 && (
          <div className="animate-fade-in">
            <div className={s.coin_result_grid}>
              <div className={s.coin_result_item}>
                <div className={s.coin_result_label}>{isKo ? '총 매수 금액' : 'Invested'}</div>
                <div className={s.coin_result_value}>{formatMoney(totalInvested)}</div>
              </div>
              <div className={s.coin_result_item}>
                <div className={s.coin_result_label}>{isKo ? '현재 평가 금액' : 'Current Value'}</div>
                <div className={s.coin_result_value}>{formatMoney(currentValue)}</div>
              </div>
              <div className={s.coin_result_item} style={{ border: isProfit ? '1px solid #ef4444' : '1px solid #3b82f6', background: isProfit ? 'rgba(239, 68, 68, 0.05)' : 'rgba(59, 130, 246, 0.05)' }}>
                <div className={s.coin_result_label} style={{ color: isProfit ? '#ef4444' : '#3b82f6' }}>{isKo ? '평가 손익' : 'Profit / Loss'}</div>
                <div className={s.coin_result_value} style={{ color: isProfit ? '#ef4444' : '#3b82f6' }}>{isProfit ? '+' : ''}{formatMoney(profit)}</div>
              </div>
              <div className={s.coin_result_item} style={{ border: isProfit ? '1px solid #ef4444' : '1px solid #3b82f6', background: isProfit ? 'rgba(239, 68, 68, 0.05)' : 'rgba(59, 130, 246, 0.05)' }}>
                <div className={s.coin_result_label} style={{ color: isProfit ? '#ef4444' : '#3b82f6' }}>{isKo ? '수익률' : 'Return Rate'}</div>
                <div className={s.coin_result_value} style={{ color: isProfit ? '#ef4444' : '#3b82f6' }}>{isProfit ? '+' : ''}{profitRate.toFixed(2)}%</div>
              </div>
            </div>

            <div className={s.coin_summary_bar} style={{ background: isProfit ? '#ef4444' : '#3b82f6' }}>
              {isProfit ? <ArrowUpRight /> : <ArrowDownRight />}
              {isKo ? 
                `현재 ${Math.abs(profitRate).toFixed(2)}% ${isProfit ? '수익 중' : '손실 중'}입니다!` : 
                `In ${isProfit ? 'PROFIT' : 'LOSS'} by ${Math.abs(profitRate).toFixed(2)}%!`
              }
            </div>
          </div>
        )}
      </section>

      {/* Standard Bottom Sections */}
      <div style={{ width: '100%' }}>
        <ShareBar title={isKo ? '코인 수익률 계산기' : 'Crypto Profit Calc'} description={isKo ? '내 코인 수익률을 실시간으로 확인하세요' : 'Live updates for your crypto portfolio'} />
        <RelatedTools toolId="utilities/finance/coin-profit" />
        <div className={s.coin_ad_placeholder}>{isKo ? '광고 영역' : 'Ad Space'}</div>
        <SeoSection
          ko={{
            title: '코인 수익률 계산기란 무엇인가요?',
            description: '코인 수익률 계산기는 비트코인(BTC), 이더리움(ETH), 리플(XRP), 솔라나(SOL) 등 주요 암호화폐의 매수가 대비 현재 수익률과 손익 금액을 실시간으로 계산하는 무료 금융 도구입니다. CoinGecko API를 통해 시가총액 상위 코인의 실시간 시세를 가져오며, 코인 이름이나 심볼로 검색하여 즉시 선택할 수 있습니다. 매수 단가와 보유 수량을 입력하면 총 투자 금액, 현재 평가 금액, 평가 손익(금액 및 %), 수익 또는 손실 여부를 한눈에 확인할 수 있습니다. KRW(원화)와 USD(달러) 두 가지 기준 통화를 지원하며, 국내 거래소와 해외 거래소 이용자 모두 활용할 수 있습니다. 복잡한 스프레드시트 없이 매수가와 수량만 입력하면 되며, 수익 중이면 빨간색, 손실 중이면 파란색으로 직관적으로 표시되어 투자 현황을 빠르게 파악할 수 있습니다.',
            useCases: [
              { icon: '📈', title: '단타 수익률 실시간 확인', desc: '단기 매매 후 현재 보유 코인의 수익률(%)과 실제 수익 금액을 실시간 시세로 즉시 계산하여 매도 타이밍 결정에 활용할 수 있습니다.' },
              { icon: '🏦', title: '장기 투자 손익 평가', desc: '장기 보유 중인 비트코인이나 알트코인의 매수 원가 대비 현재 평가 금액을 계산하여 포트폴리오 전체 수익률을 정기적으로 점검할 수 있습니다.' },
              { icon: '💱', title: 'KRW·USD 기준 동시 비교', desc: '국내 거래소(원화 기준)와 해외 거래소(달러 기준) 중 어느 쪽에서 거래하든 기준 통화를 전환하여 동일한 방식으로 손익을 계산할 수 있습니다.' },
              { icon: '🔔', title: '목표 수익률 도달 여부 확인', desc: '목표 매도가를 매수 단가 자리에 반대로 입력하여 목표 수익률 달성 시 예상 수익 금액을 미리 계산하고 투자 계획을 수립할 수 있습니다.' },
            ],
            steps: [
              { step: '기준 통화 선택', desc: '상단에서 KRW(원화) 또는 USD(달러) 버튼을 클릭하여 계산에 사용할 기준 통화를 선택합니다. 선택한 통화로 코인 목록과 현재가가 모두 표시됩니다.' },
              { step: '코인 검색 및 선택', desc: '검색창에 코인 이름(예: 비트코인) 또는 심볼(예: BTC)을 입력하면 일치하는 코인 목록이 드롭다운으로 표시됩니다. 원하는 코인을 클릭하면 실시간 현재가가 자동으로 가져와집니다.' },
              { step: '매수 단가 및 수량 입력', desc: '내가 실제로 매수했던 단가(1개당 가격)와 현재 보유 중인 수량을 입력합니다. 두 값이 모두 입력되면 총 투자 금액, 현재 평가 금액, 손익이 자동으로 계산됩니다.' },
              { step: '결과 확인 및 새로고침', desc: '수익 중이면 빨간색, 손실 중이면 파란색 배지로 결과가 표시됩니다. 현재가를 최신 상태로 갱신하려면 새로고침 버튼을 누르거나 코인을 다시 선택하세요.' },
            ],
            faqs: [
              { q: '코인 가격은 실시간으로 업데이트되나요?', a: 'CoinGecko API를 통해 실시간 시세를 가져옵니다. 새로고침 버튼을 누르거나 코인을 다시 선택하면 최신 가격으로 업데이트됩니다. API 호출 최소화를 위해 30초 캐시가 적용됩니다.' },
              { q: '어떤 코인을 지원하나요?', a: 'CoinGecko 시가총액 상위 코인 목록을 지원합니다. 비트코인(BTC), 이더리움(ETH), 리플(XRP), 솔라나(SOL), 도지코인(DOGE) 등 수십 종의 주요 암호화폐를 이름 또는 심볼로 검색할 수 있습니다.' },
              { q: 'KRW와 USD 중 어떤 기준으로 계산하나요?', a: '상단 기준 통화 버튼에서 KRW(원화) 또는 USD(달러)를 선택할 수 있습니다. 선택한 통화 기준으로 코인 목록과 현재가가 표시되며, 매수 단가도 동일 통화 기준으로 입력하면 됩니다.' },
              { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
            ],
          }}
          en={{
            title: 'What is a Crypto Profit Calculator?',
            description: 'A crypto profit calculator is a free financial tool that computes your real-time profit or loss on cryptocurrency holdings based on your original buy price and current market value. This calculator fetches live prices via the CoinGecko API for top coins including Bitcoin (BTC), Ethereum (ETH), Ripple (XRP), Solana (SOL), Dogecoin (DOGE), and many more. Simply search for your coin by name or symbol, enter your buy price per coin and the quantity you hold, and instantly see your total invested amount, current portfolio value, profit or loss in absolute terms, and your return rate as a percentage. Green highlights indicate gains while red indicates losses, giving you an at-a-glance view of your position. Both KRW (Korean Won) and USD (US Dollar) base currencies are supported, making this tool equally useful for traders on Korean exchanges and international platforms alike.',
            useCases: [
              { icon: '📈', title: 'Real-Time Trade P&L Check', desc: 'After entering or exiting a short-term trade, calculate your current profit rate and exact profit amount using live prices to decide the best time to sell or hold your position.' },
              { icon: '🏦', title: 'Long-Term Portfolio Review', desc: 'Regularly check the unrealized gain or loss on your long-term Bitcoin or altcoin holdings by comparing your original cost basis against the current market valuation.' },
              { icon: '💱', title: 'KRW & USD Dual Currency', desc: 'Switch between KRW and USD base currencies to evaluate your holdings in your preferred denomination, whether you trade on Korean exchanges or international platforms like Binance.' },
              { icon: '🔔', title: 'Target Price Planning', desc: 'Estimate your potential profit at a target sell price by entering that price as the current price and your actual buy price separately to plan your exit strategy in advance.' },
            ],
            steps: [
              { step: 'Select Base Currency', desc: 'Click KRW or USD at the top to choose your preferred base currency. The coin list and all prices will be displayed in the selected currency throughout the calculator.' },
              { step: 'Search and Select Your Coin', desc: 'Type a coin name (e.g., Bitcoin) or ticker symbol (e.g., BTC) in the search box. A dropdown list of matching coins appears — click your coin to load its live price automatically.' },
              { step: 'Enter Buy Price and Quantity', desc: 'Input the price per coin at which you originally bought (your cost basis) and the number of coins you hold. As soon as both fields are filled, total invested, current value, and P&L calculate instantly.' },
              { step: 'Review Results and Refresh', desc: 'Gains are shown in red and losses in blue for quick visual identification. To update to the latest price, click the refresh icon next to the coin price or reselect the coin from the dropdown.' },
            ],
            faqs: [
              { q: 'Are the coin prices updated in real time?', a: 'Yes. Prices are fetched from the CoinGecko API, which provides real-time market data for thousands of cryptocurrencies. A 30-second local cache is applied to minimize API calls — clicking the refresh button fetches the latest price immediately.' },
              { q: 'Which coins are supported?', a: 'The calculator supports the top coins by market cap from CoinGecko, including Bitcoin (BTC), Ethereum (ETH), Ripple (XRP), Solana (SOL), Dogecoin (DOGE), and dozens more. Search by full name or ticker symbol to find your coin.' },
              { q: 'Should I use KRW or USD mode?', a: 'Use KRW mode if you trade on Korean exchanges like Upbit or Bithumb where prices are quoted in Won. Use USD mode for international exchanges like Binance or Coinbase. Both modes use CoinGecko live data in the respective currency.' },
              { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
            ],
          }}
        />
      </div>
    </div>
  );
}
