'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { Ruler } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  toPyeong, toSqm, supplyFromExclusive, pyeongClass, exclusiveFromClass, unitPrice,
  EXCLUSIVE_RATIO, COMMON_EXCLUSIVE, type BuildingType,
} from '@/lib/pyeong';
import s from './pyeong.module.css';

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
    <button type="button" onClick={copy} className={`${s.copy} ${copied ? s.copy_done : ''}`}>
      {copied ? (isKo ? '✓ 복사됨' : '✓ Copied') : (isKo ? '복사' : 'Copy')}
    </button>
  );
}

export default function PyeongCalcClient() {
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

      <header className={s.header}>
        <div className={s.icon_wrap}><Ruler size={40} /></div>
        <h1 className={s.title}>{t('title')}</h1>
        <p className={s.subtitle}>{t('description')}</p>
      </header>

      <div className={s.tabs} role="tablist" aria-label={isKo ? '계산 종류' : 'Calculator type'}>
        {([
          ['convert', isKo ? '㎡ ↔ 평 변환' : '㎡ ↔ pyeong', isKo ? '단위만 바꾸기' : 'Unit conversion'],
          ['class', isKo ? '몇 평형? (전용 ↔ 평형)' : 'Pyeong class', isKo ? '84㎡ = 34평형' : '84㎡ = 34-pyeong class'],
          ['price', isKo ? '평당 가격' : 'Price per pyeong', isKo ? '매매가 ÷ 면적' : 'Price ÷ area'],
        ] as const).map(([k, label, sub]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k}
            className={`${s.tab} ${tab === k ? s.tab_active : ''}`} onClick={() => setTab(k)}>
            {label}<small>{sub}</small>
          </button>
        ))}
      </div>

      {/* ── ① ㎡ ↔ 평 ── */}
      {tab === 'convert' && (
        <section className={s.card}>
          <div className={s.chips}>
            {(['sqm2pyeong', 'pyeong2sqm'] as const).map(d => (
              <button key={d} type="button" aria-pressed={direction === d}
                className={`${s.chip} ${direction === d ? s.chip_active : ''}`}
                onClick={() => { setDirection(d); setInputVal(''); }}>
                {d === 'sqm2pyeong' ? `㎡ → ${pyUnit}` : `${pyUnit} → ㎡`}
              </button>
            ))}
          </div>
          <div>
            <label className={s.field_label} htmlFor="py-in">{direction === 'sqm2pyeong' ? t('label.sqm') : t('label.pyeong')}</label>
            <div className={s.input_wrap}>
              <input id="py-in" className={s.input} inputMode="decimal" placeholder={direction === 'sqm2pyeong' ? '84' : '34'}
                value={inputVal} onChange={e => setInputVal(decimalInput(e.target.value))} />
              <span className={s.suffix}>{direction === 'sqm2pyeong' ? '㎡' : pyUnit}</span>
            </div>
          </div>
          <div className={s.decimals}>
            <span>{t('label.decimals')}</span>
            {[0, 1, 2, 3, 4].map(d => (
              <button key={d} type="button" aria-pressed={decimals === d} className={`${s.mini} ${decimals === d ? s.mini_active : ''}`} onClick={() => setDecimals(d)}>{d}</button>
            ))}
          </div>
          <div className={s.chips} aria-label={t('label.presets')}>
            {COMMON_EXCLUSIVE.map(e => (
              <button key={e} type="button" className={`${s.mini} ${direction === 'sqm2pyeong' && num === e ? s.mini_active : ''}`} onClick={() => setPreset(e)}>
                {isKo ? `전용 ${e}㎡` : `${e}㎡`}
              </button>
            ))}
          </div>

          {num > 0 && (
            <div className={s.result} aria-live="polite">
              <div className={s.result_main}>
                <div>
                  <div className={s.result_from}>{direction === 'sqm2pyeong' ? `${inputVal} ㎡ =` : `${inputVal} ${pyUnit} =`}</div>
                  <span className={s.result_num}>{direction === 'sqm2pyeong' ? fmt(pyeong) : fmt(sqm)}</span>
                  <span className={s.result_unit}>{direction === 'sqm2pyeong' ? pyUnit : '㎡'}</span>
                </div>
                <CopyButton value={direction === 'sqm2pyeong' ? fmt(pyeong) : fmt(sqm)} isKo={isKo} />
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
          <p className={s.field_hint}>
            {isKo
              ? '※ 1평 = 400/121㎡(약 3.3058㎡). 평은 법정 계량단위가 아니어서 계약서·등기부에는 ㎡로 적습니다.'
              : '※ 1 pyeong = 400/121 ㎡ (≈ 3.3058 ㎡). Pyeong is not a legal unit in Korea; contracts and registries use ㎡.'}
          </p>
        </section>
      )}

      {/* ── ② 전용 ↔ 평형 ── */}
      {tab === 'class' && (
        <section className={s.card}>
          <h2 className={s.card_title}>{isKo ? '전용면적 ↔ 평형' : 'Exclusive area ↔ pyeong class'}</h2>
          <p className={s.hint}>
            {isKo
              ? '"34평형"처럼 부르는 평형은 공용 계단·복도까지 더한 공급면적 기준이라, 광고에 나오는 전용면적을 평으로 바꾼 값보다 큽니다. 전용 84㎡는 전용 기준 25.4평이지만 공급면적이 약 112㎡라 34평형으로 부릅니다.'
              : 'Korean "pyeong classes" are based on supply area, which adds shared stairs and corridors to the exclusive area. An 84㎡ unit is 25.4 pyeong exclusive but about 112㎡ supply, so it is called a 34-pyeong class.'}
          </p>
          <div className={s.chips}>
            <button type="button" aria-pressed={classMode === 'toClass'} className={`${s.chip} ${classMode === 'toClass' ? s.chip_active : ''}`} onClick={() => { setClassMode('toClass'); setClassInput(''); }}>
              {isKo ? '전용면적 → 몇 평형' : 'Exclusive ㎡ → class'}
            </button>
            <button type="button" aria-pressed={classMode === 'toExclusive'} className={`${s.chip} ${classMode === 'toExclusive' ? s.chip_active : ''}`} onClick={() => { setClassMode('toExclusive'); setClassInput(''); }}>
              {isKo ? '평형 → 전용면적' : 'Class → exclusive ㎡'}
            </button>
          </div>
          <div className={s.grid2}>
            <div>
              <label className={s.field_label} htmlFor="py-class">{classMode === 'toClass' ? (isKo ? '전용면적 (㎡)' : 'Exclusive area (㎡)') : (isKo ? '평형' : 'Pyeong class')}</label>
              <div className={s.input_wrap}>
                <input id="py-class" className={s.input} inputMode="decimal" placeholder={classMode === 'toClass' ? '84' : '34'}
                  value={classInput} onChange={e => setClassInput(decimalInput(e.target.value))} />
                <span className={s.suffix}>{classMode === 'toClass' ? '㎡' : (isKo ? '평형' : 'py')}</span>
              </div>
            </div>
            <div>
              <span className={s.field_label}>{isKo ? '건물 유형' : 'Building type'}</span>
              <div className={s.chips}>
                {(Object.keys(EXCLUSIVE_RATIO) as BuildingType[]).map(b => (
                  <button key={b} type="button" aria-pressed={building === b} className={`${s.mini} ${building === b ? s.mini_active : ''}`} onClick={() => { setBuilding(b); setRatioText(''); }}>
                    {buildingName(b)}
                  </button>
                ))}
              </div>
              <div className={s.input_wrap} style={{ marginTop: '0.5rem' }}>
                <input className={s.input} style={{ fontSize: '1rem', minHeight: 44 }} inputMode="decimal" aria-label={isKo ? '전용률' : 'Exclusive ratio'}
                  placeholder={`${Math.round(range.typical * 100)}`} value={ratioText} onChange={e => setRatioText(decimalInput(e.target.value))} />
                <span className={s.suffix}>%</span>
              </div>
              <p className={s.field_hint}>
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
                      <div className={s.result_from}>{isKo ? `전용 ${classInput}㎡ (${buildingName(building)})` : `${classInput}㎡ exclusive (${buildingName(building)})`}</div>
                      <span className={s.result_num}>{isKo ? '약 ' : '≈ '}{pyeongClass(classNum, ratio)}</span>
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
                      <div className={s.result_from}>{isKo ? `${classInput}평형 (${buildingName(building)})` : `${classInput}-pyeong class (${buildingName(building)})`}</div>
                      <span className={s.result_num}>{isKo ? '전용 약 ' : '≈ '}{fmt(exclusiveFromClass(classNum, ratio), 0)}</span>
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
            <div className={s.note}>
              {isKo
                ? '오피스텔은 아파트와 달리 공용 주차장·관리실까지 포함한 계약면적으로 분양하는 경우가 많아, 같은 "평형"이라도 실제 쓰는 전용면적이 아파트보다 훨씬 작습니다.'
                : 'Officetels are often sold by contract area including parking and facilities, so the same "class" has much less usable space than an apartment.'}
            </div>
          )}
        </section>
      )}

      {/* ── ③ 평당 가격 ── */}
      {tab === 'price' && (
        <section className={s.card}>
          <h2 className={s.card_title}>{isKo ? '평당 가격 계산' : 'Price per pyeong'}</h2>
          <div className={s.grid2}>
            <div>
              <label className={s.field_label} htmlFor="py-price">{isKo ? '매매가·분양가 (원)' : 'Price (KRW)'}</label>
              <div className={s.input_wrap}>
                <input id="py-price" className={s.input} inputMode="numeric" placeholder="1,000,000,000"
                  value={priceText} onChange={e => { const n = digits(e.target.value); setPriceText(n ? n.toLocaleString('ko-KR') : ''); }} />
                <span className={s.suffix}>{isKo ? '원' : 'KRW'}</span>
              </div>
              {price > 0 && <p className={s.field_hint}>{krw(price)}</p>}
            </div>
            <div>
              <label className={s.field_label} htmlFor="py-parea">{isKo ? '전용면적 (㎡)' : 'Exclusive area (㎡)'}</label>
              <div className={s.input_wrap}>
                <input id="py-parea" className={s.input} inputMode="decimal" placeholder="84"
                  value={priceArea} onChange={e => setPriceArea(decimalInput(e.target.value))} />
                <span className={s.suffix}>㎡</span>
              </div>
            </div>
          </div>
          {price > 0 && area > 0 && (
            <div className={s.result} aria-live="polite">
              <div className={s.result_main}>
                <div>
                  <div className={s.result_from}>{isKo ? `평형 기준 (약 ${pyeongClass(area, EXCLUSIVE_RATIO.apartment.typical)}평형) 평당가` : `Per pyeong (class ≈ ${pyeongClass(area, EXCLUSIVE_RATIO.apartment.typical)})`}</div>
                  <span className={s.result_num} style={{ fontSize: '1.9rem' }}>{krw(upSupply.perPyeong)}</span>
                </div>
              </div>
              <div className={s.row}>
                <span>{isKo ? '전용면적 기준 평당가' : 'Per exclusive pyeong'}<span className={s.row_sub}>{isKo ? `전용 ${fmt(toPyeong(area), 1)}평으로 나눔` : `÷ ${fmt(toPyeong(area), 1)} py`}</span></span>
                <span className={s.val}>{krw(up.perPyeong)}</span>
              </div>
              <div className={s.row}><span>{isKo ? '전용 ㎡당 가격' : 'Per exclusive ㎡'}</span><span className={s.val}>{krw(up.perSqm)}</span></div>
            </div>
          )}
          <p className={s.field_hint}>
            {isKo
              ? '※ 시세 기사나 분양 광고의 "평당가"는 보통 공급면적(평형) 기준이라 전용면적 기준보다 낮게 나옵니다. 비교할 때는 같은 기준끼리 비교하세요. 평형 기준은 아파트 전용률 75%로 추정한 값입니다.'
              : '※ Prices quoted "per pyeong" in Korean media usually use supply area (the class), which gives a lower figure than exclusive area. The class basis assumes a 75% apartment ratio.'}
          </p>
        </section>
      )}

      {/* ── 환산표 (서버 렌더에도 포함) ── */}
      <section className={s.card} aria-labelledby="py-table">
        <h2 id="py-table" className={s.card_title}>{isKo ? '아파트 전용면적별 평수·평형 환산표' : 'Apartment exclusive area → pyeong and class'}</h2>
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
        <p className={s.field_hint}>{isKo ? '전용률 75% 기준 추정치입니다. 실제 평형은 단지 설계에 따라 1~2평 차이가 날 수 있습니다.' : 'Estimated with a 75% exclusive ratio; actual classes vary by complex.'}</p>
      </section>

      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="utilities/utility/pyeong-calc" />
      <div className={s.ad_slot}>AD</div>

      <SeoSection
        ko={{
          title: '평수 계산기: ㎡를 평으로, 전용면적을 평형으로',
          description: '1평은 400/121㎡, 약 3.3058㎡입니다. ㎡를 3.3058로 나누면 평, 평에 3.3058을 곱하면 ㎡가 됩니다. 그런데 아파트를 "34평형", "24평형"처럼 부를 때의 평형은 광고에 적힌 전용면적이 아니라 계단·복도 같은 주거공용면적까지 더한 공급면적 기준입니다. 그래서 전용 84㎡는 전용 기준으로는 25.4평이지만 공급면적이 약 112㎡라 34평형, 전용 59㎡는 17.8평이지만 약 24평형으로 부릅니다. 이 계산기는 단순 단위 변환과 함께 전용면적을 평형으로, 평형을 전용면적으로 바꿔 주며, 아파트(전용률 약 72~80%), 주상복합, 오피스텔(계약면적 기준 약 45~60%)처럼 건물 유형에 따라 달라지는 전용률을 반영합니다. 매매가나 분양가를 넣으면 평형 기준과 전용면적 기준 평당 가격, ㎡당 가격도 함께 계산합니다. 2007년부터 상거래에서는 평 대신 ㎡를 쓰도록 되어 있어 계약서와 등기부에는 ㎡로 적힌다는 점도 기억해 두세요.',
          useCases: [
            { icon: '🏠', title: '"84㎡는 몇 평형?" 바로 확인', desc: '분양 공고나 매물 광고의 전용 59㎡·84㎡가 흔히 말하는 몇 평형인지(약 24평형·34평형) 확인하고, 전용 기준 평수(17.8평·25.4평)와 함께 비교합니다.' },
            { icon: '🔁', title: '평형으로 들은 집을 ㎡로 환산', desc: '"34평형 아파트"라고 들었을 때 실제 전용면적이 약 84㎡인지, 오피스텔이라면 전용이 훨씬 작은지 건물 유형별 전용률로 역산합니다.' },
            { icon: '💰', title: '평당 가격 비교', desc: '매매가 10억 원 전용 84㎡라면 평형(약 34평) 기준 평당 약 2,952만 원, 전용(25.4평) 기준 약 3,935만 원입니다. 기사 속 평당가와 같은 기준으로 비교할 수 있습니다.' },
            { icon: '📐', title: '인테리어·상가 면적 계산', desc: '도배·장판 견적이나 상가 임대료처럼 평 단위로 말하는 견적을 ㎡와 오가며 확인하고, 소수점 자리수를 골라 복사합니다.' },
          ],
          steps: [
            { step: '계산 종류 고르기', desc: '단위만 바꾸려면 "㎡ ↔ 평 변환", 몇 평형인지 알고 싶으면 "몇 평형?", 가격 비교는 "평당 가격" 탭을 고릅니다.' },
            { step: '면적 입력', desc: '㎡나 평을 입력하거나 전용 59㎡·84㎡ 같은 대표 면적 버튼을 누릅니다. 평형 계산에서는 아파트·주상복합·오피스텔 중 유형을 고르고, 공급면적을 알면 전용률을 직접 넣습니다.' },
            { step: '결과 확인', desc: '변환된 평수나 ㎡, 추정 평형과 단지별 범위, 공급면적, 평당 가격(평형 기준·전용 기준)과 ㎡당 가격을 확인합니다.' },
            { step: '복사·비교', desc: '복사 버튼으로 결과를 붙여 넣거나, 아래 환산표로 대표 전용면적별 평수와 평형을 한눈에 비교합니다.' },
          ],
          faqs: [
            { q: '전용 84㎡는 왜 25평형이 아니라 34평형인가요?', a: '84㎡를 3.3058로 나누면 25.4평이지만, 평형은 전용면적에 계단·복도·엘리베이터 같은 주거공용면적을 더한 공급면적으로 부르기 때문입니다. 전용 84㎡ 아파트의 공급면적은 보통 110~115㎡로, 평으로 바꾸면 약 34평입니다.' },
            { q: '1평은 정확히 몇 ㎡인가요?', a: '1평은 사방 6자(1자 = 10/33m)인 정사각형 넓이로 400/121㎡, 약 3.305785㎡입니다. 보통 3.3058로 계산하며, ㎡ × 0.3025로 평을 구하기도 합니다.' },
            { q: '오피스텔 평형은 아파트와 어떻게 다른가요?', a: '오피스텔은 공용 주차장·관리시설까지 포함한 계약면적으로 분양하는 경우가 많아 전용률이 45~60% 정도입니다. 그래서 같은 "20평형"이라도 아파트보다 실제 쓰는 전용면적이 훨씬 작습니다.' },
            { q: '평당 가격은 어떤 면적으로 나누나요?', a: '언론 기사나 분양 광고의 평당가는 보통 공급면적(평형) 기준입니다. 같은 집도 전용면적으로 나누면 평당가가 더 높게 나오므로, 두 가격을 비교할 때는 같은 기준끼리 비교해야 합니다.' },
          ],
        }}
        en={{
          title: 'Pyeong calculator: ㎡ to pyeong and Korean apartment classes',
          description: 'One pyeong is 400/121 ㎡, about 3.3058 ㎡: divide square metres by 3.3058 for pyeong, or multiply pyeong by 3.3058 for square metres. Korean apartments, however, are described by a "pyeong class" such as 34 or 24, which is based on supply area — the exclusive area shown in listings plus shared stairs and corridors. An 84㎡ unit is 25.4 pyeong exclusive but about 112㎡ of supply area, so it is a 34-pyeong class; a 59㎡ unit is 17.8 pyeong but roughly a 24-pyeong class. Besides plain conversion, this calculator turns exclusive area into a class and back, using typical exclusive ratios for apartments (about 72–80%), mixed-use towers and officetels (about 45–60% of contract area). Enter a price to get the price per pyeong on both the class and exclusive basis, plus the price per ㎡. Since 2007, contracts and registries in Korea must use ㎡ rather than pyeong.',
          useCases: [
            { icon: '🏠', title: 'What Class Is 84㎡?', desc: 'See that exclusive 59㎡ and 84㎡ units are roughly 24- and 34-pyeong classes, alongside their exclusive pyeong (17.8 and 25.4).' },
            { icon: '🔁', title: 'From Class Back to ㎡', desc: 'Heard "34-pyeong apartment"? Estimate the exclusive area (about 84㎡), or see how much smaller an officetel of the same class is.' },
            { icon: '💰', title: 'Compare Price per Pyeong', desc: 'A ₩1 billion 84㎡ flat is about ₩29.5 million per pyeong on the class basis and ₩39.4 million per exclusive pyeong.' },
            { icon: '📐', title: 'Interiors and Shops', desc: 'Switch between pyeong and ㎡ for flooring quotes or shop rents, choose decimal places and copy the result.' },
          ],
          steps: [
            { step: 'Pick a Tab', desc: 'Use unit conversion, the pyeong class tab, or the price per pyeong tab.' },
            { step: 'Enter an Area', desc: 'Type ㎡ or pyeong, or tap a common size like 59㎡ or 84㎡. For classes choose apartment, mixed-use or officetel, or enter a known exclusive ratio.' },
            { step: 'Read the Result', desc: 'See the converted value, estimated class and typical range, supply area, and prices per pyeong and per ㎡.' },
            { step: 'Copy or Compare', desc: 'Copy the result or use the table to compare common apartment sizes at a glance.' },
          ],
          faqs: [
            { q: 'Why is 84㎡ a 34-pyeong class, not 25?', a: '84 ÷ 3.3058 is 25.4 pyeong, but classes use supply area, which adds shared stairs, corridors and lifts. An 84㎡ apartment usually has 110–115㎡ of supply area, about 34 pyeong.' },
            { q: 'Exactly how big is one pyeong?', a: 'A square six ja on each side, with one ja being 10/33 m: 400/121 ㎡ ≈ 3.305785 ㎡. Multiplying ㎡ by 0.3025 also gives pyeong.' },
            { q: 'How do officetel classes differ?', a: 'Officetels are often sold by contract area including parking and facilities, with an exclusive ratio of about 45–60%, so the same class has much less usable space than an apartment.' },
            { q: 'Which area is used for price per pyeong?', a: 'Korean media and sales ads usually divide by supply area. Dividing by exclusive area gives a higher figure, so compare like with like.' },
          ],
        }}
      />
    </div>
  );
}
