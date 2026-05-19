import type { Metadata } from 'next';
import ConstructionDictionaryClient from './ConstructionDictionaryClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '건설현장 용어 사전 — 헤베·루베·다루끼 뜻 한번에 | Utility Hub'
    : 'Construction Site Glossary — Korean Field Terms | Utility Hub';
  const description = isKo
    ? '건설현장 일본어 은어·속어를 직종별로 정리한 검색 사전. 헤베·루베·다루끼·나라시·아시바 등 120여 개 수록. 공통·골조·목공·배관·전기·비계·도장 카테고리. 단위 변환기(평↔㎡, 자·치↔cm) 포함.'
    : 'Searchable glossary of Korean construction site jargon by trade. 120+ terms including Japanese-origin slang with standard Korean equivalents, origins, and field examples. Built-in unit converter.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/construction-dictionary`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/utility/construction-dictionary',
        en: 'https://www.theutilhub.com/en/utilities/utility/construction-dictionary',
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
  name: '건설현장 용어 사전',
  alternateName: 'Construction Site Glossary',
  operatingSystem: 'Web Browser',
  applicationCategory: 'EducationApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/construction-dictionary',
  description:
    '건설현장 일본어 은어·속어를 직종별로 정리한 검색 사전. 헤베·루베·다루끼·나라시·아시바 등 120여 개 수록.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '왜 일본어 잔재 용어가 그대로 쓰이나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '일제강점기와 1970~80년대 건설 붐 시기에 일본 기술서·일본인 기술자로부터 전수받은 용어가 굳어진 결과입니다. 정부와 업계가 표준어 사용을 권장하지만, 세대 간 전수로 인해 현장에서는 여전히 일상적으로 쓰입니다.',
      },
    },
    {
      '@type': 'Question',
      name: '헤베·루베·평 차이가 뭔가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '헤베는 제곱미터(㎡, 면적), 루베는 세제곱미터(㎥, 부피), 평은 한국 전통 면적 단위(1평 ≈ 3.3058㎡)입니다. 본 사전 하단의 단위 변환기로 즉시 환산할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '장반경(LR)과 단반경(SR) 엘보는 어떻게 다른가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LR(장반경)은 굽힘반경이 NPS의 1.5배로 흐름이 완만하며 표준입니다. SR(단반경)은 굽힘반경이 NPS와 같아 좁은 공간에 적합하지만 흐름 저항이 큽니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 사전을 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '본 사전은 현장 의사소통 참고용입니다. 정식 견적서, 시방서, 설계도서 작성 시에는 한국산업표준(KS) 용어나 건설표준품셈에 정의된 표준어를 사용해야 합니다.',
      },
    },
  ],
};

export default function ConstructionDictionaryPage() {
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
      <ConstructionDictionaryClient />
    </>
  );
}
