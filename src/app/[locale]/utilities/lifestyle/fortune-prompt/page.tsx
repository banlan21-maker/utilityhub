import type { Metadata } from 'next';
import FortunePromptClient from './FortunePromptClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? 'AI 사주팔자 운세 프롬프트 생성기 | Utility Hub' : 'AI Saju Fortune Prompt Generator | Utility Hub';
  const description = isKo
    ? '생년월일로 사주팔자를 계산하고 ChatGPT·Claude·Gemini에 바로 붙여넣을 운세 프롬프트를 생성하는 무료 도구'
    : 'Calculate your Saju (Four Pillars of Destiny) and generate AI fortune prompts ready to paste into ChatGPT, Claude, or Gemini.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/fortune-prompt`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/fortune-prompt',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/fortune-prompt',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AI 사주팔자 운세 프롬프트 생성기',
  alternateName: 'AI Saju Fortune Prompt Generator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/fortune-prompt',
  description: '생년월일로 사주팔자를 계산하고 ChatGPT·Claude·Gemini에 바로 붙여넣을 운세 프롬프트를 생성하는 무료 도구',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '제미나이와 ChatGPT 중 어디가 사주를 더 잘 봐주나요?', acceptedAnswer: { '@type': 'Answer', text: '각 AI마다 조금씩 다른 스타일로 해석합니다. ChatGPT는 대화형으로 친근하게, Claude는 논리적이고 구조적으로, Gemini는 창의적이고 다양한 관점으로 분석하는 경향이 있습니다. 여러 AI에서 비교해보면 더 풍부한 인사이트를 얻을 수 있습니다.' } },
    { '@type': 'Question', name: '생년월일 정보가 서버에 저장되나요?', acceptedAnswer: { '@type': 'Answer', text: '절대 아닙니다! 모든 사주 계산과 프롬프트 생성은 여러분의 브라우저에서만 이루어지며, 서버로 어떠한 개인 정보도 전송되지 않습니다. 100% 프라이버시가 보장됩니다.' } },
    { '@type': 'Question', name: '태어난 시간을 모르면 어떻게 하나요?', acceptedAnswer: { '@type': 'Answer', text: "'시간을 모름'을 선택하시면 됩니다. 이 경우 시주(時柱)를 제외한 연주, 월주, 일주만으로 분석이 진행되며, 여전히 유의미한 결과를 얻을 수 있습니다. 다만 시주는 세밀한 성격 분석과 시간대별 운세에 영향을 주므로, 가능하다면 부모님께 여쭤보시는 것을 추천합니다." } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function FortunePromptPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <FortunePromptClient />
    </>
  );
}
