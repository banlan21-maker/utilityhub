'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Bell, Home, LayoutDashboard, MessageSquare, Search, ShieldCheck } from 'lucide-react';
import s from '../admin.module.css';

const LINKS = [
  { href: '/admin', label: '개요', icon: LayoutDashboard },
  { href: '/admin/updates', label: '갱신 알림', icon: Bell, badge: true },
  { href: '/admin/stats', label: '방문 통계', icon: BarChart3 },
  { href: '/admin/search', label: '검색 성과', icon: Search },
  { href: '/admin/feedback', label: '피드백', icon: MessageSquare },
  { href: '/admin/audit', label: '사이트 점검', icon: ShieldCheck },
  { href: '/admin/home', label: '홈 화면', icon: Home },
];

export default function AdminNav({ urgent }: { urgent: number }) {
  const path = usePathname();
  return (
    <nav style={{ display: 'contents' }} aria-label="관리자 메뉴">
      {LINKS.map(({ href, label, icon: Icon, badge }) => {
        const on = href === '/admin' ? path === '/admin' : path.startsWith(href);
        return (
          <Link key={href} href={href} className={`${s.navLink} ${on ? s.navOn : ''}`} aria-current={on ? 'page' : undefined}>
            <Icon size={16} aria-hidden="true" />
            {label}
            {badge && urgent > 0 && <span className={s.navBadge} aria-label={`급한 알림 ${urgent}개`}>{urgent}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
