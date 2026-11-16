import type { Metadata } from 'next';
import YtThumbnailClient from './YtThumbnailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '유튜브 썸네일 추출기 – 전 화질 즉시 다운로드 | Utility Hub' : 'YouTube Thumbnail Downloader – All Quality Levels Instantly | Utility Hub';
  const description = isKo
    ? '유튜브 URL을 입력하면 MQ·HQ·SD·MaxRes 4가지 화질 썸네일을 즉시 추출하고 다운로드할 수 있는 무료 온라인 도구입니다.'
    : 'Free online tool to instantly extract and download YouTube video thumbnails in MQ, HQ, SD, and Max Resolution quality levels.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/utility/yt-thumbnail`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/utility/yt-thumbnail`,
        en: `https://www.theutilhub.com/en/utilities/utility/yt-thumbnail`,
        'x-default': `https://www.theutilhub.com/ko/utilities/utility/yt-thumbnail`,
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '유튜브 썸네일 추출기',
  alternateName: 'YouTube Thumbnail Downloader',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/utility/yt-thumbnail',
  description: '유튜브 URL을 입력하면 MQ·HQ·SD·MaxRes 4가지 화질 썸네일을 즉시 추출하고 다운로드할 수 있는 무료 온라인 도구입니다.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '유튜브 썸네일을 추출하는 것이 저작권법에 위반되지 않나요?', acceptedAnswer: { '@type': 'Answer', text: '썸네일의 저작권은 영상을 업로드한 크리에이터에게 있습니다. 개인적인 학습·분석·참고 목적으로 저장하는 것은 일반적으로 허용되나, 상업적 용도로 사용하거나 무단 배포 시에는 저작권자의 동의가 반드시 필요합니다.' } },
    { '@type': 'Question', name: 'MaxRes(1280×720) 썸네일이 나타나지 않아요.', acceptedAnswer: { '@type': 'Answer', text: '모든 유튜브 영상에 MaxRes 썸네일이 존재하지는 않습니다. 업로드 해상도가 낮은 영상이나 오래된 영상은 SD 또는 HQ가 최고 화질일 수 있습니다.' } },
    { '@type': 'Question', name: '유튜브 쇼츠(Shorts)나 재생목록 썸네일도 추출할 수 있나요?', acceptedAnswer: { '@type': 'Answer', text: '유튜브 쇼츠는 일반 영상과 동일한 형식의 ID를 사용하므로 추출 가능합니다. 단, 재생목록·채널 아트·커뮤니티 탭 이미지는 현재 지원하지 않습니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

const softwareSchemaEn = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'YouTube Thumbnail Downloader',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://www.theutilhub.com/en/utilities/utility/yt-thumbnail',
  description: 'Free online tool to instantly extract and download YouTube video thumbnails in MQ, HQ, SD, and Max Resolution quality levels.',
};

const faqSchemaEn = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is it legal to download YouTube thumbnails?', acceptedAnswer: { '@type': 'Answer', text: "Thumbnails are copyrighted by the creator who uploaded the video. Downloading for personal use, analysis, or reference is generally acceptable. However, commercial use or redistribution without the rights holder's permission may infringe copyright laws." } },
    { '@type': 'Question', name: 'Why is the Max Resolution thumbnail missing?', acceptedAnswer: { '@type': 'Answer', text: 'Not every YouTube video has a Max Resolution (1280×720) thumbnail. Older videos or those uploaded at lower resolutions may only have SD or HQ as their highest quality.' } },
    { '@type': 'Question', name: 'Can I extract thumbnails from YouTube Shorts or playlists?', acceptedAnswer: { '@type': 'Answer', text: 'YouTube Shorts use the same video ID format as regular videos, so thumbnails can be extracted normally. Playlist cover images, channel art, and community post images are not currently supported.' } },
    { '@type': 'Question', name: 'Can I use this result as official data?', acceptedAnswer: { '@type': 'Answer', text: 'Results are for reference only. Please consult a professional or official source for accurate figures.' } },
  ],
};

export default async function YtThumbnailPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isKo = locale === 'ko';
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(isKo ? softwareSchema : softwareSchemaEn) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(isKo ? faqSchema : faqSchemaEn) }} />
      <YtThumbnailClient />
    </>
  );
}
