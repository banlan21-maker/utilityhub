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
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './shorturl.module.css';

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

export default function ShortUrlPage() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedUrl, setCopiedUrl] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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

  if (!isClient) return null;

  return (
    <div className={s.url_container}>
      <NavigationActions />

      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Link2 size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
          {isKo ? 'URL 단축기' : 'URL Shortener'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {isKo
            ? '긴 주소를 짧고 강력하게 변환하세요. 클릭 한 번으로 모든 SNS 공유 가능'
            : 'Make long links short and powerful. Perfect for social media sharing.'}
        </p>
      </header>

      {/* Input Section */}
      <section className={s.url_panel}>
        <div>
          <label className={s.url_label}>{isKo ? '긴 URL 입력' : 'Enter Long URL'}</label>
          <div className={s.url_input_row}>
            <input
              className={s.url_input}
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleShorten()}
              placeholder="https://example.com/very-long-url..."
            />
            <button onClick={handleShorten} disabled={loading} className={s.url_primary_button}>
              {loading ? <Zap className="animate-pulse" /> : <ChevronRight />}
              {isKo ? '지금 단축하기' : 'Shorten Now'}
            </button>
          </div>
          {error && <p style={{ color: '#ef4444', marginTop: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>{error}</p>}
        </div>

        {/* Success Result */}
        {result && (
          <div className={s.url_result_box} style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 800, marginBottom: '0.25rem' }}>
                <Sparkles size={12} style={{ marginRight: '4px', display: 'inline' }} />
                {isKo ? '단축 완료!' : 'SHORTENED!'}
              </div>
              <a href={result} target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', textDecoration: 'underline', textDecorationColor: '#8b5cf6' }}>
                {result}
              </a>
            </div>
            <button 
              onClick={() => handleCopy(result)} 
              className={s.url_primary_button}
              style={{ background: copiedUrl === result ? '#10b981' : '#8b5cf6', padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
            >
              <Copy size={18} />
              {copiedUrl === result ? (isKo ? '복사됨' : 'Copied!') : (isKo ? '복사하기' : 'Copy')}
            </button>
          </div>
        )}
      </section>

      {/* History Section */}
      {history.length > 0 && (
        <section className={s.url_panel} style={{ gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} color="#8b5cf6" />
              {isKo ? '변환 기록' : 'Link History'}
            </h2>
            <button 
              onClick={() => { if(confirm(isKo ? '모든 기록을 삭제하시겠습니까?' : 'Clear history?')) { setHistory([]); saveHistory([]); } }}
              style={{ fontSize: '0.81rem', color: '#94a3b8', background: 'none', border: 'none', padding: 0 }}
            >
              {isKo ? '전체 삭제' : 'Clear All'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map(item => (
              <div key={item.short} className={s.url_history_item}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <a href={item.short} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 800, color: '#8b5cf6', fontSize: '1rem' }}>
                      {item.short}
                    </a>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{formatDate(item.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <ChevronRight size={12} />
                    {truncate(item.original)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleCopy(item.short)} className={s.url_icon_button}>
                    {copiedUrl === item.short ? <span style={{ color: '#10b981' }}>✓</span> : <Copy size={16} />}
                  </button>
                  <button onClick={() => handleDelete(item.short)} className={s.url_icon_button} style={{ borderColor: '#fee2e2' }}>
                    <Trash2 size={16} color="#ef4444" />
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
        <div className={s.url_ad_placeholder}>
          {isKo ? '광고 영역 (Google AdSense 등)' : 'Ad Space (Google AdSense, etc.)'}
        </div>

        {/* 1 ~ 4. SEO Sections */}
        <SeoSection
          ko={{
            title: 'URL 단축기란 무엇인가요?',
            description: 'URL 단축기(Link Shortener)는 길고 복잡한 URL을 짧고 공유하기 쉬운 형태로 변환해주는 온라인 도구입니다. 예를 들어 광고 파라미터가 포함된 100자 이상의 URL을 20자 이내의 짧은 URL로 바꿔줍니다. SNS·카카오톡·문자 메시지로 공유할 때 가독성을 높이고 클릭률을 개선하는 필수 도구입니다.',
            useCases: [
              { icon: '📱', title: 'SNS·메시지 공유', desc: 'SNS·카카오톡·문자에 긴 URL을 짧게 줄여 가독성과 클릭률을 높입니다.' },
              { icon: '📷', title: 'QR 코드 최적화', desc: '짧은 URL로 QR 코드 데이터 밀도를 낮춰 스캔 성공률을 높입니다.' },
              { icon: '📊', title: '마케팅 UTM 관리', desc: '캠페인 파라미터가 긴 URL을 단축해 광고 성과를 깔끔하게 추적하세요.' },
              { icon: '📋', title: '브라우저 기록 저장', desc: '로그인 없이 변환 기록이 기기에 자동 저장되어 언제든 재사용 가능합니다.' },
            ],
            steps: [
              { step: '1', desc: '단축할 URL을 입력칸에 붙여넣으세요 (http:// 또는 https:// 포함).' },
              { step: '2', desc: '지금 단축하기 버튼을 누르면 즉시 짧은 주소가 생성됩니다.' },
              { step: '3', desc: '생성된 URL을 복사하여 SNS나 메신저에 바로 활용하세요.' },
            ],
            faqs: [
              { q: '단축된 URL은 얼마나 오래 유지되나요?', a: '영구적으로 유지됩니다. 단, 불법적인 용도로 사용되거나 신고가 접수될 경우 차단될 수 있습니다.' },
              { q: '변환 기록은 안전한가요?', a: '기록은 브라우저(LocalStorage)에만 저장되어 외부로 절대 전송되지 않습니다. 안심하고 사용하세요.' },
              { q: '무료인가요?', a: '네, 비용이나 횟수 제한 없이 100% 무료로 무제한 이용 가능합니다.' },
            ],
          }}
          en={{
            title: 'What is a URL Shortener?',
            description: 'A URL Shortener turns long, complex links into short, shareable ones. It makes your links look clean and professional, boosting click-through rates on platforms like Instagram, Twitter, and messaging apps.',
            useCases: [
              { icon: '📱', title: 'Social Sharing', desc: 'Clean up your links for social media captions and messaging.' },
              { icon: '📷', title: 'QR Code Prep', desc: 'Improve QR code scannability with shorter URLs.' },
              { icon: '📊', title: 'UTM Tracking', desc: 'Hide long tracking strings behind neat, short links.' },
              { icon: '📋', title: 'History Support', desc: 'Access your previous links anytime from the local history panel.' },
            ],
            steps: [
              { step: '1', desc: 'Paste your long link starting with http:// or https://.' },
              { step: '2', desc: 'Click "Shorten Now" to get your clean link instantly.' },
              { step: '3', desc: 'Copy the result and share it anywhere!' },
            ],
            faqs: [
              { q: 'Is it really free?', a: 'Yes, 100% free with unlimited link creation.' },
              { q: 'Does the link expire?', a: 'The links are permanent and do not expire unless flagged for abuse.' },
              { q: 'Is it private?', a: 'Your history is stored only on your machine, not our servers.' },
            ],
          }}
        />
      </div>
    </div>
  );
}
