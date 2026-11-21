// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '1RM 계산기란 무엇인가요?',
          description: "1RM(One Repetition Maximum)은 한 번에 들어 올릴 수 있는 최대 중량을 의미합니다. 직접 측정하기에는 부상 위험이 있어, Epley 공식을 사용하여 안전하게 예측합니다. 공식은 '1RM = 중량 × (1 + 반복횟수/30)'으로, 6~10회 구간에서 가장 정확합니다. 본 도구는 r=1을 입력하면 입력 중량을 그대로 1RM으로 반환하고, r이 12회 이상이거나 16회 이상이면 정확도 안내/입력 차단을 통해 비현실적 추정을 막습니다. 또한 원판 계산은 IWF 표준 컬러로 시각화되며, 그리디 알고리즘 상 입력 무게와 실제 맞춤 무게가 다른 경우 차이를 명시적으로 안내합니다.",
          useCases: [
            { icon: '📊', title: '운동 프로그램 설계', desc: '5x5, 5/3/1 등 퍼센티지 기반 프로그램을 위한 정확한 중량 계산에 활용하세요.' },
            { icon: '🎯', title: '목표 설정 및 추적', desc: '현재 1RM을 기록하고 주기적으로 측정하여 근력 향상을 시각적으로 확인하세요.' },
            { icon: '🏋️', title: '원판 세팅 최적화', desc: '헬스장에서 암산 없이 바로 원판을 세팅할 수 있어 운동 집중도가 높아집니다.' },
            { icon: '📸', title: 'SNS 공유', desc: '인스타그램 스토리 규격으로 저장하여 운동 기록을 친구들과 공유하세요.' },
          ],
          steps: [
            { step: '중량과 반복 횟수 입력', desc: '최근 세트에서 수행한 중량(kg)과 반복 횟수(1~15회)를 입력합니다. 12회 이상은 정확도가 떨어집니다.' },
            { step: '1RM 계산 확인', desc: 'Epley 공식으로 계산된 예상 1RM을 확인합니다. r=1은 입력값 그대로 반환됩니다.' },
            { step: '바벨 무게 선택', desc: '사용할 바벨이 20kg인지 15kg인지 선택합니다 (올림픽 바벨 vs 여성용 바벨).' },
            { step: '목표 중량 입력 및 원판 확인', desc: '들고 싶은 총 중량을 입력하면 IWF 표준 컬러 원판이 시각화됩니다. 입력값과 실제 맞춤값이 다르면 차이를 자동 표시합니다.' },
          ],
          faqs: [
            { q: 'Epley 공식은 얼마나 정확한가요?', a: '1985년 Bruce Epley가 발표한 공식으로, 6~10회 반복 구간에서 평균 오차 3~5% 이내입니다. 본 도구는 12회 이상 입력 시 정확도 안내를, 16회 이상은 입력 차단으로 비현실적 추정(예: r=30 → 1RM 2배)을 방지합니다.' },
            { q: '원판 색깔이 헬스장과 다른데요?', a: 'IWF(국제 역도 연맹) 표준 컬러: 빨강(25kg), 파랑(20kg), 노랑(15kg), 초록(10kg), 하양(5kg), 검정(2.5kg), 은색(1.25kg). 일부 헬스장은 다른 색상을 사용할 수 있습니다.' },
            { q: '목표 무게가 정확히 맞춰지지 않을 때는?', a: '본 도구는 1.25kg 단위로만 원판을 조합할 수 있어 일부 무게(예: 142kg)는 정확히 맞출 수 없습니다. 그리디 알고리즘으로 가장 가까운 조합을 계산하고, 차이가 발생하면 결과 카드 위에 노란 박스로 차이를 명시합니다.' },
            { q: '이미지 저장이 안 돼요', a: '브라우저 팝업 차단 해제 또는 다운로드 권한 허용 필요. 일부 모바일 브라우저는 "다운로드" 폴더에 자동 저장됩니다. 결과가 없으면 저장 버튼이 비활성화됩니다.' },
          ],
        },
  en: {
          title: 'What is a 1RM Calculator?',
          description: "1RM (One Repetition Maximum) is the maximum weight you can lift for one repetition. Direct testing carries injury risk, so we use the Epley formula for safe estimation: 1RM = Weight × (1 + Reps/30). The formula is most accurate in the 6–10 rep range. This tool returns your input weight unchanged when reps = 1, shows an accuracy warning at 12+ reps, and blocks input above 15 reps to prevent unrealistic estimates (e.g., 30 reps → 2× weight). Plate loading is visualized with IWF standard colors, and when greedy plate combinations cannot exactly match the target weight, the difference is explicitly shown so users are not misled.",
          useCases: [
            { icon: '📊', title: 'Program Design', desc: 'Calculate precise weights for percentage-based programs like 5x5, 5/3/1, and Texas Method.' },
            { icon: '🎯', title: 'Goal Setting & Tracking', desc: 'Record your current 1RM and measure periodically to visualize strength gains over time.' },
            { icon: '🏋️', title: 'Plate Loading Optimization', desc: 'No more mental math at the gym — instantly see which plates to load on each side of the bar.' },
            { icon: '📸', title: 'Social Sharing', desc: 'Export results in Instagram Story format (9:16) to share your lifting achievements.' },
          ],
          steps: [
            { step: 'Enter weight and reps', desc: 'Input the weight (kg) and reps from your recent set (1–15 recommended). 12+ reps lose accuracy.' },
            { step: 'Check calculated 1RM', desc: 'View your estimated 1RM via the Epley formula. A single-rep entry returns your input weight as-is.' },
            { step: 'Select barbell weight', desc: "Choose whether you're using a 20kg Olympic bar or 15kg women's bar." },
            { step: 'Enter target & view plates', desc: 'Input your desired total weight to see IWF-standard colored plates. If the greedy combo cannot match exactly, the difference from your target is shown.' },
          ],
          faqs: [
            { q: 'How accurate is the Epley formula?', a: "Published by Bruce Epley in 1985, accuracy is within 3–5% in the 6–10 rep range. This tool warns at 12+ reps and blocks input above 15 reps to prevent unrealistic estimates like 30 reps producing 2× the input weight." },
            { q: 'Why are the plate colors different from my gym?', a: 'This tool follows the International Weightlifting Federation (IWF) standard: Red (25kg), Blue (20kg), Yellow (15kg), Green (10kg), White (5kg), Black (2.5kg), Silver (1.25kg). Some gyms use different schemes.' },
            { q: 'What if my target weight cannot be matched exactly?', a: 'Plates only come in 1.25kg increments, so some targets (e.g., 142kg) cannot be matched exactly. The tool uses a greedy algorithm to find the closest combination and displays the actual weight and difference from your target above the visualization.' },
            { q: "Image save isn't working", a: 'Disable popup blockers or allow download permissions in your browser. On some mobile browsers, images auto-save to the Downloads folder. The save button is disabled until you have a calculated result.' },
          ],
        },
};
