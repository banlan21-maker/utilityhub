import type { Metadata } from 'next';
import PhotoBatchMasterClient from './PhotoBatchMasterClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '사진 일괄 편집기 — 보정 & 워터마크 | Utility Hub'
    : 'Photo Batch Master — Batch Editor & Watermark | Utility Hub';
  const description = isKo
    ? '여러 이미지를 한 번에 밝기·대비·색감 보정하고 텍스트 또는 이미지 워터마크를 일괄 삽입하는 전문가용 브라우저 기반 도구입니다.'
    : 'Batch photo editor that applies color grading and text or image watermarks to multiple photos at once — all in your browser.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/design/photo-batch-master`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/design/photo-batch-master',
        en: 'https://www.theutilhub.com/en/utilities/design/photo-batch-master',
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
  name: 'Photo Batch Master — 일괄 사진 보정 & 워터마크 삽입',
  alternateName: 'Photo Batch Master — Batch Photo Editor & Watermark Tool',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/design/photo-batch-master',
  description: '여러 장의 사진을 동일한 밝기·대비·색감으로 보정하고 텍스트 또는 이미지 워터마크를 일괄 삽입하는 전문가용 브라우저 기반 도구입니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '워터마크는 어떤 위치에 넣을 수 있나요?',
      acceptedAnswer: { '@type': 'Answer', text: '9개 구역(좌상단·중상단·우상단·좌중단·정중앙·우중단·좌하단·중하단·우하단) 중 원하는 위치를 클릭하여 선택할 수 있습니다.' },
    },
    {
      '@type': 'Question',
      name: '이미지 워터마크로 어떤 파일을 쓸 수 있나요?',
      acceptedAnswer: { '@type': 'Answer', text: 'PNG, JPG, WebP 등 브라우저가 지원하는 모든 이미지를 사용할 수 있습니다. 투명 배경의 PNG 로고를 권장합니다.' },
    },
    {
      '@type': 'Question',
      name: '사진 개수 제한이 있나요?',
      acceptedAnswer: { '@type': 'Answer', text: '브라우저 성능에 따라 다르지만 보통 20~30장 정도는 무리 없이 처리 가능합니다.' },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
    },
  ],
};

export default function PhotoBatchMasterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PhotoBatchMasterClient />
    </>
  );
}
