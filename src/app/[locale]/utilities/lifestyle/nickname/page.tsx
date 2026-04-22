import type { Metadata } from 'next';
import NicknameClient from './NicknameClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '닉네임 생성기 | Utility Hub' : 'Nickname Generator | Utility Hub';
  const description = isKo
    ? '생년월일과 스타일로 나에게 어울리는 영문 이름과 닉네임을 추천받는 무료 온라인 닉네임 생성기'
    : 'Get personalized English name and nickname recommendations based on your birth date and preferred style.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/nickname`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/nickname',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/nickname',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '닉네임 생성기',
  alternateName: 'Nickname Generator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/nickname',
  description: '생년월일과 스타일로 나에게 어울리는 영문 이름과 닉네임을 추천받는 무료 온라인 닉네임 생성기',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '추천된 영문 이름이 법적 이름으로 사용 가능한가요?', acceptedAnswer: { '@type': 'Answer', text: '이 도구는 닉네임·영문 이름 아이디어 제공을 위한 참고 도구입니다. 여권이나 공식 서류의 영문 이름 변경은 법적 절차가 필요하므로 관련 기관에 문의하세요.' } },
    { '@type': 'Question', name: '같은 정보를 입력해도 매번 같은 결과가 나오나요?', acceptedAnswer: { '@type': 'Answer', text: '동일한 입력값에 대해 일관된 추천 결과를 제공합니다. 단, 스타일 선택을 변경하면 다른 이름 세트를 탐색할 수 있으므로 여러 스타일을 시도해보세요.' } },
    { '@type': 'Question', name: '추천 이름이 마음에 들지 않습니다', acceptedAnswer: { '@type': 'Answer', text: "다른 스타일을 선택해 새로운 추천을 받거나, '다시 추천받기' 버튼을 활용하세요. 추천받은 이름들의 어원과 의미를 읽어보면 비슷한 느낌의 이름을 직접 탐색하는 데도 도움이 됩니다." } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function NicknamePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <NicknameClient />
    </>
  );
}
