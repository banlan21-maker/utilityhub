'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Code2 } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import CategoryTools from '@/app/components/CategoryTools';
import s from './dev_list.module.css';

export default function DevDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('DevBoard');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  if (!isClient) return null;

  return (
    <div className={s.dev_list_container}>
      <NavigationActions />
      <header className={s.dev_list_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Code2 size={48} color="#8b5cf6" />
        </div>
        <h1 className={s.dev_list_title}>{catT('dev')}</h1>
        <p className={s.dev_list_subtitle}>{boardT('subtitle')}</p>
      </header>

      <CategoryTools categorySlug="dev" />
    </div>
  );
}
