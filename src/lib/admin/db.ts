// 서버 전용 Supabase 클라이언트 (service_role 키 — 브라우저로 절대 보내지 않는다)
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function adminDb(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

/** 설정 점검표 (값은 절대 내보내지 않고 있는지만) */
export function setupStatus() {
  return {
    password: (process.env.ADMIN_PASSWORD ?? '').length >= 12,
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    gsc: !!process.env.GSC_SERVICE_ACCOUNT,
  };
}
