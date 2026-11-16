'use client';

// 첫 화면 전광판: 업데이트 소식을 한 줄씩 3초마다 위로 넘긴다.
// 마우스를 올리거나 키보드로 들어오면 멈추고, '동작 줄이기' 설정이면 자동으로 넘기지 않는다.
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import s from './NewsTicker.module.css';

export interface TickerEntry { icon: string; text: string; href: string }

export default function NewsTicker({ items, label, interval = 3000 }: { items: TickerEntry[]; label: string; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex((v) => (v + 1) % items.length), interval);
    return () => window.clearInterval(id);
  }, [paused, items.length, interval]);

  if (!items.length) return null;

  return (
    <div
      className={s.ticker}
      role="region"
      aria-roledescription="ticker"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <span className={s.dot} aria-hidden="true" />
      <div className={s.window}>
        <ul className={s.list} style={{ transform: `translateY(calc(${-index} * var(--tick-h)))` }}>
          {items.map((it, i) => (
            <li key={`${it.href}-${i}`} className={s.item} aria-hidden={i !== index}>
              <Link href={it.href} className={s.link} tabIndex={i === index ? 0 : -1}>
                <span aria-hidden="true">{it.icon}</span>
                <span className={s.text}>{it.text}</span>
                <span className={s.arrow} aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
