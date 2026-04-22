import type { Metadata } from 'next';
import ThirtyDayChallengeClient from './ThirtyDayChallengeClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '30일 챌린지 트래커 | Utility Hub' : '30 Day Challenge Tracker | Utility Hub';
  const description = isKo
    ? '목표 습관 형성을 위한 30일 챌린지 트래커. 날짜별 체크 & 메모, PDF 다운로드 지원.'
    : 'Track your 30-day challenge to build new habits. Check off days, add notes, and export to PDF.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/30day-challenge`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/30day-challenge',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/30day-challenge',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '30일 챌린지 트래커',
  alternateName: '30 Day Challenge Tracker',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/30day-challenge',
  description: '목표 습관 형성을 위한 30일 챌린지 트래커. 날짜별 체크 & 메모, PDF 다운로드 지원.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '기록이 사라지면 어떡하나요?', acceptedAnswer: { '@type': 'Answer', text: '브라우저의 localStorage에 저장되므로 쿠키나 캐시를 삭제하지 않는 한 안전하게 보관됩니다. 만약을 대비해 주기적으로 PDF로 백업하는 것을 추천합니다.' } },
    { '@type': 'Question', name: '실패 표시는 어떻게 작동하나요?', acceptedAnswer: { '@type': 'Answer', text: '시작일부터 오늘 이전까지의 날짜 중 체크하지 않은 날은 자동으로 빨간색 ✕ 실패 표시가 나타납니다. 오늘 날짜나 미래 날짜는 아직 실패로 표시되지 않습니다.' } },
    { '@type': 'Question', name: '메모는 얼마나 길게 쓸 수 있나요?', acceptedAnswer: { '@type': 'Answer', text: '메모는 최대 80자까지 입력할 수 있습니다. PDF 출력 시에도 메모가 포함됩니다.' } },
  ],
};

export default function ThirtyDayChallengePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ThirtyDayChallengeClient />
    </>
  );
}
