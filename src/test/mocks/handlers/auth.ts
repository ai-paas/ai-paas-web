import { http, HttpResponse } from 'msw';
import { BASE_URL } from './base';

export const authHandlers = [
  // POST /auth/refresh - 액세스 토큰 재발급
  // (api.ts beforeRequest가 메모리에 토큰이 없으면 항상 먼저 호출하는 경로)
  http.post(`${BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({ access_token: 'test-access-token' });
  }),

  // POST /auth/login - 로그인 (useLogin은 ky가 아닌 raw fetch 사용)
  http.post(`${BASE_URL}/auth/login`, () => {
    return HttpResponse.json({
      access_token: 'login-access-token',
      token_type: 'bearer',
      expires_in: 3600,
    });
  }),

  // POST /auth/logout - 리프레시 토큰 무효화 (로그아웃)
  http.post(`${BASE_URL}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
