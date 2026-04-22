import type { Metadata } from 'next';
import AgeCalcClient from './AgeCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '한국형 날짜 계산기 (만나이·전역일·배란일) | Utility Hub' : 'Korean Age & Date Calculator | Utility Hub';
  const description = isKo
    ? '만나이·연나이·세는나이 변환, 군 전역일 계산, 배란일 예측을 하나의 도구에서 해결하세요.'
    : 'Calculate Korean age types, military discharge date, and ovulation day all in one tool.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/age-calc`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/age-calc',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/age-calc',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '한국형 날짜 계산기',
  alternateName: 'Korean Date Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/age-calc',
  description: '만나이·연나이·세는나이 변환, 군 전역일 계산, 배란일 예측을 하나의 도구에서 해결하세요',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '군 복무 기간 단축이나 단기 복무 반영이 되나요?', acceptedAnswer: { '@type': 'Answer', text: '현재 도구는 2024년 기준 표준 복무 기간을 사용합니다. 특기병, 부사관, 장교, 전문연구요원 등 비표준 복무 기간은 별도로 적용되지 않습니다. 정확한 전역일은 복무 부대에 문의하세요.' } },
    { '@type': 'Question', name: '만나이와 연나이 중 어떤 나이를 사용해야 하나요?', acceptedAnswer: { '@type': 'Answer', text: '2023년 6월부터 의료·행정·법령 문서는 만 나이를 기준으로 합니다. 단, 병역법·청소년보호법 등 일부 법률은 기존 연 나이나 세는 나이를 계속 사용할 수 있으므로 해당 법률을 확인하세요.' } },
    { '@type': 'Question', name: '배란일 계산이 부정확한 이유는 무엇인가요?', acceptedAnswer: { '@type': 'Answer', text: '배란일은 개인의 건강 상태, 스트레스, 호르몬 불균형에 따라 달라질 수 있습니다. 이 도구는 평균 주기를 기반으로 한 통계적 예측값으로, 임신을 계획하고 있다면 산부인과 전문의의 상담이 필요합니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function AgeCalcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AgeCalcClient />
    </>
  );
}
