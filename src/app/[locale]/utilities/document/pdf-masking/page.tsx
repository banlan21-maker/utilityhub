import type { Metadata } from 'next';
import PdfMaskingClient from './PdfMaskingClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? 'PDF 개인정보 마스킹 | Utility Hub'
    : 'PDF Privacy Masking Tool | Utility Hub';
  const description = isKo
    ? 'AI가 PDF에서 주민번호, 전화번호, 이메일 등 개인정보를 자동 탐지하고 마스킹. 100% 브라우저 로컬 처리, 서버 업로드 없음.'
    : 'AI automatically detects and masks personal information (SSN, phone, email) in PDF documents. 100% local browser processing, no server upload.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/document/pdf-masking`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/document/pdf-masking',
        en: 'https://www.theutilhub.com/en/utilities/document/pdf-masking',
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
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PDF 개인정보 마스킹',
  alternateName: 'PDF Privacy Masking Tool',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/document/pdf-masking',
  description:
    'AI가 PDF 문서에서 주민등록번호, 전화번호, 이메일, 주소 등 개인정보를 자동으로 탐지하고 마스킹하는 무료 온라인 도구입니다. 100% 브라우저 로컬 처리로 서버 업로드가 없어 완벽한 보안을 보장합니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '회사 보안팀에 걸리지 않나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '100% 로컬 처리로 네트워크 트래픽이 전혀 발생하지 않습니다. 파일이 서버로 업로드되지 않으므로 보안팀 모니터링에 노출되지 않으며, 회사 보안 정책을 위반하지 않습니다.',
      },
    },
    {
      '@type': 'Question',
      name: 'AI가 잘못 가리면 어떻게 하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '탐지된 모든 항목은 개별적으로 확인하고 수동으로 가리기/표시를 선택할 수 있습니다. AI가 놓친 부분은 수동으로 추가할 수 있으며, 잘못 탐지된 항목은 제외할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '어떤 개인정보를 탐지하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '현재 주민등록번호, 전화번호, 이메일, 주소를 자동 탐지합니다. 정규표현식 기반의 패턴 매칭으로 높은 정확도를 제공하며, 향후 더 많은 패턴이 추가될 예정입니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.',
      },
    },
  ],
};

export default function PdfMaskingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PdfMaskingClient />
    </>
  );
}
