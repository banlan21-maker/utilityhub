// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '통합 저항기 판독기란 무엇인가요?',
          description: '전기 및 전자 공학에서 저항값은 회로 설계의 가장 기본이 되는 요소입니다. 통합 저항기 판독기는 리드형(띠색) 저항기와 표면 실장형(SMD) 저항기의 복잡한 코드를 실시간 그래픽과 함께 즉시 변환해주는 전문가용 도구입니다. 4색, 5색, 6색 띠 저항 판독은 물론, 3/4자리 및 고정밀 EIA-96 SMD 코드까지 완벽하게 지원하며 100% 클라이언트 사이드에서 작동하여 개인 정보를 안전하게 보호합니다.',
          useCases: [
            { icon: '🏭', title: '부품 분류 및 정리', desc: '부품함에 섞여 있는 저항기들의 색상을 보고 값을 즉시 판별하여 체계적으로 정리할 때 유용합니다.' },
            { icon: '📐', title: '회로 설계 및 검증', desc: '회로 설계 과정에서 필요한 저항값이 실제 어떤 색상 띠를 가지는지 시각적으로 미리 확인해볼 수 있습니다.' },
            { icon: '⚙️', title: 'SMD 수리 작업', desc: '육안으로 확인하기 어려운 작은 SMD 칩의 코드를 입력하여 정확한 스펙을 확인하고 교체 부품을 찾습니다.' },
            { icon: '🎓', title: '공학 교육', desc: '전자공학 입문자들이 저항기 색상 코드 체계를 직관적으로 학습하고 이해하는 데 최적의 도구입니다.' },
          ],
          steps: [
            { step: '판독 모드 선택', desc: '상단 탭에서 [띠색 계산기] 또는 [SMD 코드 판독기] 중 실제 사용하는 저항기 유형에 맞는 방식을 선택합니다.' },
            { step: '데이터 입력', desc: '띠색 모드에서는 4·5·6밴드 중 저항기에 맞는 띠 수를 선택한 후 각 위치의 색상을 드롭다운으로 선택하고, SMD 모드에서는 칩 표면의 숫자/문자 코드를 그대로 텍스트 입력란에 입력합니다.' },
            { step: '그래픽 및 수치 확인', desc: '중앙의 저항기 그래픽이 선택한 색상으로 실시간 업데이트되며, 하단에 최종 저항값(Ω/kΩ/MΩ), 허용 오차(%), 온도 계수(PPM, 6밴드 한정)가 표시됩니다.' },
            { step: '부품 선정 및 대체', desc: '계산된 저항값을 참고해 회로 설계에 적합한 부품을 선정하거나, 손상된 부품 교체 시 동일 사양의 대체품을 찾는 데 활용합니다.' },
          ],
          faqs: [
            { q: 'EIA-96 코드는 무엇인가요?', a: '오차 1% 미만의 고정밀 저항기(E96 계열)에서 사용되는 코드로, 두 자리 숫자 인덱스와 한 자리 알파벳 배수 문자로 구성됩니다. 일반 3/4자리 코드와 계산 방식이 다르므로 본 도구의 자동 판별 기능을 이용하면 정확하게 변환됩니다.' },
            { q: '저항기에 띠가 6개인 경우는 무엇을 의미하나요?', a: '6번째 띠는 온도 계수(Temperature Coefficient, ppm/K)를 의미합니다. 온도가 1K 변할 때 저항값이 얼마나 변하는지를 나타내며, 정밀 계측·의료·항공 장비 등 고정밀 회로 설계에서 중요한 파라미터입니다.' },
            { q: '단위가 왜 kΩ이나 MΩ으로 바뀌나요?', a: '가독성을 위해 1,000Ω 이상은 kΩ으로, 1,000,000Ω 이상은 MΩ으로 자동 변환하여 표시합니다. 이는 IEC 80000-6 표준 표기 방식으로, 데이터시트와 회로도에서 일반적으로 사용하는 단위입니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: 'What is an Integrated Resistor Calculator?',
          description: 'In electrical and electronic engineering, resistance is the most fundamental element of circuit design. The Integrated Resistor Calculator is a professional-grade tool that instantly decodes leaded (color band) and surface-mount (SMD) resistors. It supports 4, 5, and 6-band color codes, as well as 3/4-digit and high-precision EIA-96 SMD codes. Operating 100% client-side, it ensures your data is never sent to a server, providing a fast and secure experience for engineers and hobbyists.',
          useCases: [
            { icon: '🏭', title: 'Component Sorting', desc: 'Quickly identify the value of scattered resistors by their color bands to organize your parts bin.' },
            { icon: '📐', title: 'Circuit Validation', desc: 'Visually confirm what color bands a target resistance value should have during the prototyping phase.' },
            { icon: '⚙️', title: 'SMD Repair', desc: 'Enter the small code on a surface-mount chip to verify its specs and find an appropriate replacement.' },
            { icon: '🎓', title: 'Engineering Education', desc: 'A perfect tool for beginners to intuitively learn and understand the resistor color code standards.' },
          ],
          steps: [
            { step: 'Choose Mode', desc: 'Select [Color Band] for leaded through-hole resistors or [SMD Code] for surface-mount chip resistors using the top tabs.' },
            { step: 'Enter Details', desc: 'In band mode, choose 4, 5, or 6 bands and select the color for each position from the dropdowns. In SMD mode, type the alphanumeric code printed on the chip.' },
            { step: 'Check Value & Tolerance', desc: 'Watch the resistor graphic update in real time as you select colors, and view the final decoded value (Ω/kΩ/MΩ) along with tolerance percentage at the bottom.' },
            { step: 'Select & Source Parts', desc: 'Use the calculated resistance value to identify the correct component for your circuit, or find an equivalent replacement for a damaged part.' },
          ],
          faqs: [
            { q: 'What is the EIA-96 code?', a: 'EIA-96 is a high-precision coding system used for E96-series resistors with ≤1% tolerance. It consists of 2 digits (a lookup index from a table of 96 values) and 1 letter (a multiplier). Because the index system differs from standard 3- or 4-digit codes, use this tool\'s auto-detection to decode it accurately.' },
            { q: 'What does a 6th band represent?', a: 'The sixth band represents the Temperature Coefficient (ppm/K), which indicates how much the resistance value changes per degree Kelvin of temperature change. It is a critical parameter for precision applications in medical, aerospace, and metrology equipment.' },
            { q: 'Why do units change to kΩ or MΩ?', a: 'For readability, values ≥1,000Ω are displayed as kΩ, and values ≥1,000,000Ω are shown as MΩ. This follows the IEC 80000-6 standard notation used in datasheets and schematics.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        },
};
