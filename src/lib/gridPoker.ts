// 그리드 포커 — 게임 규칙 (카드 뽑기·족보·점수·등급). 화면 없이 계산만 하므로 노드에서 바로 검증할 수 있다.
import { dailySeed, rand, seedToDate } from './dailyRandom';

export const SUITS = ['♠', '♥', '♦', '♣'] as const;
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];

export interface Card { suit: Suit; rank: Rank; rankValue: number; isRed: boolean }
export type Grid = (Card | null)[];

export const SIZE = 5;
export const CELLS = SIZE * SIZE;

/** 족보 (높은 것부터). 점수는 포커 스퀘어의 미국식 배점 */
export const HANDS = [
  { id: 'royal', score: 100, emoji: '👑', ko: '로얄 스트레이트 플러시', en: 'Royal Flush' },
  { id: 'straightFlush', score: 75, emoji: '🟥', ko: '스트레이트 플러시', en: 'Straight Flush' },
  { id: 'four', score: 50, emoji: '🟧', ko: '포카드', en: 'Four of a Kind' },
  { id: 'fullHouse', score: 25, emoji: '🟪', ko: '풀하우스', en: 'Full House' },
  { id: 'flush', score: 20, emoji: '🟦', ko: '플러시', en: 'Flush' },
  { id: 'straight', score: 15, emoji: '🟩', ko: '스트레이트', en: 'Straight' },
  { id: 'three', score: 10, emoji: '🟨', ko: '트리플', en: 'Three of a Kind' },
  { id: 'twoPair', score: 5, emoji: '🟫', ko: '투페어', en: 'Two Pair' },
  { id: 'pair', score: 2, emoji: '⬜', ko: '원페어', en: 'One Pair' },
  { id: 'high', score: 0, emoji: '⬛', ko: '탑카드', en: 'High Card' },
] as const;
export type Hand = (typeof HANDS)[number];
const hand = (id: Hand['id']): Hand => HANDS.find((h) => h.id === id)!;

function buildDeck(): Card[] {
  const value = (r: Rank) => (r === 'A' ? 14 : r === 'K' ? 13 : r === 'Q' ? 12 : r === 'J' ? 11 : Number(r));
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ suit, rank, rankValue: value(rank), isRed: suit === '♥' || suit === '♦' })));
}

/** 오늘의 25장 (나오는 순서대로). 52장을 날짜 기준으로 섞어 앞에서 25장 */
export function dailyCards(seed: number = dailySeed()): Card[] {
  const deck = buildDeck();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand(seed, i) * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, CELLS);
}

/** 카드 5장의 족보 */
export function evaluateHand(cards: Card[]): Hand {
  const values = cards.map((c) => c.rankValue).sort((a, b) => a - b);
  const flush = new Set(cards.map((c) => c.suit)).size === 1;
  const distinct = new Set(values).size === 5;
  const low = values.map((v) => (v === 14 ? 1 : v)).sort((a, b) => a - b); // A-2-3-4-5
  const straight = distinct && (values[4] - values[0] === 4 || low[4] - low[0] === 4);
  const counts = Object.values(values.reduce<Record<number, number>>((acc, v) => { acc[v] = (acc[v] ?? 0) + 1; return acc; }, {})).sort((a, b) => b - a);

  if (flush && straight && values[0] === 10) return hand('royal');
  if (flush && straight) return hand('straightFlush');
  if (counts[0] === 4) return hand('four');
  if (counts[0] === 3 && counts[1] === 2) return hand('fullHouse');
  if (flush) return hand('flush');
  if (straight) return hand('straight');
  if (counts[0] === 3) return hand('three');
  if (counts[0] === 2 && counts[1] === 2) return hand('twoPair');
  if (counts[0] === 2) return hand('pair');
  return hand('high');
}

export const rowCells = (r: number) => Array.from({ length: SIZE }, (_, c) => r * SIZE + c);
export const colCells = (c: number) => Array.from({ length: SIZE }, (_, r) => r * SIZE + c);

export interface GridScore {
  /** 줄이 다 차야 족보가 정해진다. 덜 찬 줄은 null */
  rows: (Hand | null)[];
  cols: (Hand | null)[];
  total: number;
}

/** 지금까지 놓인 카드로 줄별 족보와 합계 (다 찬 줄만 점수) */
export function scoreGrid(grid: Grid): GridScore {
  const line = (cells: number[]) => {
    const cards = cells.map((i) => grid[i]);
    return cards.every(Boolean) ? evaluateHand(cards as Card[]) : null;
  };
  const rows = Array.from({ length: SIZE }, (_, r) => line(rowCells(r)));
  const cols = Array.from({ length: SIZE }, (_, c) => line(colCells(c)));
  return { rows, cols, total: [...rows, ...cols].reduce((s, h) => s + (h?.score ?? 0), 0) };
}

/** 등급 (낮은 것부터). 기준은 모의 플레이 400일치로 정했다:
 *  아무 데나 놓으면 평균 14점(최고 46), "같은 숫자는 같은 세로줄에" 만 지켜도 중앙값 112점·상위 10% 160점,
 *  25장 순서를 전부 알고 찾은 최고점도 300점대라서 "만점 1,000점" 표기는 쓰지 않는다 */
export const GRADES = [
  { min: 0, emoji: '🌱', ko: '새싹', en: 'Sprout' },
  { min: 40, emoji: '🥉', ko: '브론즈', en: 'Bronze' },
  { min: 80, emoji: '🥈', ko: '실버', en: 'Silver' },
  { min: 120, emoji: '🥇', ko: '골드', en: 'Gold' },
  { min: 160, emoji: '💎', ko: '다이아', en: 'Diamond' },
  { min: 200, emoji: '👑', ko: '마스터', en: 'Master' },
] as const;
export const gradeIndex = (score: number) => GRADES.reduce((g, x, i) => (score >= x.min ? i : g), 0);

/* ── 연속 기록 ── */

export interface Streak { currentStreak: number; maxStreak: number; lastPlayedDate: string }

/** 오늘 한 판을 마쳤을 때의 연속 기록. 날짜는 한국 날짜 'YYYY-MM-DD' */
export function nextStreak(prev: Streak, seed: number): Streak {
  const today = seedToDate(seed);
  if (prev.lastPlayedDate === today) return prev;
  const y = new Date(Date.UTC(Math.floor(seed / 10000), (Math.floor(seed / 100) % 100) - 1, (seed % 100) - 1));
  const yesterday = y.toISOString().slice(0, 10);
  const currentStreak = prev.lastPlayedDate === yesterday ? prev.currentStreak + 1 : 1;
  return { currentStreak, maxStreak: Math.max(prev.maxStreak, currentStreak), lastPlayedDate: today };
}
