import { Background, ReactFlow, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { memo } from 'react';
import {
  AnswerIcon,
  HomeIcon,
  KnowledgeRetrievalIcon,
  LlmIcon,
} from '@/components/features/workflow/icons/workflow-icons';
import { Handle, Position } from '@xyflow/react';

const HANDLE_STYLE = {
  backgroundColor: '#296dff',
  height: '12px',
  width: '2px',
  borderRadius: '1px',
};

const StartNode = memo(({ data, isConnectable, selected }) => {
  return (
    <div>
      <div
        className={`flex rounded-2xl border-[2px] ${selected ? 'border-blue-500' : 'border-transparent'}`}
      >
        <div className="group relative w-[240px] rounded-[15px] border border-transparent bg-white pb-1 shadow-xs hover:shadow-lg">
          <div className="flex items-center rounded-t-2xl px-3 pt-3 pb-2">
            <div className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-lg border-[0.5px] border-white/2 bg-blue-500 text-white shadow-md">
              <HomeIcon />
            </div>
            <div className="mr-1 flex grow items-center truncate">{data.label}</div>
          </div>
        </div>
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

const ModelNode = memo(({ data, isConnectable, selected }) => {
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
        <div className="group relative w-[240px] rounded-[15px] border border-transparent bg-white pb-1 shadow-xs hover:shadow-lg">
          <div className="flex items-center rounded-t-2xl px-3 pt-3 pb-2">
            <div className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-lg border-[0.5px] border-white/2 bg-indigo-500 text-white shadow-md">
              <LlmIcon />
            </div>
            <div className="mr-1 flex grow items-center truncate">{data.label}</div>
          </div>
        </div>
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

const KnowledgebaseNode = memo(({ data, isConnectable, selected }) => {
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
        <div className="group relative w-[240px] rounded-[15px] border border-transparent bg-white pb-1 shadow-xs hover:shadow-lg">
          <div className="flex items-center rounded-t-2xl px-3 pt-3 pb-2">
            <div className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-lg border-[0.5px] border-white/2 bg-emerald-500 text-white shadow-md">
              <KnowledgeRetrievalIcon />
            </div>
            <div className="mr-1 flex grow items-center truncate">{data.label}</div>
          </div>
        </div>
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

const EndNode = memo(({ data, isConnectable, selected }) => {
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
        <div className="group relative w-[240px] rounded-[15px] border border-transparent bg-white pb-1 shadow-xs hover:shadow-lg">
          <div className="flex items-center rounded-t-2xl px-3 pt-3 pb-2">
            <div className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-lg border-[0.5px] border-white/2 bg-amber-500 text-white shadow-md">
              <AnswerIcon />
            </div>
            <div className="mr-1 flex grow items-center truncate">{data.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

const nodeTypes = {
  start: StartNode,
  model: ModelNode,
  knowledgebase: KnowledgebaseNode,
  end: EndNode,
};

const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1.5 };

interface FlowChartProps {
  initialNodes: Node[];
  initialEdges: Edge[];
}

export const FlowChart = ({ initialNodes, initialEdges }: FlowChartProps) => {
  return (
    <div className="size-full">
      <ReactFlow
        defaultNodes={initialNodes}
        defaultEdges={initialEdges}
        nodeTypes={nodeTypes}
        defaultViewport={DEFAULT_VIEWPORT}
        selectNodesOnDrag={false}
        fitView
        onlyRenderVisibleElements
      >
        <Background />
      </ReactFlow>
    </div>
  );
};
