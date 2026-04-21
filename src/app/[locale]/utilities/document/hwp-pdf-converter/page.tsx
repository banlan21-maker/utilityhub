import type { Metadata } from 'next';
import HwpConverterClient from './HwpConverterClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? 'HWP → PDF 변환기 | Utility Hub'
    : 'HWP to PDF Converter | Utility Hub';
  const description = isKo
    ? 'HWP(한글) 및 HWPX 파일을 PDF 또는 Word(DOCX)로 변환. 한컴오피스 없이 맥·리눅스·모바일에서 즉시 사용.'
    : 'Convert HWP and HWPX files to PDF or Word (DOCX) online — no Hancom Office needed, works on Mac, Linux, and mobile.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/document/hwp-pdf-converter`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/document/hwp-pdf-converter',
        en: 'https://www.theutilhub.com/en/utilities/document/hwp-pdf-converter',
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
  name: 'HWP PDF 변환기',
  alternateName: 'HWP to PDF Converter',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/document/hwp-pdf-converter',
  description: 'HWP(한글) 및 HWPX 파일을 PDF 또는 Word(DOCX)로 변환하는 무료 온라인 도구입니다. 한컴오피스가 설치되지 않은 맥, 리눅스, 스마트폰에서도 즉시 사용할 수 있습니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'HWP와 HWPX 중 어느 형식이 더 잘 변환되나요?', acceptedAnswer: { '@type': 'Answer', text: 'HWPX 형식이 훨씬 정확하게 변환됩니다. HWPX는 국제 표준 XML 기반이라 구조 파악이 용이하고, HWP(바이너리)는 레거시 형식이라 일부 요소가 다르게 표현될 수 있습니다. 한컴오피스 2014 이상에서 "다른 이름으로 저장 → HWPX"로 먼저 변환 후 업로드를 권장합니다.' } },
    { '@type': 'Question', name: '변환된 PDF에서 글꼴이 깨집니다', acceptedAnswer: { '@type': 'Answer', text: '서버에 설치된 폰트와 원본 문서에서 사용한 폰트가 다를 경우 대체 폰트로 표시됩니다. 주요 한글 폰트(맑은 고딕, 나눔고딕 등)는 기본 지원되며, 특수 폰트는 깨질 수 있습니다.' } },
    { '@type': 'Question', name: '업로드한 파일은 서버에 저장되나요?', acceptedAnswer: { '@type': 'Answer', text: '변환에 사용된 파일은 처리 후 즉시 삭제되며 서버에 보관되지 않습니다. 개인정보가 포함된 중요 문서도 안심하고 변환하실 수 있습니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function HwpConverterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HwpConverterClient />
    </>
  );
}
