import type { Metadata } from 'next';
import FontPreviewClient from './FontPreviewClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '다국어 폰트 비교기 | Utility Hub'
    : 'Multilingual Font Comparator | Utility Hub';
  const description = isKo
    ? '영문 폰트와 한국어 폰트를 나란히 미리보고 CSS 코드를 한 번에 복사할 수 있는 온라인 구글 폰트 탐색 도구입니다.'
    : 'Preview English and Korean Google Fonts side by side and copy CSS code in one click. Find the perfect font pairing instantly.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/design/font-preview`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/design/font-preview',
        en: 'https://www.theutilhub.com/en/utilities/design/font-preview',
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
  name: '다국어 폰트 비교기',
  alternateName: 'Multilingual Font Comparator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/design/font-preview',
  description: '영문 폰트와 한국어 폰트를 나란히 미리보고 CSS 코드를 한 번에 복사할 수 있는 온라인 구글 폰트 탐색 도구입니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '구글 폰트는 무료로 사용할 수 있나요?',
      acceptedAnswer: { '@type': 'Answer', text: '네. Google Fonts에 등록된 모든 폰트는 SIL Open Font License 또는 Apache License로 제공되어 개인·상업적 용도 모두 무료로 사용할 수 있습니다. 별도 저작권 표기도 필요하지 않습니다.' },
    },
    {
      '@type': 'Question',
      name: '폰트를 불러오는 속도가 너무 느립니다',
      acceptedAnswer: { '@type': 'Answer', text: '이 도구는 IntersectionObserver를 이용해 화면에 보이는 카드의 폰트만 레이지 로드합니다. 한 번 로드된 폰트는 캐시되어 재방문 시 즉시 표시됩니다. 느린 경우 브라우저 캐시를 지우거나 네트워크 환경을 확인하세요.' },
    },
    {
      '@type': 'Question',
      name: '눈누(NoonNU) 폰트도 지원되나요?',
      acceptedAnswer: { '@type': 'Answer', text: '현재는 Google Fonts를 통해 제공되는 한국어 폰트를 지원합니다. 눈누 전용 폰트는 향후 업데이트에서 추가할 예정입니다. 필요한 폰트가 있으면 피드백 게시판에 남겨주세요.' },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
    },
  ],
};

export default function FontPreviewPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <FontPreviewClient />
    </>
  );
}
