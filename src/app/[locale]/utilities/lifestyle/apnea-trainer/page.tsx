import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '프리다이빙 드라이 트레이닝 | Apnea Pro | Utility Hub'
    : 'Freediving Dry Training Timer | Apnea Pro | Utility Hub';
  const description = isKo
    ? 'CO2·O2 테이블 자동 생성, 음성 가이드, 비프음, 시각 플래시로 프리다이빙 드라이 스태틱 훈련을 체계적으로 관리하세요.'
    : 'Auto-generate CO2 & O2 training tables with voice guide, beep alerts, and visual flash for structured freediving dry static apnea training.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/apnea-trainer`;
  return {
    title, description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/apnea-trainer',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/apnea-trainer',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Apnea Pro 드라이 트레이닝 마스터',
  alternateName: 'Apnea Pro Dry Training Master',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/apnea-trainer',
  description: 'CO2·O2 테이블 자동 생성, 음성 가이드, 비프음으로 프리다이빙 드라이 트레이닝을 체계적으로 관리하는 무료 웹 앱.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'CO2 테이블과 O2 테이블의 차이는 무엇인가요?', acceptedAnswer: { '@type': 'Answer', text: 'CO2 테이블은 이산화탄소 상승으로 인한 호흡 충동에 적응하는 훈련이며, O2 테이블은 저산소 상태에서 신체가 효율적으로 작동하도록 적응시키는 훈련입니다. 둘 다 PB(개인 최고 기록) 기반으로 자동 계산됩니다.' } },
    { '@type': 'Question', name: '드라이 트레이닝은 얼마나 자주 해야 하나요?', acceptedAnswer: { '@type': 'Answer', text: '주 3~4회를 권장합니다. CO2 테이블과 O2 테이블을 교차하여 진행하되, 충분한 회복 시간을 확보하는 것이 중요합니다. 매일 훈련하면 오히려 적응 효과가 감소할 수 있습니다.' } },
    { '@type': 'Question', name: '음성 가이드가 작동하지 않아요', acceptedAnswer: { '@type': 'Answer', text: '음성 가이드는 Web Speech API를 사용합니다. 브라우저 자동 재생 정책에 따라 처음 상호작용(버튼 클릭) 이후부터 작동합니다. Safari에서는 시스템 설정의 음성 권한도 확인하세요.' } },
    { '@type': 'Question', name: '이 앱의 결과를 공식 훈련 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '본 앱의 훈련 테이블은 참고용 가이드라인입니다. 개인 건강 상태와 수준에 따라 조정이 필요할 수 있으며, 반드시 공인 프리다이빙 강사 또는 의료 전문가와 상담 후 활용하시기 바랍니다.' } },
  ],
};

// ── Client Component ──────────────────────────────────────────────────────────
import ApneaTrainerClient from './ApneaTrainerClient';

export default function ApneaTrainerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ApneaTrainerClient />
    </>
  );
}
