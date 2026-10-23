// ─── Global Wage & Tax Configuration ─────────────────────────────────────────
// Single source of truth for all rate/wage data.
// Update this file when laws change; UI reads lastUpdated automatically.

export interface KRYearData {
  minWage: number;           // KRW / hour
  lastUpdated: string;       // ISO date string
  currency: 'KRW';
  deductions: {
    none: number;
    withholdingTax: number;  // 3.3% = 0.033
    insurance: number;       // 4대보험 근로자 부담분 ≈ 9.72% (2026)
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

// ─── 2026 4대보험 근로자 부담 요율 ───────────────────────────────────────────
// 국민연금 9.5%(근로자 4.75%), 건강보험 7.19%(3.595%),
// 장기요양 = 건강보험료 × 13.14%, 고용보험 근로자 0.9%. 산재보험은 사업주 전액 부담.
export const KR_INSURANCE_2026 = {
  pension: 0.0475,
  pensionBaseMin: 410_000,    // 기준소득월액 하한 (2026.7 ~ 2027.6)
  pensionBaseMax: 6_590_000,  // 기준소득월액 상한 (2026.7 ~ 2027.6)
  health: 0.03595,
  longTermCareOfHealth: 0.1314,
  employment: 0.009,
} as const;

const KR_INSURANCE_TOTAL_2026 =
  KR_INSURANCE_2026.pension +
  KR_INSURANCE_2026.health * (1 + KR_INSURANCE_2026.longTermCareOfHealth) +
  KR_INSURANCE_2026.employment; // ≈ 9.72%

export const WAGE_DATA: Record<string, WageDataYear> = {
  Y2026: {
    KR: {
      minWage: 10320,
      lastUpdated: '2026-07-01',
      currency: 'KRW',
      deductions: {
        none: 0,
        withholdingTax: 0.033,
        insurance: KR_INSURANCE_TOTAL_2026,
      },
      weeklyHoliday: {
        minHoursForEligibility: 15,
        weekCapHours: 40,
        paidHoursPerWeek: 8,
      },
    },
    US: {
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
    },
  },
};

export const CURRENT_YEAR = 'Y2026';
export const CURRENT_DATA = WAGE_DATA[CURRENT_YEAR];

// Average weeks per month = 365 / 7 / 12
export const WEEKS_PER_MONTH = 365 / 7 / 12; // ≈ 4.345
