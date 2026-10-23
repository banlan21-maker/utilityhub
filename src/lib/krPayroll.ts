import { KR_INSURANCE_2026 as INS } from '@/constants/wageConfig';
import { TAX_TABLE_ROWS, TAX_AT_10000, CHILD_CREDIT } from '@/constants/incomeTaxTable2026';

/** 10원 미만 절사 */
const floor10 = (n: number) => Math.floor(n / 10) * 10;

/**
 * 근로소득 간이세액표(2026. 3. 1. 이후 지급분)에 따른 월 소득세.
 * @param monthlyTaxable 비과세 제외 월급여(원)
 * @param family 공제대상가족 수(본인 포함, 1 이상)
 * @param children 공제대상가족 중 8세 이상 20세 이하 자녀 수
 */
export function simplifiedIncomeTax(monthlyTaxable: number, family: number, children: number): number {
  const fam = Math.max(1, Math.floor(family));
  const col = (row: readonly number[], n: number) => row[Math.min(n, 11) - 1];
  const thousand = monthlyTaxable / 1000;

  // 11명 초과: 11명 세액 - (10명 세액 - 11명 세액) × 초과 인원
  const byFamily = (values: (n: number) => number) =>
    fam <= 11 ? values(fam) : values(11) - (values(10) - values(11)) * (fam - 11);

  let tax: number;
  if (thousand < TAX_TABLE_ROWS[0][0]) {
    tax = 0;
  } else if (thousand < 10_000) {
    const row = TAX_TABLE_ROWS.find(r => thousand >= r[0] && thousand < r[1]);
    tax = row ? byFamily(n => col(row.slice(2), n)) : 0;
  } else {
    const base = byFamily(n => col(TAX_AT_10000, n));
    const m = monthlyTaxable;
    let extra: number;
    if (m <= 10_000_000) extra = 0; // 정확히 10,000천원: 표의 해당 세액
    else if (m <= 14_000_000) extra = (m - 10_000_000) * 0.98 * 0.35 + 25_000;
    else if (m <= 28_000_000) extra = 1_397_000 + (m - 14_000_000) * 0.98 * 0.38;
    else if (m <= 30_000_000) extra = 6_610_600 + (m - 28_000_000) * 0.98 * 0.40;
    else if (m <= 45_000_000) extra = 7_394_600 + (m - 30_000_000) * 0.40;
    else if (m <= 87_000_000) extra = 13_394_600 + (m - 45_000_000) * 0.42;
    else extra = 31_034_600 + (m - 87_000_000) * 0.45;
    tax = base + extra;
  }

  const kids = Math.max(0, Math.floor(children));
  const childCredit =
    kids === 0 ? 0 : kids === 1 ? CHILD_CREDIT.one : CHILD_CREDIT.two + CHILD_CREDIT.perExtra * (kids - 2);

  return Math.max(0, floor10(tax - childCredit));
}

export interface KRNetPayInput {
  /** 세전 월급여(원, 비과세 포함) */
  monthlyGross: number;
  /** 월 비과세액(원) — 식대 등 */
  nonTaxable: number;
  family: number;
  children: number;
}

export interface KRNetPayResult {
  monthlyGross: number;
  taxable: number;
  pension: number;
  health: number;
  longTermCare: number;
  employment: number;
  incomeTax: number;
  localTax: number;
  totalDeduction: number;
  monthlyNet: number;
}

/** 월급여 기준 4대보험 + 근로소득세(간이세액표 100%) + 지방소득세 공제 후 실수령액 */
export function calcKRNetPay({ monthlyGross, nonTaxable, family, children }: KRNetPayInput): KRNetPayResult {
  const gross = Math.max(0, monthlyGross);
  const taxable = Math.max(0, gross - Math.max(0, nonTaxable));

  // 국민연금: 기준소득월액(천원 미만 절사, 상·하한 적용) × 4.75%
  const pensionBase = Math.min(
    INS.pensionBaseMax,
    Math.max(INS.pensionBaseMin, Math.floor(taxable / 1000) * 1000),
  );
  const pension = taxable > 0 ? floor10(pensionBase * INS.pension) : 0;
  const health = floor10(taxable * INS.health);
  const longTermCare = floor10(health * INS.longTermCareOfHealth);
  const employment = floor10(taxable * INS.employment);
  const incomeTax = simplifiedIncomeTax(taxable, family, children);
  const localTax = floor10(incomeTax * 0.1);

  const totalDeduction = pension + health + longTermCare + employment + incomeTax + localTax;
  return {
    monthlyGross: gross,
    taxable,
    pension,
    health,
    longTermCare,
    employment,
    incomeTax,
    localTax,
    totalDeduction,
    monthlyNet: gross - totalDeduction,
  };
}
