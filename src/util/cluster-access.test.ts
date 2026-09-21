import { describe, expect, it } from 'vitest';

import type { Vm } from '@/types/vm';

import { clusterAccessNotice } from './cluster-access';

const vm = (apiServerReach?: string): Vm => ({ clusterName: 'demo', apiServerReach });

describe('클러스터 접근 안내', () => {
  it('점프가 필요하면 미리 알려준다', () => {
    // 받아 보고 나서 아는 것이 지금 동작이다.
    expect(clusterAccessNotice(vm('VIA_BASTION'))).toContain('점프 호스트');
  });

  it('사설 대역이면 같은 망에서만 된다고 말한다', () => {
    expect(clusterAccessNotice(vm('PRIVATE_NETWORK'))).toContain('사설 대역');
  });

  it('바로 닿는 클러스터에는 아무 말도 붙이지 않는다', () => {
    // 늘 경고를 띄우면 정작 필요한 곳에서 읽지 않는다.
    expect(clusterAccessNotice(vm('DIRECT'))).toBeNull();
    expect(clusterAccessNotice(vm())).toBeNull();
    expect(clusterAccessNotice(undefined)).toBeNull();
  });
});
