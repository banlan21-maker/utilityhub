// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '케이블 트레이 경사·오프셋 가공 계산기란 무엇인가요?',
          description: '전기공사 현장에서 케이블 트레이를 경사 구간(오르막·내리막)이나 옆으로 비키는 오프셋 구간에 맞게 직접 자르고 접을 때 필요한 치수를 계산하는 도구입니다. 높이차 H와 진행 거리 L(또는 30°·45°·60° 각도와 H)을 넣으면 꺾임 각도와 사선 길이를 구하고, 구간을 이루는 꺾임 두 곳 각각에 대해 V-컷인지 일자 절개인지, 중심선에서 한쪽으로 몇 mm를 표시해야 하는지, 두 꺾임 사이 마킹 간격 A가 얼마인지 알려줍니다. 상하 꺾임은 바닥판이 접히는 축이므로 레일이 안쪽으로 접히는 쪽(오르막 시작·내리막 끝)은 V-컷, 바깥으로 벌어지는 쪽은 일자 절개가 됩니다. 좌우 꺾임은 바닥판에 V-컷을 넣고 안쪽 레일을 잘라내며 바깥 레일은 접습니다. 3D 형상으로 평평한 트레이가 실제 각도로 접히는 과정을 돌려 볼 수 있고, 실제 비율 마킹 상세도와 NEMA VE 2 기준 지지점 위치도 함께 제공합니다.',
          useCases: [
            { icon: '✂️', title: '오르막·내리막 구간 가공', desc: '천장 랙에서 장비 쪽으로 0.25m 내려가는 30° 구간처럼 높이가 바뀌는 곳에서 꺾임 두 곳의 V-컷과 일자 절개 위치, 레일 높이 100mm 기준 한쪽 26.8mm 같은 마킹 치수를 바로 구합니다.' },
            { icon: '↔️', title: '기둥·덕트 피하는 오프셋', desc: '같은 높이에서 기둥이나 덕트를 피해 옆으로 비켜야 할 때, 옆 이동 거리와 진행 거리로 각도를 구하고 바닥판 V-컷 폭과 잘라낼 안쪽 레일 길이를 계산합니다.' },
            { icon: '🧊', title: '3D로 접히는 모습 확인', desc: '처음 가공하는 초보자도 어느 쪽을 자르고 어디를 접는지 헷갈리지 않도록, 평평한 상태에서 실제 각도까지 접히는 3D 형상을 손가락으로 돌려 가며 확인할 수 있습니다. V-컷 폭, 레일 높이, 트레이 폭, 현재 꺾임 각도가 각 부위에 함께 표시됩니다.' },
            { icon: '🔩', title: '지지점 위치와 엘보 대안', desc: '꺾임부 양쪽 600mm 이내와 최대 지지 간격을 반영해 사선 구간 지지점 위치를 계산하고, 현장 가공 대신 기성 엘보를 쓸 경우 가장 가까운 규격과 맞춰야 할 진행 거리도 함께 보여줍니다.' },
          ],
          steps: [
            { step: '구간 종류와 규격 선택', desc: '오르막, 내리막, 옆으로 비키기 중 현장 모양과 같은 그림을 고르고 트레이 폭과 측면 레일 높이를 선택합니다. 상하 꺾임은 레일 높이, 좌우 꺾임은 트레이 폭이 가공 기준 치수가 됩니다.' },
            { step: '치수 입력', desc: '각도를 정해 두었다면 30°·45°·60° 중 하나와 높이차(또는 옆 이동 거리)를, 현장에서 실측했다면 H와 L을 입력합니다. 그림처럼 상하는 트레이 바닥, 좌우는 트레이 중심선을 기준으로 잽니다.' },
            { step: '꺾임별 치수와 3D 확인', desc: '꺾임 ①·② 탭을 바꿔 가며 V-컷 한쪽 폭, 전체 폭, 절단 깊이를 확인하고, 3D 형상과 실제 비율 상세도를 보며 중심선에서 양쪽으로 표시합니다. 두 꺾임 사이는 마킹 간격 A만큼 띄웁니다.' },
            { step: '지지점 배치와 결과 공유', desc: '설계도서나 제조사의 최대 지지 간격을 넣으면 사선 구간 지지점 위치가 나옵니다. "전체 결과 복사"로 모든 치수를 복사해 동료나 반장에게 전달하세요.' },
          ],
          faqs: [
            { q: '오르막 구간인데 왜 한쪽은 V-컷이고 한쪽은 일자 절개인가요?', a: '상하 꺾임에서는 바닥판이 접히는 축이 됩니다. 오르막이 시작되는 곳은 레일 윗부분끼리 가까워지므로 겹치는 부분을 V자로 잘라내야 하고, 오르막이 끝나 다시 수평이 되는 곳은 레일 윗부분이 벌어지므로 일자로 절개한 뒤 벌어진 틈을 연결판으로 덮습니다. 내리막은 그 반대입니다.' },
            { q: 'V-컷 치수는 어떻게 계산하나요?', a: 'V-컷 한쪽 폭은 기준 치수 × tan(꺾임 각도 ÷ 2)입니다. 상하 꺾임은 측면 레일 높이, 좌우 꺾임은 트레이 폭이 기준 치수입니다. 예를 들어 레일 높이 100mm에서 30°로 꺾으면 한쪽 26.8mm, 전체 53.6mm를 레일 윗면에 표시하고 바닥판 쪽 한 점까지 V자로 자릅니다.' },
            { q: '볼트 구멍은 어디에 뚫나요?', a: '구멍 위치를 중심선에서 고정 치수로 정하지 않습니다. 꺾은 뒤 각도 조절형 연결판을 절단면에 맞춰 대고, 연결판 구멍을 형판 삼아 표시한 다음 기존 트레이 구멍과 같은 크기로 천공합니다(NEMA VE 2 4.5.3). 절단·천공 부위는 버를 제거하고 아연 보수 도장을 합니다.' },
            { q: '행거(지지) 간격은 어떤 기준인가요?', a: '한국전기설비규정과 표준시방서에는 케이블트레이 지지 간격 수치가 따로 없어 설계도서와 제조사 허용 간격을 따릅니다. 이 계산기는 입력한 최대 간격과, 조절형 연결판 양쪽 600mm 이내에 지지점을 두라는 NEMA VE 2 권장을 함께 반영해 위치를 계산합니다. 기본값 1.5m는 국내 실무 관례값입니다.' },
          ],
        },
  en: {
          title: 'What is the Cable Tray Slope & Offset Fabrication Calculator?',
          description: 'This tool gives electricians the numbers needed to field-cut and bend a channel or ladder cable tray for a slope (rise or drop) or a sideways offset. Enter the rise H and run L, or pick 30°, 45° or 60° with a rise, and it returns the bend angle and slope length, then for each of the two bends in the segment tells you whether it is a V-cut or a straight slit, how far to mark on each side of the centerline, and the marking distance A between the bends. In a vertical bend the bottom is the fold axis, so the bend where the rails close (start of a rise, end of a drop) needs a V-cut and the bend where they open needs a straight slit. In a horizontal bend the bottom gets the V-cut, the inner rail section is removed and the outer rail folds. A rotatable 3D view shows the flat tray folding to the real angle, alongside a true-proportion marking detail and support positions based on NEMA VE 2.',
          useCases: [
            { icon: '✂️', title: 'Rises and Drops', desc: 'For a 30° drop of 0.25 m from a ceiling rack, get where each bend needs a V-cut or a slit and the marks to make, such as 26.8 mm each side of center on a 100 mm rail.' },
            { icon: '↔️', title: 'Offsets Around Columns', desc: 'When the tray must shift sideways around a column or duct at the same level, get the angle from offset and run, the V-cut width in the bottom and the length of inner rail to remove.' },
            { icon: '🧊', title: 'See the Fold in 3D', desc: 'Rotate a 3D model that folds from flat to the real angle, so new installers can see exactly which part is cut away and which part bends before touching the grinder. V-cut width, rail height, tray width and the current bend angle are labelled on the model.' },
            { icon: '🔩', title: 'Supports and Elbow Alternative', desc: 'Get support positions on the slope that respect a maximum span and the 600 mm rule at bend joints, plus the nearest factory elbow size and the run needed if you buy fittings instead.' },
          ],
          steps: [
            { step: 'Pick the Segment and Tray', desc: 'Choose rise, drop or side offset to match the site, then the tray width and side rail height. Rail height is the reference for vertical bends and tray width for horizontal bends.' },
            { step: 'Enter Dimensions', desc: 'Pick 30°, 45° or 60° and enter the rise (or offset), or enter measured H and L. Measure at the tray bottom for vertical bends and at the tray centerline for offsets, as shown in the diagram.' },
            { step: 'Check Each Bend', desc: 'Switch between bend 1 and bend 2 to see half width, full width and cut depth. Use the 3D view and true-proportion detail to mark both sides of the centerline, and space the bends by distance A.' },
            { step: 'Place Supports and Share', desc: 'Enter the maximum span from the design or manufacturer to get support positions on the slope, then copy all results to send to your foreman or crew.' },
          ],
          faqs: [
            { q: 'Why is one bend a V-cut and the other a slit?', a: 'In a vertical bend the tray bottom is the fold axis. Where a rise starts, the top edges of the rails move together, so the overlapping material is removed with a V-cut. Where the rise ends and the tray levels out, the rails spread apart, so they are slit straight and the gap is covered with a splice plate. A drop is the reverse.' },
            { q: 'How is the V-cut size calculated?', a: 'Half width equals the reference dimension times tan(bend angle ÷ 2). The reference is the side rail height for vertical bends and the tray width for horizontal bends. For a 100 mm rail at 30°, mark 26.8 mm each side of center (53.6 mm total) on the rail top and cut down to a point at the bottom.' },
            { q: 'Where do the bolt holes go?', a: 'Not at a fixed distance from the centerline. After bending, clamp the adjustable splice plate against the cut ends, use its holes as a template, and drill to match the existing tray holes (NEMA VE 2, 4.5.3). Deburr and touch up galvanizing on cut edges.' },
            { q: 'What is the support spacing based on?', a: 'Korean codes give no numeric cable tray span, so follow the project and manufacturer specification. The calculator combines your maximum span with the NEMA VE 2 recommendation to place a support within 600 mm of each side of an adjustable splice plate. The 1.5 m default is a common field value.' },
          ],
        },
};
