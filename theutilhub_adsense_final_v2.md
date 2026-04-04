# theutilhub AdSense 통과 마스터 프롬프트 (최종 간결판)
## Claude Code 전용 — 룰북 V5.0 기반 / 2026년 구글 정책 기준

---

## 현재 상태 및 할 일 목록

| 항목 | 상태 | 비고 |
|---|---|---|
| Privacy Policy | ✅ 완료 | — |
| Terms of Service | ✅ 완료 | — |
| Sitemap | ✅ 완료 | — |
| **About Us** | ✅ 완료 | `/ko/about`, `/en/about` 생성 완료 |
| **Contact Us** | ✅ 완료 | `/ko/contact`, `/en/contact` 생성 완료, Formspree 연동 완료 (xvzvwley) |
| 이메일 연동 | ✅ 완료 | `banlan21@gmail.com` Footer + ContactForm 적용 완료 |
| 푸터 링크 | ✅ 완료 | 소개 / 문의하기 / 개인정보처리방침 / 이용약관 / 사이트맵 |
| Search Console 색인 요청 | ✅ 완료 | 4개 URL 색인 생성 요청 완료 |
| 툴 SEO 텍스트 | △ 보강 예정 | 애드센스 승인 후 단계적 보강 |
| JSON-LD 스키마 | △ 보강 예정 | 애드센스 승인 후 단계적 추가 |

**현재 상태:** About + Contact 완성 → 2~3주 운영 후 애드센스 재신청 대기 중

---

## 완료된 작업 상세

### About Us (`src/app/[locale]/about/page.tsx`)
- 탄생 배경 (1인칭 서술), 운영 원칙 3카드, 미래 계획
- 한국어 800자+, 영어 500단어+ 본문
- generateMetadata + canonical + OG/Twitter 태그
- 페이드인 애니메이션, 모바일 반응형, CSS 변수 사용

### Contact Us (`src/app/[locale]/contact/page.tsx`)
- 4-field 문의 폼 (이름 / 이메일 / 문의유형 / 메시지)
- Formspree 엔드포인트: `https://formspree.io/f/xvzvwley`
- 이메일: `banlan21@gmail.com`
- 제출 성공 시 Success 카드 전환

### Footer (`src/app/components/Footer.tsx`)
- LEGAL 섹션: 소개 / 문의하기 / 개인정보처리방침 / 이용약관 / 사이트맵 순으로 정렬

---

## STEP 3. 신청 전 최종 체크리스트

```
About Us / Contact Us 생성 후 2~3주 후에 아래 확인 후 신청

✅ Search Console → /ko/about, /en/about, /ko/contact, /en/contact 색인 생성 요청 완료
□ 색인 실제 반영 확인 (요청 후 1~3일 소요)
□ 푸터에 About / Contact 링크 노출 육안 확인
□ Google PageSpeed Insights 모바일 점수 70+ 확인
□ 사이트에 다른 광고 코드 없는지 확인 (심사 중 광고 코드 금지)
□ Formspree 테스트 메일 실제 수신 확인 (banlan21@gmail.com)
□ 2~3주 운영 후 애드센스 재신청
```

---

## SEO 섹션 작성 규칙 (모든 툴 페이지 공통)

> **참고 기준 페이지:** `/ko/utilities/finance/exchange-rate` — 이 페이지가 SEO 섹션의 기준 모델
> 모든 툴 페이지 하단의 `<SeoSection>` 컴포넌트에 KO/EN 동시 작성.

---

### 구조 개요

툴 페이지 하단에 항상 아래 4개 섹션을 순서대로 작성한다.

```
1. [툴 이름]이란 무엇인가요?   ← description (긴 설명글)
2. 주요 활용 사례              ← useCases 4개
3. 사용 방법                  ← steps 4단계
4. 자주 묻는 질문 (FAQ)        ← faqs 4개
```

---

### 1. 툴 설명 (description)

| 항목 | 기준 |
|---|---|
| 한국어 분량 | **300자 이상** (많을수록 좋음, 500자 권장) |
| 영어 분량 | **150단어 이상** (많을수록 좋음, 200단어 권장) |
| 포함할 내용 | ① 툴이 무엇인지 ② 어떤 기술/데이터를 사용하는지 ③ 어떤 문제를 해결하는지 ④ 대표 활용 상황 나열 |
| 금지 | 단순 기능 나열만 하는 짧은 설명 (100자 미만) |

**좋은 예 (환율 계산기 KO 기준):**
> "환율 계산기는 전 세계 주요 통화 간의 환전 비율을 실시간으로 계산하여... ECB 공식 환율 데이터 기반의 Frankfurter API를 통해 매 영업일 업데이트되는 정확한 환율을 제공합니다. 단순한 환전 계산을 넘어 최근 30일간의 환율 추이를 시각적인 차트로 보여주어..."

---

### 2. 주요 활용 사례 (useCases)

| 항목 | 기준 |
|---|---|
| 개수 | **정확히 4개** |
| icon | 이모지 1개 (상황을 직관적으로 표현) |
| title | KO 10자 이내 / EN 3단어 이내 |
| desc | KO **50자 이상** / EN **20단어 이상** — 구체적인 상황 묘사, 막연한 설명 금지 |

**좋은 예:**
```
icon: '✈️'
title KO: '해외여행 경비 계획'
desc KO: '호텔, 식사, 관광 비용 등 현지 통화 가격을 원화로 환산하여 여행 예산을 정확하게 수립하고 환전 금액을 결정할 수 있습니다.'
```

---

### 3. 사용 방법 (steps)

| 항목 | 기준 |
|---|---|
| 개수 | **정확히 4단계** |
| step | 단계 이름 — KO 10자 이내 / EN 3단어 이내 |
| desc | KO **50자 이상** / EN **20단어 이상** — 버튼 위치, 실제 동작 등 구체적으로 |

**좋은 예:**
```
step: '출발/도착 통화 선택'
desc: '상단의 통화 선택 드롭다운에서 출발 통화(예: KRW 원화)와 도착 통화(예: USD 달러)를 클릭하여 선택합니다. 양방향 화살표 버튼으로 통화를 빠르게 바꿀 수 있습니다.'
```

---

### 4. 자주 묻는 질문 (faqs)

| 항목 | 기준 |
|---|---|
| 개수 | **정확히 4개** |
| q | 실제 사용자가 궁금해할 질문 — KO 30자 이내 / EN 10단어 이내 |
| a | KO **100자 이상** / EN **40단어 이상** — 구체적인 근거/수치 포함 |
| 주제 선택 | 각 FAQ는 서로 다른 관점 (데이터 출처 / 정확도 / 사용 팁 / 기능 한계 등) |

**좋은 예:**
```
q: '환율 데이터는 어디서 가져오나요?'
a: '본 계산기는 유럽중앙은행(ECB) 공식 환율을 기반으로 한 Frankfurter API를 사용합니다. 매 영업일 업데이트되며, 주말과 공휴일에는 마지막 영업일의 환율이 표시됩니다.'
```

---

### SeoSection 컴포넌트 사용법

```tsx
// 툴 page.tsx 하단에 반드시 포함
import SeoSection from '@/app/components/SeoSection';

<SeoSection
  ko={{
    title: '[툴 이름]이란 무엇인가요?',
    description: '...300자 이상...',
    useCases: [
      { icon: '🎯', title: '활용사례1', desc: '50자 이상 설명' },
      { icon: '📊', title: '활용사례2', desc: '50자 이상 설명' },
      { icon: '💡', title: '활용사례3', desc: '50자 이상 설명' },
      { icon: '🔧', title: '활용사례4', desc: '50자 이상 설명' },
    ],
    steps: [
      { step: '1단계명', desc: '50자 이상 구체적 설명' },
      { step: '2단계명', desc: '50자 이상 구체적 설명' },
      { step: '3단계명', desc: '50자 이상 구체적 설명' },
      { step: '4단계명', desc: '50자 이상 구체적 설명' },
    ],
    faqs: [
      { q: '질문1?', a: '100자 이상 답변' },
      { q: '질문2?', a: '100자 이상 답변' },
      { q: '질문3?', a: '100자 이상 답변' },
      { q: '질문4?', a: '100자 이상 답변' },
    ],
  }}
  en={{
    // 동일 구조, 영어로 작성
  }}
/>
```

---

### SEO 섹션 작성 체크리스트

```
□ description: KO 300자+, EN 150단어+ / 기술·문제해결·활용상황 포함
□ useCases: 정확히 4개 / 각 desc KO 50자+, EN 20단어+
□ steps: 정확히 4단계 / 각 desc KO 50자+, EN 20단어+
□ faqs: 정확히 4개 / 각 답변 KO 100자+, EN 40단어+ / 서로 다른 관점
□ KO/EN 양쪽 모두 누락 없이 작성
□ SeoSection 컴포넌트가 툴 page.tsx 하단에 포함되어 있는지 확인
```

---

## STEP 4. 통과 후 — 툴 SEO 보강 (나중에 할 것)

> 애드센스 승인 이후 수익 최적화 단계. 지금 당장 안 해도 됨.

기존 툴 중 SEO 섹션이 미흡한 페이지를 위 기준에 맞게 보강. 신규 툴은 처음부터 위 기준 준수.

JSON-LD 스키마 추가 기준:

```tsx
// 각 툴 page.tsx에 추가 (generateMetadata 아래)
const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "[툴 이름]",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/[category]/[tool]"
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "[질문]",
      "acceptedAnswer": { "@type": "Answer", "text": "[답변]" } }
    // faqs 4개 동기화
  ]
};
```

---

## 툴 카드 디자인 규칙 (카테고리 목록 페이지)

> 새 툴을 카테고리 목록(`/utilities/[category]/page.tsx`)에 추가할 때 반드시 준수.

### 카드 크기 및 레이아웃

| 항목 | 고정값 |
|---|---|
| 카드 최소 높이 | `min-height: 300px` |
| 카드 패딩 | `padding: 2.5rem` |
| 카드 모서리 | `border-radius: 2rem` |
| 카드 테두리 | `1px solid #f1f5f9` |
| 카드 그림자 | `box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05)` |
| 그리드 열 | `repeat(auto-fill, minmax(320px, 1fr))` |
| 그리드 간격 | `gap: 2rem` |

### 카드 호버 효과 (고정)

```css
transform: translateY(-10px);
box-shadow: 0 30px 60px -12px rgba(139, 92, 246, 0.15);
border-color: #8b5cf6;
```

### 아이콘

| 항목 | 고정값 |
|---|---|
| 래퍼 크기 | `72px × 72px` |
| 래퍼 모서리 | `border-radius: 1.5rem` |
| 래퍼 배경 | `rgba(R, G, B, 0.08)` — 아이콘 색상과 동일 계열 |
| 래퍼 하단 여백 | `margin-bottom: 2rem` |
| 아이콘 컴포넌트 | lucide-react, `size={36}` |

### 제목 규칙

- **최대 2줄** — 초과 시 `...` 말줄임 (`-webkit-line-clamp: 2`)
- `font-size: 1.5rem`, `font-weight: 850`
- 텍스트 작성 시 한국어 기준 **15자 이내**, 영어 기준 **4단어 이내** 권장

### 설명 규칙

- **최대 4줄** — 초과 시 `...` 말줄임 (`-webkit-line-clamp: 4`)
- `font-size: 1rem`, `line-height: 1.6`
- 텍스트 작성 시 한국어 기준 **60자 이내**, 영어 기준 **25단어 이내** 권장

### CTA 버튼 ("사용하러 가기")

| 항목 | 고정값 |
|---|---|
| 텍스트 (KO) | `사용하러 가기` (finance 카테고리만 `계산하러 가기`) |
| 텍스트 (EN) | `Use Now` (finance 카테고리만 `Calculate Now`) |
| 색상 | `#8b5cf6` (violet) |
| 굵기 | `font-weight: 800` |
| 아이콘 | `<ArrowRight size={18} />` |
| 기본 상태 | 숨김 (`opacity: 0`, `transform: translateX(-10px)`) |
| 호버 시 | 표시 (`opacity: 1`, `transform: translateX(0)`) |
| 위치 | 카드 하단 고정 (`margin-top: auto`) |

### 새 카드 추가 체크리스트

```
□ 아이콘: lucide-react size=36, 색상 지정, gradient는 동일 색상 rgba 0.08
□ 제목: KO 15자 이내 / EN 4단어 이내 (2줄 초과 금지)
□ 설명: KO 60자 이내 / EN 25단어 이내 (4줄 초과 금지)
□ CTA: 카테고리에 맞는 텍스트 사용 (위 규칙 참고)
□ CSS: 해당 카테고리의 *_list.module.css 클래스 사용 (새 클래스 임의 생성 금지)
```

---

*theutilhub 룰북 V5.0 기반 / 2026년 4월 기준 — 마지막 업데이트: 2026-04-04*
