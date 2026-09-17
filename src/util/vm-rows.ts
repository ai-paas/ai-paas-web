import type { ClusterNode, Vm } from '@/types/vm';

/** 목록의 한 행. 아직 노드가 없는 클러스터는 자리표시자로 한 줄 차지한다. */
export interface VmRow extends ClusterNode {
  /** 노드가 아직 없어 클러스터를 대신 보여주는 행 */
  pending?: boolean;
}

/**
 * 노드 목록과 클러스터 목록을 합친다.
 *
 * <p>노드는 PROVISION 이 끝나야 생긴다. 노드만 보여주면 프로비저닝 중이거나 실패한 클러스터가
 * 목록에서 통째로 사라져, 진행 중인 작업도 실패 원인도 찾아갈 길이 없다.
 */
export const mergeVmRows = (nodes: ClusterNode[], vms: Vm[]): VmRow[] => {
  const withNodes = new Set(nodes.map((n) => n.clusterName));

  const placeholders: VmRow[] = vms
    .filter((v) => v.clusterName && !withNodes.has(v.clusterName))
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

  return [...nodes, ...placeholders];
};
