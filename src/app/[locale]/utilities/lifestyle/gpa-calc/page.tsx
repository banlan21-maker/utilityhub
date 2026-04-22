import type { Metadata } from 'next';
import GpaCalcClient from './GpaCalcClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '학점 변환기 (GPA Converter) | Utility Hub' : 'GPA Converter | Utility Hub';
  const description = isKo
    ? '4.5·4.3·100점 만점 GPA를 자동 변환하고 전공·교양 학점을 분리 계산하는 무료 학점 변환기'
    : 'Automatically convert between 4.5, 4.3, and 100-point GPA scales with separate major and liberal arts calculations.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/gpa-calc`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/gpa-calc',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/gpa-calc',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '학점 변환기 (GPA Converter)',
  alternateName: 'GPA Converter',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/gpa-calc',
  description: '4.5·4.3·100점 만점 GPA를 자동 변환하고 전공·교양 학점을 분리 계산하는 무료 학점 변환기',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '4.5 학점을 4.3으로 바꾸면 불리한가요?', acceptedAnswer: { '@type': 'Answer', text: '4.5 기준 A+(4.5)를 4.3으로 환산하면 약 4.3이 되어 손해가 없습니다. 하지만 중간 등급(예: B+)은 4.5 기준 3.5 → 4.3 기준 약 3.33으로 수치가 소폭 낮아집니다. 지원서에는 자신에게 유리한 기준을 선택하되, 학교 공식 기준을 병기하는 것이 권장됩니다.' } },
    { '@type': 'Question', name: '졸업 평점이 기재 기준보다 낮으면 지원이 불가능한가요?', acceptedAnswer: { '@type': 'Answer', text: '많은 기업에서 4.5 만점 기준 3.0 이상을 커트라인으로 사용하지만, 이는 참고용이며 절대적 기준은 아닙니다. 자소서, 어학 점수, 경험 등 다른 요소로 보완될 수 있으므로 지원 자격 요건을 먼저 확인하세요.' } },
    { '@type': 'Question', name: '대학마다 학점 기준이 다른데 어떻게 하나요?', acceptedAnswer: { '@type': 'Answer', text: '이 도구는 국내 대학에서 가장 많이 사용되는 표준 환산 기준을 적용합니다. 일부 대학은 A+ = 4.3(최고) 또는 A = 4.5 등 고유 기준을 사용하므로, 정확한 환산이 필요하다면 학교 학사지원팀에 문의하거나 성적증명서의 기준을 확인하세요.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function GpaCalcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <GpaCalcClient />
    </>
  );
}
