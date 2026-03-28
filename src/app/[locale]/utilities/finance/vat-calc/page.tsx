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
            title: '부가가치세(VAT) 계산기란 무엇인가요?',
            description: '부가가치세(Value Added Tax, VAT)는 상품이나 서비스 거래 시 발생하는 부가가치에 부과되는 세금입니다. 한국에서는 기본적으로 10%가 적용되며, 전 세계적으로 국가마다 5%에서 27%까지 다양한 세율이 존재합니다. 이 도구는 공급가액과 부가세를 즉시 계산하여 세금계산서 발행, 해외 쇼핑 환급 신청, 사업자 회계 정리 등 다양한 상황에서 정확한 금액을 산출할 수 있도록 돕습니다. 특히 프리랜서, 개인사업자, 회계 담당자, 글로벌 이커머스 종사자에게 필수적인 도구로, 복잡한 수식 없이 클릭 몇 번으로 세전/세후 금액을 분리하거나 합산할 수 있어 업무 효율을 크게 향상시킵니다.',
            useCases: [
              { icon: '🧾', title: '세금계산서 발행', desc: '공급가액과 세액을 정확히 분리하여 전자세금계산서 발행 시 필수 정보를 즉시 확인할 수 있습니다.' },
              { icon: '🛒', title: '해외 직구 환급', desc: '면세점이나 해외 쇼핑 시 부가세를 미리 계산하여 공항 환급 금액을 예측하고 계획할 수 있습니다.' },
              { icon: '💼', title: '견적서 작성', desc: '클라이언트에게 견적 제시 시 부가세 포함/제외 금액을 동시에 제공하여 투명한 거래를 유도합니다.' },
              { icon: '📊', title: '회계 정리', desc: '월말 결산 시 매출/매입 부가세를 신속하게 분리하여 장부 정리 시간을 단축할 수 있습니다.' }
            ],
            steps: [
              { step: '계산 모드 선택', desc: '부가세 포함(공급가 → 총액) 또는 부가세 별도(총액 → 공급가) 모드 중 상황에 맞게 선택합니다.' },
              { step: '세율 설정', desc: '한국 기본 10% 또는 프리셋 버튼(5%, 7%, 8%, 15%, 20%)을 사용하거나 직접 입력하여 국가별 세율을 적용합니다.' },
              { step: '금액 입력', desc: '공급가액 또는 총 결제금액을 숫자로 입력하면 실시간으로 계산 결과가 화면에 표시됩니다.' },
              { step: '결과 확인 및 활용', desc: '공급가액, 부가세액, 총액이 명확히 구분된 결과표를 확인하고 필요 시 스크린샷 또는 메모로 저장합니다.' }
            ],
            faqs: [
              { q: '한국의 부가가치세율은 얼마인가요?', a: '대한민국의 표준 부가가치세율은 10%입니다. 일부 면세 품목(미가공 식료품, 의료서비스 등)을 제외한 대부분의 상품과 서비스에 적용됩니다.' },
              { q: '부가세 포함 금액에서 공급가를 역산하려면?', a: '"부가세 별도(역산)" 모드를 선택한 후 총 결제금액을 입력하면, 자동으로 공급가액과 부가세액이 분리되어 표시됩니다. 예: 110,000원 입력 → 공급가 100,000원 + 부가세 10,000원' },
              { q: '해외 국가별 부가세율은 어떻게 적용하나요?', a: '세율 입력창에 직접 숫자를 입력하거나 프리셋 버튼을 활용하세요. 예: 일본 10%, 중국 13%, EU 평균 20%, 싱가포르 8% 등 각국 세율을 자유롭게 설정 가능합니다.' },
              { q: '이 계산기는 법적 효력이 있나요?', a: '본 도구는 참고용 계산 도구로, 실제 세금 신고나 법적 문서 작성 시에는 반드시 세무사 또는 회계 전문가의 검토를 받으시기 바랍니다.' }
            ]
          }}
          en={{
            title: 'What is a VAT Calculator?',
            description: 'A VAT (Value Added Tax) calculator is an essential financial tool that helps individuals and businesses quickly compute tax amounts on goods and services. VAT rates vary globally, ranging from 5% to 27%, with most countries applying a standard rate between 15-25%. This calculator enables you to either add VAT to a base price or extract VAT from a total amount, making it indispensable for invoice generation, international shopping refunds, accounting reconciliation, and price transparency. Whether you\'re a freelancer issuing invoices, an e-commerce seller managing cross-border transactions, or a traveler claiming tax refunds at airports, this tool eliminates manual calculation errors and saves valuable time by instantly breaking down supply price, tax amount, and total cost.',
            useCases: [
              { icon: '🛒', title: 'Global Shopping Refunds', desc: 'Calculate exact VAT amounts when shopping abroad to predict airport tax refund values and plan your budget accordingly.' },
              { icon: '📄', title: 'Invoice Generation', desc: 'Separate base price and VAT clearly on invoices for clients, ensuring compliance with international accounting standards.' },
              { icon: '💳', title: 'E-commerce Pricing', desc: 'Display both VAT-inclusive and VAT-exclusive prices to customers in different regions for transparent cross-border sales.' },
              { icon: '📊', title: 'Accounting & Bookkeeping', desc: 'Quickly reconcile sales and purchase VAT during monthly closings, reducing time spent on manual tax calculations.' }
            ],
            steps: [
              { step: 'Select Calculation Mode', desc: 'Choose "Add VAT" (base price → total) or "Extract VAT" (total → base price) depending on your scenario.' },
              { step: 'Set Tax Rate', desc: 'Use preset buttons (5%, 7%, 8%, 10%, 15%, 20%) for common rates or manually enter your country\'s specific VAT percentage.' },
              { step: 'Enter Amount', desc: 'Input the base price or total payment amount, and the calculator will instantly display the breakdown in real-time.' },
              { step: 'Review and Use Results', desc: 'Check the detailed breakdown showing base amount, VAT amount, and total. Take a screenshot or note down for invoices or records.' }
            ],
            faqs: [
              { q: 'What is the standard VAT rate in most countries?', a: 'The standard VAT rate varies by country: UK (20%), Germany (19%), France (20%), Japan (10%), Singapore (8%), and South Korea (10%). The EU average is around 21%.' },
              { q: 'How do I extract VAT from a total price?', a: 'Select "Extract VAT" mode and enter the total amount. The tool will automatically reverse-calculate the base price and VAT component using the formula: Base = Total / (1 + Rate).' },
              { q: 'Can I use this for tax filing purposes?', a: 'This calculator provides estimates for reference only. For official tax filing, consult a certified accountant or tax professional to ensure compliance with local regulations.' },
              { q: 'Does this tool support multiple currencies?', a: 'Yes, the calculator works with any currency. Simply enter the amount in your desired currency (USD, EUR, KRW, etc.) and the percentage-based calculation will apply universally.' }
            ]
          }}
        />
      </div>
    </div>
  );
}
