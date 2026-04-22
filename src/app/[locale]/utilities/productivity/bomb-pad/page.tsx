import type { Metadata } from 'next';
import BombPadClient from './BombPadClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '72시간 시한폭탄 패드 | Utility Hub' : '72H Bomb Pad | Utility Hub';
  const description = isKo
    ? '마지막 수정으로부터 72시간만 생존하는 AES-256 암호화 공유 메모장. 아무도 안 쓰면 폭발합니다.'
    : 'A shared notepad that self-destructs 72 hours after the last edit. AES-256 encrypted — nobody writes = BOOM.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/productivity/bomb-pad`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/productivity/bomb-pad',
        en: 'https://www.theutilhub.com/en/utilities/productivity/bomb-pad',
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
  name: '72시간 시한폭탄 패드',
  alternateName: '72H Bomb Pad',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/productivity/bomb-pad',
  description: '마지막 수정으로부터 72시간만 생존하는 AES-256 암호화 공유 메모장. 아무도 안 쓰면 폭발합니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '정말 운영자도 내용을 볼 수 없나요?', acceptedAnswer: { '@type': 'Answer', text: '네. 내용은 브라우저에서 AES-256-GCM으로 암호화된 후 저장됩니다. 암호화 키는 URL의 # 뒤에만 존재하며 서버로 전송되지 않습니다. 데이터베이스에는 암호화된 덩어리만 저장됩니다.' } },
    { '@type': 'Question', name: '수정하면 시간이 얼마나 늘어나나요?', acceptedAnswer: { '@type': 'Answer', text: '수정할 때마다 남은 시간과 무관하게 72:00:00으로 완전 리셋됩니다.' } },
    { '@type': 'Question', name: '링크를 잃어버리면 어떻게 되나요?', acceptedAnswer: { '@type': 'Answer', text: '#이 포함된 전체 URL을 잃어버리면 복호화 키가 없어 내용에 접근할 수 없습니다. 링크는 안전한 곳에 보관하세요.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

export default function BombPadPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <BombPadClient />
    </>
  );
}
