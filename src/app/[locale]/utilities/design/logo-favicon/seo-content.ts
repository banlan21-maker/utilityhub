// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: "AI 로고 & 파비콘 패키지 생성기란 무엇인가요?",
          description: "파비콘 생성기(Favicon Generator)는 텍스트 또는 이모지를 입력하고 색상과 모양을 선택하면 favicon.ico, 16×16, 32×32, 48×48, 192×192, 512×512 PNG, Apple Touch Icon, site.webmanifest까지 포함한 완전한 파비콘 패키지를 ZIP으로 다운로드할 수 있는 도구입니다. 로고 디자이너 없이도 5분 안에 프로페셔널한 브랜드 아이덴티티를 구축할 수 있습니다. 브라우저 탭 아이콘, PWA 앱 아이콘, 홈 화면 바로가기까지 한 번에 모두 커버됩니다.",
          useCases: [
            { icon: '🚀', title: '스타트업 & 사이드 프로젝트', desc: '빠르게 MVP를 론칭할 때 로고 디자인에 시간을 쓰지 않고도 즉시 사용 가능한 파비콘과 로고를 생성합니다.' },
            { icon: '💼', title: '개인 포트폴리오 & 블로그', desc: '개인 사이트의 브랜드를 간단한 이니셜이나 이모지로 표현하고, 모든 디바이스에서 일관된 아이콘을 제공합니다.' },
            { icon: '🛒', title: '쇼핑몰 & 서비스 사이트', desc: 'Shopify, Vercel, Netlify 등으로 배포한 사이트에 즉시 적용할 수 있는 완전한 파비콘 세트를 한 번에 생성합니다.' },
            { icon: '🎨', title: '프로토타입 & 디자인 시안', desc: '클라이언트에게 디자인 시안을 제시할 때 임시 파비콘으로 실제감을 높이거나, 컨셉 아이디어를 빠르게 시각화합니다.' },
          ],
          steps: [
            { step: '콘텐츠 유형 선택 (텍스트 / 이모지)', desc: "브랜드 이니셜 1~2자(예: 'UH') 또는 이모지(예: 🚀)를 선택해 로고 내용을 입력합니다." },
            { step: '모양 & 색상 커스터마이징', desc: '원형/라운드/정사각형/육각형 중 배경 모양을 선택하고, 프리셋 팔레트 또는 커스텀 색상 피커로 브랜드 컬러를 적용합니다.' },
            { step: 'ZIP 다운로드 & 프로젝트 적용', desc: "'다운로드' 버튼을 클릭하면 모든 크기의 파비콘과 site.webmanifest가 포함된 ZIP 파일이 생성됩니다. 압축 해제 후 프로젝트의 /public 폴더에 넣으면 완성입니다." },
            { step: 'HTML에 링크 태그 추가', desc: "HTML <head>에 site.webmanifest 링크, apple-touch-icon, shortcut icon 태그를 추가하세요. 다운로드된 ZIP 내 README에 모든 태그 예시가 포함되어 있어 그대로 복사해서 사용할 수 있습니다." },
          ],
          faqs: [
            { q: 'ZIP 파일에 포함된 파일들을 어디에 놓아야 하나요?', a: 'Next.js, React, Vue.js 프로젝트는 /public 폴더, 정적 HTML은 루트 디렉토리에 넣으세요. HTML의 <head>에 site.webmanifest 링크와 apple-touch-icon 링크를 추가하면 모든 디바이스에서 올바르게 표시됩니다. 다운로드된 ZIP에 README가 포함되어 있습니다.' },
            { q: '이 도구로 만든 로고를 상업적으로 사용해도 되나요?', a: '텍스트와 색상을 직접 조합해 Canvas API로 생성한 이미지이므로 저작권 문제 없이 자유롭게 상업적으로 활용하실 수 있습니다. 단, 입력한 이모지의 경우 플랫폼별 이모지 디자인의 저작권에 주의하세요.' },
            { q: '고해상도 로고(SVG 또는 1024px 이상 PNG)도 가능한가요?', a: '현재 최대 512×512 PNG를 제공합니다. SVG 포맷은 추후 업데이트 예정입니다. 대형 인쇄용 로고가 필요하다면 생성된 PNG를 벡터 변환 도구(예: Vectorizer.ai)를 통해 SVG로 변환하는 것을 권장합니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: "What is a Logo & Favicon Package Generator?",
          description: "A favicon generator that lets you type text or pick an emoji, choose a shape and colors, then download a complete favicon package as a ZIP — including favicon.ico, PNGs at 16×16, 32×32, 48×48, 192×192, 512×512, Apple Touch Icon, and site.webmanifest. Build a professional brand identity in 5 minutes without a logo designer. Browser tab icons, PWA app icons, and home screen shortcuts are all covered in one download.",
          useCases: [
            { icon: '🚀', title: 'Startups & Side Projects', desc: "When launching an MVP quickly, generate a production-ready favicon and logo without spending time on logo design." },
            { icon: '💼', title: 'Personal Portfolios & Blogs', desc: 'Express your personal site brand with simple initials or an emoji, and deliver a consistent icon across all devices.' },
            { icon: '🛒', title: 'Shops & Service Sites', desc: 'Generate a complete favicon set ready to deploy to Shopify, Vercel, Netlify, or any other platform in one step.' },
            { icon: '🎨', title: 'Prototypes & Design Mockups', desc: 'Add a placeholder favicon to client design mockups to make them feel more realistic, or quickly visualize concept ideas.' },
          ],
          steps: [
            { step: 'Choose content type (text or emoji)', desc: "Enter 1–2 brand initials (e.g. 'UH') or pick an emoji (e.g. 🚀) as your logo content." },
            { step: 'Customize shape & colors', desc: 'Select circle, rounded, square, or hexagon background shape, then apply brand colors using preset palettes or custom color pickers.' },
            { step: 'Download ZIP & apply to project', desc: "Click 'Download' to generate a ZIP file with all favicon sizes and site.webmanifest. Unzip and place everything in your project's /public folder." },
            { step: 'Add link tags to HTML', desc: "Add the site.webmanifest link, apple-touch-icon, and shortcut icon tags to your HTML <head>. The README inside the downloaded ZIP includes ready-to-copy tag examples for every major framework." },
          ],
          faqs: [
            { q: 'Where should I place the files from the ZIP?', a: 'For Next.js, React, or Vue.js projects, place them in the /public folder. For static HTML, put them in the root directory. Add site.webmanifest and apple-touch-icon links in the HTML <head>. A README inside the ZIP explains everything.' },
            { q: 'Can I use the generated logo commercially?', a: 'Yes. The image is generated via the Canvas API by combining your text and colors, so it is free from copyright concerns for commercial use. Note: if you used an emoji, be aware of the platform-specific emoji design copyrights.' },
            { q: 'Is high-resolution output (SVG or 1024px+) available?', a: 'Currently the maximum is 512×512 PNG. SVG format is planned for a future update. If you need a large print-ready logo, convert the generated PNG to SVG using a vector conversion tool (e.g., Vectorizer.ai).' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        },
};
