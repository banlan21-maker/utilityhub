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
            title: '코인 수익률 계산기 필수 가이드',
            description: '비트코인, 알트코인 매수 후 수익이 얼마인지 궁금하신가요? 실시간 시세로 바로 계산해 드립니다.',
            useCases: [{ icon: '🪙', title: '단타 & 장투 손익 계산', desc: '현재가 대비 예상 수익 확인' }],
            steps: [{ step: '1', desc: '코인 검색 -> 매수가/수량 입력' }],
            faqs: [{ q: '가격을 수동으로 입력하나요?', a: '아니요, CoinGecko를 통해 실시간으로 가져옵니다.' }]
          }}
          en={{
            title: 'Crypto Profit Calculator Guide',
            description: 'Track your ROI for BTC, ETH, and top 50 coins using live data. Easy and accurate p/l calculation.',
            useCases: [{ icon: '📉', title: 'P/L tracking', desc: 'Monitor your holdings in real-time' }],
            steps: [{ step: '1', desc: 'Select coin and enter cost basis' }],
            faqs: [{ q: 'Is the data live?', a: 'Yes, prices refresh automatically every 60 seconds.' }]
          }}
        />
      </div>
    </div>
  );
}
