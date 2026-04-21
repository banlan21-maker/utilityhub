import type { Metadata } from 'next';
import PasswordGeneratorClient from './PasswordGeneratorClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '비밀번호 생성기 & 해킹 소요 시간 계산기 | Utility Hub'
    : 'Password Generator & Crack Time Estimator | Utility Hub';
  const description = isKo
    ? '암호학적으로 안전한 난수로 강력한 비밀번호를 즉시 생성. 엔트로피 기반 해킹 소요 시간 시각화. 100% 브라우저 로컬 처리.'
    : 'Instantly generate strong passwords using cryptographically secure randomness. Visualize crack time based on entropy. 100% local browser processing.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/security/password-generator`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/security/password-generator',
        en: 'https://www.theutilhub.com/en/utilities/security/password-generator',
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
  "name": "비밀번호 생성기 & 해킹 소요 시간 계산기",
  "alternateName": "Password Generator & Crack Time Estimator",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/security/password-generator",
  "description": "암호학적으로 안전한 난수(crypto.getRandomValues)를 사용해 강력한 비밀번호를 즉시 생성하고, 엔트로피 기반으로 해킹 소요 시간을 시각적으로 표시하는 온라인 도구입니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "얼마나 긴 비밀번호가 안전한가요?",
      "acceptedAnswer": { "@type": "Answer", "text": "대소문자+숫자+특수문자 조합 기준으로 12자는 수천 년, 16자는 수조 년 이상이 걸립니다. 현실적으로 최소 12자 이상, 중요 계정은 16~20자를 권장합니다. 길이가 1자 늘 때마다 해킹 시간은 기하급수적으로 증가합니다." }
    },
    {
      "@type": "Question",
      "name": "생성된 비밀번호가 서버에 저장되나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "절대 그렇지 않습니다. 비밀번호 생성은 브라우저의 crypto.getRandomValues API를 사용하며, 서버와의 통신이 전혀 없습니다. 생성된 비밀번호는 서버 어디에도 남지 않습니다." }
    },
    {
      "@type": "Question",
      "name": "같은 옵션으로 생성하면 같은 비밀번호가 나오나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "아니요. crypto.getRandomValues는 매번 다른 암호학적 난수를 사용하므로 같은 설정으로도 매번 완전히 다른 비밀번호가 생성됩니다. 패턴을 예측하는 것이 불가능합니다." }
    },
    {
      "@type": "Question",
      "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." }
    }
  ]
};

export default function PasswordGeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PasswordGeneratorClient />
    </>
  );
}
