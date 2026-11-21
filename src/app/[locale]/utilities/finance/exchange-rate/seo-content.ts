// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
            title: '실시간 환율 계산기란 무엇인가요?',
            description: '환율 계산기는 전 세계 주요 통화 간의 환전 비율을 실시간으로 계산하여 외화 금액을 자국 화폐로 변환해주는 필수 금융 도구입니다. 본 계산기는 미국 달러(USD), 유로(EUR), 일본 엔(JPY), 중국 위안(CNY), 영국 파운드(GBP) 등 20개 이상의 주요 통화를 지원하며, 유럽중앙은행(ECB) 공식 환율 데이터 기반의 Frankfurter API를 통해 매 영업일 업데이트되는 정확한 환율을 제공합니다. 단순한 환전 계산을 넘어 최근 30일간의 환율 추이를 시각적인 차트로 보여주어 환율 변동 패턴을 파악할 수 있으며, 전일 대비 상승/하락률을 퍼센티지로 표시하여 환전 타이밍을 판단하는 데 도움을 줍니다. 해외여행 경비 계산, 해외 직구 결제 예상 금액 산출, 국제 송금 비용 예측, 외화 투자 수익률 계산 등 다양한 상황에서 활용할 수 있으며, 특히 환율이 급변하는 시기에 실시간으로 확인하여 손해를 최소화하고 유리한 시점에 거래할 수 있도록 지원합니다.',
            useCases: [
              { icon: '✈️', title: '해외여행 경비 계획', desc: '호텔, 식사, 관광 비용 등 현지 통화 가격을 원화로 환산하여 여행 예산을 정확하게 수립하고 환전 금액을 결정할 수 있습니다.' },
              { icon: '🛒', title: '해외 직구 및 구매 대행', desc: '아마존, 이베이 등 해외 쇼핑몰의 달러/유로 가격을 실시간 환율로 계산하여 배송비 포함 최종 결제 금액을 미리 파악할 수 있습니다.' },
              { icon: '💸', title: '국제 송금 및 환전 타이밍', desc: '최근 30일 환율 추이 차트를 보고 환율이 낮을 때 환전하거나 높을 때 송금하는 등 최적의 거래 시점을 선택할 수 있습니다.' },
              { icon: '📈', title: '외화 자산 가치 평가', desc: '해외 주식, 채권, 부동산 등 외화 표시 자산의 현재 가치를 원화로 환산하여 포트폴리오 전체 수익률을 정확히 계산할 수 있습니다.' },
            ],
            steps: [
              { step: '출발/도착 통화 선택', desc: '상단의 통화 선택 드롭다운에서 출발 통화(예: KRW 원화)와 도착 통화(예: USD 달러)를 클릭하여 선택합니다. 양방향 화살표 버튼으로 통화를 빠르게 바꿀 수 있습니다.' },
              { step: '금액 입력', desc: '환전하려는 금액을 숫자로 입력하면, 실시간으로 상대 통화 금액이 자동 계산되어 하단에 표시됩니다. 소수점 입력도 가능합니다.' },
              { step: '환율 추이 확인', desc: '화면 하단의 차트에서 최근 30일간 환율 변동 흐름을 확인하고, 현재 환율이 고점인지 저점인지 판단합니다.' },
              { step: '환전 또는 송금 결정', desc: '계산된 금액과 환율 트렌드를 종합하여 지금 환전할지, 조금 더 기다릴지 결정합니다. 결과 화면을 캡처하거나 메모하여 은행 방문 시 참고자료로 활용하세요.' },
            ],
            faqs: [
              { q: '환율 데이터는 어디서 가져오나요?', a: '본 계산기는 유럽중앙은행(ECB) 공식 환율을 기반으로 한 Frankfurter API를 사용합니다. 매 영업일 업데이트되며, 주말과 공휴일에는 마지막 영업일의 환율이 표시됩니다.' },
              { q: '실제 은행 환전 시 이 환율과 동일한가요?', a: '아닙니다. 본 계산기는 기준 환율(중간값)을 제공하며, 실제 은행이나 환전소는 매매기준율에 수수료를 가산한 현찰 살 때/팔 때 환율을 적용합니다. 보통 기준 환율 대비 1~3% 정도 차이가 발생할 수 있습니다.' },
              { q: '환율이 유리할 때는 언제인가요?', a: '일반적으로 해외여행이나 직구 시 원화 가치가 높아(환율 하락) 적은 원화로 많은 외화를 살 수 있을 때 유리하고, 해외 수입이나 외화 자산 매도 시에는 환율이 높을 때 유리합니다. 30일 차트에서 환율 저점을 참고하세요.' },
              { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
            ],
          },
  en: {
            title: 'What is a Real-Time Currency Exchange Calculator?',
            description: 'A currency exchange calculator is an essential financial tool that converts amounts between global currencies using real-time exchange rates. This calculator supports 20+ major currencies including US Dollar (USD), Euro (EUR), Japanese Yen (JPY), Chinese Yuan (CNY), British Pound (GBP), and more, powered by the Frankfurter API which sources official rates from the European Central Bank (ECB) and updates daily on business days. Beyond simple conversions, it visualizes 30-day exchange rate trends with interactive charts and helps users identify optimal timing for currency exchange or international transactions. Whether you\'re planning travel budgets, calculating overseas shopping costs, estimating international remittance fees, or evaluating foreign investment returns, this tool provides accurate, up-to-date information to minimize losses and maximize value in cross-border financial activities.',
            useCases: [
              { icon: '✈️', title: 'Travel Budget Planning', desc: 'Convert hotel, meal, and tour prices from local currencies to your home currency to set accurate travel budgets and decide how much cash to exchange.' },
              { icon: '🛒', title: 'Online Shopping & Importing', desc: 'Calculate total costs in your currency for items on Amazon, eBay, or other foreign e-commerce sites, including shipping, to avoid payment surprises.' },
              { icon: '💸', title: 'Remittance Timing Optimization', desc: 'Review the 30-day chart to identify low-rate periods for buying foreign currency or high-rate periods for sending money abroad, maximizing savings.' },
              { icon: '📈', title: 'Foreign Asset Valuation', desc: 'Convert the value of overseas stocks, bonds, or real estate holdings to your home currency to accurately track portfolio performance and returns.' },
            ],
            steps: [
              { step: 'Select Currency Pair', desc: 'Click the currency dropdown menus at the top to choose your source currency (e.g., USD) and target currency (e.g., KRW). Use the swap button to quickly reverse the pair.' },
              { step: 'Enter Amount', desc: 'Type the amount you want to convert into the input field. The converted amount appears instantly below. Decimal values are supported.' },
              { step: 'Review Rate Trends', desc: 'Check the 30-day chart at the bottom to see recent exchange rate movements and gauge whether rates are currently high or low.' },
              { step: 'Make Exchange Decision', desc: 'Combine the calculated amount and trend analysis to decide whether to exchange now or wait. Screenshot or note the result for reference when visiting a bank or exchange service.' },
            ],
            faqs: [
              { q: 'Where does the exchange rate data come from?', a: 'This calculator uses the Frankfurter API, which is based on official rates published by the European Central Bank (ECB). Data updates every business day; weekend and holiday rates reflect the last trading day.' },
              { q: 'Will banks offer the same rate?', a: 'No. This calculator shows the mid-market (interbank) rate. Banks and exchange services add margins to create "buy" and "sell" rates, typically 1-3% higher or lower than the mid-market rate depending on the transaction direction.' },
              { q: 'When is the best time to exchange currency?', a: 'For travel or shopping abroad, exchange when your home currency is strong (lower exchange rate = more foreign currency per unit). For receiving foreign income, exchange when rates are high. Use the 30-day chart to spot trends and lows.' },
              { q: 'Can I compare multiple currencies at once?', a: 'The current version supports 1:1 currency pair comparisons. To compare multiple currencies, fix your base currency and switch the target currency for each calculation, then note the results manually for side-by-side comparison.' },
            ],
          },
};
