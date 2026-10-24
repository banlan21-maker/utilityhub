/**
 * 부가가치세 계산 (한국).
 * - 세율 10% (부가가치세법 제30조)
 * - 일반과세자 납부세액 = 매출세액 − 매입세액 (음수면 환급)
 * - 간이과세자 납부세액 = 공급대가 × 업종별 부가가치율 × 10% − 매입 공급대가 × 0.5%
 *   (2021. 7. 1. 이후, 부가가치세법 제63조), 공제 후 음수는 0(환급 없음).
 *   해당 과세기간 공급대가 4,800만 원 미만이면 납부의무 면제(제69조).
 */

export const KR_VAT_RATE = 0.1;

export interface VatSplit {
  supply: number;
  vat: number;
  total: number;
}

/** 공급가액 → 세액(원 미만 절사)·합계 */
export function addVat(supply: number, rate = KR_VAT_RATE): VatSplit {
  const s = Math.max(0, Math.floor(supply));
  const vat = Math.floor(s * rate);
  return { supply: s, vat, total: s + vat };
}

/** 합계(부가세 포함) → 공급가액·세액. 공급가액은 반올림, 세액은 합계와 차액이라 항상 합계가 맞는다 */
export function splitVat(total: number, rate = KR_VAT_RATE): VatSplit {
  const t = Math.max(0, Math.floor(total));
  const supply = Math.round(t / (1 + rate));
  return { supply, vat: t - supply, total: t };
}

export interface GeneralReturn {
  outputTax: number;
  inputTax: number;
  /** + 납부, − 환급 */
  payable: number;
}

/** 일반과세자: 매출·매입 공급가액 기준 */
export function generalReturn(salesSupply: number, purchaseSupply: number): GeneralReturn {
  const outputTax = Math.floor(Math.max(0, salesSupply) * KR_VAT_RATE);
  const inputTax = Math.floor(Math.max(0, purchaseSupply) * KR_VAT_RATE);
  return { outputTax, inputTax, payable: outputTax - inputTax };
}

export const SIMPLIFIED_INDUSTRIES = [
  { id: 'retail', rate: 0.15, ko: '소매업·음식점업·재생용 재료수집 및 판매업', en: 'Retail, restaurants, recycling' },
  { id: 'manufacturing', rate: 0.2, ko: '제조업·농업·임업·어업·소화물 전문 운송업', en: 'Manufacturing, agriculture, small parcel delivery' },
  { id: 'lodging', rate: 0.25, ko: '숙박업', en: 'Lodging' },
  { id: 'construction', rate: 0.3, ko: '건설업·운수 및 창고업·정보통신업·그 밖의 서비스업', en: 'Construction, transport, IT, other services' },
  { id: 'professional', rate: 0.4, ko: '금융·보험 관련, 전문·과학·기술, 사업시설관리·사업지원·임대, 부동산 관련 서비스업·부동산임대업', en: 'Finance/insurance services, professional & technical, business support, real estate' },
] as const;

export type SimplifiedIndustryId = (typeof SIMPLIFIED_INDUSTRIES)[number]['id'];

/** 간이과세자 납부의무 면제 기준 (해당 과세기간 공급대가) */
export const SIMPLIFIED_EXEMPT_UNDER = 48_000_000;
/** 간이과세 적용 기준 (직전 연도 공급대가, 2024. 7. 1. 이후. 부동산임대업·과세유흥장소는 4,800만 원) */
export const SIMPLIFIED_THRESHOLD = 104_000_000;

export interface SimplifiedReturn {
  valueAddedRate: number;
  grossTax: number;
  purchaseCredit: number;
  payableBeforeExemption: number;
  exempt: boolean;
  payable: number;
  /** 같은 매출·매입이 일반과세자였을 때 납부(+)/환급(−) */
  generalEquivalent: number;
}

/** 간이과세자: 매출·매입 모두 공급대가(부가세 포함 금액) 기준, 1년 과세기간 */
export function simplifiedReturn(salesGross: number, purchaseGross: number, industry: SimplifiedIndustryId): SimplifiedReturn {
  const sales = Math.max(0, Math.floor(salesGross));
  const purchases = Math.max(0, Math.floor(purchaseGross));
  const valueAddedRate = SIMPLIFIED_INDUSTRIES.find(x => x.id === industry)!.rate;
  const grossTax = Math.floor(sales * valueAddedRate * KR_VAT_RATE);
  const purchaseCredit = Math.floor(purchases * 0.005);
  const payableBeforeExemption = Math.max(0, grossTax - purchaseCredit);
  const exempt = sales < SIMPLIFIED_EXEMPT_UNDER;
  const generalEquivalent = splitVat(sales).vat - splitVat(purchases).vat;
  return {
    valueAddedRate, grossTax, purchaseCredit, payableBeforeExemption,
    exempt, payable: exempt ? 0 : payableBeforeExemption, generalEquivalent,
  };
}

/** 다른 나라 표준세율 (참고용) */
export const FOREIGN_RATES = [
  { ko: '일본', en: 'Japan', rate: 10 },
  { ko: '싱가포르', en: 'Singapore', rate: 9 },
  { ko: '독일', en: 'Germany', rate: 19 },
  { ko: '영국', en: 'UK', rate: 20 },
  { ko: '프랑스', en: 'France', rate: 20 },
] as const;
