"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

// ─── 링크 데이터 (tools-registry.ts 대신 여기서 직접 관리) ───────────────
const TOOLS_LINKS = [
  { emoji: "🚀", labelKo: "성능 및 모니터링",   labelEn: "Performance & Monitoring", href: "/utilities/performance" },
  { emoji: "📄", labelKo: "문서 변환/편집",      labelEn: "Document Conversion/Edit",  href: "/utilities/document" },
  { emoji: "💳", labelKo: "결제 및 핀테크",      labelEn: "Payments & Fintech",        href: "/utilities/finance" },
  { emoji: "⚡", labelKo: "생산성 도구",         labelEn: "Productivity Tools",        href: "/utilities/productivity" },
  { emoji: "✨", labelKo: "UX 및 디자인",        labelEn: "UX & Design",               href: "/utilities/design" },
];

const MORE_TOOLS_LINKS = [
  { emoji: "🤖", labelKo: "AI 및 마케팅",        labelEn: "AI & Marketing",            href: "/utilities/marketing" },
  { emoji: "🌿", labelKo: "라이프스타일 및 건강", labelEn: "Lifestyle & Health",        href: "/utilities/lifestyle" },
  { emoji: "🛡️", labelKo: "보안 및 프라이버시",  labelEn: "Security & Privacy",        href: "/utilities/security" },
  { emoji: "🛠️", labelKo: "유틸리티/게임",       labelEn: "Utility/Games",             href: "/utilities/utility" },
  { emoji: "💻", labelKo: "개발자 도구",          labelEn: "Developer Tools",           href: "/utilities/dev" },
];

const LEGAL_LINKS = [
  { labelKo: "개인정보처리방침", labelEn: "Privacy Policy",   href: "/privacy" },
  { labelKo: "이용약관",        labelEn: "Terms of Service",  href: "/terms" },
  { labelKo: "사이트맵",        labelEn: "Sitemap",           href: "/sitemap.xml" },
  { labelKo: "피드백",          labelEn: "Feedback",          href: "/feedback" },
];

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────
export default function Footer() {
  const locale = useLocale();
  const isKo = locale === "ko";

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-14">

        {/* ── 메인 그리드 ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">

          {/* 1. 브랜드 영역 — 모바일에서 2칸 차지 */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
            <Link href={`/${locale}`} className="flex items-center gap-2 w-fit">
              <span className="text-xl font-extrabold text-[#8b5cf6]">
                🛠️ Utility Hub
              </span>
            </Link>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[220px]">
              {isKo
                ? "일상의 모든 도구, 무료로 프라이빗하게."
                : "All your daily tools, free and private."}
            </p>

            {/* 신뢰 배지 */}
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-xs px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-semibold">
                100% Free
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                No Login
              </span>
            </div>
          </div>

          {/* 2. TOOLS */}
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-3">
              {isKo ? "도구" : "Tools"}
            </h3>
            <ul className="flex flex-col gap-2">
              {TOOLS_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={`/${locale}${item.href}`}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-[#8b5cf6] dark:hover:text-[#a78bfa] transition-colors duration-150 group py-0.5"
                  >
                    <span className="text-base leading-none">{item.emoji}</span>
                    <span className="group-hover:underline underline-offset-2 leading-snug">
                      {isKo ? item.labelKo : item.labelEn}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. MORE TOOLS */}
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-3">
              {isKo ? "더보기" : "More Tools"}
            </h3>
            <ul className="flex flex-col gap-2">
              {MORE_TOOLS_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={`/${locale}${item.href}`}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-[#8b5cf6] dark:hover:text-[#a78bfa] transition-colors duration-150 group py-0.5"
                  >
                    <span className="text-base leading-none">{item.emoji}</span>
                    <span className="group-hover:underline underline-offset-2 leading-snug">
                      {isKo ? item.labelKo : item.labelEn}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. LEGAL */}
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-3">
              {isKo ? "법적 고지" : "Legal"}
            </h3>
            <ul className="flex flex-col gap-2">
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={`/${locale}${item.href}`}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#8b5cf6] dark:hover:text-[#a78bfa] transition-colors duration-150 hover:underline underline-offset-2 py-0.5 block"
                  >
                    {isKo ? item.labelKo : item.labelEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── 하단 바 ── */}
        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">

          <p className="text-xs text-slate-400 dark:text-slate-600 order-2 sm:order-1">
            © 2026 Utility Hub. All rights reserved.
          </p>

          {/* 언어 전환 */}
          <div className="flex items-center gap-1 order-1 sm:order-2">
            <Link
              href="/ko"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150
                ${locale === "ko"
                  ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#8b5cf6]"
                }`}
            >
              🇰🇷 한국어
            </Link>
            <span className="text-slate-300 dark:text-slate-700 text-xs">|</span>
            <Link
              href="/en"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150
                ${locale === "en"
                  ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#8b5cf6]"
                }`}
            >
              🇺🇸 English
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
