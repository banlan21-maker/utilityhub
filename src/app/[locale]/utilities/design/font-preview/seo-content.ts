// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: "다국어 폰트 비교기란 무엇인가요?",
          description: "구글 폰트 비교기(Google Fonts Comparator)는 영문 폰트와 한국어 폰트를 나란히 미리보기하고 CSS 코드를 한 번에 복사할 수 있는 온라인 폰트 탐색 도구입니다. 디자이너나 개발자가 프로젝트에 맞는 폰트를 선택할 때, 수십 개의 구글 폰트를 한 화면에서 비교하고 영문·한글 조화 탭으로 최적의 폰트 페어링까지 찾을 수 있습니다. 폰트는 화면에 보일 때만 레이지 로딩되므로 페이지 성능에도 영향이 없습니다.",
          useCases: [
            { icon: '🖥️', title: '웹사이트 & 앱 폰트 선정', desc: '헤딩용 폰트와 본문용 폰트를 함께 미리보며, 실제 문장으로 가독성과 분위기를 비교해 최적의 조합을 찾습니다.' },
            { icon: '📱', title: '한·영 혼용 디자인 최적화', desc: '한국어와 영어를 함께 사용하는 서비스에서 두 언어가 자연스럽게 어우러지는 폰트 페어링을 Harmony 탭에서 쉽게 찾습니다.' },
            { icon: '✍️', title: '블로그 & 미디어 타이포그래피', desc: '긴 글을 읽기 편한 폰트, 제목을 돋보이게 하는 폰트를 다양한 크기로 미리 보며 블로그 스타일을 결정합니다.' },
            { icon: '🎨', title: '브랜드 아이덴티티 수립', desc: '브랜드 성격(모던/클래식/캐주얼 등)에 맞는 폰트를 탐색하고, CSS 스니펫을 바로 복사해 디자인 시스템에 적용합니다.' },
          ],
          steps: [
            { step: '탭 선택 (영문 / 한글 / Harmony)', desc: '영문 폰트, 한국어 폰트, 또는 한·영 조화 페어링 탭을 선택합니다.' },
            { step: '미리보기 텍스트 & 크기 조절', desc: '상단 입력창에 실제 사용할 문장을 입력하고 폰트 크기를 조절해 실제 환경과 유사하게 미리봅니다.' },
            { step: 'CSS 복사 & 프로젝트 적용', desc: '마음에 드는 폰트 카드의 복사 버튼을 클릭하면 Google Fonts <link> 코드와 font-family CSS가 클립보드에 복사됩니다.' },
            { step: '폰트 페어링 최종 결정', desc: 'Harmony 탭에서 한국어-영어 폰트 조합을 비교하고 헤딩·본문 폰트를 확정합니다. 복사한 CSS 스니펫을 디자인 시스템 문서에 바로 붙여넣어 팀 전체가 동일한 폰트 기준을 공유할 수 있습니다.' },
          ],
          faqs: [
            { q: '구글 폰트는 무료로 사용할 수 있나요?', a: '네. Google Fonts에 등록된 모든 폰트는 SIL Open Font License 또는 Apache License로 제공되어 개인·상업적 용도 모두 무료로 사용할 수 있습니다. 별도 저작권 표기도 필요하지 않습니다.' },
            { q: '폰트를 불러오는 속도가 너무 느립니다', a: '이 도구는 IntersectionObserver를 이용해 화면에 보이는 카드의 폰트만 레이지 로드합니다. 한 번 로드된 폰트는 캐시되어 재방문 시 즉시 표시됩니다. 느린 경우 브라우저 캐시를 지우거나 네트워크 환경을 확인하세요.' },
            { q: '눈누(NoonNU) 폰트도 지원되나요?', a: '현재는 Google Fonts를 통해 제공되는 한국어 폰트를 지원합니다. 눈누 전용 폰트는 향후 업데이트에서 추가할 예정입니다. 필요한 폰트가 있으면 피드백 게시판에 남겨주세요.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: "What is a Multilingual Font Comparator?",
          description: "A Google Fonts Comparator lets designers and developers preview English and Korean fonts side by side and copy CSS code in one click. Compare dozens of Google Fonts on a single screen and use the Harmony tab to find the perfect Korean-English font pairing. Fonts are lazy-loaded only when visible, so there's no impact on page performance.",
          useCases: [
            { icon: '🖥️', title: 'Website & App Font Selection', desc: 'Preview heading and body fonts together with real sentences to compare readability and mood and find the optimal combination.' },
            { icon: '📱', title: 'Mixed Korean-English Design', desc: 'For services that use both Korean and English, use the Harmony tab to easily find pairings where the two scripts complement each other naturally.' },
            { icon: '✍️', title: 'Blog & Media Typography', desc: 'Preview easy-to-read fonts for long articles and eye-catching fonts for titles at various sizes to define your blog\'s typographic style.' },
            { icon: '🎨', title: 'Brand Identity Development', desc: 'Explore fonts that match your brand personality (modern/classic/casual) and copy the CSS snippet directly into your design system.' },
          ],
          steps: [
            { step: 'Select a tab (Latin / Korean / Harmony)', desc: 'Choose the Latin fonts tab, Korean fonts tab, or the Korean-English Harmony pairing tab.' },
            { step: 'Set preview text & font size', desc: 'Enter the actual sentence you plan to use and adjust the font size slider to preview it in a realistic context.' },
            { step: 'Copy CSS & apply to project', desc: 'Click the copy button on any font card to copy the Google Fonts <link> tag and font-family CSS to your clipboard.' },
            { step: 'Finalize font pairing', desc: 'Use the Harmony tab to compare Korean-English font combinations and confirm your heading and body fonts. Paste the copied CSS snippet into your design system documentation so the entire team shares the same typographic standards.' },
          ],
          faqs: [
            { q: 'Are Google Fonts free to use?', a: 'Yes. All fonts on Google Fonts are provided under the SIL Open Font License or Apache License, making them free for both personal and commercial use. No attribution is required.' },
            { q: 'Font loading is too slow', a: 'This tool uses IntersectionObserver to lazy-load only the fonts for cards currently in view. Once loaded, fonts are cached for instant display on subsequent visits. If it\'s slow, try clearing your browser cache or checking your network.' },
            { q: 'Are NoonNU fonts supported?', a: 'Currently only Korean fonts available through Google Fonts are supported. NoonNU-exclusive fonts are planned for a future update. If you need a specific font, leave a request on the feedback board.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        },
};
