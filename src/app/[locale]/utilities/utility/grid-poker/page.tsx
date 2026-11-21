import type { Metadata } from 'next';
import GridPokerClient from './GridPokerClient';
import ToolJsonLd from '@/app/components/ToolJsonLd';
import SeoSection from '@/app/components/SeoSection';
import { seoKo, seoEn } from './seo-content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '데일리 그리드 포커 — 5x5 카드 배치 두뇌 게임 | Utility Hub'
    : 'Daily Grid Poker — 5x5 Card Placement Brain Game | Utility Hub';
  const description = isKo
    ? '매일 새로운 25장의 카드를 5x5 그리드에 전략적으로 배치하고 포커 족보로 점수를 겨루는 데일리 퍼즐 게임.'
    : 'Place 25 daily cards on a 5x5 grid and score with poker hands. A new brain puzzle every day.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/grid-poker`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/utility/grid-poker',
        en: 'https://www.theutilhub.com/en/utilities/utility/grid-poker',
        'x-default': 'https://www.theutilhub.com/ko/utilities/utility/grid-poker',
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
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '데일리 그리드 포커',
  alternateName: 'Daily Grid Poker',
  operatingSystem: 'Web Browser',
  applicationCategory: 'GameApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/grid-poker',
  description:
    '매일 새로운 25장의 카드를 5x5 그리드에 전략적으로 배치하고 포커 족보로 점수를 겨루는 데일리 퍼즐 게임.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '매일 카드 배열이 바뀌나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네. 한국 날짜를 기준으로 52장을 새로 섞어 25장을 순서대로 제공합니다. 같은 날에는 모든 사용자가 같은 카드를 같은 순서로 받고, 한국 시간 자정에 새 카드로 바뀝니다.',
      },
    },
    {
      '@type': 'Question',
      name: '연속 플레이 기록은 어떻게 저장되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '사용 중인 브라우저에만 저장되고 서버로는 전송되지 않습니다. 하던 판도 함께 저장되어 새로고침해도 이어지며, 브라우저 데이터를 삭제하면 초기화됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '등급은 어떻게 정해지나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '10줄의 족보 점수를 더한 총점으로 정합니다. 새싹(0점 이상), 브론즈(40점), 실버(80점), 골드(120점), 다이아(160점), 마스터(200점)입니다.',
      },
    },
    {
      '@type': 'Question',
      name: '대각선 족보도 계산되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '아니요. 가로 5줄과 세로 5줄, 총 10줄만 계산됩니다. 대각선은 포함되지 않습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 게임 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 게임은 순수한 오락 목적으로 제작되었습니다. 결과는 참고용이며 공식 자료로 사용할 수 없습니다.',
      },
    },
  ],
};

export default async function GridPokerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      {locale === 'ko' ? (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        </>
      ) : (
        <ToolJsonLd href="/utilities/utility/grid-poker" />
      )}
      <GridPokerClient seo={<SeoSection ko={seoKo} en={seoEn} />} />
    </>
  );
}
