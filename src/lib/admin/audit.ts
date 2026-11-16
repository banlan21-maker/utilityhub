// 사이트 점검 — 검색엔진이 처음 받는 서버 HTML(JS 실행 전)을 기준으로 본다 (CLAUDE.md 표준 5)
import 'server-only';

export const SITE = 'https://www.theutilhub.com';

export interface AuditResult {
  url: string;
  status: number;
  level: 'ok' | 'warn' | 'fail';
  issues: string[];
  h1: number;
  words: number;
  ld: number;
  title: string;
}

export async function sitemapUrls(): Promise<string[]> {
  const res = await fetch(`${SITE}/sitemap.xml`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`사이트맵을 읽지 못했습니다 (HTTP ${res.status})`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const attr = (tag: string, name: string) => tag.match(new RegExp(`${name}="([^"]*)"`, 'i'))?.[1] ?? '';
const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

export async function auditUrl(url: string): Promise<AuditResult> {
  const out: AuditResult = { url, status: 0, level: 'ok', issues: [], h1: 0, words: 0, ld: 0, title: '' };
  const fail = (m: string) => { out.issues.push(m); out.level = 'fail'; };
  const warn = (m: string) => { out.issues.push(m); if (out.level === 'ok') out.level = 'warn'; };
  let html = '';
  try {
    const res = await fetch(url, { redirect: 'manual', cache: 'no-store', headers: { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +utilhub-admin-audit)' } });
    out.status = res.status;
    if (res.status !== 200) { fail(res.status >= 300 && res.status < 400 ? `리디렉션(${res.status}) — 사이트맵에는 최종 주소만` : `HTTP ${res.status}`); return out; }
    html = await res.text();
  } catch (e) {
    fail(`연결 실패: ${e instanceof Error ? e.message : e}`);
    return out;
  }

  const head = html.split('</head>')[0];
  out.title = decode(head.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? '');
  out.h1 = (html.match(/<h1[\s>]/gi) ?? []).length;
  out.ld = (html.match(/application\/ld\+json/gi) ?? []).length;
  const desc = decode(attr(head.match(/<meta[^>]+name="description"[^>]*>/i)?.[0] ?? '', 'content'));
  const canonical = attr(head.match(/<link[^>]+rel="canonical"[^>]*>/i)?.[0] ?? '', 'href');
  const robots = attr(head.match(/<meta[^>]+name="robots"[^>]*>/i)?.[0] ?? '', 'content');

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  const isKo = /\/ko(\/|$)/.test(new URL(url).pathname);
  const hangul = (text.match(/[가-힣]/g) ?? []).length;
  // 한국어는 글자 수(2자 ≈ 1단어), 영어는 단어 수
  out.words = isKo ? Math.round(hangul / 2) : text.split(/\s+/).filter((w) => /[A-Za-z]{2,}/.test(w)).length;

  if (out.h1 !== 1) fail(`h1이 ${out.h1}개 (1개여야 함)`);
  if (/noindex/i.test(robots)) fail('noindex — 사이트맵에 있으면 안 됨');
  if (!canonical) fail('canonical 없음');
  else if (canonical.replace(/\/$/, '') !== url.replace(/\/$/, '')) fail(`canonical이 다른 주소: ${canonical}`);
  if (!out.title) fail('title 없음');
  else if (out.title.length > (isKo ? 60 : 70)) warn(`제목이 김(${out.title.length}자) — 검색 결과에서 잘림`);
  if (!desc) fail('meta description 없음');
  else if (desc.length < (isKo ? 40 : 70)) warn(`설명이 짧음(${desc.length}자)`);
  const isTool = /\/utilities\/[^/]+\/[^/]+$/.test(new URL(url).pathname);
  if (isTool && out.ld === 0) fail('구조화 데이터(JSON-LD) 없음');
  if (isTool && out.words < 300) warn(`본문이 적음(${isKo ? `한글 ${hangul}자` : `${out.words}단어`}) — 300단어 이상 권장`);
  if (!isKo) {
    // 언어 전환 버튼('한국어') 외의 한글
    const stray = hangul - (text.match(/한국어/g) ?? []).length * 3;
    if (stray > 20) warn(`영문 페이지에 한글 ${stray}자`);
  }
  return out;
}
