'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Palette } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import CategoryTools from '@/app/components/CategoryTools';
import s from './design_list.module.css';

export default function DesignDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('DesignBoard');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  if (!isClient) return null;

  return (
    <div className={s.design_list_container}>
      <NavigationActions />
      <header className={s.design_list_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Palette size={48} color="#8b5cf6" />
        </div>
        <h1 className={s.design_list_title}>
          {catT('design')}
        </h1>
        <p className={s.design_list_subtitle}>
          {boardT('subtitle')}
        </p>
      </header>

      <CategoryTools categorySlug="design" />
    </div>
  );
}
