// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const seoKo: SeoContent = {
    title: '데일리 그리드 포커란 무엇인가요?',
    description: '데일리 그리드 포커는 매일 UTC 기준 날짜로 생성된 동일한 25장의 카드를 5x5 그리드에 전략적으로 배치해 포커 족보 점수를 최대화하는 1인용 퍼즐 게임입니다. 가로 5줄과 세로 5줄, 총 10개의 포커 핸드가 판정되며 최대 1,000점을 획득할 수 있습니다. 로얄 스트레이트 플러시(100점)부터 탑카드(0점)까지 9가지 족보가 적용되고, 매일 플레이하면 연속 플레이(Streak) 기록이 쌓여 두뇌 트레이닝 습관을 형성할 수 있습니다. 로그인 없이 브라우저에서 바로 무료로 즐길 수 있으며, 전 세계 사용자가 같은 카드로 오늘의 점수를 비교할 수 있는 소셜 공유 기능도 제공됩니다.',
    useCases: [
      { icon: '🌅', title: '아침 두뇌 워밍업', desc: '출근 전 5분, 매일 동일한 카드로 전략적 사고를 깨우는 두뇌 워밍업 루틴으로 활용하면 하루를 더 명석하게 시작할 수 있습니다.' },
      { icon: '🃏', title: '포커 전략 감각 훈련', desc: '5x5 그리드에서 가로/세로 모두 최적의 족보를 구성하려면 카드 배치 전략이 필요합니다. 실제 포커보다 빠르게 패 구성 감각을 키울 수 있습니다.' },
      { icon: '⏱️', title: '점심시간 집중력 게임', desc: '25장 배치만 완료하면 게임이 끝나는 구조라 부담 없이 짧게 즐길 수 있습니다. 하루 한 번이라는 제한이 오히려 집중도를 높여줍니다.' },
      { icon: '📊', title: '친구와 점수 비교', desc: '전 세계 모든 사용자가 같은 25장으로 오늘 게임을 플레이합니다. 결과를 SNS에 공유하고 연속 플레이 기록과 점수를 비교하는 소셜 경험을 즐기세요.' },
    ],
    steps: [
      { step: '1. 오늘의 카드 확인', desc: '페이지 상단에 오늘의 첫 번째 카드가 표시됩니다. UTC 기준 날짜 시드로 생성된 25장이 순서대로 제공됩니다.' },
      { step: '2. 그리드 배치 전략 수립', desc: '현재 카드를 어느 셀에 배치할지 결정합니다. 가로줄과 세로줄 모두에서 좋은 족보가 나올 수 있도록 전략적으로 위치를 선택하세요.' },
      { step: '3. 족보 완성 및 점수 확인', desc: '25장을 모두 배치하면 가로 5줄, 세로 5줄 총 10개의 포커 핸드가 자동으로 판정됩니다. 각 줄의 족보와 점수가 표시됩니다.' },
      { step: '4. 스트릭 기록 및 결과 공유', desc: '결과 화면에서 연속 플레이 기록(Streak)을 확인하고 공유 버튼으로 오늘의 족보 이모지와 점수를 SNS에 공유하세요.' },
    ],
    faqs: [
      { q: '매일 카드 배열이 바뀌나요?', a: '네. UTC 기준 날짜를 시드로 Fisher-Yates 셔플 알고리즘이 적용됩니다. 같은 날 접속하는 전 세계 모든 사용자가 동일한 25장을 받으며, UTC 자정(한국 시간 오전 9시)에 새로운 카드가 제공됩니다.' },
      { q: '연속 플레이 기록(Streak)은 어떻게 저장되나요?', a: '브라우저 localStorage에 저장됩니다. 서버에 개인정보가 전혀 저장되지 않으며, 매일 한 번 게임을 완료하면 Streak이 1씩 올라갑니다. 하루를 건너뛰면 Streak이 1부터 다시 시작되며, 역대 최고 기록(Max Streak)은 유지됩니다.' },
      { q: '점수를 높이는 전략이 있나요?', a: '가로와 세로를 동시에 고려하는 것이 핵심입니다. 같은 숫자 카드가 나오면 세로줄에 집중 배치해 포카드나 트리플을 노리세요. 같은 무늬 카드는 한 행에 모아 플러시를 노리는 전략도 유효합니다. 배치 취소가 없으므로 신중하게 결정하세요.' },
      { q: '이 게임 결과를 공식 자료로 사용해도 되나요?', a: '이 게임은 순수한 오락 및 두뇌 훈련 목적으로 제작되었습니다. 결과는 참고용이며 공식 자료로 사용할 수 없습니다.' },
    ],
  };

export const seoEn: SeoContent = {
    title: 'What is Daily Grid Poker?',
    description: 'Daily Grid Poker is a single-player puzzle game where you strategically place 25 daily cards on a 5x5 grid to maximize poker hand scores across 10 lines — 5 rows and 5 columns. Every day at UTC midnight, a new seed generates 25 unique cards shared globally, so all players compete with the same hand. Scoring ranges from Royal Straight Flush (100 pts) to Top Card (0 pts) across 9 hand types, with a maximum possible score of 1,000 points. A built-in Streak system tracks daily play consistency to build a brain-training habit. No login required — play free instantly in your browser and share your results on social media.',
    useCases: [
      { icon: '🌅', title: 'Morning Brain Warm-Up', desc: 'A 5-minute morning ritual with strategic card placement activates logical thinking before your workday begins, helping you start sharper and more focused.' },
      { icon: '🃏', title: 'Poker Strategy Training', desc: 'Optimizing both rows and columns simultaneously requires multi-directional hand-building strategy, sharpening your poker intuition faster than traditional play.' },
      { icon: '⏱️', title: 'Lunchtime Focus Game', desc: 'The game ends as soon as all 25 cards are placed — no time pressure, no open-ended sessions. The once-a-day limit actually increases your engagement and focus.' },
      { icon: '📊', title: 'Social Score Comparison', desc: 'Everyone worldwide plays with the same 25 cards today. Share your emoji result grid and streak on social media to compare scores and challenge friends.' },
    ],
    steps: [
      { step: '1. Check Today\'s Cards', desc: 'The first card is displayed at the top. All 25 cards are generated from a UTC date seed, ensuring the same sequence for every player worldwide today.' },
      { step: '2. Plan Your Placement Strategy', desc: 'Decide which empty cell best fits the current card. Consider both the row and column to set up strong poker hands across all 10 lines simultaneously.' },
      { step: '3. Complete the Grid & Check Score', desc: 'After placing all 25 cards, 10 poker hands (5 rows + 5 columns) are automatically evaluated. Each line shows its hand name, score, and emoji.' },
      { step: '4. Record Streak & Share Results', desc: 'Check your consecutive play streak on the results screen. Use the share button to post your emoji result grid and score to social media.' },
    ],
    faqs: [
      { q: 'Does the card layout change every day?', a: 'Yes. A Fisher-Yates shuffle algorithm seeded by the UTC date generates 25 new cards daily. All players worldwide receive the same cards on the same day, refreshing at UTC midnight (9 AM KST).' },
      { q: 'How is the streak saved?', a: 'Your streak is stored in your browser\'s localStorage — no personal data is sent to any server. Complete the game once per day to increment your streak. Missing a day resets the current streak to 1, but your max streak record is always preserved.' },
      { q: 'Can I use this result as official data?', a: 'This game is created for entertainment and brain-training purposes only. Results are for reference only and cannot be used as official data.' },
      { q: 'Are diagonal lines scored?', a: 'No. Only the 5 horizontal rows and 5 vertical columns are evaluated — 10 lines total. Diagonal hands are not included in the scoring.' },
    ],
  };
