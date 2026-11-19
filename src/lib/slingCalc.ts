// 줄걸이(슬링) 각도·하중 계산 — 화면과 무관한 순수 계산만
//
// 줄 1개당 장력 = 인양물 중량 ÷ (하중 분담 다리 수 × cos θ),  θ = 수직선과 줄 사이 각도
// 하중 증가 배수 = 1 ÷ cos θ

export type WeightUnit = 't' | 'kg' | 'kN' | 'lb' | 'ston';
export type LenUnit = 'm' | 'cm' | 'mm' | 'ft' | 'in';
export type AngleMode = 'apex' | 'vertical' | 'horizontal' | 'length';
export type Legs = 1 | 2 | 3 | 4;
/** 3·4줄걸이에서 하중을 나눠 받는다고 보는 다리 수 */
export type Share = 2 | 3;
export type Grade = 'green' | 'yellow' | 'orange' | 'red';

/** 1 단위 = ? kg (kN은 중력가속도 9.80665 m/s² 기준 질량으로 환산) */
export const G = 9.80665;
export const TO_KG: Record<WeightUnit, number> = {
  t: 1000,
  kg: 1,
  kN: 1000 / G,
  lb: 0.45359237,
  ston: 2000 * 0.45359237,
};
export const WEIGHT_UNITS: Record<'ko' | 'en', WeightUnit[]> = {
  ko: ['t', 'kg', 'kN', 'lb', 'ston'],
  en: ['lb', 'ston', 't', 'kg', 'kN'],
};
export const LEN_UNITS: LenUnit[] = ['m', 'cm', 'mm', 'ft', 'in'];

/** 단위마다 보여 줄 소수 자리 */
export const DECIMALS: Record<WeightUnit, number> = { t: 2, kg: 0, kN: 2, lb: 0, ston: 2 };

/** 입력 상한 (이 값 이상은 받지 않음) */
export const APEX_MAX = 180;
export const VERT_MAX = 90;
/** 수평 기준은 0°(줄이 수평)이면 들 수 없음, 90°가 수직 */
export const HORIZ_MAX = 90;
/** 슬라이더 범위 */
export const APEX_SLIDER = 170;
export const VERT_SLIDER = 85;
export const HORIZ_SLIDER_MIN = 5;

/** 숫자 입력: 쉼표·공백 무시, 숫자·소수점만 */
export function decimal(v: string): string {
  const s = v.replace(/[^0-9.]/g, '');
  const i = s.indexOf('.');
  return (i < 0 ? s : s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '')).slice(0, 12);
}
export function num(v: string | undefined | null): number {
  if (v == null || v.trim() === '' || v === '.') return NaN;
  return Number(v);
}

export function toKg(value: number, u: WeightUnit): number {
  return value * TO_KG[u];
}
export function fromKg(kg: number, u: WeightUnit): number {
  return kg / TO_KG[u];
}

/** 하중을 나눠 받는 다리 수: 1줄=1, 2줄=2, 3·4줄=선택(기본 2) */
export function sharingLegs(legs: Legs, share: Share): number {
  if (legs <= 2) return legs;
  return Math.min(legs, share);
}

export type AngleInput = {
  mode: AngleMode;
  apex: string;
  vertical: string;
  horizontal: string;
  slingLen: string;
  horiz: string;
};

export type AngleResult =
  | { ok: true; theta: number }
  | { ok: false; reason: 'empty' | 'apexMax' | 'vertMax' | 'horizMin' | 'horizMax' | 'impossible' };

/** 입력 방식에 따라 수직 기준 각도 θ(도)를 구한다 */
export function verticalAngle(a: AngleInput): AngleResult {
  if (a.mode === 'apex') {
    const v = num(a.apex);
    if (!Number.isFinite(v)) return { ok: false, reason: 'empty' };
    if (v >= APEX_MAX) return { ok: false, reason: 'apexMax' };
    return { ok: true, theta: v / 2 };
  }
  if (a.mode === 'vertical') {
    const v = num(a.vertical);
    if (!Number.isFinite(v)) return { ok: false, reason: 'empty' };
    if (v >= VERT_MAX) return { ok: false, reason: 'vertMax' };
    return { ok: true, theta: v };
  }
  if (a.mode === 'horizontal') {
    const v = num(a.horizontal);
    if (!Number.isFinite(v)) return { ok: false, reason: 'empty' };
    if (v <= 0) return { ok: false, reason: 'horizMin' };
    if (v > HORIZ_MAX) return { ok: false, reason: 'horizMax' };
    return { ok: true, theta: 90 - v };
  }
  // 줄 길이: cos θ = √(L² − H²) ÷ L  (두 값은 같은 단위로 입력)
  const L = num(a.slingLen);
  const H = num(a.horiz);
  if (!(L > 0) || !Number.isFinite(H)) return { ok: false, reason: 'empty' };
  if (H >= L) return { ok: false, reason: 'impossible' };
  return { ok: true, theta: (Math.asin(H / L) * 180) / Math.PI };
}

/** 하중 증가 배수 1/cos θ */
export function angleFactor(thetaDeg: number): number {
  return 1 / Math.cos((thetaDeg * Math.PI) / 180);
}

/** 줄 1개당 장력 (중량과 같은 단위) */
export function legTension(weight: number, legs: Legs, share: Share, thetaDeg: number): number {
  if (legs === 1) return weight;
  return weight / (sharingLegs(legs, share) * Math.cos((thetaDeg * Math.PI) / 180));
}

/** 각도 경고 등급 (수직 기준 30° / 45° / 60°, 경계값은 안전한 쪽에 포함) */
export function angleGrade(thetaDeg: number): Grade {
  const t = Math.round(thetaDeg * 1e6) / 1e6; // 줄 길이 계산의 29.9999… 같은 오차 제거
  if (t <= 30) return 'green';
  if (t <= 45) return 'yellow';
  if (t <= 60) return 'orange';
  return 'red';
}

/** 비교표·그래프에 쓰는 꼭지각 */
export const TABLE_APEX = [0, 30, 60, 90, 120];
