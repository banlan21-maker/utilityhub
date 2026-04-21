import type { Metadata } from 'next';
import UrlSafetyClient from './UrlSafetyClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? 'URL 피싱 & 악성코드 검사기 | Utility Hub'
    : 'URL Phishing & Malware Checker | Utility Hub';
  const description = isKo
    ? 'Google Safe Browsing API로 의심스러운 링크의 악성코드, 피싱, 유해 소프트웨어 여부를 즉시 검사하는 온라인 보안 도구.'
    : 'Instantly check suspicious links for malware, phishing, and unwanted software using the Google Safe Browsing API.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/security/url-safety`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/security/url-safety',
        en: 'https://www.theutilhub.com/en/utilities/security/url-safety',
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
  "name": "URL 피싱 & 악성코드 검사기",
  "alternateName": "URL Phishing & Malware Checker",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/security/url-safety",
  "description": "Google Safe Browsing API를 활용해 의심스러운 링크의 악성코드, 피싱, 유해 소프트웨어 여부를 즉시 검사하는 온라인 보안 도구입니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "검사 결과가 안전이어도 100% 믿어도 되나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "Google Safe Browsing은 수십억 개의 URL을 데이터베이스로 보유하지만, 최근 생성된 신규 피싱 사이트는 아직 등록되지 않았을 수 있습니다. '안전' 결과는 '알려진 위협 없음'을 의미하며, 도메인 철자가 이상하거나 출처가 불명확한 링크는 주의하세요." }
    },
    {
      "@type": "Question",
      "name": "검사한 URL이 저장되거나 제3자에게 공유되나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "Google Safe Browsing API에 URL을 전송해 검사합니다. Google의 개인정보처리방침에 따라 처리되며, 이 사이트의 서버에는 저장되지 않습니다." }
    },
    {
      "@type": "Question",
      "name": "기업 내부 URL(인트라넷)도 검사할 수 있나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "내부 IP(192.168.x.x, 10.x.x.x 등) 또는 localhost는 외부 접근이 불가능하므로 Safe Browsing 검사에서 의미 있는 결과를 얻기 어렵습니다. 공개 인터넷 URL 검사에 활용하세요." }
    },
    {
      "@type": "Question",
      "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." }
    }
  ]
};

export default function UrlSafetyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <UrlSafetyClient />
    </>
  );
}
