import type { Metadata } from 'next';
import CarbonFootprintClient from './CarbonFootprintClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '웹사이트 탄소 발자국 계산기 | Utility Hub'
    : 'Website Carbon Footprint Calculator | Utility Hub';
  const description = isKo
    ? '내 웹사이트가 연간 배출하는 CO₂를 계산하고 나무 몇 그루와 같은지 확인하세요. 페이지 크기와 방문자 수 입력만으로 즉시 계산.'
    : 'Calculate how much CO₂ your website emits per year. Enter your page size and monthly visitors to get your carbon footprint and tree equivalent instantly.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/performance/carbon-footprint`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/performance/carbon-footprint',
        en: 'https://www.theutilhub.com/en/utilities/performance/carbon-footprint',
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
  name: '웹사이트 탄소 발자국 계산기',
  alternateName: 'Website Carbon Footprint Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/performance/carbon-footprint',
  description:
    '내 웹사이트가 연간 배출하는 CO₂를 계산하고 나무 몇 그루와 같은지 확인하세요. 페이지 크기와 방문자 수 입력만으로 즉시 계산.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '계산 결과가 실제 배출량과 정확히 일치하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 계산기는 websitecarbon.com의 공식 방법론을 기반으로 하며, 데이터 전송량 기반의 추정치를 제공합니다. 실제 배출량은 서버 위치, 사용자 기기 종류, 네트워크 환경에 따라 다를 수 있습니다. 등급(A+~D)은 업계 평균 데이터를 참고한 자체 기준이며, 공식 탄소 감사가 필요한 경우 전문 기관의 측정을 권장합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '그린 호스팅을 사용하면 탄소 배출이 얼마나 줄어드나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '재생에너지 기반 그린 호스팅은 일반 전력망 대비 CO₂ 배출계수가 약 94% 낮습니다. (일반: 0.494kg/kWh vs 재생에너지: 0.031kg/kWh) 이 계산기에서 호스팅 유형을 변경하면 실시간으로 그 차이를 확인할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '페이지 크기는 어디서 확인하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '크롬 브라우저에서 F12(개발자 도구)를 열고 Network 탭을 선택한 뒤, 측정할 페이지를 새로고침하면 하단에 총 전송량이 표시됩니다. 또는 Google PageSpeed Insights, GTmetrix에서도 페이지 크기를 확인할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '전력 소비 기준(1.805 kWh/GB)은 어떤 근거인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '본 계산기는 데이터 전송 1GB당 1.805kWh를 소비한다는 보수적인 산정 기준을 적용하고 있습니다. 이는 websitecarbon.com의 공식 방법론에서 채택한 수치로, 최신 Sustainable Web Design(SWD) v3 모델에서는 약 0.81 kWh/GB로 더 낮은 기준을 제시하고 있어 실제 배출량은 더 낮을 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 탄소 배출량 측정은 전문가 또는 공인 기관의 공식 측정을 통해 확인하시기 바랍니다.',
      },
    },
  ],
};

export default function CarbonFootprintPage() {
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
      <CarbonFootprintClient />
    </>
  );
}
