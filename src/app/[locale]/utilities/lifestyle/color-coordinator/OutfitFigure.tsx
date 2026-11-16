// 코디 마네킹 일러스트 (SVG). 색만 바꿔 끼우고, 음영은 흑백 반투명 겹으로 입혀서 어떤 색이든 입체감이 난다.
import type { ReactNode, Ref } from 'react';
import { hexToHsl, hslToHex, type SlotKey, type SlotsMap } from '@/lib/outfitColor';

export const FIG_W = 240;
export const FIG_H = 440;
export type HairStyle = 'short' | 'long';

/** 좌우 대칭 경로 (x → 240 − x). 모든 경로는 'x y' 쌍으로만 적는다 */
const mirror = (d: string) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${FIG_W - Number(x)} ${y}`);
const pair = (d: string) => [d, mirror(d)];

const P = {
  // 몸
  armL: 'M 82 106 C 71 112 65 140 63 176 L 59 236 C 59 240 71 241 72 237 L 77 182 C 79 160 84 140 93 128 Z',
  legL: 'M 90 222 C 89 260 92 300 95 340 L 97 384 L 114 384 L 116 340 C 118 300 120 268 120 236 Z',
  chest: 'M 109 93 L 131 93 L 137 100 Q 120 112 103 100 Z',
  neck: 'M 111 76 L 111 98 Q 120 104 129 98 L 129 76 Z',
  hairTop: 'M 99 58 C 96 35 106 27 120 27 C 134 27 144 35 141 58 C 139 49 136 44 131 41 C 123 45 109 45 103 42 C 101 47 99.5 52 99 58 Z',
  hairLong: 'M 97 60 C 93 34 106 25 120 25 C 134 25 147 34 143 60 C 144 76 146 90 149 104 C 142 109 135 108 130 104 C 128 92 128 80 128 72 L 112 72 C 112 80 112 92 110 104 C 105 108 98 109 91 104 C 94 90 96 76 97 60 Z',
  // 상의
  tee: 'M 104 99 Q 120 113 136 99 L 158 105 C 167 111 173 125 177 141 L 157 150 L 152 133 C 151 160 150 190 153 220 L 87 220 C 90 190 89 160 88 133 L 83 150 L 63 141 C 67 125 73 111 82 105 Z',
  teeBody: 'M 104 99 Q 120 113 136 99 L 150 103 L 152 133 C 151 160 150 190 153 220 L 87 220 C 90 190 89 160 88 133 L 90 103 Z',
  longSleeveL: 'M 82 104 C 70 110 64 140 62 176 L 58 236 C 61 239 70 240 74 237 L 78 182 C 80 160 85 140 93 128 Z',
  sleeveless: 'M 106 99 Q 120 112 134 99 L 142 100 C 144 115 148 125 152 133 C 151 160 150 190 153 220 L 87 220 C 90 190 89 160 88 133 C 92 125 96 115 98 100 Z',
  dress: 'M 104 99 Q 120 113 136 99 L 158 105 C 167 111 173 125 177 141 L 157 150 L 152 133 C 151 160 150 185 151 205 C 158 260 166 310 170 345 Q 120 357 70 345 C 74 310 82 260 89 205 C 90 185 89 160 88 133 L 83 150 L 63 141 C 67 125 73 111 82 105 Z',
  dressBody: 'M 104 99 Q 120 113 136 99 L 150 103 L 152 133 C 151 160 150 185 151 205 C 158 260 166 310 170 345 Q 120 357 70 345 C 74 310 82 260 89 205 C 90 185 89 160 88 133 L 90 103 Z',
  neckRib: 'M 104 99 Q 120 113 136 99',
  sleeveHemL: 'M 63 141 L 83 150',
  cuffL: 'M 58.6 229 L 75.4 231',
  shirtCollarL: 'M 103 97 L 113 95 L 120 110 L 107 113 Z',
  // 하의
  pants: 'M 89 212 L 151 212 C 154 245 155 305 148 388 L 123 388 L 121.5 270 Q 120 262 118.5 270 L 117 388 L 92 388 C 85 305 86 245 89 212 Z',
  wide: 'M 89 212 L 151 212 C 156 250 161 320 162 391 L 123 391 L 121.5 270 Q 120 262 118.5 270 L 117 391 L 78 391 C 79 320 84 250 89 212 Z',
  shorts: 'M 89 212 L 151 212 C 153 235 155 258 156 285 L 123 288 L 121.5 268 Q 120 262 118.5 268 L 117 288 L 84 285 C 85 258 87 235 89 212 Z',
  midi: 'M 90 212 L 150 212 C 156 260 164 310 168 345 Q 120 356 72 345 C 76 310 84 260 90 212 Z',
  mini: 'M 90 212 L 150 212 C 154 238 158 260 161 279 Q 120 288 79 279 C 82 260 86 238 90 212 Z',
  waist: 'M 88.6 212 L 151.4 212 L 151.7 222 L 88.3 222 Z',
  fly: 'M 120 222 Q 121 240 114 252',
  flyShort: 'M 120 222 Q 121 236 115 246',
  pocketL: 'M 91 228 Q 99 233 102 222',
  creaseL: 'M 104 274 L 104.5 386',
  creaseWideL: 'M 101 274 L 98 389',
  shortsHemL: 'M 84.5 279 L 117.4 282',
  // 신발
  sneakerL: 'M 94 378 L 116 378 C 119 385 121 391 122 399 L 79 399 C 77 391 83 386 92 383 Z',
  loaferL: 'M 93 386 L 116 386 C 119 390 121 394 122 399 L 79 399 C 78 394 84 390 92 388 Z',
  bootL: 'M 95 352 L 116 352 L 116.5 384 C 119 389 121 394 122 399 L 79 399 C 77 391 83 386 94 383 Z',
  soleL: 'M 78 398 L 123 398 L 123 403 Q 123 406 120 406 L 81 406 Q 78 406 78 403 Z',
  laceL: 'M 104 386 L 116 385 M 101 390 L 117 389 M 82 395 C 87 392 92 391 97 392',
  loaferStrapL: 'M 97 391 L 115 390',
  bootSeamL: 'M 106 354 L 106 383',
  // 아우터
  sleeveL: 'M 81 103 C 69 109 62 140 60 176 L 56 236 C 60 239 70 240 75 238 L 79 182 C 81 160 85 140 93 128 Z',
  jacketL: 'M 81 103 L 104 96 C 106 108 108 116 110 124 L 113 232 L 85 232 C 88 200 88 160 87 130 Z',
  coatL: 'M 81 103 L 104 96 C 106 108 108 116 110 124 L 113 302 L 79 302 C 82 240 86 180 87 130 Z',
  cardiganL: 'M 81 103 L 106 97 C 108 116 110 130 112 152 L 113 226 L 86 226 C 88 200 88 160 87 130 Z',
  lapelL: 'M 104 96 L 95 102 L 103 138 L 110 124 C 108 116 106 108 104 96 Z',
  coatLapelL: 'M 104 96 L 91 103 L 102 152 L 110 124 C 108 116 106 108 104 96 Z',
  collarBack: 'M 100 97 Q 120 88 140 97 L 137 101 Q 120 93 103 101 Z',
  outerCuffL: 'M 56.6 228 L 75.6 230.5',
  pocketFlapL: 'M 90 196 L 106 196',
  coatPocketL: 'M 86 246 L 104 246',
  cardiganHemL: 'M 86.2 219 L 112.8 219',
  // 모자
  bucketCrown: 'M 102 46 C 103 33 107 25 120 25 C 133 25 137 33 138 46 Z',
  bucketBand: 'M 102.4 40 L 137.6 40 L 138 46 L 102 46 Z',
  bucketBrim: 'M 100 44 C 110 42 130 42 140 44 L 150 54 C 141 59 99 59 90 54 Z',
  capCrown: 'M 99 50 C 99 32 108 25 120 25 C 132 25 141 32 141 50 Z',
  capBill: 'M 96 47 C 106 53 134 53 144 47 C 148 57 136 63 120 63 C 104 63 92 57 96 47 Z',
  capSeams: 'M 120 26 L 120 49 M 110 28 C 107 36 106 43 106 49 M 130 28 C 133 36 134 43 134 49',
  beanieBody: 'M 100 52 C 99 33 108 23 120 23 C 132 23 141 33 140 52 Z',
  beanieCuff: 'M 98.5 43 L 141.5 43 L 142 54 L 98 54 Z',
};

const SEAM = 'rgba(0,0,0,0.22)';
const EDGE = 'rgba(30,25,40,0.28)';
const DARK_SOLE = '#2B2522';
const BOTTOM_KEYS = ['pants', 'wide', 'shorts', 'midi', 'mini'] as const;

/** 각 아이템이 차지하는 원단 경로 (선택 표시에도 쓴다) */
export function clothPaths(k: SlotKey, slots: SlotsMap): string[] {
  const st = slots[k].style;
  const outer = slots.outer.active;
  switch (k) {
    case 'top':
      if (st === 'dress') return [outer ? P.dressBody : P.dress];
      if (st === 'sleeveless') return [P.sleeveless];
      if (st === 'long' || st === 'shirt') return outer ? [P.teeBody] : [P.teeBody, ...pair(P.longSleeveL)];
      return [outer ? P.teeBody : P.tee];
    case 'bottom': {
      const key = (BOTTOM_KEYS as readonly string[]).includes(st) ? (st as (typeof BOTTOM_KEYS)[number]) : 'pants';
      return [P[key]];
    }
    case 'shoes':
      return pair(st === 'boots' ? P.bootL : st === 'loafers' ? P.loaferL : P.sneakerL);
    case 'outer':
      return [...pair(P.sleeveL), ...pair(st === 'coat' ? P.coatL : st === 'cardigan' ? P.cardiganL : P.jacketL)];
    case 'hat':
      if (st === 'cap') return [P.capCrown, P.capBill];
      if (st === 'beanie') return [P.beanieBody];
      return [P.bucketCrown, P.bucketBrim];
  }
}

interface Props {
  slots: SlotsMap;
  skin: string;
  hair: HairStyle;
  selected: SlotKey | null;
  onSelect?: (k: SlotKey) => void;
  onAddHat?: () => void;
  label: string;
  svgRef?: Ref<SVGSVGElement>;
}

const lines = (ds: string[], width = 1, stroke = SEAM) =>
  ds.map((d) => <path key={d} d={d} stroke={stroke} strokeWidth={width} fill="none" pointerEvents="none" />);

/** 원단 한 벌: 바탕색 + 원통형 음영 + 위아래 빛 */
function Cloth({ d, color }: { d: string; color: string }) {
  return (
    <>
      <path d={d} style={{ fill: color, transition: 'fill .35s ease' }} stroke={EDGE} strokeWidth={0.8} strokeLinejoin="round" />
      <path d={d} fill="url(#cc-cyl)" pointerEvents="none" />
      <path d={d} fill="url(#cc-vert)" pointerEvents="none" />
    </>
  );
}

/** 덧댄 조각(라펠·칼라): 같은 색에 살짝 어둡게 */
function Patch({ d, color, dark = 0.13 }: { d: string; color: string; dark?: number }) {
  return (
    <g pointerEvents="none">
      <path d={d} style={{ fill: color, transition: 'fill .35s ease' }} stroke={EDGE} strokeWidth={0.8} />
      <path d={d} fill="#000" opacity={dark} />
    </g>
  );
}

function Item({ k, onSelect, children }: { k: SlotKey; onSelect?: (k: SlotKey) => void; children: ReactNode }) {
  return (
    <g filter="url(#cc-drop)" onClick={onSelect ? () => onSelect(k) : undefined} style={{ cursor: onSelect ? 'pointer' : undefined }}>
      {children}
    </g>
  );
}

const btn = (cx: number, cy: number, r = 1.7) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="rgba(0,0,0,0.38)" pointerEvents="none" />;

export default function OutfitFigure({ slots, skin, hair, selected, onSelect, onAddHat, label, svgRef }: Props) {
  const [sh, ss, sl] = hexToHsl(skin);
  const skinShade = hslToHex(sh, ss, sl - 12);
  const skinLight = hslToHex(sh, ss, Math.min(sl + 6, 96));
  const { hat, outer, top, bottom, shoes } = slots;
  const isPantsLike = ['pants', 'wide', 'shorts'].includes(bottom.style);
  const bottomPath = clothPaths('bottom', slots)[0];

  return (
    <svg ref={svgRef} viewBox={`0 0 ${FIG_W} ${FIG_H}`} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <radialGradient id="cc-bg" cx="50%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E9E5F1" />
        </radialGradient>
        <linearGradient id="cc-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E4DFEC" stopOpacity="0" />
          <stop offset="100%" stopColor="#D9D3E4" stopOpacity="1" />
        </linearGradient>
        {/* 원통형 음영: 가장자리 어둡게, 왼쪽 위 빛 */}
        <linearGradient id="cc-cyl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.26" />
          <stop offset="16%" stopColor="#000" stopOpacity="0.06" />
          <stop offset="38%" stopColor="#FFF" stopOpacity="0.13" />
          <stop offset="62%" stopColor="#FFF" stopOpacity="0" />
          <stop offset="86%" stopColor="#000" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="cc-vert" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF" stopOpacity="0.1" />
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id="cc-skin" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={skinShade} />
          <stop offset="40%" stopColor={skinLight} />
          <stop offset="100%" stopColor={skinShade} />
        </linearGradient>
        <radialGradient id="cc-head" cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor={skinLight} />
          <stop offset="70%" stopColor={skin} />
          <stop offset="100%" stopColor={skinShade} />
        </radialGradient>
        <linearGradient id="cc-hair" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1F1916" />
          <stop offset="45%" stopColor="#3A2F29" />
          <stop offset="100%" stopColor="#1F1916" />
        </linearGradient>
        <filter id="cc-drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.6" stdDeviation="1.6" floodColor="#1A1424" floodOpacity="0.28" />
        </filter>
        <filter id="cc-blur" x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <clipPath id="cc-clip-bottom"><path d={bottomPath} /></clipPath>
      </defs>

      {/* 스튜디오 배경 */}
      <rect x="0" y="0" width={FIG_W} height={FIG_H} fill="url(#cc-bg)" />
      <rect x="0" y="330" width={FIG_W} height={FIG_H - 330} fill="url(#cc-floor)" />
      <ellipse cx="120" cy="406" rx="56" ry="6.5" fill="#1A1424" opacity="0.22" filter="url(#cc-blur)" />

      {/* 긴 머리는 몸 뒤로 */}
      {hair === 'long' && <path d={P.hairLong} fill="url(#cc-hair)" />}

      {/* 몸 (옷 아래) */}
      {pair(P.armL).map((d) => <path key={d} d={d} fill="url(#cc-skin)" />)}
      {pair(P.legL).map((d) => <path key={d} d={d} fill="url(#cc-skin)" />)}
      <ellipse cx="65.5" cy="248" rx="7" ry="11" fill="url(#cc-skin)" />
      <ellipse cx={FIG_W - 65.5} cy="248" rx="7" ry="11" fill="url(#cc-skin)" />
      <path d={P.chest} fill={skin} />

      {/* 신발 */}
      <Item k="shoes" onSelect={onSelect}>
        {clothPaths('shoes', slots).map((d) => <Cloth key={d} d={d} color={shoes.color} />)}
        {pair(P.soleL).map((d) => (
          <path key={d} d={d} fill={shoes.style === 'sneakers' ? '#F4F2EE' : DARK_SOLE} stroke="rgba(0,0,0,0.18)" strokeWidth={0.7} pointerEvents="none" />
        ))}
        {shoes.style === 'sneakers' && lines(pair(P.laceL), 0.8)}
        {shoes.style === 'loafers' && lines(pair(P.loaferStrapL), 1.2, 'rgba(0,0,0,0.3)')}
        {shoes.style === 'boots' && lines(pair(P.bootSeamL), 0.9)}
      </Item>

      {/* 하의 (원피스면 없음) */}
      {bottom.active && (
        <Item k="bottom" onSelect={onSelect}>
          <path d={bottomPath} style={{ fill: bottom.color, transition: 'fill .35s ease' }} stroke={EDGE} strokeWidth={0.8} />
          <g clipPath="url(#cc-clip-bottom)" pointerEvents="none">
            {isPantsLike ? (
              <>
                <rect x="76" y="212" width="44.5" height="182" fill="url(#cc-cyl)" />
                <rect x="119.5" y="212" width="45" height="182" fill="url(#cc-cyl)" />
              </>
            ) : (
              <rect x="70" y="212" width="100" height="150" fill="url(#cc-cyl)" />
            )}
            <rect x="70" y="212" width="100" height="182" fill="url(#cc-vert)" />
          </g>
          <path d={P.waist} fill="#000" opacity="0.1" pointerEvents="none" />
          {bottom.style === 'pants' && lines([P.fly, ...pair(P.pocketL), ...pair(P.creaseL)], 0.9)}
          {bottom.style === 'wide' && lines([P.fly, ...pair(P.pocketL), ...pair(P.creaseWideL)], 0.9)}
          {bottom.style === 'shorts' && lines([P.flyShort, ...pair(P.pocketL), ...pair(P.shortsHemL)], 0.9)}
          {bottom.style === 'midi' && lines(['M 104 226 L 96 346', 'M 120 228 L 120 352', 'M 136 226 L 144 346'], 0.8, 'rgba(0,0,0,0.13)')}
          {bottom.style === 'mini' && lines(['M 106 226 L 101 282', 'M 134 226 L 139 282'], 0.8, 'rgba(0,0,0,0.13)')}
        </Item>
      )}

      {/* 상의 */}
      <Item k="top" onSelect={onSelect}>
        {clothPaths('top', slots).map((d) => <Cloth key={d} d={d} color={top.color} />)}
        {top.style !== 'shirt' && <path d={P.neckRib} stroke="rgba(0,0,0,0.25)" strokeWidth={2.4} fill="none" pointerEvents="none" />}
        {!outer.active && (top.style === 'tee' || top.style === 'dress') && lines(pair(P.sleeveHemL))}
        {!outer.active && (top.style === 'long' || top.style === 'shirt') && lines(pair(P.cuffL))}
        {top.style === 'dress' && lines(['M 89 205 Q 120 210 151 205', 'M 104 222 L 96 344', 'M 120 224 L 120 351', 'M 136 222 L 144 344'], 0.8, 'rgba(0,0,0,0.14)')}
        {top.style === 'shirt' && (
          <>
            {lines(['M 120 110 L 120 219'], 0.9)}
            {[124, 146, 168, 190, 210].map((y) => btn(121.8, y, 1.3))}
            {pair(P.shirtCollarL).map((d) => <Patch key={d} d={d} color={top.color} dark={0.06} />)}
          </>
        )}
      </Item>

      {/* 아우터 (앞이 열려 가운데로 상의가 보인다) */}
      {outer.active && (
        <Item k="outer" onSelect={onSelect}>
          {outer.style !== 'cardigan' && <Patch d={P.collarBack} color={outer.color} dark={0.18} />}
          {clothPaths('outer', slots).map((d) => <Cloth key={d} d={d} color={outer.color} />)}
          {outer.style === 'coat' ? (
            <>
              {pair(P.coatLapelL).map((d) => <Patch key={d} d={d} color={outer.color} />)}
              {lines([...pair(P.outerCuffL), ...pair(P.coatPocketL)])}
              {[btn(110.8, 172, 2), btn(111.4, 208, 2), btn(112, 244, 2)]}
            </>
          ) : outer.style === 'cardigan' ? (
            <>
              {lines([...pair(P.outerCuffL), ...pair(P.cardiganHemL)], 1.4, 'rgba(0,0,0,0.18)')}
              {[btn(111.4, 160), btn(112, 180), btn(112.4, 200), btn(112.7, 215)]}
            </>
          ) : (
            <>
              {pair(P.lapelL).map((d) => <Patch key={d} d={d} color={outer.color} />)}
              {lines([...pair(P.outerCuffL), ...pair(P.pocketFlapL)])}
              {[btn(110.6, 162), btn(111.4, 194)]}
            </>
          )}
        </Item>
      )}

      {/* 목·머리 (얼굴 없는 마네킹) */}
      <path d={P.neck} fill="url(#cc-skin)" />
      <path d="M 111 92 Q 120 99 129 92 L 129 98 Q 120 104 111 98 Z" fill="#000" opacity="0.08" />
      <ellipse cx="99" cy="58" rx="3.6" ry="6.5" fill={skinShade} />
      <ellipse cx="141" cy="58" rx="3.6" ry="6.5" fill={skinShade} />
      <ellipse cx="120" cy="56" rx="21" ry="26" fill="url(#cc-head)" />
      {!hat.active && <path d={P.hairTop} fill="url(#cc-hair)" />}
      {!hat.active && <path d="M 106 36 C 112 31 124 30 132 34" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth={2} fill="none" />}

      {/* 모자 */}
      {hat.active ? (
        <Item k="hat" onSelect={onSelect}>
          {hat.style === 'cap' ? (
            <>
              <Cloth d={P.capCrown} color={hat.color} />
              {lines([P.capSeams], 0.8)}
              {btn(120, 26, 1.6)}
              <Cloth d={P.capBill} color={hat.color} />
              <path d={P.capBill} fill="#000" opacity="0.12" pointerEvents="none" />
            </>
          ) : hat.style === 'beanie' ? (
            <>
              <Cloth d={P.beanieBody} color={hat.color} />
              <Patch d={P.beanieCuff} color={hat.color} dark={0.1} />
              {lines(Array.from({ length: 9 }, (_, i) => `M ${101 + i * 4.75} 44 L ${101 + i * 4.75} 53`), 0.7, 'rgba(0,0,0,0.16)')}
            </>
          ) : (
            <>
              <Cloth d={P.bucketCrown} color={hat.color} />
              <path d={P.bucketBand} fill="#000" opacity="0.16" pointerEvents="none" />
              <Cloth d={P.bucketBrim} color={hat.color} />
            </>
          )}
        </Item>
      ) : onAddHat ? (
        <g data-ui="1" onClick={onAddHat} style={{ cursor: 'pointer' }} opacity="0.75">
          <path d={P.bucketCrown} fill="rgba(255,255,255,0.4)" stroke="#A79BC8" strokeDasharray="4 3" strokeWidth={1} transform="translate(0 -14)" />
          <path d={P.bucketBrim} fill="rgba(255,255,255,0.4)" stroke="#A79BC8" strokeDasharray="4 3" strokeWidth={1} transform="translate(0 -14)" />
          <text x="120" y="22" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="700" fill="#8B7FB3">+</text>
        </g>
      ) : null}

      {/* 선택 표시 (저장 이미지에서는 뺀다) */}
      {selected && slots[selected].active && (
        <g data-ui="1" pointerEvents="none">
          {clothPaths(selected, slots).map((d) => (
            <path key={d} d={d} fill="none" stroke="#8B5CF6" strokeWidth={1.6} strokeLinejoin="round" strokeDasharray="5 3">
              <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.2s" repeatCount="indefinite" />
            </path>
          ))}
        </g>
      )}
    </svg>
  );
}
