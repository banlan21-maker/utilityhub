// 페르소나 카드 게임 — 카드 데이터 + 미션 데이터
// V1.4 지침서: 1단계 (미션 1~3 완성, 4~10은 빈 껍데기)

export interface Card {
  id: string;
  ko: string;
  en: string;
  emoji: string;
}

export interface Choice {
  text: { ko: string; en: string };
  tags: string[];
  baseScore: number; // 0~100
}

export interface Situation {
  text: { ko: string; en: string };
  choices: Choice[]; // 정확히 4개
}

export interface Mission {
  id: string;
  emoji: string;
  ko: { title: string; desc: string };
  en: { title: string; desc: string };
  situations: Situation[];
}

// ── 직업 카드 (20개) ───────────────────────────────────────────────
export const JOBS: Card[] = [
  { id: 'astronaut',     ko: '우주비행사', en: 'Astronaut',     emoji: '🧑‍🚀' },
  { id: 'chef',          ko: '요리사',     en: 'Chef',          emoji: '👨‍🍳' },
  { id: 'doctor',        ko: '의사',       en: 'Doctor',        emoji: '👨‍⚕️' },
  { id: 'hacker',        ko: '해커',       en: 'Hacker',        emoji: '👨‍💻' },
  { id: 'knight',        ko: '기사',       en: 'Knight',        emoji: '⚔️' },
  { id: 'magician',      ko: '마법사',     en: 'Magician',      emoji: '🧙' },
  { id: 'detective',     ko: '탐정',       en: 'Detective',     emoji: '🕵️' },
  { id: 'farmer',        ko: '농부',       en: 'Farmer',        emoji: '👨‍🌾' },
  { id: 'musician',      ko: '음악가',     en: 'Musician',      emoji: '🎵' },
  { id: 'scientist',     ko: '과학자',     en: 'Scientist',     emoji: '🔬' },
  { id: 'pirate',        ko: '해적',       en: 'Pirate',        emoji: '🏴‍☠️' },
  { id: 'ninja',         ko: '닌자',       en: 'Ninja',         emoji: '🥷' },
  { id: 'teacher',       ko: '선생님',     en: 'Teacher',       emoji: '👨‍🏫' },
  { id: 'explorer',      ko: '탐험가',     en: 'Explorer',      emoji: '🗺️' },
  { id: 'athlete',       ko: '운동선수',   en: 'Athlete',       emoji: '🏃' },
  { id: 'artist',        ko: '예술가',     en: 'Artist',        emoji: '🎨' },
  { id: 'engineer',      ko: '엔지니어',   en: 'Engineer',      emoji: '⚙️' },
  { id: 'spy',           ko: '스파이',     en: 'Spy',           emoji: '🕶️' },
  { id: 'pilot',         ko: '파일럿',     en: 'Pilot',         emoji: '✈️' },
  { id: 'archaeologist', ko: '고고학자',   en: 'Archaeologist', emoji: '🏺' },
];

// ── 성격 카드 (20개) ───────────────────────────────────────────────
export const PERSONALITIES: Card[] = [
  { id: 'coward',        ko: '겁쟁이',     en: 'Coward',        emoji: '😨' },
  { id: 'brave',         ko: '무모한',     en: 'Reckless',      emoji: '💪' },
  { id: 'lazy',          ko: '게으른',     en: 'Lazy',          emoji: '😴' },
  { id: 'greedy',        ko: '욕심쟁이',   en: 'Greedy',        emoji: '🤑' },
  { id: 'curious',       ko: '호기심 많은', en: 'Curious',       emoji: '🔍' },
  { id: 'clumsy',        ko: '덜렁이',     en: 'Clumsy',        emoji: '🤦' },
  { id: 'genius',        ko: '천재',       en: 'Genius',        emoji: '🧠' },
  { id: 'talkative',     ko: '수다쟁이',   en: 'Talkative',     emoji: '💬' },
  { id: 'stubborn',      ko: '고집쟁이',   en: 'Stubborn',      emoji: '🐂' },
  { id: 'optimist',      ko: '낙천적인',   en: 'Optimist',      emoji: '😊' },
  { id: 'pessimist',     ko: '비관적인',   en: 'Pessimist',     emoji: '😞' },
  { id: 'perfectionist', ko: '완벽주의자', en: 'Perfectionist', emoji: '✨' },
  { id: 'impulsive',     ko: '충동적인',   en: 'Impulsive',     emoji: '⚡' },
  { id: 'cautious',      ko: '신중한',     en: 'Cautious',      emoji: '🤔' },
  { id: 'creative',      ko: '창의적인',   en: 'Creative',      emoji: '💡' },
  { id: 'honest',        ko: '솔직한',     en: 'Honest',        emoji: '🎯' },
  { id: 'sneaky',        ko: '교활한',     en: 'Sneaky',        emoji: '🦊' },
  { id: 'kindhearted',   ko: '착한',       en: 'Kind-hearted',  emoji: '💖' },
  { id: 'selfish',       ko: '이기적인',   en: 'Selfish',       emoji: '👑' },
  { id: 'mysterious',    ko: '신비로운',   en: 'Mysterious',    emoji: '🌙' },
];

// ── 특기 카드 (20개) ───────────────────────────────────────────────
export const SKILLS: Card[] = [
  { id: 'cooking',     ko: '요리',   en: 'Cooking',     emoji: '🍳' },
  { id: 'hacking',     ko: '해킹',   en: 'Hacking',     emoji: '💻' },
  { id: 'singing',     ko: '노래',   en: 'Singing',     emoji: '🎤' },
  { id: 'running',     ko: '달리기', en: 'Running',     emoji: '🏃' },
  { id: 'persuasion',  ko: '설득',   en: 'Persuasion',  emoji: '🗣️' },
  { id: 'hiding',      ko: '숨기',   en: 'Hiding',      emoji: '🫥' },
  { id: 'inventing',   ko: '발명',   en: 'Inventing',   emoji: '🔧' },
  { id: 'healing',     ko: '치료',   en: 'Healing',     emoji: '💊' },
  { id: 'fighting',    ko: '격투',   en: 'Fighting',    emoji: '🥊' },
  { id: 'navigation',  ko: '길찾기', en: 'Navigation',  emoji: '🧭' },
  { id: 'negotiation', ko: '협상',   en: 'Negotiation', emoji: '🤝' },
  { id: 'drawing',     ko: '그림',   en: 'Drawing',     emoji: '🖌️' },
  { id: 'sleeping',    ko: '잠자기', en: 'Sleeping',    emoji: '😴' },
  { id: 'eating',      ko: '먹기',   en: 'Eating',      emoji: '🍽️' },
  { id: 'lying',       ko: '거짓말', en: 'Lying',       emoji: '🤥' },
  { id: 'sensing',     ko: '감지',   en: 'Sensing',     emoji: '👁️' },
  { id: 'building',    ko: '건축',   en: 'Building',    emoji: '🏗️' },
  { id: 'tracking',    ko: '추적',   en: 'Tracking',    emoji: '🐾' },
  { id: 'magic',       ko: '마법',   en: 'Magic',       emoji: '✨' },
  { id: 'farming',     ko: '농사',   en: 'Farming',     emoji: '🌱' },
];

// ── 직업-특기 어색한 중복 방지 (V1.3 §11) ─────────────────────────
export const OBVIOUS_OVERLAP: Record<string, string> = {
  chef:     'cooking',
  hacker:   'hacking',
  farmer:   'farming',
  doctor:   'healing',
  musician: 'singing',
  athlete:  'running',
  artist:   'drawing',
  magician: 'magic',
};

// ── 미션 데이터 ───────────────────────────────────────────────────
// V1.4 §5: 1단계는 미션 1~3 완성, 4~10은 빈 껍데기만
export const MISSIONS: Mission[] = [
  // ════════════════════ 미션 1: 화성 불시착 ════════════════════
  {
    id: 'mission_01',
    emoji: '🚀',
    ko: { title: '화성 불시착', desc: '우주선이 화성에 불시착했습니다. 생존하세요.' },
    en: { title: 'Mars Crash', desc: 'Your ship crash-landed on Mars. Survive.' },
    situations: [
      // 1. 충돌 직후
      {
        text: { ko: '우주선이 충돌했다. 연기가 자욱하고 비명이 들린다. 가장 먼저 무엇을 할까?', en: 'The ship just crashed. Smoke fills the cabin and someone is screaming. What do you do first?' },
        choices: [
          { text: { ko: '동료들의 상태를 확인하고 응급조치를 한다', en: 'Check on your crewmates and provide first aid' }, tags: ['kindhearted', 'cautious', 'healing'], baseScore: 100 },
          { text: { ko: '먼저 산소·식량을 챙기고 혼자 빠져나간다', en: 'Grab oxygen and food and bail alone' }, tags: ['selfish', 'cautious', '반대_kindhearted'], baseScore: 35 },
          { text: { ko: '바로 우주선 밖으로 뛰쳐나간다', en: 'Run straight outside the wreckage' }, tags: ['impulsive', 'brave', 'running'], baseScore: 15 },
          { text: { ko: '아무것도 하지 않고 패닉에 빠진다', en: 'Freeze in panic' }, tags: ['coward', 'lazy', '반대_brave'], baseScore: 0 },
        ],
      },
      // 2. 산소 부족
      {
        text: { ko: '산소 잔량 25%. 24시간 안에 해결 못 하면 위험하다.', en: 'Oxygen at 25%. Critical within 24 hours.' },
        choices: [
          { text: { ko: '잔해 속 산소 발생기를 수리한다', en: 'Repair the oxygen generator from the wreckage' }, tags: ['genius', 'inventing', 'engineer'], baseScore: 100 },
          { text: { ko: '비상 산소통을 아껴 쓰며 구조를 기다린다', en: 'Conserve emergency oxygen and wait for rescue' }, tags: ['cautious', 'pessimist'], baseScore: 70 },
          { text: { ko: '화성 토양에서 산소를 추출할 수 있는지 시도한다', en: 'Try to extract oxygen from Martian soil' }, tags: ['curious', 'creative', 'scientist'], baseScore: 55 },
          { text: { ko: '낮잠을 잔다. 어차피 산소만 더 닳을 뿐', en: 'Take a nap. Worrying just burns more oxygen' }, tags: ['lazy', 'sleeping', '반대_perfectionist'], baseScore: 10 },
        ],
      },
      // 3. 모래폭풍
      {
        text: { ko: '거대한 화성 모래폭풍이 다가온다. 시야가 0이 될 것이다.', en: 'A massive dust storm is approaching. Visibility will drop to zero.' },
        choices: [
          { text: { ko: '우주선 잔해를 보강 후 안에서 폭풍을 견딘다', en: 'Reinforce the wreckage and ride it out inside' }, tags: ['cautious', 'building', 'engineer'], baseScore: 100 },
          { text: { ko: '근처 바위 동굴로 대피한다', en: 'Take shelter in a nearby rock cave' }, tags: ['cautious', 'hiding', 'explorer'], baseScore: 80 },
          { text: { ko: '폭풍을 뚫고 구조 신호를 보내러 나간다', en: 'Charge into the storm to send a signal' }, tags: ['brave', 'impulsive', 'running'], baseScore: 20 },
          { text: { ko: '제자리에서 모래를 막아본다', en: 'Try to block the sand barehanded' }, tags: ['clumsy', 'stubborn', '반대_cautious'], baseScore: 0 },
        ],
      },
      // 4. 통신 장비 고장
      {
        text: { ko: '지구와의 통신 장비가 망가졌다. 지원 요청이 안 닿는다.', en: 'Communication with Earth is dead. No rescue can hear you.' },
        choices: [
          { text: { ko: '부품을 분해·재조립해 임시 송신기를 만든다', en: 'Cannibalize parts to build a makeshift transmitter' }, tags: ['inventing', 'genius', 'engineer'], baseScore: 100 },
          { text: { ko: '잔해를 활용해 거대한 시각 신호를 만든다', en: 'Use wreckage to build a huge visible signal' }, tags: ['creative', 'building'], baseScore: 75 },
          { text: { ko: '아무 버튼이나 마구 눌러본다', en: 'Mash random buttons hoping something works' }, tags: ['impulsive', 'clumsy', '반대_perfectionist'], baseScore: 15 },
          { text: { ko: '통신은 포기하고 자급자족 모드로 전환', en: 'Give up on contact and go full self-sufficient' }, tags: ['pessimist', 'farming', '반대_optimist'], baseScore: 40 },
        ],
      },
      // 5. 식량 발견
      {
        text: { ko: '잔해 속에서 미스터리한 식량 상자를 발견했다. 라벨이 없다.', en: 'You find an unmarked food container in the wreckage.' },
        choices: [
          { text: { ko: '성분을 분석한 뒤 안전하면 동료와 나눈다', en: 'Analyze the contents and share if safe' }, tags: ['scientist', 'cautious', 'kindhearted'], baseScore: 100 },
          { text: { ko: '소량만 먼저 시식해 부작용을 본다', en: 'Try a small amount and watch for reactions' }, tags: ['cautious', 'eating'], baseScore: 70 },
          { text: { ko: '혼자 다 먹어버린다', en: 'Eat it all yourself' }, tags: ['greedy', 'selfish', '반대_kindhearted'], baseScore: 10 },
          { text: { ko: '안 먹는다. 굶더라도', en: 'Refuse to eat. Better hungry than poisoned' }, tags: ['coward', 'pessimist', '반대_brave'], baseScore: 30 },
        ],
      },
      // 6. 동료 부상
      {
        text: { ko: '동료가 다리를 다쳤다. 출혈이 멈추지 않는다.', en: 'A crewmate is bleeding badly from the leg.' },
        choices: [
          { text: { ko: '구급함을 찾아 지혈하고 부상을 처치한다', en: 'Find the medkit and stop the bleeding' }, tags: ['doctor', 'healing', 'kindhearted'], baseScore: 100 },
          { text: { ko: '천을 찢어 즉석 압박붕대를 만든다', en: 'Tear cloth into a makeshift bandage' }, tags: ['creative', 'cautious'], baseScore: 75 },
          { text: { ko: '동료에게 알아서 하라고 한다', en: 'Tell them to deal with it themselves' }, tags: ['selfish', 'lazy', '반대_kindhearted'], baseScore: 0 },
          { text: { ko: '울며 진정시킨다', en: 'Cry along with them' }, tags: ['coward', 'pessimist', '반대_genius'], baseScore: 15 },
        ],
      },
      // 7. 수상한 동굴
      {
        text: { ko: '근처 동굴에서 빛이 새어 나온다. 들어가 볼까?', en: 'Light leaks from a nearby cave. Investigate?' },
        choices: [
          { text: { ko: '랜턴과 표식을 가지고 신중히 들어간다', en: 'Enter cautiously with a lantern and trail markers' }, tags: ['cautious', 'explorer', 'navigation'], baseScore: 100 },
          { text: { ko: '동료를 보내 정찰시킨다', en: 'Send a teammate to scout' }, tags: ['sneaky', 'selfish'], baseScore: 45 },
          { text: { ko: '맨몸으로 뛰어 들어간다', en: 'Charge in headfirst' }, tags: ['brave', 'impulsive', '반대_cautious'], baseScore: 20 },
          { text: { ko: '무서워서 외면한다', en: 'Avoid it out of fear' }, tags: ['coward', 'pessimist', '반대_curious'], baseScore: 35 },
        ],
      },
      // 8. 물 발견
      {
        text: { ko: '얼음 형태의 물을 발견했다. 양은 충분치 않다.', en: 'You find ice — water source. But not enough for everyone.' },
        choices: [
          { text: { ko: '공정하게 배분하고 정수 장치를 만든다', en: 'Share fairly and build a purifier' }, tags: ['honest', 'kindhearted', 'inventing'], baseScore: 100 },
          { text: { ko: '하루치만 녹여 마시고 나머지는 보관', en: 'Melt only one day worth and store the rest' }, tags: ['cautious', 'perfectionist'], baseScore: 80 },
          { text: { ko: '몰래 혼자 챙긴다', en: 'Secretly hoard it' }, tags: ['sneaky', 'greedy', '반대_honest'], baseScore: 15 },
          { text: { ko: '한 번에 다 녹여 다 마신다', en: 'Melt everything and drink it all now' }, tags: ['impulsive', 'eating', '반대_cautious'], baseScore: 10 },
        ],
      },
      // 9. 구조 신호
      {
        text: { ko: '멀리서 미약한 구조선 신호가 잡힌다. 가야 할까?', en: 'A faint rescue signal reaches you. Should you head there?' },
        choices: [
          { text: { ko: '신호 출처를 정확히 파악한 뒤 안전 경로로 이동', en: 'Pinpoint the source, then move via the safest route' }, tags: ['navigation', 'cautious', 'detective'], baseScore: 100 },
          { text: { ko: '바로 신호 방향으로 출발한다', en: 'Set off in the signal direction immediately' }, tags: ['impulsive', 'brave', 'running'], baseScore: 55 },
          { text: { ko: '함정일 거라 무시한다', en: 'Assume it is a trap and ignore it' }, tags: ['pessimist', 'mysterious', '반대_optimist'], baseScore: 25 },
          { text: { ko: '신호기에 응답해 본다', en: 'Try to reply on the signal' }, tags: ['optimist', 'curious'], baseScore: 75 },
        ],
      },
      // 10. 최종 결정
      {
        text: { ko: '구조선이 도착했지만 자리는 한 자리 부족하다.', en: 'Rescue arrived — but one seat short.' },
        choices: [
          { text: { ko: '한 명은 다음 구조를 기다리기로 함께 합의', en: 'Agree together that one will wait for the next ride' }, tags: ['kindhearted', 'negotiation', 'honest'], baseScore: 100 },
          { text: { ko: '내가 자원해서 남는다', en: 'Volunteer yourself to stay behind' }, tags: ['brave', 'kindhearted', 'selfless'], baseScore: 90 },
          { text: { ko: '제비뽑기를 한다', en: 'Draw lots' }, tags: ['honest', 'optimist'], baseScore: 70 },
          { text: { ko: '제일 약한 동료를 떼어놓고 떠난다', en: 'Leave the weakest one behind' }, tags: ['selfish', 'sneaky', '반대_kindhearted'], baseScore: 0 },
        ],
      },
    ],
  },

  // ════════════════════ 미션 2: 무인도 탈출 ════════════════════
  {
    id: 'mission_02',
    emoji: '🏝️',
    ko: { title: '무인도 탈출', desc: '폭풍으로 무인도에 표류했습니다. 탈출하세요.' },
    en: { title: 'Island Escape', desc: 'Stranded on a deserted island. Escape.' },
    situations: [
      // 1. 표류 직후
      {
        text: { ko: '해변에서 깨어났다. 흠뻑 젖은 채로. 무엇부터?', en: 'You wake on a beach, soaking wet. What first?' },
        choices: [
          { text: { ko: '몸을 말리고 주변 환경부터 파악한다', en: 'Dry off and scan the surroundings' }, tags: ['cautious', 'sensing', 'explorer'], baseScore: 100 },
          { text: { ko: '바로 식수와 식량을 찾으러 간다', en: 'Immediately search for water and food' }, tags: ['impulsive', 'cautious'], baseScore: 75 },
          { text: { ko: '해변에서 SOS를 외친다', en: 'Yell SOS at the empty beach' }, tags: ['coward', 'talkative', '반대_genius'], baseScore: 20 },
          { text: { ko: '드러누워 운명에 맡긴다', en: 'Lay down and let fate decide' }, tags: ['lazy', 'pessimist', 'sleeping'], baseScore: 5 },
        ],
      },
      // 2. 식수
      {
        text: { ko: '바다는 마실 수 없다. 식수 확보가 시급하다.', en: 'Seawater is undrinkable. You need fresh water now.' },
        choices: [
          { text: { ko: '비닐로 빗물 정수 장치를 만든다', en: 'Build a rain-catch and filtration with plastic' }, tags: ['inventing', 'creative', 'engineer'], baseScore: 100 },
          { text: { ko: '코코넛 등 과일에서 수분을 얻는다', en: 'Get water from coconuts and fruit' }, tags: ['farming', 'eating', 'explorer'], baseScore: 80 },
          { text: { ko: '근처 시냇물을 그냥 마신다', en: 'Drink directly from a stream' }, tags: ['impulsive', '반대_cautious'], baseScore: 35 },
          { text: { ko: '바닷물을 끓여 마신다', en: 'Boil seawater and drink' }, tags: ['clumsy', '반대_scientist'], baseScore: 0 },
        ],
      },
      // 3. 야생동물
      {
        text: { ko: '거대한 멧돼지가 야영지 근처를 어슬렁거린다.', en: 'A huge boar is prowling near your camp.' },
        choices: [
          { text: { ko: '소음·연기로 거리를 두고 안전지대를 만든다', en: 'Use noise and smoke to keep distance and secure the perimeter' }, tags: ['cautious', 'building', 'detective'], baseScore: 100 },
          { text: { ko: '함정을 파서 잡고 식량으로 쓴다', en: 'Dig a pit trap and use it as food' }, tags: ['creative', 'fighting', 'tracking'], baseScore: 85 },
          { text: { ko: '맨손으로 대결한다', en: 'Fight it bare-handed' }, tags: ['brave', 'fighting', '반대_cautious'], baseScore: 10 },
          { text: { ko: '울면서 도망친다', en: 'Run away crying' }, tags: ['coward', 'running', '반대_brave'], baseScore: 30 },
        ],
      },
      // 4. 뗏목 설계
      {
        text: { ko: '뗏목을 만들어 탈출해야 한다. 설계가 필요하다.', en: 'You need to build a raft to escape. Plan it first.' },
        choices: [
          { text: { ko: '재료·하중·해류를 계산한 뒤 설계도를 그린다', en: 'Calculate materials, load, currents — then draft a plan' }, tags: ['genius', 'scientist', 'drawing'], baseScore: 100 },
          { text: { ko: '대나무를 묶어 일단 만들어본다', en: 'Bundle bamboo and try it out' }, tags: ['creative', 'building', 'impulsive'], baseScore: 65 },
          { text: { ko: '큰 나뭇잎 위에 누워 떠본다', en: 'Lay on a big leaf and float' }, tags: ['clumsy', 'lazy', '반대_genius'], baseScore: 5 },
          { text: { ko: '병에 메시지를 띄워 보낸다', en: 'Toss a message in a bottle instead' }, tags: ['optimist', 'creative', 'mysterious'], baseScore: 40 },
        ],
      },
      // 5. 동료 의견 충돌
      {
        text: { ko: '함께 표류한 동료가 내 계획에 반대한다.', en: 'A fellow castaway disagrees with your plan.' },
        choices: [
          { text: { ko: '근거를 제시하며 차분히 설득한다', en: 'Calmly present evidence and persuade them' }, tags: ['persuasion', 'negotiation', 'honest'], baseScore: 100 },
          { text: { ko: '서로의 계획 장단점을 비교한다', en: 'Compare pros and cons of both plans' }, tags: ['cautious', 'detective', 'perfectionist'], baseScore: 85 },
          { text: { ko: '고집을 부리며 강행한다', en: 'Bull through with my plan anyway' }, tags: ['stubborn', 'selfish', '반대_kindhearted'], baseScore: 30 },
          { text: { ko: '갈라서서 각자 행동한다', en: 'Split up and act alone' }, tags: ['selfish', 'impulsive', '반대_kindhearted'], baseScore: 25 },
        ],
      },
      // 6. 비밀스러운 동굴
      {
        text: { ko: '동굴 안에 옛 해적의 흔적이 있다. 보물 지도?', en: 'Inside a cave, signs of old pirates. A treasure map?' },
        choices: [
          { text: { ko: '단서를 기록하고 우선순위는 탈출에 둔다', en: 'Record clues but prioritize escape' }, tags: ['perfectionist', 'archaeologist', 'cautious'], baseScore: 100 },
          { text: { ko: '지도를 분석해 보물을 찾는다', en: 'Analyze the map and seek treasure' }, tags: ['curious', 'detective', 'greedy'], baseScore: 70 },
          { text: { ko: '바로 보물 찾기에 몰두한다', en: 'Drop everything and hunt treasure' }, tags: ['greedy', 'impulsive', '반대_cautious'], baseScore: 25 },
          { text: { ko: '저주가 무서워 동굴을 떠난다', en: 'Flee the cave fearing a curse' }, tags: ['coward', 'pessimist'], baseScore: 50 },
        ],
      },
      // 7. 식량 부족
      {
        text: { ko: '저장한 식량이 떨어졌다. 사냥·채집해야 한다.', en: 'Your stored food is gone. Time to hunt or forage.' },
        choices: [
          { text: { ko: '안전한 과일·물고기를 분류해 채집한다', en: 'Sort safe fruit/fish and forage methodically' }, tags: ['scientist', 'farming', 'cautious'], baseScore: 100 },
          { text: { ko: '낚시 도구를 만들어 잡는다', en: 'Craft a fishing rig and catch fish' }, tags: ['inventing', 'fishing', 'patience'], baseScore: 85 },
          { text: { ko: '눈에 보이는 건 다 먹는다', en: 'Eat anything in sight' }, tags: ['impulsive', 'eating', '반대_cautious'], baseScore: 10 },
          { text: { ko: '굶기로 한다', en: 'Choose to fast' }, tags: ['stubborn', 'pessimist'], baseScore: 20 },
        ],
      },
      // 8. 통과 가능한 폭풍
      {
        text: { ko: '뗏목을 완성했지만 폭풍이 다가온다.', en: 'Raft is done but a storm approaches.' },
        choices: [
          { text: { ko: '폭풍이 지나가길 기다린 후 출항한다', en: 'Wait until the storm passes, then launch' }, tags: ['cautious', 'perfectionist'], baseScore: 100 },
          { text: { ko: '뗏목을 더 단단히 보강하고 결정한다', en: 'Reinforce the raft first, then decide' }, tags: ['perfectionist', 'building'], baseScore: 90 },
          { text: { ko: '폭풍 직전에 빠르게 출항한다', en: 'Launch right before the storm hits' }, tags: ['impulsive', 'brave', '반대_cautious'], baseScore: 25 },
          { text: { ko: '뗏목을 버리고 동굴에 숨는다', en: 'Abandon the raft and hide in a cave' }, tags: ['coward', 'hiding', '반대_brave'], baseScore: 35 },
        ],
      },
      // 9. 항해 중 길 잃음
      {
        text: { ko: '바다 한가운데 길을 잃었다.', en: 'Lost in the middle of the sea.' },
        choices: [
          { text: { ko: '별·해류로 방향을 추정해 항로 수정', en: 'Use stars and currents to correct course' }, tags: ['navigation', 'genius', 'pilot'], baseScore: 100 },
          { text: { ko: '연기 신호로 지나가는 배에게 도움 요청', en: 'Smoke-signal passing ships for help' }, tags: ['creative', 'persuasion'], baseScore: 70 },
          { text: { ko: '아무 방향으로나 노를 젓는다', en: 'Row in any direction' }, tags: ['impulsive', 'clumsy', '반대_navigation'], baseScore: 15 },
          { text: { ko: '뗏목에 누워 잔다', en: 'Lay down and sleep on the raft' }, tags: ['lazy', 'sleeping', '반대_perfectionist'], baseScore: 0 },
        ],
      },
      // 10. 구조선 발견
      {
        text: { ko: '저 멀리 어선이 보인다. 어떻게 신호를 보낼까?', en: 'A fishing boat in the distance. How to signal?' },
        choices: [
          { text: { ko: '거울·플래시로 정확히 SOS 부호를 보낸다', en: 'Mirror/flash an exact SOS code' }, tags: ['genius', 'sensing', 'detective'], baseScore: 100 },
          { text: { ko: '큰 천을 흔든다', en: 'Wave a large cloth' }, tags: ['talkative', 'optimist'], baseScore: 75 },
          { text: { ko: '있는 힘껏 소리친다', en: 'Scream as loud as you can' }, tags: ['talkative', 'impulsive'], baseScore: 30 },
          { text: { ko: '신호를 안 보내고 운에 맡긴다', en: 'Skip signaling and hope for luck' }, tags: ['lazy', 'pessimist', '반대_brave'], baseScore: 5 },
        ],
      },
    ],
  },

  // ════════════════════ 미션 3: 용을 처치하라 ════════════════════
  {
    id: 'mission_03',
    emoji: '🐉',
    ko: { title: '용을 처치하라', desc: '왕국을 위협하는 용을 처치해야 합니다.' },
    en: { title: 'Slay the Dragon', desc: 'Defeat the dragon threatening the kingdom.' },
    situations: [
      // 1. 의뢰 수락
      {
        text: { ko: '왕이 용 처치를 의뢰한다. 보상은 막대하지만 위험하다.', en: 'The king offers the contract. Massive reward, deadly risk.' },
        choices: [
          { text: { ko: '용의 약점·서식지·이력을 조사 후 수락한다', en: 'Research weakness, lair, history first, then accept' }, tags: ['cautious', 'detective', 'archaeologist'], baseScore: 100 },
          { text: { ko: '바로 수락하고 출발한다', en: 'Accept and head out immediately' }, tags: ['brave', 'impulsive', 'knight'], baseScore: 55 },
          { text: { ko: '보상만 챙기고 도망간다', en: 'Take the down payment and flee' }, tags: ['sneaky', 'greedy', '반대_honest'], baseScore: 10 },
          { text: { ko: '거절한다', en: 'Decline the mission' }, tags: ['coward', 'pessimist', '반대_brave'], baseScore: 0 },
        ],
      },
      // 2. 장비 준비
      {
        text: { ko: '용을 만나러 가기 전 장비를 준비해야 한다.', en: 'You need gear before facing the dragon.' },
        choices: [
          { text: { ko: '용의 화염에 강한 방어구·무기를 맞춤 제작', en: 'Custom-craft fire-resistant armor and weapons' }, tags: ['inventing', 'perfectionist', 'engineer'], baseScore: 100 },
          { text: { ko: '기본 검과 방패만 들고 간다', en: 'Bring just a sword and shield' }, tags: ['brave', 'fighting', 'knight'], baseScore: 65 },
          { text: { ko: '맨몸으로 간다', en: 'Go bare-handed' }, tags: ['stubborn', 'impulsive', '반대_cautious'], baseScore: 5 },
          { text: { ko: '용을 잠재울 약초를 챙긴다', en: 'Pack herbs to sedate the dragon' }, tags: ['creative', 'healing', 'sneaky'], baseScore: 85 },
        ],
      },
      // 3. 용의 둥지로 가는 길
      {
        text: { ko: '용의 둥지로 가는 길에 산적이 나타났다.', en: 'On the way to the lair, bandits appear.' },
        choices: [
          { text: { ko: '협상해서 통과한다', en: 'Negotiate safe passage' }, tags: ['negotiation', 'persuasion', 'detective'], baseScore: 100 },
          { text: { ko: '돈을 주고 보낸다', en: 'Bribe them to leave' }, tags: ['greedy', 'cautious'], baseScore: 75 },
          { text: { ko: '곧장 싸운다', en: 'Fight them outright' }, tags: ['brave', 'fighting', 'impulsive'], baseScore: 50 },
          { text: { ko: '도망친다', en: 'Run away' }, tags: ['coward', 'running', '반대_brave'], baseScore: 35 },
        ],
      },
      // 4. 마법 학자 만남
      {
        text: { ko: '용의 약점을 안다는 마법 학자를 만났다.', en: 'You meet a sage who claims to know the dragon\'s weakness.' },
        choices: [
          { text: { ko: '교환 조건을 협의 후 정보를 얻는다', en: 'Negotiate terms and obtain the info' }, tags: ['negotiation', 'cautious', 'magician'], baseScore: 100 },
          { text: { ko: '돈을 주고 정보만 사간다', en: 'Pay cash and walk away with the info' }, tags: ['greedy', 'detective'], baseScore: 75 },
          { text: { ko: '믿지 않고 무시한다', en: 'Ignore — could be a lie' }, tags: ['stubborn', 'pessimist', '반대_curious'], baseScore: 30 },
          { text: { ko: '학자를 협박한다', en: 'Threaten the sage' }, tags: ['selfish', 'impulsive', '반대_kindhearted'], baseScore: 10 },
        ],
      },
      // 5. 용의 둥지 진입
      {
        text: { ko: '용의 둥지에 도착했다. 어떻게 진입할까?', en: 'You\'ve reached the lair. How to enter?' },
        choices: [
          { text: { ko: '몰래 잠입해 위치·상태를 정찰한다', en: 'Sneak in to scout position and condition' }, tags: ['hiding', 'sneaky', 'ninja'], baseScore: 100 },
          { text: { ko: '정문으로 당당히 들어간다', en: 'March straight through the main entry' }, tags: ['brave', 'honest', 'knight'], baseScore: 60 },
          { text: { ko: '연기로 용을 끌어낸 후 진입', en: 'Smoke the dragon out, then enter' }, tags: ['creative', 'inventing'], baseScore: 90 },
          { text: { ko: '폭탄으로 입구를 파괴한다', en: 'Blow open the entrance' }, tags: ['impulsive', 'fighting', '반대_cautious'], baseScore: 25 },
        ],
      },
      // 6. 새끼 용
      {
        text: { ko: '둥지 안에 새끼 용이 있다.', en: 'Inside the lair: baby dragons.' },
        choices: [
          { text: { ko: '안전하게 살려두고 우회한다', en: 'Spare them, take the longer route' }, tags: ['kindhearted', 'cautious', 'honest'], baseScore: 100 },
          { text: { ko: '잠재워 보호하면서 통과한다', en: 'Sedate them and pass safely' }, tags: ['creative', 'healing', 'magic'], baseScore: 90 },
          { text: { ko: '하나를 데려가 길들인다', en: 'Take one to tame later' }, tags: ['greedy', 'curious', 'mysterious'], baseScore: 65 },
          { text: { ko: '모두 처치한다', en: 'Kill them all' }, tags: ['selfish', 'fighting', '반대_kindhearted'], baseScore: 0 },
        ],
      },
      // 7. 용과 첫 대치
      {
        text: { ko: '용이 깨어났다. 거대한 화염을 뿜으려 한다.', en: 'The dragon wakes — about to breathe fire.' },
        choices: [
          { text: { ko: '엄폐물 뒤로 피하며 약점을 노린다', en: 'Take cover, aim for the weak spot' }, tags: ['cautious', 'detective', 'sensing'], baseScore: 100 },
          { text: { ko: '큰 소리로 도발해 주의를 끈다', en: 'Taunt loudly to grab attention' }, tags: ['talkative', 'brave'], baseScore: 70 },
          { text: { ko: '바로 돌진해 검을 휘두른다', en: 'Charge in swinging' }, tags: ['brave', 'impulsive', 'fighting'], baseScore: 35 },
          { text: { ko: '눈을 감고 기도한다', en: 'Close eyes and pray' }, tags: ['coward', 'pessimist', '반대_brave'], baseScore: 5 },
        ],
      },
      // 8. 동료 위기
      {
        text: { ko: '동료가 용의 발톱에 잡혔다. 어떻게 구할까?', en: 'A teammate is caught in the dragon\'s claw.' },
        choices: [
          { text: { ko: '연기·소음으로 발톱을 풀게 유도', en: 'Use smoke/noise to make it release the grip' }, tags: ['creative', 'inventing', 'persuasion'], baseScore: 100 },
          { text: { ko: '발에 무기를 정확히 꽂는다', en: 'Strike the foot precisely' }, tags: ['perfectionist', 'fighting', 'knight'], baseScore: 85 },
          { text: { ko: '바로 화염 속으로 뛰어든다', en: 'Charge into the flames' }, tags: ['brave', 'impulsive', '반대_cautious'], baseScore: 30 },
          { text: { ko: '동료를 포기하고 도망친다', en: 'Abandon them and flee' }, tags: ['selfish', 'coward', '반대_kindhearted'], baseScore: 0 },
        ],
      },
      // 9. 결정적 한방
      {
        text: { ko: '용이 약점을 노출했다. 한 번의 기회다.', en: 'The dragon exposes its weak spot. One chance.' },
        choices: [
          { text: { ko: '호흡을 가다듬고 약점을 정확히 노린다', en: 'Steady breath, aim precisely at the weak spot' }, tags: ['perfectionist', 'cautious', 'genius'], baseScore: 100 },
          { text: { ko: '온 힘을 다해 내리친다', en: 'Strike with all your might' }, tags: ['brave', 'fighting', 'athlete'], baseScore: 80 },
          { text: { ko: '동료가 쳐주길 기다린다', en: 'Wait for a teammate to strike' }, tags: ['lazy', 'cautious', '반대_brave'], baseScore: 30 },
          { text: { ko: '망설이며 기회를 놓친다', en: 'Hesitate and miss the chance' }, tags: ['coward', 'pessimist', '반대_brave'], baseScore: 5 },
        ],
      },
      // 10. 마지막 결정
      {
        text: { ko: '용이 마지막 숨을 내쉰다. 자비를 베풀까?', en: 'The dragon takes its last breath. Show mercy?' },
        choices: [
          { text: { ko: '왕에게 데려가 평화 협상에 활용', en: 'Bring it to the king for peace negotiation' }, tags: ['negotiation', 'kindhearted', 'creative'], baseScore: 100 },
          { text: { ko: '편안히 보내고 명복을 빈다', en: 'End it humanely, pay respects' }, tags: ['kindhearted', 'honest'], baseScore: 90 },
          { text: { ko: '비늘만 챙기고 떠난다', en: 'Take the scales and leave' }, tags: ['greedy', 'sneaky'], baseScore: 55 },
          { text: { ko: '모든 부위를 잘라 비싸게 판다', en: 'Harvest every part to sell' }, tags: ['greedy', 'selfish', '반대_kindhearted'], baseScore: 15 },
        ],
      },
    ],
  },

  // ════════════════════ 미션 4~10: 빈 껍데기 (2,3단계에서 채움) ════════════════════
  { id: 'mission_04', emoji: '🏦', ko: { title: '은행 강도 막기', desc: '은행 강도 사건이 발생했습니다. 해결하세요.' },         en: { title: 'Stop the Robbery',  desc: 'A bank robbery is happening. Stop it.' },                 situations: [] },
  { id: 'mission_05', emoji: '🧟', ko: { title: '좀비 아포칼립스', desc: '좀비가 도시를 덮쳤습니다. 살아남으세요.' },         en: { title: 'Zombie Outbreak',   desc: 'Zombies overrun the city. Survive.' },                  situations: [] },
  { id: 'mission_06', emoji: '👨‍🍳', ko: { title: '요리 대결',     desc: '세계 최고의 요리사와 대결해야 합니다.' },             en: { title: 'Cooking Battle',    desc: "Compete against the world's best chef." },             situations: [] },
  { id: 'mission_07', emoji: '🏴‍☠️', ko: { title: '우주 해적 탈출', desc: '우주 해적에게 납치됐습니다. 탈출하세요.' },          en: { title: 'Space Pirates',     desc: 'Captured by space pirates. Escape.' },                  situations: [] },
  { id: 'mission_08', emoji: '⏰', ko: { title: '타임머신 고장',     desc: '타임머신이 고장났습니다. 현재로 돌아오세요.' },       en: { title: 'Time Malfunction',  desc: 'Time machine broke. Get back to present.' },            situations: [] },
  { id: 'mission_09', emoji: '📝', ko: { title: '학교 시험 위기',   desc: '내일 시험인데 아무것도 모릅니다. 통과하세요.' },     en: { title: 'Exam Crisis',       desc: 'Exam tomorrow, you know nothing. Pass it.' },           situations: [] },
  { id: 'mission_10', emoji: '👽', ko: { title: '외계인 협상',       desc: '지구를 침략하려는 외계인과 협상하세요.' },           en: { title: 'Alien Negotiation', desc: 'Negotiate with aliens planning to invade Earth.' },     situations: [] },
];
