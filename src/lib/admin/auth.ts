// 관리자 로그인 — 비밀번호 하나(ADMIN_PASSWORD)로 서명한 HttpOnly 쿠키.
// 비밀번호를 바꾸면 기존 로그인은 모두 풀린다.
import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_COOKIE = 'uh_admin';
const SESSION_DAYS = 7;
/** 너무 짧은 비밀번호로는 관리자 공간을 켜지 않는다 */
export const MIN_PASSWORD = 12;

export const adminPassword = () => process.env.ADMIN_PASSWORD ?? '';
export const adminEnabled = () => adminPassword().length >= MIN_PASSWORD;

const sign = (exp: number) => createHmac('sha256', `uh-admin:${adminPassword()}`).update(String(exp)).digest('hex');

const sameText = (a: string, b: string) => {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
};

export function checkPassword(input: string): boolean {
  return adminEnabled() && sameText(input, adminPassword());
}

export async function startSession() {
  const exp = Date.now() + SESSION_DAYS * 86400_000;
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  if (!adminEnabled()) return false;
  const raw = (await cookies()).get(ADMIN_COOKIE)?.value ?? '';
  const [expStr, sig] = raw.split('.');
  const exp = Number(expStr);
  if (!exp || !sig || exp < Date.now()) return false;
  return sameText(sig, sign(exp));
}

/** 관리자 화면·서버 액션 맨 앞에서 호출 */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login');
}
