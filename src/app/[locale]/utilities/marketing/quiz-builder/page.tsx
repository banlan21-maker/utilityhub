import type { Metadata } from 'next';
import QuizBuilderClient from './QuizBuilderClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '퀴즈 빌더 | Utility Hub' : 'Quiz Builder | Utility Hub';
  const description = isKo
    ? '코딩 없이 MBTI 스타일 심리테스트를 만들고 링크로 바로 공유하세요. 무료·무제한'
    : 'Build MBTI-style personality quizzes and share them instantly via link. Free, no login required.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/marketing/quiz-builder`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/marketing/quiz-builder',
        en: 'https://www.theutilhub.com/en/utilities/marketing/quiz-builder',
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
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MBTI 스타일 퀴즈 빌더',
  alternateName: 'Quiz & Personality Test Builder',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/marketing/quiz-builder',
  description: '코딩 없이 MBTI 스타일 심리테스트를 만들고 링크로 바로 공유하세요. 무료·무제한',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '만든 퀴즈는 어디에 저장되나요?', acceptedAnswer: { '@type': 'Answer', text: '퀴즈 데이터는 별도 서버에 저장되지 않습니다. 생성된 링크 URL 자체에 퀴즈 전체 내용이 인코딩되어 있어, 링크를 보관하면 영구적으로 퀴즈를 재현할 수 있습니다. 링크를 잃어버리면 복구가 불가능하므로 반드시 저장해두세요.' } },
    { '@type': 'Question', name: '퀴즈 유형과 질문은 최대 몇 개까지 만들 수 있나요?', acceptedAnswer: { '@type': 'Answer', text: '결과 유형은 최대 4개(A~D), 질문은 최대 10개까지 설정할 수 있습니다. 각 질문마다 결과 유형 수만큼의 선택지가 자동 생성되어, 각 선택지에 원하는 유형을 연결할 수 있습니다.' } },
    { '@type': 'Question', name: '만든 퀴즈를 수정하려면 어떻게 하나요?', acceptedAnswer: { '@type': 'Answer', text: '현재 버전은 생성된 링크를 직접 수정하는 기능을 제공하지 않습니다. 수정이 필요한 경우 빌더 페이지에서 내용을 다시 입력한 후 새 링크를 생성하시기 바랍니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function QuizBuilderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <QuizBuilderClient />
    </>
  );
}
