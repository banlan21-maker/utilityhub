import type { Metadata } from 'next';
import HashtagGeneratorClient from './HashtagGeneratorClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '해시태그 생성기 | Utility Hub' : 'Hashtag Generator | Utility Hub';
  const description = isKo
    ? '키워드 하나로 인스타그램·유튜브 인기 해시태그 30개를 즉시 생성하는 무료 SNS 마케팅 도구'
    : 'Generate 30 optimized hashtags for Instagram or YouTube instantly from a single keyword. Free SNS marketing tool.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/marketing/hashtag-generator`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/marketing/hashtag-generator',
        en: 'https://www.theutilhub.com/en/utilities/marketing/hashtag-generator',
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
  name: '해시태그 생성기',
  alternateName: 'Hashtag Generator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/marketing/hashtag-generator',
  description: '키워드 하나로 인스타그램·유튜브 인기 해시태그 30개를 즉시 생성하는 무료 도구',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '해시태그는 인스타그램에 몇 개까지 쓸 수 있나요?', acceptedAnswer: { '@type': 'Answer', text: '인스타그램은 게시물당 최대 30개의 해시태그를 허용합니다. 알고리즘 연구에 따르면 3~15개의 연관성 높은 해시태그가 30개를 무작위로 사용하는 것보다 도달률이 높은 경우가 많습니다. 생성된 30개 중 콘텐츠와 가장 관련 있는 태그를 선별해서 사용하세요.' } },
    { '@type': 'Question', name: '유튜브 해시태그는 몇 개가 적당한가요?', acceptedAnswer: { '@type': 'Answer', text: '유튜브는 제목 위에 표시되는 해시태그를 3개까지 지원하며, 설명란에는 15개 이내가 권장됩니다. 15개를 초과하면 유튜브가 모든 해시태그를 무시할 수 있으므로 생성된 태그 중 가장 연관성 높은 5~10개를 선별하여 사용하는 것이 좋습니다.' } },
    { '@type': 'Question', name: '키워드 데이터는 어디서 가져오나요?', acceptedAnswer: { '@type': 'Answer', text: '이 도구는 각 카테고리별 실제 인기 해시태그 데이터베이스를 내장하고 있습니다. 맛집, 카페, 여행, 뷰티, 패션, 운동, 요리, 반려동물, 재테크, 인테리어 등 15개 이상의 주요 카테고리를 지원하며, 등록되지 않은 키워드는 자동 유추 알고리즘으로 관련 태그를 생성합니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function HashtagGeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HashtagGeneratorClient />
    </>
  );
}
