import type { Metadata } from 'next';
import MeetingBurnerClient from './MeetingBurnerClient';
import ToolJsonLd from '@/app/components/ToolJsonLd';
import { MEETING_BURNER_SEO } from './seoContent';
import SeoSection from '@/app/components/SeoSection';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '회의 비용 계산기 Meeting Burner | Utility Hub' : 'Meeting Burner — Real-time Meeting Cost Meter | Utility Hub';
  const description = isKo
    ? '회의 참석자와 연봉을 입력하면 초 단위로 증발하는 인건비를 실시간으로 시각화합니다.'
    : 'Visualize labor costs evaporating in real-time by entering meeting participants and salaries.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/productivity/meeting-burner`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/productivity/meeting-burner',
        en: 'https://www.theutilhub.com/en/utilities/productivity/meeting-burner',
        'x-default': 'https://www.theutilhub.com/ko/utilities/productivity/meeting-burner',
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

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '회의 비용 계산기 Meeting Burner',
  alternateName: 'Meeting Burner',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/productivity/meeting-burner',
  description: '회의 참석자와 연봉을 입력하면 초 단위로 증발하는 인건비를 실시간으로 시각화합니다.',
};

// 화면의 한국어 FAQ(SeoSection ko.faqs)와 동일한 데이터로 생성
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  inLanguage: 'ko',
  mainEntity: MEETING_BURNER_SEO.ko.faqs.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default async function MeetingBurnerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      {locale === 'ko' ? (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        </>
      ) : (
        <ToolJsonLd href="/utilities/productivity/meeting-burner" />
      )}
      <MeetingBurnerClient seo={<SeoSection ko={MEETING_BURNER_SEO.ko} en={MEETING_BURNER_SEO.en} />} />
    </>
  );
}
