import type { Metadata } from 'next';
import JsonFormatterClient from './JsonFormatterClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? 'JSON 포맷터 & 뷰어 | Utility Hub' : 'JSON Formatter & Viewer | Utility Hub';
  const description = isKo
    ? 'JSON 문자열을 들여쓰기·트리 뷰·압축 형식으로 즉시 변환하고 구문 오류를 실시간 검출하는 무료 온라인 JSON 포맷터입니다.'
    : 'Free online JSON formatter that instantly prettifies, tree-views, and minifies JSON strings while detecting syntax errors in real time.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/dev/json-formatter`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/dev/json-formatter',
        en: 'https://www.theutilhub.com/en/utilities/dev/json-formatter',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'JSON 포맷터 & 뷰어',
  alternateName: 'JSON Formatter & Viewer',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/dev/json-formatter',
  description: '압축되거나 읽기 어려운 JSON 문자열을 들여쓰기가 적용된 가독성 높은 형식으로 변환하고, 구문 오류를 즉시 검출하는 무료 온라인 JSON 포맷터입니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'JSON 유효성 검사는 어떻게 하나요?', acceptedAnswer: { '@type': 'Answer', text: '입력 즉시 자동으로 JSON을 파싱해 오류 여부를 하단 상태바에 표시합니다. 오류 발생 시 정확한 오류 메시지도 함께 보여줍니다.' } },
    { '@type': 'Question', name: 'JSON과 YAML의 차이는 무엇인가요?', acceptedAnswer: { '@type': 'Answer', text: 'JSON은 중괄호와 따옴표를 사용하는 엄격한 형식으로 기계 친화적이고, YAML은 들여쓰기 기반의 인간 친화적 형식입니다. 둘 다 설정 파일과 데이터 직렬화에 사용됩니다.' } },
    { '@type': 'Question', name: 'JSON을 JavaScript 객체로 변환하려면?', acceptedAnswer: { '@type': 'Answer', text: 'JSON.parse() 메서드를 사용합니다. 반대로 객체를 JSON으로 변환할 때는 JSON.stringify()를 사용하며, 두 번째 인수로 null, 세 번째 인수로 들여쓰기 공백 수를 전달하면 이 포맷터처럼 예쁘게 출력됩니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function JsonFormatterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <JsonFormatterClient />
    </>
  );
}
