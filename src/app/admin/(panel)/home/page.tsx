import { CHANGELOG } from '@/lib/changelog';
import { changesThisMonth, getHomeVisitStats, lastUpdatedLabel, tickerItems } from '@/lib/homeStats';
import { PageHead, Pill, fmt } from '../ui';
import HomeSettingsForm from './HomeSettingsForm';
import s from '../../admin.module.css';

export default async function HomeScreen() {
  const v = await getHomeVisitStats();
  const showToday = v.today >= v.settings.todayMin;
  const showTotal = v.total >= v.settings.totalMin;
  const ticker = tickerItems('ko');

  return (
    <>
      <PageHead title="홈 화면" sub="첫 화면의 전광판·숫자·인기 도구가 지금 어떻게 보이는지, 방문자 숫자를 언제부터 보여 줄지 정합니다. 숫자는 10분마다 새로 계산됩니다." />

      <div className={`${s.grid} ${s.cols4}`} style={{ marginBottom: '1rem' }}>
        <div className={`${s.card} ${s.stat}`}>
          <span className={s.statLabel}>오늘 방문자</span>
          <span className={s.statValue}>{fmt(v.today)}</span>
          <span className={s.statSub}>{showToday ? <Pill level="ok">첫 화면에 표시 중</Pill> : `기준 ${fmt(v.settings.todayMin)}명 미만 — 숨김`}</span>
        </div>
        <div className={`${s.card} ${s.stat}`}>
          <span className={s.statLabel}>누적 방문자 ({v.settings.since}~)</span>
          <span className={s.statValue}>{fmt(v.total)}</span>
          <span className={s.statSub}>{showTotal ? <Pill level="ok">첫 화면에 표시 중</Pill> : `기준 ${fmt(v.settings.totalMin)}명 미만 — 숨김`}</span>
        </div>
        <div className={`${s.card} ${s.stat}`}>
          <span className={s.statLabel}>이번 달 개선</span>
          <span className={s.statValue}>{changesThisMonth()}건</span>
          <span className={s.statSub}>전체 기록 {CHANGELOG.length}건 (src/lib/changelog.ts)</span>
        </div>
        <div className={`${s.card} ${s.stat}`}>
          <span className={s.statLabel}>마지막 업데이트</span>
          <span className={s.statValue} style={{ fontSize: '1.3rem' }}>{lastUpdatedLabel('ko')}</span>
          <span className={s.statSub}>마지막 배포 시각 기준</span>
        </div>
      </div>

      <div className={`${s.grid} ${s.cols2}`}>
        <section className={s.card}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>방문자 숫자 표시 기준</h2></div>
          <HomeSettingsForm settings={v.settings} />
        </section>

        <div className={s.stack}>
          <section className={s.card}>
            <div className={s.cardHead}><h2 className={s.cardTitle}>이번 주 많이 찾는 도구</h2><span className={s.cardNote}>7일 방문자 순 · 3개 이상 모이면 표시</span></div>
            {v.popular.length ? (
              <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', lineHeight: 1.8 }}>
                {v.popular.map((p) => <li key={p.href}>{p.emoji} {p.ko}</li>)}
              </ol>
            ) : <p className={s.empty}>아직 기록이 모자라 첫 화면에서 숨김 상태입니다.</p>}
          </section>

          <section className={s.card}>
            <div className={s.cardHead}><h2 className={s.cardTitle}>전광판 내용 (한국어)</h2><span className={s.cardNote}>3초마다 한 줄씩</span></div>
            <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.84rem', lineHeight: 1.75 }}>
              {ticker.map((t, i) => <li key={i}>{t.icon} {t.text}</li>)}
            </ol>
          </section>
        </div>
      </div>
    </>
  );
}
