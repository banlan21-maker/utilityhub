'use client';

import { useId, useState } from 'react';
import { useLocale } from 'next-intl';
import { CornerDownRight, Copy } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  SIZES, fittingsFor, allowance, offsetCut, rollingOffset, centerToCut, FACTOR_TABLE, allowanceTable,
  type Standard, type Fitting, type Allowance,
} from '@/lib/elbowOffset';
import s from './elbow.module.css';

type Mode = 'offset' | 'rolling' | 'cut';
type End = 'none' | '90L' | '90S' | '45L';
const PAGE_URL = 'https://www.theutilhub.com/{locale}/utilities/utility/elbow-offset';

const dec = (raw: string) => {
  const [int, ...d] = raw.replace(/[^0-9.]/g, '').split('.');
  return d.length ? `${int}.${d.join('').slice(0, 2)}` : int;
};
const num = (v: string) => Number(v) || 0;

export default function ElbowOffsetClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const L = (ko: string, en: string) => (isKo ? ko : en);
  const f1 = (n: number, d = 1) => n.toLocaleString(isKo ? 'ko-KR' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const [std, setStd] = useState<Standard>('ks');
  const [size, setSize] = useState('50A');
  const [mode, setMode] = useState<Mode>('offset');
  const [fitting, setFitting] = useState<Fitting>('45L');
  const [cutAngleText, setCutAngleText] = useState('30');
  const [offsetText, setOffsetText] = useState('300');
  const [hText, setHText] = useState('200');
  const [vText, setVText] = useState('150');
  const [ccText, setCcText] = useState('1000');
  const [endA, setEndA] = useState<End>('90L');
  const [endB, setEndB] = useState<End>('90L');
  const [gap, setGap] = useState(0);
  const [copied, setCopied] = useState('');

  const STD_TEXT: Record<Standard, [string, string, string, string]> = {
    ks: ['KS 용접 엘보', 'KS B 1522 맞대기 용접', 'KS butt-weld', 'KS B 1522'],
    thread: ['KS 나사 엘보', 'KS B 1533 가단주철', 'KS threaded', 'KS B 1533 malleable'],
    asme: ['ASME 용접 엘보', 'B16.9 플랜트용', 'ASME butt-weld', 'B16.9'],
  };
  const FIT_TEXT: Record<Fitting, string> = {
    '90L': L('90° 장반경', '90° long radius'), '90S': L('90° 단반경', '90° short radius'),
    '45L': L('45° 장반경', '45° long radius'), cut: L('엘보 잘라 쓰기 (각도 지정)', 'Cut-down elbow (any angle)'),
  };
  const endName = (e: End) => (e === 'none' ? L('없음 (관 끝)', 'None (pipe end)') : FIT_TEXT[e]);

  // 규격·호칭이 바뀌면 쓸 수 없는 엘보를 정리한다
  const fits = fittingsFor(std, size);
  const pickStd = (st: Standard) => {
    setStd(st);
    if (!SIZES[st].includes(size)) setSize(SIZES[st].includes('50A') ? '50A' : SIZES[st][0]);
    if (st === 'thread') { setFitting('90L'); setEndA(e => (e === 'none' ? e : '90L')); setEndB(e => (e === 'none' ? e : '90L')); }
  };
  const fit: Fitting = fits.includes(fitting) ? fitting : fits[0] ?? '90L';
  const cutAngle = num(cutAngleText);
  const al = allowance(std, size, fit, cutAngle);
  const endAl = (e: End) => (e === 'none' ? null : allowance(std, size, fittingsFor(std, size).includes(e) ? e : '90L'));
  const endOptions: End[] = ['none', ...(fittingsFor(std, size).filter(f => f !== 'cut') as End[])];

  const roll = mode === 'rolling' ? rollingOffset(num(hText), num(vText)) : null;
  const offsetValue = mode === 'offset' ? num(offsetText) : roll?.trueOffset ?? 0;
  const res = mode !== 'cut' && al ? offsetCut(offsetValue, al, std, gap) : null;
  const cc = mode === 'cut' ? centerToCut(num(ccText), [endAl(endA), endAl(endB)], std, gap) : null;
  const cutValue = res?.cut ?? cc?.cut ?? null;
  const tooShort = cutValue !== null && cutValue <= 0;

  const copy = async () => {
    if (cutValue === null || tooShort) return;
    const head = `${STD_TEXT[std][isKo ? 0 : 2]} ${size}`;
    const body = res
      ? L(`${FIT_TEXT[fit]}${fit === 'cut' ? ` ${cutAngle}°` : ''}, 옵셋 ${f1(offsetValue)}mm\n빗변(심-심) ${f1(res.travel)} / 전진 ${f1(res.run)} / 엘보값 ${f1(res.allowance)} × 2${res.gapTotal ? ` / 갭 ${f1(res.gapTotal)}` : ''}\n절단 길이 ${f1(cutValue)}mm`,
        `${FIT_TEXT[fit]}, offset ${f1(offsetValue)} mm\nTravel ${f1(res.travel)} / run ${f1(res.run)} / allowance ${f1(res.allowance)} × 2\nCut ${f1(cutValue)} mm`)
      : L(`심-심 ${f1(cc!.cc)}mm − 엘보값 ${f1(cc!.allow)}${cc!.gapTotal ? ` − 갭 ${f1(cc!.gapTotal)}` : ''}\n절단 길이 ${f1(cutValue)}mm`,
        `C-C ${f1(cc!.cc)} − ${f1(cc!.allow)}\nCut ${f1(cutValue)} mm`);
    try { await navigator.clipboard.writeText(`${head}\n${body}\n${PAGE_URL.replace('{locale}', locale)}`); setCopied(L('✓ 복사했습니다', '✓ Copied')); }
    catch { setCopied(L('복사하지 못했습니다', 'Could not copy')); }
    setTimeout(() => setCopied(''), 2000);
  };

  const field = (id: string, label: string, sub: string, value: string, set: (v: string) => void, unit = 'mm') => (
    <div className={s.field}>
      <label className={s.field_label} htmlFor={id}>{label}{sub && <small>{sub}</small>}</label>
      <div className={s.input_wrap}>
        <input id={id} className={s.input} inputMode="decimal" value={value} onChange={e => set(dec(e.target.value))} />
        <span className={s.unit}>{unit}</span>
      </div>
    </div>
  );
  const chip = <T extends string | number>(cur: T, val: T, set: (v: T) => void, label: string, sub?: string) => (
    <button key={String(val)} type="button" aria-pressed={cur === val} className={`${s.chip} ${cur === val ? s.chip_on : ''}`} onClick={() => set(val)}>
      {label}{sub && <small>{sub}</small>}
    </button>
  );

  // ── 그림: 옵셋(실제 비율)
  const markers = (
    <defs>
      <marker id={`a${uid}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
        <path d="M0,0.8 L7,4 L0,7.2 Z" className={s.sv_arrow} />
      </marker>
    </defs>
  );
  const arrow = `url(#a${uid})`;

  const offsetSvg = () => {
    if (!res || !al) return null;
    const th = (res.angle * Math.PI) / 180;
    // 오른쪽 90px은 옵셋 치수 글자 자리
    const W = 210, H = 140, lead = 40;
    const k = Math.min(H / offsetValue, res.run > 0 ? W / res.run : Infinity);
    const runPx = res.run * k, offPx = offsetValue * k;
    const x1 = 10 + lead + (W - runPx) / 2, y1 = 34;
    const x2 = x1 + runPx, y2 = y1 + offPx;
    const ux = Math.cos(th), uy = Math.sin(th);
    const aPx = Math.max(res.allowance * k, 5);
    const ax1 = x1 + ux * aPx, ay1 = y1 + uy * aPx, ax2 = x2 - ux * aPx, ay2 = y2 - uy * aPx;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    return (
      <svg viewBox="0 0 400 230" role="img" aria-label={L('옵셋 배관 그림', 'Offset sketch')}>
        {markers}
        <polyline points={`${x1 - lead},${y1} ${x1},${y1} ${x2},${y2} ${x2 + lead},${y2}`} className={s.sv_pipe} />
        <line x1={x1} y1={y1} x2={ax1} y2={ay1} className={s.sv_allow} />
        <line x1={ax2} y1={ay2} x2={x2} y2={y2} className={s.sv_allow} />
        <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} className={s.sv_cut} />
        <circle cx={x1} cy={y1} r={4} className={s.sv_dot} />
        <circle cx={x2} cy={y2} r={4} className={s.sv_dot} />
        {/* 옵셋 */}
        <line x1={x2 + lead + 4} y1={y1} x2={x2 + lead + 22} y2={y1} className={s.sv_ext} />
        <line x1={x2 + lead + 18} y1={y1} x2={x2 + lead + 18} y2={y2} className={s.sv_dim} markerStart={arrow} markerEnd={arrow} />
        <text x={x2 + lead + 22} y={(y1 + y2) / 2 + 4} className={s.sv_text}>{L('옵셋', 'Offset')} {f1(offsetValue, 0)}</text>
        {/* 전진 */}
        {res.run > 0.5 && <>
          <line x1={x1} y1={y2 + 10} x2={x1} y2={y2 + 30} className={s.sv_ext} />
          <line x1={x1} y1={y2 + 26} x2={x2} y2={y2 + 26} className={s.sv_dim} markerStart={arrow} markerEnd={arrow} />
          <text x={(x1 + x2) / 2} y={y2 + 42} textAnchor="middle" className={s.sv_text}>{L('전진', 'Run')} {f1(res.run, 0)}</text>
        </>}
        {/* 빗변·절단 */}
        <text x={mx + 10} y={my - 8} className={s.sv_text_cut}>✂ {f1(res.cut)}</text>
        <text x={mx + 10} y={my + 8} className={s.sv_muted}>{L('빗변(심-심)', 'Travel')} {f1(res.travel, 0)}</text>
        <text x={x1 - lead} y={y1 - 12} className={s.sv_muted}>{L('엘보 중심', 'Elbow centre')}</text>
      </svg>
    );
  };

  const rollSvg = () => {
    if (!roll) return null;
    const Hm = num(hText), Vm = num(vText);
    const k = Math.min(150 / Math.max(Hm, 1), 110 / Math.max(Vm, 1));
    const x0 = 60, y0 = 140, xh = x0 + Hm * k, yv = y0 - Vm * k;
    return (
      <svg viewBox="0 0 400 170" role="img" aria-label={L('단면에서 본 옵셋', 'End view of the roll')}>
        {markers}
        <polyline points={`${x0},${y0} ${xh},${y0} ${xh},${yv}`} className={s.sv_ext} fill="none" />
        <line x1={x0} y1={y0} x2={xh} y2={yv} className={s.sv_cut} />
        <circle cx={x0} cy={y0} r={4} className={s.sv_dot} /><circle cx={xh} cy={yv} r={4} className={s.sv_dot} />
        <text x={(x0 + xh) / 2} y={y0 + 18} textAnchor="middle" className={s.sv_text}>{L('가로', 'Horizontal')} {f1(Hm, 0)}</text>
        <text x={xh + 8} y={(y0 + yv) / 2 + 4} className={s.sv_text}>{L('세로', 'Vertical')} {f1(Vm, 0)}</text>
        <text x={(x0 + xh) / 2 - 10} y={(y0 + yv) / 2 - 8} textAnchor="end" className={s.sv_text_cut}>{L('실제 옵셋', 'True offset')} {f1(roll.trueOffset, 0)}</text>
        <text x={x0 + 26} y={y0 - 6} className={s.sv_muted}>{f1(roll.rollAngle)}°</text>
        <text x={240} y={30} className={s.sv_muted}>{L('배관 진행 방향에서 본 단면', 'Looking along the pipe')}</text>
      </svg>
    );
  };

  const ccSvg = () => {
    if (!cc) return null;
    const a = endAl(endA), b = endAl(endB);
    const x1 = 40, x2 = 360, y = 90;
    const k = (x2 - x1) / cc.cc;
    const aPx = a ? Math.max(a.value * k, 6) : 0, bPx = b ? Math.max(b.value * k, 6) : 0;
    return (
      <svg viewBox="0 0 400 150" role="img" aria-label={L('심-심 치수 그림', 'Centre-to-centre sketch')}>
        {markers}
        <line x1={x1} y1={y} x2={x2} y2={y} className={s.sv_pipe} />
        {a && <line x1={x1} y1={y} x2={x1 + aPx} y2={y} className={s.sv_allow} />}
        {b && <line x1={x2 - bPx} y1={y} x2={x2} y2={y} className={s.sv_allow} />}
        <line x1={x1 + aPx} y1={y} x2={x2 - bPx} y2={y} className={s.sv_cut} />
        {a && <circle cx={x1} cy={y} r={4} className={s.sv_dot} />}
        {b && <circle cx={x2} cy={y} r={4} className={s.sv_dot} />}
        <line x1={x1} y1={40} x2={x2} y2={40} className={s.sv_dim} markerStart={arrow} markerEnd={arrow} />
        <text x={200} y={34} textAnchor="middle" className={s.sv_text}>{L('심-심', 'C-C')} {f1(cc.cc, 0)}</text>
        <text x={200} y={120} textAnchor="middle" className={s.sv_text_cut}>✂ {f1(cc.cut)}</text>
        <text x={x1} y={138} className={s.sv_muted}>{endName(endA)}</text>
        <text x={x2} y={138} textAnchor="end" className={s.sv_muted}>{endName(endB)}</text>
      </svg>
    );
  };

  const allowanceRow = (label: string, a: Allowance | null) => a && (
    <div className={s.row}>
      <span>{label}
        <small>{std === 'thread' && a.centerToEnd ? L(`중심~끝 ${a.centerToEnd} − 나사 물림 ${a.engagement}`, `centre-to-end ${a.centerToEnd} − engagement ${a.engagement}`)
          : a.radius ? L(`굽힘 반경 ${a.radius} × tan(${a.angle}°/2)`, `radius ${a.radius} × tan(${a.angle}°/2)`) : L('표준 치수표 값', 'standard table value')}</small></span>
      <strong>{f1(a.value)} mm</strong>
    </div>
  );

  const table = allowanceTable(std);
  const titleStr = L('배관 옵셋·절단 길이 계산기', 'Pipe Offset & Cut Length Calculator');
  const descStr = L('엘보값(뺄길이)을 자동으로 빼서 옵셋·45도·롤링 옵셋과 심-심 치수의 파이프 절단 길이를 계산합니다. KS 용접·나사 엘보와 ASME 엘보를 지원합니다.', 'Cut lengths for offsets, 45° and rolling offsets and centre-to-centre runs, with elbow allowances for KS butt-weld, KS threaded and ASME fittings.');

  return (
    <div className={s.container}>
      <NavigationActions />

      <header className={s.header}>
        <div className={s.icon_wrap}><CornerDownRight size={40} /></div>
        <h1 className={s.title}>{titleStr}</h1>
        <p className={s.subtitle}>{descStr}</p>
      </header>

      <section className={s.card}>
        <h2 className={s.card_title}>{L('1. 엘보 규격과 호칭', '1. Fitting standard and size')}</h2>
        <div className={s.chips}>{(['ks', 'thread', 'asme'] as Standard[]).map(st => chip(std, st, pickStd, STD_TEXT[st][isKo ? 0 : 2], STD_TEXT[st][isKo ? 1 : 3]))}</div>
        <div className={s.size_grid}>{SIZES[std].map(z => chip(size, z, setSize, z))}</div>
        <p className={s.hint}>{std === 'thread'
          ? L('나사 엘보는 중심~끝 치수에서 파이프가 나사로 물려 들어가는 길이를 뺀 값을 엘보값으로 씁니다(90° 엘보 기준).', 'Threaded allowance = centre-to-end minus thread engagement (90° elbows).')
          : std === 'asme' ? L('ASME B16.9은 외경이 KS와 다른 미국 규격 배관(플랜트·ASTM 관)용입니다. 국내 일반 현장은 KS 용접 엘보를 고르세요.', 'ASME B16.9 is for ASME pipe; Korean building work normally uses KS fittings.')
            : L('국내에서 쓰는 KS B 1522(JIS B 2312) 맞대기 용접 엘보 치수입니다. 45°는 ASME와 크게 달라 50A에서 엘보 1개당 3.4mm 차이가 납니다.', 'KS B 1522 (JIS B 2312) butt-weld fittings used in Korea. 45° values differ from ASME by 3.4 mm per elbow at 50A.')}</p>
      </section>

      <div className={s.tabs} role="tablist">
        {([
          ['offset', L('옵셋', 'Offset'), L('한 방향으로 비켜 가기', 'one direction')],
          ['rolling', L('가로+세로 옵셋', 'Rolling offset'), L('대각선으로 비켜 가기', 'two directions')],
          ['cut', L('심-심 → 절단 길이', 'C-C → cut'), L('두 이음쇠 사이', 'between fittings')],
        ] as [Mode, string, string][]).map(([k, t, sub]) => (
          <button key={k} type="button" role="tab" aria-selected={mode === k} className={`${s.tab} ${mode === k ? s.tab_on : ''}`} onClick={() => setMode(k)}>
            {t}<small>{sub}</small>
          </button>
        ))}
      </div>

      <section className={s.card}>
        <h2 className={s.card_title}>{L('2. 치수 입력', '2. Dimensions')}</h2>
        {mode !== 'cut' ? (
          <>
            <div>
              <span className={s.label}>{L('엘보 종류 (양쪽 같은 엘보)', 'Elbow (same at both ends)')}</span>
              <div className={s.chips}>{fits.map(fv => chip(fit, fv, setFitting, FIT_TEXT[fv]))}</div>
            </div>
            {fit === 'cut' && (
              <div>
                <div className={s.chips}>{['11.25', '22.5', '30', '60'].map(a => chip(cutAngleText, a, setCutAngleText, `${a}°`))}</div>
                <div style={{ maxWidth: 220, marginTop: '0.5rem' }}>{field('eo-ang', L('엘보 각도', 'Elbow angle'), L('90° 장반경 엘보를 잘라 만든 각도', 'cut from a 90° long-radius elbow'), cutAngleText, setCutAngleText, '°')}</div>
              </div>
            )}
            {mode === 'offset'
              ? field('eo-off', L('옵셋 (비켜 갈 거리)', 'Offset'), L('두 배관 중심선 사이 거리', 'centreline to centreline'), offsetText, setOffsetText)
              : (
                <div className={s.grid2}>
                  {field('eo-h', L('가로 옵셋', 'Horizontal offset'), L('옆으로 비켜 갈 거리', 'sideways'), hText, setHText)}
                  {field('eo-v', L('세로 옵셋', 'Vertical offset'), L('위·아래로 비켜 갈 거리', 'up or down'), vText, setVText)}
                </div>
              )}
          </>
        ) : (
          <>
            {field('eo-cc', L('심-심 치수', 'Centre-to-centre'), L('양쪽 이음쇠 중심 사이 거리 (도면 치수)', 'between fitting centres'), ccText, setCcText)}
            <div className={s.grid2}>
              {([['A', endA, setEndA], ['B', endB, setEndB]] as [string, End, (e: End) => void][]).map(([n, val, set]) => (
                <div key={n} className={s.field}>
                  <span className={s.field_label}>{L(`${n}쪽 끝`, `End ${n}`)}</span>
                  <select className={s.select} value={endOptions.includes(val) ? val : '90L'} onChange={e => set(e.target.value as End)} aria-label={L(`${n}쪽 끝`, `End ${n}`)}>
                    {endOptions.map(o => <option key={o} value={o}>{endName(o)}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </>
        )}
        {std !== 'thread' && (
          <div>
            <span className={s.label}>{L('용접 갭 (이음 1곳당)', 'Weld root gap (per joint)')}</span>
            <div className={s.chips}>{[0, 1.5, 2, 3].map(g => chip(gap, g, setGap, `${g}mm`))}</div>
          </div>
        )}
      </section>

      <section className={s.card} aria-live="polite">
        <h2 className={s.card_title}>{L('3. 결과', '3. Result')}</h2>
        {cutValue === null ? <p className={s.hint}>{L('치수를 넣으면 결과가 나옵니다.', 'Enter dimensions to see the result.')}</p> : (
          <>
            <div className={s.hero}>
              <div className={s.hero_label}>{L('파이프 절단 길이', 'Pipe cut length')}</div>
              <div className={s.hero_num}>{tooShort ? '—' : f1(cutValue)}<span className={s.hero_unit}>mm</span></div>
              <div className={s.hero_sub}>{STD_TEXT[std][isKo ? 0 : 2]} {size}{mode !== 'cut' ? ` · ${FIT_TEXT[fit]}${fit === 'cut' ? ` ${cutAngle}°` : ''}` : ''}</div>
            </div>
            {tooShort && (
              <div className={s.warn}>{res
                ? L(`옵셋이 너무 작아 엘보끼리 맞붙습니다. 이 엘보로는 옵셋이 최소 ${f1(res.minOffset)}mm 이상이어야 합니다. 각도가 작은 엘보(45° 등)를 쓰거나 엘보를 직접 맞대세요.`, `Offset too small: at least ${f1(res.minOffset)} mm is needed with this elbow.`)
                : L('심-심 치수가 엘보값 합보다 작습니다. 이음쇠끼리 직접 맞대야 하는 거리입니다.', 'The C-C distance is shorter than the fitting allowances.')}</div>
            )}
            <div className={s.rows}>
              {res && <>
                {roll && <div className={s.row}><span>{L('실제 옵셋', 'True offset')}<small>√({L('가로', 'H')}² + {L('세로', 'V')}²), {L('기울일 각도', 'roll')} {f1(roll.rollAngle)}°</small></span><strong>{f1(roll.trueOffset)} mm</strong></div>}
                <div className={s.row}><span>{L('빗변 (엘보 중심~중심)', 'Travel (centre to centre)')}<small>{L(`옵셋 × ${res.factor.toFixed(3)}`, `offset × ${res.factor.toFixed(3)}`)}</small></span><strong>{f1(res.travel)} mm</strong></div>
                <div className={s.row}><span>{L('전진 거리', 'Run (advance)')}<small>{L('배관 진행 방향으로 나아가는 거리', 'along the main run')}</small></span><strong>{f1(res.run)} mm</strong></div>
                {allowanceRow(L('엘보값 (1개)', 'Elbow allowance (each)'), al)}
                <div className={s.row}><span>{L('빼는 길이 합계', 'Total deducted')}<small>{L(`엘보값 × 2${res.gapTotal ? ` + 갭 ${gap}mm × 2` : ''}`, `allowance × 2${res.gapTotal ? ` + gap × 2` : ''}`)}</small></span><strong>{f1(2 * res.allowance + res.gapTotal)} mm</strong></div>
              </>}
              {cc && <>
                {allowanceRow(L('A쪽 엘보값', 'End A allowance'), endAl(endA))}
                {allowanceRow(L('B쪽 엘보값', 'End B allowance'), endAl(endB))}
                {cc.gapTotal > 0 && <div className={s.row}><span>{L('용접 갭', 'Weld gaps')}<small>{L(`${gap}mm × ${cc.joints}곳`, `${gap} mm × ${cc.joints}`)}</small></span><strong>{f1(cc.gapTotal)} mm</strong></div>}
              </>}
              <div className={`${s.row} ${s.row_em}`}><span>{L('절단 길이', 'Cut length')}</span><strong>{f1(cutValue)} mm</strong></div>
            </div>
            {!tooShort && (
              <div className={s.viz}>
                {mode === 'cut' ? ccSvg() : <>{mode === 'rolling' && rollSvg()}{offsetSvg()}</>}
                <div className={s.legend}>
                  <span><i style={{ background: 'var(--eo-cut)' }} />{L('자를 파이프', 'Pipe to cut')}</span>
                  <span><i style={{ background: 'var(--eo-allow)' }} />{L('엘보값 (이음쇠가 차지하는 길이)', 'Fitting allowance')}</span>
                  <span><i style={{ background: 'var(--eo-pipe)' }} />{L('앞뒤 배관', 'Adjoining pipe')}</span>
                </div>
              </div>
            )}
            {!tooShort && <button type="button" className={s.btn} onClick={copy}><Copy size={16} />{copied || L('결과 복사', 'Copy')}</button>}
            <p className={s.hint}>{L('엘보값은 표준 치수표 값이라 제조사마다 1~2mm 차이가 날 수 있습니다. 첫 이음은 실물 엘보를 재서 확인하세요.', 'Fittings vary by 1–2 mm between makers; measure the first one.')}</p>
          </>
        )}
      </section>

      <section className={s.card}>
        <h2 className={s.card_title}>{L(`엘보값 표 — ${STD_TEXT[std][0]}`, `Allowance table — ${STD_TEXT[std][2]}`)}</h2>
        <div className={s.table_wrap}>
          <table className={s.table}>
            <thead>
              {std === 'thread'
                ? <tr><th>{L('호칭', 'Size')}</th><th>{L('중심~끝', 'Centre-end')}</th><th>{L('나사 물림', 'Engagement')}</th><th>{L('엘보값(빼는 값)', 'Allowance')}</th></tr>
                : <tr><th>{L('호칭', 'Size')}</th><th>{L('90° 장반경', '90° LR')}</th><th>{L('90° 단반경', '90° SR')}</th><th>{L('45° 장반경', '45° LR')}</th></tr>}
            </thead>
            <tbody>
              {table.map(r => (
                <tr key={r.size} className={r.size === size ? s.row_on : ''}>
                  <td>{r.size}</td>
                  {std === 'thread'
                    ? <><td>{r.thread?.centerToEnd}</td><td>{r.thread?.engagement}</td><td>{r.thread?.value}</td></>
                    : <><td>{r.l90 ?? '-'}</td><td>{r.s90 ?? '-'}</td><td>{r.l45 ?? '-'}</td></>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <span className={s.label}>{L('각도별 옵셋 배수 (암산용)', 'Offset multipliers')}</span>
        <div className={s.table_wrap}>
          <table className={s.table}>
            <thead><tr><th>{L('엘보 각도', 'Angle')}</th><th>{L('빗변 = 옵셋 ×', 'Travel = offset ×')}</th><th>{L('전진 = 옵셋 ×', 'Run = offset ×')}</th></tr></thead>
            <tbody>{FACTOR_TABLE.map(r => <tr key={r.angle}><td>{r.angle}°</td><td>{r.travel.toFixed(3)}</td><td>{r.run.toFixed(3)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <p className={s.disclaimer}>{L('치수는 KS B 1522·KS B 1533(JIS B 2312·B 2301)과 ASME B16.9 치수표를 옮긴 값입니다. 현장 참고용이며 중요한 배관은 실측으로 확인하세요.', 'Dimensions are transcribed from KS (JIS) and ASME tables; verify on site.')}</p>

      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utilities/utility/elbow-offset" />
      <div className={s.ad_slot}>AD</div>

      <SeoSection
        ko={{
          title: '배관 옵셋·절단 길이 계산: 엘보값(뺄길이) 자동',
          description: '배관을 꺾어 장애물을 비켜 갈 때 엘보 사이에 들어갈 파이프는 옵셋 거리 그대로 자르면 안 됩니다. 엘보 자체가 길이를 차지하기 때문에, 엘보 중심에서 끝 단면까지의 엘보값(뺄길이, 영문 도면의 Take-off)을 양쪽에서 빼야 합니다. 이 계산기는 국내에서 쓰는 KS B 1522(JIS B 2312) 맞대기 용접 엘보, KS B 1533(JIS B 2301) 나사식 가단주철 엘보, 플랜트용 ASME B16.9 엘보의 엘보값을 호칭별로 넣어 두고, 옵셋 거리만 입력하면 빗변(심-심 길이), 전진 거리, 절단 길이를 계산합니다. 예를 들어 50A 용접 엘보로 300mm 옵셋을 하면 90°는 300 − 76.2 × 2 = 147.6mm, 45°는 빗변 424.3mm에서 31.6mm씩 빼 361.1mm를 자릅니다. 나사 엘보는 중심~끝 치수에서 나사 물림 길이를 뺀 값을 빼므로 25A는 엘보 하나에 23mm입니다. 가로와 세로로 동시에 비켜 가는 롤링 옵셋, 장반경 엘보를 22.5°·30°처럼 잘라 쓰는 경우, 용접 갭, 도면의 심-심 치수에서 양 끝 이음쇠를 빼는 계산도 할 수 있고, 실제 비율 그림과 엘보값 표, 각도별 옵셋 배수표를 함께 보여 줍니다.',
          useCases: [
            { icon: '🔧', title: '보·배관 피해 옵셋', desc: '앞을 막는 보나 다른 배관을 300mm 비켜 갈 때 호칭과 엘보만 고르면, 엘보 사이 파이프를 몇 mm로 잘라야 하는지와 앞으로 얼마나 나아가는지(전진 거리)를 바로 확인합니다.' },
            { icon: '🔩', title: '나사 배관 절단', desc: '15A~50A 급수·소화 나사 배관은 엘보 중심~끝 치수에서 나사 물림을 뺀 값을 빼야 합니다. 25A는 38 − 15 = 23mm로, 용접 엘보 값(38.1mm)을 쓰면 옵셋 하나에 30mm가 짧아집니다.' },
            { icon: '📐', title: '도면 심-심 치수를 실치수로', desc: '도면에 적힌 이음쇠 중심 간 치수에서 양 끝 엘보값과 용접 갭을 빼 실제로 자를 길이를 구합니다. 한쪽이 관 끝이면 그쪽은 빼지 않습니다.' },
            { icon: '🧭', title: '가로+세로 롤링 옵셋', desc: '옆으로 200mm, 위로 150mm를 동시에 비켜 가면 실제 옵셋은 250mm이고, 45° 엘보면 빗변 353.6mm에서 엘보값을 빼 자릅니다. 배관을 기울일 각도도 함께 알려 줍니다.' },
          ],
          steps: [
            { step: '엘보 규격·호칭 고르기', desc: 'KS 용접 엘보(국내 일반), KS 나사 엘보(가단주철), ASME 용접 엘보(플랜트) 중에서 고르고 15A~300A 호칭을 누릅니다. 아래 표에서 그 규격의 엘보값을 한눈에 볼 수 있습니다.' },
            { step: '계산 종류 고르기', desc: '한 방향으로 비켜 가면 "옵셋", 가로와 세로로 동시에 비켜 가면 "가로+세로 옵셋", 도면 치수에서 자를 길이를 구하려면 "심-심 → 절단 길이"를 고릅니다.' },
            { step: '엘보와 치수 넣기', desc: '90°·45° 엘보나 잘라 쓰는 각도를 고르고 옵셋 거리(또는 심-심 치수)를 mm로 넣습니다. 맞대기 용접이면 이음마다 두는 용접 갭도 고릅니다.' },
            { step: '절단 길이 확인', desc: '절단 길이와 빗변, 전진 거리, 빼는 길이 합계를 확인하고, 실제 비율 그림에서 자를 부분(파란색)과 엘보값(노란색)을 봅니다. 결과 복사로 작업 메모를 남깁니다.' },
          ],
          faqs: [
            { q: '엘보값(뺄길이)이 정확히 무엇인가요?', a: '엘보 양쪽 배관 중심선이 만나는 점(엘보 중심)에서 엘보 끝 단면까지의 거리입니다. 도면의 치수와 옵셋은 모두 중심선 기준이라, 실제로 자를 파이프 길이는 그 거리에서 양쪽 엘보값을 빼야 나옵니다. 영문 도면에서는 Take-off 또는 Center-to-end라고 부릅니다.' },
            { q: '45° 옵셋에서 1.414는 어디서 나오나요?', a: '45° 엘보 두 개로 비켜 가면 옵셋, 전진 거리, 빗변이 직각이등변삼각형을 이루므로 빗변은 옵셋의 √2배, 약 1.414배입니다. 30°는 2배, 60°는 1.155배, 22.5°는 2.613배이며, 빗변에서 양쪽 엘보값을 빼야 절단 길이가 됩니다.' },
            { q: 'KS 엘보와 ASME 엘보 값이 다른가요?', a: '90° 장반경은 50A가 76.2mm와 76mm로 거의 같지만 45°는 KS가 31.6mm, ASME가 35mm로 차이가 큽니다. 25A 45°는 15.8mm와 22mm라 옵셋 하나에 12mm 넘게 달라지므로, 쓰는 이음쇠 규격을 꼭 맞춰 고르세요.' },
            { q: '나사 엘보는 왜 값이 다른가요?', a: '나사 이음은 파이프가 이음쇠 안으로 나사 물림 길이만큼 들어가므로, 중심~끝 치수에서 물림 길이를 뺀 값만 빼면 됩니다. KS B 1533 90° 엘보는 15A 27 − 11 = 16mm, 25A 38 − 15 = 23mm, 50A 57 − 20 = 37mm입니다.' },
          ],
        }}
        en={{
          title: 'Pipe offset and cut length with automatic fitting allowances',
          description: 'When a pipe is offset around an obstacle, the piece between the elbows is not cut to the offset distance, because each elbow takes up length. The fitting allowance (take-off, or centre-to-end) must be deducted at both ends. This calculator includes allowances for KS B 1522 (JIS B 2312) butt-weld elbows used in Korea, KS B 1533 (JIS B 2301) threaded malleable elbows and ASME B16.9 elbows, and turns an offset into travel, run and cut length. A 300 mm offset with 50A butt-weld elbows needs 147.6 mm of pipe with 90° elbows (300 − 2 × 76.2) and 361.1 mm with 45° elbows (424.3 − 2 × 31.6). Threaded elbows deduct centre-to-end minus thread engagement, 23 mm for 25A. It also handles rolling offsets, elbows cut to any angle, weld root gaps and centre-to-centre runs, with a scale drawing, allowance tables and offset multipliers.',
          useCases: [
            { icon: '🔧', title: 'Offset Around Obstacles', desc: 'Pick the size and elbow to get the cut length and how far the run advances.' },
            { icon: '🔩', title: 'Threaded Pipe', desc: 'Threaded fittings deduct centre-to-end minus engagement — 23 mm for 25A, not 38 mm.' },
            { icon: '📐', title: 'Drawing Dimensions', desc: 'Turn centre-to-centre dimensions into cut lengths by deducting both fittings and weld gaps.' },
            { icon: '🧭', title: 'Rolling Offsets', desc: '200 mm across and 150 mm up is a 250 mm true offset; the tool also gives the roll angle.' },
          ],
          steps: [
            { step: 'Pick Standard and Size', desc: 'KS butt-weld, KS threaded or ASME, 15A to 300A.' },
            { step: 'Pick a Calculation', desc: 'Offset, rolling offset or centre-to-centre to cut length.' },
            { step: 'Enter Elbow and Distance', desc: 'Choose 90°, 45° or a cut-down angle and enter the offset or C-C dimension, plus weld gap.' },
            { step: 'Read the Cut Length', desc: 'Check cut length, travel, run and deductions on the scale drawing, then copy.' },
          ],
          faqs: [
            { q: 'What is the fitting allowance?', a: 'The distance from the elbow centre, where the two centrelines meet, to the end face. Subtract it at both ends of the pipe.' },
            { q: 'Where does 1.414 come from?', a: 'With two 45° elbows the offset, run and travel form a right isosceles triangle, so travel is √2 × offset. 30° is 2.0, 60° 1.155, 22.5° 2.613.' },
            { q: 'Do KS and ASME elbows differ?', a: '90° long radius is nearly the same, but 45° differs: 50A is 31.6 mm in KS and 35 mm in ASME.' },
            { q: 'Why are threaded allowances smaller?', a: 'The pipe screws into the fitting by the engagement length, so only centre-to-end minus engagement is deducted.' },
          ],
        }}
      />
    </div>
  );
}
