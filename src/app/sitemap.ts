import { MetadataRoute } from 'next';
import { tools } from '@/lib/tools-registry';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const BASE = 'https://www.theutilhub.com';
const STATIC_PATHS = ['', '/privacy', '/terms', '/feedback', '/about', '/contact'];

const CATEGORY_SLUGS = [
  'performance', 'document', 'finance', 'productivity',
  'design', 'marketing', 'lifestyle', 'security', 'utility', 'dev',
];

const LOCALES = ['ko', 'en'] as const;

// 각 툴 디렉터리의 마지막 git commit 시각을 가져옴 (실패 시 빌드 시각으로 폴백)
function getFileLastModified(relativePath: string, fallback: Date): Date {
  try {
    const fullPath = path.join(process.cwd(), 'src/app/[locale]', relativePath);
    if (!fs.existsSync(fullPath)) return fallback;
    const out = execSync(`git log -1 --format=%cI -- "${fullPath}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    return out ? new Date(out) : fallback;
  } catch {
    return fallback;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  const alts = (path: string) => ({
    languages: {
      ko: `${BASE}/ko${path}`,
      en: `${BASE}/en${path}`,
      'x-default': `${BASE}/ko${path}`,
    },
  });

  // Static pages
  for (const p of STATIC_PATHS) {
    const lastMod = getFileLastModified(p === '' ? 'page.tsx' : `${p.slice(1)}/page.tsx`, now);
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE}/${locale}${p}`,
        lastModified: lastMod,
        changeFrequency: p === '' ? 'weekly' : 'monthly',
        priority: p === '' ? 1.0 : 0.5,
        alternates: alts(p),
      });
    }
  }

  // Category listing pages
  for (const cat of CATEGORY_SLUGS) {
    const lastMod = getFileLastModified(`utilities/${cat}/page.tsx`, now);
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE}/${locale}/utilities/${cat}`,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: alts(`/utilities/${cat}`),
      });
    }
  }

  // Individual tool pages
  for (const tool of tools) {
    if (!tool.available) continue;
    const lastMod = getFileLastModified(`utilities/${tool.category}/${tool.slug}/page.tsx`, now);
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE}/${locale}${tool.href}`,
        lastModified: lastMod,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: alts(tool.href),
      });
    }
  }

  return entries;
}
