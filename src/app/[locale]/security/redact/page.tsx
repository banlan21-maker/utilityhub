'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import NavigationActions from '@/app/components/NavigationActions';

// ── Masking Rules ──────────────────────────────────────────────────────────
interface MaskRule {
  id: string;
  label: string;
  labelEn: string;
  pattern: RegExp;
  replace: (match: string) => string;
  example: string;
}

const RULES: MaskRule[] = [
  {
    id: 'email',
    label: '이메일 주소',
    labelEn: 'Email Address',
    pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    replace: (m) => {
      const [local, domain] = m.split('@');
      const maskedLocal = local[0] + '***';
      const domainParts = domain.split('.');
      const maskedDomain = domainParts[0][0] + '***.' + domainParts.slice(1).join('.');
      return `${maskedLocal}@${maskedDomain}`;
    },
    example: 'hong@example.com → h***@e***.com',
  },
  {
    id: 'phone_kr',
    label: '한국 전화번호',
    labelEn: 'Korean Phone',
    pattern: /(\d{2,3})-(\d{3,4})-(\d{4})/g,
    replace: (m) => m.replace(/(\d{2,3})-(\d{3,4})-(\d{4})/, '$1-****-$3'),
    example: '010-1234-5678 → 010-****-5678',
  },
  {
    id: 'ssn_kr',
    label: '주민등록번호',
    labelEn: 'Korean SSN',
    pattern: /\d{6}-[1-4]\d{6}/g,
    replace: (m) => m.slice(0, 8) + '*******',
    example: '901201-1234567 → 901201-*******',
  },
  {
    id: 'card',
    label: '신용카드 번호',
    labelEn: 'Credit Card',
    pattern: /\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}/g,
    replace: (m) => {
      const digits = m.replace(/[\s\-]/g, '');
      return `****-****-****-${digits.slice(-4)}`;
    },
    example: '1234-5678-9012-3456 → ****-****-****-3456',
  },
  {
    id: 'ip',
    label: 'IP 주소',
    labelEn: 'IP Address',
    pattern: /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g,
    replace: (m) => {
      const parts = m.split('.');
      return `${parts[0]}.${parts[1]}.***.***`;
    },
    example: '192.168.1.1 → 192.168.***.***',
  },
  {
    id: 'name_kr',
    label: '한국 이름 (3글자)',
    labelEn: 'Korean Name',
    pattern: /[가-힣]{2}([가-힣])[가-힣]{0}/g,
    replace: (m) => m[0] + '*' + (m[2] ?? ''),
    example: '홍길동 → 홍*동',
  },
];

function applyMasking(text: string, enabled: Set<string>): { result: string; count: number } {
  let result = text;
  let count = 0;
  for (const rule of RULES) {
    if (!enabled.has(rule.id)) continue;
    result = result.replace(rule.pattern, (match) => {
      count++;
      return rule.replace(match);
    });
  }
  return { result, count };
}

// highlight differences
function buildHighlighted(original: string, masked: string): React.ReactNode[] {
  const origWords = original.split(/(\s+)/);
  const maskedWords = masked.split(/(\s+)/);
  return maskedWords.map((word, i) => {
    const changed = word !== origWords[i];
    return (
      <span key={i} style={changed ? { background: '#fef08a', color: '#78350f', borderRadius: '2px', padding: '0 1px' } : undefined}>
        {word}
      </span>
    );
  });
}

// ── Component ──────────────────────────────────────────────────────────────
export default function RedactPage() {
  const t = useTranslations('Redact');

  const [input, setInput] = useState('안녕하세요. 제 이메일은 hong@example.com이고 전화번호는 010-1234-5678입니다.\n주민번호: 901201-1234567, 카드: 1234-5678-9012-3456');
  const [enabled, setEnabled] = useState<Set<string>>(new Set(RULES.map(r => r.id)));
  const [copied, setCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(true);

  const { result: masked, count } = applyMasking(input, enabled);

  const toggleRule = (id: string) => {
    setEnabled(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(masked).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '1rem', fontSize: '0.9rem', lineHeight: 1.7,
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    background: 'var(--surface)', color: 'var(--text-primary)',
    outline: 'none', resize: 'vertical', fontFamily: 'monospace',
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

        {/* ── Left: Controls ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Rule toggles */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('rules_title')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {RULES.map(rule => (
                <label key={rule.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={enabled.has(rule.id)}
                    onChange={() => toggleRule(rule.id)}
                    style={{ width: '1rem', height: '1rem', marginTop: '0.15rem', cursor: 'pointer', accentColor: 'var(--primary)', flexShrink: 0 }}
                  />
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{rule.label}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', fontFamily: 'monospace', marginTop: '0.1rem' }}>{rule.example}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: count > 0 ? '#10b981' : 'var(--text-secondary)' }}>{count}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{t('masked_count')}</div>
          </div>
        </div>

        {/* ── Right: Text areas ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Input */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              {t('input_label')}
            </label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={7}
              placeholder={t('placeholder')}
              style={inp}
            />
          </div>

          {/* Output */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {t('output_label')}
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showDiff} onChange={e => setShowDiff(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                  {t('highlight')}
                </label>
                <button onClick={handleCopy}
                  style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem', fontWeight: 600, border: `1px solid ${copied ? '#10b981' : 'var(--border)'}`, background: copied ? '#ecfdf5' : 'var(--surface)', color: copied ? '#065f46' : 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                  {copied ? '✓ 복사됨' : '📋 복사'}
                </button>
              </div>
            </div>
            {showDiff ? (
              <div style={{ ...inp, minHeight: '10rem', whiteSpace: 'pre-wrap', overflow: 'auto' } as React.CSSProperties}>
                {buildHighlighted(input, masked)}
              </div>
            ) : (
              <textarea readOnly value={masked} rows={7} style={{ ...inp, background: '#f0fdf4' }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
