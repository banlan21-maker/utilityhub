import type { Metadata } from 'next';
import BurnMessageClient from './BurnMessageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '일회용 비밀 메모 (열람 후 자동 파괴) | Utility Hub'
    : 'Burn Message - One-Time Self-Destructing Notes | Utility Hub';
  const description = isKo
    ? '한 번 열람 후 자동 파괴되는 비밀 메시지. 100% 브라우저에서만 처리, 서버 저장 없음, 1시간 자동 만료.'
    : 'Send self-destructing secret messages that vanish after one read. 100% browser-side, no server storage, 1-hour auto-expiry.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/security/burn-message`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/security/burn-message',
        en: 'https://www.theutilhub.com/en/utilities/security/burn-message',
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
  name: '일회용 비밀 메모',
  alternateName: 'Burn Message',
  operatingSystem: 'Web Browser',
  applicationCategory: 'SecurityApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/security/burn-message',
  description:
    '한 번 열람 후 자동 파괴되는 비밀 메시지. 100% 브라우저에서만 처리, 서버 저장 없음, 1시간 자동 만료.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '정말 서버에 메시지가 저장되지 않나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'URL의 해시(#) 부분은 웹 표준상 브라우저가 서버로 전송하지 않습니다. theutilhub은 정적 호스팅이라 서버에 메시지를 처리·저장하는 코드가 없으며, 압축·인코딩·복호화 모두 브라우저 안에서만 일어납니다.',
      },
    },
    {
      '@type': 'Question',
      name: '수신자가 메시지를 캡처하거나 복사하면 어떻게 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '막을 수 없습니다. 이 도구는 대화방에 민감 정보가 영구 보존되는 우발적 노출을 줄이기 위한 보조 수단이지, 의도적 보존을 차단하는 시스템이 아닙니다. 고위험 정보에는 전용 보안 솔루션을 사용하세요.',
      },
    },
    {
      '@type': 'Question',
      name: '시크릿 모드나 다른 브라우저로 열면 두 번 볼 수 있지 않나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '맞습니다. 파괴 마킹은 각 브라우저 localStorage에 저장되어 시크릿 모드·다른 브라우저는 공유되지 않습니다. 단 1시간 자동 만료는 링크 자체에 박혀 있어 어떤 환경에서든 동일하게 작동합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '본 도구는 우발적 노출을 줄이는 보조 도구이며 진짜 보안 시스템이 아닙니다. 금융·의료·법률 등 고위험 정보에는 종단간 암호화 메신저나 기업용 보안 솔루션 등 전문 시스템을 사용하시기 바랍니다.',
      },
    },
  ],
};

export default function BurnMessagePage() {
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
      <BurnMessageClient />
    </>
  );
}
