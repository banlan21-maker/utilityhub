// 모든 도구가 같은 모양으로 쓰는 머리말: 아이콘 타일 + 제목(h1) + 한 줄 설명 (+ 선택: 배지 등 추가 요소)
// 훅을 쓰지 않으므로 서버·클라이언트 컴포넌트 어디서나 쓸 수 있다.
import type { ReactNode } from 'react';
import s from './ToolHeader.module.css';

interface ToolHeaderProps {
  /** lucide 아이콘 요소(<Calculator />) 또는 이모지 문자 */
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** 설명 아래에 붙는 작은 요소 (예: "브라우저에서만 처리" 배지) */
  children?: ReactNode;
  /** 페이지에 h1이 이미 따로 있을 때만 'h2' */
  as?: 'h1' | 'h2';
  /** 좁은 휴대폰(480px 이하)에서 아이콘을 숨겨 본문을 위로 (게임처럼 한 화면에 들어가야 하는 도구) */
  compact?: boolean;
}

/** 제목 앞에 붙은 이모지는 아이콘 타일과 겹치므로 화면에서는 뺀다 */
function stripLeadingEmoji(node: ReactNode): ReactNode {
  if (typeof node !== 'string') return node;
  // 숫자·#은 지우지 않는다 (\p{Emoji_Component}를 쓰면 "2026 연봉…"의 2026이 사라짐)
  return node.replace(/^(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[\u{1F3FB}-\u{1F3FF}]|️|‍|\s)+/u, '').trim() || node;
}

export default function ToolHeader({ icon, title, subtitle, children, as = 'h1', compact = false }: ToolHeaderProps) {
  const Heading = as;
  return (
    <header className={`${s.header} ${compact ? s.compact : ''}`}>
      {icon !== undefined && icon !== null && (
        <div className={s.icon} aria-hidden="true">
          {typeof icon === 'string' ? <span className={s.emoji}>{icon}</span> : icon}
        </div>
      )}
      <Heading className={s.title}>{stripLeadingEmoji(title)}</Heading>
      {subtitle && <p className={s.subtitle}>{subtitle}</p>}
      {children && <div className={s.extra}>{children}</div>}
    </header>
  );
}
