'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState, useCallback, useEffect } from 'react';
import { Key } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './password-generator.module.css';
import { ui } from '@/app/components/ui';

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

function entropyToTime(bits: number, isKo: boolean): { label: string; color: string; level: number } {
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

  // 영문 페이지용 단위 표기 (복수형 처리)
  const en = (n: number, one: string, many = `${one}s`) => `~${n} ${n === 1 ? one : many}`;

  if (seconds < 1) { label = isKo ? '즉시 해킹 가능' : 'Instantly'; level = 0; }
  else if (seconds < minute) { label = isKo ? `약 ${Math.round(seconds)}초` : en(Math.round(seconds), 'second'); level = 0; }
  else if (seconds < hour) { label = isKo ? `약 ${Math.round(seconds / minute)}분` : en(Math.round(seconds / minute), 'minute'); level = 1; }
  else if (seconds < day) { label = isKo ? `약 ${Math.round(seconds / hour)}시간` : en(Math.round(seconds / hour), 'hour'); level = 1; }
  else if (seconds < year) { label = isKo ? `약 ${Math.round(seconds / day)}일` : en(Math.round(seconds / day), 'day'); level = 2; }
  else if (seconds < century) { label = isKo ? `약 ${Math.round(seconds / year)}년` : en(Math.round(seconds / year), 'year'); level = 2; }
  else if (seconds < million_years) { label = isKo ? `약 ${Math.round(seconds / century)}세기` : en(Math.round(seconds / century), 'century', 'centuries'); level = 3; }
  else if (seconds < billion_years) { label = isKo ? `약 ${(seconds / million_years).toFixed(1)}백만 년` : `~${(seconds / million_years).toFixed(1)} million years`; level = 3; }
  else { label = isKo ? `약 ${(seconds / billion_years).toFixed(1)}십억 년 이상` : `${(seconds / billion_years).toFixed(1)}+ billion years`; level = 4; }

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
export default function PasswordGeneratorClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('PasswordGen');
  const isKo = useLocale() === 'ko';

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
  const crackInfo = entropyToTime(entropy, isKo);

  const handleCopy = (pw: string) => {
    navigator.clipboard.writeText(pw).catch(() => {});
    setCopied(pw);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggle = (key: keyof Options) => {
    setOpts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const strengthBar = (
    <div className={s.meter}>
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className={s.meterSeg}
          style={{ background: i <= crackInfo.level ? crackInfo.color : 'var(--border)' }}
        />
      ))}
    </div>
  );

  const charOption = (key: keyof Options, label: string, sample: string) => (
    <label className={s.check}>
      <input type="checkbox" checked={opts[key] as boolean} onChange={() => toggle(key)} />
      {label} <span className={s.sample}>{sample}</span>
    </label>
  );

  return (
    <div>
      <NavigationActions />
      <ToolHeader icon={<Key />} title={t('title')} subtitle={t('description')}>
        {/* Privacy badge */}
        <div className={`${ui.badge} ${ui.green}`}>
          🔒 {t('privacy_badge')}
        </div>
      </ToolHeader>

      <div className={s.layout}>

        {/* ── Left: Options ── */}
        <div className={s.col}>
          <div className={ui.card}>
            <h2 className={ui.cardTitle}>
              {t('options_title')}
            </h2>

            {/* Length slider */}
            <div className={s.lengthBlock}>
              <div className={s.lengthHead}>
                <span className={ui.label}>{t('length_label')}</span>
                <span className={s.lengthValue}>{opts.length}</span>
              </div>
              <input
                type="range" min={8} max={64} value={opts.length}
                onChange={e => setOpts(p => ({ ...p, length: +e.target.value }))}
                className={s.range}
              />
              <div className={s.rangeEnds}>
                <span>8</span><span>64</span>
              </div>
            </div>

            {/* Checkboxes */}
            <div className={s.checks}>
              {charOption('upper', t('use_upper'), 'A–Z')}
              {charOption('lower', t('use_lower'), 'a–z')}
              {charOption('digits', t('use_digits'), '0–9')}
              {charOption('symbols', t('use_symbols'), '!@#…')}
              {charOption('excludeAmbiguous', t('exclude_ambiguous'), '0O1Il')}
            </div>
          </div>

          {/* Generate button */}
          <button onClick={generate} className={`${ui.button} ${ui.primary} ${ui.block} ${ui.lg}`}>
            🔄 {t('generate_btn')}
          </button>
        </div>

        {/* ── Right: Result ── */}
        <div className={s.col}>

          {/* Password display */}
          <div className={ui.card}>
            <label className={`${ui.label} ${s.blockLabel}`}>
              {t('result_label')}
            </label>
            <div className={s.pwWrap}>
              <div className={s.pwBox}>
                {password}
              </div>
              <button
                onClick={() => handleCopy(password)}
                className={`${s.copyBtn} ${copied === password ? s.copied : ''}`}
              >
                {copied === password ? '✓' : '📋'}
              </button>
            </div>
            {strengthBar}
            <div className={s.strengthRow}>
              <span style={{ color: crackInfo.color, fontWeight: 600 }}>{(isKo ? STRENGTH_LABELS : STRENGTH_EN)[crackInfo.level]}</span>
              <span className={s.muted}>{entropy.toFixed(0)} bits</span>
            </div>
          </div>

          {/* Crack time card */}
          <div className={`${ui.card} ${s.center}`}>
            <div className={`${ui.label} ${s.blockLabel}`}>
              🔓 {t('crack_time_label')}
            </div>
            <div className={s.crackValue} style={{ color: crackInfo.color }}>
              {crackInfo.label}
            </div>
            <div className={`${ui.hint} ${s.crackNote}`}>
              {t('crack_assumption')}
            </div>
          </div>

          {/* History */}
          {history.length > 1 && (
            <div className={ui.card}>
              <h3 className={`${ui.label} ${s.blockLabel}`}>
                {t('history_title')}
              </h3>
              <div className={s.history}>
                {history.slice(1).map((pw, i) => (
                  <div key={i} className={s.histRow}>
                    <span className={s.histPw}>
                      {pw}
                    </span>
                    <button
                      onClick={() => handleCopy(pw)}
                      className={`${ui.button} ${ui.secondary} ${ui.sm}`}
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

      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/security/password-generator" />


      {seo}
    </div>
  );
}
