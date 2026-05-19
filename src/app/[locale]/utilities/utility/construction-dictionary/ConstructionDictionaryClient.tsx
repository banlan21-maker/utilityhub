'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Search } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import { TERMS, UNIT_CONVERSIONS, type TermCategory } from '@/lib/terms-db';
import s from './construction-dictionary.module.css';

const CATEGORY_KEYS: (TermCategory | 'all')[] = [
  'all', 'common', 'structure', 'carpentry', 'plaster', 'tile', 'plumbing', 'electric', 'scaffold', 'paint',
];

export default function ConstructionDictionaryClient() {
  const t = useTranslations('ConstructionDict');

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<TermCategory | 'all'>('all');
  const [isMounted, setIsMounted] = useState(false);

  // 단위 변환 상태
  const [pyeong, setPyeong] = useState('');
  const [m2, setM2] = useState('');
  const [ja, setJa] = useState('');
  const [chi, setChi] = useState('');
  const [cm, setCm] = useState('');

  useEffect(() => { setIsMounted(true); }, []);

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

  if (!isMounted) return null;

  return (
    <div className={s.container}>
      <NavigationActions />

      <header className={s.header}>
        <div style={{
          display: 'inline-flex', padding: '1rem', background: 'white',
          borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1rem',
        }}>
          <BookOpen size={36} color="#8b5cf6" />
        </div>
        <h1 className={s.title}>{t('title')}</h1>
        <p className={s.subtitle}>{t('subtitle')}</p>
      </header>

      {/* Sticky search */}
      <div className={s.search_sticky}>
        <div className={s.search_wrap}>
          <Search size={18} className={s.search_icon} />
          <input
            type="text"
            className={s.search_input}
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
              className={`${s.cat_btn} ${category === k ? s.cat_btn_active : ''}`}
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
            <article key={`${term.category}-${term.term}`} className={s.card}>
              <div className={s.card_top}>
                <span className={s.card_category}>
                  {t(`cat_${term.category}` as 'cat_common')}
                </span>
                <span className={`${s.origin_badge} ${s[`origin_${term.origin}`]}`}>
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
      <section className={s.converter_panel}>
        <h2 className={s.converter_title}>{t('converter_title')}</h2>

        <div className={s.converter_section}>
          <div className={s.converter_section_title}>{t('converter_pyeong_m2')}</div>
          <div className={s.converter_row}>
            <div className={s.converter_input_wrap}>
              <input
                type="text"
                inputMode="decimal"
                className={s.converter_input}
                value={pyeong}
                onChange={handleNumInput(handlePyeong)}
                placeholder="0"
                aria-label={t('converter_pyeong_label')}
              />
              <span className={s.converter_unit}>{t('converter_pyeong_label')}</span>
            </div>
            <span className={s.converter_arrow}>↔</span>
            <div className={s.converter_input_wrap}>
              <input
                type="text"
                inputMode="decimal"
                className={s.converter_input}
                value={m2}
                onChange={handleNumInput(handleM2)}
                placeholder="0"
                aria-label={t('converter_m2_label')}
              />
              <span className={s.converter_unit}>{t('converter_m2_label')}</span>
            </div>
          </div>
        </div>

        <div className={s.converter_section}>
          <div className={s.converter_section_title}>{t('converter_jacchi_cm')}</div>
          <div className={s.converter_row_triple}>
            <div className={s.converter_input_wrap}>
              <input
                type="text"
                inputMode="decimal"
                className={s.converter_input}
                value={ja}
                onChange={handleNumInput((v) => handleJaChi(v, chi))}
                placeholder="0"
                aria-label={t('converter_ja_label')}
              />
              <span className={s.converter_unit}>{t('converter_ja_label')}</span>
            </div>
            <div className={s.converter_input_wrap}>
              <input
                type="text"
                inputMode="decimal"
                className={s.converter_input}
                value={chi}
                onChange={handleNumInput((v) => handleJaChi(ja, v))}
                placeholder="0"
                aria-label={t('converter_chi_label')}
              />
              <span className={s.converter_unit}>{t('converter_chi_label')}</span>
            </div>
            <span className={s.converter_arrow}>↔</span>
            <div className={s.converter_input_wrap}>
              <input
                type="text"
                inputMode="decimal"
                className={s.converter_input}
                value={cm}
                onChange={handleNumInput(handleCm)}
                placeholder="0"
                aria-label={t('converter_cm_label')}
              />
              <span className={s.converter_unit}>{t('converter_cm_label')}</span>
            </div>
          </div>
        </div>
      </section>

      <div className={s.disclaimer}>{t('tip_disclaimer')}</div>

      <ShareBar title={t('title')} description={t('subtitle')} />
      <RelatedTools toolId="utilities/utility/construction-dictionary" />
      <div className={s.ad_placeholder}>{t('ad_text')}</div>

      <SeoSection
        ko={{
          title: '건설현장 용어 사전이란?',
          description:
            '건설현장 용어 사전은 건설 현장에서 일상적으로 쓰이는 은어·속어·일본어 잔재 용어를 직종별로 정리한 검색형 사전입니다. 처음 현장에 나간 초보 관리자나 건축주, 인테리어 의뢰인이 반장님이나 기술자가 쓰는 말을 알아듣지 못해 당황하는 상황을 해결하기 위해 만들어졌습니다. 공통·공정, 골조·철근, 목공, 미장·방수, 타일·마감, 설비·배관, 전기, 비계·가설, 도장·도배 등 9개 직종 카테고리에 120여 개 현장 용어를 수록하였으며, 각 용어마다 표준 우리말, 어원(🇯🇵 일본어/🔤 영어/🇰🇷 한국), 설명, 현장 사용 예시를 함께 제공합니다. 검색창에 용어를 입력하면 실시간으로 필터링되며, 인터넷 연결 없이도 사용 가능합니다. 하단의 단위 변환기(평↔㎡, 자·치↔cm)는 현장에서 자주 쓰이는 단위 환산을 즉시 해결합니다.',
          useCases: [
            { icon: '👷', title: '신입 관리자 입문', desc: '현장 첫 출근 시 반장님과 기술자의 은어를 알아듣지 못해 당황하는 상황을 즉시 해결합니다. "다루끼", "헤베", "아시바" 같은 핵심 용어 120여 개를 검색 하나로 확인.' },
            { icon: '🏠', title: '인테리어 의뢰인 소통', desc: '집수리·인테리어를 맡길 때 시공사 견적서나 작업 설명에 등장하는 일본어 잔재 용어를 즉시 확인하여 의사소통 오해를 방지합니다.' },
            { icon: '📚', title: '건축 학습·자격증', desc: '건축기사·실내건축기능사 등 현장 자격증 준비 시 실무 용어와 표준어를 함께 익혀 시험과 실무 모두에 대비합니다.' },
            { icon: '📐', title: '단위 환산 동반', desc: '"몇 헤베야?" "몇 루베 필요해?" 라는 질문에 즉시 답할 수 있도록 평↔㎡, 자·치↔cm 변환기를 함께 제공합니다.' },
          ],
          steps: [
            { step: '카테고리 선택', desc: '상단 카테고리 탭에서 검색하고 싶은 직종(공통, 골조, 목공, 미장, 타일, 배관, 전기, 비계, 도장)을 선택하거나 "전체"를 누릅니다.' },
            { step: '검색어 입력', desc: '검색창에 한글 용어 일부를 입력하면 실시간으로 필터됩니다. 현장 용어, 표준어, 설명 전체에서 검색됩니다.' },
            { step: '카드 확인', desc: '용어 카드에서 표준 우리말, 어원(일본어/영어/한국), 설명, 현장 사용 예시를 한 번에 확인합니다.' },
            { step: '단위 변환 활용', desc: '페이지 하단의 단위 변환기에서 평↔㎡, 자·치↔cm를 즉시 환산할 수 있습니다. 한쪽 입력 시 반대쪽이 자동 계산됩니다.' },
          ],
          faqs: [
            { q: '왜 일본어 잔재 용어가 그대로 쓰이나요?', a: '일제강점기와 1970~80년대 건설 붐 시기에 일본 기술서와 일본인 기술자에게서 전수받은 용어가 그대로 굳어진 결과입니다. 정부와 건설업계가 표준어 사용을 권장하지만, 현장 세대 간 전수로 인해 여전히 일상적으로 쓰이고 있어 신입에게는 학습이 필요합니다.' },
            { q: '검색이 안 되는 용어가 있어요', a: '본 사전은 120여 개의 대표적인 현장 용어를 수록하고 있습니다. 정말 드물게 쓰이는 지역 방언이나 회사 내부 용어는 포함되어 있지 않을 수 있습니다. 일반적인 표기와 다른 철자로 시도해보시거나, 비슷한 표준어로 검색해보세요.' },
            { q: '헤베·루베·평 차이가 뭔가요?', a: '헤베는 제곱미터(㎡, 면적), 루베는 세제곱미터(㎥, 부피), 평은 한국 전통 면적 단위(1평 ≈ 3.3058㎡)입니다. "이 방 몇 헤베야?"는 면적, "콘크리트 몇 루베야?"는 부피를 묻는 것입니다. 본 사전 하단의 단위 변환기로 즉시 환산할 수 있습니다.' },
            { q: '이 사전을 공식 자료로 사용해도 되나요?', a: '본 사전은 현장 의사소통 참고용입니다. 정식 견적서, 시방서, 설계도서 작성 시에는 한국산업표준(KS) 용어나 건설표준품셈에 정의된 표준어를 사용해야 합니다. 본 사전의 어원·설명은 일반적 통용 기준이며 학술적 출처와 다를 수 있습니다.' },
          ],
        }}
        en={{
          title: 'What is the Construction Site Glossary?',
          description:
            'The Construction Site Glossary is a searchable dictionary of jargon, slang, and Japanese-origin terms commonly used on Korean construction sites. It is designed for first-time site managers, homeowners, and interior renovation clients who cannot follow what foremen and skilled workers say. The dictionary covers 9 trade categories — general, structure, carpentry, plaster, tile/finish, plumbing, electric, scaffolding, paint — with 120+ field terms. Each entry includes the standard Korean equivalent, origin (🇯🇵 Japanese, 🔤 English, 🇰🇷 Korean), a plain-language explanation, and a real-world site example. Search filters in real time as you type, and the dictionary works offline once the page loads. A built-in unit converter (Pyeong ↔ ㎡, Ja·Chi ↔ cm) handles the most common on-site unit conversions.',
          useCases: [
            { icon: '👷', title: 'New Site Manager Onboarding', desc: 'On day one at a Korean construction site, instantly look up unfamiliar terms used by foremen and tradesmen. Decode 120+ essential jargon words like 다루끼, 헤베, 아시바 with one search.' },
            { icon: '🏠', title: 'Homeowner Communication', desc: 'When ordering interior or repair work, quickly understand the Japanese-origin terms that appear in contractor estimates and conversations, avoiding miscommunication.' },
            { icon: '📚', title: 'Construction Certification', desc: 'For certifications like 건축기사 or 실내건축기능사, learn both field jargon and standard terms together — preparation for exams and real-world practice.' },
            { icon: '📐', title: 'Unit Conversion Sidekick', desc: 'Instantly answer questions like "How many 헤베?" or "How many 루베?" with the built-in Pyeong ↔ ㎡ and Ja·Chi ↔ cm converters.' },
          ],
          steps: [
            { step: 'Pick a Category', desc: 'Tap a category tab at the top (general, structure, carpentry, plaster, tile, plumbing, electric, scaffold, paint) or stay on "All".' },
            { step: 'Type a Query', desc: 'Enter part of a term in Korean. The list filters in real time across the term, standard equivalent, description, and example.' },
            { step: 'Read the Card', desc: 'Each card shows the standard Korean equivalent, origin badge (Japanese/English/Korean), explanation, and a real on-site example.' },
            { step: 'Use the Converter', desc: 'At the bottom, the unit converter handles Pyeong ↔ ㎡ and Ja·Chi ↔ cm. Editing one side auto-fills the other.' },
          ],
          faqs: [
            { q: 'Why are Japanese-origin terms still used?', a: 'Many took root during the Japanese colonial period and the 1970s-80s construction boom, when Korean tradesmen learned from Japanese manuals and instructors. Although the Korean government and industry now promote standard Korean equivalents, generational transmission has kept these terms alive on sites — so newcomers still need to learn them.' },
            { q: 'Some terms are missing — why?', a: 'This dictionary covers 120+ common field terms. Very rare regional dialect or company-internal jargon may not be included. Try different spellings or search the standard Korean equivalent.' },
            { q: 'What is the difference between 헤베, 루베, and 평?', a: '헤베 = square meters (㎡, area). 루베 = cubic meters (㎥, volume). 평 = Korean traditional area unit (1 pyeong ≈ 3.3058 ㎡). "How many 헤베?" asks about area; "How many 루베?" asks about volume. Use the converter below to switch between them instantly.' },
            { q: 'Can I use this as an official reference?', a: 'This dictionary is for on-site communication only. For official estimates, specifications, and design documents, always use the standard Korean terminology defined by KS (Korean Industrial Standards) and the construction labor cost standards. Origin and explanations here follow common usage and may differ from academic sources.' },
          ],
        }}
      />
    </div>
  );
}
