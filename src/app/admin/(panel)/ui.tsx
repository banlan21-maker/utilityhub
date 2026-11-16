// 관리자 화면 공용 조각 (서버 컴포넌트)
import Link from 'next/link';
import { AlertOctagon, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { AdminAlert, AlertLevel } from '@/lib/admin/maintenance';
import { setupStatus } from '@/lib/admin/db';
import s from '../admin.module.css';

export const LEVEL_LABEL: Record<AlertLevel, string> = { danger: '긴급', warn: '확인 필요', info: '참고', ok: '정상' };
const ICON = { danger: AlertOctagon, warn: AlertTriangle, info: Info, ok: CheckCircle2 };

export function PageHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className={s.pageHead}>
      <h1 className={s.pageTitle}>{title}</h1>
      {sub && <p className={s.pageSub}>{sub}</p>}
    </header>
  );
}

export function Pill({ level, children }: { level: AlertLevel; children?: React.ReactNode }) {
  const Icon = ICON[level];
  return (
    <span className={`${s.pill} ${s[`p_${level}`]}`}>
      <Icon size={12} aria-hidden="true" />
      {children ?? LEVEL_LABEL[level]}
    </span>
  );
}

export function AlertList({ alerts, empty = '지금 처리할 알림이 없습니다.' }: { alerts: AdminAlert[]; empty?: string }) {
  if (!alerts.length) return <p className={s.empty}>{empty}</p>;
  return (
    <ul className={s.alerts}>
      {alerts.map((a) => {
        const Icon = ICON[a.level];
        return (
          <li key={a.id} className={`${s.alert} ${s[`l_${a.level}`]}`}>
            <Icon size={18} aria-label={LEVEL_LABEL[a.level]} />
            <span className={s.alertTitle}>{a.title}</span>
            <span className={s.alertDetail}>{a.detail}</span>
            {(a.where || a.source || a.href) && (
              <span className={s.alertMeta}>
                {a.where && <span>📁 {a.where}</span>}
                {a.source && <a href={a.source} target="_blank" rel="noreferrer">출처 확인 ↗</a>}
                {a.href && <Link href={a.href}>바로 가기 →</Link>}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export const fmt = (n: number) => n.toLocaleString('ko-KR');
export const pct = (n: number, d = 1) => `${(n * 100).toFixed(d)}%`;

/** 증감 표시 (이전 값이 0이면 생략) */
export function Delta({ cur, prev, invert = false }: { cur: number; prev: number; invert?: boolean }) {
  if (!prev) return null;
  const r = (cur - prev) / prev;
  const good = invert ? r < 0 : r > 0;
  if (Math.abs(r) < 0.005) return <span className={s.statSub}>변화 없음</span>;
  return <span className={good ? s.up : s.down}>{r > 0 ? '▲' : '▼'} {Math.abs(r * 100).toFixed(0)}%</span>;
}

/** 아직 설정이 안 된 항목 안내 */
export function SetupGuide({ need }: { need: ('key' | 'sql' | 'gsc')[] }) {
  const st = setupStatus();
  return (
    <section className={`${s.card} ${s.setup}`}>
      <div className={s.cardHead}><h2 className={s.cardTitle}>설정이 필요해요</h2></div>
      <div className={s.check}>
        <span><Pill level={st.password ? 'ok' : 'danger'}>{st.password ? '완료' : '필요'}</Pill> 관리자 비밀번호 (ADMIN_PASSWORD)</span>
        <span><Pill level={st.serviceKey ? 'ok' : 'danger'}>{st.serviceKey ? '완료' : '필요'}</Pill> Supabase 서버 키 (SUPABASE_SERVICE_ROLE_KEY)</span>
        <span><Pill level={need.includes('sql') ? 'danger' : st.serviceKey ? 'ok' : 'info'}>{need.includes('sql') ? '필요' : st.serviceKey ? '완료' : '키 설정 후 확인'}</Pill> Supabase 테이블 만들기 (supabase/admin-setup.sql)</span>
        <span><Pill level={st.gsc ? 'ok' : 'info'}>{st.gsc ? '완료' : '선택'}</Pill> Search Console 연결 (GSC_SERVICE_ACCOUNT)</span>
      </div>
      <ol>
        {need.includes('key') && (
          <li>Supabase → Project Settings → API Keys에서 <b>service_role</b>(또는 Secret) 키를 복사해 Vercel → Settings → Environment Variables에 <code>SUPABASE_SERVICE_ROLE_KEY</code>로 넣고 재배포합니다. 이 키는 채팅이나 코드에 붙여 넣지 마세요.</li>
        )}
        {need.includes('sql') && (
          <li>Supabase → SQL Editor → New query에 저장소의 <code>supabase/admin-setup.sql</code> 내용을 통째로 붙여 넣고 Run을 누릅니다. 여러 번 실행해도 안전합니다.</li>
        )}
        {need.includes('gsc') && (
          <li>검색 성과 탭의 안내대로 Google Cloud 서비스 계정을 만들고, 그 이메일을 Search Console 속성의 사용자(제한된 권한)로 추가한 뒤 JSON 키를 <code>GSC_SERVICE_ACCOUNT</code>에 넣습니다.</li>
        )}
      </ol>
    </section>
  );
}
