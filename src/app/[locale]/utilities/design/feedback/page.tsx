'use client';

import {useTranslations} from 'next-intl';
import { useRef, useState, useTransition } from 'react';
import { submitFeedback } from '@/actions/feedback';
import NavigationActions from '@/app/components/NavigationActions';

export default function FeedbackPage() {
  const fb = useTranslations('Feedback');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    setResult(null);
    startTransition(async () => {
      const res = await submitFeedback(formData);
      setResult(res);
      if (res.success) {
        formRef.current?.reset();
      }
    });
  };

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
          {fb('title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {fb('description')}
        </p>
      </header>

      <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '640px', margin: '0 auto' }}>
        <form ref={formRef} action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="category" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
              {fb('categoryLabel')}
            </label>
            <select
              name="category"
              id="category"
              className="glass-panel"
              style={{
                padding: '0.75rem',
                fontSize: '1rem',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                color: 'var(--text-primary)',
                background: 'var(--surface)'
              }}
            >
              <option value="feature_request">💡 새로운 유틸리티 제안 (Feature Request)</option>
              <option value="bug_report">🐛 버그 제보 (Bug Report)</option>
              <option value="general">💬 일반 피드백 (General Feedback)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <textarea
              name="message"
              required
              rows={5}
              placeholder={fb('placeholder')}
              className="glass-panel"
              style={{
                padding: '1rem',
                fontSize: '1rem',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                color: 'var(--text-primary)',
                resize: 'vertical',
                background: 'var(--surface)'
              }}
            />
          </div>

          {result?.error && (
            <div style={{ color: '#ef4444', padding: '0.75rem', background: '#fef2f2', borderRadius: 'var(--radius-sm)' }}>
              {fb('error')}: {result.error}
            </div>
          )}
          {result?.success && (
            <div style={{ color: '#10b981', padding: '0.75rem', background: '#ecfdf5', borderRadius: 'var(--radius-sm)' }}>
               ✓ {fb('success')}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 600,
              backgroundColor: 'var(--primary)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              transition: 'background-color 0.2s, opacity 0.2s',
              opacity: isPending ? 0.7 : 1,
              cursor: isPending ? 'not-allowed' : 'pointer'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
          >
            {isPending ? '...' : fb('submit')}
          </button>

        </form>
      </div>
    </div>
  );
}
