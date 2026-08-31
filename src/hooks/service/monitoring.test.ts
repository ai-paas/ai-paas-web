import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { createHookWrapper } from '@/test/utils/test-utils';
import {
  normalizeKubernetesPodPageResponse,
  useGetKubernetesPodsResource,
  useInstantQuery,
  useMultiPromQuery,
  useRangeQuery,
  type MultiQuerySpec,
} from './monitoring';
import type { KubernetesPod } from '@/types/cluster';

const makePod = (name: string, namespace = 'default', nodeName = 'node-1'): KubernetesPod => ({
  apiVersion: 'v1',
  kind: 'Pod',
  metadata: { name, namespace, creationTimestamp: '2026-08-31T00:00:00Z' },
  spec: { nodeName },
  status: { phase: 'Running' },
});

const emptyVector = {
  status: 'success',
  data: { resultType: 'vector', result: [] },
};

describe('monitoring hooks', () => {
  // ============================================
  // normalizeKubernetesPodPageResponse — 3가지 응답 포맷 정규화
  // ============================================
  describe('normalizeKubernetesPodPageResponse', () => {
    it('배열 응답은 길이 기준으로 단일 페이지 취급한다', () => {
      const pods = [makePod('a'), makePod('b')];

      expect(normalizeKubernetesPodPageResponse(pods)).toEqual({
        data: pods,
        total: 2,
        size: 2,
        totalPages: 1,
      });
    });

    it('페이지 envelope는 total_pages를 그대로 쓴다', () => {
      const pods = [makePod('a')];

      expect(
        normalizeKubernetesPodPageResponse({ data: pods, total: 250, size: 100, total_pages: 3 })
      ).toEqual({ data: pods, total: 250, size: 100, totalPages: 3 });
    });

    it('total_pages가 없으면 total/size로 페이지 수를 계산한다', () => {
      const pods = [makePod('a')];

      expect(normalizeKubernetesPodPageResponse({ data: pods, total: 250, size: 100 })).toEqual({
        data: pods,
        total: 250,
        size: 100,
        totalPages: 3,
      });
    });

    it('total/size가 없으면 data 길이로 대체하고 1페이지로 계산한다', () => {
      const pods = [makePod('a'), makePod('b')];

      expect(normalizeKubernetesPodPageResponse({ data: pods })).toEqual({
        data: pods,
        total: 2,
        size: 2,
        totalPages: 1,
      });
    });

    it('size가 0이어도 0으로 나누지 않는다 (최소 1로 가드)', () => {
      expect(normalizeKubernetesPodPageResponse({ data: [], total: 5, size: 0 })).toEqual({
        data: [],
        total: 5,
        size: 0,
        totalPages: 5,
      });
    });

    it('undefined는 빈 페이지로 정규화한다', () => {
      expect(normalizeKubernetesPodPageResponse(undefined)).toEqual({
        data: [],
        total: 0,
        size: 0,
        totalPages: 1,
      });
    });

    it('data 없는 객체는 빈 배열로 두되 total 기반으로 페이지 수를 계산한다', () => {
      // size가 없으면 data.length(0)로 대체되고, 나누는 수는 최소 1로 가드되어
      // totalPages = ceil(5/1) = 5가 된다 — data 없이 total만 온 비정상 응답의 특성화
      expect(normalizeKubernetesPodPageResponse({ total: 5 })).toEqual({
        data: [],
        total: 5,
        size: 0,
        totalPages: 5,
      });
    });
  });

  // ============================================
  // useGetKubernetesPodsResource — 전체 페이지 병렬 fetch
  // ============================================
  describe('useGetKubernetesPodsResource', () => {
    it('total_pages가 1이면 한 번만 요청하고 clusterName/size/page를 쿼리스트링에 담는다', async () => {
      const capturedParams: URLSearchParams[] = [];
      server.use(
        http.get(`${BASE_URL}/any-cloud/kubernetes/pods`, ({ request }) => {
          capturedParams.push(new URL(request.url).searchParams);
          return HttpResponse.json({ data: [makePod('pod-1')], total: 1, size: 100, total_pages: 1 });
        })
      );
      const { result } = renderHook(
        () => useGetKubernetesPodsResource('cluster-a', 'ai-namespace'),
        { wrapper: createHookWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
      expect(result.current.pods).toHaveLength(1);
      expect(capturedParams).toHaveLength(1);
      expect(capturedParams[0].get('clusterName')).toBe('cluster-a');
      expect(capturedParams[0].get('namespace')).toBe('ai-namespace');
      expect(capturedParams[0].get('size')).toBe('100');
      expect(capturedParams[0].get('page')).toBe('1');
    });

    it('여러 페이지면 첫 페이지 후 나머지를 병렬로 가져와 합친다', async () => {
      const requestedPages: string[] = [];
      server.use(
        http.get(`${BASE_URL}/any-cloud/kubernetes/pods`, ({ request }) => {
          const page = new URL(request.url).searchParams.get('page') ?? '';
          requestedPages.push(page);
          return HttpResponse.json({
            data: [makePod(`pod-p${page}`)],
            total: 3,
            size: 1,
            total_pages: 3,
          });
        })
      );
      const { result } = renderHook(() => useGetKubernetesPodsResource('cluster-a'), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
      expect(requestedPages.sort()).toEqual(['1', '2', '3']);
      expect(result.current.pods.map((pod) => pod.metadata.name)).toEqual([
        'pod-p1',
        'pod-p2',
        'pod-p3',
      ]);
    });

    it('후속 페이지 하나가 실패해도 나머지 페이지 결과는 유지된다', async () => {
      server.use(
        http.get(`${BASE_URL}/any-cloud/kubernetes/pods`, ({ request }) => {
          const page = new URL(request.url).searchParams.get('page');
          if (page === '2') {
            // 403: ky 기본 retry 대상(5xx 등)이 아닌 상태 코드 — 재시도 지연 없이 즉시 실패
            return HttpResponse.json({ detail: 'forbidden' }, { status: 403 });
          }
          return HttpResponse.json({
            data: [makePod(`pod-p${page}`)],
            total: 3,
            size: 1,
            total_pages: 3,
          });
        })
      );
      const { result } = renderHook(() => useGetKubernetesPodsResource('cluster-a'), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
      expect(result.current.isError).toBe(false);
      expect(result.current.pods.map((pod) => pod.metadata.name)).toEqual(['pod-p1', 'pod-p3']);
    });

    it('버그 의심 — 팀 확인 필요: 중복 파드 제거 Map의 키에 배열 인덱스가 섞여 실제로는 중복이 제거되지 않는다', async () => {
      // podKey = [namespace, name, nodeName, index].filter(Boolean).join(':')
      // — index가 파드마다 달라 키가 항상 유일하므로 dedupe가 no-op이다.
      // 의도가 중복 제거라면 index를 키에서 빼야 한다. 수정 시 이 기대값도 1로 갱신할 것.
      const duplicated = makePod('same-pod', 'default', 'node-1');
      server.use(
        http.get(`${BASE_URL}/any-cloud/kubernetes/pods`, () =>
          HttpResponse.json({ data: [duplicated, duplicated], total: 4, size: 2, total_pages: 2 })
        )
      );
      const { result } = renderHook(() => useGetKubernetesPodsResource('cluster-a'), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
      // 같은 파드가 4번(2페이지 × 2개) 들어와도 하나로 합쳐지지 않는다
      expect(result.current.pods).toHaveLength(4);
    });

    it('clusterName이 없거나 enabled가 false면 요청하지 않는다', async () => {
      const requestSpy = vi.fn();
      server.use(
        http.get(`${BASE_URL}/any-cloud/kubernetes/pods`, () => {
          requestSpy();
          return HttpResponse.json([]);
        })
      );

      renderHook(
        () => ({
          noCluster: useGetKubernetesPodsResource(undefined),
          disabled: useGetKubernetesPodsResource('cluster-a', undefined, false),
        }),
        { wrapper: createHookWrapper() }
      );

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(requestSpy).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // useInstantQuery / useRangeQuery — enabled 게이트와 쿼리스트링
  // ============================================
  describe('useInstantQuery / useRangeQuery', () => {
    it('query나 clusterName이 없으면 요청하지 않는다', async () => {
      const requestSpy = vi.fn();
      server.use(
        http.get(`${BASE_URL}/any-cloud/monit/:clusterName/query`, () => {
          requestSpy();
          return HttpResponse.json(emptyVector);
        })
      );

      renderHook(
        () => ({
          noQuery: useInstantQuery(undefined, 'cluster-a'),
          noCluster: useInstantQuery('up', undefined),
          disabled: useInstantQuery('up', 'cluster-a', { enabled: false }),
        }),
        { wrapper: createHookWrapper() }
      );

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('range 쿼리는 start/end/step이 모두 있어야 요청하고 문자열로 변환해 보낸다', async () => {
      const capturedParams: URLSearchParams[] = [];
      server.use(
        http.get(`${BASE_URL}/any-cloud/monit/:clusterName/query_range`, ({ request }) => {
          capturedParams.push(new URL(request.url).searchParams);
          return HttpResponse.json({ status: 'success', data: { resultType: 'matrix', result: [] } });
        })
      );

      const { result } = renderHook(
        () => ({
          missingStep: useRangeQuery({ query: 'up', clusterName: 'cluster-a', start: 1, end: 2 }),
          complete: useRangeQuery({
            query: 'up',
            clusterName: 'cluster-a',
            start: 1000,
            end: 2000,
            step: 30,
          }),
        }),
        { wrapper: createHookWrapper() }
      );

      await waitFor(() => {
        expect(result.current.complete.isPending).toBe(false);
      });
      expect(capturedParams).toHaveLength(1);
      expect(capturedParams[0].get('query')).toBe('up');
      expect(capturedParams[0].get('start')).toBe('1000');
      expect(capturedParams[0].get('end')).toBe('2000');
      expect(capturedParams[0].get('step')).toBe('30');
    });
  });

  // ============================================
  // useMultiPromQuery — 요청 본문 구성과 쿼리 키 안정화
  // ============================================
  describe('useMultiPromQuery', () => {
    it('spec 배열을 본문으로 직렬화한다 (start/end/step 문자열 변환, 미지정 필드 생략)', async () => {
      let capturedBody: unknown;
      server.use(
        http.post(`${BASE_URL}/any-cloud/monit/:clusterName/multi-query`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ cpu: emptyVector, mem: emptyVector });
        })
      );
      const queries: MultiQuerySpec[] = [
        { name: 'cpu', type: 'instant', query: 'cpu_usage' },
        { name: 'mem', type: 'range', query: 'mem_usage', start: 1000, end: 2000, step: 30 },
      ];
      const { result } = renderHook(() => useMultiPromQuery('cluster-a', queries), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
      expect(capturedBody).toEqual({
        queries: [
          { name: 'cpu', type: 'instant', query: 'cpu_usage' },
          { name: 'mem', type: 'range', query: 'mem_usage', start: '1000', end: '2000', step: '30' },
        ],
      });
      expect(result.current.data).toHaveProperty('cpu');
    });

    it('spec 내용이 같으면 배열 ref가 매 렌더 바뀌어도 재요청하지 않는다 (쿼리 키 안정화)', async () => {
      const requestSpy = vi.fn();
      server.use(
        http.post(`${BASE_URL}/any-cloud/monit/:clusterName/multi-query`, () => {
          requestSpy();
          return HttpResponse.json({ cpu: emptyVector });
        })
      );
      const makeQueries = (): MultiQuerySpec[] => [
        { name: 'cpu', type: 'instant', query: 'cpu_usage' },
      ];
      const { result, rerender } = renderHook(
        ({ queries }: { queries: MultiQuerySpec[] }) => useMultiPromQuery('cluster-a', queries),
        { wrapper: createHookWrapper(), initialProps: { queries: makeQueries() } }
      );

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
      expect(requestSpy).toHaveBeenCalledTimes(1);

      rerender({ queries: makeQueries() }); // 동일 spec, 새 배열 ref

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(requestSpy).toHaveBeenCalledTimes(1);
    });

    it('queries가 비어 있거나 clusterName이 없으면 요청하지 않는다', async () => {
      const requestSpy = vi.fn();
      server.use(
        http.post(`${BASE_URL}/any-cloud/monit/:clusterName/multi-query`, () => {
          requestSpy();
          return HttpResponse.json({});
        })
      );

      renderHook(
        () => ({
          empty: useMultiPromQuery('cluster-a', []),
          noCluster: useMultiPromQuery(undefined, [
            { name: 'cpu', type: 'instant', query: 'cpu_usage' },
          ]),
        }),
        { wrapper: createHookWrapper() }
      );

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(requestSpy).not.toHaveBeenCalled();
    });
  });
});
