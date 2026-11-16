'use client';

// 세로 막대 차트 (단일 계열). 막대에 마우스를 올리면 값, 아래 '표로 보기'로 전체 값.
import { useState } from 'react';
import s from '../admin.module.css';

export interface Bar { label: string; value: number; note?: string }

export default function BarChart({ data, unit = '', height = 160, title }: { data: Bar[]; unit?: string; height?: number; title: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = height;
  const padB = 20;
  const padT = 8;
  const max = Math.max(1, ...data.map((d) => d.value));
  // 보기 좋은 눈금 최댓값
  const mag = 10 ** Math.floor(Math.log10(max));
  const top = Math.ceil(max / mag) * mag;
  const n = Math.max(1, data.length);
  const slot = W / n;
  const bw = Math.max(2, slot - 2); // 막대 사이 2px
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / top);
  const every = Math.ceil(n / 8);

  return (
    <div className={s.chart}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title} 막대 차트`} onMouseLeave={() => setHover(null)}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={0} x2={W} y1={y(top * f)} y2={y(top * f)} className={s.chartGrid} />
            <text x={0} y={y(top * f) - 3} className={s.chartAxis}>{(top * f).toLocaleString('ko-KR')}{unit}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = i * slot + (slot - bw) / 2;
          const h = Math.max(d.value > 0 ? 1.5 : 0, H - padB - y(d.value));
          const r = Math.min(4, bw / 2, h);
          // 위쪽만 둥글게(바닥은 기준선에 붙임)
          const path = `M ${x} ${H - padB} L ${x} ${H - padB - h + r} Q ${x} ${H - padB - h} ${x + r} ${H - padB - h} L ${x + bw - r} ${H - padB - h} Q ${x + bw} ${H - padB - h} ${x + bw} ${H - padB - h + r} L ${x + bw} ${H - padB} Z`;
          return (
            <g key={d.label}>
              {h > 0 && <path d={path} className={hover === null || hover === i ? s.chartBar : s.chartBarDim} />}
              {/* 막대보다 넓은 마우스 영역 */}
              <rect x={i * slot} y={0} width={slot} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
              {i % every === 0 && (
                <text x={x + bw / 2} y={H - 5} textAnchor="middle" className={s.chartAxis}>{d.label}</text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && data[hover] && (
        <div className={s.tip} style={{ left: `${((hover + 0.5) / n) * 100}%`, top: `${(y(data[hover].value) / H) * 100}%` }}>
          {data[hover].label} · {data[hover].value.toLocaleString('ko-KR')}{unit}{data[hover].note ? ` · ${data[hover].note}` : ''}
        </div>
      )}
      <details className={s.tableToggle}>
        <summary>표로 보기</summary>
        <table className={s.table}>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}><td>{d.label}</td><td className={s.num}>{d.value.toLocaleString('ko-KR')}{unit}</td><td>{d.note}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
