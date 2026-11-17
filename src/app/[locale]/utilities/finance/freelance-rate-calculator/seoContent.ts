import type { SeoContent } from '@/app/components/SeoSection';

/**
 * 프리랜서 적정 단가 계산기 SEO 콘텐츠.
 * page.tsx(한국어 FAQPage JSON-LD)와 SeoSection(화면 + 영어 FAQPage JSON-LD)이 같은 데이터를 쓴다.
 * 예시 수치는 FreelanceRateCalculatorClient.tsx의 calcKRTax / calcUSTax 계산 결과와 일치한다.
 */
export const FREELANCE_RATE_SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
    title: '프리랜서 적정 단가 계산기란?',
    description:
      "프리랜서 적정 단가 계산기는 '한 달에 얼마를 손에 쥐고 싶은가'에서 출발해 시간당 얼마를 받아야 하는지 거꾸로 계산하는 도구입니다. 목표 월 순수익(세후 실수령 목표액)에 월 고정지출을 더하고, 그 금액에 대한 세금 추정치와 10% 버퍼를 얹은 뒤, 월 총 근무 시간에 실 작업 효율을 곱한 유효 근무시간으로 나눕니다. 예를 들어 대한민국(KRW) 탭에서 목표 순수익 300만 원, 고정지출로 월세 50만 원·S/W 구독 5만 원·통신비 8만 원(합계 63만 원)을 넣고 월 160시간, 효율 80%로 두면 세금 추정 약 74만 원(종합소득세·지방소득세 약 48만 원 + 건강보험료 약 26만 원)과 버퍼 약 44만 원이 더해져 필요 월 총수입은 약 481만 원이 됩니다. 이를 유효 근무시간 128시간으로 나눈 시간당 적정 단가는 약 37,562원입니다. 같은 조건에서 효율만 60%로 낮추면 단가는 약 5만 원까지 올라갑니다. 한국 세금은 연 환산 금액에 종합소득세 누진세율(6~45%)을 적용하고 지방소득세 10%와 지역가입자 건강보험료율 7.09%를 더해 추정하며, 미국(USD) 탭은 자영업세와 연방소득세를 반영합니다. 수입이 들쭉날쭉하다면 성수기와 비수기 목표를 각각 넣어 보고 두 단가의 차이를 견적 범위로 삼을 수도 있습니다. 입력값은 브라우저에 저장되어 다음에 다시 열어도 이어서 조정할 수 있고, 결과는 '단가 계산 결과' 이미지로 내려받아 기록해 둘 수 있습니다. 견적서를 쓰거나 단가를 협상하기 전에 '이 금액 아래로 받으면 손해'인 최소선을 확인하는 용도로 쓰기 좋습니다.",
    useCases: [
      {
        icon: '💼',
        title: '첫 견적서를 쓰기 전',
        desc: '회사를 나와 처음 프리랜서 견적을 낼 때, 직장 다닐 때 받던 실수령액을 유지하려면 시간당 최소 얼마를 받아야 하는지 세금과 고정지출까지 넣어 확인합니다.',
      },
      {
        icon: '📈',
        title: '단가 인상 협상 근거',
        desc: '월세나 구독료가 오르거나 목표 수입을 높이고 싶을 때 바뀐 조건으로 다시 계산하면, 지금 단가가 얼마나 부족한지 숫자로 보여 줄 수 있어 인상 요청의 근거가 됩니다.',
      },
      {
        icon: '🧾',
        title: '플랫폼 수수료 반영',
        desc: "크몽·숨고 같은 중개 플랫폼을 통해 일한다면 한 달 예상 수수료를 '수수료' 같은 항목명으로 고정지출에 직접 추가해, 수수료를 떼고도 목표 수입이 남는 단가를 계산합니다.",
      },
      {
        icon: '🌏',
        title: '한국·미국 기준 비교',
        desc: '해외 클라이언트와 일하거나 미국 활동을 고민할 때 국가 탭을 바꿔 그 나라 통화로 금액을 넣으면(탭마다 금액을 따로 기억합니다), 세금 구조 차이에 따라 필요한 시간당 단가가 어떻게 달라지는지 볼 수 있습니다.',
      },
    ],
    steps: [
      {
        step: '국가를 고르고 목표 월 순수익 정하기',
        desc: "상단에서 '🇰🇷 대한민국 (KRW)' 또는 '🇺🇸 United States (USD)' 탭을 고른 뒤, '세후 실수령 목표액' 슬라이더로 한 달에 실제로 손에 쥐고 싶은 금액을 정합니다. 국가를 바꿔도 금액은 자동 환산되지 않으니 해당 통화 기준으로 다시 맞춰 주세요.",
      },
      {
        step: '월 고정지출 입력하기',
        desc: "'월 고정지출 관리'에서 + 월세, + S/W 구독 같은 프리셋 버튼을 누르거나, 항목명과 금액을 직접 입력하고 '+ 추가'를 누릅니다. 잘못 넣은 항목은 ✕ 버튼으로 지우면 '월 고정지출 합계'가 바로 바뀝니다.",
      },
      {
        step: '근무 시간과 실 작업 효율 조정하기',
        desc: "'월 총 근무 시간'(20~300시간)과 '실 작업 효율'(10~100%) 슬라이더를 움직입니다. 미팅·이동·영업처럼 돈을 받지 못하는 시간을 뺀 비율을 효율로 넣으면 슬라이더 아래에 한 달 유효 근무시간이 함께 표시됩니다.",
      },
      {
        step: '결과 확인하고 이미지로 저장하기',
        desc: "'시간당 적정 단가' 아래에 월 목표 순수익·월 고정지출·세금(추정)·버퍼 10%·필요 월 총수입·유효 근무시간이 나뉘어 표시됩니다. '단가 계산 결과 이미지로 저장' 버튼을 누르면 이 내역을 PNG 이미지로 내려받을 수 있습니다.",
      },
    ],
    faqs: [
      {
        q: '실 작업 효율은 왜 100%로 두지 않나요?',
        a: '한 달에 일하는 시간을 모두 클라이언트에게 청구할 수는 없습니다. 미팅, 이메일 응대, 견적 작성, 이동, 영업, 장부 정리처럼 일은 하지만 돈은 받지 못하는 시간이 있기 때문입니다. 흔히 청구 가능한 비율을 60~80% 정도로 잡습니다. 효율을 100%로 두면 같은 수입을 더 많은 시간으로 나누게 되어 단가가 낮게 나오고, 실제로는 목표 수입에 못 미칠 수 있습니다. 위 예시 조건에서 효율을 80%에서 100%로 올리면 단가가 약 37,562원에서 약 30,049원으로 내려갑니다.',
      },
      {
        q: '버퍼 10%는 어떻게 계산되나요?',
        a: '버퍼는 목표 순수익, 월 고정지출, 추정 세금을 모두 더한 금액의 10%로 계산됩니다. 세금 추정 오차, 대금이 늦게 들어오는 미수금, 일감이 적은 비수기, 장비 고장 같은 예상치 못한 지출에 대비하는 안전 마진입니다. 버퍼 비율은 10%로 고정되어 있어 화면에서 바꿀 수는 없으므로, 여유를 더 두고 싶다면 목표 순수익을 조금 높게 잡으면 됩니다.',
      },
      {
        q: '3.3% 원천징수는 계산에 반영되나요?',
        a: '프리랜서(사업소득자)가 용역 대금을 받을 때 떼이는 3.3%는 소득세 3%와 지방소득세 0.3%를 미리 내는 원천징수이고, 다음 해 5월 종합소득세 신고 때 실제 세액과 정산됩니다. 이 계산기는 3.3%를 따로 빼지 않고 1년 치 최종 세금을 추정합니다. 목표 순수익과 고정지출을 합한 금액을 12개월로 환산해 종합소득세 누진세율(6~45%)을 적용하고, 그 세액의 10%를 지방소득세로 더하는 방식입니다. 필요경비나 기본공제는 빼지 않으므로 실제 신고 세액보다 높게 잡힐 수 있습니다.',
      },
      {
        q: '건강보험료와 4대보험은 어떻게 반영되나요?',
        a: '대한민국 탭에서는 목표 순수익과 고정지출을 합한 월 금액에 지역가입자 소득 보험료율 7.09%를 곱해 건강보험료를 단순 추정합니다. 실제 지역가입자 보험료는 소득뿐 아니라 부동산 같은 재산과 자동차 보유 여부에 따라 달라지고, 장기요양보험료도 별도로 붙기 때문에 실제 부담은 더 클 수 있습니다. 국민연금과 고용·산재보험은 계산에 포함되지 않으니 납부 중이라면 고정지출 항목으로 직접 추가해 주세요.',
      },
      {
        q: '미국(USD) 탭은 어떤 세금을 반영하나요?',
        a: '미국 탭은 2024년 기준으로 순이익의 92.35%에 자영업세(Self-Employment Tax) 15.3%를 적용하고, 자영업세의 절반과 단일 신고자(Single filer) 표준공제 14,600달러를 뺀 금액에 연방소득세 누진세율(10~37%)을 계산합니다. 부부 합산 신고나 세대주 공제, 주(State) 소득세는 반영하지 않으므로 거주하는 주에 따라 실제 세금은 더 나올 수 있습니다.',
      },
      {
        q: '입력한 값은 어디에 저장되나요?',
        a: '목표 수입, 고정지출 목록, 근무 시간과 효율 값은 브라우저의 로컬 스토리지(localStorage)에 저장되어 다음에 페이지를 열면 그대로 불러옵니다. 계산은 모두 브라우저 안에서 이루어지고, 이 계산기는 입력값을 서버로 보내지 않습니다. 여러 사람이 함께 쓰는 공용 PC라면 사용 후 브라우저의 사이트 데이터를 지워 두는 것이 좋습니다.',
      },
    ],
  },
  en: {
    title: 'What Is the Freelance Rate Calculator?',
    description:
      "The Freelance Rate Calculator works backward from the money you want to keep each month to the hourly rate you need to charge. It adds your monthly fixed costs to your after-tax income goal, estimates the taxes on that amount, adds a 10% safety buffer, and divides the total by your billable hours — your monthly work hours multiplied by your work efficiency. For example, on the United States (USD) tab, a $5,000 monthly take-home goal plus $1,600 of fixed costs (the $1,500 Rent and $100 Software presets), 160 work hours and 80% efficiency gives estimated taxes of about $1,602 (roughly $933 of self-employment tax and $670 of federal income tax) and a buffer of about $820. That makes the monthly gross needed about $9,022, and dividing it by 128 billable hours gives a recommended rate of $70.49 per hour. Drop efficiency to 60% and the rate climbs to about $94. The US tab uses 2024 self-employment tax and federal brackets with the single-filer standard deduction; the South Korea (KRW) tab uses Korea's progressive income tax, 10% local income tax and a simplified 7.09% health insurance rate. Use it to find the floor below which a project stops paying for itself — before you send a quote or negotiate a raise.",
    useCases: [
      {
        icon: '💼',
        title: 'Quoting your first client',
        desc: 'Leaving a salaried job? Enter the take-home pay you want to keep and see the minimum hourly rate that still covers taxes and overhead before you send your very first quote.',
      },
      {
        icon: '📈',
        title: 'Backing up a rate increase',
        desc: 'When rent, software subscriptions or your income goal go up, recalculate with the new numbers and use the gap between your current rate and the new result as a concrete argument with clients.',
      },
      {
        icon: '🧾',
        title: 'Covering platform fees',
        desc: "Working through Upwork, Fiverr or a similar marketplace? Add your expected monthly platform fees as a custom fixed cost so the rate you set still leaves your target income after the platform's cut.",
      },
      {
        icon: '🌏',
        title: 'Comparing the US and Korea',
        desc: 'If you work across borders, switch between the United States (USD) and South Korea (KRW) tabs — each tab keeps its own amounts in its own currency — to see how two different tax systems change the rate you need.',
      },
    ],
    steps: [
      {
        step: 'Pick a country and set your income goal',
        desc: "Choose the 🇺🇸 United States (USD) or 🇰🇷 South Korea (KRW) tab, then drag the 'After-tax take-home target' slider to what you want to keep each month. Each tab remembers its own amounts, so switching does not carry won figures into dollars or vice versa; enter amounts in the tab's currency.",
      },
      {
        step: 'Add your monthly fixed costs',
        desc: "Under 'Monthly Fixed Costs', tap presets such as + Rent or + Software, or type an item name and amount and press '+ Add'. Remove a line with the ✕ button and the 'Total Fixed Costs' figure updates instantly.",
      },
      {
        step: 'Set work hours and efficiency',
        desc: "Move the 'Monthly Work Hours' slider (20–300h) and the 'Work Efficiency' slider (10–100%). Efficiency is the share of your hours you can actually bill, and the tip below the slider shows the resulting billable hours per month.",
      },
      {
        step: 'Read the result and save it',
        desc: "The 'Recommended Hourly Rate' card splits the total into net income goal, fixed costs, estimated taxes, the 10% buffer, monthly gross needed and billable hours. Click 'Save Rate Summary as Image' to download that breakdown as a PNG file.",
      },
    ],
    faqs: [
      {
        q: "Why shouldn't I set efficiency to 100%?",
        a: 'You can rarely bill every hour you work. Meetings, email, writing proposals, invoicing, travel and finding new clients all take time nobody pays for, so many freelancers assume only 60–80% of their hours are billable. At 100% the same income is spread over more hours, the rate comes out lower, and you can fall short of your goal. In the example above, raising efficiency from 80% to 100% drops the rate from $70.49 to about $56.',
      },
      {
        q: 'How is the 10% buffer calculated?',
        a: "The buffer is 10% of your net income goal, fixed costs and estimated taxes combined. It's a safety margin for tax estimates that turn out low, clients who pay late, slow months and surprise expenses such as replacing a laptop. The percentage is fixed at 10% and can't be changed in the calculator, so if you want a bigger cushion, simply set your net income goal a little higher.",
      },
      {
        q: 'Which US taxes does the calculator include?',
        a: "The US tab applies the 15.3% self-employment tax to 92.35% of your income, deducts half of that tax plus the 2024 single-filer standard deduction of $14,600, and runs the rest through the 2024 federal brackets (10–37%). It does not include state or local income tax, married-filing-jointly or head-of-household deductions, or the qualified business income deduction. Fixed costs are treated as income you need rather than deductible business expenses, so the tax figure can lean high.",
      },
      {
        q: 'How are Korean taxes estimated?',
        a: 'The South Korea tab annualizes your net income goal plus fixed costs, applies the progressive national income tax rates (6–45%), adds 10% of that as local income tax, and adds health insurance at a simplified 7.09% of monthly income. No deductions are subtracted, and national pension is not included. The 3.3% withheld from Korean freelance payments (3% income tax plus 0.3% local tax) is only a prepayment settled at the May tax filing, so it is not subtracted separately.',
      },
      {
        q: 'Where are my inputs stored?',
        a: 'Your income goal, fixed-cost list, work hours and efficiency are saved in your browser’s localStorage, so they are still there the next time you open the page. All calculations run in your browser and this calculator does not send your inputs to a server. If you use a shared computer, clear the site data in your browser when you are done.',
      },
    ],
  },
};
