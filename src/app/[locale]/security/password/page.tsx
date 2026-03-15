'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';

// ── Charset helpers ──────────────────────────────────────────────────────────
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS = /[0OIl1]/g;

function buildCharset(opts: Options): string {
  let cs = '';
  if (opts.upper) cs += UPPER;
  if (opts.lower) cs += LOWER;
  if (opts.digits) cs += DIGITS;
  if (opts.symbols) cs += SYMBOLS;
  if (opts.excludeAmbiguous) cs = cs.replace(AMBIGUOUS, '');
  return cs || LOWER + DIGITS;
}

function generatePassword(opts: Options): string {
  const charset = buildCharset(opts);
  const arr = new Uint32Array(opts.length);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(n => charset[n % charset.length]).join('');
}

// ── Entropy & crack time ─────────────────────────────────────────────────────
function calcEntropy(password: string, charsetSize: number): number {
  return password.length * Math.log2(charsetSize);
}

function entropyToTime(bits: number): { label: string; color: string; level: number } {
  // Assume 1 trillion guesses/sec (10^12) — modern GPU cluster
  const guesses = Math.pow(2, bits);
  const seconds = guesses / 1e12;

  const minute = 60;
  const hour = 3600;
  const day = 86400;
  const year = 31536000;
  const century = year * 100;
  const million_years = year * 1e6;
  const billion_years = year * 1e9;

  let label: string;
  let level: number; // 0-4 (weak → very strong)

  if (seconds < 1) { label = '즉시 해킹 가능'; level = 0; }
  else if (seconds < minute) { label = `약 ${Math.round(seconds)}초`; level = 0; }
  else if (seconds < hour) { label = `약 ${Math.round(seconds / minute)}분`; level = 1; }
  else if (seconds < day) { label = `약 ${Math.round(seconds / hour)}시간`; level = 1; }
  else if (seconds < year) { label = `약 ${Math.round(seconds / day)}일`; level = 2; }
  else if (seconds < century) { label = `약 ${Math.round(seconds / year)}년`; level = 2; }
  else if (seconds < million_years) { label = `약 ${Math.round(seconds / century)}세기`; level = 3; }
  else if (seconds < billion_years) { label = `약 ${(seconds / million_years).toFixed(1)}백만 년`; level = 3; }
  else { label = `약 ${(seconds / billion_years).toFixed(1)}십억 년 이상`; level = 4; }

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
  return { label, color: colors[level], level };
}

// ── Strength label ────────────────────────────────────────────────────────────
const STRENGTH_LABELS = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
const STRENGTH_EN = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

// ── Types ────────────────────────────────────────────────────────────────────
interface Options {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function PasswordGenPage() {
  const t = useTranslations('PasswordGen');

  const [opts, setOpts] = useState<Options>({
    length: 16,
    upper: true,
    lower: true,
    digits: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  const [password, setPassword] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = useCallback(() => {
    const pw = generatePassword(opts);
    setPassword(pw);
    setHistory(prev => [pw, ...prev].slice(0, 5));
  }, [opts]);

  useEffect(() => { generate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const charset = buildCharset(opts);
  const entropy = password ? calcEntropy(password, charset.length) : 0;
  const crackInfo = entropyToTime(entropy);

  const handleCopy = (pw: string) => {
    navigator.clipboard.writeText(pw).catch(() => {});
    setCopied(pw);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggle = (key: keyof Options) => {
    setOpts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const strengthBar = (
    <div style={{ display: 'flex', gap: '3px', marginTop: '0.5rem' }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          style={{
            flex: 1, height: '6px', borderRadius: '3px',
            background: i <= crackInfo.level ? crackInfo.color : 'var(--border)',
            transition: 'background 0.3s',
          }}
        />
      ))}
    </div>
  );

  const checkboxStyle: React.CSSProperties = {
    width: '1rem', height: '1rem', accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0,
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer',
    fontSize: '0.9rem', color: 'var(--text-primary)',
  };

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('description')}</p>
      </header>

      {/* Privacy badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, color: '#14532d' }}>
          🔒 {t('privacy_badge')}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>

        {/* ── Left: Options ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              {t('options_title')}
            </h2>

            {/* Length slider */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('length_label')}</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>{opts.length}</span>
              </div>
              <input
                type="range" min={8} max={64} value={opts.length}
                onChange={e => setOpts(p => ({ ...p, length: +e.target.value }))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span>8</span><span>64</span>
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <label style={labelStyle}>
                <input type="checkbox" style={checkboxStyle} checked={opts.upper} onChange={() => toggle('upper')} />
                {t('use_upper')} <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>A–Z</span>
              </label>
              <label style={labelStyle}>
                <input type="checkbox" style={checkboxStyle} checked={opts.lower} onChange={() => toggle('lower')} />
                {t('use_lower')} <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>a–z</span>
              </label>
              <label style={labelStyle}>
                <input type="checkbox" style={checkboxStyle} checked={opts.digits} onChange={() => toggle('digits')} />
                {t('use_digits')} <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>0–9</span>
              </label>
              <label style={labelStyle}>
                <input type="checkbox" style={checkboxStyle} checked={opts.symbols} onChange={() => toggle('symbols')} />
                {t('use_symbols')} <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>!@#…</span>
              </label>
              <label style={labelStyle}>
                <input type="checkbox" style={checkboxStyle} checked={opts.excludeAmbiguous} onChange={() => toggle('excludeAmbiguous')} />
                {t('exclude_ambiguous')} <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>0O1Il</span>
              </label>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            style={{
              width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 700,
              backgroundColor: 'var(--primary)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
          >
            🔄 {t('generate_btn')}
          </button>
        </div>

        {/* ── Right: Result ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Password display */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              {t('result_label')}
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 600,
                letterSpacing: '0.05em', wordBreak: 'break-all', lineHeight: 1.6,
                padding: '1rem 4rem 1rem 1rem',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                minHeight: '3.5rem',
              }}>
                {password}
              </div>
              <button
                onClick={() => handleCopy(password)}
                style={{
                  position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
                  padding: '0.35rem 0.7rem', fontSize: '0.78rem', fontWeight: 600,
                  border: `1px solid ${copied === password ? '#10b981' : 'var(--border)'}`,
                  background: copied === password ? '#ecfdf5' : 'var(--surface)',
                  color: copied === password ? '#065f46' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                }}
              >
                {copied === password ? '✓' : '📋'}
              </button>
            </div>
            {strengthBar}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ color: crackInfo.color, fontWeight: 600 }}>{STRENGTH_LABELS[crackInfo.level]}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{entropy.toFixed(0)} bits</span>
            </div>
          </div>

          {/* Crack time card */}
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
              🔓 {t('crack_time_label')}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: crackInfo.color, lineHeight: 1.3 }}>
              {crackInfo.label}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {t('crack_assumption')}
            </div>
          </div>

          {/* History */}
          {history.length > 1 && (
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                {t('history_title')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {history.slice(1).map((pw, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                      {pw}
                    </span>
                    <button
                      onClick={() => handleCopy(pw)}
                      style={{ flexShrink: 0, padding: '0.2rem 0.5rem', fontSize: '0.72rem', border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      {copied === pw ? '✓' : '📋'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <SeoSection
        ko={{
          title: "비밀번호 생성기 & 해킹 소요 시간이란 무엇인가요?",
          description: "이 강력한 비밀번호 생성기는 암호학적으로 안전한 난수(crypto.getRandomValues)를 이용해 예측 불가능한 무작위 비밀번호를 즉시 만들어줍니다. 단순히 비밀번호를 생성하는 것을 넘어, 생성된 비밀번호의 엔트로피(정보 이론적 복잡도)를 계산해 초당 1조 회 시도하는 최신 GPU 해킹 클러스터 기준으로 해독에 걸리는 예상 시간을 직관적으로 보여줍니다. 모든 처리는 브라우저에서만 이루어지므로 생성된 비밀번호는 서버에 저장되지 않습니다.",
          useCases: [
            { icon: '🏦', title: '금융 & 주요 계정 비밀번호', desc: '인터넷 뱅킹, 증권사, 거래소 등 금융 계정의 비밀번호는 최소 16자 이상, 대소문자+숫자+특수문자를 모두 포함한 강력한 비밀번호로 설정하세요.' },
            { icon: '🔐', title: '패스워드 매니저 마스터 키', desc: '1Password, Bitwarden 등 패스워드 매니저의 마스터 비밀번호는 최장 64자까지 생성해 최고 수준의 보안을 확보합니다.' },
            { icon: '🖥️', title: '서버 & API 시크릿 키', desc: '클라우드 서버 SSH 비밀번호, API 시크릿 키 등 시스템 보안에 필요한 무작위 문자열을 즉시 생성합니다.' },
            { icon: '👥', title: '임시 비밀번호 발급', desc: '신규 직원이나 시스템 계정에 임시 비밀번호를 빠르게 생성해 전달하고 첫 로그인 후 변경하도록 안내합니다.' },
          ],
          steps: [
            { step: '옵션 설정', desc: '비밀번호 길이(8~64자), 대문자/소문자/숫자/특수문자 포함 여부, 혼동 문자(0, O, I, l) 제외 여부를 설정합니다.' },
            { step: '생성 버튼 클릭', desc: "'새 비밀번호 생성' 버튼을 클릭하면 즉시 새 비밀번호가 생성됩니다. 마음에 들 때까지 몇 번이든 클릭해 다시 생성할 수 있습니다." },
            { step: '해킹 시간 확인 후 복사', desc: '생성된 비밀번호의 강도(Very Weak~Very Strong)와 해킹 예상 시간을 확인하고, 복사 버튼으로 클립보드에 저장합니다.' },
          ],
          faqs: [
            { q: '얼마나 긴 비밀번호가 안전한가요?', a: '대소문자+숫자+특수문자 조합 기준으로 12자는 수천 년, 16자는 수조 년 이상이 걸립니다. 현실적으로 최소 12자 이상, 중요 계정은 16~20자를 권장합니다. 길이가 1자 늘 때마다 해킹 시간은 기하급수적으로 증가합니다.' },
            { q: '생성된 비밀번호가 서버에 저장되나요?', a: '절대 그렇지 않습니다. 비밀번호 생성은 브라우저의 crypto.getRandomValues API를 사용하며, 서버와의 통신이 전혀 없습니다. 생성된 비밀번호는 서버 어디에도 남지 않습니다.' },
            { q: '같은 옵션으로 생성하면 같은 비밀번호가 나오나요?', a: '아니요. crypto.getRandomValues는 매번 다른 암호학적 난수를 사용하므로 같은 설정으로도 매번 완전히 다른 비밀번호가 생성됩니다. 패턴을 예측하는 것이 불가능합니다.' },
          ],
        }}
        en={{
          title: "What is a Password Generator & Crack Time Estimator?",
          description: "This password generator uses cryptographically secure random numbers (crypto.getRandomValues) to create unpredictable, high-entropy passwords instantly. Beyond generating passwords, it calculates the information-theoretic entropy and visualizes the estimated time to crack the password using a modern GPU cluster capable of 1 trillion guesses per second. All processing happens locally in your browser — generated passwords are never sent to any server.",
          useCases: [
            { icon: '🏦', title: 'Financial & Critical Account Passwords', desc: 'Generate 16+ character passwords with mixed uppercase, lowercase, digits, and symbols for banking, brokerage, and exchange accounts.' },
            { icon: '🔐', title: 'Password Manager Master Key', desc: 'Create a master password up to 64 characters long for your password manager (1Password, Bitwarden) with maximum security.' },
            { icon: '🖥️', title: 'Server & API Secret Keys', desc: 'Instantly generate random strings for cloud server SSH passwords, API secret keys, and system credentials.' },
            { icon: '👥', title: 'Temporary Password Issuance', desc: 'Quickly generate a temporary password for new employees or system accounts for first-login use.' },
          ],
          steps: [
            { step: 'Configure options', desc: 'Set password length (8–64), and toggle uppercase, lowercase, digits, symbols, and ambiguous character exclusion.' },
            { step: 'Generate password', desc: "Click 'Generate New Password' to instantly create a new password. Click as many times as needed until satisfied." },
            { step: 'Check crack time & copy', desc: 'Review the strength rating (Very Weak to Very Strong) and estimated crack time, then click copy to save to clipboard.' },
          ],
          faqs: [
            { q: 'How long should my password be?', a: 'With mixed uppercase, lowercase, digits, and symbols: 12 characters buys thousands of years; 16 characters buys trillions. A minimum of 12 characters is recommended; 16–20 for sensitive accounts. Each extra character multiplies crack time exponentially.' },
            { q: 'Is the generated password stored anywhere?', a: "No. Password generation uses the browser's crypto.getRandomValues API with zero server communication. Nothing is stored anywhere." },
            { q: 'Can the same settings produce the same password twice?', a: 'No. crypto.getRandomValues produces a different cryptographic random number each time, making the output completely unpredictable.' },
          ],
        }}
      />
    </div>
  );
}
