/**
 * 에너지 단가 — 여러 계산기가 함께 쓰는 한 곳.
 * 단가가 바뀌면 이 파일만 고치고 asOf(기준일)·source(출처)도 같이 바꾼다.
 * 화면에는 기준일이 함께 표시되고, 사용자가 직접 고쳐 넣을 수 있다.
 */

/** [구간 상한 kWh, 값] — 마지막 구간 상한은 Infinity */
export type Tier = [number, number];

export const ELECTRICITY = {
  asOf: '2026-10',
  source: '한전 주택용(저압) 요금표 2023.5.16 시행 단가(2026년 4분기 동결), 기후환경요금 9.0원, 연료비조정요금 +5.0원(2026년 4분기), 전력산업기반기금 2.7%(2025.7~), 부가가치세 10%',
  /** 기타계절 */
  normal: {
    base: [[200, 910], [400, 1600], [Infinity, 7300]] as Tier[],
    energy: [[200, 120.0], [400, 214.6], [Infinity, 307.3]] as Tier[],
  },
  /** 하계(7·8월): 누진 구간 300 / 450 kWh */
  summer: {
    base: [[300, 910], [450, 1600], [Infinity, 7300]] as Tier[],
    energy: [[300, 120.0], [450, 214.6], [Infinity, 307.3]] as Tier[],
  },
  summerMonths: [7, 8],
  /** 하계·동계 1,000kWh 초과분 슈퍼유저 요금 */
  superUser: { over: 1000, rate: 736.2, months: [7, 8, 12, 1, 2] },
  climatePerKWh: 9.0,
  fuelAdjustPerKWh: 5.0,
  vat: 0.10,
  fund: 0.027,
} as const;

export const CITY_GAS = {
  asOf: '2026-10-01',
  region: '서울',
  source: '서울도시가스 주택용(취사·난방) 요금표, 부가세 별도',
  perMJ: 22.5268,
  vat: 0.10,
} as const;

export const KEROSENE = {
  asOf: '2026-10-22',
  source: '오피넷 실내등유 전국 주유소 평균 판매가격(부가세 포함)',
  perLiter: 1572,
  /** 발열량(약) MJ/L */
  mjPerLiter: 36.5,
} as const;

export const CO2 = {
  /** kg/kWh — 온실가스 배출권거래제 지침의 전력 간접배출계수 */
  gridPerKWh: 0.4567,
  /** kg/MJ — IPCC 기본 배출계수 (천연가스 56.1, 등유 71.9 kg/GJ) */
  gasPerMJ: 0.0561,
  kerosenePerMJ: 0.0719,
  /** 30년생 소나무 1그루 연간 흡수량(산림청 자료로 흔히 인용) kg */
  pineTreePerYear: 6.6,
} as const;
