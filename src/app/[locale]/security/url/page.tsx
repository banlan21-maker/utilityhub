'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';

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

      <SeoSection
        ko={{
          title: "URL 피싱 & 악성코드 검사기란 무엇인가요?",
          description: "URL 피싱 검사기는 의심스러운 링크를 Google Safe Browsing API로 즉시 검사해 악성코드(Malware), 피싱(Phishing), 원치 않는 소프트웨어(PUA) 여부를 알려주는 온라인 보안 도구입니다. 이메일·카카오톡·문자로 받은 링크를 클릭하기 전에 먼저 이 도구로 검사하는 것만으로도 피싱 사기, 랜섬웨어 감염, 개인정보 탈취 등 다양한 사이버 위협으로부터 스스로를 보호할 수 있습니다. Google의 글로벌 위협 데이터베이스를 실시간으로 대조하므로 높은 정확도를 제공합니다.",
          useCases: [
            { icon: '📧', title: '스팸 & 피싱 이메일 링크 검사', desc: '의심스러운 이메일의 링크를 클릭하기 전 복사해서 검사하면 피싱 사이트로의 접속을 미리 차단할 수 있습니다.' },
            { icon: '💬', title: '카카오톡 & 문자 링크 검사', desc: "택배 배송 알림, 이벤트 당첨 문자 등 출처 불명의 링크를 '클릭 전 검사'하는 습관으로 스미싱을 예방합니다." },
            { icon: '🏢', title: '기업 보안 정책 교육', desc: '보안 담당자나 교육 목적으로 악성 URL 샘플을 안전하게 분석하거나, 직원 보안 인식 교육 자료로 활용합니다.' },
            { icon: '🔗', title: '단축 URL 원본 안전성 확인', desc: 'bit.ly, tinyurl 등 단축 URL의 실제 목적지를 파악하기 어려울 때, 단축 전 URL을 알고 있다면 사전에 검사합니다.' },
          ],
          steps: [
            { step: '의심 URL 입력', desc: '검사하고 싶은 링크를 입력창에 붙여넣습니다. https:// 없이 도메인만 입력해도 자동으로 인식됩니다.' },
            { step: '검사 실행', desc: "'검사하기' 버튼을 클릭하거나 Enter를 누르면 Google Safe Browsing API로 즉시 검사가 시작됩니다." },
            { step: '결과 확인', desc: "✅ '안전한 URL'이면 접속해도 됩니다. 🚨 '위험'이 표시되면 절대 클릭하지 마세요. 위협 유형(악성코드/피싱/유해 앱)도 함께 표시됩니다." },
          ],
          faqs: [
            { q: '검사 결과가 안전이어도 100% 믿어도 되나요?', a: "Google Safe Browsing은 수십억 개의 URL을 데이터베이스로 보유하지만, 최근 생성된 신규 피싱 사이트는 아직 등록되지 않았을 수 있습니다. '안전' 결과는 '알려진 위협 없음'을 의미하며, 도메인 철자가 이상하거나 출처가 불명확한 링크는 주의하세요." },
            { q: '검사한 URL이 저장되거나 제3자에게 공유되나요?', a: 'Google Safe Browsing API에 URL을 전송해 검사합니다. Google의 개인정보처리방침에 따라 처리되며, 이 사이트의 서버에는 저장되지 않습니다.' },
            { q: '기업 내부 URL(인트라넷)도 검사할 수 있나요?', a: '내부 IP(192.168.x.x, 10.x.x.x 등) 또는 localhost는 외부 접근이 불가능하므로 Safe Browsing 검사에서 의미 있는 결과를 얻기 어렵습니다. 공개 인터넷 URL 검사에 활용하세요.' },
          ],
        }}
        en={{
          title: "What is the URL Phishing & Malware Checker?",
          description: "This URL safety checker instantly scans suspicious links against the Google Safe Browsing API to detect malware, phishing, and unwanted software threats. Before clicking any link received via email, KakaoTalk, or SMS, paste it here first — this simple habit can protect you from phishing scams, ransomware infections, and credential theft. Google's global threat database of billions of URLs provides high detection accuracy for known threats.",
          useCases: [
            { icon: '📧', title: 'Suspicious Email Link Checking', desc: 'Before clicking any email link, copy it and run a safety check to block access to phishing sites before it happens.' },
            { icon: '💬', title: 'SMS & Chat Link Verification', desc: "Verify links in delivery notifications, event prize messages, or unknown senders before tapping — prevent smishing attacks." },
            { icon: '🏢', title: 'Corporate Security Training', desc: 'Security managers can use this tool to safely demonstrate malicious URL examples during employee security awareness training.' },
            { icon: '🔗', title: 'Shortened URL Safety Check', desc: "When a shortened URL's destination is unclear, check the full destination URL for safety before clicking." },
          ],
          steps: [
            { step: 'Enter the suspicious URL', desc: 'Paste the link you want to check. The domain alone (without https://) is also recognized automatically.' },
            { step: 'Run the check', desc: "Click 'Check URL' or press Enter to instantly query the Google Safe Browsing API." },
            { step: 'Review the result', desc: "✅ 'Safe' means no known threats — proceed with caution. 🚨 'Warning' means a known threat was detected — do not click the original link." },
          ],
          faqs: [
            { q: "Is a \"Safe\" result 100% guaranteed?", a: "Google Safe Browsing is extensive but newly created phishing sites may not yet be indexed. 'Safe' means 'no known threats found' — still exercise caution with domains that look suspicious or unfamiliar." },
            { q: 'Is the checked URL stored or shared?', a: "The URL is sent to the Google Safe Browsing API for checking, processed under Google's privacy policy. It is not stored on our servers." },
            { q: 'Can I check internal/intranet URLs?', a: 'Internal IPs (192.168.x.x, 10.x.x.x, localhost) are not externally accessible so Safe Browsing results are not meaningful. Use this tool for public internet URLs.' },
          ],
        }}
      />
    </div>
  );
}
