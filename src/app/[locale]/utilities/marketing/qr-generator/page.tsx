import type { Metadata } from 'next';
import QrGeneratorClient from './QrGeneratorClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? 'QR코드 생성기 | Utility Hub' : 'QR Code Generator | Utility Hub';
  const description = isKo
    ? 'URL이나 텍스트를 고해상도 QR 코드로 즉시 변환하고 PNG로 무료 다운로드하세요'
    : 'Convert any URL or text to a high-resolution QR code instantly. Free PNG download, no login required.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/marketing/qr-generator`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/marketing/qr-generator',
        en: 'https://www.theutilhub.com/en/utilities/marketing/qr-generator',
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
  name: '고해상도 QR 코드 생성기',
  alternateName: 'HD QR Code Generator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/marketing/qr-generator',
  description: 'URL이나 텍스트를 고해상도 QR 코드로 즉시 변환하고 PNG로 무료 다운로드하세요',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '생성된 QR 코드는 유효기간이 있나요?', acceptedAnswer: { '@type': 'Answer', text: '아니요. 본 도구가 생성하는 QR은 유효기간이 없는 정적 QR입니다. 가리키는 웹페이지 주소만 살아있다면 영구적으로 작동합니다.' } },
    { '@type': 'Question', name: 'QR 코드를 인쇄할 때 주의할 점은?', acceptedAnswer: { '@type': 'Answer', text: '고해상도 이미지(1200px)를 제공하므로 크게 인쇄해도 깨지지 않습니다. 다만, 스마트폰 인식을 위해 최소 2cm 이상의 크기를 권장합니다.' } },
    { '@type': 'Question', name: '이미지를 상업적으로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '네, 이 도구로 만든 QR 코드는 개인/기업 모두 저작권 제약 없이 상업적 용도로 자유롭게 사용하실 수 있습니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function QrGeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <QrGeneratorClient />
    </>
  );
}
