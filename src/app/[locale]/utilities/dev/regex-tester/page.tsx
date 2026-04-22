import type { Metadata } from 'next';
import RegexTesterClient from './RegexTesterClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '정규표현식(Regex) 테스터 | Utility Hub' : 'Regex Tester | Utility Hub';
  const description = isKo
    ? '패턴과 테스트 문자열을 입력하면 매칭 부분을 실시간으로 강조 표시하는 무료 온라인 정규표현식 테스터입니다.'
    : 'Free online regex tester that highlights matches in real time. Supports g, i, m, s flags with a built-in cheat sheet.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/dev/regex-tester`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/dev/regex-tester',
        en: 'https://www.theutilhub.com/en/utilities/dev/regex-tester',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '정규표현식(Regex) 테스터',
  alternateName: 'Regex Tester',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/dev/regex-tester',
  description: '패턴과 테스트 문자열을 입력하면 실시간으로 일치하는 부분을 강조 표시하고 매치 수를 계산하는 무료 온라인 정규표현식 테스터입니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '정규표현식에서 특수문자를 검색하려면?', acceptedAnswer: { '@type': 'Answer', text: '특수문자(. * + ? ^ $ { } [ ] | ( ) \\) 앞에 백슬래시(\\)를 붙여 이스케이프합니다. 예를 들어 점(.)을 검색하려면 \\.을 사용합니다.' } },
    { '@type': 'Question', name: '이메일 검증 정규식이 완벽하지 않은 이유는?', acceptedAnswer: { '@type': 'Answer', text: 'RFC 5322 표준을 완전히 따르는 이메일 정규식은 매우 복잡합니다. 실무에서는 기본 형식 확인 후 서버에서 실제 이메일 발송 테스트로 최종 검증하는 것을 권장합니다.' } },
    { '@type': 'Question', name: '자바스크립트에서 정규식을 사용하는 방법은?', acceptedAnswer: { '@type': 'Answer', text: '/패턴/플래그 리터럴 또는 new RegExp("패턴", "플래그")로 생성합니다. test(), match(), matchAll(), replace(), split() 등의 메서드와 함께 사용합니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function RegexTesterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <RegexTesterClient />
    </>
  );
}
