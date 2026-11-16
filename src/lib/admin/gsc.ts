// Google Search Console 검색 성과 — 서비스 계정(JSON 키)으로 읽기 전용 조회.
// 환경 변수 GSC_SERVICE_ACCOUNT 에 JSON 키 내용 전체(또는 base64)를 넣는다.
import 'server-only';
import { createSign } from 'node:crypto';
import { unstable_cache } from 'next/cache';

interface ServiceAccount { client_email: string; private_key: string; token_uri?: string }
export interface GscRow { key: string; clicks: number; impressions: number; ctr: number; position: number }
export interface GscTotals { clicks: number; impressions: number; ctr: number; position: number }
export interface GscReport {
  site: string;
  range: { start: string; end: string; prevStart: string; prevEnd: string };
  totals: GscTotals;
  prev: GscTotals;
  daily: { date: string; clicks: number; impressions: number }[];
  pages: GscRow[];
  queries: GscRow[];
  /** 노출은 많은데 클릭률이 낮은 페이지 — 제목·설명 개선 후보 */
  lowCtr: GscRow[];
  fetchedAt: string;
}

const b64url = (s: string | Buffer) => Buffer.from(s).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

function readAccount(): ServiceAccount | null {
  const raw = process.env.GSC_SERVICE_ACCOUNT?.trim();
  if (!raw) return null;
  const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  const acc = JSON.parse(json) as ServiceAccount;
  acc.private_key = acc.private_key.replace(/\\n/g, '\n');
  return acc;
}

async function accessToken(acc: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const tokenUri = acc.token_uri ?? 'https://oauth2.googleapis.com/token';
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: acc.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: tokenUri,
    iat: now,
    exp: now + 3600,
  }));
  const sig = b64url(createSign('RSA-SHA256').update(`${head}.${claim}`).sign(acc.private_key));
  const res = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${claim}.${sig}` }),
    cache: 'no-store',
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`구글 인증 실패: ${j.error_description ?? j.error ?? res.status}`);
  return j.access_token as string;
}

async function pickSite(token: string): Promise<string> {
  const res = await fetch('https://www.googleapis.com/webmasters/v3/sites', { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' });
  const j = await res.json();
  if (!res.ok) throw new Error(`속성 목록 조회 실패: ${j.error?.message ?? res.status}`);
  const sites: string[] = (j.siteEntry ?? []).map((s: { siteUrl: string }) => s.siteUrl).filter((u: string) => u.includes('theutilhub.com'));
  if (!sites.length) throw new Error('서비스 계정이 theutilhub.com 속성에 사용자로 추가되지 않았습니다.');
  return sites.find((u) => u.startsWith('sc-domain:')) ?? sites.find((u) => u.includes('www.')) ?? sites[0];
}

async function query(token: string, site: string, body: object) {
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`검색 성과 조회 실패: ${j.error?.message ?? res.status}`);
  return (j.rows ?? []) as { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }[];
}

const day = (offset: number) => new Date(Date.now() + 9 * 3600_000 - offset * 86400_000).toISOString().slice(0, 10);
const toRow = (r: { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }): GscRow =>
  ({ key: r.keys?.[0] ?? '', clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position });
const totalsOf = (rows: { clicks: number; impressions: number; ctr: number; position: number }[]): GscTotals =>
  rows[0] ? { clicks: rows[0].clicks, impressions: rows[0].impressions, ctr: rows[0].ctr, position: rows[0].position } : { clicks: 0, impressions: 0, ctr: 0, position: 0 };

async function buildReport(): Promise<GscReport> {
  const acc = readAccount();
  if (!acc) throw new Error('GSC_SERVICE_ACCOUNT 환경 변수가 없습니다.');
  const token = await accessToken(acc);
  const site = await pickSite(token);
  // 검색 성과는 2~3일 늦게 집계되므로 3일 전까지 28일씩
  const range = { start: day(30), end: day(3), prevStart: day(58), prevEnd: day(31) };
  const cur = { startDate: range.start, endDate: range.end };
  const [tot, prev, daily, pages, queries] = await Promise.all([
    query(token, site, cur),
    query(token, site, { startDate: range.prevStart, endDate: range.prevEnd }),
    query(token, site, { ...cur, dimensions: ['date'], rowLimit: 100 }),
    query(token, site, { ...cur, dimensions: ['page'], rowLimit: 100 }),
    query(token, site, { ...cur, dimensions: ['query'], rowLimit: 50 }),
  ]);
  const pageRows = pages.map(toRow);
  return {
    site,
    range,
    totals: totalsOf(tot),
    prev: totalsOf(prev),
    daily: daily.map((r) => ({ date: r.keys?.[0] ?? '', clicks: r.clicks, impressions: r.impressions })),
    pages: pageRows,
    queries: queries.map(toRow),
    lowCtr: pageRows.filter((r) => r.impressions >= 100 && r.ctr < 0.01).sort((a, b) => b.impressions - a.impressions).slice(0, 15),
    fetchedAt: new Date().toISOString(),
  };
}

// 구글 할당량을 아끼려고 6시간 캐시
const cached = unstable_cache(buildReport, ['gsc-report-v1'], { revalidate: 21600 });

export async function gscReport(): Promise<{ ok: true; data: GscReport } | { ok: false; error: string }> {
  if (!process.env.GSC_SERVICE_ACCOUNT) return { ok: false, error: 'not-configured' };
  try {
    return { ok: true, data: await cached() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
