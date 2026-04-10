'use client';

import React, { useState, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Sun } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import NavigationActions from '@/app/components/NavigationActions';
import s from './solar-master.module.css';

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = 'pv' | 'thermal';
type TiltKey = '0' | '15' | '30' | '45' | '90';
type FuelKey = 'gas' | 'kerosene' | 'electric';

interface PVInputs {
  region: string; width: number; height: number; qty: number;
  efficiency: number; tilt: TiltKey; systemType: 'grid' | 'ess';
  tempLoss: boolean; agingLoss: number; shadeLoss: boolean;
  installCost: number; subsidy: boolean; monthlyKwh: number;
}
interface ThermalInputs {
  region: string; area: number; efficiency: number;
  dailyHotWater: number; fuel: FuelKey;
  installCost: number; subsidy: boolean;
}

interface MonthRow { month: number; gen: number; saving: number; cum: number; coeff: number; }
interface Results {
  monthly: MonthRow[];
  annualGen: number; annualSaving: number;
  kWp: number; sysEfficiency: number; co2: number;
  breakEvenYear: number; breakEvenMonth: number;
  netCost: number;
  roiCurve: { year: number; cum: number }[];
  beforeBill: number; afterBill: number;
  fuelLabel?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const REGIONS: Record<string, number> = {
  '서울': 3.5, '인천': 3.4, '대전': 3.6, '대구': 3.8,
  '부산': 3.7, '광주': 3.6, '제주': 3.9, '전국 평균': 3.6,
};
const MONTH_COEFF = [0.80,0.90,1.10,1.20,1.20,1.00,0.90,1.00,1.10,1.10,0.90,0.80];
const TILT_COEFF: Record<TiltKey, number> = { '0':0.85, '15':0.95, '30':1.00, '45':0.95, '90':0.70 };
const FUEL_UNIT: Record<FuelKey, number> = { gas: 21.5, kerosene: 36.6, electric: 52.8 };
const FUEL_LABEL: Record<FuelKey, string> = { gas: '도시가스', kerosene: '등유', electric: '전기(심야)' };

// 한전 누진세 (주택용 2026년 기준)
function calcElecBill(kwh: number): number {
  if (kwh <= 0) return 0;
  let bill = 0;
  bill += Math.min(kwh, 200) * 120.0;
  if (kwh > 200) bill += Math.min(kwh - 200, 200) * 214.6;
  if (kwh > 400) bill += (kwh - 400) * 307.3;
  return Math.round(bill);
}

// ─── PV Calculation ───────────────────────────────────────────────────────────
function calcPV(inp: PVInputs): Results {
  const sunHrs = REGIONS[inp.region] ?? 3.6;
  const tiltC = TILT_COEFF[inp.tilt];
  const panelM2 = (inp.width / 1000) * (inp.height / 1000);
  const totalM2 = panelM2 * inp.qty;
  const kWp = totalM2 * (inp.efficiency / 100);
  const tempLossRate = inp.tempLoss ? 0.15 : 0;
  const shadeLossRate = inp.shadeLoss ? 0.20 : 0;
  const agingRate = inp.agingLoss / 100;
  const sysEff = (1 - tempLossRate) * (1 - agingRate) * (1 - shadeLossRate);

  const beforeBill = calcElecBill(inp.monthlyKwh);

  const monthly: MonthRow[] = [];
  let cumSaving = 0;
  for (let i = 0; i < 12; i++) {
    const mc = MONTH_COEFF[i];
    const gen = kWp * sunHrs * tiltC * mc * 30 * sysEff;
    const usedAfter = Math.max(0, inp.monthlyKwh - gen);
    const saving = inp.monthlyKwh > 0 ? calcElecBill(inp.monthlyKwh) - calcElecBill(usedAfter) : gen * 120;
    cumSaving += saving;
    monthly.push({ month: i + 1, gen: Math.round(gen), saving: Math.round(saving), cum: Math.round(cumSaving), coeff: mc });
  }

  const annualGen = monthly.reduce((a, r) => a + r.gen, 0);
  const annualSaving = monthly.reduce((a, r) => a + r.saving, 0);
  const co2 = Math.round(annualGen * 0.4781);

  const subsidyAmt = inp.subsidy ? inp.installCost * 0.3 : 0;
  const netCost = inp.installCost - subsidyAmt;

  const roiCurve = Array.from({ length: 21 }, (_, y) => ({
    year: y,
    cum: Math.round(y * annualSaving - netCost),
  }));

  const beTotalMonths = annualSaving > 0 ? (netCost / (annualSaving / 12)) : 999 * 12;
  const breakEvenYear = Math.floor(beTotalMonths / 12);
  const breakEvenMonth = Math.round(beTotalMonths % 12);

  const afterBill = calcElecBill(Math.max(0, inp.monthlyKwh - monthly[4].gen));

  return { monthly, annualGen, annualSaving, kWp, sysEfficiency: sysEff * 100, co2, breakEvenYear, breakEvenMonth, netCost, roiCurve, beforeBill, afterBill };
}

// ─── Thermal Calculation ──────────────────────────────────────────────────────
function calcThermal(inp: ThermalInputs): Results {
  const sunHrs = REGIONS[inp.region] ?? 3.6;
  const SOLAR_IRRAD = 3.6;
  const effRate = inp.efficiency / 100;

  const monthly: MonthRow[] = [];
  let cumSaving = 0;
  for (let i = 0; i < 12; i++) {
    const mc = MONTH_COEFF[i];
    const energyMJ = inp.area * SOLAR_IRRAD * effRate * sunHrs * mc * 30;
    const saving = energyMJ * FUEL_UNIT[inp.fuel];
    cumSaving += saving;
    monthly.push({ month: i + 1, gen: Math.round(energyMJ), saving: Math.round(saving), cum: Math.round(cumSaving), coeff: mc });
  }

  const annualGen = monthly.reduce((a, r) => a + r.gen, 0);
  const annualSaving = monthly.reduce((a, r) => a + r.saving, 0);
  const co2 = Math.round(annualGen * 0.056);
  const subsidyAmt = inp.subsidy ? inp.installCost * 0.3 : 0;
  const netCost = inp.installCost - subsidyAmt;

  const roiCurve = Array.from({ length: 21 }, (_, y) => ({
    year: y,
    cum: Math.round(y * annualSaving - netCost),
  }));

  const beTotalMonths = annualSaving > 0 ? (netCost / (annualSaving / 12)) : 999 * 12;
  const breakEvenYear = Math.floor(beTotalMonths / 12);
  const breakEvenMonth = Math.round(beTotalMonths % 12);

  return {
    monthly, annualGen, annualSaving, kWp: inp.area, sysEfficiency: inp.efficiency,
    co2, breakEvenYear, breakEvenMonth, netCost, roiCurve, beforeBill: 0, afterBill: 0,
    fuelLabel: FUEL_LABEL[inp.fuel],
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const won = (n: number) => `${Math.round(n).toLocaleString()}원`;
const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SolarMasterClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const resultRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<Tab>('pv');
  const [results, setResults] = useState<Results | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [pv, setPV] = useState<PVInputs>({
    region: '서울', width: 1722, height: 1134, qty: 6,
    efficiency: 20, tilt: '30', systemType: 'grid',
    tempLoss: true, agingLoss: 0.5, shadeLoss: false,
    installCost: 6000000, subsidy: true, monthlyKwh: 350,
  });

  const [th, setTH] = useState<ThermalInputs>({
    region: '서울', area: 4, efficiency: 65, dailyHotWater: 150,
    fuel: 'gas', installCost: 3500000, subsidy: true,
  });

  const pvSet = <K extends keyof PVInputs>(k: K, v: PVInputs[K]) => setPV(p => ({ ...p, [k]: v }));
  const thSet = <K extends keyof ThermalInputs>(k: K, v: ThermalInputs[K]) => setTH(p => ({ ...p, [k]: v }));

  const handleCalc = () => {
    const r = tab === 'pv' ? calcPV(pv) : calcThermal(th);
    setResults(r);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handlePDF = async () => {
    if (!resultRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(resultRef.current, { scale: 2, useCORS: true });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgW = 190; const imgH = (canvas.height * imgW) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, imgW, imgH);
      pdf.save('solar-master-report.pdf');
    } catch (e) { console.error(e); }
  };

  const handleInvoice = async () => {
    const LZString = (await import('lz-string')).default;
    const data = tab === 'pv'
      ? { items: [{ name: `태양광 패널 설치 (${results?.kWp?.toFixed(2)}kWp)`, amount: pv.installCost }, { name: '정부 보조금 차감', amount: pv.subsidy ? -pv.installCost * 0.3 : 0 }] }
      : { items: [{ name: `태양열 집열판 설치 (${th.area}m²)`, amount: th.installCost }, { name: '정부 보조금 차감', amount: th.subsidy ? -th.installCost * 0.3 : 0 }] };
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data));
    window.location.href = `/${locale}/utilities/finance/invoice-maker?data=${compressed}`;
  };

  const pvColor = '#06b6d4';
  const thColor = '#f97316';
  const activeColor = tab === 'pv' ? pvColor : thColor;

  const FAQ = isKo ? [
    { q: '지역별 일조시간은 어떤 데이터 기준인가요?', a: '기상청 공공데이터 기준 도시별 연평균 최대 일조시간(피크선레이시간)을 사용합니다.' },
    { q: '여름에 발전이 더 많지 않나요?', a: '일조량은 여름이 많지만 패널이 뜨거워지면 효율이 떨어집니다. 온도 손실(-15%)과 월별 보정계수를 동시 반영하여 봄(4~5월)이 가장 효율이 높게 나옵니다.' },
    { q: '정부 보조금 30%는 실제로 받을 수 있나요?', a: '주택용 태양광 보조금은 지자체·연도별로 다릅니다. 30%는 참고용 추정치이며, 정확한 금액은 한국에너지공단 또는 해당 지자체에 확인하세요.' },
    { q: '이 결과를 공식 자료로 사용해도 되나요?', a: '본 계산 결과는 이론적 추정치로 참고용입니다. 실제 발전량은 기상·음영·시공 품질에 따라 달라집니다. 투자 결정 전 반드시 전문 시공사와 상담하세요.' },
  ] : [
    { q: 'What solar irradiance data is used?', a: 'We use peak sun hours per city from KMA (Korea Meteorological Administration) annual averages.' },
    { q: 'Does summer give more output?', a: 'Summer has more irradiance but panels lose efficiency from heat. Our model applies -15% temperature loss + monthly correction, so spring (Apr-May) typically peaks.' },
    { q: 'Is the 30% subsidy realistic?', a: 'Korean residential subsidies vary by municipality and year. 30% is a conservative estimate — confirm with KEMCO or your local government.' },
    { q: 'Can I use these results officially?', a: 'Results are theoretical estimates for reference only. Actual generation depends on weather, shading, and installation quality. Always consult a certified installer before investing.' },
  ];

  const USE_CASES = isKo ? [
    { emoji: '🏠', title: '주택 설치 검토', desc: '내 집 태양광 설치 시 손익분기점을 계산하세요.' },
    { emoji: '🏭', title: '사업장 ROI 분석', desc: '대규모 설치의 연간 절감액과 회수 기간 확인.' },
    { emoji: '🔥', title: '태양열 온수 절감', desc: '가스·등유 대비 실제 절감액을 계산하세요.' },
    { emoji: '📋', title: '견적 검증', desc: '시공업체 견적 발전량이 현실적인지 직접 비교.' },
  ] : [
    { emoji: '🏠', title: 'Home Installation', desc: 'Calculate payback period before installing rooftop solar.' },
    { emoji: '🏭', title: 'Commercial ROI', desc: 'Annual savings and breakeven for large-scale installations.' },
    { emoji: '🔥', title: 'Thermal Savings', desc: 'Compare solar thermal vs gas/kerosene costs.' },
    { emoji: '📋', title: 'Quote Validation', desc: 'Verify if installer quotes are realistic.' },
  ];

  const HOW_TO = isKo ? [
    '원하는 탭(태양광/태양열)을 선택하고 지역과 패널 정보를 입력하세요.',
    '설치 비용과 현재 에너지 사용량을 입력하면 누진세 절감액이 자동 계산됩니다.',
    '분석 버튼을 누르면 월별 발전량, 손익분기점, 20년 ROI 곡선이 표시됩니다.',
    '결과 리포트를 PDF로 저장하거나 견적서로 내보내기 하세요.',
  ] : [
    'Select the tab (Solar PV / Solar Thermal) and enter your region and panel specs.',
    'Enter installation cost and current energy usage to calculate progressive-rate savings.',
    'Click Analyze to see monthly output, breakeven point, and 20-year ROI curve.',
    'Export the report as PDF or send to the Invoice Maker.',
  ];

  return (
    <div className={s.sm_wrap}>
      <NavigationActions />

      {/* Hero */}
      <div className={s.sm_hero}>
        <div className={s.sm_badge}><Sun size={12} /> Solar Master</div>
        <h1 className={s.sm_title}>☀️ Solar Master</h1>
        <p className={s.sm_subtitle}>
          {isKo
            ? '태양광·태양열 발전량, 절감액, 손익분기점 무료 정밀 계산기'
            : 'Solar PV & Thermal ROI Calculator — free, precise, instant'}
        </p>
      </div>

      <div className={s.sm_container}>
        {/* Tabs */}
        <div className={s.sm_tabs} role="tablist">
          {(['pv','thermal'] as Tab[]).map(t => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              onClick={() => { setTab(t); setResults(null); }}
              className={`${s.sm_tab} ${tab === t ? (t === 'pv' ? s.sm_tab_pv_active : s.sm_tab_th_active) : ''}`}
            >
              {t === 'pv' ? '⚡ ' : '🔥 '}
              {t === 'pv' ? (isKo ? '태양광 발전' : 'Solar PV') : (isKo ? '태양열 온수' : 'Solar Thermal')}
            </button>
          ))}
        </div>

        {/* ── PV INPUTS ── */}
        {tab === 'pv' && (
          <div id="panel-pv">
            {/* Region + Panel size */}
            <div className={s.sm_card}>
              <p className={`${s.sm_card_title} ${s.sm_card_title_pv}`}>🌏 {isKo ? '위치 및 패널 사양' : 'Location & Panel Specs'}</p>
              <div className={s.sm_grid2}>
                <div className={s.sm_field}>
                  <label className={s.sm_label}>{isKo ? '지역 선택' : 'Region'}</label>
                  <select className={`${s.sm_select} ${s.sm_input_pv}`} value={pv.region}
                    onChange={e => pvSet('region', e.target.value)}>
                    {Object.keys(REGIONS).map(r => <option key={r}>{r}</option>)}
                  </select>
                  <span className={s.sm_hint}>{isKo ? `일조시간: ${REGIONS[pv.region]}h/일 자동 반영` : `Sun hours: ${REGIONS[pv.region]}h/day auto-applied`}</span>
                </div>
                <div className={s.sm_field}>
                  <label className={s.sm_label}>{isKo ? '패널 효율(%)' : 'Panel Efficiency (%)'}</label>
                  <input type="number" className={`${s.sm_input} ${s.sm_input_pv}`} value={pv.efficiency}
                    min={5} max={30} onChange={e => pvSet('efficiency', Number(e.target.value))} />
                  <span className={s.sm_hint}>{isKo ? '보통 18~22% 권장' : 'Typically 18–22%'}</span>
                </div>
                <div className={s.sm_field}>
                  <label className={s.sm_label}>{isKo ? '패널 가로(mm)' : 'Panel Width (mm)'}</label>
                  <input type="number" className={`${s.sm_input} ${s.sm_input_pv}`} value={pv.width}
                    onChange={e => pvSet('width', Number(e.target.value))} />
                  <span className={s.sm_hint}>{isKo ? '패널 가로 길이' : 'Panel width in mm'}</span>
                </div>
                <div className={s.sm_field}>
                  <label className={s.sm_label}>{isKo ? '패널 세로(mm)' : 'Panel Height (mm)'}</label>
                  <input type="number" className={`${s.sm_input} ${s.sm_input_pv}`} value={pv.height}
                    onChange={e => pvSet('height', Number(e.target.value))} />
                  <span className={s.sm_hint}>{isKo ? '패널 세로 길이' : 'Panel height in mm'}</span>
                </div>
                <div className={s.sm_field}>
                  <label className={s.sm_label}>{isKo ? '설치 수량(장)' : 'Panel Count'}</label>
                  <input type="number" className={`${s.sm_input} ${s.sm_input_pv}`} value={pv.qty} min={1}
                    onChange={e => pvSet('qty', Number(e.target.value))} />
                  <span className={s.sm_hint}>{isKo ? `총 면적: ${((pv.width/1000)*(pv.height/1000)*pv.qty).toFixed(2)}m²` : `Total area: ${((pv.width/1000)*(pv.height/1000)*pv.qty).toFixed(2)}m²`}</span>
                </div>
                <div className={s.sm_field}>
                  <label className={s.sm_label}>{isKo ? '경사각' : 'Tilt Angle'}</label>
                  <select className={`${s.sm_select} ${s.sm_input_pv}`} value={pv.tilt}
                    onChange={e => pvSet('tilt', e.target.value as TiltKey)}>
                    <option value="0">0° (수평)</option>
                    <option value="15">15°</option>
                    <option value="30">30° ⭐ (한국 최적)</option>
                    <option value="45">45°</option>
                    <option value="90">90° (수직)</option>
                  </select>
                  <span className={s.sm_hint}>{isKo ? '보정계수: ×' : 'Coeff: ×'}{TILT_COEFF[pv.tilt]}</span>
                </div>
              </div>
            </div>

            {/* Loss factors */}
            <div className={s.sm_card}>
              <p className={`${s.sm_card_title} ${s.sm_card_title_pv}`}>📉 {isKo ? '손실 및 시스템' : 'Loss Factors'}</p>
              <div className={s.sm_grid2} style={{ marginBottom: '0.75rem' }}>
                <div className={s.sm_field}>
                  <label className={s.sm_label}>{isKo ? '노후화 손실(%/년)' : 'Annual Degradation (%/yr)'}</label>
                  <input type="number" className={`${s.sm_input} ${s.sm_input_pv}`} value={pv.agingLoss}
                    step={0.1} min={0} onChange={e => pvSet('agingLoss', Number(e.target.value))} />
                  <span className={s.sm_hint}>{isKo ? '기본값 0.5%/년' : 'Default 0.5%/yr'}</span>
                </div>
                <div className={s.sm_field}>
                  <label className={s.sm_label}>{isKo ? '시스템 타입' : 'System Type'}</label>
                  <div className={s.sm_radio_group}>
                    {(['grid','ess'] as const).map(t => (
                      <button key={t} onClick={() => pvSet('systemType', t)}
                        className={`${s.sm_radio_btn} ${pv.systemType === t ? s.sm_radio_active_pv : ''}`}>
                        {t === 'grid' ? (isKo ? '계통 연계형' : 'Grid-tied') : (isKo ? '독립형(ESS)' : 'Off-grid(ESS)')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className={s.sm_check_row}>
                  <input type="checkbox" checked={pv.tempLoss} onChange={e => pvSet('tempLoss', e.target.checked)} />
                  <span className={s.sm_check_label}>{isKo ? '온도 손실 반영 (-15%, 여름철 패널 과열)' : 'Temperature loss (-15%, summer panel heat)'}</span>
                </label>
                <label className={s.sm_check_row}>
                  <input type="checkbox" checked={pv.shadeLoss} onChange={e => pvSet('shadeLoss', e.target.checked)} />
                  <span className={s.sm_check_label}>{isKo ? '음영 손실 (-20%, 주변 건물·나무 음영)' : 'Shading loss (-20%, nearby obstructions)'}</span>
                </label>
              </div>
            </div>

            {/* Cost + Bill */}
            <div className={s.sm_card}>
              <p className={`${s.sm_card_title} ${s.sm_card_title_pv}`}>💰 {isKo ? '비용 및 누진세' : 'Cost & Electricity Bill'}</p>
              <div className={s.sm_grid2}>
                <div className={s.sm_field}>
                  <label className={s.sm_label}>{isKo ? '총 설치 비용(원)' : 'Total Install Cost (₩)'}</label>
                  <input type="number" className={`${s.sm_input} ${s.sm_input_pv}`} value={pv.installCost}
                    step={100000} onChange={e => pvSet('installCost', Number(e.target.value))} />
                  <span className={s.sm_hint}>{isKo ? '패널+인버터+시공 포함' : 'Panels + inverter + labor'}</span>
                </div>
                <div className={s.sm_field}>
                  <label className={s.sm_label}>{isKo ? '월 전기사용량(kWh)' : 'Monthly Usage (kWh)'}</label>
                  <input type="number" className={`${s.sm_input} ${s.sm_input_pv}`} value={pv.monthlyKwh}
                    onChange={e => pvSet('monthlyKwh', Number(e.target.value))} />
                  <span className={s.sm_hint}>{isKo ? '고지서 기준 — 누진세 절감액 정밀 계산용' : 'From your electricity bill — for progressive rate savings'}</span>
                </div>
              </div>
              <label className={s.sm_check_row} style={{ marginTop: '0.5rem' }}>
                <input type="checkbox" checked={pv.subsidy} onChange={e => pvSet('subsidy', e.target.checked)} />
                <span className={s.sm_check_label}>{isKo ? '정부 보조금 30% 차감 반영 (설치비 기준 추정)' : 'Apply 30% government subsidy (estimated)'}</span>
              </label>
            </div>
          </div>
        )}

        {/* ── THERMAL INPUTS ── */}
        {tab === 'thermal' && (
          <div id="panel-thermal">
            <div className={s.sm_card}>
              <p className={`${s.sm_card_title} ${s.sm_card_title_th}`}>🌏 {isKo ? '집열판 사양' : 'Collector Specs'}</p>
              <div className={s.sm_grid2}>
                <div className={s.sm_field}>
                  <label className={s.sm_label}>{isKo ? '지역 선택' : 'Region'}</label>
                  <select className={`${s.sm_select} ${s.sm_input_th}`} value={th.region}
                    onChange={e => thSet('region', e.target.value)}>
                    {Object.keys(REGIONS).map(r => <option key={r}>{r}</option>)}
                  </select>
                  <span className={s.sm_hint}>{isKo ? `일조시간: ${REGIONS[th.region]}h/일 자동 반영` : `Sun hours: ${REGIONS[th.region]}h/day`}</span>
                </div>
                <div className={s.sm_field}>
                  <label className={s.sm_label}>{isKo ? '집열판 면적(m²)' : 'Collector Area (m²)'}</label>
                  <input type="number" className={`${s.sm_input} ${s.sm_input_th}`} value={th.area}
                    step={0.5} min={1} onChange={e => thSet('area', Number(e.target.value))} />
                  <span className={s.sm_hint}>{isKo ? '설치할 집열판의 총 면적' : 'Total collector area'}</span>
                </div>
                <div className={s.sm_field}>
                  <label className={s.sm_label}>{isKo ? '집열 효율(%)' : 'Thermal Efficiency (%)'}</label>
                  <input type="number" className={`${s.sm_input} ${s.sm_input_th}`} value={th.efficiency}
                    step={1} min={40} max={95} onChange={e => thSet('efficiency', Number(e.target.value))} />
                  <span className={s.sm_hint}>{isKo ? '평판형 60~70% / 진공관 80%+' : 'Flat-plate 60–70% / Evacuated tube 80%+'}</span>
                </div>
                <div className={s.sm_field}>
                  <label className={s.sm_label}>{isKo ? '1일 급탕량(L)' : 'Daily Hot Water (L)'}</label>
                  <input type="number" className={`${s.sm_input} ${s.sm_input_th}`} value={th.dailyHotWater}
                    onChange={e => thSet('dailyHotWater', Number(e.target.value))} />
                  <span className={s.sm_hint}>{isKo ? '1인 기준 약 60~80L' : '~60–80L per person/day'}</span>
                </div>
                <div className={s.sm_field}>
                  <label className={s.sm_label}>{isKo ? '현재 연료 종류' : 'Current Fuel'}</label>
                  <select className={`${s.sm_select} ${s.sm_input_th}`} value={th.fuel}
                    onChange={e => thSet('fuel', e.target.value as FuelKey)}>
                    <option value="gas">{isKo ? '도시가스 (21.5원/MJ)' : 'City Gas (₩21.5/MJ)'}</option>
                    <option value="kerosene">{isKo ? '등유 (36.6원/MJ)' : 'Kerosene (₩36.6/MJ)'}</option>
                    <option value="electric">{isKo ? '전기심야 (52.8원/MJ)' : 'Off-peak Electric (₩52.8/MJ)'}</option>
                  </select>
                  <span className={s.sm_hint}>{isKo ? '연료별 단가로 절감액 자동 계산' : 'Auto-calculates savings by fuel rate'}</span>
                </div>
              </div>
            </div>
            <div className={s.sm_card}>
              <p className={`${s.sm_card_title} ${s.sm_card_title_th}`}>💰 {isKo ? '설치 비용' : 'Install Cost'}</p>
              <div className={s.sm_grid2}>
                <div className={s.sm_field}>
                  <label className={s.sm_label}>{isKo ? '총 설치 비용(원)' : 'Total Install Cost (₩)'}</label>
                  <input type="number" className={`${s.sm_input} ${s.sm_input_th}`} value={th.installCost}
                    step={100000} onChange={e => thSet('installCost', Number(e.target.value))} />
                  <span className={s.sm_hint}>{isKo ? '집열판+저장탱크+시공 포함' : 'Collector + tank + labor'}</span>
                </div>
              </div>
              <label className={s.sm_check_row} style={{ marginTop: '0.5rem' }}>
                <input type="checkbox" checked={th.subsidy} onChange={e => thSet('subsidy', e.target.checked)} />
                <span className={s.sm_check_label}>{isKo ? '정부 보조금 30% 차감 반영' : 'Apply 30% government subsidy'}</span>
              </label>
            </div>
          </div>
        )}

        {/* Calculate button */}
        <button
          className={`${s.sm_calc_btn} ${tab === 'pv' ? s.sm_calc_pv : s.sm_calc_th}`}
          onClick={handleCalc}
          aria-label={isKo ? '발전량 분석 실행' : 'Run Solar Analysis'}
        >
          {isKo ? '☀️ 분석 시작' : '☀️ Analyze'}
        </button>

        {/* ── RESULTS ── */}
        {results && (
          <div ref={resultRef} className={s.sm_result_area} id="solar-result-area">

            {/* Summary */}
            <div className={s.sm_card}>
              <p className={s.sm_card_title}>🎯 {isKo ? '핵심 요약' : 'Summary'}</p>
              <div className={s.sm_summary_grid}>
                <div className={s.sm_summary_card}>
                  <div className={s.sm_summary_emoji}>💰</div>
                  <div className={s.sm_summary_value}>{won(results.annualSaving / 12)}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}>/월</span></div>
                  <div className={s.sm_summary_label}>{isKo ? '월 평균 절감액' : 'Avg Monthly Saving'}</div>
                  {tab === 'pv' && results.beforeBill > 0 && (
                    <div className={s.sm_summary_sub}>{won(results.beforeBill)} → {won(results.afterBill)}</div>
                  )}
                </div>
                <div className={s.sm_summary_card}>
                  <div className={s.sm_summary_emoji}>📅</div>
                  <div className={s.sm_summary_value}>{results.breakEvenYear}<span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>년 {results.breakEvenMonth}개월</span></div>
                  <div className={s.sm_summary_label}>{isKo ? '손익분기점' : 'Payback Period'}</div>
                  <div className={s.sm_summary_sub}>{isKo ? `순투자비: ${won(results.netCost)}` : `Net investment: ${won(results.netCost)}`}</div>
                </div>
                <div className={s.sm_summary_card}>
                  <div className={s.sm_summary_emoji}>🌿</div>
                  <div className={s.sm_summary_value}>{Math.round(results.co2 / 6.6).toLocaleString()}<span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>그루</span></div>
                  <div className={s.sm_summary_label}>{isKo ? '연간 소나무 효과' : 'Annual Pine Tree Equiv.'}</div>
                  <div className={s.sm_summary_sub}>
                    {tab === 'pv'
                      ? `Tesla Model3 ${Math.round(results.annualGen / 75)}회 완충 가능`
                      : `CO₂ ${results.co2.toLocaleString()}kg 절감`}
                  </div>
                </div>
              </div>
            </div>

            {/* Technical table */}
            <div className={s.sm_card}>
              <p className={s.sm_card_title}>📊 {isKo ? '월별 상세 데이터' : 'Monthly Detail'}</p>
              <div className={s.sm_info_row}>
                {tab === 'pv' && <>
                  <span className={s.sm_info_chip}>{isKo ? `설치용량: ${results.kWp.toFixed(2)}kWp` : `Capacity: ${results.kWp.toFixed(2)}kWp`}</span>
                  <span className={s.sm_info_chip}>{isKo ? `시스템효율: ${results.sysEfficiency.toFixed(1)}%` : `System Eff.: ${results.sysEfficiency.toFixed(1)}%`}</span>
                  <span className={s.sm_info_chip}>{isKo ? `연간CO₂절감: ${results.co2.toLocaleString()}kg` : `Annual CO₂: ${results.co2.toLocaleString()}kg`}</span>
                </>}
                {tab === 'thermal' && <>
                  <span className={s.sm_info_chip}>{isKo ? `집열면적: ${results.kWp}m²` : `Collector: ${results.kWp}m²`}</span>
                  <span className={s.sm_info_chip}>{isKo ? `집열효율: ${results.sysEfficiency}%` : `Efficiency: ${results.sysEfficiency}%`}</span>
                  <span className={s.sm_info_chip}>{results.fuelLabel}</span>
                </>}
              </div>
              <div className={s.sm_table_wrap}>
                <table className={s.sm_table} aria-label={isKo ? '월별 발전 데이터' : 'Monthly generation data'}>
                  <thead>
                    <tr>
                      <th>{isKo ? '월' : 'Month'}</th>
                      <th>{tab === 'pv' ? (isKo ? '발전량(kWh)' : 'Gen (kWh)') : (isKo ? '생산에너지(MJ)' : 'Energy (MJ)')}</th>
                      <th>{isKo ? '절감액(원)' : 'Saving (₩)'}</th>
                      <th>{isKo ? '누적수익(원)' : 'Cum. Profit (₩)'}</th>
                      <th>{isKo ? '월별계수' : 'Coeff'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.monthly.map(r => (
                      <tr key={r.month}>
                        <td>{MONTHS[r.month - 1]}</td>
                        <td>{r.gen.toLocaleString()}</td>
                        <td>{r.saving.toLocaleString()}</td>
                        <td style={{ color: r.cum < 0 ? '#ef4444' : '#059669', fontWeight: 600 }}>{r.cum.toLocaleString()}</td>
                        <td>×{r.coeff.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className={s.sm_table_total}>
                      <td>{isKo ? '연간 합계' : 'Annual'}</td>
                      <td>{results.annualGen.toLocaleString()}</td>
                      <td>{results.annualSaving.toLocaleString()}</td>
                      <td>—</td>
                      <td>—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charts */}
            <div className={s.sm_charts_grid}>
              <div className={s.sm_chart_card}>
                <p className={s.sm_chart_title}>{isKo ? '📈 계절별 월간 발전량' : '📈 Monthly Generation'}</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={results.monthly.map(r => ({ name: `${r.month}월`, gen: r.gen }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [Number(v).toLocaleString(), tab === 'pv' ? 'kWh' : 'MJ']} />
                    <Bar dataKey="gen" fill={activeColor} radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className={s.sm_chart_card}>
                <p className={s.sm_chart_title}>{isKo ? '📉 20년 누적 수익 곡선' : '📉 20-Year ROI Curve'}</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={results.roiCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} label={{ value: isKo ? '년' : 'yr', position: 'insideRight', fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/10000).toFixed(0)}만`} />
                    <Tooltip formatter={(v) => [won(Number(v)), isKo ? '누적 수익' : 'Cum. Profit']} />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: isKo ? '손익분기' : 'Breakeven', fontSize: 9, fill: '#94a3b8' }} />
                    <Line type="monotone" dataKey="cum" stroke={activeColor} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Action buttons */}
            <div className={s.sm_action_row}>
              <button className={`${s.sm_action_btn} ${s.sm_btn_pdf}`} onClick={handlePDF} aria-label={isKo ? 'PDF로 저장' : 'Save as PDF'}>
                📄 {isKo ? 'PDF 리포트 저장' : 'Save PDF Report'}
              </button>
              <button className={`${s.sm_action_btn} ${s.sm_btn_inv}`} onClick={handleInvoice} aria-label={isKo ? '견적서로 내보내기' : 'Export to Invoice'}>
                🧾 {isKo ? '견적서로 내보내기' : 'Export to Invoice'}
              </button>
            </div>
          </div>
        )}

        {/* ── BOTTOM SECTIONS ── */}

        {/* 0-1. 추천 도구 */}
        <div className={s.sm_section}>
          <p className={s.sm_section_title}>{isKo ? '🔗 추천 도구' : '🔗 Related Tools'}</p>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
            {[
              { href: `/${locale}/utilities/finance/invoice-maker`, label: isKo ? '🧾 인보이스 메이커' : '🧾 Invoice Maker' },
              { href: `/${locale}/utilities/finance/freelance-rate-calculator`, label: isKo ? '⚡ 프리랜서 단가 계산기' : '⚡ Freelance Rate Calc' },
              { href: `/${locale}/utilities/finance/salary-calc`, label: isKo ? '💵 연봉 계산기' : '💵 Salary Calculator' },
            ].map(t => (
              <a key={t.href} href={t.href}
                style={{ padding:'0.45rem 0.9rem', borderRadius:'2rem', border:'1px solid #e2e8f0', background:'#fff', fontSize:'0.82rem', fontWeight:600, color:'#475569', textDecoration:'none', transition:'all 0.15s' }}
                onMouseOver={e => (e.currentTarget.style.borderColor = '#8b5cf6')}
                onMouseOut={e => (e.currentTarget.style.borderColor = '#e2e8f0')}>
                {t.label}
              </a>
            ))}
          </div>
        </div>

        {/* 0-2. 광고 */}
        <div className={s.sm_section}>
          <div className={s.sm_ad_placeholder}>Ad Placeholder (728×90)</div>
        </div>

        {/* 1. About */}
        <div className={s.sm_section}>
          <p className={s.sm_section_title}>{isKo ? 'Solar Master란?' : 'About Solar Master'}</p>
          <p style={{ fontSize:'0.88rem', color:'#475569', lineHeight:1.75 }}>
            {isKo
              ? 'Solar Master는 태양광(PV) 및 태양열(Thermal) 시스템의 발전량, 에너지 절감액, 투자 회수 기간(ROI)을 지역별 일조 데이터와 한전 누진세 구조를 반영하여 정밀하게 계산하는 전문 분석 도구입니다. 시공업체 견적 비교부터 일반 가정의 설치 여부 판단까지, 누구나 쉽게 활용할 수 있도록 설계되었습니다.'
              : 'Solar Master is a precision solar analysis tool that calculates PV/thermal generation, energy savings, and ROI using regional irradiance data and Korea\'s progressive electricity rates. From comparing installer quotes to deciding whether solar is right for your home, it is designed for anyone to use without expertise.'}
          </p>
        </div>

        {/* 2. Use Cases */}
        <div className={s.sm_section}>
          <p className={s.sm_section_title}>{isKo ? '주요 활용 사례' : 'Use Cases'}</p>
          <div className={s.sm_use_cases}>
            {USE_CASES.map((u, i) => (
              <div key={i} className={s.sm_use_card}>
                <div className={s.sm_use_emoji}>{u.emoji}</div>
                <div className={s.sm_use_title}>{u.title}</div>
                <div className={s.sm_use_desc}>{u.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. How To */}
        <div className={s.sm_section}>
          <p className={s.sm_section_title}>{isKo ? '사용 방법' : 'How to Use'}</p>
          <ol className={s.sm_steps}>
            {HOW_TO.map((step, i) => (
              <li key={i} className={s.sm_step}>
                <span className={s.sm_step_num}>{i + 1}</span>
                <span className={s.sm_step_text}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* 4. FAQ */}
        <div className={s.sm_section}>
          <p className={s.sm_section_title}>{isKo ? '자주 묻는 질문' : 'FAQ'}</p>
          <div className={s.sm_faq}>
            {FAQ.map((f, i) => (
              <div key={i} className={s.sm_faq_item}>
                <button className={s.sm_faq_q} onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}>
                  {f.q}
                  <span>{openFaq === i ? '▲' : '▼'}</span>
                </button>
                {openFaq === i && <div className={s.sm_faq_a}>{f.a}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* SEO Article */}
        <div className={s.sm_seo}>
          <h2>{isKo ? '☀️ 태양광 경사각의 물리학: 왜 30°가 한국 최적인가?' : '☀️ Solar PV Tilt Physics: Why 30° is Optimal for Korea'}</h2>
          <p>
            {isKo
              ? '태양광 패널의 발전량은 태양 빛이 패널 표면에 수직으로 닿을수록 최대화됩니다. 이를 설명하는 것이 바로 코사인 법칙(Lambert\'s Cosine Law)으로, 입사각이 θ일 때 유효 발전량은 cos(θ)에 비례합니다. 한국의 위도는 약 37°(서울 기준)이며, 사계절 태양 고도각 평균을 고려하면 패널 경사각 30°에서 연간 일조 수용량이 최대화됩니다. 수평(0°)으로 설치하면 85% 수준에 머물고, 수직(90°)은 약 70%까지 떨어집니다. 일반 아파트 발코니에 설치하는 소형 패널들이 낮은 효율을 내는 이유가 바로 경사각 문제에 있습니다.'
              : 'Solar panel output is maximized when sunlight strikes the surface perpendicularly, described by Lambert\'s Cosine Law: effective irradiance scales with cos(θ) of the incidence angle. Korea sits at approximately 37° latitude (Seoul), and integrating the sun\'s altitude across all seasons shows 30° tilt maximizes annual energy capture. Horizontal (0°) installation captures only 85%, while vertical (90°) drops to ~70%. This is why apartment balcony micro-panels underperform — they are typically installed at near-vertical angles.'}
          </p>

          <h2>{isKo ? '🌡️ 온도 계수의 비밀: 왜 봄이 여름보다 발전 효율이 높은가?' : '🌡️ Temperature Coefficient: Why Spring Outperforms Summer'}</h2>
          <p>
            {isKo
              ? '많은 사람들이 여름에 태양이 강하니 발전량도 가장 많을 것이라고 생각합니다. 그러나 현실은 다릅니다. 결정형 실리콘 태양광 셀의 온도 계수(Temperature Coefficient)는 약 -0.4%/°C입니다. 여름철 패널 표면 온도는 70°C를 초과할 수 있으며, 표준 시험 온도(STC: 25°C) 대비 45°C 상승 시 최대 출력(Pmax)이 약 18%까지 감소합니다. 본 계산기는 이 온도 손실을 계절 평균(-15%)으로 적용합니다. 반면 봄(4~5월)은 일조량이 충분하면서도 기온이 적당하여 온도 손실이 최소화되므로, 한국에서는 4~5월이 태양광 발전의 황금기가 됩니다.'
              : 'Many assume summer yields the most solar output because the sun is strongest. However, crystalline silicon cells carry a temperature coefficient of ~-0.4%/°C. In summer, panel surface temperatures can exceed 70°C; at 45°C above the standard test condition (STC: 25°C), peak power (Pmax) drops up to 18%. This calculator applies a -15% seasonal average temperature loss. Spring (April-May) in Korea hits the sweet spot: strong irradiance with moderate temperatures, minimizing thermal losses — making April and May the prime solar months in Korea.'}
          </p>

          <h2>{isKo ? '⚡ 한전 누진세 절감의 원리: 태양광이 전기요금을 어떻게 낮추나?' : '⚡ Progressive Rate Savings: How Solar Cuts Your Electricity Bill'}</h2>
          <p>
            {isKo
              ? '한국 주택용 전기요금은 3단계 누진제를 적용합니다. 2026년 기준으로 200kWh 이하는 120원/kWh, 201~400kWh 구간은 214.6원/kWh, 401kWh 이상은 307.3원/kWh입니다. 태양광의 절감 효과는 단순히 발전량×단가가 아니라 구간을 넘나드는 절감에서 극대화됩니다. 예를 들어 월 420kWh를 사용하는 가정이 100kWh를 태양광으로 충당하면 320kWh로 줄어들고, 세 번째 구간(307.3원)에서 두 번째 구간(214.6원)으로 이동하는 효과까지 발생해 절감폭이 크게 증가합니다. 누진세 구간 경계 근처에 있는 가정일수록 태양광의 실질 절감 효과는 더욱 커집니다.'
              : 'Korea\'s residential electricity uses a 3-tier progressive rate: ≤200kWh at ₩120/kWh, 201-400kWh at ₩214.6/kWh, and 401kWh+ at ₩307.3/kWh (2026 rates). Solar savings are not simply generation × flat rate — they are amplified by tier shifting. A household using 420kWh that offsets 100kWh via solar drops to 320kWh, moving from the third tier (₩307.3) back into the second (₩214.6) for the overlapping portion. Households near tier boundaries gain disproportionately larger savings from solar — this calculator models this precisely using actual tier arithmetic.'}
          </p>

          <h2>{isKo ? '🔥 태양열 집열판 종류 비교: 평판형 vs 진공관형' : '🔥 Thermal Collector Types: Flat-Plate vs Evacuated Tube'}</h2>
          <p>
            {isKo
              ? '태양열 온수 시스템의 핵심은 집열판의 열 손실률입니다. 평판형 집열판(Flat-Plate Collector)은 구조가 단순하고 가격이 저렴하지만 집열 효율이 60~70%입니다. 겨울철에는 외부 기온과의 온도 차이로 인한 열 손실이 커 효율이 더 떨어집니다. 반면 진공관형 집열판(Evacuated Tube Collector)은 유리관 사이의 진공층이 열 손실을 차단해 80~90% 이상의 효율을 유지합니다. 초기 비용이 25~40% 비싸지만 한국처럼 사계절이 뚜렷한 기후에서는 연간 ROI 측면에서 진공관형이 유리한 경우가 많습니다. 특히 겨울철 온수 수요가 많은 가정이라면 진공관형을 적극적으로 검토하세요.'
              : 'The key metric for solar thermal is collector heat loss rate. Flat-plate collectors are simple and affordable but achieve 60–70% efficiency; in winter, large temperature differentials with outside air increase heat losses significantly. Evacuated tube collectors use a vacuum layer between glass tubes to suppress heat loss, maintaining 80–90%+ efficiency. Although 25–40% more expensive upfront, they deliver stronger ROI in Korea\'s four-season climate — particularly for households with high winter hot water demand.'}
          </p>

          <h2>{isKo ? '📊 2026년 에너지 단가 기반 ROI 분석: 도시가스 vs 등유 vs 전기' : '📊 2026 Energy Price ROI: Gas vs Kerosene vs Electric'}</h2>
          <p>
            {isKo
              ? '2026년 기준 연료별 MJ당 단가는 도시가스 21.5원, 등유 36.6원, 심야전기 52.8원입니다. 같은 4m² 진공관형 태양열 시스템을 설치했을 때, 대체 연료에 따라 연간 절감액 차이가 2.5배까지 벌어집니다. 등유·심야전기를 사용하는 가정일수록 태양열 온수 시스템의 회수 기간이 단축됩니다. 도시가스 보급률이 낮은 농촌 지역에서 등유를 쓰는 가정은 태양열 투자 우선 대상으로 볼 수 있습니다.'
              : 'In 2026, fuel unit prices per MJ are: city gas ₩21.5, kerosene ₩36.6, off-peak electric ₩52.8. Installing the same 4m² evacuated-tube solar thermal system yields annual savings that vary by up to 2.5× depending on which fuel is displaced. Kerosene and electric-heated households see the shortest payback periods. Rural households without city gas access — typically using kerosene — are prime candidates for solar thermal investment.'}
          </p>

          <h2>{isKo ? '✅ 설치 전 체크리스트' : '✅ Pre-Installation Checklist'}</h2>
          <ul>
            {isKo ? <>
              <li><strong>남향 조건 확인:</strong> 패널이 정남향(±15° 이내)에 설치되는지 확인하세요. 동향·서향은 15~25% 발전량이 감소합니다.</li>
              <li><strong>음영 분석:</strong> 주변 건물, 굴뚝, 나무가 오전 9시~오후 3시 사이에 그림자를 드리우는지 확인하세요.</li>
              <li><strong>지붕 구조 점검:</strong> 태양광 패널은 m²당 약 10~15kg입니다. 지붕 하중 허용치 확인이 필수입니다.</li>
              <li><strong>보조금 조회:</strong> 한국에너지공단 그린홈 보조금(greenh.or.kr) 또는 지자체 신재생에너지 보조금을 미리 확인하세요.</li>
              <li><strong>2개 이상 업체 견적 비교:</strong> 본 계산기로 이론 발전량을 먼저 확인하고, 업체 제안과 비교하세요.</li>
            </> : <>
              <li><strong>South-facing alignment:</strong> Panels should face within ±15° of true south. East/west-facing roofs reduce output by 15–25%.</li>
              <li><strong>Shading analysis:</strong> Check for buildings, chimneys, or trees casting shadows between 9am–3pm.</li>
              <li><strong>Roof structural load:</strong> Solar panels weigh ~10–15kg/m². Verify your roof can support the load.</li>
              <li><strong>Subsidy research:</strong> Check KEMCO Green Home subsidies (greenh.or.kr) and local government incentives.</li>
              <li><strong>Get multiple quotes:</strong> Use this calculator to verify installer projections before signing contracts.</li>
            </>}
          </ul>

          <div className={s.sm_disclaimer}>
            ⚠️ {isKo
              ? '본 계산 결과는 표준 기상 데이터와 이론적 수식을 기반으로 한 추정치이며, 실제 발전량 및 절감액은 기상 조건, 음영, 설치 각도, 시공 품질에 따라 상이할 수 있습니다. 정확한 투자 결정을 위해 반드시 전문 시공사와 상담하시기 바랍니다.'
              : 'All results are theoretical estimates based on standard meteorological data and formulas. Actual generation and savings may vary due to weather conditions, shading, installation angle, and construction quality. Always consult a certified installer before making investment decisions.'}
          </div>
        </div>
      </div>
    </div>
  );
}
