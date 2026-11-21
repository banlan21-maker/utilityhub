// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: 'D-Day & 날짜 계산기란 무엇인가요?',
          description:
            'D-Day 계산기는 특정 목표일까지 남은 날짜를 하루도 빠짐없이 정확하게 계산해주는 온라인 도구입니다. 수능·공무원 시험·결혼식·여행·프로젝트 마감일 등 중요한 날까지 몇 일이 남았는지 한눈에 파악할 수 있습니다. 또한 날짜 더하기/빼기 기능을 통해 계약 만료일, 수습 기간 종료일, 납기일 계산 등 업무에 필요한 날짜 산술도 간편하게 처리합니다. 모든 계산은 사용자의 로컬 자정 기준이라 타임존 오차 없이 동작하며, 월 더하기 시 월말이 보호되어 "1월 31일 + 1개월"이 "2월 28일/29일"로 정확히 계산됩니다.',
          useCases: [
            { icon: '📚', title: '시험 준비 D-Day 관리', desc: '수능, 토익, 공무원 시험 등 목표 시험일까지 남은 일수를 확인해 학습 계획을 세우고 동기를 유지합니다.' },
            { icon: '💍', title: '결혼 & 기념일 카운트다운', desc: '결혼식 D-day, 100일·1주년 기념일 등 소중한 날까지 남은 날을 계산하고 준비 일정을 역산합니다.' },
            { icon: '💼', title: '프로젝트 & 계약 관리', desc: '계약 만료일, 프로젝트 납기일, 수습 기간 종료일 등 업무상 중요한 날짜를 정확히 계산해 일정을 관리합니다.' },
            { icon: '✈️', title: '여행 & 이벤트 준비', desc: '해외여행 출발일, 콘서트·페스티벌 날짜까지 D-day를 설정해두고 준비물·예약 일정을 단계적으로 챙깁니다.' },
          ],
          steps: [
            { step: '목표 날짜 선택', desc: '달력 입력창에서 D-Day로 지정할 날짜를 선택합니다. 오늘 이전 날짜를 선택하면 "D+경과일"로 표시됩니다.' },
            { step: 'D-Day 결과 확인', desc: '선택 즉시 오늘로부터 며칠 남았는지(또는 며칠이 지났는지) 자동으로 계산되며, 상세 통계(개월/주/시간)도 함께 표시됩니다.' },
            { step: '날짜 더하기/빼기 활용', desc: '기준 날짜에 일수나 개월 수를 더하거나 빼서 정확한 결과 날짜를 계산합니다. 음수를 입력하면 과거로 거슬러 갑니다. 월말 보호로 "1월 31일 + 1개월"은 "2월 말일"로 정확히 계산됩니다.' },
            { step: '결과 활용 & 공유', desc: '계산된 D-Day 결과를 "결과 복사" 버튼으로 클립보드에 저장하거나 SNS 공유 버튼으로 친구에게 전달하세요.' },
          ],
          faqs: [
            { q: 'D-Day 계산 시 오늘 날짜도 포함되나요?', a: '오늘이 목표일이면 "D-Day"로 표시되고 내일은 D-1, 모레는 D-2로 계산됩니다. 한국 시간 자정(00:00)을 기준으로 하므로 KST 사용자에게 타임존 오차가 발생하지 않습니다.' },
            { q: '월 더하기 시 1월 31일 + 1개월은 어떻게 계산되나요?', a: '본 계산기는 월말 보호 로직을 적용하여 "1월 31일 + 1개월"을 "2월 28일(평년) 또는 2월 29일(윤년)"로 정확히 계산합니다. 자동 보정으로 3월로 넘어가지 않습니다. 계약 만기일/수습 기간 종료일 계산에서도 안심하고 사용할 수 있습니다.' },
            { q: '상세 통계의 개월/주/시간은 합산해도 되나요?', a: '안 됩니다. 각각은 동일한 D-day를 다른 단위로 환산한 독립적인 값입니다. 예를 들어 D-100이면 "약 3개월", "14주 + 2일", "2,400시간"이며 모두 동일한 기간을 의미합니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로 제공됩니다. 법적 효력이 있는 날짜(계약 만기일, 법정 기한 등)는 반드시 공식 캘린더와 대조하거나 전문가와 상의하세요.' },
          ],
        },
  en: {
          title: 'What is a D-Day & Date Calculator?',
          description:
            'A D-Day calculator tells you exactly how many days remain until an important target date — or how many days have passed since one. It is perfect for tracking exam prep countdowns, wedding dates, travel departures, and project deadlines. The date arithmetic feature handles contract expiration dates, probation period endings, and due date calculations with precision. All calculations use local midnight as reference (no timezone drift) and the month-add operation is end-of-month safe — so "Jan 31 + 1 month" correctly returns "Feb 28/29", not "Mar 2/3".',
          useCases: [
            { icon: '📚', title: 'Exam Preparation Countdown', desc: 'Track days remaining until major exams or certifications to stay motivated and structure your study plan.' },
            { icon: '💍', title: 'Anniversaries & Special Events', desc: 'Count down to weddings, 100-day milestones, anniversaries, and other special occasions.' },
            { icon: '💼', title: 'Project & Contract Deadlines', desc: 'Calculate contract expiration dates, project due dates, and probation period end dates for accurate schedule management.' },
            { icon: '✈️', title: 'Travel & Event Preparation', desc: 'Set a D-day for your trip departure or concert date and use the countdown to prepare step-by-step.' },
          ],
          steps: [
            { step: 'Select your target date', desc: 'Pick a date from the calendar input. Selecting a past date will show elapsed days as "D+N" instead of a countdown.' },
            { step: 'View your D-Day result', desc: 'Days remaining (or elapsed) are calculated instantly, displayed as a large D-number with month/week/hour breakdowns.' },
            { step: 'Use date arithmetic', desc: 'Add or subtract days and months from the base date. Negative numbers go into the past. Month-add is end-of-month safe: "Jan 31 + 1 month" returns "Feb 28/29".' },
            { step: 'Copy & share', desc: 'Click "Copy Result" to save the full breakdown to your clipboard, or use the share buttons to send your D-Day to friends.' },
          ],
          faqs: [
            { q: 'Is today included in the D-Day count?', a: 'If today is the target date, the result shows "D-Day"; tomorrow is D-1 and the day after is D-2. The calculator uses your local midnight as reference, so there is no timezone drift for KST or any other zone.' },
            { q: 'How does "Jan 31 + 1 month" work?', a: 'This calculator applies end-of-month protection — "Jan 31 + 1 month" correctly returns "Feb 28" in regular years or "Feb 29" in leap years, not "Mar 2/3" as JavaScript would do by default. This makes it safe for contract expiration and probation end calculations.' },
            { q: 'Can I sum the months/weeks/hours stats?', a: 'No. Each stat is an independent conversion of the same D-Day into a different unit. For example, D-100 = "about 3 months" = "14 weeks + 2 days" = "2,400 hours" — all describing the same period.' },
            { q: 'Can I use this result as official data?', a: 'Results are provided for reference only. For legally binding dates (contract expirations, statutory deadlines), always cross-check with official calendars or consult a professional.' },
          ],
        },
};
