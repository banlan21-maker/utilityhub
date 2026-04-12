import type { Metadata } from 'next';
import { headers } from 'next/headers';

const BASE = 'https://www.theutilhub.com';

/**
 * utilities 하위 모든 페이지에 적용되는 기본 canonical 메타데이터.
 * 개별 page.tsx에 generateMetadata가 있으면 그쪽이 우선 적용됨.
 * generateMetadata가 없는 'use client' 페이지는 여기서 canonical을 자동 상속.
 */
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';

  // pathname 예: /ko/utilities/finance/vat-calc
  const isKo = pathname.startsWith('/ko');
  const locale = isKo ? 'ko' : 'en';

  // 반대 로케일 URL 계산
  const altPathname = isKo
    ? pathname.replace(/^\/ko/, '/en')
    : pathname.replace(/^\/en/, '/ko');

  return {
    alternates: {
      canonical: `${BASE}${pathname}`,
      languages: {
        ko: `${BASE}${isKo ? pathname : altPathname}`,
        en: `${BASE}${isKo ? altPathname : pathname}`,
      },
    },
    openGraph: {
      url: `${BASE}${pathname}`,
      siteName: 'Utility Hub',
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      type: 'website',
    },
  };
}

export default function UtilitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
