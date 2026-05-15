import type { Metadata } from 'next';
import BubblePopartClient from './BubblePopartClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '버블 팝아트 글씨 생성기 — 귀여운 팝아트 이미지 만들기 | Utility Hub'
    : 'Bubble Pop Art Text Generator | Utility Hub';
  const description = isKo
    ? '텍스트를 입력하면 둥글둥글한 버블 폰트에 멀티컬러·광택 효과가 적용된 팝아트 이미지를 PNG로 저장합니다. 매장 POP 제작, SNS 이미지, 이벤트 현수막에 활용하세요.'
    : 'Generate cute bubble-style pop art text images with multicolor, glossy highlights, and bold outlines. Download as PNG instantly — no signup required.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/design/bubble-popart`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/design/bubble-popart',
        en: 'https://www.theutilhub.com/en/utilities/design/bubble-popart',
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
  name: '버블 팝아트 글씨 생성기',
  alternateName: 'Bubble Pop Art Text Generator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'DesignApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/design/bubble-popart',
  description:
    '텍스트를 입력하면 둥글둥글한 버블 폰트에 멀티컬러·광택 효과가 적용된 팝아트 이미지를 PNG로 저장합니다. 매장 POP 제작, SNS 이미지, 이벤트 현수막에 활용하세요.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '한글도 잘 표시되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네, 한글을 완벽하게 지원합니다. Google Fonts의 Jua 폰트를 사용하며, 이 폰트는 한글 전용으로 설계된 둥글둥글한 버블 스타일 폰트입니다. 한글, 영문, 숫자, 특수문자 모두 동일한 스타일로 표현됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '다운로드한 이미지를 인쇄에 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '인쇄 용도로 사용하실 수 있습니다. 최대 1280×720px 해상도로 저장되며, 소형 인쇄물에서는 충분한 품질을 제공합니다. 대형 현수막은 출력 전 인쇄소와 확인하시기 바랍니다.',
      },
    },
    {
      '@type': 'Question',
      name: '생성한 이미지를 상업적으로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 툴로 생성한 이미지 자체는 자유롭게 사용하실 수 있습니다. 사용된 Jua 폰트는 OFL(Open Font License)로 상업적 사용이 허용됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 툴의 결과물은 참고용 이미지로 제공됩니다. 공식 인쇄물이나 중요한 디자인 작업에는 전문 디자인 툴을 사용하시거나 전문 디자이너에게 의뢰하시기 바랍니다.',
      },
    },
  ],
};

export default function BubblePopartPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BubblePopartClient />
    </>
  );
}
