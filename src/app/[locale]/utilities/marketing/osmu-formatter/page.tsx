'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import { 
  Copy, 
  Download, 
  Instagram, 
  Twitter, 
  FileText, 
  Video, 
  Sparkles, 
  Save, 
  Trash2, 
  Hash, 
  ChevronRight,
  Zap
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import s from './osmu.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlatformResult {
  instagram: string;
  instagramHook: string;
  instagramHashtags: string;
  xThreads: string[];
  blogStats: {
    withSpaces: number;
    withoutSpaces: number;
    bytes: number;
    keywordDensity: { keyword: string; count: number }[];
  };
  shortsScript: string;
}

type TabType = 'instagram' | 'x' | 'blog' | 'shorts';

// ─── Component ────────────────────────────────────────────────────────────────

export default function OSMUContentFormatter() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  
  const [originalText, setOriginalText] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('instagram');
  const [isClient, setIsClient] = useState(false);
  
  const [result, setResult] = useState<PlatformResult>({
    instagram: '',
    instagramHook: '',
    instagramHashtags: '',
    xThreads: [],
    blogStats: { withSpaces: 0, withoutSpaces: 0, bytes: 0, keywordDensity: [] },
    shortsScript: ''
  });

  // Handle hydration
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('osmu-draft');
    if (saved) setOriginalText(saved);
  }, []);

  // ─── Conversion Logic ───────────────────────────────────────────────────────

  const formatInstagram = useCallback((text: string) => {
    // Add dots for line breaks
    const formatted = text
      .split('\n')
      .filter(line => line.trim())
      .join('\n.\n');

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const hook = sentences.slice(0, 2).join(' ').substring(0, 100);

    const words = text.toLowerCase().match(/[\uAC00-\uD7A3a-z]{2,}/g) || [];
    const freq: Record<string, number> = {};
    words.forEach(w => { if (w.length > 2) freq[w] = (freq[w] || 0) + 1; });
    const hashtags = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => `#${word}`)
      .join(' ');

    return { formatted, hook, hashtags };
  }, []);

  const formatXThreads = useCallback((text: string) => {
    const threads: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let current = '';

    sentences.forEach(s => {
      if ((current + s).length > 130) {
        if (current) threads.push(current.trim());
        current = s;
      } else {
        current += s;
      }
    });
    if (current) threads.push(current.trim());

    return threads.map((t, idx) => `${t} (${idx + 1}/${threads.length})`);
  }, []);

  const formatBlogStats = useCallback((text: string) => {
    const withSpaces = text.length;
    const withoutSpaces = text.replace(/\s/g, '').length;
    const bytes = new Blob([text]).size;
    const words = text.toLowerCase().match(/[\uAC00-\uD7A3a-z]{2,}/g) || [];
    const freq: Record<string, number> = {};
    words.forEach(w => { if (w.length > 2) freq[w] = (freq[w] || 0) + 1; });
    const keywordDensity = Object.entries(freq)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    return { withSpaces, withoutSpaces, bytes, keywordDensity };
  }, []);

  const formatShorts = useCallback((text: string) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let script = '';
    let count = 0;
    for (const s of sentences) {
      if (count + s.length > 200) break;
      script += s + '\n';
      count += s.length;
    }
    const lines = script.split('\n').filter(l => l.trim());
    const chunks: string[] = [];
    let cur = '';
    lines.forEach(l => {
      if ((cur + l).length > 45) {
        if (cur) chunks.push(cur.trim());
        cur = l;
      } else {
        cur += ' ' + l;
      }
    });
    if (cur) chunks.push(cur.trim());
    return chunks.map((c, i) => `[${i * 15}s] ${c}`).join('\n\n');
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!originalText) {
      setResult({
        instagram: '', instagramHook: '', instagramHashtags: '',
        xThreads: [],
        blogStats: { withSpaces: 0, withoutSpaces: 0, bytes: 0, keywordDensity: [] },
        shortsScript: ''
      });
      return;
    }
    
    localStorage.setItem('osmu-draft', originalText);
    
    const insta = formatInstagram(originalText);
    const x = formatXThreads(originalText);
    const blog = formatBlogStats(originalText);
    const shorts = formatShorts(originalText);

    setResult({
      instagram: insta.formatted,
      instagramHook: insta.hook,
      instagramHashtags: insta.hashtags,
      xThreads: x,
      blogStats: blog,
      shortsScript: shorts
    });
  }, [originalText, formatInstagram, formatXThreads, formatBlogStats, formatShorts]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple toast would be better, but native alert for now
    // eslint-disable-next-line no-alert
  };

  const clear = () => {
    // eslint-disable-next-line no-alert
    if (confirm(isKo ? '내용을 모두 지우시겠습니까?' : 'Clear all content?')) {
      setOriginalText('');
      localStorage.removeItem('osmu-draft');
    }
  };

  if (!isClient) return null;

  return (
    <div className={s.osmu_container}>
      <NavigationActions />

      {/* Header */}
      <header className={s.osmu_header}>
        <div className={s.osmu_header_icon_wrapper}>
          <Sparkles size={32} color="white" />
        </div>
        <h1 className={s.osmu_title}>
          {isKo ? 'OSMU 콘텐츠 재가공 포맷터' : 'OSMU Content Formatter'}
        </h1>
        <p className={s.osmu_subtitle}>
          {isKo 
            ? '한 번의 작성으로 블로그, 인스타, X, 숏츠까지 완벽 변환' 
            : 'One Source, Every Platform - Auto-format for SNS, Blog, and Video'}
        </p>
      </header>

      {/* Main Split Layout */}
      <div className={s.osmu_split_layout}>
        
        {/* Left: Editor */}
        <section className={`${s.osmu_panel} glass-panel`}>
          <div className={s.osmu_panel_header}>
            <h2 className={s.osmu_panel_title}>
              <FileText size={20} color="var(--primary)" />
              {isKo ? '원문 입력' : 'Original Text'}
            </h2>
            <button onClick={clear} className={s.osmu_secondary_button}>
              <Trash2 size={16} /> {isKo ? '초기화' : 'Clear'}
            </button>
          </div>
          <textarea
            className={s.osmu_textarea}
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder={isKo 
              ? '뉴스레터, 블로그 원고, 또는 긴 생각들을 이곳에 적어보세요...' 
              : 'Paste your blog post, newsletter, or long-form thoughts here...'}
          />
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{isKo ? '작성 중...' : 'Drafting...'}</span>
            <span>{originalText.length} {isKo ? '자' : 'chars'}</span>
          </div>
        </section>

        {/* Right: Preview & Format */}
        <section className={`${s.osmu_panel} glass-panel`}>
          <div className={s.osmu_tabs}>
            {[
              { id: 'instagram', icon: <Instagram size={16} />, label: isKo ? '인스타그램' : 'Instagram' },
              { id: 'x',         icon: <Twitter size={16} />,   label: isKo ? 'X (Twitter)' : 'X' },
              { id: 'blog',      icon: <Zap size={16} />,       label: isKo ? '블로그 분석' : 'Blog Stats' },
              { id: 'shorts',    icon: <Video size={16} />,     label: isKo ? '숏폼 대본' : 'Shorts Script' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`${s.osmu_tab_button} ${activeTab === tab.id ? s.osmu_tab_button_active : ''}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className={s.osmu_result_container}>
            {activeTab === 'instagram' && (
              <>
                <div className={s.osmu_result_card}>
                  <div className={s.osmu_card_label}>💡 Hook (첫 두 문장)</div>
                  <div className={s.osmu_card_content}>{result.instagramHook || '...'}</div>
                  <button onClick={() => copy(result.instagramHook)} className={s.osmu_copy_button}><Copy size={16}/></button>
                </div>
                <div className={s.osmu_result_card} style={{ flex: 1 }}>
                  <div className={s.osmu_card_label}>📝 인스타 전용 본문 (줄바꿈 최적화)</div>
                  <div className={s.osmu_card_content}>{result.instagram || '...'}</div>
                  <button onClick={() => copy(result.instagram)} className={s.osmu_copy_button}><Copy size={16}/></button>
                </div>
                <div className={s.osmu_result_card}>
                  <div className={s.osmu_card_label}>#️⃣ 추천 해시태그</div>
                  <div className={s.osmu_card_content} style={{ color: 'var(--primary)', fontWeight: 600 }}>{result.instagramHashtags || '#...'}</div>
                  <button onClick={() => copy(result.instagramHashtags)} className={s.osmu_copy_button}><Copy size={16}/></button>
                </div>
              </>
            )}

            {activeTab === 'x' && (
              <div className={s.osmu_result_container}>
                {result.xThreads.length > 0 ? result.xThreads.map((thread, i) => (
                  <div key={i} className={s.osmu_result_card}>
                    <div className={s.osmu_card_label}>Tweet {i+1}</div>
                    <div className={s.osmu_card_content}>{thread}</div>
                    <button onClick={() => copy(thread)} className={s.osmu_copy_button}><Copy size={16}/></button>
                  </div>
                )) : <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>{isKo ? '원문을 입력하면 트위터 타래로 분할됩니다.' : 'Threads will appear here...'}</div>}
              </div>
            )}

            {activeTab === 'blog' && (
              <div className={s.osmu_result_container}>
                <div className={s.osmu_stats_grid}>
                  <div className={s.osmu_stat_item}>
                    <div className={s.osmu_stat_value}>{result.blogStats.withSpaces}</div>
                    <div className={s.osmu_stat_label}>{isKo ? '공백 포함' : 'With Space'}</div>
                  </div>
                  <div className={s.osmu_stat_item}>
                    <div className={s.osmu_stat_value}>{result.blogStats.withoutSpaces}</div>
                    <div className={s.osmu_stat_label}>{isKo ? '공백 제외' : 'No Space'}</div>
                  </div>
                  <div className={s.osmu_stat_item}>
                    <div className={s.osmu_stat_value}>{Math.ceil(result.blogStats.bytes / 1024)} KB</div>
                    <div className={s.osmu_stat_label}>{isKo ? '데이터 용량' : 'Size'}</div>
                  </div>
                </div>
                
                <div className={s.osmu_result_card} style={{ flex: 1 }}>
                  <div className={s.osmu_card_label}>📊 키워드 밀도 분석 (반복 단어)</div>
                  <div style={{ marginTop: '1rem' }}>
                    {result.blogStats.keywordDensity.slice(0, 5).map((item, i) => (
                      <div key={i} className={s.osmu_density_item}>
                        <span style={{ fontWeight: 600 }}>{item.keyword}</span>
                        <div className={s.osmu_density_bar_wrapper}>
                          <div className={s.osmu_density_bar_bg}>
                            <div 
                              className={s.osmu_density_bar_fill} 
                              style={{ width: `${(item.count / result.blogStats.keywordDensity[0].count) * 100}%` }} 
                            />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '1.2rem' }}>{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shorts' && (
              <div className={s.osmu_result_card} style={{ flex: 1 }}>
                <div className={s.osmu_card_label}>🎬 숏폼 스크립트 (15초 단위 가이드)</div>
                <div className={s.osmu_card_content} style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  {result.shortsScript || '...'}
                </div>
                <button onClick={() => copy(result.shortsScript)} className={s.osmu_copy_button}><Copy size={16}/></button>
              </div>
            )}
          </div>

          <div className={s.osmu_action_row}>
            <button onClick={() => copy(originalText)} className={s.osmu_primary_button}>
              <Copy size={20} /> {isKo ? '전체 복사' : 'Copy All'}
            </button>
          </div>
        </section>
      </div>

      {/* SEO & Related */}
      <div style={{ maxWidth: 'var(--container-max-width)', margin: '0 auto', width: '100%' }}>
        <RelatedTools toolId="utilities/marketing/osmu-formatter" />
        
        <SeoSection
          ko={{
            title: 'OSMU 재가공 포맷터란?',
            description: 'One Source Multi Use(OSMU) 전략을 위한 최적의 도구입니다. 긴 원고 하나로 플랫폼별 특성을 살린 마케팅 콘텐츠를 자동 생성하세요. 인스타그램 가독성 최적화, 트위터 타래 자르기, 블로그 키워드 분석, 숏폼 스크립트 가이드를 한 번에 제공합니다.',
            useCases: [
              { icon: '📝', title: '개인 블로그 재가공', desc: '블로그 원고를 인스타 카드뉴스용 텍스트나 숏츠 대본으로 빠르게 변환합니다.' },
              { icon: '🚀', title: 'SNS 마케팅 효율화', desc: '한 번의 콘텐츠 작성으로 인스타, X(트위터), 페이스북 등 모든 채널을 동시에 공략하세요.' },
              { icon: '🔍', title: 'SEO 키워드 점검', desc: '블로그 포스팅 전 반복 키워드 밀도를 체크하여 검색엔진 노출 확률을 높입니다.' },
            ],
            steps: [
              { step: '원문 입력', desc: '왼쪽 텍스트 영역에 블로그 글이나 뉴스레터 원본을 입력합니다.' },
              { step: '플랫폼 탭 선택', desc: '상단의 탭을 클릭하여 인스타그램, X, 블로그, 숏츠 포맷을 확인합니다.' },
              { step: '복사 및 활용', desc: '우측 상단의 복사 버튼을 눌러 각 플랫폼에 바로 게시하세요.' },
            ],
            faqs: [
              { q: '데이터가 서버로 전송되나요?', a: '아니요. 모든 처리는 사용자의 브라우저에서 수행됩니다. 민감한 원고도 안심하고 작업하세요.' },
              { q: '줄바꿈 점(.)은 왜 추가되나요?', a: '인스타그램 앱에서 줄바꿈이 무시되는 현상을 방지하고 모바일 가독성을 극대화하기 위해 자동 삽입합니다.' },
              { q: 'X(트위터) 타래는 몇 자 기준인가요?', a: '한 트윗당 공백 포함 약 130~140자 내외로 문맥이 끊기지 않도록 스마트하게 분할합니다.' },
            ]
          }}
          en={{
            title: 'What is OSMU Content Formatter?',
            description: 'The ultimate tool for One Source Multi Use (OSMU) strategy. Transform a single piece of content into platform-specific marketing materials. Get optimized Instagram text, X (Twitter) threads, blog stats, and shorts scripts instantly.',
            useCases: [
              { icon: '📝', title: 'Content Repurposing', desc: 'Quickly convert blog posts into Instagram captions or YouTube Shorts scripts.' },
              { icon: '🚀', title: 'Marketing Efficiency', desc: 'Maximize your reach by posting tailored content across all social media channels simultaneously.' },
              { icon: '🔍', title: 'SEO Keyword Check', desc: 'Analyze keyword density before publishing to improve search engine rankings.' },
            ],
            steps: [
              { step: 'Input Original Text', desc: 'Paste your blog post or draft into the left editor.' },
              { step: 'Select Platform', desc: 'Click tabs to see formats for Instagram, X, Blog, or Shorts.' },
              { step: 'Copy and Publish', desc: 'Use the copy button to grab the formatted text and post it directly.' },
            ],
            faqs: [
              { q: 'Is my data safe?', a: 'Yes. All processing happens locally in your browser. No text is sent to any server.' },
              { q: 'Why are there dots in Instagram text?', a: 'To prevent Instagram from collapsing line breaks and to improve readability on mobile devices.' },
              { q: 'How long are the X (Twitter) threads?', a: 'Each thread is split into approx 130-140 characters, ensuring sentences are not cut mid-word.' },
            ]
          }}
        />
      </div>
    </div>
  );
}
