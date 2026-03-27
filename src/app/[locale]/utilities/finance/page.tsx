'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import NavigationActions from '@/app/components/NavigationActions';

export default function FinanceDashboardPage() {
  const catT = useTranslations('Categories');
  const boardT = useTranslations('FinanceBoard');

  const tools = [
    {
      id: 'utilities/finance/percentage-calc',
      title: boardT('percentage-calc.title'),
      desc: boardT('percentage-calc.desc'),
      icon: '🔢',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    },
    {
      id: 'utilities/finance/exchange-rate',
      title: boardT('exchange-rate.title'),
      desc: boardT('exchange-rate.desc'),
      icon: '💱',
      gradient: 'linear-gradient(135deg, #1e90ff 0%, #0056b3 100%)',
    },
    {
      id: 'utilities/finance/coin-profit',
      title: boardT('coin-profit.title'),
      desc: boardT('coin-profit.desc'),
      icon: '🪙',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    },
    {
      id: 'utilities/finance/vat-calc',
      title: boardT('vat-calc.title'),
      desc: boardT('vat-calc.desc'),
      icon: '🧾',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    },
    {
      id: 'utilities/finance/interest-calc',
      title: boardT('interest-calc.title'),
      desc: boardT('interest-calc.desc'),
      icon: '💰',
      gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    },
    {
      id: 'utilities/finance/tax-33-calc',
      title: boardT('tax-33-calc.title'),
      desc: boardT('tax-33-calc.desc'),
      icon: '🧾',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    },
    {
      id: 'utilities/finance/salary-calc',
      title: boardT('salary-calc.title'),
      desc: boardT('salary-calc.desc'),
      icon: '💵',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    },
  ];

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
          {catT('finance')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {boardT('subtitle')}
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {tools.map(tool => (
          <Link key={tool.id} href={`/${tool.id}` as any} style={{ textDecoration: 'none' }}>
            <div
              className="glass-panel"
              style={{
                padding: '2rem', height: '100%',
                display: 'flex', flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer', overflow: 'hidden',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            >
              <div style={{
                background: tool.gradient,
                width: '60px', height: '60px',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', marginBottom: '1.5rem',
                boxShadow: 'var(--shadow-md)',
              }}>
                {tool.icon}
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                {tool.title}
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {tool.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
