import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AuthProvider } from '@/hooks/useAuth';
import { setAccessToken } from '@/lib/api';
import type { ReactElement, ReactNode } from 'react';

// 테스트용 QueryClient 생성.
// 기본 gcTime 0은 옵저버 없는 캐시 엔트리를 즉시 GC하므로, setQueryData로 시드한
// 캐시의 무효화/제거를 검증하는 테스트는 { gcTime: Infinity }를 지정할 것.
export function createTestQueryClient({ gcTime = 0 }: { gcTime?: number } = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

const base64url = (value: object) =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/**
 * parseJwt(src/util/jwt.ts)로 디코딩 가능한 테스트용 JWT 생성.
 * btoa는 Latin1만 지원하므로 payload 값은 ASCII로 제한할 것.
 */
export function makeTestJwt(payload: Record<string, unknown> = {}) {
  return `${base64url({ alg: 'none', typ: 'JWT' })}.${base64url(payload)}.test-signature`;
}

interface WrapperProps {
  children: ReactNode;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** 초기 URL (MemoryRouter initialEntries). 기본 '/' */
  route?: string;
  /** useParams 의존 페이지용 라우트 패턴 (예: '/service/:id') — 지정 시 Routes/Route로 감싼다 */
  path?: string;
  /**
   * AuthProvider로 감싸고 role 클레임을 가진 토큰을 주입한다.
   * useAuth를 쓰는 컴포넌트(layout, dashboard, menu 등)에 필수.
   * 토큰은 setup-tests.ts의 afterEach(clearAccessToken)가 자동 정리한다.
   */
  auth?: 'user' | 'admin' | { token: string };
}

// 커스텀 렌더 함수 — queryClient를 반환하므로 캐시 무효화 검증에 사용할 수 있다
function customRender(
  ui: ReactElement,
  { route = '/', path, auth, ...options }: CustomRenderOptions = {}
) {
  if (auth) {
    // AuthProvider가 마운트 시점에 getAccessToken()을 읽으므로 렌더 전에 주입해야
    // refresh 호출 없이 동기적으로 인증 상태가 된다.
    setAccessToken(typeof auth === 'object' ? auth.token : makeTestJwt({ role: auth }));
  }

  const queryClient = createTestQueryClient();

  function Wrapper({ children }: WrapperProps) {
    const routed = path ? (
      <Routes>
        <Route path={path} element={children} />
      </Routes>
    ) : (
      children
    );

    const content = auth ? <AuthProvider>{routed}</AuthProvider> : routed;

    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{content}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}

// userEvent.setup()까지 묶은 렌더 헬퍼 — 상호작용 테스트의 기본형
function renderWithUser(ui: ReactElement, options?: CustomRenderOptions) {
  const user = userEvent.setup();
  return { user, ...customRender(ui, options) };
}

// renderHook용 래퍼
export function createHookWrapper(queryClient = createTestQueryClient()) {
  return function Wrapper({ children }: WrapperProps) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

export {
  screen,
  waitFor,
  within,
  fireEvent,
  act,
  renderHook,
  cleanup,
} from '@testing-library/react';
export { userEvent };
export { customRender as render, renderWithUser };
