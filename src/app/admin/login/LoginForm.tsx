'use client';

import { useActionState } from 'react';
import { login } from '../actions';
import s from '../admin.module.css';

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <label htmlFor="pw" style={{ fontSize: '0.85rem', fontWeight: 600 }}>비밀번호</label>
      <input id="pw" name="password" type="password" autoComplete="current-password" required className={s.input} autoFocus />
      {state?.error && <p className={s.errorText} role="alert">{state.error}</p>}
      <button type="submit" className={`${s.btn} ${s.btnPrimary}`} disabled={pending} style={{ justifyContent: 'center' }}>
        {pending ? '확인 중…' : '로그인'}
      </button>
    </form>
  );
}
