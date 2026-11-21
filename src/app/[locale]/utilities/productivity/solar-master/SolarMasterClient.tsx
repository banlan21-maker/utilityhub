'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Sun, Copy, FileText, Printer, AlertTriangle } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { REGIONS, TILT_FACTOR, AZIMUTH_FACTOR, FIELD_FACTOR, VALIDATION, SPOT_LAST_YEAR, pvCalc, thermalCalc, bizCalc, recWeight, type PvSite } from '@/lib/solar';
import { ELECTRICITY, CITY_GAS, KEROSENE, CO2, SMP, SOLAR_MARKET } from '@/constants/energyPrices';
import s from './solar.module.css';
import { ui } from '@/app/components/ui';

type Tab = 'pv' | 'thermal' | 'biz';
type Fuel = 'gas' | 'kerosene' | 'electric';

const dec = (raw: string) => {
  const [int, ...d] = raw.replace(/[^0-9.]/g, '').split('.');
  return d.length ? `${int}.${d.join('').slice(0, 2)}` : int;
};
const digits = (raw: string) => raw.replace(/[^0-9]/g, '');
const num = (v: string) => Number(String(v).replace(/,/g, '')) || 0;
const comma = (v: string) => (v ? Number(v).toLocaleString('ko-KR') : '');

/** 전기 2단계 실효 단가(원/kWh): 전력량 + 기후환경 + 연료비조정, 부가세·기금 포함 */
const ELEC_MARGINAL = Math.round((ELECTRICITY.normal.energy[1][1] + ELECTRICITY.climatePerKWh + ELECTRICITY.fuelAdjustPerKWh) * (1 + ELECTRICITY.vat + ELECTRICITY.fund) * 10) / 10;

export default function SolarMasterClient({ seo }: { seo?: React.ReactNode }) {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const L = (ko: string, en: string) => (isKo ? ko : en);
  const won = (n: number) => (isKo ? `${Math.round(n).toLocaleString('ko-KR')}원` : `₩${Math.round(n).toLocaleString('en-US')}`);
  const f = (n: number, d = 0) => n.toLocaleString(isKo ? 'ko-KR' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const manwon = (n: number) => (isKo ? `${f(n / 10000)}만` : `${f(n / 1000)}k`);

  const [tab, setTab] = useState<Tab>('pv');
  const [msg, setMsg] = useState('');

  // 태양광
  const [region, setRegion] = useState('seoul');
  const [panelW, setPanelW] = useState('400');
  const [panelN, setPanelN] = useState('8');
  const [tilt, setTilt] = useState('30');
  const [azimuth, setAzimuth] = useState('south');
  const [shade, setShade] = useState(0);
  const [degrade, setDegrade] = useState('0.5');
  const [usage, setUsage] = useState('350');
  const [summerUsage, setSummerUsage] = useState('450');
  const [netMetering, setNetMetering] = useState(true);
  const [fieldCorrection, setFieldCorrection] = useState(true);
  const [pvCost, setPvCost] = useState('5500000');
  const [pvSubsidy, setPvSubsidy] = useState('');

  // 태양열
  const [thRegion, setThRegion] = useState('seoul');
  const [collector, setCollector] = useState<'flat' | 'tube'>('flat');
  const [effText, setEffText] = useState('45');
  const [area, setArea] = useState('4');
  const [liters, setLiters] = useState('200');
  const [hotC, setHotC] = useState('45');
  const [coldC, setColdC] = useState('15');
  const [fuel, setFuel] = useState<Fuel>('gas');
  const [gasPrice, setGasPrice] = useState(String(CITY_GAS.perMJ));
  const [kerosenePrice, setKerosenePrice] = useState(String(KEROSENE.perLiter));
  const [elecPrice, setElecPrice] = useState(String(ELEC_MARGINAL));
  const [boilerEff, setBoilerEff] = useState('87');
  const [thCost, setThCost] = useState('4000000');
  const [thSubsidy, setThSubsidy] = useState('');

  // 발전사업
  const [bzRegion, setBzRegion] = useState('avg');
  const [bzKW, setBzKW] = useState('99.9');
  const [bzSite, setBzSite] = useState<PvSite>('land');
  const [bzTilt, setBzTilt] = useState('30');
  const [bzAzimuth, setBzAzimuth] = useState('south');
  const [bzShade, setBzShade] = useState(0);
  const [bzDegrade, setBzDegrade] = useState('0.5');
  const [bzField, setBzField] = useState(true);
  const [sale, setSale] = useState<'contract' | 'spot'>('contract');
  const [contractPrice, setContractPrice] = useState(String(SOLAR_MARKET.contractAvg));
  const [premium, setPremium] = useState('');
  const [smp, setSmp] = useState(String(SMP.avg12));
  const [recPrice, setRecPrice] = useState(String(SOLAR_MARKET.recPerREC));
  const [startYear, setStartYear] = useState(String(Number(SMP.asOf.slice(0, 4)) + 1));
  const [afterPrice, setAfterPrice] = useState(String(SMP.avg12));
  const [capexPerKW, setCapexPerKW] = useState('1200000');
  const [omPerKW, setOmPerKW] = useState('20000');
  const [omEscal, setOmEscal] = useState('2');
  const [rent, setRent] = useState('');
  const [inverter, setInverter] = useState('');
  const [loanPct, setLoanPct] = useState('70');
  const [rate, setRate] = useState('5');
  const [loanYears, setLoanYears] = useState('15');

  const regionName = (id: string) => { const r = REGIONS.find(x => x.id === id)!; return isKo ? r.ko : r.en; };
  const hours = REGIONS.find(r => r.id === region)!.hours;
  const thHours = REGIONS.find(r => r.id === thRegion)!.hours;
  const kWp = (num(panelW) * num(panelN)) / 1000;

  const pv = tab === 'pv' ? pvCalc({
    kWp, hours, tilt, azimuth, shadePct: shade, degradePct: num(degrade),
    usage: num(usage), summerUsage: num(summerUsage), netMetering, fieldCorrection,
    netCost: Math.max(0, num(pvCost) - num(pvSubsidy)), years: 20,
  }) : null;

  // 기존 열원 1MJ(열)당 비용·CO2
  const fuelPerMJ = fuel === 'gas' ? num(gasPrice) * (1 + CITY_GAS.vat) : fuel === 'kerosene' ? num(kerosenePrice) / KEROSENE.mjPerLiter : num(elecPrice) / 3.6;
  const fuelCO2 = fuel === 'gas' ? CO2.gasPerMJ : fuel === 'kerosene' ? CO2.kerosenePerMJ : CO2.gridPerKWh / 3.6;
  const heaterEff = Math.max(0.3, Math.min(1, num(boilerEff) / 100));
  const th = tab === 'thermal' ? thermalCalc({
    areaM2: num(area), hours: thHours, collectorEff: num(effText) / 100, litersPerDay: num(liters),
    hotC: num(hotC), coldC: num(coldC), costPerUsefulMJ: fuelPerMJ / heaterEff, co2PerUsefulMJ: fuelCO2 / heaterEff,
    netCost: Math.max(0, num(thCost) - num(thSubsidy)), years: 20,
  }) : null;

  const kW = num(bzKW);
  const weight = recWeight(bzSite, kW);
  const capex = num(capexPerKW) * kW;
  const biz = tab === 'biz' ? bizCalc({
    kW, hours: REGIONS.find(r => r.id === bzRegion)!.hours, tilt: bzTilt, azimuth: bzAzimuth, shadePct: bzShade,
    degradePct: num(bzDegrade), fieldCorrection: bzField, sale,
    contractPrice: num(contractPrice), premium: num(premium), smp: num(smp), recPrice: num(recPrice), weight,
    startYear: num(startYear) || Number(SMP.asOf.slice(0, 4)) + 1, afterPrice: num(afterPrice),
    capex, om: num(omPerKW) * kW, omEscalPct: num(omEscal), rent: num(rent), inverter: num(inverter), inverterYear: 12,
    loanPct: num(loanPct), ratePct: num(rate), loanYears: num(loanYears), years: 20,
  }) : null;
  const pct = (x: number | null) => (x === null ? '—' : `${f(x * 100, 1)}%`);

  const flash = (t: string) => { setMsg(t); setTimeout(() => setMsg(''), 2500); };
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(`${text}\nhttps://www.theutilhub.com/${locale}/utilities/productivity/solar-master`); flash(L('✓ 복사했습니다', '✓ Copied')); }
    catch { flash(L('복사하지 못했습니다', 'Could not copy')); }
  };

  // 견적서 생성기로 넘기기 (견적서 생성기 공유 링크 형식: lz-string 압축 + AES, ?d=)
  const toInvoice = async () => {
    try {
      const CryptoJS = (await import('crypto-js')).default;
      const LZString = (await import('lz-string')).default;
      const isPv = tab === 'pv';
      const cost = num(isPv ? pvCost : thCost), sub = num(isPv ? pvSubsidy : thSubsidy);
      const items = [
        { id: '1', desc: isPv ? L(`태양광 발전설비 ${f(kWp, 2)}kWp 설치 (${panelW}W × ${panelN}장)`, `Solar PV ${f(kWp, 2)} kWp installation`) : L(`태양열 온수 설비 집열판 ${area}㎡ 설치`, `Solar thermal ${area} m² installation`), qty: 1, unitPrice: cost },
        ...(sub > 0 ? [{ id: '2', desc: L('보조금 차감', 'Subsidy'), qty: 1, unitPrice: -sub }] : []),
      ];
      const today = new Date().toISOString().slice(0, 10);
      const data = {
        invNo: '', issueDate: today, dueDate: '',
        issuer: { name: '', email: '', phone: '', address: '', bizNo: '', account: '', bank: '', logoBase64: '' },
        clientName: '', clientEmail: '', clientAddress: '', items, taxRate: 0,
        notes: L('설치비는 부가세 포함 금액으로 입력했습니다. 예상 발전량·절감액은 utilityhub 태양광 계산기 추정치입니다.', 'Installation cost entered including VAT.'),
        payLink: '', countryMode: isKo ? 'KR' : 'US',
      };
      const enc = CryptoJS.AES.encrypt(LZString.compressToEncodedURIComponent(JSON.stringify(data)), 'theutilhub-inv-2026').toString();
      window.location.href = `/${locale}/utilities/finance/invoice-maker?d=${encodeURIComponent(enc)}`;
    } catch { flash(L('견적서로 보내지 못했습니다', 'Could not open the invoice maker')); }
  };

  const field = (id: string, label: string, sub: string, value: string, set: (v: string) => void, unit: string, mode: 'dec' | 'int' | 'money' = 'dec') => (
    <div className={ui.field}>
      <label className={`${ui.label} ${s.field_label}`} htmlFor={id}>{label}{sub && <small>{sub}</small>}</label>
      <div className={ui.inputGroup}>
        <input id={id} className={ui.input} inputMode={mode === 'dec' ? 'decimal' : 'numeric'}
          value={mode === 'money' ? comma(value) : value}
          onChange={e => set(mode === 'dec' ? dec(e.target.value) : digits(e.target.value))} />
        <span className={ui.unit}>{unit}</span>
      </div>
    </div>
  );
  const chip = <T extends string | number>(cur: T, val: T, set: (v: T) => void, label: string, sub?: string) => (
    <button key={String(val)} type="button" aria-pressed={cur === val} className={`${ui.chip} ${s.chip} ${cur === val ? ui.chipActive : ''}`} onClick={() => set(val)}>
      {label}{sub && <small>{sub}</small>}
    </button>
  );
  const regionSelect = (id: string, val: string, set: (v: string) => void) => (
    <div className={ui.field}>
      <label className={`${ui.label} ${s.field_label}`} htmlFor={id}>{L('지역', 'Region')}<small>{L('일평균 발전시간', 'avg daily yield hours')} {REGIONS.find(r => r.id === val)!.hours}h</small></label>
      <select id={id} className={ui.input} value={val} onChange={e => set(e.target.value)}>
        {REGIONS.map(r => <option key={r.id} value={r.id}>{isKo ? r.ko : r.en} ({r.hours}h)</option>)}
      </select>
    </div>
  );

  // ── 차트 (SVG 막대)
  const barChart = (values: number[], labels: string[], title: string, cls: string, signed = false) => {
    const W = 400, H = 170, top = 22, bottom = 22, left = 6;
    const max = Math.max(...values.map(Math.abs), 1);
    const min = signed ? Math.min(...values, 0) : 0;
    const span = (signed ? Math.max(...values, 0) - min : max) || 1;
    const bw = (W - left * 2) / values.length;
    const y0 = top + ((signed ? Math.max(...values, 0) : max) / span) * (H - top - bottom);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
        <text x={left} y={13} className={s.ch_title}>{title}</text>
        <line x1={left} y1={y0} x2={W - left} y2={y0} className={s.ch_axis} />
        {values.map((v, i) => {
          const h = (Math.abs(v) / span) * (H - top - bottom);
          return <rect key={i} x={left + i * bw + bw * 0.15} y={v >= 0 ? y0 - h : y0} width={bw * 0.7} height={Math.max(h, 0.5)} rx={2}
            className={signed ? (v >= 0 ? s.ch_pos : s.ch_neg) : cls} />;
        })}
        {labels.map((l, i) => (i % Math.ceil(labels.length / 12) === 0 ? <text key={i} x={left + i * bw + bw / 2} y={H - 6} textAnchor="middle" className={s.ch_text}>{l}</text> : null))}
      </svg>
    );
  };

  const priceBox = (
    <div className={s.price_box}>
      <b>{L('단가 기준', 'Price basis')}</b> — {L('전기', 'Electricity')} {ELECTRICITY.asOf} ({L('한전 주택용 저압, 기본·전력량·기후환경·연료비조정·부가세·전력기금 포함', 'KEPCO residential incl. all charges')}) · {L('도시가스', 'City gas')} {CITY_GAS.asOf} {L(CITY_GAS.region, 'Seoul')} {CITY_GAS.perMJ}{L('원/MJ(부가세 별도)', ' KRW/MJ excl. VAT')} · {L('등유', 'Kerosene')} {KEROSENE.asOf} {L('전국 평균', 'national avg')} {f(KEROSENE.perLiter)}{L('원/L', ' KRW/L')}.
      {L(' 단가는 수시로 바뀌니 고지서 단가로 바꿔 넣으세요.', ' Prices change; enter your own from a recent bill.')}
    </div>
  );

  const titleStr = L('태양광·태양열 발전량·수익 계산기', 'Solar PV, Thermal & Power Plant Revenue Calculator');
  const descStr = L('지역별 발전시간과 한전 전기요금 전체(누진·부가세·기금)로 주택 태양광 절감액과 회수 기간을, 계약시장 단가 또는 SMP·REC로 발전사업 수익·IRR을, 급탕량 기준으로 태양열 온수 절감액을 계산합니다.', 'Estimate home solar bill savings with the full KEPCO tariff, power-plant revenue and IRR from contract or SMP + REC prices, and solar hot-water savings.');

  return (
    <div className={`${s.container} ${tab === 'thermal' ? s.thermal : tab === 'biz' ? s.biz : ''}`}>
      <NavigationActions />

      <ToolHeader icon={<Sun />} title={titleStr} subtitle={descStr} />

      <div className={`${ui.segmented} ${s.tabs}`} role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'pv'} className={`${ui.segment} ${tab === 'pv' ? `${ui.segmentActive} ${s.tab_pv}` : ''}`} onClick={() => setTab('pv')}>
          ⚡ {L('태양광 발전', 'Solar PV')}<small>{L('전기요금 절감', 'electricity savings')}</small>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'thermal'} className={`${ui.segment} ${tab === 'thermal' ? `${ui.segmentActive} ${s.tab_th}` : ''}`} onClick={() => setTab('thermal')}>
          🔥 {L('태양열 온수', 'Solar hot water')}<small>{L('가스·등유 절감', 'gas or oil savings')}</small>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'biz'} className={`${ui.segment} ${tab === 'biz' ? `${ui.segmentActive} ${s.tab_biz}` : ''}`} onClick={() => setTab('biz')}>
          🏭 {L('발전사업', 'Power plant')}<small>{L('전력 판매 수익', 'selling power')}</small>
        </button>
      </div>

      {tab === 'pv' ? (
        <>
          <section className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{L('1. 설치 조건', '1. System')}</h2>
            <div className={s.grid3}>
              {regionSelect('pv-region', region, setRegion)}
              {field('pv-w', L('패널 1장 출력', 'Panel rating'), L('제품 사양 W', 'from the datasheet'), panelW, setPanelW, 'W', 'int')}
              {field('pv-n', L('패널 수', 'Panels'), L(`설치 용량 ${f(kWp, 2)}kWp`, `${f(kWp, 2)} kWp`), panelN, setPanelN, L('장', 'pcs'), 'int')}
            </div>
            <div>
              <span className={`${ui.label} ${s.label}`}>{L('경사각', 'Tilt')}</span>
              <div className={ui.chips}>{Object.keys(TILT_FACTOR).map(k => chip(tilt, k, setTilt, `${k}°`, `×${TILT_FACTOR[k]}`))}</div>
            </div>
            <div>
              <span className={`${ui.label} ${s.label}`}>{L('방향', 'Orientation')}</span>
              <div className={ui.chips}>{Object.keys(AZIMUTH_FACTOR).map(k => chip(azimuth, k, setAzimuth, ({ south: L('남향', 'South'), southeast: L('남동', 'SE'), southwest: L('남서', 'SW'), east: L('동향', 'East'), west: L('서향', 'West') } as Record<string, string>)[k], `×${AZIMUTH_FACTOR[k]}`))}</div>
            </div>
            <div className={s.grid2}>
              <div>
                <span className={`${ui.label} ${s.label}`}>{L('그늘 손실', 'Shading')}</span>
                <div className={ui.chips}>{[0, 5, 10, 20].map(p => chip(shade, p, setShade, `${p}%`))}</div>
              </div>
              {field('pv-deg', L('연간 출력 감소(노화)', 'Degradation'), L('보통 0.5%/년', 'typically 0.5 %/yr'), degrade, setDegrade, L('%/년', '%/yr'))}
            </div>
            <label className={s.toggle}>
              <input type="checkbox" checked={fieldCorrection} onChange={e => setFieldCorrection(e.target.checked)} />
              <span>{L(`실측 보정 적용 (×${FIELD_FACTOR})`, `Apply field correction (×${FIELD_FACTOR})`)}<small>{L('실제 발전소 실측은 모의값보다 약 11% 적었습니다(먼지·부분 고장·노후 등). 끄면 이상적인 운영 기준입니다.', 'Measured plants produced about 11% less than the simulation; turn off for ideal operation.')}</small></span>
            </label>
            <p className={`${ui.hint} ${s.hint}`}>{L('지역 발전시간은 정남향 30° 기준 모의 결과로 온도·인버터 손실이 이미 들어 있습니다. 경사·방향 보정은 경험치입니다.', 'Regional hours already include temperature and inverter losses (south, 30°). Tilt and orientation factors are rules of thumb.')}</p>
          </section>

          <section className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{L('2. 전기 사용량과 비용', '2. Usage and cost')}</h2>
            <div className={s.grid2}>
              {field('pv-use', L('월 전기 사용량', 'Monthly use'), L('7·8월 제외', 'except Jul–Aug'), usage, setUsage, 'kWh', 'int')}
              {field('pv-use-s', L('여름(7·8월) 사용량', 'Jul–Aug use'), L('에어컨 사용 반영', 'with air conditioning'), summerUsage, setSummerUsage, 'kWh', 'int')}
              {field('pv-cost', L('설치비', 'Installed cost'), L('부가세 포함 총액', 'including VAT'), pvCost, setPvCost, L('원', 'KRW'), 'money')}
              {field('pv-sub', L('보조금', 'Subsidy'), L('확정된 금액만 (없으면 비움)', 'confirmed amount only'), pvSubsidy, setPvSubsidy, L('원', 'KRW'), 'money')}
            </div>
            <label className={s.toggle}>
              <input type="checkbox" checked={netMetering} onChange={e => setNetMetering(e.target.checked)} />
              <span>{L('남는 전력 다음 달로 이월 (상계거래)', 'Carry surplus to next month (net metering)')}<small>{L('주택 태양광은 한전과 상계거래 계약을 하면 남은 발전량을 다음 달 사용량에서 뺍니다.', 'Surplus generation offsets later months.')}</small></span>
            </label>
            <p className={`${ui.hint} ${s.hint}`}>{L('보조금은 한국에너지공단 주택지원사업·지자체 사업마다 금액이 다릅니다. 모집 공고에서 확정 금액을 확인해 넣으세요.', 'Subsidies vary by programme and municipality; enter the confirmed amount.')}</p>
            {priceBox}
          </section>

          <section className={`${ui.card} ${s.card}`} aria-live="polite">
            <h2 className={ui.cardTitle}>{L('3. 결과', '3. Result')}</h2>
            {!pv ? <p className={`${ui.hint} ${s.hint}`}>{L('패널 출력과 수를 넣으세요.', 'Enter panel rating and count.')}</p> : (
              <>
                <div className={s.hero_grid}>
                  <div className={s.hero}>
                    <div className={s.hero_label}>{L('연간 전기요금 절감', 'Annual bill savings')}</div>
                    <div className={s.hero_num}>{won(pv.annualSaving)}</div>
                    <div className={s.hero_sub}>{L(`월 평균 ${won(pv.annualSaving / 12)}`, `${won(pv.annualSaving / 12)} per month`)}</div>
                  </div>
                  <div className={s.hero}>
                    <div className={s.hero_label}>{L('투자 회수 기간', 'Payback')}</div>
                    <div className={s.hero_num}>{pv.paybackYears === null ? L('20년 넘음', '> 20 yr') : <>{f(pv.paybackYears, 1)}<span className={s.hero_unit}>{L('년', 'yr')}</span></>}</div>
                    <div className={s.hero_sub}>{L(`순투자비 ${won(Math.max(0, num(pvCost) - num(pvSubsidy)))} · 20년 누적 ${won(pv.yearly[19].cumulative)}`, `net cost ${won(Math.max(0, num(pvCost) - num(pvSubsidy)))}`)}</div>
                  </div>
                </div>
                <div className={s.stats}>
                  <div className={s.stat}><div className={s.stat_num}>{f(pv.annualGen)} kWh</div><div className={s.stat_label}>{L('연간 발전량', 'Annual output')}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{f(pv.specificYield)}</div><div className={s.stat_label}>kWh/kWp·{L('년', 'yr')}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{f(pv.annualGen / 12)} kWh</div><div className={s.stat_label}>{L('월 평균 발전', 'per month')}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{f(pv.co2Kg)} kg</div><div className={s.stat_label}>{L(`CO₂ 감축 · 소나무 ${f(pv.co2Kg / CO2.pineTreePerYear)}그루`, `CO₂ saved`)}</div></div>
                </div>
                <div className={s.chart}>{barChart(pv.months.map(m => m.gen), pv.months.map(m => `${m.month}${L('월', '')}`), L('월별 발전량 (kWh)', 'Monthly output (kWh)'), s.ch_bar)}</div>
                <div className={s.table_wrap}>
                  <table className={s.table}>
                    <thead><tr><th>{L('월', 'Month')}</th><th>{L('발전', 'Output')}</th><th>{L('사용', 'Use')}</th><th>{L('한전에서 산 전력', 'Bought')}</th><th>{L('요금 전', 'Bill before')}</th><th>{L('요금 후', 'Bill after')}</th><th>{L('절감', 'Saving')}</th></tr></thead>
                    <tbody>{pv.months.map(m => (
                      <tr key={m.month}><td>{m.month}{L('월', '')}</td><td>{f(m.gen)}</td><td>{f(m.usage)}</td><td>{f(m.billed)}</td><td>{f(m.before)}</td><td>{f(m.after)}</td><td className={s.pos}>{f(m.saving)}</td></tr>
                    ))}</tbody>
                    <tfoot><tr><td>{L('합계', 'Total')}</td><td>{f(pv.annualGen)}</td><td>{f(pv.months.reduce((a, m) => a + m.usage, 0))}</td><td>{f(pv.months.reduce((a, m) => a + m.billed, 0))}</td><td>{f(pv.months.reduce((a, m) => a + m.before, 0))}</td><td>{f(pv.months.reduce((a, m) => a + m.after, 0))}</td><td className={s.pos}>{f(pv.annualSaving)}</td></tr></tfoot>
                  </table>
                </div>
                <div className={s.chart}>{barChart(pv.yearly.map(y => y.cumulative), pv.yearly.map(y => `${y.year}`), L('연도별 누적 수익 (설치비 차감, 노화 반영)', 'Cumulative return by year'), s.ch_bar, true)}</div>
                <p className={`${ui.hint} ${s.hint}`}>{L('전기요금 단가는 지금 수준으로 유지된다고 가정했습니다. 인버터 교체(보통 10~15년)나 요금 인상은 반영하지 않습니다.', 'Assumes today’s tariff; inverter replacement and tariff changes are not included.')}</p>
                <div className={`${s.actions} ${s.no_print}`}>
                  <button type="button" className={`${ui.button} ${ui.primary}`} onClick={() => copy(L(
                    `[태양광 수익 계산] ${regionName(region)} ${f(kWp, 2)}kWp (${panelW}W × ${panelN}장, ${tilt}°)\n연 발전 ${f(pv.annualGen)}kWh (${f(pv.specificYield)} kWh/kWp)\n연 절감 ${won(pv.annualSaving)} · 회수 ${pv.paybackYears === null ? '20년 초과' : `${f(pv.paybackYears, 1)}년`}`,
                    `[Solar PV] ${f(kWp, 2)} kWp, ${f(pv.annualGen)} kWh/yr, saves ${won(pv.annualSaving)}/yr`,
                  ))}><Copy size={16} />{L('결과 복사', 'Copy')}</button>
                  <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={toInvoice}><FileText size={16} />{L('견적서로 보내기', 'Send to invoice')}</button>
                  <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={() => window.print()}><Printer size={16} />{L('인쇄·PDF', 'Print / PDF')}</button>
                  {msg && <span className={s.msg}>{msg}</span>}
                </div>
              </>
            )}
          </section>
        </>
      ) : tab === 'thermal' ? (
        <>
          <section className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{L('1. 집열판과 온수 사용', '1. Collector and hot water')}</h2>
            <div className={s.grid3}>
              {regionSelect('th-region', thRegion, setThRegion)}
              {field('th-area', L('집열판 면적', 'Collector area'), L('총 면적', 'total'), area, setArea, '㎡')}
              {field('th-eff', L('연평균 집열 효율', 'Annual efficiency'), L('시스템 전체 기준', 'whole system'), effText, setEffText, '%')}
            </div>
            <div className={ui.chips}>
              {chip(collector, 'flat', v => { setCollector(v); setEffText('45'); }, L('평판형', 'Flat plate'), L('효율 약 45%', '≈45%'))}
              {chip(collector, 'tube', v => { setCollector(v); setEffText('55'); }, L('진공관형', 'Evacuated tube'), L('효율 약 55%', '≈55%'))}
            </div>
            <div className={s.grid3}>
              {field('th-l', L('하루 온수 사용량', 'Hot water per day'), L('1인 약 50~70L', '50–70 L per person'), liters, setLiters, 'L', 'int')}
              {field('th-hot', L('온수 온도', 'Hot water temp'), '', hotC, setHotC, '℃')}
              {field('th-cold', L('수돗물 온도', 'Cold water temp'), L('연평균', 'annual avg'), coldC, setColdC, '℃')}
            </div>
            <p className={`${ui.hint} ${s.hint}`}>{L('집열량이 하루 필요한 열보다 많으면 남는 열은 버려지므로 절감액에 넣지 않습니다. 겨울에는 수돗물이 더 차가워 실제 태양열 비율이 이 계산보다 낮을 수 있습니다.', 'Heat beyond daily demand is not counted. In winter colder mains water lowers the real solar share.')}</p>
          </section>

          <section className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{L('2. 지금 쓰는 열원과 비용', '2. Current heater and cost')}</h2>
            <div className={ui.chips}>
              {chip(fuel, 'gas', v => { setFuel(v); setBoilerEff('87'); }, L('도시가스 보일러', 'Gas boiler'))}
              {chip(fuel, 'kerosene', v => { setFuel(v); setBoilerEff('85'); }, L('기름(등유) 보일러', 'Oil boiler'))}
              {chip(fuel, 'electric', v => { setFuel(v); setBoilerEff('98'); }, L('전기 온수기', 'Electric heater'))}
            </div>
            <div className={s.grid2}>
              {fuel === 'gas' && field('th-gas', L('도시가스 단가', 'Gas price'), L(`${CITY_GAS.region} ${CITY_GAS.asOf}, 부가세 별도`, `Seoul ${CITY_GAS.asOf}, excl. VAT`), gasPrice, setGasPrice, L('원/MJ', 'KRW/MJ'))}
              {fuel === 'kerosene' && field('th-ker', L('등유 단가', 'Kerosene price'), L(`전국 평균 ${KEROSENE.asOf}`, 'national average'), kerosenePrice, setKerosenePrice, L('원/L', 'KRW/L'), 'int')}
              {fuel === 'electric' && field('th-el', L('전기 단가', 'Electricity price'), L('누진 2단계, 부가세·기금 포함', 'tier 2 incl. taxes'), elecPrice, setElecPrice, L('원/kWh', 'KRW/kWh'))}
              {field('th-beff', L('보일러·온수기 효율', 'Heater efficiency'), L('콘덴싱 가스 약 87~92%', 'condensing gas ≈ 87–92%'), boilerEff, setBoilerEff, '%')}
              {field('th-cost', L('설치비', 'Installed cost'), L('부가세 포함 총액', 'including VAT'), thCost, setThCost, L('원', 'KRW'), 'money')}
              {field('th-sub', L('보조금', 'Subsidy'), L('확정된 금액만', 'confirmed amount only'), thSubsidy, setThSubsidy, L('원', 'KRW'), 'money')}
            </div>
            {priceBox}
          </section>

          <section className={`${ui.card} ${s.card}`} aria-live="polite">
            <h2 className={ui.cardTitle}>{L('3. 결과', '3. Result')}</h2>
            {!th ? <p className={`${ui.hint} ${s.hint}`}>{L('면적·온수량·온도를 확인하세요 (온수 온도가 수돗물보다 높아야 합니다).', 'Check area, volume and temperatures.')}</p> : (
              <>
                <div className={s.hero_grid}>
                  <div className={s.hero}>
                    <div className={s.hero_label}>{L('연간 연료비 절감', 'Annual fuel savings')}</div>
                    <div className={s.hero_num}>{won(th.annualSaving)}</div>
                    <div className={s.hero_sub}>{L(`월 평균 ${won(th.annualSaving / 12)}`, `${won(th.annualSaving / 12)} per month`)}</div>
                  </div>
                  <div className={s.hero}>
                    <div className={s.hero_label}>{L('투자 회수 기간', 'Payback')}</div>
                    <div className={s.hero_num}>{th.paybackYears === null ? '—' : <>{f(th.paybackYears, 1)}<span className={s.hero_unit}>{L('년', 'yr')}</span></>}</div>
                    <div className={s.hero_sub}>{L(`순투자비 ${won(Math.max(0, num(thCost) - num(thSubsidy)))}`, `net cost ${won(Math.max(0, num(thCost) - num(thSubsidy)))}`)}</div>
                  </div>
                </div>
                <div className={s.stats}>
                  <div className={s.stat}><div className={s.stat_num}>{f(th.dailyDemand, 1)} MJ</div><div className={s.stat_label}>{L('하루 필요 열량', 'Daily heat demand')}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{f(th.solarFraction * 100)}%</div><div className={s.stat_label}>{L('태양열로 충당', 'Solar share')}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{f(th.wastedPct)}%</div><div className={s.stat_label}>{L('남아서 버리는 열', 'Surplus heat')}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{f(th.co2Kg)} kg</div><div className={s.stat_label}>{L('CO₂ 감축/년', 'CO₂ saved/yr')}</div></div>
                </div>
                {th.wastedPct > 25 && <p className={`${ui.hint} ${s.hint}`}>⚠️ {L(`집열판이 사용량에 비해 커서 모은 열의 ${f(th.wastedPct)}%가 남습니다. 면적을 줄이거나 온수 사용량을 다시 확인해 보세요.`, `About ${f(th.wastedPct)}% of collected heat is surplus; the collector may be oversized.`)}</p>}
                <div className={s.chart}>{barChart(th.months.map(m => m.used), th.months.map(m => `${m.month}${L('월', '')}`), L('월별 태양열로 데운 열량 (MJ)', 'Monthly useful solar heat (MJ)'), s.ch_bar2)}</div>
                <div className={s.table_wrap}>
                  <table className={s.table}>
                    <thead><tr><th>{L('월', 'Month')}</th><th>{L('모은 열 MJ', 'Collected')}</th><th>{L('필요 열 MJ', 'Demand')}</th><th>{L('쓴 열 MJ', 'Used')}</th><th>{L('절감', 'Saving')}</th></tr></thead>
                    <tbody>{th.months.map(m => (
                      <tr key={m.month}><td>{m.month}{L('월', '')}</td><td>{f(m.collected)}</td><td>{f(m.demand)}</td><td>{f(m.used)}</td><td className={s.pos}>{f(m.saving)}</td></tr>
                    ))}</tbody>
                    <tfoot><tr><td>{L('합계', 'Total')}</td><td>{f(th.collected)}</td><td>{f(th.demand)}</td><td>{f(th.used)}</td><td className={s.pos}>{f(th.annualSaving)}</td></tr></tfoot>
                  </table>
                </div>
                <div className={`${s.actions} ${s.no_print}`}>
                  <button type="button" className={`${ui.button} ${ui.primary}`} onClick={() => copy(L(
                    `[태양열 온수 계산] ${regionName(thRegion)} 집열판 ${area}㎡, 하루 ${liters}L (${coldC}→${hotC}℃)\n태양열 충당 ${f(th.solarFraction * 100)}% · 연 절감 ${won(th.annualSaving)} · 회수 ${th.paybackYears === null ? '-' : `${f(th.paybackYears, 1)}년`}`,
                    `[Solar thermal] ${area} m², ${liters} L/day, saves ${won(th.annualSaving)}/yr`,
                  ))}><Copy size={16} />{L('결과 복사', 'Copy')}</button>
                  <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={toInvoice}><FileText size={16} />{L('견적서로 보내기', 'Send to invoice')}</button>
                  <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={() => window.print()}><Printer size={16} />{L('인쇄·PDF', 'Print / PDF')}</button>
                  {msg && <span className={s.msg}>{msg}</span>}
                </div>
              </>
            )}
          </section>
        </>
      ) : (
        <>
          <section className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{L('1. 발전소', '1. Plant')}</h2>
            <div className={s.grid3}>
              {regionSelect('bz-region', bzRegion, setBzRegion)}
              {field('bz-kw', L('설비 용량', 'Capacity'), L('인버터 기준 kW', 'AC kW'), bzKW, setBzKW, 'kW')}
              {field('bz-deg', L('연간 출력 감소(노화)', 'Degradation'), L('보통 0.5%/년', 'typically 0.5 %/yr'), bzDegrade, setBzDegrade, L('%/년', '%/yr'))}
            </div>
            <div>
              <span className={`${ui.label} ${s.label}`}>{L('설치 장소', 'Site type')}<small className={s.label_sub}>{L(`REC 가중치 ${weight || '—'} (현물 판매에만 적용)`, `REC weight ${weight || '—'} (spot sales only)`)}</small></span>
              <div className={ui.chips}>
                {chip(bzSite, 'land', setBzSite, L('일반부지', 'Land'), L('100kW 미만 1.2 · 3MW까지 1.0', '1.2 <100 kW, 1.0 to 3 MW'))}
                {chip(bzSite, 'building', setBzSite, L('건축물 지붕', 'Rooftop'), L('3MW까지 1.5', '1.5 to 3 MW'))}
                {chip(bzSite, 'floating', setBzSite, L('수상(저수지 등)', 'Floating'), L('1.6 · 1.4 · 1.2', '1.6 / 1.4 / 1.2'))}
                {chip(bzSite, 'forest', setBzSite, L('임야', 'Forest land'), '0.5')}
              </div>
            </div>
            <div>
              <span className={`${ui.label} ${s.label}`}>{L('경사각', 'Tilt')}</span>
              <div className={ui.chips}>{Object.keys(TILT_FACTOR).map(k => chip(bzTilt, k, setBzTilt, `${k}°`, `×${TILT_FACTOR[k]}`))}</div>
            </div>
            <div className={s.grid2}>
              <div>
                <span className={`${ui.label} ${s.label}`}>{L('방향', 'Orientation')}</span>
                <div className={ui.chips}>{Object.keys(AZIMUTH_FACTOR).map(k => chip(bzAzimuth, k, setBzAzimuth, ({ south: L('남향', 'S'), southeast: L('남동', 'SE'), southwest: L('남서', 'SW'), east: L('동향', 'E'), west: L('서향', 'W') } as Record<string, string>)[k]))}</div>
              </div>
              <div>
                <span className={`${ui.label} ${s.label}`}>{L('그늘 손실', 'Shading')}</span>
                <div className={ui.chips}>{[0, 3, 5, 10].map(p => chip(bzShade, p, setBzShade, `${p}%`))}</div>
              </div>
            </div>
            <label className={s.toggle}>
              <input type="checkbox" checked={bzField} onChange={e => setBzField(e.target.checked)} />
              <span>{L(`실측 보정 적용 (×${FIELD_FACTOR})`, `Apply field correction (×${FIELD_FACTOR})`)}<small>{L('한국동서발전 당진·울산 사업용 발전소 4년 실측에 맞춘 값입니다. 금융·투자 검토에는 켜 두는 것을 권합니다.', 'Matched to four years of measured output from utility plants; keep on for financing.')}</small></span>
            </label>
            <p className={`${ui.hint} ${s.hint}`}>{L('REC 가중치는 용량 구간별로 나눠 매긴 뒤 평균합니다(운영지침 별표 2). 100kW 미만 구간은 99.999kW까지라서 정확히 100kW면 1.199, 99.9kW면 1.2입니다. 500m 안에 같은 사업자의 발전소가 있으면 용량을 합산해 매깁니다.', 'REC weights are applied band by band and averaged (exactly 100 kW gives 1.199; 99.9 kW gives 1.2). Plants of the same owner within 500 m are combined.')}</p>
          </section>

          <section className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{L('2. 판매 방식과 단가', '2. Sales and prices')}</h2>
            <div className={`${ui.notice} ${ui.amber} ${s.warn}`}>
              <AlertTriangle size={18} aria-hidden />
              <p>{L(
                '재생에너지법 개정(2026.8.20 국회 통과)으로 2027년부터 신규 발전소는 REC를 받지 않고 정부 계약시장(경쟁입찰, 20년 고정가격)에서 팝니다. REC 신규 발급은 2026.12.31까지이고, 기존 발전소의 REC 현물시장은 2029년 말까지 운영될 예정입니다. 계약시장 상한가·우대가격 등 세부 기준은 하위법령에서 정해집니다.',
                'Under the 2026 amendment of Korea’s Renewable Energy Act, new plants from 2027 sell through a government contract market (competitive bids, 20-year fixed price) instead of earning RECs. New REC issuance ends on 31 Dec 2026 and the spot market for existing plants is expected to run until the end of 2029.',
              )}</p>
            </div>
            <div className={ui.chips}>
              {chip(sale, 'contract', setSale, L('계약시장 · 20년 고정가격', 'Contract market · 20-yr fixed'), L('2027년 이후 신규 발전소', 'new plants from 2027'))}
              {chip(sale, 'spot', setSale, L('현물 판매 · SMP + REC', 'Spot · SMP + REC'), L('2026년까지 REC 받은 기존 발전소', 'existing REC plants'))}
            </div>
            {sale === 'contract' ? (
              <div className={s.grid2}>
                {field('bz-cp', L('계약 단가', 'Contract price'), L(`2026년 1차 고정가격 평균 낙찰가 ${SOLAR_MARKET.contractAvg}원`, `2026 round-1 average ${SOLAR_MARKET.contractAvg}`), contractPrice, setContractPrice, L('원/kWh', 'KRW/kWh'))}
                {field('bz-pr', L('우대가격', 'Preference premium'), L('수상·지붕·주민참여 등 (확정 시 입력)', 'floating, rooftop, community'), premium, setPremium, L('원/kWh', 'KRW/kWh'))}
              </div>
            ) : (
              <>
                <div className={s.grid3}>
                  {field('bz-smp', 'SMP', L(`최근 12개월 평균 · ${SMP.asOf} ${SMP.latest}원`, `12-month avg · ${SMP.asOf}: ${SMP.latest}`), smp, setSmp, L('원/kWh', 'KRW/kWh'))}
                  {field('bz-rec', L('REC 가격', 'REC price'), L(`현물 육지 평균 ${SOLAR_MARKET.asOf}`, `spot avg ${SOLAR_MARKET.asOf}`), recPrice, setRecPrice, L('원/REC', 'KRW/REC'), 'money')}
                  {field('bz-start', L('1년차 연도', 'First year'), L(`${SPOT_LAST_YEAR}년까지 현물 판매`, `spot until ${SPOT_LAST_YEAR}`), startYear, setStartYear, L('년', ''), 'int')}
                </div>
                <div className={s.grid2}>
                  {field('bz-after', L(`${SPOT_LAST_YEAR + 1}년 이후 단가`, `Price from ${SPOT_LAST_YEAR + 1}`), L('전환시장 가격 미정 → 기본값은 SMP만', 'conversion price TBD; default SMP only'), afterPrice, setAfterPrice, L('원/kWh', 'KRW/kWh'))}
                  <div className={s.price_calc}>
                    {L('현물 단가', 'Spot price')} = SMP {f(num(smp), 1)} + REC {f(num(recPrice) / 1000, 2)} × {L('가중치', 'weight')} {weight} = <b>{f(num(smp) + (num(recPrice) / 1000) * weight, 1)}{L('원/kWh', ' KRW/kWh')}</b>
                  </div>
                </div>
              </>
            )}
            <div className={s.price_box}>
              <b>{L('단가 기준', 'Price basis')}</b> — SMP {SMP.asOf} {L('전력거래소 육지 월평균(매월 자동 갱신)', 'KPX inland monthly average')} · REC {SOLAR_MARKET.asOf} {f(SOLAR_MARKET.recPerREC)}{L('원 (', ' (')}{L(SOLAR_MARKET.recSource, 'spot market inland average')}) · {L(`고정가격 ${SOLAR_MARKET.contractSource}, 상한 ${SOLAR_MARKET.contractCeiling}원/kWh`, `fixed price: 2026 round-1 tender, ceiling ${SOLAR_MARKET.contractCeiling} KRW/kWh`)}.
            </div>
          </section>

          <section className={`${ui.card} ${s.card}`}>
            <h2 className={ui.cardTitle}>{L('3. 사업비와 대출', '3. Costs and loan')}</h2>
            <div className={s.grid3}>
              {field('bz-capex', L('설치비 (kW당)', 'Capex per kW'), L(`총 ${manwon(capex)}원 · 땅값 제외`, `total ${won(capex)}, excl. land`), capexPerKW, setCapexPerKW, L('원/kW', 'KRW/kW'), 'money')}
              {field('bz-om', L('운영비 (kW당·년)', 'O&M per kW·yr'), L(`연 ${manwon(num(omPerKW) * kW)}원 · 안전관리·보험·모니터링`, `${won(num(omPerKW) * kW)}/yr`), omPerKW, setOmPerKW, L('원', 'KRW'), 'money')}
              {field('bz-omx', L('운영비 상승률', 'O&M escalation'), '', omEscal, setOmEscal, L('%/년', '%/yr'))}
              {field('bz-rent', L('부지 임대료', 'Land lease'), L('내 땅이면 비움', 'blank if owned'), rent, setRent, L('원/년', 'KRW/yr'), 'money')}
              {field('bz-inv', L('인버터 교체비', 'Inverter replacement'), L('12년차에 한 번 (견적 금액)', 'once in year 12'), inverter, setInverter, L('원', 'KRW'), 'money')}
              {field('bz-loan', L('대출 비율', 'Loan share'), L(`대출 ${manwon(capex * Math.min(100, num(loanPct)) / 100)}원`, `${won(capex * Math.min(100, num(loanPct)) / 100)}`), loanPct, setLoanPct, '%')}
              {field('bz-rate', L('대출 금리', 'Interest rate'), L('연 이율', 'annual'), rate, setRate, '%')}
              {field('bz-term', L('상환 기간', 'Loan term'), L('원리금 균등 상환', 'level payments'), loanYears, setLoanYears, L('년', 'yr'), 'int')}
            </div>
            <p className={`${ui.hint} ${s.hint}`}>{L('설치비 기본값 kW당 120만 원은 100kW급 일반부지 사업비 1.1억~1.4억 원(토지 보유, 2026년 업체 자료)의 중간값입니다. 계통연계비·인허가비를 포함하고 땅값은 빼서 넣으세요. 운영비 기본값(100kW 연 200만 원)은 예시이니 안전관리 대행·보험 견적으로 바꿔 넣으세요. 법인세·종합소득세는 빼고 계산합니다.', 'Default capex ₩1.2M/kW is the midpoint of 2026 quotes for 100 kW on owned land; replace defaults with your quotes. Income tax is not included.')}</p>
          </section>

          <section className={`${ui.card} ${s.card}`} aria-live="polite">
            <h2 className={ui.cardTitle}>{L('4. 결과 (20년)', '4. Result (20 years)')}</h2>
            {!biz ? <p className={`${ui.hint} ${s.hint}`}>{L('설비 용량을 넣으세요.', 'Enter the capacity.')}</p> : (
              <>
                <div className={s.hero_grid}>
                  <div className={s.hero}>
                    <div className={s.hero_label}>{L('1년차 전력 판매 수입', 'Year-1 revenue')}</div>
                    <div className={s.hero_num}>{won(biz.rows[0].revenue)}</div>
                    <div className={s.hero_sub}>{L(`월 평균 ${won(biz.rows[0].revenue / 12)} · 운영비·대출 상환 후 ${won(biz.rows[0].cash)}`, `${won(biz.rows[0].revenue / 12)}/month · after costs and debt ${won(biz.rows[0].cash)}`)}</div>
                  </div>
                  <div className={s.hero}>
                    <div className={s.hero_label}>{L('자기자본 회수 기간', 'Equity payback')}</div>
                    <div className={s.hero_num}>{biz.paybackYears === null ? L('20년 넘음', '> 20 yr') : <>{f(biz.paybackYears, 1)}<span className={s.hero_unit}>{L('년', 'yr')}</span></>}</div>
                    <div className={s.hero_sub}>{L(`자기자본 ${won(biz.equity)} · 20년 누적 ${won(biz.net)}`, `equity ${won(biz.equity)} · 20-yr net ${won(biz.net)}`)}</div>
                  </div>
                </div>
                <div className={s.stats}>
                  <div className={s.stat}><div className={s.stat_num}>{f(biz.gen1)} kWh</div><div className={s.stat_label}>{L(`1년차 발전량 · ${f(biz.specificYield)} kWh/kW`, `year-1 output · ${f(biz.specificYield)} kWh/kW`)}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{pct(biz.projectIrr)}</div><div className={s.stat_label}>{L('사업 IRR (대출 전)', 'Project IRR')}</div></div>
                  <div className={s.stat}><div className={s.stat_num}>{pct(biz.equityIrr)}</div><div className={s.stat_label}>{L('자기자본 IRR', 'Equity IRR')}</div></div>
                  <div className={s.stat}><div className={`${s.stat_num} ${biz.minDscr !== null && biz.minDscr < 1.2 ? s.neg : ''}`}>{biz.minDscr === null ? '—' : f(biz.minDscr, 2)}</div><div className={s.stat_label}>{L('최소 DSCR (상환 여력)', 'Min DSCR')}</div></div>
                </div>
                {biz.minDscr !== null && biz.minDscr < 1.2 && <p className={`${ui.hint} ${s.hint}`}>⚠️ {L(`상환 기간 중 영업이익이 원리금의 ${f(biz.minDscr, 2)}배밖에 안 되는 해가 있습니다. 금융기관은 보통 1.2~1.3배 이상을 요구하니 대출 비율을 낮추거나 기간을 늘려 보세요.`, `Debt service coverage falls to ${f(biz.minDscr, 2)}; lenders usually want 1.2–1.3 or more.`)}</p>}
                <div className={s.chart}>{barChart(biz.rows.map(y => y.cumulative), biz.rows.map(y => `${y.year}`), L('연도별 자기자본 누적 현금 (운영비·원리금 차감)', 'Cumulative equity cash flow'), s.ch_bar, true)}</div>
                <div className={s.table_wrap}>
                  <table className={s.table}>
                    <thead><tr><th>{L('연차', 'Year')}</th><th>{L('발전 kWh', 'kWh')}</th><th>{L('단가', 'Price')}</th><th>{L('판매 수입', 'Revenue')}</th><th>{L('운영비', 'O&M')}</th><th>{L('이자', 'Interest')}</th><th>{L('원금', 'Principal')}</th><th>{L('순현금', 'Net cash')}</th><th>{L('누적', 'Cumulative')}</th></tr></thead>
                    <tbody>{biz.rows.map(y => (
                      <tr key={y.year}><td>{y.year} <small>({y.calYear})</small></td><td>{f(y.gen)}</td><td>{f(y.price, 1)}</td><td>{f(y.revenue)}</td><td>{f(y.cost)}</td><td>{f(y.interest)}</td><td>{f(y.principal)}</td><td className={y.cash >= 0 ? s.pos : s.neg}>{f(y.cash)}</td><td className={y.cumulative >= 0 ? s.pos : s.neg}>{f(y.cumulative)}</td></tr>
                    ))}</tbody>
                    <tfoot><tr><td>{L('합계', 'Total')}</td><td>{f(biz.rows.reduce((a, y) => a + y.gen, 0))}</td><td></td><td>{f(biz.totalRevenue)}</td><td>{f(biz.totalCost)}</td><td>{f(biz.totalInterest)}</td><td>{f(biz.rows.reduce((a, y) => a + y.principal, 0))}</td><td>{f(biz.net + biz.equity)}</td><td>{f(biz.net)}</td></tr></tfoot>
                  </table>
                </div>
                <p className={`${ui.hint} ${s.hint}`}>{L('계약시장 단가는 20년 동안 그대로이고, 현물 단가는 입력한 SMP·REC가 2029년까지 유지된다고 가정했습니다(실제 SMP·REC는 매달 변합니다). 세금, 감가상각, 20년 뒤 설비 잔존가치와 철거비는 넣지 않았습니다.', 'Contract prices stay fixed for 20 years; spot prices are held at the entered SMP and REC until 2029 (real prices move monthly). Taxes, depreciation, residual value and decommissioning are not included.')}</p>
                <div className={`${s.actions} ${s.no_print}`}>
                  <button type="button" className={`${ui.button} ${ui.primary}`} onClick={() => copy(L(
                    `[태양광 발전사업 수익] ${regionName(bzRegion)} ${f(kW, 1)}kW (${sale === 'contract' ? `계약시장 ${f(num(contractPrice) + num(premium), 1)}원/kWh` : `현물 SMP+REC×${weight}`})\n1년차 발전 ${f(biz.gen1)}kWh · 판매 ${won(biz.rows[0].revenue)}\n설치비 ${won(capex)} (대출 ${loanPct}% ${rate}% ${loanYears}년)\n사업 IRR ${pct(biz.projectIrr)} · 자기자본 IRR ${pct(biz.equityIrr)} · 회수 ${biz.paybackYears === null ? '20년 초과' : `${f(biz.paybackYears, 1)}년`}`,
                    `[Solar plant] ${f(kW, 1)} kW, year-1 revenue ${won(biz.rows[0].revenue)}, project IRR ${pct(biz.projectIrr)}, equity IRR ${pct(biz.equityIrr)}`,
                  ))}><Copy size={16} />{L('결과 복사', 'Copy')}</button>
                  <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={() => window.print()}><Printer size={16} />{L('인쇄·PDF', 'Print / PDF')}</button>
                  {msg && <span className={s.msg}>{msg}</span>}
                </div>
              </>
            )}
          </section>
        </>
      )}

      {tab !== 'thermal' && (
        <section className={`${ui.card} ${s.card}`}>
          <h2 className={ui.cardTitle}>{L('검증: 실제 발전소 실측과 비교', 'Validation against measured plants')}</h2>
          <p className={`${ui.hint} ${s.hint}`}>{L('한국동서발전이 공개한 발전기별 시간대 실측 발전량(공공데이터포털, 2022.4~2026.6, 결측·정지일 제외)을 연간 kWh/kWp로 바꿔 이 계산기의 모의값과 비교했습니다.', 'Hourly measured output published by Korea East-West Power (2022-04 to 2026-06, outage days excluded) compared with this calculator.')}</p>
          <div className={s.table_wrap}>
            <table className={s.table}>
              <thead><tr><th>{L('발전소', 'Plant')}</th><th>{L('비교 지역', 'Reference')}</th><th>{L('실측', 'Measured')}</th><th>{L('모의', 'Simulated')}</th><th>{L('보정 후', 'Corrected')}</th></tr></thead>
              <tbody>{VALIDATION.map(v => (
                <tr key={v.site}><td>{isKo ? v.site : v.siteEn}</td><td>{isKo ? v.ref : v.refEn}</td><td>{f(v.measured)}</td><td>{f(v.model)} <small className={s.neg}>({f(((v.model - v.measured) / v.measured) * 100)}%)</small></td><td>{f(v.model * FIELD_FACTOR)} <small>({f(((v.model * FIELD_FACTOR - v.measured) / v.measured) * 100)}%)</small></td></tr>
              ))}</tbody>
            </table>
          </div>
          <p className={`${ui.hint} ${s.hint}`}>{L('단위 kWh/kWp·년. 당진·울산은 보정 후 실측과 1% 안팎으로 맞습니다. 동해는 다른 두 곳보다 약 24% 낮아 그늘·방향 같은 현장 조건 영향으로 보고 보정 계산에서 뺐습니다. 월별 패턴은 논문의 전국 평균 월표가 세 곳 모두에서 실측과 가장 가까웠습니다(연간을 맞춘 뒤 월 오차 10~15%). 유럽연합 PVGIS(ERA5)는 같은 곳을 실측보다 약 20% 높게 계산했습니다.', 'kWh/kWp per year. Dangjin and Ulsan match within 1% after correction; Donghae is an outlier (site conditions) and was excluded. PVGIS (ERA5) overestimated these sites by about 20%.')}</p>
        </section>
      )}

      <p className={s.disclaimer}>{L('발전량은 표준기상자료 기반 모의값이고, 요금·연료 단가는 기준일 값입니다. 실제 수익은 날씨·그늘·시공 상태·요금 변동에 따라 달라지니 설치 전 시공사의 현장 검토를 받으세요.', 'Outputs are simulated from standard weather data and prices are as of the stated dates; actual results vary.')}</p>

      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utilities/productivity/solar-master" />

      {seo}
    </div>
  );
}
