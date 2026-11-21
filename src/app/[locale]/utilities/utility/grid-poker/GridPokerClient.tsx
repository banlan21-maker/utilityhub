'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './grid-poker.module.css';
import { ui } from '@/app/components/ui';

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
export default function GridPokerClient({ seo }: { seo?: React.ReactNode }) {
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

  // ─────────────────── Render ───────────────────
  return (
    <div className={s.container}>
      <NavigationActions />

      {/* Header */}
      <ToolHeader
        icon={<Gamepad2 />}
        title={isKo ? '데일리 그리드 포커' : 'Daily Grid Poker'}
        subtitle={isKo ? '5×5 그리드에 카드를 배치해 포커 족보 점수를 최대화하세요!' : 'Place cards on a 5×5 grid and maximize your poker hand scores!'}
      />

      {/* Game Panel */}
      <section className={`${ui.card} ${s.fin_panel}`}>
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
            <button className={`${ui.button} ${ui.primary} ${ui.lg} ${ui.block} ${s.shareBtn}`} onClick={handleShare} aria-label={isKo ? '결과 공유하기' : 'Share result'}>
              {isKo ? '🎯 결과 공유하기' : '🎯 Share Result'}
            </button>

            {/* AD slot — inside result panel */}

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
      <RelatedTools toolId="utilities/utility/grid-poker" />
      {seo}
    </div>
  );
}
