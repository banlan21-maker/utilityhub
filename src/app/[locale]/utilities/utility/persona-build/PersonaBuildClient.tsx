'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Drama } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  JOBS, PERSONALITIES, SKILLS, MISSIONS, OBVIOUS_OVERLAP,
  type Card, type Mission, type Choice,
} from '@/lib/persona-data';
import s from './persona-build.module.css';
import { ui } from '@/app/components/ui';

// ── 날짜 시드 (KST 고정) ───────────────────────────────────────
function getDailySeed(): number {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.getUTCFullYear() * 10000 + (kst.getUTCMonth() + 1) * 100 + kst.getUTCDate();
}

function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
}

interface Character {
  job: Card;
  personality: Card;
  skill: Card;
}

function getDailySetup(): { character: Character; mission: Mission } {
  const seed = getDailySeed();
  const job         = JOBS[Math.floor(seededRandom(seed, 1) * JOBS.length)];
  const personality = PERSONALITIES[Math.floor(seededRandom(seed, 2) * PERSONALITIES.length)];
  let   skill       = SKILLS[Math.floor(seededRandom(seed, 3) * SKILLS.length)];

  // 직업-특기 어색한 중복 회피
  if (OBVIOUS_OVERLAP[job.id] === skill.id) {
    const nextIndex = (Math.floor(seededRandom(seed, 3) * SKILLS.length) + 1) % SKILLS.length;
    skill = SKILLS[nextIndex];
  }

  // 미션: 빈 껍데기(situations.length === 0)은 건너뛰고 데이터 있는 미션 중에서 선택
  const playable = MISSIONS.filter((m) => m.situations.length > 0);
  const missionIndex = seed % playable.length;
  const mission = playable[missionIndex];

  return { character: { job, personality, skill }, mission };
}

// ── 점수 계산 (V1.4 §12) ────────────────────────────────────────
function calcChoiceScore(choice: Choice, character: Character, situationIndex: number): number {
  const variation = Math.floor(seededRandom(getDailySeed(), situationIndex + 100) * 11); // 0~10 양수
  let raw = choice.baseScore + variation;

  if (choice.tags.includes(character.personality.id)) raw += 5;
  if (choice.tags.includes(character.skill.id))       raw += 3;
  if (choice.tags.includes(character.job.id))         raw += 2;

  // 반대 성격만 감점
  if (choice.tags.includes('반대_' + character.personality.id)) raw -= 10;

  return Math.min(100, Math.max(0, raw));
}

// 결과 메시지 (점수별 5단계)
const RESULT_MESSAGES = {
  ko: [
    { min: 900, text: '완벽한 캐릭터 플레이! 당신은 타고난 이야기꾼입니다.' },
    { min: 750, text: '캐릭터를 훌륭하게 활용했어요! 다음 미션도 기대됩니다.' },
    { min: 600, text: '나쁘지 않아요! 캐릭터 특성을 조금 더 살렸으면 어땠을까요?' },
    { min: 400, text: '캐릭터와 선택이 엇박자였어요. 내일 다시 도전해보세요!' },
    { min: 0,   text: '이 캐릭터는 당신과 맞지 않나봐요. 내일은 다른 캐릭터가 기다립니다!' },
  ],
  en: [
    { min: 900, text: "Perfect character play! You're a born storyteller." },
    { min: 750, text: "Great use of your character! Can't wait for your next mission." },
    { min: 600, text: "Not bad! Could've leaned into your traits a bit more." },
    { min: 400, text: "Your choices didn't quite match your character. Try again tomorrow!" },
    { min: 0,   text: "This character wasn't for you. A new one awaits tomorrow!" },
  ],
};

interface SavedResult {
  score: number;
  characterIds: { job: string; personality: string; skill: string };
  missionId: string;
  completedAt: string;
}

type GameState = 'loading' | 'start' | 'playing' | 'result';

export default function PersonaBuildClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('PersonaBuild');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [gameState, setGameState] = useState<GameState>('loading');
  const [saved, setSaved] = useState<SavedResult | null>(null);

  // 현재 진행 상태
  const [step, setStep] = useState(0); // 0~9 (10개 상황)
  const [score, setScore] = useState(0);
  const [lastEarned, setLastEarned] = useState<number | null>(null);
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);

  // 타이머
  const [timeLeft, setTimeLeft] = useState<string>('');

  // 캐릭터 + 미션 (메모)
  const { character, mission } = useMemo(() => getDailySetup(), []);

  // ── localStorage 체크 (useEffect 내부만, V1.2 §9) ─────────────
  useEffect(() => {
    try {
      const todayKey = `persona_${getDailySeed()}`;
      const raw = localStorage.getItem(todayKey);
      if (raw) {
        const data = JSON.parse(raw) as SavedResult;
        setSaved(data);
        setScore(data.score);
        setGameState('result');
      } else {
        setGameState('start');
      }
    } catch {
      setGameState('start');
    }
  }, []);

  // ── 카운트다운 타이머 (V1.2 §10) ────────────────────────────
  useEffect(() => {
    if (gameState !== 'result') return;
    const calcTimeLeft = (): string => {
      const now = new Date();
      const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      const tomorrow = new Date(kst);
      tomorrow.setUTCHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - kst.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      return `${h}${t('countdown_h')} ${m}${t('countdown_m')} ${sec}${t('countdown_s')}`;
    };
    setTimeLeft(calcTimeLeft());
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [gameState, t]);

  const handleStart = () => {
    setStep(0);
    setScore(0);
    setLastEarned(null);
    setPickedIdx(null);
    setGameState('playing');
  };

  const handleChoice = useCallback(
    (choice: Choice, idx: number) => {
      if (pickedIdx !== null) return;
      const earned = calcChoiceScore(choice, character, step);
      setPickedIdx(idx);
      setLastEarned(earned);
      const newScore = score + earned;
      setScore(newScore);

      setTimeout(() => {
        if (step >= mission.situations.length - 1) {
          // 마지막 — 결과로
          try {
            const key = `persona_${getDailySeed()}`;
            const result: SavedResult = {
              score: newScore,
              characterIds: { job: character.job.id, personality: character.personality.id, skill: character.skill.id },
              missionId: mission.id,
              completedAt: new Date().toISOString(),
            };
            localStorage.setItem(key, JSON.stringify(result));
            setSaved(result);
          } catch { /* ignore */ }
          setGameState('result');
        } else {
          setStep((s2) => s2 + 1);
          setPickedIdx(null);
          setLastEarned(null);
        }
      }, 800);
    },
    [character, mission, pickedIdx, score, step],
  );

  // 결과 메시지
  const resultMessage = useMemo(() => {
    const arr = RESULT_MESSAGES[isKo ? 'ko' : 'en'];
    return arr.find((r) => score >= r.min)?.text ?? '';
  }, [score, isKo]);

  // 공유 텍스트
  const shareText = useMemo(() => {
    const data = saved ? saved : null;
    const finalScore = data ? data.score : score;
    if (isKo) {
      return `🎭 오늘의 페르소나 카드\n${character.job.emoji} ${character.job.ko} + ${character.personality.emoji} ${character.personality.ko} + ${character.skill.emoji} ${character.skill.ko}\n📋 미션: ${mission.ko.title}\n🏆 ${finalScore}점 / 1000점\ntheutilhub.com에서 당신의 캐릭터를 확인하세요!`;
    }
    return `🎭 Today's Persona Card\n${character.job.emoji} ${character.job.en} + ${character.personality.emoji} ${character.personality.en} + ${character.skill.emoji} ${character.skill.en}\n📋 Mission: ${mission.en.title}\n🏆 ${finalScore} / 1000pts\nCheck your character at theutilhub.com!`;
  }, [saved, score, character, mission, isKo]);

  const [copied, setCopied] = useState(false);
  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(`${shareText}\n\nhttps://www.theutilhub.com/${locale}/utilities/utility/persona-build`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleSocialShare = (kind: 'kakao' | 'x' | 'telegram') => {
    const encoded = encodeURIComponent(shareText);
    const url = encodeURIComponent(`https://www.theutilhub.com/${locale}/utilities/utility/persona-build`);
    if (kind === 'x') {
      window.open(`https://twitter.com/intent/tweet?text=${encoded}&url=${url}`, '_blank');
    } else if (kind === 'telegram') {
      window.open(`https://t.me/share/url?url=${url}&text=${encoded}`, '_blank');
    } else {
      // 카카오톡은 SDK가 필요하므로 URL 공유 페이지로 폴백
      handleCopyLink();
    }
  };

  // 캐릭터 활용도 (태그 매칭 비율)
  const charUsage = useMemo(() => {
    if (!saved) return 0;
    // 점수 기반 추정 (간단 계산)
    return Math.round((score / 1000) * 100);
  }, [saved, score]);

  const cardName = (c: Card) => (isKo ? c.ko : c.en);

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<Drama />} title={t('title')} subtitle={t('subtitle')} />

      {/* ── Loading ─────────────────────────────────────── */}
      {gameState === 'loading' && (
        <div className={s.loading_wrap}>
          <div className={s.spinner} />
          <p>{t('loading')}</p>
        </div>
      )}

      {/* ── Start (캐릭터 + 미션 공개) ───────────────────── */}
      {gameState === 'start' && (
        <section className={ui.card}>
          <div className={s.section_title}>{t('today_character')}</div>
          <div className={s.card_row}>
            <div className={s.card} style={{ animationDelay: '0.05s' }}>
              <div className={s.card_label}>{t('label_job')}</div>
              <div className={s.card_emoji}>{character.job.emoji}</div>
              <div className={s.card_name}>{cardName(character.job)}</div>
            </div>
            <div className={s.card} style={{ animationDelay: '0.2s' }}>
              <div className={s.card_label}>{t('label_personality')}</div>
              <div className={s.card_emoji}>{character.personality.emoji}</div>
              <div className={s.card_name}>{cardName(character.personality)}</div>
            </div>
            <div className={s.card} style={{ animationDelay: '0.35s' }}>
              <div className={s.card_label}>{t('label_skill')}</div>
              <div className={s.card_emoji}>{character.skill.emoji}</div>
              <div className={s.card_name}>{cardName(character.skill)}</div>
            </div>
          </div>

          <div className={s.mission_box}>
            <div className={s.mission_label}>{t('today_mission')}</div>
            <div className={s.mission_emoji}>{mission.emoji}</div>
            <div className={s.mission_title}>{isKo ? mission.ko.title : mission.en.title}</div>
            <div className={s.mission_desc}>{isKo ? mission.ko.desc : mission.en.desc}</div>
          </div>

          <button className={`${ui.button} ${ui.primary} ${ui.lg} ${ui.block} ${s.start_btn}`} onClick={handleStart} aria-label={t('start_button')}>
            {t('start_button')}
          </button>
        </section>
      )}

      {/* ── Playing ─────────────────────────────────────── */}
      {gameState === 'playing' && (
        <section className={ui.card}>
          <div className={s.play_header}>
            <span className={s.play_mission_title}>{mission.emoji} {isKo ? mission.ko.title : mission.en.title}</span>
            <span className={s.play_progress_text}>{t('progress', { current: step + 1, total: mission.situations.length })}</span>
          </div>
          <div className={s.progress_bar_outer}>
            <div className={s.progress_bar_inner} style={{ width: `${((step + 1) / mission.situations.length) * 100}%` }} />
          </div>

          <div className={s.situation_text}>
            {isKo ? mission.situations[step].text.ko : mission.situations[step].text.en}
          </div>

          <div className={s.choices}>
            {mission.situations[step].choices.map((c, i) => (
              <button
                key={i}
                onClick={() => handleChoice(c, i)}
                disabled={pickedIdx !== null}
                className={`${s.choice_btn} ${pickedIdx !== null && pickedIdx !== i ? s.choice_btn_disabled : ''}`}
                aria-label={isKo ? c.text.ko : c.text.en}
              >
                {isKo ? c.text.ko : c.text.en}
                {pickedIdx === i && lastEarned != null && (
                  <span className={s.choice_score_flash}>
                    {t('score_earned', { n: lastEarned })}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Result ──────────────────────────────────────── */}
      {gameState === 'result' && saved && (
        <section className={s.result_panel}>
          <div className={s.result_title}>{t('result_title')}</div>
          <div className={s.result_total}>{saved.score}</div>
          <div className={s.result_max}>{t('result_max')}</div>

          <div className={s.result_message}>{resultMessage}</div>

          <div className={s.result_usage_row}>
            <div className={s.result_usage_item}>
              <div className={s.result_usage_label}>{character.job.emoji} {cardName(character.job)}</div>
              <div className={s.result_usage_value}>{character.personality.emoji}</div>
            </div>
            <div className={s.result_usage_item}>
              <div className={s.result_usage_label}>{t('result_usage')}</div>
              <div className={s.result_usage_value}>{charUsage}%</div>
            </div>
            <div className={s.result_usage_item}>
              <div className={s.result_usage_label}>{character.skill.emoji} {cardName(character.skill)}</div>
              <div className={s.result_usage_value}>🎭</div>
            </div>
          </div>

          <div className={s.share_label}>{t('result_share')}</div>
          <div className={s.share_buttons}>
            <button className={s.share_btn} onClick={handleCopyLink}>
              {copied ? t('result_copied') : t('result_share_link')}
            </button>
            <button className={`${s.share_btn} ${s.share_btn_kakao}`} onClick={() => handleSocialShare('kakao')}>
              {t('result_share_kakao')}
            </button>
            <button className={s.share_btn} onClick={() => handleSocialShare('x')}>
              {t('result_share_x')}
            </button>
            <button className={s.share_btn} onClick={() => handleSocialShare('telegram')}>
              {t('result_share_telegram')}
            </button>
          </div>

          {timeLeft && (
            <div className={s.countdown}>
              ⏰ {t('countdown_prefix')} {timeLeft}
            </div>
          )}
        </section>
      )}

      {/* 표준 하단 섹션 */}
      <ShareBar title={t('title')} description={t('subtitle')} />
      <RelatedTools toolId="utilities/utility/persona-build" />

      {seo}
    </div>
  );
}
