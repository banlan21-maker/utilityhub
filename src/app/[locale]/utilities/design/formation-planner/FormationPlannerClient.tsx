'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Download, Undo2, Plus, Trash2, ChevronUp, ChevronDown, Info, Square, Circle } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import s from './formation-planner.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Piece {
  id: string;
  x: number; // 0.0–1.0 fraction of canvas width
  y: number; // 0.0–1.0 fraction of canvas height
  text: string; // '' | '0'–'99' | single alpha
  color: string;
  name: string; // legend label
}

type Background = 'soccer' | 'basketball' | 'volleyball' | 'tennis' | 'stage' | 'grid';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#ffffff', '#1e293b'];
const LEGEND_W = 260;
const MAX_RECORD_SECS = 60;

const BG_OPTIONS: { value: Background; ko: string; en: string }[] = [
  { value: 'soccer',     ko: '⚽ 축구',   en: '⚽ Soccer' },
  { value: 'basketball', ko: '🏀 농구',   en: '🏀 Basketball' },
  { value: 'volleyball', ko: '🏐 배구',   en: '🏐 Volleyball' },
  { value: 'tennis',     ko: '🎾 테니스', en: '🎾 Tennis' },
  { value: 'stage',      ko: '🎭 무대',   en: '🎭 Stage' },
  { value: 'grid',       ko: '📐 모눈',   en: '📐 Grid' },
];

// ─── Canvas helpers ───────────────────────────────────────────────────────────

function getContrast(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#000' : '#fff';
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, bg: Background) {
  ctx.clearRect(0, 0, w, h);

  if (bg === 'soccer') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#2d6a1f'); g.addColorStop(0.5, '#3a8026'); g.addColorStop(1, '#2d6a1f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = Math.max(1.5, w * 0.003);
    const mg = w * 0.06, mh = h * 0.08;
    ctx.strokeRect(mg, mh, w - mg * 2, h - mh * 2);
    ctx.beginPath(); ctx.moveTo(w / 2, mh); ctx.lineTo(w / 2, h - mh); ctx.stroke();
    ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.13, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(w / 2, h / 2, w * 0.007, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fill();
    const gw = (w - mg * 2) * 0.14, gh = (h - mh * 2) * 0.38, gy = (h - gh) / 2;
    ctx.strokeRect(mg, gy, gw, gh); ctx.strokeRect(w - mg - gw, gy, gw, gh);
  }

  else if (bg === 'basketball') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#c8860a'); g.addColorStop(1, '#a06b05');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(0,0,0,0.07)'; ctx.lineWidth = 1;
    for (let y = 0; y < h; y += h / 12) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = Math.max(1.5, w * 0.003);
    const mg = w * 0.05, mh = h * 0.07;
    ctx.strokeRect(mg, mh, w - mg * 2, h - mh * 2);
    ctx.beginPath(); ctx.moveTo(w / 2, mh); ctx.lineTo(w / 2, h - mh); ctx.stroke();
    ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.1, 0, Math.PI * 2); ctx.stroke();
    const kw = (w - mg * 2) * 0.28, kh = (h - mh * 2) * 0.52, ky = (h - kh) / 2;
    ctx.fillStyle = 'rgba(0,0,120,0.12)';
    ctx.fillRect(mg, ky, kw, kh); ctx.strokeRect(mg, ky, kw, kh);
    ctx.fillRect(w - mg - kw, ky, kw, kh); ctx.strokeRect(w - mg - kw, ky, kw, kh);
    const arcR = kh * 0.55;
    ctx.beginPath(); ctx.arc(mg, h / 2, arcR, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(w - mg, h / 2, arcR, Math.PI / 2, -Math.PI / 2); ctx.stroke();
  }

  else if (bg === 'volleyball') {
    ctx.fillStyle = '#e8d5b7'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(60,40,10,0.65)'; ctx.lineWidth = Math.max(1.5, w * 0.003);
    const mg = w * 0.08, mh = h * 0.1;
    ctx.strokeRect(mg, mh, w - mg * 2, h - mh * 2);
    ctx.lineWidth = Math.max(2.5, w * 0.005);
    ctx.beginPath(); ctx.moveTo(w / 2, mh); ctx.lineTo(w / 2, h - mh); ctx.stroke();
    ctx.lineWidth = Math.max(1, w * 0.002); ctx.strokeStyle = 'rgba(60,40,10,0.4)';
    const ao = (w / 2 - mg) * 0.38;
    ctx.beginPath(); ctx.moveTo(w / 2 - ao, mh); ctx.lineTo(w / 2 - ao, h - mh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2 + ao, mh); ctx.lineTo(w / 2 + ao, h - mh); ctx.stroke();
  }

  else if (bg === 'tennis') {
    ctx.fillStyle = '#c2623e'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = Math.max(1.5, w * 0.003);
    const mg = w * 0.06, mh = h * 0.08;
    ctx.strokeRect(mg, mh, w - mg * 2, h - mh * 2);
    const si = (w - mg * 2) * 0.08;
    ctx.beginPath(); ctx.moveTo(mg + si, mh); ctx.lineTo(mg + si, h - mh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w - mg - si, mh); ctx.lineTo(w - mg - si, h - mh); ctx.stroke();
    ctx.lineWidth = Math.max(2, w * 0.005);
    ctx.beginPath(); ctx.moveTo(mg, h / 2); ctx.lineTo(w - mg, h / 2); ctx.stroke();
    ctx.lineWidth = Math.max(1.5, w * 0.003);
    const sb = (h / 2 - mh) * 0.55;
    ctx.beginPath(); ctx.moveTo(mg + si, h / 2 - sb); ctx.lineTo(w - mg - si, h / 2 - sb); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mg + si, h / 2 + sb); ctx.lineTo(w - mg - si, h / 2 + sb); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2, h / 2 - sb); ctx.lineTo(w / 2, h / 2 + sb); ctx.stroke();
  }

  else if (bg === 'stage') {
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
    for (let y = h * 0.08; y < h * 0.52; y += h * 0.055) { ctx.beginPath(); ctx.moveTo(w * 0.04, y); ctx.lineTo(w * 0.96, y); ctx.stroke(); }
    const sg = ctx.createLinearGradient(0, h * 0.5, 0, h);
    sg.addColorStop(0, '#2d2b55'); sg.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = sg; ctx.fillRect(w * 0.05, h * 0.5, w * 0.9, h * 0.44);
    const lights = ['rgba(255,200,100,0.12)', 'rgba(180,100,255,0.12)', 'rgba(100,200,255,0.12)'];
    [w * 0.2, w * 0.5, w * 0.8].forEach((lx, i) => {
      const lg = ctx.createRadialGradient(lx, h * 0.5, 0, lx, h * 0.65, w * 0.22);
      lg.addColorStop(0, lights[i]); lg.addColorStop(1, 'transparent');
      ctx.fillStyle = lg; ctx.fillRect(0, h * 0.45, w, h * 0.55);
    });
    ctx.strokeStyle = 'rgba(255,215,0,0.35)'; ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.05, h * 0.5, w * 0.9, h * 0.44);
    ctx.strokeStyle = 'rgba(255,215,0,0.2)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(w * 0.05, h * 0.5); ctx.quadraticCurveTo(w / 2, h * 0.28, w * 0.95, h * 0.5); ctx.stroke();
  }

  else if (bg === 'grid') {
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, w, h);
    const step = Math.min(w, h) / 16;
    ctx.strokeStyle = 'rgba(148,163,184,0.35)'; ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(100,116,139,0.25)'; ctx.lineWidth = 1.5;
    for (let x = 0; x <= w; x += step * 5) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += step * 5) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  }
}

function drawPieces(ctx: CanvasRenderingContext2D, pieces: Piece[], w: number, h: number, selectedId?: string, draggingId?: string) {
  const r = Math.min(w, h) * 0.046;
  pieces.forEach(piece => {
    const cx = piece.x * w, cy = piece.y * h;
    const isDrag = piece.id === draggingId;
    const isSel = piece.id === selectedId;
    const pr = isDrag ? r * 1.18 : r;
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = isDrag ? 18 : 8; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 3;
    ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2); ctx.fillStyle = piece.color; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2);
    ctx.strokeStyle = isSel ? '#f59e0b' : 'rgba(255,255,255,0.65)'; ctx.lineWidth = isSel ? 3 : 2; ctx.stroke();
    if (piece.text) {
      ctx.fillStyle = getContrast(piece.color);
      ctx.font = `bold ${piece.text.length > 1 ? pr * 0.78 : pr * 0.95}px system-ui,sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(piece.text, cx, cy);
    }
  });
}

function drawPaths(
  ctx: CanvasRenderingContext2D,
  paths: Record<string, { x: number; y: number }[]>,
  pieces: Piece[],
  w: number,
  h: number,
) {
  pieces.forEach(piece => {
    const pts = paths[piece.id];
    if (!pts || pts.length < 2) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x * w, pts[0].y * h);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x * w, pts[i].y * h);
    }
    ctx.strokeStyle = piece.color;
    ctx.lineWidth = Math.max(2, Math.min(w, h) * 0.005);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.7;
    ctx.stroke();
    ctx.restore();
  });
}

function drawLegendCanvas(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, pieces: Piece[], title: string, isKo: boolean) {
  ctx.fillStyle = '#13111e'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#8b5cf6'; ctx.fillRect(x, y, 3, h);
  ctx.fillStyle = '#a78bfa';
  ctx.font = `bold ${Math.max(12, w * 0.058)}px system-ui,sans-serif`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(isKo ? '📋 스마트 범례' : '📋 Smart Legend', x + 14, y + 14);
  if (title) {
    ctx.fillStyle = '#cbd5e1'; ctx.font = `${Math.max(10, w * 0.042)}px system-ui,sans-serif`;
    ctx.fillText(title.length > 20 ? title.slice(0, 20) + '…' : title, x + 14, y + 38);
  }
  ctx.strokeStyle = 'rgba(139,92,246,0.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + 14, y + 56); ctx.lineTo(x + w - 14, y + 56); ctx.stroke();
  if (pieces.length === 0) {
    ctx.fillStyle = '#475569'; ctx.font = `${Math.max(11, w * 0.045)}px system-ui,sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(isKo ? '멤버를 추가하세요' : 'Add pieces', x + w / 2, y + h / 2);
    return;
  }
  const itemH = Math.min(34, (h - 68) / pieces.length);
  const pr = Math.min(12, itemH * 0.38);
  pieces.forEach((piece, i) => {
    const iy = y + 64 + i * itemH;
    if (iy + itemH > y + h - 6) return;
    const cx = x + 20, cy = iy + itemH / 2;
    ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2); ctx.fillStyle = piece.color; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();
    if (piece.text) {
      ctx.fillStyle = getContrast(piece.color);
      ctx.font = `bold ${pr * 0.9}px system-ui,sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(piece.text, cx, cy);
    }
    const nm = piece.name || (isKo ? '(이름 없음)' : '(no name)');
    ctx.fillStyle = piece.name ? '#e2e8f0' : '#4b5563';
    ctx.font = `${Math.max(11, w * 0.047)}px system-ui,sans-serif`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(nm.length > 15 ? nm.slice(0, 15) + '…' : nm, x + 38, cy);
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FormationPlannerClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const dragPosRef = useRef<{ x: number; y: number } | null>(null);
  const pathsRef = useRef<Record<string, { x: number; y: number }[]>>({});
  const showPathRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRunningRef = useRef(false);
  const piecesRef = useRef<Piece[]>([]);
  const titleRef = useRef('');
  const backgroundRef = useRef<Background>('soccer');
  const selectedIdRef = useRef<string | null>(null);

  // State
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [background, setBackground] = useState<Background>('soccer');
  const [title, setTitle] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<Piece[][]>([]);
  const [addText, setAddText] = useState('');
  const [addColor, setAddColor] = useState(COLORS[4]);
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(MAX_RECORD_SECS);
  const [legendOpen, setLegendOpen] = useState(false);
  const [showPath, setShowPath] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Sync refs
  useEffect(() => { piecesRef.current = pieces; }, [pieces]);
  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { backgroundRef.current = background; }, [background]);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
  useEffect(() => { showPathRef.current = showPath; }, [showPath]);
  useEffect(() => { setIsClient(true); }, []);

  // ── Canvas render loop ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !isClient) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dragId = dragRef.current?.id;
        const displayPieces = dragId && dragPosRef.current
          ? piecesRef.current.map(p => p.id === dragId
              ? { ...p, x: dragPosRef.current!.x, y: dragPosRef.current!.y }
              : p)
          : piecesRef.current;
        drawBackground(ctx, canvas.width, canvas.height, backgroundRef.current);
        drawPaths(ctx, pathsRef.current, displayPieces, canvas.width, canvas.height);
        drawPieces(ctx, displayPieces, canvas.width, canvas.height, selectedIdRef.current ?? undefined, dragId);
      }
      rafRef.current = requestAnimationFrame(render);
    };
    render();

    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [isClient]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); doUndo(); }
      if (e.key === 'Escape') setSelectedId(null);
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !(e.target instanceof HTMLInputElement)) {
        doDelete(selectedId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const cx = 'touches' in e ? e.touches[0]?.clientX ?? 0 : (e as React.MouseEvent).clientX;
    const cy = 'touches' in e ? e.touches[0]?.clientY ?? 0 : (e as React.MouseEvent).clientY;
    return { x: (cx - rect.left) / rect.width, y: (cy - rect.top) / rect.height };
  };

  const hitTest = (fx: number, fy: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const r = Math.min(canvas.width, canvas.height) * 0.046;
    for (let i = piecesRef.current.length - 1; i >= 0; i--) {
      const p = piecesRef.current[i];
      const dx = (fx - p.x) * canvas.width, dy = (fy - p.y) * canvas.height;
      if (Math.sqrt(dx * dx + dy * dy) < r * 1.3) return p;
    }
    return null;
  };

  const pushHistory = useCallback((current: Piece[]) => {
    setHistory(h => [...h.slice(-29), current.map(p => ({ ...p }))]);
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const doUndo = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h;
      setPieces(h[h.length - 1]);
      setSelectedId(null);
      return h.slice(0, -1);
    });
  }, []);

  const doDelete = useCallback((id: string) => {
    pushHistory(piecesRef.current);
    setPieces(ps => ps.filter(p => p.id !== id));
    setSelectedId(null);
    delete pathsRef.current[id];
  }, [pushHistory]);

  // Canvas pointer events
  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    const hit = hitTest(pos.x, pos.y);
    if (hit) {
      setSelectedId(hit.id);
      dragRef.current = { id: hit.id, ox: pos.x - hit.x, oy: pos.y - hit.y };
      if (showPathRef.current) {
        if (!pathsRef.current[hit.id]) pathsRef.current[hit.id] = [];
        pathsRef.current[hit.id].push({ x: hit.x, y: hit.y });
      }
    } else {
      setSelectedId(null);
    }
  };

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragRef.current) return;
    const pos = getPos(e);
    const { id, ox, oy } = dragRef.current;
    const nx = Math.max(0.02, Math.min(0.98, pos.x - ox));
    const ny = Math.max(0.02, Math.min(0.98, pos.y - oy));
    dragPosRef.current = { x: nx, y: ny };
    if (showPathRef.current) {
      if (!pathsRef.current[id]) pathsRef.current[id] = [];
      pathsRef.current[id].push({ x: nx, y: ny });
    }
  };

  const onPointerUp = () => {
    if (dragRef.current) {
      if (dragPosRef.current) {
        const { id } = dragRef.current;
        const { x, y } = dragPosRef.current;
        pushHistory(piecesRef.current);
        setPieces(ps => ps.map(p => p.id === id ? { ...p, x, y } : p));
        dragPosRef.current = null;
      }
      dragRef.current = null;
    }
  };

  const handleAddPiece = () => {
    const newPiece: Piece = {
      id: crypto.randomUUID(),
      x: 0.25 + Math.random() * 0.5,
      y: 0.25 + Math.random() * 0.5,
      text: addText.trim().slice(0, 2),
      color: addColor,
      name: '',
    };
    pushHistory(piecesRef.current);
    setPieces(ps => [...ps, newPiece]);
    setSelectedId(newPiece.id);
  };

  const handleUpdateName = (id: string, name: string) => {
    setPieces(ps => ps.map(p => p.id === id ? { ...p, name } : p));
  };

  // ── Export image ─────────────────────────────────────────────────────────────
  const handleExportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const exp = document.createElement('canvas');
    exp.width = canvas.width + LEGEND_W;
    exp.height = canvas.height;
    const ctx = exp.getContext('2d')!;
    ctx.drawImage(canvas, 0, 0);
    if (title) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, canvas.width, 34);
      ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(title, canvas.width / 2, 17);
    }
    drawLegendCanvas(ctx, canvas.width, 0, LEGEND_W, canvas.height, pieces, title, isKo);
    const a = document.createElement('a');
    a.download = `formation-${Date.now()}.png`;
    a.href = exp.toDataURL('image/png');
    a.click();
  };

  // ── Recording ────────────────────────────────────────────────────────────────
  const handleStopRecord = useCallback(() => {
    if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    animRunningRef.current = false;
    setRecording(false);
    setRecordSecs(MAX_RECORD_SECS);
  }, []);

  const handleStartRecord = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || recording) return;
    if (typeof MediaRecorder === 'undefined') {
      alert(isKo ? '이 브라우저는 녹화를 지원하지 않습니다.' : 'Recording is not supported in this browser.');
      return;
    }
    const recCanvas = document.createElement('canvas');
    recCanvas.width = canvas.width + LEGEND_W;
    recCanvas.height = canvas.height;

    animRunningRef.current = true;
    const drawFrame = () => {
      if (!animRunningRef.current) return;
      const c = canvasRef.current;
      if (c) {
        const rctx = recCanvas.getContext('2d')!;
        rctx.drawImage(c, 0, 0);
        drawLegendCanvas(rctx, c.width, 0, LEGEND_W, c.height, piecesRef.current, titleRef.current, isKo);
      }
      requestAnimationFrame(drawFrame);
    };
    drawFrame();

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : 'video/webm';
    const stream = recCanvas.captureStream(30);
    const mr = new MediaRecorder(stream, { mimeType });
    chunksRef.current = [];
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      animRunningRef.current = false;
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `formation-${Date.now()}.webm`; a.click();
      URL.revokeObjectURL(url);
    };
    mr.start(100);
    mediaRecorderRef.current = mr;
    setRecording(true);
    setRecordSecs(MAX_RECORD_SECS);

    recordTimerRef.current = setInterval(() => {
      setRecordSecs(t => {
        if (t <= 1) {
          if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
          if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
          animRunningRef.current = false;
          setRecording(false);
          return MAX_RECORD_SECS;
        }
        return t - 1;
      });
    }, 1000);
  }, [recording, isKo]);

  const handleClearPaths = () => { pathsRef.current = {}; };

  // ── Legend type helper ────────────────────────────────────────────────────────
  const getLegendPrefix = (text: string, color: string) => {
    if (!text) return { type: 'color' as const, label: '' };
    if (/^\d+$/.test(text)) return { type: 'number' as const, label: text };
    return { type: 'alpha' as const, label: text };
  };

  if (!isClient) return null;

  return (
    <div className={s.container}>
      <NavigationActions />

      {/* Header */}
      <div className={s.header}>
        <div className={s.iconWrap}><Circle size={44} color="#8b5cf6" /></div>
        <h1 className={s.title}>{isKo ? '🕴️ Formation Playmaker Pro' : '🕴️ Formation Playmaker Pro'}</h1>
        <p className={s.subtitle}>
          {isKo ? '스마트 범례로 완성하는 하이엔드 전술 시뮬레이터 — 60초 녹화 지원' : 'High-end tactics simulator with Smart Legend — 60s recording'}
        </p>
      </div>

      {/* Title + Background selector */}
      <div className={s.topControls}>
        <input
          className={s.titleInput}
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={isKo ? '전술 제목을 입력하세요 (예: 2026 월드컵 결승전 전술)' : 'Enter tactic title (e.g. World Cup Final Formation)'}
          maxLength={50}
        />
        <div className={s.bgSelector}>
          {BG_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`${s.bgBtn} ${background === opt.value ? s.bgBtnActive : ''}`}
              onClick={() => setBackground(opt.value)}
              aria-label={opt.ko}
            >
              {isKo ? opt.ko : opt.en}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className={s.mainLayout}>
        {/* Board */}
        <div className={s.boardOuter}>
          <div className={s.boardContainer} ref={containerRef}>
            <canvas
              ref={canvasRef}
              className={s.canvas}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={e => { e.preventDefault(); onPointerDown(e); }}
              onTouchMove={e => { e.preventDefault(); onPointerMove(e); }}
              onTouchEnd={onPointerUp}
              aria-label={isKo ? '전술 보드 캔버스' : 'Tactics board canvas'}
            />
            {selectedId && (
              <button
                className={s.deleteFloat}
                onClick={() => doDelete(selectedId)}
                aria-label={isKo ? '선택한 말 삭제' : 'Delete selected piece'}
              >
                <Trash2 size={14} /> {isKo ? '삭제' : 'Delete'}
              </button>
            )}
          </div>

          {/* Toolbar */}
          <div className={s.toolbar}>
            {/* Add piece controls */}
            <div className={s.addSection}>
              <input
                className={s.textInput}
                type="text"
                value={addText}
                onChange={e => setAddText(e.target.value.slice(0, 2))}
                placeholder={isKo ? '숫자/문자' : 'Num/Char'}
                maxLength={2}
                aria-label={isKo ? '아이콘 텍스트 입력' : 'Icon text'}
              />
              <div className={s.colorRow}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    className={`${s.colorDot} ${addColor === c ? s.colorDotActive : ''}`}
                    style={{ background: c, border: c === '#ffffff' ? '1px solid #94a3b8' : undefined }}
                    onClick={() => setAddColor(c)}
                    aria-label={`color ${c}`}
                  />
                ))}
              </div>
              <button className={s.addBtn} onClick={handleAddPiece} aria-label={isKo ? '말 추가' : 'Add piece'}>
                <Plus size={16} /> {isKo ? '추가' : 'Add'}
              </button>
            </div>

            <div className={s.actionRow}>
              <button className={s.actionBtn} onClick={doUndo} aria-label={isKo ? '되돌리기' : 'Undo'}>
                <Undo2 size={16} /> {isKo ? '되돌리기' : 'Undo'}
              </button>
              <button className={s.actionBtn} onClick={handleExportImage} aria-label={isKo ? '이미지 저장' : 'Save image'}>
                <Download size={16} /> {isKo ? '이미지 저장' : 'Save Image'}
              </button>
              <label className={`${s.actionBtn} ${showPath ? s.actionBtnActive : ''}`} style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showPath}
                  onChange={e => setShowPath(e.target.checked)}
                  style={{ width: 14, height: 14, accentColor: '#8b5cf6', cursor: 'pointer' }}
                />
                {isKo ? '경로 표시' : 'Show Path'}
              </label>
              {showPath && (
                <button className={s.actionBtn} onClick={handleClearPaths} aria-label={isKo ? '경로 지우기' : 'Clear paths'}>
                  {isKo ? '경로 지우기' : 'Clear Paths'}
                </button>
              )}
              <div className={s.recordGroup}>
                <button
                  className={`${s.recordBtn} ${recording ? s.recordBtnActive : ''}`}
                  onClick={recording ? handleStopRecord : handleStartRecord}
                  aria-label={recording ? (isKo ? '녹화 중지' : 'Stop recording') : (isKo ? '녹화 시작' : 'Start recording')}
                >
                  {recording
                    ? <><Square size={14} /> {recordSecs}s</>
                    : <><span className={s.recDot} /> {isKo ? '녹화' : 'Record'}</>}
                </button>
                <div className={s.tooltipWrap}>
                  <button
                    className={s.infoBtn}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onFocus={() => setShowTooltip(true)}
                    onBlur={() => setShowTooltip(false)}
                    aria-label="Recording info"
                  >
                    <Info size={14} />
                  </button>
                  {showTooltip && (
                    <div className={s.tooltip}>
                      {isKo
                        ? '브라우저에서 직접 인코딩하는 방식으로, 파일 크기와 성능 안정성을 위해 최대 60초로 제한됩니다.'
                        : 'Encoded directly in your browser. Limited to 60s for file size and performance stability.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Legend — PC */}
        <div className={s.legendPanel}>
          <div className={s.legendHeader}>
            <span>📋 {isKo ? '스마트 범례' : 'Smart Legend'}</span>
            <span className={s.legendCount}>{pieces.length}</span>
          </div>
          {pieces.length === 0 ? (
            <p className={s.legendEmpty}>{isKo ? '말을 추가하면 자동으로 범례가 생성됩니다.' : 'Add pieces to auto-generate the legend.'}</p>
          ) : (
            <div className={s.legendList}>
              {pieces.map(piece => {
                const { label } = getLegendPrefix(piece.text, piece.color);
                return (
                  <div key={piece.id} className={`${s.legendItem} ${selectedId === piece.id ? s.legendItemSelected : ''}`} onClick={() => setSelectedId(piece.id)}>
                    <div className={s.legendIcon} style={{ background: piece.color, border: piece.color === '#ffffff' ? '1px solid #94a3b8' : 'none' }}>
                      {label && <span style={{ color: getContrast(piece.color), fontSize: label.length > 1 ? '0.6rem' : '0.75rem', fontWeight: 700 }}>{label}</span>}
                    </div>
                    <input
                      className={s.legendInput}
                      type="text"
                      value={piece.name}
                      onChange={e => handleUpdateName(piece.id, e.target.value)}
                      placeholder={isKo ? '이름 입력...' : 'Enter name...'}
                      maxLength={20}
                      onClick={e => e.stopPropagation()}
                    />
                    <button className={s.legendDelete} onClick={e => { e.stopPropagation(); doDelete(piece.id); }} aria-label="Delete">
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile legend drawer */}
      <div className={s.drawerTrigger}>
        <button className={s.drawerToggle} onClick={() => setLegendOpen(o => !o)} aria-label={isKo ? '범례 보기' : 'View legend'}>
          {legendOpen ? <><ChevronDown size={16} /> {isKo ? '범례 닫기 ▼' : 'Close Legend ▼'}</> : <><ChevronUp size={16} /> {isKo ? `범례 보기 ▲ (${pieces.length}명)` : `Legend ▲ (${pieces.length})`}</>}
        </button>
      </div>

      {legendOpen && (
        <div className={s.drawer}>
          <div className={s.drawerHandle} />
          <div className={s.drawerHeader}>
            <span>📋 {isKo ? '스마트 범례' : 'Smart Legend'}</span>
            <button onClick={() => setLegendOpen(false)} className={s.drawerClose} aria-label="Close"><ChevronDown size={18} /></button>
          </div>
          {pieces.length === 0 ? (
            <p className={s.legendEmpty}>{isKo ? '말을 추가하면 자동으로 범례가 생성됩니다.' : 'Add pieces to see the legend here.'}</p>
          ) : (
            <div className={s.drawerList}>
              {pieces.map(piece => {
                const { label } = getLegendPrefix(piece.text, piece.color);
                return (
                  <div key={piece.id} className={s.legendItem}>
                    <div className={s.legendIcon} style={{ background: piece.color, border: piece.color === '#ffffff' ? '1px solid #94a3b8' : 'none' }}>
                      {label && <span style={{ color: getContrast(piece.color), fontSize: label.length > 1 ? '0.6rem' : '0.75rem', fontWeight: 700 }}>{label}</span>}
                    </div>
                    <input
                      className={s.legendInput}
                      type="text"
                      value={piece.name}
                      onChange={e => handleUpdateName(piece.id, e.target.value)}
                      placeholder={isKo ? '이름 입력...' : 'Enter name...'}
                      maxLength={20}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <ShareBar
        title={isKo ? 'Formation Playmaker Pro — 스마트 범례 전술 보드' : 'Formation Playmaker Pro — Smart Legend Tactics Board'}
        description={isKo ? '범례 포함 전술을 60초 영상으로 기록하고 팀원과 공유하세요.' : 'Record tactics with legend in 60s video and share with your team.'}
      />
      <RelatedTools toolId="utilities/design/formation-planner" />

      <SeoSection
        ko={{
          title: 'Formation Playmaker Pro — 스마트 범례 & 전술 보드',
          description: '단순한 위치 표시를 넘어, 각 멤버의 이름과 팀명을 범례(Legend)로 정리하고 움직임을 60초 영상으로 기록할 수 있는 하이엔드 전술 시뮬레이터입니다.',
          useCases: [
            { icon: '⚽', title: '스포츠 전술 설계', desc: '축구, 농구, 배구 등 다양한 종목의 포메이션과 전술 동선을 시각화하세요.' },
            { icon: '🎭', title: '무대 & 공연 연출', desc: '공연자 위치와 동선을 무대 배경에서 직관적으로 배치하세요.' },
            { icon: '📋', title: '스마트 범례 관리', desc: '말을 추가하면 이름 입력창이 자동 생성되어 별도 설명 없이도 전술이 이해됩니다.' },
            { icon: '🎥', title: '60초 전술 영상', desc: '동선을 녹화하여 팀원들에게 영상으로 공유하세요. 범례도 영상에 포함됩니다.' },
          ],
          steps: [
            { step: '배경 선택', desc: '축구, 농구, 배구, 테니스, 무대, 모눈종이 중 원하는 배경을 선택하세요.' },
            { step: '멤버 추가', desc: '색상과 번호/문자를 설정하고 [추가] 버튼을 클릭하면 말이 생성되고 범례에 자동 등록됩니다.' },
            { step: '범례 편집', desc: '우측(PC) 또는 하단 드로어(모바일)에서 각 말의 이름을 입력하세요.' },
            { step: '녹화 & 저장', desc: '[녹화] 버튼으로 동선을 60초 영상으로 저장하거나 이미지로 내보내세요.' },
          ],
          faqs: [
            { q: '범례에 몇 명까지 넣을 수 있나요?', a: '화면 구성상 15~20명 내외가 가장 보기 좋게 저장됩니다.' },
            { q: '녹화된 영상에도 범례가 나오나요?', a: '네, 보드와 범례가 통합된 상태로 녹화되어 저장됩니다.' },
            { q: '왜 녹화 시간이 60초로 제한되나요?', a: '본 툴은 별도 서버 없이 브라우저에서 직접 영상을 인코딩합니다. 기기 성능 저하 없이 안정적인 녹화 품질을 보장하기 위해 최대 60초로 설계되었습니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'Formation Playmaker Pro — Smart Legend & Tactics Board',
          description: 'A high-end tactics simulator that organizes each member\'s name as a Smart Legend and records movement as a 60-second video.',
          useCases: [
            { icon: '⚽', title: 'Sports Tactics', desc: 'Visualize formations and movement paths for soccer, basketball, volleyball and more.' },
            { icon: '🎭', title: 'Stage & Performance', desc: 'Arrange performers on a stage background with intuitive drag & drop.' },
            { icon: '📋', title: 'Smart Legend', desc: 'Name inputs auto-generate as you add pieces — no separate explanation needed.' },
            { icon: '🎥', title: '60s Tactic Video', desc: 'Record movement and share as video. Legend is included in the recording.' },
          ],
          steps: [
            { step: 'Choose background', desc: 'Select from soccer, basketball, volleyball, tennis, stage, or grid.' },
            { step: 'Add pieces', desc: 'Set color and number/letter, then click Add. Pieces auto-register in the legend.' },
            { step: 'Edit legend', desc: 'Enter names in the right panel (PC) or bottom drawer (mobile).' },
            { step: 'Record & export', desc: 'Record 60s video or export as image with legend included.' },
          ],
          faqs: [
            { q: 'How many pieces can I add?', a: '15–20 pieces display best when saving as image or video.' },
            { q: 'Does the legend appear in the recording?', a: 'Yes — the board and legend are combined into a single recording.' },
            { q: 'Why is recording limited to 60 seconds?', a: 'The tool encodes video directly in your browser without a server. 60s ensures stable quality on all devices.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        }}
      />
    </div>
  );
}
