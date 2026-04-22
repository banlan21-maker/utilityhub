import type { Metadata } from 'next';
import LottoGeneratorClient from './LottoGeneratorClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '글로벌 운명 로또 번호 생성기 | Utility Hub' : 'Global Destiny Lotto Picker | Utility Hub';
  const description = isKo
    ? '이름·생년월일·구매날짜로 Powerball, Mega Millions, 로또 6/45 번호를 생성하는 재미있는 무료 도구입니다.'
    : 'Generate Powerball, Mega Millions, and Lotto 6/45 numbers based on your name, birthday, and purchase date.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/lotto-generator`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/utility/lotto-generator`,
        en: `https://www.theutilhub.com/en/utilities/utility/lotto-generator`,
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '글로벌 운명 로또 번호 생성기',
  alternateName: 'Global Destiny Lotto Picker',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/lotto-generator',
  description: '이름·생년월일·구매날짜로 Powerball, Mega Millions, 로또 6/45 번호를 생성하는 재미있는 무료 도구입니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '같은 번호를 다시 뽑으려면?', acceptedAnswer: { '@type': 'Answer', text: '이름, 생년월일, 구매일을 동일하게 입력하면 항상 같은 번호가 나옵니다. 결정론적 알고리즘(Seeded PRNG)을 사용하기 때문에 날짜나 기기가 달라져도 결과가 변하지 않습니다.' } },
    { '@type': 'Question', name: '이 번호는 실제로 당첨될 수 있나요?', acceptedAnswer: { '@type': 'Answer', text: '이 도구는 순수 오락 목적으로 제작되었습니다. 생성되는 번호는 수학적 알고리즘에 기반한 의사난수로, 실제 복권 추첨과는 아무런 연관이 없습니다.' } },
    { '@type': 'Question', name: '파워볼과 메가밀리언스는 어떻게 다른가요?', acceptedAnswer: { '@type': 'Answer', text: '파워볼은 1~69에서 5개를 뽑고 1~26에서 파워볼 1개를 추가 추첨합니다. 메가밀리언스는 1~70에서 5개를 뽑고 1~25에서 메가볼 1개를 추가합니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 이 도구는 순수 오락 목적으로 제작되었으며, 생성된 번호는 실제 복권 추첨과 아무런 연관이 없습니다.' } },
  ],
};

export default function LottoGeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <LottoGeneratorClient />
    </>
  );
}
