import type { Metadata } from 'next';
import MbtiTestClient from './MbtiTestClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '바다 생물 MBTI 테스트 | Utility Hub' : 'Sea Creature MBTI Test | Utility Hub';
  const description = isKo
    ? '12가지 심리 분석 질문으로 나와 닮은 바다 생물을 찾는 무료 MBTI 성격 테스트'
    : 'Find your sea creature match through 12 psychological questions in this free MBTI personality test.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/mbti-test`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/mbti-test',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/mbti-test',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '바다 생물 MBTI 테스트',
  alternateName: 'Sea Creature MBTI Test',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/mbti-test',
  description: '12가지 심리 분석 질문으로 나와 닮은 바다 생물을 찾는 무료 MBTI 성격 테스트',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'MBTI 지표는 어떻게 활용되나요?', acceptedAnswer: { '@type': 'Answer', text: '에너지 방향(E/I), 탐색 방식(S/N), 교감 방식(T/F), 대응 방식(J/P)의 4가지 축을 동물의 실제 생태적 특징과 연결하여 분석합니다.' } },
    { '@type': 'Question', name: '결과는 몇 가지인가요?', acceptedAnswer: { '@type': 'Answer', text: '총 16가지의 서로 다른 MBTI 조합에 맞춰 16가지의 매력적인 바다 생물 결과가 준비되어 있습니다.' } },
    { '@type': 'Question', name: '과학적으로 정확한가요?', acceptedAnswer: { '@type': 'Answer', text: '이 테스트는 전문적인 심리 진단 도구보다는 재미와 공감을 목적으로 설계되었습니다. 가벼운 마음으로 즐겨주세요!' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function MbtiTestPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MbtiTestClient />
    </>
  );
}
