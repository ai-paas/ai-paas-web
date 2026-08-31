import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, setAccessToken } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { BASE_URL } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';
import { createHookWrapper, createTestQueryClient } from '@/test/utils/test-utils';
import {
  useAddFileToKnowledgeBase,
  useCreateKnowledgeBase,
  useDeleteFileFromKnowledgeBase,
  useDeleteKnowledgeBase,
  useGetChunkTypes,
  useGetLanguages,
  useGetSearchMethods,
  useSearchKnowledgeBase,
  useUpdateKnowledgeBase,
} from './knowledgebase';

const createProductionLikeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      // 실제 ReactQueryProvider의 전역 설정을 재현한다. 개별 훅의 retry:false가 없으면
      // 400 응답에도 대용량 multipart 요청이 한 번 더 전송된다.
      mutations: {
        retry: 1,
        retryDelay: 0,
      },
    },
  });

const createFile = (size = 32) =>
  new File([new Uint8Array(size).fill(65)], 'regulations.pdf', {
    type: 'application/pdf',
  });

const createKnowledgeBaseFormData = (file = createFile()) => {
  const data = new FormData();
  data.append('name', '사내 규정 문서');
  data.append('language_id', '1');
  data.append('embedding_model_id', '13');
  data.append('chunk_size', '500');
  data.append('chunk_overlap', '50');
  data.append('chunk_type_id', '1');
  data.append('search_method_id', '1');
  data.append('top_k', '3');
  data.append('threshold', '0.4');
  data.append('file', file);
  return data;
};

const createdKnowledgeBase = {
  id: 7,
  surro_knowledge_id: 101,
  created_at: '2026-08-19T00:00:00Z',
  updated_at: '2026-08-19T00:00:00Z',
  created_by: 'tester',
  name: '사내 규정 문서',
  description: '2026년 개정판',
  collection_name: 'kb-101',
  chunk_size: 500,
  chunk_overlap: 50,
  top_k: 3,
  threshold: 0.4,
  embedding_model_id: 13,
  language_id: 1,
  chunk_type_id: 1,
  search_method_id: 1,
  files: [],
};

describe('knowledgebase upload mutations', () => {
  beforeEach(() => {
    setAccessToken('valid-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('전역 mutation retry가 1이어도 지식베이스 생성 400 응답을 재시도하지 않는다', async () => {
    const requestSpy = vi.fn();
    server.use(
      http.post(`${BASE_URL}/knowledge-bases`, () => {
        requestSpy();
        return HttpResponse.json({ detail: 'Deployment not found' }, { status: 400 });
      })
    );
    const queryClient = createProductionLikeQueryClient();
    const { result } = renderHook(() => useCreateKnowledgeBase(), {
      wrapper: createHookWrapper(queryClient),
    });

    await act(async () => {
      await expect(result.current.createKnowledgeBase(createKnowledgeBaseFormData())).rejects.toThrow(
        'Deployment not found'
      );
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(requestSpy).toHaveBeenCalledTimes(1);
  });

  it('전역 mutation retry가 1이어도 파일 추가 400 응답을 재시도하지 않는다', async () => {
    const knowledgeBaseId = 101;
    const requestSpy = vi.fn();
    server.use(
      http.post(`${BASE_URL}/knowledge-bases/${knowledgeBaseId}/files`, () => {
        requestSpy();
        return HttpResponse.json({ detail: 'File processing failed' }, { status: 400 });
      })
    );
    const queryClient = createProductionLikeQueryClient();
    const { result } = renderHook(() => useAddFileToKnowledgeBase(knowledgeBaseId), {
      wrapper: createHookWrapper(queryClient),
    });

    await act(async () => {
      await expect(result.current.addFileAsync({ file: createFile() })).rejects.toThrow(
        'File processing failed'
      );
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(requestSpy).toHaveBeenCalledTimes(1);
  });

  it('요청 스트림 없이 일반 multipart/form-data로 생성한다', async () => {
    const postSpy = vi.spyOn(api, 'post').mockImplementation(() => {
      return {
        json: () => Promise.resolve(createdKnowledgeBase),
      } as ReturnType<typeof api.post>;
    });
    const formData = createKnowledgeBaseFormData();
    const queryClient = createProductionLikeQueryClient();
    const { result } = renderHook(() => useCreateKnowledgeBase(), {
      wrapper: createHookWrapper(queryClient),
    });

    await act(async () => {
      await result.current.createKnowledgeBase(formData);
    });

    expect(postSpy).toHaveBeenCalledWith('knowledge-bases', {
      body: formData,
      timeout: false,
    });
  });
});

// ============================================
// 캐시 무효화 계약 — files/search-records는 detail(id)의 하위 계층이라
// detail 무효화 한 번으로 함께 stale 처리된다 (query-keys.ts 계층 구조 계약)
// ============================================

const KB_ID = 101;

const seedCaches = (queryClient: ReturnType<typeof createTestQueryClient>) => {
  queryClient.setQueryData(queryKeys.knowledgeBases.list({ page: 1 }), { data: [], total: 0 });
  queryClient.setQueryData(queryKeys.knowledgeBases.detail(KB_ID), createdKnowledgeBase);
  queryClient.setQueryData(queryKeys.knowledgeBases.files(KB_ID), []);
  queryClient.setQueryData(queryKeys.knowledgeBases.searchRecords(KB_ID), []);
  // 다른 지식베이스 — id 단위 무효화가 번지지 않아야 한다
  queryClient.setQueryData(queryKeys.knowledgeBases.detail(202), { id: 8 });
  // 무관 도메인
  queryClient.setQueryData(queryKeys.datasets.list(), { data: [], total: 0 });
};

describe('knowledgebase 캐시 무효화 계약', () => {
  describe('useAddFileToKnowledgeBase', () => {
    it('파일 추가 성공 시 해당 KB의 detail 계층(files/search-records 포함)만 무효화하고 목록·다른 KB는 건드리지 않는다', async () => {
      const queryClient = createTestQueryClient({ gcTime: Infinity });
      seedCaches(queryClient);
      const { result } = renderHook(() => useAddFileToKnowledgeBase(KB_ID), {
        wrapper: createHookWrapper(queryClient),
      });

      await act(async () => {
        await result.current.addFileAsync({ file: createFile() });
      });

      expect(queryClient.getQueryState(queryKeys.knowledgeBases.detail(KB_ID))?.isInvalidated).toBe(
        true
      );
      expect(queryClient.getQueryState(queryKeys.knowledgeBases.files(KB_ID))?.isInvalidated).toBe(
        true
      );
      // 명시적으로 무효화하지 않아도 detail 하위 계층이라 함께 stale 처리된다
      expect(
        queryClient.getQueryState(queryKeys.knowledgeBases.searchRecords(KB_ID))?.isInvalidated
      ).toBe(true);
      // 목록과 다른 KB는 무관
      expect(
        queryClient.getQueryState(queryKeys.knowledgeBases.list({ page: 1 }))?.isInvalidated
      ).toBe(false);
      expect(queryClient.getQueryState(queryKeys.knowledgeBases.detail(202))?.isInvalidated).toBe(
        false
      );
    });
  });

  describe('useDeleteFileFromKnowledgeBase', () => {
    it('파일 삭제 성공 시 해당 KB의 detail 계층만 무효화한다', async () => {
      const queryClient = createTestQueryClient({ gcTime: Infinity });
      seedCaches(queryClient);
      const { result } = renderHook(() => useDeleteFileFromKnowledgeBase(KB_ID), {
        wrapper: createHookWrapper(queryClient),
      });

      await act(async () => {
        await result.current.deleteFileAsync(3);
      });

      expect(queryClient.getQueryState(queryKeys.knowledgeBases.detail(KB_ID))?.isInvalidated).toBe(
        true
      );
      expect(queryClient.getQueryState(queryKeys.knowledgeBases.files(KB_ID))?.isInvalidated).toBe(
        true
      );
      expect(
        queryClient.getQueryState(queryKeys.knowledgeBases.list({ page: 1 }))?.isInvalidated
      ).toBe(false);
    });
  });

  describe('useUpdateKnowledgeBase', () => {
    it('수정 성공 시 knowledge-bases 전체 계층을 무효화하고 무관 도메인은 건드리지 않는다', async () => {
      const queryClient = createTestQueryClient({ gcTime: Infinity });
      seedCaches(queryClient);
      const { result } = renderHook(() => useUpdateKnowledgeBase(), {
        wrapper: createHookWrapper(queryClient),
      });

      await act(async () => {
        await result.current.updateKnowledgeBaseAsync({
          surro_knowledge_id: KB_ID,
          name: '개정판',
        });
      });

      expect(
        queryClient.getQueryState(queryKeys.knowledgeBases.list({ page: 1 }))?.isInvalidated
      ).toBe(true);
      expect(queryClient.getQueryState(queryKeys.knowledgeBases.detail(KB_ID))?.isInvalidated).toBe(
        true
      );
      expect(queryClient.getQueryState(queryKeys.datasets.list())?.isInvalidated).toBe(false);
    });
  });

  describe('useDeleteKnowledgeBase', () => {
    it('삭제 실패 시 무효화하지 않는다', async () => {
      server.use(
        http.delete(`${BASE_URL}/knowledge-bases/:id`, () =>
          HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })
        )
      );
      const queryClient = createTestQueryClient({ gcTime: Infinity });
      seedCaches(queryClient);
      const { result } = renderHook(() => useDeleteKnowledgeBase(), {
        wrapper: createHookWrapper(queryClient),
      });

      result.current.deleteKnowledgeBase(KB_ID);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      expect(
        queryClient.getQueryState(queryKeys.knowledgeBases.list({ page: 1 }))?.isInvalidated
      ).toBe(false);
      expect(queryClient.getQueryState(queryKeys.knowledgeBases.detail(KB_ID))?.isInvalidated).toBe(
        false
      );
    });
  });
});

// ============================================
// 메타 조회 3종 — Page envelope에서 data 배열만 풀어 반환한다
// ============================================

describe('knowledgebase 메타 조회', () => {
  it('chunk-types/languages/search-methods를 envelope에서 풀어 배열로 반환한다', async () => {
    const { result } = renderHook(
      () => ({
        chunkTypes: useGetChunkTypes(),
        languages: useGetLanguages(),
        searchMethods: useGetSearchMethods(),
      }),
      { wrapper: createHookWrapper() }
    );

    await waitFor(() => {
      expect(result.current.chunkTypes.isPending).toBe(false);
      expect(result.current.languages.isPending).toBe(false);
      expect(result.current.searchMethods.isPending).toBe(false);
    });
    expect(result.current.chunkTypes.chunkTypes).toEqual([{ id: 1, name: 'sentence' }]);
    expect(result.current.languages.languages).toEqual([{ id: 1, name: '한국어' }]);
    expect(result.current.searchMethods.searchMethods).toEqual([{ id: 1, name: 'dense' }]);
  });
});

// ============================================
// useSearchKnowledgeBase — 검색 mutation (캐시 무효화 없음)
// ============================================

describe('useSearchKnowledgeBase', () => {
  it('검색어를 POST body로 보내고 검색 결과를 searchResults로 노출한다', async () => {
    let capturedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/knowledge-bases/:id/search`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          results: [{ text: '연차는 15일이다', score: 0.92 }],
          total: 1,
          search_method: 'dense',
        });
      })
    );
    const { result } = renderHook(() => useSearchKnowledgeBase(KB_ID), {
      wrapper: createHookWrapper(),
    });

    await act(async () => {
      await result.current.searchAsync({ text: '연차 규정' });
    });

    expect(capturedBody).toEqual({ text: '연차 규정' });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.searchResults?.results[0].text).toBe('연차는 15일이다');
    expect(result.current.searchResults?.search_method).toBe('dense');
  });
});
