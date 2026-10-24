'use client';

import { useId } from 'react';
import type { DimKey, Dims, ShapeId } from '@/lib/metalWeight';
import { tubeRadius } from '@/lib/metalWeight';
import s from './metal-weight-calc.module.css';

/**
 * 단면도. 치수마다 화살표·이름을 달고, 입력 중인 칸(active)과 그 부위(웹/플랜지 등)를 강조한다.
 * 두께가 너무 얇으면 보이도록 최소 굵기로 그린다(숫자는 실제 값).
 */

const VW = 340, VH = 270;
const BOX = { x: 64, y: 46, w: 190, h: 176 };
const MIN_T = 5;

interface Props {
  shape: ShapeId;
  dims: Dims;
  active: DimKey | null;
  /** 치수 이름(짧게) — 예: t1 → "t1 웹" */
  names: Partial<Record<DimKey, string>>;
  sample: boolean;
  sampleLabel: string;
  exaggeratedNote: string;
}

export default function CrossSection({ shape, dims, active, names, sample, sampleLabel, exaggeratedNote }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const arrow = `mwa${uid}`, arrowOn = `mwb${uid}`;
  const n = (k: DimKey) => dims[k] ?? 0;
  const fmt = (x: number) => String(Math.round(x * 100) / 100);
  let exaggerated = false;
  const thick = (real: number) => { if (real < MIN_T) exaggerated = true; return Math.max(real, MIN_T); };

  const on = (k: DimKey) => active === k;
  const dimCls = (k: DimKey) => (on(k) ? s.sv_dim_on : s.sv_dim);
  const txtCls = (k: DimKey) => (on(k) ? s.sv_txt_on : s.sv_txt);
  // 각관 모서리 R은 비워 두면 계산에 쓰는 2t 값을 보여 준다
  const label = (k: DimKey) => (shape === 'sqtube' && k === 'r'
    ? `${names.r ?? 'R'} ${fmt(tubeRadius(dims))}${dims.r == null ? ' (2t)' : ''}`
    : `${names[k] ?? k} ${fmt(n(k))}`);
  const mk = (k: DimKey) => `url(#${on(k) ? arrowOn : arrow})`;

  /** 가로 치수선 (양끝 화살표 + 보조선) */
  const dimH = (k: DimKey, x1: number, x2: number, y: number, fromY?: number) => (
    <g key={`dh${k}`}>
      {fromY !== undefined && <>
        <line x1={x1} y1={fromY} x2={x1} y2={y + (y < fromY ? -4 : 4)} className={s.sv_ext} />
        <line x1={x2} y1={fromY} x2={x2} y2={y + (y < fromY ? -4 : 4)} className={s.sv_ext} />
      </>}
      <line x1={x1} y1={y} x2={x2} y2={y} className={dimCls(k)} markerStart={mk(k)} markerEnd={mk(k)} />
      <text x={(x1 + x2) / 2} y={y - 5} textAnchor="middle" className={txtCls(k)}>{label(k)}</text>
    </g>
  );
  /** 세로 치수선 */
  const dimV = (k: DimKey, y1: number, y2: number, x: number, fromX?: number) => (
    <g key={`dv${k}`}>
      {fromX !== undefined && <>
        <line x1={fromX} y1={y1} x2={x - 4} y2={y1} className={s.sv_ext} />
        <line x1={fromX} y1={y2} x2={x - 4} y2={y2} className={s.sv_ext} />
      </>}
      <line x1={x} y1={y1} x2={x} y2={y2} className={dimCls(k)} markerStart={mk(k)} markerEnd={mk(k)} />
      <text x={x - 6} y={(y1 + y2) / 2 + 4} textAnchor="end" className={txtCls(k)}>{label(k)}</text>
    </g>
  );
  /** 얇은 두께(가로 방향): 바깥에서 안쪽으로 화살표 두 개, 이름은 오른쪽 */
  const thinH = (k: DimKey, x1: number, x2: number, y: number, labelX?: number) => (
    <g key={`th${k}`}>
      <line x1={x1 - 16} y1={y} x2={x1} y2={y} className={dimCls(k)} markerEnd={mk(k)} />
      <line x1={x2 + 16} y1={y} x2={x2} y2={y} className={dimCls(k)} markerEnd={mk(k)} />
      <text x={labelX ?? x2 + 20} y={y + 4} textAnchor="start" className={txtCls(k)}>{label(k)}</text>
    </g>
  );
  /** 얇은 두께(세로 방향): 위·아래에서 화살표, 이름은 오른쪽 */
  const thinV = (k: DimKey, y1: number, y2: number, x: number, fromX?: number) => (
    <g key={`tv${k}`}>
      {fromX !== undefined && <>
        <line x1={fromX} y1={y1} x2={x + 4} y2={y1} className={s.sv_ext} />
        <line x1={fromX} y1={y2} x2={x + 4} y2={y2} className={s.sv_ext} />
      </>}
      <line x1={x} y1={y1 - 16} x2={x} y2={y1} className={dimCls(k)} markerEnd={mk(k)} />
      <line x1={x} y1={y2 + 16} x2={x} y2={y2} className={dimCls(k)} markerEnd={mk(k)} />
      <text x={x + 7} y={(y1 + y2) / 2 + 4} textAnchor="start" className={txtCls(k)}>{label(k)}</text>
    </g>
  );
  /** 지시선 (필렛·모서리 반경) */
  const leader = (k: DimKey, px: number, py: number, tx: number, ty: number) => (
    <g key={`ld${k}`}>
      <circle cx={px} cy={py} r={2.5} className={on(k) ? s.sv_dot_on : s.sv_dot} />
      <line x1={px} y1={py} x2={tx} y2={ty} className={dimCls(k)} />
      <text x={tx + (tx >= px ? 3 : -3)} y={ty + 4} textAnchor={tx >= px ? 'start' : 'end'} className={txtCls(k)}>{label(k)}</text>
    </g>
  );

  const part = (key: string, highlight: boolean, el: React.ReactElement<{ className?: string }>) =>
    <g key={key} className={highlight ? s.sv_part_on : s.sv_part}>{el}</g>;

  const fit = (w: number, h: number) => Math.min(BOX.w / Math.max(w, 1), BOX.h / Math.max(h, 1));
  const body: React.ReactNode[] = [];
  const dimsEls: React.ReactNode[] = [];
  const cxBox = BOX.x + BOX.w / 2, cyBox = BOX.y + BOX.h / 2;

  if (shape === 'hbeam' || shape === 'channel' || shape === 'tshape') {
    const H = n('H'), W = n('W');
    const k = fit(W, H);
    const pw = W * k, ph = H * k, tf = thick(n('t2') * k), tw = thick(n('t1') * k);
    const ox = BOX.x + (BOX.w - pw) / 2, oy = BOX.y + (BOX.h - ph) / 2;
    const webOn = on('t1'), flOn = on('t2');
    if (shape === 'hbeam') {
      const cx = ox + pw / 2;
      body.push(
        part('ft', flOn, <rect x={ox} y={oy} width={pw} height={tf} />),
        part('fb', flOn, <rect x={ox} y={oy + ph - tf} width={pw} height={tf} />),
        part('w', webOn, <rect x={cx - tw / 2} y={oy + tf} width={tw} height={ph - 2 * tf} />),
        <path key="o" className={s.sv_outline} d={`M${ox},${oy}H${ox + pw}V${oy + tf}H${cx + tw / 2}V${oy + ph - tf}H${ox + pw}V${oy + ph}H${ox}V${oy + ph - tf}H${cx - tw / 2}V${oy + tf}H${ox}Z`} />,
      );
      dimsEls.push(
        dimH('W', ox, ox + pw, oy - 16, oy),
        dimV('H', oy, oy + ph, ox - 16, ox),
        thinH('t1', cx - tw / 2, cx + tw / 2, oy + ph * 0.58),
        thinV('t2', oy, oy + tf, ox + pw + 14, ox + pw),
        leader('r', cx + tw / 2, oy + tf, cx + tw / 2 + 26, oy + tf + 26),
      );
    } else if (shape === 'channel') {
      body.push(
        part('ft', flOn, <rect x={ox} y={oy} width={pw} height={tf} />),
        part('fb', flOn, <rect x={ox} y={oy + ph - tf} width={pw} height={tf} />),
        part('w', webOn, <rect x={ox} y={oy + tf} width={tw} height={ph - 2 * tf} />),
        <path key="o" className={s.sv_outline} d={`M${ox},${oy}H${ox + pw}V${oy + tf}H${ox + tw}V${oy + ph - tf}H${ox + pw}V${oy + ph}H${ox}Z`} />,
      );
      dimsEls.push(
        dimH('W', ox, ox + pw, oy - 16, oy),
        dimV('H', oy, oy + ph, ox - 16, ox),
        thinH('t1', ox, ox + tw, oy + ph * 0.58),
        thinV('t2', oy, oy + tf, ox + pw + 14, ox + pw),
        leader('r1', ox + tw, oy + tf, ox + tw + 26, oy + tf + 24),
        leader('r2', ox + pw, oy + ph - tf, ox + pw + 10, oy + ph - tf - 26),
      );
    } else {
      const cx = ox + pw / 2;
      body.push(
        part('f', flOn, <rect x={ox} y={oy} width={pw} height={tf} />),
        part('w', webOn, <rect x={cx - tw / 2} y={oy + tf} width={tw} height={ph - tf} />),
        <path key="o" className={s.sv_outline} d={`M${ox},${oy}H${ox + pw}V${oy + tf}H${cx + tw / 2}V${oy + ph}H${cx - tw / 2}V${oy + tf}H${ox}Z`} />,
      );
      dimsEls.push(
        dimH('W', ox, ox + pw, oy - 16, oy),
        dimV('H', oy, oy + ph, ox - 16, ox),
        thinH('t1', cx - tw / 2, cx + tw / 2, oy + ph * 0.66),
        thinV('t2', oy, oy + tf, ox + pw + 14, ox + pw),
        leader('r', cx + tw / 2, oy + tf, cx + tw / 2 + 26, oy + tf + 24),
      );
    }
  } else if (shape === 'angle') {
    const W = n('W'), H = n('H');
    const k = fit(W, H);
    const pw = W * k, ph = H * k, tt = thick(n('t') * k);
    const ox = BOX.x + (BOX.w - pw) / 2, oy = BOX.y + (BOX.h - ph) / 2 - 6;
    body.push(
      part('b', on('t'), <path d={`M${ox},${oy}H${ox + tt}V${oy + ph - tt}H${ox + pw}V${oy + ph}H${ox}Z`} />),
      <path key="o" className={s.sv_outline} d={`M${ox},${oy}H${ox + tt}V${oy + ph - tt}H${ox + pw}V${oy + ph}H${ox}Z`} />,
    );
    dimsEls.push(
      dimH('W', ox, ox + pw, oy + ph + 18, oy + ph),
      dimV('H', oy, oy + ph, ox - 16, ox),
      thinH('t', ox, ox + tt, oy + ph * 0.3),
      leader('r1', ox + tt, oy + ph - tt, ox + tt + 30, oy + ph - tt - 30),
      leader('r2', ox + pw, oy + ph - tt, ox + pw - 4, oy + ph - tt - 22),
    );
  } else if (shape === 'pipe' || shape === 'round') {
    const D = n('D');
    const ro = Math.min(BOX.w, BOX.h) / 2 - 6;
    const cx = cxBox, cy = cyBox + 6;
    body.push(part('o', on('t') || shape === 'round' && on('D'), <circle cx={cx} cy={cy} r={ro} />));
    if (shape === 'pipe') {
      const wall = thick(D > 0 ? (n('t') / D) * 2 * ro : 0);
      const ri = Math.max(ro - wall, 2);
      body.push(<circle key="h" cx={cx} cy={cy} r={ri} className={s.sv_hole} />);
      dimsEls.push(thinH('t', cx + ri, cx + ro, cy));
    }
    body.push(<circle key="ol" cx={cx} cy={cy} r={ro} className={s.sv_outline} />);
    dimsEls.push(dimH('D', cx - ro, cx + ro, cy - ro - 14, cy));
  } else if (shape === 'hex') {
    const R = Math.min(BOX.w / Math.sqrt(3), BOX.h / 2) - 4;
    const half = (R * Math.sqrt(3)) / 2;
    const cx = cxBox, cy = cyBox + 8;
    const pts = [[0, -R], [half, -R / 2], [half, R / 2], [0, R], [-half, R / 2], [-half, -R / 2]].map(([x, y]) => `${cx + x},${cy + y}`).join(' ');
    body.push(part('b', false, <polygon points={pts} />), <polygon key="o" points={pts} className={s.sv_outline} />);
    dimsEls.push(dimH('S', cx - half, cx + half, cy - R - 12, cy - R / 2));
  } else if (shape === 'square' || shape === 'flat' || shape === 'sqtube') {
    const W = n('W'), H = shape === 'flat' ? n('t') : n('H');
    const k = fit(W, H);
    const pw = W * k, ph = shape === 'flat' ? thick(H * k) : H * k;
    const ox = BOX.x + (BOX.w - pw) / 2, oy = BOX.y + (BOX.h - ph) / 2;
    if (shape === 'sqtube') {
      const R = tubeRadius(dims) * k, tt = thick(n('t') * k), ri = Math.max(0, R - tt);
      body.push(
        part('b', on('t'), <rect x={ox} y={oy} width={pw} height={ph} rx={R} />),
        <rect key="h" x={ox + tt} y={oy + tt} width={Math.max(pw - 2 * tt, 1)} height={Math.max(ph - 2 * tt, 1)} rx={ri} className={s.sv_hole} />,
        <rect key="o" x={ox} y={oy} width={pw} height={ph} rx={R} className={s.sv_outline} />,
      );
      dimsEls.push(
        dimH('W', ox, ox + pw, oy - 16, oy),
        dimV('H', oy, oy + ph, ox - 16, ox),
        thinH('t', ox + pw - tt, ox + pw, oy + ph / 2),
        leader('r', ox + pw - R * 0.3, oy + R * 0.3, ox + pw + 12, oy - 10),
      );
    } else {
      body.push(part('b', false, <rect x={ox} y={oy} width={pw} height={ph} />), <rect key="o" x={ox} y={oy} width={pw} height={ph} className={s.sv_outline} />);
      dimsEls.push(dimH('W', ox, ox + pw, oy - 16, oy));
      dimsEls.push(shape === 'flat' ? thinV('t', oy, oy + ph, ox + pw + 14, ox + pw) : dimV('H', oy, oy + ph, ox - 16, ox));
    }
  } else {
    // 판재·무늬강판: 폭 방향 단면 + 길이는 글로 표시
    const pw = BOX.w, ph = thick(n('W') > 0 ? (n('t') / n('W')) * pw : 0);
    const ox = BOX.x, oy = cyBox - ph / 2;
    body.push(part('b', on('t'), <rect x={ox} y={oy} width={pw} height={ph} />), <rect key="o" x={ox} y={oy} width={pw} height={ph} className={s.sv_outline} />);
    if (shape === 'checkered') {
      for (let x = ox + 8; x < ox + pw - 6; x += 16) body.push(<path key={`c${x}`} d={`M${x},${oy}l5,-4`} className={s.sv_outline} />);
    }
    dimsEls.push(
      dimH('W', ox, ox + pw, oy - 22, oy),
      thinV('t', oy, oy + ph, ox + pw + 14, ox + pw),
      <text key="L" x={ox + pw / 2} y={oy + ph + 40} textAnchor="middle" className={txtCls('L')}>{label('L')} ↗</text>,
    );
  }

  return (
    <div className={s.svg_box}>
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={`${shape} cross-section`} className={s.svg}>
        <defs>
          {[[arrow, s.sv_arrow], [arrowOn, s.sv_arrow_on]].map(([id, cls]) => (
            <marker key={id} id={id} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
              <path d="M0,0.8 L7,4 L0,7.2 Z" className={cls} />
            </marker>
          ))}
        </defs>
        {body}
        {dimsEls}
        {sample && <text x={8} y={18} className={s.sv_sample}>{sampleLabel}</text>}
      </svg>
      {exaggerated && <p className={s.svg_note}>{exaggeratedNote}</p>}
    </div>
  );
}
