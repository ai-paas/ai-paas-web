import {
  Background,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface FlowChartProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  nodeTypes: Record<string, React.NamedExoticComponent<object>>;
}

export const FlowChart = ({ nodeTypes, initialNodes, initialEdges }: FlowChartProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
};
