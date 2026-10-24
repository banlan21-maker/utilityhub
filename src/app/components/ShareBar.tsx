'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { MessageCircle, Instagram, Send, Link2 } from 'lucide-react';

const LABELS = {
  ko: { heading: '이 도구를 친구에게 공유하기', kakao: '카카오톡', insta: '인스타그램', tele: '텔레그램', copy: 'URL 복사', copied: '링크가 복사되었습니다!' },
  en: { heading: 'Share this tool', kakao: 'KakaoTalk', insta: 'Instagram', tele: 'Telegram', copy: 'Copy link', copied: 'Link copied!' },
} as const;

interface ShareBarProps {
  title: string;
  description?: string;
}

export default function ShareBar({ title, description }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const L = useLocale() === 'ko' ? LABELS.ko : LABELS.en;

  const getUrl = () => (typeof window !== 'undefined' ? window.location.href : '');

  const handleShare = async (platform: 'kakao' | 'insta' | 'tele' | 'copy') => {
    const url = getUrl();
    const shareText = `${title} - theutilhub.com`;

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* 클립보드 권한이 없으면 무시 */ }
      return;
    }

    if (platform === 'tele') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`, '_blank');
      return;
    }

    if (platform === 'insta') {
      // Instagram doesn't have a direct share URL for web like others, usually copy link is the best we can do or point to a guide
      // But we can just use the native share API if available
      if (navigator.share) {
        try {
          await navigator.share({ title: shareText, text: description, url });
        } catch {
          handleShare('copy');
        }
      } else {
        handleShare('copy');
      }
      return;
    }

    if (platform === 'kakao') {
      // Logic for Kakao usually involves their SDK, but we can use native share or deep link
      if (navigator.share) {
        try {
          await navigator.share({ title: shareText, text: description, url });
        } catch {
          handleShare('copy');
        }
      } else {
        handleShare('copy');
      }
    }
  };

  const btnStyle = (bg: string, fg: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    background: bg,
    color: fg,
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  return (
    <section style={{ 
      marginTop: '2.5rem', 
      marginBottom: '3rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <p style={{
        fontSize: '0.72rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: '1rem',
      }}>
        {L.heading}
      </p>
      
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '0.75rem' 
      }}>
        <button onClick={() => handleShare('kakao')} style={btnStyle('#FEE500', '#3C1E1E')}>
          <MessageCircle size={16} /> {L.kakao}
        </button>

        <button onClick={() => handleShare('insta')} style={btnStyle('linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)', '#fff')}>
          <Instagram size={16} /> {L.insta}
        </button>

        <button onClick={() => handleShare('tele')} style={btnStyle('#0088cc', '#fff')}>
          <Send size={16} /> {L.tele}
        </button>

        <button onClick={() => handleShare('copy')} style={btnStyle('var(--surface-hover)', 'var(--text-secondary)')}>
          <Link2 size={16} /> {copied ? L.copied : L.copy}
        </button>
      </div>
    </section>
  );
}
