// 손익분기점·원가율 계산기 — 순수 계산·데이터 (화면 없음, 노드에서 바로 테스트 가능)
//
// 금액 입력은 문자열로 들고 다니고 계산할 때 num() 으로 읽는다 (입력 중 "1." 같은 값 유지).
// 원가율·수수료율은 부가세를 뺀 매출 기준 (기획안 테스트 3·5와 같은 방식).

export type Biz = 'food' | 'beauty';
export type Unit = 'g' | 'kg' | 'ml' | 'L' | 'ea';
export type Currency = 'KRW' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

export const UNITS: Unit[] = ['g', 'kg', 'ml', 'L', 'ea'];
const UNIT_INFO: Record<Unit, { dim: 'mass' | 'vol' | 'count'; f: number }> = {
  g: { dim: 'mass', f: 1 }, kg: { dim: 'mass', f: 1000 },
  ml: { dim: 'vol', f: 1 }, L: { dim: 'vol', f: 1000 },
  ea: { dim: 'count', f: 1 },
};

export interface CurrencyInfo { symbol: string; decimals: number; rounding: [number, number]; step: number }
export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  KRW: { symbol: '₩', decimals: 0, rounding: [100, 500], step: 1000 },
  USD: { symbol: '$', decimals: 2, rounding: [0.5, 1], step: 1 },
  EUR: { symbol: '€', decimals: 2, rounding: [0.5, 1], step: 1 },
  GBP: { symbol: '£', decimals: 2, rounding: [0.5, 1], step: 1 },
  JPY: { symbol: '¥', decimals: 0, rounding: [10, 100], step: 100 },
  CAD: { symbol: 'C$', decimals: 2, rounding: [0.5, 1], step: 1 },
  AUD: { symbol: 'A$', decimals: 2, rounding: [0.5, 1], step: 1 },
};

export const DEFAULT_TARGET: Record<Biz, string> = { food: '33', beauty: '20' };
export const LIMITS = { menus: 30, ingredients: 30, extras: 15, name: 40 };

export interface Ingredient { id: string; name: string; price: string; qty: string; unit: Unit; use: string; useUnit: Unit; yieldPct: string }
export interface Extra { id: string; name: string; amount: string }
export interface Menu {
  id: string; name: string;
  ingredients: Ingredient[]; extras: Extra[];
  minutes: string;
  price: string;
  costMode: 'calc' | 'manual'; manualCost: string;
}
export interface FixedCosts {
  rent: string; maintenance: string; staff: string; owner: string; utilities: string;
  interest: string; equipment: string; equipmentMonths: string; other: string;
}
export const FIXED_KEYS = ['rent', 'maintenance', 'staff', 'owner', 'utilities', 'interest', 'other'] as const;

export interface Data {
  v: 1;
  biz: Biz;
  currency: Currency;
  taxRate: string;
  menus: Menu[];
  activeId: string;
  laborRate: string; includeLabor: boolean;
  priceIncludesTax: boolean;
  targetRate: string;
  feeRate: string;
  rounding: 0 | 1 | 2;
  fixed: FixedCosts;
  ticket: string; ticketIncludesTax: boolean;
  costRateMode: 'auto' | 'manual'; manualCostRate: string;
  days: string; seats: string; targetProfit: string;
}

/* ── 숫자 ── */
export const num = (v: string | number | undefined | null): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = Number(String(v ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
};
/** 입력칸 정리: 숫자와 소수점 하나만, 소수 자릿수 제한 */
export const cleanNum = (v: string, decimals = 2, maxInt = 12): string => {
  const [i, ...d] = String(v).replace(/[^0-9.]/g, '').split('.');
  const int = i.replace(/^0+(?=\d)/, '').slice(0, maxInt);
  if (decimals <= 0 || !d.length) return int;
  return `${int || '0'}.${d.join('').slice(0, decimals)}`;
};
/** 부동소수 오차 때문에 13200.000000000002 → 13,300원이 되지 않도록 */
export const ceilTo = (x: number, unit: number): number => {
  const q = Math.ceil(x / unit - 1e-9);
  return Math.round(q * unit * 100) / 100;
};
const ceilInt = (x: number) => Math.ceil(x - 1e-9);
export const roundTo = (x: number, decimals: number) => {
  const f = 10 ** decimals;
  return Math.round(x * f) / f;
};

/* ── ① 원가 ── */
export type IngError = 'unit' | 'qty' | 'yield';
export interface IngResult { cost: number; error?: IngError; empty: boolean }

export function ingredientCost(i: Ingredient): IngResult {
  const price = num(i.price), qty = num(i.qty), use = num(i.use);
  const yieldPct = i.yieldPct.trim() === '' ? 100 : num(i.yieldPct);
  const empty = price <= 0 && use <= 0;
  if (empty) return { cost: 0, empty };
  if (UNIT_INFO[i.unit].dim !== UNIT_INFO[i.useUnit].dim) return { cost: 0, error: 'unit', empty };
  if (qty <= 0) return { cost: 0, error: 'qty', empty };
  if (yieldPct <= 0 || yieldPct > 100) return { cost: 0, error: 'yield', empty };
  const perBase = price / (qty * UNIT_INFO[i.unit].f);
  return { cost: (perBase * use * UNIT_INFO[i.useUnit].f) / (yieldPct / 100), empty };
}

export interface MenuCost {
  ingredients: number; extras: number;
  /** 재료비 + 기타 비용 (직접 입력이면 그 값) */
  material: number;
  /** 시술 시간 × 시간당 인건비 (미용 모드만) */
  labor: number;
  /** 원가율·판매가 계산에 쓰는 원가 (인건비 포함 스위치 반영) */
  total: number;
  errors: number;
  manual: boolean;
}

export function menuCost(m: Menu, biz: Biz, laborRate: number, includeLabor: boolean): MenuCost {
  const labor = biz === 'beauty' ? (num(m.minutes) / 60) * laborRate : 0;
  if (m.costMode === 'manual') {
    const material = num(m.manualCost);
    return { ingredients: material, extras: 0, material, labor, total: material + (includeLabor ? labor : 0), errors: 0, manual: true };
  }
  let ingredients = 0, errors = 0;
  for (const i of m.ingredients) {
    const r = ingredientCost(i);
    if (r.error) errors++;
    ingredients += r.cost;
  }
  const extras = m.extras.reduce((a, e) => a + Math.max(0, num(e.amount)), 0);
  const material = ingredients + extras;
  return { ingredients, extras, material, labor, total: material + (includeLabor ? labor : 0), errors, manual: false };
}

/* ── ② 판매가·원가율 ── */
export interface PricingInput {
  cost: number; price: number; priceIncludesTax: boolean;
  taxRate: number; targetRate: number; feeRate: number;
  /** 0이면 올림 없음 */
  roundUnit: number; decimals: number;
}
export interface Pricing {
  net: number; tax: number;
  costRate: number | null;
  fee: number; profit: number;
  recommended: number | null;
  recommendedRaw: number | null;
}

export function pricing(p: PricingInput): Pricing {
  const t = Math.max(0, p.taxRate) / 100;
  const net = p.priceIncludesTax ? p.price / (1 + t) : p.price;
  const tax = p.priceIncludesTax ? p.price - net : net * t;
  const fee = net * (Math.max(0, p.feeRate) / 100);
  const costRate = net > 0 ? p.cost / net : null;
  let recommendedRaw: number | null = null;
  let recommended: number | null = null;
  if (p.targetRate > 0 && p.targetRate < 100 && p.cost > 0) {
    recommendedRaw = (p.cost / (p.targetRate / 100)) * (p.priceIncludesTax ? 1 + t : 1);
    recommended = p.roundUnit > 0 ? ceilTo(recommendedRaw, p.roundUnit) : roundTo(recommendedRaw, p.decimals);
  }
  return { net, tax, costRate, fee, profit: net - p.cost - fee, recommended, recommendedRaw };
}

/** 원가율이 비정상이면 경고 (100% 이상 또는 1% 미만) */
export const rateSuspicious = (rate: number | null) => rate !== null && (rate >= 1 || rate < 0.01);

/* ── ③ 손익분기점 ── */
export function fixedTotal(f: FixedCosts): { total: number; depreciation: number } {
  const months = num(f.equipmentMonths);
  const depreciation = months > 0 ? num(f.equipment) / months : 0;
  const total = FIXED_KEYS.reduce((a, k) => a + Math.max(0, num(f[k])), 0) + depreciation;
  return { total, depreciation };
}

export interface BreakEvenInput {
  fixed: number;
  /** 부가세 제외 객단가 */
  ticket: number;
  /** 0~1 */
  costRate: number;
  feeRate: number;
  days: number;
  seats: number;
  targetProfit: number;
}
export type BreakEven =
  | { ok: false; reason: 'input' | 'margin'; variable: number }
  | {
    ok: true;
    variable: number; contribution: number;
    sales: number; monthCustomers: number; daily: number;
    turnover: number | null;
    target: { sales: number; monthCustomers: number; daily: number; turnover: number | null } | null;
  };

function customersFor(sales: number, ticket: number, days: number, seats: number) {
  const monthCustomers = ceilInt(sales / ticket);
  const daily = ceilInt(monthCustomers / days);
  return { sales, monthCustomers, daily, turnover: seats > 0 ? roundTo(daily / seats, 1) : null };
}

export function breakEven(b: BreakEvenInput): BreakEven {
  const variable = b.costRate + b.feeRate;
  if (b.fixed <= 0 || b.ticket <= 0 || b.days <= 0 || b.costRate < 0) return { ok: false, reason: 'input', variable };
  const contribution = 1 - variable;
  if (contribution <= 0) return { ok: false, reason: 'margin', variable };
  const base = customersFor(b.fixed / contribution, b.ticket, b.days, b.seats);
  const target = b.targetProfit > 0
    ? customersFor((b.fixed + b.targetProfit) / contribution, b.ticket, b.days, b.seats)
    : null;
  return { ok: true, variable, contribution, ...base, target };
}

/** 메뉴 평균 원가율 (손익분기점용): 재료·소모품 원가 ÷ 부가세 제외 판매가의 단순 평균.
 *  미용 모드의 시간 비용은 고정비(인건비)에 이미 들어 있으므로 넣지 않는다. */
export function averageCostRate(d: Data): { rate: number | null; count: number } {
  const t = num(d.taxRate) / 100;
  const rates: number[] = [];
  for (const m of d.menus) {
    const c = menuCost(m, d.biz, num(d.laborRate), false);
    const price = num(m.price);
    const net = d.priceIncludesTax ? price / (1 + t) : price;
    if (net > 0 && c.material > 0) rates.push(c.material / net);
  }
  if (!rates.length) return { rate: null, count: 0 };
  return { rate: rates.reduce((a, r) => a + r, 0) / rates.length, count: rates.length };
}

/* ── 데이터 기본값·검증 ── */
let seq = 0;
export const newId = (p: string) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const blankIngredient = (id: string): Ingredient => ({ id, name: '', price: '', qty: '', unit: 'kg', use: '', useUnit: 'g', yieldPct: '' });
export const blankMenu = (id: string, name: string, ingId: string): Menu => ({
  id, name, ingredients: [blankIngredient(ingId)], extras: [], minutes: '', price: '', costMode: 'calc', manualCost: '',
});
export const blankFixed = (): FixedCosts => ({
  rent: '', maintenance: '', staff: '', owner: '', utilities: '', interest: '', equipment: '', equipmentMonths: '60', other: '',
});

export function defaultData(locale: 'ko' | 'en', firstMenuName: string): Data {
  const ko = locale === 'ko';
  return {
    v: 1, biz: 'food', currency: ko ? 'KRW' : 'USD', taxRate: ko ? '10' : '0',
    menus: [blankMenu('m1', firstMenuName, 'i1')], activeId: 'm1',
    laborRate: '', includeLabor: false,
    // 세율이 0%면 의미가 없고, 세율을 넣는 경우(한국·영국·유럽)는 대개 메뉴판 가격에 세금이 들어 있다
    priceIncludesTax: true, targetRate: DEFAULT_TARGET.food, feeRate: '', rounding: ko ? 1 : 0,
    fixed: blankFixed(),
    ticket: '', ticketIncludesTax: false,
    costRateMode: 'auto', manualCostRate: '',
    days: '26', seats: '', targetProfit: '',
  };
}

const str = (v: unknown, max = 16): string => (typeof v === 'string' ? cleanNum(v, 3).slice(0, max) : typeof v === 'number' && Number.isFinite(v) ? cleanNum(String(v), 3).slice(0, max) : '');
const text = (v: unknown): string => (typeof v === 'string' ? v.slice(0, LIMITS.name) : '');
const unit = (v: unknown, fb: Unit): Unit => (UNITS.includes(v as Unit) ? (v as Unit) : fb);
const idOf = (v: unknown, p: string): string => (typeof v === 'string' && /^[\w-]{1,40}$/.test(v) ? v : newId(p));
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/** 저장소·백업 파일에서 읽은 값을 믿지 않고 하나씩 검사한다 */
export function sanitize(raw: unknown, fallback: Data): Data {
  const r = obj(raw);
  const menusRaw = Array.isArray(r.menus) ? r.menus.slice(0, LIMITS.menus) : [];
  const ids = new Set<string>();
  const uniq = (id: string, p: string) => { let x = id; while (ids.has(x)) x = newId(p); ids.add(x); return x; };
  const menus: Menu[] = menusRaw.map((mv) => {
    const m = obj(mv);
    const ingredients = (Array.isArray(m.ingredients) ? m.ingredients : []).slice(0, LIMITS.ingredients).map((iv) => {
      const i = obj(iv);
      return {
        id: uniq(idOf(i.id, 'i'), 'i'), name: text(i.name), price: str(i.price), qty: str(i.qty),
        unit: unit(i.unit, 'kg'), use: str(i.use), useUnit: unit(i.useUnit, 'g'), yieldPct: str(i.yieldPct, 6),
      };
    });
    const extras = (Array.isArray(m.extras) ? m.extras : []).slice(0, LIMITS.extras).map((ev) => {
      const e = obj(ev);
      return { id: uniq(idOf(e.id, 'e'), 'e'), name: text(e.name), amount: str(e.amount) };
    });
    return {
      id: uniq(idOf(m.id, 'm'), 'm'), name: text(m.name), ingredients, extras,
      minutes: str(m.minutes, 6), price: str(m.price),
      costMode: m.costMode === 'manual' ? 'manual' : 'calc', manualCost: str(m.manualCost),
    } satisfies Menu;
  });
  const f = obj(r.fixed);
  const fixed = blankFixed();
  (Object.keys(fixed) as (keyof FixedCosts)[]).forEach((k) => { if (k in f) fixed[k] = str(f[k]); });
  const list = menus.length ? menus : fallback.menus;
  const pick = <T,>(v: unknown, ok: readonly T[], fb: T): T => (ok.includes(v as T) ? (v as T) : fb);
  return {
    v: 1,
    biz: pick(r.biz, ['food', 'beauty'] as const, fallback.biz),
    currency: pick(r.currency, Object.keys(CURRENCIES) as Currency[], fallback.currency),
    taxRate: 'taxRate' in r ? str(r.taxRate, 5) : fallback.taxRate,
    menus: list,
    activeId: list.some((m) => m.id === r.activeId) ? (r.activeId as string) : list[0].id,
    laborRate: str(r.laborRate),
    includeLabor: r.includeLabor === true,
    priceIncludesTax: typeof r.priceIncludesTax === 'boolean' ? r.priceIncludesTax : fallback.priceIncludesTax,
    targetRate: 'targetRate' in r ? str(r.targetRate, 5) : fallback.targetRate,
    feeRate: str(r.feeRate, 5),
    rounding: pick(r.rounding, [0, 1, 2] as const, fallback.rounding),
    fixed,
    ticket: str(r.ticket),
    ticketIncludesTax: r.ticketIncludesTax === true,
    costRateMode: r.costRateMode === 'manual' ? 'manual' : 'auto',
    manualCostRate: str(r.manualCostRate, 5),
    days: 'days' in r ? str(r.days, 2) : fallback.days,
    seats: str(r.seats, 4),
    targetProfit: str(r.targetProfit),
  };
}

/* ── 예시 데이터 ── */
type N = [string, string]; // [한국어, 영어] 이름
interface ExIng { n: N; price: number; qty: number; unit: Unit; use: number; useUnit: Unit; y?: number }
interface ExMenu { n: N; ing: ExIng[]; extras: [N, number][]; minutes?: number; price: number }
interface ExSet {
  menus: ExMenu[]; laborRate?: number;
  fixed: Omit<Record<keyof FixedCosts, number>, 'equipmentMonths'> & { equipmentMonths: number };
  ticket: number; fee: number; days: number; seats: number; targetProfit: number;
}

const EX_KRW: Record<Biz, ExSet> = {
  food: {
    menus: [
      {
        n: ['제육볶음 정식', 'Spicy pork set'], price: 12000, extras: [[['반찬 3종', 'Side dishes'], 800]],
        ing: [
          { n: ['돼지고기 앞다리', 'Pork shoulder'], price: 120000, qty: 10, unit: 'kg', use: 200, useUnit: 'g' },
          { n: ['양파', 'Onion'], price: 25000, qty: 20, unit: 'kg', use: 50, useUnit: 'g', y: 90 },
          { n: ['고추장 양념', 'Chili sauce'], price: 18000, qty: 3, unit: 'kg', use: 40, useUnit: 'g' },
          { n: ['쌀', 'Rice'], price: 60000, qty: 20, unit: 'kg', use: 120, useUnit: 'g' },
        ],
      },
      {
        n: ['김치찌개', 'Kimchi stew'], price: 11000, extras: [[['반찬 3종', 'Side dishes'], 800]],
        ing: [
          { n: ['김치', 'Kimchi'], price: 45000, qty: 10, unit: 'kg', use: 150, useUnit: 'g' },
          { n: ['돼지고기 앞다리', 'Pork shoulder'], price: 120000, qty: 10, unit: 'kg', use: 80, useUnit: 'g' },
          { n: ['두부', 'Tofu'], price: 1500, qty: 1, unit: 'ea', use: 0.3, useUnit: 'ea' },
          { n: ['쌀', 'Rice'], price: 60000, qty: 20, unit: 'kg', use: 120, useUnit: 'g' },
        ],
      },
      {
        n: ['계란말이', 'Rolled omelette'], price: 8000, extras: [],
        ing: [
          { n: ['계란', 'Eggs'], price: 7500, qty: 30, unit: 'ea', use: 4, useUnit: 'ea' },
          { n: ['대파', 'Green onion'], price: 3000, qty: 1, unit: 'kg', use: 20, useUnit: 'g', y: 80 },
        ],
      },
    ],
    fixed: { rent: 3000000, maintenance: 300000, staff: 2500000, owner: 3000000, utilities: 600000, interest: 200000, equipment: 30000000, equipmentMonths: 60, other: 300000 },
    ticket: 11000, fee: 3, days: 26, seats: 24, targetProfit: 2000000,
  },
  beauty: {
    laborRate: 20000,
    menus: [
      {
        n: ['뿌리 염색', 'Root colour'], price: 60000, minutes: 90,
        extras: [[['호일·장갑·캡', 'Foil, gloves, cap'], 700], [['샴푸·트리트먼트', 'Shampoo & treatment'], 900]],
        ing: [
          { n: ['염모제', 'Hair colour'], price: 12000, qty: 80, unit: 'g', use: 40, useUnit: 'g' },
          { n: ['산화제', 'Developer'], price: 8000, qty: 1, unit: 'L', use: 60, useUnit: 'ml' },
        ],
      },
      {
        n: ['젤네일 원컬러', 'Gel nails, one colour'], price: 40000, minutes: 60,
        extras: [[['솜·리무버·파일', 'Pads, remover, files'], 1000]],
        ing: [
          { n: ['컬러 젤', 'Colour gel'], price: 15000, qty: 10, unit: 'ml', use: 0.5, useUnit: 'ml' },
          { n: ['베이스·탑 젤', 'Base & top gel'], price: 30000, qty: 15, unit: 'ml', use: 0.6, useUnit: 'ml' },
        ],
      },
      {
        n: ['클리닉 펌', 'Perm with treatment'], price: 70000, minutes: 120,
        extras: [[['소모품', 'Consumables'], 1500]],
        ing: [
          { n: ['펌제', 'Perm solution'], price: 25000, qty: 500, unit: 'ml', use: 120, useUnit: 'ml' },
          { n: ['클리닉 앰플', 'Treatment ampoule'], price: 3000, qty: 1, unit: 'ea', use: 2, useUnit: 'ea' },
        ],
      },
    ],
    fixed: { rent: 2000000, maintenance: 200000, staff: 2800000, owner: 3500000, utilities: 400000, interest: 0, equipment: 20000000, equipmentMonths: 60, other: 300000 },
    ticket: 55000, fee: 2, days: 25, seats: 4, targetProfit: 1500000,
  },
};

const EX_USD: Record<Biz, ExSet> = {
  food: {
    menus: [
      {
        n: ['돼지고기 덮밥', 'Pork rice bowl'], price: 9.5, extras: [[['곁들이', 'Sides'], 0.6], [['포장 용기', 'Packaging'], 0.35]],
        ing: [
          { n: ['돼지고기 앞다리', 'Pork shoulder'], price: 45, qty: 10, unit: 'kg', use: 200, useUnit: 'g' },
          { n: ['양파', 'Onion'], price: 12, qty: 10, unit: 'kg', use: 50, useUnit: 'g', y: 90 },
          { n: ['소스', 'Sauce'], price: 18, qty: 3, unit: 'L', use: 40, useUnit: 'ml' },
          { n: ['쌀', 'Rice'], price: 25, qty: 10, unit: 'kg', use: 150, useUnit: 'g' },
        ],
      },
      {
        n: ['버거 세트', 'Burger & fries'], price: 7.5, extras: [[['채소', 'Lettuce & tomato'], 0.25], [['포장 용기', 'Packaging'], 0.3]],
        ing: [
          { n: ['소고기 패티', 'Beef patty'], price: 60, qty: 10, unit: 'kg', use: 150, useUnit: 'g' },
          { n: ['번', 'Bun'], price: 4.8, qty: 12, unit: 'ea', use: 1, useUnit: 'ea' },
          { n: ['치즈', 'Cheese slice'], price: 9, qty: 24, unit: 'ea', use: 1, useUnit: 'ea' },
          { n: ['감자튀김', 'Fries'], price: 28, qty: 12, unit: 'kg', use: 150, useUnit: 'g' },
        ],
      },
      {
        n: ['아이스 라테', 'Iced latte'], price: 4.75, extras: [[['컵·뚜껑', 'Cup & lid'], 0.25]],
        ing: [
          { n: ['원두', 'Espresso beans'], price: 18, qty: 1, unit: 'kg', use: 18, useUnit: 'g' },
          { n: ['우유', 'Milk'], price: 4, qty: 4, unit: 'L', use: 200, useUnit: 'ml' },
        ],
      },
    ],
    fixed: { rent: 4500, maintenance: 300, staff: 6000, owner: 4000, utilities: 900, interest: 250, equipment: 60000, equipmentMonths: 60, other: 500 },
    ticket: 14, fee: 3, days: 26, seats: 30, targetProfit: 3000,
  },
  beauty: {
    laborRate: 25,
    menus: [
      {
        n: ['뿌리 염색', 'Root touch-up'], price: 85, minutes: 75, extras: [[['호일·장갑', 'Foil & gloves'], 0.8]],
        ing: [
          { n: ['염모제', 'Hair colour'], price: 9, qty: 60, unit: 'g', use: 45, useUnit: 'g' },
          { n: ['산화제', 'Developer'], price: 12, qty: 1, unit: 'L', use: 60, useUnit: 'ml' },
        ],
      },
      {
        n: ['젤네일', 'Gel manicure'], price: 40, minutes: 50, extras: [[['소모품', 'Pads, remover, files'], 1.2]],
        ing: [
          { n: ['컬러 젤', 'Gel colour'], price: 14, qty: 15, unit: 'ml', use: 0.5, useUnit: 'ml' },
          { n: ['베이스·탑 젤', 'Base & top coat'], price: 24, qty: 30, unit: 'ml', use: 0.8, useUnit: 'ml' },
        ],
      },
      {
        n: ['케라틴 트리트먼트', 'Keratin treatment'], price: 250, minutes: 150, extras: [[['소모품', 'Consumables'], 3]],
        ing: [{ n: ['케라틴 용액', 'Keratin solution'], price: 120, qty: 1, unit: 'L', use: 80, useUnit: 'ml' }],
      },
    ],
    fixed: { rent: 3000, maintenance: 200, staff: 5000, owner: 4000, utilities: 500, interest: 0, equipment: 25000, equipmentMonths: 60, other: 400 },
    ticket: 65, fee: 3, days: 25, seats: 5, targetProfit: 2500,
  },
};

const s = (n: number) => String(roundTo(n, 2));

/** 예시 불러오기: 메뉴·고정비·매출 구조를 바꾸고 통화·부가세 설정은 그대로 둔다 */
export function exampleData(biz: Biz, base: Data, lang: 'ko' | 'en'): Data {
  const usd = !['KRW', 'JPY'].includes(base.currency);
  const scale = base.currency === 'JPY' ? 0.1 : 1;
  const set = (usd ? EX_USD : EX_KRW)[biz];
  const li = lang === 'ko' ? 0 : 1;
  const money = (n: number) => s(scale === 1 ? n : Math.round(n * scale));
  const menus: Menu[] = set.menus.map((m) => ({
    id: newId('m'), name: m.n[li],
    ingredients: m.ing.map((i) => ({
      id: newId('i'), name: i.n[li], price: money(i.price), qty: s(i.qty), unit: i.unit,
      use: s(i.use), useUnit: i.useUnit, yieldPct: i.y ? String(i.y) : '',
    })),
    extras: m.extras.map(([n, a]) => ({ id: newId('e'), name: n[li], amount: s(roundTo(a * scale, 2)) })),
    minutes: m.minutes ? String(m.minutes) : '',
    price: money(m.price), costMode: 'calc', manualCost: '',
  }));
  const fixed = blankFixed();
  (Object.keys(fixed) as (keyof FixedCosts)[]).forEach((k) => {
    const v = set.fixed[k];
    fixed[k] = k === 'equipmentMonths' ? String(v) : v ? money(v) : '';
  });
  // 원가율·하루 손님 계산이 보이도록 부가세 기준은 그대로, 객단가는 부가세 제외로 넣는다
  return {
    ...base, biz, menus, activeId: menus[0].id,
    laborRate: set.laborRate ? money(set.laborRate) : '', includeLabor: false,
    targetRate: DEFAULT_TARGET[biz], feeRate: String(set.fee),
    fixed, ticket: money(set.ticket), ticketIncludesTax: false,
    costRateMode: 'auto', manualCostRate: '',
    days: String(set.days), seats: String(set.seats), targetProfit: money(set.targetProfit),
  };
}

/* ── 내보내기 ── */
const csvCell = (v: string | number) => {
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '';
  // 엑셀 수식으로 실행되지 않도록 =,+,-,@ 로 시작하는 글자에는 ' 를 붙인다
  const t = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};
export const toCsv = (rows: (string | number)[][]) => `﻿${rows.map((r) => r.map(csvCell).join(',')).join('\r\n')}`;

export const stamp = (d = new Date()) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
};
