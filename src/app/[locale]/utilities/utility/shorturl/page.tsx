'use client';

import { useState, useEffect, useCallback } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';

/* ─── Types & Storage ─── */
interface HistoryItem {
  original: string;
  short: string;
  createdAt: string; // ISO string
}

const STORAGE_KEY = 'uh_shorturl_history';

function loadHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function truncate(s: string, n = 60): string {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

/* ─── Main Page ─── */
export default function ShortUrlPage() {
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
      setError('http:// 또는 https://로 시작하는 유효한 URL을 입력해주세요.');
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
        setError(data.error ?? '단축에 실패했습니다. 잠시 후 다시 시도해주세요.');
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
      setError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }, [url, history]);

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

  const handleClearAll = () => {
    if (!confirm('전체 기록을 삭제하시겠습니까?')) return;
    setHistory([]);
    saveHistory([]);
  };

  const inputStyle: React.CSSProperties = {
    flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
    background: 'var(--surface)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem',
  };

  const iconBtn: React.CSSProperties = {
    padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', background: 'var(--surface)',
    color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem',
  };

  return (
    <div>
      <NavigationActions />

      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>🔗 URL 단축기</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          긴 URL을 짧게 변환 — 변환 기록이 브라우저에 저장되어 다음 방문 시에도 확인 가능
        </p>
      </header>

      {/* Input Panel */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <label style={labelStyle}>단축할 URL 입력</label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleShorten()}
            placeholder="https://example.com/very-long-url?utm_source=..."
            style={inputStyle}
          />
          <button
            onClick={handleShorten}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)',
              background: 'var(--primary)', color: '#fff', border: 'none',
              cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '단축 중...' : '🔗 URL 단축'}
          </button>
        </div>
        {error && <p style={{ color: '#f87171', marginTop: '0.5rem', fontSize: '0.85rem' }}>{error}</p>}
      </div>

      {/* Result */}
      {result && (
        <div className="glass-panel" style={{
          padding: '1.5rem 2rem', marginBottom: '2rem',
          border: '1px solid var(--primary)', borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>✅ 단축 완료</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href={result}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
            >
              {result}
            </a>
            <button
              onClick={() => handleCopy(result)}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-md)',
                background: copiedUrl === result ? '#10b981' : 'var(--primary)',
                color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              }}
            >
              {copiedUrl === result ? '✓ 복사됨' : '📋 복사'}
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            원본: {truncate(url.trim())}
          </p>
        </div>
      )}

      {/* Ad placeholder */}
      <div style={{
        background: 'var(--surface)', border: '1px dashed var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '1rem', textAlign: 'center',
        color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '2rem',
        height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        광고 영역 (728×90)
      </div>

      {/* History */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            📋 변환 기록 ({history.length}개)
          </h2>
          {history.length > 0 && (
            <button onClick={handleClearAll} style={{ ...iconBtn, color: '#f87171', borderColor: '#f87171' }}>
              전체 삭제
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
            아직 변환 기록이 없습니다. URL을 단축하면 여기에 기록이 저장됩니다.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map(item => (
              <div
                key={item.short}
                style={{
                  padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <a
                      href={item.short}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}
                    >
                      {item.short}
                    </a>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {truncate(item.original, 80)}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button onClick={() => handleCopy(item.short)} style={iconBtn}>
                    {copiedUrl === item.short ? '✓' : '📋'}
                  </button>
                  <button onClick={() => handleDelete(item.short)} style={iconBtn}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
          💾 기록은 이 기기의 브라우저(LocalStorage)에만 저장됩니다. 서버에 전송되지 않습니다.
        </p>
      </div>

      <ShareBar title="URL 단축기" description="긴 URL을 짧게 변환 — 기록이 브라우저에 자동 저장" />

      <RelatedTools toolId="utilities/shorturl" />

      <SeoSection
        ko={{
          title: 'URL 단축기란? — 활용법 & FAQ',
          description: `URL 단축기(Link Shortener)는 길고 복잡한 URL을 짧고 공유하기 쉬운 형태로 변환해주는 온라인 도구입니다. 예를 들어 광고 파라미터가 포함된 100자 이상의 URL을 is.gd/abc처럼 20자 이내의 짧은 URL로 바꿔줍니다. SNS·카카오톡·문자 메시지로 공유할 때 가독성을 높이고 클릭률을 개선합니다.

이 도구의 핵심 기능은 변환 기록 저장입니다. 로그인 없이도 브라우저의 LocalStorage를 활용해 이전에 단축한 URL 목록(원본 URL, 단축 URL, 생성 날짜)을 자동으로 저장합니다. 덕분에 자주 사용하는 단축 링크를 다시 찾을 필요 없이 히스토리에서 바로 복사할 수 있어 반복 방문을 유도합니다.

【활용 팁 및 마케팅 전략】
마케터라면 캠페인별로 UTM 파라미터가 붙은 긴 URL을 단축해 SNS·이메일·SMS에 활용하세요. 짧은 URL은 QR 코드 생성 시 데이터 밀도를 낮춰 스캔 성공률을 높입니다. 블로거·크리에이터는 참조 링크(affiliate link)를 단축해 게시물에 깔끔하게 삽입할 수 있습니다. 기업 담당자는 보도자료·명함·프레젠테이션에 단축 URL을 사용해 전문적인 인상을 줄 수 있습니다.`,
          useCases: [
            { icon: '📱', title: 'SNS·메시지 공유', desc: 'SNS·카카오톡·문자에 긴 URL을 짧게 줄여 가독성과 클릭률을 높입니다.' },
            { icon: '📷', title: 'QR 코드 최적화', desc: '짧은 URL로 QR 코드 데이터 밀도를 낮춰 스캔 성공률을 높입니다.' },
            { icon: '📊', title: '마케팅 UTM 관리', desc: '캠페인 파라미터가 긴 URL을 단축해 이메일·광고·SMS에 활용합니다.' },
            { icon: '📋', title: '브라우저 기록 저장', desc: '로그인 없이 변환 기록이 자동 저장되어 다음 방문 시 재사용 가능합니다.' },
          ],
          steps: [
            { step: '1', desc: '단축할 URL을 입력칸에 붙여넣기 (http:// 또는 https:// 포함)' },
            { step: '2', desc: '「🔗 URL 단축」 버튼 클릭' },
            { step: '3', desc: '생성된 짧은 URL 확인 후 「📋 복사」 버튼 클릭' },
            { step: '4', desc: '하단 변환 기록에서 이전 단축 URL 재사용 가능' },
          ],
          faqs: [
            {
              q: '단축된 URL은 얼마나 오래 유지되나요?',
              a: '이 서비스는 is.gd API를 활용합니다. is.gd에서 생성된 단축 URL은 일반적으로 영구적으로 유지되지만, 악성 콘텐츠로 신고되거나 서비스 정책에 위반되는 경우 삭제될 수 있습니다. 중요한 URL은 여러 방법으로 백업해두세요.',
            },
            {
              q: '변환 기록은 어디에 저장되나요? 서버에 전송되나요?',
              a: '변환 기록은 사용하는 기기의 브라우저(LocalStorage)에만 저장됩니다. 서버나 외부로 전송되지 않아 개인정보가 보호됩니다. 단, 브라우저 데이터를 삭제하거나 다른 기기를 사용하면 기록이 사라집니다.',
            },
            {
              q: 'URL에 포함된 개인정보가 노출될 수 있나요?',
              a: '단축 URL 변환 과정에서 원본 URL이 is.gd 서버로 전달됩니다. 원본 URL에 개인정보가 포함되어 있다면 해당 정보가 제3자 서비스(is.gd)에 전달될 수 있습니다. 민감한 개인정보가 포함된 URL은 단축 서비스 이용 시 주의가 필요합니다.',
            },
          ],
        }}
        en={{
          title: 'URL Shortener — How to Use & FAQ',
          description: `A URL Shortener (Link Shortener) converts long, complex URLs into short, shareable links. For example, a 120-character URL loaded with UTM tracking parameters becomes something like is.gd/abc — under 20 characters. Short links improve readability and click-through rates when sharing via social media, KakaoTalk, email, or SMS.

A key feature of this tool is its browser-based history. Without any login, it automatically saves all previously shortened links — including the original URL, the short URL, and the creation date — using your browser's LocalStorage. This means you can return to the page later and instantly copy any past short link from the history list, encouraging repeat visits without requiring an account.

【Usage Tips & Marketing Strategies】
Marketers can shorten campaign URLs containing UTM parameters for use across social ads, email newsletters, and SMS campaigns. Short URLs dramatically reduce QR code complexity, improving scan success rates — ideal for print materials, business cards, and posters. Bloggers and content creators can shorten affiliate links for clean, professional-looking posts. Corporate users can include short URLs in press releases, presentations, and business cards for a polished appearance.`,
          useCases: [
            { icon: '📱', title: 'Social media sharing', desc: 'Shorten long URLs for cleaner, higher-CTR sharing on social media and messaging apps.' },
            { icon: '📷', title: 'QR code optimization', desc: 'Reduce QR code complexity with shorter URLs to improve scan success rates.' },
            { icon: '📊', title: 'UTM campaign management', desc: 'Shorten campaign URLs with UTM parameters for use in email, ads, and SMS.' },
            { icon: '📋', title: 'Browser history', desc: 'Shortening history is saved locally — no login needed to access past links on your next visit.' },
          ],
          steps: [
            { step: '1', desc: 'Paste your long URL into the input field (must start with http:// or https://)' },
            { step: '2', desc: 'Click the "🔗 Shorten URL" button' },
            { step: '3', desc: 'Copy the generated short link with the "📋 Copy" button' },
            { step: '4', desc: 'Find and reuse any previously shortened links from the history panel below' },
          ],
          faqs: [
            {
              q: 'How long do shortened URLs remain active?',
              a: 'This tool uses the is.gd shortening service. Links generated by is.gd are generally permanent, but may be removed if reported for malicious content or if they violate the service\'s terms of use. Keep backups of critical URLs in multiple formats.',
            },
            {
              q: 'Where is my history stored? Is it sent to a server?',
              a: 'Your shortening history (original URL, short URL, and date) is stored exclusively in your browser\'s LocalStorage — it is never sent to our servers or any third party. Note that clearing your browser data or switching devices will erase the history.',
            },
            {
              q: 'Can personal data in my URL be exposed?',
              a: 'During the shortening process, your original URL is sent to the is.gd API for processing. If the URL contains personal information (e.g., email addresses, tokens), that data will be transmitted to is.gd\'s servers. Exercise caution when shortening URLs that contain sensitive information.',
            },
          ],
        }}
      />
    </div>
  );
}
