import type { Metadata } from 'next';
import GymPlateCalcClient from './GymPlateCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '1RM & 바벨 원판 계산기 | Utility Hub' : '1RM & Barbell Plate Calculator | Utility Hub';
  const description = isKo
    ? 'Epley 공식으로 최대 중량(1RM)을 계산하고, IWF 표준 컬러로 바벨 원판 세팅을 시각화하는 무료 헬스 계산기'
    : 'Calculate your 1RM using the Epley formula and visualize barbell plate loading with IWF standard colors.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/gym-plate-calc`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/gym-plate-calc',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/gym-plate-calc',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '1RM & 바벨 원판 계산기',
  alternateName: '1RM & Barbell Plate Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/gym-plate-calc',
  description: 'Epley 공식으로 최대 중량(1RM)을 계산하고, IWF 표준 컬러로 바벨 원판 세팅을 시각화하는 무료 헬스 계산기',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Epley 공식은 얼마나 정확한가요?', acceptedAnswer: { '@type': 'Answer', text: 'Epley 공식은 1985년 Bruce Epley가 발표한 공식으로, 연구 결과 오차 범위가 평균 3~5% 이내로 나타났습니다. 특히 6~10회 반복 구간에서 가장 정확하며, 보디빌딩과 파워리프팅 커뮤니티에서 표준으로 사용됩니다.' } },
    { '@type': 'Question', name: '원판 색깔이 헬스장과 다른데요?', acceptedAnswer: { '@type': 'Answer', text: '이 도구는 국제 역도 연맹(IWF) 표준 컬러 코드를 따릅니다: 빨강(25kg), 파랑(20kg), 노랑(15kg), 초록(10kg), 하양(5kg), 검정(2.5kg), 은색(1.25kg). 일부 헬스장은 다른 색상을 사용할 수 있습니다.' } },
    { '@type': 'Question', name: '1RM 측정 후 어떻게 활용하나요?', acceptedAnswer: { '@type': 'Answer', text: '1RM의 80~85%는 근비대(Hypertrophy), 85~95%는 근력(Strength), 95% 이상은 파워(Power) 훈련에 적합합니다. 5x5 프로그램은 보통 1RM의 75~85%를 사용합니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function GymPlateCalcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <GymPlateCalcClient />
    </>
  );
}
