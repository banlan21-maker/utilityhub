'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Clapperboard, Upload, Download, RefreshCw, ChevronLeft, ChevronRight, X } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import SeoSection from '@/app/components/SeoSection';
import s from './gif-master.module.css';

// ─── Types ───────────────────────────────────────────────────────────────────
type MainTab = 'compress' | 'create';
type CreateSubTab = 'images' | 'text' | 'video';
type TextEffect = 'typing' | 'fadein' | 'bounce' | 'slide' | 'blink';
type SpeedOption = 0.5 | 1 | 2;

interface FrameItem {
  url: string;
  file: File;
  id: string;
}

interface VideoProgress {
  step: 1 | 2;
  current: number;
  total: number;
}

declare global {
  interface Window {
    GIF: new (opts: Record<string, unknown>) => GIFInstance;
    parseGIF: (buffer: ArrayBuffer) => unknown;
    decompressFrames: (gif: unknown, buildPatch: boolean) => GifFrame[];
  }
}
interface GIFInstance {
  addFrame: (canvas: CanvasRenderingContext2D | HTMLCanvasElement, opts?: Record<string, unknown>) => void;
  on: (event: string, cb: (arg: unknown) => void) => void;
  render: () => void;
}
interface GifFrame {
  patch: Uint8ClampedArray;
  dims: { width: number; height: number; left: number; top: number };
  delay: number;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GifMasterClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [libLoaded, setLibLoaded] = useState(false);
  const [libError, setLibError] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>('compress');
  const [createSub, setCreateSub] = useState<CreateSubTab>('images');

  // ── Library Load ──
  useEffect(() => {
    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const el = document.createElement('script');
        el.src = src;
        el.onload = () => resolve();
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/gif.js/dist/gif.js'),
      loadScript('https://cdn.jsdelivr.net/npm/gifuct-js/dist/gifuct-js.min.js'),
    ])
      .then(() => setLibLoaded(true))
      .catch(() => setLibError(true));
  }, []);

  if (libError) {
    return (
      <div className={s.container}>
        <NavigationActions />
        <div className={s.card} style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1rem', color: '#dc2626', fontWeight: 700, marginBottom: '0.5rem' }}>
            {isKo ? '라이브러리 로드에 실패했습니다.' : 'Failed to load required libraries.'}
          </p>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {isKo ? '인터넷 연결을 확인하고 새로고침해주세요.' : 'Check your internet connection and refresh the page.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={s.container}>
      <NavigationActions />

      {/* Header */}
      <header className={s.header}>
        <div className={s.header_icon}>
          <Clapperboard size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.title}>{isKo ? 'GIF 마스터' : 'GIF Master'}</h1>
        <p className={s.subtitle}>
          {isKo
            ? 'GIF 압축·생성 통합 툴 — 이미지·텍스트·동영상을 GIF로'
            : 'All-in-one GIF tool — compress, create from images, text, or video'}
        </p>
      </header>

      {/* Main Tabs */}
      <div className={s.main_tabs} role="tablist">
        {([['compress', isKo ? '🗜️ GIF 압축' : '🗜️ GIF Compress'], ['create', isKo ? '✨ GIF 생성' : '✨ GIF Create']] as const).map(([t, label]) => (
          <button
            key={t}
            role="tab"
            aria-selected={mainTab === t}
            onClick={() => setMainTab(t)}
            className={`${s.main_tab} ${mainTab === t ? s.main_tab_active : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {mainTab === 'compress' && <CompressTab isKo={isKo} libLoaded={libLoaded} />}
      {mainTab === 'create' && (
        <CreateTab isKo={isKo} libLoaded={libLoaded} sub={createSub} setSub={setCreateSub} />
      )}

      {/* Bottom sections */}
      <ShareBar
        title={isKo ? 'GIF 마스터' : 'GIF Master'}
        description={isKo
          ? 'GIF 압축, 이미지·텍스트·동영상→GIF 통합 툴'
          : 'All-in-one GIF compressor & generator'}
      />
      <RelatedTools toolId="utility/gif-master" />
      <div className="w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">AD</div>
      <SeoSection
        ko={{
          title: 'GIF 마스터란?',
          description: 'GIF 마스터는 GIF 파일과 관련된 모든 작업을 하나의 툴에서 해결할 수 있는 통합 GIF 편집 도구입니다. 별도 프로그램 설치나 회원가입 없이 브라우저에서 바로 사용할 수 있으며, 모든 파일 처리는 사용자의 기기 안에서만 이루어져 개인정보 유출 걱정이 없습니다. GIF 압축 기능으로는 품질 슬라이더를 조절해 원하는 수준으로 용량을 줄일 수 있고, 배속 조절 기능으로 GIF의 재생 속도를 0.5배~2배까지 변경할 수 있으며, 압축 전후 용량과 품질을 나란히 비교해 확인할 수 있습니다. GIF 생성 기능으로는 여러 장의 이미지를 하나의 GIF로 합치거나, 텍스트를 입력해 타이핑·페이드·바운스 등 다양한 애니메이션 효과가 적용된 GIF를 만들거나, MP4 동영상의 원하는 구간을 GIF로 변환할 수 있습니다. SNS·블로그·발표 자료·이메일 서명 등 다양한 곳에 바로 활용할 수 있습니다.',
          useCases: [
            { icon: '📱', title: 'SNS·메신저 최적화', desc: '카카오톡·인스타그램·트위터 등 SNS에 올릴 GIF를 압축해 빠르게 로딩되도록 최적화하거나, 나만의 움짤·스티커를 직접 제작해 개성 있는 콘텐츠를 만드세요.' },
            { icon: '🎬', title: '영상 하이라이트 캡처', desc: '유튜브 영상이나 직접 촬영한 영상에서 재미있는 장면, 반응, 하이라이트 구간을 GIF로 캡처해 커뮤니티나 SNS에 바로 공유할 수 있습니다.' },
            { icon: '📊', title: '발표·문서 자료 제작', desc: '파워포인트·노션·이메일에 삽입할 움직이는 설명 자료나 로딩 애니메이션을 텍스트 GIF 또는 이미지 GIF로 빠르게 만들 수 있습니다.' },
            { icon: '🌐', title: '웹사이트 성능 최적화', desc: '웹사이트에 삽입된 무거운 GIF를 압축해 페이지 로딩 속도를 높이고, Core Web Vitals 점수와 사용자 경험을 개선할 수 있습니다.' },
          ],
          steps: [
            { step: '탭 선택', desc: '상단 탭에서 GIF 압축 또는 GIF 생성을 선택합니다. GIF 생성 탭에서는 이미지→GIF, 텍스트→GIF, 동영상→GIF 세 가지 방식 중 원하는 서브탭을 선택하세요.' },
            { step: '파일 업로드', desc: 'GIF 압축은 GIF 파일을 업로드한 후 품질 슬라이더(1~100)를 조정합니다. 숫자가 낮을수록 용량이 작아지고, 높을수록 화질이 선명하게 유지됩니다. 배속 조절로 재생 속도도 변경 가능합니다.' },
            { step: '설정 조정', desc: 'GIF 생성은 이미지·텍스트·동영상을 업로드하거나 입력한 뒤 프레임 간격, 반복 횟수, 출력 크기 등을 설정하고 생성 시작 버튼을 클릭합니다.' },
            { step: '다운로드', desc: '처리가 완료되면 결과 GIF를 미리보기로 확인한 후 다운로드 버튼을 눌러 기기에 저장합니다. 파일명은 자동으로 -gifmaster.gif로 저장됩니다.' },
          ],
          faqs: [
            { q: 'GIF 파일이 너무 커서 업로드가 안 돼요.', a: '현재 GIF 압축은 최대 50MB, GIF 생성의 동영상 변환은 최대 100MB까지 지원합니다. 그보다 큰 파일은 먼저 다른 도구로 분할하거나 해상도를 줄인 뒤 업로드해주세요. 이미지→GIF는 장당 최대 10MB, 최대 20장까지 지원합니다.' },
            { q: '업로드한 파일이 외부 서버로 전송되나요?', a: '아닙니다. GIF 마스터의 모든 처리는 사용자의 브라우저(기기) 안에서만 이루어집니다. 파일이 외부 서버로 전송되거나 저장되는 일은 없으므로 개인 사진, 회사 자료 등 민감한 파일도 안심하고 사용할 수 있습니다.' },
            { q: '동영상→GIF 변환 시 왜 15초 이내로 제한하나요?', a: '브라우저에서 동영상을 GIF로 변환할 때는 초당 N장의 프레임을 Canvas에 그린 뒤 하나씩 합성하는 방식으로 동작합니다. 구간이 길어질수록 처리할 프레임 수가 급격히 늘어나 브라우저가 멈추거나 메모리 부족이 발생할 수 있습니다. 10fps 기준 15초 = 150프레임으로, 대부분의 기기에서 안정적으로 처리할 수 있는 최대치입니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'What is GIF Master?',
          description: 'GIF Master is an all-in-one GIF tool that handles everything from compression to creation — entirely in your browser, with no uploads to any server. The compression feature lets you reduce file size using a quality slider, adjust playback speed from 0.5× to 2×, and compare before/after side by side. The creation suite offers three modes: combine multiple images into an animated GIF, generate text animation GIFs with five effects (typing, fade-in, bounce, slide, blink), and convert any video clip into a GIF using the HTML5 Video API — no FFmpeg or server required. All frame decoding uses gifuct-js for accurate multi-frame extraction, while gif.js handles encoding with worker threads. Your files never leave your device, making it safe for personal photos, company assets, and sensitive content.',
          useCases: [
            { icon: '📱', title: 'SNS Optimization', desc: 'Compress GIFs for faster loading on Instagram, Twitter, and KakaoTalk, or create custom stickers and reaction GIFs to boost your social media presence.' },
            { icon: '🎬', title: 'Video Highlight Clips', desc: 'Capture funny moments, reactions, or highlights from your videos and convert them to shareable GIFs for communities and social platforms.' },
            { icon: '📊', title: 'Presentation Assets', desc: 'Create animated diagrams, loading indicators, or explainer GIFs for PowerPoint, Notion, or email signatures without any design software.' },
            { icon: '🌐', title: 'Web Performance', desc: 'Compress heavy GIFs on your website to improve page load speed, Core Web Vitals scores, and overall user experience.' },
          ],
          steps: [
            { step: 'Choose a Tab', desc: 'Select GIF Compress or GIF Create from the top tabs. In the Create tab, choose a sub-tab: Images → GIF, Text → GIF, or Video → GIF depending on your source material.' },
            { step: 'Upload or Input', desc: 'For compression, upload a GIF and adjust the quality slider (1–100). Lower values reduce file size more aggressively; higher values preserve clarity. Use the speed multiplier to change playback tempo.' },
            { step: 'Configure Settings', desc: 'Set frame delay, loop count, output width, and animation effects. For video conversion, enter the start and end time of the clip you want (max 15 seconds recommended).' },
            { step: 'Download the Result', desc: 'After processing completes, preview the output GIF and click Download. Files are saved automatically with a -gifmaster.gif suffix for easy identification.' },
          ],
          faqs: [
            { q: 'My GIF file is too large to upload. What should I do?', a: 'GIF compression supports files up to 50 MB. Video-to-GIF conversion supports up to 100 MB. For Images-to-GIF, each image can be up to 10 MB with a maximum of 20 images total. If your file exceeds these limits, try resizing or splitting it first using another tool before uploading.' },
            { q: 'Are my uploaded files sent to any server?', a: 'No. All processing happens entirely inside your browser using the Canvas API, HTML5 Video API, and JavaScript libraries. Your files are never transmitted to any external server or stored anywhere — making it completely safe for sensitive personal or business content.' },
            { q: 'Why is the video-to-GIF conversion limited to 15 seconds?', a: 'Converting video to GIF in the browser works by capturing individual frames onto a Canvas, then encoding them one by one. Longer clips produce exponentially more frames, which can exhaust browser memory and cause crashes. At 10 fps, 15 seconds equals 150 frames — the practical limit for stable processing on most devices.' },
            { q: 'Can I use the output GIF commercially?', a: 'Results are provided for reference and general use. For any commercial application involving third-party copyrighted content, please ensure you have the appropriate rights before publishing or distributing the output.' },
          ],
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: GIF 압축
// ═══════════════════════════════════════════════════════════════════════════════
function CompressTab({ isKo, libLoaded }: { isKo: boolean; libLoaded: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [quality, setQuality] = useState(60);
  const [halfFps, setHalfFps] = useState(false);
  const [speed, setSpeed] = useState<SpeedOption>(1);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [resultSize, setResultSize] = useState(0);
  const [isDrag, setIsDrag] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const prevResultUrl = useRef<string>('');

  const handleFile = (f: File) => {
    setError('');
    if (!f.name.toLowerCase().endsWith('.gif')) {
      setError(isKo ? 'GIF 파일만 업로드 가능합니다.' : 'Only GIF files are supported.');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError(isKo ? '파일 크기가 너무 큽니다 (최대 50MB).' : 'File too large (max 50MB).');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResultUrl('');
    setProgress(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (prevResultUrl.current) URL.revokeObjectURL(prevResultUrl.current);
    setFile(null); setPreviewUrl(''); setResultUrl(''); setProgress(0); setError('');
  };

  const handleCompress = async () => {
    if (!file || !libLoaded) return;
    setProcessing(true); setProgress(0); setError('');
    if (prevResultUrl.current) { URL.revokeObjectURL(prevResultUrl.current); prevResultUrl.current = ''; }

    const fileUrl = URL.createObjectURL(file);
    try {
      const resp = await fetch(fileUrl);
      const buffer = await resp.arrayBuffer();
      const parsedGif = window.parseGIF(buffer);
      const frames = window.decompressFrames(parsedGif, true);
      if (!frames || frames.length === 0) throw new Error('No frames');

      const mappedQuality = Math.max(1, Math.floor(31 - (quality / 100) * 30));
      const gif = new window.GIF({
        workers: 2,
        quality: mappedQuality,
        workerScript: 'https://cdn.jsdelivr.net/npm/gif.js/dist/gif.worker.js',
      });

      const canvas = document.createElement('canvas');
      canvas.width = frames[0].dims.width;
      canvas.height = frames[0].dims.height;
      const ctx = canvas.getContext('2d')!;
      const delayMult = 1 / speed;

      frames.forEach((frame, idx) => {
        if (halfFps && idx % 2 !== 0) return;
        const imageData = new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.drawImage(canvas, 0, 0);
        const patchCanvas = document.createElement('canvas');
        patchCanvas.width = frame.dims.width; patchCanvas.height = frame.dims.height;
        patchCanvas.getContext('2d')!.putImageData(imageData, 0, 0);
        tempCtx.drawImage(patchCanvas, frame.dims.left, frame.dims.top);
        const adjustedDelay = Math.max(20, Math.round(frame.delay * delayMult));
        gif.addFrame(tempCtx, { delay: adjustedDelay, copy: true });
        ctx.drawImage(tempCanvas, 0, 0);
      });

      gif.on('progress', (p) => setProgress(Math.round((p as number) * 100)));
      gif.on('finished', (blob) => {
        URL.revokeObjectURL(fileUrl);
        const b = blob as Blob;
        const url = URL.createObjectURL(b);
        prevResultUrl.current = url;
        setResultUrl(url);
        setResultSize(b.size);
        setProcessing(false);
      });
      gif.render();
    } catch {
      URL.revokeObjectURL(fileUrl);
      setError(isKo ? '변환 중 오류가 발생했습니다. 다시 시도해주세요.' : 'An error occurred. Please try again.');
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${file.name.replace(/\.gif$/i, '')}-gifmaster.gif`;
    a.click();
  };

  const origKB = file ? (file.size / 1024).toFixed(1) : '0';
  const resKB  = (resultSize / 1024).toFixed(1);
  const saved  = file && resultSize ? Math.round((1 - resultSize / file.size) * 100) : 0;
  const savingsClass = saved < 30 ? s.savings_low : saved < 60 ? s.savings_mid : s.savings_high;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Upload */}
      <div className={s.card}>
        <p className={s.card_title}>{isKo ? '1. GIF 파일 업로드' : '1. Upload GIF'}</p>
        {!file ? (
          <div
            className={`${s.upload_zone} ${isDrag ? s.upload_zone_drag : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
            onDragLeave={() => setIsDrag(false)}
            onDrop={handleDrop}
            role="button"
            aria-label={isKo ? 'GIF 파일 업로드' : 'Upload GIF file'}
          >
            <div className={s.upload_icon}><Upload size={36} /></div>
            <p className={s.upload_text}>{isKo ? '클릭하거나 GIF를 드래그하세요' : 'Click or drag a GIF here'}</p>
            <p className={s.upload_hint}>{isKo ? 'GIF 파일만 허용 · 최대 50MB' : 'GIF only · Max 50MB'}</p>
          </div>
        ) : (
          <div className={s.preview_wrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="preview" className={s.preview_img} />
            <div className={s.preview_meta}>
              <span>📁 {file.name}</span>
              <span>💾 {Number(origKB) > 1024 ? `${(file.size / 1048576).toFixed(1)}MB` : `${origKB}KB`}</span>
            </div>
          </div>
        )}
        <input ref={inputRef} type="file" accept=".gif" style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {error && <p className={s.error_msg} style={{ marginTop: '0.75rem' }}>{error}</p>}
      </div>

      {/* Settings */}
      {file && !resultUrl && (
        <div className={s.card}>
          <p className={s.card_title}>{isKo ? '2. 압축 설정' : '2. Compression Settings'}</p>
          <div className={s.settings_grid} style={{ marginBottom: '1rem' }}>
            <div className={s.field}>
              <label className={s.label}>{isKo ? `품질: ${quality}` : `Quality: ${quality}`}</label>
              <div className={s.slider_row}>
                <input type="range" min={1} max={100} value={quality} className={s.slider}
                  onChange={e => setQuality(Number(e.target.value))} aria-label="quality" />
                <span className={s.slider_val}>{quality}</span>
              </div>
              <span className={s.hint}>{quality <= 30 ? (isKo ? '최대 압축' : 'Max compress') : quality <= 70 ? (isKo ? '균형 (권장)' : 'Balanced (rec.)') : (isKo ? '고품질' : 'High quality')}</span>
            </div>
            <div className={s.field}>
              <label className={s.label}>{isKo ? '배속 조절' : 'Playback Speed'}</label>
              <div className={s.radio_group}>
                {([0.5, 1, 2] as SpeedOption[]).map(v => (
                  <button key={v} onClick={() => setSpeed(v)}
                    className={`${s.radio_btn} ${speed === v ? s.radio_btn_active : ''}`}
                    aria-label={`${v}x speed`}>
                    {v}×
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className={s.field} style={{ marginBottom: '1.25rem' }}>
            <label className={s.label}>{isKo ? '프레임 레이트' : 'Frame Rate'}</label>
            <div className={s.radio_group}>
              <button onClick={() => setHalfFps(false)} className={`${s.radio_btn} ${!halfFps ? s.radio_btn_active : ''}`}
                aria-label="original fps">
                {isKo ? '원본 유지' : 'Original'}
              </button>
              <button onClick={() => setHalfFps(true)} className={`${s.radio_btn} ${halfFps ? s.radio_btn_active : ''}`}
                aria-label="half fps">
                {isKo ? '절반으로 줄이기' : 'Half FPS'}
              </button>
            </div>
          </div>

          {processing ? (
            <div className={s.progress_wrap}>
              <p className={s.progress_label}>{isKo ? `압축 중... ${progress}%` : `Compressing... ${progress}%`}</p>
              <div className={s.progress_bar_bg}><div className={s.progress_bar_fill} style={{ width: `${progress}%` }} /></div>
            </div>
          ) : (
            <button className={s.btn_primary} onClick={handleCompress} disabled={!libLoaded}
              aria-label={isKo ? '압축 시작' : 'Start compression'}>
              🗜️ {isKo ? '압축 시작' : 'Start Compression'}
            </button>
          )}
        </div>
      )}

      {/* Result */}
      {resultUrl && file && (
        <div className={s.card}>
          <p className={s.card_title}>{isKo ? '3. 압축 결과' : '3. Result'}</p>
          <div className={s.compare_grid}>
            <div className={s.compare_item}>
              <span className={s.compare_label}>{isKo ? '원본' : 'Original'}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="original" className={s.preview_img} style={{ maxHeight: 180 }} />
              <span className={s.compare_size}>{origKB}KB</span>
            </div>
            <div className={s.compare_item}>
              <span className={s.compare_label}>{isKo ? '압축 후' : 'Compressed'}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultUrl} alt="compressed" className={s.preview_img} style={{ maxHeight: 180 }} />
              <span className={s.compare_size}>{resKB}KB</span>
            </div>
          </div>
          <div className={`${s.savings_badge} ${savingsClass}`}>
            {saved}% {isKo ? '감소' : 'reduced'} · {Math.abs(Number(origKB) - Number(resKB)).toFixed(1)}KB {isKo ? '절약' : 'saved'}
          </div>
          <div className={s.btn_row}>
            <button className={s.btn_primary} style={{ flex: 1 }} onClick={download}
              aria-label={isKo ? '다운로드' : 'Download'}>
              <Download size={16} /> {isKo ? '압축 파일 다운로드' : 'Download Compressed GIF'}
            </button>
            <button className={s.btn_secondary} onClick={reset} aria-label={isKo ? '다시 하기' : 'Reset'}>
              <RefreshCw size={14} /> {isKo ? '다시 하기' : 'Reset'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: GIF 생성
// ═══════════════════════════════════════════════════════════════════════════════
function CreateTab({ isKo, libLoaded, sub, setSub }: {
  isKo: boolean; libLoaded: boolean;
  sub: CreateSubTab; setSub: (s: CreateSubTab) => void;
}) {
  const subs: { key: CreateSubTab; label: string }[] = [
    { key: 'images', label: isKo ? '🖼️ 이미지 → GIF' : '🖼️ Images → GIF' },
    { key: 'text',   label: isKo ? '✍️ 텍스트 → GIF' : '✍️ Text → GIF' },
    { key: 'video',  label: isKo ? '🎬 동영상 → GIF' : '🎬 Video → GIF' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className={s.sub_tabs} role="tablist">
        {subs.map(({ key, label }) => (
          <button key={key} role="tab" aria-selected={sub === key}
            className={`${s.sub_tab} ${sub === key ? s.sub_tab_active : ''}`}
            onClick={() => setSub(key)}>
            {label}
          </button>
        ))}
      </div>
      {sub === 'images' && <ImagesTab isKo={isKo} libLoaded={libLoaded} />}
      {sub === 'text'   && <TextTab   isKo={isKo} libLoaded={libLoaded} />}
      {sub === 'video'  && <VideoTab  isKo={isKo} libLoaded={libLoaded} />}
    </div>
  );
}

// ─── Sub A: Images → GIF ──────────────────────────────────────────────────────
function ImagesTab({ isKo, libLoaded }: { isKo: boolean; libLoaded: boolean }) {
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [delay, setDelay] = useState(500);
  const [loops, setLoops] = useState(0);
  const [outWidth, setOutWidth] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const prevResult = useRef('');

  const addFiles = (files: FileList) => {
    setError('');
    const arr = Array.from(files);
    if (frames.length + arr.length > 20) {
      setError(isKo ? '최대 20장까지 추가 가능합니다.' : 'Maximum 20 images allowed.'); return;
    }
    const newFrames: FrameItem[] = arr.filter(f => {
      if (f.size > 10 * 1024 * 1024) return false;
      return true;
    }).map(f => ({ file: f, url: URL.createObjectURL(f), id: `${Date.now()}-${Math.random()}` }));
    setFrames(p => [...p, ...newFrames]);
  };

  const moveFrame = (idx: number, dir: -1 | 1) => {
    setFrames(p => {
      const arr = [...p];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  const removeFrame = (idx: number) => {
    setFrames(p => {
      const arr = [...p];
      URL.revokeObjectURL(arr[idx].url);
      arr.splice(idx, 1);
      return arr;
    });
  };

  const handleGenerate = async () => {
    if (frames.length < 2 || !libLoaded) return;
    setProcessing(true); setProgress(0); setError('');
    if (prevResult.current) { URL.revokeObjectURL(prevResult.current); prevResult.current = ''; }

    try {
      const images: HTMLImageElement[] = await Promise.all(frames.map(f =>
        new Promise<HTMLImageElement>((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = f.url;
        })
      ));

      const targetW = outWidth || images[0].naturalWidth;
      const scale = targetW / images[0].naturalWidth;
      const targetH = Math.round(images[0].naturalHeight * scale);
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(targetW, 640);
      canvas.height = Math.round(targetH * (canvas.width / targetW));
      const ctx = canvas.getContext('2d')!;

      const gif = new window.GIF({
        workers: 2, quality: 10,
        workerScript: 'https://cdn.jsdelivr.net/npm/gif.js/dist/gif.worker.js',
        repeat: loops,
      });

      images.forEach(img => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        gif.addFrame(ctx, { delay, copy: true });
      });

      gif.on('progress', (p) => setProgress(Math.round((p as number) * 100)));
      gif.on('finished', (blob) => {
        const url = URL.createObjectURL(blob as Blob);
        prevResult.current = url;
        setResultUrl(url);
        setProcessing(false);
      });
      gif.render();
    } catch {
      setError(isKo ? '변환 중 오류가 발생했습니다.' : 'An error occurred.');
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl; a.download = 'images-gifmaster.gif'; a.click();
  };

  const reset = () => {
    frames.forEach(f => URL.revokeObjectURL(f.url));
    if (prevResult.current) URL.revokeObjectURL(prevResult.current);
    setFrames([]); setResultUrl(''); setProgress(0); prevResult.current = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className={s.card}>
        <p className={s.card_title}>{isKo ? '이미지 업로드 (최대 20장)' : 'Upload Images (max 20)'}</p>
        <div className={s.upload_zone} onClick={() => inputRef.current?.click()}
          role="button" aria-label={isKo ? '이미지 업로드' : 'Upload images'}>
          <Upload size={28} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
          <p className={s.upload_text}>{isKo ? '클릭하여 이미지 추가' : 'Click to add images'}</p>
          <p className={s.upload_hint}>PNG / JPG / GIF / WebP · {isKo ? '장당 최대 10MB' : 'Max 10MB each'}</p>
        </div>
        <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg,.gif,.webp" multiple style={{ display: 'none' }}
          onChange={e => e.target.files && addFiles(e.target.files)} />
        {error && <p className={s.error_msg} style={{ marginTop: '0.5rem' }}>{error}</p>}

        {frames.length > 0 && (
          <div className={s.frames_grid}>
            {frames.map((fr, i) => (
              <div key={fr.id} className={s.frame_card}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fr.url} alt={`frame ${i+1}`} className={s.frame_img} />
                <span className={s.frame_num}>{i + 1}</span>
                <div className={s.frame_actions}>
                  <button className={s.frame_btn} onClick={() => moveFrame(i, -1)} disabled={i === 0}
                    aria-label="move left"><ChevronLeft size={12} /></button>
                  <button className={s.frame_btn} onClick={() => removeFrame(i)}
                    aria-label="remove frame"><X size={12} /></button>
                  <button className={s.frame_btn} onClick={() => moveFrame(i, 1)} disabled={i === frames.length - 1}
                    aria-label="move right"><ChevronRight size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {frames.length >= 2 && (
        <div className={s.card}>
          <p className={s.card_title}>{isKo ? '설정' : 'Settings'}</p>
          <div className={s.settings_grid}>
            <div className={s.field}>
              <label className={s.label}>{isKo ? `프레임 간격: ${delay}ms (${(delay/1000).toFixed(1)}초)` : `Frame Delay: ${delay}ms`}</label>
              <div className={s.slider_row}>
                <input type="range" min={100} max={2000} step={100} value={delay} className={s.slider}
                  onChange={e => setDelay(Number(e.target.value))} aria-label="frame delay" />
                <span className={s.slider_val}>{delay}</span>
              </div>
            </div>
            <div className={s.field}>
              <label className={s.label}>{isKo ? '반복 설정' : 'Loop'}</label>
              <select className={s.select} value={loops} onChange={e => setLoops(Number(e.target.value))} aria-label="loop count">
                <option value={0}>{isKo ? '무한 반복' : 'Infinite'}</option>
                <option value={1}>{isKo ? '1회' : '1 time'}</option>
                <option value={3}>{isKo ? '3회' : '3 times'}</option>
                <option value={5}>{isKo ? '5회' : '5 times'}</option>
              </select>
            </div>
            <div className={s.field}>
              <label className={s.label}>{isKo ? '출력 크기' : 'Output Size'}</label>
              <select className={s.select} value={outWidth} onChange={e => setOutWidth(Number(e.target.value))} aria-label="output size">
                <option value={0}>{isKo ? '원본 크기 유지' : 'Original size'}</option>
                <option value={480}>480px</option>
                <option value={320}>320px</option>
              </select>
            </div>
          </div>

          {processing ? (
            <div className={s.progress_wrap} style={{ marginTop: '1rem' }}>
              <p className={s.progress_label}>{isKo ? `GIF 생성 중... ${progress}%` : `Generating... ${progress}%`}</p>
              <div className={s.progress_bar_bg}><div className={s.progress_bar_fill} style={{ width: `${progress}%` }} /></div>
            </div>
          ) : resultUrl ? (
            <div style={{ marginTop: '1rem' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultUrl} alt="result" className={s.preview_img} style={{ display: 'block', margin: '0 auto 1rem' }} />
              <div className={s.btn_row}>
                <button className={s.btn_primary} style={{ flex: 1 }} onClick={download}
                  aria-label={isKo ? '다운로드' : 'Download'}>
                  <Download size={16} /> {isKo ? 'GIF 다운로드' : 'Download GIF'}
                </button>
                <button className={s.btn_secondary} onClick={reset} aria-label="reset"><RefreshCw size={14} /></button>
              </div>
            </div>
          ) : (
            <button className={s.btn_primary} style={{ marginTop: '1rem' }} onClick={handleGenerate}
              disabled={!libLoaded} aria-label={isKo ? 'GIF 생성' : 'Generate GIF'}>
              ✨ {isKo ? 'GIF 생성' : 'Generate GIF'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub B: Text → GIF ────────────────────────────────────────────────────────
function TextTab({ isKo, libLoaded }: { isKo: boolean; libLoaded: boolean }) {
  const [text, setText] = useState(isKo ? '안녕하세요!' : 'Hello!');
  const [fontSize, setFontSize] = useState(36);
  const [textColor, setTextColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#8b5cf6');
  const [canvasSize, setCanvasSize] = useState<'320x180' | '480x270' | '640x360'>('480x270');
  const [effect, setEffect] = useState<TextEffect>('typing');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState('');
  const previewRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const prevResult = useRef('');

  const [cw, ch] = canvasSize.split('x').map(Number);

  // Live canvas preview
  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px 'Pretendard', 'Inter', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (effect === 'typing') {
      const shown = text.slice(0, Math.max(1, Math.round((t % 1) * text.length + 1)));
      ctx.fillText(shown, w / 2, h / 2);
    } else if (effect === 'fadein') {
      ctx.globalAlpha = (Math.sin(t * Math.PI) + 1) / 2;
      ctx.fillText(text, w / 2, h / 2);
      ctx.globalAlpha = 1;
    } else if (effect === 'bounce') {
      const y = h / 2 + Math.sin(t * Math.PI * 2) * 20;
      ctx.fillText(text, w / 2, y);
    } else if (effect === 'slide') {
      const x = -w / 2 + t * w;
      ctx.fillText(text, x, h / 2);
    } else if (effect === 'blink') {
      if (Math.floor(t * 6) % 2 === 0) ctx.fillText(text, w / 2, h / 2);
    }
  }, [text, fontSize, textColor, bgColor, effect]);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let start = 0;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const t = ((ts - start) / 2000) % 1;
      drawFrame(ctx, cw, ch, t);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFrame, cw, ch]);

  const effects: { key: TextEffect; label: string }[] = [
    { key: 'typing', label: isKo ? '타이핑' : 'Typing' },
    { key: 'fadein', label: isKo ? '페이드인' : 'Fade In' },
    { key: 'bounce', label: isKo ? '바운스' : 'Bounce' },
    { key: 'slide',  label: isKo ? '슬라이드' : 'Slide' },
    { key: 'blink',  label: isKo ? '깜빡임' : 'Blink' },
  ];

  const getFrames = () => {
    if (effect === 'typing') return text.length;
    if (effect === 'fadein') return 10;
    if (effect === 'bounce') return 20;
    if (effect === 'slide')  return 15;
    return 6; // blink
  };

  const handleGenerate = async () => {
    if (!text.trim() || !libLoaded) return;
    setProcessing(true); setProgress(0);
    if (prevResult.current) { URL.revokeObjectURL(prevResult.current); prevResult.current = ''; }
    cancelAnimationFrame(animRef.current);

    const canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext('2d')!;
    const total = getFrames();
    const gif = new window.GIF({
      workers: 2, quality: 10,
      workerScript: 'https://cdn.jsdelivr.net/npm/gif.js/dist/gif.worker.js',
    });

    for (let i = 0; i < total; i++) {
      drawFrame(ctx, cw, ch, i / total);
      gif.addFrame(ctx, { delay: 80, copy: true });
    }

    gif.on('progress', (p) => setProgress(Math.round((p as number) * 100)));
    gif.on('finished', (blob) => {
      const url = URL.createObjectURL(blob as Blob);
      prevResult.current = url;
      setResultUrl(url);
      setProcessing(false);
    });
    gif.render();
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl; a.download = 'text-gifmaster.gif'; a.click();
  };

  const reset = () => {
    if (prevResult.current) URL.revokeObjectURL(prevResult.current);
    setResultUrl(''); setProgress(0); prevResult.current = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className={s.card}>
        <p className={s.card_title}>{isKo ? '텍스트 입력' : 'Enter Text'}</p>
        <textarea className={s.textarea} maxLength={50} value={text}
          onChange={e => { setText(e.target.value); setResultUrl(''); }}
          placeholder={isKo ? '텍스트를 입력하세요 (최대 50자)' : 'Enter text (max 50 chars)'} />
        <p className={s.char_count}>{text.length} / 50</p>
      </div>

      <div className={s.card}>
        <p className={s.card_title}>{isKo ? '스타일 & 애니메이션' : 'Style & Animation'}</p>
        <div className={s.settings_grid} style={{ marginBottom: '1rem' }}>
          <div className={s.field}>
            <label className={s.label}>{isKo ? `폰트 크기: ${fontSize}px` : `Font Size: ${fontSize}px`}</label>
            <div className={s.slider_row}>
              <input type="range" min={16} max={72} value={fontSize} className={s.slider}
                onChange={e => setFontSize(Number(e.target.value))} aria-label="font size" />
              <span className={s.slider_val}>{fontSize}</span>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.label}>{isKo ? '캔버스 크기' : 'Canvas Size'}</label>
            <select className={s.select} value={canvasSize}
              onChange={e => setCanvasSize(e.target.value as typeof canvasSize)} aria-label="canvas size">
              <option value="320x180">320 × 180</option>
              <option value="480x270">480 × 270</option>
              <option value="640x360">640 × 360</option>
            </select>
          </div>
          <div className={s.field}>
            <label className={s.label}>{isKo ? '텍스트 색상' : 'Text Color'}</label>
            <div className={s.color_row}>
              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                className={s.color_input} aria-label="text color" />
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{textColor}</span>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.label}>{isKo ? '배경 색상' : 'Background Color'}</label>
            <div className={s.color_row}>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                className={s.color_input} aria-label="background color" />
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{bgColor}</span>
            </div>
          </div>
        </div>

        <div className={s.field} style={{ marginBottom: '1rem' }}>
          <label className={s.label}>{isKo ? '애니메이션 효과' : 'Animation Effect'}</label>
          <div className={s.effect_grid}>
            {effects.map(({ key, label }) => (
              <button key={key} onClick={() => { setEffect(key); setResultUrl(''); }}
                className={`${s.effect_btn} ${effect === key ? s.effect_btn_active : ''}`}
                aria-label={label}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className={s.label} style={{ marginBottom: '0.5rem' }}>{isKo ? '실시간 미리보기' : 'Live Preview'}</p>
        <canvas ref={previewRef} width={cw} height={ch} className={s.text_preview_canvas} style={{ maxWidth: '100%' }} />
      </div>

      <div className={s.card}>
        {processing ? (
          <div className={s.progress_wrap}>
            <p className={s.progress_label}>{isKo ? `GIF 생성 중... ${progress}%` : `Generating... ${progress}%`}</p>
            <div className={s.progress_bar_bg}><div className={s.progress_bar_fill} style={{ width: `${progress}%` }} /></div>
          </div>
        ) : resultUrl ? (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resultUrl} alt="result" className={s.preview_img} style={{ display: 'block', margin: '0 auto 1rem' }} />
            <div className={s.btn_row}>
              <button className={s.btn_primary} style={{ flex: 1 }} onClick={download}
                aria-label={isKo ? '다운로드' : 'Download'}>
                <Download size={16} /> {isKo ? 'GIF 다운로드' : 'Download GIF'}
              </button>
              <button className={s.btn_secondary} onClick={reset} aria-label="reset"><RefreshCw size={14} /></button>
            </div>
          </div>
        ) : (
          <button className={s.btn_primary} onClick={handleGenerate} disabled={!libLoaded || !text.trim()}
            aria-label={isKo ? 'GIF 생성' : 'Generate GIF'}>
            ✨ {isKo ? 'GIF 생성 & 다운로드' : 'Generate & Download GIF'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Sub C: Video → GIF ───────────────────────────────────────────────────────
function VideoTab({ isKo, libLoaded }: { isKo: boolean; libLoaded: boolean }) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [fps, setFps] = useState(10);
  const [outputWidth, setOutputWidth] = useState(480);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<VideoProgress | null>(null);
  const [resultUrl, setResultUrl] = useState('');
  const [error, setError] = useState('');
  const [isDrag, setIsDrag] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevResult = useRef('');
  const prevVideoUrl = useRef('');

  const handleFile = (f: File) => {
    setError('');
    if (f.size > 100 * 1024 * 1024) {
      setError(isKo ? '파일 크기가 너무 큽니다 (최대 100MB).' : 'File too large (max 100MB).'); return;
    }
    if (prevVideoUrl.current) URL.revokeObjectURL(prevVideoUrl.current);
    const url = URL.createObjectURL(f);
    prevVideoUrl.current = url;
    setVideoFile(f); setVideoUrl(url); setResultUrl('');
  };

  const handleConvert = async () => {
    if (!videoFile || !libLoaded) return;
    const duration = endTime - startTime;
    if (duration <= 0) { setError(isKo ? '종료 시간이 시작 시간보다 커야 합니다.' : 'End time must be after start time.'); return; }
    if (duration > 15) { setError(isKo ? '15초 이하로 설정해주세요.' : 'Please set a duration of 15 seconds or less.'); return; }

    setProcessing(true); setError('');
    if (prevResult.current) { URL.revokeObjectURL(prevResult.current); prevResult.current = ''; }

    const workingUrl = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    video.src = workingUrl;
    video.muted = true;
    video.playsInline = true;

    try {
      await new Promise<void>(res => video.addEventListener('loadedmetadata', () => res(), { once: true }));

      const maxWidth = Math.min(outputWidth, 640);
      const scale = maxWidth / video.videoWidth;
      const w = maxWidth;
      const h = Math.round(video.videoHeight * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      const gif = new window.GIF({
        workers: 2, quality: 10,
        workerScript: 'https://cdn.jsdelivr.net/npm/gif.js/dist/gif.worker.js',
        width: w, height: h,
      });

      const frameCount = Math.floor(duration * fps);
      for (let i = 0; i < frameCount; i++) {
        video.currentTime = startTime + (i / fps);
        await new Promise<void>(res => video.addEventListener('seeked', () => res(), { once: true }));
        ctx.drawImage(video, 0, 0, w, h);
        gif.addFrame(ctx, { delay: Math.round(1000 / fps), copy: true });
        setProgress({ step: 1, current: i + 1, total: frameCount });
      }

      gif.on('progress', (p) => setProgress({ step: 2, current: Math.round((p as number) * 100), total: 100 }));
      gif.on('finished', (blob) => {
        URL.revokeObjectURL(workingUrl);
        video.src = ''; video.load();
        const url = URL.createObjectURL(blob as Blob);
        prevResult.current = url;
        setResultUrl(url);
        setProcessing(false);
        setProgress(null);
      });
      gif.render();
    } catch {
      URL.revokeObjectURL(workingUrl);
      setError(isKo ? '변환 중 오류가 발생했습니다. 다시 시도해주세요.' : 'An error occurred. Please try again.');
      setProcessing(false); setProgress(null);
    }
  };

  const download = () => {
    if (!resultUrl || !videoFile) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${videoFile.name.replace(/\.[^.]+$/, '')}-gifmaster.gif`;
    a.click();
  };

  const reset = () => {
    if (prevResult.current) URL.revokeObjectURL(prevResult.current);
    if (prevVideoUrl.current) URL.revokeObjectURL(prevVideoUrl.current);
    setVideoFile(null); setVideoUrl(''); setResultUrl('');
    prevResult.current = ''; prevVideoUrl.current = '';
  };

  const progressLabel = progress
    ? progress.step === 1
      ? (isKo ? `STEP 1/2: 프레임 캡처 중... ${progress.current}/${progress.total}` : `STEP 1/2: Capturing frames... ${progress.current}/${progress.total}`)
      : (isKo ? `STEP 2/2: GIF 합성 중... ${progress.current}%` : `STEP 2/2: Encoding GIF... ${progress.current}%`)
    : '';

  const progressPct = progress
    ? progress.step === 1 ? Math.round((progress.current / progress.total) * 50) : 50 + Math.round(progress.current / 2)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className={s.card}>
        <p className={s.card_title}>{isKo ? '동영상 업로드' : 'Upload Video'}</p>
        {!videoFile ? (
          <div className={`${s.upload_zone} ${isDrag ? s.upload_zone_drag : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
            onDragLeave={() => setIsDrag(false)}
            onDrop={e => { e.preventDefault(); setIsDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            role="button" aria-label={isKo ? '동영상 업로드' : 'Upload video'}>
            <Upload size={32} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
            <p className={s.upload_text}>{isKo ? 'MP4·WebM·MOV 파일 업로드' : 'Upload MP4 / WebM / MOV'}</p>
            <p className={s.upload_hint}>{isKo ? '최대 100MB' : 'Max 100MB'}</p>
          </div>
        ) : (
          <video ref={videoRef} src={videoUrl} controls className={s.video_player} playsInline muted />
        )}
        <input ref={inputRef} type="file" accept=".mp4,.webm,.mov" style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {videoFile && (
          <p className={s.info_msg} style={{ marginTop: '0.75rem' }}>
            💡 {isKo ? '10초 이내 구간을 선택하면 더 좋은 결과를 얻을 수 있어요' : '10 seconds or less gives the best results'}
          </p>
        )}
        {error && <p className={s.error_msg} style={{ marginTop: '0.5rem' }}>{error}</p>}
      </div>

      {videoFile && !resultUrl && (
        <div className={s.card}>
          <p className={s.card_title}>{isKo ? '구간 및 출력 설정' : 'Clip & Output Settings'}</p>
          <div className={s.time_row} style={{ marginBottom: '1rem' }}>
            <div className={s.field}>
              <label className={s.label}>{isKo ? '시작 시간 (초)' : 'Start (sec)'}</label>
              <input type="number" className={s.input} value={startTime} min={0} step={0.1}
                onChange={e => setStartTime(Number(e.target.value))} aria-label="start time" />
            </div>
            <div className={s.field}>
              <label className={s.label}>{isKo ? '종료 시간 (초)' : 'End (sec)'}</label>
              <input type="number" className={s.input} value={endTime} min={0} step={0.1}
                onChange={e => setEndTime(Number(e.target.value))} aria-label="end time" />
            </div>
          </div>
          <div className={s.settings_grid} style={{ marginBottom: '1.25rem' }}>
            <div className={s.field}>
              <label className={s.label}>FPS</label>
              <select className={s.select} value={fps} onChange={e => setFps(Number(e.target.value))} aria-label="fps">
                <option value={5}>5 fps ({isKo ? '용량 작음' : 'smaller'})</option>
                <option value={10}>10 fps ({isKo ? '균형 (권장)' : 'balanced'})</option>
                <option value={15}>15 fps ({isKo ? '자연스러움' : 'smoother'})</option>
              </select>
            </div>
            <div className={s.field}>
              <label className={s.label}>{isKo ? '출력 너비' : 'Output Width'}</label>
              <select className={s.select} value={outputWidth} onChange={e => setOutputWidth(Number(e.target.value))} aria-label="output width">
                <option value={320}>320px</option>
                <option value={480}>480px</option>
                <option value={640}>640px</option>
              </select>
            </div>
          </div>

          {processing ? (
            <div className={s.progress_wrap}>
              <p className={s.progress_label}>{progressLabel}</p>
              <div className={s.progress_bar_bg}><div className={s.progress_bar_fill} style={{ width: `${progressPct}%` }} /></div>
            </div>
          ) : (
            <button className={s.btn_primary} onClick={handleConvert} disabled={!libLoaded}
              aria-label={isKo ? 'GIF 변환 시작' : 'Start GIF Conversion'}>
              🎬 {isKo ? 'GIF 변환 시작' : 'Start GIF Conversion'}
            </button>
          )}
        </div>
      )}

      {resultUrl && (
        <div className={s.card}>
          <p className={s.card_title}>{isKo ? '변환 결과' : 'Result'}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resultUrl} alt="result gif" className={s.preview_img} style={{ display: 'block', margin: '0 auto 1rem' }} />
          <div className={s.btn_row}>
            <button className={s.btn_primary} style={{ flex: 1 }} onClick={download}
              aria-label={isKo ? '다운로드' : 'Download'}>
              <Download size={16} /> {isKo ? 'GIF 다운로드' : 'Download GIF'}
            </button>
            <button className={s.btn_secondary} onClick={reset} aria-label="reset"><RefreshCw size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
