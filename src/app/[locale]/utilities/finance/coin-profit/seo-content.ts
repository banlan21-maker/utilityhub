// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
            title: '코인 수익률 계산기란 무엇인가요?',
            description: '코인 수익률 계산기는 비트코인(BTC), 이더리움(ETH), 리플(XRP), 솔라나(SOL) 등 주요 암호화폐의 매수가 대비 현재 수익률과 손익 금액을 실시간으로 계산하는 무료 금융 도구입니다. CoinGecko API를 통해 시가총액 상위 코인의 실시간 시세를 가져오며, 코인 이름이나 심볼로 검색하여 즉시 선택할 수 있습니다. 매수 단가와 보유 수량을 입력하면 총 투자 금액, 현재 평가 금액, 평가 손익(금액 및 %), 수익 또는 손실 여부를 한눈에 확인할 수 있습니다. KRW(원화)와 USD(달러) 두 가지 기준 통화를 지원하며, 국내 거래소와 해외 거래소 이용자 모두 활용할 수 있습니다. 복잡한 스프레드시트 없이 매수가와 수량만 입력하면 되며, 수익 중이면 빨간색, 손실 중이면 파란색으로 직관적으로 표시되어 투자 현황을 빠르게 파악할 수 있습니다.',
            useCases: [
              { icon: '📈', title: '단타 수익률 실시간 확인', desc: '단기 매매 후 현재 보유 코인의 수익률(%)과 실제 수익 금액을 실시간 시세로 즉시 계산하여 매도 타이밍 결정에 활용할 수 있습니다.' },
              { icon: '🏦', title: '장기 투자 손익 평가', desc: '장기 보유 중인 비트코인이나 알트코인의 매수 원가 대비 현재 평가 금액을 계산하여 포트폴리오 전체 수익률을 정기적으로 점검할 수 있습니다.' },
              { icon: '💱', title: 'KRW·USD 기준 동시 비교', desc: '국내 거래소(원화 기준)와 해외 거래소(달러 기준) 중 어느 쪽에서 거래하든 기준 통화를 전환하여 동일한 방식으로 손익을 계산할 수 있습니다.' },
              { icon: '🔔', title: '목표 수익률 도달 여부 확인', desc: '목표 매도가를 매수 단가 자리에 반대로 입력하여 목표 수익률 달성 시 예상 수익 금액을 미리 계산하고 투자 계획을 수립할 수 있습니다.' },
            ],
            steps: [
              { step: '기준 통화 선택', desc: '상단에서 KRW(원화) 또는 USD(달러) 버튼을 클릭하여 계산에 사용할 기준 통화를 선택합니다. 선택한 통화로 코인 목록과 현재가가 모두 표시됩니다.' },
              { step: '코인 검색 및 선택', desc: '검색창에 코인 이름(예: 비트코인) 또는 심볼(예: BTC)을 입력하면 일치하는 코인 목록이 드롭다운으로 표시됩니다. 원하는 코인을 클릭하면 실시간 현재가가 자동으로 가져와집니다.' },
              { step: '매수 단가 및 수량 입력', desc: '내가 실제로 매수했던 단가(1개당 가격)와 현재 보유 중인 수량을 입력합니다. 두 값이 모두 입력되면 총 투자 금액, 현재 평가 금액, 손익이 자동으로 계산됩니다.' },
              { step: '결과 확인 및 새로고침', desc: '수익 중이면 빨간색, 손실 중이면 파란색 배지로 결과가 표시됩니다. 현재가를 최신 상태로 갱신하려면 새로고침 버튼을 누르거나 코인을 다시 선택하세요.' },
            ],
            faqs: [
              { q: '코인 가격은 실시간으로 업데이트되나요?', a: 'CoinGecko API를 통해 실시간 시세를 가져옵니다. 새로고침 버튼을 누르거나 코인을 다시 선택하면 최신 가격으로 업데이트됩니다. API 호출 최소화를 위해 30초 캐시가 적용됩니다.' },
              { q: '어떤 코인을 지원하나요?', a: 'CoinGecko 시가총액 상위 코인 목록을 지원합니다. 비트코인(BTC), 이더리움(ETH), 리플(XRP), 솔라나(SOL), 도지코인(DOGE) 등 수십 종의 주요 암호화폐를 이름 또는 심볼로 검색할 수 있습니다.' },
              { q: 'KRW와 USD 중 어떤 기준으로 계산하나요?', a: '상단 기준 통화 버튼에서 KRW(원화) 또는 USD(달러)를 선택할 수 있습니다. 선택한 통화 기준으로 코인 목록과 현재가가 표시되며, 매수 단가도 동일 통화 기준으로 입력하면 됩니다.' },
              { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
            ],
          },
  en: {
            title: 'What is a Crypto Profit Calculator?',
            description: 'A crypto profit calculator is a free financial tool that computes your real-time profit or loss on cryptocurrency holdings based on your original buy price and current market value. This calculator fetches live prices via the CoinGecko API for top coins including Bitcoin (BTC), Ethereum (ETH), Ripple (XRP), Solana (SOL), Dogecoin (DOGE), and many more. Simply search for your coin by name or symbol, enter your buy price per coin and the quantity you hold, and instantly see your total invested amount, current portfolio value, profit or loss in absolute terms, and your return rate as a percentage. Both KRW (Korean Won) and USD (US Dollar) base currencies are supported, making this tool equally useful for traders on Korean exchanges and international platforms alike.',
            useCases: [
              { icon: '📈', title: 'Real-Time Trade P&L Check', desc: 'After entering or exiting a short-term trade, calculate your current profit rate and exact profit amount using live prices to decide the best time to sell or hold your position.' },
              { icon: '🏦', title: 'Long-Term Portfolio Review', desc: 'Regularly check the unrealized gain or loss on your long-term Bitcoin or altcoin holdings by comparing your original cost basis against the current market valuation.' },
              { icon: '💱', title: 'KRW & USD Dual Currency', desc: 'Switch between KRW and USD base currencies to evaluate your holdings in your preferred denomination, whether you trade on Korean exchanges or international platforms like Binance.' },
              { icon: '🔔', title: 'Target Price Planning', desc: 'Estimate your potential profit at a target sell price by entering that price as the current price and your actual buy price separately to plan your exit strategy in advance.' },
            ],
            steps: [
              { step: 'Select Base Currency', desc: 'Click KRW or USD at the top to choose your preferred base currency. The coin list and all prices will be displayed in the selected currency throughout the calculator.' },
              { step: 'Search and Select Your Coin', desc: 'Type a coin name (e.g., Bitcoin) or ticker symbol (e.g., BTC) in the search box. A dropdown list of matching coins appears — click your coin to load its live price automatically.' },
              { step: 'Enter Buy Price and Quantity', desc: 'Input the price per coin at which you originally bought (your cost basis) and the number of coins you hold. As soon as both fields are filled, total invested, current value, and P&L calculate instantly.' },
              { step: 'Review Results and Refresh', desc: 'Gains are shown in red and losses in blue for quick visual identification. To update to the latest price, click the refresh icon next to the coin price or reselect the coin from the dropdown.' },
            ],
            faqs: [
              { q: 'Are the coin prices updated in real time?', a: 'Yes. Prices are fetched from the CoinGecko API, which provides real-time market data. A 30-second local cache is applied to minimize API calls — clicking the refresh button fetches the latest price immediately.' },
              { q: 'Which coins are supported?', a: 'The calculator supports the top coins by market cap from CoinGecko, including Bitcoin (BTC), Ethereum (ETH), Ripple (XRP), Solana (SOL), Dogecoin (DOGE), and dozens more. Search by full name or ticker symbol to find your coin.' },
              { q: 'Should I use KRW or USD mode?', a: 'Use KRW mode if you trade on Korean exchanges like Upbit or Bithumb where prices are quoted in Won. Use USD mode for international exchanges like Binance or Coinbase. Both modes use CoinGecko live data in the respective currency.' },
              { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
            ],
          },
};
