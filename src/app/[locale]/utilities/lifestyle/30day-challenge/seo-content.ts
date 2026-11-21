// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: "30일 챌린지 트래커란 무엇인가요?",
          description: "30일 챌린지는 새로운 습관을 형성하거나 목표를 달성하기 위해 30일 동안 매일 특정 행동을 반복하는 자기 계발 방법입니다. 연구에 따르면 새로운 습관이 자동화되려면 평균 21~66일이 걸리며, 30일은 습관 형성의 핵심 기간입니다. 이 온라인 트래커는 브라우저 localStorage를 활용하여 30일간의 진행 상황을 안전하게 보관하며, 각 날짜에 메모를 남기고 PDF로 출력할 수 있습니다. 운동, 독서, 명상, 영어 공부 등 어떤 목표든 시각적으로 추적하며 성취감을 느낄 수 있습니다.",
          useCases: [
            { icon: '💪', title: '헬스 & 운동 챌린지', desc: '스쿼트 100개, 플랭크 1분, 물 2L 마시기 등 건강 목표를 30일간 기록하고 메모로 당일 실제 수행 내용을 남겨 진행 상황을 확인하세요.' },
            { icon: '📚', title: '독서 & 학습 챌린지', desc: '매일 책 20페이지 읽기, 영단어 30개 암기, 강의 1개 수강 등 꾸준한 학습 습관을 만들고 배운 핵심 내용을 메모로 기록하세요.' },
            { icon: '🧘', title: '멘탈 관리 챌린지', desc: '명상 10분, 감사 일기 쓰기, 디지털 디톡스 등 정신 건강을 위한 루틴을 정착시키고 그날의 느낌이나 감사한 점을 메모로 남겨보세요.' },
            { icon: '🎨', title: '창작 & 생산성 챌린지', desc: '매일 그림 그리기, 블로그 글쓰기, 코딩 1시간 등 창작 활동을 꾸준히 이어가고 당일 완성한 작업이나 아이디어를 메모로 기록하세요.' },
          ],
          steps: [
            { step: '챌린지 목표와 시작 날짜 입력', desc: "나만의 목표(예: '매일 푸시업 30개 하기')와 시작 날짜를 입력하고 원하는 테마 컬러를 선택한 뒤 시작하기 버튼을 누릅니다." },
            { step: '날짜 클릭 → 체크 & 메모', desc: '목표를 달성한 날 해당 날짜 칸을 클릭하면 완료 체크와 간단한 메모(최대 80자)를 남길 수 있습니다. 셀 하단에 메모 미리보기가 표시됩니다.' },
            { step: '실패 날짜 자동 표시', desc: '시작일 이후 지난 날짜 중 체크하지 않은 날은 자동으로 빨간색 ✕ 실패 표시가 나타납니다. 현재 날짜 이후는 표시되지 않습니다.' },
            { step: 'PDF 출력으로 백업', desc: 'PDF 다운로드 버튼을 눌러 지금까지의 진행 상황(완료·실패 표시 및 메모 포함)을 PDF로 저장하여 오프라인 기록으로 보관할 수 있습니다.' },
          ],
          faqs: [
            { q: '기록이 사라지면 어떡하나요?', a: '브라우저의 localStorage에 저장되므로 쿠키나 캐시를 삭제하지 않는 한 안전하게 보관됩니다. 만약을 대비해 주기적으로 PDF로 백업하는 것을 추천합니다.' },
            { q: '실패 표시는 어떻게 작동하나요?', a: '시작일부터 오늘 이전까지의 날짜 중 체크하지 않은 날은 자동으로 빨간색 ✕ 실패 표시가 나타납니다. 오늘 날짜나 미래 날짜는 아직 실패로 표시되지 않습니다. 뒤늦게 체크하면 실패 표시가 사라집니다.' },
            { q: '메모는 얼마나 길게 쓸 수 있나요?', a: '메모는 최대 80자까지 입력할 수 있습니다. 셀 하단에는 메모 내용이 미리보기로 표시되며, PDF 출력 시에도 메모가 포함됩니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 기록은 참고용으로만 제공됩니다. 정확한 습관 형성 기간이나 효과는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: "What is a 30-Day Challenge Tracker?",
          description: "A 30-day challenge is a personal development method where you repeat a specific action daily for 30 days to build a new habit or achieve a goal. Research shows that it takes an average of 21 to 66 days for a new habit to become automatic. This online tracker stores your 30-day progress in browser localStorage and lets you add a daily memo note to each day. Days you miss after the start date are automatically marked with a red ✕ failure indicator. Export to PDF including all check marks, failure marks, and memos at any time.",
          useCases: [
            { icon: '💪', title: 'Fitness & Exercise Challenges', desc: 'Track 30 days of push-ups, squats, or daily water intake. Leave a memo note recording exactly how many reps you completed each day to monitor your progress.' },
            { icon: '📚', title: 'Reading & Learning Challenges', desc: 'Build consistent learning habits by checking off daily reading or study sessions. Use the memo to jot down key vocabulary or page numbers to reinforce memory.' },
            { icon: '🧘', title: 'Mental Wellness Challenges', desc: 'Establish routines for mental health: meditation, gratitude journaling, or digital detox. Record how you felt each day in the memo to reflect on your journey.' },
            { icon: '🎨', title: 'Creative & Productivity Challenges', desc: 'Sustain creative activities like daily drawing or coding. Use memo notes to describe what you created or learned, building a meaningful 30-day portfolio.' },
          ],
          steps: [
            { step: 'Enter your challenge goal and start date', desc: "Type your goal (e.g., '30 push-ups every day') and start date, choose a theme color, then tap Start Challenge to begin your tracker." },
            { step: 'Click a day to check it off and add a note', desc: "Tap any day cell to open the day panel. Toggle the completion check and optionally add a short memo (up to 80 characters). The memo preview appears at the bottom of the cell." },
            { step: 'Missed days are automatically marked as failures', desc: 'Any day after your start date that has passed without being checked automatically turns red with a ✕ failure mark. Checking it later removes the failure marker.' },
            { step: 'Download PDF to save your progress', desc: 'Use the PDF Download button to export your full 30-day tracker including completed days, failure marks, and memo notes as a PDF file for offline records.' },
          ],
          faqs: [
            { q: 'What if my progress gets deleted?', a: "Data is saved in your browser's localStorage and persists unless you clear cache or cookies. We recommend regular PDF backups to avoid data loss." },
            { q: 'How does the failure marking work?', a: 'Any day between your start date and yesterday that has not been checked is automatically shown with a red ✕ failure indicator. Today and future dates are not marked as failures yet. Checking a missed day retroactively removes the failure mark.' },
            { q: 'How long can my memo notes be?', a: 'Memo notes can be up to 80 characters. A preview appears at the bottom of each cell, and memos are included when you export to PDF.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. For accurate information on habit formation timelines or health goals, please consult a professional or official source.' },
          ],
        },
};
