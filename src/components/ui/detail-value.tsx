import type { ReactNode } from 'react';
import { Skeleton } from '@innogrid/ui';

interface DetailValueProps {
  isLoading?: boolean;
  /** 스켈레톤 너비(px) */
  width?: number;
  children?: ReactNode;
}

/**
 * 상세 페이지 값 영역. 로딩 중에는 라벨은 그대로 두고 값만 스켈레톤으로 표시합니다.
 * page-detail_item-data 줄 높이: 12px * 1.5 = 18px
 */
export function DetailValue({ isLoading = false, width = 120, children }: DetailValueProps) {
  if (isLoading) {
    return <Skeleton variant="slide" style={{ width, height: 18, borderRadius: 4 }} />;
  }
  return <>{children}</>;
}
