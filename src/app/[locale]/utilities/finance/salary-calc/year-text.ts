// 연봉 계산기 문구의 {year}, {pension}, {net40Man} 같은 자리를 그 해 기준값과 실제 계산 결과로 채운다.
// 요율·최저시급은 src/constants/referenceValues.ts, 예시 금액은 화면과 같은 계산 함수에서 나온다.
// (page.tsx 서버 전용 — 새해가 되면 제목·설명·FAQ 숫자가 저절로 바뀐다)
import { WEEKS_PER_MONTH, krInsurance, krMinWage } from '@/constants/wageConfig';
import { calcKRNetPay } from '@/lib/krPayroll';

const pct = (v: number, digits: number) => String(Number((v * 100).toFixed(digits)));
const comma = (n: number) => Math.round(n).toLocaleString('en-US');
const man = (n: number) => comma(n / 10_000);
const thousand = (n: number) => comma(Math.round(n / 1000) * 1000);
/** 398,160 → "39만 8천 원" */
const koManChun = (n: number) => {
  const total = Math.round(n / 1000);
  const m = Math.floor(total / 10), c = total % 10;
  return c ? `${m}만 ${c}천 원` : `${m}만 원`;
};

export function salaryVars(year: number): Record<string, string> {
  const ins = krInsurance(year);
  // 표와 같은 조건: 본인 1명, 식대 비과세 월 20만 원, 퇴직금 별도
  const net = (salary: number) => calcKRNetPay({ monthlyGross: Math.floor(salary / 12), nonTaxable: 200_000, family: 1, children: 0, year });
  const [n30, n40, n50] = [30_000_000, 40_000_000, 50_000_000].map(net);
  const minWage = krMinWage(year);
  const minMonthly = (40 + 8) * minWage * WEEKS_PER_MONTH; // 주 40시간 + 주휴 8시간
  return {
    year: String(year),
    pension: pct(ins.pension, 3), pensionTotal: pct(ins.pension * 2, 3),
    health: pct(ins.health, 3), healthTotal: pct(ins.health * 2, 3),
    ltc: pct(ins.longTermCareOfHealth, 2), employment: pct(ins.employment, 3), total: pct(ins.total, 2),
    pensionCap: comma(ins.pensionBaseMax), pensionCapMan: man(ins.pensionBaseMax),
    minWage: comma(minWage), minMonthlyMan: man(minMonthly), minMonthlyK: thousand(minMonthly),
    net30Man: man(n30.monthlyNet), net40Man: man(n40.monthlyNet), net50Man: man(n50.monthlyNet),
    net30K: thousand(n30.monthlyNet), net40K: thousand(n40.monthlyNet), net50K: thousand(n50.monthlyNet),
    deduct40K: thousand(n40.totalDeduction), deduct40Ko: koManChun(n40.totalDeduction),
  };
}

/** 객체 안의 모든 문자열에서 {이름} 을 채운다 */
export function fillYear<T>(value: T, year: number): T {
  const vars = salaryVars(year);
  return JSON.parse(JSON.stringify(value), (_k, x) =>
    typeof x === 'string' ? x.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m) : x) as T;
}
