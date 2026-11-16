// 모든 알림 모으기 (한 요청 안에서는 한 번만 계산)
import 'server-only';
import { cache } from 'react';
import { buildAlerts, type AdminAlert } from '@/lib/admin/maintenance';
import { feedbackList, feedbackMigrated, latestAudit, settingsTableOk } from '@/lib/admin/data';
import { setupStatus } from '@/lib/admin/db';

export const getAllAlerts = cache(async () => {
  const st = setupStatus();
  const [fb, audit, settingsOk] = await Promise.all([feedbackList(), latestAudit(), settingsTableOk()]);
  const extra: AdminAlert[] = [];
  const needSql = (!fb.ok && fb.error === 'need-sql') || (fb.ok && !feedbackMigrated(fb.data)) || (!audit.ok && audit.error === 'need-sql') || settingsOk === false;

  if (!st.serviceKey) {
    extra.push({ id: 'setup-key', level: 'warn', title: 'Supabase 서버 키 미설정', detail: '방문 통계·피드백 관리·점검 기록이 꺼져 있습니다. 개요 화면의 설정 안내를 따라 주세요.', href: '/admin' });
  } else if (needSql) {
    extra.push({ id: 'setup-sql', level: 'warn', title: 'Supabase 테이블 설정 필요', detail: 'supabase/admin-setup.sql 을 SQL Editor에서 한 번 실행해 주세요.', href: '/admin' });
  }

  if (fb.ok) {
    const month = Date.now() - 30 * 86400_000;
    const open = fb.data.filter((f) => !f.hidden && !f.reply && new Date(f.created_at).getTime() > month).length;
    if (open) extra.push({ id: 'fb-open', level: 'info', title: `답변하지 않은 피드백 ${open}개`, detail: '최근 30일 동안 들어온 글 중 숨기지도 답하지도 않은 글', href: '/admin/feedback' });
  }

  if (audit.ok) {
    if (!audit.data) {
      extra.push({ id: 'audit-none', level: 'info', title: '사이트 점검 기록 없음', detail: '사이트 점검 탭에서 한 번 실행해 두면 이후 문제를 비교할 수 있습니다.', href: '/admin/audit' });
    } else {
      const age = Math.floor((Date.now() - new Date(audit.data.created_at).getTime()) / 86400_000);
      if (audit.data.failed > 0) {
        extra.push({ id: 'audit-fail', level: 'warn', title: `사이트 점검: 문제 페이지 ${audit.data.failed}개`, detail: `${age}일 전 점검 결과 — h1·noindex·canonical·구조화 데이터 등`, href: '/admin/audit' });
      } else if (age > 14) {
        extra.push({ id: 'audit-old', level: 'info', title: `사이트 점검한 지 ${age}일`, detail: '배포가 잦았다면 한 번 다시 점검해 보세요.', href: '/admin/audit' });
      }
    }
  }

  return { ...(await buildAlerts(extra)), feedback: fb, audit, needSql };
});
