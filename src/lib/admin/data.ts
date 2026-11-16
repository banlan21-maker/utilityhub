// 관리자 화면에서 읽는 데이터 (모두 서버 키로 조회)
import 'server-only';
import { adminDb } from './db';
import type { AuditResult } from './audit';

export interface DailyRow { day: string; views: number; visitors: number }
export interface TopRow { key: string; views: number; visitors: number }
export interface FeedbackRow {
  id: number;
  message: string;
  category: string;
  created_at: string;
  hidden?: boolean;
  reply?: string | null;
  replied_at?: string | null;
}
export interface AuditRecord { id: number; created_at: string; total: number; failed: number; warned: number; results: AuditResult[] }

type Res<T> = { ok: true; data: T } | { ok: false; error: string };
const err = (e: { message?: string; code?: string } | null, fallback: string) =>
  e?.code === 'PGRST205' || e?.code === '42P01' || /does not exist|schema cache/i.test(e?.message ?? '')
    ? 'need-sql'
    : e?.message ?? fallback;

export async function visitDaily(days: number): Promise<Res<DailyRow[]>> {
  const db = adminDb();
  if (!db) return { ok: false, error: 'no-key' };
  const { data, error } = await db.rpc('admin_daily', { days });
  if (error) return { ok: false, error: err(error, '조회 실패') };
  return { ok: true, data: (data ?? []).map((r: DailyRow) => ({ day: String(r.day), views: Number(r.views), visitors: Number(r.visitors) })) };
}

export async function visitTop(days: number, dim: 'path' | 'referrer' | 'country' | 'device' | 'locale' | 'event', lim = 20): Promise<Res<TopRow[]>> {
  const db = adminDb();
  if (!db) return { ok: false, error: 'no-key' };
  const { data, error } = await db.rpc('admin_top', { days, dim, lim });
  if (error) return { ok: false, error: err(error, '조회 실패') };
  return { ok: true, data: (data ?? []).map((r: TopRow) => ({ key: r.key, views: Number(r.views), visitors: Number(r.visitors) })) };
}

export async function feedbackList(): Promise<Res<FeedbackRow[]>> {
  const db = adminDb();
  if (!db) return { ok: false, error: 'no-key' };
  const { data, error } = await db.from('feedback').select('*').order('created_at', { ascending: false }).limit(300);
  if (error) return { ok: false, error: err(error, '조회 실패') };
  return { ok: true, data: (data ?? []) as FeedbackRow[] };
}

export async function latestAudit(): Promise<Res<AuditRecord | null>> {
  const db = adminDb();
  if (!db) return { ok: false, error: 'no-key' };
  const { data, error } = await db.from('site_audits').select('*').order('created_at', { ascending: false }).limit(1);
  if (error) return { ok: false, error: err(error, '조회 실패') };
  return { ok: true, data: (data?.[0] as AuditRecord) ?? null };
}

/** 피드백 테이블에 관리용 컬럼(hidden·reply)이 있는지 */
export const feedbackMigrated = (rows: FeedbackRow[]) => rows.length === 0 || 'hidden' in rows[0];

/** site_settings 테이블이 있는지 (SQL 5번 단계) */
export async function settingsTableOk(): Promise<boolean | null> {
  const db = adminDb();
  if (!db) return null;
  const { error } = await db.from('site_settings').select('key').limit(1);
  return !error;
}
