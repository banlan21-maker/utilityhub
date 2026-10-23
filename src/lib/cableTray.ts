/**
 * 케이블 트레이 경사·오프셋 구간 현장 가공 계산.
 *
 * 형상 모델: 바닥판 + 양쪽 측면 레일(채널형). 구간은 꺾임 2곳(시작·끝)으로 이루어진다.
 * - 상하 꺾임: 바닥판이 접히는 축. 레일이 안쪽으로 접히는 꺾임은 V-컷(재료 제거),
 *   바깥으로 벌어지는 꺾임은 일자 절개(벌어진 틈은 연결판으로 덮음).
 * - 좌우 꺾임: 바깥 레일이 접히는 축. 바닥판에 안쪽 레일 → 바깥 레일 방향 V-컷,
 *   안쪽 레일은 V-컷 폭만큼 잘라냄.
 * 근거: NEMA VE 2 (Cable Tray Installation Guidelines) 4.3.3~4.3.4, 4.4.1, 4.5.
 */

export type BendDirection = 'vertical' | 'horizontal';
/** 상하: 오르막(up) / 내리막(down). 좌우: 옆으로 비키는 오프셋(offset) */
export type RouteKind = 'up' | 'down' | 'offset';
export type CutKind = 'vcut' | 'slit';

/** 기성 엘보 표준 각도 (NEMA VE 2 4.4.1의 엘보 구분) */
export const STANDARD_ELBOWS = [30, 45, 60, 90] as const;
/** 조절형 연결판을 쓰는 현장 가공 권장 최대 각도 */
export const FIELD_BEND_MAX_DEG = 45;
/** 연결판·꺾임부 양쪽 지지점 최대 거리 (NEMA VE 2: 600 mm) */
export const SUPPORT_NEAR_JOINT_M = 0.6;

const rad = (deg: number) => (deg * Math.PI) / 180;

export interface SegmentInput {
  direction: BendDirection;
  route: RouteKind;
  /** 트레이 폭 (mm) */
  widthMm: number;
  /** 측면 레일 높이 (mm) */
  heightMm: number;
  /** 상하: 높이차 H, 좌우: 옆 이동 거리 D (m) */
  riseM: number;
  /** 수평 진행 거리 L (m). 0이면 수직(상하) */
  runM: number;
}

export interface BendCut {
  /** 1 = 시작점, 2 = 끝점 */
  index: 1 | 2;
  kind: CutKind;
  /** 좌우 꺾임에서 잘려 나가는 안쪽 레일: 옆으로 이동하는 쪽(toward) / 반대쪽(away) */
  innerRail?: 'toward' | 'away';
  /** V-컷 한쪽 폭 = 기준치수 × tan(θ/2) (mm). 일자 절개는 벌어지는 틈의 한쪽 폭 */
  halfMm: number;
  fullMm: number;
  /** V-컷 깊이 = 기준치수 (mm) */
  depthMm: number;
}

export interface SegmentResult {
  angleDeg: number;
  isVerticalRiser: boolean;
  slopeLengthM: number;
  /** 가공 기준 치수: 상하 = 레일 높이, 좌우 = 트레이 폭 (mm) */
  refMm: number;
  bends: [BendCut, BendCut];
  /** 평평한 자재에서 두 꺾임 중심선 사이 마킹 거리 A (mm) */
  markingAmm: number;
  fieldBendOk: boolean;
}

export function calcSegment(i: SegmentInput): SegmentResult | null {
  const rise = Math.max(0, i.riseM);
  const run = Math.max(0, i.runM);
  if (rise <= 0) return null;
  if (i.direction === 'horizontal' && run <= 0) return null;

  const isVerticalRiser = i.direction === 'vertical' && run === 0;
  const angleDeg = isVerticalRiser ? 90 : (Math.atan(rise / run) * 180) / Math.PI;
  const slopeLengthM = Math.hypot(rise, run);
  const refMm = i.direction === 'vertical' ? i.heightMm : i.widthMm;
  const half = angleDeg < 90 ? refMm * Math.tan(rad(angleDeg / 2)) : refMm;

  const cut = (index: 1 | 2, kind: CutKind, innerRail?: 'toward' | 'away'): BendCut => ({
    index, kind, innerRail, halfMm: half, fullMm: half * 2, depthMm: refMm,
  });

  let bends: [BendCut, BendCut];
  if (i.direction === 'vertical') {
    // 오르막: 시작점은 위로 꺾여 레일이 안쪽 → V-컷, 끝점은 다시 수평으로 → 일자 절개
    bends = i.route === 'down'
      ? [cut(1, 'slit'), cut(2, 'vcut')]
      : [cut(1, 'vcut'), cut(2, 'slit')];
  } else {
    // 오프셋: 두 꺾임의 방향이 반대 → 잘려 나가는 안쪽 레일도 반대
    bends = [cut(1, 'vcut', 'toward'), cut(2, 'vcut', 'away')];
  }

  // 상하: 바닥판이 접히는 축이라 바닥판 길이 = 사선 길이.
  // 좌우: 중심선 기준 사선 길이에 V-컷으로 줄어드는 몫(폭 × tan(θ/2))을 더한다.
  const markingAmm = i.direction === 'vertical'
    ? slopeLengthM * 1000
    : slopeLengthM * 1000 + i.widthMm * Math.tan(rad(angleDeg / 2));

  return {
    angleDeg,
    isVerticalRiser,
    slopeLengthM,
    refMm,
    bends,
    markingAmm,
    fieldBendOk: angleDeg <= FIELD_BEND_MAX_DEG,
  };
}

export interface ElbowOption {
  elbowDeg: number;
  /** 같은 높이차(옆 이동 거리)를 이 엘보 각도로 맞출 때 필요한 수평 진행 거리 (m) */
  runForRiseM: number;
}

/** 계산 각도와 가장 가까운 기성 엘보 (같으면 큰 쪽). 엘보 반경만큼 위치가 달라지므로 카탈로그 확인 필요 */
export function nearestElbow(angleDeg: number, riseM: number): ElbowOption {
  const elbowDeg = [...STANDARD_ELBOWS].sort(
    (a, b) => Math.abs(a - angleDeg) - Math.abs(b - angleDeg) || b - a,
  )[0];
  return { elbowDeg, runForRiseM: elbowDeg >= 90 ? 0 : riseM / Math.tan(rad(elbowDeg)) };
}

/**
 * 사선 구간(꺾임 ① → ②) 위 지지점 위치 (꺾임 ①에서 잰 거리, m).
 * 각 꺾임부에서 600 mm 이내에 하나씩, 그 사이는 maxSpan 이하 균등 배치.
 */
export function supportPositions(slopeLengthM: number, maxSpanM: number): number[] {
  const S = slopeLengthM;
  const near = SUPPORT_NEAR_JOINT_M;
  if (S <= 0 || maxSpanM <= 0) return [];
  if (S <= near * 2) return [S / 2];
  const inner = S - near * 2;
  const gaps = Math.max(1, Math.ceil(inner / maxSpanM - 1e-9));
  return Array.from({ length: gaps + 1 }, (_, k) => near + (inner * k) / gaps);
}
