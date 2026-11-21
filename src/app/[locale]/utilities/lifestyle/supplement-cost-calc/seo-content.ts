// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '영양제 진짜 가성비 분석기란 무엇인가요?',
          description:
            '영양제 진짜 가성비 분석기는 제조사 라벨의 표기 방식 차이에 가려진 실제 가격 경쟁력을 숫자로 드러내는 100% 브라우저 기반 가격 비교 계산기입니다. 같은 가격이라도 1회에 먹어야 하는 캡슐 수가 다르면 실제 복용 일수와 하루 단가가 크게 달라지는데, 이 도구는 제품 가격·통 전체 총 캡슐 수·1회 섭취 캡슐 수·1회 섭취량당 핵심 성분(mg)·1회 섭취량당 캡슐 총 용량(mg)을 입력받아 세 가지 핵심 지표를 실시간으로 산출합니다 — 총 복용 가능 일수, 하루 진짜 단가, 그리고 핵심 성분 1,000mg당 가격입니다. 모든 성분 입력은 라벨에 적힌 1회 섭취량 기준 숫자를 그대로 넣으면 되므로 사용자가 따로 나누기 계산을 할 필요가 없고, 순도(핵심 성분 ÷ 캡슐 총 용량 × 100)도 캡슐 수와 무관하게 정확히 계산됩니다. A·B 두 제품을 나란히 입력하면 좌우 대칭 게이지로 어느 쪽이 더 저렴한지 한눈에 비교되고, 1,000mg당 단가를 기준으로 진짜 가성비 승자를 판정합니다. 해외 직구 핫딜이나 커뮤니티 특가가 정말 싼 것인지 객관적으로 검증할 때 유용합니다. 다만 본 도구는 가격 비교 계산기이며, 흡수율이나 원료 형태 같은 요소는 사용자가 직접 판단해야 합니다.',
          useCases: [
            { icon: '💊', title: '오메가3·유산균 직구 핫딜 판독', desc: '가격은 싸 보이는데 1회에 3캡슐을 먹어야 해서 실제론 비싼 제품을 걸러내고, 순수 핵심 성분 함량 대비 1,000mg당 단가로 진짜 가성비를 판정합니다.' },
            { icon: '⚖️', title: '동일 성분 타 브랜드 교체 검토', desc: '현재 먹는 제품과 새로 눈여겨보는 제품의 1,000mg당 단가와 순도를 정확히 대조하여, 브랜드를 교체할 만한 가격 이점이 있는지 객관적으로 판단합니다.' },
            { icon: '🛒', title: '특가 커뮤니티 딜 검증', desc: '영양제 갤러리나 핫딜 커뮤니티에 올라온 특가 제품이 정말 싼 게 맞는지 하루 단가와 1,000mg당 단가로 검증하고 결과 이미지를 공유합니다.' },
            { icon: '🌎', title: '다국어 달러($) 비교', desc: '원화와 달러 결제가 모두 호환되어 아마존, 아이허브 등 글로벌 플랫폼 직구 가격을 같은 통화끼리 정확히 비교하는 데 최적화되어 있습니다.' },
          ],
          steps: [
            { step: '통화·성분 종류 선택', desc: '상단에서 통화(KRW/USD)와 성분 종류(오메가3·비타민·기타)를 선택합니다. 성분 종류에 따라 순도 경고 기준이 자동으로 맞춰져 불필요한 경고를 줄여줍니다.' },
            { step: '라벨 숫자 그대로 입력', desc: '가격, 총 캡슐 수, 1회 섭취 캡슐 수를 입력하고, 핵심 성분과 캡슐 총 용량은 라벨의 1회 섭취량 기준 숫자를 그대로 베껴 넣습니다. 별도 계산이 필요 없습니다.' },
            { step: '고급 입력 (선택)', desc: 'EPA·DHA 개별 함량을 입력하면 EPA 집중형·밸런스형 같은 객관적 비율 타입과 EPA:DHA 비율 수치가 표시됩니다. 효능과 무관한 순수 분류입니다.' },
            { step: '승자와 순도 확인', desc: '하루 단가·1,000mg당 단가·순도가 좌우 게이지로 실시간 비교되고, 1,000mg당 기준으로 더 저렴한 제품에 승자 카드가 표시됩니다. 결과는 이미지로 공유할 수 있습니다.' },
          ],
          faqs: [
            { q: '성분 함량을 1캡슐 기준으로 넣나요, 1회 섭취량 기준으로 넣나요?', a: '라벨에 적힌 1회 섭취량(Serving Size) 기준 숫자를 그대로 입력하시면 됩니다. 핵심 성분과 캡슐 총 용량 모두 같은 1회 섭취량 기준으로 넣어야 순도가 정확히 계산됩니다. 시중 라벨 대부분이 1회 섭취량 기준으로 표기되므로 사용자가 별도로 나누기 계산을 할 필요가 없습니다.' },
            { q: '하루 단가와 1,000mg당 단가 중 뭘 봐야 하나요?', a: '비타민처럼 단순한 제품은 하루 단가가 직관적이고, 오메가3처럼 핵심 성분 농도가 중요한 영양제는 1,000mg당 단가가 핵심 비교 기준입니다. 같은 가격이어도 함량이 다르면 1,000mg당 단가가 크게 차이 나기 때문입니다. 본 도구는 두 지표를 모두 제공하니 비교 목적에 맞게 보세요.' },
            { q: '순도가 높을수록 무조건 좋은 건가요?', a: '오메가3의 경우 순도 80% 내외가 일반적 기준으로 알려져 있습니다. rTG 형태는 보통 80%를 넘기 어려워, 90%에 가까운 순도가 표기되면 용량 표기를 다시 확인할 필요가 있어 본 도구가 이상치를 안내합니다. 비타민·미네랄은 고순도가 정상이라 순도 경고를 적용하지 않습니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 본 도구는 가격 비교 계산기이며 의학적 조언이 아닙니다. 흡수율이나 원료 형태 등은 사용자가 직접 판단해야 하며, 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: 'What is the Supplement Cost Analyzer?',
          description:
            'The Supplement Cost Analyzer is a 100% browser-based price comparison calculator that reveals, in plain numbers, the real cost competitiveness hidden behind differences in how manufacturers label their products. Two products at the same price can have very different real costs if one requires more capsules per serving. This tool takes the product price, total capsules in the bottle, capsules per serving, active ingredient per serving (mg), and total capsule weight per serving (mg), and computes three key metrics in real time: total days of supply, true cost per day, and price per 1,000mg of active ingredient. Every ingredient field is entered exactly as written on the label per serving size, so you never have to do any division yourself, and purity (active ingredient ÷ total capsule weight × 100) is calculated accurately regardless of the capsule count. Enter Products A and B side by side and a left-right symmetric gauge shows at a glance which one is cheaper, declaring the true value winner based on the price per 1,000mg. It is useful for objectively verifying whether an overseas direct-purchase deal or a community sale is actually a good price. Note that this is a price comparison calculator only; factors like absorption rate and ingredient form are for you to judge.',
          useCases: [
            { icon: '💊', title: 'Decode Direct-Purchase Deals', desc: 'Filter out products that look cheap but require 3 capsules per serving and are actually expensive, judging true value by price per 1,000mg of active ingredient.' },
            { icon: '⚖️', title: 'Compare Switching Brands', desc: 'Precisely contrast the price per 1,000mg and purity of your current product against a new candidate to objectively decide whether the price advantage justifies switching.' },
            { icon: '🛒', title: 'Verify Community Sale Deals', desc: 'Check whether a sale product posted in a deal community is genuinely cheap using cost per day and per 1,000mg, then share the result image with others.' },
            { icon: '🌎', title: 'Dollar ($) Comparison', desc: 'With both KRW and USD supported, it is optimized for comparing direct-purchase prices on global platforms like Amazon and iHerb within the same currency.' },
          ],
          steps: [
            { step: 'Pick currency and ingredient type', desc: 'Choose the currency (KRW/USD) and ingredient type (Omega-3, Vitamin, Other) at the top. The purity warning threshold adjusts automatically to the type, cutting unnecessary warnings.' },
            { step: 'Enter label numbers as-is', desc: 'Enter price, total capsules, and capsules per serving, then copy the active ingredient and total capsule weight straight from the label per serving size. No separate math needed.' },
            { step: 'Advanced input (optional)', desc: 'Enter separate EPA and DHA amounts to see an objective ratio type such as EPA-concentrated or Balanced, along with the EPA:DHA ratio. It is a pure classification.' },
            { step: 'Check the winner and purity', desc: 'Cost per day, per 1,000mg, and purity are compared live in left-right gauges, and a winner card highlights the cheaper product by the per-1,000mg metric. Share the result as an image.' },
          ],
          faqs: [
            { q: 'Do I enter ingredient amounts per capsule or per serving?', a: 'Enter the numbers exactly as written on the label per serving size. Both the active ingredient and total capsule weight must be on the same per-serving basis for purity to calculate correctly. Since most labels report per serving size, you never need to divide anything yourself.' },
            { q: 'Should I look at cost per day or cost per 1,000mg?', a: 'For simple products like vitamins, cost per day is intuitive; for supplements where active concentration matters, like Omega-3, price per 1,000mg is the key metric. At the same price, different amounts produce very different per-1,000mg costs. This tool provides both so you can choose by purpose.' },
            { q: 'Is higher purity always better?', a: 'For Omega-3, around 80% purity is a commonly cited benchmark. The rTG form rarely exceeds 80%, so a purity near 90% may warrant rechecking the dosage label, which is why this tool flags outliers. For vitamins and minerals, high purity is normal, so no purity warning is applied.' },
            { q: 'Can I use this result as official data?', a: 'The results are for reference only. This is a price comparison calculator, not medical advice. Factors like absorption rate and ingredient form are for you to judge, and you should consult a professional or official source for accurate figures.' },
          ],
        },
};
