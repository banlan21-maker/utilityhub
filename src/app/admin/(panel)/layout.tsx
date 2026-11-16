import { requireAdmin } from '@/lib/admin/auth';
import { getAllAlerts } from './alerts';
import AdminNav from './AdminNav';
import { logout } from '../actions';
import s from '../admin.module.css';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const { alerts } = await getAllAlerts();
  const urgent = alerts.filter((a) => a.level === 'danger' || a.level === 'warn').length;

  return (
    <div className={s.shell}>
      <aside className={s.side}>
        <div className={s.brand}>
          Utility Hub
          <small>관리자</small>
        </div>
        <AdminNav urgent={urgent} />
        <div className={s.sideFoot}>
          <a href="https://www.theutilhub.com/ko" target="_blank" rel="noreferrer">사이트 열기 ↗</a>
          <form action={logout}>
            <button type="submit">로그아웃</button>
          </form>
        </div>
      </aside>
      <main className={s.main}>{children}</main>
    </div>
  );
}
