/**
 * 타일 시뮬레이터 렌더링 엔진 (DOM 없이 픽셀 배열만 다룬다).
 *
 * - 원근: 면의 네 꼭짓점 ↔ 실제 직사각형(가로 W × 세로 H mm)을 호모그래피로 잇고, 화면 픽셀마다 실제 위치(mm)를 구한다.
 *   멀수록 타일이 작아지고 같은 타일은 어느 면에서나 같은 크기다. 면 가장자리는 픽셀 크기만큼 부드럽게 섞는다.
 * - 타일: 실사 텍스처(이음매 없는 사진)에서 타일마다 다른 위치·방향을 잘라 쓰고(반복·대칭 무늬 방지), 장마다 밝기를 조금씩 다르게.
 *   삼선형 보간(밉맵 두 단계 + 양선형)으로 가까운 타일은 매끄럽게, 먼 타일은 깜빡이지 않게.
 * - 줄눈: mm 단위, 모래 질감과 오목한 그늘, 타일 모서리 베벨 그늘(같은 색 줄눈이어도 이음매가 은은하게 보인다).
 * - 조명: 원래 사진의 색 있는 밝기를 흐리게 만든 조명 지도로 곱해 그림자·간접등 빛 색을 살리고, 면이 만나는 모서리는 살짝 어둡게.
 * - 광택: 원래 사진의 밝은 반사를 더하고, 바닥은 위에 있는 물건·벽을 화면 공간에서 뒤집어 흐린 반사로 비춘다.
 * - 거울(샘플 욕실): 카메라 위치를 알아 거울에 비친 광선을 추적해 거울 속 벽에도 새 타일을 그린다.
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
  const k = 1 / (a * A + b * B + c * C);
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

export type Origin = 'corner' | 'center';

export interface Layout {
  /** 타일 가로·세로 mm (면의 가로·세로 방향 기준) */
  w: number;
  h: number;
  grout: number;
  /** 줄마다 밀리는 비율: 0, 1/2, 1/3 */
  stagger: number;
  origin: Origin;
}

/** r번째 줄이 밀리는 비율(0~1), 1/3 같은 값의 부동소수 오차를 없앤다 */
const rowShift = (r: number, s: number) => {
  if (!s) return 0;
  const v = r * s, fr = v - Math.floor(v + 1e-6);
  return fr < 1e-6 ? 0 : fr;
};

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
  const eps = 0.5; // 0.5mm 미만으로 걸치는 조각은 세지 않는다
  let total = 0, cut = 0;
  const r0 = Math.floor((0 - oy) / py) - 1, r1 = Math.ceil((H - oy) / py) + 1;
  for (let r = r0; r <= r1; r++) {
    const y0 = oy + r * py, y1 = y0 + l.h;
    if (y1 <= eps || y0 >= H - eps) continue;
    const shift = rowShift(r, l.stagger) * px;
    const c0 = Math.floor((0 - ox + shift) / px) - 1, c1 = Math.ceil((W - ox + shift) / px) + 1;
    for (let c = c0; c <= c1; c++) {
      const x0 = ox - shift + c * px, x1 = x0 + l.w;
      if (x1 <= eps || x0 >= W - eps) continue;
      total++;
      if (x0 < -eps || x1 > W + eps || y0 < -eps || y1 > H + eps) cut++;
    }
  }
  return { total, cut };
}

// ───── 텍스처 ─────

export interface Tex { w: number; h: number; data: Uint8ClampedArray }

export interface TexInfo {
  /** 0번이 원본, 다음 단계는 가로세로 절반 */
  levels: Tex[];
  /** 0단계 텍스처가 덮는 실제 크기 mm */
  mmW: number;
  mmH: number;
  /** 이음매 없는 텍스처면 경계를 넘어 감아 쓴다 */
  seamless: boolean;
  /** 타일마다 돌리는 방향 수: 1(그대로) · 2(0/180°) · 4(90°씩) */
  rotations: 1 | 2 | 4;
  /** 결이 텍스처 가로 방향이면 true — 세로로 긴 타일은 텍스처를 90° 돌려 결을 긴 쪽에 맞춘다 */
  grainX: boolean;
  /** 장마다 밝기 차이(±) */
  jitter: number;
}

export function buildMips(t: Tex): Tex[] {
  const levels: Tex[] = [t];
  let cur = t;
  while (cur.w > 4 && cur.h > 4 && levels.length < 10) {
    const w = cur.w >> 1, h = cur.h >> 1;
    const d = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (x * 2 + y * 2 * cur.w) * 4, j = (x + y * w) * 4;
      for (let k = 0; k < 4; k++) d[j + k] = (cur.data[i + k] + cur.data[i + 4 + k] + cur.data[i + cur.w * 4 + k] + cur.data[i + cur.w * 4 + 4 + k] + 2) >> 2;
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

export type Finish = 'matte' | 'satin' | 'polished';
export const FINISH_GLOSS: Record<Finish, number> = { matte: 0, satin: 0.45, polished: 1 };

export interface TilePreset {
  id: string; ko: string; en: string;
  size: [number, number];
  finish: Finish;
  /** 모서리 베벨 폭 mm */
  bevel: number;
  swatch: string;
  /** 실사 텍스처 (ambientCG CC0) 또는 단색 */
  tex?: { src: string; mm: [number, number]; rotations: 1 | 2 | 4; grainX: boolean; gain?: [number, number, number] };
  plain?: [number, number, number];
  jitter: number;
}
const TX = '/images/tile-visualizer/tex/';
export const TILE_PRESETS: TilePreset[] = [
  { id: 'white', ko: '화이트 무광', en: 'Matte white', size: [300, 600], finish: 'matte', bevel: 0.8, swatch: '#ecebe7', plain: [236, 235, 231], jitter: 0.012 },
  { id: 'subway', ko: '화이트 유광', en: 'Glossy white', size: [100, 300], finish: 'polished', bevel: 2.5, swatch: '#f4f4f2', plain: [242, 242, 240], jitter: 0.015 },
  { id: 'warmgrey', ko: '웜그레이', en: 'Warm grey', size: [600, 600], finish: 'matte', bevel: 0.8, swatch: '#b9b3aa', plain: [186, 180, 171], jitter: 0.02 },
  { id: 'beige', ko: '베이지', en: 'Beige', size: [300, 600], finish: 'matte', bevel: 0.8, swatch: '#d9cab0', plain: [216, 202, 178], jitter: 0.02 },
  { id: 'concrete', ko: '라이트 콘크리트', en: 'Light concrete', size: [600, 600], finish: 'matte', bevel: 0.8, swatch: '#bdbcb8', tex: { src: TX + 'concrete.webp', mm: [1600, 800], rotations: 2, grainX: true }, jitter: 0.03 },
  { id: 'darkconcrete', ko: '다크 콘크리트', en: 'Dark concrete', size: [600, 600], finish: 'matte', bevel: 0.8, swatch: '#6f6e6b', tex: { src: TX + 'concrete.webp', mm: [1600, 800], rotations: 2, grainX: true, gain: [0.5, 0.5, 0.5] }, jitter: 0.03 },
  { id: 'marble', ko: '화이트 대리석', en: 'White marble', size: [600, 1200], finish: 'polished', bevel: 0.6, swatch: '#e9e8e5', tex: { src: TX + 'marble-white.webp', mm: [1300, 1300], rotations: 4, grainX: false }, jitter: 0.01 },
  { id: 'blackmarble', ko: '블랙 대리석', en: 'Black marble', size: [600, 600], finish: 'polished', bevel: 0.6, swatch: '#2c2c2e', tex: { src: TX + 'marble-black.webp', mm: [1100, 1100], rotations: 4, grainX: false }, jitter: 0.01 },
  { id: 'travertine', ko: '트래버틴', en: 'Travertine', size: [600, 1200], finish: 'satin', bevel: 0.8, swatch: '#d8c6a2', tex: { src: TX + 'travertine.webp', mm: [1200, 1200], rotations: 2, grainX: true }, jitter: 0.02 },
  { id: 'terrazzo', ko: '테라조', en: 'Terrazzo', size: [600, 600], finish: 'satin', bevel: 0.6, swatch: '#ddd8cf', tex: { src: TX + 'terrazzo.webp', mm: [700, 700], rotations: 4, grainX: false }, jitter: 0.012 },
  { id: 'wood', ko: '우드 포세린', en: 'Wood-look', size: [200, 1200], finish: 'matte', bevel: 0.8, swatch: '#7b6a5a', tex: { src: TX + 'wood.webp', mm: [1400, 1400], rotations: 2, grainX: true }, jitter: 0.05 },
];

/** 단색 타일: 아주 약한 얼룩만 있는 텍스처 (이음매 없는 텍스처가 아니므로 타일 2장 크기로 만든다) */
export function plainTexture(rgb: [number, number, number], wmm: number, hmm: number, seed = 1): { tex: Tex; mmW: number; mmH: number } {
  const mmW = wmm * 2, mmH = hmm * 2;
  const ppm = Math.min(512 / Math.min(mmW, mmH), 1024 / Math.max(mmW, mmH));
  const w = Math.max(8, Math.round(mmW * ppm)), h = Math.max(8, Math.round(mmH * ppm));
  const d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const X = x / ppm, Y = y / ppm;
    const v = (fbm(X / 140, Y / 140, seed, 3) - 0.5) * 5 + (valueNoise(X / 6, Y / 6, seed + 5) - 0.5) * 3;
    const i = (x + y * w) * 4;
    d[i] = rgb[0] + v; d[i + 1] = rgb[1] + v; d[i + 2] = rgb[2] + v; d[i + 3] = 255;
  }
  return { tex: { w, h, data: d }, mmW, mmH };
}

/** 텍스처 색에 배율을 곱한다(같은 사진으로 밝은·어두운 변형) */
export function gainTexture(t: Tex, gain: [number, number, number]): Tex {
  const d = new Uint8ClampedArray(t.data.length);
  for (let i = 0; i < d.length; i += 4) { d[i] = t.data[i] * gain[0]; d[i + 1] = t.data[i + 1] * gain[1]; d[i + 2] = t.data[i + 2] * gain[2]; d[i + 3] = 255; }
  return { w: t.w, h: t.h, data: d };
}

// ───── 조명 지도 ─────

export interface LightMap { w: number; h: number; cell: number; r: Float32Array; g: Float32Array; b: Float32Array; l: Float32Array }

/**
 * 가려진 곳(keep)을 뺀 사진 색을 격자로 평균 내고 흐리게 한다.
 * cols: 가로 칸 수 (거칠면 큰 그림자·빛 번짐만, 촘촘하면 반사 하이라이트까지)
 */
export function buildLightMap(photo: Uint8ClampedArray, width: number, height: number, keep: Uint8Array | null, cols = 44, blur = 2): LightMap {
  const cell = Math.max(2, Math.ceil(width / cols));
  const gw = Math.ceil(width / cell), gh = Math.ceil(height / cell), n = gw * gh;
  const sr = new Float32Array(n), sg = new Float32Array(n), sb = new Float32Array(n), wt = new Float32Array(n);
  const step = cell >= 8 ? 2 : 1;
  for (let y = 0; y < height; y += step) for (let x = 0; x < width; x += step) {
    const p = x + y * width;
    const k = keep ? 1 - keep[p] / 255 : 1;
    if (k <= 0.05) continue;
    const gi = Math.floor(x / cell) + Math.floor(y / cell) * gw, i = p * 4;
    sr[gi] += (photo[i] / 255) * k; sg[gi] += (photo[i + 1] / 255) * k; sb[gi] += (photo[i + 2] / 255) * k; wt[gi] += k;
  }
  let R = new Float32Array(n), G = new Float32Array(n), B = new Float32Array(n);
  const known = new Uint8Array(n);
  const minW = ((cell * cell) / (step * step)) * 0.15;
  for (let i = 0; i < n; i++) if (wt[i] > minW) { R[i] = sr[i] / wt[i]; G[i] = sg[i] / wt[i]; B[i] = sb[i] / wt[i]; known[i] = 1; }
  // 비어 있는 칸(가구 뒤)은 이웃 값으로 채운다
  for (let pass = 0; pass < gw + gh; pass++) {
    let changed = false;
    const nk = known.slice();
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
      const i = x + y * gw;
      if (known[i]) continue;
      let r = 0, g = 0, b = 0, c = 0;
      if (x > 0 && known[i - 1]) { r += R[i - 1]; g += G[i - 1]; b += B[i - 1]; c++; }
      if (x < gw - 1 && known[i + 1]) { r += R[i + 1]; g += G[i + 1]; b += B[i + 1]; c++; }
      if (y > 0 && known[i - gw]) { r += R[i - gw]; g += G[i - gw]; b += B[i - gw]; c++; }
      if (y < gh - 1 && known[i + gw]) { r += R[i + gw]; g += G[i + gw]; b += B[i + gw]; c++; }
      if (c) { R[i] = r / c; G[i] = g / c; B[i] = b / c; nk[i] = 1; changed = true; }
    }
    known.set(nk);
    if (!changed) break;
  }
  // 3×3 흐림
  for (let pass = 0; pass < blur; pass++) {
    const r2 = new Float32Array(n), g2 = new Float32Array(n), b2 = new Float32Array(n);
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
      let r = 0, g = 0, b = 0, c = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= gw || yy >= gh) continue;
        const j = xx + yy * gw;
        r += R[j]; g += G[j]; b += B[j]; c++;
      }
      const i = x + y * gw;
      r2[i] = r / c; g2[i] = g / c; b2[i] = b / c;
    }
    R = r2; G = g2; B = b2;
  }
  const L = new Float32Array(n);
  for (let i = 0; i < n; i++) L[i] = 0.2126 * R[i] + 0.7152 * G[i] + 0.0722 * B[i];
  return { w: gw, h: gh, cell, r: R, g: G, b: B, l: L };
}

/** 격자 값을 양선형으로 읽는다 */
function sampleMap(m: LightMap, a: Float32Array, x: number, y: number) {
  const gx = Math.min(m.w - 1.0001, Math.max(0, x / m.cell - 0.5)), gy = Math.min(m.h - 1.0001, Math.max(0, y / m.cell - 0.5));
  const xi = gx | 0, yi = gy | 0, xf = gx - xi, yf = gy - yi;
  const i = xi + yi * m.w, x1 = xi + 1 < m.w ? 1 : 0, y1 = yi + 1 < m.h ? m.w : 0;
  const p = a[i], q = a[i + x1], r = a[i + y1], s = a[i + x1 + y1];
  return p + (q - p) * xf + (r - p) * yf + (p - q - r + s) * xf * yf;
}

// ───── 렌더링 ─────

export interface ZoneRender {
  /** 픽셀 좌표 꼭짓점: 왼쪽 위, 오른쪽 위, 오른쪽 아래, 왼쪽 아래 (바닥은 안쪽 왼쪽부터) */
  quad: Vec[];
  /** 실제 가로·세로 mm */
  W: number;
  H: number;
  layout: Layout;
  tex: TexInfo;
  grout: [number, number, number];
  /** 조명 반영 0~1 */
  shade: number;
  /** 밝기 배율 (1 = 그대로) */
  bright: number;
  /** 광택 0(무광)~1(유광) */
  gloss: number;
  bevel: number;
  /** 이 면이 바닥이면 위쪽 물건을 비추는 반사를 그린다 */
  floor: boolean;
  /** 모서리 그늘을 넣을 변: 위(v=0), 오른쪽(u=1), 아래(v=1), 왼쪽(u=0) */
  inner: [boolean, boolean, boolean, boolean];
}

/** 샘플 욕실 카메라 (거울 반사용). 길이 m, 카메라 좌표: X 오른쪽, Y 아래, Z 앞 */
export interface MirrorScene {
  /** 사진 대비 주점(소실점)과 초점거리(가로 폭 배수) */
  cx: number; cy: number; f: number;
  XL: number; XR: number; Yc: number; Yf: number; Zb: number; Zn: number;
  /** 왼쪽 벽 위 거울 유리 원 (Y, Z, 반지름) */
  glass: { Y: number; Z: number; r: number };
  /** 정면 벽 위쪽 간접등 높이: 이 범위는 원래 사진을 둔다 */
  cove: number;
  /** 면 이름 → zones 배열 번호 (없으면 -1) */
  back: number; right: number; floor: number;
}

/** 밝은 부분을 부드럽게 눌러 하얗게 뭉개지지 않게 (215 넘는 값만) */
const soft = (v: number) => (v <= 215 ? v : 255 - 40 * Math.exp(-(v - 215) / 40));

interface Prepared {
  z: ZoneRender;
  ox: number; oy: number; px: number; py: number;
  mr: number; mg: number; mb: number;
  seed: number;
}

// 타일 색 계산 결과 (할당을 줄이려고 모듈 변수 재사용)
const C = new Float32Array(3);

/** 텍스처를 mm 좌표 (sx, sy)에서 픽셀 크기 fp(mm)에 맞춰 삼선형으로 읽어 C에 넣는다 */
function sampleTex(t: TexInfo, sx: number, sy: number, fp: number) {
  const texel = t.mmW / t.levels[0].w;
  const maxL = t.levels.length - 1;
  let lod = Math.log2(Math.max(1e-6, fp / texel));
  if (lod < 0) lod = 0;
  if (lod > maxL) lod = maxL;
  const l0 = lod | 0, fr = lod - l0;
  let r = 0, g = 0, b = 0;
  for (let k = 0; k < 2; k++) {
    const wgt = k === 0 ? 1 - fr : fr;
    if (wgt <= 0) continue;
    const Tx = t.levels[Math.min(maxL, l0 + k)];
    let x = (sx / t.mmW) * Tx.w - 0.5, y = (sy / t.mmH) * Tx.h - 0.5;
    if (!t.seamless) { x = Math.min(Tx.w - 1.001, Math.max(0, x)); y = Math.min(Tx.h - 1.001, Math.max(0, y)); }
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const x0 = ((xi % Tx.w) + Tx.w) % Tx.w, y0 = ((yi % Tx.h) + Tx.h) % Tx.h;
    const x1 = x0 + 1 === Tx.w ? 0 : x0 + 1, y1 = y0 + 1 === Tx.h ? 0 : y0 + 1;
    const d = Tx.data, a = (x0 + y0 * Tx.w) * 4, bb = (x1 + y0 * Tx.w) * 4, c = (x0 + y1 * Tx.w) * 4, e = (x1 + y1 * Tx.w) * 4;
    const w00 = (1 - xf) * (1 - yf) * wgt, w10 = xf * (1 - yf) * wgt, w01 = (1 - xf) * yf * wgt, w11 = xf * yf * wgt;
    r += d[a] * w00 + d[bb] * w10 + d[c] * w01 + d[e] * w11;
    g += d[a + 1] * w00 + d[bb + 1] * w10 + d[c + 1] * w01 + d[e + 1] * w11;
    b += d[a + 2] * w00 + d[bb + 2] * w10 + d[c + 2] * w01 + d[e + 2] * w11;
  }
  C[0] = r; C[1] = g; C[2] = b;
}

/** 면 좌표 (X: 왼쪽에서, Y: 아래에서, mm)의 타일·줄눈 색을 C에 넣는다. fp = 픽셀 하나가 덮는 mm. */
function tileColor(P: Prepared, X: number, Y: number, fp: number) {
  const z = P.z, L = z.layout, t = z.tex;
  const r = Math.floor(Y / P.py);
  const ly = Y - r * P.py;
  const Xs = X + rowShift(r, L.stagger) * P.px;
  const c = Math.floor(Xs / P.px);
  const lx = Xs - c * P.px;
  // 줄눈 경계 부드럽게(픽셀 크기만큼)
  const sx = lx <= L.w ? Math.min(lx, L.w - lx) : -Math.min(lx - L.w, P.px - lx);
  const sy = ly <= L.h ? Math.min(ly, L.h - ly) : -Math.min(ly - L.h, P.py - ly);
  const cov = Math.min(1, Math.max(0, sx / fp + 0.5)) * Math.min(1, Math.max(0, sy / fp + 0.5));
  // 줄눈: 모래 질감 + 오목한 그늘
  const gn = 0.84 + 0.1 * hash2(Math.floor(X / 0.7), Math.floor(Y / 0.7), 3);
  const gr = z.grout[0] * gn, gg = z.grout[1] * gn, gb = z.grout[2] * gn;
  if (cov <= 0) { C[0] = gr; C[1] = gg; C[2] = gb; return; }
  // 타일 안 위치(텍스처 위쪽 = 타일 위쪽) → 타일마다 다른 위치·방향
  let u = lx, v = L.h - ly, tw = L.w, th = L.h;
  if (t.rotations !== 4 && t.grainX !== (L.w >= L.h)) {
    // 결 방향을 타일의 긴 쪽에 맞춘다 (90° 회전)
    const tmp = u; u = v; v = tw - tmp; const tt = tw; tw = th; th = tt;
  }
  const hv = hash2(c, r, P.seed + 11);
  const rot = t.rotations === 4 ? Math.floor(hv * 4) : t.rotations === 2 ? (hv < 0.5 ? 0 : 2) : 0;
  if (rot === 2) { u = tw - u; v = th - v; }
  else if (rot === 1) { const tmp = u; u = th - v; v = tmp; }
  else if (rot === 3) { const tmp = u; u = v; v = tw - tmp; }
  const big = Math.max(tw, th);
  const spanX = t.seamless ? t.mmW : Math.max(0, t.mmW - big), spanY = t.seamless ? t.mmH : Math.max(0, t.mmH - big);
  sampleTex(t, u + hash2(c, r, P.seed + 23) * spanX, v + hash2(c, r, P.seed + 37) * spanY, fp);
  // 장마다 밝기 차이 + 베벨(모서리 그늘)
  let k = 1 + (hash2(c, r, P.seed + 51) - 0.5) * 2 * t.jitter;
  if (z.bevel > 0) {
    const e = Math.max(0, Math.min(lx, L.w - lx, ly, L.h - ly));
    if (e < z.bevel) { const q = 1 - e / z.bevel; k *= 1 - 0.22 * q * q; }
  }
  C[0] = C[0] * k * cov + gr * (1 - cov);
  C[1] = C[1] * k * cov + gg * (1 - cov);
  C[2] = C[2] * k * cov + gb * (1 - cov);
}

export interface RenderOptions {
  /** 촘촘한 조명 지도(유광 하이라이트용) — 없으면 하이라이트 생략 */
  hiLight?: LightMap | null;
  mirror?: MirrorScene | null;
  /** buildMirrorLight 결과 (같은 사진이면 다시 만들 필요 없다) */
  mirrorLight?: LightMap | null;
  /** 사진 노이즈 흉내 (0이면 끔) */
  grain?: number;
}

/**
 * photo 위에 면들을 그려 out(RGBA)에 쓴다. keep이 있으면 원래 사진으로 덮는다.
 */
export function render(out: Uint8ClampedArray, photo: Uint8ClampedArray, width: number, height: number, zones: ZoneRender[], light: LightMap, keep: Uint8Array | null, opt: RenderOptions = {}) {
  out.set(photo);
  const grain = opt.grain ?? 1.4;
  const floorCov = zones.some(z => z.floor && z.gloss > 0) ? new Float32Array(width * height) : null;
  const prepared: (Prepared | null)[] = [];
  let zi = 0;
  for (const z of zones) {
    zi++;
    if (!isConvex(z.quad) || !(z.W > 0 && z.H > 0 && z.layout.w > 0 && z.layout.h > 0)) { prepared.push(null); continue; }
    const [A, B, Cc, D, E, F, G, Hh, I] = invert3(squareToQuad(z.quad));
    const xs = z.quad.map(p => p.x), ys = z.quad.map(p => p.y);
    const x0 = Math.max(0, Math.floor(Math.min(...xs)) - 1), x1 = Math.min(width - 1, Math.ceil(Math.max(...xs)) + 1);
    const y0 = Math.max(0, Math.floor(Math.min(...ys)) - 1), y1 = Math.min(height - 1, Math.ceil(Math.max(...ys)) + 1);

    // 면의 평균 색 (조명 지도 기준)
    let sr = 0, sg = 0, sb = 0, sn = 0;
    for (let y = y0; y <= y1; y += 6) for (let x = x0; x <= x1; x += 6) {
      const w = G * x + Hh * y + I, u = (A * x + B * y + Cc) / w, v = (D * x + E * y + F) / w;
      if (u < 0 || u > 1 || v < 0 || v > 1) continue;
      sr += sampleMap(light, light.r, x, y); sg += sampleMap(light, light.g, x, y); sb += sampleMap(light, light.b, x, y); sn++;
    }
    const mr = sn ? Math.max(0.02, sr / sn) : 0.5, mg = sn ? Math.max(0.02, sg / sn) : 0.5, mb = sn ? Math.max(0.02, sb / sn) : 0.5;
    const L = z.layout;
    const { ox, oy } = originOffset(z.W, z.H, L);
    const P: Prepared = { z, ox, oy, px: L.w + L.grout, py: L.h + L.grout, mr, mg, mb, seed: zi * 101 };
    prepared.push(P);
    if (x1 < x0 || y1 < y0) continue;
    const ex = 0.85 * z.shade;
    const hi = opt.hiLight && z.gloss > 0 ? opt.hiLight : null;
    const anyInner = z.inner[0] || z.inner[1] || z.inner[2] || z.inner[3];

    for (let y = y0; y <= y1; y++) {
      let nu = A * x0 + B * y + Cc, nv = D * x0 + E * y + F, nw = G * x0 + Hh * y + I;
      for (let x = x0; x <= x1; x++, nu += A, nv += D, nw += G) {
        const iw = 1 / nw, u = nu * iw, v = nv * iw;
        if (u < -0.05 || u > 1.05 || v < -0.05 || v > 1.05) continue;
        const dudx = (A - u * G) * iw, dvdx = (D - v * G) * iw, dudy = (B - u * Hh) * iw, dvdy = (E - v * Hh) * iw;
        // 면 가장자리 부드럽게: 경계까지 거리(픽셀)
        const gu = Math.hypot(dudx, dudy) || 1e-9, gv = Math.hypot(dvdx, dvdy) || 1e-9;
        const ecov = Math.min(1, Math.max(0, Math.min(u, 1 - u) / gu + 0.5)) * Math.min(1, Math.max(0, Math.min(v, 1 - v) / gv + 0.5));
        if (ecov <= 0) continue;
        const fp = Math.max(Math.hypot(dudx * z.W, dvdx * z.H), Math.hypot(dudy * z.W, dvdy * z.H), 1e-6);
        const uu = u < 0 ? 0 : u > 1 ? 1 : u, vv = v < 0 ? 0 : v > 1 ? 1 : v;
        tileColor(P, uu * z.W - ox, (1 - vv) * z.H - oy, fp);

        // 조명(색 포함) · 모서리 그늘 · 밝기
        const lr = sampleMap(light, light.r, x, y), lg = sampleMap(light, light.g, x, y), lb = sampleMap(light, light.b, x, y);
        let ao = 1;
        if (anyInner) {
          let dm = 1e9;
          if (z.inner[0]) dm = Math.min(dm, vv * z.H);
          if (z.inner[1]) dm = Math.min(dm, (1 - uu) * z.W);
          if (z.inner[2]) dm = Math.min(dm, (1 - vv) * z.H);
          if (z.inner[3]) dm = Math.min(dm, uu * z.W);
          ao = 1 - 0.14 * Math.exp(-dm / 45);
        }
        const kk = ao * z.bright;
        const fr = Math.min(1.7, Math.pow(Math.max(0.01, lr / mr), ex) * kk);
        const fg = Math.min(1.7, Math.pow(Math.max(0.01, lg / mg), ex) * kk);
        const fb = Math.min(1.7, Math.pow(Math.max(0.01, lb / mb), ex) * kk);
        let add = 0;
        if (hi) {
          // 원래 사진의 반사 하이라이트(촘촘한 지도 − 거친 지도)만 더한다 (얇은 옛 줄눈은 촘촘한 지도에서도 지워진다)
          const h = sampleMap(hi, hi.l, x, y) - (0.2126 * lr + 0.7152 * lg + 0.0722 * lb) - 0.025;
          if (h > 0) add = h * 255 * 1.3 * z.gloss;
        }
        const pi = (x + y * width) * 4;
        const n = grain ? (hash2(x, y, 77) - 0.5) * 2 * grain : 0;
        const a = ecov;
        out[pi] = out[pi] * (1 - a) + soft(C[0] * fr + add + n) * a;
        out[pi + 1] = out[pi + 1] * (1 - a) + soft(C[1] * fg + add + n) * a;
        out[pi + 2] = out[pi + 2] * (1 - a) + soft(C[2] * fb + add + n) * a;
        if (floorCov && z.floor) { const q = x + y * width; floorCov[q] = Math.max(floorCov[q], a * z.gloss); }
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

  // 바닥 반사: 각 열에서 바닥이 시작되는 위쪽 경계를 기준으로 위 화면을 뒤집어 흐리게 비춘다
  if (floorCov) {
    const src = out.slice();
    for (let x = 0; x < width; x++) {
      let top = -1, bottom = -1;
      for (let y = 0; y < height; y++) { const p = x + y * width; if (floorCov[p] > 0.02 && (!keep || keep[p] < 128)) { if (top < 0) top = y; bottom = y; } }
      if (top < 0) continue;
      const span = Math.max(1, bottom - top);
      let edge = -1;
      for (let y = 0; y < height; y++) {
        const p = x + y * width, g = floorCov[p], k = keep ? keep[p] / 255 : 0;
        if (g <= 0.02 || k > 0.5) { edge = y; continue; }
        const d = y - edge;
        if (edge < 0 || d <= 0) continue;
        // 프레넬 흉내: 먼 바닥(위쪽)일수록 반사가 강하고, 비친 물체에서 멀어질수록 흐리고 약하게
        const far = 1 - (y - top) / span;
        const F = g * (0.06 + 0.26 * far) * Math.exp(-d / (height * 0.5));
        if (F < 0.004) continue;
        const blur = 1 + d * 0.035;
        let r = 0, gg = 0, b = 0, c = 0;
        for (let s = -2; s <= 2; s++) {
          const sy = Math.round(edge - d + s * blur * 0.5), sx = Math.round(x + s * blur * 0.25);
          if (sy < 0 || sy >= height || sx < 0 || sx >= width) continue;
          const q = (sx + sy * width) * 4;
          r += src[q]; gg += src[q + 1]; b += src[q + 2]; c++;
        }
        if (!c) continue;
        const i = p * 4, a = F * (1 - k);
        out[i] = out[i] * (1 - a) + (r / c) * a;
        out[i + 1] = out[i + 1] * (1 - a) + (gg / c) * a;
        out[i + 2] = out[i + 2] * (1 - a) + (b / c) * a;
      }
    }
  }

  // 거울 속 벽: 광선을 거울(왼쪽 벽)에서 반사시켜 맞은 면의 타일을 그린다
  const M = opt.mirror;
  if (M) {
    const cx = M.cx * width, cy = M.cy * height, f = M.f * width;
    const x1 = Math.ceil(0.3 * width), y0 = Math.floor(0.2 * height), y1 = Math.ceil(0.65 * height);
    const hitWall = (x: number, y: number) => {
      const dx = (x - cx) / f, dy = (y - cy) / f;
      if (dx >= 0) return null;
      const t = M.XL / dx;
      return { t, Y: dy * t, Z: t, dx, dy };
    };
    const ml = opt.mirrorLight ?? buildMirrorLight(photo, width, height, M);
    for (let y = y0; y < y1; y++) for (let x = 0; x < x1; x++) {
      const g = hitWall(x, y);
      if (!g) continue;
      const dist0 = Math.hypot(g.Y - M.glass.Y, g.Z - M.glass.Z);
      if (dist0 > M.glass.r + 0.01) continue;
      // 유리 가장자리(테두리 안쪽)를 픽셀 크기만큼 부드럽게
      const a = Math.min(1, Math.max(0, (M.glass.r - dist0) * (f / g.Z) + 0.5));
      if (a <= 0) continue;
      const d = { x: -g.dx, y: g.dy, z: 1 };
      let best = Infinity, hit = 0; // 1 back, 2 right, 3 floor, 4 ceil
      const tr = (M.XR - M.XL) / d.x; if (tr > 0 && tr < best) { best = tr; hit = 2; }
      const tb = (M.Zb - g.Z) / d.z; if (tb > 0 && tb < best) { best = tb; hit = 1; }
      const tv = d.y < 0 ? (M.Yc - g.Y) / d.y : (M.Yf - g.Y) / d.y; if (tv > 0 && tv < best) { best = tv; hit = d.y < 0 ? 4 : 3; }
      const Qx = M.XL + d.x * best, Qy = g.Y + d.y * best, Qz = g.Z + d.z * best;
      let idx = -1, u = 0, v = 0;
      if (hit === 1) { if (Qy < M.Yc + M.cove) continue; idx = M.back; u = (Qx - M.XL) / (M.XR - M.XL); v = (Qy - M.Yc) / (M.Yf - M.Yc); }
      else if (hit === 2) { idx = M.right; u = (M.Zb - Qz) / (M.Zb - M.Zn); v = (Qy - M.Yc) / (M.Yf - M.Yc); }
      else if (hit === 3) { idx = M.floor; u = (Qx - M.XL) / (M.XR - M.XL); v = (M.Zb - Qz) / (M.Zb - M.Zn); }
      const P = idx >= 0 ? prepared[idx] : null;
      if (!P) continue;
      const z = P.z;
      const fp = Math.max(0.2, (((g.t + best) * Math.hypot(d.x, d.y, 1)) / f) * 1000);
      tileColor(P, u * z.W - P.ox, (1 - v) * z.H - P.oy, fp);
      const ex = 0.85 * z.shade;
      const fr = Math.min(1.6, Math.pow(Math.max(0.01, sampleMap(ml, ml.r, x, y) / P.mr), ex)) * z.bright;
      const fg = Math.min(1.6, Math.pow(Math.max(0.01, sampleMap(ml, ml.g, x, y) / P.mg), ex)) * z.bright;
      const fb = Math.min(1.6, Math.pow(Math.max(0.01, sampleMap(ml, ml.b, x, y) / P.mb), ex)) * z.bright;
      const i = (x + y * width) * 4;
      out[i] = out[i] * (1 - a) + soft(C[0] * fr) * a;
      out[i + 1] = out[i + 1] * (1 - a) + soft(C[1] * fg) * a;
      out[i + 2] = out[i + 2] * (1 - a) + soft(C[2] * fb) * a;
    }
  }
}

/** 거울 유리의 원래 색 — 유리 밖을 가린 조명 지도(흐림·양선형)로 거울 속 조명을 만든다 */
export function buildMirrorLight(photo: Uint8ClampedArray, width: number, height: number, M: Pick<MirrorScene, 'cx' | 'cy' | 'f' | 'XL' | 'glass'>) {
  const cx = M.cx * width, cy = M.cy * height, f = M.f * width;
  const x1 = Math.ceil(0.3 * width), y0 = Math.floor(0.2 * height), y1 = Math.ceil(0.65 * height);
  const notGlass = new Uint8Array(width * height).fill(255);
  for (let y = y0; y < y1; y++) for (let x = 0; x < x1; x++) {
    const dx = (x - cx) / f;
    if (dx >= 0) continue;
    const t = M.XL / dx, Y = ((y - cy) / f) * t;
    if (Math.hypot(Y - M.glass.Y, t - M.glass.Z) < M.glass.r * 0.96) notGlass[x + y * width] = 0;
  }
  return buildLightMap(photo, width, height, notGlass, 90, 2);
}

// ───── 샘플 욕실 ─────

/**
 * 샘플 사진의 원근(정규화 좌표): 소실점 (0.511, 0.487), 정면 벽 x 0.336~0.703 · y 0.323~0.652.
 * 정면 벽 폭 1.5m를 기준으로 높이 2.4m, 카메라 높이 약 1.2m, 정면 벽까지 2.97m, 사진 아래 끝까지 바닥 2.05m
 * (원래 바닥·벽 타일 줄눈 간격이 깊이 방향으로 일정하게 맞는 값). 가까운 쪽 꼭짓점은 소실점에서 3.23배.
 */
const VP = { x: 0.511, y: 0.487 }, BACK = { l: 0.336, r: 0.703, t: 0.323, b: 0.652 }, K = 3.23;
const near = (x: number, y: number) => ({ x: VP.x + K * (x - VP.x), y: VP.y + K * (y - VP.y) });
export type ZoneId = 'floor' | 'back' | 'left' | 'right';
export const SAMPLE_ZONES: Record<ZoneId, { quad: Vec[]; W: number; H: number; inner: [boolean, boolean, boolean, boolean] }> = {
  back: { quad: [{ x: BACK.l, y: BACK.t }, { x: BACK.r, y: BACK.t }, { x: BACK.r, y: BACK.b }, { x: BACK.l, y: BACK.b }], W: 1500, H: 2400, inner: [true, true, true, true] },
  floor: { quad: [{ x: BACK.l, y: BACK.b }, { x: BACK.r, y: BACK.b }, near(BACK.r, BACK.b), near(BACK.l, BACK.b)], W: 1500, H: 2050, inner: [true, true, false, true] },
  left: { quad: [near(BACK.l, BACK.t), { x: BACK.l, y: BACK.t }, { x: BACK.l, y: BACK.b }, near(BACK.l, BACK.b)], W: 2050, H: 2400, inner: [true, true, true, false] },
  right: { quad: [{ x: BACK.r, y: BACK.t }, near(BACK.r, BACK.t), near(BACK.r, BACK.b), { x: BACK.r, y: BACK.b }], W: 2050, H: 2400, inner: [true, false, true, true] },
};
/** 거울 유리: 사진 속 테두리 안쪽 경계 2,618점에 원을 맞춘 값(평균 오차 1cm) — 지름 85cm, 중심 높이 1.46m */
export const SAMPLE_MIRROR: Omit<MirrorScene, 'back' | 'right' | 'floor'> = {
  cx: VP.x, cy: VP.y, f: 0.727,
  XL: -0.715, XR: 0.784, Yc: -1.2, Yf: 1.208, Zb: 2.97, Zn: 0.92,
  glass: { Y: -0.253, Z: 1.498, r: 0.425 },
  cove: 0.09,
};

/** 사용자 사진의 면: 사진 가장자리에 놓인 변은 실제 모서리가 아니므로 그늘을 넣지 않는다 */
export function innerEdges(q: Vec[]): [boolean, boolean, boolean, boolean] {
  const atBorder = (p: Vec) => p.x <= 0.015 || p.x >= 0.985 || p.y <= 0.015 || p.y >= 0.985;
  const e = (a: number, b: number) => !(atBorder(q[a]) && atBorder(q[b]));
  return [e(0, 1), e(1, 2), e(2, 3), e(3, 0)];
}
