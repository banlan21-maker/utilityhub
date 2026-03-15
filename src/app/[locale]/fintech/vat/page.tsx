'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import { Link } from '@/i18n/routing';

type Mode = 'add' | 'extract';

const VAT_PRESETS = [10, 5, 7, 8, 15, 20];

function InputField({ label, value, onChange, suffix, prefix }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  prefix?: string;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>{prefix}</span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
          style={{
            width: '100%',
            padding: `0.8rem ${suffix ? '3rem' : '1rem'} 0.8rem ${prefix ? '2rem' : '1rem'}`,
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
          <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

export default function VatPage() {
  const t = useTranslations('Vat');
  const [mode, setMode] = useState<Mode>('add');
  const [amount, setAmount] = useState('');
  const [vatRate, setVatRate] = useState('10');

  const fmt = (n: number) => Math.round(n).toLocaleString('ko-KR');

  const val = parseFloat(amount) || 0;
  const rate = parseFloat(vatRate) || 0;

  // add mode: supply amount → total
  const vatAmount = val * (rate / 100);
  const totalAmount = val + vatAmount;

  // extract mode: total → supply amount
  const supplyAmount = val / (1 + rate / 100);
  const extractedVat = val - supplyAmount;

  const relatedTools = [
    { href: '/fintech/percent', icon: '🔢', title: t('related.percent') },
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

      <div className="glass-panel" style={{ padding: 'var(--page-padding)', maxWidth: '480px', margin: '0 auto' }}>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '1.5rem' }}>
          {(['add', 'extract'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                border: 'none',
                background: mode === m ? 'var(--primary)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {m === 'add' ? `➕ ${t('mode.add')}` : `➖ ${t('mode.extract')}`}
            </button>
          ))}
        </div>

        {/* VAT rate selector */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('label.vatRate')}
          </label>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            {VAT_PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setVatRate(String(p))}
                style={{
                  padding: '0.3rem 0.7rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid',
                  borderColor: vatRate === String(p) ? 'var(--primary)' : 'var(--border)',
                  background: vatRate === String(p) ? 'rgba(79,70,229,0.1)' : 'var(--surface)',
                  color: vatRate === String(p) ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {p}%
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              inputMode="decimal"
              value={vatRate}
              onChange={e => setVatRate(e.target.value.replace(/[^0-9.]/g, ''))}
              style={{ width: '100%', padding: '0.7rem 2.5rem 0.7rem 1rem', fontSize: '1rem', fontWeight: 600, border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>%</span>
          </div>
        </div>

        <InputField
          label={mode === 'add' ? t('label.supplyAmount') : t('label.totalAmount')}
          value={amount}
          onChange={setAmount}
          suffix="원"
        />

        {/* Result */}
        {val > 0 && (
          <div style={{ marginTop: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: 'var(--primary)', padding: '0.75rem 1.25rem' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                {t('result.title')} (VAT {rate}%)
              </span>
            </div>

            {mode === 'add' ? (
              <div style={{ background: 'var(--surface)' }}>
                <Row label={t('result.supplyAmount')} value={`${fmt(val)}원`} />
                <Row label={`VAT (${rate}%)`} value={`${fmt(vatAmount)}원`} accent />
                <Row label={t('result.totalAmount')} value={`${fmt(totalAmount)}원`} highlight />
              </div>
            ) : (
              <div style={{ background: 'var(--surface)' }}>
                <Row label={t('result.totalAmount')} value={`${fmt(val)}원`} />
                <Row label={t('result.supplyAmount')} value={`${fmt(supplyAmount)}원`} accent />
                <Row label={`VAT (${rate}%)`} value={`${fmt(extractedVat)}원`} highlight />
              </div>
            )}
          </div>
        )}

        {/* Formula note */}
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          {mode === 'add'
            ? t('formula.add', { rate })
            : t('formula.extract', { rate })}
        </p>
      </div>

      {/* Related tools */}
      <div style={{ maxWidth: '480px', margin: '2rem auto 0' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          {t('related.title')}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {relatedTools.map(tool => (
            <Link key={tool.href} href={tool.href as any} style={{ textDecoration: 'none' }}>
              <div
                style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
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
          title: '부가세(VAT) 계산기란 무엇인가요?',
          description: '부가세 계산기는 공급가액에 부가가치세(VAT)를 더해 총 결제 금액을 계산하거나, 부가세가 포함된 금액에서 공급가액과 세액을 분리해주는 도구입니다. 사업자 세금 계산서 발행, 세금신고, 가격 책정, 해외 구매 등에서 필수적으로 활용됩니다. 한국 표준 10%는 물론 5%, 7%, 15%, 20% 등 해외 VAT 세율도 지원합니다.',
          useCases: [
            { icon: '🧾', title: '세금계산서 발행', desc: '공급가액을 입력하면 부가세와 총액을 즉시 계산해 세금계산서 작성 시간을 줄여줍니다.' },
            { icon: '🏪', title: '가격 책정', desc: '소비자가 내야 할 최종 금액과 실제 매출액(공급가액)을 명확히 분리해 가격을 정확하게 책정합니다.' },
            { icon: '🌐', title: '해외 VAT 계산', desc: '유럽(20%), 일본(10%), 싱가포르(9%) 등 다양한 국가의 VAT 세율을 직접 입력해 계산합니다.' },
            { icon: '📋', title: '세금 신고 준비', desc: '매입·매출 부가세를 정확히 분리하여 종합소득세, 법인세 신고 준비를 도와줍니다.' },
          ],
          steps: [
            { step: '계산 방향 선택', desc: '공급가액 → 총액(VAT 추가) 또는 총액 → 공급가액(VAT 분리) 중 선택합니다.' },
            { step: 'VAT 세율 입력', desc: '한국 표준 10%를 포함한 프리셋 또는 직접 입력으로 세율을 설정합니다.' },
            { step: '금액 입력 후 결과 확인', desc: '금액을 입력하면 공급가액, 부가세, 합계 금액이 즉시 표시됩니다.' },
          ],
          faqs: [
            { q: '부가세 포함 가격에서 공급가액을 구하려면?', a: '\'VAT 분리\' 모드를 선택하고 부가세 포함 총액을 입력하면 공급가액과 부가세가 자동으로 분리됩니다.' },
            { q: '한국 부가세율은 몇 %인가요?', a: '대한민국 표준 부가가치세율은 10%입니다. 일부 품목(농산물 등)은 면세 또는 0%가 적용될 수 있습니다.' },
            { q: '해외 구매 시 VAT 환급을 받으려면?', a: '여행자 VAT 환급(Tax Refund)은 구매 금액에서 VAT를 분리해야 합니다. \'VAT 분리\' 모드와 해당 국가의 세율을 입력하세요.' },
          ],
        }}
        en={{
          title: 'What is a VAT Calculator?',
          description: 'A VAT calculator helps you add value-added tax to a supply amount to get the total price, or separate the VAT from a tax-inclusive total to find the net supply amount and tax. It is essential for issuing invoices, filing tax returns, setting prices, and calculating foreign VAT. Supports standard Korean 10% as well as 5%, 7%, 15%, 20%, and custom rates.',
          useCases: [
            { icon: '🧾', title: 'Invoice Issuance', desc: 'Enter the supply amount to instantly calculate VAT and the total, saving time when preparing tax invoices.' },
            { icon: '🏪', title: 'Pricing', desc: 'Clearly separate the consumer-facing total price from the net revenue (supply amount) for accurate pricing decisions.' },
            { icon: '🌐', title: 'Foreign VAT', desc: 'Calculate VAT for various countries such as Europe (20%), Japan (10%), or Singapore (9%) by entering the rate manually.' },
            { icon: '📋', title: 'Tax Return Prep', desc: 'Accurately separate input and output VAT to simplify preparation for income tax and corporate tax filings.' },
          ],
          steps: [
            { step: 'Choose Direction', desc: 'Select whether to add VAT to a supply amount, or extract VAT from a tax-inclusive total.' },
            { step: 'Set VAT Rate', desc: 'Pick from presets including the Korean standard 10%, or enter any custom rate.' },
            { step: 'Enter Amount & View Results', desc: 'Type in the amount and see the supply price, VAT, and total instantly.' },
          ],
          faqs: [
            { q: 'How do I find the supply amount from a VAT-inclusive price?', a: 'Switch to "Extract VAT" mode and enter the total price. The calculator will automatically show the net supply amount and the VAT portion.' },
            { q: 'What is the standard VAT rate in South Korea?', a: 'The standard VAT rate in South Korea is 10%. Some items (e.g., agricultural products) may be exempt or zero-rated.' },
            { q: 'How do I calculate a VAT refund for overseas shopping?', a: 'Use "Extract VAT" mode with the VAT rate of the country where you shopped. The result shows how much VAT was included in your purchase.' },
          ],
        }}
      />
    </div>
  );
}

function Row({ label, value, highlight, accent }: { label: string; value: string; highlight?: boolean; accent?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.9rem 1.25rem',
      borderBottom: '1px solid var(--border)',
      background: highlight ? 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(16,185,129,0.08))' : 'transparent',
    }}>
      <span style={{ fontSize: '0.9rem', color: accent ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: accent ? 600 : 400 }}>{label}</span>
      <span style={{ fontSize: highlight ? '1.4rem' : '1rem', fontWeight: highlight ? 800 : 600, color: highlight ? 'var(--primary)' : accent ? 'var(--primary)' : 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  );
}
