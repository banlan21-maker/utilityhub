'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  GraduationCap,
  Calendar,
  Cake,
  Footprints,
  Activity,
  Brain,
  Fish,
  Sparkles,
  ArrowRight,
  Heart,
  Target,
  Dumbbell,
  Wind,
  Shirt,
  HeartHandshake
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import s from './lifestyle_list.module.css';

export default function LifestyleDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('LifestyleBoard');
  const locale = useLocale();
  const isKo = locale === 'ko';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const tools = [
    {
      id: 'utilities/lifestyle/30day-challenge',
      title: boardT('30day-challenge.title'),
      desc: boardT('30day-challenge.desc'),
      icon: <Target size={36} color="#8b5cf6" />,
      gradient: 'rgba(139, 92, 246, 0.08)',
    },
    {
      id: 'utilities/lifestyle/color-coordinator',
      title: boardT('color-coordinator.title'),
      desc: boardT('color-coordinator.desc'),
      icon: <Shirt size={36} color="#ec4899" />,
      gradient: 'rgba(236, 72, 153, 0.08)',
    },
    {
      id: 'utilities/lifestyle/gym-plate-calc',
      title: boardT('gym-plate-calc.title'),
      desc: boardT('gym-plate-calc.desc'),
      icon: <Dumbbell size={36} color="#ef4444" />,
      gradient: 'rgba(239, 68, 68, 0.08)',
    },
    {
      id: 'utilities/lifestyle/gpa-calc',
      title: boardT('gpa-calc.title'),
      desc: boardT('gpa-calc.desc'),
      icon: <GraduationCap size={36} color="#10b981" />,
      gradient: 'rgba(16, 185, 129, 0.08)',
    },
    {
      id: 'utilities/lifestyle/dday-calc',
      title: boardT('dday-calc.title'),
      desc: boardT('dday-calc.desc'),
      icon: <Calendar size={36} color="#f59e0b" />,
      gradient: 'rgba(245, 158, 11, 0.08)',
    },
    {
      id: 'utilities/lifestyle/age-calc',
      title: boardT('age-calc.title'),
      desc: boardT('age-calc.desc'),
      icon: <Cake size={36} color="#3b82f6" />,
      gradient: 'rgba(59, 130, 246, 0.08)',
    },
    {
      id: 'utilities/lifestyle/pet-calorie',
      title: boardT('pet-calorie.title'),
      desc: boardT('pet-calorie.desc'),
      icon: <Footprints size={36} color="#ef4444" />,
      gradient: 'rgba(239, 68, 68, 0.08)',
    },
    {
      id: 'utilities/lifestyle/bmi-calc',
      title: boardT('bmi-calc.title'),
      desc: boardT('bmi-calc.desc'),
      icon: <Activity size={36} color="#06b6d4" />,
      gradient: 'rgba(6, 182, 212, 0.08)',
    },
    {
      id: 'utilities/lifestyle/mbti-test',
      title: boardT('mbti-test.title'),
      desc: boardT('mbti-test.desc'),
      icon: <Brain size={36} color="#8b5cf6" />,
      gradient: 'rgba(139, 92, 246, 0.08)',
    },
    {
      id: 'utilities/lifestyle/aquarium-calc',
      title: boardT('aquarium-calc.title'),
      desc: boardT('aquarium-calc.desc'),
      icon: <Fish size={36} color="#10b981" />,
      gradient: 'rgba(16, 185, 129, 0.08)',
    },
    {
      id: 'utilities/lifestyle/fortune-prompt',
      title: boardT('fortune-prompt.title'),
      desc: boardT('fortune-prompt.desc'),
      icon: <Sparkles size={36} color="#ec4899" />,
      gradient: 'rgba(236, 72, 153, 0.08)',
    },
    {
      id: 'utilities/lifestyle/apnea-trainer',
      title: boardT('apnea-trainer.title'),
      desc: boardT('apnea-trainer.desc'),
      icon: <Wind size={36} color="#06b6d4" />,
      gradient: 'rgba(6, 182, 212, 0.08)',
    },
    {
      id: 'utilities/lifestyle/saju-compatibility',
      title: boardT('saju-compatibility.title'),
      desc: boardT('saju-compatibility.desc'),
      icon: <HeartHandshake size={36} color="#fb7185" />,
      gradient: 'rgba(251, 113, 133, 0.08)',
    },
  ];

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

      <div className={s.lifestyle_grid}>
        {tools.map(tool => (
          <Link key={tool.id} href={`/${tool.id}` as any} style={{ textDecoration: 'none' }}>
            <div className={s.lifestyle_card}>
              <div className={s.lifestyle_icon_wrap} style={{ background: tool.gradient }}>
                {tool.icon}
              </div>
              <h2 className={s.lifestyle_card_title}>{tool.title}</h2>
              <p className={s.lifestyle_card_desc}>{tool.desc}</p>
              <div className={s.lifestyle_arrow}>
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
