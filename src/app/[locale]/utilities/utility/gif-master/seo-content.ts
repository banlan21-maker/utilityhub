// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: 'GIF 마스터란?',
          description: 'GIF 마스터는 GIF 파일과 관련된 모든 작업을 하나의 툴에서 해결할 수 있는 통합 GIF 편집 도구입니다. 별도 프로그램 설치나 회원가입 없이 브라우저에서 바로 사용할 수 있으며, 모든 파일 처리는 사용자의 기기 안에서만 이루어져 개인정보 유출 걱정이 없습니다. GIF 압축 기능으로는 품질 슬라이더를 조절해 원하는 수준으로 용량을 줄일 수 있고, 배속 조절 기능으로 GIF의 재생 속도를 0.5배~2배까지 변경할 수 있으며, 압축 전후 용량과 품질을 나란히 비교해 확인할 수 있습니다. GIF 생성 기능으로는 여러 장의 이미지를 하나의 GIF로 합치거나, 텍스트를 입력해 타이핑·페이드·바운스 등 다양한 애니메이션 효과가 적용된 GIF를 만들거나, MP4 동영상의 원하는 구간을 GIF로 변환할 수 있습니다. SNS·블로그·발표 자료·이메일 서명 등 다양한 곳에 바로 활용할 수 있습니다.',
          useCases: [
            { icon: '📱', title: 'SNS·메신저 최적화', desc: '카카오톡·인스타그램·트위터 등 SNS에 올릴 GIF를 압축해 빠르게 로딩되도록 최적화하거나, 나만의 움짤·스티커를 직접 제작해 개성 있는 콘텐츠를 만드세요.' },
            { icon: '🎬', title: '영상 하이라이트 캡처', desc: '유튜브 영상이나 직접 촬영한 영상에서 재미있는 장면, 반응, 하이라이트 구간을 GIF로 캡처해 커뮤니티나 SNS에 바로 공유할 수 있습니다.' },
            { icon: '📊', title: '발표·문서 자료 제작', desc: '파워포인트·노션·이메일에 삽입할 움직이는 설명 자료나 로딩 애니메이션을 텍스트 GIF 또는 이미지 GIF로 빠르게 만들 수 있습니다.' },
            { icon: '🌐', title: '웹사이트 성능 최적화', desc: '웹사이트에 삽입된 무거운 GIF를 압축해 페이지 로딩 속도를 높이고, Core Web Vitals 점수와 사용자 경험을 개선할 수 있습니다.' },
          ],
          steps: [
            { step: '탭 선택', desc: '상단 탭에서 GIF 압축 또는 GIF 생성을 선택합니다. GIF 생성 탭에서는 이미지→GIF, 텍스트→GIF, 동영상→GIF 세 가지 방식 중 원하는 서브탭을 선택하세요.' },
            { step: '파일 업로드', desc: 'GIF 압축은 GIF 파일을 업로드한 후 품질 슬라이더(1~100)를 조정합니다. 숫자가 낮을수록 용량이 작아지고, 높을수록 화질이 선명하게 유지됩니다. 배속 조절로 재생 속도도 변경 가능합니다.' },
            { step: '설정 조정', desc: 'GIF 생성은 이미지·텍스트·동영상을 업로드하거나 입력한 뒤 프레임 간격, 반복 횟수, 출력 크기 등을 설정하고 생성 시작 버튼을 클릭합니다.' },
            { step: '다운로드', desc: '처리가 완료되면 결과 GIF를 미리보기로 확인한 후 다운로드 버튼을 눌러 기기에 저장합니다. 파일명은 자동으로 -gifmaster.gif로 저장됩니다.' },
          ],
          faqs: [
            { q: 'GIF 파일이 너무 커서 업로드가 안 돼요.', a: '현재 GIF 압축은 최대 50MB, GIF 생성의 동영상 변환은 최대 100MB까지 지원합니다. 그보다 큰 파일은 먼저 다른 도구로 분할하거나 해상도를 줄인 뒤 업로드해주세요. 이미지→GIF는 장당 최대 10MB, 최대 20장까지 지원합니다.' },
            { q: '업로드한 파일이 외부 서버로 전송되나요?', a: '아닙니다. GIF 마스터의 모든 처리는 사용자의 브라우저(기기) 안에서만 이루어집니다. 파일이 외부 서버로 전송되거나 저장되는 일은 없으므로 개인 사진, 회사 자료 등 민감한 파일도 안심하고 사용할 수 있습니다.' },
            { q: '동영상→GIF 변환 시 왜 15초 이내로 제한하나요?', a: '브라우저에서 동영상을 GIF로 변환할 때는 초당 N장의 프레임을 Canvas에 그린 뒤 하나씩 합성하는 방식으로 동작합니다. 구간이 길어질수록 처리할 프레임 수가 급격히 늘어나 브라우저가 멈추거나 메모리 부족이 발생할 수 있습니다. 10fps 기준 15초 = 150프레임으로, 대부분의 기기에서 안정적으로 처리할 수 있는 최대치입니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: 'What is GIF Master?',
          description: 'GIF Master is an all-in-one GIF tool that handles everything from compression to creation — entirely in your browser, with no uploads to any server. The compression feature lets you reduce file size using a quality slider, adjust playback speed from 0.5× to 2×, and compare before/after side by side. The creation suite offers three modes: combine multiple images into an animated GIF, generate text animation GIFs with five effects (typing, fade-in, bounce, slide, blink), and convert any video clip into a GIF using the HTML5 Video API — no FFmpeg or server required. All frame decoding uses gifuct-js for accurate multi-frame extraction, while gif.js handles encoding with worker threads. Your files never leave your device, making it safe for personal photos, company assets, and sensitive content.',
          useCases: [
            { icon: '📱', title: 'SNS Optimization', desc: 'Compress GIFs for faster loading on Instagram, Twitter, and KakaoTalk, or create custom stickers and reaction GIFs to boost your social media presence.' },
            { icon: '🎬', title: 'Video Highlight Clips', desc: 'Capture funny moments, reactions, or highlights from your videos and convert them to shareable GIFs for communities and social platforms.' },
            { icon: '📊', title: 'Presentation Assets', desc: 'Create animated diagrams, loading indicators, or explainer GIFs for PowerPoint, Notion, or email signatures without any design software.' },
            { icon: '🌐', title: 'Web Performance', desc: 'Compress heavy GIFs on your website to improve page load speed, Core Web Vitals scores, and overall user experience.' },
          ],
          steps: [
            { step: 'Choose a Tab', desc: 'Select GIF Compress or GIF Create from the top tabs. In the Create tab, choose a sub-tab: Images → GIF, Text → GIF, or Video → GIF depending on your source material.' },
            { step: 'Upload or Input', desc: 'For compression, upload a GIF and adjust the quality slider (1–100). Lower values reduce file size more aggressively; higher values preserve clarity. Use the speed multiplier to change playback tempo.' },
            { step: 'Configure Settings', desc: 'Set frame delay, loop count, output width, and animation effects. For video conversion, enter the start and end time of the clip you want (max 15 seconds recommended).' },
            { step: 'Download the Result', desc: 'After processing completes, preview the output GIF and click Download. Files are saved automatically with a -gifmaster.gif suffix for easy identification.' },
          ],
          faqs: [
            { q: 'My GIF file is too large to upload. What should I do?', a: 'GIF compression supports files up to 50 MB. Video-to-GIF conversion supports up to 100 MB. For Images-to-GIF, each image can be up to 10 MB with a maximum of 20 images total. If your file exceeds these limits, try resizing or splitting it first using another tool before uploading.' },
            { q: 'Are my uploaded files sent to any server?', a: 'No. All processing happens entirely inside your browser using the Canvas API, HTML5 Video API, and JavaScript libraries. Your files are never transmitted to any external server or stored anywhere — making it completely safe for sensitive personal or business content.' },
            { q: 'Why is the video-to-GIF conversion limited to 15 seconds?', a: 'Converting video to GIF in the browser works by capturing individual frames onto a Canvas, then encoding them one by one. Longer clips produce exponentially more frames, which can exhaust browser memory and cause crashes. At 10 fps, 15 seconds equals 150 frames — the practical limit for stable processing on most devices.' },
            { q: 'Can I use the output GIF commercially?', a: 'Results are provided for reference and general use. For any commercial application involving third-party copyrighted content, please ensure you have the appropriate rights before publishing or distributing the output.' },
          ],
        },
};
