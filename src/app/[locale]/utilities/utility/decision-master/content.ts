// Decision Master SEO 본문 — 화면(SeoSection)과 구조화 데이터(page.tsx)가 같은 내용을 쓴다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO_KO: SeoContent = {
  title: 'Decision Master — 사다리·돌림판·주사위·제비뽑기·화살표를 한 페이지에서',
  description:
    'Decision Master는 사다리 타기, 돌림판, 주사위, 제비뽑기, 화살표 돌리기 다섯 가지 무작위 결정 방식을 한 화면의 탭으로 모아 둔 무료 도구입니다. 점심 메뉴, 발표 순서, 청소 당번, 게임 선공처럼 누가 정해도 뒷말이 나오기 쉬운 일을 운에 맡겨 깔끔하게 정할 때 씁니다. 처음 열면 돌림판 탭이 선택되어 있고 "선택지 1~4"가 미리 채워져 있어, 이름만 바꾸고 바로 돌릴 수 있습니다. 돌림판에는 선택지를 2개부터 8개까지 넣을 수 있고 비어 있는 칸은 자동으로 빠집니다. 사다리 타기는 참가자 2~6명과 같은 수의 결과를 입력한 뒤 "사다리 생성"을 누르면 가로줄이 무작위로 놓이고, 참가자 옆 GO 버튼으로 한 명씩 확인하거나 "전체 공개"로 모두의 결과를 한 번에 볼 수 있습니다. 예를 들어 철수·영희·민준·지아 네 명에 결과를 1등·2등·꽝·3등으로 두면 "철수 → 2등"처럼 각자 도착한 결과가 표시되고, 두 사람이 같은 결과에 도착하는 일은 없습니다. 주사위는 1~5개를 한꺼번에 굴리고 2개 이상이면 눈의 합계를 보여 주며, 제비뽑기는 전체 2~12명 가운데 당첨 인원을 정하면 카드가 섞여 한 장씩 뒤집어 확인하는 방식입니다. 화살표 돌리기는 A부터 H까지 8칸으로 나뉜 원판 위에서 화살표를 돌리고, "직접 입력 사용"을 켜면 칸마다 원하는 이름을 붙일 수 있습니다. 결과는 실행 버튼 아래 결과 칸에 크게 표시되므로 여러 사람이 한 화면을 같이 보며 확인하기 좋고, 휴대폰 브라우저에서도 같은 방식으로 쓸 수 있습니다. 모든 추첨은 브라우저 안에서 바로 이뤄지며 회원가입이나 앱 설치가 필요 없습니다.',
  useCases: [
    { icon: '🍱', title: '점심 메뉴·회식 장소 고르기', desc: '돌림판에 김치찌개·돈가스·쌀국수·샐러드처럼 후보를 최대 8개까지 적고 돌리면 4초쯤 뒤 결과 칸에 오늘의 메뉴가 나옵니다. 의견이 갈려 시간만 흐를 때 몇 초 만에 정리됩니다.' },
    { icon: '🪜', title: '발표 순서·당번 정하기', desc: '사다리 타기에 참가자 이름을, 결과에 1번·2번·3번·4번을 입력하면 모두가 서로 다른 순번에 도착합니다. 스터디 발표 순서나 청소·설거지 당번을 겹치지 않게 나눌 때 알맞습니다.' },
    { icon: '🎴', title: '경품·당첨자 추첨', desc: '제비뽑기에서 전체 인원 10명, 당첨 인원 2명으로 정하면 엎어 둔 카드 10장 가운데 2장에만 당첨이 숨겨집니다. 참가자가 자기 카드를 직접 눌러 뒤집으니 모임 현장에서 긴장감 있게 진행할 수 있습니다.' },
    { icon: '🎲', title: '보드게임·벌칙 게임', desc: '주사위가 없을 때 1~5개를 한 번에 굴리고 합계를 바로 확인합니다. 화살표 돌리기의 8칸에 벌칙이나 미션을 직접 적어 두면 MT나 모임에서 쓰는 게임 판으로도 활용할 수 있습니다.' },
  ],
  steps: [
    { step: '모드 탭 고르기', desc: '화면 위쪽의 사다리·돌림판·주사위·제비뽑기·화살표 탭 중 상황에 맞는 것을 누릅니다. 처음에는 돌림판이 선택되어 있고, 탭을 바꾸면 그 모드에 맞는 입력 칸이 나타납니다.' },
    { step: '선택지나 인원 입력하기', desc: '돌림판은 선택지를 적고 "+ 추가"로 칸을 늘립니다. 사다리는 인원 수(2~6)를 고른 뒤 참가자와 결과를 적고, 제비뽑기는 −/+ 버튼으로 전체 인원과 당첨 인원을, 주사위는 개수를 정합니다.' },
    { step: '실행 버튼 누르기', desc: '"돌려라!", "굴려라!", "화살표 돌리기!" 버튼을 누릅니다. 사다리는 먼저 "사다리 생성"을 누른 뒤 참가자 옆 GO 버튼을 누르고, 제비뽑기는 엎어진 카드를 한 장씩 눌러 뒤집습니다.' },
    { step: '결과 확인하고 다시 하기', desc: '결과 칸에 당첨 항목이 표시되고, 사다리는 "전체 공개"로 모든 참가자의 결과를 한 번에 볼 수 있습니다. 다시 하려면 버튼을 한 번 더 누르거나 제비뽑기의 "리셋"으로 카드를 새로 섞습니다.' },
  ],
  faqs: [
    { q: '결과가 정말 무작위인가요?', a: '네. 돌림판이 멈추는 각도, 주사위 눈, 화살표가 멈추는 위치, 사다리 가로줄 배치, 제비뽑기 당첨 카드 위치를 모두 브라우저의 난수 함수(Math.random)로 매번 새로 정합니다. 게임이나 일상적인 결정에는 충분하지만 암호용 보안 난수는 아니므로, 금전이 걸린 공식 추첨에는 별도의 공인 절차를 쓰는 것이 좋습니다.' },
    { q: '사다리 타기 결과를 미리 알 수 있나요?', a: '아니요. 가로줄은 "사다리 생성"을 누르는 순간 줄마다 무작위로 놓이며 같은 높이에서 서로 붙지 않습니다. 사다리 구조상 모든 참가자는 서로 다른 결과에 도착합니다. 인원 수를 바꾸면 사다리가 지워지므로 다시 생성해야 하고, 생성 버튼을 다시 누르면 완전히 새로운 사다리가 만들어집니다.' },
    { q: '돌림판에는 선택지를 몇 개까지 넣을 수 있나요?', a: '최소 2개, 최대 8개입니다. 8개가 되면 "+ 추가" 버튼이 사라지고, 선택지가 3개 이상일 때는 칸 옆의 × 버튼으로 지울 수 있습니다. 비어 있는 칸은 돌림판에 그려지지 않으며, 8글자가 넘는 이름은 판 위에서는 앞부분만 줄여 보이지만 결과 칸에는 전체 이름이 나옵니다.' },
    { q: '제비뽑기는 몇 명까지 할 수 있나요?', a: '전체 인원은 2명부터 12명까지 정할 수 있고, 당첨 인원은 + 버튼으로 전체 인원보다 1명 적은 수까지 올릴 수 있습니다. 숫자를 바꾸면 카드가 자동으로 다시 섞이며, 모든 카드를 뒤집으면 "추첨 완료" 표시와 함께 당첨 인원이 나옵니다. 같은 설정으로 한 번 더 하려면 "리셋"을 누르세요.' },
    { q: '입력한 이름이 저장되거나 서버로 전송되나요?', a: '아니요. 입력한 이름과 선택지는 서버로 보내지 않고 브라우저 안에서만 추첨에 쓰입니다. 따로 저장하지도 않기 때문에 페이지를 새로 고치면 기본값으로 돌아갑니다. 자주 쓰는 참가자 명단이나 메뉴 목록이 있다면 메모장에 적어 두었다가 붙여 넣으면 편합니다.' },
    { q: '추첨 결과에 법적 효력이 있나요?', a: '아니요. 이 도구의 결과는 재미와 편의를 위한 무작위 값이며 법적 효력이 없습니다. 경품 추첨처럼 공정성을 보여 줘야 한다면 참가자가 보는 앞에서 진행하거나 화면을 녹화해 두고, 계약이나 금전이 걸린 중요한 결정은 반드시 당사자 간 합의로 정하세요.' },
  ],
};

export const SEO_EN: SeoContent = {
  title: 'Decision Master — Ladder, Wheel, Dice, Draw and Arrow on One Page',
  description:
    'Decision Master puts five ways of making a random choice — Ladder, Wheel, Dice, Draw and Arrow — on one page as tabs, so you can settle who goes first, where to eat or who wins a prize without an argument. The page opens on the Wheel tab with four placeholder options already filled in, so you only need to type your own choices and press Spin. The wheel takes two to eight options and leaves out any empty rows. Ladder mode is the classic ladder lottery: pick two to six players, type their names and the same number of prizes, press Generate to place random rungs, then reveal one path at a time with each player\'s GO button or everyone at once with Reveal All. For example, with Alex, Ben, Chris and Dana against 1st, 2nd, Lose and 3rd, results appear as "Alex → 2nd", and no two players ever land on the same prize. Dice rolls one to five dice together and shows the total, Draw hides a chosen number of winning cards among 2 to 12 face-down cards that you flip one by one, and Arrow spins a pointer over an eight-sector dial labelled A to H, or with labels you type yourself. Everything runs in your browser with no sign-up or install.',
  useCases: [
    { icon: '🍱', title: 'Picking Lunch or a Venue', desc: 'Type up to eight candidates such as ramen, tacos, salad and pizza into the wheel, press Spin, and about four seconds later the result box names today\'s pick, ending a debate that could drag on.' },
    { icon: '🪜', title: 'Presentation Order and Chores', desc: 'Enter team members as ladder players and 1, 2, 3 and 4 as the prizes. Every path ends at a different slot, so nobody shares a position, which suits study-group talks and cleaning rotas.' },
    { icon: '🎴', title: 'Giveaways and Prize Draws', desc: 'Set ten in total and two winners in Draw, and two of the ten face-down cards hide a win. Each person taps their own card, so the reveal happens in front of everyone at a party or meetup.' },
    { icon: '🎲', title: 'Board Games and Forfeits', desc: 'No dice at hand? Roll up to five at once and read the total instantly. Or turn on custom labels in Arrow mode and write eight dares or missions to use as a party game spinner.' },
  ],
  steps: [
    { step: 'Choose a Mode', desc: 'Tap one of the five tabs at the top: Ladder, Wheel, Dice, Draw or Arrow. The Wheel tab is open by default, and switching tabs brings up the inputs for that mode.' },
    { step: 'Enter Options or Players', desc: 'For the wheel, type your options and use + Add for more rows. For the ladder, choose 2–6 players and fill in names and prizes. In Draw, use the − and + buttons; in Dice, pick how many to roll.' },
    { step: 'Run It', desc: 'Press Spin!, Roll! or Spin Arrow!. For the ladder, press Generate first and then the GO button next to a player. In Draw, tap the face-down cards one at a time to flip them over.' },
    { step: 'Read the Result and Go Again', desc: 'The result box shows the outcome, and Reveal All lists every ladder pairing at once. To go again, press the button once more, or use Reset in Draw to reshuffle the cards with the same settings.' },
  ],
  faqs: [
    { q: 'Are the results really random?', a: 'Yes. The wheel\'s stopping angle, each die face, where the arrow stops, the ladder rungs and the winning card positions are all drawn fresh every time with the browser\'s Math.random function. That is plenty for games and everyday choices, but it is not a cryptographic random source, so use a certified service for draws involving money.' },
    { q: 'Can anyone predict the ladder result?', a: 'No. Rungs are placed randomly row by row the moment you press Generate, and two rungs never touch at the same height. Because of how a ladder works, every player reaches a different prize. Changing the number of players clears the ladder, and pressing Generate again builds a completely new one from scratch.' },
    { q: 'How many options can the wheel hold?', a: 'Between two and eight. Once you reach eight, the + Add button disappears, and with three or more options you can delete a row with its × button. Empty rows are left off the wheel, and names longer than eight characters are shortened on the wheel itself but shown in full in the result box.' },
    { q: 'How many people can the Draw mode handle?', a: 'From 2 to 12 cards in total, and the + button lets you raise the number of winners to one fewer than the total. Changing either number reshuffles the cards automatically, and once every card has been flipped the tool shows how many winners there were. Press Reset to reshuffle with the same settings.' },
    { q: 'Are the names I type saved or sent anywhere?', a: 'No. Names and options are not sent to a server; the draw happens inside your browser. Nothing is saved either, so refreshing the page brings back the default values. If you reuse the same list of people or menu items often, keep it in a note and paste it in when you need it.' },
    { q: 'Is the result legally binding?', a: 'No. The results are random values for fun and convenience and carry no legal weight. If you need to show that a giveaway was fair, run it in front of the participants or record your screen while you draw, and settle contracts or anything involving money by mutual agreement.' },
  ],
};
