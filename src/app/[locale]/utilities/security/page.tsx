'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import CategoryTools from '@/app/components/CategoryTools';
import s from './security_list.module.css';

export default function SecurityDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('SecurityBoard');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  if (!isClient) return null;

  return (
    <div className={s.security_list_container}>
      <NavigationActions />
      <header className={s.security_list_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Lock size={48} color="#8b5cf6" />
        </div>
        <h1 className={s.security_list_title}>{catT('security')}</h1>
        <p className={s.security_list_subtitle}>{boardT('subtitle')}</p>
      </header>

      <CategoryTools categorySlug="security" />
    </div>
  );
}
