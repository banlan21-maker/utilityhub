// 도구 하단 SEO 4섹션 (소개 · 활용 사례 · 사용 방법 · FAQ).
//
// 'use client' 가 없고 상태·이벤트도 없다 → page.tsx(서버)에서 부르면 서버에서만 그려져
// 본문이 자바스크립트로 실리지 않는다. FAQ 펼침은 브라우저 기본 <details> 를 쓴다 (JS 없이 동작, 한 번에 하나만 열림).
// 화면 코드('use client' 파일) 안에서 직접 부르지 말고, page.tsx 에서 만들어 seo 자리로 넘긴다:
//   <ToolClient seo={<SeoSection ko={SEO.ko} en={SEO.en} />} />
import { useId } from 'react';
import { useLocale } from 'next-intl';
import AdSlot from './AdSlot';
import s from './SeoSection.module.css';

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
  /**
   * 영문 페이지에 화면의 영어 FAQ와 같은 FAQPage JSON-LD를 넣는다.
   * page.tsx가 이미 영어 FAQPage를 내보내는 도구는 false (중복 방지).
   */
  faqSchema?: boolean;
}

export default function SeoSection({ ko, en, faqSchema = true }: SeoSectionProps) {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const c = isKo ? ko : en;
  const group = useId(); // 같은 name 의 <details> 는 하나만 열린다

  const faqLd = !isKo && faqSchema && c.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'en',
    mainEntity: c.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  } : null;

  return (
    <section className={s.section}>
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <hr className={s.rule} />

      {/* 1. What is it */}
      <div>
        <h2 className={s.h2}>{c.title}</h2>
        <p className={s.p}>{c.description}</p>
      </div>

      {/* 광고 자리 1: 설명글과 활용 사례 사이 (설정이 꺼져 있으면 비어 있음) */}
      <AdSlot slot="inContent" />

      {/* 2. Use cases */}
      <div>
        <h2 className={s.h2}>{isKo ? '주요 활용 사례' : 'Common Use Cases'}</h2>
        <div className={s.cases}>
          {c.useCases.map((uc, i) => (
            <div key={i} className={s.case}>
              <div className={s.caseIcon}>{uc.icon}</div>
              <div className={s.caseTitle}>{uc.title}</div>
              <div className={s.caseDesc}>{uc.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. How to use */}
      <div>
        <h2 className={s.h2}>{isKo ? '사용 방법' : 'How to Use'}</h2>
        <ol className={s.steps}>
          {c.steps.map((st, i) => (
            <li key={i} className={s.step}>
              <span className={s.stepNum}>{i + 1}</span>
              <div className={s.stepBody}>
                <div className={s.stepTitle}>{st.step}</div>
                <div className={s.stepDesc}>{st.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* 4. FAQ */}
      <div className={s.faqWrap}>
        <h2 className={s.h2}>{isKo ? '자주 묻는 질문 (FAQ)' : 'Frequently Asked Questions'}</h2>
        <div className={s.faqs}>
          {c.faqs.map((faq, i) => (
            <details key={i} className={s.faq} name={group}>
              <summary className={s.q}>
                <span className={s.qText}>
                  <span className={s.qMark}>Q.</span>
                  <span>{faq.q}</span>
                </span>
                <span className={s.arrow} aria-hidden="true">▾</span>
              </summary>
              <div className={s.a}>
                <strong>A.</strong> {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* 광고 자리 2: 페이지 하단 */}
      <AdSlot slot="bottom" />
    </section>
  );
}
