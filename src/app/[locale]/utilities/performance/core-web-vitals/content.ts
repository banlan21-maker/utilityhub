// Core Web Vitals 판정기 설명글 — 화면(SeoSection)과 한국어 FAQ 구조화 데이터(page.tsx)가 함께 쓴다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO_KO: SeoContent = {
  title: 'Core Web Vitals 판정기란 무엇인가요?',
  description:
    'Core Web Vitals(핵심 웹 지표)는 구글이 실제 사용자의 페이지 경험을 재는 세 가지 지표로, 구글 검색의 페이지 경험 신호 중 하나로 활용됩니다. LCP(Largest Contentful Paint)는 첫 화면의 가장 큰 콘텐츠가 그려지는 시간, INP(Interaction to Next Paint)는 클릭·탭·키 입력 뒤 화면이 반응하기까지 걸리는 시간, CLS(Cumulative Layout Shift)는 읽는 도중 화면이 밀리는 정도입니다. 2024년 3월 기존 FID가 INP로 교체되어 지금의 공식 지표는 LCP·INP·CLS 세 가지입니다. PageSpeed Insights나 서치콘솔에서 확인한 값을 넣으면 구글 공식 기준으로 Good(양호)·Needs Improvement(개선 필요)·Poor(나쁨)를 바로 판정하고, 세 지표 중 몇 개가 통과했는지와 Good이 아닌 지표만 골라 고치는 방법을 알려 줍니다. 예를 들어 LCP 2.51초·INP 201ms·CLS 0.101을 넣으면 세 지표 모두 기준을 아주 조금 넘은 개선 필요로, 화면에도 입력한 숫자 그대로 표시됩니다. 모바일과 데스크톱 값을 따로 넣어 나란히 비교할 수 있고, 입력한 값은 주소에 담겨 링크 하나로 팀원과 공유됩니다. 계산은 모두 브라우저 안에서 이뤄집니다.',
  useCases: [
    { icon: '🔍', title: 'SEO 점검', desc: 'PageSpeed Insights 위쪽의 실제 사용자 데이터(필드 데이터) 값을 넣어 세 지표 중 몇 개가 통과했는지 확인하고, Poor인 지표부터 고칠 순서를 정합니다.' },
    { icon: '📱', title: '모바일·데스크톱 비교', desc: '같은 페이지라도 모바일 LCP가 데스크톱보다 훨씬 느린 경우가 많습니다. 두 탭에 각각 값을 넣으면 기기별 등급을 나란히 보여 줘 어느 쪽을 먼저 손볼지 알 수 있습니다.' },
    { icon: '🛠️', title: '개선 전후 비교', desc: '이미지 최적화나 스크립트 정리 전후 값을 넣어 등급이 바뀌었는지 확인하고, 값이 담긴 공유 링크를 작업 기록이나 팀 보고에 그대로 붙여 넣습니다.' },
    { icon: '📋', title: '클라이언트 보고', desc: '에이전시나 프리랜서가 고객에게 현재 상태를 설명할 때, 지표별 Good(양호)·Needs Improvement(개선 필요)·Poor(나쁨) 등급과 "3개 중 몇 개 통과"를 한눈에 보여 줄 수 있습니다.' },
  ],
  steps: [
    { step: '수치 확인', desc: 'PageSpeed Insights(pagespeed.web.dev)에 주소를 넣고 위쪽 "실제 사용자 경험" 영역의 LCP(초), INP(밀리초), CLS 값을 확인합니다. 서치콘솔 코어 웹 바이탈 보고서 값도 됩니다.' },
    { step: '기기 고르고 값 입력', desc: '모바일·데스크톱 탭을 고른 뒤 슬라이더를 움직이거나 숫자를 입력합니다. LCP를 2500ms처럼 밀리초로 붙여 넣으면 2.50초로 자동 변환되고, 음수는 입력되지 않습니다.' },
    { step: '등급 확인', desc: '지표마다 Good(양호)·Needs Improvement(개선 필요)·Poor(나쁨) 뱃지가 붙고, 종합 카드에 "3개 중 몇 개 통과"가 나옵니다. 빈칸인 지표는 판정하지 않고 "값을 입력하세요"로 표시됩니다.' },
    { step: '개선 팁과 공유', desc: 'Good이 아닌 지표의 팁만 Poor 지표부터 보여 줍니다. 입력한 값은 주소에 저장되므로 공유 버튼이나 주소 복사로 같은 결과를 팀원에게 그대로 보낼 수 있습니다.' },
  ],
  faqs: [
    { q: 'FID는 어디 갔나요? INP가 뭔가요?', a: '구글은 2024년 3월 FID(First Input Delay)를 INP(Interaction to Next Paint)로 공식 교체했습니다. FID는 첫 번째 입력의 지연만 쟀지만, INP는 페이지를 쓰는 동안 일어난 클릭·탭·키 입력 전체의 반응 시간을 봅니다. Good(양호)은 200ms 이하, Poor(나쁨)는 500ms 초과입니다.' },
    { q: '세 지표 중 하나만 미달이어도 통과가 아닌가요?', a: '네. 구글은 LCP·INP·CLS 세 지표가 모두 Good(양호)일 때 코어 웹 바이탈을 통과한 것으로 봅니다. 그래서 이 판정기도 종합 카드에 "3개 중 몇 개 통과"를 보여 줍니다. 다만 코어 웹 바이탈은 구글 검색의 페이지 경험 신호 중 하나일 뿐이고, 검색 순위는 콘텐츠의 관련성과 품질이 훨씬 크게 좌우합니다.' },
    { q: '수치는 어디서 측정하나요?', a: 'PageSpeed Insights(pagespeed.web.dev)의 위쪽 필드 데이터나 구글 서치콘솔의 코어 웹 바이탈 보고서에서 실제 방문자 28일치의 75번째 백분위 값을 확인하세요. 아래쪽 Lighthouse 실험실 값은 참고용이며, INP는 실제 사용자 상호작용이 필요해 실험실 측정에는 나오지 않습니다.' },
    { q: 'PageSpeed Insights 점수(0~100점)와는 무엇이 다른가요?', a: '0~100 성능 점수는 Lighthouse가 한 번의 실험실 측정으로 계산한 점수이고, 코어 웹 바이탈 판정은 실제 방문자 데이터의 LCP·INP·CLS 세 값으로 정해집니다. 점수가 90점이 넘어도 실제 사용자 LCP가 2.5초를 넘으면 개선 필요로 판정될 수 있으니, 이 도구에는 필드 데이터 값을 넣는 것이 좋습니다.' },
    { q: '모바일과 데스크톱 값이 다른데 어느 쪽을 넣어야 하나요?', a: '둘 다 넣는 것이 좋습니다. 구글은 모바일과 데스크톱 데이터를 따로 집계하고, 대부분의 사이트는 모바일 쪽 값이 더 나쁩니다. 판정기 위쪽의 모바일·데스크톱 탭에 각각 입력하면 두 결과를 나란히 비교하는 표가 나타나 어느 기기를 먼저 개선할지 정하기 쉽습니다.' },
  ],
};

export const SEO_EN: SeoContent = {
  title: 'What is the Core Web Vitals Checker?',
  description:
    'Core Web Vitals are three metrics Google uses to measure real users’ page experience, and they are used as one of the page experience signals in Google Search. LCP (Largest Contentful Paint) is the time until the largest element on the first screen renders, INP (Interaction to Next Paint) is how long the page takes to respond after a click, tap or key press, and CLS (Cumulative Layout Shift) measures how much content jumps around while you read. INP replaced FID in March 2024, so the current set is LCP, INP and CLS. Enter the values from PageSpeed Insights or Search Console and this checker rates each one with Google’s official thresholds as Good, Needs Improvement or Poor, tells you how many of the three pass, and shows fix-it tips only for the metrics that are not Good — Poor ones first. For example, LCP 2.51 s, INP 201 ms and CLS 0.101 are each just over the Good threshold, so all three are rated Needs Improvement and the screen shows exactly those numbers. You can rate mobile and desktop separately and compare them side by side, and the values you enter are stored in the page address so one link shares the same result. Everything is calculated in your browser.',
  useCases: [
    { icon: '🔍', title: 'SEO Audit', desc: 'Paste the field-data values from the top of PageSpeed Insights to see how many of the three metrics pass and which Poor metric to fix first before anything else.' },
    { icon: '📱', title: 'Mobile vs Desktop', desc: 'Mobile LCP is often far slower than desktop on the same page. Enter both in their own tabs and the checker rates them side by side so you know which device to work on first.' },
    { icon: '🛠️', title: 'Before / After Comparison', desc: 'Enter values before and after optimizing images or trimming scripts to see whether the rating changed, then paste the share link with the values into your changelog or team report.' },
    { icon: '📋', title: 'Client Reporting', desc: 'Agencies and freelancers can show a client each metric’s Good, Needs Improvement or Poor rating and the “2 of 3 passed” summary at a glance, without explaining raw percentiles.' },
  ],
  steps: [
    { step: 'Get your values', desc: 'Run your URL in PageSpeed Insights (pagespeed.web.dev) and note LCP (seconds), INP (milliseconds) and CLS from the “Discover what your real users are experiencing” section, or use the Search Console report.' },
    { step: 'Pick a device and enter them', desc: 'Choose the Mobile or Desktop tab, then drag the sliders or type the numbers. An LCP pasted in milliseconds such as 2500ms is converted to 2.50 s automatically, and negative values are blocked.' },
    { step: 'Read the ratings', desc: 'Each metric gets a Good, Needs Improvement or Poor badge and the overall card shows how many of the three passed. Empty fields are not rated; they show “Enter a value” instead.' },
    { step: 'Fix and share', desc: 'Tips appear only for metrics that are not Good, Poor ones first. The values live in the page address, so the share button or a copied link opens the same result for your team.' },
  ],
  faqs: [
    { q: 'What happened to FID? What is INP?', a: 'Google replaced FID (First Input Delay) with INP (Interaction to Next Paint) in March 2024. FID only measured the delay before the very first interaction, while INP looks at the responsiveness of all clicks, taps and key presses during a visit. Good is 200 ms or less and Poor is above 500 ms.' },
    { q: 'If only one metric fails, does the page still fail?', a: 'Yes. Google treats a page as passing Core Web Vitals only when LCP, INP and CLS are all Good, which is why the overall card shows how many of the three passed. Keep in mind that Core Web Vitals are just one of Google’s page experience signals; relevance and content quality matter far more for rankings.' },
    { q: 'Where do I measure these values?', a: 'Use the field data at the top of PageSpeed Insights (pagespeed.web.dev) or the Core Web Vitals report in Google Search Console, which show the 75th percentile of 28 days of real visits. The Lighthouse lab numbers further down are only a guide, and INP needs real interactions so it does not appear in lab tests.' },
    { q: 'How is this different from the PageSpeed Insights score (0–100)?', a: 'The 0–100 performance score is calculated by Lighthouse from a single lab run, whereas the Core Web Vitals assessment comes from real visitors’ LCP, INP and CLS. A page can score above 90 and still be rated Needs Improvement if real-user LCP is over 2.5 seconds, so enter field-data values here.' },
    { q: 'Mobile and desktop values differ — which should I enter?', a: 'Enter both. Google collects mobile and desktop data separately, and most sites look worse on mobile. Put each set in its own tab at the top of the checker and a comparison table appears so you can decide which device to improve first.' },
  ],
};
