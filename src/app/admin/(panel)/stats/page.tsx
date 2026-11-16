import Link from 'next/link';
import { visitDaily, visitTop, type TopRow } from '@/lib/admin/data';
import { setupStatus } from '@/lib/admin/db';
import { PageHead, SetupGuide, fmt } from '../ui';
import BarChart from '../BarChart';
import { pageName } from '../pageName';
import s from '../../admin.module.css';

const RANGES = [7, 30, 90] as const;
const COUNTRY: Record<string, string> = { KR: '한국', US: '미국', JP: '일본', CN: '중국', VN: '베트남', IN: '인도', GB: '영국', CA: '캐나다', DE: '독일', AU: '호주', PH: '필리핀', SG: '싱가포르', TW: '대만', '?': '알 수 없음' };

export default async function Stats({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const d = Number((await searchParams).d);
  const days = (RANGES as readonly number[]).includes(d) ? d : 30;
  const [daily, pages, refs, countries, devices, locales, events] = await Promise.all([
    visitDaily(days),
    visitTop(days, 'path', 30),
    visitTop(days, 'referrer', 15),
    visitTop(days, 'country', 12),
    visitTop(days, 'device', 5),
    visitTop(days, 'locale', 5),
    visitTop(days, 'event', 20),
  ]);

  if (!daily.ok) {
    return (
      <>
        <PageHead title="방문 통계" />
        <SetupGuide need={[...(!setupStatus().serviceKey ? ['key' as const] : []), 'sql']} />
      </>
    );
  }

  const rows = daily.data;
  const views = rows.reduce((a, r) => a + r.views, 0);
  const visitors = rows.reduce((a, r) => a + r.visitors, 0);
  const deviceTotal = devices.ok ? devices.data.reduce((a, r) => a + r.views, 0) : 0;
  const mobile = devices.ok ? devices.data.find((r) => r.key === 'mobile')?.views ?? 0 : 0;
  const en = locales.ok ? locales.data.find((r) => r.key === 'en')?.views ?? 0 : 0;
  const localeTotal = locales.ok ? locales.data.reduce((a, r) => a + r.views, 0) : 0;

  return (
    <>
      <PageHead title="방문 통계" sub="사이트 자체 기록 — 봇 제외, IP·쿠키 저장 없음. 방문자 수는 날마다 따로 세어 더한 값입니다." />
      <div className={s.tabs}>
        {RANGES.map((r) => (
          <Link key={r} href={`/admin/stats?d=${r}`} className={`${s.tab} ${r === days ? s.tabOn : ''}`}>최근 {r}일</Link>
        ))}
      </div>

      <div className={`${s.grid} ${s.cols4}`} style={{ marginBottom: '1rem' }}>
        <Tile label="페이지 조회" value={fmt(views)} sub={`하루 평균 ${fmt(Math.round(views / days))}`} />
        <Tile label="방문자(일별 합)" value={fmt(visitors)} sub={`방문당 ${visitors ? (views / visitors).toFixed(1) : '–'}페이지`} />
        <Tile label="모바일 비율" value={deviceTotal ? `${Math.round((mobile / deviceTotal) * 100)}%` : '–'} sub={`데스크톱 ${deviceTotal ? Math.round(((deviceTotal - mobile) / deviceTotal) * 100) : '–'}%`} />
        <Tile label="영문 페이지 비율" value={localeTotal ? `${Math.round((en / localeTotal) * 100)}%` : '–'} sub={`한국어 ${localeTotal ? fmt(localeTotal - en) : '–'} · 영어 ${fmt(en)}`} />
      </div>

      <section className={s.card} style={{ marginBottom: '1rem' }}>
        <div className={s.cardHead}><h2 className={s.cardTitle}>일별 방문자</h2><span className={s.cardNote}>막대에 마우스를 올리면 조회 수</span></div>
        {rows.length ? (
          <BarChart title="일별 방문자" data={rows.map((r) => ({ label: r.day.slice(5), value: r.visitors, note: `조회 ${fmt(r.views)}` }))} unit="명" />
        ) : <p className={s.empty}>이 기간에는 기록이 없습니다. 방문 기록은 설정을 마친 뒤부터 쌓입니다.</p>}
      </section>

      <div className={`${s.grid} ${s.cols2}`}>
        <TopTable title="많이 본 페이지" res={pages} label={pageName} />
        <div className={s.stack}>
          <TopTable title="유입 경로 (외부 사이트)" res={refs} label={(k) => (k === '(direct)' ? '직접 방문·앱·북마크' : k)} />
          <TopTable title="국가" res={countries} label={(k) => `${COUNTRY[k] ?? k} (${k})`} />
          <TopTable title="버튼 이벤트" res={events} label={(k) => k} empty="아직 이벤트가 없습니다 (사진 올리기·이미지 저장 등)." />
        </div>
      </div>
    </>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className={`${s.card} ${s.stat}`}>
      <span className={s.statLabel}>{label}</span>
      <span className={s.statValue}>{value}</span>
      <span className={s.statSub}>{sub}</span>
    </div>
  );
}

function TopTable({ title, res, label, empty = '기록이 없습니다.' }: {
  title: string;
  res: { ok: true; data: TopRow[] } | { ok: false; error: string };
  label: (k: string) => string;
  empty?: string;
}) {
  const rows = res.ok ? res.data : [];
  const max = Math.max(1, ...rows.map((r) => r.views));
  return (
    <section className={s.card}>
      <div className={s.cardHead}><h2 className={s.cardTitle}>{title}</h2></div>
      {rows.length ? (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>항목</th><th className={s.num}>조회</th><th className={s.num}>방문자</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td className={s.barCell}>
                    <span className={s.barFill} style={{ width: `${(r.views / max) * 100}%` }} />
                    <span className={s.barText} title={r.key}>{label(r.key)}</span>
                  </td>
                  <td className={s.num}>{fmt(r.views)}</td>
                  <td className={s.num}>{fmt(r.visitors)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className={s.empty}>{empty}</p>}
    </section>
  );
}
