import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { ReactNode } from 'react';

import { useScopedCluster } from './use-scoped-cluster';

const wrapperAt = (route: string) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;
  };

describe('useScopedCluster', () => {
  beforeEach(() => window.sessionStorage.clear());

  it('URL 값을 먼저 쓴다 — 링크를 공유하면 같은 클러스터가 열려야 한다', () => {
    window.sessionStorage.setItem('aipaas.scopedCluster', 'other');

    const { result } = renderHook(() => useScopedCluster(), {
      wrapper: wrapperAt('/apps?clusterId=from-url'),
    });

    expect(result.current.clusterName).toBe('from-url');
  });

  it('URL 이 비면 마지막에 쓴 클러스터를 꺼낸다', () => {
    window.sessionStorage.setItem('aipaas.scopedCluster', 'last-used');

    const { result } = renderHook(() => useScopedCluster(), { wrapper: wrapperAt('/apps') });

    expect(result.current.clusterName).toBe('last-used');
  });

  it('고르면 다음 화면을 위해 기억한다', () => {
    const { result } = renderHook(() => useScopedCluster(), { wrapper: wrapperAt('/apps') });

    act(() => result.current.setClusterName('picked'));

    expect(result.current.clusterName).toBe('picked');
    expect(window.sessionStorage.getItem('aipaas.scopedCluster')).toBe('picked');
  });
});
