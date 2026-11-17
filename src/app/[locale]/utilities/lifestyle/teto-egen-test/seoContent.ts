import type { SeoContent } from '@/app/components/SeoSection';

/**
 * 테토·에겐 테스트 SEO 콘텐츠.
 * page.tsx(한국어 FAQPage JSON-LD)와 SeoSection(화면 + 영어 FAQPage JSON-LD)이 같은 데이터를 쓴다.
 * 점수 규칙은 components/QuestionScreen.tsx · ResultScreen.tsx와 일치해야 한다
 * (문항당 1점, 높은 쪽이 결과, 5:5 동점은 테토, 퍼센트 = 높은 쪽 점수 / 10).
 */
export const TETO_EGEN_SEO: { ko: SeoContent; en: SeoContent } = {
  ko: {
    title: '테토·에겐 테스트란?',
    description:
      "테토·에겐 테스트는 '테토(테스토스테론)'와 '에겐(에스트로겐)'이라는 호르몬 이름을 빌려 연애할 때의 성향을 재미있게 나눠 보는 10문항 테스트입니다. 온라인 커뮤니티에서 '테토남', '에겐녀' 같은 말이 유행하면서 대담하고 주도적인 성향을 테토, 섬세하고 배려 깊은 성향을 에겐이라고 부르게 되었지만, 실제 호르몬 수치를 재는 검사는 아닙니다. 먼저 성별을 고른 뒤 평소 주변에서 듣는 평가, 데이트 스타일링, 마음에 드는 사람에게 다가가는 방식, 연인과 다툴 때의 말투, 주말에 에너지를 충전하는 방법 등 10가지 상황에서 A와 B 중 나와 더 가까운 쪽을 고르면 됩니다. 답 하나마다 테토 또는 에겐 쪽에 1점이 쌓이고, 10문항이 끝나면 점수가 더 높은 쪽이 내 유형이 됩니다. 예를 들어 테토 쪽 답을 7개, 에겐 쪽 답을 3개 고른 여성이라면 결과는 '대담하고 주도적인 테토녀'와 'Teto 70%'로 나오고, 찰떡 궁합으로는 '섬세하고 다정다감한 에겐남'이 표시됩니다. 5대 5 동점이면 테토 유형으로 분류됩니다. 결과는 테토남·에겐남·테토녀·에겐녀 네 가지이며, 유형별 특징 설명과 궁합 상대, 점수 세부 내역을 함께 보여 줍니다. 질문은 연애 장면을 중심으로 짜여 있어 성격 전반보다는 관계 속에서 내가 앞에서 이끄는 쪽인지, 곁에서 챙기는 쪽인지를 가볍게 확인하는 데 초점이 맞춰져 있습니다. 답변은 저장되지 않으며 '다시 테스트하기'로 몇 번이든 새로 해 볼 수 있습니다. 친구나 연인과 각자 해 보고 결과를 비교하며 이야깃거리로 삼기 좋은 가벼운 재미용 테스트입니다.",
    useCases: [
      {
        icon: '💬',
        title: '친구들과 대화 소재로',
        desc: '모임이나 단톡방에서 각자 테스트를 해 보고 테토·에겐 결과와 점수를 비교하면, 평소 서로를 어떻게 보고 있었는지 자연스럽게 이야기가 이어집니다.',
      },
      {
        icon: '💑',
        title: '연인·썸 상대와 함께',
        desc: "연인이나 썸 타는 상대와 나란히 풀어 보고 '찰떡 궁합'에 나온 유형이 실제 서로의 모습과 얼마나 닮았는지 웃으며 맞춰 보는 가벼운 데이트 놀이로 쓸 수 있습니다.",
      },
      {
        icon: '🪞',
        title: '내 연애 습관 돌아보기',
        desc: '다툴 때 바로 말하는 편인지, 상대 기분부터 살피는 편인지처럼 문항 속 상황을 하나씩 떠올리면서 내가 평소 관계에서 어떻게 행동하는지 가볍게 되돌아봅니다.',
      },
      {
        icon: '📱',
        title: 'SNS 참여형 콘텐츠',
        desc: "결과 화면의 유형 이름과 퍼센트를 캡처해 올리거나 공유 버튼으로 테스트 링크를 보내, 팔로워들에게 '너는 테토야, 에겐이야?'를 묻는 참여형 게시물로 활용할 수 있습니다.",
      },
    ],
    steps: [
      {
        step: '성별 선택하기',
        desc: "'먼저 성별을 선택해주세요' 화면에서 👨 남자 또는 👩 여자 버튼을 누릅니다. 성별은 점수 계산에는 쓰이지 않고, 결과를 테토남·에겐남·테토녀·에겐녀 중 어떤 이름으로 보여 줄지와 궁합 상대를 정하는 데만 쓰입니다.",
      },
      {
        step: '10개 질문에 답하기',
        desc: "질문마다 A와 B 두 보기 중 평소 나와 더 가까운 쪽을 누르면 바로 다음 질문으로 넘어갑니다. 상단의 '질문 1 / 10' 표시와 진행 막대로 남은 문항을 확인할 수 있고, 이전 질문으로 돌아가는 버튼은 없으니 신중하게 골라 주세요.",
      },
      {
        step: '결과 확인하기',
        desc: "마지막 질문에 답하면 내 유형 이름과 Teto 또는 Egen 퍼센트, '당신의 유형' 설명, '찰떡 궁합' 상대 유형, 테토·에겐 점수를 나눠 보여 주는 '점수 세부 내역'이 한 화면에 나타납니다.",
      },
      {
        step: '공유하거나 다시 하기',
        desc: "친구에게 공유 버튼으로 테스트 링크를 보내거나, '다시 테스트하기' 버튼을 눌러 성별 선택부터 새로 시작할 수 있습니다. 다른 날, 다른 기분에서 다시 해 보면 답이 달라지기도 하니 결과를 비교해 보세요.",
      },
    ],
    faqs: [
      {
        q: '테토·에겐이 정확히 무엇인가요?',
        a: '테토는 테스토스테론, 에겐은 에스트로겐에서 따온 말로, 온라인에서 유행한 성향 분류 신조어입니다. 테토는 대담함·주도성·직설적인 표현을, 에겐은 섬세함·배려·감성적인 표현을 가리킵니다. 이름만 호르몬에서 빌려 왔을 뿐 실제 호르몬 수치와는 아무 관계가 없고, 성별과 상관없이 누구나 테토 또는 에겐 성향을 보일 수 있습니다.',
      },
      {
        q: '이 테스트는 과학적으로 검증된 검사인가요?',
        a: '아니요. 이 테스트는 재미로 즐기는 오락용 콘텐츠이며, 심리학적으로 타당도나 신뢰도가 검증된 성격 검사가 아닙니다. 10개 문항에서 A·B 중 하나를 고르는 단순한 방식이라 그날의 기분이나 상황에 따라 결과가 쉽게 바뀔 수 있습니다. 결과를 근거로 자신이나 다른 사람을 판단하거나, 연애·인간관계에서 중요한 결정을 내리지는 않기를 권합니다.',
      },
      {
        q: '점수와 퍼센트는 어떻게 계산되나요?',
        a: "질문마다 고른 답에 따라 테토 또는 에겐 쪽에 1점씩 더해져 두 점수의 합은 항상 10점이 됩니다. 점수가 더 높은 쪽이 결과 유형이 되고, 퍼센트는 높은 쪽 점수를 10으로 나눈 값입니다. 예를 들어 테토 6점, 에겐 4점이면 'Teto 60%'로 표시되며, 5대 5 동점이면 테토 유형으로 분류됩니다.",
      },
      {
        q: '테토가 에겐보다 더 좋은 유형인가요?',
        a: '그렇지 않습니다. 테토와 에겐에는 우열이 없고, 앞에서 이끄는 매력과 곁에서 세심하게 챙기는 매력이라는 서로 다른 모습일 뿐입니다. 실제로는 누구나 두 성향을 모두 갖고 있으며, 직장에서는 테토처럼, 연인 앞에서는 에겐처럼 상황에 따라 다르게 나타나기도 합니다. 결과는 지금 답변에서 더 두드러진 쪽을 재미있게 보여 줄 뿐입니다.',
      },
      {
        q: '찰떡 궁합은 어떻게 정해지나요?',
        a: '이 테스트는 테토남과 에겐녀, 에겐남과 테토녀처럼 서로 반대 성향을 짝지어 주는 고정된 규칙으로 궁합을 보여 줍니다. 강한 성향과 부드러운 성향이 서로를 보완한다는 아이디어에서 나온 재미 요소일 뿐, 실제 연애가 잘될지를 예측하는 근거는 아닙니다. 두 사람의 궁합은 유형보다 대화 방식과 서로에 대한 이해에 훨씬 크게 좌우됩니다.',
      },
      {
        q: '답변이 저장되거나 어딘가로 전송되나요?',
        a: '선택한 성별과 답변은 화면에서 점수를 계산하는 데만 쓰이며, 이 테스트는 답변을 브라우저에 저장하거나 서버로 보내지 않습니다. 그래서 페이지를 새로고침하거나 닫으면 진행 중이던 답과 결과가 사라집니다. 결과를 남겨 두고 싶다면 결과 화면을 캡처해 두는 것이 가장 간단한 방법입니다.',
      },
    ],
  },
  en: {
    title: 'What Is the Teto-Egen Test?',
    description:
      "The Teto-Egen test is a light, 10-question quiz that borrows the names of two hormones — \"Teto\" from testosterone and \"Egen\" from estrogen — to sort your dating style into one of two playful types. The labels became popular slang online in Korea, where Teto describes someone bold, direct and quick to take the lead, and Egen describes someone sensitive, attentive and harmony-seeking. Despite the names, nothing here measures hormones. You start by choosing Male or Female, then work through ten everyday scenarios — what friends say about you, how you dress for a date, how you approach a crush, how you handle an argument with a partner, how you recharge on the weekend — and pick whichever of option A or B feels closer to you. Each answer adds one point to either the Teto or the Egen side, and the side with more points becomes your type. For example, a woman who picks seven Teto-leaning answers and three Egen-leaning ones gets \"The Bold, Take-Charge Teto Girl\" at Teto 70%, with \"The Sensitive, Warm-Hearted Egen Guy\" shown as her perfect match. A 5–5 tie counts as Teto. There are four results in all — Teto guy, Egen guy, Teto girl and Egen girl — each with a short description, a suggested match and a score breakdown. It is made for fun and conversation, not for diagnosis.",
    useCases: [
      {
        icon: '💬',
        title: 'An icebreaker with friends',
        desc: 'Have everyone in your group chat take the test, then compare Teto and Egen results and scores. It quickly turns into a fun conversation about how you all see each other.',
      },
      {
        icon: '💑',
        title: 'A game for couples',
        desc: 'Take it side by side with your partner or crush, then check whether the "Perfect Match" type actually resembles the two of you — a lighthearted little game for a quiet date night in.',
      },
      {
        icon: '🪞',
        title: 'Reflecting on your habits',
        desc: 'The scenarios — speaking up during an argument versus reading the room first, leading versus supporting — are a gentle prompt to think about how you usually behave in relationships.',
      },
      {
        icon: '📱',
        title: 'Social media content',
        desc: 'Screenshot your result title and percentage, or send the test link with the share buttons, and ask your followers "Are you Teto or Egen?" as an easy, interactive post.',
      },
    ],
    steps: [
      {
        step: 'Choose your gender',
        desc: 'On the "First, select your gender" screen, tap 👨 Male or 👩 Female. Gender is not used in scoring — it only decides whether your result is labeled as a Teto/Egen guy or girl and which match is shown.',
      },
      {
        step: 'Answer the 10 questions',
        desc: 'For each question, tap option A or B — whichever is closer to how you usually act — and the next question appears right away. The "Question 1 / 10" counter and progress bar show how far along you are; there is no back button.',
      },
      {
        step: 'Read your result',
        desc: 'After the last answer you see your type title with a Teto or Egen percentage, a "Your Type" description, the "Perfect Match" type with a short explanation, and a "Score Breakdown" showing both scores.',
      },
      {
        step: 'Share or retake',
        desc: 'Send the test link to friends with the share buttons, or press "Take the Test Again" to start over from gender selection. Answering on a different day or in a different mood can give a different result.',
      },
    ],
    faqs: [
      {
        q: 'What exactly are Teto and Egen?',
        a: 'Teto comes from testosterone and Egen from estrogen. They are popular online slang terms for two personality styles: Teto for bold, assertive and direct, Egen for sensitive, caring and emotionally expressive. Only the names come from hormones — the labels have nothing to do with your actual hormone levels, and anyone of any gender can lean Teto or Egen.',
      },
      {
        q: 'Is this test scientifically validated?',
        a: 'No. This is an entertainment quiz, not a psychological assessment, and it has not been tested for validity or reliability. Ten either-or questions can easily give a different answer depending on your mood that day. Please enjoy it for fun and do not use the result to judge yourself or anyone else, or to make important decisions about dating or relationships.',
      },
      {
        q: 'How are the score and percentage calculated?',
        a: 'Each answer adds one point to either the Teto or the Egen side, so the two scores always add up to 10. The higher score becomes your type, and the percentage is that higher score divided by 10. For example, 6 Teto and 4 Egen shows as Teto 60%. If you end up with a 5–5 tie, the result is classified as Teto.',
      },
      {
        q: 'Is Teto better than Egen?',
        a: 'Not at all. Neither type ranks above the other — leading from the front and caring from close by are simply two different kinds of charm. In real life most people show both, and which one comes out can change with the situation, such as being more Teto at work and more Egen with a partner. Your result just reflects which side stood out in your answers.',
      },
      {
        q: 'How is the perfect match decided?',
        a: 'The test uses a fixed rule that pairs opposite styles: Teto guy with Egen girl, and Egen guy with Teto girl. It is based on the fun idea that strong and gentle personalities balance each other, not on any research, so it cannot predict whether a real relationship will work. Real compatibility depends far more on communication and mutual understanding than on a quiz type.',
      },
      {
        q: 'Are my answers saved or sent anywhere?',
        a: 'Your gender choice and answers are only used on the page to calculate your score. This test does not save them in your browser or send them to a server, which also means refreshing or closing the page clears your progress and result. If you want to keep your result, taking a screenshot of the result screen is the simplest way.',
      },
    ],
  },
};
