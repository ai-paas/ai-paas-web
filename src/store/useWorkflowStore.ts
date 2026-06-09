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
  setName: (name: string) => void;
  setPendingNodeType: (type: WorkflowComponentType | null) => void;
  setInitialData: (nodes: WorkflowNode[], edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;
  onConnect: (connection: Edge | Connection) => void;
  updateNodeData: (nodeId: string, newData: Partial<NodeData>) => void;
  selectNode: (nodeId: string | null) => void;
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

export const useWorkflowStore = create<WorkflowState>((set) => ({
  name: '',
  nodes: [],
  edges: [],
  selectedNodeId: null,
  past: [],
  future: [],
  isDragging: false,
  pendingNodeType: null,
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
