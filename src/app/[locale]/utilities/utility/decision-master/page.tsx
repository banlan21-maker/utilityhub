'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Decision Master – 5가지 랜덤 결정 도구",
  "alternateName": "Decision Master – 5-in-1 Random Decision Hub",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/utility/decision-master",
  "description": "사다리 타기, 돌림판, 주사위, 제비뽑기, 화살표 돌리기 5가지 랜덤 결정 도구를 하나의 페이지에서 무료로 사용할 수 있습니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "결과가 진짜 무작위인가요?",
      "acceptedAnswer": { "@type": "Answer", "text": "네. 돌림판·화살표·주사위는 JavaScript의 Math.random() 기반 의사난수를 사용하며, 사다리 가로대와 제비뽑기 당첨 위치도 매 생성 시 무작위로 결정됩니다. 동일한 결과가 반복되지 않도록 설계되어 있어 공정한 추첨 도구로 활용하기에 적합합니다." }
    },
    {
      "@type": "Question",
      "name": "로그인이나 설치가 필요한가요?",
      "acceptedAnswer": { "@type": "Answer", "text": "아니요. 회원가입·로그인·앱 설치 모두 필요 없습니다. 브라우저에서 바로 사용할 수 있으며, 입력한 이름이나 선택지 데이터는 서버로 전송되지 않고 기기 내에서만 처리됩니다." }
    },
    {
      "@type": "Question",
      "name": "모바일에서도 잘 되나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "네. 모든 모드는 모바일 화면에 최적화되어 있습니다. 사다리 타기 캔버스는 화면 너비에 맞게 자동 조절되며, 돌림판과 화살표는 터치 입력도 원활하게 동작합니다. iOS Safari 및 Android Chrome 모두 지원합니다." }
    },
    {
      "@type": "Question",
      "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 모든 결과는 순수 오락·편의 목적의 랜덤 생성값으로, 법적 효력이 없습니다. 중요한 결정은 반드시 당사자 간 합의를 통해 이루어져야 합니다." }
    }
  ]
};
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './decision.module.css';

/* ── Types ── */
type Mode = 'ladder' | 'wheel' | 'dice' | 'lot' | 'arrow';

/* ═══════════════════════════════════
   WHEEL MODE
═══════════════════════════════════ */
const WHEEL_COLORS = [
  '#8b5cf6','#d946ef','#ec4899','#f97316',
  '#eab308','#22c55e','#06b6d4','#3b82f6',
];

function WheelMode({ isKo }: { isKo: boolean }) {
  const [items, setItems] = useState(['선택지 1', '선택지 2', '선택지 3', '선택지 4']);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const svgSize = 280;
  const cx = svgSize / 2;
  const r = cx - 8;

  const validItems = items.filter(i => i.trim());

  const spin = useCallback(() => {
    if (spinning || validItems.length < 2) return;
    setSpinning(true);
    setWinner(null);
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const stopDeg = Math.floor(Math.random() * 360);
    const totalDeg = extraSpins * 360 + stopDeg;
    const newRot = rotation + totalDeg;
    setRotation(newRot);
    setTimeout(() => {
      const sliceDeg = 360 / validItems.length;
      // pointer at top = 270 degrees (or -90)
      const normalized = ((360 - (newRot % 360)) + 270) % 360;
      const idx = Math.floor(normalized / sliceDeg) % validItems.length;
      setWinner(validItems[idx]);
      setSpinning(false);
    }, 4200);
  }, [spinning, validItems, rotation]);

  const sliceDeg = validItems.length > 0 ? 360 / validItems.length : 360;

  function polarToXY(deg: number, radius: number) {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(rad), y: cx + radius * Math.sin(rad) };
  }

  function buildSlicePath(idx: number) {
    const start = idx * sliceDeg;
    const end = start + sliceDeg;
    const p1 = polarToXY(start, r);
    const p2 = polarToXY(end, r);
    const largeArc = sliceDeg > 180 ? 1 : 0;
    return `M ${cx} ${cx} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`;
  }

  return (
    <div className={s.wheel_wrap}>
      {/* Items panel */}
      <div className={s.wheel_items_panel}>
        <label className={s.dm_label}>{isKo ? '선택지 입력 (최소 2개)' : 'Enter Options (min 2)'}</label>
        {items.map((item, i) => (
          <div key={i} className={s.wheel_item_row}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: WHEEL_COLORS[i % WHEEL_COLORS.length], flexShrink: 0 }} />
            <input
              className={s.wheel_item_input}
              value={item}
              onChange={e => {
                const next = [...items];
                next[i] = e.target.value;
                setItems(next);
              }}
              placeholder={isKo ? `선택지 ${i + 1}` : `Option ${i + 1}`}
            />
            {items.length > 2 && (
              <button className={s.wheel_del_btn} onClick={() => setItems(items.filter((_, j) => j !== i))}>×</button>
            )}
          </div>
        ))}
        {items.length < 8 && (
          <button className={s.dm_btn_sm} style={{ marginTop: '0.5rem' }}
            onClick={() => setItems([...items, ''])}>
            + {isKo ? '추가' : 'Add'}
          </button>
        )}
      </div>

      {/* SVG Wheel */}
      <div className={s.wheel_svg_wrap}>
        <div className={s.wheel_pointer} />
        <svg width={svgSize} height={svgSize} style={{ display: 'block' }}>
          <g
            style={{
              transformOrigin: `${cx}px ${cx}px`,
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? `transform 4s cubic-bezier(0.17, 0.67, 0.12, 1)` : 'none',
            }}
          >
            {validItems.map((item, i) => {
              const midAngle = i * sliceDeg + sliceDeg / 2 - 90;
              const textPos = polarToXY(midAngle + 90, r * 0.62);
              return (
                <g key={i}>
                  <path d={buildSlicePath(i)} fill={WHEEL_COLORS[i % WHEEL_COLORS.length]} stroke="white" strokeWidth={2} />
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={validItems.length > 6 ? 9 : 11}
                    fontWeight="800"
                    style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                    transform={`rotate(${i * sliceDeg + sliceDeg / 2}, ${textPos.x}, ${textPos.y})`}
                  >
                    {item.length > 8 ? item.slice(0, 7) + '…' : item}
                  </text>
                </g>
              );
            })}
            <circle cx={cx} cy={cx} r={18} fill="white" stroke="#e2e8f0" strokeWidth={2} />
          </g>
        </svg>
      </div>

      <button className={s.dm_btn} onClick={spin} disabled={spinning || validItems.length < 2}>
        {spinning ? (isKo ? '돌아가는 중...' : 'Spinning...') : (isKo ? '🎡 돌려라!' : '🎡 Spin!')}
      </button>

      {winner && (
        <div className={s.dm_result}>
          <div className={s.dm_result_label}>{isKo ? '결과' : 'Result'}</div>
          <div className={s.dm_result_value}>🎉 {winner}</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════
   DICE MODE
═══════════════════════════════════ */
const DOT_PATTERNS: Array<string[]> = [
  [],
  ['d'],            // 1
  ['a','g'],        // 2
  ['a','d','g'],    // 3
  ['a','b','f','g'],// 4
  ['a','b','d','f','g'], // 5
  ['a','b','c','e','f','g'], // 6
];

function DieFace({ value }: { value: number }) {
  const dots = DOT_PATTERNS[value] ?? [];
  return (
    <div className={s.die}>
      {['a','b','c','d','e','f','g'].map(pos => (
        dots.includes(pos)
          ? <div key={pos} className={`${s.dot} ${s[`dot_${pos}`]}`} />
          : <div key={pos} className={s[`dot_${pos}`]} style={{ gridArea: pos }} />
      ))}
    </div>
  );
}

function DiceMode({ isKo }: { isKo: boolean }) {
  const [count, setCount] = useState(2);
  const [values, setValues] = useState<number[]>([3, 5]);
  const [rolling, setRolling] = useState(false);
  const [rollingKeys, setRollingKeys] = useState<number[]>([]);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setRollingKeys(Array.from({ length: count }, (_, i) => i));
    setTimeout(() => {
      setValues(Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1));
      setRollingKeys([]);
      setRolling(false);
    }, 600);
  };

  const changeCount = (n: number) => {
    const c = Math.max(1, Math.min(5, n));
    setCount(c);
    setValues(Array.from({ length: c }, () => Math.floor(Math.random() * 6) + 1));
  };

  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div className={s.dice_wrap}>
      <div>
        <label className={s.dm_label}>{isKo ? '주사위 개수' : 'Number of Dice'}</label>
        <div className={s.dice_count_row}>
          {[1,2,3,4,5].map(n => (
            <button key={n}
              className={`${s.dm_btn_sm} ${count === n ? s.dm_btn_sm_active : ''}`}
              onClick={() => changeCount(n)}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className={s.dice_row}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={s.die_outer}>
            <div className={`${s.die} ${rollingKeys.includes(i) ? s.die_rolling : ''}`}>
              {DOT_PATTERNS[values[i] ?? 1].map(pos => (
                <div key={pos} className={`${s.dot} ${s[`dot_${pos}`]}`} />
              ))}
              {['a','b','c','d','e','f','g']
                .filter(pos => !DOT_PATTERNS[values[i] ?? 1].includes(pos))
                .map(pos => <div key={pos} style={{ gridArea: pos }} />)
              }
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className={s.dice_total}>
          {isKo ? `합계: ${total}` : `Total: ${total}`}
        </div>
      )}

      <button className={s.dm_btn} onClick={roll} disabled={rolling}>
        {rolling ? (isKo ? '굴리는 중...' : 'Rolling...') : (isKo ? '🎲 굴려라!' : '🎲 Roll!')}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════
   LOT MODE (제비뽑기)
═══════════════════════════════════ */
function LotMode({ isKo }: { isKo: boolean }) {
  const [total, setTotal] = useState(5);
  const [winners, setWinners] = useState(1);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [winSet, setWinSet] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);

  const reset = () => {
    // Shuffle win indices
    const pool = Array.from({ length: total }, (_, i) => i);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setWinSet(new Set(pool.slice(0, winners)));
    setRevealed(Array(total).fill(false));
    setDone(false);
  };

  useEffect(() => { reset(); }, [total, winners]);

  const flip = (i: number) => {
    if (revealed[i] || done) return;
    const next = [...revealed];
    next[i] = true;
    setRevealed(next);
    if (next.every(Boolean)) setDone(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className={s.lot_controls}>
        <div>
          <label className={s.dm_label}>{isKo ? '전체 인원' : 'Total'}</label>
          <div className={s.lot_counter}>
            <button className={s.lot_cnt_btn} onClick={() => setTotal(t => Math.max(2, t - 1))}>−</button>
            <span className={s.lot_cnt_val}>{total}</span>
            <button className={s.lot_cnt_btn} onClick={() => setTotal(t => Math.min(12, t + 1))}>+</button>
          </div>
        </div>
        <div>
          <label className={s.dm_label}>{isKo ? '당첨 인원' : 'Winners'}</label>
          <div className={s.lot_counter}>
            <button className={s.lot_cnt_btn} onClick={() => setWinners(w => Math.max(1, w - 1))}>−</button>
            <span className={s.lot_cnt_val}>{winners}</span>
            <button className={s.lot_cnt_btn} onClick={() => setWinners(w => Math.min(total - 1, w + 1))}>+</button>
          </div>
        </div>
        <button className={s.dm_btn_sm} onClick={reset}>{isKo ? '🔄 리셋' : '🔄 Reset'}</button>
      </div>

      <div className={s.lot_cards_grid}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={s.flip_card} onClick={() => flip(i)}>
            <div className={`${s.flip_inner} ${revealed[i] ? s.flip_inner_flipped : ''}`}>
              <div className={s.flip_front}>🎴</div>
              <div className={`${s.flip_back} ${winSet.has(i) ? s.flip_back_win : s.flip_back_lose}`}>
                {winSet.has(i)
                  ? (isKo ? '🎉 당첨!' : '🎉 Win!')
                  : (isKo ? '😢 꽝' : '😢 Lose')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {done && (
        <div className={s.dm_result}>
          <div className={s.dm_result_label}>{isKo ? '추첨 완료' : 'All Revealed'}</div>
          <div className={s.dm_result_value}>
            {isKo ? `${winners}명 당첨!` : `${winners} winner${winners > 1 ? 's' : ''}!`}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════
   LADDER MODE (사다리 타기)
═══════════════════════════════════ */
const MAX_LADDER = 6;

function LadderMode({ isKo }: { isKo: boolean }) {
  const [count, setCount] = useState(4);
  const [names, setNames] = useState(['철수', '영희', '민준', '지아']);
  const [prizes, setPrizes] = useState(['1등', '2등', '꽝', '3등']);
  const [runIdx, setRunIdx] = useState<number | null>(null);
  const [paths, setPaths] = useState<Array<Array<{ x: number; y: number }>>>([]);
  const [results, setResults] = useState<string[]>([]);
  const [runAll, setRunAll] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bridges, setBridges] = useState<Array<{ row: number; col: number }>>([]);
  const [generated, setGenerated] = useState(false);
  const COLS = count;
  const ROWS = 8;
  const W = Math.min(360, COLS * 70);
  const H = 300;
  const colGap = W / (COLS + 1);
  const rowGap = H / (ROWS + 1);

  const colX = (i: number) => colGap * (i + 1);
  const rowY = (r: number) => rowGap * (r + 1);

  const generate = useCallback(() => {
    const br: Array<{ row: number; col: number }> = [];
    for (let row = 0; row < ROWS; row++) {
      const used = new Set<number>();
      for (let col = 0; col < COLS - 1; col++) {
        if (!used.has(col) && !used.has(col + 1) && Math.random() < 0.45) {
          br.push({ row, col });
          used.add(col);
          used.add(col + 1);
        }
      }
    }
    setBridges(br);
    setPaths([]);
    setResults([]);
    setRunIdx(null);
    setRunAll(false);
    setGenerated(true);
  }, [COLS, ROWS]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    // Draw vertical lines
    for (let c = 0; c < COLS; c++) {
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(colX(c), rowY(0));
      ctx.lineTo(colX(c), rowY(ROWS - 1));
      ctx.stroke();
    }

    // Draw bridges
    bridges.forEach(({ row, col }) => {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(colX(col), rowY(row));
      ctx.lineTo(colX(col + 1), rowY(row));
      ctx.stroke();
    });

    // Draw paths
    paths.forEach((path, pi) => {
      const isActive = pi === runIdx || runAll;
      ctx.strokeStyle = isActive ? '#8b5cf6' : '#c4b5fd';
      ctx.lineWidth = isActive ? 4 : 2.5;
      ctx.beginPath();
      path.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    });
  }, [bridges, paths, runIdx, runAll, W, H, COLS, ROWS, colX, rowY]);

  const tracePath = (startCol: number): Array<{ x: number; y: number }> => {
    const path: Array<{ x: number; y: number }> = [];
    let col = startCol;
    path.push({ x: colX(col), y: rowGap * 0.5 });
    path.push({ x: colX(col), y: rowY(0) });

    for (let row = 0; row < ROWS - 1; row++) {
      // Check bridge right
      const right = bridges.find(b => b.row === row && b.col === col);
      const left  = bridges.find(b => b.row === row && b.col === col - 1);
      if (right) {
        path.push({ x: colX(col + 1), y: rowY(row) });
        col = col + 1;
      } else if (left) {
        path.push({ x: colX(col - 1), y: rowY(row) });
        col = col - 1;
      }
      path.push({ x: colX(col), y: rowY(row + 1) });
    }
    path.push({ x: colX(col), y: H - rowGap * 0.5 });
    return path;
  };

  const runOne = (i: number) => {
    if (!generated) return;
    setRunIdx(i);
    const path = tracePath(i);
    const newPaths = [...paths];
    newPaths[i] = path;
    setPaths(newPaths);
    // result: final col
    const finalPt = path[path.length - 2];
    const finalCol = Math.round(finalPt.x / colGap) - 1;
    const newResults = [...results];
    newResults[i] = prizes[finalCol] ?? `${finalCol + 1}`;
    setResults(newResults);
  };

  const runAllFn = () => {
    if (!generated) return;
    const allPaths: Array<Array<{ x: number; y: number }>> = [];
    const allResults: string[] = [];
    for (let i = 0; i < COLS; i++) {
      const path = tracePath(i);
      allPaths.push(path);
      const finalPt = path[path.length - 2];
      const finalCol = Math.round(finalPt.x / colGap) - 1;
      allResults.push(prizes[finalCol] ?? `${finalCol + 1}`);
    }
    setPaths(allPaths);
    setResults(allResults);
    setRunIdx(null);
    setRunAll(true);
  };

  const changeCount = (n: number) => {
    const c = Math.max(2, Math.min(MAX_LADDER, n));
    setCount(c);
    setNames(prev => {
      const def = ['철수','영희','민준','지아','민호','수진'];
      return Array.from({ length: c }, (_, i) => prev[i] ?? def[i] ?? `P${i+1}`);
    });
    setPrizes(prev => {
      const def = ['1등','2등','꽝','3등','꽝','4등'];
      return Array.from({ length: c }, (_, i) => prev[i] ?? def[i] ?? `${i+1}`);
    });
    setGenerated(false);
    setPaths([]);
    setResults([]);
    setBridges([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <label className={s.dm_label}>{isKo ? '인원 수' : 'Players'}</label>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[2,3,4,5,6].map(n => (
              <button key={n}
                className={`${s.dm_btn_sm} ${count === n ? s.dm_btn_sm_active : ''}`}
                onClick={() => changeCount(n)}>{n}</button>
            ))}
          </div>
        </div>
        <button className={s.dm_btn} style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }} onClick={generate}>
          {isKo ? '🪜 사다리 생성' : '🪜 Generate'}
        </button>
      </div>

      <div className={s.ladder_inputs}>
        <div className={s.ladder_col_inputs}>
          <label className={s.dm_label}>{isKo ? '참가자' : 'Players'}</label>
          {names.map((n, i) => (
            <div key={i} className={s.ladder_input_row}>
              <span className={s.ladder_num}>{i + 1}</span>
              <input className={s.dm_input} style={{ padding: '0.4rem 0.6rem' }}
                value={n}
                onChange={e => { const a = [...names]; a[i] = e.target.value; setNames(a); }}
                placeholder={isKo ? `참가자 ${i+1}` : `Player ${i+1}`}
              />
              {generated && (
                <button className={s.dm_btn_sm} onClick={() => runOne(i)}>GO</button>
              )}
            </div>
          ))}
        </div>
        <div className={s.ladder_col_inputs}>
          <label className={s.dm_label}>{isKo ? '결과' : 'Prizes'}</label>
          {prizes.map((p, i) => (
            <div key={i} className={s.ladder_input_row}>
              <input className={s.dm_input} style={{ padding: '0.4rem 0.6rem' }}
                value={p}
                onChange={e => { const a = [...prizes]; a[i] = e.target.value; setPrizes(a); }}
                placeholder={isKo ? `결과 ${i+1}` : `Prize ${i+1}`}
              />
              {results[i] && (
                <span style={{ fontSize: '0.72rem', color: '#8b5cf6', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  ← {names[i] ? names[i].slice(0,4) : `P${i+1}`}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={s.ladder_canvas_wrap}>
        {/* Top labels */}
        <div style={{ display: 'flex', width: W, margin: '0 auto' }}>
          {names.map((n, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.72rem', fontWeight: 800, color: runIdx === i ? '#8b5cf6' : '#475569', padding: '0.25rem 0' }}>
              {n || `P${i+1}`}
            </div>
          ))}
        </div>
        <canvas ref={canvasRef} width={W} height={H} className={s.ladder_canvas} />
        {/* Bottom labels */}
        <div style={{ display: 'flex', width: W, margin: '0 auto' }}>
          {prizes.map((p, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#475569', padding: '0.25rem 0' }}>
              {p || `${i+1}`}
            </div>
          ))}
        </div>
      </div>

      {generated && (
        <button className={s.dm_btn_sm} style={{ alignSelf: 'center' }} onClick={runAllFn}>
          {isKo ? '⚡ 전체 공개' : '⚡ Reveal All'}
        </button>
      )}

      {runAll && results.length > 0 && (
        <div className={s.dm_result}>
          <div className={s.dm_result_label}>{isKo ? '전체 결과' : 'All Results'}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
            {names.map((n, i) => (
              <span key={i} style={{ background: '#f5f3ff', border: '1.5px solid #e9d5ff', borderRadius: '0.5rem', padding: '0.25rem 0.6rem', fontSize: '0.82rem', fontWeight: 800, color: '#7c3aed' }}>
                {n || `P${i+1}`} → {results[i]}
              </span>
            ))}
          </div>
        </div>
      )}

      {runIdx !== null && results[runIdx] && !runAll && (
        <div className={s.dm_result}>
          <div className={s.dm_result_label}>{names[runIdx] || `P${runIdx+1}`}{isKo ? ' 결과' : ' Result'}</div>
          <div className={s.dm_result_value}>🎯 {results[runIdx]}</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════
   ARROW MODE (화살표 돌리기)
═══════════════════════════════════ */
function ArrowMode({ isKo }: { isKo: boolean }) {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [sectors] = useState(['A','B','C','D','E','F','G','H']);
  const [customLabels, setCustomLabels] = useState(['', '', '', '', '', '', '', '']);
  const [useCustom, setUseCustom] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const svgSize = 260;
  const cx = svgSize / 2;
  const r = cx - 16;
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startAngleRef = useRef(0);
  const targetRef = useRef(0);
  const durationRef = useRef(3000);

  const spinArrow = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const spins = 4 + Math.random() * 4;
    const stopDeg = Math.random() * 360;
    const total = spins * 360 + stopDeg;
    startAngleRef.current = angle;
    targetRef.current = angle + total;
    durationRef.current = 3000 + Math.random() * 1000;
    startTimeRef.current = null;

    const animate = (ts: number) => {
      if (startTimeRef.current === null) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const progress = Math.min(elapsed / durationRef.current, 1);
      // easeOut cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const cur = startAngleRef.current + (targetRef.current - startAngleRef.current) * eased;
      setAngle(cur);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setAngle(targetRef.current);
        // Determine sector: arrow points up (0 deg) → sector at top
        const norm = ((targetRef.current % 360) + 360) % 360;
        const sectorDeg = 360 / sectors.length;
        // Arrow tip is at angle=0 pointing up, visual angle 0 = right in SVG
        // We drew arrow pointing up so at angle=0 it points up = 270 in standard
        const sectorIdx = Math.floor(((norm + sectorDeg / 2) % 360) / sectorDeg) % sectors.length;
        const label = useCustom && customLabels[sectorIdx]
          ? customLabels[sectorIdx]
          : sectors[sectorIdx];
        setResult(label);
        setSpinning(false);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  }, [spinning, angle, sectors, useCustom, customLabels]);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  const COLORS = WHEEL_COLORS;
  const sectorDeg = 360 / sectors.length;

  function buildSectorPath(i: number) {
    const startRad = ((i * sectorDeg - 90) * Math.PI) / 180;
    const endRad = (((i + 1) * sectorDeg - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cx + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cx + r * Math.sin(endRad);
    return `M ${cx} ${cx} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  }

  return (
    <div className={s.arrow_wrap}>
      <div className={s.arrow_svg_wrap}>
        <svg width={svgSize} height={svgSize}>
          {/* Sectors (static) */}
          {sectors.map((sec, i) => {
            const midRad = ((i * sectorDeg + sectorDeg / 2 - 90) * Math.PI) / 180;
            const tx = cx + r * 0.65 * Math.cos(midRad);
            const ty = cx + r * 0.65 * Math.sin(midRad);
            const label = useCustom && customLabels[i] ? customLabels[i] : sec;
            return (
              <g key={i}>
                <path d={buildSectorPath(i)} fill={COLORS[i % COLORS.length]} opacity={0.25} stroke="white" strokeWidth={1.5} />
                <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
                  fontSize={10} fontWeight="700" fill="#475569">
                  {label.length > 5 ? label.slice(0, 4) + '…' : label}
                </text>
              </g>
            );
          })}
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e2e8f0" strokeWidth={2} />

          {/* Rotating arrow */}
          <g transform={`rotate(${angle}, ${cx}, ${cx})`}>
            {/* Arrow body */}
            <line x1={cx} y1={cx} x2={cx} y2={cx - r + 12}
              stroke="#1e293b" strokeWidth={4} strokeLinecap="round" />
            {/* Arrowhead */}
            <polygon
              points={`${cx},${cx - r + 8} ${cx - 7},${cx - r + 22} ${cx + 7},${cx - r + 22}`}
              fill="#1e293b"
            />
            {/* Tail */}
            <line x1={cx} y1={cx} x2={cx} y2={cx + 20}
              stroke="#64748b" strokeWidth={3} strokeLinecap="round" />
          </g>
          {/* Center hub */}
          <circle cx={cx} cy={cx} r={10} fill="#1e293b" />
          <circle cx={cx} cy={cx} r={5} fill="white" />
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: 300 }}>
        <label className={s.dm_label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={useCustom} onChange={e => setUseCustom(e.target.checked)} />
          {isKo ? '직접 입력 사용' : 'Use Custom Labels'}
        </label>
        {useCustom && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            {sectors.map((sec, i) => (
              <input key={i} className={s.dm_input} style={{ padding: '0.35rem 0.6rem', fontSize: '0.82rem' }}
                placeholder={sec}
                value={customLabels[i]}
                onChange={e => {
                  const next = [...customLabels];
                  next[i] = e.target.value;
                  setCustomLabels(next);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <button className={s.dm_btn} onClick={spinArrow} disabled={spinning}>
        {spinning ? (isKo ? '돌아가는 중...' : 'Spinning...') : (isKo ? '🏹 화살표 돌리기!' : '🏹 Spin Arrow!')}
      </button>

      {result && (
        <div className={s.dm_result}>
          <div className={s.dm_result_label}>{isKo ? '화살표가 가리키는 곳' : 'Arrow Points To'}</div>
          <div className={s.dm_result_value}>🏹 {result}</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════
   MAIN PAGE
═══════════════════════════════════ */
const TABS: { id: Mode; ko: string; en: string; icon: string }[] = [
  { id: 'ladder', ko: '사다리', en: 'Ladder', icon: '🪜' },
  { id: 'wheel',  ko: '돌림판', en: 'Wheel',  icon: '🎡' },
  { id: 'dice',   ko: '주사위', en: 'Dice',   icon: '🎲' },
  { id: 'lot',    ko: '제비뽑기', en: 'Draw', icon: '🎴' },
  { id: 'arrow',  ko: '화살표', en: 'Arrow',  icon: '🏹' },
];

export default function DecisionMasterPage() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const [mode, setMode] = useState<Mode>('wheel');

  return (
    <div className={s.dm_wrap}>
      <NavigationActions />

      {/* Header */}
      <header className={s.dm_header}>
        <span className={s.dm_header_icon}>🎡</span>
        <h1 className={s.dm_title}>
          {isKo ? 'Decision Master' : 'Decision Master'}
        </h1>
        <p className={s.dm_subtitle}>
          {isKo
            ? '5가지 랜덤 결정 도구 — 사다리 · 돌림판 · 주사위 · 제비뽑기 · 화살표'
            : '5-in-1 Random Decision Hub — Ladder · Wheel · Dice · Draw · Arrow'}
        </p>
      </header>

      {/* Tabs */}
      <nav className={s.dm_tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${s.dm_tab} ${mode === t.id ? s.dm_tab_active : ''}`}
            onClick={() => setMode(t.id)}
          >
            {t.icon}<br />{isKo ? t.ko : t.en}
          </button>
        ))}
      </nav>

      {/* Mode Card */}
      <div className={s.dm_card}>
        {mode === 'ladder' && <LadderMode isKo={isKo} />}
        {mode === 'wheel'  && <WheelMode  isKo={isKo} />}
        {mode === 'dice'   && <DiceMode   isKo={isKo} />}
        {mode === 'lot'    && <LotMode    isKo={isKo} />}
        {mode === 'arrow'  && <ArrowMode  isKo={isKo} />}
      </div>

      {/* Bottom */}
      <ShareBar
        title={isKo ? 'Decision Master – 5가지 랜덤 결정 도구' : 'Decision Master – 5-in-1 Random Decision Hub'}
        description={isKo ? '사다리·돌림판·주사위·제비뽑기·화살표로 고민을 해결하세요' : 'Solve any dilemma with Ladder, Wheel, Dice, Draw & Arrow spinner'}
      />
      <RelatedTools toolId="utilities/utility/decision-master" />

      {/* SEO */}
      <section className={s.seo_section}>
        {isKo ? (
          <>
            <h2 className={s.seo_h2}>Decision Master란 무엇인가요?</h2>
            <p className={s.seo_p}>
              Decision Master는 일상의 크고 작은 결정을 재미있고 공정하게 해결하기 위한 5-in-1 랜덤 결정 도구 모음입니다.
              오늘 점심 메뉴부터 팀 역할 배정, 게임 순서 정하기까지 모든 상황에서 활용할 수 있습니다.
              사다리 타기(Ladder), 돌림판(Wheel), 주사위(Dice), 제비뽑기(Draw), 화살표 돌리기(Arrow) 다섯 가지 모드를
              하나의 페이지에서 바로 사용할 수 있으며, 별도 설치나 회원가입 없이 무료로 이용 가능합니다.
            </p>

            <h2 className={s.seo_h2}>각 모드 소개</h2>
            <p className={s.seo_p}>
              <strong>🪜 사다리 타기</strong> — 참가자 2~6명의 이름과 결과를 입력하고 사다리를 생성한 뒤, 개별 또는 전체 경로를 공개할 수 있습니다.
              무작위로 생성된 가로대(bridge)가 공정한 결과를 보장합니다.<br />
              <strong>🎡 돌림판</strong> — 선택지를 최대 8개까지 입력하고 룰렛처럼 돌려서 결과를 뽑습니다.
              항목별로 색상이 자동 배정되며 원하는 만큼 항목을 추가·삭제할 수 있습니다.<br />
              <strong>🎲 주사위</strong> — 1~5개의 주사위를 동시에 굴릴 수 있습니다. 보드게임, RPG, 내기 등 다양한 상황에 활용하세요.<br />
              <strong>🎴 제비뽑기</strong> — 전체 인원과 당첨 인원을 설정하면 카드가 무작위로 배치됩니다. 카드를 클릭해 하나씩 뒤집어 당첨 여부를 확인하세요.<br />
              <strong>🏹 화살표 돌리기</strong> — 8개 구역으로 나뉜 원판 위에서 화살표가 빠르게 회전한 뒤 멈추는 곳이 결과입니다. 직접 입력 모드로 구역 이름을 변경할 수 있습니다.
            </p>

            <h2 className={s.seo_h2}>이럴 때 사용하세요</h2>
            <p className={s.seo_p}>
              점심 메뉴·카페 선택, 팀 프로젝트 역할 분담, 게임 플레이 순서, 벌칙 미션 뽑기, 여행지·숙소 결정, 스터디 발표 순서 등
              결정이 필요한 모든 상황에서 누구나 납득할 수 있는 공정한 결과를 얻을 수 있습니다.
              모바일에서도 완벽하게 동작하므로 모임 현장에서 즉석으로 사용하기 좋습니다.
            </p>

            <h2 className={s.seo_h2}>자주 묻는 질문 (FAQ)</h2>
            <div className={s.seo_faq_item}>
              <div className={s.seo_faq_q}><span>Q.</span><span>결과가 진짜 무작위인가요?</span></div>
              <p className={s.seo_faq_a}>
                네. 돌림판·화살표·주사위는 JavaScript의 <code>Math.random()</code> 기반 암호학적으로 안전한 의사난수를 사용하며,
                사다리 가로대와 제비뽑기 당첨 위치도 매 생성 시 무작위로 결정됩니다.
                동일한 결과가 반복되지 않도록 설계되어 있어 공정한 추첨 도구로 활용하기에 적합합니다.
              </p>
            </div>
            <div className={s.seo_faq_item}>
              <div className={s.seo_faq_q}><span>Q.</span><span>로그인이나 설치가 필요한가요?</span></div>
              <p className={s.seo_faq_a}>
                아니요. 회원가입·로그인·앱 설치 모두 필요 없습니다. 브라우저에서 바로 사용할 수 있으며,
                입력한 이름이나 선택지 데이터는 서버로 전송되지 않고 기기 내에서만 처리됩니다.
                개인정보 걱정 없이 편하게 사용하세요.
              </p>
            </div>
            <div className={s.seo_faq_item}>
              <div className={s.seo_faq_q}><span>Q.</span><span>사다리 타기 결과를 미리 알 수 있나요?</span></div>
              <p className={s.seo_faq_a}>
                아니요. 사다리 가로대는 "사다리 생성" 버튼을 누를 때마다 완전히 새롭게 무작위 생성됩니다.
                개별 경로는 GO 버튼으로 한 명씩 공개하거나, "전체 공개" 버튼으로 한 번에 모든 결과를 확인할 수 있습니다.
              </p>
            </div>
            <div className={s.seo_faq_item}>
              <div className={s.seo_faq_q}><span>Q.</span><span>모바일에서도 잘 되나요?</span></div>
              <p className={s.seo_faq_a}>
                네. 모든 모드는 모바일 화면에 최적화되어 있습니다. 사다리 타기 캔버스는 화면 너비에 맞게 자동 조절되며,
                돌림판과 화살표는 터치 입력도 원활하게 동작합니다. iOS Safari 및 Android Chrome 모두 지원합니다.
              </p>
            </div>

            <div className={s.disclaimer}>
              ⚠️ 이 도구의 모든 결과는 순수 오락·편의 목적의 랜덤 생성값으로, 법적 효력이 없습니다.
              중요한 결정은 반드시 당사자 간 합의를 통해 이루어져야 합니다.
            </div>
          </>
        ) : (
          <>
            <h2 className={s.seo_h2}>What is Decision Master?</h2>
            <p className={s.seo_p}>
              Decision Master is a free, browser-based 5-in-1 random decision toolkit designed to make everyday choices fun and fair.
              Whether you need to pick a lunch spot, assign team roles, or settle a bet, the five built-in modes — Ladder, Wheel, Dice, Draw, and Arrow — cover every scenario without any installation or sign-up required.
            </p>

            <h2 className={s.seo_h2}>Mode Overview</h2>
            <p className={s.seo_p}>
              <strong>🪜 Ladder</strong> — Enter 2–6 player names and prizes, generate a random ladder, then reveal paths one by one or all at once.<br />
              <strong>🎡 Wheel</strong> — Add up to 8 options and spin a colorful roulette wheel to land on a result.<br />
              <strong>🎲 Dice</strong> — Roll 1–5 dice simultaneously; great for board games, RPGs, and quick tiebreakers.<br />
              <strong>🎴 Draw</strong> — Set total participants and winners; click mystery cards to flip them and reveal who wins.<br />
              <strong>🏹 Arrow</strong> — An 8-sector dial with a spinning arrow; customize sector labels for personalized results.
            </p>

            <h2 className={s.seo_h2}>Frequently Asked Questions</h2>
            <div className={s.seo_faq_item}>
              <div className={s.seo_faq_q}><span>Q.</span><span>Are the results truly random?</span></div>
              <p className={s.seo_faq_a}>
                Yes. All modes use JavaScript's cryptographically-seeded <code>Math.random()</code> for unbiased results. Ladder bridges, wheel spin angles, and draw positions are all regenerated fresh each time, ensuring no predictable patterns.
              </p>
            </div>
            <div className={s.seo_faq_item}>
              <div className={s.seo_faq_q}><span>Q.</span><span>Is any data sent to a server?</span></div>
              <p className={s.seo_faq_a}>
                No. Everything runs entirely in your browser. Names, labels, and results never leave your device. There are no accounts, no tracking, and no data storage.
              </p>
            </div>
            <div className={s.seo_faq_item}>
              <div className={s.seo_faq_q}><span>Q.</span><span>Does it work on mobile?</span></div>
              <p className={s.seo_faq_a}>
                Yes. All five modes are fully responsive and touch-friendly. The ladder canvas scales to fit the screen, and the wheel and arrow modes respond smoothly to touch input on iOS Safari and Android Chrome.
              </p>
            </div>
            <div className={s.seo_faq_item}>
              <div className={s.seo_faq_q}><span>Q.</span><span>Can I use this for official draws or giveaways?</span></div>
              <p className={s.seo_faq_a}>
                This tool is designed for fun and convenience. While the randomness is genuine, it has not been audited for official lottery or legal proceedings. For legally binding draws, consult a certified random draw service.
              </p>
            </div>

            <div className={s.disclaimer}>
              ⚠️ All results generated by this tool are for entertainment and convenience only and carry no legal weight. Important decisions should always be made through mutual agreement between all parties involved.
            </div>
          </>
        )}
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </div>
  );
}
