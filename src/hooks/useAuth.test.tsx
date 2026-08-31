import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { createTestQueryClient, makeTestJwt } from '@/test/utils/test-utils';
import { getAccessToken, setAccessToken } from '@/lib/api';
import { AuthProvider, useAuth } from './useAuth';
import type { ReactNode } from 'react';

// useAuth는 인증 도메인 흐름의 오케스트레이션 계층이다:
// 마운트 시 refresh로 세션 복원, logout 시 서버 무효화 → 로컬 토큰 제거 → 캐시 초기화.

const createAuthWrapper = (queryClient = createTestQueryClient()) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
  return { wrapper, queryClient };
};

describe('useAuth', () => {
  // ============================================
  // 마운트 초기화 — 세션 복원
  // ============================================
  describe('초기화', () => {
    it('메모리에 토큰이 없으면 refresh로 세션을 복원한다', async () => {
      const { wrapper } = createAuthWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      // refresh 응답 전까지는 로딩 상태
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.accessToken).toBe('test-access-token');
    });

    it('refresh가 실패하면 비인증 상태로 로딩을 끝낸다', async () => {
      server.use(
        http.post(`${BASE_URL}/auth/refresh`, () =>
          HttpResponse.json({ message: 'expired' }, { status: 401 })
        )
      );
      const { wrapper } = createAuthWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.accessToken).toBeNull();
    });

    it('메모리에 토큰이 있으면 refresh 없이 즉시 인증 상태가 된다', async () => {
      const refreshSpy = vi.fn();
      server.use(
        http.post(`${BASE_URL}/auth/refresh`, () => {
          refreshSpy();
          return HttpResponse.json({ access_token: 'test-access-token' });
        })
      );
      setAccessToken(makeTestJwt({ role: 'user' }));

      const { wrapper } = createAuthWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(refreshSpy).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // isAdmin — 토큰 role 클레임 파생
  // ============================================
  describe('isAdmin', () => {
    it('role이 admin인 토큰이면 true다', () => {
      setAccessToken(makeTestJwt({ role: 'admin' }));
      const { wrapper } = createAuthWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAdmin).toBe(true);
    });

    it('role이 admin이 아니면 false다', () => {
      setAccessToken(makeTestJwt({ role: 'user' }));
      const { wrapper } = createAuthWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAdmin).toBe(false);
    });
  });

  // ============================================
  // logout — 서버 무효화 → 로컬 토큰 제거 → 캐시 초기화
  // ============================================
  describe('logout', () => {
    it('서버 리프레시 토큰을 무효화하고 로컬 토큰과 쿼리 캐시를 정리한다', async () => {
      let authHeader: string | null = null;
      server.use(
        http.post(`${BASE_URL}/auth/logout`, ({ request }) => {
          authHeader = request.headers.get('Authorization');
          return new HttpResponse(null, { status: 204 });
        })
      );
      const token = makeTestJwt({ role: 'user' });
      setAccessToken(token);

      // gcTime 0이면 옵저버 없는 시드 캐시가 즉시 GC돼 clear() 검증이 무의미해진다
      const { wrapper, queryClient } = createAuthWrapper(
        createTestQueryClient({ gcTime: Infinity })
      );
      queryClient.setQueryData(['services'], { data: [] });
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      // 서버 무효화 요청에 액세스 토큰이 실렸다
      expect(authHeader).toBe(`Bearer ${token}`);
      // 로컬 토큰·상태·캐시가 모두 정리됐다
      expect(getAccessToken()).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.accessToken).toBeNull();
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    });

    it('서버 무효화가 실패해도 클라이언트는 로그아웃된다', async () => {
      server.use(
        http.post(`${BASE_URL}/auth/logout`, () =>
          HttpResponse.json({ message: 'error' }, { status: 500 })
        )
      );
      setAccessToken(makeTestJwt({ role: 'user' }));

      const { wrapper, queryClient } = createAuthWrapper(
        createTestQueryClient({ gcTime: Infinity })
      );
      queryClient.setQueryData(['services'], { data: [] });
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(getAccessToken()).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    });
  });

  it('AuthProvider 밖에서 호출하면 에러를 던진다', () => {
    // React의 콘솔 중복 출력과 jsdom의 uncaught error 리포팅을 잠시 막는다
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const suppressJsdomReport = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener('error', suppressJsdomReport);

    try {
      expect(() => renderHook(() => useAuth())).toThrow(
        'useAuth must be used within an AuthProvider'
      );
    } finally {
      window.removeEventListener('error', suppressJsdomReport);
      consoleError.mockRestore();
    }
  });
});
