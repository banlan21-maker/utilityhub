/**
 * 배관 옵셋·절단 길이.
 *
 * 엘보값(뺄길이) = 엘보 중심(두 배관 중심선이 만나는 점)에서 끝 단면까지 빼야 하는 길이
 * - KS B 1522 (= JIS B 2312) 맞대기 용접 엘보: 90° 장반경 F, 90° 단반경 F(25A부터), 45° 장반경 H
 * - KS B 1533 (= JIS B 2301) 나사식 가단주철 엘보(90°): 빼는 값 = 중심~끝 L − 나사 물림 ℓ
 * - ASME B16.9 맞대기 용접 엘보: 90° LR A, 90° SR A(1"부터), 45° LR B
 * - 장반경 엘보를 잘라 쓰는 임의 각도: 엘보값 = 굽힘 반경(90° 장반경 값) × tan(각도/2)
 *
 * 옵셋(두 엘보가 같은 각도 θ): 빗변(심-심) = 옵셋 ÷ sin θ, 전진 거리 = 옵셋 ÷ tan θ
 * 절단 길이 = 심-심 길이 − 양쪽 엘보값 − 용접 갭 × 용접 이음 수
 */

export type Standard = 'ks' | 'thread' | 'asme';
export type Fitting = '90L' | '90S' | '45L' | 'cut';

interface Row { size: string; l90: number; s90: number | null; l45: number | null }

const KS: Row[] = ([
  ['15A', 38.1, null, 15.8], ['20A', 38.1, null, 15.8], ['25A', 38.1, 25.4, 15.8], ['32A', 47.6, 31.8, 19.7],
  ['40A', 57.2, 38.1, 23.7], ['50A', 76.2, 50.8, 31.6], ['65A', 95.3, 63.5, 39.5], ['80A', 114.3, 76.2, 47.3],
  ['90A', 133.4, 88.9, 55.3], ['100A', 152.4, 101.6, 63.1], ['125A', 190.5, 127.0, 78.9], ['150A', 228.6, 152.4, 94.7],
  ['200A', 304.8, 203.2, 126.3], ['250A', 381.0, 254.0, 157.8], ['300A', 457.2, 304.8, 189.4],
] as const).map(([size, l90, s90, l45]) => ({ size, l90, s90, l45 }));

const ASME: Row[] = ([
  ['15A', 38, null, 16], ['20A', 38, null, 19], ['25A', 38, 25, 22], ['32A', 48, 32, 25], ['40A', 57, 38, 29],
  ['50A', 76, 51, 35], ['65A', 95, 64, 44], ['80A', 114, 76, 51], ['100A', 152, 102, 64], ['125A', 190, 127, 79],
  ['150A', 229, 152, 95], ['200A', 305, 203, 127], ['250A', 381, 254, 159], ['300A', 457, 305, 190],
] as const).map(([size, l90, s90, l45]) => ({ size, l90, s90, l45 }));

/** 나사식 90° 엘보: [호칭, 중심~끝 L, 나사 물림 ℓ] */
const THREAD: [string, number, number][] = [
  ['15A', 27, 11], ['20A', 32, 13], ['25A', 38, 15], ['32A', 46, 17], ['40A', 48, 18], ['50A', 57, 20],
  ['65A', 69, 23], ['80A', 78, 25], ['100A', 97, 28], ['125A', 113, 30], ['150A', 132, 33],
];

export const SIZES: Record<Standard, string[]> = {
  ks: KS.map(r => r.size),
  asme: ASME.map(r => r.size),
  thread: THREAD.map(r => r[0]),
};

/** 규격에서 쓸 수 있는 이음쇠 */
export function fittingsFor(std: Standard, size: string): Fitting[] {
  if (std === 'thread') return ['90L'];
  const row = (std === 'ks' ? KS : ASME).find(r => r.size === size);
  if (!row) return [];
  return ['90L', ...(row.s90 ? ['90S' as const] : []), '45L', 'cut'];
}

export interface Allowance {
  /** 엘보값(뺄길이) mm */
  value: number;
  /** 엘보 각도 */
  angle: number;
  /** 나사식: 중심~끝, 물림 */
  centerToEnd?: number;
  engagement?: number;
  /** 임의 각도: 굽힘 반경 */
  radius?: number;
}

/** 엘보 1개의 엘보값. cut은 angle(°)로 장반경 엘보를 잘라 쓴 경우 */
export function allowance(std: Standard, size: string, fitting: Fitting, cutAngle = 45): Allowance | null {
  if (std === 'thread') {
    const r = THREAD.find(x => x[0] === size);
    if (!r || fitting !== '90L') return null;
    return { value: r[1] - r[2], angle: 90, centerToEnd: r[1], engagement: r[2] };
  }
  const row = (std === 'ks' ? KS : ASME).find(r => r.size === size);
  if (!row) return null;
  if (fitting === '90L') return { value: row.l90, angle: 90 };
  if (fitting === '90S') return row.s90 ? { value: row.s90, angle: 90 } : null;
  if (fitting === '45L') return row.l45 ? { value: row.l45, angle: 45 } : null;
  if (!(cutAngle > 0 && cutAngle <= 90)) return null;
  return { value: row.l90 * Math.tan((cutAngle * Math.PI) / 360), angle: cutAngle, radius: row.l90 };
}

/** 용접 이음 수: 맞대기 용접만 갭을 뺀다 */
const weldGap = (std: Standard, gap: number) => (std === 'thread' ? 0 : Math.max(0, gap));

export interface OffsetResult {
  angle: number;
  /** 옵셋 배수 1/sin θ */
  factor: number;
  /** 빗변(심-심) */
  travel: number;
  /** 전진 거리 */
  run: number;
  allowance: number;
  gapTotal: number;
  cut: number;
  /** 절단 길이가 0 이하가 되지 않는 최소 옵셋 */
  minOffset: number;
}

/** 엘보 2개로 옵셋 거리만큼 비켜 갈 때 */
export function offsetCut(offset: number, al: Allowance, std: Standard, gap: number): OffsetResult | null {
  if (!(offset > 0)) return null;
  const th = (al.angle * Math.PI) / 180;
  const factor = 1 / Math.sin(th);
  const travel = offset * factor;
  const run = al.angle === 90 ? 0 : offset / Math.tan(th);
  const gapTotal = 2 * weldGap(std, gap);
  const cut = travel - 2 * al.value - gapTotal;
  return { angle: al.angle, factor, travel, run, allowance: al.value, gapTotal, cut, minOffset: (2 * al.value + gapTotal) * Math.sin(th) };
}

/** 가로·세로 동시에 비켜 갈 때: 실제 옵셋 = √(가로² + 세로²) */
export function rollingOffset(horizontal: number, vertical: number) {
  if (!(horizontal >= 0 && vertical >= 0) || horizontal + vertical <= 0) return null;
  return { trueOffset: Math.hypot(horizontal, vertical), rollAngle: (Math.atan2(vertical, horizontal) * 180) / Math.PI };
}

export type EndKind = 'none' | Fitting;

/** 심-심 치수에서 양 끝 이음쇠를 빼서 절단 길이 */
export function centerToCut(cc: number, ends: (Allowance | null)[], std: Standard, gap: number) {
  if (!(cc > 0)) return null;
  const fittings = ends.filter((e): e is Allowance => !!e);
  const allow = fittings.reduce((sum, e) => sum + e.value, 0);
  const gapTotal = fittings.length * weldGap(std, gap);
  return { cc, allow, gapTotal, cut: cc - allow - gapTotal, joints: fittings.length };
}

/** 각도별 옵셋 배수 (현장 암산표) */
export const FACTOR_TABLE = [11.25, 22.5, 30, 45, 60].map(a => ({ angle: a, travel: 1 / Math.sin((a * Math.PI) / 180), run: 1 / Math.tan((a * Math.PI) / 180) }));

/** 규격별 엘보값 표 */
export function allowanceTable(std: Standard) {
  return SIZES[std].map(size => ({
    size,
    l90: allowance(std, size, '90L')?.value ?? null,
    s90: allowance(std, size, '90S')?.value ?? null,
    l45: allowance(std, size, '45L')?.value ?? null,
    thread: std === 'thread' ? allowance(std, size, '90L') : null,
  }));
}
