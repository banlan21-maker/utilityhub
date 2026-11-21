// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
            title: '연봉·급여 실수령액 계산기란 무엇인가요?',
            description: '세전 연봉이나 월급을 입력하면 2026년 기준 4대보험(국민연금 4.75%, 건강보험 3.595%, 장기요양보험, 고용보험 0.9%)과 근로소득세·지방소득세를 공제한 실제 통장 입금액을 계산해 주는 도구입니다. 근로소득세는 국세청이 회사의 매월 원천징수 기준으로 쓰는 근로소득 간이세액표(2026년 3월 1일 이후 지급분)를 그대로 적용하므로, 부양가족 수와 8~20세 자녀 수에 따라 달라지는 세액까지 반영됩니다. 예를 들어 연봉 4,000만 원(퇴직금 별도, 식대 비과세 20만 원, 본인 1명)이라면 월 세전 약 333만 원에서 약 39만 8천 원이 공제되어 월 실수령액은 약 293만 원입니다. 아르바이트나 교대 근무처럼 시급으로 받는 경우에는 "시급·알바" 탭에서 2026년 최저시급 10,320원 기준으로 주휴수당·잔업·특근 수당을 포함한 월급을 계산할 수 있습니다. 연봉 협상, 이직 제안 비교, 생활비 계획처럼 "그래서 한 달에 실제로 얼마를 받는지"가 궁금할 때 바로 활용해 보세요.',
            useCases: [
              { icon: '💼', title: '이직·연봉 협상 전 비교', desc: '제안받은 연봉 두 개를 차례로 입력해 월 실수령액 차이를 확인하세요. 연봉 500만 원 차이가 실제 통장에서는 월 약 30만~40만 원 차이라는 것처럼, 세후 기준으로 판단할 수 있습니다.' },
              { icon: '👨‍👩‍👧', title: '부양가족에 따른 세금 차이 확인', desc: '배우자와 8~20세 자녀 수를 바꿔 가며 매월 떼이는 근로소득세가 얼마나 줄어드는지 확인할 수 있습니다. 같은 연봉 5,000만 원도 4인 가족(자녀 2명)이면 소득세가 월 약 4만 원으로 줄어듭니다.' },
              { icon: '⏰', title: '알바 월급과 주휴수당 계산', desc: '시급·알바 탭에서 하루 근무 시간과 주 근무일수를 넣으면 주 15시간 이상일 때 붙는 주휴수당과 잔업·특근 수당까지 합친 월급을 바로 계산합니다.' },
              { icon: '📋', title: '급여명세서 검증', desc: '회사에서 받은 급여명세서의 국민연금·건강보험·소득세 금액이 계산 결과와 크게 다르다면 비과세 항목이나 부양가족 신고 내용이 맞는지 인사팀에 확인해 볼 수 있습니다.' },
            ],
            steps: [
              { step: '계산 방식 선택', desc: '월급이나 연봉을 받는 직장인은 "연봉·월급 실수령액" 탭을, 시급으로 받는 아르바이트·교대 근무자는 "시급·알바" 탭을 선택합니다.' },
              { step: '연봉 또는 월급 입력', desc: '세전 금액을 입력합니다. 연봉에 퇴직금이 포함된 계약(연봉을 13으로 나눠 지급)이라면 "퇴직금 포함" 체크박스를 켜면 월 급여가 1/13로 계산됩니다.' },
              { step: '비과세액과 가족 수 설정', desc: '식대처럼 세금이 붙지 않는 금액(식대는 월 20만 원까지 비과세)을 입력하고, 본인을 포함한 부양가족 수와 8~20세 자녀 수를 +/- 버튼으로 설정합니다.' },
              { step: '공제 내역 확인', desc: '오른쪽 영수증에서 국민연금·건강보험·장기요양·고용보험·근로소득세·지방소득세가 각각 얼마인지, 최종 월 실수령액과 연 실수령액이 얼마인지 확인합니다.' },
            ],
            faqs: [
              { q: '연봉 3,000만·4,000만·5,000만 원의 월 실수령액은 얼마인가요?', a: '본인 1명, 식대 비과세 월 20만 원, 퇴직금 별도 기준으로 연봉 3,000만 원은 월 약 224만 원, 4,000만 원은 월 약 293만 원, 5,000만 원은 월 약 357만 원입니다. 부양가족이 늘어나면 근로소득세가 줄어 실수령액이 더 많아지며, 페이지의 연봉별 실수령액 표에서 다른 연봉도 확인할 수 있습니다.' },
              { q: '2026년 4대보험 요율은 얼마인가요?', a: '근로자 부담 기준으로 국민연금 4.75%(2026년부터 보험료율 9.5%), 건강보험 3.595%(보험료율 7.19%), 장기요양보험은 건강보험료의 13.14%, 고용보험 0.9%로 합계 약 9.72%입니다. 산재보험은 사업주가 전액 부담하므로 월급에서 공제되지 않습니다. 국민연금은 기준소득월액 상한(659만 원)이 있어 그 이상 소득에는 더 붙지 않습니다.' },
              { q: '근로소득세는 어떻게 계산되나요?', a: '회사는 매달 국세청 근로소득 간이세액표에 따라 소득세를 원천징수하고, 지방소득세는 그 소득세의 10%입니다. 이 계산기는 2026년 3월 1일 이후 지급분에 적용되는 간이세액표(100% 기준)와 8~20세 자녀 세액공제(1명 20,830원, 2명 45,830원)를 그대로 반영합니다. 최종 세금은 다음 해 연말정산에서 확정됩니다.' },
              { q: '주휴수당은 어떻게 계산되나요?', a: '시급·알바 탭에서 1주 소정근로시간이 15시간 이상이면 (주 소정근로시간 ÷ 40) × 8 × 시급만큼 주휴수당이 붙습니다. 주 40시간 이상 일하면 8시간분이 최대이며, 잔업·특근 시간은 주휴수당 계산에 포함되지 않습니다. 2026년 최저시급 10,320원으로 주 40시간 일하면 주휴수당 포함 월 약 215만 원입니다.' },
            ],
          },
  en: {
            title: 'What is the Korean Salary & Take-Home Pay Calculator?',
            description: 'Enter a gross annual salary or monthly pay and this calculator shows what actually lands in your bank account in Korea after the 2026 social insurance contributions (National Pension 4.75%, Health Insurance 3.595%, Long-term Care, Employment Insurance 0.9%) and income tax. Income tax follows the official simplified withholding tax table that Korean employers use every month (payments from March 1, 2026), so it reflects the number of dependents and children aged 8 to 20. For example, a ₩40,000,000 salary with severance paid separately, a ₩200,000 tax-free meal allowance and no dependents comes to about ₩3,333,000 gross per month, roughly ₩398,000 in deductions and about ₩2,936,000 take-home. Paid by the hour? The Hourly tab uses the 2026 Korean minimum wage of ₩10,320 and adds weekly holiday pay, overtime and holiday shifts. A US mode with FICA and an estimated federal rate is also included for comparison.',
            useCases: [
              { icon: '💼', title: 'Comparing Job Offers in Korea', desc: 'Enter two salary offers one after the other to see the real monthly difference after tax. A ₩5,000,000 gap in annual salary is often only ₩300,000–400,000 more per month in your account.' },
              { icon: '👨‍👩‍👧', title: 'Effect of Dependents on Tax', desc: 'Change the number of dependents and children aged 8–20 to see how much monthly income tax drops. A family of four on ₩50,000,000 pays roughly ₩42,000 a month in income tax instead of ₩190,000.' },
              { icon: '⏰', title: 'Part-time and Shift Pay', desc: 'Use the Hourly tab to enter daily hours and days per week. It adds Korea\'s weekly holiday pay for 15+ hours a week, plus overtime and holiday multipliers.' },
              { icon: '📋', title: 'Checking Your Payslip', desc: 'If the pension, health insurance or income tax on your payslip differs a lot from this estimate, ask HR whether your non-taxable items and dependent declaration are recorded correctly.' },
            ],
            steps: [
              { step: 'Choose a Mode', desc: 'Salaried employees should use "Annual / Monthly Salary". Part-time or shift workers paid by the hour should use the "Hourly / Part-time" tab.' },
              { step: 'Enter Your Pay', desc: 'Type your gross annual salary or monthly pay. If your contract bundles severance into the annual figure (paid in 13 parts), tick "includes severance" to divide by 13.' },
              { step: 'Set Allowances and Dependents', desc: 'Enter monthly non-taxable pay such as the meal allowance (tax-free up to ₩200,000), then set dependents including yourself and the number of children aged 8–20.' },
              { step: 'Review the Breakdown', desc: 'The receipt lists pension, health, long-term care, employment insurance, income tax and local income tax separately, with your monthly and annual take-home pay.' },
            ],
            faqs: [
              { q: 'How much is take-home pay on a ₩40 million salary in Korea?', a: 'With severance paid separately, a ₩200,000 monthly tax-free meal allowance and no dependents, a ₩40,000,000 salary gives about ₩2,936,000 per month after insurance and tax. ₩30,000,000 gives about ₩2,244,000 and ₩50,000,000 about ₩3,572,000. More dependents lower income tax and raise take-home pay.' },
              { q: 'What are the 2026 Korean social insurance rates?', a: 'The employee share is National Pension 4.75% (total rate rose to 9.5% in 2026), Health Insurance 3.595% (total 7.19%), Long-term Care at 13.14% of the health premium and Employment Insurance 0.9%, about 9.72% in total. Industrial accident insurance is paid entirely by the employer. Pension is capped at a ₩6,590,000 monthly income base.' },
              { q: 'How is Korean income tax withheld?', a: 'Employers withhold income tax each month using the National Tax Service simplified withholding table, and local income tax is 10% of that amount. This calculator uses the table for payments from March 1, 2026 at the 100% option, including the child credit of ₩20,830 for one child and ₩45,830 for two. The final tax is settled in the year-end tax adjustment.' },
              { q: 'How is weekly holiday pay calculated?', a: 'In the Hourly tab, if scheduled hours are 15 or more per week, weekly holiday pay is (weekly scheduled hours ÷ 40) × 8 × hourly wage, capped at 8 hours of pay at 40 hours. Overtime and holiday shifts do not count. At the 2026 minimum wage of ₩10,320 and 40 hours a week, monthly pay including holiday pay is about ₩2,152,000.' },
            ],
          },
};
