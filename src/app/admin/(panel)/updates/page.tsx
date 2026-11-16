import { calendarOverview } from '@/lib/admin/maintenance';
import { getAllAlerts } from '../alerts';
import { AlertList, PageHead, Pill } from '../ui';
import s from '../../admin.module.css';

export default async function Updates() {
  const { alerts, fresh, workflows } = await getAllAlerts();
  const cal = calendarOverview();
  return (
    <>
      <PageHead title="갱신 알림" sub="데이터 기준일·연간 일정·자동 갱신 작업·피드백·점검 결과를 모아 지금 손봐야 할 것을 보여 줍니다." />

      <section className={s.card} style={{ marginBottom: '1rem' }}>
        <div className={s.cardHead}><h2 className={s.cardTitle}>지금 처리할 것</h2><span className={s.cardNote}>{alerts.length}건</span></div>
        <AlertList alerts={alerts} />
      </section>

      <div className={`${s.grid} ${s.cols2}`}>
        <section className={s.card}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>단가 데이터 신선도</h2></div>
          <table className={s.table}>
            <tbody>
              {fresh.map((f) => (
                <tr key={f.id}>
                  <td><Pill level={f.level} /></td>
                  <td><b>{f.title}</b><br /><span className={s.cardNote}>{f.detail}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className={s.stack}>
          <section className={s.card}>
            <div className={s.cardHead}><h2 className={s.cardTitle}>자동 갱신 작업 (GitHub Actions)</h2></div>
            {workflows.length ? (
              <table className={s.table}>
                <tbody>
                  {workflows.map((w) => (
                    <tr key={w.name}>
                      <td><Pill level={w.conclusion === 'success' ? 'ok' : w.conclusion === 'failure' ? 'danger' : 'info'}>{w.conclusion === 'success' ? '성공' : w.conclusion === 'failure' ? '실패' : w.status}</Pill></td>
                      <td><a href={w.url} target="_blank" rel="noreferrer">{w.name}</a></td>
                      <td className={s.num}>{new Date(w.at).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className={s.empty}>GitHub에서 작업 기록을 읽지 못했습니다.</p>}
          </section>

          <section className={s.card}>
            <div className={s.cardHead}><h2 className={s.cardTitle}>연간 갱신 일정</h2><span className={s.cardNote}>기간 안에 들어오면 위 목록에 뜹니다</span></div>
            <table className={s.table}>
              <tbody>
                {cal.map((c) => (
                  <tr key={c.id}>
                    <td style={{ whiteSpace: 'nowrap' }} className={s.cardNote}>{c.period}</td>
                    <td>
                      <b>{c.title}</b>{' '}
                      {c.state === 'active' && <Pill level="warn">진행 중</Pill>}
                      {c.state === 'done' && <Pill level="ok">반영됨</Pill>}
                      <br /><span className={s.cardNote}>{c.where}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </>
  );
}
