// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '스마트 대량 파일명 변환기란 무엇인가요?',
          description:
            '스마트 대량 파일명 변환기는 여러 개의 파일 이름을 한 번에 규칙적으로 바꿔주는 100% 브라우저 기반 도구입니다. 윈도우 탐색기의 기본 이름 바꾸기는 순번이 "(1)" "(2)"처럼 지저분하게 붙고 세부 제어가 어렵지만, 이 도구는 찾기·바꾸기, 접두어·접미어 추가, 001 형식의 자유로운 넘버링, 오늘 날짜 삽입, 대소문자 변경, 공백 정리, 그리고 정규식까지 9가지 규칙을 정해진 순서대로 조합해 즉시 적용합니다. 가장 큰 특징은 보안입니다 — 파일을 끌어다 놓아도 어떤 서버로도 전송되지 않고, 이름 변경부터 ZIP 압축, 폴더 직접 저장까지 모든 처리가 사용자 브라우저 안에서만 일어납니다. 또한 윈도우·맥에서 파일명에 쓸 수 없는 특수문자(\\ / : * ? " < > |)나 예약어(CON, PRN 등)가 결과에 포함되면 미리보기 단계에서 자동으로 안전한 문자로 변환하고 해당 행에 표시해주므로, 저장 단계에서 오류로 멈추는 일이 없습니다. 변경 후 이름이 서로 겹치면 자동으로 _1, _2를 붙여 충돌도 회피합니다. 결과는 비포·애프터로 실시간 미리보기되며, 만족스러우면 ZIP으로 내려받거나(500개·1GB 이하) 지원 브라우저에서는 폴더에 직접 저장할 수 있습니다. 사진 정리, 자료 백업, 프로젝트 에셋 정돈 등 반복적인 이름 작업을 단 몇 초로 줄여줍니다.',
          useCases: [
            { icon: '📷', title: '여행 사진 일괄 정리', desc: '카메라가 붙인 DSC_0001 같은 무의미한 이름을 "제주여행_001" 형식으로 날짜와 넘버링을 더해 한 번에 깔끔하게 정리하고 ZIP으로 백업합니다.' },
            { icon: '🗂️', title: '업무 문서 규칙 통일', desc: '팀에서 제각각으로 저장된 보고서 파일에 접두어와 작성 날짜를 일괄로 붙여 사내 명명 규칙에 맞게 한 번에 표준화하여 검색성을 높입니다.' },
            { icon: '🎨', title: '디자인·개발 에셋 정돈', desc: '아이콘이나 이미지 에셋의 확장자를 통일하고 정규식으로 불필요한 접미어를 제거해 프로젝트 폴더를 일관된 규칙으로 정리합니다.' },
            { icon: '🔒', title: '민감 파일 오프라인 처리', desc: '계약서나 개인 자료처럼 외부 업로드가 꺼려지는 파일도 서버 전송 없이 브라우저 안에서만 이름을 바꿔 폴더에 바로 저장할 수 있습니다.' },
          ],
          steps: [
            { step: '파일 추가', desc: '1단계에서 파일을 드래그앤드롭하거나 파일·폴더 선택 버튼으로 추가합니다. 추가된 파일 개수와 총 용량이 요약으로 표시됩니다.' },
            { step: '변환 규칙 설정', desc: '2단계 좌측에서 찾기·바꾸기, 넘버링, 날짜, 정규식 등 원하는 규칙을 켭니다. 규칙은 정해진 8단계 순서로 적용되어 결과가 예측 가능합니다.' },
            { step: '미리보기로 확인', desc: '우측 표에서 변경 전·후 이름을 실시간으로 대조합니다. 사용 불가 문자가 변환된 행과 이름이 겹쳐 회피된 행이 표시로 안내됩니다.' },
            { step: 'ZIP 또는 폴더 저장', desc: '3단계에서 ZIP으로 내려받거나(500개·1GB 이하) 지원 브라우저에서는 폴더에 직접 저장합니다. 원본은 보존되고 새 이름의 파일이 생성됩니다.' },
          ],
          faqs: [
            { q: '업로드한 파일이 서버로 전송되거나 저장되나요?', a: '아닙니다. 이 도구는 100% 사용자 브라우저 안에서만 작동하며, 파일을 끌어다 놓아도 어떤 서버로도 전송되지 않습니다. 이름 변경, ZIP 압축, 폴더 저장 모든 과정이 사용자 기기 안에서만 일어나므로 민감한 파일도 안심하고 처리할 수 있습니다. 개발자 도구의 네트워크 탭으로 직접 확인하실 수 있습니다.' },
            { q: '윈도우에서 쓸 수 없는 특수문자가 이름에 들어가면 어떻게 되나요?', a: '슬래시(/), 콜론(:), 물음표(?) 같은 윈도우·맥에서 파일명에 쓸 수 없는 문자나 CON·PRN 같은 예약어는 미리보기 단계에서 자동으로 밑줄(_)로 변환되고, 변환된 행에는 작은 경고 아이콘이 표시됩니다. 덕분에 저장 단계에서 오류로 멈추지 않고 안전하게 파일이 생성됩니다.' },
            { q: '파일이 수백 개여도 한 번에 처리할 수 있나요?', a: 'ZIP 다운로드는 브라우저 메모리 안정성을 위해 500개 또는 총 1GB 이하로 제한됩니다. 그보다 많은 파일은 크롬·엣지 등에서 지원하는 폴더 직접 저장 기능을 사용하면 개수 제한 없이 처리할 수 있습니다. 미리보기는 가상 스크롤로 수천 개도 끊김 없이 표시됩니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴은 원본 파일을 그대로 두고 새 이름의 복사본을 생성하므로 비교적 안전하지만, 중요한 데이터는 작업 전 백업을 권장합니다. 계산이나 변환 결과는 참고용으로 제공되며, 대량 작업 전에는 소수의 파일로 먼저 결과를 확인해 보시기 바랍니다.' },
          ],
        },
  en: {
          title: 'What is the Smart Bulk Renamer?',
          description:
            'The Smart Bulk Renamer is a 100% browser-based tool that renames many files at once with consistent rules. Windows Explorer\'s built-in rename appends messy "(1)" "(2)" suffixes and offers little control, but this tool combines nine rules — find/replace, prefix/suffix, flexible 001-style numbering, today\'s date insertion, case change, whitespace cleanup, and full regex — applied in a fixed order and previewed instantly. Its biggest strength is privacy: dropping files sends them to no server, and renaming, ZIP compression, and direct folder saving all happen entirely inside your browser. It also automatically converts characters that Windows and macOS forbid in filenames (\\ / : * ? " < > |) and reserved words (CON, PRN, etc.) into safe characters at the preview stage, flagging affected rows, so saving never crashes with an error. If renamed results collide, it appends _1, _2 to avoid conflicts. Results are previewed before and after in real time; when you are satisfied, download as a ZIP (up to 500 files / 1GB) or, in supported browsers, save straight to a folder. It turns repetitive renaming for photo organizing, backups, and project asset tidying into a few seconds of work.',
          useCases: [
            { icon: '📷', title: 'Organize Travel Photos', desc: 'Turn meaningless camera names like DSC_0001 into a clean "Jeju_Trip_001" format with date and numbering in one pass, then back up as a ZIP.' },
            { icon: '🗂️', title: 'Standardize Work Documents', desc: 'Batch-add a prefix and the authoring date to inconsistently named report files so they match your team naming convention and become easier to search.' },
            { icon: '🎨', title: 'Tidy Design & Dev Assets', desc: 'Unify the extension of icon or image assets and strip unneeded suffixes with regex to keep a project folder organized under one consistent rule.' },
            { icon: '🔒', title: 'Process Sensitive Files Offline', desc: 'Even files you would rather not upload, like contracts or personal data, can be renamed entirely in your browser and saved straight to a folder with no server transfer.' },
          ],
          steps: [
            { step: 'Add files', desc: 'In Step 1, drag and drop files or use the Select Files / Select Folder buttons. A summary shows the file count and total size that have been added.' },
            { step: 'Set the rules', desc: 'On the left of Step 2, enable the rules you want — find/replace, numbering, date, regex, and more. Rules apply in a fixed 8-step order so results stay predictable.' },
            { step: 'Check the preview', desc: 'The table on the right compares before and after names live. Rows where invalid characters were converted or names were de-duplicated are clearly flagged.' },
            { step: 'Save as ZIP or to a folder', desc: 'In Step 3, download as a ZIP (up to 500 files / 1GB) or save straight to a folder in supported browsers. Originals are preserved; new renamed files are created.' },
          ],
          faqs: [
            { q: 'Are my uploaded files sent to or stored on a server?', a: 'No. This tool runs entirely in your browser, and dropping files sends them to no server. Renaming, ZIP compression, and folder saving all happen on your device, so even sensitive files are safe to process. You can verify this yourself in the Network tab of your browser dev tools.' },
            { q: 'What happens if a name contains characters Windows forbids?', a: 'Characters that Windows and macOS forbid in filenames, such as slash (/), colon (:), and question mark (?), and reserved words like CON or PRN, are automatically replaced with an underscore (_) at the preview stage, and affected rows show a small warning icon. This prevents the save step from crashing and ensures files are created safely.' },
            { q: 'Can I process hundreds of files at once?', a: 'ZIP download is limited to 500 files or 1GB total for browser memory stability. For more, use the Save to Folder feature supported in Chrome, Edge, and similar browsers, which has no count limit. The preview uses virtual scrolling, so even thousands of files render smoothly.' },
            { q: 'Can I rely on this for important data?', a: 'The tool leaves originals untouched and creates renamed copies, so it is relatively safe, but we recommend backing up important data before any batch operation. Results are provided for reference; test with a few files first before processing a large batch.' },
          ],
        },
};
