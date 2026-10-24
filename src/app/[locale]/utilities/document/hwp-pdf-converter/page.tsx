import type { Metadata } from 'next';
import HwpConverterClient from './HwpConverterClient';

const BASE = 'https://www.theutilhub.com';
const PATH = '/utilities/document/hwp-pdf-converter';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? 'HWP·HWPX → PDF·Word 변환기 (한컴오피스 없이, 브라우저에서) | Utility Hub'
    : 'HWP / HWPX to PDF & Word Converter — No Hancom Office | Utility Hub';
  const description = isKo
    ? '한글 파일(.hwp, .hwpx)의 본문과 표를 문서 끝까지 PDF나 Word(.docx)로 변환합니다. 파일은 서버로 전송되지 않고 브라우저에서만 처리되며, 맥·아이폰·안드로이드에서도 바로 쓸 수 있습니다.'
    : 'Convert the full text and tables of Hangul .hwp and .hwpx files to PDF or Word (.docx). Files never leave your browser; works on Mac and mobile without Hancom Office.';
  const canonical = `${BASE}/${locale}${PATH}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `${BASE}/ko${PATH}`,
        en: `${BASE}/en${PATH}`,
        'x-default': `${BASE}/ko${PATH}`,
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

const SCHEMA_TEXT = {
  ko: {
    name: 'HWP·HWPX → PDF·Word 변환기',
    description: '한글 파일(.hwp, .hwpx)의 본문과 표를 PDF나 Word로 변환하는 무료 도구입니다. 파일은 서버로 전송되지 않고 브라우저에서만 처리됩니다.',
    faqs: [
      { q: 'HWP와 HWPX 모두 끝까지 변환되나요?', a: '네. HWP는 압축된 본문을 풀어서, HWPX는 본문 XML을 읽어서 문서 끝까지 글자와 표를 변환합니다. 암호가 걸렸거나 배포용으로 잠긴 문서는 미리보기(앞부분)만 변환되며 경고가 표시됩니다.' },
      { q: '원본과 모양이 똑같이 나오나요?', a: '아니요. 글자와 표 내용을 옮기는 방식이라 글꼴, 글자 크기, 줄 간격, 이미지, 쪽 나눔은 원본과 다릅니다. 모양 그대로의 PDF가 필요하면 한글 프로그램이나 한컴독스에서 PDF로 저장하세요.' },
      { q: '파일이 서버에 저장되나요?', a: '아니요. 파일은 어디에도 전송되지 않고 지금 쓰는 브라우저 안에서만 변환됩니다.' },
      { q: 'PDF에서 글자를 검색하거나 복사할 수 있나요?', a: '현재 PDF는 쪽마다 이미지로 만들어져 검색·복사가 되지 않습니다. 글자를 복사해야 하면 Word(.docx)로 변환하세요.' },
    ],
  },
  en: {
    name: 'HWP / HWPX to PDF & Word Converter',
    description: 'Free converter for the text and tables of Hangul .hwp and .hwpx files to PDF or Word. Files are processed only in your browser.',
    faqs: [
      { q: 'Are both HWP and HWPX converted to the end?', a: 'Yes. HWP bodies are decompressed and HWPX XML is read through to the end, including tables. Password-protected or distribution documents only convert their preview, with a warning.' },
      { q: 'Will it look exactly like the original?', a: 'No. Text and tables are carried over; fonts, sizes, spacing, images and page breaks differ. Use "Save as PDF" in Hangul for an exact copy.' },
      { q: 'Is my file uploaded?', a: 'No. Conversion happens entirely inside your browser.' },
      { q: 'Can I search or copy text in the PDF?', a: 'Not yet — PDF pages are images. Convert to Word (.docx) for selectable text.' },
    ],
  },
} as const;

export default async function HwpConverterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const text = locale === 'ko' ? SCHEMA_TEXT.ko : SCHEMA_TEXT.en;

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: text.name,
    operatingSystem: 'Web Browser',
    applicationCategory: 'UtilitiesApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    url: `${BASE}/${locale}${PATH}`,
    inLanguage: locale,
    description: text.description,
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: text.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HwpConverterClient />
    </>
  );
}
