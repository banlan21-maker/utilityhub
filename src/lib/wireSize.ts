/**
 * 저압 전선 굵기 산정 (KEC 기준).
 *
 * 허용전류: KS C IEC 60364-5-52 부속서 B (KEC 232.5 허용전류 준용) 표 B.52.2~B.52.5, B.52.10, B.52.12
 *   — 동 도체, 주위온도 30 °C(기중) 기준. PVC = 70 °C, XLPE/EPR = 90 °C.
 * 보정계수: 표 B.52.14(주위온도), 표 B.52.17(복수 회로).
 * 과부하 보호 협조: KEC 212.4.1  IB ≤ In ≤ IZ.
 * 전압강하 한도: KEC 232.3.9.
 * 전압강하 계산: e = K·L·I / (1000·A)  (동선, 역률 1, 리액턴스 무시 약식)
 */

export type Insulation = 'pvc' | 'xlpe';
export type Method = 'A1' | 'B1' | 'B2' | 'C' | 'E';
export type SystemType = '1P2W' | '1P3W' | '3P3W_220' | '3P3W_380' | '3P4W';
export type Supply = 'lv' | 'hv';
export type Usage = 'lighting' | 'other';

export const SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300] as const;

/** 저압 옥내배선 최소 굵기 (KEC 231.3.1: 2.5 mm² 이상 연동선) */
export const MIN_INDOOR_SIZE = 2.5;

/** 표준 차단기 정격전류 (A) */
export const BREAKER_RATINGS = [15, 20, 30, 40, 50, 60, 75, 100, 125, 150, 175, 200, 225, 250, 300, 350, 400, 500, 600] as const;

type Row = Record<Method, number>;
const row = (A1: number, B1: number, B2: number, C: number, E: number): Row => ({ A1, B1, B2, C, E });

/** [절연][부하도체 수] → 굵기별 허용전류. 순서는 SIZES와 같다 */
const TABLE: Record<Insulation, Record<2 | 3, Row[]>> = {
  pvc: {
    // B.52.2 (A1·B1·B2·C) + B.52.10 다심 E
    2: [
      row(14.5, 17.5, 16.5, 19.5, 22), row(19.5, 24, 23, 27, 30), row(26, 32, 30, 36, 40), row(34, 41, 38, 46, 51),
      row(46, 57, 52, 63, 70), row(61, 76, 69, 85, 94), row(80, 101, 90, 112, 119), row(99, 125, 111, 138, 148),
      row(119, 151, 133, 168, 180), row(151, 192, 168, 213, 232), row(182, 232, 201, 258, 282), row(210, 269, 232, 299, 328),
      row(240, 300, 258, 344, 379), row(273, 341, 294, 392, 434), row(320, 400, 344, 461, 514), row(367, 458, 394, 530, 593),
    ],
    // B.52.4 + B.52.10 다심 E
    3: [
      row(13.5, 15.5, 15, 17.5, 18.5), row(18, 21, 20, 24, 25), row(24, 28, 27, 32, 34), row(31, 36, 34, 41, 43),
      row(42, 50, 46, 57, 60), row(56, 68, 62, 76, 80), row(73, 89, 80, 96, 101), row(89, 110, 99, 119, 126),
      row(108, 134, 118, 144, 153), row(136, 171, 149, 184, 196), row(164, 207, 179, 223, 238), row(188, 239, 206, 259, 276),
      row(216, 262, 225, 299, 319), row(245, 296, 255, 341, 364), row(286, 346, 297, 403, 430), row(328, 394, 339, 464, 497),
    ],
  },
  xlpe: {
    // B.52.3 + B.52.12 다심 E
    2: [
      row(19, 23, 22, 24, 26), row(26, 31, 30, 33, 36), row(35, 42, 40, 45, 49), row(45, 54, 51, 58, 63),
      row(61, 75, 69, 80, 86), row(81, 100, 91, 107, 115), row(106, 133, 119, 138, 149), row(131, 164, 146, 171, 185),
      row(158, 198, 175, 209, 225), row(200, 253, 221, 269, 289), row(241, 306, 265, 328, 352), row(278, 354, 305, 382, 410),
      row(318, 393, 334, 441, 473), row(362, 449, 384, 506, 542), row(424, 528, 459, 599, 641), row(486, 603, 532, 693, 741),
    ],
    // B.52.5 + B.52.12 다심 E
    3: [
      row(17, 20, 19.5, 22, 23), row(23, 28, 26, 30, 32), row(31, 37, 35, 40, 42), row(40, 48, 44, 52, 54),
      row(54, 66, 60, 71, 75), row(73, 88, 80, 96, 100), row(95, 117, 105, 119, 127), row(117, 144, 128, 147, 158),
      row(141, 175, 154, 179, 192), row(179, 222, 194, 229, 246), row(216, 269, 233, 278, 298), row(249, 312, 268, 322, 346),
      row(285, 342, 300, 371, 399), row(324, 384, 340, 424, 456), row(380, 450, 398, 500, 538), row(435, 514, 455, 576, 621),
    ],
  },
};

/** 표 B.52.14 — 기중 주위온도 보정 */
const TEMP_FACTOR: Record<Insulation, Record<number, number>> = {
  pvc: { 10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.0, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.5 },
  xlpe: { 10: 1.15, 15: 1.12, 20: 1.08, 25: 1.04, 30: 1.0, 35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76, 60: 0.71 },
};
export const AMBIENT_TEMPS = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60] as const;

/** 표 B.52.17 — 복수 회로 저감계수. 항목 1(묶음·전선관·매입), 항목 4(통풍형 트레이 1단) */
const GROUP_BUNCHED: [number, number][] = [[1, 1], [2, 0.8], [3, 0.7], [4, 0.65], [5, 0.6], [6, 0.57], [7, 0.54], [8, 0.52], [9, 0.5], [12, 0.45], [16, 0.41], [20, 0.38]];
const GROUP_TRAY: [number, number][] = [[1, 1], [2, 0.88], [3, 0.82], [4, 0.77], [5, 0.75], [6, 0.73], [7, 0.73], [8, 0.72], [9, 0.72]];

function groupFactor(method: Method, circuits: number): number {
  const table = method === 'E' ? GROUP_TRAY : GROUP_BUNCHED;
  const n = Math.max(1, Math.floor(circuits));
  // 표에 없는 회로 수는 바로 다음(더 많은) 회로 수 값으로 — 안전측
  const hit = table.find(([c]) => c >= n) ?? table[table.length - 1];
  return hit[1];
}

export const SYSTEMS: Record<SystemType, { K: number; dropBaseV: number; lineV: number; phases: 1 | 3; loaded: 2 | 3 }> = {
  '1P2W': { K: 35.6, dropBaseV: 220, lineV: 220, phases: 1, loaded: 2 },
  '1P3W': { K: 17.8, dropBaseV: 220, lineV: 220, phases: 1, loaded: 2 },
  '3P3W_220': { K: 30.8, dropBaseV: 220, lineV: 220, phases: 3, loaded: 3 },
  '3P3W_380': { K: 30.8, dropBaseV: 380, lineV: 380, phases: 3, loaded: 3 },
  // 3상 4선식은 상전압(220 V) 기준으로 전압강하를 본다
  '3P4W': { K: 17.8, dropBaseV: 220, lineV: 380, phases: 3, loaded: 3 },
};

/** KEC 232.3.9 수용가 설비 전압강하 한도 (%) */
export function voltageDropLimit(supply: Supply, usage: Usage, lengthM: number): number {
  const base = supply === 'lv' ? (usage === 'lighting' ? 3 : 5) : (usage === 'lighting' ? 6 : 8);
  // 배선설비가 100 m를 넘으면 초과 1 m당 0.005 %, 최대 0.5 %까지 더할 수 있다
  const extra = lengthM > 100 ? Math.min((lengthM - 100) * 0.005, 0.5) : 0;
  return base + extra;
}

export function loadCurrentFromKw(kw: number, system: SystemType, pf: number): number {
  const sys = SYSTEMS[system];
  if (kw <= 0 || pf <= 0) return 0;
  return sys.phases === 1 ? (kw * 1000) / (sys.lineV * pf) : (kw * 1000) / (Math.sqrt(3) * sys.lineV * pf);
}

export interface WireInput {
  loadA: number;
  lengthM: number;
  system: SystemType;
  insulation: Insulation;
  method: Method;
  ambientC: number;
  circuits: number;
  dropLimitPct: number;
}

export interface WireResult {
  breakerA: number | null;
  correction: number;
  tempFactor: number;
  groupFactor: number;
  /** 차단기 정격을 견디기 위한 표 기준 허용전류 */
  requiredTableA: number;
  sizeByAmpacity: number | null;
  sizeByDrop: number | null;
  sizeByMin: number;
  recommended: number | null;
  governing: 'ampacity' | 'drop' | 'min' | null;
  /** 권장 굵기의 보정 후 허용전류 IZ */
  izA: number | null;
  dropV: number | null;
  dropPct: number | null;
}

export function ampacity(insulation: Insulation, loaded: 2 | 3, method: Method, size: number): number {
  const i = SIZES.indexOf(size as (typeof SIZES)[number]);
  return i < 0 ? 0 : TABLE[insulation][loaded][i][method];
}

export function calcWire(i: WireInput): WireResult {
  const sys = SYSTEMS[i.system];
  const tempFactor = TEMP_FACTOR[i.insulation][i.ambientC] ?? 1;
  const gFactor = groupFactor(i.method, i.circuits);
  const correction = tempFactor * gFactor;

  const breakerA = BREAKER_RATINGS.find(r => r >= i.loadA) ?? null;
  const requiredTableA = breakerA ? breakerA / correction : Infinity;
  const sizeByAmpacity = SIZES.find(sz => ampacity(i.insulation, sys.loaded, i.method, sz) >= requiredTableA) ?? null;

  const allowedV = sys.dropBaseV * (i.dropLimitPct / 100);
  const needArea = allowedV > 0 ? (sys.K * i.lengthM * i.loadA) / (1000 * allowedV) : Infinity;
  const sizeByDrop = SIZES.find(sz => sz >= needArea) ?? null;

  const sizeByMin = MIN_INDOOR_SIZE;
  let recommended: number | null = null;
  let governing: WireResult['governing'] = null;
  if (sizeByAmpacity !== null && sizeByDrop !== null) {
    recommended = Math.max(sizeByAmpacity, sizeByDrop, sizeByMin);
    // 같은 굵기면 허용전류 → 전압강하 → 최소 굵기 순으로 결정 근거를 표시
    governing = recommended === sizeByAmpacity ? 'ampacity' : recommended === sizeByDrop ? 'drop' : 'min';
  }

  const izA = recommended ? ampacity(i.insulation, sys.loaded, i.method, recommended) * correction : null;
  const dropV = recommended ? (sys.K * i.lengthM * i.loadA) / (1000 * recommended) : null;
  const dropPct = dropV !== null ? (dropV / sys.dropBaseV) * 100 : null;

  return {
    breakerA, correction, tempFactor, groupFactor: gFactor, requiredTableA,
    sizeByAmpacity, sizeByDrop, sizeByMin, recommended, governing, izA, dropV, dropPct,
  };
}
