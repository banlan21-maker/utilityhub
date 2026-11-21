'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Copy, Check, Trash2, Clock } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './smart-percent.module.css';
import { ui } from '@/app/components/ui';

/* ── Types ── */
type Tab = 'basic' | 'change' | 'discount' | 'margin';

interface HistoryItem {
  id: string;
  expr: string;
  result: string;
}

interface CalcResult {
  main: string;
  secondary?: string;
  barPct: number;
  barColor?: 'red' | 'blue';
  isUp?: boolean;
  isDown?: boolean;
  expr: string;
}

/* ── Constants ── */
const HISTORY_KEY = 'sp-calc-history';
const MAX_HISTORY = 5;

const TABS: { id: Tab; ko: string; en: string }[] = [
  { id: 'basic',    ko: '기본 계산',  en: 'Basic' },
  { id: 'change',   ko: '증감률',    en: 'Change %' },
  { id: 'discount', ko: '할인율',    en: 'Discount' },
  { id: 'margin',   ko: '마진율',    en: 'Margin' },
];

/* ── Helpers ── */
function fmt(n: number): string {
  if (!isFinite(n)) return '';
  return n.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
}

function parseRaw(s: string): number {
  return parseFloat(s.replace(/,/g, ''));
}

function toFmtString(raw: string): string {
  const clean = raw.replace(/,/g, '');
  if (clean === '' || clean === '.') return clean;
  const dotIdx = clean.indexOf('.');
  if (dotIdx === -1) {
    const n = parseInt(clean, 10);
    return isNaN(n) ? '' : n.toLocaleString('ko-KR');
  }
  const intPart = parseInt(clean.slice(0, dotIdx), 10);
  const decPart = clean.slice(dotIdx + 1);
  return (isNaN(intPart) ? '0' : intPart.toLocaleString('ko-KR')) + '.' + decPart;
}

/* ── Main Component ── */
export default function SmartPercentClient({ seo }: { seo?: React.ReactNode }) {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [tab, setTab] = useState<Tab>('basic');
  const [aRaw, setARaw] = useState('');
  const [bRaw, setBRaw] = useState('');
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  /* Load history */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const persistHistory = useCallback((items: HistoryItem[]) => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, []);

  const addHistory = useCallback((item: HistoryItem) => {
    setHistory(prev => {
      const deduped = prev.filter(h => h.id !== item.id);
      const next = [item, ...deduped].slice(0, MAX_HISTORY);
      persistHistory(next);
      return next;
    });
  }, [persistHistory]);

  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
  };

  /* Parse inputs */
  const a = parseRaw(aRaw);
  const b = parseRaw(bRaw);
  const hasA = aRaw !== '' && !isNaN(a);
  const hasB = bRaw !== '' && !isNaN(b);

  /* Compute */
  const compute = (): CalcResult | null => {
    if (!hasA || !hasB) return null;

    if (tab === 'basic') {
      const result = a * b / 100;
      return {
        main: fmt(result),
        barPct: Math.min(Math.max(b, 0), 100),
        expr: `${fmt(a)}의 ${fmt(b)}% = ${fmt(result)}`,
      };
    }

    if (tab === 'change') {
      if (a === 0) return null;
      const pct = (b - a) / a * 100;
      const isUp = pct >= 0;
      return {
        main: `${pct >= 0 ? '+' : ''}${fmt(pct)}%`,
        secondary: isKo
          ? (isUp ? `▲ ${fmt(b - a)} 증가` : `▼ ${fmt(a - b)} 감소`)
          : (isUp ? `▲ ${fmt(b - a)} increase` : `▼ ${fmt(a - b)} decrease`),
        isUp,
        isDown: !isUp,
        barPct: Math.min(Math.abs(pct) / 2, 100),
        barColor: isUp ? 'red' : 'blue',
        expr: `${fmt(a)} → ${fmt(b)} (${pct >= 0 ? '+' : ''}${fmt(pct)}%)`,
      };
    }

    if (tab === 'discount') {
      if (b < 0 || b > 100) return null;
      const saved = a * b / 100;
      const final = a - saved;
      return {
        main: `${fmt(final)}${isKo ? '원' : ''}`,
        secondary: isKo ? `절약한 금액: ${fmt(saved)}원` : `You save: ${fmt(saved)}`,
        barPct: Math.min(Math.max(b, 0), 100),
        expr: isKo
          ? `${fmt(a)}원 ${fmt(b)}% 할인 → ${fmt(final)}원`
          : `${fmt(a)} at ${fmt(b)}% off → ${fmt(final)}`,
      };
    }

    if (tab === 'margin') {
      if (b === 0) return null;
      const marginAmt = b - a;
      const marginPct = (b - a) / b * 100;
      return {
        main: `${fmt(marginPct)}%`,
        secondary: isKo
          ? `마진 금액: ${fmt(marginAmt)}원`
          : `Margin amount: ${fmt(marginAmt)}`,
        barPct: Math.min(Math.max(marginPct, 0), 100),
        expr: isKo
          ? `원가 ${fmt(a)}원, 판매가 ${fmt(b)}원 → 마진율 ${fmt(marginPct)}%`
          : `Cost ${fmt(a)}, Price ${fmt(b)} → Margin ${fmt(marginPct)}%`,
      };
    }

    return null;
  };

  const result = compute();

  /* Auto-save history on new result */
  useEffect(() => {
    if (result) {
      addHistory({ id: result.expr, expr: result.expr, result: result.main });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.expr]);

  /* Input handler */
  const makeInputHandler = (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/,/g, '');
      if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
        setter(raw === '' ? '' : toFmtString(raw));
      }
    };

  /* Copy handler */
  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.main.replace(/원$/, '')).then(() => {
      setCopied(true);
      setToast(true);
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setToast(false), 2200);
    });
  };

  /* Tab change */
  const handleTabChange = (t: Tab) => {
    setTab(t);
    setARaw('');
    setBRaw('');
  };

  /* Placeholders per tab */
  const ph = (which: 'a' | 'b'): string => {
    const map: Record<Tab, [string, string]> = {
      basic:    ['10,000', '15'],
      change:   ['50,000', '65,000'],
      discount: ['39,900', '20'],
      margin:   ['5,000',  '12,000'],
    };
    return map[tab][which === 'a' ? 0 : 1];
  };

  /* Natural language UI */
  const renderNL = () => {
    const inputA = (
      <input
        className={`${ui.input} ${s.sp_nl_input}`}
        value={aRaw}
        onChange={makeInputHandler(setARaw)}
        placeholder={ph('a')}
        inputMode="decimal"
      />
    );
    const inputB = (
      <input
        className={`${ui.input} ${s.sp_nl_input}`}
        value={bRaw}
        onChange={makeInputHandler(setBRaw)}
        placeholder={ph('b')}
        inputMode="decimal"
      />
    );

    if (tab === 'basic') return (
      <div className={s.sp_nl}>
        {inputA}
        <span className={s.sp_nl_text}>{isKo ? '의' : '×'}</span>
        {inputB}
        <span className={ui.badge}>%</span>
        <span className={s.sp_nl_text}>{isKo ? '는 얼마인가요?' : '= ?'}</span>
      </div>
    );

    if (tab === 'change') return (
      <div className={s.sp_nl}>
        {inputA}
        <span className={s.sp_nl_text}>→</span>
        {inputB}
        <span className={s.sp_nl_text}>{isKo ? '(으)로 변하면?' : 'how much change?'}</span>
      </div>
    );

    if (tab === 'discount') return (
      <div className={s.sp_nl}>
        <span className={s.sp_nl_text}>{isKo ? '원래 가격' : 'Price'}</span>
        {inputA}
        {isKo && <span className={s.sp_nl_text}>원에서</span>}
        {inputB}
        <span className={ui.badge}>%</span>
        <span className={s.sp_nl_text}>{isKo ? '할인하면?' : 'off?'}</span>
      </div>
    );

    if (tab === 'margin') return (
      <div className={s.sp_nl}>
        <span className={s.sp_nl_text}>{isKo ? '원가' : 'Cost'}</span>
        {inputA}
        {isKo && <span className={s.sp_nl_text}>원,</span>}
        <span className={s.sp_nl_text}>{isKo ? '판매가' : 'Price'}</span>
        {inputB}
        {isKo && <span className={s.sp_nl_text}>원일 때</span>}
      </div>
    );

    return null;
  };

  const barFillClass =
    result?.barColor === 'red'  ? s.sp_bar_fill_red :
    result?.barColor === 'blue' ? s.sp_bar_fill_blue :
    s.sp_bar_fill;

  const barLabel = () => {
    if (!result) return '';
    if (tab === 'basic')    return isKo ? `비율 ${fmt(b)}%` : `Ratio ${fmt(b)}%`;
    if (tab === 'change')   return isKo ? `변화율 ${result.main}` : `Change ${result.main}`;
    if (tab === 'discount') return isKo ? `할인율 ${fmt(b)}%` : `Discount ${fmt(b)}%`;
    if (tab === 'margin')   return isKo ? `마진율 ${result.main}` : `Margin ${result.main}`;
    return '';
  };

  return (
    <div className={s.sp_wrap}>
      <NavigationActions />

      <ToolHeader
        icon="💹"
        title={isKo ? '스마트 퍼센트 계산기' : 'Smart Percentage Calculator'}
        subtitle={isKo
          ? '기본·증감률·할인율·마진율 — 입력하는 즉시 실시간 계산'
          : 'Basic · Change · Discount · Margin — real-time as you type'}
      />

      {/* Tabs */}
      <nav className={ui.segmented}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${ui.segment} ${tab === t.id ? ui.segmentActive : ''}`}
            onClick={() => handleTabChange(t.id)}
          >
            {isKo ? t.ko : t.en}
          </button>
        ))}
      </nav>

      {/* Main Card */}
      <div className={`${ui.card} ${s.sp_card}`}>
        {renderNL()}

        {result && (
          <div className={`${ui.result} ${s.sp_result}`}>
            <div className={s.sp_result_row}>
              <span className={s.sp_result_label}>{isKo ? '결과' : 'Result'}</span>
              <button className={`${ui.button} ${ui.secondary} ${ui.sm}`} onClick={handleCopy}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? (isKo ? '복사됨' : 'Copied') : (isKo ? '복사' : 'Copy')}
              </button>
            </div>

            <div className={`${s.sp_result_main} ${result.isUp ? s.sp_result_up : result.isDown ? s.sp_result_down : ''}`}>
              {result.main}
            </div>

            {result.secondary && (
              <div className={s.sp_result_secondary}>{result.secondary}</div>
            )}

            {/* Progress Bar */}
            <div className={s.sp_bar_wrap}>
              <div className={s.sp_bar_label}>{barLabel()}</div>
              <div className={s.sp_bar_track}>
                <div className={barFillClass} style={{ width: `${result.barPct}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ad Placeholder */}

      {/* History */}
      <div className={ui.card}>
        <div className={s.sp_history_header}>
          <span className={s.sp_history_title}>
            <Clock size={14} />
            {isKo ? '최근 계산 기록' : 'Recent History'}
          </span>
          {history.length > 0 && (
            <button className={`${ui.button} ${ui.ghost} ${ui.sm}`} onClick={clearHistory}>
              <Trash2 size={11} />
              {isKo ? '전체 삭제' : 'Clear all'}
            </button>
          )}
        </div>
        {history.length === 0
          ? <div className={s.sp_history_empty}>{isKo ? '아직 계산 기록이 없습니다' : 'No history yet'}</div>
          : (
            <div className={s.sp_history_list}>
              {history.map(h => (
                <div key={h.id} className={s.sp_history_item}>
                  <span className={s.sp_history_expr}>{h.expr}</span>
                  <span className={s.sp_history_val}>{h.result}</span>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Share / Related / SEO */}
      <ShareBar
        title={isKo ? '스마트 퍼센트 계산기' : 'Smart Percentage Calculator'}
        description={isKo
          ? '기본·증감률·할인율·마진율을 실시간으로 계산하세요'
          : 'Calculate percentages in real time — basic, change, discount & margin'}
      />
      <RelatedTools toolId="utilities/finance/smart-percent" />


      {seo}

      {/* Toast */}
      {toast && (
        <div className={s.sp_toast}>
          ✓ {isKo ? '복사 완료!' : 'Copied!'}
        </div>
      )}
    </div>
  );
}
