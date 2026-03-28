'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { FileText, ArrowRight, Shield, Image, File } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import s from '../finance/finance_list.module.css';

export default function DocumentDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('DocumentBoard');
  const locale = useLocale();
  const isKo = locale === 'ko';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const tools = [
    {
      id: 'utilities/document/pdf-masking',
      title: boardT('pdf-masking.title'),
      desc: boardT('pdf-masking.desc'),
      icon: <Shield size={36} color="#ef4444" />,
      gradient: 'rgba(239, 68, 68, 0.08)',
    },
    {
      id: 'utilities/document/img-pdf-converter',
      title: boardT('img-pdf-converter.title'),
      desc: boardT('img-pdf-converter.desc'),
      icon: <Image size={36} color="#10b981" />,
      gradient: 'rgba(16, 185, 129, 0.08)',
    },
    {
      id: 'utilities/document/hwp-pdf-converter',
      title: boardT('hwp-pdf-converter.title'),
      desc: boardT('hwp-pdf-converter.desc'),
      icon: <File size={36} color="#3b82f6" />,
      gradient: 'rgba(59, 130, 246, 0.08)',
    },
  ];

  if (!isClient) return null;

  return (
    <div className={s.fin_list_container}>
      <NavigationActions />
      <header className={s.fin_list_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <FileText size={48} color="#8b5cf6" />
        </div>
        <h1 className={s.fin_list_title}>{catT('document')}</h1>
        <p className={s.fin_list_subtitle}>{boardT('subtitle')}</p>
      </header>

      <div className={s.fin_grid}>
        {tools.map(tool => (
          <Link key={tool.id} href={`/${tool.id}` as any} style={{ textDecoration: 'none' }}>
            <div className={s.fin_card}>
              <div className={s.fin_icon_wrap} style={{ background: tool.gradient }}>
                {tool.icon}
              </div>
              <h2 className={s.fin_card_title}>{tool.title}</h2>
              <p className={s.fin_card_desc}>{tool.desc}</p>
              <div className={s.fin_arrow}>
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
