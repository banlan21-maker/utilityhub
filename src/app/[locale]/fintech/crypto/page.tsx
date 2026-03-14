'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef, useCallback } from 'react';
import NavigationActions from '@/app/components/NavigationActions';

/* ─── Supported fiat currencies ─── */
interface FiatCurrency {
  code: string;     // CoinGecko vs_currency param
  symbol: string;
  label: string;
  flag: string;
  locale: string;   // for Intl.NumberFormat
  decimals: number; // 0 for KRW/JPY, 2 for others
}

const FIAT_CURRENCIES: FiatCurrency[] = [
  { code: 'krw', symbol: '₩', label: '한국 원 (KRW)', flag: '🇰🇷', locale: 'ko-KR', decimals: 0 },
  { code: 'usd', symbol: '$', label: 'US Dollar (USD)', flag: '🇺🇸', locale: 'en-US', decimals: 2 },
];

/* ─── Coin types ─── */
interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

/* ─── Module-level cache keyed by "coinId:currency" ─── */
const priceCache = new Map<string, { price: number; ts: number }>();
const CACHE_TTL = 60_000;

/* ─── Number counter animation hook ─── */
function useCountUp(target: number, duration = 700) {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);
  const raf = useRef<number>(0);

  useEffect(() => {
    const from = prev.current;
    const start = performance.now();
    cancelAnimationFrame(raf.current);
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (target - from) * ease);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else prev.current = target;
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return display;
}

/* ─── Toast ─── */
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#f8fafc', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 500, boxShadow: '0 8px 30px rgba(0,0,0,0.3)', zIndex: 9999, animation: 'toastIn 0.3s ease', whiteSpace: 'nowrap' }}>
      {msg}
    </div>
  );
}

/* ─── Result card ─── */
function ResultCard({ label, value, isProfit, sub }: { label: string; value: string; isProfit?: boolean; sub?: string }) {
  const color = isProfit === undefined ? 'var(--text-primary)' : isProfit ? '#ef4444' : '#3b82f6';
  const bg    = isProfit === undefined ? 'rgba(255,255,255,0.04)' : isProfit ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.08)';
  const border = isProfit === undefined ? 'rgba(255,255,255,0.07)' : isProfit ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)';
  return (
    <div style={{ padding: '1.1rem 1.25rem', borderRadius: 'var(--radius-md)', background: bg, border: `1px solid ${border}` }}>
      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{label}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 800, color, lineHeight: 1, wordBreak: 'break-all' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>{sub}</div>}
    </div>
  );
}

/* ─── Main component ─── */
export default function CryptoPage() {
  const t = useTranslations('Crypto');

  const [fiatCode, setFiatCode] = useState('krw');
  const [coins, setCoins] = useState<Coin[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [buyPrice, setBuyPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [fetchingCoins, setFetchingCoins] = useState(true);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lastPriceTime, setLastPriceTime] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  const fiat = FIAT_CURRENCIES.find(f => f.code === fiatCode)!;

  /* Format value in selected fiat */
  const formatMoney = useCallback((v: number) => {
    const abs = Math.abs(v);
    const formatted = abs.toLocaleString(fiat.locale, {
      minimumFractionDigits: fiat.decimals,
      maximumFractionDigits: fiat.decimals,
    });
    return (v < 0 ? '-' : '') + fiat.symbol + formatted;
  }, [fiat]);

  /* Fetch top 50 coins list for selected fiat */
  const fetchCoinList = useCallback(async (currency: string) => {
    setFetchingCoins(true);
    setSelectedCoin(null);
    setQuery('');
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=50&page=1`
      );
      if (!res.ok) throw new Error();
      setCoins(await res.json());
    } catch {
      setCoins(FALLBACK_COINS);
    } finally {
      setFetchingCoins(false);
    }
  }, []);

  useEffect(() => { fetchCoinList(fiatCode); }, [fiatCode, fetchCoinList]);

  /* Outside click closes dropdown */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* Refresh current price */
  const refreshPrice = useCallback(async (coin: Coin, currency: string) => {
    const key = `${coin.id}:${currency}`;
    const cached = priceCache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setSelectedCoin(prev => prev ? { ...prev, current_price: cached!.price } : prev);
      return;
    }
    setFetchingPrice(true);
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=${currency}`);
      if (res.status === 429) {
        setToast(t('rate_limit'));
        if (cached) setSelectedCoin(prev => prev ? { ...prev, current_price: cached!.price } : prev);
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      const price = data[coin.id]?.[currency] ?? coin.current_price;
      priceCache.set(key, { price, ts: Date.now() });
      setSelectedCoin(prev => prev ? { ...prev, current_price: price } : prev);
      setLastPriceTime(new Date().toLocaleTimeString());
    } catch {
      setToast(t('fetch_error'));
    } finally {
      setFetchingPrice(false);
    }
  }, [t]);

  const selectCoin = (coin: Coin) => {
    setSelectedCoin(coin);
    setQuery(coin.name);
    setShowDropdown(false);
    refreshPrice(coin, fiatCode);
  };

  /* Auto-refresh every 60s */
  useEffect(() => {
    if (!selectedCoin) return;
    const timer = setInterval(() => refreshPrice(selectedCoin, fiatCode), 60_000);
    return () => clearInterval(timer);
  }, [selectedCoin, fiatCode, refreshPrice]);

  /* Filtered coin list */
  const filtered = query.trim()
    ? coins.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.symbol.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : coins.slice(0, 8);

  /* Calculations */
  const numBuy = parseFloat(buyPrice) || 0;
  const numQty = parseFloat(quantity) || 0;
  const curPrice = selectedCoin?.current_price ?? 0;
  const totalInvested = numBuy * numQty;
  const currentValue = curPrice * numQty;
  const profit = currentValue - totalInvested;
  const profitRate = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
  const isProfit = profit >= 0;

  const animProfit = useCountUp(profit);
  const animValue  = useCountUp(currentValue);
  const animRate   = useCountUp(profitRate);
  const hasResult  = totalInvested > 0 && curPrice > 0;

  /* Share */
  const shareText = selectedCoin && hasResult
    ? `🪙 ${selectedCoin.name} (${selectedCoin.symbol.toUpperCase()}) Profit Calculator\n\n💰 Avg Buy: ${fiat.symbol}${numBuy.toLocaleString()}\n📦 Qty: ${numQty}\n📊 Current: ${fiat.symbol}${curPrice.toLocaleString()}\n\nInvested: ${formatMoney(totalInvested)}\nValue: ${formatMoney(currentValue)}\nProfit: ${profit >= 0 ? '+' : ''}${formatMoney(profit)}\nReturn: ${profitRate >= 0 ? '+' : ''}${profitRate.toFixed(2)}%`
    : '';

  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener');
  const shareKakao = async () => {
    if (navigator.share) { try { await navigator.share({ text: shareText }); return; } catch { /* cancelled */ } }
    await navigator.clipboard.writeText(shareText);
    setToast(t('copied'));
  };

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('description')}</p>
      </header>

      {/* Dark crypto card */}
      <div style={{ background: '#0f172a', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', marginBottom: '1.5rem' }}>

        {/* ── Currency selector ── */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {t('fiat_label')}
          </label>
          <select
            value={fiatCode}
            onChange={e => setFiatCode(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', background: '#1e293b', border: '1.5px solid #334155', borderRadius: 'var(--radius-md)', color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
          >
            {FIAT_CURRENCIES.map(f => (
              <option key={f.code} value={f.code}>{f.flag} {f.label}</option>
            ))}
          </select>
        </div>

        {/* ── Coin search ── */}
        <div style={{ marginBottom: '1.25rem' }} ref={searchRef}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {t('coin_label')}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text" value={query}
              placeholder={fetchingCoins ? t('loading_coins') : t('coin_placeholder')}
              disabled={fetchingCoins}
              onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
              style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', background: '#1e293b', border: '1.5px solid #334155', borderRadius: 'var(--radius-md)', color: '#f8fafc', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', opacity: fetchingCoins ? 0.5 : 1 }}
              onFocus={e => { setShowDropdown(true); e.target.style.borderColor = '#818cf8'; }}
              onBlur={e => e.target.style.borderColor = '#334155'}
            />
            <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>🔍</span>

            {showDropdown && !fetchingCoins && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-md)', zIndex: 100, maxHeight: '240px', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                {filtered.length === 0
                  ? <div style={{ padding: '0.9rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>{t('no_results')}</div>
                  : filtered.map(coin => (
                    <div key={coin.id} onClick={() => selectCoin(coin)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseOver={e => (e.currentTarget.style.background = '#334155')}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <img src={coin.image} alt={coin.name} width={24} height={24} style={{ borderRadius: '50%' }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.9rem' }}>{coin.name}</span>
                        <span style={{ color: '#64748b', fontSize: '0.78rem', marginLeft: '0.4rem' }}>{coin.symbol.toUpperCase()}</span>
                      </div>
                      <span style={{ color: coin.price_change_percentage_24h >= 0 ? '#ef4444' : '#3b82f6', fontSize: '0.78rem', fontWeight: 600 }}>
                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                      </span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        {/* ── Current price banner ── */}
        {selectedCoin && (
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: '#1e293b', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid #334155' }}>
            <img src={selectedCoin.image} alt={selectedCoin.name} width={32} height={32} style={{ borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{t('current_price')} ({fiat.code.toUpperCase()})</div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.15rem' }}>
                {fetchingPrice ? '...' : fiat.symbol + selectedCoin.current_price.toLocaleString(fiat.locale, { minimumFractionDigits: fiat.decimals, maximumFractionDigits: fiat.decimals })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: selectedCoin.price_change_percentage_24h >= 0 ? '#ef4444' : '#3b82f6', fontWeight: 700, fontSize: '0.9rem' }}>
                {selectedCoin.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(selectedCoin.price_change_percentage_24h).toFixed(2)}%
              </div>
              {lastPriceTime && <div style={{ color: '#475569', fontSize: '0.7rem' }}>🕐 {lastPriceTime}</div>}
            </div>
          </div>
        )}

        {/* ── Inputs ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: t('buy_price'), val: buyPrice, set: setBuyPrice, placeholder: `${t('buy_price_placeholder')} (${fiat.symbol})`, prefix: fiat.symbol },
            { label: t('quantity'),  val: quantity,  set: setQuantity,  placeholder: t('qty_placeholder'),       prefix: '' },
          ].map(({ label, val, set, placeholder, prefix }) => (
            <div key={label}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
              <div style={{ position: 'relative' }}>
                {prefix && <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>{prefix}</span>}
                <input
                  type="text" inputMode="decimal" value={val} placeholder={placeholder}
                  onChange={e => set(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                  style={{ width: '100%', paddingLeft: prefix ? '1.75rem' : '0.75rem', paddingRight: '0.75rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', background: '#1e293b', border: '1.5px solid #334155', borderRadius: 'var(--radius-md)', color: '#f8fafc', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#818cf8'}
                  onBlur={e => e.target.style.borderColor = '#334155'}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Results ── */}
        {hasResult && (
          <div className="animate-fade-in">
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #334155, transparent)', marginBottom: '1.25rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
              <ResultCard label={t('total_invested')} value={formatMoney(totalInvested)} />
              <ResultCard label={t('current_value')}  value={formatMoney(animValue)} />
              <ResultCard
                label={t('profit_amount')}
                value={(animProfit >= 0 ? '+' : '') + formatMoney(animProfit)}
                isProfit={isProfit}
              />
              <ResultCard
                label={t('profit_rate')}
                value={`${animRate >= 0 ? '+' : ''}${animRate.toFixed(2)}%`}
                isProfit={isProfit}
                sub={isProfit ? '📈 ' + t('in_profit') : '📉 ' + t('in_loss')}
              />
            </div>
            <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', background: isProfit ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)', border: `1px solid ${isProfit ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}`, textAlign: 'center', fontSize: '1rem', fontWeight: 700, color: isProfit ? '#ef4444' : '#3b82f6' }}>
              {isProfit ? '🔺' : '🔻'} {t('result_summary', { rate: Math.abs(profitRate).toFixed(2), direction: isProfit ? t('profit') : t('loss') })}
            </div>
          </div>
        )}
      </div>

      {/* Share */}
      {hasResult && (
        <div className="animate-fade-in glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>{t('share_title')}</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button onClick={shareTwitter}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: '#000', color: 'white', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              𝕏 {t('share_twitter')}
            </button>
            <button onClick={shareKakao}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: '#FEE500', color: '#3C1E1E', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
              💬 {t('share_kakao')}
            </button>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translate(-50%,12px); } to { opacity:1; transform:translate(-50%,0); } }`}</style>
    </div>
  );
}

/* ─── Fallback coins ─── */
const FALLBACK_COINS: Coin[] = [
  { id: 'bitcoin',     symbol: 'btc',  name: 'Bitcoin',   image: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',         current_price: 0, price_change_percentage_24h: 0 },
  { id: 'ethereum',    symbol: 'eth',  name: 'Ethereum',  image: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',       current_price: 0, price_change_percentage_24h: 0 },
  { id: 'ripple',      symbol: 'xrp',  name: 'XRP',       image: 'https://assets.coingecko.com/coins/images/44/thumb/xrp-symbol-white.png',current_price: 0, price_change_percentage_24h: 0 },
  { id: 'solana',      symbol: 'sol',  name: 'Solana',    image: 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png',        current_price: 0, price_change_percentage_24h: 0 },
  { id: 'dogecoin',    symbol: 'doge', name: 'Dogecoin',  image: 'https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png',         current_price: 0, price_change_percentage_24h: 0 },
  { id: 'cardano',     symbol: 'ada',  name: 'Cardano',   image: 'https://assets.coingecko.com/coins/images/975/thumb/cardano.png',        current_price: 0, price_change_percentage_24h: 0 },
  { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', image: 'https://assets.coingecko.com/coins/images/12559/thumb/Avalanche_Circle_RedWhite_Trans.png', current_price: 0, price_change_percentage_24h: 0 },
];
