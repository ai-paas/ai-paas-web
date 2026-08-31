/**
 * 라우팅/인증 가드 통합 테스트 (TEST_PLAN 3A).
 *
 * 실제 routes(router.tsx)를 createMemoryRouter로 렌더해 main.tsx와 동일한 프로바이더
 * 구성(QueryClient > AuthProvider > ToastProvider > RouterProvider) 위에서
 * 세션 복원(/auth/refresh) → 가드 리다이렉트 → 실제 페이지 렌더까지 전체 흐름을 검증한다.
 *
 * 실제 @innogrid/ui를 렌더하므로(ServicePage의 Table 등) 경량 목을 import하지 않고
 * installDomMeasurementStubs()를 사용한다 (src/test/README.md 참고).
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@innogrid/ui';
import { HttpResponse, http } from 'msw';
import { routes } from './router';
import { AuthProvider } from '@/hooks/useAuth';
import { setAccessToken } from '@/lib/api';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { createTestQueryClient, makeTestJwt } from '@/test/utils/test-utils';
import { installDomMeasurementStubs } from '@/test/utils/dom-measure-stubs';

// 세션 복원 실패(리프레시 쿠키 없음/만료) 상태 시뮬레이션
const failRefresh = () =>
  server.use(
    http.post(`${BASE_URL}/auth/refresh`, () =>
      HttpResponse.json({ message: 'expired' }, { status: 401 })
    )
  );

// 라우터를 테스트에서 만들어 넘긴다 — 렌더 후 router.state.location으로 최종 경로를 단언
const createRouter = (initialEntry: string) =>
  createMemoryRouter(routes, { initialEntries: [initialEntry] });

function renderApp(router: ReturnType<typeof createRouter>) {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe('라우팅/인증 가드', () => {
  installDomMeasurementStubs();

  // 주의: 이 테스트는 파일 내에서 가장 먼저 실행되어야 한다 — routes의 lazy 모듈은
  // 한 번 로드되면 이후 테스트에서는 동기 렌더되어 fallback이 나타나지 않는다.
  it('lazy 페이지 최초 진입 시 Suspense fallback(로딩 스피너)이 먼저 렌더된다', async () => {
    failRefresh();
    renderApp(createRouter('/login'));

    // 동기 시점: LoginPage 청크 로드 전 — PageLoading이 표시된다
    expect(screen.getByRole('status', { name: '로딩 중' })).toBeInTheDocument();

    // 청크 로드가 끝나면 로그인 폼으로 대체된다
    expect(await screen.findByRole('button', { name: '로그인' })).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: '로딩 중' })).not.toBeInTheDocument();
  });

  it('비인증(refresh 실패) 상태로 보호 라우트 진입 시 /login으로 리다이렉트한다', async () => {
    failRefresh();
    const router = createRouter('/');
    renderApp(router);

    expect(await screen.findByRole('button', { name: '로그인' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('refresh 성공 시 세션을 복원해 보호 페이지를 레이아웃과 함께 렌더한다', async () => {
    const router = createRouter('/service');
    renderApp(router);

    // 기본 refresh 핸들러가 토큰을 발급 → 서비스 목록 페이지 + 데이터 렌더
    expect(await screen.findByRole('heading', { name: '서비스' })).toBeInTheDocument();
    expect(await screen.findByText('테스트 서비스 1')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/service');

    // 레이아웃(헤더·사이드바 메뉴)도 함께 렌더된다
    expect(screen.getByRole('button', { name: '내 계정' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '서비스' })).toBeInTheDocument();
  });

  it('인증 상태로 /login 진입 시 홈(/)을 거쳐 /service로 리다이렉트한다', async () => {
    // AuthProvider가 마운트 시점에 읽도록 렌더 전에 토큰 주입 (refresh 호출 없음)
    setAccessToken(makeTestJwt({ role: 'user' }));
    const router = createRouter('/login');
    renderApp(router);

    // LoginPage → Navigate('/') → HomePage → Navigate('/service') 체인
    expect(await screen.findByRole('heading', { name: '서비스' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/service');
    expect(screen.queryByRole('button', { name: '로그인' })).not.toBeInTheDocument();
  });
});
