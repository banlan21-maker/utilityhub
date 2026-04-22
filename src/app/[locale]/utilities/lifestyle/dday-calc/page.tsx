import type { Metadata } from 'next';
import DdayCalcClient from './DdayCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? 'D-Day & 날짜 계산기 | Utility Hub' : 'D-Day & Date Calculator | Utility Hub';
  const description = isKo
    ? '목표일까지 남은 D-Day를 계산하고 날짜 더하기/빼기를 간편하게 처리하는 무료 날짜 계산기'
    : 'Calculate days remaining until your target date and easily add or subtract dates with this free D-Day calculator.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/dday-calc`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/dday-calc',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/dday-calc',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'D-Day & 날짜 계산기',
  alternateName: 'D-Day & Date Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/dday-calc',
  description: '목표일까지 남은 D-Day를 계산하고 날짜 더하기/빼기를 간편하게 처리하는 무료 날짜 계산기',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'D-Day 계산 시 오늘 날짜도 포함되나요?', acceptedAnswer: { '@type': 'Answer', text: '일반적으로 D-Day 계산은 오늘을 기준으로 내일을 D-1, 목표일 당일을 D-0으로 계산합니다. 이 도구도 동일한 방식을 따르며, 오늘이 목표일이면 "D-Day!"로 표시됩니다.' } },
    { '@type': 'Question', name: '날짜 더하기 계산 시 윤년·월별 일수 차이가 적용되나요?', acceptedAnswer: { '@type': 'Answer', text: '네. 이 날짜 계산기는 JavaScript 내장 Date 객체를 사용하므로 윤년(2월 29일)과 각 월의 정확한 일수가 자동 반영됩니다. 별도로 신경 쓰실 필요가 없습니다.' } },
    { '@type': 'Question', name: '모바일에서도 D-Day 계산이 가능한가요?', acceptedAnswer: { '@type': 'Answer', text: '네, 이 D-Day 계산기는 모바일 브라우저에서도 완벽하게 동작합니다. 앱 설치 없이 즐겨찾기에 추가해 언제든지 빠르게 접근하세요.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function DdayCalcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <DdayCalcClient />
    </>
  );
}
