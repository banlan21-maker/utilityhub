// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '단위 변환기란 무엇인가요?',
          description: '단위 변환기는 길이, 넓이, 무게, 부피, 온도, 속도, 데이터, 시간, 에너지, 압력 등 10가지 카테고리의 단위를 즉시 환산해주는 무료 온라인 도구입니다. mm에서 마일, kg에서 파운드, 섭씨에서 화씨, GB에서 MB 등 일상과 업무에서 자주 사용하는 단위 변환을 별도 설치 없이 브라우저에서 바로 처리합니다. 한국 전통 단위인 평(坪), 근, 돈도 지원하며, 참고 표를 통해 자주 쓰는 값의 환산 결과를 한눈에 확인할 수 있습니다. 변환 결과는 복사 버튼으로 즉시 클립보드에 저장되며, 단위 간 스왑 기능으로 역방향 변환도 간편하게 수행할 수 있습니다.',
          useCases: [
            { icon: '🏠', title: '부동산 면적 환산', desc: '아파트 전용면적 84m²가 몇 평인지, 혹은 해외 부동산 평방피트(ft²)를 m²로 환산할 때 넓이 카테고리를 사용합니다.' },
            { icon: '✈️', title: '해외 여행 단위 확인', desc: '마일(mile)과 킬로미터, 화씨(°F)와 섭씨(°C), 파운드(lb)와 킬로그램(kg) 등 해외에서 자주 접하는 단위를 즉시 환산합니다.' },
            { icon: '💾', title: 'IT·개발 데이터 계산', desc: 'GB, MB, KB, bit 등 데이터 저장 단위를 환산하여 서버 용량 계획이나 파일 크기 비교에 활용합니다.' },
            { icon: '🔬', title: '과학·공학 단위 환산', desc: '압력(Pa, bar, psi, atm), 에너지(J, kJ, kcal, kWh, BTU) 등 전문 단위 환산이 필요한 연구나 공학 계산에 사용합니다.' },
          ],
          steps: [
            { step: '카테고리 탭 선택', desc: '상단 탭에서 길이, 넓이, 무게, 부피, 온도, 속도, 데이터, 시간, 에너지, 압력 중 원하는 단위 카테고리를 선택합니다.' },
            { step: '변환 전/후 단위 선택', desc: '왼쪽 드롭다운에서 변환할 단위(예: m)를, 오른쪽에서 변환 후 단위(예: ft)를 선택합니다. ⇄ 버튼으로 두 단위를 즉시 교환할 수 있습니다.' },
            { step: '값 입력 및 결과 확인', desc: '입력란에 숫자를 입력하면 변환 결과가 즉시 표시됩니다. 소수점 및 음수도 지원하며, 결과 옆 복사 버튼으로 값을 클립보드에 저장할 수 있습니다.' },
            { step: '참고 표 활용', desc: '패널 하단의 참고 표에서 대표 값들의 환산 결과를 한눈에 확인합니다. 예를 들어 1m, 10m, 100m가 각각 몇 피트인지 한 번에 볼 수 있습니다.' },
          ],
          faqs: [
            { q: '어떤 단위 카테고리를 지원하나요?', a: '길이, 넓이, 무게, 부피, 온도, 속도, 데이터, 시간, 에너지, 압력 총 10가지 카테고리를 지원합니다. 각 카테고리에는 국제 표준(SI) 단위와 야드파운드법(mile, ft, lb 등), 한국 전통 단위(평, 근, 돈)가 포함되어 있습니다.' },
            { q: '온도 변환은 어떻게 계산하나요?', a: '섭씨(°C), 화씨(°F), 켈빈(K) 간 변환을 지원합니다. 섭씨→화씨: (°C × 9/5) + 32, 섭씨→켈빈: °C + 273.15, 화씨→섭씨: (°F − 32) × 5/9 공식을 사용합니다. 체온(37°C = 98.6°F), 물 끓는점(100°C = 212°F) 등 일상적 기준값도 참고 표에서 확인할 수 있습니다.' },
            { q: '변환 결과가 지수 표기법(예: 1.234e+9)으로 나오는데 정상인가요?', a: '네, 정상입니다. 변환 결과가 매우 크거나(1조 이상) 매우 작은(0.000001 미만) 경우 가독성을 위해 지수 표기법으로 표시됩니다. 예를 들어 1PB를 bit로 변환하면 9.007e+15와 같이 표시됩니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: 'What is a Unit Converter?',
          description: 'A unit converter is a free online tool that instantly converts values across 10 measurement categories: length, area, weight, volume, temperature, speed, data, time, energy, and pressure. Whether you need to convert mm to miles, kg to pounds, Celsius to Fahrenheit, or GB to MB, this tool handles everyday and professional unit conversions without any software installation. It also supports traditional Korean units (pyeong, geun, don), and includes a reference table for quick lookups of common values. A swap button makes reverse conversions effortless, and a copy button saves results directly to your clipboard.',
          useCases: [
            { icon: '🏠', title: 'Real Estate Area Conversion', desc: 'Convert apartment exclusive areas from m² to pyeong, or convert international property listings from square feet to square meters for easy comparison.' },
            { icon: '✈️', title: 'Overseas Travel Unit Check', desc: 'Instantly convert miles to kilometers, Fahrenheit to Celsius, and pounds to kilograms — the units you encounter most frequently when traveling abroad.' },
            { icon: '💾', title: 'IT & Development Data Calculation', desc: 'Convert between GB, MB, KB, and bits to plan server capacity, compare file sizes, or calculate API payload limits accurately.' },
            { icon: '🔬', title: 'Science & Engineering Conversion', desc: 'Convert pressure units (Pa, bar, psi, atm, mmHg) and energy units (J, kJ, kcal, kWh, BTU) for research calculations and engineering projects.' },
          ],
          steps: [
            { step: 'Select a Category Tab', desc: 'Click one of the 10 category tabs at the top — Length, Area, Weight, Volume, Temperature, Speed, Data, Time, Energy, or Pressure — to load the relevant units.' },
            { step: 'Choose From and To Units', desc: 'Select the source unit from the left dropdown and the target unit from the right. Use the ⇄ swap button to instantly reverse the conversion direction.' },
            { step: 'Enter a Value and See Results', desc: 'Type a number into the input field to see the converted result instantly. Decimal and negative values are supported. Click the copy button to save the result to your clipboard.' },
            { step: 'Use the Reference Table', desc: 'The reference table at the bottom of the panel shows conversions for several common values at once — for example, how 1m, 10m, and 100m compare in feet.' },
          ],
          faqs: [
            { q: 'What unit categories are supported?', a: 'Ten categories are supported: Length, Area, Weight, Volume, Temperature, Speed, Data, Time, Energy, and Pressure. Each includes both SI (metric) and imperial units, plus traditional Korean units such as pyeong (area), geun, and don (weight).' },
            { q: 'How is temperature conversion calculated?', a: 'Celsius (°C), Fahrenheit (°F), and Kelvin (K) are all supported. The formulas used are: °C to °F: (°C × 9/5) + 32; °C to K: °C + 273.15; °F to °C: (°F − 32) × 5/9. Common reference points like body temperature (37°C = 98.6°F) and boiling water (100°C = 212°F) appear in the reference table.' },
            { q: 'Why does the result show scientific notation (e.g., 1.234e+9)?', a: 'Scientific notation is used when results are very large (over 1 trillion) or very small (under 0.000001) to maintain readability. For example, converting 1 PB to bits displays as approximately 9.007e+15. This is normal behavior.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        },
};
