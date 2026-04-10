import type { Metadata } from 'next';
import SolarMasterClient from './SolarMasterClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? 'Solar Master — 태양광·태양열 발전량 ROI 계산기 | Utility Hub'
    : 'Solar Master — Solar PV & Thermal ROI Calculator | Utility Hub';
  const description = isKo
    ? '태양광·태양열 발전량, 절감액, 손익분기점을 지역별 일조 데이터와 한전 누진세 구조로 정밀 계산합니다.'
    : 'Calculate solar PV & thermal output, savings, and ROI payback using regional irradiance data and progressive electricity rates.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/productivity/solar-master`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/productivity/solar-master',
        en: 'https://www.theutilhub.com/en/utilities/productivity/solar-master',
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
  name: 'Solar Master — 태양광·태양열 ROI 계산기',
  alternateName: 'Solar Master — Solar PV & Thermal ROI Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/productivity/solar-master',
  description: '태양광·태양열 발전량, 절감액, 손익분기점을 지역별 일조 데이터와 한전 누진세 구조로 정밀 계산합니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '지역별 일조시간은 어떤 데이터 기준인가요?',
      acceptedAnswer: { '@type': 'Answer', text: '기상청 공공데이터 기준 도시별 연평균 최대 일조시간(피크선레이시간)을 사용합니다.' },
    },
    {
      '@type': 'Question',
      name: '여름에 발전이 더 많지 않나요?',
      acceptedAnswer: { '@type': 'Answer', text: '일조량은 여름이 많지만 패널이 뜨거워지면 효율이 떨어집니다. 온도 손실(-15%)과 월별 보정계수를 동시 반영하여 봄(4~5월)이 가장 효율이 높게 나옵니다.' },
    },
    {
      '@type': 'Question',
      name: '정부 보조금 30%는 실제로 받을 수 있나요?',
      acceptedAnswer: { '@type': 'Answer', text: '주택용 태양광 보조금은 지자체·연도별로 다릅니다. 30%는 참고용 추정치이며, 정확한 금액은 한국에너지공단 또는 해당 지자체에 확인하세요.' },
    },
    {
      '@type': 'Question',
      name: '이 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: { '@type': 'Answer', text: '본 계산 결과는 이론적 추정치로 참고용입니다. 실제 발전량은 기상·음영·시공 품질에 따라 달라집니다. 투자 결정 전 반드시 전문 시공사와 상담하세요.' },
    },
  ],
};

export default function SolarMasterPage() {
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
      <SolarMasterClient />
    </>
  );
}
