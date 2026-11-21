'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { LayoutGrid, Copy } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  layRect, countByArea, tilesSavedByOpening, tileOrder, defaultPerBox, DIAGONAL_EXTRA,
  PAPERS, paperForRoom, paperByPyeong, SQM_PER_PYEONG,
  type TilePattern, type TileSpec, type Placed, type RollSpec,
} from '@/lib/interiorMaterial';
import s from './interior.module.css';
import { ui } from '@/app/components/ui';

type Tab = 'tile' | 'paper';
type TileMode = 'rect' | 'bath' | 'area';
type PaperMode = 'room' | 'pyeong';

const TILE_SIZES: [number, number][] = [[200, 200], [250, 400], [300, 300], [300, 600], [600, 600], [600, 1200]];
const PAGE_URL = 'https://www.theutilhub.com/{locale}/utilities/utility/interior-material-calc';

const dec = (raw: string) => {
  const [int, ...d] = raw.replace(/[^0-9.]/g, '').split('.');
  return d.length ? `${int}.${d.join('').slice(0, 3)}` : int;
};
const num = (v: string) => Number(v) || 0;

export default function InteriorMaterialCalcClient({ seo }: { seo?: React.ReactNode }) {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const L = (ko: string, en: string) => (isKo ? ko : en);
  const f1 = (n: number, d = 2) => n.toLocaleString(isKo ? 'ko-KR' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const int = (n: number) => n.toLocaleString(isKo ? 'ko-KR' : 'en-US');

  const [tab, setTab] = useState<Tab>('tile');
  const [copied, setCopied] = useState('');

  // ── 타일 입력
  const [tileMode, setTileMode] = useState<TileMode>('rect');
  const [rectW, setRectW] = useState('2.4');
  const [rectH, setRectH] = useState('1.8');
  const [bathW, setBathW] = useState('2.0');
  const [bathD, setBathD] = useState('1.6');
  const [bathH, setBathH] = useState('2.3');
  const [doorW, setDoorW] = useState('0.8');
  const [doorH, setDoorH] = useState('2.0');
  const [doorN, setDoorN] = useState('1');
  const [winW, setWinW] = useState('0.6');
  const [winH, setWinH] = useState('0.6');
  const [winN, setWinN] = useState('0');
  const [areaText, setAreaText] = useState('10');
  const [areaUnit, setAreaUnit] = useState<'m2' | 'py'>('m2');
  const [sizeIdx, setSizeIdx] = useState(4);
  const [customW, setCustomW] = useState('450');
  const [customH, setCustomH] = useState('900');
  const [gap, setGap] = useState('2');
  const [pattern, setPattern] = useState<TilePattern>('grid');
  const [landscape, setLandscape] = useState(true);
  const [tileSpare, setTileSpare] = useState(5);
  const [perBoxText, setPerBoxText] = useState('');

  // ── 도배 입력
  const [paperMode, setPaperMode] = useState<PaperMode>('room');
  const [roomW, setRoomW] = useState('3.6');
  const [roomD, setRoomD] = useState('3.0');
  const [roomH, setRoomH] = useState('2.3');
  const [ceiling, setCeiling] = useState(true);
  const [pDoorW, setPDoorW] = useState('0.9');
  const [pDoorH, setPDoorH] = useState('2.1');
  const [pDoorN, setPDoorN] = useState('1');
  const [pWinW, setPWinW] = useState('1.5');
  const [pWinH, setPWinH] = useState('1.2');
  const [pWinN, setPWinN] = useState('1');
  const [repeat, setRepeat] = useState('0');
  const [pyeongText, setPyeongText] = useState('32');
  const [pyBasis, setPyBasis] = useState<'supply' | 'exclusive'>('supply');
  const [paperIdx, setPaperIdx] = useState(0);
  const [rollWText, setRollWText] = useState('1.06');
  const [rollLText, setRollLText] = useState('15.6');
  const [paperSpare, setPaperSpare] = useState(5);

  // ── 타일 계산
  // 직사각형 타일은 가로로 길게(기본) 또는 세로로 길게 붙인다
  const [sw, sh] = sizeIdx < TILE_SIZES.length ? TILE_SIZES[sizeIdx] : [num(customW), num(customH)];
  const tile: TileSpec = landscape ? { w: Math.max(sw, sh), h: Math.min(sw, sh), gap: num(gap) } : { w: Math.min(sw, sh), h: Math.max(sw, sh), gap: num(gap) };
  const tileOk = tile.w > 0 && tile.h > 0;
  const perBox = perBoxText === '' ? (tileOk ? defaultPerBox(tile) : 1) : Math.max(1, Math.floor(num(perBoxText)));
  const door = { w: num(doorW), h: num(doorH), count: Math.floor(num(doorN)) };
  const win = { w: num(winW), h: num(winH), count: Math.floor(num(winN)) };

  let tilePieces = 0, tileArea = 0, cutPieces = 0, savedByOpenings = 0, tileErr = '';
  let rectLayout: Placed[] | null = null;
  let wallLayouts: { width: number; placed: Placed[] }[] | null = null;
  const diag = pattern === 'diagonal';
  if (tileOk) {
    if (tileMode === 'rect' && num(rectW) > 0 && num(rectH) > 0) {
      tileArea = num(rectW) * num(rectH);
      if (diag) tilePieces = Math.ceil(countByArea(tileArea, tile) * (1 + DIAGONAL_EXTRA));
      else {
        const r = layRect(num(rectW) * 1000, num(rectH) * 1000, tile, pattern);
        tilePieces = r.count; cutPieces = r.cut; rectLayout = r.truncated ? null : r.placed;
      }
    } else if (tileMode === 'bath' && num(bathW) > 0 && num(bathD) > 0 && num(bathH) > 0) {
      const walls = [num(bathW), num(bathD), num(bathW), num(bathD)];
      const openings = door.w * door.h * door.count + win.w * win.h * win.count;
      tileArea = 2 * (num(bathW) + num(bathD)) * num(bathH) - openings;
      if (tileArea <= 0) tileErr = L('문·창 면적이 벽 면적보다 큽니다.', 'Openings are larger than the walls.');
      savedByOpenings = tilesSavedByOpening(door, tile) + tilesSavedByOpening(win, tile);
      if (diag) tilePieces = Math.ceil(countByArea(tileArea, tile) * (1 + DIAGONAL_EXTRA));
      else {
        const lays = walls.map(w => layRect(w * 1000, num(bathH) * 1000, tile, pattern, 1500));
        tilePieces = Math.max(0, lays.reduce((sum, r) => sum + r.count, 0) - savedByOpenings);
        cutPieces = lays.reduce((sum, r) => sum + r.cut, 0);
        wallLayouts = lays.some(r => r.truncated) ? null : lays.map((r, i) => ({ width: walls[i], placed: r.placed }));
      }
    } else if (tileMode === 'area' && num(areaText) > 0) {
      tileArea = areaUnit === 'm2' ? num(areaText) : num(areaText) * SQM_PER_PYEONG;
      tilePieces = Math.ceil(countByArea(tileArea, tile) * (diag ? 1 + DIAGONAL_EXTRA : 1));
    }
  }
  const order = tilePieces > 0 && !tileErr ? tileOrder(tilePieces, tileArea, tile, tileSpare, perBox) : null;
  const patternName = (p: TilePattern) => ({
    grid: L('정자(바둑판)', 'Straight grid'), half: L('반장 엇갈림', '1/2 offset'), third: L('1/3 엇갈림', '1/3 offset'), diagonal: L('대각선 45°', 'Diagonal 45°'),
  })[p];

  // ── 도배 계산
  const roll: RollSpec = paperIdx < PAPERS.length ? PAPERS[paperIdx].roll : { width: num(rollWText), length: num(rollLText) };
  const room = paperMode === 'room'
    ? paperForRoom({
      width: num(roomW), depth: num(roomD), height: num(roomH), ceiling,
      doors: { w: num(pDoorW), h: num(pDoorH), count: Math.floor(num(pDoorN)) },
      windows: { w: num(pWinW), h: num(pWinH), count: Math.floor(num(pWinN)) },
      repeat: num(repeat),
    }, roll, paperSpare)
    : null;
  const roomRes = room && !('error' in room) ? room : null;
  const byPy = paperMode === 'pyeong' ? paperByPyeong(num(pyeongText), pyBasis, roll, paperSpare) : null;
  const paperName = paperIdx < PAPERS.length ? (isKo ? PAPERS[paperIdx].ko : PAPERS[paperIdx].en) : L(`직접 입력 (${roll.width}m × ${roll.length}m)`, `Custom (${roll.width} m × ${roll.length} m)`);

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(`${text}\n${PAGE_URL.replace('{locale}', locale)}`); setCopied(L('✓ 복사했습니다', '✓ Copied')); }
    catch { setCopied(L('복사하지 못했습니다', 'Could not copy')); }
    setTimeout(() => setCopied(''), 2000);
  };

  const field = (id: string, label: string, value: string, set: (v: string) => void, unit: string) => (
    <div className={ui.field}>
      <label className={ui.label} htmlFor={id}>{label}</label>
      <div className={ui.inputGroup}>
        <input id={id} className={ui.input} inputMode="decimal" value={value} onChange={e => set(dec(e.target.value))} />
        <span className={ui.unit}>{unit}</span>
      </div>
    </div>
  );
  const chip = <T extends string | number | boolean>(cur: T, val: T, set: (v: T) => void, label: string, sub?: string) => (
    <button key={String(val)} type="button" aria-pressed={cur === val} className={`${ui.chip} ${sub ? s.chip_sub : ''} ${cur === val ? ui.chipActive : ''}`} onClick={() => set(val)}>
      {label}{sub && <small>{sub}</small>}
    </button>
  );

  // ── 그림: 직사각형 한 면
  const drawLayout = (placed: Placed[], A: number, B: number, x0: number, y0: number, k: number, key: string) => (
    <g key={key}>
      <defs><clipPath id={`clip-${key}`}><rect x={x0} y={y0} width={A * k} height={B * k} /></clipPath></defs>
      <rect x={x0} y={y0} width={A * k} height={B * k} className={s.sv_area} />
      <g clipPath={`url(#clip-${key})`}>
        {placed.map((p, i) => (
          <rect key={i} x={x0 + p.x * k} y={y0 + (B - p.y - p.h) * k} width={p.w * k} height={p.h * k} className={p.cut ? s.sv_cut : s.sv_tile} />
        ))}
      </g>
    </g>
  );

  const tileViz = () => {
    if (tileMode === 'rect' && rectLayout) {
      const A = num(rectW) * 1000, B = num(rectH) * 1000;
      const k = Math.min(380 / A, 280 / B);
      return (
        <svg viewBox={`0 0 400 ${B * k + 40}`} role="img" aria-label={L('타일 배치도', 'Tile layout')}>
          {drawLayout(rectLayout, A, B, (400 - A * k) / 2, 10, k, 'rect')}
          <text x={200} y={B * k + 30} textAnchor="middle" className={s.sv_text}>{f1(num(rectW))} m × {f1(num(rectH))} m</text>
        </svg>
      );
    }
    if (tileMode === 'bath' && wallLayouts) {
      const H = num(bathH) * 1000;
      const total = wallLayouts.reduce((sum, w) => sum + w.width * 1000, 0) + 3 * 120;
      const k = Math.min(380 / total, 200 / H);
      let x = 10;
      return (
        <svg viewBox={`0 0 400 ${H * k + 46}`} role="img" aria-label={L('욕실 벽 펼친 그림', 'Unfolded bathroom walls')}>
          {wallLayouts.map((w, i) => {
            const A = w.width * 1000, x0 = x;
            x += A * k + 120 * k;
            return (
              <g key={i}>
                {drawLayout(w.placed, A, H, x0, 10, k, `w${i}`)}
                {i === 0 && door.count > 0 && <rect x={x0 + 200 * k} y={10 + (H - door.h * 1000) * k} width={door.w * 1000 * k} height={door.h * 1000 * k} className={s.sv_opening} />}
                {i === 1 && win.count > 0 && <rect x={x0 + (A - win.w * 1000) / 2 * k} y={10 + (H - 1000 - win.h * 1000) * k} width={win.w * 1000 * k} height={win.h * 1000 * k} className={s.sv_opening} />}
                <text x={x0 + (A * k) / 2} y={H * k + 26} textAnchor="middle" className={s.sv_muted}>{L(`벽${i + 1}`, `Wall ${i + 1}`)} {f1(w.width, 1)}m</text>
              </g>
            );
          })}
        </svg>
      );
    }
    return <p className={s.hint}>{diag ? L('대각선 시공은 면적 기준으로 계산하며 배치도는 생략합니다.', 'Diagonal layouts are counted by area; no drawing.') : tileMode === 'area' ? L('면적 직접 입력은 배치도 없이 면적으로만 계산합니다.', 'Area input has no layout drawing.') : L('타일이 너무 많아 배치도를 생략합니다.', 'Too many tiles to draw.')}</p>;
  };

  const rollViz = () => {
    if (!roomRes) return null;
    const rows = roomRes.layout.slice(0, 24);
    const W = 380, rowH = 16, k = W / roll.length;
    return (
      <svg viewBox={`0 0 400 ${rows.length * (rowH + 6) + 8}`} role="img" aria-label={L('롤별 재단 그림', 'Roll cutting plan')}>
        {rows.map((cuts, r) => {
          let x = 10;
          const y = 4 + r * (rowH + 6);
          return (
            <g key={r}>
              <rect x={10} y={y} width={W} height={rowH} className={s.sv_left} />
              {cuts.map((len, i) => {
                const el = <rect key={i} x={x} y={y} width={len * k} height={rowH} className={ceiling && Math.abs(len - roomRes.ceilingStripLen) < 1e-6 && len !== roomRes.wallStripLen ? s.sv_ceiling : s.sv_wall} />;
                x += len * k;
                return el;
              })}
              <rect x={10} y={y} width={W} height={rowH} className={s.sv_roll} />
            </g>
          );
        })}
      </svg>
    );
  };

  const titleStr = L('타일·도배지 소요량 & 로스율 계산기', 'Tile & Wallpaper Calculator');
  const descStr = L('바닥·욕실 벽 타일 박스 수와 방·집 평수별 도배지 롤 수를 실제 배치와 재단 방식대로 계산합니다.', 'Tile boxes for floors and bathroom walls, and wallpaper rolls per room or flat size, counted the way installers cut them.');

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<LayoutGrid />} title={titleStr} subtitle={descStr} />

      <div className={ui.segmented} role="tablist">
        {(['tile', 'paper'] as Tab[]).map(t => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={`${ui.segment} ${tab === t ? ui.segmentActive : ''}`} onClick={() => setTab(t)}>
            {t === 'tile' ? L('🔲 타일', '🔲 Tiles') : L('🖼 도배지', '🖼 Wallpaper')}
            <small>{t === 'tile' ? L('박스 수·로스율', 'Boxes and waste') : L('롤 수·재단', 'Rolls and cutting')}</small>
          </button>
        ))}
      </div>

      {tab === 'tile' ? (
        <>
          <section className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{L('1. 어디에 붙이나요?', '1. Where?')}</h2>
            <div className={ui.chips}>
              {chip(tileMode, 'rect', setTileMode, L('바닥·벽 한 면', 'Floor / one wall'), L('직사각형', 'Rectangle'))}
              {chip(tileMode, 'bath', setTileMode, L('욕실 벽 4면', 'Bathroom walls'), L('둘레 × 높이', 'Perimeter × height'))}
              {chip(tileMode, 'area', setTileMode, L('면적만 알 때', 'Area only'), L('㎡ · 평', 'm² or pyeong'))}
            </div>
            {tileMode === 'rect' && (
              <div className={s.grid2}>
                {field('t-rw', L('가로', 'Width'), rectW, setRectW, 'm')}
                {field('t-rh', L('세로 (벽이면 높이)', 'Length (or wall height)'), rectH, setRectH, 'm')}
              </div>
            )}
            {tileMode === 'bath' && (
              <>
                <div className={s.grid3}>
                  {field('t-bw', L('욕실 가로', 'Room width'), bathW, setBathW, 'm')}
                  {field('t-bd', L('욕실 세로', 'Room depth'), bathD, setBathD, 'm')}
                  {field('t-bh', L('타일 높이', 'Tile height'), bathH, setBathH, 'm')}
                </div>
                <div className={s.sub_box}>
                  <span className={s.sub_title}>{L('빼는 부분 (문·창)', 'Openings')}</span>
                  <div className={s.grid3}>
                    {field('t-dw', L('문 폭', 'Door width'), doorW, setDoorW, 'm')}
                    {field('t-dh', L('문 높이', 'Door height'), doorH, setDoorH, 'm')}
                    {field('t-dn', L('문 개수', 'Doors'), doorN, setDoorN, L('개', ''))}
                    {field('t-ww', L('창 폭', 'Window width'), winW, setWinW, 'm')}
                    {field('t-wh', L('창 높이', 'Window height'), winH, setWinH, 'm')}
                    {field('t-wn', L('창 개수', 'Windows'), winN, setWinN, L('개', ''))}
                  </div>
                  <p className={s.hint}>{L('문·창 자리에 통째로 들어가는 타일만 뺍니다. 가장자리는 잘라 붙이므로 그대로 셉니다.', 'Only tiles that fit entirely inside an opening are removed; edge tiles are still counted.')}</p>
                </div>
              </>
            )}
            {tileMode === 'area' && (
              <div className={s.grid2}>
                {field('t-ar', L('시공 면적', 'Area'), areaText, setAreaText, areaUnit === 'm2' ? '㎡' : L('평', 'py'))}
                <div className={ui.field}>
                  <span className={ui.label}>{L('단위', 'Unit')}</span>
                  <div className={ui.chips}>{chip(areaUnit, 'm2', setAreaUnit, '㎡')}{chip(areaUnit, 'py', setAreaUnit, L('평', 'pyeong'))}</div>
                </div>
              </div>
            )}
            {tileMode === 'area' && <p className={s.hint}>{L('면적만으로 세면 가장자리에서 잘리는 장이 빠집니다. 여유분을 10% 이상 잡으세요.', 'Counting by area misses edge cuts; allow 10% or more.')}</p>}
          </section>

          <section className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{L('2. 타일과 시공 방법', '2. Tile and layout')}</h2>
            <div className={ui.field}>
              <span className={ui.label}>{L('타일 규격 (mm)', 'Tile size (mm)')}</span>
              <div className={ui.chips}>
                {TILE_SIZES.map(([w, h], i) => chip(sizeIdx, i, v => { setSizeIdx(v); setPerBoxText(''); }, `${w}×${h}`))}
                {chip(sizeIdx, TILE_SIZES.length, v => { setSizeIdx(v); setPerBoxText(''); }, L('직접 입력', 'Custom'))}
              </div>
            </div>
            {sizeIdx === TILE_SIZES.length && (
              <div className={s.grid2}>
                {field('t-cw', L('타일 가로', 'Tile width'), customW, v => { setCustomW(v); setPerBoxText(''); }, 'mm')}
                {field('t-ch', L('타일 세로', 'Tile height'), customH, v => { setCustomH(v); setPerBoxText(''); }, 'mm')}
              </div>
            )}
            {sw !== sh && (
              <div className={ui.field}>
                <span className={ui.label}>{L('타일 방향', 'Orientation')}</span>
                <div className={ui.chips}>
                  {chip(landscape, true, setLandscape, L('가로로 길게', 'Landscape'), `${Math.max(sw, sh)}×${Math.min(sw, sh)}`)}
                  {chip(landscape, false, setLandscape, L('세로로 길게', 'Portrait'), `${Math.min(sw, sh)}×${Math.max(sw, sh)}`)}
                </div>
              </div>
            )}
            <div className={ui.field}>
              <span className={ui.label}>{L('붙이는 방법', 'Layout')}</span>
              <div className={ui.chips}>
                {chip(pattern, 'grid', setPattern, patternName('grid'))}
                {chip(pattern, 'half', setPattern, patternName('half'), L('벽돌 쌓기', 'brick'))}
                {chip(pattern, 'third', setPattern, patternName('third'), L('대형 타일 권장', 'large tiles'))}
                {chip(pattern, 'diagonal', setPattern, patternName('diagonal'), L('마름모', 'diamond'))}
              </div>
            </div>
            <div className={s.grid3}>
              {field('t-gap', L('줄눈 간격', 'Grout joint'), gap, setGap, 'mm')}
              <div className={ui.field}>
                <label className={ui.label} htmlFor="t-box">{L('박스당 장수', 'Pieces per box')}</label>
                <div className={ui.inputGroup}>
                  <input id="t-box" className={ui.input} inputMode="numeric" placeholder={String(tileOk ? defaultPerBox(tile) : '')} value={perBoxText} onChange={e => setPerBoxText(e.target.value.replace(/[^0-9]/g, ''))} />
                  <span className={ui.unit}>{L('장', 'pcs')}</span>
                </div>
              </div>
            </div>
            <p className={s.hint}>{L(`박스당 장수를 비워 두면 1박스 1.44㎡ 기준(${tileOk ? defaultPerBox(tile) : '-'}장)으로 셉니다. 제품마다 다르니 박스 표기를 확인해 넣으세요.`, `Blank = 1.44 m² per box (${tileOk ? defaultPerBox(tile) : '-'} pcs). Check the box label.`)}</p>
            <div className={ui.field}>
              <span className={ui.label}>{L('여유분 (파손·보수용)', 'Spare (breakage, repairs)')}</span>
              <div className={ui.chips}>{[0, 3, 5, 10].map(p => chip(tileSpare, p, setTileSpare, `${p}%`))}</div>
            </div>
          </section>

          <section className={`${ui.card} ${s.card}`} aria-live="polite">
            <h2 className={ui.cardTitle}>{L('결과', 'Result')}</h2>
            {tileErr ? <div className={`${ui.notice} ${ui.amber}`}>{tileErr}</div> : !order ? <p className={s.hint}>{L('치수를 넣으면 결과가 나옵니다.', 'Enter dimensions to see the result.')}</p> : (
              <>
                <div className={`${ui.result} ${s.hero}`}>
                  <div className={ui.resultLabel}>{L('주문 수량', 'Order')}</div>
                  <div className={ui.resultValue}>{int(order.boxes)}<span className={s.hero_unit}>{L('박스', 'boxes')}</span></div>
                  <div className={s.hero_sub}>{int(order.orderPieces)}{L('장', ' pcs')} · {f1(order.orderM2)}㎡ ({tile.w}×{tile.h}, {patternName(pattern)})</div>
                </div>
                <div className={s.rows}>
                  <div className={s.row}><span>{L('시공 면적', 'Area to tile')}</span><strong>{f1(order.areaM2)}㎡ ({f1(order.areaM2 / SQM_PER_PYEONG)}{L('평', ' py')})</strong></div>
                  <div className={s.row}>
                    <span>{diag || tileMode === 'area' ? L('면적 기준 장수', 'Pieces by area') : L('배치 장수', 'Pieces laid')}
                      <small>{diag ? L(`대각선 가장자리 컷 +${DIAGONAL_EXTRA * 100}% 포함`, `incl. +${DIAGONAL_EXTRA * 100}% diagonal cuts`) : cutPieces > 0 ? L(`이 중 잘라 붙이는 장 ${int(cutPieces)}장`, `${int(cutPieces)} of them cut`) : ''}</small></span>
                    <strong>{int(order.pieces)}{L('장', ' pcs')}</strong>
                  </div>
                  {savedByOpenings > 0 && <div className={s.row}><span>{L('문·창 자리에서 빠진 장', 'Saved at openings')}</span><strong>−{int(savedByOpenings)}{L('장', ' pcs')}</strong></div>}
                  <div className={s.row}><span>{L(`여유분 ${tileSpare}%`, `Spare ${tileSpare}%`)}</span><strong>+{int(order.withSpare - order.pieces)}{L('장', ' pcs')}</strong></div>
                  <div className={`${s.row} ${s.row_em}`}><span>{L(`필요 장수 → 박스(${perBox}장) 단위로 올림`, `Needed → rounded to boxes of ${perBox}`)}</span><strong>{int(order.withSpare)} → {int(order.orderPieces)}{L('장', ' pcs')}</strong></div>
                  <div className={s.row}><span>{L('로스율 (구매 면적 ÷ 시공 면적)', 'Waste (bought ÷ tiled area)')}</span><strong>{f1(order.lossPct, 1)}%</strong></div>
                </div>
                <div className={s.viz}>
                  {tileViz()}
                  {(rectLayout || wallLayouts) && (
                    <div className={s.legend}>
                      <span><i style={{ background: 'var(--im-tile)' }} />{L('온장', 'Full tile')}</span>
                      <span><i style={{ background: 'var(--im-cut)' }} />{L('잘라 붙이는 장', 'Cut tile')}</span>
                      {tileMode === 'bath' && <span><i style={{ background: 'var(--im-opening)' }} />{L('문·창 (위치는 예시)', 'Openings (position illustrative)')}</span>}
                    </div>
                  )}
                </div>
                <button type="button" className={`${ui.button} ${ui.secondary} ${s.copy_btn}`} onClick={() => copy(L(
                  `[타일 소요량] ${tile.w}×${tile.h}mm ${patternName(pattern)}, 줄눈 ${tile.gap}mm\n시공 ${f1(order.areaM2)}㎡ / 필요 ${int(order.pieces)}장 + 여유 ${tileSpare}% = ${int(order.withSpare)}장\n주문 ${int(order.boxes)}박스 (${int(order.orderPieces)}장, 박스당 ${perBox}장, ${f1(order.orderM2)}㎡)`,
                  `[Tiles] ${tile.w}×${tile.h} mm ${patternName(pattern)}, ${tile.gap} mm joint\nArea ${f1(order.areaM2)} m² / ${int(order.pieces)} pcs + ${tileSpare}% = ${int(order.withSpare)} pcs\nOrder ${int(order.boxes)} boxes (${int(order.orderPieces)} pcs, ${perBox}/box)`,
                ))}><Copy size={16} />{copied || L('결과 복사', 'Copy result')}</button>
              </>
            )}
          </section>
        </>
      ) : (
        <>
          <section className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{L('1. 어떻게 계산할까요?', '1. How to measure')}</h2>
            <div className={ui.chips}>
              {chip(paperMode, 'room', setPaperMode, L('방 크기로', 'By room size'), L('가로·세로·층고', 'W × D × H'))}
              {chip(paperMode, 'pyeong', setPaperMode, L('집 평수로', 'By flat size'), L('빠른 어림', 'quick estimate'))}
            </div>
            {paperMode === 'room' ? (
              <>
                <div className={s.grid3}>
                  {field('p-w', L('방 가로', 'Width'), roomW, setRoomW, 'm')}
                  {field('p-d', L('방 세로', 'Depth'), roomD, setRoomD, 'm')}
                  {field('p-h', L('층고', 'Ceiling height'), roomH, setRoomH, 'm')}
                </div>
                <label className={s.toggle}><input type="checkbox" checked={ceiling} onChange={e => setCeiling(e.target.checked)} />{L('천장도 같은 벽지로 도배', 'Paper the ceiling too')}</label>
                <div className={s.sub_box}>
                  <span className={s.sub_title}>{L('문·창', 'Doors and windows')}</span>
                  <div className={s.grid3}>
                    {field('p-dw', L('문 폭', 'Door width'), pDoorW, setPDoorW, 'm')}
                    {field('p-dh', L('문 높이', 'Door height'), pDoorH, setPDoorH, 'm')}
                    {field('p-dn', L('문 개수', 'Doors'), pDoorN, setPDoorN, L('개', ''))}
                    {field('p-ww', L('창 폭', 'Window width'), pWinW, setPWinW, 'm')}
                    {field('p-wh', L('창 높이', 'Window height'), pWinH, setPWinH, 'm')}
                    {field('p-wn', L('창 개수', 'Windows'), pWinN, setPWinN, L('개', ''))}
                  </div>
                  <p className={s.hint}>{L('문 폭만큼은 폭 수에서 빼고, 창 위·아래 짧은 조각은 남는 자투리로 붙인다고 보고 폭 수에서 빼지 않습니다.', 'Door widths reduce the strip count; short pieces above and below windows come from offcuts.')}</p>
                </div>
                <div className={ui.field}>
                  <span className={ui.label}>{L('무늬 반복 길이', 'Pattern repeat')}</span>
                  <div className={ui.chips}>
                    {[['0', L('단색·무지', 'Plain')], ['0.53', '53cm'], ['0.64', '64cm']].map(([v, l]) => chip(repeat, v, setRepeat, l))}
                  </div>
                  <div style={{ maxWidth: 200, marginTop: '0.5rem' }}>{field('p-rep', L('직접 입력', 'Custom'), repeat, setRepeat, 'm')}</div>
                  <p className={s.hint}>{L('무늬가 있으면 한 폭 길이를 무늬 반복 길이의 배수로 올려 잘라야 옆 폭과 무늬가 맞습니다. 벽지 뒷면이나 상세 정보의 리피트(repeat) 값을 넣으세요.', 'Strips are cut to a multiple of the repeat so patterns line up. Use the repeat printed on the roll.')}</p>
                </div>
              </>
            ) : (
              <>
                <div className={s.grid2}>
                  {field('p-py', L('집 평수', 'Flat size'), pyeongText, setPyeongText, L('평', 'py'))}
                  <div className={ui.field}>
                    <span className={ui.label}>{L('기준', 'Basis')}</span>
                    <div className={ui.chips}>{chip(pyBasis, 'supply', setPyBasis, L('분양평수', 'Supply'), '× 2.5')}{chip(pyBasis, 'exclusive', setPyBasis, L('실평수', 'Exclusive'), '× 3')}</div>
                  </div>
                </div>
                <p className={s.hint}>{L('아파트 도배 면적은 보통 분양평수 × 2.5, 실평수 × 3으로 어림합니다(벽+천장). 방별로 정확히 하려면 "방 크기로"를 쓰세요.', 'Apartment wall + ceiling area is roughly supply area × 2.5 or exclusive area × 3. Use "By room size" for precision.')}</p>
              </>
            )}
          </section>

          <section className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{L('2. 벽지 종류', '2. Wallpaper')}</h2>
            <select className={ui.input} value={paperIdx} onChange={e => setPaperIdx(Number(e.target.value))} aria-label={L('벽지 종류', 'Wallpaper type')}>
              {PAPERS.map((p, i) => <option key={p.id} value={i}>{isKo ? p.ko : p.en}</option>)}
              <option value={PAPERS.length}>{L('직접 입력', 'Custom')}</option>
            </select>
            {paperIdx === PAPERS.length && (
              <div className={s.grid2}>
                {field('p-rw', L('롤 폭', 'Roll width'), rollWText, setRollWText, 'm')}
                {field('p-rl', L('롤 길이', 'Roll length'), rollLText, setRollLText, 'm')}
              </div>
            )}
            <p className={s.hint}>{L('대표 규격입니다. 실크는 15.5m 제품도 있으니 다르면 직접 입력하세요.', 'Typical sizes; enter your product if it differs.')}</p>
            <div className={ui.field}>
              <span className={ui.label}>{L('여유분', 'Spare')}</span>
              <div className={ui.chips}>{[0, 5, 10].map(p => chip(paperSpare, p, setPaperSpare, `${p}%`))}</div>
            </div>
          </section>

          <section className={`${ui.card} ${s.card}`} aria-live="polite">
            <h2 className={ui.cardTitle}>{L('결과', 'Result')}</h2>
            {room && 'error' in room ? (
              <div className={`${ui.notice} ${ui.amber}`}>{L('한 폭 길이가 롤 길이보다 깁니다. 층고·방 크기나 롤 길이를 확인하세요.', 'A strip is longer than the roll. Check the height, room size or roll length.')}</div>
            ) : roomRes ? (
              <>
                <div className={`${ui.result} ${s.hero}`}>
                  <div className={ui.resultLabel}>{L('주문 수량', 'Order')}</div>
                  <div className={ui.resultValue}>{roomRes.rolls}<span className={s.hero_unit}>{L('롤', 'rolls')}</span></div>
                  <div className={s.hero_sub}>{L(`여유 없이 딱 맞게 ${roomRes.rollsNoSpare}롤 · ${paperName}`, `${roomRes.rollsNoSpare} with no spare · ${paperName}`)}</div>
                </div>
                <div className={s.rows}>
                  <div className={s.row}><span>{L('벽', 'Walls')}<small>{L(`둘레 ${f1(2 * (num(roomW) + num(roomD)), 1)}m ÷ 폭 ${roll.width}m${num(pDoorN) > 0 ? ', 문 폭 차감' : ''}`, `perimeter ÷ ${roll.width} m`)}</small></span><strong>{roomRes.wallStrips}{L('폭', ' strips')} × {f1(roomRes.wallStripLen)}m</strong></div>
                  {ceiling && <div className={s.row}><span>{L('천장', 'Ceiling')}<small>{L('긴 방향으로 붙임', 'run along the long side')}</small></span><strong>{roomRes.ceilingStrips}{L('폭', ' strips')} × {f1(roomRes.ceilingStripLen)}m</strong></div>}
                  <div className={s.row}><span>{L(`여유분 ${paperSpare}%`, `Spare ${paperSpare}%`)}</span><strong>+{roomRes.spareStrips}{L('폭', ' strips')}</strong></div>
                  <div className={s.row}><span>{L('1롤에서 나오는 벽 폭', 'Wall strips per roll')}</span><strong>{roomRes.stripsPerRoll}{L('폭', '')}</strong></div>
                  <div className={s.row}><span>{L('붙이는 면적', 'Area covered')}<small>{L('문·창 제외', 'excl. openings')}</small></span><strong>{f1(roomRes.coverM2)}㎡ ({f1(roomRes.coverM2 / SQM_PER_PYEONG)}{L('평', ' py')})</strong></div>
                  <div className={s.row}><span>{L('로스율 (구매 면적 ÷ 붙이는 면적)', 'Waste (bought ÷ covered)')}</span><strong>{f1(roomRes.lossPct, 1)}%</strong></div>
                </div>
                <div className={s.viz}>
                  <span className={s.sub_title}>{L(`롤별 재단 계획 (롤 1개 = ${roll.length}m)`, `Cutting plan (roll = ${roll.length} m)`)}</span>
                  {rollViz()}
                  <div className={s.legend}>
                    <span><i style={{ background: 'var(--im-wall)' }} />{L('벽 폭', 'Wall strip')}</span>
                    {ceiling && <span><i style={{ background: 'var(--im-ceiling)' }} />{L('천장 폭', 'Ceiling strip')}</span>}
                    <span><i style={{ background: 'var(--im-left)' }} />{L('남는 자투리 (창 위아래 등에 사용)', 'Offcut (used around windows)')}</span>
                  </div>
                </div>
                <button type="button" className={`${ui.button} ${ui.secondary} ${s.copy_btn}`} onClick={() => copy(L(
                  `[도배 소요량] ${paperName}\n방 ${roomW}×${roomD}m, 층고 ${roomH}m${ceiling ? ', 천장 포함' : ''}${num(repeat) > 0 ? `, 무늬 반복 ${repeat}m` : ''}\n벽 ${roomRes.wallStrips}폭(${f1(roomRes.wallStripLen)}m)${ceiling ? ` + 천장 ${roomRes.ceilingStrips}폭(${f1(roomRes.ceilingStripLen)}m)` : ''} + 여유 ${roomRes.spareStrips}폭\n주문 ${roomRes.rolls}롤 (딱 맞게 ${roomRes.rollsNoSpare}롤)`,
                  `[Wallpaper] ${paperName}\nRoom ${roomW}×${roomD} m, height ${roomH} m${ceiling ? ', incl. ceiling' : ''}\nOrder ${roomRes.rolls} rolls (${roomRes.rollsNoSpare} with no spare)`,
                ))}><Copy size={16} />{copied || L('결과 복사', 'Copy result')}</button>
              </>
            ) : byPy ? (
              <>
                <div className={`${ui.result} ${s.hero}`}>
                  <div className={ui.resultLabel}>{L('주문 수량 (어림)', 'Order (estimate)')}</div>
                  <div className={ui.resultValue}>{byPy.rolls}<span className={s.hero_unit}>{L('롤', 'rolls')}</span></div>
                  <div className={s.hero_sub}>{paperName}</div>
                </div>
                <div className={s.rows}>
                  <div className={s.row}><span>{L('도배 면적 (벽+천장)', 'Area (walls + ceiling)')}<small>{L(`${pyeongText}평 × ${pyBasis === 'supply' ? '2.5' : '3'}`, '')}</small></span><strong>{f1(byPy.areaPyeong, 1)}{L('평', ' py')} ({f1(byPy.areaM2, 1)}㎡)</strong></div>
                  <div className={s.row}><span>{L('1롤 시공 면적', 'Coverage per roll')}</span><strong>{f1(byPy.rollPyeong, 2)}{L('평', ' py')}</strong></div>
                  <div className={s.row}><span>{L('계산상 롤 수', 'Exact rolls')}</span><strong>{f1(byPy.exactRolls, 1)}{L('롤', '')}</strong></div>
                  <div className={`${s.row} ${s.row_em}`}><span>{L(`여유분 ${paperSpare}% 더해 올림`, `+${paperSpare}% rounded up`)}</span><strong>{byPy.rolls}{L('롤', ' rolls')}</strong></div>
                </div>
                <p className={s.hint}>{L('평수 계산은 면적으로만 어림한 값이라 폭 재단 손실이 빠져 있습니다. 실제로는 1~2롤 더 들 수 있으니, 정확한 수량은 방 크기로 계산해 합치세요.', 'This area-only estimate ignores strip offcuts; allow 1–2 extra rolls or calculate room by room.')}</p>
                <button type="button" className={`${ui.button} ${ui.secondary} ${s.copy_btn}`} onClick={() => copy(L(
                  `[도배 소요량 어림] ${paperName}\n${pyeongText}평(${pyBasis === 'supply' ? '분양' : '실평수'}) → 도배 면적 약 ${f1(byPy.areaPyeong, 1)}평 (벽+천장)\n주문 ${byPy.rolls}롤 (여유 ${paperSpare}% 포함)`,
                  `[Wallpaper estimate] ${paperName}\n${pyeongText} py → about ${f1(byPy.areaPyeong, 1)} py\nOrder ${byPy.rolls} rolls`,
                ))}><Copy size={16} />{copied || L('결과 복사', 'Copy result')}</button>
              </>
            ) : <p className={s.hint}>{L('치수를 넣으면 결과가 나옵니다.', 'Enter dimensions to see the result.')}</p>}
          </section>
        </>
      )}

      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utilities/utility/interior-material-calc" />

      {seo}
    </div>
  );
}
