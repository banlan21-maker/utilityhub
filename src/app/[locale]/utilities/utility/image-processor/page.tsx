import type { Metadata } from 'next';
import ImageProcessorClient from './ImageProcessorClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '이미지 압축기 – 브라우저 무료 압축 | Utility Hub' : 'Image Compressor – Free Browser-Based Tool | Utility Hub';
  const description = isKo
    ? '브라우저에서 직접 이미지를 압축하는 무료 온라인 도구입니다. 서버 업로드 없이 JPG, PNG, WebP, GIF를 압축합니다.'
    : 'Compress images directly in your browser for free. No server upload — JPG, PNG, WebP, and GIF supported.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/image-processor`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/utility/image-processor`,
        en: `https://www.theutilhub.com/en/utilities/utility/image-processor`,
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '이미지 압축기',
  alternateName: 'Image Compressor',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/image-processor',
  description: '브라우저에서 직접 이미지를 압축하는 무료 온라인 도구입니다. 서버 업로드 없이 JPG, PNG, WebP, GIF를 압축합니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '이미지가 서버로 전송되나요?', acceptedAnswer: { '@type': 'Answer', text: '아니요. 이 도구는 완전히 브라우저에서 동작하며, 이미지 데이터는 인터넷을 통해 전송되지 않습니다. 개인 사진, 회사 자료 등 민감한 이미지도 안전하게 사용할 수 있습니다.' } },
    { '@type': 'Question', name: '품질 슬라이더를 어떻게 설정하면 좋나요?', acceptedAnswer: { '@type': 'Answer', text: '일반 웹사이트 이미지는 70~80%, 블로그 섬네일은 60~70%, 배경 이미지는 50~60%를 권장합니다. 미리보기로 화질을 확인하며 조절하세요.' } },
    { '@type': 'Question', name: 'PNG를 압축하면 투명도가 유지되나요?', acceptedAnswer: { '@type': 'Answer', text: '네. PNG 파일은 PNG 형식을 유지하므로 투명 배경(알파 채널)이 그대로 보존됩니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function ImageProcessorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ImageProcessorClient />
    </>
  );
}
