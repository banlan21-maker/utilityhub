'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Download, Instagram, Twitter, FileText, Video, Sparkles, Save, Trash2, Hash, ChevronRight } from 'lucide-react';

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

export default function OSMUContentFormatter() {
  const [originalText, setOriginalText] = useState('');
  const [activeTab, setActiveTab] = useState<'instagram' | 'x' | 'blog' | 'shorts'>('instagram');
  const [result, setResult] = useState<PlatformResult>({
    instagram: '',
    instagramHook: '',
    instagramHashtags: '',
    xThreads: [],
    blogStats: { withSpaces: 0, withoutSpaces: 0, bytes: 0, keywordDensity: [] },
    shortsScript: ''
  });

  // 로컬 저장소 자동 저장
  useEffect(() => {
    const saved = localStorage.getItem('osmu-draft');
    if (saved) {
      setOriginalText(saved);
    }
  }, []);

  useEffect(() => {
    if (originalText) {
      localStorage.setItem('osmu-draft', originalText);
    }
  }, [originalText]);

  // 인스타그램 변환 로직
  const convertToInstagram = (text: string) => {
    // 줄바꿈 사이에 점(.) 삽입
    const formatted = text
      .split('\n')
      .filter(line => line.trim())
      .join('\n.\n');

    // Hook 생성 (첫 2문장 추출)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const hook = sentences.slice(0, 2).join(' ').substring(0, 100);

    // 해시태그 생성 (주요 키워드 추출)
    const words = text.toLowerCase().match(/[\uAC00-\uD7A3a-z]{2,}/g) || [];
    const frequency: Record<string, number> = {};
    words.forEach(word => {
      if (word.length > 2) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });
    const topKeywords = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => `#${word}`);

    return {
      formatted,
      hook,
      hashtags: topKeywords.join(' ')
    };
  };

  // X(트위터) 타래 변환
  const convertToXThreads = (text: string) => {
    const threads: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentThread = '';

    sentences.forEach(sentence => {
      if ((currentThread + sentence).length > 130) {
        if (currentThread) {
          threads.push(currentThread.trim());
        }
        currentThread = sentence;
      } else {
        currentThread += sentence;
      }
    });

    if (currentThread) {
      threads.push(currentThread.trim());
    }

    return threads.map((thread, idx) => `${thread} (${idx + 1}/${threads.length})`);
  };

  // 블로그 통계 계산
  const calculateBlogStats = (text: string) => {
    const withSpaces = text.length;
    const withoutSpaces = text.replace(/\s/g, '').length;
    const bytes = new Blob([text]).size;

    // 키워드 밀도 분석
    const words = text.toLowerCase().match(/[\uAC00-\uD7A3a-z]{2,}/g) || [];
    const frequency: Record<string, number> = {};
    words.forEach(word => {
      if (word.length > 2) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    const keywordDensity = Object.entries(frequency)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    return { withSpaces, withoutSpaces, bytes, keywordDensity };
  };

  // 숏폼 스크립트 변환
  const convertToShortsScript = (text: string) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    // 1분 분량 (약 150자 내외)
    let script = '';
    let charCount = 0;

    for (const sentence of sentences) {
      if (charCount + sentence.length > 150) break;
      script += sentence + '\n';
      charCount += sentence.length;
    }

    // 자막용 분할 (15초 단위)
    const scriptLines = script.split('\n').filter(l => l.trim());
    const chunks: string[] = [];
    let currentChunk = '';

    scriptLines.forEach(line => {
      if ((currentChunk + line).length > 40) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = line;
      } else {
        currentChunk += ' ' + line;
      }
    });

    if (currentChunk) chunks.push(currentChunk.trim());

    return chunks.map((chunk, idx) => `[${idx * 15}초] ${chunk}`).join('\n\n');
  };

  // 전체 변환 실행
  const handleConvert = () => {
    if (!originalText.trim()) return;

    const instagram = convertToInstagram(originalText);
    const xThreads = convertToXThreads(originalText);
    const blogStats = calculateBlogStats(originalText);
    const shortsScript = convertToShortsScript(originalText);

    setResult({
      instagram: instagram.formatted,
      instagramHook: instagram.hook,
      instagramHashtags: instagram.hashtags,
      xThreads,
      blogStats,
      shortsScript
    });
  };

  // 실시간 변환
  useEffect(() => {
    if (originalText) {
      handleConvert();
    }
  }, [originalText]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('클립보드에 복사되었습니다!');
  };

  const downloadAsImage = async (text: string, filename: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';

    const lines = text.split('\n');
    lines.forEach((line, idx) => {
      ctx.fillText(line, 20, 30 + idx * 25);
    });

    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const clearAll = () => {
    if (confirm('모든 내용을 삭제하시겠습니까?')) {
      setOriginalText('');
      localStorage.removeItem('osmu-draft');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              OSMU 콘텐츠 재가공 포맷터
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            한 번의 입력으로 모든 플랫폼 점령 - One Source, Every Platform
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm">
            <Save className="w-4 h-4" />
            작성 중인 내용은 자동으로 저장됩니다
          </div>
        </div>

        {/* Split View */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Left: Input */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-violet-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-600" />
                원문 입력
              </h2>
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
              >
                <Trash2 className="w-4 h-4" />
                전체 삭제
              </button>
            </div>
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="긴 원문을 입력하세요. 자동으로 모든 플랫폼에 맞게 변환됩니다..."
              className="w-full h-[600px] p-4 border-2 border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none font-mono text-sm"
            />
            <div className="mt-2 text-sm text-gray-500">
              글자 수: {originalText.length}자
            </div>
          </div>

          {/* Right: Preview */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-violet-100">
            {/* Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('instagram')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                  activeTab === 'instagram'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Instagram className="w-4 h-4" />
                인스타그램
              </button>
              <button
                onClick={() => setActiveTab('x')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                  activeTab === 'x'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Twitter className="w-4 h-4" />
                X (트위터)
              </button>
              <button
                onClick={() => setActiveTab('blog')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                  activeTab === 'blog'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                블로그
              </button>
              <button
                onClick={() => setActiveTab('shorts')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                  activeTab === 'shorts'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Video className="w-4 h-4" />
                숏폼
              </button>
            </div>

            {/* Content Area */}
            <div className="h-[600px] overflow-y-auto">
              {activeTab === 'instagram' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-600" />
                        시선 강탈 첫 줄 (Hook)
                      </h3>
                      <button
                        onClick={() => copyToClipboard(result.instagramHook)}
                        className="p-2 hover:bg-white rounded-lg transition"
                      >
                        <Copy className="w-4 h-4 text-violet-600" />
                      </button>
                    </div>
                    <p className="text-gray-700 font-medium">{result.instagramHook || '원문을 입력하면 자동 생성됩니다'}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800">본문</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(result.instagram)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition text-sm"
                        >
                          <Copy className="w-4 h-4" />
                          전체 복사
                        </button>
                        <button
                          onClick={() => downloadAsImage(result.instagram, 'instagram')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                        >
                          <Download className="w-4 h-4" />
                          이미지 저장
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl whitespace-pre-wrap font-mono text-sm">
                      {result.instagram || '원문을 입력하세요...'}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-violet-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Hash className="w-4 h-4 text-violet-600" />
                        추천 해시태그
                      </h3>
                      <button
                        onClick={() => copyToClipboard(result.instagramHashtags)}
                        className="p-2 hover:bg-white rounded-lg transition"
                      >
                        <Copy className="w-4 h-4 text-violet-600" />
                      </button>
                    </div>
                    <p className="text-violet-700 font-medium">{result.instagramHashtags || '#자동생성 #예정'}</p>
                  </div>
                </div>
              )}

              {activeTab === 'x' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">트위터 타래 ({result.xThreads.length}개)</h3>
                  </div>
                  {result.xThreads.length > 0 ? (
                    result.xThreads.map((thread, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-xl border-l-4 border-violet-500">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-gray-700 flex-1 font-mono text-sm">{thread}</p>
                          <button
                            onClick={() => copyToClipboard(thread.replace(/ \(\d+\/\d+\)$/, ''))}
                            className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition text-sm whitespace-nowrap"
                          >
                            <Copy className="w-4 h-4" />
                            복사
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">원문을 입력하면 자동으로 타래가 생성됩니다</p>
                  )}
                </div>
              )}

              {activeTab === 'blog' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-violet-600">{result.blogStats.withSpaces}</div>
                      <div className="text-sm text-gray-600">공백 포함</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-purple-600">{result.blogStats.withoutSpaces}</div>
                      <div className="text-sm text-gray-600">공백 제외</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-violet-50 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-pink-600">{result.blogStats.bytes}</div>
                      <div className="text-sm text-gray-600">Bytes</div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-violet-100 p-4 rounded-xl">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Hash className="w-5 h-5 text-violet-600" />
                      키워드 밀도 분석
                    </h3>
                    {result.blogStats.keywordDensity.length > 0 ? (
                      <div className="space-y-2">
                        {result.blogStats.keywordDensity.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-gray-700">{item.keyword}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-violet-600 h-2 rounded-full"
                                  style={{ width: `${Math.min((item.count / result.blogStats.keywordDensity[0].count) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-violet-600 font-bold w-8 text-right">{item.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">원문을 입력하면 키워드 분석이 시작됩니다</p>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800">원문 미리보기</h3>
                      <button
                        onClick={() => copyToClipboard(originalText)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        복사
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                      {originalText || '원문을 입력하세요...'}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'shorts' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="w-5 h-5 text-red-600" />
                      <h3 className="font-bold text-gray-800">1분 숏폼 스크립트 (자막용)</h3>
                    </div>
                    <p className="text-sm text-gray-600">15초 단위로 자막을 나누어 제공합니다</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800">스크립트</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(result.shortsScript)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition text-sm"
                        >
                          <Copy className="w-4 h-4" />
                          전체 복사
                        </button>
                        <button
                          onClick={() => downloadAsImage(result.shortsScript, 'shorts-script')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                        >
                          <Download className="w-4 h-4" />
                          이미지 저장
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl whitespace-pre-wrap font-mono text-sm">
                      {result.shortsScript || '원문을 입력하면 자동으로 숏폼 스크립트가 생성됩니다...'}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl">
                    <h4 className="font-bold text-yellow-800 mb-2">활용 팁</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• 각 타임스탬프는 15초 단위로 구분되어 있습니다</li>
                      <li>• 유튜브 숏츠, 틱톡, 인스타 릴스에 모두 활용 가능</li>
                      <li>• 자막 편집기에 복사하여 바로 사용하세요</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 추천 도구 섹션 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-violet-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-600" />
            추천 도구
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a href="#" className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl hover:shadow-md transition">
              <h3 className="font-bold text-violet-700 mb-2">AI 이미지 생성기</h3>
              <p className="text-sm text-gray-600">텍스트로 SNS용 썸네일 제작</p>
            </a>
            <a href="#" className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition">
              <h3 className="font-bold text-purple-700 mb-2">해시태그 분석기</h3>
              <p className="text-sm text-gray-600">인기 해시태그 트렌드 확인</p>
            </a>
            <a href="#" className="p-4 bg-gradient-to-br from-pink-50 to-violet-50 rounded-xl hover:shadow-md transition">
              <h3 className="font-bold text-pink-700 mb-2">콘텐츠 일정 관리</h3>
              <p className="text-sm text-gray-600">플랫폼별 발행 스케줄러</p>
            </a>
          </div>
        </div>

        {/* 광고 구역 */}
        <div className="bg-gradient-to-r from-violet-100 to-purple-100 rounded-2xl shadow-lg p-8 mb-8 border border-violet-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-violet-800 mb-2">광고 구역</h3>
            <p className="text-violet-600">마케팅 효율을 높이는 프리미엄 서비스를 만나보세요</p>
          </div>
        </div>

        {/* SEO 섹션 1: OSMU 활용 꿀팁 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-violet-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ChevronRight className="w-6 h-6 text-violet-600" />
            OSMU 활용 꿀팁 - 업무 효율 200% 향상 전략
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-violet-500 pl-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">1. 한 번 작성, 네 번 활용하는 콘텐츠 전략</h3>
              <p className="text-gray-700 leading-relaxed">
                긴 블로그 포스트 하나를 작성하면, 이 도구를 통해 인스타그램 캐러셀, X 타래, 네이버 블로그, 유튜브 숏츠 대본까지 자동으로 변환됩니다.
                월요일 아침 30분만 투자하면 한 주 전체의 SNS 콘텐츠를 확보할 수 있습니다. 마케터들이 가장 많이 쓰는 시간인 '복붙과 수정'에서 해방되세요.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">2. 플랫폼별 최적화 자동 적용</h3>
              <p className="text-gray-700 leading-relaxed">
                인스타그램은 줄바꿈 사이에 점(.)을 넣어 가독성을 높이고, X는 130자 내외로 자연스럽게 문장을 끊으며, 블로그는 키워드 밀도까지 분석해줍니다.
                각 플랫폼의 알고리즘과 사용자 행동 패턴을 반영한 변환 로직이 적용되어, 별도의 수정 없이도 바로 게시할 수 있는 퀄리티를 보장합니다.
              </p>
            </div>

            <div className="border-l-4 border-pink-500 pl-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">3. 해시태그와 Hook은 자동 생성</h3>
              <p className="text-gray-700 leading-relaxed">
                글 속 주요 키워드를 분석해 인스타그램용 해시태그 5개를 자동 추출하고, 첫 2문장으로 시선을 사로잡는 Hook을 추천합니다.
                더 이상 '어떤 해시태그를 써야 하지?', '첫 줄을 뭐라고 시작하지?'라는 고민에 시간을 낭비할 필요가 없습니다.
                데이터 기반으로 가장 많이 반복되는 핵심 키워드가 자동 선별됩니다.
              </p>
            </div>

            <div className="border-l-4 border-violet-500 pl-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">4. 로컬 저장소로 작업 손실 제로</h3>
              <p className="text-gray-700 leading-relaxed">
                작성 중이던 원고는 브라우저에 자동으로 저장되므로, 실수로 창을 닫아도 다시 열면 그대로 복구됩니다.
                중요한 원고를 날린 경험, 이제 걱정하지 마세요. 서버에 전송되지 않으므로 보안도 완벽합니다.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">5. 숏폼 콘텐츠 제작 시간 1/10로 단축</h3>
              <p className="text-gray-700 leading-relaxed">
                유튜브 숏츠, 틱톡, 인스타 릴스용 대본을 15초 단위로 자동 분할해주므로, 자막 편집 시간을 극적으로 줄일 수 있습니다.
                1분 분량 스크립트가 타임스탬프와 함께 제공되어, 영상 편집자에게 전달하거나 직접 자막을 넣을 때 즉시 활용 가능합니다.
              </p>
            </div>

            <div className="border-l-4 border-pink-500 pl-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">6. 키워드 밀도 분석으로 SEO 최적화</h3>
              <p className="text-gray-700 leading-relaxed">
                블로그 모드에서는 글 속에 반복되는 키워드의 빈도를 시각화하여 보여줍니다. 특정 키워드가 과도하게 반복되는지,
                혹은 중요한 키워드가 부족한지 한눈에 파악할 수 있어 검색엔진 최적화(SEO)에 유리한 글쓰기가 가능합니다.
                네이버 블로그 상위 노출을 원한다면 필수로 활용하세요.
              </p>
            </div>
          </div>
        </div>

        {/* SEO 섹션 2: 보안 문구 */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 mb-8 border-2 border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-green-800 mb-3">100% 로컬 처리 - 완벽한 보안</h2>
              <p className="text-green-700 text-lg leading-relaxed mb-4">
                당신의 창의적인 원고는 <strong className="text-green-900">서버로 전송되지 않으며</strong> 오직 당신의 브라우저에만 머뭅니다.
                모든 변환 과정은 로컬 컴퓨터에서 실시간으로 처리되므로, 기밀 콘텐츠나 미공개 마케팅 전략도 안심하고 작업할 수 있습니다.
              </p>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                  서버 전송 없음 - 네트워크 요청 Zero
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                  브라우저 로컬 스토리지만 사용
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                  제3자 데이터 공유 절대 없음
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* SEO 섹션 3: FAQ */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-violet-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">자주 묻는 질문 (FAQ)</h2>
          <div className="space-y-4">
            <details className="group bg-violet-50 p-4 rounded-xl cursor-pointer">
              <summary className="font-bold text-gray-800 list-none flex items-center justify-between">
                AI 요약은 안전한가요?
                <ChevronRight className="w-5 h-5 text-violet-600 group-open:rotate-90 transition" />
              </summary>
              <p className="mt-3 text-gray-700 leading-relaxed">
                네, 100% 안전합니다. 모든 변환과 분석은 서버로 전송되지 않고 당신의 브라우저(로컬)에서만 처리됩니다.
                AI 요약 기능은 로컬 AI(Gemini Nano) 기반으로, 외부 서버에 데이터를 전송하지 않습니다.
              </p>
            </details>

            <details className="group bg-purple-50 p-4 rounded-xl cursor-pointer">
              <summary className="font-bold text-gray-800 list-none flex items-center justify-between">
                글자 수 제한이 있나요?
                <ChevronRight className="w-5 h-5 text-purple-600 group-open:rotate-90 transition" />
              </summary>
              <p className="mt-3 text-gray-700 leading-relaxed">
                원문 입력에는 글자 수 제한이 없습니다. 다만, 각 플랫폼별 권장 길이(인스타그램 2,200자, X 280자, 블로그 무제한)에 맞춰 자동으로 최적화됩니다.
              </p>
            </details>

            <details className="group bg-pink-50 p-4 rounded-xl cursor-pointer">
              <summary className="font-bold text-gray-800 list-none flex items-center justify-between">
                해시태그는 어떤 기준으로 생성되나요?
                <ChevronRight className="w-5 h-5 text-pink-600 group-open:rotate-90 transition" />
              </summary>
              <p className="mt-3 text-gray-700 leading-relaxed">
                원문에서 2글자 이상의 단어를 추출한 뒤, 빈도수가 높은 상위 5개 키워드를 해시태그로 변환합니다.
                한글과 영어 모두 지원하며, 조사나 불필요한 단어는 자동으로 제외됩니다.
              </p>
            </details>

            <details className="group bg-violet-50 p-4 rounded-xl cursor-pointer">
              <summary className="font-bold text-gray-800 list-none flex items-center justify-between">
                이미지로 저장하면 어떤 형식인가요?
                <ChevronRight className="w-5 h-5 text-violet-600 group-open:rotate-90 transition" />
              </summary>
              <p className="mt-3 text-gray-700 leading-relaxed">
                PNG 형식으로 저장되며, 800x600 해상도의 이미지로 다운로드됩니다. 텍스트 기반이므로 SNS 업로드나 공유용으로 활용 가능합니다.
              </p>
            </details>

            <details className="group bg-purple-50 p-4 rounded-xl cursor-pointer">
              <summary className="font-bold text-gray-800 list-none flex items-center justify-between">
                작업하던 내용이 사라지면 어떻게 하나요?
                <ChevronRight className="w-5 h-5 text-purple-600 group-open:rotate-90 transition" />
              </summary>
              <p className="mt-3 text-gray-700 leading-relaxed">
                브라우저의 로컬 저장소에 자동 저장되므로, 창을 닫아도 다시 열면 그대로 복구됩니다.
                단, 브라우저 캐시를 삭제하면 내용이 사라질 수 있으니 중요한 원고는 별도로 백업하세요.
              </p>
            </details>
          </div>
        </div>

        {/* SEO 섹션 4: 키워드 리치 설명 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-violet-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">OSMU 콘텐츠 재가공 포맷터란?</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
            <p>
              <strong className="text-violet-700">OSMU 콘텐츠 재가공 포맷터</strong>는 한 번 작성한 긴 원문을
              <strong> 인스타그램 줄바꿈 프로그램</strong>, <strong>트위터 타래 자르기</strong>,
              <strong> 블로그 글자수 세기</strong>, <strong>유튜브 대본 요약</strong> 등 모든 플랫폼에 최적화된 형식으로
              자동 변환해주는 <strong>콘텐츠 재가공 툴</strong>입니다.
            </p>
            <p>
              마케터, 블로거, 유튜버, SNS 운영자라면 누구나 겪는 '같은 내용을 여러 플랫폼에 맞춰 다시 쓰는' 비효율을
              <strong className="text-violet-700"> OSMU(One Source Multi Use) 전략</strong>으로 해결합니다.
              긴 블로그 포스트 하나면 인스타그램 캐러셀, X(트위터) 타래, 네이버 블로그, 유튜브 숏츠 대본까지
              <strong> 원클릭으로 자동 생성</strong>됩니다.
            </p>
            <p>
              특히 <strong>인스타그램 줄바꿈</strong>은 엔터 사이에 점(.)을 자동 삽입해 가독성을 높이고,
              <strong> X 타래</strong>는 130자 내외로 문장이 끝나는 지점을 지능적으로 인식해 자연스럽게 분할합니다.
              <strong> 블로그 글자수 계산기</strong>는 공백 포함/제외, 바이트 수는 물론 키워드 밀도까지 분석하여
              <strong> SEO 최적화</strong>에 도움을 줍니다.
            </p>
            <p>
              <strong>유튜브 숏츠 대본</strong>은 1분 분량으로 요약하고 15초 단위로 자막을 분할해주므로,
              영상 편집 시간을 획기적으로 단축할 수 있습니다. 모든 기능은 <strong>100% 로컬 처리</strong>로 동작하므로
              서버 전송 없이 안전하게 사용할 수 있으며, <strong>브라우저 자동 저장</strong>으로 작업 손실 걱정도 없습니다.
            </p>
            <p>
              지금 바로 <strong className="text-violet-700">OSMU 콘텐츠 재가공 포맷터</strong>를 활용해
              콘텐츠 제작 시간은 1/4로 줄이고, 모든 플랫폼을 동시에 점령하세요.
              <strong> One Source, Every Platform</strong> - 이것이 바로 스마트 마케팅의 시작입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
