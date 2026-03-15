'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useMemo } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';

/* ─── Charset ─── */
const CHARS = {
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:   'abcdefghijklmnopqrstuvwxyz',
  digits:  '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
  ambiguous: /[0O1lI]/g,
};

/* ─── Strength engine ─── */
function calcStrength(pw: string) {
  if (!pw) return { score: 0, label: '', color: '', crackTime: '' };

  let poolSize = 0;
  if (/[a-z]/.test(pw)) poolSize += 26;
  if (/[A-Z]/.test(pw)) poolSize += 26;
  if (/[0-9]/.test(pw)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) poolSize += 32;

  const entropy = pw.length * Math.log2(poolSize || 1);

  // bonus for variety
  let bonus = 0;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) bonus += 5;
  if (/[0-9]/.test(pw)) bonus += 5;
  if (/[^a-zA-Z0-9]/.test(pw)) bonus += 10;

  const effectiveEntropy = entropy + bonus;

  // Crack time at 1 trillion guesses/sec (1e12)
  const seconds = Math.pow(2, effectiveEntropy) / 1e12;
  const crackTime = formatSeconds(seconds);

  let score: 0 | 1 | 2 | 3 | 4;
  if (effectiveEntropy < 28)      score = 0;
  else if (effectiveEntropy < 40) score = 1;
  else if (effectiveEntropy < 60) score = 2;
  else if (effectiveEntropy < 80) score = 3;
  else                             score = 4;

  const labels = ['매우 취약', '취약', '보통', '강함', '매우 강함'];
  const labelsEn = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

  return { score, label: labels[score], labelEn: labelsEn[score], color: colors[score], crackTime, entropy: Math.round(effectiveEntropy) };
}

function formatSeconds(s: number): string {
  if (s < 1)           return '즉시 (< 1초)';
  if (s < 60)          return `${Math.round(s)}초`;
  if (s < 3600)        return `${Math.round(s / 60)}분`;
  if (s < 86400)       return `${Math.round(s / 3600)}시간`;
  if (s < 2592000)     return `${Math.round(s / 86400)}일`;
  if (s < 31536000)    return `${Math.round(s / 2592000)}개월`;
  if (s < 1e10)        return `${Math.round(s / 31536000).toLocaleString()}년`;
  if (s < 1e15)        return `${(s / 31536000).toExponential(1)}년`;
  return '수백만 년 이상 (사실상 불가능)';
}

function generatePassword(length: number, opts: {
  upper: boolean; lower: boolean; digits: boolean; symbols: boolean; noAmbiguous: boolean;
}) {
  let pool = '';
  if (opts.upper)   pool += opts.noAmbiguous ? CHARS.upper.replace(CHARS.ambiguous, '') : CHARS.upper;
  if (opts.lower)   pool += opts.noAmbiguous ? CHARS.lower.replace(CHARS.ambiguous, '') : CHARS.lower;
  if (opts.digits)  pool += opts.noAmbiguous ? CHARS.digits.replace(CHARS.ambiguous, '') : CHARS.digits;
  if (opts.symbols) pool += CHARS.symbols;
  if (!pool) pool = CHARS.lower;

  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(v => pool[v % pool.length]).join('');
}

/* ─── UI helpers ─── */
function StrengthBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: '4px', marginTop: '0.5rem' }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{
          flex: 1, height: '6px', borderRadius: '3px',
          background: i <= score ? color : 'var(--border)',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}

function CheckOption({ label, note, checked, onChange }: {
  label: string; note?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', padding: '0.4rem 0' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
      <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{label}</span>
      {note && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{note}</span>}
    </label>
  );
}

export default function DevPasswordPage() {
  const t = useTranslations('DevPassword');

  // Analyze mode
  const [analyzeMode, setAnalyzeMode] = useState<'generate' | 'analyze'>('generate');
  const [analysisInput, setAnalysisInput] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Generator options
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: true, noAmbiguous: false });
  const [generated, setGenerated] = useState('');
  const [copiedGen, setCopiedGen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const generate = useCallback(() => {
    const pw = generatePassword(length, opts);
    setGenerated(pw);
    setHistory(h => [pw, ...h].slice(0, 5));
  }, [length, opts]);

  const copyGen = useCallback(() => {
    if (!generated) return;
    navigator.clipboard.writeText(generated).then(() => { setCopiedGen(true); setTimeout(() => setCopiedGen(false), 1500); });
  }, [generated]);

  const analyzeTarget = analyzeMode === 'analyze' ? analysisInput : generated;
  const strength = useMemo(() => calcStrength(analyzeTarget), [analyzeTarget]);

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('description')}</p>
      </header>

      {/* Privacy badge */}
      <div style={{ maxWidth: '640px', margin: '0 auto 1.25rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1rem', borderRadius: 'var(--radius-full)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
          🔒 {t('badge')}
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Mode tabs */}
        <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
          {(['generate', 'analyze'] as const).map(m => (
            <button key={m} onClick={() => setAnalyzeMode(m)} style={{
              flex: 1, padding: '0.6rem', borderRadius: 'calc(var(--radius-md) - 2px)', border: 'none',
              background: analyzeMode === m ? 'var(--primary)' : 'transparent',
              color: analyzeMode === m ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {m === 'generate' ? `🎲 ${t('mode.generate')}` : `🔍 ${t('mode.analyze')}`}
            </button>
          ))}
        </div>

        {/* Generator */}
        {analyzeMode === 'generate' && (
          <div className="glass-panel" style={{ padding: '1.25rem' }}>

            {/* Generated output */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <div style={{
                padding: '1rem 3.5rem 1rem 1rem', minHeight: '56px',
                fontFamily: codeFont, fontSize: '1.15rem', fontWeight: 600,
                letterSpacing: '0.05em', color: generated ? 'var(--text-primary)' : 'var(--text-muted)',
                border: '2px solid var(--border)', borderRadius: 'var(--radius-md)',
                background: 'var(--surface)', wordBreak: 'break-all', lineHeight: 1.5,
              }}>
                {generated || t('placeholder.generated')}
              </div>
              {generated && (
                <button onClick={copyGen} style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  padding: '0.35rem 0.65rem', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', background: copiedGen ? 'var(--primary)' : 'var(--surface-hover)',
                  color: copiedGen ? '#fff' : 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                }}>
                  {copiedGen ? '✓' : '📋'}
                </button>
              )}
            </div>

            <button onClick={generate} style={{
              width: '100%', padding: '0.8rem', marginBottom: '1.25rem',
              borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--primary)', color: '#fff',
              fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'opacity 0.15s',
            }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              🎲 {t('btn.generate')}
            </button>

            {/* Length slider */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={labelStyle}>{t('label.length')}</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>{length}</span>
              </div>
              <input type="range" min={8} max={64} value={length} onChange={e => setLength(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>8</span><span>64</span>
              </div>
            </div>

            {/* Options */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <CheckOption label={t('opt.upper')} checked={opts.upper} onChange={v => setOpts(o => ({ ...o, upper: v }))} />
              <CheckOption label={t('opt.lower')} checked={opts.lower} onChange={v => setOpts(o => ({ ...o, lower: v }))} />
              <CheckOption label={t('opt.digits')} checked={opts.digits} onChange={v => setOpts(o => ({ ...o, digits: v }))} />
              <CheckOption label={t('opt.symbols')} checked={opts.symbols} onChange={v => setOpts(o => ({ ...o, symbols: v }))} />
              <CheckOption label={t('opt.noAmbiguous')} note="(0, O, 1, l, I)" checked={opts.noAmbiguous} onChange={v => setOpts(o => ({ ...o, noAmbiguous: v }))} />
            </div>

            {/* History */}
            {history.length > 1 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ ...labelStyle, display: 'block', marginBottom: '0.5rem' }}>{t('label.history')}</span>
                {history.slice(1).map((pw, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: '1px solid var(--border)', gap: '0.5rem' }}>
                    <code style={{ fontFamily: codeFont, fontSize: '0.78rem', color: 'var(--text-secondary)', wordBreak: 'break-all', flex: 1 }}>{pw}</code>
                    <button onClick={() => navigator.clipboard.writeText(pw)} style={{ padding: '0.2rem 0.4rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-hover)', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer', flexShrink: 0 }}>📋</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analyze mode */}
        {analyzeMode === 'analyze' && (
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <label style={{ ...labelStyle, display: 'block', marginBottom: '0.4rem' }}>{t('label.check')}</label>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type={showAnalysis ? 'text' : 'password'}
                value={analysisInput}
                onChange={e => setAnalysisInput(e.target.value)}
                placeholder={t('placeholder.check')}
                style={{ width: '100%', padding: '0.85rem 3rem 0.85rem 1rem', fontFamily: codeFont, fontSize: '1rem', fontWeight: 600, border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', letterSpacing: '0.05em' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button onClick={() => setShowAnalysis(v => !v)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                {showAnalysis ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        )}

        {/* Strength panel — shown for both modes when there's a value */}
        {analyzeTarget && (
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={labelStyle}>{t('label.strength')}</span>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: strength.color }}>
                {strength.label}
              </span>
            </div>
            <StrengthBar score={strength.score} color={strength.color} />

            <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-hover)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('result.length')}</div>
                <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)' }}>{analyzeTarget.length}</div>
              </div>
              <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-hover)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('result.entropy')}</div>
                <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)' }}>{strength.entropy} <span style={{ fontSize: '0.75rem' }}>bits</span></div>
              </div>
            </div>

            <div style={{ marginTop: '0.75rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: strength.score >= 3 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${strength.score >= 3 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{t('result.crackTime')}</div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: strength.color, lineHeight: 1.3 }}>
                {strength.crackTime}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                * 1조 회/초 (최신 GPU 클러스터 기준)
              </div>
            </div>

            {/* Checklist */}
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {[
                { ok: analyzeTarget.length >= 12, label: t('check.length12') },
                { ok: /[A-Z]/.test(analyzeTarget), label: t('check.upper') },
                { ok: /[a-z]/.test(analyzeTarget), label: t('check.lower') },
                { ok: /[0-9]/.test(analyzeTarget), label: t('check.digit') },
                { ok: /[^a-zA-Z0-9]/.test(analyzeTarget), label: t('check.symbol') },
              ].map(({ ok, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                  <span style={{ color: ok ? '#10b981' : '#94a3b8', fontSize: '1rem' }}>{ok ? '✓' : '○'}</span>
                  <span style={{ color: ok ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ad */}
      <div style={{ maxWidth: '640px', margin: '1.5rem auto 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '300px', height: '250px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📢</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>광고 영역</span>
          <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>300 × 250</span>
        </div>
      </div>

      <RelatedTools toolId="dev/password" />

      <SeoSection
        ko={{
          title: '비밀번호 강도 측정 & 생성기란 무엇인가요?',
          description: '강력한 비밀번호는 계정 보안의 첫 번째 방어선입니다. 이 도구는 암호화학적으로 안전한 난수(crypto.getRandomValues)를 사용해 추측이 불가능한 비밀번호를 생성하며, 입력한 비밀번호의 보안 강도를 비트(bit) 단위 엔트로피로 정확하게 측정합니다. 모든 처리는 브라우저 내에서만 이루어지며 서버로 데이터가 전송되지 않아 완벽하게 프라이버시가 보호됩니다. 길이, 대소문자, 숫자, 특수문자 포함 여부를 조합해 상황에 맞는 최적의 비밀번호를 생성하세요.',
          useCases: [
            { icon: '🔐', title: '신규 계정 비밀번호 생성', desc: '웹사이트 가입 시 대소문자·숫자·특수문자가 혼합된 강력한 비밀번호를 즉시 생성합니다.' },
            { icon: '🏦', title: '금융 계정 보안 강화', desc: '뱅킹, 증권 계정용 16자 이상의 고강도 비밀번호를 생성해 금융 사기를 예방합니다.' },
            { icon: '🔍', title: '기존 비밀번호 보안 점검', desc: '분석 모드에서 현재 사용 중인 비밀번호의 강도와 해킹 소요 예상 시간을 확인합니다.' },
            { icon: '🏢', title: '기업 IT 보안 정책 준수', desc: '12자 이상, 대소문자·숫자·특수문자 포함 등 기업 비밀번호 정책에 맞는 비밀번호를 생성합니다.' },
          ],
          steps: [
            { step: '생성 또는 분석 모드 선택', desc: '새 비밀번호 생성(Generate) 또는 기존 비밀번호 강도 분석(Analyze) 모드를 선택합니다.' },
            { step: '옵션 설정 및 생성', desc: '길이(8~64자), 대소문자·숫자·특수문자 포함 여부를 설정하고 생성 버튼을 클릭합니다.' },
            { step: '강도 확인 및 복사', desc: '강도 측정 결과, 엔트로피, 해킹 소요 시간을 확인하고 복사 버튼으로 클립보드에 저장합니다.' },
          ],
          faqs: [
            { q: '엔트로피(Entropy)가 높을수록 좋은 비밀번호인가요?', a: '네. 엔트로피는 비밀번호 예측 불가능성을 비트로 나타냅니다. 일반적으로 72비트 이상이면 현대 컴퓨터로 사실상 해킹이 불가능한 수준입니다.' },
            { q: '비밀번호가 서버로 전송되지 않나요?', a: '이 도구의 모든 처리(생성, 분석, 강도 측정)는 100% 브라우저(JavaScript)에서 실행됩니다. 네트워크 요청이 발생하지 않으며 개인 데이터가 외부로 전송되지 않습니다.' },
            { q: '생성된 비밀번호는 얼마나 안전한가요?', a: 'Web Crypto API의 crypto.getRandomValues()를 사용해 암호학적으로 안전한 난수를 생성합니다. Math.random() 기반 생성기보다 훨씬 예측이 어렵습니다.' },
          ],
        }}
        en={{
          title: 'What is a Password Strength Checker & Generator?',
          description: 'A strong password is your first line of defense for account security. This tool generates unguessable passwords using the cryptographically secure Web Crypto API (crypto.getRandomValues), and accurately measures the strength of any password using bit-level entropy. All processing happens entirely in your browser — no data is sent to any server — ensuring complete privacy. Customize length (8–64 chars), character sets (uppercase, lowercase, digits, symbols), and ambiguous character exclusion to create the right password for every situation.',
          useCases: [
            { icon: '🔐', title: 'Account Sign-up', desc: 'Generate a strong mixed-character password instantly when creating new accounts.' },
            { icon: '🏦', title: 'Financial Account Security', desc: 'Create 16+ character high-entropy passwords for banking and investment accounts to prevent fraud.' },
            { icon: '🔍', title: 'Password Audit', desc: 'Check the strength and estimated crack time of your existing passwords in Analyze mode.' },
            { icon: '🏢', title: 'Enterprise Policy Compliance', desc: 'Generate passwords meeting corporate security policies: 12+ chars, mixed case, numbers, symbols.' },
          ],
          steps: [
            { step: 'Select Mode', desc: 'Choose Generate for a new password, or Analyze to check the strength of an existing one.' },
            { step: 'Configure & Generate', desc: 'Set length (8–64), toggle character types, and click Generate to create an instant password.' },
            { step: 'Check Strength & Copy', desc: 'View strength score, entropy, and estimated crack time, then copy to clipboard with one click.' },
          ],
          faqs: [
            { q: 'Does higher entropy always mean a better password?', a: 'Yes. Entropy measures unpredictability in bits. Generally, 72+ bits of entropy is considered practically uncrackable by modern hardware.' },
            { q: 'Is my password sent to your server?', a: 'No. All generation and analysis runs 100% in your browser (JavaScript). No network request is made and no personal data leaves your device.' },
            { q: 'How secure is the password generator?', a: 'It uses the Web Crypto API\'s crypto.getRandomValues(), which is cryptographically secure and far less predictable than Math.random()-based generators.' },
          ],
        }}
      />
    </div>
  );
}

const codeFont = '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace';
const labelStyle: React.CSSProperties = {
  fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.07em',
};
