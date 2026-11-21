// 갱신 알림 — 데이터 기준일(asOf)과 연간 일정표로 "지금 고쳐야 할 것"을 계산한다.
// 새 정기 갱신 항목이 생기면 CALENDAR 에 한 줄 추가한다.
import 'server-only';
import { CITY_GAS, ELECTRICITY, KEROSENE, SMP, SOLAR_MARKET } from '@/constants/energyPrices';
import { WAGE_DATA } from '@/constants/wageConfig';
import { REFERENCE_VALUES } from '@/constants/referenceValues';

export type AlertLevel = 'danger' | 'warn' | 'info' | 'ok';
export interface AdminAlert {
  id: string;
  level: AlertLevel;
  title: string;
  detail: string;
  where?: string;   // 고칠 파일·도구
  source?: string;  // 확인할 공식 출처
  href?: string;    // 관리자 화면 안 바로 가기
}

const KST = () => new Date(Date.now() + 9 * 3600_000);
const daysSince = (iso: string) => {
  // 'YYYY-MM' 은 그 달 1일로 본다
  const d = new Date(iso.length === 7 ? `${iso}-01` : iso);
  return Math.floor((KST().getTime() - d.getTime()) / 86400_000);
};
const monthsSince = (ym: string) => {
  const now = KST();
  const [y, m] = ym.split('-').map(Number);
  return (now.getUTCFullYear() - y) * 12 + (now.getUTCMonth() + 1 - m);
};

/**
 * 단가 데이터 신선도. 요금표는 안 바뀌면 기준일도 그대로이므로,
 * 자동 갱신 항목은 '작업이 최근에 성공했는지'로 보고, 월별 통계(SMP)는 기준 월로 본다.
 */
function freshness(wf: WorkflowStatus[]): AdminAlert[] {
  const out: AdminAlert[] = [];
  const lastOk = (file: string) => wf.find((w) => w.path.endsWith(file))?.lastSuccess ?? null;
  const prices = lastOk('update-prices.yml');
  const kero = lastOk('update-kerosene.yml');
  const checked = (at: string | null) => (at ? ` · 마지막 확인 ${at.slice(0, 10)}` : ' · 최근 자동 확인 기록 없음');
  const stale = (id: string, ok: boolean, title: string, detail: string, where: string, source?: string) =>
    out.push({ id, level: ok ? 'ok' : 'warn', title, detail, where, source });

  stale('elec', monthsSince(ELECTRICITY.asOf) <= 3, '전기요금 단가',
    `기준 ${ELECTRICITY.asOf} · 분기마다 자동 갱신(3·6·9·12월 발표 → 다음 달 반영)`,
    'src/constants/energyPrices.ts · 자동(update-prices)', 'https://cyber.kepco.co.kr');
  stale('gas', !!prices && daysSince(prices) <= 35, '도시가스 단가',
    `요금 기준 ${CITY_GAS.asOf} · 매월 2일 자동 확인${checked(prices)}`, 'src/constants/energyPrices.ts · 자동(update-prices)');
  stale('smp', monthsSince(SMP.asOf) <= 2, 'SMP(계통한계가격)',
    `기준 ${SMP.asOf} 월평균 ${SMP.latest}원/kWh · 매월 자동 갱신`, 'src/constants/energyPrices.ts · 자동(update-prices)', 'https://epsis.kpx.or.kr');
  stale('kerosene', (!!kero && daysSince(kero) <= 10) || daysSince(KEROSENE.asOf) <= 14, '실내등유 가격',
    `기준 ${KEROSENE.asOf} · 매주 월요일 자동 갱신(오피넷)${checked(kero)}`, 'src/constants/energyPrices.ts · 자동(update-kerosene)');
  stale('rec', monthsSince(SOLAR_MARKET.asOf) <= 3, 'REC 현물가(수동)',
    `기준 ${SOLAR_MARKET.asOf} ${SOLAR_MARKET.recPerREC.toLocaleString()}원/REC · 자동 갱신 없음, 분기마다 직접 확인`,
    'src/constants/energyPrices.ts SOLAR_MARKET · 태양광 계산기', 'https://onerec.kmos.kr');
  return out;
}

interface CalItem {
  id: string;
  title: string;
  detail: string;
  where: string;
  source?: string;
  /** [시작 월, 일] ~ [끝 월, 일] 사이(매년)에 알림. 끝이 시작보다 앞이면 해를 넘김 */
  window: [[number, number], [number, number]];
  /** 이미 반영했으면 true (예: 다음 해 데이터가 이미 있음) */
  done?: (year: number) => boolean;
  level?: AlertLevel;
}

const hasWageYear = (y: number) => Object.prototype.hasOwnProperty.call(WAGE_DATA, `Y${y}`);

const CALENDAR: CalItem[] = [
  {
    id: 'min-wage', title: '최저임금 다음 해 값 추가',
    detail: '8월 5일 전후 고시 → 1월 1일 시행. referenceValues.ts 에 다음 해 시급을 넣으면 알바·연봉 계산기가 함께 따라옴',
    where: 'src/constants/referenceValues.ts (알바·연봉 계산기 공통)', source: 'https://www.minimumwage.go.kr',
    window: [[8, 10], [12, 31]], done: (y) => hasWageYear(y + 1), level: 'warn',
  },
  {
    id: 'insurance', title: '4대보험 요율 (건강·장기요양·국민연금)',
    detail: '건강보험·장기요양 요율은 보통 8~11월 결정, 국민연금은 연금개혁으로 매년 0.5%p 인상(2027년 근로자 5.0%). 1월 1일 시행분 반영',
    where: 'src/constants/referenceValues.ts (알바·연봉 계산기 공통)', source: 'https://www.nhis.or.kr',
    window: [[11, 15], [1, 15]], level: 'warn',
  },
  {
    id: 'pension-base', title: '국민연금 기준소득월액 상·하한',
    detail: '매년 7월 1일 변경(그해 3월 전후 고시). 상한·하한 값 갱신', where: 'src/constants/wageConfig.ts PENSION_BASE', source: 'https://www.nps.or.kr',
    window: [[6, 15], [7, 10]],
  },
  {
    id: 'tax-table', title: '근로소득 간이세액표 개정 확인',
    detail: '세법 개정 시 2~3월에 새 간이세액표 공포. 바뀌면 PDF에서 다시 변환', where: 'src/constants/incomeTaxTable*.ts · 연봉 계산기', source: 'https://www.nts.go.kr',
    window: [[2, 1], [3, 31]],
  },
  {
    id: 'income-tax', title: '종합소득세율·공제 개정 확인 (3.3% 계산기)',
    detail: '연초 세법 개정 반영 여부 확인 — 과세표준 구간, 기본공제, 5월 신고 안내 문구', where: 'src/lib/freelanceTax.ts · tax-33-calc',
    window: [[1, 2], [2, 15]],
  },
  {
    id: 'us-payroll', title: '미국 FICA 과세 상한·연방 최저임금 확인',
    detail: 'SSA가 10월에 다음 해 Social Security wage base 발표. 연방 최저임금($7.25) 변경 여부', where: 'src/constants/wageConfig.ts US', source: 'https://www.ssa.gov/oact/cola/cbb.html',
    window: [[10, 15], [1, 15]],
  },
  {
    id: 'solar-contract', title: '태양광 고정가격계약 경쟁입찰 결과',
    detail: '상·하반기 공고 후 결과 발표(하반기는 11~12월). 평균 낙찰가·상한가 갱신', where: 'src/constants/energyPrices.ts SOLAR_MARKET.contract* · 태양광 계산기', source: 'https://www.knrec.or.kr',
    window: [[11, 1], [12, 31]],
  },
  {
    id: 'nec', title: '미국 NEC 개정판 확인',
    detail: 'NEC는 3년마다 개정(2026판 이후 2029판). 표 번호·허용전류가 바뀌었는지 확인', where: 'src/lib/wireSize.ts · 전선 굵기 계산기',
    window: [[9, 1], [9, 30]],
  },
];

function inWindow(now: Date, [[sm, sd], [em, ed]]: CalItem['window']) {
  const v = (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
  const s = sm * 100 + sd;
  const e = em * 100 + ed;
  return s <= e ? v >= s && v <= e : v >= s || v <= e;
}

function calendar(): AdminAlert[] {
  const now = KST();
  const year = now.getUTCFullYear();
  const out: AdminAlert[] = [];
  for (const c of CALENDAR) {
    if (!inWindow(now, c.window)) continue;
    if (c.done?.(year)) continue;
    out.push({ id: c.id, level: c.level ?? 'info', title: c.title, detail: c.detail, where: c.where, source: c.source });
  }
  // 이번 해 최저임금 데이터가 아예 없으면 계산기가 틀린 값을 보여 주는 중
  if (!hasWageYear(year)) {
    out.unshift({ id: 'min-wage-missing', level: 'danger', title: `${year}년 최저임금 데이터 없음`, detail: '시급·연봉 계산기가 지난해 값으로 계산 중', where: 'src/constants/referenceValues.ts' });
  }
  return out;
}

/**
 * 기준값 파일(src/constants/referenceValues.ts) 점검
 * - 다음 확인 예정일이 지났는데 마지막 확인일이 그대로인 항목
 * - 12월인데 다음 해 값이 없는 항목
 * - 미확정(pending) 값
 */
function referenceValueAlerts(): AdminAlert[] {
  const now = KST();
  const today = now.toISOString().slice(0, 10);
  const year = now.getUTCFullYear();
  const out: AdminAlert[] = [];
  const where = 'src/constants/referenceValues.ts';
  const ids = [...new Set(REFERENCE_VALUES.map((r) => r.id))];
  for (const id of ids) {
    const rows = REFERENCE_VALUES.filter((r) => r.id === id).sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
    const latest = rows[rows.length - 1];
    const name = latest.name;
    const tools = latest.usedBy.join(', ');
    const overdue = rows.filter((r) => r.nextCheck <= today && r.lastChecked < r.nextCheck);
    if (overdue.length) {
      const r = overdue[overdue.length - 1];
      out.push({ id: `ref-due-${id}`, level: 'warn', title: `기준값 확인 기한 지남: ${name}`,
        detail: `확인 예정일 ${r.nextCheck} · 마지막 확인 ${r.lastChecked}. 공식 출처로 확인 후 lastChecked·nextCheck를 고치세요 (${tools})`,
        where, source: r.source.url });
    }
    if (now.getUTCMonth() === 11 && !rows.some((r) => r.effectiveFrom.startsWith(String(year + 1)))) {
      out.push({ id: `ref-next-${id}`, level: 'warn', title: `${year + 1}년 기준값 없음: ${name}`,
        detail: `1월 1일부터 쓸 ${year + 1}년 값이 아직 없습니다 (${tools})`, where, source: latest.source.url });
    }
    for (const r of rows.filter((x) => x.status === 'pending' && x.effectiveFrom.slice(0, 4) >= String(year))) {
      out.push({ id: `ref-pending-${id}-${r.effectiveFrom}`, level: 'info', title: `미확정 기준값: ${name} (${r.effectiveFrom.slice(0, 4)})`,
        detail: `${r.value}${r.unit} 임시 적용${r.note ? ` · ${r.note}` : ''}`, where, source: r.source.url });
    }
  }
  return out;
}

/** 한 번만 챙길 일정 (지나면 자동으로 사라짐) */
const ONE_OFF: { id: string; from: string; to: string; title: string; detail: string; level?: AlertLevel }[] = [
  {
    id: 'ctr-1116', from: '2026-12-01', to: '2026-12-31',
    title: '11/16 SEO 수정 효과 측정',
    detail: '평수·전선·배관·CWV 제목 변경 후 4주 — 검색 성과 탭에서 해당 페이지 CTR을 수정 전과 비교',
  },
];

function oneOff(): AdminAlert[] {
  const today = KST().toISOString().slice(0, 10);
  return ONE_OFF.filter((o) => today >= o.from && today <= o.to).map((o) => ({ id: o.id, level: o.level ?? 'info', title: o.title, detail: o.detail }));
}

/** 연간 일정 전체 (갱신 알림 화면의 달력용) */
export function calendarOverview() {
  const now = KST();
  const year = now.getUTCFullYear();
  const md = ([m, d]: [number, number]) => `${m}/${d}`;
  return CALENDAR.map((c) => ({
    id: c.id,
    title: c.title,
    where: c.where,
    source: c.source,
    period: `${md(c.window[0])} ~ ${md(c.window[1])}`,
    state: c.done?.(year) ? 'done' : inWindow(now, c.window) ? 'active' : 'idle',
  }));
}

export interface WorkflowStatus { name: string; path: string; conclusion: string | null; status: string; at: string; url: string; lastSuccess: string | null }

/** 공개 저장소의 자동 갱신 작업(GitHub Actions) 최근 결과 */
export async function workflowStatus(): Promise<WorkflowStatus[]> {
  try {
    const res = await fetch('https://api.github.com/repos/banlan21-maker/utilityhub/actions/runs?per_page=40', {
      headers: { accept: 'application/vnd.github+json', 'user-agent': 'utilhub-admin' },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const j = await res.json();
    // 이름이 바뀐 작업도 하나로 보이게 워크플로 파일 기준으로 묶는다 (최신 실행 + 마지막 성공 시각)
    const latest = new Map<string, WorkflowStatus>();
    for (const r of j.workflow_runs ?? []) {
      const key: string = r.path ?? r.name;
      const cur = latest.get(key);
      if (!cur) latest.set(key, { name: r.name, path: key, conclusion: r.conclusion, status: r.status, at: r.created_at, url: r.html_url, lastSuccess: r.conclusion === 'success' ? r.created_at : null });
      else if (!cur.lastSuccess && r.conclusion === 'success') cur.lastSuccess = r.created_at;
    }
    return [...latest.values()];
  } catch {
    return [];
  }
}

export async function buildAlerts(extra: AdminAlert[] = []): Promise<{ alerts: AdminAlert[]; fresh: AdminAlert[]; workflows: WorkflowStatus[] }> {
  const workflows = await workflowStatus();
  const wfAlerts: AdminAlert[] = workflows
    .filter((w) => w.conclusion === 'failure')
    .map((w) => ({ id: `wf-${w.name}`, level: 'danger', title: `자동 갱신 실패: ${w.name}`, detail: `${w.at.slice(0, 10)} 실행 실패 — GitHub Actions 로그 확인`, source: w.url }));
  const fresh = freshness(workflows);
  const order: Record<AlertLevel, number> = { danger: 0, warn: 1, info: 2, ok: 3 };
  const alerts = [...wfAlerts, ...extra, ...fresh.filter((f) => f.level !== 'ok'), ...calendar(), ...referenceValueAlerts(), ...oneOff()]
    .sort((a, b) => order[a.level] - order[b.level]);
  return { alerts, fresh, workflows };
}
