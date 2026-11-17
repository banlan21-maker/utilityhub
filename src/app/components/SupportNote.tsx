'use client';

// 도구 공유 버튼 아래 작은 후원 안내 한 줄 (설정에서 켜고, 링크가 있을 때만)
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { SUPPORT, hasSupportLinks } from '@/config/monetization';

export default function SupportNote() {
  const isKo = useLocale() === 'ko';
  if (!SUPPORT.showInTools || !hasSupportLinks()) return null;
  return (
    <p style={{ marginTop: '1.1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
      {isKo ? '도움이 되셨나요? ' : 'Found this useful? '}
      <Link href="/support" style={{ color: 'var(--primary)', fontWeight: 600 }}>
        {isKo ? '☕ 커피 한 잔으로 응원하기' : '☕ Buy us a coffee'}
      </Link>
    </p>
  );
}
