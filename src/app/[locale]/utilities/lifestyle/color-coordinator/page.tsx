import type { Metadata } from 'next';
import ColorCoordinatorClient from './ColorCoordinatorClient';
import ToolJsonLd from '@/app/components/ToolJsonLd';
import { SEO_KO } from './content';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/lifestyle/color-coordinator';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? 'OOTD 코디 색 조합 추천 — 퍼스널 컬러 마네킹 시뮬레이터 | Utility Hub'
    : 'Outfit Color Combinations – OOTD Color Coordinator | Utility Hub';
  const description = isKo
    ? '모자·아우터·상의·하의·신발 색을 마네킹에 입혀 보고 3색 원칙·보색·명도 대비로 조합을 점검합니다. 봄웜·여름쿨·가을웜·겨울쿨 퍼스널 컬러 팔레트, 데일리·포인트·소프트 룩 자동 추천, PNG 저장까지 무료.'
    : 'See what colors go together: dress a mannequin in five pieces, check the outfit against the three-color rule, contrast and warm/cool harmony, and browse Spring, Summer, Autumn and Winter personal color palettes. Free, no sign-up.';
  const canonical = `${BASE}/${locale}${PATH}`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { ko: `${BASE}/ko${PATH}`, en: `${BASE}/en${PATH}`, 'x-default': `${BASE}/ko${PATH}` },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'OOTD 컬러 코디네이터',
  alternateName: 'OOTD Color Coordinator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'LifestyleApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: `${BASE}/ko${PATH}`,
  description: '마네킹에 코디 색을 입혀 보고 퍼스널 컬러 4계절 팔레트와 3색 원칙·보색·명도 대비로 조합을 점검하는 무료 코디 도구',
};

// 화면의 한국어 FAQ와 같은 내용
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: SEO_KO.faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default async function ColorCoordinatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      {locale === 'ko' ? (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        </>
      ) : (
        <ToolJsonLd href={PATH} />
      )}
      <ColorCoordinatorClient />
    </>
  );
}
