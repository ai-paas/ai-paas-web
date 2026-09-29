import type { ClusterNode } from '@/types/vm';

/**
 * 목록의 한 행 — 노드 하나.
 *
 * <p>노드가 아직 없는 클러스터는 서버가 {@code pending} 줄 하나로 대신 내려준다. 화면이 끼워
 * 넣으면 자르는 곳과 세는 곳이 갈려, 그 줄이 개수에는 잡히는데 다음 페이지는 비어 버린다.
 */
export type VmRow = ClusterNode;
