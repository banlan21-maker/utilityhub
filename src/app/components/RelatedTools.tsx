'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getRelatedTools } from '@/config/tool-relations';

interface RelatedToolsProps {
  toolId: string;
  /** Number of cards to show (default 3) */
  limit?: number;
}

export default function RelatedTools({ toolId, limit = 3 }: RelatedToolsProps) {
  const locale = useLocale();
  const tools = getRelatedTools(toolId, limit);

  if (!tools.length) return null;

  const label = locale === 'ko' ? '추천 도구' : 'Related Tools';

  return (
    <section style={{ maxWidth: '640px', margin: '2.5rem auto 0' }}>
      <p style={{
        fontSize: '0.78rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        marginBottom: '0.75rem',
      }}>
        {label}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(tools.length, 3)}, 1fr)`,
        gap: '0.75rem',
      }}>
        {tools.map(tool => (
          <Link
            key={tool.id}
            href={`/${tool.id}` as any}
            style={{ textDecoration: 'none' }}
          >
            <div
              className="glass-panel"
              style={{
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '0.4rem',
                cursor: 'pointer',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                height: '100%',
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{tool.icon}</span>
              <span style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.35,
              }}>
                {locale === 'ko' ? tool.ko : tool.en}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
