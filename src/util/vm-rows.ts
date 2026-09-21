import type { ClusterNode, Vm } from '@/types/vm';

/** 목록의 한 행. 아직 노드가 없는 클러스터는 자리표시자로 한 줄 차지한다. */
export interface VmRow extends ClusterNode {
  /** 노드가 아직 없어 클러스터를 대신 보여주는 행 */
  pending?: boolean;
}

/** 에이전트가 노드를 보고하는 상태. 이 상태의 클러스터는 노드 목록에 줄이 있다. */
const NODE_BACKED_STATUSES = new Set(['READY', 'DEGRADED']);

/**
 * 노드가 아직 없는 클러스터. 페이지와 무관하게 클러스터 상태만으로 정한다.
 *
 * <p>"이번 페이지의 노드에 없으면 자리표시자" 로 정하면 1 페이지에 노드가 실린 클러스터가
 * 2 페이지에서 다시 자리표시자로 살아난다. 줄이 중복되고 전체 개수도 페이지마다 달라진다 —
 * 1 페이지 12, 2 페이지 17 로 보이던 것이 이것이다.
 */
export const pendingVms = (vms: Vm[]): Vm[] =>
  vms.filter(
    (v) => v.clusterName && !NODE_BACKED_STATUSES.has(String(v.status ?? '').toUpperCase())
  );

/**
 * 노드 목록과 클러스터 목록을 합친다.
 *
 * <p>노드는 PROVISION 이 끝나야 생긴다. 노드만 보여주면 프로비저닝 중이거나 실패한 클러스터가
 * 목록에서 통째로 사라져, 진행 중인 작업도 실패 원인도 찾아갈 길이 없다.
 *
 * @param includePending 자리표시자는 첫 페이지에만 둔다. 매 페이지에 두면 같은 줄이 반복된다.
 */
export const mergeVmRows = (nodes: ClusterNode[], vms: Vm[], includePending = true): VmRow[] => {
  const withNodes = new Set(nodes.map((n) => n.clusterName));

  const placeholders: VmRow[] = (includePending ? pendingVms(vms) : [])
    .filter((v) => !withNodes.has(v.clusterName))
    .map((v) => ({
      nodeName: v.clusterName,
      role: '',
      clusterName: v.clusterName,
      clusterProvider: v.clusterProvider,
      region: v.region,
      environment: v.environment,
      infraStatus: typeof v.status === 'string' ? v.status : undefined,
      pending: true,
    }));

  // 자리표시자를 앞에 둔다. 서버가 노드를 페이지로 자르므로 뒤에 두면 다음 페이지로 밀린다.
  return [...placeholders, ...nodes];
};
