import Link from 'next/link';
import { setupStatus } from '@/lib/admin/db';
import { visitDaily, visitTop } from '@/lib/admin/data';
import { gscReport } from '@/lib/admin/gsc';
import { getAllAlerts } from './alerts';
import { AlertList, Delta, PageHead, Pill, SetupGuide, fmt, pct } from './ui';
import BarChart from './BarChart';
import { kstToday, nowMs, pageName } from './pageName';
import s from '../admin.module.css';

export default async function Overview() {
  const st = setupStatus();
  const [{ alerts, feedback, audit, needSql }, daily, top, gsc] = await Promise.all([
    getAllAlerts(),
    visitDaily(14),
    visitTop(7, 'path', 6),
    gscReport(),
  ]);

  const kst = kstToday();
  const now = nowMs();
  const days = daily.ok ? daily.data : [];
  const today = days.find((d) => d.day === kst);
  const last7 = days.filter((d) => d.day > shift(kst, -7));
  const prev7 = days.filter((d) => d.day <= shift(kst, -7) && d.day > shift(kst, -14));
  const sum = (rows: typeof days, k: 'views' | 'visitors') => rows.reduce((a, r) => a + r[k], 0);
  const fbRows = feedback.ok ? feedback.data : [];
  const fbWeek = fbRows.filter((f) => now - new Date(f.created_at).getTime() < 7 * 86400_000).length;
  const fbOpen = fbRows.filter((f) => !f.hidden && !f.reply).length;
  const need: ('key' | 'sql' | 'gsc')[] = [];
  // 키가 없으면 테이블 상태를 알 수 없으므로 SQL 단계도 함께 안내
  if (!st.serviceKey) need.push('key', 'sql');
  if (st.serviceKey && needSql) need.push('sql');
  if (!st.gsc) need.push('gsc');

  return (
    <>
      <PageHead title="개요" sub={`오늘 ${kst} (한국 시간)`} />

      <div className={`${s.grid} ${s.cols4}`} style={{ marginBottom: '1rem' }}>
        <div className={`${s.card} ${s.stat}`}>
          <span className={s.statLabel}>오늘 방문자</span>
          <span className={s.statValue}>{daily.ok ? fmt(today?.visitors ?? 0) : '–'}</span>
          <span className={s.statSub}>페이지 조회 {daily.ok ? fmt(today?.views ?? 0) : '–'}</span>
        </div>
        <div className={`${s.card} ${s.stat}`}>
          <span className={s.statLabel}>최근 7일 방문자</span>
          <span className={s.statValue}>{daily.ok ? fmt(sum(last7, 'visitors')) : '–'}</span>
          <span className={s.statSub}>{daily.ok && <Delta cur={sum(last7, 'visitors')} prev={sum(prev7, 'visitors')} />} 지난 7일 대비</span>
        </div>
        <div className={`${s.card} ${s.stat}`}>
          <span className={s.statLabel}>구글 검색 클릭 (28일)</span>
          <span className={s.statValue}>{gsc.ok ? fmt(gsc.data.totals.clicks) : '–'}</span>
          <span className={s.statSub}>
            {gsc.ok ? <>노출 {fmt(gsc.data.totals.impressions)} · CTR {pct(gsc.data.totals.ctr)} <Delta cur={gsc.data.totals.clicks} prev={gsc.data.prev.clicks} /></> : gsc.error === 'not-configured' ? 'Search Console 미연결' : '조회 오류'}
          </span>
        </div>
        <div className={`${s.card} ${s.stat}`}>
          <span className={s.statLabel}>새 피드백 (7일)</span>
          <span className={s.statValue}>{feedback.ok ? fmt(fbWeek) : '–'}</span>
          <span className={s.statSub}>미답변 {feedback.ok ? fmt(fbOpen) : '–'}개</span>
        </div>
      </div>

      {need.length > 0 && <div style={{ marginBottom: '1rem' }}><SetupGuide need={need} /></div>}

      <div className={`${s.grid} ${s.cols2}`}>
        <section className={s.card}>
          <div className={s.cardHead}>
            <h2 className={s.cardTitle}>갱신 알림</h2>
            <Link href="/admin/updates" className={s.more}>전체 보기 →</Link>
          </div>
          <AlertList alerts={alerts.slice(0, 6)} />
        </section>

        <div className={s.stack}>
          <section className={s.card}>
            <div className={s.cardHead}>
              <h2 className={s.cardTitle}>최근 14일 방문자</h2>
              <Link href="/admin/stats" className={s.more}>방문 통계 →</Link>
            </div>
            {daily.ok ? (
              <BarChart title="일별 방문자" data={fill(days, kst).map((d) => ({ label: d.day.slice(5), value: d.visitors, note: `조회 ${fmt(d.views)}` }))} unit="명" height={140} />
            ) : <p className={s.empty}>방문 기록을 읽을 수 없습니다 — 설정 안내를 확인하세요.</p>}
          </section>

          <section className={s.card}>
            <div className={s.cardHead}><h2 className={s.cardTitle}>이번 주 많이 본 페이지</h2></div>
            {top.ok && top.data.length ? (
              <table className={s.table}>
                <tbody>
                  {top.data.map((r) => (
                    <tr key={r.key}><td>{pageName(r.key)}</td><td className={s.num}>{fmt(r.views)}</td></tr>
                  ))}
                </tbody>
              </table>
            ) : <p className={s.empty}>아직 기록이 없습니다.</p>}
          </section>

          <section className={s.card}>
            <div className={s.cardHead}>
              <h2 className={s.cardTitle}>마지막 사이트 점검</h2>
              <Link href="/admin/audit" className={s.more}>점검하기 →</Link>
            </div>
            {audit.ok && audit.data ? (
              <p style={{ fontSize: '0.88rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {new Date(audit.data.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} · {audit.data.total}페이지
                <Pill level={audit.data.failed ? 'danger' : 'ok'}>문제 {audit.data.failed}</Pill>
                <Pill level={audit.data.warned ? 'warn' : 'ok'}>주의 {audit.data.warned}</Pill>
              </p>
            ) : <p className={s.empty}>점검 기록이 없습니다.</p>}
          </section>
        </div>
      </div>
    </>
  );
}

function shift(day: string, n: number) {
  return new Date(new Date(`${day}T00:00:00Z`).getTime() + n * 86400_000).toISOString().slice(0, 10);
}

/** 기록이 없는 날도 0으로 채운다 */
function fill(rows: { day: string; views: number; visitors: number }[], today: string) {
  const map = new Map(rows.map((r) => [r.day, r]));
  return Array.from({ length: 14 }, (_, i) => {
    const d = shift(today, i - 13);
    return map.get(d) ?? { day: d, views: 0, visitors: 0 };
  });
}
