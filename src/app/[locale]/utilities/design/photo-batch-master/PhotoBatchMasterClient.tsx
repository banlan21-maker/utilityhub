'use client';

import { useState, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Upload, Save, Download, Trash2,
  CheckCircle, Loader2, X, FolderOpen, Type, ImageIcon,
} from 'lucide-react';
import JSZip from 'jszip';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './photo-batch-master.module.css';
import { ui } from '@/app/components/ui';

// ─────────────────── Types ───────────────────
interface Preset {
  name: string;
  brightness: number; contrast: number; saturation: number;
  exposure: number; highlights: number; shadows: number;
  sharpness: number; warmth: number;
}

type WMPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface TextWatermark {
  enabled: boolean;
  text: string;
  font: string;
  size: number;       // 1–10 (% of image width)
  color: string;
  opacity: number;    // 0–100
  position: WMPosition;
}

interface ImageWatermark {
  enabled: boolean;
  dataUrl: string | null;
  size: number;       // 5–50 (% of image width)
  opacity: number;    // 0–100
  position: WMPosition;
}

interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  resultBlob?: Blob;
}

// ─────────────────── Constants ───────────────────
const DEFAULT_PRESET: Preset = {
  name: 'My Preset',
  brightness: 0, contrast: 0, saturation: 0,
  exposure: 0, highlights: 0, shadows: 0,
  sharpness: 0, warmth: 0,
};

const DEFAULT_TEXT_WM: TextWatermark = {
  enabled: false, text: '© theutilhub.com',
  font: 'Arial', size: 4, color: '#ffffff', opacity: 70,
  position: 'bottom-right',
};

const DEFAULT_IMAGE_WM: ImageWatermark = {
  enabled: false, dataUrl: null, size: 20, opacity: 70,
  position: 'bottom-right',
};

const PRESET_KEY = 'photo-batch-master-presets';
const WM_KEY = 'photo-batch-master-watermark';

const FONTS = [
  'Arial', 'Georgia', 'Impact', 'Courier New',
  'Trebuchet MS', 'Verdana', 'Times New Roman',
];

const WM_POSITIONS: WMPosition[] = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

// ─────────────────── Watermark helper ───────────────────
function calcXY(
  pos: WMPosition, cw: number, ch: number,
  itemW: number, itemH: number, margin: number,
): [number, number] {
  const col = pos.includes('left') ? 'left' : pos.includes('right') ? 'right' : 'center';
  const row = pos.startsWith('top') ? 'top' : pos.startsWith('bottom') ? 'bottom' : 'middle';
  const x =
    col === 'left'   ? margin :
    col === 'right'  ? cw - itemW - margin :
                       (cw - itemW) / 2;
  const y =
    row === 'top'    ? margin :
    row === 'bottom' ? ch - itemH - margin :
                       (ch - itemH) / 2;
  return [x, y];
}

// ─────────────────── Canvas processing ───────────────────
async function applyPresetToFile(
  file: File,
  preset: Preset,
  textWM: TextWatermark,
  imageWM: ImageWatermark,
): Promise<Blob> {
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

      // ── Preset pixel processing ──
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const brightnessFactor = 1 + (preset.brightness + preset.exposure * 0.5) / 100;
      const contrastFactor   = 1 + preset.contrast   / 100;
      const saturationFactor = 1 + preset.saturation / 100;
      const warmthShift = preset.warmth * 0.8;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i], g = data[i + 1], b = data[i + 2];
        r = Math.min(255, Math.max(0, r + warmthShift));
        b = Math.min(255, Math.max(0, b - warmthShift * 0.5));
        r *= brightnessFactor; g *= brightnessFactor; b *= brightnessFactor;
        r = (r - 128) * contrastFactor + 128;
        g = (g - 128) * contrastFactor + 128;
        b = (b - 128) * contrastFactor + 128;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 160 && preset.highlights !== 0) {
          const adj = preset.highlights * 0.4; r += adj; g += adj; b += adj;
        } else if (lum < 80 && preset.shadows !== 0) {
          const adj = preset.shadows * 0.4; r += adj; g += adj; b += adj;
        }
        const lumF = 0.299 * r + 0.587 * g + 0.114 * b;
        r = lumF + saturationFactor * (r - lumF);
        g = lumF + saturationFactor * (g - lumF);
        b = lumF + saturationFactor * (b - lumF);
        data[i]   = Math.min(255, Math.max(0, Math.round(r)));
        data[i+1] = Math.min(255, Math.max(0, Math.round(g)));
        data[i+2] = Math.min(255, Math.max(0, Math.round(b)));
      }

      if (preset.sharpness !== 0) {
        const sharpData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const src2 = new Uint8ClampedArray(data);
        const w = canvas.width, h = canvas.height, amount = preset.sharpness / 100;
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            for (let c = 0; c < 3; c++) {
              const idx = (y * w + x) * 4 + c;
              const orig = src2[idx];
              const blurred = (
                src2[((y-1)*w+(x-1))*4+c] + src2[((y-1)*w+x)*4+c] + src2[((y-1)*w+(x+1))*4+c] +
                src2[(y*w+(x-1))*4+c] + orig * 4 + src2[(y*w+(x+1))*4+c] +
                src2[((y+1)*w+(x-1))*4+c] + src2[((y+1)*w+x)*4+c] + src2[((y+1)*w+(x+1))*4+c]
              ) / 12;
              sharpData.data[idx] = Math.min(255, Math.max(0, orig + amount * (orig - blurred) * 5));
            }
          }
        }
        ctx.putImageData(sharpData, 0, 0);
      } else {
        ctx.putImageData(imageData, 0, 0);
      }

      const applyWatermarks = () => {
        const margin = Math.round(canvas.width * 0.02);

        // ── Text watermark ──
        if (textWM.enabled && textWM.text.trim()) {
          const fontSize = Math.round(canvas.width * (textWM.size / 100));
          ctx.save();
          ctx.globalAlpha = textWM.opacity / 100;
          ctx.font = `bold ${fontSize}px ${textWM.font}, sans-serif`;
          ctx.fillStyle = textWM.color;
          ctx.textBaseline = 'top';
          const tw = ctx.measureText(textWM.text).width;
          const th = fontSize * 1.2;
          const [tx, ty] = calcXY(textWM.position, canvas.width, canvas.height, tw, th, margin);
          // Subtle shadow for readability
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = fontSize * 0.15;
          ctx.fillText(textWM.text, tx, ty);
          ctx.restore();
        }

        // ── Image watermark ──
        if (imageWM.enabled && imageWM.dataUrl) {
          const wmImg = new Image();
          wmImg.onload = () => {
            const wmW = Math.round(canvas.width * (imageWM.size / 100));
            const wmH = Math.round(wmW * (wmImg.height / wmImg.width));
            const [wx, wy] = calcXY(imageWM.position, canvas.width, canvas.height, wmW, wmH, margin);
            ctx.save();
            ctx.globalAlpha = imageWM.opacity / 100;
            ctx.drawImage(wmImg, wx, wy, wmW, wmH);
            ctx.restore();
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Export failed'));
            }, 'image/jpeg', 0.92);
          };
          wmImg.onerror = () => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Export failed'));
            }, 'image/jpeg', 0.92);
          };
          wmImg.src = imageWM.dataUrl;
        } else {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Export failed'));
          }, 'image/jpeg', 0.92);
        }
      };

      applyWatermarks();
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load error')); };
    img.src = url;
  });
}

// ─────────────────── Sub-components ───────────────────
interface SliderRowProps {
  label: string; value: number;
  onChange: (v: number) => void;
  min?: number; max?: number;
}
function SliderRow({ label, value, onChange, min = -100, max = 100 }: SliderRowProps) {
  return (
    <div className={s.sliderRow}>
      <div className={s.sliderLabel}>
        <span>{label}</span>
        <span className={s.sliderVal}>{value > 0 ? `+${value}` : value}</span>
      </div>
      <input type="range" min={min} max={max} value={value} className={s.slider}
        onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

interface PositionGridProps { value: WMPosition; onChange: (v: WMPosition) => void; }
function PositionGrid({ value, onChange }: PositionGridProps) {
  const labels: Record<WMPosition, string> = {
    'top-left': '↖', 'top-center': '↑', 'top-right': '↗',
    'middle-left': '←', 'center': '●', 'middle-right': '→',
    'bottom-left': '↙', 'bottom-center': '↓', 'bottom-right': '↘',
  };
  return (
    <div className={s.posGrid}>
      {WM_POSITIONS.map((pos) => (
        <button
          key={pos}
          className={`${ui.chip} ${value === pos ? ui.chipActive : ''} ${s.posCell}`}
          onClick={() => onChange(pos)}
          aria-label={pos}
          title={pos}
        >
          {labels[pos]}
        </button>
      ))}
    </div>
  );
}

// ─────────────────── Main Page ───────────────────
export default function PhotoBatchMasterClient({ seo }: { seo?: React.ReactNode }) {
  const locale = useLocale();
  const isKo = locale === 'ko';

  // ── Preset ──
  const [preset, setPreset] = useState<Preset>(() => {
    if (typeof window === 'undefined') return DEFAULT_PRESET;
    try {
      const saved = localStorage.getItem(PRESET_KEY);
      if (saved) return (JSON.parse(saved) as Preset[])[0] ?? DEFAULT_PRESET;
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

  // ── Sample preview ──
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [sampleUrl, setSampleUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Watermark state (localStorage 자동 복원) ──
  const [wmTab, setWmTab] = useState<'text' | 'image'>('text');
  const [textWM, setTextWM] = useState<TextWatermark>(() => {
    if (typeof window === 'undefined') return DEFAULT_TEXT_WM;
    try {
      const saved = localStorage.getItem(WM_KEY);
      if (saved) return JSON.parse(saved).textWM ?? DEFAULT_TEXT_WM;
    } catch {}
    return DEFAULT_TEXT_WM;
  });
  const [imageWM, setImageWM] = useState<ImageWatermark>(() => {
    if (typeof window === 'undefined') return DEFAULT_IMAGE_WM;
    try {
      const saved = localStorage.getItem(WM_KEY);
      if (saved) return JSON.parse(saved).imageWM ?? DEFAULT_IMAGE_WM;
    } catch {}
    return DEFAULT_IMAGE_WM;
  });
  const wmImgInputRef = useRef<HTMLInputElement>(null);

  // ── Batch ──
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const sampleInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);

  // ── Debounced preview refresh ──
  const refreshPreview = useCallback((p: Preset, twm: TextWatermark, iwm: ImageWatermark, file: File | null) => {
    if (!file) return;
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      applyPresetToFile(file, p, twm, iwm).then((blob) => {
        const url = URL.createObjectURL(blob);
        setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
      });
    }, 350);
  }, []);

  const updatePreset = useCallback((key: keyof Omit<Preset, 'name'>, val: number) => {
    setPreset((prev) => {
      const next = { ...prev, [key]: val };
      refreshPreview(next, textWM, imageWM, sampleFile);
      return next;
    });
  }, [sampleFile, textWM, imageWM, refreshPreview]);

  const saveWMToStorage = (twm: TextWatermark, iwm: ImageWatermark) => {
    try { localStorage.setItem(WM_KEY, JSON.stringify({ textWM: twm, imageWM: iwm })); } catch {}
  };

  const updateTextWM = (patch: Partial<TextWatermark>) => {
    setTextWM((prev) => {
      const next = { ...prev, ...patch };
      refreshPreview(preset, next, imageWM, sampleFile);
      saveWMToStorage(next, imageWM);
      return next;
    });
  };

  const updateImageWM = (patch: Partial<ImageWatermark>) => {
    setImageWM((prev) => {
      const next = { ...prev, ...patch };
      refreshPreview(preset, textWM, next, sampleFile);
      saveWMToStorage(textWM, next);
      return next;
    });
  };

  // ── Sample upload ──
  const handleSampleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setSampleFile(file);
    setSampleUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
    setPreviewUrl(null);
  };

  // ── Watermark image upload ──
  const handleWMImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      updateImageWM({ dataUrl, enabled: true });
    };
    reader.readAsDataURL(file);
  };

  // ── Preset CRUD ──
  const handleSavePreset = () => {
    const named: Preset = { ...preset, name: presetName || 'My Preset' };
    const updated = [named, ...savedPresets.filter((p) => p.name !== named.name)].slice(0, 10);
    setSavedPresets(updated); setPreset(named);
    try { localStorage.setItem(PRESET_KEY, JSON.stringify(updated)); } catch {}
  };
  const handleLoadPreset = (p: Preset) => { setPreset(p); setPresetName(p.name); };
  const handleDeletePreset = (name: string) => {
    const updated = savedPresets.filter((p) => p.name !== name);
    setSavedPresets(updated);
    try { localStorage.setItem(PRESET_KEY, JSON.stringify(updated)); } catch {}
  };

  // ── Batch ──
  const addBatchFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    setItems((prev) => [
      ...prev,
      ...arr.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file, previewUrl: URL.createObjectURL(file), status: 'pending' as const,
      })),
    ]);
  };

  const handleApplyAll = async () => {
    if (!items.length) return;
    setIsProcessing(true);
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === 'done') continue;
      updated[i] = { ...updated[i], status: 'processing' };
      setItems([...updated]);
      try {
        const blob = await applyPresetToFile(updated[i].file, preset, textWM, imageWM);
        updated[i] = { ...updated[i], status: 'done', resultBlob: blob };
      } catch {
        updated[i] = { ...updated[i], status: 'error' };
      }
      setItems([...updated]);
    }
    setIsProcessing(false);
  };

  const handleDownloadZip = async () => {
    const done = items.filter((it) => it.status === 'done' && it.resultBlob);
    if (!done.length) return;
    const zip = new JSZip();
    done.forEach((it) => {
      const ext = it.file.name.split('.').pop() ?? 'jpg';
      const base = it.file.name.replace(/\.[^/.]+$/, '');
      zip.file(`${base}_edit.${ext}`, it.resultBlob!);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photo-batch-${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    setItems([]);
  };

  const sliders: { key: keyof Omit<Preset, 'name'>; labelKo: string; labelEn: string }[] = [
    { key: 'exposure',   labelKo: '노출',      labelEn: 'Exposure' },
    { key: 'brightness', labelKo: '밝기',      labelEn: 'Brightness' },
    { key: 'contrast',   labelKo: '대비',      labelEn: 'Contrast' },
    { key: 'saturation', labelKo: '채도',      labelEn: 'Saturation' },
    { key: 'highlights', labelKo: '하이라이트', labelEn: 'Highlights' },
    { key: 'shadows',    labelKo: '섀도우',    labelEn: 'Shadows' },
    { key: 'sharpness',  labelKo: '선명도',    labelEn: 'Sharpness' },
    { key: 'warmth',     labelKo: '색온도',    labelEn: 'Warmth' },
  ];

  const doneCount = items.filter((it) => it.status === 'done').length;

  return (
    <div className={s.container}>
      <NavigationActions />

      {/* ── Header ── */}
      <ToolHeader
        icon={<Camera />}
        title="Photo Batch Master"
        subtitle={isKo
          ? '일괄 사진 보정 · 워터마크 삽입 — 100장도 1분 안에'
          : 'Batch color grading · watermark stamping — 100 photos in 1 minute'}
      />

      {/* ═══════════════ PREVIEW (center, large) ═══════════════ */}
      <section className={`${ui.card} ${s.section}`}>
        <div className={ui.cardTitle}>
          <span className={`${ui.badge} ${ui.violet}`}>Step 1</span>
          {isKo ? '샘플 사진으로 실시간 미리보기' : 'Live Preview with Sample Photo'}
        </div>
        <div className={s.previewCenter}>
          <div className={s.sampleDropzoneLg} onClick={() => !sampleUrl && sampleInputRef.current?.click()}>
            {sampleUrl ? (
              <img src={previewUrl ?? sampleUrl} alt="sample" className={s.sampleImg} />
            ) : (
              <div className={s.samplePlaceholder}>
                <Upload size={40} color="#8b5cf6" />
                <p>{isKo ? '샘플 사진 업로드' : 'Upload a sample photo'}</p>
                <span>{isKo ? '클릭하여 선택 · JPG / PNG / WebP' : 'Click to select · JPG / PNG / WebP'}</span>
              </div>
            )}
            <input ref={sampleInputRef} type="file" accept="image/*" className={s.hiddenInput}
              onChange={(e) => e.target.files?.[0] && handleSampleFile(e.target.files[0])} />
          </div>
          {sampleUrl && (
            <div className={s.previewMeta}>
              <p className={s.previewLabel}>
                ✨ {isKo ? '실시간 미리보기 (보정 + 워터마크 반영)' : 'Live preview (grading + watermark applied)'}
              </p>
              <button className={`${ui.button} ${ui.secondary} ${ui.sm}`} onClick={() => sampleInputRef.current?.click()}>
                <Upload size={12} />{isKo ? '사진 변경' : 'Change photo'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ CONTROLS GRID ═══════════════ */}
      <div className={s.controlsGrid}>

        {/* ── Left: Sliders ── */}
        <section className={`${ui.card} ${s.section}`}>
          <div className={ui.cardTitle}>
            <span className={`${ui.badge} ${ui.violet}`}>Step 2</span>
            {isKo ? '노출 · 색감 보정' : 'Exposure & Color Grading'}
          </div>
          <div className={s.slidersCard}>
            {sliders.map(({ key, labelKo, labelEn }) => (
              <SliderRow key={key} label={isKo ? labelKo : labelEn}
                value={preset[key] as number} onChange={(v) => updatePreset(key, v)} />
            ))}
            <div className={s.presetSaveRow}>
              <input type="text" className={`${ui.input} ${s.presetNameInput}`} value={presetName}
                placeholder={isKo ? '프리셋 이름' : 'Preset name'}
                onChange={(e) => setPresetName(e.target.value)} />
              <button className={`${ui.button} ${ui.primary}`} onClick={handleSavePreset}
                aria-label={isKo ? '프리셋 저장' : 'Save preset'}>
                <Save size={16} />{isKo ? '저장' : 'Save'}
              </button>
            </div>
            <button className={`${ui.button} ${ui.ghost} ${ui.sm} ${s.resetBtn}`}
              onClick={() => { const r = { ...DEFAULT_PRESET, name: presetName }; setPreset(r); refreshPreview(r, textWM, imageWM, sampleFile); }}
              aria-label={isKo ? '슬라이더 초기화' : 'Reset sliders'}>
              {isKo ? '슬라이더 초기화' : 'Reset Sliders'}
            </button>
          </div>
          {savedPresets.length > 0 && (
            <div className={s.savedPresets}>
              <p className={`${ui.label} ${s.savedPresetsTitle}`}>{isKo ? '저장된 프리셋' : 'Saved Presets'}</p>
              <div className={s.presetChips}>
                {savedPresets.map((p) => (
                  <div key={p.name} className={`${s.presetChip} ${preset.name === p.name ? s.presetChipActive : ''}`}>
                    <button className={s.presetChipName} onClick={() => handleLoadPreset(p)}
                      aria-label={`Load preset ${p.name}`}>{p.name}</button>
                    <button className={s.presetChipDelete} onClick={() => handleDeletePreset(p.name)}
                      aria-label={`Delete preset ${p.name}`}><X size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Right: Watermark ── */}
        <section className={`${ui.card} ${s.section}`}>
          <div className={ui.cardTitle}>
            <span className={`${ui.badge} ${ui.violet}`}>Step 3</span>
            {isKo ? '워터마크 설정 (선택)' : 'Watermark Settings (optional)'}
          </div>
          <div className={`${ui.segmented} ${s.wmTabs}`}>
            <button className={`${ui.segment} ${wmTab === 'text' ? ui.segmentActive : ''}`}
              onClick={() => setWmTab('text')}>
              <Type size={15} />
              {isKo ? '텍스트' : 'Text'}
            </button>
            <button className={`${ui.segment} ${wmTab === 'image' ? ui.segmentActive : ''}`}
              onClick={() => setWmTab('image')}>
              <ImageIcon size={15} />
              {isKo ? '이미지' : 'Image'}
            </button>
          </div>

          {wmTab === 'text' && (
            <div className={s.wmPanel}>
              <label className={s.wmToggleRow}>
                <input type="checkbox" checked={textWM.enabled}
                  onChange={(e) => updateTextWM({ enabled: e.target.checked })} />
                <span>{isKo ? '텍스트 워터마크 사용' : 'Enable text watermark'}</span>
              </label>
              <div className={`${s.wmFields} ${!textWM.enabled ? s.wmFieldsDisabled : ''}`}>
                <div className={s.wmFieldRow}>
                  <label className={ui.label}>{isKo ? '워터마크 텍스트' : 'Text'}</label>
                  <input type="text" className={ui.input} value={textWM.text}
                    placeholder="© My Brand"
                    onChange={(e) => updateTextWM({ text: e.target.value })} />
                </div>
                <div className={s.wmFieldRow}>
                  <label className={ui.label}>{isKo ? '폰트' : 'Font'}</label>
                  <div className={ui.chips}>
                    {FONTS.map((f) => (
                      <button key={f}
                        className={`${ui.chip} ${ui.pill} ${textWM.font === f ? ui.chipActive : ''}`}
                        style={{ fontFamily: f }}
                        onClick={() => updateTextWM({ font: f })}
                        aria-label={f}>{f}</button>
                    ))}
                  </div>
                </div>
                <div className={s.wmFieldRow}>
                  <label className={ui.label}>{isKo ? '크기 (이미지 너비의 %)' : 'Size (% of width)'}</label>
                  <SliderRow label="" value={textWM.size} min={1} max={15}
                    onChange={(v) => updateTextWM({ size: v })} />
                </div>
                <div className={s.wmFieldRow}>
                  <label className={ui.label}>{isKo ? '색상' : 'Color'}</label>
                  <div className={s.colorRow}>
                    <input type="color" className={s.colorPicker} value={textWM.color}
                      onChange={(e) => updateTextWM({ color: e.target.value })} />
                    <div className={s.colorPresets}>
                      {['#ffffff', '#000000', '#ffff00', '#ff0000', '#8b5cf6'].map((c) => (
                        <button key={c} className={`${s.colorDot} ${textWM.color === c ? s.colorDotActive : ''}`}
                          style={{ background: c, border: c === '#ffffff' ? '1.5px solid var(--border)' : undefined }}
                          onClick={() => updateTextWM({ color: c })} aria-label={c} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className={s.wmFieldRow}>
                  <label className={ui.label}>{isKo ? '불투명도' : 'Opacity'} — {textWM.opacity}%</label>
                  <SliderRow label="" value={textWM.opacity} min={10} max={100}
                    onChange={(v) => updateTextWM({ opacity: v })} />
                </div>
                <div className={s.wmFieldRow}>
                  <label className={ui.label}>{isKo ? '위치' : 'Position'}</label>
                  <PositionGrid value={textWM.position} onChange={(v) => updateTextWM({ position: v })} />
                </div>
              </div>
            </div>
          )}

          {wmTab === 'image' && (
            <div className={s.wmPanel}>
              <label className={s.wmToggleRow}>
                <input type="checkbox" checked={imageWM.enabled}
                  onChange={(e) => updateImageWM({ enabled: e.target.checked })} />
                <span>{isKo ? '이미지 워터마크 사용' : 'Enable image watermark'}</span>
              </label>
              <div className={`${s.wmFields} ${!imageWM.enabled ? s.wmFieldsDisabled : ''}`}>
                <div className={s.wmFieldRow}>
                  <label className={ui.label}>{isKo ? '워터마크 이미지' : 'Watermark image'}</label>
                  <div className={s.wmImgUpload}>
                    {imageWM.dataUrl ? (
                      <div className={s.wmImgPreviewWrap}>
                        <img src={imageWM.dataUrl} alt="wm" className={s.wmImgPreview} />
                        <button className={s.wmImgRemove}
                          onClick={() => updateImageWM({ dataUrl: null, enabled: false })}
                          aria-label="Remove watermark image"><X size={14} /></button>
                      </div>
                    ) : (
                      <button className={s.wmImgSelectBtn}
                        onClick={() => wmImgInputRef.current?.click()}
                        aria-label={isKo ? '워터마크 이미지 선택' : 'Select watermark image'}>
                        <Upload size={20} color="#8b5cf6" />
                        <span>{isKo ? 'PNG 로고 업로드 (투명 배경 권장)' : 'Upload PNG logo (transparent bg recommended)'}</span>
                      </button>
                    )}
                    <input ref={wmImgInputRef} type="file" accept="image/*" className={s.hiddenInput}
                      onChange={(e) => e.target.files?.[0] && handleWMImageFile(e.target.files[0])} />
                  </div>
                </div>
                <div className={s.wmFieldRow}>
                  <label className={ui.label}>{isKo ? '크기 (이미지 너비의 %)' : 'Size (% of width)'}</label>
                  <SliderRow label="" value={imageWM.size} min={5} max={50}
                    onChange={(v) => updateImageWM({ size: v })} />
                </div>
                <div className={s.wmFieldRow}>
                  <label className={ui.label}>{isKo ? '불투명도' : 'Opacity'} — {imageWM.opacity}%</label>
                  <SliderRow label="" value={imageWM.opacity} min={10} max={100}
                    onChange={(v) => updateImageWM({ opacity: v })} />
                </div>
                <div className={s.wmFieldRow}>
                  <label className={ui.label}>{isKo ? '위치' : 'Position'}</label>
                  <PositionGrid value={imageWM.position} onChange={(v) => updateImageWM({ position: v })} />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ═══════════════ STEP 4: Bulk Upload ═══════════════ */}
      <section className={`${ui.card} ${s.section}`}>
        <div className={ui.cardTitle}>
          <span className={`${ui.badge} ${ui.violet}`}>Step 4</span>
          {isKo ? '사진 일괄 업로드 & 처리' : 'Bulk Upload & Process'}
        </div>

        <div
          className={`${s.batchDropzone} ${isDragOver ? s.batchDropzoneActive : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files.length) addBatchFiles(e.dataTransfer.files); }}
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
          <input ref={batchInputRef} type="file" accept="image/*" multiple className={s.hiddenInput}
            onChange={(e) => e.target.files && addBatchFiles(e.target.files)} />
        </div>

        {items.length > 0 && (
          <div className={s.batchActions}>
            <button className={`${ui.button} ${ui.primary}`} onClick={handleApplyAll} disabled={isProcessing}
              aria-label={isKo ? '전체 적용' : 'Apply all'}>
              {isProcessing
                ? <><Loader2 size={18} className={s.spin} />{isKo ? '처리 중...' : 'Processing...'}</>
                : <><Camera size={18} />{isKo ? 'Apply All' : 'Apply All'}</>}
            </button>
            <button className={`${ui.button} ${ui.green}`} onClick={handleDownloadZip} disabled={doneCount === 0}
              aria-label={isKo ? 'ZIP 다운로드' : 'Download ZIP'}>
              <Download size={18} />
              {isKo ? `Download All (ZIP) — ${doneCount}장` : `Download All (ZIP) — ${doneCount}`}
            </button>
            <button className={`${ui.button} ${ui.danger}`} onClick={handleClearAll}
              aria-label={isKo ? '전체 삭제' : 'Clear all'}>
              <Trash2 size={16} />{isKo ? '전체 삭제' : 'Clear All'}
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div className={s.itemList}>
            <AnimatePresence>
              {items.map((item) => (
                <motion.div key={item.id} className={s.itemRow}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                  <img src={item.previewUrl} alt={item.file.name} className={s.itemThumb} />
                  <div className={s.itemInfo}>
                    <span className={s.itemName}>{item.file.name}</span>
                    <span className={s.itemSize}>{(item.file.size / 1024).toFixed(0)} KB</span>
                  </div>
                  <div className={s.itemStatus}>
                    {item.status === 'done' && <span className={s.statusDone}><CheckCircle size={16} />Success</span>}
                    {item.status === 'processing' && <span className={s.statusProcessing}><Loader2 size={16} className={s.spin} />{isKo ? '처리 중' : 'Processing'}</span>}
                    {item.status === 'error' && <span className={s.statusError}>Error</span>}
                    {item.status === 'pending' && <span className={s.statusPending}>{isKo ? '대기 중' : 'Pending'}</span>}
                  </div>
                  <button className={s.itemRemove}
                    onClick={() => { URL.revokeObjectURL(item.previewUrl); setItems((prev) => prev.filter((i) => i.id !== item.id)); }}
                    aria-label="Remove photo"><X size={14} /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>


      <ShareBar
        title={isKo ? 'Photo Batch Master — 사진 100장을 1분 안에!' : 'Edit 100 photos in 1 minute! Share this magic tool.'}
        description={isKo ? '일괄 사진 보정 & 워터마크 삽입' : 'Photo Batch Master — Batch photo editing & watermark stamping'}
      />
      <RelatedTools toolId="utilities/design/photo-batch-master" />
      {seo}
    </div>
  );
}
