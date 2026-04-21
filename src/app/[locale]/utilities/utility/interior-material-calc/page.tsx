import type { Metadata } from 'next';
import InteriorMaterialCalcClient from './InteriorMaterialCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '타일 및 도배지 로스율 산출기 — 소요량 자동 계산 | Utility Hub'
    : 'Tile & Wallpaper Material Calculator | Utility Hub';
  const description = isKo
    ? '인테리어 타일 및 도배지 시공 시 낭비되는 로스율(Loss)을 반영한 정확한 자재 소요량(박스/롤)을 시각적 격자 그래픽과 함께 산출합니다.'
    : 'Calculate exact tile and wallpaper quantities with loss rate included. Visual grid shows cut tiles. Supports staggered patterns and wallpaper roll optimization.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/interior-material-calc`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/utility/interior-material-calc',
        en: 'https://www.theutilhub.com/en/utilities/utility/interior-material-calc',
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
  name: '타일 및 도배지 로스율 산출기',
  alternateName: 'Tile & Wallpaper Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/interior-material-calc',
  description:
    '인테리어 타일 및 도배지 시공 시 낭비되는 로스율(Loss)을 반영한 정확한 자재 소요량(박스/롤)을 시각적 격자 그래픽과 함께 산출합니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '무늬가 있는 타일/벽지는 왜 더 많이 필요한가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '무늬(패턴)가 있는 자재는 인접한 폭이나 장 사이에 패턴을 맞춰야 합니다. 이 과정에서 패턴이 맞을 때까지 자재를 밀거나 잘라야 하므로 추가 손실이 발생합니다. 타일의 경우 지그재그 패턴 시 끝단 반장 컷팅 로스 약 5%가 추가되고, 도배지의 경우 패턴 반복 간격(0.5~0.6m)만큼 1폭당 재단 길이가 늘어나 롤에서 뽑을 수 있는 폭 수가 줄어듭니다.',
      },
    },
    {
      '@type': 'Question',
      name: '로스율은 보통 몇 %를 잡아야 하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '일반적으로 타일은 정자 붙이기 기준 10%, 지그재그(브릭) 패턴은 약 15.5%를 권장합니다. 도배지는 단색 기준 약 10~15%, 무늬 있는 벽지는 패턴 반복 간격에 따라 20~30%까지 로스가 발생할 수 있습니다. 이 계산기는 타일 10% + 패턴 로스를 자동으로 반영합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '지그재그(브릭) 시공은 왜 로스가 더 발생하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '지그재그 패턴은 홀수 행마다 타일을 절반씩 오프셋하여 배치합니다. 이로 인해 시공 면적의 왼쪽·오른쪽 끝부분에 타일의 절반만 필요한 구간이 생기는데, 나머지 절반은 버려집니다. 특히 행 수가 많을수록 이 자투리 수량이 누적되어 정자 붙이기 대비 약 5%의 추가 로스가 발생합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '개구부(창문, 문) 면적은 어떻게 처리하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 계산기는 개구부 면적을 별도로 차감하지 않습니다. 창문·문을 포함한 전체 둘레나 면적을 그대로 입력하시면, 개구부 부분의 자재가 여유분으로 확보되는 방식입니다. 이는 시공 중 예기치 못한 파손이나 재단 실수에 대비한 보수적인 계산 방식이며, 실제 현장에서도 여유 있게 주문하는 것이 일반적입니다.',
      },
    },
  ],
};

export default function InteriorMaterialCalcPage() {
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
      <InteriorMaterialCalcClient />
    </>
  );
}
