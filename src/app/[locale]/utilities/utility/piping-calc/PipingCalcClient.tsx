'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Pipette } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './piping-calc.module.css';

type Tab = 'spec' | 'slope' | 'hydro';
type Material = 'carbon' | 'sus';
type CarbonSch = 'SCH10' | 'SCH20' | 'SCH40' | 'SCH80' | 'STD' | 'XS';
type SusSch = 'SCH10S' | 'SCH20S' | 'SCH40S' | 'SCH80S';

const SIZES = ['10A','15A','20A','25A','32A','40A','50A','65A','80A','100A','125A','150A','200A','250A','300A'] as const;
type Size = typeof SIZES[number];

const CARBON_SCHEDULES: CarbonSch[] = ['SCH10','SCH20','SCH40','SCH80','STD','XS'];
const SUS_SCHEDULES: SusSch[] = ['SCH10S','SCH20S','SCH40S','SCH80S'];

const OD: Record<Size, number> = {
  '10A': 17.3, '15A': 21.7, '20A': 27.2, '25A': 34.0, '32A': 42.7,
  '40A': 48.6, '50A': 60.5, '65A': 76.3, '80A': 89.1, '100A': 114.3,
  '125A': 139.8, '150A': 165.2, '200A': 216.3, '250A': 267.4, '300A': 318.5,
};

const INCH: Record<Size, string> = {
  '10A': '3/8"', '15A': '1/2"', '20A': '3/4"', '25A': '1"', '32A': '1-1/4"',
  '40A': '1-1/2"', '50A': '2"', '65A': '2-1/2"', '80A': '3"', '100A': '4"',
  '125A': '5"', '150A': '6"', '200A': '8"', '250A': '10"', '300A': '12"',
};

// 탄소강관 두께 (mm) — '-'은 해당 스케줄 없음
const CARBON_T: Record<Size, Partial<Record<CarbonSch, number>>> = {
  '10A':  { SCH10: 1.24,            SCH40: 2.31, SCH80: 3.20, STD: 2.31, XS: 3.20 },
  '15A':  { SCH10: 1.65,            SCH40: 2.77, SCH80: 3.73, STD: 2.77, XS: 3.73 },
  '20A':  { SCH10: 1.65,            SCH40: 2.87, SCH80: 3.91, STD: 2.87, XS: 3.91 },
  '25A':  { SCH10: 1.65,            SCH40: 3.38, SCH80: 4.55, STD: 3.38, XS: 4.55 },
  '32A':  { SCH10: 1.65,            SCH40: 3.56, SCH80: 4.85, STD: 3.56, XS: 4.85 },
  '40A':  { SCH10: 1.65,            SCH40: 3.68, SCH80: 5.08, STD: 3.68, XS: 5.08 },
  '50A':  { SCH10: 1.65,            SCH40: 3.91, SCH80: 5.54, STD: 3.91, XS: 5.54 },
  '65A':  { SCH10: 2.11,            SCH40: 5.16, SCH80: 7.01, STD: 5.16, XS: 7.01 },
  '80A':  { SCH10: 2.11,            SCH40: 5.49, SCH80: 7.62, STD: 5.49, XS: 7.62 },
  '100A': { SCH10: 2.77,            SCH40: 6.02, SCH80: 8.56, STD: 6.02, XS: 8.56 },
  '125A': { SCH10: 2.77,            SCH40: 6.55, SCH80: 9.53, STD: 6.55, XS: 9.53 },
  '150A': { SCH10: 2.77,            SCH40: 7.11, SCH80: 10.97, STD: 7.11, XS: 10.97 },
  '200A': { SCH10: 2.77, SCH20: 6.35, SCH40: 8.18, SCH80: 12.70, STD: 8.18, XS: 12.70 },
  '250A': { SCH10: 3.40, SCH20: 6.35, SCH40: 9.27, SCH80: 15.09, STD: 9.27, XS: 12.70 },
  '300A': { SCH10: 3.40, SCH20: 6.35, SCH40: 10.31, SCH80: 17.48, STD: 10.31, XS: 12.70 },
};

// 스테인리스강관 두께 (mm)
const SUS_T: Record<Size, Partial<Record<SusSch, number>>> = {
  '10A':  { SCH10S: 1.24, SCH40S: 2.31, SCH80S: 3.20 },
  '15A':  { SCH10S: 1.65, SCH40S: 2.77, SCH80S: 3.73 },
  '20A':  { SCH10S: 1.65, SCH40S: 2.87, SCH80S: 3.91 },
  '25A':  { SCH10S: 1.65, SCH40S: 3.38, SCH80S: 4.55 },
  '32A':  { SCH10S: 1.65, SCH40S: 3.56, SCH80S: 4.85 },
  '40A':  { SCH10S: 1.65, SCH40S: 3.68, SCH80S: 5.08 },
  '50A':  { SCH10S: 1.65, SCH40S: 3.91, SCH80S: 5.54 },
  '65A':  { SCH10S: 2.11, SCH40S: 5.16, SCH80S: 7.01 },
  '80A':  { SCH10S: 2.11, SCH40S: 5.49, SCH80S: 7.62 },
  '100A': { SCH10S: 2.77, SCH40S: 6.02, SCH80S: 8.56 },
  '125A': { SCH10S: 3.40, SCH40S: 6.55, SCH80S: 9.53 },
  '150A': { SCH10S: 3.40, SCH40S: 7.11, SCH80S: 10.97 },
  '200A': { SCH10S: 3.76, SCH40S: 8.18, SCH80S: 12.70 },
  '250A': { SCH10S: 4.19, SCH40S: 9.27, SCH80S: 15.09 },
  '300A': { SCH10S: 4.57, SCH40S: 10.31, SCH80S: 17.48 },
};

// 두께 조회 (재질/사이즈/스케줄)
function getThickness(material: Material, size: Size, sch: string): number | null {
  if (material === 'carbon') {
    return CARBON_T[size][sch as CarbonSch] ?? null;
  }
  return SUS_T[size][sch as SusSch] ?? null;
}

// 중량 (kg/m)
function calcWeight(od: number, t: number, material: Material): number {
  // 탄소강: 0.02466 (7.85 g/cm³), 스테인리스: 0.02491 (7.93 g/cm³)
  const factor = material === 'carbon' ? 0.02466 : 0.02491;
  return (od - t) * t * factor;
}

// 물차 추천
function recommendTruck(tons: number, isKo: boolean): string {
  if (tons <= 2.5) return isKo ? '2.5톤 물차 1대로 충분합니다.' : 'One 2.5-ton water truck is sufficient.';
  if (tons <= 5) return isKo ? '5톤 물차 1대로 충분합니다.' : 'One 5-ton water truck is sufficient.';
  if (tons <= 8) return isKo ? '5톤 + 3톤 물차 조합 권장.' : 'Combine one 5-ton + one 3-ton truck.';
  if (tons <= 10) return isKo ? '10톤 물차 1대로 충분합니다.' : 'One 10-ton water truck is sufficient.';
  if (tons <= 15) return isKo ? '10톤 + 5톤 물차 조합 권장.' : 'Combine one 10-ton + one 5-ton truck.';
  const trips = Math.ceil(tons / 10);
  return isKo
    ? `10톤 물차 ${trips}회 운반이 필요합니다.`
    : `Requires ${trips} trips with a 10-ton truck.`;
}

// 경사율별 안내
function slopeGuide(ratio: number, isKo: boolean): { text: string; level: 'ok' | 'info' | 'warn' } {
  // ratio = 1/N (예: 1/100 = 0.01)
  const N = 1 / ratio;
  if (N <= 50) {
    return { text: isKo ? '✅ 오수관·배수관에 적합한 경사입니다.' : '✅ Suitable for sewage and drainage pipes.', level: 'ok' };
  }
  if (N <= 100) {
    return { text: isKo ? '✅ 에어컨 드레인·일반 배수에 적합합니다.' : '✅ Suitable for AC drain and general drainage.', level: 'ok' };
  }
  if (N <= 200) {
    return { text: isKo ? '⚠️ 경사가 완만합니다. 막힘 주의.' : '⚠️ Slope is gentle. Watch for clogs.', level: 'info' };
  }
  return { text: isKo ? '⚠️ 경사가 너무 완만합니다. 배수 불량 위험.' : '⚠️ Slope is too gentle. Risk of poor drainage.', level: 'warn' };
}

export default function PipingCalcClient() {
  const t = useTranslations('PipingCalc');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [activeTab, setActiveTab] = useState<Tab>('spec');

  // Tab 1: spec
  const [specMaterial, setSpecMaterial] = useState<Material>('carbon');
  const [specSize, setSpecSize] = useState<Size>('100A');
  const [specSch, setSpecSch] = useState<string>('SCH40');
  const [copied, setCopied] = useState(false);

  // Tab 2: slope
  const [slopeLen, setSlopeLen] = useState('');
  const [slopePreset, setSlopePreset] = useState<string>('1/100');
  const [slopeCustomNum, setSlopeCustomNum] = useState('1');
  const [slopeCustomDen, setSlopeCustomDen] = useState('100');

  // Tab 3: hydro
  const [hydroSize, setHydroSize] = useState<Size>('100A');
  const [hydroLen, setHydroLen] = useState('');
  const [hydroSafety, setHydroSafety] = useState(10);


  // 재질 바꿀 때 스케줄 초기화
  useEffect(() => {
    if (specMaterial === 'carbon') {
      if (!CARBON_SCHEDULES.includes(specSch as CarbonSch)) {
        setSpecSch('SCH40');
      }
    } else {
      if (!SUS_SCHEDULES.includes(specSch as SusSch)) {
        setSpecSch('SCH40S');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specMaterial]);

  // Tab 1 결과
  const specResult = useMemo(() => {
    const od = OD[specSize];
    const t = getThickness(specMaterial, specSize, specSch);
    if (t == null) return null;
    const id = od - t * 2;
    const area = Math.PI * (id / 2) ** 2; // mm²
    const w = calcWeight(od, t, specMaterial);
    return { od, t, id, area, w, inch: INCH[specSize] };
  }, [specMaterial, specSize, specSch]);

  // Tab 2 결과
  const slopeData = useMemo(() => {
    const len = parseFloat(slopeLen);
    if (!len || len <= 0) return null;

    let num: number, den: number;
    if (slopePreset === 'custom') {
      num = parseFloat(slopeCustomNum) || 0;
      den = parseFloat(slopeCustomDen) || 0;
    } else {
      const parts = slopePreset.split('/');
      num = parseFloat(parts[0]);
      den = parseFloat(parts[1]);
    }
    if (!num || !den || den <= 0) return null;

    const ratio = num / den;
    const drop = len * 1000 * ratio; // mm
    const guide = slopeGuide(ratio, isKo);

    return { len, num, den, ratio, drop, guide };
  }, [slopeLen, slopePreset, slopeCustomNum, slopeCustomDen, isKo]);

  // Tab 3 결과
  const hydroData = useMemo(() => {
    const len = parseFloat(hydroLen);
    if (!len || len <= 0) return null;

    const od = OD[hydroSize];
    const t = CARBON_T[hydroSize].SCH40;
    if (t == null) return null;
    const id = od - t * 2; // mm
    const idM = id / 1000; // m
    const area = Math.PI * (idM / 2) ** 2; // m²
    const netVol = area * len; // m³
    const totalVol = netVol * (1 + hydroSafety / 100); // m³
    const liters = totalVol * 1000;
    const tons = totalVol * 1.0; // 물 1m³ = 1톤
    const truck = recommendTruck(tons, isKo);

    return { len, id, netVol, totalVol, liters, tons, truck };
  }, [hydroLen, hydroSize, hydroSafety, isKo]);

  const fmt = (n: number, dp = 2) => n.toLocaleString(isKo ? 'ko-KR' : 'en-US', {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });

  const handleCopy = () => {
    if (!specResult) return;
    const text = [
      `${specSize} / ${specSch} / ${specMaterial === 'carbon' ? (isKo ? '탄소강관' : 'Carbon Steel') : (isKo ? '스테인리스강관' : 'Stainless Steel')}`,
      `${isKo ? '외경' : 'O.D'}: ${specResult.od} mm`,
      `${isKo ? '두께' : 'Thickness'}: ${specResult.t} mm`,
      `${isKo ? '내경' : 'I.D'}: ${fmt(specResult.id)} mm`,
      `${isKo ? '단면적' : 'Area'}: ${fmt(specResult.area, 0)} mm²`,
      `${isKo ? '중량' : 'Weight'}: ${fmt(specResult.w)} kg/m`,
      `${isKo ? '인치' : 'Inch'}: ${specResult.inch}`,
    ].join('\n');
    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  };


  const schedules = specMaterial === 'carbon' ? CARBON_SCHEDULES : SUS_SCHEDULES;

  return (
    <div className={s.container}>
      <NavigationActions />
      <header className={s.header}>
        <div style={{
          display: 'inline-flex', padding: '1rem', background: 'white',
          borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem',
        }}>
          <Pipette size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.title}>{t('title')}</h1>
        <p className={s.subtitle}>{t('description')}</p>
      </header>

      {/* Tabs */}
      <div className={s.tabs}>
        {(['spec', 'slope', 'hydro'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${s.tabBtn} ${activeTab === tab ? s.tabBtnActive : ''}`}
            aria-label={t(`tab_${tab}` as 'tab_spec')}
          >
            {t(`tab_${tab}` as 'tab_spec')}
          </button>
        ))}
      </div>

      <section className={s.panel}>
        {/* ── Tab 1: Spec Lookup ── */}
        {activeTab === 'spec' && (
          <>
            <div>
              <div className={s.sectionTitle}>{t('material')}</div>
              <div className={s.materialRow}>
                <button
                  className={`${s.materialBtn} ${specMaterial === 'carbon' ? s.materialBtnActive : ''}`}
                  onClick={() => setSpecMaterial('carbon')}
                  aria-label={t('material_carbon')}
                >
                  {t('material_carbon')}
                </button>
                <button
                  className={`${s.materialBtn} ${specMaterial === 'sus' ? s.materialBtnActive : ''}`}
                  onClick={() => setSpecMaterial('sus')}
                  aria-label={t('material_sus')}
                >
                  {t('material_sus')}
                </button>
              </div>
            </div>

            <div>
              <div className={s.sectionTitle}>{t('nominal_size')}</div>
              <div className={s.sizeGrid}>
                {SIZES.map(sz => (
                  <button
                    key={sz}
                    className={`${s.sizeBtn} ${specSize === sz ? s.sizeBtnActive : ''}`}
                    onClick={() => setSpecSize(sz)}
                    aria-label={sz}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className={s.sectionTitle}>{t('schedule')}</div>
              <div className={s.schGrid}>
                {schedules.map(sch => {
                  const tk = getThickness(specMaterial, specSize, sch);
                  const disabled = tk == null;
                  return (
                    <button
                      key={sch}
                      className={`${s.schBtn} ${specSch === sch ? s.schBtnActive : ''} ${disabled ? s.schBtnDisabled : ''}`}
                      onClick={() => !disabled && setSpecSch(sch)}
                      disabled={disabled}
                      aria-label={sch}
                    >
                      {sch}
                    </button>
                  );
                })}
              </div>
            </div>

            {specResult && (
              <div className={s.resultCard}>
                <div className={s.resultHeader}>
                  <span>{specSize} · {specSch}</span>
                  <span>{specMaterial === 'carbon' ? (isKo ? '탄소강관' : 'Carbon') : (isKo ? '스테인리스강관' : 'Stainless')}</span>
                </div>
                <div className={s.resultRow}>
                  <span className={s.resultLabel}>{t('spec_od')}</span>
                  <span><span className={s.resultValueBig}>{specResult.od}</span><span className={s.resultUnit}>mm</span></span>
                </div>
                <div className={s.resultRow}>
                  <span className={s.resultLabel}>{t('spec_thickness')}</span>
                  <span><span className={s.resultValue}>{specResult.t}</span><span className={s.resultUnit}>mm</span></span>
                </div>
                <div className={s.resultRow}>
                  <span className={s.resultLabel}>{t('spec_id')}</span>
                  <span><span className={s.resultValueBig}>{fmt(specResult.id)}</span><span className={s.resultUnit}>mm</span></span>
                </div>
                <div className={s.resultRow}>
                  <span className={s.resultLabel}>{t('spec_weight')}</span>
                  <span><span className={s.resultValue}>{fmt(specResult.w)}</span><span className={s.resultUnit}>kg/m</span></span>
                </div>
                <div className={s.resultRow}>
                  <span className={s.resultLabel}>{t('spec_area')}</span>
                  <span><span className={s.resultValue}>{fmt(specResult.area, 0)}</span><span className={s.resultUnit}>mm²</span></span>
                </div>
                <div className={s.resultRow}>
                  <span className={s.resultLabel}>{t('spec_inch')}</span>
                  <span className={s.resultValue}>{specResult.inch}</span>
                </div>
                <button
                  className={`${s.copyBtn} ${copied ? s.copyBtnDone : ''}`}
                  onClick={handleCopy}
                  aria-label={t('copy_result')}
                >
                  {copied ? t('copy_done') : t('copy_result')}
                </button>
                {specMaterial === 'sus' && (
                  <p className={s.note}>{t('sus_note')}</p>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Tab 2: Slope ── */}
        {activeTab === 'slope' && (
          <>
            <div>
              <div className={s.sectionTitle}>{t('slope_length')}</div>
              <input
                type="number"
                inputMode="decimal"
                className={s.input}
                value={slopeLen}
                onChange={(e) => setSlopeLen(e.target.value)}
                placeholder={isKo ? '예: 15' : 'e.g. 15'}
                min="0"
                aria-label={t('slope_length')}
              />
            </div>

            <div>
              <div className={s.sectionTitle}>{t('slope_preset')}</div>
              <div className={s.slopePresets}>
                {['1/50','1/100','1/200','1/300'].map(p => (
                  <button
                    key={p}
                    className={`${s.slopeBtn} ${slopePreset === p ? s.slopeBtnActive : ''}`}
                    onClick={() => setSlopePreset(p)}
                    aria-label={p}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className={`${s.slopeBtn} ${slopePreset === 'custom' ? s.slopeBtnActive : ''}`}
                  onClick={() => setSlopePreset('custom')}
                  aria-label={t('slope_custom')}
                >
                  {t('slope_custom')}
                </button>
              </div>

              {slopePreset === 'custom' && (
                <div className={s.customRow} style={{ marginTop: '0.75rem' }}>
                  <input
                    type="number"
                    inputMode="decimal"
                    className={s.input}
                    value={slopeCustomNum}
                    onChange={(e) => setSlopeCustomNum(e.target.value)}
                    placeholder="1"
                    style={{ flex: 1 }}
                    aria-label={isKo ? '분자' : 'Numerator'}
                  />
                  <span>/</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    className={s.input}
                    value={slopeCustomDen}
                    onChange={(e) => setSlopeCustomDen(e.target.value)}
                    placeholder="100"
                    style={{ flex: 1 }}
                    aria-label={isKo ? '분모' : 'Denominator'}
                  />
                </div>
              )}
            </div>

            {slopeData && (
              <div className={s.resultCard}>
                <div className={s.resultHeader}>
                  <span>{isKo ? '배관 길이' : 'Length'} {slopeData.len}m</span>
                  <span>{slopeData.num}/{slopeData.den}</span>
                </div>
                <div className={s.resultRow}>
                  <span className={s.resultLabel}>{t('slope_drop')}</span>
                  <span>
                    <span className={s.resultValueBig}>{fmt(slopeData.drop, 1)}</span>
                    <span className={s.resultUnit}>mm</span>
                  </span>
                </div>
                <div className={s.resultRow} style={{ paddingTop: 0 }}>
                  <span className={s.resultLabel}> </span>
                  <span><span className={s.resultValue}>= {fmt(slopeData.drop / 10, 1)}</span><span className={s.resultUnit}>cm</span></span>
                </div>

                <div
                  className={`${s.tipBox} ${
                    slopeData.guide.level === 'ok' ? s.tipBoxOk :
                    slopeData.guide.level === 'warn' ? s.tipBoxWarn : ''
                  }`}
                >
                  <strong>{t('slope_tip')}</strong><br />
                  {slopeData.guide.text}
                  <br />
                  {isKo
                    ? `${slopeData.len}m 배관의 끝점이 시작점보다 ${fmt(slopeData.drop, 1)}mm 낮아야 합니다.`
                    : `The end of a ${slopeData.len}m pipe must be ${fmt(slopeData.drop, 1)}mm below the start.`}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Tab 3: Hydro ── */}
        {activeTab === 'hydro' && (
          <>
            <div>
              <div className={s.sectionTitle}>{t('nominal_size')}</div>
              <div className={s.sizeGrid}>
                {SIZES.map(sz => (
                  <button
                    key={sz}
                    className={`${s.sizeBtn} ${hydroSize === sz ? s.sizeBtnActive : ''}`}
                    onClick={() => setHydroSize(sz)}
                    aria-label={sz}
                  >
                    {sz}
                  </button>
                ))}
              </div>
              <p className={s.note}>
                {isKo
                  ? `SCH40 기준 내경: ${fmt(OD[hydroSize] - (CARBON_T[hydroSize].SCH40 ?? 0) * 2)} mm`
                  : `Inner diameter (SCH40): ${fmt(OD[hydroSize] - (CARBON_T[hydroSize].SCH40 ?? 0) * 2)} mm`}
              </p>
            </div>

            <div>
              <div className={s.sectionTitle}>{t('hydro_length')}</div>
              <input
                type="number"
                inputMode="decimal"
                className={s.input}
                value={hydroLen}
                onChange={(e) => setHydroLen(e.target.value)}
                placeholder={isKo ? '예: 500' : 'e.g. 500'}
                min="0"
                aria-label={t('hydro_length')}
              />
            </div>

            <div>
              <div className={s.sectionTitle}>{t('hydro_safety')}</div>
              <div className={s.hydroSafetyRow}>
                {[10, 15, 20].map(v => (
                  <button
                    key={v}
                    className={`${s.hydroSafetyBtn} ${hydroSafety === v ? s.hydroSafetyBtnActive : ''}`}
                    onClick={() => setHydroSafety(v)}
                    aria-label={`${v}%`}
                  >
                    {v}%
                  </button>
                ))}
              </div>
            </div>

            {hydroData && (
              <div className={s.resultCard}>
                <div className={s.resultHeader}>
                  <span>{hydroSize} · SCH40</span>
                  <span>{hydroData.len}m · +{hydroSafety}%</span>
                </div>
                <div className={s.resultRow}>
                  <span className={s.resultLabel}>{t('hydro_volume_net')}</span>
                  <span><span className={s.resultValue}>{fmt(hydroData.netVol, 2)}</span><span className={s.resultUnit}>m³</span></span>
                </div>
                <div className={s.resultRow}>
                  <span className={s.resultLabel}>{t('hydro_volume_total')}</span>
                  <span><span className={s.resultValueBig}>{fmt(hydroData.totalVol, 2)}</span><span className={s.resultUnit}>m³</span></span>
                </div>
                <div className={s.resultRow} style={{ paddingTop: 0 }}>
                  <span className={s.resultLabel}> </span>
                  <span><span className={s.resultValue}>{fmt(hydroData.liters, 0)}</span><span className={s.resultUnit}>L</span></span>
                </div>
                <div className={s.resultRow}>
                  <span className={s.resultLabel}>{t('hydro_weight')}</span>
                  <span><span className={s.resultValueBig}>{fmt(hydroData.tons, 2)}</span><span className={s.resultUnit}>ton</span></span>
                </div>
                <div className={s.truckBox}>
                  {t('hydro_truck')}<br />
                  {hydroData.truck}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <div className={s.disclaimer}>{t('disclaimer')}</div>

      {/* 표준 하단 섹션 */}
      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="utilities/utility/piping-calc" />
      <div className={s.adPlaceholder}>AD</div>
      <SeoSection
        ko={{
          title: '배관 종합 계산기란?',
          description:
            '배관 종합 계산기는 현장 배관 작업자와 설계자가 매일 쓰는 KS 규격표, 구배 계산, 수압 테스트 물량 산출을 하나의 툴로 해결하는 현장 실무 도구입니다. 탄소강관(KS D 3562 / SPPS)과 스테인리스강관(KS D 3576 / SUS304)의 외경·두께·내경·중량을 버튼 하나로 즉시 조회하고, 하수관·오수관의 구배 단차를 길이와 경사율 입력만으로 계산합니다. 수압 테스트 탭에서는 관경과 배관 길이를 입력하면 필요 물량(㎥/L)과 물 무게(톤)를 즉시 산출하여 물차 몇 톤짜리를 불러야 하는지까지 안내합니다. 모든 데이터가 코드에 하드코딩되어 있어 인터넷 연결 없이도 현장에서 바로 사용할 수 있습니다.',
          useCases: [
            { icon: '🔧', title: '배관 규격 현장 즉시 조회', desc: '코팅된 KS 규격표를 들고 다닐 필요 없이 호칭경과 스케줄을 선택하면 외경·두께·내경·1m당 중량이 즉시 표시됩니다. 부속(엘보·티) 선정과 용접 작업 전 규격 확인에 활용하세요.' },
            { icon: '📐', title: '오수관·드레인 배관 구배 계산', desc: '하수관·오수관·에어컨 드레인 배관 시공 시 총 길이와 경사율을 입력하면 시작점과 끝점의 단차(mm)를 즉시 계산합니다. 1/100, 1/200 등 현장 국룰 경사율 프리셋을 제공합니다.' },
            { icon: '💧', title: '수압 테스트 물차 준비', desc: '배관 공사 완료 후 수압 테스트에 필요한 물 용량(㎥, L)과 무게(톤)를 즉시 산출합니다. 필요한 물차 규모까지 자동으로 추천하여 준비 시간을 단축할 수 있습니다.' },
            { icon: '📱', title: '인터넷 없는 현장에서도 사용', desc: '모든 KS 규격 데이터가 코드에 내장되어 있어 지하 현장이나 인터넷이 없는 환경에서도 즉시 사용할 수 있습니다. 스마트폰 브라우저 북마크 하나로 현장 어디서든 접근 가능합니다.' },
          ],
          steps: [
            { step: '탭 선택', desc: '상단 탭에서 원하는 기능을 선택합니다. "배관 규격 조회"는 KS 규격 확인, "구배 계산"은 경사 단차 계산, "수압 테스트"는 물량 산출에 사용합니다.' },
            { step: '규격 조회', desc: '"배관 규격 조회" 탭에서 재질(탄소강/스테인리스)과 호칭경 버튼을 선택한 뒤 스케줄 번호를 누르면 외경·두께·내경·중량이 즉시 표시됩니다.' },
            { step: '구배 계산', desc: '"구배 계산" 탭에서 배관 총 길이(m)와 경사율을 입력하면 시작~끝 단차(mm)가 즉시 계산됩니다. 오수관·에어컨 드레인 등 용도별 경사율 프리셋을 활용하세요.' },
            { step: '수압 테스트', desc: '"수압 테스트" 탭에서 호칭경과 배관 총 길이를 입력하면 필요 물량과 물 무게가 즉시 표시됩니다. 여유율을 선택하면 드레인·공기 빼기 손실분까지 반영한 최종 물량이 산출됩니다.' },
          ],
          faqs: [
            { q: '탄소강관과 스테인리스강관의 규격이 다른가요?', a: '동일한 호칭경(예: 100A)이라도 재질에 따라 두께가 다릅니다. 스테인리스강관은 인장강도가 높아 동일한 스케줄 번호라도 탄소강관보다 두께가 얇습니다. 또한 스테인리스강관의 스케줄에는 "S"가 붙어 SCH10S, SCH40S로 구분합니다. 본 계산기는 재질별로 별도 DB를 적용하여 정확한 규격을 제공합니다.' },
            { q: '구배 계산에서 경사율 1/100은 어떤 의미인가요?', a: '경사율 1/100은 배관 100mm 길이당 1mm의 높이 차이가 생긴다는 뜻입니다. 즉 10m 배관이라면 끝점이 시작점보다 100mm(10cm) 낮아야 합니다. 현장에서는 오수관에 1/50~1/100, 우수관에 1/100~1/200, 에어컨 드레인에 최소 1/100 이상의 경사율을 적용하는 것이 일반적입니다.' },
            { q: '수압 테스트 물량 계산 시 SCH40 내경을 기준으로 하는 이유는 무엇인가요?', a: '수압 테스트 물량 계산에서 정확한 스케줄을 모르더라도 현장에서 가장 많이 사용하는 SCH40 기준으로 계산하면 실제와 큰 차이가 없습니다. 또한 여유율(10~20%)을 적용하므로 스케줄 차이에 의한 오차는 충분히 흡수됩니다. 더 정확한 계산이 필요하다면 탭 1에서 실제 내경을 확인하여 직접 계산하시기 바랍니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 KS/JIS 규격 기반의 현장 참고용으로만 제공됩니다. 실제 설계·시공 시에는 반드시 최신 KS 규격표, 설계도서, 현장 감리 기준을 기준으로 최종 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'What is the Piping Calculator?',
          description:
            'The Piping Calculator combines three field-essential tools into one mobile-friendly app: KS pipe spec lookup, slope drop calculation, and hydro test water volume estimation. Carbon steel pipes (KS D 3562 / SPPS) and stainless steel pipes (KS D 3576 / SUS304) are fully covered, with outside diameter, wall thickness, inside diameter, and per-meter weight available at a single tap. The slope tab instantly calculates the start-to-end drop for sewage, AC drain, and storm drain pipes given a length and slope ratio. The hydro test tab estimates the required water volume (m³, liters) and weight (tons) for pressure testing, even recommending the appropriate water truck size. All pipe spec data is hardcoded — the tool works fully offline once loaded, ideal for basement construction sites or remote work environments without reliable internet.',
          useCases: [
            { icon: '🔧', title: 'On-site KS Spec Lookup', desc: 'Replace the laminated KS spec sheet in your pocket. Select nominal size and schedule to instantly view OD, thickness, ID, and weight before welding or fitting selection.' },
            { icon: '📐', title: 'Sewage & AC Drain Slope', desc: 'Enter total pipe length and slope ratio (1/100, 1/200, etc.) to get the exact mm drop from start to end. Built-in field presets for sewage, storm, and AC drain installations.' },
            { icon: '💧', title: 'Hydro Test Truck Prep', desc: 'Calculate water volume (m³, L) and weight (tons) for pressure testing completed piping. Receive an automatic recommendation for the correct truck size to dispatch.' },
            { icon: '📱', title: 'Works Offline on Site', desc: 'All KS spec data is bundled in the app — once loaded, it works in basements, tunnels, and remote sites without internet. Just bookmark it on your phone browser.' },
          ],
          steps: [
            { step: 'Pick a Tab', desc: 'Choose between Spec Lookup (KS sizing), Slope (drop calculation), or Hydro Test (water volume) depending on the task at hand.' },
            { step: 'Spec Lookup', desc: 'Tap the material (Carbon or Stainless), choose the nominal size, then the schedule. OD, thickness, ID, and weight appear instantly in the result card.' },
            { step: 'Slope Calculation', desc: 'Enter total pipe length in meters and select a slope ratio preset. The exact start-to-end drop in mm appears with field-tested guidance on whether the slope is adequate.' },
            { step: 'Hydro Test Volume', desc: 'Select the pipe size, enter total length, and pick a safety margin. The tool computes net and total water volume, weight in tons, and recommends the truck size needed.' },
          ],
          faqs: [
            { q: 'Why do carbon and stainless steel pipes have different specs?', a: 'Even at the same nominal size (e.g., 100A), wall thickness differs by material. Stainless steel has higher tensile strength, so the same schedule number yields a thinner wall than carbon steel. Stainless schedules also carry an "S" suffix (SCH10S, SCH40S). This calculator uses separate KS-compliant databases for each material to ensure accurate readings.' },
            { q: 'What does a 1/100 slope mean?', a: 'A 1/100 slope means the pipe drops 1mm in height per 100mm of horizontal length. For a 10m pipe, the end must be 100mm (10cm) lower than the start. Standard field practice: sewage pipes use 1/50~1/100, storm drains 1/100~1/200, and AC drains require at least 1/100.' },
            { q: 'Why does the hydro test use SCH40 inner diameter?', a: 'In hydro testing, the SCH40 ID is the field-standard reference because it gives results within a few percent of most real-world schedules. Combined with the 10-20% safety margin you set, schedule-based variation is well absorbed. For exact calculation, look up the actual ID on the Spec Lookup tab and compute manually.' },
            { q: 'Can I use this result as official data?', a: 'Results are based on KS/JIS standards and are provided for field reference only. Always confirm against current KS spec sheets, design drawings, and on-site supervision standards before construction.' },
          ],
        }}
      />
    </div>
  );
}
