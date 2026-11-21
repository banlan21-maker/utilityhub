// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '부가세 계산기로 무엇을 계산할 수 있나요?',
          description: '한국 부가가치세율은 10%입니다. 이 계산기는 세 가지 상황을 다룹니다. 첫째, 견적서나 세금계산서를 쓸 때 공급가액에 부가세를 더하거나, 부가세 포함 금액에서 공급가액과 세액을 나눕니다. 110,000원이면 공급가액 100,000원과 부가세 10,000원이고, 10,000원처럼 딱 나누어지지 않는 금액은 공급가액 9,091원과 부가세 909원으로 합계가 항상 맞게 나눕니다. 둘째, 개인 일반과세자가 1월·7월 부가세 신고 때 낼 세금을 미리 계산합니다. 6개월 매출 5,000만 원, 공제 가능한 매입 2,000만 원(모두 공급가액)이면 매출세액 500만 원에서 매입세액 200만 원을 뺀 300만 원을 냅니다. 셋째, 간이과세자의 1년 부가세를 업종별 부가가치율(15~40%)로 계산하고 같은 조건의 일반과세자와 비교합니다. 매출 8,000만 원, 매입 3,000만 원인 음식점이라면 간이과세자는 105만 원, 일반과세자는 약 454만 원입니다.',
          useCases: [
            { icon: '🧾', title: '견적서·세금계산서 금액 나누기', desc: '부가세 포함 1,100만 원 견적을 공급가액 1,000만 원과 세액 100만 원으로 나누거나, 공급가액에 10%를 더해 합계를 정합니다. 나누어지지 않는 금액도 원 단위로 합계가 맞습니다.' },
            { icon: '📅', title: '1월·7월 부가세 신고 준비', desc: '6개월 매출과 세금계산서·카드 매입을 넣어 낼 세금을 미리 확인합니다. 매입이 매출보다 많은 기간에는 환급 예상액이 나옵니다.' },
            { icon: '🏪', title: '간이 vs 일반 과세 유형 비교', desc: '창업 전에 예상 매출과 매입으로 간이과세자와 일반과세자의 세금 차이를 막대로 비교합니다. 매입이 큰 창업 초기에는 환급이 되는 일반과세자가 유리할 수 있습니다.' },
            { icon: '🛍️', title: '해외 거래 가격 계산', desc: '일본 10%, 싱가포르 9%, 독일 19%, 영국·프랑스 20% 세율로 바꿔 해외 판매가나 구매가에서 세금 몫을 분리할 수 있습니다.' },
          ],
          steps: [
            { step: '계산 종류 선택', desc: '금액만 나누려면 "부가세 넣기·빼기", 신고할 세금을 보려면 "부가세 신고(일반과세자)" 또는 "간이과세자 부가세" 탭을 고릅니다.' },
            { step: '금액 입력', desc: '공급가액 또는 합계, 6개월 매출·매입, 간이과세자라면 1년 매출·매입과 업종을 입력합니다. 쉼표는 자동으로 들어갑니다.' },
            { step: '결과 확인', desc: '공급가액·세액·합계, 납부 또는 환급 예상액, 간이과세자 납부의무 면제 여부와 일반과세자 비교 막대를 확인합니다.' },
            { step: '복사해서 활용', desc: '결과를 복사해 견적서·세금계산서 작성이나 신고 준비 메모에 붙여 넣습니다. 최종 신고는 홈택스 또는 세무대리인과 확인하세요.' },
          ],
          faqs: [
            { q: '부가세 포함 금액에서 공급가액은 어떻게 구하나요?', a: '합계를 1.1로 나누면 공급가액이고, 합계에서 공급가액을 빼면 부가세입니다. 110,000원이면 공급가액 100,000원, 부가세 10,000원입니다. 딱 나누어지지 않으면 공급가액을 원 단위로 반올림하고 세액은 차액으로 정해 합계가 맞도록 합니다.' },
            { q: '일반과세자는 부가세를 얼마나 내나요?', a: '신고 기간(개인은 6개월) 매출세액(매출 공급가액의 10%)에서 세금계산서·사업용 카드 등으로 증빙한 매입세액을 뺀 금액을 냅니다. 매입세액이 더 크면 환급받습니다. 신용카드 매출세액공제 등은 이 계산에 포함되지 않습니다.' },
            { q: '간이과세자 부가세는 어떻게 계산하나요?', a: '1년 매출(부가세 포함)에 업종별 부가가치율(소매·음식점 15%, 제조 20%, 숙박 25%, 건설·운수·정보통신 30%, 전문서비스·부동산임대 40%)과 10%를 곱하고, 세금계산서 등을 받은 매입액의 0.5%를 뺍니다. 1년 매출이 4,800만 원 미만이면 납부의무가 면제되지만 신고는 해야 합니다.' },
            { q: '간이과세자가 되는 기준은 얼마인가요?', a: '2024년 7월부터 직전 연도 매출(공급대가)이 1억 400만 원 미만인 개인사업자는 간이과세를 적용받을 수 있습니다. 부동산임대업과 과세유흥장소는 4,800만 원 미만이 기준이며, 일부 업종과 지역은 간이과세를 받을 수 없습니다.' },
          ],
        },
  en: {
          title: 'What can this VAT calculator work out?',
          description: 'Korea\'s VAT rate is 10%. This calculator covers three situations. First, adding VAT to a net price or splitting a VAT-inclusive total for quotes and tax invoices: ₩110,000 is ₩100,000 net plus ₩10,000 VAT, and an awkward amount like ₩10,000 splits into ₩9,091 and ₩909 so the total always matches. Second, estimating what an individual general taxpayer pays at the January or July VAT return: ₩50M of six-month sales and ₩20M of deductible purchases (both net) give ₩5M output tax minus ₩2M input tax, so ₩3M to pay. Third, a simplified taxpayer\'s annual VAT using the industry value-added rates of 15–40%, compared with what a general taxpayer would pay: a restaurant with ₩80M sales and ₩30M purchases pays ₩1.05M as a simplified taxpayer versus about ₩4.55M as a general taxpayer. Rates for Japan, Singapore, Germany, the UK and France are also available.',
          useCases: [
            { icon: '🧾', title: 'Quotes and Tax Invoices', desc: 'Split an ₩11M VAT-inclusive quote into ₩10M net and ₩1M VAT, or add 10% to a net price. Amounts that do not divide evenly still add up to the won.' },
            { icon: '📅', title: 'January and July VAT Returns', desc: 'Enter six months of sales and deductible purchases to see the VAT you will owe, or the refund when purchases exceed sales.' },
            { icon: '🏪', title: 'Simplified vs General Registration', desc: 'Compare the two registration types before starting a business. With heavy start-up purchases, a general registration can mean a refund.' },
            { icon: '🛍️', title: 'Foreign Prices', desc: 'Switch to Japan 10%, Singapore 9%, Germany 19% or UK and France 20% to separate the tax from foreign prices.' },
          ],
          steps: [
            { step: 'Pick a Calculation', desc: 'Use "Add / remove VAT" to split amounts, or the general or simplified taxpayer tabs to estimate the VAT to pay.' },
            { step: 'Enter Amounts', desc: 'Enter a net or total amount, six-month sales and purchases, or annual sales, purchases and industry for simplified taxpayers. Commas are added automatically.' },
            { step: 'Read the Result', desc: 'See the net, VAT and total, the payment or refund estimate, simplified-taxpayer exemption and a comparison with general taxation.' },
            { step: 'Copy and Use', desc: 'Copy the result into your quote, invoice or filing notes. Confirm the final return on Hometax or with a tax accountant.' },
          ],
          faqs: [
            { q: 'How do I get the net amount from a VAT-inclusive total?', a: 'Divide the total by 1.1 for the net amount; the VAT is the total minus the net. ₩110,000 is ₩100,000 net and ₩10,000 VAT. When it does not divide evenly the net is rounded to the won and the VAT is the difference.' },
            { q: 'How much VAT does a general taxpayer pay?', a: 'Output tax (10% of net sales) minus input tax backed by tax invoices or business cards for the filing period, six months for individuals. If input tax is larger you get a refund. Card sales credits are not included here.' },
            { q: 'How is simplified taxpayer VAT calculated?', a: 'Annual VAT-inclusive sales × the industry value-added rate (retail/restaurants 15%, manufacturing 20%, lodging 25%, construction/transport/IT 30%, professional services/real estate 40%) × 10%, minus 0.5% of documented purchases. Sales under ₩48M are exempt from payment but must be filed.' },
            { q: 'Who can be a simplified taxpayer?', a: 'Since July 2024, individuals with prior-year sales under ₩104M, or under ₩48M for real-estate rental and entertainment venues. Some industries and areas are excluded.' },
          ],
        },
};
