import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useGetVms } from './vms';

const get = vi.fn();

vi.mock('../../lib/api', () => ({
  api: { get: (...args: unknown[]) => get(...args) },
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

const respond = (vms: unknown[]) => ({ json: () => Promise.resolve({ data: { items: vms } }) });

describe('VM 목록 폴링', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    get.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('만들어지는 중이면 스스로 다시 묻는다', async () => {
    // 끄면 생성 후 PROVISIONING → READY 가 보이지 않아 새로고침을 하게 된다.
    get.mockImplementation(() => respond([{ clusterName: 'a', status: 'PROVISIONING' }]));
    renderHook(() => useGetVms(), { wrapper });

    // waitFor 는 fake timer 와 서로 막힌다. 타이머만 밀어 초기 조회를 끝낸다.
    await vi.advanceTimersByTimeAsync(0);
    expect(get).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(11_000);

    expect(get.mock.calls.length).toBeGreaterThan(1);
  });

  it('전부 끝났으면 더 묻지 않는다', async () => {
    // 아무것도 변하지 않는 화면에서 CSP API 까지 왕복이 이어질 이유가 없다.
    get.mockImplementation(() => respond([{ clusterName: 'a', status: 'READY' }]));
    renderHook(() => useGetVms(), { wrapper });

    await vi.advanceTimersByTimeAsync(0);
    expect(get).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(30_000);

    expect(get).toHaveBeenCalledTimes(1);
  });
});
