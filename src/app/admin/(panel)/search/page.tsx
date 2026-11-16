import { gscReport, type GscRow } from '@/lib/admin/gsc';
import { Delta, PageHead, fmt, pct } from '../ui';
import BarChart from '../BarChart';
import { pageName } from '../pageName';
import s from '../../admin.module.css';

export default async function SearchPerf() {
  const res = await gscReport();

  if (!res.ok) {
    return (
      <>
        <PageHead title="검색 성과" sub="Google Search Console 데이터 (28일)" />
        {res.error !== 'not-configured' && <p className={s.errorText} style={{ marginBottom: '1rem' }}>연결 오류: {res.error}</p>}
        <section className={`${s.card} ${s.setup}`}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>Search Console 연결 방법 (한 번만)</h2></div>
          <ol>
            <li><a href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noreferrer">Google Cloud 콘솔</a>에서 새 프로젝트를 만듭니다(이름 예: utilhub-admin).</li>
            <li>상단 검색창에 <b>Google Search Console API</b>를 검색해 <b>사용</b>을 누릅니다.</li>
            <li>IAM 및 관리자 → <b>서비스 계정</b> → 서비스 계정 만들기 → 이름만 넣고 완료(역할은 주지 않아도 됩니다).</li>
            <li>만든 서비스 계정 → <b>키</b> 탭 → 키 추가 → 새 키 만들기 → <b>JSON</b> → 파일이 내려받아집니다.</li>
            <li>서비스 계정의 이메일(…@…iam.gserviceaccount.com)을 복사해 <a href="https://search.google.com/search-console/users" target="_blank" rel="noreferrer">Search Console → 설정 → 사용자 및 권한</a>에서 <b>사용자 추가</b>, 권한은 <b>제한됨</b>으로 넣습니다.</li>
            <li>Vercel → Settings → Environment Variables에 이름 <code>GSC_SERVICE_ACCOUNT</code>, 값에 JSON 파일 내용 전체를 붙여 넣고 저장한 뒤 재배포합니다. 키 파일은 채팅에 붙여 넣지 말고, 넣은 뒤에는 컴퓨터에서 지워도 됩니다.</li>
          </ol>
        </section>
      </>
    );
  }

  const r = res.data;
  return (
    <>
      <PageHead
        title="검색 성과"
        sub={`${r.range.start} ~ ${r.range.end} (직전 28일 ${r.range.prevStart} ~ ${r.range.prevEnd}와 비교) · ${r.site} · 6시간마다 새로 읽음`}
      />
      <div className={`${s.grid} ${s.cols4}`} style={{ marginBottom: '1rem' }}>
        <Tile label="클릭" value={fmt(r.totals.clicks)} delta={<Delta cur={r.totals.clicks} prev={r.prev.clicks} />} prev={fmt(r.prev.clicks)} />
        <Tile label="노출" value={fmt(r.totals.impressions)} delta={<Delta cur={r.totals.impressions} prev={r.prev.impressions} />} prev={fmt(r.prev.impressions)} />
        <Tile label="CTR" value={pct(r.totals.ctr, 2)} delta={<Delta cur={r.totals.ctr} prev={r.prev.ctr} />} prev={pct(r.prev.ctr, 2)} />
        <Tile label="평균 순위" value={r.totals.position.toFixed(1)} delta={<Delta cur={r.totals.position} prev={r.prev.position} invert />} prev={r.prev.position.toFixed(1)} />
      </div>

      {/* 클릭과 노출은 크기가 달라 축 하나에 겹치지 않고 따로 그린다 */}
      <div className={`${s.grid} ${s.cols2}`} style={{ marginBottom: '1rem' }}>
        <section className={s.card}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>일별 클릭</h2></div>
          <BarChart title="일별 클릭" data={r.daily.map((d) => ({ label: d.date.slice(5), value: d.clicks }))} height={140} />
        </section>
        <section className={s.card}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>일별 노출</h2></div>
          <BarChart title="일별 노출" data={r.daily.map((d) => ({ label: d.date.slice(5), value: d.impressions }))} height={140} />
        </section>
      </div>

      <section className={s.card} style={{ marginBottom: '1rem' }}>
        <div className={s.cardHead}>
          <h2 className={s.cardTitle}>CTR 개선 후보</h2>
          <span className={s.cardNote}>노출 100회 이상 · CTR 1% 미만 — 제목·설명을 다듬으면 클릭이 늘 수 있는 페이지</span>
        </div>
        <Rows rows={r.lowCtr} kind="page" empty="해당하는 페이지가 없습니다." />
      </section>

      <div className={`${s.grid} ${s.cols2}`}>
        <section className={s.card}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>페이지별</h2></div>
          <Rows rows={r.pages.slice(0, 40)} kind="page" />
        </section>
        <section className={s.card}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>검색어별</h2></div>
          <Rows rows={r.queries} kind="query" />
        </section>
      </div>
    </>
  );
}

function Tile({ label, value, delta, prev }: { label: string; value: string; delta: React.ReactNode; prev: string }) {
  return (
    <div className={`${s.card} ${s.stat}`}>
      <span className={s.statLabel}>{label}</span>
      <span className={s.statValue}>{value}</span>
      <span className={s.statSub}>{delta} 이전 {prev}</span>
    </div>
  );
}

function Rows({ rows, kind, empty = '데이터가 없습니다.' }: { rows: GscRow[]; kind: 'page' | 'query'; empty?: string }) {
  if (!rows.length) return <p className={s.empty}>{empty}</p>;
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr><th>{kind === 'page' ? '페이지' : '검색어'}</th><th className={s.num}>클릭</th><th className={s.num}>노출</th><th className={s.num}>CTR</th><th className={s.num}>순위</th></tr>
        </thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.key}>
              <td>
                {kind === 'page'
                  ? <a href={x.key} target="_blank" rel="noreferrer" title={x.key}>{pageName(x.key)}</a>
                  : x.key}
              </td>
              <td className={s.num}>{fmt(x.clicks)}</td>
              <td className={s.num}>{fmt(x.impressions)}</td>
              <td className={s.num}>{pct(x.ctr)}</td>
              <td className={s.num}>{x.position.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
