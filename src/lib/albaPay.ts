// 알바 급여·주휴수당 계산 (근로기준법 기준, 브라우저 안에서만 계산)
// 기준값(최저시급·보험요율)은 src/constants/referenceValues.ts 에서 연도별로 읽는다.
import { refForYear, refYears, type RefValue } from '@/constants/referenceValues';

/** 월 환산 주 수 — 365 ÷ 7 ÷ 12 를 고용노동부 안내처럼 4.345 로 쓴다 */
export const WEEKS_PER_MONTH = 4.345;
/** 주 40시간(주휴 포함 48시간) 근무의 월 소정근로시간 — 최저임금 고시의 월 환산 기준 */
export const FULLTIME_MONTH_HOURS = 209;

export type Deduction = 'none' | 'insurance' | 'tax33';

export interface DayInput {
  on: boolean;
  start: string; // 'HH:MM'
  end: string;   // 'HH:MM' — 출근보다 이르면 다음 날 퇴근
  breakMin: number;
  /** 휴일 근무 (주휴일·공휴일 등) — 소정근로에 넣지 않고 휴일근로로 계산 */
  holiday: boolean;
}

export interface DayResult {
  workMin: number;
  nightMin: number;
  /** 출근 = 퇴근 */
  sameTime: boolean;
  /** 법정 최소 휴게시간(분) — 4시간 30분, 8시간 1시간 */
  breakRequired: number;
  breakShort: boolean;
}

export interface YearBasis {
  year: number;
  minWage?: RefValue;
  pension?: RefValue;
  health?: RefValue;
  ltc?: RefValue;
  employment?: RefValue;
}

export interface PayResult {
  /** 주휴수당 판단 기준 1주 소정근로시간 */
  contractHours: number;
  eligible: boolean;
  totalHours: number;
  juhyuHours: number;
  overtimeHours: number;
  nightHours: number;
  holidayHours: number;
  holidayOver8Hours: number;
  basePay: number;
  juhyuPay: number;
  overtimePay: number;
  nightPay: number;
  holidayPay: number;
  weekly: number;
  monthHours: number;
  monthly: number;
  deductions: { key: 'pension' | 'health' | 'ltc' | 'employment' | 'incomeTax' | 'localTax'; amount: number }[];
  totalDeduction: number;
  net: number;
  belowMinWage: boolean;
}

const floor10 = (n: number) => Math.floor(n / 10) * 10;
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
};
const overlap = (a0: number, a1: number, b0: number, b1: number) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));

export const breakRequiredFor = (workMin: number) => (workMin >= 480 ? 60 : workMin >= 240 ? 30 : 0);

/** 하루 근무: 근무시간·야간(22~06시)시간·휴게 부족 여부 */
export function analyzeDay(d: DayInput): DayResult {
  const s = toMin(d.start);
  let e = toMin(d.end);
  const sameTime = s === e;
  if (e <= s) e += 1440;
  const span = sameTime ? 0 : e - s;
  const brk = Math.min(Math.max(0, d.breakMin || 0), span);
  const workMin = span - brk;
  // 야간 구간: 전날 22시~06시, 당일 22시~다음 날 06시
  const nightSpan = overlap(s, e, 0, 360) + overlap(s, e, 1320, 1800) + overlap(s, e, 2760, 3240);
  // 휴게시간은 주간 시간에서 먼저 뺀다고 본다
  const dayPart = span - nightSpan;
  const nightMin = Math.max(0, nightSpan - Math.max(0, brk - dayPart));
  const breakRequired = breakRequiredFor(workMin);
  return { workMin, nightMin, sameTime, breakRequired, breakShort: !sameTime && brk < breakRequired };
}

export function basisFor(year: number): YearBasis {
  return {
    year,
    minWage: refForYear('kr.minimum_wage', year),
    pension: refForYear('kr.pension_employee', year),
    health: refForYear('kr.health_total', year),
    ltc: refForYear('kr.ltc_total', year),
    employment: refForYear('kr.employment_employee', year),
  };
}

/** 최저시급이 있는 연도 */
export const wageYears = () => refYears('kr.minimum_wage');

export interface WorkDay { hours: number; nightHours: number; holiday: boolean }

export function calcPay(opts: {
  wage: number;
  days: WorkDay[];
  fivePlus: boolean;
  deduction: Deduction;
  basis: YearBasis;
}): PayResult {
  const { wage, days, fivePlus, deduction, basis } = opts;
  const w = Math.max(0, wage);
  const regular = days.filter((d) => !d.holiday && d.hours > 0);
  const holidays = days.filter((d) => d.holiday && d.hours > 0);

  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
  const totalHours = sum(days.map((d) => d.hours));
  const regularHours = sum(regular.map((d) => d.hours));
  const within8 = sum(regular.map((d) => Math.min(d.hours, 8)));

  // 소정근로시간: 5인 이상은 1일 8시간·1주 40시간 이내만, 5인 미만은 근로시간 제한이 없어 전부
  const contractHours = Math.min(40, fivePlus ? within8 : regularHours);
  const eligible = contractHours >= 15;
  const juhyuHours = eligible ? Math.min(8, (contractHours / 40) * 8) : 0;

  // 연장: 하루 8시간 초과분 + (8시간 이내 합이 40시간을 넘는 분)
  const overtimeHours = sum(regular.map((d) => Math.max(0, d.hours - 8))) + Math.max(0, within8 - 40);
  const nightHours = sum(days.map((d) => d.nightHours));
  const holidayHours = sum(holidays.map((d) => d.hours));
  const holidayOver8Hours = sum(holidays.map((d) => Math.max(0, d.hours - 8)));

  const basePay = Math.floor(totalHours * w);
  const juhyuPay = Math.floor(juhyuHours * w);
  const overtimePay = fivePlus ? Math.floor(overtimeHours * w * 0.5) : 0;
  const nightPay = fivePlus ? Math.floor(nightHours * w * 0.5) : 0;
  const holidayPay = fivePlus ? Math.floor(((holidayHours - holidayOver8Hours) * 0.5 + holidayOver8Hours * 1.0) * w) : 0;
  const weekly = basePay + juhyuPay + overtimePay + nightPay + holidayPay;

  // 월 환산: 주 40시간이면 고시 기준 209시간, 그 밖에는 (소정 + 주휴) × 4.345. 나머지 수당은 × 4.345
  const regularMonthHours = contractHours === 40 && juhyuHours === 8
    ? FULLTIME_MONTH_HOURS
    : (contractHours + juhyuHours) * WEEKS_PER_MONTH;
  const extraHours = totalHours - contractHours; // 소정 밖 근로(연장·휴일 등)도 시급만큼은 받는다
  const premiums = overtimePay + nightPay + holidayPay;
  const monthHours = regularMonthHours + extraHours * WEEKS_PER_MONTH;
  // 1e-6: 104.28 × 10,700 같은 소수 곱이 1,115,795.9999… 로 버려지지 않게
  const monthly = Math.floor(regularMonthHours * w + extraHours * WEEKS_PER_MONTH * w + premiums * WEEKS_PER_MONTH + 1e-6);

  const pct = (r?: RefValue) => (r ? r.value / 100 : 0);
  const deductions: PayResult['deductions'] = [];
  if (deduction === 'insurance' && monthly > 0) {
    const pension = floor10(Math.floor(monthly / 1000) * 1000 * pct(basis.pension));
    const health = floor10(monthly * (pct(basis.health) / 2));
    const ltc = basis.health && basis.ltc ? floor10(health * (basis.ltc.value / basis.health.value)) : 0;
    const employment = floor10(monthly * pct(basis.employment));
    deductions.push(
      { key: 'pension', amount: pension },
      { key: 'health', amount: health },
      { key: 'ltc', amount: ltc },
      { key: 'employment', amount: employment },
    );
  } else if (deduction === 'tax33' && monthly > 0) {
    const incomeTax = floor10(monthly * 0.03);
    deductions.push({ key: 'incomeTax', amount: incomeTax }, { key: 'localTax', amount: floor10(incomeTax * 0.1) });
  }
  const totalDeduction = sum(deductions.map((d) => d.amount));

  return {
    contractHours, eligible, totalHours, juhyuHours, overtimeHours, nightHours, holidayHours, holidayOver8Hours,
    basePay, juhyuPay, overtimePay, nightPay, holidayPay, weekly,
    monthHours, monthly, deductions, totalDeduction, net: monthly - totalDeduction,
    belowMinWage: !!basis.minWage && w > 0 && w < basis.minWage.value,
  };
}

/** 간단 계산: 하루 h시간 × 주 n일 */
export const simpleDays = (hoursPerDay: number, daysPerWeek: number): WorkDay[] =>
  Array.from({ length: Math.max(0, Math.min(7, Math.floor(daysPerWeek))) }, () => ({
    hours: Math.max(0, Math.min(24, hoursPerDay)), nightHours: 0, holiday: false,
  }));

/** 근무표: 요일별 입력 → 계산용 하루 목록 */
export const scheduleDays = (days: DayInput[]): WorkDay[] =>
  days.filter((d) => d.on).map((d) => {
    const r = analyzeDay(d);
    return { hours: r.workMin / 60, nightHours: r.nightMin / 60, holiday: d.holiday };
  });
