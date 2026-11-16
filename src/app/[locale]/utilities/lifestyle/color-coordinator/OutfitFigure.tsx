// 코디 마네킹 일러스트 (SVG). 색만 바꿔 끼우고, 음영은 흑백 반투명 겹으로 입혀서 어떤 색이든 입체감이 난다.
import type { Ref } from 'react';
import { hexToHsl, hslToHex, type SlotKey, type SlotsMap } from '@/lib/outfitColor';

export const FIG_W = 240;
export const FIG_H = 440;

/** 좌우 대칭 경로 (x → 240 − x). 모든 경로는 'x y' 쌍으로만 적는다 */
const mirror = (d: string) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${FIG_W - Number(x)} ${y}`);

const P = {
  armL: 'M 82 106 C 71 112 65 140 63 176 L 59 236 C 59 240 71 241 72 237 L 77 182 C 79 160 84 140 93 128 Z',
  chest: 'M 109 93 L 131 93 L 137 100 Q 120 112 103 100 Z',
  neck: 'M 111 76 L 111 98 Q 120 104 129 98 L 129 76 Z',
  hairBack: 'M 99 58 C 96 35 106 27 120 27 C 134 27 144 35 141 58 C 139 49 136 44 131 41 C 123 45 109 45 103 42 C 101 47 99.5 52 99 58 Z',
  tee: 'M 104 99 Q 120 113 136 99 L 158 105 C 167 111 173 125 177 141 L 157 150 L 152 133 C 151 160 150 190 153 220 L 87 220 C 90 190 89 160 88 133 L 83 150 L 63 141 C 67 125 73 111 82 105 Z',
  // 아우터 안에서는 소매 없는 몸판만 (소매가 재킷 밖으로 비치지 않게)
  teeBody: 'M 104 99 Q 120 113 136 99 L 150 103 L 152 133 C 151 160 150 190 153 220 L 87 220 C 90 190 89 160 88 133 L 90 103 Z',
  teeNeck: 'M 104 99 Q 120 113 136 99',
  teeHemL: 'M 63 141 L 83 150',
  pants: 'M 89 212 L 151 212 C 154 245 155 305 148 388 L 123 388 L 121.5 270 Q 120 262 118.5 270 L 117 388 L 92 388 C 85 305 86 245 89 212 Z',
  waist: 'M 88.6 212 L 151.4 212 L 151.7 222 L 88.3 222 Z',
  fly: 'M 120 222 Q 121 240 114 252',
  pocketL: 'M 91 228 Q 99 233 102 222',
  creaseL: 'M 104 274 L 104.5 386',
  shoeL: 'M 94 378 L 116 378 C 119 385 121 391 122 399 L 79 399 C 77 391 83 386 92 383 Z',
  soleL: 'M 78 398 L 123 398 L 123 403 Q 123 406 120 406 L 81 406 Q 78 406 78 403 Z',
  laceL: 'M 104 388 L 116 387 M 101 392 L 117 391 M 82 395 C 87 392 92 391 97 392',
  sleeveL: 'M 81 103 C 69 109 62 140 60 176 L 56 236 C 60 239 70 240 75 238 L 79 182 C 81 160 85 140 93 128 Z',
  cuffL: 'M 56.6 228 L 75.6 230.5',
  panelL: 'M 81 103 L 104 96 C 106 108 108 116 110 124 L 113 232 L 85 232 C 88 200 88 160 87 130 Z',
  lapelL: 'M 104 96 L 95 102 L 103 138 L 110 124 C 108 116 106 108 104 96 Z',
  collarBack: 'M 100 97 Q 120 88 140 97 L 137 101 Q 120 93 103 101 Z',
  pocketFlapL: 'M 90 196 L 106 196',
  hatCrown: 'M 102 46 C 103 33 107 25 120 25 C 133 25 137 33 138 46 Z',
  hatBand: 'M 102.4 40 L 137.6 40 L 138 46 L 102 46 Z',
  hatBrim: 'M 100 44 C 110 42 130 42 140 44 L 150 54 C 141 59 99 59 90 54 Z',
};

const SLOT_PATHS: Record<SlotKey, string[]> = {
  hat: [P.hatCrown, P.hatBrim],
  outer: [P.sleeveL, mirror(P.sleeveL), P.panelL, mirror(P.panelL)],
  top: [P.tee],
  bottom: [P.pants],
  shoes: [P.shoeL, mirror(P.shoeL)],
};

const SEAM = 'rgba(0,0,0,0.22)';
const EDGE = 'rgba(30,25,40,0.28)';

interface Props {
  slots: SlotsMap;
  skin: string;
  selected: SlotKey | null;
  onSelect?: (k: SlotKey) => void;
  onAddHat?: () => void;
  label: string;
  svgRef?: Ref<SVGSVGElement>;
}

/** 원단 한 벌: 바탕색 + 원통형 음영 + 위아래 빛 */
function Cloth({ d, color, k, onSelect, shade = true }: { d: string; color: string; k: SlotKey; onSelect?: (k: SlotKey) => void; shade?: boolean }) {
  return (
    <g onClick={onSelect ? () => onSelect(k) : undefined} style={{ cursor: onSelect ? 'pointer' : undefined }}>
      <path d={d} style={{ fill: color, transition: 'fill .35s ease' }} stroke={EDGE} strokeWidth={0.8} strokeLinejoin="round" />
      {shade && <path d={d} fill="url(#cc-cyl)" pointerEvents="none" />}
      {shade && <path d={d} fill="url(#cc-vert)" pointerEvents="none" />}
    </g>
  );
}

export default function OutfitFigure({ slots, skin, selected, onSelect, onAddHat, label, svgRef }: Props) {
  const [sh, ss, sl] = hexToHsl(skin);
  const skinShade = hslToHex(sh, ss, sl - 12);
  const skinLight = hslToHex(sh, ss, Math.min(sl + 6, 96));
  const { hat, outer, top, bottom, shoes } = slots;

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
        <filter id="cc-drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.6" stdDeviation="1.6" floodColor="#1A1424" floodOpacity="0.28" />
        </filter>
        <filter id="cc-blur" x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <clipPath id="cc-clip-pants"><path d={P.pants} /></clipPath>
      </defs>

      {/* 스튜디오 배경 */}
      <rect x="0" y="0" width={FIG_W} height={FIG_H} fill="url(#cc-bg)" />
      <rect x="0" y="330" width={FIG_W} height={FIG_H - 330} fill="url(#cc-floor)" />
      <ellipse cx="120" cy="406" rx="56" ry="6.5" fill="#1A1424" opacity="0.22" filter="url(#cc-blur)" />

      {/* 몸 (옷 아래) */}
      <path d={P.armL} fill="url(#cc-skin)" />
      <path d={mirror(P.armL)} fill="url(#cc-skin)" />
      <ellipse cx="65.5" cy="248" rx="7" ry="11" fill="url(#cc-skin)" />
      <ellipse cx={FIG_W - 65.5} cy="248" rx="7" ry="11" fill="url(#cc-skin)" />
      <path d={P.chest} fill={skin} />

      {/* 신발 */}
      <g filter="url(#cc-drop)">
        {[P.shoeL, mirror(P.shoeL)].map((d) => <Cloth key={d} d={d} color={shoes.color} k="shoes" onSelect={onSelect} />)}
        {[P.soleL, mirror(P.soleL)].map((d) => <path key={d} d={d} fill="#F4F2EE" stroke="rgba(0,0,0,0.18)" strokeWidth={0.7} pointerEvents="none" />)}
        {[P.laceL, mirror(P.laceL)].map((d) => <path key={d} d={d} stroke={SEAM} strokeWidth={0.8} fill="none" pointerEvents="none" />)}
      </g>

      {/* 하의: 다리마다 따로 음영 */}
      <g filter="url(#cc-drop)" onClick={onSelect ? () => onSelect('bottom') : undefined} style={{ cursor: onSelect ? 'pointer' : undefined }}>
        <path d={P.pants} style={{ fill: bottom.color, transition: 'fill .35s ease' }} stroke={EDGE} strokeWidth={0.8} />
        <g clipPath="url(#cc-clip-pants)" pointerEvents="none">
          <rect x="85" y="212" width="35.5" height="178" fill="url(#cc-cyl)" />
          <rect x="119.5" y="212" width="36" height="178" fill="url(#cc-cyl)" />
          <rect x="85" y="212" width="71" height="178" fill="url(#cc-vert)" />
        </g>
        <path d={P.waist} fill="#000" opacity="0.1" pointerEvents="none" />
        {[P.fly, P.pocketL, mirror(P.pocketL), P.creaseL, mirror(P.creaseL)].map((d) => (
          <path key={d} d={d} stroke={SEAM} strokeWidth={0.9} fill="none" pointerEvents="none" />
        ))}
      </g>

      {/* 상의 */}
      <g filter="url(#cc-drop)">
        <Cloth d={outer.active ? P.teeBody : P.tee} color={top.color} k="top" onSelect={onSelect} />
        <path d={P.teeNeck} stroke="rgba(0,0,0,0.25)" strokeWidth={2.4} fill="none" pointerEvents="none" />
        {!outer.active && [P.teeHemL, mirror(P.teeHemL)].map((d) => <path key={d} d={d} stroke={SEAM} strokeWidth={1} fill="none" pointerEvents="none" />)}
      </g>

      {/* 아우터 (앞이 열린 재킷 — 가운데로 상의가 보인다) */}
      {outer.active && (
        <g filter="url(#cc-drop)">
          <path d={P.collarBack} style={{ fill: outer.color }} stroke={EDGE} strokeWidth={0.8} />
          <path d={P.collarBack} fill="#000" opacity="0.18" />
          {[P.sleeveL, mirror(P.sleeveL), P.panelL, mirror(P.panelL)].map((d) => (
            <Cloth key={d} d={d} color={outer.color} k="outer" onSelect={onSelect} />
          ))}
          {[P.lapelL, mirror(P.lapelL)].map((d) => (
            <g key={d} pointerEvents="none">
              <path d={d} style={{ fill: outer.color }} stroke={EDGE} strokeWidth={0.8} />
              <path d={d} fill="#000" opacity="0.13" />
            </g>
          ))}
          {[P.cuffL, mirror(P.cuffL), P.pocketFlapL, mirror(P.pocketFlapL)].map((d) => (
            <path key={d} d={d} stroke={SEAM} strokeWidth={1} fill="none" pointerEvents="none" />
          ))}
          <circle cx="110.6" cy="162" r="1.8" fill="rgba(0,0,0,0.38)" pointerEvents="none" />
          <circle cx="111.4" cy="194" r="1.8" fill="rgba(0,0,0,0.38)" pointerEvents="none" />
        </g>
      )}

      {/* 목·머리 (얼굴 없는 마네킹) */}
      <path d={P.neck} fill="url(#cc-skin)" />
      <path d="M 111 92 Q 120 99 129 92 L 129 98 Q 120 104 111 98 Z" fill="#000" opacity="0.08" />
      <ellipse cx="99" cy="58" rx="3.6" ry="6.5" fill={skinShade} />
      <ellipse cx="141" cy="58" rx="3.6" ry="6.5" fill={skinShade} />
      <ellipse cx="120" cy="56" rx="21" ry="26" fill="url(#cc-head)" />
      {!hat.active && <path d={P.hairBack} fill="#2B2320" />}
      {!hat.active && <path d="M 106 36 C 112 31 124 30 132 34" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth={2} fill="none" />}

      {/* 모자 (버킷햇) */}
      {hat.active ? (
        <g filter="url(#cc-drop)">
          <Cloth d={P.hatCrown} color={hat.color} k="hat" onSelect={onSelect} />
          <path d={P.hatBand} fill="#000" opacity="0.16" pointerEvents="none" />
          <Cloth d={P.hatBrim} color={hat.color} k="hat" onSelect={onSelect} />
        </g>
      ) : onAddHat ? (
        <g data-ui="1" onClick={onAddHat} style={{ cursor: 'pointer' }} opacity="0.75">
          <path d={P.hatCrown} fill="rgba(255,255,255,0.4)" stroke="#A79BC8" strokeDasharray="4 3" strokeWidth={1} transform="translate(0 -14)" />
          <path d={P.hatBrim} fill="rgba(255,255,255,0.4)" stroke="#A79BC8" strokeDasharray="4 3" strokeWidth={1} transform="translate(0 -14)" />
          <text x="120" y="20" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="700" fill="#8B7FB3">+</text>
        </g>
      ) : null}

      {/* 선택 표시 (저장 이미지에서는 뺀다) */}
      {selected && slots[selected].active && (
        <g data-ui="1" pointerEvents="none">
          {SLOT_PATHS[selected].map((d) => (
            <path key={d} d={d} fill="none" stroke="#8B5CF6" strokeWidth={1.8} strokeLinejoin="round" strokeDasharray="5 3">
              <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.2s" repeatCount="indefinite" />
            </path>
          ))}
        </g>
      )}
    </svg>
  );
}
