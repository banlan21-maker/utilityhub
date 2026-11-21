import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {pickMessages} from '@/i18n/client-messages';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';
import type {Viewport} from 'next';
import {Analytics} from '@vercel/analytics/next';
import {SpeedInsights} from '@vercel/speed-insights/next';
import PageViewTracker from '../components/PageViewTracker';
import '../globals.css';

export const metadata = {
  title: 'Utility Hub - All your daily tools in one place',
  description: 'A comprehensive suite of tools including performance monitoring, PDF conversion, productivity, and more.',
};

// 핀치 줌 허용 — 접근성(a11y) 및 모바일 사용성.
// maximum-scale=1 / user-scalable=0 으로 확대를 막지 않는다.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  // 브라우저에는 공통 묶음만 보낸다. 도구별 묶음은 각 도구 폴더의 layout.tsx(ScopedMessages)가 더한다.
  // 전체를 넘기면 모든 페이지 HTML 에 번역 파일이 통째로 실린다 (src/i18n/client-messages.ts)
  const messages = pickMessages(await getMessages());
 
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html: `
(function(){try{var s=localStorage.getItem('utilhub-theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();
        `}} />
      </head>
      <body>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9517850144901016"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <NextIntlClientProvider messages={messages}>
          <Header />
          <div className="layout-container">
            <main className="main-container">
              {children}
            </main>
            <Footer />
          </div>
        </NextIntlClientProvider>
        <Analytics />
        <PageViewTracker />
        <SpeedInsights />
      </body>
    </html>
  );
}
