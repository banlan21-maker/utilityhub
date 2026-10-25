'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Sun, Copy, FileText, Printer } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { REGIONS, TILT_FACTOR, AZIMUTH_FACTOR, FIELD_FACTOR, VALIDATION, pvCalc, thermalCalc } from '@/lib/solar';
import { ELECTRICITY, CITY_GAS, KEROSENE, CO2 } from '@/constants/energyPrices';
import s from './solar.module.css';

type Tab = 'pv' | 'thermal';
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

export default function SolarMasterClient() {
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
    <div className={s.field}>
      <label className={s.field_label} htmlFor={id}>{label}{sub && <small>{sub}</small>}</label>
      <div className={s.input_wrap}>
        <input id={id} className={s.input} inputMode={mode === 'dec' ? 'decimal' : 'numeric'}
          value={mode === 'money' ? comma(value) : value}
          onChange={e => set(mode === 'dec' ? dec(e.target.value) : digits(e.target.value))} />
        <span className={s.unit}>{unit}</span>
      </div>
    </div>
  );
  const chip = <T extends string | number>(cur: T, val: T, set: (v: T) => void, label: string, sub?: string) => (
    <button key={String(val)} type="button" aria-pressed={cur === val} className={`${s.chip} ${cur === val ? s.chip_on : ''}`} onClick={() => set(val)}>
      {label}{sub && <small>{sub}</small>}
    </button>
  );
  const regionSelect = (id: string, val: string, set: (v: string) => void) => (
    <div className={s.field}>
      <label className={s.field_label} htmlFor={id}>{L('지역', 'Region')}<small>{L('일평균 발전시간', 'avg daily yield hours')} {REGIONS.find(r => r.id === val)!.hours}h</small></label>
      <select id={id} className={s.select} value={val} onChange={e => set(e.target.value)}>
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

  const titleStr = L('태양광·태양열 발전량·수익 계산기', 'Solar PV & Thermal Savings Calculator');
  const descStr = L('지역별 발전시간과 한전 전기요금 전체(누진·부가세·기금)로 태양광 발전량·절감액·회수 기간을, 급탕량 기준으로 태양열 온수 절감액을 계산합니다.', 'Estimate solar PV output, bill savings and payback with Korean regional yields and the full KEPCO tariff, plus solar hot-water savings sized to your demand.');

  return (
    <div className={`${s.container} ${tab === 'thermal' ? s.thermal : ''}`}>
      <NavigationActions />

      <header className={s.header}>
        <div className={s.icon_wrap}><Sun size={40} /></div>
        <h1 className={s.title}>{titleStr}</h1>
        <p className={s.subtitle}>{descStr}</p>
      </header>

      <div className={s.tabs} role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'pv'} className={`${s.tab} ${tab === 'pv' ? s.tab_pv : ''}`} onClick={() => setTab('pv')}>
          ⚡ {L('태양광 발전', 'Solar PV')}<small>{L('전기요금 절감', 'electricity savings')}</small>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'thermal'} className={`${s.tab} ${tab === 'thermal' ? s.tab_th : ''}`} onClick={() => setTab('thermal')}>
          🔥 {L('태양열 온수', 'Solar hot water')}<small>{L('가스·등유 절감', 'gas or oil savings')}</small>
        </button>
      </div>

      {tab === 'pv' ? (
        <>
          <section className={s.card}>
            <h2 className={s.card_title}>{L('1. 설치 조건', '1. System')}</h2>
            <div className={s.grid3}>
              {regionSelect('pv-region', region, setRegion)}
              {field('pv-w', L('패널 1장 출력', 'Panel rating'), L('제품 사양 W', 'from the datasheet'), panelW, setPanelW, 'W', 'int')}
              {field('pv-n', L('패널 수', 'Panels'), L(`설치 용량 ${f(kWp, 2)}kWp`, `${f(kWp, 2)} kWp`), panelN, setPanelN, L('장', 'pcs'), 'int')}
            </div>
            <div>
              <span className={s.label}>{L('경사각', 'Tilt')}</span>
              <div className={s.chips}>{Object.keys(TILT_FACTOR).map(k => chip(tilt, k, setTilt, `${k}°`, `×${TILT_FACTOR[k]}`))}</div>
            </div>
            <div>
              <span className={s.label}>{L('방향', 'Orientation')}</span>
              <div className={s.chips}>{Object.keys(AZIMUTH_FACTOR).map(k => chip(azimuth, k, setAzimuth, ({ south: L('남향', 'South'), southeast: L('남동', 'SE'), southwest: L('남서', 'SW'), east: L('동향', 'East'), west: L('서향', 'West') } as Record<string, string>)[k], `×${AZIMUTH_FACTOR[k]}`))}</div>
            </div>
            <div className={s.grid2}>
              <div>
                <span className={s.label}>{L('그늘 손실', 'Shading')}</span>
                <div className={s.chips}>{[0, 5, 10, 20].map(p => chip(shade, p, setShade, `${p}%`))}</div>
              </div>
              {field('pv-deg', L('연간 출력 감소(노화)', 'Degradation'), L('보통 0.5%/년', 'typically 0.5 %/yr'), degrade, setDegrade, L('%/년', '%/yr'))}
            </div>
            <label className={s.toggle}>
              <input type="checkbox" checked={fieldCorrection} onChange={e => setFieldCorrection(e.target.checked)} />
              <span>{L(`실측 보정 적용 (×${FIELD_FACTOR})`, `Apply field correction (×${FIELD_FACTOR})`)}<small>{L('실제 발전소 실측은 모의값보다 약 11% 적었습니다(먼지·부분 고장·노후 등). 끄면 이상적인 운영 기준입니다.', 'Measured plants produced about 11% less than the simulation; turn off for ideal operation.')}</small></span>
            </label>
            <p className={s.hint}>{L('지역 발전시간은 정남향 30° 기준 모의 결과로 온도·인버터 손실이 이미 들어 있습니다. 경사·방향 보정은 경험치입니다.', 'Regional hours already include temperature and inverter losses (south, 30°). Tilt and orientation factors are rules of thumb.')}</p>
          </section>

          <section className={s.card}>
            <h2 className={s.card_title}>{L('2. 전기 사용량과 비용', '2. Usage and cost')}</h2>
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
            <p className={s.hint}>{L('보조금은 한국에너지공단 주택지원사업·지자체 사업마다 금액이 다릅니다. 모집 공고에서 확정 금액을 확인해 넣으세요.', 'Subsidies vary by programme and municipality; enter the confirmed amount.')}</p>
            {priceBox}
          </section>

          <section className={s.card} aria-live="polite">
            <h2 className={s.card_title}>{L('3. 결과', '3. Result')}</h2>
            {!pv ? <p className={s.hint}>{L('패널 출력과 수를 넣으세요.', 'Enter panel rating and count.')}</p> : (
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
                <p className={s.hint}>{L('전기요금 단가는 지금 수준으로 유지된다고 가정했습니다. 인버터 교체(보통 10~15년)나 요금 인상은 반영하지 않습니다.', 'Assumes today’s tariff; inverter replacement and tariff changes are not included.')}</p>
                <div className={`${s.actions} ${s.no_print}`}>
                  <button type="button" className={s.btn} onClick={() => copy(L(
                    `[태양광 수익 계산] ${regionName(region)} ${f(kWp, 2)}kWp (${panelW}W × ${panelN}장, ${tilt}°)\n연 발전 ${f(pv.annualGen)}kWh (${f(pv.specificYield)} kWh/kWp)\n연 절감 ${won(pv.annualSaving)} · 회수 ${pv.paybackYears === null ? '20년 초과' : `${f(pv.paybackYears, 1)}년`}`,
                    `[Solar PV] ${f(kWp, 2)} kWp, ${f(pv.annualGen)} kWh/yr, saves ${won(pv.annualSaving)}/yr`,
                  ))}><Copy size={16} />{L('결과 복사', 'Copy')}</button>
                  <button type="button" className={s.ghost} onClick={toInvoice}><FileText size={16} />{L('견적서로 보내기', 'Send to invoice')}</button>
                  <button type="button" className={s.ghost} onClick={() => window.print()}><Printer size={16} />{L('인쇄·PDF', 'Print / PDF')}</button>
                  {msg && <span className={s.msg}>{msg}</span>}
                </div>
              </>
            )}
          </section>
        </>
      ) : (
        <>
          <section className={s.card}>
            <h2 className={s.card_title}>{L('1. 집열판과 온수 사용', '1. Collector and hot water')}</h2>
            <div className={s.grid3}>
              {regionSelect('th-region', thRegion, setThRegion)}
              {field('th-area', L('집열판 면적', 'Collector area'), L('총 면적', 'total'), area, setArea, '㎡')}
              {field('th-eff', L('연평균 집열 효율', 'Annual efficiency'), L('시스템 전체 기준', 'whole system'), effText, setEffText, '%')}
            </div>
            <div className={s.chips}>
              {chip(collector, 'flat', v => { setCollector(v); setEffText('45'); }, L('평판형', 'Flat plate'), L('효율 약 45%', '≈45%'))}
              {chip(collector, 'tube', v => { setCollector(v); setEffText('55'); }, L('진공관형', 'Evacuated tube'), L('효율 약 55%', '≈55%'))}
            </div>
            <div className={s.grid3}>
              {field('th-l', L('하루 온수 사용량', 'Hot water per day'), L('1인 약 50~70L', '50–70 L per person'), liters, setLiters, 'L', 'int')}
              {field('th-hot', L('온수 온도', 'Hot water temp'), '', hotC, setHotC, '℃')}
              {field('th-cold', L('수돗물 온도', 'Cold water temp'), L('연평균', 'annual avg'), coldC, setColdC, '℃')}
            </div>
            <p className={s.hint}>{L('집열량이 하루 필요한 열보다 많으면 남는 열은 버려지므로 절감액에 넣지 않습니다. 겨울에는 수돗물이 더 차가워 실제 태양열 비율이 이 계산보다 낮을 수 있습니다.', 'Heat beyond daily demand is not counted. In winter colder mains water lowers the real solar share.')}</p>
          </section>

          <section className={s.card}>
            <h2 className={s.card_title}>{L('2. 지금 쓰는 열원과 비용', '2. Current heater and cost')}</h2>
            <div className={s.chips}>
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

          <section className={s.card} aria-live="polite">
            <h2 className={s.card_title}>{L('3. 결과', '3. Result')}</h2>
            {!th ? <p className={s.hint}>{L('면적·온수량·온도를 확인하세요 (온수 온도가 수돗물보다 높아야 합니다).', 'Check area, volume and temperatures.')}</p> : (
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
                {th.wastedPct > 25 && <p className={s.hint}>⚠️ {L(`집열판이 사용량에 비해 커서 모은 열의 ${f(th.wastedPct)}%가 남습니다. 면적을 줄이거나 온수 사용량을 다시 확인해 보세요.`, `About ${f(th.wastedPct)}% of collected heat is surplus; the collector may be oversized.`)}</p>}
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
                  <button type="button" className={s.btn} onClick={() => copy(L(
                    `[태양열 온수 계산] ${regionName(thRegion)} 집열판 ${area}㎡, 하루 ${liters}L (${coldC}→${hotC}℃)\n태양열 충당 ${f(th.solarFraction * 100)}% · 연 절감 ${won(th.annualSaving)} · 회수 ${th.paybackYears === null ? '-' : `${f(th.paybackYears, 1)}년`}`,
                    `[Solar thermal] ${area} m², ${liters} L/day, saves ${won(th.annualSaving)}/yr`,
                  ))}><Copy size={16} />{L('결과 복사', 'Copy')}</button>
                  <button type="button" className={s.ghost} onClick={toInvoice}><FileText size={16} />{L('견적서로 보내기', 'Send to invoice')}</button>
                  <button type="button" className={s.ghost} onClick={() => window.print()}><Printer size={16} />{L('인쇄·PDF', 'Print / PDF')}</button>
                  {msg && <span className={s.msg}>{msg}</span>}
                </div>
              </>
            )}
          </section>
        </>
      )}

      {tab === 'pv' && (
        <section className={s.card}>
          <h2 className={s.card_title}>{L('검증: 실제 발전소 실측과 비교', 'Validation against measured plants')}</h2>
          <p className={s.hint}>{L('한국동서발전이 공개한 발전기별 시간대 실측 발전량(공공데이터포털, 2022.4~2026.6, 결측·정지일 제외)을 연간 kWh/kWp로 바꿔 이 계산기의 모의값과 비교했습니다.', 'Hourly measured output published by Korea East-West Power (2022-04 to 2026-06, outage days excluded) compared with this calculator.')}</p>
          <div className={s.table_wrap}>
            <table className={s.table}>
              <thead><tr><th>{L('발전소', 'Plant')}</th><th>{L('비교 지역', 'Reference')}</th><th>{L('실측', 'Measured')}</th><th>{L('모의', 'Simulated')}</th><th>{L('보정 후', 'Corrected')}</th></tr></thead>
              <tbody>{VALIDATION.map(v => (
                <tr key={v.site}><td>{isKo ? v.site : v.siteEn}</td><td>{isKo ? v.ref : v.refEn}</td><td>{f(v.measured)}</td><td>{f(v.model)} <small className={s.neg}>({f(((v.model - v.measured) / v.measured) * 100)}%)</small></td><td>{f(v.model * FIELD_FACTOR)} <small>({f(((v.model * FIELD_FACTOR - v.measured) / v.measured) * 100)}%)</small></td></tr>
              ))}</tbody>
            </table>
          </div>
          <p className={s.hint}>{L('단위 kWh/kWp·년. 당진·울산은 보정 후 실측과 1% 안팎으로 맞습니다. 동해는 다른 두 곳보다 약 24% 낮아 그늘·방향 같은 현장 조건 영향으로 보고 보정 계산에서 뺐습니다. 월별 패턴은 논문의 전국 평균 월표가 세 곳 모두에서 실측과 가장 가까웠습니다(연간을 맞춘 뒤 월 오차 10~15%). 유럽연합 PVGIS(ERA5)는 같은 곳을 실측보다 약 20% 높게 계산했습니다.', 'kWh/kWp per year. Dangjin and Ulsan match within 1% after correction; Donghae is an outlier (site conditions) and was excluded. PVGIS (ERA5) overestimated these sites by about 20%.')}</p>
        </section>
      )}

      <p className={s.disclaimer}>{L('발전량은 표준기상자료 기반 모의값이고, 요금·연료 단가는 기준일 값입니다. 실제 수익은 날씨·그늘·시공 상태·요금 변동에 따라 달라지니 설치 전 시공사의 현장 검토를 받으세요.', 'Outputs are simulated from standard weather data and prices are as of the stated dates; actual results vary.')}</p>

      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utilities/productivity/solar-master" />
      <div className={s.ad_slot}>AD</div>

      <SeoSection
        ko={{
          title: '태양광 발전량·수익 계산과 태양열 온수 절감액',
          description: '주택 태양광의 연간 발전량은 설치 용량(kWp) × 지역 일평균 발전시간 × 365일로 어림합니다. 국가참조표준기상데이터로 16개 지역을 모의한 연구에서 정남향 30° 설치 시 전국 평균은 하루 3.6시간(연 약 1,312kWh/kWp)이었고, 서울은 3.2시간(약 1,165kWh/kWp), 목포는 3.9시간이었습니다. 이 값에는 온도·인버터 손실이 이미 들어 있으므로 손실을 또 빼면 발전량이 지나치게 낮게 나옵니다. 이 계산기는 지역 발전시간에 월별 계수, 경사각·방향·그늘 보정, 해마다 누적되는 패널 노화를 반영하고, 절감액은 한전 주택용 저압 요금 전체 — 기본요금, 누진 전력량요금(기타계절 200·400kWh, 여름 300·450kWh 구간), 기후환경요금, 연료비조정요금, 부가세, 전력산업기반기금 — 로 계산합니다. 남는 전력을 다음 달로 넘기는 상계거래도 반영합니다. 한국동서발전이 공개한 실제 발전소 4년치 실측과 비교해 보니 실제 발전량은 모의값보다 약 11% 적어, 기본값으로 이 차이(×0.89)를 보정합니다. 예를 들어 서울에서 3.2kWp를 달고 월 350kWh(여름 450kWh)를 쓰는 집은 보정 후 연 약 3,330kWh를 만들어 전기요금을 연 70만 원가량 줄입니다. 태양열 탭은 하루 온수 사용량과 온도로 필요한 열량을 구해, 집열판이 모은 열 중 실제로 쓰는 만큼만 절감액에 넣고 기존 보일러 효율로 연료 절감을 계산합니다. 단가는 기준일과 함께 표시되며 고지서 단가로 바꿔 넣을 수 있습니다.',
          useCases: [
            { icon: '🏠', title: '주택 태양광 설치 검토', desc: '지역, 패널 출력과 장수, 경사·방향을 넣으면 연간 발전량과 월별 전기요금 전후를 비교하고, 설치비와 확정 보조금으로 회수 기간과 20년 누적 수익을 확인합니다.' },
            { icon: '📋', title: '시공사 견적 검증', desc: '업체가 제시한 연 발전량이 지역 평균(kWh/kWp)과 맞는지 비교합니다. 서울에서 kWp당 연 1,300kWh를 넘게 약속한다면 근거를 물어볼 만합니다.' },
            { icon: '❄️', title: '여름 누진 구간 확인', desc: '7·8월 사용량을 따로 넣어 에어컨으로 누진 3단계에 들어가는 달에 태양광이 얼마나 요금을 낮추는지 월별 표로 봅니다.' },
            { icon: '🔥', title: '태양열 온수기 크기 정하기', desc: '가족 수에 맞춘 하루 온수량으로 필요한 열량을 구해, 집열판이 너무 커서 버려지는 열이 많지 않은지와 가스·등유 절감액을 함께 확인합니다.' },
          ],
          steps: [
            { step: '태양광·태양열 선택', desc: '전기요금을 줄이려면 태양광 발전, 온수 연료비를 줄이려면 태양열 온수 탭을 고릅니다. 두 탭의 입력은 따로 유지됩니다.' },
            { step: '설치 조건 입력', desc: '지역을 고르고 패널 1장 출력과 장수, 경사각·방향·그늘을 정합니다. 태양열은 집열판 면적과 종류, 하루 온수량과 온도를 넣습니다.' },
            { step: '사용량·단가·비용', desc: '월 전기 사용량(여름 따로), 설치비, 확정된 보조금을 넣습니다. 기본 단가는 기준일 값이니 고지서 단가가 다르면 바꿔 넣습니다.' },
            { step: '결과 확인·내보내기', desc: '연간 절감액, 회수 기간, 월별 표와 누적 수익 그래프를 확인하고 결과 복사, 견적서 보내기, 인쇄로 저장합니다.' },
          ],
          faqs: [
            { q: '여름보다 봄에 발전량이 더 많은 이유는 무엇인가요?', a: '여름은 해가 길지만 장마로 흐린 날이 많고 패널 온도가 올라가 효율이 떨어집니다. 결정질 실리콘 패널은 온도가 1℃ 오를 때 출력이 약 0.4% 줄어, 맑고 선선한 4~5월에 월 발전량이 가장 많은 경우가 많습니다.' },
            { q: '전기요금 절감액은 어떻게 계산하나요?', a: '태양광이 없을 때와 있을 때의 월 사용량으로 한전 주택용 저압 요금을 각각 계산해 그 차이를 절감액으로 봅니다. 누진 구간이 바뀌는 효과와 기본요금, 기후환경·연료비조정요금, 부가세 10%, 전력산업기반기금 2.7%까지 들어가므로, 발전량 × 단가로 단순 계산한 값과 다릅니다.' },
            { q: '보조금은 얼마나 받을 수 있나요?', a: '한국에너지공단 주택지원사업과 지자체 사업은 해마다 지원 단가와 예산이 바뀌고 지역마다 다릅니다. 그래서 이 계산기는 보조금을 자동으로 빼지 않고, 모집 공고나 시공사 계약서에서 확인한 금액을 넣도록 했습니다.' },
            { q: '계산 결과는 얼마나 정확한가요?', a: '한국동서발전이 공개한 당진·울산 발전소의 2022~2026년 시간대별 실측 발전량과 비교했을 때, 실측 보정을 켠 연간 발전량은 실측과 1% 안팎으로 맞았고 월별로는 10~15% 차이가 났습니다. 그늘이나 방향이 나쁜 현장은 이보다 크게 낮을 수 있어, 동해 발전소처럼 실측이 24% 낮은 사례도 있었습니다.' },
            { q: '태양열 집열판은 클수록 좋은가요?', a: '아닙니다. 모은 열이 하루 쓰는 온수 열량보다 많으면 남는 열은 쓰지 못합니다. 하루 200L를 15℃에서 45℃로 데우는 데는 약 25MJ가 필요하므로, 이보다 훨씬 많이 모으는 집열판은 여름에 버리는 열만 늘고 회수 기간은 길어집니다.' },
          ],
        }}
        en={{
          title: 'Solar PV output, savings and solar hot water',
          description: 'Annual PV output is roughly capacity (kWp) × regional daily yield hours × 365. A simulation of 16 Korean regions with national reference weather data found an average of 3.6 h/day at 30° south (about 1,312 kWh/kWp), with Seoul at 3.2 h (1,165 kWh/kWp). These figures already include temperature and inverter losses. This calculator applies monthly factors, tilt, orientation, shading and year-by-year degradation, and computes savings with the full KEPCO residential tariff — basic charge, tiered energy charge with summer thresholds, climate and fuel adjustment charges, VAT and the power fund — including net metering of surplus. The solar thermal tab sizes heat demand from daily hot water and temperatures, counts only the heat actually used and converts it to fuel savings through boiler efficiency. Prices are shown with their effective dates and can be edited.',
          useCases: [
            { icon: '🏠', title: 'Home PV Decision', desc: 'Compare monthly bills before and after, and see payback and 20-year return.' },
            { icon: '📋', title: 'Check a Quote', desc: 'Compare a promised yield with regional kWh/kWp.' },
            { icon: '❄️', title: 'Summer Tiers', desc: 'Enter July–August use separately to see savings in high-tier months.' },
            { icon: '🔥', title: 'Size a Solar Water Heater', desc: 'Avoid oversized collectors that waste heat.' },
          ],
          steps: [
            { step: 'Pick PV or Thermal', desc: 'Each tab keeps its own inputs.' },
            { step: 'Describe the System', desc: 'Region, panels, tilt, orientation and shading, or collector area and hot water.' },
            { step: 'Usage, Prices, Cost', desc: 'Enter usage, cost and confirmed subsidy; edit prices if your bill differs.' },
            { step: 'Read and Export', desc: 'See savings, payback, tables and charts; copy, send to invoice or print.' },
          ],
          faqs: [
            { q: 'Why is spring better than summer?', a: 'Summer brings monsoon clouds and hot panels lose about 0.4% per °C, so clear, mild April and May often produce the most.' },
            { q: 'How are bill savings calculated?', a: 'The full residential bill is calculated with and without solar each month, including tiers, charges, VAT and the power fund.' },
            { q: 'What about subsidies?', a: 'They vary by year and municipality, so enter only a confirmed amount.' },
            { q: 'How accurate is it?', a: 'Against 2022–2026 hourly measurements from Korea East-West Power plants in Dangjin and Ulsan, the corrected annual yield matched within about 1% and monthly values within 10–15%; poorly sited plants can be much lower.' },
            { q: 'Is a bigger collector better?', a: 'No — heat beyond daily demand is wasted; 200 L from 15 to 45 °C needs about 25 MJ a day.' },
          ],
        }}
      />
    </div>
  );
}
