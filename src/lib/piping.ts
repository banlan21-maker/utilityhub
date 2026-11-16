/**
 * 배관 규격·구배·수압 물량·유속.
 *
 * 규격표 (외경·두께 mm)
 * - SPP  KS D 3507 (= JIS G 3452) 일반배관용 탄소강관
 * - SPPS KS D 3562 (= JIS G 3454) 압력배관용 탄소강관 Sch40·80
 * - STS  KS D 3576 (= JIS G 3459) 배관용 스테인리스강관 Sch5S·10S·20S·40·80
 * - Su   KS D 3595 (= JIS G 3448) 일반배관용 스테인리스강관(얇은 관)
 * - ASME B36.10 탄소강관 (외경이 KS와 다름: 15A = 21.3mm)
 * 중량 kg/m = π × (외경 − 두께) × 두께 × 밀도 ÷ 1000
 *
 * 배수 수평관 최소 구배(기계설비 기술기준 매뉴얼): 65A 이하 1/50, 80~150A 1/100, 200A 이상 1/200
 */

export type Family = 'spp' | 'spps' | 'sts' | 'su' | 'asme' | 'copper' | 'pvc';

export interface FamilyDef {
  id: Family;
  density: number;
  schedules: string[];
  sizes: string[];
  od: Record<string, number>;
  /** 스케줄 → 호칭 → 두께. 스케줄이 하나뿐이면 '-' */
  t: Record<string, Record<string, number>>;
  inch?: Record<string, string>;
  /** Hazen-Williams 조도 계수 C (새 관 기준) */
  hwC: number;
}

const A = ['10A', '15A', '20A', '25A', '32A', '40A', '50A', '65A', '80A', '90A', '100A', '125A', '150A', '200A', '250A', '300A'];
const KS_OD = [17.3, 21.7, 27.2, 34.0, 42.7, 48.6, 60.5, 76.3, 89.1, 101.6, 114.3, 139.8, 165.2, 216.3, 267.4, 318.5];
const zip = (keys: string[], vals: (number | null)[]) =>
  Object.fromEntries(keys.map((k, i) => [k, vals[i]]).filter(([, x]) => x !== null)) as Record<string, number>;

const SCH40 = [2.3, 2.8, 2.9, 3.4, 3.6, 3.7, 3.9, 5.2, 5.5, 5.7, 6.0, 6.6, 7.1, 8.2, 9.3, 10.3];
const SCH80 = [3.2, 3.7, 3.9, 4.5, 4.9, 5.1, 5.5, 7.0, 7.6, 8.1, 8.6, 9.5, 11.0, 12.7, 15.1, 17.4];

export const INCH: Record<string, string> = {
  '10A': '3/8"', '15A': '1/2"', '20A': '3/4"', '25A': '1"', '32A': '1-1/4"', '40A': '1-1/2"', '50A': '2"', '65A': '2-1/2"',
  '80A': '3"', '90A': '3-1/2"', '100A': '4"', '125A': '5"', '150A': '6"', '200A': '8"', '250A': '10"', '300A': '12"',
};

const ASME_SIZES = ['15A', '20A', '25A', '32A', '40A', '50A', '65A', '80A', '100A', '125A', '150A', '200A', '250A', '300A'];
const ASME40 = [2.77, 2.87, 3.38, 3.56, 3.68, 3.91, 5.16, 5.49, 6.02, 6.55, 7.11, 8.18, 9.27, 10.31];
const ASME80 = [3.73, 3.91, 4.55, 4.85, 5.08, 5.54, 7.01, 7.62, 8.56, 9.53, 10.97, 12.70, 15.09, 17.48];

const SU_SIZES = ['8Su', '10Su', '13Su', '20Su', '25Su', '30Su', '40Su', '50Su', '60Su', '75Su', '80Su', '100Su', '125Su', '150Su', '200Su', '250Su', '300Su'];

/**
 * 동관 ASTM B88 (미국 급수·급탕 표준). 외경 = 호칭 + 1/8인치, 두께는 Type K(두꺼움)·L(일반)·M(얇음).
 * 값은 인치 → mm 환산 (Copper Development Association 표).
 */
const CU_SIZES = ['CU1/4', 'CU3/8', 'CU1/2', 'CU3/4', 'CU1', 'CU1-1/4', 'CU1-1/2', 'CU2', 'CU2-1/2', 'CU3', 'CU4', 'CU5', 'CU6', 'CU8'];
const CU_INCH = ['1/4"', '3/8"', '1/2"', '3/4"', '1"', '1-1/4"', '1-1/2"', '2"', '2-1/2"', '3"', '4"', '5"', '6"', '8"'];
const CU_OD_IN = [0.375, 0.5, 0.625, 0.875, 1.125, 1.375, 1.625, 2.125, 2.625, 3.125, 4.125, 5.125, 6.125, 8.125];
const CU_K_IN = [0.035, 0.049, 0.049, 0.065, 0.065, 0.065, 0.072, 0.083, 0.095, 0.109, 0.134, 0.16, 0.192, 0.271];
const CU_L_IN = [0.03, 0.035, 0.04, 0.045, 0.05, 0.055, 0.06, 0.07, 0.08, 0.09, 0.11, 0.125, 0.14, 0.2];
const CU_M_IN: (number | null)[] = [null, 0.025, 0.028, 0.032, 0.035, 0.042, 0.049, 0.058, 0.065, 0.072, 0.095, 0.109, 0.122, 0.17];
const mmOf = (a: (number | null)[]) => a.map(x => (x == null ? null : Math.round(x * 25.4 * 1000) / 1000));

export const FAMILIES: Record<Family, FamilyDef> = {
  spp: {
    id: 'spp', density: 7.85, schedules: ['-'], sizes: A, od: zip(A, KS_OD), hwC: 120,
    t: { '-': zip(A, [2.3, 2.8, 2.8, 3.2, 3.5, 3.5, 3.8, 4.2, 4.2, 4.2, 4.5, 4.5, 5.0, 5.8, 6.6, 6.9]) },
  },
  spps: {
    id: 'spps', density: 7.85, schedules: ['Sch40', 'Sch80'], sizes: A, od: zip(A, KS_OD), hwC: 120,
    t: { Sch40: zip(A, SCH40), Sch80: zip(A, SCH80) },
  },
  sts: {
    id: 'sts', density: 7.93, schedules: ['Sch5S', 'Sch10S', 'Sch20S', 'Sch40', 'Sch80'], sizes: A.slice(1), od: zip(A, KS_OD), hwC: 140,
    t: {
      Sch5S: zip(A, [null, 1.65, 1.65, 1.65, 1.65, 1.65, 1.65, 2.1, 2.1, 2.1, 2.1, 2.8, 2.8, 2.8, 3.4, 4.0]),
      Sch10S: zip(A, [null, 2.1, 2.1, 2.8, 2.8, 2.8, 2.8, 3.0, 3.0, 3.0, 3.0, 3.4, 3.4, 4.0, 4.0, 4.5]),
      Sch20S: zip(A, [null, 2.5, 2.5, 3.0, 3.0, 3.0, 3.5, 3.5, 4.0, 4.0, 4.0, 5.0, 5.0, 6.5, 6.5, 6.5]),
      Sch40: zip(A, [null, ...SCH40.slice(1)]),
      Sch80: zip(A, [null, ...SCH80.slice(1)]),
    },
  },
  su: {
    id: 'su', density: 7.93, schedules: ['-'], sizes: SU_SIZES, hwC: 140,
    od: zip(SU_SIZES, [9.52, 12.70, 15.88, 22.22, 28.58, 34.0, 42.7, 48.6, 60.5, 76.3, 89.1, 114.3, 139.8, 165.2, 216.3, 267.4, 318.5]),
    t: { '-': zip(SU_SIZES, [0.7, 0.8, 0.8, 1.0, 1.0, 1.2, 1.2, 1.2, 1.5, 1.5, 2.0, 2.0, 2.0, 3.0, 3.0, 3.0, 3.0]) },
  },
  asme: {
    id: 'asme', density: 7.85, schedules: ['Sch10', 'STD', 'Sch40', 'XS', 'Sch80'], sizes: ASME_SIZES, hwC: 120,
    od: zip(ASME_SIZES, [21.3, 26.7, 33.4, 42.2, 48.3, 60.3, 73.0, 88.9, 114.3, 141.3, 168.3, 219.1, 273.0, 323.9]),
    t: {
      // Sch10은 6"까지만 (8" 이상은 넣지 않음)
      Sch10: zip(ASME_SIZES, [2.11, 2.11, 2.77, 2.77, 2.77, 2.77, 3.05, 3.05, 3.05, 3.40, 3.40, null, null, null]),
      Sch40: zip(ASME_SIZES, ASME40),
      // STD = Sch40, 12"부터 9.53
      STD: zip(ASME_SIZES, [...ASME40.slice(0, 13), 9.53]),
      Sch80: zip(ASME_SIZES, ASME80),
      // XS = Sch80, 10"·12"는 12.70
      XS: zip(ASME_SIZES, [...ASME80.slice(0, 12), 12.70, 12.70]),
    },
    inch: INCH,
  },
  copper: {
    id: 'copper', density: 8.94, schedules: ['K', 'L', 'M'], sizes: CU_SIZES, hwC: 150,
    od: zip(CU_SIZES, mmOf(CU_OD_IN)),
    t: { K: zip(CU_SIZES, mmOf(CU_K_IN)), L: zip(CU_SIZES, mmOf(CU_L_IN)), M: zip(CU_SIZES, mmOf(CU_M_IN)) },
    inch: Object.fromEntries(CU_SIZES.map((k, i) => [k, CU_INCH[i]])),
  },
  // PVC 압력관 ASTM D1785: 외경과 Sch40·80 두께가 강관(ASME B36.10)과 같다. 밀도 1.40
  pvc: {
    id: 'pvc', density: 1.40, schedules: ['Sch40', 'Sch80'], sizes: ASME_SIZES, hwC: 150,
    od: zip(ASME_SIZES, [21.3, 26.7, 33.4, 42.2, 48.3, 60.3, 73.0, 88.9, 114.3, 141.3, 168.3, 219.1, 273.0, 323.9]),
    t: { Sch40: zip(ASME_SIZES, ASME40), Sch80: zip(ASME_SIZES, ASME80) },
    inch: INCH,
  },
};

/**
 * ASME B36.10 / ASTM D1785 원래 인치 치수 (미국 단위 표시용 — mm를 다시 나누면 2.374"처럼 끝자리가 틀어진다)
 */
const ASME_OD_IN = [0.84, 1.05, 1.315, 1.66, 1.9, 2.375, 2.875, 3.5, 4.5, 5.563, 6.625, 8.625, 10.75, 12.75];
const ASME_T_IN: Record<string, (number | null)[]> = {
  Sch10: [0.083, 0.083, 0.109, 0.109, 0.109, 0.109, 0.12, 0.12, 0.12, 0.134, 0.134, null, null, null],
  STD: [0.109, 0.113, 0.133, 0.14, 0.145, 0.154, 0.203, 0.216, 0.237, 0.258, 0.28, 0.322, 0.365, 0.375],
  Sch40: [0.109, 0.113, 0.133, 0.14, 0.145, 0.154, 0.203, 0.216, 0.237, 0.258, 0.28, 0.322, 0.365, 0.406],
  XS: [0.147, 0.154, 0.179, 0.191, 0.2, 0.218, 0.276, 0.3, 0.337, 0.375, 0.432, 0.5, 0.5, 0.5],
  Sch80: [0.147, 0.154, 0.179, 0.191, 0.2, 0.218, 0.276, 0.3, 0.337, 0.375, 0.432, 0.5, 0.594, 0.688],
};
/** 미국 단위로 보여 줄 외경·두께(inch). 인치 원표가 있으면 그 값, 없으면 mm ÷ 25.4 */
export function inchDims(family: Family, size: string, sch: string): { od: number; t: number; id: number } | null {
  const sp = pipeSpec(family, size, sch);
  if (!sp) return null;
  if (family === 'asme' || family === 'pvc') {
    const i = ASME_SIZES.indexOf(size), t = ASME_T_IN[sch]?.[i];
    if (i >= 0 && t != null) return { od: ASME_OD_IN[i], t, id: ASME_OD_IN[i] - 2 * t };
  }
  return { od: sp.od / 25.4, t: sp.t / 25.4, id: sp.id / 25.4 };
}

/** 국제 표기 DN (KS 호칭 A와 같은 숫자) */
export const dnOf = (size: string) => (/^\d+A$/.test(size) ? `DN${parseInt(size, 10)}` : null);

export interface PipeSpec {
  family: Family; size: string; sch: string;
  od: number; t: number; id: number;
  /** 유로 단면적 ㎟ */
  flowArea: number;
  kgPerM: number;
  /** 1m당 물 L */
  litersPerM: number;
}

export function pipeSpec(family: Family, size: string, sch: string): PipeSpec | null {
  const f = FAMILIES[family];
  const od = f.od[size];
  const t = f.t[sch]?.[size];
  if (!od || !t) return null;
  const id = od - 2 * t;
  const flowArea = (Math.PI * id * id) / 4;
  return { family, size, sch, od, t, id, flowArea, kgPerM: (Math.PI * (od - t) * t * f.density) / 1000, litersPerM: flowArea / 1000 };
}

/** 그 규격에 해당 스케줄이 있는지 */
export const hasSize = (family: Family, size: string, sch: string) => FAMILIES[family].t[sch]?.[size] != null;

// ───── 구배 ─────

/** 호칭(A) 숫자 */
export const nominalMm = (size: string) => parseInt(size, 10);

/** 배수 수평관 최소 구배 분모 (1/N) */
export function minDrainSlope(size: string): number {
  const a = nominalMm(size);
  if (a <= 65) return 50;
  if (a <= 150) return 100;
  return 200;
}

export const DRAIN_SIZES = ['32A', '40A', '50A', '65A', '80A', '100A', '125A', '150A', '200A', '250A', '300A'];

/**
 * 미국 IPC Table 704.1 배수 수평관 최소 구배: 2-1/2" 이하 1/4 in/ft(1/48), 3~6" 1/8 in/ft(1/96), 8" 이상 1/16 in/ft(1/192)
 */
export const IPC_DRAIN_SIZES = ['1-1/4"', '1-1/2"', '2"', '2-1/2"', '3"', '4"', '5"', '6"', '8"', '10"', '12"'];
export function ipcMinSlope(size: string): number {
  const inch = size.replace('"', '').split('-').reduce((s, p) => s + (p.includes('/') ? Number(p.split('/')[0]) / Number(p.split('/')[1]) : Number(p)), 0);
  if (inch <= 2.5) return 48;
  if (inch <= 6) return 96;
  return 192;
}
/** 구배 1/N → 인치/피트 (1/48 → 0.25) */
export const inPerFt = (denom: number) => 12 / denom;

/** 길이(m) × 구배(1/N) → 단차(mm) */
export const dropMm = (lengthM: number, denom: number) => (lengthM * 1000) / denom;
/** 길이(m)·단차(mm) → 구배 분모 N (1/N) */
export const slopeDenom = (lengthM: number, drop: number) => (lengthM * 1000) / drop;

// ───── 수압 물량 ─────

export interface HydroLine { family: Family; size: string; sch: string; lengthM: number }

export function hydroVolume(lines: HydroLine[], marginPct: number) {
  const rows = lines.map(l => {
    const sp = pipeSpec(l.family, l.size, l.sch);
    return { ...l, spec: sp, liters: sp && l.lengthM > 0 ? sp.litersPerM * l.lengthM : 0 };
  });
  const netL = rows.reduce((sum, r) => sum + r.liters, 0);
  const totalL = netL * (1 + Math.max(0, marginPct) / 100);
  return { rows, netL, totalL, tons: totalL / 1000 };
}

export function truckPlan(tons: number): { size: number; count: number }[] {
  if (tons <= 0) return [];
  if (tons <= 2.5) return [{ size: 2.5, count: 1 }];
  if (tons <= 5) return [{ size: 5, count: 1 }];
  if (tons <= 8) return [{ size: 5, count: 1 }, { size: 3, count: 1 }];
  if (tons <= 10) return [{ size: 10, count: 1 }];
  if (tons <= 15) return [{ size: 10, count: 1 }, { size: 5, count: 1 }];
  return [{ size: 10, count: Math.ceil(tons / 10) }];
}

// ───── 유량·유속 ─────

/** 유량(L/min)·관 → 유속(m/s) */
export const velocity = (lpm: number, sp: PipeSpec) => (lpm / 60000) / (sp.flowArea / 1e6);

/**
 * Hazen-Williams 마찰 손실 (상온 물): 1m당 손실 수두(m) = 10.67 × Q^1.852 ÷ (C^1.852 × d^4.8704)
 * Q ㎥/s, d 내경 m. 반환: 100m당 손실 kPa
 */
export function frictionKPaPer100m(lpm: number, sp: PipeSpec, C: number) {
  const Q = lpm / 60000, d = sp.id / 1000;
  if (!(Q > 0 && d > 0 && C > 0)) return 0;
  const hfPerM = (10.67 * Math.pow(Q, 1.852)) / (Math.pow(C, 1.852) * Math.pow(d, 4.8704));
  return hfPerM * 100 * 9.80665; // m 수두 → kPa (물 1m = 9.807 kPa)
}

// ───── 단위 환산 ─────
export const UNIT = {
  mmPerIn: 25.4,
  lbftPerKgm: 0.671969,
  galPerL: 1 / 3.785412,
  gpmPerLpm: 1 / 3.785412,
  ftsPerMs: 3.28084,
  ftPerM: 3.28084,
  /** kPa/100m → psi/100ft */
  psi100ftPerKPa100m: 0.145038 * 0.3048,
};

/** 유속이 vmax 이하가 되는 가장 작은 관 */
export function smallestPipeFor(lpm: number, vmax: number, family: Family, sch: string): PipeSpec | null {
  for (const size of FAMILIES[family].sizes) {
    const sp = pipeSpec(family, size, sch);
    if (sp && velocity(lpm, sp) <= vmax) return sp;
  }
  return null;
}
