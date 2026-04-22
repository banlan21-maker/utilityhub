import type { Metadata } from 'next';
import BmiCalcClient from './BmiCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? 'BMI 계산기 & 수분 섭취량 계산기 | Utility Hub' : 'BMI Calculator & Daily Water Intake | Utility Hub';
  const description = isKo
    ? '키와 몸무게로 체질량지수(BMI)를 계산하고 활동량 기반 일일 권장 수분 섭취량을 확인하세요'
    : 'Calculate your BMI from height and weight and find your daily recommended water intake based on activity level.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/bmi-calc`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/bmi-calc',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/bmi-calc',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'BMI 계산기 & 수분 섭취량 계산기',
  alternateName: 'BMI Calculator & Daily Water Intake',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/bmi-calc',
  description: '키와 몸무게로 체질량지수(BMI)를 계산하고 활동량 기반 일일 권장 수분 섭취량을 확인하세요',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'BMI가 높으면 반드시 건강에 문제가 있나요?', acceptedAnswer: { '@type': 'Answer', text: 'BMI는 빠른 체중 상태 평가를 위한 참고 지표입니다. 근육량이 많은 운동선수는 BMI가 높아도 건강할 수 있으며, 노인의 경우 정상 BMI여도 근감소증이 있을 수 있습니다. 정확한 진단은 의료 전문가와 상담하세요.' } },
    { '@type': 'Question', name: '하루 물을 얼마나 마셔야 하나요?', acceptedAnswer: { '@type': 'Answer', text: '일반적으로 체중(kg) × 30~35ml가 기본 권장량입니다. 예를 들어 60kg이라면 1,800~2,100ml(약 9~10잔)입니다. 더운 날씨, 운동 후, 고섬유질 식단에서는 추가 수분이 필요합니다.' } },
    { '@type': 'Question', name: '아시아인 기준 BMI는 서양인과 다른가요?', acceptedAnswer: { '@type': 'Answer', text: '네. WHO 아시아·태평양 권고 기준은 정상 범위를 18.5~22.9로 설정해 서양 기준(18.5~24.9)보다 낮습니다. 이 도구는 일반 WHO 기준을 사용하며, 아시아인은 25 미만이어도 과체중 위험을 고려할 필요가 있습니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function BmiCalcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <BmiCalcClient />
    </>
  );
}
