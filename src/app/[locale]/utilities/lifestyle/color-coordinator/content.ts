// OOTD 컬러 코디네이터 SEO 본문 — 화면(SeoSection)과 구조화 데이터(page.tsx)가 같은 내용을 쓴다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO_KO: SeoContent = {
  title: 'OOTD 컬러 코디네이터 — 코디 색 조합을 마네킹에 입혀 보는 무료 도구',
  description:
    'OOTD 컬러 코디네이터는 모자·아우터·상의·하의·신발 다섯 아이템의 색을 마네킹에 바로 입혀 보고, 그 조합이 어울리는지 색채 원칙으로 점검해 주는 무료 코디 도구입니다. 팔레트는 화이트·아이보리·차콜 같은 뉴트럴, 베이지·카멜·카키 같은 어스 톤, 네이비·중청·연청 데님, 버건디·머스터드·라벤더 같은 포인트 색까지 실제 옷장에 많은 25가지로 구성했고, 원하는 색은 직접 고를 수도 있습니다. 퍼스널 컬러 탭에서는 봄 웜·여름 쿨·가을 웜·겨울 쿨 4계절 팔레트를 각 12색씩 보여 주고, 얼굴 가까운 상의·아우터·모자가 내 계절 팔레트에 맞는지 알려 줍니다. 아이템 하나를 기준으로 데일리(뉴트럴 매치)·포인트(보색 한 곳)·소프트(같은 계열 톤온톤) 세 가지 룩을 자동으로 채워 주며, 같은 버튼을 다시 누르면 다른 조합이 나옵니다. 조합 점검은 전신 3색 이내 원칙, 포인트 색 개수와 색상환 관계, 상·하의 밝기 차이(CIE L*), 웜·쿨 온도 충돌을 따져 바로 고칠 수 있는 팁으로 알려 줍니다. 피부 톤 5단계를 바꿔 볼 수 있고, 완성한 코디는 색 이름과 HEX 코드가 적힌 인스타그램 4:5 비율 PNG로 저장됩니다. 모든 계산은 브라우저에서만 이뤄지며 사진이나 개인 정보는 서버로 전송되지 않습니다.',
  useCases: [
    { icon: '🛍️', title: '사기 전에 입혀 보기', desc: '머스터드 니트를 살지 고민될 때 가진 연청 데님·차콜 코트와 함께 마네킹에 입혀 보고, 조합 점검에서 색 계열이 3가지 이내인지 확인한 뒤 결정할 수 있습니다.' },
    { icon: '🌸', title: '퍼스널 컬러 활용', desc: '진단에서 여름 쿨이 나왔다면 여름 팔레트로 상의·아우터를 고르고, 팔레트 밖 색은 하의나 신발로 내리면 얼굴은 화사하게 유지하면서 좋아하는 색도 입을 수 있습니다.' },
    { icon: '💼', title: '면접·출근 코디', desc: '네이비 재킷을 기준으로 데일리 룩을 누르면 화이트·라이트그레이 같은 단정한 기본색이 채워집니다. 상·하의 밝기 차이(ΔL)로 인상이 또렷한지도 숫자로 확인합니다.' },
    { icon: '📸', title: 'OOTD 기록·공유', desc: '완성한 코디를 1080×1350 PNG로 저장하면 아이템별 색 이름과 HEX 코드, 조합 점검 결과가 함께 들어가 인스타그램 게시물이나 쇼핑 메모로 바로 쓸 수 있습니다.' },
  ],
  steps: [
    { step: '아이템을 고르고 색 입히기', desc: '마네킹이나 아이템 목록에서 상의·하의·신발을 눌러 선택한 뒤 팔레트에서 색을 고릅니다. 모자와 아우터는 목록의 + 추가 버튼으로 켜고 끕니다.' },
    { step: '퍼스널 컬러 팔레트 고르기', desc: '내 계절을 알고 있다면 봄 웜·여름 쿨·가을 웜·겨울 쿨 탭을 눌러 그 계절의 12색으로 고릅니다. 커스텀 색상 버튼으로 가진 옷과 똑같은 색도 넣을 수 있습니다.' },
    { step: '룩 자동 추천 받기', desc: '기준이 될 아이템을 선택한 상태에서 데일리·포인트·소프트를 누르면 나머지 아이템 색이 채워집니다. 같은 버튼을 다시 누르면 다른 조합이 나옵니다.' },
    { step: '조합 점검 후 저장', desc: '아래 조합 점검에서 경고(!) 항목의 팁대로 색을 바꿔 보고, 마음에 들면 코디 저장 버튼으로 색 이름과 HEX 코드가 들어간 PNG 이미지를 내려받습니다.' },
  ],
  faqs: [
    { q: '코디할 때 색은 몇 가지까지 쓰는 게 좋나요?', a: '전신에 쓰는 색 계열을 3가지 이내로 맞추면 정돈돼 보인다는 것이 널리 쓰이는 코디 원칙입니다. 이 도구는 같은 색상의 명도 차이(예: 베이지와 카멜)는 한 계열로 묶어 세고, 4가지면 주의, 5가지 이상이면 경고로 표시합니다. 흰색·검정·네이비·베이지 같은 기본색을 바탕으로 포인트 색은 1~2가지가 적당합니다.' },
    { q: '데일리·포인트·소프트 룩은 어떤 원리로 색을 정하나요?', a: '세 룩 모두 지금 선택한 아이템 색을 기준으로 고정합니다. 데일리는 기준색과 밝기 대비가 나는 기본색(데님·차콜·아이보리 등)으로 채우고, 포인트는 나머지를 기본색으로 두고 신발이나 모자 한 곳에만 보색(색상환 180°, 다시 누르면 분할보색 ±30°)을 넣습니다. 소프트는 같은 색 계열에서 밝기만 바꾼 톤온톤입니다.' },
    { q: '퍼스널 컬러 팔레트는 어떤 기준인가요?', a: '피부의 노란 기·푸른 기(웜·쿨 언더톤)와 잘 어울리는 밝기·선명도에 따라 사람을 봄·여름·가을·겨울로 나누는 4계절 분류를 따릅니다. 봄 웜은 밝고 맑은 따뜻한 색, 여름 쿨은 밝고 부드러운 차가운 색, 가을 웜은 깊고 차분한 어스 톤, 겨울 쿨은 선명하고 대비가 강한 색입니다. 정확한 진단은 자연광에서 드레이핑으로 받는 것이 좋습니다.' },
    { q: '상·하의 밝기 차이(ΔL)는 무엇을 뜻하나요?', a: '사람 눈이 느끼는 밝기를 0~100으로 나타낸 CIE L* 값의 차이입니다. 12 미만이면 톤온톤처럼 차분하지만 허리선이 흐릿해 보일 수 있고, 45를 넘으면 흰 셔츠에 검정 바지처럼 또렷한 인상이 됩니다. 정답은 없으니 원하는 분위기에 맞춰 참고하세요. 화면 색은 모니터마다 조금씩 다르게 보입니다.' },
    { q: '저장한 이미지에는 무엇이 들어가나요?', a: '인스타그램 피드 비율(4:5)인 1080×1350 PNG에 마네킹 코디, 아이템별 색 이름과 HEX 코드, 조합 점검 결과, 선택한 퍼스널 컬러 계절이 함께 들어갑니다. 이미지는 브라우저에서 바로 만들어지며 서버에 업로드되지 않습니다.' },
  ],
};

export const SEO_EN: SeoContent = {
  title: 'Outfit Color Coordinator — Try Color Combinations on a Mannequin',
  description:
    'OOTD Color Coordinator is a free outfit color tool that lets you dress a mannequin in five pieces — hat, outer layer, top, bottom and shoes — and checks whether the colors work together. The palette holds 25 colors people actually own: neutrals such as white, ivory and charcoal, earth tones such as beige, camel and khaki, navy plus mid and light denim, and accents such as burgundy, mustard and lavender. You can also pick any custom color. The personal color tab shows twelve colors for each of the four seasons — warm Spring, cool Summer, warm Autumn and cool Winter — and tells you whether the pieces near your face match your season. Pick one item as the base and the Daily (neutral match), Point (one complementary accent) or Soft (tone-on-tone) look fills in the rest; press the same look again for another variation. The harmony check applies common styling rules: three color families or fewer, how many accents you use and how they relate on the color wheel, the lightness gap between top and bottom (CIE L*), and warm/cool clashes, each with a practical tip. Switch between five skin tones, then save the outfit as a 1080×1350 PNG with color names and HEX codes. Everything runs in your browser and nothing is uploaded.',
  useCases: [
    { icon: '🛍️', title: 'Try Before You Buy', desc: 'Thinking about a mustard sweater? Put it on the mannequin with the light-wash jeans and charcoal coat you already own and check that the outfit stays within three color families.' },
    { icon: '🌸', title: 'Use Your Personal Color', desc: 'If you are a cool Summer, choose tops and outer layers from the Summer palette and move colors outside it to trousers or shoes, so your face stays bright while you still wear favorites.' },
    { icon: '💼', title: 'Interview and Office Outfits', desc: 'Start from a navy jacket and press Daily to fill in crisp basics such as white and light gray, then use the top/bottom lightness gap to see how sharp the outfit will look.' },
    { icon: '📸', title: 'Log and Share Your OOTD', desc: 'Save a 1080×1350 PNG that lists every piece with its color name and HEX code plus the harmony check — ready for an Instagram post or a shopping note.' },
  ],
  steps: [
    { step: 'Select a piece and color it', desc: 'Tap the top, bottom or shoes on the mannequin or in the item list, then choose a color. Turn the hat and outer layer on or off with the + Add button.' },
    { step: 'Choose a personal color palette', desc: 'If you know your season, open the Spring, Summer, Autumn or Winter tab to pick from its twelve colors, or use Custom color to match a garment you own exactly.' },
    { step: 'Generate a look', desc: 'With your base piece selected, press Daily, Point or Soft to fill in the other pieces automatically. Press the same look again to see a different combination.' },
    { step: 'Check harmony and save', desc: 'Follow the tips next to any warning in the harmony check, and when you like the result, save a PNG with the color names and HEX codes of every piece.' },
  ],
  faqs: [
    { q: 'How many colors should an outfit have?', a: 'A widely used styling rule is to keep a full outfit to three color families or fewer. This tool counts lighter and darker shades of the same hue (beige and camel, for example) as one family, flags four as a caution and five or more as a warning. Build on basics such as white, black, navy and beige and add one or two accent colors.' },
    { q: 'How do the Daily, Point and Soft looks pick colors?', a: 'All three keep the selected piece as the base. Daily fills the rest with basics that contrast with the base in lightness, such as denim, charcoal or ivory. Point keeps the rest neutral and adds a complementary color (180° on the color wheel, or split-complementary ±30° on the next press) to the shoes or hat. Soft is tone-on-tone: the same color family in different lightness steps.' },
    { q: 'What are the personal color seasons based on?', a: 'Seasonal color analysis groups people into Spring, Summer, Autumn and Winter by skin undertone (warm or cool) and by how light and how clear the flattering colors are. Spring suits warm, light, clear colors; Summer cool, light, soft ones; Autumn warm, deep, muted earth tones; Winter cool, vivid, high-contrast colors. A draping test in daylight gives the most reliable result.' },
    { q: 'What does the top/bottom lightness gap (ΔL) mean?', a: 'It is the difference in CIE L*, a 0–100 scale of perceived lightness. Below 12 the outfit reads as calm tone-on-tone but the waistline can blur; above 45 it looks crisp, like a white shirt with black trousers. There is no single right answer, so use it to match the mood you want. Colors also look slightly different on every screen.' },
    { q: 'What is included in the saved image?', a: 'A 1080×1350 PNG, the 4:5 Instagram feed ratio, with the mannequin outfit, each piece’s color name and HEX code, the harmony check and the personal color season you selected. The image is drawn in your browser and is never uploaded to a server.' },
  ],
};
