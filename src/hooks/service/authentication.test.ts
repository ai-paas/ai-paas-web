import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { createHookWrapper } from '@/test/utils/test-utils';
import { setAccessToken } from '@/lib/api';
import { useLogout } from './authentication';

const wrapper = createHookWrapper();

describe('useLogout', () => {
  it('액세스 토큰을 Authorization 헤더에 담아 POST /auth/logout 을 호출한다', async () => {
    let authHeader: string | null = null;
    server.use(
      http.post(`${BASE_URL}/auth/logout`, ({ request }) => {
        authHeader = request.headers.get('Authorization');
        return new HttpResponse(null, { status: 204 });
      })
    );
    setAccessToken('test-token');

    const { result } = renderHook(() => useLogout(), { wrapper });
    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(authHeader).toBe('Bearer test-token');
  });

  it('서버 에러 시 isError 가 true 가 된다', async () => {
    server.use(
      http.post(`${BASE_URL}/auth/logout`, () =>
        HttpResponse.json({ message: 'error' }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useLogout(), { wrapper });
    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error?.message).toContain('500');
  });
});
