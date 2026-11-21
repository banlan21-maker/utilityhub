'use client';

// 싸인·도장 이미지 만들기 — 입력·미리보기·저장 위젯 (제목·설명·FAQ는 page.tsx 서버 렌더)
// 사진·그림은 이 브라우저 안에서만 처리하고 어디에도 저장하지 않는다.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocale } from 'next-intl';
import {
  AlertTriangle, Camera, Check, ClipboardCopy, Download, Eraser, FileText, ImageUp, Info, PenLine,
  Redo2, RotateCcw, RotateCw, Stamp, Type, Undo2,
} from 'lucide-react';
import { ui } from '@/app/components/ui';
import {
  FONT_CSS, INVOICE_STAMP_KEY, SIGN_FONTS_EN, SIGN_FONTS_KO, STAMP_FONTS, detect, drawStamp, drawStrokes, extractAsync, fileStamp,
  fontStr, hasHangul, loadImage, makeCanvas, renderSignatureText, resized, rotated, trimCanvas,
  type Detection, type ExtractOptions, type Ink, type Kind, type Recolor, type StampShape, type Stroke,
} from '@/lib/signStamp';
import s from './sign-stamp.module.css';

type Tab = 'photo' | 'draw' | 'name';
type Result = { canvas: HTMLCanvasElement; kind: Kind } | null;
type InkSel = 'auto' | Ink;
type Box = { x: number; y: number; w: number; h: number };

const T = {
  ko: {
    tabs: { photo: '사진에서 추출', draw: '직접 그리기', name: '이름으로 만들기' } as Record<Tab, string>,
    tabHint: { photo: '종이에 찍은 도장·싸인 사진의 배경을 지웁니다', draw: '손가락·마우스·펜으로 싸인을 그립니다', name: '이름을 넣으면 싸인·도장을 만들어 줍니다' } as Record<Tab, string>,
    pick: '사진 고르기', camera: '카메라로 찍기', drop: '사진을 끌어다 놓거나 붙여넣기(Ctrl+V)해도 됩니다',
    guideTitle: '이렇게 찍으면 깨끗하게 나와요',
    guide: ['깨끗한 흰 종이에 찍거나 써 주세요. 줄 있는 종이, 빨간 글씨가 있는 종이는 피해 주세요.', '밝은 곳에서 손과 휴대폰 그림자가 지지 않게 찍어 주세요.', '종이와 평행하게, 도장·싸인이 화면에 크게 나오도록 찍어 주세요.'],
    err: { heic: 'HEIC 사진은 이 브라우저에서 열 수 없습니다. 아이폰 설정 → 카메라 → 포맷에서 "높은 호환성"을 고르거나, 사진을 JPG로 바꿔 넣어 주세요.', decode: '이미지를 열 수 없습니다. JPG·PNG 사진을 넣어 주세요.', type: '이미지 파일만 넣을 수 있습니다.', size: '파일이 너무 큽니다 (40MB 이하).' } as Record<string, string>,
    other: '다른 사진', cropHint: '틀의 모서리를 끌어 도장·싸인 부분만 감싸 주세요. 처리 후 내용 끝에 맞춰 한 번 더 자릅니다.',
    kind: '종류', stamp: '도장', sign: '싸인',
    ink: '인주색', inkAuto: (d: string) => `자동 (${d})`, red: '빨강', blue: '파랑', both: '빨강+파랑',
    inkName: { red: '빨강', blue: '파랑', both: '빨강+파랑' } as Record<Ink, string>,
    detected: (k: string, i: string) => `사진을 보고 ${k}${i ? ` · ${i}` : ''}(으)로 맞췄습니다. 다르면 바꿔 주세요.`,
    nothing: '사진에서 도장·싸인을 찾지 못했습니다. 틀로 위치를 잡고 "남길 색 범위"를 올려 보세요.',
    blueNote: '파랑으로 추출하면 근처의 파란 볼펜 글씨도 같이 남을 수 있습니다. 틀로 도장만 감싸 주세요.',
    sens: '남길 색 범위', sensHint: '올리면 흐린 부분까지, 내리면 진한 부분만 남습니다',
    soft: '가장자리 부드럽게', noise: '작은 점 제거', boost: '흐린 부분 진하게 보정',
    recolor: '색', keep: '원래 색', toRed: '빨간 인주', toBlue: '파란 인주', toBlack: '검정',
    rotate: '회전', fine: '미세 조정',
    working: '처리 중…',
    // 그리기
    color: '선 색', black: '검정', width: '굵기', thin: '가늘게', mid: '보통', thick: '굵게',
    undo: '되돌리기', redo: '다시 하기', clear: '전체 지우기', drawHere: '여기에 싸인하세요',
    // 이름
    signMode: '싸인', stampMode: '도장',
    nameLabel: '이름', namePh: '홍길동', stampLabel: '이름 또는 상호 (최대 8자)', stampPh: '홍길동',
    font: '글꼴', shape: '모양', circle: '원형', square: '사각', ellipse: '타원',
    border: '테두리', texture: '인주 질감 (살짝 번진 느낌)',
    loadingFonts: '글꼴을 불러오는 중…',
    // 미리보기
    preview: '미리보기', bg: '배경', bgChecker: '투명', bgWhite: '흰 배경', bgDoc: '문서에 대 보기',
    size: '저장 크기', web: '웹용 (600px)', print: '인쇄용 (1200px)', orig: '원본',
    sizeNow: (w: number, h: number) => `${w} × ${h}px · 투명 배경 PNG`,
    empty: '왼쪽에서 만들면 여기에 나타납니다',
    download: 'PNG 저장', copy: '이미지 복사', copied: '복사했어요', invoice: '견적서에 넣기',
    invoiceHint: '견적서 메이커의 발행인 이름 옆에 찍힙니다',
    docName: '홍 길 동', docSeal: '(인)', docSignLabel: '서명',
    docTitle: '계 약 서',
    cautionTitle: '사용 주의',
    caution: ['본인의 싸인·도장만 사용하세요. 타인의 도장·서명을 무단으로 만들거나 사용하면 법적 책임이 따를 수 있습니다.', '이 이미지는 인감이나 공동인증서 전자서명을 대신하지 않습니다.', '사진과 결과물은 어디에도 업로드되거나 저장되지 않습니다 (브라우저 안에서만 처리).'],
  },
  en: {
    tabs: { photo: 'From a photo', draw: 'Draw', name: 'Type' } as Record<Tab, string>,
    tabHint: { photo: 'Remove the background from a photo of your signature or stamp', draw: 'Draw your signature with a finger, mouse or pen', name: 'Type your name and pick a signature style or stamp' } as Record<Tab, string>,
    pick: 'Choose a photo', camera: 'Take a photo', drop: 'You can also drop a photo here or paste it (Ctrl+V)',
    guideTitle: 'Tips for a clean result',
    guide: ['Sign or stamp on clean white paper — avoid lined paper or paper with red writing.', 'Shoot in good light without shadows from your hand or phone.', 'Hold the phone parallel to the paper and fill the frame with the signature.'],
    err: { heic: 'This browser cannot open HEIC photos. On iPhone choose Settings → Camera → Formats → Most Compatible, or convert the photo to JPG.', decode: 'Could not open the image. Use a JPG or PNG photo.', type: 'Only image files are supported.', size: 'The file is too large (max 40 MB).' } as Record<string, string>,
    other: 'Another photo', cropHint: 'Drag the corners of the frame around the signature or stamp. The result is trimmed to the ink afterwards.',
    kind: 'Type', stamp: 'Stamp', sign: 'Signature',
    ink: 'Ink color', inkAuto: (d: string) => `Auto (${d})`, red: 'Red', blue: 'Blue', both: 'Red + blue',
    inkName: { red: 'red', blue: 'blue', both: 'red + blue' } as Record<Ink, string>,
    detected: (k: string, i: string) => `Detected: ${k}${i ? `, ${i} ink` : ''}. Change it if that is wrong.`,
    nothing: 'No signature or stamp found. Frame it with the box and raise the color range.',
    blueNote: 'Blue extraction can also keep nearby blue pen writing. Frame only the stamp.',
    sens: 'Color range', sensHint: 'Higher keeps faint ink, lower keeps only strong ink',
    soft: 'Soften edges', noise: 'Remove specks', boost: 'Strengthen faint ink',
    recolor: 'Color', keep: 'Original', toRed: 'Red ink', toBlue: 'Blue ink', toBlack: 'Black',
    rotate: 'Rotate', fine: 'Fine angle',
    working: 'Processing…',
    color: 'Ink', black: 'Black', width: 'Width', thin: 'Thin', mid: 'Medium', thick: 'Bold',
    undo: 'Undo', redo: 'Redo', clear: 'Clear', drawHere: 'Sign here',
    signMode: 'Signature', stampMode: 'Stamp',
    nameLabel: 'Your name', namePh: 'Jane Doe', stampLabel: 'Name or company (up to 8 characters)', stampPh: 'J. DOE',
    font: 'Font', shape: 'Shape', circle: 'Round', square: 'Square', ellipse: 'Oval',
    border: 'Border', texture: 'Ink texture (slightly uneven)',
    loadingFonts: 'Loading fonts…',
    preview: 'Preview', bg: 'Background', bgChecker: 'Transparent', bgWhite: 'White', bgDoc: 'On a document',
    size: 'Export size', web: 'Web (600px)', print: 'Print (1200px)', orig: 'Original',
    sizeNow: (w: number, h: number) => `${w} × ${h}px · transparent PNG`,
    empty: 'Your signature or stamp will appear here',
    download: 'Download PNG', copy: 'Copy image', copied: 'Copied', invoice: 'Add to invoice',
    invoiceHint: 'Placed next to your name in the Invoice Maker',
    docName: 'Jane Doe', docSeal: '', docSignLabel: 'Signature',
    docTitle: 'AGREEMENT',
    cautionTitle: 'Please note',
    caution: ['Only use your own signature or stamp. Creating or using someone else\'s without permission can carry legal liability.', 'This image is not a certified e-signature or a registered seal.', 'Photos and results are never uploaded or stored — everything runs in your browser.'],
  },
};
type Strings = typeof T.ko;

/* ────────────────────── 작은 부품 ────────────────────── */

function Radio<V extends string | number>({ value, options, onChange, label }: { value: V; options: { v: V; label: ReactNode }[]; onChange: (v: V) => void; label: string }) {
  return (
    <div className={ui.segmented} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.v)} type="button" role="radio" aria-checked={value === o.v}
          className={`${ui.segment} ${value === o.v ? ui.segmentActive : ''}`} onClick={() => onChange(o.v)}>{o.label}</button>
      ))}
    </div>
  );
}

function Slider({ id, label, value, onChange, hint }: { id: string; label: string; value: number; onChange: (v: number) => void; hint?: string }) {
  return (
    <div className={s.slider}>
      <label htmlFor={id}><span>{label}</span><strong>{value}</strong></label>
      <input id={id} type="range" min={0} max={100} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {hint && <span className={ui.hint}>{hint}</span>}
    </div>
  );
}

/** 캔버스를 그대로 보여 주는 칸 (원본 크기보다 크게 키우지 않음) */
function CanvasView({ canvas, className }: { canvas: HTMLCanvasElement | null; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !canvas) return;
    el.width = canvas.width;
    el.height = canvas.height;
    const ctx = el.getContext('2d')!;
    ctx.clearRect(0, 0, el.width, el.height);
    ctx.drawImage(canvas, 0, 0);
  }, [canvas]);
  return canvas ? <canvas ref={ref} className={className} /> : null;
}

/* ────────────────────── ① 사진에서 추출 ────────────────────── */

function PhotoTab({ L, isKo, active, onResult }: { L: Strings; isKo: boolean; active: boolean; onResult: (r: Result) => void }) {
  const [src, setSrc] = useState<HTMLCanvasElement | null>(null);
  const [err, setErr] = useState('');
  const [quarter, setQuarter] = useState(0);
  const [fine, setFine] = useState(0);
  const [crop, setCrop] = useState<Box>({ x: 0, y: 0, w: 1, h: 1 });
  const [kind, setKind] = useState<Kind>('stamp');
  const [inkSel, setInkSel] = useState<InkSel>('auto');
  const [det, setDet] = useState<Detection | null>(null);
  const [sens, setSens] = useState(50);
  const [soft, setSoft] = useState(30);
  const [noise, setNoise] = useState(35);
  const [recolor, setRecolor] = useState<Recolor>('keep');
  const [boost, setBoost] = useState(true);
  const [busy, setBusy] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const reqId = useRef(0);

  const rot = useMemo(() => (src ? rotated(src, quarter, fine) : null), [src, quarter, fine]);

  const open = useCallback(async (file: Blob | undefined) => {
    if (!file) return;
    setErr('');
    try {
      const c = await loadImage(file);
      // 자동 감지: 작은 사본으로 종류·인주색·자를 영역 추천
      const small = resized(c, 480);
      const d = detect(small.getContext('2d')!.getImageData(0, 0, small.width, small.height));
      setSrc(c); setQuarter(0); setFine(0);
      setDet(d);
      setKind(d.kind);
      setInkSel('auto');
      setRecolor('keep');
      setCrop(d.box ?? { x: 0, y: 0, w: 1, h: 1 });
    } catch (e) {
      const code = e instanceof Error ? e.message : 'decode';
      setErr(L.err[code] ?? L.err.decode);
    }
  }, [L]);

  // 붙여넣기 (이 탭이 보일 때만)
  useEffect(() => {
    if (!active) return;
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((it) => it.type.startsWith('image/'));
      if (!item) return;
      const f = item.getAsFile();
      if (f) { e.preventDefault(); void open(f); }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [active, open]);

  const ink: Ink = inkSel === 'auto' ? (det?.ink ?? 'red') : inkSel;
  const opts: ExtractOptions = useMemo(() => kind === 'stamp'
    ? { red: ink !== 'blue', blue: ink !== 'red', dark: false, sens, soft, noise, recolor, boost }
    : { red: false, blue: true, dark: true, sens, soft, noise, recolor, boost }, [kind, ink, sens, soft, noise, recolor, boost]);

  // 처리 (입력이 바뀌면 잠깐 기다렸다가)
  useEffect(() => {
    if (!rot) return;
    const id = ++reqId.current;
    const t = window.setTimeout(async () => {
      setBusy(true);
      try {
        const sx = Math.round(crop.x * rot.width), sy = Math.round(crop.y * rot.height);
        const sw = Math.max(4, Math.round(crop.w * rot.width)), sh = Math.max(4, Math.round(crop.h * rot.height));
        const k = Math.min(1, 2400 / Math.max(sw, sh));
        const work = makeCanvas(sw * k, sh * k);
        const wctx = work.getContext('2d', { willReadFrequently: true })!;
        wctx.imageSmoothingQuality = 'high';
        wctx.drawImage(rot, sx, sy, sw, sh, 0, 0, work.width, work.height);
        const img = wctx.getImageData(0, 0, work.width, work.height);
        const r = await extractAsync(img, opts);
        if (id !== reqId.current) return;
        const out = makeCanvas(work.width, work.height);
        out.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(r.out), work.width, work.height), 0, 0);
        const trimmed = trimCanvas(out, 0.02);
        setEmpty(!trimmed);
        onResult(trimmed ? { canvas: trimmed, kind } : null);
      } catch (e) {
        console.error(e);
      } finally {
        if (id === reqId.current) setBusy(false);
      }
    }, 160);
    return () => window.clearTimeout(t);
  }, [rot, crop, opts, kind, onResult]);

  if (!src) {
    return (
      <div className={s.photoStart}>
        <div className={`${s.drop} ${dragOver ? s.dropOver : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); void open(e.dataTransfer.files?.[0]); }}>
          <ImageUp aria-hidden className={s.dropIcon} />
          <div className={s.dropBtns}>
            <button type="button" className={`${ui.button} ${ui.primary}`} onClick={() => fileRef.current?.click()}><ImageUp aria-hidden />{L.pick}</button>
            <button type="button" className={`${ui.button} ${ui.secondary} ${s.camBtn}`} onClick={() => camRef.current?.click()}><Camera aria-hidden />{L.camera}</button>
          </div>
          <span className={ui.hint}>{L.drop}</span>
        </div>
        {err && <p className={`${ui.notice} ${ui.red}`} role="alert"><AlertTriangle aria-hidden />{err}</p>}
        <div className={`${ui.notice} ${ui.gray} ${s.guide}`}>
          <Info aria-hidden />
          <div>
            <strong>{L.guideTitle}</strong>
            <ul>{L.guide.map((g) => <li key={g}>{g}</li>)}</ul>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*,.heic,.heif" hidden onChange={(e) => { void open(e.target.files?.[0]); e.target.value = ''; }} />
        <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { void open(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
    );
  }

  return (
    <div className={s.photoWork}>
      <CropEditor image={rot!} box={crop} onChange={setCrop} />
      <p className={`${ui.hint} ${s.tight}`}>{L.cropHint}</p>
      {det && (det.box
        ? <p className={`${ui.notice} ${ui.blue} ${s.small}`}><Info aria-hidden />{L.detected(det.kind === 'stamp' ? L.stamp : L.sign, det.kind === 'stamp' ? L.inkName[det.ink] : '')}</p>
        : <p className={`${ui.notice} ${ui.amber} ${s.small}`}><AlertTriangle aria-hidden />{L.nothing}</p>)}
      {empty && det?.box && <p className={`${ui.notice} ${ui.amber} ${s.small}`}><AlertTriangle aria-hidden />{L.nothing}</p>}

      <div className={s.row2}>
        <div className={ui.field}>
          <span className={ui.label}>{L.kind}</span>
          <Radio label={L.kind} value={kind} onChange={setKind} options={[{ v: 'stamp', label: L.stamp }, { v: 'sign', label: L.sign }]} />
        </div>
        {kind === 'stamp' && (
          <div className={ui.field}>
            <span className={ui.label}>{L.ink}</span>
            <div className={ui.chips}>
              {(['auto', 'red', 'blue', 'both'] as InkSel[]).map((v) => (
                <button key={v} type="button" aria-pressed={inkSel === v} className={`${ui.chip} ${ui.pill} ${inkSel === v ? ui.chipActive : ''}`} onClick={() => setInkSel(v)}>
                  {v === 'auto' ? L.inkAuto(L.inkName[det?.ink ?? 'red']) : v === 'red' ? L.red : v === 'blue' ? L.blue : L.both}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {kind === 'stamp' && ink !== 'red' && <p className={`${ui.hint} ${s.tight}`}>{L.blueNote}</p>}

      <Slider id="ss-sens" label={L.sens} value={sens} onChange={setSens} hint={L.sensHint} />
      <div className={s.row2}>
        <Slider id="ss-soft" label={L.soft} value={soft} onChange={setSoft} />
        <Slider id="ss-noise" label={L.noise} value={noise} onChange={setNoise} />
      </div>
      <label className={s.check}>
        <input type="checkbox" checked={boost} onChange={(e) => setBoost(e.target.checked)} />
        <span>{L.boost}</span>
      </label>

      <div className={ui.field}>
        <span className={ui.label}>{L.recolor}</span>
        <div className={ui.chips}>
          {(['keep', 'red', 'blue', 'black'] as Recolor[]).map((v) => (
            <button key={v} type="button" aria-pressed={recolor === v} className={`${ui.chip} ${ui.pill} ${recolor === v ? ui.chipActive : ''}`} onClick={() => setRecolor(v)}>
              {v !== 'keep' && <i className={`${s.swatch} ${s['sw_' + v]}`} aria-hidden />}
              {v === 'keep' ? L.keep : v === 'red' ? L.toRed : v === 'blue' ? L.toBlue : L.toBlack}
            </button>
          ))}
        </div>
      </div>

      <div className={s.rotRow}>
        <span className={ui.label}>{L.rotate}</span>
        <button type="button" className={s.iconBtn} aria-label={isKo ? '왼쪽으로 90도' : 'Rotate left 90°'} onClick={() => setQuarter((q) => q - 1)}><RotateCcw aria-hidden /></button>
        <button type="button" className={s.iconBtn} aria-label={isKo ? '오른쪽으로 90도' : 'Rotate right 90°'} onClick={() => setQuarter((q) => q + 1)}><RotateCw aria-hidden /></button>
        <label className={s.fine} htmlFor="ss-fine">
          <span>{L.fine}</span>
          <input id="ss-fine" type="range" min={-15} max={15} step={0.5} value={fine} onChange={(e) => setFine(Number(e.target.value))} />
          <strong>{fine > 0 ? '+' : ''}{fine}°</strong>
        </label>
      </div>

      <div className={s.photoFoot}>
        <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm}`} onClick={() => fileRef.current?.click()}><ImageUp aria-hidden />{L.other}</button>
        {busy && <span className={ui.hint} role="status">{L.working}</span>}
      </div>
      {err && <p className={`${ui.notice} ${ui.red}`} role="alert"><AlertTriangle aria-hidden />{err}</p>}
      <input ref={fileRef} type="file" accept="image/*,.heic,.heif" hidden onChange={(e) => { void open(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}

/** 사진 위에 자르기 틀 — 모서리 4개와 안쪽 끌기 */
function CropEditor({ image, box, onChange }: { image: HTMLCanvasElement; box: Box; onChange: (b: Box) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ mode: 'move' | 'nw' | 'ne' | 'sw' | 'se'; sx: number; sy: number; b: Box } | null>(null);
  const live = useRef(box);
  useEffect(() => { live.current = box; }, [box]);

  const start = (mode: 'move' | 'nw' | 'ne' | 'sw' | 'se') => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { mode, sx: e.clientX, sy: e.clientY, b: live.current };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current, el = wrapRef.current;
    if (!d || !el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - d.sx) / r.width, dy = (e.clientY - d.sy) / r.height;
    const min = 0.03;
    let { x, y, w, h } = d.b;
    if (d.mode === 'move') {
      x = Math.min(1 - w, Math.max(0, x + dx)); y = Math.min(1 - h, Math.max(0, y + dy));
    } else {
      let x0 = x, y0 = y, x1 = x + w, y1 = y + h;
      if (d.mode.includes('w')) x0 = Math.min(x1 - min, Math.max(0, x0 + dx));
      if (d.mode.includes('e')) x1 = Math.max(x0 + min, Math.min(1, x1 + dx));
      if (d.mode.includes('n')) y0 = Math.min(y1 - min, Math.max(0, y0 + dy));
      if (d.mode.includes('s')) y1 = Math.max(y0 + min, Math.min(1, y1 + dy));
      x = x0; y = y0; w = x1 - x0; h = y1 - y0;
    }
    onChange({ x, y, w, h });
  };
  const end = () => { drag.current = null; };
  const pct = (v: number) => `${v * 100}%`;
  return (
    <div className={s.cropWrap}>
      <div ref={wrapRef} className={s.cropStage} style={{ aspectRatio: `${image.width} / ${image.height}`, width: `min(100%, ${Math.round((440 * image.width) / image.height)}px)` }} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
        <CanvasView canvas={image} className={s.cropImg} />
        {/* 틀 바깥을 어둡게: 사진 영역 안에서만 (overflow: hidden) */}
        <div className={s.dimLayer} aria-hidden>
          <div className={s.dimHole} style={{ left: pct(box.x), top: pct(box.y), width: pct(box.w), height: pct(box.h) }} />
        </div>
        <div className={s.cropBox} style={{ left: pct(box.x), top: pct(box.y), width: pct(box.w), height: pct(box.h) }}
          onPointerDown={start('move')} role="presentation">
          {(['nw', 'ne', 'sw', 'se'] as const).map((m) => (
            <span key={m} className={`${s.handle} ${s['h_' + m]}`} onPointerDown={start(m)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────── ② 직접 그리기 ────────────────────── */

const DRAW_W = 1000, DRAW_H = 400;
const PEN_COLORS = { black: '#141418', blue: '#1c3fa8', red: '#c81e28' };
const PEN_SIZES = [4.5, 7, 10.5];

function DrawTab({ L, onResult }: { L: Strings; onResult: (r: Result) => void }) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redo, setRedo] = useState<Stroke[]>([]);
  const [color, setColor] = useState<keyof typeof PEN_COLORS>('black');
  const [size, setSize] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const current = useRef<Stroke | null>(null);
  const raf = useRef(0);
  const strokesRef = useRef(strokes);
  useEffect(() => { strokesRef.current = strokes; }, [strokes]);

  const paint = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = c.getBoundingClientRect();
    const W = Math.round(rect.width * dpr), H = Math.round(rect.height * dpr);
    if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, W, H);
    // 안내선 (저장 이미지에는 없음)
    ctx.save();
    ctx.strokeStyle = 'rgba(128,128,140,0.45)';
    ctx.setLineDash([8 * dpr, 6 * dpr]);
    ctx.lineWidth = 1.2 * dpr;
    ctx.beginPath(); ctx.moveTo(W * 0.06, H * 0.74); ctx.lineTo(W * 0.94, H * 0.74); ctx.stroke();
    ctx.restore();
    const all = current.current ? [...strokesRef.current, current.current] : strokesRef.current;
    drawStrokes(ctx, all, W / DRAW_W);
  }, []);

  useEffect(() => {
    paint();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => paint()) : null;
    if (ro && canvasRef.current) ro.observe(canvasRef.current);
    return () => ro?.disconnect();
  }, [paint]);
  useEffect(() => { paint(); }, [strokes, paint]);

  // 결과 이미지 (그림이 바뀔 때마다)
  useEffect(() => {
    if (!strokes.length) { onResult(null); return; }
    const k = 2;
    const c = makeCanvas(DRAW_W * k, DRAW_H * k);
    drawStrokes(c.getContext('2d')!, strokes, k);
    const t = trimCanvas(c, 0.04);
    onResult(t ? { canvas: t, kind: 'sign' } : null);
  }, [strokes, onResult]);

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * DRAW_W, y: ((e.clientY - r.top) / r.height) * DRAW_H, t: e.timeStamp, p: e.pressure };
  };
  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    canvasRef.current!.setPointerCapture(e.pointerId);
    current.current = { color: PEN_COLORS[color], size: PEN_SIZES[size], pen: e.pointerType === 'pen', pts: [pos(e)] };
    paint();
  };
  const moveP = (e: React.PointerEvent) => {
    const cur = current.current;
    if (!cur) return;
    const events = typeof e.nativeEvent.getCoalescedEvents === 'function' ? e.nativeEvent.getCoalescedEvents() : [];
    const r = canvasRef.current!.getBoundingClientRect();
    const list = events.length ? events.map((ev) => ({ x: ((ev.clientX - r.left) / r.width) * DRAW_W, y: ((ev.clientY - r.top) / r.height) * DRAW_H, t: ev.timeStamp, p: ev.pressure })) : [pos(e)];
    for (const p of list) {
      const last = cur.pts[cur.pts.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) < 1.2) continue;
      cur.pts.push(p);
    }
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(paint);
  };
  const up = () => {
    const cur = current.current;
    current.current = null;
    if (!cur) return;
    setStrokes((prev) => [...prev, cur]);
    setRedo([]);
  };

  return (
    <div className={s.drawWork}>
      <div className={s.padWrap}>
        <canvas ref={canvasRef} className={s.pad} onPointerDown={down} onPointerMove={moveP} onPointerUp={up} onPointerCancel={up}
          aria-label={L.drawHere} role="img" />
        {!strokes.length && <span className={s.padHint} aria-hidden>{L.drawHere}</span>}
      </div>
      <div className={s.drawBar}>
        <div className={s.drawTools}>
          <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm}`} disabled={!strokes.length}
            onClick={() => { setStrokes((p) => p.slice(0, -1)); setRedo((r) => [...r, strokes[strokes.length - 1]]); }}><Undo2 aria-hidden />{L.undo}</button>
          <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm}`} disabled={!redo.length}
            onClick={() => { setStrokes((p) => [...p, redo[redo.length - 1]]); setRedo((r) => r.slice(0, -1)); }}><Redo2 aria-hidden />{L.redo}</button>
          <button type="button" className={`${ui.button} ${ui.ghost} ${ui.sm}`} disabled={!strokes.length}
            onClick={() => { setStrokes([]); setRedo([]); }}><Eraser aria-hidden />{L.clear}</button>
        </div>
      </div>
      <div className={s.row2}>
        <div className={ui.field}>
          <span className={ui.label}>{L.color}</span>
          <div className={ui.chips}>
            {(Object.keys(PEN_COLORS) as (keyof typeof PEN_COLORS)[]).map((k) => (
              <button key={k} type="button" aria-pressed={color === k} className={`${ui.chip} ${ui.pill} ${color === k ? ui.chipActive : ''}`} onClick={() => setColor(k)}>
                <i className={`${s.swatch} ${s['sw_' + k]}`} aria-hidden />{k === 'black' ? L.black : k === 'blue' ? L.blue : L.red}
              </button>
            ))}
          </div>
        </div>
        <div className={ui.field}>
          <span className={ui.label}>{L.width}</span>
          <Radio label={L.width} value={size} onChange={setSize} options={[{ v: 0, label: L.thin }, { v: 1, label: L.mid }, { v: 2, label: L.thick }]} />
        </div>
      </div>
    </div>
  );
}

/* ────────────────────── ③ 이름으로 만들기 ────────────────────── */

function useFontCss(enabled: boolean) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;
    let link = document.querySelector<HTMLLinkElement>('link[data-ss-fonts]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FONT_CSS;
      link.setAttribute('data-ss-fonts', '1');
      document.head.appendChild(link);
    }
    const done = () => setReady(true);
    if (link.sheet) { void Promise.resolve().then(done); return; }
    link.addEventListener('load', done);
    link.addEventListener('error', done);
    const t = window.setTimeout(done, 4000);
    return () => { link?.removeEventListener('load', done); link?.removeEventListener('error', done); window.clearTimeout(t); };
  }, [enabled]);
  return ready;
}

function NameTab({ L, isKo, active, onResult }: { L: Strings; isKo: boolean; active: boolean; onResult: (r: Result) => void }) {
  const [mode, setMode] = useState<Kind>(isKo ? 'stamp' : 'sign');
  const [signText, setSignText] = useState('');
  const [signFont, setSignFont] = useState(0);
  const [signColor, setSignColor] = useState<'black' | 'blue'>('black');
  const [stampText, setStampText] = useState('');
  const [shape, setShape] = useState<StampShape>('circle');
  const [stampFont, setStampFont] = useState(0);
  const [border, setBorder] = useState<1 | 2 | 3>(2);
  const [stampColor, setStampColor] = useState<'red' | 'blue'>('red');
  const [texture, setTexture] = useState(true);
  const cssReady = useFontCss(active);
  const [fontTick, setFontTick] = useState(0);

  const signName = signText.trim() || L.namePh;
  const fonts = hasHangul(signName) ? SIGN_FONTS_KO : SIGN_FONTS_EN;
  const fi = Math.min(signFont, fonts.length - 1);
  const stampName = (stampText.trim() || L.stampPh).slice(0, 8);

  // 쓰는 글자만 글꼴 받기 (Google Fonts 가 글자 범위별로 나눠 둠)
  useEffect(() => {
    if (!cssReady || !document.fonts) return;
    let alive = true;
    const loads = [
      ...fonts.map((f) => document.fonts.load(fontStr(f, 40), signName)),
      ...STAMP_FONTS.map((f) => document.fonts.load(fontStr(f, 40), stampName)),
    ];
    void Promise.allSettled(loads).then(() => { if (alive) setFontTick((n) => n + 1); });
    return () => { alive = false; };
  }, [cssReady, fonts, signName, stampName]);

  useEffect(() => {
    if (!active) return;
    if (mode === 'sign') {
      if (!signText.trim()) { onResult(null); return; }
      const c = renderSignatureText(signText.trim(), fonts[fi], signColor === 'black' ? PEN_COLORS.black : PEN_COLORS.blue);
      onResult(c ? { canvas: c, kind: 'sign' } : null);
    } else {
      if (!stampText.trim()) { onResult(null); return; }
      const c = drawStamp({ text: stampText.trim().slice(0, 8), shape, font: STAMP_FONTS[stampFont], border, color: stampColor === 'red' ? '#d4232b' : '#1f43ad', texture });
      onResult({ canvas: trimCanvas(c, 0.02) ?? c, kind: 'stamp' });
    }
  }, [active, mode, signText, fonts, fi, signColor, stampText, shape, stampFont, border, stampColor, texture, fontTick, onResult]);

  return (
    <div className={s.nameWork}>
      <Radio label={L.tabs.name} value={mode} onChange={setMode} options={[{ v: 'stamp', label: <><Stamp aria-hidden className={s.segIcon} />{L.stampMode}</> }, { v: 'sign', label: <><PenLine aria-hidden className={s.segIcon} />{L.signMode}</> }]} />
      {!cssReady && <span className={ui.hint}>{L.loadingFonts}</span>}

      {mode === 'sign' ? (
        <>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="ss-sign-name">{L.nameLabel}</label>
            <input id="ss-sign-name" className={`${ui.input} ${ui.inputLg}`} maxLength={24} placeholder={L.namePh} value={signText} onChange={(e) => setSignText(e.target.value)} autoComplete="name" />
          </div>
          <div className={ui.field}>
            <span className={ui.label}>{L.font}</span>
            <div className={s.fontGrid} role="radiogroup" aria-label={L.font}>
              {fonts.map((f, i) => (
                <button key={f.family} type="button" role="radio" aria-checked={i === fi} className={`${s.fontCard} ${i === fi ? s.fontCardOn : ''} ${!signText.trim() ? s.fontCardSample : ''}`}
                  onClick={() => setSignFont(i)}>
                  <span className={s.fontSample} style={{ fontFamily: `"${f.family}"`, fontWeight: f.weight, color: signColor === 'blue' ? PEN_COLORS.blue : undefined }}>{signName}</span>
                  <small>{f.label}</small>
                </button>
              ))}
            </div>
          </div>
          <div className={ui.field}>
            <span className={ui.label}>{L.color}</span>
            <Radio label={L.color} value={signColor} onChange={setSignColor} options={[{ v: 'black', label: L.black }, { v: 'blue', label: L.blue }]} />
          </div>
        </>
      ) : (
        <>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="ss-stamp-name">{L.stampLabel}</label>
            <input id="ss-stamp-name" className={`${ui.input} ${ui.inputLg}`} maxLength={8} placeholder={L.stampPh} value={stampText} onChange={(e) => setStampText(e.target.value)} />
          </div>
          <div className={s.row2}>
            <div className={ui.field}>
              <span className={ui.label}>{L.shape}</span>
              <Radio label={L.shape} value={shape} onChange={setShape} options={[{ v: 'circle', label: L.circle }, { v: 'square', label: L.square }, { v: 'ellipse', label: L.ellipse }]} />
            </div>
            <div className={ui.field}>
              <span className={ui.label}>{L.border}</span>
              <Radio label={L.border} value={border} onChange={setBorder} options={[{ v: 1 as const, label: L.thin }, { v: 2 as const, label: L.mid }, { v: 3 as const, label: L.thick }]} />
            </div>
          </div>
          <div className={ui.field}>
            <span className={ui.label}>{L.font}</span>
            <div className={s.stampFonts} role="radiogroup" aria-label={L.font}>
              {STAMP_FONTS.map((f, i) => (
                <button key={f.family} type="button" role="radio" aria-checked={i === stampFont} className={`${s.fontCard} ${i === stampFont ? s.fontCardOn : ''}`} onClick={() => setStampFont(i)}>
                  <span className={s.stampSample} style={{ fontFamily: `"${f.family}"`, fontWeight: f.weight }}>{stampName}</span>
                  <small>{f.label}</small>
                </button>
              ))}
            </div>
          </div>
          <div className={s.row2}>
            <div className={ui.field}>
              <span className={ui.label}>{L.color}</span>
              <Radio label={L.color} value={stampColor} onChange={setStampColor} options={[{ v: 'red', label: L.red }, { v: 'blue', label: L.blue }]} />
            </div>
            <label className={s.check}>
              <input type="checkbox" checked={texture} onChange={(e) => setTexture(e.target.checked)} />
              <span>{L.texture}</span>
            </label>
          </div>
        </>
      )}
    </div>
  );
}

/* ────────────────────── 미리보기·저장 ────────────────────── */

type Bg = 'checker' | 'white' | 'doc';
type SizeKey = 'web' | 'print' | 'orig';
const SIZE_PX: Record<SizeKey, number | null> = { web: 600, print: 1200, orig: null };

function drawDocPreview(out: HTMLCanvasElement, res: HTMLCanvasElement, kind: Kind, L: Strings) {
  const W = 760, H = 420;
  out.width = W; out.height = H;
  const ctx = out.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#1a1a1a';
  ctx.font = '700 30px "Noto Serif KR", "Nanum Myeongjo", serif';
  ctx.textAlign = 'center';
  ctx.fillText(L.docTitle, W / 2, 62);
  ctx.fillStyle = '#d4d4d8';
  [110, 140, 170, 200, 230].forEach((y, i) => ctx.fillRect(60, y, i === 4 ? 380 : 640, 9));
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1a1a1a';
  ctx.font = '600 22px "Noto Sans KR", sans-serif';
  const baseY = 345;
  if (kind === 'stamp') {
    const label = L.docName;
    ctx.fillText(label, 420, baseY);
    const lw = ctx.measureText(label).width;
    if (L.docSeal) ctx.fillText(L.docSeal, 420 + lw + 16, baseY);
    const sealX = 420 + lw + 16 + (L.docSeal ? 18 : 0);
    const size = 104;
    const k = size / Math.max(res.width, res.height);
    ctx.drawImage(res, sealX - (res.width * k) / 2, baseY - 8 - (res.height * k) / 2, res.width * k, res.height * k);
  } else {
    ctx.fillText(`${L.docSignLabel}:`, 330, baseY);
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(440, baseY + 6, 260, 2);
    const boxW = 240, boxH = 90;
    const k = Math.min(boxW / res.width, boxH / res.height);
    ctx.drawImage(res, 450, baseY + 2 - res.height * k, res.width * k, res.height * k);
  }
}

function Preview({ L, isKo, result }: { L: Strings; isKo: boolean; result: Result }) {
  const [bg, setBg] = useState<Bg>('checker');
  const [size, setSize] = useState<SizeKey>('print');
  const [copied, setCopied] = useState(false);
  const [canCopy, setCanCopy] = useState(false);
  const docRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    void Promise.resolve().then(() => setCanCopy(typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write));
  }, []);

  const out = useMemo(() => (result ? resized(result.canvas, SIZE_PX[size]) : null), [result, size]);
  useEffect(() => {
    if (bg !== 'doc' || !result || !docRef.current) return;
    drawDocPreview(docRef.current, result.canvas, result.kind, L);
  }, [bg, result, L]);

  const blob = () => new Promise<Blob>((resolve, reject) => out!.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), 'image/png'));
  const download = async () => {
    if (!out || !result) return;
    const b = await blob();
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url; a.download = fileStamp(result.kind);
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  };
  const copy = async () => {
    if (!out) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob() })]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { /* 권한 없음 */ }
  };
  const toInvoice = () => {
    if (!result) return;
    const img = resized(result.canvas, 600);
    try { localStorage.setItem(INVOICE_STAMP_KEY, img.toDataURL('image/png')); } catch { /* 저장소 막힘 */ }
    window.location.href = `/${isKo ? 'ko' : 'en'}/utilities/finance/invoice-maker`;
  };

  return (
    <section className={`${ui.card} ${s.preview}`} aria-label={L.preview}>
      <div className={s.prevHead}>
        <h2 className={s.prevTitle}>{L.preview}</h2>
        <div className={ui.chips} role="radiogroup" aria-label={L.bg}>
          {(['checker', 'white', 'doc'] as Bg[]).map((b) => (
            <button key={b} type="button" role="radio" aria-checked={bg === b} className={`${ui.chip} ${ui.pill} ${bg === b ? ui.chipActive : ''}`} onClick={() => setBg(b)}>
              {b === 'checker' ? L.bgChecker : b === 'white' ? L.bgWhite : L.bgDoc}
            </button>
          ))}
        </div>
      </div>
      <div className={`${s.stage} ${bg === 'checker' ? s.checker : s.white}`} aria-live="polite">
        {!result ? <p className={s.stageEmpty}>{L.empty}</p>
          : bg === 'doc' ? <canvas ref={docRef} className={s.docCanvas} />
            : <CanvasView canvas={out} className={s.result} />}
      </div>
      {out && <p className={`${ui.hint} ${s.sizeNow}`}>{L.sizeNow(out.width, out.height)}</p>}
      <div className={ui.field}>
        <span className={ui.label}>{L.size}</span>
        <Radio label={L.size} value={size} onChange={setSize} options={[{ v: 'web', label: L.web }, { v: 'print', label: L.print }, { v: 'orig', label: L.orig }]} />
      </div>
      <div className={s.actions}>
        <button type="button" className={`${ui.button} ${ui.primary}`} disabled={!result} onClick={download}><Download aria-hidden />{L.download}</button>
        {canCopy && (
          <button type="button" className={`${ui.button} ${copied ? ui.primary : ui.secondary}`} disabled={!result} onClick={copy}>
            {copied ? <Check aria-hidden /> : <ClipboardCopy aria-hidden />}{copied ? L.copied : L.copy}
          </button>
        )}
        <button type="button" className={`${ui.button} ${ui.secondary}`} disabled={!result} onClick={toInvoice} title={L.invoiceHint}><FileText aria-hidden />{L.invoice}</button>
      </div>
      <div className={`${ui.notice} ${ui.gray} ${s.caution}`}>
        <AlertTriangle aria-hidden />
        <div>
          <strong>{L.cautionTitle}</strong>
          <ul>{L.caution.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────── 본체 ────────────────────── */

export default function SignStampClient() {
  const isKo = useLocale() === 'ko';
  const L = isKo ? T.ko : T.en;
  // 한국어는 도장(사진 추출), 영어는 싸인(직접 그리기)을 먼저
  const [tab, setTab] = useState<Tab>(isKo ? 'photo' : 'draw');
  const [results, setResults] = useState<Record<Tab, Result>>({ photo: null, draw: null, name: null });
  const setters = useMemo(() => ({
    photo: (r: Result) => setResults((p) => (p.photo === r ? p : { ...p, photo: r })),
    draw: (r: Result) => setResults((p) => (p.draw === r ? p : { ...p, draw: r })),
    name: (r: Result) => setResults((p) => (p.name === r ? p : { ...p, name: r })),
  }), []);
  const order: Tab[] = isKo ? ['photo', 'draw', 'name'] : ['draw', 'name', 'photo'];
  const icons: Record<Tab, ReactNode> = { photo: <ImageUp aria-hidden />, draw: <PenLine aria-hidden />, name: <Type aria-hidden /> };

  return (
    <div className={s.tool}>
      <div className={s.tabs} role="tablist" aria-label={isKo ? '만드는 방법' : 'How to make it'}>
        {order.map((t, i) => (
          <button key={t} id={`ss-tab-${t}`} type="button" role="tab" aria-selected={tab === t} aria-controls={`ss-panel-${t}`}
            className={`${s.tab} ${tab === t ? s.tabOn : ''}`} onClick={() => setTab(t)}>
            {icons[t]}<span>{`${['①', '②', '③'][i]} ${L.tabs[t]}`}</span>
          </button>
        ))}
      </div>
      <div className={s.cols}>
        <section className={`${ui.card} ${s.work}`}>
          <p className={`${ui.hint} ${s.tabHint}`}>{L.tabHint[tab]}</p>
          {order.map((t) => (
            <div key={t} id={`ss-panel-${t}`} role="tabpanel" aria-labelledby={`ss-tab-${t}`} hidden={tab !== t}>
              {t === 'photo' && <PhotoTab L={L} isKo={isKo} active={tab === 'photo'} onResult={setters.photo} />}
              {t === 'draw' && <DrawTab L={L} onResult={setters.draw} />}
              {t === 'name' && <NameTab L={L} isKo={isKo} active={tab === 'name'} onResult={setters.name} />}
            </div>
          ))}
        </section>
        <Preview L={L} isKo={isKo} result={results[tab]} />
      </div>
    </div>
  );
}
