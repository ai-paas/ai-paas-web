import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, setAccessToken } from '@/lib/api';
import { BASE_URL } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';
import { createHookWrapper } from '@/test/utils/test-utils';
import { useAddFileToKnowledgeBase, useCreateKnowledgeBase } from './knowledgebase';

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
