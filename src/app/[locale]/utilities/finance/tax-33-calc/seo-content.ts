// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '프리랜서 3.3% 세금 계산기는 무엇을 계산하나요?',
          description: '프리랜서·강사·디자이너처럼 사업소득을 받는 사람은 계약금에서 3.3%(소득세 3% + 지방소득세 0.3%)를 떼고 받습니다. 이 계산기는 세 가지를 한 번에 보여줍니다. 첫째, 이번 계약에서 통장에 들어오는 금액입니다. 세금은 10원 미만을 버리고 계산하므로 300만 원 계약이면 소득세 90,000원과 지방소득세 9,000원을 뗀 2,901,000원이 입금됩니다. 받고 싶은 금액에서 계약 금액을 거꾸로 구하는 역산도 됩니다. 둘째, 5월 종합소득세 신고 때 환급받을지 더 낼지입니다. 1년간 뗀 3.3%는 미리 낸 세금이라, 수입에서 경비를 빼고 기본공제(1인 150만 원)와 표준세액공제(7만 원)를 적용한 실제 세금과 비교합니다. 예를 들어 1년 수입 3,000만 원, 경비율 60%, 본인만 공제받으면 약 37만 원을 돌려받습니다. 셋째, 신고한 소득금액을 기준으로 매달 내게 될 건강보험료와 국민연금을 2026년 지역가입자 요율로 추정합니다.',
          useCases: [
            { icon: '💸', title: '계약금 실수령액 확인', desc: '300만 원 계약이면 99,000원이 원천징수되고 2,901,000원이 입금됩니다. 견적을 낼 때 원하는 실수령액에서 계약 금액을 역산해 손해 보지 않는 단가를 정할 수 있습니다.' },
            { icon: '🔁', title: '5월 환급금 미리 보기', desc: '1년간 뗀 3.3%와 실제 세금을 비교해 종합소득세 신고 때 환급받을지, 더 낼지 미리 확인합니다. 수입 3,000만 원·경비율 60%라면 약 37만 원 환급입니다.' },
            { icon: '🏥', title: '프리랜서 전환 후 보험료 대비', desc: '회사를 나와 프리랜서가 되면 건강보험·국민연금을 전액 본인이 냅니다. 소득금액 1,200만 원이면 매달 약 17만 6천 원이 고지될 수 있어 생활비 계획에 반영할 수 있습니다.' },
            { icon: '👔', title: '직장인 부업 소득 점검', desc: '월급 외 부업 소득이 연 2,000만 원을 넘으면 초과분에 건강보험료가 추가됩니다. 부업 규모를 늘리기 전에 추가 보험료를 미리 확인할 수 있습니다.' },
          ],
          steps: [
            { step: '계약 금액 입력', desc: '세전 계약 금액을 넣으면 소득세 3%, 지방소득세 0.3%, 실수령액이 바로 나옵니다. 역산 탭에서는 받고 싶은 금액을 넣어 필요한 계약 금액을 구합니다.' },
            { step: '연간 수입과 경비 입력', desc: '1년 동안 받은 계약 금액 합계와 경비율(또는 실제 경비)을 입력합니다. 경비율은 홈택스의 기준·단순경비율 조회에서 본인 업종코드로 확인할 수 있습니다.' },
            { step: '공제 정보 입력', desc: '본인을 포함한 기본공제 인원과, 지역가입자로 낸 국민연금이 있으면 그 금액을 넣습니다. 둘 다 과세표준을 줄여 세금을 낮춥니다.' },
            { step: '환급·보험료 확인', desc: '예상 환급액 또는 추가 납부액, 미리 낸 세금과 실제 세금 비교 막대, 매달 낼 건강보험·국민연금 추정액을 확인하고 결과를 복사해 둡니다.' },
          ],
          faqs: [
            { q: '3.3%는 왜 3.3%인가요?', a: '사업소득을 지급하는 쪽이 소득세 3%를 원천징수하고(소득세법 제129조), 그 소득세의 10%를 지방소득세로 함께 뗍니다. 3% + 0.3% = 3.3%입니다. 세금은 10원 미만을 버리므로 금액에 따라 3.3%보다 몇 원 적을 수 있습니다.' },
            { q: '3.3% 뗀 돈은 돌려받을 수 있나요?', a: '다음 해 5월 종합소득세 신고 때 실제 세금과 정산합니다. 수입에서 경비를 빼고 공제를 적용한 실제 세금이 미리 낸 3.3%보다 적으면 차액을 돌려받고, 많으면 더 냅니다. 소득이 적거나 경비율이 높을수록 환급받는 경우가 많습니다.' },
            { q: '경비율은 어디서 알 수 있나요?', a: '장부를 쓰지 않는 소규모 사업자는 업종별로 정해진 단순경비율이나 기준경비율로 경비를 인정받습니다. 홈택스 → 조회/발급 → 기준·단순경비율에서 업종코드로 조회할 수 있습니다. 직전 연도 수입이 많으면 단순경비율을 쓸 수 없고 기준경비율이나 장부 기장이 필요합니다.' },
            { q: '프리랜서 건강보험료는 얼마나 나오나요?', a: '지역가입자는 소득금액(수입 − 경비)을 12로 나눈 월 소득에 2026년 건강보험료율 7.19%를 곱하고, 장기요양보험료(건강보험료의 13.14%)를 더합니다. 국민연금은 월 소득의 9.5%를 전액 본인이 냅니다. 재산에 붙는 보험료는 별도라 실제 고지액은 더 많을 수 있습니다.' },
          ],
        },
  en: {
          title: 'What does the Korean 3.3% freelancer tax calculator work out?',
          description: 'Freelancers in Korea who receive business income have 3.3% withheld from each payment: 3% income tax plus 0.3% local income tax. This calculator covers three things. First, the amount that reaches your account: tax is rounded down to 10 KRW, so a ₩3,000,000 payment has ₩90,000 income tax and ₩9,000 local tax withheld, leaving ₩2,901,000, and it can work backwards from the net amount you want. Second, whether you will get a refund or owe more at the May comprehensive income tax filing, by comparing the tax prepaid through withholding with the real tax after expenses, the ₩1.5M basic deduction per person and the ₩70,000 standard credit. With ₩30M of revenue, a 60% expense rate and no dependents, the refund is about ₩374,000. Third, the monthly health insurance and national pension you will be billed as a regional subscriber, using 2026 rates.',
          useCases: [
            { icon: '💸', title: 'Net Amount per Payment', desc: 'A ₩3,000,000 contract has ₩99,000 withheld and pays ₩2,901,000. Work backwards from the net you need to quote a fair gross amount.' },
            { icon: '🔁', title: 'Preview Your May Refund', desc: 'Compare a year of 3.3% withholding with the real tax to see whether you will get money back. ₩30M revenue at a 60% expense rate gives roughly a ₩374,000 refund.' },
            { icon: '🏥', title: 'Premiums After Going Freelance', desc: 'As a regional subscriber you pay health insurance and pension in full. With ₩12M of business income, expect about ₩176,000 a month.' },
            { icon: '👔', title: 'Side Income on Top of Salary', desc: 'If non-salary income exceeds ₩20M a year, the excess adds a health premium. Check the extra cost before growing a side business.' },
          ],
          steps: [
            { step: 'Enter the Payment', desc: 'Type the gross contract amount to see 3% income tax, 0.3% local tax and the net amount. The reverse tab finds the gross needed for a target net.' },
            { step: 'Enter Annual Revenue and Expenses', desc: 'Enter the year\'s total gross payments and your expense rate or actual expenses. Look up your business code\'s simple expense rate on Hometax.' },
            { step: 'Add Deductions', desc: 'Set the number of dependents including yourself and any national pension you paid as a regional subscriber. Both lower the tax base.' },
            { step: 'Read the Estimate', desc: 'See the refund or extra payment, a bar comparing prepaid and actual tax, and estimated monthly premiums, then copy the result.' },
          ],
          faqs: [
            { q: 'Why exactly 3.3%?', a: 'The payer withholds 3% income tax (Income Tax Act art. 129) and 10% of that as local income tax: 3% + 0.3% = 3.3%. Tax is rounded down to 10 KRW, so the amount can be a few won below 3.3%.' },
            { q: 'Can I get the 3.3% back?', a: 'It is settled at the May comprehensive income tax filing. If the real tax after expenses and deductions is lower than what was withheld, the difference is refunded; if higher, you pay more. Low income or high expense rates often mean a refund.' },
            { q: 'Where do I find my expense rate?', a: 'Small businesses without books use the simple or standard expense rate for their business code, listed on Hometax under 기준·단순경비율. Above certain revenue levels the simple rate no longer applies.' },
            { q: 'How much health insurance will I pay?', a: 'Regional subscribers pay 7.19% of monthly income (business income ÷ 12) in 2026, plus long-term care at 13.14% of that premium, and national pension of 9.5% paid in full. Property-based premiums are extra.' },
          ],
        },
};
