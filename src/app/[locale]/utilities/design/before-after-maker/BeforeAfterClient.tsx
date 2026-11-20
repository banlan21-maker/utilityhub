'use client';

// 시술 전후 비교 사진 메이커 — 사진 넣기·편집·저장만 (제목·설명·FAQ는 page.tsx 서버 렌더)
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocale } from 'next-intl';
import {
  ImagePlus, RotateCw, FlipHorizontal2, Trash2, ArrowLeftRight, Download, Share2, Check, Layers, Maximize2, ShieldCheck, Upload, X, Plus,
} from 'lucide-react';
import { ui } from '@/app/components/ui';
import {
  DEFAULT_STYLE, FONTS, FONT_CSS, HANDLE_R, RATIOS, TEXT_MAX, ZERO_ADJUST, ZOOM_MAX,
  cells, clampPhoto, fileName, flipPhoto, fontCss, instaText, isZeroAdjust, labelTexts, loadLogo, loadPhoto, maskRect,
  place, pointInCell, ratioOf, render, renderAlign, rotatePhoto, sanitizeStyle, toPhoto,
  type Adjust, type Cell, type Corner, type DividerColor, type FontKey, type LabelPos, type LabelSet, type LabelStyle,
  type Layout, type LoadError, type Mask, type MaskKind, type MaskShape, type Photo, type Radius, type RatioKey, type Size3, type Style, type Tone,
} from '@/lib/beforeAfter';
import s from './before-after-maker.module.css';

type Tab = 'layout' | 'label' | 'brand' | 'mask' | 'adjust';
type Pair<T> = [T, T];
type Format = 'jpg' | 'png';
interface Preset { name: string; style: Style }

const T = {
  ko: {
    slot: ['전 사진', '후 사진'] as Pair<string>,
    empty: ['전 사진 넣기', '후 사진 넣기'] as Pair<string>,
    pickTwo: '사진 2장 한 번에 고르기',
    pickTwoHint: '먼저 고른 사진이 "전", 나중 사진이 "후"가 됩니다. PC는 미리보기에 끌어다 놓아도 돼요.',
    choose: '사진 고르기', replace: '바꾸기',
    rotate: '90° 회전', flip: '좌우 반전', reset: '위치 초기화', remove: '사진 빼기', swap: '전·후 바꾸기',
    zoom: '확대',
    loading: '사진 여는 중…',
    errors: {
      heic: '이 브라우저에서는 HEIC 사진을 열 수 없어요. JPG로 변환한 뒤 다시 넣어 주세요. (아이폰: 설정 › 카메라 › 포맷 › "높은 호환성"으로 바꾸면 처음부터 JPG로 찍혀요)',
      decode: '사진을 열지 못했어요. 다른 사진으로 다시 시도해 주세요.',
      type: '사진 파일만 넣을 수 있어요.',
      size: '60MB가 넘는 파일은 넣을 수 없어요.',
    } as Record<LoadError, string>,
    preview: '전후 비교 사진 미리보기',
    align: '구도 맞추기', alignDone: '맞추기 완료',
    alignHint: '두 사진을 겹쳐 보여 줘요. 얼굴·손·물건의 위치와 크기가 겹치도록 끌고 확대하세요.',
    alignMove: '움직일 사진', alignOpacity: '겹침 정도',
    alignNeed: '전·후 사진을 모두 넣으면 쓸 수 있어요',
    gesture: '끌어서 옮기고, 두 손가락으로 확대하세요.',
    gesturePc: '(PC는 Ctrl+휠, 키보드는 방향키·+/-)',
    gestureMask: '사진 위를 끌어 가릴 영역을 그리세요. 톡 누르면 그 자리에 생겨요.',
    tabs: { layout: '레이아웃·비율', label: '라벨·문구', brand: '로고·매장', mask: '가리기', adjust: '보정' } as Record<Tab, string>,
    ratio: '비율',
    ratios: { '4:5': ['4:5', '피드 세로'], '1:1': ['1:1', '피드 정사각'], '3:4': ['3:4', '세로'], '9:16': ['9:16', '스토리·릴스'] } as Record<RatioKey, [string, string]>,
    layout: '배치',
    layouts: { side: '좌우', stack: '위아래', diagonal: '대각선' } as Record<Layout, string>,
    divider: '구분선',
    dividers: { none: '없음', white: '흰색', black: '검정', brand: '매장 색상' } as Record<DividerColor, string>,
    thickness: '굵기',
    sizes: { s: '얇게', m: '보통', l: '굵게' } as Record<Size3, string>,
    radius: '모서리 둥글기',
    radii: ['없음', '작게', '보통', '크게'],
    radiusDiag: '대각선 배치에는 둥근 모서리가 적용되지 않아요.',
    radiusGap: '둥근 모서리를 고르면 사진 사이와 바깥에 여백이 생기고, 여백은 구분선 색으로 칠해져요.',
    labelText: '라벨 문구',
    labelSets: { BEFORE_AFTER: 'BEFORE / AFTER', Before_After: 'Before / After', ko: '전 / 후', ko_sisul: '시술 전 / 후', custom: '직접 입력', none: '없음' } as Record<LabelSet, string>,
    customBefore: '전 라벨', customAfter: '후 라벨',
    labelPos: '위치',
    labelPoses: { top: '위', bottom: '아래', corner: '모서리' } as Record<LabelPos, string>,
    labelStyle: '스타일',
    labelStyles: { simple: '심플', badge: '배지', bar: '띠', outline: '테두리' } as Record<LabelStyle, string>,
    labelTone: '색',
    tones: { dark: '어둡게', light: '밝게', brand: '매장 색상' } as Record<Tone, string>,
    labelSize: '크기',
    sizes3: { s: '작게', m: '보통', l: '크게' } as Record<Size3, string>,
    font: '글꼴',
    fontNote: '모두 무료 상업용 글꼴(Google Fonts, OFL)이에요.',
    caption: '추가 문구 (한 줄)',
    captionPh: '예: 애쉬브라운 뿌리염색',
    logo: '로고 이미지',
    logoUpload: '로고 올리기', logoChange: '로고 바꾸기', logoRemove: '로고 빼기',
    logoHint: '배경이 투명한 PNG가 가장 깔끔해요. 저장할 때 긴 변 320px로 줄여 둡니다.',
    shopName: '매장 이름', insta: '인스타그램 아이디', phone: '전화번호',
    shopPh: '예: 헤어살롱 봄', instaPh: '@아이디', phonePh: '예: 02-123-4567',
    corner: '위치',
    corners: { tl: '↖ 왼쪽 위', tr: '↗ 오른쪽 위', bl: '↙ 왼쪽 아래', br: '↘ 오른쪽 아래' } as Record<Corner, string>,
    brandSize: '크기', opacity: '투명도', brandTone: '글자색',
    brandTones: { light: '흰색', dark: '검정' } as Record<'light' | 'dark', string>,
    brandColor: '매장 색상',
    brandColorHint: '구분선·라벨에서 "매장 색상"을 고르면 이 색이 쓰여요.',
    watermark: '반복 워터마크 (사진 도용 방지)',
    watermarkHint: '매장 이름(없으면 인스타 아이디)을 사진 전체에 옅게 비스듬히 깔아요.',
    watermarkNeed: '매장 이름, 인스타 아이디, 로고 중 하나를 넣으면 워터마크가 생겨요.',
    maskKind: '가리는 방식',
    maskKinds: { mosaic: '모자이크', blur: '흐림', heart: '♥ 하트', star: '★ 별' } as Record<MaskKind, string>,
    maskShape: '모양',
    maskShapes: { ellipse: '원형', rect: '사각형' } as Record<MaskShape, string>,
    maskHowto: '미리보기에서 사진 위를 손가락으로 끌면 그 영역이 가려져요. 그린 영역은 끌어서 옮기고, 오른쪽 아래 동그란 점을 끌어 크기를 바꿔요. 전·후 사진에 따로 그려야 해요.',
    maskAdd: (n: string) => `${n}에 추가`,
    maskDelete: '선택한 영역 지우기', maskClear: '모두 지우기',
    maskList: (n: string, k: string, i: number) => `${n} · ${k} ${i}`,
    maskNone: '아직 가린 영역이 없어요.',
    maskSafe: '저장한 이미지에서는 모자이크·흐림 부분의 원래 픽셀이 지워져 되살릴 수 없어요.',
    adjSame: '전후 똑같이 적용',
    adjSameHint: '한쪽만 밝게 하면 결과가 실제보다 좋아 보이는 사진이 돼요. 촬영 조건 차이를 맞출 때만 따로 조절하세요.',
    adjWarn: '전·후를 따로 보정하고 있어요. 결과가 과장되어 보일 수 있으니 촬영 조건 차이를 맞추는 데만 쓰세요.',
    adjTarget: '보정할 사진',
    brightness: '밝기', contrast: '대비', saturation: '채도',
    adjReset: '보정 초기화',
    presets: '내 스타일',
    presetsHint: '로고·매장 이름·라벨·레이아웃·비율·구분선을 최대 3개까지 저장해요. 다음에 사진만 넣으면 같은 모양으로 완성돼요.',
    presetName: '스타일 이름',
    presetNamePh: (n: number) => ['인스타 피드용', '스토리용', '블로그용'][n] ?? `스타일 ${n + 1}`,
    presetEmpty: '빈 칸',
    presetSave: '지금 스타일 저장', presetOverwrite: '덮어쓰기', presetDelete: '삭제', presetApply: '적용',
    presetNow: '적용 중',
    autoSaved: '마지막으로 쓴 스타일은 자동으로 기억해 다음 방문 때 그대로 열려요.',
    storeFail: '이 브라우저에서는 스타일을 저장할 수 없어요(시크릿 모드 등). 만들기와 저장은 그대로 됩니다.',
    storeFull: '저장 공간이 부족해 스타일을 저장하지 못했어요. 로고를 더 작은 파일로 바꾸거나 저장한 스타일을 지워 주세요.',
    format: '파일 형식',
    formats: { jpg: 'JPG (용량 작음)', png: 'PNG (화질 그대로)' } as Record<Format, string>,
    save: '이미지 저장', share: '바로 공유', saved: '저장했어요',
    need: '전·후 사진을 모두 넣으면 저장할 수 있어요',
    shareRetry: '공유 준비가 끝났어요. 공유 버튼을 한 번 더 눌러 주세요.',
    shareFail: '공유하지 못했어요. 이미지 저장 후 앱에서 올려 주세요.',
    consent: '고객 사진을 게시하기 전에 반드시 고객의 동의를 받으세요.',
    local: '사진은 이 기기 안에서만 처리되며 어떤 서버에도 전송되지 않습니다. 저장 이미지에는 촬영 위치(GPS) 같은 정보가 남지 않아요.',
    outSize: (w: number, h: number) => `${w}×${h}px`,
  },
  en: {
    slot: ['Before photo', 'After photo'] as Pair<string>,
    empty: ['Add BEFORE photo', 'Add AFTER photo'] as Pair<string>,
    pickTwo: 'Pick both photos at once',
    pickTwoHint: 'The first photo you pick becomes BEFORE, the second AFTER. On a computer you can drop files onto the preview.',
    choose: 'Choose photo', replace: 'Replace',
    rotate: 'Rotate 90°', flip: 'Flip', reset: 'Reset position', remove: 'Remove photo', swap: 'Swap before/after',
    zoom: 'Zoom',
    loading: 'Opening photo…',
    errors: {
      heic: 'This browser can’t open HEIC photos. Convert it to JPG and try again. (iPhone: Settings › Camera › Formats › “Most Compatible” saves new photos as JPG.)',
      decode: 'Couldn’t open this photo. Try a different one.',
      type: 'Only image files can be added.',
      size: 'Files over 60 MB can’t be added.',
    } as Record<LoadError, string>,
    preview: 'Before and after preview',
    align: 'Line up photos', alignDone: 'Done',
    alignHint: 'Both photos are overlaid. Drag and zoom until the face, hands or object line up.',
    alignMove: 'Photo to move', alignOpacity: 'Overlay strength',
    alignNeed: 'Add both photos to use this',
    gesture: 'Drag to move, pinch to zoom.',
    gesturePc: '(Ctrl + scroll on a computer; arrow keys and +/− on a keyboard)',
    gestureMask: 'Drag over a photo to draw an area to hide. A tap adds one right there.',
    tabs: { layout: 'Layout & ratio', label: 'Labels & text', brand: 'Logo & shop', mask: 'Hide faces', adjust: 'Adjust' } as Record<Tab, string>,
    ratio: 'Ratio',
    ratios: { '4:5': ['4:5', 'Feed portrait'], '1:1': ['1:1', 'Feed square'], '3:4': ['3:4', 'Portrait'], '9:16': ['9:16', 'Story · Reels'] } as Record<RatioKey, [string, string]>,
    layout: 'Layout',
    layouts: { side: 'Side by side', stack: 'Top & bottom', diagonal: 'Diagonal' } as Record<Layout, string>,
    divider: 'Divider',
    dividers: { none: 'None', white: 'White', black: 'Black', brand: 'Brand color' } as Record<DividerColor, string>,
    thickness: 'Thickness',
    sizes: { s: 'Thin', m: 'Medium', l: 'Thick' } as Record<Size3, string>,
    radius: 'Rounded corners',
    radii: ['None', 'Small', 'Medium', 'Large'],
    radiusDiag: 'Rounded corners don’t apply to the diagonal layout.',
    radiusGap: 'Rounded corners add a margin around and between the photos, filled with the divider color.',
    labelText: 'Label text',
    labelSets: { BEFORE_AFTER: 'BEFORE / AFTER', Before_After: 'Before / After', ko: '전 / 후', ko_sisul: '시술 전 / 후', custom: 'Custom', none: 'None' } as Record<LabelSet, string>,
    customBefore: 'Before label', customAfter: 'After label',
    labelPos: 'Position',
    labelPoses: { top: 'Top', bottom: 'Bottom', corner: 'Corner' } as Record<LabelPos, string>,
    labelStyle: 'Style',
    labelStyles: { simple: 'Simple', badge: 'Badge', bar: 'Bar', outline: 'Outline' } as Record<LabelStyle, string>,
    labelTone: 'Color',
    tones: { dark: 'Dark', light: 'Light', brand: 'Brand color' } as Record<Tone, string>,
    labelSize: 'Size',
    sizes3: { s: 'Small', m: 'Medium', l: 'Large' } as Record<Size3, string>,
    font: 'Font',
    fontNote: 'All free for commercial use (Google Fonts, OFL).',
    caption: 'Caption (one line)',
    captionPh: 'e.g. Balayage + gloss',
    logo: 'Logo image',
    logoUpload: 'Upload logo', logoChange: 'Change logo', logoRemove: 'Remove logo',
    logoHint: 'A PNG with a transparent background looks best. It is stored at 320 px on the long side.',
    shopName: 'Shop name', insta: 'Instagram handle', phone: 'Phone',
    shopPh: 'e.g. Bloom Hair Studio', instaPh: '@handle', phonePh: 'e.g. (555) 123-4567',
    corner: 'Position',
    corners: { tl: '↖ Top left', tr: '↗ Top right', bl: '↙ Bottom left', br: '↘ Bottom right' } as Record<Corner, string>,
    brandSize: 'Size', opacity: 'Opacity', brandTone: 'Text color',
    brandTones: { light: 'White', dark: 'Black' } as Record<'light' | 'dark', string>,
    brandColor: 'Brand color',
    brandColorHint: 'Used wherever you pick “Brand color” for the divider or labels.',
    watermark: 'Repeating watermark (anti-theft)',
    watermarkHint: 'Tiles your shop name (or Instagram handle) faintly and diagonally across the whole image.',
    watermarkNeed: 'Add a shop name, Instagram handle or logo to get a watermark.',
    maskKind: 'How to hide',
    maskKinds: { mosaic: 'Pixelate', blur: 'Blur', heart: '♥ Heart', star: '★ Star' } as Record<MaskKind, string>,
    maskShape: 'Shape',
    maskShapes: { ellipse: 'Oval', rect: 'Rectangle' } as Record<MaskShape, string>,
    maskHowto: 'Drag over a photo in the preview to hide that area. Drag an area to move it, or drag the round dot at its bottom-right corner to resize. Draw on the before and after photos separately.',
    maskAdd: (n: string) => `Add to ${n.toLowerCase()}`,
    maskDelete: 'Delete selected area', maskClear: 'Clear all',
    maskList: (n: string, k: string, i: number) => `${n} · ${k} ${i}`,
    maskNone: 'No hidden areas yet.',
    maskSafe: 'In the saved image the original pixels under pixelate and blur are gone and cannot be recovered.',
    adjSame: 'Apply the same to both',
    adjSameHint: 'Brightening only one side makes the result look better than it is. Adjust separately only to even out different lighting.',
    adjWarn: 'You are adjusting before and after separately. The result may look exaggerated; use this only to even out lighting differences.',
    adjTarget: 'Photo to adjust',
    brightness: 'Brightness', contrast: 'Contrast', saturation: 'Saturation',
    adjReset: 'Reset adjustments',
    presets: 'My styles',
    presetsHint: 'Save up to 3 styles: logo, shop name, labels, layout, ratio and divider. Next time, just add photos.',
    presetName: 'Style name',
    presetNamePh: (n: number) => ['Instagram feed', 'Stories', 'Blog'][n] ?? `Style ${n + 1}`,
    presetEmpty: 'Empty',
    presetSave: 'Save current style', presetOverwrite: 'Overwrite', presetDelete: 'Delete', presetApply: 'Apply',
    presetNow: 'In use',
    autoSaved: 'The style you used last is remembered and opens automatically next time.',
    storeFail: 'This browser can’t store styles (private mode, for example). Making and saving images still works.',
    storeFull: 'Storage is full, so the style wasn’t saved. Use a smaller logo file or delete a saved style.',
    format: 'File type',
    formats: { jpg: 'JPG (smaller)', png: 'PNG (lossless)' } as Record<Format, string>,
    save: 'Save image', share: 'Share', saved: 'Saved',
    need: 'Add both photos to save',
    shareRetry: 'Ready to share. Tap Share once more.',
    shareFail: 'Couldn’t share. Save the image and post it from the app.',
    consent: 'Always get your client’s permission before posting their photos.',
    local: 'Photos are processed only on this device and never sent to any server. Saved images carry no location (GPS) or other camera data.',
    outSize: (w: number, h: number) => `${w}×${h}px`,
  },
};

const STORE_KEY = 'utilhub-before-after';
const BRAND_SWATCHES = ['#c8956d', '#e8829e', '#8b5cf6', '#2f9e8f', '#1f2937'];
const TABS: Tab[] = ['layout', 'label', 'brand', 'mask', 'adjust'];

type Gesture =
  | { type: 'pan'; i: 0 | 1; x: number; y: number }
  | { type: 'pinch'; i: 0 | 1; d0: number; z0: number; u: number; v: number }
  | { type: 'draw'; i: 0 | 1; id: number; u: number; v: number }
  | { type: 'move'; i: 0 | 1; id: number; u: number; v: number }
  | { type: 'resize'; i: 0 | 1; id: number; u: number; v: number };

function Choice<V extends string | number>({ value, options, onChange, label, disabled }: { value: V; options: { value: V; label: ReactNode }[]; onChange: (v: V) => void; label: string; disabled?: boolean }) {
  return (
    <div className={ui.chips} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.value)} type="button" disabled={disabled}
          className={`${ui.chip} ${ui.pill} ${value === o.value ? ui.chipActive : ''}`}
          aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Row({ title, children, hint }: { title: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className={s.row}>
      <span className={s.rowTitle}>{title}</span>
      {children}
      {hint && <p className={`${ui.hint} ${s.rowHint}`}>{hint}</p>}
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, suffix = '' }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <label className={s.slider}>
      <span className={s.sliderHead}><span>{label}</span><b>{value > 0 && min < 0 ? '+' : ''}{value}{suffix}</b></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export default function BeforeAfterClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const t = isKo ? T.ko : T.en;

  const [style, setStyle] = useState<Style>(DEFAULT_STYLE);
  const [photos, setPhotos] = useState<Pair<Photo | null>>([null, null]);
  const [errors, setErrors] = useState<Pair<LoadError | null>>([null, null]);
  const [loading, setLoading] = useState<Pair<boolean>>([false, false]);
  const [tab, setTab] = useState<Tab>('layout');
  const [align, setAlign] = useState(false);
  const [alignOpacity, setAlignOpacity] = useState(0.5);
  const [alignTarget, setAlignTarget] = useState<0 | 1>(1);
  const [active, setActive] = useState<0 | 1>(0);
  const [maskKind, setMaskKind] = useState<MaskKind>('mosaic');
  const [maskShape, setMaskShape] = useState<MaskShape>('ellipse');
  const [selMask, setSelMask] = useState<number | null>(null);
  const [adjSame, setAdjSame] = useState(true);
  const [adjBoth, setAdjBoth] = useState<Adjust>(ZERO_ADJUST);
  const [adjEach, setAdjEach] = useState<Pair<Adjust>>([ZERO_ADJUST, ZERO_ADJUST]);
  const [adjTarget, setAdjTarget] = useState<0 | 1>(0);
  const [caption, setCaption] = useState('');
  const [format, setFormat] = useState<Format>('jpg');
  const [presets, setPresets] = useState<(Preset | null)[]>([null, null, null]);
  const [presetName, setPresetName] = useState('');
  const [storeState, setStoreState] = useState<'ok' | 'fail' | 'full'>('ok');
  const [canShare, setCanShare] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'saved' | 'retry' | 'fail'; at: number } | null>(null);
  const [cssReady, setCssReady] = useState(false);
  const [fontTick, setFontTick] = useState(0);
  const [logoImg, setLogoImg] = useState<{ src: string; img: HTMLImageElement } | null>(null);
  const [pvWidth, setPvWidth] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const fileTarget = useRef<0 | 1 | 'auto'>('auto');
  const loaded = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture | null>(null);
  const tap = useRef<{ x: number; y: number; moved: boolean; i: 0 | 1 | null } | null>(null);
  const maskId = useRef(1);
  const version = useRef(0);
  const blobCache = useRef<{ v: number; format: Format; blob: Blob } | null>(null);

  const adjust: Pair<Adjust> = adjSame ? [adjBoth, adjBoth] : adjEach;
  const ratio = ratioOf(style.ratio);
  const both = !!photos[0] && !!photos[1];
  const alignOn = align && both;
  const logo = logoImg && logoImg.src === style.logo ? logoImg.img : null;
  const labels = labelTexts(style);
  const set = <K extends keyof Style>(k: K, v: Style[K]) => setStyle((st) => ({ ...st, [k]: v }));

  // 지금 상태를 이벤트 처리기에서 읽기 위한 거울
  const live = useRef({ style, photos, tab, alignOn, alignTarget, selMask, maskKind, maskShape });
  useEffect(() => { live.current = { style, photos, tab, alignOn, alignTarget, selMask, maskKind, maskShape }; });

  // ── 저장해 둔 스타일 되살리기 ──
  useEffect(() => {
    let raw: Record<string, unknown> | null = null;
    let ok = true;
    try { raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null'); } catch { ok = false; }
    void Promise.resolve().then(() => {
      if (!ok) setStoreState('fail');
      if (raw && typeof raw === 'object') {
        if (raw.style) setStyle(sanitizeStyle(raw.style));
        if (raw.format === 'png' || raw.format === 'jpg') setFormat(raw.format);
        if (Array.isArray(raw.presets)) {
          setPresets([0, 1, 2].map((i) => {
            const p = (raw!.presets as unknown[])[i] as { name?: unknown; style?: unknown } | null;
            return p && typeof p === 'object' && p.style ? { name: typeof p.name === 'string' ? p.name.slice(0, 20) : '', style: sanitizeStyle(p.style) } : null;
          }));
        }
      }
      loaded.current = true;
    });
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    let next: 'ok' | 'fail' | 'full' = 'ok';
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ style, format, presets }));
    } catch (e) {
      next = e instanceof DOMException && /quota/i.test(e.name + e.message) ? 'full' : 'fail';
    }
    void Promise.resolve().then(() => setStoreState((p) => (p === next ? p : next)));
  }, [style, format, presets]);

  // ── 글꼴: 스타일시트는 한 번, 글꼴 파일은 쓰는 글자만 ──
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[data-ba-fonts]');
    if (link?.sheet) { void Promise.resolve().then(() => setCssReady(true)); return; }
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FONT_CSS;
      link.setAttribute('data-ba-fonts', '1');
      document.head.appendChild(link);
    }
    const done = () => setCssReady(true);
    link.addEventListener('load', done);
    link.addEventListener('error', done);
    const timer = setTimeout(done, 4000);
    return () => { link?.removeEventListener('load', done); link?.removeEventListener('error', done); clearTimeout(timer); };
  }, []);
  const fontText = useMemo(() => [
    ...(labels ?? []), caption, style.shopName, instaText(style.insta), style.phone, ...t.empty,
  ].join('') || 'A', [labels, caption, style.shopName, style.insta, style.phone, t.empty]);
  const ensureFonts = useCallback(() => {
    if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
    return Promise.all([
      document.fonts.load(fontCss(style.font, 40), fontText),
      document.fonts.load(fontCss('gothic', 40), t.empty.join('')),
    ]).then(() => undefined, () => undefined);
  }, [style.font, fontText, t.empty]);
  useEffect(() => {
    if (!cssReady) return;
    let alive = true;
    void ensureFonts().then(() => { if (alive) setFontTick((n) => n + 1); });
    return () => { alive = false; };
  }, [cssReady, ensureFonts]);

  // ── 로고 이미지 ──
  useEffect(() => {
    const src = style.logo;
    if (!src) return;
    let alive = true;
    const img = new Image();
    img.src = src;
    img.decode().then(() => { if (alive) setLogoImg({ src, img }); }, () => undefined);
    return () => { alive = false; };
  }, [style.logo]);

  // ── 공유 지원 여부 ──
  useEffect(() => {
    let ok = false;
    try {
      const f = new File([new Blob(['x'], { type: 'image/jpeg' })], 'a.jpg', { type: 'image/jpeg' });
      ok = typeof navigator.share === 'function' && !!navigator.canShare?.({ files: [f] });
    } catch { ok = false; }
    void Promise.resolve().then(() => setCanShare(ok));
  }, []);

  // ── 미리보기 크기 ──
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setPvWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const frame = useMemo(() => {
    const cs = cells(style, ratio.w, ratio.h);
    return alignOn ? { w: cs[0].w, h: cs[0].h } : { w: ratio.w, h: ratio.h };
  }, [style, ratio, alignOn]);
  const pvScale = useMemo(() => {
    const dpr = typeof window === 'undefined' ? 1 : Math.min(2, window.devicePixelRatio || 1);
    return Math.min(1, Math.max(0.3, ((pvWidth || 420) * dpr) / frame.w));
  }, [pvWidth, frame.w]);

  // ── 미리보기 그리기 (저장과 같은 함수) ──
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const id = requestAnimationFrame(() => {
      if (alignOn) renderAlign(cv, style, photos, alignOpacity, pvScale);
      else {
        render(cv, {
          style, photos, adjust, caption, imgs: { logo }, scale: pvScale,
          preview: { empty: t.empty, masks: tab === 'mask', selected: selMask, active },
        });
      }
    });
    version.current += 1;
    return () => cancelAnimationFrame(id);
    // adjust는 adjSame·adjBoth·adjEach에서 나온다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style, photos, adjSame, adjBoth, adjEach, caption, logo, fontTick, tab, selMask, active, alignOn, alignOpacity, pvScale, t.empty]);

  // ── 사진 넣기 ──
  const loadInto = useCallback(async (i: 0 | 1, file: File) => {
    setLoading((p) => (i === 0 ? [true, p[1]] : [p[0], true]));
    setErrors((p) => (i === 0 ? [null, p[1]] : [p[0], null]));
    try {
      const r = await loadPhoto(file);
      const photo: Photo = { ...r, zoom: 1, cx: 0.5, cy: 0.5, rot: 0, flip: false, masks: [] };
      setPhotos((p) => (i === 0 ? [photo, p[1]] : [p[0], photo]));
      setActive(i);
    } catch (e) {
      const code = (e instanceof Error ? e.message : 'decode') as LoadError;
      setErrors((p) => (i === 0 ? [code, p[1]] : [p[0], code]));
    } finally {
      setLoading((p) => (i === 0 ? [false, p[1]] : [p[0], false]));
    }
  }, []);

  const handleFiles = useCallback(async (list: FileList | File[], target: 0 | 1 | 'auto') => {
    const files = [...list].filter((f) => !f.type || f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name)).slice(0, 2);
    if (!files.length) {
      const i = target === 'auto' ? 0 : target;
      if ([...list].length) setErrors((p) => (i === 0 ? ['type', p[1]] : [p[0], 'type']));
      return;
    }
    if (files.length === 2) {
      // 한 장씩 열어 메모리를 아낀다
      await loadInto(0, files[0]);
      await loadInto(1, files[1]);
      return;
    }
    const cur = live.current.photos;
    const i = target !== 'auto' ? target : !cur[0] ? 0 : !cur[1] ? 1 : 0;
    await loadInto(i, files[0]);
  }, [loadInto]);

  const openPicker = (target: 0 | 1 | 'auto') => {
    fileTarget.current = target;
    const el = fileRef.current;
    if (!el) return;
    el.multiple = target === 'auto';
    el.value = '';
    el.click();
  };

  // ── 사진 고치기 ──
  const cellOf = useCallback((i: 0 | 1): Cell => {
    const st = live.current.style;
    const r = ratioOf(st.ratio);
    const cs = cells(st, r.w, r.h);
    return live.current.alignOn ? { x: 0, y: 0, w: cs[0].w, h: cs[0].h, r: 0 } : cs[i];
  }, []);
  const updatePhoto = useCallback((i: 0 | 1, fn: (p: Photo) => Photo) => {
    setPhotos((prev) => {
      const p = prev[i];
      if (!p) return prev;
      const n = fn(p);
      if (n === p) return prev;
      return i === 0 ? [n, prev[1]] : [prev[0], n];
    });
  }, []);
  const zoomAt = useCallback((i: 0 | 1, zoom: number, x?: number, y?: number) => {
    const c = cellOf(i);
    updatePhoto(i, (p) => {
      const z = Math.min(ZOOM_MAX, Math.max(1, zoom));
      const pl = place(p, c);
      const px = x ?? c.x + c.w / 2;
      const py = y ?? c.y + c.h / 2;
      const { u, v } = toPhoto(pl, px, py);
      const s2 = Math.max(c.w / pl.ow, c.h / pl.oh) * z;
      return clampPhoto({ ...p, zoom: z, cx: (c.x + c.w / 2 - px) / (pl.ow * s2) + u, cy: (c.y + c.h / 2 - py) / (pl.oh * s2) + v }, c);
    });
  }, [cellOf, updatePhoto]);
  const panBy = useCallback((i: 0 | 1, dx: number, dy: number) => {
    const c = cellOf(i);
    updatePhoto(i, (p) => {
      const pl = place(p, c);
      return clampPhoto({ ...p, cx: pl.cx - dx / (pl.s * pl.ow), cy: pl.cy - dy / (pl.s * pl.oh) }, c);
    });
  }, [cellOf, updatePhoto]);

  const swap = () => {
    setPhotos((p) => [p[1], p[0]]);
    setErrors((e) => [e[1], e[0]]);
    setAdjEach((a) => [a[1], a[0]]);
  };
  const removePhoto = (i: 0 | 1) => {
    setPhotos((p) => (i === 0 ? [null, p[1]] : [p[0], null]));
    setSelMask(null);
    setAlign(false);
  };

  // ── 가리기 ──
  const updateMask = useCallback((i: 0 | 1, id: number, fn: (m: Mask) => Mask) => {
    updatePhoto(i, (p) => ({ ...p, masks: p.masks.map((m) => (m.id === id ? fn(m) : m)) }));
  }, [updatePhoto]);
  const findMask = (id: number | null): { i: 0 | 1; m: Mask } | null => {
    if (id === null) return null;
    for (const i of [0, 1] as const) {
      const m = photos[i]?.masks.find((x) => x.id === id);
      if (m) return { i, m };
    }
    return null;
  };
  const selected = findMask(selMask);
  const addMaskAt = useCallback((i: 0 | 1, x?: number, y?: number) => {
    const c = cellOf(i);
    const id = maskId.current++;
    const { maskKind: kind, maskShape: shape } = live.current;
    updatePhoto(i, (p) => {
      const pl = place(p, c);
      const size = Math.min(c.w, c.h) * 0.24;
      const w = size / (pl.s * pl.ow);
      const h = size / (pl.s * pl.oh);
      const { u, v } = toPhoto(pl, x ?? c.x + c.w / 2, y ?? c.y + c.h / 2);
      return { ...p, masks: [...p.masks, { id, kind, shape, x: Math.min(1 - w, Math.max(0, u - w / 2)), y: Math.min(1 - h, Math.max(0, v - h / 2)), w, h }] };
    });
    setSelMask(id);
  }, [cellOf, updatePhoto]);
  const deleteMask = (id: number) => {
    for (const i of [0, 1] as const) updatePhoto(i, (p) => (p.masks.some((m) => m.id === id) ? { ...p, masks: p.masks.filter((m) => m.id !== id) } : p));
    setSelMask(null);
  };
  const changeMaskKind = (k: MaskKind) => {
    setMaskKind(k);
    if (selected) updateMask(selected.i, selected.m.id, (m) => ({ ...m, kind: k }));
  };
  const changeMaskShape = (sh: MaskShape) => {
    setMaskShape(sh);
    if (selected) updateMask(selected.i, selected.m.id, (m) => ({ ...m, shape: sh }));
  };

  // ── 미리보기 위 손가락·마우스 ──
  const toOut = (e: { clientX: number; clientY: number }) => {
    const cv = canvasRef.current!;
    const r = cv.getBoundingClientRect();
    const f = live.current.alignOn
      ? (() => { const c = cellOf(0); return { w: c.w, h: c.h }; })()
      : ratioOf(live.current.style.ratio);
    return { x: ((e.clientX - r.left) / r.width) * f.w, y: ((e.clientY - r.top) / r.height) * f.h, per: f.w / r.width };
  };
  const hitPhoto = (x: number, y: number): 0 | 1 | null => {
    const L = live.current;
    if (L.alignOn) return L.alignTarget;
    const r = ratioOf(L.style.ratio);
    const cs = cells(L.style, r.w, r.h);
    if (pointInCell(cs[0], x, y)) return 0;
    if (pointInCell(cs[1], x, y)) return 1;
    return null;
  };
  const maskMode = () => live.current.tab === 'mask' && !live.current.alignOn;

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const pt = toOut(e);
    pointers.current.set(e.pointerId, { x: pt.x, y: pt.y });
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const L = live.current;
    if (pointers.current.size === 2) {
      // 두 손가락: 확대 (가리기 그리던 것은 취소하지 않고 확대로 넘어감)
      const g = gesture.current;
      const i = g?.i ?? hitPhoto(pt.x, pt.y);
      if (i === null || i === undefined || !L.photos[i]) return;
      const [a, b] = [...pointers.current.values()];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const p = L.photos[i]!;
      const { u, v } = toPhoto(place(p, cellOf(i)), mid.x, mid.y);
      gesture.current = { type: 'pinch', i, d0: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), z0: p.zoom, u, v };
      tap.current = null;
      return;
    }
    if (pointers.current.size > 2) return;
    const i = hitPhoto(pt.x, pt.y);
    tap.current = { x: e.clientX, y: e.clientY, moved: false, i };
    if (i === null) { gesture.current = null; return; }
    const p = L.photos[i];
    if (!p) { gesture.current = null; return; }
    setActive(i);
    const c = cellOf(i);
    const pl = place(p, c);
    if (maskMode()) {
      // 선택한 영역의 크기 점 → 크기 조절, 영역 안 → 옮기기, 빈 곳 → 새로 그리기
      const handleR = Math.max(HANDLE_R * 1.4, 24 * pt.per);
      const sel = p.masks.find((m) => m.id === L.selMask);
      if (sel) {
        const r = maskRect(pl, sel);
        if (Math.hypot(pt.x - (r.x + r.w), pt.y - (r.y + r.h)) <= handleR) {
          gesture.current = { type: 'resize', i, id: sel.id, u: sel.x, v: sel.y };
          return;
        }
      }
      const { u, v } = toPhoto(pl, pt.x, pt.y);
      const hit = [...p.masks].reverse().find((m) => {
        const r = maskRect(pl, m);
        return pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h;
      });
      if (hit) {
        setSelMask(hit.id);
        gesture.current = { type: 'move', i, id: hit.id, u, v };
        return;
      }
      gesture.current = { type: 'draw', i, id: -1, u: Math.min(1, Math.max(0, u)), v: Math.min(1, Math.max(0, v)) };
      return;
    }
    gesture.current = { type: 'pan', i, x: pt.x, y: pt.y };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    const pt = toOut(e);
    pointers.current.set(e.pointerId, { x: pt.x, y: pt.y });
    if (tap.current && Math.hypot(e.clientX - tap.current.x, e.clientY - tap.current.y) > 6) tap.current.moved = true;
    const g = gesture.current;
    if (!g) return;
    const L = live.current;
    const p = L.photos[g.i];
    if (!p) return;
    const c = cellOf(g.i);
    if (g.type === 'pinch') {
      if (pointers.current.size < 2) return;
      const [a, b] = [...pointers.current.values()];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const z = Math.min(ZOOM_MAX, Math.max(1, (g.z0 * Math.hypot(a.x - b.x, a.y - b.y)) / g.d0));
      updatePhoto(g.i, (q) => {
        const { ow, oh } = place(q, c);
        const s2 = Math.max(c.w / ow, c.h / oh) * z;
        return clampPhoto({ ...q, zoom: z, cx: (c.x + c.w / 2 - mid.x) / (ow * s2) + g.u, cy: (c.y + c.h / 2 - mid.y) / (oh * s2) + g.v }, c);
      });
      return;
    }
    if (g.type === 'pan') {
      panBy(g.i, pt.x - g.x, pt.y - g.y);
      gesture.current = { ...g, x: pt.x, y: pt.y };
      return;
    }
    const pl = place(p, c);
    const { u, v } = toPhoto(pl, pt.x, pt.y);
    const cu = Math.min(1, Math.max(0, u));
    const cv = Math.min(1, Math.max(0, v));
    if (g.type === 'draw') {
      if (!tap.current?.moved) return;
      const rect = { x: Math.min(g.u, cu), y: Math.min(g.v, cv), w: Math.abs(cu - g.u), h: Math.abs(cv - g.v) };
      if (g.id === -1) {
        const id = maskId.current++;
        const { maskKind: kind, maskShape: shape } = L;
        updatePhoto(g.i, (q) => ({ ...q, masks: [...q.masks, { id, kind, shape, ...rect }] }));
        setSelMask(id);
        gesture.current = { ...g, id };
      } else {
        updateMask(g.i, g.id, (m) => ({ ...m, ...rect }));
      }
      return;
    }
    if (g.type === 'move') {
      const du = u - g.u;
      const dv = v - g.v;
      updateMask(g.i, g.id, (m) => ({ ...m, x: Math.min(1 - m.w, Math.max(0, m.x + du)), y: Math.min(1 - m.h, Math.max(0, m.y + dv)) }));
      gesture.current = { ...g, u, v };
      return;
    }
    if (g.type === 'resize') {
      const minW = 24 / (pl.s * pl.ow);
      const minH = 24 / (pl.s * pl.oh);
      updateMask(g.i, g.id, (m) => ({ ...m, w: Math.max(minW, cu - g.u), h: Math.max(minH, cv - g.v) }));
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    const tp = tap.current;
    if (pointers.current.size === 1 && g?.type === 'pinch') {
      // 한 손가락만 남으면 이어서 옮기기
      const [rest] = [...pointers.current.values()];
      gesture.current = maskMode() ? null : { type: 'pan', i: g.i, x: rest.x, y: rest.y };
      return;
    }
    if (pointers.current.size > 0) return;
    gesture.current = null;
    tap.current = null;
    if (!tp || tp.moved || e.type === 'pointercancel') {
      // 너무 작게 그린 영역은 기본 크기로
      if (g?.type === 'draw' && g.id !== -1) {
        const m = live.current.photos[g.i]?.masks.find((x) => x.id === g.id);
        const pl = live.current.photos[g.i] ? place(live.current.photos[g.i]!, cellOf(g.i)) : null;
        if (m && pl && (m.w * pl.s * pl.ow < 16 || m.h * pl.s * pl.oh < 16)) {
          deleteMask(g.id);
        }
      }
      return;
    }
    // 톡: 빈 칸이면 사진 고르기, 가리기 모드면 그 자리에 추가
    if (tp.i === null) return;
    if (!live.current.photos[tp.i]) { openPicker(tp.i); return; }
    if (maskMode() && g?.type === 'draw') {
      const pt = toOut(e);
      addMaskAt(tp.i, pt.x, pt.y);
    }
  };

  // Ctrl+휠(맥 트랙패드 핀치 포함) 확대 — 일반 휠은 페이지 스크롤 그대로
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      const pt = toOut(e);
      const i = hitPhoto(pt.x, pt.y);
      if (i === null) return;
      const p = live.current.photos[i];
      if (!p) return;
      e.preventDefault();
      zoomAt(i, p.zoom * Math.exp(-e.deltaY * 0.01), pt.x, pt.y);
    };
    cv.addEventListener('wheel', onWheel, { passive: false });
    return () => cv.removeEventListener('wheel', onWheel);
    // toOut·hitPhoto는 live 거울만 읽는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomAt]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const i = alignOn ? alignTarget : active;
    const p = photos[i];
    if (!p) return;
    const c = cellOf(i);
    const step = Math.min(c.w, c.h) * 0.03;
    const keys: Record<string, () => void> = {
      ArrowLeft: () => panBy(i, -step, 0),
      ArrowRight: () => panBy(i, step, 0),
      ArrowUp: () => panBy(i, 0, -step),
      ArrowDown: () => panBy(i, 0, step),
      '+': () => zoomAt(i, p.zoom * 1.1),
      '=': () => zoomAt(i, p.zoom * 1.1),
      '-': () => zoomAt(i, p.zoom / 1.1),
    };
    if ((e.key === 'Delete' || e.key === 'Backspace') && tab === 'mask' && selMask !== null) {
      e.preventDefault();
      deleteMask(selMask);
      return;
    }
    const fn = keys[e.key];
    if (fn) { e.preventDefault(); fn(); }
  };

  // ── 끌어다 놓기 ──
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (!files.length) return;
    let target: 0 | 1 | 'auto' = 'auto';
    if (files.length === 1 && canvasRef.current && !alignOn) {
      const pt = toOut(e);
      const i = hitPhoto(pt.x, pt.y);
      if (i !== null) target = i;
    }
    void handleFiles(files, target);
  };

  // ── 저장·공유 ──
  const makeBlob = async (): Promise<Blob | null> => {
    const v = version.current;
    const c = blobCache.current;
    if (c && c.v === v && c.format === format) return c.blob;
    await Promise.race([ensureFonts(), new Promise((r) => setTimeout(r, 3000))]);
    const cv = document.createElement('canvas');
    render(cv, { style, photos, adjust, caption, imgs: { logo }, scale: 1 });
    const type = format === 'png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((r) => cv.toBlob(r, type, 0.92));
    cv.width = 0;
    cv.height = 0;
    if (blob) blobCache.current = { v, format, blob };
    return blob;
  };
  const flash = (kind: 'saved' | 'retry' | 'fail') => {
    const at = Date.now();
    setMsg({ kind, at });
    setTimeout(() => setMsg((m) => (m?.at === at ? null : m)), kind === 'saved' ? 2200 : 6000);
  };
  const onSave = async () => {
    if (!both || busy) return;
    setBusy(true);
    try {
      const blob = await makeBlob();
      if (!blob) { flash('fail'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName(format);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      flash('saved');
    } finally {
      setBusy(false);
    }
  };
  const onShare = async () => {
    if (!both || busy) return;
    setBusy(true);
    try {
      const blob = await makeBlob();
      if (!blob) { flash('fail'); return; }
      const file = new File([blob], fileName(format), { type: blob.type });
      try {
        await navigator.share({ files: [file] });
      } catch (err) {
        const name = err instanceof DOMException ? err.name : '';
        if (name === 'AbortError') return;
        // 이미지를 만드는 사이 사용자 동작 유효 시간이 지나면 거절된다 → 만들어 둔 파일로 한 번 더
        flash(name === 'NotAllowedError' ? 'retry' : 'fail');
      }
    } finally {
      setBusy(false);
    }
  };

  // ── 로고 ──
  const onLogo = async (f: File | undefined) => {
    if (!f) return;
    try { set('logo', await loadLogo(f)); } catch { /* 열 수 없는 파일은 무시 */ }
  };

  // ── 내 스타일 ──
  const savePreset = (n: number) => {
    const name = presetName.trim() || t.presetNamePh(n);
    setPresets((p) => p.map((x, i) => (i === n ? { name: name.slice(0, 20), style } : x)));
    setPresetName('');
  };
  const styleKey = JSON.stringify(style);
  const activePreset = presets.findIndex((p) => p && JSON.stringify(p.style) === styleKey);

  const setAdj = (k: keyof Adjust, v: number) => {
    if (adjSame) setAdjBoth((a) => ({ ...a, [k]: v }));
    else setAdjEach((p) => (adjTarget === 0 ? [{ ...p[0], [k]: v }, p[1]] : [p[0], { ...p[1], [k]: v }]));
  };
  const curAdj = adjSame ? adjBoth : adjEach[adjTarget];
  const toggleSame = (v: boolean) => {
    setAdjSame(v);
    // 따로 → 같이: 전 사진 값을 기준으로 / 같이 → 따로: 지금 값을 양쪽에 복사
    if (v) setAdjBoth(adjEach[0]);
    else setAdjEach([adjBoth, adjBoth]);
  };

  const outLabel = t.outSize(ratio.w, ratio.h);
  const watermarkReady = !!(style.shopName.trim() || instaText(style.insta) || style.logo);
  const maskCount = (photos[0]?.masks.length ?? 0) + (photos[1]?.masks.length ?? 0);
  const touchable = !!(photos[0] || photos[1]);

  return (
    <div className={s.app}>
      <input ref={fileRef} type="file" accept="image/*,.heic,.heif" multiple hidden
        onChange={(e) => { if (e.target.files?.length) void handleFiles(e.target.files, fileTarget.current); }} />

      {/* 사진 2장 */}
      <section className={s.slots} aria-label={isKo ? '사진 넣기' : 'Photos'}>
        {([0, 1] as const).map((i) => {
          const p = photos[i];
          return (
            <div key={i} className={`${s.slot} ${active === i && p ? s.slotActive : ''}`}>
              <div className={s.slotHead}>
                <strong>{t.slot[i]}</strong>
                {p && <span className={ui.hint}>{p.ow0}×{p.oh0}</span>}
              </div>
              <button type="button" className={s.thumbBtn} onClick={() => openPicker(i)} aria-label={`${t.slot[i]} ${p ? t.replace : t.choose}`}>
                {p ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.thumb} alt="" className={s.thumb} style={{ transform: `${p.flip ? 'scaleX(-1) ' : ''}rotate(${p.rot * 90}deg)` }} />
                ) : (
                  <span className={s.thumbEmpty}><ImagePlus size={22} />{loading[i] ? t.loading : t.choose}</span>
                )}
                {p && loading[i] && <span className={s.thumbLoading}>{t.loading}</span>}
              </button>
              {p && (
                <>
                  <div className={s.slotTools}>
                    <button type="button" className={s.iconBtn} onClick={() => updatePhoto(i, rotatePhoto)} aria-label={t.rotate} title={t.rotate}><RotateCw size={17} /></button>
                    <button type="button" className={s.iconBtn} onClick={() => updatePhoto(i, flipPhoto)} aria-label={t.flip} title={t.flip}><FlipHorizontal2 size={17} /></button>
                    <button type="button" className={s.iconBtn} onClick={() => updatePhoto(i, (q) => ({ ...q, zoom: 1, cx: 0.5, cy: 0.5 }))} aria-label={t.reset} title={t.reset}><Maximize2 size={17} /></button>
                    <button type="button" className={s.iconBtn} onClick={() => removePhoto(i)} aria-label={t.remove} title={t.remove}><Trash2 size={17} /></button>
                  </div>
                  <label className={s.zoomRow}>
                    <span>{t.zoom}</span>
                    <input type="range" min={1} max={ZOOM_MAX} step={0.05} value={p.zoom} onChange={(e) => zoomAt(i, Number(e.target.value))} aria-label={`${t.slot[i]} ${t.zoom}`} />
                  </label>
                </>
              )}
              {errors[i] && <p className={ui.error} role="alert">{t.errors[errors[i]!]}</p>}
            </div>
          );
        })}
        <div className={s.slotActions}>
          {!both && (
            <button type="button" className={`${ui.button} ${ui.primary} ${ui.block}`} onClick={() => openPicker('auto')}>
              <Upload size={18} />{t.pickTwo}
            </button>
          )}
          {(photos[0] || photos[1]) && (
            <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm}`} onClick={swap}>
              <ArrowLeftRight size={16} />{t.swap}
            </button>
          )}
          {!both && <p className={`${ui.hint} ${s.center}`}>{t.pickTwoHint}</p>}
        </div>
      </section>

      {/* 미리보기 */}
      <div className={s.stage}>
        <div className={s.stageBar}>
          <button type="button" className={`${ui.chip} ${ui.pill} ${alignOn ? ui.chipActive : ''}`} aria-pressed={alignOn}
            disabled={!both} title={both ? undefined : t.alignNeed} onClick={() => { setAlign((a) => !a); setSelMask(null); }}>
            <Layers size={15} />{alignOn ? t.alignDone : t.align}
          </button>
          <span className={`${ui.hint} ${s.outSize}`}>{outLabel}</span>
        </div>
        <div
          ref={wrapRef}
          className={`${s.canvasWrap} ${dragOver ? s.dragOver : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <canvas
            ref={canvasRef}
            className={`${s.canvas} ${touchable ? s.touchNone : ''} ${tab === 'mask' && !alignOn ? s.crosshair : ''}`}
            style={{ aspectRatio: `${frame.w} / ${frame.h}`, ['--ratio' as string]: frame.w / frame.h }}
            role="img"
            tabIndex={0}
            aria-label={t.preview}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
          />
        </div>
        {alignOn ? (
          <div className={s.alignPanel}>
            <p className={ui.hint}>{t.alignHint}</p>
            <div className={s.alignRow}>
              <span className={s.rowTitle}>{t.alignMove}</span>
              <Choice label={t.alignMove} value={alignTarget} onChange={setAlignTarget} options={[{ value: 1 as const, label: t.slot[1] }, { value: 0 as const, label: t.slot[0] }]} />
            </div>
            <Slider label={t.alignOpacity} value={Math.round(alignOpacity * 100)} min={20} max={80} step={5} suffix="%" onChange={(v) => setAlignOpacity(v / 100)} />
          </div>
        ) : (
          <p className={`${ui.hint} ${s.center} ${s.stageHint}`}>
            {touchable ? (tab === 'mask' && !alignOn ? t.gestureMask : <>{t.gesture} <span className={s.pcOnly}>{t.gesturePc}</span></>) : t.pickTwoHint}
          </p>
        )}
      </div>

      {/* 설정 */}
      <div className={s.panel}>
        <div className={s.tabs} role="tablist" aria-label={isKo ? '설정' : 'Settings'}>
          {TABS.map((k) => (
            <button key={k} type="button" role="tab" id={`ba-tab-${k}`} aria-selected={tab === k} aria-controls="ba-tabpanel"
              className={`${s.tab} ${tab === k ? s.tabActive : ''}`} onClick={() => { setTab(k); if (k !== 'mask') setSelMask(null); }}>
              {t.tabs[k]}{k === 'mask' && maskCount > 0 ? <span className={s.count}>{maskCount}</span> : null}
            </button>
          ))}
        </div>

        <div id="ba-tabpanel" role="tabpanel" aria-labelledby={`ba-tab-${tab}`} className={`${ui.card} ${s.tabBody}`}>
          {tab === 'layout' && (
            <>
              <Row title={t.ratio}>
                <div className={s.ratioGrid} role="group" aria-label={t.ratio}>
                  {RATIOS.map((r) => (
                    <button key={r.key} type="button" className={`${ui.chip} ${s.ratioBtn} ${style.ratio === r.key ? ui.chipActive : ''}`}
                      aria-pressed={style.ratio === r.key} onClick={() => set('ratio', r.key)}>
                      <span className={s.ratioShape} style={{ aspectRatio: `${r.w} / ${r.h}` }} aria-hidden="true" />
                      <b>{t.ratios[r.key][0]}</b><small>{t.ratios[r.key][1]}</small>
                    </button>
                  ))}
                </div>
              </Row>
              <Row title={t.layout}>
                <div className={s.layoutGrid} role="group" aria-label={t.layout}>
                  {(['side', 'stack', 'diagonal'] as Layout[]).map((l) => (
                    <button key={l} type="button" className={`${ui.chip} ${s.layoutBtn} ${style.layout === l ? ui.chipActive : ''}`}
                      aria-pressed={style.layout === l} onClick={() => set('layout', l)}>
                      <span className={`${s.layoutIcon} ${s[`li_${l}`]}`} aria-hidden="true"><i /><i /></span>
                      {t.layouts[l]}
                    </button>
                  ))}
                </div>
              </Row>
              <Row title={t.divider}>
                <Choice label={t.divider} value={style.divider} onChange={(v) => set('divider', v)}
                  options={(['none', 'white', 'black', 'brand'] as DividerColor[]).map((v) => ({ value: v, label: t.dividers[v] }))} />
                {style.divider !== 'none' && (
                  <Choice label={t.thickness} value={style.thickness} onChange={(v) => set('thickness', v)}
                    options={(['s', 'm', 'l'] as Size3[]).map((v) => ({ value: v, label: t.sizes[v] }))} />
                )}
                {style.divider === 'brand' && <BrandColor value={style.brandColor} onChange={(v) => set('brandColor', v)} label={t.brandColor} />}
              </Row>
              <Row title={t.radius} hint={style.layout === 'diagonal' ? t.radiusDiag : style.radius > 0 ? t.radiusGap : undefined}>
                <Choice label={t.radius} value={style.radius} onChange={(v) => set('radius', v)} disabled={style.layout === 'diagonal'}
                  options={([0, 1, 2, 3] as Radius[]).map((v) => ({ value: v, label: t.radii[v] }))} />
              </Row>
            </>
          )}

          {tab === 'label' && (
            <>
              <Row title={t.labelText}>
                <Choice label={t.labelText} value={style.labelSet} onChange={(v) => set('labelSet', v)}
                  options={(isKo
                    ? (['BEFORE_AFTER', 'ko', 'ko_sisul', 'Before_After', 'custom', 'none'] as LabelSet[])
                    : (['BEFORE_AFTER', 'Before_After', 'custom', 'none', 'ko', 'ko_sisul'] as LabelSet[])
                  ).map((v) => ({ value: v, label: t.labelSets[v] }))} />
                {style.labelSet === 'custom' && (
                  <div className={s.twoCols}>
                    <input className={ui.input} value={style.customBefore} maxLength={TEXT_MAX.label} placeholder={isKo ? '예: 관리 전' : 'e.g. Day 1'}
                      aria-label={t.customBefore} onChange={(e) => set('customBefore', e.target.value)} />
                    <input className={ui.input} value={style.customAfter} maxLength={TEXT_MAX.label} placeholder={isKo ? '예: 4주 후' : 'e.g. Week 4'}
                      aria-label={t.customAfter} onChange={(e) => set('customAfter', e.target.value)} />
                  </div>
                )}
              </Row>
              {style.labelSet !== 'none' && (
                <>
                  <Row title={t.labelPos}>
                    <Choice label={t.labelPos} value={style.labelPos} onChange={(v) => set('labelPos', v)}
                      options={(['top', 'bottom', 'corner'] as LabelPos[]).map((v) => ({ value: v, label: t.labelPoses[v] }))} />
                  </Row>
                  <Row title={t.labelStyle}>
                    <Choice label={t.labelStyle} value={style.labelStyle} onChange={(v) => set('labelStyle', v)}
                      options={(['simple', 'badge', 'bar', 'outline'] as LabelStyle[]).map((v) => ({ value: v, label: t.labelStyles[v] }))} />
                  </Row>
                  <Row title={t.labelTone}>
                    <Choice label={t.labelTone} value={style.labelTone} onChange={(v) => set('labelTone', v)}
                      options={(['dark', 'light', 'brand'] as Tone[]).map((v) => ({ value: v, label: t.tones[v] }))} />
                    {style.labelTone === 'brand' && <BrandColor value={style.brandColor} onChange={(v) => set('brandColor', v)} label={t.brandColor} />}
                  </Row>
                  <Row title={t.labelSize}>
                    <Choice label={t.labelSize} value={style.labelSize} onChange={(v) => set('labelSize', v)}
                      options={(['s', 'm', 'l'] as Size3[]).map((v) => ({ value: v, label: t.sizes3[v] }))} />
                  </Row>
                </>
              )}
              <Row title={t.font} hint={t.fontNote}>
                <div className={ui.chips} role="group" aria-label={t.font}>
                  {(Object.keys(FONTS) as FontKey[]).map((f) => (
                    <button key={f} type="button" className={`${ui.chip} ${ui.pill} ${style.font === f ? ui.chipActive : ''}`}
                      style={{ fontFamily: `"${FONTS[f].family}", sans-serif`, fontWeight: FONTS[f].weight }}
                      aria-pressed={style.font === f} onClick={() => set('font', f)}>
                      {isKo ? FONTS[f].ko : FONTS[f].en}
                    </button>
                  ))}
                </div>
              </Row>
              <Row title={t.caption}>
                <input className={ui.input} value={caption} maxLength={TEXT_MAX.caption} placeholder={t.captionPh} aria-label={t.caption}
                  onChange={(e) => setCaption(e.target.value)} />
              </Row>
            </>
          )}

          {tab === 'brand' && (
            <>
              <Row title={t.logo} hint={t.logoHint}>
                <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { void onLogo(e.target.files?.[0]); e.target.value = ''; }} />
                <div className={s.logoRow}>
                  {style.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={style.logo} alt="" className={s.logoThumb} />
                  )}
                  <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm}`} onClick={() => logoRef.current?.click()}>
                    <Upload size={16} />{style.logo ? t.logoChange : t.logoUpload}
                  </button>
                  {style.logo && (
                    <button type="button" className={`${ui.button} ${ui.ghost} ${ui.sm}`} onClick={() => set('logo', null)}>
                      <X size={16} />{t.logoRemove}
                    </button>
                  )}
                </div>
              </Row>
              <div className={s.fields}>
                <label className={s.field}><span>{t.shopName}</span>
                  <input className={ui.input} value={style.shopName} maxLength={TEXT_MAX.shop} placeholder={t.shopPh} onChange={(e) => set('shopName', e.target.value)} />
                </label>
                <label className={s.field}><span>{t.insta}</span>
                  <input className={ui.input} value={style.insta} maxLength={TEXT_MAX.insta} placeholder={t.instaPh} autoCapitalize="none" autoCorrect="off" spellCheck={false}
                    onChange={(e) => set('insta', e.target.value)} />
                </label>
                <label className={s.field}><span>{t.phone}</span>
                  <input className={ui.input} value={style.phone} maxLength={TEXT_MAX.phone} placeholder={t.phonePh} inputMode="tel" onChange={(e) => set('phone', e.target.value)} />
                </label>
              </div>
              <Row title={t.corner}>
                <div className={s.cornerGrid} role="group" aria-label={t.corner}>
                  {(['tl', 'tr', 'bl', 'br'] as Corner[]).map((c) => (
                    <button key={c} type="button" className={`${ui.chip} ${ui.pill} ${style.brandCorner === c ? ui.chipActive : ''}`}
                      aria-pressed={style.brandCorner === c} onClick={() => set('brandCorner', c)}>{t.corners[c]}</button>
                  ))}
                </div>
              </Row>
              <Row title={t.brandSize}>
                <Choice label={t.brandSize} value={style.brandSize} onChange={(v) => set('brandSize', v)}
                  options={(['s', 'm', 'l'] as Size3[]).map((v) => ({ value: v, label: t.sizes3[v] }))} />
              </Row>
              <Row title={t.brandTone}>
                <Choice label={t.brandTone} value={style.brandTone} onChange={(v) => set('brandTone', v)}
                  options={(['light', 'dark'] as const).map((v) => ({ value: v, label: t.brandTones[v] }))} />
              </Row>
              <Slider label={t.opacity} value={Math.round(style.brandOpacity * 100)} min={30} max={100} step={5} suffix="%" onChange={(v) => set('brandOpacity', v / 100)} />
              <Row title={t.brandColor} hint={t.brandColorHint}>
                <BrandColor value={style.brandColor} onChange={(v) => set('brandColor', v)} label={t.brandColor} />
              </Row>
              <label className={s.check}>
                <input type="checkbox" checked={style.watermark} onChange={(e) => set('watermark', e.target.checked)} />
                <span>{t.watermark}</span>
              </label>
              {style.watermark && <p className={`${ui.hint} ${s.rowHint}`}>{watermarkReady ? t.watermarkHint : t.watermarkNeed}</p>}
            </>
          )}

          {tab === 'mask' && (
            <>
              <p className={`${ui.notice} ${s.small}`}>{t.maskHowto}</p>
              <Row title={t.maskKind}>
                <Choice label={t.maskKind} value={selected?.m.kind ?? maskKind} onChange={changeMaskKind}
                  options={(['mosaic', 'blur', 'heart', 'star'] as MaskKind[]).map((v) => ({ value: v, label: t.maskKinds[v] }))} />
              </Row>
              {(selected?.m.kind ?? maskKind) !== 'heart' && (selected?.m.kind ?? maskKind) !== 'star' && (
                <Row title={t.maskShape}>
                  <Choice label={t.maskShape} value={selected?.m.shape ?? maskShape} onChange={changeMaskShape}
                    options={(['ellipse', 'rect'] as MaskShape[]).map((v) => ({ value: v, label: t.maskShapes[v] }))} />
                </Row>
              )}
              <div className={s.btnRow}>
                {([0, 1] as const).map((i) => (
                  <button key={i} type="button" className={`${ui.button} ${ui.secondary} ${ui.sm}`} disabled={!photos[i]} onClick={() => addMaskAt(i)}>
                    <Plus size={16} />{t.maskAdd(t.slot[i])}
                  </button>
                ))}
              </div>
              {maskCount === 0 ? <p className={ui.hint}>{t.maskNone}</p> : (
                <ul className={s.maskList}>
                  {([0, 1] as const).flatMap((i) => (photos[i]?.masks ?? []).map((m, j) => (
                    <li key={m.id}>
                      <button type="button" className={`${s.maskItem} ${selMask === m.id ? s.maskItemActive : ''}`} aria-pressed={selMask === m.id}
                        onClick={() => setSelMask(m.id)}>
                        {t.maskList(t.slot[i], t.maskKinds[m.kind], j + 1)}
                      </button>
                      <button type="button" className={s.iconBtn} onClick={() => deleteMask(m.id)} aria-label={`${t.maskList(t.slot[i], t.maskKinds[m.kind], j + 1)} ${t.presetDelete}`}>
                        <X size={16} />
                      </button>
                    </li>
                  )))}
                </ul>
              )}
              {maskCount > 0 && (
                <div className={s.btnRow}>
                  <button type="button" className={`${ui.button} ${ui.ghost} ${ui.sm}`} onClick={() => { for (const i of [0, 1] as const) updatePhoto(i, (p) => (p.masks.length ? { ...p, masks: [] } : p)); setSelMask(null); }}>
                    <Trash2 size={16} />{t.maskClear}
                  </button>
                </div>
              )}
              <p className={`${ui.hint} ${s.rowHint}`}><ShieldCheck size={14} className={s.inlineIcon} />{t.maskSafe}</p>
            </>
          )}

          {tab === 'adjust' && (
            <>
              <label className={s.check}>
                <input type="checkbox" checked={adjSame} onChange={(e) => toggleSame(e.target.checked)} />
                <span>{t.adjSame}</span>
              </label>
              {adjSame ? <p className={`${ui.hint} ${s.rowHint}`}>{t.adjSameHint}</p> : (
                <>
                  <p className={`${ui.notice} ${ui.amber} ${s.small}`} role="status">{t.adjWarn}</p>
                  <Row title={t.adjTarget}>
                    <Choice label={t.adjTarget} value={adjTarget} onChange={setAdjTarget} options={[{ value: 0 as const, label: t.slot[0] }, { value: 1 as const, label: t.slot[1] }]} />
                  </Row>
                </>
              )}
              <Slider label={t.brightness} value={curAdj.brightness} min={-50} max={50} step={1} suffix="%" onChange={(v) => setAdj('brightness', v)} />
              <Slider label={t.contrast} value={curAdj.contrast} min={-50} max={50} step={1} suffix="%" onChange={(v) => setAdj('contrast', v)} />
              <Slider label={t.saturation} value={curAdj.saturation} min={-50} max={50} step={1} suffix="%" onChange={(v) => setAdj('saturation', v)} />
              <div className={s.btnRow}>
                <button type="button" className={`${ui.button} ${ui.ghost} ${ui.sm}`} disabled={isZeroAdjust(adjBoth) && isZeroAdjust(adjEach[0]) && isZeroAdjust(adjEach[1])}
                  onClick={() => { setAdjBoth(ZERO_ADJUST); setAdjEach([ZERO_ADJUST, ZERO_ADJUST]); }}>
                  {t.adjReset}
                </button>
              </div>
            </>
          )}
        </div>

        {/* 내 스타일 */}
        <section className={`${ui.card} ${s.presets}`} aria-label={t.presets}>
          <h2 className={s.presetsTitle}>{t.presets}</h2>
          <p className={`${ui.hint} ${s.rowHint}`}>{t.presetsHint}</p>
          <input className={ui.input} value={presetName} maxLength={20} placeholder={`${t.presetName} (${t.presetNamePh(presets.findIndex((p) => !p) === -1 ? 0 : presets.findIndex((p) => !p))})`}
            aria-label={t.presetName} onChange={(e) => setPresetName(e.target.value)} />
          <ul className={s.presetList}>
            {presets.map((p, n) => (
              <li key={n} className={`${s.preset} ${activePreset === n ? s.presetActive : ''}`}>
                {p ? (
                  <>
                    <button type="button" className={s.presetName} onClick={() => setStyle(p.style)} aria-pressed={activePreset === n}>
                      <span>{p.name || t.presetNamePh(n)}</span>
                      <small>{activePreset === n ? t.presetNow : `${t.ratios[p.style.ratio][0]} · ${t.layouts[p.style.layout]}`}</small>
                    </button>
                    <button type="button" className={`${ui.button} ${ui.ghost} ${ui.sm}`} onClick={() => savePreset(n)}>{t.presetOverwrite}</button>
                    <button type="button" className={s.iconBtn} onClick={() => setPresets((q) => q.map((x, i) => (i === n ? null : x)))} aria-label={`${p.name} ${t.presetDelete}`}><Trash2 size={16} /></button>
                  </>
                ) : (
                  <>
                    <span className={s.presetEmpty}>{n + 1}. {t.presetEmpty}</span>
                    <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm}`} onClick={() => savePreset(n)}>{t.presetSave}</button>
                  </>
                )}
              </li>
            ))}
          </ul>
          {storeState === 'ok' ? <p className={`${ui.hint} ${s.rowHint}`}>{t.autoSaved}</p>
            : <p className={`${ui.notice} ${ui.amber} ${s.small}`} role="status">{storeState === 'full' ? t.storeFull : t.storeFail}</p>}
        </section>

        <div className={s.formatRow}>
          <span className={s.rowTitle}>{t.format}</span>
          <Choice label={t.format} value={format} onChange={setFormat} options={(['jpg', 'png'] as Format[]).map((v) => ({ value: v, label: t.formats[v] }))} />
        </div>
        <p className={`${ui.notice} ${ui.gray} ${s.small}`}><ShieldCheck size={16} />{t.consent} {t.local}</p>
      </div>

      {/* 저장·공유 (휴대폰에서는 화면 아래에 붙음) */}
      <div className={s.saveBar}>
        <button type="button" className={`${ui.button} ${ui.primary} ${ui.lg} ${s.saveBtn} ${msg?.kind === 'saved' ? ui.green : ''}`} onClick={onSave} disabled={!both || busy}>
          {msg?.kind === 'saved' ? <Check size={18} /> : <Download size={18} />}
          {msg?.kind === 'saved' ? t.saved : t.save}
        </button>
        {canShare && (
          <button type="button" className={`${ui.button} ${ui.secondary} ${ui.lg} ${s.saveBtn}`} onClick={onShare} disabled={!both || busy}>
            <Share2 size={18} />{t.share}
          </button>
        )}
        <p className={`${ui.hint} ${s.saveHint} ${both && (!msg || msg.kind === 'saved') ? s.saveHintQuiet : ''}`} aria-live="polite">
          {!both ? t.need : msg?.kind === 'retry' ? t.shareRetry : msg?.kind === 'fail' ? t.shareFail : `${format.toUpperCase()} · ${outLabel}`}
        </p>
      </div>
    </div>
  );
}

function BrandColor({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className={s.colorRow}>
      {BRAND_SWATCHES.map((c) => (
        <button key={c} type="button" className={`${s.dot} ${value.toLowerCase() === c ? s.dotActive : ''}`} style={{ background: c }}
          onClick={() => onChange(c)} aria-label={`${label} ${c}`} aria-pressed={value.toLowerCase() === c} />
      ))}
      <input type="color" className={s.picker} value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} />
    </div>
  );
}
