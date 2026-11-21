// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: 'JSON 포맷터 & 뷰어란 무엇인가요?',
          description: 'JSON(JavaScript Object Notation)은 웹 API와 애플리케이션 간 데이터를 교환할 때 가장 많이 사용하는 경량 데이터 형식입니다. JSON 포맷터는 압축되거나 읽기 어려운 JSON 문자열을 들여쓰기와 줄바꿈이 적용된 가독성 높은 형식으로 변환하고, 구문 오류를 즉시 검출합니다. 트리 뷰 기능은 중첩된 객체와 배열의 계층 구조를 시각적으로 표현해 복잡한 JSON 구조를 쉽게 탐색할 수 있게 해줍니다. 로그 분석, API 응답 디버깅, 설정 파일 편집 등 다양한 개발 작업에 필수 도구입니다.',
          useCases: [
            { icon: '🔍', title: 'API 응답 디버깅', desc: 'REST API나 GraphQL에서 받은 JSON 응답을 즉시 정렬하고, 트리 뷰로 원하는 필드를 빠르게 탐색합니다.' },
            { icon: '📦', title: '설정 파일 편집', desc: 'package.json, tsconfig.json 등 설정 파일의 구조를 검증하고 가독성 높게 포맷합니다.' },
            { icon: '📉', title: '데이터 압축(Minify)', desc: '프로덕션 배포 전 JSON을 최소화해 네트워크 전송 크기를 줄이고 성능을 최적화합니다.' },
            { icon: '🌳', title: '트리 구조 탐색', desc: '깊게 중첩된 JSON 객체를 폴딩/펼침 트리로 탐색해 원하는 키를 빠르게 찾습니다.' },
          ],
          steps: [
            { step: 'JSON 입력', desc: '왼쪽 에디터에 JSON 문자열을 직접 붙여넣거나 상단의 샘플 데이터 버튼으로 예시 JSON을 불러와 도구의 동작 방식을 먼저 확인합니다.' },
            { step: '뷰 모드 선택', desc: '보기 좋게 들여쓰기 정렬(Pretty), 계층 구조 트리 뷰(Tree), 공백 제거 압축(Minify) 중 원하는 형식을 오른쪽 패널 상단에서 선택합니다.' },
            { step: '오류 확인', desc: '하단 상태바에서 JSON 유효성 결과를 즉시 확인합니다. 파싱 오류 발생 시 정확한 오류 메시지가 표시되어 어느 위치에 문제가 있는지 파악할 수 있습니다.' },
            { step: '복사 및 활용', desc: '결과를 복사 버튼으로 클립보드에 복사해 코드 에디터, API 도구, 메모 등 원하는 곳에 바로 붙여넣습니다.' },
          ],
          faqs: [
            { q: 'JSON 유효성 검사는 어떻게 하나요?', a: '입력 즉시 자동으로 JSON을 파싱해 오류 여부를 하단 상태바에 표시합니다. 오류 발생 시 정확한 오류 메시지도 함께 보여줘 문제 위치를 빠르게 찾을 수 있습니다.' },
            { q: 'JSON과 YAML의 차이는 무엇인가요?', a: 'JSON은 중괄호와 따옴표를 사용하는 엄격한 형식으로 기계 친화적이고, YAML은 들여쓰기 기반의 인간 친화적 형식입니다. 둘 다 설정 파일과 데이터 직렬화에 널리 사용되며, 상호 변환이 가능합니다.' },
            { q: 'JSON을 JavaScript 객체로 변환하려면?', a: 'JSON.parse() 메서드를 사용합니다. 반대로 객체를 JSON으로 변환할 때는 JSON.stringify()를 사용하며, 두 번째 인수로 null, 세 번째 인수로 들여쓰기 공백 수를 전달하면 이 포맷터처럼 예쁘게 출력됩니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: 'What is a JSON Formatter & Viewer?',
          description: 'JSON (JavaScript Object Notation) is the most widely used lightweight data format for exchanging information between web APIs and applications. A JSON formatter transforms compressed or hard-to-read JSON strings into an indented, human-readable format and immediately detects syntax errors. The tree view visually represents nested objects and arrays, making it easy to navigate complex structures. It is an essential tool for debugging API responses, editing configuration files, and log analysis.',
          useCases: [
            { icon: '🔍', title: 'API Response Debugging', desc: 'Instantly prettify JSON from REST or GraphQL APIs and use tree view to find the exact field you need.' },
            { icon: '📦', title: 'Config File Editing', desc: 'Validate and format package.json, tsconfig.json, and other config files for readability.' },
            { icon: '📉', title: 'Minification', desc: 'Compress JSON before production deployment to reduce network payload size and improve performance.' },
            { icon: '🌳', title: 'Tree Structure Navigation', desc: 'Explore deeply nested JSON with collapsible tree nodes to quickly find any key.' },
          ],
          steps: [
            { step: 'Paste JSON', desc: 'Paste your JSON string into the left editor, or click the Sample button to load example data and explore how the tool works.' },
            { step: 'Select View Mode', desc: 'Choose Pretty (indented), Tree (collapsible hierarchy), or Minify (whitespace-stripped) from the top of the right panel — output updates instantly.' },
            { step: 'Check for Errors', desc: 'The status bar at the bottom of the input panel shows ✓ for valid JSON or the exact parser error message so you can locate and fix issues quickly.' },
            { step: 'Copy & Use', desc: 'Click the copy button to grab the formatted result and paste it directly into your code editor, API tool, or documentation.' },
          ],
          faqs: [
            { q: 'How does JSON validation work?', a: 'The tool parses your input automatically on every keystroke using the native JSON.parse() method. The status bar shows ✓ for valid JSON or the exact error message — including the character position — if parsing fails.' },
            { q: 'What is the difference between JSON and YAML?', a: 'JSON uses curly braces and quotes — strict, compact, and machine-friendly. YAML uses indentation — more readable for humans. Both are widely used for config files and data serialization, and can be converted between each other.' },
            { q: 'How do I convert JSON to a JavaScript object?', a: 'Use JSON.parse(). To go the other way, use JSON.stringify(obj, null, 2) — the null and 2 arguments produce the same prettified output as this formatter, with 2-space indentation.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        },
};
