import type { ReactNode } from 'react';

// 상태 배지를 한 곳에서 그린다.
//
// 색 판정 함수가 10곳에 복제돼 있었고, 그중 여럿이 CSS 에 정의되지 않은 클래스(wait)를 써서
// 배지 없이 맨 글자로 보였다. 한 곳을 고쳐도 나머지는 그대로 남는다.

export type StatusTone = 'run' | 'ing' | 'temp' | 'warning' | 'negative';

interface Props {
  /** 화면에 보일 글자. 없으면 배지를 그리지 않는다. */
  label?: ReactNode;
  tone: StatusTone;
  /** 마우스를 올렸을 때 보일 설명 — 원본 값이나 사유. */
  title?: string;
}

export const StatusBadge = ({ label, tone, title }: Props) => {
  if (label === undefined || label === null || label === '') return <>-</>;
  return (
    <span className={`table-td-state table-td-state-${tone}`} title={title}>
      {label}
    </span>
  );
};
