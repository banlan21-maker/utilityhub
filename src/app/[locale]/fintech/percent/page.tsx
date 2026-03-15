'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import { Link } from '@/i18n/routing';

type Mode = 'discount' | 'change' | 'ratio' | 'reverse';

interface Result {
  label: string;
  value: string;
  highlight?: boolean;
}

function InputField({ label, value, onChange, suffix }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value.replace(/[^0-9.-]/g, ''))}
          style={{
            width: '100%',
            padding: suffix ? '0.8rem 3rem 0.8rem 1rem' : '0.8rem 1rem',
            fontSize: '1.1rem',
            fontWeight: 600,
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
        {suffix && (
          <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem' }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function ResultBox({ results }: { results: Result[] }) {
  if (!results.length) return null;
  return (
    <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(16,185,129,0.08))', border: '1px solid var(--border)' }}>
      {results.map((r, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: i > 0 ? '0.6rem 0 0' : '0', borderTop: i > 0 ? '1px solid var(--border)' : 'none', marginTop: i > 0 ? '0.6rem' : 0 }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{r.label}</span>
          <span style={{ fontSize: r.highlight ? '1.6rem' : '1rem', fontWeight: r.highlight ? 800 : 600, color: r.highlight ? 'var(--primary)' : 'var(--text-primary)', letterSpacing: r.highlight ? '-0.5px' : 'normal' }}>
            {r.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PercentPage() {
  const t = useTranslations('Percent');
  const [mode, setMode] = useState<Mode>('discount');

  // discount mode
  const [origPrice, setOrigPrice] = useState('');
  const [discRate, setDiscRate] = useState('');

  // change mode
  const [oldVal, setOldVal] = useState('');
  const [newVal, setNewVal] = useState('');

  // ratio mode
  const [part, setPart] = useState('');
  const [total, setTotal] = useState('');

  // reverse mode
  const [finalPrice, setFinalPrice] = useState('');
  const [appliedRate, setAppliedRate] = useState('');

  const fmt = (n: number, decimals = 2) => n.toLocaleString('ko-KR', { minimumFractionDigits: 0, maximumFractionDigits: decimals });

  const discountResults = (): Result[] => {
    const orig = parseFloat(origPrice);
    const rate = parseFloat(discRate);
    if (!isFinite(orig) || !isFinite(rate)) return [];
    const saved = orig * (rate / 100);
    const final = orig - saved;
    return [
      { label: t('result.discountAmount'), value: `${fmt(saved)}원` },
      { label: t('result.finalPrice'), value: `${fmt(final)}원`, highlight: true },
    ];
  };

  const changeResults = (): Result[] => {
    const o = parseFloat(oldVal);
    const n = parseFloat(newVal);
    if (!isFinite(o) || !isFinite(n) || o === 0) return [];
    const rate = ((n - o) / o) * 100;
    const diff = n - o;
    const sign = diff >= 0 ? '+' : '';
    return [
      { label: t('result.difference'), value: `${sign}${fmt(diff)}` },
      { label: t('result.changeRate'), value: `${sign}${fmt(rate)}%`, highlight: true },
    ];
  };

  const ratioResults = (): Result[] => {
    const p = parseFloat(part);
    const tot = parseFloat(total);
    if (!isFinite(p) || !isFinite(tot) || tot === 0) return [];
    const ratio = (p / tot) * 100;
    return [
      { label: t('result.ratio'), value: `${fmt(ratio)}%`, highlight: true },
    ];
  };

  const reverseResults = (): Result[] => {
    const final = parseFloat(finalPrice);
    const rate = parseFloat(appliedRate);
    if (!isFinite(final) || !isFinite(rate)) return [];
    const orig = final / (1 - rate / 100);
    const saved = orig - final;
    return [
      { label: t('result.originalPrice'), value: `${fmt(orig)}원`, highlight: true },
      { label: t('result.discountAmount'), value: `${fmt(saved)}원` },
    ];
  };

  const modes: { id: Mode; label: string; icon: string }[] = [
    { id: 'discount', label: t('mode.discount'), icon: '🏷️' },
    { id: 'change', label: t('mode.change'), icon: '📈' },
    { id: 'ratio', label: t('mode.ratio'), icon: '➗' },
    { id: 'reverse', label: t('mode.reverse'), icon: '🔄' },
  ];

  const relatedTools = [
    { href: '/fintech/vat', icon: '🧾', title: t('related.vat') },
    { href: '/fintech/interest', icon: '💰', title: t('related.interest') },
    { href: '/fintech/currency', icon: '💱', title: t('related.currency') },
  ];

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('description')}</p>
      </header>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid',
              borderColor: mode === m.id ? 'var(--primary)' : 'var(--border)',
              background: mode === m.id ? 'var(--primary)' : 'var(--surface)',
              color: mode === m.id ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Calculator panel */}
      <div className="glass-panel" style={{ padding: 'var(--page-padding)', maxWidth: '480px', margin: '0 auto' }}>

        {mode === 'discount' && (
          <>
            <InputField label={t('label.originalPrice')} value={origPrice} onChange={setOrigPrice} suffix="원" />
            <InputField label={t('label.discountRate')} value={discRate} onChange={setDiscRate} suffix="%" />
            <ResultBox results={discountResults()} />
          </>
        )}

        {mode === 'change' && (
          <>
            <InputField label={t('label.oldValue')} value={oldVal} onChange={setOldVal} />
            <InputField label={t('label.newValue')} value={newVal} onChange={setNewVal} />
            <ResultBox results={changeResults()} />
          </>
        )}

        {mode === 'ratio' && (
          <>
            <InputField label={t('label.part')} value={part} onChange={setPart} />
            <InputField label={t('label.total')} value={total} onChange={setTotal} />
            <ResultBox results={ratioResults()} />
          </>
        )}

        {mode === 'reverse' && (
          <>
            <InputField label={t('label.finalPrice')} value={finalPrice} onChange={setFinalPrice} suffix="원" />
            <InputField label={t('label.appliedRate')} value={appliedRate} onChange={setAppliedRate} suffix="%" />
            <ResultBox results={reverseResults()} />
          </>
        )}
      </div>

      {/* Related tools */}
      <div style={{ maxWidth: '480px', margin: '2rem auto 0' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          {t('related.title')}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {relatedTools.map(tool => (
            <Link key={tool.href} href={tool.href as any} style={{ textDecoration: 'none' }}>
              <div style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {tool.icon} {tool.title}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Ad placeholder */}
      <div style={{ maxWidth: '480px', margin: '1.5rem auto 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '300px', height: '250px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📢</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>광고 영역</span>
          <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>300 × 250</span>
        </div>
      </div>

      <SeoSection
        ko={{
          title: '퍼센트 계산기란 무엇인가요?',
          description: '퍼센트 계산기는 할인율 계산, 증감률 계산, 비율 계산, 역산(원래 가격 추정) 등 일상에서 자주 쓰이는 퍼센트 관련 계산을 즉시 처리해주는 도구입니다. 쇼핑 할인 금액 확인, 주가 등락률 분석, 세율 계산 등 다양한 상황에서 활용할 수 있습니다.',
          useCases: [
            { icon: '🏷️', title: '쇼핑 할인 계산', desc: '원가와 할인율을 입력하면 실제 할인 금액과 최종 결제 금액을 즉시 계산합니다.' },
            { icon: '📊', title: '주가·매출 증감률', desc: '이전 값과 현재 값을 입력하면 증가율 또는 감소율을 자동으로 계산합니다.' },
            { icon: '➗', title: '비율·점유율 계산', desc: '부분과 전체 값을 입력해 백분율로 환산합니다. 시험 점수, 시장 점유율 등에 활용하세요.' },
            { icon: '🔄', title: '할인 전 원가 역산', desc: '할인된 가격과 할인율을 알고 있을 때 원래 가격을 역으로 계산합니다.' },
          ],
          steps: [
            { step: '계산 유형 선택', desc: '할인율, 증감률, 비율, 역산 중 필요한 계산 유형을 선택합니다.' },
            { step: '값 입력', desc: '원가, 할인율 등 필요한 값을 입력합니다.' },
            { step: '결과 확인', desc: '입력과 동시에 결과가 즉시 표시됩니다.' },
          ],
          faqs: [
            { q: '30% 할인된 가격이 70,000원일 때 원가는?', a: '역산 모드에서 최종가격 70,000원, 할인율 30%를 입력하면 원가 100,000원을 바로 계산해줍니다.' },
            { q: '증감률이 음수로 나와요', a: '새 값이 이전 값보다 작으면 감소율로 음수가 표시됩니다. 정상적인 결과입니다.' },
            { q: '소수점 몇 자리까지 지원하나요?', a: '소수점 두 자리까지 표시하며, 내부 계산은 부동소수점 정밀도로 처리됩니다.' },
          ],
        }}
        en={{
          title: 'What is a Percentage Calculator?',
          description: 'A percentage calculator instantly handles common percent-related math: discount calculation, rate of change, ratio/proportion, and reverse calculation (finding the original price). It is useful for shopping discounts, stock price analysis, tax calculations, and more.',
          useCases: [
            { icon: '🏷️', title: 'Shopping Discounts', desc: 'Enter the original price and discount rate to instantly calculate the discount amount and final price.' },
            { icon: '📊', title: 'Stock & Revenue Change', desc: 'Input old and new values to automatically calculate the percentage increase or decrease.' },
            { icon: '➗', title: 'Ratio & Market Share', desc: 'Convert a part and a whole into a percentage. Great for exam scores, market share, and more.' },
            { icon: '🔄', title: 'Reverse Discount', desc: 'Know the discounted price and the rate? Work backwards to find the original price.' },
          ],
          steps: [
            { step: 'Select Calculation Type', desc: 'Choose from discount, rate of change, ratio, or reverse calculation.' },
            { step: 'Enter Values', desc: 'Fill in the required fields such as original price and discount rate.' },
            { step: 'View Results', desc: 'Results appear instantly as you type — no submit button needed.' },
          ],
          faqs: [
            { q: 'The discounted price is ₩70,000 at 30% off. What was the original?', a: 'Switch to Reverse mode, enter ₩70,000 as the final price and 30% as the rate — the calculator will show ₩100,000 instantly.' },
            { q: 'Why is the rate of change negative?', a: 'A negative result means the new value is lower than the old one (a decrease). That is the correct behavior.' },
            { q: 'How many decimal places are supported?', a: 'Results are displayed to two decimal places. Internal calculations use full floating-point precision.' },
          ],
        }}
      />
    </div>
  );
}
