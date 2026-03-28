'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import NavigationActions from '@/app/components/NavigationActions';
import { Palette, Image, Type, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import s from './design_list.module.css';

export default function DesignDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('DesignBoard');

  const tools = [
    {
      id: 'utilities/design/logo-favicon',
      title: boardT('logo-favicon.title'),
      desc: boardT('logo-favicon.desc'),
      icon: <Image size={36} color="#ec4899" />,
      gradient: 'rgba(236, 72, 153, 0.08)',
    },
    {
      id: 'utilities/design/color-palette',
      title: boardT('color-palette.title'),
      desc: boardT('color-palette.desc'),
      icon: <Palette size={36} color="#8b5cf6" />,
      gradient: 'rgba(139, 92, 246, 0.08)',
    },
    {
      id: 'utilities/design/font-preview',
      title: boardT('font-preview.title'),
      desc: boardT('font-preview.desc'),
      icon: <Type size={36} color="#3b82f6" />,
      gradient: 'rgba(59, 130, 246, 0.08)',
    },
  ];

  return (
    <div>
      <NavigationActions />
      <header className={s.design_list_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Palette size={48} color="#8b5cf6" />
        </div>
        <h1 className={s.design_list_title}>
          {catT('design')}
        </h1>
        <p className={s.design_list_subtitle}>
          {boardT('subtitle')}
        </p>
      </header>

      <div className={s.design_list_grid}>
        {tools.map(tool => (
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
        className={s.design_card}
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
          <h2 className={s.design_card_title}>
            {tool.title}
          </h2>
          <p className={s.design_card_desc}>
            {tool.desc}
          </p>
        </div>
        <div className={s.design_card_footer}>
          <span className={s.design_card_cta} style={{ opacity: isHovered ? 1 : 0 }}>
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
