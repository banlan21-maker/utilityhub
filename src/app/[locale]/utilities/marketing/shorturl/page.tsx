import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isKo = params.locale === "ko";
  const title = isKo
    ? "URL 단축기 | Utility Hub"
    : "URL Shortener | Utility Hub";
  const description = isKo
    ? "긴 URL을 짧고 공유하기 쉬운 링크로 즉시 변환하세요. 무료·무제한·로그인 불필요"
    : "Shorten any long URL into a clean, shareable link instantly. Free, unlimited, no login required.";
  const canonical = `https://www.theutilhub.com/${params.locale}/utilities/marketing/shorturl`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: "https://www.theutilhub.com/ko/utilities/marketing/shorturl",
        en: "https://www.theutilhub.com/en/utilities/marketing/shorturl",
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Utility Hub",
      locale: isKo ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "URL 단축기",
  "alternateName": "URL Shortener",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/marketing/shorturl",
  "description": "긴 URL을 짧고 공유하기 쉬운 링크로 즉시 변환하세요. 무료·무제한·로그인 불필요"
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "단축된 URL은 얼마나 오래 유지되나요?", "acceptedAnswer": { "@type": "Answer", "text": "영구적으로 유지됩니다. 단, 불법적인 용도로 사용되거나 신고가 접수될 경우 차단될 수 있습니다." } },
    { "@type": "Question", "name": "변환 기록은 안전한가요?", "acceptedAnswer": { "@type": "Answer", "text": "기록은 브라우저(LocalStorage)에만 저장되어 외부로 절대 전송되지 않습니다. 안심하고 사용하세요." } },
    { "@type": "Question", "name": "무료인가요?", "acceptedAnswer": { "@type": "Answer", "text": "네, 비용이나 횟수 제한 없이 100% 무료로 무제한 이용 가능합니다." } },
    { "@type": "Question", "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." } }
  ]
};

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
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
            description: 'URL 단축기(Link Shortener)는 광고 파라미터나 경로가 포함된 길고 복잡한 URL을 20자 이내의 짧고 깔끔한 주소로 즉시 변환해주는 온라인 마케팅 도구입니다. 인스타그램 바이오, 카카오톡 메시지, 문자 등 글자 수가 제한되는 환경에서 URL이 차지하는 공간을 최소화하고 클릭률을 높여줍니다. 변환된 짧은 URL은 QR 코드 생성 시 데이터 밀도를 낮춰 스캔 성공률도 향상됩니다. 로그인·회원가입 없이 즉시 사용 가능하며, 변환 기록은 기기 로컬에 자동 저장되어 언제든 재사용할 수 있습니다.',
            useCases: [
              { icon: '📱', title: 'SNS·메시지 공유', desc: '인스타그램 바이오, 카카오톡, 문자 메시지에 긴 URL을 짧게 줄여 가독성을 높이고 클릭률을 개선합니다. 링크가 깔끔하게 보일수록 수신자의 신뢰도와 클릭 의향이 높아집니다.' },
              { icon: '📷', title: 'QR 코드 최적화', desc: '짧은 URL로 QR 코드를 생성하면 데이터 밀도가 낮아져 QR 패턴이 단순해지고 스마트폰 카메라의 스캔 성공률이 크게 높아집니다. 인쇄물에 작은 크기로 QR을 넣어야 할 때 특히 유용합니다.' },
              { icon: '📊', title: '마케팅 UTM 관리', desc: 'Google Analytics UTM 파라미터(utm_source, utm_medium, utm_campaign 등)가 포함된 100자 이상의 추적 URL을 짧게 단축하여 광고 소재나 이메일에 깔끔하게 삽입하고 성과를 추적할 수 있습니다.' },
              { icon: '📋', title: '변환 기록 재사용', desc: '로그인 없이도 변환한 URL 기록이 브라우저에 자동 저장되어 최대 50개까지 보관됩니다. 이전에 단축한 링크를 언제든 꺼내 복사하거나 삭제할 수 있어 반복 작업을 줄여줍니다.' },
            ],
            steps: [
              { step: 'URL 입력', desc: '단축할 긴 URL을 입력칸에 붙여넣습니다. 반드시 http:// 또는 https://로 시작하는 완전한 형태의 주소여야 하며, 올바르지 않은 형식은 오류 메시지로 안내됩니다.' },
              { step: '단축하기 버튼 클릭', desc: '지금 단축하기 버튼을 클릭하거나 Enter 키를 누르면 외부 단축 API를 통해 즉시 짧은 주소가 생성됩니다. 처리는 보통 1초 이내에 완료됩니다.' },
              { step: '단축 URL 복사', desc: '생성된 짧은 URL이 결과 박스에 표시됩니다. 복사하기 버튼을 누르면 클립보드에 즉시 복사되며, 링크를 클릭해 새 탭에서 정상 작동하는지 미리 확인할 수 있습니다.' },
              { step: 'SNS·메신저에 바로 붙여넣기', desc: '복사한 단축 URL을 인스타그램 바이오, 카카오톡 채팅, 이메일, 문자 메시지 등 원하는 채널에 바로 붙여넣어 공유합니다. 변환 기록은 하단 기록 패널에서 언제든 재조회할 수 있습니다.' },
            ],
            faqs: [
              { q: '단축된 URL은 얼마나 오래 유지되나요?', a: '생성된 단축 URL은 기본적으로 영구 유지됩니다. 별도의 만료 기간이 설정되어 있지 않으므로 명함, 인쇄물, 영구 게시물 등에 안심하고 사용할 수 있습니다. 단, 스팸·피싱 등 불법 용도로 신고된 링크는 서비스 정책에 따라 차단될 수 있습니다.' },
              { q: '변환 기록은 외부로 전송되나요?', a: '아니요. 변환 기록은 사용자의 브라우저 LocalStorage에만 저장되며, 외부 서버나 제3자에게 전달되지 않습니다. 단, URL 자체를 단축하는 API 호출 시 원본 URL은 단축 서비스 서버로 전달됩니다. 민감한 내부 링크는 단축 전 충분히 검토하시기 바랍니다.' },
              { q: '무료로 무제한 사용 가능한가요?', a: '네, 현재 이 도구는 완전 무료이며 횟수 제한 없이 이용 가능합니다. 회원가입이나 로그인도 필요하지 않습니다. 다만 외부 단축 API의 정책 변경에 따라 이용 조건이 달라질 수 있습니다.' },
              { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
            ],
          }}
          en={{
            title: 'What is a URL Shortener?',
            description: 'A URL Shortener is an online marketing tool that instantly converts long, parameter-heavy URLs into short, clean links under 20 characters. Whether you are sharing links in an Instagram bio, a KakaoTalk message, or an SMS campaign, shortened URLs improve readability and increase click-through rates. Shorter links also produce simpler QR code patterns that scan faster and more reliably on smartphone cameras. This tool requires no login or registration — just paste your URL and get a short link in under a second. All conversion history is automatically saved to your browser locally, storing up to 50 entries so you can retrieve and reuse past links at any time without logging in.',
            useCases: [
              { icon: '📱', title: 'Social Media & Messaging', desc: 'Shorten unwieldy URLs before posting them in Instagram bios, Twitter posts, KakaoTalk chats, or SMS messages to improve readability and encourage more clicks from recipients.' },
              { icon: '📷', title: 'QR Code Optimization', desc: 'Generating a QR code from a shorter URL produces a simpler dot pattern with lower data density, which makes it easier and faster for smartphone cameras to scan — especially when printed small.' },
              { icon: '📊', title: 'UTM Campaign Management', desc: 'Marketing URLs with UTM parameters (utm_source, utm_medium, utm_campaign) can exceed 150 characters. Shortening them keeps email copy and ad creatives clean while preserving full campaign tracking accuracy.' },
              { icon: '📋', title: 'Reuse Link History', desc: 'Up to 50 previously shortened links are automatically saved in your browser without any login. You can copy or delete any past entry from the history panel, eliminating the need to re-shorten the same URL repeatedly.' },
            ],
            steps: [
              { step: 'Paste Your Long URL', desc: 'Paste the full URL you want to shorten into the input field. Make sure it starts with http:// or https:// — incomplete or malformed addresses will trigger a clear error message guiding you to correct it.' },
              { step: 'Click Shorten Now', desc: 'Press the Shorten Now button or hit Enter. The tool calls an external shortening API and returns your clean short link in under one second, displaying it immediately in the result box below.' },
              { step: 'Copy the Short Link', desc: 'Click the Copy button next to the result to copy the short URL to your clipboard instantly. You can also click the link itself to open it in a new tab and verify it redirects correctly before sharing.' },
              { step: 'Share Anywhere', desc: 'Paste the copied short link into any channel — Instagram bio, social media caption, email newsletter, SMS, printed QR code, or presentation slide — and your audience reaches the destination in one tap.' },
            ],
            faqs: [
              { q: 'How long do shortened links remain active?', a: 'Shortened links are permanent by default with no expiration date set, making them safe for business cards, printed materials, and long-term posts. However, links reported for spam, phishing, or other policy violations may be deactivated by the underlying shortening service.' },
              { q: 'Is my link history stored on your servers?', a: 'No. Your conversion history is stored exclusively in your browser\'s LocalStorage and is never transmitted to our servers or any third party. Note that the original URL itself is sent to the external shortening API during the shortening request, so avoid shortening sensitive internal links.' },
              { q: 'Is this tool really free with no limits?', a: 'Yes, the tool is completely free with no usage limits or registration required. You can shorten as many links as you need without any cost. Usage conditions may change in the future based on the policies of the underlying shortening API service.' },
              { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
            ],
          }}
        />
      </div>
    </div>
  );
}
