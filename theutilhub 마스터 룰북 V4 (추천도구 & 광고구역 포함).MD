[공통 개발 표준 1: 기술 스택]

Next.js 15+ (App Router), TypeScript 환경.

서버 통신 없이 100% 클라이언트 사이드(use client)로 구동되게 작성.

필요한 라이브러리: lucide-react (아이콘), framer-motion (애니메이션), shadcn/ui (컴포넌트).

[공통 개발 표준 2: 디자인 및 UI/UX (Sleek & Professional)]

Tailwind CSS와 Shadcn/UI 컴포넌트를 적극 사용해.

메인 포인트 컬러(Primary Color)를 사용하여 통일감을 줘.

반응형(Mobile-first) 필수. 카드형 UI와 부드러운 Hover 효과를 기본으로 함.

[공통 개발 표준 3: 하단 정보 및 SEO 영역 (필수 포함 & UI 레이아웃)]
툴 기능 영역 하단에는 아래 7개의 구역을 순서대로 구현해.

0-0. [공유하기 (SNS Share)] 섹션

위치: 메인 툴 바로 아래, 추천 도구 섹션 직전.

타이틀: text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider 스타일로 "이 도구를 친구에게 공유하기" 표기.

레이아웃: flex flex-wrap items-center gap-3 mb-10

버튼 디자인: h-11 px-5 rounded-full flex items-center gap-2 text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-sm

플랫폼별 명세:

카카오톡: bg-[#FEE500] text-[#3C1E1E] / 아이콘: MessageCircle

인스타그램: bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white / 아이콘: Instagram

텔레그램: bg-[#0088cc] text-white / 아이콘: Send

URL 복사: bg-slate-100 text-slate-600 / 아이콘: Link2 (클릭 시 Shadcn Toast로 "복사 완료" 알림 필수)

0-1. [추천 도구] 섹션

레이아웃: 3개의 카드가 가로로 나열되는 그리드(grid grid-cols-1 md:grid-cols-3 gap-4).

카드 UI: bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-4 border border-slate-100.

내용: 이모지 + 굵은 제목 + 짧은 설명.

0-2. [광고 구역 Placeholder] 섹션

레이아웃: w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8

텍스트: "광고 영역 (Google AdSense 등)"

[아래 1~4번 섹션 공통 제목 스타일]

border-l-4 border-primary pl-3 text-xl font-bold mt-12 mb-6

1. [OOO 툴이란 무엇인가요?] 섹션

내용: 툴의 정의, 타겟 사용자, 제작 의도를 가독성 좋게 설명.

2. [주요 활용 사례] 섹션

레이아웃: 4개 그리드 카드(grid md:grid-cols-2 lg:grid-cols-4 gap-4).

내용: 상황별 활용법을 이모지와 함께 구체적으로 제시.

3. [사용 방법] 섹션

레이아웃: 번호가 매겨진 세로 리스트.

UI: w-8 h-8 rounded-full bg-primary text-white 뱃지 사용.

4. [자주 묻는 질문 (FAQ)] 섹션

컴포넌트: Shadcn <Accordion type="single" collapsible> 사용.

내용: 최소 3개 이상의 질문(Q.)과 답변(A.) 구성. 마지막에 면책 조항 필수 포함.