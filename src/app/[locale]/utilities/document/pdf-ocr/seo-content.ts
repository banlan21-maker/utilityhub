// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: 'PDF 검색 변환기란 무엇인가요?',
          description:
            'PDF 검색 변환기는 스캔된 계약서, 공문서, 팩스 문서처럼 텍스트 검색이 불가한 이미지형 PDF를 Ctrl+F로 검색 가능한 PDF로 변환해주는 도구입니다. Mozilla의 pdf.js로 각 페이지를 이미지로 변환한 뒤, Google이 개발한 Tesseract OCR 엔진으로 텍스트와 위치 좌표를 추출하고, jsPDF로 원본 이미지 위에 투명한 텍스트 레이어를 얹어 검색 가능한 PDF를 생성합니다. 한국어와 영어를 포함한 다국어를 지원하며, 모든 처리가 브라우저 안에서만 이루어져 파일이 서버로 전송되지 않아 기밀 문서도 안심하고 변환할 수 있습니다. 스캔 텍스트가 깨끗한 계약서·공문서에서 높은 인식률을 보이며, PC 환경에서의 사용을 권장합니다.',
          useCases: [
            {
              icon: '📄',
              title: '스캔 계약서·공문서 검색',
              desc: '팩스나 스캐너로 받은 계약서, 공문서를 검색 가능한 형태로 변환하세요. 특정 조항이나 날짜, 금액을 키워드로 즉시 찾을 수 있어 문서 관리 효율이 크게 향상됩니다.',
            },
            {
              icon: '🧾',
              title: '세금계산서·영수증 디지털화',
              desc: '스캔된 세금계산서나 영수증을 검색 가능한 PDF로 변환하면 거래처명, 금액, 날짜를 키워드로 빠르게 찾을 수 있어 세무·회계 업무 처리 속도가 빨라집니다.',
            },
            {
              icon: '📚',
              title: '오래된 문서 아카이브',
              desc: '종이 문서를 스캔해 보관 중인 오래된 자료를 검색 가능한 디지털 아카이브로 전환하세요. 원본 이미지 품질은 그대로 유지하면서 텍스트 검색 기능만 추가됩니다.',
            },
            {
              icon: '📋',
              title: '자재표·부재 목록 검색',
              desc: '텍스트와 선이 분리된 표 형태의 자재표, 부재 목록 PDF에서 특정 자재명이나 규격을 키워드로 빠르게 검색할 수 있습니다.',
            },
          ],
          steps: [
            {
              step: 'PDF 업로드',
              desc: '변환할 PDF 파일을 업로드합니다. 파일을 드래그해서 놓거나 업로드 영역을 클릭해 선택하세요. 최대 100MB, PDF 형식만 지원하며, 모바일에서는 최대 10페이지로 제한됩니다.',
            },
            {
              step: '옵션 설정',
              desc: 'OCR 언어와 렌더링 품질을 설정합니다. 한국어가 포함된 문서는 "한국어 + 영어"를 선택하고, 품질은 "고품질(2.0×)"을 권장합니다. 변환 후 예상 파일 크기가 표시되니 확인하세요.',
            },
            {
              step: '변환 시작',
              desc: '[검색 가능한 PDF로 변환하기] 버튼을 클릭합니다. 페이지 수에 따라 수 분이 소요될 수 있으므로 처리 중 브라우저 탭을 닫지 마세요. 진행 상황이 실시간으로 표시됩니다.',
            },
            {
              step: '다운로드 확인',
              desc: '변환이 완료되면 검색 가능한 PDF가 자동으로 다운로드됩니다. Adobe Reader나 브라우저에서 Ctrl+F를 눌러 원하는 키워드를 검색하세요. 파일 크기는 원본보다 커질 수 있습니다.',
            },
          ],
          faqs: [
            {
              q: '변환 후 파일 크기가 왜 크게 늘어나나요?',
              a: '원본 PDF가 벡터(선) 기반으로 가볍게 만들어진 경우에도, 변환 과정에서 모든 페이지가 JPEG 이미지로 변환되어 PDF에 삽입됩니다. 이 때문에 원본이 2MB였던 PDF가 변환 후 10~30MB로 커질 수 있습니다. 파일 크기를 줄이려면 렌더링 품질을 "표준(1.5×)"으로 낮춰보세요. 업로드 후 예상 변환 크기를 미리 확인할 수 있습니다.',
            },
            {
              q: '모바일에서는 왜 10페이지로 제한되나요?',
              a: '모바일 브라우저는 탭당 사용 가능한 메모리에 엄격한 한도가 있습니다. 특히 아이폰 사파리에서 고해상도로 많은 페이지를 처리하면 메모리 초과로 브라우저 탭이 강제 종료될 수 있어 10페이지로 제한합니다. 제한 없이 사용하려면 PC에서 접속해 주세요.',
            },
            {
              q: 'CAD 도면은 잘 변환되지 않나요?',
              a: '선과 글자가 겹치는 복잡한 CAD 도면은 Tesseract OCR 엔진이 선을 노이즈로 인식해 글자를 누락할 수 있습니다. 치수선이 밀집된 설계 도면보다는 텍스트와 선이 분리된 자재표, 부재 목록, 스캔된 계약서·공문서에서 높은 인식률을 보입니다.',
            },
            {
              q: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
              a: '이 툴의 OCR 변환 결과는 참고용으로만 제공됩니다. OCR 인식 과정에서 오탈자나 누락이 발생할 수 있으므로, 공식적인 용도로 사용 시에는 반드시 원본 문서와 대조하여 확인하시기 바랍니다.',
            },
          ],
        },
  en: {
          title: 'What is PDF OCR Converter?',
          description:
            'PDF OCR Converter transforms image-only PDFs — scanned contracts, official documents, and faxed files — into fully searchable PDFs where you can use Ctrl+F to find any text instantly. It works by using pdf.js (Mozilla) to render each PDF page as a canvas image, Tesseract.js (Google OCR engine) to extract text and coordinates with confidence scoring, and jsPDF to overlay an invisible searchable text layer on top of the original image. The original image quality is completely preserved. Multi-language support includes Korean, English, Japanese, and Chinese. All processing happens entirely in your browser — files are never uploaded to any server, making it safe for confidential contracts and personal documents. OCR accuracy reaches 95–99% for clean printed text. Mobile devices are limited to 10 pages due to memory constraints; PC use is strongly recommended for large documents.',
          useCases: [
            {
              icon: '📄',
              title: 'Searchable contracts & official docs',
              desc: 'Convert faxed or scanned contracts and official documents into searchable PDFs. Find specific clauses, dates, or amounts instantly with Ctrl+F, dramatically improving document management efficiency.',
            },
            {
              icon: '🧾',
              title: 'Invoice & receipt digitization',
              desc: 'Turn scanned invoices and receipts into searchable PDFs. Quickly locate vendor names, amounts, and dates by keyword — speeding up accounting and tax document workflows.',
            },
            {
              icon: '📚',
              title: 'Document archive modernization',
              desc: 'Convert old scanned paper documents stored as image-only PDFs into searchable digital archives. The original image quality is fully preserved while adding full-text search capability.',
            },
            {
              icon: '📋',
              title: 'Parts lists & material tables',
              desc: 'Search parts lists, material schedules, and bill-of-materials PDFs where text and lines are cleanly separated. Find specific part names or specifications in seconds.',
            },
          ],
          steps: [
            {
              step: 'Upload PDF',
              desc: 'Upload the PDF you want to convert. Drag and drop it onto the upload area, or click to open the file picker. Maximum 100MB, PDF format only. Mobile browsers are limited to 10 pages.',
            },
            {
              step: 'Set options',
              desc: 'Choose your OCR language and rendering quality. For documents containing Korean, select "Korean + English." The recommended quality setting is "High Quality (2.0×)." The estimated output file size is shown after upload.',
            },
            {
              step: 'Start conversion',
              desc: 'Click the "Convert to Searchable PDF" button. Conversion may take several minutes depending on the page count. Do not close the browser tab during processing — real-time progress is displayed.',
            },
            {
              step: 'Download and verify',
              desc: 'The searchable PDF downloads automatically when done. Open it in Adobe Reader or any PDF viewer and press Ctrl+F to search. Note that the converted file will be larger than the original.',
            },
          ],
          faqs: [
            {
              q: 'Why is the converted file so much larger than the original?',
              a: 'Even if the original PDF used compact vector graphics, every page is converted to a JPEG image during processing and embedded in the output PDF. A 2MB original can become 10–30MB after conversion. To reduce the size, lower the quality setting to "Standard (1.5×)." The estimated output size is shown after you upload the file.',
            },
            {
              q: 'Why is mobile limited to 10 pages?',
              a: 'Mobile browsers enforce strict per-tab memory limits. On iPhone Safari in particular, processing high-resolution multi-page PDFs can cause the browser tab to crash due to memory overflow. The 10-page limit prevents this. For unlimited processing, please use a desktop PC.',
            },
            {
              q: 'Does it work well on CAD drawings?',
              a: 'Complex CAD drawings where lines overlap with text are challenging for the Tesseract OCR engine, which may misidentify lines as noise and miss characters. Best results come from text-heavy documents like contracts, invoices, and material tables where text and graphic lines are cleanly separated.',
            },
            {
              q: 'Can I use the results as official documents?',
              a: 'Results are for reference only. OCR recognition may introduce typos or omissions. For any official or legally binding use, always verify the converted content against the original source document.',
            },
          ],
        },
};
