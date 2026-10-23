import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { FileText } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import CategoryTools from '@/app/components/CategoryTools';
import s from '../finance/finance_list.module.css';
import { buildCategoryMetadata } from '@/lib/category-metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildCategoryMetadata(locale, 'document', 'DocumentBoard');
}

export default async function DocumentDashboardPage({ params }: Props) {
  const { locale } = await params;
  const catT = await getTranslations({ locale, namespace: 'Categories' });
  const boardT = await getTranslations({ locale, namespace: 'DocumentBoard' });

  return (
    <div className={s.fin_list_container}>
      <NavigationActions />
      <header className={s.fin_list_header}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <FileText size={48} color="#8b5cf6" />
        </div>
        <h1 className={s.fin_list_title}>{catT('document')}</h1>
        <p className={s.fin_list_subtitle}>{boardT('subtitle')}</p>
      </header>

      <p className={s.fin_list_subtitle} style={{ maxWidth: '720px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
        {boardT('intro')}
      </p>

      <CategoryTools categorySlug="document" />
    </div>
  );
}
