import type { Metadata } from 'next';
import PasswordStrengthClient from './PasswordStrengthClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '비밀번호 강도 검사기 & 생성기 | Utility Hub' : 'Password Strength Checker & Generator | Utility Hub';
  const description = isKo
    ? '암호학적으로 안전한 난수로 강력한 비밀번호를 생성하고 비트 단위 엔트로피로 강도를 측정하는 무료 온라인 도구입니다.'
    : 'Generate cryptographically secure passwords and measure strength with bit-level entropy. 100% client-side, no data sent to server.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/dev/password-strength`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/dev/password-strength',
        en: 'https://www.theutilhub.com/en/utilities/dev/password-strength',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '비밀번호 강도 측정 & 생성기',
  alternateName: 'Password Strength Checker & Generator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/dev/password-strength',
  description: '암호학적으로 안전한 난수(crypto.getRandomValues)를 사용해 강력한 비밀번호를 생성하고, 비트 단위 엔트로피로 강도를 측정하는 무료 온라인 도구입니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '엔트로피(Entropy)가 높을수록 좋은 비밀번호인가요?', acceptedAnswer: { '@type': 'Answer', text: '네. 엔트로피는 비밀번호 예측 불가능성을 비트로 나타냅니다. 일반적으로 72비트 이상이면 현대 컴퓨터로 사실상 해킹이 불가능한 수준입니다.' } },
    { '@type': 'Question', name: '비밀번호가 서버로 전송되지 않나요?', acceptedAnswer: { '@type': 'Answer', text: '이 도구의 모든 처리(생성, 분석, 강도 측정)는 100% 브라우저(JavaScript)에서 실행됩니다. 네트워크 요청이 발생하지 않으며 개인 데이터가 외부로 전송되지 않습니다.' } },
    { '@type': 'Question', name: '생성된 비밀번호는 얼마나 안전한가요?', acceptedAnswer: { '@type': 'Answer', text: 'Web Crypto API의 crypto.getRandomValues()를 사용해 암호학적으로 안전한 난수를 생성합니다. Math.random() 기반 생성기보다 훨씬 예측이 어렵습니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function PasswordStrengthPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PasswordStrengthClient />
    </>
  );
}
