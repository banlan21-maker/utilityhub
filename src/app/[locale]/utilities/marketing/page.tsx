import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Megaphone } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import CategoryTools from '@/app/components/CategoryTools';
import s from './marketing_list.module.css';
import { buildCategoryMetadata } from '@/lib/category-metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildCategoryMetadata(locale, 'marketing', 'MarketingBoard');
}

export default async function MarketingDashboardPage({ params }: Props) {
  const { locale } = await params;
  const catT = await getTranslations({ locale, namespace: 'Categories' });
  const boardT = await getTranslations({ locale, namespace: 'MarketingBoard' });

  return (
    <div className={s.marketing_list_container}>
      <NavigationActions />
      <ToolHeader icon={<Megaphone />} title={catT('marketing')} subtitle={boardT('subtitle')} />

      <p className={s.marketing_list_subtitle} style={{ maxWidth: '720px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
        {boardT('intro')}
      </p>

      <CategoryTools categorySlug="marketing" />
    </div>
  );
}
