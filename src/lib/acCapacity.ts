/**
 * 에어컨 적정 용량(냉방면적·평형·냉방능력) 추정.
 *
 * 기준
 * - 제품의 "평형"은 냉방면적(㎡) ÷ 3.3 으로 표기한다(LG전자 안내).
 * - 냉방능력과 냉방면적의 관계: 제조사 표기 예 6평형 18.7㎡ = 2.3kW, 17평형 56.9㎡ = 7.0kW
 *   → 약 123 W/㎡ (냉방능력 ≈ 냉방면적 × 123W).
 * - 고르는 기준(LG전자): 방·원룸은 방 면적만큼의 냉방면적, 아파트 거실 스탠드는 공급면적의 ½ 이상,
 *   베란다 확장형·정남향처럼 일사가 많으면 한 단계 큰 모델.
 * - 그 밖의 보정 비율은 경험치이며, 정밀 부하 계산을 대신하지 않는다.
 */

export const W_PER_SQM = 123;
export const SQM_PER_PYEONG = 400 / 121;

/** 매장에서 흔한 제품 평형 (벽걸이 / 스탠드) */
export const WALL_CLASSES = [6, 7, 9, 10, 11, 13, 16] as const;
export const STAND_CLASSES = [15, 17, 18, 20, 23, 25, 30, 36, 40] as const;
const ALL_CLASSES = [...new Set([...WALL_CLASSES, ...STAND_CLASSES])].sort((a, b) => a - b);

export type SpaceMode = 'room' | 'living' | 'commercial';
export type SunSide = 'north' | 'east' | 'south' | 'west';
export type Business = 'office' | 'retail' | 'cafe' | 'salon' | 'academy' | 'restaurant' | 'gym' | 'pc_room' | 'bbq';

/** 업종별 내부 발열 가산(경험치) */
export const BUSINESS_EXTRA: Record<Business, number> = {
  office: 0, retail: 0.05, cafe: 0.15, salon: 0.15, academy: 0.2,
  restaurant: 0.25, gym: 0.35, pc_room: 0.4, bbq: 0.6,
};

/** 창 방향 가산. 큰 창·확장형과 겹치면 LG 안내의 "한 단계 큰 모델"(약 +15%) 수준이 되도록 잡았다 */
export const SUN_EXTRA: Record<SunSide, number> = { north: 0, east: 0, south: 0.05, west: 0.1 };

/** 기본 면적 안에 포함된 것으로 보는 인원, 그 이상 1인당 발열(W) */
export const BASE_OCCUPANTS = 2;
export const W_PER_PERSON = 120;

export interface AcInput {
  mode: SpaceMode;
  /** room/commercial: 냉방할 공간 면적(㎡). living: 아파트 평형(공급면적 평수) */
  area: number;
  sun: SunSide;
  bigWindow: boolean;
  topFloor: boolean;
  oldInsulation: boolean;
  kitchen: boolean;
  /** 천장 높이(m) */
  ceilingM: number;
  occupants: number;
  business: Business;
}

export interface AcExtra { key: string; ratio: number }

export interface AcResult {
  baseSqm: number;
  extras: AcExtra[];
  factor: number;
  occupantSqm: number;
  neededSqm: number;
  neededPyeong: number;
  capacityKw: number;
  /** 필요 냉방면적 이상인 가장 작은 제품 평형(없으면 null = 40평형 초과) */
  productClass: number | null;
  unit: 'wall' | 'stand' | 'multi';
}

export function calcAc(i: AcInput): AcResult | null {
  if (!(i.area > 0)) return null;
  // 아파트 거실은 공급면적의 절반 이상을 냉방면적으로 본다
  const baseSqm = i.mode === 'living' ? (i.area * SQM_PER_PYEONG) / 2 : i.area;

  const extras: AcExtra[] = [];
  const add = (key: string, ratio: number) => { if (ratio > 0) extras.push({ key, ratio }); };
  add('sun', SUN_EXTRA[i.sun]);
  if (i.bigWindow) add('bigWindow', 0.1);
  if (i.topFloor) add('topFloor', 0.1);
  if (i.oldInsulation) add('insulation', 0.1);
  if (i.kitchen) add('kitchen', 0.1);
  add('ceiling', Math.max(0, i.ceilingM / 2.4 - 1));
  if (i.mode === 'commercial') add('business', BUSINESS_EXTRA[i.business]);

  // 가산 비율은 합산하되 지나치게 부풀지 않도록 +80%에서 멈춘다
  const factor = 1 + Math.min(0.8, extras.reduce((sum, e) => sum + e.ratio, 0));
  const occupantSqm = (Math.max(0, i.occupants - BASE_OCCUPANTS) * W_PER_PERSON) / W_PER_SQM;
  const neededSqm = baseSqm * factor + occupantSqm;
  const neededPyeong = neededSqm / SQM_PER_PYEONG;
  const capacityKw = (neededSqm * W_PER_SQM) / 1000;
  // 거실은 스탠드로 고르고, 그 밖에는 벽걸이·스탠드 전체에서 고른다
  const classes: readonly number[] = i.mode === 'living' ? STAND_CLASSES : ALL_CLASSES;
  const productClass = pickClass(neededPyeong, classes);
  const unit = productClass === null ? 'multi' : i.mode !== 'living' && (WALL_CLASSES as readonly number[]).includes(productClass) ? 'wall' : 'stand';

  return { baseSqm, extras, factor, occupantSqm, neededSqm, neededPyeong, capacityKw, productClass, unit };
}

// 제품 평형 표기는 반올림이 섞여 있어 0.3평 정도는 같은 등급으로 본다
const pickClass = (pyeong: number, classes: readonly number[]) => classes.find(c => c >= pyeong - 0.3) ?? null;

/** 40평형을 넘을 때: 스탠드 몇 대로 나누면 되는지 (대수, 대당 평형) */
export function splitUnits(neededPyeong: number): { count: number; cls: number } {
  const max = STAND_CLASSES[STAND_CLASSES.length - 1];
  const count = Math.ceil((neededPyeong - 0.3) / max);
  return { count, cls: pickClass(neededPyeong / count, STAND_CLASSES) ?? max };
}

/** 제품 평형 → 대략적인 냉방능력(kW) */
export const classToKw = (cls: number) => (cls * SQM_PER_PYEONG * W_PER_SQM) / 1000;
