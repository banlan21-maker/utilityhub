// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '욕실 타일 시뮬레이터 — 실제 크기와 원근으로 미리 보기',
          description: '타일은 같은 색이라도 크기, 줄눈 색, 배치, 광택에 따라 욕실 분위기가 크게 달라집니다. 이 시뮬레이터는 바닥과 벽의 네 모서리와 실제 치수로 원근 변환(호모그래피)을 계산해, 화면 픽셀마다 그 자리가 실제로 몇 mm 지점인지 구한 뒤 타일과 줄눈을 그립니다. 그래서 멀리 있는 타일은 작게, 가까운 타일은 크게 보이고, 600×1200mm 타일은 바닥이든 벽이든 같은 크기로 나타납니다. 대리석·트래버틴·콘크리트·테라조·우드는 실제 돌과 나무를 찍은 이음매 없는 사진 텍스처를 써서 타일마다 다른 부분과 방향을 잘라 쓰므로 같은 무늬가 반복되지 않습니다. 원래 사진의 색 있는 밝기를 조명 지도로 곱해 간접등의 따뜻한 빛과 세면대 아래 그림자가 남고, 벽과 바닥이 만나는 모서리는 살짝 어두워지며, 타일 모서리 베벨 때문에 같은 색 줄눈이어도 이음매가 은은하게 보입니다. 유광 바닥에는 욕조와 변기가 흐리게 비치고, 샘플 욕실은 카메라 위치를 계산해 거울 속 벽까지 새 타일로 바꿉니다. 내 욕실 사진을 올려 네 모서리를 맞추면 우리 집에 깔았을 때의 모습을 볼 수 있고, 변기·세면대처럼 앞에 있는 물건은 붓으로 칠해 원래 사진으로 남깁니다. 줄눈은 1~5mm와 색, 배치는 일자·1/2·1/3 엇갈림, 마감은 무광·반광·유광을 고르고, 전후 비교 손잡이로 시공 전과 나란히 봅니다. 면 치수로 필요한 타일 장수, 잘라 쓰는 장, 5% 여유, 박스 수도 함께 보여 줍니다. 사진은 서버로 올라가지 않고 브라우저 안에서만 처리됩니다.',
          useCases: [
            { icon: '🛁', title: '욕실 리모델링 타일 고르기', desc: '내 욕실 사진에 600×600 다크 콘크리트 바닥과 600×1200 화이트 대리석 벽 같은 조합을 깔아 보고, 줄눈을 화이트와 그레이로 바꿔 가며 어울리는 조합을 시공 전에 정합니다.' },
            { icon: '🏢', title: '인테리어 상담 자료', desc: '고객 현장 사진에 후보 타일 두세 가지를 적용해 고해상도 이미지로 저장하고, 전후 비교 손잡이로 시공 전과 나란히 보여 주며 결정을 빠르게 돕습니다.' },
            { icon: '📐', title: '타일 크기·배치·광택 판단', desc: '좁은 욕실에 600×1200 대형 타일과 100×300 소형 타일 중 무엇이 넓어 보이는지, 유광 바닥이 반사로 얼마나 밝아 보이는지 실제 비율과 조명으로 확인합니다.' },
            { icon: '🧮', title: '주문 수량 확인', desc: '면의 가로·세로 치수와 타일 크기로 들어가는 장수, 잘라 쓰는 장, 5% 여유분과 박스 수를 확인해 견적서의 타일 수량이 맞는지 대조합니다.' },
          ],
          steps: [
            { step: '사진 고르기', desc: '샘플 욕실로 바로 시작하거나, 정면에서 1배 렌즈로 찍은 내 욕실 사진을 올립니다. 광각(0.5배) 사진은 직선이 휘어 원근이 어긋날 수 있습니다.' },
            { step: '면 맞추기', desc: '내 사진이면 바닥·정면 벽·옆 벽마다 1~4번 점을 네 모서리에 끌어 맞추고(확대경 표시), 줄자로 잰 실제 가로·높이(m)를 넣습니다. 앞에 있는 변기·세면대·거울은 가림 칠하기로 칠합니다.' },
            { step: '타일 고르기', desc: '면을 고른 뒤 실사 견본 타일이나 직접 찍은 타일 사진을 고르고, 타일 크기(mm), 줄눈 두께와 색, 배치, 시작 위치, 무광·반광·유광 마감을 정합니다.' },
            { step: '비교·저장', desc: '전후 비교 손잡이를 좌우로 끌어 시공 전과 비교하고, 필요한 타일 장수와 박스 수를 확인한 뒤 이미지 저장으로 원래 해상도 JPG를 내려받습니다.' },
          ],
          faqs: [
            { q: '내 욕실 사진으로도 할 수 있나요?', a: '네. 사진을 올리고 바닥과 벽마다 네 모서리 점을 맞춘 뒤 실제 치수를 넣으면 그 원근 그대로 타일이 깔립니다. 변기·세면대처럼 앞에 있는 물건과 거울은 붓으로 칠해 원래 사진으로 남기면 됩니다. 사진은 서버로 보내지 않고 브라우저 안에서만 처리됩니다.' },
            { q: '사진은 어떻게 찍어야 잘 맞나요?', a: '휴대폰 기본(1배) 렌즈로, 문 앞에서 정면 벽을 보고 수평을 맞춰 찍는 것이 좋습니다. 광각(0.5배) 렌즈는 가장자리 직선이 휘어 네 점으로 맞춘 면과 어긋나고, 바닥과 벽의 모서리가 사진 안에 많이 보일수록 정확합니다. 조명을 모두 켜고 찍으면 그림자와 반사가 더 자연스럽게 살아납니다.' },
            { q: '왜 실제 사진처럼 보이나요?', a: '대리석·콘크리트 같은 무늬는 실제 재료를 찍은 사진 텍스처를 타일마다 다른 부분으로 잘라 쓰고, 원래 사진의 빛 색과 그림자를 그대로 곱합니다. 여기에 모서리 그늘, 타일 베벨, 줄눈 질감, 유광 반사를 더하고 샘플 욕실은 거울 속 벽까지 다시 그립니다. 다만 실제 제품 색과는 차이가 있으니 견본을 확인하세요.' },
            { q: '줄눈 색은 어떤 것이 많이 쓰이나요?', a: '밝은 타일에 화이트 줄눈을 쓰면 이음매가 거의 보이지 않아 넓어 보이고, 그레이·차콜 줄눈은 오염이 덜 보이고 타일 모양이 또렷해집니다. 바닥은 물때가 생기기 쉬워 타일보다 한두 톤 어두운 줄눈을 고르는 경우가 많습니다. 시뮬레이터에서 바꿔 비교해 보세요.' },
            { q: '필요한 타일 장수는 어떻게 세나요?', a: '면의 가로·세로와 타일 크기, 줄눈, 배치와 시작 위치로 실제로 깔리는 장수를 셉니다. 가장자리에서 잘라 쓰는 장도 한 장으로 셉니다. 여기에 파손·재단 여유 5%를 더하고 1.44㎡ 박스 기준으로 박스 수를 냅니다. 문·창문 자리 차감은 타일·도배 계산기에서 할 수 있습니다.' },
          ],
        },
  en: {
          title: 'Bathroom tile visualizer at true scale and perspective',
          description: 'The same tile colour feels very different depending on size, grout, layout and finish. This visualizer computes a perspective transform (homography) from the four corners and real dimensions of each floor or wall, finds the real position in millimetres for every pixel and draws tiles and grout there, so far tiles shrink correctly and a 600×1200 mm tile is the same size on every surface. Marble, travertine, concrete, terrazzo and wood looks use seamless photographic textures cut differently for each tile, so patterns never repeat. The original photo’s coloured lighting is multiplied back onto the tiles, corners get soft occlusion, bevels make joints visible even with matching grout, polished floors reflect the objects above them, and in the sample room the mirror reflects the new walls. Upload your own photo, align the corners, enter measured dimensions and paint over objects in front. Choose grout width and colour, stacked or offset layouts and matte, satin or polished finishes, drag the before/after handle, and see tile counts with cut pieces, 5% spare and boxes. Photos are processed only in your browser.',
          useCases: [
            { icon: '🛁', title: 'Pick Tiles Before Renovating', desc: 'Compare floor and wall combinations and grout colours on your own bathroom photo before work starts.' },
            { icon: '🏢', title: 'Client Presentations', desc: 'Apply candidate tiles to a site photo, save high-resolution images and show before and after side by side.' },
            { icon: '📐', title: 'Size, Layout and Finish', desc: 'See at true scale and lighting whether large or small tiles and polished or matte finishes suit a room.' },
            { icon: '🧮', title: 'Check Order Quantities', desc: 'Count pieces, cut pieces, 5% spare and boxes from surface size and tile size to cross-check a quote.' },
          ],
          steps: [
            { step: 'Choose a Photo', desc: 'Start with the sample bathroom or upload a straight-on photo taken with the 1× lens.' },
            { step: 'Align Surfaces', desc: 'Drag points 1–4 to each surface’s corners with the magnifier, enter measured width and height, and paint over objects in front.' },
            { step: 'Choose Tiles', desc: 'Pick a photo-real tile or your own tile photo, size, grout, layout, starting point and finish.' },
            { step: 'Compare and Save', desc: 'Drag the before/after handle, check quantities and save a full-resolution JPG.' },
          ],
          faqs: [
            { q: 'Can I use my own bathroom photo?', a: 'Yes. Upload it, align the four corners of each surface and enter real dimensions; tiles follow that perspective. Paint over the toilet, basin or mirror to keep them from the original photo. Photos never leave your browser.' },
            { q: 'How should I take the photo?', a: 'Use the standard 1× lens, stand at the door facing the back wall, keep the phone level and switch all lights on. Ultra-wide lenses bend straight lines near the edges, so the four-point surfaces will not match as well.' },
            { q: 'Why does it look like a real photo?', a: 'Patterns come from photographs of real materials cut differently per tile, and the original lighting colour and shadows are multiplied back in, with corner occlusion, bevels, grout texture and glossy reflections. Real product colours still differ, so check samples.' },
            { q: 'Which grout colour is common?', a: 'White grout on light tiles hides joints and makes rooms feel larger; grey or charcoal hides stains and outlines each tile. Floors often use grout one or two shades darker than the tile.' },
            { q: 'How are tiles counted?', a: 'Pieces actually laid on the surface are counted, cut edge pieces included, then 5% spare is added and boxes are based on 1.44 m² per box.' },
          ],
        },
};
