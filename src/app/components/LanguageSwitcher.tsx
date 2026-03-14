'use client';

import {useLocale} from 'next-intl';
import {useRouter, usePathname} from '@/i18n/routing';
import {ChangeEvent, useTransition} from 'react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const locale = useLocale();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    startTransition(() => {
      router.replace(pathname, {locale: nextLocale});
    });
  }

  return (
    <div>
      <select
        className="glass-panel"
        defaultValue={locale}
        disabled={isPending}
        onChange={onSelectChange}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          outline: 'none',
          color: 'var(--text-primary)'
        }}
      >
        <option value="ko">🇰🇷 한국어</option>
        <option value="en">🇺🇸 English</option>
      </select>
    </div>
  );
}
