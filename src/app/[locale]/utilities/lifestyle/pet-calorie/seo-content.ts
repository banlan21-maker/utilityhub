// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: "반려동물 사료량 & 칼로리 계산기란 무엇인가요?",
          description: "반려동물 사료량 계산기는 강아지(개)와 고양이의 체중, 생애 단계, 활동량을 입력하면 기초 대사량(RER)과 일일 권장 칼로리(DER)를 과학적으로 계산하고, 사료 칼로리를 입력하면 하루 급여해야 할 사료량(g)까지 알려주는 도구입니다. 국제 수의영양학 공식(RER = 70 × 체중^0.75)을 기반으로 하며, 반려동물의 건강한 체중 유지와 비만 예방을 위한 정확한 사료량을 파악하는 데 도움이 됩니다.",
          useCases: [
            { icon: '🐶', title: '강아지 다이어트 관리', desc: '과체중 강아지의 일일 권장 칼로리를 계산해 체중 감량에 필요한 사료 감소량을 파악하고 다이어트 식이 계획을 세웁니다.' },
            { icon: '🐱', title: '고양이 성장기 영양 관리', desc: '자묘(키튼) 시기에는 성묘보다 많은 칼로리가 필요합니다. 성장기에 맞는 적정 사료량으로 건강한 성장을 지원합니다.' },
            { icon: '🏥', title: '수의사 상담 전 사전 점검', desc: '동물병원 방문 전 반려동물의 일일 칼로리 섭취량을 계산해 의사와 영양 상담을 더 효과적으로 진행합니다.' },
            { icon: '🛒', title: '사료 구매 & 한 달 소비량 예측', desc: '일일 권장 사료량을 기준으로 한 달 소비량을 계산해 경제적으로 사료를 구매하고 재고를 관리합니다.' },
          ],
          steps: [
            { step: '반려동물 정보 입력', desc: '종류(강아지/고양이), 체중(kg), 생애 단계(자견~노령), 활동량(낮음/보통/높음)을 선택합니다.' },
            { step: '사료 칼로리 입력', desc: '현재 급여 중인 사료의 칼로리(kcal/kg)를 입력합니다. 사료 봉투 뒷면이나 제조사 홈페이지에서 확인할 수 있습니다.' },
            { step: '권장 사료량 확인', desc: '기초 대사량(RER), 일일 권장 칼로리(DER), 하루 권장 사료량(g)이 계산됩니다. 아침·저녁 2회 급여 시 절반씩 나눠주세요.' },
            { step: '결과 기록 & 모니터링', desc: '계산된 사료량을 기준으로 2~3주간 급여하면서 반려동물의 체중 변화를 모니터링하세요. 체중이 늘거나 줄면 활동량 설정을 조정해 재계산합니다.' },
          ],
          faqs: [
            { q: '계산된 사료량과 사료 봉투의 급여량 기준이 다릅니다', a: '사료 봉투의 급여량은 제조사 기준으로 다소 많이 제시되는 경향이 있습니다. 이 계산기는 개별 반려동물의 체중과 활동량을 반영하므로 더 정밀합니다. 처음에는 계산량을 기준으로 2~3주간 급여 후 체중 변화를 모니터링하세요.' },
            { q: '중성화 수술 후 사료량을 줄여야 하나요?', a: '네. 중성화 후에는 기초 대사율이 약 20~30% 낮아져 같은 양을 먹어도 살이 찌기 쉽습니다. 생애 단계에서 "성견/성묘 (중성화 완료)"를 선택하면 이를 반영한 권장량이 계산됩니다.' },
            { q: '반려동물이 계산된 양보다 훨씬 많이 먹으려 합니다', a: '하루 급여량을 한 번에 주지 말고 2~3회로 나눠 급여하면 포만감이 높아집니다. 또한 식이섬유가 풍부한 사료나 물을 사료와 함께 제공하면 과식 충동을 줄일 수 있습니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: "What is a Pet Food & Calorie Calculator?",
          description: "A pet food calculator uses your dog or cat's weight, life stage, and activity level to scientifically calculate their Resting Energy Requirement (RER) and Daily Energy Requirement (DER), then converts that into the exact grams of food to serve each day based on your food's calorie density. Built on the internationally recognized veterinary formula (RER = 70 × weight^0.75), it helps you maintain your pet's healthy weight and prevent obesity.",
          useCases: [
            { icon: '🐶', title: 'Dog Weight Management', desc: "Calculate an overweight dog's daily calorie target and determine how much to reduce portions for a safe, effective weight-loss plan." },
            { icon: '🐱', title: 'Kitten Nutritional Support', desc: 'Kittens need significantly more calories than adult cats. Get the right portion size for each growth stage to support healthy development.' },
            { icon: '🏥', title: 'Pre-Vet Visit Prep', desc: "Calculate your pet's daily calorie intake before a vet appointment to make nutritional consultations more productive." },
            { icon: '🛒', title: 'Monthly Food Budget Planning', desc: 'Use the daily portion recommendation to forecast monthly food consumption and buy the right amount economically.' },
          ],
          steps: [
            { step: 'Enter pet information', desc: 'Select species (dog/cat), enter weight (kg), choose life stage (puppy to senior), and select activity level (low/normal/high).' },
            { step: 'Enter food calorie density', desc: "Input the calorie content (kcal/kg) of the food you currently serve. Find this on the bag's label or the manufacturer's website." },
            { step: 'View recommended portion', desc: 'RER, DER, and daily food amount (g) are calculated. Split the total evenly between morning and evening meals.' },
            { step: 'Monitor and adjust', desc: "Feed the calculated amount for 2–3 weeks and monitor your pet's body weight. If weight changes unexpectedly, revisit the activity level setting and recalculate." },
          ],
          faqs: [
            { q: "The calculator's result differs from the bag's feeding guide", a: "Manufacturer guidelines tend to be slightly generous. This calculator accounts for your individual pet's weight and activity level for a more precise result. Start with the calculated amount, monitor weight changes over 2–3 weeks, and adjust as needed." },
            { q: 'Should I reduce food portions after spaying/neutering?', a: 'Yes. Spaying/neutering lowers the metabolic rate by about 20–30%, making it easier to gain weight on the same portions. Select "Adult (neutered)" in the life stage field to factor this in.' },
            { q: 'My pet always seems hungry after the calculated portion', a: 'Divide the daily amount into 2–3 smaller meals instead of one feeding to improve satiety. Offering fiber-rich food or adding water to dry kibble can also help reduce overeating urges.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        },
};
