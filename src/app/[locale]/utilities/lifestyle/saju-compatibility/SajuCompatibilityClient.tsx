'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Heart, Camera, Link2, HeartHandshake } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './saju-compatibility.module.css';
import { ui } from '@/app/components/ui';

/* ─── Types ───────────────────────────────────────────────── */

interface InviterData {
  initial: string;
  gender: 'M' | 'F';
  year: number;
  month: number;
  day: number;
  hour: number | null;
}

interface SajuResult {
  dayGan: string;
  dayZhi: string;
  dayGanWuXing: string;
}

interface CompatResult {
  score: number;
  type: string;
  emoji: string;
  descKo: string;
  descEn: string;
  personA: { name: string; saju: SajuResult };
  personB: { name: string; saju: SajuResult };
}

/* ─── Saju Data Tables (Hardcoded) ────────────────────────── */

const 천간오행: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火',
  '戊': '土', '己': '土', '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

const 오행한글: Record<string, string> = {
  '木': '목(木)', '火': '화(火)', '土': '토(土)',
  '金': '금(金)', '水': '수(水)',
};

const 오행영문: Record<string, string> = {
  '木': 'Wood', '火': 'Fire', '土': 'Earth',
  '金': 'Metal', '水': 'Water',
};

const 육합점수: Record<string, number> = {
  '子-丑': 40, '寅-亥': 38, '卯-戌': 36,
  '辰-酉': 36, '巳-申': 34, '午-未': 38,
};

const 삼합점수: Record<string, number> = {
  '寅-午': 32, '午-戌': 32, '寅-戌': 30,
  '申-子': 32, '子-辰': 32, '申-辰': 30,
  '亥-卯': 32, '卯-未': 32, '亥-未': 30,
  '巳-酉': 32, '酉-丑': 32, '巳-丑': 30,
};

const 충점수: Record<string, number> = {
  '子-午': -15, '丑-未': -12, '寅-申': -15,
  '卯-酉': -12, '辰-戌': -15, '巳-亥': -12,
};

const 상생점수: Record<string, number> = {
  '木-火': 40, '火-土': 38, '土-金': 38,
  '金-水': 40, '水-木': 40,
};

const 비화점수: Record<string, number> = {
  '木-木': 28, '火-火': 28, '土-土': 25,
  '金-金': 28, '水-水': 28,
};

const 상극점수: Record<string, number> = {
  '木-土': -10, '土-水': -10, '水-火': -10,
  '火-金': -10, '金-木': -10,
};

const 결과유형 = [
  {
    min: 90, max: 100,
    type: '소울메이트', emoji: '💫',
    ko: '전생에 부부였나봐요! 두 분의 사주는 천생연분에 가까운 조합입니다. 서로의 기운이 완벽하게 맞닿아 있어, 함께할수록 더 빛나는 관계입니다.',
    en: 'A match made in heaven! Your energies align perfectly — the more time you spend together, the brighter you both shine.',
    typeEn: 'Soulmate',
  },
  {
    min: 75, max: 89,
    type: '불꽃 커플', emoji: '🔥',
    ko: '강하게 끌리는 운명적 만남! 처음 만나는 순간부터 특별한 기운을 느꼈을 거예요. 열정적이고 역동적인 관계가 펼쳐집니다.',
    en: 'An intense, passionate connection that sparks from the very first meeting. A fiery, dynamic relationship awaits.',
    typeEn: 'Flame Couple',
  },
  {
    min: 60, max: 74,
    type: '성장하는 커플', emoji: '🌱',
    ko: '함께 성장하는 동반자 관계입니다. 서로 다른 점이 때로는 자극이 되고 때로는 배움이 됩니다. 시간이 갈수록 깊어지는 인연이에요.',
    en: 'A partnership that grows stronger with time. Differences become stimulation and learning opportunities.',
    typeEn: 'Growing Couple',
  },
  {
    min: 45, max: 59,
    type: '도전적인 커플', emoji: '⚡',
    ko: '서로의 다름이 매력인 스파크 커플! 의견 충돌도 있지만 그만큼 열정도 넘칩니다. 서로를 이해하려는 노력이 관계를 특별하게 만들어요.',
    en: 'A dynamic duo where differences create exciting sparks. Effort to understand each other makes the relationship special.',
    typeEn: 'Challenging Couple',
  },
  {
    min: 0, max: 44,
    type: '노력하는 커플', emoji: '✨',
    ko: '사주상 도전적인 조합이지만, 관계의 완성은 서로의 노력에 달려 있습니다. 오히려 이런 조합에서 가장 아름다운 사랑이 피어나기도 해요.',
    en: 'A challenging match by Saju, but relationships blossom with effort. The most beautiful love often grows from these combinations.',
    typeEn: 'Effort Couple',
  },
];

/* ─── Saju Calculation Functions ──────────────────────────── */

function getSaju(year: number, month: number, day: number): SajuResult {
  // Adapted from lunar-javascript - dynamic import may fail on SSR,
  // so we use a pure-JS fallback based on the Chinese calendar algorithm.
  // The 天干 (Heavenly Stems) and 地支 (Earthly Branches) for the day
  // are calculated from a fixed reference date.

  // Reference: Jan 1, 1900 = 甲子 day (index 0)
  const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // Calculate Julian Day Number
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Reference JDN for 甲子 day: Jan 30, 1900 (a known 甲子 day)
  const refJdn = 2415050; // JDN of Jan 30, 1900
  const dayOffset = ((jdn - refJdn) % 60 + 60) % 60;

  const stemIdx = dayOffset % 10;
  const branchIdx = dayOffset % 12;

  const dayGan = STEMS[stemIdx];
  const dayZhi = BRANCHES[branchIdx];
  const dayGanWuXing = 천간오행[dayGan];

  return { dayGan, dayZhi, dayGanWuXing };
}

function lookupScore(table: Record<string, number>, a: string, b: string): number {
  return table[`${a}-${b}`] ?? table[`${b}-${a}`] ?? 0;
}

function calcCompatibility(personA: SajuResult, personB: SajuResult): number {
  let score = 50;

  // 일지 합/충
  score += lookupScore(육합점수, personA.dayZhi, personB.dayZhi);
  score += lookupScore(삼합점수, personA.dayZhi, personB.dayZhi);
  score += lookupScore(충점수, personA.dayZhi, personB.dayZhi);

  // 일간 오행 상생/상극
  const ganKey = `${personA.dayGanWuXing}-${personB.dayGanWuXing}`;
  score += lookupScore(상생점수, personA.dayGanWuXing, personB.dayGanWuXing);
  score += 비화점수[ganKey] ?? 0;
  score += lookupScore(상극점수, personA.dayGanWuXing, personB.dayGanWuXing);

  return Math.min(100, Math.max(0, score));
}

function getResultType(score: number) {
  return 결과유형.find(r => score >= r.min && score <= r.max) ?? 결과유형[결과유형.length - 1];
}

/* ─── URL Compression (lz-string) ─────────────────────────── */

let LZString: typeof import('lz-string') | null = null;

function getLZString() {
  if (!LZString) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    LZString = require('lz-string');
  }
  return LZString!;
}

function encodeInviterData(data: InviterData): string {
  return getLZString().compressToEncodedURIComponent(JSON.stringify(data));
}

function decodeInviterData(encoded: string): InviterData | null {
  try {
    const json = getLZString().decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as InviterData;
  } catch {
    return null;
  }
}

/* ─── Component ───────────────────────────────────────────── */

const BIRTH_HOURS = [
  { value: 0, label: '子時 (23:00~01:00)' },
  { value: 2, label: '丑時 (01:00~03:00)' },
  { value: 4, label: '寅時 (03:00~05:00)' },
  { value: 6, label: '卯時 (05:00~07:00)' },
  { value: 8, label: '辰時 (07:00~09:00)' },
  { value: 10, label: '巳時 (09:00~11:00)' },
  { value: 12, label: '午時 (11:00~13:00)' },
  { value: 14, label: '未時 (13:00~15:00)' },
  { value: 16, label: '申時 (15:00~17:00)' },
  { value: 18, label: '酉時 (17:00~19:00)' },
  { value: 20, label: '戌時 (19:00~21:00)' },
  { value: 22, label: '亥時 (21:00~23:00)' },
];

const currentYear = new Date().getFullYear();

export default function SajuCompatibilityClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('SajuCompat');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const isKo = locale === 'ko';

  // Inviter data from URL
  const [inviterData, setInviterData] = useState<InviterData | null>(null);
  const isParticipantMode = inviterData !== null;

  // Form state
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | ''>('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState<string>('');
  const [unknownHour, setUnknownHour] = useState(false);

  // UI state
  const [step, setStep] = useState<'form' | 'share' | 'result'>('form');
  const [result, setResult] = useState<CompatResult | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Decode inviter data from URL params
  useEffect(() => {
    const encoded = searchParams.get('i');
    if (encoded) {
      const data = decodeInviterData(encoded);
      if (data) setInviterData(data);
    }
  }, [searchParams]);

  const formValid = name.trim() && gender && year && month && day;

  const handleSubmit = useCallback(() => {
    if (!formValid || !gender) return;

    const personYear = parseInt(year);
    const personMonth = parseInt(month);
    const personDay = parseInt(day);
    const personHour = unknownHour ? null : (hour ? parseInt(hour) : null);

    if (isParticipantMode && inviterData) {
      // Calculate compatibility
      const sajuA = getSaju(inviterData.year, inviterData.month, inviterData.day);
      const sajuB = getSaju(personYear, personMonth, personDay);
      const score = calcCompatibility(sajuA, sajuB);
      const typeInfo = getResultType(score);

      setResult({
        score,
        type: isKo ? typeInfo.type : typeInfo.typeEn,
        emoji: typeInfo.emoji,
        descKo: typeInfo.ko,
        descEn: typeInfo.en,
        personA: { name: inviterData.initial, saju: sajuA },
        personB: { name: name.trim(), saju: sajuB },
      });
      setStep('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Generate share URL
      const data: InviterData = {
        initial: name.trim().slice(0, 10),
        gender: gender,
        year: personYear,
        month: personMonth,
        day: personDay,
        hour: personHour,
      };
      const encoded = encodeInviterData(data);
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const url = `${base}/${locale}/utilities/lifestyle/saju-compatibility?i=${encoded}`;
      setShareUrl(url);
      setStep('share');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [formValid, gender, year, month, day, hour, unknownHour, name, isParticipantMode, inviterData, isKo, locale]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const handleImageSave = useCallback(async () => {
    const el = document.getElementById('saju-result-card');
    if (!el) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: 'var(--tint-pink-bg)',
        useCORS: true,
      });

      // Add watermark
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = '20px sans-serif';
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillText('theutilhub.com', 20, canvas.height - 20);
      }

      const link = document.createElement('a');
      link.download = 'saju-compatibility.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // html2canvas load failure — silent
    }
  }, []);

  const handleRestart = useCallback(() => {
    setStep('form');
    setResult(null);
    setInviterData(null);
    setShareUrl('');
    setName('');
    setGender('');
    setYear('');
    setMonth('');
    setDay('');
    setHour('');
    setUnknownHour(false);
    // Clear URL params
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const shareText = useMemo(() => {
    if (isKo) {
      return `${name.trim() || '누군가'}님이 당신과의 궁합이 궁금하대요 💕`;
    }
    return `Someone wants to check your compatibility 💕`;
  }, [name, isKo]);

  // Share button order by locale
  const shareButtons = useMemo(() => {
    const copyBtn = (
      <button key="copy" className={`${s.shareBtn} ${s.copyBtn}`} onClick={handleCopy} aria-label={isKo ? '링크 복사' : 'Copy link'}>
        <Link2 size={16} /> {isKo ? '링크 복사' : 'Copy Link'}
      </button>
    );
    const whatsappBtn = (
      <a key="wa" className={`${s.shareBtn} ${s.whatsappBtn}`} href={`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
        WhatsApp
      </a>
    );
    const telegramBtn = (
      <a key="tg" className={`${s.shareBtn} ${s.telegramBtn}`} href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
        Telegram
      </a>
    );
    const twitterBtn = (
      <a key="tw" className={`${s.shareBtn} ${s.twitterBtn}`} href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
        X
      </a>
    );
    const kakaoBtn = (
      <button key="kakao" className={`${s.shareBtn} ${s.kakaoBtn}`} onClick={handleCopy} aria-label={isKo ? '카카오톡' : 'KakaoTalk'}>
        카카오톡
      </button>
    );

    if (isKo) return [kakaoBtn, copyBtn, telegramBtn, whatsappBtn, twitterBtn];
    return [copyBtn, whatsappBtn, telegramBtn, twitterBtn];
  }, [isKo, shareUrl, shareText, handleCopy]);

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<Heart />} title={t('title')} subtitle={t('description')} />

      {/* ─── Form Step ─── */}
      {step === 'form' && (
        <section className={`${ui.card} ${s.fin_panel}`}>
          {/* Inviter banner */}
          {isParticipantMode && inviterData && (
            <div className={`${ui.notice} ${ui.red} ${s.inviterBanner}`}>
              <p>
                {isKo
                  ? `${inviterData.initial}님이 당신과의 궁합을 확인하고 싶어해요 💕`
                  : `${inviterData.initial} wants to check your compatibility 💕`}
              </p>
            </div>
          )}

          {/* Name */}
          <div className={ui.field}>
            <label className={ui.label} htmlFor="saju-name">{isKo ? '별명 / 이니셜' : 'Nickname / Initial'}</label>
            <input
              id="saju-name"
              className={ui.input}
              type="text"
              maxLength={20}
              placeholder={isKo ? '예: 김○○, 별명, 이니셜' : 'e.g. Kim, nickname'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className={ui.hint}>{isKo ? '이름 전체를 입력하지 않아도 됩니다.' : 'You don\'t need to enter your full name.'}</p>
          </div>

          {/* Gender */}
          <div className={ui.field}>
            <label className={ui.label}>{isKo ? '성별' : 'Gender'}</label>
            <div className={`${ui.chips} ${s.genderGroup}`}>
              <div className={s.genderOption}>
                <input type="radio" id="gender-m" name="gender" value="M" checked={gender === 'M'} onChange={() => setGender('M')} />
                <label className={`${ui.chip} ${s.genderLabel} ${gender === 'M' ? ui.chipActive : ''}`} htmlFor="gender-m">🙋‍♂️ {isKo ? '남성' : 'Male'}</label>
              </div>
              <div className={s.genderOption}>
                <input type="radio" id="gender-f" name="gender" value="F" checked={gender === 'F'} onChange={() => setGender('F')} />
                <label className={`${ui.chip} ${s.genderLabel} ${gender === 'F' ? ui.chipActive : ''}`} htmlFor="gender-f">🙋‍♀️ {isKo ? '여성' : 'Female'}</label>
              </div>
            </div>
          </div>

          {/* Birth date */}
          <div className={ui.field}>
            <label className={ui.label}>{isKo ? '생년월일 (양력)' : 'Date of Birth (Solar)'}</label>
            <div className={s.dateRow}>
              <select className={ui.input} value={year} onChange={(e) => setYear(e.target.value)} aria-label={isKo ? '출생 연도' : 'Birth year'}>
                <option value="">{isKo ? '연도' : 'Year'}</option>
                {Array.from({ length: 100 }, (_, i) => currentYear - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select className={ui.input} value={month} onChange={(e) => setMonth(e.target.value)} aria-label={isKo ? '출생 월' : 'Birth month'}>
                <option value="">{isKo ? '월' : 'Month'}</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}{isKo ? '월' : ''}</option>
                ))}
              </select>
              <select className={ui.input} value={day} onChange={(e) => setDay(e.target.value)} aria-label={isKo ? '출생 일' : 'Birth day'}>
                <option value="">{isKo ? '일' : 'Day'}</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}{isKo ? '일' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Birth time */}
          <div className={ui.field}>
            <label className={ui.label}>{isKo ? '태어난 시간' : 'Birth Time'}</label>
            <select
              className={ui.input}
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              disabled={unknownHour}
              aria-label={isKo ? '태어난 시간' : 'Birth time'}
            >
              <option value="">{isKo ? '시간 선택' : 'Select time'}</option>
              {BIRTH_HOURS.map(h => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
            <div className={s.checkboxRow}>
              <input
                type="checkbox"
                id="unknown-hour"
                checked={unknownHour}
                onChange={(e) => {
                  setUnknownHour(e.target.checked);
                  if (e.target.checked) setHour('');
                }}
              />
              <label htmlFor="unknown-hour">{isKo ? '태어난 시간을 모릅니다' : 'I don\'t know my birth time'}</label>
            </div>
          </div>

          {/* Submit */}
          <button
            className={`${ui.button} ${ui.primary} ${ui.block} ${ui.lg}`}
            onClick={handleSubmit}
            disabled={!formValid}
            aria-label={isParticipantMode ? (isKo ? '궁합 보기' : 'Check compatibility') : (isKo ? '링크 생성하기' : 'Generate link')}
          >
            {isParticipantMode
              ? (isKo ? '💕 궁합 결과 보기' : '💕 See Compatibility')
              : (isKo ? '💌 링크 생성하기' : '💌 Generate Link')}
          </button>
        </section>
      )}

      {/* ─── Share Step (Inviter) ─── */}
      {step === 'share' && (
        <section className={`${ui.card} ${s.fin_panel}`}>
          <div className={s.shareSection}>
            <h3>{isKo ? '링크가 생성되었어요!' : 'Your link is ready!'}</h3>
            <p>{isKo ? '상대방에게 이 링크를 보내면 함께 궁합을 확인할 수 있어요.' : 'Send this link to your partner to check compatibility together.'}</p>
            <div className={s.shareBtns}>
              {shareButtons}
            </div>
            {copied && (
              <p className={s.copiedToast}>{isKo ? '✅ 복사 완료!' : '✅ Copied!'}</p>
            )}
          </div>

          <button className={`${ui.button} ${ui.secondary} ${ui.block}`} onClick={handleRestart} aria-label={isKo ? '처음부터 다시 하기' : 'Start over'}>
            {isKo ? '처음부터 다시 하기' : 'Start Over'}
          </button>
        </section>
      )}

      {/* ─── Result Step ─── */}
      {step === 'result' && result && (
        <>
          <div id="saju-result-card" className={s.resultCard}>
            <div className={s.resultEmoji}>{result.emoji}</div>
            <div className={s.resultType}>{result.type}</div>

            {/* Score */}
            <div className={s.scoreDisplay}>
              <span className={s.personBadge}>{result.personA.name}</span>
              <div>
                <span className={s.scoreNum}>{result.score}</span>
                <span className={s.scoreUnit}>{isKo ? '점' : 'pts'}</span>
              </div>
              <span className={s.personBadge}>{result.personB.name}</span>
            </div>

            {/* Progress bar */}
            <div className={s.progressBar}>
              <div className={s.progressFill} style={{ width: `${result.score}%` }} />
            </div>

            {/* Saju info table */}
            <div className={s.sajuTable}>
              <div className={s.sajuRow}>
                <span className={s.sajuRowLabel} />
                <span className={s.sajuRowValue} style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{result.personA.name}</span>
                <span className={s.sajuRowValue} style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{result.personB.name}</span>
              </div>
              <div className={s.sajuRow}>
                <span className={s.sajuRowLabel}>{isKo ? '일간' : 'Stem'}</span>
                <span className={s.sajuRowValue}>{result.personA.saju.dayGan} ({isKo ? 오행한글[result.personA.saju.dayGanWuXing] : 오행영문[result.personA.saju.dayGanWuXing]})</span>
                <span className={s.sajuRowValue}>{result.personB.saju.dayGan} ({isKo ? 오행한글[result.personB.saju.dayGanWuXing] : 오행영문[result.personB.saju.dayGanWuXing]})</span>
              </div>
              <div className={s.sajuRow}>
                <span className={s.sajuRowLabel}>{isKo ? '일지' : 'Branch'}</span>
                <span className={s.sajuRowValue}>{result.personA.saju.dayZhi}</span>
                <span className={s.sajuRowValue}>{result.personB.saju.dayZhi}</span>
              </div>
            </div>

            {/* Description */}
            <p className={s.resultDesc}>{isKo ? result.descKo : result.descEn}</p>
          </div>

          {/* Action buttons */}
          <div className={s.actionBtns} style={{ maxWidth: 540, margin: '0 auto', width: '100%' }}>
            <button className={`${ui.button} ${ui.secondary} ${ui.block}`} onClick={handleImageSave} aria-label={isKo ? '이미지로 저장' : 'Save as image'}>
              <Camera size={18} /> {isKo ? '이미지로 저장' : 'Save as Image'}
            </button>
            <button className={`${ui.button} ${ui.secondary} ${ui.block}`} onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }} aria-label={isKo ? '결과 링크 복사' : 'Copy result link'}>
              <Link2 size={18} /> {isKo ? '결과 링크 복사' : 'Copy Result Link'}
            </button>
            {copied && <p className={s.copiedToast} style={{ textAlign: 'center' }}>{isKo ? '✅ 복사 완료!' : '✅ Copied!'}</p>}
            <button className={`${ui.button} ${ui.primary} ${ui.block}`} onClick={handleRestart} aria-label={isKo ? '나도 테스트하기' : 'Try it yourself'}>
              <HeartHandshake size={18} /> {isKo ? '나도 테스트하기' : 'Try it Yourself'}
            </button>
          </div>
        </>
      )}

      {/* ─── Bottom SEO Sections (7 sections, fixed order) ─── */}
      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="utilities/lifestyle/saju-compatibility" />

      {seo}
    </div>
  );
}
