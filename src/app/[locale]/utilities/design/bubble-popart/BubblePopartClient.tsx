'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './bubble-popart.module.css';

const BG_PRESETS = [
  { name: '노랑', hex: '#FFD93D' },
  { name: '하늘', hex: '#74B9FF' },
  { name: '연두', hex: '#A8E6CF' },
  { name: '핑크', hex: '#FFB3C6' },
  { name: '흰색', hex: '#FFFFFF' },
  { name: '검정', hex: '#1a1a1a' },
];

const MULTI_COLORS = [
  '#FF6B9D', '#4ECDC4', '#FFE66D', '#FF8B3D',
  '#A8E6CF', '#C9B1FF', '#FF6B6B', '#74B9FF',
];

const STAR_COLORS = ['#FF8B3D', '#A8E6CF', '#FF6B9D', '#C9B1FF'];

const SIZE_PRESETS = [
  { key: 'square', w: 800, h: 800 },
  { key: 'landscape', w: 1280, h: 720 },
  { key: 'portrait', w: 720, h: 1280 },
  { key: 'a4', w: 794, h: 1123 },
];

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Jua&display=swap';
const FONT_FAMILY = '"Jua", sans-serif';

export default function BubblePopartClient() {
  const t = useTranslations('BubblePopart');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [text, setText] = useState('예쁜글씨POP');
  const [bgColor, setBgColor] = useState('#FFD93D');
  const [fontSize, setFontSize] = useState(110);
  const [sizePreset, setSizePreset] = useState(0);
  const [colorMode, setColorMode] = useState<'multi' | 'single'>('multi');
  const [singleColor, setSingleColor] = useState('#FF6B9D');
  const [showHighlight, setShowHighlight] = useState(true);
  const [showStars, setShowStars] = useState(true);
  const [showZigzag, setShowZigzag] = useState(false);
  const [kerning, setKerning] = useState(0.9);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Google Fonts (Jua) 동적 로드
  useEffect(() => {
    if (!isMounted) return;

    const existing = document.querySelector(`link[data-bubble-jua]`);
    let link: HTMLLinkElement;
    if (existing) {
      link = existing as HTMLLinkElement;
    } else {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FONT_HREF;
      link.setAttribute('data-bubble-jua', '1');
      document.head.appendChild(link);
    }

    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        document.fonts.load(`16px ${FONT_FAMILY}`).then(() => {
          setFontLoaded(true);
        }).catch(() => setFontLoaded(true));
      }).catch(() => setFontLoaded(true));
    } else {
      const t = setTimeout(() => setFontLoaded(true), 1500);
      return () => clearTimeout(t);
    }

    return () => {
      const elem = document.querySelector('link[data-bubble-jua]');
      if (elem) elem.parentNode?.removeChild(elem);
    };
  }, [isMounted]);

  const preset = SIZE_PRESETS[sizePreset];

  // 별 그리기 (5각)
  const drawStar = useCallback((ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) => {
    const spikes = 5;
    const innerR = r * 0.45;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? r : innerR;
      const angle = (Math.PI / spikes) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }, []);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!fontLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = preset.w;
    canvas.height = preset.h;

    // 1) 배경
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, preset.w, preset.h);

    if (!text || text.length === 0) return;

    const chars = text.split('');
    const centerY = preset.h / 2;

    // 폰트 크기 자동 축소
    let curFontSize = fontSize;
    const measureTotal = (size: number) => {
      ctx.font = `${size}px ${FONT_FAMILY}`;
      return chars.reduce((sum, ch, i) => {
        const w = ctx.measureText(ch).width;
        return sum + (i < chars.length - 1 ? w * kerning : w);
      }, 0);
    };

    const maxAllowed = preset.w * 0.9;
    while (curFontSize > 40 && measureTotal(curFontSize) > maxAllowed) {
      curFontSize -= 5;
    }

    ctx.font = `${curFontSize}px ${FONT_FAMILY}`;
    ctx.textBaseline = 'middle';

    const totalWidth = chars.reduce((sum, ch, i) => {
      const w = ctx.measureText(ch).width;
      return sum + (i < chars.length - 1 ? w * kerning : w);
    }, 0);

    let startX = (preset.w - totalWidth) / 2;

    // 2) 별 장식 (텍스트 그리기 전)
    if (showStars) {
      drawStar(ctx, startX - 65, centerY - 35, 28, STAR_COLORS[0]);
      drawStar(ctx, startX + totalWidth + 65, centerY + 25, 32, STAR_COLORS[1]);
      drawStar(ctx, startX - 25, centerY + 60, 20, STAR_COLORS[2]);
      drawStar(ctx, startX + totalWidth + 20, centerY - 55, 18, STAR_COLORS[3]);
    }

    // 3) 글자별 렌더링
    chars.forEach((char, i) => {
      const charW = ctx.measureText(char).width;
      const charCenterX = startX + charW / 2;

      const charColor = colorMode === 'multi'
        ? MULTI_COLORS[i % MULTI_COLORS.length]
        : singleColor;

      ctx.save();

      let drawTextFn: (offsetX: number, offsetY: number) => void;

      if (showZigzag) {
        const angle = (i % 2 === 0 ? -3 : 3) * (Math.PI / 180);
        ctx.translate(charCenterX, centerY);
        ctx.rotate(angle);
        drawTextFn = (ox, oy) => {
          // (0,0) 기준 — translate 후 좌표
          ctx.strokeText(char, -charW / 2 + ox, oy);
          ctx.fillText(char, -charW / 2 + ox, oy);
        };
        // 외곽선 1: 검정
        ctx.lineJoin = 'round';
        ctx.lineWidth = curFontSize * 0.24;
        ctx.strokeStyle = '#1a1a1a';
        ctx.strokeText(char, -charW / 2, 0);
        // 외곽선 2: 흰색
        ctx.lineWidth = curFontSize * 0.10;
        ctx.strokeStyle = '#ffffff';
        ctx.strokeText(char, -charW / 2, 0);
        // 본체
        ctx.fillStyle = charColor;
        ctx.fillText(char, -charW / 2, 0);

        // 하이라이트 (translate 좌표계 기준)
        if (showHighlight) {
          const cx1 = -charW * 0.12;
          const cy1 = -curFontSize * 0.24;
          const r1 = curFontSize * 0.09;
          ctx.beginPath();
          ctx.arc(cx1, cy1, r1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.88)';
          ctx.fill();

          const cx2 = cx1 + r1 * 0.85;
          const cy2 = cy1 + r1 * 0.65;
          const r2 = curFontSize * 0.05;
          ctx.beginPath();
          ctx.arc(cx2, cy2, r2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fill();
        }
      } else {
        // 외곽선 1: 검정
        ctx.lineJoin = 'round';
        ctx.lineWidth = curFontSize * 0.24;
        ctx.strokeStyle = '#1a1a1a';
        ctx.strokeText(char, startX, centerY);
        // 외곽선 2: 흰색
        ctx.lineWidth = curFontSize * 0.10;
        ctx.strokeStyle = '#ffffff';
        ctx.strokeText(char, startX, centerY);
        // 본체
        ctx.fillStyle = charColor;
        ctx.fillText(char, startX, centerY);

        // 하이라이트 원 2개
        if (showHighlight) {
          const cx1 = charCenterX - charW * 0.12;
          const cy1 = centerY - curFontSize * 0.24;
          const r1 = curFontSize * 0.09;
          ctx.beginPath();
          ctx.arc(cx1, cy1, r1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.88)';
          ctx.fill();

          const cx2 = cx1 + r1 * 0.85;
          const cy2 = cy1 + r1 * 0.65;
          const r2 = curFontSize * 0.05;
          ctx.beginPath();
          ctx.arc(cx2, cy2, r2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fill();
        }
      }

      ctx.restore();

      startX += charW * kerning;
    });
  }, [text, bgColor, fontSize, kerning, colorMode, singleColor, showHighlight, showStars, showZigzag, preset, fontLoaded, drawStar]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // 미리보기 스케일 (시각용)
  const displayScale = useMemo(() => {
    return Math.min(1, 480 / Math.max(preset.w, preset.h));
  }, [preset]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bubble-pop-art.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  if (!isMounted) return null;

  return (
    <div className={s.container}>
      <NavigationActions />
      <header className={s.header}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem',
        }}>
          <Sparkles size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.title}>{t('title')}</h1>
        <p className={s.subtitle}>{t('description')}</p>
      </header>

      <div className={s.splitLayout}>
        {/* 우측 캔버스 — 모바일에서는 order: -1 로 위로 옴 */}
        <div className={s.canvasWrapper}>
          <canvas
            ref={canvasRef}
            className={s.canvas}
            style={{
              width: preset.w * displayScale,
              height: preset.h * displayScale,
            }}
            aria-label={isKo ? '버블 팝아트 미리보기' : 'Bubble pop art preview'}
          />
          {!fontLoaded && <div className={s.fontLoading}>{t('loading_font')}</div>}
        </div>

        {/* 좌측 설정 */}
        <div className={s.settingsPanel}>
          {/* STEP 1: 텍스트 */}
          <div>
            <div className={s.stepTitle}>{t('step_text')}</div>
            <input
              type="text"
              className={s.input}
              value={text}
              maxLength={10}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('step_text_placeholder')}
              aria-label={t('step_text')}
            />
            <div className={s.charCount}>{text.length}/10</div>
          </div>

          {/* STEP 2: 배경색 */}
          <div>
            <div className={s.stepTitle}>{t('step_bg')}</div>
            <div className={s.colorPresets}>
              {BG_PRESETS.map((c) => (
                <button
                  key={c.hex}
                  className={`${s.colorDot} ${bgColor === c.hex ? s.colorDotActive : ''}`}
                  style={{ background: c.hex }}
                  onClick={() => setBgColor(c.hex)}
                  aria-label={`배경 ${c.name}`}
                />
              ))}
              <div className={s.colorPickerWrap}>
                <input
                  type="color"
                  className={s.colorPicker}
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  aria-label={isKo ? '배경색 커스텀 선택' : 'Pick custom background'}
                />
              </div>
            </div>
          </div>

          {/* STEP 3: 글자 색상 */}
          <div>
            <div className={s.stepTitle}>{t('step_color')}</div>
            <div className={s.toggleRow}>
              <button
                className={`${s.toggleBtn} ${colorMode === 'multi' ? s.toggleBtnActive : ''}`}
                onClick={() => setColorMode('multi')}
                aria-label={t('color_mode_multi')}
              >
                {t('color_mode_multi')}
              </button>
              <button
                className={`${s.toggleBtn} ${colorMode === 'single' ? s.toggleBtnActive : ''}`}
                onClick={() => setColorMode('single')}
                aria-label={t('color_mode_single')}
              >
                {t('color_mode_single')}
              </button>
            </div>
            {colorMode === 'single' && (
              <input
                type="color"
                className={s.colorPicker}
                style={{ width: '100%', height: 40, borderRadius: 8 }}
                value={singleColor}
                onChange={(e) => setSingleColor(e.target.value)}
                aria-label={isKo ? '단색 글자 색상' : 'Single text color'}
              />
            )}
          </div>

          {/* STEP 4: 글자 크기 & 자간 */}
          <div>
            <div className={s.stepTitle}>{t('step_size')}</div>
            <div className={s.sliderRow}>
              <span>{t('label_size')}</span>
              <span className={s.sliderValue}>{fontSize}px</span>
            </div>
            <input
              type="range"
              min={40}
              max={200}
              step={1}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className={s.slider}
              aria-label={t('label_size')}
            />
            <div className={s.sliderRow} style={{ marginTop: '0.6rem' }}>
              <span>{t('label_kerning')}</span>
              <span className={s.sliderValue}>{kerning.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.8}
              max={1.0}
              step={0.01}
              value={kerning}
              onChange={(e) => setKerning(Number(e.target.value))}
              className={s.slider}
              aria-label={t('label_kerning')}
            />
            <div className={s.kerningHint}>
              <span>{t('kerning_hint').split(' ')[0]} {t('kerning_hint').split(' ')[1] ?? ''}</span>
              <span>{t('kerning_hint').split(' ').slice(-1)[0]}</span>
            </div>
          </div>

          {/* STEP 5: 출력 크기 */}
          <div>
            <div className={s.stepTitle}>{t('step_output')}</div>
            <div className={s.sizeGrid}>
              {SIZE_PRESETS.map((p, i) => (
                <button
                  key={p.key}
                  className={`${s.sizeBtn} ${sizePreset === i ? s.sizeBtnActive : ''}`}
                  onClick={() => setSizePreset(i)}
                  aria-label={t(`preset_${p.key}` as 'preset_square')}
                >
                  <span>{t(`preset_${p.key}` as 'preset_square')}</span>
                  <span className={s.sizeBtnSub}>{p.w}×{p.h}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 6: 장식 옵션 */}
          <div>
            <div className={s.stepTitle}>{t('step_deco')}</div>
            <label className={s.checkRow}>
              <input
                type="checkbox"
                className={s.checkbox}
                checked={showHighlight}
                onChange={(e) => setShowHighlight(e.target.checked)}
                aria-label={t('opt_highlight')}
              />
              <span className={s.checkLabel}>{t('opt_highlight')}</span>
            </label>
            <label className={s.checkRow}>
              <input
                type="checkbox"
                className={s.checkbox}
                checked={showStars}
                onChange={(e) => setShowStars(e.target.checked)}
                aria-label={t('opt_stars')}
              />
              <span className={s.checkLabel}>{t('opt_stars')}</span>
            </label>
            <label className={s.checkRow}>
              <input
                type="checkbox"
                className={s.checkbox}
                checked={showZigzag}
                onChange={(e) => setShowZigzag(e.target.checked)}
                aria-label={t('opt_zigzag')}
              />
              <span className={s.checkLabel}>{t('opt_zigzag')}</span>
            </label>
          </div>

          {/* 다운로드 */}
          <button
            className={`${s.downloadBtn} ${downloaded ? s.downloadBtnDone : ''}`}
            onClick={handleDownload}
            disabled={!text || !fontLoaded}
            aria-label={t('download')}
          >
            {downloaded ? t('download_done') : t('download')}
          </button>
        </div>
      </div>

      {/* 표준 하단 7개 섹션 */}
      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="utilities/design/bubble-popart" />
      <div className={s.adPlaceholder}>AD</div>
      <SeoSection
        ko={{
          title: '버블 팝아트 글씨 생성기란 무엇인가요?',
          description:
            '버블 팝아트 글씨 생성기는 텍스트를 입력하면 둥글둥글한 버블 폰트에 멀티컬러, 두꺼운 외곽선, 광택 하이라이트 효과가 적용된 팝아트 스타일 이미지를 즉시 생성해주는 도구입니다. 매장 POP(Point of Purchase) 제작, SNS 이벤트 이미지, 현수막, 스티커 등 다양한 용도로 활용할 수 있습니다. 배경색, 글자 색상(멀티컬러/단색), 글자 크기, 출력 해상도를 자유롭게 설정할 수 있으며, 모든 처리가 브라우저 안에서만 이루어져 파일이 서버로 전송되지 않습니다. 정사각형, 16:9 가로형, 9:16 세로형, A4 비율 등 다양한 크기로 고해상도 PNG를 바로 다운로드할 수 있습니다.',
          useCases: [
            { icon: '🏪', title: '매장 POP 이미지 제작', desc: '카페, 식당, 소매점 등에서 메뉴판, 가격표, 이벤트 안내문 등 매장 POP 이미지를 전문 디자이너 없이도 즉시 제작할 수 있습니다.' },
            { icon: '📱', title: 'SNS 이벤트 이미지', desc: '인스타그램, 카카오톡 채널 등 SNS에 올릴 이벤트 공지나 이름 이미지를 귀엽고 눈에 띄는 팝아트 스타일로 만들어보세요.' },
            { icon: '🎉', title: '파티·이벤트 소품', desc: '생일 파티, 돌잔치, 결혼식 웰컴보드 등 이벤트용 텍스트 이미지를 원하는 색상과 크기로 자유롭게 제작할 수 있습니다.' },
            { icon: '🖨️', title: '스티커·현수막 출력', desc: '고해상도(최대 1280px) PNG로 저장되어 인쇄소에 바로 넘길 수 있습니다. 정사각형, A4, 16:9 등 다양한 비율을 지원합니다.' },
          ],
          steps: [
            { step: '텍스트 입력', desc: '원하는 텍스트를 입력합니다. 한글, 영문, 숫자, 특수문자 모두 지원하며 최대 10자까지 입력할 수 있습니다. 입력 즉시 오른쪽 미리보기에 실시간으로 반영됩니다.' },
            { step: '색상 선택', desc: '배경색과 글자 색상을 선택합니다. 멀티컬러 모드에서는 글자마다 다른 색상이 자동 적용되고, 단색 모드에서는 원하는 색을 직접 선택할 수 있습니다.' },
            { step: '크기 & 장식', desc: '글자 크기 슬라이더로 원하는 크기를 조정하고, 출력 크기(정사각형·가로형·세로형·A4)를 선택합니다. 하이라이트 광택 효과와 별 장식 표시 여부도 설정할 수 있습니다.' },
            { step: 'PNG 다운로드', desc: '[PNG 다운로드] 버튼을 클릭하면 설정한 해상도의 고품질 PNG 이미지가 즉시 저장됩니다. 인쇄나 SNS 업로드에 바로 사용할 수 있습니다.' },
          ],
          faqs: [
            { q: '한글도 잘 표시되나요?', a: '네, 한글을 완벽하게 지원합니다. Google Fonts의 Jua 폰트를 사용하며, 이 폰트는 한글 전용으로 설계된 둥글둥글한 버블 스타일 폰트입니다. 한글, 영문, 숫자, 특수문자 모두 동일한 스타일로 표현됩니다. 단, 첫 로딩 시 폰트 다운로드에 1~2초가 소요될 수 있습니다.' },
            { q: '다운로드한 이미지를 인쇄에 사용해도 되나요?', a: '인쇄 용도로 사용하실 수 있습니다. 최대 1280×720px 해상도로 저장되며, 소형 인쇄물(A6 이하)에서는 충분한 품질을 제공합니다. 대형 현수막이나 A3 이상 출력이 필요한 경우 화질이 다소 낮아 보일 수 있으므로, 출력 전 인쇄소와 확인하시기 바랍니다.' },
            { q: '생성한 이미지를 상업적으로 사용해도 되나요?', a: '이 툴로 생성한 이미지 자체는 자유롭게 사용하실 수 있습니다. 사용된 Jua 폰트는 OFL(Open Font License)로 상업적 사용이 허용됩니다. 단, 이미지에 포함된 텍스트 내용에 대한 저작권은 사용자 본인이 확인하시기 바랍니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 결과물은 참고용 이미지로 제공됩니다. 공식 인쇄물이나 중요한 디자인 작업에는 전문 디자인 툴(Adobe Illustrator 등)을 사용하시거나 전문 디자이너에게 의뢰하시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'What is the Bubble Pop Art Text Generator?',
          description:
            'The Bubble Pop Art Text Generator instantly creates pop art-style images with rounded bubble fonts, vivid multicolor letters, thick bold outlines, and glossy highlights. Perfect for store POP (Point of Purchase) signs, social media event graphics, banners, and stickers. You can freely customize the background color, text color (multicolor or single), font size, and output resolution. All processing happens entirely in your browser — files are never uploaded to a server, ensuring complete privacy. Download high-resolution PNG images in multiple aspect ratios including square, 16:9 landscape, 9:16 portrait, and A4 ratio to fit both print and digital workflows. The generator is free, requires no signup, and works on any modern browser.',
          useCases: [
            { icon: '🏪', title: 'Store POP Signage', desc: 'Cafes, restaurants, and retail shops can design eye-catching menu boards, price tags, and event signs in seconds without a graphic designer.' },
            { icon: '📱', title: 'Social Media Events', desc: 'Create cute, scroll-stopping event announcement images or personal name graphics for Instagram, Kakao Channel, and other social networks.' },
            { icon: '🎉', title: 'Party & Event Props', desc: 'Make birthday banners, baby shower signs, wedding welcome boards, and event signage with full control over colors and sizes.' },
            { icon: '🖨️', title: 'Stickers & Banners', desc: 'High-resolution PNGs (up to 1280px) export directly to your print shop. Supports square, A4, 16:9, and more aspect ratios out of the box.' },
          ],
          steps: [
            { step: 'Enter Text', desc: 'Type your message in any language — Korean, English, numbers, and symbols are all supported, up to 10 characters. The preview updates in real time as you type.' },
            { step: 'Pick Colors', desc: 'Choose a background color and pick between multicolor mode (each letter a different color) or single color mode for a unified look.' },
            { step: 'Adjust Size & Decoration', desc: 'Use the size slider to resize letters, pick the output aspect ratio, then toggle highlights, star decorations, and zigzag rotation for extra pop.' },
            { step: 'Download PNG', desc: 'Click the [Download PNG] button to save your high-resolution image instantly. Use it for print, social media uploads, or merchandise.' },
          ],
          faqs: [
            { q: 'Does it support Korean characters?', a: 'Yes, Korean is fully supported. The tool uses Google Fonts Jua — a rounded bubble-style typeface designed specifically for Korean. English letters, numbers, and symbols are also rendered in the same style. The font may take 1-2 seconds to load on first use.' },
            { q: 'Can I use the exported image for printing?', a: 'Yes, the export resolution goes up to 1280×720px, which works well for small-format prints (A6 or smaller). For large banners (A3 or larger), check with your print shop in advance — they may request a vector format for crispness.' },
            { q: 'Can I use the generated images commercially?', a: 'Yes, images you create are yours to use. The Jua font is released under the SIL Open Font License, which allows commercial use. You are responsible for the copyright of the text content you choose to embed.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. For official printed materials or professional design work, please use a professional design tool (e.g., Adobe Illustrator) or consult a graphic designer.' },
          ],
        }}
      />
    </div>
  );
}
