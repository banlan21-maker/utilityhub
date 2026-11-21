// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
              title: "심리테스트 빌더란?",
              description: "심리테스트 빌더는 코딩 지식 없이 누구나 MBTI 스타일의 퀴즈·심리테스트를 직접 만들고 링크로 즉시 공유할 수 있는 무료 노코드 도구입니다. 결과 유형(최대 4개)과 질문(최대 10개)을 설정하면 각 선택지에 유형을 연결하는 방식으로 동작하며, 링크 생성 버튼을 누르면 퀴즈 전체 데이터가 URL에 인코딩된 공유 링크가 만들어집니다. 서버나 데이터베이스를 사용하지 않아 회원가입·로그인이 전혀 필요 없고, 생성된 링크는 영구적으로 유효합니다. 브랜드 마케팅용 바이럴 퀴즈, 팀 내 아이스브레이킹 테스트, 교육용 OX 퀴즈, 연애 유형 테스트 등 다양한 용도로 활용할 수 있습니다.",
              useCases: [
                { icon: '📣', title: '브랜드 마케팅 퀴즈', desc: '당신의 브랜드에 어울리는 제품 유형은? 같은 퀴즈를 만들어 SNS에 공유하면 브랜드 인지도를 높이고 자연스러운 바이럴 마케팅 효과를 얻을 수 있습니다.' },
                { icon: '🎓', title: '교육·연수 활용', desc: '강의 후 학습 내용을 확인하는 유형별 퀴즈를 만들거나, 팀 연수 시 참가자의 업무 스타일 유형을 파악하는 아이스브레이킹 도구로 활용할 수 있습니다.' },
                { icon: '💬', title: '커뮤니티 콘텐츠', desc: '인터넷 커뮤니티나 카카오톡 단톡방에서 유행하는 MBTI 스타일 테스트를 직접 만들어 배포하면 높은 참여율과 공유 확산 효과를 기대할 수 있습니다.' },
                { icon: '🎮', title: '게임·이벤트 기획', desc: '오프라인 행사나 온라인 이벤트에서 참가자 유형 분류, 팀 배정, 경품 추첨 등에 활용할 수 있는 맞춤 퀴즈를 코딩 없이 5분 만에 제작할 수 있습니다.' },
              ],
              steps: [
                { step: '기본 설정 입력', desc: '커버 이모지, 테스트 제목, 소개 문구를 입력합니다. 제목은 참여자가 테스트를 시작하기 전 첫인상이 되므로 흥미를 유발하는 질문형 문구를 사용하면 클릭률이 높아집니다.' },
                { step: '결과 유형 설정', desc: '결과 유형을 2~4개 추가하고 각 유형의 이모지, 이름, 상세 설명을 입력합니다. 유형 설명은 참여자가 결과를 받았을 때 공감하고 공유하고 싶어지도록 구체적으로 작성하는 것이 중요합니다.' },
                { step: '질문과 선택지 작성', desc: '질문을 최대 10개까지 추가하고, 각 선택지에 연결될 결과 유형을 드롭다운에서 지정합니다. 선택지마다 어떤 유형으로 점수가 쌓이는지 설계하면 더 정교한 결과 분류가 가능합니다.' },
                { step: '링크 생성 및 공유', desc: '링크 생성하기 버튼을 클릭하면 퀴즈 전체 데이터가 인코딩된 공유 URL이 생성됩니다. 복사 버튼으로 링크를 복사한 뒤 SNS, 카카오톡, 이메일 등 원하는 채널에 바로 공유하세요.' },
              ],
              faqs: [
                { q: '만든 퀴즈는 어디에 저장되나요?', a: '퀴즈 데이터는 별도 서버나 데이터베이스에 저장되지 않습니다. 생성된 공유 링크의 URL 파라미터 안에 퀴즈 전체 내용이 Base64로 인코딩되어 담겨 있어, 링크만 보관하면 언제든 퀴즈를 재현하고 공유할 수 있습니다. 링크를 잃어버리면 복구가 불가능하므로 반드시 복사하여 보관하시기 바랍니다.' },
                { q: '결과 유형과 질문은 최대 몇 개까지 만들 수 있나요?', a: '결과 유형은 최소 2개에서 최대 4개(A, B, C, D)까지 설정할 수 있으며, 질문은 최대 10개까지 추가 가능합니다. 각 질문의 선택지 수는 설정한 결과 유형 수와 동일하게 자동 생성되어, 선택지마다 특정 유형에 점수를 부여하는 방식으로 결과가 산출됩니다.' },
                { q: '생성한 퀴즈를 나중에 수정할 수 있나요?', a: '현재 버전에서는 이미 생성된 공유 링크를 직접 수정하는 기능을 제공하지 않습니다. 수정이 필요한 경우 빌더 페이지에서 내용을 다시 입력하고 새 링크를 생성하시면 됩니다. 이전 링크를 공유했다면 새 링크로 교체하여 재공유하시기 바랍니다.' },
                { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
              ],
            },
  en: {
              title: "What is Quiz & Personality Test Builder?",
              description: "The Quiz Builder is a free no-code tool that lets anyone create MBTI-style personality quizzes and share them instantly via a link — no coding, no sign-up, and no server required. You define up to four result types and up to ten questions, then connect each answer option to a result type. When you click Generate, the entire quiz is encoded directly into the share URL using Base64, so the link itself contains all quiz data permanently without any database. Use it to create viral brand quizzes for marketing campaigns, icebreaker tests for team workshops, educational assessments for online courses, or fun personality tests to share in social media communities. The generated link works on any device and opens a clean, mobile-friendly quiz experience that participants can complete and share their results from.",
              useCases: [
                { icon: '📣', title: 'Brand Marketing Quizzes', desc: 'Create a "Which product type suits you?" or "What kind of traveler are you?" quiz that subtly promotes your brand, then share it on social media to drive organic engagement and viral reach without paid advertising.' },
                { icon: '🎓', title: 'Education & Training', desc: 'Build post-lesson knowledge checks or team-building personality assessments for workshops and corporate training sessions, helping facilitators quickly categorize participants by learning style or work preference.' },
                { icon: '💬', title: 'Community & Social Content', desc: 'Publish MBTI-style personality tests in online communities, group chats, or social media to spark conversations, boost engagement metrics, and keep your audience returning for new quiz content regularly.' },
                { icon: '🎮', title: 'Events & Campaigns', desc: 'Design custom quizzes for offline events, online contests, or promotional campaigns to categorize participants, assign teams, or determine prize eligibility — all without writing a single line of code.' },
              ],
              steps: [
                { step: 'Set Up Basics', desc: 'Enter a cover emoji, quiz title, and short introduction text. A compelling, question-format title (e.g., "What kind of developer are you?") significantly increases the click-through rate when the link is shared on social media.' },
                { step: 'Define Result Types', desc: 'Add two to four result types and fill in each type\'s emoji, name, and description. Write vivid, relatable descriptions that participants will want to screenshot and share with friends after seeing their result.' },
                { step: 'Write Questions and Options', desc: 'Add up to ten questions, each with one answer option per result type. Assign which result type each option points to using the dropdown selector, allowing nuanced scoring where different answer combinations lead to different results.' },
                { step: 'Generate Link and Share', desc: 'Click Generate Quiz Link to create a shareable URL that encodes the full quiz. Copy the link and share it on Instagram, KakaoTalk, email, or any platform — recipients can take the quiz immediately with no login required.' },
              ],
              faqs: [
                { q: 'Where is my quiz data stored?', a: 'Quiz data is not stored on any server or database. The entire quiz content is Base64-encoded directly into the generated share URL. As long as you keep the link, the quiz is permanently accessible. If the link is lost, the quiz cannot be recovered, so always save a copy of the generated URL somewhere safe.' },
                { q: 'How many result types and questions can I create?', a: 'You can define between 2 and 4 result types (labeled A through D) and add up to 10 questions. Each question automatically generates one answer option per result type, and you assign which type each option points to, allowing flexible scoring logic to produce distinct and meaningful results.' },
                { q: 'Can I edit a quiz after generating the link?', a: 'The current version does not support editing an already-generated link directly. To update your quiz, return to the builder, re-enter the updated content, and generate a new link. If you previously shared the old link, replace it with the new one in all locations where it was distributed.' },
                { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
              ],
            },
};
