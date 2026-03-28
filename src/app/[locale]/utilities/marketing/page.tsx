'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import NavigationActions from '@/app/components/NavigationActions';
import { Megaphone, Sparkles, Hash, QrCode, Link as LinkIcon, Brain, ArrowRight } from 'lucide-react';
import s from './marketing_list.module.css';

export default function MarketingDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('MarketingBoard');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const tools = [
    {
      id: 'utilities/marketing/osmu-formatter',
      title: boardT('osmu-formatter.title'),
      desc: boardT('osmu-formatter.desc'),
      icon: <Sparkles size={36} color="#8b5cf6" />,
      gradient: 'rgba(139, 92, 246, 0.08)'
    },
    {
      id: 'utilities/marketing/hashtag-generator',
      title: boardT('hashtag-generator.title'),
      desc: boardT('hashtag-generator.desc'),
      icon: <Hash size={36} color="#e879f9" />,
      gradient: 'rgba(232, 121, 249, 0.08)'
    },
    {
      id: 'utilities/marketing/qr-generator',
      title: boardT('qr-generator.title'),
      desc: boardT('qr-generator.desc'),
      icon: <QrCode size={36} color="#3b82f6" />,
      gradient: 'rgba(59, 130, 246, 0.08)'
    },
    {
      id: 'utilities/marketing/shorturl',
      title: boardT('shorturl.title'),
      desc: boardT('shorturl.desc'),
      icon: <LinkIcon size={36} color="#14b8a6" />,
      gradient: 'rgba(20, 184, 166, 0.08)'
    },
    {
      id: 'utilities/marketing/quiz-builder',
      title: boardT('quiz-builder.title'),
      desc: boardT('quiz-builder.desc'),
      icon: <Brain size={36} color="#f59e0b" />,
      gradient: 'rgba(245, 158, 11, 0.08)'
    }
  ];

  return (
    <div className={s.marketing_list_container}>
      <NavigationActions />
      <header className={s.marketing_list_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Megaphone size={48} color="#8b5cf6" />
        </div>
        <h1 className={s.marketing_list_title}>
          {catT('marketing')}
        </h1>
        <p className={s.marketing_list_subtitle}>
          {boardT('subtitle')}
        </p>
      </header>

      <div className={s.marketing_grid}>
        {tools.map((tool) => (
          <Link key={tool.id} href={`/${tool.id}` as any} style={{ textDecoration: 'none' }}>
            <div className={s.marketing_card}>
              <div className={s.marketing_icon_wrap} style={{ background: tool.gradient }}>
                {tool.icon}
              </div>
              <h2 className={s.marketing_card_title}>{tool.title}</h2>
              <p className={s.marketing_card_desc}>{tool.desc}</p>
              <div className={s.marketing_arrow}>
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
