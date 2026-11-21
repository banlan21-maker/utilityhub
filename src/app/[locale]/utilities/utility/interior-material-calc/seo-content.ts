// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '타일 박스 수와 도배지 롤 수, 현장 방식대로 계산하기',
          description: '타일과 도배지는 면적을 자재 크기로 나누기만 하면 모자랍니다. 벽 끝과 모서리에서 잘려 나가는 장, 엇갈려 붙일 때 줄마다 끝에 한 장씩 더 들어가는 장, 폭을 자르고 남는 자투리가 있기 때문입니다. 이 계산기는 타일을 실제로 깔아 보듯 줄마다 장수를 세어 잘라 붙이는 장까지 넣고, 반장·1/3 엇갈림, 대각선(마름모) 시공, 줄눈 간격, 문·창 자리를 반영해 필요한 장수와 박스 수를 냅니다. 예를 들어 600×600 타일을 줄눈 2mm로 1.8m × 2.4m 바닥에 반장 엇갈림으로 붙이면 14장이 필요하고, 여유 5%를 더하면 15장, 4장들이 4박스입니다. 욕실은 가로·세로·타일 높이로 벽 4면을 펼쳐 계산하고, 박스당 장수를 모르면 1박스 1.44㎡ 기준으로 셉니다. 도배지는 방 둘레를 벽지 폭(실크 106cm, 광폭 합지 93cm, 소폭 합지 53cm)으로 나눠 폭 수를 정하고, 층고에 재단 여유 10cm를 더한 길이(무늬가 있으면 반복 길이의 배수)로 롤마다 몇 폭이 나오는지 실제로 잘라 담아 롤 수를 셉니다. 천장 포함 여부와 문 폭 차감도 고를 수 있고, 집 전체는 아파트 분양평수 × 2.5(실평수 × 3)로 빠르게 어림할 수 있어 32평 아파트 실크벽지는 여유 5%를 포함해 약 17롤입니다.',
          useCases: [
            { icon: '🛁', title: '욕실 벽·바닥 타일 주문', desc: '욕실 가로 2.0m, 세로 1.6m, 타일 높이 2.3m에 문 0.8×2.0m를 넣으면 벽 4면을 펼친 배치도와 함께 필요한 장수와 박스 수가 나와, 타일 가게에 바로 주문할 수 있습니다.' },
            { icon: '🧱', title: '대형 타일 엇갈림 시공', desc: '600×1200 같은 대형 타일은 휨 때문에 1/3 엇갈림으로 붙이는 경우가 많습니다. 엇갈림 방식별로 줄 끝에서 늘어나는 장수와 잘리는 장을 배치도에서 빨간색으로 확인합니다.' },
            { icon: '🖼', title: '방별 도배지 롤 수', desc: '방 가로·세로·층고와 문·창 크기를 넣으면 벽 폭 수, 천장 폭 수, 1롤에서 나오는 폭 수와 롤별 재단 계획이 나와, 실크·합지 중 무엇이 몇 롤 필요한지 바로 비교할 수 있습니다.' },
            { icon: '📋', title: '견적서 자재 수량 확인', desc: '인테리어 견적서의 타일 박스 수나 벽지 롤 수가 적정한지 같은 조건으로 계산해 보고, 결과 복사로 업체와 주고받는 메시지에 붙여 넣을 수 있습니다.' },
          ],
          steps: [
            { step: '타일·도배지 고르기', desc: '위 탭에서 타일 또는 도배지를 고릅니다. 두 탭의 입력값은 따로 유지되므로 욕실 타일과 방 도배를 번갈아 계산할 수 있습니다.' },
            { step: '시공 위치와 치수', desc: '타일은 바닥·벽 한 면, 욕실 벽 4면, 면적만 알 때 중에서 고르고 m 단위로 치수를 넣습니다. 도배는 방 크기(가로·세로·층고)나 집 평수 중에서 고릅니다.' },
            { step: '자재와 시공 방법', desc: '타일 규격·줄눈·붙이는 방법·박스당 장수, 또는 벽지 종류·무늬 반복 길이·천장 포함 여부와 여유분을 고릅니다. 문·창 크기를 넣으면 빠지는 만큼 줄어듭니다.' },
            { step: '결과 확인·복사', desc: '주문할 박스·롤 수와 그 근거(배치 장수, 잘리는 장, 폭 수, 롤별 재단 계획, 로스율)를 확인하고 결과 복사 버튼으로 주문 메모를 만듭니다.' },
          ],
          faqs: [
            { q: '타일 로스율은 몇 %로 잡아야 하나요?', a: '면적만으로 장수를 셀 때는 가장자리 컷을 생각해 정자 시공 5~10%, 엇갈림 10% 안팎, 대각선 15% 이상을 더하는 것이 보통입니다. 이 계산기는 줄마다 실제로 들어가는 장수를 세어 잘리는 장을 이미 넣었으므로, 여기에 파손·보수용 여유 3~5%만 더하면 됩니다.' },
            { q: '엇갈림으로 붙이면 왜 더 필요한가요?', a: '반장 엇갈림은 둘째 줄마다 타일을 반 장 밀어 붙이기 때문에, 그 줄은 양 끝이 모두 잘린 장이 되어 한 장이 더 들어갑니다. 1.8m × 2.4m 바닥에 600각을 붙이면 정자는 12장, 반장 엇갈림은 14장입니다. 1/3 엇갈림은 세 줄 중 두 줄에서 한 장씩 늘어납니다.' },
            { q: '도배지 1롤로 몇 평을 바를 수 있나요?', a: '실크벽지(106cm × 15.6m)와 광폭 합지(93cm × 17.75m)는 약 16.5㎡로 5평, 소폭 합지(53cm × 12.5m)는 약 6.6㎡로 2평입니다. 다만 실제로는 폭을 층고에 맞춰 잘라 쓰고 남는 자투리가 생기므로, 층고 2.3m 방이라면 실크 1롤에서 벽 폭 6장이 나와 약 4평 남짓을 바르게 됩니다.' },
            { q: '무늬 있는 벽지는 얼마나 더 드나요?', a: '무늬를 옆 폭과 맞추려면 한 폭을 무늬 반복 길이의 배수로 잘라야 합니다. 층고 2.3m에 재단 여유를 더하면 한 폭이 2.4m지만, 반복 53cm 무늬라면 2.65m(53cm × 5)씩 잘라야 해 실크 1롤에서 나오는 벽 폭이 6장에서 5장으로 줄어, 같은 방도 롤이 약 20% 더 듭니다.' },
          ],
        },
  en: {
          title: 'Tile boxes and wallpaper rolls, counted the installer’s way',
          description: 'Dividing an area by the size of a tile or a roll always comes up short, because tiles are cut at every edge, offset layouts add a tile to the end of each shifted row, and wallpaper strips leave offcuts. This calculator lays tiles out row by row, counting cut pieces, half and one-third offsets, diagonal layouts, grout joints and openings, then rounds up to whole boxes. For example, 600×600 tiles with a 2 mm joint on a 1.8 m × 2.4 m floor in a half-offset layout need 14 pieces, 15 with 5% spare, or 4 boxes of 4. Bathrooms are calculated by unfolding all four walls from width, depth and tile height, and boxes default to 1.44 m² if you do not know the count. For wallpaper the room perimeter is divided by the roll width to get strips, each strip is the ceiling height plus 10 cm (rounded to the pattern repeat), and strips are packed into rolls to count exactly how many rolls you need, with or without the ceiling. A whole Korean apartment can also be estimated from its size: supply area × 2.5 gives the wall and ceiling area, so a 32-pyeong flat needs about 17 rolls of silk wallpaper including 5% spare.',
          useCases: [
            { icon: '🛁', title: 'Bathroom Tiles', desc: 'Enter room width, depth, tile height and the door to get an unfolded wall layout, piece count and boxes to order.' },
            { icon: '🧱', title: 'Large-Format Offsets', desc: 'See how half and one-third offsets add pieces at row ends, with cut tiles shown in red.' },
            { icon: '🖼', title: 'Wallpaper per Room', desc: 'Get wall and ceiling strips, strips per roll and a cutting plan for each roll.' },
            { icon: '📋', title: 'Check a Quote', desc: 'Recalculate the boxes or rolls on a renovation quote and copy the result into a message.' },
          ],
          steps: [
            { step: 'Pick Tiles or Wallpaper', desc: 'Each tab keeps its own inputs, so you can switch freely.' },
            { step: 'Enter the Space', desc: 'Choose a floor or single wall, four bathroom walls or area only for tiles; room size or flat size for wallpaper.' },
            { step: 'Choose Materials', desc: 'Set tile size, joint, layout and pieces per box, or wallpaper type, pattern repeat, ceiling and spare.' },
            { step: 'Read and Copy', desc: 'Check boxes or rolls and the reasoning behind them, then copy an order note.' },
          ],
          faqs: [
            { q: 'What waste allowance should I use for tiles?', a: 'When counting by area, installers add about 5–10% for straight layouts, around 10% for offsets and 15% or more for diagonals. This calculator already counts cut pieces row by row, so only 3–5% spare for breakage is needed on top.' },
            { q: 'Why do offset layouts need more tiles?', a: 'Every shifted row starts and ends with a cut tile, adding one piece per row. A 1.8 m × 2.4 m floor in 600×600 tiles needs 12 pieces straight but 14 with a half offset.' },
            { q: 'How much does one roll of wallpaper cover?', a: 'Korean silk (1.06 m × 15.6 m) and wide paper rolls cover about 16.5 m², narrow rolls about 6.6 m². With a 2.3 m ceiling you get six wall strips per silk roll, so real coverage is lower.' },
            { q: 'How much extra for patterned wallpaper?', a: 'Strips must be cut to a multiple of the pattern repeat so neighbouring strips line up, which lowers strips per roll as rooms get bigger.' },
          ],
        },
};
