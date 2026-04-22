import type { Metadata } from 'next';
import ExcelMapperClient from './ExcelMapperClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '스마트 엑셀 매퍼 | Utility Hub' : 'Smart Excel Mapper | Utility Hub';
  const description = isKo
    ? '엑셀 파일을 업로드하고 컬럼을 매핑해 원하는 형식으로 즉시 변환·다운로드하세요.'
    : 'Upload an Excel file, map columns visually, and instantly download the transformed output in your desired format.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/productivity/excel-mapper`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/productivity/excel-mapper',
        en: 'https://www.theutilhub.com/en/utilities/productivity/excel-mapper',
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
  name: '스마트 엑셀 매퍼',
  alternateName: 'Smart Excel Mapper',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/productivity/excel-mapper',
  description: '엑셀 파일을 업로드하고 컬럼을 매핑해 원하는 형식으로 즉시 변환·다운로드하세요.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '어떤 엑셀 파일 형식을 지원하나요?', acceptedAnswer: { '@type': 'Answer', text: '.xlsx, .xls 형식의 엑셀 파일을 지원합니다. 파일은 브라우저에서만 처리되며 서버에 업로드되지 않으므로 데이터가 외부로 유출되지 않습니다.' } },
    { '@type': 'Question', name: '원본 파일이 변경되거나 삭제되나요?', acceptedAnswer: { '@type': 'Answer', text: '아니요. 이 툴은 원본 파일을 읽기만 하며 수정하거나 삭제하지 않습니다. 변환 결과는 별도의 새 파일로 다운로드됩니다.' } },
    { '@type': 'Question', name: '헤더 행이 여러 줄인 경우도 처리할 수 있나요?', acceptedAnswer: { '@type': 'Answer', text: '파일 업로드 후 헤더 행 번호를 직접 지정할 수 있습니다. 데이터 시작 행도 별도로 설정 가능하므로 복잡한 헤더 구조도 처리할 수 있습니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function ExcelMapperPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ExcelMapperClient />
    </>
  );
}
