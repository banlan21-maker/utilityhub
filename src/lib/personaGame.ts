// 페르소나 카드 — 게임 규칙 (뽑기·섞기·점수). 화면 없이 계산만 하므로 노드에서 바로 검증할 수 있다.
//
// 점수 (상황마다):
//   원점수 = 판단 점수(40 + 선택지 baseScore × 0.3 → 좋은 답 70, 나쁜 답 40) + 캐릭터 보너스 − 반대 감점
//   캐릭터 보너스: 성격 18 · 특기 10 · 직업 6. 태그가 정확히 같으면 전부, 같은 계열이면 절반.
//   반대 감점: 선택지에 '반대_내카드id' 가 있으면 −15 (그 캐릭터라면 하지 않을 행동)
//   표시 점수 = 그 상황에서 가장 좋은 선택 100점, 가장 나쁜 선택 0점이 되도록 환산 → 10개 상황 합계 0~1000
// 그래서 "상식적으로 좋은 답"이 기본이지만, 캐릭터에 따라 최선의 답이 달라진다 (한 판에 평균 2개 안팎).
import { JOBS, MISSIONS, OBVIOUS_OVERLAP, PERSONALITIES, SKILLS, type Card, type Choice, type Mission, type Situation } from './persona-data';

export interface Character { job: Card; personality: Card; skill: Card }

export const WEIGHTS = { personality: 18, skill: 10, job: 6, related: 0.5, opposite: 15 };

/** 성격 계열 — 같은 줄이면 "비슷한 성향"으로 보너스 절반 */
export const PERSONALITY_GROUPS: string[][] = [
  ['cautious', 'coward', 'pessimist', 'perfectionist'],
  ['brave', 'impulsive', 'stubborn', 'optimist'],
  ['genius', 'curious', 'creative', 'mysterious'],
  ['talkative', 'honest', 'kindhearted'],
  ['greedy', 'selfish', 'sneaky'],
  ['lazy', 'clumsy'],
];
/** 특기·직업 계열 — 직업과 특기를 한데 묶는다 (엔지니어 ↔ 발명·건축 등) */
export const ABILITY_GROUPS: string[][] = [
  ['hacking', 'inventing', 'building', 'hacker', 'engineer', 'scientist', 'astronaut', 'pilot'],
  ['running', 'fighting', 'athlete', 'knight', 'pirate'],
  ['hiding', 'lying', 'tracking', 'sensing', 'navigation', 'spy', 'detective', 'ninja', 'explorer'],
  ['persuasion', 'negotiation', 'singing', 'teacher', 'musician'],
  ['cooking', 'healing', 'farming', 'eating', 'chef', 'doctor', 'farmer'],
  ['drawing', 'magic', 'sleeping', 'artist', 'magician', 'archaeologist'],
];
const groupOf = (groups: string[][], id: string) => groups.find((g) => g.includes(id)) ?? [id];

/* ── 날짜 시드·난수 ── */

/** 한국 시간 기준 YYYYMMDD — 모두가 같은 날 같은 캐릭터·미션을 받는다 */
export function dailySeed(now: Date = new Date()): number {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.getUTCFullYear() * 10000 + (kst.getUTCMonth() + 1) * 100 + kst.getUTCDate();
}

/** (날짜, 용도 번호) → 0 이상 1 미만. 용도마다 서로 무관한 값이 나온다
 *  (예전 Math.sin(seed + index) 방식은 "오늘 성격 번호 = 내일 직업 번호"로 하루씩 밀렸다) */
export function rand(seed: number, salt: number): number {
  let x = (Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul((salt + 1) | 0, 0x85ebca6b)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
  x = Math.imul(x ^ (x >>> 15), 0x735a2d97);
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}

export interface DailySetup {
  seed: number;
  character: Character;
  mission: Mission;
  /** 상황마다 선택지를 보여 줄 순서 (원래 번호 0~3 의 순열). 데이터는 좋은 답부터 적혀 있어 반드시 섞는다 */
  order: number[][];
}

export function dailySetup(seed: number = dailySeed()): DailySetup {
  const job = JOBS[Math.floor(rand(seed, 1) * JOBS.length)];
  const personality = PERSONALITIES[Math.floor(rand(seed, 2) * PERSONALITIES.length)];
  let si = Math.floor(rand(seed, 3) * SKILLS.length);
  // 직업과 뻔하게 겹치는 특기(요리사 + 요리)는 다음 특기로
  if (OBVIOUS_OVERLAP[job.id] === SKILLS[si].id) si = (si + 1) % SKILLS.length;
  const playable = MISSIONS.filter((m) => m.situations.length > 0);
  const mission = playable[seed % playable.length]; // 하루에 하나씩 차례로
  const order = mission.situations.map((s, i) => shuffled(s.choices.length, seed, 100 + i * 10));
  return { seed, character: { job, personality, skill: SKILLS[si] }, mission, order };
}

function shuffled(n: number, seed: number, salt: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand(seed, salt + i) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── 점수 ── */

export type Fit = 'exact' | 'related' | null;
export interface Breakdown {
  judgment: number;
  personality: Fit; skill: Fit; job: Fit;
  /** 캐릭터 보너스 합 (감점 전) */
  bonus: number;
  opposite: boolean;
  raw: number;
}

export function breakdown(choice: Choice, ch: Character): Breakdown {
  const fit = (id: string, groups: string[][]): Fit =>
    choice.tags.includes(id) ? 'exact' : choice.tags.some((t) => groupOf(groups, id).includes(t)) ? 'related' : null;
  const pts = (f: Fit, w: number) => (f === 'exact' ? w : f === 'related' ? w * WEIGHTS.related : 0);
  const personality = fit(ch.personality.id, PERSONALITY_GROUPS);
  const skill = fit(ch.skill.id, ABILITY_GROUPS);
  const job = fit(ch.job.id, ABILITY_GROUPS);
  const opposite = [ch.personality.id, ch.skill.id, ch.job.id].some((id) => choice.tags.includes('반대_' + id));
  const judgment = 40 + choice.baseScore * 0.3;
  const bonus = pts(personality, WEIGHTS.personality) + pts(skill, WEIGHTS.skill) + pts(job, WEIGHTS.job);
  return { judgment, personality, skill, job, bonus, opposite, raw: Math.max(0, judgment + bonus - (opposite ? WEIGHTS.opposite : 0)) };
}

export interface Scored { points: number; detail: Breakdown }

/** 한 상황의 선택지 4개 점수 (원래 번호 순서). 가장 좋은 선택 100, 가장 나쁜 선택 0 */
export function scoreSituation(s: Situation, ch: Character): Scored[] {
  const d = s.choices.map((c) => breakdown(c, ch));
  const max = Math.max(...d.map((x) => x.raw)), min = Math.min(...d.map((x) => x.raw));
  return d.map((detail) => ({ detail, points: max === min ? 100 : Math.round(((detail.raw - min) / (max - min)) * 100) }));
}

/** 캐릭터 활용도(%): 고른 선택에서 얻은 캐릭터 보너스 ÷ 상황마다 얻을 수 있던 최대 보너스 */
export function usagePercent(picked: Breakdown[], available: number[]): number {
  const got = picked.reduce((a, b) => a + b.bonus, 0);
  const max = available.reduce((a, b) => a + b, 0);
  return max > 0 ? Math.round(Math.min(1, got / max) * 100) : 0;
}

export const cardById = (id: string): Card | undefined => [...JOBS, ...PERSONALITIES, ...SKILLS].find((c) => c.id === id);
export const missionById = (id: string): Mission | undefined => MISSIONS.find((m) => m.id === id);

/** 점수 등급 (0~4, 높을수록 좋음).
 *  전 캐릭터 × 미션 모의 결과: 무작위로 고르면 평균 526(441~644), 상식만 따르면 평균 961, 캐릭터까지 읽으면 1000.
 *  → 4등급(만점)은 캐릭터를 다 읽어야 나오고, 무작위는 0~1등급에 머문다 */
export const GRADE_MIN = [0, 550, 750, 900, 1000] as const;
export const gradeOf = (score: number) => GRADE_MIN.reduce<number>((g, min, i) => (score >= min ? i : g), 0);
