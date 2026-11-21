// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '평수 계산기: ㎡를 평으로, 전용면적을 평형으로',
          description: '1평은 400/121㎡, 약 3.3058㎡입니다. ㎡를 3.3058로 나누면 평, 평에 3.3058을 곱하면 ㎡가 됩니다. 그런데 아파트를 "34평형", "24평형"처럼 부를 때의 평형은 광고에 적힌 전용면적이 아니라 계단·복도 같은 주거공용면적까지 더한 공급면적 기준입니다. 그래서 전용 84㎡는 전용 기준으로는 25.4평이지만 공급면적이 약 112㎡라 34평형, 전용 59㎡는 17.8평이지만 약 24평형으로 부릅니다. 이 계산기는 단순 단위 변환과 함께 전용면적을 평형으로, 평형을 전용면적으로 바꿔 주며, 아파트(전용률 약 72~80%), 주상복합, 오피스텔(계약면적 기준 약 45~60%)처럼 건물 유형에 따라 달라지는 전용률을 반영합니다. 매매가나 분양가를 넣으면 평형 기준과 전용면적 기준 평당 가격, ㎡당 가격도 함께 계산합니다. 2007년부터 상거래에서는 평 대신 ㎡를 쓰도록 되어 있어 계약서와 등기부에는 ㎡로 적힌다는 점도 기억해 두세요.',
          useCases: [
            { icon: '🏠', title: '"84㎡는 몇 평형?" 바로 확인', desc: '분양 공고나 매물 광고의 전용 59㎡·84㎡가 흔히 말하는 몇 평형인지(약 24평형·34평형) 확인하고, 전용 기준 평수(17.8평·25.4평)와 함께 비교합니다.' },
            { icon: '🔁', title: '평형으로 들은 집을 ㎡로 환산', desc: '"34평형 아파트"라고 들었을 때 실제 전용면적이 약 84㎡인지, 오피스텔이라면 전용이 훨씬 작은지 건물 유형별 전용률로 역산합니다.' },
            { icon: '💰', title: '평당 가격 비교', desc: '매매가 10억 원 전용 84㎡라면 평형(약 34평) 기준 평당 약 2,952만 원, 전용(25.4평) 기준 약 3,935만 원입니다. 기사 속 평당가와 같은 기준으로 비교할 수 있습니다.' },
            { icon: '📐', title: '인테리어·상가 면적 계산', desc: '도배·장판 견적이나 상가 임대료처럼 평 단위로 말하는 견적을 ㎡와 오가며 확인하고, 소수점 자리수를 골라 복사합니다.' },
          ],
          steps: [
            { step: '계산 종류 고르기', desc: '단위만 바꾸려면 "㎡ ↔ 평 변환", 몇 평형인지 알고 싶으면 "몇 평형?", 가격 비교는 "평당 가격" 탭을 고릅니다.' },
            { step: '면적 입력', desc: '㎡나 평을 입력하거나 전용 59㎡·84㎡ 같은 대표 면적 버튼을 누릅니다. 평형 계산에서는 아파트·주상복합·오피스텔 중 유형을 고르고, 공급면적을 알면 전용률을 직접 넣습니다.' },
            { step: '결과 확인', desc: '변환된 평수나 ㎡, 추정 평형과 단지별 범위, 공급면적, 평당 가격(평형 기준·전용 기준)과 ㎡당 가격을 확인합니다.' },
            { step: '복사·비교', desc: '복사 버튼으로 결과를 붙여 넣거나, 아래 환산표로 대표 전용면적별 평수와 평형을 한눈에 비교합니다.' },
          ],
          faqs: [
            { q: '전용 84㎡는 왜 25평형이 아니라 34평형인가요?', a: '84㎡를 3.3058로 나누면 25.4평이지만, 평형은 전용면적에 계단·복도·엘리베이터 같은 주거공용면적을 더한 공급면적으로 부르기 때문입니다. 전용 84㎡ 아파트의 공급면적은 보통 110~115㎡로, 평으로 바꾸면 약 34평입니다.' },
            { q: '1평은 정확히 몇 ㎡인가요?', a: '1평은 사방 6자(1자 = 10/33m)인 정사각형 넓이로 400/121㎡, 약 3.305785㎡입니다. 보통 3.3058로 계산하며, ㎡ × 0.3025로 평을 구하기도 합니다.' },
            { q: '오피스텔 평형은 아파트와 어떻게 다른가요?', a: '오피스텔은 공용 주차장·관리시설까지 포함한 계약면적으로 분양하는 경우가 많아 전용률이 45~60% 정도입니다. 그래서 같은 "20평형"이라도 아파트보다 실제 쓰는 전용면적이 훨씬 작습니다.' },
            { q: '평당 가격은 어떤 면적으로 나누나요?', a: '언론 기사나 분양 광고의 평당가는 보통 공급면적(평형) 기준입니다. 같은 집도 전용면적으로 나누면 평당가가 더 높게 나오므로, 두 가격을 비교할 때는 같은 기준끼리 비교해야 합니다.' },
          ],
        },
  en: {
          title: 'Pyeong calculator: ㎡ to pyeong and Korean apartment classes',
          description: 'One pyeong is 400/121 ㎡, about 3.3058 ㎡: divide square metres by 3.3058 for pyeong, or multiply pyeong by 3.3058 for square metres. Korean apartments, however, are described by a "pyeong class" such as 34 or 24, which is based on supply area — the exclusive area shown in listings plus shared stairs and corridors. An 84㎡ unit is 25.4 pyeong exclusive but about 112㎡ of supply area, so it is a 34-pyeong class; a 59㎡ unit is 17.8 pyeong but roughly a 24-pyeong class. Besides plain conversion, this calculator turns exclusive area into a class and back, using typical exclusive ratios for apartments (about 72–80%), mixed-use towers and officetels (about 45–60% of contract area). Enter a price to get the price per pyeong on both the class and exclusive basis, plus the price per ㎡. Since 2007, contracts and registries in Korea must use ㎡ rather than pyeong.',
          useCases: [
            { icon: '🏠', title: 'What Class Is 84㎡?', desc: 'See that exclusive 59㎡ and 84㎡ units are roughly 24- and 34-pyeong classes, alongside their exclusive pyeong (17.8 and 25.4).' },
            { icon: '🔁', title: 'From Class Back to ㎡', desc: 'Heard "34-pyeong apartment"? Estimate the exclusive area (about 84㎡), or see how much smaller an officetel of the same class is.' },
            { icon: '💰', title: 'Compare Price per Pyeong', desc: 'A ₩1 billion 84㎡ flat is about ₩29.5 million per pyeong on the class basis and ₩39.4 million per exclusive pyeong.' },
            { icon: '📐', title: 'Interiors and Shops', desc: 'Switch between pyeong and ㎡ for flooring quotes or shop rents, choose decimal places and copy the result.' },
          ],
          steps: [
            { step: 'Pick a Tab', desc: 'Use unit conversion, the pyeong class tab, or the price per pyeong tab.' },
            { step: 'Enter an Area', desc: 'Type ㎡ or pyeong, or tap a common size like 59㎡ or 84㎡. For classes choose apartment, mixed-use or officetel, or enter a known exclusive ratio.' },
            { step: 'Read the Result', desc: 'See the converted value, estimated class and typical range, supply area, and prices per pyeong and per ㎡.' },
            { step: 'Copy or Compare', desc: 'Copy the result or use the table to compare common apartment sizes at a glance.' },
          ],
          faqs: [
            { q: 'What is pyeong in Korean?', a: 'Pyeong is written 평 in Korean (坪 in Chinese characters) and is the traditional unit for floor area, equal to 3.3058 square meters or about 35.58 square feet. Listings and everyday conversation still use it — "a 34-pyeong apartment" — even though official documents have used square meters since 2007.' },
            { q: 'How many m² is 1 pyeong?', a: 'One pyeong is exactly 400/121 square meters, which is 3.305785 m², usually rounded to 3.3058 m² or 3.3 m². To convert, multiply pyeong by 3.3058 or multiply square meters by 0.3025; 30 pyeong is 99.17 m² (1,067 ft²).' },
            { q: 'Why is 84㎡ a 34-pyeong class, not 25?', a: '84 ÷ 3.3058 is 25.4 pyeong, but classes use supply area, which adds shared stairs, corridors and lifts. An 84㎡ apartment usually has 110–115㎡ of supply area, about 34 pyeong.' },
            { q: 'Exactly how big is one pyeong?', a: 'A square six ja on each side, with one ja being 10/33 m: 400/121 ㎡ ≈ 3.305785 ㎡. Multiplying ㎡ by 0.3025 also gives pyeong.' },
            { q: 'How do officetel classes differ?', a: 'Officetels are often sold by contract area including parking and facilities, with an exclusive ratio of about 45–60%, so the same class has much less usable space than an apartment.' },
            { q: 'Which area is used for price per pyeong?', a: 'Korean media and sales ads usually divide by supply area. Dividing by exclusive area gives a higher figure, so compare like with like.' },
          ],
        },
};
