'use client';

import { useState, useCallback } from 'react';
import { Youtube } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';

/* ─── Helpers ─── */
function extractVideoId(input: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  const trimmed = input.trim();
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m) return m[1];
  }
  return null;
}

const QUALITIES = [
  { key: 'maxresdefault', label: 'Max Resolution', size: '1280×720', badge: 'BEST' },
  { key: 'sddefault',     label: 'SD',             size: '640×480',  badge: '' },
  { key: 'hqdefault',     label: 'HQ',             size: '480×360',  badge: '' },
  { key: 'mqdefault',     label: 'MQ',             size: '320×180',  badge: '' },
];

/* ─── Sub-components ─── */
function Input({ value, onChange, onEnter }: { value: string; onChange: (v: string) => void; onEnter: () => void }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && onEnter()}
      placeholder="https://www.youtube.com/watch?v=... 또는 youtu.be/... 또는 11자리 ID"
      style={{
        flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
        background: 'var(--surface)', border: '1px solid var(--border)',
        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
      }}
    />
  );
}

function ThumbnailCard({
  videoId, quality, label, size, badge, onDownload, onCopyUrl, downloading, copied,
}: {
  videoId: string; quality: string; label: string; size: string; badge: string;
  onDownload: () => void; onCopyUrl: () => void; downloading: boolean; copied: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const imgUrl = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;

  if (imgError) return null;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{size}</span>
        {badge && (
          <span style={{
            marginLeft: 'auto', background: 'var(--primary)', color: '#fff',
            fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700,
          }}>
            {badge}
          </span>
        )}
      </div>
      <img
        src={imgUrl}
        alt={`${label} thumbnail`}
        onError={() => setImgError(true)}
        style={{ width: '100%', borderRadius: 'var(--radius-sm)', display: 'block' }}
      />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={onDownload}
          disabled={downloading}
          style={{
            flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)',
            background: 'var(--primary)', color: '#fff', border: 'none',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
            opacity: downloading ? 0.7 : 1,
          }}
        >
          {downloading ? '다운로드 중...' : '⬇ 다운로드'}
        </button>
        <button
          onClick={onCopyUrl}
          style={{
            flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
          }}
        >
          {copied ? '✓ 복사됨' : '📋 URL 복사'}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ThumbnailPage() {
  const [input, setInput] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const handleExtract = useCallback(() => {
    const id = extractVideoId(input);
    if (!id) {
      setError('유효한 YouTube URL 또는 11자리 영상 ID를 입력해주세요.');
      setVideoId(null);
      return;
    }
    setVideoId(id);
    setError('');
  }, [input]);

  const handleDownload = async (quality: string) => {
    if (!videoId) return;
    setDownloading(quality);
    try {
      const res = await fetch(`/api/thumbnail?videoId=${videoId}&quality=${quality}`);
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `thumbnail-${videoId}-${quality}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      alert('다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setDownloading('');
    }
  };

  const handleCopyUrl = async (quality: string) => {
    const url = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
    await navigator.clipboard.writeText(url);
    setCopiedKey(quality);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem',
  };

  return (
    <div>
      <NavigationActions />

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Youtube size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>유튜브 썸네일 추출기</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          YouTube URL만 입력하면 MQ·HQ·SD·MaxRes 전 화질 썸네일을 즉시 추출·다운로드합니다.
        </p>
      </header>

      {/* Input Panel */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <label style={labelStyle}>YouTube URL 또는 영상 ID</label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Input value={input} onChange={setInput} onEnter={handleExtract} />
          <button
            onClick={handleExtract}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)',
              background: 'var(--primary)', color: '#fff', border: 'none',
              cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap',
            }}
          >
            썸네일 추출
          </button>
        </div>
        {error && <p style={{ color: '#f87171', marginTop: '0.5rem', fontSize: '0.85rem' }}>{error}</p>}
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          지원: youtube.com/watch?v=… · youtu.be/… · shorts/… · 11자리 영상 ID
        </p>
      </div>

      {/* Thumbnails Grid */}
      {videoId && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {QUALITIES.map(q => (
            <ThumbnailCard
              key={q.key}
              videoId={videoId}
              quality={q.key}
              label={q.label}
              size={q.size}
              badge={q.badge}
              onDownload={() => handleDownload(q.key)}
              onCopyUrl={() => handleCopyUrl(q.key)}
              downloading={downloading === q.key}
              copied={copiedKey === q.key}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!videoId && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
          <p>YouTube URL을 입력하면 썸네일이 여기에 표시됩니다</p>
        </div>
      )}

      {/* Ad placeholder */}
      <div style={{
        background: 'var(--surface)', border: '1px dashed var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '1rem', textAlign: 'center',
        color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '2rem',
        height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        광고 영역 (728×90)
      </div>

      <ShareBar title="유튜브 썸네일 추출기" description="YouTube URL로 모든 화질 썸네일을 즉시 추출" />

      <RelatedTools toolId="utilities/utility/yt-thumbnail" />

      <SeoSection
        ko={{
          title: '유튜브 썸네일 추출기란? — 활용법 & FAQ',
          description: `유튜브 썸네일 추출기는 유튜브 영상 URL을 입력하기만 하면 해당 영상의 썸네일 이미지를 MQ(320×180), HQ(480×360), SD(640×480), MaxRes(1280×720) 4가지 화질로 즉시 추출해주는 무료 온라인 도구입니다. 별도의 프로그램 설치 없이 브라우저에서 바로 사용할 수 있습니다.

유튜브는 영상 업로드 시 자동으로 여러 해상도의 썸네일을 생성합니다. 이 썸네일들은 공개 URL 형태로 존재하지만, 일반 사용자가 직접 접근하기는 불편합니다. 유튜브 썸네일 추출기를 사용하면 URL 또는 11자리 영상 ID만으로 모든 화질의 썸네일을 한 번에 확인하고 원하는 화질을 선택해 다운로드할 수 있습니다.

【활용 팁 및 마케팅 전략】
콘텐츠 크리에이터라면 인기 채널의 썸네일을 분석해 어떤 디자인 패턴이 클릭률(CTR)을 높이는지 연구할 수 있습니다. MaxRes(1280×720) 화질로 저장한 썸네일을 포토샵이나 Canva에서 레퍼런스 이미지로 활용하면 제작 시간을 크게 줄일 수 있습니다. SNS 마케터라면 유튜브 영상을 인스타그램·블로그·뉴스레터에 소개할 때 공식 썸네일 이미지를 첨부해 클릭률을 높이세요. 교육 콘텐츠 제작자는 강의 자료나 PPT에 썸네일을 삽입해 시각적으로 풍부한 자료를 만들 수 있습니다.`,
          useCases: [
            { icon: '🔍', title: '썸네일 분석 및 다운로드', desc: '유튜브 영상 썸네일을 4가지 화질로 즉시 추출하고 저장합니다.' },
            { icon: '📱', title: 'SNS 썸네일 첨부', desc: 'SNS·블로그·뉴스레터에 유튜브 영상을 소개할 때 썸네일을 삽입합니다.' },
            { icon: '🎨', title: '디자인 레퍼런스', desc: '경쟁 채널 썸네일을 벤치마킹하여 CTR 높은 썸네일 전략을 수립합니다.' },
            { icon: '📚', title: '강의·발표 자료', desc: '교육 콘텐츠나 PPT에 썸네일을 삽입해 시각적으로 풍부한 자료를 제작합니다.' },
          ],
          steps: [
            { step: '1', desc: '유튜브 영상 URL 또는 11자리 영상 ID를 입력칸에 붙여넣기' },
            { step: '2', desc: '「썸네일 추출」 버튼 클릭' },
            { step: '3', desc: '원하는 화질(MQ/HQ/SD/MaxRes)의 썸네일 확인' },
            { step: '4', desc: '「⬇ 다운로드」 또는 「📋 URL 복사」 버튼 클릭' },
          ],
          faqs: [
            {
              q: '유튜브 썸네일을 추출하는 것이 저작권법에 위반되지 않나요?',
              a: '썸네일의 저작권은 영상을 업로드한 크리에이터에게 있습니다. 개인적인 학습·분석·참고 목적으로 저장하는 것은 일반적으로 허용되나, 상업적 용도로 사용하거나 무단 배포 시에는 저작권자의 동의가 반드시 필요합니다.',
            },
            {
              q: 'MaxRes(1280×720) 썸네일이 나타나지 않아요.',
              a: '모든 유튜브 영상에 MaxRes 썸네일이 존재하지는 않습니다. 업로드 해상도가 낮은 영상이나 오래된 영상은 SD(640×480) 또는 HQ(480×360)가 최고 화질일 수 있습니다. 이 경우 해당 화질이 자동으로 숨겨집니다.',
            },
            {
              q: '유튜브 쇼츠(Shorts)나 재생목록 썸네일도 추출할 수 있나요?',
              a: '유튜브 쇼츠는 일반 영상과 동일한 형식의 ID를 사용하므로 추출 가능합니다. 단, 재생목록·채널 아트·커뮤니티 탭 이미지는 현재 지원하지 않습니다.',
            },
          ],
        }}
        en={{
          title: 'YouTube Thumbnail Downloader — How to Use & FAQ',
          description: `A YouTube Thumbnail Downloader lets you extract any YouTube video's thumbnail image in four quality levels — MQ (320×180), HQ (480×360), SD (640×480), and Max Resolution (1280×720) — simply by entering the video URL. No software installation needed; everything runs in your browser instantly.

When a video is uploaded to YouTube, the platform automatically generates thumbnails in multiple resolutions. While these images exist at public URLs, accessing them directly is inconvenient. Our tool removes that friction: paste any YouTube URL or an 11-character video ID, and you'll see all available quality levels side by side, ready to download or copy with one click.

【Tips & Marketing Strategies】
Content creators can analyze thumbnails from high-performing channels to identify design patterns that drive clicks (CTR). Download Max Resolution (1280×720) thumbnails to use as references in Photoshop or Canva. Social media marketers can attach official thumbnails when sharing YouTube content on Instagram, blogs, or newsletters to boost engagement. Educators can embed YouTube thumbnails directly in slide decks for visually richer presentations.`,
          useCases: [
            { icon: '🔍', title: 'Thumbnail analysis', desc: 'Extract and save YouTube thumbnails in all four quality levels instantly.' },
            { icon: '📱', title: 'SNS sharing', desc: 'Attach official thumbnails when sharing YouTube videos on social media, blogs, or newsletters.' },
            { icon: '🎨', title: 'Design reference', desc: 'Benchmark competitor thumbnails to build a high-CTR thumbnail strategy.' },
            { icon: '📚', title: 'Presentations', desc: 'Embed thumbnails in slide decks or educational materials for richer visuals.' },
          ],
          steps: [
            { step: '1', desc: 'Paste a YouTube URL or 11-character video ID into the input field' },
            { step: '2', desc: 'Click the "Extract Thumbnail" button' },
            { step: '3', desc: 'Browse available quality levels (MQ / HQ / SD / MaxRes)' },
            { step: '4', desc: 'Click "⬇ Download" or "📋 Copy URL" for your preferred quality' },
          ],
          faqs: [
            {
              q: 'Is it legal to download YouTube thumbnails?',
              a: 'Thumbnails are copyrighted by the creator who uploaded the video. Downloading for personal use, analysis, or reference is generally acceptable. However, commercial use or redistribution without the rights holder\'s permission may infringe copyright laws.',
            },
            {
              q: 'Why is the Max Resolution thumbnail missing?',
              a: 'Not every YouTube video has a Max Resolution (1280×720) thumbnail. Older videos or those uploaded at lower resolutions may only have SD or HQ as their highest quality. Our tool automatically hides quality levels that are not available for the given video.',
            },
            {
              q: 'Can I extract thumbnails from YouTube Shorts or playlists?',
              a: 'YouTube Shorts use the same video ID format as regular videos, so thumbnails can be extracted normally. Playlist cover images, channel art, and community post images are not currently supported.',
            },
          ],
        }}
      />
    </div>
  );
}
