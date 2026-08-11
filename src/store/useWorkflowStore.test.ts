import { describe, it, expect, beforeEach } from 'vitest';
import type { Connection, Edge, EdgeChange, NodeChange } from '@xyflow/react';
import { resetWorkflowStore } from '@/test/utils/reset-workflow-store';
import { useWorkflowStore, type WorkflowNode } from './useWorkflowStore';

const makeNode = (id: string, overrides: Partial<WorkflowNode> = {}): WorkflowNode => ({
  id,
  type: 'note',
  position: { x: 0, y: 0 },
  data: { label: `노드-${id}`, text: '' },
  ...overrides,
});

const makeEdge = (id: string, source: string, target: string): Edge => ({ id, source, target });

describe('useWorkflowStore', () => {
  beforeEach(() => {
    resetWorkflowStore();
  });

  // ============================================
  // 초기 상태
  // ============================================
  describe('초기 상태', () => {
    it('모든 필드가 비어 있는 기본값으로 시작한다', () => {
      const state = useWorkflowStore.getState();

      expect(state.name).toBe('');
      expect(state.nodes).toEqual([]);
      expect(state.edges).toEqual([]);
      expect(state.past).toEqual([]);
      expect(state.future).toEqual([]);
      expect(state.selectedNodeId).toBeNull();
      expect(state.isDragging).toBe(false);
      expect(state.pendingNodeType).toBeNull();
    });
  });

  // ============================================
  // setName / setPendingNodeType
  // ============================================
  describe('setName / setPendingNodeType', () => {
    it('setName은 name만 변경한다', () => {
      useWorkflowStore.getState().setName('내 워크플로우');

      expect(useWorkflowStore.getState().name).toBe('내 워크플로우');
      expect(useWorkflowStore.getState().past).toEqual([]);
    });

    it('setPendingNodeType은 타입 설정과 null 해제가 모두 동작한다', () => {
      useWorkflowStore.getState().setPendingNodeType('MODEL');
      expect(useWorkflowStore.getState().pendingNodeType).toBe('MODEL');

      useWorkflowStore.getState().setPendingNodeType(null);
      expect(useWorkflowStore.getState().pendingNodeType).toBeNull();
    });
  });

  // ============================================
  // setInitialData
  // ============================================
  describe('setInitialData', () => {
    it('노드의 selected를 false로 정규화하고 edges를 그대로 설정한다', () => {
      const nodes = [makeNode('a', { selected: true }), makeNode('b')];
      const edges = [makeEdge('e1', 'a', 'b')];

      useWorkflowStore.getState().setInitialData(nodes, edges);

      const state = useWorkflowStore.getState();
      expect(state.nodes.map((n) => n.selected)).toEqual([false, false]);
      expect(state.nodes.map((n) => n.id)).toEqual(['a', 'b']);
      expect(state.edges).toEqual(edges);
    });

    it('히스토리·선택·드래그·pendingNodeType을 전부 리셋한다', () => {
      // 오염 상태 구성: 히스토리 push + 선택 + 드래그 중 + pending 타입
      useWorkflowStore.getState().setInitialData([makeNode('a')], []);
      useWorkflowStore.getState().onNodesChange([{ type: 'add', item: makeNode('b') }]);
      useWorkflowStore.getState().selectNode('a');
      useWorkflowStore
        .getState()
        .onNodesChange([{ id: 'a', type: 'position', position: { x: 1, y: 1 }, dragging: true }]);
      useWorkflowStore.getState().setPendingNodeType('START');
      expect(useWorkflowStore.getState().past.length).toBeGreaterThan(0);
      expect(useWorkflowStore.getState().isDragging).toBe(true);

      useWorkflowStore.getState().setInitialData([makeNode('c')], []);

      const state = useWorkflowStore.getState();
      expect(state.past).toEqual([]);
      expect(state.future).toEqual([]);
      expect(state.selectedNodeId).toBeNull();
      expect(state.isDragging).toBe(false);
      expect(state.pendingNodeType).toBeNull();
    });

    it('name은 리셋하지 않고 유지한다 (특성화)', () => {
      useWorkflowStore.getState().setName('유지되는 이름');

      useWorkflowStore.getState().setInitialData([], []);

      expect(useWorkflowStore.getState().name).toBe('유지되는 이름');
    });
  });

  // ============================================
  // onNodesChange
  // ============================================
  describe('onNodesChange', () => {
    it('dragging=true 최초 position 변경에서만 드래그 시작 전 상태를 1회 스냅샷한다', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a')], []);
      const nodesBeforeDrag = useWorkflowStore.getState().nodes;

      useWorkflowStore
        .getState()
        .onNodesChange([{ id: 'a', type: 'position', position: { x: 10, y: 20 }, dragging: true }]);

      let state = useWorkflowStore.getState();
      expect(state.isDragging).toBe(true);
      expect(state.past).toHaveLength(1);
      // 스냅샷은 드래그 시작 "전" 노드 배열 참조를 그대로 보관한다
      expect(state.past[0].nodes).toBe(nodesBeforeDrag);
      expect(state.nodes[0].position).toEqual({ x: 10, y: 20 });

      // 연속 드래그 중에는 중복 스냅샷이 쌓이지 않는다
      useWorkflowStore
        .getState()
        .onNodesChange([{ id: 'a', type: 'position', position: { x: 30, y: 40 }, dragging: true }]);

      state = useWorkflowStore.getState();
      expect(state.past).toHaveLength(1);
      expect(state.nodes[0].position).toEqual({ x: 30, y: 40 });
    });

    it('dragging=false 변경에서 isDragging을 해제하고 스냅샷은 추가하지 않는다', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a')], []);
      useWorkflowStore
        .getState()
        .onNodesChange([{ id: 'a', type: 'position', position: { x: 10, y: 20 }, dragging: true }]);
      expect(useWorkflowStore.getState().isDragging).toBe(true);

      useWorkflowStore
        .getState()
        .onNodesChange([
          { id: 'a', type: 'position', position: { x: 10, y: 20 }, dragging: false },
        ]);

      const state = useWorkflowStore.getState();
      expect(state.isDragging).toBe(false);
      expect(state.past).toHaveLength(1);
    });

    const snapshotCases: { 설명: string; change: NodeChange<WorkflowNode>; 스냅샷: boolean }[] = [
      { 설명: 'add 변경은 스냅샷을 남긴다', change: { type: 'add', item: makeNode('b') }, 스냅샷: true },
      { 설명: 'remove 변경은 스냅샷을 남긴다', change: { id: 'a', type: 'remove' }, 스냅샷: true },
      {
        설명: 'select 변경은 스냅샷을 남기지 않는다',
        change: { id: 'a', type: 'select', selected: true },
        스냅샷: false,
      },
      {
        설명: 'dragging 플래그 없는 position 변경은 스냅샷을 남기지 않는다',
        change: { id: 'a', type: 'position', position: { x: 5, y: 5 } },
        스냅샷: false,
      },
    ];

    it.each(snapshotCases)('$설명', ({ change, 스냅샷 }) => {
      useWorkflowStore.getState().setInitialData([makeNode('a')], []);

      useWorkflowStore.getState().onNodesChange([change]);

      expect(useWorkflowStore.getState().past).toHaveLength(스냅샷 ? 1 : 0);
    });

    it('add/remove 변경이 nodes 배열에 실제로 반영된다', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a')], []);

      useWorkflowStore.getState().onNodesChange([{ type: 'add', item: makeNode('b') }]);
      expect(useWorkflowStore.getState().nodes.map((n) => n.id)).toEqual(['a', 'b']);

      useWorkflowStore.getState().onNodesChange([{ id: 'a', type: 'remove' }]);
      expect(useWorkflowStore.getState().nodes.map((n) => n.id)).toEqual(['b']);
    });

    it('select 변경 시 selectedNodeId가 동기화된다', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a'), makeNode('b')], []);

      useWorkflowStore.getState().onNodesChange([{ id: 'a', type: 'select', selected: true }]);
      expect(useWorkflowStore.getState().selectedNodeId).toBe('a');

      useWorkflowStore
        .getState()
        .onNodesChange([
          { id: 'a', type: 'select', selected: false },
          { id: 'b', type: 'select', selected: true },
        ]);
      expect(useWorkflowStore.getState().selectedNodeId).toBe('b');

      useWorkflowStore.getState().onNodesChange([{ id: 'b', type: 'select', selected: false }]);
      expect(useWorkflowStore.getState().selectedNodeId).toBeNull();
    });
  });

  // ============================================
  // onEdgesChange
  // ============================================
  describe('onEdgesChange', () => {
    const edgeCases: { 설명: string; change: EdgeChange<Edge>; 스냅샷: boolean }[] = [
      {
        설명: 'add 변경은 스냅샷을 남긴다',
        change: { type: 'add', item: makeEdge('e2', 'b', 'a') },
        스냅샷: true,
      },
      { 설명: 'remove 변경은 스냅샷을 남긴다', change: { id: 'e1', type: 'remove' }, 스냅샷: true },
      {
        설명: 'select 변경은 스냅샷을 남기지 않는다',
        change: { id: 'e1', type: 'select', selected: true },
        스냅샷: false,
      },
    ];

    it.each(edgeCases)('$설명', ({ change, 스냅샷 }) => {
      useWorkflowStore
        .getState()
        .setInitialData([makeNode('a'), makeNode('b')], [makeEdge('e1', 'a', 'b')]);

      useWorkflowStore.getState().onEdgesChange([change]);

      expect(useWorkflowStore.getState().past).toHaveLength(스냅샷 ? 1 : 0);
    });

    it('add/remove 변경이 edges 배열에 실제로 반영된다', () => {
      useWorkflowStore
        .getState()
        .setInitialData([makeNode('a'), makeNode('b')], [makeEdge('e1', 'a', 'b')]);

      useWorkflowStore.getState().onEdgesChange([{ type: 'add', item: makeEdge('e2', 'b', 'a') }]);
      expect(useWorkflowStore.getState().edges.map((e) => e.id)).toEqual(['e1', 'e2']);

      useWorkflowStore.getState().onEdgesChange([{ id: 'e1', type: 'remove' }]);
      expect(useWorkflowStore.getState().edges.map((e) => e.id)).toEqual(['e2']);
    });
  });

  // ============================================
  // onConnect
  // ============================================
  describe('onConnect', () => {
    const connection: Connection = {
      source: 'a',
      target: 'b',
      sourceHandle: null,
      targetHandle: null,
    };

    it('엣지를 추가하고 연결 전 상태를 스냅샷한다', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a'), makeNode('b')], []);
      const edgesBefore = useWorkflowStore.getState().edges;

      useWorkflowStore.getState().onConnect(connection);

      const state = useWorkflowStore.getState();
      expect(state.edges).toHaveLength(1);
      expect(state.edges[0]).toMatchObject({ source: 'a', target: 'b' });
      // @xyflow addEdge가 생성하는 id 규칙 고정
      expect(state.edges[0].id).toBe('xy-edge__a-b');
      expect(state.past).toHaveLength(1);
      expect(state.past[0].edges).toBe(edgesBefore);
      expect(state.future).toEqual([]);
    });

    it('동일 연결을 다시 시도하면 엣지는 중복 추가되지 않지만 스냅샷은 또 쌓인다 (특성화)', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a'), makeNode('b')], []);
      useWorkflowStore.getState().onConnect(connection);

      useWorkflowStore.getState().onConnect(connection);

      const state = useWorkflowStore.getState();
      // addEdge의 connectionExists 검사로 엣지 자체는 중복되지 않는다
      expect(state.edges).toHaveLength(1);
      // 버그 의심 — 팀 확인 필요: 엣지가 실제로 추가되지 않았는데도 pushHistory가
      // 무조건 실행되어 동일 상태 스냅샷이 쌓인다. 이후 undo 1회가 아무 변화 없는
      // no-op 단계가 된다.
      expect(state.past).toHaveLength(2);
      expect(state.past[1].edges).toEqual(state.edges);
    });
  });

  // ============================================
  // updateNodeData
  // ============================================
  describe('updateNodeData', () => {
    it('대상 노드의 data만 병합하고 다른 노드 참조는 그대로 유지한다', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a'), makeNode('b')], []);
      const [nodeABefore, nodeBBefore] = useWorkflowStore.getState().nodes;

      useWorkflowStore.getState().updateNodeData('a', { label: '변경된 라벨' });

      const [nodeA, nodeB] = useWorkflowStore.getState().nodes;
      expect(nodeA.data).toEqual({ label: '변경된 라벨', text: '' });
      expect(nodeA).not.toBe(nodeABefore);
      expect(nodeB).toBe(nodeBBefore);
    });

    it('존재하지 않는 nodeId면 모든 노드가 참조 그대로다', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a')], []);
      const nodeBefore = useWorkflowStore.getState().nodes[0];

      useWorkflowStore.getState().updateNodeData('없는-id', { label: '무시됨' });

      expect(useWorkflowStore.getState().nodes[0]).toBe(nodeBefore);
    });

    it('스냅샷을 남기지 않는다 — data 편집은 undo 대상이 아니다 (특성화)', () => {
      // 설정 패널의 onChange(키 입력 단위)마다 호출되므로 스냅샷을 남기지 않는 것으로
      // 보이나, data 편집이 undo 불가능한 것이 의도인지는 팀 확인 필요.
      useWorkflowStore.getState().setInitialData([makeNode('a')], []);

      useWorkflowStore.getState().updateNodeData('a', { label: '변경' });

      expect(useWorkflowStore.getState().past).toEqual([]);
    });
  });

  // ============================================
  // selectNode
  // ============================================
  describe('selectNode', () => {
    it('id 선택 시 selectedNodeId와 각 노드의 selected 플래그가 동기화된다', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a'), makeNode('b')], []);

      useWorkflowStore.getState().selectNode('a');

      const state = useWorkflowStore.getState();
      expect(state.selectedNodeId).toBe('a');
      expect(state.nodes.find((n) => n.id === 'a')?.selected).toBe(true);
      expect(state.nodes.find((n) => n.id === 'b')?.selected).toBe(false);
    });

    it('null 선택 시 선택이 모두 해제된다', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a'), makeNode('b')], []);
      useWorkflowStore.getState().selectNode('a');

      useWorkflowStore.getState().selectNode(null);

      const state = useWorkflowStore.getState();
      expect(state.selectedNodeId).toBeNull();
      expect(state.nodes.every((n) => n.selected === false)).toBe(true);
    });

    it('스냅샷을 남기지 않는다', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a')], []);

      useWorkflowStore.getState().selectNode('a');

      expect(useWorkflowStore.getState().past).toEqual([]);
    });
  });

  // ============================================
  // undo / redo
  // ============================================
  describe('undo / redo', () => {
    it('빈 past에서 undo는 no-op이다', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a')], [makeEdge('e1', 'a', 'a')]);
      const before = useWorkflowStore.getState();

      useWorkflowStore.getState().undo();

      const after = useWorkflowStore.getState();
      expect(after.nodes).toBe(before.nodes);
      expect(after.edges).toBe(before.edges);
      expect(after.past).toBe(before.past);
      expect(after.future).toBe(before.future);
    });

    it('빈 future에서 redo는 no-op이다', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a')], []);
      const before = useWorkflowStore.getState();

      useWorkflowStore.getState().redo();

      const after = useWorkflowStore.getState();
      expect(after.nodes).toBe(before.nodes);
      expect(after.edges).toBe(before.edges);
    });

    it('undo는 직전 스냅샷을 복원하고 현재 상태를 future로 옮긴다', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a'), makeNode('b')], []);
      const nodesBefore = useWorkflowStore.getState().nodes;
      useWorkflowStore.getState().onNodesChange([{ type: 'add', item: makeNode('c') }]);
      const nodesAfterAdd = useWorkflowStore.getState().nodes;

      useWorkflowStore.getState().undo();

      const state = useWorkflowStore.getState();
      expect(state.nodes).toBe(nodesBefore);
      expect(state.past).toEqual([]);
      expect(state.future).toHaveLength(1);
      expect(state.future[0].nodes).toBe(nodesAfterAdd);
    });

    it('redo는 future의 첫 스냅샷을 복원하고 현재 상태를 past로 되돌린다 (undo와 대칭)', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a')], []);
      useWorkflowStore.getState().onNodesChange([{ type: 'add', item: makeNode('b') }]);
      useWorkflowStore.getState().onNodesChange([{ type: 'add', item: makeNode('c') }]);
      const nodesFinal = useWorkflowStore.getState().nodes;

      useWorkflowStore.getState().undo();
      useWorkflowStore.getState().undo();
      expect(useWorkflowStore.getState().nodes.map((n) => n.id)).toEqual(['a']);
      expect(useWorkflowStore.getState().past).toHaveLength(0);
      expect(useWorkflowStore.getState().future).toHaveLength(2);

      useWorkflowStore.getState().redo();
      useWorkflowStore.getState().redo();

      const state = useWorkflowStore.getState();
      expect(state.nodes).toBe(nodesFinal);
      expect(state.past).toHaveLength(2);
      expect(state.future).toHaveLength(0);
    });

    it('undo 시 복원된 노드의 selected 플래그로 selectedNodeId를 복원한다', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a'), makeNode('b')], []);
      useWorkflowStore.getState().selectNode('a');
      useWorkflowStore.getState().takeSnapshot(); // a가 선택된 상태를 스냅샷
      useWorkflowStore.getState().selectNode(null);
      expect(useWorkflowStore.getState().selectedNodeId).toBeNull();

      useWorkflowStore.getState().undo();

      expect(useWorkflowStore.getState().selectedNodeId).toBe('a');
    });

    it('undo/redo는 isDragging을 false로 되돌린다', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a')], []);
      useWorkflowStore
        .getState()
        .onNodesChange([{ id: 'a', type: 'position', position: { x: 10, y: 10 }, dragging: true }]);
      expect(useWorkflowStore.getState().isDragging).toBe(true);

      useWorkflowStore.getState().undo();
      expect(useWorkflowStore.getState().isDragging).toBe(false);

      // redo 경로도 확인: 드래그 중 상태로 다시 만들고 redo
      useWorkflowStore
        .getState()
        .onNodesChange([{ id: 'a', type: 'position', position: { x: 20, y: 20 }, dragging: true }]);
      useWorkflowStore.getState().undo();
      expect(useWorkflowStore.getState().future).toHaveLength(1);
      useWorkflowStore.getState().redo();
      expect(useWorkflowStore.getState().isDragging).toBe(false);
    });

    it('undo 후 새 변경이 발생하면 future가 비워진다 (redo 무효화)', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a'), makeNode('b')], []);
      useWorkflowStore
        .getState()
        .onConnect({ source: 'a', target: 'b', sourceHandle: null, targetHandle: null });
      useWorkflowStore.getState().undo();
      expect(useWorkflowStore.getState().future).toHaveLength(1);

      useWorkflowStore.getState().onNodesChange([{ type: 'add', item: makeNode('c') }]);

      const state = useWorkflowStore.getState();
      expect(state.future).toEqual([]);
      expect(state.past).toHaveLength(1);
    });
  });

  // ============================================
  // HISTORY_LIMIT
  // ============================================
  describe('HISTORY_LIMIT', () => {
    it('스냅샷이 50개를 초과하면 오래된 것부터 절삭한다', () => {
      useWorkflowStore.getState().setInitialData([makeNode('a')], []);

      // 스냅샷 k는 직전 라벨(v{k-1})을 보관한다 (v0 = 초기 라벨)
      for (let i = 1; i <= 55; i++) {
        useWorkflowStore.getState().takeSnapshot();
        useWorkflowStore.getState().updateNodeData('a', { label: `v${i}` });
      }

      const { past } = useWorkflowStore.getState();
      expect(past).toHaveLength(50);
      // 55개 중 앞의 5개(초기~v4)가 잘리고 v5 스냅샷이 가장 오래된 항목이 된다
      expect(past[0].nodes[0].data.label).toBe('v5');
      expect(past[49].nodes[0].data.label).toBe('v54');
    });
  });
});
