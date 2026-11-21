// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
              title: '일회용 비밀 메모란 무엇인가요?',
              description:
                '일회용 비밀 메모(Burn Message)는 한 번 열람하면 자동으로 파괴되는 비밀 메시지를 100% 브라우저 안에서만 생성·전달하는 보안 도구입니다. 메시지는 URL의 해시(#) 부분에 압축·인코딩되어 담기는데, 웹 표준상 URL 해시는 서버로 전송되지 않으며 theutilhub은 정적 호스팅이라 서버에 메시지를 처리·저장하는 로직 자체가 존재하지 않습니다. 두 가지 안전장치가 작동합니다 — 링크는 생성 후 1시간이 지나면 자동 만료되고, 수신자가 처음 열람하는 즉시 기기에 파괴 마킹이 남아 다시 열 수 없습니다. 카카오톡으로 서버 비밀번호를 보내거나 슬랙으로 일회용 인증 코드를 공유할 때, 대화방 기록에 민감 정보가 영구 보존되는 위험을 줄여줍니다. 다만 이 도구는 우발적 노출을 막기 위한 보조 수단이며, 수신자가 화면을 캡처하거나 시크릿 모드로 열면 파괴 기능이 우회될 수 있으므로 금융·의료·법률 등 고위험 정보에는 전용 보안 시스템을 사용하시기 바랍니다.',
              useCases: [
                { icon: '🔑', title: '비밀번호 안전 전달', desc: '팀원에게 서버 관리자 비밀번호를 메신저로 보낼 때, 대화방에 영구 보존되지 않는 일회용 링크로 전달하여 사후 노출 위험을 차단합니다.' },
                { icon: '💳', title: '계좌번호·인증코드 공유', desc: '가족에게 계좌번호나 일회용 인증 코드를 1시간 후 자동 파괴 링크로 보내, 카카오톡 대화 기록에서 영구히 지워지도록 합니다.' },
                { icon: '🎫', title: '예매 정보·티켓 코드', desc: '콘서트나 비행기 티켓 예매 번호처럼 한 번 확인하면 그만인 정보를, 메신저 검색 기록에 남기지 않고 1회용으로 전달합니다.' },
                { icon: '🏢', title: '사내 기밀 메모', desc: '슬랙·팀즈 채널에 민감한 인사 정보나 미공개 프로젝트 코드네임을 공유할 때, 채널 검색 기록에 남지 않는 일회용 링크로 전달합니다.' },
              ],
              steps: [
                { step: '비밀 메시지 입력', desc: '상단 입력창에 메시지를 입력합니다. 최대 1,500자까지 가능하며, 우측 하단 실시간 카운터로 글자 수를 확인할 수 있습니다.' },
                { step: '1시간짜리 링크 생성', desc: '버튼을 클릭하면 브라우저 내부에서 메시지가 gzip 압축·인코딩됩니다. 어떤 서버에도 전송되지 않고 URL 해시에만 담깁니다.' },
                { step: '링크 복사 및 전달', desc: '복사 버튼으로 링크를 복사한 뒤 메신저로 전달합니다. 링크는 생성 후 1시간 동안만 유효합니다.' },
                { step: '수신자 1회 열람', desc: '수신자가 열람 버튼을 누르는 즉시 메시지가 노출되고, 동시에 기기에 파괴 마킹이 남아 같은 기기·브라우저에서는 다시 열 수 없습니다.' },
              ],
              faqs: [
                { q: '정말 서버에 메시지가 저장되지 않나요? 어떻게 그런 게 가능하죠?', a: 'URL의 해시(#) 부분은 웹 표준상 브라우저가 서버로 전송하지 않습니다. theutilhub은 정적 호스팅 사이트라 서버에 메시지를 받거나 처리하는 코드 자체가 없으며, 압축·인코딩·복호화 모든 과정이 사용자 브라우저 안에서만 일어납니다. 개발자 도구의 네트워크 탭으로 직접 확인하실 수 있습니다.' },
                { q: '수신자가 메시지를 캡처하거나 복사하면 어떻게 되나요?', a: '막을 수 없습니다. 이 도구는 대화방에 민감 정보가 영구 보존되는 우발적 노출을 줄이기 위한 보조 수단이지, 의도적인 보존·복사를 차단하는 시스템이 아닙니다. 캡처를 막아야 하는 고위험 정보에는 워터마크·DRM이 적용된 전용 보안 솔루션을 사용하세요.' },
                { q: '수신자가 시크릿 모드로 열거나 다른 브라우저로 열면 두 번 볼 수 있지 않나요?', a: '맞습니다. 파괴 마킹은 각 브라우저의 localStorage에 저장되므로, 시크릿 모드나 다른 브라우저는 별도 저장소를 써서 마킹이 공유되지 않습니다. 다만 1시간 자동 만료는 링크 자체(payload의 timestamp)에 박혀 있어 어떤 환경에서 열든 동일하게 작동합니다.' },
                { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '본 도구는 우발적 노출을 줄이는 보조 도구이며 진짜 보안 시스템이 아닙니다. 금융·의료·법률 등 유출 시 심각한 피해가 발생하는 고위험 정보에는 종단간 암호화 메신저나 기업용 보안 솔루션 등 전문 시스템을 사용하시기 바랍니다.' },
              ],
            },
  en: {
              title: 'What is Burn Message?',
              description:
                'Burn Message is a security tool that creates and delivers self-destructing secret messages entirely inside your browser. The message is compressed and encoded into the URL hash (#) — and by web standard, the URL hash is never sent to the server. theutilhub is statically hosted, so there is literally no server-side code that receives or stores your message; compression, encoding, and decryption all happen in the browser. Two safeguards apply: the link auto-expires one hour after creation, and the moment the recipient opens it for the first time, a destruction marker is saved on their device so it cannot be reopened. It is ideal for sending a server password over KakaoTalk or sharing a one-time verification code over Slack without leaving sensitive data permanently in chat history. However, this is an aid against accidental exposure — if the recipient screenshots it or opens it in incognito mode, the burn feature can be bypassed, so use a dedicated security system for high-risk financial, medical, or legal information.',
              useCases: [
                { icon: '🔑', title: 'Securely Share Passwords', desc: 'When sending a server admin password to a teammate over a messenger, deliver it as a one-time link that does not persist in the chat history.' },
                { icon: '💳', title: 'Account Numbers & Codes', desc: 'Send family members an account number or one-time verification code as a link that self-destructs in 1 hour, erasing it from chat history.' },
                { icon: '🎫', title: 'Booking & Ticket Codes', desc: 'Share concert or flight booking codes — info you only need to view once — without leaving it in messenger search history.' },
                { icon: '🏢', title: 'Internal Confidential Memos', desc: 'Share sensitive HR info or unreleased project codenames on Slack/Teams as a one-time link that leaves no trace in channel search.' },
              ],
              steps: [
                { step: 'Type your secret message', desc: 'Enter your message in the top input. Up to 1,500 characters, with a live counter at the bottom right showing your progress.' },
                { step: 'Create a 1-hour link', desc: 'Click the button — the message is gzip-compressed and encoded inside your browser. It is never sent to any server; it lives only in the URL hash.' },
                { step: 'Copy and send the link', desc: 'Use the copy button, then share the link via messenger. The link is valid for only 1 hour after creation.' },
                { step: 'Recipient reads once', desc: 'The moment the recipient taps reveal, the message appears and a destruction marker is saved on their device, preventing reopening on the same browser.' },
              ],
              faqs: [
                { q: 'Is the message really not stored on a server? How is that possible?', a: 'The URL hash (#) is, by web standard, never transmitted to the server by the browser. theutilhub is a static host with no server-side code to receive or process messages — compression, encoding, and decryption all run in your browser. You can verify this yourself in the Network tab of your browser dev tools.' },
                { q: 'What if the recipient screenshots or copies the message?', a: 'It cannot be prevented. This tool reduces accidental exposure (sensitive data lingering in chat logs); it is not a system that blocks intentional retention or copying. For high-risk info where screenshots must be prevented, use a dedicated security solution with watermarking or DRM.' },
                { q: 'Can the recipient view it twice via incognito or another browser?', a: 'Yes. The destruction marker is stored in each browser\'s localStorage, so incognito mode or a different browser uses a separate store and the marker is not shared. However, the 1-hour auto-expiry is embedded in the link itself (the payload timestamp), so it works identically in any environment.' },
                { q: 'Can I use this as official security infrastructure?', a: 'No. This is an aid against accidental exposure, not a real security system. For high-risk financial, medical, or legal information where leaks cause serious harm, use professional systems such as end-to-end encrypted messengers or enterprise security solutions.' },
              ],
            },
};
