import type { Metadata } from 'next';
import TetoEgenTestClient from './TetoEgenTestClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '테토·에겐 테스트 | Utility Hub' : 'Teto-Egen Test | Utility Hub';
  const description = isKo
    ? '남성형(테토)과 여성형(에겐) 성향을 분석하는 무료 성격 테스트'
    : 'A free personality test that analyzes your Teto (masculine) and Egen (feminine) tendencies.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/teto-egen-test`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/teto-egen-test',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/teto-egen-test',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '테토·에겐 테스트',
  alternateName: 'Teto-Egen Test',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/teto-egen-test',
  description: '남성형(테토)과 여성형(에겐) 성향을 분석하는 무료 성격 테스트',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '테토·에겐 테스트란 무엇인가요?', acceptedAnswer: { '@type': 'Answer', text: '테토(Teto)와 에겐(Egen)은 일본 인터넷 문화에서 유래한 성향 분류로, 각각 남성형·여성형 특성을 의미합니다. 성별과 무관하게 누구나 테토 또는 에겐 성향을 가질 수 있습니다.' } },
    { '@type': 'Question', name: '테스트 결과가 정확한가요?', acceptedAnswer: { '@type': 'Answer', text: '이 테스트는 재미와 자기 탐색을 위한 가벼운 도구입니다. 심리학적으로 공인된 진단 도구가 아니므로 결과를 참고용으로만 활용하시기 바랍니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function TetoEgenTestPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <TetoEgenTestClient />
    </>
  );
}
