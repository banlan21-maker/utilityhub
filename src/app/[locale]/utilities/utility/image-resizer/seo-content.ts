// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
            title: '플랫폼별 최적 이미지 사이즈 가이드',
            description: '각 소셜 미디어 플랫폼은 서로 다른 이미지 비율과 해상도를 권장합니다. 잘못된 크기로 업로드하면 자동 크롭이 발생해 중요한 피사체가 잘려나가거나 화질이 저하될 수 있습니다. 이 도구는 플랫폼별 정확한 규격(픽셀 단위)을 프리셋으로 제공하여 원클릭으로 최적 비율을 설정합니다. 비율 고정 후 크롭 박스를 조절해 구도를 잡고, JPG·PNG·WebP 중 원하는 형식으로 바로 저장하세요.',
            useCases: [
              { icon: '📷', title: 'Instagram 피드 최적화', desc: '1:1(1080×1080) 또는 4:5(1080×1350) 프리셋으로 피드 이미지를 정확히 맞춥니다.' },
              { icon: '▶️', title: 'YouTube 썸네일 & 배너', desc: '16:9(1280×720) 썸네일과 2560×423 채널 배너 규격을 프리셋으로 바로 적용합니다.' },
              { icon: '🌐', title: 'OG 이미지 & 링크 미리보기', desc: 'Facebook·카카오·트위터 링크 공유 시 표시되는 OG 이미지(1200×630)를 정확히 제작합니다.' },
              { icon: '🖼️', title: '고화질 유지 다운로드', desc: 'WebP로 저장 시 JPG 대비 30% 작은 파일 크기로 동일한 시각 품질을 유지합니다.' },
            ],
            steps: [
              { step: '이미지 업로드', desc: '드래그 앤 드롭 또는 클릭으로 이미지를 업로드합니다.' },
              { step: '프리셋 선택 또는 크기 직접 입력', desc: 'SNS 프리셋 버튼을 클릭하거나 너비/높이를 직접 입력하고 적용 버튼을 누릅니다.' },
              { step: '크롭 영역 조절 및 변형', desc: '크롭 박스를 드래그로 조절하고, 필요 시 회전·반전 도구를 활용합니다.' },
              { step: '형식 선택 후 다운로드', desc: 'JPG·PNG·WEBP 중 원하는 형식과 품질을 선택한 후 다운로드합니다.' },
            ],
            faqs: [
              { q: 'WebP와 JPG 중 어느 형식이 좋나요?', a: 'WebP는 동일 화질 기준으로 JPG보다 약 25~35% 파일 크기가 작습니다. Chrome, Safari, Firefox 등 최신 브라우저에서 모두 지원되므로 웹 사용 목적이라면 WebP를 권장합니다. SNS 업로드나 이메일 첨부는 JPG가 더 호환성이 좋습니다.' },
              { q: '비율 조절 시 화질이 저하되나요?', a: '이 도구는 원본 이미지 픽셀 데이터를 그대로 사용하며, 출력 크기를 지정하면 해당 해상도로 다시 렌더링합니다. JPG·WebP는 손실 압축이므로 품질 슬라이더를 80% 이상으로 유지하면 육안으로 구분하기 어려운 화질을 유지할 수 있습니다.' },
              { q: 'PNG 투명도가 유지되나요?', a: '네, PNG 형식으로 저장 시 알파 채널(투명도)이 그대로 유지됩니다. 단, JPG·WebP는 투명도를 지원하지 않아 흰색 배경으로 채워집니다.' },
              { q: '이미지가 서버로 업로드되나요?', a: '아니요. 모든 처리는 브라우저 내에서만 이루어지며 이미지 데이터는 외부로 전송되지 않습니다.' },
            ],
          },
  en: {
            title: 'Optimal Image Size Guide by Platform',
            description: 'Each social media platform recommends different image ratios and resolutions. Uploading the wrong size can trigger automatic cropping that cuts off important subjects, or result in blurry images. This tool provides exact platform specs as one-click presets, so you can set the correct ratio instantly. Lock the aspect ratio, drag the crop box to frame your shot, then save as JPG, PNG, or WebP.',
            useCases: [
              { icon: '📷', title: 'Instagram Feed', desc: 'Use the 1:1 (1080×1080) or 4:5 (1080×1350) preset to perfectly fit Instagram feed requirements.' },
              { icon: '▶️', title: 'YouTube Thumbnail & Banner', desc: 'Apply the 16:9 (1280×720) thumbnail preset or 2560×423 channel banner with one click.' },
              { icon: '🌐', title: 'OG Image & Link Previews', desc: 'Create the perfect 1200×630 OG image for Facebook, Twitter, and KakaoTalk link previews.' },
              { icon: '🖼️', title: 'High Quality Downloads', desc: 'Save as WebP for 30% smaller files vs JPG while maintaining the same visual quality.' },
            ],
            steps: [
              { step: 'Upload an Image', desc: 'Drag & drop or click to upload your JPG, PNG, WebP, or GIF file.' },
              { step: 'Select a Preset or Enter Custom Size', desc: 'Click an SNS preset button or enter custom width/height and press Apply.' },
              { step: 'Adjust Crop Area & Transform', desc: 'Drag the crop box to frame your shot. Use rotate and flip tools as needed.' },
              { step: 'Choose Format & Download', desc: 'Select JPG, PNG, or WEBP, set quality, then hit the download button.' },
            ],
            faqs: [
              { q: 'WebP or JPG — which format should I use?', a: 'WebP produces files 25–35% smaller than JPG at equivalent quality and is supported by all modern browsers. Use WebP for web and apps. Use JPG for social media uploads or email attachments where compatibility matters most.' },
              { q: 'Does resizing reduce image quality?', a: 'The tool uses original pixel data and re-renders at the specified output dimensions. For JPG and WebP (lossy formats), keeping quality at 80%+ results in images that are visually indistinguishable from the original at normal viewing sizes.' },
              { q: 'Is PNG transparency preserved?', a: 'Yes, saving as PNG fully preserves the alpha channel. Note that JPG and WebP do not support transparency — transparent areas will be filled with white.' },
              { q: 'Is my image uploaded to a server?', a: 'No. All processing happens entirely in your browser. No image data is transmitted over the internet.' },
            ],
          },
};
