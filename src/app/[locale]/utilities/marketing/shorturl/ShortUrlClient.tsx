'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import {
  Link2,
  Copy,
  Trash2,
  History,
  Zap,
  Share2,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './shorturl.module.css';
import { ui } from '@/app/components/ui';

/* ─── Types & Storage ─── */
interface HistoryItem {
  original: string;
  short: string;
  createdAt: string;
}

const STORAGE_KEY = 'uh_shorturl_history';

function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function truncate(s: string, n = 50): string {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */

export default function ShortUrlClient({ seo }: { seo?: React.ReactNode }) {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedUrl, setCopiedUrl] = useState('');

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleShorten = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!trimmed.match(/^https?:\/\/.+/)) {
      setError(isKo ? 'http:// 또는 https://로 시작하는 유효한 URL을 입력해주세요.' : 'Please enter a valid URL starting with http:// or https://');
      return;
    }
    setLoading(true);
    setError('');
    setResult('');
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? (isKo ? '단축에 실패했습니다. 잠시 후 다시 시도해주세요.' : 'Shortening failed. Please try again later.'));
        return;
      }
      setResult(data.short);
      const newItem: HistoryItem = {
        original: trimmed,
        short: data.short,
        createdAt: new Date().toISOString(),
      };
      const updated = [newItem, ...history.filter(h => h.original !== trimmed)];
      setHistory(updated);
      saveHistory(updated);
    } catch {
      setError(isKo ? '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.' : 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [url, history, isKo]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  const handleDelete = (short: string) => {
    const updated = history.filter(h => h.short !== short);
    setHistory(updated);
    saveHistory(updated);
  };


  return (
    <div className={s.url_container}>
      <NavigationActions />

      <ToolHeader icon={<Link2 />} title={isKo ? 'URL 단축기' : 'URL Shortener'} subtitle={isKo ? '긴 주소를 짧고 강력하게 변환하세요. 클릭 한 번으로 모든 SNS 공유 가능' : 'Make long links short and powerful. Perfect for social media sharing.'} />

      {/* Input Section */}
      <section className={`${ui.card} ${s.url_panel}`}>
        <div className={ui.field}>
          <label className={ui.label}>{isKo ? '긴 URL 입력' : 'Enter Long URL'}</label>
          <div className={s.url_input_row}>
            <input
              className={`${ui.input} ${s.url_input}`}
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleShorten()}
              placeholder="https://example.com/very-long-url..."
            />
            <button onClick={handleShorten} disabled={loading} className={`${ui.button} ${ui.primary} ${s.url_primary_button}`}>
              {loading ? <Zap className="animate-pulse" /> : <ChevronRight />}
              {isKo ? '지금 단축하기' : 'Shorten Now'}
            </button>
          </div>
          {error && <p className={ui.error}>{error}</p>}
        </div>

        {/* Success Result */}
        {result && (
          <div className={`${ui.result} ${s.url_result_box}`} style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '0.25rem' }}>
                <Sparkles size={12} style={{ marginRight: '4px', display: 'inline' }} />
                {isKo ? '단축 완료!' : 'SHORTENED!'}
              </div>
              <a href={result} target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', textDecoration: 'underline', textDecorationColor: 'var(--color-primary)' }}>
                {result}
              </a>
            </div>
            <button
              onClick={() => handleCopy(result)}
              className={`${ui.button} ${copiedUrl === result ? ui.green : ui.primary}`}
            >
              <Copy size={18} />
              {copiedUrl === result ? (isKo ? '복사됨' : 'Copied!') : (isKo ? '복사하기' : 'Copy')}
            </button>
          </div>
        )}
      </section>

      {/* History Section */}
      {history.length > 0 && (
        <section className={`${ui.card} ${s.url_panel}`} style={{ gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className={ui.cardTitle} style={{ margin: 0 }}>
              <History size={18} />
              {isKo ? '변환 기록' : 'Link History'}
            </h2>
            <button
              onClick={() => { if(confirm(isKo ? '모든 기록을 삭제하시겠습니까?' : 'Clear history?')) { setHistory([]); saveHistory([]); } }}
              className={`${ui.button} ${ui.ghost} ${ui.sm}`}
            >
              {isKo ? '전체 삭제' : 'Clear All'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map(item => (
              <div key={item.short} className={s.url_history_item}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <a href={item.short} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1rem' }}>
                      {item.short}
                    </a>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(item.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <ChevronRight size={12} />
                    {truncate(item.original)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleCopy(item.short)} className={s.url_icon_button}>
                    {copiedUrl === item.short ? <span style={{ color: 'var(--tint-green-fg)' }}>✓</span> : <Copy size={16} />}
                  </button>
                  <button onClick={() => handleDelete(item.short)} className={s.url_icon_button} style={{ borderColor: 'var(--tint-red-border)' }}>
                    <Trash2 size={16} style={{ color: 'var(--tint-red-fg)' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Standard Bottom Sections (Rulebook V4.4) ─── */}
      <div style={{ width: '100%' }}>

        {/* 0-0. SNS Share */}
        <ShareBar
          title={isKo ? 'URL 단축기' : 'URL Shortener'}
          description={isKo ? '긴 URL을 짧고 강력하게. 무료로 무제한 사용하세요.' : 'Make long links short. Free unlimited use.'}
        />

        {/* 0-1. Recommended Tools */}
        <RelatedTools toolId="utilities/marketing/shorturl" />

        {/* 0-2. Ad Placeholder */}

        {/* 1 ~ 4. SEO Sections */}
        {seo}
      </div>
    </div>
  );
}
