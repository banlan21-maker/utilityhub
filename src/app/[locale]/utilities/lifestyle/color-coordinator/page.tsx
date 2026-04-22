import type { Metadata } from 'next';
import ColorCoordinatorClient from './ColorCoordinatorClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? 'OOTD 컬러 코디네이터 | Utility Hub' : 'OOTD Color Coordinator | Utility Hub';
  const description = isKo
    ? '마네킹 위에서 상의·하의·아우터 색상을 실시간 조합하고 3가지 알고리즘 룩을 제안하는 무료 패션 코디 플래너'
    : 'Combine outfit colors on a mannequin in real-time and get 3 algorithm-powered look suggestions for free.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/color-coordinator`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/color-coordinator',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/color-coordinator',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'OOTD 컬러 코디네이터',
  alternateName: 'OOTD Color Coordinator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/color-coordinator',
  description: '마네킹 위에서 상의·하의·아우터 색상을 실시간 조합하고 3가지 알고리즘 룩을 제안하는 무료 패션 코디 플래너',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '색상 팔레트는 어떻게 구성되나요?', acceptedAnswer: { '@type': 'Answer', text: '뉴트럴 4색, 웜뉴트럴 4색, 컬러 4색, 포인트 4색의 총 16색으로 구성되어 있으며, [+ Custom] 버튼으로 커스텀 색상도 추가할 수 있습니다.' } },
    { '@type': 'Question', name: '룩 알고리즘은 어떤 원리인가요?', acceptedAnswer: { '@type': 'Answer', text: '데일리는 무채색 톤 배치, 포인트는 보색(Hue +180°) 적용, 소프트는 유사색(Analogous) 조합으로 각각 색채 이론을 자동 적용합니다.' } },
    { '@type': 'Question', name: '모자와 아우터는 왜 기본 비활성인가요?', acceptedAnswer: { '@type': 'Answer', text: '모든 코디에서 필수 아이템이 아니기 때문입니다. [+ Add] 버튼으로 필요할 때 추가할 수 있습니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function ColorCoordinatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ColorCoordinatorClient />
    </>
  );
}
