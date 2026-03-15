'use client';

import { useState } from 'react';

interface ShareBarProps {
  title: string;
  description?: string;
}

export default function ShareBar({ title, description }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => (typeof window !== 'undefined' ? window.location.href : '');

  const handleKakao = async () => {
    const url = getUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
        return;
      } catch {
        // user cancelled or API not supported
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitter = () => {
    const url = getUrl();
    const text = encodeURIComponent(`${title} - 무료 온라인 도구`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const btnBase: React.CSSProperties = {
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'opacity 0.15s',
  };

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '1.5rem 1rem',
        marginTop: '2rem',
        borderTop: '1px solid var(--border)',
      }}
    >
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        이 도구를 친구에게 공유하기
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={handleKakao} style={{ ...btnBase, background: '#FEE500', color: '#3A1D1D' }}>
          💬 카카오톡
        </button>
        <button onClick={handleTwitter} style={{ ...btnBase, background: '#000', color: '#fff' }}>
          𝕏 트위터
        </button>
        <button onClick={handleCopy} style={{ ...btnBase, background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          {copied ? '✓ 복사됨' : '🔗 링크 복사'}
        </button>
      </div>
    </div>
  );
}
