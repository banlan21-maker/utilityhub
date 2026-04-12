import { MetadataRoute } from 'next';
import { tools } from '@/lib/tools-registry';

const BASE = 'https://www.theutilhub.com';
const STATIC_PATHS = ['', '/privacy', '/terms', '/feedback'];

const CATEGORY_SLUGS = [
  'performance', 'document', 'finance', 'productivity',
  'design', 'marketing', 'lifestyle', 'security', 'utility', 'dev',
];

const LOCALES = ['ko', 'en'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  const alts = (path: string) => ({
    languages: {
      ko: `${BASE}/ko${path}`,
      en: `${BASE}/en${path}`,
    },
  });

  // Static pages — ko + en 각각 등록
  for (const path of STATIC_PATHS) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1.0 : 0.5,
        alternates: alts(path),
      });
    }
  }

  // Category listing pages — ko + en 각각 등록
  for (const cat of CATEGORY_SLUGS) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE}/${locale}/utilities/${cat}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: alts(`/utilities/${cat}`),
      });
    }
  }

  // Individual tool pages — ko + en 각각 등록
  for (const tool of tools) {
    if (!tool.available) continue;
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE}/${locale}${tool.href}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: alts(tool.href),
      });
    }
  }

  return entries;
}
