import type { Metadata } from 'next';
import PrivacyMaskingClient from './PrivacyMaskingClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '개인정보 마스킹 도구 | Utility Hub'
    : 'Personal Data Masking Tool | Utility Hub';
  const description = isKo
    ? '이메일, 전화번호, 주민번호, 신용카드, IP 등 개인정보를 텍스트에서 자동 검출하고 마스킹. 100% 브라우저 로컬 처리.'
    : 'Automatically detect and mask personal data (email, phone, SSN, credit card, IP) in text. 100% local browser processing, no server upload.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/security/privacy-masking`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/security/privacy-masking',
        en: 'https://www.theutilhub.com/en/utilities/security/privacy-masking',
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
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "개인정보 마스킹 도구",
  "alternateName": "Personal Data Masking Tool",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/security/privacy-masking",
  "description": "텍스트 내 이메일, 전화번호, 주민번호, 신용카드 번호, IP 주소, 한국 이름 등 민감한 개인정보를 자동으로 검출하고 별표(*)로 마스킹하는 온라인 비식별화 도구입니다. 모든 처리는 브라우저에서만 이루어져 서버에 데이터가 전송되지 않습니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "입력한 텍스트가 서버로 전송되나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "전혀 그렇지 않습니다. 이 개인정보 마스킹 도구는 100% 클라이언트 사이드(브라우저)에서만 동작하며, 입력한 텍스트는 어떠한 서버에도 전송되지 않습니다. 완전히 오프라인 환경에서도 사용할 수 있습니다." }
    },
    {
      "@type": "Question",
      "name": "마스킹 규칙을 부분적으로만 적용할 수 있나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "네. 왼쪽 패널의 체크박스에서 원하는 규칙만 선택하면 됩니다. 예를 들어 이메일만 마스킹하고 전화번호는 그대로 두고 싶다면 이메일 규칙만 체크하세요." }
    },
    {
      "@type": "Question",
      "name": "한국 이름 마스킹이 일부 단어를 잘못 처리합니다",
      "acceptedAnswer": { "@type": "Answer", "text": "한국 이름 마스킹은 2~3글자 한글을 패턴으로 인식하므로, 일반 한국어 단어와 구분이 어려울 수 있습니다. 이름이 포함된 텍스트는 결과를 꼭 검토 후 사용하세요." }
    },
    {
      "@type": "Question",
      "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." }
    }
  ]
};

export default function PrivacyMaskingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PrivacyMaskingClient />
    </>
  );
}
