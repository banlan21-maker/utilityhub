// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '배관 규격표·구배·수압 물량·유속을 한 번에',
          description: '배관 종합 계산기는 현장에서 자주 찾는 강관 규격과 계산을 한곳에 모았습니다. 일반배관용 SPP(KS D 3507), 압력배관용 SPPS(KS D 3562) Sch40·80, 배관용 스테인리스 STS(KS D 3576) Sch5S·10S·20S·40·80, 얇은 스테인리스 Su관(KS D 3595), 미국 규격 ASME B36.10 강관, 동관 ASTM B88 Type K·L·M, PVC 압력관 ASTM D1785 Sch40·80의 외경·두께·내경·m당 중량·1m당 물 용량을 호칭별로 보여 줍니다. 예를 들어 SPP 50A는 외경 60.5mm, 두께 3.8mm, 내경 52.9mm, 5.31 kg/m이고, 같은 50A라도 ASME는 외경이 60.3mm로 다릅니다. 배수 구배 탭에서는 관경을 고르면 기계설비 기술기준 매뉴얼의 오·배수 수평관 최소 구배(65A 이하 1/50, 80~150A 1/100, 200A 이상 1/200)나 미국 IPC 기준과 비교해 판정하고, 길이와 구배로 단차를, 길이와 단차로 구배를 계산합니다. 수압 테스트 탭은 관경이 섞인 배관을 줄마다 넣어 필요한 물(L·㎥·톤)과 물차 규모를 계산하며, 유량·유속 탭은 유량을 넣으면 관경별 유속과 Hazen-Williams 마찰 손실(kPa/100m)을 보여 주고 허용 유속 이하가 되는 가장 작은 관을 골라 줍니다. 미국 단위(inch·lb·gal·GPM·ft/s)로 바꿔 볼 수도 있습니다.',
          useCases: [
            { icon: '🔧', title: '현장 규격표 대신', desc: 'SPP 100A는 외경 114.3mm·두께 4.5mm·12.2 kg/m, SPPS Sch40은 두께 6.0mm처럼 관 종류와 스케줄별 치수를 바로 확인하고, 규격표 전체를 표로 보며 부속·용접 작업을 준비합니다.' },
            { icon: '📐', title: '배수관 구배 시공', desc: '100A 배수관 15m를 1/100으로 놓으면 끝점이 150mm 낮아야 하고, 50A라면 최소 1/50이라 300mm가 필요하다는 것을 관경별 기준과 함께 바로 확인합니다.' },
            { icon: '💧', title: '수압 테스트 물 준비', desc: 'SPPS 100A 50m와 SPP 50A 120m처럼 관경별로 길이를 넣으면 순 물량 약 675L, 여유 10% 포함 약 0.74톤으로 계산되어 물차를 부를지, 수돗물로 채울지 정할 수 있습니다.' },
            { icon: '🚿', title: '급수 관경·마찰 손실', desc: '유량 100 L/min을 SPP로 보내면 25A는 유속 2.79 m/s, 32A는 1.66 m/s입니다. 허용 유속을 고르면 기준 이하가 되는 가장 작은 관경과 100m당 마찰 손실을 표와 함께 알려 줍니다.' },
          ],
          steps: [
            { step: '단위·탭 고르기', desc: '미터법 또는 미국 단위를 고르고, 규격 조회·배수 구배·수압 물량·유량·유속 중 필요한 계산을 고릅니다. 탭마다 입력값이 따로 유지됩니다.' },
            { step: '관 종류·호칭 선택', desc: 'SPP, SPPS, 스테인리스 STS·Su, ASME, 동관, PVC 중 관 종류와 호칭, 스케줄(또는 동관 타입)을 고릅니다. 해당 규격에 없는 호칭·스케줄은 눌리지 않습니다.' },
            { step: '길이·구배·유량 입력', desc: '구배는 기준(한국·미국 IPC)과 관경, 길이, 구배(또는 단차)를, 수압 물량은 관경별 길이를, 유속은 유량(L/min·㎥/h·GPM)과 허용 유속, Hazen-Williams 계수를 넣습니다.' },
            { step: '결과 확인·복사', desc: '내경·중량, 단차와 기준 판정, 물량과 물차 규모, 관경별 유속과 마찰 손실을 확인하고 결과 복사로 작업 메모나 보고에 붙여 넣습니다.' },
          ],
          faqs: [
            { q: 'SPP와 SPPS, Sch40은 무엇이 다른가요?', a: 'SPP(KS D 3507)는 급수·소화·공조 등 비교적 낮은 압력용 일반배관 강관으로 호칭마다 두께가 하나뿐입니다. SPPS(KS D 3562)는 압력배관용으로 Sch40, Sch80처럼 스케줄에 따라 두께가 정해집니다. 예를 들어 50A는 SPP 3.8mm, SPPS Sch40 3.9mm, Sch80 5.5mm입니다.' },
            { q: '같은 호칭인데 KS와 ASME 외경이 왜 다른가요?', a: 'KS(JIS) 강관은 15A 21.7mm, 150A 165.2mm처럼 외경을 정하고, 미국 ASME B36.10은 1/2인치 21.3mm, 6인치 168.3mm로 정합니다. 호칭은 같아도 외경이 달라 용접 부속이나 플랜지를 섞어 쓰면 맞지 않을 수 있으니 같은 규격끼리 맞춰야 합니다.' },
            { q: '스테인리스 Sch10S와 Sch40은 얼마나 다른가요?', a: 'KS D 3576 기준 25A는 Sch5S 1.65mm, Sch10S 2.8mm, Sch20S 3.0mm, Sch40 3.4mm입니다. 건물 급수·급탕에는 더 얇은 Su관(KS D 3595, 예: 20Su 외경 22.22mm, 두께 1.0mm)을 많이 쓰고, 공장·플랜트 배관에는 Sch10S 이상을 주로 씁니다.' },
            { q: '배수관 최소 구배는 관경에 따라 어떻게 정해지나요?', a: '기계설비 기술기준 매뉴얼은 건물 안 오·배수 수평관의 최소 구배를 65A 이하 1/50, 80~150A 1/100, 200A 이상 1/200으로 둡니다. 관이 가늘수록 물이 얕게 흘러 오물을 밀어내기 어려우므로 더 큰 구배가 필요합니다. 미국 IPC는 2-1/2인치 이하 1/4인치/피트(약 1/48)로 조금 더 엄격합니다.' },
            { q: '마찰 손실은 어떻게 계산하나요?', a: '상온 물의 직관 마찰 손실을 Hazen-Williams 식으로 계산합니다. 계수 C는 새 강관 120, 스테인리스 140, 동관·PVC 150이 기본이고 오래된 강관은 100 정도로 낮춰 봅니다. 엘보·티·밸브 손실은 상당 길이로 더해야 하며, 펌프 양정 계산에는 높이 차와 기기 손실도 함께 넣어야 합니다.' },
          ],
        },
  en: {
          title: 'Pipe size chart, drain slope, hydro-test volume and pipe sizing',
          description: 'This piping calculator puts the tables and quick calculations plumbers, pipefitters and engineers reach for every day in one place, in US or metric units. Look up outside diameter, wall thickness, inside diameter, weight per foot and water capacity per foot for steel pipe to ASME B36.10 (Sch10, STD, Sch40, XS, Sch80, 1/2" to 12" NPS), copper tube to ASTM B88 (Type K, L and M, 1/4" to 8"), PVC pressure pipe to ASTM D1785 (Sch40 and Sch80), and Korean/JIS steel and stainless pipe. For example, 2" Sch40 steel is 2.375" OD with a 0.154" wall, a 2.067" bore and 3.65 lb/ft, while 3/4" Type L copper is 0.875" OD, 0.785" ID and 0.455 lb/ft. The drain slope tab checks a horizontal drain against International Plumbing Code Table 704.1 — 1/4 inch per foot for 2-1/2" and smaller, 1/8 inch per foot for 3" to 6" and 1/16 inch per foot for 8" and larger — and converts between slope and total drop over a run. The hydro-test tab adds up water for runs of mixed sizes in US gallons, litres and cubic feet. The flow tab shows velocity and Hazen-Williams friction loss in psi per 100 ft for every size at a given GPM, and picks the smallest pipe that stays under your velocity limit.',
          useCases: [
            { icon: '🔧', title: 'Replace the Pocket Pipe Chart', desc: 'Check OD, wall, ID and lb/ft for any schedule or copper type, with the whole table on screen — handy when ordering fittings, estimating hanger loads or checking a submittal.' },
            { icon: '📐', title: 'Set Drain Slope', desc: 'A 40 ft run of 3" drain at 1/8 inch per foot needs 5 inches of fall; switch to 2" and the IPC minimum doubles to 1/4 inch per foot, or 10 inches over the same run.' },
            { icon: '💧', title: 'Plan a Hydrostatic Test', desc: 'Enter 150 ft of 4" Sch40 and 400 ft of 2" Type L copper to get about 180 US gallons including a 10% allowance, so you know whether a hose fill is enough or a water truck is needed.' },
            { icon: '🚿', title: 'Size a Water Line', desc: 'At 25 GPM, 1" Type L copper runs about 9.7 ft/s while 1-1/4" drops to about 6.4 ft/s; choose an 8 ft/s limit and the calculator picks the size and shows friction in psi/100 ft.' },
          ],
          steps: [
            { step: 'Pick Units and a Tab', desc: 'Choose US or metric units, then pipe specs, drain slope, hydro test or flow sizing. Each tab keeps its own inputs, and switching units converts what you typed.' },
            { step: 'Choose the Pipe', desc: 'Select steel (ASME), copper (Type K/L/M), PVC (Sch40/80) or Korean/JIS pipe, then the nominal size and schedule. Sizes that do not exist in that schedule are greyed out.' },
            { step: 'Enter Run Length, Slope or Flow', desc: 'Enter the run length with slope in inches per foot or the drop, the length of each size under test, or the flow in GPM with a velocity limit and Hazen-Williams C.' },
            { step: 'Read and Copy', desc: 'See the dimensions, the code check for slope, the water volume, or velocity and friction for every size, then copy the result into your notes or a report.' },
          ],
          faqs: [
            { q: 'What is the difference between Type K, L and M copper?', a: 'All three have the same outside diameter for a given size (nominal plus 1/8 inch), so they use the same fittings; only the wall differs. Type K is the thickest and is used underground and for high pressure, Type L is the usual choice for interior water supply, and Type M is the thinnest and lightest where codes allow it. For 3/4", the walls are 0.065", 0.045" and 0.032".' },
            { q: 'What slope does a horizontal drain need?', a: 'Under International Plumbing Code Table 704.1, horizontal drainage piping 2-1/2 inches and smaller needs at least 1/4 inch per foot, 3 to 6 inches needs 1/8 inch per foot, and 8 inches and larger needs 1/16 inch per foot. Smaller pipes need more fall because the flow is shallower and must still carry solids. Local amendments and UPC jurisdictions can differ, so confirm with your inspector.' },
            { q: 'How is friction loss calculated?', a: 'The tool uses the Hazen-Williams equation for water near room temperature in straight pipe. Default C values are 120 for new steel, 140 for stainless and 150 for copper and PVC; use about 100 for old steel. Add equivalent lengths for elbows, tees and valves, and include elevation and equipment losses when you size a pump.' },
            { q: 'Is PVC Sch40 the same size as steel Sch40?', a: 'Yes. ASTM D1785 PVC pressure pipe uses the same outside diameters and Schedule 40 and 80 walls as ASME B36.10 steel pipe, so 2" Sch40 PVC is also 2.375" OD with a 0.154" wall. It weighs far less because PVC is about one fifth as dense.' },
            { q: 'Why do Korean/JIS pipe sizes differ from US sizes?', a: 'KS (JIS) steel pipe defines its own outside diameters — DN15 is 21.7 mm and DN150 is 165.2 mm — while ASME B36.10 uses 21.3 mm for 1/2" and 168.3 mm for 6". The nominal sizes match but the pipes and welding fittings are not interchangeable.' },
          ],
        },
};
