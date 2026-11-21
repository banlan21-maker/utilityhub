import type { Metadata } from 'next';
import PersonaBuildClient from './PersonaBuildClient';
import ToolJsonLd from '@/app/components/ToolJsonLd';
import SeoSection from '@/app/components/SeoSection';
import { SEO } from './seo-content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '페르소나 카드 — 오늘의 캐릭터 생존 게임 | Utility Hub'
    : 'Persona Build — Daily Character Survival Card Game | Utility Hub';
  const description = isKo
    ? '매일 새 캐릭터(직업·성격·특기)와 미션으로 즐기는 1인용 카드 게임. 내 캐릭터 특성 활용이 점수를 결정합니다. 한국 표준시(KST) 자정에 동시 갱신.'
    : 'A daily solo card game. New character (job + personality + skill) and mission every day. Your score depends on how well you play your role. Refreshes at Korean midnight (KST).';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/persona-build`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/utility/persona-build',
        en: 'https://www.theutilhub.com/en/utilities/utility/persona-build',
        'x-default': 'https://www.theutilhub.com/ko/utilities/utility/persona-build',
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
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '페르소나 카드',
  alternateName: 'Persona Build',
  operatingSystem: 'Web Browser',
  applicationCategory: 'GameApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/persona-build',
  description:
    '매일 새 캐릭터(직업·성격·특기)와 미션을 받아 10개의 상황 선택으로 점수를 겨루는 1인용 데일리 카드 게임.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '점수는 어떻게 계산되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '상황마다 선택지의 판단 점수(가장 합리적인 답 70점 ~ 가장 나쁜 답 40점)에 캐릭터 보너스를 더합니다. 보너스는 성격 18점, 특기 10점, 직업 6점이고, 태그가 정확히 맞으면 전부, 비슷한 계열이면 절반을 받습니다. 캐릭터답지 않은 행동은 15점이 깎입니다. 이렇게 나온 값을 그 상황에서 가장 좋은 선택 100점, 가장 나쁜 선택 0점으로 환산해 10개 상황을 더하므로 총점은 0~1000점입니다.',
      },
    },
    {
      '@type': 'Question',
      name: '왜 같은 날에는 모든 사용자가 같은 캐릭터·미션을 받나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '한국 표준시(KST) 자정 기준으로 모든 사용자가 동일한 캐릭터·미션·선택지 순서를 받습니다. 같은 조건에서 친구와 점수를 비교할 수 있으며, 매일 자정에 새로 갱신됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '반대 성격이란 무엇인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '예: "겁쟁이" 캐릭터가 "용감하게 돌진"을 선택하면 캐릭터답지 않은 행동으로 15점이 깎입니다. 감점은 대부분 성격에 걸려 있지만, 협상 특기인데 협상을 걷어차는 것처럼 특기·직업과 정반대인 선택에도 일부 적용됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 게임이 심리 검사인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '아닙니다. 오락용 데일리 카드 게임으로, 어떠한 심리 검사·성격 진단도 아닙니다. 결과 점수는 캐릭터 롤플레이 적합도에 대한 재미용 평가입니다.',
      },
    },
  ],
};

export default async function PersonaBuildPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      {locale === 'ko' ? (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        </>
      ) : (
        <ToolJsonLd href="/utilities/utility/persona-build" />
      )}
      <PersonaBuildClient seo={<SeoSection ko={SEO.ko} en={SEO.en} />} />
    </>
  );
}
