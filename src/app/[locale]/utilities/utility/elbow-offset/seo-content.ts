// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '배관 옵셋·절단 길이 계산: 엘보값(뺄길이) 자동',
          description: '배관을 꺾어 장애물을 비켜 갈 때 엘보 사이에 들어갈 파이프는 옵셋 거리 그대로 자르면 안 됩니다. 엘보 자체가 길이를 차지하기 때문에, 엘보 중심에서 끝 단면까지의 엘보값(뺄길이, 영문 도면의 Take-off)을 양쪽에서 빼야 합니다. 이 계산기는 국내에서 쓰는 KS B 1522(JIS B 2312) 맞대기 용접 엘보, KS B 1533(JIS B 2301) 나사식 가단주철 엘보, 플랜트용 ASME B16.9 엘보의 엘보값을 호칭별로 넣어 두고, 옵셋 거리만 입력하면 빗변(심-심 길이), 전진 거리, 절단 길이를 계산합니다. 예를 들어 50A 용접 엘보로 300mm 옵셋을 하면 90°는 300 − 76.2 × 2 = 147.6mm, 45°는 빗변 424.3mm에서 31.6mm씩 빼 361.1mm를 자릅니다. 나사 엘보는 중심~끝 치수에서 나사 물림 길이를 뺀 값을 빼므로 25A는 엘보 하나에 23mm입니다. 가로와 세로로 동시에 비켜 가는 롤링 옵셋, 장반경 엘보를 22.5°·30°처럼 잘라 쓰는 경우, 용접 갭, 도면의 심-심 치수에서 양 끝 이음쇠를 빼는 계산도 할 수 있고, 실제 비율 그림과 엘보값 표, 각도별 옵셋 배수표를 함께 보여 줍니다.',
          useCases: [
            { icon: '🔧', title: '보·배관 피해 옵셋', desc: '앞을 막는 보나 다른 배관을 300mm 비켜 갈 때 호칭과 엘보만 고르면, 엘보 사이 파이프를 몇 mm로 잘라야 하는지와 앞으로 얼마나 나아가는지(전진 거리)를 바로 확인합니다.' },
            { icon: '🔩', title: '나사 배관 절단', desc: '15A~50A 급수·소화 나사 배관은 엘보 중심~끝 치수에서 나사 물림을 뺀 값을 빼야 합니다. 25A는 38 − 15 = 23mm로, 용접 엘보 값(38.1mm)을 쓰면 옵셋 하나에 30mm가 짧아집니다.' },
            { icon: '📐', title: '도면 심-심 치수를 실치수로', desc: '도면에 적힌 이음쇠 중심 간 치수에서 양 끝 엘보값과 용접 갭을 빼 실제로 자를 길이를 구합니다. 한쪽이 관 끝이면 그쪽은 빼지 않습니다.' },
            { icon: '🧭', title: '가로+세로 롤링 옵셋', desc: '옆으로 200mm, 위로 150mm를 동시에 비켜 가면 실제 옵셋은 250mm이고, 45° 엘보면 빗변 353.6mm에서 엘보값을 빼 자릅니다. 배관을 기울일 각도도 함께 알려 줍니다.' },
          ],
          steps: [
            { step: '엘보 규격·호칭 고르기', desc: 'KS 용접 엘보(국내 일반), KS 나사 엘보(가단주철), ASME 용접 엘보(플랜트) 중에서 고르고 15A~300A 호칭을 누릅니다. 아래 표에서 그 규격의 엘보값을 한눈에 볼 수 있습니다.' },
            { step: '계산 종류 고르기', desc: '한 방향으로 비켜 가면 "옵셋", 가로와 세로로 동시에 비켜 가면 "가로+세로 옵셋", 도면 치수에서 자를 길이를 구하려면 "심-심 → 절단 길이"를 고릅니다.' },
            { step: '엘보와 치수 넣기', desc: '90°·45° 엘보나 잘라 쓰는 각도를 고르고 옵셋 거리(또는 심-심 치수)를 mm로 넣습니다. 맞대기 용접이면 이음마다 두는 용접 갭도 고릅니다.' },
            { step: '절단 길이 확인', desc: '절단 길이와 빗변, 전진 거리, 빼는 길이 합계를 확인하고, 실제 비율 그림에서 자를 부분(파란색)과 엘보값(노란색)을 봅니다. 결과 복사로 작업 메모를 남깁니다.' },
          ],
          faqs: [
            { q: '엘보값(뺄길이)이 정확히 무엇인가요?', a: '엘보 양쪽 배관 중심선이 만나는 점(엘보 중심)에서 엘보 끝 단면까지의 거리입니다. 도면의 치수와 옵셋은 모두 중심선 기준이라, 실제로 자를 파이프 길이는 그 거리에서 양쪽 엘보값을 빼야 나옵니다. 영문 도면에서는 Take-off 또는 Center-to-end라고 부릅니다.' },
            { q: '45° 옵셋에서 1.414는 어디서 나오나요?', a: '45° 엘보 두 개로 비켜 가면 옵셋, 전진 거리, 빗변이 직각이등변삼각형을 이루므로 빗변은 옵셋의 √2배, 약 1.414배입니다. 30°는 2배, 60°는 1.155배, 22.5°는 2.613배이며, 빗변에서 양쪽 엘보값을 빼야 절단 길이가 됩니다.' },
            { q: 'KS 엘보와 ASME 엘보 값이 다른가요?', a: '90° 장반경은 50A가 76.2mm와 76mm로 거의 같지만 45°는 KS가 31.6mm, ASME가 35mm로 차이가 큽니다. 25A 45°는 15.8mm와 22mm라 옵셋 하나에 12mm 넘게 달라지므로, 쓰는 이음쇠 규격을 꼭 맞춰 고르세요.' },
            { q: '나사 엘보는 왜 값이 다른가요?', a: '나사 이음은 파이프가 이음쇠 안으로 나사 물림 길이만큼 들어가므로, 중심~끝 치수에서 물림 길이를 뺀 값만 빼면 됩니다. KS B 1533 90° 엘보는 15A 27 − 11 = 16mm, 25A 38 − 15 = 23mm, 50A 57 − 20 = 37mm입니다.' },
          ],
        },
  en: {
          title: 'Pipe offset and cut length with automatic fitting allowances',
          description: 'When a pipe is offset around an obstacle, the piece between the elbows is not cut to the offset distance, because each elbow takes up length. The fitting allowance (take-off, or centre-to-end) must be deducted at both ends. This calculator includes allowances for KS B 1522 (JIS B 2312) butt-weld elbows used in Korea, KS B 1533 (JIS B 2301) threaded malleable elbows and ASME B16.9 elbows, and turns an offset into travel, run and cut length. A 300 mm offset with 50A butt-weld elbows needs 147.6 mm of pipe with 90° elbows (300 − 2 × 76.2) and 361.1 mm with 45° elbows (424.3 − 2 × 31.6). Threaded elbows deduct centre-to-end minus thread engagement, 23 mm for 25A. It also handles rolling offsets, elbows cut to any angle, weld root gaps and centre-to-centre runs, with a scale drawing, allowance tables and offset multipliers.',
          useCases: [
            { icon: '🔧', title: 'Offset Around Obstacles', desc: 'Pick the size and elbow to get the cut length and how far the run advances.' },
            { icon: '🔩', title: 'Threaded Pipe', desc: 'Threaded fittings deduct centre-to-end minus engagement — 23 mm for 25A, not 38 mm.' },
            { icon: '📐', title: 'Drawing Dimensions', desc: 'Turn centre-to-centre dimensions into cut lengths by deducting both fittings and weld gaps.' },
            { icon: '🧭', title: 'Rolling Offsets', desc: '200 mm across and 150 mm up is a 250 mm true offset; the tool also gives the roll angle.' },
          ],
          steps: [
            { step: 'Pick Standard and Size', desc: 'KS butt-weld, KS threaded or ASME, 15A to 300A.' },
            { step: 'Pick a Calculation', desc: 'Offset, rolling offset or centre-to-centre to cut length.' },
            { step: 'Enter Elbow and Distance', desc: 'Choose 90°, 45° or a cut-down angle and enter the offset or C-C dimension, plus weld gap.' },
            { step: 'Read the Cut Length', desc: 'Check cut length, travel, run and deductions on the scale drawing, then copy.' },
          ],
          faqs: [
            { q: 'What is the fitting allowance?', a: 'The distance from the elbow centre, where the two centrelines meet, to the end face. Subtract it at both ends of the pipe.' },
            { q: 'Where does 1.414 come from?', a: 'With two 45° elbows the offset, run and travel form a right isosceles triangle, so travel is √2 × offset. 30° is 2.0, 60° 1.155, 22.5° 2.613.' },
            { q: 'Do KS and ASME elbows differ?', a: '90° long radius is nearly the same, but 45° differs: 50A is 31.6 mm in KS and 35 mm in ASME.' },
            { q: 'Why are threaded allowances smaller?', a: 'The pipe screws into the fitting by the engagement length, so only centre-to-end minus engagement is deducted.' },
          ],
        },
};
