// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '자소서 작성 헬퍼 — 글자 수 계산 & 맞춤법 검사 완벽 가이드',
          description: '취업 준비생을 위한 자기소개서 작성 도구입니다. 실시간 글자 수(공백 포함/제외) 및 바이트 계산, 다양한 제한 프리셋, 부산대학교 맞춤법 검사기 연동으로 완성도 높은 자소서를 작성하세요. 모든 데이터는 브라우저 LocalStorage에 저장되어 페이지를 닫아도 내용이 유지됩니다.',
          useCases: [
            { icon: '🏢', title: '대기업·공공기관 공채', desc: '800자, 1,000자 등 기업별 글자 수 제한에 맞춰 항목별 자소서를 작성합니다.' },
            { icon: '🎓', title: '대학원·편입학 지원', desc: '연구계획서·학업계획서 분량을 실시간으로 확인하며 작성합니다.' },
            { icon: '📋', title: '취업포털 입력', desc: '사람인·잡코리아 등 취업포털의 자소서 항목별 글자 제한을 체크합니다.' },
            { icon: '🔍', title: '맞춤법 최종 교정', desc: '부산대 맞춤법 검사기와 연동해 제출 전 맞춤법을 한 번에 검토합니다.' },
          ],
          steps: [
            { step: '프리셋 선택', desc: '지원하는 기업/기관 유형에 맞는 글자 수 제한 프리셋을 선택하거나 직접 입력합니다.' },
            { step: '글자 수 기준 설정', desc: '공백 포함/제외 중 기업이 요구하는 기준을 선택합니다. 대부분의 대기업은 공백 포함 기준입니다.' },
            { step: '자소서 작성', desc: '텍스트 입력창에 자기소개서 내용을 작성합니다. 글자 수·바이트·줄 수가 실시간으로 표시됩니다.' },
            { step: '맞춤법 검사', desc: '맞춤법 검사 버튼을 클릭하면 텍스트가 클립보드에 복사되고 부산대 검사기가 새 탭으로 열립니다.' },
          ],
          faqs: [
            { q: '공백 포함과 공백 제외, 어느 기준으로 계산해야 하나요?', a: '대기업(삼성, 현대, LG 등)과 공공기관은 대부분 공백 포함 기준을 사용합니다. 지원 공고의 안내 사항을 확인하시고, 명시되지 않은 경우 공백 포함 기준을 사용하는 것이 안전합니다.' },
            { q: '바이트(Byte) 계산이 왜 필요한가요?', a: '일부 구형 채용 시스템이나 공공기관 시스템은 글자 수 대신 바이트 기준으로 제한을 설정합니다. 한글 1자는 UTF-8 기준 3바이트이므로, 바이트 카운터를 통해 시스템 오류를 미리 방지할 수 있습니다.' },
            { q: '작성 중 브라우저를 닫으면 내용이 사라지나요?', a: '아니요. 입력한 내용은 브라우저 LocalStorage에 자동 저장됩니다. 브라우저를 닫았다가 다시 열어도 마지막으로 작성한 내용이 복원됩니다. 단, 브라우저 데이터를 삭제하면 함께 삭제됩니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: 'Cover Letter Helper — Character Count & Spell Check Guide',
          description: 'A cover letter writing tool for job seekers. Features real-time character count (with/without spaces), byte calculation, various limit presets, and integration with a Korean spell checker. All data is stored in LocalStorage so your content persists even after closing the browser.',
          useCases: [
            { icon: '🏢', title: 'Corporate & Public Sector Applications', desc: 'Write cover letters within the character limits set by different companies and organizations.' },
            { icon: '🎓', title: 'Graduate School & Transfer Applications', desc: 'Monitor the length of research plans and study plans in real time.' },
            { icon: '📋', title: 'Job Portal Submissions', desc: 'Track character limits for each section on Korean job portals like Saramin and JobKorea.' },
            { icon: '🔍', title: 'Final Proofreading', desc: 'Integrate with Korean spell checkers to proofread before submission.' },
          ],
          steps: [
            { step: 'Select a Preset', desc: 'Choose a character limit preset that matches the company type you\'re applying to, or enter a custom limit.' },
            { step: 'Set Count Mode', desc: 'Choose whether to count with or without spaces. Most large Korean companies use the "with spaces" standard.' },
            { step: 'Write Your Cover Letter', desc: 'Type your cover letter in the text area. Character count, bytes, and line count update in real time.' },
            { step: 'Spell Check', desc: 'Click the spell check button to copy the text to your clipboard and open the spell checker in a new tab.' },
          ],
          faqs: [
            { q: 'Which character count standard should I use — with or without spaces?', a: 'Most large corporations (Samsung, Hyundai, LG, etc.) and public institutions use the "with spaces" standard. Check the application guidelines; if not specified, using "with spaces" is the safer choice.' },
            { q: 'Why is byte counting needed?', a: 'Some older recruitment systems and government systems set limits in bytes rather than characters. Since one Korean character is 3 bytes in UTF-8, the byte counter helps you avoid system errors in advance.' },
            { q: 'Will my content be lost if I close the browser?', a: 'No. Your content is automatically saved to the browser\'s LocalStorage. It will be restored the next time you open the page. Note that clearing your browser data will also delete the saved content.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        },
};
