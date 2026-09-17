import { describe, it, expect } from 'vitest';
import { mergeVmRows } from './vm-rows';
import type { ClusterNode } from '@/types/vm';
import type { Vm } from '@/types/vm';

const node = (clusterName: string, role: string, name: string): ClusterNode =>
  ({ nodeName: name, role, clusterName, infraStatus: 'READY' }) as ClusterNode;

const vm = (clusterName: string, status: string): Vm =>
  ({ clusterName, status, clusterProvider: 'OpenStack', region: 'RegionOne' }) as Vm;

describe('mergeVmRows', () => {
  it('노드가 있으면 노드를 그대로 보여준다', () => {
    const rows = mergeVmRows([node('demo', 'master', 'demo-master-0')], [vm('demo', 'READY')]);

    expect(rows).toHaveLength(1);
    expect(rows[0].nodeName).toBe('demo-master-0');
  });

  it('프로비저닝 중인 클러스터는 노드가 없어도 보여야 한다', () => {
    // 노드는 PROVISION 이 끝나야 생긴다. 그 전까지 목록에서 사라지면 진행 중인 작업이 안 보인다.
    const rows = mergeVmRows([], [vm('demo', 'PROVISIONING')]);

    expect(rows).toHaveLength(1);
    expect(rows[0].clusterName).toBe('demo');
    expect(rows[0].infraStatus).toBe('PROVISIONING');
    expect(rows[0].pending).toBe(true);
  });

  it('실패한 클러스터도 보여야 한다', () => {
    // 실패는 노드를 남기지 않는다. 안 보이면 왜 실패했는지 찾아갈 길이 없다.
    const rows = mergeVmRows([], [vm('demo', 'FAILED')]);

    expect(rows).toHaveLength(1);
    expect(rows[0].infraStatus).toBe('FAILED');
  });

  it('노드가 생긴 뒤에는 자리표시자를 내보내지 않는다', () => {
    const rows = mergeVmRows(
      [node('demo', 'master', 'demo-master-0'), node('demo', 'worker', 'demo-worker-0')],
      [vm('demo', 'READY')]
    );

    expect(rows).toHaveLength(2);
    expect(rows.some((r) => r.pending)).toBe(false);
  });

  it('자리표시자는 클러스터 정보를 물려받는다', () => {
    const rows = mergeVmRows([], [vm('demo', 'PROVISIONING')]);

    expect(rows[0].clusterProvider).toBe('OpenStack');
    expect(rows[0].region).toBe('RegionOne');
  });

  it('노드만 있고 클러스터 목록이 비어도 노드를 버리지 않는다', () => {
    const rows = mergeVmRows([node('demo', 'master', 'demo-master-0')], []);

    expect(rows).toHaveLength(1);
  });
});
