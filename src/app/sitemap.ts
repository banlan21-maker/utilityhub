import { MetadataRoute } from 'next';

const BASE = 'https://theutilhub.com';

const CATEGORIES = [
  'performance',
  'pdf',
  'fintech',
  'productivity',
  'ux',
  'ai',
  'lifestyle',
  'security',
  'utilities',
  'dev',
];

const STATIC_PAGES = ['', '/privacy', '/terms', '/feedback'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // Static pages (ko default + en)
  for (const path of STATIC_PAGES) {
    entries.push({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? 'weekly' : 'monthly',
      priority: path === '' ? 1.0 : 0.5,
      alternates: {
        languages: {
          ko: `${BASE}${path}`,
          en: `${BASE}/en${path}`,
        },
      },
    });
  }

  // Category pages (ko default + en)
  for (const cat of CATEGORIES) {
    entries.push({
      url: `${BASE}/${cat}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          ko: `${BASE}/${cat}`,
          en: `${BASE}/en/${cat}`,
        },
      },
    });
  }

  return entries;
}
