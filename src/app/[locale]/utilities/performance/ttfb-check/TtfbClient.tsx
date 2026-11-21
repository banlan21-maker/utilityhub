'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useRef } from 'react';
import { Activity, Zap, AlertCircle, Copy, Check, BarChart2 } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './ttfb.module.css';
import { ui } from '@/app/components/ui';

interface TestResult {
  url: string;
  ttfb: number;
  status: number;
  timestamp: Date;
}

type GradeKey = 'grade_good' | 'grade_ok' | 'grade_poor';

function getGradeInfo(ms: number): { key: GradeKey; color: string; bg: string; emoji: string } {
  if (ms < 200) return { key: 'grade_good', color: '#10b981', bg: 'rgba(16,185,129,0.12)', emoji: '🟢' };
  if (ms < 500) return { key: 'grade_ok',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', emoji: '🟡' };
  return         { key: 'grade_poor',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   emoji: '🔴' };
}

function GradeBar({ ms }: { ms: number }) {
  const pct = Math.min((ms / 1500) * 100, 100);
  const { color } = getGradeInfo(ms);
  return (
    <div>
      <div className={s.ttfb_grade_bar}>
        <div className={s.ttfb_grade_bar_fill} style={{ width: `${pct}%`, background: color }} />
        {[200, 500].map(v => (
          <div key={v} className={s.ttfb_grade_marker} style={{ left: `${Math.min((v / 1500) * 100, 100)}%` }} />
        ))}
      </div>
      <div className={s.ttfb_grade_labels}>
        <span>0ms</span><span>200ms</span><span>500ms</span><span>1500ms+</span>
      </div>
    </div>
  );
}

export default function TtfbClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('Ttfb');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ttfb: number; status: number; isAvg?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);
  const [avgProgress, setAvgProgress] = useState<{ current: number; total: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizeUrl = (raw: string): string => {
    const trimmed = raw.trim();
    return trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : 'https://' + trimmed;
  };

  const fetchTtfb = async (target: string): Promise<{ ttfb: number; status: number } | null> => {
    try {
      const res = await fetch(`/api/ttfb?url=${encodeURIComponent(target)}`);
      const data = await res.json();
      if (res.ok && !data.error) return { ttfb: data.ttfb, status: data.status };
      return null;
    } catch {
      return null;
    }
  };

  const runTest = async (targetUrl?: string) => {
    const normalized = normalizeUrl(targetUrl ?? url);
    setUrl(normalized);

    try { new URL(normalized); } catch {
      setError(t('error_invalid_url'));
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    const data = await fetchTtfb(normalized);

    if (data) {
      setResult({ ttfb: data.ttfb, status: data.status });
      setHistory(prev => [
        { url: normalized, ttfb: data.ttfb, status: data.status, timestamp: new Date() },
        ...prev.slice(0, 9),
      ]);
    } else {
      setError(t('error_generic'));
    }

    setLoading(false);
  };

  const runAverage = async () => {
    const normalized = normalizeUrl(url);
    setUrl(normalized);

    try { new URL(normalized); } catch {
      setError(t('error_invalid_url'));
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    const results: Array<{ ttfb: number; status: number }> = [];
    for (let i = 0; i < 3; i++) {
      setAvgProgress({ current: i + 1, total: 3 });
      const data = await fetchTtfb(normalized);
      if (data) results.push(data);
    }

    setAvgProgress(null);
    setLoading(false);

    if (results.length > 0) {
      const avgTtfb = Math.round(results.reduce((sum, r) => sum + r.ttfb, 0) / results.length);
      const lastStatus = results[results.length - 1].status;
      setResult({ ttfb: avgTtfb, status: lastStatus, isAvg: true });
      setHistory(prev => [
        { url: normalized, ttfb: avgTtfb, status: lastStatus, timestamp: new Date() },
        ...prev.slice(0, 9),
      ]);
    } else {
      setError(t('error_generic'));
    }
  };

  const copyResult = async () => {
    if (!result) return;
    const grade = getGradeInfo(result.ttfb);
    const label = result.isAvg ? t('avg_label') : '';
    const text = `TTFB${label ? ` (${label})` : ''}: ${result.ttfb}ms [${t(grade.key)}] — ${url}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') runTest();
  };

  const grade = result ? getGradeInfo(result.ttfb) : null;

  return (
    <div className={s.ttfb_container}>
      <NavigationActions />

      <ToolHeader icon={<Activity />} title={t('title')} subtitle={t('description')} />

      <section className={`${ui.card} ${s.ttfb_panel}`}>
        {/* Input + buttons */}
        <div className={s.ttfb_input_group}>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            disabled={loading}
            className={`${ui.input} ${s.ttfb_input}`}
            aria-label={isKo ? '테스트할 URL 입력' : 'Enter URL to test'}
          />
          <button
            onClick={() => runTest()}
            disabled={loading || !url.trim()}
            className={`${ui.button} ${ui.primary} ${s.ttfb_button}`}
            aria-label={isKo ? '테스트 실행' : 'Run TTFB test'}
          >
            <Zap size={18} />
            {loading && !avgProgress ? t('testing') : t('test_button')}
          </button>
          <button
            onClick={runAverage}
            disabled={loading || !url.trim()}
            className={`${ui.button} ${ui.secondary} ${s.ttfb_button_avg}`}
            aria-label={isKo ? '3회 평균 측정' : 'Run 3-test average'}
          >
            <BarChart2 size={18} />
            {avgProgress
              ? `${avgProgress.current}/3`
              : t('avg_button')}
          </button>
        </div>

        {error && (
          <div className={`${ui.notice} ${ui.red} ${s.ttfb_error}`}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading && (
          <div className={s.ttfb_loading}>
            <div className={s.ttfb_spinner} />
            <p className={s.ttfb_loading_text}>
              {avgProgress
                ? `${isKo ? '측정 중' : 'Testing'} ${avgProgress.current}/3...`
                : t('measuring')}
            </p>
          </div>
        )}

        {result && grade && !loading && (
          <div className={s.ttfb_result_card} style={{ background: grade.bg, border: `2px solid ${grade.color}` }}>
            {result.isAvg && (
              <div className={s.ttfb_avg_badge} style={{ color: grade.color }}>
                <BarChart2 size={14} />
                {t('avg_label')}
              </div>
            )}
            <div className={s.ttfb_result_value} style={{ color: grade.color }}>
              {result.ttfb}<span className={s.ttfb_result_unit}>ms</span>
            </div>
            <div className={s.ttfb_result_grade} style={{ color: grade.color }}>
              <span>{grade.emoji}</span>
              <span>{t(grade.key)}</span>
            </div>
            <div className={s.ttfb_result_status}>HTTP {result.status}</div>
            <GradeBar ms={result.ttfb} />
            <button
              onClick={copyResult}
              className={`${ui.button} ${ui.secondary} ${ui.sm} ${s.ttfb_copy_btn}`}
              aria-label={isKo ? '결과 복사' : 'Copy result'}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? t('copied') : t('copy')}
            </button>
          </div>
        )}

        {/* Grade Guide */}
        <div className={s.ttfb_grade_guide}>
          {[
            { emoji: '🟢', key: 'grade_good' as GradeKey, range: '< 200ms', color: 'var(--tint-green-fg)' },
            { emoji: '🟡', key: 'grade_ok'   as GradeKey, range: '200–500ms', color: 'var(--tint-amber-fg)' },
            { emoji: '🔴', key: 'grade_poor' as GradeKey, range: '> 500ms',  color: 'var(--tint-red-fg)' },
          ].map(g => (
            <div key={g.key} className={s.ttfb_grade_item}>
              <span className={s.ttfb_grade_emoji}>{g.emoji}</span>
              <span className={s.ttfb_grade_name} style={{ color: g.color }}>{t(g.key)}</span>
              <span className={s.ttfb_grade_range}>{g.range}</span>
            </div>
          ))}
        </div>
      </section>

      {history.length > 0 && (
        <div className={`${ui.card} ${s.ttfb_history}`}>
          <div className={s.ttfb_history_header}>
            <h3 className={`${ui.cardTitle} ${s.ttfb_history_title}`}>{t('history_title')}</h3>
            <button onClick={() => setHistory([])} className={`${ui.button} ${ui.ghost} ${ui.sm}`}>
              {t('history_clear')}
            </button>
          </div>
          <div className={s.ttfb_history_list}>
            {history.map((item, i) => {
              const g = getGradeInfo(item.ttfb);
              return (
                <div
                  key={i}
                  onClick={() => runTest(item.url)}
                  className={s.ttfb_history_item}
                  title={isKo ? '클릭하여 재측정' : 'Click to re-test'}
                >
                  <span className={s.ttfb_history_emoji}>{g.emoji}</span>
                  <span className={s.ttfb_history_url}>{item.url}</span>
                  <span className={s.ttfb_history_value} style={{ color: g.color }}>{item.ttfb}ms</span>
                  <span className={s.ttfb_history_time}>{item.timestamp.toLocaleTimeString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ width: '100%' }}>
        <ShareBar title={t('title')} description={t('description')} />
        <RelatedTools toolId="utilities/performance/ttfb-check" />

        {seo}
      </div>
    </div>
  );
}
