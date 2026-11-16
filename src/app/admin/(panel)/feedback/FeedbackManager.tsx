'use client';

import { useMemo, useState, useTransition } from 'react';
import { Eye, EyeOff, MessageSquareReply, Trash2 } from 'lucide-react';
import type { FeedbackRow } from '@/lib/admin/data';
import { deleteFeedback, replyFeedback, setFeedbackHidden } from '../../actions';
import s from '../../admin.module.css';

const CAT: Record<string, string> = { feature_request: '💡 기능 제안', bug_report: '🐛 버그', general: '💬 일반' };
type Filter = 'open' | 'all' | 'answered' | 'hidden';

export default function FeedbackManager({ rows, canManage }: { rows: FeedbackRow[]; canManage: boolean }) {
  const [filter, setFilter] = useState<Filter>('open');
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  const counts = useMemo(() => ({
    open: rows.filter((r) => !r.hidden && !r.reply).length,
    all: rows.length,
    answered: rows.filter((r) => !!r.reply).length,
    hidden: rows.filter((r) => r.hidden).length,
  }), [rows]);
  const list = rows.filter((r) =>
    filter === 'all' ? true : filter === 'open' ? !r.hidden && !r.reply : filter === 'answered' ? !!r.reply : !!r.hidden);

  const run = (fn: () => Promise<{ error?: string; ok?: boolean }>) => {
    setError('');
    start(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
      else setEditing(null);
    });
  };

  const labels: Record<Filter, string> = { open: '미답변', all: '전체', answered: '답변함', hidden: '숨김' };

  return (
    <section className={s.card}>
      <div className={s.tabs}>
        {(Object.keys(labels) as Filter[]).map((f) => (
          <button key={f} type="button" className={`${s.tab} ${filter === f ? s.tabOn : ''}`} onClick={() => setFilter(f)} aria-pressed={filter === f}>
            {labels[f]} {counts[f]}
          </button>
        ))}
      </div>
      {error && <p className={s.errorText} role="alert">{error}</p>}
      {list.length === 0 && <p className={s.empty}>해당하는 글이 없습니다.</p>}
      {list.map((r) => (
        <article key={r.id} className={`${s.fbItem} ${r.hidden ? s.fbHidden : ''}`}>
          <div className={s.fbMeta}>
            <span>{CAT[r.category] ?? r.category}</span>
            <span>{new Date(r.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</span>
            <span>#{r.id}</span>
            {r.hidden && <span className={`${s.pill} ${s.p_warn}`}>숨김</span>}
          </div>
          <p className={s.fbMsg}>{r.message}</p>
          {r.reply && editing !== r.id && <p className={s.fbReply}><b>운영자 답변</b> · {r.reply}</p>}
          {editing === r.id && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <textarea className={s.textarea} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="게시판에 공개되는 답변입니다. 비우고 저장하면 답변이 지워집니다." maxLength={2000} aria-label="답변" />
              <div className={s.fbActions}>
                <button type="button" className={`${s.btn} ${s.btnPrimary} ${s.btnSm}`} disabled={pending} onClick={() => run(() => replyFeedback(r.id, draft))}>답변 저장</button>
                <button type="button" className={`${s.btn} ${s.btnSm}`} onClick={() => setEditing(null)}>취소</button>
              </div>
            </div>
          )}
          {canManage && editing !== r.id && (
            <div className={s.fbActions}>
              <button type="button" className={`${s.btn} ${s.btnSm}`} disabled={pending} onClick={() => { setEditing(r.id); setDraft(r.reply ?? ''); }}>
                <MessageSquareReply size={13} /> {r.reply ? '답변 수정' : '답변'}
              </button>
              <button type="button" className={`${s.btn} ${s.btnSm}`} disabled={pending} onClick={() => run(() => setFeedbackHidden(r.id, !r.hidden))}>
                {r.hidden ? <><Eye size={13} /> 다시 보이기</> : <><EyeOff size={13} /> 숨기기</>}
              </button>
              <button
                type="button"
                className={`${s.btn} ${s.btnSm} ${s.btnDanger}`}
                disabled={pending}
                onClick={() => { if (window.confirm(`#${r.id} 글을 완전히 삭제할까요? 되돌릴 수 없습니다.`)) run(() => deleteFeedback(r.id)); }}
              >
                <Trash2 size={13} /> 삭제
              </button>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
