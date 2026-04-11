import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? 'SLA 가동률 계산기 | Utility Hub'
    : 'SLA Uptime Calculator | Utility Hub';
  const description = isKo
    ? '쓰리 나인(99.9%)부터 파이브 나인(99.999%)까지, SLA 가동률을 연간·월간·주간·일간 허용 다운타임으로 즉시 변환. 클라우드 계약·인프라 설계 필수 도구.'
    : 'From three nines (99.9%) to five nines (99.999%) — instantly convert any SLA uptime percentage into allowed downtime per year, month, week, and day.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/performance/sla-uptime-calc`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/performance/sla-uptime-calc',
        en: 'https://www.theutilhub.com/en/utilities/performance/sla-uptime-calc',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SLA 가동률 계산기',
  alternateName: 'SLA Uptime Calculator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/performance/sla-uptime-calc',
  description: '쓰리 나인(99.9%)부터 파이브 나인(99.999%)까지, SLA 가동률을 연간·월간·주간·일간 허용 다운타임으로 즉시 변환. 클라우드 계약·인프라 설계 필수 도구.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '쓰리 나인(99.9%)과 포 나인(99.99%)의 실제 차이는 얼마나 되나요?', acceptedAnswer: { '@type': 'Answer', text: '쓰리 나인(99.9%)은 연간 약 8시간 45분의 다운타임을 허용하고, 포 나인(99.99%)은 연간 약 52분만 허용합니다. 숫자로는 0.09%p 차이지만 실제 허용 시간은 약 10배 차이입니다.' } },
    { '@type': 'Question', name: '계산에 사용되는 공식이 무엇인가요?', acceptedAnswer: { '@type': 'Answer', text: '허용 다운타임(초) = (100 - 가동률) / 100 × 기간(초) 공식을 사용합니다. 연간은 365.25일 × 24시간 × 3600초 = 31,557,600초 기준입니다.' } },
    { '@type': 'Question', name: 'SLA 100%는 현실적으로 가능한가요?', acceptedAnswer: { '@type': 'Answer', text: '현실적으로 100% SLA는 존재할 수 없습니다. 하드웨어 교체, OS 패치, 네트워크 유지보수 등 계획된 점검만으로도 다운타임이 발생하기 때문입니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 실제 SLA 조건과 다운타임 정의는 각 서비스 제공사의 공식 문서를 반드시 확인하시기 바랍니다.' } },
  ],
};

import SlaUptimeCalcClient from './SlaUptimeCalcClient';

export default function SlaUptimeCalcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SlaUptimeCalcClient />
    </>
  );
}
