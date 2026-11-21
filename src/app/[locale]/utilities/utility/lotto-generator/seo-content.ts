// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
            title: '글로벌 운명 로또 번호 생성기란 무엇인가요?',
            description: '이름·생년월일·구매 날짜를 조합한 고유 시드(Seed) 값을 기반으로 미국 파워볼(Powerball), 메가밀리언스(Mega Millions), 한국 로또 6/45의 번호를 생성하는 재미있는 도구입니다. 핵심 특징은 "운명 고정 알고리즘"으로, 동일한 입력값을 입력하면 내일 다시 접속해도 항상 같은 번호가 나옵니다. 이는 결정론적 의사난수 생성기(Seeded PRNG)를 사용하기 때문이며, 번호가 바뀌지 않는다는 점에서 자신만의 "운명의 번호"처럼 느껴집니다. 파워볼은 1~69에서 5개 + 파워볼 1~26, 메가밀리언스는 1~70에서 5개 + 메가볼 1~25, 로또 6/45는 1~45에서 6개를 추첨합니다. 번호는 실제 복권 공 디자인으로 시각화되며, 한국 로또는 번호 구간별 실제 색상(노랑·파랑·빨강·회색·초록)이 적용됩니다.',
            useCases: [
              { icon: '🎯', title: '나만의 고정 번호 찾기', desc: '이름과 생년월일로 생성한 번호는 항상 동일하므로, 매주 같은 번호로 복권을 구매할 "나만의 번호"로 활용할 수 있습니다.' },
              { icon: '🎮', title: '친구들과 번호 비교', desc: '같은 날짜를 구매일로 설정하고 이름과 생년월일만 다르게 입력해 친구들 각자의 운명 번호를 비교하고 재미있게 즐겨보세요.' },
              { icon: '🌍', title: '해외 복권 도전 준비', desc: '미국 파워볼이나 메가밀리언스 구매를 계획 중이라면, 자신의 운명 번호를 미리 생성해두고 참고용으로 사용해보세요.' },
              { icon: '🎂', title: '생일 선물 이벤트', desc: '지인의 이름과 생일을 입력해 그 사람만의 운명 번호를 뽑아 로또 선물과 함께 건네는 특별한 생일 이벤트로 활용하세요.' },
            ],
            steps: [
              { step: '게임 선택', desc: '상단에서 🇺🇸 Powerball, 🇺🇸 Mega Millions, 🇰🇷 Lotto 6/45 중 하나를 선택합니다. 각 게임의 번호 범위와 추첨 방식이 자동 적용됩니다.' },
              { step: '정보 입력', desc: '이름(한글·영문 모두 가능), 생년월일, 복권 구매 예정일을 입력합니다. 모든 항목이 입력되어야 버튼이 활성화됩니다.' },
              { step: '번호 생성', desc: '"나의 운명 번호 뽑기" 버튼을 클릭하면 1.5초간 운명 동기화 애니메이션 후 번호 공들이 하나씩 튕겨 나옵니다.' },
              { step: '번호 확인 및 활용', desc: '생성된 번호를 메모하거나 스크린샷으로 저장하세요. 동일한 입력값은 항상 같은 번호를 생성하므로 언제든 다시 확인할 수 있습니다.' },
            ],
            faqs: [
              { q: '같은 번호를 다시 뽑으려면?', a: '이름, 생년월일, 구매일을 동일하게 입력하면 항상 같은 번호가 나옵니다. 결정론적 알고리즘(Seeded PRNG)을 사용하기 때문에 날짜나 기기가 달라져도 결과가 변하지 않습니다.' },
              { q: '이 번호는 실제로 당첨될 수 있나요?', a: '이 도구는 순수 오락 목적으로 제작되었습니다. 생성되는 번호는 수학적 알고리즘에 기반한 의사난수로, 실제 복권 추첨과는 아무런 연관이 없습니다. 당첨을 보장하지 않으며, 복권 구매 판단은 전적으로 사용자의 책임입니다.' },
              { q: '파워볼과 메가밀리언스는 어떻게 다른가요?', a: '파워볼은 1~69에서 5개를 뽑고 1~26에서 파워볼 1개를 추가 추첨합니다. 메가밀리언스는 1~70에서 5개를 뽑고 1~25에서 메가볼 1개를 추가합니다. 두 게임 모두 메인 번호와 보너스 번호가 일치해야 최고 상금을 받을 수 있습니다.' },
              { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 이 도구는 순수 오락 목적으로 제작되었으며, 생성된 번호는 실제 복권 추첨과 아무런 연관이 없습니다. 복권 구매 판단은 전적으로 사용자의 책임입니다.' },
            ],
          },
  en: {
            title: 'What is the Global Destiny Lotto Picker?',
            description: 'A fun tool that generates lottery numbers for USA Powerball (5/69 + PB 1/26), Mega Millions (5/70 + MB 1/25), and Korean Lotto 6/45 based on a unique seed derived from your name, birth date, and intended purchase date. The key feature is the "destiny-fixed algorithm" — the same inputs always produce the same numbers, no matter when or where you access the tool. This is powered by a deterministic seeded pseudo-random number generator (PRNG), making it feel like your own "permanent destiny numbers." Balls are visualized in authentic lottery-ball style, with Powerball shown in red, Mega Ball in gold, and Korean Lotto balls colored by number range (yellow/blue/red/gray/green) matching the official color system.',
            useCases: [
              { icon: '🎯', title: 'Find Your Fixed Numbers', desc: 'Since your name and birthday always generate the same results, you can use these as your permanent weekly lottery numbers — no need to pick new ones every time.' },
              { icon: '🎮', title: 'Compare with Friends', desc: 'Set the same purchase date and enter different names and birthdays to compare your "destiny numbers" with friends — a fun conversation starter.' },
              { icon: '🌍', title: 'Plan Overseas Lottery', desc: 'If you\'re considering buying a US Powerball or Mega Millions ticket, generate your destiny numbers in advance to use as your personal pick.' },
              { icon: '🎂', title: 'Birthday Gift Event', desc: 'Enter a friend\'s name and birthday to generate their destiny numbers, then gift them a lottery ticket with the numbers as a unique and memorable present.' },
            ],
            steps: [
              { step: 'Select a Game', desc: 'Choose from 🇺🇸 Powerball, 🇺🇸 Mega Millions, or 🇰🇷 Lotto 6/45 at the top. Each game\'s number range and drawing format is automatically applied.' },
              { step: 'Enter Your Details', desc: 'Fill in your name (any language), birth date, and the date you plan to purchase the ticket. All fields must be filled before the button activates.' },
              { step: 'Generate Numbers', desc: 'Click "Reveal My Destiny Numbers." A 1.5-second synchronization animation plays, then lottery balls bounce onto the screen one by one.' },
              { step: 'Note and Use', desc: 'Save your numbers by screenshot or memory. Since the same inputs always produce the same numbers, you can regenerate them anytime without worry.' },
            ],
            faqs: [
              { q: 'How do I get the same numbers again?', a: 'Enter the exact same name, birth date, and purchase date — the deterministic seeded PRNG guarantees identical output every time, regardless of device or session.' },
              { q: 'Can these numbers actually win?', a: 'This tool is purely for entertainment. The numbers are generated mathematically and have no connection to real lottery draws. No winnings are guaranteed, and purchasing lottery tickets is entirely at your own discretion.' },
              { q: 'What\'s the difference between Powerball and Mega Millions?', a: 'Powerball draws 5 balls from 1–69, plus a Powerball from 1–26. Mega Millions draws 5 from 1–70, plus a Mega Ball from 1–25. Both require matching all main numbers and the bonus ball for the jackpot.' },
              { q: 'Can I use this result as official data?', a: 'Results are for reference only. This tool is for entertainment purposes only. The numbers generated have no connection to real lottery draws, and purchasing lottery tickets is entirely at your own discretion.' },
            ],
          },
};
