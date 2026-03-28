"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { Github, Mail, Heart } from "lucide-react";

export default function Footer() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-gradient-to-b from-white to-slate-50/50 border-t border-slate-100 overflow-hidden">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Top Section: Brand + Quick Links */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-12">

          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform duration-300">
                <span className="text-2xl">🛠️</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Utility Hub
              </span>
            </Link>

            <p className="text-sm text-slate-600 leading-relaxed max-w-[320px] font-medium">
              {isKo
                ? "로그인 없이 무료로 사용하는 브라우저 기반 유틸리티 도구 모음"
                : "Free browser-based utility tools. No login required."}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all duration-200"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="mailto:support@theutilhub.com"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all duration-200"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-6 text-center md:text-left">

            {/* Column 1: Categories */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                {isKo ? "카테고리" : "CATEGORIES"}
              </h3>
              <Link href="/utilities/finance" className="text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors">
                {isKo ? "💳 금융" : "💳 Finance"}
              </Link>
              <Link href="/utilities/productivity" className="text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors">
                {isKo ? "⚡ 생산성" : "⚡ Productivity"}
              </Link>
              <Link href="/utilities/dev" className="text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors">
                {isKo ? "💻 개발" : "💻 Dev Tools"}
              </Link>
            </div>

            {/* Column 2: Company */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                {isKo ? "회사" : "COMPANY"}
              </h3>
              <Link href="/privacy" className="text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors">
                {isKo ? "개인정보처리방침" : "Privacy"}
              </Link>
              <Link href="/terms" className="text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors">
                {isKo ? "이용약관" : "Terms"}
              </Link>
              <Link href="/feedback" className="text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors">
                {isKo ? "피드백" : "Feedback"}
              </Link>
            </div>

            {/* Column 3: Language Switcher */}
            <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                {isKo ? "언어" : "LANGUAGE"}
              </h3>
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm w-fit mx-auto sm:mx-0">
                <Link
                  href="/"
                  locale="ko"
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
                    isKo
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  한국어
                </Link>
                <Link
                  href="/"
                  locale="en"
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
                    !isKo
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  EN
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Copyright */}
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
            © {currentYear} Utility Hub
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5">
              {isKo ? "만든이" : "Made with"}
              <Heart className="w-3 h-3 fill-orange-500 text-orange-500" />
              {isKo ? "" : "by Dev Team"}
            </span>
          </p>

          {/* Privacy Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/50">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700">
              {isKo ? "100% 브라우저에서 실행" : "100% Browser-based"}
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}
