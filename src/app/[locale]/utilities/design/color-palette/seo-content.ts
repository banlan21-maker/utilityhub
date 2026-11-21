// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: "색상 팔레트 & WCAG 가독성 검사기란 무엇인가요?",
          description: "색상 대비 검사기(Color Contrast Checker)는 두 색상 간의 명도 대비(Contrast Ratio)를 WCAG 2.1(Web Content Accessibility Guidelines) 기준으로 즉시 계산해주는 웹 접근성 도구입니다. 텍스트와 배경색의 조합이 시각 장애인, 색맹 사용자, 고령 사용자를 포함한 모든 사람이 읽기에 충분한 대비를 가지는지 AA/AAA 기준으로 판별합니다. 트렌딩 팔레트를 클릭 한 번으로 적용하고, 디자이너·개발자·PM 누구나 쉽게 접근성을 검증할 수 있습니다.",
          useCases: [
            { icon: '🎨', title: 'UI/UX 디자인 시스템 구축', desc: '버튼 색상, 폼 레이블, 알림 메시지 등 UI 컴포넌트의 텍스트-배경 조합이 WCAG 기준을 충족하는지 검증합니다.' },
            { icon: '♿', title: '웹 접근성(Accessibility) 준수', desc: '공공기관, 금융, 교육 사이트 등 법적으로 웹 접근성 준수가 필요한 서비스의 색상 대비를 사전에 검토합니다.' },
            { icon: '📊', title: '프레젠테이션 & 인포그래픽', desc: '발표 자료, 대시보드, 차트의 색상 조합을 검사해 빔프로젝터 환경이나 인쇄물에서도 선명하게 보이도록 합니다.' },
            { icon: '🎯', title: '마케팅 & 브랜드 디자인', desc: '브랜드 컬러 기반의 배너, 이메일 뉴스레터, SNS 게시물 디자인 시 텍스트 가독성을 확보합니다.' },
          ],
          steps: [
            { step: '배경색 & 텍스트색 선택', desc: '색상 피커에서 배경색과 텍스트(전경)색을 선택하거나 HEX 코드를 직접 입력합니다. ↔ 버튼으로 두 색상을 스왑할 수 있습니다.' },
            { step: 'WCAG 점수 확인', desc: '일반 텍스트(16px) AA/AAA, 큰 텍스트(18px+) AA/AAA 기준 4가지 합격/불합격 배지를 즉시 확인합니다.' },
            { step: '트렌딩 팔레트 적용', desc: '하단의 트렌딩 팔레트 카드를 클릭하면 해당 색상 조합이 즉시 적용됩니다. 다양한 팔레트를 빠르게 비교해보세요.' },
            { step: '결과 공유 & 디자인 적용', desc: '합격 배지 결과를 스크린샷으로 팀에게 공유하거나, 확인된 색상 조합을 디자인 시스템 문서에 기록하여 브랜드 가이드라인으로 활용하세요.' },
          ],
          faqs: [
            { q: 'WCAG AA와 AAA 기준의 차이는 무엇인가요?', a: 'AA는 대부분의 웹사이트에서 요구되는 최소 기준입니다. 일반 텍스트 4.5:1, 큰 텍스트 3:1 이상이 필요합니다. AAA는 더 엄격한 향상된 기준으로, 일반 텍스트 7:1, 큰 텍스트 4.5:1이 필요합니다. 대부분의 프로젝트는 AA 충족을 목표로 합니다.' },
            { q: '색맹 사용자를 위한 색상 선택 팁이 있나요?', a: '빨강-초록(적록색맹)과 파랑-노랑(청황색맹) 조합은 피하세요. 색상만으로 정보를 전달하지 말고 아이콘, 패턴, 텍스트를 함께 사용하세요. 대비비 4.5:1 이상을 유지하면 색맹 사용자에게도 대부분 읽기 쉽습니다.' },
            { q: 'HEX 코드 없이 색상을 입력할 수 있나요?', a: '현재는 HEX 코드 입력과 색상 피커를 지원합니다. rgb(255,255,255) 형식은 직접 지원하지 않으므로, RGB to HEX 변환 후 입력하거나 색상 피커를 사용하세요.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: "What is a Color Palette & WCAG Readability Checker?",
          description: "This Color Contrast Checker calculates the luminance contrast ratio between two colors according to WCAG 2.1 (Web Content Accessibility Guidelines) and determines whether the combination passes AA or AAA standards for both normal and large text. It helps designers, developers, and PMs verify that text is readable for all users — including those with visual impairments, color blindness, or age-related vision changes. Apply trending palettes with a single click and verify accessibility instantly.",
          useCases: [
            { icon: '🎨', title: 'UI/UX Design Systems', desc: 'Verify that button colors, form labels, and notification messages meet WCAG contrast requirements before shipping.' },
            { icon: '♿', title: 'Web Accessibility Compliance', desc: 'Pre-validate color contrast for government, financial, and educational sites where accessibility compliance is legally required.' },
            { icon: '📊', title: 'Presentations & Infographics', desc: 'Ensure dashboard charts and slide decks remain legible on projectors and in print by checking contrast ratios in advance.' },
            { icon: '🎯', title: 'Marketing & Brand Design', desc: 'Confirm text legibility in brand-colored banners, email newsletters, and social media posts.' },
          ],
          steps: [
            { step: 'Pick background & text colors', desc: 'Use the color pickers or enter HEX codes directly. Use the ↔ button to swap colors instantly.' },
            { step: 'Check WCAG scores', desc: 'Pass/Fail badges for Normal Text AA/AAA and Large Text AA/AAA appear immediately.' },
            { step: 'Apply trending palettes', desc: 'Click any palette card below to apply that color combination instantly and compare options quickly.' },
            { step: 'Share results & apply to design', desc: 'Screenshot the pass/fail badges to share with your team, or record the verified color combinations in your design system documentation for use as brand guidelines.' },
          ],
          faqs: [
            { q: "What's the difference between WCAG AA and AAA?", a: 'AA is the minimum standard required for most websites: 4.5:1 contrast for normal text, 3:1 for large text. AAA is the enhanced level: 7:1 for normal text, 4.5:1 for large text. Most projects target AA compliance.' },
            { q: 'Any color selection tips for color-blind users?', a: 'Avoid red-green (protanopia/deuteranopia) and blue-yellow (tritanopia) combinations. Never rely on color alone to convey information — pair it with icons, patterns, or text labels. Maintaining a 4.5:1+ contrast ratio generally ensures readability for most color-blind users too.' },
            { q: 'Can I enter colors in RGB format?', a: 'Currently only HEX codes and the color picker are supported. Convert RGB to HEX first, or use the color picker to select your color visually.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        },
};
