// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '나와 닮은 바다 생물 MBTI 테스트란?',
          description: '바다 생물 MBTI 테스트는 12가지 심리 분석 질문을 통해 여러분의 행동 양식과 에너지를 분석하고, 넓고 신비로운 바다 속에서 여러분과 가장 성격이 닮은 동물을 찾아드립니다. 16가지의 다양한 바다 생물 결과를 통해 나의 장점과 찰떡궁합인 친구를 함께 확인해보세요.',
          useCases: [
            { icon: '🏖️', title: '심심할 때 즐기는 힐링', desc: '바쁜 일상 속에서 바다의 여유를 느끼며 잠시 쉬어가는 힐링 심리 테스트로 활용하세요.' },
            { icon: '👥', title: '친구와의 소통 도구', desc: '테스트 결과를 SNS에 공유하여 서로 어떤 바다 생물인지 비교해보고 우정을 쌓으세요.' },
            { icon: '🔍', title: '자아 성찰의 시간', desc: '간단한 질문에 솔직하게 답하며 평소 내가 어떤 성향을 가지고 있는지 가볍게 돌아볼 수 있습니다.' },
            { icon: '🐬', title: '생물학적 재미 발견', desc: '동물의 실제 행동 특성과 MBTI 지표를 연결하여 평소 몰랐던 바다 동물의 특성을 이해하게 됩니다.' }
          ],
          steps: [
            { step: '테스트 시작', desc: '시작 버튼을 눌러 테스트에 진입하세요. 총 12개의 질문이 주어집니다.' },
            { step: '직관적인 답변 선택', desc: '깊게 고민하지 말고, 평소 자신의 모습에 더 가까운 선택지를 고르세요.' },
            { step: '분석 및 결과 확인', desc: '생물을 찾는 로딩 시간이 지나면 최종 결과와 함께 찰떡궁합 친구 정보를 확인합니다.' },
            { step: '공유하기', desc: '결과를 하단 공유 버튼을 통해 인스타그램이나 카톡으로 친구에게 보내보세요.' }
          ],
          faqs: [
            { q: 'MBTI 지표는 어떻게 활용되나요?', a: '에너지 방향(E/I), 탐색 방식(S/N), 교감 방식(T/F), 대응 방식(J/P)의 4가지 축을 동물의 실제 생태적 특징과 연결하여 분석합니다.' },
            { q: '결과는 몇 가지인가요?', a: '총 16가지의 서로 다른 MBTI 조합에 맞춰 16가지의 매력적인 바다 생물 결과가 준비되어 있습니다.' },
            { q: '과학적으로 정확한가요?', a: '이 테스트는 전문적인 심리 진단 도구보다는 재미와 공감을 목적으로 설계되었습니다. 가벼운 마음으로 즐겨주세요!' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' }
          ]
        },
  en: {
          title: 'What is the Sea Creature MBTI Test?',
          description: 'The Sea Creature MBTI Test analyzes your behavior and energy through 12 psychological questions to find the animal that most closely matches your personality in the mysterious deep sea. Discover your strengths and your perfect match among 16 different marine results.',
          useCases: [
            { icon: '🏖️', title: 'Quick Fun Break', desc: 'Take a brief, healing break during your busy day to feel the tranquility of the sea.' },
            { icon: '👥', title: 'Social Icebreaker', desc: 'Share your results on social media to compare creature types with friends and build connections.' },
            { icon: '🔍', title: 'Light Self-Reflection', desc: 'A quick way to look back at your natural tendencies by answering simple, intuitive questions.' },
            { icon: '🐬', title: 'Marine Life Fun', desc: 'Discover interesting biological traits of sea animals mapped to behavioral personality types.' }
          ],
          steps: [
            { step: 'Start Test', desc: 'Press start to begin. You will be asked a total of 12 questions.' },
            { step: 'Pick Your Best Match', desc: 'Don\'t overthink; simply choose the option that feels most like you.' },
            { step: 'View Analysis', desc: 'After a short loading period, your creature and personality report will appear.' },
            { step: 'Share Results', desc: 'Use the buttons at the bottom to send your results to friends via Instagram or KakaoTalk.' }
          ],
          faqs: [
            { q: 'How are the MBTI traits used?', a: 'We map Energy (E/I), Perception (S/N), Logic/Empathy (T/F), and Lifestyle (J/P) to the ecological behaviors of marine animals.' },
            { q: 'How many results are there?', a: 'There are 16 unique marine results corresponding to each of the 16 MBTI personality combinations.' },
            { q: 'Is it scientifically accurate?', a: 'This test is designed for fun and empathy rather than clinical diagnosis. Please enjoy it with a light heart!' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' }
          ]
        },
};
