// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '만나이·전역일·배란일 계산기 — 계산 공식·법적 기준·FAQ',
          description: `한국형 날짜 계산기는 한국 생활에서 자주 필요한 세 가지 날짜 계산 — 만나이, 전역일, 배란일 — 을 하나의 도구에서 제공합니다.

【만나이 통일법 (2023년 6월 28일 시행)】
2023년 6월부터 민법과 행정기본법 개정으로 공공·행정·법령 문서에서 '만 나이'가 공식 기준이 되었습니다. 만 나이는 생일이 지났을 때 1세를 더하는 방식으로, 국제 표준과 동일합니다. 반면 '연 나이'는 현재 연도에서 출생 연도를 빼는 방식이고, '세는 나이'는 태어난 해를 1세로 시작해 새해마다 1세를 더하는 한국 전통 방식입니다. 이 계산기는 세 가지 나이를 모두 표시하며, 초등학교 입학 예정 연도(생년 + 7)와 다음 생일까지의 남은 일수도 함께 알려줍니다.

【군 복무 기간 (2024년 기준)】
육군·해병대 18개월, 해군 20개월, 공군 21개월, 사회복무요원·상근예비역 21개월을 기준으로 전역 예정일을 계산합니다. 게이지 바로 현재 복무율을 한눈에 파악할 수 있습니다.

【배란일 계산 공식】
배란 예정일 = 마지막 생리 시작일 + (주기 - 14일). 가임기는 배란일 기준 -5일 ~ +1일로 표시합니다. 달력 UI로 생리 예정일, 가임기, 배란 예정일, 다음 생리 예측일을 한눈에 확인할 수 있습니다.`,
          useCases: [
            { icon: '🎂', title: '만나이 확인', desc: '2023년 만나이 통일법 시행 이후 공식 나이를 정확히 확인합니다.' },
            { icon: '🪖', title: '전역일·복무율 계산', desc: '입대일과 군별을 선택하면 전역일과 복무 진행률이 즉시 표시됩니다.' },
            { icon: '🌸', title: '배란일 예측', desc: '마지막 생리일과 주기를 입력해 달력 형태로 가임기를 확인합니다.' },
            { icon: '💾', title: '브라우저 자동 저장', desc: '입력한 정보가 LocalStorage에 저장되어 다음 방문 시에도 유지됩니다.' },
          ],
          steps: [
            { step: '1', desc: '상단 탭에서 계산 유형(만나이/전역일/배란일)을 선택' },
            { step: '2', desc: '날짜 또는 주기를 입력' },
            { step: '3', desc: '결과가 즉시 표시됨 — 버튼 클릭 불필요' },
            { step: '4', desc: '입력값은 브라우저에 자동 저장되어 재방문 시 복원' },
          ],
          faqs: [
            {
              q: '군 복무 기간 단축이나 단기 복무 반영이 되나요?',
              a: '현재 도구는 2024년 기준 표준 복무 기간을 사용합니다. 특기병, 부사관, 장교, 전문연구요원 등 비표준 복무 기간은 별도로 적용되지 않습니다. 정확한 전역일은 복무 부대에 문의하세요.',
            },
            {
              q: '만나이와 연나이 중 어떤 나이를 사용해야 하나요?',
              a: '2023년 6월부터 의료·행정·법령 문서는 만 나이를 기준으로 합니다. 단, 병역법·청소년보호법 등 일부 법률은 기존 연 나이나 세는 나이를 계속 사용할 수 있으므로 해당 법률을 확인하세요.',
            },
            {
              q: '배란일 계산이 부정확한 이유는 무엇인가요?',
              a: '배란일은 개인의 건강 상태, 스트레스, 호르몬 불균형에 따라 달라질 수 있습니다. 이 도구는 평균 주기를 기반으로 한 통계적 예측값으로, 임신을 계획하고 있다면 산부인과 전문의의 상담이 필요합니다.',
            },
            {
              q: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
              a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.',
            },
          ],
        },
  en: {
          title: 'Korean Age / Military Discharge / Ovulation Calculator — Formulas & FAQ',
          description: `The Korean Date Calculator combines three essential date calculations for life in Korea — international age (만 나이), military discharge date, and ovulation prediction — into one tool.

【Korean Age Unification Act (Effective June 28, 2023)】
As of June 2023, South Korea officially adopted the international "full age" system in all administrative and legal documents. Under this system, age increases only on birthdays, matching the global standard. The tool also displays "year age" (birth year subtracted from the current year) and "counting age" (the traditional Korean system where you are 1 at birth and gain a year each New Year). Elementary school enrollment year is calculated as birth year + 7.

【Military Service Periods (2024 Standard)】
Army & Marines: 18 months, Navy: 20 months, Air Force: 21 months, Social Service Workers: 21 months. The discharge date and a visual progress gauge are instantly displayed after entering the enlistment date and branch.

【Ovulation Calculation Formula】
Ovulation day = Last menstrual period (LMP) + (cycle length − 14). The fertile window spans from 5 days before ovulation to 1 day after. All dates are displayed on a color-coded mini calendar.`,
          useCases: [
            { icon: '🎂', title: 'Official age check', desc: 'Verify your official international (full) age under the 2023 Korean Age Unification Act.' },
            { icon: '🪖', title: 'Discharge & progress', desc: 'Enter enlistment date and branch to see discharge date and service completion rate.' },
            { icon: '🌸', title: 'Ovulation prediction', desc: 'Enter last period date and cycle to view fertile window on a color-coded calendar.' },
            { icon: '💾', title: 'Auto-saved', desc: 'Inputs are saved to LocalStorage and restored automatically on next visit.' },
          ],
          steps: [
            { step: '1', desc: 'Select a calculation type (Age / Military / Ovulation) from the tabs' },
            { step: '2', desc: 'Enter your date or cycle information' },
            { step: '3', desc: 'Results appear instantly — no submit button needed' },
            { step: '4', desc: 'Inputs are automatically saved to your browser for next time' },
          ],
          faqs: [
            {
              q: 'Does the military calculator account for shortened or extended service?',
              a: 'The tool uses standard 2024 service durations. Special roles (commissioned officers, NCOs, research specialists, etc.) have different service lengths not covered here. Contact your unit for a precise discharge date.',
            },
            {
              q: 'Which age system should I use for official documents?',
              a: 'Since June 2023, international (full) age is required in medical, administrative, and most legal documents. However, certain laws such as the Military Service Act and Youth Protection Act may still reference year age or counting age, so always verify the applicable law.',
            },
            {
              q: 'Why might my ovulation date be different from this estimate?',
              a: 'Ovulation can shift due to stress, illness, hormonal fluctuations, or irregular cycles. This tool provides a statistical estimate based on average cycle length. For family planning or fertility concerns, consult a licensed OB/GYN.',
            },
            {
              q: 'Can I use this result as official data?',
              a: 'Results are for reference only. Please consult a professional or official source for accurate figures.',
            },
          ],
        },
};
