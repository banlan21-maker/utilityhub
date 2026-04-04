'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  ArrowRight,
  Wallet,
  Receipt,
  Coins,
  TrendingUp,
  Calculator,
  CreditCard,
  Building2,
  Briefcase,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  History,
  Activity,
  ArrowUpRight,
  DollarSign,
  PieChart
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import s from './finance_list.module.css';

export default function FinanceDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('FinanceBoard');
  const locale = useLocale();
  const isKo = locale === 'ko';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const tools = [
    {
      id: 'utilities/finance/percentage-calc',
      title: boardT('percentage-calc.title'),
      desc: boardT('percentage-calc.desc'),
      icon: <Calculator size={36} color="#8b5cf6" />,
      gradient: 'rgba(139, 92, 246, 0.08)',
    },
    {
      id: 'utilities/finance/exchange-rate',
      title: boardT('exchange-rate.title'),
      desc: boardT('exchange-rate.desc'),
      icon: <ArrowUpRight size={36} color="#3b82f6" />,
      gradient: 'rgba(59, 130, 246, 0.08)',
    },
    {
      id: 'utilities/finance/coin-profit',
      title: boardT('coin-profit.title'),
      desc: boardT('coin-profit.desc'),
      icon: <Coins size={36} color="#f59e0b" />,
      gradient: 'rgba(245, 158, 11, 0.08)',
    },
    {
      id: 'utilities/finance/vat-calc',
      title: boardT('vat-calc.title'),
      desc: boardT('vat-calc.desc'),
      icon: <Receipt size={36} color="#10b981" />,
      gradient: 'rgba(16, 185, 129, 0.08)',
    },
    {
      id: 'utilities/finance/interest-calc',
      title: boardT('interest-calc.title'),
      desc: boardT('interest-calc.desc'),
      icon: <TrendingUp size={36} color="#f43f5e" />,
      gradient: 'rgba(244, 63, 94, 0.08)',
    },
    {
      id: 'utilities/finance/tax-33-calc',
      title: boardT('tax-33-calc.title'),
      desc: boardT('tax-33-calc.desc'),
      icon: <ShieldCheck size={36} color="#ef4444" />,
      gradient: 'rgba(239, 68, 68, 0.08)',
    },
    {
      id: 'utilities/finance/salary-calc',
      title: boardT('salary-calc.title'),
      desc: boardT('salary-calc.desc'),
      icon: <Briefcase size={36} color="#ea580c" />,
      gradient: 'rgba(234, 88, 12, 0.08)',
    },
    {
      id: 'utilities/finance/smart-percent',
      title: boardT('smart-percent.title'),
      desc: boardT('smart-percent.desc'),
      icon: <PieChart size={36} color="#8b5cf6" />,
      gradient: 'rgba(139, 92, 246, 0.08)',
    },
    {
      id: 'utilities/finance/freelance-rate-calculator',
      title: boardT('freelance-rate-calculator.title'),
      desc: boardT('freelance-rate-calculator.desc'),
      icon: <Sparkles size={36} color="#065f46" />,
      gradient: 'rgba(6, 95, 70, 0.08)',
    },
  ];

  if (!isClient) return null;

  return (
    <div className={s.fin_list_container}>
      <NavigationActions />
      <header className={s.fin_list_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <Wallet size={48} color="#8b5cf6" />
        </div>
        <h1 className={s.fin_list_title}>{catT('finance')}</h1>
        <p className={s.fin_list_subtitle}>{boardT('subtitle')}</p>
      </header>

      <div className={s.fin_grid}>
        {tools.map(tool => (
          <Link key={tool.id} href={`/${tool.id}` as any} style={{ textDecoration: 'none' }}>
            <div className={s.fin_card}>
              <div className={s.fin_icon_wrap} style={{ background: tool.gradient }}>
                {tool.icon}
              </div>
              <h2 className={s.fin_card_title}>{tool.title}</h2>
              <p className={s.fin_card_desc}>{tool.desc}</p>
              <div className={s.fin_arrow}>
                {isKo ? '계산하러 가기' : 'Calculate Now'}
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
