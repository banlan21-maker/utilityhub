'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './grid-poker.module.css';

// ─────────────────── Types ───────────────────
const SUITS = ['♠', '♥', '♦', '♣'] as const;
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

type Suit = typeof SUITS[number];
type Rank = typeof RANKS[number];

interface Card {
  suit: Suit;
  rank: Rank;
  rankValue: number;
  isRed: boolean;
}

interface HandResult {
  hand: string;
  score: number;
  emoji: string;
}

interface StreakData {
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string;
}

// ─────────────────── Seed & Deck ───────────────────
function getDailySeed(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function seededRandom(seed: string, index: number): number {
  let hash = 0;
  const str = seed + index;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) / 2147483647;
}

function buildDeck(): Card[] {
  const rankValues: Record<Rank, number> = {
    A: 14, K: 13, Q: 12, J: 11,
    '10': 10, '9': 9, '8': 8, '7': 7,
    '6': 6, '5': 5, '4': 4, '3': 3, '2': 2,
  };
  return SUITS.flatMap(suit =>
    RANKS.map(rank => ({
      suit, rank,
      rankValue: rankValues[rank],
      isRed: suit === '♥' || suit === '♦',
    }))
  );
}

function getDailyCards(): Card[] {
  const seed = getDailySeed();
  const deck = buildDeck();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed, i) * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, 25);
}

// ─────────────────── Poker Evaluation ───────────────────
function isStraight(cards: Card[]): boolean {
  const values = cards.map(c => c.rankValue).sort((a, b) => a - b);
  const isNormal = values[4] - values[0] === 4 && new Set(values).size === 5;
  const hasAce = values.includes(14);
  const lowValues = hasAce ? values.map(v => v === 14 ? 1 : v).sort((a, b) => a - b) : null;
  const isLow = lowValues !== null &&
    lowValues[4] - lowValues[0] === 4 &&
    new Set(lowValues).size === 5;
  return isNormal || isLow;
}

function isRoyalFlush(cards: Card[]): boolean {
  const isFlush = new Set(cards.map(c => c.suit)).size === 1;
  const values = cards.map(c => c.rankValue).sort((a, b) => a - b);
  const isRoyal = JSON.stringify(values) === JSON.stringify([10, 11, 12, 13, 14]);
  return isFlush && isRoyal;
}

function evaluateHand(cards: Card[]): HandResult {
  const suits = cards.map(c => c.suit);
  const values = cards.map(c => c.rankValue);
  const isFlush = new Set(suits).size === 1;
  const straight = isStraight(cards);
  const valueCounts = values.reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {} as Record<number, number>);
  const counts = Object.values(valueCounts).sort((a, b) => b - a);

  if (isRoyalFlush(cards))                      return { hand: '로얄 스트레이트 플러시', score: 100, emoji: '👑' };
  if (isFlush && straight)                      return { hand: '스트레이트 플러시', score: 75, emoji: '🟥' };
  if (counts[0] === 4)                          return { hand: '포카드', score: 50, emoji: '🟧' };
  if (counts[0] === 3 && counts[1] === 2)       return { hand: '풀하우스', score: 25, emoji: '🟪' };
  if (isFlush)                                  return { hand: '플러시', score: 20, emoji: '🟦' };
  if (straight)                                 return { hand: '스트레이트', score: 15, emoji: '🟩' };
  if (counts[0] === 3)                          return { hand: '트리플', score: 10, emoji: '🟨' };
  if (counts[0] === 2 && counts[1] === 2)       return { hand: '투페어', score: 5, emoji: '🟫' };
  if (counts[0] === 2)                          return { hand: '원페어', score: 2, emoji: '⬜' };
  return                                        { hand: '탑카드', score: 0, emoji: '⬛' };
}

function calcTotalScore(grid: (Card | null)[]) {
  const filled = grid.filter(Boolean) as Card[];
  if (filled.length < 25) return null;
  const rowResults: HandResult[] = [];
  const colResults: HandResult[] = [];
  for (let row = 0; row < 5; row++) {
    rowResults.push(evaluateHand([0, 1, 2, 3, 4].map(col => grid[row * 5 + col] as Card)));
  }
  for (let col = 0; col < 5; col++) {
    colResults.push(evaluateHand([0, 1, 2, 3, 4].map(row => grid[row * 5 + col] as Card)));
  }
  const totalScore = [...rowResults, ...colResults].reduce((s, r) => s + r.score, 0);
  return { rowResults, colResults, totalScore };
}

// ─────────────────── Streak ───────────────────
const STREAK_KEY = 'grid-poker_streak';

function loadStreak(): StreakData {
  if (typeof window === 'undefined') return { currentStreak: 0, maxStreak: 0, lastPlayedDate: '' };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? JSON.parse(raw) : { currentStreak: 0, maxStreak: 0, lastPlayedDate: '' };
  } catch { return { currentStreak: 0, maxStreak: 0, lastPlayedDate: '' }; }
}

function updateStreak(): StreakData {
  const today = getDailySeed();
  const streak = loadStreak();
  if (streak.lastPlayedDate === today) return streak;

  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (streak.lastPlayedDate === yesterdayStr) {
    streak.currentStreak += 1;
  } else {
    streak.currentStreak = 1;
  }
  streak.maxStreak = Math.max(streak.maxStreak, streak.currentStreak);
  streak.lastPlayedDate = today;
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  return streak;
}

// ─────────────────── Share Text ───────────────────
function generateShareText(totalScore: number, rowResults: HandResult[], streak: StreakData, isKo: boolean): string {
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}/${today.getDate()}`;
  const gridEmoji = rowResults.map(r => r.emoji.repeat(5)).join('\n');
  if (isKo) {
    const streakLine = streak.currentStreak >= 2 ? `🔥 ${streak.currentStreak}일 연속 두뇌 트레이닝 중!\n` : '';
    return `🃏 오늘의 그리드 포커 (${dateStr})\n${streakLine}🏆 총점: ${totalScore}점 / 1,000점\n${gridEmoji}\n👉 당신의 두뇌를 테스트하세요! theutilhub.com\n#그리드포커 #UtilityHub`;
  } else {
    const streakLine = streak.currentStreak >= 2 ? `🔥 ${streak.currentStreak} day streak!\n` : '';
    return `🃏 Daily Grid Poker (${dateStr})\n${streakLine}🏆 Score: ${totalScore} / 1,000\n${gridEmoji}\n👉 Test your brain at theutilhub.com\n#GridPoker #UtilityHub`;
  }
}

// ─────────────────── Animations ───────────────────
const cardVariants = {
  initial: { scale: 1.3, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
};

const resultVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const streakVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.3 } },
};

// ─────────────────── Component ───────────────────
export default function GridPokerClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const TODAY_KEY = `grid-poker_${getDailySeed()}`;

  const [cards] = useState<Card[]>(() => getDailyCards());
  const [grid, setGrid] = useState<(Card | null)[]>(Array(25).fill(null));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'playing' | 'result'>('playing');
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, maxStreak: 0, lastPlayedDate: '' });
  const [result, setResult] = useState<{ rowResults: HandResult[]; colResults: HandResult[]; totalScore: number } | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [timeUntilNext, setTimeUntilNext] = useState('');
  const scoreAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load saved game or start fresh ──
  useEffect(() => {
    const saved = localStorage.getItem(TODAY_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setGrid(data.grid);
        setCurrentIndex(25);
        setResult({ rowResults: data.rowResults, colResults: data.colResults, totalScore: data.totalScore });
        setDisplayScore(data.totalScore);
        setPhase('result');
        setStreak(loadStreak());
      } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Countdown ──
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      setTimeUntilNext(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Place card ──
  const placeCard = useCallback((cellIndex: number) => {
    if (phase !== 'playing') return;
    if (grid[cellIndex] !== null) return;
    if (currentIndex >= 25) return;

    const newGrid = [...grid];
    newGrid[cellIndex] = cards[currentIndex];
    const nextIndex = currentIndex + 1;
    setGrid(newGrid);
    setCurrentIndex(nextIndex);

    if (nextIndex === 25) {
      const calc = calcTotalScore(newGrid);
      if (!calc) return;
      setResult(calc);
      setPhase('result');

      // Update streak
      const newStreak = updateStreak();
      setStreak(newStreak);

      // Save to localStorage
      localStorage.setItem(TODAY_KEY, JSON.stringify({
        grid: newGrid,
        rowResults: calc.rowResults,
        colResults: calc.colResults,
        totalScore: calc.totalScore,
        completedAt: new Date().toISOString(),
      }));

      // Score count-up animation
      let current = 0;
      const step = Math.ceil(calc.totalScore / 40);
      scoreAnimRef.current = setInterval(() => {
        current = Math.min(current + step, calc.totalScore);
        setDisplayScore(current);
        if (current >= calc.totalScore) {
          if (scoreAnimRef.current) clearInterval(scoreAnimRef.current);
        }
      }, 30);
    }
  }, [phase, grid, currentIndex, cards, TODAY_KEY]);

  // ── Share ──
  const handleShare = useCallback(() => {
    if (!result) return;
    const text = generateShareText(result.totalScore, result.rowResults, streak, isKo);
    navigator.clipboard.writeText(text).then(() => {
      alert(isKo ? '클립보드에 복사되었습니다!' : 'Copied to clipboard!');
    });
  }, [result, streak, isKo]);

  const currentCard = currentIndex < 25 ? cards[currentIndex] : null;

  // ─────────────────── SEO Content ───────────────────
  const seoKo = {
    title: '데일리 그리드 포커란 무엇인가요?',
    description: '데일리 그리드 포커는 매일 UTC 기준 날짜로 생성된 동일한 25장의 카드를 5x5 그리드에 전략적으로 배치해 포커 족보 점수를 최대화하는 1인용 퍼즐 게임입니다. 가로 5줄과 세로 5줄, 총 10개의 포커 핸드가 판정되며 최대 1,000점을 획득할 수 있습니다. 로얄 스트레이트 플러시(100점)부터 탑카드(0점)까지 9가지 족보가 적용되고, 매일 플레이하면 연속 플레이(Streak) 기록이 쌓여 두뇌 트레이닝 습관을 형성할 수 있습니다. 로그인 없이 브라우저에서 바로 무료로 즐길 수 있으며, 전 세계 사용자가 같은 카드로 오늘의 점수를 비교할 수 있는 소셜 공유 기능도 제공됩니다.',
    useCases: [
      { icon: '🌅', title: '아침 두뇌 워밍업', desc: '출근 전 5분, 매일 동일한 카드로 전략적 사고를 깨우는 두뇌 워밍업 루틴으로 활용하면 하루를 더 명석하게 시작할 수 있습니다.' },
      { icon: '🃏', title: '포커 전략 감각 훈련', desc: '5x5 그리드에서 가로/세로 모두 최적의 족보를 구성하려면 카드 배치 전략이 필요합니다. 실제 포커보다 빠르게 패 구성 감각을 키울 수 있습니다.' },
      { icon: '⏱️', title: '점심시간 집중력 게임', desc: '25장 배치만 완료하면 게임이 끝나는 구조라 부담 없이 짧게 즐길 수 있습니다. 하루 한 번이라는 제한이 오히려 집중도를 높여줍니다.' },
      { icon: '📊', title: '친구와 점수 비교', desc: '전 세계 모든 사용자가 같은 25장으로 오늘 게임을 플레이합니다. 결과를 SNS에 공유하고 연속 플레이 기록과 점수를 비교하는 소셜 경험을 즐기세요.' },
    ],
    steps: [
      { step: '1. 오늘의 카드 확인', desc: '페이지 상단에 오늘의 첫 번째 카드가 표시됩니다. UTC 기준 날짜 시드로 생성된 25장이 순서대로 제공됩니다.' },
      { step: '2. 그리드 배치 전략 수립', desc: '현재 카드를 어느 셀에 배치할지 결정합니다. 가로줄과 세로줄 모두에서 좋은 족보가 나올 수 있도록 전략적으로 위치를 선택하세요.' },
      { step: '3. 족보 완성 및 점수 확인', desc: '25장을 모두 배치하면 가로 5줄, 세로 5줄 총 10개의 포커 핸드가 자동으로 판정됩니다. 각 줄의 족보와 점수가 표시됩니다.' },
      { step: '4. 스트릭 기록 및 결과 공유', desc: '결과 화면에서 연속 플레이 기록(Streak)을 확인하고 공유 버튼으로 오늘의 족보 이모지와 점수를 SNS에 공유하세요.' },
    ],
    faqs: [
      { q: '매일 카드 배열이 바뀌나요?', a: '네. UTC 기준 날짜를 시드로 Fisher-Yates 셔플 알고리즘이 적용됩니다. 같은 날 접속하는 전 세계 모든 사용자가 동일한 25장을 받으며, UTC 자정(한국 시간 오전 9시)에 새로운 카드가 제공됩니다.' },
      { q: '연속 플레이 기록(Streak)은 어떻게 저장되나요?', a: '브라우저 localStorage에 저장됩니다. 서버에 개인정보가 전혀 저장되지 않으며, 매일 한 번 게임을 완료하면 Streak이 1씩 올라갑니다. 하루를 건너뛰면 Streak이 1부터 다시 시작되며, 역대 최고 기록(Max Streak)은 유지됩니다.' },
      { q: '점수를 높이는 전략이 있나요?', a: '가로와 세로를 동시에 고려하는 것이 핵심입니다. 같은 숫자 카드가 나오면 세로줄에 집중 배치해 포카드나 트리플을 노리세요. 같은 무늬 카드는 한 행에 모아 플러시를 노리는 전략도 유효합니다. 배치 취소가 없으므로 신중하게 결정하세요.' },
      { q: '이 게임 결과를 공식 자료로 사용해도 되나요?', a: '이 게임은 순수한 오락 및 두뇌 훈련 목적으로 제작되었습니다. 결과는 참고용이며 공식 자료로 사용할 수 없습니다.' },
    ],
  };

  const seoEn = {
    title: 'What is Daily Grid Poker?',
    description: 'Daily Grid Poker is a single-player puzzle game where you strategically place 25 daily cards on a 5x5 grid to maximize poker hand scores across 10 lines — 5 rows and 5 columns. Every day at UTC midnight, a new seed generates 25 unique cards shared globally, so all players compete with the same hand. Scoring ranges from Royal Straight Flush (100 pts) to Top Card (0 pts) across 9 hand types, with a maximum possible score of 1,000 points. A built-in Streak system tracks daily play consistency to build a brain-training habit. No login required — play free instantly in your browser and share your results on social media.',
    useCases: [
      { icon: '🌅', title: 'Morning Brain Warm-Up', desc: 'A 5-minute morning ritual with strategic card placement activates logical thinking before your workday begins, helping you start sharper and more focused.' },
      { icon: '🃏', title: 'Poker Strategy Training', desc: 'Optimizing both rows and columns simultaneously requires multi-directional hand-building strategy, sharpening your poker intuition faster than traditional play.' },
      { icon: '⏱️', title: 'Lunchtime Focus Game', desc: 'The game ends as soon as all 25 cards are placed — no time pressure, no open-ended sessions. The once-a-day limit actually increases your engagement and focus.' },
      { icon: '📊', title: 'Social Score Comparison', desc: 'Everyone worldwide plays with the same 25 cards today. Share your emoji result grid and streak on social media to compare scores and challenge friends.' },
    ],
    steps: [
      { step: '1. Check Today\'s Cards', desc: 'The first card is displayed at the top. All 25 cards are generated from a UTC date seed, ensuring the same sequence for every player worldwide today.' },
      { step: '2. Plan Your Placement Strategy', desc: 'Decide which empty cell best fits the current card. Consider both the row and column to set up strong poker hands across all 10 lines simultaneously.' },
      { step: '3. Complete the Grid & Check Score', desc: 'After placing all 25 cards, 10 poker hands (5 rows + 5 columns) are automatically evaluated. Each line shows its hand name, score, and emoji.' },
      { step: '4. Record Streak & Share Results', desc: 'Check your consecutive play streak on the results screen. Use the share button to post your emoji result grid and score to social media.' },
    ],
    faqs: [
      { q: 'Does the card layout change every day?', a: 'Yes. A Fisher-Yates shuffle algorithm seeded by the UTC date generates 25 new cards daily. All players worldwide receive the same cards on the same day, refreshing at UTC midnight (9 AM KST).' },
      { q: 'How is the streak saved?', a: 'Your streak is stored in your browser\'s localStorage — no personal data is sent to any server. Complete the game once per day to increment your streak. Missing a day resets the current streak to 1, but your max streak record is always preserved.' },
      { q: 'Can I use this result as official data?', a: 'This game is created for entertainment and brain-training purposes only. Results are for reference only and cannot be used as official data.' },
      { q: 'Are diagonal lines scored?', a: 'No. Only the 5 horizontal rows and 5 vertical columns are evaluated — 10 lines total. Diagonal hands are not included in the scoring.' },
    ],
  };

  // ─────────────────── Render ───────────────────
  return (
    <div className={s.container}>
      <NavigationActions />

      {/* Header */}
      <header className={s.fin_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Gamepad2 size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.fin_title}>{isKo ? '데일리 그리드 포커' : 'Daily Grid Poker'}</h1>
        <p className={s.fin_subtitle}>
          {isKo ? '5×5 그리드에 카드를 배치해 포커 족보 점수를 최대화하세요!' : 'Place cards on a 5×5 grid and maximize your poker hand scores!'}
        </p>
      </header>

      {/* Game Panel */}
      <section className={s.fin_panel}>
        {phase === 'playing' && (
          <>
            {/* Next card */}
            <div className={s.nextCardArea}>
              <span className={s.nextCardLabel}>{isKo ? '다음 카드' : 'Next Card'}</span>
              <AnimatePresence mode="wait">
                {currentCard && (
                  <motion.div
                    key={currentIndex}
                    className={`${s.nextCard} ${currentCard.isRed ? s.cardRed : s.cardBlack}`}
                    initial={{ scale: 1.4, opacity: 0, rotateY: 90 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  >
                    <span className={s.nextCardRank}>{currentCard.rank}</span>
                    <span className={s.nextCardSuit}>{currentCard.suit}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <span className={s.cardCount}>{isKo ? `${currentIndex + 1} / 25장` : `Card ${currentIndex + 1} of 25`}</span>
            </div>

            {/* 5×5 Grid */}
            <div className={s.grid} role="grid" aria-label={isKo ? '5x5 카드 그리드' : '5x5 card grid'}>
              {grid.map((card, idx) => (
                <div
                  key={idx}
                  role="gridcell"
                  aria-label={card ? `${card.rank}${card.suit}` : (isKo ? `빈 셀 ${idx + 1}` : `Empty cell ${idx + 1}`)}
                  className={`${s.cell} ${card ? s.cellFilled : s.cellEmpty} ${card ? (card.isRed ? s.cardRed : s.cardBlack) : ''}`}
                  onClick={() => placeCard(idx)}
                  tabIndex={card ? -1 : 0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') placeCard(idx); }}
                >
                  {card ? (
                    <motion.div
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <span className={s.cardRank}>{card.rank}</span>
                      <span className={s.cardSuit}>{card.suit}</span>
                    </motion.div>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Result Panel */}
        {phase === 'result' && result && (
          <motion.div
            className={s.resultPanel}
            variants={resultVariants}
            initial="initial"
            animate="animate"
          >
            {/* Streak Badge */}
            <motion.div className={s.streakBadge} variants={streakVariants} initial="initial" animate="animate">
              <span className={s.streakMain}>
                {streak.currentStreak >= 2
                  ? `🔥 ${streak.currentStreak}${isKo ? '일 연속 두뇌 트레이닝 중!' : ' day streak!'}`
                  : `🎯 ${isKo ? '첫 번째 도전!' : 'First attempt!'}`
                }
              </span>
              <span className={s.streakSub}>
                {isKo ? `🏆 역대 최고: ${streak.maxStreak}일` : `🏆 Best: ${streak.maxStreak} days`}
              </span>
            </motion.div>

            {/* Total Score */}
            <div style={{ textAlign: 'center' }}>
              <div className={s.totalScoreLabel}>{isKo ? '총점' : 'Total Score'}</div>
              <div className={s.totalScore}>{displayScore}</div>
              <div className={s.totalScoreMax}>/ 1,000 {isKo ? '점' : 'pts'}</div>
            </div>

            {/* Hands Table */}
            <table className={s.handsTable} aria-label={isKo ? '족보 결과표' : 'Hand results'}>
              <thead>
                <tr>
                  <th>{isKo ? '줄' : 'Line'}</th>
                  <th>{isKo ? '족보' : 'Hand'}</th>
                  <th style={{ textAlign: 'right' }}>{isKo ? '점수' : 'Score'}</th>
                </tr>
              </thead>
              <tbody>
                {result.rowResults.map((r, i) => (
                  <tr key={`row-${i}`}>
                    <td>{isKo ? `가로 ${i + 1}` : `Row ${i + 1}`}</td>
                    <td>{r.emoji} {r.hand}</td>
                    <td className={r.score > 0 ? s.handScore : s.handScoreZero}>{r.score}</td>
                  </tr>
                ))}
                {result.colResults.map((r, i) => (
                  <tr key={`col-${i}`}>
                    <td>{isKo ? `세로 ${i + 1}` : `Col ${i + 1}`}</td>
                    <td>{r.emoji} {r.hand}</td>
                    <td className={r.score > 0 ? s.handScore : s.handScoreZero}>{r.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Share Button */}
            <button className={s.shareBtn} onClick={handleShare} aria-label={isKo ? '결과 공유하기' : 'Share result'}>
              {isKo ? '🎯 결과 공유하기' : '🎯 Share Result'}
            </button>

            {/* AD slot — inside result panel */}
            <div style={{ width: '100%', height: '50px', background: 'rgba(241,245,249,0.5)', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
              AD
            </div>

            {/* Countdown */}
            <div className={s.countdown}>
              <div className={s.countdownLabel}>{isKo ? '다음 퍼즐까지' : 'Next puzzle in'}</div>
              <div className={s.countdownTimer}>{timeUntilNext}</div>
            </div>
          </motion.div>
        )}
      </section>

      {/* Bottom 7 sections — fixed order */}
      <ShareBar
        title={isKo ? '데일리 그리드 포커' : 'Daily Grid Poker'}
        description={isKo ? '5×5 그리드에 카드를 배치해 포커 족보 점수를 최대화하세요!' : 'Place cards on a 5×5 grid and maximize your poker hand scores!'}
      />
      <RelatedTools toolId="utility/grid-poker" />
      <div className="w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">AD</div>
      <SeoSection ko={seoKo} en={seoEn} />
    </div>
  );
}
