import { describe, expect, it } from 'vitest';

import type { Vm } from '@/types/vm';

import { hasVmInProgress, isVmInProgress, progressRefetchInterval } from './vm-progress';

const vm = (status: string): Vm => ({ clusterName: `c-${status}`, status });

describe('진행 중 판정', () => {
  it('만들어지는 중인 상태를 진행 중으로 본다', () => {
    for (const status of ['REQUESTED', 'PROVISIONING', 'BOOTSTRAPPING', 'VERIFYING', 'DELETING']) {
      expect(isVmInProgress(status), status).toBe(true);
    }
  });

  it('DEGRADED 도 진행 중이다', () => {
    // 조정 루프가 애드온을 마저 올리면 READY 로 간다. 멈춘 것으로 보면 영영 그대로 남는다.
    expect(isVmInProgress('DEGRADED')).toBe(true);
  });

  it('끝난 상태는 진행 중이 아니다', () => {
    for (const status of ['READY', 'FAILED', 'DELETED', 'BLOCKED']) {
      expect(isVmInProgress(status), status).toBe(false);
    }
    expect(isVmInProgress(undefined)).toBe(false);
  });

  it('하나라도 진행 중이면 폴링한다', () => {
    expect(hasVmInProgress([vm('READY'), vm('PROVISIONING')])).toBe(true);
    expect(progressRefetchInterval([vm('READY'), vm('PROVISIONING')], 5000)).toBe(5000);
  });

  it('전부 끝났으면 폴링하지 않는다', () => {
    // 아무것도 변하지 않는 화면에서 CSP API 까지 왕복이 이어질 이유가 없다.
    expect(progressRefetchInterval([vm('READY'), vm('FAILED')])).toBe(false);
    expect(progressRefetchInterval([])).toBe(false);
  });
});
