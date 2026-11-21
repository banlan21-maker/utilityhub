'use client';

import { useState, useCallback } from 'react';
import { Youtube } from 'lucide-react';
import { useLocale } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { ui } from '@/app/components/ui';

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
function Input({ value, onChange, onEnter, isKo }: { value: string; onChange: (v: string) => void; onEnter: () => void; isKo: boolean }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && onEnter()}
      placeholder={isKo ? "https://www.youtube.com/watch?v=... 또는 youtu.be/... 또는 11자리 ID" : "https://www.youtube.com/watch?v=... or youtu.be/... or 11-character ID"}
      className={ui.input}
    />
  );
}

function ThumbnailCard({
  videoId, quality, label, size, badge, onDownload, onCopyUrl, downloading, copied, isKo,
}: {
  videoId: string; quality: string; label: string; size: string; badge: string;
  onDownload: () => void; onCopyUrl: () => void; downloading: boolean; copied: boolean; isKo: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const imgUrl = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;

  if (imgError) return null;

  return (
    <div className={ui.card} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{size}</span>
        {badge && (
          <span className={ui.badge} style={{ marginLeft: 'auto' }}>
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
          className={`${ui.button} ${ui.primary} ${ui.sm}`}
          style={{ flex: 1 }}
        >
          {isKo ? (downloading ? '다운로드 중...' : '⬇ 다운로드') : (downloading ? 'Downloading...' : '⬇ Download')}
        </button>
        <button
          onClick={onCopyUrl}
          className={`${ui.button} ${ui.secondary} ${ui.sm}`}
          style={{ flex: 1 }}
        >
          {isKo ? (copied ? '✓ 복사됨' : '📋 URL 복사') : (copied ? '✓ Copied' : '📋 Copy URL')}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Client Component ─── */
export default function YtThumbnailClient({ seo }: { seo?: React.ReactNode }) {
  const isKo = useLocale() === 'ko';
  const [input, setInput] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const handleExtract = useCallback(() => {
    const id = extractVideoId(input);
    if (!id) {
      setError(isKo ? '유효한 YouTube URL 또는 11자리 영상 ID를 입력해주세요.' : 'Please enter a valid YouTube URL or an 11-character video ID.');
      setVideoId(null);
      return;
    }
    setVideoId(id);
    setError('');
  }, [input, isKo]);

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
      alert(isKo ? '다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.' : 'Download failed. Please try again in a moment.');
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

  return (
    <div style={{ maxWidth: 'var(--tool-width)', margin: '0 auto', width: '100%', padding: '0 1rem', boxSizing: 'border-box' }}>
      <NavigationActions />

      {/* Header */}
      <ToolHeader
        icon={<Youtube />}
        title={isKo ? '유튜브 썸네일 추출기' : 'YouTube Thumbnail Downloader'}
        subtitle={isKo
          ? 'YouTube URL만 입력하면 MQ·HQ·SD·MaxRes 전 화질 썸네일을 즉시 추출·다운로드합니다.'
          : 'Paste any YouTube URL to instantly extract and download its thumbnail in every quality: MQ, HQ, SD, and MaxRes.'}
      />

      {/* Input Panel */}
      <div className={`${ui.card} ${ui.field}`} style={{ marginBottom: '2rem' }}>
        <label className={ui.label}>{isKo ? 'YouTube URL 또는 영상 ID' : 'YouTube URL or video ID'}</label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Input value={input} onChange={setInput} onEnter={handleExtract} isKo={isKo} />
          </div>
          <button
            onClick={handleExtract}
            className={`${ui.button} ${ui.primary}`}
          >
            {isKo ? '썸네일 추출' : 'Extract Thumbnail'}
          </button>
        </div>
        {error && <p className={ui.error}>{error}</p>}
        <p className={ui.hint}>
          {isKo
            ? '지원: youtube.com/watch?v=… · youtu.be/… · shorts/… · 11자리 영상 ID'
            : 'Supported: youtube.com/watch?v=… · youtu.be/… · shorts/… · 11-character video ID'}
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
              isKo={isKo}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!videoId && (
        <div className={ui.card} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
          <p>{isKo ? 'YouTube URL을 입력하면 썸네일이 여기에 표시됩니다' : 'Enter a YouTube URL and the thumbnails will appear here'}</p>
        </div>
      )}

      {/* Ad placeholder */}

      <ShareBar
        title={isKo ? '유튜브 썸네일 추출기' : 'YouTube Thumbnail Downloader'}
        description={isKo ? 'YouTube URL로 모든 화질 썸네일을 즉시 추출' : 'Extract YouTube thumbnails in every quality instantly from a URL'}
      />

      <RelatedTools toolId="utilities/utility/yt-thumbnail" />

      {seo}
    </div>
  );
}
