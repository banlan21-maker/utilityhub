// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: '비밀번호 강도 측정 & 생성기란 무엇인가요?',
          description: '강력한 비밀번호는 계정 보안의 첫 번째 방어선입니다. 이 도구는 암호화학적으로 안전한 난수(crypto.getRandomValues)를 사용해 추측이 불가능한 비밀번호를 생성하며, 입력한 비밀번호의 보안 강도를 비트(bit) 단위 엔트로피로 정확하게 측정합니다. 모든 처리는 브라우저 내에서만 이루어지며 서버로 데이터가 전송되지 않아 완벽하게 프라이버시가 보호됩니다. 길이, 대소문자, 숫자, 특수문자 포함 여부를 조합해 상황에 맞는 최적의 비밀번호를 생성하세요.',
          useCases: [
            { icon: '🔐', title: '신규 계정 비밀번호 생성', desc: '웹사이트 가입 시 대소문자·숫자·특수문자가 혼합된 강력한 비밀번호를 즉시 생성합니다.' },
            { icon: '🏦', title: '금융 계정 보안 강화', desc: '뱅킹, 증권 계정용 16자 이상의 고강도 비밀번호를 생성해 금융 사기를 예방합니다.' },
            { icon: '🔍', title: '기존 비밀번호 보안 점검', desc: '분석 모드에서 현재 사용 중인 비밀번호의 강도와 해킹 소요 예상 시간을 확인합니다.' },
            { icon: '🏢', title: '기업 IT 보안 정책 준수', desc: '12자 이상, 대소문자·숫자·특수문자 포함 등 기업 비밀번호 정책에 맞는 비밀번호를 생성합니다.' },
          ],
          steps: [
            { step: '생성 또는 분석 모드 선택', desc: '상단 탭에서 새 비밀번호를 만들 때는 생성(Generate) 모드를, 현재 사용 중인 비밀번호의 보안을 점검할 때는 분석(Analyze) 모드를 선택합니다.' },
            { step: '옵션 설정 및 생성', desc: '생성 모드에서는 슬라이더로 길이(8~64자)를 조정하고, 대문자·소문자·숫자·특수문자 포함 여부와 혼동 문자(0, O, 1, l) 제외 옵션을 설정한 후 생성 버튼을 클릭합니다.' },
            { step: '강도 및 엔트로피 확인', desc: '강도 게이지, 비트 단위 엔트로피, 최신 GPU 클러스터(1조 회/초) 기준 해킹 소요 예상 시간을 확인합니다. 72비트 이상이면 사실상 해킹이 불가능한 수준입니다.' },
            { step: '복사 및 저장', desc: '복사 버튼으로 생성된 비밀번호를 클립보드에 저장한 뒤, 비밀번호 관리자(1Password, Bitwarden 등)에 즉시 등록하여 안전하게 보관합니다.' },
          ],
          faqs: [
            { q: '엔트로피(Entropy)가 높을수록 좋은 비밀번호인가요?', a: '네. 엔트로피(비트)는 비밀번호가 얼마나 예측하기 어려운지를 수치로 나타냅니다. 일반적으로 72비트 이상이면 최신 GPU 클러스터(1조 회/초 공격)로도 사실상 해킹이 불가능한 수준이며, 128비트 이상이면 양자 컴퓨터 위협에도 대비할 수 있습니다.' },
            { q: '비밀번호가 서버로 전송되지 않나요?', a: '이 도구의 모든 처리(생성, 분석, 강도 측정)는 100% 브라우저 내 JavaScript에서 실행됩니다. 네트워크 요청이 발생하지 않으며 입력한 비밀번호를 포함한 어떤 개인 데이터도 외부 서버로 전송되지 않습니다.' },
            { q: '생성된 비밀번호는 얼마나 안전한가요?', a: 'Web Crypto API의 crypto.getRandomValues()를 사용해 암호학적으로 안전한 진성 난수를 생성합니다. 예측 가능한 Math.random() 기반 생성기와 달리 패턴이 없어 무차별 대입 공격에 매우 강합니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: 'What is a Password Strength Checker & Generator?',
          description: 'A strong password is your first line of defense for account security. This tool generates unguessable passwords using the cryptographically secure Web Crypto API (crypto.getRandomValues), and accurately measures the strength of any password using bit-level entropy. All processing happens entirely in your browser — no data is sent to any server — ensuring complete privacy. Customize length (8–64 chars), character sets (uppercase, lowercase, digits, symbols), and ambiguous character exclusion to create the right password for every situation.',
          useCases: [
            { icon: '🔐', title: 'Account Sign-up', desc: 'Generate a strong mixed-character password instantly when creating new accounts.' },
            { icon: '🏦', title: 'Financial Account Security', desc: 'Create 16+ character high-entropy passwords for banking and investment accounts to prevent fraud.' },
            { icon: '🔍', title: 'Password Audit', desc: 'Check the strength and estimated crack time of your existing passwords in Analyze mode.' },
            { icon: '🏢', title: 'Enterprise Policy Compliance', desc: 'Generate passwords meeting corporate security policies: 12+ chars, mixed case, numbers, symbols.' },
          ],
          steps: [
            { step: 'Select Mode', desc: 'Pick Generate mode to create a new password, or switch to Analyze mode to evaluate the strength of a password you already use.' },
            { step: 'Configure & Generate', desc: 'In Generate mode, drag the slider to set length (8–64 chars), toggle uppercase, lowercase, digits, symbols, and ambiguous character exclusion, then click Generate.' },
            { step: 'Check Strength & Entropy', desc: 'Review the strength gauge, bit-level entropy score, and estimated crack time based on a 1-trillion-guesses-per-second attack. 72+ bits is considered practically uncrackable.' },
            { step: 'Copy & Store Safely', desc: 'Click the copy button to save the password to your clipboard, then immediately store it in a password manager like Bitwarden or 1Password.' },
          ],
          faqs: [
            { q: 'Does higher entropy always mean a better password?', a: 'Yes. Entropy measures unpredictability in bits. Generally, 72+ bits of entropy is considered practically uncrackable by modern GPU clusters running at 1 trillion guesses per second. 128+ bits provides resistance even against future quantum computing threats.' },
            { q: 'Is my password sent to your server?', a: 'No. All generation and analysis runs 100% in your browser via JavaScript. No network request is made at any point, and no personal data — including the passwords you type or generate — ever leaves your device.' },
            { q: 'How secure is the password generator?', a: 'It uses the Web Crypto API\'s crypto.getRandomValues(), which produces cryptographically secure true random numbers with no detectable pattern. This is far more secure than Math.random()-based generators, which are predictable and should never be used for security-sensitive purposes.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        },
};
