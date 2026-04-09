'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Timer,
  Globe,
  FileText,
  FileSpreadsheet,
  ArrowRight,
  Briefcase,
  Flame,
  Bomb,
  Sun,
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import s from './productivity_list.module.css';

export default function ProductivityDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('ProductivityBoard');
  const locale = useLocale();
  const isKo = locale === 'ko';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const tools = [
    {
      id: 'utilities/productivity/pomodoro',
      title: boardT('pomodoro.title'),
      desc: boardT('pomodoro.desc'),
      icon: <Timer size={36} color="#ef4444" />,
      gradient: 'rgba(239, 68, 68, 0.08)',
    },
    {
      id: 'utilities/productivity/world-time',
      title: boardT('world-time.title'),
      desc: boardT('world-time.desc'),
      icon: <Globe size={36} color="#3b82f6" />,
      gradient: 'rgba(59, 130, 246, 0.08)',
    },
    {
      id: 'utilities/productivity/resume-helper',
      title: boardT('resume-helper.title'),
      desc: boardT('resume-helper.desc'),
      icon: <FileText size={36} color="#8b5cf6" />,
      gradient: 'rgba(139, 92, 246, 0.08)',
    },
    {
      id: 'utilities/productivity/excel-mapper',
      title: boardT('excel-mapper.title'),
      desc: boardT('excel-mapper.desc'),
      icon: <FileSpreadsheet size={36} color="#f59e0b" />,
      gradient: 'rgba(245, 158, 11, 0.08)',
    },
    {
      id: 'utilities/productivity/meeting-burner',
      title: boardT('meeting-burner.title'),
      desc: boardT('meeting-burner.desc'),
      icon: <Flame size={36} color="#22c55e" />,
      gradient: 'rgba(34, 197, 94, 0.08)',
    },
    {
      id: 'utilities/productivity/bomb-pad',
      title: boardT('bomb-pad.title'),
      desc: boardT('bomb-pad.desc'),
      icon: <Bomb size={36} color="#f97316" />,
      gradient: 'rgba(249, 115, 22, 0.08)',
    },
    {
      id: 'utilities/productivity/solar-master',
      title: boardT('solar-master.title'),
      desc: boardT('solar-master.desc'),
      icon: <Sun size={36} color="#f59e0b" />,
      gradient: 'rgba(245, 158, 11, 0.08)',
    },
  ];

  if (!isClient) return null;

  return (
    <div className={s.prod_list_container}>
      <NavigationActions />
      <header className={s.prod_list_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Briefcase size={48} color="#8b5cf6" />
        </div>
        <h1 className={s.prod_list_title}>{catT('productivity')}</h1>
        <p className={s.prod_list_subtitle}>{boardT('subtitle')}</p>
      </header>

      <div className={s.prod_grid}>
        {tools.map(tool => (
          <Link key={tool.id} href={`/${tool.id}` as any} style={{ textDecoration: 'none' }}>
            <div className={s.prod_card}>
              <div className={s.prod_icon_wrap} style={{ background: tool.gradient }}>
                {tool.icon}
              </div>
              <h2 className={s.prod_card_title}>{tool.title}</h2>
              <p className={s.prod_card_desc}>{tool.desc}</p>
              <div className={s.prod_arrow}>
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
