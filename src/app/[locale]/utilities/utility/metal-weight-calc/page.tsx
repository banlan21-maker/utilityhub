import type { Metadata } from 'next';
import MetalWeightCalcClient from './MetalWeightCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '금속 중량 & 면적 계산기 — 철강재·H빔·파이프 견적 산출 | Utility Hub'
    : 'Metal Weight & Area Calculator | Utility Hub';
  const description = isKo
    ? 'H빔, 파이프, 판재 등 11가지 금속 형상의 중량, 도장 면적, 예상 단가를 실시간 계산. 19종 재질 밀도 제공 및 커스텀 추가. 견적 바구니로 즉시 발주서 작성.'
    : 'Calculate weight, paint area, and estimated cost for 11 metal shapes including H-beam, pipe, and plate. 19 material densities with custom material support.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/metal-weight-calc`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/utility/metal-weight-calc',
        en: 'https://www.theutilhub.com/en/utilities/utility/metal-weight-calc',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '금속 중량 & 면적 계산기',
  alternateName: 'Metal Weight & Area Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/metal-weight-calc',
  description: 'H빔, 파이프, 판재 등 11가지 금속 형상의 중량, 도장 면적, 예상 단가를 실시간 계산. 19종 재질 밀도 제공 및 커스텀 추가.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '커스텀 재질은 어떻게 저장되나요?', acceptedAnswer: { '@type': 'Answer', text: '커스텀 재질은 사용자의 브라우저 로컬 저장소(localStorage)에 저장됩니다. 같은 기기·같은 브라우저에서 다음 방문 시에도 저장한 재질을 그대로 사용할 수 있습니다. 다른 기기나 브라우저 데이터를 초기화하면 삭제됩니다.' } },
    { '@type': 'Question', name: '도장 면적 계산 기준이 형상마다 다른가요?', acceptedAnswer: { '@type': 'Answer', text: '네, 형상 특성에 맞게 다르게 적용됩니다. 파이프는 외경 둘레만, 판재는 넓은 양면만(절단면 제외), 나머지 형강류는 단면 전체 둘레를 기준으로 계산합니다.' } },
    { '@type': 'Question', name: 'KS 규격 프리셋이 없는 형상은 어떻게 입력하나요?', acceptedAnswer: { '@type': 'Answer', text: 'H빔·채널·앵글 외의 형상은 KS 규격 드롭다운 없이 치수를 직접 입력합니다. 파이프의 경우 외경(D)과 벽두께(t)를 mm 단위로 입력하면 됩니다.' } },
    { '@type': 'Question', name: '견적 바구니에 담은 항목을 수정할 수 있나요?', acceptedAnswer: { '@type': 'Answer', text: '현재 버전에서는 담긴 항목의 직접 수정은 지원하지 않습니다. 항목을 삭제한 뒤 치수를 수정하여 다시 바구니에 담는 방식으로 사용하세요.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 발주 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 현장 참고용으로만 제공됩니다. 실제 발주 시에는 반드시 제조사 규격표와 현장 실측값을 기준으로 최종 확인하시기 바랍니다.' } },
  ],
};

export default function MetalWeightCalcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MetalWeightCalcClient />
    </>
  );
}
