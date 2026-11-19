// 줄걸이 그림 — 훅·다리·인양물을 입력 각도대로 그린다 (줄 길이는 그림에서 고정, 각도가 벌어지면 인양물이 올라온다)
import type { Grade, Legs } from '@/lib/slingCalc';
import s from './sling-angle-calc.module.css';

interface Props {
  legs: Legs;
  /** 수직 기준 각도(도), 1줄이면 무시 */
  theta: number;
  grade: Grade | null;
  /** 각 다리 옆에 붙일 장력 글자 */
  tension?: string;
  /** 인양물 안에 쓸 중량 글자 */
  load?: string;
  /** 꼭지각 글자 (예: 60°) */
  apex?: string;
  /** 각도 등급 이름 — 색만으로 구분하지 않도록 그림에도 글자로 */
  gradeLabel?: string;
  title: string;
}

const W = 320;
const HX = 160;
const HY = 40; // 다리가 시작하는 훅 아래 끝
const LEG = 128;

const GRADE_CLASS: Record<Grade, string> = { green: s.legGreen, yellow: s.legYellow, orange: s.legOrange, red: s.legRed };
const GRADE_TEXT: Record<Grade, string> = { green: s.gtGreen, yellow: s.gtYellow, orange: s.gtOrange, red: s.gtRed };

export default function SlingDiagram({ legs, theta, grade, tension, load, apex, gradeLabel, title }: Props) {
  const t = legs === 1 ? 0 : Math.min(Math.max(theta, 0), 86);
  const rad = (t * Math.PI) / 180;
  const a = LEG * Math.sin(rad);
  const h = LEG * Math.cos(rad);
  const ay = HY + h; // 앞쪽 체결점 높이
  const spread = legs === 1 ? 0 : Math.max(a, 3);
  const half = Math.max(spread + 24, 52);
  const legCls = `${s.leg} ${grade && legs > 1 ? GRADE_CLASS[grade] : s.legNeutral}`;

  // 앞쪽 다리(실선)와 뒤쪽 다리(점선)의 체결점
  // 실선 두 다리는 입력한 각도 그대로 그린다(각도 호와 일치). 3·4줄의 나머지 다리는 뒤쪽 점선으로만 표시
  const front: [number, number][] = legs === 1 ? [[HX, ay]] : [[HX - spread, ay], [HX + spread, ay]];
  const back: [number, number][] = legs === 3 ? [[HX + spread * 0.35, ay - 12]] : legs === 4 ? [[HX - spread * 0.7, ay - 12], [HX + spread * 0.7, ay - 12]] : [];
  const deep = legs >= 3;
  const viewH = Math.ceil(ay + 50); // 그림 높이는 인양물 아래까지만 (각도가 벌어지면 낮아짐)

  // 꼭지각 호 (두 앞 다리 사이)
  const r = 24;
  const arcL = [HX - r * Math.sin(rad), HY + r * Math.cos(rad)];
  const arcR = [HX + r * Math.sin(rad), HY + r * Math.cos(rad)];

  return (
    <svg className={s.diagram} viewBox={`0 0 ${W} ${viewH}`} role="img" aria-label={title}>
      {/* 훅 */}
      <line className={s.wire} x1={HX} y1={0} x2={HX} y2={10} />
      <circle className={s.hook} cx={HX} cy={16} r={6} />
      <path className={s.hook} d={`M${HX},22 L${HX},${HY - 6} Q${HX},${HY} ${HX + 6},${HY} Q${HX + 12},${HY} ${HX + 12},${HY - 7}`} />

      {/* 인양물: 3·4줄이면 윗면을 보여 깊이를 표현 */}
      {deep && <polygon className={s.loadTop} points={`${HX - half},${ay} ${HX + half},${ay} ${HX + half - 14},${ay - 16} ${HX - half + 14},${ay - 16}`} />}
      <rect className={s.load} x={HX - half} y={ay} width={half * 2} height={42} rx={3} />
      {load && <text className={s.loadText} x={HX} y={ay + 27} textAnchor="middle">{load}</text>}

      {/* 수직 기준선 */}
      {legs > 1 && <line className={s.axis} x1={HX} y1={HY} x2={HX} y2={ay - (deep ? 16 : 0)} />}

      {back.map(([x, y], i) => <line key={`b${i}`} className={`${legCls} ${s.legBack}`} x1={HX} y1={HY} x2={x} y2={y} />)}
      {front.map(([x, y], i) => <line key={`f${i}`} className={legCls} x1={HX} y1={HY} x2={x} y2={y} />)}
      {[...back, ...front].map(([x, y], i) => <circle key={`p${i}`} className={s.pin} cx={x} cy={y} r={3.5} />)}

      {legs > 1 && t >= 4 && (
        <path className={s.arc} d={`M${arcL[0]},${arcL[1]} A${r},${r} 0 0 0 ${arcR[0]},${arcR[1]}`} />
      )}
      {/* 각도가 커서 인양물이 올라오면 각도 글자를 훅 왼쪽 위로 옮긴다 */}
      {legs > 1 && apex && (HY + r + 22 < ay - (deep ? 16 : 0)
        ? <text className={s.angleText} x={HX} y={HY + r + 18} textAnchor="middle">{apex}</text>
        : <text className={s.angleText} x={HX - 14} y={HY - 12} textAnchor="end">{apex}</text>)}

      {gradeLabel && grade && legs > 1 && <text className={`${s.gradeText} ${GRADE_TEXT[grade]}`} x={W - 8} y={18} textAnchor="end">{gradeLabel}</text>}

      {/* 다리 장력: 앞 다리 바깥쪽에 */}
      {tension && legs === 1 && <text className={s.tensionText} x={HX + 12} y={HY + h / 2} textAnchor="start">{tension}</text>}
      {tension && legs > 1 && front.map(([x], i) => {
        const left = i === 0;
        const mx = (HX + x) / 2 + (left ? -10 : 10);
        return <text key={`t${i}`} className={s.tensionText} x={mx} y={HY + h / 2} textAnchor={left ? 'end' : 'start'}>{tension}</text>;
      })}
    </svg>
  );
}
