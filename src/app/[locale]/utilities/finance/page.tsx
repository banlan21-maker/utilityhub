import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Wallet } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import CategoryTools from '@/app/components/CategoryTools';
import s from './finance_list.module.css';
import { buildCategoryMetadata } from '@/lib/category-metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildCategoryMetadata(locale, 'finance', 'FinanceBoard');
}

export default async function FinanceDashboardPage({ params }: Props) {
  const { locale } = await params;
  const catT = await getTranslations({ locale, namespace: 'Categories' });
  const boardT = await getTranslations({ locale, namespace: 'FinanceBoard' });

  return (
    <div className={s.fin_list_container}>
      <NavigationActions />
      <ToolHeader icon={<Wallet />} title={catT('finance')} subtitle={boardT('subtitle')} />

      <p className={s.fin_list_subtitle} style={{ maxWidth: '720px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
        {boardT('intro')}
      </p>

      <CategoryTools categorySlug="finance" />
    </div>
  );
}
