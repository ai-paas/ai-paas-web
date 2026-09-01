import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { setAccessToken } from '@/lib/api';
import { BASE_URL } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';
import { createHookWrapper, createTestQueryClient } from '@/test/utils/test-utils';
import type { HelmRepositoryCreateRequest } from '@/types/helm';
import {
  normalizeHelmRepositoryDetailResponse,
  normalizeHelmRepositoryExistsResponse,
  normalizeHelmRepositoryListResponse,
  useCreateHelmRepository,
  useDeleteHelmRepository,
  useGetHelmRepositories,
  useGetHelmReleaseResources,
} from './helm';

const seedRepositoryCache = (queryClient: QueryClient) => {
  queryClient.setQueryData(['helm-repositories', 'list', {}], {
    repositories: [],
    meta: { page: 1, size: 20, total: 0, totalPages: 0 },
  });
};

describe('helm repository hooks', () => {
  beforeEach(() => setAccessToken('helm-test-token'));

  it('목록 조회에 page/size/search를 전달하고 AnyCloud 페이지 envelope를 매핑한다', async () => {
    let receivedParams: URLSearchParams | undefined;
    server.use(
      http.get(`${BASE_URL}/any-cloud/helm-repos`, ({ request }) => {
        receivedParams = new URL(request.url).searchParams;
        return HttpResponse.json({
          data: [{ name: 'bitnami', url: 'https://charts.bitnami.com/bitnami' }],
          total: 21,
          page: 2,
          size: 10,
          total_pages: 3,
        });
      })
    );

    const { result } = renderHook(
      () => useGetHelmRepositories({ page: 2, size: 10, search: 'bitnami' }),
      { wrapper: createHookWrapper() }
    );

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(Object.fromEntries(receivedParams ?? [])).toEqual({
      page: '2',
      size: '10',
      search: 'bitnami',
    });
    expect(result.current.repositories).toEqual([
      { name: 'bitnami', url: 'https://charts.bitnami.com/bitnami' },
    ]);
    expect(result.current.meta).toEqual({ page: 2, size: 10, total: 21, totalPages: 3 });
  });

  it('중첩되거나 필드가 누락된 AnyCloud 응답도 안전하게 정규화한다', () => {
    expect(
      normalizeHelmRepositoryListResponse({
        data: {
          data: [{ name: 'internal', url: 'https://charts.internal' }],
          total: 1,
          page: 1,
          size: 20,
          total_pages: 1,
        },
      })
    ).toEqual({
      repositories: [{ name: 'internal', url: 'https://charts.internal' }],
      meta: { page: 1, size: 20, total: 1, totalPages: 1 },
    });
    expect(normalizeHelmRepositoryListResponse({})).toEqual({ repositories: [], meta: undefined });
    expect(
      normalizeHelmRepositoryDetailResponse({
        data: { data: { name: 'internal', url: 'https://charts.internal' } },
      })
    ).toEqual({ name: 'internal', url: 'https://charts.internal' });
    expect(normalizeHelmRepositoryExistsResponse({ data: { exists: true } })).toBe(true);
  });

  it('생성 요청의 OpenAPI 필드를 그대로 전송하고 성공 시 저장소 캐시를 무효화한다', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/any-cloud/helm-repos`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ data: receivedBody, status: 200 });
      })
    );
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    seedRepositoryCache(queryClient);
    const { result } = renderHook(() => useCreateHelmRepository(), {
      wrapper: createHookWrapper(queryClient),
    });
    const request: HelmRepositoryCreateRequest = {
      name: 'private',
      url: 'https://charts.example.com',
      username: 'helm-user',
      password: 'secret',
      caFile: '-----BEGIN CERTIFICATE-----',
      insecureSkipTLSVerify: false,
    };

    await result.current.createHelmRepositoryAsync(request);

    expect(receivedBody).toEqual(request);
    expect(queryClient.getQueryState(['helm-repositories', 'list', {}])?.isInvalidated).toBe(true);
  });

  it('삭제 경로의 저장소 이름을 인코딩하고 성공 시 저장소 캐시를 무효화한다', async () => {
    let receivedPath = '';
    server.use(
      http.delete(`${BASE_URL}/any-cloud/helm-repos/:helmRepoName`, ({ request }) => {
        receivedPath = new URL(request.url).pathname;
        return HttpResponse.json({ message: 'deleted' });
      })
    );
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    seedRepositoryCache(queryClient);
    const { result } = renderHook(() => useDeleteHelmRepository(), {
      wrapper: createHookWrapper(queryClient),
    });

    await result.current.deleteHelmRepositoryAsync('team repo');

    expect(receivedPath).toBe('/api/v1/any-cloud/helm-repos/team%20repo');
    expect(queryClient.getQueryState(['helm-repositories', 'list', {}])?.isInvalidated).toBe(true);
  });
});

describe('helm release hooks', () => {
  beforeEach(() => setAccessToken('helm-test-token'));

  it('릴리즈 리소스 조회에 명세상 필수 clusterId와 namespace를 전달한다', async () => {
    let receivedParams: URLSearchParams | undefined;
    server.use(
      http.get(`${BASE_URL}/any-cloud/catalog/releases/:releaseName/resources`, ({ request }) => {
        receivedParams = new URL(request.url).searchParams;
        return HttpResponse.json({ data: [] });
      })
    );

    const { result } = renderHook(
      () => useGetHelmReleaseResources('frontend', 'cluster-1', 'production'),
      { wrapper: createHookWrapper() }
    );

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(Object.fromEntries(receivedParams ?? [])).toEqual({
      clusterId: 'cluster-1',
      namespace: 'production',
    });
    expect(result.current.isError).toBe(false);
  });
});
