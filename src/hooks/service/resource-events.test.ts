import { describe, it, expect } from 'vitest';
import { invalidationKeysFor } from './resource-events';
import { queryKeys } from '@/lib/query-keys';

describe('invalidationKeysFor', () => {
  it('VM 클러스터가 바뀌면 목록과 상세, 노드까지 함께 갱신한다', () => {
    const keys = invalidationKeysFor({ type: 'vmCluster', name: 'demo' });

    // vms.all 하나로 목록·상세·작업이력이 모두 덮인다. 하위 키를 따로 나열하면 언젠가 빠뜨린다.
    expect(keys).toContainEqual(queryKeys.vms.all);
    expect(keys).toContainEqual(queryKeys.clusterNodes.all);
    expect(keys).toContainEqual(queryKeys.clusters.all);
  });

  it('작업이 바뀌면 작업 이력과 그 클러스터를 갱신한다', () => {
    const keys = invalidationKeysFor({ type: 'operation', name: 'demo' });

    expect(keys).toContainEqual(queryKeys.operations.all);
    expect(keys).toContainEqual(queryKeys.vms.all);
  });

  it('자격증명 변경은 자격증명만 건드린다', () => {
    const keys = invalidationKeysFor({ type: 'credential', name: 'aws-01' });

    expect(keys).toContainEqual(queryKeys.credentials.all);
    expect(keys).not.toContainEqual(queryKeys.vms.all);
  });

  it('모르는 종류는 아무것도 무효화하지 않는다', () => {
    // 모르면 전체를 지우고 싶어지지만, 그러면 신호 하나에 화면 전체가 다시 로딩된다.
    expect(invalidationKeysFor({ type: 'somethingNew', name: 'x' })).toEqual([]);
  });
});
