import '@/test/mocks/innogrid-ui';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderWithUser, screen, waitFor } from '@/test/utils/test-utils';
import { BASE_URL, mockWorkflow } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';
import { resetWorkflowStore } from '@/test/utils/reset-workflow-store';
import { useWorkflowStore, type WorkflowNode } from '@/store/useWorkflowStore';
import type { UpdateWorkflowRequest } from '@/types/workflow';
import { UpdateWorkflowButton } from './update-workflow-button';

type UpdateBody = Omit<UpdateWorkflowRequest, 'workflowId'>;

const makeNode = (id: string, type: WorkflowNode['type']): WorkflowNode => ({
  id,
  type,
  position: { x: 0, y: 0 },
  data: { label: id, text: '' },
});

const defaultProps = {
  workflowId: 'wf-001',
  status: 'DRAFT',
  serviceId: 'srv-001',
  category: '기존 카테고리',
  description: '기존 설명',
} as const;

describe('UpdateWorkflowButton', () => {
  beforeEach(() => {
    resetWorkflowStore();
    useWorkflowStore
      .getState()
      .setInitialData(
        [makeNode('start-1', 'START'), makeNode('end-1', 'END')],
        [{ id: 'e1', source: 'start-1', target: 'end-1' }]
      );
    useWorkflowStore.getState().setName('기존 워크플로우');
  });

  describe('렌더링', () => {
    it('"수정" 버튼이 렌더링되고 초기에는 모달이 없다', () => {
      renderWithUser(<UpdateWorkflowButton {...defaultProps} />);

      expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('모달 인터랙션', () => {
    it('수정 버튼 클릭 시 기존 이름·서비스·카테고리·설명이 채워진 모달이 열린다', async () => {
      const { user } = renderWithUser(<UpdateWorkflowButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '수정' }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('워크플로우 수정')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('워크플로우 이름을 입력해주세요.')).toHaveValue(
        '기존 워크플로우'
      );
      expect(screen.getByPlaceholderText('카테고리를 입력해주세요.')).toHaveValue('기존 카테고리');
      expect(screen.getByPlaceholderText('설명을 입력해주세요.')).toHaveValue('기존 설명');
      // 서비스 목록은 비동기 로드 후 기존 서비스가 선택된다
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveValue('srv-001');
      });
    });

    it('취소 버튼 클릭 시 모달이 닫힌다', async () => {
      const { user } = renderWithUser(<UpdateWorkflowButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '수정' }));
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
        http.put(`${BASE_URL}/workflows/:surro_workflow_id`, () => {
          requestSpy();
          return HttpResponse.json(mockWorkflow);
        })
      );
      const { user } = renderWithUser(<UpdateWorkflowButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '수정' }));
      await user.clear(screen.getByPlaceholderText('워크플로우 이름을 입력해주세요.'));
      await user.click(screen.getByRole('button', { name: '확인' }));

      expect(await screen.findByText('이름은 필수입니다.')).toBeInTheDocument();
      expect(requestSpy).not.toHaveBeenCalled();
    });
  });

  describe('폼 제출', () => {
    it('수정한 값과 캔버스 정의가 PUT 요청 바디에 담기고 모달이 닫힌다', async () => {
      let captured: UpdateBody | undefined;
      server.use(
        http.put(`${BASE_URL}/workflows/:surro_workflow_id`, async ({ request }) => {
          captured = (await request.json()) as UpdateBody;
          return HttpResponse.json(mockWorkflow);
        })
      );
      const { user } = renderWithUser(<UpdateWorkflowButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '수정' }));
      // 서비스 옵션 로드 대기 후 다른 서비스로 변경
      await waitFor(() => {
        expect(screen.getByRole('option', { name: '테스트 서비스 2' })).toBeInTheDocument();
      });
      await user.selectOptions(screen.getByRole('combobox'), 'srv-002');

      const nameInput = screen.getByPlaceholderText('워크플로우 이름을 입력해주세요.');
      await user.clear(nameInput);
      await user.type(nameInput, '수정된 워크플로우');

      const categoryInput = screen.getByPlaceholderText('카테고리를 입력해주세요.');
      await user.clear(categoryInput);
      await user.type(categoryInput, '새 카테고리');

      const descriptionInput = screen.getByPlaceholderText('설명을 입력해주세요.');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, '새 설명');

      await user.click(screen.getByRole('button', { name: '확인' }));

      await waitFor(() => {
        expect(captured).toBeDefined();
      });
      expect(captured?.name).toBe('수정된 워크플로우');
      expect(captured?.service_id).toBe('srv-002');
      expect(captured?.category).toBe('새 카테고리');
      expect(captured?.description).toBe('새 설명');
      expect(captured?.status).toBe('DRAFT');
      expect(captured?.workflow_definition?.components.map((c) => c.ref_id)).toEqual([
        'start-1',
        'end-1',
      ]);
      expect(captured?.workflow_definition?.connections).toEqual([
        { source_ref_id: 'start-1', target_ref_id: 'end-1' },
      ]);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      // 성공 시 캔버스 이름도 최종 입력값으로 동기화된다
      expect(useWorkflowStore.getState().name).toBe('수정된 워크플로우');
    });

    it('카테고리·설명을 비우면 빈 문자열로 전송되어 기존 값을 지울 수 있다', async () => {
      let captured: UpdateBody | undefined;
      server.use(
        http.put(`${BASE_URL}/workflows/:surro_workflow_id`, async ({ request }) => {
          captured = (await request.json()) as UpdateBody;
          return HttpResponse.json(mockWorkflow);
        })
      );
      const { user } = renderWithUser(<UpdateWorkflowButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '수정' }));
      await user.clear(screen.getByPlaceholderText('카테고리를 입력해주세요.'));
      await user.clear(screen.getByPlaceholderText('설명을 입력해주세요.'));
      await user.click(screen.getByRole('button', { name: '확인' }));

      await waitFor(() => {
        expect(captured).toBeDefined();
      });
      expect(captured?.category).toBe('');
      expect(captured?.description).toBe('');
    });
  });
});
