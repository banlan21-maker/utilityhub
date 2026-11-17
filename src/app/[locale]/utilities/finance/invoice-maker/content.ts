// 인보이스 & 견적서 메이커 SEO 본문 — 화면(SeoSection)과 구조화 데이터(page.tsx)가 같은 내용을 쓴다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO_KO: SeoContent = {
  title: '인보이스 & 견적서 메이커 — 가입 없이 견적서·청구서를 PDF와 Excel로',
  description:
    '인보이스 & 견적서 메이커는 프리랜서와 소규모 사업자가 거래처에 보낼 견적서나 청구서(인보이스)를 브라우저에서 바로 작성해 PDF나 Excel로 저장하는 무료 도구입니다. 발행인 정보(이름·상호명, 이메일, 연락처, 주소, 사업자번호, 은행명, 계좌번호)와 로고를 넣고 수신인과 품목을 입력하면 품목별 금액과 소계, 세금, 합계가 입력하는 즉시 계산됩니다. 품목 줄은 필요한 만큼 추가하고 ✕ 버튼으로 지울 수 있으며, 비고 칸에 적은 결제 기한이나 특이사항은 문서 아래쪽에 함께 인쇄됩니다. 한국(KRW) 모드에서는 세금 유형에서 부가세 10%나 세금 없음(0%)을 고를 수 있고, 미국(USD) 모드에서는 Sales Tax 세율을 0.25% 단위로 직접 입력하며 기본값은 8.25%입니다. 예를 들어 "웹사이트 디자인" 1건 단가 1,500,000원과 "유지보수" 3개월 단가 200,000원을 넣으면 소계(공급가액) 2,100,000원, 부가세 10% 210,000원, 합계 2,310,000원이 바로 표시됩니다. 인보이스 번호는 INV-20261117-001처럼 날짜와 일련번호로 자동으로 붙고, 같은 날 문서를 저장한 뒤 새로 열면 002, 003처럼 다음 번호가 이어집니다. 결제 링크(토스·카카오페이 등)를 넣으면 결제 QR 코드가 PDF에 함께 들어가고, 발행인 정보와 최근 저장한 문서 5건은 이 브라우저의 로컬 저장소에 보관되어 다음 방문 때 다시 불러올 수 있습니다. 다만 이 도구로 만드는 것은 견적서·청구서 양식이며, 부가가치세법상 효력이 있는 전자세금계산서는 홈택스 등에서 따로 발급해야 합니다.',
  useCases: [
    { icon: '🧑‍💻', title: '프리랜서 작업 견적', desc: '디자인·개발·번역 프로젝트를 시작하기 전에 작업 항목과 단가를 정리해 견적서 PDF로 보냅니다. 부가세 10%를 고르면 공급가액, 세액, 합계가 나뉘어 표시되어 거래처가 금액을 한눈에 확인할 수 있습니다.' },
    { icon: '💳', title: '작업 완료 후 대금 청구', desc: '납품을 마친 뒤 납기일을 지정한 청구서를 만들고 비고 칸에 입금 기한을 적습니다. 토스나 카카오페이 송금 링크를 넣으면 결제 QR 코드가 문서에 인쇄되어 상대방이 휴대폰으로 바로 송금 화면을 열 수 있습니다.' },
    { icon: '🌎', title: '해외 클라이언트 인보이스', desc: '미국(USD) 모드로 바꾸면 문서 제목이 INVOICE로, 금액이 달러 소수점 둘째 자리까지, 세금 항목이 Sales Tax로 바뀝니다. 세율은 0.25% 단위로 입력하고 PayPal·Venmo 링크로 결제 QR을 만들 수 있습니다.' },
    { icon: '📊', title: '장부·정산용 Excel 정리', desc: '"Excel 저장"을 누르면 품목명·수량·단가·금액과 소계·세금·합계가 담긴 .xlsx 파일이 인보이스 번호를 파일명으로 내려받아집니다. 월말 매출 정리나 세무 대리인에게 넘길 자료에 바로 붙여 쓸 수 있습니다.' },
  ],
  steps: [
    { step: '국가 모드와 발행인 정보 입력', desc: '상단에서 "🇰🇷 한국 (KRW)" 또는 "🇺🇸 US (USD)"를 고르고, 발행인 정보에 이름/상호명·연락처·사업자번호·은행명·계좌번호를 적습니다. "로고 업로드"로 1MB 이하 이미지를 넣을 수 있고, 발행인 정보는 다음 방문 때 자동으로 채워집니다.' },
    { step: '수신인과 인보이스 정보 작성', desc: '수신인 정보에 거래처 이름/업체명·이메일·주소를 적고 인보이스 번호·발행일·납기일을 확인합니다. 번호는 자동으로 채워지며 직접 고치거나 "재생성" 버튼으로 오늘 날짜 기준 번호를 다시 받을 수 있습니다.' },
    { step: '품목과 세금 입력', desc: '품목 목록에 품목명·수량·단가를 입력하면 금액이 자동으로 계산되고, "+ 품목 추가"로 줄을 늘립니다. 아래 "세금 유형 & 세율"에서 부가세 10%나 세금 없음을 고르면 소계·세금·합계가 즉시 바뀝니다.' },
    { step: 'PDF·Excel 저장과 공유', desc: '"PDF 저장"은 A4 문서로, "Excel 저장"은 품목 표로 내려받습니다. "공유 링크"는 계좌 정보를 뺀 링크를 복사하고, "저장"은 최근 5개 목록에 문서를 보관해 다음에 그대로 불러올 수 있게 합니다.' },
  ],
  faqs: [
    { q: '이 도구로 만든 문서가 세금계산서로 인정되나요?', a: '아니요. 이 도구는 견적서·청구서 양식을 만들어 줄 뿐 국세청에 전송되는 전자세금계산서를 발급하지 않습니다. 한국 모드 PDF 제목은 "견적서 / 청구서"이며, 법인과 일정 규모 이상의 개인사업자가 발급해야 하는 전자세금계산서는 홈택스나 전자세금계산서 발급 서비스에서 따로 발행해야 합니다. 이 문서는 금액을 안내하는 견적서·청구서로 활용하세요.' },
    { q: '부가세는 어떻게 계산되나요?', a: '품목별 금액(수량 × 단가)을 모두 더한 소계를 공급가액으로 보고, 여기에 10%를 곱한 부가세를 더해 합계를 냅니다. 소계가 1,000,000원이면 부가세 100,000원, 합계 1,100,000원입니다. 그래서 단가는 부가세를 뺀 금액으로 입력해야 하며, 부가세는 원 단위 미만을 버립니다. 부가세 포함 금액에서 공급가액을 거꾸로 구하려면 부가세 계산기를 함께 쓰세요.' },
    { q: '원천징수 3.3%를 고르면 금액이 어떻게 바뀌나요?', a: '프리랜서 용역비처럼 지급하는 쪽이 세금을 떼고 주는 경우를 위한 옵션입니다. 소득세 3%(10원 미만 절사)와 지방소득세(소득세의 10%, 10원 미만 절사)를 더한 금액을 소계에서 빼고, 합계 대신 "실지급액"으로 표시합니다. 예를 들어 소계 1,000,000원이면 소득세 30,000원과 지방소득세 3,000원을 뺀 967,000원이 실지급액입니다. 이때는 부가세가 붙지 않습니다.' },
    { q: '입력한 내용은 어디에 저장되나요?', a: '서버가 아니라 지금 쓰는 브라우저의 로컬 저장소에 저장됩니다. 발행인 정보(로고·계좌번호 포함)는 입력할 때마다 자동으로 보관되고, PDF·Excel로 내보내거나 "저장" 버튼을 누른 문서는 최근 5건까지 남습니다. 브라우저 데이터를 지우거나 시크릿 모드를 쓰면 사라지고 다른 기기와 동기화되지 않으니, 중요한 문서는 PDF로 보관하고 공용 PC에서는 사용 후 발행인 정보를 지워 주세요.' },
    { q: '공유 링크는 어떻게 동작하나요?', a: '문서 내용을 압축해 링크 주소의 # 뒤에 담은 뒤 그 링크를 클립보드에 복사합니다. # 뒤의 내용은 링크를 열 때 서버로 전송되지 않고 받는 사람의 브라우저에서만 풀립니다. 은행명과 계좌번호는 링크에서 자동으로 빠지지만, 비고 칸에 적은 계좌 안내나 로고는 그대로 포함됩니다. 링크를 가진 사람은 누구나 내용을 열어 볼 수 있으니 문서 자체를 보내는 것처럼 받을 사람에게만 전달하세요. 받은 쪽에서는 새 인보이스 번호와 오늘 날짜로 열립니다.' },
    { q: 'PDF에서 한글이나 로고가 이상하게 나와요.', a: 'PDF는 화면 밖에 그려 둔 A4 크기 미리보기를 이미지로 캡처해 만들기 때문에 기기에 있는 글꼴로 표시됩니다. 글자가 어색하면 브라우저를 최신 버전으로 업데이트한 뒤 다시 저장해 보세요. 로고는 1MB 이하 이미지만 올릴 수 있고, 품목이 많아 한 쪽을 넘으면 자동으로 다음 쪽으로 나뉘어 저장됩니다.' },
    { q: '상업적으로 사용해도 되나요?', a: '네. 개인과 사업자 모두 무료로 쓸 수 있고 회원가입이나 결제가 필요 없습니다. 다만 PDF 하단에 "Created with TheUtilHub · theutilhub.com" 문구가 작게 들어갑니다. 계산 결과는 참고용이므로 실제 세금 신고 금액은 홈택스나 세무 전문가를 통해 꼭 확인하세요.' },
  ],
};

export const SEO_EN: SeoContent = {
  title: 'Invoice & Quote Maker — Create Invoices and Quotes as PDF or Excel',
  description:
    'The Invoice & Quote Maker lets freelancers and small businesses put together a quote or invoice in the browser and save it as a PDF or Excel file without creating an account. You fill in the issuer details (name or company, email, phone, address, tax ID, bank and account number), add an optional logo, enter the client, and list line items with a quantity and unit price. Each line amount, the subtotal, the tax and the total update as you type. On the English page the tool opens in US (USD) mode, where you enter a sales tax rate (8.25% by default, adjustable in 0.25% steps) and amounts show two decimal places; a Korea (KRW) mode with 10% VAT or no tax is one tap away. For example, a "Website redesign" line at 1 × $1,200 plus "Monthly hosting" at 3 × $25 gives a $1,275.00 subtotal, $105.19 of sales tax at 8.25% and a $1,380.19 total. Invoice numbers are generated in the form INV-20261117-001, and the next document you open after saving one on the same day continues with 002. Adding a PayPal or Venmo link prints a payment QR code on the PDF, and your issuer details plus the five most recently saved invoices stay in this browser\'s local storage so they are ready next time.',
  useCases: [
    { icon: '🧑‍💻', title: 'Freelance Project Quotes', desc: 'Before starting a design, development or translation job, list each deliverable with its quantity and rate, then send the client a clean PDF quote that shows the subtotal, tax and total.' },
    { icon: '💳', title: 'Billing After Delivery', desc: 'Once the work is done, set a due date, write your payment terms in the notes, and paste a PayPal or Venmo link so a scannable payment QR code appears on the invoice you send.' },
    { icon: '🌎', title: 'Clients in Two Currencies', desc: 'Switch between US (USD) and Korea (KRW) modes with one tap. The currency symbol, number format, tax label and document title change to match, which helps when you bill clients in both countries.' },
    { icon: '📊', title: 'Bookkeeping in Excel', desc: 'Save Excel downloads an .xlsx file named after the invoice number, with the description, quantity, unit price and amount of each line plus subtotal, tax and total rows, ready for a monthly sales sheet.' },
  ],
  steps: [
    { step: 'Pick a Country and Fill In the Issuer', desc: 'Choose 🇺🇸 US (USD) or 🇰🇷 Korea (KRW) at the top, then complete From (Issuer). Upload Logo accepts images under 1MB, and these details are filled in for you automatically on your next visit.' },
    { step: 'Add the Client and Invoice Info', desc: 'Enter the client\'s name, email and address under To (Client), then check the Invoice #, Issue Date and Due Date. Edit the number by hand or press Regen to get today\'s next number.' },
    { step: 'Enter Line Items and Tax', desc: 'Type a description, quantity and unit price on each row and use + Add Item for more lines. Set the tax rate under the items, and the subtotal, tax and total recalculate straight away.' },
    { step: 'Save, Export or Share', desc: 'Save PDF creates an A4 document and Save Excel a spreadsheet. Share link copies a link without your bank details, and Save keeps the invoice in the Recent list so you can load it again later.' },
  ],
  faqs: [
    { q: 'Is the PDF a legally valid tax invoice?', a: 'It is an ordinary invoice or quote document that you send to your client; it is not filed with any tax authority. Whether it meets local invoicing rules depends on your country and on the details you include. In Korea, official electronic tax invoices have to be issued separately through Hometax or an e-invoicing provider.' },
    { q: 'How is the tax calculated?', a: 'Each line amount is quantity times unit price, the lines are added up to get the subtotal, and the tax rate is applied to the subtotal and added on top. With a $1,000 subtotal and 8.25% sales tax, the tax is $82.50 and the total is $1,082.50. That means unit prices should be entered before tax. Sales tax is rounded to the nearest cent.' },
    { q: 'What does the Korean 3.3% withholding option do?', a: 'In Korea, a client paying a freelancer usually withholds 3% income tax plus local tax of 10% of that amount and pays the rest. With this option the tool subtracts both, each rounded down to 10 won, and shows the remainder as the net payment. A 1,000,000 won subtotal becomes a net payment of 967,000 won, and no VAT is added.' },
    { q: 'Where is my data stored?', a: 'In your browser\'s local storage, not on a server. Issuer details, including the logo and account number, are saved automatically, and invoices you export or save are kept up to the five most recent. Clearing browser data or using a private window removes them, so keep important invoices as PDFs and clear the issuer fields on a shared computer.' },
    { q: 'How does the share link work?', a: 'The invoice is compressed into the part of the link after the # sign, and the link is copied to your clipboard. That part is never sent to a server when the link is opened; it is read only in the recipient\'s browser. Bank name and account number are removed, but anything you wrote in the notes and your logo are included. Anyone who has the link can open it, so send it only to the intended client. It opens with a fresh invoice number and today\'s date.' },
    { q: 'My logo or text looks wrong in the PDF. What can I do?', a: 'The PDF is made by capturing an off-screen A4 preview as an image, so it uses the fonts available on your device. If text looks off, update your browser and export again. Logos must be under 1MB, and invoices with many lines are split across additional A4 pages automatically.' },
    { q: 'Can I use it for my business?', a: 'Yes. It is free for personal and business use with no sign-up or payment. A small "Created with TheUtilHub · theutilhub.com" line is printed at the bottom of the PDF. Treat the calculated amounts as a guide and confirm your tax figures with an accountant before filing anything.' },
  ],
};
