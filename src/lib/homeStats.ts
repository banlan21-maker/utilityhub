// 첫 화면에 보여 줄 '살아 있는' 숫자들 — 서버에서 계산해 10분마다 갱신(ISR)
import 'server-only';
import { unstable_cache } from 'next/cache';
import { adminDb } from '@/lib/admin/db';
import { tools } from '@/lib/tools-registry';
import { CHANGELOG, type ChangeType } from '@/lib/changelog';
import { ELECTRICITY, KEROSENE, SMP } from '@/constants/energyPrices';

export interface HomeSettings {
  /** 오늘 방문자가 이 수 이상이면 "오늘 방문" 표시 */
  todayMin: number;
  /** 집계 시작 후 누적 방문자가 이 수 이상이면 "누적 방문" 표시 */
  totalMin: number;
  /** 집계 시작일 (표시용) */
  since: string;
}
export const DEFAULT_HOME_SETTINGS: HomeSettings = { todayMin: 50, totalMin: 5000, since: '2026-11-16' };

/** 자동 갱신되는 단가 종류 (전기요금·도시가스·SMP·등유) */
export const AUTO_DATA_COUNT = 4;

export const HOME_TAG = 'home-stats';

export async function readHomeSettings(): Promise<HomeSettings> {
  const db = adminDb();
  if (!db) return DEFAULT_HOME_SETTINGS;
  const { data, error } = await db.from('site_settings').select('value').eq('key', 'home').maybeSingle();
  if (error || !data) return DEFAULT_HOME_SETTINGS;
  return { ...DEFAULT_HOME_SETTINGS, ...(data.value as Partial<HomeSettings>) };
}

export interface PopularTool { href: string; ko: string; en: string; emoji: string }
export interface HomeVisitStats {
  today: number;
  total: number;
  popular: PopularTool[];
  settings: HomeSettings;
}

const kstToday = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

async function compute(): Promise<HomeVisitStats> {
  const settings = await readHomeSettings();
  const empty = { today: 0, total: 0, popular: [], settings };
  const db = adminDb();
  if (!db) return empty;

  const [daily, top] = await Promise.all([
    db.rpc('admin_daily', { days: 3650 }),
    db.rpc('admin_top', { days: 7, dim: 'path', lim: 200 }),
  ]);
  if (daily.error) return empty;
  const rows = (daily.data ?? []) as { day: string; visitors: number }[];
  const today = Number(rows.find((r) => String(r.day) === kstToday())?.visitors ?? 0);
  const total = rows.reduce((a, r) => a + Number(r.visitors), 0);

  // 한국어·영어 페이지를 합쳐 도구별 방문자 순위
  const byHref = new Map(tools.filter((t) => t.available).map((t) => [t.href, t]));
  const score = new Map<string, number>();
  for (const r of (top.data ?? []) as { key: string; visitors: number }[]) {
    const href = r.key.replace(/^\/(ko|en)/, '');
    if (byHref.has(href)) score.set(href, (score.get(href) ?? 0) + Number(r.visitors));
  }
  const ranked = [...score.entries()].filter(([, v]) => v >= 2).sort((a, b) => b[1] - a[1]).slice(0, 5);
  // 순위가 의미 있으려면 최소 3개 도구에 기록이 있어야 한다
  const popular = ranked.length >= 3
    ? ranked.map(([href]) => { const t = byHref.get(href)!; return { href, ko: t.nameKo ?? t.slug, en: t.nameEn ?? t.nameKo ?? t.slug, emoji: t.emoji }; })
    : [];
  return { today, total, popular, settings };
}

export const getHomeVisitStats = unstable_cache(
  async () => {
    try { return await compute(); } catch { return { today: 0, total: 0, popular: [], settings: DEFAULT_HOME_SETTINGS }; }
  },
  ['home-visit-stats-v1'],
  { revalidate: 600, tags: [HOME_TAG] },
);

// ── 전광판 ──
export interface TickerItem { icon: string; text: string; href: string; date: string }

const ICON: Record<ChangeType, string> = { new: '🆕', update: '✨', fix: '🔧' };
const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;

export function tickerItems(locale: string, max = 10): TickerItem[] {
  const ko = locale === 'ko';
  const changes = [...CHANGELOG]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, max)
    .map((c) => ({ icon: ICON[c.type], text: `${md(c.date)} ${ko ? c.ko : c.en}`, href: c.href, date: c.date }));

  // 자동 갱신 데이터 소식 (실제 반영된 값)
  const solar = '/utilities/productivity/solar-master';
  const smpMonth = Number(SMP.asOf.slice(5, 7));
  const q = Math.ceil(Number(ELECTRICITY.asOf.slice(5, 7)) / 3);
  const data: TickerItem[] = [
    { icon: '⚡', href: solar, date: KEROSENE.asOf,
      text: ko ? `${md(KEROSENE.asOf)} 실내등유 전국 평균 ${KEROSENE.perLiter.toLocaleString()}원/L 자동 반영` : `${md(KEROSENE.asOf)} Korean kerosene price updated automatically` },
    { icon: '⚡', href: solar, date: `${SMP.asOf}-28`,
      text: ko ? `전력 SMP ${smpMonth}월 평균 ${SMP.latest}원/kWh 자동 반영` : `Korean power price (SMP) for month ${smpMonth} updated automatically` },
    { icon: '⚡', href: solar, date: `${ELECTRICITY.asOf}-01`,
      text: ko ? `${ELECTRICITY.asOf.slice(0, 4)}년 ${q}분기 전기요금 반영` : `Korean electricity tariff for Q${q} ${ELECTRICITY.asOf.slice(0, 4)} applied` },
  ];
  // 소식 사이사이에 데이터 갱신을 끼워 넣는다
  const out: TickerItem[] = [];
  changes.forEach((c, i) => {
    out.push(c);
    if (i % 3 === 0 && data.length) out.push(data.shift()!);
  });
  return [...out, ...data];
}

/** 이번 달(한국 시간) 개선 건수 */
export function changesThisMonth(): number {
  const ym = kstToday().slice(0, 7);
  return CHANGELOG.filter((c) => c.date.startsWith(ym)).length;
}

/** 마지막 배포 시각 → "2시간 전" */
export function lastUpdatedLabel(locale: string): string {
  const built = process.env.BUILD_TIME ? new Date(process.env.BUILD_TIME).getTime() : NaN;
  const latestChange = new Date(`${[...CHANGELOG].sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? '2026-01-01'}T12:00:00+09:00`).getTime();
  const at = Number.isFinite(built) ? built : Math.min(latestChange, Date.now());
  const mins = Math.max(1, Math.round((Date.now() - at) / 60000));
  const ko = locale === 'ko';
  if (mins < 60) return ko ? `${mins}분 전` : `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return ko ? `${h}시간 전` : `${h}h ago`;
  const d = Math.round(h / 24);
  return ko ? `${d}일 전` : `${d}d ago`;
}
