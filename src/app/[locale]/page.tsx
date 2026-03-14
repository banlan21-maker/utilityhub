import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';
import styles from './page.module.css';
import {routing} from '@/i18n/routing';

export default function HomePage() {
  const t = useTranslations('Index');
  const catT = useTranslations('Categories');

  const categories = [
    { id: 'performance', name: catT('performance'), icon: '🚀', color: '#ff4757' },
    { id: 'pdf', name: catT('pdf'), icon: '📄', color: '#2ed573' },
    { id: 'fintech', name: catT('fintech'), icon: '💳', color: '#1e90ff' },
    { id: 'productivity', name: catT('productivity'), icon: '⚡', color: '#ffa502' },
    { id: 'ux', name: catT('ux'), icon: '✨', color: '#ff6b81' },
    { id: 'ai', name: catT('ai'), icon: '🤖', color: '#a4b0be' },
    { id: 'lifestyle', name: catT('lifestyle'), icon: '🌿', color: '#26de81' },
    { id: 'security', name: catT('security'), icon: '🛡️', color: '#4b7bec' },
    { id: 'utilities', name: catT('utilities'), icon: '🛠️', color: '#3742fa' },
  ];

  return (
    <div>
      <header className={`${styles.hero} animate-fade-in`} style={{ padding: '2rem 0', marginBottom: 'var(--section-gap)' }}>
        <h1 className={styles.title}>
          {t('title')}
        </h1>
        <p className={styles.description}>
          {t('description')}
        </p>
      </header>

      <div className={styles.grid}>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/${category.id}` as any} // Path configured in next-intl routing
            className={`${styles.card} glass-panel`}
            style={{ '--glow-color': category.color } as React.CSSProperties}
          >
            <span className={styles.icon}>{category.icon}</span>
            <h2>{category.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
