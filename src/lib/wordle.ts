/**
 * 일일 단어 퍼즐(워들) 로직.
 *
 * - 한글: 단어를 두벌식 자판에서 누르는 순서의 자모로 풀어 6칸으로 맞춘다.
 *   겹모음(ㅘ→ㅗㅏ)과 겹받침(ㄳ→ㄱㅅ)은 두 칸, 된소리(ㄲ)는 한 칸.
 * - 영어: 알파벳 5칸.
 * - 날짜는 사용자 기기의 현지 날짜 기준(정답 선택과 기록 저장 모두 같은 기준).
 */

export type Lang = 'ko' | 'en';
export type TileStatus = 'correct' | 'present' | 'absent';

export const WORD_LENGTH: Record<Lang, number> = { ko: 6, en: 5 };
export const MAX_GUESSES = 6;

const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('');
const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅗㅏ', 'ㅗㅐ', 'ㅗㅣ', 'ㅛ', 'ㅜ', 'ㅜㅓ', 'ㅜㅔ', 'ㅜㅣ', 'ㅠ', 'ㅡ', 'ㅡㅣ', 'ㅣ'];
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄱㅅ', 'ㄴ', 'ㄴㅈ', 'ㄴㅎ', 'ㄷ', 'ㄹ', 'ㄹㄱ', 'ㄹㅁ', 'ㄹㅂ', 'ㄹㅅ', 'ㄹㅌ', 'ㄹㅍ', 'ㄹㅎ', 'ㅁ', 'ㅂ', 'ㅂㅅ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const VOWELS = new Set('ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅛㅜㅠㅡㅣ');

export const isVowel = (j: string) => VOWELS.has(j);

/** 한글 단어 → 자모 배열 (두벌식 입력 순서) */
export function decompose(word: string): string[] {
  return [...word].flatMap(ch => {
    const c = ch.charCodeAt(0) - 0xac00;
    if (c < 0 || c > 11171) return [ch];
    return [...(CHO[Math.floor(c / 588)] + JUNG[Math.floor((c % 588) / 28)] + JONG[c % 28])];
  });
}

/** 자모 배열 → 화면 표시용 글자 (완성되지 않은 자모는 그대로 둔다) */
export function compose(jamo: string[]): string {
  let out = '';
  let i = 0;
  while (i < jamo.length) {
    const cho = CHO.indexOf(jamo[i]);
    if (cho < 0 || !isVowel(jamo[i + 1] ?? '')) { out += jamo[i]; i++; continue; }
    // 중성: 다음 모음과 합쳐 겹모음이 되면 합친다
    let jung = JUNG.indexOf(jamo[i + 1]);
    let k = i + 2;
    const pair = JUNG.indexOf(jamo[i + 1] + (jamo[k] ?? ''));
    if (pair >= 0 && isVowel(jamo[k] ?? '')) { jung = pair; k++; }
    // 종성: 뒤에 모음이 오면 다음 글자의 초성이므로 받침으로 쓰지 않는다
    const startsSyllable = (n: number) => CHO.includes(jamo[n] ?? '') && isVowel(jamo[n + 1] ?? '');
    let jong = 0;
    if (k < jamo.length && !isVowel(jamo[k]) && !startsSyllable(k)) {
      const two = JONG.indexOf(jamo[k] + (jamo[k + 1] ?? ''));
      if (two > 0 && k + 1 < jamo.length && !isVowel(jamo[k + 1]) && !startsSyllable(k + 1)) { jong = two; k += 2; }
      else if (JONG.indexOf(jamo[k]) > 0) { jong = JONG.indexOf(jamo[k]); k++; }
    }
    out += String.fromCharCode(0xac00 + cho * 588 + jung * 28 + jong);
    i = k;
  }
  return out;
}

/** 정답과 비교해 칸별 색을 정한다 (같은 글자가 여러 번 나오는 경우 원본 워들 규칙) */
export function evaluate(guess: string[], answer: string[]): TileStatus[] {
  const result: TileStatus[] = guess.map(() => 'absent');
  const left = [...answer];
  guess.forEach((g, i) => { if (g === answer[i]) { result[i] = 'correct'; left[i] = ''; } });
  guess.forEach((g, i) => {
    if (result[i] === 'correct') return;
    const at = left.indexOf(g);
    if (at >= 0) { result[i] = 'present'; left[at] = ''; }
  });
  return result;
}

/** 자판 색: 초록 > 노랑 > 회색 순으로 가장 좋은 결과를 남긴다 */
export function keyStatuses(guesses: string[][], answer: string[]): Record<string, TileStatus> {
  const rank = { absent: 0, present: 1, correct: 2 } as const;
  const keys: Record<string, TileStatus> = {};
  for (const g of guesses) {
    evaluate(g, answer).forEach((st, i) => {
      const prev = keys[g[i]];
      if (!prev || rank[st] > rank[prev]) keys[g[i]] = st;
    });
  }
  return keys;
}

const DAY_MS = 86_400_000;
const EPOCH = Date.UTC(2026, 0, 1);

/** 현지 날짜 기준 퍼즐 번호 (2026-01-01 = 1번) */
export function dayNumber(now = new Date()): number {
  return Math.round((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - EPOCH) / DAY_MS) + 1;
}

/** 시드로 섞은 순서 (매일 같은 순서로 정답이 나오되, 목록 순서가 드러나지 않게) */
function shuffled<T>(list: readonly T[], seed: number): T[] {
  const a = [...list];
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const orderCache = new Map<readonly string[], string[]>();
export function answerFor(day: number, answers: readonly string[]): string {
  let order = orderCache.get(answers);
  if (!order) { order = shuffled(answers, 20260101); orderCache.set(answers, order); }
  return order[(((day - 1) % order.length) + order.length) % order.length];
}

/** 단어를 칸 단위 배열로 */
export const toTiles = (lang: Lang, word: string) => (lang === 'ko' ? decompose(word) : [...word.toUpperCase()]);

export interface Stats {
  played: number;
  won: number;
  streak: number;
  maxStreak: number;
  lastWinDay: number;
  /** 몇 번째에 맞혔는지 분포 (1~6번째) */
  dist: number[];
}

export const emptyStats = (): Stats => ({ played: 0, won: 0, streak: 0, maxStreak: 0, lastWinDay: 0, dist: [0, 0, 0, 0, 0, 0] });

/** 게임 종료 시 기록 갱신. 실패하면 연승은 0 */
export function recordResult(stats: Stats, day: number, won: boolean, tries: number): Stats {
  const next: Stats = { ...stats, dist: [...stats.dist], played: stats.played + 1 };
  if (won) {
    next.won += 1;
    next.streak = stats.lastWinDay === day - 1 ? stats.streak + 1 : 1;
    next.maxStreak = Math.max(stats.maxStreak, next.streak);
    next.lastWinDay = day;
    next.dist[tries - 1] += 1;
  } else {
    next.streak = 0;
  }
  return next;
}

/** 어제도 이기지 못했다면 화면의 연승은 0으로 본다 */
export const liveStreak = (stats: Stats, day: number) => (stats.lastWinDay >= day - 1 ? stats.streak : 0);
