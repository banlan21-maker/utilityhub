'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useLocale } from 'next-intl';
import { tools } from '@/lib/tools-registry';
import s from './SearchDropdown.module.css';

interface SearchDropdownProps {
  categoryFilter?: string;
  placeholder?: string;
}

export default function SearchDropdown({ categoryFilter, placeholder }: SearchDropdownProps) {
  const router = useRouter();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchableTools = categoryFilter
    ? tools.filter(t => t.category === categoryFilter && t.available)
    : tools.filter(t => t.available);

  const results = query.trim().length < 1
    ? []
    : searchableTools
        .filter(tool => {
          const q = query.toLowerCase();
          const nameKo = (tool.nameKo ?? '').toLowerCase();
          const nameEn = (tool.nameEn ?? '').toLowerCase();
          const descKo = (tool.descKo ?? '').toLowerCase();
          const descEn = (tool.descEn ?? '').toLowerCase();
          const keywords = (tool.searchKeywords ?? []).join(' ').toLowerCase();
          return nameKo.includes(q) || nameEn.includes(q) || descKo.includes(q) || descEn.includes(q) || keywords.includes(q);
        })
        .slice(0, 8);

  useEffect(() => {
    setIsOpen(query.trim().length > 0);
    setActiveIndex(-1);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) navigateToTool(results[activeIndex].href);
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const navigateToTool = (href: string) => {
    router.push(`/${locale}${href}`);
    setQuery('');
    setIsOpen(false);
  };

  const clearQuery = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const highlight = (text: string, q: string) => {
    if (!q.trim()) return <>{text}</>;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? <mark key={i} className={s.highlight}>{part}</mark> : part
        )}
      </>
    );
  };

  return (
    <div className={s.wrapper} ref={dropdownRef}>
      <div className={s.inputWrapper}>
        <Search size={18} className={s.searchIcon} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder={placeholder ?? (locale === 'ko' ? '툴 이름이나 기능으로 검색...' : 'Search tools by name or function...')}
          className={s.input}
          aria-label="툴 검색"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          autoComplete="off"
        />
        {query && (
          <button onClick={clearQuery} className={s.clearBtn} aria-label="검색어 지우기">
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className={s.dropdown} role="listbox" aria-label="검색 결과">
          {results.length > 0 ? (
            <>
              {results.map((tool, index) => {
                const IconComponent = tool.icon ? (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[tool.icon] : null;
                const isActive = index === activeIndex;
                const displayName = locale === 'ko' ? (tool.nameKo ?? tool.slug) : (tool.nameEn ?? tool.slug);
                const displayDesc = locale === 'ko' ? (tool.descKo ?? '') : (tool.descEn ?? '');
                const categoryLabel = locale === 'ko' ? tool.categoryNameKo : tool.categoryNameEn;

                return (
                  <button
                    key={tool.slug}
                    role="option"
                    aria-selected={isActive}
                    className={`${s.resultItem} ${isActive ? s.active : ''}`}
                    onClick={() => navigateToTool(tool.href)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <div className={s.resultIcon}>
                      {IconComponent && <IconComponent size={20} color="var(--color-primary)" />}
                    </div>
                    <div className={s.resultText}>
                      <span className={s.resultName}>{highlight(displayName, query)}</span>
                      <span className={s.resultDesc}>{highlight(displayDesc, query)}</span>
                    </div>
                    <div className={s.resultMeta}>
                      <span className={s.categoryBadge}>{categoryLabel}</span>
                      <ArrowRight size={14} className={s.arrow} />
                    </div>
                  </button>
                );
              })}
              <div className={s.dropdownFooter}>
                <span>
                  {locale === 'ko'
                    ? `"${query}" 검색 결과 ${results.length}개`
                    : `${results.length} results for "${query}"`
                  }
                </span>
              </div>
            </>
          ) : (
            <div className={s.noResult}>
              <Search size={24} className={s.noResultIcon} />
              <p>{locale === 'ko' ? `"${query}"에 대한 검색 결과가 없습니다.` : `No results for "${query}".`}</p>
              <p className={s.noResultSub}>{locale === 'ko' ? '다른 키워드로 검색해보세요.' : 'Try different keywords.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
