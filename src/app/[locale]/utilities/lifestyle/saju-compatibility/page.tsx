import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '사주 궁합 테스트 — 카카오 공유 바이럴 궁합기 | Utility Hub'
    : 'Saju Compatibility Test — Share & Find Your Match | Utility Hub';
  const description = isKo
    ? '생년월일시로 두 사람의 사주 궁합을 무료로 계산하세요. 링크 하나로 상대방과 함께 결과를 확인하는 바이럴 궁합 테스트.'
    : 'Calculate your Saju compatibility for free. Share a link and check results together — no sign-up needed.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/saju-compatibility`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/saju-compatibility',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/saju-compatibility',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '사주 궁합 테스트',
  alternateName: 'Saju Compatibility Test',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/saju-compatibility',
  description: '생년월일시로 두 사람의 사주 궁합을 무료로 계산하세요. 링크 하나로 상대방과 함께 결과를 확인하는 바이럴 궁합 테스트.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '입력한 이름과 생일이 서버에 저장되나요?', acceptedAnswer: { '@type': 'Answer', text: '전혀 저장되지 않습니다. 모든 계산은 브라우저 내부에서만 처리되며, 서버에 어떤 데이터도 전송하지 않습니다. URL에 포함되는 정보도 이니셜만 사용하여 개인정보를 최소화합니다.' } },
    { '@type': 'Question', name: '태어난 시간을 모르면 어떻게 하나요?', acceptedAnswer: { '@type': 'Answer', text: '"시간 모름"을 선택하면 일간과 일지만으로 계산합니다. 정확도가 다소 낮아질 수 있지만, 충분히 의미 있는 결과를 제공합니다.' } },
    { '@type': 'Question', name: '궁합 점수가 낮게 나오면 어떡하나요?', acceptedAnswer: { '@type': 'Answer', text: '사주 궁합은 참고 자료일 뿐입니다. 실제 관계는 서로의 이해와 노력으로 완성됩니다. 오히려 다른 조합의 커플이 더 아름다운 사랑을 만들어가기도 합니다.' } },
    { '@type': 'Question', name: '이 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '본 결과는 재미를 위한 참고용이며, 실제 결혼이나 중요한 결정에는 전문 역학 상담을 받으시기 바랍니다.' } },
  ],
};

import SajuCompatibilityClient from './SajuCompatibilityClient';

export default function SajuCompatibilityPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SajuCompatibilityClient />
    </>
  );
}
