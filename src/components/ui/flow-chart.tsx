import {
  Background,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './flow-chart.css';
import { memo, useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  WorkflowCanvasControls,
  type PaneMode,
} from '@/components/features/workflow/workflow-editor/workflow-canvas-controls';
import { WorkflowNodeCard } from '@/components/features/workflow/workflow-editor/workflow-node-card';
import {
  createNodeId,
  createWorkflowNodeData,
} from '@/components/features/workflow/workflow-editor/workflow-node-defaults';
import { useWorkflowStore, type WorkflowNode } from '@/store/useWorkflowStore';

const HANDLE_STYLE = {
  backgroundColor: '#296dff',
  height: '12px',
  width: '2px',
  borderRadius: '1px',
};

const StartNode = memo(({ data, isConnectable, selected }: NodeProps<WorkflowNode>) => {
  return (
    <div>
      <div
        className={`flex rounded-2xl border-[2px] ${selected ? 'border-blue-500' : 'border-transparent'}`}
      >
        <WorkflowNodeCard type="START" name={data.name} />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={HANDLE_STYLE}
      />
    </div>
  );
});

const ModelNode = memo(({ data, isConnectable, selected }: NodeProps<WorkflowNode>) => {
  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={HANDLE_STYLE}
      />
      <div
        className={`flex rounded-2xl border-[2px] ${selected ? 'border-blue-500' : 'border-transparent'}`}
      >
        <WorkflowNodeCard type="MODEL" name={data.name} />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={HANDLE_STYLE}
      />
    </div>
  );
});

const KnowledgebaseNode = memo(({ data, isConnectable, selected }: NodeProps<WorkflowNode>) => {
  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={HANDLE_STYLE}
      />
      <div
        className={`flex rounded-2xl border-[2px] ${selected ? 'border-blue-500' : 'border-transparent'}`}
      >
        <WorkflowNodeCard type="KNOWLEDGE_BASE" name={data.name} />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={HANDLE_STYLE}
      />
    </div>
  );
});

const EndNode = memo(({ data, isConnectable, selected }: NodeProps<WorkflowNode>) => {
  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={HANDLE_STYLE}
      />
      <div
        className={`flex rounded-2xl border-[2px] ${selected ? 'border-blue-500' : 'border-transparent'}`}
      >
        <WorkflowNodeCard type="END" name={data.name} />
      </div>
    </div>
  );
});

const NoteNode = memo(({ id, data, selected }: NodeProps<WorkflowNode>) => {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const text = typeof data.text === 'string' ? data.text : '';

  return (
    <div
      className={`min-h-30 w-45 rounded-md border bg-amber-50 shadow-xs transition-shadow hover:shadow-md ${
        selected ? 'border-amber-400' : 'border-amber-200'
      }`}
    >
      <textarea
        value={text}
        onChange={(e) => updateNodeData(id, { text: e.target.value })}
        placeholder="메모를 입력하세요"
        className="nodrag nowheel size-full min-h-30 resize-none rounded-md bg-transparent p-3 text-xs leading-relaxed text-amber-900 outline-none placeholder:text-amber-400"
      />
    </div>
  );
});

const nodeTypes = {
  START: StartNode,
  MODEL: ModelNode,
  KNOWLEDGE_BASE: KnowledgebaseNode,
  END: EndNode,
  NOTE: NoteNode,
};

const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const FIT_VIEW_OPTIONS = { padding: 0.2, maxZoom: 1 };

interface FlowChartProps {
  initialNodes: WorkflowNode[];
  initialEdges: Edge[];
  /** 오버뷰 등 읽기 전용 화면. 컨트롤 바를 숨기고 노드 편집을 막는다. */
  readOnly?: boolean;
}

export const FlowChart = ({ initialNodes, initialEdges, readOnly = false }: FlowChartProps) => {
  const { nodes, edges, setInitialData, onNodesChange, onEdgesChange, onConnect, selectNode } =
    useWorkflowStore();
  const pendingNodeType = useWorkflowStore((s) => s.pendingNodeType);
  const setPendingNodeType = useWorkflowStore((s) => s.setPendingNodeType);
  const { screenToFlowPosition, addNodes } = useReactFlow();
  const [paneMode, setPaneMode] = useState<PaneMode>('hand');

  useEffect(() => {
    setInitialData(initialNodes, initialEdges);
  }, [initialEdges, initialNodes, setInitialData]);

  const isHandMode = paneMode === 'hand';

  const handlePaneClick = (e: React.MouseEvent) => {
    if (!pendingNodeType) return;
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });

    addNodes({
      id: createNodeId(),
      type: pendingNodeType,
      position: { x: position.x - 120, y: position.y - 25 },
      data: createWorkflowNodeData(pendingNodeType),
    });
    setPendingNodeType(null);
  };

  return (
    <div
      className={`relative size-full ${pendingNodeType ? '[&_.react-flow\\_\\_pane]:cursor-crosshair' : ''}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        defaultViewport={DEFAULT_VIEWPORT}
        fitView
        fitViewOptions={FIT_VIEW_OPTIONS}
        minZoom={0.2}
        maxZoom={2}
        panOnDrag={readOnly || (isHandMode && !pendingNodeType)}
        selectionOnDrag={!readOnly && !isHandMode && !pendingNodeType}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        onlyRenderVisibleElements
      >
        <Background />
        <MiniMap position="bottom-left" pannable zoomable />
        {!readOnly && (
          <WorkflowCanvasControls paneMode={paneMode} onPaneModeChange={setPaneMode} />
        )}
      </ReactFlow>
    </div>
  );
};
