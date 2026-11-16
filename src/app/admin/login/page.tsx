import { redirect } from 'next/navigation';
import { adminEnabled, isAdmin } from '@/lib/admin/auth';
import LoginForm from './LoginForm';
import s from '../admin.module.css';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin');
  return (
    <main className={s.loginWrap}>
      <div className={s.loginCard}>
        <h1>Utility Hub 관리자</h1>
        {adminEnabled() ? (
          <LoginForm />
        ) : (
          <p className={s.errorText}>
            관리자 비밀번호가 설정되지 않았습니다. Vercel → Settings → Environment Variables 에 <b>ADMIN_PASSWORD</b>(12자 이상)를 넣고 다시 배포해 주세요.
          </p>
        )}
      </div>
    </main>
  );
}
