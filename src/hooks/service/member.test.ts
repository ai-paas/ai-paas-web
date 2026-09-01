import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { createHookWrapper, createTestQueryClient } from '@/test/utils/test-utils';
import { queryKeys } from '@/lib/query-keys';
import {
  useCreateMember,
  useDeleteMember,
  useGetMember,
  useUpdateMember,
  useUpdateMemberStatus,
} from './member';

// 멤버 mutation은 members.all 프리픽스 무효화 계약이다.
// detail(id)이 ['members', id]로 all 하위 계층이라 한 번의 무효화로 목록·상세가 모두 stale 처리된다.

const seedCaches = (queryClient: ReturnType<typeof createTestQueryClient>) => {
  queryClient.setQueryData(queryKeys.members.list({ page: 1 }), { data: [], total: 0 });
  queryClient.setQueryData(queryKeys.members.detail('user-a'), { member_id: 'user-a' });
  // 무관 도메인 — 무효화가 번지지 않아야 한다
  queryClient.setQueryData(queryKeys.datasets.list(), { data: [], total: 0 });
};

describe('member hooks', () => {
  describe('useCreateMember', () => {
    it('생성 성공 시 members 계층(목록·상세)을 무효화하고 무관 도메인은 건드리지 않는다', async () => {
      const queryClient = createTestQueryClient({ gcTime: Infinity });
      seedCaches(queryClient);
      const { result } = renderHook(() => useCreateMember(), {
        wrapper: createHookWrapper(queryClient),
      });

      result.current.createMember({
        member_id: 'user-c',
        name: '이영희',
        email: 'c@example.com',
        phone: '010-1234-5678',
        role: 'user',
        is_active: true,
        description: '',
        password: 'Password1!',
        password_confirm: 'Password1!',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(queryClient.getQueryState(queryKeys.members.list({ page: 1 }))?.isInvalidated).toBe(
        true
      );
      expect(queryClient.getQueryState(queryKeys.members.detail('user-a'))?.isInvalidated).toBe(
        true
      );
      expect(queryClient.getQueryState(queryKeys.datasets.list())?.isInvalidated).toBe(false);
    });

    it('생성 실패 시 무효화하지 않는다', async () => {
      server.use(
        http.post(`${BASE_URL}/members/`, () =>
          HttpResponse.json({ detail: 'Duplicated' }, { status: 409 })
        )
      );
      const queryClient = createTestQueryClient({ gcTime: Infinity });
      seedCaches(queryClient);
      const { result } = renderHook(() => useCreateMember(), {
        wrapper: createHookWrapper(queryClient),
      });

      result.current.createMember({
        member_id: 'user-a',
        name: '홍길동',
        email: 'a@example.com',
        phone: '010-1234-5678',
        role: 'user',
        is_active: true,
        description: '',
        password: 'Password1!',
        password_confirm: 'Password1!',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      expect(queryClient.getQueryState(queryKeys.members.list({ page: 1 }))?.isInvalidated).toBe(
        false
      );
    });
  });

  describe('useUpdateMember', () => {
    it('member_id는 URL 경로로만 쓰고 PUT 본문에는 나머지 필드만 담는다', async () => {
      let capturedBody: unknown;
      let capturedId: string | undefined;
      server.use(
        http.put(`${BASE_URL}/members/:memberId`, async ({ request, params }) => {
          capturedBody = await request.json();
          capturedId = params.memberId as string;
          return HttpResponse.json({ member_id: 'user-a', name: '개명' });
        })
      );
      const queryClient = createTestQueryClient({ gcTime: Infinity });
      seedCaches(queryClient);
      const { result } = renderHook(() => useUpdateMember(), {
        wrapper: createHookWrapper(queryClient),
      });

      result.current.updateMember({ member_id: 'user-a', name: '개명' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(capturedId).toBe('user-a');
      expect(capturedBody).toEqual({ name: '개명' });
      expect(queryClient.getQueryState(queryKeys.members.list({ page: 1 }))?.isInvalidated).toBe(
        true
      );
      expect(queryClient.getQueryState(queryKeys.members.detail('user-a'))?.isInvalidated).toBe(
        true
      );
    });
  });

  describe('useUpdateMemberStatus', () => {
    it.each([true, false])(
      'PATCH 상태 변경 요청에 is_active=%s 쿼리를 보내고 멤버 캐시를 무효화한다',
      async (isActive) => {
        let capturedId: string | undefined;
        let capturedStatus: string | null = null;
        server.use(
          http.patch(`${BASE_URL}/members/:memberId/status`, ({ request, params }) => {
            capturedId = params.memberId as string;
            capturedStatus = new URL(request.url).searchParams.get('is_active');
            return HttpResponse.json({ member_id: 'user-a', is_active: isActive });
          })
        );
        const queryClient = createTestQueryClient({ gcTime: Infinity });
        seedCaches(queryClient);
        const { result } = renderHook(() => useUpdateMemberStatus(), {
          wrapper: createHookWrapper(queryClient),
        });

        result.current.updateMemberStatus({ member_id: 'user-a', is_active: isActive });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });
        expect(capturedId).toBe('user-a');
        expect(capturedStatus).toBe(String(isActive));
        expect(queryClient.getQueryState(queryKeys.members.list({ page: 1 }))?.isInvalidated).toBe(
          true
        );
        expect(queryClient.getQueryState(queryKeys.members.detail('user-a'))?.isInvalidated).toBe(
          true
        );
      }
    );
  });

  describe('useDeleteMember', () => {
    it('삭제 성공 시 members 계층을 무효화한다', async () => {
      const queryClient = createTestQueryClient({ gcTime: Infinity });
      seedCaches(queryClient);
      const { result } = renderHook(() => useDeleteMember(), {
        wrapper: createHookWrapper(queryClient),
      });

      result.current.deleteMember('user-a');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(queryClient.getQueryState(queryKeys.members.list({ page: 1 }))?.isInvalidated).toBe(
        true
      );
      expect(queryClient.getQueryState(queryKeys.datasets.list())?.isInvalidated).toBe(false);
    });
  });

  describe('useGetMember', () => {
    it('enabled가 false면 요청하지 않는다', async () => {
      const requestSpy = vi.fn();
      server.use(
        http.get(`${BASE_URL}/members/:memberId`, () => {
          requestSpy();
          return HttpResponse.json({ member_id: 'user-a' });
        })
      );

      renderHook(() => useGetMember('user-a', false), { wrapper: createHookWrapper() });

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('enabled면 상세를 조회한다', async () => {
      const { result } = renderHook(() => useGetMember('user-a'), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
      expect(result.current.member?.member_id).toBe('user-a');
    });
  });
});
