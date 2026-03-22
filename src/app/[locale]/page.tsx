import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import HomeContent from './HomeContent';
import { getToolCounts, getTotalToolCount } from '@/lib/categoryUtils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Index' });

  const BASE = 'https://theutilhub.com';
  const canonical = locale === 'ko' ? BASE : `${BASE}/${locale}`;

  return {
    title: `Utility Hub — ${t('slogan')}`,
    description: t('metaDescription'),
    metadataBase: new URL(BASE),
    alternates: {
      canonical,
      languages: {
        ko: BASE,
        en: `${BASE}/en`,
      },
    },
    openGraph: {
      title: 'Utility Hub',
      description: t('metaDescription'),
      url: canonical,
      siteName: 'Utility Hub',
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Utility Hub',
      description: t('metaDescription'),
    },
    keywords: [
      'utility hub', 'free online tools', 'browser tools', 'no login tools',
      'PDF converter', 'QR code generator', 'fintech calculator', 'developer tools',
      'privacy tools', 'theutilhub', 'theutilhub.com',
    ],
  };
}

export default function HomePage() {
  // Automatically count tools by scanning file system
  const toolCounts = getToolCounts();
  const totalTools = getTotalToolCount();

  return <HomeContent toolCounts={toolCounts} totalTools={totalTools} />;
}
