// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '사주 궁합 테스트란 무엇인가요?',
          description: '사주 궁합 테스트는 동양 역학의 핵심 원리인 사주팔자(四柱八字)를 기반으로 두 사람의 천생연분 점수를 계산하는 무료 온라인 도구입니다. 생년월일을 입력하면 각 사람의 일간(日干, 천간)과 일지(日支, 지지)를 자동으로 추출하고, 오행(五行: 목·화·토·금·수)의 상생(相生)과 상극(相剋) 관계를 분석하여 궁합 점수를 산출합니다. 또한 지지의 육합(六合), 삼합(三合), 충(沖) 관계를 종합적으로 반영하여 더욱 정교한 결과를 제공합니다. 바이럴 링크 기능을 통해 상대방에게 링크를 보내면 상대방이 자기 정보를 입력하는 것만으로 두 사람의 궁합 결과를 함께 확인할 수 있습니다. 모든 계산은 브라우저 내부에서만 처리되어 개인정보가 외부로 전송되지 않으며, 결과를 이미지로 저장하거나 SNS로 공유하는 기능도 지원합니다. 연인, 친구, 가족 간의 궁합을 재미있게 확인하고 대화의 소재로 활용해보세요.',
          useCases: [
            { icon: '💑', title: '연인 궁합 확인', desc: '연인과의 사주 궁합 점수를 확인하고, 두 사람의 오행 조합이 어떤 관계 패턴을 만드는지 재미있게 알아볼 수 있습니다. 바이럴 링크로 상대방과 함께 결과를 확인하세요.' },
            { icon: '👫', title: '친구와 우정 테스트', desc: '친구에게 링크를 보내 우정 궁합을 테스트해보세요. SNS에서 결과를 공유하며 대화의 소재로 활용하기 딱 좋은 바이럴 콘텐츠입니다.' },
            { icon: '🎉', title: '모임·파티 아이스브레이커', desc: '소개팅, 미팅, 회사 워크숍 등에서 참석자들끼리 궁합을 확인하며 분위기를 띄울 수 있는 재미있는 아이스브레이커 도구로 활용하세요.' },
            { icon: '📱', title: '이미지 저장 & SNS 공유', desc: '궁합 결과를 인스타그램 스토리 비율의 이미지로 저장하거나, 카카오톡·WhatsApp·텔레그램 등으로 바로 공유할 수 있어 바이럴 확산에 최적화되어 있습니다.' },
          ],
          steps: [
            { step: '내 정보 입력', desc: '별명(또는 이니셜), 성별, 생년월일(양력), 태어난 시간을 입력합니다. 태어난 시간을 모르면 "시간 모름" 체크박스를 선택하면 일간·일지만으로 계산됩니다.' },
            { step: '링크 생성 & 공유', desc: '정보 입력 후 "링크 생성하기" 버튼을 누르면 나만의 초대 링크가 만들어집니다. 카카오톡, WhatsApp, 텔레그램, X 등으로 상대방에게 링크를 보내세요.' },
            { step: '상대방 정보 입력', desc: '링크를 받은 상대방이 자기 정보를 입력하면 즉시 두 사람의 사주 궁합이 계산됩니다. 서버 통신 없이 브라우저에서 바로 결과가 나타납니다.' },
            { step: '결과 확인 & 저장', desc: '궁합 점수, 유형(소울메이트~노력하는 커플), 오행 분석 결과를 확인하세요. 이미지 저장 버튼으로 결과를 캡처하거나 링크를 복사해 공유할 수 있습니다.' },
          ],
          faqs: [
            { q: '입력한 이름과 생일이 서버에 저장되나요?', a: '전혀 저장되지 않습니다. 모든 계산은 브라우저 내부에서만 처리되며, 서버에 어떤 데이터도 전송하지 않습니다. URL에 포함되는 정보도 이니셜만 사용하며 lz-string으로 압축하여 개인정보를 최소화합니다. 페이지를 닫으면 모든 데이터가 사라집니다.' },
            { q: '태어난 시간을 모르면 결과가 부정확한가요?', a: '"시간 모름"을 선택하면 일간(천간)과 일지(지지)만으로 궁합을 계산합니다. 시간 정보가 없으면 시주(時柱) 분석은 생략되지만, 일주(日柱) 기반 분석만으로도 충분히 의미 있는 궁합 결과를 제공합니다. 정확도를 높이고 싶다면 출생 시간을 함께 입력해주세요.' },
            { q: '궁합 점수가 낮게 나왔어요. 어떻게 해석하면 좋을까요?', a: '사주 궁합은 두 사람의 오행 에너지 조합을 분석한 참고 자료일 뿐, 관계의 성공 여부를 결정짓지 않습니다. 역학에서도 "서로 다른 기운의 조합이 오히려 더 큰 시너지를 낸다"고 보는 시각이 있습니다. 실제 관계는 서로의 이해와 노력이 가장 중요하니, 재미로 즐겨주세요!' },
            { q: '이 결과를 공식 자료로 사용해도 되나요?', a: '본 결과는 재미를 위한 참고용이며, 실제 결혼이나 중요한 결정에는 전문 역학 상담을 받으시기 바랍니다. 이 도구는 전통 사주 이론의 일부 원리를 간소화하여 적용한 것이며, 전문 역학사의 종합 분석과는 차이가 있을 수 있습니다.' },
          ],
        },
  en: {
          title: 'What is the Saju Compatibility Test?',
          description: 'The Saju Compatibility Test is a free online tool based on the principles of Saju (Four Pillars of Destiny), a traditional East Asian astrology system that analyzes personality and relationships using birth date and time. By entering your date of birth, the tool automatically extracts your Day Stem (天干, Heavenly Stem) and Day Branch (地支, Earthly Branch), then analyzes the Five Elements (木 Wood, 火 Fire, 土 Earth, 金 Metal, 水 Water) relationships between two people. It calculates compatibility scores based on harmonious (相生) and conflicting (相剋) elemental interactions, plus Branch combinations like Six Harmonies (六合), Three Harmonies (三合), and Clashes (沖). The viral link feature lets you send a unique URL to someone — they simply enter their info and both see the result instantly. All calculations run entirely in your browser with zero server communication, keeping your personal data completely private. Save results as images or share via WhatsApp, Telegram, X, and more.',
          useCases: [
            { icon: '💑', title: 'Couple Compatibility', desc: 'Check your Saju compatibility score with your partner and discover what elemental patterns shape your relationship. Use the viral link to reveal the result together in real-time.' },
            { icon: '👫', title: 'Friendship Test', desc: 'Send the link to friends and test your friendship compatibility. Share results on social media for fun conversations and viral engagement with your circle.' },
            { icon: '🎉', title: 'Party Icebreaker', desc: 'Use this tool at meetups, blind dates, workshops, or parties as a fun icebreaker. Check compatibility with everyone and spark conversations instantly.' },
            { icon: '📱', title: 'Save & Share Results', desc: 'Download your compatibility result as an image optimized for Instagram Stories, or share directly via KakaoTalk, WhatsApp, Telegram, and X for maximum viral reach.' },
          ],
          steps: [
            { step: 'Enter Your Info', desc: 'Enter your nickname or initial, gender, date of birth (solar calendar), and birth time. If you don\'t know your birth time, check the "I don\'t know" box to calculate using Day Stem and Branch only.' },
            { step: 'Generate & Share Link', desc: 'After entering your info, press "Generate Link" to create your unique invitation URL. Share it via KakaoTalk, WhatsApp, Telegram, X, or simply copy the link.' },
            { step: 'Partner Enters Info', desc: 'When your partner opens the link and enters their information, the compatibility result is calculated instantly in the browser — no server communication needed.' },
            { step: 'View & Save Results', desc: 'See your compatibility score, relationship type (from Soulmate to Effort Couple), and Five Elements analysis. Save the result as an image or copy the link to share it further.' },
          ],
          faqs: [
            { q: 'Is my name and birthday stored on any server?', a: 'Absolutely not. All calculations are processed entirely within your browser, and no data is ever sent to any server. The URL only contains compressed initials using lz-string encoding to minimize personal information exposure. Once you close the page, all data is gone.' },
            { q: 'What happens if I don\'t know my birth time?', a: 'If you select "I don\'t know my birth time," the calculation uses only your Day Stem (天干) and Day Branch (地支), skipping the Hour Pillar analysis. While this slightly reduces precision, the Day Pillar alone provides meaningful and reliable compatibility results in traditional Saju analysis.' },
            { q: 'My score is low. Should I be worried about my relationship?', a: 'Saju compatibility is a fun reference based on elemental energy analysis — it does not determine relationship success. Many Saju scholars note that contrasting energies can create even greater synergy. Real relationships are built on mutual understanding and effort, so enjoy this as entertainment!' },
            { q: 'Can I use this result as official data?', a: 'Results are for entertainment and reference only. For important decisions like marriage, please consult a professional Saju practitioner. This tool applies simplified principles of traditional Saju theory and may differ from a comprehensive professional analysis.' },
          ],
        },
};
