import type { Metadata } from 'next';
import CounterClient from './CounterClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '글자 수 세기 / 바이트 계산기 | Utility Hub' : 'Character & Byte Counter | Utility Hub';
  const description = isKo
    ? '텍스트의 글자 수(공백 포함/제외)와 UTF-8, EUC-KR 바이트를 실시간으로 계산하는 무료 온라인 도구입니다.'
    : 'Instantly count characters (with/without spaces) and calculate UTF-8 & EUC-KR byte size of any text.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/counter`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/utility/counter`,
        en: `https://www.theutilhub.com/en/utilities/utility/counter`,
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '글자 수 세기 / 바이트 계산기',
  alternateName: 'Character & Byte Counter',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/counter',
  description: '텍스트의 글자 수(공백 포함/제외)와 UTF-8, EUC-KR 바이트를 실시간으로 계산하는 무료 온라인 도구입니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '공백 포함과 공백 제외 글자 수, 어떤 기준을 써야 하나요?', acceptedAnswer: { '@type': 'Answer', text: '자기소개서나 공모전 대부분은 "공백 포함" 기준을 사용합니다. 단, 제출 플랫폼마다 다를 수 있으니 공고문의 안내를 반드시 확인하세요. 이 도구는 두 기준을 동시에 표시합니다.' } },
    { '@type': 'Question', name: 'EUC-KR 바이트와 UTF-8 바이트는 왜 다른가요?', acceptedAnswer: { '@type': 'Answer', text: '한글 한 글자는 EUC-KR에서 2바이트, UTF-8에서 3바이트를 차지합니다. 영문과 숫자는 두 인코딩 모두 1바이트입니다.' } },
    { '@type': 'Question', name: '입력한 텍스트가 서버에 저장되나요?', acceptedAnswer: { '@type': 'Answer', text: '아니요. 이 글자 수 계산기는 100% 브라우저에서만 작동하며, 입력한 내용은 외부 서버로 전송되지 않습니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function CounterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <CounterClient />
    </>
  );
}
