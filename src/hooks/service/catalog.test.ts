import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/api';
import { createHookWrapper, createTestQueryClient } from '@/test/utils/test-utils';
import { useDeployCatalog } from './catalog';

describe('useDeployCatalog', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('OpenAPI 계약대로 배포 정보를 multipart/form-data로 전송한다', async () => {
    let requestBody: FormData | undefined;
    const postSpy = vi.spyOn(api, 'post').mockImplementation((_url, options) => {
      requestBody = options?.body as FormData;
      return {
        json: () => Promise.resolve({ accepted: true }),
      } as ReturnType<typeof api.post>;
    });
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    queryClient.setQueryData(['helm-releases'], []);
    const { result } = renderHook(() => useDeployCatalog(), {
      wrapper: createHookWrapper(queryClient),
    });
    const valuesFile = new File(['replicaCount: 2'], 'values.yaml', {
      type: 'application/yaml',
    });

    await result.current.deployCatalogAsync({
      repoName: '외부 repo',
      chartName: 'nginx chart',
      releaseName: 'frontend',
      clusterId: 'cluster-1',
      namespace: 'production',
      version: '1.2.3',
      valuesFile,
    });

    expect(postSpy).toHaveBeenCalledWith(
      `any-cloud/catalog/${encodeURIComponent('외부 repo')}/${encodeURIComponent('nginx chart')}/deploy`,
      { body: expect.any(FormData) }
    );
    expect(requestBody?.get('releaseName')).toBe('frontend');
    expect(requestBody?.get('clusterId')).toBe('cluster-1');
    expect(requestBody?.get('namespace')).toBe('production');
    expect(requestBody?.get('version')).toBe('1.2.3');
    expect(requestBody?.get('valuesFile')).toBe(valuesFile);
    expect(queryClient.getQueryState(['helm-releases'])?.isInvalidated).toBe(true);
  });

  it('namespace를 생략하면 명세 기본값인 default를 보내고 선택 필드는 제외한다', async () => {
    let requestBody: FormData | undefined;
    vi.spyOn(api, 'post').mockImplementation((_url, options) => {
      requestBody = options?.body as FormData;
      return {
        json: () => Promise.resolve({}),
      } as ReturnType<typeof api.post>;
    });
    const { result } = renderHook(() => useDeployCatalog(), {
      wrapper: createHookWrapper(),
    });

    await result.current.deployCatalogAsync({
      repoName: 'stable',
      chartName: 'nginx',
      releaseName: 'nginx',
      clusterId: 'cluster-1',
    });

    expect(requestBody?.get('namespace')).toBe('default');
    expect(requestBody?.has('version')).toBe(false);
    expect(requestBody?.has('valuesFile')).toBe(false);
  });
});
