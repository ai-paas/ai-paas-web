import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { HTTPError, type NormalizedOptions } from 'ky';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { createHookWrapper, createTestQueryClient } from '@/test/utils/test-utils';
import { queryKeys } from '@/lib/query-keys';
import {
  isExecuteTimeoutError,
  useFinalizeWorkflowCleanup,
  useGetTemplates,
  useGetWorkflow,
  useGetWorkflowStatus,
  useGetWorkflowTemplate,
  useUpdateComponentDeployStatus,
} from './workflows';

// fake timers 아래에서 ms만큼 진행한 뒤, 응답 반영까지 1ms flush로 소진한다.
// - RTL waitFor는 내부적으로 실제 setTimeout에 의존해 fake timers와 함께 쓸 수 없다.
// - flush가 0ms가 아니라 1ms인 이유: 응답 체인의 setTimeout(cb, 0)이 fake clock에서
//   1ms로 클램프되어, 0ms 진행으로는 만료 시각에 영원히 도달하지 못한다.
const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
  }
};

describe('workflows hooks', () => {
  describe('OpenAPI 요청 계약', () => {
    it('템플릿 목록 요청은 명세의 page, size, category만 전송한다', async () => {
      let requestUrl: URL | undefined;
      server.use(
        http.get(`${BASE_URL}/workflows/templates`, ({ request }) => {
          requestUrl = new URL(request.url);
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      const { result } = renderHook(() => useGetTemplates({ page: 2, size: 20, category: 'rag' }), {
        wrapper: createHookWrapper(createTestQueryClient()),
      });

      await waitFor(() => expect(result.current.isPending).toBe(false));

      expect(requestUrl?.searchParams.get('page')).toBe('2');
      expect(requestUrl?.searchParams.get('size')).toBe('20');
      expect(requestUrl?.searchParams.get('category')).toBe('rag');
      expect(requestUrl?.searchParams.has('sort')).toBe(false);
    });

    it('컴포넌트 배포 상태 요청 본문에서 경로 식별자를 제외한다', async () => {
      let requestBody: unknown;
      server.use(
        http.post(
          `${BASE_URL}/workflows/:workflowId/components/:componentId/deployment-status`,
          async ({ request }) => {
            requestBody = await request.json();
            return HttpResponse.json({ message: 'updated' });
          }
        )
      );

      const { result } = renderHook(() => useUpdateComponentDeployStatus(), {
        wrapper: createHookWrapper(createTestQueryClient()),
      });

      act(() => {
        result.current.updateComponentDeployStatus({
          surro_workflow_id: 'workflow-1',
          component_id: 'component-1',
          service_name: 'model-service',
          service_hostname: 'model-service.default.svc',
          model_name: 'model-a',
          status: 'ready',
          internal_url: 'http://model-service.default.svc',
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(requestBody).toEqual({
        service_name: 'model-service',
        service_hostname: 'model-service.default.svc',
        model_name: 'model-a',
        status: 'ready',
        internal_url: 'http://model-service.default.svc',
      });
    });
  });

  // ============================================
  // a3dd1d4 회귀 방지 — 템플릿/워크플로우 detail 캐시 비충돌
  // ============================================
  describe('템플릿/워크플로우 detail 캐시 비충돌', () => {
    it('같은 id로 조회해도 워크플로우 상세와 템플릿 상세가 서로 캐시를 덮어쓰지 않는다', async () => {
      // a3dd1d4 이전에는 useGetWorkflowTemplate이 workflows.detail(id) 키를 공유해
      // 같은 id의 워크플로우 상세 캐시를 템플릿 응답으로 덮어썼다.
      const queryClient = createTestQueryClient();
      const { result } = renderHook(
        () => ({
          workflow: useGetWorkflow('shared-id'),
          template: useGetWorkflowTemplate('shared-id'),
        }),
        { wrapper: createHookWrapper(queryClient) }
      );

      await waitFor(() => {
        expect(result.current.workflow.isPending).toBe(false);
        expect(result.current.template.isPending).toBe(false);
      });

      expect(result.current.workflow.workflow?.name).toBe('테스트 워크플로우');
      expect(result.current.template.workflowTemplate?.name).toBe('테스트 템플릿');

      // 캐시에도 서로 다른 두 엔트리로 존재한다
      expect(queryClient.getQueryData(queryKeys.workflows.detail('shared-id'))).toBeDefined();
      expect(
        queryClient.getQueryData(queryKeys.workflows.templates.detail('shared-id'))
      ).toBeDefined();
    });

    it('템플릿 네임스페이스 무효화가 워크플로우 detail을 건드리지 않는다', async () => {
      const queryClient = createTestQueryClient();
      const { result } = renderHook(
        () => ({
          workflow: useGetWorkflow('shared-id'),
          template: useGetWorkflowTemplate('shared-id'),
        }),
        { wrapper: createHookWrapper(queryClient) }
      );

      await waitFor(() => {
        expect(result.current.workflow.isPending).toBe(false);
        expect(result.current.template.isPending).toBe(false);
      });

      await act(async () => {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.workflows.templates.all,
          refetchType: 'none',
        });
      });

      expect(
        queryClient.getQueryState(queryKeys.workflows.templates.detail('shared-id'))?.isInvalidated
      ).toBe(true);
      expect(
        queryClient.getQueryState(queryKeys.workflows.detail('shared-id'))?.isInvalidated
      ).toBe(false);
    });
  });

  // ============================================
  // useGetWorkflowStatus — 7초 폴링 (fake timers)
  // ============================================
  describe('useGetWorkflowStatus 폴링', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    const deployingResponse = (deploying: boolean) => ({
      workflow_id: 'wf-1',
      status: deploying ? 'DRAFT' : 'ACTIVE',
      deployed_models: [
        {
          component_id: 'comp-1',
          service_name: 'svc-1',
          model_name: '모델 A',
          sanitized_model_name: 'model-a',
          deployment_type: 'KSERVE',
          status: deploying ? 'DEPLOYING' : 'DEPLOYED',
        },
      ],
    });

    it('배포 중이면 7초 간격으로 재조회하고 배포가 끝나면 폴링을 멈춘다', async () => {
      let callCount = 0;
      server.use(
        http.get(`${BASE_URL}/workflows/:id/status`, () => {
          callCount += 1;
          return HttpResponse.json(deployingResponse(callCount < 3));
        })
      );

      const { result } = renderHook(() => useGetWorkflowStatus('wf-1', { polling: true }), {
        wrapper: createHookWrapper(createTestQueryClient()),
      });

      await advance(0);
      expect(callCount).toBe(1);
      expect(result.current.isDeploying).toBe(true);

      await advance(7000);
      expect(callCount).toBe(2);
      expect(result.current.isDeploying).toBe(true);

      await advance(7000);
      expect(callCount).toBe(3);
      expect(result.current.isDeploying).toBe(false);

      // 배포 완료 후에는 7초가 여러 번 지나도 재조회하지 않는다
      await advance(21000);
      expect(callCount).toBe(3);
    });

    it('PENDING 상태의 모델도 배포 중으로 판정해 폴링을 계속한다', async () => {
      let callCount = 0;
      server.use(
        http.get(`${BASE_URL}/workflows/:id/status`, () => {
          callCount += 1;
          return HttpResponse.json({
            workflow_id: 'wf-1',
            status: 'DRAFT',
            deployed_models: [
              {
                component_id: 'comp-1',
                service_name: 'svc-1',
                model_name: '모델 A',
                sanitized_model_name: 'model-a',
                deployment_type: 'KSERVE',
                status: 'PENDING',
              },
            ],
          });
        })
      );

      const { result } = renderHook(() => useGetWorkflowStatus('wf-1', { polling: true }), {
        wrapper: createHookWrapper(createTestQueryClient()),
      });

      await advance(0);
      expect(result.current.isDeploying).toBe(true);

      await advance(7000);
      expect(callCount).toBe(2);
    });

    it('polling 옵션이 없으면 배포 중이어도 재조회하지 않는다', async () => {
      let callCount = 0;
      server.use(
        http.get(`${BASE_URL}/workflows/:id/status`, () => {
          callCount += 1;
          return HttpResponse.json(deployingResponse(true));
        })
      );

      const { result } = renderHook(() => useGetWorkflowStatus('wf-1'), {
        wrapper: createHookWrapper(createTestQueryClient()),
      });

      await advance(0);
      expect(callCount).toBe(1);
      expect(result.current.isDeploying).toBe(true);

      await advance(30000);
      expect(callCount).toBe(1);
    });
  });

  // ============================================
  // useFinalizeWorkflowCleanup — 3초 폴링 (fake timers)
  // ============================================
  describe('useFinalizeWorkflowCleanup 폴링', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('in_progress인 동안 3초 간격으로 재확인하고 completed가 되면 멈춘다', async () => {
      let callCount = 0;
      server.use(
        http.post(`${BASE_URL}/workflows/:id/finalize-cleanup`, () => {
          callCount += 1;
          return HttpResponse.json({
            workflow_id: 'wf-1',
            status: callCount < 3 ? 'in_progress' : 'completed',
          });
        })
      );

      const { result } = renderHook(
        () => useFinalizeWorkflowCleanup({ surro_workflow_id: 'wf-1', enabled: true }),
        { wrapper: createHookWrapper(createTestQueryClient()) }
      );

      await advance(0);
      expect(callCount).toBe(1);
      expect(result.current.status).toBe('in_progress');
      expect(result.current.isPolling).toBe(true);

      await advance(3000);
      expect(callCount).toBe(2);
      expect(result.current.isPolling).toBe(true);

      await advance(3000);
      expect(callCount).toBe(3);
      expect(result.current.status).toBe('completed');
      expect(result.current.isPolling).toBe(false);

      // 완료 후에는 폴링하지 않는다
      await advance(9000);
      expect(callCount).toBe(3);
    });

    it('failed가 되면 폴링을 멈춘다', async () => {
      let callCount = 0;
      server.use(
        http.post(`${BASE_URL}/workflows/:id/finalize-cleanup`, () => {
          callCount += 1;
          return HttpResponse.json({
            workflow_id: 'wf-1',
            status: 'failed',
            message: '리소스 정리 실패',
          });
        })
      );

      const { result } = renderHook(
        () => useFinalizeWorkflowCleanup({ surro_workflow_id: 'wf-1', enabled: true }),
        { wrapper: createHookWrapper(createTestQueryClient()) }
      );

      await advance(0);
      expect(result.current.status).toBe('failed');
      expect(result.current.result?.message).toBe('리소스 정리 실패');
      expect(result.current.isPolling).toBe(false);

      await advance(9000);
      expect(callCount).toBe(1);
    });

    it('enabled가 false거나 workflowId가 없으면 요청하지 않는다', async () => {
      const requestSpy = vi.fn();
      server.use(
        http.post(`${BASE_URL}/workflows/:id/finalize-cleanup`, () => {
          requestSpy();
          return HttpResponse.json({ workflow_id: 'wf-1', status: 'completed' });
        })
      );

      renderHook(
        () => ({
          disabled: useFinalizeWorkflowCleanup({ surro_workflow_id: 'wf-1', enabled: false }),
          noId: useFinalizeWorkflowCleanup({ surro_workflow_id: undefined, enabled: true }),
        }),
        { wrapper: createHookWrapper(createTestQueryClient()) }
      );

      await advance(1000);
      expect(requestSpy).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // isExecuteTimeoutError — 실제 ky HTTPError로 검증 (목킹 시 instanceof가 깨진다)
  // ============================================
  describe('isExecuteTimeoutError', () => {
    const createHttpError = (body: string | null, status = 500) =>
      new HTTPError(
        new Response(body, { status }),
        new Request('http://localhost/x'),
        {} as NormalizedOptions
      );

    it.each([
      ['빈 문자열 detail', JSON.stringify({ detail: '' })],
      ['null detail', JSON.stringify({ detail: null })],
      ['detail 없는 본문', JSON.stringify({})],
    ])('500 응답이고 detail이 비어 있으면(%s) 타임아웃으로 판정한다', async (_label, body) => {
      await expect(isExecuteTimeoutError(createHttpError(body))).resolves.toBe(true);
    });

    it('500 응답이라도 detail에 내용이 있으면 타임아웃이 아니다', async () => {
      const error = createHttpError(JSON.stringify({ detail: 'DB connection lost' }));

      await expect(isExecuteTimeoutError(error)).resolves.toBe(false);
    });

    it('500이 아닌 상태 코드는 타임아웃이 아니다', async () => {
      const error = createHttpError(JSON.stringify({ detail: '' }), 422);

      await expect(isExecuteTimeoutError(error)).resolves.toBe(false);
    });

    it('본문이 JSON이 아니면 타임아웃이 아니다', async () => {
      const error = createHttpError('Internal Server Error');

      await expect(isExecuteTimeoutError(error)).resolves.toBe(false);
    });

    it.each([
      ['일반 Error', new Error('network')],
      ['null', null],
      ['undefined', undefined],
    ])('HTTPError가 아닌 값(%s)은 타임아웃이 아니다', async (_label, value) => {
      await expect(isExecuteTimeoutError(value)).resolves.toBe(false);
    });
  });
});
