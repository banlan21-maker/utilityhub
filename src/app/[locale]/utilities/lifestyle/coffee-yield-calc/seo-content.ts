// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '커피 브루잉 수율 계산기란 무엇인가요?',
          description:
            '커피 브루잉 수율 계산기는 전 세계 바리스타들의 표준인 SCA(스페셜티 커피 협회) 브루잉 컨트롤 차트 공식을 100% 브라우저 안에서 계산해주는 도구입니다. 서버 통신 없이 원두 도징량과 추출 비율만 입력하면 즉시 결과를 보여주며, 핸드드립을 선택하면 "부어야 할 목표 물 용량"을, 에스프레소를 선택하면 "타겟 최종 추출량"을 정확한 용어로 분기해 제공합니다. 이는 드립이 원두 대비 붓는 물(coffee-to-water) 기준인 반면 에스프레소는 추출된 액체 무게(dose-to-yield) 기준이라는 과학적 차이를 반영한 것입니다. 굴절계(TDS 측정기)를 보유한 분은 전문가 모드에서 최종 추출량과 TDS 농도를 입력해 진짜 추출 수율(%)을 계산하고, SCA 브루잉 컨트롤 차트 위에 내 커피의 좌표를 빨간 점으로 확인할 수 있습니다. 수율이 골든존(18~22%)을 벗어나면 과소·과다 추출 여부와 함께 분쇄도·물 온도·추출 시간 조절 가이드를 제공합니다. 매일 아침 홈카페 레시피의 일관성을 잡거나 카페 머신을 다이얼인할 때 엑셀 없이 쓰는 계량 도구입니다. 다만 로스팅 정도, 채널링 등 현장 변수로 실제 미각은 달라질 수 있으므로 보조 도구로 활용하시기 바랍니다.',
          useCases: [
            { icon: '☕', title: '아침 홈카페 레시피 점검', desc: '매일 원두를 바꿀 때마다 변하는 맛의 일관성을 잡기 위해, 저울에 잰 원두 무게만 입력하여 1:16 같은 국룰 비율의 정확한 물 가이드를 즉시 확인합니다.' },
            { icon: '👨‍🍳', title: '카페 바리스타 다이얼인', desc: '에스프레소 머신 세팅 시 리스트레토·룽고 샷의 목표 추출량과 수율 18~22%를 맞추기 위한 필수 계량 계산기로 활용해 샷 품질을 표준화합니다.' },
            { icon: '🧪', title: '스페셜티 TDS 굴절계 연동', desc: '전문 TDS 측정 장비를 보유한 로스터리나 바리스타가 정확한 추출 수율 점수를 확인하고 SCA 차트에 좌표를 기록하며 추출을 미세 조정할 때 사용합니다.' },
            { icon: '🌐', title: '글로벌 커피 커뮤니티 공유', desc: '영어 버전이 완벽 지원되어 해외 Reddit r/Coffee 매니아나 바리스타들이 레시피를 빌드할 때 엑셀 대신 쓰는 사이트로 링크 하나로 공유할 수 있습니다.' },
          ],
          steps: [
            { step: '모드와 추출 방식 선택', desc: '입문자/전문가 모드를 고르고 핸드드립·에스프레소 중 방식을 선택합니다. 방식에 따라 비율 프리셋과 결과 용어(물 양/추출량)가 자동으로 전환됩니다.' },
            { step: '원두량과 비율 입력', desc: '원두 도징량을 그램 단위로 입력하고 비율 프리셋을 선택하거나, 직접 입력 버튼으로 16.5 같은 소수점 비율을 칠 수 있습니다. 우측에 결과가 즉시 표시됩니다.' },
            { step: '전문가 모드 — TDS 입력', desc: '굴절계가 있다면 전문가 모드에서 최종 추출량과 TDS 측정값을 입력합니다. SCA 브루잉 컨트롤 차트에 내 커피의 좌표가 빨간 점으로 표시됩니다.' },
            { step: '바리스타 피드백 확인', desc: '계산된 수율이 골든존(18~22%)인지 확인하고, 과소·과다 추출 시 제공되는 분쇄도·물 온도·추출 시간 조절 가이드대로 다음 추출을 개선합니다.' },
          ],
          faqs: [
            { q: '이 계산기의 공식은 어디 기준인가요?', a: '전 세계 바리스타 표준인 SCA(스페셜티 커피 협회)의 브루잉 컨트롤 차트 공식을 기반으로 합니다. 골든존 수율 18~22%, 드립 TDS 1.15~1.35%는 SCA가 제시하는 이상적 추출 구간이며, 모든 계산은 사용자 브라우저 안에서만 처리되어 입력값이 서버로 전송되지 않습니다.' },
            { q: '에스프레소 1:2랑 드립 1:16은 같은 의미인가요?', a: '다릅니다. 드립의 1:16은 원두 1에 붓는 물 16을 의미하고, 에스프레소의 1:2는 원두 1에 추출된 액체 2를 의미합니다. 에스프레소는 물을 붓는 게 아니라 추출된 결과물 기준이라, 본 도구가 방식별로 결과 용어를 자동 구분합니다. 그래서 같은 계산식이라도 드립은 "부어야 할 물", 에스프레소는 "타겟 추출량"으로 표시됩니다.' },
            { q: 'TDS 측정기가 없는데 수율을 알 수 있나요?', a: '정확한 수율은 굴절계(TDS 측정기)가 필요합니다. 측정기가 없으면 입문자 모드에서 정확한 물 양 또는 추출량 계산을 제공하며, 비율 기반 레시피 일관성 유지에 집중하시길 권장합니다. 가상 추정 수율은 부정확하므로 제공하지 않습니다. 측정기를 보유했다면 전문가 모드에서 진짜 수율과 차트를 확인하세요.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 로스팅 정도, 채널링, 물의 미네랄 함량 등 현장 변수로 실제 미각은 다를 수 있으므로 보조 도구로 활용하시고, 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: 'What is the Coffee Extraction Calculator?',
          description:
            'The Coffee Extraction Calculator computes the SCA (Specialty Coffee Association) Brewing Control Chart formulas — the global barista standard — entirely inside your browser with zero server communication. Enter your coffee dose and brew ratio, and it instantly shows the result, correctly branching the terminology: choosing pour-over gives you the "target water to pour," while espresso gives you the "target final yield." This reflects the scientific difference that pour-over is measured coffee-to-water (the water you pour in), whereas espresso is measured dose-to-yield (the weight of liquid extracted), since an espresso machine extracts rather than pours. If you own a refractometer (TDS meter), Pro mode lets you enter the final yield and TDS to calculate the real extraction yield (%) and plot your coffee as a red dot on the SCA Brewing Control Chart. When the yield falls outside the golden zone (18–22%), the tool tells you whether it is under- or over-extracted and gives grind, water-temperature, and time adjustment guidance. It is the measuring tool you reach for instead of a spreadsheet when dialing in your morning home-cafe recipe or a cafe machine. Note that roast level, channeling, and other real-world variables can change the actual taste, so use it as an aid.',
          useCases: [
            { icon: '☕', title: 'Morning Home-Cafe Check', desc: 'To keep taste consistent as you switch beans daily, just enter the dose you weighed and instantly get the exact water guide for a classic ratio like 1:16.' },
            { icon: '👨‍🍳', title: 'Cafe Barista Dial-In', desc: 'Use it as the essential measuring calculator to hit target yields for ristretto and lungo shots and land the 18–22% extraction window, standardizing shot quality.' },
            { icon: '🧪', title: 'Specialty TDS Refractometer', desc: 'Roasteries and baristas with professional TDS gear can check the precise extraction yield score, plot coordinates on the SCA chart, and fine-tune extraction.' },
            { icon: '🌐', title: 'Global Coffee Community', desc: 'With full English support, r/Coffee enthusiasts and baristas worldwide can use it instead of a spreadsheet when building recipes and share it with a single link.' },
          ],
          steps: [
            { step: 'Pick mode and brew method', desc: 'Choose Beginner or Pro mode and select pour-over or espresso. The ratio presets and result terminology (water vs yield) switch automatically based on the method.' },
            { step: 'Enter dose and ratio', desc: 'Enter the coffee dose in grams and pick a ratio preset, or use the custom button to type a decimal ratio like 16.5. The result appears instantly on the right.' },
            { step: 'Pro mode — enter TDS', desc: 'If you have a refractometer, enter the final yield and TDS reading in Pro mode. Your coffee is plotted as a red dot on the SCA Brewing Control Chart.' },
            { step: 'Check barista feedback', desc: 'See whether the calculated yield lands in the golden zone (18–22%), and follow the grind, water-temperature, and time guidance to improve your next brew.' },
          ],
          faqs: [
            { q: 'What standard are these formulas based on?', a: 'They are based on the Brewing Control Chart from the SCA (Specialty Coffee Association), the global barista standard. The golden-zone yield of 18–22% and drip TDS of 1.15–1.35% are the ideal extraction ranges the SCA defines, and every calculation runs in your browser, so your inputs are never sent to a server.' },
            { q: 'Are espresso 1:2 and drip 1:16 the same idea?', a: 'No. In drip, 1:16 means 1 part coffee to 16 parts poured water; in espresso, 1:2 means 1 part coffee to 2 parts extracted liquid. Espresso is measured by the extracted output, not poured water, so this tool branches the terminology automatically — drip shows "water to pour" while espresso shows "target yield," even when the arithmetic is the same.' },
            { q: 'Can I know the yield without a TDS meter?', a: 'Accurate yield requires a refractometer (TDS meter). Without one, Beginner mode gives you precise water or yield calculations and we recommend focusing on ratio-based recipe consistency. We do not provide a fake estimated yield because it would be inaccurate. If you own a meter, use Pro mode to see the real yield and chart.' },
            { q: 'Can I use this result as official data?', a: 'The results are for reference only. Roast level, channeling, water mineral content, and other real-world variables can change the actual taste, so use it as an aid and consult a professional or official source for accurate figures.' },
          ],
        },
};
