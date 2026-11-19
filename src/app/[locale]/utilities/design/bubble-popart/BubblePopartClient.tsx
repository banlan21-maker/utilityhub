'use client';

// 버블 팝아트 글씨 생성기 — 입력·미리보기·다운로드만 (제목·설명·FAQ는 page.tsx 서버 렌더)
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { Download, Check } from 'lucide-react';
import { ui } from '@/app/components/ui';
import {
  FONTS, FONT_CSS, PRESETS, SIZE_PRESETS, MAX_CHARS, MAX_LINES, SIZE_MIN, SIZE_MAX, KERNING_MIN, KERNING_MAX,
  clampText, countChars, fontCss, isDarkBg, luminance, render, a4Dpi, sanitizeDesign,
  type Design, type RenderInfo, type BgKind, type DecoKind, type DecoAmount, type ShadowMode, type ShadowDir,
  type FillMode, type ShapeKind, type ArchKind,
} from '@/lib/bubblePopart';
import s from './bubble-popart.module.css';

const T = {
  ko: {
    preview: '버블 팝아트 미리보기',
    loading: '폰트 불러오는 중…',
    shrunk: (n: number) => `이미지에 맞게 글자 크기를 ${n}px로 줄였어요`,
    preset: '스타일 프리셋',
    presetHint: '누르면 전체 분위기가 바뀌고, 아래 옵션으로 하나씩 다시 바꿀 수 있어요.',
    text: '텍스트',
    textPh: '최대 3줄 · 20자 (Enter로 줄바꿈)',
    font: '폰트',
    fontNote: '모두 Google Fonts 무료 상업용 폰트(OFL)',
    fill: '글씨 채우기',
    fills: { multi: '멀티컬러', single: '단색', gradient: '그라데이션' } as Record<FillMode, string>,
    gradTop: '위', gradBottom: '아래',
    outline: '외곽선',
    outlines: { 1: '한 겹', 2: '두 겹' } as Record<1 | 2, string>,
    outerColor: '바깥', innerColor: '안쪽',
    thickness: '두께',
    thin: '얇게', thick: '두껍게',
    autoWhite: '어두운 배경이라 검은 외곽선을 흰색으로 바꿔 그려요.',
    depth: '입체 효과',
    shadows: { none: '없음', drop: '그림자', extrude: '3D 두께' } as Record<ShadowMode, string>,
    dirs: { bl: '↙ 왼쪽 아래', b: '↓ 아래', br: '↘ 오른쪽 아래' } as Record<ShadowDir, string>,
    shadowColor: '그림자 색',
    auto: '자동',
    sticker: '스티커 테두리', glow: '네온 빛 번짐', highlight: '광택 하이라이트', zigzag: '지그재그 회전',
    bg: '배경',
    bgs: { solid: '단색', gradient: '그라데이션', dots: '망점', rays: '햇살', check: '체크', stripes: '줄무늬', transparent: '투명' } as Record<BgKind, string>,
    bgColor: '배경색', bgColor2: '두 번째 색',
    transparentHint: '투명 PNG로 저장돼요. 미리보기의 회색 격자는 투명 부분 표시이고 파일에는 들어가지 않아요.',
    deco: '장식',
    decos: { none: '없음', stars: '⭐ 별', hearts: '❤ 하트', sparkles: '✦ 반짝이', notes: '♪ 음표', mixed: '섞기' } as Record<DecoKind, string>,
    amounts: { few: '적게', normal: '보통', many: '많이' } as Record<DecoAmount, string>,
    shape: '배경 도형',
    shapes: { none: '없음', bubble: '말풍선', burst: '펑!' } as Record<ShapeKind, string>,
    shapeColor: '도형 색',
    arch: '아치형 글자',
    arches: { none: '반듯하게', up: '위로 둥글게', down: '아래로 둥글게' } as Record<ArchKind, string>,
    size: '크기와 간격',
    fontSize: '글자 크기', kerning: '자간', narrow: '좁게', wide: '넓게',
    output: '출력 크기',
    sizes: { square: '정사각형', landscape: '가로형 16:9', portrait: '세로형 9:16', a4: 'A4' } as Record<string, string>,
    scale: '다운로드 배율',
    scaleNote: (w: number, h: number, dpi: number | null) =>
      `${w.toLocaleString()} × ${h.toLocaleString()}px로 저장${dpi ? ` · A4 인쇄 시 약 ${dpi}dpi${dpi >= 280 ? ' (인쇄용 품질)' : dpi >= 180 ? ' (가까이 보면 살짝 거칠어요)' : ' (화면용 — 인쇄엔 3배 권장)'}` : ''}`,
    download: 'PNG 다운로드',
    done: '저장했어요',
    custom: '직접 선택',
  },
  en: {
    preview: 'Bubble pop art preview',
    loading: 'Loading font…',
    shrunk: (n: number) => `Text was scaled down to ${n}px to fit the image`,
    preset: 'Style presets',
    presetHint: 'Pick one to change the whole look, then fine-tune any option below.',
    text: 'Text',
    textPh: 'Up to 3 lines · 20 characters (Enter for a new line)',
    font: 'Font',
    fontNote: 'All free for commercial use (Google Fonts, OFL)',
    fill: 'Letter fill',
    fills: { multi: 'Multicolor', single: 'Single', gradient: 'Gradient' } as Record<FillMode, string>,
    gradTop: 'Top', gradBottom: 'Bottom',
    outline: 'Outline',
    outlines: { 1: 'Single', 2: 'Double' } as Record<1 | 2, string>,
    outerColor: 'Outer', innerColor: 'Inner',
    thickness: 'Thickness',
    thin: 'Thin', thick: 'Thick',
    autoWhite: 'Dark background: the black outline is drawn in white so it stays visible.',
    depth: 'Depth effect',
    shadows: { none: 'None', drop: 'Shadow', extrude: '3D depth' } as Record<ShadowMode, string>,
    dirs: { bl: '↙ Down-left', b: '↓ Down', br: '↘ Down-right' } as Record<ShadowDir, string>,
    shadowColor: 'Shadow color',
    auto: 'Auto',
    sticker: 'Sticker border', glow: 'Neon glow', highlight: 'Glossy highlight', zigzag: 'Zigzag tilt',
    bg: 'Background',
    bgs: { solid: 'Solid', gradient: 'Gradient', dots: 'Halftone', rays: 'Sunburst', check: 'Checker', stripes: 'Stripes', transparent: 'Transparent' } as Record<BgKind, string>,
    bgColor: 'Background', bgColor2: 'Second color',
    transparentHint: 'Saved as a transparent PNG. The grey checkerboard only marks transparency in the preview.',
    deco: 'Decorations',
    decos: { none: 'None', stars: '⭐ Stars', hearts: '❤ Hearts', sparkles: '✦ Sparkles', notes: '♪ Notes', mixed: 'Mixed' } as Record<DecoKind, string>,
    amounts: { few: 'Few', normal: 'Normal', many: 'Many' } as Record<DecoAmount, string>,
    shape: 'Backdrop shape',
    shapes: { none: 'None', bubble: 'Speech bubble', burst: 'Burst!' } as Record<ShapeKind, string>,
    shapeColor: 'Shape color',
    arch: 'Arched text',
    arches: { none: 'Straight', up: 'Arch up', down: 'Arch down' } as Record<ArchKind, string>,
    size: 'Size & spacing',
    fontSize: 'Font size', kerning: 'Letter spacing', narrow: 'Tight', wide: 'Wide',
    output: 'Output size',
    sizes: { square: 'Square', landscape: 'Landscape 16:9', portrait: 'Portrait 9:16', a4: 'A4' } as Record<string, string>,
    scale: 'Download scale',
    scaleNote: (w: number, h: number, dpi: number | null) =>
      `Saves at ${w.toLocaleString()} × ${h.toLocaleString()}px${dpi ? ` · about ${dpi} dpi on A4${dpi >= 280 ? ' (print quality)' : dpi >= 180 ? ' (slightly soft up close)' : ' (screen only — use 3× for print)'}` : ''}`,
    download: 'Download PNG',
    done: 'Saved',
    custom: 'Custom',
  },
};

const STORE_KEY = 'utilhub-bubble-popart';
const BG_SWATCHES = ['#FFD93D', '#74B9FF', '#A8E6CF', '#FFB3C6', '#FFFFFF', '#1a1a1a'];
const SAMPLE = { ko: '팝!', en: 'POP!' };

/** 색 고르기: 원형 견본 + 직접 선택 */
function ColorField({ label, value, onChange, swatches }: { label: string; value: string; onChange: (v: string) => void; swatches?: string[] }) {
  return (
    <div className={s.colorField}>
      <span className={s.mini}>{label}</span>
      <div className={s.colorRow}>
        {swatches?.map((c) => (
          <button
            key={c}
            type="button"
            className={`${s.dot} ${value.toLowerCase() === c.toLowerCase() ? s.dotActive : ''}`}
            style={{ background: c }}
            onClick={() => onChange(c)}
            aria-label={`${label} ${c}`}
            aria-pressed={value.toLowerCase() === c.toLowerCase()}
          />
        ))}
        <input type="color" className={s.picker} value={value.slice(0, 7)} onChange={(e) => onChange(e.target.value)} aria-label={label} />
      </div>
    </div>
  );
}

function Section({ title, children, hint }: { title: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <section className={s.section}>
      <h3 className={s.sectionTitle}>{title}</h3>
      {children}
      {hint && <p className={`${ui.hint} ${s.hintLine}`}>{hint}</p>}
    </section>
  );
}

function Choice<V extends string | number>({ value, options, onChange, label }: { value: V; options: { value: V; label: string }[]; onChange: (v: V) => void; label: string }) {
  return (
    <div className={ui.chips} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className={`${ui.chip} ${ui.pill} ${value === o.value ? ui.chipActive : ''}`}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className={s.check}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export default function BubblePopartClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const t = isKo ? T.ko : T.en;

  const [design, setDesign] = useState<Design>(PRESETS[0].design);
  const [text, setText] = useState(isKo ? '예쁜글씨POP' : 'Hello POP');
  const [fontSize, setFontSize] = useState(110);
  const [kerning, setKerning] = useState(0.9);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [scale, setScale] = useState(2);
  const [cssReady, setCssReady] = useState(false);
  const [fontReady, setFontReady] = useState(false);
  const [fontTick, setFontTick] = useState(0);
  const [fontBusy, setFontBusy] = useState(false);
  const [thumbTick, setThumbTick] = useState(0);
  const loaded = useRef(false);
  const [info, setInfo] = useState<RenderInfo>({ fontSize: 110, shrunk: false });
  const [saved, setSaved] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thumbRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const preset = SIZE_PRESETS[sizeIdx];
  const set = <K extends keyof Design>(k: K, v: Design[K]) => setDesign((d) => ({ ...d, [k]: v }));
  const activePreset = useMemo(() => PRESETS.find((p) => JSON.stringify(p.design) === JSON.stringify(design))?.key, [design]);

  // 폰트 스타일시트 1회 연결 (6종 정의만 받고, 실제 글꼴 파일은 쓰는 글자만 내려받음)
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[data-bubble-fonts]');
    if (link?.sheet) { void Promise.resolve().then(() => setCssReady(true)); return; }
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FONT_CSS;
      link.setAttribute('data-bubble-fonts', '1');
      document.head.appendChild(link);
    }
    const done = () => setCssReady(true);
    link.addEventListener('load', done);
    link.addEventListener('error', done);
    const timer = setTimeout(done, 4000);
    return () => { link?.removeEventListener('load', done); link?.removeEventListener('error', done); clearTimeout(timer); };
  }, []);

  // 지금 글자에 필요한 폰트 조각을 받은 뒤 다시 그린다
  useEffect(() => {
    if (!cssReady) return;
    let alive = true;
    const finish = () => { if (alive) { setFontReady(true); setFontBusy(false); setFontTick((n) => n + 1); } };
    if (typeof document === 'undefined' || !document.fonts) { void Promise.resolve().then(finish); return () => { alive = false; }; }
    const font = fontCss(design.font, 100);
    const sample = text.replace(/\n/g, '') || 'A';
    // 이미 받은 글꼴 조각이면 미리보기는 방금 그린 그대로 맞다 (글자를 칠 때마다 두 번 그리지 않게)
    let have = false;
    try { have = document.fonts.check(font, sample); } catch { /* 일부 브라우저는 예외 */ }
    if (have) { void Promise.resolve().then(() => { if (alive) { setFontReady(true); setFontBusy(false); } }); return () => { alive = false; }; }
    // 받는 동안에는 대체 글꼴로 저장되지 않도록 다운로드를 잠시 막는다
    void Promise.resolve().then(() => { if (alive) setFontBusy(true); });
    document.fonts.load(font, sample).then(finish, finish);
    return () => { alive = false; };
  }, [cssReady, design.font, text]);

  // 저장해 둔 디자인·글자 되살리기 (새로고침·언어 전환 후에도 이어서)
  useEffect(() => {
    let saved: Record<string, unknown> | null = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null'); } catch { /* 저장소 없음 */ }
    void Promise.resolve().then(() => {
      if (saved && typeof saved === 'object') {
        if (saved.design) setDesign(sanitizeDesign(saved.design));
        if (typeof saved.text === 'string' && saved.text.trim()) setText(clampText(saved.text));
        if (typeof saved.fontSize === 'number') setFontSize(Math.min(SIZE_MAX, Math.max(SIZE_MIN, Math.round(saved.fontSize))));
        if (typeof saved.kerning === 'number') setKerning(Math.min(KERNING_MAX, Math.max(KERNING_MIN, saved.kerning)));
        if (typeof saved.sizeIdx === 'number' && SIZE_PRESETS[saved.sizeIdx]) setSizeIdx(saved.sizeIdx);
        if (saved.scale === 1 || saved.scale === 2 || saved.scale === 3) setScale(saved.scale);
      }
      loaded.current = true;
    });
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ design, text, fontSize, kerning, sizeIdx, scale })); } catch { /* 저장 실패해도 그대로 동작 */ }
  }, [design, text, fontSize, kerning, sizeIdx, scale]);

  // 프리셋 견본에 쓰는 폰트
  useEffect(() => {
    if (!cssReady || typeof document === 'undefined' || !document.fonts) return;
    let alive = true;
    const fonts = [...new Set(PRESETS.map((p) => p.design.font))];
    Promise.all(fonts.map((f) => document.fonts.load(fontCss(f, 100), SAMPLE.ko + SAMPLE.en).catch(() => null)))
      .then(() => { if (alive) setThumbTick((n) => n + 1); });
    return () => { alive = false; };
  }, [cssReady]);

  // 미리보기 (다운로드와 같은 함수, 배율 1)
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const id = requestAnimationFrame(() => {
      const r = render(cv, preset.w, preset.h, 1, design, { text, fontSize, kerning });
      setInfo((p) => (p.fontSize === r.fontSize && p.shrunk === r.shrunk ? p : r));
    });
    return () => cancelAnimationFrame(id);
  }, [design, text, fontSize, kerning, preset, fontTick]);

  // 프리셋 견본
  useEffect(() => {
    const sample = isKo ? SAMPLE.ko : SAMPLE.en;
    PRESETS.forEach((p, i) => {
      const cv = thumbRefs.current[i];
      if (cv) render(cv, 160, 100, 1, { ...p.design, decoAmount: 'few' }, { text: sample, fontSize: 200, kerning: 0.9 });
    });
  }, [thumbTick, isKo]);

  const handleDownload = () => {
    if (!text.trim()) return;
    const off = document.createElement('canvas');
    render(off, preset.w, preset.h, scale, design, { text, fontSize, kerning });
    off.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bubble-pop-art-${off.width}x${off.height}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 'image/png');
  };

  const outW = preset.w * scale;
  const outH = preset.h * scale;
  const needs2 = design.bg !== 'solid' && design.bg !== 'transparent';
  const autoWhite = isDarkBg(design) && luminance(design.outlineColor) < 0.18;

  return (
    <div className={s.split}>
      {/* 미리보기 — 선택한 출력 비율 그대로 */}
      <div className={s.previewCol}>
        <div className={s.previewBox}>
          <canvas
            ref={canvasRef}
            className={`${s.canvas} ${design.bg === 'transparent' ? s.checker : ''}`}
            style={{ aspectRatio: `${preset.w} / ${preset.h}`, ['--ratio' as string]: preset.w / preset.h }}
            role="img"
            aria-label={`${t.preview}: ${text.replace(/\n/g, ' ')}`}
          />
          {!fontReady && <div className={s.fontLoading}>{t.loading}</div>}
        </div>
        <p className={`${ui.hint} ${s.previewMeta}`} aria-live="polite">
          {preset.w}×{preset.h} · {info.shrunk ? t.shrunk(info.fontSize) : `${info.fontSize}px`}
        </p>
      </div>

      {/* 설정 */}
      <div className={`${ui.card} ${s.panel}`}>
        <Section title={t.preset} hint={t.presetHint}>
          <div className={s.presetGrid}>
            {PRESETS.map((p, i) => (
              <button
                key={p.key}
                type="button"
                className={`${s.presetBtn} ${activePreset === p.key ? s.presetActive : ''}`}
                onClick={() => setDesign(p.design)}
                aria-pressed={activePreset === p.key}
              >
                <canvas ref={(el) => { thumbRefs.current[i] = el; }} className={s.thumb} aria-hidden="true" />
                <span>{isKo ? p.ko : p.en}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title={t.text}>
          <textarea
            className={`${ui.input} ${s.textarea}`}
            value={text}
            rows={2}
            onChange={(e) => {
              const v = e.target.value;
              // 이미 3줄인데 Enter로 줄을 더 나누면 마지막 줄이 잘려 나가므로 무시한다 (붙여넣기는 앞 3줄만 받음)
              if (v.split('\n').length > MAX_LINES && v.length === text.length + 1 && v.replace(/\n/g, '') === text.replace(/\n/g, '')) return;
              setText(clampText(v));
            }}
            placeholder={t.textPh}
            aria-label={t.text}
          />
          <div className={`${ui.hint} ${s.count}`}>
            {Math.min(text.split('\n').length, MAX_LINES)}/{MAX_LINES} · {countChars(text)}/{MAX_CHARS}
          </div>
          <span className={s.mini}>{t.font}</span>
          <div className={s.fontGrid} role="group" aria-label={t.font}>
            {FONTS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`${ui.chip} ${design.font === f.key ? ui.chipActive : ''} ${s.fontBtn}`}
                style={{ fontFamily: `"${f.family}", sans-serif`, fontWeight: f.weight }}
                onClick={() => set('font', f.key)}
                aria-pressed={design.font === f.key}
              >
                {isKo ? f.ko : f.en}
              </button>
            ))}
          </div>
          <p className={`${ui.hint} ${s.hintLine}`}>{t.fontNote}</p>
        </Section>

        <Section title={t.fill}>
          <Choice label={t.fill} value={design.fill} onChange={(v) => set('fill', v)}
            options={(['multi', 'single', 'gradient'] as FillMode[]).map((v) => ({ value: v, label: t.fills[v] }))} />
          {design.fill === 'multi' && (
            <div className={s.palette} aria-hidden="true">
              {design.palette.map((c, i) => <span key={i} style={{ background: c }} />)}
            </div>
          )}
          {design.fill === 'single' && <ColorField label={t.fills.single} value={design.single} onChange={(v) => set('single', v)} swatches={['#FF6B9D', '#FF1E56', '#4ECDC4', '#FFB627', '#8C6CFF', '#ffffff']} />}
          {design.fill === 'gradient' && (
            <div className={s.twoCols}>
              <ColorField label={t.gradTop} value={design.gradient[0]} onChange={(v) => set('gradient', [v, design.gradient[1]])} />
              <ColorField label={t.gradBottom} value={design.gradient[1]} onChange={(v) => set('gradient', [design.gradient[0], v])} />
            </div>
          )}
        </Section>

        <Section title={t.outline} hint={autoWhite ? t.autoWhite : undefined}>
          <Choice label={t.outline} value={design.outline} onChange={(v) => set('outline', v)}
            options={([1, 2] as const).map((v) => ({ value: v, label: t.outlines[v] }))} />
          <div className={s.twoCols}>
            <ColorField label={t.outerColor} value={design.outlineColor} onChange={(v) => set('outlineColor', v)} swatches={['#1a1a1a', '#ffffff']} />
            {design.outline === 2 && <ColorField label={t.innerColor} value={design.innerColor} onChange={(v) => set('innerColor', v)} swatches={['#ffffff', '#1a1a1a']} />}
          </div>
          <label className={s.sliderHead}><span>{t.thickness}</span><b>{Math.round(design.outlineWidth * 100)}%</b></label>
          <input type="range" min={0.3} max={1.6} step={0.05} value={design.outlineWidth} onChange={(e) => set('outlineWidth', Number(e.target.value))} className={s.slider} aria-label={t.thickness} />
          <div className={s.ends}><span>{t.thin}</span><span>{t.thick}</span></div>
        </Section>

        <Section title={t.depth}>
          <Choice label={t.depth} value={design.shadow} onChange={(v) => set('shadow', v)}
            options={(['none', 'drop', 'extrude'] as ShadowMode[]).map((v) => ({ value: v, label: t.shadows[v] }))} />
          {design.shadow !== 'none' && (
            <>
              <Choice label={t.depth} value={design.shadowDir} onChange={(v) => set('shadowDir', v)}
                options={(['bl', 'b', 'br'] as ShadowDir[]).map((v) => ({ value: v, label: t.dirs[v] }))} />
              <div className={s.colorField}>
                <span className={s.mini}>{t.shadowColor}</span>
                <div className={s.colorRow}>
                  <button type="button" className={`${ui.chip} ${ui.pill} ${design.shadowColor === 'auto' ? ui.chipActive : ''}`} onClick={() => set('shadowColor', 'auto')} aria-pressed={design.shadowColor === 'auto'}>{t.auto}</button>
                  {['#1a1a1a', '#ffffff'].map((c) => (
                    <button key={c} type="button" className={`${s.dot} ${design.shadowColor === c ? s.dotActive : ''}`} style={{ background: c }} onClick={() => set('shadowColor', c)} aria-label={`${t.shadowColor} ${c}`} aria-pressed={design.shadowColor === c} />
                  ))}
                  <input type="color" className={s.picker} value={design.shadowColor === 'auto' ? '#555555' : design.shadowColor.slice(0, 7)} onChange={(e) => set('shadowColor', e.target.value)} aria-label={t.shadowColor} />
                </div>
              </div>
            </>
          )}
          <div className={s.toggles}>
            <Toggle checked={design.highlight} onChange={(v) => set('highlight', v)} label={t.highlight} />
            <Toggle checked={design.sticker} onChange={(v) => set('sticker', v)} label={t.sticker} />
            <Toggle checked={design.glow} onChange={(v) => set('glow', v)} label={t.glow} />
            <Toggle checked={design.zigzag} onChange={(v) => set('zigzag', v)} label={t.zigzag} />
          </div>
        </Section>

        <Section title={t.bg} hint={design.bg === 'transparent' ? t.transparentHint : undefined}>
          <Choice label={t.bg} value={design.bg} onChange={(v) => set('bg', v)}
            options={(['solid', 'gradient', 'dots', 'rays', 'check', 'stripes', 'transparent'] as BgKind[]).map((v) => ({ value: v, label: t.bgs[v] }))} />
          {design.bg !== 'transparent' && (
            <div className={s.twoCols}>
              <ColorField label={t.bgColor} value={design.bgColor} onChange={(v) => set('bgColor', v)} swatches={needs2 ? undefined : BG_SWATCHES} />
              {needs2 && <ColorField label={t.bgColor2} value={design.bgColor2} onChange={(v) => set('bgColor2', v)} />}
            </div>
          )}
        </Section>

        <Section title={t.deco}>
          <Choice label={t.deco} value={design.deco} onChange={(v) => set('deco', v)}
            options={(['none', 'stars', 'hearts', 'sparkles', 'notes', 'mixed'] as DecoKind[]).map((v) => ({ value: v, label: t.decos[v] }))} />
          {design.deco !== 'none' && (
            <Choice label={t.deco} value={design.decoAmount} onChange={(v) => set('decoAmount', v)}
              options={(['few', 'normal', 'many'] as DecoAmount[]).map((v) => ({ value: v, label: t.amounts[v] }))} />
          )}
          <span className={s.mini}>{t.shape}</span>
          <Choice label={t.shape} value={design.shape} onChange={(v) => set('shape', v)}
            options={(['none', 'bubble', 'burst'] as ShapeKind[]).map((v) => ({ value: v, label: t.shapes[v] }))} />
          {design.shape !== 'none' && <ColorField label={t.shapeColor} value={design.shapeColor} onChange={(v) => set('shapeColor', v)} swatches={['#ffffff', '#FFE600', '#FFB3C6', '#A8E6CF']} />}
          <span className={s.mini}>{t.arch}</span>
          <Choice label={t.arch} value={design.arch} onChange={(v) => set('arch', v)}
            options={(['none', 'up', 'down'] as ArchKind[]).map((v) => ({ value: v, label: t.arches[v] }))} />
        </Section>

        <Section title={t.size}>
          <label className={s.sliderHead}><span>{t.fontSize}</span><b>{fontSize}px</b></label>
          <input type="range" min={SIZE_MIN} max={SIZE_MAX} step={1} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className={s.slider} aria-label={t.fontSize} />
          <label className={s.sliderHead}><span>{t.kerning}</span><b>{kerning.toFixed(2)}</b></label>
          <input type="range" min={KERNING_MIN} max={KERNING_MAX} step={0.01} value={kerning} onChange={(e) => setKerning(Number(e.target.value))} className={s.slider} aria-label={t.kerning} />
          <div className={s.ends}><span>{t.narrow}</span><span>{t.wide}</span></div>
        </Section>

        <Section title={t.output}>
          <div className={s.sizeGrid}>
            {SIZE_PRESETS.map((p, i) => (
              <button key={p.key} type="button" className={`${ui.chip} ${sizeIdx === i ? ui.chipActive : ''} ${s.sizeBtn}`} onClick={() => setSizeIdx(i)} aria-pressed={sizeIdx === i}>
                <span>{t.sizes[p.key]}</span>
                <small>{p.w}×{p.h}</small>
              </button>
            ))}
          </div>
          <span className={s.mini}>{t.scale}</span>
          <Choice label={t.scale} value={scale} onChange={setScale} options={[1, 2, 3].map((v) => ({ value: v, label: `${v}×` }))} />
          <p className={`${ui.hint} ${s.hintLine}`}>{t.scaleNote(outW, outH, preset.key === 'a4' ? a4Dpi(scale) : null)}</p>
        </Section>

        <button
          type="button"
          className={`${ui.button} ${ui.primary} ${ui.lg} ${ui.block} ${saved ? ui.green : ''}`}
          onClick={handleDownload}
          disabled={!text.trim() || !fontReady || fontBusy}
        >
          {saved ? <Check size={18} /> : <Download size={18} />}
          {saved ? t.done : `${t.download} (${outW}×${outH})`}
        </button>
      </div>
    </div>
  );
}
