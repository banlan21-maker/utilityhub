// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '학점 변환기(GPA Converter) — 환산 공식·취업 활용 팁·FAQ',
          description: `학점 변환기(GPA Converter)는 한국 대학에서 사용하는 4.5 만점, 4.3 만점, 100점 만점 성적 체계를 서로 변환해주는 온라인 도구입니다. 과목명, 학점(Credit), 성적(Grade)을 입력하면 전체 GPA와 전공/교양/기타 GPA를 자동으로 계산하고, 다른 기준으로 환산된 값도 즉시 확인할 수 있습니다.

【학점 변환 공식】
4.5 → 4.3 환산: GPA(4.3) = GPA(4.5) × (4.3 ÷ 4.5). 예를 들어 4.5 만점에서 4.0은 4.3 만점으로 약 3.82가 됩니다. 100점 기준 환산은 등급별 기준점수(A+ = 97.5, A = 92.0, B+ = 87.0 등)를 사용합니다. 내부적으로 모든 성적을 정규화된 등급 키로 저장하므로, 입력 단위(4.5/4.3/100점)를 자유롭게 전환해도 데이터가 깨지지 않습니다.

【취업 시 학점 기입 주의사항】
취업 사이트나 지원서에 학점을 기입할 때는 반드시 본인 대학의 기준(4.5 또는 4.3)을 확인하고 기입해야 합니다. 대기업 지원 시 4.5 기준으로 제출하면 4.3 기준보다 높게 보일 수 있어 혼동이 생길 수 있습니다. NCS 직업기초능력 평가나 공기업 채용에서는 100점 만점 환산 점수를 요구하는 경우가 많으므로, 정확한 환산 기준을 사전에 파악하세요. 입력된 과목 정보는 브라우저 LocalStorage에 자동 저장되어 페이지를 새로 고쳐도 데이터가 유지됩니다.`,
          useCases: [
            { icon: '🎓', title: '취업 지원서 학점 기입', desc: '4.5/4.3/100점 기준을 정확히 변환해 채용 서류에 기입합니다. 단위를 바꿔도 입력한 등급이 자동으로 동등 등급으로 매핑됩니다.' },
            { icon: '📊', title: '전공/교양/기타 GPA 분리', desc: '전공 평점, 교양 평점, 기타(인턴십·논문 등) 평점을 각각 계산해 강점 영역을 파악합니다.' },
            { icon: '💾', title: '성적 자동 저장', desc: '입력한 과목과 성적이 LocalStorage에 자동 저장되어 재방문 시 그대로 복원됩니다. 로그인 불필요.' },
            { icon: '📋', title: '환산 기준표 + 결과 복사', desc: '하단의 등급별 환산표로 빠르게 확인하고, 상단 "결과 복사" 버튼으로 클립보드에 한번에 저장합니다.' },
          ],
          steps: [
            { step: '1', desc: '상단에서 입력 기준(4.5/4.3/100점)을 선택' },
            { step: '2', desc: '「+ 과목 추가」 버튼으로 과목명, 학점(0~5), 성적, 구분(전공/교양/기타)을 입력' },
            { step: '3', desc: '상단 결과 카드에서 4.5/4.3/100점 환산 GPA와 전공·교양·기타 평점 확인' },
            { step: '4', desc: '입력 데이터는 자동 저장 — 결과 복사 버튼으로 클립보드 저장도 가능' },
          ],
          faqs: [
            { q: '4.5 학점을 4.3으로 바꾸면 불리한가요?', a: '4.5 기준 A+(4.5)를 4.3으로 환산하면 약 4.3이 되어 손해가 없습니다. 하지만 중간 등급(예: B+)은 4.5 기준 3.5 → 4.3 기준 약 3.33으로 수치가 소폭 낮아집니다. 지원서에는 자신에게 유리한 기준을 선택하되, 학교 공식 기준을 병기하는 것이 권장됩니다.' },
            { q: '입력 단위를 바꾸면 이미 입력한 성적이 깨지나요?', a: '아니요. 본 계산기는 모든 성적을 정규화된 키(A+, A0 등)로 저장하므로 입력 단위(4.5/4.3/100점)를 바꿔도 동등한 등급으로 자동 매핑됩니다. 예를 들어 4.5 모드의 A+는 4.3 모드에서도 A+, 100점 모드에서는 "A+ (95-100)"으로 일관되게 표시됩니다.' },
            { q: '졸업 평점이 기재 기준보다 낮으면 지원이 불가능한가요?', a: '많은 기업에서 4.5 만점 기준 3.0 이상을 커트라인으로 사용하지만, 이는 참고용이며 절대적 기준은 아닙니다. 자소서, 어학 점수, 경험 등 다른 요소로 보완될 수 있으므로 지원 자격 요건을 먼저 확인하세요.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 학사지원팀 또는 공식 성적증명서로 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: 'GPA Converter — Conversion Formulas, Job Application Tips & FAQ',
          description: `The GPA Converter translates between South Korea's three common grading scales — 4.5, 4.3, and 100-point — used across Korean universities. Enter course names, credit hours, and grades to calculate your overall GPA and separate major / liberal arts / other GPAs, with instant conversion to all three scales.

【GPA Conversion Formulas】
4.5 → 4.3: GPA(4.3) = GPA(4.5) × (4.3 ÷ 4.5). For example, a 4.0 on the 4.5 scale equals approximately 3.82 on the 4.3 scale. The 100-point conversion uses grade midpoints: A+ ≈ 97.5, A ≈ 92.0, B+ ≈ 87.0, B ≈ 82.0, and so on. Internally, all grades are stored under normalized keys, so switching the input scale (4.5/4.3/100) never corrupts your data.

【Tips for Job Applications】
When filling out Korean job application forms, always verify which GPA scale the company expects. Some large corporations assume 4.5 as the maximum, so submitting a 4.3-scale score could appear inflated or cause confusion. Many public enterprise (공기업) exams require a 100-point GPA, so convert your grade accurately beforehand. All entered course data is saved to LocalStorage and automatically restored on your next visit.`,
          useCases: [
            { icon: '🎓', title: 'Job application GPA entry', desc: 'Convert between 4.5/4.3/100-point scales accurately for Korean job applications. Switching the input scale auto-maps each grade to its equivalent.' },
            { icon: '📊', title: 'Major / liberal arts / other GPA', desc: 'Calculate your major GPA, liberal arts GPA, and other (internship, thesis, etc.) GPA separately to highlight strengths.' },
            { icon: '💾', title: 'Auto-saved grade data', desc: 'Course data persists in LocalStorage across browser sessions without login.' },
            { icon: '📋', title: 'Reference table + copy result', desc: 'See equivalent values for all letter grades across all three scales at a glance, then copy the full result with one click.' },
          ],
          steps: [
            { step: '1', desc: 'Select your input grading scale (4.5 / 4.3 / 100-point)' },
            { step: '2', desc: 'Click "+ Add Course" and enter course name, credits (0–5), grade, and type (major/liberal arts/other)' },
            { step: '3', desc: 'View converted GPA in all three scales in the result cards at the top, along with separate major/liberal/other GPAs' },
            { step: '4', desc: 'Data is auto-saved — use "Copy Result" to grab the full breakdown for your application' },
          ],
          faqs: [
            { q: 'Does converting from 4.5 to 4.3 put me at a disadvantage?', a: 'An A+ (4.5) converts to exactly 4.3 on the 4.3 scale — no loss at the top. However, mid-range grades (e.g., B+ = 3.5 on 4.5) convert to approximately 3.33 on the 4.3 scale, a slight reduction. When in doubt, submit the scale that your official transcript uses and note the maximum alongside your score.' },
            { q: 'Will switching scales corrupt my entered grades?', a: 'No. The calculator stores all grades under normalized keys (A+, A0, etc.), so changing the input scale (4.5/4.3/100) automatically remaps each grade to its equivalent label. For example, A+ on the 4.5 scale stays A+ on the 4.3 scale and becomes "A+ (95-100)" on the 100-point scale.' },
            { q: "If my GPA is below a company's stated minimum, should I still apply?", a: 'Many Korean companies list a 3.0 / 4.5 minimum as a guideline rather than a strict filter. Strong cover letters, language scores, internship experience, and portfolio work often outweigh borderline GPA scores. Always check the specific job posting for hard requirements.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult your academic office or your official transcript for exact figures.' },
          ],
        },
};
