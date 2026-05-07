'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Layers, Upload, Download, Trash } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import SeoSection from '@/app/components/SeoSection';
import s from './tile-visualizer.module.css';

const BG_IMAGE_SRC = '/images/tile-visualizer/bathroom-empty.png';
const MASK_IMAGE_SRC = '/images/tile-visualizer/bathroom-mask.png';
const RENDER_W = 1536;
const RENDER_H = 2752;
const REAL_WIDTH_M = 1.8;

const mmToPixel = (mm: number, canvasWidth: number): number => {
  return (mm / 1000) / REAL_WIDTH_M * canvasWidth;
};

const PRESET_ZONES = [
  { id: 'floor',       label: '바닥',    emoji: '⬜', points: [{x:0.3128772232738096,y:0.6616803015960213},{x:0.696177010298577,y:0.6616803015960213},{x:1.0191146261383417,y:0.9008843503212945},{x:0.03370218154317195,y:0.9008843503212945}] },
  { id: 'wall_left',   label: '좌측 벽', emoji: '🧱', points: [{x:0.08048286421154907,y:0.0897804808760901},{x:0.3672031773403121,y:0.3576216340262199},{x:0.3702212858995622,y:0.5900875405338797},{x:0.08651908133004935,y:0.8579286936840096}] },
  { id: 'wall_center', label: '정면 벽', emoji: '🪞', points: [{x:0.3702212858995622,y:0.3593061695806232},{x:0.6584506533079503,y:0.3593061695806232},{x:0.6569415990283253,y:0.657468962710013},{x:0.36418506878106194,y:0.6557844271556097}] },
  { id: 'wall_right',  label: '우측 벽', emoji: '🧱', points: [{x:0.6629778161468255,y:0.3593061695806232},{x:0.9014083923275864,y:0.13778974417658507},{x:0.9044265008868365,y:0.8225534470415395},{x:0.6599597075875754,y:0.632200929393963}] },
];

function bilinear(p: any[], u: number, v: number) {
  const x = (1 - u) * (1 - v) * p[0].x + u * (1 - v) * p[1].x + u * v * p[2].x + (1 - u) * v * p[3].x;
  const y = (1 - u) * (1 - v) * p[0].y + u * (1 - v) * p[1].y + u * v * p[2].y + (1 - u) * v * p[3].y;
  return { x, y };
}

function drawTexturedTriangle(ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, p0: any, p1: any, p2: any, t0: any, t1: any, t2: any) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.closePath();
  ctx.clip();
  
  const delta = t0.x * (t1.y - t2.y) - t1.x * (t0.y - t2.y) + t2.x * (t0.y - t1.y);
  if (Math.abs(delta) > 0.0001) {
    const a = (p0.x * (t1.y - t2.y) - p1.x * (t0.y - t2.y) + p2.x * (t0.y - t1.y)) / delta;
    const b = (p0.y * (t1.y - t2.y) - p1.y * (t0.y - t2.y) + p2.y * (t0.y - t1.y)) / delta;
    const c = (t0.x * (p1.x - p2.x) - t1.x * (p0.x - p2.x) + t2.x * (p0.x - p1.x)) / delta;
    const d = (t0.x * (p1.y - p2.y) - t1.x * (p0.y - p2.y) + t2.x * (p0.y - p1.y)) / delta;
    const e = t0.x * (t1.y * p2.x - t2.y * p1.x) - t1.x * (t0.y * p2.x - t2.y * p0.x) + t2.x * (t0.y * p1.x - t1.y * p0.x);
    const f = t0.x * (t1.y * p2.y - t2.y * p1.y) - t1.x * (t0.y * p2.y - t2.y * p0.y) + t2.x * (t0.y * p1.y - t1.y * p0.y);
    
    ctx.transform(a, b, c, d, e / delta, f / delta);
    ctx.drawImage(img, 0, 0);
  }
  ctx.restore();
}

function drawMappedGrid(ctx: CanvasRenderingContext2D, srcCvs: HTMLCanvasElement, dstPoints: any[], gridRes: number) {
  for (let i = 0; i < gridRes; i++) {
    for (let j = 0; j < gridRes; j++) {
      const u0 = i / gridRes; const v0 = j / gridRes;
      const u1 = (i + 1) / gridRes; const v1 = (j + 1) / gridRes;
      
      const p00 = bilinear(dstPoints, u0, v0);
      const p10 = bilinear(dstPoints, u1, v0);
      const p11 = bilinear(dstPoints, u1, v1);
      const p01 = bilinear(dstPoints, u0, v1);
      
      const sp00 = { x: u0 * srcCvs.width, y: v0 * srcCvs.height };
      const sp10 = { x: u1 * srcCvs.width, y: v0 * srcCvs.height };
      const sp11 = { x: u1 * srcCvs.width, y: v1 * srcCvs.height };
      const sp01 = { x: u0 * srcCvs.width, y: v1 * srcCvs.height };

      drawTexturedTriangle(ctx, srcCvs, p00, p10, p11, sp00, sp10, sp11);
      drawTexturedTriangle(ctx, srcCvs, p00, p11, p01, sp00, sp11, sp01);
    }
  }
}

function projectiveFill(ctx: CanvasRenderingContext2D, img: HTMLImageElement, tileW: number, tileH: number, dstPoints: any[], gridRes: number, W: number, H: number) {
  const patCvs = document.createElement('canvas');
  patCvs.width = W; 
  patCvs.height = H;
  const pCtx = patCvs.getContext('2d')!;
  
  for(let y = 0; y < patCvs.height; y += tileH) {
    for(let x = 0; x < patCvs.width; x += tileW) {
      pCtx.drawImage(img, x, y, tileW, tileH);
    }
  }
  
  drawMappedGrid(ctx, patCvs, dstPoints, gridRes);
}

function drawGroutLines(ctx: CanvasRenderingContext2D, dstPoints: any[], tileW: number, tileH: number, width: number, color: string, gridRes: number, W: number, H: number) {
  const patCvs = document.createElement('canvas');
  patCvs.width = W; 
  patCvs.height = H;
  const pCtx = patCvs.getContext('2d')!;
  
  pCtx.strokeStyle = color;
  pCtx.lineWidth = width * 2;
  pCtx.beginPath();
  for(let y = 0; y < patCvs.height; y += tileH) {
    pCtx.moveTo(0, y); pCtx.lineTo(patCvs.width, y);
  }
  for(let x = 0; x < patCvs.width; x += tileW) {
    pCtx.moveTo(x, 0); pCtx.lineTo(x, patCvs.height);
  }
  pCtx.stroke();
  
  drawMappedGrid(ctx, patCvs, dstPoints, gridRes);
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export default function TileVisualizerClient() {
  const t = useTranslations('TileVisualizer');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [usePreset, setUsePreset] = useState<boolean>(true);
  const [activeZoneId, setActiveZoneId] = useState<string>('floor');
  const [dragPointIndex, setDragPointIndex] = useState<number | null>(null);
  
  const [zones, setZones] = useState(PRESET_ZONES.map(z => ({
    ...z,
    isComplete: false,
    boundsConfirmed: false,
    tileUrl: null as string | null,
    tileSize: 300,
    tileSizeH: 300,
    tileScale: 1.0,
    groutWidth: 2,
    groutColor: '#ffffff',
    opacity: 100
  })));

  // Load saved preset points from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tile-visualizer-presets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setZones(prev => prev.map(z => {
          const match = parsed.find((p: any) => p.id === z.id);
          if (match && match.points) {
            return { ...z, points: match.points };
          }
          return z;
        }));
      } catch (e) {
        console.error("Failed to parse presets", e);
      }
    }
  }, []);

  // Auto-save preset points to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const pointsOnly = zones.map(z => ({ id: z.id, points: z.points }));
      localStorage.setItem('tile-visualizer-presets', JSON.stringify(pointsOnly));
    }, 500);
    return () => clearTimeout(timer);
  }, [zones]);

  const [images, setImages] = useState<{bg: HTMLImageElement | null, mask: HTMLImageElement | null}>({ bg: null, mask: null });

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const bg = await loadImage(BG_IMAGE_SRC);
        const mask = await loadImage(MASK_IMAGE_SRC).catch(() => null);
        setImages({ bg, mask });
      } catch (e) {
        console.error("Failed to load base assets", e);
      }
    };
    loadAssets();
  }, []);

  const drawAllOverlays = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    if (usePreset) return;
    const activeZone = zones.find(z => z.id === activeZoneId);
    if (!activeZone || activeZone.boundsConfirmed) return;

    ctx.beginPath();
    activeZone.points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x * W, p.y * H);
      else ctx.lineTo(p.x * W, p.y * H);
    });
    ctx.closePath();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.fill();

    activeZone.points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#8b5cf6';
      ctx.stroke();
    });
  }, [zones, activeZoneId, usePreset]);

  const renderAll = useCallback(async (isExport = false) => {
    const canvas = canvasRef.current;
    if (!canvas || !images.bg) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const W = canvas.width;
    const H = canvas.height;
    const padX = W * 0.1;
    const padY = H * 0.1;
    const effW = W * 0.8;
    const effH = H * 0.8;

    // Fill canvas background with a neutral color
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // [1층] 배경
    ctx.drawImage(images.bg, padX, padY, effW, effH);

    // 타일이 패딩 영역(배경 이미지 밖)으로 삐져나가지 않도록 클리핑 영역 설정
    ctx.save();
    ctx.beginPath();
    ctx.rect(padX, padY, effW, effH);
    ctx.clip();

    // [2층] 타일
    for (const zone of zones) {
      if (!zone.isComplete || !zone.tileUrl) continue;
      
      try {
        const tileImg = await loadImage(zone.tileUrl);
        const srcPoints = usePreset
          ? PRESET_ZONES.find(pz => pz.id === zone.id)!.points
          : zone.points;
        const dstPoints = srcPoints.map(p => ({ x: p.x * W, y: p.y * H }));
        
        const tileW_px = mmToPixel(zone.tileSize, effW) * zone.tileScale;
        const tileH_px = zone.tileSizeH ? mmToPixel(zone.tileSizeH, effH) * zone.tileScale : tileW_px;

        const offscreen = document.createElement('canvas');
        offscreen.width = W; offscreen.height = H;
        const offCtx = offscreen.getContext('2d')!;

        // polygon 영역으로 클리핑
        offCtx.save();
        offCtx.beginPath();
        dstPoints.forEach((p, idx) => {
          if (idx === 0) offCtx.moveTo(p.x, p.y);
          else offCtx.lineTo(p.x, p.y);
        });
        offCtx.closePath();
        offCtx.clip();

        projectiveFill(offCtx, tileImg, tileW_px, tileH_px, dstPoints, 20, effW, effH);
        if (zone.groutWidth > 0) {
          drawGroutLines(offCtx, dstPoints, tileW_px, tileH_px, zone.groutWidth, zone.groutColor, 20, effW, effH);
        }
        offCtx.restore();

        ctx.globalAlpha = zone.opacity / 100;
        ctx.drawImage(offscreen, 0, 0);
        ctx.globalAlpha = 1.0;
      } catch (e) {
        console.error("Tile render error", e);
      }
    }
    
    // 클리핑 해제
    ctx.restore();

    // [3층] 욕실용품 누끼 오버레이 (최상단)
    if (images.mask) {
      ctx.drawImage(images.mask, padX, padY, effW, effH);
    }

    if (!isExport) {
      drawAllOverlays(ctx, W, H);
    }
  }, [zones, images, drawAllOverlays, usePreset]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) renderAll();
    }, 100);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [zones, images, activeZoneId, renderAll]);

  // Pointer Handlers for Dragging
  const getPointerPos = useCallback((e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e && (e as any).touches.length > 0) {
      clientX = (e as any).touches[0].clientX;
      clientY = (e as any).touches[0].clientY;
    } else {
      clientX = (e as any).clientX;
      clientY = (e as any).clientY;
    }
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height
    };
  }, []);

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (usePreset) return;
    const pos = getPointerPos(e);
    const zone = zones.find(z => z.id === activeZoneId);
    if (!zone || zone.boundsConfirmed) return;
    
    let closestIdx = -1;
    let minDist = 0.05; 
    
    zone.points.forEach((p, idx) => {
      const dist = Math.sqrt(Math.pow(p.x - pos.x, 2) + Math.pow(p.y - pos.y, 2));
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });
    
    if (closestIdx !== -1) {
      setDragPointIndex(closestIdx);
    }
  };

  const handlePointerMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (dragPointIndex === null) return;
    const pos = getPointerPos(e);
    setZones(prev => prev.map(z => {
      if (z.id === activeZoneId) {
        const newPoints = [...z.points];
        newPoints[dragPointIndex] = { x: pos.x, y: pos.y };
        return { ...z, points: newPoints };
      }
      return z;
    }));
  }, [dragPointIndex, activeZoneId, getPointerPos]);

  const handlePointerUp = useCallback(() => {
    setDragPointIndex(null);
  }, []);

  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (dragPointIndex !== null) {
        e.preventDefault();
        handlePointerMove(e);
      }
    };
    const mouseMove = (e: MouseEvent) => handlePointerMove(e);
    const pointerUp = () => handlePointerUp();

    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', pointerUp);
    window.addEventListener('touchend', pointerUp);

    return () => {
      window.removeEventListener('touchmove', preventScroll);
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', pointerUp);
      window.removeEventListener('touchend', pointerUp);
    };
  }, [dragPointIndex, handlePointerMove, handlePointerUp]);

  const handleZoneUpdate = (updates: Partial<typeof zones[0]>) => {
    setZones(prev => prev.map(z => z.id === activeZoneId ? { ...z, ...updates } : z));
  };

  const activeZone = zones.find(z => z.id === activeZoneId)!;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (activeZone.tileUrl) {
      URL.revokeObjectURL(activeZone.tileUrl);
    }

    const newUrl = URL.createObjectURL(file);
    handleZoneUpdate({
      tileUrl: newUrl,
      isComplete: true
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveTile = () => {
    if (activeZone.tileUrl) {
      URL.revokeObjectURL(activeZone.tileUrl);
    }
    handleZoneUpdate({
      tileUrl: null,
      isComplete: false
    });
  };

  const downloadResult = async () => {
    await renderAll(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `tile-simulation-${Date.now()}.png`;
    link.click();
    
    renderAll(false);
  };

  return (
    <div className={s.container}>
      <NavigationActions />
      <header className={s.fin_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Layers size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.fin_title}>{t('title')}</h1>
        <p className={s.fin_subtitle}>{t('description')}</p>
      </header>

      <div className={s.splitLayout}>
        <div className={s.panel}>
          <div className="flex flex-col gap-2 mb-2">
            <h2 className="text-lg font-bold text-slate-800">구역 선택</h2>
            <div className="flex rounded-xl overflow-hidden border border-slate-200 text-sm font-semibold">
              <button
                onClick={() => setUsePreset(true)}
                className={`flex-1 py-2 transition-colors ${usePreset ? 'bg-violet-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                기본 영역
              </button>
              <button
                onClick={() => setUsePreset(false)}
                className={`flex-1 py-2 transition-colors ${!usePreset ? 'bg-violet-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                직접 설정
              </button>
            </div>
          </div>
          <div className={s.zoneButtons}>
            {zones.map(z => (
              <button
                key={z.id}
                className={`${s.zoneButton} ${activeZoneId === z.id ? s.active : ''}`}
                onClick={() => setActiveZoneId(z.id)}
              >
                <span>{z.emoji} {z.label}</span>
                {z.isComplete && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">적용됨</span>}
              </button>
            ))}
          </div>

          <hr className="border-slate-100 my-2" />
          
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-slate-800">{activeZone.emoji} {activeZone.label} 설정</h2>
            <div className="flex gap-2">
              {!usePreset && (
                <button
                  onClick={() => handleZoneUpdate({ boundsConfirmed: !activeZone.boundsConfirmed })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeZone.boundsConfirmed
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                  }`}
                >
                  {activeZone.boundsConfirmed ? '영역 수정' : '영역 확정'}
                </button>
              )}
              {activeZone.isComplete && (
                <button onClick={handleRemoveTile} className={s.deleteBtn} title="타일 제거">
                  <Trash size={16} />
                </button>
              )}
            </div>
          </div>

          {!activeZone.isComplete ? (
            <div className={s.controlGroup}>
              <label className={s.uploadButton}>
                <Upload size={18} />
                타일 이미지 업로드
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className={s.uploadInput}
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          ) : (
            <>
              <div className={s.controlGroup}>
                <div className={s.controlHeader}>
                  <span>타일 가로 크기 (mm)</span>
                  <span>{activeZone.tileSize}mm</span>
                </div>
                <input
                  type="range"
                  min="50" max="1200" step="10"
                  value={activeZone.tileSize}
                  onChange={(e) => handleZoneUpdate({ tileSize: Number(e.target.value) })}
                  className={s.slider}
                />
              </div>

              <div className={s.controlGroup}>
                <div className={s.controlHeader}>
                  <span>타일 세로 크기 (mm)</span>
                  <span>{activeZone.tileSizeH}mm</span>
                </div>
                <input
                  type="range"
                  min="50" max="1200" step="10"
                  value={activeZone.tileSizeH}
                  onChange={(e) => handleZoneUpdate({ tileSizeH: Number(e.target.value) })}
                  className={s.slider}
                />
              </div>

              <div className={s.controlGroup}>
                <div className={s.controlHeader}>
                  <span>줄눈 두께 (px)</span>
                  <span>{activeZone.groutWidth}px</span>
                </div>
                <input
                  type="range"
                  min="0" max="20" step="1"
                  value={activeZone.groutWidth}
                  onChange={(e) => handleZoneUpdate({ groutWidth: Number(e.target.value) })}
                  className={s.slider}
                />
              </div>

              <div className={s.controlGroup}>
                <div className={s.controlHeader}>
                  <span>줄눈 색상</span>
                </div>
                <input
                  type="color"
                  value={activeZone.groutColor}
                  onChange={(e) => handleZoneUpdate({ groutColor: e.target.value })}
                  className={s.colorPicker}
                />
              </div>

              <div className={s.controlGroup}>
                <div className={s.controlHeader}>
                  <span>투명도 (%)</span>
                  <span>{activeZone.opacity}%</span>
                </div>
                <input
                  type="range"
                  min="10" max="100" step="1"
                  value={activeZone.opacity}
                  onChange={(e) => handleZoneUpdate({ opacity: Number(e.target.value) })}
                  className={s.slider}
                />
              </div>
            </>
          )}

          <button onClick={downloadResult} className={s.downloadBtn}>
            <Download size={20} />
            결과 다운로드
          </button>
        </div>

        <div className={s.canvasWrapper}>
          <canvas
            ref={canvasRef}
            width={RENDER_W}
            height={RENDER_H}
            className={s.canvas}
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
          />
        </div>
      </div>

      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="design/tile-visualizer" />
      <div className="w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">
        AD
      </div>
      <SeoSection
        ko={{
          title: t('about_title'),
          description: t('about'),
          useCases: t.raw('use_cases').map((u: any) => ({ icon: u.emoji, title: u.title, desc: u.desc })),
          steps: t.raw('how_to').map((step: string, idx: number) => ({ step: `단계 ${idx + 1}`, desc: step })),
          faqs: t.raw('faq')
        }}
        en={{
          title: t('about_title'),
          description: t('about'),
          useCases: t.raw('use_cases').map((u: any) => ({ icon: u.emoji, title: u.title, desc: u.desc })),
          steps: t.raw('how_to').map((step: string, idx: number) => ({ step: `Step ${idx + 1}`, desc: step })),
          faqs: t.raw('faq')
        }}
      />
    </div>
  );
}
