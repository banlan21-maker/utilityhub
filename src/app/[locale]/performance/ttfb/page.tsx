'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';

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

      <SeoSection
        ko={{
          title: "TTFB(Time To First Byte)란 무엇인가요?",
          description: "TTFB(Time To First Byte)는 웹 브라우저가 서버에 HTTP 요청을 보낸 후 첫 번째 데이터 바이트를 수신하기까지 걸리는 시간을 밀리초(ms) 단위로 측정한 값입니다. 웹사이트 성능을 평가하는 핵심 지표 중 하나로, 구글의 Core Web Vitals에서도 중요하게 다룹니다. TTFB 속도 테스터를 이용하면 URL만 입력하면 즉시 서버 응답 시간을 측정하고 '양호(Good) / 보통(OK) / 개선 필요(Poor)'로 등급을 확인할 수 있습니다. TTFB가 빠를수록 사용자 경험이 좋고 SEO 점수에도 긍정적인 영향을 미칩니다.",
          useCases: [
            { icon: '🔍', title: 'SEO & Core Web Vitals 점검', desc: '구글 검색 순위에 영향을 주는 TTFB를 정기적으로 측정해 사이트 최적화 상태를 모니터링합니다.' },
            { icon: '🛠️', title: '서버 성능 비교', desc: '호스팅 업체 변경이나 CDN 적용 전후를 비교 측정해 실제 개선 효과를 수치로 확인할 수 있습니다.' },
            { icon: '🌏', title: '글로벌 서버 응답 확인', desc: '해외 사용자를 위한 서비스의 응답 속도를 테스트하여 지역별 성능 이슈를 파악합니다.' },
            { icon: '⚡', title: '코드 배포 후 성능 검증', desc: '새 기능 배포나 서버 설정 변경 후 TTFB를 측정해 성능 회귀(regression) 여부를 즉시 확인합니다.' },
          ],
          steps: [
            { step: 'URL 입력', desc: "측정하고 싶은 웹사이트 주소를 'https://'를 포함해 입력합니다." },
            { step: '테스트 실행', desc: "'테스트 실행' 버튼을 클릭하면 서버로 요청을 보내고 응답 시간을 밀리초 단위로 측정합니다." },
            { step: '결과 해석 및 기록 확인', desc: '측정값과 등급(양호/보통/개선 필요)을 확인합니다. 하단 이력에는 최근 테스트 기록이 남아 변화 추이를 비교할 수 있습니다.' },
          ],
          faqs: [
            { q: 'TTFB는 몇 ms 이하여야 좋은 건가요?', a: "구글 권장 기준: 200ms 이하는 '양호(Good)', 200~500ms는 '보통(Needs Improvement)', 500ms 초과는 '개선 필요(Poor)'입니다. 국내 서버 기준 100ms 이하가 이상적입니다." },
            { q: 'TTFB가 높을 때 원인과 해결책은 무엇인가요?', a: '주요 원인: 서버 처리 속도 저하, 느린 데이터베이스 쿼리, CDN 미사용, 높은 서버 부하입니다. 해결책: CDN 도입, 서버 캐싱 적용, 데이터베이스 쿼리 최적화, 더 빠른 호스팅으로 이전을 고려하세요.' },
            { q: '매번 측정 결과가 조금씩 다른 이유는 무엇인가요?', a: '네트워크 경로, 서버 부하, DNS 조회 시간 등이 매 요청마다 달라질 수 있습니다. 동일한 URL을 3~5회 반복 측정해 평균값을 기준으로 판단하는 것을 권장합니다.' },
          ],
        }}
        en={{
          title: "What is TTFB (Time To First Byte)?",
          description: "TTFB (Time To First Byte) measures the time in milliseconds between a browser sending an HTTP request and receiving the first byte of data from the server. It's a core web performance metric featured in Google's Core Web Vitals. This TTFB speed tester lets you measure server response time instantly — just enter a URL — and grades the result as Good, Average, or Needs Work. Faster TTFB means better user experience and a positive impact on SEO rankings.",
          useCases: [
            { icon: '🔍', title: 'SEO & Core Web Vitals Auditing', desc: 'Regularly measure TTFB to monitor your site optimization status and its effect on Google search rankings.' },
            { icon: '🛠️', title: 'Hosting & CDN Comparison', desc: 'Measure before and after switching hosting providers or enabling a CDN to quantify real performance gains.' },
            { icon: '🌏', title: 'Global Server Response Check', desc: 'Test response speed for international users to identify region-specific performance issues.' },
            { icon: '⚡', title: 'Post-Deploy Performance Validation', desc: 'Run TTFB tests after new deployments or server config changes to catch performance regressions immediately.' },
          ],
          steps: [
            { step: 'Enter the URL', desc: 'Type or paste the website address including https:// into the input field.' },
            { step: 'Run the test', desc: "Click 'Run Test' to send a request to the server and measure response time in milliseconds." },
            { step: 'Interpret the results', desc: 'Review the grade (Good / Average / Needs Work) and check the history log to track changes over time.' },
          ],
          faqs: [
            { q: 'What TTFB is considered good?', a: "Google recommends under 200ms as 'Good', 200–500ms as 'Needs Improvement', and above 500ms as 'Poor'. Under 100ms is ideal for domestic servers." },
            { q: 'What causes high TTFB and how can I fix it?', a: 'Common causes: slow server processing, unoptimized database queries, no CDN, or high server load. Solutions: implement CDN, enable server-side caching, optimize DB queries, or upgrade your hosting plan.' },
            { q: 'Why do results vary between tests?', a: 'Network routing, server load, and DNS lookup times vary per request. Run 3–5 tests and use the average as your baseline measurement.' },
          ],
        }}
      />
    </div>
  );
}
