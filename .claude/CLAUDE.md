# 📘 theutilhub 마스터 룰북 V5.1

> CLAUDE.md 전용 — UI/UX 원본 유지 + SEO/AEO 최적화 완전 통합판
> 이 파일 하나를 `.claude/CLAUDE.md`에 두면 모든 세션에 자동 적용된다.

\---

## \[역할 및 정체성]

너는 `theutilhub.com`의 수석 프론트엔드 개발자이자 UI/UX, SEO 전문가야.
모든 툴 개발 시 아래의 **\[공통 개발 표준]** 을 단 1%의 예외 없이 엄격하게 준수하여 코드를 작성해야 해.

\---

## \[공통 개발 표준 0: 디렉토리 및 파일 구조]

### 기본 경로

```
src/app/\[locale]/utilities/\[category-slug]/\[tool-slug]/page.tsx
```

### 카테고리 슬러그 (10개 고정)

|#|슬러그|카테고리명|
|-|-|-|
|1|`performance`|성능/모니터링|
|2|`document`|문서 변환/편집|
|3|`finance`|결제/핀테크|
|4|`productivity`|생산성|
|5|`design`|UX/디자인|
|6|`marketing`|AI/마케팅|
|7|`lifestyle`|라이프스타일/건강|
|8|`security`|보안/프라이버시|
|9|`utility`|유틸리티/게임|
|10|`dev`|개발자 도구|

### 신규 툴 생성 시 필수 파일 목록

```
src/app/\[locale]/utilities/\[category]/\[tool-slug]/
├── page.tsx                    ← 서버 컴포넌트 (generateMetadata + JSON-LD만 담당)
├── \[ToolName]Client.tsx        ← 클라이언트 컴포넌트 ('use client', 실제 UI)
└── \[tool-slug].module.css      ← 전용 CSS 모듈

messages/
├── ko.json                     ← 한국어 번역 (공통 파일에 키 추가)
└── en.json                     ← 영어 번역 (공통 파일에 키 추가)

src/lib/tools-registry.ts       ← 툴 메타데이터 등록 (반드시 업데이트)
```

> ⚠️ **page.tsx는 반드시 서버 컴포넌트여야 한다.**
> `'use client'`를 page.tsx에 직접 쓰면 `generateMetadata`가 동작하지 않아
> canonical 태그가 누락되고 구글 색인에서 중복 페이지로 처리된다.
> 모든 UI 로직은 `[ToolName]Client.tsx`에 작성하고 page.tsx에서 import한다.

### tools-registry.ts 등록 형식

```typescript
{
  slug: "\[tool-slug]",
  category: "\[category-slug]",
  icon: "\[LucideIconName]",
  href: "/utilities/\[category-slug]/\[tool-slug]",
  available: true,
}
```

> ⚠️ tools-registry.ts 등록 = sitemap 자동 포함. 반드시 등록할 것.

\---

## \[공통 개발 표준 1: 기술 스택]

|항목|스펙|
|-|-|
|Framework|Next.js 15+ (App Router)|
|Environment|100% 클라이언트 사이드 `"use client"` — 서버 비용 0원|
|Language|TypeScript (Strict 모드)|
|Icons|`lucide-react`|
|Animation|`framer-motion`|
|UI Components|`shadcn/ui`|
|i18n|`next-intl` (`useTranslations` 훅)|

\---

## \[공통 개발 표준 1.5: 다국어(i18n) 처리 기준]

모든 툴은 한국어(`ko`)와 영어(`en`) 2개 언어를 반드시 지원한다.

### 번역 파일 구조 (필수 키)

```json
{
  "title": "\[툴 한국어 이름]",
  "description": "\[툴 핵심 기능 설명 1\~2문장]",
  "button": "\[카테고리에 따라: '계산하러 가기' | '사용하러 가기']",
  "result\_label": "\[결과 레이블]",
  "share\_title": "이 툴이 유용하셨나요? 공유해보세요!",
  "faq\_title": "자주 묻는 질문",
  "related\_title": "추천 도구",
  "use\_cases\_title": "주요 활용 사례",
  "how\_to\_title": "사용 방법",
  "about\_title": "이 툴이란?",
  "about": "\[툴 설명 300자 이상]",
  "use\_cases": \[
    { "emoji": "\[이모지]", "title": "\[사례 제목]", "desc": "\[사례 설명 50자 이상]" },
    { "emoji": "\[이모지]", "title": "\[사례 제목]", "desc": "\[사례 설명 50자 이상]" },
    { "emoji": "\[이모지]", "title": "\[사례 제목]", "desc": "\[사례 설명 50자 이상]" },
    { "emoji": "\[이모지]", "title": "\[사례 제목]", "desc": "\[사례 설명 50자 이상]" }
  ],
  "how\_to": \[
    "\[1단계 설명 50자 이상]",
    "\[2단계 설명 50자 이상]",
    "\[3단계 설명 50자 이상]",
    "\[4단계 설명 50자 이상]"
  ],
  "faq": \[
    { "q": "\[질문]", "a": "\[답변 100자 이상]" },
    { "q": "\[질문]", "a": "\[답변 100자 이상]" },
    { "q": "\[질문]", "a": "\[답변 100자 이상]" },
    { "q": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "a": "이 툴의 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." }
  ]
}
```

\---

## \[공통 개발 표준 1.55: 서버/클라이언트 파일 분리 패턴 (필수)]

> **canonical 누락 = 구글 중복 페이지 판정 = 색인 실패**
> 이 패턴을 지키지 않으면 SEO가 망가진다. 예외 없이 적용한다.

### 필수 파일 분리 구조

```
page.tsx          → 서버 컴포넌트 (NO 'use client')
                    generateMetadata() + JSON-LD 스키마 + <ToolNameClient /> 렌더링만 담당

[ToolName]Client.tsx → 'use client'
                    useState, useEffect, 이벤트 핸들러 등 모든 UI 로직
```

### page.tsx 최소 구조

```tsx
// page.tsx (서버 — 'use client' 절대 금지)
import type { Metadata } from 'next';
import \[ToolName]Client from './\[ToolName]Client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // ... canonical, title, description, alternates 설정
}

const softwareSchema = { /* JSON-LD */ };
const faqSchema = { /* JSON-LD */ };

export default function \[ToolName]Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ \_\_html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ \_\_html: JSON.stringify(faqSchema) }} />
      <\[ToolName]Client />
    </>
  );
}
```

### [ToolName]Client.tsx 최소 구조

```tsx
'use client';
// useState, 이벤트, UI 모두 여기에
export default function \[ToolName]Client() { ... }
```

---

## \[공통 개발 표준 1.6: SEO 메타데이터 기준]

각 툴 페이지는 반드시 아래 표준 형식의 `generateMetadata()`를 포함한다.

```tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isKo = params.locale === "ko";
  const title = isKo
    ? "\[툴 한국어 이름] | Utility Hub"
    : "\[Tool English Name] | Utility Hub";
  const description = isKo
    ? "\[한국어 툴 설명 — 핵심 기능 중심 50자 내외]"
    : "\[English tool description — feature-focused, under 160 chars]";
  const canonical = `https://www.theutilhub.com/${params.locale}/utilities/\[category-slug]/\[tool-slug]`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `https://www.theutilhub.com/ko/utilities/\[category-slug]/\[tool-slug]`,
        en: `https://www.theutilhub.com/en/utilities/\[category-slug]/\[tool-slug]`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Utility Hub",
      locale: isKo ? "ko\_KR" : "en\_US",
      type: "website",
    },
    twitter: {
      card: "summary\_large\_image",
      title,
      description,
    },
  };
}
```

\---

## \[공통 개발 표준 1.65: JSON-LD 스키마 (SEO/AEO 필수)]

> AEO(Answer Engine Optimization): AI 검색(Perplexity, ChatGPT, Gemini)에서 답변 소스로 인용되기 위한 구조화 데이터.
> 모든 툴 page.tsx에 generateMetadata 바로 아래 반드시 포함한다.

```tsx
// page.tsx — generateMetadata 아래에 추가
const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "\[툴 이름 KO]",
  "alternateName": "\[Tool Name EN]",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "KRW"
  },
  "url": "https://www.theutilhub.com/ko/utilities/\[category]/\[tool-slug]",
  "description": "\[툴 설명 — description과 동일하게]"
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": \[
    {
      "@type": "Question",
      "name": "\[FAQ 질문 1]",
      "acceptedAnswer": { "@type": "Answer", "text": "\[FAQ 답변 1]" }
    },
    {
      "@type": "Question",
      "name": "\[FAQ 질문 2]",
      "acceptedAnswer": { "@type": "Answer", "text": "\[FAQ 답변 2]" }
    },
    {
      "@type": "Question",
      "name": "\[FAQ 질문 3]",
      "acceptedAnswer": { "@type": "Answer", "text": "\[FAQ 답변 3]" }
    },
    {
      "@type": "Question",
      "name": "\[FAQ 질문 4]",
      "acceptedAnswer": { "@type": "Answer", "text": "\[FAQ 답변 4]" }
    }
  ]
};

// page.tsx return 내부 <head> 영역에 삽입
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ \_\_html: JSON.stringify(softwareSchema) }}
/>
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ \_\_html: JSON.stringify(faqSchema) }}
/>
```

\---

## \[공통 개발 표준 1.7: 디자인 토큰 (CSS 변수)]

> 색상 하드코딩 절대 금지. 아래 변수명으로만 스타일 작성.

```css
:root {
  --color-primary:        #8b5cf6;
  --color-primary-hover:  #7c3aed;
  --color-primary-light:  #ede9fe;
  --color-text-primary:   #1e293b;
  --color-text-secondary: #64748b;
  --color-border:         #f1f5f9;
  --color-bg-card:        #ffffff;
  --color-bg-page:        #f8fafc;
  --radius-card:          1.5rem;
  --radius-button:        9999px;
  --shadow-card:          0 10px 15px -3px rgb(0 0 0 / 0.05);
  --shadow-icon:          0 4px 12px rgba(0, 0, 0, 0.05);
}
```

\---

## \[공통 개발 표준 1.8: 공통 컴포넌트 목록]

> 아래 컴포넌트는 직접 구현하지 말고 반드시 import해서 사용한다.

|파일 경로|역할|
|-|-|
|`@/app/components/NavigationActions`|뒤로가기 네비게이션|
|`@/app/components/SeoSection`|SEO 하단 4개 섹션 통합 컴포넌트|
|`@/app/components/RelatedTools`|추천 도구 3개 그리드|
|`@/app/components/ShareBar`|SNS 공유 버튼 묶음|

\---

## \[공통 개발 표준 1.9: 에러 및 로딩 상태 처리]

```tsx
if (isLoading) return <ToolLoading />;
if (error) return <ToolError message={error.message} />;
```

* ToolLoading: 바이올렛 스피너, 중앙 정렬, `min-h-\[200px]`
* ToolError: 붉은 테두리 카드, `<AlertCircle>` 아이콘, 재시도 버튼

\---

## \[공통 개발 표준 2: UI/UX \& 반응형 레이아웃]

### 중앙 정렬 (PC)

* 메인 콘텐츠: `max-w-4xl` (896px) 또는 `max-w-5xl`, `mx-auto` 중앙 배치
* **좌측 쏠림 절대 금지**

### 모바일 최적화

* 양옆 여백: `px-4\~px-6`
* 모든 카드·버튼 터치 가능 크기로 자동 리사이징

### Apple 스타일 디자인

* Color: `var(--color-primary)`, 배경 `var(--color-bg-page)`
* Component: `rounded-2xl`, `shadow-sm`, `border border-slate-100`
* Interaction: `active:scale-95`, `hover:shadow-md`

### 접근성 (a11y)

* 모든 버튼 `aria-label` 필수
* 아이콘 전용 버튼: `<span className="sr-only">` 포함
* 키보드 포커스: `focus-visible:ring-2 focus-visible:ring-\[var(--color-primary)]`
* 색상 대비: WCAG AA 기준 (4.5:1) 이상

\---

## \[공통 개발 표준 2.4: 카테고리 리스팅 페이지]

### 카드 규격 (고정값 — 변경 금지)

|항목|고정값|
|-|-|
|카드 최소 높이|`min-height: 300px`|
|카드 패딩|`padding: 2.5rem`|
|카드 모서리|`border-radius: 2rem`|
|카드 테두리|`1px solid #f1f5f9`|
|카드 그림자|`box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05)`|
|그리드 열|`repeat(auto-fill, minmax(320px, 1fr))`|
|그리드 간격|`gap: 2rem`|
|컨테이너 max-width|`1024px`|

### 카드 호버 효과 (고정 — 변경 금지)

```css
transform: translateY(-10px);
box-shadow: 0 30px 60px -12px rgba(139, 92, 246, 0.15);
border-color: #8b5cf6;
```

### 아이콘 규격

|항목|고정값|
|-|-|
|카테고리 페이지 아이콘|`size={48}`|
|툴 헤더 아이콘|`size={40}`|
|카드 내 아이콘|`size={36}`|
|아이콘 색상|`#8b5cf6` (고정)|
|래퍼 배경|`rgba(R,G,B, 0.08)`|
|래퍼 크기|`72px × 72px`|
|래퍼 모서리|`border-radius: 1.5rem`|

### 카드 텍스트 규칙

* 제목: KO 15자 이내 / EN 4단어 이내 / 최대 2줄 (`-webkit-line-clamp: 2`)
* 설명: KO 60자 이내 / EN 25단어 이내 / 최대 4줄 (`-webkit-line-clamp: 4`)

### CTA 버튼

|카테고리|KO 텍스트|EN 텍스트|
|-|-|-|
|finance|계산하러 가기|Calculate Now|
|그 외 전체|사용하러 가기|Use Now|

* 색상: `#8b5cf6`, `font-weight: 800`, `<ArrowRight size={18} />`
* 기본: 숨김 (`opacity: 0`) → 호버 시 표시 (`opacity: 1`)

\---

## \[공통 개발 표준 2.5: 툴 시작카드 (Tool Start Card)]

### 헤더 구조 (고정 — 변경 금지)

```tsx
<header className={s.fin\_header}>
  <div style={{
    display: 'inline-flex',
    padding: '1rem',
    background: 'white',
    borderRadius: '1.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    marginBottom: '1.5rem'
  }}>
    <\[LucideIcon] size={40} color="#8b5cf6" />
  </div>
  <h1 className={s.fin\_title}>{t('title')}</h1>
  <p className={s.fin\_subtitle}>{t('description')}</p>
</header>
```

### CSS 모듈 기본 구조 (고정)

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.container {
  max-width: 896px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--section-gap);
  animation: fadeIn 0.6s ease-out;
}

.fin\_header { text-align: center; margin-bottom: 2rem; }
.fin\_title  { font-size: 2.25rem; font-weight: 800; color: #1e293b; margin-bottom: 0.75rem; }
.fin\_subtitle { color: var(--text-secondary); font-size: 1.1rem; }

.fin\_panel {
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

### 실제 구현 예제

```tsx
'use client';
import { useTranslations } from 'next-intl';
import { \[LucideIcon] } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './\[tool-slug].module.css';

export default function \[ToolName]Page() {
  const t = useTranslations('\[tool-slug]');

  return (
    <div className={s.container}>
      <NavigationActions />
      <header className={s.fin\_header}>
        <div style={{ display:'inline-flex', padding:'1rem', background:'white', borderRadius:'1.5rem', boxShadow:'0 4px 12px rgba(0,0,0,0.05)', marginBottom:'1.5rem' }}>
          <\[LucideIcon] size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.fin\_title}>{t('title')}</h1>
        <p className={s.fin\_subtitle}>{t('description')}</p>
      </header>

      <section className={s.fin\_panel}>
        {/\* 메인 기능 구현 \*/}
      </section>

      {/\* 하단 7개 섹션 — 순서 절대 고정 \*/}
      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="\[category]/\[tool-slug]" />
      <div className="w-full min-h-\[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">AD</div>
      <SeoSection ko={{...}} en={{...}} />
    </div>
  );
}
```

\---

## \[공통 개발 표준 3: 하단 SEO 섹션 (필수 순서 고정)]

메인 기능 영역 이후 아래 7개 섹션을 **순서대로 반드시** 구현한다. **순서 변경 절대 불가.**

### 0-0. 공유하기 (SNS Share)

|플랫폼|컬러|
|-|-|
|카카오톡|`bg-\[#FEE500] text-black`|
|인스타그램|`bg-gradient-to-tr from-\[#f9ce34] via-\[#ee2a7b] to-\[#6228d7] text-white`|
|텔레그램|`bg-\[#0088cc] text-white`|
|URL 복사|`bg-slate-100 text-slate-700`|

### 0-1. 추천 도구

* 동일 카테고리 내 다른 툴 3개 우선
* 레이아웃: `grid grid-cols-1 md:grid-cols-3 gap-4`

### 0-2. 광고 구역 Placeholder

```tsx
<div className="w-full min-h-\[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">
  AD
</div>
```

### 1\~4. SEO 콘텐츠 섹션 (SeoSection 컴포넌트 사용)

```tsx
<SeoSection
  ko={{
    title: '\[툴 이름]이란 무엇인가요?',
    description: '...300자 이상...',
    useCases: \[
      { icon: '🎯', title: '활용사례1', desc: '50자 이상 구체적 설명' },
      { icon: '📊', title: '활용사례2', desc: '50자 이상 구체적 설명' },
      { icon: '💡', title: '활용사례3', desc: '50자 이상 구체적 설명' },
      { icon: '🔧', title: '활용사례4', desc: '50자 이상 구체적 설명' },
    ],
    steps: \[
      { step: '1단계명', desc: '50자 이상 구체적 설명 (버튼 위치, 실제 동작 포함)' },
      { step: '2단계명', desc: '50자 이상 구체적 설명' },
      { step: '3단계명', desc: '50자 이상 구체적 설명' },
      { step: '4단계명', desc: '50자 이상 구체적 설명' },
    ],
    faqs: \[
      { q: '질문1? (데이터 출처 관련)', a: '100자 이상 구체적 답변' },
      { q: '질문2? (정확도 관련)',      a: '100자 이상 구체적 답변' },
      { q: '질문3? (사용 팁 관련)',     a: '100자 이상 구체적 답변' },
      { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
        a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
    ],
  }}
  en={{
    title: 'What is \[Tool Name]?',
    description: '...150 words or more...',
    useCases: \[
      { icon: '🎯', title: 'Use Case 1', desc: '20 words or more specific description' },
      { icon: '📊', title: 'Use Case 2', desc: '20 words or more specific description' },
      { icon: '💡', title: 'Use Case 3', desc: '20 words or more specific description' },
      { icon: '🔧', title: 'Use Case 4', desc: '20 words or more specific description' },
    ],
    steps: \[
      { step: 'Step 1', desc: '20 words or more specific description' },
      { step: 'Step 2', desc: '20 words or more specific description' },
      { step: 'Step 3', desc: '20 words or more specific description' },
      { step: 'Step 4', desc: '20 words or more specific description' },
    ],
    faqs: \[
      { q: 'Question 1?', a: '40 words or more specific answer' },
      { q: 'Question 2?', a: '40 words or more specific answer' },
      { q: 'Question 3?', a: '40 words or more specific answer' },
      { q: 'Can I use this result as official data?',
        a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
    ],
  }}
/>
```

\---

## \[공통 개발 표준 3.1: SEO/AEO 콘텐츠 품질 기준]

> 구글 애드센스 승인 + AI 검색 인용 최적화 기준.
> 참고 모델 페이지: `/ko/utilities/finance/exchange-rate`

### 분량 기준 (최소값 — 미달 시 재작성)

|섹션|한국어|영어|
|-|-|-|
|description (툴 설명)|**300자 이상** (500자 권장)|**150단어 이상** (200단어 권장)|
|useCases 각 desc|**50자 이상**|**20단어 이상**|
|steps 각 desc|**50자 이상**|**20단어 이상**|
|faqs 각 답변|**100자 이상**|**40단어 이상**|

### 콘텐츠 품질 기준

**description에 반드시 포함할 내용**

1. 툴이 무엇인지 (정의)
2. 어떤 기술/데이터를 사용하는지 (신뢰성)
3. 어떤 문제를 해결하는지 (가치)
4. 대표 활용 상황 2\~3가지 (구체성)

**useCases — 금지 패턴**

```
❌ "편리하게 사용할 수 있습니다" (막연함)
✅ "해외 쇼핑몰 결제 전 원화 환산 금액을 미리 확인하여 예산을 정확하게 수립할 수 있습니다" (구체적)
```

**steps — 금지 패턴**

```
❌ "값을 입력합니다" (너무 짧음)
✅ "상단 드롭다운에서 출발 통화를 선택하고, 환전할 금액을 입력란에 숫자로 입력합니다. 소수점도 입력 가능합니다." (구체적)
```

**faqs — 서로 다른 관점 4개 선택**

* 관점 1: 데이터 출처 / 정확도 근거
* 관점 2: 사용 팁 / 실용적 활용법
* 관점 3: 기능 한계 / 주의사항
* 관점 4: 면책 조항 (고정 문구 사용)

### AEO 최적화 추가 원칙

* FAQ 질문은 실제 사용자가 검색창에 입력할 법한 자연어로 작성
* 답변에 수치·기준·출처를 포함하면 AI 검색 인용 가능성 높아짐
* description 첫 문장에 핵심 키워드 포함 필수

\---



\---



\## \[공통 개발 표준 4: Gemini MCP 연동 워크플로우]



> 툴 제작 시작 전, Gemini MCP 활용 가능성을 반드시 자체 판단한다.

> 판단 없이 바로 제작하거나, 승인 없이 API를 무단 호출하는 것은 금지.



\### Gemini MCP 생성 가능 에셋

| 종류 | 활용 예시 |

|------|-----------|

| 이미지 | 타로카드, 캐릭터, 배경, 아이콘 세트, OG 이미지 |

| 영상 | 툴 인트로, 사용법 데모 클립 |

| TTS | 결과 읽어주기, 발음 가이드, 명상 음성 |



\### 활용 필요 판단 기준



\*\*아래 중 하나라도 해당 → "활용 가능성 있음" 판단:\*\*

\- 툴의 핵심 콘텐츠가 이미지 기반인가? (타로, 점성술, 캐릭터 등)

\- 텍스트·아이콘만으로는 사용자 몰입도가 현저히 떨어지는가?

\- 고유한 에셋이 세트로 반복 필요한가? (카드 22장, 별자리 12개 등)

\- 시각·청각 전달 시 툴 가치가 크게 높아지는가?



\*\*아래에 해당 → "활용 불필요" 판단 → 바로 제작:\*\*

\- 계산기·변환기·분석기 등 수치 결과 중심 툴

\- Lucide 아이콘으로 충분히 표현 가능한 수준

\- 텍스트 정보 전달이 핵심인 툴



\### 실행 절차



\*\*STEP 1 — 자체 판단\*\*

툴 지침을 받은 즉시 위 기준으로 활용 가능성을 판단한다.



\*\*STEP 2A — 활용 불필요 시\*\*

별도 안내 없이 기존 표준대로 바로 제작한다.



\*\*STEP 2B — 활용 가능 시\*\*

제작 전 반드시 아래 형식으로 사용자에게 먼저 물어본다:



```

💡 Gemini API 활용 제안



\[툴 이름] 제작 시 아래 에셋을 Gemini로 생성하면 퀄리티가 크게 올라갈 것 같아요.



생성 예정 에셋:

\- \[종류]: \[구체적 설명] (예: 타로 대아르카나 22장 일러스트)

\- \[종류]: \[구체적 설명]



예상 API 호출: 약 N회

적용 위치: \[툴 내 어디에 어떻게 사용되는지]



→ 승인하면 API 호출 후 툴에 바로 적용합니다.

→ 거절하면 아이콘·CSS로 대체해서 제작합니다.

\*\*STEP 3A — 승인 시\*\*

1\. Gemini MCP 호출해 에셋 생성

2\. `public/images/\[tool-slug]/` 또는 `public/audio/\[tool-slug]/`에 저장

3\. page.tsx에서 Next.js Image 컴포넌트 또는 HTML5 Audio로 적용

4\. 나머지 코드는 기존 표준대로 제작



\*\*STEP 3B — 거절 시\*\*

Gemini API 호출 없이 Lucide 아이콘 + CSS + framer-motion으로 최대한 퀄리티 있게 대체 제작한다.



\### 주의사항

\- 사용자 승인 없이 API 무단 호출 절대 금지

\- 에셋 생성 실패 시 자동으로 STEP 3B(대체 방법)로 전환

\- 이미지: Next.js `<Image>` 컴포넌트로 최적화 필수

\- 음성: HTML5 Audio API로 재생



## \[수행 시 주의사항]

1. **컨테이너 밖으로 나가지 마라** — 모든 요소는 `mx-auto` 중앙 영역 안에서 정렬
2. **색상 하드코딩 금지** — `var(--color-primary)` 사용
3. **공통 컴포넌트 재구현 금지** — 반드시 import
4. **번역 키 누락 금지** — 한/영 파일 필수 키 전부 채운 후 코드 작성
5. **tools-registry.ts 등록 필수** — 등록 = sitemap 자동 포함
6. **page.tsx에 'use client' 금지** — page.tsx는 서버 컴포넌트, UI는 반드시 [ToolName]Client.tsx로 분리
7. **generateMetadata 누락 금지** — page.tsx에 반드시 포함 (canonical 없으면 구글 중복 페이지 판정)
8. **JSON-LD 스키마 누락 금지** — softwareSchema + faqSchema 둘 다 포함
8. **에러/로딩 처리 누락 금지** — 모든 비동기/계산 로직에 상태 처리
9. **하단 7개 섹션 순서 고정** — 순서 변경 절대 불가
10. **SEO 분량 기준 준수** — description 300자+, useCases/steps 50자+, faqs 100자+

\---

## ✅ 신규 툴 생성 체크리스트

```

\[ ] Gemini MCP 활용 필요 여부 판단 (표준 4 기준)
\[ ] 카테고리 슬러그 결정 (10개 중 선택)
\[ ] tool-slug 결정 (영문 소문자 + 하이픈)
\[ ] tools-registry.ts 등록
\[ ] tool-relations.ts 등록 (TOOLS 배열 + TOOL_RELATIONS 매핑)
\[ ] 카테고리 리스팅 페이지에 카드 추가 (src/app/[locale]/utilities/[category-slug]/page.tsx의 tools 배열)
\[ ] page.tsx = 서버 컴포넌트 ('use client' 없음) 확인
\[ ] [ToolName]Client.tsx = 'use client' 분리 확인
\[ ] generateMetadata() 작성 (title, description, canonical, alternates, openGraph, twitter)
\[ ] JSON-LD 스키마 (softwareSchema + faqSchema) 작성
\[ ] messages/ko/\[tool-slug].json 필수 키 전부 채움
\[ ] messages/en/\[tool-slug].json 필수 키 전부 채움
\[ ] 공통 컴포넌트 import 확인
\[ ] 하단 7개 섹션 순서대로 완성
\[ ] SeoSection — KO 300자+, EN 150단어+ 확인
\[ ] SeoSection — useCases/steps 각 50자+ 확인
\[ ] SeoSection — faqs 각 100자+ / 서로 다른 관점 확인
\[ ] 모바일 반응형 (px-4\~px-6 여백, 터치 가능 버튼)
\[ ] 접근성 (aria-label, focus-visible 스타일)
\[ ] CSS 변수 사용 (하드코딩 색상 없는지)
\[ ] 페이드인 애니메이션 확인
```

\---



*theutilhub 마스터 룰북 V5.3 — 2026년 4월 기준*

*UI/UX 원본 유지 + SEO/AEO 최적화 + Gemini MCP 연동 완전 통합*

