import type { Metadata } from 'next';
import PdfOcrClient from './PdfOcrClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? 'PDF 검색 변환기 — 스캔 문서를 Ctrl+F 검색 가능하게 | Utility Hub'
    : 'PDF OCR Converter — Make Scanned PDF Searchable | Utility Hub';
  const description = isKo
    ? '스캔된 계약서, 공문서, 팩스 문서를 Ctrl+F로 검색 가능한 PDF로 변환합니다. 파일이 서버로 전송되지 않아 완전한 개인정보 보호. PC 환경 권장.'
    : 'Convert scanned contracts, official documents, and faxed files into searchable PDFs. 100% client-side — files never leave your browser. PC recommended.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/document/pdf-ocr`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/document/pdf-ocr',
        en: 'https://www.theutilhub.com/en/utilities/document/pdf-ocr',
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
  name: 'PDF 검색 변환기',
  alternateName: 'PDF OCR Converter',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/document/pdf-ocr',
  description:
    '스캔된 계약서, 공문서, 팩스 문서를 Ctrl+F로 검색 가능한 PDF로 변환합니다. 파일이 서버로 전송되지 않아 완전한 개인정보 보호. PC 환경 권장.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '변환 후 파일 크기가 왜 크게 늘어나나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '원본 PDF가 벡터(선) 기반으로 가볍게 만들어진 경우에도, 변환 과정에서 모든 페이지가 JPEG 이미지로 변환되어 PDF에 삽입됩니다. 이 때문에 원본이 2MB였던 PDF가 변환 후 10~30MB로 커질 수 있습니다. 파일 크기를 줄이려면 렌더링 품질을 "표준(1.5×)"으로 낮춰보세요.',
      },
    },
    {
      '@type': 'Question',
      name: '모바일에서는 왜 10페이지로 제한되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '모바일 브라우저는 탭당 사용 가능한 메모리에 엄격한 한도가 있습니다. 특히 아이폰 사파리에서 고해상도로 많은 페이지를 처리하면 메모리 초과로 브라우저 탭이 강제 종료될 수 있어 10페이지로 제한합니다. 제한 없이 사용하려면 PC에서 접속해 주세요.',
      },
    },
    {
      '@type': 'Question',
      name: 'CAD 도면은 잘 변환되지 않나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '선과 글자가 겹치는 복잡한 CAD 도면은 Tesseract OCR 엔진이 선을 노이즈로 인식해 글자를 누락할 수 있습니다. 치수선이 밀집된 설계 도면보다는 텍스트와 선이 분리된 자재표, 부재 목록, 스캔된 계약서·공문서에서 높은 인식률을 보입니다.',
      },
    },
    {
      '@type': 'Question',
      name: '파일이 서버로 전송되나요? 기밀 문서도 안전한가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '파일은 절대 서버로 전송되지 않습니다. 모든 OCR 처리는 사용자의 브라우저 안에서만 실행되며, 인터넷 연결 없이도 작동합니다. 따라서 회사 기밀 문서나 개인 정보가 담긴 민감한 문서도 외부 유출 걱정 없이 안심하고 사용할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 툴의 OCR 변환 결과는 참고용으로만 제공됩니다. OCR 인식 과정에서 오탈자나 누락이 발생할 수 있으므로, 공식적인 용도로 사용 시에는 반드시 원본 문서와 대조하여 확인하시기 바랍니다.',
      },
    },
  ],
};

export default function PdfOcrPage() {
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
      <PdfOcrClient />
    </>
  );
}
