import type { Metadata } from 'next';
import AquariumCalcClient from './AquariumCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '수족관 생물학적 부하 계산기 | Utility Hub' : 'Aquarium Bioload Calculator | Utility Hub';
  const description = isKo
    ? '수조 크기와 어종별 생물학적 부하를 계산해 과밀 사육을 방지하는 무료 아쿠아리움 계산기'
    : 'Calculate bioload by tank size and fish species to prevent overcrowding in your aquarium.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/aquarium-calc`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/aquarium-calc',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/aquarium-calc',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '수족관 생물학적 부하 계산기',
  alternateName: 'Aquarium Bioload Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/aquarium-calc',
  description: '수조 크기와 어종별 생물학적 부하를 계산해 과밀 사육을 방지하는 무료 아쿠아리움 계산기',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '생물학적 부하(Bioload)란 무엇인가요?', acceptedAnswer: { '@type': 'Answer', text: '생물학적 부하는 수조 내 생물(주로 물고기)이 배출하는 노폐물의 총량을 의미합니다. 배설물, 먹다 남은 사료, 호흡을 통한 암모니아 배출 등이 모두 포함되며, 이는 수질에 직접적인 영향을 미칩니다. 적절한 생물학적 부하 관리는 건강한 수족관 유지의 핵심입니다.' } },
    { '@type': 'Question', name: '계산기에서 100%를 초과하면 어떻게 해야 하나요?', acceptedAnswer: { '@type': 'Answer', text: '100% 초과는 과밀 상태를 의미하며, 수질 악화와 물고기 스트레스로 이어질 수 있습니다. 해결 방법은 1) 더 큰 수조로 교체, 2) 물고기 수량 감소, 3) 강력한 여과 시스템 설치, 4) 환수 주기 단축(주 2-3회) 등이 있습니다.' } },
    { '@type': 'Question', name: '공격적인 물고기와 온순한 물고기를 함께 기를 수 있나요?', acceptedAnswer: { '@type': 'Answer', text: '일반적으로 권장하지 않습니다. 베타, 시클리드 같은 공격적인 어종은 구피, 네온테트라 같은 온순한 어종을 공격하거나 지느러미를 물어뜯을 수 있습니다. 합사를 원한다면 충분한 은신처와 넓은 공간을 제공하고, 개체의 성격을 면밀히 관찰해야 합니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function AquariumCalcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AquariumCalcClient />
    </>
  );
}
