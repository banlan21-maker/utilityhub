// 시술 전후 비교 사진 메이커 — 배치 계산과 캔버스 그리기
// 미리보기와 저장이 같은 render()를 쓴다. 사진은 브라우저 안에서만 다룬다.

export type Layout = 'side' | 'stack' | 'diagonal';
export type RatioKey = '4:5' | '1:1' | '3:4' | '9:16';
export type DividerColor = 'none' | 'white' | 'black' | 'brand';
export type Size3 = 's' | 'm' | 'l';
export type Radius = 0 | 1 | 2 | 3;
export type LabelSet = 'BEFORE_AFTER' | 'Before_After' | 'ko' | 'ko_sisul' | 'custom' | 'none';
export type LabelPos = 'top' | 'bottom' | 'corner';
export type LabelStyle = 'simple' | 'badge' | 'bar' | 'outline';
export type Tone = 'dark' | 'light' | 'brand';
export type FontKey = 'gothic' | 'serif' | 'hand';
export type Corner = 'tl' | 'tr' | 'bl' | 'br';
export type MaskKind = 'mosaic' | 'blur' | 'heart' | 'star';
export type MaskShape = 'rect' | 'ellipse';

export const OUT_W = 1080;
export const RATIOS: { key: RatioKey; w: number; h: number }[] = [
  { key: '4:5', w: 1080, h: 1350 },
  { key: '1:1', w: 1080, h: 1080 },
  { key: '3:4', w: 1080, h: 1440 },
  { key: '9:16', w: 1080, h: 1920 },
];
export const ratioOf = (k: RatioKey) => RATIOS.find((r) => r.key === k) ?? RATIOS[0];

/** 불러올 때 긴 변을 이 크기로 줄여서 작업한다 (저사양 폰 메모리) */
export const WORK_MAX = 2400;
export const ZOOM_MAX = 6;
export const MAX_FILE_MB = 60;

export const FONTS: Record<FontKey, { family: string; weight: number; ko: string; en: string }> = {
  gothic: { family: 'Noto Sans KR', weight: 700, ko: '고딕', en: 'Sans' },
  serif: { family: 'Nanum Myeongjo', weight: 800, ko: '명조', en: 'Serif' },
  hand: { family: 'Gaegu', weight: 700, ko: '손글씨', en: 'Handwritten' },
};
export const FONT_CSS =
  'https://fonts.googleapis.com/css2?family=Gaegu:wght@700&family=Nanum+Myeongjo:wght@800&family=Noto+Sans+KR:wght@700&display=swap';
export const fontCss = (k: FontKey, px: number) => `${FONTS[k].weight} ${px}px "${FONTS[k].family}", sans-serif`;

export const THICKNESS: Record<Size3, number> = { s: 4, m: 8, l: 16 };
export const RADIUS_PX: Record<Radius, number> = { 0: 0, 1: 20, 2: 40, 3: 64 };
const LABEL_FS: Record<Size3, number> = { s: 0.036, m: 0.046, l: 0.06 };
const BRAND_K: Record<Size3, number> = { s: 0.8, m: 1, l: 1.3 };

export const LABEL_TEXT: Record<Exclude<LabelSet, 'custom' | 'none'>, [string, string]> = {
  BEFORE_AFTER: ['BEFORE', 'AFTER'],
  Before_After: ['Before', 'After'],
  ko: ['전', '후'],
  ko_sisul: ['시술 전', '시술 후'],
};

export interface Style {
  layout: Layout;
  ratio: RatioKey;
  divider: DividerColor;
  thickness: Size3;
  radius: Radius;
  labelSet: LabelSet;
  customBefore: string;
  customAfter: string;
  labelPos: LabelPos;
  labelStyle: LabelStyle;
  labelTone: Tone;
  labelSize: Size3;
  font: FontKey;
  brandColor: string;
  logo: string | null;
  shopName: string;
  insta: string;
  phone: string;
  brandCorner: Corner;
  brandSize: Size3;
  brandOpacity: number;
  brandTone: 'light' | 'dark';
  watermark: boolean;
}

export const DEFAULT_STYLE: Style = {
  layout: 'side',
  ratio: '4:5',
  divider: 'white',
  thickness: 'm',
  radius: 0,
  labelSet: 'BEFORE_AFTER',
  customBefore: '',
  customAfter: '',
  labelPos: 'top',
  labelStyle: 'badge',
  labelTone: 'dark',
  labelSize: 'm',
  font: 'gothic',
  brandColor: '#c8956d',
  logo: null,
  shopName: '',
  insta: '',
  phone: '',
  brandCorner: 'br',
  brandSize: 'm',
  brandOpacity: 0.9,
  brandTone: 'light',
  watermark: false,
};

export const TEXT_MAX = { label: 12, shop: 24, insta: 31, phone: 20, caption: 40 };

const pick = <T,>(v: unknown, allowed: readonly T[], d: T): T => (allowed.includes(v as T) ? (v as T) : d);
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
const HEX = /^#[0-9a-fA-F]{6}$/;

/** 저장소에서 꺼낸 값은 믿지 않고 하나씩 검사한다 */
export function sanitizeStyle(raw: unknown): Style {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_STYLE;
  const op = typeof o.brandOpacity === 'number' && Number.isFinite(o.brandOpacity) ? Math.min(1, Math.max(0.3, o.brandOpacity)) : d.brandOpacity;
  const logo = typeof o.logo === 'string' && /^data:image\/(png|jpeg|webp);base64,/.test(o.logo) && o.logo.length < 1_500_000 ? o.logo : null;
  return {
    layout: pick(o.layout, ['side', 'stack', 'diagonal'] as const, d.layout),
    ratio: pick(o.ratio, ['4:5', '1:1', '3:4', '9:16'] as const, d.ratio),
    divider: pick(o.divider, ['none', 'white', 'black', 'brand'] as const, d.divider),
    thickness: pick(o.thickness, ['s', 'm', 'l'] as const, d.thickness),
    radius: pick(o.radius, [0, 1, 2, 3] as const, d.radius),
    labelSet: pick(o.labelSet, ['BEFORE_AFTER', 'Before_After', 'ko', 'ko_sisul', 'custom', 'none'] as const, d.labelSet),
    customBefore: str(o.customBefore, TEXT_MAX.label),
    customAfter: str(o.customAfter, TEXT_MAX.label),
    labelPos: pick(o.labelPos, ['top', 'bottom', 'corner'] as const, d.labelPos),
    labelStyle: pick(o.labelStyle, ['simple', 'badge', 'bar', 'outline'] as const, d.labelStyle),
    labelTone: pick(o.labelTone, ['dark', 'light', 'brand'] as const, d.labelTone),
    labelSize: pick(o.labelSize, ['s', 'm', 'l'] as const, d.labelSize),
    font: pick(o.font, ['gothic', 'serif', 'hand'] as const, d.font),
    brandColor: typeof o.brandColor === 'string' && HEX.test(o.brandColor) ? o.brandColor : d.brandColor,
    logo,
    shopName: str(o.shopName, TEXT_MAX.shop),
    insta: str(o.insta, TEXT_MAX.insta),
    phone: str(o.phone, TEXT_MAX.phone),
    brandCorner: pick(o.brandCorner, ['tl', 'tr', 'bl', 'br'] as const, d.brandCorner),
    brandSize: pick(o.brandSize, ['s', 'm', 'l'] as const, d.brandSize),
    brandOpacity: op,
    brandTone: pick(o.brandTone, ['light', 'dark'] as const, d.brandTone),
    watermark: o.watermark === true,
  };
}

export function labelTexts(st: Style): [string, string] | null {
  if (st.labelSet === 'none') return null;
  if (st.labelSet === 'custom') return [st.customBefore.trim(), st.customAfter.trim()];
  return LABEL_TEXT[st.labelSet];
}

/** @아이디 정리: 앞의 @와 공백을 지우고 다시 붙인다 */
export const instaText = (v: string) => {
  const id = v.trim().replace(/^@+/, '').replace(/\s+/g, '');
  return id ? `@${id}` : '';
};

// ───────── 배치 ─────────

export interface Cell {
  /** 사진이 꽉 차게 들어가는 틀 (출력 좌표) */
  x: number; y: number; w: number; h: number;
  /** 둥근 모서리 반지름 */
  r: number;
  /** 대각선 분할에서 실제로 보이는 다각형 */
  poly?: [number, number][];
}

const DIAG_TOP = 0.6;
const DIAG_BOTTOM = 0.4;

export function cells(st: Style, W: number, H: number): [Cell, Cell] {
  const r = RADIUS_PX[st.radius];
  if (st.layout === 'diagonal') {
    const a = W * DIAG_TOP;
    const b = W * DIAG_BOTTOM;
    return [
      { x: 0, y: 0, w: a, h: H, r: 0, poly: [[0, 0], [a, 0], [b, H], [0, H]] },
      { x: b, y: 0, w: W - b, h: H, r: 0, poly: [[a, 0], [W, 0], [W, H], [b, H]] },
    ];
  }
  // 둥근 모서리면 카드처럼 띄워서 배경이 보이게, 아니면 딱 붙여서 구분선을 위에 그린다
  const g = r > 0 ? Math.max(14, THICKNESS[st.thickness]) : 0;
  if (st.layout === 'side') {
    const cw = (W - 3 * g) / 2;
    return [
      { x: g, y: g, w: cw, h: H - 2 * g, r },
      { x: 2 * g + cw, y: g, w: cw, h: H - 2 * g, r },
    ];
  }
  const ch = (H - 3 * g) / 2;
  return [
    { x: g, y: g, w: W - 2 * g, h: ch, r },
    { x: g, y: 2 * g + ch, w: W - 2 * g, h: ch, r },
  ];
}

export function pointInCell(c: Cell, x: number, y: number) {
  if (c.poly) {
    let inside = false;
    const p = c.poly;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const [xi, yi] = p[i];
      const [xj, yj] = p[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  return x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h;
}

// ───────── 사진 위치 ─────────

export interface Mask { id: number; kind: MaskKind; shape: MaskShape; x: number; y: number; w: number; h: number }
export interface Adjust { brightness: number; contrast: number; saturation: number }
export const ZERO_ADJUST: Adjust = { brightness: 0, contrast: 0, saturation: 0 };
export const isZeroAdjust = (a: Adjust) => !a.brightness && !a.contrast && !a.saturation;

export interface Photo {
  src: HTMLCanvasElement;
  /** 작업용으로 줄인 크기 */
  w: number; h: number;
  /** 원본 크기 (안내용) */
  ow0: number; oh0: number;
  thumb: string;
  /** 1 = 틀을 꽉 채우는 최소 크기 */
  zoom: number;
  /** 틀 가운데에 오는 사진 위 점 (돌린·뒤집은 뒤 기준 0~1) */
  cx: number; cy: number;
  rot: 0 | 1 | 2 | 3;
  flip: boolean;
  masks: Mask[];
}

export const orientedSize = (p: Pick<Photo, 'w' | 'h' | 'rot'>) => (p.rot % 2 ? { ow: p.h, oh: p.w } : { ow: p.w, oh: p.h });

export interface Place { s: number; left: number; top: number; ow: number; oh: number; cx: number; cy: number }

/** 틀 안에서 사진의 배율과 위치. 빈틈이 생기지 않게 가운데 점을 제한한다 */
export function place(p: Photo, c: Pick<Cell, 'x' | 'y' | 'w' | 'h'>): Place {
  const { ow, oh } = orientedSize(p);
  const s = Math.max(c.w / ow, c.h / oh) * Math.min(ZOOM_MAX, Math.max(1, p.zoom));
  const cx = clampCenter(p.cx, c.w / (2 * s * ow));
  const cy = clampCenter(p.cy, c.h / (2 * s * oh));
  return { s, ow, oh, cx, cy, left: c.x + c.w / 2 - cx * ow * s, top: c.y + c.h / 2 - cy * oh * s };
}
function clampCenter(v: number, half: number) {
  if (half >= 0.5) return 0.5;
  return Math.min(1 - half, Math.max(half, Number.isFinite(v) ? v : 0.5));
}
/** 위치 값을 실제로 보이는 범위로 맞춘다 (끝까지 끈 뒤 반대로 끌면 바로 움직이게) */
export function clampPhoto(p: Photo, c: Cell): Photo {
  const pl = place(p, c);
  const zoom = Math.min(ZOOM_MAX, Math.max(1, p.zoom));
  return pl.cx === p.cx && pl.cy === p.cy && zoom === p.zoom ? p : { ...p, cx: pl.cx, cy: pl.cy, zoom };
}

/** 출력 좌표 → 사진 위 좌표(0~1) */
export function toPhoto(pl: Place, x: number, y: number) {
  return { u: (x - pl.left) / (pl.s * pl.ow), v: (y - pl.top) / (pl.s * pl.oh) };
}
/** 사진 위 사각형(0~1) → 출력 좌표 */
export function maskRect(pl: Place, m: Pick<Mask, 'x' | 'y' | 'w' | 'h'>) {
  return { x: pl.left + m.x * pl.ow * pl.s, y: pl.top + m.y * pl.oh * pl.s, w: m.w * pl.ow * pl.s, h: m.h * pl.oh * pl.s };
}

/** 화면 기준 시계 방향 90° 회전 (뒤집힌 상태면 반대 방향으로 돌려야 화면에서 시계 방향) */
export function rotatePhoto(p: Photo): Photo {
  const rot = (((p.rot + (p.flip ? 3 : 1)) % 4) as Photo['rot']);
  return {
    ...p, rot, cx: 1 - p.cy, cy: p.cx,
    masks: p.masks.map((m) => ({ ...m, x: 1 - m.y - m.h, y: m.x, w: m.h, h: m.w })),
  };
}
export function flipPhoto(p: Photo): Photo {
  return { ...p, flip: !p.flip, cx: 1 - p.cx, masks: p.masks.map((m) => ({ ...m, x: 1 - m.x - m.w })) };
}

// ───────── 그리기 ─────────

type Ctx = CanvasRenderingContext2D;

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

/**
 * 작업용 캔버스 재사용: 사진을 끄는 동안 매 프레임 새 캔버스를 만들면
 * iOS 사파리의 캔버스 메모리 한도에 걸려 그림이 사라진다.
 * (0·1 = 사진 칸, 2·3 = 모자이크·흐림 임시)
 */
const scratchPool: HTMLCanvasElement[] = [];
function scratch(slot: number, w: number, h: number) {
  const W = Math.max(1, Math.round(w));
  const H = Math.max(1, Math.round(h));
  let c = scratchPool[slot];
  if (!c) { c = document.createElement('canvas'); scratchPool[slot] = c; }
  if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  const ctx = c.getContext('2d')!;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, W, H);
  return c;
}

function cellPath(ctx: Ctx, c: Cell) {
  ctx.beginPath();
  if (c.poly) {
    c.poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
  } else if (c.r > 0) {
    roundRect(ctx, c.x, c.y, c.w, c.h, c.r);
  } else {
    ctx.rect(c.x, c.y, c.w, c.h);
  }
}
function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** 사진을 돌리고 뒤집어 틀 위치에 그린다 (ctx는 출력 좌표) */
export function drawPhoto(ctx: Ctx, p: Photo, pl: Place) {
  ctx.save();
  ctx.translate(pl.left, pl.top);
  ctx.scale(pl.s, pl.s);
  ctx.translate(pl.ow / 2, pl.oh / 2);
  if (p.flip) ctx.scale(-1, 1);
  ctx.rotate((p.rot * Math.PI) / 2);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(p.src, -p.w / 2, -p.h / 2, p.w, p.h);
  ctx.restore();
}

/** 밝기·대비·채도 (CSS 필터와 같은 식, Safari 구버전도 같게 나오도록 픽셀로 계산) */
export function adjustPixels(d: Uint8ClampedArray, a: Adjust) {
  const b = 1 + a.brightness / 100;
  const c = 1 + a.contrast / 100;
  const s = 1 + a.saturation / 100;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i] * b, g = d[i + 1] * b, bl = d[i + 2] * b;
    r = (r - 128) * c + 128; g = (g - 128) * c + 128; bl = (bl - 128) * c + 128;
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    d[i] = l + (r - l) * s; d[i + 1] = l + (g - l) * s; d[i + 2] = l + (bl - l) * s;
  }
}

function shapePath(ctx: Ctx, shape: MaskShape, x: number, y: number, w: number, h: number) {
  ctx.beginPath();
  if (shape === 'ellipse') ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
  else ctx.rect(x, y, w, h);
}

/**
 * 모자이크·흐림: 영역을 아주 작게 줄였다가 다시 늘린다.
 * 작은 그림에서 원래 픽셀을 되살릴 방법이 없으므로 저장 이미지에서 복원되지 않는다.
 */
function obscure(ctx: Ctx, kind: 'mosaic' | 'blur', shape: MaskShape, x: number, y: number, w: number, h: number) {
  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;
  const t = ctx.getTransform();
  // 기기 픽셀 좌표로 바꿔 캔버스 안쪽만
  const X0 = Math.max(0, Math.floor(t.a * x + t.e));
  const Y0 = Math.max(0, Math.floor(t.d * y + t.f));
  const X1 = Math.min(cw, Math.ceil(t.a * (x + w) + t.e));
  const Y1 = Math.min(ch, Math.ceil(t.d * (y + h) + t.f));
  const rw = X1 - X0;
  const rh = Y1 - Y0;
  if (rw < 2 || rh < 2) return;
  const side = Math.min(rw, rh);
  const block = kind === 'mosaic' ? Math.max(6 * t.a, side / 8) : Math.max(4 * t.a, side / 10);
  const tw = Math.max(1, Math.round(rw / block));
  const th = Math.max(1, Math.round(rh / block));
  const tiny = scratch(2, tw, th);
  const tc = tiny.getContext('2d')!;
  tc.imageSmoothingEnabled = true;
  tc.imageSmoothingQuality = 'high';
  tc.drawImage(ctx.canvas, X0, Y0, rw, rh, 0, 0, tw, th);
  let src: HTMLCanvasElement = tiny;
  if (kind === 'blur') {
    // 한 번에 늘리면 격자 무늬가 보여서 중간 크기를 한 번 거친다
    const mid = scratch(3, tw * 4, th * 4);
    const mc = mid.getContext('2d')!;
    mc.imageSmoothingEnabled = true;
    mc.imageSmoothingQuality = 'high';
    mc.drawImage(tiny, 0, 0, mid.width, mid.height);
    src = mid;
  }
  ctx.save();
  shapePath(ctx, shape, x, y, w, h);
  ctx.clip();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = kind === 'blur';
  ctx.drawImage(src, 0, 0, src.width, src.height, X0, Y0, rw, rh);
  ctx.restore();
}

function heartPath(ctx: Ctx, x: number, y: number, w: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.95);
  ctx.bezierCurveTo(x - w * 0.15, y + h * 0.5, x + w * 0.05, y - h * 0.05, x + w / 2, y + h * 0.25);
  ctx.bezierCurveTo(x + w * 0.95, y - h * 0.05, x + w * 1.15, y + h * 0.5, x + w / 2, y + h * 0.95);
  ctx.closePath();
}
function starPath(ctx: Ctx, x: number, y: number, w: number, h: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 0.42 : 1;
    const px = x + w / 2 + Math.cos(a) * r * w / 2;
    const py = y + h * 0.54 + Math.sin(a) * r * h / 2;
    if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  }
  ctx.closePath();
}
function sticker(ctx: Ctx, kind: 'heart' | 'star', x: number, y: number, w: number, h: number) {
  ctx.save();
  if (kind === 'heart') heartPath(ctx, x, y, w, h); else starPath(ctx, x, y, w, h);
  ctx.fillStyle = kind === 'heart' ? '#ff5c8a' : '#ffc531';
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = Math.min(w, h) * 0.06;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2, Math.min(w, h) * 0.05);
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.restore();
}

export function applyMask(ctx: Ctx, m: Mask, r: { x: number; y: number; w: number; h: number }) {
  if (m.kind === 'mosaic' || m.kind === 'blur') obscure(ctx, m.kind, m.shape, r.x, r.y, r.w, r.h);
  else sticker(ctx, m.kind, r.x, r.y, r.w, r.h);
}

const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
};
const onColor = (hex: string) => (lum(hex) > 0.45 ? '#111111' : '#ffffff');
const withAlpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
export const dividerHex = (st: Style) =>
  st.divider === 'white' ? '#ffffff' : st.divider === 'black' ? '#111111' : st.divider === 'brand' ? st.brandColor : null;

interface Box { x: number; y: number; w: number; h: number }

/** 글자를 칸 폭에 맞게 줄이고, 그래도 넘치면 끝을 줄임표로 */
function fitText(ctx: Ctx, text: string, font: FontKey, fs: number, maxW: number) {
  let size = fs;
  ctx.font = fontCss(font, size);
  while (ctx.measureText(text).width > maxW && size > fs * 0.6) {
    size *= 0.92;
    ctx.font = fontCss(font, size);
  }
  let t = text;
  while (t.length > 1 && ctx.measureText(t).width > maxW) t = t.slice(0, -2) + '…';
  return { text: t, size, width: ctx.measureText(t).width };
}

/** 배지·글자 하나를 그린다. (ax, ay)는 기준점, align은 가로 기준, vAlign은 세로 기준 */
function drawTag(
  ctx: Ctx, st: Style, text: string, fs: number, maxW: number,
  ax: number, ay: number, align: 'left' | 'center' | 'right', vAlign: 'top' | 'bottom', kind: LabelStyle,
): Box {
  const f = fitText(ctx, text, st.font, fs, maxW);
  const size = f.size;
  const padX = kind === 'simple' ? 0 : size * 0.62;
  const padY = kind === 'simple' ? 0 : size * 0.34;
  const bw = f.width + padX * 2;
  const bh = size * 1.25 + padY * 2;
  const bx = align === 'left' ? ax : align === 'right' ? ax - bw : ax - bw / 2;
  const by = vAlign === 'top' ? ay : ay - bh;
  const tone = st.labelTone;
  const brand = st.brandColor;
  let fg = '#ffffff';
  ctx.save();
  if (kind === 'badge') {
    const bg = tone === 'light' ? 'rgba(255,255,255,0.92)' : tone === 'dark' ? 'rgba(17,17,17,0.72)' : brand;
    fg = tone === 'light' ? '#111111' : tone === 'dark' ? '#ffffff' : onColor(brand);
    ctx.fillStyle = bg;
    ctx.beginPath();
    roundRect(ctx, bx, by, bw, bh, bh / 2);
    ctx.fill();
  } else if (kind === 'outline') {
    fg = tone === 'light' ? '#ffffff' : tone === 'dark' ? '#111111' : brand;
    ctx.strokeStyle = fg;
    ctx.lineWidth = Math.max(2, size * 0.08);
    if (tone !== 'dark') { ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = size * 0.2; }
    ctx.beginPath();
    roundRect(ctx, bx, by, bw, bh, size * 0.2);
    ctx.stroke();
  } else {
    fg = tone === 'light' ? '#ffffff' : tone === 'dark' ? '#111111' : brand;
    ctx.shadowColor = tone === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = size * 0.28;
  }
  ctx.fillStyle = fg;
  ctx.font = fontCss(st.font, size);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // 글꼴마다 위아래 여백이 달라 실제 글자 높이로 가운데를 맞춘다
  const m = ctx.measureText(f.text);
  const asc = m.actualBoundingBoxAscent || size * 0.72;
  const desc = m.actualBoundingBoxDescent || size * 0.1;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(f.text, bx + bw / 2, by + bh / 2 + (asc - desc) / 2);
  ctx.restore();
  return { x: bx, y: by, w: bw, h: bh };
}

/** 셀 하나의 라벨 */
function drawLabel(ctx: Ctx, st: Style, text: string, i: 0 | 1, c: Cell, W: number, H: number) {
  if (!text) return;
  const fs = W * LABEL_FS[st.labelSize];
  const m = W * 0.03;
  const pos = st.labelPos;
  let kind = st.labelStyle;
  if (st.layout === 'diagonal') {
    if (kind === 'bar') kind = 'badge';
    const maxW = W * 0.34;
    if (pos === 'corner') {
      if (i === 0) drawTag(ctx, st, text, fs, maxW, m, m, 'left', 'top', kind);
      else drawTag(ctx, st, text, fs, maxW, W - m, H - m, 'right', 'bottom', kind);
      return;
    }
    // 보이는 부분의 가운데 (위쪽은 0~0.6W | 0.6W~W, 아래쪽은 0~0.4W | 0.4W~W)
    const top = pos === 'top';
    const split = W * (top ? DIAG_TOP : DIAG_BOTTOM);
    const ax = i === 0 ? split / 2 : (split + W) / 2;
    drawTag(ctx, st, text, fs, maxW, ax, top ? m : H - m, 'center', top ? 'top' : 'bottom', kind);
    return;
  }
  if (kind === 'bar') {
    const atBottom = pos === 'bottom';
    const f = fitText(ctx, text, st.font, fs, c.w * 0.9);
    const bh = f.size * 2.1;
    const by = atBottom ? c.y + c.h - bh : c.y;
    const tone = st.labelTone;
    ctx.save();
    cellPath(ctx, c);
    ctx.clip();
    ctx.fillStyle = tone === 'light' ? 'rgba(255,255,255,0.82)' : tone === 'dark' ? 'rgba(0,0,0,0.55)' : withAlpha(st.brandColor, 0.88);
    ctx.fillRect(c.x, by, c.w, bh);
    ctx.restore();
    const fg = tone === 'light' ? '#111111' : tone === 'dark' ? '#ffffff' : onColor(st.brandColor);
    ctx.save();
    ctx.fillStyle = fg;
    ctx.font = fontCss(st.font, f.size);
    ctx.textAlign = 'center';
    const mm = ctx.measureText(f.text);
    const asc = mm.actualBoundingBoxAscent || f.size * 0.72;
    const desc = mm.actualBoundingBoxDescent || f.size * 0.1;
    ctx.fillText(f.text, c.x + c.w / 2, by + bh / 2 + (asc - desc) / 2);
    ctx.restore();
    return;
  }
  const maxW = c.w - m * 2;
  if (pos === 'corner') drawTag(ctx, st, text, fs, maxW, c.x + m, c.y + m, 'left', 'top', kind);
  else if (pos === 'top') drawTag(ctx, st, text, fs, maxW, c.x + c.w / 2, c.y + m, 'center', 'top', kind);
  else drawTag(ctx, st, text, fs, maxW, c.x + c.w / 2, c.y + c.h - m, 'center', 'bottom', kind);
}

/** 라벨 띠가 차지하는 높이 (로고·문구가 겹치지 않게 비켜 놓을 때) */
function labelBand(st: Style, W: number) {
  const fs = W * LABEL_FS[st.labelSize];
  if (st.labelStyle === 'bar' && st.layout !== 'diagonal') return fs * 2.1;
  return fs * 1.25 + (st.labelStyle === 'simple' ? 0 : fs * 0.68) + W * 0.03;
}

export interface BrandImages { logo: HTMLImageElement | null }

function drawBrand(ctx: Ctx, st: Style, imgs: BrandImages, W: number, H: number, labels: boolean, capTop: number, capBottom: number) {
  const name = st.shopName.trim();
  const insta = instaText(st.insta);
  const phone = st.phone.trim();
  const logo = st.logo ? imgs.logo : null;
  if (!name && !insta && !phone && !logo) return;
  const k = BRAND_K[st.brandSize];
  const m = W * 0.03;
  const left = st.brandCorner === 'tl' || st.brandCorner === 'bl';
  const top = st.brandCorner === 'tl' || st.brandCorner === 'tr';
  const maxW = W * 0.4;
  const nameFs = W * 0.034 * k;
  const subFs = W * 0.026 * k;
  const gap = W * 0.008 * k;
  const items: { kind: 'logo' | 'text'; h: number; w: number; text?: string; fs?: number }[] = [];
  if (logo && logo.naturalWidth) {
    let lh = W * 0.09 * k;
    let lw = (logo.naturalWidth / logo.naturalHeight) * lh;
    if (lw > W * 0.3 * k) { lw = W * 0.3 * k; lh = (logo.naturalHeight / logo.naturalWidth) * lw; }
    items.push({ kind: 'logo', w: lw, h: lh });
  }
  const font = st.font;
  const addText = (text: string, fs: number) => {
    const f = fitText(ctx, text, font, fs, maxW);
    items.push({ kind: 'text', text: f.text, fs: f.size, w: f.width, h: f.size * 1.2 });
  };
  if (name) addText(name, nameFs);
  if (insta) addText(insta, subFs);
  if (phone) addText(phone, subFs);
  const totalH = items.reduce((a, it) => a + it.h, 0) + gap * (items.length - 1);
  // 같은 쪽 가장자리에 라벨이 있으면 그만큼 비켜 놓는다
  let offset = 0;
  if (labels) {
    const sameEdge = top
      ? st.labelPos === 'top' || st.labelPos === 'corner'
      : st.labelPos === 'bottom' || (st.layout === 'diagonal' && st.labelPos === 'corner');
    if (sameEdge) offset = labelBand(st, W);
  }
  offset += top ? capTop : capBottom;
  let y = top ? m + offset : H - m - offset - totalH;
  const x = left ? m : W - m;
  ctx.save();
  ctx.globalAlpha = st.brandOpacity;
  const fg = st.brandTone === 'light' ? '#ffffff' : '#111111';
  for (const it of items) {
    if (it.kind === 'logo' && logo) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = W * 0.01;
      ctx.drawImage(logo, left ? x : x - it.w, y, it.w, it.h);
      ctx.restore();
    } else if (it.text) {
      ctx.font = fontCss(font, it.fs!);
      ctx.textAlign = left ? 'left' : 'right';
      ctx.textBaseline = 'top';
      ctx.shadowColor = st.brandTone === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)';
      ctx.shadowBlur = it.fs! * 0.3;
      ctx.fillStyle = fg;
      ctx.fillText(it.text, x, y);
    }
    y += it.h + gap;
  }
  ctx.restore();
}

function drawWatermark(ctx: Ctx, st: Style, imgs: BrandImages, W: number, H: number) {
  const text = st.shopName.trim() || instaText(st.insta);
  const logo = st.logo ? imgs.logo : null;
  if (!text && !(logo && logo.naturalWidth)) return;
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-Math.PI / 6);
  const diag = Math.hypot(W, H);
  if (text) {
    const fs = W * 0.042;
    ctx.font = fontCss(st.font, fs);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(text).width;
    const stepX = tw + W * 0.14;
    const stepY = W * 0.17;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = Math.max(1, fs * 0.05);
    let row = 0;
    for (let y = -diag / 2; y <= diag / 2; y += stepY, row++) {
      const shift = row % 2 ? stepX / 2 : 0;
      for (let x = -diag / 2 - stepX + shift; x <= diag / 2 + stepX; x += stepX) {
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
      }
    }
  } else if (logo) {
    const lh = W * 0.08;
    const lw = Math.min(W * 0.3, (logo.naturalWidth / logo.naturalHeight) * lh);
    const h = (logo.naturalHeight / logo.naturalWidth) * lw;
    const stepX = lw + W * 0.14;
    const stepY = h + W * 0.12;
    let row = 0;
    for (let y = -diag / 2; y <= diag / 2; y += stepY, row++) {
      const shift = row % 2 ? stepX / 2 : 0;
      for (let x = -diag / 2 - stepX + shift; x <= diag / 2 + stepX; x += stepX) ctx.drawImage(logo, x - lw / 2, y - h / 2, lw, h);
    }
  }
  ctx.restore();
}

export interface RenderOpts {
  style: Style;
  photos: [Photo | null, Photo | null];
  adjust: [Adjust, Adjust];
  caption: string;
  imgs: BrandImages;
  /** 미리보기 배율 (저장은 1) */
  scale: number;
  /** 미리보기 전용 표시 */
  preview?: {
    empty: [string, string];
    masks: boolean;
    selected: number | null;
    active: number | null;
  };
}

/** 사진 한 장을 틀 크기 캔버스에 따로 그려 보정·가리기를 한 뒤 붙인다 */
function renderPhoto(slot: number, p: Photo, c: Cell, a: Adjust, k: number) {
  const off = scratch(slot, c.w * k, c.h * k);
  const ctx = off.getContext('2d')!;
  ctx.setTransform(k, 0, 0, k, -c.x * k, -c.y * k);
  const pl = place(p, c);
  drawPhoto(ctx, p, pl);
  if (!isZeroAdjust(a)) {
    const id = ctx.getImageData(0, 0, off.width, off.height);
    adjustPixels(id.data, a);
    ctx.putImageData(id, 0, 0);
  }
  for (const m of p.masks) applyMask(ctx, m, maskRect(pl, m));
  return off;
}

export function render(canvas: HTMLCanvasElement, o: RenderOpts) {
  const st = o.style;
  const { w: W, h: H } = ratioOf(st.ratio);
  const k = o.scale;
  const cw = Math.round(W * k);
  const ch = Math.round(H * k);
  if (canvas.width !== cw) canvas.width = cw;
  if (canvas.height !== ch) canvas.height = ch;
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const cs = cells(st, W, H);
  const div = dividerHex(st);
  ctx.fillStyle = div ?? '#ffffff';
  ctx.fillRect(0, 0, cw, ch);
  ctx.setTransform(k, 0, 0, k, 0, 0);

  cs.forEach((c, i) => {
    const p = o.photos[i];
    ctx.save();
    cellPath(ctx, c);
    ctx.clip();
    if (p) {
      const off = renderPhoto(i, p, c, o.adjust[i], k);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(off, Math.round(c.x * k), Math.round(c.y * k));
    } else {
      ctx.fillStyle = i === 0 ? '#e7e5ee' : '#dedbe8';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      if (o.preview) {
        const fs = W * 0.034;
        ctx.fillStyle = '#6b6680';
        ctx.font = fontCss('gothic', fs);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // 대각선은 보이는 부분 가운데에
        const cx = c.poly ? (i === 0 ? W * 0.25 : W * 0.75) : c.x + c.w / 2;
        ctx.font = `400 ${fs * 2.2}px sans-serif`;
        ctx.fillText('+', cx, c.y + c.h / 2 - fs * 1.4);
        ctx.font = fontCss('gothic', fs);
        ctx.fillText(o.preview.empty[i], cx, c.y + c.h / 2 + fs * 0.6);
      }
    }
    ctx.restore();
  });

  // 구분선 (붙어 있는 배치에서만 경계 위에)
  if (div && RADIUS_PX[st.radius] === 0) {
    const t = THICKNESS[st.thickness];
    ctx.fillStyle = div;
    ctx.strokeStyle = div;
    if (st.layout === 'side') ctx.fillRect(W / 2 - t / 2, 0, t, H);
    else if (st.layout === 'stack') ctx.fillRect(0, H / 2 - t / 2, W, t);
    else {
      ctx.lineWidth = t;
      ctx.beginPath();
      ctx.moveTo(W * DIAG_TOP, -t);
      ctx.lineTo(W * DIAG_BOTTOM, H + t);
      ctx.stroke();
    }
  }

  if (st.watermark) drawWatermark(ctx, st, o.imgs, W, H);

  const labels = labelTexts(st);
  if (labels) cs.forEach((c, i) => drawLabel(ctx, st, labels[i], i as 0 | 1, c, W, H));

  // 추가 문구: 라벨이 아래에 있으면 위로, 아니면 아래 가운데. 같은 쪽 로고·매장명은 문구 위(아래)로 비킨다
  const hasLabels = !!labels && !!(labels[0] || labels[1]);
  const caption = o.caption.trim();
  const capAtTop = hasLabels && st.labelPos === 'bottom';
  const capFs = W * 0.036;
  const capBand = caption ? capFs * (st.labelStyle === 'simple' ? 1.25 : 1.93) + W * 0.015 : 0;
  drawBrand(ctx, st, o.imgs, W, H, hasLabels, capAtTop ? capBand : 0, capAtTop ? 0 : capBand);
  if (caption) {
    const m = W * 0.03;
    // 대각선 + 모서리 라벨이면 오른쪽 아래에 '후' 라벨이 있어 왼쪽으로 비킨다
    const diagCorner = hasLabels && st.layout === 'diagonal' && st.labelPos === 'corner';
    const capStyle: LabelStyle = st.labelStyle === 'simple' ? 'simple' : 'badge';
    drawTag(ctx, st, caption, capFs, diagCorner ? W * 0.5 : W * 0.86, diagCorner ? W * 0.42 : W / 2,
      capAtTop ? m : H - m, 'center', capAtTop ? 'top' : 'bottom', capStyle);
  }

  // 미리보기 전용: 가리기 영역 테두리, 선택 표시
  if (o.preview?.masks) {
    cs.forEach((c, i) => {
      const p = o.photos[i];
      if (!p) return;
      const pl = place(p, c);
      ctx.save();
      cellPath(ctx, c);
      ctx.clip();
      p.masks.forEach((m) => {
        const r = maskRect(pl, m);
        const sel = o.preview!.selected === m.id;
        ctx.setLineDash(sel ? [] : [10, 8]);
        ctx.lineWidth = sel ? 5 : 3;
        ctx.strokeStyle = '#000000';
        shapePath(ctx, m.shape, r.x, r.y, r.w, r.h);
        ctx.stroke();
        ctx.lineWidth = sel ? 3 : 2;
        ctx.strokeStyle = sel ? '#8b5cf6' : '#ffffff';
        ctx.stroke();
        if (sel) {
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(r.x + r.w, r.y + r.h, HANDLE_R, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#8b5cf6';
          ctx.stroke();
        }
      });
      ctx.restore();
    });
  }
  return { W, H };
}

/** 가리기 크기 조절 점 반지름 (출력 좌표) */
export const HANDLE_R = 22;

/** 구도 맞추기: 전 사진 위에 후 사진을 반투명하게 겹쳐 한 칸 크기로 그린다 */
export function renderAlign(canvas: HTMLCanvasElement, st: Style, photos: [Photo | null, Photo | null], opacity: number, scale: number) {
  const { w: W, h: H } = ratioOf(st.ratio);
  const c0 = cells(st, W, H)[0];
  const cell = { x: 0, y: 0, w: c0.w, h: c0.h, r: 0 };
  const cw = Math.round(cell.w * scale);
  const ch = Math.round(cell.h * scale);
  if (canvas.width !== cw) canvas.width = cw;
  if (canvas.height !== ch) canvas.height = ch;
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#222222';
  ctx.fillRect(0, 0, cw, ch);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  if (photos[0]) drawPhoto(ctx, photos[0], place(photos[0], cell));
  if (photos[1]) {
    ctx.globalAlpha = opacity;
    drawPhoto(ctx, photos[1], place(photos[1], cell));
    ctx.globalAlpha = 1;
  }
  // 3등분 안내선
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  for (const f of [1 / 3, 2 / 3]) {
    ctx.moveTo(cell.w * f, 0); ctx.lineTo(cell.w * f, cell.h);
    ctx.moveTo(0, cell.h * f); ctx.lineTo(cell.w, cell.h * f);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  return cell;
}

// ───────── 파일 ─────────

export type LoadError = 'heic' | 'decode' | 'type' | 'size';

const isHeic = (f: File) => /\.(heic|heif)$/i.test(f.name) || /image\/hei[cf]/i.test(f.type);

/**
 * 사진 불러오기: 휴대폰 사진의 회전 정보는 브라우저가 <img>에 적용해 준다(image-orientation: from-image 기본값).
 * 긴 변을 WORK_MAX로 줄인 캔버스만 남기고 원본은 버린다 — 촬영 위치 같은 메타데이터도 함께 사라진다.
 */
export async function loadPhoto(file: File): Promise<{ src: HTMLCanvasElement; w: number; h: number; ow0: number; oh0: number; thumb: string }> {
  if (file.size > MAX_FILE_MB * 1024 * 1024) throw new Error('size' satisfies LoadError);
  if (file.type && !file.type.startsWith('image/') && !isHeic(file)) throw new Error('type' satisfies LoadError);
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    try {
      await img.decode();
    } catch {
      throw new Error((isHeic(file) ? 'heic' : 'decode') satisfies LoadError);
    }
    const ow0 = img.naturalWidth;
    const oh0 = img.naturalHeight;
    if (!ow0 || !oh0) throw new Error((isHeic(file) ? 'heic' : 'decode') satisfies LoadError);
    const s = Math.min(1, WORK_MAX / Math.max(ow0, oh0));
    const src = makeCanvas(ow0 * s, oh0 * s);
    const ctx = src.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, src.width, src.height);
    img.src = '';
    const ts = 360 / Math.max(src.width, src.height);
    const t = makeCanvas(src.width * ts, src.height * ts);
    t.getContext('2d')!.drawImage(src, 0, 0, t.width, t.height);
    return { src, w: src.width, h: src.height, ow0, oh0, thumb: t.toDataURL('image/jpeg', 0.8) };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** 로고는 저장소에 넣기 위해 긴 변 320px PNG로 줄인다 (투명 배경 유지) */
export async function loadLogo(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    try { await img.decode(); } catch { throw new Error((isHeic(file) ? 'heic' : 'decode') satisfies LoadError); }
    const s = Math.min(1, 320 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = makeCanvas(img.naturalWidth * s, img.naturalHeight * s);
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function fileName(ext: 'jpg' | 'png', d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `before-after-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.${ext}`;
}
