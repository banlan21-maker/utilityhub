/**
 * 타일·도배지 소요량.
 *
 * 타일
 * - 바닥·벽은 실제 배치를 따라 장수를 센다(잘리는 장도 1장). 엇갈림 시공은 줄마다 밀린 만큼 끝에 1장이 더 들어간다.
 * - 대각선(45°) 시공은 가장자리가 모두 삼각형으로 잘려 면적 기준 장수에 15%를 더한다(현장 경험치).
 * - 여기에 파손·보수용 여유분(%)을 더하고 박스 단위로 올린다.
 *
 * 도배
 * - 벽: 둘레 ÷ 벽지 폭 = 폭 수(올림), 문 폭만큼은 빼고, 창 위아래 짧은 조각은 자투리로 쓴다고 본다.
 * - 폭 길이 = 층고 + 재단 여유 10cm. 무늬 벽지는 무늬 반복 길이의 배수로 올린다.
 * - 천장: 긴 방향으로 붙이고 짧은 쪽 ÷ 벽지 폭 = 폭 수.
 * - 여유분(%)은 폭 수에 더하고(올림), 롤 수는 필요한 폭들을 롤에 실제로 잘라 담아(긴 것부터) 센다.
 * - 평수 간이 계산: 아파트 도배 면적 ≈ 분양평수 × 2.5 또는 실평수 × 3 (천장 포함, 업계 환산).
 */

export const SQM_PER_PYEONG = 400 / 121;

// ───────── 타일 ─────────

export type TilePattern = 'grid' | 'half' | 'third' | 'diagonal';
export const DIAGONAL_EXTRA = 0.15;

export interface TileSpec { w: number; h: number; gap: number } // mm

/** 한 직사각형 면(mm)에 깔리는 타일 배치 */
export interface Placed { x: number; y: number; w: number; h: number; cut: boolean }

/** 줄마다 밀리는 비율 */
const offsetStep = (p: TilePattern) => (p === 'half' ? 1 / 2 : p === 'third' ? 1 / 3 : 0);

/**
 * 직사각형 면 A×B(mm)에 타일을 깔 때 들어가는 장수(잘리는 장 포함).
 * placements는 그림용(최대 limit개).
 */
export function layRect(A: number, B: number, t: TileSpec, pattern: TilePattern, limit = 3000) {
  const ew = t.w + t.gap, eh = t.h + t.gap;
  const rows = Math.ceil((B + t.gap) / eh - 1e-9);
  const step = offsetStep(pattern);
  const placed: Placed[] = [];
  let count = 0, cut = 0;
  for (let r = 0; r < rows; r++) {
    // 엇갈림: 줄마다 step만큼 왼쪽으로 밀어 시작
    const shift = step ? ((r * step) % 1) * ew : 0;
    const y = r * eh;
    const n = Math.ceil((A + t.gap + shift) / ew - 1e-9);
    for (let c = 0; c < n; c++) {
      const x = c * ew - shift;
      const isCut = x < -0.1 || x + t.w > A + 0.1 || y + t.h > B + 0.1;
      count++;
      if (isCut) cut++;
      if (placed.length < limit) placed.push({ x, y, w: t.w, h: t.h, cut: isCut });
    }
  }
  return { count, cut, placed, truncated: count > limit };
}

/** 면적(㎡)만으로 셀 때 (대각선·직접 입력) */
export const countByArea = (areaM2: number, t: TileSpec) => Math.ceil((areaM2 * 1e6) / ((t.w + t.gap) * (t.h + t.gap)) - 1e-9);

export interface Opening { w: number; h: number; count: number } // m

/** 벽 위 개구부 자리에 통째로 들어가지 않는 타일 수 (개구부 안에 완전히 들어가는 장만 뺀다) */
export function tilesSavedByOpening(o: Opening, t: TileSpec) {
  const ew = t.w + t.gap, eh = t.h + t.gap;
  return Math.max(0, Math.floor((o.w * 1000) / ew)) * Math.max(0, Math.floor((o.h * 1000) / eh)) * o.count;
}

export interface TileOrder { pieces: number; withSpare: number; boxes: number; orderPieces: number; areaM2: number; orderM2: number; lossPct: number }

export function tileOrder(pieces: number, areaM2: number, t: TileSpec, sparePct: number, perBox: number): TileOrder {
  const withSpare = Math.ceil(pieces * (1 + Math.max(0, sparePct) / 100) - 1e-9);
  const box = Math.max(1, Math.round(perBox));
  const boxes = Math.ceil(withSpare / box);
  const orderPieces = boxes * box;
  const orderM2 = (orderPieces * t.w * t.h) / 1e6;
  return { pieces, withSpare, boxes, orderPieces, areaM2, orderM2, lossPct: areaM2 > 0 ? (orderM2 / areaM2 - 1) * 100 : 0 };
}

/** 박스 1.44㎡ 기준 장수 (600×600 → 4장, 300×600 → 8장) */
export const defaultPerBox = (t: TileSpec) => Math.max(1, Math.round(1.44e6 / (t.w * t.h)));

// ───────── 도배 ─────────

export interface RollSpec { width: number; length: number } // m
export const PAPERS: { id: string; ko: string; en: string; roll: RollSpec }[] = [
  { id: 'silk', ko: '실크벽지 (106cm × 15.6m, 약 5평)', en: 'Silk/vinyl (1.06 m × 15.6 m)', roll: { width: 1.06, length: 15.6 } },
  { id: 'wide', ko: '광폭 합지 (93cm × 17.75m, 약 5평)', en: 'Wide paper (0.93 m × 17.75 m)', roll: { width: 0.93, length: 17.75 } },
  { id: 'narrow', ko: '소폭 합지 (53cm × 12.5m, 약 2평)', en: 'Narrow paper (0.53 m × 12.5 m)', roll: { width: 0.53, length: 12.5 } },
];
export const TRIM = 0.1;

/** 폭 1장 재단 길이: 높이 + 여유, 무늬가 있으면 반복 길이의 배수로 올림 */
export function stripLength(height: number, repeat: number) {
  const raw = height + TRIM;
  return repeat > 0 ? Math.ceil(raw / repeat - 1e-9) * repeat : raw;
}

/** 필요한 폭들을 롤에 긴 것부터 잘라 담아 롤 수를 센다 */
export function packRolls(strips: number[], rollLength: number) {
  const sorted = [...strips].sort((a, b) => b - a);
  const rolls: number[] = []; // 남은 길이
  const layout: number[][] = []; // 롤마다 잘라 낸 폭 길이들
  for (const len of sorted) {
    if (len > rollLength) return null;
    const i = rolls.findIndex(left => left >= len - 1e-9);
    if (i >= 0) { rolls[i] -= len; layout[i].push(len); } else { rolls.push(rollLength - len); layout.push([len]); }
  }
  return { rolls: rolls.length, leftover: rolls.reduce((a, b) => a + b, 0), layout };
}

export interface RoomInput {
  width: number; depth: number; height: number; // m
  ceiling: boolean;
  doors: Opening;   // 문: 폭만큼 벽 폭 수에서 뺀다
  windows: Opening; // 창: 면적 표시에만 반영(위아래 조각은 자투리 사용)
  repeat: number;   // 무늬 반복(m), 단색 0
}

export interface PaperResult {
  wallStrips: number; ceilingStrips: number; wallStripLen: number; ceilingStripLen: number;
  spareStrips: number; stripsPerRoll: number; rolls: number;
  /** 여유분 없이 딱 맞게 */
  rollsNoSpare: number;
  /** 롤마다 잘라 낸 폭 길이(그림용) */
  layout: number[][];
  coverM2: number; boughtM2: number; lossPct: number;
}

export function paperForRoom(r: RoomInput, roll: RollSpec, sparePct: number): PaperResult | { error: 'tooTall' } | null {
  if (!(r.width > 0 && r.depth > 0 && r.height > 0 && roll.width > 0 && roll.length > 0)) return null;
  const perimeter = 2 * (r.width + r.depth);
  const doorWidth = r.doors.w * r.doors.count;
  const wallStrips = Math.max(0, Math.ceil(perimeter / roll.width - 1e-9) - Math.floor(doorWidth / roll.width + 1e-9));
  const wallStripLen = stripLength(r.height, r.repeat);
  const long = Math.max(r.width, r.depth), short = Math.min(r.width, r.depth);
  const ceilingStrips = r.ceiling ? Math.ceil(short / roll.width - 1e-9) : 0;
  const ceilingStripLen = stripLength(long, r.repeat);
  if (wallStripLen > roll.length || (r.ceiling && ceilingStripLen > roll.length)) return { error: 'tooTall' };
  // 여유 폭은 벽 길이로 더한다 (보수·재단 실수 대비)
  const spareStrips = Math.ceil((wallStrips + ceilingStrips) * (Math.max(0, sparePct) / 100) - 1e-9);
  const bare = packRolls([...Array(wallStrips).fill(wallStripLen), ...Array(ceilingStrips).fill(ceilingStripLen)], roll.length)!;
  const packed = packRolls([...Array(wallStrips + spareStrips).fill(wallStripLen), ...Array(ceilingStrips).fill(ceilingStripLen)], roll.length)!;
  const coverM2 = perimeter * r.height - r.doors.w * r.doors.h * r.doors.count - r.windows.w * r.windows.h * r.windows.count + (r.ceiling ? r.width * r.depth : 0);
  const boughtM2 = packed.rolls * roll.width * roll.length;
  return {
    wallStrips, ceilingStrips, wallStripLen, ceilingStripLen,
    spareStrips, stripsPerRoll: Math.floor(roll.length / wallStripLen + 1e-9), rolls: packed.rolls, rollsNoSpare: bare.rolls, layout: packed.layout,
    coverM2, boughtM2, lossPct: coverM2 > 0 ? (boughtM2 / coverM2 - 1) * 100 : 0,
  };
}

/** 평수 간이 계산: 분양평수 × 2.5 또는 실평수 × 3 = 도배 면적(평, 천장 포함) */
export function paperByPyeong(pyeong: number, basis: 'supply' | 'exclusive', roll: RollSpec, sparePct: number) {
  if (!(pyeong > 0)) return null;
  const areaPyeong = pyeong * (basis === 'supply' ? 2.5 : 3);
  const rollPyeong = (roll.width * roll.length) / SQM_PER_PYEONG;
  const exact = areaPyeong / rollPyeong;
  const rolls = Math.ceil(exact * (1 + Math.max(0, sparePct) / 100) - 1e-9);
  return { areaPyeong, areaM2: areaPyeong * SQM_PER_PYEONG, rollPyeong, exactRolls: exact, rolls };
}
