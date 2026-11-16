'use client';

import { useState, useTransition } from 'react';
import type { HomeSettings } from '@/lib/homeStats';
import { saveHomeSettings } from '../../actions';
import s from '../../admin.module.css';

export default function HomeSettingsForm({ settings }: { settings: HomeSettings }) {
  const [msg, setMsg] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      action={(fd) => start(async () => setMsg(await saveHomeSettings(fd)))}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.86rem' }}
    >
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <b>오늘 방문자가 이 수 이상이면 &lsquo;오늘 방문&rsquo; 표시</b>
        <input name="todayMin" type="number" min={0} defaultValue={settings.todayMin} className={s.input} />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <b>누적 방문자가 이 수 이상이면 &lsquo;누적 방문&rsquo; 표시</b>
        <input name="totalMin" type="number" min={0} defaultValue={settings.totalMin} className={s.input} />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <b>집계 시작일 (첫 화면에 11/16~ 처럼 표시)</b>
        <input name="since" type="date" defaultValue={settings.since} className={s.input} />
      </label>
      <p className={s.cardNote} style={{ margin: 0 }}>
        기준에 못 미치면 그 자리에 &quot;자동 갱신 단가 4종&quot;이 보입니다. 숫자가 작을 때 보여 주면 오히려 신뢰가 떨어질 수 있어 기준을 둡니다.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button type="submit" className={`${s.btn} ${s.btnPrimary}`} disabled={pending}>{pending ? '저장 중…' : '저장'}</button>
        {msg?.ok && <span style={{ color: 'var(--a-good)', fontWeight: 700 }}>저장했습니다 — 첫 화면에 바로 반영</span>}
        {msg?.error && <span className={s.errorText}>{msg.error}</span>}
      </div>
    </form>
  );
}
