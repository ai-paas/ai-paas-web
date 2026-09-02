import type { Page as PlaywrightPage, Route } from '@playwright/test';
import type { Service } from '../../src/types/service';
import type { CreateWorkflowRequest, Workflow } from '../../src/types/workflow';

// MSW(src/test/mocks)와 같은 역할의 네트워크 목킹을 브라우저 밖(Playwright 라우트)에서 수행한다.
// 응답 형태는 실제 타입(src/types)을 import해 컴파일 타임에 드리프트를 잡는다.

/** parseJwt(src/util/jwt.ts)로 디코딩 가능한 가짜 JWT — 서명은 검증되지 않는다. */
const makeJwt = (payload: Record<string, unknown>) => {
  const base64url = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${base64url({ alg: 'none', typ: 'JWT' })}.${base64url(payload)}.e2e-signature`;
};

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

const emptyPage = { data: [], total: 0, page: 1, size: 10 };

const COMPONENT_TYPES = (['START', 'MODEL', 'KNOWLEDGE_BASE', 'END'] as const).map((type) => ({
  type,
  component_id: type,
  name: type,
  description: `${type} 컴포넌트`,
}));

export interface MockApi {
  /** 상태 조작: true면 POST /auth/refresh가 새 토큰을 반환한다(전체 페이지 로드 후 세션 유지). */
  setLoggedIn(loggedIn: boolean): void;
  /** POST /workflows로 들어온 요청 본문(생성 정의 단언용). */
  readonly createWorkflowRequests: CreateWorkflowRequest[];
  /** 목킹되지 않은 /api/v1 요청 — 테스트 종료 시 비어 있어야 한다(MSW onUnhandledRequest:'error'와 동일한 규약). */
  readonly unmockedRequests: string[];
}

/**
 * 모든 /api/v1 요청을 가로채 인메모리 상태로 응답한다. 실제 백엔드 불필요.
 * 스모크 여정(로그인 → 서비스 생성 → 워크플로우 생성)에 필요한 엔드포인트만 구현하고,
 * 그 외 요청은 500 + unmockedRequests 기록으로 시끄럽게 실패시킨다.
 */
export async function mockApi(page: PlaywrightPage): Promise<MockApi> {
  let loggedIn = false;
  const services: Service[] = [];
  const workflows: Workflow[] = [];
  const createWorkflowRequests: CreateWorkflowRequest[] = [];
  const unmockedRequests: string[] = [];

  const accessToken = () => makeJwt({ sub: 'e2e-user', role: 'user', exp: 4102444800 });

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const method = request.method();
    // 실제 훅은 도메인에 따라 `services`와 `services/`를 혼용한다.
    // API 서버처럼 끝 슬래시를 동등하게 취급해 목이 구현 세부사항에 깨지지 않게 한다.
    const path =
      new URL(request.url()).pathname.replace(/^\/api\/v1/, '').replace(/\/+$/, '') || '/';
    const match = (m: string, p: string) => method === m && path === p;

    // --- 인증 ---
    if (match('POST', '/auth/refresh')) {
      return loggedIn
        ? json(route, { access_token: accessToken() })
        : json(route, { detail: 'Unauthorized' }, 401);
    }
    if (match('POST', '/auth/login')) {
      loggedIn = true;
      return json(route, {
        access_token: accessToken(),
        refresh_token: 'e2e-refresh-token',
        token_type: 'bearer',
        expires_in: 3600,
      });
    }
    if (match('POST', '/auth/logout')) {
      loggedIn = false;
      return route.fulfill({ status: 204 });
    }

    // --- 서비스 ---
    if (match('GET', '/services')) {
      return json(route, { data: services, total: services.length, page: 1, size: 10 });
    }
    if (match('POST', '/services')) {
      const body = request.postDataJSON() as Pick<Service, 'name' | 'description' | 'tags'>;
      const service: Service = {
        id: services.length + 1,
        surro_service_id: `srv-e2e-${services.length + 1}`,
        created_by: 'e2e-user',
        created_at: '2026-08-31T00:00:00Z',
        updated_at: '2026-08-31T00:00:00Z',
        ...body,
      };
      services.push(service);
      return json(route, service, 201);
    }

    // --- 워크플로우 ---
    if (match('GET', '/workflows/component-types')) {
      return json(route, { data: COMPONENT_TYPES });
    }
    if (match('GET', '/workflows/templates')) {
      return json(route, { total: 0, items: [] });
    }
    if (match('GET', '/workflows')) {
      return json(route, { data: workflows, total: workflows.length, page: 1, size: 10 });
    }
    if (match('POST', '/workflows')) {
      const body = request.postDataJSON() as CreateWorkflowRequest;
      createWorkflowRequests.push(body);
      const workflow: Workflow = {
        id: workflows.length + 1,
        surro_workflow_id: `wf-e2e-${workflows.length + 1}`,
        created_at: '2026-08-31T00:00:00Z',
        updated_at: '2026-08-31T00:00:00Z',
        created_by: 'e2e-user',
        name: body.name,
        description: body.description ?? '',
        category: body.category ?? '',
        status: 'DRAFT',
        service_id: body.service_id ?? null,
        is_template: false,
        template_id: null,
      };
      workflows.push(workflow);
      return json(route, workflow);
    }
    if (match('POST', '/workflows/validate')) {
      return json(route, { valid: true, checks: [] });
    }

    // --- 캔버스 노드 콘텐츠가 참조하는 목록(빈 응답으로 충분) ---
    if (match('GET', '/models/custom-models')) return json(route, emptyPage);
    if (match('GET', '/models/model-catalog')) return json(route, emptyPage);
    if (match('GET', '/knowledge-bases')) return json(route, emptyPage);

    unmockedRequests.push(`${method} ${path}`);
    return json(route, { detail: `[e2e] 목킹되지 않은 요청: ${method} ${path}` }, 500);
  });

  return {
    setLoggedIn: (value) => {
      loggedIn = value;
    },
    createWorkflowRequests,
    unmockedRequests,
  };
}
