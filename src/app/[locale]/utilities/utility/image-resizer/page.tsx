import type { Metadata } from 'next';
import ImageResizerClient from './ImageResizerClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '이미지 리사이저 & 크롭 – SNS 규격 프리셋 | Utility Hub' : 'Image Resizer & Cropper – SNS Presets | Utility Hub';
  const description = isKo
    ? 'SNS 규격 프리셋으로 빠르게, 자유 편집도 지원하는 무료 이미지 리사이저입니다. Instagram, YouTube, OG 이미지 등 원클릭 설정.'
    : 'Free image resizer with quick SNS presets or custom crop — rotate, flip, resize for Instagram, YouTube, OG images and more.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/image-resizer`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/utility/image-resizer`,
        en: `https://www.theutilhub.com/en/utilities/utility/image-resizer`,
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '이미지 리사이저 & 크롭',
  alternateName: 'Image Resizer & Cropper',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/image-resizer',
  description: 'SNS 규격 프리셋으로 빠르게, 자유 편집도 지원하는 무료 이미지 리사이저입니다. Instagram, YouTube, OG 이미지 등 원클릭 설정.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'WebP와 JPG 중 어느 형식이 좋나요?', acceptedAnswer: { '@type': 'Answer', text: 'WebP는 동일 화질 기준으로 JPG보다 약 25~35% 파일 크기가 작습니다. Chrome, Safari, Firefox 등 최신 브라우저에서 모두 지원되므로 웹 사용 목적이라면 WebP를 권장합니다. SNS 업로드나 이메일 첨부는 JPG가 더 호환성이 좋습니다.' } },
    { '@type': 'Question', name: '비율 조절 시 화질이 저하되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 도구는 원본 이미지 픽셀 데이터를 그대로 사용하며, 출력 크기를 지정하면 해당 해상도로 다시 렌더링합니다. JPG·WebP는 손실 압축이므로 품질 슬라이더를 80% 이상으로 유지하면 육안으로 구분하기 어려운 화질을 유지할 수 있습니다.' } },
    { '@type': 'Question', name: 'PNG 투명도가 유지되나요?', acceptedAnswer: { '@type': 'Answer', text: '네, PNG 형식으로 저장 시 알파 채널(투명도)이 그대로 유지됩니다. 단, JPG·WebP는 투명도를 지원하지 않아 흰색 배경으로 채워집니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function ImageResizerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ImageResizerClient />
    </>
  );
}
