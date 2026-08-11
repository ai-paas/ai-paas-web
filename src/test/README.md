# 테스트 작성 가이드

> 전체 로드맵과 우선순위는 루트의 [TEST_PLAN.md](../../TEST_PLAN.md) 참고.
> **신규 훅·CRUD 버튼/폼 컴포넌트·순수 함수는 테스트를 동반한다** (PR 템플릿 체크 항목).

## 실행

```bash
pnpm test            # watch 모드
pnpm test:coverage   # 커버리지 + 임계값 게이트 (CI가 실행하는 명령)
```

- 타임존은 `Asia/Seoul`로 고정되어 있다 (vitest.config.ts `test.env.TZ`) — 날짜 기대값을 로컬 TZ에 의존해도 CI와 동일.
- 커버리지 임계값은 **래칫**: 커버리지가 오르면 vitest.config.ts의 thresholds도 올린다. 내리는 변경은 금지.

## 렌더 헬퍼 (`@/test/utils/test-utils`)

```tsx
import { render, renderWithUser, screen, waitFor } from '@/test/utils/test-utils';

// 기본: QueryClient + MemoryRouter 래핑, queryClient 반환 (캐시 무효화 검증용)
const { queryClient } = render(<MyComponent />);

// 상호작용 테스트 기본형 — userEvent.setup() 포함
const { user } = renderWithUser(<MyComponent />);
await user.click(screen.getByRole('button', { name: '생성' }));

// URL 파라미터 페이지 (useParams)
render(<ServiceDetailPage />, { route: '/service/srv-001', path: '/service/:id' });

// useAuth를 쓰는 컴포넌트 (layout, dashboard, menu 등) — 렌더 전에 role 토큰 주입
render(<DashboardPage />, { auth: 'admin' });  // 'user' | 'admin' | { token }
```

- 훅 테스트는 `renderHook(() => useMyHook(), { wrapper: createHookWrapper() })`.
- `makeTestJwt({ role: 'admin' })`로 `parseJwt` 호환 토큰을 직접 만들 수 있다 (payload는 ASCII만).

## MSW (API 목킹)

- 핸들러는 `src/test/mocks/handlers/<도메인>.ts`로 분리하고 `handlers.ts` 배럴에 합친다.
- URL은 반드시 `handlers/base.ts`의 `BASE_URL` 사용 — 하드코딩 금지.
- `onUnhandledRequest: 'error'` — **핸들러 없는 도메인의 요청은 테스트가 즉시 실패한다.**
  새 도메인 테스트 전에 핸들러부터 추가할 것 (`/auth/refresh`는 이미 있음 — AuthProvider가 항상 호출).
- 개별 테스트에서 에러 응답 등 오버라이드:

```ts
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';

const requestSpy = vi.fn(); // "호출되지 않았다" 검증에 사용
server.use(
  http.post(`${BASE_URL}/services`, () => {
    requestSpy();
    return HttpResponse.json({ message: 'error' }, { status: 500 });
  })
);
```

## @innogrid/ui — 실제 렌더 vs 경량 목

실제 컴포넌트가 jsdom에서 동작한다 (`server.deps.inline` + 전역 스텁, `innogrid-ui-smoke.test.tsx`가 보증). 선택 기준:

| 상황 | 선택 |
|---|---|
| 페이지/Table/Select/SearchInput 등 실제 동작 검증 | **실제 렌더** + `installDomMeasurementStubs()` (가상화 테이블·Tooltip이 크기 측정에 의존) |
| CRUD 버튼·폼처럼 Modal/Input 골격만 필요 | **경량 목**: `import '@/test/mocks/innogrid-ui';` (사이드이펙트 import — 빠짐 주의) |

- 목 import를 빠뜨리면 실제 라이브러리가 로드되어 원인 파악이 어려운 방식으로 실패할 수 있다.
- 목에 없는 export를 쓰는 컴포넌트를 렌더하면 undefined 렌더 에러 — 목을 확장하거나 실제 렌더로 전환.

## 자주 쓰는 패턴

```ts
// react-router 부분 목 (useNavigate 검증)
const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual<typeof import('react-router')>('react-router')),
  useNavigate: () => mockNavigate,
}));
```

- 테스트명은 한국어, `describe`로 섹션 구분 (기존 `create-service-button.test.tsx` 참고).
- `clearMocks: true` 전역 설정 — `beforeEach(vi.clearAllMocks)` 불필요.

## 상태 리셋 (전역 싱글턴 오염 방지)

- **api.ts 토큰**: setup-tests.ts의 afterEach가 `clearAccessToken()` 자동 호출. `@/lib/api`를 `vi.mock`할 경우 `clearAccessToken` export를 반드시 유지할 것 (setup이 호출한다).
- **useWorkflowStore**: 스토어를 쓰는 테스트 파일은 `beforeEach(() => resetWorkflowStore())` (`@/test/utils/reset-workflow-store`). test-utils에 넣지 않은 이유: @xyflow/react 로딩 비용 격리.

## jsdom 한계와 스텁

- 전역 스텁(setup-tests.ts): `matchMedia`, `ResizeObserver`.
- 크기 측정(가상화 테이블 등): `installDomMeasurementStubs()` — opt-in.
- XyFlow 캔버스: `installXyflowStubs()` — opt-in. **드래그·엣지 연결·팬·줌은 jsdom으로 불가** — E2E 영역 (TEST_PLAN.md Phase 4).
- `navigator.clipboard`, `URL.createObjectURL`, Monaco, WebSocket(xterm)도 jsdom 미지원 — 개별 스텁 또는 E2E.
