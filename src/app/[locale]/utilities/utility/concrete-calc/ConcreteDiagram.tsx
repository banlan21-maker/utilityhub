// 형태별 치수 그림 — 라벨을 넘기면 치수 설명, 안 넘기면 형태 선택 카드용 작은 그림
import type { ReactNode } from 'react';
import type { ShapeKind, StairType, PostShape } from '@/lib/concreteCalc';
import s from './concrete-calc.module.css';

export type DiagramLabels = Partial<Record<'length' | 'width' | 'thick' | 'height' | 'dia' | 'depth' | 'post' | 'riser' | 'tread' | 'waist' | 'count', string>>;

interface Props {
  kind: ShapeKind;
  labels?: DiagramLabels;
  stair?: StairType;
  post?: PostShape;
  className?: string;
}

/** 경사 투영 상자: 앞면·윗면·옆면 (x0,y0 = 앞면 왼쪽 아래) */
function Box({ x0, y0, w, d, h }: { x0: number; y0: number; w: number; d: number; h: number }) {
  const dx = d * 0.7, dy = d * 0.45;
  return (
    <g>
      <polygon className={s.dTop} points={`${x0},${y0 - h} ${x0 + w},${y0 - h} ${x0 + w + dx},${y0 - h - dy} ${x0 + dx},${y0 - h - dy}`} />
      <polygon className={s.dSide} points={`${x0 + w},${y0} ${x0 + w + dx},${y0 - dy} ${x0 + w + dx},${y0 - h - dy} ${x0 + w},${y0 - h}`} />
      <rect className={s.dFront} x={x0} y={y0 - h} width={w} height={h} />
    </g>
  );
}

function T({ x, y, a = 'middle', children }: { x: number; y: number; a?: 'start' | 'middle' | 'end'; children?: string }) {
  if (!children) return null;
  return <text className={s.dLabel} x={x} y={y} textAnchor={a}>{children}</text>;
}

export default function ConcreteDiagram({ kind, labels, stair = 'waist', post = 'square', className }: Props) {
  const L = labels ?? {};
  const full = !!labels;
  let body: ReactNode = null;

  switch (kind) {
    case 'slab':
      body = (
        <>
          <Box x0={40} y0={105} w={130} d={70} h={16} />
          <T x={105} y={124}>{L.length}</T>
          <T x={200} y={100} a="start">{L.width}</T>
          <T x={34} y={101} a="end">{L.thick}</T>
        </>
      );
      break;
    case 'wall':
      body = (
        <>
          <Box x0={30} y0={110} w={150} d={16} h={56} />
          <T x={105} y={127}>{L.length}</T>
          <T x={196} y={46} a="start">{L.thick}</T>
          <T x={24} y={86} a="end">{L.height}</T>
        </>
      );
      break;
    case 'box':
      body = (
        <>
          <Box x0={70} y0={112} w={60} d={50} h={70} />
          <T x={100} y={128}>{L.length}</T>
          <T x={156} y={112} a="start">{L.width}</T>
          <T x={64} y={80} a="end">{L.height}</T>
          <T x={205} y={40}>{L.count}</T>
        </>
      );
      break;
    case 'cyl':
      body = (
        <>
          <path className={s.dFront} d="M70,35 L70,105 A40,12 0 0 0 150,105 L150,35" />
          <ellipse className={s.dTop} cx={110} cy={35} rx={40} ry={12} />
          {full && <line className={s.dDim} x1={70} y1={35} x2={150} y2={35} />}
          <T x={110} y={18}>{L.dia}</T>
          <T x={62} y={74} a="end">{L.height}</T>
          <T x={200} y={74}>{L.count}</T>
        </>
      );
      break;
    case 'hole':
      body = (
        <>
          <line className={s.dGround} x1={10} y1={50} x2={230} y2={50} />
          {full && [20, 40, 60, 160, 180, 200, 220].map((x) => <line key={x} className={s.dGround} x1={x} y1={50} x2={x - 8} y2={58} />)}
          <path className={s.dFront} d="M80,50 L80,108 Q80,116 88,116 L132,116 Q140,116 140,108 L140,50 Z" />
          {post !== 'none' && <rect className={s.dPost} x={100} y={12} width={20} height={98} rx={post === 'round' ? 8 : 1} />}
          {full && <line className={s.dDim} x1={80} y1={126} x2={140} y2={126} />}
          <T x={110} y={139}>{L.dia}</T>
          <T x={148} y={88} a="start">{L.depth}</T>
          <T x={126} y={26} a="start">{post !== 'none' ? L.post : undefined}</T>
          <T x={200} y={30}>{L.count}</T>
        </>
      );
      break;
    case 'stairs': {
      // 단 높이 18 · 단 너비 48 (그림 단위), 경사 바닥판 아랫면 기울기 18/48
      const steps = 'M30,115 L30,97 L78,97 L78,79 L126,79 L126,61 L174,61 L174,43 L222,43';
      body = (
        <>
          <path className={s.dFront} d={stair === 'solid' ? `${steps} L222,115 Z` : `${steps} L222,78 L123,115 Z`} />
          <polygon className={s.dTop} points="174,43 222,43 234,35 186,35" />
          <T x={36} y={111} a="start">{L.riser}</T>
          <T x={54} y={91}>{L.tread}</T>
          <T x={232} y={112} a="end">{stair === 'waist' ? L.waist : undefined}</T>
          <T x={180} y={30} a="end">{L.width}</T>
          <T x={60} y={44}>{L.count}</T>
        </>
      );
      break;
    }
    case 'manual':
      body = (
        <>
          <Box x0={80} y0={110} w={60} d={50} h={60} />
          <text className={s.dBig} x={110} y={86} textAnchor="middle">m³</text>
        </>
      );
      break;
  }

  return (
    <svg className={className} viewBox="0 0 240 142" role="img" aria-hidden={!full} focusable="false">
      {body}
    </svg>
  );
}
