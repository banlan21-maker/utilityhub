import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo
    ? '프리다이빙 드라이 트레이닝 | Apnea Pro | Utility Hub'
    : 'Freediving Dry Training Timer | Apnea Pro | Utility Hub';
  const description = isKo
    ? 'CO2·O2 테이블 자동 생성, 음성 가이드, 비프음, 시각 플래시로 프리다이빙 드라이 스태틱 훈련을 체계적으로 관리하세요.'
    : 'Auto-generate CO2 & O2 training tables with voice guide, beep alerts, and visual flash for structured freediving dry static apnea training.';
  const canonical = `https://www.theutilhub.com/${locale}/utilities/lifestyle/apnea-trainer`;
  return {
    title, description,
    alternates: {
      canonical,
      languages: {
        ko: 'https://www.theutilhub.com/ko/utilities/lifestyle/apnea-trainer',
        en: 'https://www.theutilhub.com/en/utilities/lifestyle/apnea-trainer',
        'x-default': 'https://www.theutilhub.com/ko/utilities/lifestyle/apnea-trainer',
      },
    },
    openGraph: { title, description, url: canonical, siteName: 'Utility Hub', locale: isKo ? 'ko_KR' : 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Apnea Pro 드라이 트레이닝 마스터',
  alternateName: 'Apnea Pro Dry Training Master',
  operatingSystem: 'Web Browser',
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  url: 'https://www.theutilhub.com/ko/utilities/lifestyle/apnea-trainer',
  description: 'CO2·O2 테이블 자동 생성, 음성 가이드, 비프음으로 프리다이빙 드라이 트레이닝을 체계적으로 관리하는 무료 웹 앱.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'CO2 테이블과 O2 테이블의 차이는 무엇인가요?', acceptedAnswer: { '@type': 'Answer', text: 'CO2 테이블은 이산화탄소 상승으로 인한 호흡 충동에 적응하는 훈련이며, O2 테이블은 저산소 상태에서 신체가 효율적으로 작동하도록 적응시키는 훈련입니다. 둘 다 PB(개인 최고 기록) 기반으로 자동 계산됩니다.' } },
    { '@type': 'Question', name: '드라이 트레이닝은 얼마나 자주 해야 하나요?', acceptedAnswer: { '@type': 'Answer', text: '주 3~4회를 권장합니다. CO2 테이블과 O2 테이블을 교차하여 진행하되, 충분한 회복 시간을 확보하는 것이 중요합니다. 매일 훈련하면 오히려 적응 효과가 감소할 수 있습니다.' } },
    { '@type': 'Question', name: '음성 가이드가 작동하지 않아요', acceptedAnswer: { '@type': 'Answer', text: '음성 가이드는 Web Speech API를 사용합니다. 브라우저 자동 재생 정책에 따라 처음 상호작용(버튼 클릭) 이후부터 작동합니다. Safari에서는 시스템 설정의 음성 권한도 확인하세요.' } },
    { '@type': 'Question', name: '이 앱의 결과를 공식 훈련 자료로 사용해도 되나요?', acceptedAnswer: { '@type': 'Answer', text: '본 앱의 훈련 테이블은 참고용 가이드라인입니다. 개인 건강 상태와 수준에 따라 조정이 필요할 수 있으며, 반드시 공인 프리다이빙 강사 또는 의료 전문가와 상담 후 활용하시기 바랍니다.' } },
  ],
};

// ── Client Component ──────────────────────────────────────────────────────────
import ApneaTrainerClient from './ApneaTrainerClient';
import ToolJsonLd from '@/app/components/ToolJsonLd';
import SeoSection from '@/app/components/SeoSection';
import { FAQ_KO, FAQ_EN } from './seo-content';

export default async function ApneaTrainerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      {locale === 'ko' ? (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        </>
      ) : (
        <ToolJsonLd href="/utilities/lifestyle/apnea-trainer" />
      )}
      <ApneaTrainerClient seo={<SeoSection ko={{
            title: 'Apnea Pro 드라이 트레이닝 마스터란?',
            description: 'Apnea Pro는 프리다이빙 입문자부터 고급 다이버까지 누구나 과학적으로 설계된 드라이 스태틱(육상 정적 숨 참기) 훈련을 체계적으로 수행할 수 있도록 돕는 전문 웹 앱입니다. CO2 내성 테이블과 O2 적응 테이블을 개인의 PB(최고 기록)에 맞춰 자동으로 생성하며, 음성 가이드(Web Speech API), 비프음(AudioContext), 시각적 플래시, 진동 등 4가지 알림 시스템을 동시에 활용하여 눈을 감고 훈련 중에도 단계 전환을 정확히 인지할 수 있습니다. 2분간의 워밍업 호흡 단계가 자동으로 포함되며, 훈련 이력이 로컬 저장소에 기록되어 진행 상황을 추적할 수 있습니다. 별도 앱 설치 없이 브라우저에서 즉시 사용 가능하며, 수영장에서 코치 없이 혼자 드라이 훈련할 때 이상적인 훈련 파트너입니다.',
            useCases: [
              { icon: '💨', title: 'CO₂ 내성 훈련', desc: '숨 참기 충동에 강해지고 싶은 프리다이버가 이산화탄소 내성을 체계적으로 기르기 위해 CO2 테이블을 활용할 수 있습니다. 8라운드 동안 휴식 시간을 15초씩 줄여가며 CO₂ 저항력을 점진적으로 향상시킵니다.' },
              { icon: '🫁', title: 'O₂ 적응 훈련', desc: '저산소 내성을 높이고 실제 다이빙 시 더 오랫동안 안전하게 숨을 참기 위해 O2 테이블을 활용합니다. 휴식 시간을 2분으로 고정하고 숨 참기 시간을 PB의 85%까지 점진적으로 늘려 저산소 적응 능력을 극대화합니다.' },
              { icon: '🏊', title: '수영장 훈련 전 육상 워밍업', desc: '물에 들어가기 전 드라이 트레이닝으로 신체와 정신을 미리 준비하고 싶은 다이버에게 적합합니다. 2분 워밍업 호흡 단계와 함께 점진적으로 훈련 강도를 높이는 구조로 부상 없이 효과적으로 준비할 수 있습니다.' },
              { icon: '📊', title: '기록 기반 훈련 관리', desc: 'PB 기록과 날짜별 훈련 이력을 자동으로 저장하여 꾸준한 훈련 진행 상황을 확인할 수 있습니다. 지난 10회 훈련 이력을 한눈에 볼 수 있어 실력 향상 추이를 객관적으로 파악하고 훈련 동기를 유지하는 데 도움을 줍니다.' },
            ],
            steps: [
              { step: 'PB 입력', desc: '화면 상단에서 본인의 최고 스태틱 기록(PB)을 분:초 형식으로 입력합니다. 예를 들어 2분 30초라면 "2:30"을 입력합니다. PB가 1분 미만이면 경고가 표시되므로 최소 1분 이상의 기록을 보유한 후 시작하세요.' },
              { step: '모드 선택', desc: 'CO2 내성 테이블(숨 참기 고정, 휴식 감소)과 O2 적응 테이블(휴식 고정, 숨 참기 증가) 중 오늘의 훈련 목적에 맞는 모드를 선택합니다. PB에 따라 자동 생성된 8라운드 테이블을 미리보기로 확인할 수 있습니다.' },
              { step: '훈련 시작', desc: '"훈련 시작" 버튼을 눌러 2분간의 워밍업 호흡 단계부터 자동으로 시작됩니다. 단계가 전환될 때 음성 가이드, 비프음, 화면 플래시가 동시에 알림을 주므로, 눈을 감고 편안하게 누운 자세로 훈련에 집중할 수 있습니다.' },
              { step: '완료 및 기록', desc: '8라운드를 모두 완료하면 축하 메시지와 함께 자동으로 훈련이 종료됩니다. 완료된 라운드 수와 날짜가 자동으로 저장되어 이력에 기록됩니다. 언제든 STOP 버튼으로 훈련을 중단할 수 있습니다.' },
            ],
            faqs: FAQ_KO,
          }} en={{
            title: 'What is Apnea Pro Dry Training Master?',
            description: 'Apnea Pro is a professional web app designed to help freediving practitioners of all levels perform scientifically structured dry static apnea training. It automatically generates CO2 tolerance and O2 adaptation tables based on your personal best (PB), and uses four simultaneous alert systems — voice guide (Web Speech API), beep sounds (Web Audio API), visual flash, and vibration — so you can train with eyes closed and still perceive every phase transition clearly. The 2-minute warm-up phase is built in automatically, training history is saved locally, and no app installation is required. It is the ideal training companion for solo dry training sessions at the pool or at home.',
            useCases: [
              { icon: '💨', title: 'CO₂ Tolerance Training', desc: 'Systematically build resistance to the urge to breathe using the CO2 table. Over 8 rounds, rest time decreases by 15 seconds each round while hold time stays fixed at 50% of your PB, progressively challenging your CO₂ tolerance.' },
              { icon: '🫁', title: 'O₂ Adaptation Training', desc: 'Train your body to operate efficiently under hypoxia using the O2 table. Rest is fixed at 2 minutes while hold time increases from 1 minute up to 85% of your PB across 8 rounds, maximizing low-oxygen adaptation.' },
              { icon: '🏊', title: 'Pre-pool Dry Warm-up', desc: 'Prepare your body and mind on land before entering the water. The built-in 2-minute breathing warm-up and gradual intensity progression make it a safe and effective pre-dive preparation routine.' },
              { icon: '📊', title: 'Progress Tracking', desc: 'PB and session history (rounds completed, mode, date) are saved automatically to local storage. View your last 10 sessions at a glance to monitor improvement trends and stay motivated over time.' },
            ],
            steps: [
              { step: 'Enter Your PB', desc: 'Type your personal best static apnea time in m:ss format at the top of the screen. For example, 2 minutes 30 seconds is entered as "2:30". A warning appears if PB is under 1 minute — ensure you have at least that baseline before starting.' },
              { step: 'Select Training Mode', desc: 'Choose CO2 Tolerance (hold fixed, rest decreasing) or O2 Adaptation (rest fixed, hold increasing) based on today\'s training goal. The 8-round table is automatically generated from your PB and shown in a preview table.' },
              { step: 'Start Training', desc: 'Tap "Start Training" to begin the automatic 2-minute warm-up phase. Voice guidance, beep sounds, and screen flashes alert you at every phase transition, so you can lie down with eyes closed and focus entirely on your breath.' },
              { step: 'Complete and Save', desc: 'After all 8 rounds, a completion message appears and the session is automatically logged. You can stop at any time with the large STOP button. Session records are saved locally and visible in the history section.' },
            ],
            faqs: FAQ_EN,
          }} />} />
    </>
  );
}
