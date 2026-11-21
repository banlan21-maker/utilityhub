// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '스마트 퍼센트 계산기란 무엇인가요?',
          description: '스마트 퍼센트 계산기는 일상과 비즈니스에서 가장 자주 쓰이는 4가지 퍼센트 연산을 하나의 도구에서 실시간으로 처리하는 계산기입니다. 숫자를 입력하는 즉시 결과가 나타나며, 별도의 계산하기 버튼을 누를 필요가 없습니다. [기본 계산]은 "A의 B%가 얼마인지"를 구할 때, [증감률]은 투자 수익률·매출 증감·마케팅 성과 측정에, [할인율]은 쇼핑 중 실제 지불 금액과 절약 금액 확인에, [마진율]은 판매 이익률 계산에 최적화되어 있습니다. 모든 연산은 브라우저 내에서만 처리되어 서버 전송이 없으며, 계산 결과는 최대 5건까지 로컬 스토리지에 자동 저장됩니다. 결과값은 원 클릭으로 클립보드에 복사할 수 있고, 직관적인 프로그레스 바가 비율을 시각적으로 표현합니다. 천 단위 자동 콤마 포매팅으로 큰 숫자도 편리하게 입력할 수 있습니다.',
          useCases: [
            { icon: '🛍️', title: '쇼핑 할인 계산', desc: '마트나 쇼핑몰에서 "30% 할인" 태그를 봤을 때, 원래 가격과 할인율을 입력하면 실제 결제 금액과 절약 금액을 즉시 확인할 수 있어 충동구매를 줄이고 현명한 소비를 도와줍니다.' },
            { icon: '📈', title: '투자 수익률 측정', desc: '주식·코인·부동산 등 자산의 매입가와 현재가를 입력하면 증감률 탭에서 수익률(%)과 실제 손익 금액을 빨간색·파란색으로 직관적으로 표시해주어 투자 성과를 한눈에 파악할 수 있습니다.' },
            { icon: '💼', title: '비즈니스 마진 관리', desc: '원가와 판매가를 입력하면 마진율(%)과 건당 마진 금액을 실시간으로 계산합니다. 프리랜서 견적, 소규모 창업, 도·소매 비즈니스에서 적정 가격을 설정하는 데 바로 활용할 수 있습니다.' },
            { icon: '📊', title: '마케팅 성과 분석', desc: '지난달 방문자 수와 이번 달 방문자 수를 증감률 탭에 입력하면 방문자 증가율을 즉시 계산할 수 있습니다. 광고 CTR, 전환율 변화 등 다양한 마케팅 지표 비교에도 활용 가능합니다.' },
          ],
          steps: [
            { step: '탭 선택', desc: '상단 4개 탭에서 원하는 계산 유형을 선택합니다. 기본 계산(A의 B%), 증감률(A→B 변화), 할인율(쇼핑 절약), 마진율(비즈니스 이익) 중 상황에 맞는 탭을 누르면 입력 필드가 즉시 전환됩니다.' },
            { step: '숫자 입력', desc: '문장형 입력 필드에 숫자를 입력합니다. 천 단위 콤마는 자동으로 포매팅되며 따로 입력할 필요가 없습니다. 숫자를 입력하는 순간 결과가 실시간으로 계산되어 하단에 표시됩니다.' },
            { step: '결과 확인', desc: '결과 카드에 메인 수치와 보조 정보(절약 금액, 마진 금액 등)가 함께 표시됩니다. 증감률은 증가 시 빨간색, 감소 시 파란색으로 구분되며, 프로그레스 바가 비율을 시각적으로 나타냅니다.' },
            { step: '복사·기록 활용', desc: '결과 옆 [복사] 버튼을 누르면 숫자가 클립보드에 복사되고 "복사 완료!" 토스트가 뜹니다. 계산 결과는 자동으로 최근 기록 영역에 저장되며, 최대 5건까지 브라우저를 닫아도 유지됩니다.' },
          ],
          faqs: [
            { q: '입력할 때마다 자동으로 계산되나요?', a: '네. 이 계산기는 별도의 계산하기 버튼이 없습니다. 숫자를 입력하는 즉시 onChange 이벤트로 실시간 연산이 실행되어 결과가 바로 나타납니다. 두 개의 입력 필드가 모두 채워지는 순간 자동으로 계산이 완료됩니다.' },
            { q: '계산 기록은 어디에 저장되나요?', a: '모든 계산 결과는 브라우저의 로컬 스토리지(localStorage)에 저장됩니다. 서버로 데이터가 전송되지 않으므로 개인정보 유출 걱정이 없습니다. 최대 5건이 유지되며, 새 계산이 추가될 때 가장 오래된 기록이 자동으로 제거됩니다.' },
            { q: '할인율 탭에서 할인율이 100%를 넘으면?', a: '할인율 탭은 0%~100% 범위에서만 정상 결과를 표시합니다. 0 미만이거나 100을 초과하는 경우 결과값이 표시되지 않습니다. 정상적인 할인율(예: 10%, 30%, 50%)을 입력하면 최종 결제금액과 절약 금액을 정확하게 계산합니다.' },
            { q: '모바일에서도 편리하게 사용할 수 있나요?', a: '네. 입력 필드에 inputMode="decimal" 속성이 적용되어 모바일에서 숫자 키패드가 자동으로 표시됩니다. 탭 메뉴는 모바일(600px 이하)에서 2열 2행으로 재배치되어 터치하기 쉽게 구성되며, 카드 레이아웃도 작은 화면에 최적화되어 있습니다.' },
          ],
        },
  en: {
          title: 'What is the Smart Percentage Calculator?',
          description: 'The Smart Percentage Calculator is a real-time, all-in-one tool that handles the four most common percentage operations in everyday life and business — all without pressing a single button. As you type, results appear instantly. The Basic tab answers "what is B% of A?", the Change tab measures percentage increase or decrease for investments and marketing metrics, the Discount tab calculates the final price and savings during shopping, and the Margin tab computes profit margin percentage and amount for business pricing. All calculations run entirely in the browser with zero server contact, protecting your data privacy. Results are automatically saved to localStorage (up to 5 entries), copyable with one click, and visualized with an animated progress bar. Large numbers are auto-formatted with commas for easy readability.',
          useCases: [
            { icon: '🛍️', title: 'Shopping Discounts', desc: 'Enter the original price and discount percentage to instantly see the final payment amount and exactly how much you save — helpful for avoiding impulse purchases and sticking to your budget.' },
            { icon: '📈', title: 'Investment Returns', desc: 'Input your purchase price and current value in the Change tab to see your return percentage highlighted in red (gain) or blue (loss), along with the actual profit or loss amount for quick portfolio review.' },
            { icon: '💼', title: 'Business Pricing', desc: 'Enter cost and selling price in the Margin tab to compute the profit margin percentage and margin amount per sale — ideal for freelancers, small business owners, and retail pricing decisions.' },
            { icon: '📊', title: 'Marketing Analytics', desc: 'Compare last month\'s and this month\'s metrics (visitors, clicks, conversions) in the Change tab to calculate growth rates instantly, making it easy to report marketing performance without a spreadsheet.' },
          ],
          steps: [
            { step: 'Select a Tab', desc: 'Choose from the four tabs at the top: Basic (A × B%), Change (A→B growth), Discount (shopping savings), or Margin (business profit). The input fields and labels update immediately to match the selected mode.' },
            { step: 'Type Your Numbers', desc: 'Enter values in the natural-language input fields. Numbers auto-format with commas as you type — no need to add them manually. As soon as both fields have values, the result appears in real time below.' },
            { step: 'Read the Result', desc: 'The result card shows the main figure plus secondary info (savings amount, margin amount, etc.). Change mode colors the result red for increases and blue for decreases. An animated progress bar gives a visual sense of the ratio.' },
            { step: 'Copy & Review History', desc: 'Click the Copy button to copy the result to your clipboard; a "Copied!" toast confirms the action. Every calculation is automatically saved to the Recent History section (up to 5 entries, persisted across browser sessions).' },
          ],
          faqs: [
            { q: 'Is there a Calculate button?', a: 'No — there is no Calculate button by design. The tool uses real-time onChange listeners on both input fields. The moment both fields contain valid numbers, the result appears automatically, making the workflow faster for repeated calculations.' },
            { q: 'Where is my history stored?', a: 'All calculation history is stored in your browser\'s localStorage, so nothing is sent to any server. Your data is completely private. Up to 5 results are kept; when a new entry is added and the limit is reached, the oldest entry is automatically removed.' },
            { q: 'What happens if I enter a discount over 100%?', a: 'The Discount tab is designed for valid discount rates between 0% and 100%. Entering a value outside this range will cause the result panel to disappear, preventing nonsensical output. Enter a normal discount rate (e.g., 10, 30, 50) to see the correct final price and savings.' },
            { q: 'Is it optimized for mobile?', a: 'Yes. The number inputs use inputMode="decimal" to trigger the numeric keypad on mobile devices automatically. On screens under 600px wide, the four tabs reflow into a 2×2 grid for easy tapping, and the card layout adjusts for comfortable single-thumb use.' },
          ],
        },
};
