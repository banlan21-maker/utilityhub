import type { Metadata } from 'next';
import GifMasterClient from './GifMasterClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? 'GIF 마스터 — GIF 압축·생성 통합 툴 | Utility Hub'
    : 'GIF Master — GIF Compressor & Generator | Utility Hub';
  const description = isKo
    ? 'GIF 압축, 이미지→GIF, 텍스트 애니메이션 GIF, 동영상→GIF까지. 설치 없이 브라우저에서 바로 사용하는 무료 GIF 통합 툴.'
    : 'Compress GIFs, convert images to GIF, create text animation GIFs, and turn videos into GIFs — all free, browser-based, no install needed.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/gif-master`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/utility/gif-master',
        en: 'https://www.theutilhub.com/en/utilities/utility/gif-master',
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
  name: 'GIF 마스터',
  alternateName: 'GIF Master',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/gif-master',
  description: 'GIF 압축, 이미지→GIF, 텍스트 애니메이션 GIF, 동영상→GIF까지. 설치 없이 브라우저에서 바로 사용하는 무료 GIF 통합 툴.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'GIF 파일이 너무 커서 업로드가 안 돼요.',
      acceptedAnswer: { '@type': 'Answer', text: '현재 GIF 압축은 최대 50MB, GIF 생성의 동영상 변환은 최대 100MB까지 지원합니다. 그보다 큰 파일은 먼저 다른 도구로 분할하거나 해상도를 줄인 뒤 업로드해주세요. 이미지→GIF는 장당 최대 10MB, 최대 20장까지 지원합니다.' },
    },
    {
      '@type': 'Question',
      name: '업로드한 파일이 외부 서버로 전송되나요?',
      acceptedAnswer: { '@type': 'Answer', text: '아닙니다. GIF 마스터의 모든 처리는 사용자의 브라우저(기기) 안에서만 이루어집니다. 파일이 외부 서버로 전송되거나 저장되는 일은 없으므로 개인 사진, 회사 자료 등 민감한 파일도 안심하고 사용할 수 있습니다.' },
    },
    {
      '@type': 'Question',
      name: '동영상→GIF 변환 시 왜 15초 이내로 제한하나요?',
      acceptedAnswer: { '@type': 'Answer', text: '브라우저에서 동영상을 GIF로 변환할 때는 초당 N장의 프레임을 Canvas에 그린 뒤 하나씩 합성하는 방식으로 동작합니다. 구간이 길어질수록 처리할 프레임 수가 급격히 늘어나 브라우저가 멈추거나 메모리 부족이 발생할 수 있습니다. 10fps 기준 15초 = 150프레임으로, 대부분의 기기에서 안정적으로 처리할 수 있는 최대치입니다.' },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: { '@type': 'Answer', text: '이 툴의 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
    },
  ],
};

export default function GifMasterPage() {
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
      <GifMasterClient />
    </>
  );
}
