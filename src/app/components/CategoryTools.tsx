'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { LayoutGrid, List, ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Link } from '@/i18n/routing';
import { tools, Tool } from '@/lib/tools-registry';
import SearchDropdown from './SearchDropdown';
import s from './CategoryTools.module.css';

type ViewMode = 'card' | 'list';
const VIEW_MODE_KEY = 'theutilhub_view_mode';

interface CategoryToolsProps {
  categorySlug: string;
}

export default function CategoryTools({ categorySlug }: CategoryToolsProps) {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY) as ViewMode | null;
    if (saved) {
      setViewMode(saved);
    } else if (window.innerWidth < 768) {
      setViewMode('list');
    }
    setMounted(true);
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  };

  const categoryTools = tools.filter(t => t.category === categorySlug && t.available);
  const categoryName = isKo
    ? (categoryTools[0]?.categoryNameKo ?? categorySlug)
    : (categoryTools[0]?.categoryNameEn ?? categorySlug);

  if (!mounted) return null;

  return (
    <>
      {/* 검색 + 뷰 토글 컨트롤 바 */}
      <div className={s.controlBar}>
        <div className={s.searchWrapper}>
          <SearchDropdown
            categoryFilter={categorySlug}
            placeholder={isKo ? `${categoryName} 내 툴 검색...` : `Search in ${categoryName}...`}
          />
        </div>
        <div className={s.viewToggle} role="group" aria-label="보기 방식 선택">
          <button
            onClick={() => handleViewModeChange('card')}
            className={`${s.toggleBtn} ${viewMode === 'card' ? s.toggleActive : ''}`}
            aria-label="카드뷰"
            aria-pressed={viewMode === 'card'}
          >
            <LayoutGrid size={18} />
            <span className={s.toggleLabel}>{isKo ? '카드' : 'Card'}</span>
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`${s.toggleBtn} ${viewMode === 'list' ? s.toggleActive : ''}`}
            aria-label="리스트뷰"
            aria-pressed={viewMode === 'list'}
          >
            <List size={18} />
            <span className={s.toggleLabel}>{isKo ? '목록' : 'List'}</span>
          </button>
        </div>
      </div>

      {/* 툴 목록 */}
      {viewMode === 'card' ? (
        <CardView tools={categoryTools} locale={locale} />
      ) : (
        <ListView tools={categoryTools} locale={locale} />
      )}
    </>
  );
}

function CardView({ tools, locale }: { tools: Tool[]; locale: string }) {
  const isKo = locale === 'ko';
  return (
    <div className={s.cardGrid}>
      {tools.map(tool => {
        const IconComponent = tool.icon
          ? (LucideIcons as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[tool.icon]
          : null;
        const name = isKo ? (tool.nameKo ?? tool.slug) : (tool.nameEn ?? tool.slug);
        const desc = isKo ? (tool.descKo ?? '') : (tool.descEn ?? '');

        return (
          <Link key={tool.slug} href={`/${tool.href}` as any} className={s.card}>
            <div className={s.cardIconWrapper}>
              {IconComponent && <IconComponent size={36} color="#8b5cf6" />}
            </div>
            <h3 className={s.cardTitle}>{name}</h3>
            <p className={s.cardDesc}>{desc}</p>
            <span className={s.cardCta}>
              {isKo ? '사용하러 가기' : 'Use Now'}
              <ArrowRight size={16} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function ListView({ tools, locale }: { tools: Tool[]; locale: string }) {
  const isKo = locale === 'ko';
  return (
    <div className={s.listWrapper}>
      {tools.map(tool => {
        const IconComponent = tool.icon
          ? (LucideIcons as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[tool.icon]
          : null;
        const name = isKo ? (tool.nameKo ?? tool.slug) : (tool.nameEn ?? tool.slug);
        const desc = isKo ? (tool.descKo ?? '') : (tool.descEn ?? '');

        return (
          <Link key={tool.slug} href={`/${tool.href}` as any} className={s.listItem}>
            <div className={s.listIcon}>
              {IconComponent && <IconComponent size={22} color="#8b5cf6" />}
            </div>
            <div className={s.listText}>
              <span className={s.listName}>{name}</span>
              <span className={s.listDesc}>{desc}</span>
            </div>
            <ArrowRight size={16} className={s.listArrow} />
          </Link>
        );
      })}
    </div>
  );
}
