'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Drama } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  JOBS, PERSONALITIES, SKILLS, MISSIONS, OBVIOUS_OVERLAP,
  type Card, type Mission, type Choice,
} from '@/lib/persona-data';
import s from './persona-build.module.css';

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

export default function PersonaBuildClient() {
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

      <header className={s.header}>
        <div style={{
          display: 'inline-flex', padding: '0.85rem', background: 'white',
          borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1rem',
        }}>
          <Drama size={34} color="#a855f7" />
        </div>
        <h1 className={s.title}>{t('title')}</h1>
        <p className={s.subtitle}>{t('subtitle')}</p>
      </header>

      {/* ── Loading ─────────────────────────────────────── */}
      {gameState === 'loading' && (
        <div className={s.loading_wrap}>
          <div className={s.spinner} />
          <p>{t('loading')}</p>
        </div>
      )}

      {/* ── Start (캐릭터 + 미션 공개) ───────────────────── */}
      {gameState === 'start' && (
        <section className={s.start_panel}>
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

          <button className={s.start_btn} onClick={handleStart} aria-label={t('start_button')}>
            {t('start_button')}
          </button>
        </section>
      )}

      {/* ── Playing ─────────────────────────────────────── */}
      {gameState === 'playing' && (
        <section className={s.play_panel}>
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
      <div className={s.ad_placeholder}>{t('ad_text')}</div>

      <SeoSection
        ko={{
          title: '페르소나 카드란 무엇인가요?',
          description:
            '페르소나 카드는 매일 새로 조합된 캐릭터(직업·성격·특기)와 미션을 받아 10개의 상황 선택으로 점수를 겨루는 1인용 데일리 카드 게임입니다. 정해진 정답은 없지만, 내 캐릭터의 특성을 잘 활용하는 선택을 골라야 높은 점수를 받을 수 있습니다. 캐릭터는 한국 표준시(KST) 자정에 동시 갱신되며, 같은 날에는 모든 사용자가 같은 미션과 동일한 점수 변동 시드를 공유하여 친구들과 점수를 비교하는 재미가 있습니다. 점수 계산은 baseScore(논리적 최선 = 100점) + 캐릭터 매칭 보너스(+5/+3/+2) - 반대 성격 감점(-10)으로 산정되어, 캐릭터 운이 나빠도 최선의 선택만 고르면 만점을 노릴 수 있습니다.',
          useCases: [
            { icon: '🎲', title: '매일 새로운 캐릭터 조합', desc: '20×20×20 = 8,000가지 캐릭터 조합 중 매일 새 캐릭터를 받습니다. 직업+성격+특기의 화학반응을 즐겨보세요.' },
            { icon: '🎭', title: '롤플레이 의사결정 훈련', desc: '내 캐릭터답게 행동했을 때 보너스 점수가 붙는 구조로, 자연스러운 롤플레이 의사결정 감각을 키울 수 있습니다.' },
            { icon: '📊', title: '점수 + 평가 공유', desc: '결과 화면의 점수와 캐릭터 활용도를 카카오톡·X·텔레그램으로 즉시 공유하여 친구들과 비교할 수 있습니다.' },
            { icon: '⏰', title: '하루 1번 플레이', desc: 'KST 자정 기준 매일 1회만 도전 가능. 다음 캐릭터까지 남은 시간이 카운트다운으로 표시되어 다시 방문하게 됩니다.' },
          ],
          steps: [
            { step: '오늘의 캐릭터 확인', desc: '직업·성격·특기 카드 3장이 순차적으로 공개됩니다. 어떤 미션이 주어졌는지 함께 확인하세요.' },
            { step: '미션 시작', desc: '"미션 시작" 버튼을 누르면 10개의 상황이 순서대로 등장합니다. 각 상황마다 4개의 선택지가 제시됩니다.' },
            { step: '캐릭터답게 선택', desc: '내 캐릭터의 성격·특기·직업에 맞는 선택을 고르면 보너스 점수가 붙습니다. 반대 성격의 선택은 감점되니 주의하세요.' },
            { step: '결과 공유', desc: '10번 선택 후 0~1000점의 최종 점수와 등급 평가가 표시됩니다. 공유 버튼으로 결과를 친구들과 비교해보세요.' },
          ],
          faqs: [
            { q: '점수는 어떻게 계산되나요?', a: '문항당 baseScore(논리적 최선 = 100점) + 캐릭터 매칭 보너스(성격 +5, 특기 +3, 직업 +2) - 반대 성격 감점(-10)으로 계산됩니다. 10문항 합산하여 0~1000점 범위입니다. 매일 약간의 양수 variation(0~10)이 추가되지만 만점은 보호됩니다.' },
            { q: '왜 같은 날에는 같은 캐릭터·미션이 나오나요?', a: '한국 표준시(KST) 자정 기준으로 모든 사용자가 동일한 캐릭터·미션·점수 시드를 공유합니다. 친구와 같은 조건에서 비교 플레이가 가능하며, 매일 자정에 새로 갱신됩니다.' },
            { q: '반대 성격이란 무엇인가요?', a: '예를 들어 "겁쟁이" 캐릭터인데 "용감하게 돌진" 같은 무모한 선택을 하면 캐릭터답지 않은 행동으로 간주되어 10점 감점됩니다. 본 게임은 성격 측면에서만 반대 태그를 적용하며, 직업·특기에는 반대 태그가 없습니다.' },
            { q: '이 결과를 공식 평가로 사용해도 되나요?', a: '본 게임은 오락용 데일리 카드 게임으로, 어떠한 심리 검사·성격 진단도 아닙니다. 결과는 캐릭터 롤플레이의 재미를 위한 점수일 뿐 실제 의사결정 능력 평가와는 무관합니다.' },
          ],
        }}
        en={{
          title: 'What is Persona Build?',
          description:
            "Persona Build is a daily solo card game where you receive a freshly mixed character (job + personality + skill) and a mission, then make 10 situational choices to maximize your score (0–1000). There are no fixed correct answers — high scores come from making choices that play to your character's traits. Characters refresh at Korean midnight (KST), so the same day's setup is shared across all players for fair comparison. Score formula: baseScore (logical best = 100) + character match bonus (+5/+3/+2) − opposite personality penalty (−10). A character with bad odds can still hit 1000 with optimal choices.",
          useCases: [
            { icon: '🎲', title: 'Fresh Combination Daily', desc: '8,000 possible character combos (20 jobs × 20 personalities × 20 skills). New character every day with surprising chemistry.' },
            { icon: '🎭', title: 'Roleplay Decision Practice', desc: 'Bonus points reward in-character choices — a natural way to sharpen role-based decision-making instincts.' },
            { icon: '📊', title: 'Score & Share', desc: 'Compare scores with friends by sharing the result card to KakaoTalk, Twitter, or Telegram instantly.' },
            { icon: '⏰', title: 'One Play Per Day', desc: 'Locked to one play per day (KST). A countdown to the next character keeps you coming back.' },
          ],
          steps: [
            { step: 'See Today\'s Character', desc: 'Three cards (job, personality, skill) reveal in sequence. The mission card appears alongside.' },
            { step: 'Start Mission', desc: 'Tap Start to begin 10 situational prompts. Each shows 4 choices.' },
            { step: 'Choose in Character', desc: 'Pick choices aligned with your personality, skill, and job — they earn bonuses. Choices against your personality (opposite tag) cost points.' },
            { step: 'Share Result', desc: 'After 10 choices, see your 0–1000 score and grade. Share with friends to compare.' },
          ],
          faqs: [
            { q: 'How is the score calculated?', a: 'Per situation: baseScore (logical best = 100) + character bonus (personality +5, skill +3, job +2) − opposite personality penalty (−10). Daily variation of 0–10 is added but never overrides a perfect-choice 100. Sum of 10 = 0–1000 total.' },
            { q: 'Why is the daily card the same for everyone?', a: 'Characters and missions rotate on a KST midnight cycle. Everyone in the world shares the same daily setup, so you can compare scores fairly with friends, and your day rolls over at Korean midnight.' },
            { q: 'What is an "opposite personality"?', a: 'For example, a "Coward" character making a "charge in bravely" choice is acting out of character — that earns a −10 penalty. Only personality has opposite tags; jobs and skills do not.' },
            { q: 'Is this a personality test?', a: 'No. This is an entertainment-only daily card game. The score reflects roleplay alignment, not any psychological or decision-making assessment.' },
          ],
        }}
      />
    </div>
  );
}
