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

  // ════════════════════ 미션 4: 은행 강도 막기 ════════════════════
  {
    id: 'mission_04',
    emoji: '🏦',
    ko: { title: '은행 강도 막기', desc: '은행 강도 사건이 발생했습니다. 해결하세요.' },
    en: { title: 'Stop the Robbery', desc: 'A bank robbery is happening. Stop it.' },
    situations: [
      // 1. 강도 진입 발견
      {
        text: { ko: '복면 강도 3명이 은행에 진입한다. 당신이 가장 먼저 눈치챘다.', en: 'Three masked robbers enter the bank. You spotted them first.' },
        choices: [
          { text: { ko: '몰래 신고 버튼을 누르고 상황을 관찰한다', en: 'Quietly press the alarm and observe the situation' }, tags: ['cautious', 'sensing', 'detective'], baseScore: 100 },
          { text: { ko: '큰 소리로 강도라고 외친다', en: 'Shout "robbery!" out loud' }, tags: ['brave', 'talkative', '반대_cautious'], baseScore: 25 },
          { text: { ko: '바로 강도와 맞붙는다', en: 'Charge the robbers immediately' }, tags: ['brave', 'fighting', '반대_cautious'], baseScore: 30 },
          { text: { ko: '눈치 못 챈 척 가만히 있는다', en: 'Pretend you noticed nothing and freeze' }, tags: ['coward', 'lazy', '반대_brave'], baseScore: 15 },
        ],
      },
      // 2. 인질 발생
      {
        text: { ko: '강도들이 손님들을 인질로 잡았다. 자신은 아직 발견되지 않았다.', en: 'The robbers take customers hostage. You\'re still unnoticed.' },
        choices: [
          { text: { ko: '인질 위치와 강도 동선을 메모해 경찰에 전달', en: 'Note hostage positions and robber routes; relay to police' }, tags: ['detective', 'sensing', 'genius'], baseScore: 100 },
          { text: { ko: '소리 없이 화장실로 이동해 신고를 길게 한다', en: 'Slip into the restroom and stay on the call' }, tags: ['sneaky', 'hiding', 'spy'], baseScore: 85 },
          { text: { ko: '인질들에게 진정하라고 큰 소리로 안내', en: 'Loudly tell hostages to stay calm' }, tags: ['talkative', 'kindhearted', '반대_cautious'], baseScore: 25 },
          { text: { ko: '동요하며 다른 인질에게 매달린다', en: 'Panic and cling to another hostage' }, tags: ['coward', 'pessimist', '반대_brave'], baseScore: 5 },
        ],
      },
      // 3. 강도 요구
      {
        text: { ko: '강도 두목이 "현금 옮길 사람 한 명!" 외쳤다. 자원할까?', en: 'The lead robber shouts "I need one person to move cash!" Volunteer?' },
        choices: [
          { text: { ko: '자원해서 시간 끌며 강도 정보를 모은다', en: 'Volunteer to stall and gather intel on the robbers' }, tags: ['brave', 'detective', 'spy'], baseScore: 100 },
          { text: { ko: '자원하지만 일부러 느리게 움직인다', en: 'Volunteer but move deliberately slowly' }, tags: ['sneaky', 'cautious', 'lying'], baseScore: 85 },
          { text: { ko: '자원해서 가방을 들고 도망친다', en: 'Volunteer, grab the bag, and run' }, tags: ['impulsive', 'running', '반대_cautious'], baseScore: 25 },
          { text: { ko: '엎드려 못 본 척한다', en: 'Stay flat and look invisible' }, tags: ['coward', 'hiding', '반대_brave'], baseScore: 40 },
        ],
      },
      // 4. 경찰 도착
      {
        text: { ko: '경찰차 사이렌이 멀리서 들린다. 강도들이 인질을 방패로 삼으려 한다.', en: 'Police sirens approach. The robbers want to use hostages as shields.' },
        choices: [
          { text: { ko: '인질들에게 신호로 협력해 동시에 흩어지게 유도', en: 'Signal hostages to scatter simultaneously' }, tags: ['genius', 'persuasion', 'detective'], baseScore: 100 },
          { text: { ko: '강도와 협상해 인질을 풀어주게 한다', en: 'Negotiate with the robbers to release hostages' }, tags: ['negotiation', 'persuasion', 'kindhearted'], baseScore: 90 },
          { text: { ko: '경찰이 들어올 때 도망친다', en: 'Make a break for it when police breach' }, tags: ['running', 'cautious'], baseScore: 55 },
          { text: { ko: '강도에게 협력하겠다고 한다', en: 'Tell the robbers you\'ll help them' }, tags: ['selfish', 'lying', '반대_honest'], baseScore: 10 },
        ],
      },
      // 5. 결정적 순간
      {
        text: { ko: '강도 한 명이 잠시 무기를 내려놓았다. 1~2초 빈틈이다.', en: 'One robber sets the weapon down for 1-2 seconds.' },
        choices: [
          { text: { ko: '재빨리 무기를 차단·확보하고 인질을 안전 위치로', en: 'Snatch/disable the weapon, move hostages to safety' }, tags: ['brave', 'sensing', 'knight'], baseScore: 100 },
          { text: { ko: '근처 의자나 도구로 강도를 제압', en: 'Subdue the robber with a chair or nearby object' }, tags: ['creative', 'fighting', 'impulsive'], baseScore: 80 },
          { text: { ko: '강도에게 큰 소리로 위협한다', en: 'Yell threats at the robber' }, tags: ['talkative', 'brave'], baseScore: 35 },
          { text: { ko: '아무것도 안 한다', en: 'Do nothing' }, tags: ['lazy', 'coward', '반대_brave'], baseScore: 5 },
        ],
      },
      // 6. 도주 차량
      {
        text: { ko: '강도들의 도주 차량이 정문 앞에 대기 중이다.', en: 'The getaway vehicle is waiting at the front entrance.' },
        choices: [
          { text: { ko: '차량 번호판과 모델을 정확히 외워 경찰에 전달', en: 'Memorize plate and model precisely, relay to police' }, tags: ['detective', 'genius', 'sensing'], baseScore: 100 },
          { text: { ko: '몰래 차 키나 타이어를 손본다', en: 'Sneak out and sabotage the keys or tires' }, tags: ['sneaky', 'inventing', 'spy'], baseScore: 85 },
          { text: { ko: '차량을 향해 돌진해 막아선다', en: 'Run at the car and block it' }, tags: ['brave', 'running', '반대_cautious'], baseScore: 25 },
          { text: { ko: '아무 차나 도주 차량인 척 가리킨다', en: 'Point at random cars as the getaway' }, tags: ['clumsy', 'lying', '반대_perfectionist'], baseScore: 10 },
        ],
      },
      // 7. 어린이 인질
      {
        text: { ko: '울고 있는 어린이가 강도 가까이 있다.', en: 'A crying child is right next to the robber.' },
        choices: [
          { text: { ko: '부드러운 말로 어린이를 진정시키며 안전 거리로 유도', en: 'Calmly soothe the child and guide them to safety' }, tags: ['kindhearted', 'persuasion', 'teacher'], baseScore: 100 },
          { text: { ko: '눈에 띄지 않게 어린이 옆으로 다가가 보호', en: 'Quietly move next to the child to shield them' }, tags: ['cautious', 'kindhearted', 'hiding'], baseScore: 90 },
          { text: { ko: '어린이를 안고 즉시 달려나간다', en: 'Grab the child and sprint out' }, tags: ['impulsive', 'brave', 'running'], baseScore: 60 },
          { text: { ko: '어린이를 외면한다', en: 'Look the other way' }, tags: ['selfish', 'coward', '반대_kindhearted'], baseScore: 0 },
        ],
      },
      // 8. 강도의 정체 단서
      {
        text: { ko: '한 강도의 복면이 흘러내려 얼굴 일부가 보였다.', en: 'One robber\'s mask slips, briefly exposing part of their face.' },
        choices: [
          { text: { ko: '특징을 머릿속에 정확히 기록한다 (흉터·문신·치아 등)', en: 'Mentally record details — scars, tattoos, teeth' }, tags: ['detective', 'sensing', 'spy'], baseScore: 100 },
          { text: { ko: '몰래 휴대폰으로 사진을 찍는다', en: 'Secretly snap a photo with your phone' }, tags: ['sneaky', 'spy', 'cautious'], baseScore: 90 },
          { text: { ko: '큰 소리로 "얼굴 봤어!"라고 외친다', en: 'Shout "I saw your face!" out loud' }, tags: ['talkative', 'impulsive', '반대_cautious'], baseScore: 10 },
          { text: { ko: '못 본 척하고 시선을 돌린다', en: 'Pretend not to notice and look away' }, tags: ['coward', 'hiding'], baseScore: 50 },
        ],
      },
      // 9. 폭탄 발견
      {
        text: { ko: '강도가 "폭탄을 설치했다"고 위협한다. 진짜인지 확인이 필요하다.', en: 'A robber claims a bomb is planted. Is it real?' },
        choices: [
          { text: { ko: '강도 행동·언어를 분석해 허세인지 판단', en: 'Analyze the robber\'s behavior and language for a bluff' }, tags: ['detective', 'sensing', 'genius'], baseScore: 100 },
          { text: { ko: '눈에 띄는 의심 물건을 차분히 확인', en: 'Calmly inspect any suspicious objects in view' }, tags: ['cautious', 'engineer', 'inventing'], baseScore: 85 },
          { text: { ko: '바로 폭탄이라고 믿고 대피한다', en: 'Believe it immediately and evacuate' }, tags: ['coward', 'impulsive', '반대_cautious'], baseScore: 40 },
          { text: { ko: '강도에게 폭탄 위치를 물어본다', en: 'Ask the robber where the bomb is' }, tags: ['curious', 'honest', '반대_genius'], baseScore: 20 },
        ],
      },
      // 10. 마무리
      {
        text: { ko: '강도가 모두 체포됐다. 경찰이 진술을 요청한다.', en: 'All robbers are arrested. Police ask for your statement.' },
        choices: [
          { text: { ko: '정확하고 사실에 기반한 진술을 제공', en: 'Provide an accurate fact-based statement' }, tags: ['honest', 'detective', 'perfectionist'], baseScore: 100 },
          { text: { ko: '인질들과 협력해 종합 정보를 정리해 제출', en: 'Coordinate with hostages to compile a full account' }, tags: ['kindhearted', 'negotiation', 'teacher'], baseScore: 95 },
          { text: { ko: '극적으로 부풀려서 영웅 인터뷰를 노린다', en: 'Embellish dramatically to score a hero interview' }, tags: ['greedy', 'lying', '반대_honest'], baseScore: 25 },
          { text: { ko: '진술을 거부하고 자리를 뜬다', en: 'Refuse to give a statement and leave' }, tags: ['selfish', 'lazy', '반대_kindhearted'], baseScore: 10 },
        ],
      },
    ],
  },

  // ════════════════════ 미션 5: 좀비 아포칼립스 ════════════════════
  {
    id: 'mission_05',
    emoji: '🧟',
    ko: { title: '좀비 아포칼립스', desc: '좀비가 도시를 덮쳤습니다. 살아남으세요.' },
    en: { title: 'Zombie Outbreak', desc: 'Zombies overrun the city. Survive.' },
    situations: [
      // 1. 발발 직후
      {
        text: { ko: '뉴스에 따르면 좀비가 도시 전역으로 확산 중이다. 집에 혼자다.', en: 'News reports zombies spreading citywide. You\'re home alone.' },
        choices: [
          { text: { ko: '문·창문을 보강하고 식량·물·약품 점검', en: 'Reinforce doors/windows, audit food, water, meds' }, tags: ['cautious', 'building', 'engineer'], baseScore: 100 },
          { text: { ko: '바로 차에 짐 싣고 안전 지역으로 출발', en: 'Pack the car and drive to a safe zone' }, tags: ['impulsive', 'pilot', 'running'], baseScore: 70 },
          { text: { ko: '소셜미디어로 상황 생중계한다', en: 'Live-stream the chaos on social media' }, tags: ['talkative', 'curious', '반대_cautious'], baseScore: 20 },
          { text: { ko: '낮잠을 잔다. 어차피 끝났다', en: 'Take a nap, it\'s over anyway' }, tags: ['lazy', 'pessimist', 'sleeping'], baseScore: 0 },
        ],
      },
      // 2. 이웃집 소리
      {
        text: { ko: '이웃집에서 비명이 들린다. 좀비인지 사람인지 모른다.', en: 'Screams from a neighbor\'s house. Zombie or survivor?' },
        choices: [
          { text: { ko: '몰래 살피며 상황을 정확히 파악 후 대응', en: 'Quietly observe to assess before acting' }, tags: ['cautious', 'sensing', 'detective'], baseScore: 100 },
          { text: { ko: '큰 소리 없이 다가가 도움을 준비한다', en: 'Approach silently with help ready' }, tags: ['kindhearted', 'cautious', 'hiding'], baseScore: 90 },
          { text: { ko: '바로 문을 부수고 들어간다', en: 'Smash in the door immediately' }, tags: ['brave', 'impulsive', '반대_cautious'], baseScore: 30 },
          { text: { ko: '못 들은 척 무시한다', en: 'Pretend you didn\'t hear' }, tags: ['selfish', 'coward', '반대_kindhearted'], baseScore: 25 },
        ],
      },
      // 3. 무기 확보
      {
        text: { ko: '집안에서 무기를 만들어야 한다. 시간이 없다.', en: 'You need a weapon from household items. No time to spare.' },
        choices: [
          { text: { ko: '효율적이고 안전한 근접 무기를 골라 제작', en: 'Craft an efficient, safe melee weapon' }, tags: ['inventing', 'engineer', 'creative'], baseScore: 100 },
          { text: { ko: '야구방망이·식칼 등 즉시 사용 가능 무기 챙김', en: 'Grab a bat, kitchen knife — ready-to-use weapons' }, tags: ['cautious', 'fighting', 'athlete'], baseScore: 85 },
          { text: { ko: '복잡한 함정 무기를 만들려 한다', en: 'Try to build an over-complicated trap weapon' }, tags: ['perfectionist', 'creative', '반대_impulsive'], baseScore: 55 },
          { text: { ko: '무기 없이 맨손으로 충분하다고 생각', en: 'Decide bare hands are enough' }, tags: ['brave', 'stubborn', '반대_cautious'], baseScore: 5 },
        ],
      },
      // 4. 대피 경로
      {
        text: { ko: '도시를 떠나야 한다. 어떤 경로로?', en: 'You must leave the city. Which route?' },
        choices: [
          { text: { ko: '지도·뉴스 종합해 좀비 밀도가 낮은 우회로 선택', en: 'Cross-reference maps and news for low-density routes' }, tags: ['navigation', 'detective', 'genius'], baseScore: 100 },
          { text: { ko: '주요 도로를 피하고 시골길로 우회', en: 'Avoid main roads, take rural backroads' }, tags: ['cautious', 'navigation', 'farmer'], baseScore: 85 },
          { text: { ko: '가장 빠른 직선 도로로 돌진', en: 'Floor it straight down the fastest highway' }, tags: ['impulsive', 'running', '반대_cautious'], baseScore: 30 },
          { text: { ko: '경로를 정하지 않고 일단 출발', en: 'Just drive — figure out the route later' }, tags: ['lazy', 'impulsive', '반대_perfectionist'], baseScore: 15 },
        ],
      },
      // 5. 생존자 만남
      {
        text: { ko: '도로에서 다친 생존자를 발견했다. 좀비에게 물렸을지도 모른다.', en: 'You find a wounded survivor on the road. Possibly bitten.' },
        choices: [
          { text: { ko: '거리 두고 증상을 면밀히 관찰 후 결정', en: 'Observe symptoms from a distance, decide carefully' }, tags: ['cautious', 'doctor', 'sensing'], baseScore: 100 },
          { text: { ko: '응급치료를 하고 격리 가능한 칸에 태운다', en: 'Provide first aid and quarantine them in a separate space' }, tags: ['kindhearted', 'healing', 'doctor'], baseScore: 90 },
          { text: { ko: '의심 없이 바로 차에 태운다', en: 'Pile them in the car without question' }, tags: ['kindhearted', 'impulsive', '반대_cautious'], baseScore: 35 },
          { text: { ko: '그대로 지나친다', en: 'Drive past' }, tags: ['selfish', 'coward', '반대_kindhearted'], baseScore: 20 },
        ],
      },
      // 6. 좀비 떼 마주침
      {
        text: { ko: '좀비 떼가 도로를 막고 있다. 우회 불가.', en: 'A horde blocks the road. No detour possible.' },
        choices: [
          { text: { ko: '소음·미끼로 떼를 옆길로 유인 후 통과', en: 'Use noise/bait to draw them aside, then pass' }, tags: ['creative', 'sneaky', 'genius'], baseScore: 100 },
          { text: { ko: '차로 천천히 떼 가장자리를 밀고 지나간다', en: 'Slowly nudge through the edge of the horde with the car' }, tags: ['cautious', 'pilot'], baseScore: 80 },
          { text: { ko: '가속해서 떼를 정면으로 뚫는다', en: 'Floor it straight through the horde' }, tags: ['brave', 'impulsive', '반대_cautious'], baseScore: 35 },
          { text: { ko: '차에서 내려 맨몸으로 싸운다', en: 'Get out and fight with bare hands' }, tags: ['stubborn', 'fighting', '반대_genius'], baseScore: 5 },
        ],
      },
      // 7. 식량/연료 부족
      {
        text: { ko: '연료가 떨어져간다. 폐쇄된 주유소를 발견했다.', en: 'Fuel running low. You find an abandoned gas station.' },
        choices: [
          { text: { ko: '주변 좀비·생존자 흔적부터 확인 후 진입', en: 'Scout surroundings for zombies/survivors before entering' }, tags: ['cautious', 'tracking', 'detective'], baseScore: 100 },
          { text: { ko: '소음 최소화하며 빠르게 연료만 챙김', en: 'Quietly grab fuel and leave fast' }, tags: ['sneaky', 'cautious', 'hiding'], baseScore: 90 },
          { text: { ko: '큰 소리 내며 진입해 좀비를 미리 끌어낸다', en: 'Make noise to lure any zombies out first' }, tags: ['brave', 'creative'], baseScore: 60 },
          { text: { ko: '연료 없이 그냥 떠난다', en: 'Skip the fuel and drive on' }, tags: ['lazy', 'pessimist', '반대_cautious'], baseScore: 15 },
        ],
      },
      // 8. 동료 감염 의심
      {
        text: { ko: '같이 도주 중인 동료가 열이 오르고 떨고 있다.', en: 'Your traveling companion is feverish and trembling.' },
        choices: [
          { text: { ko: '의학적 증상을 정확히 진단하고 격리', en: 'Diagnose medical symptoms accurately and isolate them' }, tags: ['doctor', 'healing', 'sensing'], baseScore: 100 },
          { text: { ko: '대화하며 의식·반응을 체크', en: 'Talk to them and monitor consciousness and response' }, tags: ['kindhearted', 'cautious', 'persuasion'], baseScore: 85 },
          { text: { ko: '즉시 차에서 내리게 한다', en: 'Force them out of the car right now' }, tags: ['selfish', 'impulsive', '반대_kindhearted'], baseScore: 20 },
          { text: { ko: '아무 일 없는 척 모른다고 한다', en: 'Pretend nothing is happening' }, tags: ['lazy', 'coward', '반대_honest'], baseScore: 10 },
        ],
      },
      // 9. 안전지대 접근
      {
        text: { ko: '안전지대 입구에 도착했다. 들여보내려는지 검사 중이다.', en: 'You reach the safe zone gate. Inspectors are screening entrants.' },
        choices: [
          { text: { ko: '솔직하게 동선·접촉 이력을 알리고 검사 받음', en: 'Honestly disclose route and contacts; submit to screening' }, tags: ['honest', 'cautious', 'kindhearted'], baseScore: 100 },
          { text: { ko: '의심받지 않게 차분히 절차를 따른다', en: 'Calmly follow procedures to avoid raising suspicion' }, tags: ['cautious', 'mysterious'], baseScore: 85 },
          { text: { ko: '감염 의심자를 숨기고 통과하려 시도', en: 'Hide the infected ally and try to slip through' }, tags: ['sneaky', 'lying', '반대_honest'], baseScore: 10 },
          { text: { ko: '입구를 뚫고 강제로 진입', en: 'Force your way through the gate' }, tags: ['brave', 'impulsive', '반대_cautious'], baseScore: 5 },
        ],
      },
      // 10. 안식
      {
        text: { ko: '안전지대 내부에서 자원봉사 요청이 왔다.', en: 'Inside the safe zone, volunteer roles are needed.' },
        choices: [
          { text: { ko: '자신의 강점에 맞는 역할에 자원', en: 'Volunteer for the role that matches your strengths' }, tags: ['kindhearted', 'perfectionist', 'creative'], baseScore: 100 },
          { text: { ko: '의료·식량·방어 등 위급 역할 우선 지원', en: 'Prioritize urgent roles — medical, food, defense' }, tags: ['kindhearted', 'brave', 'doctor'], baseScore: 90 },
          { text: { ko: '쉬운 일만 신청한다', en: 'Sign up for only easy tasks' }, tags: ['lazy', 'selfish', '반대_kindhearted'], baseScore: 25 },
          { text: { ko: '아무것도 안 하고 침대에 눕는다', en: 'Skip volunteering and just rest' }, tags: ['lazy', 'sleeping', '반대_brave'], baseScore: 10 },
        ],
      },
    ],
  },

  // ════════════════════ 미션 6: 요리 대결 ════════════════════
  {
    id: 'mission_06',
    emoji: '👨‍🍳',
    ko: { title: '요리 대결', desc: '세계 최고의 요리사와 대결해야 합니다.' },
    en: { title: 'Cooking Battle', desc: "Compete against the world's best chef." },
    situations: [
      // 1. 메뉴 결정
      {
        text: { ko: '60분 안에 한 가지 요리를 만들어야 한다. 어떤 메뉴?', en: 'You must cook one dish in 60 minutes. What menu?' },
        choices: [
          { text: { ko: '내 강점을 살릴 수 있는 자신 있는 한 가지 메뉴', en: 'Pick a dish that plays to your real strengths' }, tags: ['perfectionist', 'creative', 'cooking'], baseScore: 100 },
          { text: { ko: '심사위원의 취향을 분석해 그에 맞춘다', en: 'Analyze judge preferences and match them' }, tags: ['detective', 'cautious', 'genius'], baseScore: 90 },
          { text: { ko: '아무도 안 한 새로운 퓨전 요리에 도전', en: 'Try a brand-new fusion no one has done' }, tags: ['curious', 'impulsive', 'creative'], baseScore: 65 },
          { text: { ko: '인스턴트 라면을 끓인다', en: 'Boil instant ramen' }, tags: ['lazy', 'eating', '반대_perfectionist'], baseScore: 5 },
        ],
      },
      // 2. 식재료 선택
      {
        text: { ko: '식재료 코너로 가야 한다. 시간이 부족하다.', en: 'Head to the pantry — time is tight.' },
        choices: [
          { text: { ko: '메뉴에 필요한 재료 목록을 미리 정리해 효율적 구입', en: 'Pre-list ingredients and grab them efficiently' }, tags: ['perfectionist', 'genius', 'cooking'], baseScore: 100 },
          { text: { ko: '신선한 제철 재료 위주로 선별', en: 'Focus on fresh seasonal ingredients' }, tags: ['cautious', 'farmer', 'sensing'], baseScore: 90 },
          { text: { ko: '비싼 재료만 잔뜩 챙긴다', en: 'Grab only the most expensive ingredients' }, tags: ['greedy', 'impulsive', '반대_perfectionist'], baseScore: 35 },
          { text: { ko: '눈에 보이는 것을 닥치는 대로 집는다', en: 'Grab anything in sight at random' }, tags: ['clumsy', 'impulsive'], baseScore: 15 },
        ],
      },
      // 3. 칼질 / 손질
      {
        text: { ko: '식재료 손질을 시작한다. 손이 떨린다.', en: 'You start prepping — your hands are shaking.' },
        choices: [
          { text: { ko: '심호흡 후 정확하고 일정한 칼질', en: 'Deep breath, then precise consistent cuts' }, tags: ['perfectionist', 'cautious', 'cooking'], baseScore: 100 },
          { text: { ko: '빠르고 효율적인 칼질에 집중', en: 'Focus on speed and efficiency' }, tags: ['athlete', 'cooking', 'genius'], baseScore: 85 },
          { text: { ko: '서두르다 손가락을 살짝 베인다', en: 'Rush, nick your finger' }, tags: ['clumsy', 'impulsive', '반대_perfectionist'], baseScore: 25 },
          { text: { ko: '칼질을 동료에게 부탁한다', en: 'Ask a teammate to do the cutting' }, tags: ['lazy', 'selfish', '반대_brave'], baseScore: 30 },
        ],
      },
      // 4. 시즈닝
      {
        text: { ko: '시즈닝 양을 결정해야 한다. 한 번 잘못 넣으면 못 돌이킨다.', en: 'Decide seasoning amounts — wrong = irreversible.' },
        choices: [
          { text: { ko: '소량씩 넣으며 계속 맛 보고 조정', en: 'Add little by little, taste, adjust' }, tags: ['cautious', 'perfectionist', 'sensing'], baseScore: 100 },
          { text: { ko: '경험으로 표준량을 정확히 넣음', en: 'Pour the right amount from muscle memory' }, tags: ['chef', 'cooking', 'genius'], baseScore: 90 },
          { text: { ko: '평소보다 두 배로 강한 맛에 도전', en: 'Double the seasoning for impact' }, tags: ['brave', 'creative', '반대_cautious'], baseScore: 40 },
          { text: { ko: '소금을 들이붓는다', en: 'Pour in the entire salt jar' }, tags: ['impulsive', 'clumsy', '반대_perfectionist'], baseScore: 0 },
        ],
      },
      // 5. 불 조절
      {
        text: { ko: '센 불에 음식이 타려고 한다.', en: 'On high heat, the food is starting to burn.' },
        choices: [
          { text: { ko: '즉시 불 조절하고 팬을 분리·온도 안정화', en: 'Cut heat, move the pan, stabilize temperature' }, tags: ['cautious', 'sensing', 'chef'], baseScore: 100 },
          { text: { ko: '재료를 빠르게 뒤집어 균형을 맞춤', en: 'Flip quickly to balance the heat' }, tags: ['cooking', 'creative', 'athlete'], baseScore: 85 },
          { text: { ko: '불을 더 세게 키워본다', en: 'Crank the heat higher to "fix" it' }, tags: ['stubborn', 'impulsive', '반대_cautious'], baseScore: 10 },
          { text: { ko: '아예 새로 시작한다', en: 'Start over from scratch' }, tags: ['perfectionist', 'pessimist'], baseScore: 30 },
        ],
      },
      // 6. 동료 실수
      {
        text: { ko: '보조 요리사가 중요한 재료를 떨어뜨렸다.', en: 'Your sous chef drops a critical ingredient.' },
        choices: [
          { text: { ko: '침착하게 대안 재료로 즉석 조정', en: 'Calmly improvise with an alternative ingredient' }, tags: ['creative', 'genius', 'cooking'], baseScore: 100 },
          { text: { ko: '실수를 격려하고 다음 단계로 빨리 넘어감', en: 'Encourage them, move to the next step quickly' }, tags: ['kindhearted', 'optimist'], baseScore: 90 },
          { text: { ko: '큰 소리로 화를 낸다', en: 'Shout at them in anger' }, tags: ['stubborn', 'selfish', '반대_kindhearted'], baseScore: 15 },
          { text: { ko: '요리를 포기한다', en: 'Give up on the dish' }, tags: ['lazy', 'pessimist', '반대_brave'], baseScore: 0 },
        ],
      },
      // 7. 플레이팅
      {
        text: { ko: '음식을 접시에 담을 차례다. 5분 남았다.', en: 'Time to plate. 5 minutes left.' },
        choices: [
          { text: { ko: '균형·색감·동선까지 계산한 정교한 플레이팅', en: 'Plate with balance, color, and motion all calculated' }, tags: ['perfectionist', 'artist', 'drawing'], baseScore: 100 },
          { text: { ko: '심플하지만 메뉴 본질이 드러나는 플레이팅', en: 'Simple plating that highlights the dish itself' }, tags: ['creative', 'honest', 'chef'], baseScore: 90 },
          { text: { ko: '온갖 화려한 가니쉬로 덮어버린다', en: 'Pile on every flashy garnish you can find' }, tags: ['greedy', 'impulsive', '반대_perfectionist'], baseScore: 35 },
          { text: { ko: '음식을 그냥 접시에 던지듯 담는다', en: 'Toss the food onto the plate carelessly' }, tags: ['lazy', 'clumsy', '반대_perfectionist'], baseScore: 5 },
        ],
      },
      // 8. 심사위원 질문
      {
        text: { ko: '심사위원이 "당신만의 시그니처가 뭡니까?"라고 묻는다.', en: 'A judge asks "What\'s your signature?"' },
        choices: [
          { text: { ko: '솔직하고 진심 어린 자신의 요리 철학 설명', en: 'Sincerely explain your real cooking philosophy' }, tags: ['honest', 'persuasion', 'creative'], baseScore: 100 },
          { text: { ko: '메뉴의 핵심 기법과 의도를 조리 있게 설명', en: 'Articulate the key techniques and intentions' }, tags: ['genius', 'teacher', 'persuasion'], baseScore: 90 },
          { text: { ko: '농담으로 분위기를 풀어본다', en: 'Crack a joke to lighten the mood' }, tags: ['talkative', 'optimist'], baseScore: 60 },
          { text: { ko: '거짓으로 멋진 척 꾸며낸다', en: 'Fake an impressive but untrue story' }, tags: ['lying', 'greedy', '반대_honest'], baseScore: 15 },
        ],
      },
      // 9. 시식
      {
        text: { ko: '심사위원이 첫 한 입을 먹고 표정이 미묘하다.', en: "The judge takes the first bite — expression unclear." },
        choices: [
          { text: { ko: '차분히 반응을 기다리며 다음 평가 준비', en: "Calmly wait for the verdict and prepare for next round" }, tags: ['cautious', 'perfectionist'], baseScore: 100 },
          { text: { ko: '예의 바르게 미소 짓고 침묵을 지킨다', en: 'Smile politely and stay silent' }, tags: ['kindhearted', 'cautious'], baseScore: 90 },
          { text: { ko: '"맛없죠?" 라고 먼저 묻는다', en: '"It tastes bad, right?"' }, tags: ['pessimist', 'honest', '반대_optimist'], baseScore: 25 },
          { text: { ko: '접시를 뺏어 다시 만들겠다고 한다', en: 'Snatch the plate to remake it' }, tags: ['impulsive', 'stubborn', '반대_cautious'], baseScore: 5 },
        ],
      },
      // 10. 결과 발표
      {
        text: { ko: '심사 결과가 곧 발표된다. 상대 요리사도 긴장한다.', en: 'Results coming. Even the rival chef is tense.' },
        choices: [
          { text: { ko: '결과와 무관하게 상대 요리를 진심으로 인정', en: 'Sincerely acknowledge the rival\'s dish regardless of outcome' }, tags: ['kindhearted', 'honest', 'optimist'], baseScore: 100 },
          { text: { ko: '결과 후 피드백을 적극적으로 요청', en: 'Actively request feedback after results' }, tags: ['curious', 'perfectionist', 'teacher'], baseScore: 90 },
          { text: { ko: '이기든 지든 상대를 비웃는다', en: "Mock the rival regardless of who wins" }, tags: ['selfish', 'sneaky', '반대_kindhearted'], baseScore: 5 },
          { text: { ko: '결과 발표 전 자리를 뜬다', en: 'Walk out before results are announced' }, tags: ['coward', 'lazy', '반대_brave'], baseScore: 15 },
        ],
      },
    ],
  },
  // ════════════════════ 미션 7: 우주 해적 탈출 ════════════════════
  {
    id: 'mission_07',
    emoji: '🏴‍☠️',
    ko: { title: '우주 해적 탈출', desc: '우주 해적에게 납치됐습니다. 탈출하세요.' },
    en: { title: 'Space Pirates', desc: 'Captured by space pirates. Escape.' },
    situations: [
      // 1. 의식 회복
      {
        text: { ko: '해적선 감옥에서 눈을 떴다. 손목엔 에너지 수갑이 채워져 있다.', en: 'You wake in a pirate brig, energy cuffs on your wrists.' },
        choices: [
          { text: { ko: '감옥 환경·간수 패턴·잠금장치를 차분히 관찰', en: 'Calmly observe the cell, guard patterns, lock type' }, tags: ['cautious', 'detective', 'sensing'], baseScore: 100 },
          { text: { ko: '수갑을 부수려 힘껏 비튼다', en: 'Wrench the cuffs apart with brute force' }, tags: ['brave', 'fighting', '반대_cautious'], baseScore: 25 },
          { text: { ko: '큰 소리로 해적을 부른다', en: 'Yell to summon the pirates' }, tags: ['talkative', 'impulsive', '반대_cautious'], baseScore: 15 },
          { text: { ko: '체념하고 다시 잔다', en: 'Give up and go back to sleep' }, tags: ['lazy', 'sleeping', '반대_brave'], baseScore: 0 },
        ],
      },
      // 2. 옆 감방 동료
      {
        text: { ko: '옆 감방의 인질이 자신을 도와달라 속삭인다.', en: 'A prisoner in the next cell whispers for help.' },
        choices: [
          { text: { ko: '신뢰성 검증 후 함께 탈출 계획을 수립', en: 'Verify trustworthiness, then plan escape together' }, tags: ['cautious', 'detective', 'negotiation'], baseScore: 100 },
          { text: { ko: '협력 의사를 표시하되 자신의 정보는 숨김', en: 'Show willingness to cooperate but conceal your info' }, tags: ['sneaky', 'cautious', 'spy'], baseScore: 90 },
          { text: { ko: '바로 믿고 모든 정보를 공유', en: 'Trust immediately and share everything' }, tags: ['honest', 'optimist', '반대_cautious'], baseScore: 45 },
          { text: { ko: '무시한다. 함정일 수 있다', en: 'Ignore — could be a trap' }, tags: ['pessimist', 'selfish'], baseScore: 35 },
        ],
      },
      // 3. 간수 식사 시간
      {
        text: { ko: '간수가 식사를 가져왔다. 잠시 방심한 상태.', en: 'A guard brings food, briefly distracted.' },
        choices: [
          { text: { ko: '대화로 정보를 끌어내며 신뢰를 쌓는다', en: 'Strike up conversation, extract info, build trust' }, tags: ['negotiation', 'persuasion', 'spy'], baseScore: 100 },
          { text: { ko: '식판으로 머리를 가격해 제압', en: 'Bash the guard\'s head with the tray' }, tags: ['brave', 'fighting', 'impulsive'], baseScore: 70 },
          { text: { ko: '음식을 거부하며 항의한다', en: 'Refuse the food and protest' }, tags: ['stubborn', 'talkative', '반대_cautious'], baseScore: 25 },
          { text: { ko: '독약이라 생각해 안 먹는다', en: 'Refuse — assume it\'s poison' }, tags: ['coward', 'pessimist'], baseScore: 40 },
        ],
      },
      // 4. 수갑 해제
      {
        text: { ko: '수갑을 풀 도구가 필요하다. 무엇을 활용할까?', en: 'You need something to remove the cuffs. What to use?' },
        choices: [
          { text: { ko: '주위 부품으로 즉석 해킹 도구 제작', en: 'Build a makeshift hacking tool from scrap parts' }, tags: ['inventing', 'hacking', 'engineer'], baseScore: 100 },
          { text: { ko: '식판 모서리·머리핀 등으로 자물쇠 따기', en: 'Pick the lock with a tray edge or hairpin' }, tags: ['sneaky', 'creative', 'spy'], baseScore: 90 },
          { text: { ko: '간수가 졸 때 열쇠를 훔친다', en: 'Steal the key while the guard naps' }, tags: ['sneaky', 'hiding', 'ninja'], baseScore: 85 },
          { text: { ko: '수갑을 자기 손에 잘라낸다', en: 'Try to cut through your own wrist binding' }, tags: ['stubborn', 'clumsy', '반대_cautious'], baseScore: 10 },
        ],
      },
      // 5. 복도 탈출
      {
        text: { ko: '감옥을 나왔다. 복도에 순찰 경비가 보인다.', en: 'You\'re out of the cell. Guards patrol the corridor.' },
        choices: [
          { text: { ko: '순찰 주기를 파악하고 빈틈을 노린다', en: 'Time the patrol cycle and slip through the gap' }, tags: ['cautious', 'sensing', 'tracking'], baseScore: 100 },
          { text: { ko: '벽에 붙어 그림자 속을 이동', en: 'Hug the walls and move through shadows' }, tags: ['hiding', 'ninja', 'sneaky'], baseScore: 95 },
          { text: { ko: '경비 한 명을 빠르게 제압하고 진행', en: 'Take out one guard fast, then proceed' }, tags: ['brave', 'fighting', 'impulsive'], baseScore: 60 },
          { text: { ko: '대놓고 걸어간다', en: 'Walk down the corridor openly' }, tags: ['stubborn', 'brave', '반대_cautious'], baseScore: 5 },
        ],
      },
      // 6. 통신실 진입
      {
        text: { ko: '통신실에 도착했다. 구조 신호를 보낼 기회.', en: 'You reach the comms room — a chance to send a distress signal.' },
        choices: [
          { text: { ko: '암호화된 비상 신호로 정확히 송신', en: 'Send an encrypted distress signal correctly' }, tags: ['hacking', 'genius', 'engineer'], baseScore: 100 },
          { text: { ko: '익숙한 주파수로 음성 SOS 송신', en: 'Send a voice SOS on a known frequency' }, tags: ['cautious', 'pilot'], baseScore: 85 },
          { text: { ko: '아무 채널로나 도와달라 외친다', en: 'Yell for help on every open channel' }, tags: ['impulsive', 'talkative', '반대_cautious'], baseScore: 35 },
          { text: { ko: '통신 장비를 부순다', en: 'Smash the comms gear' }, tags: ['stubborn', 'fighting', '반대_genius'], baseScore: 0 },
        ],
      },
      // 7. 해적 두목 마주침
      {
        text: { ko: '해적 두목과 갑자기 마주쳤다. 무장 상태다.', en: 'You suddenly face the pirate captain — armed.' },
        choices: [
          { text: { ko: '두목의 이익으로 협상해 시간을 번다', en: 'Negotiate on the captain\'s interests to buy time' }, tags: ['negotiation', 'persuasion', 'detective'], baseScore: 100 },
          { text: { ko: '거짓 정보를 흘려 혼란을 준다', en: 'Plant false info to confuse them' }, tags: ['lying', 'mysterious', 'spy'], baseScore: 85 },
          { text: { ko: '바로 격투를 시작한다', en: 'Start a fight immediately' }, tags: ['brave', 'fighting', '반대_cautious'], baseScore: 30 },
          { text: { ko: '무릎 꿇고 항복한다', en: 'Drop to your knees and surrender' }, tags: ['coward', 'lazy', '반대_brave'], baseScore: 10 },
        ],
      },
      // 8. 무기고 발견
      {
        text: { ko: '무기고를 발견했다. 가져갈 시간이 빠듯하다.', en: 'You find the armory — but time is short.' },
        choices: [
          { text: { ko: '가벼우면서 효과적인 핵심 장비 1~2개만 챙김', en: 'Grab 1-2 light yet effective key items' }, tags: ['cautious', 'perfectionist', 'engineer'], baseScore: 100 },
          { text: { ko: '비상 신호기·치료 키트를 우선 챙김', en: 'Priority: flare and medkit' }, tags: ['cautious', 'healing', 'doctor'], baseScore: 90 },
          { text: { ko: '가능한 한 많이 챙긴다', en: 'Pack as much as possible' }, tags: ['greedy', 'impulsive', '반대_cautious'], baseScore: 30 },
          { text: { ko: '무기고를 무시하고 지나친다', en: 'Skip the armory entirely' }, tags: ['lazy', 'pessimist', '반대_cautious'], baseScore: 25 },
        ],
      },
      // 9. 탈출 셔틀
      {
        text: { ko: '탈출 셔틀 앞이다. 셔틀 조종법은 모른다.', en: 'You reach the escape shuttle — but don\'t know how to fly it.' },
        choices: [
          { text: { ko: '계기판 매뉴얼을 빠르게 학습 후 자동 모드로 출항', en: 'Skim the manual, launch in auto mode' }, tags: ['genius', 'curious', 'pilot'], baseScore: 100 },
          { text: { ko: '동료 인질에게 조종을 맡긴다', en: 'Let your fellow prisoner pilot it' }, tags: ['negotiation', 'cautious'], baseScore: 85 },
          { text: { ko: '버튼을 닥치는 대로 눌러 발진시킨다', en: 'Smash random buttons until liftoff' }, tags: ['impulsive', 'brave', '반대_perfectionist'], baseScore: 30 },
          { text: { ko: '셔틀을 포기하고 다시 도망친다', en: 'Abandon the shuttle and flee back' }, tags: ['coward', 'pessimist', '반대_brave'], baseScore: 10 },
        ],
      },
      // 10. 추격 회피
      {
        text: { ko: '해적선이 우주에서 셔틀을 추격해 온다.', en: 'The pirate ship pursues your shuttle through space.' },
        choices: [
          { text: { ko: '소행성대로 진입해 정밀 회피 기동', en: 'Dive into an asteroid belt for precision evasion' }, tags: ['pilot', 'genius', 'navigation'], baseScore: 100 },
          { text: { ko: '미끼·플레어로 표적 락온을 흔든다', en: 'Drop decoys and flares to break the lock-on' }, tags: ['creative', 'inventing', 'spy'], baseScore: 90 },
          { text: { ko: '직선으로 가속해 도망친다', en: 'Burn straight ahead at full speed' }, tags: ['impulsive', 'brave', '반대_cautious'], baseScore: 45 },
          { text: { ko: '셔틀의 통신으로 항복한다', en: 'Open comms and surrender' }, tags: ['coward', 'pessimist', '반대_brave'], baseScore: 5 },
        ],
      },
    ],
  },

  // ════════════════════ 미션 8: 타임머신 고장 ════════════════════
  {
    id: 'mission_08',
    emoji: '⏰',
    ko: { title: '타임머신 고장', desc: '타임머신이 고장났습니다. 현재로 돌아오세요.' },
    en: { title: 'Time Malfunction', desc: 'Time machine broke. Get back to present.' },
    situations: [
      // 1. 어디로?
      {
        text: { ko: '깨어보니 1800년대 거리다. 타임머신은 연기를 뿜고 있다.', en: 'You wake in a 1800s street. The time machine is smoking.' },
        choices: [
          { text: { ko: '주변 환경·연도를 정확히 파악 후 행동 결정', en: 'Pinpoint the era and surroundings before acting' }, tags: ['cautious', 'detective', 'archaeologist'], baseScore: 100 },
          { text: { ko: '눈에 띄지 않게 숨어 시대 분위기를 학습', en: 'Stay low-profile and study the period' }, tags: ['hiding', 'curious', 'mysterious'], baseScore: 90 },
          { text: { ko: '큰 소리로 시민에게 도움을 청한다', en: 'Loudly ask passersby for help' }, tags: ['talkative', 'impulsive', '반대_cautious'], baseScore: 20 },
          { text: { ko: '드러누워 운명에 맡긴다', en: 'Lay down and surrender to fate' }, tags: ['lazy', 'pessimist', 'sleeping'], baseScore: 0 },
        ],
      },
      // 2. 의상 조달
      {
        text: { ko: '현대 옷차림이 너무 튄다. 시대에 맞는 옷이 필요.', en: 'Modern clothes stand out. You need period-correct attire.' },
        choices: [
          { text: { ko: '세탁소 같은 곳에서 값을 두고 빌린다', en: 'Borrow from a laundry, leaving payment' }, tags: ['honest', 'creative', 'negotiation'], baseScore: 100 },
          { text: { ko: '빨랫줄에서 몰래 한 벌 가져온다', en: 'Quietly take one outfit from a clothesline' }, tags: ['sneaky', 'hiding', 'spy'], baseScore: 70 },
          { text: { ko: '거리에서 비싼 옷을 도둑질', en: 'Steal expensive clothes from the street' }, tags: ['greedy', 'selfish', '반대_honest'], baseScore: 15 },
          { text: { ko: '현대 옷 그대로 활보', en: 'Strut around in modern clothes' }, tags: ['stubborn', 'brave', '반대_cautious'], baseScore: 10 },
        ],
      },
      // 3. 역사 인물 마주침
      {
        text: { ko: '유명 역사 인물과 우연히 마주쳤다. 자신을 어떻게 소개?', en: 'You bump into a famous historical figure. How do you introduce yourself?' },
        choices: [
          { text: { ko: '시대에 어울리는 가명·직업으로 자연스럽게 소개', en: 'Use a believable era-appropriate alias and occupation' }, tags: ['lying', 'spy', 'mysterious'], baseScore: 100 },
          { text: { ko: '여행자라고 모호하게 답하며 대화 회피', en: 'Vaguely say "traveler" and avoid deep talk' }, tags: ['cautious', 'mysterious'], baseScore: 90 },
          { text: { ko: '미래에서 왔다고 사실대로 말한다', en: 'Honestly admit you\'re from the future' }, tags: ['honest', 'curious', '반대_cautious'], baseScore: 20 },
          { text: { ko: '미래 지식으로 충고한다', en: 'Lecture them with future knowledge' }, tags: ['greedy', 'stubborn', '반대_cautious'], baseScore: 10 },
        ],
      },
      // 4. 부품 조달
      {
        text: { ko: '타임머신 수리에는 구리선·자석·배터리 비슷한 부품이 필요하다.', en: 'Repairs need copper wire, magnets, and battery-like parts.' },
        choices: [
          { text: { ko: '대장간·전신소를 찾아 정당하게 구매·교환', en: 'Find a smithy/telegraph station; trade legitimately' }, tags: ['honest', 'negotiation', 'engineer'], baseScore: 100 },
          { text: { ko: '지역 발명가와 협상해 부품을 얻는다', en: 'Negotiate with a local inventor for parts' }, tags: ['negotiation', 'inventing', 'scientist'], baseScore: 90 },
          { text: { ko: '집에 몰래 들어가 가져온다', en: 'Sneak into a home and take what you need' }, tags: ['sneaky', 'hiding', '반대_honest'], baseScore: 35 },
          { text: { ko: '시대 부품이 부족하다고 단념', en: 'Give up — too primitive' }, tags: ['pessimist', 'lazy', '반대_optimist'], baseScore: 10 },
        ],
      },
      // 5. 누설된 미래 지식
      {
        text: { ko: '대화 중 미래 사건을 실수로 흘려버렸다.', en: "You accidentally leaked a future event in conversation." },
        choices: [
          { text: { ko: '농담·예언자 행세로 자연스럽게 무마', en: 'Pass it off as a joke or prophecy' }, tags: ['creative', 'lying', 'mysterious'], baseScore: 100 },
          { text: { ko: '바로 화제를 돌린다', en: 'Quickly change the subject' }, tags: ['cautious', 'persuasion'], baseScore: 85 },
          { text: { ko: '미래에서 왔음을 인정한다', en: 'Confess you came from the future' }, tags: ['honest', '반대_cautious'], baseScore: 25 },
          { text: { ko: '아무 일 없는 척 그 자리를 떠난다', en: 'Pretend nothing happened and walk off' }, tags: ['sneaky', 'cautious'], baseScore: 75 },
        ],
      },
      // 6. 시대 의술 위기
      {
        text: { ko: '동행한 동료가 시대 풍토병에 감염됐다.', en: 'Your companion catches an era-specific disease.' },
        choices: [
          { text: { ko: '현대 의학 지식으로 신중히 처치', en: 'Apply modern medical knowledge carefully' }, tags: ['doctor', 'healing', 'genius'], baseScore: 100 },
          { text: { ko: '시대 약초·민간요법을 활용', en: 'Use period-appropriate herbs and folk remedies' }, tags: ['cautious', 'farming', 'creative'], baseScore: 85 },
          { text: { ko: '시대 의사에게 위임한다', en: 'Hand them over to the local doctor' }, tags: ['lazy', 'honest'], baseScore: 50 },
          { text: { ko: '치료를 포기한다', en: 'Give up on treating them' }, tags: ['selfish', 'pessimist', '반대_kindhearted'], baseScore: 0 },
        ],
      },
      // 7. 시간 역설 위기
      {
        text: { ko: '실수로 역사적 사건의 직전 단계에 영향을 줄 뻔했다.', en: 'You almost altered a critical historical event.' },
        choices: [
          { text: { ko: '즉시 멈추고 원상태로 복원', en: 'Stop immediately and restore the timeline' }, tags: ['cautious', 'perfectionist', 'detective'], baseScore: 100 },
          { text: { ko: '영향이 최소화되도록 보정', en: 'Minimize the impact carefully' }, tags: ['genius', 'creative', 'engineer'], baseScore: 90 },
          { text: { ko: '아예 역사를 바꿔보고 결과를 본다', en: 'Try to change history just to see what happens' }, tags: ['curious', 'impulsive', '반대_cautious'], baseScore: 10 },
          { text: { ko: '못 본 척 외면한다', en: 'Pretend it never happened' }, tags: ['lazy', 'coward', '반대_honest'], baseScore: 35 },
        ],
      },
      // 8. 동지애의 시험
      {
        text: { ko: '시대 친구가 함께 미래로 가달라 부탁한다.', en: 'A friend from the era begs to be taken to the future.' },
        choices: [
          { text: { ko: '인과를 설명하고 정중히 거절', en: 'Explain the causality risk and decline kindly' }, tags: ['honest', 'kindhearted', 'persuasion'], baseScore: 100 },
          { text: { ko: '시대에 남는 게 본인에게도 좋다고 설득', en: 'Persuade them their place is here, for their own sake' }, tags: ['negotiation', 'teacher', 'kindhearted'], baseScore: 90 },
          { text: { ko: '함께 데려간다', en: 'Take them with you' }, tags: ['kindhearted', 'impulsive', '반대_cautious'], baseScore: 25 },
          { text: { ko: '쌀쌀맞게 무시한다', en: 'Coldly ignore them' }, tags: ['selfish', '반대_kindhearted'], baseScore: 10 },
        ],
      },
      // 9. 시간 좌표 설정
      {
        text: { ko: '타임머신 수리가 거의 끝났다. 좌표 입력만 남았다.', en: 'Repairs nearly done. Only coordinates remain to enter.' },
        choices: [
          { text: { ko: '원래 시간·장소를 정확히 계산해서 입력', en: 'Precisely calculate your original time and place' }, tags: ['genius', 'perfectionist', 'scientist'], baseScore: 100 },
          { text: { ko: '안전 마진을 두고 출발 1시간 후로 설정', en: 'Set it 1 hour after departure as a safety margin' }, tags: ['cautious', 'engineer'], baseScore: 90 },
          { text: { ko: '대충 어림짐작해서 입력', en: 'Eyeball the coordinates' }, tags: ['impulsive', 'clumsy', '반대_perfectionist'], baseScore: 20 },
          { text: { ko: '미래 다른 시점으로 도전', en: 'Try jumping to a different future point' }, tags: ['curious', 'greedy', '반대_cautious'], baseScore: 30 },
        ],
      },
      // 10. 발진
      {
        text: { ko: '타임머신이 작동한다. 출발 직전 시대 친구가 손을 흔든다.', en: 'The machine activates. Your era-friend waves goodbye.' },
        choices: [
          { text: { ko: '추억을 간직하고 정중히 작별 인사', en: 'Cherish the memory, say a proper goodbye' }, tags: ['kindhearted', 'honest', 'optimist'], baseScore: 100 },
          { text: { ko: '미소만 짓고 떠난다', en: 'Smile and leave without words' }, tags: ['mysterious', 'kindhearted'], baseScore: 85 },
          { text: { ko: '미래에서 다시 만나러 오겠다고 약속', en: 'Promise to return from the future' }, tags: ['lying', 'optimist', '반대_honest'], baseScore: 40 },
          { text: { ko: '뒤도 안 돌아보고 떠난다', en: 'Leave without looking back' }, tags: ['selfish', 'cold', '반대_kindhearted'], baseScore: 20 },
        ],
      },
    ],
  },

  // ════════════════════ 미션 9: 학교 시험 위기 ════════════════════
  {
    id: 'mission_09',
    emoji: '📝',
    ko: { title: '학교 시험 위기', desc: '내일 시험인데 아무것도 모릅니다. 통과하세요.' },
    en: { title: 'Exam Crisis', desc: 'Exam tomorrow, you know nothing. Pass it.' },
    situations: [
      // 1. 현실 인식
      {
        text: { ko: '내일 아침 시험. 책은 아직 안 펴봤다.', en: 'Exam is tomorrow morning. You haven\'t opened the book yet.' },
        choices: [
          { text: { ko: '핵심 출제 범위를 분석해 우선순위 학습 계획 수립', en: 'Analyze the likely exam scope and plan priority study' }, tags: ['genius', 'perfectionist', 'detective'], baseScore: 100 },
          { text: { ko: '교과서 목차부터 빠르게 훑어 개요 파악', en: 'Skim the table of contents to map topics quickly' }, tags: ['cautious', 'curious', 'teacher'], baseScore: 90 },
          { text: { ko: '아무 페이지나 펴서 본다', en: 'Open a random page and start reading' }, tags: ['impulsive', 'clumsy', '반대_perfectionist'], baseScore: 25 },
          { text: { ko: '낮잠을 잔다. 컨디션이 중요하다', en: 'Take a nap. Rest is everything' }, tags: ['lazy', 'sleeping', '반대_perfectionist'], baseScore: 0 },
        ],
      },
      // 2. 친구의 도움 제안
      {
        text: { ko: '친구가 정리 노트를 빌려주겠다고 한다.', en: 'A friend offers their summary notes.' },
        choices: [
          { text: { ko: '감사히 받아 핵심을 빠르게 흡수', en: 'Gratefully accept, absorb the key points fast' }, tags: ['kindhearted', 'genius', 'curious'], baseScore: 100 },
          { text: { ko: '친구에게 함께 공부하자고 제안', en: 'Propose studying together' }, tags: ['kindhearted', 'persuasion', 'teacher'], baseScore: 95 },
          { text: { ko: '필요 없다고 거절한다', en: 'Refuse — say you don\'t need it' }, tags: ['stubborn', 'selfish', '반대_kindhearted'], baseScore: 20 },
          { text: { ko: '노트만 빼앗고 친구를 무시', en: 'Snatch the notes and ignore them' }, tags: ['greedy', 'sneaky', '반대_kindhearted'], baseScore: 10 },
        ],
      },
      // 3. 학습 방법
      {
        text: { ko: '4시간이 남았다. 어떻게 공부할까?', en: '4 hours left. How to study?' },
        choices: [
          { text: { ko: '핵심 개념·예제·기출 위주로 분배해 효율 학습', en: 'Distribute time across key concepts, examples, past exams' }, tags: ['perfectionist', 'genius', 'teacher'], baseScore: 100 },
          { text: { ko: '문제풀이 위주로 반복 학습', en: 'Drill problems repeatedly' }, tags: ['stubborn', 'cautious'], baseScore: 90 },
          { text: { ko: '교과서를 처음부터 끝까지 정독', en: 'Read the textbook cover to cover' }, tags: ['perfectionist', 'stubborn', '반대_cautious'], baseScore: 50 },
          { text: { ko: '유튜브 영상만 본다', en: 'Just watch YouTube videos' }, tags: ['lazy', 'curious', '반대_perfectionist'], baseScore: 35 },
        ],
      },
      // 4. 집중력 위기
      {
        text: { ko: '졸음·휴대폰 유혹이 밀려온다.', en: 'Sleepiness and phone temptation hit hard.' },
        choices: [
          { text: { ko: '휴대폰을 다른 방에 두고 짧은 휴식·물 마시기', en: 'Phone in another room, short breaks, drink water' }, tags: ['cautious', 'perfectionist'], baseScore: 100 },
          { text: { ko: '잠시 일어나 스트레칭 후 복귀', en: 'Stand up, stretch briefly, then refocus' }, tags: ['athlete', 'creative'], baseScore: 90 },
          { text: { ko: '잠깐만 SNS 본다', en: 'Just a quick scroll on social media' }, tags: ['impulsive', 'lazy', '반대_perfectionist'], baseScore: 20 },
          { text: { ko: '책상에 엎드려 잔다', en: 'Crash on the desk and sleep' }, tags: ['lazy', 'sleeping', '반대_brave'], baseScore: 5 },
        ],
      },
      // 5. 어려운 단원
      {
        text: { ko: '도저히 이해 못 하는 단원이 있다. 시간은 부족하다.', en: 'There\'s one unit you can\'t understand. Time is short.' },
        choices: [
          { text: { ko: '핵심 결론·공식만 외우고 시간을 다른 곳에 분배', en: 'Memorize just the conclusion/formula, redistribute time' }, tags: ['perfectionist', 'cautious', 'genius'], baseScore: 100 },
          { text: { ko: '친구에게 5분 요약 설명을 부탁', en: 'Ask a friend for a 5-minute explanation' }, tags: ['negotiation', 'persuasion', 'teacher'], baseScore: 95 },
          { text: { ko: '단원을 완전 정복할 때까지 집착한다', en: 'Refuse to move on until you fully master it' }, tags: ['stubborn', 'perfectionist', '반대_cautious'], baseScore: 30 },
          { text: { ko: '그 단원 자체를 포기', en: 'Skip the unit entirely' }, tags: ['lazy', 'pessimist'], baseScore: 40 },
        ],
      },
      // 6. 부정행위 유혹
      {
        text: { ko: '친구가 컨닝 페이퍼를 같이 만들자고 한다.', en: 'A friend suggests making a cheat sheet together.' },
        choices: [
          { text: { ko: '정중히 거절하고 정공법으로 학습', en: 'Politely decline and study legitimately' }, tags: ['honest', 'kindhearted', 'perfectionist'], baseScore: 100 },
          { text: { ko: '대신 함께 정리 노트를 만들자고 제안', en: 'Offer to make legitimate study notes together' }, tags: ['kindhearted', 'creative', 'teacher'], baseScore: 95 },
          { text: { ko: '컨닝 페이퍼만 받고 사용은 안 함', en: 'Take the cheat sheet but pledge not to use it' }, tags: ['sneaky', 'cautious', '반대_honest'], baseScore: 30 },
          { text: { ko: '같이 만들고 사용한다', en: 'Make it together and use it' }, tags: ['sneaky', 'lying', '반대_honest'], baseScore: 5 },
        ],
      },
      // 7. 모의 문제
      {
        text: { ko: '기출문제집을 발견했다.', en: 'You find a book of past exam questions.' },
        choices: [
          { text: { ko: '시간 재고 실전처럼 풀어보며 약점 파악', en: 'Time yourself, solve like a real test, identify gaps' }, tags: ['perfectionist', 'detective', 'athlete'], baseScore: 100 },
          { text: { ko: '답만 외우는 식으로 빠르게 학습', en: 'Speed-learn by memorizing answers' }, tags: ['lazy', 'sneaky', '반대_perfectionist'], baseScore: 50 },
          { text: { ko: '난이도가 너무 높아 포기', en: 'Too hard, give up' }, tags: ['pessimist', 'coward', '반대_brave'], baseScore: 15 },
          { text: { ko: '책을 들고 잔다', en: 'Sleep with the book under your pillow' }, tags: ['lazy', 'sleeping', '반대_genius'], baseScore: 0 },
        ],
      },
      // 8. 새벽 시간
      {
        text: { ko: '새벽 4시. 마지막 점검 시간이다.', en: '4 AM — your last revision window.' },
        choices: [
          { text: { ko: '취약 부분만 짧게 복습 후 1~2시간 수면', en: 'Review weak spots briefly, then sleep 1-2 hours' }, tags: ['cautious', 'perfectionist', 'healing'], baseScore: 100 },
          { text: { ko: '전체를 빠르게 한 번 더 훑는다', en: 'Skim the entire material once more' }, tags: ['stubborn', 'genius'], baseScore: 80 },
          { text: { ko: '새벽까지 더 공부한다', en: 'Pull an all-nighter' }, tags: ['stubborn', 'perfectionist', '반대_cautious'], baseScore: 40 },
          { text: { ko: '곧장 침대로 가서 푹 잔다', en: 'Crash hard and sleep deep' }, tags: ['lazy', 'sleeping'], baseScore: 50 },
        ],
      },
      // 9. 시험 직전
      {
        text: { ko: '시험장 도착 5분 전. 머리가 새하얗다.', en: '5 minutes before the exam. Your mind is blank.' },
        choices: [
          { text: { ko: '깊은 호흡으로 안정, 핵심 한두 가지만 떠올림', en: 'Deep breaths, recall just one or two core points' }, tags: ['cautious', 'optimist', 'sensing'], baseScore: 100 },
          { text: { ko: '친구와 마지막 핵심을 짧게 공유', en: 'Briefly swap key points with a friend' }, tags: ['kindhearted', 'persuasion', 'teacher'], baseScore: 90 },
          { text: { ko: '뇌가 굳을까 봐 책을 끝까지 본다', en: 'Cram from the book until the last second' }, tags: ['stubborn', 'pessimist', '반대_cautious'], baseScore: 50 },
          { text: { ko: '시험장을 외면하고 도망친다', en: 'Run away from the exam hall' }, tags: ['coward', 'lazy', '반대_brave'], baseScore: 0 },
        ],
      },
      // 10. 시험 중
      {
        text: { ko: '시험 문제 중 한 문제가 너무 어렵다. 시간은 흐른다.', en: 'One question is brutally hard. The clock is ticking.' },
        choices: [
          { text: { ko: '일단 건너뛰고 다른 문제 푼 뒤 돌아옴', en: 'Skip it, solve other questions, return later' }, tags: ['perfectionist', 'cautious', 'genius'], baseScore: 100 },
          { text: { ko: '아는 부분만 부분 점수를 노린다', en: 'Write what you know for partial credit' }, tags: ['cautious', 'creative', 'honest'], baseScore: 90 },
          { text: { ko: '한 문제에 끝까지 매달린다', en: 'Pour everything into solving this one' }, tags: ['stubborn', 'perfectionist', '반대_cautious'], baseScore: 30 },
          { text: { ko: '아무 답이나 적고 잔다', en: 'Scribble anything and nap' }, tags: ['lazy', 'pessimist', '반대_brave'], baseScore: 5 },
        ],
      },
    ],
  },

  // ════════════════════ 미션 10: 외계인 협상 ════════════════════
  {
    id: 'mission_10',
    emoji: '👽',
    ko: { title: '외계인 협상', desc: '지구를 침략하려는 외계인과 협상하세요.' },
    en: { title: 'Alien Negotiation', desc: 'Negotiate with aliens planning to invade Earth.' },
    situations: [
      // 1. 첫 만남
      {
        text: { ko: '거대한 외계 함선이 도시 위에 떴다. 대표로 만나야 한다.', en: 'A massive alien ship hovers over the city. You must meet them as Earth\'s envoy.' },
        choices: [
          { text: { ko: '존중과 평등을 표현하는 보편 인사를 준비', en: 'Prepare a universal greeting expressing respect and equality' }, tags: ['negotiation', 'kindhearted', 'persuasion'], baseScore: 100 },
          { text: { ko: '지구 언어·문화 샘플을 정리해 전달', en: 'Compile samples of Earth\'s languages and cultures' }, tags: ['genius', 'teacher', 'creative'], baseScore: 90 },
          { text: { ko: '바로 무기 위협으로 첫인사', en: 'Open with a weapons display as warning' }, tags: ['brave', 'fighting', '반대_cautious'], baseScore: 15 },
          { text: { ko: '도망친다', en: 'Run away from the meeting' }, tags: ['coward', 'lazy', '반대_brave'], baseScore: 0 },
        ],
      },
      // 2. 언어 장벽
      {
        text: { ko: '외계인의 언어가 인간과 다르다. 통역이 시급.', en: 'Their language is unlike anything human. Translation urgent.' },
        choices: [
          { text: { ko: '수학·기호·도식 등 보편 언어로 의사소통 시도', en: 'Use math, symbols, diagrams as universal language' }, tags: ['genius', 'scientist', 'drawing'], baseScore: 100 },
          { text: { ko: 'AI 번역기를 빠르게 보정 학습', en: 'Rapidly train an AI translator on the fly' }, tags: ['hacking', 'inventing', 'engineer'], baseScore: 90 },
          { text: { ko: '몸짓·표정으로만 소통', en: 'Use only gestures and facial expressions' }, tags: ['creative', 'persuasion'], baseScore: 65 },
          { text: { ko: '한국어로 천천히 말하면 알아들을 거다', en: 'Just speak Korean slowly — they\'ll catch on' }, tags: ['stubborn', 'optimist', '반대_genius'], baseScore: 10 },
        ],
      },
      // 3. 침공 이유 파악
      {
        text: { ko: '외계인이 침공을 결정한 이유를 알아내야 한다.', en: 'You need to learn why they decided to invade.' },
        choices: [
          { text: { ko: '직접 정중하게 질문해 동기·고충을 청취', en: 'Politely ask directly about their motives and concerns' }, tags: ['honest', 'curious', 'detective'], baseScore: 100 },
          { text: { ko: '심리·표정 관찰로 단서 수집', en: 'Read their behavior and body language for clues' }, tags: ['sensing', 'detective', 'spy'], baseScore: 90 },
          { text: { ko: '도청·해킹으로 정보 빼냄', en: 'Eavesdrop or hack their systems for info' }, tags: ['sneaky', 'hacking', '반대_honest'], baseScore: 60 },
          { text: { ko: '협박해서 알아낸다', en: 'Threaten them into telling' }, tags: ['stubborn', 'fighting', '반대_cautious'], baseScore: 15 },
        ],
      },
      // 4. 지구의 입장 전달
      {
        text: { ko: '인류 대표로서 지구의 가치·존엄을 설명해야 한다.', en: 'As humanity\'s envoy, you must convey Earth\'s value and dignity.' },
        choices: [
          { text: { ko: '평화·예술·과학 성취를 균형 있게 소개', en: 'Showcase peace, art, science achievements in balance' }, tags: ['persuasion', 'artist', 'scientist'], baseScore: 100 },
          { text: { ko: '지구의 약점을 솔직히 인정하며 협력 제안', en: 'Honestly admit Earth\'s flaws, propose cooperation' }, tags: ['honest', 'negotiation', 'kindhearted'], baseScore: 95 },
          { text: { ko: '인류의 군사력만 자랑한다', en: 'Brag only about Earth\'s military strength' }, tags: ['brave', 'stubborn', '반대_negotiation'], baseScore: 20 },
          { text: { ko: '아무 말 못 하고 침묵', en: 'Say nothing, stay silent' }, tags: ['coward', 'lazy', '반대_brave'], baseScore: 5 },
        ],
      },
      // 5. 자원 요구
      {
        text: { ko: '외계인이 "지구의 특정 자원만 받으면 떠난다"고 한다.', en: 'They offer: "Give us a specific resource and we leave."' },
        choices: [
          { text: { ko: '지속 가능한 양·교환 조건 등 구체적 협상안 제시', en: 'Propose concrete terms: sustainable volume + reciprocal trade' }, tags: ['negotiation', 'perfectionist', 'detective'], baseScore: 100 },
          { text: { ko: '대체 자원 또는 기술 교환을 역제안', en: 'Counter-propose alternatives or technology exchange' }, tags: ['creative', 'inventing', 'persuasion'], baseScore: 90 },
          { text: { ko: '요구를 그대로 수락', en: 'Accept their demand as-is' }, tags: ['impulsive', 'kindhearted', '반대_cautious'], baseScore: 35 },
          { text: { ko: '단호히 거절한다', en: 'Flatly refuse' }, tags: ['stubborn', 'brave', '반대_negotiation'], baseScore: 25 },
        ],
      },
      // 6. 외계인 내부 갈등
      {
        text: { ko: '외계인 진영 내에서 강경파·온건파 갈등이 보인다.', en: 'You spot a hawk vs dove split among the aliens.' },
        choices: [
          { text: { ko: '온건파와 신뢰를 쌓아 협상 기반 마련', en: 'Build trust with the dove faction as a base' }, tags: ['negotiation', 'detective', 'spy'], baseScore: 100 },
          { text: { ko: '양측의 공통 이익 지점을 정리해 제시', en: 'Identify shared interests and bridge both sides' }, tags: ['creative', 'persuasion', 'genius'], baseScore: 95 },
          { text: { ko: '강경파를 이간질해 약화시킨다', en: 'Drive a wedge into the hawk faction' }, tags: ['sneaky', 'lying', '반대_honest'], baseScore: 55 },
          { text: { ko: '내부 분열을 무시한다', en: 'Ignore the split entirely' }, tags: ['lazy', 'stubborn', '반대_detective'], baseScore: 25 },
        ],
      },
      // 7. 적대 행위 시도
      {
        text: { ko: '한 외계인이 갑자기 무기를 꺼낸다.', en: 'One alien suddenly draws a weapon.' },
        choices: [
          { text: { ko: '제스처로 진정시키고 다른 외계인과 대화 유지', en: 'Calm them with gestures, keep talking to others' }, tags: ['cautious', 'persuasion', 'kindhearted'], baseScore: 100 },
          { text: { ko: '두 손을 들어 비무장임을 시각적으로 보여줌', en: 'Raise both hands to visibly signal unarmed' }, tags: ['honest', 'cautious'], baseScore: 90 },
          { text: { ko: '바로 같이 무기를 꺼낸다', en: 'Draw your own weapon in response' }, tags: ['brave', 'fighting', '반대_cautious'], baseScore: 25 },
          { text: { ko: '얼어붙어 아무것도 못 한다', en: 'Freeze and do nothing' }, tags: ['coward', 'pessimist', '반대_brave'], baseScore: 5 },
        ],
      },
      // 8. 지도자 호출
      {
        text: { ko: '외계 지도자가 직접 나섰다. 결정적 순간이다.', en: 'The alien leader steps forward — pivotal moment.' },
        choices: [
          { text: { ko: '준비한 협정안의 핵심을 명확하게 제시', en: 'Clearly present the core of your prepared treaty' }, tags: ['perfectionist', 'persuasion', 'honest'], baseScore: 100 },
          { text: { ko: '지도자 개인의 명예·이해관계에 호소', en: 'Appeal to the leader\'s personal honor and stakes' }, tags: ['negotiation', 'persuasion', 'mysterious'], baseScore: 95 },
          { text: { ko: '농담으로 분위기를 깬다', en: 'Crack a joke to ease the tension' }, tags: ['talkative', 'optimist', '반대_perfectionist'], baseScore: 50 },
          { text: { ko: '협박조로 말한다', en: 'Threaten them' }, tags: ['stubborn', 'brave', '반대_kindhearted'], baseScore: 10 },
        ],
      },
      // 9. 협정 조항
      {
        text: { ko: '협정문 초안이 완성됐다. 마지막 검토.', en: 'Treaty draft is ready. Final review.' },
        choices: [
          { text: { ko: '양측 권리·의무·이행 보장 조항을 정밀 점검', en: 'Precisely audit rights, duties, and enforcement clauses' }, tags: ['perfectionist', 'detective', 'teacher'], baseScore: 100 },
          { text: { ko: '인류·지구 환경 보호 조항을 추가 제안', en: 'Propose extra clauses protecting humanity and Earth\'s biosphere' }, tags: ['kindhearted', 'cautious', 'farmer'], baseScore: 95 },
          { text: { ko: '대충 읽고 서명', en: 'Skim quickly and sign' }, tags: ['lazy', 'impulsive', '반대_perfectionist'], baseScore: 15 },
          { text: { ko: '본인에게 유리한 비밀 조항 삽입', en: 'Slip in a secret clause favoring yourself' }, tags: ['greedy', 'sneaky', '반대_honest'], baseScore: 0 },
        ],
      },
      // 10. 협정 체결
      {
        text: { ko: '협정 체결식. 양측 대표가 서명할 시간.', en: 'The signing ceremony — both leaders step up to sign.' },
        choices: [
          { text: { ko: '공식 의례를 존중하며 진심을 담아 서명', en: 'Respect the formal ceremony, sign with full sincerity' }, tags: ['honest', 'perfectionist', 'kindhearted'], baseScore: 100 },
          { text: { ko: '인류 화합 메시지를 짧게 연설 후 서명', en: 'Deliver a brief unity message, then sign' }, tags: ['persuasion', 'optimist', 'teacher'], baseScore: 95 },
          { text: { ko: '체결 후 자기 공적을 부풀려 발표', en: 'After signing, exaggerate your own role to the media' }, tags: ['greedy', 'lying', '반대_honest'], baseScore: 25 },
          { text: { ko: '서명 직전 도망친다', en: 'Bail right before signing' }, tags: ['coward', 'lazy', '반대_brave'], baseScore: 0 },
        ],
      },
    ],
  },
];
