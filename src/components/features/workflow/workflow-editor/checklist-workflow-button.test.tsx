import { toastOpenSpy } from '@/test/mocks/innogrid-ui';
import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderWithUser, screen, waitFor } from '@/test/utils/test-utils';
import { BASE_URL } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';
import { resetWorkflowStore } from '@/test/utils/reset-workflow-store';
import { useWorkflowStore, type WorkflowNode } from '@/store/useWorkflowStore';
import type { ValidateWorkflowRequest } from '@/types/workflow';
import { ChecklistWorkflowButton } from './checklist-workflow-button';

const makeNode = (id: string, type: WorkflowNode['type']): WorkflowNode => ({
  id,
  type,
  position: { x: 0, y: 0 },
  data: { label: id, text: '' },
});

describe('ChecklistWorkflowButton', () => {
  beforeEach(() => {
    resetWorkflowStore();
    useWorkflowStore
      .getState()
      .setInitialData(
        [makeNode('start-1', 'START'), makeNode('end-1', 'END')],
        [{ id: 'e1', source: 'start-1', target: 'end-1' }]
      );
  });

  it('클릭 시 캔버스 직렬화 정의가 검증 요청 본문에 담기고, 통과하면 성공 토스트가 뜬다', async () => {
    let captured: ValidateWorkflowRequest | undefined;
    server.use(
      http.post(`${BASE_URL}/workflows/validate`, async ({ request }) => {
        captured = (await request.json()) as ValidateWorkflowRequest;
        return HttpResponse.json({ valid: true, checks: [] });
      })
    );
    const { user } = renderWithUser(<ChecklistWorkflowButton />);

    await user.click(screen.getByRole('button', { name: '체크리스트' }));

    await waitFor(() => {
      expect(captured).toBeDefined();
    });
    expect(captured?.workflow_definition?.components.map((c) => c.ref_id)).toEqual([
      'start-1',
      'end-1',
    ]);
    expect(captured?.workflow_definition?.connections).toEqual([
      { source_ref_id: 'start-1', target_ref_id: 'end-1' },
    ]);
    expect(toastOpenSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'positive',
        title: '체크리스트 통과',
        children: '모든 검증 규칙을 통과했습니다.',
      })
    );
  });

  it('실패한 규칙만 "• 규칙: 메시지" 형식으로 모아 실패 토스트에 표시한다', async () => {
    server.use(
      http.post(`${BASE_URL}/workflows/validate`, () =>
        HttpResponse.json({
          valid: false,
          checks: [
            { rule: 'START_NODE', passed: false, message: '시작 노드가 없습니다.' },
            { rule: 'EDGE_CONNECTED', passed: true, message: null },
            { rule: 'END_NODE', passed: false, message: null },
          ],
        })
      )
    );
    const { user } = renderWithUser(<ChecklistWorkflowButton />);

    await user.click(screen.getByRole('button', { name: '체크리스트' }));

    await waitFor(() => {
      expect(toastOpenSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'negative',
          title: '체크리스트 실패',
          children: '• START_NODE: 시작 노드가 없습니다.\n• END_NODE',
        })
      );
    });
  });

  it('valid가 false인데 실패한 규칙이 없으면 기본 실패 문구가 표시된다', async () => {
    server.use(
      http.post(`${BASE_URL}/workflows/validate`, () =>
        HttpResponse.json({
          valid: false,
          checks: [{ rule: 'START_NODE', passed: true, message: null }],
        })
      )
    );
    const { user } = renderWithUser(<ChecklistWorkflowButton />);

    await user.click(screen.getByRole('button', { name: '체크리스트' }));

    await waitFor(() => {
      expect(toastOpenSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'negative',
          title: '체크리스트 실패',
          children: '검증에 실패했습니다.',
        })
      );
    });
  });

  it('검증 요청이 HTTP 에러로 실패하면 서버 detail 메시지가 표시된다', async () => {
    server.use(
      http.post(`${BASE_URL}/workflows/validate`, () =>
        HttpResponse.json({ detail: '워크플로우 정의 파싱 실패' }, { status: 422 })
      )
    );
    const { user } = renderWithUser(<ChecklistWorkflowButton />);

    await user.click(screen.getByRole('button', { name: '체크리스트' }));

    await waitFor(() => {
      expect(toastOpenSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'negative',
          title: '체크리스트 실패',
          children: '워크플로우 정의 파싱 실패',
        })
      );
    });
  });
});
