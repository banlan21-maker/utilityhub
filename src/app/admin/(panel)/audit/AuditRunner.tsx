'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import type { AuditResult } from '@/lib/admin/audit';
import type { AuditRecord } from '@/lib/admin/data';
import { auditBatch, auditList, auditSave } from '../../actions';
import s from '../../admin.module.css';

const BATCH = 8;

export default function AuditRunner({ last, canSave }: { last: AuditRecord | null; canSave: boolean }) {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState<AuditResult[] | null>(null);
  const [error, setError] = useState('');
  const [show, setShow] = useState<'problems' | 'all'>('problems');

  const run = async () => {
    setRunning(true);
    setError('');
    setResults([]);
    setDone(0);
    try {
      const list = await auditList();
      if (!list.urls) throw new Error(list.error ?? '사이트맵을 읽지 못했습니다.');
      setTotal(list.urls.length);
      const all: AuditResult[] = [];
      for (let i = 0; i < list.urls.length; i += BATCH) {
        const part = await auditBatch(list.urls.slice(i, i + BATCH));
        all.push(...part);
        setResults([...all]);
        setDone(Math.min(i + BATCH, list.urls.length));
      }
      if (canSave) {
        const saved = await auditSave(all);
        if (saved && 'error' in saved && saved.error) setError(`결과 저장 실패: ${saved.error}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  const shown = results ?? last?.results ?? [];
  const fails = shown.filter((r) => r.level === 'fail').length;
  const warns = shown.filter((r) => r.level === 'warn').length;
  const list = show === 'all' ? shown : shown.filter((r) => r.level !== 'ok');

  return (
    <>
      <section className={s.card} style={{ marginBottom: '1rem' }}>
        <div className={s.cardHead}>
          <h2 className={s.cardTitle}>{results ? '이번 점검' : last ? `마지막 점검 · ${new Date(last.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}` : '아직 점검 기록이 없습니다'}</h2>
          <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={run} disabled={running}>
            <Play size={14} /> {running ? '점검 중…' : '지금 점검'}
          </button>
        </div>
        {running && (
          <>
            <div className={s.progress} role="progressbar" aria-valuenow={done} aria-valuemax={total}><div style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
            <p className={s.cardNote}>{done} / {total} 페이지 — 약 1~2분 걸립니다. 이 화면을 닫지 마세요.</p>
          </>
        )}
        {error && <p className={s.errorText} role="alert">{error}</p>}
        {(results || last) && !running && (
          <p style={{ fontSize: '0.9rem' }}>
            {results ? `${results.length}페이지` : `${last!.total}페이지`} 중 <b style={{ color: 'var(--a-danger)' }}>문제 {results ? fails : last!.failed}</b> · <b style={{ color: 'var(--a-warn)' }}>주의 {results ? warns : last!.warned}</b>
            {!results && <span className={s.cardNote}> (지난 기록에는 문제·주의 페이지만 저장됩니다)</span>}
          </p>
        )}
      </section>

      {shown.length > 0 && (
        <section className={s.card}>
          <div className={s.tabs}>
            <button type="button" className={`${s.tab} ${show === 'problems' ? s.tabOn : ''}`} onClick={() => setShow('problems')}>문제·주의만</button>
            {results && <button type="button" className={`${s.tab} ${show === 'all' ? s.tabOn : ''}`} onClick={() => setShow('all')}>전체</button>}
          </div>
          {list.length === 0 ? <p className={s.empty}>문제가 없습니다 🎉</p> : (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>상태</th><th>페이지</th><th>내용</th><th className={s.num}>본문</th><th className={s.num}>JSON-LD</th></tr></thead>
                <tbody>
                  {list.map((r) => (
                    <tr key={r.url}>
                      <td><span className={`${s.pill} ${r.level === 'fail' ? s.p_danger : r.level === 'warn' ? s.p_warn : s.p_ok}`}>{r.level === 'fail' ? '문제' : r.level === 'warn' ? '주의' : '정상'}</span></td>
                      <td className={s.mono}><a href={r.url} target="_blank" rel="noreferrer">{r.url.replace('https://www.theutilhub.com', '')}</a></td>
                      <td style={{ fontSize: '0.8rem' }}>{r.issues.join(' · ') || '—'}</td>
                      <td className={s.num}>{r.words}</td>
                      <td className={s.num}>{r.ld}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}
