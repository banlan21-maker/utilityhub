// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: "비밀번호 생성기 & 해킹 소요 시간이란 무엇인가요?",
          description: "이 강력한 비밀번호 생성기는 암호학적으로 안전한 난수(crypto.getRandomValues)를 이용해 예측 불가능한 무작위 비밀번호를 즉시 만들어줍니다. 단순히 비밀번호를 생성하는 것을 넘어, 생성된 비밀번호의 엔트로피(정보 이론적 복잡도)를 계산해 초당 1조 회 시도하는 최신 GPU 해킹 클러스터 기준으로 해독에 걸리는 예상 시간을 직관적으로 보여줍니다. 모든 처리는 브라우저에서만 이루어지므로 생성된 비밀번호는 서버에 저장되지 않습니다.",
          useCases: [
            { icon: '🏦', title: '금융 & 주요 계정 비밀번호', desc: '인터넷 뱅킹, 증권사, 거래소 등 금융 계정의 비밀번호는 최소 16자 이상, 대소문자+숫자+특수문자를 모두 포함한 강력한 비밀번호로 설정하세요.' },
            { icon: '🔐', title: '패스워드 매니저 마스터 키', desc: '1Password, Bitwarden 등 패스워드 매니저의 마스터 비밀번호는 최장 64자까지 생성해 최고 수준의 보안을 확보합니다.' },
            { icon: '🖥️', title: '서버 & API 시크릿 키', desc: '클라우드 서버 SSH 비밀번호, API 시크릿 키 등 시스템 보안에 필요한 무작위 문자열을 즉시 생성합니다.' },
            { icon: '👥', title: '임시 비밀번호 발급', desc: '신규 직원이나 시스템 계정에 임시 비밀번호를 빠르게 생성해 전달하고 첫 로그인 후 변경하도록 안내합니다.' },
          ],
          steps: [
            { step: '옵션 설정', desc: '비밀번호 길이(8~64자), 대문자/소문자/숫자/특수문자 포함 여부, 혼동 문자(0, O, I, l) 제외 여부를 설정합니다. 각 옵션을 조합하면 보안 수준이 어떻게 달라지는지 강도 바에서 실시간 확인할 수 있습니다.' },
            { step: '생성 버튼 클릭', desc: "'새 비밀번호 생성' 버튼을 클릭하면 즉시 새 비밀번호가 생성됩니다. 마음에 들 때까지 몇 번이든 클릭해 다시 생성할 수 있습니다." },
            { step: '해킹 시간 확인 후 복사', desc: '생성된 비밀번호의 강도(Very Weak~Very Strong)와 해킹 예상 시간을 확인하고, 복사 버튼으로 클립보드에 저장합니다.' },
            { step: '비밀번호 매니저에 저장', desc: '생성된 비밀번호를 1Password, Bitwarden 등 패스워드 매니저에 즉시 저장하세요. 복잡한 비밀번호를 기억하지 않아도 되므로, 계정마다 서로 다른 강력한 비밀번호를 유지할 수 있습니다.' },
          ],
          faqs: [
            { q: '얼마나 긴 비밀번호가 안전한가요?', a: '대소문자+숫자+특수문자 조합 기준으로 12자는 수천 년, 16자는 수조 년 이상이 걸립니다. 현실적으로 최소 12자 이상, 중요 계정은 16~20자를 권장합니다. 길이가 1자 늘 때마다 해킹 시간은 기하급수적으로 증가합니다.' },
            { q: '생성된 비밀번호가 서버에 저장되나요?', a: '절대 그렇지 않습니다. 비밀번호 생성은 브라우저의 crypto.getRandomValues API를 사용하며, 서버와의 통신이 전혀 없습니다. 생성된 비밀번호는 서버 어디에도 남지 않습니다.' },
            { q: '같은 옵션으로 생성하면 같은 비밀번호가 나오나요?', a: '아니요. crypto.getRandomValues는 매번 다른 암호학적 난수를 사용하므로 같은 설정으로도 매번 완전히 다른 비밀번호가 생성됩니다. 패턴을 예측하는 것이 불가능합니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: "What is a Password Generator & Crack Time Estimator?",
          description: "This password generator uses cryptographically secure random numbers (crypto.getRandomValues) to create unpredictable, high-entropy passwords instantly. Beyond generating passwords, it calculates the information-theoretic entropy and visualizes the estimated time to crack the password using a modern GPU cluster capable of 1 trillion guesses per second. All processing happens locally in your browser — generated passwords are never sent to any server.",
          useCases: [
            { icon: '🏦', title: 'Financial & Critical Account Passwords', desc: 'Generate 16+ character passwords with mixed uppercase, lowercase, digits, and symbols for banking, brokerage, and exchange accounts.' },
            { icon: '🔐', title: 'Password Manager Master Key', desc: 'Create a master password up to 64 characters long for your password manager (1Password, Bitwarden) with maximum security.' },
            { icon: '🖥️', title: 'Server & API Secret Keys', desc: 'Instantly generate random strings for cloud server SSH passwords, API secret keys, and system credentials.' },
            { icon: '👥', title: 'Temporary Password Issuance', desc: 'Quickly generate a temporary password for new employees or system accounts for first-login use.' },
          ],
          steps: [
            { step: 'Configure options', desc: 'Set password length (8–64), and toggle uppercase, lowercase, digits, symbols, and ambiguous character exclusion. Watch the strength bar update in real time as you change options.' },
            { step: 'Generate password', desc: "Click 'Generate New Password' to instantly create a new password. Click as many times as needed until satisfied." },
            { step: 'Check crack time & copy', desc: 'Review the strength rating (Very Weak to Very Strong) and estimated crack time, then click copy to save to clipboard.' },
            { step: 'Save to a password manager', desc: 'Paste the generated password into a password manager like 1Password or Bitwarden immediately. This lets you use a unique, complex password for every account without having to memorize any of them.' },
          ],
          faqs: [
            { q: 'How long should my password be?', a: 'With mixed uppercase, lowercase, digits, and symbols: 12 characters buys thousands of years; 16 characters buys trillions. A minimum of 12 characters is recommended; 16–20 for sensitive accounts. Each extra character multiplies crack time exponentially.' },
            { q: 'Is the generated password stored anywhere?', a: "No. Password generation uses the browser's crypto.getRandomValues API with zero server communication. Nothing is stored anywhere on our servers." },
            { q: 'Can the same settings produce the same password twice?', a: 'No. crypto.getRandomValues produces a different cryptographic random number each time, making the output completely unpredictable and resistant to pattern-based attacks.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        },
};
