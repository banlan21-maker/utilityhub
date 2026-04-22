import type { Metadata } from 'next';
import OsmuFormatterClient from './OsmuFormatterClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? 'OSMU 콘텐츠 포맷터 | Utility Hub' : 'OSMU Content Formatter | Utility Hub';
  const description = isKo
    ? '블로그 원고 하나로 인스타그램, X(트위터), 숏폼 대본까지 자동 변환하는 무료 OSMU 포맷터'
    : 'Transform one blog post into Instagram captions, Twitter threads, and Shorts scripts instantly. Free OSMU content formatter.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/marketing/osmu-formatter`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/marketing/osmu-formatter',
        en: 'https://www.theutilhub.com/en/utilities/marketing/osmu-formatter',
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
  name: 'OSMU 콘텐츠 재가공 포맷터',
  alternateName: 'OSMU Content Formatter',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/marketing/osmu-formatter',
  description: '블로그 원고 하나로 인스타그램, X(트위터), 숏폼 대본까지 자동 변환하는 무료 OSMU 포맷터',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '데이터가 서버로 전송되나요?', acceptedAnswer: { '@type': 'Answer', text: '아니요. 모든 처리는 사용자의 브라우저에서 수행됩니다. 민감한 원고도 안심하고 작업하세요.' } },
    { '@type': 'Question', name: '줄바꿈 점(.)은 왜 추가되나요?', acceptedAnswer: { '@type': 'Answer', text: '인스타그램 앱에서 줄바꿈이 무시되는 현상을 방지하고 모바일 가독성을 극대화하기 위해 자동 삽입합니다.' } },
    { '@type': 'Question', name: 'X(트위터) 타래는 몇 자 기준인가요?', acceptedAnswer: { '@type': 'Answer', text: '한 트윗당 공백 포함 약 130~140자 내외로 문맥이 끊기지 않도록 스마트하게 분할합니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function OsmuFormatterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <OsmuFormatterClient />
    </>
  );
}
