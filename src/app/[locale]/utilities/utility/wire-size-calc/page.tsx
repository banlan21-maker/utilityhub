import type { Metadata } from 'next';
import WireSizeCalcClient from './WireSizeCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '전선 굵기 산정 계산기 (SQ 계산기) | Utility Hub'
    : 'Wire Size Calculator (SQ Calculator) | Utility Hub';
  const description = isKo
    ? 'KEC 실무 표준 공식 적용. 전류·용량·배선 거리 입력으로 적합한 전선 SQ 규격 즉시 산정. 단상 2선식·3선식, 삼상 3선식·4선식 전압강하 K 상수 자동 적용.'
    : 'Calculate the right wire size (SQ) for electrical installations using KEC standard formulas. Supports single-phase and three-phase systems with proper voltage drop constants.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/wire-size-calc`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/utility/wire-size-calc',
        en: 'https://www.theutilhub.com/en/utilities/utility/wire-size-calc',
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
  name: '전선 굵기 산정 계산기',
  alternateName: 'Wire Size Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/wire-size-calc',
  description:
    'KEC 실무 표준 공식 적용. 전류·용량·배선 거리 입력으로 적합한 전선 SQ 규격 즉시 산정. 단상 2선식·3선식, 삼상 3선식·4선식 전압강하 K 상수 자동 적용.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '전압강하 계산에서 K 상수가 무엇인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'K 상수는 KEC 실무에서 사용하는 전압강하 공식 상수로, 온도 상승에 따른 전선 저항 증가를 반영한 값입니다. 단상 2선식은 35.6, 삼상 3선식은 30.8, 단상 3선식·삼상 4선식은 17.8을 적용합니다. 이 계산기는 전압 유형 선택에 따라 K 상수를 자동으로 분기합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '삼상 4선식 380V에서 전압강하 기준이 220V인 이유는?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '삼상 4선식 회로에서는 각 상이 중성선과 함께 독립적으로 부하에 전력을 공급합니다. 각 상의 전압강하는 선간전압(380V)이 아닌 상전압(220V)을 기준으로 계산해야 KEC 실무 기준에 맞습니다. 380V 기준으로 계산하면 전선 굵기가 지나치게 굵게 산출됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '허용전류 기준과 전압강하 기준 중 어느 게 더 중요한가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '두 기준 모두 반드시 만족해야 합니다. 허용전류 기준은 전선의 과열 및 화재 방지를 위한 안전 기준이고, 전압강하 기준은 장비의 정상 작동을 위한 성능 기준입니다. 배선 거리가 짧으면 허용전류가, 길어질수록 전압강하가 결정 요인이 됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '결과의 허용전류가 실제 현장과 다를 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네, 반드시 확인이 필요합니다. 본 계산기의 허용전류는 KEC 규정 기준 공기 중 단심 노출 조건을 기준으로 한 약식 계산입니다. 전선관 매입, 다조 포설 등 실제 공사방법(KEC 공사방법 A~F) 및 주위 온도에 따라 허용전류가 30% 이상 감소할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 실제 시공 시에는 반드시 KEC(한국전기설비규정), 설계도서, 감리 지침을 기준으로 확인하시기 바랍니다.',
      },
    },
  ],
};

export default function WireSizeCalcPage() {
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
      <WireSizeCalcClient />
    </>
  );
}
