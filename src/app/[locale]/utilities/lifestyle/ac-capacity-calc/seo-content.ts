// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '에어컨 평형 계산기: 방·거실·매장에 맞는 평형과 kW',
          description: '에어컨의 "평형"은 그 제품이 식힐 수 있는 냉방면적을 3.3㎡로 나눈 값입니다. 제조사 사양표를 보면 6평형은 냉방면적 약 19㎡에 냉방능력 약 2.3kW, 17평형은 약 57㎡에 7.0kW로, 냉방면적 1㎡당 약 123W의 냉방능력이 잡혀 있습니다. 그래서 방이나 원룸은 방 면적과 같은 평형을 고르면 되지만, 아파트 거실 스탠드는 집 평형이 아니라 공급면적의 절반 이상을 기준으로 고릅니다. 34평형 아파트라면 공급면적 약 112㎡의 절반인 56㎡, 곧 17평형 스탠드가 기본이고, 남향에 베란다를 확장했다면 한 단계 위인 20평형을 봅니다. 이 계산기는 이 제조사 기준에 남향·서향 창, 큰 창과 확장 베란다, 꼭대기층, 오래된 단열, 거실과 이어진 주방, 높은 천장, 인원 수를 더해 필요한 냉방면적(㎡·평)과 냉방능력(kW·kcal/h)을 구하고, 매장에서 파는 벽걸이 6~16평형, 스탠드 15~40평형 가운데 맞는 제품을 골라 줍니다. 카페·식당·고기집·PC방·헬스장 같은 매장은 업종별 내부 발열을 반영하고, 40평형을 넘으면 몇 대로 나눠 달지 제안합니다. 창 방향·층·업종 가산치는 현장 경험치이므로, 공사가 필요한 매장은 설치 업체의 현장 부하 계산과 함께 보세요.',
          useCases: [
            { icon: '🛏️', title: '방·원룸 벽걸이 고르기', desc: '방 면적이 10평(약 33㎡)이면 10평형 벽걸이(약 4.1kW), 20㎡ 원룸이면 6평형이 기준입니다. 같은 20㎡ 원룸도 서향 꼭대기층이면 7평형으로 올라갑니다.' },
            { icon: '🛋️', title: '아파트 거실 스탠드 평형', desc: '24평형 아파트는 거실 냉방면적이 약 40㎡라 15평형, 34평형은 17평형, 45평형은 23평형 스탠드가 기본입니다. 2in1을 살 때 스탠드 평형을 정하는 데 씁니다.' },
            { icon: '☕', title: '카페·식당 매장 용량', desc: '66㎡(20평) 카페에 손님과 직원 15명이 있으면 업종 발열과 인원을 더해 필요 냉방면적이 약 89㎡, 30평형급(약 10.9kW)입니다. 천장을 3.3m로 노출하면 36평형급이 됩니다.' },
            { icon: '📋', title: '견적서·사양표 kW 비교', desc: '설치 업체 견적이나 제품 사양표의 정격 냉방능력(kW)을 결과와 견줘 봅니다. 고기집 66㎡에 30명, 천장 3m라면 약 18kW가 필요해 23평형 2대로 나눠 다는 조합이 나옵니다.' },
          ],
          steps: [
            { step: '공간 종류 고르기', desc: '침실·원룸·작은 방은 "방·원룸", 거실 스탠드는 "아파트 거실", 카페·식당·사무실처럼 사람과 기기가 많은 곳은 "매장·사무실"을 고릅니다.' },
            { step: '면적 입력', desc: '방과 매장은 냉방할 공간의 실제 바닥 면적을 ㎡나 평으로 넣고, 아파트 거실은 집의 평형(예: 34평형)을 넣으면 공급면적의 절반을 거실 냉방면적으로 잡습니다.' },
            { step: '조건 선택', desc: '창 방향, 큰 창·베란다 확장, 꼭대기층, 오래된 단열, 천장 높이, 평소 인원을 고릅니다. 매장은 업종을 고르면 주방 불과 기기에서 나오는 열이 더해집니다.' },
            { step: '결과 확인', desc: '추천 평형과 벽걸이·스탠드 구분, 필요한 냉방면적과 냉방능력(kW), 항목별로 늘어난 면적을 보고, 아래 평형별 표로 사려는 제품의 사양표와 비교합니다.' },
          ],
          faqs: [
            { q: '34평 아파트면 34평형 에어컨을 사야 하나요?', a: '아닙니다. 에어컨 평형은 그 제품이 감당하는 냉방면적이고, 거실 스탠드는 보통 거실과 주방 쪽만 맡습니다. 제조사도 아파트 거실은 공급면적의 절반 이상을 권하므로 34평형 아파트는 17평형 스탠드가 기본이고, 남향·베란다 확장형이면 18~20평형을 봅니다. 방에는 6~7평형 벽걸이를 따로 다는 것이 일반적입니다.' },
            { q: '평형과 kW는 어떻게 바꿔 보나요?', a: '제조사 사양표의 냉방면적과 정격 냉방능력을 견주면 1㎡당 약 123W입니다. 6평형(약 19.8㎡)은 약 2.4kW, 10평형은 약 4.1kW, 17평형은 약 6.9kW, 30평형은 약 12.2kW입니다. 같은 평형이라도 제품마다 조금씩 다르니 최종 비교는 사양표의 kW 숫자로 하세요.' },
            { q: '용량을 넉넉하게 사면 더 좋지 않나요?', a: '너무 크면 금방 설정 온도에 닿아 켜졌다 꺼졌다를 반복하면서 습기를 덜 빼고, 구입비도 올라갑니다. 요즘 인버터 제품은 낮은 출력으로 오래 돌 수 있어 한 단계 큰 정도는 큰 문제가 없지만, 두세 단계 이상 키우는 것은 권하지 않습니다. 결과가 두 평형 사이라면 큰 쪽을 고르면 됩니다.' },
            { q: '천장이 높으면 얼마나 더 필요한가요?', a: '식혀야 할 공기량이 늘어 그만큼 부하가 커집니다. 이 계산기는 일반 천장 2.4m를 기준으로 높이에 비례해 더하므로 2.7m는 약 12.5%, 3m는 25%, 3.6m는 50%가 늘어납니다. 노출 천장 카페나 복층 매장에서 에어컨이 약하게 느껴지는 흔한 이유입니다.' },
            { q: '보정 비율은 어디서 나온 값인가요?', a: '평형·냉방면적·kW의 관계와 거실 기준은 제조사 사양표와 LG전자 에어컨 선택 가이드를 따랐습니다. 서향 +10%, 꼭대기층 +10%, 업종 발열처럼 나머지 가산치는 설치 현장에서 흔히 쓰는 경험치입니다. 공사가 필요한 매장이나 40평형을 넘는 공간은 업체에 현장 실측과 부하 계산을 함께 요청하세요.' },
          ],
        },
  en: {
          title: 'Air conditioner size calculator: the right class and kW',
          description: 'In Korea air conditioners are sold by "pyeong class", which is simply the cooling area divided by 3.3㎡. Spec sheets show a 6-pyeong unit covering about 19㎡ with roughly 2.3 kW of cooling and a 17-pyeong unit covering about 57㎡ with 7.0 kW, which works out to about 123 W per square metre. A bedroom or studio therefore needs a class equal to its floor area, but a living-room floor-standing unit is chosen from at least half of the apartment\'s supply area rather than the apartment class itself: a 34-pyeong apartment (about 112㎡ supply) needs a 17-pyeong unit, or a 20-pyeong unit if it faces south with an enclosed balcony. This calculator starts from that manufacturer basis and adds south or west windows, large glazing, top-floor heat, old insulation, an open kitchen, high ceilings and extra occupants. It then shows the cooling area, capacity in kW and BTU/h, and the matching wall-mounted (6–16) or floor-standing (15–40) class. Shops such as cafés, restaurants, Korean BBQ, PC cafés and gyms include business heat, and loads above a 40-pyeong class are split across several units. The add-ons are rules of thumb, so commercial installs should still get an on-site load calculation.',
          useCases: [
            { icon: '🛏️', title: 'Pick a Wall Unit for a Room', desc: 'A 33㎡ (10-pyeong) room needs a 10-pyeong wall unit of about 4.1 kW, and a 20㎡ studio a 6-pyeong unit — or 7-pyeong if it faces west on the top floor.' },
            { icon: '🛋️', title: 'Living-Room Floor Unit', desc: 'A 24-pyeong apartment needs a 15-pyeong floor unit, a 34-pyeong apartment 17, and a 45-pyeong apartment 23. Use it to choose the floor unit of a two-in-one set.' },
            { icon: '☕', title: 'Cafés and Restaurants', desc: 'A 66㎡ café with 15 people needs about 89㎡ of cooling area, a 30-pyeong class of roughly 10.9 kW, rising to a 36-pyeong class with a 3.3 m exposed ceiling.' },
            { icon: '📋', title: 'Check Quotes in kW', desc: 'Compare installer quotes or rated capacity on spec sheets. A 66㎡ BBQ restaurant with 30 people and a 3 m ceiling needs about 18 kW, for example two 23-pyeong units.' },
          ],
          steps: [
            { step: 'Choose the Space', desc: 'Use Room for bedrooms and studios, Apartment living for a floor-standing living-room unit, and Shop / office for spaces with many people or appliances.' },
            { step: 'Enter the Area', desc: 'Type the floor area in ㎡ or pyeong, or the apartment class for a living room; half of its supply area becomes the cooling area.' },
            { step: 'Set the Conditions', desc: 'Choose window direction, large windows, top floor, old insulation, ceiling height and usual occupants. For shops, pick the business type.' },
            { step: 'Read the Result', desc: 'See the recommended class and unit type, cooling area, capacity in kW, and each add-on, then compare with spec sheets in the table.' },
          ],
          faqs: [
            { q: 'Does a 34-pyeong apartment need a 34-pyeong AC?', a: 'No. The class is the area one unit can cool, and a living-room floor unit usually covers just the living room and kitchen. Manufacturers advise at least half the supply area, so a 34-pyeong apartment needs a 17-pyeong unit, or 18–20 if it faces south with an enclosed balcony. Bedrooms get separate 6–7-pyeong wall units.' },
            { q: 'How do pyeong classes convert to kW?', a: 'Comparing cooling area and rated capacity on spec sheets gives about 123 W per square metre: a 6-pyeong unit is about 2.4 kW, 10-pyeong about 4.1 kW, 17-pyeong about 6.9 kW and 30-pyeong about 12.2 kW. Models vary slightly, so compare the kW printed on the spec sheet.' },
            { q: 'Is a bigger unit always better?', a: 'An oversized unit reaches the set temperature quickly and cycles on and off, removing less humidity and costing more to buy. Modern inverter units can run slowly, so one class up is fine, but going two or three classes larger is not recommended. If the result falls between two classes, take the larger one.' },
            { q: 'Where do the add-on percentages come from?', a: 'The class, area and kW relationship and the living-room rule follow manufacturer spec sheets and LG Electronics\' buying guide. The other add-ons, such as +10% for west windows or the top floor and business heat, are common installer rules of thumb. Large shops should get an on-site survey and load calculation.' },
          ],
        },
};
