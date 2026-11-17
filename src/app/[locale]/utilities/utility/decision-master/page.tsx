import type { Metadata } from 'next';
import DecisionMasterClient from './DecisionMasterClient';
import ToolJsonLd from '@/app/components/ToolJsonLd';
import { SEO_KO } from './content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? 'Decision Master – 5가지 랜덤 결정 도구 | Utility Hub' : 'Decision Master – 5-in-1 Random Decision Hub | Utility Hub';
  const description = isKo
    ? '사다리 타기, 돌림판, 주사위, 제비뽑기, 화살표 돌리기 5가지 랜덤 결정 도구를 하나의 페이지에서 무료로 사용할 수 있습니다.'
    : 'Use 5 random decision tools — Ladder, Wheel, Dice, Draw, and Arrow — all in one free page.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/decision-master`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/utility/decision-master`,
        en: `https://www.theutilhub.com/en/utilities/utility/decision-master`,
        'x-default': `https://www.theutilhub.com/ko/utilities/utility/decision-master`,
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Decision Master – 5가지 랜덤 결정 도구',
  alternateName: 'Decision Master – 5-in-1 Random Decision Hub',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/decision-master',
  description: '사다리 타기, 돌림판, 주사위, 제비뽑기, 화살표 돌리기 5가지 랜덤 결정 도구를 하나의 페이지에서 무료로 사용할 수 있습니다.',
};

// 화면의 한국어 FAQ(SeoSection)와 같은 내용 — 영문 FAQPage는 SeoSection이 내보낸다
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  inLanguage: 'ko',
  mainEntity: SEO_KO.faqs.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default async function DecisionMasterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      {locale === 'ko' ? (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        </>
      ) : (
        <ToolJsonLd href="/utilities/utility/decision-master" />
      )}
      <DecisionMasterClient />
    </>
  );
}
