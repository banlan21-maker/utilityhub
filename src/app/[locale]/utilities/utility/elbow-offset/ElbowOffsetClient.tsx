'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CornerDownRight } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './elbow-offset.module.css';

// ── ASME B16.9 데이터 (LR Take-out 직접 조회) ───────────────────
type Size = '15A' | '20A' | '25A' | '32A' | '40A' | '50A' | '65A' | '80A' | '100A' | '125A' | '150A' | '200A';
const SIZES: Size[] = ['15A','20A','25A','32A','40A','50A','65A','80A','100A','125A','150A','200A'];

interface SizeSpec { nps: number; od: number; LR90: number; LR45: number; }
const SIZE_DATA: Record<Size, SizeSpec> = {
  '15A':  { nps: 15,  od: 21.7,  LR90: 38,  LR45: 16  },
  '20A':  { nps: 20,  od: 27.2,  LR90: 38,  LR45: 19  },
  '25A':  { nps: 25,  od: 34.0,  LR90: 38,  LR45: 22  },
  '32A':  { nps: 32,  od: 42.7,  LR90: 48,  LR45: 25  },
  '40A':  { nps: 40,  od: 48.6,  LR90: 57,  LR45: 29  },
  '50A':  { nps: 50,  od: 60.5,  LR90: 76,  LR45: 35  },
  '65A':  { nps: 65,  od: 76.3,  LR90: 95,  LR45: 44  },
  '80A':  { nps: 80,  od: 89.1,  LR90: 114, LR45: 51  },
  '100A': { nps: 100, od: 114.3, LR90: 152, LR45: 64  },
  '125A': { nps: 125, od: 139.8, LR90: 190, LR45: 79  },
  '150A': { nps: 150, od: 165.2, LR90: 229, LR45: 95  },
  '200A': { nps: 200, od: 216.3, LR90: 305, LR45: 127 },
};

type ElbowType = 'LR90' | 'SR90' | 'LR45' | 'SR45';
const ELBOW_TYPES: ElbowType[] = ['LR90', 'SR90', 'LR45', 'SR45'];
const SR_RATIO = 0.667;

// Take-out 계산: LR은 DB 직접, SR은 LR × 0.667
function getTakeout(size: Size, elbow: ElbowType): number {
  const d = SIZE_DATA[size];
  if (elbow === 'LR90') return d.LR90;
  if (elbow === 'LR45') return d.LR45;
  if (elbow === 'SR90') return Math.round(d.LR90 * SR_RATIO * 10) / 10;
  if (elbow === 'SR45') return Math.round(d.LR45 * SR_RATIO * 10) / 10;
  return 0;
}

type Mode = 'simple' | 'rolling' | 'cut';

const SQRT2 = Math.SQRT2; // 1.41421356...

export default function ElbowOffsetClient() {
  const t = useTranslations('ElbowOffset');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [size, setSize] = useState<Size>('50A');
  const [elbow, setElbow] = useState<ElbowType>('LR90');
  const [mode, setMode] = useState<Mode>('simple');

  // 입력값 (mode 별로 유지)
  const [offset, setOffset] = useState('');           // mode: simple
  const [horiz, setHoriz] = useState('');             // mode: rolling
  const [vert, setVert] = useState('');               // mode: rolling
  const [distance, setDistance] = useState('');       // mode: cut
  const [connection, setConnection] = useState<'both' | 'one'>('both');

  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);


  // 모드 B(rolling) 선택 시 90°엘보 → 45°LR 자동 변경 + 토스트
  useEffect(() => {
    if (mode !== 'rolling') return;
    if (elbow === 'LR90' || elbow === 'SR90') {
      setElbow('LR45');
      setToast(t('warn_rolling_auto'));
      const tm = setTimeout(() => setToast(null), 2800);
      return () => clearTimeout(tm);
    }
  }, [mode, elbow, t]);

  const takeout = useMemo(() => getTakeout(size, elbow), [size, elbow]);

  // ── 계산 결과 ────────────────────────────────────────────
  const calc = useMemo(() => {
    const TO = takeout;

    if (mode === 'simple') {
      const O = parseFloat(offset);
      if (!O || O <= 0) return null;

      const is45 = elbow === 'LR45' || elbow === 'SR45';
      const run = is45 ? O * SQRT2 : O;
      const cut = run - TO * 2;
      const minRequired = TO * 2;

      return {
        mode,
        valid: cut > 0,
        cut: Math.round(cut * 10) / 10,
        TO,
        run: Math.round(run * 10) / 10,
        diagonal: null as number | null,
        angle: null as number | null,
        minRequired: Math.round(minRequired * 10) / 10,
      };
    }

    if (mode === 'rolling') {
      const X = parseFloat(horiz);
      const Y = parseFloat(vert);
      if (!X || !Y || X <= 0 || Y <= 0) return null;

      const diagonal = Math.sqrt(X * X + Y * Y);
      const travel = diagonal * SQRT2;
      const cut = travel - TO * 2;
      const angle = (Math.atan2(Y, X) * 180) / Math.PI;
      const minRequired = (TO * 2) / SQRT2;

      return {
        mode,
        valid: cut > 0,
        cut: Math.round(cut * 10) / 10,
        TO,
        run: Math.round(travel * 10) / 10,
        diagonal: Math.round(diagonal * 10) / 10,
        angle: Math.round(angle * 10) / 10,
        minRequired: Math.round(minRequired * 10) / 10,
      };
    }

    // cut
    const D = parseFloat(distance);
    if (!D || D <= 0) return null;
    const cut = connection === 'both' ? D - TO * 2 : D - TO;
    const minRequired = connection === 'both' ? TO * 2 : TO;
    return {
      mode,
      valid: cut > 0,
      cut: Math.round(cut * 10) / 10,
      TO,
      run: null as number | null,
      diagonal: null as number | null,
      angle: null as number | null,
      minRequired: Math.round(minRequired * 10) / 10,
    };
  }, [mode, elbow, takeout, offset, horiz, vert, distance, connection]);

  const margin5 = calc?.cut ? Math.round(calc.cut * 1.05 * 10) / 10 : 0;
  const margin10 = calc?.cut ? Math.round(calc.cut * 1.10 * 10) / 10 : 0;

  // ── 결과 복사 ───────────────────────────────────────────
  const handleCopy = () => {
    if (!calc || !calc.valid) return;
    const summary = `${size} · ${t(`elbow_${elbow}` as 'elbow_LR90')} · ${t(`mode_${mode}` as 'mode_simple')}`;
    const lines: string[] = [t('title'), summary, '---'];
    lines.push(`${t('result_cut_length')}: ${calc.cut} mm`);
    lines.push(`${t('result_takeout')}: ${calc.TO} mm`);
    if (calc.run != null) lines.push(`${mode === 'rolling' ? t('result_travel') : t('result_run')}: ${calc.run} mm`);
    if (calc.diagonal != null) lines.push(`${t('result_diagonal')}: ${calc.diagonal} mm`);
    if (calc.angle != null) lines.push(`${t('result_angle')}: ${calc.angle}°`);
    lines.push(`${t('result_margin_5')}: ${margin5} mm`);
    lines.push(`${t('result_margin_10')}: ${margin10} mm`);
    try {
      navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToast(t('copy_failed'));
      setTimeout(() => setToast(null), 2000);
    }
  };

  const handleInput = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    // 숫자 + 소수점만 허용
    if (v === '' || /^[0-9]*\.?[0-9]*$/.test(v)) setter(v);
  };


  return (
    <div className={s.container}>
      <NavigationActions />

      <header className={s.header}>
        <div style={{
          display: 'inline-flex', padding: '1rem', background: 'white',
          borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1rem',
        }}>
          <CornerDownRight size={36} color="#8b5cf6" />
        </div>
        <h1 className={s.title}>{t('title')}</h1>
        <p className={s.subtitle}>{t('subtitle')}</p>
      </header>

      {/* STEP 1: 호칭경 */}
      <section className={s.panel}>
        <div className={s.section_title}>{t('step1_title')}</div>
        <div className={s.size_grid}>
          {SIZES.map((sz) => (
            <button
              key={sz}
              className={`${s.size_btn} ${size === sz ? s.size_btn_active : ''}`}
              onClick={() => setSize(sz)}
              aria-label={sz}
            >
              {sz}
            </button>
          ))}
        </div>
      </section>

      {/* STEP 2: 엘보 종류 */}
      <section className={s.panel}>
        <div className={s.section_title}>{t('step2_title')}</div>
        <div className={s.elbow_grid}>
          {ELBOW_TYPES.map((et) => (
            <button
              key={et}
              className={`${s.elbow_card} ${elbow === et ? s.elbow_card_active : ''}`}
              onClick={() => setElbow(et)}
              aria-label={t(`elbow_${et}` as 'elbow_LR90')}
            >
              <span className={s.elbow_name}>{t(`elbow_${et}` as 'elbow_LR90')}</span>
              <span className={s.elbow_desc}>{t(`elbow_${et}_desc` as 'elbow_LR90_desc')}</span>
            </button>
          ))}
        </div>
      </section>

      {/* STEP 3: 모드 선택 */}
      <section className={s.panel}>
        <div className={s.section_title}>{t('step3_title')}</div>
        <div className={s.mode_grid}>
          {(['simple', 'rolling', 'cut'] as Mode[]).map((m) => (
            <button
              key={m}
              className={`${s.mode_btn} ${mode === m ? s.mode_btn_active : ''}`}
              onClick={() => setMode(m)}
              aria-label={t(`mode_${m}` as 'mode_simple')}
            >
              <span className={s.mode_label}>{t(`mode_${m}` as 'mode_simple')}</span>
              <span className={s.mode_subtext}>{t(`mode_${m}_desc` as 'mode_simple_desc')}</span>
            </button>
          ))}
        </div>
      </section>

      {/* STEP 4: 수치 입력 */}
      <section className={s.panel}>
        <div className={s.section_title}>{t('step4_title')}</div>

        {mode === 'simple' && (
          <div className={s.input_group}>
            <label className={s.input_label}>{t('input_offset')}</label>
            <span className={s.input_hint}>{t('input_offset_hint')}</span>
            <div className={s.input_wrap}>
              <input
                type="text"
                inputMode="decimal"
                className={s.input}
                value={offset}
                onChange={handleInput(setOffset)}
                placeholder="300"
                aria-label={t('input_offset')}
              />
              <span className={s.input_suffix}>mm</span>
            </div>
          </div>
        )}

        {mode === 'rolling' && (
          <>
            <p className={s.input_hint} style={{ marginBottom: '0.85rem' }}>{t('input_rolling_hint')}</p>
            <div className={s.input_group}>
              <label className={s.input_label}>{t('input_horizontal')}</label>
              <div className={s.input_wrap}>
                <input
                  type="text"
                  inputMode="decimal"
                  className={s.input}
                  value={horiz}
                  onChange={handleInput(setHoriz)}
                  placeholder="200"
                  aria-label={t('input_horizontal')}
                />
                <span className={s.input_suffix}>mm</span>
              </div>
            </div>
            <div className={s.input_group}>
              <label className={s.input_label}>{t('input_vertical')}</label>
              <div className={s.input_wrap}>
                <input
                  type="text"
                  inputMode="decimal"
                  className={s.input}
                  value={vert}
                  onChange={handleInput(setVert)}
                  placeholder="150"
                  aria-label={t('input_vertical')}
                />
                <span className={s.input_suffix}>mm</span>
              </div>
            </div>
          </>
        )}

        {mode === 'cut' && (
          <>
            <div className={s.input_group}>
              <label className={s.input_label}>{t('input_distance')}</label>
              <span className={s.input_hint}>{t('input_distance_hint')}</span>
              <div className={s.input_wrap}>
                <input
                  type="text"
                  inputMode="decimal"
                  className={s.input}
                  value={distance}
                  onChange={handleInput(setDistance)}
                  placeholder="500"
                  aria-label={t('input_distance')}
                />
                <span className={s.input_suffix}>mm</span>
              </div>
            </div>
            <div className={s.input_group}>
              <label className={s.input_label}>{t('connection_label')}</label>
              <div className={s.radio_row}>
                <label className={`${s.radio_label} ${connection === 'both' ? s.radio_label_active : ''}`}>
                  <input
                    type="radio"
                    checked={connection === 'both'}
                    onChange={() => setConnection('both')}
                    aria-label={t('connection_both')}
                  />
                  {t('connection_both')}
                </label>
                <label className={`${s.radio_label} ${connection === 'one' ? s.radio_label_active : ''}`}>
                  <input
                    type="radio"
                    checked={connection === 'one'}
                    onChange={() => setConnection('one')}
                    aria-label={t('connection_one')}
                  />
                  {t('connection_one')}
                </label>
              </div>
            </div>
          </>
        )}
      </section>

      {/* STEP 5: 결과 */}
      {calc && (
        <section>
          <div className={s.section_title} style={{ paddingLeft: '0.25rem' }}>{t('step5_title')}</div>
          {!calc.valid ? (
            <div className={s.warn_box}>
              <div className={s.warn_title}>{t('warn_too_short')}</div>
              <div className={s.warn_detail}>{t('warn_min_required', { n: calc.minRequired })}</div>
            </div>
          ) : (
            <div className={s.result_card}>
              <div className={s.result_header}>
                <span className={s.result_summary_text}>
                  {size} · {t(`elbow_${elbow}` as 'elbow_LR90')} · {t(`mode_${mode}` as 'mode_simple')}
                </span>
                <button
                  onClick={handleCopy}
                  className={`${s.copy_btn} ${copied ? s.copy_btn_done : ''}`}
                  aria-label={t('copy_button')}
                >
                  {copied ? t('copy_done') : t('copy_button')}
                </button>
              </div>

              <div className={s.result_cut_label}>{t('result_cut_length')}</div>
              <div className={s.result_cut_value}>
                {calc.cut}<span className={s.result_cut_unit}>mm</span>
              </div>

              <div className={s.result_grid}>
                <div className={s.result_item}>
                  <div className={s.result_item_label}>{t('result_takeout')}</div>
                  <div className={s.result_item_value}>{calc.TO} mm</div>
                </div>
                {calc.run != null && (
                  <div className={s.result_item}>
                    <div className={s.result_item_label}>
                      {mode === 'rolling' ? t('result_travel') : t('result_run')}
                    </div>
                    <div className={s.result_item_value}>{calc.run} mm</div>
                  </div>
                )}
                {calc.diagonal != null && (
                  <div className={s.result_item}>
                    <div className={s.result_item_label}>{t('result_diagonal')}</div>
                    <div className={s.result_item_value}>{calc.diagonal} mm</div>
                  </div>
                )}
                {calc.angle != null && (
                  <div className={s.result_item}>
                    <div className={s.result_item_label}>{t('result_angle')}</div>
                    <div className={s.result_item_value}>{calc.angle}°</div>
                  </div>
                )}
              </div>

              <div className={s.margin_box}>
                <div className={s.margin_title}>{t('result_margin_title')}</div>
                <div className={s.margin_row}>
                  <span>{t('result_margin_5')}</span>
                  <strong>{margin5} mm</strong>
                </div>
                <div className={s.margin_row}>
                  <span>{t('result_margin_10')}</span>
                  <strong>{margin10} mm</strong>
                </div>
              </div>

              <p className={s.insulation_note}>{t('result_insulation_note')}</p>
            </div>
          )}
        </section>
      )}

      {/* STEP 6: SVG 도식도 */}
      {calc && calc.valid && (
        <section className={s.panel}>
          <div className={s.section_title}>{t('step6_title')}</div>
          <div className={s.diagram_wrap}>
            <PipeDiagram mode={mode} cut={calc.cut} TO={calc.TO} angle={calc.angle ?? 0} />
          </div>
        </section>
      )}

      {/* 면책 */}
      <div className={s.disclaimer}>{t('disclaimer')}</div>

      {/* 토스트 */}
      {toast && <div className={s.toast}>{toast}</div>}

      {/* 표준 하단 섹션 */}
      <ShareBar title={t('title')} description={t('subtitle')} />
      <RelatedTools toolId="utilities/utility/elbow-offset" />
      <div className={s.ad_placeholder}>{t('ad_text')}</div>

      <SeoSection
        ko={{
          title: '배관 엘보 오프셋 계산기란?',
          description:
            '배관 엘보 오프셋 계산기는 현장 배관 작업자가 장애물을 피하거나 배관 경로를 변경할 때 필요한 엘보 테이크아웃과 직관 절단길이를 즉시 계산해주는 실무 도구입니다. 단순 오프셋, 가로·세로 동시 이동이 필요한 롤링 오프셋, 두 연결점 사이의 직관 절단길이 등 3가지 계산 모드를 제공합니다. 호칭경(15A~200A)과 엘보 종류(90°·45° 장·단반경)를 선택하면 ASME B16.9 규격 테이블의 테이크아웃 값이 자동 적용되어 현장에서 바로 파이프를 절단할 수 있는 수치가 출력됩니다. SVG 배관 도식도로 배관 형태를 시각적으로 확인할 수 있으며, 5%/10% 여유분 권장 주문 길이도 함께 제공해 시공 오차를 사전에 보완할 수 있습니다.',
          useCases: [
            { icon: '🔧', title: '장애물 우회 배관 계산', desc: '구조물이나 다른 배관을 피해 우회해야 할 때 오프셋 거리를 입력하면 엘보 2개 사이의 직관 절단길이가 즉시 계산됩니다. 현장에서 줄자 하나로 바로 파이프를 절단할 수 있습니다.' },
            { icon: '🔄', title: '롤링 오프셋 3D 계산', desc: '가로와 세로 방향을 동시에 이동해야 하는 롤링 오프셋은 현장에서 계산하기 가장 어려운 케이스입니다. 가로·세로 이동거리를 입력하면 대각선 Travel 거리와 절단길이가 자동 계산됩니다.' },
            { icon: '✂️', title: '정확한 직관 절단길이', desc: '두 연결점 사이의 거리에서 엘보 테이크아웃을 빼야 정확한 직관 길이가 나옵니다. 목표 거리와 엘보 연결 방식을 입력하면 오차 없는 절단 수치를 즉시 확인할 수 있습니다.' },
            { icon: '📱', title: '현장 즉시 활용', desc: '스마트폰으로 호칭경과 엘보 종류만 선택하면 테이크아웃이 자동 적용됩니다. 장갑 낀 손으로도 조작 가능한 큰 버튼 UI로 현장에서 바로 꺼내 쓸 수 있습니다.' },
          ],
          steps: [
            { step: '호칭경 선택', desc: '사용할 배관의 호칭경(15A~200A)을 선택합니다. 버튼을 누르면 해당 호칭경의 NPS 값이 자동으로 적용됩니다.' },
            { step: '엘보 종류 선택', desc: '90° 장반경(LR)은 가장 일반적으로 사용되며, 단반경(SR)은 좁은 공간에 적합합니다. 45° 엘보는 완만한 방향 전환에 사용됩니다.' },
            { step: '계산 모드 선택', desc: '단순 오프셋은 한 방향 이동, 롤링 오프셋은 가로+세로 동시 이동, 직관 절단길이는 두 점 사이의 파이프 길이 계산에 사용합니다. 모드 전환 시 입력값은 유지됩니다.' },
            { step: '수치 입력 → 결과 확인', desc: '거리를 mm 단위로 입력하면 직관 절단길이가 즉시 표시됩니다. SVG 도식도로 배관 형태를 확인하고, 결과 복사 버튼으로 동료와 공유하세요.' },
          ],
          faqs: [
            { q: '테이크아웃(Take-out)이란 무엇인가요?', a: '테이크아웃은 엘보의 중심점에서 파이프 접합면(끝단)까지의 거리입니다. 배관을 설치할 때 두 엘보 사이의 직관 길이를 구하려면 목표 거리에서 양쪽 테이크아웃을 빼야 합니다. 본 계산기는 누적 오차를 방지하기 위해 약식 공식(NPS×1.5) 대신 ASME B16.9 표준 규격 데이터를 직접 적용했습니다. 약식 계산과 최대 1~4mm 차이가 날 수 있습니다.' },
            { q: '장반경(LR)과 단반경(SR) 엘보는 어떻게 다른가요?', a: '장반경(LR) 엘보는 굽힘반경이 공칭 파이프 직경의 1.5배로, 유체 흐름이 완만하고 압력 손실이 적어 대부분의 현장에서 표준으로 사용됩니다. 단반경(SR) 엘보는 굽힘반경이 공칭 직경과 같아 크기가 작아 좁은 공간에 적합하지만, 흐름 저항이 상대적으로 큽니다. 본 계산기는 SR 테이크아웃을 LR × 0.667 비율로 계산합니다 (굽힘반경 비례).' },
            { q: '롤링 오프셋은 언제 사용하나요?', a: '배관이 수평면과 수직면을 동시에 이동해야 할 때 사용합니다. 예를 들어 배관이 오른쪽으로 200mm, 위쪽으로 150mm 동시에 이동해야 한다면 롤링 오프셋 모드에서 가로 200, 세로 150을 입력하면 됩니다. 대각선 이동거리와 배관 기울기 각도, 직관 절단길이가 자동으로 계산됩니다. 이 모드는 구조상 45° 엘보로만 동작합니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 현장 참고용으로만 제공됩니다. 엘보 제조사마다 실제 테이크아웃 치수에 약간의 공차가 있을 수 있으며, 나사식 엘보는 나사 물림 길이를 추가로 고려해야 합니다. 중요한 시공 전에는 반드시 실제 엘보 제품의 치수를 실측하여 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'What is the Pipe Elbow Offset Calculator?',
          description:
            'The Pipe Elbow Offset Calculator instantly computes elbow take-out and pipe cut length for the three most common piping field scenarios: simple offset (one-direction obstacle bypass), rolling offset (horizontal + vertical movement, 3D), and exact cut length between two connection points. Choose your nominal pipe size (15A–200A) and elbow type (90°/45° long or short radius), and the calculator auto-applies the ASME B16.9 standard take-out value to output the exact cut length you need on site. The tool includes an SVG pipe diagram for visual confirmation and 5% / 10% margin order-length suggestions to absorb installation tolerances.',
          useCases: [
            { icon: '🔧', title: 'Obstacle Bypass', desc: 'When routing around structures or other pipes, enter the offset distance and the cut length between the two elbows is instantly shown. Walk to the cutter with just a tape measure.' },
            { icon: '🔄', title: '3D Rolling Offset', desc: 'Rolling offsets (horizontal + vertical at the same time) are the hardest to estimate by hand. Enter horizontal and vertical travel — diagonal Travel distance, tilt angle, and cut length appear automatically.' },
            { icon: '✂️', title: 'Exact Cut Length', desc: 'For two connection points, you must subtract elbow take-out from the centerline distance. Enter the target distance and connection type — exact cut value displays instantly.' },
            { icon: '📱', title: 'On-site Mobile-first', desc: 'Just tap the pipe size and elbow type on your phone — take-out is auto-loaded. Large 48px buttons work with gloved hands, so the calculator is usable in any field condition.' },
          ],
          steps: [
            { step: 'Pick a Pipe Size', desc: 'Tap your nominal pipe size (15A–200A). The corresponding NPS and ASME B16.9 take-out values are loaded automatically.' },
            { step: 'Pick an Elbow Type', desc: '90° Long Radius (LR) is the default for most installations, Short Radius (SR) fits tight spaces. 45° elbows are for gentler direction changes.' },
            { step: 'Pick a Calculation Mode', desc: 'Simple offset = single-direction bypass. Rolling offset = horizontal + vertical at once. Cut length = exact pipe-cut between two connection points. Inputs are preserved when switching modes.' },
            { step: 'Enter Numbers, Get Result', desc: 'Type distances in millimeters and the cut length appears instantly. Check the SVG diagram to confirm the layout, then tap Copy to share with a coworker.' },
          ],
          faqs: [
            { q: 'What is take-out?', a: 'Take-out is the distance from the centerline of an elbow to its weld face (end). To find the cut length between two elbows, you subtract take-out from the centerline distance. This calculator uses ASME B16.9 standard data directly instead of the rough NPS×1.5 formula, which can differ by 1–4 mm and accumulate when multiple elbows are involved.' },
            { q: "What's the difference between LR and SR elbows?", a: 'A Long Radius (LR) elbow has a bend radius 1.5× the nominal pipe diameter, giving smoother flow and lower pressure loss — the standard for most installations. A Short Radius (SR) elbow has a bend radius equal to the nominal diameter, fitting tight spaces but adding flow resistance. SR take-out is calculated as LR × 0.667 (ratio of bend radii).' },
            { q: 'When do I use rolling offset?', a: 'Use it whenever a pipe must move both horizontally and vertically at the same time. For example, 200 mm right and 150 mm up simultaneously — enter 200 horizontal, 150 vertical, and the calculator returns the diagonal travel, pipe tilt angle, and exact cut length. This mode uses 45° elbows by design.' },
            { q: 'Can I use these results as official data?', a: 'These results are for on-site reference only. Real elbow manufacturers have small tolerance variations in take-out, and threaded elbows must also account for thread engagement. Always verify against the actual elbow datasheet and field measurement before final installation.' },
          ],
        }}
      />
    </div>
  );
}

// ── SVG Pipe Diagram ────────────────────────────────────────────
function PipeDiagram({ mode, cut, TO, angle }: { mode: Mode; cut: number; TO: number; angle: number }) {
  const VB_W = 400;
  const VB_H = 200;
  const stroke = '#8b5cf6';
  const muted = '#94a3b8';

  if (mode === 'simple') {
    return (
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className={s.diagram_svg}>
        <line x1="20" y1="60" x2="160" y2="60" stroke={stroke} strokeWidth="6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <path d="M 160 60 Q 200 60 200 100" stroke={stroke} strokeWidth="6" vectorEffect="non-scaling-stroke" fill="none" strokeLinecap="round" />
        <line x1="200" y1="100" x2="200" y2="140" stroke={stroke} strokeWidth="6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <path d="M 200 140 Q 200 180 240 180" stroke={stroke} strokeWidth="6" vectorEffect="non-scaling-stroke" fill="none" strokeLinecap="round" />
        <line x1="240" y1="180" x2="380" y2="180" stroke={stroke} strokeWidth="6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        {/* labels */}
        <text x="225" y="125" fill={stroke} fontSize="14" fontWeight="800">✂ {cut} mm</text>
        <text x="80" y="50" fill={muted} fontSize="11">TO: {TO} mm</text>
        <text x="290" y="170" fill={muted} fontSize="11">TO: {TO} mm</text>
      </svg>
    );
  }

  if (mode === 'rolling') {
    return (
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className={s.diagram_svg}>
        <line x1="20" y1="40" x2="120" y2="40" stroke={stroke} strokeWidth="6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <path d="M 120 40 Q 150 40 150 70" stroke={stroke} strokeWidth="6" vectorEffect="non-scaling-stroke" fill="none" strokeLinecap="round" />
        <line x1="150" y1="70" x2="280" y2="150" stroke={stroke} strokeWidth="6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <path d="M 280 150 Q 280 180 310 180" stroke={stroke} strokeWidth="6" vectorEffect="non-scaling-stroke" fill="none" strokeLinecap="round" />
        <line x1="310" y1="180" x2="380" y2="180" stroke={stroke} strokeWidth="6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <text x="195" y="100" fill={stroke} fontSize="14" fontWeight="800">✂ {cut} mm</text>
        <text x="160" y="125" fill={muted} fontSize="11">∠ {angle}°</text>
      </svg>
    );
  }

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className={s.diagram_svg}>
      <circle cx="40" cy="100" r="14" fill="white" stroke={stroke} strokeWidth="5" />
      <line x1="54" y1="100" x2="346" y2="100" stroke={stroke} strokeWidth="6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      <circle cx="360" cy="100" r="14" fill="white" stroke={stroke} strokeWidth="5" />
      <text x="160" y="80" fill={stroke} fontSize="16" fontWeight="800">✂ {cut} mm</text>
      <text x="30" y="135" fill={muted} fontSize="11">TO: {TO} mm</text>
      <text x="330" y="135" fill={muted} fontSize="11">TO: {TO} mm</text>
    </svg>
  );
}
