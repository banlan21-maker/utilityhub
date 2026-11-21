'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Drama } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import type { Card } from '@/lib/persona-data';
import {
  cardById, dailySeed, dailySetup, gradeOf, missionById, scoreSituation, usagePercent,
  type Breakdown, type Fit,
} from '@/lib/personaGame';
import s from './persona-build.module.css';
import { ui } from '@/app/components/ui';

// 게임 규칙(뽑기·섞기·점수)은 src/lib/personaGame.ts 에 있다. 여기는 화면만.

/** 선택 뒤 점수·이유를 읽을 시간 (ms) */
const REVEAL_MS = 1700;

const L = {
  ko: {
    hint: '상식적으로 좋은 선택이 기본 점수이고, 내 캐릭터다운 선택에는 보너스가 붙습니다. 그래서 캐릭터에 따라 최선의 답이 달라집니다.',
    exact: (kind: string, name: string) => `딱 맞는 선택 — ${kind} '${name}'`,
    related: (kind: string, name: string) => `비슷한 계열 — ${kind} '${name}'`,
    opposite: '이 캐릭터답지 않은 행동 (감점)',
    none: '캐릭터와 상관없는 선택',
    best: '이 상황 최선의 선택!',
    usageNote: '챙길 수 있던 캐릭터 보너스 중 실제로 챙긴 비율',
    share: '📤 공유하기',
    grades: [
      '선택이 캐릭터와도, 상황과도 엇박자였어요. 내일 새 캐릭터로 다시 도전해 보세요!',
      '아쉬워요. 상황을 한 번 더 읽고, 내 캐릭터라면 어떻게 할지 떠올려 보세요.',
      '나쁘지 않아요! 캐릭터의 성격·특기를 조금 더 살리면 점수가 오릅니다.',
      '훌륭해요! 판단은 거의 완벽했고, 캐릭터다운 선택 몇 개만 놓쳤어요.',
      '만점! 상황 판단도, 캐릭터 해석도 완벽했습니다.',
    ],
  },
  en: {
    hint: 'Sensible choices earn the base score, and choices that fit your character earn a bonus — so the best answer changes with the character.',
    exact: (kind: string, name: string) => `A perfect fit for your ${kind.toLowerCase()} (${name})`,
    related: (kind: string, name: string) => `Close to your ${kind.toLowerCase()} (${name})`,
    opposite: 'Out of character (penalty)',
    none: 'Nothing to do with your character',
    best: 'The best choice here!',
    usageNote: 'Share of the available character bonus you actually collected',
    share: '📤 Share',
    grades: [
      "Your choices fit neither the character nor the situation. A new character awaits tomorrow!",
      'Not quite. Read the situation once more and ask what your character would do.',
      "Not bad! Lean into your character's personality and skill for a higher score.",
      'Great! Your judgment was nearly perfect — you only missed a few in-character choices.',
      'Perfect score! You read both the situations and the character flawlessly.',
    ],
  },
};

interface SavedResult {
  score: number;
  /** 캐릭터 활용도(%). 예전 방식으로 저장된 결과에는 없다 */
  usage?: number;
  characterIds: { job: string; personality: string; skill: string };
  missionId: string;
  completedAt: string;
}

type GameState = 'loading' | 'start' | 'playing' | 'result';

export default function PersonaBuildClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('PersonaBuild');
  const locale = useLocale();
  const isKo = locale === 'ko';
  const tx = isKo ? L.ko : L.en;

  const [gameState, setGameState] = useState<GameState>('loading');
  const [saved, setSaved] = useState<SavedResult | null>(null);

  // 현재 진행 상태
  const [step, setStep] = useState(0); // 0~9 (10개 상황)
  const [score, setScore] = useState(0);
  /** 고른 선택지의 원래 번호 (화면 순서가 아니다) */
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const picked = useRef<Breakdown[]>([]);
  const available = useRef<number[]>([]);

  const [timeLeft, setTimeLeft] = useState<string>('');
  const [canShare, setCanShare] = useState(false);

  // 오늘의 캐릭터·미션·선택지 순서 (날짜가 같으면 누구에게나 같다)
  const { character, mission, order } = useMemo(() => dailySetup(), []);
  const situation = mission.situations[step];
  const scored = useMemo(() => scoreSituation(situation, character), [situation, character]);

  // ── 저장된 오늘 결과 확인 (브라우저 저장소는 useEffect 안에서만) ──
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
    try {
      const raw = localStorage.getItem(`persona_${dailySeed()}`);
      if (raw) {
        setSaved(JSON.parse(raw) as SavedResult);
        setGameState('result');
      } else {
        setGameState('start');
      }
    } catch {
      setGameState('start');
    }
  }, []);

  // ── 다음 캐릭터까지 남은 시간 ──
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
    setPickedIdx(null);
    picked.current = [];
    available.current = [];
    setGameState('playing');
  };

  const handleChoice = useCallback(
    (idx: number) => {
      if (pickedIdx !== null) return;
      setPickedIdx(idx);
      const newScore = score + scored[idx].points;
      setScore(newScore);
      picked.current.push(scored[idx].detail);
      available.current.push(Math.max(...scored.map((x) => x.detail.bonus)));

      setTimeout(() => {
        if (step >= mission.situations.length - 1) {
          const result: SavedResult = {
            score: newScore,
            usage: usagePercent(picked.current, available.current),
            characterIds: { job: character.job.id, personality: character.personality.id, skill: character.skill.id },
            missionId: mission.id,
            completedAt: new Date().toISOString(),
          };
          try { localStorage.setItem(`persona_${dailySeed()}`, JSON.stringify(result)); } catch { /* 저장 못 해도 결과는 보여 준다 */ }
          setSaved(result);
          setGameState('result');
        } else {
          setStep((n) => n + 1);
          setPickedIdx(null);
        }
      }, REVEAL_MS);
    },
    [character, mission, pickedIdx, score, scored, step],
  );

  const cardName = (c: Card) => (isKo ? c.ko : c.en);

  // 고른 선택이 왜 그 점수인지
  const reasons = useMemo(() => {
    if (pickedIdx === null) return [];
    const { detail, points } = scored[pickedIdx];
    const name = (c: Card) => (isKo ? c.ko : c.en);
    const line = (fit: Fit, kind: string, card: Card) =>
      fit === 'exact' ? [`✨ ${tx.exact(kind, name(card))}`] : fit === 'related' ? [`👍 ${tx.related(kind, name(card))}`] : [];
    const out = [
      ...line(detail.personality, t('label_personality'), character.personality),
      ...line(detail.skill, t('label_skill'), character.skill),
      ...line(detail.job, t('label_job'), character.job),
    ];
    if (detail.opposite) out.push(`⚠️ ${tx.opposite}`);
    if (!out.length) out.push(tx.none);
    if (points === 100) out.unshift(`🏆 ${tx.best}`);
    return out;
  }, [pickedIdx, scored, character, isKo, t, tx]);

  // 결과 화면은 "저장된 판"의 캐릭터·미션을 보여 준다
  const shown = useMemo(() => {
    const ids = saved?.characterIds;
    return {
      job: (ids && cardById(ids.job)) || character.job,
      personality: (ids && cardById(ids.personality)) || character.personality,
      skill: (ids && cardById(ids.skill)) || character.skill,
      mission: (saved && missionById(saved.missionId)) || mission,
    };
  }, [saved, character, mission]);

  const pageUrl = `https://www.theutilhub.com/${locale}/utilities/utility/persona-build`;
  const shareText = useMemo(() => {
    const finalScore = saved?.score ?? score;
    const usage = saved?.usage;
    if (isKo) {
      return `🎭 오늘의 페르소나 카드\n${shown.job.emoji} ${shown.job.ko} + ${shown.personality.emoji} ${shown.personality.ko} + ${shown.skill.emoji} ${shown.skill.ko}\n📋 미션: ${shown.mission.ko.title}\n🏆 ${finalScore}점 / 1000점${usage != null ? ` · 캐릭터 활용도 ${usage}%` : ''}\ntheutilhub.com에서 당신의 캐릭터를 확인하세요!`;
    }
    return `🎭 Today's Persona Card\n${shown.job.emoji} ${shown.job.en} + ${shown.personality.emoji} ${shown.personality.en} + ${shown.skill.emoji} ${shown.skill.en}\n📋 Mission: ${shown.mission.en.title}\n🏆 ${finalScore} / 1000 pts${usage != null ? ` · Character usage ${usage}%` : ''}\nCheck your character at theutilhub.com!`;
  }, [saved, score, shown, isKo]);

  const [copied, setCopied] = useState(false);
  const handleCopyLink = () => {
    navigator.clipboard?.writeText(`${shareText}\n\n${pageUrl}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => { /* 복사 권한 없음 */ });
  };
  const handleNativeShare = () => {
    navigator.share({ text: shareText, url: pageUrl }).catch(() => { /* 사용자가 닫음 */ });
  };
  const handleSocialShare = (kind: 'x' | 'telegram') => {
    const encoded = encodeURIComponent(shareText);
    const url = encodeURIComponent(pageUrl);
    window.open(
      kind === 'x' ? `https://twitter.com/intent/tweet?text=${encoded}&url=${url}` : `https://t.me/share/url?url=${url}&text=${encoded}`,
      '_blank', 'noopener',
    );
  };

  const cards = (job: Card, personality: Card, skill: Card, cls: string) => (
    <div className={s.card_row}>
      {([['label_job', job], ['label_personality', personality], ['label_skill', skill]] as const).map(([label, c], i) => (
        <div key={label} className={`${s.card} ${cls}`} style={{ animationDelay: `${0.05 + i * 0.15}s` }}>
          <div className={s.card_label}>{t(label)}</div>
          <div className={s.card_emoji}>{c.emoji}</div>
          <div className={s.card_name}>{cardName(c)}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<Drama />} title={t('title')} subtitle={t('subtitle')} />

      {/* ── Loading ── */}
      {gameState === 'loading' && (
        <div className={s.loading_wrap}>
          <div className={s.spinner} />
          <p>{t('loading')}</p>
        </div>
      )}

      {/* ── Start (캐릭터 + 미션 공개) ── */}
      {gameState === 'start' && (
        <section className={ui.card}>
          <div className={s.section_title}>{t('today_character')}</div>
          {cards(character.job, character.personality, character.skill, '')}

          <div className={s.mission_box}>
            <div className={s.mission_label}>{t('today_mission')}</div>
            <div className={s.mission_emoji}>{mission.emoji}</div>
            <div className={s.mission_title}>{isKo ? mission.ko.title : mission.en.title}</div>
            <div className={s.mission_desc}>{isKo ? mission.ko.desc : mission.en.desc}</div>
          </div>

          <p className={s.hint}>{tx.hint}</p>

          <button className={`${ui.button} ${ui.primary} ${ui.lg} ${ui.block} ${s.start_btn}`} onClick={handleStart} aria-label={t('start_button')}>
            {t('start_button')}
          </button>
        </section>
      )}

      {/* ── Playing ── */}
      {gameState === 'playing' && (
        <section className={ui.card}>
          <div className={s.play_header}>
            <span className={s.play_mission_title}>{mission.emoji} {isKo ? mission.ko.title : mission.en.title}</span>
            <span className={s.play_progress_text}>{t('progress', { current: step + 1, total: mission.situations.length })}</span>
          </div>
          <div className={s.progress_bar_outer}>
            <div className={s.progress_bar_inner} style={{ width: `${((step + 1) / mission.situations.length) * 100}%` }} />
          </div>

          {/* 플레이 중에도 내 캐릭터가 보여야 캐릭터다운 선택을 고를 수 있다 */}
          <div className={s.me_row}>
            {[character.job, character.personality, character.skill].map((c) => (
              <span key={c.id} className={s.me_chip}>{c.emoji} {cardName(c)}</span>
            ))}
          </div>

          <div className={s.situation_text}>
            {isKo ? situation.text.ko : situation.text.en}
          </div>

          <div className={s.choices}>
            {order[step].map((idx) => {
              const c = situation.choices[idx];
              return (
                <button
                  key={`${step}-${idx}`}
                  onClick={() => handleChoice(idx)}
                  disabled={pickedIdx !== null}
                  className={`${s.choice_btn} ${pickedIdx !== null && pickedIdx !== idx ? s.choice_btn_disabled : ''}`}
                >
                  {isKo ? c.text.ko : c.text.en}
                  {pickedIdx === idx && (
                    <>
                      <span className={s.choice_score_flash}>{t('score_earned', { n: scored[idx].points })}</span>
                      <span className={s.reason} aria-live="polite">
                        {reasons.map((r) => <span key={r}>{r}</span>)}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Result ── */}
      {gameState === 'result' && saved && (
        <section className={s.result_panel}>
          <div className={s.result_title}>{t('result_title')} · {shown.mission.emoji} {isKo ? shown.mission.ko.title : shown.mission.en.title}</div>
          <div className={s.result_total}>{saved.score}</div>
          <div className={s.result_max}>{t('result_max')}</div>

          <div className={s.result_message}>{tx.grades[gradeOf(saved.score)]}</div>

          <div className={s.result_cards}>{cards(shown.job, shown.personality, shown.skill, s.card_on_dark)}</div>

          {saved.usage != null && (
            <div className={s.result_usage}>
              <div className={s.result_usage_label}>{t('result_usage')}</div>
              <div className={s.result_usage_value}>{saved.usage}%</div>
              <div className={s.result_usage_note}>{tx.usageNote}</div>
            </div>
          )}

          <div className={s.share_label}>{t('result_share')}</div>
          <div className={s.share_buttons}>
            {canShare && (
              <button className={`${s.share_btn} ${s.share_btn_main}`} onClick={handleNativeShare}>{tx.share}</button>
            )}
            <button className={s.share_btn} onClick={handleCopyLink}>
              {copied ? t('result_copied') : t('result_share_link')}
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
