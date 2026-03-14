'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect } from 'react';
import NavigationActions from '@/app/components/NavigationActions';

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
    </div>
  );
}
