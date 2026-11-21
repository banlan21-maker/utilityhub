// 데일리 게임 공통 — 한국 날짜 시드와 난수. 같은 날에는 누구에게나 같은 판이 나온다.

/** 한국 시간 기준 YYYYMMDD (한국 자정에 바뀐다) */
export function dailySeed(now: Date = new Date()): number {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.getUTCFullYear() * 10000 + (kst.getUTCMonth() + 1) * 100 + kst.getUTCDate();
}

/** (날짜, 용도 번호) → 0 이상 1 미만. 날짜나 번호가 1만 달라도 서로 무관한 값이 나온다.
 *  (예전 방식들은 그렇지 않았다 — sin(seed + index) 는 하루씩 밀렸고, 문자열 해시는 한 달 내내 같은 값이 나왔다) */
export function rand(seed: number, salt: number): number {
  let x = (Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul((salt + 1) | 0, 0x85ebca6b)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
  x = Math.imul(x ^ (x >>> 15), 0x735a2d97);
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}

/** 20261121 → '2026-11-21' */
export const seedToDate = (seed: number) =>
  `${Math.floor(seed / 10000)}-${String(Math.floor(seed / 100) % 100).padStart(2, '0')}-${String(seed % 100).padStart(2, '0')}`;

/** 한국 자정까지 남은 시간(ms) */
export function msUntilNextDay(now: Date = new Date()): number {
  const kst = now.getTime() + 9 * 60 * 60 * 1000;
  return 86400000 - (kst % 86400000);
}
