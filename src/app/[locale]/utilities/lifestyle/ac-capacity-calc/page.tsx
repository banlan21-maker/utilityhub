import type { Metadata } from 'next';
import AcCapacityCalcClient from './AcCapacityCalcClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '에어컨 용량 산정기 — 평형 자동 계산 | Utility Hub'
    : 'Air Conditioner Capacity Calculator | Utility Hub';
  const description = isKo
    ? '식당·카페·사무실·아파트 등 실평수와 환경 조건 입력으로 적정 에어컨 용량(kW·평형)을 즉시 산정. 층고·업종·일사량·단열 상태 반영 상세 리포트 제공.'
    : 'Calculate the right air conditioner capacity (kW) for commercial and residential spaces. Factors in ceiling height, sun exposure, insulation, floor level, and occupancy load.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/ac-capacity-calc`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/ac-capacity-calc',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/ac-capacity-calc',
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
  name: '에어컨 용량 산정기',
  alternateName: 'Air Conditioner Capacity Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/ac-capacity-calc',
  description: '식당·카페·사무실·아파트 등 실평수와 환경 조건 입력으로 적정 에어컨 용량(kW·평형)을 즉시 산정. 층고·업종·일사량·단열 상태 반영 상세 리포트 제공.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '30평이면 30평형 에어컨을 사면 되지 않나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '아닙니다. 에어컨 \'평형\'은 단순 면적 기준이 아니라 냉방 능력(kW) 기준입니다. 실제 냉방 부하는 층고, 창문 방향, 단열 상태, 층 위치, 업종 발열, 수용 인원에 따라 크게 달라집니다. 예를 들어 오픈 천장 서향 30평 고기집은 단순 30평형보다 2배 이상 큰 용량이 필요할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '층고(천장 높이)가 왜 중요한가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '냉방 부하는 평면 면적뿐 아니라 공간의 부피(면적 × 층고)에 비례합니다. 표준 층고(2.5m)를 기준으로 계산할 때, 오픈 천장(3m 이상)인 경우 같은 평수라도 냉방해야 할 공기량이 1.2~1.5배 더 많아집니다. 최근 인기 있는 오픈 천장 카페나 복층 식당에서 에어컨이 힘을 못 쓰는 주된 이유입니다.',
      },
    },
    {
      '@type': 'Question',
      name: '고기집이나 PC방은 왜 그렇게 용량이 많이 필요한가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '고기집은 테이블마다 직화 불판을 사용하고 주방에서도 강한 화력을 씁니다. PC방은 수십~수백 대의 PC와 모니터가 지속적으로 열을 발생시킵니다. 이런 내부 발열은 에어컨이 제거해야 할 열 부하에 그대로 추가됩니다. 고기집의 경우 동일 면적 사무실 대비 최대 1.6배, PC방은 1.4배의 냉방 용량이 필요합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '결과에서 최소~최대 범위로 알려주는 이유는 무엇인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '냉방 부하 계산은 입력 조건의 정확도에 따라 실제값과 차이가 있을 수 있습니다. 최솟값은 입력 조건 그대로 산정한 이론값이며, 최댓값은 10% 안전 마진을 더한 권장값입니다. 일반적으로 최댓값 이상의 제품을 선택하는 것이 안정적인 냉방을 위해 권장됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 툴의 계산 결과는 KRAQ 기준 약식 계산법을 참고한 추정치로, 참고용으로만 제공됩니다. 실제 에어컨 용량 선정 및 설비 공사는 반드시 전문 냉동공조 업체의 현장 실사와 정밀 부하 계산을 통해 결정하시기 바랍니다.',
      },
    },
  ],
};

export default function AcCapacityCalcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AcCapacityCalcClient />
    </>
  );
}
