'use client';

import { useState } from 'react';

export interface FaqItem {
  q: string;
  a: string;
}

export interface SeoSectionProps {
  title: string;           // H2: "XXX이란?"
  description: string;     // intro paragraph
  useCases: { icon: string; title: string; desc: string }[];
  steps: { step: string; desc: string }[];
  faqs: FaqItem[];
}

export default function SeoSection({ title, description, useCases, steps, faqs }: SeoSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const h2Style: React.CSSProperties = {
    fontSize: '1.35rem', fontWeight: 700,
    color: 'var(--text-primary)', marginBottom: '0.75rem',
    borderLeft: '4px solid var(--primary)', paddingLeft: '0.75rem',
  };

  const pStyle: React.CSSProperties = {
    color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem', margin: 0,
  };

  return (
    <section style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

      {/* 1. What is it */}
      <div>
        <h2 style={h2Style}>{title}</h2>
        <p style={pStyle}>{description}</p>
      </div>

      {/* 2. Use cases */}
      <div>
        <h2 style={h2Style}>주요 활용 사례</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          {useCases.map((uc, i) => (
            <div key={i} className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{uc.icon}</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', fontSize: '0.9rem' }}>{uc.title}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>{uc.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. How to use */}
      <div>
        <h2 style={h2Style}>사용 방법</h2>
        <ol style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          {steps.map((s, i) => (
            <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ minWidth: '2rem', height: '2rem', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>{i + 1}</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{s.step}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6, marginTop: '0.15rem' }}>{s.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* 4. FAQ accordion */}
      <div>
        <h2 style={h2Style}>자주 묻는 질문 (FAQ)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          {faqs.map((faq, i) => (
            <div key={i} className="glass-panel" style={{ overflow: 'hidden' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%', textAlign: 'left', padding: '1rem 1.25rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                  fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)',
                }}
              >
                <span>Q. {faq.q}</span>
                <span style={{ flexShrink: 0, fontSize: '1rem', color: 'var(--text-secondary)', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'none' }}>▾</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 1.25rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.8, borderTop: '1px solid var(--border)' }}>
                  A. {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
