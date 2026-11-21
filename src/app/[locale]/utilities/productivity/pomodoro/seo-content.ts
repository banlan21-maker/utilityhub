// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: "포모도로 타이머란 무엇인가요?",
          description: "포모도로 기법(Pomodoro Technique)은 1980년대 프란체스코 시릴로가 개발한 시간 관리 방법론으로, 25분 집중 + 5분 휴식을 한 사이클로 반복하는 방식입니다. '포모도로'는 이탈리아어로 토마토를 뜻하며, 개발자가 사용한 토마토 모양 타이머에서 유래했습니다. 이 온라인 포모도로 타이머는 설치 없이 브라우저에서 바로 사용할 수 있으며, 집중 세션 횟수를 자동으로 누적하고 브라우저 알림으로 타이머 종료를 알려줍니다. 공부, 개발, 글쓰기 등 집중력이 필요한 모든 작업에 효과적이며, 시간 커스텀 설정으로 개인 작업 스타일에 맞게 조정할 수 있습니다.",
          useCases: [
            { icon: '💻', title: '개발 & 코딩 집중', desc: '기능 구현, 버그 수정, 코드 리뷰 등 각 작업을 포모도로 단위로 분할해 집중력과 생산성을 높입니다.' },
            { icon: '📚', title: '시험 공부 & 자격증 준비', desc: '25분 집중 학습 후 5분 휴식을 반복하면 장시간 공부 시 발생하는 집중력 저하와 번아웃을 예방합니다.' },
            { icon: '✍️', title: '글쓰기 & 콘텐츠 제작', desc: '블로그 포스팅, 보고서 작성, 영상 편집 등 창작 작업에서 마감 압박 없이 꾸준한 작업 흐름을 유지합니다.' },
            { icon: '🎯', title: '재택근무 집중력 관리', desc: '집에서 일할 때 발생하는 산만함을 포모도로 타이머로 극복하고, 작업 세션을 기록해 성취감을 느낍니다.' },
          ],
          steps: [
            { step: '모드 선택 (집중 / 짧은 휴식 / 긴 휴식)', desc: '집중 세션(25분), 짧은 휴식(5분), 긴 휴식(15분) 중 원하는 모드를 선택합니다. 설정에서 각 시간을 커스텀할 수 있습니다.' },
            { step: '타이머 시작', desc: "'시작' 버튼을 누르고 해당 작업에만 집중합니다. 타이머가 돌아가는 동안은 다른 탭 전환, SNS 확인을 최대한 자제하세요." },
            { step: '알림 수신 및 휴식', desc: '타이머 종료 시 브라우저 알림(허용 시)과 소리로 알려줍니다. 짧은 휴식을 취하고 다음 포모도로를 시작합니다. 4회 완료 후 긴 휴식을 갖습니다.' },
            { step: '반복 & 세션 기록', desc: '집중 세션이 완료될 때마다 화면 하단에 🍅 카운트가 누적됩니다. 하루 완료한 포모도로 수를 확인하며 생산성을 측정하고 목표를 설정하세요.' },
          ],
          faqs: [
            { q: '포모도로 한 번 중간에 방해받으면 어떻게 해야 하나요?', a: "포모도로 기법의 핵심 원칙은 한 사이클의 완전한 집중입니다. 부득이한 방해가 생기면 타이머를 멈추고 이슈를 메모한 후, 처음부터 다시 시작하는 것이 권장됩니다. 해당 포모도로는 '무효'로 처리합니다. 방해 요소가 잦다면 방해 금지 모드(휴대폰 무음, 슬랙 알림 끄기)를 함께 활용하세요." },
            { q: '25분이 너무 짧거나 길게 느껴집니다. 조절할 수 있나요?', a: '네. 우측 상단 설정(⚙️) 버튼에서 집중 시간(1~99분), 짧은 휴식, 긴 휴식 시간을 자유롭게 조정할 수 있습니다. 처음에는 25분이 어색할 수 있지만, 일주일 정도 사용하면 자연스럽게 적응됩니다. 초보자는 15분부터 시작하는 것도 좋습니다.' },
            { q: '브라우저 알림이 오지 않습니다', a: "브라우저 주소창 왼쪽 자물쇠 아이콘 → '알림' 권한을 '허용'으로 변경하세요. 또는 화면의 '알림 허용' 버튼을 클릭해 권한을 부여하면 됩니다. iOS Safari는 브라우저 알림을 지원하지 않으므로 소리 알림만 활용하세요." },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: "What is a Pomodoro Timer?",
          description: "The Pomodoro Technique is a time management method developed by Francesco Cirillo in the 1980s that alternates 25-minute focused work sessions with 5-minute breaks. 'Pomodoro' is Italian for tomato, named after the tomato-shaped kitchen timer the creator used. This online Pomodoro timer runs directly in your browser without installation, automatically tracks completed sessions, and sends browser notifications when a timer ends. It's effective for coding, studying, writing, or any task requiring sustained concentration. Custom time settings let you tailor each session to your personal workflow and attention span.",
          useCases: [
            { icon: '💻', title: 'Coding & Development', desc: 'Break feature implementation, bug fixing, and code review into focused 25-minute Pomodoro sessions to maintain deep work and boost daily output.' },
            { icon: '📚', title: 'Study & Exam Preparation', desc: 'Alternate 25-min focus blocks with 5-min breaks to sustain concentration and prevent burnout during long study sessions or exam cramming.' },
            { icon: '✍️', title: 'Writing & Content Creation', desc: 'Maintain a steady creative flow for blog posts, reports, and video editing by working in timed sprints without the pressure of open-ended deadlines.' },
            { icon: '🎯', title: 'Remote Work Focus', desc: 'Overcome the distractions of working from home by structuring your entire workday into Pomodoro sessions, building measurable momentum and accountability.' },
          ],
          steps: [
            { step: 'Select a mode (Focus / Short Break / Long Break)', desc: 'Choose Focus (25 min), Short Break (5 min), or Long Break (15 min). Open Settings to customize each duration from 1 to 99 minutes.' },
            { step: 'Start the timer', desc: "Press 'Start' and dedicate yourself entirely to the task at hand. Avoid switching browser tabs or checking social media while the timer is running." },
            { step: 'Take your break on the alert', desc: 'A browser notification (if allowed) and an audio beep signal the end of each session. Step away from the screen, rest, then begin your next Pomodoro cycle.' },
            { step: 'Track sessions and set daily goals', desc: 'Each completed focus session adds a 🍅 to your session counter. Review your daily Pomodoro count to measure productivity and set realistic improvement goals.' },
          ],
          faqs: [
            { q: 'What do I do if I get interrupted mid-Pomodoro?', a: "The core rule is uninterrupted focus within each cycle. If an unavoidable interruption occurs, note the issue, stop the timer, and restart from the beginning. That Pomodoro is counted as void. To minimize interruptions, enable Do Not Disturb on your phone and mute non-urgent notifications." },
            { q: 'Can I customize the timer durations?', a: "Yes. Click the Settings button to freely adjust focus, short break, and long break durations. 25 minutes may feel unusual at first, but most users adapt within a week of consistent practice. Beginners can start with 15-minute sessions and gradually increase." },
            { q: "I'm not receiving browser notifications", a: "Click the lock icon in your browser's address bar, set Notifications to 'Allow', or click the 'Allow Notifications' button on the page. Note that iOS Safari does not support browser notifications — use the audio alert instead." },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        },
};
