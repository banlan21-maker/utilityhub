// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const seoKo: SeoContent = {
    title: '데일리 그리드 포커란 무엇인가요?',
    description: '데일리 그리드 포커는 매일 한국 시간 자정에 새로 섞이는 25장의 카드를 5x5 판에 한 장씩 놓아 포커 족보 점수를 모으는 1인용 퍼즐 게임입니다. 가로 5줄과 세로 5줄, 총 10줄이 각각 따로 판정되며 로얄 스트레이트 플러시(100점)부터 탑카드(0점)까지 10가지 족보가 적용됩니다. 다음에 나올 카드는 알 수 없고 한 번 놓은 카드는 옮길 수 없어서, 지금 자리를 채울지 더 좋은 카드를 기다릴지를 매번 판단해야 합니다. 점수는 새싹·브론즈(40점)·실버(80점)·골드(120점)·다이아(160점)·마스터(200점) 여섯 등급으로 표시됩니다. 아무 데나 놓으면 평균 14점 정도이고, 같은 숫자를 같은 세로줄에 모으는 것만 지켜도 100점 안팎이 나옵니다. 같은 날에는 모두가 같은 카드를 같은 순서로 받으므로 친구와 점수를 비교할 수 있고, 하던 판은 자동 저장되어 새로고침해도 이어집니다. 로그인 없이 브라우저에서 바로 무료로 즐길 수 있습니다.',
    useCases: [
      { icon: '🌅', title: '아침 두뇌 워밍업', desc: '출근 전 5분, 그날의 25장으로 한 판을 두면 확률과 자리 배분을 따지는 사고가 깨어납니다. 하루 한 판이라 부담 없이 습관으로 만들기 좋습니다.' },
      { icon: '🃏', title: '포커 족보 감각 익히기', desc: '가로와 세로를 동시에 맞춰야 해서 페어·트리플·플러시·스트레이트가 어떤 카드로 완성되는지 자연스럽게 익힙니다. 줄이 완성되면 줄 끝에 점수가 바로 표시됩니다.' },
      { icon: '⏱️', title: '점심시간 짧은 게임', desc: '25장을 놓으면 끝나는 구조라 3~5분이면 한 판이 끝납니다. 중간에 창을 닫아도 놓은 카드가 저장되어 나중에 이어서 둘 수 있습니다.' },
      { icon: '📊', title: '친구와 등급 비교', desc: '같은 날에는 누구나 같은 카드를 같은 순서로 받습니다. 결과 화면의 등급·점수·줄별 족보 이모지를 공유해 누가 더 잘 놓았는지 비교해 보세요.' },
    ],
    steps: [
      { step: '1. 다음 카드 확인', desc: '화면 위에 지금 놓을 카드 한 장이 표시됩니다. 25장은 한국 날짜를 기준으로 섞이며, 다음에 어떤 카드가 나올지는 미리 볼 수 없습니다.' },
      { step: '2. 빈칸을 눌러 배치', desc: '카드를 놓을 빈칸을 누릅니다. 한 번 놓은 카드는 옮길 수 없으니 가로줄과 세로줄을 함께 보고 고르세요. 판 아래 "족보 점수표"에서 족보별 점수를 볼 수 있습니다.' },
      { step: '3. 줄별 점수 확인', desc: '가로줄이나 세로줄 5칸이 다 차면 그 줄의 점수가 줄 끝에 표시되고, 오른쪽 아래 칸에 현재 합계가 나옵니다. 남은 줄에서 무엇을 노릴지 정하는 데 참고하세요.' },
      { step: '4. 등급 확인과 공유', desc: '25장을 모두 놓으면 총점과 등급, 다음 등급까지 남은 점수, 줄별 족보표가 나옵니다. 공유 버튼으로 결과를 보내고, 연속 플레이 기록도 확인하세요.' },
    ],
    faqs: [
      { q: '매일 카드가 바뀌나요?', a: '네. 한국 날짜를 기준으로 52장을 새로 섞어 앞의 25장을 순서대로 제공합니다. 같은 날에는 모든 사용자가 같은 카드를 같은 순서로 받고, 한국 시간 자정에 새 카드로 바뀝니다. 하루에 한 판만 둘 수 있으며 결과 화면에 다음 카드까지 남은 시간이 표시됩니다.' },
      { q: '등급은 어떻게 정해지나요?', a: '10줄의 족보 점수를 더한 총점으로 정합니다. 새싹(0점 이상), 브론즈(40점), 실버(80점), 골드(120점), 다이아(160점), 마스터(200점)입니다. 10줄 모두 최고 족보를 만드는 것은 카드 구성상 불가능하고, 25장의 순서를 전부 알고 배치해도 300점대가 한계라서 만점 대신 등급으로 보여 드립니다.' },
      { q: '점수를 높이는 요령이 있나요?', a: '같은 숫자를 같은 세로줄에 모으는 것부터 시작하세요. 포카드(50점)와 풀하우스(25점)가 점수의 대부분을 만듭니다. 그다음 가로줄은 같은 무늬로 맞춰 플러시(20점)를 노립니다. 초반에는 줄마다 모을 숫자를 정해 두고, 맞지 않는 카드를 버릴 줄을 하나 남겨 두면 좋습니다.' },
      { q: '하던 판과 연속 기록은 어디에 저장되나요?', a: '사용 중인 브라우저의 저장소에만 저장되고 서버로는 전송되지 않습니다. 그래서 새로고침하거나 창을 닫았다 열어도 놓은 카드가 그대로 이어지며, 같은 날 처음부터 다시 둘 수는 없습니다. 하루를 건너뛰면 연속 기록은 1일부터 다시 시작하고 최고 기록은 유지됩니다. 브라우저 데이터를 지우면 기록도 사라집니다.' },
    ],
  };

export const seoEn: SeoContent = {
    title: 'What is Daily Grid Poker?',
    description: 'Daily Grid Poker is a single-player puzzle in which you place 25 cards, one at a time, on a 5x5 board to build poker hands across 10 lines — 5 rows and 5 columns, each scored separately. A fresh set of cards is shuffled every day at midnight Korea time (KST), and everyone gets the same cards in the same order. You cannot see the cards to come and a placed card cannot be moved, so every turn is a decision between filling a line now and waiting for a better card. Ten hand types are scored, from Royal Flush (100 points) down to High Card (0). Your total earns one of six grades: Sprout, Bronze (40), Silver (80), Gold (120), Diamond (160) and Master (200). Placing cards at random averages about 14 points, while simply stacking equal ranks in the same column gets you to around 100. Your board is saved automatically, so a refresh picks up where you left off. No login is needed and it is free to play in your browser.',
    useCases: [
      { icon: '🌅', title: 'Morning Brain Warm-Up', desc: 'One board takes about five minutes and makes you weigh odds and space before the workday starts. One game a day keeps it an easy habit to hold on to.' },
      { icon: '🃏', title: 'Learning Poker Hands', desc: 'Building rows and columns at the same time teaches which cards complete a pair, three of a kind, flush or straight. Each line shows its points as soon as it is full.' },
      { icon: '⏱️', title: 'A Short Break Game', desc: 'The game ends when all 25 cards are placed, usually in three to five minutes. Close the tab midway and your placed cards are still there when you come back.' },
      { icon: '📊', title: 'Comparing Grades', desc: 'Everyone plays the same cards in the same order on a given day. Share your grade, score and the emoji row for each line to see who placed them better.' },
    ],
    steps: [
      { step: '1. Look at the Next Card', desc: 'The card you must place now is shown above the board. The 25 cards are shuffled from the Korean date, and the cards that follow stay hidden until their turn.' },
      { step: '2. Tap an Empty Cell', desc: 'Tap the cell where the card should go. A placed card cannot be moved, so check both its row and its column first. Open "Hand scores" under the board to see what each hand is worth.' },
      { step: '3. Watch the Line Scores', desc: 'When a row or column is full, its points appear at the end of the line and the running total shows in the bottom-right cell. Use it to decide what to aim for in the remaining lines.' },
      { step: '4. See Your Grade and Share', desc: 'After the 25th card you get your total, your grade, the points needed for the next grade and a table of all 10 hands. Share the result and check your daily streak.' },
    ],
    faqs: [
      { q: 'Do the cards change every day?', a: 'Yes. A full 52-card deck is reshuffled from the Korean date and the first 25 cards are dealt in order. All players get the same cards in the same order on the same day, and a new set arrives at midnight Korea time (KST). You can play one board a day, and the result screen shows a countdown to the next one.' },
      { q: 'How are grades decided?', a: 'By the sum of your 10 line scores: Sprout (0+), Bronze (40), Silver (80), Gold (120), Diamond (160) and Master (200). Scoring the top hand on all 10 lines is impossible with 25 cards, and even with full knowledge of the card order the best boards land in the 300s, so the game shows a grade instead of a maximum score.' },
      { q: 'How is my board and streak saved?', a: 'Only in the storage of the browser you are using — nothing is sent to a server. That is why a refresh or a closed tab resumes the same board, and why you cannot restart the same day from scratch. Missing a day resets the current streak to 1 while your best streak is kept. Clearing browser data removes the records.' },
      { q: 'Are diagonal lines scored?', a: 'No. Only the 5 horizontal rows and the 5 vertical columns are evaluated, 10 lines in total. Diagonals are ignored, so you are free to use them for cards that do not help any hand. A straight may run A-2-3-4-5 or 10-J-Q-K-A, but it cannot wrap around from King to Ace to 2.' },
    ],
  };
