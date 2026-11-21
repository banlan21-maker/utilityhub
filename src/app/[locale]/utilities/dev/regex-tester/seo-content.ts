// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '정규표현식(Regex) 테스터란 무엇인가요?',
          description:
            '정규표현식(Regular Expression, Regex)은 문자열에서 특정 패턴을 검색, 추출, 대체하는 강력한 도구입니다. 이메일 형식 검증, 전화번호 추출, URL 파싱, 로그 분석 등 개발의 모든 분야에서 활용됩니다. 이 테스터는 패턴과 테스트 문자열을 입력하면 실시간으로 일치하는 부분을 강조 표시하고 매치 수를 계산합니다. g(전체), i(대소문자 무시), m(다중행), s(점이 줄바꿈 포함) 등 주요 플래그를 지원하며, 이메일·전화번호·URL 등 자주 쓰는 패턴 치트시트를 한국어/영어로 제공합니다.',
          useCases: [
            { icon: '✉️', title: '이메일 형식 검증', desc: '회원가입 폼에서 이메일 형식을 검증하는 정규식을 테스트하고 엣지 케이스를 즉시 확인합니다.' },
            { icon: '📋', title: '로그 파싱', desc: '서버 로그에서 에러 코드, IP 주소, 타임스탬프 등 필요한 정보를 추출하는 패턴을 개발합니다.' },
            { icon: '🔄', title: '문자열 대체', desc: '특정 패턴을 찾아 다른 문자열로 치환하는 replace() 작업 전 패턴을 미리 검증합니다.' },
            { icon: '🔍', title: '데이터 정제', desc: 'CSV나 텍스트 데이터에서 원하는 형식의 값만 추출하는 데이터 전처리 작업에 활용합니다.' },
          ],
          steps: [
            { step: '패턴 입력', desc: '/패턴/ 입력란에 정규식을 직접 입력하거나, 오른쪽 치트시트에서 이메일·전화번호·URL 등 자주 쓰는 패턴을 클릭해 즉시 불러옵니다.' },
            { step: '플래그 선택', desc: 'g(전체 검색), i(대소문자 무시), m(다중행 모드), s(dotAll — 점이 줄바꿈 포함) 플래그를 필요에 따라 토글합니다.' },
            { step: '테스트 문자열 입력', desc: '중간 텍스트 에디터에 테스트할 문자열을 붙여넣으면 매칭 부분이 실시간으로 노란색으로 강조 표시되고 총 매치 수가 즉시 업데이트됩니다. 매치 0건이면 "일치 항목 없음"으로 안내됩니다.' },
            { step: '결과 확인 및 응용', desc: '하단 결과 영역에서 매칭된 토큰 목록(최대 20개 + 나머지 안내)을 확인하고, 검증된 패턴을 JavaScript 코드(test(), match(), replace())에 그대로 적용합니다.' },
          ],
          faqs: [
            { q: '정규표현식에서 특수문자를 검색하려면?', a: '특수문자(. * + ? ^ $ { } [ ] | ( ) \\) 앞에 백슬래시(\\)를 붙여 이스케이프합니다. 예를 들어 점(.)을 검색하려면 \\.을 사용하고, 괄호를 검색하려면 \\(를 사용합니다.' },
            { q: '이메일 검증 정규식이 완벽하지 않은 이유는?', a: 'RFC 5322 표준을 완전히 따르는 이메일 정규식은 매우 복잡하며 실용적이지 않습니다. 실무에서는 기본 형식 확인(@ 포함, 도메인 형식 등) 후 서버에서 실제 이메일 발송 테스트로 최종 검증하는 것을 권장합니다.' },
            { q: '자바스크립트에서 정규식을 사용하는 방법은?', a: '/패턴/플래그 리터럴 또는 new RegExp("패턴", "플래그")로 생성합니다. test()로 존재 여부, match()로 매칭 결과 배열, replace()로 치환, split()으로 분할 처리 등 다양하게 활용합니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: 'What is a Regular Expression (Regex) Tester?',
          description:
            'A Regular Expression (Regex) is a powerful tool for searching, extracting, and replacing patterns in strings. It is used in every area of development: validating email formats, extracting phone numbers, parsing URLs, analyzing logs, and more. This tester highlights matched portions of the test string in real time as you type, and counts the number of matches. It supports the major flags — g (global), i (case-insensitive), m (multiline), s (dotAll) — and includes a cheat sheet of common patterns for emails, phone numbers, URLs, hex colors, and more, all with localized labels.',
          useCases: [
            { icon: '✉️', title: 'Email Validation', desc: 'Test and refine email validation patterns for sign-up forms and catch edge cases instantly.' },
            { icon: '📋', title: 'Log Parsing', desc: 'Build patterns to extract error codes, IP addresses, and timestamps from server logs.' },
            { icon: '🔄', title: 'String Replacement', desc: 'Verify patterns before using them in replace() operations to avoid unintended substitutions.' },
            { icon: '🔍', title: 'Data Extraction', desc: 'Extract specifically formatted values from CSV or raw text during data preprocessing.' },
          ],
          steps: [
            { step: 'Enter Pattern', desc: 'Type your regex directly in the /pattern/ field, or click any item in the cheat sheet sidebar to instantly load a common pattern like email, phone number, or URL.' },
            { step: 'Select Flags', desc: 'Toggle g (global search), i (case-insensitive), m (multiline), or s (dotAll — dot matches newlines) to fine-tune matching behavior.' },
            { step: 'Type Test String', desc: 'Enter your test text in the middle editor. Matched portions are instantly highlighted in yellow and the total match count updates in real time. A clear "No matches" indicator shows when nothing is found.' },
            { step: 'Review & Apply', desc: 'Check the matched token list in the result area below (first 20 tokens + a "+N more" badge for the rest), then copy your validated pattern directly into JavaScript code using test(), match(), or replace().' },
          ],
          faqs: [
            { q: 'How do I search for special characters in regex?', a: 'Escape special characters (. * + ? ^ $ { } [ ] | ( ) \\) with a backslash. For example, to match a literal dot use \\., and to match a literal parenthesis use \\(. The cheat sheet includes pre-escaped patterns for common use cases.' },
            { q: 'Why is no email regex 100% accurate?', a: 'Fully RFC 5322-compliant email validation is extremely complex and rarely practical. In production, use a basic format check via regex to catch obvious errors, then confirm the address with an actual delivery test (send a verification email) on the server side.' },
            { q: 'How do I use regex in JavaScript?', a: 'Create a regex with the /pattern/flags literal or new RegExp("pattern", "flags"). Use test() to check existence, match() to get result arrays, replace() for substitution, matchAll() for all capturing groups, and split() to divide strings.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        },
};
