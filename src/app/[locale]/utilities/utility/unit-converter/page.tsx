'use client';

import { useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Calculator } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import SeoSection from '@/app/components/SeoSection';

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

export default function UnitConverterPage() {
  const t = useTranslations('UnitConverter');
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

  const selectStyle = (active: boolean): React.CSSProperties => ({
    flex: '0 0 auto',
    padding: '0.5rem 1rem',
    borderRadius: '2rem',
    border: '1.5px solid',
    borderColor: active ? 'var(--primary)' : 'transparent',
    background: active ? 'rgba(249,115,22,0.12)' : 'transparent',
    color: active ? 'var(--primary)' : 'var(--text-secondary)',
    fontWeight: active ? 700 : 500,
    fontSize: '0.875rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  });

  return (
    <div>
      <NavigationActions />

      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Calculator size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
          {locale === 'ko' ? '단위 변환기' : 'Unit Converter'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {locale === 'ko'
            ? '길이, 무게, 온도, 데이터 등 모든 단위를 즉시 환산'
            : 'Instantly convert length, weight, temperature, data and more'}
        </p>
      </header>

      {/* ── Tab bar ── */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        marginBottom: '1.5rem',
        scrollbarWidth: 'none',
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => selectCat(cat.id)}
            style={selectStyle(cat.id === activeCatId)}
          >
            {cat.icon} {tabName(cat.id)}
          </button>
        ))}
      </div>

      {/* ── Converter panel ── */}
      <div className="glass-panel" style={{ padding: '1.75rem', maxWidth: '560px', margin: '0 auto' }}>

        {/* From / Swap / To row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'end', marginBottom: '1.5rem' }}>

          {/* FROM */}
          <div>
            <label style={labelStyle}>
              {locale === 'ko' ? '변환 전' : 'From'}
            </label>
            <select
              value={fromId}
              onChange={e => setFromId(e.target.value)}
              style={selectInputStyle}
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
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              border: '1.5px solid var(--border)',
              background: 'var(--surface-hover)',
              color: 'var(--text-secondary)',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              alignSelf: 'flex-end',
              transition: 'all 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            ⇄
          </button>

          {/* TO */}
          <div>
            <label style={labelStyle}>
              {locale === 'ko' ? '변환 후' : 'To'}
            </label>
            <select
              value={toId}
              onChange={e => setToId(e.target.value)}
              style={selectInputStyle}
            >
              {category.units.map(u => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Input */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>
            {locale === 'ko' ? '값 입력' : 'Enter value'}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              inputMode="decimal"
              placeholder="1"
              value={inputVal}
              onChange={e => setInputVal(e.target.value.replace(/[^0-9.\-]/g, ''))}
              style={{
                width: '100%',
                padding: '0.85rem 3.5rem 0.85rem 1rem',
                fontSize: '1.5rem',
                fontWeight: 700,
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>
              {fromUnit.label}
            </span>
          </div>
        </div>

        {/* Result */}
        <div style={{
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          background: hasVal ? 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(16,185,129,0.06))' : 'var(--surface)',
        }}>
          <div style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              {locale === 'ko' ? '변환 결과' : 'Result'}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', minWidth: 0 }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 800, color: hasVal ? 'var(--primary)' : 'var(--text-muted)', letterSpacing: '-1px', wordBreak: 'break-all' }}>
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
                  style={{
                    flexShrink: 0,
                    padding: '0.35rem 0.8rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: copied ? 'var(--primary)' : 'var(--surface-hover)',
                    color: copied ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {copied ? '✓' : '📋'}
                </button>
              )}
            </div>
            {hasVal && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
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

      {/* 광고 영역 */}
      <div style={{
        width: '100%',
        minHeight: '90px',
        background: 'rgba(226, 232, 240, 0.3)',
        border: '1px dashed #cbd5e1',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: '0.875rem',
        margin: '2rem 0'
      }}>
        광고 영역
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.4rem',
};

const selectInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  fontSize: '0.95rem',
  fontWeight: 600,
  border: '2px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  outline: 'none',
  cursor: 'pointer',
  boxSizing: 'border-box',
};

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
