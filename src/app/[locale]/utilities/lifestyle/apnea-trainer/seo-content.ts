// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const FAQ_KO = [
    { q: 'CO2 테이블과 O2 테이블의 차이는 무엇인가요?', a: 'CO2 테이블은 이산화탄소 상승으로 인한 호흡 충동에 적응하는 훈련입니다. 숨 참기 시간을 고정하고 휴식 시간을 줄여가며 CO₂ 내성을 높입니다. O2 테이블은 저산소 상태에서 신체가 효율적으로 작동하도록 적응시키는 훈련으로, 휴식 시간을 고정하고 숨 참기 시간을 점진적으로 늘려 실제 PB(개인 최고 기록)의 80~90%까지 도달합니다. 두 테이블 모두 물속이 아닌 드라이(육상) 환경에서 진행합니다.' },
    { q: '드라이 트레이닝은 얼마나 자주 해야 하나요?', a: '주 3~4회를 권장합니다. CO2 테이블과 O2 테이블을 교차하여 진행하면 적응 효과가 가장 좋습니다. 매일 훈련하면 오히려 과부하로 적응 효과가 줄어들 수 있습니다. 훈련 후에는 충분한 수분 보충과 휴식을 취하고, 이상 증상이 느껴지면 즉시 중단하고 전문가와 상담하세요.' },
    { q: '음성 가이드가 작동하지 않아요', a: 'Web Speech API는 브라우저의 자동 재생 정책에 따라 사용자가 처음 화면을 클릭(상호작용)한 후부터 정상 작동합니다. Safari 브라우저에서는 시스템 설정 > 손쉬운 사용 > 음성 항목도 확인해 보세요. 그래도 작동하지 않으면 Chrome 최신 버전 사용을 권장합니다. 비프음과 시각 플래시는 음성과 별개로 항상 작동합니다.' },
    { q: '이 앱의 결과를 공식 훈련 자료로 사용해도 되나요?', a: '본 앱의 훈련 테이블은 프리다이빙 커뮤니티에서 통용되는 일반적인 가이드라인을 기반으로 하며, 참고용으로만 제공됩니다. 개인의 건강 상태, 훈련 수준, 환경에 따라 조정이 필요할 수 있습니다. 프리다이빙 초보자는 반드시 공인 프리다이빙 강사의 지도하에 훈련을 시작하시기 바랍니다.' },
  ];

export const FAQ_EN = [
    { q: 'What is the difference between CO2 and O2 tables?', a: 'CO2 tables train your tolerance to the rising CO₂ urge-to-breathe by keeping hold time fixed and progressively reducing rest time. O2 tables adapt your body to hypoxia by keeping rest time fixed and gradually increasing hold time up to 80–90% of your PB. Both are done dry (on land), never in water alone.' },
    { q: 'How often should I do dry training?', a: 'Three to four sessions per week is recommended. Alternating CO2 and O2 table sessions produces the best adaptation. Daily training may cause overtraining and reduce adaptation gains. Stay well hydrated and rest adequately after each session. Stop immediately if you feel unusual symptoms.' },
    { q: 'The voice guide is not working', a: 'Web Speech API requires a user interaction (button click) before it can produce audio — this is a browser security policy. On Safari, also check System Preferences > Accessibility > Speech settings. If the issue persists, Chrome is recommended. The beep sounds and visual flash work independently and are always active.' },
    { q: 'Can I use this app as official training documentation?', a: 'The training tables are based on widely used community guidelines and are provided for reference only. Individual health, training level, and environment may require adjustments. Beginners should always train under the supervision of a certified freediving instructor before attempting breath-hold exercises.' },
  ];
