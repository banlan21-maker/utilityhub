// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: 'HWP·HWPX를 PDF·Word로 바꾸는 변환기란?',
          description: '한글 프로그램(한컴오피스)으로 만든 .hwp, .hwpx 파일의 글자와 표를 PDF나 Word(.docx)로 바꾸는 무료 도구입니다. 맥, 아이폰, 안드로이드, 회사 PC처럼 한글 프로그램이 없는 곳에서 받은 공문서·안내문·서식의 내용을 확인하거나, 편집하기 쉬운 Word로 옮길 때 씁니다. HWP는 압축된 본문을 직접 풀어 문서 끝까지 읽고, HWPX는 문서 안의 XML에서 문단을 읽으며, 표는 칸을 나눠 PDF와 Word에 표로 옮깁니다. PDF는 쪽 경계에서 문단이 잘리지 않도록 나눠 만듭니다. 파일은 서버로 올라가지 않고 이 브라우저 안에서만 처리되므로 이력서·계약서처럼 개인정보가 담긴 문서도 밖으로 나가지 않습니다. 다만 글꼴, 글자 크기, 줄 간격, 이미지, 도형, 쪽 배치 같은 서식은 옮겨지지 않으므로, 원본 모양 그대로 제출해야 하는 서류는 한글 프로그램이나 한컴독스에서 PDF로 저장하는 것이 좋습니다.',
          useCases: [
            { icon: '🍎', title: '맥·스마트폰에서 HWP 내용 확인', desc: '이메일로 받은 HWP 안내문이나 공문서를 한글 프로그램 없이 열어야 할 때 PDF로 바꿔 내용을 바로 읽습니다. 설치 없이 브라우저만 있으면 됩니다.' },
            { icon: '✏️', title: 'Word로 옮겨 편집', desc: 'HWP 서식이나 보고서 내용을 Word(.docx)로 옮겨 이어서 편집합니다. 표는 Word 표로 들어가 칸 내용을 그대로 고칠 수 있습니다.' },
            { icon: '🔒', title: '개인정보가 담긴 문서', desc: '이력서, 계약서, 신청서처럼 민감한 문서도 파일이 서버로 전송되지 않고 브라우저 안에서만 변환되어 외부에 남지 않습니다.' },
            { icon: '📋', title: '보도자료·공고문 내용 정리', desc: '정부 보도자료나 공고문 HWP에서 본문과 표 내용을 뽑아 PDF로 보관하거나 Word로 옮겨 요약·인용할 때 씁니다.' },
          ],
          steps: [
            { step: '파일 선택', desc: '영역을 눌러 .hwp 또는 .hwpx 파일을 고르거나 끌어다 놓습니다. 최대 10MB까지 지원하며, 파일명에 한글이 있어도 됩니다.' },
            { step: '변환 형식 선택', desc: '읽기·보관용이면 PDF, 내용을 고쳐 쓸 거라면 Word(.docx)를 누릅니다. 변환은 브라우저 안에서 바로 진행됩니다.' },
            { step: '결과 확인', desc: '변환된 문단 수가 표시됩니다. 암호가 걸렸거나 배포용으로 잠긴 문서는 본문을 읽을 수 없어 앞부분만 변환되며, 이 경우 경고가 함께 나옵니다.' },
            { step: '다운로드', desc: '다운로드 버튼을 누르면 원본 파일명 그대로 .pdf 또는 .docx 파일이 저장됩니다.' },
          ],
          faqs: [
            { q: 'HWP와 HWPX 모두 끝까지 변환되나요?', a: '네. HWP는 파일 안의 압축된 본문을 풀어서, HWPX는 본문 XML을 읽어서 문서 끝까지 글자와 표를 변환합니다. 단, 암호가 걸린 문서나 배포용 문서는 본문이 잠겨 있어 한글 프로그램이 저장해 둔 미리보기(앞부분)만 변환되며 화면에 경고가 표시됩니다.' },
            { q: '원본과 모양이 똑같이 나오나요?', a: '아니요. 이 도구는 글자와 표 내용을 옮기는 방식이라 글꼴, 글자 크기, 줄 간격, 이미지, 도형, 쪽 나눔은 원본과 다릅니다. 모양 그대로의 PDF가 필요하면 한글 프로그램이나 한컴독스에서 "PDF로 저장"을 쓰세요.' },
            { q: '파일이 서버에 저장되나요?', a: '아니요. 파일은 어디에도 전송되지 않고 지금 쓰는 브라우저 안에서만 읽고 변환합니다. 창을 닫으면 메모리에서도 사라집니다.' },
            { q: 'PDF에서 글자를 검색하거나 복사할 수 있나요?', a: '현재 PDF는 쪽마다 이미지로 만들어지므로 글자 검색·복사가 되지 않습니다. 글자를 고르거나 복사해야 한다면 Word(.docx)로 변환하세요.' },
          ],
        },
  en: {
          title: 'What does this HWP/HWPX to PDF and Word converter do?',
          description: 'It converts the text and tables of Hancom Hangul .hwp and .hwpx files to PDF or Word (.docx), free and without Hancom Office. Use it on a Mac, phone or office PC to read Korean notices, forms and official documents, or move their content into Word for editing. HWP files are read by decompressing the document body to the very end, HWPX files by reading their XML, and tables are carried over as real tables in both PDF and Word. PDF pages are split between paragraphs so lines are never cut in half. Files are never uploaded; everything happens inside your browser, so résumés and contracts stay on your device. Fonts, sizes, spacing, images, shapes and page layout are not preserved, so for submissions that must look exactly like the original, save to PDF from Hangul or Hancom Docs instead.',
          useCases: [
            { icon: '🍎', title: 'Read HWP on Mac or Mobile', desc: 'Open a Korean notice or official HWP document from email without Hancom Office by converting it to PDF in the browser.' },
            { icon: '✏️', title: 'Edit in Word', desc: 'Move the content of an HWP form or report into Word to keep editing. Tables arrive as Word tables you can change cell by cell.' },
            { icon: '🔒', title: 'Private Documents', desc: 'Résumés, contracts and applications are converted locally and never sent to a server.' },
            { icon: '📋', title: 'Press Releases and Notices', desc: 'Pull the body text and tables out of Korean government press releases to archive as PDF or quote in Word.' },
          ],
          steps: [
            { step: 'Choose a File', desc: 'Click or drag in an .hwp or .hwpx file up to 10MB. Korean filenames are fine.' },
            { step: 'Pick a Format', desc: 'Choose PDF for reading and archiving or Word (.docx) to keep editing. Conversion runs in your browser.' },
            { step: 'Check the Result', desc: 'The number of converted paragraphs is shown. Password-protected or distribution-locked files only convert their preview, with a warning.' },
            { step: 'Download', desc: 'The .pdf or .docx file is saved with the original filename.' },
          ],
          faqs: [
            { q: 'Are both HWP and HWPX converted to the end?', a: 'Yes. HWP bodies are decompressed and HWPX XML is read through to the end, including tables. Password-protected and distribution documents keep their body locked, so only the stored preview (the beginning) is converted and a warning is shown.' },
            { q: 'Will it look exactly like the original?', a: 'No. Only text and tables are carried over; fonts, sizes, spacing, images, shapes and page breaks differ. For an exact copy, use "Save as PDF" in Hangul or Hancom Docs.' },
            { q: 'Is my file uploaded?', a: 'No. The file is read and converted entirely inside your browser and is gone when you close the tab.' },
            { q: 'Can I search or copy text in the PDF?', a: 'Not yet — each PDF page is an image. Convert to Word (.docx) if you need selectable text.' },
          ],
        },
};
