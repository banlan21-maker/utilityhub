'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Layers, Monitor, Smartphone } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import {
  METRICS, METRIC_KEYS, assess, decodeDevice, encodeDevice, formatMetric, parseMetric,
  type Device, type MetricKey, type Rating,
} from './cwv';
import s from './core-web-vitals.module.css';
import { ui } from '@/app/components/ui';

// ── 등급 이름 (뱃지·결과 카드·설명문 모두 같은 표현) ──
const RATING_LABEL: Record<'ko' | 'en', Record<Rating, string>> = {
  ko: { good: 'Good(양호)', needs: 'Needs Improvement(개선 필요)', poor: 'Poor(나쁨)' },
  en: { good: 'Good', needs: 'Needs Improvement', poor: 'Poor' },
};
const BADGE_CLASS: Record<Rating, string> = { good: s.badge_good, needs: s.badge_needs, poor: s.badge_poor };

// ── 지표별 개선 팁 (Good이 아닌 지표만 보여 준다) ──
const TIPS: Record<MetricKey, Record<'needs' | 'poor', { ko: string[]; en: string[] }>> = {
  lcp: {
    needs: {
      ko: ['첫 화면의 큰 이미지(히어로)를 WebP·AVIF로 줄이고 fetchpriority="high"를 지정하세요.', '첫 화면에 쓰는 글꼴·이미지는 preload로 먼저 불러오고, 서버 응답(TTFB)이 0.8초를 넘으면 캐시·CDN부터 손보세요.'],
      en: ['Compress the hero image to WebP or AVIF and give it fetchpriority="high".', 'Preload the fonts and images used above the fold, and fix caching or add a CDN if TTFB is above 0.8 s.'],
    },
    poor: {
      ko: ['렌더링을 막는 CSS·자바스크립트를 줄이거나 지연 로딩하세요.', 'LCP 요소(첫 화면 큰 이미지)에는 lazy loading을 쓰지 말고, CDN으로 이미지를 빠르게 전달하세요.', '서버 응답이 느리면(TTFB 1초 이상) 페이지 캐시·서버 위치부터 점검하세요.'],
      en: ['Cut or defer render-blocking CSS and JavaScript.', 'Never lazy-load the LCP element (the large first-screen image), and serve images from a CDN.', 'If the server is slow (TTFB over 1 s), check page caching and server location first.'],
    },
  },
  inp: {
    needs: {
      ko: ['클릭 뒤 오래 도는 자바스크립트 작업을 나누세요 (scheduler.yield, setTimeout).', '채팅·광고·태그 같은 무거운 서드파티 스크립트를 늦게 불러오세요.'],
      en: ['Break up long JavaScript tasks that run after a click (scheduler.yield or setTimeout).', 'Defer heavy third-party scripts such as chat widgets, ads and tag managers.'],
    },
    poor: {
      ko: ['React·Vue 하이드레이션 비용을 줄이고(코드 분할, 지연 하이드레이션) 이벤트 핸들러를 가볍게 만드세요.', '입력 이벤트는 디바운스하고, 당장 필요 없는 작업은 requestIdleCallback으로 미루세요.', '크롬 개발자 도구 Performance 탭에서 50ms를 넘는 긴 작업(Long task)부터 찾으세요.'],
      en: ['Reduce React or Vue hydration cost (code splitting, lazy hydration) and keep event handlers light.', 'Debounce input handlers and push non-urgent work to requestIdleCallback.', 'Find long tasks over 50 ms in the Chrome DevTools Performance panel first.'],
    },
  },
  cls: {
    needs: {
      ko: ['이미지·광고·임베드에 width·height 또는 aspect-ratio를 지정하세요.', '늦게 뜨는 배너·쿠키 안내는 미리 자리를 잡아 두세요.'],
      en: ['Set width and height or aspect-ratio on images, ads and embeds.', 'Reserve space for late-loading banners and cookie notices.'],
    },
    poor: {
      ko: ['웹 글꼴이 바뀌며 글자가 밀리지 않게 font-display와 대체 글꼴 크기를 맞추세요.', '광고 슬롯은 고정 크기로 두고, 콘텐츠 위쪽에 요소를 끼워 넣지 마세요.', '애니메이션은 top·left 대신 transform으로 움직이세요.'],
      en: ['Stop web-font swaps from shifting text: use font-display and match fallback font metrics.', 'Give ad slots a fixed size and never insert elements above existing content.', 'Animate with transform instead of top or left.'],
    },
  },
};
const GOOD_TIPS = {
  ko: ['세 지표 모두 구글 기준을 통과했습니다. 지금 상태를 유지하세요.', '배포 뒤에는 PageSpeed Insights로 다시 측정해 수치가 나빠지지 않았는지 확인하세요.', '서치콘솔 코어 웹 바이탈 보고서에서 실제 사용자 데이터를 주기적으로 확인하세요.'],
  en: ['All three metrics pass Google’s thresholds. Keep it that way.', 'Re-check with PageSpeed Insights after each release to catch regressions.', 'Watch real-user data in the Search Console Core Web Vitals report.'],
};

const EMPTY: Record<MetricKey, string> = { lcp: '', inp: '', cls: '' };
const DEFAULTS: Record<Device, Record<MetricKey, string>> = {
  mobile: { lcp: '2.5', inp: '200', cls: '0.1' },
  desktop: { ...EMPTY },
};

const ZONES: Record<MetricKey, { widths: string[]; labels: string[] }> = {
  lcp: { widths: ['41.7%', '25%', '33.3%'], labels: ['0s', 'Good ≤2.5s', '≤4s', 'Poor >4s', '6s+'] },
  inp: { widths: ['33.3%', '50%', '16.7%'], labels: ['0ms', 'Good ≤200ms', '≤500ms', 'Poor >500ms', '600ms+'] },
  cls: { widths: ['16.7%', '25%', '58.3%'], labels: ['0', 'Good ≤0.1', '≤0.25', 'Poor >0.25', '0.6+'] },
};

export default function CoreWebVitalsClient({ seo }: { seo?: React.ReactNode }) {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const L = isKo ? 'ko' : 'en';

  const [device, setDevice] = useState<Device>('mobile');
  const [vals, setVals] = useState<Record<Device, Record<MetricKey, string>>>(DEFAULTS);
  const touched = useRef(false);

  // 주소에 담긴 값으로 시작 (?m=2.51,201,0.101&d=...&v=d)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const m = decodeDevice(q.get('m'));
    const d = decodeDevice(q.get('d'));
    if (m || d) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 주소의 공유 값은 마운트 뒤에만 읽을 수 있다
      setVals({ mobile: m ?? { ...EMPTY }, desktop: d ?? { ...EMPTY } });
      if (q.get('v') === 'd') setDevice('desktop');
    }
  }, []);

  // 사용자가 값을 바꾸면 주소에 저장 → 공유 버튼·주소 복사가 같은 결과를 연다
  useEffect(() => {
    if (!touched.current) return;
    const q = new URLSearchParams();
    const hasAny = (v: Record<MetricKey, string>) => METRIC_KEYS.some((k) => v[k].trim());
    if (hasAny(vals.mobile)) q.set('m', encodeDevice(vals.mobile));
    if (hasAny(vals.desktop)) q.set('d', encodeDevice(vals.desktop));
    if (device === 'desktop') q.set('v', 'd');
    const qs = q.toString().replace(/%2C/g, ','); // 쉼표는 그대로 (읽기 쉬운 공유 주소)
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
  }, [vals, device]);

  const current = vals[device];
  const result = useMemo(() => assess(current), [current]);
  const other: Device = device === 'mobile' ? 'desktop' : 'mobile';
  const both = useMemo(() => ({ mobile: assess(vals.mobile), desktop: assess(vals.desktop) }), [vals]);

  const setValue = (k: MetricKey, raw: string) => {
    touched.current = true;
    // 음수 기호는 받지 않는다
    const clean = raw.replace(/-/g, '').slice(0, 12);
    setVals((v) => ({ ...v, [device]: { ...v[device], [k]: clean } }));
  };
  const setSlider = (k: MetricKey, n: number) => {
    const d = METRICS[k].decimals;
    setValue(k, String(Number(n.toFixed(d))));
  };
  const pickDevice = (d: Device) => { touched.current = true; setDevice(d); };

  const label = (r: Rating) => RATING_LABEL[L][r];
  // 결과 카드처럼 좁은 칸에서는 영어 등급과 한국어 풀이를 두 줄로
  const label2 = (r: Rating) => {
    const [en, ko] = RATING_LABEL[L][r].split('(');
    return ko ? <>{en}<small className={s.badge_sub}>({ko}</small></> : en;
  };
  const deviceName = (d: Device) => (d === 'mobile' ? (isKo ? '모바일' : 'Mobile') : (isKo ? '데스크톱' : 'Desktop'));

  // Good이 아닌 지표의 팁만, Poor 먼저
  const tipGroups = useMemo(() => {
    const order = METRIC_KEYS
      .filter((k) => result.ratings[k] && result.ratings[k] !== 'good')
      .sort((a, b) => (result.ratings[a] === 'poor' ? 0 : 1) - (result.ratings[b] === 'poor' ? 0 : 1));
    return order.map((k) => ({ k, r: result.ratings[k] as 'needs' | 'poor', tips: TIPS[k][result.ratings[k] as 'needs' | 'poor'][L] }));
  }, [result, L]);

  const titleStr = isKo ? 'Core Web Vitals 판정기' : 'Core Web Vitals Checker';
  const descStr = isKo
    ? 'LCP·INP·CLS 수치를 넣으면 Good(양호)·Needs Improvement(개선 필요)·Poor(나쁨)를 바로 판정합니다. 구글 현행 공식 기준 적용 (2024년 3월 INP 도입)'
    : 'Enter LCP, INP and CLS to get Google’s Good / Needs Improvement / Poor rating instantly. Uses Google’s current official thresholds (INP since March 2024).';
  const metricHint: Record<MetricKey, string> = {
    lcp: isKo ? '첫 화면 주요 콘텐츠가 그려지는 시간 (초)' : 'Time for the largest content element to render (seconds)',
    inp: isKo ? '클릭·탭 등 입력 반응 시간 (밀리초, 2024년 3월 FID 대체)' : 'Input responsiveness in ms — replaced FID in March 2024',
    cls: isKo ? '화면이 밀리는 정도 (단위 없음)' : 'Visual stability — unexpected layout shifts (unitless)',
  };
  const fullName: Record<MetricKey, string> = { lcp: 'Largest Contentful Paint', inp: 'Interaction to Next Paint', cls: 'Cumulative Layout Shift' };

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<Layers />} title={titleStr} subtitle={descStr} />

      {/* 기기 탭 */}
      <div className={`${ui.segmented} ${s.device_tabs}`} role="tablist" aria-label={isKo ? '측정 기기' : 'Device'}>
        {(['mobile', 'desktop'] as Device[]).map((d) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={device === d}
            className={`${ui.segment} ${device === d ? ui.segmentActive : ''} ${s.device_tab}`}
            onClick={() => pickDevice(d)}
          >
            {d === 'mobile' ? <Smartphone size={16} /> : <Monitor size={16} />}
            {deviceName(d)}
            {both[d].overall && <span className={`${s.dot} ${BADGE_CLASS[both[d].overall!]}`} aria-hidden="true" />}
          </button>
        ))}
      </div>

      <section className={ui.card} aria-label={isKo ? `${deviceName(device)} 지표 입력` : `${deviceName(device)} metric inputs`}>
        {METRIC_KEYS.map((k) => {
          const conf = METRICS[k];
          const parsed = parseMetric(k, current[k]);
          const r = result.ratings[k];
          const sliderVal = Math.min(conf.max, parsed.value ?? 0);
          return (
            <div key={k} className={s.metric_block}>
              <div className={s.metric_top}>
                <div className={s.metric_info}>
                  <div className={s.metric_name}>{k.toUpperCase()} <span className={s.metric_fullname}>— {fullName[k]}</span></div>
                  <div className={s.metric_hint}>{metricHint[k]}</div>
                </div>
                {r ? (
                  <span className={`${s.badge} ${BADGE_CLASS[r]}`}>{label(r)}</span>
                ) : (
                  <span className={`${s.badge} ${s.badge_empty}`}>{isKo ? '값을 입력하세요' : 'Enter a value'}</span>
                )}
              </div>

              <div className={s.input_row}>
                <input
                  type="range"
                  className={`${s.slider} ${parsed.value === null ? s.slider_empty : ''}`}
                  min={0} max={conf.max} step={k === 'inp' ? 10 : k === 'lcp' ? 0.1 : 0.01}
                  value={sliderVal}
                  onChange={(e) => setSlider(k, Number(e.target.value))}
                  aria-label={isKo ? `${k.toUpperCase()} 슬라이더` : `${k.toUpperCase()} slider`}
                />
                <input
                  type="text"
                  inputMode="decimal"
                  className={`${ui.input} ${s.number_input}`}
                  value={current[k]}
                  placeholder={k === 'lcp' ? '2.5' : k === 'inp' ? '200' : '0.1'}
                  onChange={(e) => setValue(k, e.target.value)}
                  onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                  aria-label={isKo ? `${k.toUpperCase()} 값 (${conf.unit || '단위 없음'})` : `${k.toUpperCase()} value (${conf.unit || 'unitless'})`}
                />
                <span className={s.unit_label}>{conf.unit}</span>
              </div>

              <div className={s.zone_bar_wrap} aria-hidden="true">
                <div className={s.zone_bar}>
                  <div className={s.zone_good} style={{ width: ZONES[k].widths[0] }} />
                  <div className={s.zone_needs} style={{ width: ZONES[k].widths[1] }} />
                  <div className={s.zone_poor} style={{ width: ZONES[k].widths[2] }} />
                </div>
                <div className={s.zone_labels}>{ZONES[k].labels.map((t) => <span key={t}>{t}</span>)}</div>
              </div>

              {parsed.invalid && (
                <div className={`${ui.notice} ${ui.amber} ${s.note}`} role="alert">{isKo ? '숫자만 입력해 주세요 (예: 2.5, 2500ms)' : 'Please enter a number (e.g. 2.5 or 2500ms)'}</div>
              )}
              {parsed.convertedFrom && parsed.value !== null && (
                <div className={`${ui.notice} ${ui.gray} ${s.note}`}>
                  {isKo
                    ? `${parsed.convertedFrom}를 ${formatMetric(k, parsed.value)}로 바꿔 판정했습니다.`
                    : `Converted ${parsed.convertedFrom} to ${formatMetric(k, parsed.value)}.`}
                </div>
              )}
              {parsed.value !== null && parsed.value > conf.max && (
                <div className={`${ui.notice} ${ui.amber} ${s.note}`}>
                  {isKo
                    ? `슬라이더 최대(${conf.max}${conf.unit})를 넘는 값입니다. 입력값 ${formatMetric(k, parsed.value)} 기준으로 판정합니다.`
                    : `Above the slider maximum (${conf.max}${conf.unit}); rated on your input ${formatMetric(k, parsed.value)}.`}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* 결과 */}
      <section aria-label={isKo ? '판정 결과' : 'Results'} aria-live="polite">
        <div className={s.result_grid}>
          {METRIC_KEYS.map((k) => {
            const v = result.values[k];
            const r = result.ratings[k];
            return (
              <div key={k} className={`${ui.card} ${s.result_card}`}>
                <div className={s.result_metric_name}>{k.toUpperCase()}</div>
                <div className={s.result_value}>{v === null ? '—' : formatMetric(k, v)}</div>
                {r
                  ? <span className={`${s.result_badge} ${BADGE_CLASS[r]}`}>{label2(r)}</span>
                  : <span className={`${s.result_badge} ${s.badge_empty}`}>{isKo ? '값을 입력하세요' : 'Enter a value'}</span>}
              </div>
            );
          })}
          <div className={`${ui.card} ${s.result_card} ${s.result_card_overall}`}>
            <div className={s.result_metric_name}>{isKo ? `종합 · ${deviceName(device)}` : `Overall · ${deviceName(device)}`}</div>
            <div className={s.result_value}>
              {result.overall
                ? (isKo ? `3개 중 ${result.passed}개 통과` : `${result.passed} of 3 passed`)
                : (isKo ? `${result.entered}/3개 입력` : `${result.entered}/3 entered`)}
            </div>
            {result.overall
              ? <span className={`${s.result_badge} ${BADGE_CLASS[result.overall]}`}>{label2(result.overall)}</span>
              : <span className={`${s.result_badge} ${s.badge_empty}`}>{isKo ? '판정 대기' : 'Waiting'}</span>}
          </div>
        </div>
      </section>

      {/* 모바일·데스크톱 나란히 비교 */}
      {(both.mobile.entered > 0 && both.desktop.entered > 0) ? (
        <section className={ui.card} aria-label={isKo ? '모바일·데스크톱 비교' : 'Mobile vs desktop'}>
          <h2 className={ui.cardTitle}>📱🖥️ {isKo ? '모바일·데스크톱 비교' : 'Mobile vs desktop'}</h2>
          <table className={s.compare_table}>
            <thead>
              <tr><th></th><th>{deviceName('mobile')}</th><th>{deviceName('desktop')}</th></tr>
            </thead>
            <tbody>
              {METRIC_KEYS.map((k) => (
                <tr key={k}>
                  <th scope="row">{k.toUpperCase()}</th>
                  {(['mobile', 'desktop'] as Device[]).map((d) => {
                    const v = both[d].values[k];
                    const r = both[d].ratings[k];
                    return (
                      <td key={d}>
                        {v === null ? '—' : formatMetric(k, v)}{' '}
                        {r && <span className={`${s.mini_badge} ${BADGE_CLASS[r]}`}>{label2(r)}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <th scope="row">{isKo ? '종합' : 'Overall'}</th>
                {(['mobile', 'desktop'] as Device[]).map((d) => {
                  const a = both[d];
                  return (
                    <td key={d}>
                      {a.overall
                        ? <span className={`${s.mini_badge} ${BADGE_CLASS[a.overall]}`}>{isKo ? `${a.passed}/3 통과` : `${a.passed}/3 passed`}</span>
                        : (isKo ? '판정 대기' : 'Waiting')}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </section>
      ) : (
        <p className={s.compare_hint}>
          {isKo
            ? `💡 ${deviceName(other)} 탭에도 값을 넣으면 두 기기의 결과를 나란히 비교합니다.`
            : `💡 Enter values in the ${deviceName(other)} tab too to compare both devices side by side.`}
        </p>
      )}

      {/* 개선 팁: Good이 아닌 지표만, Poor 먼저 */}
      <section className={ui.card} aria-label={isKo ? '개선 팁' : 'Improvement tips'}>
        <h2 className={ui.cardTitle}>💡 {isKo ? '개선 팁' : 'Improvement Tips'}</h2>
        {tipGroups.length > 0 ? (
          tipGroups.map(({ k, r, tips }) => (
            <div key={k} className={s.tip_group}>
              <div className={s.tip_head}>
                <strong>{k.toUpperCase()}</strong>
                <span className={`${s.mini_badge} ${BADGE_CLASS[r]}`}>{label(r)}</span>
              </div>
              <ul className={s.tips_list}>{tips.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          ))
        ) : result.overall === 'good' ? (
          <ul className={s.tips_list}>{GOOD_TIPS[L].map((t) => <li key={t}>{t}</li>)}</ul>
        ) : (
          <p className={s.compare_hint} style={{ margin: 0 }}>
            {isKo ? '입력한 지표는 모두 Good(양호)입니다. 나머지 지표를 입력하면 종합 판정과 팁을 보여 드립니다.' : 'Every metric you entered is Good. Fill in the rest to get the overall rating and tips.'}
          </p>
        )}
      </section>

      {/* 결과 해석 가이드 (서버 HTML에 포함되는 고정 내용) */}
      <section className={ui.card} aria-labelledby="cwv-guide">
        <h2 id="cwv-guide" className={ui.cardTitle}>📖 {isKo ? '결과 해석 가이드' : 'How to read your results'}</h2>
        <ul className={s.tips_list}>
          {(isKo ? [
            '숫자는 어디서? PageSpeed Insights 위쪽의 "실제 사용자 경험(필드 데이터)" 값이나 서치콘솔 → 코어 웹 바이탈 보고서 값을 넣으세요. 구글이 쓰는 것은 실험실(Lighthouse) 점수가 아니라 실제 방문자 28일치의 75번째 백분위 값입니다.',
            'LCP(가장 큰 콘텐츠 표시) — 2.5초 이하 Good(양호), 4초 초과 Poor(나쁨). 대부분 첫 화면의 큰 이미지·제목 글꼴이 원인입니다. 히어로 이미지에 fetchpriority="high"를 주고 WebP·AVIF로 줄이며, 서버 응답(TTFB)이 0.8초를 넘으면 캐시·CDN부터 손보세요.',
            'INP(상호작용 반응) — 200ms 이하 Good(양호), 500ms 초과 Poor(나쁨). 클릭 뒤 오래 도는 자바스크립트가 원인입니다. 긴 작업을 나누고(scheduler.yield, setTimeout), 무거운 서드파티 스크립트(채팅, 광고, 태그)를 늦게 불러오세요.',
            'CLS(레이아웃 흔들림) — 0.1 이하 Good(양호), 0.25 초과 Poor(나쁨). 크기를 정하지 않은 이미지·광고·임베드가 원인입니다. width·height 또는 aspect-ratio를 지정하고, 늦게 뜨는 배너는 미리 자리를 잡아 두세요.',
            '무엇부터? Poor(나쁨)인 지표가 있으면 그것부터, 없으면 Needs Improvement(개선 필요) 중 방문자가 많은 페이지 유형(상품·글 상세)부터 고칩니다. 세 지표가 모두 Good(양호)이어야 "통과"로 봅니다.',
          ] : [
            'Where do the numbers come from? Use the “Discover what your real users are experiencing” (field data) section at the top of PageSpeed Insights, or the Core Web Vitals report in Search Console. Google uses the 75th-percentile value of 28 days of real visits, not the Lighthouse lab score below it.',
            'LCP (Largest Contentful Paint) — Good at 2.5 s or less, Poor above 4 s. Usually a large hero image or web font on the first screen. Add fetchpriority="high" to the hero image, serve WebP or AVIF, and if TTFB is above 0.8 s fix caching or add a CDN first.',
            'INP (Interaction to Next Paint) — Good at 200 ms or less, Poor above 500 ms. Long JavaScript tasks after a click or tap are the cause. Break up long tasks (scheduler.yield or setTimeout) and defer heavy third-party scripts such as chat widgets, ads and tag managers.',
            'CLS (Cumulative Layout Shift) — Good at 0.1 or less, Poor above 0.25. Images, ads and embeds without reserved space push content around. Set width and height or aspect-ratio, and reserve space for late banners and cookie notices.',
            'What to fix first? Any Poor metric first; otherwise the Needs Improvement metric on your highest-traffic templates (product or article pages). A page only passes when all three metrics are Good.',
          ]).map((x) => <li key={x}>{x}</li>)}
        </ul>
      </section>

      <ShareBar title={titleStr} description={descStr} />
      <RelatedTools toolId="utilities/performance/core-web-vitals" />
      {seo}
    </div>
  );
}
