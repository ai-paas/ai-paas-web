import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { createHookWrapper, createTestQueryClient } from '@/test/utils/test-utils';
import { queryKeys } from '@/lib/query-keys';
import {
  useFlushApiMetrics,
  useGetDashboardEvents,
  useGetDashboardTopUsers,
  useGetInfraNodes,
  useGetInfraResources,
  useProbeProvidersHealth,
  useRefreshDashboardTrends,
} from './dashboard';

describe('dashboard hooks', () => {
  // ============================================
  // toSearchParams — undefined/null/'' 필터링 계약
  // ============================================
  describe('searchParams 정리', () => {
    it("undefined/''인 파라미터는 쿼리스트링에서 제외한다 ('undefined' 문자열 전송 방지)", async () => {
      let capturedParams: URLSearchParams | null = null;
      server.use(
        http.get(`${BASE_URL}/admin/dashboard/events`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ data: [], page: 1, size: 20, total: 0 });
        })
      );
      const { result } = renderHook(
        () =>
          useGetDashboardEvents({
            page: 2,
            size: 50,
            resource_type: undefined,
            actor: '', // 검색어 미입력 상태 — 빈 문자열도 제외돼야 한다
            since: undefined,
          }),
        { wrapper: createHookWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
      const params = capturedParams!;
      expect(params.get('page')).toBe('2');
      expect(params.get('size')).toBe('50');
      expect(params.has('resource_type')).toBe(false);
      expect(params.has('actor')).toBe(false);
      expect(params.has('since')).toBe(false);
    });
  });

  // ============================================
  // 무효화 3종 — refresh는 대시보드 전체, flush/probe는 자기 섹션만
  // ============================================
  describe('mutation 무효화 범위', () => {
    const seedCaches = (queryClient: ReturnType<typeof createTestQueryClient>) => {
      queryClient.setQueryData(queryKeys.dashboard.summary(), {});
      queryClient.setQueryData(queryKeys.dashboard.trends({ days: 30 }), { series: [] });
      queryClient.setQueryData(queryKeys.dashboard.apiMetrics(), { paths: [] });
      queryClient.setQueryData(queryKeys.dashboard.apiMetrics({ hours: 24 }), { paths: [] });
      queryClient.setQueryData(queryKeys.dashboard.providersHealth(), { providers: [] });
      queryClient.setQueryData(queryKeys.dashboard.providersHealth({ history_minutes: 30 }), {
        providers: [],
      });
      // 무관 도메인 — 무효화가 번지지 않아야 한다
      queryClient.setQueryData(queryKeys.datasets.list(), { data: [], total: 0 });
    };

    it('useRefreshDashboardTrends 성공 시 dashboard 계층 전체를 무효화한다', async () => {
      const queryClient = createTestQueryClient({ gcTime: Infinity });
      seedCaches(queryClient);
      const { result } = renderHook(() => useRefreshDashboardTrends(), {
        wrapper: createHookWrapper(queryClient),
      });

      result.current.refreshTrends();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(queryClient.getQueryState(queryKeys.dashboard.summary())?.isInvalidated).toBe(true);
      expect(
        queryClient.getQueryState(queryKeys.dashboard.trends({ days: 30 }))?.isInvalidated
      ).toBe(true);
      expect(
        queryClient.getQueryState(queryKeys.dashboard.apiMetrics({ hours: 24 }))?.isInvalidated
      ).toBe(true);
      expect(queryClient.getQueryState(queryKeys.datasets.list())?.isInvalidated).toBe(false);
    });

    it('useFlushApiMetrics 성공 시 api-metrics 캐시만 무효화한다 (파라미터 조합 포함)', async () => {
      const queryClient = createTestQueryClient({ gcTime: Infinity });
      seedCaches(queryClient);
      const { result } = renderHook(() => useFlushApiMetrics(), {
        wrapper: createHookWrapper(queryClient),
      });

      result.current.flushApiMetrics();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      // apiMetrics()의 마지막 세그먼트 {}는 부분 일치로 모든 파라미터 조합을 포함한다
      expect(queryClient.getQueryState(queryKeys.dashboard.apiMetrics())?.isInvalidated).toBe(true);
      expect(
        queryClient.getQueryState(queryKeys.dashboard.apiMetrics({ hours: 24 }))?.isInvalidated
      ).toBe(true);
      // 다른 대시보드 섹션은 건드리지 않는다
      expect(queryClient.getQueryState(queryKeys.dashboard.summary())?.isInvalidated).toBe(false);
      expect(
        queryClient.getQueryState(queryKeys.dashboard.trends({ days: 30 }))?.isInvalidated
      ).toBe(false);
      expect(
        queryClient.getQueryState(queryKeys.dashboard.providersHealth())?.isInvalidated
      ).toBe(false);
    });

    it('useProbeProvidersHealth 성공 시 providers/health 캐시만 무효화한다', async () => {
      const queryClient = createTestQueryClient({ gcTime: Infinity });
      seedCaches(queryClient);
      const { result } = renderHook(() => useProbeProvidersHealth(), {
        wrapper: createHookWrapper(queryClient),
      });

      result.current.probeProviders();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(
        queryClient.getQueryState(queryKeys.dashboard.providersHealth())?.isInvalidated
      ).toBe(true);
      expect(
        queryClient.getQueryState(queryKeys.dashboard.providersHealth({ history_minutes: 30 }))
          ?.isInvalidated
      ).toBe(true);
      expect(
        queryClient.getQueryState(queryKeys.dashboard.apiMetrics({ hours: 24 }))?.isInvalidated
      ).toBe(false);
      expect(queryClient.getQueryState(queryKeys.dashboard.summary())?.isInvalidated).toBe(false);
    });
  });

  // ============================================
  // enabled 게이트 — 필수 파라미터가 준비되기 전에는 요청하지 않는다
  // ============================================
  describe('enabled 게이트', () => {
    it('cluster가 비어 있으면 infra/nodes·infra/resources를 요청하지 않는다', async () => {
      const requestSpy = vi.fn();
      server.use(
        http.get(`${BASE_URL}/admin/dashboard/infra/nodes`, () => {
          requestSpy();
          return HttpResponse.json({ cluster: {}, nodes: [] });
        }),
        http.get(`${BASE_URL}/admin/dashboard/infra/resources`, () => {
          requestSpy();
          return HttpResponse.json({ cluster: {}, resource_type: 'cpu', nodes: [] });
        })
      );

      renderHook(
        () => ({
          nodes: useGetInfraNodes({ cluster: '' }),
          resources: useGetInfraResources({ cluster: '', resource_type: 'cpu' }),
        }),
        { wrapper: createHookWrapper() }
      );

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('enabled가 false면 users/top을 요청하지 않고, true면 domain을 쿼리스트링에 담는다', async () => {
      const capturedDomains: (string | null)[] = [];
      server.use(
        http.get(`${BASE_URL}/admin/dashboard/users/top`, ({ request }) => {
          capturedDomains.push(new URL(request.url).searchParams.get('domain'));
          return HttpResponse.json({ domain: 'service', items: [] });
        })
      );

      // 두 훅의 domain을 다르게 해 쿼리 키를 분리한다 — 같은 키면 캐시 공유로 검증력이 없다
      const { result } = renderHook(
        () => ({
          disabled: useGetDashboardTopUsers({ domain: 'workflow' }, false),
          enabled: useGetDashboardTopUsers({ domain: 'service' }),
        }),
        { wrapper: createHookWrapper() }
      );

      await waitFor(() => {
        expect(result.current.enabled.isPending).toBe(false);
      });
      // enabled 훅의 요청만 발생했고 disabled 훅(workflow)의 요청은 없다
      expect(capturedDomains).toEqual(['service']);
    });
  });
});
