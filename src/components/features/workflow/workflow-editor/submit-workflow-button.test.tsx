import '@/test/mocks/innogrid-ui';
import { toastOpenSpy } from '@/test/mocks/innogrid-ui';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderWithUser, screen, waitFor } from '@/test/utils/test-utils';
import { BASE_URL, mockWorkflow } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';
import { resetWorkflowStore } from '@/test/utils/reset-workflow-store';
import { useWorkflowStore, type WorkflowNode } from '@/store/useWorkflowStore';
import type { CreateWorkflowRequest } from '@/types/workflow';
import { SubmitWorkflowButton } from './submit-workflow-button';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual<typeof import('react-router')>('react-router')),
  useNavigate: () => mockNavigate,
}));

const makeNode = (id: string, type: WorkflowNode['type']): WorkflowNode => ({
  id,
  type,
  position: { x: 0, y: 0 },
  data: { label: id, text: '' },
});

describe('SubmitWorkflowButton', () => {
  beforeEach(() => {
    resetWorkflowStore();
    useWorkflowStore
      .getState()
      .setInitialData(
        [makeNode('start-1', 'START'), makeNode('end-1', 'END')],
        [{ id: 'e1', source: 'start-1', target: 'end-1' }]
      );
    useWorkflowStore.getState().setName('캔버스 워크플로우');
  });

  describe('렌더링', () => {
    it('"생성" 버튼이 렌더링되고 초기에는 모달이 없다', () => {
      renderWithUser(<SubmitWorkflowButton />);

      expect(screen.getByRole('button', { name: '생성' })).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('모달 인터랙션', () => {
    it('생성 클릭 시 캔버스 패널의 이름이 기본값으로 채워진 모달이 열린다', async () => {
      const { user } = renderWithUser(<SubmitWorkflowButton />);

      await user.click(screen.getByRole('button', { name: '생성' }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('워크플로우 생성')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('워크플로우 이름을 입력해주세요.')).toHaveValue(
        '캔버스 워크플로우'
      );
    });

    it('취소 버튼 클릭 시 모달이 닫힌다', async () => {
      const { user } = renderWithUser(<SubmitWorkflowButton />);

      await user.click(screen.getByRole('button', { name: '생성' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '취소' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('폼 검증', () => {
    it('이름을 비우고 제출하면 에러가 표시되고 요청이 발생하지 않는다', async () => {
      const requestSpy = vi.fn();
      server.use(
        http.post(`${BASE_URL}/workflows`, () => {
          requestSpy();
          return HttpResponse.json(mockWorkflow);
        })
      );
      const { user } = renderWithUser(<SubmitWorkflowButton />);

      await user.click(screen.getByRole('button', { name: '생성' }));
      await user.clear(screen.getByPlaceholderText('워크플로우 이름을 입력해주세요.'));
      await user.click(screen.getByRole('button', { name: '확인' }));

      expect(await screen.findByText('이름은 필수입니다.')).toBeInTheDocument();
      expect(requestSpy).not.toHaveBeenCalled();
    });
  });

  describe('폼 제출', () => {
    it('입력값(trim)과 캔버스 직렬화 정의가 POST 본문에 담기고 성공 시 목록으로 이동한다', async () => {
      let captured: CreateWorkflowRequest | undefined;
      server.use(
        http.post(`${BASE_URL}/workflows`, async ({ request }) => {
          captured = (await request.json()) as CreateWorkflowRequest;
          return HttpResponse.json(mockWorkflow);
        })
      );
      const { user } = renderWithUser(<SubmitWorkflowButton />);

      await user.click(screen.getByRole('button', { name: '생성' }));

      // 서비스 옵션 로드 대기 후 선택
      await waitFor(() => {
        expect(screen.getByRole('option', { name: '테스트 서비스 2' })).toBeInTheDocument();
      });
      await user.selectOptions(screen.getByRole('combobox'), 'srv-002');

      const nameInput = screen.getByPlaceholderText('워크플로우 이름을 입력해주세요.');
      await user.clear(nameInput);
      await user.type(nameInput, '  새 워크플로우  ');
      await user.type(screen.getByPlaceholderText('카테고리를 입력해주세요.'), 'RAG');
      await user.type(screen.getByPlaceholderText('설명을 입력해주세요.'), '새 설명');

      await user.click(screen.getByRole('button', { name: '확인' }));

      await waitFor(() => {
        expect(captured).toBeDefined();
      });
      expect(captured?.name).toBe('새 워크플로우');
      expect(captured?.service_id).toBe('srv-002');
      expect(captured?.category).toBe('RAG');
      expect(captured?.description).toBe('새 설명');
      // buildWorkflowDefinition까지 결합 검증 — 스토어의 노드/엣지가 직렬화되어 담긴다
      expect(captured?.workflow_definition?.components.map((c) => c.ref_id)).toEqual([
        'start-1',
        'end-1',
      ]);
      expect(captured?.workflow_definition?.connections).toEqual([
        { source_ref_id: 'start-1', target_ref_id: 'end-1' },
      ]);

      expect(toastOpenSpy).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'positive', title: '워크플로우 생성 성공' })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/workflow/workflow');
      // 캔버스 이름도 최종 입력값(trim)으로 동기화된다
      expect(useWorkflowStore.getState().name).toBe('새 워크플로우');
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('선택 필드를 비워 두면 본문에서 아예 제외된다', async () => {
      let captured: CreateWorkflowRequest | undefined;
      server.use(
        http.post(`${BASE_URL}/workflows`, async ({ request }) => {
          captured = (await request.json()) as CreateWorkflowRequest;
          return HttpResponse.json(mockWorkflow);
        })
      );
      const { user } = renderWithUser(<SubmitWorkflowButton />);

      await user.click(screen.getByRole('button', { name: '생성' }));
      await user.click(screen.getByRole('button', { name: '확인' }));

      await waitFor(() => {
        expect(captured).toBeDefined();
      });
      // undefined는 JSON 직렬화에서 빠지므로 키 자체가 없어야 한다
      expect(Object.keys(captured ?? {}).sort()).toEqual(['name', 'workflow_definition']);
      expect(captured?.name).toBe('캔버스 워크플로우');
    });

    it('생성 실패 시 서버 detail 메시지가 토스트로 표시되고 이동하지 않는다', async () => {
      server.use(
        http.post(`${BASE_URL}/workflows`, () =>
          HttpResponse.json({ detail: '워크플로우 정의가 올바르지 않습니다.' }, { status: 422 })
        )
      );
      const { user } = renderWithUser(<SubmitWorkflowButton />);

      await user.click(screen.getByRole('button', { name: '생성' }));
      await user.click(screen.getByRole('button', { name: '확인' }));

      await waitFor(() => {
        expect(toastOpenSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'negative',
            title: '워크플로우 생성 실패',
            children: '워크플로우 정의가 올바르지 않습니다.',
          })
        );
      });
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
