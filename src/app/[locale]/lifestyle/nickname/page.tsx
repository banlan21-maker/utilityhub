'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';

export default function NicknameGeneratorPage() {
  const t = useTranslations('Nickname');
  
  const [birthDate, setBirthDate] = useState<string>('');
  const [gender, setGender] = useState<string>('neutral');
  const [style, setStyle] = useState<string>('modern');
  const [result, setResult] = useState<{ name: string; meaning: string } | null>(null);

  const nameDatabase: Record<string, Record<string, { names: string[], meanings: string[] }>> = {
    male: {
      classic: {
        names: ['Oliver', 'Sebastian', 'Theodore', 'Julian', 'Arthur'],
        meanings: ['Peaceful elf', 'Venerable', 'Gift of God', 'Youthful', 'Noble bear']
      },
      modern: {
        names: ['Kai', 'Axel', 'Zion', 'Arlo', 'Finn'],
        meanings: ['Ocean (Hawaiian)', 'Father of peace', 'Highest point', 'Fortified hill', 'Fair/White']
      },
      cool: {
        names: ['Hunter', 'Ryder', 'Chase', 'Jace', 'Phoenix'],
        meanings: ['One who hunts', 'Knight', 'To pursue', 'Healer', 'Immortal bird']
      }
    },
    female: {
      classic: {
        names: ['Isla', 'Evelyn', 'Clara', 'Adelaide', 'Florence'],
        meanings: ['Island', 'Desired', 'Clear/Bright', 'Noble', 'Flourishing']
      },
      modern: {
        names: ['Luna', 'Nova', 'Willow', 'Hazel', 'Aria'],
        meanings: ['Moon', 'New star', 'Graceful tree', 'Protection', 'Air/Song']
      },
      cute: {
        names: ['Daisy', 'Ruby', 'Mila', 'Pixie', 'Chloe'],
        meanings: ['Days eye', 'Deep red gem', 'Dear/Gracious', 'Playful fairy', 'Blooming']
      }
    },
    neutral: {
      modern: {
        names: ['Skyler', 'River', 'Sage', 'Jordan', 'Quinn'],
        meanings: ['Scholar', 'Flowing water', 'Wise one', 'Flowing down', 'Counsel']
      },
      cool: {
        names: ['Shadow', 'Rain', 'Storm', 'Echo', 'Indigo'],
        meanings: ['Mystery', 'Natural blessing', 'Strong nature', 'Sound reflection', 'Deep blue']
      }
    }
  };

  const recommend = () => {
    if (!birthDate) return;

    const genderKey = gender;
    const styleKey = style;
    
    // Simple logic based on birth date to pick a deterministic name
    const dateValue = new Date(birthDate).getTime();
    const categories = nameDatabase[genderKey] || nameDatabase['neutral'];
    const styleOptions = categories[styleKey] || Object.values(categories)[0];
    
    const index = Math.abs(Math.floor(dateValue / 1000 / 60 / 60 / 24)) % styleOptions.names.length;
    
    setResult({
      name: styleOptions.names[index],
      meaning: styleOptions.meanings[index]
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <NavigationActions />
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '2.5rem' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {t('description')}
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 animate-slide-up">
        {/* Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('birthDate')}</label>
            <input 
              type="date" 
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('gender')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              {['male', 'female', 'neutral'].map((g) => (
                <button 
                  key={g}
                  onClick={() => setGender(g)}
                  className={gender === g ? 'active-tab' : 'tab'}
                  style={{ padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', border: 'none', fontSize: '0.9rem' }}
                >
                  {t(g)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('style')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {['classic', 'modern', 'cute', 'cool'].map((s) => (
                <button 
                  key={s}
                  onClick={() => setStyle(s)}
                  className={style === s ? 'active-tab' : 'tab'}
                  style={{ padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', border: 'none', fontSize: '0.9rem' }}
                >
                  {t(s)}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={recommend}
            disabled={!birthDate}
            className="primary-button"
            style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', opacity: birthDate ? 1 : 0.5 }}
          >
            {t('recommend')}
          </button>
        </div>

        {/* Result */}
        <div className="flex flex-col">
          {result ? (
            <div className="glass-panel animate-scale-in flex-1 flex flex-col items-center justify-center text-center" style={{ padding: '3rem', border: '2px dashed var(--primary)' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{t('resultTitle')}</p>
              <h2 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1.5rem', textShadow: '0 0 20px rgba(var(--primary-rgb), 0.3)' }}>
                {result.name}
              </h2>
              <div style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', marginBottom: '2rem' }}>
                <span style={{ fontWeight: 600, marginRight: '0.5rem' }}>{t('meaning')}:</span>
                <span>{result.meaning}</span>
              </div>
              
              <button 
                onClick={() => setResult(null)}
                style={{ background: 'none', border: '1px solid var(--border)', padding: '0.5rem 1.5rem', borderRadius: '20px', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                {t('reset')}
              </button>
            </div>
          ) : (
            <div className="glass-panel flex-1 flex flex-col items-center justify-center text-center opacity-50" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
              <p style={{ whiteSpace: 'pre-wrap' }}>{t('emptyState')}</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .tab {
          background: var(--surface);
          color: var(--text-secondary);
          border: 1px solid var(--border);
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
        }
        .tab:hover {
          background: var(--surface-hover);
          border-color: var(--primary);
          color: var(--primary);
        }
        .active-tab {
          background: var(--primary) !important;
          color: white !important;
          border: 1px solid var(--primary) !important;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3) !important;
        }
        .primary-button {
          background: var(--primary) !important;
          color: white !important;
          border: none;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .primary-button:hover:not(:disabled) {
          background: var(--primary-hover) !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(79, 70, 229, 0.5);
        }
        .primary-button:active:not(:disabled) {
          transform: translateY(-1px);
        }
      `}</style>

      <SeoSection
        ko={{
          title: "영문 성함 & 닉네임 추천기란 무엇인가요?",
          description: "영문 닉네임 추천기는 생년월일과 성별, 원하는 스타일(클래식/모던/귀여움/쿨)을 입력하면 나에게 어울리는 영문 이름과 닉네임을 추천해주는 온라인 도구입니다. 글로벌 업무 환경에서의 영문 이름 설정, SNS·게임 닉네임 아이디어 탐색, 해외여행 시 사용할 이름 결정 등 다양한 상황에서 활용할 수 있습니다. 수비학(수의 의미) 기반으로 생일과 이름의 조화를 고려해 개인화된 이름을 추천합니다.",
          useCases: [
            { icon: '🌏', title: '글로벌 업무 환경 영문 이름', desc: '외국 동료나 클라이언트와 소통할 때 발음하기 쉽고 기억에 남는 영문 이름을 설정해 전문적인 인상을 만듭니다.' },
            { icon: '🎮', title: 'SNS & 게임 닉네임 아이디어', desc: '인스타그램 아이디, 게임 닉네임, 유튜브 채널명 등에 사용할 개성 있고 의미 있는 닉네임 아이디어를 얻습니다.' },
            { icon: '✈️', title: '해외여행 & 유학 준비', desc: '영어권 나라에서 현지인들이 쉽게 발음할 수 있는 영문 이름을 미리 정해두면 소통이 훨씬 원활해집니다.' },
            { icon: '📝', title: '필명 & 아티스트 명 탐색', desc: '작가, 음악가, 유튜버 등이 브랜드 네임으로 사용할 인상적이고 기억하기 쉬운 영문 예명을 탐색합니다.' },
          ],
          steps: [
            { step: '생년월일 & 성별 입력', desc: '생년월일(수비학 계산에 활용)과 선호 성별(남성적/여성적/중성적)을 선택합니다.' },
            { step: '스타일 선택', desc: '원하는 이름 스타일(클래식·우아함 / 모던·트렌디 / 귀엽고 친근함 / 시원하고 강렬함)을 선택합니다.' },
            { step: '추천 이름 확인', desc: '추천된 이름들과 각 이름의 의미·어원·특징을 확인합니다. 마음에 드는 이름을 바로 사용하세요.' },
          ],
          faqs: [
            { q: '추천된 영문 이름이 법적 이름으로 사용 가능한가요?', a: '이 도구는 닉네임·영문 이름 아이디어 제공을 위한 참고 도구입니다. 여권이나 공식 서류의 영문 이름 변경은 법적 절차가 필요하므로 관련 기관에 문의하세요.' },
            { q: '같은 정보를 입력해도 매번 같은 결과가 나오나요?', a: '동일한 입력값에 대해 일관된 추천 결과를 제공합니다. 단, 스타일 선택을 변경하면 다른 이름 세트를 탐색할 수 있으므로 여러 스타일을 시도해보세요.' },
            { q: '추천 이름이 마음에 들지 않습니다', a: "다른 스타일을 선택해 새로운 추천을 받거나, '다시 추천받기' 버튼을 활용하세요. 추천받은 이름들의 어원과 의미를 읽어보면 비슷한 느낌의 이름을 직접 탐색하는 데도 도움이 됩니다." },
          ],
        }}
        en={{
          title: "What is an English Name & Nickname Generator?",
          description: "An English name & nickname generator recommends personalized English names and nicknames based on your birth date, gender preference, and style (classic, modern, cute, or cool). It's useful for setting an English name in global work environments, finding SNS or gaming nicknames, or choosing a name before traveling or studying abroad. Names are suggested using a numerology-inspired approach that harmonizes your birthday with the name's meaning.",
          useCases: [
            { icon: '🌏', title: 'English Name for Global Work', desc: 'Choose an easy-to-pronounce, memorable English name for communicating with foreign colleagues and clients to make a professional impression.' },
            { icon: '🎮', title: 'SNS & Gaming Nicknames', desc: 'Get unique, meaningful nickname ideas for Instagram handles, game usernames, YouTube channel names, and more.' },
            { icon: '✈️', title: 'Travel & Study Abroad Prep', desc: "Having an English name that native speakers can easily pronounce makes communication much smoother when you're in English-speaking countries." },
            { icon: '📝', title: 'Pen Name & Artist Name', desc: 'Writers, musicians, and YouTubers can explore memorable, brand-worthy English names to use as their public persona.' },
          ],
          steps: [
            { step: 'Enter birth date & gender', desc: 'Input your birth date (used for numerology calculation) and select your preferred gender style (masculine / feminine / neutral).' },
            { step: 'Select a style', desc: 'Choose your preferred name style: Classic & Elegant, Modern & Trendy, Cute & Friendly, or Cool & Bold.' },
            { step: 'View recommended name', desc: 'See the recommended name along with its meaning and origin. Use it right away or try different styles to explore more options.' },
          ],
          faqs: [
            { q: 'Can I use the recommended name as my legal name?', a: 'This tool is for nickname and English name idea inspiration only. Changing your official name on a passport or legal documents requires a formal legal process — consult the relevant authority.' },
            { q: 'Will the same inputs always produce the same result?', a: 'Yes, the same inputs consistently return the same recommendation. Try different style selections to explore different name sets.' },
            { q: "I don't like the recommended name", a: "Try a different style to get a fresh set of names. Reading the meanings and origins of the recommended names can also inspire you to search for similar-feeling names on your own." },
          ],
        }}
      />
    </div>
  );
}
