import type { Metadata } from 'next';
import LogoFaviconClient from './LogoFaviconClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '로고 & 파비콘 생성기 | Utility Hub'
    : 'Logo & Favicon Generator | Utility Hub';
  const description = isKo
    ? '텍스트 또는 이모지로 favicon.ico, PNG 다중 크기, Apple Touch Icon, site.webmanifest를 포함한 완전한 파비콘 패키지를 무료로 생성하는 온라인 도구입니다.'
    : 'Generate a complete favicon package — favicon.ico, multi-size PNGs, Apple Touch Icon, and site.webmanifest — free online using text or emoji.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/design/logo-favicon`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/design/logo-favicon',
        en: 'https://www.theutilhub.com/en/utilities/design/logo-favicon',
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
  name: 'AI 로고 & 파비콘 생성기',
  alternateName: 'AI Logo & Favicon Generator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/design/logo-favicon',
  description: '텍스트 또는 이모지로 favicon.ico, PNG 다중 크기, Apple Touch Icon, site.webmanifest를 포함한 완전한 파비콘 패키지를 무료로 생성하는 온라인 도구입니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'ZIP 파일에 포함된 파일들을 어디에 놓아야 하나요?',
      acceptedAnswer: { '@type': 'Answer', text: 'Next.js, React, Vue.js 프로젝트는 /public 폴더, 정적 HTML은 루트 디렉토리에 넣으세요. HTML의 <head>에 site.webmanifest 링크와 apple-touch-icon 링크를 추가하면 모든 디바이스에서 올바르게 표시됩니다. 다운로드된 ZIP에 README가 포함되어 있습니다.' },
    },
    {
      '@type': 'Question',
      name: '이 도구로 만든 로고를 상업적으로 사용해도 되나요?',
      acceptedAnswer: { '@type': 'Answer', text: '텍스트와 색상을 직접 조합해 Canvas API로 생성한 이미지이므로 저작권 문제 없이 자유롭게 상업적으로 활용하실 수 있습니다. 단, 입력한 이모지의 경우 플랫폼별 이모지 디자인의 저작권에 주의하세요.' },
    },
    {
      '@type': 'Question',
      name: '고해상도 로고(SVG 또는 1024px 이상 PNG)도 가능한가요?',
      acceptedAnswer: { '@type': 'Answer', text: '현재 최대 512×512 PNG를 제공합니다. SVG 포맷은 추후 업데이트 예정입니다. 대형 인쇄용 로고가 필요하다면 생성된 PNG를 벡터 변환 도구(예: Vectorizer.ai)를 통해 SVG로 변환하는 것을 권장합니다.' },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
    },
  ],
};

export default function LogoFaviconPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <LogoFaviconClient />
    </>
  );
}
