import type { Metadata } from 'next';
import FeedbackClient from './FeedbackClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '피드백 보내기 | Utility Hub'
    : 'Send Feedback | Utility Hub';
  const description = isKo
    ? '새로운 유틸리티 제안, 버그 제보, 일반 피드백을 보내주세요. 여러분의 의견이 더 나은 서비스를 만듭니다.'
    : 'Submit feature requests, bug reports, or general feedback. Your input helps us build a better service.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/design/feedback`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/design/feedback',
        en: 'https://www.theutilhub.com/en/utilities/design/feedback',
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
  name: '피드백 위젯',
  alternateName: 'Feedback Widget',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/design/feedback',
  description: '새로운 유틸리티 제안, 버그 제보, 일반 피드백을 보내주세요. 여러분의 의견이 더 나은 서비스를 만듭니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '피드백을 보내면 답변을 받을 수 있나요?',
      acceptedAnswer: { '@type': 'Answer', text: '현재 피드백은 익명으로 수집되어 서비스 개선에 활용됩니다. 개별 답변은 제공되지 않지만, 제안해주신 내용은 모두 검토됩니다.' },
    },
    {
      '@type': 'Question',
      name: '어떤 내용을 피드백으로 보낼 수 있나요?',
      acceptedAnswer: { '@type': 'Answer', text: '새로운 유틸리티 도구 제안, 버그 제보, 기존 기능 개선 요청, 일반적인 사용 후기 등 어떤 내용이든 보내주실 수 있습니다.' },
    },
    {
      '@type': 'Question',
      name: '피드백이 실제로 반영되나요?',
      acceptedAnswer: { '@type': 'Answer', text: '네, 수집된 피드백은 우선순위를 정해 서비스 개선에 반영합니다. 많은 분들이 요청하신 기능은 더 빠르게 추가됩니다.' },
    },
  ],
};

export default function FeedbackPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <FeedbackClient />
    </>
  );
}
