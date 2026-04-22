import type { Metadata } from 'next';
import WordleClient from './WordleClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '일일 단어 퍼즐 – 매일 새로운 한/영 단어 게임 | Utility Hub' : 'Daily Word Puzzle – New Korean & English Word Game Every Day | Utility Hub';
  const description = isKo
    ? '매일 새로운 단어를 맞추는 두뇌 게임입니다. 한국어(3글자)와 영어(5글자)를 지원하며 연승 기록을 추적합니다.'
    : 'A daily brain game to guess a new word every day. Supports Korean (3 letters) and English (5 letters) with streak tracking.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/wordle`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/utility/wordle`,
        en: `https://www.theutilhub.com/en/utilities/utility/wordle`,
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '일일 단어 퍼즐',
  alternateName: 'Daily Word Puzzle',
  operatingSystem: 'Web Browser',
  applicationCategory: 'GameApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/wordle',
  description: '매일 새로운 단어를 맞추는 두뇌 게임입니다. 한국어(3글자)와 영어(5글자)를 지원하며 연승 기록을 추적합니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '매일 새로운 단어가 나오나요?', acceptedAnswer: { '@type': 'Answer', text: '네! 매일 자정(00:00)이 되면 새로운 단어 퍼즐이 생성됩니다. 날짜 기반 알고리즘을 사용하여 모든 사용자에게 동일한 단어가 제공됩니다.' } },
    { '@type': 'Question', name: '연승이 끊기면 어떻게 되나요?', acceptedAnswer: { '@type': 'Answer', text: '하루를 건너뛰거나 퍼즐을 실패하면 현재 연승이 0으로 초기화됩니다. 하지만 최대 연승 기록은 유지되므로, 다시 도전하여 새로운 기록을 세워보세요!' } },
    { '@type': 'Question', name: '무료로 플레이할 수 있나요?', acceptedAnswer: { '@type': 'Answer', text: '네! 일일 단어 퍼즐은 100% 무료로 제공됩니다. 회원가입이나 로그인 없이 바로 플레이하고, 데이터는 브라우저에 안전하게 저장됩니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function WordlePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <WordleClient />
    </>
  );
}
