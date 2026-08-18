import { create } from 'zustand';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react';
// workflow-node-defaults는 이 파일에서 타입만 import하므로 런타임 순환 없음
import { createNodeId } from '@/components/features/workflow/workflow-editor/workflow-node-defaults';
import type { WorkflowComponentType } from '@/types/workflow';

interface BaseNodeData {
  label: string;
  name?: string;
  [key: string]: unknown;
}

interface StartNodeData extends BaseNodeData {
  description?: string;
  inputFields: {
    type: 'text' | 'file';
    variable: string;
    label: string;
    max_length: number;
    file_type: string;
    file_upload: string;
    file_max_number: number;
  }[];
}
interface KnowledgebaseNodeData extends BaseNodeData {
  description?: string;
  query_variable: string;
  knowledgebase_id: string;
  top_k?: number;
}

interface ModelNodeData extends BaseNodeData {
  description?: string;
  type: 'custom' | 'catalog';
  model_id: string;
  context: string;
  prompt_id: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

interface EndNodeData extends BaseNodeData {
  description?: string;
  output_variable: {
    name: string;
    value: string;
  }[];
}

interface NoteNodeData extends BaseNodeData {
  text: string;
}

type NodeData = StartNodeData | KnowledgebaseNodeData | ModelNodeData | EndNodeData | NoteNodeData;
export type WorkflowNode = Node<NodeData>;

interface HistorySnapshot {
  nodes: WorkflowNode[];
  edges: Edge[];
}

const HISTORY_LIMIT = 50;

interface WorkflowState {
  name: string;
  nodes: WorkflowNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  isDragging: boolean;
  pendingNodeType: WorkflowComponentType | null;
  clipboard: WorkflowNode | null;
  setName: (name: string) => void;
  setPendingNodeType: (type: WorkflowComponentType | null) => void;
  setInitialData: (nodes: WorkflowNode[], edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;
  onConnect: (connection: Edge | Connection) => void;
  updateNodeData: (nodeId: string, newData: Partial<NodeData>) => void;
  selectNode: (nodeId: string | null) => void;
  copyNode: (nodeId: string) => void;
  pasteClipboard: () => void;
  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  takeSnapshot: () => void;
  undo: () => void;
  redo: () => void;
}

const pushHistory = (
  state: Pick<WorkflowState, 'past' | 'nodes' | 'edges'>
): Pick<WorkflowState, 'past' | 'future'> => ({
  past: [...state.past, { nodes: state.nodes, edges: state.edges }].slice(-HISTORY_LIMIT),
  future: [],
});

/** 복제·붙여넣기 시 원본과 겹치지 않도록 비껴 배치하는 간격 */
const CLONE_OFFSET = 40;

const cloneNode = (node: WorkflowNode): WorkflowNode => ({
  ...node,
  id: createNodeId(),
  position: { x: node.position.x + CLONE_OFFSET, y: node.position.y + CLONE_OFFSET },
  data: structuredClone(node.data),
  selected: false,
});

/** 새 노드를 추가하면서 그 노드만 선택 상태로 만들고 스냅샷을 남긴다. */
const withInsertedNode = (
  state: Pick<WorkflowState, 'past' | 'nodes' | 'edges'>,
  node: WorkflowNode
) => ({
  nodes: [
    ...state.nodes.map((n) => (n.selected ? { ...n, selected: false } : n)),
    { ...node, selected: true },
  ],
  selectedNodeId: node.id,
  ...pushHistory(state),
});

export const useWorkflowStore = create<WorkflowState>((set) => ({
  name: '',
  nodes: [],
  edges: [],
  selectedNodeId: null,
  past: [],
  future: [],
  isDragging: false,
  pendingNodeType: null,
  clipboard: null,
  setName: (name: string) => set({ name: name }),
  setPendingNodeType: (type: WorkflowComponentType | null) => set({ pendingNodeType: type }),
  setInitialData: (nodes: WorkflowNode[], edges: Edge[]) =>
    set({
      nodes: nodes.map((node) => ({ ...node, selected: false })),
      edges,
      selectedNodeId: null,
      past: [],
      future: [],
      isDragging: false,
      pendingNodeType: null,
      clipboard: null,
    }),
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) =>
    set((state) => {
      const startDragging = changes.some((c) => c.type === 'position' && c.dragging === true);
      const stopDragging = changes.some((c) => c.type === 'position' && c.dragging === false);
      // 구조 변경(추가/삭제)이나 드래그 시작 직전 상태를 히스토리에 기록한다.
      const shouldSnapshot = changes.some(
        (c) =>
          c.type === 'add' ||
          c.type === 'remove' ||
          (c.type === 'position' && c.dragging === true && !state.isDragging)
      );

      const nodes = applyNodeChanges(changes, state.nodes);
      const selectedNodeId = nodes.find((node) => node.selected)?.id ?? null;

      return {
        nodes,
        selectedNodeId,
        ...(shouldSnapshot ? pushHistory(state) : {}),
        isDragging: startDragging ? true : stopDragging ? false : state.isDragging,
      };
    }),
  onEdgesChange: (changes: EdgeChange<Edge>[]) =>
    set((state) => {
      const shouldSnapshot = changes.some((c) => c.type === 'add' || c.type === 'remove');

      return {
        edges: applyEdgeChanges(changes, state.edges),
        ...(shouldSnapshot ? pushHistory(state) : {}),
      };
    }),
  onConnect: (connection: Edge | Connection) =>
    set((state) => ({
      edges: addEdge(connection, state.edges),
      ...pushHistory(state),
    })),
  updateNodeData: (nodeId: string, newData: Partial<NodeData>) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      ),
    })),
  selectNode: (nodeId: string | null) =>
    set((state) => ({
      selectedNodeId: nodeId,
      nodes: state.nodes.map((node) => ({ ...node, selected: node.id === nodeId })),
    })),
  // 노드는 불변 갱신되므로 참조 보관만으로 복사 시점 상태가 고정된다
  copyNode: (nodeId: string) =>
    set((state) => {
      const node = state.nodes.find((n) => n.id === nodeId);
      return node ? { clipboard: node } : {};
    }),
  pasteClipboard: () =>
    set((state) => {
      if (!state.clipboard) return {};
      const pasted = cloneNode(state.clipboard);
      // 붙여넣은 노드를 클립보드로 승격해 연속 붙여넣기가 계단식으로 배치되게 한다
      return { ...withInsertedNode(state, pasted), clipboard: pasted };
    }),
  duplicateNode: (nodeId: string) =>
    set((state) => {
      const node = state.nodes.find((n) => n.id === nodeId);
      return node ? withInsertedNode(state, cloneNode(node)) : {};
    }),
  deleteNode: (nodeId: string) =>
    set((state) => {
      if (!state.nodes.some((n) => n.id === nodeId)) return {};
      return {
        nodes: state.nodes.filter((n) => n.id !== nodeId),
        edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        ...pushHistory(state),
      };
    }),
  deleteEdge: (edgeId: string) =>
    set((state) => {
      if (!state.edges.some((e) => e.id === edgeId)) return {};
      return {
        edges: state.edges.filter((e) => e.id !== edgeId),
        ...pushHistory(state),
      };
    }),
  takeSnapshot: () => set((state) => pushHistory(state)),
  undo: () =>
    set((state) => {
      if (state.past.length === 0) return {};

      const previous = state.past[state.past.length - 1];

      return {
        past: state.past.slice(0, -1),
        future: [{ nodes: state.nodes, edges: state.edges }, ...state.future].slice(0, HISTORY_LIMIT),
        nodes: previous.nodes,
        edges: previous.edges,
        selectedNodeId: previous.nodes.find((node) => node.selected)?.id ?? null,
        isDragging: false,
      };
    }),
  redo: () =>
    set((state) => {
      if (state.future.length === 0) return {};

      const next = state.future[0];

      return {
        past: [...state.past, { nodes: state.nodes, edges: state.edges }].slice(-HISTORY_LIMIT),
        future: state.future.slice(1),
        nodes: next.nodes,
        edges: next.edges,
        selectedNodeId: next.nodes.find((node) => node.selected)?.id ?? null,
        isDragging: false,
      };
    }),
}));
