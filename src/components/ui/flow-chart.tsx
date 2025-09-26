import {
  addEdge,
  Background,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback } from 'react';

interface FlowChartProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  nodeTypes: Record<string, React.NamedExoticComponent<object>>;
}

export const FlowChart = ({ nodeTypes, initialNodes, initialEdges }: FlowChartProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, type: 'default' }, eds));
    },
    [setEdges]
  );

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
};
