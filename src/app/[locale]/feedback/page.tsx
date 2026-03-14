'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState, useTransition, useEffect, useCallback } from 'react';
import { submitFeedback } from '@/actions/feedback';
import { supabase } from '@/lib/supabase';
import NavigationActions from '@/app/components/NavigationActions';

// ── Types ──────────────────────────────────────────────────────────────────
interface FeedbackItem {
  id: number;
  message: string;
  category: string;
  created_at: string;
}

type FilterType = 'all' | 'feature_request' | 'bug_report' | 'general';

// ── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string, locale: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (locale === 'ko') {
    if (mins < 1) return '방금 전';
    if (mins < 60) return `${mins}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 30) return `${days}일 전`;
    return new Date(dateStr).toLocaleDateString('ko-KR');
  } else {
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US');
  }
}

const CATEGORY_META: Record<string, { icon: string; color: string; bg: string }> = {
  feature_request: { icon: '💡', color: '#854d0e', bg: '#fef9c3' },
  bug_report:      { icon: '🐛', color: '#7f1d1d', bg: '#fee2e2' },
  general:         { icon: '💬', color: '#1e3a5f', bg: '#dbeafe' },
};

// ── Component ──────────────────────────────────────────────────────────────
export default function FeedbackBoardPage() {
  const fb = useTranslations('Feedback');
  const nav = useTranslations('Navigation');

  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [formOpen, setFormOpen] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Detect locale from document lang attribute (set by layout)
  const [locale, setLocale] = useState('ko');
  useEffect(() => {
    setLocale(document.documentElement.lang || 'ko');
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('feedback')
      .select('id, message, category, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSubmit = (formData: FormData) => {
    setResult(null);
    startTransition(async () => {
      const res = await submitFeedback(formData);
      setResult(res);
      if (res.success) {
        formRef.current?.reset();
        setFormOpen(false);
        fetchItems();
      }
    });
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

  const counts: Record<FilterType, number> = {
    all: items.length,
    feature_request: items.filter(i => i.category === 'feature_request').length,
    bug_report: items.filter(i => i.category === 'bug_report').length,
    general: items.filter(i => i.category === 'general').length,
  };

  const filterLabels: Record<FilterType, string> = {
    all:             locale === 'ko' ? `전체 (${counts.all})` : `All (${counts.all})`,
    feature_request: locale === 'ko' ? `💡 기능 제안 (${counts.feature_request})` : `💡 Feature (${counts.feature_request})`,
    bug_report:      locale === 'ko' ? `🐛 버그 (${counts.bug_report})` : `🐛 Bug (${counts.bug_report})`,
    general:         locale === 'ko' ? `💬 일반 (${counts.general})` : `💬 General (${counts.general})`,
  };

  return (
    <div>
      <NavigationActions />

      {/* Header */}
      <header className="animate-fade-in" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.4rem', color: 'var(--primary)' }}>{fb('title')}</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{fb('description')}</p>
          </div>
          <button
            onClick={() => { setFormOpen(v => !v); setResult(null); }}
            style={{
              padding: '0.7rem 1.4rem',
              fontSize: '0.95rem', fontWeight: 600,
              backgroundColor: formOpen ? 'var(--surface)' : 'var(--primary)',
              color: formOpen ? 'var(--text-primary)' : 'white',
              border: `1px solid ${formOpen ? 'var(--border)' : 'var(--primary)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer', transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {formOpen
              ? (locale === 'ko' ? '✕ 닫기' : '✕ Close')
              : (locale === 'ko' ? '✏️ 의견 남기기' : '✏️ Write')}
          </button>
        </div>
      </header>

      {/* Submit Form */}
      {formOpen && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <form ref={formRef} action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label htmlFor="category" style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {fb('categoryLabel')}
              </label>
              <select
                name="category"
                id="category"
                className="glass-panel"
                style={{
                  padding: '0.7rem 0.9rem', fontSize: '0.95rem',
                  borderRadius: 'var(--radius-sm)', outline: 'none',
                  color: 'var(--text-primary)', background: 'var(--surface)',
                }}
              >
                <option value="feature_request">💡 {locale === 'ko' ? '새로운 유틸리티 제안' : 'Feature Request'}</option>
                <option value="bug_report">🐛 {locale === 'ko' ? '버그 제보' : 'Bug Report'}</option>
                <option value="general">💬 {locale === 'ko' ? '일반 피드백' : 'General Feedback'}</option>
              </select>
            </div>

            <textarea
              name="message"
              required
              rows={4}
              placeholder={fb('placeholder')}
              className="glass-panel"
              style={{
                padding: '0.9rem', fontSize: '0.95rem',
                borderRadius: 'var(--radius-sm)', outline: 'none',
                color: 'var(--text-primary)', resize: 'vertical',
                background: 'var(--surface)',
              }}
            />

            {result?.error && (
              <div style={{ color: '#ef4444', padding: '0.6rem 0.9rem', background: '#fef2f2', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                {fb('error')}
              </div>
            )}
            {result?.success && (
              <div style={{ color: '#10b981', padding: '0.6rem 0.9rem', background: '#ecfdf5', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                ✓ {fb('success')}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              style={{
                padding: '0.85rem', fontSize: '0.95rem', fontWeight: 600,
                backgroundColor: 'var(--primary)', color: 'white',
                borderRadius: 'var(--radius-md)',
                opacity: isPending ? 0.7 : 1,
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={e => { if (!isPending) e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
              onMouseOut={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
            >
              {isPending ? '...' : fb('submit')}
            </button>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {(['all', 'feature_request', 'bug_report', 'general'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.45rem 0.9rem', fontSize: '0.85rem', fontWeight: 500,
              borderRadius: '999px',
              border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border)'}`,
              background: filter === f ? 'var(--primary)' : 'var(--surface)',
              color: filter === f ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {/* Board list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          {locale === 'ko' ? '불러오는 중...' : 'Loading...'}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {locale === 'ko' ? '아직 등록된 글이 없습니다.' : 'No posts yet.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((item, idx) => {
            const meta = CATEGORY_META[item.category] ?? CATEGORY_META.general;
            return (
              <div
                key={item.id}
                className="glass-panel"
                style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
              >
                {/* Index number */}
                <span style={{
                  minWidth: '2rem', textAlign: 'right',
                  color: 'var(--text-secondary)', fontSize: '0.85rem',
                  paddingTop: '0.1rem', flexShrink: 0,
                }}>
                  {filtered.length - idx}
                </span>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                      borderRadius: '999px', background: meta.bg, color: meta.color,
                      whiteSpace: 'nowrap',
                    }}>
                      {meta.icon}&nbsp;{item.category === 'feature_request'
                        ? (locale === 'ko' ? '기능 제안' : 'Feature Request')
                        : item.category === 'bug_report'
                        ? (locale === 'ko' ? '버그 제보' : 'Bug Report')
                        : (locale === 'ko' ? '일반 피드백' : 'General')}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {timeAgo(item.created_at, locale)}
                    </span>
                  </div>
                  <p style={{
                    margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem',
                    lineHeight: 1.6, wordBreak: 'break-word', whiteSpace: 'pre-wrap',
                  }}>
                    {item.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1.5rem' }}>
          {locale === 'ko' ? `총 ${filtered.length}개의 의견` : `${filtered.length} total posts`}
        </p>
      )}
    </div>
  );
}
