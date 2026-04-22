import type { Metadata } from 'next';
import ColorPaletteClient from './ColorPaletteClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '색상 대비 검사기 & WCAG 팔레트 | Utility Hub'
    : 'Color Contrast Checker & WCAG Palette | Utility Hub';
  const description = isKo
    ? '두 색상 간의 명도 대비를 WCAG 2.1 기준으로 계산하고 AA/AAA 합격 여부와 트렌딩 팔레트를 제공하는 웹 접근성 색상 검사 도구입니다.'
    : 'Calculate luminance contrast ratio between two colors per WCAG 2.1 and instantly check AA/AAA pass/fail with trending palettes.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/design/color-palette`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/design/color-palette',
        en: 'https://www.theutilhub.com/en/utilities/design/color-palette',
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
  name: '색상 대비 검사기 & WCAG 팔레트',
  alternateName: 'Color Contrast Checker & WCAG Palette',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/design/color-palette',
  description: '두 색상 간의 명도 대비를 WCAG 2.1 기준으로 계산하고 AA/AAA 합격 여부와 트렌딩 팔레트를 제공하는 웹 접근성 색상 검사 도구입니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'WCAG AA와 AAA 기준의 차이는 무엇인가요?',
      acceptedAnswer: { '@type': 'Answer', text: 'AA는 대부분의 웹사이트에서 요구되는 최소 기준입니다. 일반 텍스트 4.5:1, 큰 텍스트 3:1 이상이 필요합니다. AAA는 더 엄격한 향상된 기준으로, 일반 텍스트 7:1, 큰 텍스트 4.5:1이 필요합니다. 대부분의 프로젝트는 AA 충족을 목표로 합니다.' },
    },
    {
      '@type': 'Question',
      name: '색맹 사용자를 위한 색상 선택 팁이 있나요?',
      acceptedAnswer: { '@type': 'Answer', text: '빨강-초록(적록색맹)과 파랑-노랑(청황색맹) 조합은 피하세요. 색상만으로 정보를 전달하지 말고 아이콘, 패턴, 텍스트를 함께 사용하세요. 대비비 4.5:1 이상을 유지하면 색맹 사용자에게도 대부분 읽기 쉽습니다.' },
    },
    {
      '@type': 'Question',
      name: 'HEX 코드 없이 색상을 입력할 수 있나요?',
      acceptedAnswer: { '@type': 'Answer', text: '현재는 HEX 코드 입력과 색상 피커를 지원합니다. rgb(255,255,255) 형식은 직접 지원하지 않으므로, RGB to HEX 변환 후 입력하거나 색상 피커를 사용하세요.' },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
    },
  ],
};

export default function ColorPalettePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ColorPaletteClient />
    </>
  );
}
