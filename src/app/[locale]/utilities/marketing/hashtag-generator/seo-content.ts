// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '해시태그 생성기란?',
          description: '해시태그 생성기는 키워드 하나를 입력하면 인스타그램과 유튜브에 최적화된 인기 해시태그 30개를 즉시 생성해주는 무료 SNS 마케팅 도구입니다. 맛집·카페·여행·뷰티·패션·운동·요리·반려동물·재테크·인테리어 등 15개 이상의 인기 카테고리별 해시태그 데이터베이스를 내장하고 있으며, 등록되지 않은 키워드도 유의어 매핑과 자동 생성 알고리즘으로 관련 태그를 추천합니다. 모든 처리는 브라우저에서 이루어져 로그인이나 회원가입 없이 즉시 사용 가능합니다. 생성된 해시태그는 한 번의 클릭으로 전체 복사할 수 있어 SNS 게시물에 바로 붙여넣기가 가능합니다.',
          useCases: [
            { icon: '📸', title: '인스타그램 탐색 노출', desc: '인기 해시태그를 게시물에 추가하면 해당 태그를 팔로우하거나 탐색하는 신규 사용자에게 콘텐츠가 노출되어 팔로워 증가와 도달률 향상에 직접적으로 기여합니다.' },
            { icon: '🎬', title: '유튜브 검색 최적화', desc: '유튜브 설명란에 관련 해시태그를 삽입하면 영상이 관련 태그 검색 결과와 제목 상단에 노출되어 조회수와 구독자 유입을 높일 수 있습니다.' },
            { icon: '🏪', title: '브랜드·소상공인 홍보', desc: '카페, 식당, 쇼핑몰 등 소규모 사업자가 업종 관련 해시태그를 활용하면 광고 비용 없이 지역 고객과 잠재 소비자에게 콘텐츠를 효과적으로 노출할 수 있습니다.' },
            { icon: '📊', title: '콘텐츠 마케터 업무 효율화', desc: '다수의 클라이언트 SNS 계정을 운영하는 마케터가 게시물마다 해시태그를 수동으로 조사하는 시간을 줄이고, 키워드별로 즉시 최적화된 태그 세트를 확보하여 업무 속도를 높일 수 있습니다.' },
          ],
          steps: [
            { step: '플랫폼 선택', desc: '상단에서 인스타그램 또는 유튜브 버튼을 클릭하여 원하는 플랫폼을 선택합니다. 같은 키워드라도 플랫폼별 인기 태그가 다르게 생성됩니다.' },
            { step: '키워드 입력', desc: '검색창에 콘텐츠 주제 키워드(예: 맛집, 카페, 여행, 뷰티)를 입력하고 생성 버튼을 클릭하거나 Enter 키를 누릅니다.' },
            { step: '태그 확인', desc: '플랫폼에 최적화된 해시태그 30개가 컬러 칩 형태로 즉시 표시됩니다. 각 태그의 관련성을 검토하고 콘텐츠에 맞는 태그를 선별합니다.' },
            { step: '전체 복사 및 붙여넣기', desc: '전체 복사 버튼을 클릭하면 30개 태그가 공백으로 구분된 형태로 클립보드에 복사됩니다. 인스타그램 또는 유튜브 게시물 설명란에 바로 붙여넣어 사용하세요.' },
          ],
          faqs: [
            { q: '해시태그는 몇 개까지 쓰는 게 효과적인가요?', a: '인스타그램은 최대 30개를 허용하지만, 알고리즘 연구에 따르면 콘텐츠와 관련성이 높은 5~15개를 선별해 사용하는 것이 30개를 무작위로 사용하는 것보다 탐색 노출과 도달률 측면에서 효과적인 경우가 많습니다. 유튜브는 제목 위 표시 해시태그 3개, 설명란 해시태그 15개 이내를 권장합니다.' },
            { q: '키워드를 입력했는데 관련 태그가 없으면 어떻게 되나요?', a: '도구 내부의 유의어 사전을 통해 입력 키워드와 관련된 카테고리를 자동으로 매핑합니다. 예를 들어 "식당"을 입력하면 "맛집" 카테고리 태그가, "헬스"를 입력하면 "운동" 카테고리 태그가 생성됩니다. 매핑이 되지 않는 키워드는 입력한 단어를 기반으로 스타그램, 추천, 일상 등 형식의 범용 태그 20개가 자동 생성됩니다.' },
            { q: '생성된 해시태그는 계속 업데이트되나요?', a: '현재 도구에 내장된 해시태그 데이터베이스는 각 카테고리의 장기적으로 인기 있는 태그를 기반으로 구성되어 있습니다. 트렌드가 빠르게 변하는 시사·이슈 관련 해시태그는 포함되지 않을 수 있으므로, 생성된 태그를 참고 삼아 최신 트렌드 태그를 일부 직접 추가하는 것을 권장합니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: 'What is a Hashtag Generator?',
          description: 'The Hashtag Generator is a free SNS marketing tool that instantly produces 30 optimized hashtags for Instagram or YouTube from a single keyword. It contains a built-in database of trending hashtags across 15+ popular categories including food, cafe, travel, beauty, fashion, fitness, cooking, pets, investment, and interior design. For keywords not in the database, a synonym mapping system and fallback generation algorithm ensure you always receive relevant tag suggestions. No login or registration is required — everything runs in your browser. Generated hashtags can be copied to your clipboard in one click and pasted directly into any post, caption, or video description. Whether you are a content creator, brand manager, or small business owner, this tool helps you skip hours of manual hashtag research and get your content discovered faster.',
          useCases: [
            { icon: '📸', title: 'Instagram Explore Reach', desc: 'Adding trending hashtags to your Instagram posts helps your content appear in Explore feeds and hashtag search results, driving new followers and boosting organic reach without paid advertising.' },
            { icon: '🎬', title: 'YouTube SEO Boost', desc: 'Inserting relevant hashtags into your YouTube video description makes the video appear in hashtag search pages and can display the top three hashtags above the video title, increasing discoverability.' },
            { icon: '🏪', title: 'Small Business Promotion', desc: 'Cafes, restaurants, and boutiques can use category-specific hashtags to reach local customers and niche audiences organically, reducing reliance on paid ads and growing community presence.' },
            { icon: '📊', title: 'Content Manager Efficiency', desc: 'Marketing managers handling multiple client accounts can instantly generate a full hashtag set for any topic, saving hours of manual keyword research and ensuring consistent, platform-appropriate tag selection for every post.' },
          ],
          steps: [
            { step: 'Choose Platform', desc: 'Click the Instagram or YouTube button at the top to select your target platform. The same keyword produces different optimized hashtag sets depending on the platform you choose.' },
            { step: 'Enter a Keyword', desc: 'Type your content topic in the search box (e.g., food, travel, fitness) and press Enter or click the Generate button to retrieve the hashtag list immediately.' },
            { step: 'Review the Tags', desc: 'Thirty hashtags appear as colored chips. Browse the results and identify which tags best match your specific content angle — a mix of high-volume and niche tags typically performs best.' },
            { step: 'Copy and Paste', desc: 'Click the Copy All button to copy all 30 tags as a space-separated string to your clipboard, then paste them directly into your Instagram caption or YouTube video description.' },
          ],
          faqs: [
            { q: 'How many hashtags should I actually use on Instagram?', a: 'Instagram allows up to 30 hashtags per post, but research suggests using 5–15 highly relevant tags outperforms stuffing all 30. Relevance signals to the algorithm that your content matches the tag topic, improving placement in Explore and hashtag feeds. For YouTube, keep hashtags in the description to 15 or fewer, as exceeding this causes YouTube to ignore all of them.' },
            { q: 'What happens if my keyword is not in the database?', a: 'The tool uses a synonym mapping system to automatically match your keyword to the closest category. For example, typing "restaurant" maps to the food category, and "gym" maps to fitness. For completely unrecognized keywords, a fallback algorithm generates 20 general-purpose tags based on your input word, including formats like #wordstagram, #wordrecommendation, and universal lifestyle tags.' },
            { q: 'Are the hashtags updated regularly?', a: 'The built-in database focuses on evergreen, consistently popular hashtags for each category rather than rapidly changing trends. For time-sensitive or breaking-news hashtags, you may need to supplement the generated list with manually researched trending tags. We recommend using the generated set as a strong foundation and adding 2–3 current trend tags on top.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        },
};
