// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
            title: "QR 코드 생성기란 무엇인가요?",
            description: "QR 코드(Quick Response Code)는 스마트폰 카메라로 즉시 스캔할 수 있는 2차원 바코드로, URL·텍스트·연락처 등 다양한 정보를 담을 수 있습니다. 이 무료 QR 코드 생성기는 원하는 링크나 텍스트를 입력하면 고해상도 QR 코드 이미지를 즉시 생성하고 PNG로 다운로드할 수 있습니다. 별도 앱 설치 없이 브라우저에서 바로 사용 가능하며, 생성된 QR 코드는 인쇄물·온라인 홍보물 등에 자유롭게 활용할 수 있습니다.",
            useCases: [
              { icon: '🏪', title: '오프라인 매장 홍보', desc: '명함, 전단지, 현수막에 QR 코드를 인쇄해 고객이 스캔만으로 홈페이지나 주문 페이지에 바로 접근하게 합니다.' },
              { icon: '📋', title: '행사 & 이벤트 안내', desc: '세미나·전시회 자료집에 QR 코드를 삽입해 발표 자료, 동영상, 설문 링크를 빠르게 공유할 수 있습니다.' },
              { icon: '💼', title: '디지털 명함', desc: '개인 포트폴리오나 링크드인 프로필 URL을 QR 코드화해 명함 뒷면에 넣으면 스마트한 인상을 줄 수 있습니다.' },
              { icon: '🍽️', title: '식당 & 카페 메뉴판', desc: '종이 메뉴판 대신 QR 코드로 디지털 메뉴를 연결하면 위생적이고 업데이트도 손쉽습니다.' },
            ],
            steps: [
              { step: 'URL 또는 텍스트 입력', desc: '상단 입력창에 QR 코드로 변환할 웹사이트 주소(https://...)나 원하는 텍스트를 붙여넣거나 직접 입력합니다. 입력과 동시에 실시간으로 QR 코드가 생성됩니다.' },
              { step: 'QR 코드 미리보기 확인', desc: '입력창 아래에 즉시 나타나는 QR 코드 미리보기를 스마트폰 카메라로 직접 스캔해 정보가 올바르게 담겼는지 확인합니다.' },
              { step: 'PNG 이미지 저장', desc: 'PNG 이미지 저장 버튼을 클릭하면 1200×1200px 고해상도 이미지가 기기에 다운로드됩니다. 인쇄물 제작에 바로 활용할 수 있는 품질입니다.' },
              { step: '인쇄물 또는 디지털 채널에 적용', desc: '저장한 QR 코드 이미지를 명함, 전단지, 현수막, 프레젠테이션, SNS 게시물 등 원하는 매체에 삽입하여 활용합니다.' },
            ],
            faqs: [
              { q: '생성된 QR 코드는 유효기간이 있나요?', a: '아니요. 본 도구가 생성하는 QR은 유효기간이 없는 정적 QR 코드입니다. QR 코드 자체에 정보가 직접 인코딩되어 있어 별도 서버를 거치지 않으므로, 연결된 웹페이지 주소가 살아있는 한 영구적으로 스캔이 가능합니다.' },
              { q: 'QR 코드를 인쇄할 때 주의할 점은?', a: '1200px 고해상도 이미지를 제공하므로 대형 현수막 크기로 인쇄해도 깨지지 않습니다. 다만, 스마트폰 카메라가 안정적으로 인식하려면 인쇄 크기가 최소 2cm × 2cm 이상이어야 합니다. 배경과 QR 코드 간 충분한 여백(Quiet Zone)도 확보해야 스캔 성공률이 높아집니다.' },
              { q: '이미지를 상업적으로 사용해도 되나요?', a: '네, 이 도구로 만든 QR 코드 이미지는 개인·기업 구분 없이 저작권 제약 없이 상업적 용도로 자유롭게 사용 가능합니다. 홍보물, 패키지 디자인, 광고물 등 어떤 용도로도 활용하실 수 있습니다.' },
              { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
            ],
          },
  en: {
            title: "What is a QR Code Generator?",
            description: "A QR Code (Quick Response Code) is a 2D barcode instantly scannable by smartphone cameras to encode URLs, text, contact info, and more. This free QR code generator creates a high-resolution QR code image the moment you type your link or text, available for immediate PNG download. No app installation required — works directly in your browser. Generated QR codes can be freely used on print materials, digital promotions, menus, and business cards.",
            useCases: [
              { icon: '🏪', title: 'Offline Store Promotion', desc: 'Print QR codes on flyers, banners, and business cards so customers can instantly reach your website or order page with a single scan.' },
              { icon: '📋', title: 'Events & Presentations', desc: 'Embed QR codes in seminar handouts or slide decks to share presentation files, videos, or survey links with attendees instantly.' },
              { icon: '💼', title: 'Digital Business Card', desc: 'Add a QR code to your business card linking to your portfolio or LinkedIn profile for a modern, memorable impression.' },
              { icon: '🍽️', title: 'Restaurant & Café Menus', desc: 'Replace printed menus with QR codes linking to digital menus — more hygienic and easy to update anytime.' },
            ],
            steps: [
              { step: 'Enter URL or Text', desc: 'Type or paste the website address (https://...) or any text you want to encode into the input field at the top. Your QR code generates in real time as you type.' },
              { step: 'Preview and Scan Test', desc: 'Check the QR code preview that appears immediately below the input. Scan it with your smartphone camera to verify the encoded information is correct before downloading.' },
              { step: 'Download HD PNG', desc: 'Click the "Save as PNG" button to download a 1200×1200px high-resolution image file to your device, ready for use in print or digital materials.' },
              { step: 'Apply to Your Materials', desc: 'Insert the downloaded QR code image into business cards, flyers, banners, presentations, menus, or social media posts — any medium where you want to give audiences instant access to your link.' },
            ],
            faqs: [
              { q: 'Do QR codes generated here ever expire?', a: 'No. These are static QR codes where the destination information is encoded directly into the image itself, with no intermediary server. They will remain scannable permanently as long as the linked webpage or destination URL stays active.' },
              { q: 'What is the minimum print size for reliable scanning?', a: 'We provide a 1200×1200px HD image, so print quality is never a concern. For reliable smartphone recognition, print the QR code at least 2cm × 2cm in size. Also ensure adequate white space (Quiet Zone) around all four sides of the code, as cluttered surroundings reduce scan success rates.' },
              { q: 'Can I use the QR code for commercial purposes?', a: 'Yes. All QR codes generated with this tool are completely free for both personal and commercial use with no attribution or licensing restrictions. Feel free to use them on product packaging, advertising materials, menus, or any commercial print and digital assets.' },
              { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
            ],
          },
};
