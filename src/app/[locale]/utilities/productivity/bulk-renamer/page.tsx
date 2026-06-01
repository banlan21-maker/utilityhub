import type { Metadata } from 'next';
import BulkRenamerClient from './BulkRenamerClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '스마트 대량 파일명 변환기 (일괄 이름 변경 · 넘버링 · 정규식) | Utility Hub'
    : 'Smart Bulk Renamer (Batch Rename · Numbering · Regex) | Utility Hub';
  const description = isKo
    ? '여러 파일 이름을 찾기·바꾸기, 001 넘버링, 날짜 추가, 정규식으로 한 번에 변경하고 ZIP으로 받거나 폴더에 직접 저장. 파일은 서버로 전송되지 않습니다.'
    : 'Batch rename multiple files with find/replace, 001 numbering, date insertion, and regex, then download as ZIP or save straight to a folder. Files never leave your browser.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/productivity/bulk-renamer`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/productivity/bulk-renamer',
        en: 'https://www.theutilhub.com/en/utilities/productivity/bulk-renamer',
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
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '스마트 대량 파일명 변환기',
  alternateName: 'Smart Bulk Renamer',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/productivity/bulk-renamer',
  description:
    '여러 파일 이름을 찾기·바꾸기, 001 넘버링, 날짜 추가, 정규식으로 한 번에 변경하고 ZIP으로 받거나 폴더에 직접 저장하는 100% 브라우저 기반 일괄 파일명 변환 도구.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '업로드한 파일이 서버로 전송되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '아닙니다. 이 도구는 100% 사용자 브라우저 안에서만 작동합니다. 파일을 끌어다 놓아도 어떤 서버로도 전송되지 않으며, 이름 변경·ZIP 압축·폴더 저장 모든 과정이 사용자 기기 안에서만 일어납니다. 네트워크 탭으로 직접 확인하실 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '윈도우에서 쓸 수 없는 특수문자가 들어가면 어떻게 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '슬래시(/), 콜론(:), 물음표(?) 등 윈도우·맥에서 파일명에 쓸 수 없는 문자는 미리보기 단계에서 자동으로 밑줄(_)로 변환되며, 변환된 행에 표시가 나타납니다. 덕분에 저장 단계에서 오류 없이 안전하게 파일이 생성됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '파일이 아주 많아도 한 번에 처리할 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ZIP 다운로드는 안정성을 위해 500개 또는 1GB 이하로 제한됩니다. 그보다 많은 파일은 폴더에 직접 저장 기능(크롬·엣지 등 지원 브라우저)을 사용하면 개수 제한 없이 원본을 보존하며 새 이름으로 저장할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 툴은 파일명을 변경해 새 파일을 생성하며 원본은 그대로 보존합니다. 다만 중요한 데이터는 작업 전 백업을 권장합니다. 결과는 참고용이며, 정확한 처리가 필요한 경우 백업본으로 먼저 확인하시기 바랍니다.',
      },
    },
  ],
};

export default function BulkRenamerPage() {
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
      <BulkRenamerClient />
    </>
  );
}
