import { tools } from '@/lib/tools-registry';

const BASE = 'https://www.theutilhub.com';

/**
 * 영문 페이지용 SoftwareApplication JSON-LD — 도구 목록의 영문 이름·설명으로 만든다.
 * (FAQPage는 화면에 보이는 영어 FAQ와 같도록 SeoSection이 내보낸다)
 */
export default function ToolJsonLd({ href }: { href: string }) {
  const tool = tools.find(t => t.href === href);
  if (!tool) return null;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.nameEn ?? tool.slug,
    operatingSystem: 'Web Browser',
    applicationCategory: 'UtilitiesApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    url: `${BASE}/en${tool.href}`,
    inLanguage: 'en',
    description: tool.descEn,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
