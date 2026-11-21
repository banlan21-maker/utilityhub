// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: 'PDF 개인정보 마스킹이란 무엇인가요?',
          description: 'PDF 문서에 포함된 개인정보를 AI가 자동으로 탐지하고 마스킹(검은 박스로 가리기)하는 무료 온라인 보안 도구입니다. 주민등록번호(13자리), 전화번호, 이메일 주소, 국내 주소(시·구·동 단위)를 정규표현식 기반 패턴 매칭으로 자동 탐지합니다. 모든 처리는 브라우저 내에서 100% 로컬로 이루어져 파일이 서버로 전송되지 않으며, 개발자를 포함한 그 누구도 귀하의 파일을 열람할 수 없습니다. 공무원, 기업 보안팀, 법률 사무소, 병원 등 개인정보 관련 규정을 준수해야 하는 모든 조직에서 즉시 활용할 수 있습니다. AI 탐지 결과는 개별적으로 확인 및 수정이 가능하여 정확한 마스킹 제어를 보장합니다.',
          useCases: [
            {
              icon: '🏛️',
              title: '공무원 전용 문서 처리',
              desc: '민감한 행정 문서의 주민번호·연락처 등 개인정보를 서버 업로드 없이 안전하게 마스킹하세요. 개인정보보호법 준수를 유지하면서 업무 효율을 높일 수 있습니다.',
            },
            {
              icon: '🏢',
              title: '기업 보안팀 필수 도구',
              desc: '계약서, 인사 문서, 고객 정보 등 민감 데이터를 포함한 PDF를 로컬에서 처리하여 데이터 유출 리스크를 제로화하세요. 외부로의 네트워크 트래픽이 발생하지 않아 DLP 솔루션에도 감지되지 않습니다.',
            },
            {
              icon: '⚖️',
              title: '법률 문서 편집',
              desc: '변호사, 법무법인에서 의뢰인 정보를 포함한 문서를 안전하게 편집하고 상대방이나 법원에 제출할 때 활용하세요. GDPR 및 개인정보보호법 요건을 충족하는 처리 방식입니다.',
            },
            {
              icon: '🛡️',
              title: '100% 프라이버시 보장',
              desc: '모든 처리가 브라우저 내에서 완료되어 파일이 서버로 전송되지 않습니다. 개발자를 포함한 그 누구도 귀하의 파일을 볼 수 없어 기밀 문서 처리에 완전히 안전합니다.',
            },
          ],
          steps: [
            {
              step: '1. PDF 업로드',
              desc: 'PDF 파일을 드래그 앤 드롭하거나 업로드 영역을 클릭하여 파일을 선택합니다. 파일은 브라우저 메모리로만 로드되며 서버로 전송되지 않습니다.',
            },
            {
              step: '2. AI 보안 분석',
              desc: 'AI가 각 페이지의 텍스트를 추출하여 주민번호, 전화번호, 이메일, 주소 패턴을 자동으로 탐지하고, 0~100점 사이의 보안 점수와 탐지 결과 목록을 제공합니다.',
            },
            {
              step: '3. 마스킹 항목 선택',
              desc: '탐지된 개인정보 목록을 확인하고 각 항목을 개별적으로 가리기/표시로 설정합니다. 전체 가리기·전체 표시 버튼으로 일괄 적용도 가능합니다.',
            },
            {
              step: '4. 보안 PDF 다운로드',
              desc: '선택한 항목이 검은 박스로 마스킹된 보안 PDF를 다운로드합니다. 원본 파일은 변경되지 않으며, 마스킹된 사본만 새로 생성됩니다.',
            },
          ],
          faqs: [
            {
              q: '회사 보안팀이나 DLP 솔루션에 감지되지 않나요?',
              a: '100% 로컬 처리로 네트워크 트래픽이 전혀 발생하지 않습니다. 파일이 서버로 업로드되지 않으므로 보안팀 네트워크 모니터링이나 DLP 솔루션에 감지되지 않으며, 회사 보안 정책을 위반하지 않습니다.',
            },
            {
              q: 'AI가 잘못 탐지하거나 놓친 개인정보가 있으면 어떻게 하나요?',
              a: '탐지된 모든 항목은 개별적으로 확인하고 수동으로 가리기/표시를 선택할 수 있습니다. 정규표현식 패턴에 맞지 않는 특수한 형식의 개인정보는 탐지되지 않을 수 있으므로, 중요 문서는 탐지 결과를 직접 검토하는 것을 권장합니다.',
            },
            {
              q: '어떤 개인정보 유형을 탐지하나요?',
              a: '현재 주민등록번호(XXXXXX-XXXXXXX 형식), 전화번호(010/02/031 등 국내 번호 형식), 이메일 주소, 국내 주소(시·군·구·동·읍·면·로·길 포함 패턴)를 정규표현식 기반으로 자동 탐지합니다. 향후 더 많은 패턴이 추가될 예정입니다.',
            },
            {
              q: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
              a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.',
            },
          ],
        },
  en: {
          title: 'What is PDF Privacy Masking?',
          description: 'A free online security tool that uses AI to automatically detect and mask (redact) personal information in PDF documents. Detects Korean Social Security Numbers (13-digit format), phone numbers, email addresses, and Korean residential addresses using regex-based pattern matching. All processing runs 100% locally in your browser — files are never sent to a server, and no one, including developers, can access your documents. Ideal for government agencies, corporate security teams, law firms, and hospitals that must comply with privacy regulations such as GDPR and the Korean Personal Information Protection Act. AI detection results can be individually reviewed and toggled, giving you precise control over which information gets redacted.',
          useCases: [
            {
              icon: '🏛️',
              title: 'Government Document Processing',
              desc: 'Safely mask personal information in sensitive administrative documents without any server upload. Maintain compliance with personal data protection laws while improving processing efficiency.',
            },
            {
              icon: '🏢',
              title: 'Corporate Security Essential',
              desc: 'Process PDFs containing sensitive data — contracts, HR records, customer information — entirely on your local machine to eliminate data breach risks. No network traffic is generated, so DLP tools won\'t flag the activity.',
            },
            {
              icon: '⚖️',
              title: 'Legal Document Editing',
              desc: 'Lawyers and law firms can safely redact client information before submitting documents to courts or opposing counsel. Meets GDPR and privacy law requirements with fully local processing.',
            },
            {
              icon: '🛡️',
              title: '100% Privacy Guaranteed',
              desc: 'All processing completes inside your browser. Files never leave your device — not even to the tool\'s developers. Fully safe for classified and confidential documents.',
            },
          ],
          steps: [
            {
              step: '1. Upload PDF',
              desc: 'Drag and drop your PDF or click the upload area to select a file. The file is loaded only into browser memory and is never transmitted to a server.',
            },
            {
              step: '2. AI Security Analysis',
              desc: 'AI extracts text from each page and automatically detects SSN, phone number, email, and address patterns. A security score (0–100) and a full list of detected items are displayed.',
            },
            {
              step: '3. Select Items to Mask',
              desc: 'Review the detected information list and toggle each item individually to mask or reveal it. Use the "Mask All" or "Show All" buttons for quick bulk actions.',
            },
            {
              step: '4. Download Secured PDF',
              desc: 'Download the security-processed PDF with all selected items covered by solid black boxes. The original file is unchanged — only the redacted copy is generated and saved.',
            },
          ],
          faqs: [
            {
              q: 'Will my company\'s security team or DLP solution detect this?',
              a: '100% local processing means absolutely no network traffic is generated. Files are never uploaded to any server, so they won\'t appear in network security monitoring or DLP logs, and no company security policies are violated.',
            },
            {
              q: 'What if AI detects something incorrectly or misses personal data?',
              a: 'All detected items can be individually reviewed and manually toggled to mask or show. Personal information in unusual formats that don\'t match standard regex patterns may not be detected, so we recommend manually reviewing the detection results for critical documents.',
            },
            {
              q: 'What types of personal information can it detect?',
              a: 'Currently detects Korean SSN (XXXXXX-XXXXXXX format), phone numbers (Korean 010/02/031 format), email addresses, and Korean addresses (containing city, district, town, road identifiers). More patterns will be added in future updates.',
            },
            {
              q: 'Can I use this result as official data?',
              a: 'Results are for reference only. Please consult a professional or official source for accurate figures.',
            },
          ],
        },
};
