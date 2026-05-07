import type { Metadata } from "next";
import TileVisualizerClient from "./TileVisualizerClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === "ko";
  const title = isKo
    ? "욕실 타일 시뮬레이터 | Utility Hub"
    : "Bathroom Tile Visualizer | Utility Hub";
  const description = isKo
    ? "빈 방 사진에 가상으로 타일을 시공해보고, 가구(변기, 세면대)와 자연스럽게 합성되는 3D 원근감 타일 시뮬레이션을 제공합니다. 클라이언트 사이드 처리로 빠르고 안전합니다."
    : "Virtually apply tiles to an empty room photo and experience a realistic 3D perspective simulation that blends naturally with furniture. Fast and secure client-side processing.";
  const canonical = `https://www.theutilhub.com/${locale}/utilities/design/tile-visualizer`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/design/tile-visualizer`,
        en: `https://www.theutilhub.com/en/utilities/design/tile-visualizer`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Utility Hub",
      locale: isKo ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "욕실 타일 시뮬레이터",
  "alternateName": "Bathroom Tile Visualizer",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "KRW"
  },
  "url": "https://www.theutilhub.com/ko/utilities/design/tile-visualizer",
  "description": "빈 방 사진에 가상으로 타일을 시공해보고, 가구(변기, 세면대)와 자연스럽게 합성되는 3D 원근감 타일 시뮬레이션을 제공합니다. 클라이언트 사이드 처리로 빠르고 안전합니다."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "내가 가진 욕실 사진으로도 시뮬레이션 할 수 있나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "현재 버전은 최상의 3D 원근감 품질을 위해 사전 최적화된 욕실 사진과 전용 가구 마스크(투명 PNG)를 기본으로 제공하고 있습니다." }
    },
    {
      "@type": "Question",
      "name": "줄눈(메지) 색상과 두께를 변경할 수 있나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "네, 가능합니다. 구역 설정 패널에서 줄눈 두께를 픽셀 단위로 조정하고, 컬러 피커를 통해 원하는 줄눈 색상을 실시간으로 적용해 볼 수 있습니다." }
    },
    {
      "@type": "Question",
      "name": "생성된 타일 합성 이미지의 저작권은 어떻게 되나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "생성된 합성 이미지는 자유롭게 다운로드하여 상업적/비상업적 목적으로 활용하실 수 있습니다. 단, 업로드하는 타일 이미지 원본의 저작권은 유의하셔야 합니다." }
    },
    {
      "@type": "Question",
      "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 직접 확인하시기 바랍니다." }
    }
  ]
};

export default function TileVisualizerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <TileVisualizerClient />
    </>
  );
}
