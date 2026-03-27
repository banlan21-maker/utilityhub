'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { 
  Plus, 
  Minus, 
  Receipt, 
  ShoppingBag, 
  Wallet, 
  Sparkles, 
  ArrowRight,
  Calculator,
  Info,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Package
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './vat.module.css';

type Mode = 'add' | 'extract';

const VAT_PRESETS = [10, 5, 7, 8, 15, 20];

export default function VatPage() {
  const t = useTranslations('Vat');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [mode, setMode] = useState<Mode>('add');
  const [amount, setAmount] = useState('');
  const [vatRate, setVatRate] = useState('10');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const fmt = (n: number) => Math.round(n).toLocaleString(isKo ? 'ko-KR' : 'en-US');

  const val = parseFloat(amount) || 0;
  const rate = parseFloat(vatRate) || 0;

  // add mode: supply amount → total
  const vatAmount = val * (rate / 100);
  const totalAmount = val + vatAmount;

  // extract mode: total → supply amount
  const supplyAmount = val / (1 + rate / 100);
  const extractedVat = val - supplyAmount;

  if (!isClient) return null;

  return (
    <div className={s.vat_container}>
      <NavigationActions />
      <header className={s.vat_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Receipt size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.vat_title}>{t('title')}</h1>
        <p className={s.vat_subtitle}>{t('description')}</p>
      </header>

      <section className={s.vat_panel}>
        {/* Mode Selector */}
        <div className={s.vat_mode_tabs}>
          <button 
            className={`${s.vat_mode_btn} ${mode === 'add' ? s.vat_mode_btn_active : ''}`}
            onClick={() => setMode('add')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Plus size={16} />
              {t('mode.add')}
            </div>
          </button>
          <button 
            className={`${s.vat_mode_btn} ${mode === 'extract' ? s.vat_mode_btn_active : ''}`}
            onClick={() => setMode('extract')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Minus size={16} />
              {t('mode.extract')}
            </div>
          </button>
        </div>

        {/* VAT Rate Input */}
        <div className={s.vat_input_group}>
          <label className={s.vat_label}>{t('label.vatRate')}</label>
          <div className={s.vat_presets}>
            {VAT_PRESETS.map(p => (
              <button 
                key={p} 
                className={`${s.vat_preset_btn} ${vatRate === String(p) ? s.vat_preset_btn_active : ''}`}
                onClick={() => setVatRate(String(p))}
              >
                {p}%
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <input 
              className={s.vat_input} 
              value={vatRate} 
              onChange={e => setVatRate(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="10"
              style={{ fontSize: '1.1rem', padding: '0.75rem 1rem' }}
            />
            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#94a3b8' }}>%</span>
          </div>
        </div>

        {/* Amount Input */}
        <div className={s.vat_input_group}>
          <label className={s.vat_label}>{mode === 'add' ? t('label.supplyAmount') : t('label.totalAmount')}</label>
          <div style={{ position: 'relative' }}>
            <input 
              className={s.vat_input} 
              value={amount} 
              onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0"
            />
            <span style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#94a3b8' }}>{isKo ? '원' : ''}</span>
          </div>
        </div>

        {/* Results Area */}
        {val > 0 && (
          <div className={s.vat_result_card} style={{ animation: 'bounceIn 0.5s ease-out' }}>
            <div className={s.vat_result_header}>
              <Calculator size={16} />
              {t('result.title')} (VAT {rate}%)
            </div>
            
            <div className={s.vat_result_row}>
              <span className={s.vat_result_label}>{mode === 'add' ? t('result.supplyAmount') : t('result.totalAmount')}</span>
              <span className={s.vat_result_value}>{fmt(val)}{isKo ? '원' : ''}</span>
            </div>

            <div className={s.vat_result_row}>
              <span className={s.vat_result_label}>{mode === 'add' ? `VAT (${rate}%)` : t('result.supplyAmount')}</span>
              <span className={s.vat_result_value}>{mode === 'add' ? fmt(vatAmount) : fmt(supplyAmount)}{isKo ? '원' : ''}</span>
            </div>

            <div className={`${s.vat_result_row} ${s.vat_result_total}`}>
              <span className={`${s.vat_result_label} ${s.vat_total_label}`}>{mode === 'add' ? t('result.totalAmount') : `VAT (${rate}%)`}</span>
              <span className={`${s.vat_result_value} ${s.vat_total_value}`}>{mode === 'add' ? fmt(totalAmount) : fmt(extractedVat)}{isKo ? '원' : ''}</span>
            </div>
          </div>
        )}
      </section>

      {/* Standard Bottom Sections */}
      <div style={{ width: '100%' }}>
        <ShareBar title={t('title')} description={t('description')} />
        <RelatedTools toolId="fintech/vat" />
        <div className={s.vat_ad_placeholder}>{isKo ? '광고 영역' : 'Ad Space'}</div>
        <SeoSection
          ko={{
            title: '부가가치세(VAT) 계산 가이드',
            description: '한국 표준 10%부터 글로벌 세율까지, 한 번의 입력으로 공급가와 부가세를 분리하거나 합산하세요.',
            useCases: [{ icon: '🧾', title: '세금계산서', desc: '공급가액과 세액을 정확히 분리' }],
            steps: [{ step: '1', desc: '계산 방식 선택 (포함/별도)' }],
            faqs: [{ q: '한국 부가세는?', a: '기본적으로 10%가 적용됩니다.' }]
          }}
          en={{
            title: 'Essential VAT Calculation Guide',
            description: 'Easily add or extract VAT regardless of the country rate. Perfect for business invoices and global shopping.',
            useCases: [{ icon: '🛒', title: 'Global Shopping', desc: 'Separate tax for refund calculations' }],
            steps: [{ step: '1', desc: 'Select add/extract mode and enter amount' }],
            faqs: [{ q: 'Standard rate?', a: 'Standard rate varies by country; defaults to 10%.' }]
          }}
        />
      </div>
    </div>
  );
}
