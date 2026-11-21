'use client';

import { useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Calculator } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import SeoSection from '@/app/components/SeoSection';
import { ui } from '@/app/components/ui';
import s from './unit-converter.module.css';

// ─── Unit Data ───────────────────────────────────────────────────────────────

interface Unit {
  id: string;
  label: string;
  toBase: number; // multiply to convert to base unit
}

interface Category {
  id: string;
  icon: string;
  units: Unit[];
  defaultFrom: string;
  defaultTo: string;
  refValues: number[];
}

const CATEGORIES: Category[] = [
  {
    id: 'length', icon: '📏',
    defaultFrom: 'm', defaultTo: 'ft',
    refValues: [1, 10, 100, 1000],
    units: [
      { id: 'mm',  label: 'mm',   toBase: 0.001 },
      { id: 'cm',  label: 'cm',   toBase: 0.01 },
      { id: 'm',   label: 'm',    toBase: 1 },
      { id: 'km',  label: 'km',   toBase: 1000 },
      { id: 'in',  label: 'inch', toBase: 0.0254 },
      { id: 'ft',  label: 'ft',   toBase: 0.3048 },
      { id: 'yd',  label: 'yard', toBase: 0.9144 },
      { id: 'mi',  label: 'mile', toBase: 1609.344 },
      { id: 'nmi', label: 'nmi',  toBase: 1852 },
    ],
  },
  {
    id: 'area', icon: '📐',
    defaultFrom: 'm2', defaultTo: 'pyeong',
    refValues: [1, 10, 59, 84, 100],
    units: [
      { id: 'mm2',    label: 'mm²',    toBase: 1e-6 },
      { id: 'cm2',    label: 'cm²',    toBase: 1e-4 },
      { id: 'm2',     label: 'm²',     toBase: 1 },
      { id: 'km2',    label: 'km²',    toBase: 1e6 },
      { id: 'pyeong', label: '평',     toBase: 3.30579 },
      { id: 'sqft',   label: 'ft²',    toBase: 0.092903 },
      { id: 'acre',   label: 'acre',   toBase: 4046.86 },
      { id: 'ha',     label: 'ha',     toBase: 10000 },
    ],
  },
  {
    id: 'weight', icon: '⚖️',
    defaultFrom: 'kg', defaultTo: 'lb',
    refValues: [1, 5, 10, 50, 100],
    units: [
      { id: 'mg',   label: 'mg',  toBase: 0.001 },
      { id: 'g',    label: 'g',   toBase: 1 },
      { id: 'kg',   label: 'kg',  toBase: 1000 },
      { id: 'ton',  label: 'ton', toBase: 1e6 },
      { id: 'lb',   label: 'lb',  toBase: 453.592 },
      { id: 'oz',   label: 'oz',  toBase: 28.3495 },
      { id: 'geun', label: '근',  toBase: 600 },
      { id: 'don',  label: '돈',  toBase: 3.75 },
    ],
  },
  {
    id: 'volume', icon: '🧪',
    defaultFrom: 'l', defaultTo: 'gal',
    refValues: [1, 2, 5, 10, 20],
    units: [
      { id: 'ml',   label: 'mL',   toBase: 1 },
      { id: 'l',    label: 'L',    toBase: 1000 },
      { id: 'cc',   label: 'cc',   toBase: 1 },
      { id: 'tsp',  label: 'tsp',  toBase: 4.92892 },
      { id: 'tbsp', label: 'tbsp', toBase: 14.7868 },
      { id: 'cup',  label: 'cup',  toBase: 236.588 },
      { id: 'pt',   label: 'pt',   toBase: 473.176 },
      { id: 'qt',   label: 'qt',   toBase: 946.353 },
      { id: 'gal',  label: 'gal',  toBase: 3785.41 },
    ],
  },
  {
    id: 'temperature', icon: '🌡️',
    defaultFrom: 'c', defaultTo: 'f',
    refValues: [0, 20, 37, 100],
    units: [
      { id: 'c', label: '°C', toBase: 1 },
      { id: 'f', label: '°F', toBase: 1 },
      { id: 'k', label: 'K',  toBase: 1 },
    ],
  },
  {
    id: 'speed', icon: '🚀',
    defaultFrom: 'kmh', defaultTo: 'mph',
    refValues: [30, 60, 100, 200, 300],
    units: [
      { id: 'ms',   label: 'm/s',  toBase: 1 },
      { id: 'kmh',  label: 'km/h', toBase: 1 / 3.6 },
      { id: 'mph',  label: 'mph',  toBase: 0.44704 },
      { id: 'knot', label: 'knot', toBase: 0.514444 },
      { id: 'mach', label: 'Mach', toBase: 340.29 },
    ],
  },
  {
    id: 'data', icon: '💾',
    defaultFrom: 'gb', defaultTo: 'mb',
    refValues: [1, 8, 16, 32, 128],
    units: [
      { id: 'bit', label: 'bit', toBase: 1 },
      { id: 'b',   label: 'B',   toBase: 8 },
      { id: 'kb',  label: 'KB',  toBase: 8192 },
      { id: 'mb',  label: 'MB',  toBase: 8388608 },
      { id: 'gb',  label: 'GB',  toBase: 8589934592 },
      { id: 'tb',  label: 'TB',  toBase: 8796093022208 },
      { id: 'pb',  label: 'PB',  toBase: 9007199254740992 },
    ],
  },
  {
    id: 'time', icon: '⏱️',
    defaultFrom: 'h', defaultTo: 's',
    refValues: [1, 6, 12, 24, 48],
    units: [
      { id: 'ms_t',  label: 'ms',   toBase: 0.001 },
      { id: 's',     label: 's',    toBase: 1 },
      { id: 'min',   label: 'min',  toBase: 60 },
      { id: 'h',     label: 'h',    toBase: 3600 },
      { id: 'day',   label: 'day',  toBase: 86400 },
      { id: 'week',  label: 'week', toBase: 604800 },
      { id: 'month', label: 'mo',   toBase: 2592000 },
      { id: 'year',  label: 'yr',   toBase: 31536000 },
    ],
  },
  {
    id: 'energy', icon: '⚡',
    defaultFrom: 'kcal', defaultTo: 'kj',
    refValues: [1, 100, 500, 1000, 2000],
    units: [
      { id: 'j',    label: 'J',    toBase: 1 },
      { id: 'kj',   label: 'kJ',   toBase: 1000 },
      { id: 'cal',  label: 'cal',  toBase: 4.184 },
      { id: 'kcal', label: 'kcal', toBase: 4184 },
      { id: 'kwh',  label: 'kWh',  toBase: 3600000 },
      { id: 'btu',  label: 'BTU',  toBase: 1055.06 },
    ],
  },
  {
    id: 'pressure', icon: '🔧',
    defaultFrom: 'atm', defaultTo: 'psi',
    refValues: [1, 2, 5, 10, 100],
    units: [
      { id: 'pa',  label: 'Pa',  toBase: 1 },
      { id: 'kpa', label: 'kPa', toBase: 1000 },
      { id: 'mpa', label: 'MPa', toBase: 1e6 },
      { id: 'bar', label: 'bar', toBase: 100000 },
      { id: 'psi', label: 'psi', toBase: 6894.76 },
      { id: 'atm', label: 'atm', toBase: 101325 },
      { id: 'mmhg',label: 'mmHg',toBase: 133.322 },
    ],
  },
];

// ─── Conversion helpers ───────────────────────────────────────────────────────

function convertTemperature(value: number, from: string, to: string): number {
  // normalize to Celsius first
  let celsius: number;
  if (from === 'c') celsius = value;
  else if (from === 'f') celsius = (value - 32) * 5 / 9;
  else celsius = value - 273.15; // K

  if (to === 'c') return celsius;
  if (to === 'f') return celsius * 9 / 5 + 32;
  return celsius + 273.15; // K
}

function convertValue(value: number, fromUnit: Unit, toUnit: Unit, catId: string): number {
  if (catId === 'temperature') {
    return convertTemperature(value, fromUnit.id, toUnit.id);
  }
  return (value * fromUnit.toBase) / toUnit.toBase;
}

function formatNum(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e12 || (abs > 0 && abs < 1e-6)) {
    return n.toExponential(4);
  }
  if (abs >= 1000) {
    return parseFloat(n.toPrecision(7)).toLocaleString('en-US', { maximumFractionDigits: 4 });
  }
  return parseFloat(n.toPrecision(7)).toString();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UnitConverterClient() {
  const locale = useLocale();

  const [activeCatId, setActiveCatId] = useState('length');
  const [inputVal, setInputVal] = useState('1');
  const [fromId, setFromId] = useState('m');
  const [toId, setToId] = useState('ft');
  const [copied, setCopied] = useState(false);

  const category = CATEGORIES.find(c => c.id === activeCatId)!;
  const fromUnit = category.units.find(u => u.id === fromId) ?? category.units[0];
  const toUnit   = category.units.find(u => u.id === toId)   ?? category.units[1];

  const numVal = parseFloat(inputVal);
  const hasVal = !isNaN(numVal) && inputVal !== '';
  const result = hasVal ? convertValue(numVal, fromUnit, toUnit, activeCatId) : null;
  const resultStr = result !== null ? formatNum(result) : '';

  const selectCat = useCallback((catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId)!;
    setActiveCatId(catId);
    setFromId(cat.defaultFrom);
    setToId(cat.defaultTo);
    setInputVal('1');
  }, []);

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
    if (result !== null) setInputVal(formatNum(result));
  };

  const copy = () => {
    navigator.clipboard.writeText(resultStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const TAB_NAMES: Record<string, { ko: string; en: string }> = {
    length:      { ko: '길이',  en: 'Length' },
    area:        { ko: '넓이',  en: 'Area' },
    weight:      { ko: '무게',  en: 'Weight' },
    volume:      { ko: '부피',  en: 'Volume' },
    temperature: { ko: '온도',  en: 'Temp' },
    speed:       { ko: '속도',  en: 'Speed' },
    data:        { ko: '데이터',en: 'Data' },
    time:        { ko: '시간',  en: 'Time' },
    energy:      { ko: '에너지',en: 'Energy' },
    pressure:    { ko: '압력',  en: 'Pressure' },
  };

  const tabName = (id: string) =>
    locale === 'ko' ? TAB_NAMES[id].ko : TAB_NAMES[id].en;

  return (
    <div style={{ maxWidth: 'var(--tool-width)', margin: '0 auto', width: '100%', padding: '0 1rem', boxSizing: 'border-box' }}>
      <NavigationActions />

      <ToolHeader
        icon={<Calculator />}
        title={locale === 'ko' ? '단위 변환기' : 'Unit Converter'}
        subtitle={locale === 'ko'
          ? '길이, 무게, 온도, 데이터 등 모든 단위를 즉시 환산'
          : 'Instantly convert length, weight, temperature, data and more'}
      />

      {/* ── Tab bar (5×2 grid on desktop, 4+remaining on mobile) ── */}
      <div className={s.tabs}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => selectCat(cat.id)}
            className={`${ui.chip} ${s.tab} ${cat.id === activeCatId ? ui.chipActive : ''}`}
          >
            {cat.icon} {tabName(cat.id)}
          </button>
        ))}
      </div>

      {/* ── Converter panel ── */}
      <div className={`${ui.card} ${s.panel}`}>

        {/* From / Swap / To row */}
        <div className={s.row}>

          {/* FROM */}
          <div className={ui.field}>
            <label className={ui.label}>
              {locale === 'ko' ? '변환 전' : 'From'}
            </label>
            <select
              value={fromId}
              onChange={e => setFromId(e.target.value)}
              className={ui.input}
            >
              {category.units.map(u => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
          </div>

          {/* SWAP */}
          <button
            onClick={swap}
            title="Swap"
            className={`${ui.button} ${ui.secondary} ${s.swap}`}
          >
            ⇄
          </button>

          {/* TO */}
          <div className={ui.field}>
            <label className={ui.label}>
              {locale === 'ko' ? '변환 후' : 'To'}
            </label>
            <select
              value={toId}
              onChange={e => setToId(e.target.value)}
              className={ui.input}
            >
              {category.units.map(u => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Input */}
        <div className={`${ui.field} ${s.valueField}`}>
          <label className={ui.label}>
            {locale === 'ko' ? '값 입력' : 'Enter value'}
          </label>
          <div className={`${ui.inputGroup} ${s.valueGroup}`}>
            <input
              type="text"
              inputMode="decimal"
              placeholder="1"
              value={inputVal}
              onChange={e => setInputVal(e.target.value.replace(/[^0-9.\-]/g, ''))}
              className={`${ui.input} ${ui.inputLg}`}
            />
            <span className={ui.unit}>
              {fromUnit.label}
            </span>
          </div>
        </div>

        {/* Result */}
        <div className={ui.result}>
          <div>
            <div className={ui.resultLabel}>
              {locale === 'ko' ? '변환 결과' : 'Result'}
            </div>
            <div className={s.resultRow}>
              <div className={s.resultNum}>
                <span className={ui.resultValue} style={hasVal ? undefined : { color: 'var(--text-muted)' }}>
                  {hasVal ? resultStr : '—'}
                </span>
                {hasVal && (
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {toUnit.label}
                  </span>
                )}
              </div>
              {hasVal && (
                <button
                  onClick={copy}
                  className={`${ui.button} ${ui.sm} ${copied ? ui.primary : ui.secondary}`}
                  style={{ flexShrink: 0 }}
                >
                  {copied ? '✓' : '📋'}
                </button>
              )}
            </div>
            {hasVal && (
              <div className={ui.hint} style={{ marginTop: '0.4rem' }}>
                {inputVal} {fromUnit.label} = {resultStr} {toUnit.label}
              </div>
            )}
          </div>
        </div>

        {/* Reference table */}
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            {locale === 'ko' ? '참고 표' : 'Reference Table'} — {fromUnit.label} → {toUnit.label}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', fontSize: '0.82rem' }}>
            <div style={thStyle}>{fromUnit.label}</div>
            <div style={thStyle}>{toUnit.label}</div>
            {category.refValues.map(v => (
              <>
                <div key={`f${v}`} style={tdStyle}>{v} {fromUnit.label}</div>
                <div key={`t${v}`} style={{ ...tdStyle, fontWeight: 600, color: 'var(--primary)' }}>
                  {formatNum(convertValue(v, fromUnit, toUnit, activeCatId))} {toUnit.label}
                </div>
              </>
            ))}
          </div>
        </div>
      </div>

      {/* 공유하기 */}
      <ShareBar
        title={locale === 'ko' ? '단위 변환기' : 'Unit Converter'}
        description={locale === 'ko' ? '길이, 무게, 온도, 데이터 등 모든 단위를 즉시 환산' : 'Instantly convert length, weight, temperature, data and more'}
      />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/utility/unit-converter" />


      <SeoSection
        ko={{
          title: '단위 변환기란 무엇인가요?',
          description: '단위 변환기는 길이, 넓이, 무게, 부피, 온도, 속도, 데이터, 시간, 에너지, 압력 등 10가지 카테고리의 단위를 즉시 환산해주는 무료 온라인 도구입니다. mm에서 마일, kg에서 파운드, 섭씨에서 화씨, GB에서 MB 등 일상과 업무에서 자주 사용하는 단위 변환을 별도 설치 없이 브라우저에서 바로 처리합니다. 한국 전통 단위인 평(坪), 근, 돈도 지원하며, 참고 표를 통해 자주 쓰는 값의 환산 결과를 한눈에 확인할 수 있습니다. 변환 결과는 복사 버튼으로 즉시 클립보드에 저장되며, 단위 간 스왑 기능으로 역방향 변환도 간편하게 수행할 수 있습니다.',
          useCases: [
            { icon: '🏠', title: '부동산 면적 환산', desc: '아파트 전용면적 84m²가 몇 평인지, 혹은 해외 부동산 평방피트(ft²)를 m²로 환산할 때 넓이 카테고리를 사용합니다.' },
            { icon: '✈️', title: '해외 여행 단위 확인', desc: '마일(mile)과 킬로미터, 화씨(°F)와 섭씨(°C), 파운드(lb)와 킬로그램(kg) 등 해외에서 자주 접하는 단위를 즉시 환산합니다.' },
            { icon: '💾', title: 'IT·개발 데이터 계산', desc: 'GB, MB, KB, bit 등 데이터 저장 단위를 환산하여 서버 용량 계획이나 파일 크기 비교에 활용합니다.' },
            { icon: '🔬', title: '과학·공학 단위 환산', desc: '압력(Pa, bar, psi, atm), 에너지(J, kJ, kcal, kWh, BTU) 등 전문 단위 환산이 필요한 연구나 공학 계산에 사용합니다.' },
          ],
          steps: [
            { step: '카테고리 탭 선택', desc: '상단 탭에서 길이, 넓이, 무게, 부피, 온도, 속도, 데이터, 시간, 에너지, 압력 중 원하는 단위 카테고리를 선택합니다.' },
            { step: '변환 전/후 단위 선택', desc: '왼쪽 드롭다운에서 변환할 단위(예: m)를, 오른쪽에서 변환 후 단위(예: ft)를 선택합니다. ⇄ 버튼으로 두 단위를 즉시 교환할 수 있습니다.' },
            { step: '값 입력 및 결과 확인', desc: '입력란에 숫자를 입력하면 변환 결과가 즉시 표시됩니다. 소수점 및 음수도 지원하며, 결과 옆 복사 버튼으로 값을 클립보드에 저장할 수 있습니다.' },
            { step: '참고 표 활용', desc: '패널 하단의 참고 표에서 대표 값들의 환산 결과를 한눈에 확인합니다. 예를 들어 1m, 10m, 100m가 각각 몇 피트인지 한 번에 볼 수 있습니다.' },
          ],
          faqs: [
            { q: '어떤 단위 카테고리를 지원하나요?', a: '길이, 넓이, 무게, 부피, 온도, 속도, 데이터, 시간, 에너지, 압력 총 10가지 카테고리를 지원합니다. 각 카테고리에는 국제 표준(SI) 단위와 야드파운드법(mile, ft, lb 등), 한국 전통 단위(평, 근, 돈)가 포함되어 있습니다.' },
            { q: '온도 변환은 어떻게 계산하나요?', a: '섭씨(°C), 화씨(°F), 켈빈(K) 간 변환을 지원합니다. 섭씨→화씨: (°C × 9/5) + 32, 섭씨→켈빈: °C + 273.15, 화씨→섭씨: (°F − 32) × 5/9 공식을 사용합니다. 체온(37°C = 98.6°F), 물 끓는점(100°C = 212°F) 등 일상적 기준값도 참고 표에서 확인할 수 있습니다.' },
            { q: '변환 결과가 지수 표기법(예: 1.234e+9)으로 나오는데 정상인가요?', a: '네, 정상입니다. 변환 결과가 매우 크거나(1조 이상) 매우 작은(0.000001 미만) 경우 가독성을 위해 지수 표기법으로 표시됩니다. 예를 들어 1PB를 bit로 변환하면 9.007e+15와 같이 표시됩니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'What is a Unit Converter?',
          description: 'A unit converter is a free online tool that instantly converts values across 10 measurement categories: length, area, weight, volume, temperature, speed, data, time, energy, and pressure. Whether you need to convert mm to miles, kg to pounds, Celsius to Fahrenheit, or GB to MB, this tool handles everyday and professional unit conversions without any software installation. It also supports traditional Korean units (pyeong, geun, don), and includes a reference table for quick lookups of common values. A swap button makes reverse conversions effortless, and a copy button saves results directly to your clipboard.',
          useCases: [
            { icon: '🏠', title: 'Real Estate Area Conversion', desc: 'Convert apartment exclusive areas from m² to pyeong, or convert international property listings from square feet to square meters for easy comparison.' },
            { icon: '✈️', title: 'Overseas Travel Unit Check', desc: 'Instantly convert miles to kilometers, Fahrenheit to Celsius, and pounds to kilograms — the units you encounter most frequently when traveling abroad.' },
            { icon: '💾', title: 'IT & Development Data Calculation', desc: 'Convert between GB, MB, KB, and bits to plan server capacity, compare file sizes, or calculate API payload limits accurately.' },
            { icon: '🔬', title: 'Science & Engineering Conversion', desc: 'Convert pressure units (Pa, bar, psi, atm, mmHg) and energy units (J, kJ, kcal, kWh, BTU) for research calculations and engineering projects.' },
          ],
          steps: [
            { step: 'Select a Category Tab', desc: 'Click one of the 10 category tabs at the top — Length, Area, Weight, Volume, Temperature, Speed, Data, Time, Energy, or Pressure — to load the relevant units.' },
            { step: 'Choose From and To Units', desc: 'Select the source unit from the left dropdown and the target unit from the right. Use the ⇄ swap button to instantly reverse the conversion direction.' },
            { step: 'Enter a Value and See Results', desc: 'Type a number into the input field to see the converted result instantly. Decimal and negative values are supported. Click the copy button to save the result to your clipboard.' },
            { step: 'Use the Reference Table', desc: 'The reference table at the bottom of the panel shows conversions for several common values at once — for example, how 1m, 10m, and 100m compare in feet.' },
          ],
          faqs: [
            { q: 'What unit categories are supported?', a: 'Ten categories are supported: Length, Area, Weight, Volume, Temperature, Speed, Data, Time, Energy, and Pressure. Each includes both SI (metric) and imperial units, plus traditional Korean units such as pyeong (area), geun, and don (weight).' },
            { q: 'How is temperature conversion calculated?', a: 'Celsius (°C), Fahrenheit (°F), and Kelvin (K) are all supported. The formulas used are: °C to °F: (°C × 9/5) + 32; °C to K: °C + 273.15; °F to °C: (°F − 32) × 5/9. Common reference points like body temperature (37°C = 98.6°F) and boiling water (100°C = 212°F) appear in the reference table.' },
            { q: 'Why does the result show scientific notation (e.g., 1.234e+9)?', a: 'Scientific notation is used when results are very large (over 1 trillion) or very small (under 0.000001) to maintain readability. For example, converting 1 PB to bits displays as approximately 9.007e+15. This is normal behavior.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        }}
      />
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  background: 'var(--surface-hover)',
  fontWeight: 700,
  color: 'var(--text-muted)',
};

const tdStyle: React.CSSProperties = {
  padding: '0.45rem 0.75rem',
  borderTop: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  fontWeight: 500,
};
