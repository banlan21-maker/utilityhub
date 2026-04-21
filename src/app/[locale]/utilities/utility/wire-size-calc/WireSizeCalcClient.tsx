'use client';

import { useState, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { Zap, Copy, AlertTriangle } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './wire-size-calc.module.css';

// ── Constants ──────────────────────────────────────────────────

type SystemType = '1P2W' | '1P3W' | '3P3W_220' | '3P3W_380' | '3P4W';
type WireType = 'cv' | 'hiv' | 'hfix';

const SQ_SIZES = [2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];

const AMPACITY_CV: Record<number, number> = {
  2.5: 27, 4: 35, 6: 46, 10: 63, 16: 84,
  25: 112, 35: 138, 50: 168, 70: 213,
  95: 258, 120: 300, 150: 343, 185: 392, 240: 462,
};

const AMPACITY_HIV: Record<number, number> = {
  2.5: 24, 4: 32, 6: 41, 10: 57, 16: 76,
  25: 101, 35: 125, 50: 152, 70: 193,
  95: 233, 120: 271, 150: 310, 185: 355, 240: 419,
};

const AMPACITY_HFIX: Record<number, number> = {
  2.5: 27, 4: 35, 6: 46, 10: 63, 16: 84,
  25: 112, 35: 138, 50: 168, 70: 213,
  95: 258, 120: 300, 150: 343, 185: 392, 240: 462,
};

function getAmpacityTable(wireType: WireType) {
  if (wireType === 'hiv') return AMPACITY_HIV;
  if (wireType === 'hfix') return AMPACITY_HFIX;
  return AMPACITY_CV;
}

interface SystemConfig {
  K: number;
  baseVoltage: number;
  voltage: number;
  labelKo: string;
  labelEn: string;
}

const SYSTEM_CONFIG: Record<SystemType, SystemConfig> = {
  '1P2W':     { K: 35.6, baseVoltage: 220, voltage: 220, labelKo: '단상 2선식 220V',   labelEn: 'Single-phase 2-wire 220V' },
  '1P3W':     { K: 17.8, baseVoltage: 220, voltage: 220, labelKo: '단상 3선식 220V',   labelEn: 'Single-phase 3-wire 220V' },
  '3P3W_220': { K: 30.8, baseVoltage: 220, voltage: 220, labelKo: '삼상 3선식 220V',   labelEn: '3-phase 3-wire 220V' },
  '3P3W_380': { K: 30.8, baseVoltage: 380, voltage: 380, labelKo: '삼상 3선식 380V',   labelEn: '3-phase 3-wire 380V' },
  '3P4W':     { K: 17.8, baseVoltage: 220, voltage: 380, labelKo: '삼상 4선식 380V',   labelEn: '3-phase 4-wire 380V' },
};

// ── Main component ─────────────────────────────────────────────

export default function WireSizeCalcClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  // inputs
  const [systemType, setSystemType] = useState<SystemType>('1P2W');
  const [inputMode, setInputMode] = useState<'ampere' | 'kw'>('ampere');
  const [ampStr, setAmpStr]   = useState('');
  const [kwStr, setKwStr]     = useState('');
  const [pf, setPf]           = useState(0.9);
  const [lengthStr, setLengthStr] = useState('');
  const [dropRate, setDropRate]   = useState(3);
  const [wireType, setWireType]   = useState<WireType>('cv');
  const [copyMsg, setCopyMsg]     = useState('');

  const cfg = SYSTEM_CONFIG[systemType];
  const isThreePhase = systemType.startsWith('3P');

  // kW → A conversion
  const convertedCurrent = useMemo(() => {
    const kw = parseFloat(kwStr);
    if (isNaN(kw) || kw <= 0) return null;
    if (!isThreePhase) {
      return (kw * 1000) / (cfg.voltage * pf);
    }
    // 삼상: kW→A 환산은 선간전압(voltage) 그대로 사용 (3P4W도 380V)
    return (kw * 1000) / (Math.sqrt(3) * cfg.voltage * pf);
  }, [kwStr, cfg.voltage, pf, isThreePhase]);

  const loadCurrent = useMemo(() => {
    if (inputMode === 'ampere') return parseFloat(ampStr) || 0;
    return convertedCurrent ?? 0;
  }, [inputMode, ampStr, convertedCurrent]);

  const length = parseFloat(lengthStr) || 0;

  // ── Calculation ──
  const result = useMemo(() => {
    if (loadCurrent <= 0 || length <= 0) return null;

    const { K, baseVoltage } = cfg;
    const ampacityTable = getAmpacityTable(wireType);

    // STEP 1: 허용전류 기준
    const sqByAmpacity = SQ_SIZES.find(sq => ampacityTable[sq] >= loadCurrent) ?? 240;

    // STEP 2: 전압강하 기준 (KEC 실무 공식)
    const allowedDrop = baseVoltage * (dropRate / 100);
    const requiredArea = (K * length * loadCurrent) / (1000 * allowedDrop);
    const sqByVoltageDrop = SQ_SIZES.find(sq => sq >= requiredArea) ?? 240;

    // STEP 3: 최종 권장
    const recommendedSq = Math.max(sqByAmpacity, sqByVoltageDrop);

    // STEP 4: 파생 계산
    const actualDrop = (K * length * loadCurrent) / (1000 * recommendedSq);
    const actualDropRate = (actualDrop / baseVoltage) * 100;
    const actualAmpacity = ampacityTable[recommendedSq];

    return {
      sqByAmpacity,
      sqByVoltageDrop,
      recommendedSq,
      actualDrop,
      actualDropRate,
      actualAmpacity,
      K,
      baseVoltage,
    };
  }, [loadCurrent, length, dropRate, wireType, cfg]);

  // ── Copy ──
  const handleCopy = async () => {
    if (!result) return;
    const wireLabelKo = wireType === 'cv' ? 'CV케이블' : wireType === 'hiv' ? 'HIV전선' : 'HFIX전선';
    const wireLabelEn = wireType === 'cv' ? 'CV Cable' : wireType === 'hiv' ? 'HIV Wire' : 'HFIX Wire';
    const text = `[${isKo ? '전선 굵기 산정 결과' : 'Wire Size Calculation Result'}]
${isKo ? '전압' : 'Voltage'}: ${isKo ? cfg.labelKo : cfg.labelEn} / K=${result.K}
${isKo ? '부하전류' : 'Load Current'}: ${loadCurrent.toFixed(1)}A
${isKo ? '배선길이' : 'Cable Length'}: ${length}m
${isKo ? '권장 규격' : 'Recommended'}: ${result.recommendedSq} SQ (${isKo ? wireLabelKo : wireLabelEn})
${isKo ? '허용전류 기준' : 'Ampacity basis'}: ${result.sqByAmpacity} SQ
${isKo ? '전압강하 기준' : 'Voltage drop basis'}: ${result.sqByVoltageDrop} SQ
${isKo ? '실제 전압강하율' : 'Actual drop rate'}: ${result.actualDropRate.toFixed(2)}% (${isKo ? '기준전압' : 'base'}: ${result.baseVoltage}V)
※ ${isKo ? '허용전류는 공기 중 단심 기준 약식 계산입니다.' : 'Ampacity is calculated for single-core, open-air installation.'}
📐 theutilhub.com/utilities/utility/wire-size-calc`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsg(isKo ? '✓ 복사됨' : '✓ Copied');
    } catch {
      setCopyMsg(isKo ? '❌ 복사 실패' : '❌ Copy failed');
    }
    setTimeout(() => setCopyMsg(''), 2500);
  };

  const wireLabel = wireType === 'cv'
    ? (isKo ? 'CV케이블' : 'CV Cable')
    : wireType === 'hiv'
    ? (isKo ? 'HIV전선' : 'HIV Wire')
    : (isKo ? 'HFIX전선' : 'HFIX Wire');

  const titleStr = isKo ? '전선 굵기 산정 계산기' : 'Wire Size Calculator';
  const descStr  = isKo
    ? 'KEC 실무 표준 공식 적용. 전류·용량·배선 거리 입력으로 적합한 전선 SQ 규격 즉시 산정.'
    : 'Calculate the right wire size (SQ) using KEC standard formulas. Supports single-phase and three-phase systems.';

  return (
    <div className={s.container}>
      <NavigationActions />

      <header className={s.header}>
        <div className={s.icon_wrap}>
          <Zap size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.title}>{titleStr}</h1>
        <p className={s.subtitle}>{descStr}</p>
      </header>

      {/* Input Panel */}
      <section className={s.panel} aria-label={isKo ? '입력' : 'Input'}>

        {/* 전압 유형 */}
        <div className={s.field}>
          <label className={s.field_label}>{isKo ? '전압 유형' : 'Voltage System'}</label>
          <select
            className={s.field_select}
            value={systemType}
            onChange={e => setSystemType(e.target.value as SystemType)}
            aria-label={isKo ? '전압 유형 선택' : 'Select voltage system'}
          >
            <option value="1P2W">{isKo ? '단상 2선식 220V' : 'Single-phase 2-wire 220V'}</option>
            <option value="1P3W">{isKo ? '단상 3선식 220V' : 'Single-phase 3-wire 220V'}</option>
            <option value="3P3W_220">{isKo ? '삼상 3선식 220V' : '3-phase 3-wire 220V'}</option>
            <option value="3P3W_380">{isKo ? '삼상 3선식 380V' : '3-phase 3-wire 380V'}</option>
            <option value="3P4W">{isKo ? '삼상 4선식 380V' : '3-phase 4-wire 380V'}</option>
          </select>
        </div>

        {/* 부하 입력 방식 토글 */}
        <div className={s.toggle_row}>
          <button
            className={`${s.toggle_btn} ${inputMode === 'ampere' ? s.toggle_active : ''}`}
            onClick={() => setInputMode('ampere')}
            aria-pressed={inputMode === 'ampere'}
            aria-label={isKo ? '전류 직접 입력 모드' : 'Direct ampere input mode'}
          >{isKo ? '전류(A) 직접 입력' : 'Direct current (A)'}</button>
          <button
            className={`${s.toggle_btn} ${inputMode === 'kw' ? s.toggle_active : ''}`}
            onClick={() => setInputMode('kw')}
            aria-pressed={inputMode === 'kw'}
            aria-label={isKo ? '용량 kW 입력 모드' : 'kW capacity input mode'}
          >{isKo ? '용량(kW)으로 환산' : 'Convert from kW'}</button>
        </div>

        {/* 전류 / kW 입력 + 역률 */}
        <div className={inputMode === 'kw' ? s.two_col : ''}>
          <div className={s.field}>
            <label className={s.field_label}>
              {inputMode === 'ampere'
                ? (isKo ? '부하 전류 (A)' : 'Load Current (A)')
                : (isKo ? '부하 용량 (kW)' : 'Load Capacity (kW)')}
            </label>
            {inputMode === 'ampere' ? (
              <input
                type="number" step="0.1" min="0"
                placeholder={isKo ? '예: 30' : 'e.g. 30'}
                className={s.field_input}
                value={ampStr}
                onChange={e => setAmpStr(e.target.value)}
                aria-label={isKo ? '부하 전류 입력' : 'Load current input'}
              />
            ) : (
              <>
                <input
                  type="number" step="0.1" min="0"
                  placeholder={isKo ? '예: 7.5' : 'e.g. 7.5'}
                  className={s.field_input}
                  value={kwStr}
                  onChange={e => setKwStr(e.target.value)}
                  aria-label={isKo ? '부하 용량 입력' : 'Load capacity input'}
                />
                {convertedCurrent !== null && (
                  <p className={s.converted_current}>
                    = {isKo ? '약' : '≈'} {convertedCurrent.toFixed(1)} A
                  </p>
                )}
              </>
            )}
          </div>

          {/* 역률 슬라이더 (kW 모드일 때만) */}
          {inputMode === 'kw' && (
            <div className={s.field}>
              <label className={s.field_label}>{isKo ? '역률 (Power Factor)' : 'Power Factor'}</label>
              <p className={s.pf_value}>{pf.toFixed(2)}</p>
              <div className={s.slider_wrap}>
                <input
                  type="range" min={0.7} max={1.0} step={0.01}
                  className={s.slider}
                  value={pf}
                  onChange={e => setPf(parseFloat(e.target.value))}
                  aria-label={isKo ? '역률 슬라이더' : 'Power factor slider'}
                />
                <div className={s.slider_label}><span>0.70</span><span>1.00</span></div>
              </div>
            </div>
          )}
        </div>

        {/* 배선 길이 + 허용 전압강하율 */}
        <div className={s.two_col}>
          <div className={s.field}>
            <label className={s.field_label}>{isKo ? '배선 길이 (m)' : 'Cable Length (m)'}</label>
            <input
              type="number" step="1" min="0"
              placeholder={isKo ? '예: 50' : 'e.g. 50'}
              className={s.field_input}
              value={lengthStr}
              onChange={e => setLengthStr(e.target.value)}
              aria-label={isKo ? '배선 길이 입력' : 'Cable length input'}
            />
            <p className={s.field_hint}>
              {isKo ? '분전반에서 부하(장비)까지의 편도 거리' : 'One-way distance from panel to load'}
            </p>
          </div>

          <div className={s.field}>
            <label className={s.field_label}>{isKo ? '허용 전압강하율 (%)' : 'Allowed Voltage Drop (%)'}</label>
            <select
              className={s.field_select}
              value={dropRate}
              onChange={e => setDropRate(Number(e.target.value))}
              aria-label={isKo ? '허용 전압강하율 선택' : 'Select allowed voltage drop rate'}
            >
              <option value={2}>{isKo ? '2% (정밀 기기·의료장비 권장)' : '2% (Precision equipment)'}</option>
              <option value={3}>{isKo ? '3% (일반 동력 권장)' : '3% (General power, recommended)'}</option>
              <option value={5}>{isKo ? '5% (조명·일반 콘센트 허용)' : '5% (Lighting / outlets)'}</option>
            </select>
            <p className={s.field_hint}>
              {isKo ? 'KEC 기준: 간선 2% + 분기 2% = 합계 4% 이내' : 'KEC: feeder 2% + branch 2% = 4% total'}
            </p>
          </div>
        </div>

        {/* 배선 방식 */}
        <div className={s.field} style={{ marginBottom: 0 }}>
          <label className={s.field_label}>{isKo ? '배선 방식' : 'Wire Type'}</label>
          <select
            className={s.field_select}
            value={wireType}
            onChange={e => setWireType(e.target.value as WireType)}
            aria-label={isKo ? '배선 방식 선택' : 'Select wire type'}
          >
            <option value="cv">{isKo ? 'CV케이블 (600V 가교폴리에틸렌)' : 'CV Cable (600V XLPE)'}</option>
            <option value="hiv">{isKo ? 'HIV전선 (내열 비닐절연전선)' : 'HIV Wire (Heat-resistant PVC)'}</option>
            <option value="hfix">{isKo ? 'HFIX전선 (저독성 난연전선)' : 'HFIX Wire (Low-smoke flame-retardant)'}</option>
          </select>
        </div>
      </section>

      {/* Result */}
      {result && (
        <div className={s.result_section}>

          {/* Hero */}
          <div className={s.hero_card}>
            <p className={s.hero_label}>{isKo ? '권장 전선 규격' : 'Recommended Wire Size'}</p>
            <div>
              <span className={s.hero_sq}>{result.recommendedSq}</span>
              <span className={s.hero_unit}> SQ</span>
            </div>
            <p className={s.hero_sub}>{wireLabel} · K={result.K} · {isKo ? '기준전압' : 'base'} {result.baseVoltage}V</p>
          </div>

          {/* Basis cards */}
          <div className={s.basis_grid}>
            <div className={`${s.basis_card} ${result.recommendedSq === result.sqByAmpacity ? s.basis_card_highlight : ''}`}>
              <div className={s.basis_card_title}>{isKo ? '허용전류 기준' : 'Ampacity Basis'}</div>
              <div className={s.basis_sq}>{result.sqByAmpacity} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>SQ</span></div>
              <div className={s.basis_sub}>({isKo ? '허용전류' : 'rated'} {getAmpacityTable(wireType)[result.sqByAmpacity]}A)</div>
              {result.recommendedSq === result.sqByAmpacity && result.sqByAmpacity > result.sqByVoltageDrop && (
                <span className={s.basis_badge}>{isKo ? '✓ 결정 요인' : '✓ Decisive'}</span>
              )}
            </div>
            <div className={`${s.basis_card} ${result.recommendedSq === result.sqByVoltageDrop ? s.basis_card_highlight : ''}`}>
              <div className={s.basis_card_title}>{isKo ? '전압강하 기준' : 'Voltage Drop Basis'}</div>
              <div className={s.basis_sq}>{result.sqByVoltageDrop} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>SQ</span></div>
              <div className={s.basis_sub}>({isKo ? '강하율' : 'drop'} {result.actualDropRate.toFixed(2)}%)</div>
              {result.sqByVoltageDrop >= result.sqByAmpacity && (
                <span className={s.basis_badge}>{isKo ? '✓ 결정 요인' : '✓ Decisive'}</span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className={s.stats_grid}>
            <div className={s.stat_card}>
              <div className={s.stat_value}>{result.actualAmpacity}A</div>
              <div className={s.stat_label}>{isKo ? '허용전류' : 'Ampacity'}</div>
            </div>
            <div className={s.stat_card}>
              <div className={s.stat_value}>{result.actualDropRate.toFixed(2)}%</div>
              <div className={s.stat_label}>{isKo ? '실제 강하율' : 'Actual Drop'}</div>
            </div>
            <div className={s.stat_card}>
              <div className={s.stat_value}>{result.recommendedSq}</div>
              <div className={s.stat_label}>{isKo ? '최종 SQ' : 'Final SQ'}</div>
            </div>
          </div>

          {/* SQ bar visualization */}
          <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #f1f5f9', padding: '1.25rem 1.5rem' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '0.75rem' }}>
              {isKo ? 'SQ 규격 비교' : 'SQ Size Comparison'}
            </p>
            <div className={s.sq_bar_wrap}>
              {SQ_SIZES.map(sq => {
                const maxSq = 240;
                const pct = (sq / maxSq) * 100;
                const isRec = sq === result.recommendedSq;
                const isBelow = sq < result.recommendedSq;
                return (
                  <div key={sq} className={s.sq_bar_row}>
                    <span className={s.sq_bar_label} style={{ color: isRec ? '#8b5cf6' : undefined, fontWeight: isRec ? 800 : undefined }}>
                      {sq}
                    </span>
                    <div className={s.sq_bar_bg}>
                      <div
                        className={`${s.sq_bar_fill} ${isRec ? s.sq_bar_rec : isBelow ? s.sq_bar_below : s.sq_bar_above}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {isRec && <span style={{ fontSize: '0.7rem', color: '#8b5cf6', fontWeight: 700, flexShrink: 0 }}>← {isKo ? '권장' : 'rec'}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 경고 박스 (조건부) */}
          {result.actualDropRate > 5 && (
            <div className={s.warning_box}>
              ⚠️ {isKo
                ? `실제 전압강하율 ${result.actualDropRate.toFixed(2)}%가 5%를 초과합니다. 배선 거리를 줄이거나 더 굵은 전선 사용을 검토하세요.`
                : `Actual voltage drop ${result.actualDropRate.toFixed(2)}% exceeds 5%. Consider shorter cable runs or a larger wire size.`}
            </div>
          )}
          {result.recommendedSq >= 240 && (
            <div className={s.warning_box}>
              ⚠️ {isKo
                ? '240SQ는 최대 규격입니다. 실제 필요 단면적이 더 클 수 있으니 전문가 설계 검토가 필요합니다.'
                : '240 SQ is the maximum in this table. A professional design review may be required.'}
            </div>
          )}

          {/* 허용전류 면책 조항 — 항상 표시 */}
          <div className={s.disclaimer_box}>
            <AlertTriangle size={18} color="#92400E" className={s.disclaimer_icon} />
            <div>
              <p className={s.disclaimer_title}>
                {isKo ? '⚠️ 허용전류 적용 시 주의사항' : '⚠️ Ampacity Notice'}
              </p>
              <p className={s.disclaimer_body}>
                {isKo
                  ? '본 계산기의 허용전류는 KEC 규정 기준 \'공기 중 단심 노출\' 등 가장 기본적인 조건을 기준으로 한 약식 계산입니다. 전선관 매입, 다조 포설 등 실제 공사방법(A~F) 및 주위 온도에 따라 허용전류가 30% 이상 감소할 수 있습니다. 최종 설계 시 반드시 KEC 표준 규격표를 확인하십시오.'
                  : 'Ampacity values in this calculator are based on single-core, open-air installation (the most favorable condition per KEC). Conduit installation, bundled cables, or elevated ambient temperatures may reduce ampacity by 30% or more. Always verify against KEC standard tables before final design.'}
              </p>
            </div>
          </div>

          {/* Copy */}
          <div>
            <button className={s.copy_btn} onClick={handleCopy} aria-label={isKo ? '결과 복사' : 'Copy results'}>
              <Copy size={14} /> {isKo ? '결과 복사' : 'Copy results'}
            </button>
            {copyMsg && (
              <p className={`${s.copy_msg} ${copyMsg.includes('❌') ? s.copy_msg_fail : ''}`}>{copyMsg}</p>
            )}
          </div>
        </div>
      )}

      {/* Bottom 7 sections */}
      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utility/wire-size-calc" />
      <div className="w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">AD</div>
      <SeoSection
        ko={{
          title: '전선 굵기 산정 계산기란 무엇인가요?',
          description: '전선 굵기 산정 계산기는 전기공사 현장에서 부하 전류, 배선 거리, 전압 종류에 따라 적합한 전선 SQ 규격을 즉시 계산해주는 실무 도구입니다. KEC(한국전기설비규정) 실무 표준 공식을 적용하여 전선 방식별 전압강하 상수(K값: 단상 2선식 35.6, 삼상 3선식 30.8, 단상 3선식·삼상 4선식 17.8)를 자동으로 분기해 계산합니다. 특히 삼상 4선식 380V의 경우 전압강하 기준 전압을 상전압(220V)으로 올바르게 적용하여 과도한 굵기 산정 오류를 방지합니다. 허용전류 기준과 전압강하 기준을 동시에 계산하여 둘 중 더 큰 값을 최종 권장 규격으로 제시하며, 결과에는 실제 공사방법에 따른 허용전류 감소 주의사항을 함께 안내합니다.',
          useCases: [
            { icon: '⚡', title: '분전반 간선 굵기 산정', desc: '분전반에서 각 부하까지의 전선 굵기를 배선 거리와 부하 전류에 따라 즉시 계산할 수 있습니다. KEC 실무 K 상수를 자동 적용하여 허용전류와 전압강하를 동시에 검토합니다.' },
            { icon: '🏭', title: '동력 설비 전선 선정', desc: '에어컨·모터·펌프 등 삼상 동력 설비의 전선 굵기를 kW 용량과 배선 거리만 입력해 즉시 산정할 수 있습니다. 삼상 3선식·4선식 회로에 맞는 K 상수를 자동 분기합니다.' },
            { icon: '🔍', title: '기존 배선 적정성 검토', desc: '이미 설치된 전선 규격이 현재 부하에 적합한지 역으로 검토할 수 있습니다. 실제 전압강하율이 KEC 기준 이내인지 확인하고, 필요 시 교체 규격을 즉시 확인하세요.' },
            { icon: '📱', title: '현장 즉석 설계 변경 대응', desc: '현장에서 부하가 추가되거나 배선 경로가 변경될 때 스마트폰으로 바로 계산해 설계사 확인 전 현장 판단의 근거로 활용할 수 있습니다.' },
          ],
          steps: [
            { step: '전압 유형 선택', desc: '전압 유형을 선택합니다. 단상 2선식·3선식, 삼상 3선식(220V/380V), 삼상 4선식 380V 중 해당 회로의 전압 방식을 선택하면 이후 모든 계산에 K 상수와 기준 전압이 자동 반영됩니다.' },
            { step: '부하 전류 입력', desc: '부하 전류(A)를 직접 입력하거나, kW 용량과 역률을 입력해 자동 환산할 수 있습니다. 장비 명판의 전류값 또는 설계서의 부하 용량을 참고하세요.' },
            { step: '배선 조건 입력', desc: '분전반에서 부하까지의 편도 배선 거리(m)와 허용 전압강하율(%)을 입력합니다. KEC 기준상 간선은 2%, 분기회로는 2%로 합계 4% 이내가 권장됩니다.' },
            { step: '결과 확인 및 적용', desc: '결과에서 최종 권장 SQ와 근거 두 가지를 확인합니다. 결과 하단의 허용전류 주의사항을 반드시 확인하고, 실제 공사방법에 따라 전문가와 최종 검토하세요.' },
          ],
          faqs: [
            { q: '전압강하 계산에서 K 상수가 무엇인가요?', a: 'K 상수는 KEC(한국전기설비규정) 실무에서 사용하는 전압강하 공식 상수로, 온도 상승에 따른 전선 저항 증가를 반영한 값입니다. 회로 방식에 따라 단상 2선식은 35.6, 삼상 3선식은 30.8, 단상 3선식·삼상 4선식은 17.8을 적용합니다. 이 계산기는 전압 유형 선택에 따라 K 상수를 자동으로 분기합니다.' },
            { q: '삼상 4선식 380V에서 전압강하 기준이 220V인 이유는 무엇인가요?', a: '삼상 4선식 회로에서는 각 상이 중성선과 함께 독립적으로 부하에 전력을 공급합니다. 이때 각 상의 전압강하는 선간전압(380V)이 아닌 상전압(220V)을 기준으로 계산해야 KEC 실무 기준에 맞습니다. 380V 기준으로 계산하면 전선 굵기가 지나치게 굵게 산출되어 재료비가 과다하게 산정됩니다.' },
            { q: '허용전류 기준과 전압강하 기준 중 어떤 게 더 중요한가요?', a: '두 기준 모두 반드시 만족해야 합니다. 허용전류 기준은 전선의 과열 및 화재 방지를 위한 안전 기준이고, 전압강하 기준은 장비의 정상 작동을 위한 성능 기준입니다. 배선 거리가 짧으면 허용전류가 결정 요인이 되고, 거리가 길어질수록 전압강하가 결정 요인이 됩니다.' },
            { q: '결과의 허용전류가 실제 현장과 다를 수 있나요?', a: '네, 반드시 확인이 필요합니다. 본 계산기의 허용전류는 KEC 규정 기준 공기 중 단심 노출 조건을 기준으로 한 약식 계산입니다. 전선관 매입, 다조 포설 등 실제 공사방법(KEC 공사방법 A~F) 및 주위 온도에 따라 허용전류가 30% 이상 감소할 수 있습니다. 최종 설계 시에는 반드시 KEC 표준 규격표와 감리 기준을 확인하시기 바랍니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 실제 시공 시에는 반드시 KEC(한국전기설비규정), 설계도서, 감리 지침을 기준으로 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'What is the Wire Size Calculator?',
          description: 'The Wire Size Calculator helps electrical workers instantly determine the correct wire gauge (SQ) based on load current, cable length, and voltage system type — using KEC standard voltage drop constants. The calculator automatically selects the correct K constant for each wiring method: K=35.6 for single-phase 2-wire, K=30.8 for 3-phase 3-wire, and K=17.8 for single-phase 3-wire and 3-phase 4-wire circuits. For 3-phase 4-wire 380V systems, the voltage drop base is correctly set to the phase voltage (220V) rather than the line voltage (380V), preventing the overestimation error common with simplified calculations. The tool simultaneously calculates the minimum wire size by ampacity (to prevent overheating) and by voltage drop (to ensure equipment performance), then recommends the larger of the two. Results include an always-visible ampacity disclaimer noting that the values assume single-core, open-air installation — the most favorable condition — and that bundled or conduit-installed wiring may require derating by 30% or more. kW-to-ampere conversion is built in with an adjustable power factor slider. CV cable, HIV, and HFIX wire ampacity tables are all supported. All calculations run client-side with no server required.',
          useCases: [
            { icon: '⚡', title: 'Distribution Panel Feeder Sizing', desc: 'Quickly size the feeder wire from a distribution panel to each load by entering the load current and one-way cable distance — K constants are applied automatically for the selected voltage system.' },
            { icon: '🏭', title: 'Three-Phase Motor Wiring', desc: 'Enter kW capacity and distance for air conditioners, motors, or pumps on 3-phase circuits and let the calculator select the right K constant and base voltage automatically.' },
            { icon: '🔍', title: 'Existing Wiring Adequacy Check', desc: 'Verify whether currently installed wire sizes are adequate for the actual load by entering the existing current and cable length — see the real voltage drop percentage and compare against KEC limits.' },
            { icon: '📱', title: 'On-Site Design Change Response', desc: 'When loads are added or cable routes change on-site, use this tool on your phone to get an immediate size recommendation before a formal design review — with copy-to-clipboard for quick sharing.' },
          ],
          steps: [
            { step: 'Select voltage system', desc: 'Choose the circuit type from the dropdown: single-phase 2-wire, single-phase 3-wire, 3-phase 3-wire (220V or 380V), or 3-phase 4-wire 380V. The K constant and base voltage are automatically set for all downstream calculations.' },
            { step: 'Enter load', desc: 'Type the load current in amperes directly, or switch to kW mode and enter the equipment capacity with power factor to get the auto-converted current. Use the nameplate current or design specification as your reference.' },
            { step: 'Enter cable conditions', desc: 'Enter the one-way cable distance in meters from the panel to the load, select the allowed voltage drop percentage (2% for precision equipment, 3% for general power, 5% for lighting), and choose the wire insulation type.' },
            { step: 'Review and apply results', desc: 'Check the recommended SQ and the two basis cards showing which criterion was decisive. Read the ampacity disclaimer and verify the final wire size with a qualified engineer before procurement and installation.' },
          ],
          faqs: [
            { q: 'What is the K constant in the voltage drop formula?', a: 'The K constant is the voltage drop coefficient used in KEC (Korean Electrical Code) field practice. It incorporates resistance increase due to temperature rise, giving more accurate results than pure resistivity calculations. K=35.6 for single-phase 2-wire, K=30.8 for 3-phase 3-wire, and K=17.8 for single-phase 3-wire and 3-phase 4-wire systems. The calculator selects the correct K automatically.' },
            { q: 'Why is the voltage drop base 220V for a 3-phase 4-wire 380V system?', a: 'In a 3-phase 4-wire system, each phase supplies its load independently via the neutral conductor. Voltage drop across each phase should be calculated against the phase voltage (220V), not the line-to-line voltage (380V). Using 380V as the base would significantly overestimate the required wire size, leading to unnecessarily expensive material costs.' },
            { q: 'Which criterion matters more — ampacity or voltage drop?', a: 'Both must be satisfied simultaneously. Ampacity is a safety limit to prevent overheating and fire; voltage drop is a performance limit to ensure equipment operates correctly. Short cable runs are typically governed by ampacity, while long runs become governed by voltage drop. This calculator computes both and returns the larger (more conservative) recommendation.' },
            { q: 'Could the ampacity in the result differ from my actual installation?', a: 'Yes — always verify. The ampacity values assume single-core wire in free air (the most favorable KEC installation condition). Conduit installation, multiple cables bundled together, or high ambient temperatures can reduce allowable ampacity by 30% or more. Consult KEC installation method tables (A through F) and your supervising engineer before finalizing the design.' },
            { q: 'Can I use these results as official data?', a: 'Results are for reference only. For all actual construction work, verify the final specifications against KEC (Korean Electrical Code), your project design documents, and supervision guidelines before procurement or installation.' },
          ],
        }}
      />
    </div>
  );
}
