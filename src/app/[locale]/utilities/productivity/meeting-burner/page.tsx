import type { Metadata } from 'next';
import MeetingBurnerClient from './MeetingBurnerClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '회의 비용 계산기 Meeting Burner | Utility Hub' : 'Meeting Burner — Real-time Meeting Cost Meter | Utility Hub';
  const description = isKo
    ? '회의 참석자와 연봉을 입력하면 초 단위로 증발하는 인건비를 실시간으로 시각화합니다.'
    : 'Visualize labor costs evaporating in real-time by entering meeting participants and salaries.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/productivity/meeting-burner`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/productivity/meeting-burner',
        en: 'https://www.theutilhub.com/en/utilities/productivity/meeting-burner',
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
  name: '회의 비용 계산기 Meeting Burner',
  alternateName: 'Meeting Burner',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/productivity/meeting-burner',
  description: '회의 참석자와 연봉을 입력하면 초 단위로 증발하는 인건비를 실시간으로 시각화합니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '연봉 데이터는 서버에 저장되나요?', acceptedAnswer: { '@type': 'Answer', text: '아니요, 모든 계산은 브라우저에서만 이루어지며 어떠한 데이터도 서버로 전송되지 않습니다. 안심하고 사용하세요.' } },
    { '@type': 'Question', name: '시급 계산 기준이 무엇인가요?', acceptedAnswer: { '@type': 'Answer', text: '연봉을 기준으로 연간 근무일 365일, 하루 8시간 근무를 가정하여 초당 비용을 계산합니다. (연봉 ÷ 365 ÷ 8 ÷ 3600)' } },
    { '@type': 'Question', name: '목표 시간을 초과하면 어떻게 되나요?', acceptedAnswer: { '@type': 'Answer', text: '타이머 화면이 붉게 변하며 시각적 경고(Visual Shake)가 표시됩니다. 회의를 마무리할 시점임을 알려드립니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function MeetingBurnerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MeetingBurnerClient />
    </>
  );
}
