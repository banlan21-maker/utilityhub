'use client';

import { useMemo, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Plus, X, Download, RotateCcw, Check, AlertTriangle, Info } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import SeoSection from '@/app/components/SeoSection';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import {
  PALETTE, SEASONS, SLOT_ORDER, STYLES, analyze, computeLook, lightness, nearestName, styleName,
  type LookType, type SeasonKey, type SlotKey, type SlotsMap,
} from '@/lib/outfitColor';
import OutfitFigure, { FIG_H, FIG_W, type HairStyle } from './OutfitFigure';
import { SEO_EN, SEO_KO } from './content';
import { trackEvent } from '@/lib/track';
import s from './color-coordinator.module.css';

const INITIAL_SLOTS: SlotsMap = {
  hat:    { color: '#1E1F23', active: false, optional: true,  style: 'bucket' },
  outer:  { color: '#B98A5A', active: false, optional: true,  style: 'jacket' },
  top:    { color: '#1F3354', active: true,  optional: false, style: 'tee' },
  bottom: { color: '#D9C4A3', active: true,  optional: false, style: 'pants' },
  shoes:  { color: '#F5F5F2', active: true,  optional: false, style: 'sneakers' },
};

const SLOT_LABEL: Record<SlotKey, { ko: string; en: string; icon: string }> = {
  hat:    { ko: '모자',   en: 'Hat',    icon: '🧢' },
  outer:  { ko: '아우터', en: 'Outer',  icon: '🧥' },
  top:    { ko: '상의',   en: 'Top',    icon: '👕' },
  bottom: { ko: '하의',   en: 'Bottom', icon: '👖' },
  shoes:  { ko: '신발',   en: 'Shoes',  icon: '👟' },
};

const SKINS = [
  { hex: '#F3D9C4', ko: '밝은 톤', en: 'Fair' },
  { hex: '#E6BE98', ko: '중간 밝은 톤', en: 'Light' },
  { hex: '#C99A70', ko: '중간 톤', en: 'Medium' },
  { hex: '#9C6B45', ko: '어두운 톤', en: 'Tan' },
  { hex: '#6B4630', ko: '깊은 톤', en: 'Deep' },
];

const LOOKS: { key: LookType; emoji: string; ko: string; en: string; descKo: string; descEn: string }[] = [
  { key: 'daily', emoji: '☀️', ko: '데일리', en: 'Daily', descKo: '뉴트럴 매치', descEn: 'Neutral match' },
  { key: 'point', emoji: '🎯', ko: '포인트', en: 'Point', descKo: '보색 한 곳', descEn: 'One accent' },
  { key: 'soft', emoji: '🌸', ko: '소프트', en: 'Soft', descKo: '톤온톤', descEn: 'Tone-on-tone' },
];

const SEASON_TABS: SeasonKey[] = ['all', 'spring', 'summer', 'autumn', 'winter'];

const FONT = '"Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", system-ui, sans-serif';

/** 캔버스 줄바꿈: 띄어쓰기 단위로 끊고, 한 단어가 너무 길 때만 글자 단위 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxW) { line = test; continue; }
    if (line) lines.push(line);
    line = '';
    for (const ch of Array.from(word)) {
      if (ctx.measureText(line + ch).width > maxW && line) { lines.push(line); line = ''; }
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export default function ColorCoordinatorClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [slots, setSlots] = useState<SlotsMap>(INITIAL_SLOTS);
  const [history, setHistory] = useState<SlotsMap[]>([]);
  const [selected, setSelected] = useState<SlotKey>('top');
  const [season, setSeason] = useState<SeasonKey>('all');
  const [skin, setSkin] = useState(SKINS[1].hex);
  const [hair, setHair] = useState<HairStyle>('short');
  const [look, setLook] = useState<{ key: LookType; variant: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const harmony = useMemo(() => analyze(slots, season), [slots, season]);
  const label = (k: SlotKey) => (isKo ? SLOT_LABEL[k].ko : SLOT_LABEL[k].en);
  const colorName = (hex: string) => {
    const n = nearestName(hex);
    return `${n.exact ? '' : '≈ '}${isKo ? n.ko : n.en}`;
  };

  const update = (next: SlotsMap) => {
    setHistory((h) => [...h.slice(-19), slots]);
    setSlots(next);
  };
  const undo = () => {
    if (!history.length) return;
    setSlots(history[history.length - 1]);
    setHistory(history.slice(0, -1));
    setLook(null);
  };

  const isDress = slots.top.style === 'dress';
  const itemName = (k: SlotKey) => `${label(k)} · ${styleName(k, slots[k].style, isKo)}`;
  const toggleSlot = (k: SlotKey, on: boolean) => {
    if (k === 'bottom' && isDress) return;
    update({ ...slots, [k]: { ...slots[k], active: on } });
    if (on) setSelected(k);
    else if (selected === k) setSelected('top');
  };
  const selectSlot = (k: SlotKey) => { if (slots[k].active) setSelected(k); };
  const pickColor = (hex: string) => {
    update({ ...slots, [selected]: { ...slots[selected], color: hex.toUpperCase() } });
    setLook(null);
  };
  // 모양 바꾸기. 원피스는 하의를 끄고, 원피스에서 다른 상의로 바꾸면 하의를 다시 켠다
  const pickStyle = (style: string) => {
    const next: SlotsMap = { ...slots, [selected]: { ...slots[selected], style } };
    if (selected === 'top') next.bottom = { ...slots.bottom, active: style !== 'dress' };
    update(next);
  };
  const applyLook = (key: LookType) => {
    const variant = look?.key === key ? look.variant + 1 : 0;
    setLook({ key, variant });
    update(computeLook(key, selected, slots, variant));
  };

  const figLabel = (isKo ? '코디 미리보기: ' : 'Outfit preview: ')
    + SLOT_ORDER.filter((k) => slots[k].active).map((k) => `${itemName(k)} ${colorName(slots[k].color)}`).join(', ');

  // ── 1080×1350(4:5) PNG 저장 ──
  const handleSave = async () => {
    const svg = svgRef.current;
    if (!svg || saving) return;
    setSaving(true);
    trackEvent('ootd:save');
    try {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.querySelectorAll('[data-ui]').forEach((n) => n.remove());
      clone.setAttribute('width', String(FIG_W * 3));
      clone.setAttribute('height', String(FIG_H * 3));
      clone.removeAttribute('style');
      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' }));
      const img = new Image();
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('svg')); img.src = url; });

      const W = 1080, H = 1350;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('canvas');
      ctx.fillStyle = '#F7F5FB';
      ctx.fillRect(0, 0, W, H);

      // 마네킹 카드
      const fx = 48, fy = 150, fw = 500, fh = (fw * FIG_H) / FIG_W;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(fx, fy, fw, fh, 28);
      ctx.clip();
      ctx.drawImage(img, fx, fy, fw, fh);
      ctx.restore();
      URL.revokeObjectURL(url);

      // 제목
      ctx.fillStyle = '#1E1B2E';
      ctx.font = `800 52px ${FONT}`;
      ctx.fillText('OOTD', 48, 96);
      ctx.font = `500 26px ${FONT}`;
      ctx.fillStyle = '#7A7490';
      const date = new Date().toLocaleDateString(isKo ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      ctx.fillText(date, 200, 94);
      if (season !== 'all') {
        const tag = isKo ? `퍼스널 컬러 · ${SEASONS[season].ko}` : `Personal color · ${SEASONS[season].en}`;
        ctx.font = `700 22px ${FONT}`;
        const tw = ctx.measureText(tag).width + 36;
        ctx.fillStyle = '#EDE7FB';
        ctx.beginPath(); ctx.roundRect(W - 48 - tw, 62, tw, 44, 22); ctx.fill();
        ctx.fillStyle = '#6D4BC9';
        ctx.fillText(tag, W - 48 - tw + 18, 92);
      }

      // 아이템별 색
      const rx = 590;
      let y = 200;
      for (const k of SLOT_ORDER) {
        if (!slots[k].active) continue;
        const hex = slots[k].color;
        ctx.beginPath(); ctx.arc(rx + 34, y + 30, 32, 0, Math.PI * 2);
        ctx.fillStyle = hex; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.stroke();
        ctx.fillStyle = '#1E1B2E';
        ctx.font = `700 28px ${FONT}`;
        ctx.fillText(itemName(k), rx + 86, y + 24);
        ctx.fillStyle = '#6B6680';
        ctx.font = `500 22px ${FONT}`;
        ctx.fillText(`${colorName(hex)}  ${hex}`, rx + 86, y + 56);
        y += 92;
      }

      // 조합 점검
      y += 18;
      ctx.font = `500 19px ${FONT}`;
      const checkLines = harmony.checks.map((c) => ({ c, lines: wrapText(ctx, isKo ? c.ko : c.en, W - 48 - rx - 60) }));
      const contentH = 62 + checkLines.reduce((sum, x) => sum + 27 * x.lines.length + 12, 0) + 26;
      ctx.fillStyle = '#FFFFFF';
      const boxY = y;
      const boxH = Math.min(contentH, H - 110 - boxY);
      ctx.beginPath(); ctx.roundRect(rx - 8, boxY, W - 48 - rx + 8, boxH, 22); ctx.fill();
      y += 46;
      ctx.fillStyle = harmony.verdict === 'warn' ? '#C2410C' : harmony.verdict === 'ok' ? '#B45309' : '#15803D';
      ctx.font = `800 26px ${FONT}`;
      ctx.fillText(isKo ? harmony.ko : harmony.en, rx + 16, y);
      y += 16;
      ctx.font = `500 19px ${FONT}`;
      for (const { c, lines } of checkLines) {
        if (y + 30 * lines.length > boxY + boxH - 14) break;
        ctx.fillStyle = c.level === 'warn' ? '#C2410C' : c.level === 'ok' ? '#B45309' : '#15803D';
        ctx.fillText(c.level === 'good' ? '✓' : '!', rx + 16, y + 30);
        ctx.fillStyle = '#3F3A52';
        lines.forEach((ln, i) => ctx.fillText(ln, rx + 40, y + 30 + i * 27));
        y += 27 * lines.length + 12;
      }

      ctx.fillStyle = '#9A95A8';
      ctx.font = `500 22px ${FONT}`;
      ctx.fillText(isKo ? 'theutilhub.com · OOTD 컬러 코디네이터' : 'theutilhub.com · OOTD Color Coordinator', 48, H - 52);

      const a = document.createElement('a');
      a.download = `ootd-${new Date().toISOString().slice(0, 10)}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch {
      alert(isKo ? '이미지를 만들지 못했어요. 다른 브라우저에서 다시 시도해 주세요.' : 'Could not create the image. Please try another browser.');
    } finally {
      setSaving(false);
    }
  };

  const seasonInfo = season === 'all' ? null : SEASONS[season];
  const swatchGroups = seasonInfo
    ? [{ ko: seasonInfo.ko, en: seasonInfo.en, colors: seasonInfo.colors }]
    : PALETTE;
  const cur = slots[selected];

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader
        icon="🧥"
        title={isKo ? 'OOTD 컬러 코디네이터' : 'OOTD Color Coordinator'}
        subtitle={isKo
          ? '마네킹에 색을 입혀 보고, 퍼스널 컬러와 조합 원칙으로 바로 점검하세요'
          : 'Dress a mannequin in color and check the outfit against personal color and styling rules'}
      />

      <div className={s.mainGrid}>
        {/* 마네킹 */}
        <div className={s.figCard}>
          <OutfitFigure
            slots={slots}
            skin={skin}
            hair={hair}
            selected={selected}
            onSelect={selectSlot}
            onAddHat={() => toggleSlot('hat', true)}
            label={figLabel}
            svgRef={svgRef}
          />
          <div className={s.skinRow} role="group" aria-label={isKo ? '피부 톤' : 'Skin tone'}>
            {SKINS.map((t) => (
              <button
                key={t.hex}
                type="button"
                className={`${s.skinChip} ${skin === t.hex ? s.skinChipOn : ''}`}
                style={{ background: t.hex }}
                aria-label={isKo ? t.ko : t.en}
                aria-pressed={skin === t.hex}
                title={isKo ? t.ko : t.en}
                onClick={() => setSkin(t.hex)}
              />
            ))}
          </div>
          <div className={s.hairRow} role="group" aria-label={isKo ? '머리 길이' : 'Hair'}>
            {(['short', 'long'] as const).map((h) => (
              <button key={h} type="button" className={`${s.hairBtn} ${hair === h ? s.hairBtnOn : ''}`} aria-pressed={hair === h} onClick={() => setHair(h)}>
                {h === 'short' ? (isKo ? '짧은 머리' : 'Short hair') : (isKo ? '긴 머리' : 'Long hair')}
              </button>
            ))}
          </div>
          <p className={s.figHint}>{isKo ? '옷을 누르면 그 아이템이 선택됩니다' : 'Tap a garment to select it'}</p>
        </div>

        {/* 아이템 */}
        <section className={`${s.card} ${s.slots}`} aria-labelledby="cc-items">
          <div className={s.cardHead}>
            <h2 id="cc-items" className={s.cardTitle}>{isKo ? '아이템' : 'Pieces'}</h2>
            <button type="button" className={s.ghostBtn} onClick={undo} disabled={!history.length}>
              <RotateCcw size={13} /> {isKo ? '되돌리기' : 'Undo'}
            </button>
          </div>
          <ul className={s.slotList}>
            {SLOT_ORDER.map((k) => {
              const st = slots[k];
              const sel = selected === k && st.active;
              const lockedByDress = k === 'bottom' && isDress;
              return (
                <li key={k} className={`${s.slotRow} ${sel ? s.slotRowSel : ''} ${!st.active ? s.slotRowOff : ''}`}>
                  <button
                    type="button"
                    className={s.slotMain}
                    onClick={() => (st.active ? selectSlot(k) : toggleSlot(k, true))}
                    aria-pressed={sel}
                    disabled={lockedByDress}
                  >
                    <span className={s.slotDot} style={{ background: st.active ? st.color : 'transparent' }} />
                    <span className={s.slotLabel}>{label(k)}</span>
                    <span className={s.slotColor}>
                      {lockedByDress
                        ? (isKo ? '원피스 착용 중' : 'Wearing a dress')
                        : st.active ? `${styleName(k, st.style, isKo)} · ${colorName(st.color)}` : (isKo ? '없음' : 'None')}
                    </span>
                  </button>
                  {st.optional && (st.active ? (
                    <button type="button" className={s.slotRemove} aria-label={isKo ? `${label(k)} 빼기` : `Remove ${label(k)}`} onClick={() => toggleSlot(k, false)}>
                      <X size={14} />
                    </button>
                  ) : (
                    <button type="button" className={s.slotAdd} onClick={() => toggleSlot(k, true)}>
                      <Plus size={12} /> {isKo ? '추가' : 'Add'}
                    </button>
                  ))}
                </li>
              );
            })}
          </ul>
        </section>

        {/* 팔레트 */}
        <section className={`${s.card} ${s.palette}`} aria-labelledby="cc-palette">
          <h2 id="cc-palette" className={s.cardTitle}>
            {isKo ? `${label(selected)} 모양·색` : `${label(selected)} style & color`}
            <span className={s.curColor}>
              <span className={s.curDot} style={{ background: cur.color }} />
              {colorName(cur.color)} · {cur.color}
            </span>
          </h2>
          <div className={s.styleRow} role="group" aria-label={isKo ? '모양' : 'Style'}>
            {STYLES[selected].map((st) => (
              <button
                key={st.key}
                type="button"
                className={`${s.styleBtn} ${cur.style === st.key ? s.styleBtnOn : ''}`}
                aria-pressed={cur.style === st.key}
                onClick={() => pickStyle(st.key)}
              >
                {isKo ? st.ko : st.en}
              </button>
            ))}
          </div>
          <p className={s.swGroupName}>{isKo ? '퍼스널 컬러 팔레트' : 'Personal color palette'}</p>
          <div className={s.tabs} role="group" aria-label={isKo ? '퍼스널 컬러' : 'Personal color'}>
            {SEASON_TABS.map((k) => (
              <button
                key={k}
                type="button"
                className={`${s.tab} ${season === k ? s.tabOn : ''}`}
                aria-pressed={season === k}
                onClick={() => setSeason(k)}
              >
                {k === 'all' ? (isKo ? '기본 팔레트' : 'Basics') : isKo ? SEASONS[k].ko : SEASONS[k].en}
              </button>
            ))}
          </div>
          {seasonInfo && <p className={s.seasonNote}>{isKo ? seasonInfo.noteKo : seasonInfo.noteEn}</p>}
          {swatchGroups.map((g) => (
            <div key={g.en} className={s.swGroup}>
              {!seasonInfo && <p className={s.swGroupName}>{isKo ? g.ko : g.en}</p>}
              <div className={s.swGrid}>
                {g.colors.map((c) => {
                  const on = cur.color.toUpperCase() === c.hex.toUpperCase();
                  return (
                    <button
                      key={c.hex + c.en}
                      type="button"
                      className={`${s.swatch} ${on ? s.swatchOn : ''}`}
                      style={{ background: c.hex }}
                      title={`${isKo ? c.ko : c.en} ${c.hex}`}
                      aria-label={`${isKo ? c.ko : c.en} ${c.hex}`}
                      aria-pressed={on}
                      onClick={() => pickColor(c.hex)}
                    >
                      {on && <Check size={14} className={s.swCheck} style={{ color: lightness(c.hex) > 65 ? '#1E1B2E' : '#FFFFFF' }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <label className={s.customBtn}>
            <Plus size={12} /> {isKo ? '커스텀 색상' : 'Custom color'}
            <input
              type="color"
              className={s.hiddenInput}
              value={cur.color.toLowerCase()}
              onChange={(e) => pickColor(e.target.value)}
            />
          </label>
        </section>

        {/* 룩 추천 */}
        <section className={`${s.card} ${s.looks}`} aria-labelledby="cc-looks">
          <h2 id="cc-looks" className={s.cardTitle}>{isKo ? '룩 자동 추천' : 'Auto looks'}</h2>
          <p className={s.lookBase}>
            {isKo
              ? <>기준: <b>{label(selected)} · {colorName(cur.color)}</b> — 나머지 아이템 색을 채웁니다. 같은 버튼을 다시 누르면 다른 조합.</>
              : <>Base: <b>{label(selected)} · {colorName(cur.color)}</b> — fills in the other pieces. Press again for another variation.</>}
          </p>
          <div className={s.lookBtns}>
            {LOOKS.map((l) => (
              <button
                key={l.key}
                type="button"
                className={`${s.lookBtn} ${look?.key === l.key ? s.lookBtnOn : ''}`}
                onClick={() => applyLook(l.key)}
              >
                <span className={s.lookEmoji} aria-hidden="true">{l.emoji}</span>
                <span className={s.lookName}>{isKo ? l.ko : l.en}</span>
                <span className={s.lookDesc}>{isKo ? l.descKo : l.descEn}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 조합 점검 */}
        <section className={`${s.card} ${s.harmony}`} aria-labelledby="cc-harmony" aria-live="polite">
          <h2 id="cc-harmony" className={s.cardTitle}>{isKo ? '조합 점검' : 'Harmony check'}</h2>
          <p className={`${s.verdict} ${s[`v_${harmony.verdict}`]}`}>{isKo ? harmony.ko : harmony.en}</p>
          <ul className={s.checks}>
            {harmony.checks.map((c) => (
              <li key={c.id} className={s[`c_${c.level}`]}>
                {c.level === 'good' ? <Check size={15} /> : c.level === 'ok' ? <Info size={15} /> : <AlertTriangle size={15} />}
                <span>{isKo ? c.ko : c.en}</span>
              </li>
            ))}
          </ul>
        </section>

        <button type="button" className={s.saveBtn} onClick={handleSave} disabled={saving}>
          <Download size={18} />
          {saving ? (isKo ? '이미지 만드는 중…' : 'Creating image…') : (isKo ? '코디 저장 (PNG 1080×1350)' : 'Save outfit (PNG 1080×1350)')}
        </button>
      </div>

      <ShareBar
        title={isKo ? 'OOTD 컬러 코디네이터' : 'OOTD Color Coordinator'}
        description={isKo ? '마네킹에 코디 색을 입혀 보고 퍼스널 컬러·조합 원칙으로 점검하는 무료 도구' : 'Try outfit colors on a mannequin and check them against personal color and styling rules — free.'}
      />
      <RelatedTools toolId="utilities/lifestyle/color-coordinator" />
      <SeoSection ko={SEO_KO} en={SEO_EN} />
    </div>
  );
}
