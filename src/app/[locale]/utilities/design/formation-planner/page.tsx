import type { Metadata } from 'next';
import FormationPlannerClient from './FormationPlannerClient';

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

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '범례에 몇 명까지 넣을 수 있나요?',
      acceptedAnswer: { '@type': 'Answer', text: '화면 구성상 15~20명 내외가 가장 보기 좋게 저장됩니다.' },
    },
    {
      '@type': 'Question',
      name: '녹화된 영상에도 범례가 나오나요?',
      acceptedAnswer: { '@type': 'Answer', text: '네, 보드와 범례가 통합된 상태로 녹화되어 저장됩니다.' },
    },
    {
      '@type': 'Question',
      name: '왜 녹화 시간이 60초로 제한되나요?',
      acceptedAnswer: { '@type': 'Answer', text: '본 툴은 별도 서버 없이 브라우저에서 직접 영상을 인코딩합니다. 기기 성능 저하 없이 안정적인 녹화 품질을 보장하기 위해 최대 60초로 설계되었습니다.' },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
    },
  ],
};

export default function FormationPlannerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <FormationPlannerClient />
    </>
  );
}
