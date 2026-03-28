'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import NavigationActions from '@/app/components/NavigationActions';
import { Megaphone, Sparkles, Hash, QrCode, Link as LinkIcon, Brain, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import s from './marketing_list.module.css';

export default function MarketingDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('MarketingBoard');

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
    <div>
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

      <div className={s.marketing_list_grid}>
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: any }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`/${tool.id}` as any} style={{ textDecoration: 'none' }}>
      <div
        className={s.marketing_card}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{
          background: tool.gradient,
          width: '72px', height: '72px',
          borderRadius: '1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem',
          border: '1px solid rgba(139, 92, 246, 0.1)',
        }}>
          {tool.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h2 className={s.marketing_card_title}>
            {tool.title}
          </h2>
          <p className={s.marketing_card_desc}>
            {tool.desc}
          </p>
        </div>
        <div className={s.marketing_card_footer}>
          <span className={s.marketing_card_cta} style={{ opacity: isHovered ? 1 : 0 }}>
            사용하러 가기
          </span>
          <ArrowRight
            size={20}
            color="#8b5cf6"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </div>
      </div>
    </Link>
  );
}
