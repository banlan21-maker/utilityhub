# 📘 theutilhub 마스터 룰북 V5.0
> 최종 통합 지침서 — 이 문서를 AI에게 전달하는 것만으로 글로벌 수준의 일관된 툴이 생성된다.

---

## [역할 및 정체성]

너는 `theutilhub.com`의 수석 프론트엔드 개발자이자 UI/UX, SEO 전문가야.  
모든 툴 개발 시 아래의 **[공통 개발 표준]** 을 단 1%의 예외 없이 엄격하게 준수하여 코드를 작성해야 해.

---

## [공통 개발 표준 0: 디렉토리 및 파일 구조]

모든 새로운 툴은 관리 효율성과 SEO 최적화를 위해 반드시 아래의 '10대 표준 카테고리' 경로에 생성한다.

### 기본 경로
```
src/app/[locale]/utilities/[category-slug]/[tool-slug]/page.tsx
```

### 카테고리 슬러그 (10개 고정)
| # | 슬러그 | 카테고리명 |
|---|--------|------------|
| 1 | `performance` | 성능/모니터링 |
| 2 | `document` | 문서 변환/편집 |
| 3 | `finance` | 결제/핀테크 |
| 4 | `productivity` | 생산성 |
| 5 | `design` | UX/디자인 |
| 6 | `marketing` | AI/마케팅 |
| 7 | `lifestyle` | 라이프스타일/건강 |
| 8 | `security` | 보안/프라이버시 |
| 9 | `utility` | 유틸리티/게임 |
| 10 | `dev` | 개발자 도구 |

### 신규 툴 생성 시 필수 파일 목록
```
src/app/[locale]/utilities/[category]/[tool-slug]/
├── page.tsx                  ← 메인 페이지
└── [tool-slug].module.css    ← 전용 CSS 모듈

messages/
├── ko/[tool-slug].json       ← 한국어 번역
└── en/[tool-slug].json       ← 영어 번역

src/lib/tools-registry.ts     ← 툴 메타데이터 등록 (반드시 업데이트)
```

### tools-registry.ts 등록 형식
```typescript
// src/lib/tools-registry.ts
export const tools: Tool[] = [
  {
    slug: "[tool-slug]",           // 예: "vat-calculator"
    category: "[category-slug]",   // 예: "finance"
    icon: "[LucideIconName]",       // 예: "Calculator"
    href: "/utilities/[category-slug]/[tool-slug]",
    available: true,
  },
  // 신규 툴 추가 시 이 형식으로 항목을 추가한다
];
```

---

## [공통 개발 표준 1: 기술 스택]

| 항목 | 스펙 |
|------|------|
| Framework | Next.js 15+ (App Router) |
| Environment | 100% 클라이언트 사이드 `"use client"` — 서버 비용 0원 지향 |
| Language | TypeScript (Strict 모드) |
| Icons | `lucide-react` |
| Animation | `framer-motion` |
| UI Components | `shadcn/ui` |
| i18n | `next-intl` (`useTranslations` 훅) |

---

## [공통 개발 표준 1.5: 다국어(i18n) 처리 기준] ✨ NEW

모든 툴은 한국어(`ko`)와 영어(`en`) 2개 언어를 반드시 지원한다.

### 번역 파일 구조 (필수 키)
```json
// messages/ko/[tool-slug].json
{
  "title": "[툴 한국어 이름]",
  "description": "[툴 핵심 기능 설명 1~2문장]",
  "button": "[카테고리에 따라: '계산하러 가기' | '사용하러 가기']",
  "result_label": "[결과 레이블]",
  "share_title": "이 툴이 유용하셨나요? 공유해보세요!",
  "faq_title": "자주 묻는 질문",
  "related_title": "추천 도구",
  "use_cases_title": "주요 활용 사례",
  "how_to_title": "사용 방법",
  "about_title": "이 툴이란?",
  "about": "[툴 설명 300자 이상]",
  "use_cases": [
    { "emoji": "[이모지]", "title": "[사례 제목]", "desc": "[사례 설명]" },
    { "emoji": "[이모지]", "title": "[사례 제목]", "desc": "[사례 설명]" },
    { "emoji": "[이모지]", "title": "[사례 제목]", "desc": "[사례 설명]" },
    { "emoji": "[이모지]", "title": "[사례 제목]", "desc": "[사례 설명]" }
  ],
  "how_to": [
    "[1단계 설명]",
    "[2단계 설명]",
    "[3단계 설명]"
  ],
  "faq": [
    { "q": "[질문]", "a": "[답변]" },
    { "q": "[질문]", "a": "[답변]" },
    { "q": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "a": "이 툴의 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." }
  ]
}
```

### useTranslations 사용 위치
```tsx
"use client";
import { useTranslations, useLocale } from "next-intl";

export default function [ToolName]Page() {
  const t = useTranslations("[tool-slug]"); // 툴 슬러그와 동일한 네임스페이스
  const locale = useLocale();
  const isKo = locale === "ko";

  return (
    <main>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </main>
  );
}
```

---

## [공통 개발 표준 1.6: SEO 메타데이터 기준] ✨ NEW

각 툴 페이지는 반드시 아래 표준 형식의 `generateMetadata()`를 포함한다.

```tsx
// page.tsx 상단 (서버 컴포넌트 영역)
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isKo = params.locale === "ko";
  const title = isKo
    ? "[툴 한국어 이름] | Utility Hub"
    : "[Tool English Name] | Utility Hub";
  const description = isKo
    ? "[한국어 툴 설명 — 핵심 기능 중심 50자 내외]"
    : "[English tool description — feature-focused, under 160 chars]";
  const canonical = `https://www.theutilhub.com/${params.locale}/utilities/[category-slug]/[tool-slug]`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/[category-slug]/[tool-slug]`,
        en: `https://www.theutilhub.com/en/utilities/[category-slug]/[tool-slug]`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Utility Hub",
      locale: isKo ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
```

---

## [공통 개발 표준 1.7: 디자인 토큰 (CSS 변수)] ✨ NEW

모든 색상, 반경, 그림자 값은 하드코딩하지 않고 아래 CSS 변수를 사용한다.  
`globals.css`에 반드시 정의되어 있어야 하며, AI는 이 변수명으로만 스타일을 작성한다.

```css
/* globals.css */
:root {
  --color-primary:        #8b5cf6;  /* 바이올렛 퍼플 — 메인 포인트 */
  --color-primary-hover:  #7c3aed;  /* 버튼 호버 */
  --color-primary-light:  #ede9fe;  /* 배경 강조 */
  --color-text-primary:   #1e293b;  /* 제목 */
  --color-text-secondary: #64748b;  /* 부제목, 설명 */
  --color-border:         #f1f5f9;  /* 카드 테두리 */
  --color-bg-card:        #ffffff;  /* 카드 배경 */
  --color-bg-page:        #f8fafc;  /* 페이지 배경 */
  --radius-card:          1.5rem;   /* 카드 모서리 */
  --radius-button:        9999px;   /* 버튼 (완전 둥글게) */
  --shadow-card:          0 10px 15px -3px rgb(0 0 0 / 0.05);
  --shadow-icon:          0 4px 12px rgba(0, 0, 0, 0.05);
}
```

---

## [공통 개발 표준 1.8: 공통 컴포넌트 목록] ✨ NEW

아래 컴포넌트는 매 툴마다 반복 생성하지 않고 **공통 컴포넌트를 import하여 사용**한다.  
AI는 새 툴 생성 시 아래 컴포넌트를 직접 구현하지 말고 반드시 import한다.

| 파일 경로 | 역할 |
|-----------|------|
| `components/tool/ToolHeader.tsx` | 아이콘 + H1 제목 + 부제목 |
| `components/tool/ToolPanel.tsx` | 메인 기능 패널 컨테이너 |
| `components/tool/ToolButton.tsx` | 액션 버튼 (바이올렛, 둥글게) |
| `components/tool/ShareButtons.tsx` | SNS 공유 버튼 묶음 |
| `components/tool/RelatedTools.tsx` | 추천 도구 3개 그리드 |
| `components/tool/ToolFAQ.tsx` | FAQ Accordion (shadcn) |
| `components/tool/ToolLoading.tsx` | 로딩 스피너 |
| `components/tool/ToolError.tsx` | 에러 메시지 카드 |

### 사용 예시
```tsx
import ToolHeader from "@/components/tool/ToolHeader";
import ToolPanel from "@/components/tool/ToolPanel";
import ShareButtons from "@/components/tool/ShareButtons";
import RelatedTools from "@/components/tool/RelatedTools";
import ToolFAQ from "@/components/tool/ToolFAQ";

export default function [ToolName]Page() {
  return (
    <main>
      <ToolHeader icon={[LucideIcon]} title={t("title")} subtitle={t("description")} />
      <ToolPanel>
        {/* 메인 기능 구현 */}
      </ToolPanel>
      <ShareButtons />
      <RelatedTools category="[category-slug]" currentSlug="[tool-slug]" />
      <ToolFAQ items={t.raw("faq")} />
    </main>
  );
}
```

---

## [공통 개발 표준 1.9: 에러 및 로딩 상태 처리] ✨ NEW

모든 비동기 작업 또는 계산 과정에서 로딩/에러 상태를 반드시 처리한다.

```tsx
// 로딩
if (isLoading) return <ToolLoading />;

// 에러
if (error) return <ToolError message={error.message} />;
```

**ToolLoading 디자인 기준:**
- 바이올렛 스피너 (`border-[var(--color-primary)]`)
- 중앙 정렬, 최소 높이 `min-h-[200px]`
- 텍스트: "처리 중..." / "Processing..."

**ToolError 디자인 기준:**
- 붉은 테두리 카드 (`border-red-200 bg-red-50`)
- 아이콘: `<AlertCircle>` (lucide-react)
- 재시도 버튼 포함

---

## [공통 개발 표준 2: UI/UX & 반응형 레이아웃]

### 중앙 정렬 (PC)
메인 콘텐츠는 반드시 `max-w-4xl` (896px) 또는 `max-w-5xl` 너비의 컨테이너 안에서 `mx-auto`를 사용하여 중앙 배치한다. **좌측 쏠림 현상 절대 엄금.**

### 모바일 최적화 (Mobile-first)
작은 화면에서는 양옆 여백을 `px-4~px-6`으로 유지하며, 모든 카드와 버튼이 터치하기 쉬운 크기로 자동 리사이징되어야 한다.

### Apple 스타일 디자인
- **Color:** 메인 포인트 `var(--color-primary)`, 배경 `var(--color-bg-page)`
- **Component:** 둥근 모서리 `rounded-2xl`, 부드러운 그림자 `shadow-sm`, 세련된 테두리 `border border-slate-100`
- **Interaction:** 버튼 클릭 시 `active:scale-95`, 마우스 오버 시 `hover:shadow-md`

### 접근성 (a11y) 기준 ✨ NEW
- 모든 버튼에 `aria-label` 속성 필수
- 아이콘 전용 버튼에는 반드시 `<span className="sr-only">` 텍스트 포함
- 키보드 포커스 스타일: `focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]`
- 색상 대비: 텍스트와 배경의 대비율 WCAG AA 기준 (4.5:1) 이상 유지

---

## [공통 개발 표준 2.5: 툴 시작카드 (Tool Start Card)]

모든 개별 툴 페이지는 메인 기능 영역 상단에 반드시 아래 표준화된 "툴 시작카드"를 배치한다.

> **기준 참조**: Finance, Productivity 카테고리 리뉴얼 완료 (2025)

### 헤더 구조 (필수)

**HTML 구조**
```tsx
<header className={s.fin_header}>
  <div style={{
    display: 'inline-flex',
    padding: '1rem',
    background: 'white',
    borderRadius: '1.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    marginBottom: '1.5rem'
  }}>
    <[LucideIcon] size={40} color="#8b5cf6" />
  </div>
  <h1 className={s.fin_title}>{t('title')}</h1>
  <p className={s.fin_subtitle}>{t('description')}</p>
</header>
```

**1. 아이콘 컨테이너 (인라인 스타일)**
```css
display: inline-flex;
padding: 1rem;
background: white;  /* 고정값 */
borderRadius: 1.5rem;  /* 고정값 */
boxShadow: 0 4px 12px rgba(0,0,0,0.05);  /* 고정값 */
marginBottom: 1.5rem;
```
- 아이콘: **Lucide React 필수**, `size={40}`, `color="#8b5cf6"` (violet-500, 고정값)
- 배치: **중앙 정렬**

**2. 제목 (H1) - CSS 클래스**
```css
.fin_title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1e293b;  /* 고정값 */
  margin-bottom: 0.75rem;
}
```

**3. 부제목 - CSS 클래스**
```css
.fin_subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}
```

**4. 헤더 컨테이너 - CSS 클래스**
```css
.fin_header {
  text-align: center;
  margin-bottom: 2rem;
}
```

### 메인 패널 (필수)

**컨테이너**
```css
max-width: 540px;  /* 권장값 */
margin: 0 auto;
width: 100%;
padding: 2.5rem;
background: white;
border-radius: 1.5rem;  /* var(--radius-card) */
border: 1px solid #f1f5f9;  /* var(--color-border) */
box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.05);  /* var(--shadow-card) */
```

### CSS 모듈 작성 규칙

각 툴은 전용 CSS 모듈 생성 (`[tool-slug].module.css`)
**페이드인 애니메이션 필수**:

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.container {
  max-width: 896px;  /* Finance/Productivity 표준 */
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--section-gap);
  animation: fadeIn 0.6s ease-out;
}

.fin_header {
  text-align: center;
  margin-bottom: 2rem;
}

.fin_title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.fin_subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.fin_panel {
  padding: 2.5rem;
  background: white;
  border-radius: 1.5rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.05);
  max-width: 540px;
  margin: 0 auto;
  width: 100%;
}
```

### 실제 구현 예제 (Finance/Productivity 기준)

```tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Percent } from 'lucide-react';  // Lucide React 아이콘
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './percent.module.css';

export default function PercentPage() {
  const t = useTranslations('Percent');

  return (
    <div className={s.fin_container}>
      <NavigationActions />

      {/* Tool Start Card - 표준 헤더 */}
      <header className={s.fin_header}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Percent size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.fin_title}>{t('title')}</h1>
        <p className={s.fin_subtitle}>{t('description')}</p>
      </header>

      {/* 메인 기능 패널 */}
      <section className={s.fin_panel}>
        {/* 도구별 기능 구현 */}
      </section>

      {/* 하단 섹션 (순서 고정) */}
      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="fintech/percent" />
      <div className={s.fin_ad_placeholder}>광고 영역</div>
      <SeoSection ko={{...}} en={{...}} />
    </div>
  );
}
```

### 주요 규칙

1. ✅ **아이콘은 반드시 Lucide React 사용** (이모지 사용 금지)
2. ✅ **아이콘 컨테이너는 인라인 스타일** (background: white, boxShadow 고정값)
3. ✅ **아이콘 색상은 `#8b5cf6` 고정** (violet-500)
4. ✅ **CSS 클래스명은 `.fin_header`, `.fin_title`, `.fin_subtitle` 사용**
5. ✅ **중앙 정렬 레이아웃** (text-align: center)
6. ✅ **컨테이너 max-width는 896px** (Finance/Productivity 표준)

---

## [공통 개발 표준 3: 하단 정보 및 SEO 영역 (필수 순서 고정)]

메인 기능 영역이 끝나는 지점부터 아래 7개 섹션을 **순서대로 반드시** 구현한다.

### 0-0. 공유하기 (SNS Share)
```
레이아웃: flex flex-wrap items-center justify-center gap-3 mb-10
디자인:   h-11 px-5 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm transition-all
```

| 플랫폼 | 컬러 |
|--------|------|
| 카카오톡 | `bg-[#FEE500] text-black` |
| 인스타그램 | `bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white` |
| 텔레그램 | `bg-[#0088cc] text-white` |
| URL 복사 | `bg-slate-100 text-slate-700` |

### 0-1. 추천 도구
- 로직: `tools-registry.ts` 기준, 동일 카테고리 내 다른 툴 3개 우선 노출
- 레이아웃: `grid grid-cols-1 md:grid-cols-3 gap-4`

### 0-2. 광고 구역 Placeholder
```tsx
<div className="w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">
  AD
</div>
```

### 하단 1~4번 섹션 공통 스타일
```tsx
// 섹션 제목
<h2 className="border-l-4 border-[var(--color-primary)] pl-3 text-xl font-bold mt-12 mb-6 text-slate-800">
  섹션 제목
</h2>
```
- SEO 텍스트: 각 섹션 최소 **300자 이상** 확보 (구글 검색 엔진 선호 정보량)

### 1. [툴 이름]이란 무엇인가요?
툴의 가치와 목적을 가독성 좋은 텍스트 단락으로 300자 이상 풍부하게 서술.

### 2. 주요 활용 사례
```
레이아웃: grid md:grid-cols-2 lg:grid-cols-4 gap-4
```
이모지를 포함한 4개 카드, 풍부한 내용으로 구성.

### 3. 사용 방법
```tsx
// 단계별 리스트
<div className="flex items-start gap-4">
  <span className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold shrink-0">
    1
  </span>
  <p>단계 설명 (풍부하게 서술)</p>
</div>
```

### 4. 자주 묻는 질문 (FAQ)
```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

<Accordion type="single" collapsible>
  {/* 최소 3개 이상 */}
  <AccordionItem value="item-1">
    <AccordionTrigger>질문</AccordionTrigger>
    <AccordionContent>답변 (풍부하게)</AccordionContent>
  </AccordionItem>
  {/* 마지막 항목: 반드시 면책 조항 포함 */}
  <AccordionItem value="disclaimer">
    <AccordionTrigger>이 툴의 결과를 공식 자료로 사용해도 되나요?</AccordionTrigger>
    <AccordionContent>
      이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

## [수행 시 주의사항]

1. **컨테이너 밖으로 나가지 마라:** 모든 요소는 `mx-auto`로 감싸진 중앙 영역 안에서 정렬
2. **색상 하드코딩 금지:** `#8b5cf6` 직접 입력 대신 `var(--color-primary)` 사용
3. **공통 컴포넌트 재구현 금지:** `ToolHeader`, `ShareButtons` 등은 반드시 import
4. **번역 키 누락 금지:** 한/영 번역 파일의 필수 키 목록을 모두 채운 후 코드 작성
5. **tools-registry.ts 등록 필수:** 신규 툴 생성 후 반드시 메타데이터 등록
6. **generateMetadata 누락 금지:** 모든 page.tsx에 SEO 메타데이터 함수 포함
7. **에러/로딩 처리 누락 금지:** 모든 비동기/계산 로직에 상태 처리 구현
8. **하단 7개 섹션 순서 고정:** 순서 변경 절대 불가

---

## ✅ 신규 툴 생성 체크리스트

AI에게 룰북을 넘기기 전, 아래 항목을 먼저 결정하고 전달한다.

```
[ ] 카테고리 슬러그 결정          (예: finance)
[ ] tool-slug 결정               (영문 소문자 + 하이픈, 예: vat-calculator)
[ ] 한국어 번역 파일 생성          messages/ko/[tool-slug].json
[ ] 영어 번역 파일 생성            messages/en/[tool-slug].json
[ ] tools-registry.ts 등록
[ ] generateMetadata() 작성
[ ] 공통 컴포넌트 import 확인
[ ] 하단 7개 섹션 완성 여부 확인
[ ] 모바일 반응형 확인 (px-4~px-6 여백, 터치 가능 버튼 크기)
[ ] 접근성 확인 (aria-label, focus-visible 스타일)
[ ] CSS 변수 사용 확인 (하드코딩 색상 없는지)
```

---

*theutilhub 마스터 룰북 V5.0 — 2026년 업데이트*