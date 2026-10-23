import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import HomeContent from './HomeContent';
import ToolDirectory from '@/app/components/ToolDirectory';
import { getToolCounts, getTotalToolCount } from '@/lib/categoryUtils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Index' });

  const BASE = 'https://www.theutilhub.com';
  // 루트(/)는 /ko로 리디렉션되므로 canonical·hreflang은 항상 로케일 경로를 가리킨다.
  const canonical = `${BASE}/${locale}`;

  return {
    title: `Utility Hub — ${t('slogan')}`,
    description: t('metaDescription'),
    metadataBase: new URL(BASE),
    alternates: {
      canonical,
      languages: {
        ko: `${BASE}/ko`,
        en: `${BASE}/en`,
        'x-default': `${BASE}/ko`,
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

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Automatically count tools by scanning file system
  const toolCounts = getToolCounts();
  const totalTools = getTotalToolCount();

  return (
    <HomeContent
      toolCounts={toolCounts}
      totalTools={totalTools}
      directory={<ToolDirectory locale={locale} />}
    />
  );
}
