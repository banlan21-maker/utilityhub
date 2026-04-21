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
          padding: '0.45rem 0.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          outline: 'none',
          color: 'var(--text-primary)'
        }}
      >
        <option value="ko">KR</option>
        <option value="en">EN</option>
      </select>
    </div>
  );
}
