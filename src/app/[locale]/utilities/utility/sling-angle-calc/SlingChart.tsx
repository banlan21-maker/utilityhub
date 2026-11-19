'use client';

// 꼭지각(0~150°) — 하중 증가 배수 그래프. 현재 각도를 점으로, 마우스·손가락을 올리면 그 각도의 배수를 보여 준다.
import { useState, type PointerEvent } from 'react';
import { angleFactor } from '@/lib/slingCalc';
import s from './sling-angle-calc.module.css';

interface Props {
  /** 현재 꼭지각 (없으면 점을 찍지 않음) */
  apex: number | null;
  labels: { x: string; y: string; zones: [string, string, string, string]; tip: (apex: number, f: string) => string; outside: (apex: number, f: string) => string };
  title: string;
}

const VW = 340, VH = 220;
const X0 = 44, X1 = 326, Y0 = 186, Y1 = 22; // 그림 영역
const AMAX = 150, FMAX = 4;
const xOf = (apex: number) => X0 + (apex / AMAX) * (X1 - X0);
const yOf = (f: number) => Y0 - ((f - 1) / (FMAX - 1)) * (Y0 - Y1);
const fOfApex = (apex: number) => angleFactor(apex / 2);

const CURVE = (() => {
  const pts: string[] = [];
  for (let a = 0; a <= AMAX; a += 1) pts.push(`${xOf(a).toFixed(1)},${yOf(fOfApex(a)).toFixed(1)}`);
  return `M${pts.join(' L')}`;
})();

const ZONES: { from: number; to: number; cls: string }[] = [
  { from: 0, to: 60, cls: s.zGreen },
  { from: 60, to: 90, cls: s.zYellow },
  { from: 90, to: 120, cls: s.zOrange },
  { from: 120, to: 150, cls: s.zRed },
];

export default function SlingChart({ apex, labels, title }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * VW;
    if (x < X0 - 6 || x > X1 + 6) { setHover(null); return; }
    setHover(Math.round(Math.min(AMAX, Math.max(0, ((x - X0) / (X1 - X0)) * AMAX))));
  };

  const cur = apex !== null && apex >= 0 ? apex : null;
  const inRange = cur !== null && cur <= AMAX;
  const tipW = 132;

  return (
    <div className={s.chartWrap}>
      <svg className={s.chart} viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={title}
        onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)}>
        {ZONES.map((z, i) => (
          <g key={z.from}>
            <rect className={z.cls} x={xOf(z.from)} y={Y1} width={xOf(z.to) - xOf(z.from)} height={Y0 - Y1} />
            <text className={s.zoneText} x={(xOf(z.from) + xOf(z.to)) / 2} y={Y1 + 14} textAnchor="middle">{labels.zones[i]}</text>
          </g>
        ))}
        {[1, 2, 3, 4].map((f) => (
          <g key={f}>
            <line className={s.grid} x1={X0} x2={X1} y1={yOf(f)} y2={yOf(f)} />
            <text className={s.tick} x={X0 - 6} y={yOf(f) + 4} textAnchor="end">{`×${f}`}</text>
          </g>
        ))}
        {[0, 30, 60, 90, 120, 150].map((a) => (
          <text key={a} className={s.tick} x={xOf(a)} y={Y0 + 15} textAnchor="middle">{`${a}°`}</text>
        ))}
        <text className={s.axisTitle} x={(X0 + X1) / 2} y={VH - 2} textAnchor="middle">{labels.x}</text>
        <text className={s.axisTitle} x={12} y={(Y0 + Y1) / 2} textAnchor="middle" transform={`rotate(-90 12 ${(Y0 + Y1) / 2})`}>{labels.y}</text>

        <path className={s.curve} d={CURVE} />

        {hover !== null && (() => {
          const hx = xOf(hover), hy = yOf(fOfApex(hover));
          const tx = Math.min(Math.max(hx - tipW / 2, X0), X1 - tipW);
          const ty = hy - 40 < Y1 ? hy + 12 : hy - 40;
          return (
            <g className={s.hoverLayer}>
              <line className={s.crosshair} x1={hx} x2={hx} y1={Y1} y2={Y0} />
              <circle className={s.hoverDot} cx={hx} cy={hy} r={4} />
              <rect className={s.tipBox} x={tx} y={ty} width={tipW} height={26} rx={6} />
              <text className={s.tipText} x={tx + tipW / 2} y={ty + 17} textAnchor="middle">{labels.tip(hover, fOfApex(hover).toFixed(3))}</text>
            </g>
          );
        })()}

        {inRange && <circle className={s.dot} cx={xOf(cur!)} cy={yOf(fOfApex(cur!))} r={6} />}
      </svg>
      {cur !== null && !inRange && cur < 180 && (
        <p className={s.chartNote}>{labels.outside(Math.round(cur * 10) / 10, fOfApex(cur).toFixed(3))}</p>
      )}
    </div>
  );
}
