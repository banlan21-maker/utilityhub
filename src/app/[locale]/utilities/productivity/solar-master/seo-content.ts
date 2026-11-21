// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '태양광 발전량·수익 계산과 태양열 온수 절감액',
          description: '주택 태양광의 연간 발전량은 설치 용량(kWp) × 지역 일평균 발전시간 × 365일로 어림합니다. 국가참조표준기상데이터로 16개 지역을 모의한 연구에서 정남향 30° 설치 시 전국 평균은 하루 3.6시간(연 약 1,312kWh/kWp)이었고, 서울은 3.2시간(약 1,165kWh/kWp), 목포는 3.9시간이었습니다. 이 값에는 온도·인버터 손실이 이미 들어 있으므로 손실을 또 빼면 발전량이 지나치게 낮게 나옵니다. 이 계산기는 지역 발전시간에 월별 계수, 경사각·방향·그늘 보정, 해마다 누적되는 패널 노화를 반영하고, 절감액은 한전 주택용 저압 요금 전체 — 기본요금, 누진 전력량요금(기타계절 200·400kWh, 여름 300·450kWh 구간), 기후환경요금, 연료비조정요금, 부가세, 전력산업기반기금 — 로 계산합니다. 남는 전력을 다음 달로 넘기는 상계거래도 반영합니다. 발전사업 탭은 전력을 팔아 버는 사업용 발전소를 다룹니다. 재생에너지법 개정으로 2027년부터 신규 발전소는 REC 대신 정부 계약시장의 20년 고정가격으로 팔기 때문에 계약 단가(2026년 1차 고정가격 평균 낙찰가 146.92원/kWh)를 기본값으로 넣었고, 2026년까지 REC를 받은 기존 발전소는 SMP + REC × 가중치(운영지침 별표 2의 구간별 가중평균)로 2029년까지, 그 뒤는 따로 넣은 단가로 계산합니다. 설치비·운영비·대출 조건을 넣으면 20년 현금흐름, 사업 IRR, 자기자본 IRR, 회수 기간, 최소 DSCR을 보여 줍니다. 한국동서발전이 공개한 실제 발전소 4년치 실측과 비교해 보니 실제 발전량은 모의값보다 약 11% 적어, 기본값으로 이 차이(×0.89)를 보정합니다. 예를 들어 서울에서 3.2kWp를 달고 월 350kWh(여름 450kWh)를 쓰는 집은 보정 후 연 약 3,330kWh를 만들어 전기요금을 연 70만 원가량 줄입니다. 태양열 탭은 하루 온수 사용량과 온도로 필요한 열량을 구해, 집열판이 모은 열 중 실제로 쓰는 만큼만 절감액에 넣고 기존 보일러 효율로 연료 절감을 계산합니다. 단가는 기준일과 함께 표시되며 고지서 단가로 바꿔 넣을 수 있습니다.',
          useCases: [
            { icon: '🏠', title: '주택 태양광 설치 검토', desc: '지역, 패널 출력과 장수, 경사·방향을 넣으면 연간 발전량과 월별 전기요금 전후를 비교하고, 설치비와 확정 보조금으로 회수 기간과 20년 누적 수익을 확인합니다.' },
            { icon: '📋', title: '시공사 견적 검증', desc: '업체가 제시한 연 발전량이 지역 평균(kWh/kWp)과 맞는지 비교합니다. 서울에서 kWp당 연 1,300kWh를 넘게 약속한다면 근거를 물어볼 만합니다.' },
            { icon: '🏭', title: '태양광 발전사업 수익성 검토', desc: '100kW급 발전소의 설치비, 운영비, 대출 비율과 금리를 넣어 계약시장 20년 고정가격 기준 판매 수입, 자기자본 회수 기간, IRR과 상환 여력(DSCR)을 금융 상담 전에 미리 확인합니다.' },
            { icon: '🔥', title: '태양열 온수기 크기 정하기', desc: '가족 수에 맞춘 하루 온수량으로 필요한 열량을 구해, 집열판이 너무 커서 버려지는 열이 많지 않은지와 가스·등유 절감액을 함께 확인합니다.' },
          ],
          steps: [
            { step: '탭 선택', desc: '집 전기요금을 줄이려면 태양광 발전, 전력을 팔 사업용 발전소는 발전사업, 온수 연료비를 줄이려면 태양열 온수 탭을 고릅니다. 세 탭의 입력은 따로 유지됩니다.' },
            { step: '설치 조건 입력', desc: '지역을 고르고 패널 1장 출력과 장수, 경사각·방향·그늘을 정합니다. 태양열은 집열판 면적과 종류, 하루 온수량과 온도를 넣습니다.' },
            { step: '사용량·단가·비용', desc: '월 전기 사용량(여름 따로), 설치비, 확정된 보조금을 넣습니다. 기본 단가는 기준일 값이니 고지서 단가가 다르면 바꿔 넣습니다.' },
            { step: '결과 확인·내보내기', desc: '연간 절감액, 회수 기간, 월별 표와 누적 수익 그래프를 확인하고 결과 복사, 견적서 보내기, 인쇄로 저장합니다.' },
          ],
          faqs: [
            { q: '여름보다 봄에 발전량이 더 많은 이유는 무엇인가요?', a: '여름은 해가 길지만 장마로 흐린 날이 많고 패널 온도가 올라가 효율이 떨어집니다. 결정질 실리콘 패널은 온도가 1℃ 오를 때 출력이 약 0.4% 줄어, 맑고 선선한 4~5월에 월 발전량이 가장 많은 경우가 많습니다.' },
            { q: '전기요금 절감액은 어떻게 계산하나요?', a: '태양광이 없을 때와 있을 때의 월 사용량으로 한전 주택용 저압 요금을 각각 계산해 그 차이를 절감액으로 봅니다. 누진 구간이 바뀌는 효과와 기본요금, 기후환경·연료비조정요금, 부가세 10%, 전력산업기반기금 2.7%까지 들어가므로, 발전량 × 단가로 단순 계산한 값과 다릅니다.' },
            { q: '보조금은 얼마나 받을 수 있나요?', a: '한국에너지공단 주택지원사업과 지자체 사업은 해마다 지원 단가와 예산이 바뀌고 지역마다 다릅니다. 그래서 이 계산기는 보조금을 자동으로 빼지 않고, 모집 공고나 시공사 계약서에서 확인한 금액을 넣도록 했습니다.' },
            { q: '계산 결과는 얼마나 정확한가요?', a: '한국동서발전이 공개한 당진·울산 발전소의 2022~2026년 시간대별 실측 발전량과 비교했을 때, 실측 보정을 켠 연간 발전량은 실측과 1% 안팎으로 맞았고 월별로는 10~15% 차이가 났습니다. 그늘이나 방향이 나쁜 현장은 이보다 크게 낮을 수 있어, 동해 발전소처럼 실측이 24% 낮은 사례도 있었습니다.' },
            { q: '2027년부터 새로 짓는 태양광 발전소도 REC를 받을 수 있나요?', a: '2026년 8월 국회를 통과한 재생에너지법 개정안은 REC 신규 발급을 2026년 12월 31일까지로 정했습니다. 이후 신규 발전소는 정부가 여는 계약시장 경쟁입찰에서 낙찰받아 20년 고정가격으로 팔거나 기업과 직접 전력구매계약(PPA)을 맺습니다. 기존 발전소의 REC 현물시장은 2029년 말까지 운영될 예정이며, 계약시장 상한가와 우대가격은 하위법령에서 정해집니다.' },
            { q: 'REC 가중치는 어떻게 매기나요?', a: '일반부지는 100kW 미만 1.2, 3,000kW까지 1.0, 그 초과 0.8을 용량 구간별로 나눠 적용한 뒤 평균합니다. 1,000kW라면 (99.999×1.2 + 900.001×1.0) ÷ 1,000 = 1.019입니다. 건축물은 3,000kW까지 1.5, 수상은 1.6·1.4·1.2, 임야는 0.5이고, 500m 안 같은 사업자의 발전소는 용량을 합칩니다.' },
            { q: '태양열 집열판은 클수록 좋은가요?', a: '아닙니다. 모은 열이 하루 쓰는 온수 열량보다 많으면 남는 열은 쓰지 못합니다. 하루 200L를 15℃에서 45℃로 데우는 데는 약 25MJ가 필요하므로, 이보다 훨씬 많이 모으는 집열판은 여름에 버리는 열만 늘고 회수 기간은 길어집니다.' },
          ],
        },
  en: {
          title: 'Solar PV output, savings, power plant revenue and solar hot water',
          description: 'Annual PV output is roughly capacity (kWp) × regional daily yield hours × 365. A simulation of 16 Korean regions with national reference weather data found an average of 3.6 h/day at 30° south (about 1,312 kWh/kWp), with Seoul at 3.2 h (1,165 kWh/kWp). These figures already include temperature and inverter losses. This calculator applies monthly factors, tilt, orientation, shading and year-by-year degradation, and computes savings with the full KEPCO residential tariff — basic charge, tiered energy charge with summer thresholds, climate and fuel adjustment charges, VAT and the power fund — including net metering of surplus. The power plant tab models plants that sell electricity: under the 2026 amendment of the Renewable Energy Act, new plants from 2027 sell at a 20-year fixed price won in a government contract market instead of earning RECs, so the default price is the 2026 round-1 fixed-price tender average of 146.92 KRW/kWh, while existing REC plants are modelled with SMP plus REC times the band-weighted multiplier until 2029. Capex, O&M and loan terms give a 20-year cash flow, project and equity IRR, payback and minimum DSCR. The solar thermal tab sizes heat demand from daily hot water and temperatures, counts only the heat actually used and converts it to fuel savings through boiler efficiency. Prices are shown with their effective dates and can be edited.',
          useCases: [
            { icon: '🏠', title: 'Home PV Decision', desc: 'Compare monthly bills before and after, and see payback and 20-year return.' },
            { icon: '📋', title: 'Check a Quote', desc: 'Compare a promised yield with regional kWh/kWp.' },
            { icon: '🏭', title: 'Power Plant Returns', desc: 'Check revenue, equity payback, IRR and debt coverage for a 100 kW plant before talking to a lender.' },
            { icon: '🔥', title: 'Size a Solar Water Heater', desc: 'Avoid oversized collectors that waste heat.' },
          ],
          steps: [
            { step: 'Pick a Tab', desc: 'Home PV, power plant or solar hot water; each keeps its own inputs.' },
            { step: 'Describe the System', desc: 'Region, panels, tilt, orientation and shading, or collector area and hot water.' },
            { step: 'Usage, Prices, Cost', desc: 'Enter usage, cost and confirmed subsidy; edit prices if your bill differs.' },
            { step: 'Read and Export', desc: 'See savings, payback, tables and charts; copy, send to invoice or print.' },
          ],
          faqs: [
            { q: 'Why is spring better than summer?', a: 'Summer brings monsoon clouds and hot panels lose about 0.4% per °C, so clear, mild April and May often produce the most.' },
            { q: 'How are bill savings calculated?', a: 'The full residential bill is calculated with and without solar each month, including tiers, charges, VAT and the power fund.' },
            { q: 'What about subsidies?', a: 'They vary by year and municipality, so enter only a confirmed amount.' },
            { q: 'How accurate is it?', a: 'Against 2022–2026 hourly measurements from Korea East-West Power plants in Dangjin and Ulsan, the corrected annual yield matched within about 1% and monthly values within 10–15%; poorly sited plants can be much lower.' },
            { q: 'Do new plants from 2027 get RECs?', a: 'No. New REC issuance ends on 31 December 2026; new plants sell through the government contract market at a 20-year fixed price or via corporate PPAs, and the REC spot market for existing plants is expected to close at the end of 2029.' },
            { q: 'How is the REC weight set?', a: 'For land-mounted PV, 1.2 below 100 kW, 1.0 up to 3 MW and 0.8 above are applied band by band and averaged, so 1,000 kW gets 1.019.' },
            { q: 'Is a bigger collector better?', a: 'No — heat beyond daily demand is wasted; 200 L from 15 to 45 °C needs about 25 MJ a day.' },
          ],
        },
};
