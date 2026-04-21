'use client';

import { useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Layers } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './core-web-vitals.module.css';

// ── Types ──────────────────────────────────────────
type Rating = 'good' | 'needs' | 'poor';

// ── Rating logic ───────────────────────────────────
function getLcpRating(v: number): Rating {
  if (v <= 2.5) return 'good';
  if (v <= 4.0) return 'needs';
  return 'poor';
}

function getInpRating(v: number): Rating {
  if (v <= 200) return 'good';
  if (v <= 500) return 'needs';
  return 'poor';
}

function getClsRating(v: number): Rating {
  if (v <= 0.1) return 'good';
  if (v <= 0.25) return 'needs';
  return 'poor';
}

function getOverallRating(lcp: Rating, inp: Rating, cls: Rating): Rating {
  if (lcp === 'poor' || inp === 'poor' || cls === 'poor') return 'poor';
  if (lcp === 'good' && inp === 'good' && cls === 'good') return 'good';
  return 'needs';
}

// ── Badge helpers ──────────────────────────────────
const BADGE_CLASS: Record<Rating, string> = {
  good: s.badge_good,
  needs: s.badge_needs,
  poor: s.badge_poor,
};

const BADGE_LABEL_KO: Record<Rating, string> = {
  good: 'Good ✓',
  needs: 'Needs Work',
  poor: 'Poor ✗',
};

const BADGE_LABEL_EN: Record<Rating, string> = {
  good: 'Good ✓',
  needs: 'Needs Work',
  poor: 'Poor ✗',
};

// ── Tips ───────────────────────────────────────────
const TIPS: Record<Rating, { ko: string[]; en: string[] }> = {
  good: {
    ko: [
      'LCP·INP·CLS 모두 Google 기준 통과입니다. 현재 성능을 유지하세요.',
      '주기적으로 PageSpeed Insights에서 재측정하여 회귀를 방지하세요.',
      'Search Console Core Web Vitals 보고서에서 실사용자 데이터를 확인하세요.',
    ],
    en: [
      'All three metrics pass Google\'s Core Web Vitals thresholds. Keep it up!',
      'Run PageSpeed Insights periodically to catch any regressions early.',
      'Check the Search Console Core Web Vitals report for real-user data.',
    ],
  },
  needs: {
    ko: [
      'LCP 개선: 이미지 최적화(WebP/AVIF), 중요 리소스 preload, 서버 응답 속도(TTFB) 단축.',
      'INP 개선: 긴 JavaScript 태스크 분할(코드 스플리팅), 불필요한 메인 스레드 작업 제거.',
      'CLS 개선: 이미지·광고에 width/height 명시, 동적 콘텐츠 삽입 위치 고정.',
    ],
    en: [
      'LCP: Optimize images (WebP/AVIF), preload key resources, reduce server TTFB.',
      'INP: Break up long JavaScript tasks, reduce main-thread blocking work.',
      'CLS: Set explicit width/height on images and ads, reserve space for dynamic content.',
    ],
  },
  poor: {
    ko: [
      '긴급 개선 필요: Poor 지표가 SEO 순위에 직접 영향을 줍니다.',
      'LCP > 4s: 렌더 블로킹 리소스 제거, 이미지 lazy loading 제거(LCP 요소는 eager), CDN 사용.',
      'INP > 500ms: React/Vue 하이드레이션 최적화, 이벤트 핸들러 경량화, requestIdleCallback 활용.',
      'CLS > 0.25: Cumulative Layout Shift 주요 원인인 폰트 스왑(font-display: swap), 광고 슬롯 크기 고정.',
    ],
    en: [
      'Urgent: Poor ratings directly affect your Google search ranking.',
      'LCP > 4s: Remove render-blocking resources, use CDN, add eager loading on LCP element.',
      'INP > 500ms: Optimize JS hydration, debounce event handlers, use requestIdleCallback.',
      'CLS > 0.25: Fix font-display: swap issues, reserve fixed slots for ads and dynamic content.',
    ],
  },
};

// ── Slider configs ─────────────────────────────────
const LCP_MAX = 6;
const INP_MAX = 600;
const CLS_MAX = 0.6;

export default function CoreWebVitalsClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  // LCP state
  const [lcpSlider, setLcpSlider] = useState(2.5);
  const [lcpInput, setLcpInput] = useState('2.5');

  // INP state
  const [inpSlider, setInpSlider] = useState(200);
  const [inpInput, setInpInput] = useState('200');

  // CLS state
  const [clsSlider, setClsSlider] = useState(0.1);
  const [clsInput, setClsInput] = useState('0.10');

  // Ratings
  const lcpVal = parseFloat(lcpInput) || 0;
  const inpVal = parseFloat(inpInput) || 0;
  const clsVal = parseFloat(clsInput) || 0;

  const lcpRating = getLcpRating(lcpVal);
  const inpRating = getInpRating(inpVal);
  const clsRating = getClsRating(clsVal);
  const overall = getOverallRating(lcpRating, inpRating, clsRating);

  const badgeLabel = useCallback(
    (r: Rating) => (isKo ? BADGE_LABEL_KO[r] : BADGE_LABEL_EN[r]),
    [isKo]
  );

  // ── Handlers ──
  const onLcpSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(parseFloat(e.target.value).toFixed(1));
    setLcpSlider(v);
    setLcpInput(String(v));
  };
  const onLcpInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLcpInput(e.target.value);
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) setLcpSlider(Math.min(LCP_MAX, v));
  };

  const onInpSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.round(parseFloat(e.target.value));
    setInpSlider(v);
    setInpInput(String(v));
  };
  const onInpInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInpInput(e.target.value);
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) setInpSlider(Math.min(INP_MAX, v));
  };

  const onClsSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(parseFloat(e.target.value).toFixed(2));
    setClsSlider(v);
    setClsInput(v.toFixed(2));
  };
  const onClsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClsInput(e.target.value);
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) setClsSlider(Math.min(CLS_MAX, v));
  };

  const tips = TIPS[overall][isKo ? 'ko' : 'en'];

  const titleStr = isKo ? 'Core Web Vitals 판정기' : 'Core Web Vitals Checker';
  const descStr = isKo
    ? 'LCP·INP·CLS 수치를 입력하면 Google 공식 기준으로 Good/Needs Work/Poor 등급을 즉시 판정. 2024년 최신 INP 기준 적용.'
    : 'Enter your LCP, INP, and CLS scores to instantly get Google\'s Good / Needs Work / Poor ratings. Updated with the latest INP standard replacing FID.';

  return (
    <div className={s.container}>
      <NavigationActions />

      {/* Header */}
      <header className={s.header}>
        <div className={s.icon_wrap}>
          <Layers size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.title}>{titleStr}</h1>
        <p className={s.subtitle}>{descStr}</p>
      </header>

      {/* Input Panel */}
      <section className={s.panel} aria-label={isKo ? '지표 입력' : 'Metric inputs'}>

        {/* LCP */}
        <div className={s.metric_block}>
          <div className={s.metric_top}>
            <div className={s.metric_info}>
              <div className={s.metric_name}>LCP <span className={s.metric_fullname}>— Largest Contentful Paint</span></div>
              <div className={s.metric_hint}>{isKo ? '페이지 주요 콘텐츠 로딩 속도' : 'Time for largest content element to render'}</div>
            </div>
            <span className={`${s.badge} ${BADGE_CLASS[lcpRating]}`} aria-label={`LCP ${badgeLabel(lcpRating)}`}>
              {badgeLabel(lcpRating)}
            </span>
          </div>

          <div className={s.input_row}>
            <input
              type="range"
              className={s.slider}
              min={0} max={LCP_MAX} step={0.1}
              value={lcpSlider}
              onChange={onLcpSlider}
              aria-label="LCP 슬라이더"
            />
            <input
              type="number"
              className={s.number_input}
              step="any" min="0"
              value={lcpInput}
              onChange={onLcpInput}
              aria-label="LCP 숫자 입력"
            />
            <span className={s.unit_label}>s</span>
          </div>

          {/* Color zone bar */}
          <div className={s.zone_bar_wrap}>
            <div className={s.zone_bar} aria-hidden="true">
              <div className={s.zone_good}  style={{ width: '41.7%' }} />
              <div className={s.zone_needs} style={{ width: '25.0%' }} />
              <div className={s.zone_poor}  style={{ width: '33.3%' }} />
            </div>
            <div className={s.zone_labels} aria-hidden="true">
              <span>0s</span>
              <span>Good ≤2.5s</span>
              <span>≤4s</span>
              <span>Poor &gt;4s</span>
              <span>6s+</span>
            </div>
          </div>

          {lcpVal > LCP_MAX && (
            <div className={s.overflow_warning} role="alert">
              {isKo
                ? `슬라이더 최대(6s)를 초과한 값입니다. 입력값(${lcpVal}s) 기준으로 Poor 판정됩니다.`
                : `Value exceeds slider max (6s). Rated Poor based on input (${lcpVal}s).`}
            </div>
          )}
        </div>

        {/* INP */}
        <div className={s.metric_block}>
          <div className={s.metric_top}>
            <div className={s.metric_info}>
              <div className={s.metric_name}>INP <span className={s.metric_fullname}>— Interaction to Next Paint</span></div>
              <div className={s.metric_hint}>{isKo ? '클릭·탭 등 입력 반응성 (2024년 FID 대체)' : 'Input responsiveness — replaced FID in 2024'}</div>
            </div>
            <span className={`${s.badge} ${BADGE_CLASS[inpRating]}`} aria-label={`INP ${badgeLabel(inpRating)}`}>
              {badgeLabel(inpRating)}
            </span>
          </div>

          <div className={s.input_row}>
            <input
              type="range"
              className={s.slider}
              min={0} max={INP_MAX} step={10}
              value={inpSlider}
              onChange={onInpSlider}
              aria-label="INP 슬라이더"
            />
            <input
              type="number"
              className={s.number_input}
              step="any" min="0"
              value={inpInput}
              onChange={onInpInput}
              aria-label="INP 숫자 입력"
            />
            <span className={s.unit_label}>ms</span>
          </div>

          <div className={s.zone_bar_wrap}>
            <div className={s.zone_bar} aria-hidden="true">
              <div className={s.zone_good}  style={{ width: '33.3%' }} />
              <div className={s.zone_needs} style={{ width: '50.0%' }} />
              <div className={s.zone_poor}  style={{ width: '16.7%' }} />
            </div>
            <div className={s.zone_labels} aria-hidden="true">
              <span>0ms</span>
              <span>Good ≤200ms</span>
              <span>≤500ms</span>
              <span>Poor &gt;500ms</span>
              <span>600ms+</span>
            </div>
          </div>

          {inpVal > INP_MAX && (
            <div className={s.overflow_warning} role="alert">
              {isKo
                ? `슬라이더 최대(600ms)를 초과한 값입니다. 입력값(${inpVal}ms) 기준으로 Poor 판정됩니다.`
                : `Value exceeds slider max (600ms). Rated Poor based on input (${inpVal}ms).`}
            </div>
          )}
        </div>

        {/* CLS */}
        <div className={s.metric_block}>
          <div className={s.metric_top}>
            <div className={s.metric_info}>
              <div className={s.metric_name}>CLS <span className={s.metric_fullname}>— Cumulative Layout Shift</span></div>
              <div className={s.metric_hint}>{isKo ? '페이지 시각 안정성 (레이아웃 밀림 정도)' : 'Visual stability — measures unexpected layout shifts'}</div>
            </div>
            <span className={`${s.badge} ${BADGE_CLASS[clsRating]}`} aria-label={`CLS ${badgeLabel(clsRating)}`}>
              {badgeLabel(clsRating)}
            </span>
          </div>

          <div className={s.input_row}>
            <input
              type="range"
              className={s.slider}
              min={0} max={CLS_MAX} step={0.01}
              value={clsSlider}
              onChange={onClsSlider}
              aria-label="CLS 슬라이더"
            />
            <input
              type="number"
              className={s.number_input}
              step="any" min="0"
              value={clsInput}
              onChange={onClsInput}
              aria-label="CLS 숫자 입력"
            />
            <span className={s.unit_label}></span>
          </div>

          <div className={s.zone_bar_wrap}>
            <div className={s.zone_bar} aria-hidden="true">
              <div className={s.zone_good}  style={{ width: '16.7%' }} />
              <div className={s.zone_needs} style={{ width: '25.0%' }} />
              <div className={s.zone_poor}  style={{ width: '58.3%' }} />
            </div>
            <div className={s.zone_labels} aria-hidden="true">
              <span>0</span>
              <span>Good ≤0.1</span>
              <span>≤0.25</span>
              <span>Poor &gt;0.25</span>
              <span>0.6+</span>
            </div>
          </div>
        </div>
      </section>

      {/* Result Grid */}
      <section aria-label={isKo ? '종합 결과' : 'Overall results'}>
        <div className={s.result_grid}>
          {/* LCP */}
          <div className={s.result_card}>
            <div className={s.result_metric_name}>LCP</div>
            <div className={s.result_value}>{lcpVal.toFixed(1)}s</div>
            <span className={`${s.result_badge} ${BADGE_CLASS[lcpRating]}`}>{badgeLabel(lcpRating)}</span>
          </div>
          {/* INP */}
          <div className={s.result_card}>
            <div className={s.result_metric_name}>INP</div>
            <div className={s.result_value}>{Math.round(inpVal)}ms</div>
            <span className={`${s.result_badge} ${BADGE_CLASS[inpRating]}`}>{badgeLabel(inpRating)}</span>
          </div>
          {/* CLS */}
          <div className={s.result_card}>
            <div className={s.result_metric_name}>CLS</div>
            <div className={s.result_value}>{clsVal.toFixed(2)}</div>
            <span className={`${s.result_badge} ${BADGE_CLASS[clsRating]}`}>{badgeLabel(clsRating)}</span>
          </div>
          {/* Overall */}
          <div className={`${s.result_card} ${s.result_card_overall}`}>
            <div className={s.result_metric_name}>{isKo ? '종합' : 'Overall'}</div>
            <div className={s.result_value}>—</div>
            <span className={`${s.result_badge} ${BADGE_CLASS[overall]}`}>{badgeLabel(overall)}</span>
          </div>
        </div>
      </section>

      {/* Tips Box */}
      <section className={s.tips_box} aria-label={isKo ? '개선 팁' : 'Improvement tips'}>
        <div className={s.tips_title}>
          💡 {isKo ? '개선 팁' : 'Improvement Tips'}
          <span className={`${s.badge} ${BADGE_CLASS[overall]}`} style={{ marginLeft: '0.5rem' }}>{badgeLabel(overall)}</span>
        </div>
        <ul className={s.tips_list}>
          {tips.map((tip, i) => <li key={i}>{tip}</li>)}
        </ul>
      </section>

      {/* Bottom 7 sections */}
      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="performance/core-web-vitals" />
      <div className="w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">AD</div>
      <SeoSection
        ko={{
          title: 'Core Web Vitals 판정기란 무엇인가요?',
          description: 'Core Web Vitals(핵심 웹 지표)는 Google이 2021년부터 검색 순위 알고리즘에 직접 반영하는 3가지 사용자 경험 지표입니다. LCP(최대 콘텐츠풀 페인트)는 페이지 주요 콘텐츠 로딩 속도, INP(다음 페인트까지의 응답)는 클릭·탭 등 입력 반응성, CLS(누적 레이아웃 이동)는 페이지 시각 안정성을 측정합니다. 2024년에는 기존 FID(첫 입력 지연)가 INP로 공식 교체되어, 현재 공식 지표는 LCP·INP·CLS 세 가지입니다. PageSpeed Insights 또는 Chrome DevTools에서 측정한 수치를 입력하면 Google 공식 Good/Needs Work/Poor 기준으로 즉시 판정하며, 세 지표 모두 Good이어야 Google 기준 통과로 인정됩니다. 이 툴은 서버 요청 없이 브라우저에서 즉시 계산되며, 수치 입력만으로 SEO 성능 기준을 빠르게 파악할 수 있습니다.',
          useCases: [
            {
              icon: '🔍',
              title: 'SEO 점검',
              desc: 'PageSpeed Insights에서 측정한 LCP·INP·CLS 수치를 입력해 Google 검색 순위 기준을 통과하는지 즉시 확인하고, 개선 우선순위를 결정할 수 있습니다.',
            },
            {
              icon: '🛠️',
              title: '개발 전후 비교',
              desc: '웹 성능 최적화 작업 전후의 수치를 각각 입력해 개선 효과를 정량적으로 확인하고, 팀 내 성과 보고 자료로 활용할 수 있습니다.',
            },
            {
              icon: '📊',
              title: '경쟁사 벤치마킹',
              desc: '경쟁 사이트의 Core Web Vitals 수치(PageSpeed Insights 공개 결과)를 입력해 자사와 비교하고, 어느 지표에서 우위 또는 열위인지 파악할 수 있습니다.',
            },
            {
              icon: '📋',
              title: '클라이언트 보고',
              desc: '디지털 에이전시 또는 프리랜서가 클라이언트에게 현재 사이트 성능 상태를 직관적으로 설명할 때, 각 지표의 Good/Needs Work/Poor 등급을 시각적으로 제시할 수 있습니다.',
            },
          ],
          steps: [
            {
              step: '수치 확인',
              desc: 'PageSpeed Insights(pagespeed.web.dev)에서 분석하고 싶은 URL을 입력하여 LCP(초 단위), INP(밀리초 단위), CLS(소수점 단위) 세 가지 수치를 확인합니다.',
            },
            {
              step: '값 입력',
              desc: '슬라이더를 조정하거나 숫자 입력란에 소수점까지 직접 붙여넣기 합니다. 6s 또는 600ms를 초과하는 값도 숫자 입력란에 자유롭게 입력 가능하며, 슬라이더는 최대 위치로 고정됩니다.',
            },
            {
              step: '등급 확인',
              desc: '각 지표 우측의 Good/Needs Work/Poor 뱃지와 하단 종합 결과 카드에서 Google 공식 기준 등급을 즉시 확인합니다. 세 지표 모두 Good이어야 종합 Good 판정입니다.',
            },
            {
              step: '개선 팁 적용',
              desc: '종합 등급에 따라 자동으로 표시되는 개선 팁을 참고하여 LCP·INP·CLS 각각의 최적화 방향을 확인하고, 공유 버튼으로 팀원이나 클라이언트와 결과를 공유하세요.',
            },
          ],
          faqs: [
            {
              q: 'FID는 어디 갔나요? INP가 뭔가요?',
              a: '2024년 3월 Google은 FID(First Input Delay)를 INP(Interaction to Next Paint)로 공식 교체했습니다. FID는 페이지 로딩 중 첫 번째 입력 이벤트만 측정했지만, INP는 페이지 전체 수명 동안 모든 클릭·탭·키 입력의 반응성을 종합 측정하는 더 포괄적인 지표입니다. Good 기준은 200ms 이하, Poor는 500ms 초과입니다.',
            },
            {
              q: '세 지표 중 하나만 Poor여도 SEO에 영향이 있나요?',
              a: 'Google은 LCP·INP·CLS 세 지표 모두 Good이어야 Core Web Vitals 기준 통과로 인정합니다. 하나라도 미달 시 완전 통과가 아닙니다. 단, Core Web Vitals는 Google 검색 알고리즘의 200개 이상 신호 중 하나로, 콘텐츠 품질이 유사한 경쟁 페이지와의 동점 상황에서 타이브레이커 역할을 합니다.',
            },
            {
              q: '수치는 어디서 측정하나요?',
              a: 'PageSpeed Insights(pagespeed.web.dev) 또는 Chrome DevTools의 Lighthouse 탭에서 측정할 수 있습니다. Search Console의 Core Web Vitals 보고서에서는 실제 사용자 데이터(CrUX 데이터)를 확인할 수 있습니다. 이 툴은 측정된 수치를 입력받아 Google 공식 기준으로 등급을 판정하는 계산기입니다.',
            },
            {
              q: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
              a: '이 툴의 판정 결과는 참고용으로만 제공됩니다. 정확한 수치와 공식 판정은 Google PageSpeed Insights 또는 Search Console을 통해 확인하시기 바랍니다.',
            },
          ],
        }}
        en={{
          title: 'What is Core Web Vitals Checker?',
          description: 'Core Web Vitals are three user experience metrics — LCP, INP, and CLS — that Google uses as direct search ranking signals since 2021. LCP (Largest Contentful Paint) measures how quickly the main content of a page loads. INP (Interaction to Next Paint) measures responsiveness to user clicks, taps, and key presses across the entire page lifecycle. CLS (Cumulative Layout Shift) measures visual stability by quantifying unexpected layout shifts. In March 2024, Google officially replaced FID (First Input Delay) with INP as the responsiveness metric. To pass Google\'s Core Web Vitals assessment, all three metrics must be in the Good range. Enter your scores from PageSpeed Insights or Chrome DevTools Lighthouse to instantly see which thresholds you meet — no server required, runs entirely in your browser.',
          useCases: [
            {
              icon: '🔍',
              title: 'SEO Audit',
              desc: 'Paste your LCP, INP, and CLS values from PageSpeed Insights to instantly verify whether your site meets Google\'s ranking signal thresholds and identify which metrics to prioritize for improvement.',
            },
            {
              icon: '🛠️',
              title: 'Before / After Comparison',
              desc: 'Input Core Web Vitals scores before and after a performance optimization sprint to quantify the improvement and create a data-driven report for your team or stakeholders.',
            },
            {
              icon: '📊',
              title: 'Competitor Benchmarking',
              desc: 'Enter publicly available Core Web Vitals scores for competitor sites from PageSpeed Insights to see which metrics they excel at or lag behind, and focus your optimization efforts accordingly.',
            },
            {
              icon: '📋',
              title: 'Client Reporting',
              desc: 'Agencies and freelancers can use the Good / Needs Work / Poor verdict cards to visually communicate a client\'s current web performance status and build the case for performance improvements.',
            },
          ],
          steps: [
            {
              step: 'Get your scores',
              desc: 'Go to PageSpeed Insights (pagespeed.web.dev), enter the URL you want to analyze, and note down the LCP (in seconds), INP (in milliseconds), and CLS (decimal) values from the Core Web Vitals section.',
            },
            {
              step: 'Enter the values',
              desc: 'Drag the sliders or type values directly into the number inputs, including decimal precision. Values beyond the slider max (LCP > 6s, INP > 600ms) can still be entered in the number fields — the slider will pin to max while the rating uses your actual input.',
            },
            {
              step: 'Check your ratings',
              desc: 'The Good / Needs Work / Poor badge next to each metric updates instantly. Check the Overall card at the bottom of the results grid — all three must be Good for a passing score.',
            },
            {
              step: 'Apply improvement tips',
              desc: 'Read the context-aware tips that appear based on your overall rating. Use the share button to send results to your team or client for discussion and next-step planning.',
            },
          ],
          faqs: [
            {
              q: 'What happened to FID? What is INP?',
              a: 'Google officially replaced FID (First Input Delay) with INP (Interaction to Next Paint) in March 2024. FID only measured the delay before the browser could process the very first user interaction on a page. INP is more comprehensive — it measures the responsiveness of all clicks, taps, and key presses throughout the entire page lifecycle, making it a much better proxy for real-world interactivity.',
            },
            {
              q: 'Does a single Poor rating hurt my SEO?',
              a: 'Yes — Google requires all three metrics (LCP, INP, and CLS) to be in the Good range for a site to pass the Core Web Vitals assessment. A single Poor metric means the site does not fully pass. That said, Core Web Vitals is one of 200+ signals Google uses, and it primarily acts as a tiebreaker between pages with similar content quality.',
            },
            {
              q: 'Where do I measure these scores?',
              a: 'Use PageSpeed Insights (pagespeed.web.dev) for a quick lab measurement, or Chrome DevTools Lighthouse for a local test. For real-user data, check the Core Web Vitals report in Google Search Console, which uses Chrome User Experience Report (CrUX) field data aggregated from actual visitors.',
            },
            {
              q: 'Can I use this result as official data?',
              a: 'Results are for reference only. For official Core Web Vitals scores and SEO impact assessment, please use Google PageSpeed Insights or Google Search Console directly.',
            },
          ],
        }}
      />
    </div>
  );
}
