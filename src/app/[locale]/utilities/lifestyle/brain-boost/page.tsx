import type { Metadata } from 'next';
import BrainBoostClient from './BrainBoostClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '브레인 부스트 N-Back — 듀얼 N-Back 작업 기억력 인지 훈련 | Utility Hub'
    : 'Brain Boost N-Back — Dual N-Back Working Memory Trainer | Utility Hub';
  const description = isKo
    ? '시각·청각 자극을 동시에 추적하는 듀얼 N-Back 게임. 작업 기억력 향상, 집중력 강화, 디지털 치매 예방에 효과적. 브라우저에서 바로 무료 훈련.'
    : 'Free Dual N-Back working memory training game. Track visual and audio stimuli simultaneously to strengthen focus, working memory, and cognitive reserve.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/brain-boost`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/brain-boost',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/brain-boost',
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
  name: '브레인 부스트 N-Back',
  alternateName: 'Brain Boost N-Back Trainer',
  operatingSystem: 'Web Browser',
  applicationCategory: 'GameApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/brain-boost',
  description:
    '시각·청각 자극을 동시에 추적하는 듀얼 N-Back 인지 훈련 게임. 작업 기억력 향상과 집중력 강화에 효과적이며, 브라우저에서 무료로 사용 가능합니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'N-Back 훈련이 정말 머리가 좋아지나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '2008년 Jaeggi 등의 PNAS 연구는 듀얼 N-Back 훈련이 유동적 지능 측정값을 향상시킨다고 보고했으며, 작업 기억력 향상 효과는 후속 복제 연구에서도 비교적 일관되게 나타나 학습·집중 분야에서 도움이 됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '하루 얼마나 훈련해야 효과가 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '연구에서는 하루 20분, 주 5일, 최소 2~4주 훈련을 권장합니다. 본 도구에서는 매일 1~3 세션(약 5~15분)을 꾸준히 실행하는 것이 가장 효과적입니다.',
      },
    },
    {
      '@type': 'Question',
      name: '어댑티브 난이도는 어떻게 동작하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '평균 정확도가 80% 이상이면 다음 세션의 N을 자동으로 한 단계 올리고, 50% 미만이면 한 단계 낮춥니다. 항상 자신의 한계 근처에서 훈련하도록 도와 효과를 극대화합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 의학적 진단으로 사용할 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '아니요. 본 결과는 본인 훈련 추적 참고용입니다. 의학적 진단·치료에 사용할 수 없으며, 인지 저하·기억력 문제가 의심되면 반드시 전문의와 상담하세요.',
      },
    },
  ],
};

export default function BrainBoostPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BrainBoostClient />
    </>
  );
}
