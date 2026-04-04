'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Copy, Check, Trash2, Clock } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './smart-percent.module.css';

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
export default function SmartPercentPage() {
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
        className={s.sp_nl_input}
        value={aRaw}
        onChange={makeInputHandler(setARaw)}
        placeholder={ph('a')}
        inputMode="decimal"
      />
    );
    const inputB = (
      <input
        className={s.sp_nl_input}
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
        <span className={s.sp_nl_badge}>%</span>
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
        <span className={s.sp_nl_badge}>%</span>
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

      {/* Header */}
      <header className={s.sp_header}>
        <span className={s.sp_header_icon}>💹</span>
        <h1 className={s.sp_title}>
          {isKo ? '스마트 퍼센트 계산기' : 'Smart Percentage Calculator'}
        </h1>
        <p className={s.sp_subtitle}>
          {isKo
            ? '기본·증감률·할인율·마진율 — 입력하는 즉시 실시간 계산'
            : 'Basic · Change · Discount · Margin — real-time as you type'}
        </p>
      </header>

      {/* Tabs */}
      <nav className={s.sp_tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${s.sp_tab} ${tab === t.id ? s.sp_tab_active : ''}`}
            onClick={() => handleTabChange(t.id)}
          >
            {isKo ? t.ko : t.en}
          </button>
        ))}
      </nav>

      {/* Main Card */}
      <div className={s.sp_card}>
        {renderNL()}

        {result && (
          <div className={s.sp_result}>
            <div className={s.sp_result_row}>
              <span className={s.sp_result_label}>{isKo ? '결과' : 'Result'}</span>
              <button className={s.sp_copy_btn} onClick={handleCopy}>
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
      <div className={s.sp_ad}>
        {isKo ? '광고 영역 (728×90)' : 'Ad Space (728×90)'}
      </div>

      {/* History */}
      <div className={s.sp_history}>
        <div className={s.sp_history_header}>
          <span className={s.sp_history_title}>
            <Clock size={14} />
            {isKo ? '최근 계산 기록' : 'Recent History'}
          </span>
          {history.length > 0 && (
            <button className={s.sp_history_clear} onClick={clearHistory}>
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

      <div className={s.sp_ad} style={{ marginTop: '0.5rem' }}>
        {isKo ? '광고 영역' : 'Ad Space'}
      </div>

      <SeoSection
        ko={{
          title: '스마트 퍼센트 계산기란 무엇인가요?',
          description: '스마트 퍼센트 계산기는 일상과 비즈니스에서 가장 자주 쓰이는 4가지 퍼센트 연산을 하나의 도구에서 실시간으로 처리하는 계산기입니다. 숫자를 입력하는 즉시 결과가 나타나며, 별도의 계산하기 버튼을 누를 필요가 없습니다. [기본 계산]은 "A의 B%가 얼마인지"를 구할 때, [증감률]은 투자 수익률·매출 증감·마케팅 성과 측정에, [할인율]은 쇼핑 중 실제 지불 금액과 절약 금액 확인에, [마진율]은 판매 이익률 계산에 최적화되어 있습니다. 모든 연산은 브라우저 내에서만 처리되어 서버 전송이 없으며, 계산 결과는 최대 5건까지 로컬 스토리지에 자동 저장됩니다. 결과값은 원 클릭으로 클립보드에 복사할 수 있고, 직관적인 프로그레스 바가 비율을 시각적으로 표현합니다. 천 단위 자동 콤마 포매팅으로 큰 숫자도 편리하게 입력할 수 있습니다.',
          useCases: [
            { icon: '🛍️', title: '쇼핑 할인 계산', desc: '마트나 쇼핑몰에서 "30% 할인" 태그를 봤을 때, 원래 가격과 할인율을 입력하면 실제 결제 금액과 절약 금액을 즉시 확인할 수 있어 충동구매를 줄이고 현명한 소비를 도와줍니다.' },
            { icon: '📈', title: '투자 수익률 측정', desc: '주식·코인·부동산 등 자산의 매입가와 현재가를 입력하면 증감률 탭에서 수익률(%)과 실제 손익 금액을 빨간색·파란색으로 직관적으로 표시해주어 투자 성과를 한눈에 파악할 수 있습니다.' },
            { icon: '💼', title: '비즈니스 마진 관리', desc: '원가와 판매가를 입력하면 마진율(%)과 건당 마진 금액을 실시간으로 계산합니다. 프리랜서 견적, 소규모 창업, 도·소매 비즈니스에서 적정 가격을 설정하는 데 바로 활용할 수 있습니다.' },
            { icon: '📊', title: '마케팅 성과 분석', desc: '지난달 방문자 수와 이번 달 방문자 수를 증감률 탭에 입력하면 방문자 증가율을 즉시 계산할 수 있습니다. 광고 CTR, 전환율 변화 등 다양한 마케팅 지표 비교에도 활용 가능합니다.' },
          ],
          steps: [
            { step: '탭 선택', desc: '상단 4개 탭에서 원하는 계산 유형을 선택합니다. 기본 계산(A의 B%), 증감률(A→B 변화), 할인율(쇼핑 절약), 마진율(비즈니스 이익) 중 상황에 맞는 탭을 누르면 입력 필드가 즉시 전환됩니다.' },
            { step: '숫자 입력', desc: '문장형 입력 필드에 숫자를 입력합니다. 천 단위 콤마는 자동으로 포매팅되며 따로 입력할 필요가 없습니다. 숫자를 입력하는 순간 결과가 실시간으로 계산되어 하단에 표시됩니다.' },
            { step: '결과 확인', desc: '결과 카드에 메인 수치와 보조 정보(절약 금액, 마진 금액 등)가 함께 표시됩니다. 증감률은 증가 시 빨간색, 감소 시 파란색으로 구분되며, 프로그레스 바가 비율을 시각적으로 나타냅니다.' },
            { step: '복사·기록 활용', desc: '결과 옆 [복사] 버튼을 누르면 숫자가 클립보드에 복사되고 "복사 완료!" 토스트가 뜹니다. 계산 결과는 자동으로 최근 기록 영역에 저장되며, 최대 5건까지 브라우저를 닫아도 유지됩니다.' },
          ],
          faqs: [
            { q: '입력할 때마다 자동으로 계산되나요?', a: '네. 이 계산기는 별도의 계산하기 버튼이 없습니다. 숫자를 입력하는 즉시 onChange 이벤트로 실시간 연산이 실행되어 결과가 바로 나타납니다. 두 개의 입력 필드가 모두 채워지는 순간 자동으로 계산이 완료됩니다.' },
            { q: '계산 기록은 어디에 저장되나요?', a: '모든 계산 결과는 브라우저의 로컬 스토리지(localStorage)에 저장됩니다. 서버로 데이터가 전송되지 않으므로 개인정보 유출 걱정이 없습니다. 최대 5건이 유지되며, 새 계산이 추가될 때 가장 오래된 기록이 자동으로 제거됩니다.' },
            { q: '할인율 탭에서 할인율이 100%를 넘으면?', a: '할인율 탭은 0%~100% 범위에서만 정상 결과를 표시합니다. 0 미만이거나 100을 초과하는 경우 결과값이 표시되지 않습니다. 정상적인 할인율(예: 10%, 30%, 50%)을 입력하면 최종 결제금액과 절약 금액을 정확하게 계산합니다.' },
            { q: '모바일에서도 편리하게 사용할 수 있나요?', a: '네. 입력 필드에 inputMode="decimal" 속성이 적용되어 모바일에서 숫자 키패드가 자동으로 표시됩니다. 탭 메뉴는 모바일(600px 이하)에서 2열 2행으로 재배치되어 터치하기 쉽게 구성되며, 카드 레이아웃도 작은 화면에 최적화되어 있습니다.' },
          ],
        }}
        en={{
          title: 'What is the Smart Percentage Calculator?',
          description: 'The Smart Percentage Calculator is a real-time, all-in-one tool that handles the four most common percentage operations in everyday life and business — all without pressing a single button. As you type, results appear instantly. The Basic tab answers "what is B% of A?", the Change tab measures percentage increase or decrease for investments and marketing metrics, the Discount tab calculates the final price and savings during shopping, and the Margin tab computes profit margin percentage and amount for business pricing. All calculations run entirely in the browser with zero server contact, protecting your data privacy. Results are automatically saved to localStorage (up to 5 entries), copyable with one click, and visualized with an animated progress bar. Large numbers are auto-formatted with commas for easy readability.',
          useCases: [
            { icon: '🛍️', title: 'Shopping Discounts', desc: 'Enter the original price and discount percentage to instantly see the final payment amount and exactly how much you save — helpful for avoiding impulse purchases and sticking to your budget.' },
            { icon: '📈', title: 'Investment Returns', desc: 'Input your purchase price and current value in the Change tab to see your return percentage highlighted in red (gain) or blue (loss), along with the actual profit or loss amount for quick portfolio review.' },
            { icon: '💼', title: 'Business Pricing', desc: 'Enter cost and selling price in the Margin tab to compute the profit margin percentage and margin amount per sale — ideal for freelancers, small business owners, and retail pricing decisions.' },
            { icon: '📊', title: 'Marketing Analytics', desc: 'Compare last month\'s and this month\'s metrics (visitors, clicks, conversions) in the Change tab to calculate growth rates instantly, making it easy to report marketing performance without a spreadsheet.' },
          ],
          steps: [
            { step: 'Select a Tab', desc: 'Choose from the four tabs at the top: Basic (A × B%), Change (A→B growth), Discount (shopping savings), or Margin (business profit). The input fields and labels update immediately to match the selected mode.' },
            { step: 'Type Your Numbers', desc: 'Enter values in the natural-language input fields. Numbers auto-format with commas as you type — no need to add them manually. As soon as both fields have values, the result appears in real time below.' },
            { step: 'Read the Result', desc: 'The result card shows the main figure plus secondary info (savings amount, margin amount, etc.). Change mode colors the result red for increases and blue for decreases. An animated progress bar gives a visual sense of the ratio.' },
            { step: 'Copy & Review History', desc: 'Click the Copy button to copy the result to your clipboard; a "Copied!" toast confirms the action. Every calculation is automatically saved to the Recent History section (up to 5 entries, persisted across browser sessions).' },
          ],
          faqs: [
            { q: 'Is there a Calculate button?', a: 'No — there is no Calculate button by design. The tool uses real-time onChange listeners on both input fields. The moment both fields contain valid numbers, the result appears automatically, making the workflow faster for repeated calculations.' },
            { q: 'Where is my history stored?', a: 'All calculation history is stored in your browser\'s localStorage, so nothing is sent to any server. Your data is completely private. Up to 5 results are kept; when a new entry is added and the limit is reached, the oldest entry is automatically removed.' },
            { q: 'What happens if I enter a discount over 100%?', a: 'The Discount tab is designed for valid discount rates between 0% and 100%. Entering a value outside this range will cause the result panel to disappear, preventing nonsensical output. Enter a normal discount rate (e.g., 10, 30, 50) to see the correct final price and savings.' },
            { q: 'Is it optimized for mobile?', a: 'Yes. The number inputs use inputMode="decimal" to trigger the numeric keypad on mobile devices automatically. On screens under 600px wide, the four tabs reflow into a 2×2 grid for easy tapping, and the card layout adjusts for comfortable single-thumb use.' },
          ],
        }}
      />

      {/* Toast */}
      {toast && (
        <div className={s.sp_toast}>
          ✓ {isKo ? '복사 완료!' : 'Copied!'}
        </div>
      )}
    </div>
  );
}
