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

interface BaseNodeData {
  label: string;
  name?: string;
  [key: string]: unknown;
}

interface StartNodeData extends BaseNodeData {
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
}

interface ModelNodeData extends BaseNodeData {
  description?: string;
  type: 'custom' | 'catalog';
  model_id: string;
  context: string;
  prompt_id: string;
}

interface EndNodeData extends BaseNodeData {
  description?: string;
  output_variable: {
    name: string;
    value: string;
  }[];
}

type NodeData = StartNodeData | KnowledgebaseNodeData | ModelNodeData | EndNodeData;
export type WorkflowNode = Node<NodeData>;

interface WorkflowState {
  name: string;
  nodes: WorkflowNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  setName: (name: string) => void;
  setInitialData: (nodes: WorkflowNode[], edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;
  onConnect: (connection: Edge | Connection) => void;
  updateNodeData: (nodeId: string, newData: Partial<NodeData>) => void;
  selectNode: (nodeId: string | null) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  name: '새 워크플로우',
  nodes: [],
  edges: [],
  selectedNodeId: null,
  setName: (name: string) => set({ name: name }),
  setInitialData: (nodes: WorkflowNode[], edges: Edge[]) => set({ nodes, edges }),
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes: EdgeChange<Edge>[]) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),
  onConnect: (connection: Edge | Connection) => set({ edges: addEdge(connection, get().edges) }),
  updateNodeData: (nodeId: string, newData: Partial<NodeData>) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      ),
    })),
  selectNode: (nodeId: string | null) => set({ selectedNodeId: nodeId }),
}));
