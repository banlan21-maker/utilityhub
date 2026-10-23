import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

const BASE = 'https://www.theutilhub.com';

/**
 * 카테고리 리스팅 페이지 공통 generateMetadata.
 * 각 카테고리의 <Category>Board 네임스페이스에서 metaTitle / metaDescription을 읽는다.
 */
export async function buildCategoryMetadata(
  locale: string,
  category: string,
  boardNamespace: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: boardNamespace });
  const title = t('metaTitle');
  const description = t('metaDescription');
  const path = `/utilities/${category}`;
  const canonical = `${BASE}/${locale}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `${BASE}/ko${path}`,
        en: `${BASE}/en${path}`,
        'x-default': `${BASE}/ko${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Utility Hub',
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}
