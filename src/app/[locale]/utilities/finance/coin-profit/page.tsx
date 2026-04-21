import type { Metadata } from 'next';
import CoinProfitClient from './CoinProfitClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '코인 수익률 계산기 | Utility Hub'
    : 'Crypto Profit Calculator | Utility Hub';
  const description = isKo
    ? 'CoinGecko 실시간 시세로 비트코인·이더리움 등 50개 코인의 매수가 대비 수익률과 손익을 즉시 계산하세요.'
    : 'Calculate crypto profit and loss in real time using CoinGecko live prices. Supports BTC, ETH, XRP, SOL and 50+ coins.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/finance/coin-profit`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/finance/coin-profit',
        en: 'https://www.theutilhub.com/en/utilities/finance/coin-profit',
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
  name: '코인 수익률 계산기',
  alternateName: 'Crypto Profit Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/finance/coin-profit',
  description: 'CoinGecko 실시간 API를 통해 비트코인·이더리움 등 주요 암호화폐의 매수가 대비 현재 수익률과 손익 금액을 즉시 계산하는 무료 도구입니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '코인 가격은 실시간으로 업데이트되나요?',
      acceptedAnswer: { '@type': 'Answer', text: '네. CoinGecko API를 통해 실시간 시세를 가져오며, 새로 고침 버튼을 누르거나 코인을 다시 선택하면 최신 가격으로 업데이트됩니다. 30초 이내의 캐시가 적용되어 API 호출을 최소화합니다.' },
    },
    {
      '@type': 'Question',
      name: '어떤 코인을 지원하나요?',
      acceptedAnswer: { '@type': 'Answer', text: 'CoinGecko 시가총액 상위 코인 목록을 지원합니다. 비트코인(BTC), 이더리움(ETH), 리플(XRP), 솔라나(SOL), 도지코인(DOGE) 등 주요 알트코인을 포함한 50개 암호화폐를 이름 또는 심볼로 검색할 수 있습니다.' },
    },
    {
      '@type': 'Question',
      name: 'KRW와 USD 중 어떤 기준으로 계산하나요?',
      acceptedAnswer: { '@type': 'Answer', text: '상단 기준 통화 버튼에서 KRW(원화) 또는 USD(달러) 중 원하는 통화를 선택할 수 있습니다. 선택한 통화 기준으로 코인 목록과 현재가가 모두 표시됩니다.' },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
    },
  ],
};

export default function CoinProfitPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <CoinProfitClient />
    </>
  );
}
