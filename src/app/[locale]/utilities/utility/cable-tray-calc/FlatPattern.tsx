import type { BendCut, BendDirection } from '@/lib/cableTray';
import s from './cable-tray-calc.module.css';

const VB_W = 360;
const fmt = (n: number) => (Math.round(n * 10) / 10).toString();

/** 치수선: 양 끝 눈금 + 가운데 글자 */
function Dim({ x1, x2, y, label, tick = 6 }: { x1: number; x2: number; y: number; label: string; tick?: number }) {
  return (
    <g className={s.dim}>
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1} y1={y - tick} x2={x1} y2={y + tick} />
      <line x1={x2} y1={y - tick} x2={x2} y2={y + tick} />
      <text x={(x1 + x2) / 2} y={y - 6} textAnchor="middle">{label}</text>
    </g>
  );
}

/**
 * 꺾임 1곳 마킹 상세 — 실제 비율(가로·세로 같은 축척).
 * 상하: 측면 레일을 옆에서 본 모습. 좌우: 바닥판을 위에서 본 모습.
 */
export function BendDetail({ bend, direction, isKo }: { bend: BendCut; direction: BendDirection; isKo: boolean }) {
  const ref = bend.depthMm;
  const half = bend.halfMm;
  const windowMm = Math.max(half * 4, ref * 2.4, 160);
  const k = (VB_W - 40) / windowMm; // mm → px (가로·세로 동일)
  const cx = VB_W / 2;
  const top = 76;
  const depthPx = ref * k;
  const halfPx = half * k;
  const left = cx - (windowMm * k) / 2;
  const right = cx + (windowMm * k) / 2;
  const VB_H = top + depthPx + 62;

  const isSlit = bend.kind === 'slit';
  // V가 좁으면 양쪽 치수 글자가 붙어 버리므로 한 줄로 합쳐 표시한다
  const narrow = halfPx < 26;
  const stockLabel = direction === 'vertical'
    ? (isKo ? `측면 레일 (높이 ${ref}mm)` : `Side rail (${ref} mm high)`)
    : (isKo ? `바닥판 (폭 ${ref}mm)` : `Bottom (${ref} mm wide)`);
  const topEdge = direction === 'vertical'
    ? (isKo ? '레일 윗면' : 'Rail top')
    : (isKo ? '안쪽 레일 (V 폭만큼 잘라냄)' : 'Inner rail (remove the V width)');
  const bottomEdge = direction === 'vertical'
    ? (isKo ? '바닥판 쪽 — 자르지 않음' : 'Bottom side — do not cut')
    : (isKo ? '바깥 레일 — 자르지 않고 접음' : 'Outer rail — fold, do not cut');

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className={s.pattern_svg} role="img"
      aria-label={isKo ? `꺾임 ${bend.index} 마킹 상세도` : `Bend ${bend.index} marking detail`}>
      <text x={left} y={16} className={s.pattern_title}>{stockLabel}</text>
      <text x={right} y={16} textAnchor="end" className={s.pattern_note}>{isKo ? '실제 비율' : 'True proportion'}</text>

      <rect x={left} y={top} width={right - left} height={depthPx} className={s.stock} />
      <text x={left + 4} y={top - 6} className={s.edge_label}>{topEdge}</text>
      {!isSlit && halfPx < 60 && !narrow && (
        <text x={cx} y={30} textAnchor="middle" className={s.pattern_note}>
          {isKo ? '중심선에서 양쪽으로 표시' : 'Mark both sides of center'}
        </text>
      )}
      <text x={left + 4} y={top + depthPx + 16} className={s.edge_label}>{bottomEdge}</text>

      {isSlit ? (
        <line x1={cx} y1={top} x2={cx} y2={top + depthPx} className={s.slit_line} />
      ) : (
        <polygon points={`${cx - halfPx},${top} ${cx + halfPx},${top} ${cx},${top + depthPx}`} className={s.vcut_area} />
      )}
      <line x1={cx} y1={top - 14} x2={cx} y2={top + depthPx + 6} className={s.center_line} />

      {isSlit ? (
        <>
          <text x={cx} y={36} textAnchor="middle" className={s.slit_text}>
            {isKo ? '중심선을 따라 일자로 끝까지 절개' : 'Cut straight down the centerline'}
          </text>
          <text x={cx} y={52} textAnchor="middle" className={s.slit_text}>
            {isKo ? `접으면 위쪽이 ${fmt(bend.fullMm)}mm 벌어짐 → 연결판으로 덮음` : `Opens ${fmt(bend.fullMm)} mm at the top → cover with splice plate`}
          </text>
        </>
      ) : (
        <>
          {narrow ? (
            <Dim x1={cx - halfPx} x2={cx + halfPx} y={top - 24}
              label={isKo ? `한쪽 ${fmt(half)} · 전체 ${fmt(bend.fullMm)}` : `half ${fmt(half)} · full ${fmt(bend.fullMm)}`} />
          ) : (
            <>
              <Dim x1={cx - halfPx} x2={cx} y={top - 24} label={fmt(half)} />
              <Dim x1={cx} x2={cx + halfPx} y={top - 24} label={fmt(half)} />
              <Dim x1={cx - halfPx} x2={cx + halfPx} y={top + depthPx + 40} label={isKo ? `전체 ${fmt(bend.fullMm)}mm` : `Full ${fmt(bend.fullMm)} mm`} />
            </>
          )}
          <g className={s.dim}>
            <line x1={right + 0} y1={top} x2={right + 0} y2={top + depthPx} />
          </g>
          <text x={right - 4} y={top + depthPx / 2} textAnchor="end" className={s.depth_text}>
            {direction === 'vertical'
              ? (isKo ? `깊이 ${ref}` : `depth ${ref}`)
              : (isKo ? `폭 전체 ${ref}` : `full width ${ref}`)}
          </text>
        </>
      )}
    </svg>
  );
}

/** 전체 구간 개략도 (축척 아님): 꺾임 ①·② 위치와 마킹 간격 A */
export function SegmentOverview({ bends, markingAmm, direction, isKo }: {
  bends: [BendCut, BendCut]; markingAmm: number; direction: BendDirection; isKo: boolean;
}) {
  const y = 60;
  const x1 = 90, x2 = 270;
  const kindLabel = (b: BendCut) => {
    if (b.kind === 'slit') return isKo ? '일자 절개' : 'Slit';
    if (direction === 'horizontal') {
      return b.innerRail === 'toward'
        ? (isKo ? 'V-컷 · 이동 쪽 레일 절단' : 'V-cut · cut rail on offset side')
        : (isKo ? 'V-컷 · 반대쪽 레일 절단' : 'V-cut · cut opposite rail');
    }
    return 'V-컷';
  };
  return (
    <svg viewBox={`0 0 ${VB_W} 130`} className={s.pattern_svg} role="img"
      aria-label={isKo ? '구간 마킹 개략도' : 'Segment marking overview'}>
      <text x={10} y={16} className={s.pattern_title}>{isKo ? '자재 위 마킹 위치' : 'Marks on the tray'}</text>
      <text x={VB_W - 10} y={16} textAnchor="end" className={s.pattern_note}>{isKo ? '개략도 · 축척 아님' : 'Schematic · not to scale'}</text>
      <rect x={10} y={y - 12} width={VB_W - 20} height={24} className={s.stock} />
      {bends.map((b, i) => {
        const x = i === 0 ? x1 : x2;
        return (
          <g key={b.index}>
            <line x1={x} y1={y - 20} x2={x} y2={y + 20} className={b.kind === 'slit' ? s.slit_line : s.mark_line} />
            <circle cx={x} cy={y - 30} r={10} className={s.mark_badge} />
            <text x={x} y={y - 26} textAnchor="middle" className={s.mark_badge_text}>{b.index}</text>
            <text x={x} y={y + 36} textAnchor="middle" className={s.edge_label}>{kindLabel(b)}</text>
          </g>
        );
      })}
      <Dim x1={x1} x2={x2} y={y + 58} label={`A = ${Math.round(markingAmm)} mm`} />
    </svg>
  );
}
