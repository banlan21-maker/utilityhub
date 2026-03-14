import {useTranslations} from 'next-intl';

export default function AIPage() {
  const t = useTranslations('Categories');

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
        {t('ai')}
      </h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        AI 지원, 글쓰기, 및 마케팅/디자인 자동화 도구입니다.
      </p>
      <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
        <h2>준비 중 (Coming Soon)</h2>
      </div>
    </div>
  );
}
