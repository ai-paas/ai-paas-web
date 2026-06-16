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
import { useGetCustomModels, useGetModelCatalogs } from '@/hooks/service/models';
import { useGetKnowledgeBases } from '@/hooks/service/knowledgebase';
import { useWorkflowStore, type WorkflowNode } from '@/store/useWorkflowStore';

const INPUT_FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'String',
  file: 'File List',
};

/** 시작 노드에 설정된 입력필드(변수명·타입)를 카드 하단에 표시한다. */
const StartNodeContent = ({ data }: { data: WorkflowNode['data'] }) => {
  const inputFields = (data.inputFields as { type?: string; variable?: string }[] | undefined) ?? [];

  if (inputFields.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 px-3 pb-2">
      {inputFields.map((field, idx) => (
        <div
          key={idx}
          className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5"
        >
          <span className="shrink-0 text-xs font-semibold text-blue-500">{'{x}'}</span>
          <span className="grow truncate text-xs font-medium text-gray-700">
            {field.variable || '미지정'}
          </span>
          <span className="shrink-0 text-[10px] font-medium text-gray-400">
            {INPUT_FIELD_TYPE_LABELS[field.type ?? 'text'] ?? 'String'}
          </span>
        </div>
      ))}
    </div>
  );
};

const StartNode = memo(({ data, isConnectable, selected }: NodeProps<WorkflowNode>) => {
  return (
    <div>
      <div
        className={`flex rounded-2xl border-[2px] ${selected ? 'border-blue-500' : 'border-transparent'}`}
      >
        <WorkflowNodeCard type="START" name={data.name}>
          <StartNodeContent data={data} />
        </WorkflowNodeCard>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="workflow-handle"
      />
    </div>
  );
});

const MODEL_LIST_PARAMS = { size: 100 };

/** 모델 노드에 설정된 모델(이름·유형)을 카드 하단에 표시한다. */
const ModelNodeContent = ({ data }: { data: WorkflowNode['data'] }) => {
  const modelType = (data.type as 'custom' | 'catalog' | undefined) ?? 'custom';
  const modelId = (data.model_id as string | undefined) ?? '';
  const { customModels } = useGetCustomModels(MODEL_LIST_PARAMS);
  const { modelCatalogs } = useGetModelCatalogs(MODEL_LIST_PARAMS);

  const models = modelType === 'custom' ? customModels : modelCatalogs;
  const model = models.find((m) => String(m.id) === modelId);

  if (!modelId || !model) return null;

  return (
    <div className="px-3 pb-2">
      <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5">
        <span className="grow truncate text-xs font-medium text-gray-700">{model.name}</span>
        {model.type_info?.name && (
          <span className="shrink-0 rounded bg-gray-200 px-1 py-px text-[10px] font-medium tracking-wide text-gray-500 uppercase">
            {model.type_info.name}
          </span>
        )}
      </div>
    </div>
  );
};

const ModelNode = memo(({ data, isConnectable, selected }: NodeProps<WorkflowNode>) => {
  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="workflow-handle"
      />
      <div
        className={`flex rounded-2xl border-[2px] ${selected ? 'border-blue-500' : 'border-transparent'}`}
      >
        <WorkflowNodeCard type="MODEL" name={data.name}>
          <ModelNodeContent data={data} />
        </WorkflowNodeCard>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="workflow-handle"
      />
    </div>
  );
});

const KNOWLEDGE_BASE_LIST_PARAMS = { page: 1, size: 999 };

/** 지식베이스 노드에 설정된 지식 베이스(이름)를 카드 하단에 표시한다. */
const KnowledgebaseNodeContent = ({ data }: { data: WorkflowNode['data'] }) => {
  const knowledgebaseId = (data.knowledgebase_id as string | undefined) ?? '';
  const { knowledgeBases } = useGetKnowledgeBases(KNOWLEDGE_BASE_LIST_PARAMS);

  const knowledgeBase = knowledgeBases.find(
    (kb) => String(kb.surro_knowledge_id) === knowledgebaseId
  );

  if (!knowledgebaseId || !knowledgeBase) return null;

  return (
    <div className="px-3 pb-2">
      <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5">
        <span className="grow truncate text-xs font-medium text-gray-700">
          {knowledgeBase.name}
        </span>
      </div>
    </div>
  );
};

const KnowledgebaseNode = memo(({ data, isConnectable, selected }: NodeProps<WorkflowNode>) => {
  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="workflow-handle"
      />
      <div
        className={`flex rounded-2xl border-[2px] ${selected ? 'border-blue-500' : 'border-transparent'}`}
      >
        <WorkflowNodeCard type="KNOWLEDGE_BASE" name={data.name}>
          <KnowledgebaseNodeContent data={data} />
        </WorkflowNodeCard>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="workflow-handle"
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
        className="workflow-handle"
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
  const [editing, setEditing] = useState(false);

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      className={`min-h-30 w-45 rounded-md border bg-amber-50 shadow-xs transition-shadow hover:shadow-md ${
        selected ? 'border-amber-400' : 'border-amber-200'
      }`}
    >
      {editing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => updateNodeData(id, { text: e.target.value })}
          onBlur={() => setEditing(false)}
          placeholder="메모를 입력하세요"
          className="nodrag nowheel size-full min-h-30 resize-none rounded-md bg-transparent p-3 text-xs leading-relaxed text-amber-900 outline-none placeholder:text-amber-400"
        />
      ) : (
        <div className="size-full min-h-30 cursor-grab whitespace-pre-wrap wrap-break-word p-3 text-xs leading-relaxed text-amber-900 active:cursor-grabbing">
          {text || <span className="text-amber-400">메모를 입력하세요</span>}
        </div>
      )}
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
      className={`relative size-full ${readOnly ? 'workflow-canvas--readonly' : ''} ${pendingNodeType ? '[&_.react-flow\\_\\_pane]:cursor-crosshair' : ''}`}
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
        connectionRadius={40}
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
