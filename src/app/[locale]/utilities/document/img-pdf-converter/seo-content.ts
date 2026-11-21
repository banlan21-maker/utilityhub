// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '이미지 ↔ PDF 변환기란 무엇인가요?',
          description: '이미지를 PDF로, PDF를 이미지로 변환하는 무료 온라인 도구입니다. JPG, PNG, WebP 등 다양한 이미지 형식을 지원하며, 여러 장의 이미지를 하나의 PDF로 병합하거나 PDF의 각 페이지를 고화질 PNG 이미지로 추출할 수 있습니다. 모든 변환 작업은 브라우저 내에서 100% 로컬로 처리되어 파일이 서버로 전송되지 않아 개인정보 보호가 완벽하게 보장됩니다. 용지 크기(Auto/A4), 방향(세로/가로), 여백(없음/소/대) 설정이 가능하며, 드래그 앤 드롭으로 이미지 순서를 자유롭게 조정할 수 있습니다. 회원가입이나 설치 없이 즉시 무제한으로 무료 사용 가능합니다.',
          useCases: [
            {
              icon: '📄',
              title: '문서 제출용 PDF 생성',
              desc: '여러 장의 신분증, 증명서 사본을 하나의 PDF 파일로 합쳐서 이메일이나 온라인 제출 시스템에 업로드하세요. 썸네일 드래그로 순서를 자유롭게 조정할 수 있습니다.',
            },
            {
              icon: '🎨',
              title: '포트폴리오 & 프레젠테이션',
              desc: '디자인 작업물, 사진, 일러스트를 전문적인 PDF 포트폴리오로 제작하세요. 용지 크기(Auto/A4)와 여백(없음/소/대)을 설정하여 인쇄용 품질로 만들 수 있습니다.',
            },
            {
              icon: '🖼️',
              title: 'PDF 문서 이미지 추출',
              desc: 'PDF 파일에서 특정 페이지나 전체 페이지를 고화질 PNG 이미지로 추출하세요. 추출된 이미지는 ZIP 파일로 한 번에 다운로드되며 웹사이트, SNS, 프레젠테이션에 바로 활용할 수 있습니다.',
            },
            {
              icon: '🛡️',
              title: '100% 프라이버시 보장',
              desc: '모든 변환 작업이 브라우저 내에서 처리되어 파일이 서버로 전송되지 않습니다. 계약서, 의료 기록 등 민감한 문서도 안전하게 처리할 수 있습니다.',
            },
          ],
          steps: [
            {
              step: '1. 변환 모드 선택',
              desc: '상단에서 "이미지 → PDF" 또는 "PDF → 이미지" 버튼을 클릭해 원하는 변환 방향을 선택합니다. 모드 전환 시 업로드된 파일 목록이 초기화됩니다.',
            },
            {
              step: '2. 파일 업로드',
              desc: '드래그 앤 드롭 영역에 파일을 끌어다 놓거나, 영역을 클릭해 파일 탐색기에서 선택합니다. 이미지 모드는 다중 선택, PDF 모드는 단일 파일을 업로드합니다.',
            },
            {
              step: '3. 설정 조정 (이미지 → PDF)',
              desc: '용지 크기(Auto/A4), 방향(세로/가로), 여백(없음/10mm/20mm)을 선택하고, 썸네일을 드래그하여 PDF에 들어갈 이미지 순서를 원하는 대로 조정합니다.',
            },
            {
              step: '4. 변환 및 다운로드',
              desc: '"PDF로 변환" 또는 "ZIP으로 다운로드" 버튼을 클릭하면 변환이 시작되고, 완료 즉시 브라우저의 기본 다운로드 폴더에 파일이 저장됩니다.',
            },
          ],
          faqs: [
            {
              q: '파일 용량 제한이 있나요?',
              a: '서버를 사용하지 않고 브라우저 메모리 내에서 처리되므로, 기기의 메모리(RAM)에 따라 처리 가능 용량이 달라집니다. 일반적으로 수십 MB의 이미지나 PDF도 문제없이 처리할 수 있으며, 대용량 파일의 경우 최신 브라우저와 충분한 RAM을 갖춘 환경을 권장합니다.',
            },
            {
              q: '이미지 순서를 바꿀 수 있나요?',
              a: '네! "이미지 → PDF" 모드에서 업로드된 썸네일을 마우스로 드래그 앤 드롭하여 자유롭게 순서를 변경할 수 있습니다. 썸네일 좌측 상단의 숫자로 현재 PDF에 삽입될 순서를 실시간으로 확인할 수 있습니다.',
            },
            {
              q: 'PDF 품질은 어떻게 되나요?',
              a: '원본 이미지의 해상도를 최대한 유지합니다. 용지 크기를 "Auto"로 설정하면 이미지 원본 크기 그대로 PDF에 삽입되며, "A4"로 설정하면 A4 용지(210×297mm)에 맞게 조정됩니다. PDF→이미지 추출 시에는 2배 배율(scale 2.0)의 고화질 PNG로 저장됩니다.',
            },
            {
              q: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
              a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.',
            },
          ],
        },
  en: {
          title: 'What is the Image ↔ PDF Converter?',
          description: 'A free online tool that converts images to PDF and PDF pages to images. Supports JPG, PNG, WebP, and other common image formats. Merge multiple images into a single PDF or extract each page of a PDF as a high-quality PNG image. All processing is handled 100% locally in your browser using client-side JavaScript — no files are ever sent to a server, ensuring complete privacy. You can configure paper size (Auto or A4), orientation (portrait or landscape), and margins (none, small, or large) before generating your PDF. Images can be reordered by dragging thumbnails. No account or installation required — completely free and unlimited.',
          useCases: [
            {
              icon: '📄',
              title: 'Document Submission',
              desc: 'Combine multiple ID scans and certificate copies into a single PDF for email or online submission portals. Reorder pages freely by dragging thumbnails before converting.',
            },
            {
              icon: '🎨',
              title: 'Portfolio & Presentation',
              desc: 'Create professional PDF portfolios from design work, photos, and illustrations. Configure paper size and margins to produce print-ready output at the exact dimensions you need.',
            },
            {
              icon: '🖼️',
              title: 'Extract Images from PDF',
              desc: 'Extract all pages from a PDF as high-quality PNG images. Download them as a ZIP archive in one click — ready for use on websites, social media, or presentation slides.',
            },
            {
              icon: '🛡️',
              title: '100% Privacy Guaranteed',
              desc: 'All conversion work happens inside your browser. Files never reach a server. Contracts, medical records, and other sensitive documents can be processed with complete confidence.',
            },
          ],
          steps: [
            {
              step: '1. Select Conversion Mode',
              desc: 'Click "Images → PDF" or "PDF → Images" at the top to choose your conversion direction. Switching modes resets the current file list, so make sure to download before switching.',
            },
            {
              step: '2. Upload Files',
              desc: 'Drag and drop files into the upload zone or click to open the file picker. Image mode accepts multiple files at once; PDF mode accepts a single PDF file.',
            },
            {
              step: '3. Adjust Settings (Images → PDF)',
              desc: 'Select paper size (Auto or A4), orientation (Portrait or Landscape), and margin (None, 10 mm, or 20 mm). Then drag thumbnails to set the order images will appear in the PDF.',
            },
            {
              step: '4. Convert & Download',
              desc: 'Click "Convert to PDF" or "Download as ZIP". Conversion starts immediately and the file is saved to your browser\'s default downloads folder as soon as processing is complete.',
            },
          ],
          faqs: [
            {
              q: 'Is there a file size limit?',
              a: 'Since all processing happens in your browser memory, the practical limit depends on your device\'s RAM. Files up to several dozen MB typically work without issue. For very large files, a modern browser and at least 8 GB of RAM is recommended.',
            },
            {
              q: 'Can I reorder images before creating the PDF?',
              a: 'Yes! In "Images → PDF" mode, simply drag and drop the uploaded thumbnails into your preferred order. A number in the top-left corner of each thumbnail shows its current position in the final PDF.',
            },
            {
              q: 'What is the quality of the output PDF or images?',
              a: 'The converter preserves the original image resolution. With "Auto" paper size, images are embedded at their native dimensions. With "A4", images are scaled to fit A4 (210×297 mm). PDF-to-image extraction uses a 2× render scale for high-quality PNG output.',
            },
            {
              q: 'Can I use this result as official data?',
              a: 'Results are for reference only. Please consult a professional or official source for accurate figures.',
            },
          ],
        },
};
