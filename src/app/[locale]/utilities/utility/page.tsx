'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Puzzle,
  Hash,
  Ruler,
  Image as ImageIcon,
  Square,
  Crop,
  ArrowRight,
  Wrench,
  Ticket,
  Shuffle,
  Gamepad2
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import s from './utility_list.module.css';

export default function UtilityDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('UtilityBoard');
  const locale = useLocale();
  const isKo = locale === 'ko';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const tools = [
    {
      id: 'utilities/utility/wordle',
      title: boardT('wordle.title'),
      desc: boardT('wordle.desc'),
      icon: <Puzzle size={36} color="#10b981" />,
      gradient: 'rgba(16, 185, 129, 0.08)',
    },
    {
      id: 'utilities/utility/counter',
      title: boardT('counter.title'),
      desc: boardT('counter.desc'),
      icon: <Hash size={36} color="#14b8a6" />,
      gradient: 'rgba(20, 184, 166, 0.08)',
    },
    {
      id: 'utilities/utility/unit-converter',
      title: boardT('unit-converter.title'),
      desc: boardT('unit-converter.desc'),
      icon: <Ruler size={36} color="#3b82f6" />,
      gradient: 'rgba(59, 130, 246, 0.08)',
    },
    {
      id: 'utilities/utility/yt-thumbnail',
      title: boardT('yt-thumbnail.title'),
      desc: boardT('yt-thumbnail.desc'),
      icon: <ImageIcon size={36} color="#ef4444" />,
      gradient: 'rgba(239, 68, 68, 0.08)',
    },
    {
      id: 'utilities/utility/pyeong-calc',
      title: boardT('pyeong-calc.title'),
      desc: boardT('pyeong-calc.desc'),
      icon: <Square size={36} color="#84cc16" />,
      gradient: 'rgba(132, 204, 22, 0.08)',
    },
    {
      id: 'utilities/utility/image-processor',
      title: boardT('image-processor.title'),
      desc: boardT('image-processor.desc'),
      icon: <Crop size={36} color="#f59e0b" />,
      gradient: 'rgba(245, 158, 11, 0.08)',
    },
    {
      id: 'utilities/utility/lotto-generator',
      title: boardT('lotto-generator.title'),
      desc: boardT('lotto-generator.desc'),
      icon: <Ticket size={36} color="#D4AF37" />,
      gradient: 'rgba(212, 175, 55, 0.08)',
    },
    {
      id: 'utilities/utility/decision-master',
      title: boardT('decision-master.title'),
      desc: boardT('decision-master.desc'),
      icon: <Shuffle size={36} color="#8b5cf6" />,
      gradient: 'rgba(139, 92, 246, 0.08)',
    },
    {
      id: 'utilities/utility/grid-poker',
      title: boardT('grid-poker.title'),
      desc: boardT('grid-poker.desc'),
      icon: <Gamepad2 size={36} color="#ef4444" />,
      gradient: 'rgba(239, 68, 68, 0.08)',
    },
  ];

  if (!isClient) return null;

  return (
    <div className={s.utility_list_container}>
      <NavigationActions />
      <header className={s.utility_list_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Wrench size={48} color="#8b5cf6" />
        </div>
        <h1 className={s.utility_list_title}>{catT('utility')}</h1>
        <p className={s.utility_list_subtitle}>{boardT('subtitle')}</p>
      </header>

      <div className={s.utility_grid}>
        {tools.map(tool => (
          <Link key={tool.id} href={`/${tool.id}` as any} style={{ textDecoration: 'none' }}>
            <div className={s.utility_card}>
              <div className={s.utility_icon_wrap} style={{ background: tool.gradient }}>
                {tool.icon}
              </div>
              <h2 className={s.utility_card_title}>{tool.title}</h2>
              <p className={s.utility_card_desc}>{tool.desc}</p>
              <div className={s.utility_arrow}>
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
