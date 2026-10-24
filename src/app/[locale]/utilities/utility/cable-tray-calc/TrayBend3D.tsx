'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import type { BendDirection, CutKind } from '@/lib/cableTray';
import s from './cable-tray-calc.module.css';

/**
 * 꺾임 1곳의 3D 형상 (의존성 없는 SVG 투영).
 * 평평한 트레이에 V-컷/일자 절개를 넣은 상태(0%)에서 실제 각도로 접힌 상태(100%)까지 보여준다.
 * 드래그로 회전, 슬라이더·재생 버튼으로 접기 진행률을 조절한다.
 */

type V3 = [number, number, number];
type Tone = 'bottom' | 'rail' | 'railFar';
interface Face { pts: V3[]; tone: Tone }
interface Edge { a: V3; b: V3; kind: 'cut' | 'hinge' }
/** 3D 치수선: a–b 사이 선 + 가운데 글자. 조각과 함께 회전·접히므로 시뮬레이션 중에도 위치가 맞는다 */
interface Dim3 { a: V3; b: V3; text: string; tone: 'dim' | 'cut' | 'slit' | 'angle' }

const fmt1 = (n: number) => (Math.round(n * 10) / 10).toString();

const rotZabout = ([x, y, z]: V3, a: number, py: number): V3 => {
  const dy = y - py;
  return [x * Math.cos(a) - dy * Math.sin(a), py + x * Math.sin(a) + dy * Math.cos(a), z];
};

/** 트레이 좌표계: x = 길이 방향, y = 폭 방향(0..W), z = 위 방향(0..H). 단위 mm */
function buildGeometry(direction: BendDirection, kind: CutKind, angleDeg: number, W: number, H: number, p: number, isKo = true) {
  const t = Math.tan((angleDeg * Math.PI) / 360);
  // 상하 꺾임은 레일·V-컷이 주인공이라 조각 길이를 레일 높이에 맞춰 짧게 잡는다
  const len = direction === 'vertical' ? Math.max(H * 3.2, W * 1.1) : Math.max(W * 1.8, H * 2.2);
  const faces: Face[] = [];
  const edges: Edge[] = [];
  const dims: Dim3[] = [];
  const phi = (angleDeg * Math.PI / 180) * p;
  const off = Math.max(W, H) * 0.12; // 치수선을 형상 바깥으로 띄우는 거리
  const xEnd = -len * 0.85;          // 조각 A 끝부분 (레일 높이·폭 치수 위치)
  const nowDeg = Math.round(angleDeg * p);

  if (direction === 'vertical') {
    const cut = kind === 'vcut' ? H * t : 0;
    // 조각 B는 바닥판 접힘선(x=0, z=0)을 축으로 회전: V-컷은 위로, 일자 절개는 아래로
    const fold = (v: V3): V3 => {
      const [x, y, z] = v;
      const a = kind === 'vcut' ? phi : -phi;
      return [x * Math.cos(a) - z * Math.sin(a), y, x * Math.sin(a) + z * Math.cos(a)];
    };
    faces.push({ tone: 'bottom', pts: [[-len, 0, 0], [0, 0, 0], [0, W, 0], [-len, W, 0]] });
    faces.push({ tone: 'bottom', pts: ([[0, 0, 0], [len, 0, 0], [len, W, 0], [0, W, 0]] as V3[]).map(fold) });
    for (const y of [0, W]) {
      const tone: Tone = y === 0 ? 'rail' : 'railFar';
      faces.push({ tone, pts: [[-len, y, 0], [0, y, 0], [-cut, y, H], [-len, y, H]] });
      faces.push({ tone, pts: ([[0, y, 0], [len, y, 0], [len, y, H], [cut, y, H]] as V3[]).map(fold) });
      edges.push({ kind: 'cut', a: [0, y, 0], b: [-cut, y, H] });
      edges.push({ kind: 'cut', a: fold([0, y, 0]), b: fold([cut, y, H]) });
    }
    edges.push({ kind: 'hinge', a: [0, 0, 0], b: [0, W, 0] });

    const full = 2 * H * t;
    if (kind === 'vcut') {
      // 레일 윗면의 V 입구: 접힐수록 치수선이 짧아지며 닫힌다
      dims.push({
        tone: 'cut', a: [-cut, -off * 0.3, H], b: fold([cut, -off * 0.3, H]),
        text: isKo ? `V-컷 ${fmt1(full)} (한쪽 ${fmt1(H * t)})` : `V-cut ${fmt1(full)} (half ${fmt1(H * t)})`,
      });
    } else {
      // 일자 절개: 접힐수록 위쪽이 벌어진다
      dims.push({
        tone: 'slit', a: [0, -off * 0.3, H], b: fold([0, -off * 0.3, H]),
        text: isKo ? `일자 절개 → 틈 ${fmt1(full)}` : `slit → gap ${fmt1(full)}`,
      });
    }
    dims.push({ tone: 'dim', a: [xEnd, -off, 0], b: [xEnd, -off, H], text: isKo ? `레일 ${H}` : `rail ${H}` });
    dims.push({ tone: 'dim', a: [-len, 0, H + off * 0.4], b: [-len, W, H + off * 0.4], text: isKo ? `폭 ${W}` : `W ${W}` });
    dims.push({ tone: 'angle', a: [0, W + off, 0], b: [0, W + off, 0], text: isKo ? `꺾임 ${nowDeg}°` : `bend ${nowDeg}°` });
  } else {
    // 좌우: 바깥 레일(y=W) 위의 꼭짓점을 수직축으로 회전, 안쪽(y=0) 방향으로 꺾인다
    const cut = W * t;
    const turn = (v: V3): V3 => rotZabout(v, -phi, W);
    faces.push({ tone: 'bottom', pts: [[-len, 0, 0], [-cut, 0, 0], [0, W, 0], [-len, W, 0]] });
    faces.push({ tone: 'bottom', pts: ([[cut, 0, 0], [len, 0, 0], [len, W, 0], [0, W, 0]] as V3[]).map(turn) });
    // 안쪽 레일: V-컷 폭만큼 잘려 나감
    faces.push({ tone: 'rail', pts: [[-len, 0, 0], [-cut, 0, 0], [-cut, 0, H], [-len, 0, H]] });
    faces.push({ tone: 'rail', pts: ([[cut, 0, 0], [len, 0, 0], [len, 0, H], [cut, 0, H]] as V3[]).map(turn) });
    // 바깥 레일: 자르지 않고 접는다
    faces.push({ tone: 'railFar', pts: [[-len, W, 0], [0, W, 0], [0, W, H], [-len, W, H]] });
    faces.push({ tone: 'railFar', pts: ([[0, W, 0], [len, W, 0], [len, W, H], [0, W, H]] as V3[]).map(turn) });
    edges.push({ kind: 'cut', a: [-cut, 0, 0], b: [0, W, 0] });
    edges.push({ kind: 'cut', a: turn([cut, 0, 0]), b: [0, W, 0] });
    edges.push({ kind: 'cut', a: [-cut, 0, 0], b: [-cut, 0, H] });
    edges.push({ kind: 'cut', a: turn([cut, 0, 0]), b: turn([cut, 0, H]) });
    edges.push({ kind: 'hinge', a: [0, W, 0], b: [0, W, H] });

    const full = 2 * W * t;
    // 안쪽 레일에서 잘라내는 구간: 꺾을수록 양 끝이 만난다
    dims.push({
      tone: 'cut', a: [-cut, -off, H], b: turn([cut, -off, H]),
      text: isKo ? `안쪽 레일 잘라냄 ${fmt1(full)}` : `remove inner rail ${fmt1(full)}`,
    });
    dims.push({ tone: 'dim', a: [xEnd, -off, 0], b: [xEnd, -off, H], text: isKo ? `레일 ${H}` : `rail ${H}` });
    dims.push({
      tone: 'dim', a: [-len, 0, H + off * 0.4], b: [-len, W, H + off * 0.4],
      text: isKo ? `폭 ${W} (= V 길이)` : `W ${W} (= V length)`,
    });
    dims.push({ tone: 'angle', a: [0, W + off, H], b: [0, W + off, H], text: isKo ? `꺾임 ${nowDeg}°` : `bend ${nowDeg}°` });
  }
  return { faces, edges, dims, len };
}

type Pt = readonly [number, number];
type Anchor = 'start' | 'middle' | 'end';

/** 글자 폭 대략치 (11.5px 기준: 한글 ≈ 11.5, 그 외 ≈ 6.8) */
const textWidth = (str: string) => [...str].reduce((w, ch) => w + (/[가-힣]/.test(ch) ? 11.5 : 6.8), 0);

/**
 * 치수 글자 배치: 세로로 선 치수는 선 옆에, 나머지는 선 위에 두고,
 * 앞에 놓인 글자와 겹치면 위아래로 밀어 낸다. 화면 밖으로 나가지 않게 가로 위치를 보정한다.
 */
function layoutDims(items: { d: Dim3; a: Pt; b: Pt }[], vbW: number, vbH: number) {
  const placed: { x0: number; x1: number; y0: number; y1: number }[] = [];
  const LINE = 14;
  // 중요한 치수(절단)부터 자리를 잡는다
  const order = { cut: 0, slit: 0, angle: 1, dim: 2 } as const;
  return [...items].sort((p, q) => order[p.d.tone] - order[q.d.tone]).map(item => {
    const { a, b, d } = item;
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const vertical = Math.abs(b[1] - a[1]) > Math.abs(b[0] - a[0]) * 1.5;
    const w = textWidth(d.text);
    let anchor: Anchor = vertical ? 'end' : 'middle';
    let tx = vertical ? mx - 8 : mx;
    let ty = vertical ? my + 4 : my - 7;

    const box = (x: number, y: number, an: Anchor) => {
      const x0 = an === 'start' ? x : an === 'end' ? x - w : x - w / 2;
      return { x0, x1: x0 + w, y0: y - 11, y1: y + 3 };
    };
    // 화면 안쪽으로 당기기
    const fit = () => {
      const bx = box(tx, ty, anchor);
      if (bx.x0 < 4) { anchor = 'start'; tx = 4; }
      else if (bx.x1 > vbW - 4) { anchor = 'end'; tx = vbW - 4; }
      ty = Math.min(vbH - 4, Math.max(13, ty));
    };
    fit();
    const hits = (bx: ReturnType<typeof box>) => placed.some(p => bx.x0 < p.x1 && bx.x1 > p.x0 && bx.y0 < p.y1 && bx.y1 > p.y0);
    const baseY = ty;
    for (const shift of [0, -LINE, LINE, -2 * LINE, 2 * LINE, -3 * LINE, 3 * LINE]) {
      ty = baseY + shift;
      fit();
      if (!hits(box(tx, ty, anchor))) break;
    }
    placed.push(box(tx, ty, anchor));
    return { ...item, tx, ty, anchor };
  });
}

export default function TrayBend3D({
  direction, kind, angleDeg, widthMm, heightMm, isKo,
}: {
  direction: BendDirection; kind: CutKind; angleDeg: number; widthMm: number; heightMm: number; isKo: boolean;
}) {
  // 상하 꺾임은 옆에서, 좌우 꺾임은 위에서 내려다볼 때 형태가 잘 보인다
  const defaultPitch = direction === 'vertical' ? 0.3 : 1.05;
  const [progress, setProgress] = useState(1);
  const [yaw, setYaw] = useState(-0.6);
  const [pitch, setPitch] = useState(defaultPitch);
  const [showDims, setShowDims] = useState(true);
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const raf = useRef<number | null>(null);

  const play = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / 1600);
      setProgress(k < 0.15 ? 0 : (k - 0.15) / 0.85);
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  // 처음 보여줄 때 한 번 접기 애니메이션 (모션 줄이기 설정이면 생략)
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) play();
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 형상이 바뀔 때만 다시 재생
  }, [direction, kind, angleDeg]);

  useEffect(() => { setPitch(defaultPitch); setYaw(-0.6); }, [defaultPitch]);

  const { faces, edges, dims } = buildGeometry(direction, kind, angleDeg, widthMm, heightMm, progress, isKo);

  // 보기 회전: z축(yaw) → x축(pitch), 정사영
  const view = (v: V3): V3 => {
    const [x0, y0, z0] = [v[0], v[1] - widthMm / 2, v[2] - heightMm / 2];
    const x1 = x0 * Math.cos(yaw) - y0 * Math.sin(yaw);
    const y1 = x0 * Math.sin(yaw) + y0 * Math.cos(yaw);
    const y2 = y1 * Math.cos(pitch) - z0 * Math.sin(pitch);
    const z2 = y1 * Math.sin(pitch) + z0 * Math.cos(pitch);
    return [x1, z2, y2]; // [화면 x, 화면 위쪽, 깊이(클수록 멀리)]
  };

  // 펼친 상태와 접힌 상태를 모두 담는 범위로 맞춰, 애니메이션 중에 크기가 흔들리지 않게 한다
  const VB_W = 360, VB_H = 270, PAD = showDims ? 34 : 16;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of [0, 1]) {
    const g = buildGeometry(direction, kind, angleDeg, widthMm, heightMm, p);
    const pts = [...g.faces.flatMap(f => f.pts), ...(showDims ? g.dims.flatMap(d => [d.a, d.b]) : [])];
    for (const pt of pts) {
      const [sx, sy] = view(pt);
      minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
      minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
    }
  }
  const scale = Math.min((VB_W - PAD * 2) / (maxX - minX || 1), (VB_H - PAD * 2) / (maxY - minY || 1));
  const offX = (VB_W - (maxX - minX) * scale) / 2;
  const offY = (VB_H - (maxY - minY) * scale) / 2;
  const toScreen = (v: V3) => {
    const [sx, sy] = view(v);
    return [offX + (sx - minX) * scale, offY + (maxY - sy) * scale] as const;
  };

  const sorted = faces
    .map(f => ({ f, depth: f.pts.reduce((d, pt) => d + view(pt)[2], 0) / f.pts.length }))
    .sort((a, b) => b.depth - a.depth);

  const onDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, yaw, pitch };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setYaw(drag.current.yaw + (e.clientX - drag.current.x) * 0.01);
    setPitch(Math.max(-1.4, Math.min(1.4, drag.current.pitch + (e.clientY - drag.current.y) * 0.01)));
  };
  const onUp = () => { drag.current = null; };

  const cutLabel = kind === 'vcut' ? (isKo ? 'V-컷 (잘라냄)' : 'V-cut (remove)') : (isKo ? '일자 절개 (벌어짐)' : 'Straight slit (opens)');
  const hingeLabel = direction === 'vertical'
    ? (isKo ? '바닥판 접힘선 (자르지 않음)' : 'Bottom fold line (do not cut)')
    : (isKo ? '바깥 레일 접힘 (자르지 않음)' : 'Outer rail fold (do not cut)');

  return (
    <figure className={s.view3d}>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className={s.view3d_svg}
        role="img"
        aria-label={isKo ? `꺾임 ${angleDeg.toFixed(1)}° 3D 형상` : `${angleDeg.toFixed(1)}° bend in 3D`}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      >
        <g>
          {sorted.map(({ f }, i) => (
            <polygon key={i} points={f.pts.map(pt => toScreen(pt).join(',')).join(' ')}
              className={s[`face_${f.tone}`]} />
          ))}
          {edges.map((e, i) => {
            const [x1, y1] = toScreen(e.a);
            const [x2, y2] = toScreen(e.b);
            return <line key={`e${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
              className={e.kind === 'cut' ? (kind === 'vcut' ? s.edge_cut : s.edge_slit) : s.edge_hinge} />;
          })}
        </g>
        {showDims && (
          <g aria-hidden="true">
            {layoutDims(dims.map(d => ({ d, a: toScreen(d.a), b: toScreen(d.b) })), VB_W, VB_H).map(({ d, a, b, tx, ty, anchor }, i) => (
              <g key={`d${i}`} className={s[`dim3_${d.tone}`]}>
                {d.tone !== 'angle' && Math.hypot(b[0] - a[0], b[1] - a[1]) > 4 && (
                  <>
                    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
                    <circle cx={a[0]} cy={a[1]} r={2.2} />
                    <circle cx={b[0]} cy={b[1]} r={2.2} />
                  </>
                )}
                <text x={tx} y={ty} textAnchor={anchor}>{d.text}</text>
              </g>
            ))}
          </g>
        )}
      </svg>
      <div className={s.view3d_controls}>
        <button type="button" className={s.icon_btn} onClick={play} aria-label={isKo ? '접기 다시 보기' : 'Replay fold'}>
          <Play size={16} />
        </button>
        <input
          type="range" min={0} max={100} value={Math.round(progress * 100)}
          onChange={e => { if (raf.current) cancelAnimationFrame(raf.current); setProgress(Number(e.target.value) / 100); }}
          className={s.range}
          aria-label={isKo ? '접기 진행률' : 'Fold progress'}
        />
        <span className={s.range_val}>{Math.round(angleDeg * progress)}°</span>
        <button type="button" className={s.icon_btn} onClick={() => { setYaw(-0.6); setPitch(defaultPitch); }} aria-label={isKo ? '보기 초기화' : 'Reset view'}>
          <RotateCcw size={16} />
        </button>
      </div>
      <figcaption className={s.legend}>
        <span><i className={kind === 'vcut' ? s.sw_cut : s.sw_slit} />{cutLabel}</span>
        <span><i className={s.sw_hinge} />{hingeLabel}</span>
        <label className={s.legend_toggle}>
          <input type="checkbox" checked={showDims} onChange={e => setShowDims(e.target.checked)} />
          {isKo ? '치수 표시 (mm)' : 'Show dimensions (mm)'}
        </label>
        <span className={s.legend_hint}>{isKo ? '드래그해서 돌려 보세요' : 'Drag to rotate'}</span>
      </figcaption>
    </figure>
  );
}
