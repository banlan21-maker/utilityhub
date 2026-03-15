'use client';

import { useState, useMemo } from 'react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';

/* ─── Hashtag Database ─── */
type Platform = 'instagram' | 'youtube';

const DB: Record<string, Record<Platform, string[]>> = {
  맛집: {
    instagram: ['#맛집', '#먹스타그램', '#음식스타그램', '#맛스타그램', '#foodstagram', '#서울맛집', '#강남맛집', '#홍대맛집', '#인스타맛집', '#오늘뭐먹지', '#점심뭐먹지', '#저녁뭐먹지', '#신상맛집', '#맛집탐방', '#맛집투어', '#핫플', '#데이트코스', '#맛집추천', '#맛집리뷰', '#오마카세', '#한식', '#양식', '#일식', '#중식', '#맛집지도', '#서울핫플', '#힙플레이스', '#분위기맛집', '#줄서는맛집', '#인스타맛집추천'],
    youtube: ['#맛집', '#맛집추천', '#맛집탐방', '#서울맛집추천', '#숨은맛집', '#맛집리뷰', '#음식리뷰', '#먹방', '#데이트코스', '#강남맛집추천', '#맛집정보', '#맛집브이로그', '#맛집투어', '#핫플맛집', '#맛집여행', '#오늘뭐먹지', '#식당추천', '#맛집top10', '#서울핫플', '#로컬맛집', '#한식맛집', '#분위기맛집', '#데이트식당', '#맛집지도', '#맛집정보공유', '#강남핫플', '#서울여행맛집', '#인기맛집', '#맛집순위', '#숨겨진맛집'],
  },
  카페: {
    instagram: ['#카페', '#카페스타그램', '#카페탐방', '#카페투어', '#감성카페', '#분위기카페', '#서울카페', '#핫카페', '#카페인스타', '#이쁜카페', '#카페라떼', '#커피', '#커피스타그램', '#디저트카페', '#베이커리카페', '#카페뷰', '#카페OOTD', '#힙카페', '#특별한카페', '#숨은카페'],
    youtube: ['#카페', '#카페투어', '#서울카페추천', '#감성카페', '#카페리뷰', '#커피리뷰', '#카페브이로그', '#신상카페', '#숨은카페', '#디저트', '#베이커리', '#카페탐방', '#카페오픈', '#카페창업', '#바리스타', '#라떼아트', '#에스프레소', '#카페메뉴추천', '#카페인테리어', '#힙한카페'],
  },
  여행: {
    instagram: ['#여행', '#여행스타그램', '#여행사진', '#여행에미치다', '#국내여행', '#해외여행', '#여행인스타', '#여행기록', '#여행일상', '#여행감성', '#여행맛집', '#여행추천', '#여행tip', '#여행지추천', '#여행준비', '#여행계획', '#여행사진공유', '#여행에빠지다', '#여행로그', '#여행좋아'],
    youtube: ['#여행', '#국내여행', '#해외여행', '#여행브이로그', '#여행추천', '#여행tip', '#여행정보', '#배낭여행', '#패키지여행', '#여행준비물', '#여행팁', '#숨은여행지', '#여행코스', '#여행경비', '#여행일정', '#혼여', '#커플여행', '#가족여행', '#여행유튜버', '#여행vlog'],
  },
  유럽여행: {
    instagram: ['#유럽여행', '#유럽', '#유럽감성', '#파리', '#로마', '#바르셀로나', '#암스테르담', '#프라하', '#빈', '#취리히', '#런던', '#유럽여행스타그램', '#유럽일주', '#배낭유럽', '#유럽핫플', '#유럽맛집', '#유럽카페', '#유럽브이로그', '#유럽감성사진', '#유럽인스타'],
    youtube: ['#유럽여행', '#유럽여행브이로그', '#파리여행', '#이탈리아여행', '#스페인여행', '#유럽배낭여행', '#유럽여행경비', '#유럽일주', '#유럽여행준비', '#유럽여행코스', '#유럽여행팁', '#유럽여행정보', '#유럽여행추천', '#유럽카페투어', '#유럽맛집', '#유럽날씨', '#유럽숙소', '#유럽교통', '#유럽여행하기좋은나라', '#유럽여행루트'],
  },
  뷰티: {
    instagram: ['#뷰티', '#뷰티스타그램', '#메이크업', '#화장품', '#스킨케어', '#뷰티템', '#데일리메이크업', '#뷰티유튜버', '#뷰티인스타', '#뷰티추천', '#뷰티리뷰', '#코스메틱', '#뷰티팁', '#메이크업팁', '#뷰티하울', '#신상뷰티', '#뷰티아이템', '#뷰티일상', '#여성뷰티', '#뷰티정보'],
    youtube: ['#뷰티', '#메이크업', '#스킨케어', '#뷰티리뷰', '#화장품추천', '#뷰티하울', '#메이크업튜토리얼', '#데일리메이크업', '#뷰티팁', '#신상화장품', '#뷰티템추천', '#피부관리', '#기초화장품', '#색조화장품', '#뷰티유튜버', '#메이크업챌린지', '#뷰티루틴', '#스킨케어루틴', '#뷰티추천', '#화장품리뷰'],
  },
  패션: {
    instagram: ['#패션', '#패션스타그램', '#OOTD', '#오오티디', '#데일리룩', '#패션인스타', '#스트릿패션', '#패션코디', '#오늘의코디', '#패션피플', '#패션스타', '#트렌드패션', '#패션하울', '#코디추천', '#여성패션', '#남성패션', '#패션아이템', '#신상패션', '#패션위크', '#패션브랜드'],
    youtube: ['#패션', '#OOTD', '#패션하울', '#코디추천', '#데일리룩', '#패션팁', '#스트릿패션', '#패션유튜버', '#패션추천', '#트렌드', '#패션브랜드', '#패션코디', '#여성패션', '#남성패션', '#패션아이템', '#패션리뷰', '#옷추천', '#패션고민', '#계절패션', '#패션정보'],
  },
  운동: {
    instagram: ['#운동', '#운동스타그램', '#헬스', '#헬스타그램', '#운동일상', '#다이어트', '#운동루틴', '#홈트', '#홈트레이닝', '#운동동기', '#운동인스타', '#웨이트', '#유산소', '#운동하는여자', '#운동하는남자', '#운동인증', '#피트니스', '#바디프로필', '#근육', '#건강'],
    youtube: ['#운동', '#헬스', '#다이어트운동', '#홈트', '#운동루틴', '#헬스vlog', '#운동영상', '#피트니스', '#바디프로필', '#근육운동', '#유산소운동', '#웨이트트레이닝', '#헬스팁', '#운동초보', '#운동추천', '#스쿼트', '#데드리프트', '#벤치프레스', '#코어운동', '#스트레칭'],
  },
  요리: {
    instagram: ['#요리', '#요리스타그램', '#홈쿠킹', '#집밥', '#요리일상', '#요리인스타', '#레시피', '#자취요리', '#요리취미', '#쿡스타그램', '#요리사진', '#푸드스타그램', '#집밥스타그램', '#요리초보', '#간단요리', '#요리팁', '#건강요리', '#다이어트요리', '#오늘의밥상', '#요리공유'],
    youtube: ['#요리', '#레시피', '#집밥', '#홈쿠킹', '#요리영상', '#간단레시피', '#자취요리', '#요리브이로그', '#요리팁', '#쉬운요리', '#건강요리', '#다이어트레시피', '#요리초보', '#집밥레시피', '#한식레시피', '#양식레시피', '#디저트레시피', '#베이킹레시피', '#오늘의메뉴', '#요리유튜버'],
  },
  강아지: {
    instagram: ['#강아지', '#강아지스타그램', '#멍스타그램', '#강아지일상', '#강아지귀여워', '#댕댕이', '#강아지사진', '#강아지사랑', '#강아지키우기', '#강아지파티', '#말티즈', '#포메라니안', '#푸들', '#비숑', '#골든리트리버', '#웰시코기', '#시바이누', '#강아지행복', '#petagram', '#dogstagram'],
    youtube: ['#강아지', '#댕댕이', '#강아지일상', '#강아지브이로그', '#강아지훈련', '#강아지케어', '#강아지먹방', '#강아지쇼핑', '#강아지용품', '#강아지산책', '#강아지목욕', '#강아지간식', '#강아지병원', '#강아지분양', '#강아지입양', '#강아지행동', '#말티즈브이로그', '#포메일상', '#강아지성장일기', '#반려견일상'],
  },
  고양이: {
    instagram: ['#고양이', '#고양이스타그램', '#냥스타그램', '#고양이일상', '#고양이사진', '#고양이귀여워', '#냥이', '#고양이사랑', '#길고양이', '#집고양이', '#코리안쇼트헤어', '#러시안블루', '#페르시안', '#스코티쉬폴드', '#벵갈', '#고양이사진작가', '#catoftheday', '#catsofinstagram', '#cats', '#meow'],
    youtube: ['#고양이', '#고양이일상', '#고양이브이로그', '#고양이케어', '#고양이훈련', '#고양이용품', '#고양이사료', '#고양이먹방', '#고양이병원', '#고양이분양', '#고양이입양', '#고양이행동', '#냥이브이로그', '#고양이성장일기', '#고양이쇼핑', '#고양이장난감', '#고양이화장실', '#고양이그루밍', '#고양이다이어트', '#반려묘일상'],
  },
  재테크: {
    instagram: ['#재테크', '#주식', '#부동산', '#경제공부', '#투자', '#절약', '#저축', '#부자되기', '#돈공부', '#재테크스타그램', '#월급쟁이부자', '#주식공부', '#ETF', '#금투자', '#코인', '#재테크시작', '#돈모으기', '#경제적자유', '#파이어족', '#금융공부'],
    youtube: ['#재테크', '#주식투자', '#부동산투자', '#경제', '#투자초보', '#주식공부', '#ETF투자', '#부동산재테크', '#월급관리', '#저축방법', '#경제적자유', '#파이어족', '#재테크방법', '#투자전략', '#주식추천', '#코인투자', '#채권투자', '#금투자', '#절약생활', '#돈관리'],
  },
  공부: {
    instagram: ['#공부', '#공부스타그램', '#공부인증', '#스터디', '#자기계발', '#공부일상', '#공부법', '#시험준비', '#수험생', '#공부하는사람', '#공부자극', '#공부동기', '#공부일기', '#자격증', '#영어공부', '#자기계발스타그램', '#공부는배신하지않는다', '#하루한공부', '#공부카페', '#독학'],
    youtube: ['#공부', '#공부법', '#스터디', '#효율적공부', '#자격증공부', '#영어공부', '#공부vlog', '#수험생', '#공부루틴', '#집중공부', '#공부동기', '#시험준비', '#독학', '#공부팁', '#암기법', '#자기계발', '#공부습관', '#플래너', '#공부유튜버', '#공부자극'],
  },
  인테리어: {
    instagram: ['#인테리어', '#인테리어스타그램', '#집스타그램', '#홈인테리어', '#셀프인테리어', '#인테리어소품', '#홈데코', '#집꾸미기', '#인테리어디자인', '#홈스타일링', '#미니멀인테리어', '#북유럽인테리어', '#빈티지인테리어', '#모던인테리어', '#인테리어사진', '#인테리어DIY', '#원룸인테리어', '#신혼집인테리어', '#인테리어소품', '#홈카페'],
    youtube: ['#인테리어', '#셀프인테리어', '#집꾸미기', '#홈인테리어', '#인테리어DIY', '#원룸인테리어', '#1인가구인테리어', '#신혼집꾸미기', '#인테리어소품추천', '#북유럽인테리어', '#미니멀라이프', '#인테리어팁', '#수납정리', '#가구추천', '#홈데코', '#인테리어브이로그', '#이사인테리어', '#인테리어비용', '#인테리어시공', '#홈스타일링'],
  },
  food: {
    instagram: ['#food', '#foodstagram', '#foodie', '#foodphotography', '#instafood', '#yummy', '#delicious', '#foodlover', '#homemade', '#foodblogger', '#eating', '#foodart', '#cheflife', '#eats', '#tasty', '#foodporn', '#dinnertime', '#lunchtime', '#breakfast', '#snack'],
    youtube: ['#food', '#foodie', '#cooking', '#recipe', '#homecooking', '#foodreview', '#mukbang', '#foodvlog', '#foodchallenge', '#streetfood', '#restaurantreview', '#foodtour', '#cookingvideo', '#quickrecipe', '#healthyfood', '#mealprep', '#chefathome', '#foodlovers', '#tastyrecipe', '#foodblog'],
  },
  travel: {
    instagram: ['#travel', '#travelgram', '#wanderlust', '#instatravel', '#travelphotography', '#explore', '#adventure', '#travellife', '#traveling', '#traveler', '#worldtravel', '#travelblogger', '#nature', '#vacation', '#holiday', '#trip', '#journey', '#destination', '#backpacker', '#traveltheworld'],
    youtube: ['#travel', '#travelwlog', '#traveltips', '#travelvlog', '#destination', '#budgettravel', '#solotravel', '#travelguide', '#travelreview', '#explore', '#adventure', '#backpacking', '#travellife', '#travelhacks', '#travelrecommendations', '#roadtrip', '#cityguide', '#travelitinerary', '#travelblog', '#worldtravel'],
  },
  fitness: {
    instagram: ['#fitness', '#fitnessmotivation', '#workout', '#gym', '#fit', '#health', '#exercise', '#bodybuilding', '#fitlife', '#training', '#cardio', '#weightlifting', '#abs', '#squats', '#nopainnogain', '#fitnessinspiration', '#healthyliving', '#gymlife', '#personaltrainer', '#fitnessjourney'],
    youtube: ['#fitness', '#workout', '#homeWorkout', '#gymroutine', '#fitnesstips', '#cardio', '#weightloss', '#musclebuilding', '#fitnessmotivation', '#exercise', '#personaltraining', '#bodyweight', '#HIIT', '#strengthtraining', '#fitnessjourney', '#healthylifestyle', '#loseweight', '#fitnessvlog', '#workoutroutine', '#gymlife'],
  },
};

const SYNONYMS: Record<string, string> = {
  먹방: '맛집', 식당: '맛집', 음식: '맛집', 레스토랑: '맛집',
  커피: '카페', 카페인: '카페', 디저트: '카페',
  해외여행: '여행', 국내여행: '여행', 여행지: '여행',
  메이크업: '뷰티', 화장품: '뷰티', 스킨케어: '뷰티', 코스메틱: '뷰티',
  코디: '패션', ootd: '패션', 옷: '패션', 스타일: '패션',
  헬스: '운동', 다이어트: '운동', 홈트: '운동', 피트니스: '운동',
  레시피: '요리', 집밥: '요리', 쿠킹: '요리', 베이킹: '요리',
  멍멍이: '강아지', 댕댕이: '강아지', 반려견: '강아지',
  냥이: '고양이', 냥냥이: '고양이', 반려묘: '고양이',
  주식: '재테크', 투자: '재테크', 부동산: '재테크', 경제: '재테크',
  스터디: '공부', 수험생: '공부', 시험: '공부', 자격증: '공부',
  집꾸미기: '인테리어', 홈데코: '인테리어', 셀프인테리어: '인테리어',
};

function findHashtags(keyword: string, platform: Platform): string[] {
  const key = keyword.trim().toLowerCase().replace(/\s+/g, '');
  // exact match
  if (DB[key]) return DB[key][platform];
  // synonym
  const syn = SYNONYMS[key];
  if (syn && DB[syn]) return DB[syn][platform];
  // partial match
  for (const k of Object.keys(DB)) {
    if (k.includes(key) || key.includes(k)) return DB[k][platform];
  }
  // generic fallback
  const base = `#${keyword.trim().replace(/\s+/g, '')}`;
  return platform === 'instagram'
    ? [base, `${base}스타그램`, `${base}insta`, `${base}추천`, `${base}일상`, `${base}리뷰`, `${base}공유`, `${base}사진`, '#인스타그램', '#일상', '#daily', '#instagood', '#photooftheday', '#lifestyle', '#content', '#SNS', '#소통', '#팔로우', '#좋아요', '#공유해요']
    : [base, `${base}추천`, `${base}리뷰`, `${base}브이로그`, `${base}정보`, `${base}tip`, `${base}영상`, `${base}유튜브`, `${base}vlog`, '#유튜브', '#추천', '#정보', '#영상', '#구독', '#좋아요', '#댓글', '#유튜버', '#vlog', '#contents', '#korea'];
}

/* ─── Main Page ─── */
export default function HashtagPage() {
  const [keyword, setKeyword] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [submitted, setSubmitted] = useState('');
  const [copied, setCopied] = useState(false);

  const tags = useMemo(() => {
    if (!submitted) return [];
    return findHashtags(submitted, platform);
  }, [submitted, platform]);

  const handleGenerate = () => {
    if (!keyword.trim()) return;
    setSubmitted(keyword.trim());
  };

  const handleCopyAll = async () => {
    const text = tags.join(platform === 'instagram' ? ' ' : ' ');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const btnBase: React.CSSProperties = {
    padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-md)',
    border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'opacity 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem',
  };

  return (
    <div>
      <NavigationActions />

      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>#️⃣ 인스타·유튜브 해시태그 생성기</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          키워드 하나로 인기 해시태그 30개를 즉시 생성 — 전체 복사 한 번으로 SNS에 바로 사용
        </p>
      </header>

      {/* Input Panel */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        {/* Platform selector */}
        <label style={labelStyle}>플랫폼 선택</label>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {(['instagram', 'youtube'] as Platform[]).map(p => (
            <button
              key={p}
              onClick={() => { setPlatform(p); if (submitted) setSubmitted(submitted); }}
              style={{
                ...btnBase,
                background: platform === p ? 'var(--primary)' : 'var(--surface)',
                color: platform === p ? '#fff' : 'var(--text-primary)',
                border: platform === p ? 'none' : '1px solid var(--border)',
              }}
            >
              {p === 'instagram' ? '📸 인스타그램용' : '▶ 유튜브용'}
            </button>
          ))}
        </div>

        {/* Keyword input */}
        <label style={labelStyle}>키워드 입력 (예: 맛집, 여행, 뷰티, fitness)</label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            placeholder="예: 맛집, 카페, 여행, 운동, food, travel..."
            style={{
              flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
            }}
          />
          <button
            onClick={handleGenerate}
            style={{
              ...btnBase, padding: '0.75rem 1.5rem',
              background: 'var(--primary)', color: '#fff',
            }}
          >
            해시태그 생성
          </button>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          지원 키워드: 맛집·카페·여행·뷰티·패션·운동·요리·강아지·고양이·재테크·공부·인테리어·food·travel·fitness 등
        </p>
      </div>

      {/* Results */}
      {tags.length > 0 && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {platform === 'instagram' ? '📸 인스타그램' : '▶ 유튜브'} 해시태그 ({tags.length}개)
              </span>
              <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                키워드: {submitted}
              </span>
            </div>
            <button
              onClick={handleCopyAll}
              style={{
                ...btnBase,
                background: copied ? '#10b981' : 'var(--primary)',
                color: '#fff', padding: '0.6rem 1.5rem', fontSize: '0.9rem',
              }}
            >
              {copied ? '✓ 전체 복사 완료!' : '📋 전체 복사'}
            </button>
          </div>

          {/* Tag chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {tags.map(tag => (
              <span
                key={tag}
                style={{
                  background: platform === 'instagram'
                    ? 'linear-gradient(135deg, #e879f9 0%, #f472b6 100%)'
                    : 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
                  color: '#fff',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => navigator.clipboard.writeText(tag)}
                title="클릭하여 개별 복사"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Text area for easy copy */}
          <div>
            <label style={{ ...labelStyle, marginBottom: '0.4rem' }}>전체 텍스트 (선택 후 복사)</label>
            <textarea
              readOnly
              value={tags.join(' ')}
              rows={4}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                background: '#0f172a', border: '1px solid var(--border)',
                color: '#e2e8f0', fontSize: '0.82rem', lineHeight: 1.6,
                fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
              }}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            💡 태그 하나를 클릭하면 개별 복사됩니다
          </p>
        </div>
      )}

      {/* Empty state */}
      {!submitted && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>#️⃣</div>
          <p>키워드를 입력하면 맞춤 해시태그 30개가 생성됩니다</p>
        </div>
      )}

      {/* Ad placeholder */}
      <div style={{
        background: 'var(--surface)', border: '1px dashed var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '1rem', textAlign: 'center',
        color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '2rem',
        height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        광고 영역 (728×90)
      </div>

      <ShareBar title="인스타·유튜브 해시태그 생성기" description="키워드 하나로 인기 해시태그 30개 즉시 생성" />

      <RelatedTools toolId="ai/hashtag" />

      <SeoSection
        ko={{
          title: '해시태그 생성기란? — SNS 마케팅 전략 & FAQ',
          description: `해시태그 생성기는 특정 키워드를 입력하면 해당 주제와 관련된 인기 해시태그를 자동으로 생성해주는 온라인 도구입니다. 인스타그램과 유튜브는 해시태그를 통해 콘텐츠를 분류하고 노출시키기 때문에, 적절한 해시태그 선택은 계정 성장과 조회수 확대에 직접적인 영향을 미칩니다.

인스타그램은 해시태그 피드와 탐색 탭을 통해 새로운 팔로워를 유입시키는 핵심 채널입니다. 게시물 하나에 최대 30개의 해시태그를 사용할 수 있으며, 광범위한 태그(#여행)와 틈새 태그(#서울감성카페)를 적절히 혼합하는 전략이 효과적입니다. 유튜브는 제목·설명란 해시태그가 영상 검색 노출과 관련 영상 추천에 영향을 주며, 일반적으로 3~5개의 핵심 태그 사용을 권장합니다.

【마케팅 전략 팁】
계정 규모에 따라 해시태그 전략을 달리하세요. 소규모 계정(팔로워 1만 미만)은 중소 규모 해시태그(게시물 수 10만~100만)를 중심으로 사용해 노출 경쟁을 줄이는 것이 유리합니다. 중·대형 계정은 광범위한 해시태그와 브랜드 전용 해시태그를 병행 사용해 커뮤니티를 형성할 수 있습니다. 시즌·이벤트 해시태그를 활용하면 트렌드 검색량을 활용할 수 있습니다.`,
          useCases: [
            { icon: '📸', title: '인스타그램 도달률 확대', desc: '관련 해시태그를 활용해 게시물 노출 범위와 팔로워 유입을 늘립니다.' },
            { icon: '▶', title: '유튜브 검색 노출 향상', desc: '영상 제목·설명란에 핵심 해시태그를 넣어 추천 알고리즘을 유리하게 활용합니다.' },
            { icon: '📊', title: 'SNS 마케팅 전략 수립', desc: '키워드별 인기 태그를 분석해 효과적인 해시태그 전략을 구성합니다.' },
            { icon: '🔍', title: '틈새 해시태그 발굴', desc: '경쟁이 낮은 틈새 태그를 활용해 소규모 계정도 상위 노출을 노립니다.' },
          ],
          steps: [
            { step: '1', desc: '플랫폼(인스타그램 또는 유튜브)을 선택' },
            { step: '2', desc: '키워드 입력란에 주제 키워드 입력 (예: 맛집, 여행, 뷰티)' },
            { step: '3', desc: '「해시태그 생성」 버튼 클릭' },
            { step: '4', desc: '「📋 전체 복사」로 30개 해시태그를 한 번에 복사 후 게시물에 붙여넣기' },
          ],
          faqs: [
            {
              q: '인스타그램에서 해시태그는 몇 개가 적당한가요?',
              a: '인스타그램은 최대 30개까지 허용하지만, 최근 알고리즘 변화로 3~10개의 관련성 높은 태그를 사용하는 전략이 효과적입니다. 너무 많은 태그보다는 콘텐츠와 직결된 정확한 태그가 도달률에 더 긍정적입니다.',
            },
            {
              q: '사용 금지된(banned) 해시태그를 어떻게 확인하나요?',
              a: '인스타그램 앱에서 해당 해시태그를 직접 검색하여 "최근 게시물" 탭이 없거나 "이 해시태그에 대한 결과를 숨겼습니다" 문구가 표시되면 사용이 제한된 태그입니다. 이런 태그는 피하고 일반적인 관련 태그로 대체하세요.',
            },
            {
              q: '유튜브에서 해시태그를 어디에 넣어야 하나요?',
              a: '유튜브는 영상 제목 끝이나 설명란 상단에 해시태그를 넣을 수 있으며, 최대 60개까지 허용하지만 15개 초과 시 무시됩니다. 제목에 3개, 설명란에 3~5개를 추가하는 방식이 가장 효과적입니다.',
            },
          ],
        }}
        en={{
          title: 'Hashtag Generator — Social Media Marketing Tips & FAQ',
          description: `A Hashtag Generator is an online tool that instantly produces a curated set of popular, relevant hashtags based on a keyword you enter. Choosing the right hashtags is critical for growing your Instagram following and boosting YouTube video views, as both platforms use hashtags to categorize and surface content to new audiences.

On Instagram, the Explore tab and hashtag feeds are primary discovery channels for new followers. You can use up to 30 hashtags per post, and the most effective strategy combines broad tags (#travel) with mid-range niche tags (#seoulcafe) to balance reach and competition. On YouTube, hashtags placed in video titles and descriptions influence search ranking and the "related videos" recommendation algorithm — experts recommend 3–5 highly relevant tags per video.

【Marketing Strategy Tips】
Tailor your hashtag strategy to your account size. Smaller accounts (under 10K followers) benefit from medium-sized hashtags (100K–1M posts) where competition is lower, making it easier to rank in hashtag feeds. Mid-to-large accounts can blend broad hashtags with branded community hashtags to build loyal audiences. Leveraging seasonal and event-based hashtags (e.g., #summervibe, #NewYear2025) lets you tap into trending search volumes.`,
          useCases: [
            { icon: '📸', title: 'Boost Instagram reach', desc: 'Use relevant hashtags to expand post impressions and attract new followers.' },
            { icon: '▶', title: 'YouTube search visibility', desc: 'Place key hashtags in titles and descriptions to benefit from YouTube\'s recommendation algorithm.' },
            { icon: '📊', title: 'Social media strategy', desc: 'Analyze popular tags per keyword to build an effective hashtag marketing plan.' },
            { icon: '🔍', title: 'Niche hashtag discovery', desc: 'Target lower-competition niche hashtags so even small accounts can rank in hashtag feeds.' },
          ],
          steps: [
            { step: '1', desc: 'Select your target platform (Instagram or YouTube)' },
            { step: '2', desc: 'Enter a topic keyword (e.g., food, travel, fitness)' },
            { step: '3', desc: 'Click "Generate Hashtags"' },
            { step: '4', desc: 'Click "📋 Copy All" to copy all 30 hashtags at once, then paste into your post' },
          ],
          faqs: [
            {
              q: 'How many hashtags should I use on Instagram?',
              a: 'Instagram allows up to 30 hashtags, but recent algorithm changes favor 3–10 highly relevant tags over a maximum list of 30. Quality and relevance matter more than quantity — focus on hashtags that directly match your content.',
            },
            {
              q: 'How do I know if a hashtag is banned on Instagram?',
              a: 'Search the hashtag directly in the Instagram app. If the "Recent Posts" tab is missing or you see a message about hidden content, the tag is likely restricted. Avoid using banned or restricted hashtags as they can suppress your post\'s visibility.',
            },
            {
              q: 'Where should I place hashtags on YouTube?',
              a: 'You can place hashtags at the end of the video title or at the top of the description. YouTube allows up to 60 hashtags but ignores any beyond 15. The recommended approach is 3 in the title area and 3–5 at the top of the description for best discoverability.',
            },
          ],
        }}
      />
    </div>
  );
}
