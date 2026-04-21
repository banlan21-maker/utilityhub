'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';
import s from './frc.module.css';

// ── Types ──
type Country = 'KR' | 'US';
interface CostItem { id: string; name: string; amount: number; }

// ── Tax Logic ──
function calcKRTax(grossMonthly: number): number {
  const annual = grossMonthly * 12;
  const brackets = [
    { limit: 14_000_000,  rate: 0.06 },
    { limit: 50_000_000,  rate: 0.15 },
    { limit: 88_000_000,  rate: 0.24 },
    { limit: 150_000_000, rate: 0.35 },
    { limit: 300_000_000, rate: 0.38 },
    { limit: 500_000_000, rate: 0.40 },
    { limit: 1_000_000_000, rate: 0.42 },
    { limit: Infinity,    rate: 0.45 },
  ];
  let tax = 0, prev = 0;
  for (const b of brackets) {
    if (annual <= prev) break;
    tax += (Math.min(annual, b.limit) - prev) * b.rate;
    prev = b.limit;
  }
  const localTax = tax * 0.10;
  const healthIns = grossMonthly * 0.0709;
  return (tax + localTax) / 12 + healthIns;
}

function calcUSTax(grossMonthly: number): number {
  const annual = grossMonthly * 12;
  const seTaxBase = annual * 0.9235;
  const seTax = seTaxBase * 0.153;
  const seDeduction = seTax * 0.5;
  const agi = annual - seDeduction;
  const brackets = [
    { limit: 11_600,   rate: 0.10 },
    { limit: 47_150,   rate: 0.12 },
    { limit: 100_525,  rate: 0.22 },
    { limit: 191_950,  rate: 0.24 },
    { limit: 243_725,  rate: 0.32 },
    { limit: 609_350,  rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ];
  let fedTax = 0, prev = 0;
  for (const b of brackets) {
    if (agi <= prev) break;
    fedTax += (Math.min(agi, b.limit) - prev) * b.rate;
    prev = b.limit;
  }
  return (seTax + fedTax) / 12;
}

// ── Helpers ──
const LS_KEY = 'frc-state-v1';
const fmt = (n: number, currency: string) =>
  currency === 'KRW'
    ? `₩${Math.round(n).toLocaleString()}`
    : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Animated Counter Hook ──
function useCountUp(target: number, duration = 600) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const fromRef = useRef<number>(target);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = 0;
    cancelAnimationFrame(rafRef.current);
    const from = fromRef.current;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (target - from) * ease);
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return display;
}

// ── Preset costs ──
const PRESETS_KR = [
  { name: '월세', amount: 500000 },
  { name: 'S/W 구독', amount: 50000 },
  { name: '통신비', amount: 80000 },
  { name: '식비', amount: 400000 },
  { name: '보험료', amount: 150000 },
];
const PRESETS_US = [
  { name: 'Rent', amount: 1500 },
  { name: 'Software', amount: 100 },
  { name: 'Phone/Internet', amount: 100 },
  { name: 'Food', amount: 600 },
  { name: 'Insurance', amount: 300 },
];

// ── Main Component ──
export default function FreelanceRateCalculatorClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [country, setCountry] = useState<Country>('KR');
  const [netIncome, setNetIncome] = useState(3000000);
  const [monthlyHours, setMonthlyHours] = useState(160);
  const [efficiency, setEfficiency] = useState(80);
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [newCostName, setNewCostName] = useState('');
  const [newCostAmt, setNewCostAmt] = useState('');
  const [isClient, setIsClient] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const currency = country === 'KR' ? 'KRW' : 'USD';
  const presets = country === 'KR' ? PRESETS_KR : PRESETS_US;

  // ── Load from localStorage ──
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.country) setCountry(d.country);
        if (d.netIncome) setNetIncome(d.netIncome);
        if (d.monthlyHours) setMonthlyHours(d.monthlyHours);
        if (typeof d.efficiency === 'number') setEfficiency(d.efficiency);
        if (Array.isArray(d.costs)) setCosts(d.costs);
      }
    } catch { /* ignore */ }
  }, []);

  // ── Save to localStorage ──
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(LS_KEY, JSON.stringify({ country, netIncome, monthlyHours, efficiency, costs }));
  }, [country, netIncome, monthlyHours, efficiency, costs, isClient]);

  // ── Calculation ──
  const totalFixedCosts = costs.reduce((sum, c) => sum + c.amount, 0);

  const grossNeeded = country === 'KR'
    ? netIncome + totalFixedCosts
    : netIncome + totalFixedCosts;

  const taxAmount = country === 'KR'
    ? calcKRTax(grossNeeded)
    : calcUSTax(grossNeeded);

  const buffer = (grossNeeded + taxAmount) * 0.10;
  const totalNeeded = grossNeeded + taxAmount + buffer;
  const effectiveHours = monthlyHours * (efficiency / 100);
  const hourlyRate = effectiveHours > 0 ? totalNeeded / effectiveHours : 0;

  // ── Animated display values ──
  const animHourly = useCountUp(hourlyRate, 700);
  const animTotal = useCountUp(totalNeeded, 600);

  // ── Cost actions ──
  const addPreset = useCallback((preset: { name: string; amount: number }) => {
    setCosts(prev => [...prev, { id: Date.now().toString(), name: preset.name, amount: preset.amount }]);
  }, []);

  const addCost = () => {
    const amt = parseFloat(newCostAmt.replace(/,/g, ''));
    if (!newCostName.trim() || isNaN(amt) || amt <= 0) return;
    setCosts(prev => [...prev, { id: Date.now().toString(), name: newCostName.trim(), amount: amt }]);
    setNewCostName('');
    setNewCostAmt('');
  };

  const deleteCost = (id: string) => setCosts(prev => prev.filter(c => c.id !== id));

  // ── Export ──
  const handleExport = async () => {
    if (!receiptRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(receiptRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const link = document.createElement('a');
      link.download = `theutilhub-rate-certificate-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const netSliderMax = country === 'KR' ? 20000000 : 20000;
  const netSliderStep = country === 'KR' ? 100000 : 100;
  const hoursMax = 300;

  if (!isClient) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString(isKo ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={s.frc_wrap}>
      <NavigationActions />

      {/* ── Header ── */}
      <header className={s.frc_header}>
        <div className={s.frc_badge}>⚡ Global Freelance Rate Calculator</div>
        <h1 className={s.frc_title}>
          {isKo ? '프리랜서 적정 단가 계산기' : 'Freelance Rate Calculator'}
          <br /><span>{isKo ? '국제 표준 산정 시스템' : 'Global Standard System'}</span>
        </h1>
        <p className={s.frc_subtitle}>
          {isKo
            ? '세금·고정지출·효율을 반영한 나만의 시간당 단가를 계산하세요'
            : 'Calculate your true hourly rate with taxes, fixed costs & efficiency'}
        </p>
      </header>

      {/* ── Country Tabs ── */}
      <div className={s.frc_country_tabs}>
        {(['KR', 'US'] as Country[]).map(c => (
          <button
            key={c}
            className={`${s.frc_ctab} ${country === c ? s.frc_ctab_active : ''}`}
            onClick={() => setCountry(c)}
          >
            {c === 'KR' ? '🇰🇷 대한민국 (KRW)' : '🇺🇸 United States (USD)'}
          </button>
        ))}
      </div>

      {/* ── Net Income Slider ── */}
      <div className={s.frc_card}>
        <p className={s.frc_card_title}>💰 {isKo ? '목표 월 순수익' : 'Monthly Net Income Goal'}</p>
        <div className={s.frc_slider_label}>
          <span className={s.frc_slider_name}>{isKo ? '세후 실수령 목표액' : 'After-tax take-home target'}</span>
          <span className={s.frc_slider_value}>
            {country === 'KR'
              ? `₩${Math.round(netIncome).toLocaleString()}`
              : `$${netIncome.toLocaleString('en-US')}`}
          </span>
        </div>
        <input
          type="range"
          className={s.frc_slider}
          min={country === 'KR' ? 500000 : 500}
          max={netSliderMax}
          step={netSliderStep}
          value={netIncome}
          onChange={e => setNetIncome(Number(e.target.value))}
        />
        <div className={s.frc_slider_range}>
          <span>{country === 'KR' ? '₩500,000' : '$500'}</span>
          <span>{country === 'KR' ? '₩20,000,000' : '$20,000'}</span>
        </div>
      </div>

      {/* ── Fixed Cost Manager ── */}
      <div className={s.frc_card}>
        <p className={s.frc_card_title}>📋 {isKo ? '월 고정지출 관리' : 'Monthly Fixed Costs'}</p>
        <div className={s.frc_preset_row}>
          {presets.map(p => (
            <button key={p.name} className={s.frc_preset_btn} onClick={() => addPreset(p)}>
              + {p.name}
            </button>
          ))}
        </div>
        <div className={s.frc_cost_add_row}>
          <input
            type="text"
            className={s.frc_cost_input}
            placeholder={isKo ? '항목명 (예: 교통비)' : 'Item name (e.g., Transport)'}
            value={newCostName}
            onChange={e => setNewCostName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCost()}
          />
          <input
            type="text"
            inputMode="numeric"
            className={`${s.frc_cost_input} ${s.frc_cost_input_amount}`}
            placeholder={country === 'KR' ? '금액 (₩)' : 'Amount ($)'}
            value={newCostAmt}
            onChange={e => setNewCostAmt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCost()}
          />
          <button className={s.frc_add_btn} onClick={addCost}>
            {isKo ? '+ 추가' : '+ Add'}
          </button>
        </div>

        {costs.length > 0 && (
          <div className={s.frc_cost_list}>
            {costs.map(c => (
              <div key={c.id} className={s.frc_cost_item}>
                <span className={s.frc_cost_item_name}>{c.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className={s.frc_cost_item_amount}>{fmt(c.amount, currency)}</span>
                  <button className={s.frc_cost_del} onClick={() => deleteCost(c.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={s.frc_cost_total_row}>
          <span className={s.frc_cost_total_label}>{isKo ? '월 고정지출 합계' : 'Total Fixed Costs'}</span>
          <span className={s.frc_cost_total_amt}>{fmt(totalFixedCosts, currency)}</span>
        </div>
      </div>

      {/* ── Work Hours & Efficiency ── */}
      <div className={s.frc_card}>
        <p className={s.frc_card_title}>⏱️ {isKo ? '근무 시간 & 효율' : 'Work Hours & Efficiency'}</p>

        <div className={s.frc_slider_label}>
          <span className={s.frc_slider_name}>{isKo ? '월 총 근무 시간' : 'Monthly Work Hours'}</span>
          <span className={s.frc_slider_value}>{monthlyHours}h</span>
        </div>
        <input
          type="range"
          className={s.frc_slider}
          min={20} max={hoursMax} step={5}
          value={monthlyHours}
          onChange={e => setMonthlyHours(Number(e.target.value))}
        />
        <div className={s.frc_slider_range}>
          <span>20h</span><span>300h</span>
        </div>

        <div style={{ marginTop: '1.2rem' }}>
          <div className={s.frc_eff_row}>
            <span className={s.frc_slider_name}>{isKo ? '실 작업 효율' : 'Work Efficiency'}</span>
            <span className={s.frc_slider_value}>{efficiency}%</span>
          </div>
          <input
            type="range"
            className={s.frc_slider}
            min={10} max={100} step={5}
            value={efficiency}
            onChange={e => setEfficiency(Number(e.target.value))}
          />
          <div className={s.frc_slider_range}>
            <span>10%</span><span>100%</span>
          </div>
          <p className={s.frc_eff_tip}>
            {isKo
              ? `💡 실 작업 효율 ${efficiency}% → 유효 근무시간 ${(monthlyHours * efficiency / 100).toFixed(0)}h/월. 미팅, 이동, 휴식 등 비청구 시간을 반영합니다.`
              : `💡 Efficiency ${efficiency}% → Billable hours: ${(monthlyHours * efficiency / 100).toFixed(0)}h/mo. Accounts for meetings, travel, admin & breaks.`}
          </p>
        </div>
      </div>

      {/* ── Result Dashboard ── */}
      <div className={s.frc_result_wrap}>
        <div className={s.frc_result_card}>
          <p className={s.frc_result_label}>
            {isKo ? '시간당 적정 단가' : 'Recommended Hourly Rate'}
          </p>
          <div className={s.frc_result_rate}>
            {country === 'KR'
              ? `₩${Math.round(animHourly).toLocaleString()}`
              : `$${animHourly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <p className={s.frc_result_unit}>/ {isKo ? '시간' : 'hour'}</p>

          <div className={s.frc_breakdown_grid}>
            <div className={s.frc_breakdown_item}>
              <p className={s.frc_breakdown_item_label}>{isKo ? '월 목표 순수익' : 'Net Income Goal'}</p>
              <p className={s.frc_breakdown_item_val}>{fmt(netIncome, currency)}</p>
            </div>
            <div className={s.frc_breakdown_item}>
              <p className={s.frc_breakdown_item_label}>{isKo ? '월 고정지출' : 'Fixed Costs'}</p>
              <p className={s.frc_breakdown_item_val}>{fmt(totalFixedCosts, currency)}</p>
            </div>
            <div className={s.frc_breakdown_item}>
              <p className={s.frc_breakdown_item_label}>{isKo ? '세금 (추정)' : 'Taxes (est.)'}</p>
              <p className={s.frc_breakdown_item_val}>{fmt(taxAmount, currency)}</p>
            </div>
            <div className={s.frc_breakdown_item}>
              <p className={s.frc_breakdown_item_label}>{isKo ? '버퍼 10%' : 'Buffer 10%'}</p>
              <p className={s.frc_breakdown_item_val}>{fmt(buffer, currency)}</p>
            </div>
            <div className={s.frc_breakdown_item}>
              <p className={s.frc_breakdown_item_label}>{isKo ? '필요 월 총수입' : 'Monthly Gross Needed'}</p>
              <p className={s.frc_breakdown_item_val}>{fmt(animTotal, currency)}</p>
            </div>
            <div className={s.frc_breakdown_item}>
              <p className={s.frc_breakdown_item_label}>{isKo ? '유효 근무시간' : 'Billable Hours'}</p>
              <p className={s.frc_breakdown_item_val}>{(monthlyHours * efficiency / 100).toFixed(0)}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Export Button ── */}
      <button className={s.frc_export_btn} onClick={handleExport}>
        📄 {isKo ? '단가 인증서 이미지로 저장' : 'Save Rate Certificate as Image'}
      </button>

      {/* ── Receipt (off-screen capture target) ── */}
      <div ref={receiptRef} className={s.frc_receipt}>
        <p className={s.frc_receipt_logo}>⚡ theutilhub</p>
        <p className={s.frc_receipt_cert}>
          {isKo ? '프리랜서 단가 공식 인증서' : 'Official Rate Certificate'}
        </p>
        <hr className={s.frc_receipt_divider} />
        <div className={s.frc_receipt_row}>
          <span className={s.frc_receipt_key}>{isKo ? '국가' : 'Country'}</span>
          <span className={s.frc_receipt_val}>{country === 'KR' ? '🇰🇷 대한민국' : '🇺🇸 United States'}</span>
        </div>
        <div className={s.frc_receipt_row}>
          <span className={s.frc_receipt_key}>{isKo ? '목표 순수익' : 'Net Income'}</span>
          <span className={s.frc_receipt_val}>{fmt(netIncome, currency)}</span>
        </div>
        <div className={s.frc_receipt_row}>
          <span className={s.frc_receipt_key}>{isKo ? '고정지출' : 'Fixed Costs'}</span>
          <span className={s.frc_receipt_val}>{fmt(totalFixedCosts, currency)}</span>
        </div>
        <div className={s.frc_receipt_row}>
          <span className={s.frc_receipt_key}>{isKo ? '세금 (추정)' : 'Est. Taxes'}</span>
          <span className={s.frc_receipt_val}>{fmt(taxAmount, currency)}</span>
        </div>
        <div className={s.frc_receipt_row}>
          <span className={s.frc_receipt_key}>{isKo ? '버퍼 10%' : 'Buffer 10%'}</span>
          <span className={s.frc_receipt_val}>{fmt(buffer, currency)}</span>
        </div>
        <div className={s.frc_receipt_row}>
          <span className={s.frc_receipt_key}>{isKo ? '유효 근무시간' : 'Billable Hours'}</span>
          <span className={s.frc_receipt_val}>{(monthlyHours * efficiency / 100).toFixed(0)}h / mo</span>
        </div>
        <hr className={s.frc_receipt_divider} />
        <p className={s.frc_receipt_big}>
          {country === 'KR'
            ? `₩${Math.round(hourlyRate).toLocaleString()} / hr`
            : `$${hourlyRate.toFixed(2)} / hr`}
        </p>
        <p className={s.frc_receipt_footer}>
          {dateStr} · theutilhub.com<br />
          {isKo
            ? '본 인증서는 참고용이며 실제 세금과 상이할 수 있습니다.'
            : 'This certificate is for reference only. Actual taxes may vary.'}
        </p>
      </div>

      {/* ── SEO Section ── */}
      <section className={s.frc_seo}>
        <h2>{isKo ? '📌 프리랜서 단가, 어떻게 정해야 할까?' : '📌 How to Set Your Freelance Rate'}</h2>
        <p>
          {isKo
            ? '많은 프리랜서가 "시장 시세"를 기준으로 단가를 정하지만, 이는 당신의 실제 생활비·세금·고정지출을 전혀 반영하지 않습니다. 진정한 적정 단가는 역산(逆算) 방식으로 계산해야 합니다. 내가 실수령하고 싶은 금액에서 출발해, 세금·고정지출·효율 저하 요인을 모두 더하면 내가 실제로 청구해야 할 최소 단가가 나옵니다. 이 계산기는 한국과 미국의 세금 체계를 모두 반영하여 정밀한 단가 산정을 도와드립니다.'
            : 'Many freelancers price themselves by market rates, ignoring their actual living costs, taxes, and overhead. The right approach is reverse-engineering: start from your desired take-home, then add taxes, fixed costs, and an efficiency buffer. This gives your true minimum viable rate — below which you are effectively losing money.'}
        </p>

        <h2>{isKo ? '🌏 국가별 세금 구조 비교' : '🌏 Tax Structures: KR vs US'}</h2>
        <ul>
          {isKo ? (
            <>
              <li><strong>한국:</strong> 3.3% 원천징수(사업소득세) + 6~45% 누진소득세 + 지방소득세 10% + 지역건강보험료(약 7.09%). 특히 지역 건강보험료는 소득 외 재산·자동차도 반영되어 실제 부담이 크게 늘 수 있습니다.</li>
              <li><strong>미국:</strong> 자영업세(SE Tax) 15.3% (소득의 92.35% 기준) + 연방소득세 10~37% 누진. SE Tax의 50%는 소득공제 가능. 주(State)세는 별도로 계산하세요.</li>
            </>
          ) : (
            <>
              <li><strong>Korea:</strong> 3.3% withholding tax (business income) + 6–45% progressive income tax + 10% local income tax + regional health insurance (~7.09%). Health insurance is also calculated on assets/vehicles, making actual burden higher.</li>
              <li><strong>United States:</strong> SE Tax 15.3% (on 92.35% of net SE income) + Federal income tax 10–37% progressive. 50% of SE Tax is deductible. State taxes not included — add your state rate separately.</li>
            </>
          )}
        </ul>

        <h2>{isKo ? '📦 고정지출 관리의 중요성' : '📦 Why Fixed Costs Matter'}</h2>
        <p>
          {isKo
            ? '월세, 소프트웨어 구독, 통신비, 식비, 보험료 등 고정지출은 수입이 없는 달에도 반드시 지출됩니다. 프리랜서에게 이 비용들은 "사업 운영비"이며, 클라이언트 단가에 반드시 반영해야 합니다. 고정지출을 제외하고 단가를 산정하면, 실질적으로 손해를 보는 계약을 맺게 됩니다.'
            : 'Rent, software subscriptions, phone bills, food, and insurance are unavoidable monthly expenses — even in months with no income. For freelancers, these are business operating costs that must be factored into your rates. Ignoring fixed costs means your rate effectively forces you to subsidize your clients.'}
        </p>

        <h2>{isKo ? '❓ 자주 묻는 질문 (FAQ)' : '❓ Frequently Asked Questions'}</h2>
        <dl className={s.frc_seo_faq}>
          {isKo ? (
            <>
              <dt>Q. 효율(Efficiency)은 왜 100%가 아닌가요?</dt>
              <dd>A. 프리랜서의 하루 8시간 중 실제 청구 가능한 작업 시간은 미팅, 이메일, 이동, 영업 등을 제외하면 60~80% 수준입니다. 효율을 100%로 설정하면 단가가 낮아져 실제 수익이 줄어들 수 있습니다.</dd>
              <dt>Q. 버퍼 10%는 왜 필요한가요?</dt>
              <dd>A. 세금 예측 오차, 미수금(미지급 프로젝트), 예상치 못한 지출, 비수기 등에 대비한 안전 마진입니다. 장기적으로 단가를 안정적으로 유지하는 핵심 요소입니다.</dd>
              <dt>Q. 이 계산기의 세금 계산이 정확한가요?</dt>
              <dd>A. 공개된 2024년 세율 기준으로 추정합니다. 실제 세금은 공제 항목, 사업 형태, 지역 등에 따라 다를 수 있으니 세무사 상담을 권장합니다.</dd>
              <dt>Q. 입력한 데이터는 어디에 저장되나요?</dt>
              <dd>A. 모든 데이터는 브라우저의 로컬 스토리지에만 저장됩니다. 서버로 전송되거나 제3자와 공유되지 않습니다.</dd>
              <dt>Q. 일용직·플랫폼 프리랜서도 사용할 수 있나요?</dt>
              <dd>A. 네, 월 근무시간과 효율을 조절하면 플랫폼 수수료(20~30%)를 추가 고정비로 입력하여 활용하실 수 있습니다.</dd>
            </>
          ) : (
            <>
              <dt>Q. Why isn't efficiency 100%?</dt>
              <dd>A. Out of an 8-hour workday, actual billable hours are typically 60–80% after accounting for meetings, emails, admin, and business development. Setting efficiency to 100% underprices your work.</dd>
              <dt>Q. Why a 10% buffer?</dt>
              <dd>A. It covers tax estimate variances, late-paying clients, unexpected expenses, and slow months. It's the key to maintaining a stable freelance income long-term.</dd>
              <dt>Q. How accurate is the tax estimate?</dt>
              <dd>A. Based on published 2024 tax brackets as an estimate. Your actual taxes depend on deductions, filing status, and state taxes. Consult a CPA for precise figures.</dd>
              <dt>Q. Where is my data stored?</dt>
              <dd>A. All data is stored only in your browser's localStorage. Nothing is sent to any server or shared with third parties.</dd>
              <dt>Q. Can platform freelancers (Upwork, Fiverr) use this?</dt>
              <dd>A. Yes. Add platform fees (typically 20%) as a fixed monthly cost, or factor them into your efficiency percentage.</dd>
            </>
          )}
        </dl>

        <h2>{isKo ? '⚠️ 면책조항' : '⚠️ Disclaimer'}</h2>
        <p>
          {isKo
            ? '본 계산기는 정보 제공 목적으로만 사용되며, 세무·법률 조언을 구성하지 않습니다. 실제 세금은 개인 상황에 따라 크게 달라질 수 있습니다. 정확한 세금 계산은 반드시 공인 세무사 또는 회계사와 상담하시기 바랍니다.'
            : 'This calculator is for informational purposes only and does not constitute tax or legal advice. Actual tax obligations vary significantly based on individual circumstances. Always consult a qualified CPA or tax professional for accurate tax calculations.'}
        </p>
      </section>
    </div>
  );
}
