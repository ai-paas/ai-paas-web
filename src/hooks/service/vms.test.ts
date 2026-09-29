import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { createHookWrapper, createTestQueryClient } from '@/test/utils/test-utils';
import { useDeleteVm, useGetClusterNodes } from './vms';

// 강제 삭제는 destroy 를 건너뛰고 기록만 지운다. force 가 빠지면 일반 삭제가 나가고
// 자격증명이 사라진 클러스터는 다시 지워지지 않는다.
describe('useDeleteVm', () => {
  const captureDelete = () => {
    const seen: string[] = [];
    server.use(
      http.delete(`${BASE_URL}/any-cloud/vms/:vmName`, ({ request }) => {
        seen.push(new URL(request.url).search);
        return HttpResponse.json({ success: true, data: null });
      })
    );
    return seen;
  };

  it('기본 삭제는 force 를 보내지 않는다', async () => {
    const seen = captureDelete();
    const { result } = renderHook(() => useDeleteVm(), {
      wrapper: createHookWrapper(createTestQueryClient()),
    });

    result.current.deleteVm({ vmName: 'demo' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(seen[0]).not.toContain('force');
  });

  it('강제 삭제는 force=true 를 붙인다', async () => {
    const seen = captureDelete();
    const { result } = renderHook(() => useDeleteVm(), {
      wrapper: createHookWrapper(createTestQueryClient()),
    });

    result.current.deleteVm({ vmName: 'demo', force: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(seen[0]).toContain('force=true');
  });

  it('남을 수 있는 스택 목록을 응답에서 꺼내 전달한다', async () => {
    server.use(
      http.delete(`${BASE_URL}/any-cloud/vms/:vmName`, () =>
        HttpResponse.json({
          success: true,
          data: { removedRecords: 2, orphanedStacks: ['anycloud-OpenStack-dev-demo'] },
        })
      )
    );
    let orphaned: string[] | undefined;
    const { result } = renderHook(
      () => useDeleteVm({ onSuccess: (stacks) => (orphaned = stacks) }),
      { wrapper: createHookWrapper(createTestQueryClient()) }
    );

    result.current.deleteVm({ vmName: 'demo', force: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(orphaned).toEqual(['anycloud-OpenStack-dev-demo']);
  });
});

describe('useGetClusterNodes', () => {
  it('노드 배열을 items 래핑 여부와 무관하게 꺼낸다', async () => {
    server.use(
      http.get(`${BASE_URL}/any-cloud/nodes`, () =>
        HttpResponse.json({
          data: { items: [{ nodeName: 'demo-master-0', role: 'master', clusterName: 'demo' }] },
        })
      )
    );
    const { result } = renderHook(() => useGetClusterNodes(), {
      wrapper: createHookWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.nodes[0].nodeName).toBe('demo-master-0');
  });

  it('클러스터로 좁힐 때 clusterName 을 붙인다', async () => {
    let seen = '';
    server.use(
      http.get(`${BASE_URL}/any-cloud/nodes`, ({ request }) => {
        seen = new URL(request.url).search;
        return HttpResponse.json({ data: [] });
      })
    );
    const { result } = renderHook(() => useGetClusterNodes({ clusterName: 'demo' }), {
      wrapper: createHookWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(seen).toContain('clusterName=demo');
  });

  it('빈 필터는 쿼리에 싣지 않는다', async () => {
    let seen = 'unset';
    server.use(
      http.get(`${BASE_URL}/any-cloud/nodes`, ({ request }) => {
        seen = new URL(request.url).search;
        return HttpResponse.json({ data: [] });
      })
    );
    const { result } = renderHook(() => useGetClusterNodes({ provider: '' }), {
      wrapper: createHookWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(seen).toBe('');
  });
});
