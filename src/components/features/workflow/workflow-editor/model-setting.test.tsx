import '@/test/mocks/innogrid-ui';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, renderWithUser, screen, waitFor } from '@/test/utils/test-utils';
import { resetWorkflowStore } from '@/test/utils/reset-workflow-store';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { ModelSetting } from './model-setting';
import { workflowToFlow } from './workflow-to-flow';

// 워크플로우 수정 진입 경로 그대로 재현: API 응답 → workflowToFlow → 스토어 로드 → 노드 선택.
// 저장 정의에는 모델 유형(custom/catalog)이 없으므로 type이 미지정인 노드가 만들어진다.
const loadSavedModelNode = (model_id: number) => {
  const { nodes, edges } = workflowToFlow({
    components: [
      {
        id: 'model-1',
        workflow_id: 'wf-1',
        component_id: 'MODEL',
        name: '모델',
        type: 'MODEL',
        model_id,
      },
    ],
  });

  useWorkflowStore.getState().setInitialData(nodes, edges);
  useWorkflowStore.getState().selectNode('model-1');
};

describe('ModelSetting — 수정 진입 시 모델 유형·선택값 복원', () => {
  beforeEach(() => {
    resetWorkflowStore();
  });

  // 회귀: 카탈로그 모델을 쓴 워크플로우를 수정하면 유형이 '커스텀 모델'로 고정되어
  // 선택된 모델이 보이지 않던 버그 (type을 'custom'으로 하드코딩해 역직렬화하던 문제)
  it('카탈로그 모델로 저장된 노드는 유형과 선택된 모델이 함께 복원된다', async () => {
    loadSavedModelNode(21); // mockModelCatalogs의 '카탈로그 모델 A'

    render(<ModelSetting />);

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: '모델 카탈로그' })).toBeChecked();
    });
    expect(screen.getByDisplayValue('카탈로그 모델 A')).toBeInTheDocument();
  });

  it('커스텀 모델로 저장된 노드는 커스텀 모델 유형으로 복원된다', async () => {
    loadSavedModelNode(11); // mockCustomModels의 '커스텀 모델 A'

    render(<ModelSetting />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('커스텀 모델 A')).toBeInTheDocument();
    });
    expect(screen.getByRole('radio', { name: '커스텀 모델' })).toBeChecked();
  });

  it('어느 목록에도 없는 model_id는 기본 유형(커스텀 모델)에 빈 선택으로 둔다', async () => {
    loadSavedModelNode(999);

    render(<ModelSetting />);

    // 목록 로드가 끝난 뒤에도 유형은 기본값을 유지하고 선택은 비어 있다
    await waitFor(() => {
      expect(screen.getByRole('option', { name: '커스텀 모델 A' })).toBeInTheDocument();
    });
    expect(screen.getByRole('radio', { name: '커스텀 모델' })).toBeChecked();
    expect(screen.queryByDisplayValue('카탈로그 모델 A')).not.toBeInTheDocument();
  });

  it('유형을 직접 바꾸면 역추론보다 사용자가 선택한 유형이 우선한다', async () => {
    loadSavedModelNode(21);

    const { user } = renderWithUser(<ModelSetting />);

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: '모델 카탈로그' })).toBeChecked();
    });

    await user.click(screen.getByRole('radio', { name: '커스텀 모델' }));

    expect(screen.getByRole('radio', { name: '커스텀 모델' })).toBeChecked();
    // 커스텀 목록에는 21이 없으므로 선택이 비워진다
    expect(screen.queryByDisplayValue('카탈로그 모델 A')).not.toBeInTheDocument();
  });
});
