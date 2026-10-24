/**
 * 프리랜서(인적용역 사업소득) 3.3% 원천징수 · 종합소득세 · 지역가입자 보험료 추정.
 *
 * 원천징수: 소득세 3%(소득세법 제129조) + 지방소득세 = 소득세의 10%(지방세법 제103조의13).
 *   국세 끝수는 10원 미만 절사(국고금관리법 제47조).
 * 종합소득세 기본세율(소득세법 제55조, 2023년 귀속분 이후) · 기본공제 1인 150만 원 ·
 *   표준세액공제 연 7만 원(근로소득이 없는 종합소득자, 소득세법 제59조의4).
 * 지역가입자 보험료(2026): 건강보험 소득월액 × 7.19%, 장기요양 = 건강보험료 × 13.14%,
 *   국민연금 기준소득월액 × 9.5%(전액 본인 부담, 기준소득월액 41만~659만 원).
 */

const floor10 = (n: number) => Math.floor(n / 10) * 10;

export interface Withholding {
  gross: number;
  incomeTax: number;
  localTax: number;
  total: number;
  net: number;
}

export function withholding(gross: number): Withholding {
  const g = Math.max(0, Math.floor(gross));
  const incomeTax = floor10(g * 0.03);
  const localTax = floor10(incomeTax * 0.1);
  return { gross: g, incomeTax, localTax, total: incomeTax + localTax, net: g - incomeTax - localTax };
}

/** 원하는 실수령액을 받기 위한 최소 계약 금액(세전) */
export function grossForNet(targetNet: number): Withholding {
  const target = Math.max(0, Math.floor(targetNet));
  let g = Math.ceil(target / 0.967);
  while (g > 0 && withholding(g - 1).net >= target) g--;
  while (withholding(g).net < target) g++;
  return withholding(g);
}

const BRACKETS: [limit: number, rate: number, deduction: number][] = [
  [14_000_000, 0.06, 0],
  [50_000_000, 0.15, 1_260_000],
  [88_000_000, 0.24, 5_760_000],
  [150_000_000, 0.35, 15_440_000],
  [300_000_000, 0.38, 19_940_000],
  [500_000_000, 0.4, 25_940_000],
  [1_000_000_000, 0.42, 35_940_000],
  [Infinity, 0.45, 65_940_000],
];

export function basicTax(taxBase: number): number {
  const b = Math.max(0, taxBase);
  const [, rate, ded] = BRACKETS.find(([limit]) => b <= limit)!;
  return Math.max(0, Math.floor(b * rate - ded));
}

export const BASIC_DEDUCTION_PER_PERSON = 1_500_000;
export const STANDARD_TAX_CREDIT = 70_000;

export interface AnnualInput {
  /** 1년 동안 3.3%를 떼고 받은 계약 금액(세전) 합계 */
  revenue: number;
  /** 필요경비 */
  expenses: number;
  /** 기본공제 대상 인원 (본인 포함) */
  dependents: number;
  /** 그해 낸 국민연금(지역) — 연금보험료 공제 */
  pensionPaid: number;
}

export interface AnnualResult {
  incomeAmount: number;
  deductions: number;
  taxBase: number;
  calculatedTax: number;
  decidedTax: number;
  prepaidTax: number;
  /** + 추가 납부, − 환급 (소득세) */
  balanceIncomeTax: number;
  /** + 추가 납부, − 환급 (지방소득세) */
  balanceLocalTax: number;
  balanceTotal: number;
}

export function annualSettlement(i: AnnualInput): AnnualResult {
  const revenue = Math.max(0, i.revenue);
  const incomeAmount = Math.max(0, revenue - Math.max(0, i.expenses));
  const deductions = BASIC_DEDUCTION_PER_PERSON * Math.max(1, Math.floor(i.dependents)) + Math.max(0, i.pensionPaid);
  const taxBase = Math.max(0, incomeAmount - deductions);
  const calculatedTax = basicTax(taxBase);
  const decidedTax = floor10(Math.max(0, calculatedTax - Math.min(STANDARD_TAX_CREDIT, calculatedTax)));
  // 연간 원천징수 합계는 건별 절사 때문에 몇십 원 차이가 날 수 있어 합계 금액 기준으로 근사
  const prepaidTax = floor10(revenue * 0.03);
  const balanceIncomeTax = decidedTax - prepaidTax;
  const balanceLocalTax = floor10(decidedTax * 0.1) - floor10(prepaidTax * 0.1);
  return {
    incomeAmount, deductions, taxBase, calculatedTax, decidedTax, prepaidTax,
    balanceIncomeTax, balanceLocalTax, balanceTotal: balanceIncomeTax + balanceLocalTax,
  };
}

export const REGIONAL_2026 = {
  health: 0.0719,
  longTermCareOfHealth: 0.1314,
  pension: 0.095,
  pensionBaseMin: 410_000,
  pensionBaseMax: 6_590_000,
  /** 직장가입자의 보수 외 소득이 이 금액을 넘으면 초과분에 소득월액보험료 */
  employeeExtraThreshold: 20_000_000,
} as const;

export interface InsuranceResult {
  monthlyIncome: number;
  health: number;
  longTermCare: number;
  pension: number;
  total: number;
}

/**
 * 월 보험료 추정 (소득분만, 재산분 제외).
 * employee = true 이면 직장가입자의 보수 외 소득 기준 소득월액보험료(국민연금 없음).
 */
export function monthlyInsurance(incomeAmount: number, employee: boolean): InsuranceResult {
  const R = REGIONAL_2026;
  if (employee) {
    const monthlyIncome = Math.max(0, incomeAmount - R.employeeExtraThreshold) / 12;
    const health = floor10(monthlyIncome * R.health);
    const longTermCare = floor10(health * R.longTermCareOfHealth);
    return { monthlyIncome, health, longTermCare, pension: 0, total: health + longTermCare };
  }
  const monthlyIncome = Math.max(0, incomeAmount) / 12;
  const health = floor10(monthlyIncome * R.health);
  const longTermCare = floor10(health * R.longTermCareOfHealth);
  const base = Math.min(R.pensionBaseMax, Math.max(R.pensionBaseMin, Math.floor(monthlyIncome / 1000) * 1000));
  const pension = monthlyIncome > 0 ? floor10(base * R.pension) : 0;
  return { monthlyIncome, health, longTermCare, pension, total: health + longTermCare + pension };
}
