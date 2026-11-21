'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { UserCircle } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import ShareBar from '@/app/components/ShareBar';
import RelatedTools from '@/app/components/RelatedTools';
import { ui } from '@/app/components/ui';

export default function NicknameClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('Nickname');

  const [birthDate, setBirthDate] = useState<string>('');
  const [gender, setGender] = useState<string>('neutral');
  const [style, setStyle] = useState<string>('modern');
  const [result, setResult] = useState<{ name: string; meaning: string } | null>(null);

  const nameDatabase: Record<string, Record<string, { names: string[], meanings: string[] }>> = {
    male: {
      classic: {
        names: ['Oliver', 'Sebastian', 'Theodore', 'Julian', 'Arthur'],
        meanings: ['Peaceful elf', 'Venerable', 'Gift of God', 'Youthful', 'Noble bear']
      },
      modern: {
        names: ['Kai', 'Axel', 'Zion', 'Arlo', 'Finn'],
        meanings: ['Ocean (Hawaiian)', 'Father of peace', 'Highest point', 'Fortified hill', 'Fair/White']
      },
      cool: {
        names: ['Hunter', 'Ryder', 'Chase', 'Jace', 'Phoenix'],
        meanings: ['One who hunts', 'Knight', 'To pursue', 'Healer', 'Immortal bird']
      }
    },
    female: {
      classic: {
        names: ['Isla', 'Evelyn', 'Clara', 'Adelaide', 'Florence'],
        meanings: ['Island', 'Desired', 'Clear/Bright', 'Noble', 'Flourishing']
      },
      modern: {
        names: ['Luna', 'Nova', 'Willow', 'Hazel', 'Aria'],
        meanings: ['Moon', 'New star', 'Graceful tree', 'Protection', 'Air/Song']
      },
      cute: {
        names: ['Daisy', 'Ruby', 'Mila', 'Pixie', 'Chloe'],
        meanings: ['Days eye', 'Deep red gem', 'Dear/Gracious', 'Playful fairy', 'Blooming']
      }
    },
    neutral: {
      modern: {
        names: ['Skyler', 'River', 'Sage', 'Jordan', 'Quinn'],
        meanings: ['Scholar', 'Flowing water', 'Wise one', 'Flowing down', 'Counsel']
      },
      cool: {
        names: ['Shadow', 'Rain', 'Storm', 'Echo', 'Indigo'],
        meanings: ['Mystery', 'Natural blessing', 'Strong nature', 'Sound reflection', 'Deep blue']
      }
    }
  };

  const recommend = () => {
    if (!birthDate) return;

    const genderKey = gender;
    const styleKey = style;

    // Simple logic based on birth date to pick a deterministic name
    const dateValue = new Date(birthDate).getTime();
    const categories = nameDatabase[genderKey] || nameDatabase['neutral'];
    const styleOptions = categories[styleKey] || Object.values(categories)[0];

    const index = Math.abs(Math.floor(dateValue / 1000 / 60 / 60 / 24)) % styleOptions.names.length;

    setResult({
      name: styleOptions.names[index],
      meaning: styleOptions.meanings[index]
    });
  };

  return (
    <div className="max-w-[var(--tool-width)] mx-auto">
      <NavigationActions />
      <ToolHeader icon={<UserCircle />} title={t('title')} subtitle={t('description')} />

      <div className="grid gap-8 md:grid-cols-2 animate-slide-up">
        {/* Form */}
        <div className={ui.card}>
          <div className={ui.field} style={{ marginBottom: '1.5rem' }}>
            <label className={ui.label}>{t('birthDate')}</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={ui.input}
            />
          </div>

          <div className={ui.field} style={{ marginBottom: '1.5rem' }}>
            <label className={ui.label}>{t('gender')}</label>
            <div className={ui.segmented}>
              {['male', 'female', 'neutral'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`${ui.segment} ${gender === g ? ui.segmentActive : ''}`}
                >
                  {t(g)}
                </button>
              ))}
            </div>
          </div>

          <div className={ui.field} style={{ marginBottom: '2rem' }}>
            <label className={ui.label}>{t('style')}</label>
            <div className={ui.segmented}>
              {['classic', 'modern', 'cute', 'cool'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`${ui.segment} ${style === s ? ui.segmentActive : ''}`}
                >
                  {t(s)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={recommend}
            disabled={!birthDate}
            className={`${ui.button} ${ui.primary} ${ui.lg} ${ui.block}`}
          >
            {t('recommend')}
          </button>
        </div>

        {/* Result */}
        <div className="flex flex-col">
          {result ? (
            <div className={`${ui.card} animate-scale-in flex-1 flex flex-col items-center justify-center text-center`} style={{ padding: '3rem', border: '2px dashed var(--color-primary)' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{t('resultTitle')}</p>
              <h2 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--color-primary)', marginBottom: '1.5rem', textShadow: '0 0 20px rgba(var(--primary-rgb), 0.3)' }}>
                {result.name}
              </h2>
              <div style={{ padding: '1rem 2rem', background: 'var(--surface-hover)', borderRadius: '30px', marginBottom: '2rem' }}>
                <span style={{ fontWeight: 600, marginRight: '0.5rem' }}>{t('meaning')}:</span>
                <span>{result.meaning}</span>
              </div>

              <button
                onClick={() => setResult(null)}
                className={`${ui.button} ${ui.secondary}`}
              >
                {t('reset')}
              </button>
            </div>
          ) : (
            <div className={`${ui.card} flex-1 flex flex-col items-center justify-center text-center opacity-50`} style={{ padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
              <p style={{ whiteSpace: 'pre-wrap' }}>{t('emptyState')}</p>
            </div>
          )}
        </div>
      </div>


      {/* 공유하기 */}
      <ShareBar title={t('title')} description={t('description')} />

      {/* 추천 도구 */}
      <RelatedTools toolId="utilities/lifestyle/nickname" />


      {seo}
    </div>
  );
}
