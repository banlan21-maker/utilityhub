import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import NavigationActions from '@/app/components/NavigationActions';
import { SUPPORT, hasSupportLinks } from '@/config/monetization';
import s from './support.module.css';

const BASE = 'https://www.theutilhub.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const title = isKo ? '후원하기 | Utility Hub' : 'Support Us | Utility Hub';
  const description = isKo
    ? '유틸리티 허브는 무료로 운영됩니다. 커피 한 잔 후원은 서버 비용과 새 도구 개발에 쓰입니다. 후원 없이도 모든 도구는 계속 무료입니다.'
    : 'Utility Hub is free to use. A coffee-sized tip helps cover server costs and new tools — and every tool stays free either way.';
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${locale}/support`,
      languages: { ko: `${BASE}/ko/support`, en: `${BASE}/en/support`, 'x-default': `${BASE}/ko/support` },
    },
    // 후원 링크가 생기기 전에는 검색에 내보내지 않는다
    robots: hasSupportLinks() ? undefined : { index: false, follow: true },
  };
}

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const kofi = SUPPORT.kofi ? { href: SUPPORT.kofi, label: isKo ? '☕ Ko-fi로 후원하기 (해외 결제)' : '☕ Buy us a coffee on Ko-fi' } : null;
  const domestic = SUPPORT.domestic.url
    ? { href: SUPPORT.domestic.url, label: isKo ? `☕ ${SUPPORT.domestic.nameKo}로 커피 한 잔 후원하기` : `Support via ${SUPPORT.domestic.nameEn} (Korea)` }
    : null;
  // 한국어: 국내 → Ko-fi, 영어: Ko-fi만 (국내 링크만 있으면 그것을)
  const buttons = (isKo ? [domestic, kofi] : [kofi ?? domestic]).filter((b): b is { href: string; label: string } => !!b);

  return (
    <div className={s.page}>
      <NavigationActions />
      <header className={s.hero}>
        <h1 className={s.title}>{isKo ? '도움이 되셨나요? ☕' : 'Found Utility Hub useful? ☕'}</h1>
        <p className={s.lead}>
          {isKo
            ? '유틸리티 허브는 가입 없이 누구나 무료로 쓰는 도구 모음입니다. 커피 한 잔 후원은 서버 비용과 새 도구 개발에 쓰입니다.'
            : 'Utility Hub is a free collection of tools anyone can use without signing up. A coffee-sized tip goes toward server costs and building new tools.'}
        </p>
      </header>

      {buttons.length > 0 && (
        <section className={s.card} aria-labelledby="support-buttons">
          <h2 id="support-buttons" className={s.cardTitle}>{isKo ? '커피 한 잔으로 응원하기' : 'Buy us a coffee'}</h2>
          <div className={s.buttons}>
            {buttons.map((b, i) => (
              <a key={b.href} href={b.href} target="_blank" rel="noopener noreferrer" className={`${s.btn} ${i === 0 ? s.btnMain : ''}`}>
                {b.label}
              </a>
            ))}
          </div>
          <p className={s.note}>
            {isKo
              ? '후원은 외부 후원 서비스에서 안전하게 처리되며, 이 사이트는 결제 정보를 받거나 저장하지 않습니다.'
              : 'Payments are handled securely by the external support service; this site never receives or stores payment information.'}
          </p>
        </section>
      )}

      <section className={s.card} aria-labelledby="support-other">
        <h2 id="support-other" className={s.cardTitle}>{isKo ? '돈이 들지 않는 응원 방법' : 'Free ways to help'}</h2>
        <ul className={s.list}>
          <li>{isKo ? '자주 쓰는 도구를 동료나 친구에게 공유해 주세요. 각 도구 아래 공유 버튼으로 카카오톡에 바로 보낼 수 있습니다.' : 'Share a tool you use with a colleague or friend — every tool has share buttons below it.'}</li>
          <li>
            {isKo ? '불편한 점이나 필요한 도구를 ' : 'Tell us what is missing or broken on the '}
            <Link href="/feedback">{isKo ? '피드백 게시판' : 'feedback board'}</Link>
            {isKo ? '에 남겨 주세요. 지금 있는 도구의 상당수가 이런 의견에서 시작됐습니다.' : ' — many of the current tools started as user suggestions.'}
          </li>
          <li>{isKo ? '즐겨찾기(Ctrl+D)에 추가해 두면 필요할 때 바로 찾을 수 있습니다.' : 'Bookmark the site (Ctrl+D) so it is there when you need it.'}</li>
        </ul>
      </section>

      <p className={s.footer}>
        {isKo
          ? '후원 여부와 상관없이 모든 도구는 계속 무료입니다. — Utility Hub 운영팀'
          : 'Every tool stays free whether or not you support us. — The Utility Hub team'}
      </p>
    </div>
  );
}
