import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { createHookWrapper, createTestQueryClient } from '@/test/utils/test-utils';
import { queryKeys } from '@/lib/query-keys';
import { useDeletePrompt, useUpdatePrompt } from './prompts';

// a3dd1d4 회귀 방지: prompts.detail이 prompts.all 하위 계층(['prompts','detail',id])이라
// all 무효화 한 번으로 목록·상세·variable-types가 모두 stale 처리되는 계약을 고정한다.

const seedCaches = (queryClient: ReturnType<typeof createTestQueryClient>) => {
  queryClient.setQueryData(queryKeys.prompts.detail(301), { surro_prompt_id: 301 });
  queryClient.setQueryData(queryKeys.prompts.detail(999), { surro_prompt_id: 999 });
  queryClient.setQueryData(queryKeys.prompts.list({ page: 1 }), { data: [], total: 0 });
  queryClient.setQueryData(queryKeys.prompts.variableTypes(), { available_types: [] });
  // 무관 도메인 — 무효화가 번지지 않아야 한다
  queryClient.setQueryData(queryKeys.models.list({ page: 1 }), { data: [], total: 0 });
};

describe('prompts hooks — a3dd1d4 캐시 무효화 계약', () => {
  // ============================================
  // useDeletePrompt
  // ============================================
  describe('useDeletePrompt', () => {
    it('삭제 성공 시 해당 프롬프트의 detail 캐시를 제거한다', async () => {
      const queryClient = createTestQueryClient({ gcTime: Infinity });
      seedCaches(queryClient);
      const { result } = renderHook(() => useDeletePrompt(), {
        wrapper: createHookWrapper(queryClient),
      });

      result.current.deletePrompt(301);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(queryClient.getQueryState(queryKeys.prompts.detail(301))).toBeUndefined();
    });

    it('계층 계약: all 무효화가 다른 detail·목록·variable-types까지 stale 처리한다', async () => {
      const queryClient = createTestQueryClient({ gcTime: Infinity });
      seedCaches(queryClient);
      const { result } = renderHook(() => useDeletePrompt(), {
        wrapper: createHookWrapper(queryClient),
      });

      result.current.deletePrompt(301);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // detail(999)는 제거되지 않고 ['prompts'] 프리픽스 무효화에 걸린다
      const otherDetail = queryClient.getQueryState(queryKeys.prompts.detail(999));
      expect(otherDetail).toBeDefined();
      expect(otherDetail?.isInvalidated).toBe(true);

      expect(queryClient.getQueryState(queryKeys.prompts.list({ page: 1 }))?.isInvalidated).toBe(
        true
      );
      expect(queryClient.getQueryState(queryKeys.prompts.variableTypes())?.isInvalidated).toBe(
        true
      );
      // 무관 도메인은 그대로
      expect(queryClient.getQueryState(queryKeys.models.list({ page: 1 }))?.isInvalidated).toBe(
        false
      );
    });

    it('삭제 실패 시 캐시를 제거하지도 무효화하지도 않는다', async () => {
      server.use(
        http.delete(`${BASE_URL}/prompts/:surroPromptId`, () =>
          HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
        )
      );

      const queryClient = createTestQueryClient({ gcTime: Infinity });
      seedCaches(queryClient);
      const { result } = renderHook(() => useDeletePrompt(), {
        wrapper: createHookWrapper(queryClient),
      });

      result.current.deletePrompt(301);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      const detail = queryClient.getQueryState(queryKeys.prompts.detail(301));
      expect(detail).toBeDefined();
      expect(detail?.isInvalidated).toBe(false);
      expect(queryClient.getQueryState(queryKeys.prompts.list({ page: 1 }))?.isInvalidated).toBe(
        false
      );
    });
  });

  // ============================================
  // useUpdatePrompt — 계층 계약의 소비자
  // ============================================
  describe('useUpdatePrompt', () => {
    it('수정 성공 시 all 무효화 한 번으로 목록과 상세가 모두 stale 처리된다', async () => {
      // 훅 구현은 prompts.all 하나만 무효화한다 — detail이 all 하위 계층이 아니면
      // (a3dd1d4 이전 구조) 상세 캐시가 stale 처리되지 않아 이 테스트가 깨진다.
      const queryClient = createTestQueryClient({ gcTime: Infinity });
      seedCaches(queryClient);
      const { result } = renderHook(() => useUpdatePrompt(), {
        wrapper: createHookWrapper(queryClient),
      });

      result.current.updatePrompt({ surro_prompt_id: 301, name: '수정된 프롬프트' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(queryClient.getQueryState(queryKeys.prompts.detail(301))?.isInvalidated).toBe(true);
      expect(queryClient.getQueryState(queryKeys.prompts.list({ page: 1 }))?.isInvalidated).toBe(
        true
      );
      expect(queryClient.getQueryState(queryKeys.models.list({ page: 1 }))?.isInvalidated).toBe(
        false
      );
    });

    it('수정 실패 시 캐시를 무효화하지 않는다', async () => {
      server.use(
        http.put(`${BASE_URL}/prompts/:surroPromptId`, () =>
          HttpResponse.json({ message: 'Not Found' }, { status: 404 })
        )
      );

      const queryClient = createTestQueryClient({ gcTime: Infinity });
      seedCaches(queryClient);
      const { result } = renderHook(() => useUpdatePrompt(), {
        wrapper: createHookWrapper(queryClient),
      });

      result.current.updatePrompt({ surro_prompt_id: 301, name: '수정된 프롬프트' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(queryClient.getQueryState(queryKeys.prompts.detail(301))?.isInvalidated).toBe(false);
      expect(queryClient.getQueryState(queryKeys.prompts.list({ page: 1 }))?.isInvalidated).toBe(
        false
      );
    });
  });
});
