// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
            title: '이미지 압축이 웹 성능과 SEO에 중요한 이유',
            description: '이미지는 일반적으로 웹페이지 전체 용량의 50~70%를 차지합니다. 이미지를 최적화하면 페이지 로딩 속도가 빨라지고, Google의 Core Web Vitals 지표 중 LCP(Largest Contentful Paint) 점수가 향상됩니다. LCP는 검색 순위에 직접 영향을 주는 핵심 SEO 지표로, 구글은 2.5초 이내의 LCP를 "Good"으로 평가합니다. 이 압축기는 클라이언트 사이드에서만 동작해 이미지가 서버로 전송되지 않으므로 민감한 이미지도 안심하고 압축할 수 있습니다.',
            useCases: [
              { icon: '🚀', title: 'Core Web Vitals 개선', desc: '이미지 최적화로 LCP·CLS 점수를 향상시켜 Google 검색 순위를 개선합니다.' },
              { icon: '📱', title: '모바일 데이터 절약', desc: '압축된 이미지는 모바일 사용자의 데이터 사용량과 로딩 시간을 줄입니다.' },
              { icon: '🖼️', title: 'SNS 업로드 최적화', desc: '인스타그램, 카카오톡 등 SNS에 업로드할 이미지를 적정 용량으로 줄입니다.' },
              { icon: '💼', title: '이메일 첨부 파일 축소', desc: '용량 제한이 있는 이메일에 첨부하기 위해 이미지 크기를 줄입니다.' },
            ],
            steps: [
              { step: '이미지 업로드', desc: '드래그 앤 드롭 또는 클릭으로 JPG, PNG, WebP, GIF 이미지를 선택합니다. 최대 50MB까지 지원하며, 이미지는 브라우저 내에서만 처리됩니다.' },
              { step: '품질 및 해상도 설정', desc: '품질 슬라이더(10~100%)와 최대 너비(800px~2560px)를 조절하며 용량과 화질의 균형을 맞춥니다. 설정 변경 시 실시간으로 재압축됩니다.' },
              { step: '결과 미리보기 확인', desc: '원본/압축 탭을 전환하며 화질 차이를 직접 비교합니다. 상단 통계 패널에서 원본 크기, 압축 후 크기, 절감률을 한눈에 확인할 수 있습니다.' },
              { step: '압축 이미지 다운로드', desc: '절감률이 만족스러우면 다운로드 버튼으로 압축 이미지를 저장합니다. 파일명 앞에 "compressed_"가 자동으로 붙어 원본과 구분됩니다.' },
            ],
            faqs: [
              { q: '이미지가 서버로 전송되나요?', a: '아니요. 이 도구는 완전히 브라우저에서 동작하며, 이미지 데이터는 인터넷을 통해 전송되지 않습니다. 개인 사진, 회사 자료 등 민감한 이미지도 안전하게 사용할 수 있습니다.' },
              { q: '품질 슬라이더를 어떻게 설정하면 좋나요?', a: '일반 웹사이트 이미지는 70~80%, 블로그 섬네일은 60~70%, 배경 이미지는 50~60%를 권장합니다. 미리보기로 화질을 확인하며 조절하세요.' },
              { q: 'PNG를 압축하면 투명도가 유지되나요?', a: '네. PNG 파일은 PNG 형식을 유지하므로 투명 배경(알파 채널)이 그대로 보존됩니다.' },
              { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
            ],
          },
  en: {
            title: 'Why Image Compression Matters for SEO and Web Performance',
            description: 'Images typically account for 50–70% of total webpage size. Optimizing images speeds up page loading and improves your LCP (Largest Contentful Paint) score — a Core Web Vitals metric that directly affects Google search rankings. Google rates an LCP under 2.5 seconds as "Good." This compressor runs entirely in your browser, so images are never transmitted to a server, making it safe for sensitive photos and business assets.',
            useCases: [
              { icon: '🚀', title: 'Improve Core Web Vitals', desc: 'Optimizing images boosts LCP and CLS scores, improving Google search rankings.' },
              { icon: '📱', title: 'Save Mobile Data', desc: 'Compressed images reduce data usage and loading times for mobile visitors.' },
              { icon: '🖼️', title: 'Social Media Uploads', desc: 'Reduce image size for optimal uploads to Instagram, Twitter, and other platforms.' },
              { icon: '💼', title: 'Email Attachments', desc: 'Shrink images to fit email attachment size limits without sacrificing too much quality.' },
            ],
            steps: [
              { step: 'Upload an Image', desc: 'Drag & drop or click to select a JPG, PNG, WebP, or GIF file. Files up to 50MB are supported, and your image is processed entirely in the browser.' },
              { step: 'Adjust Quality & Resolution', desc: 'Use the quality slider (10–100%) and max-width presets (800px–2560px) to balance file size and quality. The image recompresses automatically as you adjust settings.' },
              { step: 'Compare Original vs Compressed', desc: 'Switch between Original and Compressed preview tabs to compare image quality side by side. The stats panel shows original size, compressed size, and savings percentage.' },
              { step: 'Download the Compressed Image', desc: 'Once satisfied with the results, click the download button. The file is saved with a "compressed_" prefix so it is easy to distinguish from the original.' },
            ],
            faqs: [
              { q: 'Is my image uploaded to a server?', a: 'No. This tool runs entirely in your browser using JavaScript. Your image data never leaves your device, making it safe for sensitive photos and business documents.' },
              { q: 'What quality setting should I use?', a: 'For general web images, 70–80% is a good starting point. For blog thumbnails, try 60–70%. For background images, 50–60% often works well. Use the preview to find the right balance.' },
              { q: 'Will PNG transparency be preserved?', a: 'Yes. PNG files are kept as PNG, so transparency (alpha channel) is fully preserved after compression.' },
              { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
            ],
          },
};
