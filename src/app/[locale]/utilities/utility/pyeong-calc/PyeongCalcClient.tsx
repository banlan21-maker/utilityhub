'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { Ruler } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  toPyeong, toSqm, supplyFromExclusive, pyeongClass, exclusiveFromClass, unitPrice,
  EXCLUSIVE_RATIO, COMMON_EXCLUSIVE, type BuildingType,
} from '@/lib/pyeong';
import s from './pyeong.module.css';
import { ui } from '@/app/components/ui';

type Tab = 'convert' | 'class' | 'price';

const decimalInput = (v: string) => {
  const [int, ...dec] = v.replace(/[^0-9.]/g, '').split('.');
  return dec.length ? `${int}.${dec.join('').slice(0, 4)}` : int;
};
const digits = (v: string) => Number(v.replace(/[^0-9]/g, '')) || 0;

function CopyButton({ value, isKo }: { value: string; isKo: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* 클립보드 권한이 없으면 무시 */ }
  };
  return (
    <button type="button" onClick={copy} className={`${ui.button} ${ui.sm} ${copied ? ui.primary : ui.secondary}`}>
      {copied ? (isKo ? '✓ 복사됨' : '✓ Copied') : (isKo ? '복사' : 'Copy')}
    </button>
  );
}

export default function PyeongCalcClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('Area');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [tab, setTab] = useState<Tab>('convert');

  // ① ㎡ ↔ 평
  const [direction, setDirection] = useState<'sqm2pyeong' | 'pyeong2sqm'>('sqm2pyeong');
  const [inputVal, setInputVal] = useState('');
  const [decimals, setDecimals] = useState(2);

  // ② 전용면적 ↔ 평형
  const [classMode, setClassMode] = useState<'toClass' | 'toExclusive'>('toClass');
  const [classInput, setClassInput] = useState('');
  const [building, setBuilding] = useState<BuildingType>('apartment');
  const [ratioText, setRatioText] = useState('');

  // ③ 평당 가격
  const [priceText, setPriceText] = useState('');
  const [priceArea, setPriceArea] = useState('');

  const fmt = (n: number, d = decimals) => n.toLocaleString(isKo ? 'ko-KR' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const pyUnit = isKo ? '평' : 'py';

  const num = parseFloat(inputVal) || 0;
  const sqm = direction === 'sqm2pyeong' ? num : toSqm(num);
  const pyeong = direction === 'pyeong2sqm' ? num : toPyeong(num);

  const range = EXCLUSIVE_RATIO[building];
  const customRatio = parseFloat(ratioText);
  const ratio = customRatio > 10 && customRatio < 100 ? customRatio / 100 : range.typical;
  const classNum = parseFloat(classInput) || 0;

  const price = digits(priceText);
  const area = parseFloat(priceArea) || 0;
  const up = unitPrice(price, area);
  const upSupply = unitPrice(price, supplyFromExclusive(area, EXCLUSIVE_RATIO.apartment.typical));

  /** 원 → "3억 9,354만 원" / "39,354,583원" 식 표기 */
  const krw = (n: number) => {
    if (!isKo) return `₩${Math.round(n).toLocaleString('en-US')}`;
    const v = Math.round(n / 10000);
    const eok = Math.floor(v / 10000), man = v % 10000;
    return eok > 0 ? `${eok.toLocaleString('ko-KR')}억${man ? ` ${man.toLocaleString('ko-KR')}만` : ''} 원` : `${man.toLocaleString('ko-KR')}만 원`;
  };

  const buildingName = (b: BuildingType) => ({
    apartment: isKo ? '아파트' : 'Apartment',
    mixed: isKo ? '주상복합' : 'Mixed-use',
    officetel: isKo ? '오피스텔' : 'Officetel',
  })[b];

  const setPreset = (exclusive: number) => {
    setTab('convert');
    setDirection('sqm2pyeong');
    setInputVal(String(exclusive));
  };

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<Ruler />} title={t('title')} subtitle={t('description')} />

      <section className={`${ui.card} ${s.card}`} aria-labelledby="py-what">
        <h2 id="py-what" className={ui.cardTitle}>{isKo ? '1평은 몇 ㎡? — 평 환산표' : 'What is a pyeong? 1 pyeong = 3.3058 m²'}</h2>
        <p className={s.hint}>{isKo
          ? '평(坪)은 사방 6자(1자 = 10/33m)인 정사각형 넓이로, 1평 = 400/121㎡ ≈ 3.3058㎡(약 35.58ft²)입니다. 일본의 쓰보(坪)와 같은 크기로 다다미 2장 정도이며, ㎡에 0.3025를 곱하면 평이 됩니다.'
          : 'A pyeong (평, 坪) is the traditional Korean unit of floor area: a square six ja (10/33 m) on each side, so 1 pyeong = 400/121 m² ≈ 3.3058 m² ≈ 35.58 ft² — the same as the Japanese tsubo, roughly two tatami mats. Multiply pyeong by 3.3058 for square meters, or square meters by 0.3025 for pyeong. Koreans still describe apartments and shops in pyeong, although contracts must use m².'}</p>
        <div className={s.table_wrap}>
          <table className={s.table}>
            <thead><tr><th scope="col">{isKo ? '평' : 'Pyeong'}</th><th scope="col">㎡</th><th scope="col">ft²</th></tr></thead>
            <tbody>
              {[1, 10, 20, 24, 30, 33, 34].map(p => (
                <tr key={p}><th scope="row" style={{ fontWeight: 600 }}>{p}{isKo ? '평' : ' pyeong'}</th><td>{fmt(toSqm(p), 2)} ㎡</td><td>{fmt(toSqm(p) * 10.7639104, 1)} ft²</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className={`${ui.segmented} ${s.tabs}`} role="tablist" aria-label={isKo ? '계산 종류' : 'Calculator type'}>
        {([
          ['convert', isKo ? '㎡ ↔ 평 변환' : '㎡ ↔ pyeong', isKo ? '단위만 바꾸기' : 'Unit conversion'],
          ['class', isKo ? '몇 평형? (전용 ↔ 평형)' : 'Pyeong class', isKo ? '84㎡ = 34평형' : '84㎡ = 34-pyeong class'],
          ['price', isKo ? '평당 가격' : 'Price per pyeong', isKo ? '매매가 ÷ 면적' : 'Price ÷ area'],
        ] as const).map(([k, label, sub]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k}
            className={`${ui.segment} ${tab === k ? ui.segmentActive : ''}`} onClick={() => setTab(k)}>
            {label}<small>{sub}</small>
          </button>
        ))}
      </div>

      {/* ── ① ㎡ ↔ 평 ── */}
      {tab === 'convert' && (
        <section className={`${ui.card} ${s.card}`}>
          <div className={`${ui.chips} ${ui.grow}`}>
            {(['sqm2pyeong', 'pyeong2sqm'] as const).map(d => (
              <button key={d} type="button" aria-pressed={direction === d}
                className={`${ui.chip} ${direction === d ? ui.chipActive : ''}`}
                onClick={() => { setDirection(d); setInputVal(''); }}>
                {d === 'sqm2pyeong' ? `㎡ → ${pyUnit}` : `${pyUnit} → ㎡`}
              </button>
            ))}
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="py-in">{direction === 'sqm2pyeong' ? t('label.sqm') : t('label.pyeong')}</label>
            <div className={ui.inputGroup}>
              <input id="py-in" className={`${ui.input} ${ui.inputLg}`} inputMode="decimal" placeholder={direction === 'sqm2pyeong' ? '84' : '34'}
                value={inputVal} onChange={e => setInputVal(decimalInput(e.target.value))} />
              <span className={ui.unit}>{direction === 'sqm2pyeong' ? '㎡' : pyUnit}</span>
            </div>
          </div>
          <div className={s.decimals}>
            <span>{t('label.decimals')}</span>
            {[0, 1, 2, 3, 4].map(d => (
              <button key={d} type="button" aria-pressed={decimals === d} className={`${ui.chip} ${ui.pill} ${decimals === d ? ui.chipActive : ''}`} onClick={() => setDecimals(d)}>{d}</button>
            ))}
          </div>
          <div className={ui.chips} aria-label={t('label.presets')}>
            {COMMON_EXCLUSIVE.map(e => (
              <button key={e} type="button" className={`${ui.chip} ${ui.pill} ${direction === 'sqm2pyeong' && num === e ? ui.chipActive : ''}`} onClick={() => setPreset(e)}>
                {isKo ? `전용 ${e}㎡` : `${e}㎡`}
              </button>
            ))}
          </div>

          {num > 0 && (
            <div className={s.result} aria-live="polite">
              <div className={s.result_main}>
                <div>
                  <div className={ui.resultLabel}>{direction === 'sqm2pyeong' ? `${inputVal} ㎡ =` : `${inputVal} ${pyUnit} =`}</div>
                  <span className={ui.resultValue}>{direction === 'sqm2pyeong' ? fmt(pyeong) : fmt(sqm)}</span>
                  <span className={s.result_unit}>{direction === 'sqm2pyeong' ? pyUnit : '㎡'}</span>
                </div>
                <CopyButton value={direction === 'sqm2pyeong' ? fmt(pyeong) : fmt(sqm)} isKo={isKo} />
              </div>
              <div className={s.row}>
                <span>{isKo ? '제곱피트' : 'Square feet'}</span>
                <span className={s.val}>{fmt(sqm * 10.7639104, 1)} ft²</span>
              </div>
              {direction === 'sqm2pyeong' && (
                <div className={s.row}>
                  <span>
                    {isKo ? '이 면적이 전용면적이라면 아파트 기준' : 'If this is the exclusive area (apartment)'}
                    <span className={s.row_sub}>{isKo ? '공급면적(전용률 약 75%) 기준 평형' : 'pyeong class by supply area (≈75% ratio)'}</span>
                  </span>
                  <span className={s.val}>{isKo ? `약 ${pyeongClass(sqm, EXCLUSIVE_RATIO.apartment.typical)}평형` : `≈ ${pyeongClass(sqm, EXCLUSIVE_RATIO.apartment.typical)}-pyeong class`}</span>
                </div>
              )}
            </div>
          )}
          <p className={ui.hint}>
            {isKo
              ? '※ 1평 = 400/121㎡(약 3.3058㎡). 평은 법정 계량단위가 아니어서 계약서·등기부에는 ㎡로 적습니다.'
              : '※ 1 pyeong = 400/121 ㎡ (≈ 3.3058 ㎡). Pyeong is not a legal unit in Korea; contracts and registries use ㎡.'}
          </p>
        </section>
      )}

      {/* ── ② 전용 ↔ 평형 ── */}
      {tab === 'class' && (
        <section className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{isKo ? '전용면적 ↔ 평형' : 'Exclusive area ↔ pyeong class'}</h2>
          <p className={s.hint}>
            {isKo
              ? '"34평형"처럼 부르는 평형은 공용 계단·복도까지 더한 공급면적 기준이라, 광고에 나오는 전용면적을 평으로 바꾼 값보다 큽니다. 전용 84㎡는 전용 기준 25.4평이지만 공급면적이 약 112㎡라 34평형으로 부릅니다.'
              : 'Korean "pyeong classes" are based on supply area, which adds shared stairs and corridors to the exclusive area. An 84㎡ unit is 25.4 pyeong exclusive but about 112㎡ supply, so it is called a 34-pyeong class.'}
          </p>
          <div className={`${ui.chips} ${ui.grow}`}>
            <button type="button" aria-pressed={classMode === 'toClass'} className={`${ui.chip} ${classMode === 'toClass' ? ui.chipActive : ''}`} onClick={() => { setClassMode('toClass'); setClassInput(''); }}>
              {isKo ? '전용면적 → 몇 평형' : 'Exclusive ㎡ → class'}
            </button>
            <button type="button" aria-pressed={classMode === 'toExclusive'} className={`${ui.chip} ${classMode === 'toExclusive' ? ui.chipActive : ''}`} onClick={() => { setClassMode('toExclusive'); setClassInput(''); }}>
              {isKo ? '평형 → 전용면적' : 'Class → exclusive ㎡'}
            </button>
          </div>
          <div className={s.grid2}>
            <div className={ui.field}>
              <label className={ui.label} htmlFor="py-class">{classMode === 'toClass' ? (isKo ? '전용면적 (㎡)' : 'Exclusive area (㎡)') : (isKo ? '평형' : 'Pyeong class')}</label>
              <div className={ui.inputGroup}>
                <input id="py-class" className={`${ui.input} ${ui.inputLg}`} inputMode="decimal" placeholder={classMode === 'toClass' ? '84' : '34'}
                  value={classInput} onChange={e => setClassInput(decimalInput(e.target.value))} />
                <span className={ui.unit}>{classMode === 'toClass' ? '㎡' : (isKo ? '평형' : 'py')}</span>
              </div>
            </div>
            <div className={ui.field}>
              <span className={ui.label}>{isKo ? '건물 유형' : 'Building type'}</span>
              <div className={ui.chips}>
                {(Object.keys(EXCLUSIVE_RATIO) as BuildingType[]).map(b => (
                  <button key={b} type="button" aria-pressed={building === b} className={`${ui.chip} ${ui.pill} ${building === b ? ui.chipActive : ''}`} onClick={() => { setBuilding(b); setRatioText(''); }}>
                    {buildingName(b)}
                  </button>
                ))}
              </div>
              <div className={ui.inputGroup} style={{ marginTop: '0.25rem' }}>
                <input className={ui.input} inputMode="decimal" aria-label={isKo ? '전용률' : 'Exclusive ratio'}
                  placeholder={`${Math.round(range.typical * 100)}`} value={ratioText} onChange={e => setRatioText(decimalInput(e.target.value))} />
                <span className={ui.unit}>%</span>
              </div>
              <p className={ui.hint}>
                {isKo
                  ? `전용률(전용 ÷ ${building === 'officetel' ? '계약' : '공급'}면적). ${buildingName(building)}은 보통 ${Math.round(range.min * 100)}~${Math.round(range.max * 100)}%. 분양 공고의 공급면적을 알면 직접 넣으세요.`
                  : `Exclusive ratio; ${buildingName(building)} is usually ${Math.round(range.min * 100)}–${Math.round(range.max * 100)}%.`}
              </p>
            </div>
          </div>

          {classNum > 0 && (
            <div className={s.result} aria-live="polite">
              {classMode === 'toClass' ? (
                <>
                  <div className={s.result_main}>
                    <div>
                      <div className={ui.resultLabel}>{isKo ? `전용 ${classInput}㎡ (${buildingName(building)})` : `${classInput}㎡ exclusive (${buildingName(building)})`}</div>
                      <span className={ui.resultValue}>{isKo ? '약 ' : '≈ '}{pyeongClass(classNum, ratio)}</span>
                      <span className={s.result_unit}>{isKo ? '평형' : '-pyeong class'}</span>
                    </div>
                  </div>
                  <div className={s.row}><span>{isKo ? '전용면적 평수' : 'Exclusive area'}</span><span className={s.val}>{fmt(toPyeong(classNum), 1)} {pyUnit}</span></div>
                  <div className={s.row}><span>{isKo ? `${building === 'officetel' ? '계약' : '공급'}면적 (추정)` : 'Supply area (est.)'}<span className={s.row_sub}>{isKo ? `전용률 ${Math.round(ratio * 100)}% 가정` : `${Math.round(ratio * 100)}% ratio`}</span></span><span className={s.val}>{fmt(supplyFromExclusive(classNum, ratio), 1)} ㎡</span></div>
                  {!ratioText && (
                    <div className={s.row}><span>{isKo ? '단지에 따라' : 'Typical range'}</span><span className={s.val}>{pyeongClass(classNum, range.max)}~{pyeongClass(classNum, range.min)}{isKo ? '평형' : ' py'}</span></div>
                  )}
                </>
              ) : (
                <>
                  <div className={s.result_main}>
                    <div>
                      <div className={ui.resultLabel}>{isKo ? `${classInput}평형 (${buildingName(building)})` : `${classInput}-pyeong class (${buildingName(building)})`}</div>
                      <span className={ui.resultValue}>{isKo ? '전용 약 ' : '≈ '}{fmt(exclusiveFromClass(classNum, ratio), 0)}</span>
                      <span className={s.result_unit}>㎡</span>
                    </div>
                  </div>
                  <div className={s.row}><span>{isKo ? `${building === 'officetel' ? '계약' : '공급'}면적` : 'Supply area'}</span><span className={s.val}>{fmt(toSqm(classNum), 1)} ㎡</span></div>
                  <div className={s.row}><span>{isKo ? '전용면적 평수' : 'Exclusive pyeong'}</span><span className={s.val}>{fmt(toPyeong(exclusiveFromClass(classNum, ratio)), 1)} {pyUnit}</span></div>
                  {!ratioText && (
                    <div className={s.row}><span>{isKo ? '단지에 따라 전용' : 'Typical exclusive range'}</span><span className={s.val}>{fmt(exclusiveFromClass(classNum, range.min), 0)}~{fmt(exclusiveFromClass(classNum, range.max), 0)} ㎡</span></div>
                  )}
                </>
              )}
            </div>
          )}
          {building === 'officetel' && (
            <div className={`${ui.notice} ${ui.amber}`}>
              {isKo
                ? '오피스텔은 아파트와 달리 공용 주차장·관리실까지 포함한 계약면적으로 분양하는 경우가 많아, 같은 "평형"이라도 실제 쓰는 전용면적이 아파트보다 훨씬 작습니다.'
                : 'Officetels are often sold by contract area including parking and facilities, so the same "class" has much less usable space than an apartment.'}
            </div>
          )}
        </section>
      )}

      {/* ── ③ 평당 가격 ── */}
      {tab === 'price' && (
        <section className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{isKo ? '평당 가격 계산' : 'Price per pyeong'}</h2>
          <div className={s.grid2}>
            <div className={ui.field}>
              <label className={ui.label} htmlFor="py-price">{isKo ? '매매가·분양가 (원)' : 'Price (KRW)'}</label>
              <div className={ui.inputGroup}>
                <input id="py-price" className={`${ui.input} ${ui.inputLg}`} inputMode="numeric" placeholder="1,000,000,000"
                  value={priceText} onChange={e => { const n = digits(e.target.value); setPriceText(n ? n.toLocaleString('ko-KR') : ''); }} />
                <span className={ui.unit}>{isKo ? '원' : 'KRW'}</span>
              </div>
              {price > 0 && <p className={ui.hint}>{krw(price)}</p>}
            </div>
            <div className={ui.field}>
              <label className={ui.label} htmlFor="py-parea">{isKo ? '전용면적 (㎡)' : 'Exclusive area (㎡)'}</label>
              <div className={ui.inputGroup}>
                <input id="py-parea" className={`${ui.input} ${ui.inputLg}`} inputMode="decimal" placeholder="84"
                  value={priceArea} onChange={e => setPriceArea(decimalInput(e.target.value))} />
                <span className={ui.unit}>㎡</span>
              </div>
            </div>
          </div>
          {price > 0 && area > 0 && (
            <div className={s.result} aria-live="polite">
              <div className={s.result_main}>
                <div>
                  <div className={ui.resultLabel}>{isKo ? `평형 기준 (약 ${pyeongClass(area, EXCLUSIVE_RATIO.apartment.typical)}평형) 평당가` : `Per pyeong (class ≈ ${pyeongClass(area, EXCLUSIVE_RATIO.apartment.typical)})`}</div>
                  <span className={ui.resultValue} style={{ fontSize: '1.9rem' }}>{krw(upSupply.perPyeong)}</span>
                </div>
              </div>
              <div className={s.row}>
                <span>{isKo ? '전용면적 기준 평당가' : 'Per exclusive pyeong'}<span className={s.row_sub}>{isKo ? `전용 ${fmt(toPyeong(area), 1)}평으로 나눔` : `÷ ${fmt(toPyeong(area), 1)} py`}</span></span>
                <span className={s.val}>{krw(up.perPyeong)}</span>
              </div>
              <div className={s.row}><span>{isKo ? '전용 ㎡당 가격' : 'Per exclusive ㎡'}</span><span className={s.val}>{krw(up.perSqm)}</span></div>
            </div>
          )}
          <p className={ui.hint}>
            {isKo
              ? '※ 시세 기사나 분양 광고의 "평당가"는 보통 공급면적(평형) 기준이라 전용면적 기준보다 낮게 나옵니다. 비교할 때는 같은 기준끼리 비교하세요. 평형 기준은 아파트 전용률 75%로 추정한 값입니다.'
              : '※ Prices quoted "per pyeong" in Korean media usually use supply area (the class), which gives a lower figure than exclusive area. The class basis assumes a 75% apartment ratio.'}
          </p>
        </section>
      )}

      {/* ── 환산표 (서버 렌더에도 포함) ── */}
      <section className={`${ui.card} ${s.card}`} aria-labelledby="py-table">
        <h2 id="py-table" className={ui.cardTitle}>{isKo ? '아파트 전용면적별 평수·평형 환산표' : 'Apartment exclusive area → pyeong and class'}</h2>
        <div className={s.table_wrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th scope="col">{isKo ? '전용면적' : 'Exclusive'}</th>
                <th scope="col">{isKo ? '전용 평수' : 'Exclusive py'}</th>
                <th scope="col">{isKo ? '공급면적(추정)' : 'Supply (est.)'}</th>
                <th scope="col">{isKo ? '통상 평형' : 'Class'}</th>
              </tr>
            </thead>
            <tbody>
              {COMMON_EXCLUSIVE.map(e => (
                <tr key={e}>
                  <th scope="row" style={{ fontWeight: 600 }}>{e}㎡</th>
                  <td>{fmt(toPyeong(e), 1)}{pyUnit}</td>
                  <td>{fmt(supplyFromExclusive(e, EXCLUSIVE_RATIO.apartment.typical), 0)}㎡</td>
                  <td><strong>{isKo ? `약 ${pyeongClass(e, EXCLUSIVE_RATIO.apartment.typical)}평형` : `≈ ${pyeongClass(e, EXCLUSIVE_RATIO.apartment.typical)}`}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={ui.hint}>{isKo ? '전용률 75% 기준 추정치입니다. 실제 평형은 단지 설계에 따라 1~2평 차이가 날 수 있습니다.' : 'Estimated with a 75% exclusive ratio; actual classes vary by complex.'}</p>
      </section>

      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="utilities/utility/pyeong-calc" />

      {seo}
    </div>
  );
}
