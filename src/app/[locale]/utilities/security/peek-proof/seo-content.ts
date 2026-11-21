// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '어깨너머 시선 차단 에디터란 무엇인가요?',
          description:
            '어깨너머 시선 차단 에디터는 카페·지하철·사무실처럼 공개된 공간에서 옆 사람의 시선으로부터 내가 쓰는 글을 보호하는 100% 브라우저 기반 텍스트 에디터입니다. 핵심 원리는 "활성 줄 추적"입니다 — 커서가 위치한 줄과 그 위아래 한 줄만 선명하게 보이고, 나머지 줄은 모두 흐림(블러) 처리되어 전체 맥락을 한눈에 읽기 어렵게 만듭니다. 본인은 커서를 따라 자연스럽게 읽고 쓸 수 있지만, 옆에서 흘끗 보는 사람에게는 흐려진 글자만 보입니다. 기술적으로는 입력을 담당하는 투명한 textarea와 시각 효과를 담당하는 별도 레이어를 겹친 "가상 거울 패턴"을 사용해, 한글 입력 시 자모 분리 없이 안정적으로 동작합니다. 보호 강도(흐림 정도)와 글자 크기는 슬라이더로 조절할 수 있고, ESC 키나 눈 버튼을 누르면 모든 줄을 즉시 가리는 패닉 모드가 작동합니다. 입력한 글은 어떤 서버로도 전송되지 않으며 새로고침하면 사라지므로, 민감한 메모를 공공장소에서 잠깐 작성할 때 안심하고 사용할 수 있습니다.',
          useCases: [
            { icon: '☕', title: '카페에서 작업할 때', desc: '카페나 코워킹 스페이스의 좁은 테이블에서 노트북으로 일기·업무 메모를 작성할 때, 바로 옆자리 사람의 시선으로부터 내용을 가려 사생활을 지킵니다.' },
            { icon: '🚇', title: '대중교통 이동 중', desc: '지하철·버스에서 휴대폰이나 노트북으로 글을 쓸 때, 뒤나 옆에서 화면을 들여다보는 시선으로부터 작성 중인 텍스트를 보호합니다.' },
            { icon: '🏢', title: '오픈 오피스 환경', desc: '칸막이 없는 사무실에서 동료가 지나다닐 때, 민감한 인사 메모나 미공개 기획 내용을 흐림 처리하여 우발적 노출을 줄입니다.' },
            { icon: '🔑', title: '민감 정보 임시 입력', desc: '비밀번호 힌트, 계좌 메모, 개인 일기처럼 잠깐 입력하지만 옆에서 보면 곤란한 내용을 작성할 때 한 줄씩만 노출해 안전하게 다룹니다.' },
          ],
          steps: [
            { step: '에디터에 글 입력', desc: '우측 보호 뷰어의 검은 입력 영역을 클릭하고 글을 입력합니다. 커서가 있는 줄만 네온 그린으로 선명해지고 나머지는 흐려지기 시작합니다.' },
            { step: '보호 강도 조절', desc: '좌측 설정 패널의 보호 강도 슬라이더로 흐림 정도를 2~12px 범위에서 조절합니다. 주변이 붐빌수록 강하게 설정하세요.' },
            { step: '한 줄에 한 문장씩 작성', desc: 'Enter로 자주 줄바꿈하여 한 줄에 한 문장 단위로 쓰면, 흐려진 줄에서 의미를 읽어내기 어려워 보호 효과가 가장 좋습니다.' },
            { step: '필요 시 패닉 모드', desc: '누가 가까이 다가오면 ESC 키를 누르거나 우측 상단 눈 버튼을 클릭하세요. 커서 줄을 포함한 모든 줄이 즉시 강하게 흐려집니다.' },
          ],
          faqs: [
            { q: '입력한 글이 서버로 전송되거나 어딘가에 저장되나요?', a: '아닙니다. 이 도구는 100% 사용자 브라우저 안에서만 작동하며, theutilhub은 정적 호스팅 사이트라 입력한 글을 받거나 저장하는 서버 코드 자체가 존재하지 않습니다. 흐림 처리와 커서 추적 모든 과정이 사용자 기기 안에서만 일어나고, 페이지를 새로고침하면 작성한 내용은 완전히 사라집니다.' },
            { q: '한글을 입력하면 글자가 깨지거나 자모가 분리되지 않나요?', a: '깨지지 않습니다. 실제 입력은 브라우저 네이티브 textarea가 처리하고 시각 효과는 별도 레이어가 단순 미러링하는 가상 거울 구조이며, 한글 IME 조합 가드를 적용해 조합 중에는 화면 갱신을 미루도록 설계했습니다. 덕분에 한글 입력 시 자모 분리 문제 없이 자연스럽게 타이핑 가능합니다.' },
            { q: '흐림 강도는 어느 정도로 설정하는 게 좋나요?', a: '주변 환경에 따라 다릅니다. 옆자리와 거리가 있는 카페라면 4~6px로 충분하고, 사람이 바짝 붙는 만원 지하철이라면 8~12px로 강하게 설정하는 것을 권장합니다. 본인은 커서 줄이 항상 선명하므로 강하게 설정해도 읽고 쓰는 데 지장이 없습니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '본 도구는 일상적인 어깨너머 시선으로부터 우발적 노출을 줄이는 보조 수단이며, 카메라 촬영이나 화면 녹화까지 막는 보안 시스템이 아닙니다. 금융·의료·법률 등 유출 시 심각한 피해가 발생하는 고위험 정보에는 전용 보안 환경과 전문 솔루션을 사용하시기 바랍니다.' },
          ],
        },
  en: {
          title: 'What is the Peek-Proof Editor?',
          description:
            'The Peek-Proof Editor is a 100% browser-based text editor that shields what you write from the eyes of people next to you in public spaces like cafes, subways, and offices. The core principle is "active line tracking" — only the line your cursor sits on, plus one line above and below, stays sharp; every other line is blurred so the overall context is hard to read at a glance. You can read and write naturally as your cursor moves, while anyone glancing from the side sees only blurred characters. Technically it uses a "virtual mirror pattern" — a transparent textarea that handles input layered with a separate visual layer that applies the blur — so Korean and other IME input works reliably without character corruption. You can adjust the protection strength (blur amount) and font size with sliders, and pressing ESC or the eye button triggers a panic mode that instantly blurs every line. Your text is never sent to any server and disappears on refresh, so you can comfortably jot down sensitive notes in public.',
          useCases: [
            { icon: '☕', title: 'Working at a Cafe', desc: 'When writing a journal or work notes on your laptop at a cramped cafe or coworking table, hide the content from the person right beside you and protect your privacy.' },
            { icon: '🚇', title: 'Commuting on Transit', desc: 'When typing on your phone or laptop on a subway or bus, protect the text you are writing from people peering over your shoulder from behind or beside you.' },
            { icon: '🏢', title: 'Open Office Layouts', desc: 'In a partition-free office where colleagues walk past, blur sensitive HR memos or unreleased plans to reduce the risk of accidental over-the-shoulder exposure.' },
            { icon: '🔑', title: 'Jotting Sensitive Info', desc: 'When briefly entering things like password hints, account memos, or a private diary that you would not want seen, reveal only one line at a time to handle it safely.' },
          ],
          steps: [
            { step: 'Type into the editor', desc: 'Click the dark input area in the protected viewer on the right and start typing. Only the cursor line turns sharp neon green while the rest begin to blur.' },
            { step: 'Adjust protection strength', desc: 'Use the protection strength slider in the left settings panel to set the blur between 2 and 12 px. The more crowded your surroundings, the stronger you should set it.' },
            { step: 'Write one sentence per line', desc: 'Press Enter often to keep one sentence per line — blurred single-sentence lines are much harder to read, giving the strongest protection effect.' },
            { step: 'Use panic mode when needed', desc: 'If someone approaches, press ESC or click the eye button at the top right. Every line, including the cursor line, instantly becomes heavily blurred.' },
          ],
          faqs: [
            { q: 'Is my text sent to a server or stored anywhere?', a: 'No. This tool runs entirely inside your browser, and theutilhub is a static host with no server-side code to receive or store your text. The blurring and cursor tracking all happen on your device, and everything you wrote disappears completely when you refresh the page.' },
            { q: 'Does Korean or IME input get corrupted or split into letters?', a: 'No. Actual input is handled by the native browser textarea while the visual layer simply mirrors it in a virtual mirror structure, and an IME composition guard defers screen updates while you are composing. As a result, Korean and other composed input types naturally without character-splitting bugs.' },
            { q: 'How strong should I set the blur?', a: 'It depends on your surroundings. In a cafe with some distance from the next seat, 4–6 px is enough; on a packed subway where people stand close, 8–12 px is recommended. Since your cursor line always stays sharp, a strong setting does not hinder your own reading or writing at all.' },
            { q: 'Can I use this as an official security tool?', a: 'No. This is an aid that reduces accidental exposure from everyday over-the-shoulder glances, not a system that blocks camera photos or screen recording. For high-risk financial, medical, or legal information where leaks cause serious harm, use a dedicated secure environment and professional solutions.' },
          ],
        },
};
