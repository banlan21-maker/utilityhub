'use client';

// 애드센스 광고 한 칸. 설정(src/config/monetization.ts)이 꺼져 있거나 슬롯 ID가 없으면 아무것도 그리지 않는다.
import { useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { ADS } from '@/config/monetization';

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

export default function AdSlot({ slot }: { slot: keyof typeof ADS.slots }) {
  const id = ADS.slots[slot];
  const pushed = useRef(false);
  const isKo = useLocale() === 'ko';

  useEffect(() => {
    if (!ADS.enabled || !id || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch { /* 광고 차단 등 — 무시 */ }
  }, [id]);

  if (!ADS.enabled || !id) return null;

  return (
    <aside aria-label={isKo ? '광고' : 'Advertisement'} style={{ margin: '2.5rem 0', textAlign: 'center' }}>
      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
        {isKo ? '광고' : 'Advertisement'}
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADS.client}
        data-ad-slot={id}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
