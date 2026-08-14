import '@/test/mocks/innogrid-ui';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { resetWorkflowStore } from '@/test/utils/reset-workflow-store';
import { useWorkflowStore, type WorkflowNode } from '@/store/useWorkflowStore';
import { WorkflowNodeActionMenu } from './workflow-node-action-menu';

const makeNode = (id: string, overrides: Partial<WorkflowNode> = {}): WorkflowNode => ({
  id,
  type: 'MODEL',
  position: { x: 0, y: 0 },
  data: { label: `노드-${id}`, text: '' },
  ...overrides,
});

describe('WorkflowNodeActionMenu', () => {
  beforeEach(() => {
    resetWorkflowStore();
    useWorkflowStore
      .getState()
      .setInitialData(
        [makeNode('a'), makeNode('b')],
        [{ id: 'e1', source: 'a', target: 'b' }]
      );
  });

  it('⋯ 트리거 버튼과 복사/복제/삭제 메뉴, 단축키 힌트를 렌더링한다', () => {
    render(<WorkflowNodeActionMenu nodeId="a" />);

    expect(screen.getByRole('button', { name: '노드 메뉴' })).toBeInTheDocument();
    // 단축키 힌트는 aria-hidden — 접근성 이름은 메뉴명만 유지된다
    expect(screen.getByRole('menuitem', { name: '복사' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '복제' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '삭제' })).toBeInTheDocument();
    expect(screen.getByText('Ctrl+C')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+D')).toBeInTheDocument();
    expect(screen.getByText('Del')).toBeInTheDocument();
  });

  it('선택된 노드에서는 hover 없이도 버튼이 노출된다', () => {
    // 노출 여부가 래퍼 div의 Tailwind 클래스로만 드러나 시맨틱 쿼리가 불가능하다
    /* eslint-disable testing-library/no-node-access */
    const { container: unselected } = render(<WorkflowNodeActionMenu nodeId="a" />);
    expect((unselected.firstChild as HTMLElement).className).toContain('opacity-0');

    const { container: selected } = render(<WorkflowNodeActionMenu nodeId="a" selected />);
    expect((selected.firstChild as HTMLElement).className).toContain('opacity-100');
    /* eslint-enable testing-library/no-node-access */
  });

  it('복사를 클릭하면 해당 노드가 클립보드에 담긴다', async () => {
    const user = userEvent.setup();
    render(<WorkflowNodeActionMenu nodeId="a" />);

    await user.click(screen.getByRole('menuitem', { name: '복사' }));

    expect(useWorkflowStore.getState().clipboard?.id).toBe('a');
  });

  it('복제를 클릭하면 복제본이 추가되고 선택된다', async () => {
    const user = userEvent.setup();
    render(<WorkflowNodeActionMenu nodeId="a" />);

    await user.click(screen.getByRole('menuitem', { name: '복제' }));

    const state = useWorkflowStore.getState();
    expect(state.nodes).toHaveLength(3);
    const clone = state.nodes[2];
    expect(clone.id).not.toBe('a');
    expect(clone.data).toEqual(state.nodes[0].data);
    expect(state.selectedNodeId).toBe(clone.id);
  });

  it('삭제를 클릭하면 노드와 연결 엣지가 함께 제거된다', async () => {
    const user = userEvent.setup();
    render(<WorkflowNodeActionMenu nodeId="a" />);

    await user.click(screen.getByRole('menuitem', { name: '삭제' }));

    const state = useWorkflowStore.getState();
    expect(state.nodes.map((n) => n.id)).toEqual(['b']);
    expect(state.edges).toEqual([]);
  });
});
