import type { Metadata } from 'next';
import PetCalorieClient from './PetCalorieClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '반려동물 칼로리 계산기 | Utility Hub' : 'Pet Calorie Calculator | Utility Hub';
  const description = isKo
    ? '강아지·고양이의 체중·나이·활동량으로 일일 권장 칼로리(DER)와 사료량(g)을 계산하는 무료 도구'
    : 'Calculate your dog or cat\'s daily calorie needs (DER) and recommended food amount in grams based on weight, age, and activity level.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/pet-calorie`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/pet-calorie',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/pet-calorie',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '반려동물 사료량 & 칼로리 계산기',
  alternateName: 'Pet Food & Calorie Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/pet-calorie',
  description: '강아지·고양이의 체중·나이·활동량으로 일일 권장 칼로리(DER)와 사료량(g)을 계산하는 무료 도구',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '계산된 사료량과 사료 봉투의 급여량 기준이 다릅니다', acceptedAnswer: { '@type': 'Answer', text: '사료 봉투의 급여량은 제조사 기준으로 다소 많이 제시되는 경향이 있습니다. 이 계산기는 개별 반려동물의 체중과 활동량을 반영하므로 더 정밀합니다. 처음에는 계산량을 기준으로 2~3주간 급여 후 체중 변화를 모니터링하세요.' } },
    { '@type': 'Question', name: '중성화 수술 후 사료량을 줄여야 하나요?', acceptedAnswer: { '@type': 'Answer', text: '네. 중성화 후에는 기초 대사율이 약 20~30% 낮아져 같은 양을 먹어도 살이 찌기 쉽습니다. 생애 단계에서 "성견/성묘 (중성화 완료)"를 선택하면 이를 반영한 권장량이 계산됩니다.' } },
    { '@type': 'Question', name: '반려동물이 계산된 양보다 훨씬 많이 먹으려 합니다', acceptedAnswer: { '@type': 'Answer', text: '하루 급여량을 한 번에 주지 말고 2~3회로 나눠 급여하면 포만감이 높아집니다. 또한 식이섬유가 풍부한 사료나 물을 사료와 함께 제공하면 과식 충동을 줄일 수 있습니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function PetCaloriePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PetCalorieClient />
    </>
  );
}
