import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HardHat } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import CategoryTools from '@/app/components/CategoryTools';
import s from './construction_list.module.css';
import { buildCategoryMetadata } from '@/lib/category-metadata';

// 건설·현장 계산기 목록. 도구 주소는 예전 카테고리 폴더 그대로이고 여기는 화면 분류만 모은다 (tools-registry 의 category).
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildCategoryMetadata(locale, 'construction', 'ConstructionBoard');
}

export default async function ConstructionDashboardPage({ params }: Props) {
  const { locale } = await params;
  const catT = await getTranslations({ locale, namespace: 'Categories' });
  const boardT = await getTranslations({ locale, namespace: 'ConstructionBoard' });

  return (
    <div className={s.container}>
      <NavigationActions />
      <ToolHeader icon={<HardHat />} title={catT('construction')} subtitle={boardT('subtitle')} />

      <p className={s.intro}>{boardT('intro')}</p>

      <CategoryTools categorySlug="construction" />
    </div>
  );
}
