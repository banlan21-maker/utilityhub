'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Activity, ArrowRight, Zap, BarChart3, Flame, Layers } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import s from '../finance/finance_list.module.css';

export default function PerformanceDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('PerformanceBoard');
  const locale = useLocale();
  const isKo = locale === 'ko';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const tools = [
    {
      id: 'utilities/performance/ttfb-check',
      title: boardT('ttfb-check.title'),
      desc: boardT('ttfb-check.desc'),
      icon: <Activity size={36} color="#8b5cf6" />,
      gradient: 'rgba(139, 92, 246, 0.08)',
    },
    {
      id: 'utilities/performance/sla-uptime-calc',
      title: boardT('sla-uptime-calc.title'),
      desc: boardT('sla-uptime-calc.desc'),
      icon: <BarChart3 size={36} color="#3b82f6" />,
      gradient: 'rgba(59, 130, 246, 0.08)',
    },
    {
      id: 'utilities/performance/carbon-footprint',
      title: boardT('carbon-footprint.title'),
      desc: boardT('carbon-footprint.desc'),
      icon: <Flame size={36} color="#059669" />,
      gradient: 'rgba(5, 150, 105, 0.08)',
    },
    {
      id: 'utilities/performance/core-web-vitals',
      title: boardT('core-web-vitals.title'),
      desc: boardT('core-web-vitals.desc'),
      icon: <Layers size={36} color="#8b5cf6" />,
      gradient: 'rgba(139, 92, 246, 0.08)',
    },
  ];

  if (!isClient) return null;

  return (
    <div className={s.fin_list_container}>
      <NavigationActions />
      <header className={s.fin_list_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Zap size={48} color="#8b5cf6" />
        </div>
        <h1 className={s.fin_list_title}>{catT('performance')}</h1>
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
