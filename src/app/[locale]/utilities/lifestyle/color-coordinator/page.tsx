'use client';

import { useState, useRef } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Plus, X, Download } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './color-coordinator.module.css';

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'OOTD 컬러 코디네이터',
  alternateName: 'OOTD Color Coordinator',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/color-coordinator',
  description: '마네킹 위에서 상의·하의·아우터 색상을 실시간 조합하고 3가지 알고리즘 룩을 제안하는 무료 패션 코디 플래너',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '색상 팔레트는 어떻게 구성되나요?', acceptedAnswer: { '@type': 'Answer', text: '뉴트럴 4색, 웜뉴트럴 4색, 컬러 4색, 포인트 4색의 총 16색으로 구성되어 있으며, [+ Custom] 버튼으로 커스텀 색상도 추가할 수 있습니다.' } },
    { '@type': 'Question', name: '룩 알고리즘은 어떤 원리인가요?', acceptedAnswer: { '@type': 'Answer', text: '데일리는 무채색 톤 배치, 포인트는 보색(Hue +180°) 적용, 소프트는 유사색(Analogous) 조합으로 각각 색채 이론을 자동 적용합니다.' } },
    { '@type': 'Question', name: '모자와 아우터는 왜 기본 비활성인가요?', acceptedAnswer: { '@type': 'Answer', text: '모든 코디에서 필수 아이템이 아니기 때문입니다. [+ Add] 버튼으로 필요할 때 추가할 수 있습니다.' } },
    { '@type': 'Question', name: '이 툴의 결과를 공식 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' } },
  ],
};

// ─────────────────── Types ───────────────────
type SlotKey = 'hat' | 'outer' | 'top' | 'bottom' | 'shoes';
type LookType = 'daily' | 'point' | 'soft';

interface SlotState {
  color: string;
  active: boolean;
  optional: boolean;
}

type SlotsMap = Record<SlotKey, SlotState>;

// ─────────────────── Palette ───────────────────
const PALETTE: { group: string; colors: { name: string; hex: string }[] }[] = [
  {
    group: 'Neutrals',
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Light Gray', hex: '#D1D5DB' },
      { name: 'Gray', hex: '#6B7280' },
      { name: 'Black', hex: '#1F2937' },
    ],
  },
  {
    group: 'Warm neutrals',
    colors: [
      { name: 'Ivory', hex: '#F5F0E0' },
      { name: 'Beige', hex: '#D4B896' },
      { name: 'Camel', hex: '#C19A6B' },
      { name: 'Brown', hex: '#6B4226' },
    ],
  },
  {
    group: 'Colors',
    colors: [
      { name: 'Navy', hex: '#1E3A5F' },
      { name: 'Sky Blue', hex: '#7EC8E3' },
      { name: 'Khaki', hex: '#8B8B5A' },
      { name: 'Olive', hex: '#6B7C45' },
    ],
  },
  {
    group: 'Points',
    colors: [
      { name: 'Burgundy', hex: '#722F37' },
      { name: 'Terracotta', hex: '#C0603A' },
      { name: 'Mustard', hex: '#D4A017' },
      { name: 'Coral', hex: '#E8856A' },
    ],
  },
];

const ALL_COLORS = PALETTE.flatMap((g) => g.colors);

// ─────────────────── Initial slots ───────────────────
const INITIAL_SLOTS: SlotsMap = {
  hat:    { color: '#D4B896', active: false, optional: true },
  outer:  { color: '#1F2937', active: false, optional: true },
  top:    { color: '#1E3A5F', active: true,  optional: false },
  bottom: { color: '#6B7280', active: true,  optional: false },
  shoes:  { color: '#1F2937', active: true,  optional: false },
};

// ─────────────────── Slot metadata ───────────────────
const SLOT_META: { key: SlotKey; emoji: string; labelKo: string; labelEn: string }[] = [
  { key: 'hat',    emoji: '🎩', labelKo: '모자',   labelEn: 'Hat' },
  { key: 'outer',  emoji: '🧥', labelKo: '아우터', labelEn: 'Outer' },
  { key: 'top',    emoji: '👕', labelKo: '상의',   labelEn: 'Top' },
  { key: 'bottom', emoji: '👖', labelKo: '하의',   labelEn: 'Bottom' },
  { key: 'shoes',  emoji: '👟', labelKo: '신발',   labelEn: 'Shoes' },
];

// ─────────────────── Color math ───────────────────
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let sl = 0;
  if (max !== min) {
    const d = max - min;
    sl = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(sl * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const hN = ((h % 360) + 360) % 360;
  const sN = Math.max(0, Math.min(100, s)) / 100;
  const lN = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs(((hN / 60) % 2) - 1));
  const m = lN - c / 2;
  let r = 0, g = 0, b = 0;
  if (hN < 60)       { r = c; g = x; b = 0; }
  else if (hN < 120) { r = x; g = c; b = 0; }
  else if (hN < 180) { r = 0; g = c; b = x; }
  else if (hN < 240) { r = 0; g = x; b = c; }
  else if (hN < 300) { r = x; g = 0; b = c; }
  else               { r = c; g = 0; b = x; }
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ─────────────────── Look computation ───────────────────
function computeLook(look: LookType, base: SlotKey, slots: SlotsMap): SlotsMap {
  const next = { ...slots };
  const [bh, bs, bl] = hexToHsl(slots[base].color);

  if (look === 'daily') {
    const dailyDefaults: Partial<Record<SlotKey, string>> = {
      hat:    '#D1D5DB',
      outer:  '#1F2937',
      top:    '#6B7280',
      bottom: '#6B7280',
      shoes:  '#1F2937',
    };
    (Object.keys(slots) as SlotKey[]).forEach((k) => {
      if (k !== base && slots[k].active) {
        next[k] = { ...slots[k], color: dailyDefaults[k] ?? '#6B7280' };
      }
    });
  } else if (look === 'point') {
    const compHex = hslToHex((bh + 180) % 360, bs, bl);
    const assignTo = slots['hat'].active && base !== 'hat' ? 'hat' : 'shoes';
    (Object.keys(slots) as SlotKey[]).forEach((k) => {
      if (k === base || !slots[k].active) return;
      if (k === assignTo) {
        next[k] = { ...slots[k], color: compHex };
      } else {
        next[k] = { ...slots[k], color: k === 'shoes' || k === 'outer' ? '#1F2937' : '#6B7280' };
      }
    });
  } else if (look === 'soft') {
    // analogous adjustments per slot
    const adjustments: Partial<Record<SlotKey, [number, number]>> = {
      hat:    [+22, +18],
      outer:  [-25, -18],
      top:    [0, 0],
      bottom: [-15, -12],
      shoes:  [-32, -24],
    };
    (Object.keys(slots) as SlotKey[]).forEach((k) => {
      if (k === base || !slots[k].active) return;
      const [dh, dl] = adjustments[k] ?? [0, 0];
      next[k] = { ...slots[k], color: hslToHex(bh + dh, bs, bl + dl) };
    });
  }

  return next;
}

// ─────────────────── Mannequin SVG ───────────────────
interface MannequinProps {
  slots: SlotsMap;
  selectedSlot: SlotKey | null;
  onSelectSlot: (k: SlotKey) => void;
  onActivateHat: () => void;
  svgRef: React.RefObject<SVGSVGElement>;
}

function Mannequin({ slots, selectedSlot, onSelectSlot, onActivateHat, svgRef }: MannequinProps) {
  const SKIN = '#EAC59B';

  const activeStroke = (k: SlotKey) =>
    selectedSlot === k ? '#8B5CF6' : 'rgba(255,255,255,0.5)';
  const activeStrokeWidth = (k: SlotKey) =>
    selectedSlot === k ? 2.5 : 1.5;

  const inactiveProps = {
    fill: 'none',
    stroke: '#CBD5E1',
    strokeDasharray: '5 4',
    strokeWidth: 1.5,
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 400"
      xmlns="http://www.w3.org/2000/svg"
      className={s.mannequin}
    >
      {/* ── Inactive outer dashed outline (before top, so top is clickable) ── */}
      {!slots.outer.active && (
        <>
          <path
            d="M 44 88 L 12 94 L 10 150 L 30 152 L 44 108 Z"
            {...inactiveProps}
            style={{ pointerEvents: 'none' }}
          />
          <path
            d="M 156 88 L 188 94 L 190 150 L 170 152 L 156 108 Z"
            {...inactiveProps}
            style={{ pointerEvents: 'none' }}
          />
          <path
            d="M 44 88 L 156 88 L 160 185 L 40 185 Z"
            {...inactiveProps}
            style={{ pointerEvents: 'none' }}
          />
        </>
      )}

      {/* ── Shoes ── */}
      <motion.rect
        x={30} y={314} width={60} height={18} rx={7}
        animate={{ fill: slots.shoes.color }}
        transition={{ duration: 0.35 }}
        stroke={activeStroke('shoes')}
        strokeWidth={activeStrokeWidth('shoes')}
        style={{ cursor: 'pointer' }}
        onClick={() => onSelectSlot('shoes')}
      />
      <motion.rect
        x={110} y={314} width={60} height={18} rx={7}
        animate={{ fill: slots.shoes.color }}
        transition={{ duration: 0.35 }}
        stroke={activeStroke('shoes')}
        strokeWidth={activeStrokeWidth('shoes')}
        style={{ cursor: 'pointer' }}
        onClick={() => onSelectSlot('shoes')}
      />

      {/* ── Bottom ── */}
      <motion.path
        d="M 48 183 L 40 314 L 86 314 L 100 242 L 114 314 L 160 314 L 152 183 Z"
        animate={{ fill: slots.bottom.color }}
        transition={{ duration: 0.35 }}
        stroke={activeStroke('bottom')}
        strokeWidth={activeStrokeWidth('bottom')}
        style={{ cursor: 'pointer' }}
        onClick={() => onSelectSlot('bottom')}
      />

      {/* ── Top sleeves ── */}
      <motion.path
        d="M 52 88 L 22 94 L 20 146 L 38 148 L 52 106 Z"
        animate={{ fill: slots.top.color }}
        transition={{ duration: 0.35 }}
        stroke={activeStroke('top')}
        strokeWidth={activeStrokeWidth('top')}
        style={{ cursor: 'pointer' }}
        onClick={() => onSelectSlot('top')}
      />
      <motion.path
        d="M 148 88 L 178 94 L 180 146 L 162 148 L 148 106 Z"
        animate={{ fill: slots.top.color }}
        transition={{ duration: 0.35 }}
        stroke={activeStroke('top')}
        strokeWidth={activeStrokeWidth('top')}
        style={{ cursor: 'pointer' }}
        onClick={() => onSelectSlot('top')}
      />
      {/* ── Top body ── */}
      <motion.path
        d="M 52 88 L 148 88 L 152 183 L 48 183 Z"
        animate={{ fill: slots.top.color }}
        transition={{ duration: 0.35 }}
        stroke={activeStroke('top')}
        strokeWidth={activeStrokeWidth('top')}
        style={{ cursor: 'pointer' }}
        onClick={() => onSelectSlot('top')}
      />

      {/* ── Active outer (rendered after top) ── */}
      {slots.outer.active && (
        <>
          <motion.path
            d="M 44 88 L 12 94 L 10 150 L 30 152 L 44 108 Z"
            animate={{ fill: slots.outer.color }}
            transition={{ duration: 0.35 }}
            stroke={activeStroke('outer')}
            strokeWidth={activeStrokeWidth('outer')}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectSlot('outer')}
          />
          <motion.path
            d="M 156 88 L 188 94 L 190 150 L 170 152 L 156 108 Z"
            animate={{ fill: slots.outer.color }}
            transition={{ duration: 0.35 }}
            stroke={activeStroke('outer')}
            strokeWidth={activeStrokeWidth('outer')}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectSlot('outer')}
          />
          <motion.path
            d="M 44 88 L 156 88 L 160 185 L 40 185 Z"
            animate={{ fill: slots.outer.color }}
            transition={{ duration: 0.35 }}
            stroke={activeStroke('outer')}
            strokeWidth={activeStrokeWidth('outer')}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectSlot('outer')}
          />
        </>
      )}

      {/* ── Neck ── */}
      <rect x={93} y={76} width={14} height={12} rx={3} fill={SKIN} />

      {/* ── Head ── */}
      <circle cx={100} cy={52} r={24} fill={SKIN} />

      {/* ── Face ── */}
      <circle cx={93} cy={49} r={2.5} fill="#8B6355" />
      <circle cx={107} cy={49} r={2.5} fill="#8B6355" />
      <path d="M 94 58 Q 100 63 106 58" stroke="#8B6355" strokeWidth={1.5} fill="none" strokeLinecap="round" />

      {/* ── Hat inactive dashed (before head so head is on top) ── */}
      {!slots.hat.active && (
        <>
          <rect x={76} y={2} width={48} height={24} rx={5} {...inactiveProps} style={{ cursor: 'pointer' }} onClick={onActivateHat} />
          <rect x={60} y={22} width={80} height={10} rx={4} {...inactiveProps} style={{ cursor: 'pointer' }} onClick={onActivateHat} />
          <text
            x={100}
            y={18}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={14}
            fill="#CBD5E1"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={onActivateHat}
          >
            +
          </text>
        </>
      )}

      {/* ── Hat active (after head) ── */}
      {slots.hat.active && (
        <>
          <motion.rect
            x={76} y={2} width={48} height={24} rx={5}
            animate={{ fill: slots.hat.color }}
            transition={{ duration: 0.35 }}
            stroke={activeStroke('hat')}
            strokeWidth={activeStrokeWidth('hat')}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectSlot('hat')}
          />
          <motion.rect
            x={60} y={22} width={80} height={10} rx={4}
            animate={{ fill: slots.hat.color }}
            transition={{ duration: 0.35 }}
            stroke={activeStroke('hat')}
            strokeWidth={activeStrokeWidth('hat')}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectSlot('hat')}
          />
        </>
      )}
    </svg>
  );
}

// ─────────────────── Main page ───────────────────
export default function ColorCoordinatorPage() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [slots, setSlots] = useState<SlotsMap>(INITIAL_SLOTS);
  const [selectedSlot, setSelectedSlot] = useState<SlotKey>('top');
  const [activeLook, setActiveLook] = useState<LookType | null>(null);
  const mannequinRef = useRef<SVGSVGElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // ── Slot helpers ──
  const handleActivateSlot = (k: SlotKey) => {
    setSlots((prev) => ({ ...prev, [k]: { ...prev[k], active: true } }));
    setSelectedSlot(k);
  };

  const handleDeactivateSlot = (k: SlotKey) => {
    setSlots((prev) => ({ ...prev, [k]: { ...prev[k], active: false } }));
    if (selectedSlot === k) setSelectedSlot('top');
  };

  const handleSelectSlot = (k: SlotKey) => {
    if (!slots[k].active) return;
    setSelectedSlot(k);
  };

  // ── Color selection ──
  const handlePickColor = (hex: string) => {
    setSlots((prev) => ({
      ...prev,
      [selectedSlot]: { ...prev[selectedSlot], color: hex },
    }));
    setActiveLook(null);
  };

  // ── Look themes ──
  const handleApplyLook = (look: LookType) => {
    setActiveLook(look);
    setSlots((prev) => computeLook(look, selectedSlot, prev));
  };

  // ── Save ──
  const handleSave = () => {
    const svg = mannequinRef.current;
    if (!svg) return;
    const svgStr = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 540;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 320, 540);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 20, 10, 260, 400);
      // Color info below
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(isKo ? 'OOTD 컬러 코디네이터' : 'OOTD Color Coordinator', 20, 430);
      let infoY = 450;
      ctx.font = '11px sans-serif';
      (Object.keys(slots) as SlotKey[]).forEach((k) => {
        if (!slots[k].active) return;
        const meta = SLOT_META.find((m) => m.key === k)!;
        // draw color swatch
        ctx.fillStyle = slots[k].color;
        ctx.beginPath();
        ctx.arc(32, infoY - 4, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // draw label
        ctx.fillStyle = '#374151';
        ctx.fillText(`${meta.emoji} ${isKo ? meta.labelKo : meta.labelEn}: ${slots[k].color}`, 44, infoY);
        infoY += 16;
      });
      // watermark
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '10px sans-serif';
      ctx.fillText('theutilhub.com', 20, 530);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.download = `ootd-coordinator-${new Date().toISOString().slice(0, 10)}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  };

  // ── SEO content ──
  const seoKo = {
    title: 'OOTD 컬러 코디네이터 — 스마트 색상 코디 플래너',
    description:
      'OOTD 컬러 코디네이터는 패션 색채 이론을 기반으로 마네킹 위에서 상의·하의·아우터·모자·신발의 색상을 실시간으로 조합해 데일리·포인트·소프트 3가지 알고리즘 룩을 제안하는 무료 온라인 코디 도구입니다.',
    useCases: [
      { icon: '👀', title: '직관적인 확인', desc: '마네킹 위에서 컬러 조합을 즉시 시각적으로 확인할 수 있습니다.' },
      { icon: '🛍️', title: '실패 없는 쇼핑', desc: '구매 전 색상 조합을 미리 시뮬레이션해 충동구매를 줄입니다.' },
      { icon: '🎨', title: '3가지 룩 테마', desc: '데일리·포인트·소프트 알고리즘으로 즉시 스타일 제안.' },
      { icon: '💾', title: '코디 저장', desc: '완성된 코디를 PNG 이미지로 저장해 기록으로 남깁니다.' },
    ],
    steps: [
      { step: '베이스 아이템 색상 선택', desc: '상의 또는 하의를 클릭하고 팔레트에서 원하는 색을 고르세요.' },
      { step: '추가 아이템 활성화', desc: '아우터나 모자를 추가하려면 [+ Add] 버튼을 누르세요.' },
      { step: '룩 테마 적용', desc: '데일리·포인트·소프트 중 하나를 선택하면 알고리즘이 나머지 색상을 자동 배정합니다.' },
      { step: '저장 & 공유', desc: '마음에 드는 코디를 PNG로 저장하거나 SNS에 공유하세요.' },
    ],
    faqs: [
      { q: '색상 팔레트는 어떻게 구성되나요?', a: '뉴트럴 4색, 웜뉴트럴 4색, 컬러 4색, 포인트 4색의 총 16색으로 구성되어 있으며, [+ Custom] 버튼으로 커스텀 색상도 추가할 수 있습니다.' },
      { q: '룩 알고리즘은 어떤 원리인가요?', a: '데일리는 무채색 톤 배치, 포인트는 보색(Hue +180°) 적용, 소프트는 유사색(Analogous) 조합으로 각각 색채 이론을 자동 적용합니다.' },
      { q: '모자와 아우터는 왜 기본 비활성인가요?', a: '모든 코디에서 필수 아이템이 아니기 때문입니다. [+ Add] 버튼으로 필요할 때 추가할 수 있습니다.' },
      { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
    ],
  };

  const seoEn = {
    title: 'OOTD Color Coordinator — Smart Outfit Color Planner',
    description:
      'OOTD Color Coordinator is a free online fashion tool that lets you combine colors for top, bottom, outer, hat, and shoes on a mannequin in real-time, with 3 algorithm-powered look themes: Daily, Point, and Soft.',
    useCases: [
      { icon: '👀', title: 'Instant Visualization', desc: 'See color combinations on a mannequin immediately without trying anything on.' },
      { icon: '🛍️', title: 'Smarter Shopping', desc: 'Simulate color combos before buying to avoid fashion mistakes.' },
      { icon: '🎨', title: '3 Look Themes', desc: 'Daily, Point, and Soft algorithms suggest instant style combinations.' },
      { icon: '💾', title: 'Save Your Look', desc: 'Export your coordinated outfit as a PNG image to keep as reference.' },
    ],
    steps: [
      { step: 'Pick a base item color', desc: 'Click on top or bottom in the mannequin and choose a color from the palette.' },
      { step: 'Activate optional items', desc: 'Add an outer layer or hat by clicking the [+ Add] button.' },
      { step: 'Apply a look theme', desc: 'Choose Daily, Point, or Soft — the algorithm auto-assigns the remaining colors.' },
      { step: 'Save & share', desc: 'Download your outfit as a PNG image or share it on social media.' },
    ],
    faqs: [
      { q: 'How is the color palette organized?', a: 'The palette has 16 colors across 4 groups: Neutrals, Warm Neutrals, Colors, and Points. You can also add custom colors with the [+ Custom] button.' },
      { q: 'How do the look algorithms work?', a: 'Daily uses neutral tone distribution, Point uses complementary color (Hue +180°), and Soft uses analogous color theory — all applied automatically.' },
      { q: 'Why are hat and outer inactive by default?', a: 'They are optional accessories. You can add them anytime by clicking the [+ Add] button next to each slot.' },
      { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
    ],
  };

  const looks: { key: LookType; emoji: string; nameKo: string; nameEn: string; descKo: string; descEn: string }[] = [
    { key: 'daily', emoji: '☀️', nameKo: '데일리', nameEn: 'Daily', descKo: '무채색 베이스', descEn: 'Neutral base' },
    { key: 'point', emoji: '🎯', nameKo: '포인트', nameEn: 'Point', descKo: '보색 포인트', descEn: 'Complementary' },
    { key: 'soft', emoji: '🌸', nameKo: '소프트', nameEn: 'Soft', descKo: '유사색 그라데이션', descEn: 'Analogous blend' },
  ];

  return (
    <div className={s.container}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <NavigationActions />

      {/* ── Header ── */}
      <header className={s.header}>
        <div className={s.iconWrap}>
          <span style={{ fontSize: '2rem' }}>🧥</span>
        </div>
        <h1 className={s.title}>
          {isKo ? 'OOTD 컬러 코디네이터' : 'OOTD Color Coordinator'}
        </h1>
        <p className={s.subtitle}>
          {isKo
            ? '3가지 알고리즘 테마로 완성하는 스마트 색상 코디 플래너'
            : 'Smart mannequin color planner with 3 algorithm-powered look themes'}
        </p>
      </header>

      {/* ── Main grid ── */}
      <div className={s.mainGrid}>
        {/* Left: mannequin */}
        <div className={s.mannequinWrap}>
          <Mannequin
            slots={slots}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSelectSlot}
            onActivateHat={() => handleActivateSlot('hat')}
            svgRef={mannequinRef as React.RefObject<SVGSVGElement>}
          />
        </div>

        {/* Right: panel */}
        <div className={s.panel}>
          {/* ── Slot list ── */}
          <div className={s.slotSection}>
            <p className={s.slotSectionTitle}>
              {isKo ? '아이템 슬롯' : 'Item Slots'}
            </p>
            <div className={s.slotList}>
              {SLOT_META.map(({ key, emoji, labelKo, labelEn }) => {
                const slot = slots[key];
                const isSelected = selectedSlot === key && slot.active;
                return (
                  <button
                    key={key}
                    className={`${s.slotItem} ${isSelected ? s.slotItemSel : ''} ${!slot.active ? s.slotItemInactive : ''}`}
                    onClick={() => slot.active ? handleSelectSlot(key) : undefined}
                  >
                    <span
                      className={s.slotColorDot}
                      style={{ background: slot.active ? slot.color : '#e2e8f0' }}
                    />
                    <span style={{ fontSize: '1rem' }}>{emoji}</span>
                    <span className={s.slotLabel}>{isKo ? labelKo : labelEn}</span>
                    {slot.optional && (
                      <span className={s.slotBadge}>
                        {isKo ? '선택' : 'opt'}
                      </span>
                    )}
                    {slot.optional && !slot.active && (
                      <button
                        className={s.slotAddBtn}
                        onClick={(e) => { e.stopPropagation(); handleActivateSlot(key); }}
                      >
                        + {isKo ? '추가' : 'Add'}
                      </button>
                    )}
                    {slot.optional && slot.active && (
                      <button
                        className={s.slotRemove}
                        title={isKo ? '제거' : 'Remove'}
                        onClick={(e) => { e.stopPropagation(); handleDeactivateSlot(key); }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Color palette ── */}
          <div className={s.paletteSection}>
            <p className={s.paletteSectionTitle}>
              {isKo
                ? `${SLOT_META.find((m) => m.key === selectedSlot)?.[isKo ? 'labelKo' : 'labelEn'] ?? ''} 색상 선택`
                : `${SLOT_META.find((m) => m.key === selectedSlot)?.labelEn ?? ''} Color`}
            </p>
            <div className={s.paletteGrid}>
              {ALL_COLORS.map(({ hex, name }) => (
                <button
                  key={hex}
                  className={`${s.swatch} ${slots[selectedSlot]?.color === hex ? s.swatchActive : ''}`}
                  style={{ background: hex }}
                  title={name}
                  onClick={() => handlePickColor(hex)}
                />
              ))}
            </div>
            <button
              className={s.customColorBtn}
              onClick={() => colorInputRef.current?.click()}
            >
              <Plus size={12} />
              {isKo ? '커스텀 색상' : 'Custom'}
            </button>
            <input
              ref={colorInputRef}
              type="color"
              className={s.hiddenInput}
              value={slots[selectedSlot]?.color ?? '#000000'}
              onChange={(e) => handlePickColor(e.target.value)}
            />
          </div>

          {/* ── Look themes ── */}
          <div className={s.lookSection}>
            <p className={s.lookSectionTitle}>
              {isKo ? '룩 테마' : 'Look Themes'}
            </p>
            <div className={s.lookBtns}>
              {looks.map(({ key, emoji, nameKo, nameEn, descKo, descEn }) => (
                <button
                  key={key}
                  className={`${s.lookBtn} ${activeLook === key ? s.lookBtnActive : ''}`}
                  onClick={() => handleApplyLook(key)}
                >
                  <span className={s.lookEmoji}>{emoji}</span>
                  <span className={s.lookName}>{isKo ? nameKo : nameEn}</span>
                  <span className={s.lookDesc}>{isKo ? descKo : descEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Save button ── */}
          <button className={s.saveBtn} onClick={handleSave}>
            <Download size={18} />
            {isKo ? '코디 저장 (PNG)' : 'Save Outfit (PNG)'}
          </button>
        </div>
      </div>

      {/* ── Ad placeholder ── */}
      <div className={s.adPlaceholder} style={{ margin: '2rem 0' }}>
        AD
      </div>

      {/* ── SEO & share ── */}
      <ShareBar
        title={isKo ? 'OOTD 컬러 코디네이터' : 'OOTD Color Coordinator'}
        description={isKo ? seoKo.description : seoEn.description}
      />

      <RelatedTools toolId="color-coordinator" />

      <SeoSection ko={seoKo} en={seoEn} />
    </div>
  );
}
