import type { Metadata } from 'next';
import DecisionMasterClient from './DecisionMasterClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? 'Decision Master – 5가지 랜덤 결정 도구 | Utility Hub' : 'Decision Master – 5-in-1 Random Decision Hub | Utility Hub';
  const description = isKo
    ? '사다리 타기, 돌림판, 주사위, 제비뽑기, 화살표 돌리기 5가지 랜덤 결정 도구를 하나의 페이지에서 무료로 사용할 수 있습니다.'
    : 'Use 5 random decision tools — Ladder, Wheel, Dice, Draw, and Arrow — all in one free page.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/decision-master`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/utility/decision-master`,
        en: `https://www.theutilhub.com/en/utilities/utility/decision-master`,
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Decision Master – 5가지 랜덤 결정 도구',
  alternateName: 'Decision Master – 5-in-1 Random Decision Hub',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/decision-master',
  description: '사다리 타기, 돌림판, 주사위, 제비뽑기, 화살표 돌리기 5가지 랜덤 결정 도구를 하나의 페이지에서 무료로 사용할 수 있습니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '결과가 진짜 무작위인가요?', acceptedAnswer: { '@type': 'Answer', text: '네. 돌림판·화살표·주사위는 JavaScript의 Math.random() 기반 의사난수를 사용하며, 사다리 가로대와 제비뽑기 당첨 위치도 매 생성 시 무작위로 결정됩니다.' } },
    { '@type': 'Question', name: '로그인이나 설치가 필요한가요?', acceptedAnswer: { '@type': 'Answer', text: '아니요. 회원가입·로그인·앱 설치 모두 필요 없습니다. 브라우저에서 바로 사용할 수 있으며, 입력한 이름이나 선택지 데이터는 서버로 전송되지 않고 기기 내에서만 처리됩니다.' } },
    { '@type': 'Question', name: '모바일에서도 잘 되나요?', acceptedAnswer: { '@type': 'Answer', text: '네. 모든 모드는 모바일 화면에 최적화되어 있습니다. 사다리 타기 캔버스는 화면 너비에 맞게 자동 조절되며, 돌림판과 화살표는 터치 입력도 원활하게 동작합니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 모든 결과는 순수 오락·편의 목적의 랜덤 생성값으로, 법적 효력이 없습니다. 중요한 결정은 반드시 당사자 간 합의를 통해 이루어져야 합니다.' } },
  ],
};

export default function DecisionMasterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <DecisionMasterClient />
    </>
  );
}
