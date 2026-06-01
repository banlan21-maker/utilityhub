import type { Metadata } from 'next';
import SupplementCostClient from './SupplementCostClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '영양제 진짜 가성비 분석기 (1일 단가 · 1000mg당 · 순도 비교) | Utility Hub'
    : 'Supplement Cost Analyzer (Cost per Day · per 1000mg · Purity) | Utility Hub';
  const description = isKo
    ? '라벨 꼼수에 속지 마세요. 총 캡슐 수, 1회 섭취량, 핵심 함량, 순도를 대조하여 영양제 A·B 중 진짜 가성비 승자를 판정합니다.'
    : 'See through label tricks. Compare total capsules, serving size, active mg, and purity to find the true value winner between two supplements.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/supplement-cost-calc`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/supplement-cost-calc',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/supplement-cost-calc',
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
  name: '영양제 진짜 가성비 분석기',
  alternateName: 'Supplement True Cost Analyzer',
  operatingSystem: 'Web Browser',
  applicationCategory: 'LifestyleApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/supplement-cost-calc',
  description:
    '총 캡슐 수, 1회 섭취량, 핵심 성분 함량, 순도를 대조하여 영양제 A·B의 하루 단가와 1,000mg당 단가, 진짜 가성비 승자를 계산하는 100% 브라우저 기반 가격 비교 도구.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '성분 함량을 1캡슐 기준으로 넣나요, 1회 섭취량 기준으로 넣나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '라벨에 적힌 1회 섭취량 기준 숫자를 그대로 입력하시면 됩니다. 핵심 성분과 캡슐 총 용량 모두 같은 1회 섭취량 기준으로 넣어야 순도가 정확히 계산됩니다. 사용자가 별도로 나누기 계산을 할 필요가 없습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '하루 단가와 1,000mg당 단가 중 뭘 봐야 하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '단순 제품은 하루 단가가, 오메가3처럼 핵심 성분 농도가 중요한 영양제는 1,000mg당 단가가 핵심 비교 기준입니다. 본 도구는 두 지표를 모두 제공하니 비교 목적에 맞게 선택해서 보시면 됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '순도가 높을수록 무조건 좋은 건가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '오메가3의 경우 순도 80% 내외가 일반적 기준으로 알려져 있습니다. rTG 형태는 보통 80%를 넘기 어려워, 90%에 가까운 순도가 표기되면 용량 표기 확인이 필요할 수 있어 본 도구가 이상치를 안내합니다. 비타민·미네랄은 고순도가 정상이라 경고를 적용하지 않습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 이 도구는 가격 비교 계산기이며 의학적 조언이 아닙니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.',
      },
    },
  ],
};

export default function SupplementCostPage() {
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
      <SupplementCostClient />
    </>
  );
}
