import type { SeoContent } from '@/app/components/SeoSection';

/**
 * 하단 SEO 섹션 + 한국어 FAQPage JSON-LD가 함께 쓰는 데이터.
 * (page.tsx의 faqSchema가 ko.faqs를 그대로 사용하므로 화면 FAQ와 구조화 데이터가 항상 일치한다)
 */
export const FORMATION_PLANNER_SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
    title: 'Formation Playmaker Pro — 스마트 범례 & 전술 보드',
    description:
      'Formation Playmaker Pro는 축구·농구·배구·테니스 코트와 공연 무대, 모눈종이 위에 선수나 출연자를 동그란 말로 올려 두고 위치와 동선을 짜는 전술 보드입니다. ' +
      '말마다 10가지 색상 중 하나와 최대 2글자의 등번호나 문자를 붙일 수 있고, 마우스나 손가락으로 끌어 원하는 자리에 놓으면 됩니다. 글자색은 말 색상에 맞춰 검은색과 흰색 중 잘 보이는 쪽으로 자동 선택됩니다. ' +
      '말을 추가할 때마다 \'스마트 범례\'에 칸이 자동으로 생기는데, 여기에 \'주장 김민수\', \'센터 보컬\'처럼 최대 20자 이름을 적어 두면 등번호만으로는 알 수 없는 역할까지 한눈에 정리됩니다. ' +
      '예를 들어 축구 배경에 11명을 올리고 \'이미지 저장\'을 누르면, 보드 오른쪽에 폭 260픽셀짜리 범례 패널이 붙고 위쪽에 전술 제목 띠가 들어간 PNG 한 장이 만들어집니다. ' +
      '\'경로 표시\'를 켜고 말을 움직이면 지나간 길이 말과 같은 색의 선으로 남아 오버래핑이나 무대 위 이동 동선을 설명하기 좋습니다. ' +
      '\'녹화\' 버튼을 누르면 보드와 범례를 합친 화면을 초당 30프레임 WebM 영상으로 기록하며, 버튼에 60초부터 줄어드는 카운트다운이 표시되고 시간이 다 되면 자동으로 멈춘 뒤 파일이 내려받아집니다. ' +
      '실수로 옮기거나 지운 말은 \'되돌리기\' 버튼이나 Ctrl+Z로 최대 30단계까지 되돌릴 수 있습니다. ' +
      '보드 내용과 입력한 이름은 서버로 전송되지 않고 브라우저 안에서만 그려집니다.',
    useCases: [
      {
        icon: '⚽',
        title: '경기 전 포메이션 브리핑',
        desc: '4-4-2나 3-5-2 같은 포메이션을 축구 배경에 배치하고 선수 이름을 범례에 적어 이미지로 저장하세요. 단톡방에 올려 두면 경기 전에 각자 자기 위치를 미리 확인할 수 있습니다.',
      },
      {
        icon: '🏀',
        title: '세트 플레이 동선 설명',
        desc: '\'경로 표시\'를 켠 채 농구 코트에서 스크린과 컷인 움직임을 순서대로 끌어 보이고 녹화하세요. 화이트보드로 5분 걸리던 설명을 1분 이내 영상 하나로 전달할 수 있습니다.',
      },
      {
        icon: '🎭',
        title: '공연·안무 대형 짜기',
        desc: '무대 배경에서 댄서나 합창 단원의 자리를 정하고 곡 구간마다 이미지로 저장해 두세요. 범례에 이름과 파트를 함께 적어 두면 리허설 때 자리를 헷갈리는 일이 확 줄어듭니다.',
      },
      {
        icon: '📐',
        title: '행사장·교실 자리 배치',
        desc: '모눈 배경을 쓰면 체육대회 입장 대열, 교실 모둠 자리, 행사 부스 위치처럼 경기장이 아닌 공간도 칸에 맞춰 가지런히 배치하고 이미지 한 장으로 공유할 수 있습니다.',
      },
    ],
    steps: [
      {
        step: '제목 입력과 배경 선택',
        desc: '맨 위 칸에 \'3월 리그 결승 전술\'처럼 최대 50자 제목을 적고, 축구·농구·배구·테니스·무대·모눈 버튼 중 하나를 눌러 보드 배경을 고릅니다.',
      },
      {
        step: '말 추가와 배치',
        desc: '\'숫자/문자\' 칸에 등번호나 이니셜을 최대 2글자로 넣고 색상을 고른 뒤 [추가]를 누르세요. 보드 가운데 근처에 생긴 말을 끌어 원하는 위치로 옮기면 됩니다.',
      },
      {
        step: '범례에 이름 적기',
        desc: 'PC에서는 오른쪽 \'스마트 범례\' 패널에, 모바일에서는 보드 아래 \'범례 보기\' 버튼으로 여는 창에 각 말의 이름을 입력합니다. PC에서는 범례 항목을 누르면 보드의 해당 말이 선택됩니다.',
      },
      {
        step: '이미지 저장 또는 녹화',
        desc: '\'이미지 저장\'은 범례가 붙은 PNG를, \'녹화\'는 최대 60초 WebM 영상을 내려받습니다. 움직임을 담으려면 녹화를 시작한 뒤 말을 끌어 옮기고, 끝나면 버튼을 다시 눌러 멈추세요.',
      },
    ],
    faqs: [
      {
        q: '범례에 몇 명까지 넣을 수 있나요?',
        a: '개수 제한은 없습니다. 다만 저장 이미지와 영상 속 범례는 보드 높이 안에 모든 이름을 나눠 담기 때문에 사람이 많아질수록 한 줄의 높이가 줄어듭니다. 일반적인 PC 화면에서는 15~20명 정도까지 글자가 겹치지 않고 깔끔하게 보이며, 15자가 넘는 이름은 내보낸 파일에서 말줄임표로 잘립니다.',
      },
      {
        q: '녹화된 영상에도 범례가 나오나요?',
        a: '네. 녹화를 시작하면 보드 오른쪽에 범례 패널을 붙인 화면을 초당 30번 새로 그려 기록하므로, 녹화 도중 이름을 고치거나 말을 추가해도 영상 속 범례에 바로 반영됩니다. 다만 이미지 저장과 달리 보드 위쪽 제목 띠는 영상에 들어가지 않고, 제목은 범례 상단에 표시됩니다.',
      },
      {
        q: '왜 녹화 시간이 60초로 제한되나요?',
        a: '영상을 서버에서 만들지 않고 브라우저의 MediaRecorder 기능으로 직접 인코딩하기 때문입니다. 녹화가 길어질수록 메모리에 쌓이는 데이터와 파일 크기가 커져 휴대폰이나 오래된 PC에서 끊길 수 있어 최대 60초로 정했습니다. 60초가 되면 자동으로 멈추고 파일이 저장됩니다.',
      },
      {
        q: '저장한 영상이 재생되지 않아요.',
        a: '녹화 파일은 WebM 형식(.webm)으로 저장됩니다. 크롬, 엣지, 파이어폭스 같은 브라우저나 VLC 플레이어에서는 바로 열리지만, 기기나 앱에 따라 WebM을 지원하지 않을 수 있으니 그럴 때는 MP4로 변환한 뒤 공유하세요. 브라우저가 녹화 기능 자체를 지원하지 않으면 \'이 브라우저는 녹화를 지원하지 않습니다\'라는 안내가 뜹니다.',
      },
      {
        q: '작업한 보드는 따로 저장되나요?',
        a: '보드 상태는 페이지를 열어 둔 동안 브라우저 메모리에만 있고, 서버나 브라우저 저장소에 따로 보관되지 않습니다. 새로고침하거나 창을 닫으면 말과 범례가 모두 사라지므로 완성한 대형은 \'이미지 저장\'으로 PNG를 받아 두세요. 입력한 이름 역시 외부로 전송되지 않습니다.',
      },
      {
        q: '실수로 지운 말을 되살릴 수 있나요?',
        a: '네. \'되돌리기\' 버튼이나 Ctrl+Z(맥은 Cmd+Z)로 말 추가, 이동, 삭제를 최대 30단계까지 되돌릴 수 있습니다. 말을 선택한 상태에서 Delete·Backspace 키를 누르면 삭제되고 Esc 키는 선택만 해제합니다. 단, \'경로 표시\'로 남긴 선은 되돌리기 대상이 아니어서 \'경로 지우기\'로 한꺼번에 지웁니다.',
      },
    ],
  },
  en: {
    title: 'Formation Playmaker Pro — Smart Legend & Tactics Board',
    description:
      'Formation Playmaker Pro is a tactics board for planning where people stand and how they move. ' +
      'Pick a soccer pitch, basketball court, volleyball court, tennis court, stage or plain grid, then drop round pieces onto it. ' +
      'Each piece takes one of 10 colors and up to two characters, such as a shirt number or an initial, and you drag it into place with a mouse or a finger; the label switches between black and white automatically so it stays readable. ' +
      'Every time you add a piece, the Smart Legend creates a matching row where you can type a name of up to 20 characters, so "7" becomes "Right wing – Alex" without any extra notes. ' +
      'For example, place 11 players on the soccer background and press Save Image: you get a single PNG with the board on the left, a 260-pixel legend panel on the right and your tactic title in a bar across the top. ' +
      'Turn on Show Path before dragging and each move leaves a line in the piece\'s color, which is handy for overlapping runs or stage transitions. ' +
      'Record captures the board and legend together as a 30 fps WebM video, counts down from 60 seconds on the button, then stops and downloads the file automatically. ' +
      'Undo, or Ctrl+Z, steps back through up to 30 changes. ' +
      'The board and the names you type are drawn entirely in your browser and are never uploaded to a server.',
    useCases: [
      {
        icon: '⚽',
        title: 'Pre-match formation briefing',
        desc: 'Lay out a 4-4-2 or 3-5-2 on the soccer pitch, type each player\'s name into the legend and save it as an image. Posting it in the team chat lets everyone check their position before kickoff.',
      },
      {
        icon: '🏀',
        title: 'Explaining set plays',
        desc: 'Turn on Show Path on the basketball court, drag the screens and cuts in order and record it. A sequence that takes five minutes at a whiteboard fits into one video of under a minute.',
      },
      {
        icon: '🎭',
        title: 'Stage blocking and choreography',
        desc: 'Use the stage background to place dancers or choir members, then save an image for each section of the song. Names and parts written in the legend cut down on confusion during rehearsal.',
      },
      {
        icon: '📐',
        title: 'Seating and event layouts',
        desc: 'The grid background works for spaces that are not sports fields, such as sports-day lineups, classroom group tables or booth positions at an event, all aligned to squares and easy to share as one image.',
      },
    ],
    steps: [
      {
        step: 'Add a title and pick a background',
        desc: 'Type a title of up to 50 characters, such as "League final – plan B", into the top field, then choose Soccer, Basketball, Volleyball, Tennis, Stage or Grid for the board.',
      },
      {
        step: 'Add and place pieces',
        desc: 'Enter a number or initial (two characters max) in the Num/Char box, pick a color and click Add. The new piece appears near the middle of the board, and you drag it to its spot.',
      },
      {
        step: 'Name pieces in the legend',
        desc: 'On desktop, type names into the Smart Legend panel on the right; on mobile, tap the Legend button below the board to open the drawer. On desktop, clicking a legend row selects that piece.',
      },
      {
        step: 'Save an image or record',
        desc: 'Save Image downloads a PNG with the legend attached, and Record captures up to 60 seconds of WebM video. Start recording, drag pieces to show the movement, then press the button again to stop.',
      },
    ],
    faqs: [
      {
        q: 'How many pieces can the legend hold?',
        a: 'There is no hard limit. In saved images and videos, though, the legend fits every name into the height of the board, so each row gets shorter as you add more. On a typical desktop screen about 15–20 names stay readable without overlapping, and names longer than 15 characters are shortened with an ellipsis in the exported file.',
      },
      {
        q: 'Does the legend appear in the recording?',
        a: 'Yes. While recording, the tool redraws a combined frame with the legend panel attached to the right of the board 30 times per second, so renaming or adding pieces mid-recording shows up in the video right away. Unlike Save Image, the title bar across the top of the board is not included; the title appears at the top of the legend instead.',
      },
      {
        q: 'Why is recording limited to 60 seconds?',
        a: 'Video is encoded directly in your browser with the MediaRecorder API rather than on a server. Longer recordings keep more data in memory and produce larger files, which can stutter on phones and older laptops, so recording is capped at 60 seconds and then stops and downloads automatically.',
      },
      {
        q: 'My recorded video won\'t play. What can I do?',
        a: 'Recordings are saved as WebM (.webm) files. Chrome, Edge, Firefox and players such as VLC open them directly, but some devices and apps do not support WebM, so convert the file to MP4 before sharing in that case. If your browser cannot record at all, the tool shows a "Recording is not supported in this browser" message instead.',
      },
      {
        q: 'Is my board saved anywhere?',
        a: 'The board lives only in your browser\'s memory while the page is open. It is not uploaded and not kept in browser storage, so refreshing or closing the tab clears every piece and name. Once a formation is finished, press Save Image to keep a PNG copy on your device.',
      },
      {
        q: 'Can I undo a mistake?',
        a: 'Yes. The Undo button or Ctrl+Z (Cmd+Z on Mac) reverses adding, moving and deleting pieces, up to 30 steps back. With a piece selected, Delete or Backspace removes it and Esc clears the selection. Lines drawn with Show Path are not part of undo; use Clear Paths to remove them all at once.',
      },
    ],
  },
};
