// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const seoKo: SeoContent = {
    title: 'Photo Batch Master — 일괄 사진 보정 & 워터마크 삽입',
    description: '여러 장의 사진을 동일한 밝기·대비·색감으로 보정하고 텍스트 또는 이미지 워터마크를 일괄 삽입하는 전문가용 도구입니다.',
    useCases: [
      { icon: '🛍️', title: '쇼핑몰 상품 사진', desc: '모든 제품 사진의 톤을 맞추고 브랜드 워터마크를 자동 삽입합니다.' },
      { icon: '✈️', title: '여행 사진 정리', desc: '수백 장의 여행 사진에 나만의 감성 필터와 워터마크를 한 번에 입힙니다.' },
      { icon: '©️', title: '저작권 보호', desc: '사진에 텍스트나 로고 워터마크를 삽입해 무단 사용을 방지합니다.' },
      { icon: '🎨', title: '프리셋 재사용', desc: '저장한 보정값을 언제든지 불러와 동일한 스타일로 처리합니다.' },
    ],
    steps: [
      { step: '프리셋 설정', desc: '샘플 사진으로 8가지 보정값을 조절하고 프리셋을 저장합니다.' },
      { step: '워터마크 설정', desc: '텍스트 또는 이미지 워터마크를 설정하고 원하는 위치에 배치합니다.' },
      { step: '사진 일괄 업로드', desc: '보정할 사진들을 드래그 앤 드롭으로 한꺼번에 업로드합니다.' },
      { step: 'ZIP 다운로드', desc: 'Apply All 후 ZIP 버튼으로 완성된 사진들을 한 번에 내려받습니다.' },
    ],
    faqs: [
      { q: '워터마크는 어떤 위치에 넣을 수 있나요?', a: '9개 구역(좌상단·중상단·우상단·좌중단·정중앙·우중단·좌하단·중하단·우하단) 중 원하는 위치를 클릭하여 선택할 수 있습니다.' },
      { q: '이미지 워터마크로 어떤 파일을 쓸 수 있나요?', a: 'PNG, JPG, WebP 등 브라우저가 지원하는 모든 이미지를 사용할 수 있습니다. 투명 배경의 PNG 로고를 권장합니다.' },
      { q: '사진 개수 제한이 있나요?', a: '브라우저 성능에 따라 다르지만 보통 20~30장 정도는 무리 없이 처리 가능합니다.' },
      { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
    ],
  };

export const seoEn: SeoContent = {
    title: 'Photo Batch Master — Batch Photo Editor & Watermark Tool',
    description: 'A professional batch photo editor that applies color grading and inserts text or image watermarks to multiple photos at once.',
    useCases: [
      { icon: '🛍️', title: 'Product Photography', desc: 'Match tones and auto-stamp your brand watermark on every product photo.' },
      { icon: '✈️', title: 'Travel Photo Editing', desc: 'Apply your filter and watermark to hundreds of travel photos in seconds.' },
      { icon: '©️', title: 'Copyright Protection', desc: 'Embed text or logo watermarks to protect your photos from unauthorized use.' },
      { icon: '🎨', title: 'Preset Reuse', desc: 'Save and reload your favorite settings with one click.' },
    ],
    steps: [
      { step: 'Set preset', desc: 'Upload a sample photo, adjust 8 sliders, and save the preset.' },
      { step: 'Configure watermark', desc: 'Set up a text or image watermark and choose its position on the photo.' },
      { step: 'Bulk upload', desc: 'Drag and drop all photos you want to edit.' },
      { step: 'Download as ZIP', desc: 'Click Apply All, then Download ZIP to get all results at once.' },
    ],
    faqs: [
      { q: 'How many positions can I place the watermark?', a: 'You can choose from 9 positions: top-left, top-center, top-right, middle-left, center, middle-right, bottom-left, bottom-center, bottom-right.' },
      { q: 'What image formats work as watermarks?', a: 'Any browser-supported image format. PNG with transparent background is recommended for logo watermarks.' },
      { q: 'Is there a photo limit?', a: 'Typically 20–30 photos can be processed at once depending on browser performance.' },
      { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
    ],
  };
