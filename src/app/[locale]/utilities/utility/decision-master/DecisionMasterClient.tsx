'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './decision.module.css';
import { SEO_KO, SEO_EN } from './content';

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
  const [items, setItems] = useState(isKo ? ['선택지 1', '선택지 2', '선택지 3', '선택지 4'] : ['Option 1', 'Option 2', 'Option 3', 'Option 4']);
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
      // 칸은 위(0°)부터 시계 방향으로 그려진다. 판이 newRot°만큼 시계 방향으로 돌면
      // 위쪽 화살표 밑에 오는 지점은 판 기준 (−newRot)° → 그 칸이 당첨
      const normalized = (360 - (newRot % 360)) % 360;
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
    setWinSet(new Set(pool.slice(0, Math.min(winners, total - 1))));
    setRevealed(Array(total).fill(false));
    setDone(false);
  };

  // 인원·당첨 수가 바뀌면 카드를 다시 섞는다 (기존 동작 유지, 린트 오류만 억제)
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
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
            <button className={s.lot_cnt_btn} onClick={() => { const nt = Math.max(2, total - 1); setTotal(nt); setWinners(w => Math.min(w, nt - 1)); }}>−</button>
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
  const [names, setNames] = useState(isKo ? ['철수', '영희', '민준', '지아'] : ['Alex', 'Ben', 'Chris', 'Dana']);
  const [prizes, setPrizes] = useState(isKo ? ['1등', '2등', '꽝', '3등'] : ['1st', '2nd', 'Lose', '3rd']);
  const [runIdx, setRunIdx] = useState<number | null>(null);
  const [paths, setPaths] = useState<Array<Array<{ x: number; y: number }>>>([]);
  const [results, setResults] = useState<string[]>([]);
  /** landing[i] = 참가자 i가 도착한 결과 칸 번호 */
  const [landing, setLanding] = useState<number[]>([]);
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
    // 세로줄 양 끝 높이(0, ROWS-1)에는 가로줄을 두지 않는다 — 그림과 추적 결과가 어긋나지 않게
    for (let row = 1; row < ROWS - 1; row++) {
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
    setLanding([]);
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

  const tracePath = (startCol: number): { path: Array<{ x: number; y: number }>; col: number } => {
    const path: Array<{ x: number; y: number }> = [];
    let col = startCol;
    path.push({ x: colX(col), y: rowGap * 0.5 });
    path.push({ x: colX(col), y: rowY(0) });

    for (let row = 0; row < ROWS; row++) {
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
      if (row < ROWS - 1) path.push({ x: colX(col), y: rowY(row + 1) });
    }
    path.push({ x: colX(col), y: H - rowGap * 0.5 });
    return { path, col };
  };

  const runOne = (i: number) => {
    if (!generated) return;
    setRunIdx(i);
    const { path, col: finalCol } = tracePath(i);
    const newPaths = [...paths];
    newPaths[i] = path;
    setPaths(newPaths);
    const newResults = [...results];
    newResults[i] = prizes[finalCol] ?? `${finalCol + 1}`;
    setResults(newResults);
    const newLanding = [...landing];
    newLanding[i] = finalCol;
    setLanding(newLanding);
  };

  const runAllFn = () => {
    if (!generated) return;
    const allPaths: Array<Array<{ x: number; y: number }>> = [];
    const allResults: string[] = [];
    const allLanding: number[] = [];
    for (let i = 0; i < COLS; i++) {
      const { path, col: finalCol } = tracePath(i);
      allPaths.push(path);
      allResults.push(prizes[finalCol] ?? `${finalCol + 1}`);
      allLanding.push(finalCol);
    }
    setPaths(allPaths);
    setResults(allResults);
    setLanding(allLanding);
    setRunIdx(null);
    setRunAll(true);
  };

  const changeCount = (n: number) => {
    const c = Math.max(2, Math.min(MAX_LADDER, n));
    setCount(c);
    setNames(prev => {
      const def = isKo ? ['철수','영희','민준','지아','민호','수진'] : ['Alex','Ben','Chris','Dana','Eli','Fay'];
      return Array.from({ length: c }, (_, i) => prev[i] ?? def[i] ?? `P${i+1}`);
    });
    setPrizes(prev => {
      const def = isKo ? ['1등','2등','꽝','3등','꽝','4등'] : ['1st','2nd','Lose','3rd','Lose','4th'];
      return Array.from({ length: c }, (_, i) => prev[i] ?? def[i] ?? `${i+1}`);
    });
    setGenerated(false);
    setPaths([]);
    setResults([]);
    setLanding([]);
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
              {(() => {
                const who = landing.indexOf(i);
                if (who < 0 || !results[who]) return null;
                return (
                  <span style={{ fontSize: '0.72rem', color: '#8b5cf6', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    ← {names[who] ? names[who].slice(0, 4) : `P${who + 1}`}
                  </span>
                );
              })()}
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
        // 화살표는 0°에서 위를 가리키고, 칸도 위(0°)부터 시계 방향 → 가리키는 칸 = floor(각도 ÷ 칸 크기)
        const sectorIdx = Math.floor(norm / sectorDeg) % sectors.length;
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

export default function DecisionMasterClient() {
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
      <SeoSection ko={SEO_KO} en={SEO_EN} />
      <div className={s.disclaimer}>
        {isKo
          ? "⚠️ 이 도구의 모든 결과는 순수 오락·편의 목적의 랜덤 생성값으로, 법적 효력이 없습니다. 중요한 결정은 반드시 당사자 간 합의를 통해 이루어져야 합니다."
          : "⚠️ All results generated by this tool are for entertainment and convenience only and carry no legal weight. Important decisions should always be made through mutual agreement between all parties involved."}
      </div>
    </div>
  );
}
