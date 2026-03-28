'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Shield,
  Key,
  ShieldAlert,
  ArrowRight,
  Lock
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import s from './security_list.module.css';

export default function SecurityDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('SecurityBoard');
  const locale = useLocale();
  const isKo = locale === 'ko';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const tools = [
    {
      id: 'utilities/security/privacy-masking',
      title: boardT('privacy-masking.title'),
      desc: boardT('privacy-masking.desc'),
      icon: <Shield size={36} color="#6366f1" />,
      gradient: 'rgba(99, 102, 241, 0.08)',
    },
    {
      id: 'utilities/security/password-generator',
      title: boardT('password-generator.title'),
      desc: boardT('password-generator.desc'),
      icon: <Key size={36} color="#3b82f6" />,
      gradient: 'rgba(59, 130, 246, 0.08)',
    },
    {
      id: 'utilities/security/url-safety',
      title: boardT('url-safety.title'),
      desc: boardT('url-safety.desc'),
      icon: <ShieldAlert size={36} color="#ef4444" />,
      gradient: 'rgba(239, 68, 68, 0.08)',
    },
  ];

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

      <div className={s.security_grid}>
        {tools.map(tool => (
          <Link key={tool.id} href={`/${tool.id}` as any} style={{ textDecoration: 'none' }}>
            <div className={s.security_card}>
              <div className={s.security_icon_wrap} style={{ background: tool.gradient }}>
                {tool.icon}
              </div>
              <h2 className={s.security_card_title}>{tool.title}</h2>
              <p className={s.security_card_desc}>{tool.desc}</p>
              <div className={s.security_arrow}>
                {isKo ? '사용하러 가기' : 'Use Now'}
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
