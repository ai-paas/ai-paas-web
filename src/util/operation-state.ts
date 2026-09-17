import type { OperationState } from '@/types/cluster';

// 작업 상태 색. 다섯 곳에 복제돼 있었고, 그중 일부는 CSS 에 없는 클래스를 쓰고 있었다.

export const operationStateColor = (
  state?: OperationState
): 'run' | 'negative' | 'ing' | 'temp' => {
  if (state === 'SUCCEEDED') return 'run';
  if (state === 'FAILED' || state === 'CANCELLED') return 'negative';
  if (state === 'RUNNING') return 'ing';
  return 'temp';
};
