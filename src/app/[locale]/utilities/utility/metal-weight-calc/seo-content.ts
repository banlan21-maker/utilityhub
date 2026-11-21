// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '금속 중량 계산기: H빔·찬넬·앵글·파이프 kg/m와 도장 면적',
          description: '금속 자재의 중량은 단면적(㎟) × 길이(m) × 밀도(g/㎤) ÷ 1000으로 구합니다. 이 계산기는 환봉·파이프·사각봉·각파이프·육각봉·평철·철판·앵글·찬넬·H빔·T형강·무늬강판 12가지 형상의 단면적을 계산해 m당 중량(단위중량), 1개당 중량, 로스를 더한 발주 중량, 도장 면적, 자재비·도장비를 한 번에 보여 줍니다. H형강·ㄷ형강·ㄱ형강은 KS D 3502 규격표처럼 웹과 플랜지가 만나는 안쪽의 둥근 필렛(r)까지 넣어 계산하므로, 규격에서 고르면 표의 단위중량과 맞습니다. 예를 들어 H-200×100×5.5×8(r=11)은 단면적 27.16㎠, 21.32 kg/m이고, 필렛을 빼고 계산하면 20.5 kg/m로 4%가량 가볍게 나옵니다. 각파이프는 KS D 3568의 모서리 반경(외측 2t)을 반영해 □100×100×3.2가 9.52 kg/m, 무늬강판은 같은 두께 평판에 무늬 1.67 kg/㎡를 더해 3.2t가 26.79 kg/㎡입니다. 배관용 SPP·SCH40 강관은 호칭경(15A~200A)으로 고를 수 있습니다. 단면도에서는 지금 입력하는 칸이 어느 부위인지 색으로 표시되어, H빔·찬넬의 t1(웹, 세로판)과 t2(플랜지, 가로판)를 헷갈리지 않고 넣을 수 있습니다.',
          useCases: [
            { icon: '🏗️', title: '철골 자재 발주 중량', desc: 'H-300×150×6.5×9 6m 20본처럼 규격을 고르고 길이·수량을 넣으면 단위중량 36.72 kg/m 기준 순중량과 로스 포함 발주 중량이 나오고, 여러 규격을 바구니에 담아 총 톤수를 확인할 수 있습니다.' },
            { icon: '🎨', title: '도장 물량 산출', desc: '형강은 겉으로 드러나는 둘레 전체, 파이프·각파이프는 바깥면, 철판은 양면 또는 한 면을 골라 도장 면적(㎡)을 계산하고, ㎡당 단가를 넣으면 도장비까지 함께 산출합니다.' },
            { icon: '🔧', title: '배관 자재 무게', desc: 'SPP 50A(Ø60.5×3.8)는 5.31 kg/m, SCH40 100A(Ø114.3×6.0)처럼 호칭경으로 고르면 외경·두께가 자동으로 들어가 운반·양중 계획이나 지지대 하중 검토에 쓸 무게를 바로 확인합니다.' },
            { icon: '⚙️', title: '가공품·특수 재질', desc: '스테인리스·알루미늄·황동·티타늄 등 19가지 재질 밀도를 고르거나, 인바 같은 특수 합금 밀도를 직접 저장해 가공 소재의 무게와 kg당 자재비를 계산합니다.' },
          ],
          steps: [
            { step: '형상 고르기', desc: '환봉, 파이프, 각파이프, 앵글, 찬넬, H빔, T형강, 철판 등 12가지 중 계산할 형상을 누릅니다. 오른쪽 단면도에 예시 치수와 각 기호의 위치가 바로 표시됩니다.' },
            { step: '치수 넣기', desc: 'KS 규격 목록에서 고르면 필렛까지 자동으로 채워지고, 직접 넣을 때는 입력 중인 칸의 부위(예: t1 웹, t2 플랜지)가 단면도에서 색으로 강조됩니다. 길이(m)·수량·로스(%)도 넣습니다.' },
            { step: '재질·단가 선택', desc: '재질을 고르고 필요하면 kg당 자재 단가와 ㎡당 도장 단가를 넣습니다. 목록에 없는 재질은 이름과 밀도를 저장해 다음에도 쓸 수 있습니다.' },
            { step: '결과 확인·발주 내역', desc: 'm당 중량, 1개당 중량, 발주 중량, 도장 면적, 금액을 확인하고 견적 바구니에 담습니다. 담은 내역은 브라우저에 저장되며 복사 버튼으로 메신저에 붙여 넣을 수 있습니다.' },
          ],
          faqs: [
            { q: 'H빔·찬넬에서 t1과 t2는 각각 어디인가요?', a: 't1은 웹, 곧 H빔 가운데에 세로로 선 판(찬넬은 세로 등판)의 두께이고, t2는 플랜지, 곧 위·아래 가로판(찬넬은 날개)의 두께입니다. 규격 표기 H-200×100×5.5×8은 높이 H 200, 폭 B 100, 웹 t1 5.5, 플랜지 t2 8mm라는 뜻입니다. 두 값을 바꿔 넣으면 무게가 크게 달라지므로, 입력할 때 단면도에서 강조되는 부위를 확인하세요.' },
            { q: '필렛(r)은 왜 넣어야 하나요?', a: '압연 형강은 웹과 플랜지가 만나는 안쪽이 둥글게 살이 붙어 있어, 단순히 판 세 장의 넓이만 더하면 규격표보다 1~4% 가볍게 나옵니다. KS 규격에서 고르면 r이 자동으로 들어가며, H-100×100×6×8(r=10)은 단면적 21.90㎠로 규격표와 같아집니다. 판을 용접해 만든 조립 형강이면 r을 비워 두면 됩니다.' },
            { q: '각파이프는 모서리를 어떻게 계산하나요?', a: 'KS D 3568 일반구조용 각형강관의 단위질량 식 0.0157 × t × (A + B − 3.287t)는 모서리 바깥 반경을 두께의 2배로 본 값입니다. 이 계산기도 모서리 R을 비우면 2t로 계산해 □100×100×3.2가 9.52 kg/m로 나오고, 모서리를 직각으로 보면 9.73 kg/m로 약 2% 무겁게 나옵니다.' },
            { q: '도장 면적은 어느 면을 기준으로 하나요?', a: '형강과 봉재는 단면 둘레 전체(H빔은 4B + 2H − 2t1), 파이프와 각파이프는 바깥면만 계산하고 안쪽은 빼며, 철판·무늬강판은 양면 또는 한 면을 고를 수 있고 절단면은 넣지 않습니다. 실제 도장 방식에 따라 차이가 있으니 견적용 참고값으로 쓰세요.' },
          ],
        },
  en: {
          title: 'Metal weight calculator: kg/m and paint area for steel sections',
          description: 'Metal weight is section area (mm²) × length (m) × density (g/cm³) ÷ 1000. This calculator works out the section area of 12 shapes — round bar, pipe, square bar, square tube, hex bar, flat bar, plate, angle, channel, H-beam, T-section and checkered plate — and shows weight per metre, weight per piece, order weight with a waste allowance, paint area and cost. H-beams, channels and angles include the root fillet radius exactly as in the KS D 3502 / JIS G 3192 tables, so picking a standard size reproduces the published weight: H-200×100×5.5×8 (r = 11) has 27.16 cm² and weighs 21.32 kg/m, whereas ignoring the fillet gives about 20.5 kg/m. Square tubes follow the KS D 3568 corner radius (2t outside), giving 9.52 kg/m for □100×100×3.2, and checkered plate adds 1.67 kg/m² of raised pattern for steel. SPP and SCH40 pipes can be picked by nominal size from 15A to 200A. The cross-section highlights the part you are typing — for example the web (t1) or the flange (t2) — so the two thicknesses are never swapped.',
          useCases: [
            { icon: '🏗️', title: 'Steel Order Weights', desc: 'Pick H-300×150×6.5×9, enter 6 m × 20 pieces and get net and order weight from 36.72 kg/m, then add more sizes to the list for a total tonnage.' },
            { icon: '🎨', title: 'Paint Quantities', desc: 'Exposed perimeter for sections, outside only for tubes, and one or both faces for plate; add a price per m² to get the painting cost.' },
            { icon: '🔧', title: 'Pipe Weights', desc: 'Choose SPP 50A (Ø60.5×3.8, 5.31 kg/m) or SCH40 sizes by nominal bore for lifting plans and support loads.' },
            { icon: '⚙️', title: 'Other Materials', desc: 'Switch between 19 densities such as stainless, aluminium, brass and titanium, or save your own alloy.' },
          ],
          steps: [
            { step: 'Choose a Shape', desc: 'Tap one of 12 shapes; the cross-section shows an example size and where each symbol sits.' },
            { step: 'Enter Dimensions', desc: 'Pick a KS size to fill everything including fillets, or type values while the diagram highlights the part you are editing.' },
            { step: 'Material and Price', desc: 'Select a material and optionally enter prices per kg and per m² of paint.' },
            { step: 'Review and Save', desc: 'Check weight per metre, per piece, order weight, paint area and cost, then add the item to the order list and copy it.' },
          ],
          faqs: [
            { q: 'Which part is t1 and which is t2?', a: 't1 is the web, the vertical centre plate of an H-beam or the back of a channel; t2 is the flange, the top and bottom plates. H-200×100×5.5×8 means depth 200, width 100, web 5.5 and flange 8 mm. Swapping them changes the weight a lot, so watch the highlighted part in the diagram.' },
            { q: 'Why include the fillet radius?', a: 'Rolled sections have extra material where the web meets the flange. Without it the result is 1–4% lighter than the standard table; with it, H-100×100×6×8 (r = 10) gives 21.90 cm² exactly. Leave r blank for welded built-up sections.' },
            { q: 'How are square tube corners handled?', a: 'The KS D 3568 formula 0.0157 × t × (A + B − 3.287t) assumes an outside corner radius of 2t. Leaving R blank uses that, so □100×100×3.2 weighs 9.52 kg/m instead of 9.73 kg/m with sharp corners.' },
            { q: 'Which faces count as paint area?', a: 'The full perimeter for bars and sections, the outside only for pipes and tubes, and one or both faces for plates, excluding cut edges. Treat it as an estimate.' },
          ],
        },
};
