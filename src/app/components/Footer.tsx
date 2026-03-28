"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import {
  Github,
  Mail,
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
      { icon: <Zap className="w-4 h-4" />, labelKo: "성능 및 모니터링", labelEn: "Performance & Monitoring", href: "/utilities/performance" },
      { icon: <FileText className="w-4 h-4" />, labelKo: "문서 변환/편집", labelEn: "Document Conversion/Edit", href: "/utilities/document" },
      { icon: <CreditCard className="w-4 h-4" />, labelKo: "결제 및 핀테크", labelEn: "Payments & Fintech", href: "/utilities/finance" },
      { icon: <Zap className="w-4 h-4" />, labelKo: "생산성 도구", labelEn: "Productivity Tools", href: "/utilities/productivity" },
      { icon: <Sparkles className="w-4 h-4" />, labelKo: "UX 및 디자인", labelEn: "UX & Design", href: "/utilities/design" },
    ]
  },
  {
    titleKey: "footer.more_tools_title",
    links: [
      { icon: <Globe className="w-4 h-4" />, labelKo: "AI 및 마케팅", labelEn: "AI & Marketing", href: "/utilities/marketing" },
      { icon: <span className="text-sm">🌿</span>, labelKo: "라이프스타일", labelEn: "Lifestyle & Health", href: "/utilities/lifestyle" },
      { icon: <ShieldCheck className="w-4 h-4" />, labelKo: "보안 및 프라이버시", labelEn: "Security & Privacy", href: "/utilities/security" },
      { icon: <span className="text-sm">🛠️</span>, labelKo: "유틸리티/게임", labelEn: "Utility/Games", href: "/utilities/utility" },
      { icon: <Code2 className="w-4 h-4" />, labelKo: "개발자 도구", labelEn: "Developer Tools", href: "/utilities/dev" },
    ]
  }
];

const LEGAL_LINKS = [
  { labelKo: "개인정보처리방침", labelEn: "Privacy Policy", href: "/privacy" },
  { labelKo: "이용약관", labelEn: "Terms of Service", href: "/terms" },
  { labelKo: "사이트맵", labelEn: "Sitemap", href: "/sitemap.xml", external: true },
  { labelKo: "피드백", labelEn: "Feedback", href: "/feedback" },
];

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const isKo = locale === "ko";

  return (
    <footer className="w-full bg-[#1a1a1a] border-t border-[#2a2a2a] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <h2 className="text-2xl font-bold text-[#ff6b35]">Utility Hub</h2>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your daily tools, free and private.
            </p>
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} Utility Hub. All rights reserved.
            </p>
          </div>

          {/* Tools Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              TOOLS
            </h3>
            <ul className="space-y-2.5">
              {CATEGORY_GROUPS[0].links.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href as any}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#ff6b35] transition-colors"
                  >
                    <span className="text-gray-500">{link.icon}</span>
                    <span>{isKo ? link.labelKo : link.labelEn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Tools Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              MORE TOOLS
            </h3>
            <ul className="space-y-2.5">
              {CATEGORY_GROUPS[1].links.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href as any}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#ff6b35] transition-colors"
                  >
                    <span className="text-gray-500">{link.icon}</span>
                    <span>{isKo ? link.labelKo : link.labelEn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              LEGAL
            </h3>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link, idx) => (
                <li key={idx}>
                  {link.external ? (
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-[#ff6b35] transition-colors"
                    >
                      {isKo ? link.labelKo : link.labelEn}
                    </a>
                  ) : (
                    <Link
                      href={link.href as any}
                      className="text-sm text-gray-400 hover:text-[#ff6b35] transition-colors"
                    >
                      {isKo ? link.labelKo : link.labelEn}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#2a2a2a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="mailto:support@theutilhub.com" className="text-gray-500 hover:text-gray-300 transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-[#2a2a2a] rounded-lg p-1">
            <Link
              href="/"
              locale="ko"
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
                isKo
                  ? "bg-[#ff6b35] text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              한국어
            </Link>
            <Link
              href="/"
              locale="en"
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
                !isKo
                  ? "bg-[#ff6b35] text-white"
                  : "text-gray-400 hover:text-gray-300"
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
