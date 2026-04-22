import type { Metadata } from 'next';
import KecGroundingClient from './KecGroundingClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? 'KEC 접지선 굵기 계산기 | Utility Hub' : 'KEC Grounding Conductor Calculator | Utility Hub';
  const description = isKo
    ? '한국전기설비규정(KEC) 143조 기준으로 보호접지도체 최소 단면적을 자동 계산하는 전기 설계 전문가용 무료 온라인 도구입니다.'
    : 'Free online tool for electrical engineers to calculate the minimum protective earthing conductor size per KEC Article 143.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/dev/kec-grounding`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/dev/kec-grounding',
        en: 'https://www.theutilhub.com/en/utilities/dev/kec-grounding',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KEC 접지선 굵기 계산기',
  alternateName: 'KEC Grounding Conductor Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/dev/kec-grounding',
  description: '한국전기설비규정(KEC) 143조 기준으로 접지선 최소 단면적을 자동 계산하는 전기 설계 전문가용 무료 온라인 도구입니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'KEC 143조 접지선 굵기 기준이란 무엇인가요?', acceptedAnswer: { '@type': 'Answer', text: '한국전기설비규정(KEC) 143조는 보호접지도체의 최소 단면적을 규정합니다. 상 도체 단면적 S가 16㎟ 이하이면 접지선 = S, 16~35㎟ 이면 접지선 = 16㎟, 35㎟ 초과이면 접지선 = S/2로 선정합니다.' } },
    { '@type': 'Question', name: '열 단락 계산법(방법 B)은 언제 사용하나요?', acceptedAnswer: { '@type': 'Answer', text: '단락전류 크기와 차단 시간을 알고 있을 때, S = √(I²×t)/k 공식으로 접지선 굵기를 정밀 계산합니다. 고장전류가 크거나 차단 시간이 긴 특수 환경에서 방법 A보다 더 작은 단면적을 선정할 수 있어 경제적입니다.' } },
    { '@type': 'Question', name: 'k값은 어떻게 결정하나요?', acceptedAnswer: { '@type': 'Answer', text: 'k값은 도체 재질(구리/알루미늄)과 절연 종류(PVC/XLPE)에 따라 다릅니다. Cu/PVC=115, Cu/XLPE=143, Al/PVC=76, Al/XLPE=94를 사용하며, 본 도구에서 드롭다운으로 선택할 수 있습니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function KecGroundingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <KecGroundingClient />
    </>
  );
}
