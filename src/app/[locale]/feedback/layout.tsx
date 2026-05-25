import type { Metadata } from 'next';

const BASE = 'https://www.theutilhub.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '피드백 게시판 | Utility Hub' : 'Feedback Board | Utility Hub';
  const description = isKo
    ? '유틸리티 허브에 새로운 도구를 제안하거나 버그를 제보하고, 다른 사용자들의 의견을 확인하세요.'
    : 'Suggest new tools, report bugs, and see what other users are requesting on Utility Hub.';
  const canonical = `${BASE}/${locale}/feedback`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `${BASE}/ko/feedback`,
        en: `${BASE}/en/feedback`,
        'x-default': `${BASE}/ko/feedback`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Utility Hub',
      locale: isKo ? 'ko_KR' : 'en_US',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
