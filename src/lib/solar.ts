/**
 * 태양광·태양열 발전량과 절감액.
 *
 * 태양광 발전량 = 용량(kWp) × 지역 일평균 발전시간 × 월별 계수 × 일수 × 경사·방위 보정 × (1 − 음영)
 * - 지역 발전시간: 국가참조표준기상데이터 16개 지역 PVsyst 모의(정남향 30°, 3kWp)의 연평균 일 발전시간.
 *   온도·인버터 등 시스템 손실이 이미 들어 있는 값이라 손실을 따로 또 빼지 않는다(전국 평균 3.6h ≈ 1,312 kWh/kWp).
 * - 패널 노화는 해마다 누적(기본 0.5%/년).
 * - 전기요금은 한전 주택용 저압 요금 전체(기본·전력량·기후환경·연료비조정·부가세·전력기금)로 계산하고,
 *   남는 전력은 다음 달로 이월(상계거래)할 수 있다.
 *
 * 태양열: 집열량 = 면적 × 일사량(발전시간 ÷ 0.85) × 3.6MJ × 집열 효율, 쓰는 열은 급탕 필요 열량을 넘지 않는다.
 * 절감 연료 = 쓴 열 ÷ 기존 보일러 효율.
 */

import { ELECTRICITY, type Tier } from '@/constants/energyPrices';

export const REGIONS: { id: string; ko: string; en: string; hours: number }[] = [
  { id: 'seoul', ko: '서울', en: 'Seoul', hours: 3.2 }, { id: 'incheon', ko: '인천', en: 'Incheon', hours: 3.6 },
  { id: 'wonju', ko: '원주', en: 'Wonju', hours: 3.5 }, { id: 'chuncheon', ko: '춘천', en: 'Chuncheon', hours: 3.5 },
  { id: 'gangneung', ko: '강릉', en: 'Gangneung', hours: 3.6 }, { id: 'chungju', ko: '충주', en: 'Chungju', hours: 3.5 },
  { id: 'seosan', ko: '서산', en: 'Seosan', hours: 3.7 }, { id: 'daejeon', ko: '대전', en: 'Daejeon', hours: 3.8 },
  { id: 'jeonju', ko: '전주', en: 'Jeonju', hours: 3.4 }, { id: 'gwangju', ko: '광주', en: 'Gwangju', hours: 3.8 },
  { id: 'mokpo', ko: '목포', en: 'Mokpo', hours: 3.9 }, { id: 'daegu', ko: '대구', en: 'Daegu', hours: 3.5 },
  { id: 'pohang', ko: '포항', en: 'Pohang', hours: 3.7 }, { id: 'busan', ko: '부산', en: 'Busan', hours: 3.7 },
  { id: 'jinju', ko: '진주', en: 'Jinju', hours: 3.8 }, { id: 'jeju', ko: '제주', en: 'Jeju', hours: 3.3 },
  { id: 'avg', ko: '전국 평균', en: 'National average', hours: 3.6 },
];

/**
 * 월별 계수(일수 가중 평균 1): 같은 논문의 16개 지역 평균 월별 발전시간(3.0, 3.8, 4.0, 4.4, 4.2, 3.7, 3.3, 3.5, 3.5, 3.8, 3.1, 3.0h)을 정규화.
 * 한국동서발전 실측(당진·울산·동해, 2022~2026)과 비교해 지역별 월표·임의 계수보다 월 패턴 오차가 가장 작았다.
 */
export const MONTH_COEFF = [0.832, 1.054, 1.109, 1.22, 1.165, 1.026, 0.915, 0.971, 0.971, 1.054, 0.86, 0.832];
export const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * 실측 보정: 실제 발전소는 먼지·부분 고장·노후·출력 제한 등으로 모의값보다 덜 나온다.
 * 한국동서발전 당진(3기)·울산 실측 연 1,190·1,206 kWh/kWp ÷ 모의값(3.7h × 365) = 0.881·0.893 → 0.89
 */
export const FIELD_FACTOR = 0.89;

/** 검증 기록 (화면 표시용): 실측 = 결측·정지일 제외 일평균 × 일수 */
export const VALIDATION = [
  { site: '당진 (3기, 2.7MW)', siteEn: 'Dangjin (3 plants, 2.7 MW)', ref: '서산 3.7h', refEn: 'Seosan 3.7 h', measured: 1190, model: 1351 },
  { site: '울산 (0.5MW)', siteEn: 'Ulsan (0.5 MW)', ref: '포항·부산 3.7h', refEn: 'Pohang/Busan 3.7 h', measured: 1206, model: 1351 },
  { site: '동해 (2MW)', siteEn: 'Donghae (2 MW)', ref: '강릉 3.6h', refEn: 'Gangneung 3.6 h', measured: 919, model: 1314 },
];

/** 정남향 30° 대비 보정(경험치) */
export const TILT_FACTOR: Record<string, number> = { '0': 0.88, '15': 0.96, '30': 1.0, '45': 0.97, '60': 0.89, '90': 0.68 };
export const AZIMUTH_FACTOR: Record<string, number> = { south: 1.0, southeast: 0.95, southwest: 0.95, east: 0.82, west: 0.82 };

// ───── 전기요금 ─────

const tierBase = (kwh: number, tiers: readonly Tier[]) => tiers.find(([upto]) => kwh <= upto)![1];
function tierEnergy(kwh: number, tiers: readonly Tier[]) {
  let rest = kwh, prev = 0, sum = 0;
  for (const [upto, rate] of tiers) {
    const span = Math.min(rest, upto - prev);
    if (span <= 0) break;
    sum += span * rate;
    rest -= span;
    prev = upto;
  }
  return sum;
}

export interface Bill { base: number; energy: number; climate: number; fuel: number; subtotal: number; vat: number; fund: number; total: number }

/** 주택용 저압 월 요금 (month: 1~12) */
export function electricBill(kwh: number, month: number): Bill {
  const E = ELECTRICITY;
  const use = Math.max(0, Math.round(kwh));
  if (use === 0) return { base: 0, energy: 0, climate: 0, fuel: 0, subtotal: 0, vat: 0, fund: 0, total: 0 };
  const t = (E.summerMonths as readonly number[]).includes(month) ? E.summer : E.normal;
  const base = tierBase(use, t.base);
  let energy = tierEnergy(use, t.energy);
  if ((E.superUser.months as readonly number[]).includes(month) && use > E.superUser.over) {
    // 1,000kWh 초과분은 슈퍼유저 단가로
    energy = tierEnergy(E.superUser.over, t.energy) + (use - E.superUser.over) * E.superUser.rate;
  }
  const climate = use * E.climatePerKWh;
  const fuel = use * E.fuelAdjustPerKWh;
  const subtotal = Math.floor(base + energy + climate + fuel);
  const vat = Math.round(subtotal * E.vat);
  const fund = Math.floor((subtotal * E.fund) / 10) * 10;
  return { base, energy, climate, fuel, subtotal, vat, fund, total: Math.floor((subtotal + vat + fund) / 10) * 10 };
}

// ───── 태양광 ─────

export interface PvInput {
  kWp: number;
  hours: number;
  tilt: string;
  azimuth: string;
  shadePct: number;
  degradePct: number;
  /** 월 사용량(kWh): 기타계절, 7·8월 */
  usage: number;
  summerUsage: number;
  netMetering: boolean;
  /** 실측 보정(×FIELD_FACTOR) 적용 */
  fieldCorrection: boolean;
  netCost: number;
  years: number;
}

export interface PvMonth { month: number; gen: number; usage: number; billed: number; before: number; after: number; saving: number }
export interface PvResult {
  months: PvMonth[];
  annualGen: number;
  specificYield: number;
  annualSaving: number;
  yearly: { year: number; gen: number; saving: number; cumulative: number }[];
  paybackYears: number | null;
  co2Kg: number;
}

function pvYear(inp: PvInput, degrade: number): PvMonth[] {
  const factor = (TILT_FACTOR[inp.tilt] ?? 1) * (AZIMUTH_FACTOR[inp.azimuth] ?? 1) * (1 - Math.max(0, Math.min(100, inp.shadePct)) / 100) * degrade
    * (inp.fieldCorrection ? FIELD_FACTOR : 1);
  let carry = 0;
  return MONTH_COEFF.map((c, i) => {
    const month = i + 1;
    const gen = inp.kWp * inp.hours * c * DAYS[i] * factor;
    const usage = month === 7 || month === 8 ? inp.summerUsage : inp.usage;
    // 상계거래: 남는 전력은 다음 달로 넘긴다
    const available = gen + (inp.netMetering ? carry : 0);
    const billed = Math.max(0, usage - available);
    carry = inp.netMetering ? Math.max(0, available - usage) : 0;
    const before = electricBill(usage, month).total;
    const after = electricBill(billed, month).total;
    return { month, gen, usage, billed, before, after, saving: before - after };
  });
}

export function pvCalc(inp: PvInput): PvResult | null {
  if (!(inp.kWp > 0 && inp.hours > 0)) return null;
  const months = pvYear(inp, 1);
  const annualGen = months.reduce((s, m) => s + m.gen, 0);
  const yearly: PvResult['yearly'] = [];
  let cumulative = -inp.netCost, payback: number | null = inp.netCost <= 0 ? 0 : null;
  for (let y = 1; y <= inp.years; y++) {
    const ms = y === 1 ? months : pvYear(inp, Math.pow(1 - inp.degradePct / 100, y - 1));
    const saving = ms.reduce((s, m) => s + m.saving, 0);
    const prev = cumulative;
    cumulative += saving;
    if (payback === null && cumulative >= 0 && saving > 0) payback = y - 1 + -prev / saving;
    yearly.push({ year: y, gen: ms.reduce((s, m) => s + m.gen, 0), saving, cumulative });
  }
  return {
    months, annualGen, specificYield: annualGen / inp.kWp,
    annualSaving: months.reduce((s, m) => s + m.saving, 0),
    yearly, paybackYears: payback, co2Kg: annualGen * 0.4567,
  };
}

// ───── 발전사업 (전력 판매) ─────

/**
 * 태양광 REC 가중치 — 「신·재생에너지 공급의무화제도 관리 및 운영지침」 별표 2.
 * 용량 구간별 가중치를 나눠 적용한 가중평균이고, 소수점 넷째 자리에서 버린다(비고 4).
 * '100kW 미만' 구간은 산정식대로 99.999kW까지라서 정확히 100kW면 1.199가 된다.
 */
export type PvSite = 'land' | 'building' | 'floating' | 'forest';
const REC_BANDS: Record<PvSite, [number, number][]> = {
  land: [[99.999, 1.2], [3000, 1.0], [Infinity, 0.8]],
  building: [[3000, 1.5], [Infinity, 1.0]],
  floating: [[99.999, 1.6], [3000, 1.4], [Infinity, 1.2]],
  forest: [[Infinity, 0.5]],
};
export function recWeight(site: PvSite, kW: number): number {
  if (!(kW > 0)) return 0;
  let prev = 0, sum = 0;
  for (const [upto, w] of REC_BANDS[site]) {
    const span = Math.min(kW, upto) - prev;
    if (span <= 0) break;
    sum += span * w;
    prev = upto;
  }
  return Math.floor((sum / kW) * 1000 + 1e-9) / 1000;
}

/** REC 현물시장 마지막 해(재생에너지법 개정 2026.8, 하위법령 확정 전) */
export const SPOT_LAST_YEAR = 2029;

export interface BizInput {
  kW: number;
  hours: number;
  tilt: string;
  azimuth: string;
  shadePct: number;
  degradePct: number;
  fieldCorrection: boolean;
  /** contract: 20년 고정가격(계약시장) / spot: SMP + REC×가중치 */
  sale: 'contract' | 'spot';
  /** 원/kWh */
  contractPrice: number;
  premium: number;
  smp: number;
  /** 원/REC(=원/MWh) */
  recPrice: number;
  weight: number;
  /** 현물 판매 첫해(1년차 연도), SPOT_LAST_YEAR 이후에는 afterPrice */
  startYear: number;
  afterPrice: number;
  capex: number;
  /** 1년차 운영비(원/년), 해마다 omEscalPct 만큼 오른다 */
  om: number;
  omEscalPct: number;
  rent: number;
  /** 인버터 교체비(원), inverterYear 에 한 번 */
  inverter: number;
  inverterYear: number;
  loanPct: number;
  ratePct: number;
  loanYears: number;
  years: number;
}

export interface BizYear {
  year: number; calYear: number; gen: number; price: number; revenue: number; cost: number;
  interest: number; principal: number; ebitda: number; cash: number; cumulative: number; dscr: number | null;
}

/** 현금흐름의 내부수익률(연), 부호가 바뀌지 않으면 null */
export function irr(flows: number[]): number | null {
  const npv = (r: number) => flows.reduce((s, c, t) => s + c / Math.pow(1 + r, t), 0);
  let lo = -0.99, hi = 1;
  if (npv(lo) * npv(hi) > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (npv(lo) * npv(mid) <= 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

export function bizCalc(inp: BizInput) {
  if (!(inp.kW > 0 && inp.hours > 0 && inp.capex >= 0)) return null;
  const factor = (TILT_FACTOR[inp.tilt] ?? 1) * (AZIMUTH_FACTOR[inp.azimuth] ?? 1) * (1 - Math.max(0, Math.min(100, inp.shadePct)) / 100)
    * (inp.fieldCorrection ? FIELD_FACTOR : 1);
  const gen1 = MONTH_COEFF.reduce((s, c, i) => s + inp.kW * inp.hours * c * DAYS[i], 0) * factor;

  const spotPrice = inp.smp + (inp.recPrice / 1000) * inp.weight;
  const loan = inp.capex * Math.max(0, Math.min(100, inp.loanPct)) / 100;
  const equity = inp.capex - loan;
  const r = inp.ratePct / 100, n = Math.max(0, Math.round(inp.loanYears));
  // 원리금 균등 상환
  const payment = loan > 0 && n > 0 ? (r > 0 ? (loan * r) / (1 - Math.pow(1 + r, -n)) : loan / n) : 0;

  const rows: BizYear[] = [];
  let balance = loan, cumulative = -equity;
  let payback: number | null = equity <= 0 ? 0 : null;
  for (let y = 1; y <= inp.years; y++) {
    const calYear = inp.startYear + y - 1;
    const gen = gen1 * Math.pow(1 - inp.degradePct / 100, y - 1);
    const price = inp.sale === 'contract' ? inp.contractPrice + inp.premium : calYear <= SPOT_LAST_YEAR ? spotPrice : inp.afterPrice;
    const revenue = gen * price;
    const cost = inp.om * Math.pow(1 + inp.omEscalPct / 100, y - 1) + inp.rent + (y === inp.inverterYear ? inp.inverter : 0);
    const ebitda = revenue - cost;
    let interest = 0, principal = 0;
    if (y <= n && balance > 0) {
      interest = balance * r;
      principal = Math.min(balance, payment - interest);
      balance -= principal;
    }
    const debt = interest + principal;
    const cash = ebitda - debt;
    const prev = cumulative;
    cumulative += cash;
    if (payback === null && cumulative >= 0 && cash > 0) payback = y - 1 + -prev / cash;
    rows.push({ year: y, calYear, gen, price, revenue, cost, interest, principal, ebitda, cash, cumulative, dscr: debt > 0 ? ebitda / debt : null });
  }
  const dscrs = rows.map(x => x.dscr).filter((x): x is number => x !== null);
  const sum = (k: keyof BizYear) => rows.reduce((s, x) => s + (x[k] as number), 0);
  return {
    gen1, specificYield: gen1 / inp.kW, spotPrice, loan, equity, payment, rows, paybackYears: payback,
    projectIrr: irr([-inp.capex, ...rows.map(x => x.ebitda)]),
    equityIrr: equity > 0 ? irr([-equity, ...rows.map(x => x.cash)]) : null,
    minDscr: dscrs.length ? Math.min(...dscrs) : null,
    totalRevenue: sum('revenue'), totalCost: sum('cost'), totalInterest: sum('interest'),
    net: cumulative,
  };
}

// ───── 태양열 ─────

export const PR = 0.85;
export const WATER_KJ_PER_L_K = 4.186;

export interface ThermalInput {
  areaM2: number;
  hours: number;
  collectorEff: number; // 0~1, 연평균
  litersPerDay: number;
  hotC: number;
  coldC: number;
  /** 기존 열원 1MJ(열)당 연료비: 연료 단가(원/MJ) ÷ 보일러 효율 */
  costPerUsefulMJ: number;
  co2PerUsefulMJ: number;
  netCost: number;
  years: number;
}

export interface ThermalMonth { month: number; collected: number; demand: number; used: number; saving: number }

export function thermalCalc(inp: ThermalInput) {
  if (!(inp.areaM2 > 0 && inp.hours > 0 && inp.litersPerDay > 0 && inp.hotC > inp.coldC)) return null;
  const dailyDemand = (inp.litersPerDay * WATER_KJ_PER_L_K * (inp.hotC - inp.coldC)) / 1000; // MJ
  const months: ThermalMonth[] = MONTH_COEFF.map((c, i) => {
    const collected = inp.areaM2 * (inp.hours / PR) * c * 3.6 * inp.collectorEff * DAYS[i];
    const demand = dailyDemand * DAYS[i];
    const used = Math.min(collected, demand);
    return { month: i + 1, collected, demand, used, saving: used * inp.costPerUsefulMJ };
  });
  const annualSaving = months.reduce((s, m) => s + m.saving, 0);
  const used = months.reduce((s, m) => s + m.used, 0);
  const demand = months.reduce((s, m) => s + m.demand, 0);
  const collected = months.reduce((s, m) => s + m.collected, 0);
  const paybackYears = annualSaving > 0 ? inp.netCost / annualSaving : null;
  return {
    months, dailyDemand, annualSaving, used, demand, collected,
    solarFraction: used / demand,
    wastedPct: collected > 0 ? (1 - used / collected) * 100 : 0,
    paybackYears: paybackYears !== null && paybackYears <= inp.years * 2 ? paybackYears : paybackYears,
    co2Kg: used * inp.co2PerUsefulMJ,
    cumulative: Array.from({ length: inp.years }, (_, y) => ({ year: y + 1, cumulative: annualSaving * (y + 1) - inp.netCost })),
  };
}
