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
    insurance: number;       // 4대보험 근로자 부담분 ≈ 9.4%
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

export const WAGE_DATA: Record<string, WageDataYear> = {
  Y2026: {
    KR: {
      minWage: 10030,
      lastUpdated: '2026-01-01',
      currency: 'KRW',
      deductions: {
        none: 0,
        withholdingTax: 0.033,
        insurance: 0.094,
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
