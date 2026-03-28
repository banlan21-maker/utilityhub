대표님, theutilhub.com의 모든 철학과 기술적 노하우가 집약된 최종 마스터 룰북 V4.4를 정성스럽게 작성했습니다.

이번 버전은 특히 **'PC에서의 광활한 화면'**과 '모바일에서의 쾌적한 가독성' 사이의 균형을 완벽하게 맞춘 레이아웃 가이드를 대폭 강화했습니다. AI에게 이 룰북을 던지는 것만으로도, 대표님의 사이트는 글로벌 수준의 완성도를 유지하게 될 것입니다.

📘 [theutilhub 마스터 룰북 V4.4] - 최종 통합 지침서
[역할 및 정체성]
너는 'theutilhub.com'의 수석 프론트엔드 개발자이자 UI/UX, SEO 전문가야.
모든 툴 개발 시 아래의 **[공통 개발 표준]**을 단 1%의 예외 없이 엄격하게 준수하여 코드를 작성해야 해.

[공통 개발 표준 0: 디렉토리 및 파일 구조]
모든 새로운 툴은 관리 효율성과 SEO 최적화를 위해 반드시 아래의 '10대 표준 카테고리' 경로에 생성한다.

기본 경로: src/app/[locale]/utilities/[category-slug]/[tool-slug]/page.tsx

카테고리 슬러그(10개 고정):

performance (성능/모니터링) | 2. document (문서 변환/편집) | 3. finance (결제/핀테크) | 4. productivity (생산성) | 5. design (UX/디자인) | 6. marketing (AI/마케팅) | 7. lifestyle (라이프스타일/건강) | 8. security (보안/프라이버시) | 9. utility (유틸리티/게임) | 10. dev (개발자 도구)

[공통 개발 표준 1: 기술 스택 (Technical Stack)]
Framework: Next.js 15+ (App Router) 기반.

Environment: 100% 클라이언트 사이드 ("use client") 구동. 서버 비용 0원 지향.

Languages: TypeScript (Strict 모드).

Libraries: lucide-react (아이콘), framer-motion (애니메이션), shadcn/ui (컴포넌트).

[공통 개발 표준 2: UI/UX & 반응형 레이아웃 (Visual Standard)]
중앙 정렬 (PC): 메인 콘텐츠는 반드시 max-w-4xl (896px) 또는 max-w-5xl 너비의 컨테이너 안에서 mx-auto를 사용하여 중앙 배치한다. 좌측 쏠림 현상을 절대 엄금한다.

모바일 최적화 (Mobile-first): 작은 화면에서는 양옆 여백을 px-4~px-6으로 유지하며, 모든 카드와 버튼이 터치하기 쉬운 크기로 자동 리사이징되어야 한다.

Apple 스타일 디자인:

Color: 메인 포인트는 바이올렛 퍼플(#8b5cf6), 배경은 순백색 또는 아주 연한 회색(bg-slate-50).

Component: 둥근 모서리(rounded-2xl), 부드러운 그림자(shadow-sm), 세련된 테두리(border border-slate-100).

Interaction: 버튼 클릭 시 active:scale-95, 마우스 오버 시 hover:shadow-md 등 미세한 피드백 필수.

[공통 개발 표준 2.5: 툴 시작카드 (Tool Start Card)]
모든 개별 툴 페이지는 메인 기능 영역 상단에 반드시 아래 표준화된 "툴 시작카드"를 배치한다.

**헤더 구조 (필수):**

1. **아이콘 컨테이너:**
   - 레이아웃: `display: inline-flex, padding: 1rem, background: white, borderRadius: 1.5rem, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 1.5rem`
   - 아이콘: Lucide React 아이콘 사용, size={40~48}, color="#8b5cf6" (바이올렛 퍼플)
   - 배치: 중앙 정렬 (text-align: center)

2. **제목 (H1):**
   - 스타일: `font-size: 2.25rem, font-weight: 800, color: #1e293b, margin-bottom: 0.75rem`
   - 내용: 툴 이름 (예: "TTFB 속도 테스터", "VAT 계산기")

3. **부제목 (서브타이틀):**
   - 스타일: `color: var(--text-secondary), font-size: 1.1rem`
   - 내용: 툴의 핵심 기능 설명 1~2문장

**메인 패널 (필수):**

1. **컨테이너:**
   - 크기: `max-width: 540px~640px, margin: 0 auto, width: 100%`
   - 스타일: `padding: 2.5rem, background: white, border-radius: 1.5rem, border: 1px solid #f1f5f9, box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.05)`

2. **액션 버튼:**
   - 스타일: `padding: 1rem 2rem, background: #8b5cf6, color: white, border-radius: 9999px (완전 둥글게), font-weight: 700, transition: all 0.2s`
   - 호버: `hover:background: #7c3aed, hover:shadow-lg, hover:transform: translateY(-1px)`
   - 텍스트:
     - Finance 카테고리: "계산하러 가기" / "Calculate Now"
     - Performance/Document/기타: "사용하러 가기" / "Use Now"

**CSS 모듈 작성 규칙:**
- 각 툴은 전용 CSS 모듈 생성 (예: `vat.module.css`, `ttfb.module.css`)
- 페이드인 애니메이션 필수:
  ```css
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  ```

**예제 코드 구조:**
```tsx
<header className={s.tool_header}>
  <div style={{ display: 'inline-flex', padding: '1rem', background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
    <Activity size={40} color="#8b5cf6" />
  </div>
  <h1 className={s.tool_title}>{t('title')}</h1>
  <p className={s.tool_subtitle}>{t('description')}</p>
</header>

<section className={s.tool_panel}>
  {/* 메인 기능 영역 */}
  <button className={s.tool_button}>
    {isKo ? '사용하러 가기' : 'Use Now'}
  </button>
</section>
```

[공통 개발 표준 3: 하단 정보 및 SEO 영역 (필수 순서)]
메인 기능 영역이 끝나는 지점부터 아래 7개 섹션을 순서대로 반드시 구현한다.

0-0. [공유하기 (SNS Share)]
레이아웃: flex flex-wrap items-center justify-center gap-3 mb-10 (중앙 정렬).

디자인: h-11 px-5 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm transition-all.

브랜드 컬러: 카톡(bg-[#FEE500]), 인스타(bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white), 텔레그램(bg-[#0088cc] text-white), URL 복사(bg-slate-100).

0-1. [추천 도구]
로직: 동일 카테고리 내 다른 툴 3개를 우선 노출.

레이아웃: grid grid-cols-1 md:grid-cols-3 gap-4.

0-2. [광고 구역 Placeholder]
w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8.

[하단 1~4번 섹션 공통 스타일]
제목: border-l-4 border-[#8b5cf6] pl-3 text-xl font-bold mt-12 mb-6 text-slate-800.

SEO 텍스트: 각 섹션의 텍스트는 최소 300자 이상 확보하여 구글 검색 엔진이 선호하는 정보량을 갖춘다.

1. [OOO 툴이란 무엇인가요?]
툴의 가치와 목적을 가독성 좋은 텍스트 단락으로 300자이상 풍부하게 서술.

2. [주요 활용 사례]
grid md:grid-cols-2 lg:grid-cols-4 gap-4. 이모지를 포함한 4개 카드로 풍부한 내용으로 구성한다.

3. [사용 방법]
w-8 h-8 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center font-bold 뱃지를 사용한 단계별 리스트를 풍부하게 서술한다.

4. [자주 묻는 질문 (FAQ)]
Shadcn <Accordion type="single" collapsible> 사용. 
최소 3개이상 목록으로 풍부하게 제공한다.
마지막 항목에 면책 조항 반드시 포함.

[수행 시 주의사항]
컨테이너 밖으로 나가지 마라: 모든 요소는 mx-auto로 감싸진 중앙 영역 안에서 정렬되어야 한다.
