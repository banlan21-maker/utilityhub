'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { RefreshCcw, ArrowUpRight, ArrowDownRight, Search, Bitcoin, AlertCircle } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './coin.module.css';

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

export default function CoinProfitClient() {
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
  const [coinError, setCoinError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsClient(true); }, []);

  const fiat = FIAT.find(f => f.code === fiatCode)!;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatMoney = useCallback((v: number) => {
    return (v < 0 ? '-' : '') + fiat.symbol + Math.abs(v).toLocaleString(fiat.locale, {
      minimumFractionDigits: fiat.decimals,
      maximumFractionDigits: fiat.decimals,
    });
  }, [fiat]);

  const fetchCoinList = useCallback(async (curr: string) => {
    setFetchingCoins(true);
    setCoinError(null);
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${curr}&order=market_cap_desc&per_page=50&page=1`
      );
      if (res.status === 429) {
        setCoinError(t('rate_limit'));
        return;
      }
      if (!res.ok) throw new Error();
      setCoins(await res.json());
    } catch {
      setCoinError(t('fetch_error'));
    } finally {
      setFetchingCoins(false);
    }
  }, [t]);

  useEffect(() => {
    if (isClient) fetchCoinList(fiatCode);
  }, [fiatCode, fetchCoinList, isClient]);

  const refreshPrice = useCallback(async (coin: Coin, curr: string) => {
    const key = `${coin.id}:${curr}`;
    const cached = priceCache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setSelectedCoin(prev => prev ? { ...prev, current_price: cached.price } : prev);
      return;
    }
    setFetchingPrice(true);
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=${curr}`);
      if (res.status === 429) { setCoinError(t('rate_limit')); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      const p = data[coin.id]?.[curr] ?? coin.current_price;
      priceCache.set(key, { price: p, ts: Date.now() });
      setSelectedCoin(prev => prev ? { ...prev, current_price: p } : prev);
      setLastPriceTime(new Date().toLocaleTimeString(isKo ? 'ko-KR' : 'en-US'));
    } catch {
      setCoinError(t('fetch_error'));
    } finally {
      setFetchingPrice(false);
    }
  }, [isKo, t]);

  const handleFiatChange = (code: string) => {
    setFiatCode(code);
    // Refresh selected coin price in new currency immediately
    if (selectedCoin) {
      refreshPrice(selectedCoin, code);
    }
  };

  const selectCoin = (coin: Coin) => {
    setSelectedCoin(coin);
    setQuery(coin.name);
    setShowDropdown(false);
    setCoinError(null);
    refreshPrice(coin, fiatCode);
  };

  const filtered = query.trim()
    ? coins.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.symbol.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    : coins.slice(0, 5);

  const numBuy    = parseFloat(buyPrice) || 0;
  const numQty    = parseFloat(quantity) || 0;
  const curPrice  = selectedCoin?.current_price ?? 0;
  const totalInvested  = numBuy * numQty;
  const currentValue   = curPrice * numQty;
  const profit         = currentValue - totalInvested;
  const profitRate     = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
  const isProfit       = profit >= 0;


  return (
    <div className={s.coin_container}>
      <NavigationActions />
      <header className={s.coin_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Bitcoin size={40} color="#f7931a" />
        </div>
        <h1 className={s.coin_title}>{t('title')}</h1>
        <p className={s.coin_subtitle}>{t('description')}</p>
      </header>

      <section className={s.coin_card}>
        {/* Fiat Selector */}
        <div className={s.coin_selector_group}>
          <label className={s.coin_label}>{t('fiat_label')}</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {FIAT.map(f => (
              <button
                key={f.code}
                onClick={() => handleFiatChange(f.code)}
                aria-pressed={fiatCode === f.code}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                  border: '1px solid #334155',
                  background: fiatCode === f.code ? '#8b5cf6' : '#1e293b',
                  color: '#fff', fontSize: '0.9rem', fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {f.flag} {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* API error */}
        {coinError && (
          <div className={s.coin_error}>
            <AlertCircle size={16} />
            {coinError}
          </div>
        )}

        {/* Coin Search */}
        <div className={s.coin_selector_group} ref={searchRef} style={{ position: 'relative' }}>
          <label className={s.coin_label}>{t('coin_label')}</label>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              className={s.coin_input}
              style={{ paddingLeft: '2.75rem' }}
              value={query}
              onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder={t('coin_placeholder')}
              aria-label={isKo ? '코인 검색' : 'Search coin'}
            />
          </div>
          {showDropdown && (
            <div className={s.coin_dropdown}>
              {fetchingCoins ? (
                <div style={{ padding: '1rem', color: '#64748b', textAlign: 'center', fontSize: '0.85rem' }}>
                  {t('loading_coins')}
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '1rem', color: '#64748b', textAlign: 'center', fontSize: '0.85rem' }}>
                  {t('no_results')}
                </div>
              ) : filtered.map(c => (
                <div key={c.id} className={s.coin_drop_item} onClick={() => selectCoin(c)}>
                  <img src={c.image} width={24} height={24} alt={c.name} style={{ borderRadius: '50%' }} />
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

        {/* Selected Coin Banner */}
        {selectedCoin && (
          <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #334155', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={selectedCoin.image} width={40} height={40} alt={selectedCoin.name} style={{ borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800 }}>
                {selectedCoin.name} {t('current_price')}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc' }}>
                {fetchingPrice
                  ? <span className={s.coin_pulse}>···</span>
                  : formatMoney(selectedCoin.current_price)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => refreshPrice(selectedCoin, fiatCode)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b5cf6' }}
                aria-label={isKo ? '가격 새로고침' : 'Refresh price'}
              >
                <RefreshCcw size={20} className={fetchingPrice ? s.coin_spin : ''} />
              </button>
              {lastPriceTime && <div style={{ fontSize: '0.6rem', color: '#475569', marginTop: '0.2rem' }}>{lastPriceTime}</div>}
            </div>
          </div>
        )}

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label className={s.coin_label}>{t('buy_price')}</label>
            <input
              className={s.coin_input}
              value={buyPrice}
              onChange={e => setBuyPrice(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
              placeholder={t('buy_price_placeholder')}
              aria-label={isKo ? '매수 단가' : 'Buy price'}
            />
          </div>
          <div>
            <label className={s.coin_label}>{t('quantity')}</label>
            <input
              className={s.coin_input}
              value={quantity}
              onChange={e => setQuantity(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
              placeholder={t('qty_placeholder')}
              aria-label={isKo ? '보유 수량' : 'Quantity'}
            />
          </div>
        </div>

        {/* Results */}
        {totalInvested > 0 && (
          <div className={s.coin_result_reveal}>
            <div className={s.coin_result_grid}>
              <div className={s.coin_result_item}>
                <div className={s.coin_result_label}>{t('total_invested')}</div>
                <div className={s.coin_result_value}>{formatMoney(totalInvested)}</div>
              </div>
              <div className={s.coin_result_item}>
                <div className={s.coin_result_label}>{t('current_value')}</div>
                <div className={s.coin_result_value}>{formatMoney(currentValue)}</div>
              </div>
              <div
                className={s.coin_result_item}
                style={{
                  border: `1px solid ${isProfit ? '#ef4444' : '#3b82f6'}`,
                  background: isProfit ? 'rgba(239,68,68,0.05)' : 'rgba(59,130,246,0.05)',
                }}
              >
                <div className={s.coin_result_label} style={{ color: isProfit ? '#ef4444' : '#3b82f6' }}>
                  {t('profit_amount')}
                </div>
                <div className={s.coin_result_value} style={{ color: isProfit ? '#ef4444' : '#3b82f6' }}>
                  {isProfit ? '+' : ''}{formatMoney(profit)}
                </div>
              </div>
              <div
                className={s.coin_result_item}
                style={{
                  border: `1px solid ${isProfit ? '#ef4444' : '#3b82f6'}`,
                  background: isProfit ? 'rgba(239,68,68,0.05)' : 'rgba(59,130,246,0.05)',
                }}
              >
                <div className={s.coin_result_label} style={{ color: isProfit ? '#ef4444' : '#3b82f6' }}>
                  {t('profit_rate')}
                </div>
                <div className={s.coin_result_value} style={{ color: isProfit ? '#ef4444' : '#3b82f6' }}>
                  {isProfit ? '+' : ''}{profitRate.toFixed(2)}%
                </div>
              </div>
            </div>
            <div className={s.coin_summary_bar} style={{ background: isProfit ? '#ef4444' : '#3b82f6' }}>
              {isProfit ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
              {isKo
                ? `현재 ${Math.abs(profitRate).toFixed(2)}% ${isProfit ? t('profit') : t('loss')}입니다!`
                : `In ${isProfit ? t('profit') : t('loss')} by ${Math.abs(profitRate).toFixed(2)}%!`}
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
