'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminEnabled, checkPassword, endSession, requireAdmin, startSession } from '@/lib/admin/auth';
import { adminDb } from '@/lib/admin/db';
import { auditUrl, sitemapUrls, type AuditResult } from '@/lib/admin/audit';
import { HOME_TAG } from '@/lib/homeStats';

// ── 로그인 ──
export async function login(_prev: { error?: string } | undefined, form: FormData): Promise<{ error?: string }> {
  if (!adminEnabled()) return { error: 'ADMIN_PASSWORD 환경 변수가 없거나 12자 미만입니다. Vercel에 먼저 설정해 주세요.' };
  const pw = String(form.get('password') ?? '');
  if (!checkPassword(pw)) {
    // 무차별 대입을 늦춘다
    await new Promise((r) => setTimeout(r, 1500));
    return { error: '비밀번호가 맞지 않습니다.' };
  }
  await startSession();
  redirect('/admin');
}

export async function logout() {
  await endSession();
  redirect('/admin/login');
}

// ── 피드백 ──
const fbDb = async () => {
  await requireAdmin();
  const db = adminDb();
  if (!db) throw new Error('SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다.');
  return db;
};

export async function setFeedbackHidden(id: number, hidden: boolean) {
  const db = await fbDb();
  const { error } = await db.from('feedback').update({ hidden }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/feedback');
  return { ok: true };
}

export async function deleteFeedback(id: number) {
  const db = await fbDb();
  const { error } = await db.from('feedback').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/feedback');
  return { ok: true };
}

export async function replyFeedback(id: number, reply: string) {
  const db = await fbDb();
  const text = reply.trim().slice(0, 2000);
  const { error } = await db.from('feedback').update({ reply: text || null, replied_at: text ? new Date().toISOString() : null }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/feedback');
  return { ok: true };
}

// ── 사이트 점검 (브라우저가 묶음으로 나눠 호출 → 함수 시간 제한 회피) ──
export async function auditList(): Promise<{ urls?: string[]; error?: string }> {
  await requireAdmin();
  try {
    return { urls: await sitemapUrls() };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

export async function auditBatch(urls: string[]): Promise<AuditResult[]> {
  await requireAdmin();
  const safe = urls.filter((u) => u.startsWith('https://www.theutilhub.com/')).slice(0, 12);
  return Promise.all(safe.map(auditUrl));
}

export async function auditSave(results: AuditResult[]) {
  await requireAdmin();
  const db = adminDb();
  if (!db) return { error: 'no-key' };
  const failed = results.filter((r) => r.level === 'fail').length;
  const warned = results.filter((r) => r.level === 'warn').length;
  // 용량을 아끼려고 문제 있는 페이지만 저장
  const { error } = await db.from('site_audits').insert({
    total: results.length,
    failed,
    warned,
    results: results.filter((r) => r.level !== 'ok'),
  });
  if (error) return { error: error.message };
  revalidatePath('/admin');
  return { ok: true };
}

// ── 첫 화면 숫자 표시 기준 ──
export async function saveHomeSettings(form: FormData): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  const db = adminDb();
  if (!db) return { error: 'SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다.' };
  const num = (k: string) => Math.max(0, Math.round(Number(form.get(k))));
  const todayMin = num('todayMin');
  const totalMin = num('totalMin');
  const since = String(form.get('since') ?? '');
  if (!Number.isFinite(todayMin) || !Number.isFinite(totalMin) || !/^\d{4}-\d{2}-\d{2}$/.test(since)) return { error: '값을 확인해 주세요.' };
  const { error } = await db.from('site_settings').upsert({ key: 'home', value: { todayMin, totalMin, since }, updated_at: new Date().toISOString() });
  if (error) return { error: /site_settings/.test(error.message) ? 'site_settings 테이블이 없습니다. supabase/admin-setup.sql 을 다시 실행해 주세요.' : error.message };
  // 첫 화면 숫자 캐시를 바로 비운다
  updateTag(HOME_TAG);
  revalidatePath('/ko');
  revalidatePath('/en');
  revalidatePath('/admin/home');
  return { ok: true };
}
