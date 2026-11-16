'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminEnabled, checkPassword, endSession, requireAdmin, startSession } from '@/lib/admin/auth';
import { adminDb } from '@/lib/admin/db';
import { auditUrl, sitemapUrls, type AuditResult } from '@/lib/admin/audit';

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
