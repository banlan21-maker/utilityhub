'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import CategoryTools from '@/app/components/CategoryTools';
import s from './lifestyle_list.module.css';

export default function LifestyleDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('LifestyleBoard');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  if (!isClient) return null;

  return (
    <div className={s.lifestyle_list_container}>
      <NavigationActions />
      <header className={s.lifestyle_list_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Heart size={48} color="#8b5cf6" />
        </div>
        <h1 className={s.lifestyle_list_title}>{catT('lifestyle')}</h1>
        <p className={s.lifestyle_list_subtitle}>{boardT('subtitle')}</p>
      </header>

      <CategoryTools categorySlug="lifestyle" />
    </div>
  );
}
