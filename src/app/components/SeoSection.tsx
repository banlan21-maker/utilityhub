'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';

export interface FaqItem {
  q: string;
  a: string;
}

export interface SeoContent {
  title: string;
  description: string;
  useCases: { icon: string; title: string; desc: string }[];
  steps: { step: string; desc: string }[];
  faqs: FaqItem[];
}

export interface SeoSectionProps {
  ko: SeoContent;
  en: SeoContent;
}

export default function SeoSection({ ko, en }: SeoSectionProps) {
  const locale = useLocale();
  const c = locale === 'ko' ? ko : en;
  const isKo = locale === 'ko';

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const h2Style: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1e293b',
    marginTop: '3rem',
    marginBottom: '1.5rem',
    borderLeft: '4px solid #8b5cf6',
    paddingLeft: '0.75rem',
  };

  const pStyle: React.CSSProperties = {
    color: '#475569',
    lineHeight: 1.8,
    fontSize: '0.95rem',
    margin: 0,
    marginBottom: '1rem',
  };

  return (
    <section style={{
      marginTop: '4rem',
      maxWidth: '896px',
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingLeft: '1rem',
      paddingRight: '1rem',
    }}>
      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: '2rem' }} />

      {/* 1. What is it */}
      <div>
        <h2 style={h2Style}>{c.title}</h2>
        <p style={pStyle}>{c.description}</p>
      </div>

      {/* 2. Use cases */}
      <div>
        <h2 style={h2Style}>{isKo ? '주요 활용 사례' : 'Common Use Cases'}</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, 1fr)',
          gap: '1rem',
        }}
        className="md:grid-cols-2 lg:grid-cols-4">
          {c.useCases.map((uc, i) => (
            <div
              key={i}
              style={{
                padding: '1.5rem',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '1rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(139, 92, 246, 0.15)';
                e.currentTarget.style.borderColor = '#c4b5fd';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{uc.icon}</div>
              <div style={{
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: '0.5rem',
                fontSize: '0.95rem',
              }}>{uc.title}</div>
              <div style={{
                color: '#64748b',
                fontSize: '0.85rem',
                lineHeight: 1.6,
              }}>{uc.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. How to use */}
      <div>
        <h2 style={h2Style}>{isKo ? '사용 방법' : 'How to Use'}</h2>
        <ol style={{
          paddingLeft: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {c.steps.map((s, i) => (
            <li key={i} style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              padding: '1rem',
              background: '#fafafa',
              borderRadius: '0.75rem',
              border: '1px solid #f1f5f9',
            }}>
              <span style={{
                width: '2rem',
                height: '2rem',
                background: '#8b5cf6',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0,
              }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 700,
                  color: '#1e293b',
                  fontSize: '0.95rem',
                  marginBottom: '0.25rem',
                }}>{s.step}</div>
                <div style={{
                  color: '#64748b',
                  fontSize: '0.875rem',
                  lineHeight: 1.7,
                }}>{s.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* 4. FAQ accordion */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={h2Style}>{isKo ? '자주 묻는 질문 (FAQ)' : 'Frequently Asked Questions'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {c.faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                overflow: 'hidden',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '1.25rem 1.5rem',
                  background: openFaq === i ? '#faf5ff' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: openFaq === i ? '#8b5cf6' : '#1e293b',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (openFaq !== i) {
                    e.currentTarget.style.background = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (openFaq !== i) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', flexShrink: 0 }}>Q.</span>
                  <span>{faq.q}</span>
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: '1.25rem',
                    color: '#94a3b8',
                    transition: 'transform 0.2s ease',
                    transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    fontWeight: 400,
                  }}
                >
                  ▾
                </span>
              </button>
              {openFaq === i && (
                <div
                  style={{
                    padding: '0 1.5rem 1.25rem 1.5rem',
                    color: '#475569',
                    fontSize: '0.9rem',
                    lineHeight: 1.8,
                    borderTop: '1px solid #f1f5f9',
                    animation: 'fadeIn 0.2s ease-in',
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#64748b' }}>A.</span> {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
