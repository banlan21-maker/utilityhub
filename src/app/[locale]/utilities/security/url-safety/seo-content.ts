// 하단 SEO 섹션 내용 — page.tsx(서버)에서 SeoSection 으로 그린다
import type { SeoContent } from '@/app/components/SeoSection';

export const SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
          title: "URL 피싱 & 악성코드 검사기란 무엇인가요?",
          description: "URL 피싱 검사기는 의심스러운 링크를 Google Safe Browsing API로 즉시 검사해 악성코드(Malware), 피싱(Phishing), 원치 않는 소프트웨어(PUA) 여부를 알려주는 온라인 보안 도구입니다. 이메일·카카오톡·문자로 받은 링크를 클릭하기 전에 먼저 이 도구로 검사하는 것만으로도 피싱 사기, 랜섬웨어 감염, 개인정보 탈취 등 다양한 사이버 위협으로부터 스스로를 보호할 수 있습니다. Google의 글로벌 위협 데이터베이스를 실시간으로 대조하므로 높은 정확도를 제공합니다.",
          useCases: [
            { icon: '📧', title: '스팸 & 피싱 이메일 링크 검사', desc: '의심스러운 이메일의 링크를 클릭하기 전 복사해서 검사하면 피싱 사이트로의 접속을 미리 차단할 수 있습니다.' },
            { icon: '💬', title: '카카오톡 & 문자 링크 검사', desc: "택배 배송 알림, 이벤트 당첨 문자 등 출처 불명의 링크를 '클릭 전 검사'하는 습관으로 스미싱을 예방합니다." },
            { icon: '🏢', title: '기업 보안 정책 교육', desc: '보안 담당자나 교육 목적으로 악성 URL 샘플을 안전하게 분석하거나, 직원 보안 인식 교육 자료로 활용합니다.' },
            { icon: '🔗', title: '단축 URL 원본 안전성 확인', desc: 'bit.ly, tinyurl 등 단축 URL의 실제 목적지를 파악하기 어려울 때, 단축 전 URL을 알고 있다면 사전에 검사합니다.' },
          ],
          steps: [
            { step: '의심 URL 입력', desc: '검사하고 싶은 링크를 입력창에 붙여넣습니다. https:// 없이 도메인만 입력해도 자동으로 인식되어 자동으로 https://를 붙여 검사합니다.' },
            { step: '검사 실행', desc: "'검사하기' 버튼을 클릭하거나 Enter를 누르면 Google Safe Browsing API로 즉시 검사가 시작됩니다. 수 초 이내에 결과가 반환됩니다." },
            { step: '결과 확인', desc: "✅ '안전한 URL'이면 접속해도 됩니다. 🚨 '위험'이 표시되면 절대 클릭하지 마세요. 위협 유형(악성코드/피싱/유해 앱)도 함께 표시됩니다." },
            { step: '추가 URL 검사', desc: "'다른 URL 검사하기' 버튼을 클릭하면 입력창이 초기화되어 다음 링크를 즉시 검사할 수 있습니다. 여러 개의 의심 링크를 연속으로 빠르게 검사하기에 적합합니다." },
          ],
          faqs: [
            { q: '검사 결과가 안전이어도 100% 믿어도 되나요?', a: "Google Safe Browsing은 수십억 개의 URL을 데이터베이스로 보유하지만, 최근 생성된 신규 피싱 사이트는 아직 등록되지 않았을 수 있습니다. '안전' 결과는 '알려진 위협 없음'을 의미하며, 도메인 철자가 이상하거나 출처가 불명확한 링크는 주의하세요." },
            { q: '검사한 URL이 저장되거나 제3자에게 공유되나요?', a: 'Google Safe Browsing API에 URL을 전송해 검사합니다. Google의 개인정보처리방침에 따라 처리되며, 이 사이트의 서버에는 저장되지 않습니다. URL 검사 기록은 별도로 보관하지 않습니다.' },
            { q: '기업 내부 URL(인트라넷)도 검사할 수 있나요?', a: '내부 IP(192.168.x.x, 10.x.x.x 등) 또는 localhost는 외부 접근이 불가능하므로 Safe Browsing 검사에서 의미 있는 결과를 얻기 어렵습니다. 공개 인터넷 URL 검사에 활용하세요.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        },
  en: {
          title: "What is the URL Phishing & Malware Checker?",
          description: "This URL safety checker instantly scans suspicious links against the Google Safe Browsing API to detect malware, phishing, and unwanted software threats. Before clicking any link received via email, KakaoTalk, or SMS, paste it here first — this simple habit can protect you from phishing scams, ransomware infections, and credential theft. Google's global threat database of billions of URLs provides high detection accuracy for known threats.",
          useCases: [
            { icon: '📧', title: 'Suspicious Email Link Checking', desc: 'Before clicking any email link, copy it and run a safety check to block access to phishing sites before it happens.' },
            { icon: '💬', title: 'SMS & Chat Link Verification', desc: "Verify links in delivery notifications, event prize messages, or unknown senders before tapping — prevent smishing attacks." },
            { icon: '🏢', title: 'Corporate Security Training', desc: 'Security managers can use this tool to safely demonstrate malicious URL examples during employee security awareness training.' },
            { icon: '🔗', title: 'Shortened URL Safety Check', desc: "When a shortened URL's destination is unclear, check the full destination URL for safety before clicking." },
          ],
          steps: [
            { step: 'Enter the suspicious URL', desc: 'Paste the link you want to check. The domain alone (without https://) is also recognized automatically — the tool prepends https:// before scanning.' },
            { step: 'Run the check', desc: "Click 'Check URL' or press Enter to instantly query the Google Safe Browsing API. Results are returned within seconds." },
            { step: 'Review the result', desc: "✅ 'Safe' means no known threats — proceed with caution. 🚨 'Warning' means a known threat was detected — do not click the original link. The threat type (malware/phishing/PUA) is shown." },
            { step: 'Check another URL', desc: "Click 'Check Another URL' to clear the input and immediately scan the next link. This makes it easy to quickly verify multiple suspicious links in a row." },
          ],
          faqs: [
            { q: "Is a \"Safe\" result 100% guaranteed?", a: "Google Safe Browsing covers billions of URLs but newly created phishing sites may not yet be indexed. 'Safe' means 'no known threats found' — still exercise caution with domains that look suspicious, misspelled, or unfamiliar." },
            { q: 'Is the checked URL stored or shared?', a: "The URL is sent to the Google Safe Browsing API for checking, processed under Google's privacy policy. It is not stored on our servers, and we do not keep a log of checked URLs." },
            { q: 'Can I check internal/intranet URLs?', a: 'Internal IPs (192.168.x.x, 10.x.x.x, localhost) are not externally accessible so Safe Browsing results are not meaningful for them. This tool is best suited for checking public internet URLs.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        },
};
