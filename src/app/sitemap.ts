import { MetadataRoute } from 'next';
import { tools } from '@/lib/tools-registry';

const BASE = 'https://theutilhub.com';

const STATIC_PAGES = ['', '/privacy', '/terms', '/feedback'];

const CATEGORY_SLUGS = [
  'performance', 'document', 'finance', 'productivity',
  'design', 'marketing', 'lifestyle', 'security', 'utility', 'dev',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  for (const path of STATIC_PAGES) {
    entries.push({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? 'weekly' : 'monthly',
      priority: path === '' ? 1.0 : 0.5,
      alternates: { languages: { ko: `${BASE}${path}`, en: `${BASE}/en${path}` } },
    });
  }

  // Category pages
  for (const cat of CATEGORY_SLUGS) {
    entries.push({
      url: `${BASE}/utilities/${cat}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          ko: `${BASE}/utilities/${cat}`,
          en: `${BASE}/en/utilities/${cat}`,
        },
      },
    });
  }

  // Individual tool pages (from tools-registry)
  for (const tool of tools) {
    if (!tool.available) continue;
    entries.push({
      url: `${BASE}${tool.href}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          ko: `${BASE}${tool.href}`,
          en: `${BASE}/en${tool.href}`,
        },
      },
    });
  }

  return entries;
}
