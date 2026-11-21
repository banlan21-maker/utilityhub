'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Search } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { TERMS, UNIT_CONVERSIONS, type TermCategory } from '@/lib/terms-db';
import s from './construction-dictionary.module.css';
import { ui } from '@/app/components/ui';

const ORIGIN_TONE = { japanese: ui.amber, english: ui.blue, korean: ui.green } as const;

const CATEGORY_KEYS: (TermCategory | 'all')[] = [
  'all', 'common', 'structure', 'carpentry', 'plaster', 'tile', 'plumbing', 'electric', 'scaffold', 'paint',
];

export default function ConstructionDictionaryClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('ConstructionDict');

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<TermCategory | 'all'>('all');

  // 단위 변환 상태
  const [pyeong, setPyeong] = useState('');
  const [m2, setM2] = useState('');
  const [ja, setJa] = useState('');
  const [chi, setChi] = useState('');
  const [cm, setCm] = useState('');


  // ── 검색·필터링 ──────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TERMS.filter((tt) => {
      if (category !== 'all' && tt.category !== category) return false;
      if (!q) return true;
      return (
        tt.term.toLowerCase().includes(q) ||
        tt.standard.toLowerCase().includes(q) ||
        tt.description.toLowerCase().includes(q) ||
        tt.example.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  // ── 단위 변환 핸들러 (단방향만 setState — 무한 루프 방지) ──
  const handlePyeong = (v: string) => {
    setPyeong(v);
    if (v === '') { setM2(''); return; }
    const num = parseFloat(v);
    if (isNaN(num)) return;
    setM2((Math.round(num * UNIT_CONVERSIONS.PYEONG_TO_M2 * 100) / 100).toString());
  };
  const handleM2 = (v: string) => {
    setM2(v);
    if (v === '') { setPyeong(''); return; }
    const num = parseFloat(v);
    if (isNaN(num)) return;
    setPyeong((Math.round(num * UNIT_CONVERSIONS.M2_TO_PYEONG * 100) / 100).toString());
  };

  // 자·치 → cm
  const handleJaChi = (newJa: string, newChi: string) => {
    setJa(newJa);
    setChi(newChi);
    const jaN = parseFloat(newJa) || 0;
    const chiN = parseFloat(newChi) || 0;
    if (newJa === '' && newChi === '') { setCm(''); return; }
    const cmVal = jaN * UNIT_CONVERSIONS.JA_TO_CM + chiN * UNIT_CONVERSIONS.CHI_TO_CM;
    setCm((Math.round(cmVal * 100) / 100).toString());
  };
  // cm → 자·치 (역산)
  const handleCm = (v: string) => {
    setCm(v);
    if (v === '') { setJa(''); setChi(''); return; }
    const cmN = parseFloat(v);
    if (isNaN(cmN)) return;
    const totalChi = cmN / UNIT_CONVERSIONS.CHI_TO_CM;
    const jaVal = Math.floor(totalChi / 10);
    const chiVal = Math.round((totalChi % 10) * 10) / 10;
    setJa(jaVal.toString());
    setChi(chiVal.toString());
  };

  const handleNumInput = (handler: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === '' || /^[0-9]*\.?[0-9]*$/.test(v)) handler(v);
  };


  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<BookOpen />} title={t('title')} subtitle={t('subtitle')} />

      {/* Sticky search */}
      <div className={s.search_sticky}>
        <div className={s.search_wrap}>
          <Search size={18} className={s.search_icon} />
          <input
            type="text"
            className={`${ui.input} ${ui.inputLg} ${s.search_input}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            aria-label={t('search_placeholder')}
          />
          {query && (
            <button
              className={s.search_clear}
              onClick={() => setQuery('')}
              aria-label={t('search_clear')}
              type="button"
            >
              ×
            </button>
          )}
        </div>
        <div className={s.results_count}>{t('results_count', { n: filtered.length })}</div>
      </div>

      {/* Category tabs */}
      <div className={s.cat_tabs_wrap}>
        <div className={s.cat_tabs}>
          {CATEGORY_KEYS.map((k) => (
            <button
              key={k}
              className={`${ui.chip} ${ui.pill} ${s.cat_btn} ${category === k ? ui.chipActive : ''}`}
              onClick={() => setCategory(k)}
              aria-label={t(`cat_${k}` as 'cat_all')}
            >
              {t(`cat_${k}` as 'cat_all')}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className={s.cards}>
        {filtered.length === 0 ? (
          <div className={s.empty_msg}>{t('no_results')}</div>
        ) : (
          filtered.map((term) => (
            <article key={`${term.category}-${term.term}`} className={`${ui.card} ${s.card}`}>
              <div className={s.card_top}>
                <span className={ui.badge}>
                  {t(`cat_${term.category}` as 'cat_common')}
                </span>
                <span className={`${ui.badge} ${ORIGIN_TONE[term.origin]}`}>
                  {t(`origin_${term.origin}` as 'origin_japanese')}
                </span>
              </div>
              <div className={s.card_term}>{term.term}</div>
              <div className={s.card_standard}>
                <span className={s.card_standard_label}>{t('card_standard')}</span>
                {term.standard}
              </div>
              <p className={s.card_description}>{term.description}</p>
              <div className={s.card_example}>
                <span className={s.card_example_label}>{t('card_example')}</span>
                {term.example}
              </div>
            </article>
          ))
        )}
      </div>

      {/* Converter */}
      <section className={ui.card}>
        <h2 className={ui.cardTitle}>{t('converter_title')}</h2>

        <div className={s.converter_section}>
          <div className={s.converter_section_title}>{t('converter_pyeong_m2')}</div>
          <div className={s.converter_row}>
            <div className={ui.inputGroup}>
              <input
                type="text"
                inputMode="decimal"
                className={ui.input}
                value={pyeong}
                onChange={handleNumInput(handlePyeong)}
                placeholder="0"
                aria-label={t('converter_pyeong_label')}
              />
              <span className={ui.unit}>{t('converter_pyeong_label')}</span>
            </div>
            <span className={s.converter_arrow}>↔</span>
            <div className={ui.inputGroup}>
              <input
                type="text"
                inputMode="decimal"
                className={ui.input}
                value={m2}
                onChange={handleNumInput(handleM2)}
                placeholder="0"
                aria-label={t('converter_m2_label')}
              />
              <span className={ui.unit}>{t('converter_m2_label')}</span>
            </div>
          </div>
        </div>

        <div className={s.converter_section}>
          <div className={s.converter_section_title}>{t('converter_jacchi_cm')}</div>
          <div className={s.converter_row_triple}>
            <div className={ui.inputGroup}>
              <input
                type="text"
                inputMode="decimal"
                className={ui.input}
                value={ja}
                onChange={handleNumInput((v) => handleJaChi(v, chi))}
                placeholder="0"
                aria-label={t('converter_ja_label')}
              />
              <span className={ui.unit}>{t('converter_ja_label')}</span>
            </div>
            <div className={ui.inputGroup}>
              <input
                type="text"
                inputMode="decimal"
                className={ui.input}
                value={chi}
                onChange={handleNumInput((v) => handleJaChi(ja, v))}
                placeholder="0"
                aria-label={t('converter_chi_label')}
              />
              <span className={ui.unit}>{t('converter_chi_label')}</span>
            </div>
            <span className={s.converter_arrow}>↔</span>
            <div className={ui.inputGroup}>
              <input
                type="text"
                inputMode="decimal"
                className={ui.input}
                value={cm}
                onChange={handleNumInput(handleCm)}
                placeholder="0"
                aria-label={t('converter_cm_label')}
              />
              <span className={ui.unit}>{t('converter_cm_label')}</span>
            </div>
          </div>
        </div>
      </section>

      <div className={`${ui.notice} ${ui.amber}`}>{t('tip_disclaimer')}</div>

      <ShareBar title={t('title')} description={t('subtitle')} />
      <RelatedTools toolId="utilities/utility/construction-dictionary" />

      {seo}
    </div>
  );
}
