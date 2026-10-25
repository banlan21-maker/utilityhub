/**
 * 타일 시뮬레이터 렌더링 엔진 (DOM 없이 픽셀 배열만 다룬다).
 *
 * - 원근: 면의 네 꼭짓점 ↔ 실제 직사각형(가로 W × 세로 H mm)을 호모그래피로 잇는다.
 *   화면 픽셀마다 역변환으로 실제 위치(mm)를 구하므로 멀수록 타일이 작아지고, 같은 타일은 어느 면에서나 같은 크기다.
 * - 배치: 타일 w×h + 줄눈 g(mm), 줄마다 엇갈림(0, 1/2, 1/3), 기준점(모서리·가운데).
 * - 조명: 원래 사진의 밝기를 흐리게 만든 조명 지도를 타일 색에 곱해 그림자·빛 번짐을 살린다.
 *   유광이면 원래 사진의 밝은 반사(조명 지도보다 밝은 부분)를 더한다.
 * - 가림: keep(0~255)이 있는 곳은 원래 사진을 그대로 보여 준다(가구·사용자가 칠한 부분).
 */

export interface Vec { x: number; y: number }
export type Mat3 = [number, number, number, number, number, number, number, number, number];

/** 단위 정사각형 (0,0)(1,0)(1,1)(0,1) → 사각형 q[0..3] (Heckbert) */
export function squareToQuad(q: Vec[]): Mat3 {
  const [p0, p1, p2, p3] = q;
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x, dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y, dy3 = p0.y - p1.y + p2.y - p3.y;
  let g = 0, h = 0;
  if (Math.abs(dx3) > 1e-12 || Math.abs(dy3) > 1e-12) {
    const den = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / den;
    h = (dx1 * dy3 - dx3 * dy1) / den;
  }
  return [
    p1.x - p0.x + g * p1.x, p3.x - p0.x + h * p3.x, p0.x,
    p1.y - p0.y + g * p1.y, p3.y - p0.y + h * p3.y, p0.y,
    g, h, 1,
  ];
}

export function invert3(m: Mat3): Mat3 {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  const k = 1 / det;
  return [
    A * k, -(b * i - c * h) * k, (b * f - c * e) * k,
    B * k, (a * i - c * g) * k, -(a * f - c * d) * k,
    C * k, -(a * h - b * g) * k, (a * e - b * d) * k,
  ];
}

export function applyH(m: Mat3, x: number, y: number): Vec {
  const w = m[6] * x + m[7] * y + m[8];
  return { x: (m[0] * x + m[1] * y + m[2]) / w, y: (m[3] * x + m[4] * y + m[5]) / w };
}

/** 볼록 사각형인지(꼭짓점 순서가 꼬이지 않았는지) */
export function isConvex(q: Vec[]) {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = q[i], b = q[(i + 1) % 4], c = q[(i + 2) % 4];
    const z = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (Math.abs(z) < 1e-12) return false;
    const s = Math.sign(z);
    if (sign && s !== sign) return false;
    sign = s;
  }
  return true;
}

// ───── 배치 ─────

export type Stagger = 0 | 0.5 | 0.333;
export type Origin = 'corner' | 'center';

export interface Layout {
  /** 타일 가로·세로 mm (면의 가로·세로 방향 기준) */
  w: number;
  h: number;
  grout: number;
  stagger: Stagger;
  origin: Origin;
}

/** 면 가로 W × 세로 H(mm)에서 아래쪽 모서리 기준 좌표로 바꿀 때의 시작점 */
function originOffset(W: number, H: number, l: Layout) {
  if (l.origin === 'corner') return { ox: 0, oy: 0 };
  const px = l.w + l.grout, py = l.h + l.grout;
  // 가운데: 면 한가운데에 타일 한 장의 중심이 오게
  return { ox: W / 2 - l.w / 2 - Math.floor((W / 2 - l.w / 2) / px) * px, oy: H / 2 - l.h / 2 - Math.floor((H / 2 - l.h / 2) / py) * py };
}

/** 면에 들어가는 타일 수(잘린 장 포함)와 그중 잘린 장 */
export function countTiles(W: number, H: number, l: Layout) {
  const px = l.w + l.grout, py = l.h + l.grout;
  if (!(W > 0 && H > 0 && l.w > 0 && l.h > 0)) return { total: 0, cut: 0 };
  const { ox, oy } = originOffset(W, H, l);
  let total = 0, cut = 0;
  const r0 = Math.floor((0 - oy) / py) - 1, r1 = Math.ceil((H - oy) / py) + 1;
  for (let r = r0; r <= r1; r++) {
    const y0 = oy + r * py, y1 = y0 + l.h;
    if (y1 <= 1e-6 || y0 >= H - 1e-6) continue;
    const shift = ((((r * l.stagger) % 1) + 1) % 1) * px;
    const c0 = Math.floor((0 - ox + shift) / px) - 1, c1 = Math.ceil((W - ox + shift) / px) + 1;
    for (let c = c0; c <= c1; c++) {
      const x0 = ox - shift + c * px, x1 = x0 + l.w;
      if (x1 <= 1e-6 || x0 >= W - 1e-6) continue;
      total++;
      if (x0 < -1e-6 || x1 > W + 1e-6 || y0 < -1e-6 || y1 > H + 1e-6) cut++;
    }
  }
  return { total, cut };
}

// ───── 텍스처 ─────

export interface Tex { w: number; h: number; data: Uint8ClampedArray }
/** 0번이 원본, 다음 단계는 가로세로 절반 (멀리 있는 타일의 깜빡임 방지) */
export type Mip = Tex[];

export function buildMips(t: Tex): Mip {
  const levels: Tex[] = [t];
  let cur = t;
  while (cur.w > 4 && cur.h > 4 && levels.length < 9) {
    const w = Math.max(1, cur.w >> 1), h = Math.max(1, cur.h >> 1);
    const d = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      for (let k = 0; k < 4; k++) {
        const i = (x * 2 + y * 2 * cur.w) * 4 + k;
        d[(x + y * w) * 4 + k] = (cur.data[i] + cur.data[i + 4] + cur.data[i + cur.w * 4] + cur.data[i + cur.w * 4 + 4]) / 4;
      }
    }
    cur = { w, h, data: d };
    levels.push(cur);
  }
  return levels;
}

// 시드 값 노이즈
function hash2(x: number, y: number, seed: number) {
  let h = (x * 374761393 + y * 668265263 + seed * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function valueNoise(x: number, y: number, seed: number) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const s = (t: number) => t * t * (3 - 2 * t);
  const a = hash2(xi, yi, seed), b = hash2(xi + 1, yi, seed), c = hash2(xi, yi + 1, seed), d = hash2(xi + 1, yi + 1, seed);
  const u = s(xf), v = s(yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number, seed: number, oct = 4) {
  let sum = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { sum += amp * valueNoise(x * f, y * f, seed + i * 17); f *= 2; amp /= 2; }
  return sum / (1 - Math.pow(0.5, oct));
}

export interface TilePreset { id: string; ko: string; en: string; size: [number, number]; gloss: boolean; swatch: string }
export const TILE_PRESETS: TilePreset[] = [
  { id: 'white', ko: '화이트 무광', en: 'Matte white', size: [300, 600], gloss: false, swatch: '#ecebe7' },
  { id: 'warmgrey', ko: '웜그레이', en: 'Warm grey', size: [600, 600], gloss: false, swatch: '#b9b3aa' },
  { id: 'concrete', ko: '콘크리트 그레이', en: 'Concrete grey', size: [600, 600], gloss: false, swatch: '#74726e' },
  { id: 'beige', ko: '베이지', en: 'Beige', size: [300, 600], gloss: false, swatch: '#d9cab0' },
  { id: 'black', ko: '블랙', en: 'Black', size: [600, 600], gloss: true, swatch: '#2e2e31' },
  { id: 'marble', ko: '화이트 대리석', en: 'White marble', size: [600, 1200], gloss: true, swatch: '#e9e8e5' },
  { id: 'terrazzo', ko: '테라조', en: 'Terrazzo', size: [600, 600], gloss: false, swatch: '#ddd8cf' },
  { id: 'wood', ko: '우드 포세린', en: 'Wood-look', size: [200, 1200], gloss: false, swatch: '#a8774f' },
  { id: 'subway', ko: '화이트 유광', en: 'Glossy white', size: [100, 300], gloss: true, swatch: '#f4f4f2' },
];

/** 견본 타일 텍스처 (가로 w × 세로 h mm 비율로 생성, 같은 seed면 같은 무늬) */
export const SHEET = 2;
export function presetTexture(id: string, wmm0: number, hmm0: number, seed = 1, base = 256): Tex {
  const wmm = wmm0 * SHEET, hmm = hmm0 * SHEET;
  // 1mm당 픽셀을 가로세로 같게 (타일 한 장의 짧은 변 base px, 전체 긴 변 최대 1536px)
  const ppm = Math.min((base * SHEET) / Math.min(wmm, hmm), 1536 / Math.max(wmm, hmm));
  const w = Math.max(8, Math.round(wmm * ppm)), h = Math.max(8, Math.round(hmm * ppm));
  const d = new Uint8ClampedArray(w * h * 4);
  const mmPerPx = 1 / ppm;
  const chips: { x: number; y: number; r: number; c: number[] }[] = [];
  if (id === 'terrazzo') {
    const n = Math.round((wmm * hmm) / 900);
    const cols = [[120, 120, 118], [60, 60, 62], [168, 92, 70], [190, 186, 178], [140, 150, 140]];
    for (let i = 0; i < n; i++) chips.push({ x: hash2(i, 1, seed) * w, y: hash2(i, 2, seed) * h, r: (1.5 + hash2(i, 3, seed) * 5) / mmPerPx, c: cols[Math.floor(hash2(i, 4, seed) * cols.length)] });
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const X = x * mmPerPx, Y = y * mmPerPx; // mm
    let r = 0, g = 0, b = 0;
    const n1 = fbm(X / 120, Y / 120, seed), n2 = fbm(X / 18, Y / 18, seed + 5, 3);
    switch (id) {
      case 'white': { const v = 236 + (n2 - 0.5) * 6; r = v + 2; g = v + 1; b = v - 2; break; }
      case 'subway': { const v = 243 + (n2 - 0.5) * 4; r = v; g = v; b = v - 1; break; }
      case 'warmgrey': { const v = (n1 - 0.5) * 14 + (n2 - 0.5) * 6; r = 186 + v; g = 180 + v; b = 171 + v; break; }
      case 'concrete': { const v = (n1 - 0.5) * 38 + (n2 - 0.5) * 14; r = 116 + v; g = 114 + v; b = 110 + v; break; }
      case 'beige': { const v = (n1 - 0.5) * 12 + (n2 - 0.5) * 6; r = 216 + v; g = 202 + v; b = 178 + v; break; }
      case 'black': { const v = (n1 - 0.5) * 8 + (n2 - 0.5) * 4; r = 44 + v; g = 44 + v; b = 47 + v; break; }
      case 'marble': {
        const warp = fbm(X / 520, Y / 520, seed, 3) * 2.4;
        const main = Math.abs(Math.sin((X * 0.0016 + Y * 0.0026 + warp) * Math.PI));
        const fine = Math.abs(Math.sin((X * 0.0042 - Y * 0.0012 + fbm(X / 260, Y / 260, seed + 9, 3) * 2.2) * Math.PI));
        const vein = Math.max(0, 1 - main / 0.035) * (0.55 + 0.45 * fbm(X / 90, Y / 90, seed + 2, 3));
        const hair = Math.max(0, 1 - fine / 0.02) * 0.45;
        const v = 236 + (n1 - 0.5) * 10 + (n2 - 0.5) * 4;
        const dark = vein * 95 + hair * 45;
        r = v - dark; g = v - dark; b = v - dark * 0.92 + 1;
        break;
      }
      case 'terrazzo': { const v = (n2 - 0.5) * 6; r = 228 + v; g = 224 + v; b = 216 + v; break; }
      case 'wood': {
        // 결은 타일의 긴 방향으로
        const along = hmm >= wmm ? Y : X, across = hmm >= wmm ? X : Y;
        const ring = Math.sin((across / 3.2 + fbm(along / 220, across / 30, seed, 4) * 6) * Math.PI);
        const v = (ring * 0.5 + 0.5) * 26 + (fbm(along / 40, across / 6, seed + 3, 3) - 0.5) * 22;
        r = 150 + v; g = 104 + v * 0.75; b = 66 + v * 0.5;
        break;
      }
      default: { r = g = b = 200; }
    }
    if (chips.length) for (const c of chips) {
      const dx = x - c.x, dy = y - c.y;
      if (dx * dx + dy * dy < c.r * c.r * (0.75 + 0.5 * valueNoise(x / 3, y / 3, seed))) { r = c.c[0]; g = c.c[1]; b = c.c[2]; break; }
    }
    const i = (x + y * w) * 4;
    d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
  }
  return { w, h, data: d };
}

// ───── 조명 지도 ─────

export interface LightMap { w: number; h: number; data: Float32Array; cell: number }

const lumOf = (d: Uint8ClampedArray, i: number) => (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;

/** 가려진 곳(keep)을 뺀 사진 밝기를 거친 격자로 평균 내고 흐리게 한다 */
export function buildLightMap(photo: Uint8ClampedArray, width: number, height: number, keep: Uint8Array | null, cols = 40): LightMap {
  const cell = Math.max(2, Math.ceil(width / cols));
  const gw = Math.ceil(width / cell), gh = Math.ceil(height / cell);
  const sum = new Float32Array(gw * gh), wt = new Float32Array(gw * gh);
  for (let y = 0; y < height; y += 2) for (let x = 0; x < width; x += 2) {
    const p = x + y * width;
    const k = keep ? 1 - keep[p] / 255 : 1;
    if (k <= 0.05) continue;
    const gi = Math.floor(x / cell) + Math.floor(y / cell) * gw;
    sum[gi] += lumOf(photo, p * 4) * k;
    wt[gi] += k;
  }
  let data = new Float32Array(gw * gh);
  const known = new Uint8Array(gw * gh);
  for (let i = 0; i < data.length; i++) if (wt[i] > 2) { data[i] = sum[i] / wt[i]; known[i] = 1; }
  // 비어 있는 칸(가구 뒤)은 이웃 값으로 채운다
  for (let pass = 0; pass < gw + gh; pass++) {
    let changed = false;
    const next = data.slice(), nk = known.slice();
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
      const i = x + y * gw;
      if (known[i]) continue;
      let s = 0, n = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= gw || yy >= gh) continue;
        const j = xx + yy * gw;
        if (known[j]) { s += data[j]; n++; }
      }
      if (n) { next[i] = s / n; nk[i] = 1; changed = true; }
    }
    data = next; known.set(nk);
    if (!changed) break;
  }
  // 3×3 흐림 두 번
  for (let pass = 0; pass < 2; pass++) {
    const out = new Float32Array(data.length);
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
      let s = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= gw || yy >= gh) continue;
        s += data[xx + yy * gw]; n++;
      }
      out[x + y * gw] = s / n;
    }
    data = out;
  }
  return { w: gw, h: gh, data, cell };
}

function sampleLight(m: LightMap, x: number, y: number) {
  const gx = Math.min(m.w - 1.001, Math.max(0, x / m.cell - 0.5)), gy = Math.min(m.h - 1.001, Math.max(0, y / m.cell - 0.5));
  const xi = Math.floor(gx), yi = Math.floor(gy), xf = gx - xi, yf = gy - yi;
  const i = xi + yi * m.w;
  const a = m.data[i], b = m.data[Math.min(i + 1, m.data.length - 1)], c = m.data[Math.min(i + m.w, m.data.length - 1)], d = m.data[Math.min(i + m.w + 1, m.data.length - 1)];
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}

// ───── 렌더링 ─────

/** 밝은 부분을 부드럽게 눌러 하얗게 뭉개지지 않게 (210 넘는 값만) */
const soft = (v: number) => (v <= 210 ? v : 210 + 45 * (1 - Math.exp(-(v - 210) / 45)));

export interface ZoneRender {
  /** 픽셀 좌표 꼭짓점: 왼쪽 위, 오른쪽 위, 오른쪽 아래, 왼쪽 아래 (바닥은 안쪽 왼쪽부터) */
  quad: Vec[];
  /** 실제 가로·세로 mm */
  W: number;
  H: number;
  layout: Layout;
  tex: Mip;
  grout: [number, number, number];
  /** 조명 반영 0~1 */
  shade: number;
  gloss: boolean;
  /** 텍스처 한 장에 타일이 가로세로 몇 장 들어 있는지 (견본은 2, 올린 사진은 1) */
  sheet: number;
  /** 타일마다 무늬를 뒤집어 반복을 숨긴다 (결 방향이 있는 무늬는 끈다) */
  vary: boolean;
}

/**
 * photo 위에 면들을 그려 out(RGBA)에 쓴다. keep이 있으면 마지막에 원래 사진으로 덮는다.
 */
export function render(out: Uint8ClampedArray, photo: Uint8ClampedArray, width: number, height: number, zones: ZoneRender[], light: LightMap, keep: Uint8Array | null) {
  out.set(photo);
  for (const z of zones) {
    if (!isConvex(z.quad) || !(z.W > 0 && z.H > 0 && z.layout.w > 0 && z.layout.h > 0)) continue;
    const Hm = invert3(squareToQuad(z.quad));
    const [A, B, C, D, E, F, G, Hh, I] = Hm;
    const xs = z.quad.map(p => p.x), ys = z.quad.map(p => p.y);
    const x0 = Math.max(0, Math.floor(Math.min(...xs))), x1 = Math.min(width - 1, Math.ceil(Math.max(...xs)));
    const y0 = Math.max(0, Math.floor(Math.min(...ys))), y1 = Math.min(height - 1, Math.ceil(Math.max(...ys)));
    if (x1 < x0 || y1 < y0) continue;

    // 면의 평균 밝기 (조명 지도 기준)
    let ms = 0, mn = 0;
    for (let y = y0; y <= y1; y += 8) for (let x = x0; x <= x1; x += 8) {
      const w = G * x + Hh * y + I, u = (A * x + B * y + C) / w, v = (D * x + E * y + F) / w;
      if (u < 0 || u > 1 || v < 0 || v > 1) continue;
      ms += sampleLight(light, x, y); mn++;
    }
    const mean = mn ? Math.max(0.02, ms / mn) : 0.5;

    const L = z.layout, px = L.w + L.grout, py = L.h + L.grout;
    const { ox, oy } = originOffset(z.W, z.H, L);
    const tex = z.tex, t0 = tex[0];
    const sheet = Math.max(1, z.sheet | 0);
    const texel = (L.w * sheet) / t0.w; // mm per texel (0단계)
    const gr = z.grout;

    for (let y = y0; y <= y1; y++) {
      let nu = A * x0 + B * y + C, nv = D * x0 + E * y + F, nw = G * x0 + Hh * y + I;
      for (let x = x0; x <= x1; x++, nu += A, nv += D, nw += G) {
        const u = nu / nw, v = nv / nw;
        if (u < 0 || u > 1 || v < 0 || v > 1) continue;
        // 픽셀 하나가 덮는 실제 길이(mm)
        const iw = 1 / nw;
        const dudx = (A - u * G) * iw, dvdx = (D - v * G) * iw, dudy = (B - u * Hh) * iw, dvdy = (E - v * Hh) * iw;
        const fp = Math.max(Math.hypot(dudx * z.W, dvdx * z.H), Math.hypot(dudy * z.W, dvdy * z.H), 1e-6);

        const X = u * z.W - ox;
        const Y = (1 - v) * z.H - oy; // 아래 모서리에서 위로
        const r = Math.floor(Y / py);
        const ly = Y - r * py;
        const shift = (((r * L.stagger) % 1) + 1) % 1 * px;
        const Xs = X + shift;
        const c = Math.floor(Xs / px);
        const lx = Xs - c * px;

        // 줄눈 경계 부드럽게(픽셀 크기만큼)
        const sx = lx <= L.w ? Math.min(lx, L.w - lx) : -Math.min(lx - L.w, px - lx);
        const sy = ly <= L.h ? Math.min(ly, L.h - ly) : -Math.min(ly - L.h, py - ly);
        const cov = Math.min(1, Math.max(0, sx / fp + 0.5)) * Math.min(1, Math.max(0, sy / fp + 0.5));

        let tr = gr[0], tg = gr[1], tb = gr[2];
        if (cov > 0) {
          let level = 0, ratio = fp / texel;
          while (ratio >= 2 && level < tex.length - 1) { ratio /= 2; level++; }
          const T = tex[level];
          let s = Math.min(0.9999, Math.max(0, lx / L.w)), t = Math.min(0.9999, Math.max(0, 1 - ly / L.h));
          if (z.vary) {
            const hv = hash2(c, r, 7);
            if (hv < 0.5) s = 0.9999 - s;
            if (hv > 0.25 && hv < 0.75) t = 0.9999 - t;
          }
          if (sheet > 1) {
            const q = hash2(c, r, 11);
            const qi = Math.min(sheet * sheet - 1, Math.floor(q * sheet * sheet));
            s = ((qi % sheet) + s) / sheet;
            t = (Math.floor(qi / sheet) + t) / sheet;
          }
          const ti = ((s * T.w) | 0) + ((t * T.h) | 0) * T.w;
          const d = T.data;
          tr = d[ti * 4] * cov + tr * (1 - cov);
          tg = d[ti * 4 + 1] * cov + tg * (1 - cov);
          tb = d[ti * 4 + 2] * cov + tb * (1 - cov);
        }
        const pi = (x + y * width) * 4;
        const lum = sampleLight(light, x, y);
        // 상대 밝기를 살짝 눌러(0.85제곱) 밝은 벽이 하얗게 날아가지 않게
        const f = Math.min(1.5, Math.max(0.12, Math.pow(Math.max(0.01, lum / mean), 0.85 * z.shade)));
        let add = 0;
        if (z.gloss) {
          const hi = lumOf(photo, pi) - lum;
          if (hi > 0.04) add = (hi - 0.04) * 255 * 0.9;
        }
        out[pi] = soft(tr * f + add);
        out[pi + 1] = soft(tg * f + add);
        out[pi + 2] = soft(tb * f + add);
      }
    }
  }
  if (keep) {
    for (let p = 0, n = width * height; p < n; p++) {
      const k = keep[p];
      if (!k) continue;
      const i = p * 4, a = k / 255;
      out[i] = out[i] * (1 - a) + photo[i] * a;
      out[i + 1] = out[i + 1] * (1 - a) + photo[i + 1] * a;
      out[i + 2] = out[i + 2] * (1 - a) + photo[i + 2] * a;
    }
  }
}

// ───── 샘플 욕실 ─────

/**
 * 샘플 사진의 원근(정규화 좌표): 소실점 (0.511, 0.487), 정면 벽 x 0.336~0.703 · y 0.323~0.652.
 * 정면 벽 폭 1.5m를 기준으로 높이 2.4m, 카메라 높이 약 1.2m, 사진 아래 끝까지 바닥 2.05m
 * (원래 바닥 타일 줄눈 간격이 깊이 방향으로 일정하게 맞는 값). 가까운 쪽 꼭짓점은 소실점에서 3.23배.
 */
const VP = { x: 0.511, y: 0.487 }, BACK = { l: 0.336, r: 0.703, t: 0.323, b: 0.652 }, K = 3.23;
const near = (x: number, y: number) => ({ x: VP.x + K * (x - VP.x), y: VP.y + K * (y - VP.y) });
export type ZoneId = 'floor' | 'back' | 'left' | 'right';
export const SAMPLE_ZONES: Record<ZoneId, { quad: Vec[]; W: number; H: number }> = {
  back: { quad: [{ x: BACK.l, y: BACK.t }, { x: BACK.r, y: BACK.t }, { x: BACK.r, y: BACK.b }, { x: BACK.l, y: BACK.b }], W: 1500, H: 2400 },
  floor: { quad: [{ x: BACK.l, y: BACK.b }, { x: BACK.r, y: BACK.b }, near(BACK.r, BACK.b), near(BACK.l, BACK.b)], W: 1500, H: 2050 },
  left: { quad: [near(BACK.l, BACK.t), { x: BACK.l, y: BACK.t }, { x: BACK.l, y: BACK.b }, near(BACK.l, BACK.b)], W: 2050, H: 2400 },
  right: { quad: [{ x: BACK.r, y: BACK.t }, near(BACK.r, BACK.t), near(BACK.r, BACK.b), { x: BACK.r, y: BACK.b }], W: 2050, H: 2400 },
};
