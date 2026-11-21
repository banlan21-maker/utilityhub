// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
            title: 'OSMU 재가공 포맷터란?',
            description: 'One Source Multi Use(OSMU) 전략을 실현하는 콘텐츠 자동 변환 도구입니다. 뉴스레터, 블로그 원고, 긴 글 하나를 입력하면 인스타그램 전용 본문(줄바꿈 최적화 + 해시태그), X(트위터) 타래 분할, 블로그 키워드 밀도 분석, 숏폼 대본(15초 단위 가이드)까지 단 1초 안에 자동 생성됩니다. 모든 처리는 브라우저 내에서 완결되어 원고가 외부 서버로 전송되지 않으며, 작성 중인 내용은 LocalStorage에 자동 저장되어 페이지를 닫아도 유지됩니다. 콘텐츠 마케터, 1인 창작자, 스타트업 마케팅 담당자가 시간을 10배 절감할 수 있는 필수 도구입니다.',
            useCases: [
              { icon: '📝', title: '개인 블로그 재가공', desc: '완성된 블로그 원고를 그대로 붙여넣으면 인스타그램 카드뉴스용 최적화 텍스트와 추천 해시태그 5개가 즉시 생성되어 별도 편집 없이 바로 게시할 수 있습니다.' },
              { icon: '🚀', title: 'SNS 마케팅 효율화', desc: '한 번의 콘텐츠 작성으로 인스타그램, X(트위터), 블로그, 유튜브 숏츠까지 모든 채널을 동시에 공략하여 마케팅 비용과 작업 시간을 대폭 줄일 수 있습니다.' },
              { icon: '🔍', title: 'SEO 키워드 점검', desc: '블로그 포스팅 전에 키워드 밀도 분석 기능으로 반복 단어를 시각화하여 검색엔진 크롤러가 선호하는 자연스러운 키워드 배분을 점검할 수 있습니다.' },
              { icon: '🎬', title: '숏폼 대본 자동화', desc: '원문 핵심 내용을 15초 단위 타임라인으로 자동 분절하여 유튜브 쇼츠, 인스타그램 릴스, 틱톡 촬영 대본을 별도 편집 없이 즉시 활용할 수 있습니다.' },
            ],
            steps: [
              { step: '원문 입력', desc: '왼쪽 텍스트 영역에 블로그 글, 뉴스레터, 또는 긴 아이디어를 그대로 붙여넣습니다. 저장 버튼 없이도 내용이 브라우저에 자동으로 임시 저장됩니다.' },
              { step: '플랫폼 탭 선택', desc: '우측 상단의 탭(인스타그램 / X / 블로그 분석 / 숏폼 대본)을 클릭하여 각 플랫폼에 최적화된 변환 결과를 확인합니다.' },
              { step: '결과 확인 및 수정', desc: '변환된 결과를 검토하고 필요한 경우 카드 우측의 복사 버튼을 눌러 개별 섹션(훅 문장, 본문, 해시태그)을 독립적으로 복사합니다.' },
              { step: '복사 및 게시', desc: '각 플랫폼에 맞는 결과를 복사한 뒤 해당 SNS 앱이나 블로그 에디터에 붙여넣어 바로 게시합니다. 전체 텍스트는 하단 전체 복사 버튼으로 한 번에 복사 가능합니다.' },
            ],
            faqs: [
              { q: '데이터가 서버로 전송되나요?', a: '아니요. 이 도구의 모든 처리(텍스트 분석, 변환, 저장)는 사용자의 웹 브라우저 내부에서만 이루어집니다. 입력한 원고는 외부 서버로 전송되지 않으며, 민감한 마케팅 원고나 개인 일기도 완전히 안전하게 작업할 수 있습니다.' },
              { q: '인스타그램 줄바꿈 점(.)은 왜 추가되나요?', a: '인스타그램 앱과 웹에서는 연속된 빈 줄이 자동으로 제거되는 알려진 버그가 있습니다. 이를 방지하기 위해 각 단락 사이에 마침표(.)를 자동으로 삽입하여 모바일 화면에서 가독성을 극대화합니다. 실제 인스타그램 인플루언서들이 수동으로 적용하는 테크닉과 동일한 방식입니다.' },
              { q: 'X(트위터) 타래 분할 기준은 무엇인가요?', a: '한 트윗당 공백 포함 약 130~140자 이내로, 문장이 중간에 끊기지 않도록 문장 단위로 스마트하게 분할합니다. 각 트윗 끝에 (1/N) 형태의 번호가 자동으로 붙어 타래 순서가 명확하게 표시됩니다.' },
              { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
            ]
          },
  en: {
            title: 'What is OSMU Content Formatter?',
            description: 'The OSMU Content Formatter is the ultimate tool for One Source Multi Use (OSMU) content strategy. Simply paste a long-form blog post, newsletter, or essay into the editor, and the tool instantly generates platform-optimized outputs: Instagram body text with automatic line-break dots and top hashtags, X (Twitter) thread splits at ~130 characters per tweet, blog keyword density analysis to guide SEO, and a 15-second-chunk Shorts script for video creators. All processing runs entirely in your browser — your content is never uploaded to any server. Draft content is auto-saved to LocalStorage so your work is preserved even if you close the tab. Whether you are a solo creator, marketing manager, or startup founder, this tool cuts your repurposing time by up to 90% and helps every piece of content reach more people across every channel.',
            useCases: [
              { icon: '📝', title: 'Blog Repurposing', desc: 'Paste your finished blog post and instantly get an Instagram-optimized caption with line-break formatting and five relevant hashtags, ready to publish without any manual editing.' },
              { icon: '🚀', title: 'Multi-Channel Marketing', desc: 'Write your content once and simultaneously produce versions tailored for Instagram, X, blog SEO analysis, and Shorts scripting — covering every major platform in a single workflow.' },
              { icon: '🔍', title: 'SEO Keyword Analysis', desc: 'Before publishing your blog post, use the keyword density chart to visualize repeated words and fine-tune your content so search engine crawlers recognize your key topics naturally.' },
              { icon: '🎬', title: 'Shorts Script Generator', desc: 'The tool automatically segments your key content into 15-second timeline chunks, giving you a ready-to-use shooting script for YouTube Shorts, Instagram Reels, or TikTok.' },
            ],
            steps: [
              { step: 'Paste Your Content', desc: 'Type or paste your blog post, newsletter draft, or any long-form text into the left editor panel. Your draft is auto-saved to LocalStorage so it persists between sessions.' },
              { step: 'Select a Platform Tab', desc: 'Click the Instagram, X, Blog Stats, or Shorts tab in the right panel to see your content instantly reformatted for that specific platform.' },
              { step: 'Review the Output', desc: 'Check the generated hook sentence, body text, hashtags, thread splits, or script chunks. Each section has its own copy button so you can grab exactly what you need.' },
              { step: 'Copy and Publish', desc: 'Click the copy button on any result card and paste directly into your social media app or blog editor. Use the Copy All button at the bottom to grab the full formatted output at once.' },
            ],
            faqs: [
              { q: 'Is my draft content safe and private?', a: 'Yes. All text analysis and conversion happens entirely within your web browser. Nothing you type is ever sent to an external server, making it completely safe for confidential marketing copy or personal writing.' },
              { q: 'Why are dots added between Instagram paragraphs?', a: 'Instagram has a known behavior where consecutive blank lines are collapsed and removed. Inserting a period on its own line prevents this, preserving your intended paragraph breaks and making the post more readable on mobile screens — a technique used by professional influencers.' },
              { q: 'How does the X (Twitter) thread splitting work?', a: 'The tool splits your text at sentence boundaries, keeping each tweet under approximately 130–140 characters to stay comfortably within the 280-character limit. A (1/N) counter is appended to each tweet so followers can follow the thread easily.' },
              { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
            ]
          },
};
