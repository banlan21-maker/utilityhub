'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Layers, Upload, Download, RotateCw, Image as ImageIcon, Move, Brush, Eraser, Trash2, Undo2, SplitSquareHorizontal } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  TILE_PRESETS, SAMPLE_ZONES, SAMPLE_MIRROR, FINISH_GLOSS, buildLightMap, buildMirrorLight, buildMips, countTiles, gainTexture, innerEdges,
  isConvex, plainTexture, render,
  type Finish, type LightMap, type Origin, type Tex, type TexInfo, type Vec, type ZoneId, type ZoneRender,
} from '@/lib/tileVisualizer';
import { defaultPerBox, tileOrder } from '@/lib/interiorMaterial';
import s from './tile-visualizer.module.css';

const SAMPLE_SRC = '/images/tile-visualizer/bathroom.jpg';
const SAMPLE_MASK = '/images/tile-visualizer/bathroom-mask.webp';
const SAMPLE_W = 1536, SAMPLE_H = 2752;
/** 화면 미리보기 긴 변, 내려받기 긴 변 */
const PREVIEW_LONG = 1200, EXPORT_LONG = 3000;
/** 꼭짓점 맞추기 때 사진 둘레 여백(가로 폭 대비) */
const PAD = 0.07;

const ZONE_IDS: ZoneId[] = ['floor', 'back', 'left', 'right'];
const SIZES: [number, number][] = [[300, 300], [300, 600], [600, 600], [600, 1200], [800, 800], [200, 1200], [100, 300], [100, 100]];
const GROUT_COLORS = [
  { hex: '#f2f1ed', ko: '화이트', en: 'White' }, { hex: '#c9c7c2', ko: '라이트그레이', en: 'Light grey' },
  { hex: '#8e8c88', ko: '그레이', en: 'Grey' }, { hex: '#4a4a4c', ko: '차콜', en: 'Charcoal' },
  { hex: '#1f1f21', ko: '블랙', en: 'Black' }, { hex: '#cdbb9c', ko: '베이지', en: 'Beige' },
];

type TileSrc = { kind: 'preset'; id: string } | { kind: 'upload'; url: string; name: string };
interface Zone {
  on: boolean;
  quad: Vec[]; // 사진 대비 0~1
  W: string; H: string; // m
  tile: TileSrc;
  tw: string; th: string; // mm
  grout: string; groutColor: string;
  stagger: number; origin: Origin;
  shade: number; bright: number; finish: Finish;
}

const preset = (id: string) => TILE_PRESETS.find(p => p.id === id)!;
const makeZone = (on: boolean, quad: Vec[], W: number, H: number, tileId: string, size: [number, number], extra: Partial<Zone> = {}): Zone => ({
  on, quad, W: String(W), H: String(H), tile: { kind: 'preset', id: tileId }, tw: String(size[0]), th: String(size[1]),
  grout: '2', groutColor: '#c9c7c2', stagger: 0, origin: 'corner', shade: 100, bright: 100, finish: preset(tileId).finish, ...extra,
});

const sampleZones = (): Record<ZoneId, Zone> => ({
  floor: makeZone(true, SAMPLE_ZONES.floor.quad, 1.5, 2.05, 'darkconcrete', [600, 600], { groutColor: '#8e8c88', origin: 'center' }),
  back: makeZone(true, SAMPLE_ZONES.back.quad, 1.5, 2.4, 'marble', [600, 1200], { groutColor: '#f2f1ed' }),
  left: makeZone(true, SAMPLE_ZONES.left.quad, 2.05, 2.4, 'marble', [600, 1200], { groutColor: '#f2f1ed' }),
  right: makeZone(true, SAMPLE_ZONES.right.quad, 2.05, 2.4, 'marble', [600, 1200], { groutColor: '#f2f1ed' }),
});
// 내 사진: 정면에서 찍은 방 모양으로 시작 (사진에 맞게 꼭짓점을 옮긴다)
const photoZones = (): Record<ZoneId, Zone> => ({
  floor: makeZone(true, [{ x: 0.3, y: 0.62 }, { x: 0.7, y: 0.62 }, { x: 1, y: 1 }, { x: 0, y: 1 }], 1.5, 2.0, 'warmgrey', [600, 600], { origin: 'center' }),
  back: makeZone(true, [{ x: 0.3, y: 0.28 }, { x: 0.7, y: 0.28 }, { x: 0.7, y: 0.62 }, { x: 0.3, y: 0.62 }], 1.5, 2.3, 'white', [300, 600]),
  left: makeZone(false, [{ x: 0, y: 0 }, { x: 0.3, y: 0.28 }, { x: 0.3, y: 0.62 }, { x: 0, y: 1 }], 2.0, 2.3, 'white', [300, 600]),
  right: makeZone(false, [{ x: 0.7, y: 0.28 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0.7, y: 0.62 }], 2.0, 2.3, 'white', [300, 600]),
});

const num = (v: string) => Number(String(v).replace(/,/g, '')) || 0;
const dec = (raw: string) => { const [i, ...d] = raw.replace(/[^0-9.]/g, '').split('.'); return d.length ? `${i}.${d.join('').slice(0, 2)}` : i; };
const digits = (raw: string) => raw.replace(/[^0-9]/g, '').slice(0, 4);
const hexRgb = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

const loadImg = (src: string) => new Promise<HTMLImageElement>((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = src; });
function pixels(img: CanvasImageSource, w: number, h: number) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h).data;
}
const alphaOf = (d: Uint8ClampedArray) => { const a = new Uint8Array(d.length / 4); for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3]; return a; };
const fit = (w: number, h: number, long: number) => { const k = Math.min(1, long / Math.max(w, h)); return { w: Math.round(w * k), h: Math.round(h * k) }; };
/** 가로세로 절반으로 줄이기 (빠른 미리보기용) */
function halfRGBA(d: Uint8ClampedArray, w: number, h: number) {
  const W = w >> 1, H = h >> 1, o = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (x * 2 + y * 2 * w) * 4, j = (x + y * W) * 4;
    for (let k = 0; k < 4; k++) o[j + k] = (d[i + k] + d[i + 4 + k] + d[i + w * 4 + k] + d[i + w * 4 + 4 + k]) >> 2;
  }
  return { d: o, w: W, h: H };
}
function halfAlpha(a: Uint8Array, w: number, h: number) {
  const W = w >> 1, H = h >> 1, o = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = x * 2 + y * 2 * w; o[x + y * W] = (a[i] + a[i + 1] + a[i + w] + a[i + w + 1]) >> 2; }
  return o;
}

interface Base { img: HTMLImageElement; mask: HTMLImageElement | null; pw: number; ph: number; photo: Uint8ClampedArray; keep: Uint8Array }
interface Maps { key: string; light: LightMap; hi: LightMap; mirror: LightMap | null }

export default function TileVisualizerClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const L = (ko: string, en: string) => (isKo ? ko : en);
  const f = (n: number, d = 0) => n.toLocaleString(isKo ? 'ko-KR' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  const [source, setSource] = useState<'sample' | 'photo'>('sample');
  const [zonesS, setZonesS] = useState(sampleZones);
  const [zonesP, setZonesP] = useState(photoZones);
  const zones = source === 'sample' ? zonesS : zonesP;
  const setZones = source === 'sample' ? setZonesS : setZonesP;
  const [active, setActive] = useState<ZoneId>('floor');
  const [tool, setTool] = useState<'tile' | 'corners' | 'brush'>('tile');
  const [brush, setBrush] = useState(30);
  const [erase, setErase] = useState(false);
  const [split, setSplit] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [baseVer, setBaseVer] = useState(0);
  const [texVer, setTexVer] = useState(0);
  const [maskVer, setMaskVer] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loupe, setLoupe] = useState<Vec | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const loupeRef = useRef<HTMLCanvasElement>(null);
  const baseRef = useRef<{ sample: Base | null; photo: Base | null }>({ sample: null, photo: null });
  const mapsRef = useRef<{ full: Maps | null; half: Maps | null }>({ full: null, half: null });
  const lastOut = useRef<ImageData | null>(null);
  const srcTex = useRef(new Map<string, Tex | 'loading' | 'error'>());
  const texCache = useRef(new Map<string, TexInfo>());
  const uploadImgs = useRef(new Map<string, HTMLImageElement>());
  const photoUrl = useRef<string | null>(null);
  const dragRef = useRef<number | null>(null);
  const lastBrush = useRef<{ x: number; y: number } | null>(null);
  const history = useRef<Uint8Array[]>([]);
  const lastChange = useRef(0);

  const flash = (t: string) => { setMsg(t); setTimeout(() => setMsg(''), 3000); };
  const z = zones[active];
  const upd = (id: ZoneId, patch: Partial<Zone>) => setZones(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  const updActive = (patch: Partial<Zone>) => upd(active, patch);

  // 샘플 사진과 가구 마스크 불러오기
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [img, mask] = await Promise.all([loadImg(SAMPLE_SRC), loadImg(SAMPLE_MASK)]);
        if (!alive) return;
        const { w, h } = fit(SAMPLE_W, SAMPLE_H, PREVIEW_LONG);
        baseRef.current.sample = { img, mask, pw: w, ph: h, photo: pixels(img, w, h), keep: alphaOf(pixels(mask, w, h)) };
        setBaseVer(v => v + 1);
      } catch { if (alive) setMsg(L('샘플 사진을 불러오지 못했습니다. 새로고침해 보세요.', 'Could not load the sample photo.')); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
    for (const k of uploadImgs.current.keys()) URL.revokeObjectURL(k);
  }, []);

  // 실사 텍스처는 고를 때 불러온다
  useEffect(() => {
    for (const zz of [...Object.values(zonesS), ...Object.values(zonesP)]) {
      if (zz.tile.kind !== 'preset') continue;
      const src = preset(zz.tile.id).tex?.src;
      if (!src || srcTex.current.has(src)) continue;
      srcTex.current.set(src, 'loading');
      loadImg(src).then(img => {
        srcTex.current.set(src, { w: img.naturalWidth, h: img.naturalHeight, data: pixels(img, img.naturalWidth, img.naturalHeight) });
        setTexVer(v => v + 1);
      }).catch(() => { srcTex.current.set(src, 'error'); flash(L('타일 텍스처를 불러오지 못했습니다.', 'Could not load the tile texture.')); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zonesS, zonesP]);

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      const url = URL.createObjectURL(file);
      const img = await loadImg(url);
      if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
      photoUrl.current = url;
      const { w, h } = fit(img.naturalWidth, img.naturalHeight, PREVIEW_LONG);
      baseRef.current.photo = { img, mask: null, pw: w, ph: h, photo: pixels(img, w, h), keep: new Uint8Array(w * h) };
      history.current = [];
      setZonesP(photoZones());
      setSource('photo');
      setActive('floor');
      setTool('corners');
      setSplit(null);
      setBaseVer(v => v + 1);
    } catch { flash(L('사진을 열지 못했습니다. JPG·PNG 사진을 올려 주세요.', 'Could not open the photo.')); }
  };

  const onTileUpload = async (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImg(url);
      uploadImgs.current.set(url, img);
      updActive({ on: true, tile: { kind: 'upload', url, name: file.name }, finish: 'matte' });
    } catch { URL.revokeObjectURL(url); flash(L('타일 사진을 열지 못했습니다.', 'Could not open the tile image.')); }
  };

  // 텍스처: 실사(이음매 없음)·단색·올린 사진
  const texFor = useCallback((zz: Zone): { tex: TexInfo; bevel: number } | null => {
    const tw = num(zz.tw), th = num(zz.th);
    if (zz.tile.kind === 'preset') {
      const p = preset(zz.tile.id);
      if (p.tex) {
        const key = `t:${p.id}`;
        let tex = texCache.current.get(key);
        if (!tex) {
          const raw = srcTex.current.get(p.tex.src);
          if (!raw || typeof raw === 'string') return null;
          const base = p.tex.gain ? gainTexture(raw, p.tex.gain) : raw;
          tex = { levels: buildMips(base), mmW: p.tex.mm[0], mmH: p.tex.mm[1], seamless: true, rotations: p.tex.rotations, grainX: p.tex.grainX, jitter: p.jitter };
          texCache.current.set(key, tex);
        }
        return { tex, bevel: p.bevel };
      }
      const key = `p:${p.id}:${tw}x${th}`;
      let tex = texCache.current.get(key);
      if (!tex) {
        const pt = plainTexture(p.plain!, tw, th, 3);
        tex = { levels: buildMips(pt.tex), mmW: pt.mmW, mmH: pt.mmH, seamless: false, rotations: 2, grainX: true, jitter: p.jitter };
        texCache.current.set(key, tex);
      }
      return { tex, bevel: p.bevel };
    }
    const key = `u:${zz.tile.url}:${tw}x${th}`;
    let tex = texCache.current.get(key);
    if (!tex) {
      const img = uploadImgs.current.get(zz.tile.url);
      if (!img) return null;
      const lv = texCache.current.get(`u:${zz.tile.url}`)?.levels ?? (() => { const { w, h } = fit(img.naturalWidth, img.naturalHeight, 768); return buildMips({ w, h, data: pixels(img, w, h) }); })();
      texCache.current.set(`u:${zz.tile.url}`, { levels: lv, mmW: 1, mmH: 1, seamless: false, rotations: 1, grainX: true, jitter: 0 });
      tex = { levels: lv, mmW: tw, mmH: th, seamless: false, rotations: 1, grainX: true, jitter: 0.01 };
      texCache.current.set(key, tex);
    }
    return { tex, bevel: 0.8 };
  }, []);

  const zoneRenders = useCallback((all: Record<ZoneId, Zone>, w: number, h: number, isSample: boolean) => {
    const list: ZoneRender[] = [];
    const idx: Record<ZoneId, number> = { floor: -1, back: -1, left: -1, right: -1 };
    for (const id of ZONE_IDS) {
      const zz = all[id];
      if (!zz.on) continue;
      const t = texFor(zz);
      const tw = num(zz.tw), th = num(zz.th);
      if (!t || !(tw >= 10 && th >= 10)) continue;
      idx[id] = list.length;
      list.push({
        quad: zz.quad.map(p => ({ x: p.x * w, y: p.y * h })), W: num(zz.W) * 1000, H: num(zz.H) * 1000,
        layout: { w: tw, h: th, grout: Math.min(20, num(zz.grout)), stagger: zz.stagger, origin: zz.origin },
        tex: t.tex, bevel: t.bevel, grout: hexRgb(zz.groutColor), shade: zz.shade / 100, bright: zz.bright / 100,
        gloss: FINISH_GLOSS[zz.finish], floor: id === 'floor', inner: isSample ? SAMPLE_ZONES[id].inner : innerEdges(zz.quad),
      });
    }
    return { list, idx };
  }, [texFor]);

  /** 조명 지도(거친·촘촘한·거울) — 사진과 가림이 같으면 다시 만들지 않는다 */
  const mapsFor = (key: string, photo: Uint8ClampedArray, w: number, h: number, keep: Uint8Array, isSample: boolean, slot: 'full' | 'half'): Maps => {
    const cur = mapsRef.current[slot];
    if (cur?.key === key) return cur;
    const m: Maps = {
      key, light: buildLightMap(photo, w, h, keep, 44, 2), hi: buildLightMap(photo, w, h, keep, 150, 1),
      mirror: isSample ? buildMirrorLight(photo, w, h, SAMPLE_MIRROR) : null,
    };
    mapsRef.current[slot] = m;
    return m;
  };

  const compose = useCallback(() => {
    const cv = canvasRef.current, base = baseRef.current[source], o = lastOut.current;
    if (!cv || !base || !o || o.width !== cv.width) return;
    const ctx = cv.getContext('2d')!;
    if (split === null) { ctx.putImageData(o, 0, 0); return; }
    const img = new ImageData(new Uint8ClampedArray(o.data), o.width, o.height);
    const sx = Math.round(split * o.width);
    for (let y = 0; y < o.height; y++) {
      const row = y * o.width * 4;
      img.data.set(base.photo.subarray(row, row + sx * 4), row);
    }
    ctx.putImageData(img, 0, 0);
  }, [source, split]);

  // 미리보기 그리기: 연달아 바꾸는 중에는 절반 해상도로 먼저, 멈추면 원래 해상도로
  useEffect(() => {
    const base = baseRef.current[source];
    const cv = canvasRef.current;
    if (!base || !cv) return;
    const now = performance.now();
    const rapid = now - lastChange.current < 350;
    lastChange.current = now;
    const isSample = source === 'sample';
    const draw = (full: boolean) => {
      if (cv.width !== base.pw) cv.width = base.pw;
      if (cv.height !== base.ph) cv.height = base.ph;
      const ctx = cv.getContext('2d')!;
      let w = base.pw, h = base.ph, photo = base.photo, keep = base.keep;
      if (!full) { const hp = halfRGBA(photo, w, h); photo = hp.d; keep = halfAlpha(base.keep, w, h); w = hp.w; h = hp.h; }
      const maps = mapsFor(`${source}:${baseVer}:${maskVer}:${w}`, photo, w, h, keep, isSample, full ? 'full' : 'half');
      const { list, idx } = zoneRenders(zones, w, h, isSample);
      const out = new ImageData(w, h);
      render(out.data, photo, w, h, list, maps.light, keep, {
        hiLight: maps.hi,
        mirror: isSample ? { ...SAMPLE_MIRROR, back: idx.back, right: idx.right, floor: idx.floor } : null,
        mirrorLight: maps.mirror,
        grain: full ? 1.4 : 0,
      });
      if (source === 'photo' && tool === 'brush') {
        // 칠한 곳(원래 사진을 살리는 곳)을 보라색으로 표시
        const d = out.data;
        for (let p = 0; p < keep.length; p++) {
          const a = (keep[p] / 255) * 0.45;
          if (!a) continue;
          d[p * 4] = d[p * 4] * (1 - a) + 139 * a; d[p * 4 + 1] = d[p * 4 + 1] * (1 - a) + 92 * a; d[p * 4 + 2] = d[p * 4 + 2] * (1 - a) + 246 * a;
        }
      }
      if (full) { lastOut.current = out; compose(); }
      else {
        const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h;
        tmp.getContext('2d')!.putImageData(out, 0, 0);
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(tmp, 0, 0, base.pw, base.ph);
      }
    };
    const id = requestAnimationFrame(() => draw(!rapid));
    const t = rapid ? setTimeout(() => draw(true), 280) : null;
    return () => { cancelAnimationFrame(id); if (t) clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, zones, baseVer, texVer, maskVer, tool, zoneRenders]);

  useEffect(() => { compose(); }, [compose]);

  // 내려받기: 원래 해상도로 다시 그린다
  const download = async () => {
    const base = baseRef.current[source];
    if (!base) return;
    setBusy(true);
    await new Promise(r => setTimeout(r, 30));
    try {
      const isSample = source === 'sample';
      const nat = isSample ? { w: SAMPLE_W, h: SAMPLE_H } : { w: base.img.naturalWidth, h: base.img.naturalHeight };
      const { w, h } = fit(nat.w, nat.h, EXPORT_LONG);
      const photo = pixels(base.img, w, h);
      let keep: Uint8Array;
      if (base.mask) keep = alphaOf(pixels(base.mask, w, h));
      else {
        // 칠한 가림을 큰 해상도로 늘린다
        const mc = document.createElement('canvas'); mc.width = base.pw; mc.height = base.ph;
        const id = new ImageData(base.pw, base.ph);
        for (let p = 0; p < base.keep.length; p++) id.data[p * 4 + 3] = base.keep[p];
        mc.getContext('2d')!.putImageData(id, 0, 0);
        keep = alphaOf(pixels(mc, w, h));
      }
      const { list, idx } = zoneRenders(zones, w, h, isSample);
      const out = new ImageData(w, h);
      render(out.data, photo, w, h, list, buildLightMap(photo, w, h, keep, 44, 2), keep, {
        hiLight: buildLightMap(photo, w, h, keep, 150, 1),
        mirror: isSample ? { ...SAMPLE_MIRROR, back: idx.back, right: idx.right, floor: idx.floor } : null,
      });
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d')!.putImageData(out, 0, 0);
      const blob = await new Promise<Blob | null>(r => c.toBlob(r, 'image/jpeg', 0.92));
      if (!blob) throw new Error('blob');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `tile-simulation-${new Date().toISOString().slice(0, 10)}.jpg`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } catch { flash(L('이미지를 만들지 못했습니다.', 'Could not create the image.')); }
    setBusy(false);
  };

  // ── 꼭짓점 끌기 (+ 확대경)
  const svgPoint = (e: React.PointerEvent) => {
    const svg = svgRef.current!, base = baseRef.current[source]!;
    const r = svg.getBoundingClientRect();
    const m = PAD / (1 - 2 * PAD), my = (m * base.pw) / base.ph;
    return { x: ((e.clientX - r.left) / r.width) * (1 + 2 * m) - m, y: ((e.clientY - r.top) / r.height) * (1 + 2 * my) - my };
  };
  const onHandleDown = (i: number) => (e: React.PointerEvent) => { e.preventDefault(); (e.target as Element).setPointerCapture(e.pointerId); dragRef.current = i; setLoupe(z.quad[i]); };
  const onHandleMove = (e: React.PointerEvent) => {
    if (dragRef.current === null) return;
    const base = baseRef.current[source]!;
    const m = PAD / (1 - 2 * PAD), my = (m * base.pw) / base.ph;
    const p = svgPoint(e);
    const q = z.quad.slice();
    q[dragRef.current] = { x: Math.min(1 + m, Math.max(-m, p.x)), y: Math.min(1 + my, Math.max(-my, p.y)) };
    updActive({ quad: q });
    setLoupe(q[dragRef.current]);
  };
  const onHandleUp = () => { dragRef.current = null; setLoupe(null); };
  useEffect(() => {
    const c = loupeRef.current, base = baseRef.current[source];
    if (!loupe || !c || !base) return;
    const ctx = c.getContext('2d')!;
    const S = c.width, nw = base.img.naturalWidth, nh = base.img.naturalHeight, span = nw * 0.09;
    ctx.fillStyle = '#222'; ctx.fillRect(0, 0, S, S);
    ctx.drawImage(base.img, loupe.x * nw - span / 2, loupe.y * nh - span / 2, span, span, 0, 0, S, S);
    ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(S / 2, 0); ctx.lineTo(S / 2, S); ctx.moveTo(0, S / 2); ctx.lineTo(S, S / 2); ctx.stroke();
  }, [loupe, source]);

  // ── 가림 칠하기 (미리보기 해상도 마스크) + 되돌리기
  const paint = (e: React.PointerEvent) => {
    const base = baseRef.current.photo, cv = canvasRef.current;
    if (!base || !cv) return;
    const r = cv.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * base.pw, y = ((e.clientY - r.top) / r.height) * base.ph;
    const rad = (brush / 1000) * base.pw;
    const from = lastBrush.current ?? { x, y };
    const steps = Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / (rad / 3)));
    for (let k = 1; k <= steps; k++) {
      const cx = from.x + ((x - from.x) * k) / steps, cy = from.y + ((y - from.y) * k) / steps;
      for (let yy = Math.max(0, Math.floor(cy - rad)); yy <= Math.min(base.ph - 1, Math.ceil(cy + rad)); yy++) {
        for (let xx = Math.max(0, Math.floor(cx - rad)); xx <= Math.min(base.pw - 1, Math.ceil(cx + rad)); xx++) {
          const d = Math.hypot(xx - cx, yy - cy);
          if (d > rad) continue;
          const a = Math.round(Math.min(1, (rad - d) / 1.5) * 255); // 가장자리 1.5px 부드럽게
          const p = xx + yy * base.pw;
          base.keep[p] = erase ? Math.min(base.keep[p], 255 - a) : Math.max(base.keep[p], a);
        }
      }
    }
    lastBrush.current = { x, y };
    setMaskVer(v => v + 1);
  };
  const onCanvasDown = (e: React.PointerEvent) => {
    if (source !== 'photo' || tool !== 'brush') return;
    const base = baseRef.current.photo;
    if (base) { history.current.push(base.keep.slice()); if (history.current.length > 20) history.current.shift(); }
    (e.target as Element).setPointerCapture(e.pointerId);
    lastBrush.current = null;
    paint(e);
  };
  const onCanvasMove = (e: React.PointerEvent) => { if (lastBrush.current) paint(e); };
  const onCanvasUp = () => { lastBrush.current = null; };
  const undoMask = () => { const b = baseRef.current.photo, prev = history.current.pop(); if (b && prev) { b.keep.set(prev); setMaskVer(v => v + 1); } };
  const clearMask = () => { const b = baseRef.current.photo; if (b) { history.current.push(b.keep.slice()); b.keep.fill(0); setMaskVer(v => v + 1); } };

  // ── 전후 비교 손잡이
  const onSplitMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && !(e.buttons & 1)) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setSplit(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
  };

  // 수량 (현재 면)
  const qty = useMemo(() => {
    const W = num(z.W) * 1000, H = num(z.H) * 1000, tw = num(z.tw), th = num(z.th), g = Math.min(20, num(z.grout));
    if (!(W > 0 && H > 0 && tw >= 10 && th >= 10)) return null;
    const c = countTiles(W, H, { w: tw, h: th, grout: g, stagger: z.stagger, origin: z.origin });
    const t = { w: tw, h: th, gap: g };
    return { ...c, area: (W * H) / 1e6, order: tileOrder(c.total, (W * H) / 1e6, t, 5, defaultPerBox(t)), perBox: defaultPerBox(t) };
  }, [z]);

  const zoneName = (id: ZoneId) => ({ floor: L('바닥', 'Floor'), back: L('정면 벽', 'Back wall'), left: L('왼쪽 벽', 'Left wall'), right: L('오른쪽 벽', 'Right wall') })[id];
  const copyToWalls = () => {
    const { tile, tw, th, grout, groutColor, stagger, origin, shade, bright, finish } = z;
    setZones(prev => {
      const next = { ...prev };
      for (const id of ['back', 'left', 'right'] as ZoneId[]) if (id !== active) next[id] = { ...prev[id], on: true, tile, tw, th, grout, groutColor, stagger, origin, shade, bright, finish };
      return next;
    });
    flash(L('✓ 다른 벽에도 같은 타일을 적용했습니다', '✓ Applied to the other walls'));
  };

  const base = baseRef.current[source];
  const ready = !!base && baseVer > 0;
  const editing = source === 'photo' && tool === 'corners';
  const badQuad = !isConvex(z.quad);
  const tileLabel = z.tile.kind === 'preset' ? (isKo ? preset(z.tile.id).ko : preset(z.tile.id).en) : z.tile.name;
  const loading = z.on && z.tile.kind === 'preset' && !!preset(z.tile.id).tex && srcTex.current.get(preset(z.tile.id).tex!.src) === 'loading';

  const chip = <T extends string | number | boolean>(cur: T, val: T, set: (v: T) => void, label: React.ReactNode, key?: string) => (
    <button key={key ?? String(val)} type="button" aria-pressed={cur === val} className={`${s.chip} ${cur === val ? s.chip_on : ''}`} onClick={() => set(val)}>{label}</button>
  );
  const field = (id: string, label: string, value: string, set: (v: string) => void, unit: string, mode: 'dec' | 'int' = 'dec') => (
    <div className={s.field}>
      <label className={s.field_label} htmlFor={id}>{label}</label>
      <div className={s.input_wrap}>
        <input id={id} className={s.input} inputMode={mode === 'dec' ? 'decimal' : 'numeric'} value={value} onChange={e => set(mode === 'dec' ? dec(e.target.value) : digits(e.target.value))} />
        <span className={s.unit}>{unit}</span>
      </div>
    </div>
  );

  const titleStr = L('욕실 타일 시뮬레이터', 'Bathroom Tile Visualizer');
  const descStr = L('내 욕실 사진이나 샘플 욕실에 실사 타일을 실제 크기와 원근으로 깔아 봅니다. 조명·그림자·거울 반사까지 살리고, 줄눈 두께·색, 엇갈림 배치, 필요한 타일 장수까지 확인합니다.', 'Lay photo-real tiles on your own bathroom photo or a sample room at true scale and perspective, keeping lighting, shadows and mirror reflections, with grout, layouts and tile counts.');

  return (
    <div className={s.container}>
      <NavigationActions />
      <header className={s.header}>
        <div className={s.icon_wrap}><Layers size={40} /></div>
        <h1 className={s.title}>{titleStr}</h1>
        <p className={s.subtitle}>{descStr}</p>
      </header>

      <div className={s.source}>
        <button type="button" aria-pressed={source === 'sample'} className={`${s.src_btn} ${source === 'sample' ? s.src_on : ''}`} onClick={() => { setSource('sample'); setTool('tile'); setSplit(null); }}>
          <ImageIcon size={18} />{L('샘플 욕실', 'Sample bathroom')}<small>{L('바로 타일 바꿔 보기', 'try tiles right away')}</small>
        </button>
        <label className={`${s.src_btn} ${source === 'photo' ? s.src_on : ''}`}>
          <Upload size={18} />{baseRef.current.photo ? L('내 사진 바꾸기', 'Change my photo') : L('내 욕실 사진 올리기', 'Upload my photo')}<small>{L('사진은 내 기기 안에서만 처리', 'processed on your device')}</small>
          <input type="file" accept="image/*" className={s.hidden} onChange={e => { onPhoto(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
        {baseRef.current.photo && source !== 'photo' && <button type="button" className={s.link_btn} onClick={() => { setSource('photo'); setSplit(null); }}>{L('내 사진으로 돌아가기', 'Back to my photo')}</button>}
      </div>

      <div className={s.split}>
        <div className={s.stage}>
          <div className={`${s.canvas_wrap} ${editing ? s.canvas_pad : ''}`} style={editing ? { padding: `${PAD * 100}%` } : undefined}>
            <div className={s.canvas_box}>
              <canvas ref={canvasRef} width={670} height={1200} className={`${s.canvas} ${source === 'photo' && tool === 'brush' ? s.brushing : ''}`}
                aria-label={L('타일 합성 미리보기', 'Tile preview')}
                onPointerDown={onCanvasDown} onPointerMove={onCanvasMove} onPointerUp={onCanvasUp} onPointerCancel={onCanvasUp} />
              {split !== null && !editing && !(source === 'photo' && tool === 'brush') && (
                <div className={s.split_layer} onPointerDown={e => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); onSplitMove(e); }} onPointerMove={onSplitMove}>
                  <div className={s.split_line} style={{ left: `${split * 100}%` }}><span className={s.split_knob}>⇔</span></div>
                  <span className={`${s.split_tag} ${s.split_l}`}>{L('시공 전', 'Before')}</span>
                  <span className={`${s.split_tag} ${s.split_r}`}>{L('시공 후', 'After')}</span>
                </div>
              )}
            </div>
            {!ready && <div className={s.loading}>{L('사진 불러오는 중…', 'Loading…')}</div>}
            {editing && base && (() => {
              const m = PAD / (1 - 2 * PAD), my = (m * base.pw) / base.ph;
              const vb = `${-m} ${-my} ${1 + 2 * m} ${1 + 2 * my}`;
              const asp = base.pw / base.ph;
              const rr = 0.04;
              return (
                <svg ref={svgRef} className={s.overlay} viewBox={vb} preserveAspectRatio="none" onPointerMove={onHandleMove} onPointerUp={onHandleUp} onPointerCancel={onHandleUp}>
                  {ZONE_IDS.filter(id => zones[id].on && id !== active).map(id => (
                    <polygon key={id} points={zones[id].quad.map(p => `${p.x},${p.y}`).join(' ')} className={s.ov_other} vectorEffect="non-scaling-stroke" />
                  ))}
                  <rect x={0} y={0} width={1} height={1} className={s.ov_frame} vectorEffect="non-scaling-stroke" />
                  <polygon points={z.quad.map(p => `${p.x},${p.y}`).join(' ')} className={badQuad ? s.ov_bad : s.ov_active} vectorEffect="non-scaling-stroke" />
                  {z.quad.map((p, i) => (
                    <g key={i}>
                      <ellipse cx={p.x} cy={p.y} rx={rr * 1.9} ry={rr * 1.9 * asp} className={s.handle_hit} onPointerDown={onHandleDown(i)} />
                      <ellipse cx={p.x} cy={p.y} rx={rr} ry={rr * asp} className={s.handle} vectorEffect="non-scaling-stroke" />
                      <text x={p.x} y={p.y} className={s.handle_num} style={{ fontSize: rr * 1.1 }} transform={`translate(${p.x} ${p.y}) scale(1 ${asp}) translate(${-p.x} ${-p.y})`} dominantBaseline="central" textAnchor="middle">{i + 1}</text>
                    </g>
                  ))}
                </svg>
              );
            })()}
            {loupe && <canvas ref={loupeRef} width={240} height={240} className={`${s.loupe} ${loupe.x < 0.5 ? s.loupe_r : ''}`} aria-hidden />}
          </div>
          <div className={s.stage_bar}>
            <button type="button" aria-pressed={split !== null} className={`${s.ghost} ${split !== null ? s.ghost_on : ''}`} onClick={() => setSplit(v => (v === null ? 0.5 : null))} disabled={editing}>
              <SplitSquareHorizontal size={16} />{L('전후 비교', 'Before / after')}
            </button>
            <button type="button" className={s.btn} onClick={download} disabled={!ready || busy}><Download size={16} />{busy ? L('만드는 중…', 'Rendering…') : L('이미지 저장', 'Save image')}</button>
          </div>
          {loading && <p className={s.msg}>{L('타일 텍스처 불러오는 중…', 'Loading tile texture…')}</p>}
          {msg && <p className={s.msg} role="status">{msg}</p>}
        </div>

        <div className={s.panel}>
          <section className={s.card}>
            <h2 className={s.card_title}>{L('1. 면 선택', '1. Surface')}</h2>
            <div className={s.zone_grid}>
              {ZONE_IDS.map(id => (
                <button key={id} type="button" aria-pressed={active === id} className={`${s.zone_btn} ${active === id ? s.zone_on : ''} ${zones[id].on ? '' : s.zone_off}`} onClick={() => setActive(id)}>
                  {zoneName(id)}<small>{zones[id].on ? `${zones[id].tw}×${zones[id].th}` : L('원래대로', 'original')}</small>
                </button>
              ))}
            </div>
            <label className={s.toggle}>
              <input type="checkbox" checked={z.on} onChange={e => updActive({ on: e.target.checked })} />
              <span>{L(`${zoneName(active)}에 새 타일 깔기`, `Tile the ${zoneName(active).toLowerCase()}`)}<small>{L('끄면 원래 사진 그대로 둡니다.', 'Off keeps the original photo.')}</small></span>
            </label>
            {source === 'photo' && (
              <>
                <div className={s.tools}>
                  {chip(tool, 'corners', setTool, <><Move size={15} />{L('꼭짓점 맞추기', 'Corners')}</>)}
                  {chip(tool, 'brush', setTool, <><Brush size={15} />{L('가림 칠하기', 'Mask objects')}</>)}
                  {chip(tool, 'tile', setTool, <><Layers size={15} />{L('보기', 'View')}</>)}
                </div>
                {tool === 'corners' && <p className={s.hint}>{L('사진 위 1~4번 점을 끌어 이 면의 네 모서리에 맞추세요(1 왼쪽 위 → 2 오른쪽 위 → 3 오른쪽 아래 → 4 왼쪽 아래, 바닥은 1·2가 안쪽). 끄는 동안 확대경이 나타납니다. 면이 사진 밖으로 이어지면 점을 사진 바깥 여백에 둬도 됩니다.', 'Drag points 1–4 to the corners of this surface (top-left, top-right, bottom-right, bottom-left; for the floor 1–2 are the far side). A magnifier appears while dragging.')}</p>}
                {badQuad && <p className={s.warn}>{L('점 순서가 꼬여 면이 뒤집혔습니다. 1→2→3→4가 시계 방향이 되게 옮겨 주세요.', 'The corners cross; arrange 1→2→3→4 clockwise.')}</p>}
                {tool === 'brush' && (
                  <>
                    <p className={s.hint}>{L('변기·세면대·욕조·거울처럼 타일 앞에 있는 물건을 문지르면 그 부분은 원래 사진이 보입니다(보라색 표시).', 'Paint over objects in front of the tiles (toilet, basin, mirror) to keep them from the original photo.')}</p>
                    <div className={s.tools}>
                      {chip(erase, false, setErase, <><Brush size={15} />{L('칠하기', 'Paint')}</>, 'paint')}
                      {chip(erase, true, setErase, <><Eraser size={15} />{L('지우기', 'Erase')}</>, 'erase')}
                      <button type="button" className={s.chip} onClick={undoMask}><Undo2 size={15} />{L('되돌리기', 'Undo')}</button>
                      <button type="button" className={s.chip} onClick={clearMask}><Trash2 size={15} />{L('모두 지우기', 'Clear')}</button>
                    </div>
                    <label className={s.range}><span>{L('붓 크기', 'Brush size')}</span><input type="range" min={5} max={80} value={brush} onChange={e => setBrush(Number(e.target.value))} /></label>
                  </>
                )}
                <div className={s.grid2}>
                  {field('zw', active === 'floor' ? L('실제 가로 (폭)', 'Real width') : L('실제 가로', 'Real width'), z.W, v => updActive({ W: v }), 'm')}
                  {field('zh', active === 'floor' ? L('실제 세로 (깊이)', 'Real depth') : L('실제 높이', 'Real height'), z.H, v => updActive({ H: v }), 'm')}
                </div>
                <p className={s.hint}>{L('줄자로 잰 실제 치수를 넣어야 타일 크기가 맞습니다. 점을 사진 가장자리에 뒀다면 사진에 보이는 부분의 길이를 넣으세요.', 'Enter measured dimensions so tiles are to scale; if a corner sits at the photo edge, enter the length of the visible part.')}</p>
              </>
            )}
            {source === 'sample' && <p className={s.hint}>{L('샘플 욕실 치수: 정면 벽 폭 1.5m × 높이 2.4m, 사진에 보이는 바닥 깊이 약 2.05m (원래 바닥·벽 타일 줄눈으로 원근을 맞춘 값). 거울 속 벽도 새 타일로 비춥니다.', 'Sample room: back wall 1.5 m × 2.4 m, visible floor depth ≈ 2.05 m. The mirror reflects the new tiles too.')}</p>}
          </section>

          <section className={s.card}>
            <h2 className={s.card_title}>{L(`2. ${zoneName(active)} 타일`, `2. ${zoneName(active)} tile`)}<small>{tileLabel}</small></h2>
            <div className={s.swatches}>
              {TILE_PRESETS.map(p => (
                <button key={p.id} type="button" aria-pressed={z.tile.kind === 'preset' && z.tile.id === p.id} className={`${s.swatch} ${z.tile.kind === 'preset' && z.tile.id === p.id ? s.swatch_on : ''}`}
                  onClick={() => updActive({ on: true, tile: { kind: 'preset', id: p.id }, finish: p.finish, tw: String(p.size[0]), th: String(p.size[1]) })}>
                  <span className={s.swatch_color} style={p.tex ? { backgroundImage: `url(${p.tex.src})`, backgroundSize: '220%', filter: p.tex.gain ? `brightness(${p.tex.gain[0]})` : undefined } : { background: p.swatch }} />{isKo ? p.ko : p.en}
                </button>
              ))}
              <label className={`${s.swatch} ${z.tile.kind === 'upload' ? s.swatch_on : ''}`}>
                <span className={s.swatch_color}><Upload size={14} /></span>{L('타일 사진', 'Tile photo')}
                <input type="file" accept="image/*" className={s.hidden} onChange={e => { onTileUpload(e.target.files?.[0]); e.target.value = ''; }} />
              </label>
            </div>
            {z.tile.kind === 'upload' && <p className={s.hint}>{L('정면에서 찍은 타일 한 장 사진(줄눈 없이 타일만, 그늘 없이 밝게)을 올리면 가장 자연스럽습니다.', 'Use an evenly lit, straight-on photo of one tile without grout.')}</p>}

            <span className={s.label}>{L('타일 크기 (가로 × 세로 mm)', 'Tile size (W × H mm)')}</span>
            <div className={s.chips}>
              {SIZES.map(([a, b]) => chip(`${z.tw}x${z.th}`, `${a}x${b}`, () => updActive({ tw: String(a), th: String(b) }), `${a}×${b}`))}
            </div>
            <div className={s.grid3}>
              {field('tw', L('가로', 'Width'), z.tw, v => updActive({ tw: v }), 'mm', 'int')}
              {field('th', L('세로', 'Height'), z.th, v => updActive({ th: v }), 'mm', 'int')}
              <button type="button" className={s.rotate} onClick={() => updActive({ tw: z.th, th: z.tw })}><RotateCw size={15} />{L('가로·세로 바꾸기', 'Rotate')}</button>
            </div>

            <span className={s.label}>{L('배치', 'Layout')}</span>
            <div className={s.chips}>
              {chip(z.stagger, 0, v => updActive({ stagger: v }), L('일자', 'Stack'))}
              {chip(z.stagger, 1 / 2, v => updActive({ stagger: v }), L('1/2 엇갈림', '1/2 offset'))}
              {chip(z.stagger, 1 / 3, v => updActive({ stagger: v }), L('1/3 엇갈림', '1/3 offset'))}
            </div>
            <div className={s.chips}>
              {chip(z.origin, 'corner' as Origin, v => updActive({ origin: v }), L('모서리부터', 'From corner'))}
              {chip(z.origin, 'center' as Origin, v => updActive({ origin: v }), L('가운데 맞춤', 'Centered'))}
            </div>

            <span className={s.label}>{L(`줄눈 ${z.grout}mm`, `Grout ${z.grout} mm`)}</span>
            <div className={s.chips}>
              {['1', '1.5', '2', '3', '5'].map(g => chip(z.grout, g, v => updActive({ grout: v }), `${g}mm`))}
            </div>
            <div className={s.chips}>
              {GROUT_COLORS.map(c => (
                <button key={c.hex} type="button" aria-pressed={z.groutColor === c.hex} className={`${s.chip} ${z.groutColor === c.hex ? s.chip_on : ''}`} onClick={() => updActive({ groutColor: c.hex })}>
                  <span className={s.dot} style={{ background: c.hex }} />{isKo ? c.ko : c.en}
                </button>
              ))}
              <label className={s.chip}><input type="color" className={s.color} value={z.groutColor} onChange={e => updActive({ groutColor: e.target.value })} aria-label={L('줄눈 색 직접 고르기', 'Custom grout colour')} />{L('직접', 'Custom')}</label>
            </div>

            <span className={s.label}>{L('표면 마감', 'Finish')}</span>
            <div className={s.chips}>
              {chip(z.finish, 'matte' as Finish, v => updActive({ finish: v }), L('무광', 'Matte'))}
              {chip(z.finish, 'satin' as Finish, v => updActive({ finish: v }), L('반광', 'Satin'))}
              {chip(z.finish, 'polished' as Finish, v => updActive({ finish: v }), L('유광', 'Polished'))}
            </div>
            <p className={s.hint}>{L('유광일수록 원래 사진의 조명 반사가 남고, 바닥은 욕조·변기 같은 물건이 흐리게 비칩니다.', 'Glossier finishes keep light reflections; polished floors reflect objects above them.')}</p>
            <div className={s.grid2}>
              <label className={s.range}><span>{L(`조명·그림자 ${z.shade}%`, `Lighting ${z.shade}%`)}</span><input type="range" min={0} max={100} value={z.shade} onChange={e => updActive({ shade: Number(e.target.value) })} /></label>
              <label className={s.range}><span>{L(`밝기 ${z.bright}%`, `Brightness ${z.bright}%`)}</span><input type="range" min={70} max={130} value={z.bright} onChange={e => updActive({ bright: Number(e.target.value) })} /></label>
            </div>
            <button type="button" className={s.ghost} onClick={copyToWalls} disabled={active === 'floor'}>{L('이 타일을 다른 벽에도 적용', 'Apply to the other walls')}</button>
          </section>

          <section className={s.card}>
            <h2 className={s.card_title}>{L(`3. ${zoneName(active)} 타일 수량`, `3. ${zoneName(active)} quantity`)}</h2>
            {!qty ? <p className={s.hint}>{L('면 치수와 타일 크기를 확인하세요.', 'Check dimensions and tile size.')}</p> : (
              <>
                <div className={s.stats}>
                  <div className={s.stat}><b>{f(qty.area, 2)}㎡</b><span>{L(`${z.W}m × ${z.H}m`, `${z.W} m × ${z.H} m`)}</span></div>
                  <div className={s.stat}><b>{f(qty.total)}{L('장', ' pcs')}</b><span>{L(`잘라 쓰는 장 ${f(qty.cut)}`, `${f(qty.cut)} cut`)}</span></div>
                  <div className={s.stat}><b>{f(qty.order.withSpare)}{L('장', ' pcs')}</b><span>{L('여유 5% 포함', 'with 5% spare')}</span></div>
                  <div className={s.stat}><b>{f(qty.order.boxes)}{L('박스', ' boxes')}</b><span>{L(`박스당 ${qty.perBox}장 가정`, `${qty.perBox} per box`)}</span></div>
                </div>
                <p className={s.hint}>{L('문·창문·욕조 자리를 빼지 않은 면 전체 기준입니다. 개구부 차감과 박스 입수를 바꿔 계산하려면 ', 'Whole surface, openings not deducted. For openings and box sizes use the ')}
                  <Link href="/utilities/utility/interior-material-calc" className={s.inline_link}>{L('타일·도배 계산기', 'tile & wallpaper calculator')}</Link>{L('를 쓰세요.', '.')}</p>
              </>
            )}
          </section>
        </div>
      </div>

      <p className={s.disclaimer}>{L('합성 이미지는 색·질감을 비교하기 위한 참고용입니다. 실제 타일 색은 조명과 화면에 따라 다르니 견본을 직접 확인하세요. 올린 사진은 서버로 보내지 않고 브라우저 안에서만 처리합니다. 타일 텍스처: ambientCG(CC0).', 'Previews are for comparison only; check real samples. Photos never leave your browser. Tile textures: ambientCG (CC0).')}</p>

      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utilities/design/tile-visualizer" />
      <div className={s.ad_slot}>AD</div>

      <SeoSection
        ko={{
          title: '욕실 타일 시뮬레이터 — 실제 크기와 원근으로 미리 보기',
          description: '타일은 같은 색이라도 크기, 줄눈 색, 배치, 광택에 따라 욕실 분위기가 크게 달라집니다. 이 시뮬레이터는 바닥과 벽의 네 모서리와 실제 치수로 원근 변환(호모그래피)을 계산해, 화면 픽셀마다 그 자리가 실제로 몇 mm 지점인지 구한 뒤 타일과 줄눈을 그립니다. 그래서 멀리 있는 타일은 작게, 가까운 타일은 크게 보이고, 600×1200mm 타일은 바닥이든 벽이든 같은 크기로 나타납니다. 대리석·트래버틴·콘크리트·테라조·우드는 실제 돌과 나무를 찍은 이음매 없는 사진 텍스처를 써서 타일마다 다른 부분과 방향을 잘라 쓰므로 같은 무늬가 반복되지 않습니다. 원래 사진의 색 있는 밝기를 조명 지도로 곱해 간접등의 따뜻한 빛과 세면대 아래 그림자가 남고, 벽과 바닥이 만나는 모서리는 살짝 어두워지며, 타일 모서리 베벨 때문에 같은 색 줄눈이어도 이음매가 은은하게 보입니다. 유광 바닥에는 욕조와 변기가 흐리게 비치고, 샘플 욕실은 카메라 위치를 계산해 거울 속 벽까지 새 타일로 바꿉니다. 내 욕실 사진을 올려 네 모서리를 맞추면 우리 집에 깔았을 때의 모습을 볼 수 있고, 변기·세면대처럼 앞에 있는 물건은 붓으로 칠해 원래 사진으로 남깁니다. 줄눈은 1~5mm와 색, 배치는 일자·1/2·1/3 엇갈림, 마감은 무광·반광·유광을 고르고, 전후 비교 손잡이로 시공 전과 나란히 봅니다. 면 치수로 필요한 타일 장수, 잘라 쓰는 장, 5% 여유, 박스 수도 함께 보여 줍니다. 사진은 서버로 올라가지 않고 브라우저 안에서만 처리됩니다.',
          useCases: [
            { icon: '🛁', title: '욕실 리모델링 타일 고르기', desc: '내 욕실 사진에 600×600 다크 콘크리트 바닥과 600×1200 화이트 대리석 벽 같은 조합을 깔아 보고, 줄눈을 화이트와 그레이로 바꿔 가며 어울리는 조합을 시공 전에 정합니다.' },
            { icon: '🏢', title: '인테리어 상담 자료', desc: '고객 현장 사진에 후보 타일 두세 가지를 적용해 고해상도 이미지로 저장하고, 전후 비교 손잡이로 시공 전과 나란히 보여 주며 결정을 빠르게 돕습니다.' },
            { icon: '📐', title: '타일 크기·배치·광택 판단', desc: '좁은 욕실에 600×1200 대형 타일과 100×300 소형 타일 중 무엇이 넓어 보이는지, 유광 바닥이 반사로 얼마나 밝아 보이는지 실제 비율과 조명으로 확인합니다.' },
            { icon: '🧮', title: '주문 수량 확인', desc: '면의 가로·세로 치수와 타일 크기로 들어가는 장수, 잘라 쓰는 장, 5% 여유분과 박스 수를 확인해 견적서의 타일 수량이 맞는지 대조합니다.' },
          ],
          steps: [
            { step: '사진 고르기', desc: '샘플 욕실로 바로 시작하거나, 정면에서 1배 렌즈로 찍은 내 욕실 사진을 올립니다. 광각(0.5배) 사진은 직선이 휘어 원근이 어긋날 수 있습니다.' },
            { step: '면 맞추기', desc: '내 사진이면 바닥·정면 벽·옆 벽마다 1~4번 점을 네 모서리에 끌어 맞추고(확대경 표시), 줄자로 잰 실제 가로·높이(m)를 넣습니다. 앞에 있는 변기·세면대·거울은 가림 칠하기로 칠합니다.' },
            { step: '타일 고르기', desc: '면을 고른 뒤 실사 견본 타일이나 직접 찍은 타일 사진을 고르고, 타일 크기(mm), 줄눈 두께와 색, 배치, 시작 위치, 무광·반광·유광 마감을 정합니다.' },
            { step: '비교·저장', desc: '전후 비교 손잡이를 좌우로 끌어 시공 전과 비교하고, 필요한 타일 장수와 박스 수를 확인한 뒤 이미지 저장으로 원래 해상도 JPG를 내려받습니다.' },
          ],
          faqs: [
            { q: '내 욕실 사진으로도 할 수 있나요?', a: '네. 사진을 올리고 바닥과 벽마다 네 모서리 점을 맞춘 뒤 실제 치수를 넣으면 그 원근 그대로 타일이 깔립니다. 변기·세면대처럼 앞에 있는 물건과 거울은 붓으로 칠해 원래 사진으로 남기면 됩니다. 사진은 서버로 보내지 않고 브라우저 안에서만 처리됩니다.' },
            { q: '사진은 어떻게 찍어야 잘 맞나요?', a: '휴대폰 기본(1배) 렌즈로, 문 앞에서 정면 벽을 보고 수평을 맞춰 찍는 것이 좋습니다. 광각(0.5배) 렌즈는 가장자리 직선이 휘어 네 점으로 맞춘 면과 어긋나고, 바닥과 벽의 모서리가 사진 안에 많이 보일수록 정확합니다. 조명을 모두 켜고 찍으면 그림자와 반사가 더 자연스럽게 살아납니다.' },
            { q: '왜 실제 사진처럼 보이나요?', a: '대리석·콘크리트 같은 무늬는 실제 재료를 찍은 사진 텍스처를 타일마다 다른 부분으로 잘라 쓰고, 원래 사진의 빛 색과 그림자를 그대로 곱합니다. 여기에 모서리 그늘, 타일 베벨, 줄눈 질감, 유광 반사를 더하고 샘플 욕실은 거울 속 벽까지 다시 그립니다. 다만 실제 제품 색과는 차이가 있으니 견본을 확인하세요.' },
            { q: '줄눈 색은 어떤 것이 많이 쓰이나요?', a: '밝은 타일에 화이트 줄눈을 쓰면 이음매가 거의 보이지 않아 넓어 보이고, 그레이·차콜 줄눈은 오염이 덜 보이고 타일 모양이 또렷해집니다. 바닥은 물때가 생기기 쉬워 타일보다 한두 톤 어두운 줄눈을 고르는 경우가 많습니다. 시뮬레이터에서 바꿔 비교해 보세요.' },
            { q: '필요한 타일 장수는 어떻게 세나요?', a: '면의 가로·세로와 타일 크기, 줄눈, 배치와 시작 위치로 실제로 깔리는 장수를 셉니다. 가장자리에서 잘라 쓰는 장도 한 장으로 셉니다. 여기에 파손·재단 여유 5%를 더하고 1.44㎡ 박스 기준으로 박스 수를 냅니다. 문·창문 자리 차감은 타일·도배 계산기에서 할 수 있습니다.' },
          ],
        }}
        en={{
          title: 'Bathroom tile visualizer at true scale and perspective',
          description: 'The same tile colour feels very different depending on size, grout, layout and finish. This visualizer computes a perspective transform (homography) from the four corners and real dimensions of each floor or wall, finds the real position in millimetres for every pixel and draws tiles and grout there, so far tiles shrink correctly and a 600×1200 mm tile is the same size on every surface. Marble, travertine, concrete, terrazzo and wood looks use seamless photographic textures cut differently for each tile, so patterns never repeat. The original photo’s coloured lighting is multiplied back onto the tiles, corners get soft occlusion, bevels make joints visible even with matching grout, polished floors reflect the objects above them, and in the sample room the mirror reflects the new walls. Upload your own photo, align the corners, enter measured dimensions and paint over objects in front. Choose grout width and colour, stacked or offset layouts and matte, satin or polished finishes, drag the before/after handle, and see tile counts with cut pieces, 5% spare and boxes. Photos are processed only in your browser.',
          useCases: [
            { icon: '🛁', title: 'Pick Tiles Before Renovating', desc: 'Compare floor and wall combinations and grout colours on your own bathroom photo before work starts.' },
            { icon: '🏢', title: 'Client Presentations', desc: 'Apply candidate tiles to a site photo, save high-resolution images and show before and after side by side.' },
            { icon: '📐', title: 'Size, Layout and Finish', desc: 'See at true scale and lighting whether large or small tiles and polished or matte finishes suit a room.' },
            { icon: '🧮', title: 'Check Order Quantities', desc: 'Count pieces, cut pieces, 5% spare and boxes from surface size and tile size to cross-check a quote.' },
          ],
          steps: [
            { step: 'Choose a Photo', desc: 'Start with the sample bathroom or upload a straight-on photo taken with the 1× lens.' },
            { step: 'Align Surfaces', desc: 'Drag points 1–4 to each surface’s corners with the magnifier, enter measured width and height, and paint over objects in front.' },
            { step: 'Choose Tiles', desc: 'Pick a photo-real tile or your own tile photo, size, grout, layout, starting point and finish.' },
            { step: 'Compare and Save', desc: 'Drag the before/after handle, check quantities and save a full-resolution JPG.' },
          ],
          faqs: [
            { q: 'Can I use my own bathroom photo?', a: 'Yes. Upload it, align the four corners of each surface and enter real dimensions; tiles follow that perspective. Paint over the toilet, basin or mirror to keep them from the original photo. Photos never leave your browser.' },
            { q: 'How should I take the photo?', a: 'Use the standard 1× lens, stand at the door facing the back wall, keep the phone level and switch all lights on. Ultra-wide lenses bend straight lines near the edges, so the four-point surfaces will not match as well.' },
            { q: 'Why does it look like a real photo?', a: 'Patterns come from photographs of real materials cut differently per tile, and the original lighting colour and shadows are multiplied back in, with corner occlusion, bevels, grout texture and glossy reflections. Real product colours still differ, so check samples.' },
            { q: 'Which grout colour is common?', a: 'White grout on light tiles hides joints and makes rooms feel larger; grey or charcoal hides stains and outlines each tile. Floors often use grout one or two shades darker than the tile.' },
            { q: 'How are tiles counted?', a: 'Pieces actually laid on the surface are counted, cut edge pieces included, then 5% spare is added and boxes are based on 1.44 m² per box.' },
          ],
        }}
      />
    </div>
  );
}
