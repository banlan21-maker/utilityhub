// 도구 공통 부품: 카드·버튼·입력칸·탭·배지·안내 상자·결과 강조.
// 훅이 없어 서버·클라이언트 컴포넌트 어디서나 쓸 수 있다 (onClick 등 이벤트는 클라이언트에서만).
//
//   import { Card, Button, Field, Input, Segmented, Badge, Notice, Result } from '@/app/components/ui';
//   <Card title="입력" icon={<Calculator />}> ... </Card>
//   <Field label="공급가액" unit="원"><Input inputMode="numeric" value={v} onChange={...} /></Field>
//   <Segmented value={mode} onChange={setMode} options={[{ value: 'a', label: 'A' }, ...]} />
//   <Button variant="primary" block>계산하기</Button>
//
// 부품을 쓰기 어려운 곳은 클래스만 가져다 쓴다: import ui from '@/app/components/ui/ui.module.css'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, HTMLAttributes } from 'react';
import s from './ui.module.css';

export { s as ui };

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export type Tone = 'violet' | 'blue' | 'green' | 'amber' | 'red' | 'gray';

/* ── Card ── */
interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  icon?: ReactNode;
  as?: 'section' | 'div';
}
export function Card({ title, icon, as = 'section', className, children, ...rest }: CardProps) {
  const Tag = as;
  return (
    <Tag className={cx(s.card, className)} {...rest}>
      {title && <h2 className={s.cardTitle}>{icon}{title}</h2>}
      {children}
    </Tag>
  );
}

/* ── Button ── */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
}
export function Button({ variant = 'secondary', size = 'md', block, className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cx(s.button, s[variant], size !== 'md' && s[size], block && s.block, className)} {...rest} />;
}

/* ── Field (라벨 + 입력칸 + 단위 + 도움말) ── */
interface FieldProps {
  label?: ReactNode;
  htmlFor?: string;
  unit?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}
export function Field({ label, htmlFor, unit, hint, error, className, children }: FieldProps) {
  return (
    <div className={cx(s.field, className)}>
      {label && <label className={s.label} htmlFor={htmlFor}>{label}</label>}
      {unit ? <div className={s.inputGroup}>{children}<span className={s.unit}>{unit}</span></div> : children}
      {error ? <p className={s.error} role="alert">{error}</p> : hint && <p className={s.hint}>{hint}</p>}
    </div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(s.input, className)} {...rest} />;
}
export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(s.input, className)} {...rest} />;
}
export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(s.input, className)} {...rest} />;
}

/* ── Segmented (탭·한 줄 선택) ── */
interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
  ariaLabel?: string;
}
export function Segmented<T extends string>({ value, onChange, options, className, ariaLabel }: SegmentedProps<T>) {
  return (
    <div className={cx(s.segmented, className)} role="tablist" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          className={cx(s.segment, o.value === value && s.segmentActive)}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ── Badge / Notice ── */
export function Badge({ tone = 'violet', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cx(s.badge, s[tone], className)} {...rest} />;
}
export function Notice({ tone = 'blue', icon, className, children, ...rest }: HTMLAttributes<HTMLDivElement> & { tone?: Tone; icon?: ReactNode }) {
  return (
    <div className={cx(s.notice, s[tone], className)} {...rest}>
      {icon}
      <div>{children}</div>
    </div>
  );
}

/* ── Result (큰 숫자 결과) ── */
export function Result({ label, value, children, className }: { label?: ReactNode; value: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cx(s.result, className)} aria-live="polite">
      {label && <div className={s.resultLabel}>{label}</div>}
      <div className={s.resultValue}>{value}</div>
      {children}
    </div>
  );
}
