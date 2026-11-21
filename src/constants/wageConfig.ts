// ─── Global Wage & Tax Configuration ─────────────────────────────────────────
// Single source of truth for all rate/wage data.
// Update this file when laws change; UI reads lastUpdated automatically.
import { refForYear, refYears } from './referenceValues';

export interface KRYearData {
  minWage: number;           // KRW / hour
  lastUpdated: string;       // ISO date string
  currency: 'KRW';
  deductions: {
    none: number;
    withholdingTax: number;  // 3.3% = 0.033
    insurance: number;       // 4대보험 근로자 부담분 합계 (2026년 ≈ 9.72%)
  };
  weeklyHoliday: {
    minHoursForEligibility: number;  // 15h
    weekCapHours: number;            // 40h
    paidHoursPerWeek: number;        // 8h
  };
}

export interface USYearData {
  minWage: number;           // USD / hour (Federal)
  lastUpdated: string;
  currency: 'USD';
  deductions: {
    none: number;
    fica: number;            // 7.65% (SS 6.2% + Medicare 1.45%)
    ficaFederal: number;     // FICA 7.65% + Federal income est. ~14.35% = 22%
  };
  overtime: {
    thresholdHours: number;  // 40h / week
    multiplier: number;      // 1.5x
  };
}

export interface WageDataYear {
  KR: KRYearData;
  US: USYearData;
}

// ─── 한국 4대보험·최저시급: 연도별 값은 referenceValues.ts 한 곳에서 관리 ─────────
// (알바 급여 계산기와 같은 값을 쓴다. 새해 값은 referenceValues.ts 에만 넣으면 여기도 따라온다.)
// 산재보험은 사업주 전액 부담이라 넣지 않는다.

/** 국민연금 기준소득월액 상·하한 — 매년 7월 1일 변경 (2026.7 ~ 2027.6 값). 바뀌면 여기만 고친다. */
const PENSION_BASE = { min: 410_000, max: 6_590_000 };

export interface KRInsurance {
  year: number;
  /** 근로자 부담 요율 (0.0475 = 4.75%) */
  pension: number;
  pensionBaseMin: number;
  pensionBaseMax: number;
  health: number;
  /** 장기요양보험료 = 건강보험료 × 이 비율 (장기요양보험료율 ÷ 건강보험료율) */
  longTermCareOfHealth: number;
  employment: number;
  /** 근로자 부담 합계 요율 (시급 탭의 간이 공제용) */
  total: number;
  /** 아직 확정되지 않은 항목 안내 (관리 파일의 status: 'pending') */
  pending: { name: string; note?: string }[];
}

/** 값이 있는 연도 (오름차순) */
export const krYears = (): number[] => refYears('kr.minimum_wage');

/** 한국 시간 기준 올해 — 값이 있는 연도 범위 안으로 맞춘다 */
export function currentKrYear(now: Date = new Date()): number {
  const years = krYears();
  const y = new Date(now.getTime() + 9 * 3600_000).getUTCFullYear();
  return Math.min(Math.max(y, years[0]), years[years.length - 1]);
}

export const krMinWage = (year: number): number => refForYear('kr.minimum_wage', year)?.value ?? 0;

export function krInsurance(year: number): KRInsurance {
  const refs = {
    pension: refForYear('kr.pension_employee', year),
    health: refForYear('kr.health_total', year),
    ltc: refForYear('kr.ltc_total', year),
    employment: refForYear('kr.employment_employee', year),
  };
  const pension = (refs.pension?.value ?? 0) / 100;
  const health = (refs.health?.value ?? 0) / 2 / 100;
  const longTermCareOfHealth = refs.health && refs.ltc ? refs.ltc.value / refs.health.value : 0;
  const employment = (refs.employment?.value ?? 0) / 100;
  return {
    year, pension, pensionBaseMin: PENSION_BASE.min, pensionBaseMax: PENSION_BASE.max,
    health, longTermCareOfHealth, employment,
    total: pension + health * (1 + longTermCareOfHealth) + employment,
    pending: Object.values(refs).filter((r) => r?.status === 'pending').map((r) => ({ name: r!.name, note: r!.note })),
  };
}

const US_DATA: USYearData = {
  minWage: 7.25,
  lastUpdated: '2026-01-01',
  currency: 'USD',
  deductions: {
    none: 0,
    fica: 0.0765,
    ficaFederal: 0.22,   // FICA 7.65% + Federal income est. 14.35%
  },
  overtime: {
    thresholdHours: 40,
    multiplier: 1.5,
  },
};

const krYearData = (year: number): KRYearData => ({
  minWage: krMinWage(year),
  lastUpdated: refForYear('kr.minimum_wage', year)?.lastChecked ?? '',
  currency: 'KRW',
  deductions: { none: 0, withholdingTax: 0.033, insurance: krInsurance(year).total },
  weeklyHoliday: { minHoursForEligibility: 15, weekCapHours: 40, paidHoursPerWeek: 8 },
});

/** 연도별 데이터 (Y2026, Y2027 …) — 관리자 알림이 "다음 해 값이 있는지" 볼 때도 쓴다 */
export const WAGE_DATA: Record<string, WageDataYear> = Object.fromEntries(
  krYears().map((y) => [`Y${y}`, { KR: krYearData(y), US: US_DATA }]),
);

export const wageData = (year: number): WageDataYear => WAGE_DATA[`Y${year}`] ?? WAGE_DATA[`Y${currentKrYear()}`];

// Average weeks per month = 365 / 7 / 12
export const WEEKS_PER_MONTH = 365 / 7 / 12; // ≈ 4.345
