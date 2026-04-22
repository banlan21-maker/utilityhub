import type { Metadata } from 'next';
import ResumeHelperClient from './ResumeHelperClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '자소서 작성 헬퍼 | Utility Hub' : 'Cover Letter Helper | Utility Hub';
  const description = isKo
    ? '실시간 글자 수/바이트 카운터와 부산대 맞춤법 검사기를 한 번에! 취업 준비생을 위한 자소서 도우미.'
    : 'Real-time character/byte counter with Korean spell checker integration. The ultimate cover letter writing tool for job seekers.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/productivity/resume-helper`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/productivity/resume-helper',
        en: 'https://www.theutilhub.com/en/utilities/productivity/resume-helper',
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
  name: '자소서 작성 헬퍼',
  alternateName: 'Cover Letter Helper',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/productivity/resume-helper',
  description: '실시간 글자 수/바이트 카운터와 부산대 맞춤법 검사기를 한 번에! 취업 준비생을 위한 자소서 도우미.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '공백 포함과 공백 제외, 어느 기준으로 계산해야 하나요?', acceptedAnswer: { '@type': 'Answer', text: '대기업(삼성, 현대, LG 등)과 공공기관은 대부분 공백 포함 기준을 사용합니다. 지원 공고의 안내 사항을 확인하시고, 명시되지 않은 경우 공백 포함 기준을 사용하는 것이 안전합니다.' } },
    { '@type': 'Question', name: '바이트(Byte) 계산이 왜 필요한가요?', acceptedAnswer: { '@type': 'Answer', text: '일부 구형 채용 시스템이나 공공기관 시스템은 글자 수 대신 바이트 기준으로 제한을 설정합니다. 한글 1자는 UTF-8 기준 3바이트이므로, 바이트 카운터를 통해 시스템 오류를 미리 방지할 수 있습니다.' } },
    { '@type': 'Question', name: '작성 중 브라우저를 닫으면 내용이 사라지나요?', acceptedAnswer: { '@type': 'Answer', text: '아니요. 입력한 내용은 브라우저 LocalStorage에 자동 저장됩니다. 브라우저를 닫았다가 다시 열어도 마지막으로 작성한 내용이 복원됩니다. 단, 브라우저 데이터를 삭제하면 함께 삭제됩니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function ResumeHelperPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ResumeHelperClient />
    </>
  );
}
