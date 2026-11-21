// 싸인·도장 이미지 만들기 — 화면과 분리한 처리 모듈 (나중에 "PDF에 싸인·도장 찍기"에서도 그대로 쓴다)
//
//  1) extractInk: 사진에서 인주(빨강·파랑)·잉크(검정·파랑)만 남기고 배경을 투명하게. AI 없이 색 기준.
//     ※ Web Worker 에서 문자열로 실행하므로 함수 하나 안에 모든 것을 넣고, 바깥 변수·import·구조분해·전개 연산자를 쓰지 않는다.
//  2) drawStamp: 이름으로 도장 그리기 (원형·사각·타원, 글자 자동 배치, 인주 질감)
//  3) renderSignatureText / renderStrokes: 손글씨 폰트 싸인, 직접 그린 싸인
//  4) 공통: 내용에 맞춰 자르기, 크기 바꾸기, 파일 이름

/* ────────────────────────── 1. 사진에서 추출 ────────────────────────── */

/** 여기서 만든 도장을 견적서 메이커로 넘기는 저장 키 (한 번 읽으면 지운다) */
export const INVOICE_STAMP_KEY = 'utilhub-invoice-stamp';

export type Kind = 'stamp' | 'sign';
export type Ink = 'red' | 'blue' | 'both';
export type Recolor = 'keep' | 'red' | 'blue' | 'black';

export interface ExtractOptions {
  /** 남길 것: 빨간 인주, 파란 인주(또는 파란 볼펜), 검정 잉크 */
  red: boolean;
  blue: boolean;
  dark: boolean;
  /** 0~100: 남길 색 범위 (클수록 흐린 부분까지 남김) */
  sens: number;
  /** 0~100: 가장자리 부드럽게 */
  soft: number;
  /** 0~100: 작은 점 제거 */
  noise: number;
  recolor: Recolor;
  /** 흐린 도장·싸인을 보통 인주 진하기로 (농담 비율은 유지) */
  boost: boolean;
}

export interface ExtractResult {
  /** RGBA (입력과 같은 크기) */
  out: Uint8ClampedArray;
  /** 내용이 있는 영역 (없으면 x1 < x0) */
  x0: number; y0: number; x1: number; y1: number;
  /** 확실히 남은 픽셀 수 (자동 감지용) */
  strong: number;
}

export const INK_RGB: Record<Exclude<Recolor, 'keep'>, [number, number, number]> = {
  red: [214, 36, 42],
  blue: [28, 64, 172],
  black: [24, 24, 28],
};

/**
 * 배경 제거 본체. 함수 하나로 닫혀 있어 Worker 에 문자열로 넘길 수 있다.
 * 1) 종이 밝기·색 지도(블록별 밝은 픽셀 평균)로 그림자·노란 조명을 평탄하게
 * 2) 색상(Hue)·채도·밝기로 인주/잉크 정도(0~1)를 구해 알파로 — 계단 없이 반투명 가장자리
 * 3) 작은 점 덩어리 제거, 원래 색 복원(흰 종이와 섞인 색에서 잉크 색을 되돌림) 또는 인주색 변환
 */
export function extractInk(src: Uint8ClampedArray, w: number, h: number, o: ExtractOptions): ExtractResult {
  const n = w * h;
  const clamp01 = function (v: number) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  const smooth = function (e0: number, e1: number, v: number) { const t = clamp01((v - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

  // ── 1) 종이 지도 ──
  const B = Math.max(12, Math.round(Math.max(w, h) / 40));
  const bw = Math.ceil(w / B), bh = Math.ceil(h / B), nb = bw * bh;
  const hist = new Uint32Array(nb * 64);
  let x, y, i, k, bi;
  for (y = 0; y < h; y++) {
    for (x = 0; x < w; x++) {
      i = (y * w + x) * 4;
      const L = (src[i] * 299 + src[i + 1] * 587 + src[i + 2] * 114) / 1000;
      bi = ((y / B) | 0) * bw + ((x / B) | 0);
      hist[bi * 64 + (L >> 2)]++;
    }
  }
  const cut = new Uint8Array(nb);
  for (bi = 0; bi < nb; bi++) {
    let tot = 0;
    for (k = 0; k < 64; k++) tot += hist[bi * 64 + k];
    const need = tot * 0.25; let acc = 0; // 밝은 쪽 25%
    for (k = 63; k >= 0; k--) { acc += hist[bi * 64 + k]; if (acc >= need) break; }
    cut[bi] = k < 0 ? 0 : k;
  }
  const sr = new Float64Array(nb), sg = new Float64Array(nb), sb = new Float64Array(nb), sc = new Float64Array(nb);
  for (y = 0; y < h; y++) {
    for (x = 0; x < w; x++) {
      i = (y * w + x) * 4;
      const L2 = (src[i] * 299 + src[i + 1] * 587 + src[i + 2] * 114) / 1000;
      bi = ((y / B) | 0) * bw + ((x / B) | 0);
      if ((L2 >> 2) >= cut[bi]) { sr[bi] += src[i]; sg[bi] += src[i + 1]; sb[bi] += src[i + 2]; sc[bi]++; }
    }
  }
  const pr = new Float32Array(nb), pg = new Float32Array(nb), pb = new Float32Array(nb), pl = new Float32Array(nb);
  let gl = 0, gr = 0, gg = 0, gb = 0, gcount = 0;
  for (bi = 0; bi < nb; bi++) {
    const c = sc[bi] || 1;
    pr[bi] = sr[bi] / c; pg[bi] = sg[bi] / c; pb[bi] = sb[bi] / c;
    pl[bi] = (pr[bi] * 299 + pg[bi] * 587 + pb[bi] * 114) / 1000;
    if (pl[bi] > gl) { gl = pl[bi]; }
  }
  // 종이 전체 색: 밝은 블록들의 평균
  for (bi = 0; bi < nb; bi++) if (pl[bi] >= gl * 0.85) { gr += pr[bi]; gg += pg[bi]; gb += pb[bi]; gcount++; }
  gr /= gcount || 1; gg /= gcount || 1; gb /= gcount || 1;
  // 블록이 거의 잉크로 덮였으면(주변보다 많이 어두움) 주변의 가장 밝은 블록 색을 쓴다 — 그림자는 완만해 이 기준에 걸리지 않는다
  const qr = new Float32Array(nb), qg = new Float32Array(nb), qb = new Float32Array(nb);
  for (let by = 0; by < bh; by++) {
    for (let bx = 0; bx < bw; bx++) {
      bi = by * bw + bx;
      let best = bi;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const nx = bx + dx, ny = by + dy;
        if (nx < 0 || ny < 0 || nx >= bw || ny >= bh) continue;
        const nbi = ny * bw + nx;
        if (pl[nbi] > pl[best]) best = nbi;
      }
      const use = pl[bi] < pl[best] * 0.86 ? best : bi;
      if (pl[use] < 60) { qr[bi] = gr; qg[bi] = gg; qb[bi] = gb; }
      else { qr[bi] = pr[use]; qg[bi] = pg[use]; qb[bi] = pb[use]; }
    }
  }

  // ── 2) 픽셀 분류 ──
  const s = clamp01(o.sens / 100);
  const cMin = 0.15 - s * 0.10;        // 색이 있다고 볼 최소 채도
  const dMin = 0.40 - s * 0.28;        // 검다고 볼 최소 어둡기
  const t0 = 0.10 - s * 0.07;          // 인주 농도 바닥값
  const edge = 0.05 + clamp01(o.soft / 100) * 0.12;
  const redHalf = 28 + s * 18, blueHalf = 34 + s * 16;
  const alpha = new Float32Array(n);
  const cls = new Uint8Array(n); // 1 빨강 2 파랑 3 검정 (원래 색 복원용)
  const nr = new Float32Array(n), ng = new Float32Array(n), nbv = new Float32Array(n);
  let fx = 0, fy = 0, ix = 0, iy = 0;
  for (y = 0; y < h; y++) {
    fy = (y + 0.5) / B - 0.5; iy = Math.floor(fy); let ty = fy - iy;
    let y0b = iy < 0 ? 0 : iy; const y1b = iy + 1 >= bh ? bh - 1 : iy + 1;
    if (y0b > bh - 1) y0b = bh - 1;
    if (iy < 0) ty = 0;
    for (x = 0; x < w; x++) {
      fx = (x + 0.5) / B - 0.5; ix = Math.floor(fx); let tx = fx - ix;
      let x0b = ix < 0 ? 0 : ix; const x1b = ix + 1 >= bw ? bw - 1 : ix + 1;
      if (x0b > bw - 1) x0b = bw - 1;
      if (ix < 0) tx = 0;
      const a00 = y0b * bw + x0b, a01 = y0b * bw + x1b, a10 = y1b * bw + x0b, a11 = y1b * bw + x1b;
      const PR = (qr[a00] * (1 - tx) + qr[a01] * tx) * (1 - ty) + (qr[a10] * (1 - tx) + qr[a11] * tx) * ty;
      const PG = (qg[a00] * (1 - tx) + qg[a01] * tx) * (1 - ty) + (qg[a10] * (1 - tx) + qg[a11] * tx) * ty;
      const PB = (qb[a00] * (1 - tx) + qb[a01] * tx) * (1 - ty) + (qb[a10] * (1 - tx) + qb[a11] * tx) * ty;
      k = y * w + x; i = k * 4;
      const r = clamp01(src[i] / (PR || 1)), g = clamp01(src[i + 1] / (PG || 1)), b = clamp01(src[i + 2] / (PB || 1));
      nr[k] = r; ng[k] = g; nbv[k] = b;
      const mx = r > g ? (r > b ? r : b) : (g > b ? g : b);
      const mn = r < g ? (r < b ? r : b) : (g < b ? g : b);
      const chroma = mx - mn;
      let hue = 0;
      if (chroma > 1e-6) {
        if (mx === r) hue = 60 * (((g - b) / chroma) % 6);
        else if (mx === g) hue = 60 * ((b - r) / chroma + 2);
        else hue = 60 * ((r - g) / chroma + 4);
        if (hue < 0) hue += 360;
      }
      const colorish = smooth(cMin, cMin + edge, chroma);
      let best2 = 0, which = 0;
      if (o.red) {
        const dr = Math.abs(((hue - 355 + 540) % 360) - 180);
        const wr = 1 - smooth(redHalf, redHalf + 12, dr);
        const dens = clamp01((1 - g - t0) / (1 - t0));
        const ar = colorish * wr * smooth(0, edge * 2, dens) * (0.35 + 0.65 * dens);
        if (ar > best2) { best2 = ar; which = 1; }
      }
      if (o.blue) {
        const db = Math.abs(((hue - 222 + 540) % 360) - 180);
        const wb = 1 - smooth(blueHalf, blueHalf + 12, db);
        const densb = clamp01((1 - r - t0) / (1 - t0));
        const ab = colorish * wb * smooth(0, edge * 2, densb) * (0.35 + 0.65 * densb);
        if (ab > best2) { best2 = ab; which = 2; }
      }
      if (o.dark) {
        const lum = r * 0.299 + g * 0.587 + b * 0.114;
        const dk = 1 - lum;
        // 빨간 인주는 검정으로 잡지 않는다 (도장 위에 쓴 싸인에서 도장이 섞이지 않게)
        const notRed = 1 - colorish * (1 - smooth(30, 45, Math.abs(((hue - 355 + 540) % 360) - 180)));
        const ad = smooth(dMin, dMin + edge * 2.5, dk) * notRed;
        if (ad > best2) { best2 = ad; which = 3; }
      }
      alpha[k] = best2 < 0.035 ? 0 : best2;
      cls[k] = which;
    }
  }

  // 가장자리 부드럽게: 알파를 살짝 흐림 (0~2px)
  const rad = Math.round(clamp01(o.soft / 100) * 2);
  if (rad > 0) {
    const tmp = new Float32Array(n);
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      let sum = 0, cnt = 0;
      for (let q = -rad; q <= rad; q++) { const xx = x + q; if (xx >= 0 && xx < w) { sum += alpha[y * w + xx]; cnt++; } }
      tmp[y * w + x] = sum / cnt;
    }
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      let sum2 = 0, cnt2 = 0;
      for (let q2 = -rad; q2 <= rad; q2++) { const yy = y + q2; if (yy >= 0 && yy < h) { sum2 += tmp[yy * w + x]; cnt2++; } }
      const blurred = sum2 / cnt2;
      k = y * w + x;
      alpha[k] = alpha[k] * 0.5 + blurred * 0.5;
    }
  }

  // ── 3) 작은 점 제거 (8방향 연결 덩어리) ──
  const mega = (w * h) / 1e6;
  const nz = clamp01(o.noise / 100);
  const minArea = Math.round(nz * nz * 220 * Math.max(0.25, mega)) + (nz > 0 ? 2 : 0);
  const keep = new Uint8Array(n);
  const label = new Int32Array(n);
  const stack = new Int32Array(n);
  let strong = 0;
  let lab = 0;
  for (k = 0; k < n; k++) {
    if (alpha[k] < 0.22 || label[k]) continue;
    lab++;
    let sp = 0, area = 0;
    stack[sp++] = k; label[k] = lab;
    const members: number[] = [];
    while (sp > 0) {
      const p = stack[--sp];
      members.push(p);
      area++;
      const px = p % w, py = (p / w) | 0;
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        if (!ox && !oy) continue;
        const qx = px + ox, qy = py + oy;
        if (qx < 0 || qy < 0 || qx >= w || qy >= h) continue;
        const qk = qy * w + qx;
        if (label[qk] || alpha[qk] < 0.22) continue;
        label[qk] = lab; stack[sp++] = qk;
      }
    }
    if (area >= minArea) { for (let m = 0; m < members.length; m++) keep[members[m]] = 1; strong += area; }
  }
  // 약한 픽셀은 남은 덩어리 2px 안쪽만 남긴다
  const near = new Uint8Array(n);
  for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
    if (!keep[y * w + x]) continue;
    for (let ey = -2; ey <= 2; ey++) for (let ex = -2; ex <= 2; ex++) {
      const zx = x + ex, zy = y + ey;
      if (zx >= 0 && zy >= 0 && zx < w && zy < h) near[zy * w + zx] = 1;
    }
  }

  // ── 4) 색 만들기 ──
  const out = new Uint8ClampedArray(n * 4);
  let X0 = w, Y0 = h, X1 = -1, Y1 = -1;
  const target = o.recolor === 'red' ? [214, 36, 42] : o.recolor === 'blue' ? [28, 64, 172] : o.recolor === 'black' ? [24, 24, 28] : null;
  // 흰 종이와 섞인 색에서 잉크 색 되돌리기: 관측 = 1 − a·(1 − 잉크)
  const unmix = (v: number, a: number) => clamp01(1 - (1 - v) / (a < 0.25 ? 0.25 : a));
  // 인주(빨강·파랑)별 평균 색 — 검은 글씨와 겹쳐 어두워진 자리를 이 색으로 채운다
  const sumR = [0, 0, 0], sumG = [0, 0, 0], sumB = [0, 0, 0], sumN = [0, 0, 0];
  const alphas: number[] = [];
  for (k = 0; k < n; k++) {
    const a0 = alpha[k];
    if (a0 <= 0 || !(keep[k] || (a0 < 0.22 && near[k]))) continue;
    if (a0 > 0.08) alphas.push(a0);
    const cc = cls[k];
    if ((cc === 1 || cc === 2) && a0 > 0.4) {
      const ur = unmix(nr[k], a0), ug = unmix(ng[k], a0), ub = unmix(nbv[k], a0);
      if (Math.max(ur, ug, ub) > 0.45) { sumR[cc] += ur; sumG[cc] += ug; sumB[cc] += ub; sumN[cc]++; }
    }
  }
  // 진하게 보정: 흐린 도장·싸인은 진한 쪽(상위 5%)이 보통 인주 진하기가 되도록 투명도를 한꺼번에 올린다 (농담 비율은 그대로)
  let gain = 1;
  if (o.boost && alphas.length > 20) {
    alphas.sort(function (p, q) { return p - q; });
    const p95 = alphas[Math.floor(alphas.length * 0.95)];
    if (p95 < 0.85) gain = Math.min(2.2, 0.9 / p95);
  }
  for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
    k = y * w + x;
    const a = alpha[k];
    if (a <= 0 || !(keep[k] || (a < 0.22 && near[k]))) continue;
    i = k * 4;
    if (target) {
      out[i] = target[0]; out[i + 1] = target[1]; out[i + 2] = target[2];
    } else {
      let ur = unmix(nr[k], a), ug = unmix(ng[k], a), ub = unmix(nbv[k], a);
      const c2 = cls[k];
      if ((c2 === 1 || c2 === 2) && sumN[c2] > 20 && Math.max(ur, ug, ub) < 0.45) {
        ur = sumR[c2] / sumN[c2]; ug = sumG[c2] / sumN[c2]; ub = sumB[c2] / sumN[c2];
      }
      out[i] = Math.round(ur * 255);
      out[i + 1] = Math.round(ug * 255);
      out[i + 2] = Math.round(ub * 255);
    }
    out[i + 3] = Math.round(clamp01(a * gain) * 255);
    if (a > 0.08) { if (x < X0) X0 = x; if (x > X1) X1 = x; if (y < Y0) Y0 = y; if (y > Y1) Y1 = y; }
  }
  return { out: out, x0: X0, y0: Y0, x1: X1, y1: Y1, strong: strong };
}

/** Worker 로 돌린다. 실패하면(구형 브라우저 등) 화면 스레드에서 바로 실행 */
let worker: Worker | null = null;
let workerBroken = false;
let seq = 0;
const pending = new Map<number, { resolve: (r: ExtractResult) => void; reject: (e: unknown) => void }>();

function getWorker(): Worker | null {
  if (workerBroken || typeof Worker === 'undefined' || typeof Blob === 'undefined') return null;
  if (worker) return worker;
  try {
    const code = `var extractInk = ${extractInk.toString()};
self.onmessage = function (e) {
  try {
    var d = e.data;
    var r = extractInk(new Uint8ClampedArray(d.buf), d.w, d.h, d.o);
    self.postMessage({ id: d.id, ok: true, r: { x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1, strong: r.strong, buf: r.out.buffer } }, [r.out.buffer]);
  } catch (err) { self.postMessage({ id: e.data.id, ok: false, err: String(err) }); }
};`;
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    worker = new Worker(url);
    URL.revokeObjectURL(url);
    worker.onmessage = (e: MessageEvent) => {
      const d = e.data as { id: number; ok: boolean; err?: string; r?: { x0: number; y0: number; x1: number; y1: number; strong: number; buf: ArrayBuffer } };
      const p = pending.get(d.id);
      if (!p) return;
      pending.delete(d.id);
      if (d.ok && d.r) p.resolve({ out: new Uint8ClampedArray(d.r.buf), x0: d.r.x0, y0: d.r.y0, x1: d.r.x1, y1: d.r.y1, strong: d.r.strong });
      else p.reject(new Error(d.err));
    };
    worker.onerror = () => {
      workerBroken = true;
      worker?.terminate();
      worker = null;
      for (const [, p] of pending) p.reject(new Error('worker'));
      pending.clear();
    };
    return worker;
  } catch {
    workerBroken = true;
    return null;
  }
}

export async function extractAsync(img: ImageData, o: ExtractOptions): Promise<ExtractResult> {
  const wk = getWorker();
  if (wk) {
    try {
      const id = ++seq;
      const buf = img.data.slice().buffer;
      return await new Promise<ExtractResult>((resolve, reject) => {
        pending.set(id, { resolve, reject });
        wk.postMessage({ id, buf, w: img.width, h: img.height, o }, [buf]);
      });
    } catch {
      workerBroken = true;
    }
  }
  return extractInk(img.data, img.width, img.height, o);
}

/** 감지 결과 */
export interface Detection { kind: Kind; ink: Ink; dark: boolean; box: { x: number; y: number; w: number; h: number } | null }

/**
 * 사진을 보고 종류(도장/싸인)·인주색과 자를 영역을 추천한다. 작은 사본(긴 변 480px)으로 빠르게.
 * 빨강·파랑이 둘 다 일정 비율 이상이면 '빨강+파랑'. 파랑만 있으면 채움 비율로 도장(면)과 싸인(선)을 가른다.
 */
export function detect(small: ImageData): Detection {
  const base: ExtractOptions = { red: false, blue: false, dark: false, sens: 45, soft: 0, noise: 45, recolor: 'keep', boost: false };
  const run = (p: Partial<ExtractOptions>) => extractInk(small.data, small.width, small.height, { ...base, ...p });
  const red = run({ red: true }), blue = run({ blue: true }), dark = run({ dark: true });
  const box = (r: ExtractResult) => (r.x1 < r.x0 ? null : { x: r.x0, y: r.y0, w: r.x1 - r.x0 + 1, h: r.y1 - r.y0 + 1 });
  const fill = (r: ExtractResult) => { const b = box(r); return b ? r.strong / (b.w * b.h) : 0; };
  const min = Math.max(25, small.width * small.height * 0.0008);
  const colored = red.strong + blue.strong;
  let kind: Kind = 'stamp', ink: Ink = 'red', pick: ExtractResult = red;
  if (red.strong > min && blue.strong > min && red.strong > colored * 0.15 && blue.strong > colored * 0.15) {
    ink = 'both';
    pick = run({ red: true, blue: true });
  } else if (red.strong >= blue.strong && red.strong > min) {
    ink = 'red'; pick = red;
  } else if (blue.strong > min) {
    ink = 'blue'; pick = blue;
    if (fill(blue) < 0.09) kind = 'sign';
  } else if (dark.strong > min) {
    kind = 'sign'; ink = 'red'; pick = dark;
  } else {
    return { kind: 'stamp', ink: 'red', dark: false, box: null };
  }
  const b = box(pick);
  if (!b) return { kind, ink, dark: kind === 'sign', box: null };
  // 여유 6%
  const pad = Math.round(Math.max(b.w, b.h) * 0.06) + 2;
  const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad);
  return {
    kind, ink, dark: kind === 'sign' && pick === dark,
    box: { x: x / small.width, y: y / small.height, w: Math.min(small.width - x, b.w + pad * 2) / small.width, h: Math.min(small.height - y, b.h + pad * 2) / small.height },
  };
}

/* ────────────────────────── 2. 공통 캔버스 도구 ────────────────────────── */

export const makeCanvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
};

/** 알파가 있는 부분에 맞춰 자른다 (여백 margin 비율) */
export function trimCanvas(src: HTMLCanvasElement, margin = 0.02): HTMLCanvasElement | null {
  const ctx = src.getContext('2d')!;
  const { width: w, height: h } = src;
  const d = ctx.getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    const row = y * w * 4;
    for (let x = 0; x < w; x++) {
      if (d[row + x * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
  }
  if (x1 < x0) return null;
  const m = Math.round(Math.max(x1 - x0, y1 - y0) * margin) + 1;
  const cx0 = Math.max(0, x0 - m), cy0 = Math.max(0, y0 - m);
  const cx1 = Math.min(w - 1, x1 + m), cy1 = Math.min(h - 1, y1 + m);
  const out = makeCanvas(cx1 - cx0 + 1, cy1 - cy0 + 1);
  out.getContext('2d')!.drawImage(src, cx0, cy0, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

/** 긴 변을 long 으로 맞춘 사본 (원본보다 크게 키우지 않는 게 기본) */
export function resized(src: HTMLCanvasElement, long: number | null, allowUp = false): HTMLCanvasElement {
  if (!long) return src;
  const s = long / Math.max(src.width, src.height);
  if (s >= 1 && !allowUp) return src;
  const out = makeCanvas(src.width * s, src.height * s);
  const ctx = out.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, out.width, out.height);
  return out;
}

export const fileStamp = (kind: Kind, d = new Date()) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${kind === 'stamp' ? 'stamp' : 'signature'}_${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}.png`;
};

/* ────────────────────────── 사진 불러오기 ────────────────────────── */

export const WORK_MAX = 4000;
export const MAX_FILE_MB = 40;
export type LoadError = 'heic' | 'decode' | 'type' | 'size';
const isHeic = (f: File) => /\.(heic|heif)$/i.test(f.name) || /image\/hei[cf]/i.test(f.type);

/** <img> 로 열어 회전 정보(EXIF)를 반영하고, 긴 변 4000px 이하 캔버스만 남긴다 (원본·위치 정보는 버림) */
export async function loadImage(file: Blob & { name?: string }): Promise<HTMLCanvasElement> {
  const f = file as File;
  if (f.size > MAX_FILE_MB * 1024 * 1024) throw new Error('size' satisfies LoadError);
  if (f.type && !f.type.startsWith('image/') && !isHeic(f)) throw new Error('type' satisfies LoadError);
  const url = URL.createObjectURL(f);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    try { await img.decode(); } catch { throw new Error((isHeic(f) ? 'heic' : 'decode') satisfies LoadError); }
    const w0 = img.naturalWidth, h0 = img.naturalHeight;
    if (!w0 || !h0) throw new Error((isHeic(f) ? 'heic' : 'decode') satisfies LoadError);
    const s = Math.min(1, WORK_MAX / Math.max(w0, h0));
    const c = makeCanvas(w0 * s, h0 * s);
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, c.width, c.height);
    img.src = '';
    return c;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** 회전한 사본 (quarter: 90° 단위, fine: 미세 각도) — 잘리지 않게 캔버스를 넓힌다. 빈 곳은 흰색 */
export function rotated(src: HTMLCanvasElement, quarter: number, fine: number): HTMLCanvasElement {
  const deg = ((quarter % 4) + 4) % 4 * 90 + fine;
  if (!deg) return src;
  const rad = (deg * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
  const w = src.width * cos + src.height * sin, h = src.width * sin + src.height * cos;
  const out = makeCanvas(w, h);
  const ctx = out.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.translate(out.width / 2, out.height / 2);
  ctx.rotate(rad);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, -src.width / 2, -src.height / 2);
  return out;
}

/* ────────────────────────── 3. 직접 그리기 ────────────────────────── */

export interface StrokePoint { x: number; y: number; t: number; p: number }
export interface Stroke { color: string; size: number; pen: boolean; pts: StrokePoint[] }

/** 점마다 선 굵기: 펜이면 필압, 아니면 속도(빠를수록 가늘게) */
export function widths(s: Stroke): number[] {
  const out: number[] = [];
  let prev = s.size;
  for (let i = 0; i < s.pts.length; i++) {
    const a = s.pts[i], b = s.pts[i - 1];
    let w: number;
    if (s.pen && a.p > 0) w = s.size * (0.35 + a.p * 1.15);
    else if (!b) w = s.size;
    else {
      const v = Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, a.t - b.t); // px/ms (그리기 좌표 기준)
      w = s.size * Math.min(1.35, Math.max(0.42, 1.35 - v * 0.55));
    }
    prev = i === 0 ? w : prev * 0.72 + w * 0.28;
    out.push(prev);
  }
  return out;
}

/** 선들을 그린다 (scale: 좌표 배율) — 중간점을 잇는 곡선으로 매끄럽게 */
export function drawStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[], scale = 1) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const s of strokes) {
    const pts = s.pts, ws = widths(s);
    ctx.strokeStyle = s.color;
    ctx.fillStyle = s.color;
    if (pts.length === 1) {
      ctx.beginPath();
      ctx.arc(pts[0].x * scale, pts[0].y * scale, (ws[0] * scale) / 2, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1], p1 = pts[i];
      const pPrev = pts[i - 2] ?? p0;
      const m0x = (pPrev.x + p0.x) / 2, m0y = (pPrev.y + p0.y) / 2;
      const m1x = (p0.x + p1.x) / 2, m1y = (p0.y + p1.y) / 2;
      ctx.lineWidth = ((ws[i - 1] + ws[i]) / 2) * scale;
      ctx.beginPath();
      ctx.moveTo((i === 1 ? p0.x : m0x) * scale, (i === 1 ? p0.y : m0y) * scale);
      ctx.quadraticCurveTo(p0.x * scale, p0.y * scale, m1x * scale, m1y * scale);
      if (i === pts.length - 1) ctx.lineTo(p1.x * scale, p1.y * scale);
      ctx.stroke();
    }
  }
}

/* ────────────────────────── 4. 이름으로 만들기 ────────────────────────── */

export interface FontDef { family: string; weight: number; label: string }

/** 손글씨 싸인 폰트 — 모두 Google Fonts(OFL) */
export const SIGN_FONTS_KO: FontDef[] = [
  { family: 'Nanum Pen Script', weight: 400, label: '나눔손글씨 펜' },
  { family: 'Nanum Brush Script', weight: 400, label: '나눔손글씨 붓' },
  { family: 'East Sea Dokdo', weight: 400, label: '동해 독도' },
  { family: 'Dokdo', weight: 400, label: '독도' },
  { family: 'Gaegu', weight: 700, label: '개구' },
  { family: 'Hi Melody', weight: 400, label: '하이멜로디' },
  { family: 'Gamja Flower', weight: 400, label: '감자꽃' },
  { family: 'Yeon Sung', weight: 400, label: '연성' },
];
export const SIGN_FONTS_EN: FontDef[] = [
  { family: 'Great Vibes', weight: 400, label: 'Great Vibes' },
  { family: 'Allura', weight: 400, label: 'Allura' },
  { family: 'Sacramento', weight: 400, label: 'Sacramento' },
  { family: 'Alex Brush', weight: 400, label: 'Alex Brush' },
  { family: 'Mr Dafoe', weight: 400, label: 'Mr Dafoe' },
  { family: 'Herr Von Muellerhoff', weight: 400, label: 'Herr Von Muellerhoff' },
  { family: 'Dancing Script', weight: 700, label: 'Dancing Script' },
  { family: 'Caveat', weight: 700, label: 'Caveat' },
];
/** 도장 글꼴 — 무료 상업용 전서체·인장체가 없어 굵은 명조·고딕(OFL)으로 대신한다 */
export const STAMP_FONTS: FontDef[] = [
  { family: 'Noto Serif KR', weight: 900, label: '굵은 명조' },
  { family: 'Nanum Myeongjo', weight: 800, label: '나눔명조' },
  { family: 'Song Myung', weight: 400, label: '송명' },
  { family: 'Black Han Sans', weight: 400, label: '검은 고딕' },
];
export const ALL_FONTS = [...SIGN_FONTS_KO, ...SIGN_FONTS_EN, ...STAMP_FONTS];
export const FONT_CSS = `https://fonts.googleapis.com/css2?${ALL_FONTS
  .filter((f, i, a) => a.findIndex((g) => g.family === f.family) === i)
  .map((f) => `family=${f.family.replace(/ /g, '+')}${f.weight !== 400 ? `:wght@${f.weight}` : ''}`)
  .join('&')}&display=swap`;
export const fontStr = (f: FontDef, px: number) => `${f.weight} ${px}px "${f.family}"`;
export const hasHangul = (t: string) => /[ᄀ-ᇿ㄰-㆏가-힣]/.test(t);
export const hasCJK = (t: string) => /[ᄀ-ᇿ㄰-㆏가-힣㐀-鿿豈-﫿]/.test(t);

/** 손글씨 폰트 싸인 → 투명 캔버스 (잘라서 돌려줌) */
export function renderSignatureText(text: string, font: FontDef, color: string): HTMLCanvasElement | null {
  const px = 220;
  const probe = makeCanvas(4, 4).getContext('2d')!;
  probe.font = fontStr(font, px);
  const m = probe.measureText(text);
  const w = Math.ceil(m.width + px * 1.2), h = Math.ceil(px * 2);
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d')!;
  ctx.font = fontStr(font, px);
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, px * 0.6, px * 1.3);
  return trimCanvas(c, 0.04);
}

export type StampShape = 'circle' | 'square' | 'ellipse';
export interface StampOptions {
  text: string;
  shape: StampShape;
  font: FontDef;
  /** 1~3 테두리 두께 */
  border: 1 | 2 | 3;
  color: string;
  /** 인주 질감 (얼룩·번짐) */
  texture: boolean;
}

/** 글자 수별 줄 수: 2→세로 1줄, 3→세로 1줄, 4→2×2, 5·6→세로 3자씩 2줄, 7·8→세로 4자씩 2줄 */
export function stampGrid(n: number): number[] {
  if (n <= 3) return [n];
  if (n === 4) return [2, 2];
  if (n <= 6) return [3, n - 3];
  return [4, n - 4];
}

/** 작은 수로 만드는 반복 가능한 난수 (같은 이름이면 같은 질감) */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
}
const hash = (t: string) => { let h = 2166136261; for (const ch of t) { h ^= ch.codePointAt(0)!; h = Math.imul(h, 16777619); } return h >>> 0; };

/** 이름 도장 → 투명 캔버스 */
export function drawStamp(o: StampOptions): HTMLCanvasElement {
  const chars = Array.from(o.text.replace(/\s+/g, ''));
  const cjk = hasCJK(o.text);
  const H = 1000, W = o.shape === 'ellipse' ? 780 : 1000;
  const c = makeCanvas(W, H);
  const ctx = c.getContext('2d')!;
  const bw = [0, 0.032, 0.05, 0.07][o.border] * H;
  ctx.strokeStyle = o.color;
  ctx.fillStyle = o.color;
  ctx.lineWidth = bw;
  // 테두리
  ctx.beginPath();
  if (o.shape === 'circle') ctx.arc(W / 2, H / 2, W / 2 - bw / 2 - 6, 0, Math.PI * 2);
  else if (o.shape === 'ellipse') ctx.ellipse(W / 2, H / 2, W / 2 - bw / 2 - 6, H / 2 - bw / 2 - 6, 0, 0, Math.PI * 2);
  else {
    const r = H * 0.04, x = bw / 2 + 6, y = bw / 2 + 6, w = W - bw - 12, h = H - bw - 12;
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  ctx.stroke();

  if (chars.length) {
    // 글자 칸이 들어갈 안쪽 상자
    const cols = cjk ? stampGrid(chars.length) : [1];
    const nCols = cols.length;
    let bx: number, by: number, bwid: number, bhei: number;
    if (o.shape === 'square') {
      const pad = bw + H * 0.07;
      bx = pad; by = pad; bwid = W - pad * 2; bhei = H - pad * 2;
    } else {
      const k = nCols === 1 ? [0.5, 0.74] : [0.66, 0.66];
      bwid = W * k[0]; bhei = H * k[1];
      bx = (W - bwid) / 2; by = (H - bhei) / 2;
    }
    if (cjk) {
      // 오른쪽 줄부터 위→아래 (한국 도장 읽는 순서)
      const colW = bwid / nCols;
      let idx = 0;
      for (let ci = 0; ci < nCols; ci++) {
        const rows = cols[ci];
        const cellH = bhei / rows;
        const x = bx + bwid - colW * (ci + 1);
        for (let r = 0; r < rows; r++) {
          const ch = chars[idx++];
          if (!ch) break;
          drawGlyphInBox(ctx, ch, o.font, x, by + cellH * r, colW, cellH);
        }
      }
    } else {
      // 로마자: 단어를 최대 2줄로, 가운데 정렬
      const words = o.text.trim().split(/\s+/);
      const lines = words.length > 1 && o.text.length > 8
        ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]
        : [o.text.trim()];
      const lh = bhei / lines.length;
      lines.forEach((ln, li) => drawGlyphInBox(ctx, ln, o.font, bx, by + lh * li + lh * 0.1, bwid, lh * 0.8, true));
    }
  }
  if (o.texture) applyInkTexture(c, hash(o.text + o.shape + o.border));
  return c;
}

/** 한 칸에 글자를 꽉 채워 그린다 (도장처럼 가로·세로를 따로 늘림) */
function drawGlyphInBox(ctx: CanvasRenderingContext2D, text: string, font: FontDef, x: number, y: number, w: number, h: number, keepRatio = false) {
  const px = 300;
  ctx.save();
  ctx.font = fontStr(font, px);
  ctx.textBaseline = 'alphabetic';
  const m = ctx.measureText(text);
  const gw = Math.max(1, m.actualBoundingBoxLeft + m.actualBoundingBoxRight);
  const gh = Math.max(1, m.actualBoundingBoxAscent + m.actualBoundingBoxDescent);
  const pad = 0.9;
  let sx = (w * pad) / gw, sy = (h * pad) / gh;
  if (keepRatio) { const s = Math.min(sx, sy); sx = s; sy = s; }
  else {
    // 너무 납작하거나 길쭉해지지 않게 비율 차이를 1.7배까지만
    if (sx / sy > 1.7) sx = sy * 1.7;
    if (sy / sx > 1.7) sy = sx * 1.7;
  }
  const cx = x + w / 2, cy = y + h / 2;
  ctx.translate(cx, cy);
  ctx.scale(sx, sy);
  ctx.fillText(text, -gw / 2 + m.actualBoundingBoxLeft, gh / 2 - m.actualBoundingBoxDescent);
  ctx.restore();
}

/** 인주 질감: 얕은 얼룩, 군데군데 빈 점, 가장자리 거칠게 (같은 seed 면 같은 결과) */
function applyInkTexture(c: HTMLCanvasElement, seed: number) {
  const ctx = c.getContext('2d')!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  const rand = rng(seed);
  // 거친 격자 잡음 (값 잡음)
  const G = 24, gw = Math.ceil(c.width / G) + 2, gh = Math.ceil(c.height / G) + 2;
  const grid = new Float32Array(gw * gh);
  for (let i = 0; i < grid.length; i++) grid[i] = rand();
  const fine = new Float32Array(c.width * c.height);
  for (let i = 0; i < fine.length; i++) fine[i] = rand();
  for (let y = 0; y < c.height; y++) {
    const fy = y / G, iy = Math.floor(fy), ty = fy - iy;
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      if (!d[i + 3]) continue;
      const fx = x / G, ix = Math.floor(fx), tx = fx - ix;
      const v = (grid[iy * gw + ix] * (1 - tx) + grid[iy * gw + ix + 1] * tx) * (1 - ty)
        + (grid[(iy + 1) * gw + ix] * (1 - tx) + grid[(iy + 1) * gw + ix + 1] * tx) * ty;
      let a = d[i + 3] / 255;
      a *= 0.72 + 0.28 * v;                       // 얕은 얼룩
      const f = fine[y * c.width + x];
      if (f > 0.985 - (1 - v) * 0.05) a *= 0.15;  // 빈 점
      else if (f < 0.04) a *= 0.8;
      d[i + 3] = Math.round(a * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
}
