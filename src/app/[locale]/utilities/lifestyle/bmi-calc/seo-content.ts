// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: "BMI 계산기 & 일일 권장 수분 섭취량이란 무엇인가요?",
          description: "BMI 계산기(체질량지수 계산기)는 키와 몸무게를 입력하면 체질량지수(Body Mass Index)를 계산하고, 저체중/정상/과체중/비만을 즉시 판별해주는 건강 도구입니다. 동시에 체중과 활동량을 기반으로 하루에 마셔야 하는 물의 양(ml 및 컵 수)도 계산합니다. WHO 기준 정상 BMI 범위(18.5~24.9)와 비교해 현재 체중 상태를 확인하고, 건강한 체중 유지를 위한 수분 섭취 습관 형성에 도움이 됩니다.",
          useCases: [
            { icon: '🏃', title: '다이어트 & 체중 관리', desc: '다이어트 목표 설정 전 현재 BMI를 파악하고, 이상 체중 달성까지의 변화 목표를 수치로 확인합니다.' },
            { icon: '💧', title: '수분 섭취 습관 개선', desc: '활동량에 맞는 일일 권장 수분 섭취량(컵 수)을 확인해 물 마시는 습관을 데이터 기반으로 개선합니다.' },
            { icon: '🏥', title: '건강검진 전 자가 체크', desc: '건강검진이나 의사 상담 전 자신의 BMI 범위를 미리 확인해 건강 상태에 대한 기초적인 이해를 높입니다.' },
            { icon: '🎯', title: '피트니스 목표 설정', desc: '헬스 트레이너 상담 전 기초 데이터를 파악하거나, 운동 계획 수립 시 현재 체중 상태를 객관적으로 평가합니다.' },
          ],
          steps: [
            { step: '키 & 몸무게 입력', desc: '신장(cm)과 체중(kg)을 입력합니다. 정확한 측정값을 사용할수록 더 정확한 결과를 얻을 수 있습니다.' },
            { step: '활동량 선택', desc: '평소 활동량(거의 없음 / 적당함 / 매우 활동적)을 선택합니다. 수분 섭취 권장량 계산에 반영됩니다.' },
            { step: '계산 결과 확인', desc: 'BMI 수치와 상태(저체중/정상/과체중/비만)가 표시되고, 하루 권장 수분 섭취량이 ml와 컵 수로 안내됩니다.' },
            { step: '결과 공유 & 목표 설정', desc: '계산된 BMI와 수분 섭취량을 바탕으로 체중 관리 목표를 설정하세요. SNS 공유 버튼으로 친구에게 도구를 소개할 수도 있습니다.' },
          ],
          faqs: [
            { q: 'BMI가 높으면 반드시 건강에 문제가 있나요?', a: 'BMI는 빠른 체중 상태 평가를 위한 참고 지표입니다. 근육량이 많은 운동선수는 BMI가 높아도 건강할 수 있으며, 노인의 경우 정상 BMI여도 근감소증이 있을 수 있습니다. 정확한 진단은 의료 전문가와 상담하세요.' },
            { q: '하루 물을 얼마나 마셔야 하나요?', a: '일반적으로 체중(kg) × 30~35ml가 기본 권장량입니다. 예를 들어 60kg이라면 1,800~2,100ml(약 9~10잔)입니다. 더운 날씨, 운동 후, 고섬유질 식단에서는 추가 수분이 필요합니다.' },
            { q: '아시아인 기준 BMI는 서양인과 다른가요?', a: '네. WHO 아시아·태평양 권고 기준은 정상 범위를 18.5~22.9로 설정해 서양 기준(18.5~24.9)보다 낮습니다. 이 도구는 일반 WHO 기준을 사용하며, 아시아인은 25 미만이어도 과체중 위험을 고려할 필요가 있습니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: "What is a BMI Calculator & Daily Water Intake Guide?",
          description: "A BMI Calculator computes your Body Mass Index from height and weight, instantly classifying you as underweight, normal, overweight, or obese based on WHO standards. At the same time, it calculates your recommended daily water intake (in ml and cups) based on your body weight and activity level. Use it to check your current weight status against the healthy BMI range (18.5–24.9) and build better hydration habits.",
          useCases: [
            { icon: '🏃', title: 'Diet & Weight Management', desc: 'Check your current BMI before setting diet goals and quantify how far you are from your ideal weight.' },
            { icon: '💧', title: 'Improve Hydration Habits', desc: 'Find your personalized daily water intake recommendation (in cups) matched to your activity level and build data-driven hydration routines.' },
            { icon: '🏥', title: 'Pre-Checkup Self-Assessment', desc: 'Understand your BMI range before a medical checkup or doctor consultation to go in better informed.' },
            { icon: '🎯', title: 'Fitness Goal Setting', desc: 'Get baseline metrics before consulting a personal trainer or building a workout plan to objectively assess your starting point.' },
          ],
          steps: [
            { step: 'Enter height & weight', desc: 'Input your height (cm) and weight (kg). More accurate measurements yield more accurate results.' },
            { step: 'Select activity level', desc: 'Choose your typical activity level (low / moderate / high). This is factored into your daily water intake recommendation.' },
            { step: 'View results', desc: 'Your BMI value and weight status (underweight/normal/overweight/obese) are displayed, along with your recommended daily water intake in ml and cups.' },
            { step: 'Set health goals', desc: 'Use your BMI and hydration results as a baseline to set diet or exercise goals. Share the tool with friends using the SNS share buttons below.' },
          ],
          faqs: [
            { q: 'Does a high BMI always mean poor health?', a: 'BMI is a reference indicator for quick weight status assessment, not a diagnostic tool. Athletes with high muscle mass may have a high BMI while being perfectly healthy, and older adults can have sarcopenia even with a normal BMI. Consult a healthcare professional for accurate diagnosis.' },
            { q: 'How much water should I drink per day?', a: 'The general guideline is body weight (kg) × 30–35 ml. For example, a 60 kg person needs approximately 1,800–2,100 ml (about 9–10 cups) per day. Hot weather, exercise, and high-fiber diets require additional fluid intake.' },
            { q: 'Is the BMI standard different for Asians?', a: 'Yes. The WHO Asia-Pacific recommendation sets the healthy range at 18.5–22.9, lower than the Western standard of 18.5–24.9. This tool uses the general WHO standard; Asians should be aware of overweight risk even below 25.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        },
};
