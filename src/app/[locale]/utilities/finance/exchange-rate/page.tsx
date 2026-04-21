import type { Metadata } from 'next';
import ExchangeRateClient from './ExchangeRateClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '실시간 환율 계산기 | Utility Hub'
    : 'Real-Time Currency Exchange Calculator | Utility Hub';
  const description = isKo
    ? 'ECB 기반 실시간 환율로 20개 통화를 즉시 변환. 30일 차트와 함께 환전 타이밍을 확인하세요.'
    : 'Convert 20+ currencies with live ECB-based rates. Includes 30-day trend chart for smart exchange timing.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/finance/exchange-rate`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/finance/exchange-rate',
        en: 'https://www.theutilhub.com/en/utilities/finance/exchange-rate',
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
  name: '실시간 환율 계산기',
  alternateName: 'Real-Time Currency Exchange Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/finance/exchange-rate',
  description: 'ECB 기반 Frankfurter API를 사용해 20개 이상 통화를 실시간 환율로 변환하고 30일 차트를 제공하는 무료 환율 계산기입니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '환율 데이터는 어디서 가져오나요?',
      acceptedAnswer: { '@type': 'Answer', text: '본 계산기는 유럽중앙은행(ECB) 공식 환율을 기반으로 한 Frankfurter API를 사용합니다. 매 영업일 업데이트되며, 주말과 공휴일에는 마지막 영업일의 환율이 표시됩니다.' },
    },
    {
      '@type': 'Question',
      name: '실제 은행 환전 시 이 환율과 동일한가요?',
      acceptedAnswer: { '@type': 'Answer', text: '아닙니다. 본 계산기는 기준 환율(중간값)을 제공하며, 실제 은행이나 환전소는 매매기준율에 수수료를 가산한 현찰 살 때/팔 때 환율을 적용합니다. 보통 기준 환율 대비 1~3% 정도 차이가 발생할 수 있습니다.' },
    },
    {
      '@type': 'Question',
      name: '환율이 유리할 때는 언제인가요?',
      acceptedAnswer: { '@type': 'Answer', text: '일반적으로 해외여행이나 직구 시 원화 가치가 높아(환율 하락) 적은 원화로 많은 외화를 살 수 있을 때 유리하고, 해외 수입이나 외화 자산 매도 시에는 환율이 높을 때 유리합니다. 30일 차트에서 환율 저점을 참고하세요.' },
    },
    {
      '@type': 'Question',
      name: '여러 통화를 동시에 비교할 수 있나요?',
      acceptedAnswer: { '@type': 'Answer', text: '현재 버전은 1:1 통화 쌍 비교를 지원합니다. 여러 통화를 비교하려면 출발 통화를 고정하고 도착 통화를 바꿔가며 각각 계산하거나, 별도의 메모로 기록하여 비교하는 방법을 권장합니다.' },
    },
  ],
};

export default function ExchangeRatePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ExchangeRateClient />
    </>
  );
}
