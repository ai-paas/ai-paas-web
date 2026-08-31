import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { createHookWrapper } from '@/test/utils/test-utils';
import { setAccessToken } from '@/lib/api';
import { useLogin, useLogout } from './authentication';

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

describe('useLogin', () => {
  // useLogin은 ky(api)가 아닌 raw fetch를 쓴다 — 토큰이 없는 상태에서
  // beforeRequest의 refresh 선행 호출 없이 곧바로 /auth/login에 도달해야 하기 때문.
  it('자격 증명을 JSON 본문으로 보내고 토큰 응답을 반환한다', async () => {
    let capturedBody: unknown;
    let contentType: string | null = null;
    server.use(
      http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
        capturedBody = await request.json();
        contentType = request.headers.get('Content-Type');
        return HttpResponse.json({
          access_token: 'login-access-token',
          refresh_token: 'login-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
        });
      })
    );

    const { result } = renderHook(() => useLogin(), { wrapper });
    const response = await result.current.mutateAsync({
      member_id: 'user-a',
      password: 'Password1!',
    });

    expect(capturedBody).toEqual({ member_id: 'user-a', password: 'Password1!' });
    expect(contentType).toBe('application/json');
    expect(response.access_token).toBe('login-access-token');
    expect(response.token_type).toBe('bearer');
  });

  it('에러 응답의 message를 에러 메시지로 사용한다', async () => {
    server.use(
      http.post(`${BASE_URL}/auth/login`, () =>
        HttpResponse.json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })
      )
    );

    const { result } = renderHook(() => useLogin(), { wrapper });

    await expect(
      result.current.mutateAsync({ member_id: 'user-a', password: 'wrong' })
    ).rejects.toThrow('아이디 또는 비밀번호가 올바르지 않습니다.');
  });

  it('에러 본문이 JSON이 아니면 HTTP 상태 코드 메시지로 폴백한다', async () => {
    server.use(
      http.post(
        `${BASE_URL}/auth/login`,
        () => new HttpResponse('Internal Server Error', { status: 500 })
      )
    );

    const { result } = renderHook(() => useLogin(), { wrapper });

    await expect(
      result.current.mutateAsync({ member_id: 'user-a', password: 'Password1!' })
    ).rejects.toThrow('HTTP 500');
  });

  it('에러 본문이 JSON이지만 message가 없으면 HTTP 상태 코드 메시지로 폴백한다', async () => {
    server.use(
      http.post(`${BASE_URL}/auth/login`, () =>
        HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
      )
    );

    const { result } = renderHook(() => useLogin(), { wrapper });

    await expect(
      result.current.mutateAsync({ member_id: 'user-a', password: 'wrong' })
    ).rejects.toThrow('HTTP 401');
  });
});
