import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isKo = params.locale === "ko";
  const title = isKo
    ? "OSMU 콘텐츠 재가공 포맷터 | Utility Hub"
    : "OSMU Content Formatter | Utility Hub";
  const description = isKo
    ? "블로그 원고 하나로 인스타그램, X(트위터), 숏폼 대본까지 자동 변환하는 무료 OSMU 포맷터"
    : "Automatically reformat one source content for Instagram, X (Twitter), Blog, and Shorts scripts. Free OSMU tool.";
  const canonical = `https://www.theutilhub.com/${params.locale}/utilities/marketing/osmu-formatter`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: "https://www.theutilhub.com/ko/utilities/marketing/osmu-formatter",
        en: "https://www.theutilhub.com/en/utilities/marketing/osmu-formatter",
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Utility Hub",
      locale: isKo ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "OSMU 콘텐츠 재가공 포맷터",
  "alternateName": "OSMU Content Formatter",
  "operatingSystem": "Web Browser",
  "applicationCategory": "UtilitiesApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "url": "https://www.theutilhub.com/ko/utilities/marketing/osmu-formatter",
  "description": "블로그 원고 하나로 인스타그램, X(트위터), 숏폼 대본까지 자동 변환하는 무료 OSMU 포맷터"
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "데이터가 서버로 전송되나요?", "acceptedAnswer": { "@type": "Answer", "text": "아니요. 모든 처리는 사용자의 브라우저에서 수행됩니다. 민감한 원고도 안심하고 작업하세요." } },
    { "@type": "Question", "name": "줄바꿈 점(.)은 왜 추가되나요?", "acceptedAnswer": { "@type": "Answer", "text": "인스타그램 앱에서 줄바꿈이 무시되는 현상을 방지하고 모바일 가독성을 극대화하기 위해 자동 삽입합니다." } },
    { "@type": "Question", "name": "X(트위터) 타래는 몇 자 기준인가요?", "acceptedAnswer": { "@type": "Answer", "text": "한 트윗당 공백 포함 약 130~140자 내외로 문맥이 끊기지 않도록 스마트하게 분할합니다." } },
    { "@type": "Question", "name": "이 툴의 결과를 공식 자료로 사용해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다." } }
  ]
};

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
import ShareBar from '@/app/components/ShareBar';
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <NavigationActions />

      {/* Tool Start Card - V4 Standard */}
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={40} color="#8b5cf6" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
          {isKo ? 'OSMU 콘텐츠 재가공 포맷터' : 'OSMU Content Formatter'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
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

      {/* ─── Standard Bottom Sections (Rulebook V4.4) ─── */}
      <div style={{ maxWidth: '1024px', margin: '0 auto', width: '100%', padding: '0 var(--page-padding)' }}>
        
        {/* 0-0. SNS Share */}
        <ShareBar 
          title={isKo ? 'OSMU 콘텐츠 재가공 포맷터' : 'OSMU Content Formatter'} 
          description={isKo ? '한 번의 작성으로 모든 SNS 플랫폼 점령' : 'One Source, Every Platform'} 
        />

        {/* 0-1. Recommended Tools */}
        <RelatedTools toolId="utilities/marketing/osmu-formatter" />

        {/* 0-2. Ad Placeholder */}
        <div style={{
          width: '100%',
          minHeight: '90px',
          backgroundColor: 'rgba(241, 245, 249, 0.5)',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          margin: '2rem 0'
        }}>
          {isKo ? '광고 영역 (Google AdSense 등)' : 'Ad Space (Google AdSense, etc.)'}
        </div>

        {/* 1 ~ 4. SEO Sections */}
        <SeoSection
          ko={{
            title: 'OSMU 재가공 포맷터란?',
            description: 'One Source Multi Use(OSMU) 전략을 실현하는 콘텐츠 자동 변환 도구입니다. 뉴스레터, 블로그 원고, 긴 글 하나를 입력하면 인스타그램 전용 본문(줄바꿈 최적화 + 해시태그), X(트위터) 타래 분할, 블로그 키워드 밀도 분석, 숏폼 대본(15초 단위 가이드)까지 단 1초 안에 자동 생성됩니다. 모든 처리는 브라우저 내에서 완결되어 원고가 외부 서버로 전송되지 않으며, 작성 중인 내용은 LocalStorage에 자동 저장되어 페이지를 닫아도 유지됩니다. 콘텐츠 마케터, 1인 창작자, 스타트업 마케팅 담당자가 시간을 10배 절감할 수 있는 필수 도구입니다.',
            useCases: [
              { icon: '📝', title: '개인 블로그 재가공', desc: '완성된 블로그 원고를 그대로 붙여넣으면 인스타그램 카드뉴스용 최적화 텍스트와 추천 해시태그 5개가 즉시 생성되어 별도 편집 없이 바로 게시할 수 있습니다.' },
              { icon: '🚀', title: 'SNS 마케팅 효율화', desc: '한 번의 콘텐츠 작성으로 인스타그램, X(트위터), 블로그, 유튜브 숏츠까지 모든 채널을 동시에 공략하여 마케팅 비용과 작업 시간을 대폭 줄일 수 있습니다.' },
              { icon: '🔍', title: 'SEO 키워드 점검', desc: '블로그 포스팅 전에 키워드 밀도 분석 기능으로 반복 단어를 시각화하여 검색엔진 크롤러가 선호하는 자연스러운 키워드 배분을 점검할 수 있습니다.' },
              { icon: '🎬', title: '숏폼 대본 자동화', desc: '원문 핵심 내용을 15초 단위 타임라인으로 자동 분절하여 유튜브 쇼츠, 인스타그램 릴스, 틱톡 촬영 대본을 별도 편집 없이 즉시 활용할 수 있습니다.' },
            ],
            steps: [
              { step: '원문 입력', desc: '왼쪽 텍스트 영역에 블로그 글, 뉴스레터, 또는 긴 아이디어를 그대로 붙여넣습니다. 저장 버튼 없이도 내용이 브라우저에 자동으로 임시 저장됩니다.' },
              { step: '플랫폼 탭 선택', desc: '우측 상단의 탭(인스타그램 / X / 블로그 분석 / 숏폼 대본)을 클릭하여 각 플랫폼에 최적화된 변환 결과를 확인합니다.' },
              { step: '결과 확인 및 수정', desc: '변환된 결과를 검토하고 필요한 경우 카드 우측의 복사 버튼을 눌러 개별 섹션(훅 문장, 본문, 해시태그)을 독립적으로 복사합니다.' },
              { step: '복사 및 게시', desc: '각 플랫폼에 맞는 결과를 복사한 뒤 해당 SNS 앱이나 블로그 에디터에 붙여넣어 바로 게시합니다. 전체 텍스트는 하단 전체 복사 버튼으로 한 번에 복사 가능합니다.' },
            ],
            faqs: [
              { q: '데이터가 서버로 전송되나요?', a: '아니요. 이 도구의 모든 처리(텍스트 분석, 변환, 저장)는 사용자의 웹 브라우저 내부에서만 이루어집니다. 입력한 원고는 외부 서버로 전송되지 않으며, 민감한 마케팅 원고나 개인 일기도 완전히 안전하게 작업할 수 있습니다.' },
              { q: '인스타그램 줄바꿈 점(.)은 왜 추가되나요?', a: '인스타그램 앱과 웹에서는 연속된 빈 줄이 자동으로 제거되는 알려진 버그가 있습니다. 이를 방지하기 위해 각 단락 사이에 마침표(.)를 자동으로 삽입하여 모바일 화면에서 가독성을 극대화합니다. 실제 인스타그램 인플루언서들이 수동으로 적용하는 테크닉과 동일한 방식입니다.' },
              { q: 'X(트위터) 타래 분할 기준은 무엇인가요?', a: '한 트윗당 공백 포함 약 130~140자 이내로, 문장이 중간에 끊기지 않도록 문장 단위로 스마트하게 분할합니다. 각 트윗 끝에 (1/N) 형태의 번호가 자동으로 붙어 타래 순서가 명확하게 표시됩니다.' },
              { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 수치는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
            ]
          }}
          en={{
            title: 'What is OSMU Content Formatter?',
            description: 'The OSMU Content Formatter is the ultimate tool for One Source Multi Use (OSMU) content strategy. Simply paste a long-form blog post, newsletter, or essay into the editor, and the tool instantly generates platform-optimized outputs: Instagram body text with automatic line-break dots and top hashtags, X (Twitter) thread splits at ~130 characters per tweet, blog keyword density analysis to guide SEO, and a 15-second-chunk Shorts script for video creators. All processing runs entirely in your browser — your content is never uploaded to any server. Draft content is auto-saved to LocalStorage so your work is preserved even if you close the tab. Whether you are a solo creator, marketing manager, or startup founder, this tool cuts your repurposing time by up to 90% and helps every piece of content reach more people across every channel.',
            useCases: [
              { icon: '📝', title: 'Blog Repurposing', desc: 'Paste your finished blog post and instantly get an Instagram-optimized caption with line-break formatting and five relevant hashtags, ready to publish without any manual editing.' },
              { icon: '🚀', title: 'Multi-Channel Marketing', desc: 'Write your content once and simultaneously produce versions tailored for Instagram, X, blog SEO analysis, and Shorts scripting — covering every major platform in a single workflow.' },
              { icon: '🔍', title: 'SEO Keyword Analysis', desc: 'Before publishing your blog post, use the keyword density chart to visualize repeated words and fine-tune your content so search engine crawlers recognize your key topics naturally.' },
              { icon: '🎬', title: 'Shorts Script Generator', desc: 'The tool automatically segments your key content into 15-second timeline chunks, giving you a ready-to-use shooting script for YouTube Shorts, Instagram Reels, or TikTok.' },
            ],
            steps: [
              { step: 'Paste Your Content', desc: 'Type or paste your blog post, newsletter draft, or any long-form text into the left editor panel. Your draft is auto-saved to LocalStorage so it persists between sessions.' },
              { step: 'Select a Platform Tab', desc: 'Click the Instagram, X, Blog Stats, or Shorts tab in the right panel to see your content instantly reformatted for that specific platform.' },
              { step: 'Review the Output', desc: 'Check the generated hook sentence, body text, hashtags, thread splits, or script chunks. Each section has its own copy button so you can grab exactly what you need.' },
              { step: 'Copy and Publish', desc: 'Click the copy button on any result card and paste directly into your social media app or blog editor. Use the Copy All button at the bottom to grab the full formatted output at once.' },
            ],
            faqs: [
              { q: 'Is my draft content safe and private?', a: 'Yes. All text analysis and conversion happens entirely within your web browser. Nothing you type is ever sent to an external server, making it completely safe for confidential marketing copy or personal writing.' },
              { q: 'Why are dots added between Instagram paragraphs?', a: 'Instagram has a known behavior where consecutive blank lines are collapsed and removed. Inserting a period on its own line prevents this, preserving your intended paragraph breaks and making the post more readable on mobile screens — a technique used by professional influencers.' },
              { q: 'How does the X (Twitter) thread splitting work?', a: 'The tool splits your text at sentence boundaries, keeping each tweet under approximately 130–140 characters to stay comfortably within the 280-character limit. A (1/N) counter is appended to each tweet so followers can follow the thread easily.' },
              { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures.' },
            ]
          }}
        />
      </div>
    </div>
  );
}
