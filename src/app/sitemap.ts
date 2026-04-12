import { MetadataRoute } from 'next';
import { tools } from '@/lib/tools-registry';

const BASE = 'https://www.theutilhub.com';
const STATIC_PATHS = ['', '/privacy', '/terms', '/feedback'];

const CATEGORY_SLUGS = [
  'performance', 'document', 'finance', 'productivity',
  'design', 'marketing', 'lifestyle', 'security', 'utility', 'dev',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Static pages — one canonical (ko) entry with en alternate
  for (const path of STATIC_PATHS) {
    entries.push({
      url: `${BASE}/ko${path}`,
      lastModified: now,
      changeFrequency: path === '' ? 'weekly' : 'monthly',
      priority: path === '' ? 1.0 : 0.5,
      alternates: {
        languages: {
          ko: `${BASE}/ko${path}`,
          en: `${BASE}/en${path}`,
        },
      },
    });
  }

  // Category listing pages
  for (const cat of CATEGORY_SLUGS) {
    entries.push({
      url: `${BASE}/ko/utilities/${cat}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          ko: `${BASE}/ko/utilities/${cat}`,
          en: `${BASE}/en/utilities/${cat}`,
        },
      },
    });
  }

  // Individual tool pages
  for (const tool of tools) {
    if (!tool.available) continue;
    // tool.href = '/utilities/[category]/[slug]'
    entries.push({
      url: `${BASE}/ko${tool.href}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          ko: `${BASE}/ko${tool.href}`,
          en: `${BASE}/en${tool.href}`,
        },
      },
    });
  }

  return entries;
}
