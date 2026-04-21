'use client';

import React, { useState, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { Wind, AlertTriangle, Copy, Check } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './ac-capacity-calc.module.css';

const CEILING_FACTOR: Record<string, number> = { standard: 1.0, high: 1.2, open: 1.5 };
const FLOOR_FACTOR: Record<string, number> = { basement: 1.05, ground: 1.05, middle: 1.0, top: 1.15 };
const SUN_FACTOR: Record<string, number> = { north: 0.9, east: 1.0, south: 1.1, west: 1.15, none: 0.85 };
const WINDOW_FACTOR: Record<string, number> = { single: 1.1, double: 1.0, full: 1.25 };
const INSULATION_FACTOR: Record<string, number> = { old: 1.15, normal: 1.0, new: 0.9 };
const BUSINESS_HEAT_FACTOR: Record<string, number> = {
  office: 1.0,
  cafe: 1.15,
  restaurant: 1.25,
  korean_bbq: 1.60,
  gym: 1.35,
  pc_room: 1.40,
  academy: 1.20,
  retail: 1.05,
  salon: 1.15,
};
const ROOM_FACTOR: Record<string, number> = {
  living: 1.0,
  bedroom: 0.85,
  kitchen: 1.2,
  home_office: 1.1,
};

export default function AcCapacityCalcClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [spaceType, setSpaceType] = useState<'commercial' | 'residential'>('residential');
  const [pyeong, setPyeong] = useState<string>('');
  const [ceiling, setCeiling] = useState<'standard' | 'high' | 'open'>('standard');
  const [floorPos, setFloorPos] = useState<string>('middle');
  const [sunDir, setSunDir] = useState<string>('east');
  const [windowType, setWindowType] = useState<string>('double');
  const [insulation, setInsulation] = useState<string>('normal');
  const [businessType, setBusinessType] = useState<string>('office');
  const [maxOccupants, setMaxOccupants] = useState<string>('');
  const [roomUsage, setRoomUsage] = useState<string>('living');
  const [occupants, setOccupants] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const p = parseFloat(pyeong);
    if (!p || p <= 0) return null;
    if (spaceType === 'commercial' && (!parseFloat(maxOccupants) || parseFloat(maxOccupants) <= 0)) return null;
    if (spaceType === 'residential' && (!parseFloat(occupants) || parseFloat(occupants) <= 0)) return null;

    const BASE_LOAD_PER_PYEONG = spaceType === 'commercial' ? 200 : 150;
    const areaSqm = p * 3.3058;
    const baseLoad = p * BASE_LOAD_PER_PYEONG;

    const factor_floor = FLOOR_FACTOR[floorPos];
    const factor_sun = SUN_FACTOR[sunDir];
    const factor_window = WINDOW_FACTOR[windowType];
    const factor_insulation = INSULATION_FACTOR[insulation];
    const factor_ceiling = CEILING_FACTOR[ceiling];

    const floorExtra = baseLoad * (factor_floor - 1);
    const floorAdjusted = baseLoad + floorExtra;
    const sunExtra = floorAdjusted * (factor_sun - 1);
    const sunAdjusted = floorAdjusted + sunExtra;
    const windowExtra = sunAdjusted * (factor_window - 1);
    const windowAdjusted = sunAdjusted + windowExtra;
    const insulationExtra = windowAdjusted * (factor_insulation - 1);
    const insulationAdjusted = windowAdjusted + insulationExtra;

    const ceilingExtra = insulationAdjusted * (factor_ceiling - 1);
    const envAdjustedLoad = insulationAdjusted + ceilingExtra;

    let spaceFactorExtra = 0;
    if (spaceType === 'commercial') {
      spaceFactorExtra = envAdjustedLoad * (BUSINESS_HEAT_FACTOR[businessType] - 1);
    } else {
      spaceFactorExtra = envAdjustedLoad * (ROOM_FACTOR[roomUsage] - 1);
    }

    const occ = spaceType === 'commercial' ? parseFloat(maxOccupants) : parseFloat(occupants);
    const occupantLoad = spaceType === 'commercial' ? occ * 100 : occ * 80;

    const totalLoadW = envAdjustedLoad + spaceFactorExtra + occupantLoad;
    const totalLoadKw = totalLoadW / 1000;
    const recommendedPyeong = Math.ceil(totalLoadKw / 0.7);
    const recommendedKwMin = totalLoadKw;
    const recommendedKwMax = totalLoadKw * 1.1;
    const simpleCapacityKw = p * 0.7;
    const loadMultiplier = Number((totalLoadKw / simpleCapacityKw).toFixed(1));

    const loadBreakdown = {
      baseLoad,
      floorExtra,
      sunExtra,
      windowExtra,
      insulationExtra,
      ceilingExtra,
      businessExtra: spaceType === 'commercial' ? spaceFactorExtra : 0,
      roomExtra: spaceType === 'residential' ? spaceFactorExtra : 0,
      occupantLoad,
    };

    return {
      areaSqm,
      totalLoadW,
      totalLoadKw,
      recommendedPyeong,
      recommendedKwMin,
      recommendedKwMax,
      loadMultiplier,
      simpleCapacityKw,
      loadBreakdown,
    };
  }, [spaceType, pyeong, ceiling, floorPos, sunDir, windowType, insulation, businessType, maxOccupants, roomUsage, occupants]);

  const getAcTypeRecommendation = (pyeongRating: number) => {
    if (pyeongRating <= 10) return 0;
    if (pyeongRating <= 25) return 1;
    if (pyeongRating <= 50) return 2;
    return 3;
  };

  const acTypes = isKo
    ? [
        { range: '~10평형', label: '벽걸이형 1대' },
        { range: '11~25평형', label: '스탠드형 1대 또는 벽걸이 2대' },
        { range: '26~50평형', label: '스탠드형 + 벽걸이 조합 또는 중형 시스템에어컨' },
        { range: '51평형~', label: '대형 시스템에어컨 (멀티형) 또는 패키지에어컨' },
      ]
    : [
        { range: '~10 pyeong', label: 'Wall-mount (single unit)' },
        { range: '11~25 pyeong', label: 'Standing unit or 2 wall-mounts' },
        { range: '26~50 pyeong', label: 'Standing + wall-mount combo or mid-size system AC' },
        { range: '51+ pyeong', label: 'Large system AC (multi-type) or package AC' },
      ];

  const activeAcType = result ? getAcTypeRecommendation(result.recommendedPyeong) : -1;

  const breakdownLabels: Record<string, { ko: string; en: string }> = {
    baseLoad: { ko: '기본 냉방 부하', en: 'Base cooling load' },
    floorExtra: { ko: '층위 보정', en: 'Floor adjustment' },
    sunExtra: { ko: '일사 보정', en: 'Solar adjustment' },
    windowExtra: { ko: '창문 보정', en: 'Window adjustment' },
    insulationExtra: { ko: '단열 보정', en: 'Insulation adjustment' },
    ceilingExtra: { ko: '층고 보정', en: 'Ceiling adjustment' },
    businessExtra: { ko: '업종 발열 부하', en: 'Business heat load' },
    roomExtra: { ko: '공간 용도 조정', en: 'Room usage adjustment' },
    occupantLoad: { ko: '인원 발열 부하', en: 'Occupant heat load' },
  };

  const ceilingLabel = isKo
    ? ({ standard: '표준 층고 (2.3~2.5m)', high: '높은 층고 (2.5~3.0m)', open: '오픈 천장 (3.0m+)' } as Record<string, string>)[ceiling]
    : ({ standard: 'Standard (2.3~2.5m)', high: 'High (2.5~3.0m)', open: 'Open ceiling (3.0m+)' } as Record<string, string>)[ceiling];

  const spaceLabel = isKo
    ? (spaceType === 'commercial' ? '상업 공간' : '가정용')
    : (spaceType === 'commercial' ? 'Commercial' : 'Residential');

  const copyText = result
    ? `[에어컨 용량 산정 결과]
공간: ${spaceLabel} / ${pyeong}평 (${result.areaSqm.toFixed(1)}m²)
층고: ${ceilingLabel}
총 냉방 부하: ${result.totalLoadKw.toFixed(1)}kW
권장 용량: 최소 ${result.recommendedKwMin.toFixed(1)}kW ~ ${result.recommendedKwMax.toFixed(1)}kW
권장 평형: 약 ${result.recommendedPyeong}평형 이상
단순 평수 대비: ${result.loadMultiplier}배 용량 필요
※ KRAQ 기준 약식 계산 / 전문 업체 확인 권장
🌬️ theutilhub.com/utilities/lifestyle/ac-capacity-calc`
    : '';

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(isKo ? '❌ 복사 실패: 브라우저 설정을 확인하세요' : '❌ Copy failed: check browser settings');
      setTimeout(() => setCopied(false), 3000);
    }
  }

  const breakdownKeys = [
    'baseLoad',
    'floorExtra',
    'sunExtra',
    'windowExtra',
    'insulationExtra',
    'ceilingExtra',
    'businessExtra',
    'roomExtra',
    'occupantLoad',
  ] as const;

  const totalAbsLoad = result
    ? breakdownKeys.reduce((sum, key) => sum + Math.abs(result.loadBreakdown[key as keyof typeof result.loadBreakdown]), 0)
    : 1;

  const title = isKo ? '에어컨 용량 산정기' : 'AC Capacity Calculator';
  const desc = isKo
    ? '실평수와 환경 조건 입력으로 적정 에어컨 용량(kW·평형)을 즉시 산정하세요.'
    : 'Calculate the right air conditioner capacity (kW) for your space instantly.';

  return (
    <div className={s.container}>
      <NavigationActions />

      {/* Header */}
      <header className={s.fin_header}>
        <div
          style={{
            display: 'inline-flex',
            padding: '1rem',
            background: 'white',
            borderRadius: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            marginBottom: '1.5rem',
          }}
        >
          <Wind size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.fin_title}>{isKo ? '에어컨 용량 산정기' : 'AC Capacity Calculator'}</h1>
        <p className={s.fin_subtitle}>
          {isKo
            ? '실평수·층고·환경 조건으로 적정 에어컨 용량(kW)을 즉시 산정합니다'
            : 'Instantly calculate the right AC capacity (kW) based on area, ceiling height, and environmental conditions'}
        </p>
      </header>

      {/* Input Panel */}
      <section className={s.fin_panel}>
        {/* Space Type Selection */}
        <div className={s.type_grid}>
          <button
            className={`${s.type_card} ${spaceType === 'commercial' ? s.type_card_active : ''}`}
            onClick={() => setSpaceType('commercial')}
            aria-label={isKo ? '상업 공간 선택' : 'Select commercial space'}
          >
            <span className={s.type_emoji}>🏪</span>
            <span className={s.type_label}>{isKo ? '상업 공간' : 'Commercial'}</span>
          </button>
          <button
            className={`${s.type_card} ${spaceType === 'residential' ? s.type_card_active : ''}`}
            onClick={() => setSpaceType('residential')}
            aria-label={isKo ? '가정용 선택' : 'Select residential space'}
          >
            <span className={s.type_emoji}>🏠</span>
            <span className={s.type_label}>{isKo ? '가정용' : 'Residential'}</span>
          </button>
        </div>

        {/* Common Inputs */}
        <div className={s.input_grid}>
          {/* 실평수 */}
          <div className={s.input_group}>
            <label className={s.label} htmlFor="pyeong">
              {isKo ? '실평수 (평)' : 'Floor Area (pyeong)'}
            </label>
            <input
              id="pyeong"
              type="number"
              className={s.input}
              value={pyeong}
              onChange={(e) => setPyeong(e.target.value)}
              placeholder={isKo ? '예: 30' : 'e.g. 30'}
              min={1}
              step={0.5}
              aria-label={isKo ? '실평수 입력' : 'Enter floor area in pyeong'}
            />
          </div>

          {/* 층고 */}
          <div className={s.input_group}>
            <label className={s.label} htmlFor="ceiling">
              {isKo ? '층고 (천장 높이)' : 'Ceiling Height'}
            </label>
            <select
              id="ceiling"
              className={s.select}
              value={ceiling}
              onChange={(e) => setCeiling(e.target.value as 'standard' | 'high' | 'open')}
              aria-label={isKo ? '층고 선택' : 'Select ceiling height'}
            >
              <option value="standard">{isKo ? '표준 층고 (2.3~2.5m)' : 'Standard (2.3~2.5m)'}</option>
              <option value="high">{isKo ? '높은 층고 (2.5~3.0m)' : 'High (2.5~3.0m)'}</option>
              <option value="open">{isKo ? '오픈 천장 (3.0m+)' : 'Open ceiling (3.0m+)'}</option>
            </select>
          </div>

          {/* 층 위치 */}
          <div className={s.input_group}>
            <label className={s.label} htmlFor="floorPos">
              {isKo ? '층 위치' : 'Floor Position'}
            </label>
            <select
              id="floorPos"
              className={s.select}
              value={floorPos}
              onChange={(e) => setFloorPos(e.target.value)}
              aria-label={isKo ? '층 위치 선택' : 'Select floor position'}
            >
              <option value="basement">{isKo ? '지하층' : 'Basement'}</option>
              <option value="ground">{isKo ? '지상 1층' : 'Ground floor'}</option>
              <option value="middle">{isKo ? '중간층' : 'Middle floor'}</option>
              <option value="top">{isKo ? '최상층' : 'Top floor'}</option>
            </select>
          </div>

          {/* 창문 방향 */}
          <div className={s.input_group}>
            <label className={s.label} htmlFor="sunDir">
              {isKo ? '창문 방향 (일사 방향)' : 'Window Direction (Sun exposure)'}
            </label>
            <select
              id="sunDir"
              className={s.select}
              value={sunDir}
              onChange={(e) => setSunDir(e.target.value)}
              aria-label={isKo ? '창문 방향 선택' : 'Select window direction'}
            >
              <option value="north">{isKo ? '북향' : 'North'}</option>
              <option value="east">{isKo ? '동향' : 'East'}</option>
              <option value="south">{isKo ? '남향' : 'South'}</option>
              <option value="west">{isKo ? '서향' : 'West'}</option>
              <option value="none">{isKo ? '창문 없음' : 'No windows'}</option>
            </select>
          </div>

          {/* 창문 유형 */}
          <div className={s.input_group}>
            <label className={s.label} htmlFor="windowType">
              {isKo ? '창문 유형' : 'Window Type'}
            </label>
            <select
              id="windowType"
              className={s.select}
              value={windowType}
              onChange={(e) => setWindowType(e.target.value)}
              aria-label={isKo ? '창문 유형 선택' : 'Select window type'}
            >
              <option value="single">{isKo ? '단창 (일반 유리)' : 'Single pane (standard glass)'}</option>
              <option value="double">{isKo ? '복층 유리 (이중창)' : 'Double pane (insulated glass)'}</option>
              <option value="full">{isKo ? '통유리 / 대형 창' : 'Full glass / Large window'}</option>
            </select>
          </div>

          {/* 단열 상태 */}
          <div className={s.input_group}>
            <label className={s.label} htmlFor="insulation">
              {isKo ? '단열 상태' : 'Insulation Quality'}
            </label>
            <select
              id="insulation"
              className={s.select}
              value={insulation}
              onChange={(e) => setInsulation(e.target.value)}
              aria-label={isKo ? '단열 상태 선택' : 'Select insulation quality'}
            >
              <option value="old">{isKo ? '노후 (15년 이상 건물)' : 'Poor (15+ year old building)'}</option>
              <option value="normal">{isKo ? '보통 (5~15년)' : 'Normal (5~15 years)'}</option>
              <option value="new">{isKo ? '신축 (5년 이내)' : 'New (within 5 years)'}</option>
            </select>
          </div>

          {/* Commercial-only fields */}
          {spaceType === 'commercial' && (
            <>
              <div className={s.divider} />
              <div className={`${s.input_group} ${s.full_width} ${s.conditional_section}`}>
                <label className={s.label} htmlFor="businessType">
                  {isKo ? '업종 선택' : 'Business Type'}
                </label>
                <select
                  id="businessType"
                  className={s.select}
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  aria-label={isKo ? '업종 선택' : 'Select business type'}
                >
                  <option value="office">{isKo ? '사무실' : 'Office'}</option>
                  <option value="cafe">{isKo ? '카페' : 'Cafe'}</option>
                  <option value="restaurant">{isKo ? '일반 식당' : 'Restaurant'}</option>
                  <option value="korean_bbq">{isKo ? '고기집 (직화)' : 'Korean BBQ'}</option>
                  <option value="gym">{isKo ? '헬스장·스포츠센터' : 'Gym / Sports center'}</option>
                  <option value="pc_room">{isKo ? 'PC방' : 'PC Room'}</option>
                  <option value="academy">{isKo ? '학원·교육시설' : 'Academy / Education'}</option>
                  <option value="retail">{isKo ? '소매점·편의점' : 'Retail / Convenience store'}</option>
                  <option value="salon">{isKo ? '미용실·네일샵' : 'Hair salon / Nail shop'}</option>
                </select>
              </div>
              <div className={`${s.input_group} ${s.conditional_section}`}>
                <label className={s.label} htmlFor="maxOccupants">
                  {isKo ? '최대 수용 인원 (명)' : 'Max Occupancy (persons)'}
                </label>
                <input
                  id="maxOccupants"
                  type="number"
                  className={s.input}
                  value={maxOccupants}
                  onChange={(e) => setMaxOccupants(e.target.value)}
                  placeholder={isKo ? '예: 30' : 'e.g. 30'}
                  min={1}
                  step={1}
                  aria-label={isKo ? '최대 수용 인원 입력' : 'Enter max occupancy'}
                />
                <span className={s.hint_text}>
                  {isKo ? '최대 동시 이용 인원 기준' : 'Maximum simultaneous occupants'}
                </span>
              </div>
            </>
          )}

          {/* Residential-only fields */}
          {spaceType === 'residential' && (
            <>
              <div className={s.divider} />
              <div className={`${s.input_group} ${s.conditional_section}`}>
                <label className={s.label} htmlFor="roomUsage">
                  {isKo ? '공간 용도' : 'Room Usage'}
                </label>
                <select
                  id="roomUsage"
                  className={s.select}
                  value={roomUsage}
                  onChange={(e) => setRoomUsage(e.target.value)}
                  aria-label={isKo ? '공간 용도 선택' : 'Select room usage'}
                >
                  <option value="living">{isKo ? '거실' : 'Living room'}</option>
                  <option value="bedroom">{isKo ? '침실' : 'Bedroom'}</option>
                  <option value="kitchen">{isKo ? '주방 포함 공간' : 'Kitchen area'}</option>
                  <option value="home_office">{isKo ? '홈오피스·서재' : 'Home office / Study'}</option>
                </select>
              </div>
              <div className={`${s.input_group} ${s.conditional_section}`}>
                <label className={s.label} htmlFor="occupants">
                  {isKo ? '거주 인원 (명)' : 'Occupants (persons)'}
                </label>
                <input
                  id="occupants"
                  type="number"
                  className={s.input}
                  value={occupants}
                  onChange={(e) => setOccupants(e.target.value)}
                  placeholder={isKo ? '예: 4' : 'e.g. 4'}
                  min={1}
                  step={1}
                  aria-label={isKo ? '거주 인원 입력' : 'Enter number of occupants'}
                />
                <span className={s.hint_text}>
                  {isKo ? '해당 공간 동시 사용 인원' : 'Simultaneous occupants in this space'}
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Result Section */}
      {result && (
        <div className={s.result_section}>
          {/* Main Result Box */}
          <div className={s.result_main}>
            <p className={s.result_label}>
              {isKo ? '권장 에어컨 용량' : 'Recommended AC Capacity'}
            </p>
            <p className={s.result_kw}>
              {isKo
                ? `최소 ${result.recommendedKwMin.toFixed(1)}kW ~ ${result.recommendedKwMax.toFixed(1)}kW`
                : `Min ${result.recommendedKwMin.toFixed(1)}kW ~ ${result.recommendedKwMax.toFixed(1)}kW`}
            </p>
            <p className={s.result_pyeong}>
              {isKo
                ? `(약 ${result.recommendedPyeong}평형 이상 권장)`
                : `(approx. ${result.recommendedPyeong} pyeong rating or above)`}
            </p>
          </div>

          {/* Load Breakdown Report */}
          <div className={s.report_section}>
            <p className={s.report_title}>{isKo ? '📊 냉방 부하 항목별 분석' : '📊 Cooling Load Breakdown'}</p>
            {breakdownKeys.map((key) => {
              const value = result.loadBreakdown[key as keyof typeof result.loadBreakdown];
              const label = isKo ? breakdownLabels[key].ko : breakdownLabels[key].en;
              const absValue = Math.abs(value);
              const barWidthPct = totalAbsLoad > 0 ? (absValue / totalAbsLoad) * 100 : 0;
              const isPositive = value > 0;
              const isZero = value === 0;

              // Skip zero-value business/room extras that don't apply to current space type
              if (key === 'businessExtra' && spaceType === 'residential') return null;
              if (key === 'roomExtra' && spaceType === 'commercial') return null;

              return (
                <div key={key} className={s.report_row}>
                  <span className={s.report_label}>{label}</span>
                  <div className={s.report_bar_wrap}>
                    {isZero ? (
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>—</span>
                    ) : (
                      <div
                        className={s.report_bar}
                        style={{
                          width: `${Math.max(barWidthPct, 2)}%`,
                          background: isPositive ? 'var(--color-primary)' : '#BFDBFE',
                        }}
                        role="progressbar"
                        aria-valuenow={Math.round(barWidthPct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    )}
                  </div>
                  <span className={s.report_value}>
                    {isZero ? '—' : `${value > 0 ? '+' : ''}${Math.round(value)}W`}
                    {!isPositive && !isZero && (
                      <span style={{ color: '#94a3b8', fontSize: '0.7rem', marginLeft: '4px' }}>
                        {isKo ? '(부하 감소)' : '(load reduction)'}
                      </span>
                    )}
                  </span>
                  <span className={s.report_pct}>
                    {isZero ? '' : `${Math.round(barWidthPct)}%`}
                  </span>
                </div>
              );
            })}
            <div className={`${s.report_row} ${s.report_total}`}>
              <span className={s.report_label} style={{ fontWeight: 700, color: '#1e293b' }}>
                {isKo ? '합계' : 'Total'}
              </span>
              <div className={s.report_bar_wrap} />
              <span className={s.report_value} style={{ fontWeight: 700, color: '#8b5cf6' }}>
                {Math.round(result.totalLoadW)}W
              </span>
              <span className={s.report_pct} style={{ fontWeight: 700, color: '#8b5cf6' }}>
                {result.totalLoadKw.toFixed(2)}kW
              </span>
            </div>
          </div>

          {/* Comparison Box */}
          <div className={s.compare_box}>
            <p className={s.compare_title}>{isKo ? '단순 평수 vs 실제 부하 비교' : 'Simple Area vs Actual Load Comparison'}</p>
            <div className={s.compare_row}>
              <span>{isKo ? `단순 ${pyeong}평형 기준` : `Simple ${pyeong} pyeong estimate`}</span>
              <span>{result.simpleCapacityKw.toFixed(1)} kW</span>
            </div>
            <div className={s.compare_row}>
              <span>{isKo ? '본 계산기 권장' : 'This calculator recommends'}</span>
              <span>{result.recommendedKwMin.toFixed(1)} kW</span>
            </div>
            <p className={s.compare_multiplier}>
              {isKo
                ? `→ 단순 평수의 ${result.loadMultiplier}배 용량이 필요합니다`
                : `→ ${result.loadMultiplier}x the capacity of a simple area estimate`}
            </p>
          </div>

          {/* AC Type Recommendation */}
          <div className={s.ac_type_section}>
            <p className={s.ac_type_title}>{isKo ? '추천 에어컨 유형' : 'Recommended AC Type'}</p>
            {acTypes.map((type, idx) => (
              <div
                key={idx}
                className={`${s.ac_type_row} ${idx === activeAcType ? s.ac_type_active : s.ac_type_inactive}`}
              >
                <span style={{ minWidth: '100px', fontSize: '0.85rem' }}>{type.range}</span>
                <span style={{ fontSize: '0.9rem' }}>{type.label}</span>
              </div>
            ))}
            {spaceType === 'commercial' && result.recommendedPyeong >= 26 && (
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                {isKo
                  ? '※ 상업 공간에는 천장형 시스템에어컨 또는 중앙 공조 시스템을 권장합니다.'
                  : '※ For commercial spaces, ceiling-type system AC or central HVAC is recommended.'}
              </p>
            )}
          </div>

          {/* Disclaimer */}
          <div className={s.disclaimer}>
            <AlertTriangle size={18} color="#92400E" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
            <p className={s.disclaimer_text}>
              {isKo
                ? '이 계산 결과는 KRAQ(한국냉동공조산업협회) 기준 약식 계산법을 참고한 추정치입니다. 실제 에어컨 용량 선정 및 설비 공사는 반드시 전문 냉동공조 업체의 현장 실사와 정밀 부하 계산을 통해 결정하시기 바랍니다.'
                : 'These results are estimates based on the KRAQ (Korea Refrigeration and Air-conditioning Industry Association) simplified calculation method. Actual AC sizing and installation should always be confirmed by a licensed HVAC professional conducting an on-site load assessment.'}
            </p>
          </div>

          {/* Copy Button */}
          <button
            className={s.copy_btn}
            onClick={handleCopy}
            aria-label={isKo ? '결과 복사' : 'Copy results'}
          >
            {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
            {copied
              ? (isKo ? '복사 완료!' : 'Copied!')
              : (isKo ? '결과 복사하기' : 'Copy Results')}
          </button>
        </div>
      )}

      <ShareBar title={title} description={desc} />
      <RelatedTools toolId="lifestyle/ac-capacity-calc" />
      <div className="w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">
        AD
      </div>

      <SeoSection
        ko={{
          title: '에어컨 용량 산정기란 무엇인가요?',
          description:
            '에어컨 용량 산정기는 식당·카페·학원·헬스장 등 상업 공간과 아파트·빌라 등 가정용 공간에 적합한 에어컨 용량(kW)을 정확하게 산정해주는 도구입니다. 단순히 평수에 맞는 평형을 선택하면 된다는 오해와 달리, 실제 냉방 부하는 층고(천장 높이), 층 위치, 창문 방향과 일사량, 단열 상태, 업종별 발열, 수용 인원 등 다양한 요소에 따라 크게 달라집니다. 특히 오픈 천장 카페나 식당은 표준 층고 대비 최대 1.5배의 냉방 용량이 필요합니다. 본 계산기는 KRAQ(한국냉동공조산업협회) 기준 약식 계산법을 참고하여 항목별 부하를 분석한 상세 리포트를 제공하며, 브랜드 추천 없이 순수 용량과 에어컨 유형만 안내합니다.',
          useCases: [
            {
              icon: '🍽️',
              title: '식당·카페 창업 시 에어컨 선정',
              desc: '오픈 천장 카페나 고기집 창업 시 층고, 주방 열기, 업종별 발열, 수용 인원을 모두 반영한 실제 필요 냉방 용량을 산정하세요. 단순 평수 선택으로 에어컨 용량이 부족해지는 실수를 방지할 수 있습니다.',
            },
            {
              icon: '🏠',
              title: '아파트·빌라 이사 전 용량 확인',
              desc: '새 집으로 이사 전 거실·침실의 층위, 창문 방향, 단열 상태를 고려한 최적 에어컨 용량을 미리 산정해 불필요하게 과도한 용량을 구입하는 낭비를 줄일 수 있습니다.',
            },
            {
              icon: '🏢',
              title: '사무실·학원 리모델링 시 설비 계획',
              desc: '사무실, 학원, PC방 등 상업 공간 리모델링 시 인원 밀집도와 내부 발열 장비를 반영한 냉방 부하를 사전에 산정해 설비 업체와 정확한 스펙을 협의하세요.',
            },
            {
              icon: '📱',
              title: '기존 에어컨 용량 적정성 검토',
              desc: '현재 사용 중인 에어컨이 충분한지 확인하고 싶을 때 활용하세요. 실제 필요 용량과 현재 설치 용량을 비교해 교체·추가 설치 필요 여부를 판단할 수 있습니다.',
            },
          ],
          steps: [
            {
              step: '공간 유형 선택',
              desc: "상단에서 '상업 공간' 또는 '가정용'을 선택합니다. 공간 유형에 따라 입력 항목이 달라지며, 상업 공간은 업종과 수용 인원을 추가로 입력합니다.",
            },
            {
              step: '실평수와 층고 입력',
              desc: '실평수와 층고(천장 높이)를 입력합니다. 오픈 천장이나 복층 구조는 표준 층고 대비 냉방 부하가 최대 1.5배 증가하므로 정확한 층고를 선택하는 것이 중요합니다.',
            },
            {
              step: '환경 조건 선택',
              desc: '층 위치, 창문 방향, 창문 유형, 단열 상태를 선택합니다. 서향 통유리 최상층처럼 불리한 조건이 겹칠수록 필요 용량이 크게 올라가는 것을 실시간으로 확인할 수 있습니다.',
            },
            {
              step: '결과 확인 및 공유',
              desc: '결과에서 권장 최소~최대 용량(kW)과 평형을 확인하고, 부하 항목별 분석 리포트에서 어떤 요소가 냉방 부하를 높이는지 파악하세요. 결과 복사 버튼으로 설비 업체와 공유할 수 있습니다.',
            },
          ],
          faqs: [
            {
              q: '30평이면 30평형 에어컨을 사면 되지 않나요?',
              a: "아닙니다. 에어컨 '평형'은 단순 면적 기준이 아니라 냉방 능력(kW) 기준입니다. 실제 냉방 부하는 층고, 창문 방향, 단열 상태, 층 위치, 업종 발열, 수용 인원에 따라 크게 달라집니다. 예를 들어 오픈 천장 서향 30평 고기집은 단순 30평형보다 2배 이상 큰 용량이 필요할 수 있습니다.",
            },
            {
              q: '층고(천장 높이)가 왜 중요한가요?',
              a: '냉방 부하는 평면 면적뿐 아니라 공간의 부피(면적 × 층고)에 비례합니다. 표준 층고(2.5m)를 기준으로 계산할 때, 오픈 천장(3m 이상)인 경우 같은 평수라도 냉방해야 할 공기량이 1.2~1.5배 더 많아집니다. 최근 인기 있는 오픈 천장 카페나 복층 식당에서 에어컨이 힘을 못 쓰는 주된 이유입니다.',
            },
            {
              q: '고기집이나 PC방은 왜 그렇게 용량이 많이 필요한가요?',
              a: '고기집은 테이블마다 직화 불판을 사용하고 주방에서도 강한 화력을 씁니다. PC방은 수십~수백 대의 PC와 모니터가 지속적으로 열을 발생시킵니다. 이런 내부 발열은 에어컨이 제거해야 할 열 부하에 그대로 추가됩니다. 고기집의 경우 동일 면적 사무실 대비 최대 1.6배, PC방은 1.4배의 냉방 용량이 필요합니다.',
            },
            {
              q: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
              a: '이 툴의 계산 결과는 KRAQ 기준 약식 계산법을 참고한 추정치로, 참고용으로만 제공됩니다. 실제 에어컨 용량 선정 및 설비 공사는 반드시 전문 냉동공조 업체의 현장 실사와 정밀 부하 계산을 통해 결정하시기 바랍니다.',
            },
          ],
        }}
        en={{
          title: 'What is the Air Conditioner Capacity Calculator?',
          description:
            'The Air Conditioner Capacity Calculator helps you find the right AC capacity (kW) for both commercial spaces like restaurants, cafes, and offices, and residential spaces like apartments and houses. Unlike the common misconception that you simply match the AC unit size (pyeong rating) to the room size, actual cooling load varies dramatically based on ceiling height, floor position, sun exposure, window type, insulation quality, business type heat output, and occupancy. The ceiling height correction factor (1.0 for standard, 1.2 for high ceilings 2.5–3m, 1.5 for open ceilings above 3m) is especially critical — open-ceiling cafes and restaurants often need 1.5x the cooling capacity of an equivalent standard-height space. Business types also carry significant heat multipliers: Korean BBQ restaurants require 1.6x the capacity of a standard office, while PC rooms require 1.4x due to continuous equipment heat generation. The calculator applies KRAQ (Korea Refrigeration and Air-conditioning Industry Association) simplified calculation methodology, providing a detailed load breakdown report that shows exactly how each factor contributes to your total cooling requirement. All calculations run client-side with no data sent to any server.',
          useCases: [
            {
              icon: '🍽️',
              title: 'Restaurant & Cafe Setup',
              desc: 'When opening a restaurant or cafe, factor in ceiling height, kitchen heat, business type multipliers, and maximum occupancy to find the true cooling capacity needed — avoiding the common mistake of undersizing.',
            },
            {
              icon: '🏠',
              title: 'Home AC Sizing Before Moving',
              desc: 'Before moving to a new apartment or house, calculate the optimal AC capacity for each room by considering floor level, window direction, and insulation age to avoid overspending or undersizing.',
            },
            {
              icon: '🏢',
              title: 'Office & Academy Renovation Planning',
              desc: 'During commercial space renovation, pre-calculate cooling loads based on occupancy density and internal heat sources to negotiate accurate specifications with HVAC contractors.',
            },
            {
              icon: '📱',
              title: 'Verify Existing AC Adequacy',
              desc: 'Use the calculator to check whether your current AC unit is appropriately sized for your space. Compare the calculated required capacity against your installed unit to determine if replacement or supplementation is needed.',
            },
          ],
          steps: [
            {
              step: 'Select Space Type',
              desc: "Choose 'Commercial' or 'Residential' at the top. Commercial spaces require additional inputs for business type and maximum occupancy, which significantly affect the heat load calculation.",
            },
            {
              step: 'Enter Area & Ceiling Height',
              desc: 'Input the actual usable floor area in pyeong and select ceiling height. Open ceilings (3m+) increase cooling load by up to 1.5x compared to standard height — this is one of the most impactful factors in the calculation.',
            },
            {
              step: 'Set Environmental Conditions',
              desc: 'Select floor position, window direction, window type, and insulation quality. Unfavorable combinations (e.g., west-facing, full-glass windows, top floor, poor insulation) can significantly increase required capacity.',
            },
            {
              step: 'Review Results & Share',
              desc: 'Check the recommended capacity range (min–max kW) and pyeong rating. Use the load breakdown report to understand which factors drive your cooling requirements, then copy the results to share with HVAC contractors.',
            },
          ],
          faqs: [
            {
              q: 'Can I just buy a unit that matches my room size in pyeong?',
              a: 'Not exactly. The pyeong rating on AC units refers to cooling capacity in kW, not just floor area. Actual cooling load depends on ceiling height, sun exposure, insulation, floor position, business type heat output, and occupancy. A 30-pyeong Korean BBQ restaurant with open ceilings and west-facing windows may need more than double the capacity of a standard 30-pyeong office.',
            },
            {
              q: 'Why does ceiling height matter so much?',
              a: 'Cooling load is proportional to the volume of air that needs to be cooled, not just the floor area. An open ceiling space (3m+) contains 1.2 to 1.5 times more air volume than a standard-height room of the same floor area. This is why many trendy open-ceiling cafes and restaurants suffer from inadequate cooling despite having large AC units.',
            },
            {
              q: 'Why do BBQ restaurants and PC rooms need so much more capacity?',
              a: 'Korean BBQ restaurants use direct-flame grills at every table plus high-heat commercial kitchens, adding massive internal heat loads. PC rooms run dozens to hundreds of PCs and monitors continuously, each generating significant heat. These internal heat sources add directly to the cooling load — BBQ restaurants typically need 1.6x and PC rooms 1.4x the capacity of equivalent standard offices.',
            },
            {
              q: 'Can I use these results as official specifications?',
              a: 'Results are for reference only, based on KRAQ simplified calculation methodology. Actual AC sizing for installation should always be confirmed by a licensed HVAC professional conducting an on-site load assessment, as building-specific factors like airtightness, equipment placement, and duct configuration can affect actual requirements.',
            },
          ],
        }}
      />
    </div>
  );
}
