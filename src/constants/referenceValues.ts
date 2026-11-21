// 매년·수시로 바뀌는 기준값 (최저시급, 보험요율 등) — 사이트 공통 형식.
// - 같은 항목(id)에 적용 시작일(effectiveFrom)이 다른 값을 여러 줄 둔다. 계산기는 날짜로 골라 쓴다.
// - 값을 바꾸거나 새해 값을 넣으면 lastChecked·nextCheck·status 도 함께 고친다.
// - 관리자 페이지(src/lib/admin/maintenance.ts)가 이 파일을 읽어 확인 기한 지남·다음 해 값 없음·미확정을 알린다.
// - 화면에 쓰지 않는 서버 전용 정보가 아니므로 클라이언트에서도 import 해도 된다 (비밀값 금지).

export type RefStatus = 'confirmed' | 'pending';

export interface RefValue {
  /** 항목 ID — 같은 항목의 연도별 값은 같은 id */
  id: string;
  /** 사람이 읽는 이름 */
  name: string;
  value: number;
  /** '원' | '%' | '원/월' 등 — %는 4.75 처럼 퍼센트 숫자 그대로 */
  unit: string;
  /** 이 값이 적용되는 날 (YYYY-MM-DD) */
  effectiveFrom: string;
  source: { name: string; url: string };
  /** 사람이 공식 출처로 직접 확인한 날 */
  lastChecked: string;
  /** 다음에 확인할 날 — 지나도 lastChecked 가 그대로면 관리자 알림 */
  nextCheck: string;
  status: RefStatus;
  /** 이 값을 쓰는 도구 (tools-registry 의 href) */
  usedBy: string[];
  note?: string;
}

const ALBA = '/utilities/finance/alba-pay-calc';
const SALARY = '/utilities/finance/salary-calc';

const MW_SRC = { name: '고용노동부 최저임금 고시', url: 'https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=19744' };
const NPS_SRC = { name: '국민연금법 (2025년 개정, 매년 0.5%p 인상)', url: 'https://www.nps.or.kr' };
const NHIS_SRC = { name: '보건복지부 건강보험정책심의위원회', url: 'https://www.nhis.or.kr' };
const LTC_SRC = { name: '보건복지부 장기요양위원회', url: 'https://www.longtermcare.or.kr' };
const EI_SRC = { name: '고용보험 및 산재보험의 보험료징수법 시행령 제12조', url: 'https://www.law.go.kr' };

export const REFERENCE_VALUES: RefValue[] = [
  // ── 최저시급 (8월 초 고시 → 다음 해 1월 1일 시행) ──
  {
    id: 'kr.minimum_wage', name: '최저시급', value: 10_320, unit: '원', effectiveFrom: '2026-01-01',
    source: MW_SRC, lastChecked: '2026-11-19', nextCheck: '2027-08-10', status: 'confirmed', usedBy: [ALBA, SALARY],
  },
  {
    id: 'kr.minimum_wage', name: '최저시급', value: 10_700, unit: '원', effectiveFrom: '2027-01-01',
    source: MW_SRC, lastChecked: '2026-11-19', nextCheck: '2027-08-10', status: 'confirmed', usedBy: [ALBA, SALARY],
    note: '2026-08-05 고시. 월 환산 2,236,300원(209시간)',
  },

  // ── 국민연금 근로자 부담 (전체의 절반) ──
  {
    id: 'kr.pension_employee', name: '국민연금 근로자 부담', value: 4.75, unit: '%', effectiveFrom: '2026-01-01',
    source: NPS_SRC, lastChecked: '2026-11-19', nextCheck: '2027-12-01', status: 'confirmed', usedBy: [ALBA, SALARY],
    note: '전체 9.5%',
  },
  {
    id: 'kr.pension_employee', name: '국민연금 근로자 부담', value: 5.0, unit: '%', effectiveFrom: '2027-01-01',
    source: NPS_SRC, lastChecked: '2026-11-19', nextCheck: '2027-12-01', status: 'confirmed', usedBy: [ALBA, SALARY],
    note: '전체 10%',
  },

  // ── 건강보험 (전체 요율, 근로자는 절반) ──
  {
    id: 'kr.health_total', name: '건강보험료율(전체)', value: 7.19, unit: '%', effectiveFrom: '2026-01-01',
    source: NHIS_SRC, lastChecked: '2026-11-19', nextCheck: '2027-12-01', status: 'confirmed', usedBy: [ALBA, SALARY],
  },
  {
    id: 'kr.health_total', name: '건강보험료율(전체)', value: 7.19, unit: '%', effectiveFrom: '2027-01-01',
    source: NHIS_SRC, lastChecked: '2026-11-19', nextCheck: '2027-12-01', status: 'confirmed', usedBy: [ALBA, SALARY],
    note: '2026-09-08 의결, 동결',
  },

  // ── 장기요양보험 (소득 대비 전체 요율) — 장기요양보험료 = 건강보험료 × (이 요율 ÷ 건강보험료율) ──
  {
    id: 'kr.ltc_total', name: '장기요양보험료율(소득 대비)', value: 0.9448, unit: '%', effectiveFrom: '2026-01-01',
    source: LTC_SRC, lastChecked: '2026-11-19', nextCheck: '2027-12-01', status: 'confirmed', usedBy: [ALBA, SALARY],
    note: '건강보험료 대비 13.14%',
  },
  {
    id: 'kr.ltc_total', name: '장기요양보험료율(소득 대비)', value: 0.9994, unit: '%', effectiveFrom: '2027-01-01',
    source: LTC_SRC, lastChecked: '2026-11-19', nextCheck: '2027-12-01', status: 'confirmed', usedBy: [ALBA, SALARY],
    note: '2026-10-30 의결. 건강보험료 대비 13.90%',
  },

  // ── 고용보험 근로자 부담 (실업급여분) ──
  {
    id: 'kr.employment_employee', name: '고용보험 근로자 부담', value: 0.9, unit: '%', effectiveFrom: '2026-01-01',
    source: EI_SRC, lastChecked: '2026-11-19', nextCheck: '2026-12-15', status: 'confirmed', usedBy: [ALBA, SALARY],
  },
  {
    id: 'kr.employment_employee', name: '고용보험 근로자 부담', value: 0.9, unit: '%', effectiveFrom: '2027-01-01',
    source: EI_SRC, lastChecked: '2026-11-19', nextCheck: '2026-12-15', status: 'pending', usedBy: [ALBA, SALARY],
    note: '정부가 2027년 1.0%(전체 1.8%→2.0%) 인상안 발표(2026-09). 시행령 개정 전이라 현행 0.9% 적용',
  },
];

/** 그날 적용되는 값 — 적용 시작일이 지난 값 중 가장 최신 */
export function refAt(id: string, date: string): RefValue | undefined {
  let best: RefValue | undefined;
  for (const r of REFERENCE_VALUES) {
    if (r.id !== id || r.effectiveFrom > date) continue;
    if (!best || r.effectiveFrom > best.effectiveFrom) best = r;
  }
  return best;
}

/** 그 해 1월 1일 기준 값 (연도를 고르는 계산기용) */
export const refForYear = (id: string, year: number) => refAt(id, `${year}-01-01`);

/** 값이 있는 연도 목록 (오름차순) */
export function refYears(id: string): number[] {
  return [...new Set(REFERENCE_VALUES.filter((r) => r.id === id).map((r) => Number(r.effectiveFrom.slice(0, 4))))].sort();
}
