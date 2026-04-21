import type { Metadata } from 'next';
import PomodoroClient from './PomodoroClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '포모도로 타이머 | Utility Hub'
    : 'Pomodoro Timer | Utility Hub';
  const description = isKo
    ? '25분 집중 + 5분 휴식 사이클로 집중력을 높이는 무료 포모도로 타이머. 설치 없이 브라우저에서 바로 사용하세요.'
    : 'Free Pomodoro timer with 25-min focus and 5-min break cycles. Runs in your browser — no install needed.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/productivity/pomodoro`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/productivity/pomodoro',
        en: 'https://www.theutilhub.com/en/utilities/productivity/pomodoro',
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
  name: '포모도로 타이머',
  alternateName: 'Pomodoro Timer',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/productivity/pomodoro',
  description: '25분 집중 + 5분 휴식 사이클로 집중력을 높이는 무료 포모도로 타이머. 설치 없이 브라우저에서 바로 사용하세요.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '포모도로 한 번 중간에 방해받으면 어떻게 해야 하나요?', acceptedAnswer: { '@type': 'Answer', text: "포모도로 기법의 핵심 원칙은 한 사이클의 완전한 집중입니다. 부득이한 방해가 생기면 타이머를 멈추고 이슈를 메모한 후, 처음부터 다시 시작하는 것이 권장됩니다. 해당 포모도로는 '무효'로 처리합니다." } },
    { '@type': 'Question', name: '25분이 너무 짧거나 길게 느껴집니다. 조절할 수 있나요?', acceptedAnswer: { '@type': 'Answer', text: '네. 우측 상단 설정(⚙️) 버튼에서 집중 시간, 짧은 휴식, 긴 휴식 시간을 자유롭게 조정할 수 있습니다. 처음에는 25분이 어색할 수 있지만, 일주일 정도 사용하면 자연스럽게 적응됩니다.' } },
    { '@type': 'Question', name: '브라우저 알림이 오지 않습니다', acceptedAnswer: { '@type': 'Answer', text: "브라우저 주소창 왼쪽 자물쇠 아이콘 → '알림' 권한을 '허용'으로 변경하세요. 또는 화면의 '알림 허용' 버튼을 클릭해 권한을 부여하면 됩니다." } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function PomodoroPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PomodoroClient />
    </>
  );
}
