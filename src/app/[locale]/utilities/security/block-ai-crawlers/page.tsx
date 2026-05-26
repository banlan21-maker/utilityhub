import type { Metadata } from 'next';
import BlockAiCrawlersClient from './BlockAiCrawlersClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? 'AI 학습 차단 코드 생성기 — GPTBot·ClaudeBot 차단 | Utility Hub'
    : 'Block AI Crawlers — Stop GPTBot, ClaudeBot & More | Utility Hub';
  const description = isKo
    ? 'OpenAI·Anthropic·Google 등 AI 크롤러의 무단 학습 수집을 차단하는 robots.txt·메타태그·서버헤더·llms.txt를 즉시 생성. 구글 일반 검색 노출은 그대로 유지.'
    : 'Instantly generate robots.txt, meta tags, server headers, and llms.txt to block AI crawlers like GPTBot and ClaudeBot from scraping your content. Normal Google search stays intact.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/security/block-ai-crawlers`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/security/block-ai-crawlers',
        en: 'https://www.theutilhub.com/en/utilities/security/block-ai-crawlers',
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
  name: 'AI 학습 차단 코드 생성기',
  alternateName: 'Block AI Crawlers',
  operatingSystem: 'Web Browser',
  applicationCategory: 'SecurityApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/security/block-ai-crawlers',
  description:
    'OpenAI·Anthropic·Google 등 AI 크롤러의 무단 학습 수집을 차단하는 robots.txt·메타태그·서버헤더·llms.txt를 즉시 생성하는 무료 도구.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'AI 학습을 막으면 구글 검색에서도 사라지나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '아니요. Google-Extended(AI 학습용 봇)와 Googlebot(검색 색인용 봇)은 완전히 별개입니다. 본 도구는 AI 학습 봇만 차단하므로 구글·빙 일반 검색 노출은 100% 유지됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: 'robots.txt로 정말 AI 봇을 막을 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'OpenAI, Anthropic, Google 등 주요 AI 기업은 공식적으로 robots.txt를 준수한다고 명시하고 있어 대부분의 메이저 봇은 차단됩니다. 더 강한 차단이 필요하면 서버 헤더(X-Robots-Tag)나 방화벽 차단을 병행하세요.',
      },
    },
    {
      '@type': 'Question',
      name: 'robots.txt와 메타태그, 서버 헤더 중 뭘 써야 하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'robots.txt가 가장 표준적이고 사이트 전체에 한 번에 적용되어 권장됩니다. 특정 폴더만 막으려면 robots.txt나 서버 헤더가 적합하며, HTML 메타태그는 페이지 단위라 폴더 차단에 부적합합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '표준 규격 기반 코드를 생성하지만 AI 봇 정책은 수시로 변합니다. 법적 효력이 필요한 저작권 보호에는 robots.txt만으로 충분하지 않으므로 이용약관·DRM·법적 조치 등을 병행하세요.',
      },
    },
  ],
};

export default function BlockAiCrawlersPage() {
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
      <BlockAiCrawlersClient />
    </>
  );
}
