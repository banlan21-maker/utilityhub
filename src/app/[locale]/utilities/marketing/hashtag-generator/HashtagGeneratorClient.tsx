'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLocale } from 'next-intl';
import {
  Instagram,
  Youtube,
  Hash,
  Copy,
  TrendingUp,
  Zap,
  Share2
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './hashtag.module.css';

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
  유럽여행: { instagram: ['#유럽여행','#유럽','#유럽감성','#파리','#로마','#바르셀로나','#암스테르담','#프라하','#빈','#취리히','#런던','#유럽여행스타그램','#유럽일주','#배낭유럽','#유럽핫플','#유럽맛집','#유럽카페','#유럽브이로그','#유럽감성사진','#유럽인스타'], youtube: ['#유럽여행','#유럽여행브이로그','#파리여행','#이탈리아여행','#스페인여행','#유럽배낭여행','#유럽여행경비','#유럽일주','#유럽여행준비','#유럽여행코스','#유럽여행팁','#유럽여행정보','#유럽여행추천','#유럽카페투어','#유럽맛집','#유럽날씨','#유럽숙소','#유럽교통','#유럽여행하기좋은나라','#유럽여행루트'] },
  뷰티: { instagram: ['#뷰티','#뷰티스타그램','#메이크업','#화장품','#스킨케어','#뷰티템','#데일리메이크업','#뷰티유튜버','#뷰티인스타','#뷰티추천','#뷰티리뷰','#코스메틱','#뷰티팁','#메이크업팁','#뷰티하울','#신상뷰티','#뷰티아이템','#뷰티일상','#여성뷰티','#뷰티정보'], youtube: ['#뷰티','#메이크업','#스킨케어','#뷰티리뷰','#화장품추천','#뷰티하울','#메이크업튜토리얼','#데일리메이크업','#뷰티팁','#신상화장품','#뷰티템추천','#피부관리','#기초화장품','#색조화장품','#뷰티유튜버','#메이크업챌린지','#뷰티루틴','#스킨케어루틴','#뷰티추천','#화장품리뷰'] },
  패션: { instagram: ['#패션','#패션스타그램','#OOTD','#오오티디','#데일리룩','#패션인스타','#스트릿패션','#패션코디','#오늘의코디','#패션피플','#패션스타','#트렌드패션','#패션하울','#코디추천','#여성패션','#남성패션','#패션아이템','#신상패션','#패션위크','#패션브랜드'], youtube: ['#패션','#OOTD','#패션하울','#코디추천','#데일리룩','#패션팁','#스트릿패션','#패션유튜버','#패션추천','#트렌드','#패션브랜드','#패션코디','#여성패션','#남성패션','#패션아이템','#패션리뷰','#옷추천','#패션고민','#계절패션','#패션정보'] },
  운동: { instagram: ['#운동','#운동스타그램','#헬스','#헬스타그램','#운동일상','#다이어트','#운동루틴','#홈트','#홈트레이닝','#운동동기','#운동인스타','#웨이트','#유산소','#운동하는여자','#운동하는남자','#운동인증','#피트니스','#바디프로필','#근육','#건강'], youtube: ['#운동','#헬스','#다이어트운동','#홈트','#운동루틴','#헬스vlog', '#운동영상','#피트니스','#바디프로필','#근육운동','#유산소운동','#웨이트트레이닝','#헬스팁','#운동초보','#운동추천','#스쿼트','#데드리프트','#벤치프레스','#코어운동','#스트레칭'] },
  요리: { instagram: ['#요리','#요리스타그램','#홈쿠킹','#집밥','#요리일상','#요리인스타','#레시피','#자취요리','#요리취미','#쿡스타그램','#요리사진','#푸드스타그램','#집밥스타그램','#요리초보','#간단요리','#요리팁','#건강요리','#다이어트요리','#오늘의밥상','#요리공유'], youtube: ['#요리','#레시피','#집밥','#홈쿠킹','#요리영상','#간단레시피','#자취요리','#요리브이로그','#요리팁','#쉬운요리','#건강요리','#다이어트레시피','#요리초보','#집밥레시피','#한식레시피','#양식레시피','#디저트레시피','#베이킹레시피','#오늘의메뉴','#요리유튜버'] },
  강아지: { instagram: ['#강아지','#강아지스타그램','#멍스타그램','#강아지일상','#강아지귀여워','#댕댕이','#강아지사진','#강아지사랑','#강아지키우기','#강아지파티','#말티즈','#포메라니안','#푸들','#비숑','#골든리트리버','#웰시코기','#시바이누','#강아지행복','#petagram','#dogstagram'], youtube: ['#강아지','#댕댕이','#강아지일상','#강아지브이로그','#강아지훈련','#강아지케어','#강아지먹방','#강아지쇼핑','#강아지용품','#강아지산책','#강아지목욕','#강아지간식','#강아지병원','#강아지분양','#강아지입양','#강아지행동','#말티즈브이로그','#포메일상','#강아지성장일기','#반려견일상'] },
  고양이: { instagram: ['#고양이','#고양이스타그램','#냥스타그램','#고양이일상','#고양이사진','#고양이귀여워','#냥이','#고양이사랑','#길고양이','#집고양이','#코리안쇼트헤어','#러시안블루','#페르시안','#스코티쉬폴드','#벵갈','#고양이사진작가','#catoftheday','#catsofinstagram','#cats','#meow'], youtube: ['#고양이','#고양이일상','#고양이브이로그','#고양이케어','#고양이훈련','#고양이용품','#고양이사료','#고양이먹방','#고양이병원','#고양이분양','#고양이입양','#고양이행동','#냥이브이로그','#고양이성장일기','#고양이쇼핑','#고양이장난감','#고양이화장실','#고양이그루밍','#고양이다이어트','#반려묘일상'] },
  재테크: { instagram: ['#재테크','#주식','#부동산','#경제공부','#투자','#절약','#저축','#부자되기','#돈공부','#재테크스타그램','#월급쟁이부자','#주식공부','#ETF','#금투자','#코인','#재테크시작','#돈모으기','#경제적자유','#파이어족','#금융공부'], youtube: ['#재테크','#주식투자','#부동산투자','#경제','#투자초보','#주식공부','#ETF투자','#부동산재테크','#월급관리','#저축방법','#경제적자유','#파이어족','#재테크방법','#투자전략','#주식추천','#코인투자','#채권투자','#금투자','#절약생활','#돈관리'] },
  공부: { instagram: ['#공부','#공부스타그램','#공부인증','#스터디','#자기계발','#공부일상','#공부법','#시험준비','#수험생','#공부하는사람','#공부자극','#공부동기','#공부일기','#자격증','#영어공부','#자기계발스타그램','#공부는배신하지않는다','#하루한공부','#공부카페','#독학'], youtube: ['#공부','#공부법','#스터디','#효율적공부','#자격증공부','#영어공부','#공부vlog','#수험생','#공부루틴','#집중공부','#공부동기','#시험준비','#독학','#공부팁','#암기법','#자기계발','#공부습관','#플래너','#공부유튜버','#공부자극'] },
  인테리어: { instagram: ['#인테리어','#인테리어스타그램','#집스타그램','#홈인테리어','#셀프인테리어','#인테리어소품','#홈데코','#집꾸미기','#인테리어디자인','#홈스타일링','#미니멀인테리어','#북유럽인테리어','#빈티지인테리어','#모던인테리어','#인테리어사진','#인테리어DIY','#원룸인테리어','#신혼집인테리어','#인테리어소품','#홈카페'], youtube: ['#인테리어','#셀프인테리어','#집꾸미기','#홈인테리어','#인테리어DIY','#원룸인테리어','#1인가구인테리어','#신혼집꾸미기','#인테리어소품추천','#북유럽인테리어','#미니멀라이프', '#인테리어팁','#수납정리','#가구추천','#홈데코','#인테리어브이로그','#이사인테리어','#인테리어비용','#인테리어시공','#홈스타일링'] },
  food: { instagram: ['#food','#foodstagram','#foodie','#foodphotography','#instafood', '#yummy','#delicious','#foodlover','#homemade','#foodblogger','#eating','#foodart','#cheflife','#eats','#tasty','#foodporn','#dinnertime','#lunchtime','#breakfast','#snack'], youtube: ['#food','#foodie','#cooking','#recipe','#homecooking','#foodreview','#mukbang','#foodvlog','#foodchallenge','#streetfood','#restaurantreview','#foodtour','#cookingvideo','#quickrecipe','#healthyfood','#mealprep','#chefathome','#foodlovers','#tastyrecipe','#foodblog'] },
  travel: { instagram: ['#travel','#travelgram','#wanderlust','#instatravel','#travelphotography','#explore','#adventure','#travellife','#traveling','#traveler','#worldtravel','#travelblogger','#nature','#vacation','#holiday','#trip','#journey','#destination','#backpacker','#traveltheworld'], youtube: ['#travel','#travelwlog','#traveltips','#travelvlog','#destination','#budgettravel','#solotravel','#travelguide','#travelreview','#explore','#adventure','#backpacking','#travellife','#travelhacks','#travelrecommendations','#roadtrip','#cityguide','#travelitinerary','#travelblog','#worldtravel'] },
  fitness: { instagram: ['#fitness','#fitnessmotivation','#workout','#gym','#fit','#health','#exercise','#bodybuilding','#fitlife','#training','#cardio','#weightlifting','#abs','#squats','#nopainnogain','#fitnessinspiration','#healthyliving','#gymlife','#personaltrainer','#fitnessjourney'], youtube: ['#fitness','#workout','#homeWorkout','#gymroutine','#fitnesstips','#cardio','#weightloss','#musclebuilding','#fitnessmotivation','#exercise','#personaltraining','#bodyweight','#HIIT','#strengthtraining','#fitnessjourney','#healthylifestyle','#loseweight','#fitnessvlog','#workoutroutine','#gymlife'] }
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
  if (DB[key]) return DB[key][platform];
  const syn = SYNONYMS[key];
  if (syn && DB[syn]) return DB[syn][platform];
  for (const k of Object.keys(DB)) {
    if (k.includes(key) || key.includes(k)) return DB[k][platform];
  }
  const base = `#${keyword.trim().replace(/\s+/g, '')}`;
  return platform === 'instagram'
    ? [base, `${base}스타그램`, `${base}insta`, `${base}추천`, `${base}일상`, `${base}리뷰`, `${base}공유`, `${base}사진`, '#인스타그램', '#일상', '#daily', '#instagood', '#photooftheday', '#lifestyle', '#content', '#SNS', '#소통', '#팔로우', '#좋아요', '#공유해요']
    : [base, `${base}추천`, `${base}리뷰`, `${base}브이로그`, `${base}정보`, `${base}tip`, `${base}영상`, `${base}유튜브`, `${base}vlog`, '#유튜브', '#추천', '#정보', '#영상', '#구독', '#좋아요', '#댓글', '#유튜버', '#vlog', '#contents', '#korea'];
}

export default function HashtagGeneratorClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [keyword, setKeyword] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [submitted, setSubmitted] = useState('');
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const tags = useMemo(() => {
    if (!submitted) return [];
    return findHashtags(submitted, platform);
  }, [submitted, platform]);

  if (!isClient) return null;

  return (
    <div className={s.hashtag_container}>
      <NavigationActions />
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Hash size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{isKo ? '해시태그 생성기' : 'Hashtag Generator'}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{isKo ? '키워드 하나로 인기 해시태그 즉시 생성' : 'Generate 30 popular hashtags instantly'}</p>
      </header>

      <section className={s.hashtag_panel}>
        <div>
          <label className={s.hashtag_label}>{isKo ? '1. 플랫폼 선택' : '1. Select Platform'}</label>
          <div className={s.hashtag_button_group}>
            {(['instagram', 'youtube'] as Platform[]).map(p => (
              <button key={p} onClick={() => setPlatform(p)} className={`${s.hashtag_platform_btn} ${platform === p ? s.hashtag_platform_btn_active : ''}`}>
                {p === 'instagram' ? <Instagram size={18} /> : <Youtube size={18} />}
                {p === 'instagram' ? (isKo ? '인스타그램' : 'Instagram') : (isKo ? '유튜브' : 'YouTube')}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={s.hashtag_label}>{isKo ? '2. 키워드 입력' : '2. Enter Keyword'}</label>
          <div className={s.hashtag_input_row}>
            <input className={s.hashtag_input} value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && setSubmitted(keyword.trim())} placeholder={isKo ? "예: 맛집, 카페..." : "e.g. food, cafe..."} />
            <button onClick={() => setSubmitted(keyword.trim())} className={s.hashtag_primary_btn}><TrendingUp size={20} /> {isKo ? '생성' : 'Generate'}</button>
          </div>
        </div>
      </section>

      {tags.length > 0 ? (
        <section className={s.hashtag_panel}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontWeight: 800 }}>{submitted} 관련 태그</h3>
            <button onClick={() => { navigator.clipboard.writeText(tags.join(' ')); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={s.hashtag_copy_btn} style={{ background: copied ? '#10b981' : '#8b5cf6' }}>
              <Copy size={18} /> {copied ? '복사됨!' : '전시 복사'}
            </button>
          </div>
          <div className={s.hashtag_grid}>
            {tags.map((tag, i) => (
              <span key={i} className={s.hashtag_chip} style={{ background: platform === 'instagram' ? 'linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)' : '#ef4444' }}>{tag}</span>
            ))}
          </div>
          <textarea className={s.hashtag_textarea} readOnly value={tags.join(' ')} rows={3} />
        </section>
      ) : (
        <div className={s.hashtag_empty}><Zap size={48} color="#e2e8f0" /><p>{isKo ? '키워드를 입력하세요' : 'Enter a keyword'}</p></div>
      )}

      <ShareBar title={isKo ? '해시태그 생성기' : 'Hashtag Generator'} description="키워드 하나로 해시태그 즉시 생성" />
      <RelatedTools toolId="utilities/marketing/hashtag-generator" />
      <div className={s.hashtag_ad_placeholder}>{isKo ? '광고 영역' : 'Ad Space'}</div>
      <SeoSection
        ko={{
          title: '해시태그 생성기란?',
          description: '해시태그 생성기는 키워드 하나를 입력하면 인스타그램과 유튜브에 최적화된 인기 해시태그 30개를 즉시 생성해주는 무료 SNS 마케팅 도구입니다. 맛집·카페·여행·뷰티·패션·운동·요리·반려동물·재테크·인테리어 등 15개 이상의 인기 카테고리별 해시태그 데이터베이스를 내장하고 있으며, 등록되지 않은 키워드도 유의어 매핑과 자동 생성 알고리즘으로 관련 태그를 추천합니다. 모든 처리는 브라우저에서 이루어져 로그인이나 회원가입 없이 즉시 사용 가능합니다. 생성된 해시태그는 한 번의 클릭으로 전체 복사할 수 있어 SNS 게시물에 바로 붙여넣기가 가능합니다.',
          useCases: [
            { icon: '📸', title: '인스타그램 탐색 노출', desc: '인기 해시태그를 게시물에 추가하면 해당 태그를 팔로우하거나 탐색하는 신규 사용자에게 콘텐츠가 노출되어 팔로워 증가와 도달률 향상에 직접적으로 기여합니다.' },
            { icon: '🎬', title: '유튜브 검색 최적화', desc: '유튜브 설명란에 관련 해시태그를 삽입하면 영상이 관련 태그 검색 결과와 제목 상단에 노출되어 조회수와 구독자 유입을 높일 수 있습니다.' },
            { icon: '🏪', title: '브랜드·소상공인 홍보', desc: '카페, 식당, 쇼핑몰 등 소규모 사업자가 업종 관련 해시태그를 활용하면 광고 비용 없이 지역 고객과 잠재 소비자에게 콘텐츠를 효과적으로 노출할 수 있습니다.' },
            { icon: '📊', title: '콘텐츠 마케터 업무 효율화', desc: '다수의 클라이언트 SNS 계정을 운영하는 마케터가 게시물마다 해시태그를 수동으로 조사하는 시간을 줄이고, 키워드별로 즉시 최적화된 태그 세트를 확보하여 업무 속도를 높일 수 있습니다.' },
          ],
          steps: [
            { step: '플랫폼 선택', desc: '상단에서 인스타그램 또는 유튜브 버튼을 클릭하여 원하는 플랫폼을 선택합니다. 같은 키워드라도 플랫폼별 인기 태그가 다르게 생성됩니다.' },
            { step: '키워드 입력', desc: '검색창에 콘텐츠 주제 키워드(예: 맛집, 카페, 여행, 뷰티)를 입력하고 생성 버튼을 클릭하거나 Enter 키를 누릅니다.' },
            { step: '태그 확인', desc: '플랫폼에 최적화된 해시태그 30개가 컬러 칩 형태로 즉시 표시됩니다. 각 태그의 관련성을 검토하고 콘텐츠에 맞는 태그를 선별합니다.' },
            { step: '전체 복사 및 붙여넣기', desc: '전체 복사 버튼을 클릭하면 30개 태그가 공백으로 구분된 형태로 클립보드에 복사됩니다. 인스타그램 또는 유튜브 게시물 설명란에 바로 붙여넣어 사용하세요.' },
          ],
          faqs: [
            { q: '해시태그는 몇 개까지 쓰는 게 효과적인가요?', a: '인스타그램은 최대 30개를 허용하지만, 알고리즘 연구에 따르면 콘텐츠와 관련성이 높은 5~15개를 선별해 사용하는 것이 30개를 무작위로 사용하는 것보다 탐색 노출과 도달률 측면에서 효과적인 경우가 많습니다. 유튜브는 제목 위 표시 해시태그 3개, 설명란 해시태그 15개 이내를 권장합니다.' },
            { q: '키워드를 입력했는데 관련 태그가 없으면 어떻게 되나요?', a: '도구 내부의 유의어 사전을 통해 입력 키워드와 관련된 카테고리를 자동으로 매핑합니다. 예를 들어 "식당"을 입력하면 "맛집" 카테고리 태그가, "헬스"를 입력하면 "운동" 카테고리 태그가 생성됩니다. 매핑이 되지 않는 키워드는 입력한 단어를 기반으로 스타그램, 추천, 일상 등 형식의 범용 태그 20개가 자동 생성됩니다.' },
            { q: '생성된 해시태그는 계속 업데이트되나요?', a: '현재 도구에 내장된 해시태그 데이터베이스는 각 카테고리의 장기적으로 인기 있는 태그를 기반으로 구성되어 있습니다. 트렌드가 빠르게 변하는 시사·이슈 관련 해시태그는 포함되지 않을 수 있으므로, 생성된 태그를 참고 삼아 최신 트렌드 태그를 일부 직접 추가하는 것을 권장합니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'What is a Hashtag Generator?',
          description: 'The Hashtag Generator is a free SNS marketing tool that instantly produces 30 optimized hashtags for Instagram or YouTube from a single keyword. It contains a built-in database of trending hashtags across 15+ popular categories including food, cafe, travel, beauty, fashion, fitness, cooking, pets, investment, and interior design. For keywords not in the database, a synonym mapping system and fallback generation algorithm ensure you always receive relevant tag suggestions. No login or registration is required — everything runs in your browser. Generated hashtags can be copied to your clipboard in one click and pasted directly into any post, caption, or video description. Whether you are a content creator, brand manager, or small business owner, this tool helps you skip hours of manual hashtag research and get your content discovered faster.',
          useCases: [
            { icon: '📸', title: 'Instagram Explore Reach', desc: 'Adding trending hashtags to your Instagram posts helps your content appear in Explore feeds and hashtag search results, driving new followers and boosting organic reach without paid advertising.' },
            { icon: '🎬', title: 'YouTube SEO Boost', desc: 'Inserting relevant hashtags into your YouTube video description makes the video appear in hashtag search pages and can display the top three hashtags above the video title, increasing discoverability.' },
            { icon: '🏪', title: 'Small Business Promotion', desc: 'Cafes, restaurants, and boutiques can use category-specific hashtags to reach local customers and niche audiences organically, reducing reliance on paid ads and growing community presence.' },
            { icon: '📊', title: 'Content Manager Efficiency', desc: 'Marketing managers handling multiple client accounts can instantly generate a full hashtag set for any topic, saving hours of manual keyword research and ensuring consistent, platform-appropriate tag selection for every post.' },
          ],
          steps: [
            { step: 'Choose Platform', desc: 'Click the Instagram or YouTube button at the top to select your target platform. The same keyword produces different optimized hashtag sets depending on the platform you choose.' },
            { step: 'Enter a Keyword', desc: 'Type your content topic in the search box (e.g., food, travel, fitness) and press Enter or click the Generate button to retrieve the hashtag list immediately.' },
            { step: 'Review the Tags', desc: 'Thirty hashtags appear as colored chips. Browse the results and identify which tags best match your specific content angle — a mix of high-volume and niche tags typically performs best.' },
            { step: 'Copy and Paste', desc: 'Click the Copy All button to copy all 30 tags as a space-separated string to your clipboard, then paste them directly into your Instagram caption or YouTube video description.' },
          ],
          faqs: [
            { q: 'How many hashtags should I actually use on Instagram?', a: 'Instagram allows up to 30 hashtags per post, but research suggests using 5–15 highly relevant tags outperforms stuffing all 30. Relevance signals to the algorithm that your content matches the tag topic, improving placement in Explore and hashtag feeds. For YouTube, keep hashtags in the description to 15 or fewer, as exceeding this causes YouTube to ignore all of them.' },
            { q: 'What happens if my keyword is not in the database?', a: 'The tool uses a synonym mapping system to automatically match your keyword to the closest category. For example, typing "restaurant" maps to the food category, and "gym" maps to fitness. For completely unrecognized keywords, a fallback algorithm generates 20 general-purpose tags based on your input word, including formats like #wordstagram, #wordrecommendation, and universal lifestyle tags.' },
            { q: 'Are the hashtags updated regularly?', a: 'The built-in database focuses on evergreen, consistently popular hashtags for each category rather than rapidly changing trends. For time-sensitive or breaking-news hashtags, you may need to supplement the generated list with manually researched trending tags. We recommend using the generated set as a strong foundation and adding 2–3 current trend tags on top.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
          ],
        }}
      />
    </div>
  );
}
