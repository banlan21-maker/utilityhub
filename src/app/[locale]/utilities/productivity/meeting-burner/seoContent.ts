import type { SeoContent } from '@/app/components/SeoSection';

/**
 * 하단 SEO 섹션 + 한국어 FAQPage JSON-LD가 함께 쓰는 데이터.
 * (page.tsx의 faqSchema가 ko.faqs를 그대로 사용하므로 화면 FAQ와 구조화 데이터가 항상 일치한다)
 */
export const MEETING_BURNER_SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
    title: '실시간 회의 비용 계산기 - Meeting Burner',
    description:
      'Meeting Burner는 회의에 들어간 사람들의 인건비가 1초마다 얼마씩 쌓이는지 택시 미터기처럼 보여 주는 회의 비용 계산기입니다. ' +
      '참석자 수(1~50명)와 평균 연봉, 목표 회의 시간을 넣고 \'회의 시작\'을 누르면 0.1초 간격으로 금액이 올라갑니다. ' +
      '계산식은 단순합니다. 평균 연봉에 참석자 수를 곱한 뒤 1년 365일 × 하루 8시간 × 3,600초로 나눠 초당 비용을 구합니다. ' +
      '기본값인 5명, 평균 연봉 5,000만 원이면 초당 약 23.8원, 1분에 약 1,427원, 30분 회의 한 번에 약 42,800원이 나갑니다. ' +
      '시니어 프리셋(6,000만 원)으로 8명이 1시간 회의를 하면 약 164,000원이 되고, 결과 영수증에는 \'제주도 왕복권 1개, 치킨 3개\'로 찍힙니다. ' +
      '누적 금액이 5,000원을 넘으면 아메리카노, 2만 원은 치킨, 5만 원은 점심 회식비, 10만 원은 제주도 왕복 항공권, 100만 원은 맥북 프로처럼 체감하기 쉬운 물건으로 바꿔 보여 주기 때문에, 숫자만 볼 때보다 회의 길이를 한 번 더 생각하게 됩니다. ' +
      '목표 시간을 넘기면 대시보드가 붉게 바뀌고 흔들리면서 초과 경고가 뜹니다. ' +
      '회의를 마치면 최종 청구액, 소모된 시간, 참석 인원을 정리한 영수증을 PNG 이미지로 저장할 수 있습니다. ' +
      '모든 계산은 브라우저 안에서만 이뤄지며 입력한 연봉이나 인원 정보는 서버로 전송되지 않습니다.',
    useCases: [
      {
        icon: '⏰',
        title: '정기 회의 길이 점검',
        desc: '매주 월요일 1시간씩 하는 주간 회의에 미터기를 켜 두고 재 보세요. 회의 한 번에 드는 인건비를 눈으로 확인하면 30분으로 줄일지, 참석자를 줄일지 판단할 근거가 생깁니다.',
      },
      {
        icon: '👥',
        title: '참석 인원 다이어트',
        desc: '"일단 다 들어와" 식으로 10명 넘게 부르는 회의라면 같은 회의를 5명일 때와 10명일 때로 나눠 측정해 보세요. 인원이 두 배면 초당 비용도 정확히 두 배가 됩니다.',
      },
      {
        icon: '🧾',
        title: '회고·팀 공유용 영수증',
        desc: '회의가 끝나면 \'종료\'를 눌러 영수증을 받고 이미지로 저장해 팀 메신저에 올려 보세요. 치킨·맥북 개수로 표시돼 분위기를 해치지 않으면서 회의 문화를 이야기할 계기가 됩니다.',
      },
      {
        icon: '🎯',
        title: '타임박싱 연습',
        desc: '목표 회의 시간을 25분처럼 짧게 잡아 두고 화면 공유로 띄워 보세요. 시간을 넘기는 순간 화면이 붉게 흔들려 진행자가 눈치 보지 않고 마무리 신호를 줄 수 있습니다.',
      },
    ],
    steps: [
      {
        step: '참석자 수와 평균 연봉 입력',
        desc: '\'참석자 수\' 슬라이더로 1명에서 50명 사이 인원을 정하고 \'평균 연봉\'에 원 단위 금액을 넣습니다. 감이 안 오면 주니어(3,500만)·시니어(6,000만)·임원(1억) 버튼을 누르세요.',
      },
      {
        step: '목표 회의 시간 설정',
        desc: '\'목표 회의 시간\' 칸에 계획한 시간을 분 단위로 적습니다. 기본값은 30분이며, 이 시간을 넘기면 실시간 대시보드가 빨갛게 바뀌고 초과 경고 문구가 표시됩니다.',
      },
      {
        step: '\'🔥 회의 시작\'으로 측정',
        desc: '버튼을 누르면 실시간 대시보드가 열리고 누적 금액, 경과 시간, 지금까지의 금액으로 날아간 물건이 함께 표시됩니다. 측정 중에는 \'종료\'와 \'리셋\' 버튼만 쓸 수 있습니다.',
      },
      {
        step: '영수증 확인 및 이미지 저장',
        desc: '\'종료\'를 누르면 최종 청구액, 소모된 시간, 참석 인원, 증발한 물건 목록이 담긴 회의 영수증이 나옵니다. \'이미지 저장\'으로 PNG를 받고 \'새 회의 시작\'으로 처음 화면에 돌아갑니다.',
      },
    ],
    faqs: [
      {
        q: '초당 회의 비용은 어떻게 계산하나요?',
        a: '평균 연봉 × 참석자 수 ÷ (365일 × 8시간 × 3,600초)로 계산합니다. 분모가 10,512,000초이므로 연봉 5,000만 원인 사람 1명은 초당 약 4.76원, 시간당 약 17,100원입니다. 이 금액이 0.1초마다 누적되어 화면 숫자가 계속 올라갑니다.',
      },
      {
        q: '실제 인건비보다 적게 나오는 것 같아요.',
        a: '맞습니다. 이 도구는 1년을 365일 × 8시간, 즉 2,920시간으로 보고 연봉을 나누기 때문에 주 40시간 × 52주(2,080시간) 기준으로 계산한 시급의 약 71% 수준으로 나옵니다. 4대 보험 회사 부담분, 퇴직금, 복리후생비도 빠져 있으니 실제 회사가 부담하는 비용은 표시 금액보다 크다고 보시면 됩니다.',
      },
      {
        q: '입력한 연봉 정보가 서버에 저장되나요?',
        a: '아니요. 참석자 수, 연봉, 목표 시간은 모두 브라우저 안에서만 계산되고 서버로 전송되지 않습니다. 영수증 이미지도 브라우저에서 바로 만들어 내 기기로 내려받는 방식입니다. 대신 새로고침하면 입력값과 측정 기록이 사라지니 남겨 두고 싶은 결과는 이미지로 저장해 두세요.',
      },
      {
        q: '목표 시간을 넘기면 어떻게 되나요?',
        a: '경과 시간이 설정한 목표 회의 시간을 넘는 순간 대시보드 배경이 붉은색으로 바뀌고 카드가 좌우로 흔들리며 \'목표 시간 초과! 퇴근이 멀어지고 있습니다...\' 경고가 뜹니다. 타이머는 멈추지 않고 비용을 계속 쌓으므로 \'종료\'를 눌러야 측정이 끝납니다.',
      },
      {
        q: '영수증의 \'증발한 물건\'은 어떻게 정해지나요?',
        a: '최종 금액을 비싼 물건부터 차례로 나눠 담습니다. 맥북 프로 100만 원, 제주도 왕복권 10만 원, 치킨 2만 원, 아메리카노 5천 원 순서로 몇 개가 들어가는지 세고 남은 돈을 다음 단계로 넘깁니다. 예를 들어 164,000원이면 제주도 왕복권 1개와 치킨 3개가 찍히고, 남은 약 4,000원은 커피 한 잔에 못 미쳐 빠집니다.',
      },
      {
        q: '회의 도중에 참석자 수나 연봉을 바꿀 수 있나요?',
        a: '측정을 시작하면 설정 화면이 사라지기 때문에 도중에 값을 바꿀 수는 없습니다. 중간에 사람이 들어오거나 나갔다면 \'종료\'로 지금까지의 영수증을 확인한 뒤 \'새 회의 시작\'을 눌러 인원을 바꾸고 다시 측정하세요. 두 영수증 금액을 더하면 전체 회의 비용이 됩니다.',
      },
    ],
  },
  en: {
    title: 'Real-time Meeting Cost Calculator - Meeting Burner',
    description:
      'Meeting Burner is a meeting cost calculator that runs like a taxi meter, showing how much paid staff time a meeting burns second by second. ' +
      'Set the number of participants (1 to 50), the average annual salary and a target duration, press Start Meeting, and the total climbs every 0.1 seconds. ' +
      'The formula is simple: average salary × participants ÷ (365 days × 8 hours × 3,600 seconds). ' +
      'With the default inputs, 5 people earning an average of ₩50,000,000 a year, that works out to about ₩23.8 per second, ₩1,427 per minute and roughly ₩42,800 for a 30-minute meeting. ' +
      'Eight people on the Senior preset (₩60,000,000) talking for one hour cost about ₩164,000, which the final receipt itemizes as one round-trip flight and three chickens. ' +
      'As the total passes ₩5,000, ₩20,000, ₩50,000, ₩100,000 and ₩1,000,000, a caption swaps in a coffee, a chicken, a team lunch, a flight to Jeju and a MacBook Pro, so the number is easier to feel. ' +
      'Run past your target time and the dashboard turns red and starts shaking. ' +
      'When you press Stop, you get a receipt with total cost, time spent and headcount that you can save as a PNG image. ' +
      'Amounts are shown in Korean won, and every calculation runs in your browser; the salary and headcount you enter are never sent to a server.',
    useCases: [
      {
        icon: '⏰',
        title: 'Audit recurring meetings',
        desc: 'Run the meter during a weekly one-hour status meeting. Seeing what a single session costs gives you a concrete reason to cut it to 30 minutes or trim the invite list.',
      },
      {
        icon: '👥',
        title: 'Right-size the attendee list',
        desc: 'Measure the same meeting with 5 participants and then with 10. Cost scales directly with headcount, so doubling the room doubles the cost per second, which makes "just invite everyone" harder to defend.',
      },
      {
        icon: '🧾',
        title: 'Share a receipt with the team',
        desc: 'Press Stop to get a meeting receipt, save it as an image and post it in your team channel. Counting chickens and MacBooks keeps the tone light while opening a real conversation about meeting habits.',
      },
      {
        icon: '🎯',
        title: 'Practice timeboxing',
        desc: 'Set a tight target such as 25 minutes and share your screen. The moment the meeting runs over, the dashboard turns red and shakes, giving the facilitator a neutral cue to wrap things up.',
      },
    ],
    steps: [
      {
        step: 'Enter participants and salary',
        desc: 'Drag the Participants slider anywhere from 1 to 50 people and type the average annual salary in won, or tap Junior (35M), Senior (60M) or Executive (100M) to fill it in for you.',
      },
      {
        step: 'Set the target duration',
        desc: 'Type the planned length in minutes into Target Meeting Duration. The default is 30 minutes; once elapsed time passes it, the live dashboard switches to a red overtime warning.',
      },
      {
        step: 'Press Start Meeting',
        desc: 'The Ticker dashboard shows the running total, the elapsed time and what that money could have bought. While the meter is running, only the Stop and Reset buttons are available.',
      },
      {
        step: 'Review and save the receipt',
        desc: 'Press Stop to open the Meeting Receipt with total cost, time spent, participants and evaporated items. Save as Image downloads a PNG, and New Meeting takes you back to the setup screen.',
      },
    ],
    faqs: [
      {
        q: 'How is the cost per second calculated?',
        a: 'The tool multiplies the average annual salary by the number of participants and divides by 10,512,000, which is 365 days × 8 hours × 3,600 seconds. One person on ₩50,000,000 therefore costs about ₩4.76 per second, or roughly ₩17,100 per hour. The total is updated every 0.1 seconds.',
      },
      {
        q: 'Why does the cost look lower than our real labor cost?',
        a: 'The formula spreads salary over 2,920 hours a year (365 × 8) rather than the 2,080 hours of a 40-hour, 52-week schedule, so the hourly figure is about 71% of what a 2,080-hour basis would give. Employer taxes, insurance and benefits are not included either, so treat the result as a conservative floor.',
      },
      {
        q: 'Is my salary data stored or sent anywhere?',
        a: 'No. Participants, salary and target time are kept in your browser and the calculation never leaves your device. The receipt image is also rendered locally and downloaded straight to your computer. Reloading the page clears everything, so save the receipt image if you want to keep a record.',
      },
      {
        q: 'What happens when the meeting runs past the target time?',
        a: 'As soon as elapsed time exceeds the target, the dashboard background turns red, the card starts shaking and an overtime warning appears. The meter does not pause, so the meeting cost keeps growing until someone presses Stop to end the measurement.',
      },
      {
        q: 'How are the "evaporated items" on the receipt chosen?',
        a: 'The final amount is split from the most expensive item down: MacBook Pro at ₩1,000,000, round-trip flight at ₩100,000, chicken at ₩20,000 and Americano at ₩5,000. About ₩164,000 becomes one flight and three chickens, and the remaining ₩4,000 or so is too small for a coffee.',
      },
      {
        q: 'Can I enter a salary in dollars or another currency?',
        a: 'The meter always shows a ₩ sign, and the presets and comparison items are priced in Korean won. The formula itself is currency-neutral, so if you type 70000 for a dollar salary the number on screen is effectively dollars, but the coffee, chicken and MacBook captions will no longer line up because they trigger at won amounts.',
      },
      {
        q: 'Can I change the inputs in the middle of a meeting?',
        a: 'No. Once the meter starts, the setup panel is hidden. If someone joins or leaves partway through, press Stop to see the receipt so far, then press New Meeting, adjust the headcount and start again. Adding the two receipts together gives the cost of the whole meeting.',
      },
    ],
  },
};
