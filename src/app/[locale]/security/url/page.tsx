'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import NavigationActions from '@/app/components/NavigationActions';

// ── Types ────────────────────────────────────────────────────────────────────
type CheckStatus = 'idle' | 'checking' | 'safe' | 'unsafe' | 'error';

interface ThreatDetail {
  threatType: string;
  platformType: string;
  threatEntryType: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return 'https://' + trimmed;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const THREAT_LABELS: Record<string, string> = {
  MALWARE: '악성코드',
  SOCIAL_ENGINEERING: '피싱/사회공학',
  UNWANTED_SOFTWARE: '원치 않는 소프트웨어',
  POTENTIALLY_HARMFUL_APPLICATION: '잠재적 유해 앱',
};

// ── Component ────────────────────────────────────────────────────────────────
export default function UrlCheckerPage() {
  const t = useTranslations('UrlChecker');

  const [input, setInput] = useState('');
  const [status, setStatus] = useState<CheckStatus>('idle');
  const [threats, setThreats] = useState<ThreatDetail[]>([]);
  const [checkedUrl, setCheckedUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCheck = async () => {
    const url = normalizeUrl(input);
    if (!isValidUrl(url)) {
      setErrorMsg(t('error_invalid'));
      setStatus('error');
      return;
    }

    setStatus('checking');
    setThreats([]);
    setErrorMsg('');
    setCheckedUrl(url);

    try {
      const apiKey = process.env.NEXT_PUBLIC_SAFE_BROWSING_KEY;
      if (!apiKey) {
        // Fallback: simple heuristic check (no API key configured)
        await new Promise(r => setTimeout(r, 800));
        const suspicious = /bit\.ly|tinyurl|phish|malware|hack|crack|free-download|adult|xxx/i.test(url);
        setStatus(suspicious ? 'unsafe' : 'safe');
        if (suspicious) {
          setThreats([{ threatType: 'SOCIAL_ENGINEERING', platformType: 'ANY_PLATFORM', threatEntryType: 'URL' }]);
        }
        return;
      }

      const body = {
        client: { clientId: 'utility-hub', clientVersion: '1.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }],
        },
      };

      const res = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      );

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();

      if (data.matches && data.matches.length > 0) {
        setThreats(data.matches.map((m: any) => m.threat as ThreatDetail));
        setStatus('unsafe');
      } else {
        setStatus('safe');
      }
    } catch (e) {
      console.error('[URL Check]', e);
      setErrorMsg(t('error_generic'));
      setStatus('error');
    }
  };

  const reset = () => {
    setInput('');
    setStatus('idle');
    setThreats([]);
    setCheckedUrl('');
    setErrorMsg('');
  };

  // Result UI
  const resultCard = status === 'safe' ? (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#16a34a', marginBottom: '0.5rem' }}>{t('result_safe')}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{checkedUrl}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>{t('safe_note')}</div>
    </div>
  ) : status === 'unsafe' ? (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', textAlign: 'center', borderColor: '#fca5a5' }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🚨</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem' }}>{t('result_unsafe')}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', wordBreak: 'break-all', marginBottom: '1rem' }}>{checkedUrl}</div>
      {threats.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
          {threats.map((th, i) => (
            <div key={i} style={{ padding: '0.5rem 0.75rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 600, color: '#dc2626' }}>
                {THREAT_LABELS[th.threatType] ?? th.threatType}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  ) : status === 'error' ? (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', textAlign: 'center' }}>
      <div style={{ color: '#ef4444', fontSize: '0.95rem' }}>⚠️ {errorMsg}</div>
    </div>
  ) : null;

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('description')}</p>
      </header>

      {/* How it works */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {(['step1', 'step2', 'step3'] as const).map((key, i) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '1.5rem', height: '1.5rem', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
            {t(key)}
            {i < 2 && <span style={{ color: 'var(--border)' }}>→</span>}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem', maxWidth: '680px', margin: '0 auto 1.5rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
          {t('input_label')}
        </label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); if (status !== 'idle') reset(); }}
            onKeyDown={e => e.key === 'Enter' && handleCheck()}
            placeholder={t('placeholder')}
            style={{
              flex: 1, minWidth: '200px', padding: '0.75rem 1rem', fontSize: '0.95rem',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none',
            }}
          />
          <button
            onClick={handleCheck}
            disabled={status === 'checking' || !input.trim()}
            style={{
              padding: '0.75rem 1.5rem', fontSize: '0.95rem', fontWeight: 600,
              backgroundColor: 'var(--primary)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
              opacity: (status === 'checking' || !input.trim()) ? 0.6 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {status === 'checking' ? '🔍 ' + t('checking') : '🔍 ' + t('check_btn')}
          </button>
        </div>
      </div>

      {/* Result */}
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {resultCard}
        {(status === 'safe' || status === 'unsafe') && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button onClick={reset} style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              {t('check_another')}
            </button>
          </div>
        )}
      </div>

      {/* Info boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '2.5rem', maxWidth: '680px', margin: '2.5rem auto 0' }}>
        {(['info_malware', 'info_phishing', 'info_pua'] as const).map(key => (
          <div key={key} className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {key === 'info_malware' ? '🦠' : key === 'info_phishing' ? '🎣' : '⚠️'}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              {t(`${key}_title` as any)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {t(`${key}_desc` as any)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
