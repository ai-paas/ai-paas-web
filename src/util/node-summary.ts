/**
 * 클러스터 목록의 노드 수 표기.
 *
 * <p>목록은 worker 행을 따로 보여주지 않는다. 대신 규모를 한 칸으로 요약한다.
 * 등록형 클러스터는 노드 정보가 없어 0 이 아니라 '-' 다 — 0 으로 적으면 거짓말이다.
 */
export const nodeSummaryLabel = (
  masterCount?: number | null,
  workerCount?: number | null
): string => {
  const parts: string[] = [];
  if (typeof masterCount === 'number') parts.push(`master ${masterCount}`);
  if (typeof workerCount === 'number' && workerCount > 0) parts.push(`worker ${workerCount}`);
  return parts.length > 0 ? parts.join(' + ') : '-';
};
