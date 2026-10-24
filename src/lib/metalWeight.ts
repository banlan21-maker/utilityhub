/**
 * 금속 형상별 단면적·중량·도장 면적.
 *
 * 기준
 * - 형강(H형강·ㄷ형강·ㄱ형강·T형강): KS D 3502 / JIS G 3192 치수표처럼 필렛 반경(r, r1, r2)을 넣어 단면적을 구한다.
 *   필렛을 빼면 규격표보다 1~3% 가볍게 나온다.
 * - 각형강관: KS D 3568 단위질량 식 W = 0.0157·t·(A+B−3.287t) 은 모서리 외측 R = 2t, 내측 R = t 를 가정한 값이다.
 * - 무늬강판: 같은 두께 평판 + 무늬 1.67 kg/㎡(강재 기준, 제조사 표). 다른 재질은 밀도 비율로 환산한다.
 * - 중량(kg) = 단면적(㎟) × 길이(m) × 밀도(g/㎤) ÷ 1000
 */

export type ShapeId = 'round' | 'pipe' | 'square' | 'sqtube' | 'hex' | 'flat' | 'plate' | 'angle' | 'channel' | 'hbeam' | 'tshape' | 'checkered';
export type DimKey = 'D' | 'W' | 'H' | 'L' | 't' | 't1' | 't2' | 'S' | 'r' | 'r1' | 'r2';
/** 빈 값(null)은 "입력하지 않음" — 필렛·모서리 반경은 기본값을 쓴다 */
export type Dims = Partial<Record<DimKey, number | null>>;

export interface ShapeDef {
  id: ShapeId;
  fields: DimKey[];
  /** 필수가 아닌 칸 (필렛·모서리 반경) */
  optional: DimKey[];
  /** 길이 대신 판재처럼 W×L 면적으로 계산 */
  sheet: boolean;
}

export const SHAPES: ShapeDef[] = [
  { id: 'round', fields: ['D'], optional: [], sheet: false },
  { id: 'pipe', fields: ['D', 't'], optional: [], sheet: false },
  { id: 'square', fields: ['W', 'H'], optional: [], sheet: false },
  { id: 'sqtube', fields: ['W', 'H', 't', 'r'], optional: ['r'], sheet: false },
  { id: 'hex', fields: ['S'], optional: [], sheet: false },
  { id: 'flat', fields: ['W', 't'], optional: [], sheet: false },
  { id: 'plate', fields: ['W', 'L', 't'], optional: [], sheet: true },
  { id: 'angle', fields: ['W', 'H', 't', 'r1', 'r2'], optional: ['r1', 'r2'], sheet: false },
  { id: 'channel', fields: ['H', 'W', 't1', 't2', 'r1', 'r2'], optional: ['r1', 'r2'], sheet: false },
  { id: 'hbeam', fields: ['H', 'W', 't1', 't2', 'r'], optional: ['r'], sheet: false },
  { id: 'tshape', fields: ['H', 'W', 't1', 't2', 'r'], optional: ['r'], sheet: false },
  { id: 'checkered', fields: ['W', 'L', 't'], optional: [], sheet: true },
];

export const shapeDef = (id: ShapeId) => SHAPES.find(s => s.id === id)!;

export const STEEL_DENSITY = 7.85;
/** 무늬강판 무늬 질량 (강재, kg/㎡) — 예: 3.2t 평판 25.12 + 1.67 = 26.79 kg/㎡ */
export const CHECKER_LUG = 1.67;

const v = (d: Dims, k: DimKey) => d[k] ?? 0;
const QUARTER = 1 - Math.PI / 4; // 모서리 하나를 둥글게 깎을 때 r² 에 곱하는 넓이 비율

/** 각형강관 모서리 외측 반경: 입력이 없으면 KS D 3568 기준 2t */
export const tubeRadius = (d: Dims) => {
  const t = v(d, 't');
  const r = d.r ?? 2 * t;
  return Math.min(Math.max(0, r), Math.min(v(d, 'W'), v(d, 'H')) / 2);
};

export type ErrorCode = 'pipeWall' | 'tubeWall' | 'angleLeg' | 'flangeTooThick' | 'webTooThick' | null;

/** 치수가 형상으로 성립하는지 */
export function validate(shape: ShapeId, d: Dims): ErrorCode {
  const { D = 0, W = 0, H = 0, t = 0, t1 = 0, t2 = 0 } = Object.fromEntries(Object.entries(d).map(([k, x]) => [k, x ?? 0]));
  switch (shape) {
    case 'pipe': return D > 0 && t > 0 && t >= D / 2 ? 'pipeWall' : null;
    case 'sqtube': return W > 0 && H > 0 && t > 0 && 2 * t >= Math.min(W, H) ? 'tubeWall' : null;
    case 'angle': return W > 0 && H > 0 && t > 0 && t >= Math.min(W, H) ? 'angleLeg' : null;
    case 'channel':
    case 'hbeam':
      if (H > 0 && t2 > 0 && 2 * t2 >= H) return 'flangeTooThick';
      return W > 0 && t1 > 0 && t1 >= W ? 'webTooThick' : null;
    case 'tshape':
      if (H > 0 && t2 > 0 && t2 >= H) return 'flangeTooThick';
      return W > 0 && t1 > 0 && t1 >= W ? 'webTooThick' : null;
    default: return null;
  }
}

/** 필수 치수가 모두 들어왔는지 */
export const isComplete = (shape: ShapeId, d: Dims) => {
  const def = shapeDef(shape);
  return def.fields.every(k => def.optional.includes(k) || v(d, k) > 0);
};

/** 단면적(㎟). 판재류는 W×t (폭 방향 단면) */
export function sectionArea(shape: ShapeId, d: Dims): number {
  const D = v(d, 'D'), W = v(d, 'W'), H = v(d, 'H'), t = v(d, 't'), t1 = v(d, 't1'), t2 = v(d, 't2');
  const S = v(d, 'S'), r = v(d, 'r'), r1 = v(d, 'r1'), r2 = v(d, 'r2');
  switch (shape) {
    case 'round': return Math.PI * D * D / 4;
    case 'pipe': return Math.PI * (D - t) * t;
    case 'square': return W * H;
    case 'flat': return W * t;
    case 'sqtube': {
      const R = tubeRadius(d), ri = Math.max(0, R - t);
      return 2 * t * (W + H - 2 * t) - (4 - Math.PI) * (R * R - ri * ri);
    }
    case 'hex': return (Math.sqrt(3) / 2) * S * S;
    // 안쪽 모서리 필렛 r1 은 더하고, 다리 끝 둥근 모서리 r2(2곳)는 뺀다
    case 'angle': return t * (W + H - t) + QUARTER * (r1 * r1 - 2 * r2 * r2);
    // 웹-플랜지 안쪽 필렛 r1(2곳) 더하고, 플랜지 끝 r2(2곳) 뺀다
    case 'channel': return 2 * W * t2 + (H - 2 * t2) * t1 + 2 * QUARTER * (r1 * r1 - r2 * r2);
    // 필렛 4곳
    case 'hbeam': return 2 * W * t2 + (H - 2 * t2) * t1 + 4 * QUARTER * r * r;
    // 필렛 2곳
    case 'tshape': return W * t2 + (H - t2) * t1 + 2 * QUARTER * r * r;
    case 'plate':
    case 'checkered': return W * t;
  }
}

/** 도장 둘레(mm) — 바깥에 드러나는 면 기준. 파이프·각관은 바깥면만, 형강 필렛 곡면 차이는 무시 */
export function paintPerimeter(shape: ShapeId, d: Dims): number {
  const D = v(d, 'D'), W = v(d, 'W'), H = v(d, 'H'), t = v(d, 't'), t1 = v(d, 't1'), S = v(d, 'S');
  switch (shape) {
    case 'round':
    case 'pipe': return Math.PI * D;
    case 'square': return 2 * (W + H);
    case 'flat': return 2 * (W + t);
    case 'sqtube': return 2 * (W + H) - (8 - 2 * Math.PI) * tubeRadius(d);
    case 'hex': return 2 * Math.sqrt(3) * S;
    case 'angle': return 2 * (W + H);
    case 'channel': return 2 * H + 4 * W - 2 * t1;
    case 'hbeam': return 2 * H + 4 * W - 2 * t1;
    case 'tshape': return 2 * (W + H);
    case 'plate':
    case 'checkered': return 0;
  }
}

export interface CalcInput {
  shape: ShapeId;
  dims: Dims;
  /** 막대류 길이(m). 판재류는 dims.L(mm) 사용 */
  lengthM: number;
  qty: number;
  density: number;
  lossPct: number;
  /** 판재 도장 면: 양면 2, 한 면 1 */
  plateFaces: 1 | 2;
}

export interface CalcResult {
  areaMm2: number;
  /** 막대류: kg/m, 판재류: kg/㎡ */
  unitMass: number;
  pieceKg: number;
  netKg: number;
  orderKg: number;
  paintM2: number;
}

export function calc(i: CalcInput): CalcResult | null {
  if (!isComplete(i.shape, i.dims) || validate(i.shape, i.dims) || !(i.qty > 0) || !(i.density > 0)) return null;
  const def = shapeDef(i.shape);
  let unitMass: number, pieceKg: number, paintM2: number;
  if (def.sheet) {
    const W = v(i.dims, 'W'), L = v(i.dims, 'L'), t = v(i.dims, 't');
    const m2 = (W * L) / 1e6;
    unitMass = t * i.density + (i.shape === 'checkered' ? CHECKER_LUG * (i.density / STEEL_DENSITY) : 0);
    pieceKg = unitMass * m2;
    paintM2 = m2 * i.plateFaces * i.qty;
  } else {
    if (!(i.lengthM > 0)) return null;
    unitMass = (sectionArea(i.shape, i.dims) * i.density) / 1000;
    pieceKg = unitMass * i.lengthM;
    paintM2 = (paintPerimeter(i.shape, i.dims) / 1000) * i.lengthM * i.qty;
  }
  const netKg = pieceKg * i.qty;
  return {
    areaMm2: sectionArea(i.shape, i.dims),
    unitMass,
    pieceKg,
    netKg,
    orderKg: netKg * (1 + Math.max(0, i.lossPct) / 100),
    paintM2,
  };
}

export interface Preset { label: string; dims: Dims }

/**
 * 규격 프리셋. 형강은 KS D 3502 / JIS G 3192 치수(필렛 포함),
 * 강관은 KS D 3507(SPP)·KS D 3562 SCH40 외경×두께.
 */
export const PRESETS: Partial<Record<ShapeId, { group?: string; items: Preset[] }[]>> = {
  hbeam: [{
    items: [
      [100, 100, 6, 8, 10], [150, 75, 5, 7, 8], [150, 150, 7, 10, 11], [200, 100, 5.5, 8, 11], [200, 200, 8, 12, 13],
      [250, 125, 6, 9, 12], [300, 150, 6.5, 9, 13], [300, 300, 10, 15, 18], [350, 175, 7, 11, 14], [400, 200, 8, 13, 16],
    ].map(([H, W, t1, t2, r]) => ({ label: `H-${H}×${W}×${t1}×${t2}`, dims: { H, W, t1, t2, r } })),
  }],
  channel: [{
    items: [
      [75, 40, 5, 7, 8, 4], [100, 50, 5, 7.5, 8, 4], [125, 65, 6, 8, 8, 4], [150, 75, 6.5, 10, 10, 5], [150, 75, 9, 12.5, 15, 7.5],
      [180, 75, 7, 10.5, 11, 5.5], [200, 80, 7.5, 11, 12, 6], [200, 90, 8, 13.5, 14, 7], [250, 90, 9, 13, 14, 7], [300, 90, 9, 13, 14, 7],
    ].map(([H, W, t1, t2, r1, r2]) => ({ label: `C-${H}×${W}×${t1}×${t2}`, dims: { H, W, t1, t2, r1, r2 } })),
  }],
  angle: [{
    items: [
      [50, 4, 6.5, 3], [50, 5, 6.5, 3], [50, 6, 6.5, 4.5], [65, 6, 8.5, 4], [75, 6, 8.5, 4], [75, 9, 8.5, 6],
      [90, 7, 10, 5], [90, 10, 10, 7], [100, 7, 10, 5], [100, 10, 10, 7], [130, 9, 12, 6], [150, 12, 14, 7],
    ].map(([A, t, r1, r2]) => ({ label: `L-${A}×${A}×${t}`, dims: { W: A, H: A, t, r1, r2 } })),
  }],
  pipe: [
    {
      group: 'SPP (KS D 3507)',
      items: ([[15, 21.7, 2.8], [20, 27.2, 2.8], [25, 34.0, 3.2], [32, 42.7, 3.5], [40, 48.6, 3.5], [50, 60.5, 3.8], [65, 76.3, 4.2],
        [80, 89.1, 4.2], [100, 114.3, 4.5], [125, 139.8, 4.5], [150, 165.2, 5.0], [200, 216.3, 5.8]] as const)
        .map(([A, D, t]) => ({ label: `SPP ${A}A (Ø${D}×${t})`, dims: { D, t } })),
    },
    {
      group: 'SCH40 (KS D 3562)',
      items: ([[15, 21.7, 2.8], [20, 27.2, 2.9], [25, 34.0, 3.4], [32, 42.7, 3.6], [40, 48.6, 3.7], [50, 60.5, 3.9], [65, 76.3, 5.2],
        [80, 89.1, 5.5], [100, 114.3, 6.0], [125, 139.8, 6.6], [150, 165.2, 7.1], [200, 216.3, 8.2]] as const)
        .map(([A, D, t]) => ({ label: `SCH40 ${A}A (Ø${D}×${t})`, dims: { D, t } })),
    },
  ],
  sqtube: [{
    items: [
      [50, 50, 2.3], [75, 75, 3.2], [100, 100, 3.2], [100, 100, 4.5], [125, 125, 4.5], [150, 150, 4.5], [150, 150, 6],
      [200, 200, 6], [100, 50, 2.3], [100, 50, 3.2], [125, 75, 3.2], [150, 100, 4.5],
    ].map(([W, H, t]) => ({ label: `□${W}×${H}×${t}`, dims: { W, H, t } })),
  }],
};

/** 보기용 기본 치수 (아직 입력이 없을 때 단면도를 그리기 위한 값) */
export const SAMPLE_DIMS: Record<ShapeId, Dims> = {
  round: { D: 50 }, pipe: { D: 60.5, t: 3.8 }, square: { W: 50, H: 50 }, sqtube: { W: 100, H: 100, t: 3.2 },
  hex: { S: 30 }, flat: { W: 50, t: 6 }, plate: { W: 1219, L: 2438, t: 6 }, checkered: { W: 1219, L: 2438, t: 4.5 },
  angle: { W: 50, H: 50, t: 4, r1: 6.5, r2: 3 }, channel: { H: 100, W: 50, t1: 5, t2: 7.5, r1: 8, r2: 4 },
  hbeam: { H: 200, W: 100, t1: 5.5, t2: 8, r: 11 }, tshape: { H: 100, W: 100, t1: 6, t2: 8, r: 10 },
};

/** 규격 표기 */
export function specLabel(shape: ShapeId, d: Dims): string {
  const f = (k: DimKey) => String(v(d, k));
  switch (shape) {
    case 'round': return `Ø${f('D')}`;
    case 'pipe': return `Ø${f('D')}×${f('t')}t`;
    case 'square': return `□${f('W')}×${f('H')}`;
    case 'sqtube': return `□${f('W')}×${f('H')}×${f('t')}t`;
    case 'hex': return `HEX ${f('S')}`;
    case 'flat': return `FB ${f('W')}×${f('t')}`;
    case 'plate':
    case 'checkered': return `${f('t')}t×${f('W')}×${f('L')}`;
    case 'angle': return `L-${f('W')}×${f('H')}×${f('t')}`;
    case 'channel': return `C-${f('H')}×${f('W')}×${f('t1')}×${f('t2')}`;
    case 'hbeam': return `H-${f('H')}×${f('W')}×${f('t1')}×${f('t2')}`;
    case 'tshape': return `T-${f('H')}×${f('W')}×${f('t1')}×${f('t2')}`;
  }
}
