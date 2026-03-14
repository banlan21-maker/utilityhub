'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import NavigationActions from '@/app/components/NavigationActions';

export default function DDayPage() {
  const t = useTranslations('DDay');
  const catT = useTranslations('Categories');
  
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dDayResult, setDDayResult] = useState<string | number>('');
  
  const [addDays, setAddDays] = useState<string>('');
  const [addMonths, setAddMonths] = useState<string>('');
  const [calcResult, setCalcResult] = useState<string>('');

  // D-Day Calculation
  useEffect(() => {
    if (!targetDate) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      setDDayResult(t('today'));
    } else if (diffDays > 0) {
      setDDayResult(`D-${diffDays}`);
    } else {
      setDDayResult(`D+${Math.abs(diffDays)}`);
    }
  }, [targetDate, t]);

  // Date Arithmetic Calculation
  const calculateFutureDate = () => {
    const base = new Date(targetDate);
    if (isNaN(base.getTime())) return;

    if (addDays) {
      base.setDate(base.getDate() + parseInt(addDays));
    }
    if (addMonths) {
      base.setMonth(base.getMonth() + parseInt(addMonths));
    }
    
    setCalcResult(base.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }));
  };

  useEffect(() => {
    calculateFutureDate();
  }, [targetDate, addDays, addMonths]);

  return (
    <div>
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('description')}
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Main D-Day Section */}
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {t('targetDateLabel')}
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="glass-panel"
            style={{
              padding: '1rem',
              fontSize: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border)',
              outline: 'none',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              marginBottom: '2rem',
              width: '100%',
              maxWidth: '300px'
            }}
          />
          
          <div style={{ 
            marginTop: '1rem',
            padding: '2rem',
            background: 'var(--surface-hover)',
            borderRadius: 'var(--radius-lg)',
            display: 'inline-block',
            minWidth: '240px'
          }}>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              {t('dDayResult')}
            </p>
            <p style={{ 
              fontSize: '4rem', 
              fontWeight: 800, 
              color: 'var(--primary)',
              margin: 0,
              letterSpacing: '-2px'
            }}>
              {dDayResult}
            </p>
            {dDayResult === t('today') && (
              <p style={{ color: 'var(--secondary)', fontWeight: 600, marginTop: '0.5rem' }}>
                {t('isToday')}
              </p>
            )}
          </div>
        </div>

        {/* Date Arithmetic Section */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            {t('dateAddTitle')}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('addDays')}</label>
              <input
                type="number"
                value={addDays}
                onChange={(e) => setAddDays(e.target.value)}
                placeholder={t('placeholderDays')}
                className="glass-panel"
                style={{
                  padding: '0.75rem',
                  fontSize: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  outline: 'none',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('addMonths')}</label>
              <input
                type="number"
                value={addMonths}
                onChange={(e) => setAddMonths(e.target.value)}
                placeholder="0"
                className="glass-panel"
                style={{
                  padding: '0.75rem',
                  fontSize: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  outline: 'none',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div style={{ 
            marginTop: '2rem', 
            padding: '1.5rem', 
            background: 'var(--surface)', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              {t('result')}
            </p>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {calcResult || '-'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
