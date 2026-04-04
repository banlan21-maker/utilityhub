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

## STEP 4. 통과 후 — 툴 SEO 보강 (나중에 할 것)

> 애드센스 승인 이후 수익 최적화 단계. 지금 당장 안 해도 됨.

각 툴 페이지 번역 파일(`messages/ko.json`, `messages/en.json`) 보강 기준:

| 항목 | 현재 | 목표 |
|---|---|---|
| about | 짧음 | 300자 이상 + 기술 원리 + 차별점 |
| use_cases desc | 짧음 | 각 50자 이상 |
| how_to | 3단계 | 4단계 이상, 각 50자 이상 |
| faq | 3개 | 5개 이상, 각 답변 100자 이상 |

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
    // 번역 파일 FAQ 5개 동기화
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
