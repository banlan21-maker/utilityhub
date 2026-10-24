/**
 * 평 ↔ ㎡ 환산과 평형(공급면적 기준) 추정.
 * 1평 = 6자 × 6자, 1자 = 10/33 m → 1평 = 400/121 ㎡ ≈ 3.305785 ㎡
 * 평형은 관행상 공급면적(전용 + 주거공용) 기준이다. 예: 전용 84㎡ · 공급 약 112㎡ → 약 34평형.
 */

export const SQM_PER_PYEONG = 400 / 121;

export const toPyeong = (sqm: number) => sqm / SQM_PER_PYEONG;
export const toSqm = (pyeong: number) => pyeong * SQM_PER_PYEONG;

export type BuildingType = 'apartment' | 'mixed' | 'officetel';

/** 건물 유형별 통상 전용률(전용 ÷ 공급 또는 계약면적) — 단지마다 다르므로 범위로 안내 */
export const EXCLUSIVE_RATIO: Record<BuildingType, { typical: number; min: number; max: number }> = {
  apartment: { typical: 0.75, min: 0.72, max: 0.8 },
  mixed: { typical: 0.7, min: 0.65, max: 0.75 },
  officetel: { typical: 0.52, min: 0.45, max: 0.6 },
};

/** 전용면적 → 공급(계약)면적 추정 */
export const supplyFromExclusive = (exclusiveSqm: number, ratio: number) => exclusiveSqm / ratio;

/** 전용면적 → 평형(공급면적 평수, 반올림) */
export const pyeongClass = (exclusiveSqm: number, ratio: number) =>
  Math.round(toPyeong(supplyFromExclusive(exclusiveSqm, ratio)));

/** 평형 → 전용면적 추정 */
export const exclusiveFromClass = (cls: number, ratio: number) => toSqm(cls) * ratio;

/** 가격 ÷ 면적 → 평당 가격, ㎡당 가격 */
export function unitPrice(price: number, sqm: number) {
  if (price <= 0 || sqm <= 0) return { perPyeong: 0, perSqm: 0 };
  return { perPyeong: price / toPyeong(sqm), perSqm: price / sqm };
}

/** 아파트 대표 전용면적 (분양 시장에서 흔한 타입) */
export const COMMON_EXCLUSIVE = [39, 49, 59, 74, 84, 102, 114, 135] as const;
