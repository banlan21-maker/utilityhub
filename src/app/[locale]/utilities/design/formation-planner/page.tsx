import type { Metadata } from 'next';
import FormationPlannerClient from './FormationPlannerClient';
import ToolJsonLd from '@/app/components/ToolJsonLd';
import { FORMATION_PLANNER_SEO } from './seoContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '대형 플래너 — 스마트 범례 전술 보드 | Utility Hub'
    : 'Formation Planner — Smart Legend Tactics Board | Utility Hub';
  const description = isKo
    ? '각 멤버의 이름을 범례로 관리하고 동선을 60초 영상으로 기록할 수 있는 스마트 전술 시뮬레이터입니다.'
    : 'A smart tactics simulator that manages each member as a legend and records movement as a 60-second video.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/design/formation-planner`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/design/formation-planner',
        en: 'https://www.theutilhub.com/en/utilities/design/formation-planner',
        'x-default': 'https://www.theutilhub.com/ko/utilities/design/formation-planner',
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
  name: 'Formation Playmaker Pro — 스마트 범례 전술 보드',
  alternateName: 'Formation Playmaker Pro — Smart Legend Tactics Board',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/design/formation-planner',
  description: '각 멤버의 이름을 범례로 관리하고 동선을 60초 영상으로 기록할 수 있는 스마트 전술 시뮬레이터입니다.',
};

// 화면의 한국어 FAQ(SeoSection ko.faqs)와 동일한 데이터로 생성
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  inLanguage: 'ko',
  mainEntity: FORMATION_PLANNER_SEO.ko.faqs.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default async function FormationPlannerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      {locale === 'ko' ? (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        </>
      ) : (
        <ToolJsonLd href="/utilities/design/formation-planner" />
      )}
      <FormationPlannerClient />
    </>
  );
}
