'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { ui } from '@/app/components/ui';

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
        style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)', cursor: 'pointer' }} />
      <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{label}</span>
      {note && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{note}</span>}
    </label>
  );
}

export default function PasswordStrengthClient({ seo }: { seo?: React.ReactNode }) {
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
      <ToolHeader icon={<ShieldCheck />} title={t('title')} subtitle={t('description')}>
        {/* Privacy badge */}
        <div className={`${ui.badge} ${ui.green}`}>
          🔒 {t('badge')}
        </div>
      </ToolHeader>

      <div style={{ maxWidth: 'var(--tool-width-narrow)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Mode tabs */}
        <div className={ui.segmented}>
          {(['generate', 'analyze'] as const).map(m => (
            <button key={m} onClick={() => setAnalyzeMode(m)} className={`${ui.segment} ${analyzeMode === m ? ui.segmentActive : ''}`}>
              {m === 'generate' ? `🎲 ${t('mode.generate')}` : `🔍 ${t('mode.analyze')}`}
            </button>
          ))}
        </div>

        {/* Generator */}
        {analyzeMode === 'generate' && (
          <div className={ui.card}>

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
                  borderRadius: 'var(--radius-sm)', background: copiedGen ? 'var(--primary-fill)' : 'var(--surface-hover)',
                  color: copiedGen ? '#fff' : 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                }}>
                  {copiedGen ? '✓' : '📋'}
                </button>
              )}
            </div>

            <button onClick={generate} className={`${ui.button} ${ui.primary} ${ui.lg} ${ui.block}`} style={{ marginBottom: '1.25rem' }}>
              🎲 {t('btn.generate')}
            </button>

            {/* Length slider */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span className={ui.label}>{t('label.length')}</span>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>{length}</span>
              </div>
              <input type="range" min={8} max={64} value={length} onChange={e => setLength(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
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
                <span className={ui.label} style={{ display: 'block', marginBottom: '0.5rem' }}>{t('label.history')}</span>
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
          <div className={ui.card}>
            <label className={ui.label} style={{ display: 'block', marginBottom: '0.4rem' }}>{t('label.check')}</label>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type={showAnalysis ? 'text' : 'password'}
                value={analysisInput}
                onChange={e => setAnalysisInput(e.target.value)}
                placeholder={t('placeholder.check')}
                className={`${ui.input} ${ui.inputLg}`}
                style={{ paddingRight: '3rem', fontFamily: codeFont, letterSpacing: '0.05em' }}
              />
              <button onClick={() => setShowAnalysis(v => !v)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                {showAnalysis ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        )}

        {/* Strength panel — shown for both modes when there's a value */}
        {analyzeTarget && (
          <div className={ui.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span className={ui.label}>{t('label.strength')}</span>
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

            <div className={`${ui.notice} ${strength.score >= 3 ? ui.green : ui.red}`} style={{ marginTop: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{t('result.crackTime')}</div>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: strength.color, lineHeight: 1.3 }}>
                  {strength.crackTime}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  * 1조 회/초 (최신 GPU 클러스터 기준)
                </div>
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
                  <span style={{ color: ok ? 'var(--tint-green-fg)' : 'var(--text-muted)', fontSize: '1rem' }}>{ok ? '✓' : '○'}</span>
                  <span style={{ color: ok ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ad */}

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/dev/password-strength" />


      {seo}
    </div>
  );
}

const codeFont = '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace';
