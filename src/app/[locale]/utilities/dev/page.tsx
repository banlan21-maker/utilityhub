'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Braces,
  Search,
  Zap,
  ShieldCheck,
  Plug,
  ArrowRight,
  Code2
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import s from './dev_list.module.css';

export default function DevDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('DevBoard');
  const locale = useLocale();
  const isKo = locale === 'ko';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const tools = [
    {
      id: 'utilities/dev/json-formatter',
      title: boardT('json-formatter.title'),
      desc: boardT('json-formatter.desc'),
      icon: <Braces size={36} color="#10b981" />,
      gradient: 'rgba(16, 185, 129, 0.08)',
    },
    {
      id: 'utilities/dev/regex-tester',
      title: boardT('regex-tester.title'),
      desc: boardT('regex-tester.desc'),
      icon: <Search size={36} color="#3b82f6" />,
      gradient: 'rgba(59, 130, 246, 0.08)',
    },
    {
      id: 'utilities/dev/resistor-calc',
      title: boardT('resistor-calc.title'),
      desc: boardT('resistor-calc.desc'),
      icon: <Zap size={36} color="#f59e0b" />,
      gradient: 'rgba(245, 158, 11, 0.08)',
    },
    {
      id: 'utilities/dev/password-strength',
      title: boardT('password-strength.title'),
      desc: boardT('password-strength.desc'),
      icon: <ShieldCheck size={36} color="#ef4444" />,
      gradient: 'rgba(239, 68, 68, 0.08)',
    },
    {
      id: 'utilities/dev/kec-grounding',
      title: boardT('kec-grounding.title'),
      desc: boardT('kec-grounding.desc'),
      icon: <Plug size={36} color="#8b5cf6" />,
      gradient: 'rgba(139, 92, 246, 0.08)',
    },
  ];

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

      <div className={s.dev_grid}>
        {tools.map(tool => (
          <Link key={tool.id} href={`/${tool.id}` as any} style={{ textDecoration: 'none' }}>
            <div className={s.dev_card}>
              <div className={s.dev_icon_wrap} style={{ background: tool.gradient }}>
                {tool.icon}
              </div>
              <h2 className={s.dev_card_title}>{tool.title}</h2>
              <p className={s.dev_card_desc}>{tool.desc}</p>
              <div className={s.dev_arrow}>
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
