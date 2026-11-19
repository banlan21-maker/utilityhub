// 버블 팝아트 글씨 렌더러 — 미리보기와 다운로드가 같은 함수로 그려진다 (배율만 다름).
// 모든 치수는 "기준 캔버스 px"이고, scale(1·2·3배)은 ctx.setTransform으로만 곱한다.
// 그림자·빛 번짐(shadowBlur/Offset)은 변환을 따르지 않으므로 직접 scale을 곱한다.

/* ── 폰트 (모두 Google Fonts, SIL Open Font License 1.1 — 상업적 사용 가능) ── */
export type FontKey = 'jua' | 'dohyeon' | 'blackhan' | 'gaegu' | 'singleday' | 'dokdo';
export interface FontDef { key: FontKey; family: string; weight: number; ko: string; en: string }
export const FONTS: FontDef[] = [
  { key: 'jua', family: 'Jua', weight: 400, ko: '주아', en: 'Jua' },
  { key: 'dohyeon', family: 'Do Hyeon', weight: 400, ko: '도현', en: 'Do Hyeon' },
  { key: 'blackhan', family: 'Black Han Sans', weight: 400, ko: '블랙한산스', en: 'Black Han Sans' },
  { key: 'gaegu', family: 'Gaegu', weight: 700, ko: '개구', en: 'Gaegu' },
  { key: 'singleday', family: 'Single Day', weight: 400, ko: '싱글데이', en: 'Single Day' },
  { key: 'dokdo', family: 'Dokdo', weight: 400, ko: '독도', en: 'Dokdo' },
];
export const FONT_CSS =
  'https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Do+Hyeon&family=Dokdo&family=Gaegu:wght@700&family=Jua&family=Single+Day&display=swap';
export const fontDef = (k: FontKey) => FONTS.find((f) => f.key === k) ?? FONTS[0];
export const fontCss = (k: FontKey, px: number) => {
  const f = fontDef(k);
  return `${f.weight} ${px}px "${f.family}", sans-serif`;
};

/* ── 디자인 옵션 ── */
export type FillMode = 'multi' | 'single' | 'gradient';
export type ShadowMode = 'none' | 'drop' | 'extrude';
export type ShadowDir = 'br' | 'b' | 'bl';
export type BgKind = 'solid' | 'gradient' | 'dots' | 'rays' | 'check' | 'stripes' | 'transparent';
export type DecoKind = 'none' | 'stars' | 'hearts' | 'sparkles' | 'notes' | 'mixed';
export type DecoAmount = 'few' | 'normal' | 'many';
export type ShapeKind = 'none' | 'bubble' | 'burst';
export type ArchKind = 'none' | 'up' | 'down';

export interface Design {
  font: FontKey;
  fill: FillMode;
  palette: string[];
  single: string;
  gradient: [string, string];
  outline: 1 | 2;
  outlineColor: string;
  innerColor: string;
  /** 외곽선 두께 배율 0.4 ~ 1.6 */
  outlineWidth: number;
  shadow: ShadowMode;
  shadowDir: ShadowDir;
  /** 'auto' = 글자색을 진하게 */
  shadowColor: string;
  sticker: boolean;
  glow: boolean;
  highlight: boolean;
  zigzag: boolean;
  bg: BgKind;
  bgColor: string;
  bgColor2: string;
  deco: DecoKind;
  decoAmount: DecoAmount;
  decoColors: string[];
  shape: ShapeKind;
  shapeColor: string;
  arch: ArchKind;
}

export interface Content { text: string; fontSize: number; kerning: number }
export interface RenderInfo { fontSize: number; shrunk: boolean }

export const MAX_CHARS = 20;
export const MAX_LINES = 3;
export const SIZE_MIN = 40;
export const SIZE_MAX = 200;
export const KERNING_MIN = 0.7;
export const KERNING_MAX = 1.3;

const CLASSIC_PALETTE = ['#FF6B9D', '#4ECDC4', '#FFE66D', '#FF8B3D', '#A8E6CF', '#C9B1FF', '#FF6B6B', '#74B9FF'];

const BASE: Design = {
  font: 'jua',
  fill: 'multi',
  palette: CLASSIC_PALETTE,
  single: '#FF6B9D',
  gradient: ['#FF8FB1', '#7CB8FF'],
  outline: 2,
  outlineColor: '#1a1a1a',
  innerColor: '#ffffff',
  outlineWidth: 1,
  shadow: 'none',
  shadowDir: 'br',
  shadowColor: 'auto',
  sticker: false,
  glow: false,
  highlight: true,
  zigzag: false,
  bg: 'solid',
  bgColor: '#FFD93D',
  bgColor2: '#FFB703',
  deco: 'stars',
  decoAmount: 'normal',
  decoColors: ['#FF8B3D', '#A8E6CF', '#FF6B9D', '#C9B1FF'],
  shape: 'none',
  shapeColor: '#ffffff',
  arch: 'none',
};

export type PresetKey = 'classic' | 'candy' | 'retro' | 'neon' | 'sticker' | 'jelly' | 'macaron' | 'comic';
export const PRESETS: { key: PresetKey; ko: string; en: string; design: Design }[] = [
  { key: 'classic', ko: '클래식 버블', en: 'Classic bubble', design: BASE },
  {
    key: 'candy', ko: '캔디', en: 'Candy',
    design: {
      ...BASE, fill: 'gradient', gradient: ['#FF7EB3', '#7AA7FF'], outline: 2, outlineColor: '#ffffff', innerColor: '#FFE1EE',
      outlineWidth: 1.1, shadow: 'drop', shadowDir: 'b', shadowColor: '#D9488B', highlight: true,
      bg: 'gradient', bgColor: '#FFB8D2', bgColor2: '#B9D7FF', deco: 'hearts', decoColors: ['#FF5C9A', '#7AA7FF', '#FFFFFF'],
    },
  },
  {
    key: 'retro', ko: '레트로 팝', en: 'Retro pop',
    design: {
      ...BASE, font: 'blackhan', palette: ['#FF3B30', '#FFD60A'], outline: 1, outlineColor: '#1a1a1a', outlineWidth: 0.9,
      shadow: 'extrude', shadowDir: 'br', shadowColor: '#1a1a1a', highlight: false,
      bg: 'dots', bgColor: '#3EC1D3', bgColor2: '#1F8FA3', deco: 'stars', decoColors: ['#FFD60A', '#FF3B30'],
    },
  },
  {
    key: 'neon', ko: '네온', en: 'Neon',
    design: {
      ...BASE, font: 'dohyeon', palette: ['#FF4FD8', '#3DF5FF', '#B6FF3D', '#FFE14D'], outline: 1, outlineColor: '#ffffff',
      outlineWidth: 0.35, glow: true, highlight: false,
      bg: 'gradient', bgColor: '#1B0B3A', bgColor2: '#060A24', deco: 'sparkles', decoColors: ['#3DF5FF', '#FF4FD8', '#FFE14D'],
    },
  },
  {
    key: 'sticker', ko: '스티커', en: 'Sticker',
    design: {
      ...BASE, sticker: true, outlineWidth: 0.8, highlight: true,
      bg: 'check', bgColor: '#DFF3EC', bgColor2: '#C8EADF', deco: 'hearts', decoAmount: 'few', decoColors: ['#FF6B9D', '#FFB703'],
    },
  },
  {
    key: 'jelly', ko: '젤리·3D', en: 'Jelly 3D',
    design: {
      ...BASE, palette: ['#FF5E8A', '#36C9C6', '#FFB627', '#8C6CFF'], outline: 1, outlineColor: '#3A1F5D', outlineWidth: 0.55,
      shadow: 'extrude', shadowDir: 'b', shadowColor: 'auto', highlight: true,
      bg: 'gradient', bgColor: '#FFF4D6', bgColor2: '#FFD3E6', deco: 'sparkles', decoColors: ['#FFB627', '#36C9C6', '#FF5E8A'],
    },
  },
  {
    key: 'macaron', ko: '마카롱', en: 'Macaron',
    design: {
      ...BASE, font: 'gaegu', palette: ['#F48FB1', '#81C7E8', '#9FD8A4', '#F6C177', '#C3A6F0'], outline: 1, outlineColor: '#6B5B73',
      outlineWidth: 0.55, shadow: 'drop', shadowDir: 'b', shadowColor: '#E7D9CF', highlight: false,
      bg: 'stripes', bgColor: '#FFF7EE', bgColor2: '#FCEBDD', deco: 'hearts', decoAmount: 'few', decoColors: ['#F48FB1', '#81C7E8'],
    },
  },
  {
    key: 'comic', ko: '코믹', en: 'Comic',
    design: {
      ...BASE, font: 'blackhan', fill: 'single', single: '#FF1E56', outline: 2, outlineColor: '#1a1a1a', innerColor: '#ffffff',
      outlineWidth: 0.9, shadow: 'drop', shadowDir: 'br', shadowColor: '#1a1a1a', highlight: false, zigzag: true,
      bg: 'rays', bgColor: '#FF6B35', bgColor2: '#FF8C5A', deco: 'none', shape: 'burst', shapeColor: '#FFE600',
    },
  },
];

/* ── 글자 입력 정리: 최대 3줄 · 20자 (줄바꿈 제외) ── */
export function clampText(v: string): string {
  const lines = v.replace(/\r/g, '').split('\n').slice(0, MAX_LINES);
  let left = MAX_CHARS;
  return lines
    .map((l) => {
      const chars = Array.from(l).slice(0, Math.max(0, left));
      left -= chars.length;
      return chars.join('');
    })
    .join('\n');
}
export const countChars = (v: string) => Array.from(v.replace(/\n/g, '')).length;
const splitLines = (v: string) =>
  v.split('\n').slice(0, MAX_LINES).filter((l) => l.trim().length > 0).map((l) => Array.from(l));

/* ── 색 계산 ── */
function rgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return Number.isNaN(n) ? [0, 0, 0] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function darken(hex: string, amt: number): string {
  const [r, g, b] = rgb(hex).map((v) => Math.round(v * (1 - amt)));
  return `rgb(${r},${g},${b})`;
}
/** 배경이 어두운지 (투명은 알 수 없으니 밝다고 본다) */
export const isDarkBg = (d: Design) => d.bg !== 'transparent' && luminance(d.bgColor) < 0.18;

/** 어두운 배경에 어두운 외곽선이면 흰색으로 바꿔 배경에 묻히지 않게 */
export function effectiveOutline(d: Design): { outer: string; inner: string } {
  let outer = d.outlineColor;
  let inner = d.innerColor;
  if (isDarkBg(d) && luminance(outer) < 0.18) {
    outer = '#ffffff';
    if (luminance(inner) > 0.8) inner = d.outlineColor;
  }
  return { outer, inner };
}

const DIR: Record<ShadowDir, [number, number]> = { br: [0.72, 0.72], b: [0, 1], bl: [-0.72, 0.72] };

/* ── 배경 ── */
function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, d: Design) {
  ctx.clearRect(0, 0, w, h);
  if (d.bg === 'transparent') return;
  if (d.bg === 'gradient') {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, d.bgColor);
    g.addColorStop(1, d.bgColor2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    return;
  }
  ctx.fillStyle = d.bgColor;
  ctx.fillRect(0, 0, w, h);
  const m = Math.min(w, h);
  ctx.fillStyle = d.bgColor2;
  if (d.bg === 'dots') {
    // 망점: 가운데는 작고 가장자리로 갈수록 커진다
    const S = m / 22;
    const maxD = Math.hypot(w, h) / 2;
    for (let row = 0, y = 0; y <= h + S; row++, y += S * 0.87) {
      for (let x = row % 2 ? S / 2 : 0; x <= w + S; x += S) {
        const r = S * (0.1 + 0.32 * (Math.hypot(x - w / 2, y - h / 2) / maxD));
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (d.bg === 'rays') {
    const n = 28;
    const R = Math.hypot(w, h);
    for (let i = 0; i < n; i += 2) {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = ((i + 1) / n) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + Math.cos(a0) * R, h / 2 + Math.sin(a0) * R);
      ctx.lineTo(w / 2 + Math.cos(a1) * R, h / 2 + Math.sin(a1) * R);
      ctx.closePath();
      ctx.fill();
    }
  } else if (d.bg === 'check') {
    const S = m / 10;
    for (let y = 0, r = 0; y < h; y += S, r++) {
      for (let x = (r % 2) * S; x < w; x += S * 2) ctx.fillRect(x, y, S, S);
    }
  } else if (d.bg === 'stripes') {
    const S = m / 18;
    const R = Math.hypot(w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 4);
    for (let x = -R; x < R; x += S * 2) ctx.fillRect(x, -R, S, R * 2);
    ctx.restore();
  }
}

/* ── 장식 도형 (중심 0,0 · 반지름 r) ── */
function pathStar(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
    else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
}
function pathHeart(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  ctx.moveTo(0, r * 0.95);
  ctx.bezierCurveTo(-r * 1.25, r * 0.15, -r * 0.95, -r * 0.95, 0, -r * 0.38);
  ctx.bezierCurveTo(r * 0.95, -r * 0.95, r * 1.25, r * 0.15, 0, r * 0.95);
  ctx.closePath();
}
function pathSparkle(ctx: CanvasRenderingContext2D, r: number) {
  const k = r * 0.16;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(k, -k, r, 0);
  ctx.quadraticCurveTo(k, k, 0, r);
  ctx.quadraticCurveTo(-k, k, -r, 0);
  ctx.quadraticCurveTo(-k, -k, 0, -r);
  ctx.closePath();
}
function pathNote(ctx: CanvasRenderingContext2D, r: number) {
  // 8분음표: 둥근 머리 + 기둥 + 깃발 (하나의 채움 경로)
  const hx = -r * 0.25;
  const hy = r * 0.55;
  ctx.beginPath();
  ctx.ellipse(hx, hy, r * 0.42, r * 0.32, -0.45, 0, Math.PI * 2);
  ctx.moveTo(hx + r * 0.3, hy);
  ctx.lineTo(hx + r * 0.3, -r * 0.95);
  ctx.quadraticCurveTo(hx + r * 0.75, -r * 0.6, hx + r * 0.95, -r * 0.1);
  ctx.quadraticCurveTo(hx + r * 0.7, -r * 0.4, hx + r * 0.46, -r * 0.42);
  ctx.lineTo(hx + r * 0.46, hy);
  ctx.closePath();
}
const DECO_ORDER: Exclude<DecoKind, 'none' | 'mixed'>[] = ['stars', 'hearts', 'sparkles', 'notes'];
const DECO_PATH = { stars: pathStar, hearts: pathHeart, sparkles: pathSparkle, notes: pathNote };

/* ── 배치 계산 (글자 크기 100 기준 → 선형으로 늘이고 줄인다) ── */
interface Glyph { ch: string; x: number; y: number; rot: number; w: number; idx: number }

const UNIT = 100;
const LINE_GAP = 16;
const DECO_SIZES = [0.24, 0.27, 0.17, 0.16, 0.13, 0.14, 0.11, 0.12];
const DECO_ROT = [-0.25, 0.3, 0.15, -0.35, 0.2, -0.15, 0.4, -0.3];

function layoutUnit(ctx: CanvasRenderingContext2D, lines: string[][], d: Design, kerning: number) {
  ctx.font = fontCss(d.font, UNIT);
  let charIdx = 0;
  const rows = lines.map((chars) => {
    const ws = chars.map((ch) => ctx.measureText(ch).width);
    let pos = 0;
    const centers = ws.map((w, i) => {
      const c = pos + w / 2;
      if (i < ws.length - 1) pos += w * kerning;
      return c;
    });
    const width = pos + (ws[ws.length - 1] ?? 0);
    const offs = centers.map((c) => c - width / 2);
    // 아치: 줄 폭에 비례한 원 위에 글자를 올린다
    const R = Math.max(width * 0.85, UNIT * 1.6);
    const items = chars.map((ch, i) => {
      if (d.arch === 'none') return { ch, w: ws[i], dx: offs[i], dy: 0, a: 0, idx: charIdx++ };
      const a = offs[i] / R;
      return { ch, w: ws[i], dx: R * Math.sin(a), dy: R * (1 - Math.cos(a)), a, idx: charIdx++ };
    });
    const halfW = Math.max(...items.map((g) => Math.abs(g.dx) + g.w / 2), 0);
    const sag = Math.max(...items.map((g) => g.dy), 0);
    return { items, width: halfW * 2, sag };
  });
  const textW = Math.max(...rows.map((r) => r.width));
  const textH = rows.reduce((s, r) => s + UNIT + r.sag, 0) + LINE_GAP * (rows.length - 1);

  const ow = d.outlineWidth;
  const strokeHalf = ((d.outline === 2 ? 24 : 20) * ow) / 2;
  const effect = Math.max(d.shadow === 'drop' ? 10 : d.shadow === 'extrude' ? 14 : 0, d.glow ? 30 : 0);
  const pad = strokeHalf + (d.sticker ? 15 : 0) + effect + (d.zigzag ? 4 : 0);
  const blockW = textW + pad * 2;
  const blockH = textH + pad * 2;

  let shapeRx = 0, shapeRy = 0, outerW = blockW, outerH = blockH, tail = 0;
  if (d.shape !== 'none') {
    shapeRx = (blockW / 2) * 1.28 + 30;
    shapeRy = (blockH / 2) * 1.28 + 30;
    const k = d.shape === 'burst' ? 1.2 : 1.03;
    outerW = shapeRx * 2 * k;
    outerH = shapeRy * 2 * k;
    if (d.shape === 'bubble') tail = shapeRy * 0.42;
    outerH += tail;
  }
  const decoX = d.deco === 'none' ? 0 : 56;
  const decoY = d.deco === 'none' ? 0 : d.decoAmount === 'many' ? 40 : 10;
  return { rows, textW, textH, blockW, blockH, shapeRx, shapeRy, outerW, outerH, tail, decoX, decoY, totalW: outerW + decoX * 2, totalH: outerH + decoY * 2 };
}

/** 캔버스에 그린다. canvas 크기는 (w×scale, h×scale)로 맞춘다. */
export function render(canvas: HTMLCanvasElement, w: number, h: number, scale: number, d: Design, c: Content): RenderInfo {
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return { fontSize: c.fontSize, shrunk: false };
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  drawBackground(ctx, w, h, d);

  const lines = splitLines(c.text);
  if (!lines.length) return { fontSize: c.fontSize, shrunk: false };

  const L = layoutUnit(ctx, lines, d, c.kerning);
  // 여백 3%씩 안에 글자·외곽선·그림자·장식이 모두 들어가는 최대 크기
  const fit = UNIT * Math.min((w * 0.94) / L.totalW, (h * 0.94) / L.totalH);
  const f = Math.min(c.fontSize, fit);
  const k = f / UNIT;
  const cx = w / 2;
  const cy = h / 2 - (L.tail * k) / 2;

  // 글자 위치
  const glyphs: Glyph[] = [];
  let top = cy - (L.textH * k) / 2;
  for (const row of L.rows) {
    for (const g of row.items) {
      const archY = d.arch === 'up' ? g.dy : d.arch === 'down' ? row.sag - g.dy : 0;
      const archRot = d.arch === 'up' ? g.a : d.arch === 'down' ? -g.a : 0;
      const zig = d.zigzag ? ((g.idx % 2 === 0 ? -4 : 4) * Math.PI) / 180 : 0;
      glyphs.push({ ch: g.ch, x: cx + g.dx * k, y: top + (UNIT / 2 + archY) * k, rot: archRot + zig, w: g.w * k, idx: g.idx });
    }
    top += (UNIT + row.sag + LINE_GAP) * k;
  }

  const { outer, inner } = effectiveOutline(d);
  const outerW = (d.outline === 2 ? 0.24 : 0.2) * d.outlineWidth * f;
  const innerW = 0.1 * d.outlineWidth * f;
  const colorOf = (i: number) =>
    d.fill === 'single' ? d.single : d.fill === 'gradient' ? d.gradient[1] : d.palette[i % d.palette.length];
  const fillOf = (i: number): string | CanvasGradient => {
    if (d.fill !== 'gradient') return colorOf(i);
    const g = ctx.createLinearGradient(0, -f * 0.45, 0, f * 0.45);
    g.addColorStop(0, d.gradient[0]);
    g.addColorStop(1, d.gradient[1]);
    return g;
  };
  const at = (g: Glyph, ox: number, oy: number, fn: () => void) => {
    ctx.save();
    ctx.translate(g.x + ox, g.y + oy);
    ctx.rotate(g.rot);
    fn();
    ctx.restore();
  };
  ctx.font = fontCss(d.font, f);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // 1) 말풍선·펑! 도형
  const ox0 = cx - (L.outerW * k) / 2;
  const oy0 = cy - ((L.outerH - L.tail) * k) / 2;
  const ox1 = ox0 + L.outerW * k;
  const oy1 = oy0 + L.outerH * k;
  if (d.shape !== 'none') {
    const rx = L.shapeRx * k;
    const ry = L.shapeRy * k;
    const path = () => {
      ctx.beginPath();
      if (d.shape === 'burst') {
        const n = 18;
        const jag = [1.2, 1.0, 1.16, 1.0, 1.22, 1.0, 1.14, 1.0];
        for (let i = 0; i < n * 2; i++) {
          const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
          const m = i % 2 === 0 ? jag[(i / 2) % jag.length] ?? 1.2 : 1.0;
          const px = cx + Math.cos(a) * rx * m;
          const py = cy + Math.sin(a) * ry * m;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else {
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.moveTo(cx - rx * 0.32, cy + ry * 0.8);
        ctx.lineTo(cx - rx * 0.5, cy + ry + L.tail * k);
        ctx.lineTo(cx - rx * 0.02, cy + ry * 0.93);
        ctx.closePath();
      }
    };
    // 그림자 → 테두리 → 채움 (채움이 테두리 안쪽 절반과 꼬리 이음새를 덮는다)
    ctx.save();
    ctx.translate(f * 0.07, f * 0.07);
    path();
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fill();
    ctx.restore();
    path();
    ctx.lineWidth = f * 0.09;
    ctx.strokeStyle = outer;
    ctx.stroke();
    ctx.fillStyle = d.shapeColor;
    ctx.fill();
  }

  // 2) 장식 — 크기는 글자 크기에 비례, 위치는 이미지 안쪽으로 고정
  if (d.deco !== 'none') {
    const count = d.decoAmount === 'few' ? 2 : d.decoAmount === 'normal' ? 4 : 8;
    const bw = ox1 - ox0;
    const bh = oy1 - oy0;
    const dx = L.decoX * k;
    const dy = L.decoY * k;
    const anchors: [number, number][] = [
      [ox0 - dx * 0.5, oy0 + bh * 0.22],
      [ox1 + dx * 0.5, oy1 - bh * 0.22],
      [ox0 - dx * 0.45, oy1 - bh * 0.08],
      [ox1 + dx * 0.45, oy0 + bh * 0.08],
      [ox0 + bw * 0.28, oy0 - dy * 0.5],
      [ox0 + bw * 0.72, oy1 + dy * 0.5],
      [ox0 + bw * 0.82, oy0 - dy * 0.5],
      [ox0 + bw * 0.18, oy1 + dy * 0.5],
    ];
    const margin = Math.min(w, h) * 0.015 + (d.glow ? f * 0.25 : 0);
    for (let i = 0; i < count; i++) {
      const r = DECO_SIZES[i] * f;
      const x = Math.min(Math.max(anchors[i][0], r + margin), w - r - margin);
      const y = Math.min(Math.max(anchors[i][1], r + margin), h - r - margin);
      const kind = d.deco === 'mixed' ? DECO_ORDER[i % DECO_ORDER.length] : d.deco;
      const color = d.decoColors[i % d.decoColors.length];
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(DECO_ROT[i]);
      DECO_PATH[kind](ctx, r);
      if (d.glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = f * 0.25 * scale;
      }
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = Math.max(f * 0.035, 1.5);
      ctx.strokeStyle = d.glow ? 'rgba(255,255,255,0.85)' : outer;
      ctx.stroke();
      ctx.restore();
    }
  }

  // 3) 스티커 테두리 — 따로 그린 뒤 그림자를 한 번만 (글자끼리 그림자가 겹치지 않게)
  if (d.sticker) {
    const layer = document.createElement('canvas');
    layer.width = canvas.width;
    layer.height = canvas.height;
    const lc = layer.getContext('2d');
    if (lc) {
      lc.setTransform(scale, 0, 0, scale, 0, 0);
      lc.font = ctx.font;
      lc.textAlign = 'center';
      lc.textBaseline = 'middle';
      lc.lineJoin = 'round';
      lc.strokeStyle = '#ffffff';
      lc.fillStyle = '#ffffff';
      lc.lineWidth = outerW + f * 0.32;
      for (const g of glyphs) {
        lc.save();
        lc.translate(g.x, g.y);
        lc.rotate(g.rot);
        lc.strokeText(g.ch, 0, 0);
        lc.fillText(g.ch, 0, 0);
        lc.restore();
      }
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = f * 0.12 * scale;
      ctx.shadowOffsetY = f * 0.05 * scale;
      ctx.drawImage(layer, 0, 0);
      ctx.restore();
    }
  }

  // 4) 그림자 / 3D 두께
  if (d.shadow !== 'none') {
    const [vx, vy] = DIR[d.shadowDir];
    const steps = d.shadow === 'extrude' ? 10 : 1;
    const step = d.shadow === 'extrude' ? f * 0.012 : f * 0.085;
    for (const g of glyphs) {
      const col = d.shadowColor === 'auto' ? darken(colorOf(g.idx), 0.42) : d.shadowColor;
      ctx.strokeStyle = col;
      ctx.fillStyle = col;
      ctx.lineWidth = outerW;
      for (let i = steps; i >= 1; i--) {
        at(g, vx * step * i, vy * step * i, () => {
          ctx.strokeText(g.ch, 0, 0);
          ctx.fillText(g.ch, 0, 0);
        });
      }
    }
  }

  // 5) 글자 — 한 글자씩 외곽선·채움을 겹쳐 그려 버블이 포개지는 모양
  for (const g of glyphs) {
    const col = colorOf(g.idx);
    at(g, 0, 0, () => {
      if (d.glow) {
        ctx.save();
        ctx.shadowColor = col;
        ctx.shadowBlur = f * 0.35 * scale;
        ctx.strokeStyle = col;
        ctx.lineWidth = outerW + f * 0.06;
        ctx.strokeText(g.ch, 0, 0);
        ctx.strokeText(g.ch, 0, 0);
        ctx.restore();
      }
      ctx.lineWidth = outerW;
      ctx.strokeStyle = outer;
      ctx.strokeText(g.ch, 0, 0);
      if (d.outline === 2) {
        ctx.lineWidth = innerW;
        ctx.strokeStyle = inner;
        ctx.strokeText(g.ch, 0, 0);
      }
      ctx.fillStyle = fillOf(g.idx);
      ctx.fillText(g.ch, 0, 0);
      if (d.highlight && g.ch.trim() && g.w > f * 0.4) {
        const x1 = -g.w * 0.12;
        const y1 = -f * 0.24;
        const r1 = f * 0.09;
        ctx.beginPath();
        ctx.arc(x1, y1, r1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x1 + r1 * 0.85, y1 + r1 * 0.65, f * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fill();
      }
    });
  }

  return { fontSize: Math.round(f), shrunk: fit < c.fontSize - 0.5 };
}

/* ── 출력 크기 ── */
export const SIZE_PRESETS = [
  { key: 'square', w: 800, h: 800 },
  { key: 'landscape', w: 1280, h: 720 },
  { key: 'portrait', w: 720, h: 1280 },
  { key: 'a4', w: 794, h: 1123 },
] as const;
export type SizeKey = (typeof SIZE_PRESETS)[number]['key'];
/** A4 가로 210mm = 8.27인치 */
export const a4Dpi = (scale: number) => Math.round((794 * scale) / 8.2677);
