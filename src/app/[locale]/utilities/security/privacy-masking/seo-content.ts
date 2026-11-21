// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: "개인정보 마스킹 도구란 무엇인가요?",
          description: "개인정보 마스킹 도구는 텍스트 안에 포함된 이메일 주소, 전화번호, 주민등록번호, 신용카드 번호, IP 주소, 이름 등의 민감한 개인정보를 자동으로 검출하고 일부를 별표(*)로 대체하는 온라인 개인정보 비식별화 도구입니다. 문서, 로그 파일, 고객 데이터, 스크린샷 텍스트 등을 공유하기 전에 개인정보를 안전하게 마스킹할 수 있습니다. 모든 처리는 브라우저에서만 이루어지며 서버에 데이터가 전송되지 않으므로 민감한 정보도 안심하고 사용할 수 있습니다.",
          useCases: [
            { icon: '📋', title: '고객 데이터 공유 전 비식별화', desc: '고객 정보가 담긴 CSV, 스프레드시트 내용을 동료나 외부 업체와 공유하기 전 개인정보를 마스킹합니다.' },
            { icon: '🐛', title: '개발 로그 & 에러 리포트 공유', desc: '서버 로그나 에러 메시지에 포함된 사용자 이메일, IP 주소를 마스킹한 후 개발팀이나 GitHub에 공유합니다.' },
            { icon: '📝', title: '스크린샷 & 문서 공유', desc: '블로그 포스팅, SNS, 발표 자료에 스크린샷을 삽입할 때 개인정보가 노출되지 않도록 사전에 마스킹합니다.' },
            { icon: '🏢', title: 'GDPR & 개인정보보호법 대응', desc: '테스트 환경에서 실제 사용자 데이터 대신 마스킹된 데이터를 사용해 개인정보 규정을 준수합니다.' },
          ],
          steps: [
            { step: '마스킹 규칙 선택', desc: '왼쪽 패널에서 이메일, 전화번호, 주민번호, 카드번호, IP, 한국 이름 중 마스킹할 항목을 체크합니다. 한국 이름 규칙은 일반 단어와 충돌할 수 있어 기본으로 꺼져 있으니 필요할 때만 켜세요.' },
            { step: '텍스트 붙여넣기', desc: '오른쪽 상단 입력창에 마스킹할 텍스트를 붙여넣거나 직접 입력합니다. 여러 줄의 텍스트도 한 번에 처리할 수 있습니다.' },
            { step: '결과 확인 및 복사', desc: '하단 출력창에 마스킹 결과가 즉시 표시됩니다. 노란색으로 강조된 부분이 마스킹된 항목이며, 복사 버튼으로 클립보드에 저장합니다.' },
            { step: '마스킹 결과 검토', desc: '출력 결과를 반드시 육안으로 검토하여 의도치 않게 마스킹되거나 누락된 항목이 없는지 확인한 후 사용합니다. 필요 시 규칙 체크박스를 조정해 재처리할 수 있습니다.' },
          ],
          faqs: [
            { q: '입력한 텍스트가 서버로 전송되나요?', a: '전혀 그렇지 않습니다. 이 개인정보 마스킹 도구는 100% 클라이언트 사이드(브라우저)에서만 동작하며, 입력한 텍스트는 어떠한 서버에도 전송되지 않습니다. 완전히 오프라인 환경에서도 사용할 수 있습니다.' },
            { q: '하이픈이 없는 전화번호도 마스킹되나요?', a: '네. 010-1234-5678 같은 하이픈 형식뿐 아니라 01012345678, 010 1234 5678, +82 10 1234 5678 같은 다양한 형식을 모두 감지합니다. 국제번호 prefix(+82, 0082)도 자동으로 인식합니다.' },
            { q: '한국 이름 마스킹이 일반 단어를 잘못 마스킹합니다', a: '한국 이름 규칙은 흔한 성씨 화이트리스트와 토큰 길이 2~4글자 제한을 사용해 오탐을 최소화했지만, 짧은 한글 단어("안녕", "선생" 등)는 여전히 마스킹될 수 있습니다. 그래서 기본값은 꺼져 있고, 켤 경우 결과를 반드시 검토하세요.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: "What is a Personal Data Masking Tool?",
          description: "A personal data masking tool automatically detects sensitive information in text — including email addresses, phone numbers, social security numbers, credit card numbers, IP addresses, and names — and replaces part of each with asterisks (*) to anonymize it. Use it to safely mask personal data in documents, log files, customer records, and screenshot text before sharing. All processing happens entirely in the browser; no data is ever sent to a server.",
          useCases: [
            { icon: '📋', title: 'De-identify Customer Data Before Sharing', desc: 'Mask personal information in CSV files and spreadsheet content before sharing with colleagues or external vendors.' },
            { icon: '🐛', title: 'Share Dev Logs & Error Reports', desc: 'Strip user emails and IP addresses from server logs and error messages before sharing with the dev team or posting to GitHub.' },
            { icon: '📝', title: 'Screenshots & Document Sharing', desc: 'Pre-mask any personal data before inserting screenshots into blog posts, social media, or presentations to prevent unintended exposure.' },
            { icon: '🏢', title: 'GDPR & Privacy Law Compliance', desc: 'Use masked data instead of real user data in test environments to maintain compliance with privacy regulations.' },
          ],
          steps: [
            { step: 'Select masking rules', desc: 'Check the rules you want to apply in the left panel: email, phone, SSN, credit card, IP address, Korean name. The Korean name rule is off by default because it may match common words — turn it on only when needed.' },
            { step: 'Paste your text', desc: 'Paste or type the text you want to mask into the input area on the right. Multiple lines of text are processed all at once.' },
            { step: 'Review & copy result', desc: 'The masked output appears instantly. Yellow highlights show what was masked. Click the copy button to save it to your clipboard.' },
            { step: 'Verify the output', desc: 'Always review the masked result manually to confirm no items were accidentally missed or incorrectly masked. Adjust the rule checkboxes and reprocess if needed.' },
          ],
          faqs: [
            { q: 'Is my input text sent to a server?', a: 'Not at all. This tool runs 100% client-side in your browser. Your text is never transmitted to any server and can even be used completely offline — no internet connection required after the page loads.' },
            { q: 'Does it mask phone numbers without dashes?', a: 'Yes. Beyond 010-1234-5678, the tool also recognizes 01012345678, 010 1234 5678, and country-code formats like +82 10 1234 5678 or 0082-10-1234-5678. All common variants are detected automatically.' },
            { q: 'Korean name masking flagged some common words', a: 'The Korean name rule uses a surname whitelist and 2-to-4-character token limit to minimize false positives, but short Hangul words may still get masked. That is why the rule is off by default — when you enable it, always review the output.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        },
};
