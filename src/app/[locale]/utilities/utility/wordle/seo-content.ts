// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '일일 단어 퍼즐: 자모로 맞히는 한글 워들',
          description: '일일 단어 퍼즐은 하루에 한 번, 모든 사람에게 같은 단어가 나오는 워들(Wordle) 방식의 단어 맞히기 게임입니다. 한글 판은 단어를 두벌식 자판에서 누르는 순서대로 자음과 모음으로 풀어 6칸에 맞춥니다. 예를 들어 "학생"은 ㅎ·ㅏ·ㄱ·ㅅ·ㅐ·ㅇ, "과일"은 겹모음 ㅘ를 ㅗ와 ㅏ로 나눠 ㄱ·ㅗ·ㅏ·ㅇ·ㅣ·ㄹ이 됩니다. 글자(음절) 단위로 비교하면 한 칸에 올 수 있는 글자가 1만 개가 넘어 힌트가 거의 나오지 않지만, 자모로 나누면 자음과 모음의 위치를 하나씩 좁혀 가며 여섯 번 안에 추리로 정답에 다가갈 수 있습니다. 정답은 국립국어원 「한국어 학습용 어휘 목록」의 1·2단계 명사 가운데 자모가 6개인 388개 단어에서 나오고, 입력할 수 있는 단어는 약 1,500개입니다. 목록에 없는 단어를 넣으면 기회를 쓰지 않고 다시 입력하게 합니다. 영어 판은 원조 워들처럼 알파벳 5글자이며 약 6,400개의 영어 단어를 입력할 수 있습니다. 기기 시계 기준 자정마다 새 문제가 열리고, 한글·영어 판의 진행 상황과 연승·승률·맞힌 횟수 분포는 브라우저에 따로 저장됩니다. 결과는 정답이 드러나지 않는 색깔 칸으로 복사해 친구에게 보낼 수 있습니다.',
          useCases: [
            { icon: '☕', title: '하루 5분 두뇌 운동', desc: '출근길이나 점심시간에 하루 한 문제만 풀면 됩니다. 자음과 모음의 자리를 따져 보는 추리라 단순 암기보다 집중력과 어휘 감각을 함께 씁니다.' },
            { icon: '👨‍👩‍👧', title: '가족·친구와 같은 문제 겨루기', desc: '모든 사람이 같은 날 같은 단어를 풀기 때문에, 결과 복사로 🟩🟨⬜ 칸을 단톡방에 올려 누가 더 적은 횟수로 맞혔는지 정답을 드러내지 않고 비교할 수 있습니다.' },
            { icon: '📚', title: '한국어 학습', desc: '정답은 국립국어원이 한국어 학습자용으로 고른 기초 어휘라 받침과 겹모음 구조를 익히기 좋고, 게임이 끝나면 표준국어대사전 뜻풀이로 바로 이동할 수 있습니다.' },
            { icon: '🔤', title: '영어 단어 연습', desc: 'English 탭에서는 원조 워들처럼 다섯 글자 영어 단어를 맞힙니다. 영어 단어를 공부하는 학생이 철자 감각과 자주 쓰는 단어를 익히는 연습용으로 쓸 수 있습니다.' },
          ],
          steps: [
            { step: '언어 고르기', desc: '한글(자모 6칸) 또는 English(5글자)를 고릅니다. 두 판은 따로 진행되며 하루에 각각 한 번씩 풀 수 있고, 언어를 바꿔도 풀던 판은 그대로 남습니다.' },
            { step: '단어 입력', desc: '화면 자판이나 컴퓨터 키보드로 입력합니다. 한글은 한/영 전환 없이 키보드 자리 그대로 누르면 자모가 들어가고, 된소리와 ㅒ·ㅖ는 Shift(⇧)를 함께 누릅니다.' },
            { step: '색깔 힌트 읽기', desc: '초록은 자리까지 맞은 칸, 노랑은 단어에 있지만 자리가 다른 칸, 회색은 단어에 없는 자모입니다. 자판에도 같은 색이 표시되어 남은 자모를 고르기 쉽습니다.' },
            { step: '결과 확인·공유', desc: '여섯 번 안에 맞히면 연승이 쌓이고, 결과 창에서 정답의 뜻을 확인하거나 색깔 칸 결과를 복사해 공유합니다. 다음 문제까지 남은 시간도 표시됩니다.' },
          ],
          faqs: [
            { q: '한글은 왜 글자가 아니라 자모로 맞히나요?', a: '글자 단위로 비교하면 한 칸에 들어갈 수 있는 글자가 1만 개가 넘어 노란색·초록색 힌트가 거의 나오지 않고, 사실상 운으로 맞히게 됩니다. 자모로 나누면 자음 19개와 모음 몇 개 안에서 위치를 추리하게 되어 원조 워들처럼 여섯 번 안에 풀 수 있는 난이도가 됩니다.' },
            { q: '겹모음과 받침은 칸을 어떻게 나누나요?', a: '두벌식 자판에서 누르는 순서 그대로입니다. ㅘ·ㅝ·ㅢ 같은 겹모음은 ㅗ+ㅏ처럼 두 칸, ㄺ·ㄳ 같은 겹받침도 두 칸이고, ㄲ·ㅆ 같은 된소리와 ㅐ·ㅔ는 키 하나라서 한 칸입니다. 그래서 "과일"은 ㄱ·ㅗ·ㅏ·ㅇ·ㅣ·ㄹ 여섯 칸입니다.' },
            { q: '입력한 단어가 목록에 없다고 나와요.', a: '입력할 수 있는 한글 단어는 국립국어원 학습용 어휘와 보충 단어 가운데 자모가 정확히 6개인 약 1,500개입니다. "사과"(ㅅㅏㄱㅗㅏ, 5칸)처럼 자모 수가 6개가 아닌 단어는 넣을 수 없습니다. 목록에 없는 단어는 기회를 쓰지 않으니 다른 단어로 다시 시도해 보세요.' },
            { q: '새 문제는 언제 나오고, 연승은 어떻게 세나요?', a: '기기 시계 기준 자정마다 새 문제가 열립니다. 문제를 맞히면 연승이 1 늘고, 하루를 건너뛰거나 여섯 번 안에 맞히지 못하면 연승은 0이 되지만 최대 연승과 맞힌 횟수 분포는 남습니다. 기록은 이 기기의 브라우저에만 저장되며 서버로 보내지 않습니다.' },
          ],
        },
  en: {
          title: 'Daily Word Puzzle: Wordle in Korean and English',
          description: 'The Daily Word Puzzle is a free Wordle-style game: everyone gets the same word each day and has six tries to find it. The English board uses five letters and accepts about 6,400 English words, with answers drawn from roughly 840 common words. The Korean board works differently from a simple syllable match: each word is split into the jamo you press on a standard 2-set Korean keyboard, giving six tiles. "학생" becomes ㅎ·ㅏ·ㄱ·ㅅ·ㅐ·ㅇ, and "과일" splits its compound vowel ㅘ into ㅗ and ㅏ. Comparing whole syllables gives almost no hints because there are more than 11,000 possible syllables, while jamo tiles let you narrow down consonants and vowels one by one. Korean answers are 388 everyday nouns from the National Institute of Korean Language learner vocabulary list. A new puzzle opens at midnight on your device, words that are not in the list do not use up a try, and your progress, streak, win rate and guess distribution are stored separately for each language in your browser. Share your result as coloured squares without spoiling the answer.',
          useCases: [
            { icon: '☕', title: 'A Five-Minute Daily Habit', desc: 'Solve one puzzle on your commute or lunch break and keep your streak alive; it exercises deduction and vocabulary rather than memorisation.' },
            { icon: '👨‍👩‍👧', title: 'Compete with Friends', desc: 'Everyone gets the same word each day, so you can post your coloured squares in a group chat and compare tries without revealing the answer.' },
            { icon: '📚', title: 'Learn Korean', desc: 'Korean answers come from a basic learner vocabulary list, which makes the jamo board good practice for final consonants and compound vowels.' },
            { icon: '🔤', title: 'English Spelling Practice', desc: 'The English board plays like the original Wordle and suits students building spelling instincts with common five-letter words.' },
          ],
          steps: [
            { step: 'Pick a Board', desc: 'Choose 한글 (6 jamo) or English (5 letters). Each board has its own daily puzzle and keeps its progress when you switch.' },
            { step: 'Type a Word', desc: 'Use the on-screen keys or your keyboard. For Korean you can type on the physical key positions without switching input; hold Shift for ㄲ ㄸ ㅃ ㅆ ㅉ ㅒ ㅖ.' },
            { step: 'Read the Colours', desc: 'Green is the right spot, yellow is in the word but elsewhere, and grey is not in the word. The keyboard shows the same colours.' },
            { step: 'Share Your Result', desc: 'Solve it within six tries to build your streak, look up the answer in a dictionary and copy your coloured result to share.' },
          ],
          faqs: [
            { q: 'Why does the Korean board use jamo instead of syllables?', a: 'With more than 11,000 possible syllables, a syllable-by-syllable match almost never gives a yellow or green hint. Splitting words into jamo means you work with 19 consonants and a handful of vowels, which makes six tries a fair challenge.' },
            { q: 'How are compound vowels and final consonants counted?', a: 'Exactly as you type them on a 2-set keyboard: compound vowels like ㅘ and double finals like ㄺ take two tiles, while tense consonants like ㄲ and vowels like ㅐ are one key and one tile.' },
            { q: 'Why is my word "not in word list"?', a: 'The Korean board accepts about 1,500 words with exactly six jamo, and the English board about 6,400 five-letter words. Words outside the list do not use up a try, so just enter another word.' },
            { q: 'When does a new puzzle appear?', a: 'At midnight on your device clock. Solving it adds one to your streak; skipping a day or failing resets it to zero, but your best streak and guess distribution stay in your browser.' },
          ],
        },
};
