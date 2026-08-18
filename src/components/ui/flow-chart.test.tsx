import '@/test/mocks/innogrid-ui';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ReactFlowProvider, type Edge } from '@xyflow/react';
import { installXyflowStubs } from '@/test/utils/xyflow-stubs';
import { resetWorkflowStore } from '@/test/utils/reset-workflow-store';
import { createWorkflowNodeData } from '@/components/features/workflow/workflow-editor/workflow-node-defaults';
import { useWorkflowStore, type WorkflowNode } from '@/store/useWorkflowStore';
import { FlowChart } from './flow-chart';

installXyflowStubs();

// START/END 노드는 렌더 시 API 훅을 호출하지 않는다 (MODEL/KNOWLEDGE_BASE는 호출 — MSW 핸들러 필요)
const initialNodes: WorkflowNode[] = [
  { id: 'a', type: 'START', position: { x: 0, y: 0 }, data: createWorkflowNodeData('START') },
  { id: 'b', type: 'END', position: { x: 300, y: 0 }, data: createWorkflowNodeData('END') },
];
const initialEdges: Edge[] = [{ id: 'e1', source: 'a', target: 'b' }];

const renderFlowChart = () =>
  render(
    <ReactFlowProvider>
      <FlowChart initialNodes={initialNodes} initialEdges={initialEdges} />
    </ReactFlowProvider>
  );

describe('FlowChart 엣지 컨텍스트 메뉴', () => {
  beforeEach(() => {
    resetWorkflowStore();
  });

  // 노드 액션 메뉴(목)에도 "삭제" menuitem이 있으므로 엣지 메뉴 안에서만 조회한다
  it('엣지 우클릭 시 삭제 버튼이 나타나고, 클릭하면 엣지가 제거된다', async () => {
    renderFlowChart();

    const edge = await screen.findByLabelText('Edge from a to b');
    fireEvent.contextMenu(edge);

    const edgeMenu = screen.getByRole('menu', { name: '엣지 메뉴' });
    fireEvent.click(within(edgeMenu).getByRole('menuitem', { name: '삭제' }));

    expect(useWorkflowStore.getState().edges).toEqual([]);
    expect(screen.queryByRole('menu', { name: '엣지 메뉴' })).not.toBeInTheDocument();
  });

  it('메뉴 밖을 클릭하면 삭제 없이 메뉴가 닫힌다', async () => {
    renderFlowChart();

    const edge = await screen.findByLabelText('Edge from a to b');
    fireEvent.contextMenu(edge);
    expect(screen.getByRole('menu', { name: '엣지 메뉴' })).toBeInTheDocument();

    fireEvent.click(document.body);

    expect(screen.queryByRole('menu', { name: '엣지 메뉴' })).not.toBeInTheDocument();
    expect(useWorkflowStore.getState().edges).toHaveLength(1);
  });
});
