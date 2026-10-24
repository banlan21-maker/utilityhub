import type { Metadata } from 'next';
import WordleClient from './WordleClient';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/utility/wordle';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '한글 워들 — 자모로 맞히는 일일 단어 퍼즐 (영어 워들 포함) | Utility Hub'
    : 'Daily Word Puzzle — Free Wordle in English and Korean | Utility Hub';
  const description = isKo
    ? '매일 하나의 단어를 여섯 번 안에 맞히는 한글 워들입니다. 단어를 자음·모음 6칸으로 풀어 힌트를 주고, 영어 5글자 워들도 함께 즐길 수 있습니다. 연승·승률·결과 공유 지원.'
    : 'Guess the daily word in six tries. Play the classic five-letter English Wordle or a Korean version that splits words into six jamo tiles. Streaks, stats and spoiler-free sharing.';
  const canonical = `${BASE}/${locale}${PATH}`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `${BASE}/ko${PATH}`,
        en: `${BASE}/en${PATH}`,
        'x-default': `${BASE}/ko${PATH}`,
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const SCHEMA_TEXT = {
  ko: {
    name: '일일 단어 퍼즐 (한글 워들)',
    description: '단어를 자음·모음 6칸으로 풀어 맞히는 한글 워들과 영어 5글자 워들을 무료로 즐기는 일일 단어 게임입니다.',
    faqs: [
      { q: '한글은 왜 글자가 아니라 자모로 맞히나요?', a: '글자 단위로 비교하면 한 칸에 올 수 있는 글자가 1만 개가 넘어 힌트가 거의 나오지 않습니다. 자모로 나누면 자음과 모음의 위치를 추리해 여섯 번 안에 풀 수 있습니다.' },
      { q: '겹모음과 받침은 칸을 어떻게 나누나요?', a: '두벌식 자판에서 누르는 순서대로입니다. ㅘ 같은 겹모음과 ㄺ 같은 겹받침은 두 칸, ㄲ 같은 된소리는 한 칸입니다. "과일"은 ㄱ·ㅗ·ㅏ·ㅇ·ㅣ·ㄹ 여섯 칸입니다.' },
      { q: '입력한 단어가 목록에 없다고 나와요.', a: '한글은 자모가 정확히 6개인 약 1,500개 단어를 입력할 수 있습니다. 목록에 없는 단어는 기회를 쓰지 않으니 다른 단어로 다시 입력하세요.' },
      { q: '새 문제는 언제 나오고, 연승은 어떻게 세나요?', a: '기기 시계 기준 자정마다 새 문제가 열립니다. 맞히면 연승이 1 늘고, 하루를 건너뛰거나 실패하면 0이 되며 최대 연승은 남습니다.' },
    ],
  },
  en: {
    name: 'Daily Word Puzzle',
    description: 'Free daily word game: classic five-letter English Wordle plus a Korean version played with six jamo tiles.',
    faqs: [
      { q: 'Why does the Korean board use jamo instead of syllables?', a: 'There are more than 11,000 possible syllables, so syllable matching gives almost no hints. Jamo tiles let you deduce consonants and vowels within six tries.' },
      { q: 'How are compound vowels and final consonants counted?', a: 'As you type them on a 2-set keyboard: compound vowels and double finals take two tiles, tense consonants like ㄲ take one.' },
      { q: 'Why is my word "not in word list"?', a: 'Korean accepts about 1,500 six-jamo words and English about 6,400 five-letter words. Invalid words do not use up a try.' },
      { q: 'When does a new puzzle appear?', a: 'At midnight on your device. Solving adds to your streak; skipping a day or failing resets it, while your best streak is kept.' },
    ],
  },
} as const;

export default async function WordlePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const text = locale === 'ko' ? SCHEMA_TEXT.ko : SCHEMA_TEXT.en;

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: text.name,
    operatingSystem: 'Web Browser',
    applicationCategory: 'GameApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    url: `${BASE}/${locale}${PATH}`,
    inLanguage: locale,
    description: text.description,
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: text.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <WordleClient />
    </>
  );
}
