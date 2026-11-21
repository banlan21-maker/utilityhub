// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '페르소나 카드란 무엇인가요?',
          description:
            '페르소나 카드는 매일 새로 조합된 캐릭터(직업·성격·특기)와 미션을 받아 10개의 상황 선택으로 점수를 겨루는 1인용 데일리 카드 게임입니다. 상식적으로 좋은 선택이 기본 점수가 되고, 내 캐릭터의 특성을 살린 선택에는 보너스가 붙기 때문에 같은 상황이라도 캐릭터에 따라 최선의 답이 달라집니다. 캐릭터는 한국 표준시(KST) 자정에 동시 갱신되며, 같은 날에는 모든 사용자가 같은 캐릭터·미션·선택지 순서를 받으므로 친구들과 점수를 비교하는 재미가 있습니다. 점수는 상황마다 판단 점수(최대 70점)에 캐릭터 보너스(성격 18 · 특기 10 · 직업 6, 비슷한 계열은 절반)를 더하고 캐릭터답지 않은 행동은 15점을 뺀 뒤, 그 상황의 최고 선택을 100점·최저 선택을 0점으로 환산합니다. 그래서 어떤 캐릭터를 받아도 만점 1000점이 가능하고, 평균적으로 10개 상황 중 2개쯤은 캐릭터를 읽어야 최선의 답을 찾을 수 있습니다.',
          useCases: [
            { icon: '🎲', title: '매일 새로운 캐릭터 조합', desc: '20×20×20 = 8,000가지 캐릭터 조합 중 매일 새 캐릭터를 받습니다. 직업+성격+특기의 화학반응을 즐겨보세요.' },
            { icon: '🎭', title: '롤플레이 의사결정 훈련', desc: '내 캐릭터답게 행동했을 때 보너스 점수가 붙는 구조로, 자연스러운 롤플레이 의사결정 감각을 키울 수 있습니다.' },
            { icon: '📊', title: '점수 + 평가 공유', desc: '결과 화면의 점수와 캐릭터 활용도를 휴대폰 공유 메뉴(카카오톡·문자 등)나 X·텔레그램, 링크 복사로 보내 친구들과 비교할 수 있습니다.' },
            { icon: '⏰', title: '하루 1번 플레이', desc: 'KST 자정 기준 매일 1회만 도전 가능. 다음 캐릭터까지 남은 시간이 카운트다운으로 표시되어 다시 방문하게 됩니다.' },
          ],
          steps: [
            { step: '오늘의 캐릭터 확인', desc: '직업·성격·특기 카드 3장이 순차적으로 공개됩니다. 어떤 미션이 주어졌는지 함께 확인하세요.' },
            { step: '미션 시작', desc: '"미션 시작" 버튼을 누르면 10개의 상황이 순서대로 등장합니다. 각 상황마다 4개의 선택지가 제시됩니다.' },
            { step: '캐릭터답게 선택', desc: '선택지 순서는 매일 섞여 나옵니다. 내 캐릭터의 성격·특기·직업에 맞는 선택에는 보너스가 붙고, 고른 직후 점수와 그 이유가 표시됩니다. 캐릭터답지 않은 선택은 감점되니 주의하세요.' },
            { step: '결과 공유', desc: '10번 선택 후 0~1000점의 최종 점수와 평가, 캐릭터 보너스를 얼마나 챙겼는지 보여 주는 캐릭터 활용도(%)가 표시됩니다. 공유 버튼으로 결과를 친구들과 비교해보세요.' },
          ],
          faqs: [
            { q: '점수는 어떻게 계산되나요?', a: '상황마다 선택지의 판단 점수(가장 합리적인 답 70점 ~ 가장 나쁜 답 40점)에 캐릭터 보너스를 더합니다. 보너스는 성격 18점, 특기 10점, 직업 6점이고, 태그가 정확히 맞으면 전부, 비슷한 계열이면 절반을 받습니다. 캐릭터답지 않은 행동은 15점이 깎입니다. 이렇게 나온 값을 그 상황에서 가장 좋은 선택 100점, 가장 나쁜 선택 0점으로 환산해 10개 상황을 더하므로 총점은 0~1000점입니다.' },
            { q: '왜 같은 날에는 같은 캐릭터·미션이 나오나요?', a: '한국 표준시(KST) 자정 기준으로 모든 사용자가 동일한 캐릭터·미션·선택지 순서를 공유합니다. 친구와 같은 조건에서 비교 플레이가 가능하며, 매일 자정에 새로 갱신됩니다.' },
            { q: '반대 성격이란 무엇인가요?', a: '예를 들어 "겁쟁이" 캐릭터인데 "용감하게 돌진" 같은 무모한 선택을 하면 캐릭터답지 않은 행동으로 간주되어 15점이 깎입니다. 감점은 대부분 성격에 걸려 있지만, "협상 특기인데 협상을 걷어찬다"처럼 특기·직업과 정반대인 선택에도 일부 적용됩니다.' },
            { q: '이 결과를 공식 평가로 사용해도 되나요?', a: '본 게임은 오락용 데일리 카드 게임으로, 어떠한 심리 검사·성격 진단도 아닙니다. 결과는 캐릭터 롤플레이의 재미를 위한 점수일 뿐 실제 의사결정 능력 평가와는 무관합니다.' },
          ],
        },
  en: {
          title: 'What is Persona Build?',
          description:
            "Persona Build is a daily solo card game where you receive a freshly mixed character (job + personality + skill) and a mission, then make 10 situational choices to maximize your score (0–1000). Sensible choices earn the base score and choices that play to your character's traits earn a bonus, so the best answer to the same situation changes with the character. Characters refresh at Korean midnight (KST), so the same day's character, mission and choice order are shared across all players for fair comparison. Each situation is scored as a judgment score (up to 70) plus a character bonus (personality 18, skill 10, job 6 — half for a related trait) minus 15 for acting out of character, then rescaled so the best choice is worth 100 and the worst 0. Any character can reach 1000, and on average about 2 of the 10 situations can only be solved by reading your character.",
          useCases: [
            { icon: '🎲', title: 'Fresh Combination Daily', desc: '8,000 possible character combos (20 jobs × 20 personalities × 20 skills). New character every day with surprising chemistry.' },
            { icon: '🎭', title: 'Roleplay Decision Practice', desc: 'Bonus points reward in-character choices — a natural way to sharpen role-based decision-making instincts.' },
            { icon: '📊', title: 'Score & Share', desc: 'Compare scores and character usage with friends through the share menu on your phone, X, Telegram, or a copied link.' },
            { icon: '⏰', title: 'One Play Per Day', desc: 'Locked to one play per day (KST). A countdown to the next character keeps you coming back.' },
          ],
          steps: [
            { step: 'See Today\'s Character', desc: 'Three cards (job, personality, skill) reveal in sequence. The mission card appears alongside.' },
            { step: 'Start Mission', desc: 'Tap Start to begin 10 situational prompts. Each shows 4 choices.' },
            { step: 'Choose in Character', desc: 'Choices are shuffled every day. Picks aligned with your personality, skill, and job earn bonuses, and the points and the reason appear right after each pick. Out-of-character choices cost points.' },
            { step: 'Share Result', desc: 'After 10 choices, see your 0–1000 score, a verdict, and your character usage (how much of the available character bonus you collected). Share with friends to compare.' },
          ],
          faqs: [
            { q: 'How is the score calculated?', a: 'Per situation: a judgment score (70 for the most sensible choice down to 40 for the worst) plus a character bonus — personality 18, skill 10, job 6, in full for an exact match and half for a related trait — minus 15 for an out-of-character action. The result is rescaled so the best choice in that situation is worth 100 and the worst 0, and the 10 situations add up to 0–1000.' },
            { q: 'Why is the daily card the same for everyone?', a: 'Characters and missions rotate on a KST midnight cycle. Everyone in the world shares the same daily setup, so you can compare scores fairly with friends, and your day rolls over at Korean midnight.' },
            { q: 'What is an "opposite personality"?', a: 'For example, a "Coward" character making a "charge in bravely" choice is acting out of character — that costs 15 points. Most penalties are tied to personality, but a few apply to skills and jobs too, such as a negotiator walking away from a negotiation.' },
            { q: 'Is this a personality test?', a: 'No. This is an entertainment-only daily card game. The score reflects roleplay alignment, not any psychological or decision-making assessment.' },
          ],
        },
};
