// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '전선 굵기 계산기는 어떻게 굵기를 정하나요?',
          description: '전선 굵기는 세 가지 조건을 모두 만족해야 합니다. 첫째, 부하전류보다 큰 차단기를 고르고 그 차단기 정격보다 전선의 허용전류가 커야 합니다(KEC 212.4.1, IB ≤ In ≤ IZ). 허용전류는 KEC가 준용하는 KS C IEC 60364-5-52 부속서 B 표에서 전선 절연(PVC 70°C, XLPE 90°C)과 공사방법(A1 단열벽 속 전선관, B1 전선관 속 전선, B2 전선관 속 케이블, C 직접 고정, E 트레이)에 따라 찾고, 주위온도와 같은 경로의 회로 수로 보정합니다. 둘째, 인입구에서 기기까지 전압강하가 KEC 232.3.9 한도(저압 수전 조명 3%·기타 5%, 고압 이상 수전 조명 6%·기타 8%)를 넘지 않아야 합니다. 셋째, 저압 옥내배선은 2.5㎟ 이상이어야 합니다. 이 계산기는 세 조건 중 가장 큰 굵기를 권장값으로 보여주고, 어떤 조건이 결정했는지 막대로 비교합니다. 예를 들어 단상 220V 25A 에어컨 회로를 HFIX 전선관(B1)으로 15m 배선할 때, 관에 이 회로만 있고 주위 30°C면 2.5㎟로 충분하지만, 같은 관에 3회로가 들어가고 주위가 35°C면 차단기 30A를 견디는 허용전류 기준으로 6㎟가 필요합니다.',
          useCases: [
            { icon: '❄️', title: '에어컨·전열기 전용회로', desc: '25A 에어컨 회로도 같은 전선관에 3회로가 들어가고 천장 속이 35°C라면 허용전류가 0.67배로 줄어 2.5㎟ 대신 6㎟가 필요합니다. 회로 수 보정을 놓치기 쉬운 경우를 바로 확인할 수 있습니다.' },
            { icon: '🏭', title: '동력 간선 트레이 배선', desc: '삼상 380V 100A 동력 간선을 CV 케이블로 트레이(E)에 4회로 포설하고 주위 40°C인 기계실이라면, 온도·회로 수 보정을 반영해 35㎟와 차단기 100A 조합이 맞는지 검토합니다.' },
            { icon: '📏', title: '긴 배선의 전압강하 검토', desc: '창고·주차장처럼 배선이 100m를 넘으면 허용전류보다 전압강하가 굵기를 결정하는 경우가 많습니다. KEC 100m 초과 가산(1m당 0.005%, 최대 0.5%)까지 반영합니다.' },
            { icon: '🔍', title: '기존 배선·차단기 적정성 점검', desc: '이미 설치된 차단기 정격이 전선 허용전류보다 큰지 IB ≤ In ≤ IZ 사슬 그림으로 확인해, 과부하 시 전선이 먼저 과열될 위험이 있는 회로를 찾아낼 수 있습니다.' },
          ],
          steps: [
            { step: '전원과 부하 입력', desc: '전기 방식(단상·삼상)을 고르고 부하전류(A)나 용량(kW)과 역률을 입력합니다. 분전반에서 부하까지의 편도 배선 길이(m)도 넣습니다. 예시 채우기 버튼으로 에어컨 회로 예를 불러올 수 있습니다.' },
            { step: '전선과 공사방법 선택', desc: 'HFIX 전선, CV·F-CV 케이블, PVC 계열 중 실제 쓰는 전선을 고르고 그림을 보며 공사방법(A1·B1·B2·C·E)을 선택합니다. 주위온도와 같은 관·트레이를 쓰는 회로 수도 입력합니다.' },
            { step: '전압강하 한도 확인', desc: '저압 수전인지 고압 이상 수전인지, 조명인지 동력·콘센트인지 선택하면 KEC 한도가 자동으로 들어갑니다. 간선과 한도를 나눠 쓴다면 이 회로에 배정할 몫만 직접 입력하세요.' },
            { step: '결과와 보호 협조 확인', desc: '권장 굵기와 결정 근거, 부하전류 ≤ 차단기 ≤ 전선 허용전류 사슬, 기준별 필요 굵기 막대, 실제 전압강하율을 확인하고 결과를 복사해 공유합니다.' },
          ],
          faqs: [
            { q: '전압강하 기준이 "간선 2%, 분기 2%" 아닌가요?', a: '그 값은 KEC 시행 전 내선규정의 기준입니다. 현행 KEC 232.3.9는 수용가 설비의 인입구에서 기기까지 전체 전압강하를 저압 수전 시 조명 3%·기타 5%, 고압 이상 수전 시 조명 6%·기타 8% 이하로 정하고, 배선이 100m를 넘으면 초과 1m당 0.005%(최대 0.5%)를 더할 수 있게 합니다.' },
            { q: '왜 같은 전류인데 공사방법에 따라 굵기가 달라지나요?', a: '전선이 열을 얼마나 잘 내보내는지가 다르기 때문입니다. 같은 XLPE 2.5㎟ 전선도 3상 부하 기준으로 단열벽 속 전선관(A1)은 23A, 전선관(B1)은 28A, 벽에 직접 고정(C)은 30A까지 흘릴 수 있습니다. 주위온도가 40°C로 오르면 XLPE는 0.91배, 같은 관에 2회로가 들어가면 0.8배로 더 줄어듭니다.' },
            { q: '차단기와 전선 굵기는 어떻게 맞추나요?', a: 'KEC 212.4.1에 따라 부하전류 IB ≤ 차단기 정격 In ≤ 전선 허용전류 IZ가 되어야 합니다. 이 계산기는 부하전류 이상인 표준 차단기 정격(15·20·30·40·50A…)을 먼저 고르고, 보정 후 허용전류가 그 정격 이상인 가장 가는 전선을 찾습니다. 전선만 부하에 맞추고 차단기를 크게 달면 과부하 때 전선이 보호되지 않습니다.' },
            { q: 'HFIX와 CV 케이블은 어떻게 다른가요?', a: '둘 다 도체 허용온도 90°C인 가교 절연이라 같은 XLPE 허용전류 표를 씁니다. 다만 HFIX는 시스가 없는 절연전선이라 전선관이나 몰드 안(A1·B1)에만 시설할 수 있고, CV·F-CV는 시스가 있는 케이블이라 직접 고정(C)이나 트레이(E)에도 시설할 수 있습니다. PVC 계열(NR·VCT)은 70°C 기준이라 허용전류가 더 낮습니다.' },
          ],
        },
  en: {
          title: 'How this wire size calculator picks a wire gauge',
          description: 'In US NEC mode, the calculator starts from the load current — multiplied by 125% for continuous loads that run three hours or more (NEC 210.19 and 210.20) — and picks the next standard breaker from NEC 240.6(A). It then finds the smallest copper conductor whose ampacity covers that breaker: the NEC Table 310.16 90 °C value for THHN/THWN-2 is corrected for ambient temperature (310.15(B)(1)) and for more than three current-carrying conductors in a raceway (310.15(C)(1)), and the result is capped at the 60 °C or 75 °C column of the terminals (110.14(C)), or at the 60 °C column for NM-B cable (334.80). The small-conductor rule (240.4(D)) still limits 14, 12 and 10 AWG to 15, 20 and 30 A breakers. Finally the voltage drop is checked with VD = 2·K·I·L/CM for single-phase or 1.732·K·I·L/CM for three-phase, K = 12.9, against the 3% branch-circuit recommendation. For example, a 20 A, 120 V circuit 100 feet long passes on ampacity with 12 AWG, but 12 AWG drops 6.6%, so 8 AWG is needed to stay under 3%. In IEC/KEC mode the same logic uses mm² conductors: A conductor must pass three checks. First, pick a breaker at or above the load current, and the cable ampacity must be at least the breaker rating (KEC 212.4.1, IB ≤ In ≤ IZ). Ampacity comes from the IEC 60364-5-52 Annex B tables that the Korean Electrical Code adopts, by insulation (PVC 70 °C, XLPE 90 °C) and installation method (A1 conduit in insulated wall, B1 wires in conduit, B2 cable in conduit, C clipped direct, E perforated tray), then corrected for ambient temperature and the number of circuits sharing the route. Second, the voltage drop from the origin to the equipment must stay within KEC 232.3.9 (LV supply: lighting 3 %, other 5 %; HV supply: 6 % and 8 %). Third, indoor LV wiring must be at least 2.5 mm². The calculator recommends the largest size required by the three checks and shows which one governed. For example, a 25 A single-phase 220 V air-conditioner circuit in HFIX wire in conduit (B1), 15 m long, is fine at 2.5 mm² alone at 30 °C, but with three circuits in the conduit at 35 °C it needs 6 mm² to carry the ampacity required by a 30 A breaker.',
          useCases: [
            { icon: '🔌', title: 'Long Branch Circuits', desc: 'A 20 A, 120 V receptacle circuit to a detached garage 100 ft away needs 8 AWG to keep voltage drop under 3%, even though 12 AWG carries the current. The calculator shows which check governs.' },
            { icon: '❄️', title: 'Conduits With Many Circuits', desc: 'Nine current-carrying conductors in one conduit at 104 °F cut 12 AWG THHN to about 19 A, below a 20 A breaker, so 10 AWG is required — easy to miss without the adjustment table.' },
            { icon: '📏', title: 'Long Runs and Voltage Drop', desc: 'On runs over 100 m, voltage drop often decides the size. The calculator applies the KEC allowance of 0.005 % per metre beyond 100 m, up to 0.5 %.' },
            { icon: '🔍', title: 'Auditing Existing Circuits', desc: 'Use the IB ≤ In ≤ IZ chain to spot circuits where the installed breaker is larger than the cable ampacity, so the cable would overheat before the breaker trips.' },
          ],
          steps: [
            { step: 'Enter Supply and Load', desc: 'Choose the system (single or three phase), enter load current or kW with power factor, and the one-way cable length from the panel to the load. The example button loads an A/C circuit.' },
            { step: 'Choose Wire and Method', desc: 'Pick HFIX wire, CV/F-CV cable or PVC types, then the installation method from the pictures. Enter ambient temperature and how many circuits share the conduit or tray.' },
            { step: 'Set the Drop Limit', desc: 'Select LV or HV supply and lighting or other loads to fill in the KEC limit. If the feeder uses part of the budget, enter only this circuit\'s share.' },
            { step: 'Read the Result', desc: 'See the recommended size and what governed it, the load ≤ breaker ≤ ampacity chain, a bar comparison of each check and the actual voltage drop, then copy the result.' },
          ],
          faqs: [
            { q: 'What size wire do I need for a 20, 30, 40 or 50 amp breaker?', a: 'With copper conductors and 75 °C terminations under NEC Table 310.16 and 240.4(D): 20 A needs 12 AWG, 30 A needs 10 AWG, 40 A needs 8 AWG, 50 A needs 8 AWG THHN with 75 °C terminals or 6 AWG with 60 °C terminals or NM-B cable, and 60 A needs 6 AWG (4 AWG for NM-B). Long runs, hot attics or more than three current-carrying conductors in a conduit can require a larger size, which is what this calculator checks.' },
            { q: 'Why does a 12 AWG wire show 30 A in the table but only allow a 20 A breaker?', a: 'Table 310.16 lists 30 A for 12 AWG THHN in the 90 °C column, but NEC 240.4(D) limits 12 AWG copper to a 20 A overcurrent device, and most terminals are rated 75 °C (25 A). The 90 °C value is useful only as the starting point for derating.' },
            { q: 'Isn\'t the voltage drop rule 2 % feeder plus 2 % branch?', a: 'That was the old Korean wiring code before KEC. KEC 232.3.9 limits the total drop from the origin to the equipment to 3 % for lighting and 5 % for other loads on an LV supply, or 6 % and 8 % on an HV supply, plus 0.005 % per metre beyond 100 m (max 0.5 %).' },
            { q: 'Why does the installation method change the size?', a: 'Heat escapes differently. A 2.5 mm² XLPE conductor with three loaded conductors carries 23 A in conduit in an insulated wall (A1), 28 A in conduit (B1) and 30 A clipped direct (C). At 40 °C it drops by 0.91, and two circuits together reduce it by a further 0.8.' },
            { q: 'How are the breaker and cable matched?', a: 'KEC 212.4.1 requires IB ≤ In ≤ IZ. The calculator picks the standard breaker at or above the load (15, 20, 30, 40, 50 A…) and then the smallest cable whose corrected ampacity is at least that rating. Sizing the cable to the load but fitting a bigger breaker leaves the cable unprotected.' },
            { q: 'What is the difference between HFIX and CV?', a: 'Both use 90 °C cross-linked insulation, so they share the XLPE table. HFIX is an unsheathed wire that must run in conduit (A1, B1), while CV/F-CV are sheathed cables that can also be clipped direct (C) or laid on tray (E). PVC types (NR, VCT) are rated 70 °C and carry less current.' },
          ],
        },
};
