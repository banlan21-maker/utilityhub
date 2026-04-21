import type { Metadata } from 'next';
import ImgPdfConverterClient from './ImgPdfConverterClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '이미지 ↔ PDF 변환기 | Utility Hub'
    : 'Image ↔ PDF Converter | Utility Hub';
  const description = isKo
    ? 'JPG, PNG, WebP 이미지를 PDF로 병합하거나 PDF를 고화질 이미지로 추출. 100% 브라우저 로컬 처리, 서버 전송 없음.'
    : 'Merge JPG, PNG, WebP images into PDF or extract PDF pages as high-quality images. 100% local browser processing, no server upload.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/document/img-pdf-converter`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/document/img-pdf-converter',
        en: 'https://www.theutilhub.com/en/utilities/document/img-pdf-converter',
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
  name: '이미지 PDF 변환기',
  alternateName: 'Image PDF Converter',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/document/img-pdf-converter',
  description:
    'JPG, PNG, WebP 이미지를 PDF로 병합하거나, PDF를 고화질 PNG 이미지로 추출하는 무료 온라인 도구입니다. 100% 브라우저에서 처리되어 파일이 서버로 전송되지 않습니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '파일 용량 제한이 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '서버를 사용하지 않고 브라우저 메모리 내에서 처리되므로, 기기의 메모리에 따라 다릅니다. 일반적으로 수십 MB의 이미지나 PDF도 문제없이 처리할 수 있습니다. 대용량 파일의 경우 최신 브라우저와 충분한 RAM을 권장합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이미지 순서를 바꿀 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네! "이미지 → PDF" 모드에서 썸네일을 마우스로 드래그하여 자유롭게 순서를 변경할 수 있습니다. 좌측 상단의 숫자로 현재 순서를 확인할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: 'PDF 품질은 어떻게 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '원본 이미지의 해상도를 최대한 유지합니다. "용지 크기"를 "Auto"로 설정하면 이미지 원본 크기 그대로 PDF에 삽입되며, "A4"로 설정하면 A4 용지에 맞춰 조정됩니다.',
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

export default function ImgPdfConverterPage() {
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
      <ImgPdfConverterClient />
    </>
  );
}
