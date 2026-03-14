'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback, useRef } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';

/* ─── Currency definitions ─── */
interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

const CURRENCIES: Currency[] = [
  { code: 'USD', name: '미국 달러',       symbol: '$',  flag: '🇺🇸' },
  { code: 'KRW', name: '한국 원',         symbol: '₩',  flag: '🇰🇷' },
  { code: 'EUR', name: '유로',            symbol: '€',  flag: '🇪🇺' },
  { code: 'JPY', name: '일본 엔',         symbol: '¥',  flag: '🇯🇵' },
  { code: 'CNY', name: '중국 위안',       symbol: '¥',  flag: '🇨🇳' },
  { code: 'GBP', name: '영국 파운드',     symbol: '£',  flag: '🇬🇧' },
  { code: 'HKD', name: '홍콩 달러',       symbol: 'HK$',flag: '🇭🇰' },
  { code: 'SGD', name: '싱가포르 달러',   symbol: 'S$', flag: '🇸🇬' },
  { code: 'AUD', name: '호주 달러',       symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: '캐나다 달러',     symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: '스위스 프랑',     symbol: 'Fr', flag: '🇨🇭' },
  { code: 'INR', name: '인도 루피',       symbol: '₹',  flag: '🇮🇳' },
  { code: 'MXN', name: '멕시코 페소',     symbol: '$',  flag: '🇲🇽' },
  { code: 'BRL', name: '브라질 헤알',     symbol: 'R$', flag: '🇧🇷' },
  { code: 'THB', name: '태국 바트',       symbol: '฿',  flag: '🇹🇭' },
  { code: 'VND', name: '베트남 동',       symbol: '₫',  flag: '🇻🇳' },
  { code: 'SEK', name: '스웨덴 크로나',   symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: '노르웨이 크로네', symbol: 'kr', flag: '🇳🇴' },
  { code: 'NZD', name: '뉴질랜드 달러',  symbol: 'NZ$',flag: '🇳🇿' },
  { code: 'TRY', name: '터키 리라',       symbol: '₺',  flag: '🇹🇷' },
];

/* ─── Sparkline SVG ─── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const W = 600, H = 120, PAD = 8;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return `${x},${y}`;
  });

  const areaBottom = `${W - PAD},${H - PAD} ${PAD},${H - PAD}`;
  const areaPath = `M ${pts[0]} L ${pts.join(' L ')} L ${areaBottom} Z`;
  const linePath = `M ${pts.join(' L ')}`;

  const lastX = parseFloat(pts[pts.length - 1].split(',')[0]);
  const lastY = parseFloat(pts[pts.length - 1].split(',')[1]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100px', display: 'block' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkGrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="4" fill={color} />
    </svg>
  );
}

/* ─── Main component ─── */
export default function CurrencyPage() {
  const t = useTranslations('Currency');

  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('KRW');
  const [amount, setAmount] = useState('1');
  const [rate, setRate] = useState<number | null>(null);
  const [history, setHistory] = useState<{ date: string; rate: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fromCur = CURRENCIES.find(c => c.code === from)!;
  const toCur = CURRENCIES.find(c => c.code === to)!;

  /* Fetch latest rate */
  const fetchRate = useCallback(async (f: string, t2: string) => {
    if (f === t2) { setRate(1); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${f}&to=${t2}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRate(data.rates[t2]);
      setLastUpdated(new Date().toLocaleTimeString('ko-KR'));
    } catch {
      setError(t('error'));
      setRate(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  /* Fetch 30-day history */
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

  /* On currency change */
  useEffect(() => {
    fetchRate(from, to);
    fetchHistory(from, to);
  }, [from, to, fetchRate, fetchHistory]);

  /* Swap currencies */
  const swap = () => { setFrom(to); setTo(from); };

  const numericAmount = parseFloat(amount) || 0;
  const converted = rate !== null ? numericAmount * rate : null;

  const historyRates = history.map(h => h.rate);
  const minRate = historyRates.length ? Math.min(...historyRates) : null;
  const maxRate = historyRates.length ? Math.max(...historyRates) : null;

  const formatConverted = (v: number) => {
    if (to === 'KRW' || to === 'JPY') return v.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
    return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('description')}</p>
      </header>

      {/* Converter card */}
      <div className="glass-panel" style={{ padding: 'var(--page-padding)', maxWidth: '560px', margin: '0 auto' }}>

        {/* Amount input */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('amount')}
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {fromCur.symbol}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                setAmount(v);
              }}
              style={{
                width: '100%',
                padding: '0.9rem 1rem 0.9rem 2.5rem',
                fontSize: '1.4rem',
                fontWeight: 700,
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* From / Swap / To */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('from')}
            </label>
            <select
              value={from}
              onChange={e => setFrom(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.code} – {c.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={swap}
            title={t('swap')}
            style={{ marginTop: '1.4rem', width: '40px', height: '40px', borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--surface-hover)', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'inherit'; }}
          >
            ⇄
          </button>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('to')}
            </label>
            <select
              value={to}
              onChange={e => setTo(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.code} – {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="animate-fade-in" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.875rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Result */}
        {!error && (
          <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(16,185,129,0.08))', border: '1px solid var(--border)', marginBottom: '1.5rem', textAlign: 'center' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                <div style={{ width: '18px', height: '18px', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                {t('loading')}
              </div>
            ) : converted !== null ? (
              <>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  {fromCur.flag} {numericAmount.toLocaleString()} {from} =
                </div>
                <div style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1, letterSpacing: '-1px' }}>
                  {toCur.symbol} {formatConverted(converted)}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {toCur.flag} {to}
                </div>
                {rate !== null && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <span>1 {from} = {rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {to}</span>
                    {lastUpdated && <span>🕐 {lastUpdated} 기준</span>}
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* 30-day chart */}
        {historyRates.length > 1 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                📈 {t('chart_title')}
              </span>
              {minRate !== null && maxRate !== null && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  최저 {minRate.toFixed(2)} · 최고 {maxRate.toFixed(2)}
                </span>
              )}
            </div>
            <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.25rem 0.25rem', overflow: 'hidden' }}>
              {chartLoading ? (
                <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  차트 로딩 중...
                </div>
              ) : (
                <Sparkline data={historyRates} color="var(--primary)" />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
              {history.length > 0 && (
                <>
                  <span>{history[0].date}</span>
                  <span>{history[Math.floor(history.length / 2)]?.date}</span>
                  <span>{history[history.length - 1].date}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Rate reference table */}
        {rate !== null && !loading && (
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('quick_ref')}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
              {[1, 10, 100, 500, 1000, 10000].map(v => (
                <div key={v} style={{ padding: '0.5rem 0.6rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{v.toLocaleString()} {from}</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '1px' }}>
                    {toCur.symbol} {formatConverted(v * rate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ad placeholder */}
      <div style={{ maxWidth: '560px', margin: '1.5rem auto 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '300px', height: '250px',
          background: '#f1f5f9',
          border: '1px dashed #cbd5e1',
          borderRadius: 'var(--radius-md)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '0.4rem',
        }}>
          <span style={{ fontSize: '1.5rem' }}>📢</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>광고 영역</span>
          <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>300 × 250</span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <SeoSection
        title="실시간 환율 계산기란 무엇인가요?"
        description="실시간 환율 계산기는 Frankfurter API를 통해 최신 환율 데이터를 불러와 원화(KRW), 달러(USD), 유로(EUR), 엔화(JPY) 등 20개 이상의 통화 간 환율을 즉시 계산해주는 온라인 도구입니다. 단순 환산뿐만 아니라 최근 30일 환율 추이 차트를 제공해 환율 흐름을 파악하는 데도 유용합니다. 해외여행 전 예산 계산, 해외 직구 가격 비교, 해외 송금 금액 산정, 외화 예금 수익 계산 등 다양한 상황에서 활용할 수 있습니다."
        useCases={[
          { icon: '✈️', title: '해외여행 예산 계산', desc: '여행지 통화 기준으로 숙박비, 식비, 쇼핑 예산을 원화로 환산해 여행 예산을 정확하게 계획합니다.' },
          { icon: '🛒', title: '해외 직구 가격 비교', desc: '아마존, 이베이 등 해외 쇼핑몰 가격을 원화로 즉시 환산해 국내 가격과 비교하고 실제 절감액을 파악합니다.' },
          { icon: '💸', title: '해외 송금 금액 산정', desc: '송금 전 현재 환율로 수령액을 미리 계산하고, 환율 차트로 유리한 송금 타이밍을 파악합니다.' },
          { icon: '📈', title: '환율 트렌드 분석', desc: '30일 환율 차트를 통해 원달러 환율, 원유로 환율 등의 최근 흐름을 확인하고 환전 시점을 결정합니다.' },
        ]}
        steps={[
          { step: '금액 및 기준 통화 입력', desc: '환산할 금액을 입력하고 변환할 기준 통화(예: KRW)를 선택합니다.' },
          { step: '대상 통화 선택', desc: '환산 결과를 보고 싶은 목표 통화(예: USD)를 선택합니다. ↔ 버튼으로 두 통화를 즉시 스왑할 수 있습니다.' },
          { step: '결과 및 차트 확인', desc: '현재 환율 기준 환산 금액이 표시되며, 하단 30일 차트로 최근 환율 변화 추이도 확인합니다.' },
        ]}
        faqs={[
          { q: '환율 데이터는 얼마나 최신인가요?', a: 'Frankfurter API는 유럽중앙은행(ECB) 공시 환율을 기반으로 매 영업일 업데이트됩니다. 실시간 은행 고시 환율과는 소폭 차이가 있을 수 있으므로, 실제 환전 시에는 은행 또는 환전 앱의 최종 환율을 확인하세요.' },
          { q: '원화(KRW) 환율이 부정확하게 보입니다', a: 'Frankfurter API는 EUR 기반 교차 환율을 사용하므로 일부 통화 쌍은 간접 환율로 계산됩니다. 참고용으로만 사용하시고, 정확한 환율은 각 은행의 고시 환율을 기준으로 삼으세요.' },
          { q: '원하는 통화가 목록에 없습니다', a: '현재 20개 이상의 주요 통화를 지원합니다. 필요한 통화가 없다면 피드백 게시판에 남겨주시면 추가를 검토하겠습니다.' },
        ]}
      />
    </div>
  );
}
