"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { 
  Github, 
  Mail, 
  ExternalLink, 
  ShieldCheck, 
  Code2, 
  Zap, 
  Globe, 
  FileText, 
  CreditCard, 
  Sparkles,
  Search,
  MessageSquare
} from "lucide-react";

// CATEGORIES Data for Footer
const CATEGORY_GROUPS = [
  {
    titleKey: "footer.tools_title",
    links: [
      { icon: <Zap className="w-4 h-4" />, labelKo: "성능 및 모니터링", labelEn: "Performance", href: "/utilities/performance" },
      { icon: <FileText className="w-4 h-4" />, labelKo: "문서 변환/편집", labelEn: "Documents", href: "/utilities/document" },
      { icon: <CreditCard className="w-4 h-4" />, labelKo: "결제 및 핀테크", labelEn: "Fintech", href: "/utilities/finance" },
      { icon: <Sparkles className="w-4 h-4" />, labelKo: "UX 및 디자인", labelEn: "UX & Design", href: "/utilities/design" },
      { icon: <Search className="w-4 h-4" />, labelKo: "생산성 도구", labelEn: "Productivity", href: "/utilities/productivity" },
    ]
  },
  {
    titleKey: "footer.more_tools_title",
    links: [
      { icon: <Globe className="w-4 h-4" />, labelKo: "AI 및 마케팅", labelEn: "AI & Marketing", href: "/utilities/marketing" },
      { icon: <ShieldCheck className="w-4 h-4" />, labelKo: "보안 및 프라이버시", labelEn: "Security", href: "/utilities/security" },
      { icon: <Code2 className="w-4 h-4" />, labelKo: "개발자 도구", labelEn: "Dev Tools", href: "/utilities/dev" },
      { icon: <span className="text-sm">🛠️</span>, labelKo: "유틸리티/게임", labelEn: "Utility/Games", href: "/utilities/utility" },
      { icon: <span className="text-sm">🌿</span>, labelKo: "라이프스타일", labelEn: "Lifestyle", href: "/utilities/lifestyle" },
    ]
  }
];

const LEGAL_LINKS = [
  { labelKo: "소개", labelEn: "About Us", href: "/about" },
  { labelKo: "문의하기", labelEn: "Contact Us", href: "/contact" },
  { labelKo: "개인정보처리방침", labelEn: "Privacy Policy", href: "/privacy" },
  { labelKo: "이용약관", labelEn: "Terms of Service", href: "/terms" },
  { labelKo: "사이트맵", labelEn: "Sitemap", href: "/sitemap.xml", external: true },
];

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const isKo = locale === "ko";

  return (
    <footer className="w-full bg-[#f8fafc] dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800 transition-colors duration-300 overflow-hidden">
      {/* Dynamic Background Element */}
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"></div>
      
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Identity Section */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-xl">🛠️</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Utility Hub
              </span>
            </Link>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-[280px]">
              {isKo 
                ? "사용자의 소중한 데이터는 서버에 저장되지 않습니다. 모든 작업은 브라우저에서 안전하게 실행됩니다." 
                : "Your data stays private. All processing happens locally in your browser, never on our servers."}
            </p>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-bold border border-violet-200/50 dark:border-violet-500/20">
                <Zap className="w-3 h-3 fill-current" />
                100% FREE
              </span>
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/50 dark:border-emerald-500/20">
                <ShieldCheck className="w-3 h-3 fill-current" />
                NO LOGIN
              </span>
            </div>
          </div>

          {/* Navigation Links Grid */}
          <div className="md:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              
              {CATEGORY_GROUPS.map((group, idx) => (
                <div key={idx} className="flex flex-col gap-5">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
                    {t(group.titleKey)}
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {group.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <Link 
                          href={link.href as any}
                          className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 group"
                        >
                          <span className="text-slate-400 dark:text-slate-600 group-hover:text-violet-500 transition-colors">
                            {link.icon}
                          </span>
                          <span className="font-semibold group-hover:translate-x-0.5 transition-transform">
                            {isKo ? link.labelKo : link.labelEn}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Legal & Feedback Column */}
              <div className="flex flex-col gap-5">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
                  {isKo ? "법적 고지 및 커뮤니티" : "LEGAL & FEEDBACK"}
                </h3>
                <ul className="flex flex-col gap-3">
                  {LEGAL_LINKS.map((link, lIdx) => (
                    <li key={lIdx}>
                      {link.external ? (
                        <a 
                          href={link.href}
                          className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all"
                        >
                          {isKo ? link.labelKo : link.labelEn}
                        </a>
                      ) : (
                        <Link 
                          href={link.href as any}
                          className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all"
                        >
                          {isKo ? link.labelKo : link.labelEn}
                        </Link>
                      )}
                    </li>
                  ))}
                  <li>
                    <Link 
                      href="/feedback"
                      className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-lg bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-violet-500 dark:hover:border-violet-500 transition-all group"
                    >
                      <MessageSquare className="w-4 h-4 text-violet-500" />
                      {isKo ? "피드백 보내기" : "Send Feedback"}
                    </Link>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-600">
              © 2026 Utility Hub. All rights reserved.
            </p>
            <div className="hidden md:block h-3 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="mailto:support@theutilhub.com" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Premium Language Switcher */}
          <div className="p-1 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 flex items-center shadow-inner">
            <Link
              href="/"
              locale="ko"
              className={`px-5 py-2 rounded-lg text-xs font-black transition-all duration-300 ${
                isKo 
                  ? "bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              한국어
            </Link>
            <Link
              href="/"
              locale="en"
              className={`px-5 py-2 rounded-lg text-xs font-black transition-all duration-300 ${
                !isKo 
                  ? "bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              ENGLISH
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
