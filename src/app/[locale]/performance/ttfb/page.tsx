'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef } from 'react';
import NavigationActions from '@/app/components/NavigationActions';

interface TestResult {
  url: string;
  ttfb: number;
  status: number;
  timestamp: Date;
}

function getGrade(ms: number): { label: string; color: string; bg: string; emoji: string } {
  if (ms < 200)  return { label: '우수',       color: '#10b981', bg: 'rgba(16,185,129,0.12)', emoji: '🟢' };
  if (ms < 500)  return { label: '보통',       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', emoji: '🟡' };
  return         { label: '개선 필요',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   emoji: '🔴' };
}

function GradeBar({ ms }: { ms: number }) {
  // Cap visual bar at 1500ms
  const pct = Math.min((ms / 1500) * 100, 100);
  const grade = getGrade(ms);
  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div style={{ position: 'relative', height: '8px', background: 'var(--surface-hover)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: grade.color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
        {/* threshold markers */}
        {[200, 500].map(v => (
          <div key={v} style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${Math.min((v / 1500) * 100, 100)}%`,
            width: '2px', background: 'var(--border)', opacity: 0.6
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
        <span>0ms</span><span>200ms</span><span>500ms</span><span>1500ms+</span>
      </div>
    </div>
  );
}

export default function TtfbPage() {
  const t = useTranslations('Ttfb');

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ttfb: number; status: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizeUrl = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return 'https://' + trimmed;
    }
    return trimmed;
  };

  const runTest = async () => {
    const normalized = normalizeUrl(url);
    setUrl(normalized);

    // Quick client-side validation
    try { new URL(normalized); } catch {
      setError(t('error_invalid_url'));
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`/api/ttfb?url=${encodeURIComponent(normalized)}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || t('error_generic'));
      } else {
        setResult({ ttfb: data.ttfb, status: data.status });
        setHistory(prev => [
          { url: normalized, ttfb: data.ttfb, status: data.status, timestamp: new Date() },
          ...prev.slice(0, 9), // keep last 10
        ]);
      }
    } catch {
      setError(t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') runTest();
  };

  const grade = result ? getGrade(result.ttfb) : null;

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('description')}</p>
      </header>

      {/* Input */}
      <div className="glass-panel" style={{ padding: 'var(--page-padding)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            disabled={loading}
            className="glass-panel"
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.9rem 1.1rem',
              fontSize: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={runTest}
            disabled={loading || !url.trim()}
            style={{
              padding: '0.9rem 2rem',
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: loading || !url.trim() ? 'var(--text-muted)' : 'var(--primary)',
              color: 'white',
              cursor: loading || !url.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? t('testing') : t('test_button')}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="animate-fade-in" style={{ color: '#ef4444', marginTop: '1rem', fontWeight: 500 }}>
            ⚠️ {error}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="animate-fade-in" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <div style={{
              display: 'inline-block', width: '40px', height: '40px',
              border: '4px solid var(--border)', borderTopColor: 'var(--primary)',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>{t('measuring')}</p>
          </div>
        )}

        {/* Result */}
        {result && grade && !loading && (
          <div className="animate-fade-in" style={{
            marginTop: '2rem',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            background: grade.bg,
            border: `2px solid ${grade.color}`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3.5rem', fontWeight: 800, color: grade.color, lineHeight: 1 }}>
              {result.ttfb} <span style={{ fontSize: '1.5rem' }}>ms</span>
            </div>
            <div style={{
              marginTop: '0.75rem',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: grade.color,
            }}>
              {grade.emoji} {grade.label}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              HTTP {result.status}
            </div>
            <GradeBar ms={result.ttfb} />
          </div>
        )}

        {/* Grade guide */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { emoji: '🟢', label: t('grade_good'), range: '< 200ms', color: '#10b981' },
            { emoji: '🟡', label: t('grade_ok'),   range: '200–500ms', color: '#f59e0b' },
            { emoji: '🔴', label: t('grade_poor'), range: '> 500ms',  color: '#ef4444' },
          ].map(g => (
            <div key={g.label} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.8rem', color: 'var(--text-secondary)',
              padding: '0.35rem 0.75rem',
              background: 'var(--surface-hover)',
              borderRadius: 'var(--radius-full)',
            }}>
              <span>{g.emoji}</span>
              <span style={{ fontWeight: 600, color: g.color }}>{g.label}</span>
              <span>{g.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="glass-panel animate-fade-in" style={{ padding: 'var(--page-padding)', marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>{t('history_title')}</h3>
            <button
              onClick={() => setHistory([])}
              style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t('history_clear')}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {history.map((item, i) => {
              const g = getGrade(item.ttfb);
              return (
                <div
                  key={i}
                  onClick={() => setUrl(item.url)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.6rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-hover)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = 'var(--border)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                >
                  <span style={{ fontSize: '0.9rem' }}>{g.emoji}</span>
                  <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.url}
                  </span>
                  <span style={{ fontWeight: 700, color: g.color, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                    {item.ttfb}ms
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {item.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
