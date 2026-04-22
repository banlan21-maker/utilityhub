import type { Metadata } from 'next';
import ShortUrlClient from './ShortUrlClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '단축 URL 생성기 | Utility Hub' : 'URL Shortener | Utility Hub';
  const description = isKo
    ? '긴 URL을 짧고 공유하기 쉬운 링크로 즉시 변환하세요. 무료·무제한·로그인 불필요'
    : 'Instantly shorten long URLs into clean, shareable links. Free, unlimited, no login required.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/marketing/shorturl`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/marketing/shorturl',
        en: 'https://www.theutilhub.com/en/utilities/marketing/shorturl',
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
  name: 'URL 단축기',
  alternateName: 'URL Shortener',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/marketing/shorturl',
  description: '긴 URL을 짧고 공유하기 쉬운 링크로 즉시 변환하세요. 무료·무제한·로그인 불필요',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '단축된 URL은 얼마나 오래 유지되나요?', acceptedAnswer: { '@type': 'Answer', text: '영구적으로 유지됩니다. 단, 불법적인 용도로 사용되거나 신고가 접수될 경우 차단될 수 있습니다.' } },
    { '@type': 'Question', name: '변환 기록은 안전한가요?', acceptedAnswer: { '@type': 'Answer', text: '기록은 브라우저(LocalStorage)에만 저장되어 외부로 절대 전송되지 않습니다. 안심하고 사용하세요.' } },
    { '@type': 'Question', name: '무료인가요?', acceptedAnswer: { '@type': 'Answer', text: '네, 비용이나 횟수 제한 없이 100% 무료로 무제한 이용 가능합니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function ShortUrlPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ShortUrlClient />
    </>
  );
}
