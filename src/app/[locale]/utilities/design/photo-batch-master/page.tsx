'use client';

import { useState, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  Save,
  Download,
  Trash2,
  CheckCircle,
  Loader2,
  Plus,
  X,
  FolderOpen,
} from 'lucide-react';
import type { Metadata } from 'next';
import JSZip from 'jszip';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './photo-batch-master.module.css';

// ─────────────────── Types ───────────────────
interface Preset {
  name: string;
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  highlights: number;
  shadows: number;
  sharpness: number;
  warmth: number;
}

interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  resultBlob?: Blob;
}

// ─────────────────── Default preset ───────────────────
const DEFAULT_PRESET: Preset = {
  name: 'My Preset',
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  sharpness: 0,
  warmth: 0,
};

const PRESET_KEY = 'photo-batch-master-presets';

// ─────────────────── Canvas image processing ───────────────────
async function applyPresetToFile(file: File, preset: Preset): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Derived multipliers
      const brightnessFactor = 1 + (preset.brightness + preset.exposure * 0.5) / 100;
      const contrastFactor = 1 + preset.contrast / 100;
      const saturationFactor = 1 + preset.saturation / 100;
      const warmthShift = preset.warmth * 0.8;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Warmth: shift red/blue
        r = Math.min(255, Math.max(0, r + warmthShift));
        b = Math.min(255, Math.max(0, b - warmthShift * 0.5));

        // Brightness
        r *= brightnessFactor;
        g *= brightnessFactor;
        b *= brightnessFactor;

        // Contrast
        r = (r - 128) * contrastFactor + 128;
        g = (g - 128) * contrastFactor + 128;
        b = (b - 128) * contrastFactor + 128;

        // Highlights/Shadows: adjust bright/dark pixels
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 160 && preset.highlights !== 0) {
          const adj = preset.highlights * 0.4;
          r += adj; g += adj; b += adj;
        } else if (lum < 80 && preset.shadows !== 0) {
          const adj = preset.shadows * 0.4;
          r += adj; g += adj; b += adj;
        }

        // Saturation (via luminance)
        const lumFinal = 0.299 * r + 0.587 * g + 0.114 * b;
        r = lumFinal + saturationFactor * (r - lumFinal);
        g = lumFinal + saturationFactor * (g - lumFinal);
        b = lumFinal + saturationFactor * (b - lumFinal);

        data[i]     = Math.min(255, Math.max(0, Math.round(r)));
        data[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
        data[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
      }

      // Sharpness via simple unsharp mask (lightweight 3x3 convolution)
      if (preset.sharpness !== 0) {
        const sharpData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const src = new Uint8ClampedArray(data);
        const w = canvas.width;
        const h = canvas.height;
        const amount = preset.sharpness / 100;
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            for (let c = 0; c < 3; c++) {
              const idx = (y * w + x) * 4 + c;
              const orig = src[idx];
              const blurred = (
                src[((y - 1) * w + (x - 1)) * 4 + c] +
                src[((y - 1) * w + x) * 4 + c] +
                src[((y - 1) * w + (x + 1)) * 4 + c] +
                src[(y * w + (x - 1)) * 4 + c] +
                orig * 4 +
                src[(y * w + (x + 1)) * 4 + c] +
                src[((y + 1) * w + (x - 1)) * 4 + c] +
                src[((y + 1) * w + x) * 4 + c] +
                src[((y + 1) * w + (x + 1)) * 4 + c]
              ) / 12;
              sharpData.data[idx] = Math.min(255, Math.max(0, orig + amount * (orig - blurred) * 5));
            }
          }
        }
        ctx.putImageData(sharpData, 0, 0);
      } else {
        ctx.putImageData(imageData, 0, 0);
      }

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to export canvas'));
      }, 'image/jpeg', 0.92);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load error')); };
    img.src = url;
  });
}

// ─────────────────── Slider component ───────────────────
interface SliderRowProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}
function SliderRow({ label, value, onChange, min = -100, max = 100 }: SliderRowProps) {
  return (
    <div className={s.sliderRow}>
      <div className={s.sliderLabel}>
        <span>{label}</span>
        <span className={s.sliderVal}>{value > 0 ? `+${value}` : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        className={s.slider}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

// ─────────────────── Main Page ───────────────────
export default function PhotoBatchMasterPage() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  // ── Preset state ──
  const [preset, setPreset] = useState<Preset>(() => {
    if (typeof window === 'undefined') return DEFAULT_PRESET;
    try {
      const saved = localStorage.getItem(PRESET_KEY);
      if (saved) {
        const list: Preset[] = JSON.parse(saved);
        return list[0] ?? DEFAULT_PRESET;
      }
    } catch {}
    return DEFAULT_PRESET;
  });
  const [savedPresets, setSavedPresets] = useState<Preset[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(PRESET_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [presetName, setPresetName] = useState(preset.name);

  // ── Sample preview state ──
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [sampleUrl, setSampleUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Batch state ──
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const sampleInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);

  // ── Preset sliders ──
  const updatePreset = useCallback((key: keyof Omit<Preset, 'name'>, val: number) => {
    setPreset((prev) => {
      const next = { ...prev, [key]: val };
      // Debounced preview update
      if (sampleFile) {
        if (previewTimer.current) clearTimeout(previewTimer.current);
        previewTimer.current = setTimeout(() => {
          applyPresetToFile(sampleFile, next).then((blob) => {
            const url = URL.createObjectURL(blob);
            setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
          });
        }, 300);
      }
      return next;
    });
  }, [sampleFile]);

  // ── Sample upload ──
  const handleSampleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setSampleFile(file);
    setSampleUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
    setPreviewUrl(null);
  };

  // ── Save preset ──
  const handleSavePreset = () => {
    const named: Preset = { ...preset, name: presetName || 'My Preset' };
    const updated = [named, ...savedPresets.filter((p) => p.name !== named.name)].slice(0, 10);
    setSavedPresets(updated);
    setPreset(named);
    try { localStorage.setItem(PRESET_KEY, JSON.stringify(updated)); } catch {}
  };

  // ── Load preset ──
  const handleLoadPreset = (p: Preset) => {
    setPreset(p);
    setPresetName(p.name);
  };

  // ── Delete preset ──
  const handleDeletePreset = (name: string) => {
    const updated = savedPresets.filter((p) => p.name !== name);
    setSavedPresets(updated);
    try { localStorage.setItem(PRESET_KEY, JSON.stringify(updated)); } catch {}
  };

  // ── Batch add ──
  const addBatchFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const newItems: BatchItem[] = arr.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  // ── Apply all ──
  const handleApplyAll = async () => {
    if (!items.length) return;
    setIsProcessing(true);
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === 'done') continue;
      updated[i] = { ...updated[i], status: 'processing' };
      setItems([...updated]);
      try {
        const blob = await applyPresetToFile(updated[i].file, preset);
        updated[i] = { ...updated[i], status: 'done', resultBlob: blob };
      } catch {
        updated[i] = { ...updated[i], status: 'error' };
      }
      setItems([...updated]);
    }
    setIsProcessing(false);
  };

  // ── Download all as ZIP ──
  const handleDownloadZip = async () => {
    const done = items.filter((it) => it.status === 'done' && it.resultBlob);
    if (!done.length) return;
    const zip = new JSZip();
    done.forEach((it) => {
      const ext = it.file.name.split('.').pop() ?? 'jpg';
      const baseName = it.file.name.replace(/\.[^/.]+$/, '');
      zip.file(`${baseName}_edit.${ext}`, it.resultBlob!);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photo-batch-${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Clear all ──
  const handleClearAll = () => {
    items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    setItems([]);
  };

  const sliders: { key: keyof Omit<Preset, 'name'>; labelKo: string; labelEn: string }[] = [
    { key: 'exposure',   labelKo: '노출',   labelEn: 'Exposure' },
    { key: 'brightness', labelKo: '밝기',   labelEn: 'Brightness' },
    { key: 'contrast',   labelKo: '대비',   labelEn: 'Contrast' },
    { key: 'saturation', labelKo: '채도',   labelEn: 'Saturation' },
    { key: 'highlights', labelKo: '하이라이트', labelEn: 'Highlights' },
    { key: 'shadows',    labelKo: '섀도우', labelEn: 'Shadows' },
    { key: 'sharpness',  labelKo: '선명도', labelEn: 'Sharpness' },
    { key: 'warmth',     labelKo: '색온도', labelEn: 'Warmth' },
  ];

  const doneCount = items.filter((it) => it.status === 'done').length;

  // ── SEO content ──
  const seoKo = {
    title: 'Photo Batch Master — 일괄 사진 보정 & 프리셋 마스터',
    description: '여러 장의 사진을 동일한 밝기·대비·색감으로 한꺼번에 보정하는 전문가용 일괄 편집 도구입니다. 나만의 보정 프리셋을 저장하고 재사용하세요.',
    useCases: [
      { icon: '🛍️', title: '쇼핑몰 상품 사진', desc: '모든 제품 사진의 톤을 일정하게 맞춰 브랜드 통일성을 높입니다.' },
      { icon: '✈️', title: '여행 사진 정리', desc: '수백 장의 여행 사진에 나만의 감성 필터를 한 번에 입힙니다.' },
      { icon: '📸', title: 'SNS 피드 색감 통일', desc: '인스타그램 피드의 색감을 일관성 있게 유지합니다.' },
      { icon: '🎨', title: '프리셋 재사용', desc: '저장한 프리셋을 언제든지 불러와 동일한 스타일로 보정합니다.' },
    ],
    steps: [
      { step: '샘플 사진 업로드 & 프리셋 설정', desc: '샘플 사진 한 장을 올리고 8가지 슬라이더로 원하는 보정값을 맞춰 [프리셋 저장]을 누릅니다.' },
      { step: '사진 일괄 업로드', desc: '보정할 사진들을 드래그 앤 드롭 또는 파일 선택으로 한꺼번에 업로드합니다.' },
      { step: 'Apply All로 일괄 보정', desc: '[Apply All] 버튼을 누르면 저장된 프리셋이 모든 사진에 순차적으로 적용됩니다.' },
      { step: 'ZIP으로 일괄 다운로드', desc: '[Download All (ZIP)] 버튼으로 완성된 사진들을 하나의 ZIP 파일로 내려받습니다.' },
    ],
    faqs: [
      { q: '사진 개수 제한이 있나요?', a: '브라우저 성능에 따라 다르지만 보통 20~30장 정도는 무리 없이 한꺼번에 처리 가능합니다.' },
      { q: '설정값은 어디에 저장되나요?', a: '유저의 브라우저 저장소(localStorage)에 안전하게 저장되어 재방문 시에도 그대로 남아있습니다.' },
      { q: '원본 파일은 안전한가요?', a: '모든 처리는 브라우저 내 캔버스에서만 이루어지며 서버로 업로드되지 않습니다. 원본 파일은 전혀 변경되지 않습니다.' },
      { q: '지원하는 이미지 형식은?', a: 'JPG, PNG, WebP, GIF 등 브라우저가 지원하는 모든 이미지 형식을 사용할 수 있습니다.' },
      { q: '면책 조항', a: '본 도구는 브라우저 기반 캔버스 처리로 제공되며 결과물의 품질은 원본 이미지와 브라우저 환경에 따라 달라질 수 있습니다. 중요한 사진은 원본을 별도 백업 후 사용하시기 바랍니다.' },
    ],
  };

  const seoEn = {
    title: 'Photo Batch Master — Batch Photo Editor & Preset Manager',
    description: 'A professional batch photo editor that applies the same brightness, contrast, and color grading to multiple photos at once. Save your own presets and reuse them anytime.',
    useCases: [
      { icon: '🛍️', title: 'Product Photography', desc: 'Match the tone of all product photos for consistent brand visuals.' },
      { icon: '✈️', title: 'Travel Photo Editing', desc: 'Apply your signature filter to hundreds of travel photos instantly.' },
      { icon: '📸', title: 'Instagram Feed Consistency', desc: 'Keep your social media feed visually cohesive with batch color grading.' },
      { icon: '🎨', title: 'Preset Reuse', desc: 'Save your favorite settings and reload them anytime with one click.' },
    ],
    steps: [
      { step: 'Upload sample & set preset', desc: 'Upload one sample photo, adjust the 8 sliders to your liking, and click [Save Preset].' },
      { step: 'Bulk upload photos', desc: 'Drag and drop or select all the photos you want to edit.' },
      { step: 'Apply All', desc: 'Click [Apply All] to process every photo with your saved preset.' },
      { step: 'Download as ZIP', desc: 'Click [Download All (ZIP)] to get all edited photos in one file.' },
    ],
    faqs: [
      { q: 'Is there a photo limit?', a: 'Typically 20–30 photos can be processed at once depending on your browser and device performance.' },
      { q: 'Where are presets saved?', a: 'Presets are saved to your browser\'s localStorage and persist across visits.' },
      { q: 'Are my original files safe?', a: 'All processing happens locally in the browser canvas — no files are uploaded to any server. Your originals are untouched.' },
      { q: 'What image formats are supported?', a: 'All browser-supported formats including JPG, PNG, WebP, and GIF.' },
      { q: 'Disclaimer', a: 'This tool provides browser-based canvas processing. Output quality may vary depending on the original image and browser environment. Always back up important photos before editing.' },
    ],
  };

  return (
    <div className={s.container}>
      <NavigationActions />

      {/* ── Header ── */}
      <header className={s.header}>
        <div className={s.iconWrap}>
          <Camera size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.title}>
          {isKo ? 'Photo Batch Master' : 'Photo Batch Master'}
        </h1>
        <p className={s.subtitle}>
          {isKo
            ? '일괄 사진 보정 & 프리셋 마스터 — 100장도 1분 안에'
            : 'Batch photo editing & preset manager — 100 photos in 1 minute'}
        </p>
      </header>

      {/* ═══════════════ STEP 1: Preset Setup ═══════════════ */}
      <section className={s.section}>
        <div className={s.sectionTitle}>
          <span className={s.stepBadge}>Step 1</span>
          {isKo ? '프리셋 설정 & 저장' : 'Set & Save Preset'}
        </div>

        <div className={s.step1Grid}>
          {/* Sample upload + preview */}
          <div className={s.sampleArea}>
            <div
              className={s.sampleDropzone}
              onClick={() => sampleInputRef.current?.click()}
            >
              {sampleUrl ? (
                <img
                  src={previewUrl ?? sampleUrl}
                  alt="sample"
                  className={s.sampleImg}
                />
              ) : (
                <div className={s.samplePlaceholder}>
                  <Upload size={32} color="#8b5cf6" />
                  <p>{isKo ? '샘플 사진 업로드' : 'Upload sample photo'}</p>
                  <span>{isKo ? '클릭하여 선택' : 'Click to select'}</span>
                </div>
              )}
              <input
                ref={sampleInputRef}
                type="file"
                accept="image/*"
                className={s.hiddenInput}
                onChange={(e) => e.target.files?.[0] && handleSampleFile(e.target.files[0])}
              />
            </div>
            {previewUrl && (
              <p className={s.previewLabel}>
                {isKo ? '↑ 실시간 미리보기' : '↑ Live preview'}
              </p>
            )}
          </div>

          {/* Sliders */}
          <div className={s.slidersCard}>
            {sliders.map(({ key, labelKo, labelEn }) => (
              <SliderRow
                key={key}
                label={isKo ? labelKo : labelEn}
                value={preset[key] as number}
                onChange={(v) => updatePreset(key, v)}
              />
            ))}

            {/* Preset name + save */}
            <div className={s.presetSaveRow}>
              <input
                type="text"
                className={s.presetNameInput}
                value={presetName}
                placeholder={isKo ? '프리셋 이름' : 'Preset name'}
                onChange={(e) => setPresetName(e.target.value)}
              />
              <button className={s.saveBtn} onClick={handleSavePreset} aria-label={isKo ? '프리셋 저장' : 'Save preset'}>
                <Save size={16} />
                {isKo ? '프리셋 저장' : 'Save Preset'}
              </button>
            </div>

            {/* Reset */}
            <button
              className={s.resetBtn}
              onClick={() => setPreset({ ...DEFAULT_PRESET, name: presetName })}
              aria-label={isKo ? '슬라이더 초기화' : 'Reset sliders'}
            >
              {isKo ? '슬라이더 초기화' : 'Reset Sliders'}
            </button>
          </div>
        </div>

        {/* Saved presets */}
        {savedPresets.length > 0 && (
          <div className={s.savedPresets}>
            <p className={s.savedPresetsTitle}>
              {isKo ? '저장된 프리셋' : 'Saved Presets'}
            </p>
            <div className={s.presetChips}>
              {savedPresets.map((p) => (
                <div
                  key={p.name}
                  className={`${s.presetChip} ${preset.name === p.name ? s.presetChipActive : ''}`}
                >
                  <button
                    className={s.presetChipName}
                    onClick={() => handleLoadPreset(p)}
                    aria-label={`Load preset ${p.name}`}
                  >
                    {p.name}
                  </button>
                  <button
                    className={s.presetChipDelete}
                    onClick={() => handleDeletePreset(p.name)}
                    aria-label={`Delete preset ${p.name}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════ STEP 2: Bulk Upload ═══════════════ */}
      <section className={s.section}>
        <div className={s.sectionTitle}>
          <span className={s.stepBadge}>Step 2</span>
          {isKo ? '사진 일괄 업로드' : 'Bulk Upload'}
        </div>

        <div
          className={`${s.batchDropzone} ${isDragOver ? s.batchDropzoneActive : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files.length) addBatchFiles(e.dataTransfer.files);
          }}
          onClick={() => batchInputRef.current?.click()}
        >
          <FolderOpen size={36} color={isDragOver ? '#8b5cf6' : '#94a3b8'} />
          <p className={s.batchDropText}>
            {isDragOver
              ? (isKo ? '여기에 놓으세요!' : 'Drop here!')
              : (isKo ? '사진을 드래그하거나 클릭하여 선택' : 'Drag photos here or click to select')}
          </p>
          <span className={s.batchDropSub}>
            {isKo ? 'JPG, PNG, WebP 등 여러 장 선택 가능' : 'JPG, PNG, WebP and more — multi-select supported'}
          </span>
          <input
            ref={batchInputRef}
            type="file"
            accept="image/*"
            multiple
            className={s.hiddenInput}
            onChange={(e) => e.target.files && addBatchFiles(e.target.files)}
          />
        </div>

        {/* Action buttons */}
        {items.length > 0 && (
          <div className={s.batchActions}>
            <button
              className={s.applyBtn}
              onClick={handleApplyAll}
              disabled={isProcessing}
              aria-label={isKo ? '전체 적용' : 'Apply all'}
            >
              {isProcessing ? (
                <><Loader2 size={18} className={s.spin} />{isKo ? '처리 중...' : 'Processing...'}</>
              ) : (
                <><Camera size={18} />{isKo ? 'Apply All' : 'Apply All'}</>
              )}
            </button>
            <button
              className={s.zipBtn}
              onClick={handleDownloadZip}
              disabled={doneCount === 0}
              aria-label={isKo ? 'ZIP 다운로드' : 'Download ZIP'}
            >
              <Download size={18} />
              {isKo ? `Download All (ZIP) — ${doneCount}장` : `Download All (ZIP) — ${doneCount}`}
            </button>
            <button
              className={s.clearBtn}
              onClick={handleClearAll}
              aria-label={isKo ? '전체 삭제' : 'Clear all'}
            >
              <Trash2 size={16} />
              {isKo ? '전체 삭제' : 'Clear All'}
            </button>
          </div>
        )}

        {/* Batch item list */}
        {items.length > 0 && (
          <div className={s.itemList}>
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  className={s.itemRow}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <img src={item.previewUrl} alt={item.file.name} className={s.itemThumb} />
                  <div className={s.itemInfo}>
                    <span className={s.itemName}>{item.file.name}</span>
                    <span className={s.itemSize}>
                      {(item.file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <div className={s.itemStatus}>
                    {item.status === 'done' && (
                      <span className={s.statusDone}>
                        <CheckCircle size={16} />
                        {isKo ? 'Success' : 'Success'}
                      </span>
                    )}
                    {item.status === 'processing' && (
                      <span className={s.statusProcessing}>
                        <Loader2 size={16} className={s.spin} />
                        {isKo ? '처리 중' : 'Processing'}
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span className={s.statusError}>Error</span>
                    )}
                    {item.status === 'pending' && (
                      <span className={s.statusPending}>
                        {isKo ? '대기 중' : 'Pending'}
                      </span>
                    )}
                  </div>
                  <button
                    className={s.itemRemove}
                    onClick={() => {
                      URL.revokeObjectURL(item.previewUrl);
                      setItems((prev) => prev.filter((i) => i.id !== item.id));
                    }}
                    aria-label="Remove photo"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ── Ad placeholder ── */}
      <div className={s.adPlaceholder}>AD</div>

      {/* ── Share & Related ── */}
      <ShareBar
        title={isKo ? 'Photo Batch Master — 사진 100장을 1분 안에!' : 'Edit 100 photos in 1 minute! Share this magic tool.'}
        description={isKo ? '일괄 사진 보정 & 프리셋 마스터' : 'Photo Batch Master — Batch photo editing & preset manager'}
      />

      <RelatedTools toolId="utilities/design/photo-batch-master" />

      <SeoSection ko={seoKo} en={seoEn} />
    </div>
  );
}
