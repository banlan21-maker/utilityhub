import { MetadataRoute } from 'next';
import { tools } from '@/lib/tools-registry';
import { CHANGELOG } from '@/lib/changelog';
import BASELINE from '@/constants/lastmod.json';
import { hasSupportLinks } from '@/config/monetization';

const BASE = 'https://www.theutilhub.com';
// 후원 페이지는 링크가 설정된 뒤에만 사이트맵에 넣는다
const STATIC_PATHS = ['', '/privacy', '/terms', '/about', '/contact', ...(hasSupportLinks() ? ['/support'] : [])];

const CATEGORY_SLUGS = [
  'performance', 'document', 'finance', 'productivity',
  'design', 'marketing', 'lifestyle', 'security', 'utility', 'dev',
];

const LOCALES = ['ko', 'en'] as const;

/*
 * lastmod = 페이지 내용을 실제로 고친 날 (한국 시간 날짜). 두 곳 중 늦은 날짜를 쓴다.
 *  1) src/constants/lastmod.json — 전체 git 기록에서 뽑은 기준 날짜 (node scripts/gen-lastmod.mjs).
 *     Vercel 은 최근 커밋 10개만 받아 빌드하므로 여기서 git log 를 돌리면 오래된 페이지가 모두 같은 날짜가 된다.
 *  2) src/lib/changelog.ts — 그 뒤 사용자에게 보이게 고친 기록.
 * 둘 다 없으면 lastmod 를 넣지 않는다 (빌드 시각 같은 가짜 날짜보다 낫다).
 */
const baseline = BASELINE as Record<string, string>;
const latest = (...dates: (string | undefined)[]) => dates.filter((d): d is string => !!d).sort().pop();
const changed = (pred: (href: string, type: string) => boolean) =>
  latest(...CHANGELOG.filter((c) => pred(c.href, c.type)).map((c) => c.date));
const toolHrefs = new Set(tools.map((t) => t.href));

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const date = (d: string | undefined) => (d ? { lastModified: d } : {});

  const alts = (path: string) => ({
    languages: {
      ko: `${BASE}/ko${path}`,
      en: `${BASE}/en${path}`,
      'x-default': `${BASE}/ko${path}`,
    },
  });

  // Static pages — 홈은 최근 업데이트 전광판이 있어 도구 변경일도 반영
  for (const p of STATIC_PATHS) {
    const lastMod = p === '' ? latest(baseline[''], changed((h) => toolHrefs.has(h))) : baseline[p];
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE}/${locale}${p}`,
        ...date(lastMod),
        changeFrequency: p === '' ? 'weekly' : 'monthly',
        priority: p === '' ? 1.0 : 0.5,
        alternates: alts(p),
      });
    }
  }

  // Category listing pages — 목록이 바뀌는 건 새 도구가 들어올 때
  for (const cat of CATEGORY_SLUGS) {
    const path = `/utilities/${cat}`;
    const lastMod = latest(baseline[path], changed((h, type) => type === 'new' && h.startsWith(`${path}/`)));
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE}/${locale}${path}`,
        ...date(lastMod),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: alts(path),
      });
    }
  }

  // Individual tool pages
  for (const tool of tools) {
    if (!tool.available) continue;
    const lastMod = latest(baseline[tool.href], changed((h) => h === tool.href));
    for (const locale of tool.koOnly ? (['ko'] as const) : LOCALES) {
      entries.push({
        url: `${BASE}/${locale}${tool.href}`,
        ...date(lastMod),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: tool.koOnly ? { languages: { ko: `${BASE}/ko${tool.href}`, 'x-default': `${BASE}/ko${tool.href}` } } : alts(tool.href),
      });
    }
  }

  return entries;
}
