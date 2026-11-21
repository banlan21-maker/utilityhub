// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '브레인 부스트 N-Back이란 무엇인가요?',
          description:
            '브레인 부스트 N-Back은 듀얼 N-Back(Dual N-Back) 인지 훈련 기법을 기반으로 한 무료 작업 기억력 훈련 게임입니다. 1990년대 후반 인지심리학자 Susanne Jaeggi의 연구 이후, N-Back 훈련은 작업 기억(working memory)과 유동적 지능(fluid intelligence) 향상에 효과가 있다고 보고된 대표적인 신경 가소성 기반 훈련입니다. 3×3 격자에서 시각 자극(위치)과 청각 자극(알파벳 음)이 동시에 제시되면, 사용자는 N번 전의 자극과 위치/소리가 일치하는지를 빠르게 판단해야 합니다. 어댑티브 난이도 시스템이 80% 이상 정확도면 N을 한 단계 올리고, 50% 미만이면 한 단계 낮춰 항상 도전 한계에 머물도록 합니다. 모든 점수와 이력은 브라우저 LocalStorage에 저장되어 서버 전송 없이 안전하게 관리됩니다.',
          useCases: [
            { icon: '🧠', title: '작업 기억력 강화', desc: '단기간 정보를 머릿속에 유지하면서 다른 작업을 동시에 수행하는 능력을 향상시켜 학습·업무 효율을 높입니다.' },
            { icon: '🎯', title: '집중력 훈련', desc: '시각과 청각을 동시에 추적하는 듀얼 태스킹이 전두엽을 자극해 장시간 집중 유지력을 키웁니다.' },
            { icon: '👴', title: '디지털 치매 예방', desc: '나이가 들수록 감소하는 작업 기억력을 매일 5~15분 훈련으로 유지·강화해 노화에 따른 인지 저하를 늦춥니다.' },
            { icon: '📈', title: '학습 능력 향상', desc: '수험생, 직장인, 시니어 모두에게 권장되는 신경 가소성 훈련 — 꾸준한 N-Back 훈련은 IQ 테스트의 일부 측정값 상승과 연관성이 있다는 연구 결과가 있습니다.' },
          ],
          steps: [
            { step: '튜토리얼 확인', desc: '첫 방문 시 N=1 시범 튜토리얼이 자동으로 표시됩니다. 자극 인식 → 응답 방식 → 단축키를 익힌 뒤 본 세션으로 진입하세요.' },
            { step: '세션 설정', desc: 'N 레벨(1~9), 세션 길이(짧음/표준/긴), 자극 간격(2~3초), 사운드 ON/OFF, 어댑티브 모드를 설정합니다. 초보자는 N=2, 표준 길이, 보통 속도 권장.' },
            { step: '훈련 시작', desc: '격자 한 칸에 점이 표시되고 동시에 소리가 재생됩니다. N번 전과 위치가 같으면 [위치 일치] (단축키 A), 소리가 같으면 [소리 일치] (단축키 L) 버튼을 누르세요. 둘 다 같으면 두 버튼 모두, 다르면 아무것도 누르지 않습니다.' },
            { step: '결과 확인 및 반복', desc: '세션 종료 후 위치/소리 정확도와 코그니티브 스코어가 표시됩니다. 어댑티브 모드면 다음 세션의 N이 자동 조정됩니다. 매일 1~2회, 최소 2주 꾸준히 훈련해야 효과가 나타납니다.' },
          ],
          faqs: [
            { q: 'N-Back 훈련이 정말 머리가 좋아지나요?', a: 'Jaeggi 등의 2008년 PNAS 연구는 듀얼 N-Back 훈련이 유동적 지능 측정값을 향상시킨다고 보고했으며, 이후 복제 연구에서는 효과가 작업 기억 자체에 더 국한된다는 비판도 있습니다. 다만 작업 기억력 자체의 향상은 비교적 일관되게 보고되어, 학습·집중 분야에서는 도움이 됩니다.' },
            { q: '하루 얼마나 훈련해야 효과가 있나요?', a: '연구에서는 하루 20분, 주 5일, 최소 2~4주 훈련을 권장합니다. 본 도구에서는 매일 1~3 세션(약 5~15분)을 꾸준히 실행하는 것이 좋습니다. 휴식 없는 과도한 훈련은 오히려 정확도를 떨어뜨립니다.' },
            { q: '어댑티브 난이도는 어떻게 동작하나요?', a: '평균 정확도(위치+소리)/2가 80% 이상이면 다음 세션에서 N을 +1, 50% 미만이면 -1로 자동 조정합니다. 항상 자신의 한계 근처에서 훈련하도록 도와 효과를 극대화합니다. 수동 조절을 원하면 어댑티브를 OFF로 설정하세요.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '본 결과는 본인 훈련 추적 참고용입니다. 의학적 진단·치료에 사용할 수 없으며, 인지 저하·기억력 문제가 의심되면 반드시 전문의와 상담하세요.' },
          ],
        },
  en: {
          title: 'What is Brain Boost N-Back?',
          description:
            'Brain Boost N-Back is a free working memory training game based on the Dual N-Back cognitive training paradigm. Following the late-1990s research of cognitive psychologist Susanne Jaeggi, N-Back has been reported to improve working memory and fluid intelligence — making it one of the most well-known neuroplasticity-based exercises. In a 3×3 grid, a visual stimulus (position) and an auditory stimulus (letter tone) are presented simultaneously every few seconds, and you must quickly decide whether each matches the stimulus from N trials ago. An adaptive difficulty system raises N by one when your accuracy hits 80%+ and drops it by one when accuracy falls below 50%, keeping you near your cognitive limit. All scores and history are stored locally in your browser via LocalStorage — no server transfer.',
          useCases: [
            { icon: '🧠', title: 'Working Memory Boost', desc: 'Improve your ability to hold information in mind while juggling other tasks — directly impacting learning and work efficiency.' },
            { icon: '🎯', title: 'Focus Training', desc: 'Dual-tracking visual and audio stimuli activates the prefrontal cortex and builds long-duration concentration stamina.' },
            { icon: '👴', title: 'Cognitive Aging Defense', desc: 'Daily 5–15 minute sessions help maintain working memory that naturally declines with age — slowing cognitive decline.' },
            { icon: '📈', title: 'Learning Performance', desc: 'Recommended for students, knowledge workers, and seniors — sustained N-Back training has been linked to gains in some IQ subtests.' },
          ],
          steps: [
            { step: 'Watch the Tutorial', desc: 'On first visit, an N=1 tutorial appears automatically. Learn how stimuli are presented, how to respond, and the keyboard shortcuts before starting a real session.' },
            { step: 'Configure the Session', desc: 'Choose N (1–9), session length (short/standard/long), stimulus interval (2–3s), sound on/off, and adaptive mode. Beginners: start with N=2, standard length, normal speed.' },
            { step: 'Start Training', desc: 'A cell lights up while a letter tone plays. If the position matches the stimulus from N trials ago, press [Position Match] (key A). If the sound matches, press [Sound Match] (key L). Press both if both match, none if neither.' },
            { step: 'Review & Repeat', desc: 'After each session, your position/sound accuracy and cognitive score are displayed. With adaptive mode on, N auto-adjusts for the next session. Train daily for at least 2 weeks to see meaningful gains.' },
          ],
          faqs: [
            { q: 'Does N-Back training really make you smarter?', a: 'Jaeggi et al. (2008, PNAS) reported that Dual N-Back training improves fluid intelligence; later replication studies have been more cautious, suggesting effects may be more limited to working memory itself. The working memory benefit is fairly consistent across studies and is useful for learning and focus.' },
            { q: 'How much should I train per day?', a: 'Research suggests 20 minutes/day, 5 days/week, for at least 2–4 weeks. Here, doing 1–3 sessions daily (about 5–15 minutes) is ideal. Excessive sessions without rest actually hurt accuracy.' },
            { q: 'How does adaptive difficulty work?', a: 'When your average accuracy (position + sound) / 2 hits 80% or more, the next session jumps to N+1. Below 50%, it drops to N-1. This keeps you training near your cognitive limit, where neuroplastic gains are strongest. Turn adaptive off if you prefer manual control.' },
            { q: 'Can I use this result as official data?', a: 'These results are for personal training tracking. They are not a clinical assessment. If you suspect cognitive decline or memory issues, please consult a medical professional.' },
          ],
        },
};
