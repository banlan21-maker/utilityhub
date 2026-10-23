import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { tools } from '@/lib/tools-registry';
import s from './ToolDirectory.module.css';

const CATEGORY_ORDER = [
  'finance', 'productivity', 'document', 'utility', 'lifestyle',
  'design', 'marketing', 'security', 'dev', 'performance',
] as const;

/**
 * 홈 하단 "전체 도구" 디렉터리 (서버 컴포넌트).
 * 모든 툴 상세 페이지로 가는 <a href>를 raw HTML에 출력해
 * 크롤러가 사이트맵 없이도 툴 페이지를 발견할 수 있게 한다.
 */
export default async function ToolDirectory({ locale }: { locale: string }) {
  const catT = await getTranslations({ locale, namespace: 'Categories' });
  const isKo = locale === 'ko';

  return (
    <section className={s.directory} aria-labelledby="all-tools-title">
      <h2 id="all-tools-title" className={s.title}>
        {isKo ? '전체 도구 목록' : 'All Tools'}
      </h2>
      <div className={s.grid}>
        {CATEGORY_ORDER.map(cat => {
          const list = tools.filter(t => t.category === cat && t.available);
          if (!list.length) return null;
          return (
            <div key={cat} className={s.group}>
              <h3 className={s.groupTitle}>
                <Link href={`/utilities/${cat}` as any}>{catT(cat)}</Link>
              </h3>
              <ul className={s.list}>
                {list.map(tool => (
                  <li key={tool.slug}>
                    <Link href={tool.href as any} className={s.link}>
                      {isKo ? (tool.nameKo ?? tool.slug) : (tool.nameEn ?? tool.slug)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
