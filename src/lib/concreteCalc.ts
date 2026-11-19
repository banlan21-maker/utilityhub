// 콘크리트·레미콘 물량 계산 — 화면과 무관한 순수 계산 (브라우저에서만 실행, 서버 전송 없음)
// 모든 길이는 미터, 부피는 ㎥로 바꿔 계산하고 표시할 때만 단위를 바꾼다.

export type UnitSystem = 'metric' | 'imperial';
export type LenUnit = 'm' | 'cm' | 'mm' | 'ft' | 'in';
export type VolUnit = 'm3' | 'yd3' | 'ft3';
export type ShapeKind = 'slab' | 'wall' | 'box' | 'cyl' | 'hole' | 'stairs' | 'manual';
export type PostShape = 'none' | 'square' | 'round';
export type StairType = 'waist' | 'solid';

export const LEN_TO_M: Record<LenUnit, number> = { m: 1, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254 };
export const YD3_M3 = 0.764555; // 1 cubic yard = 27 ft³ = 0.764555 ㎥
export const FT3_M3 = YD3_M3 / 27;
export const VOL_TO_M3: Record<VolUnit, number> = { m3: 1, yd3: YD3_M3, ft3: FT3_M3 };
export const UNITS: Record<UnitSystem, LenUnit[]> = { metric: ['m', 'cm', 'mm'], imperial: ['ft', 'in'] };

export const SHAPES: ShapeKind[] = ['slab', 'wall', 'box', 'cyl', 'hole', 'stairs', 'manual'];

/** 치수 하나: 입력 문자열 그대로 + 단위 (목록에 다시 보여 줄 때 입력한 그대로 표시) */
export interface Dim { v: string; u: LenUnit }

export type DimKey = 'length' | 'width' | 'thick' | 'height' | 'dia' | 'depth' | 'post' | 'riser' | 'tread' | 'waist';

export interface Part {
  id: string;
  name: string;
  kind: ShapeKind;
  dims: Partial<Record<DimKey, Dim>>;
  count: string; // 개수 / 계단 단 수
  post: PostShape;
  stair: StairType;
  manual: { v: string; u: VolUnit };
}

/** 형태별 입력 칸 (순서대로 화면에 표시) */
export const FIELDS: Record<ShapeKind, DimKey[]> = {
  slab: ['length', 'width', 'thick'],
  wall: ['length', 'thick', 'height'],
  box: ['length', 'width', 'height'],
  cyl: ['dia', 'height'],
  hole: ['dia', 'depth', 'post'],
  stairs: ['width', 'riser', 'tread', 'waist'],
  manual: [],
};
export const HAS_COUNT: Record<ShapeKind, boolean> = {
  slab: false, wall: false, box: true, cyl: true, hole: true, stairs: true, manual: false,
};

/** 새 입력 칸의 기본 단위 — 두께·지름처럼 작은 치수는 cm(in), 큰 치수는 m(ft) */
const SMALL: Partial<Record<ShapeKind, DimKey[]>> = {
  slab: ['thick'],
  wall: ['thick'],
  box: ['length', 'width'],
  cyl: ['dia'],
  hole: ['dia', 'depth', 'post'],
  stairs: ['riser', 'tread', 'waist'],
};
export function defaultUnit(kind: ShapeKind, key: DimKey, sys: UnitSystem): LenUnit {
  const small = SMALL[kind]?.includes(key);
  if (sys === 'imperial') return small ? 'in' : 'ft';
  return small ? 'cm' : 'm';
}

export function emptyPart(kind: ShapeKind, sys: UnitSystem, id = ''): Part {
  const dims: Part['dims'] = {};
  for (const k of FIELDS[kind]) dims[k] = { v: '', u: defaultUnit(kind, k, sys) };
  return {
    id, name: '', kind, dims, count: kind === 'stairs' ? '' : '1', post: 'square', stair: 'waist',
    manual: { v: '', u: sys === 'imperial' ? 'yd3' : 'm3' },
  };
}

export const num = (v: string | undefined) => {
  const n = Number(v);
  return Number.isFinite(n) && v !== undefined && v.trim() !== '' ? n : NaN;
};
const meters = (d?: Dim) => (d ? num(d.v) * LEN_TO_M[d.u] : NaN);

/** 이 형태에서 실제로 쓰는 칸 (구멍의 기둥 없음, 채움형 계단의 바닥판은 제외) */
export function activeFields(p: Part): DimKey[] {
  return FIELDS[p.kind].filter((k) => !(k === 'post' && p.post === 'none') && !(k === 'waist' && p.stair === 'solid'));
}

/** 부피(㎥). 입력이 덜 됐거나 잘못되면 null */
export function partVolume(p: Part): number | null {
  if (p.kind === 'manual') {
    const v = num(p.manual.v);
    return v > 0 ? v * VOL_TO_M3[p.manual.u] : null;
  }
  const m: Partial<Record<DimKey, number>> = {};
  for (const k of activeFields(p)) {
    const x = meters(p.dims[k]);
    if (!(x > 0)) return null;
    m[k] = x;
  }
  const count = HAS_COUNT[p.kind] ? num(p.count) : 1;
  if (!(count > 0)) return null;
  const n = p.kind === 'stairs' ? Math.round(count) : count;
  if (n < 1) return null;

  switch (p.kind) {
    case 'slab': return m.length! * m.width! * m.thick!;
    case 'wall': return m.length! * m.thick! * m.height!;
    case 'box': return m.length! * m.width! * m.height! * n;
    case 'cyl': return Math.PI * (m.dia! / 2) ** 2 * m.height! * n;
    case 'hole': {
      const hole = Math.PI * (m.dia! / 2) ** 2 * m.depth!;
      const postArea = p.post === 'square' ? m.post! ** 2 : p.post === 'round' ? Math.PI * (m.post! / 2) ** 2 : 0;
      const net = hole - postArea * m.depth!;
      return net > 0 ? net * n : null;
    }
    case 'stairs': {
      const W = m.width!, R = m.riser!, T = m.tread!;
      if (p.stair === 'solid') return W * R * T * (n * (n + 1)) / 2; // k번째 단 높이 k·R, 속이 꽉 찬 계단
      // 경사 슬래브형: 단의 삼각형 n개 + 경사 바닥판(두께 × 경사 길이)
      return W * (n * 0.5 * R * T + m.waist! * n * Math.hypot(R, T));
    }
  }
  return null;
}

/** 단위 실수 경고: 비현실적으로 크거나 작은 치수 (미터 기준 [최소, 최대]) */
const LIMITS: Partial<Record<ShapeKind, Partial<Record<DimKey, [number, number]>>>> = {
  slab: { length: [0.1, 300], width: [0.1, 300], thick: [0.03, 1] },
  wall: { length: [0.1, 1000], thick: [0.05, 3], height: [0.05, 20] },
  box: { length: [0.05, 20], width: [0.05, 20], height: [0.05, 30] },
  cyl: { dia: [0.05, 3], height: [0.05, 30] },
  hole: { dia: [0.05, 2], depth: [0.05, 5], post: [0.01, 1] },
  stairs: { width: [0.3, 20], riser: [0.05, 0.5], tread: [0.1, 1.2], waist: [0.05, 0.5] },
};
export type DimWarn = 'big' | 'small';
export function dimWarnings(p: Part): Partial<Record<DimKey, DimWarn>> {
  const out: Partial<Record<DimKey, DimWarn>> = {};
  const lim = LIMITS[p.kind];
  if (!lim) return out;
  for (const k of activeFields(p)) {
    const x = meters(p.dims[k]);
    const l = lim[k];
    if (!l || !(x > 0)) continue;
    if (x > l[1]) out[k] = 'big';
    else if (x < l[0]) out[k] = 'small';
  }
  return out;
}
/** 기둥이 구멍보다 크거나 같으면 계산 불가 */
export function postTooBig(p: Part): boolean {
  if (p.kind !== 'hole' || p.post === 'none') return false;
  const d = meters(p.dims.dia), a = meters(p.dims.post);
  if (!(d > 0 && a > 0)) return false;
  return p.post === 'square' ? a * Math.SQRT2 >= d : a >= d; // 사각 기둥은 대각선이 구멍 지름보다 작아야 들어간다
}

/* ── 합계·레미콘 차량 ── */

export interface Trucks { count: number; loads: number[]; lastSmall: boolean }
/** 차량 대수는 항상 올림. 단위는 cap과 같은 단위로 넘긴다 */
export function trucks(volume: number, cap: number): Trucks {
  if (!(volume > 0) || !(cap > 0)) return { count: 0, loads: [], lastSmall: false };
  const count = Math.ceil(volume / cap - 1e-9);
  const last = volume - cap * (count - 1);
  const loads = [...Array(count - 1).fill(cap), Math.round(last * 100) / 100];
  return { count, loads, lastSmall: last < cap * 0.5 };
}

/* ── 직접 비빔 ── */

export const MIXES = [
  { id: '124', ratio: [1, 2, 4] as const },
  { id: '136', ratio: [1, 3, 6] as const },
  { id: '1153', ratio: [1, 1.5, 3] as const },
];
export type MixId = '124' | '136' | '1153';
export const DRY_FACTOR = 1.54;
export const CEMENT_DENSITY = 1440; // kg/㎥ (포대 시멘트 단위용적질량)
export const WATER_CEMENT = 0.5;
export const BAG_KG = 40;
export const US_CEMENT_BAG_LB = 94; // 미국 포틀랜드 시멘트 1포대 = 94 lb
export const LB_KG = 0.45359237;

export interface MixResult { dry: number; cementM3: number; cementKg: number; bags40: number; bags94: number; sand: number; gravel: number; waterL: number }
export function mix(volumeM3: number, id: MixId): MixResult {
  const r = (MIXES.find((m) => m.id === id) ?? MIXES[0]).ratio;
  const sum = r[0] + r[1] + r[2];
  const dry = volumeM3 * DRY_FACTOR;
  const cementM3 = dry * (r[0] / sum);
  const cementKg = cementM3 * CEMENT_DENSITY;
  return {
    dry,
    cementM3,
    cementKg,
    bags40: Math.ceil(cementKg / BAG_KG - 1e-9),
    bags94: Math.ceil(cementKg / (US_CEMENT_BAG_LB * LB_KG) - 1e-9),
    sand: dry * (r[1] / sum),
    gravel: dry * (r[2] / sum),
    waterL: cementKg * WATER_CEMENT,
  };
}

/** 레디믹스(premix) 포대: 포대당 수율 ft³ */
export const PREMIX = [
  { lb: 80, yieldFt3: 0.6 },
  { lb: 60, yieldFt3: 0.45 },
  { lb: 40, yieldFt3: 0.3 },
];
export function premixBags(volumeM3: number) {
  const ft3 = volumeM3 / FT3_M3;
  return PREMIX.map((b) => ({ ...b, bags: Math.ceil(ft3 / b.yieldFt3 - 1e-9) }));
}

/** 콘크리트 단위중량 범위 (t/㎥) */
export const DENSITY_T: [number, number] = [2.3, 2.4];

export const round2 = (n: number) => Math.round(n * 100) / 100;
