'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { 
  DollarSign, 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  RefreshCcw,
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './exchange.module.css';

/* ─── Currency definitions ─── */
interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'USA Dollar',      symbol: '$',  flag: '🇺🇸' },
  { code: 'KRW', name: 'Korea Won',        symbol: '₩',  flag: '🇰🇷' },
  { code: 'EUR', name: 'Euro',           symbol: '€',  flag: '🇪🇺' },
  { code: 'JPY', name: 'Japan Yen',        symbol: '¥',  flag: '🇯🇵' },
  { code: 'CNY', name: 'China Yuan',       symbol: '¥',  flag: '🇨🇳' },
  { code: 'GBP', name: 'UK Pound',    symbol: '£',  flag: '🇬🇧' },
  { code: 'HKD', name: 'HK Dollar',      symbol: '$',  flag: '🇭🇰' },
  { code: 'SGD', name: 'SG Dollar',  symbol: '$',  flag: '🇸🇬' },
  { code: 'AUD', name: 'AU Dollar',      symbol: '$',  flag: '🇦🇺' },
  { code: 'CAD', name: 'CA Dollar',    symbol: '$',  flag: '🇨🇦' },
  { code: 'THB', name: 'Thai Baht',      symbol: '฿',  flag: '🇹🇭' },
  { code: 'VND', name: 'Vietnam Dong',      symbol: '₫',  flag: '🇻🇳' },
];

/* ─── Sparkline SVG ─── */
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

  const areaBottom = `${W - PAD},${H - PAD} ${PAD},${H - PAD}`;
  const areaPath = `M ${pts[0]} L ${pts.join(' L ')} L ${areaBottom} Z`;
  const linePath = `M ${pts.join(' L ')}`;

  const lastX = parseFloat(pts[pts.length - 1].split(',')[0]);
  const lastY = parseFloat(pts[pts.length - 1].split(',')[1]);

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
      <circle cx={lastX} cy={lastY} r="6" fill={color} stroke="white" strokeWidth="2" shadow="0 2px 4px rgba(0,0,0,0.2)" />
    </svg>
  );
}

/* ─── Main component ─── */

export default function CurrencyPage() {
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
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const fromCur = CURRENCIES.find(c => c.code === from)!;
  const toCur = CURRENCIES.find(c => c.code === to)!;

  const fetchRate = useCallback(async (f: string, t2: string) => {
    if (f === t2) { setRate(1); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${f}&to=${t2}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRate(data.rates[t2]);
      setLastUpdated(new Date().toLocaleTimeString(isKo ? 'ko-KR' : 'en-US'));
    } catch {
      setError(isKo ? '환율 정보를 불러오는 데 실패했습니다.' : 'Failed to fetch rate.');
      setRate(null);
    } finally {
      setLoading(false);
    }
  }, [isKo]);

  const fetchHistory = useCallback(async (f: string, t2: string) => {
    if (f === t2) { setHistory([]); return; }
    setChartLoading(true);
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      const fmt = (d: Date) => d.toISOString().split('T')[0];
      const res = await fetch(`https://api.frankfurter.app/${fmt(start)}..${fmt(end)}?from=${f}&to=${t2}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const entries = Object.entries(data.rates as Record<string, Record<string, number>>)
        .map(([date, rates]) => ({ date, rate: rates[t2] }))
        .sort((a, b) => a.date.localeCompare(b.date));
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
    if (to === 'KRW' || to === 'JPY') return v.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
    return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  if (!isClient) return null;

  return (
    <div className={s.ex_container}>
      <NavigationActions />
      <header className={s.ex_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <RefreshCcw size={40} color="#8b5cf6" className={loading ? 'animate-spin' : ''} />
        </div>
        <h1 className={s.ex_title}>{isKo ? '실시간 환율 계산기' : 'Global Exchange Calculator'}</h1>
        <p className={s.ex_subtitle}>{isKo ? '세계를 넘나드는 가장 정확한 실시간 환율 정보' : 'The most accurate real-time currency conversion tool.'}</p>
      </header>

      <section className={s.ex_panel}>
        {/* Amount Input */}
        <div className={s.ex_input_group}>
          <label className={s.ex_label}>{isKo ? '변환할 금액' : 'Amount to Convert'}</label>
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
            />
          </div>
        </div>

        {/* Currency Selectors */}
        <div className={s.ex_selector_row}>
          <div>
            <label className={s.ex_label}>{isKo ? '보낼 때' : 'From'}</label>
            <select value={from} onChange={e => setFrom(e.target.value)} className={s.ex_select}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
          </div>
          <button onClick={swap} className={s.ex_swap_btn} title={isKo ? '스왑' : 'Swap'}>
            <ArrowLeftRight size={24} />
          </button>
          <div>
            <label className={s.ex_label}>{isKo ? '받을 때' : 'To'}</label>
            <select value={to} onChange={e => setTo(e.target.value)} className={s.ex_select}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
          </div>
        </div>

        {/* Result Area */}
        <div className={s.ex_result_display}>
          {loading ? (
            <div style={{ color: '#94a3b8', fontSize: '1.25rem', fontWeight: 700 }}>{isKo ? '데이터 요청 중...' : 'Updating...'}</div>
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
                <span>1 {from} = {rate?.toFixed(4)} {to}</span>
                <span><Clock size={12} style={{ display: 'inline', marginRight: '3px' }} /> {lastUpdated}</span>
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
                {isKo ? '최근 30일 환율 변동' : '30-Day Rate Trend'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                {isKo ? '30일 최저' : 'Min'} {Math.min(...historyRates).toFixed(2)} · {isKo ? '최고' : 'Max'} {Math.max(...historyRates).toFixed(2)}
              </div>
            </div>
            {chartLoading ? (
              <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0' }}>Loading...</div>
            ) : (
              <Sparkline data={historyRates} color="#8b5cf6" />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              <span>{history[0].date}</span>
              <span>{history[history.length-1].date}</span>
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

      {/* Standard Bottom Sections */}
      <div style={{ width: '100%' }}>
        <ShareBar title={isKo ? '실시간 환율 계산기' : 'Exchange Calculator'} description={isKo ? '정확한 실시간 데이터와 30일 환율 차트' : 'Live rates and 30-day historical chart'} />
        <RelatedTools toolId="fintech/exchange" />
        <div className={s.ex_ad_placeholder}>{isKo ? '광고 영역' : 'Ad Space'}</div>
        <SeoSection
          ko={{
            title: '실시간 환율 계산기 필수 가이드',
            description: '전 세계 20개 이상의 통화를 실시간으로 환산하세요. 여행, 직구, 송금 전 환율 차트 확인은 필수입니다.',
            useCases: [{ icon: '✈️', title: '해외여행', desc: '현지 물가 원화로 환산하기' }],
            steps: [{ step: '1', desc: '통화 선택 후 금액 입력' }],
            faqs: [{ q: '데이터 출처가 어디인가요?', a: '유럽중앙은행(ECB) 공시 환율 기반 Frankfurter API를 사용합니다.' }]
          }}
          en={{
            title: 'Ultimate Currency Exchange Guide',
            description: 'Convert 20+ global currencies in real-time. Check 30-day trends before you travel or shop.',
            useCases: [{ icon: '🛒', title: 'Global Shopping', desc: 'Convert foreign prices to your currency' }],
            steps: [{ step: '1', desc: 'Select currencies and enter amount' }],
            faqs: [{ q: 'Is the data live?', a: 'Updates every business day based on ECB official rates.' }]
          }}
        />
      </div>
    </div>
  );
}
