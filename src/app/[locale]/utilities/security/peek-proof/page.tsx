import type { Metadata } from 'next';
import PeekProofClient from './PeekProofClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '어깨너머 시선 차단 에디터 | Utility Hub'
    : 'Peek-Proof Editor - Shield Text From Over-the-Shoulder Eyes | Utility Hub';
  const description = isKo
    ? '카페·지하철·사무실에서 어깨너머 시선으로부터 글을 보호하세요. 커서가 있는 줄만 선명하게, 나머지는 모두 흐려집니다. 100% 브라우저 처리.'
    : 'Protect your text from over-the-shoulder peeking in cafes, subways, and offices. Only the cursor line stays sharp; everything else blurs. 100% browser-side.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/security/peek-proof`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/security/peek-proof',
        en: 'https://www.theutilhub.com/en/utilities/security/peek-proof',
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
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '어깨너머 시선 차단 에디터',
  alternateName: 'Peek-Proof Editor',
  operatingSystem: 'Web Browser',
  applicationCategory: 'SecurityApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/security/peek-proof',
  description:
    '카페·지하철·사무실에서 어깨너머 시선으로부터 글을 보호하세요. 커서가 있는 줄만 선명하게, 나머지는 모두 흐려집니다. 100% 브라우저 처리.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '입력한 글이 서버로 전송되거나 저장되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '아닙니다. 이 도구는 100% 사용자 브라우저 안에서만 작동합니다. theutilhub은 정적 호스팅 사이트라 입력한 글을 받거나 저장하는 서버 코드 자체가 없으며, 흐림 처리·커서 추적 모든 과정이 사용자 기기 안에서만 일어납니다. 새로고침하면 내용은 사라집니다.',
      },
    },
    {
      '@type': 'Question',
      name: '한글을 입력해도 글자가 깨지지 않나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '깨지지 않습니다. 입력은 브라우저 네이티브 textarea가 처리하고 시각 효과는 별도 레이어가 미러링하는 가상 거울 구조라, 한글 입력 시 자모 분리 문제 없이 자연스럽게 타이핑 가능합니다. IME 조합 가드를 적용해 조합 중에는 화면 갱신을 미룹니다.',
      },
    },
    {
      '@type': 'Question',
      name: '옆 사람이 빠르게 다가올 때 한 번에 가릴 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ESC 키를 누르거나 우측 상단 눈 버튼을 클릭하면 커서 줄을 포함한 모든 줄이 즉시 강하게 흐려지는 패닉 모드가 켜집니다. 다시 누르면 해제됩니다. 누가 화면을 보려고 다가올 때 한 동작으로 전체를 가릴 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴로 화면 캡처나 정밀 촬영까지 막을 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '막을 수 없습니다. 이 도구는 일상적인 어깨너머 시선으로부터 우발적 노출을 줄이는 보조 수단이며, 카메라 촬영이나 화면 녹화를 차단하는 시스템이 아닙니다. 금융·의료·법률 등 고위험 정보에는 전용 보안 환경을 사용하시기 바랍니다.',
      },
    },
  ],
};

export default function PeekProofPage() {
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
      <PeekProofClient />
    </>
  );
}
