// 건설현장 용어 DB — 120+ 용어, 9개 직종 카테고리
// 단위·치수(category 10)은 별도 변환기 상수로 분리 (이 파일 하단)

export type TermOrigin = 'japanese' | 'english' | 'korean';
export type TermCategory =
  | 'common'      // 공통·공정
  | 'structure'   // 골조·철근
  | 'carpentry'   // 목공
  | 'plaster'     // 미장·방수
  | 'tile'        // 타일·마감
  | 'plumbing'    // 설비·배관
  | 'electric'    // 전기
  | 'scaffold'    // 비계·가설
  | 'paint';      // 도장·도배

export interface Term {
  term: string;
  standard: string;
  description: string;
  origin: TermOrigin;
  example: string;
  category: TermCategory;
}

export const TERMS: Term[] = [
  // ── 1. 공통·공정 ───────────────────────────────────────────────
  { term: '노가다', standard: '막노동 / 현장일', description: '육체적인 건설 현장 작업. 일본어 土方(どかた)에서 유래.', origin: 'japanese', example: '"노가다 10년이면 집 한 채"', category: 'common' },
  { term: '나라시', standard: '고르기 / 평탄화', description: '바닥이나 표면을 평평하게 고르는 작업.', origin: 'japanese', example: '"콘크리트 타설 후 나라시 해라"', category: 'common' },
  { term: '바라시', standard: '해체 / 철거', description: '설치된 구조물이나 거푸집을 해체하는 작업.', origin: 'japanese', example: '"공사 끝나면 가시바 바라시"', category: 'common' },
  { term: '데나오시', standard: '재작업 / 보수', description: '잘못된 부분을 다시 작업하는 것.', origin: 'japanese', example: '"이 부분 데나오시 해야겠다"', category: 'common' },
  { term: '단도리', standard: '준비 / 사전작업', description: '본 작업 전 준비하고 정리하는 일.', origin: 'japanese', example: '"내일 타설 전에 단도리 잘 해놔"', category: 'common' },
  { term: '나와바리', standard: '작업 구역 / 경계', description: '작업 범위나 담당 구역.', origin: 'japanese', example: '"이 나와바리는 2팀 담당이야"', category: 'common' },
  { term: '오야지', standard: '반장 / 팀장', description: '현장에서 팀을 이끄는 기술자.', origin: 'japanese', example: '"오야지한테 허락 받았어?"', category: 'common' },
  { term: '함바', standard: '현장 식당', description: '공사 현장에 임시로 설치된 식당.', origin: 'japanese', example: '"점심은 함바에서 먹자"', category: 'common' },
  { term: '기리빠시', standard: '짜투리 / 잔재', description: '작업 후 남은 자투리 자재.', origin: 'japanese', example: '"기리빠시 모아서 버려"', category: 'common' },
  { term: '구루마', standard: '손수레 / 운반차', description: '바퀴 달린 운반용 수레.', origin: 'japanese', example: '"구루마로 자재 옮겨"', category: 'common' },
  { term: '바게스', standard: '양동이', description: '물이나 자재를 담는 양동이.', origin: 'japanese', example: '"바게스에 물 채워와"', category: 'common' },
  { term: '빠루', standard: '노루발못뽑이 / 지렛대', description: '못을 뽑거나 지렛대로 쓰는 철제 공구.', origin: 'japanese', example: '"빠루로 합판 들어내"', category: 'common' },
  { term: '오함마', standard: '대형 해머', description: '큰 망치. 大ハンマー에서 유래.', origin: 'japanese', example: '"오함마로 깨버려"', category: 'common' },
  { term: '몽키', standard: '몽키 스패너', description: '조절 가능한 스패너 공구.', origin: 'english', example: '"몽키 어딨어?"', category: 'common' },
  { term: '빼빠', standard: '사포 / 연마지', description: '표면을 갈고 닦는 연마지. Paper에서 유래.', origin: 'japanese', example: '"빼빠로 매끄럽게 해"', category: 'common' },
  { term: '가라', standard: '빈 것 / 헛것', description: '내용 없이 비어있는 상태.', origin: 'japanese', example: '"이 박스 가라야"', category: 'common' },
  { term: '바카', standard: '불량 / 헛돌이', description: '나사나 볼트가 헛돌거나 불량인 것.', origin: 'japanese', example: '"나사가 바카 됐어"', category: 'common' },
  { term: '데모도', standard: '조공 / 보조 인부', description: '기능공을 돕는 보조 작업자.', origin: 'japanese', example: '"데모도 2명 더 불러"', category: 'common' },
  { term: '공수', standard: '작업 일당 단위', description: '하루 일당을 1공수로 기준. 0.5=반나절, 1.5=야간 포함.', origin: 'korean', example: '"오늘 1.5공수 쳤어"', category: 'common' },
  { term: '헤베', standard: '제곱미터 (㎡)', description: '면적 단위. 平米(헤이베이)에서 유래.', origin: 'japanese', example: '"이 방 몇 헤베야?"', category: 'common' },
  { term: '루베', standard: '세제곱미터 (㎥)', description: '부피 단위. 立米(리쓰베이)에서 유래.', origin: 'japanese', example: '"콘크리트 몇 루베 필요해?"', category: 'common' },
  { term: '본방', standard: '직접 운반', description: '기계 없이 사람이 직접 들어 나르는 작업.', origin: 'japanese', example: '"본방으로 4층까지 올려"', category: 'common' },
  { term: '노기스', standard: '버니어 캘리퍼스', description: '정밀 치수 측정 공구. 독일어 Nonius → 일본어 ノギス 경유.', origin: 'japanese', example: '"노기스로 두께 재봐"', category: 'common' },
  { term: '가부', standard: '기준점 / 먹 기준', description: '측량이나 먹줄의 기준이 되는 점.', origin: 'japanese', example: '"가부 잡고 시작해"', category: 'common' },
  { term: '스미', standard: '먹줄 / 기준선', description: '기준 치수를 표시하는 먹줄. 墨(すみ)에서 유래.', origin: 'japanese', example: '"스미 쳐놨어?"', category: 'common' },
  { term: '가네', standard: '직각 / 직각자', description: '직각을 확인하는 공구 또는 직각 상태. 矩(かね)에서 유래.', origin: 'japanese', example: '"가네 맞춰서 세워"', category: 'common' },
  { term: '시마이', standard: '마무리 / 완료', description: '작업 완료 또는 마무리. 仕舞い(しまい)에서 유래.', origin: 'japanese', example: '"오늘 시마이야"', category: 'common' },
  { term: '쓰라', standard: '면 / 표면 수평', description: '면이 고르고 평평한 상태. 面(つら)에서 유래.', origin: 'japanese', example: '"쓰라 맞게 해"', category: 'common' },
  { term: '아이바', standard: '송곳 / 구멍뚫개', description: '작은 구멍을 뚫는 송곳형 공구. 錐(きり)에서 유래.', origin: 'japanese', example: '"아이바로 뚫어"', category: 'common' },
  { term: '구미', standard: '조합 / 짜맞춤', description: '부재를 서로 맞춰 짜는 작업. 組み(くみ)에서 유래.', origin: 'japanese', example: '"구미 작업 들어가"', category: 'common' },

  // ── 2. 골조·철근 ───────────────────────────────────────────────
  { term: '공구리', standard: '콘크리트', description: '콘크리트. Concrete의 일본식 발음 コンクリ에서 유래.', origin: 'japanese', example: '"공구리 치기 전에 확인해"', category: 'structure' },
  { term: '쎄멘', standard: '시멘트', description: '시멘트. Cement의 일본식 발음에서 유래.', origin: 'japanese', example: '"쎄멘 배합 잘 해"', category: 'structure' },
  { term: '레미콘', standard: '레디믹스트 콘크리트', description: '공장에서 배합해 현장에 배달하는 콘크리트.', origin: 'english', example: '"레미콘 몇 시에 와?"', category: 'structure' },
  { term: '슬라브', standard: '콘크리트 바닥판', description: '건물의 콘크리트 바닥 구조체.', origin: 'english', example: '"슬라브 두께가 얼마야?"', category: 'structure' },
  { term: '타설', standard: '콘크리트 붓기', description: '콘크리트를 거푸집에 부어 넣는 작업.', origin: 'korean', example: '"내일 타설이야"', category: 'structure' },
  { term: '양생', standard: '콘크리트 굳히기', description: '콘크리트가 충분히 굳도록 기간을 두는 것.', origin: 'korean', example: '"양생 기간은 최소 7일"', category: 'structure' },
  { term: '시노', standard: '결속선 꼬기 도구', description: '철근을 결속선으로 묶을 때 쓰는 갈고리형 도구.', origin: 'japanese', example: '"시노 가져와"', category: 'structure' },
  { term: '깔쿠리', standard: '갈고리 / 갈퀴', description: '철근 현장에서 쓰는 갈고리 또는 땅 고르는 갈퀴.', origin: 'korean', example: '"깔쿠리로 긁어내"', category: 'structure' },
  { term: '먹', standard: '먹줄 / 기준선', description: '작업 기준이 되는 선을 표시하는 것.', origin: 'korean', example: '"먹 줄 쳐놨어?"', category: 'structure' },
  { term: '하스리', standard: '콘크리트 면 다듬기', description: '굳은 콘크리트 표면을 쪼아 고르는 작업.', origin: 'japanese', example: '"이음부 하스리 해"', category: 'structure' },
  { term: '이어치기', standard: '콘크리트 이음 타설', description: '이미 굳은 콘크리트에 새 콘크리트를 이어 붓는 것.', origin: 'korean', example: '"이어치기 전에 면 청소해"', category: 'structure' },
  { term: '콜드조인트', standard: '콘크리트 냉간 이음', description: '타설 간격이 길어 콘크리트가 완전히 분리되는 불량.', origin: 'english', example: '"콜드조인트 생기면 안 돼"', category: 'structure' },
  { term: '배근', standard: '철근 배치', description: '설계도에 따라 철근을 배열하는 작업.', origin: 'korean', example: '"배근 도면 확인해"', category: 'structure' },
  { term: '결속선', standard: '철근 묶음선', description: '철근 교차부를 묶는 철선.', origin: 'korean', example: '"결속선 꼼꼼히 묶어"', category: 'structure' },
  { term: '스페이서', standard: '피복 두께 확보재', description: '철근과 거푸집 사이 간격 유지용 플라스틱 부재.', origin: 'english', example: '"스페이서 간격 맞게 박아"', category: 'structure' },
  { term: '진동기', standard: '바이브레이터', description: '콘크리트 타설 시 공극 제거용 진동 기계.', origin: 'korean', example: '"진동기 고루 넣어"', category: 'structure' },
  { term: '피복두께', standard: '철근 보호 두께', description: '철근 표면에서 콘크리트 표면까지의 최소 두께.', origin: 'korean', example: '"피복두께 40mm 확보해"', category: 'structure' },
  { term: '조적', standard: '벽돌 쌓기', description: '벽돌이나 블록을 쌓아 벽을 만드는 작업.', origin: 'korean', example: '"조적 작업 들어가"', category: 'structure' },

  // ── 3. 목공 ────────────────────────────────────────────────────
  { term: '가다', standard: '거푸집 / 틀', description: '콘크리트를 부어 모양을 만드는 틀. 型(かた)에서 유래.', origin: 'japanese', example: '"가다 짜기 전에 설계도 확인해"', category: 'carpentry' },
  { term: '유로폼', standard: '알루미늄 거푸집', description: '반복 사용 가능한 금속제 거푸집.', origin: 'english', example: '"유로폼 몇 장 필요해?"', category: 'carpentry' },
  { term: '다루끼', standard: '각재 / 소각목', description: '30×40~45×45mm 크기의 작은 각목. 거푸집 보조재나 마감 바탕재.', origin: 'japanese', example: '"다루끼로 천장 바탕 잡아"', category: 'carpentry' },
  { term: '오비끼', standard: '대각재', description: '81×81mm 크기의 구조용 각목. 자재 임시 받침용.', origin: 'japanese', example: '"오비끼 2개 받쳐"', category: 'carpentry' },
  { term: '약이리', standard: '대형 거푸집', description: '대형 콘크리트 거푸집 구조물.', origin: 'japanese', example: '"약이리 설치 끝났어?"', category: 'carpentry' },
  { term: '다이', standard: '받침대 / 기준대', description: '물건을 받치거나 기준으로 쓰는 대.', origin: 'japanese', example: '"다이 올려놓고 작업해"', category: 'carpentry' },
  { term: '가꾸목', standard: '각재', description: '사각형 단면의 목재. 角木(かくもく)에서 유래.', origin: 'japanese', example: '"가꾸목으로 틀 짜"', category: 'carpentry' },
  { term: '쌍줄', standard: '쌍판', description: '합판 2장을 붙인 거푸집 부재.', origin: 'korean', example: '"쌍줄로 막아"', category: 'carpentry' },
  { term: '탁잡이', standard: '거푸집 고정 부재', description: '거푸집을 고정하는 부재나 방법.', origin: 'korean', example: '"탁잡이 단단히 해"', category: 'carpentry' },
  { term: '지보공', standard: '동바리 / 지지대', description: '거푸집과 슬라브를 지지하는 임시 기둥.', origin: 'korean', example: '"지보공 간격 확인해"', category: 'carpentry' },
  { term: '동바리', standard: '지지 기둥', description: '슬라브 하중을 지지하는 임시 철제 기둥.', origin: 'korean', example: '"동바리 뽑기 전에 양생 확인"', category: 'carpentry' },
  { term: '루바', standard: '루버 / 판재 마감', description: '일정 간격으로 배열한 얇은 판재. Louver에서 유래.', origin: 'english', example: '"루바 간격 일정하게"', category: 'carpentry' },
  { term: '합판', standard: '합판 / 베니어', description: '여러 층 목재를 교차 접착한 판재.', origin: 'korean', example: '"합판 12mm 써"', category: 'carpentry' },
  { term: '먹매김', standard: '먹줄 기준 표시', description: '목재나 콘크리트에 먹줄로 기준선을 표시하는 것.', origin: 'korean', example: '"먹매김 정확히 해"', category: 'carpentry' },
  { term: '기둥 띠', standard: '기둥 보강 철선', description: '기둥 거푸집 주변을 조이는 철선 또는 밴드.', origin: 'korean', example: '"기둥 띠 조여"', category: 'carpentry' },
  { term: '세파', standard: '거푸집 간격 유지재', description: '거푸집 양면 간격을 일정하게 유지하는 금속 부재.', origin: 'english', example: '"세파 300mm 간격으로 박아"', category: 'carpentry' },
  { term: '폼타이', standard: '거푸집 고정 볼트', description: '거푸집 양면을 관통해 고정하는 볼트·너트 세트.', origin: 'english', example: '"폼타이 빠진 거 없는지 확인해"', category: 'carpentry' },

  // ── 4. 미장·방수 ───────────────────────────────────────────────
  { term: '모르타르', standard: '시멘트 반죽', description: '시멘트+모래+물을 섞은 반죽. 타일·벽 마감용.', origin: 'english', example: '"모르타르 배합비 1:3으로 해"', category: 'plaster' },
  { term: '고대', standard: '흙손 / 미장 도구', description: '미장작업에 쓰는 평평한 도구. 코테(コテ)에서 유래.', origin: 'japanese', example: '"고대로 매끄럽게 발라"', category: 'plaster' },
  { term: '코데', standard: '흙손', description: '미장 작업에 쓰는 도구. 鏝(こて)에서 유래.', origin: 'japanese', example: '"코데질 잘해야 돼"', category: 'plaster' },
  { term: '들뜸', standard: '박리 / 뜯김', description: '마감재가 바탕면에서 떨어지는 하자.', origin: 'korean', example: '"타일 들뜸 있으면 다시 해"', category: 'plaster' },
  { term: '빠데', standard: '퍼티 / 메꿈재', description: '표면의 구멍이나 틈을 메우는 충전재. Putty에서 유래.', origin: 'japanese', example: '"빠데 치고 사포질해"', category: 'plaster' },
  { term: '갈레지', standard: '균열 / 크랙', description: '콘크리트나 미장면의 균열.', origin: 'japanese', example: '"갈레지 생기면 에폭시로 메워"', category: 'plaster' },
  { term: '뿜칠', standard: '스프레이 도포', description: '기계로 재료를 뿜어 바르는 작업.', origin: 'korean', example: '"방수 뿜칠 2회 해"', category: 'plaster' },
  { term: '물매', standard: '경사 / 구배', description: '배수를 위한 바닥의 기울기.', origin: 'korean', example: '"물매 1/100 줘"', category: 'plaster' },
  { term: '누수', standard: '물 새는 것', description: '방수가 안 되어 물이 스며드는 것.', origin: 'korean', example: '"옥상 누수 체크해"', category: 'plaster' },
  { term: '면털기', standard: '표면 청소', description: '작업 전 바탕면을 청소하고 이물질 제거.', origin: 'korean', example: '"미장 전에 면털기 해"', category: 'plaster' },
  { term: '초벌', standard: '1차 미장', description: '마감 전 바탕을 잡기 위한 첫 번째 미장.', origin: 'korean', example: '"초벌 바르고 24시간 건조해"', category: 'plaster' },
  { term: '재벌', standard: '2차 미장', description: '초벌 위에 바르는 두 번째 미장.', origin: 'korean', example: '"재벌 얇게 발라"', category: 'plaster' },
  { term: '실링', standard: '균열 보수 주입', description: '균열 부위에 방수재를 주입하는 보수 작업.', origin: 'english', example: '"크랙 실링 해"', category: 'plaster' },
  { term: '우레탄 방수', standard: '우레탄 도막 방수', description: '우레탄 수지를 도포하는 방수 공법.', origin: 'english', example: '"옥상 우레탄 방수 2겹 해"', category: 'plaster' },
  { term: '방수턱', standard: '방수 경계 턱', description: '방수 구역과 비방수 구역의 경계에 쌓는 낮은 턱.', origin: 'korean', example: '"욕실 방수턱 10cm 올려"', category: 'plaster' },

  // ── 5. 타일·마감 ───────────────────────────────────────────────
  { term: '줄눈', standard: '타일 이음새', description: '타일과 타일 사이의 틈새.', origin: 'korean', example: '"줄눈 2mm로 일정하게"', category: 'tile' },
  { term: '메지', standard: '줄눈 채우기', description: '타일 줄눈에 충전재를 채우는 작업. 目地(めじ)에서 유래.', origin: 'japanese', example: '"메지 칠 때 색 맞춰"', category: 'tile' },
  { term: '도련', standard: '마름질 / 재단', description: '타일이나 마감재를 치수에 맞게 자르는 것.', origin: 'japanese', example: '"코너 도련 깔끔하게 해"', category: 'tile' },
  { term: '깨묵', standard: '타일 절단 분진', description: '타일 절단 시 나오는 분진과 조각.', origin: 'korean', example: '"깨묵 청소해"', category: 'tile' },
  { term: '실리콘', standard: '코킹재', description: '이음부 방수·마감용 실런트.', origin: 'english', example: '"욕실 실리콘 다시 쳐"', category: 'tile' },
  { term: '코킹', standard: '이음부 충전', description: '틈새나 이음부를 충전재로 막는 작업.', origin: 'english', example: '"창틀 코킹 해"', category: 'tile' },
  { term: '마구리', standard: '단면 / 끝면', description: '자재의 절단된 끝면.', origin: 'japanese', example: '"마구리 마감 깔끔하게"', category: 'tile' },
  { term: '선대', standard: '걸레받이 / 문틀선', description: '벽 하단이나 문 주변에 대는 마감재.', origin: 'korean', example: '"선대 색깔 맞춰"', category: 'tile' },
  { term: '쫄대', standard: '마감 몰딩', description: '마감 처리에 쓰는 좁고 긴 마감재.', origin: 'korean', example: '"쫄대로 마무리해"', category: 'tile' },
  { term: '논슬립', standard: '미끄럼 방지재', description: '계단이나 바닥에 부착하는 미끄럼 방지 자재.', origin: 'english', example: '"계단 논슬립 붙여"', category: 'tile' },
  { term: '몰딩', standard: '마감 장식재', description: '천장·벽·바닥 경계에 대는 장식용 마감재.', origin: 'english', example: '"몰딩 45도 절단해서 끼워"', category: 'tile' },
  { term: '타일 파단', standard: '타일 절단', description: '타일을 치수에 맞게 자르는 작업.', origin: 'korean', example: '"파단 타일 버려"', category: 'tile' },
  { term: '눈썹', standard: '창문 위 돌출부', description: '창문 위 빗물 막이용 돌출된 콘크리트 부분.', origin: 'korean', example: '"눈썹 방수 해"', category: 'tile' },
  { term: '면취', standard: '모서리 처리', description: '자재 모서리를 45도 또는 둥글게 가공하는 것.', origin: 'japanese', example: '"타일 모서리 면취 해"', category: 'tile' },

  // ── 6. 설비·배관 ───────────────────────────────────────────────
  { term: '이찌부', standard: '1/8인치 (약 3mm)', description: '배관 규격 호칭. 一分(いちぶ)에서 유래.', origin: 'japanese', example: '"이찌부 앙카 박아"', category: 'plumbing' },
  { term: '고부', standard: '5/8인치 (약 16mm)', description: '배관 규격 호칭. 五分(ごぶ)에서 유래.', origin: 'japanese', example: '"고부 볼트"', category: 'plumbing' },
  { term: '앙카', standard: '앵커볼트', description: '구조물 고정용 매립 볼트. Anchor에서 유래.', origin: 'english', example: '"앙카 매입해"', category: 'plumbing' },
  { term: '니플', standard: '연결 짧은관', description: '두 배관을 연결하는 짧은 이음관.', origin: 'english', example: '"니플 연결해"', category: 'plumbing' },
  { term: '소켓', standard: '관 이음 부속', description: '배관 연결용 부속. Socket에서 유래.', origin: 'english', example: '"소켓으로 연결해"', category: 'plumbing' },
  { term: '메꾸라', standard: '막음 캡', description: '배관 끝을 막는 부속. 目暗(めくら)에서 유래.', origin: 'japanese', example: '"배관 끝 메꾸라 해"', category: 'plumbing' },
  { term: '엘보', standard: '배관 꺾임 이음', description: '배관 방향을 바꾸는 이음 부속.', origin: 'english', example: '"90도 엘보 써"', category: 'plumbing' },
  { term: '유니온', standard: '분리형 이음', description: '분해 가능한 배관 연결 부속.', origin: 'english', example: '"유니온으로 연결해야 나중에 뜯어"', category: 'plumbing' },
  { term: '구배', standard: '경사 / 기울기', description: '배관의 기울기. 배수용.', origin: 'korean', example: '"구배 1/100 줘"', category: 'plumbing' },
  { term: '플렉시블', standard: '유연관', description: '구부러지는 연결 호스.', origin: 'english', example: '"플렉시블로 연결해"', category: 'plumbing' },
  { term: '티', standard: '분기 이음', description: '배관을 세 방향으로 분기하는 T자형 부속.', origin: 'english', example: '"티 달아서 분기해"', category: 'plumbing' },
  { term: '레듀서', standard: '관경 축소 이음', description: '큰 관경에서 작은 관경으로 줄이는 이음 부속.', origin: 'english', example: '"레듀서 50A→25A 써"', category: 'plumbing' },
  { term: '체크밸브', standard: '역류 방지 밸브', description: '유체가 한 방향으로만 흐르게 하는 밸브.', origin: 'english', example: '"체크밸브 방향 확인해"', category: 'plumbing' },
  { term: '게이트밸브', standard: '차단 밸브', description: '유체를 완전 개폐하는 밸브.', origin: 'english', example: '"게이트밸브 잠가"', category: 'plumbing' },
  { term: '나사 내기', standard: '나사 가공', description: '배관 끝에 나사산을 내는 작업.', origin: 'korean', example: '"나사 내기 해서 연결해"', category: 'plumbing' },

  // ── 7. 전기 ────────────────────────────────────────────────────
  { term: '후렉시블', standard: '유연전선관', description: '구부러지는 전선 보호관.', origin: 'english', example: '"후렉시블로 빼"', category: 'electric' },
  { term: '박스', standard: '전기 배선함', description: '스위치·콘센트 설치용 함체.', origin: 'english', example: '"박스 매입해"', category: 'electric' },
  { term: 'CD관', standard: '전선 보호관', description: '주황색 파형 전선 보호관.', origin: 'english', example: '"CD관 입선 해"', category: 'electric' },
  { term: '히다리', standard: '왼쪽', description: '작업 위치 지시. 左(ひだり)에서 유래.', origin: 'japanese', example: '"히다리로 30cm"', category: 'electric' },
  { term: '미기', standard: '오른쪽', description: '작업 위치 지시. 右(みぎ)에서 유래.', origin: 'japanese', example: '"미기 쪽 확인해"', category: 'electric' },
  { term: '차단기', standard: '브레이커', description: '과전류 차단 장치.', origin: 'korean', example: '"차단기 내려"', category: 'electric' },
  { term: '접지', standard: '어스', description: '전기 안전을 위한 접지선 연결.', origin: 'korean', example: '"접지 확인해"', category: 'electric' },
  { term: '콘센트', standard: '전기 콘센트', description: '전기 플러그 꽂는 소켓.', origin: 'english', example: '"콘센트 위치 맞게 박아"', category: 'electric' },
  { term: '입선', standard: '전선 넣기', description: '전선관 안에 전선을 집어넣는 작업.', origin: 'korean', example: '"관 깔면 입선 해"', category: 'electric' },
  { term: '단말처리', standard: '전선 끝 처리', description: '전선 끝에 단자 압착이나 절연 처리하는 작업.', origin: 'korean', example: '"단말처리 깔끔하게 해"', category: 'electric' },
  { term: '분전함', standard: '분전반 / 전기 패널', description: '전기를 각 회로로 분배하는 함체.', origin: 'korean', example: '"분전함 위치 도면 확인해"', category: 'electric' },
  { term: '케이블 트레이', standard: '케이블 지지대', description: '전선·케이블을 지지하는 금속 트레이.', origin: 'english', example: '"케이블 트레이 수평 맞춰"', category: 'electric' },
  { term: '금속관', standard: '전선 보호 강관', description: '전선 보호용 금속 전선관 (후강전선관).', origin: 'korean', example: '"금속관으로 노출 배선해"', category: 'electric' },

  // ── 8. 비계·가설 ───────────────────────────────────────────────
  { term: '아시바', standard: '비계', description: '고소 작업을 위해 설치하는 임시 발판 구조물.', origin: 'japanese', example: '"아시바 설치 끝났어?"', category: 'scaffold' },
  { term: '가시바리', standard: '가설 지지대', description: '임시 지지용 구조물. 仮支張り에서 유래.', origin: 'japanese', example: '"가시바리 보강해"', category: 'scaffold' },
  { term: '클램프', standard: '비계 연결 클램프', description: '비계 파이프를 연결·고정하는 금속 부품.', origin: 'english', example: '"클램프 조임 확인해"', category: 'scaffold' },
  { term: '시스템 비계', standard: '조립식 비계', description: '규격화된 부품으로 조립하는 현대식 비계.', origin: 'english', example: '"시스템 비계로 설치해"', category: 'scaffold' },
  { term: '안전망', standard: '추락 방지망', description: '추락 사고 방지용 그물망.', origin: 'korean', example: '"안전망 쳤어?"', category: 'scaffold' },
  { term: '족장', standard: '작업 발판', description: '비계 위에 까는 작업 발판 판재.', origin: 'korean', example: '"족장 단단히 고정해"', category: 'scaffold' },
  { term: '낙하물 방지망', standard: '낙하물 방호망', description: '자재 낙하 방지용 방호망.', origin: 'korean', example: '"낙하물 방지망 확인해"', category: 'scaffold' },
  { term: '가설 펜스', standard: '임시 울타리', description: '공사 구역 경계를 표시하는 임시 울타리.', origin: 'english', example: '"가설 펜스 1m 간격으로 박아"', category: 'scaffold' },
  { term: '규준틀', standard: '수평·수직 기준 틀', description: '건물 위치와 수평·수직 기준을 잡는 가설 틀.', origin: 'korean', example: '"규준틀 먼저 잡고 시작해"', category: 'scaffold' },
  { term: '가설 엘리베이터', standard: '임시 수직 이동기', description: '자재·인부 이동용 임시 엘리베이터.', origin: 'english', example: '"가설 엘리베이터 운영해"', category: 'scaffold' },
  { term: '타워크레인', standard: '고층 양중 크레인', description: '고층 공사에 쓰는 고정식 대형 크레인.', origin: 'english', example: '"타워크레인으로 올려"', category: 'scaffold' },
  { term: '신호수', standard: '유도원', description: '장비 작업 시 충돌·협착 사고 방지를 위한 안전 유도원.', origin: 'korean', example: '"크레인 작업 시 신호수 세워"', category: 'scaffold' },

  // ── 9. 도장·도배 ───────────────────────────────────────────────
  { term: '퍼티', standard: '빠데 / 메꿈재', description: '표면 결함을 메우는 충전재.', origin: 'english', example: '"퍼티 곱게 발라"', category: 'paint' },
  { term: '롤러', standard: '페인트 롤러', description: '페인트 도포용 롤러 도구.', origin: 'english', example: '"롤러로 1차 도장"', category: 'paint' },
  { term: '붓', standard: '페인트 붓', description: '페인트 도포용 붓.', origin: 'korean', example: '"엣지는 붓으로 해"', category: 'paint' },
  { term: '마스킹', standard: '보양 테이프 작업', description: '도장 전 주변 보호를 위해 테이프 붙이는 작업.', origin: 'english', example: '"마스킹 꼼꼼히 해"', category: 'paint' },
  { term: '초배', standard: '초벌 도배', description: '도배지 붙이기 전 바탕용 종이 붙이기.', origin: 'korean', example: '"초배 말리고 정배해"', category: 'paint' },
  { term: '정배', standard: '완성 도배', description: '마감 도배지 붙이기.', origin: 'korean', example: '"정배 시작해"', category: 'paint' },
  { term: '에폭시', standard: '에폭시 수지 도료', description: '바닥이나 면에 바르는 강력 도료.', origin: 'english', example: '"주차장 에폭시 도장"', category: 'paint' },
  { term: '프라이머', standard: '바탕 처리제', description: '도장 전 바탕면 흡수 조절 및 접착력 향상재.', origin: 'english', example: '"프라이머 먼저 발라"', category: 'paint' },
  { term: '신나', standard: '희석제', description: '페인트 점도 조절용 용제. Thinner에서 유래.', origin: 'english', example: '"신나로 적당히 희석해"', category: 'paint' },
  { term: '뿜도장', standard: '스프레이 도장', description: '스프레이 건으로 페인트를 뿜어 도포하는 작업.', origin: 'korean', example: '"뿜도장으로 균일하게 해"', category: 'paint' },
  { term: '결로', standard: '이슬 맺힘', description: '온도 차로 벽면에 수분이 맺히는 현상.', origin: 'korean', example: '"결로 생기면 단열 문제야"', category: 'paint' },
  { term: '풀', standard: '도배 풀', description: '도배지를 붙이는 접착제.', origin: 'korean', example: '"풀 되게 개서 써"', category: 'paint' },
  { term: '보양', standard: '기존 마감 보호', description: '공사 중 완성된 마감재를 훼손하지 않도록 덮어 보호하는 작업.', origin: 'korean', example: '"바닥 보양 해놔"', category: 'paint' },
];

// ── 단위 변환 상수 (변환기 전용, 일반 용어 카드에서는 제외) ──────────
export const UNIT_CONVERSIONS = {
  PYEONG_TO_M2: 3.3058,
  M2_TO_PYEONG: 1 / 3.3058,
  JA_TO_CM: 30.3,
  CHI_TO_CM: 3.03,
  PUN_TO_CM: 0.303,
  GAN_TO_CM: 180.9,
  INCH_TO_MM: 25.4,
};
