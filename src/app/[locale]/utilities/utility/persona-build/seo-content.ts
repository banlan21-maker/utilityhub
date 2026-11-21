// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '페르소나 카드란 무엇인가요?',
          description:
            '페르소나 카드는 매일 새로 조합된 캐릭터(직업·성격·특기)와 미션을 받아 10개의 상황 선택으로 점수를 겨루는 1인용 데일리 카드 게임입니다. 정해진 정답은 없지만, 내 캐릭터의 특성을 잘 활용하는 선택을 골라야 높은 점수를 받을 수 있습니다. 캐릭터는 한국 표준시(KST) 자정에 동시 갱신되며, 같은 날에는 모든 사용자가 같은 미션과 동일한 점수 변동 시드를 공유하여 친구들과 점수를 비교하는 재미가 있습니다. 점수 계산은 baseScore(논리적 최선 = 100점) + 캐릭터 매칭 보너스(+5/+3/+2) - 반대 성격 감점(-10)으로 산정되어, 캐릭터 운이 나빠도 최선의 선택만 고르면 만점을 노릴 수 있습니다.',
          useCases: [
            { icon: '🎲', title: '매일 새로운 캐릭터 조합', desc: '20×20×20 = 8,000가지 캐릭터 조합 중 매일 새 캐릭터를 받습니다. 직업+성격+특기의 화학반응을 즐겨보세요.' },
            { icon: '🎭', title: '롤플레이 의사결정 훈련', desc: '내 캐릭터답게 행동했을 때 보너스 점수가 붙는 구조로, 자연스러운 롤플레이 의사결정 감각을 키울 수 있습니다.' },
            { icon: '📊', title: '점수 + 평가 공유', desc: '결과 화면의 점수와 캐릭터 활용도를 카카오톡·X·텔레그램으로 즉시 공유하여 친구들과 비교할 수 있습니다.' },
            { icon: '⏰', title: '하루 1번 플레이', desc: 'KST 자정 기준 매일 1회만 도전 가능. 다음 캐릭터까지 남은 시간이 카운트다운으로 표시되어 다시 방문하게 됩니다.' },
          ],
          steps: [
            { step: '오늘의 캐릭터 확인', desc: '직업·성격·특기 카드 3장이 순차적으로 공개됩니다. 어떤 미션이 주어졌는지 함께 확인하세요.' },
            { step: '미션 시작', desc: '"미션 시작" 버튼을 누르면 10개의 상황이 순서대로 등장합니다. 각 상황마다 4개의 선택지가 제시됩니다.' },
            { step: '캐릭터답게 선택', desc: '내 캐릭터의 성격·특기·직업에 맞는 선택을 고르면 보너스 점수가 붙습니다. 반대 성격의 선택은 감점되니 주의하세요.' },
            { step: '결과 공유', desc: '10번 선택 후 0~1000점의 최종 점수와 등급 평가가 표시됩니다. 공유 버튼으로 결과를 친구들과 비교해보세요.' },
          ],
          faqs: [
            { q: '점수는 어떻게 계산되나요?', a: '문항당 baseScore(논리적 최선 = 100점) + 캐릭터 매칭 보너스(성격 +5, 특기 +3, 직업 +2) - 반대 성격 감점(-10)으로 계산됩니다. 10문항 합산하여 0~1000점 범위입니다. 매일 약간의 양수 variation(0~10)이 추가되지만 만점은 보호됩니다.' },
            { q: '왜 같은 날에는 같은 캐릭터·미션이 나오나요?', a: '한국 표준시(KST) 자정 기준으로 모든 사용자가 동일한 캐릭터·미션·점수 시드를 공유합니다. 친구와 같은 조건에서 비교 플레이가 가능하며, 매일 자정에 새로 갱신됩니다.' },
            { q: '반대 성격이란 무엇인가요?', a: '예를 들어 "겁쟁이" 캐릭터인데 "용감하게 돌진" 같은 무모한 선택을 하면 캐릭터답지 않은 행동으로 간주되어 10점 감점됩니다. 본 게임은 성격 측면에서만 반대 태그를 적용하며, 직업·특기에는 반대 태그가 없습니다.' },
            { q: '이 결과를 공식 평가로 사용해도 되나요?', a: '본 게임은 오락용 데일리 카드 게임으로, 어떠한 심리 검사·성격 진단도 아닙니다. 결과는 캐릭터 롤플레이의 재미를 위한 점수일 뿐 실제 의사결정 능력 평가와는 무관합니다.' },
          ],
        },
  en: {
          title: 'What is Persona Build?',
          description:
            "Persona Build is a daily solo card game where you receive a freshly mixed character (job + personality + skill) and a mission, then make 10 situational choices to maximize your score (0–1000). There are no fixed correct answers — high scores come from making choices that play to your character's traits. Characters refresh at Korean midnight (KST), so the same day's setup is shared across all players for fair comparison. Score formula: baseScore (logical best = 100) + character match bonus (+5/+3/+2) − opposite personality penalty (−10). A character with bad odds can still hit 1000 with optimal choices.",
          useCases: [
            { icon: '🎲', title: 'Fresh Combination Daily', desc: '8,000 possible character combos (20 jobs × 20 personalities × 20 skills). New character every day with surprising chemistry.' },
            { icon: '🎭', title: 'Roleplay Decision Practice', desc: 'Bonus points reward in-character choices — a natural way to sharpen role-based decision-making instincts.' },
            { icon: '📊', title: 'Score & Share', desc: 'Compare scores with friends by sharing the result card to KakaoTalk, Twitter, or Telegram instantly.' },
            { icon: '⏰', title: 'One Play Per Day', desc: 'Locked to one play per day (KST). A countdown to the next character keeps you coming back.' },
          ],
          steps: [
            { step: 'See Today\'s Character', desc: 'Three cards (job, personality, skill) reveal in sequence. The mission card appears alongside.' },
            { step: 'Start Mission', desc: 'Tap Start to begin 10 situational prompts. Each shows 4 choices.' },
            { step: 'Choose in Character', desc: 'Pick choices aligned with your personality, skill, and job — they earn bonuses. Choices against your personality (opposite tag) cost points.' },
            { step: 'Share Result', desc: 'After 10 choices, see your 0–1000 score and grade. Share with friends to compare.' },
          ],
          faqs: [
            { q: 'How is the score calculated?', a: 'Per situation: baseScore (logical best = 100) + character bonus (personality +5, skill +3, job +2) − opposite personality penalty (−10). Daily variation of 0–10 is added but never overrides a perfect-choice 100. Sum of 10 = 0–1000 total.' },
            { q: 'Why is the daily card the same for everyone?', a: 'Characters and missions rotate on a KST midnight cycle. Everyone in the world shares the same daily setup, so you can compare scores fairly with friends, and your day rolls over at Korean midnight.' },
            { q: 'What is an "opposite personality"?', a: 'For example, a "Coward" character making a "charge in bravely" choice is acting out of character — that earns a −10 penalty. Only personality has opposite tags; jobs and skills do not.' },
            { q: 'Is this a personality test?', a: 'No. This is an entertainment-only daily card game. The score reflects roleplay alignment, not any psychological or decision-making assessment.' },
          ],
        },
};
