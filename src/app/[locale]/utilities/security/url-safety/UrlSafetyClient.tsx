'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './url-safety.module.css';
import { ui } from '@/app/components/ui';

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
export default function UrlSafetyClient({ seo }: { seo?: React.ReactNode }) {
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
    <div className={`${ui.card} ${s.result} animate-fade-in`}>
      <div className={s.resultIcon}>✅</div>
      <div className={`${s.resultTitle} ${s.safeText}`}>{t('result_safe')}</div>
      <div className={s.resultUrl}>{checkedUrl}</div>
      <div className={s.resultNote}>{t('safe_note')}</div>
    </div>
  ) : status === 'unsafe' ? (
    <div className={`${ui.card} ${s.result} ${s.unsafe} animate-fade-in`}>
      <div className={s.resultIcon}>🚨</div>
      <div className={`${s.resultTitle} ${s.unsafeText}`}>{t('result_unsafe')}</div>
      <div className={s.resultUrl}>{checkedUrl}</div>
      {threats.length > 0 && (
        <div className={s.threats}>
          {threats.map((th, i) => (
            <div key={i} className={`${ui.notice} ${ui.red}`}>
              <strong>{THREAT_LABELS[th.threatType] ?? th.threatType}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  ) : status === 'error' ? (
    <div className={`${ui.notice} ${ui.red} animate-fade-in`}>
      <div>⚠️ {errorMsg}</div>
    </div>
  ) : null;

  return (
    <div className={s.wrap}>
      <NavigationActions />
      <ToolHeader icon={<ShieldAlert />} title={t('title')} subtitle={t('description')} />

      {/* How it works */}
      <div className={s.steps}>
        {(['step1', 'step2', 'step3'] as const).map((key, i) => (
          <div key={key} className={s.step}>
            <span className={s.stepNum}>{i + 1}</span>
            {t(key)}
            {i < 2 && <span className={s.stepArrow}>→</span>}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className={`${ui.card} ${s.inputCard}`}>
        <label className={ui.label}>
          {t('input_label')}
        </label>
        <div className={s.inputRow}>
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); if (status !== 'idle') reset(); }}
            onKeyDown={e => e.key === 'Enter' && handleCheck()}
            placeholder={t('placeholder')}
            className={`${ui.input} ${s.urlInput}`}
          />
          <button
            onClick={handleCheck}
            disabled={status === 'checking' || !input.trim()}
            className={`${ui.button} ${ui.primary}`}
          >
            {status === 'checking' ? '🔍 ' + t('checking') : '🔍 ' + t('check_btn')}
          </button>
        </div>
      </div>

      {/* Result */}
      <div className={s.resultWrap}>
        {resultCard}
        {(status === 'safe' || status === 'unsafe') && (
          <div className={s.again}>
            <button onClick={reset} className={`${ui.button} ${ui.secondary} ${ui.sm}`}>
              {t('check_another')}
            </button>
          </div>
        )}
      </div>

      {/* Info boxes */}
      <div className={s.infoGrid}>
        {(['info_malware', 'info_phishing', 'info_pua'] as const).map(key => (
          <div key={key} className={ui.card}>
            <div className={s.infoIcon}>
              {key === 'info_malware' ? '🦠' : key === 'info_phishing' ? '🎣' : '⚠️'}
            </div>
            <div className={s.infoTitle}>
              {t(`${key}_title` as any)}
            </div>
            <div className={s.infoDesc}>
              {t(`${key}_desc` as any)}
            </div>
          </div>
        ))}
      </div>

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/security/url-safety" />


      {seo}
    </div>
  );
}
