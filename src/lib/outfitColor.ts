// OOTD 컬러 코디네이터의 색 계산 (화면과 분리해 검증 가능하게 둔다)

export type SlotKey = 'hat' | 'outer' | 'top' | 'bottom' | 'shoes';
export type LookType = 'daily' | 'point' | 'soft';
export type SeasonKey = 'all' | 'spring' | 'summer' | 'autumn' | 'winter';

export interface SlotState { color: string; active: boolean; optional: boolean }
export type SlotsMap = Record<SlotKey, SlotState>;
export interface NamedColor { hex: string; ko: string; en: string }

export const SLOT_ORDER: SlotKey[] = ['hat', 'outer', 'top', 'bottom', 'shoes'];

// ── 기본 팔레트: 실제 옷장에 많은 색 위주 (데님·차콜·크림 포함) ──
export const PALETTE: { ko: string; en: string; colors: NamedColor[] }[] = [
  { ko: '뉴트럴', en: 'Neutrals', colors: [
    { hex: '#FFFFFF', ko: '화이트', en: 'White' },
    { hex: '#F3EEDF', ko: '아이보리', en: 'Ivory' },
    { hex: '#CFD3D8', ko: '라이트그레이', en: 'Light gray' },
    { hex: '#8A8F98', ko: '그레이', en: 'Gray' },
    { hex: '#4A4E55', ko: '차콜', en: 'Charcoal' },
    { hex: '#1E1F23', ko: '블랙', en: 'Black' },
  ] },
  { ko: '어스 톤', en: 'Earth tones', colors: [
    { hex: '#D9C4A3', ko: '베이지', en: 'Beige' },
    { hex: '#B98A5A', ko: '카멜', en: 'Camel' },
    { hex: '#6A4630', ko: '브라운', en: 'Brown' },
    { hex: '#9A8F67', ko: '카키', en: 'Khaki' },
    { hex: '#6B7346', ko: '올리브', en: 'Olive' },
    { hex: '#2F5D46', ko: '포레스트그린', en: 'Forest green' },
  ] },
  { ko: '블루·데님', en: 'Blues & denim', colors: [
    { hex: '#1F3354', ko: '네이비', en: 'Navy' },
    { hex: '#4A6A94', ko: '중청 데님', en: 'Mid denim' },
    { hex: '#8FA9C8', ko: '연청 데님', en: 'Light denim' },
    { hex: '#A9CBE6', ko: '스카이블루', en: 'Sky blue' },
  ] },
  { ko: '포인트', en: 'Accents', colors: [
    { hex: '#6E2734', ko: '버건디', en: 'Burgundy' },
    { hex: '#C0392B', ko: '레드', en: 'Red' },
    { hex: '#C0643F', ko: '테라코타', en: 'Terracotta' },
    { hex: '#CF9F2A', ko: '머스터드', en: 'Mustard' },
    { hex: '#F1E2A0', ko: '버터옐로', en: 'Butter yellow' },
    { hex: '#EE8A72', ko: '코랄', en: 'Coral' },
    { hex: '#F2B8C6', ko: '핑크', en: 'Pink' },
    { hex: '#C3B5DD', ko: '라벤더', en: 'Lavender' },
    { hex: '#A8D5C2', ko: '민트', en: 'Mint' },
  ] },
];

// ── 퍼스널 컬러 4계절 (언더톤 웜/쿨 × 명도·채도) ──
export const SEASONS: Record<Exclude<SeasonKey, 'all'>, { ko: string; en: string; noteKo: string; noteEn: string; colors: NamedColor[] }> = {
  spring: {
    ko: '봄 웜', en: 'Spring (warm)',
    noteKo: '노란 기가 도는 밝고 맑은 색. 아이보리·코랄·피치처럼 따뜻하고 가벼운 색이 얼굴을 환하게 합니다. 회색빛 탁한 색과 새까만 검정은 얼굴 가까이에서 피하는 편이 좋습니다.',
    noteEn: 'Warm, light and clear colors. Ivory, coral and peach brighten the face; dusty grayish tones and jet black are best kept away from the face.',
    colors: [
      { hex: '#FFF8E7', ko: '크림화이트', en: 'Cream white' },
      { hex: '#F6EED9', ko: '아이보리', en: 'Ivory' },
      { hex: '#E3C9A6', ko: '라이트베이지', en: 'Light beige' },
      { hex: '#C49A6C', ko: '카멜', en: 'Camel' },
      { hex: '#F7B89A', ko: '피치', en: 'Peach' },
      { hex: '#EE8A72', ko: '코랄', en: 'Coral' },
      { hex: '#F4A6A0', ko: '살몬핑크', en: 'Salmon pink' },
      { hex: '#F2CF5B', ko: '웜옐로', en: 'Warm yellow' },
      { hex: '#9BC56A', ko: '애플그린', en: 'Apple green' },
      { hex: '#3FB8AF', ko: '터쿼이즈', en: 'Turquoise' },
      { hex: '#3B4E78', ko: '웜네이비', en: 'Warm navy' },
      { hex: '#9A6A3A', ko: '골든브라운', en: 'Golden brown' },
    ],
  },
  summer: {
    ko: '여름 쿨', en: 'Summer (cool)',
    noteKo: '푸른 기가 도는 밝고 부드러운 색. 라벤더·파우더블루·로즈핑크처럼 회색이 살짝 섞인 파스텔이 잘 어울립니다. 오렌지·머스터드처럼 노란 기가 강한 색은 피하는 편이 좋습니다.',
    noteEn: 'Cool, light and soft colors. Lavender, powder blue and rose pink with a touch of gray suit best; strongly yellow colors such as orange and mustard are harder to wear.',
    colors: [
      { hex: '#F4F4F2', ko: '소프트화이트', en: 'Soft white' },
      { hex: '#C9CDD3', ko: '라이트그레이', en: 'Light gray' },
      { hex: '#7D8CA3', ko: '블루그레이', en: 'Blue gray' },
      { hex: '#3E4A61', ko: '그레이네이비', en: 'Gray navy' },
      { hex: '#A9C6E8', ko: '파우더블루', en: 'Powder blue' },
      { hex: '#9CC7E4', ko: '스카이블루', en: 'Sky blue' },
      { hex: '#C3B5DD', ko: '라벤더', en: 'Lavender' },
      { hex: '#E7A9BE', ko: '로즈핑크', en: 'Rose pink' },
      { hex: '#B58AA0', ko: '모브', en: 'Mauve' },
      { hex: '#C4587A', ko: '라즈베리', en: 'Raspberry' },
      { hex: '#A8D5C2', ko: '민트', en: 'Mint' },
      { hex: '#8E6F6A', ko: '로즈브라운', en: 'Rose brown' },
    ],
  },
  autumn: {
    ko: '가을 웜', en: 'Autumn (warm)',
    noteKo: '노란 기가 도는 깊고 차분한 색. 카멜·올리브·머스터드·테라코타 같은 어스 톤이 얼굴에 깊이를 줍니다. 형광기 있는 원색과 차가운 파스텔은 피하는 편이 좋습니다.',
    noteEn: 'Warm, deep and muted colors. Earth tones such as camel, olive, mustard and terracotta add depth; neon brights and icy pastels are harder to wear.',
    colors: [
      { hex: '#F1E6CF', ko: '크림', en: 'Cream' },
      { hex: '#D9C4A3', ko: '베이지', en: 'Beige' },
      { hex: '#B98A5A', ko: '카멜', en: 'Camel' },
      { hex: '#6A4630', ko: '브라운', en: 'Brown' },
      { hex: '#9A8F67', ko: '카키', en: 'Khaki' },
      { hex: '#6B7346', ko: '올리브', en: 'Olive' },
      { hex: '#2F5D46', ko: '포레스트그린', en: 'Forest green' },
      { hex: '#2E6E6A', ko: '딥틸', en: 'Deep teal' },
      { hex: '#CF9F2A', ko: '머스터드', en: 'Mustard' },
      { hex: '#C0643F', ko: '테라코타', en: 'Terracotta' },
      { hex: '#A0482A', ko: '러스트', en: 'Rust' },
      { hex: '#7E3A2E', ko: '브릭레드', en: 'Brick red' },
    ],
  },
  winter: {
    ko: '겨울 쿨', en: 'Winter (cool)',
    noteKo: '푸른 기가 도는 선명하고 대비가 강한 색. 블랙·퓨어화이트·로열블루·와인처럼 또렷한 색이 잘 어울립니다. 베이지·카멜처럼 누런 중간색은 얼굴을 칙칙하게 만들 수 있습니다.',
    noteEn: 'Cool, clear and high-contrast colors. Black, pure white, royal blue and wine look sharp; yellowish mid-tones such as beige and camel can look dull near the face.',
    colors: [
      { hex: '#FFFFFF', ko: '퓨어화이트', en: 'Pure white' },
      { hex: '#B7BCC4', ko: '실버그레이', en: 'Silver gray' },
      { hex: '#4A4E55', ko: '차콜', en: 'Charcoal' },
      { hex: '#1E1F23', ko: '블랙', en: 'Black' },
      { hex: '#1F3354', ko: '네이비', en: 'Navy' },
      { hex: '#2D4FB3', ko: '로열블루', en: 'Royal blue' },
      { hex: '#D6E6F5', ko: '아이시블루', en: 'Icy blue' },
      { hex: '#F5D7E3', ko: '아이시핑크', en: 'Icy pink' },
      { hex: '#C8102E', ko: '트루레드', en: 'True red' },
      { hex: '#6E2734', ko: '와인', en: 'Wine' },
      { hex: '#C2185B', ko: '푸시아', en: 'Fuchsia' },
      { hex: '#0F7B5F', ko: '에메랄드', en: 'Emerald' },
    ],
  },
};

// 이름 찾기 전용 중간색 (커스텀·자동 생성 색에 가까운 이름을 붙이기 위함)
const EXTRA_NAMES: NamedColor[] = [
  { hex: '#A89F91', ko: '그레이지', en: 'Greige' },
  { hex: '#8B7D6B', ko: '토프', en: 'Taupe' },
  { hex: '#64748B', ko: '슬레이트그레이', en: 'Slate gray' },
  { hex: '#3B2A20', ko: '다크브라운', en: 'Dark brown' },
  { hex: '#2B3A4A', ko: '다크네이비', en: 'Dark navy' },
  { hex: '#E9DCC9', ko: '오트밀', en: 'Oatmeal' },
  { hex: '#5B6B3A', ko: '아미그린', en: 'Army green' },
  { hex: '#E07A3F', ko: '오렌지', en: 'Orange' },
  { hex: '#7B5EA7', ko: '퍼플', en: 'Purple' },
  { hex: '#3E7CB1', ko: '코발트블루', en: 'Cobalt blue' },
];

export const ALL_NAMED: NamedColor[] = [
  ...PALETTE.flatMap((g) => g.colors),
  ...Object.values(SEASONS).flatMap((s) => s.colors),
  ...EXTRA_NAMES,
];

// ── 색 변환 ──
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function hslToHex(h: number, s: number, l: number): string {
  const hN = ((h % 360) + 360) % 360;
  const sN = clamp(s, 0, 100) / 100;
  const lN = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs(((hN / 60) % 2) - 1));
  const m = lN - c / 2;
  const [r, g, b] =
    hN < 60 ? [c, x, 0] : hN < 120 ? [x, c, 0] : hN < 180 ? [0, c, x] :
    hN < 240 ? [0, x, c] : hN < 300 ? [x, 0, c] : [c, 0, x];
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/** CIE L* (0~100): 사람이 느끼는 밝기 */
export function lightness(hex: string): number {
  const lin = (v: number) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const [r, g, b] = hexToRgb(hex).map(lin);
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y;
}

/** 두 색의 차이 (RGB 가중 거리, 0~약 765) */
export function colorDistance(a: string, b: string): number {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const rm = (r1 + r2) / 2;
  return Math.sqrt((2 + rm / 256) * (r1 - r2) ** 2 + 4 * (g1 - g2) ** 2 + (2 + (255 - rm) / 256) * (b1 - b2) ** 2);
}

export function nearestName(hex: string): NamedColor & { exact: boolean } {
  let best = ALL_NAMED[0];
  let bestD = Infinity;
  for (const c of ALL_NAMED) {
    const d = colorDistance(hex, c.hex);
    if (d < bestD) { bestD = d; best = c; }
  }
  return { ...best, exact: bestD < 6 };
}

export const hueDiff = (a: number, b: number) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

/**
 * 색 성격 분류. 패션에서는 무채색뿐 아니라 베이지·카멜·브라운·카키, 네이비·데님도
 * 어디에나 어울리는 '기본색'으로 다룬다.
 */
export type ColorKind = 'neutral' | 'earth' | 'denim' | 'accent';
export function colorKind(hex: string): ColorKind {
  const [h, s, l] = hexToHsl(hex);
  if (s < 14 || l > 94 || l < 11 || (l > 88 && s < 55)) return 'neutral';
  if (h >= 15 && h <= 75 && s < 62 && l >= 14 && l <= 88 && !(s > 45 && l > 40 && l < 65)) return 'earth';
  if (h >= 195 && h <= 235 && s < 50 && l < 70) return 'denim';
  return 'accent';
}
export const isBasic = (hex: string) => colorKind(hex) !== 'accent';

/** 색 온도: 웜(빨강~노랑·어스 톤), 쿨(청록~보라), 중간 */
export function temperature(hex: string): 'warm' | 'cool' | 'neutral' {
  const k = colorKind(hex);
  if (k === 'neutral') return 'neutral';
  if (k === 'earth') return 'warm';
  if (k === 'denim') return 'cool';
  const [h] = hexToHsl(hex);
  if (h <= 70 || h >= 345) return 'warm';
  if (h >= 140 && h <= 320) return 'cool';
  return 'neutral';
}

// ── 룩 추천 ──
const N = {
  white: '#FFFFFF', ivory: '#F3EEDF', lightGray: '#CFD3D8', gray: '#8A8F98', charcoal: '#4A4E55', black: '#1E1F23',
  beige: '#D9C4A3', camel: '#B98A5A', brown: '#6A4630', navy: '#1F3354', denim: '#4A6A94', lightDenim: '#8FA9C8',
  sneaker: '#F5F5F2',
};

function pickAccentSlot(base: SlotKey, slots: SlotsMap): SlotKey {
  if (base !== 'hat' && slots.hat.active) return 'hat';
  if (base !== 'shoes') return 'shoes';
  return 'top';
}

/**
 * 선택한 아이템(base) 색을 고정하고 나머지 활성 아이템 색을 정한다.
 * 같은 룩을 다시 누르면 variant가 올라가 다른 조합이 나온다.
 */
export function computeLook(look: LookType, base: SlotKey, slots: SlotsMap, variant = 0): SlotsMap {
  const next: SlotsMap = { ...slots };
  const baseHex = slots[base].color;
  const [bh, bs, bl] = hexToHsl(baseHex);
  const L = lightness(baseHex);
  const light = L > 62;
  const warmBase = temperature(baseHex) === 'warm';
  const set = (k: SlotKey, hex: string) => {
    if (k === base || !slots[k].active) return;
    next[k] = { ...slots[k], color: hex.toUpperCase() };
  };
  const v = Math.abs(variant);

  if (look === 'daily') {
    // 뉴트럴 매치: 기준색과 명도 대비가 나는 기본색으로 나머지를 채운다
    const darkBottoms = [N.denim, N.charcoal, N.navy, N.black];
    const lightBottoms = warmBase ? [N.beige, N.ivory, N.lightDenim, N.lightGray] : [N.lightGray, N.lightDenim, N.ivory, N.beige];
    const lightTops = [N.white, N.ivory, N.lightGray, N.beige];
    const darkTops = [N.charcoal, N.navy, N.black, N.brown];
    const outers = light ? [N.charcoal, N.navy, N.camel, N.black] : [N.camel, N.beige, N.lightGray, N.charcoal];
    set('top', (light ? darkTops : lightTops)[v % 4]);
    set('bottom', (light ? darkBottoms : lightBottoms)[v % 4]);
    set('outer', outers[v % 4]);
    const bottomHex = base === 'bottom' ? baseHex : next.bottom.color;
    set('shoes', lightness(bottomHex) > 70 ? [N.black, N.brown][v % 2] : [N.sneaker, N.black][v % 2]);
    set('hat', [N.black, N.beige, N.navy, N.charcoal][v % 4]);
    // 상·하의가 같은 색이 되지 않도록
    if (base !== 'top' && base !== 'bottom' && next.top.color === next.bottom.color) set('bottom', N.denim);
  } else if (look === 'point') {
    // 나머지는 기본색, 작은 아이템 하나에 포인트 색
    let accent: string;
    if (isBasic(baseHex)) {
      const pool = warmBase ? ['#6E2734', '#2F5D46', '#CF9F2A', '#C0643F'] : ['#C0392B', '#CF9F2A', '#2D4FB3', '#0F7B5F'];
      accent = pool[v % pool.length];
    } else {
      // 보색(색상환 180°) — 패션에서 쓰기 좋은 채도·명도로 정리, variant마다 분할보색(±30°)
      const shift = [180, 150, 210][v % 3];
      accent = hslToHex(bh + shift, clamp(bs, 38, 72), clamp(100 - bl, 32, 62));
    }
    const accentSlot = pickAccentSlot(base, slots);
    const neutralTop = light ? N.charcoal : N.white;
    const neutralBottom = light ? N.navy : (warmBase ? N.beige : N.lightGray);
    set('top', neutralTop);
    set('bottom', base === 'top' && !light ? N.denim : neutralBottom);
    set('outer', light ? N.charcoal : N.camel);
    set('shoes', N.black);
    set('hat', N.black);
    set(accentSlot, accent);
  } else {
    // 소프트: 유사색·톤온톤 — 같은 계열에서 명도 단계만 바꾼다
    const dir = v % 2 === 0 ? 1 : -1;
    const kind = colorKind(baseHex);
    const sat = kind === 'accent' ? bs * 0.75 : kind === 'neutral' ? (v % 2 === 0 ? Math.min(bs, 8) : 16) : bs * 0.85;
    const baseHue = kind === 'neutral' && v % 2 === 1 ? 35 : bh;
    const hueScale = kind === 'accent' ? 1 : kind === 'neutral' ? 0 : 0.35;
    const steps: Partial<Record<SlotKey, [number, number]>> = {
      // [색상 이동, 명도 이동] — 밝은 기준색이면 나머지를 어둡게, 어두우면 밝게
      outer: [-18 * dir, light ? -22 : 24],
      top: [10 * dir, light ? -14 : 30],
      bottom: [-12 * dir, light ? -30 : 16],
      shoes: [-24 * dir, light ? -40 : -8],
      hat: [16 * dir, light ? -26 : 20],
    };
    for (const k of SLOT_ORDER) {
      const st = steps[k];
      if (!st) continue;
      set(k, hslToHex(baseHue + st[0] * hueScale, sat, clamp(bl + st[1], 12, 93)));
    }
  }
  // 아우터가 상의와 같은 색이면 겹쳐서 구분이 안 되므로 다른 기본색으로
  if (base !== 'outer' && slots.outer.active && colorDistance(next.outer.color, next.top.color) < 40) {
    const alt = [N.camel, N.navy, N.charcoal, N.beige, N.lightGray].find(
      (c) => colorDistance(c, next.top.color) > 60 && colorDistance(c, next.bottom.color) > 40,
    );
    if (alt) next.outer = { ...next.outer, color: alt };
  }
  return next;
}

// ── 조화 점검 ──
export type CheckLevel = 'good' | 'ok' | 'warn';
export interface HarmonyCheck { id: string; level: CheckLevel; ko: string; en: string }
export interface Harmony { verdict: CheckLevel; ko: string; en: string; checks: HarmonyCheck[] }

/** 색 계열로 묶기: 무채색은 밝기가 비슷하면 같은 색, 유채색은 색상 ±25° 안이면 같은 계열(톤온톤) */
function colorFamilies(hexes: string[]): string[] {
  const out: string[] = [];
  const same = (a: string, b: string) => {
    const [ha, sa] = hexToHsl(a);
    const [hb, sb] = hexToHsl(b);
    const chromA = colorKind(a) !== 'neutral' && sa >= 14;
    const chromB = colorKind(b) !== 'neutral' && sb >= 14;
    if (chromA && chromB) return hueDiff(ha, hb) <= 25;
    return colorDistance(a, b) < 40;
  };
  for (const h of hexes) if (!out.some((o) => same(o, h))) out.push(h);
  return out;
}

export function analyze(slots: SlotsMap, season: SeasonKey = 'all'): Harmony {
  const items = SLOT_ORDER.filter((k) => slots[k].active).map((k) => ({ k, hex: slots[k].color }));
  const hexes = items.map((i) => i.hex);
  const checks: HarmonyCheck[] = [];

  // 1) 색 개수 — 전신 3색 이내가 정돈돼 보인다는 일반적인 코디 원칙
  const n = colorFamilies(hexes).length;
  checks.push(n <= 3
    ? { id: 'count', level: 'good', ko: `색 계열 ${n}가지 — 3색 이내라 정돈돼 보입니다.`, en: `${n} color families — within the three-color rule, so it looks tidy.` }
    : n === 4
      ? { id: 'count', level: 'ok', ko: '색 계열 4가지 — 하나를 기본색(흰·검·네이비·베이지)으로 바꾸면 더 깔끔합니다.', en: '4 color families — swapping one for a basic (white, black, navy, beige) would look cleaner.' }
      : { id: 'count', level: 'warn', ko: `색 계열 ${n}가지 — 색이 많아 산만해 보일 수 있어요. 3색 이내로 줄여 보세요.`, en: `${n} color families — it may look busy. Try keeping it to three.` });

  // 2) 포인트 색
  const accents = colorFamilies(hexes.filter((h) => !isBasic(h)));
  const hues = accents.map((h) => hexToHsl(h)[0]);
  const complementary = accents.length === 2 && hueDiff(hues[0], hues[1]) >= 120;
  if (accents.length === 0) {
    checks.push({ id: 'accent', level: 'ok', ko: '포인트 색 없음 — 무난하지만 심심할 수 있어요. 모자나 신발 하나에 색을 넣어 보세요.', en: 'No accent color — safe but plain. Try one colored hat or pair of shoes.' });
  } else if (accents.length === 1) {
    checks.push({ id: 'accent', level: 'good', ko: '포인트 색 1가지 — 기본색 위에 한 색만 강조한 안정적인 구성입니다.', en: 'One accent color on basics — a balanced, easy-to-wear mix.' });
  } else if (accents.length === 2) {
    const d = hueDiff(hues[0], hues[1]);
    if (d <= 45) checks.push({ id: 'accent', level: 'good', ko: '포인트 색 2가지가 유사색이라 자연스럽게 이어집니다.', en: 'The two accent colors are analogous, so they blend naturally.' });
    else if (d >= 120) checks.push({ id: 'accent', level: 'ok', ko: '보색·분할보색 조합 — 눈에 띄는 대비입니다. 한 색은 면적을 작게(신발·모자) 두면 세련돼 보입니다.', en: 'Complementary or split-complementary pair — high impact. Keep one of them small (shoes, hat) for a polished look.' });
    else checks.push({ id: 'accent', level: 'warn', ko: '서로 관계없는 포인트 색 2가지 — 하나를 기본색으로 바꾸거나 같은 계열로 맞춰 보세요.', en: 'Two unrelated accent colors — change one to a basic or move them into the same family.' });
  } else {
    checks.push({ id: 'accent', level: 'warn', ko: `포인트 색 ${accents.length}가지 — 강조가 분산됩니다. 포인트는 1~2가지가 적당합니다.`, en: `${accents.length} accent colors — the focus gets scattered. One or two is plenty.` });
  }

  // 3) 상·하의 명도 대비
  const upper = slots.top.color;
  const lower = slots.bottom.color;
  const dL = Math.abs(lightness(upper) - lightness(lower));
  if (colorDistance(upper, lower) < 30) {
    checks.push({ id: 'contrast', level: 'ok', ko: '상의와 하의가 같은 색 — 셋업(원톤)처럼 보입니다. 의도했다면 신발이나 아우터로 변화를 주세요.', en: 'Top and bottom are the same color — it reads as a set (one-tone). Add contrast with shoes or an outer layer.' });
  } else if (dL < 12) {
    checks.push({ id: 'contrast', level: 'ok', ko: `상·하의 밝기 차이가 작음(ΔL ${dL.toFixed(0)}) — 톤온톤으로 차분하지만 경계가 흐릿할 수 있어요.`, en: `Small lightness gap between top and bottom (ΔL ${dL.toFixed(0)}) — calm tone-on-tone, but the waistline may blur.` });
  } else {
    checks.push({ id: 'contrast', level: 'good', ko: `상·하의 밝기 차이 ΔL ${dL.toFixed(0)} — ${dL > 45 ? '선명한 대비로 또렷해 보입니다.' : '적당한 대비로 안정적입니다.'}`, en: `Top/bottom lightness gap ΔL ${dL.toFixed(0)} — ${dL > 45 ? 'crisp, high contrast.' : 'balanced contrast.'}` });
  }

  // 4) 웜·쿨 온도
  const temps = new Set(accents.map(temperature).filter((t) => t !== 'neutral'));
  if (temps.size > 1 && !complementary) checks.push({ id: 'temp', level: 'ok', ko: '따뜻한 색과 차가운 색이 섞여 있어요 — 한쪽을 기본색으로 바꾸면 통일감이 생깁니다.', en: 'Warm and cool accents are mixed — turning one into a basic adds unity.' });
  else if (complementary) checks.push({ id: 'temp', level: 'good', ko: '보색 조합이라 웜·쿨 대비가 의도된 구성입니다.', en: 'A complementary pair, so the warm/cool contrast is intentional.' });
  else checks.push({ id: 'temp', level: 'good', ko: temps.has('warm') ? '색 온도가 따뜻한 쪽으로 통일돼 있습니다.' : temps.has('cool') ? '색 온도가 차가운 쪽으로 통일돼 있습니다.' : '온도 충돌 없이 기본색 위주입니다.', en: temps.has('warm') ? 'Color temperature is consistently warm.' : temps.has('cool') ? 'Color temperature is consistently cool.' : 'No warm/cool clash — mostly basics.' });

  // 5) 퍼스널 컬러 — 얼굴 가까운 아이템(모자·아우터·상의)
  if (season !== 'all') {
    const s = SEASONS[season];
    const near = (['hat', 'outer', 'top'] as SlotKey[]).filter((k) => slots[k].active);
    const fit = near.filter((k) => s.colors.some((c) => colorDistance(c.hex, slots[k].color) < 70) || (colorKind(slots[k].color) === 'neutral' && (season === 'winter' || season === 'summer')));
    const miss = near.length - fit.length;
    checks.push(miss === 0
      ? { id: 'season', level: 'good', ko: `얼굴 가까운 아이템이 ${s.ko} 팔레트와 잘 맞습니다.`, en: `Items near the face match the ${s.en} palette.` }
      : { id: 'season', level: 'ok', ko: `얼굴 가까운 아이템 ${miss}개가 ${s.ko} 팔레트에서 벗어나요 — 상의·아우터를 팔레트 색으로 바꾸고, 벗어난 색은 하의·신발로 내리면 좋습니다.`, en: `${miss} item(s) near the face fall outside the ${s.en} palette — use palette colors up top and move other colors to the bottom or shoes.` });
  }

  const warns = checks.filter((c) => c.level === 'warn').length;
  const oks = checks.filter((c) => c.level === 'ok').length;
  const verdict: CheckLevel = warns > 0 ? 'warn' : oks > 1 ? 'ok' : 'good';
  return {
    verdict, checks,
    ko: verdict === 'good' ? '조화로운 조합이에요' : verdict === 'ok' ? '무난한 조합 — 아래 팁을 참고하세요' : '색이 부딪히는 부분이 있어요',
    en: verdict === 'good' ? 'Well-balanced outfit' : verdict === 'ok' ? 'Good outfit — see the tips below' : 'Some colors clash',
  };
}
