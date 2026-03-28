'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { tools } from '@/lib/tools-registry';

export default function Footer() {
  const t = useTranslations();

  // Filter tools into columns based on user requirements
  const toolColumns = [
    {
      titleKey: "footer.tools_title",
      items: tools.filter((tool) => 
        ["performance", "document", "finance", "productivity", "design"].includes(tool.category)
      ).slice(0, 8), // Limit items for a clean look
    },
    {
      titleKey: "footer.more_tools_title",
      items: tools.filter((tool) => 
        ["marketing", "lifestyle", "security", "utility", "dev"].includes(tool.category)
      ).slice(0, 8),
    },
  ];

  const legalLinks = [
    { href: "/privacy", labelKey: "footer.privacy" },
    { href: "/terms", labelKey: "footer.terms" },
    { href: "/sitemap", labelKey: "footer.sitemap" },
    { href: "/feedback", labelKey: "footer.feedback" },
  ];

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800
                       bg-white dark:bg-slate-950
                       transition-colors duration-300">
      
      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          
          {/* 1. Brand Area */}
          <div className="md:col-span-1">
            <div className="flex flex-col gap-3">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <Link href="/" className="text-xl font-extrabold text-[var(--color-primary)] hover:opacity-80 transition-opacity">
                  🛠️ Utility Hub
                </Link>
              </div>

              {/* Slogan */}
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">
                {t("footer.slogan")}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="text-xs px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30
                                 text-violet-700 dark:text-violet-300 font-medium">
                  100% Free
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800
                                 text-slate-600 dark:text-slate-400 font-medium">
                  No Login
                </span>
              </div>
            </div>
          </div>

          {/* 2 & 3. Navigation Columns (Tools) */}
          {toolColumns.map((column, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-bold tracking-widest uppercase
                             text-slate-400 dark:text-slate-500 mb-4">
                {t(column.titleKey)}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {column.items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 text-sm
                                 text-slate-600 dark:text-slate-400
                                 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)]
                                 transition-colors duration-150 group py-1"
                    >
                      <span className="text-base grayscale group-hover:grayscale-0 transition-all">{item.emoji}</span>
                      <span className="group-hover:underline underline-offset-2">
                        {t(item.labelKey)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* 4. Legal Column */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase
                           text-slate-400 dark:text-slate-500 mb-4">
              {t("footer.legal_title")}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm
                               text-slate-600 dark:text-slate-400
                               hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)]
                               transition-colors duration-150 group py-1"
                  >
                    <span className="group-hover:underline underline-offset-2">
                      {t(link.labelKey)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright + Language Switching */}
        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800
                        flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Copyright */}
          <p className="text-xs text-slate-400 dark:text-slate-600">
            {t("footer.copyright")}
          </p>

          {/* Language Switching */}
          <div className="flex items-center gap-1 text-xs">
            <Link
              href="/"
              locale="ko"
              className="px-3 py-1.5 rounded-full
                         text-slate-500 dark:text-slate-400
                         hover:bg-slate-100 dark:hover:bg-slate-800
                         hover:text-[var(--color-primary)]
                         transition-all duration-150 font-medium"
            >
              🇰🇷 한국어
            </Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link
              href="/"
              locale="en"
              className="px-3 py-1.5 rounded-full
                         text-slate-500 dark:text-slate-400
                         hover:bg-slate-100 dark:hover:bg-slate-800
                         hover:text-[var(--color-primary)]
                         transition-all duration-150 font-medium"
            >
              🇺🇸 English
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
