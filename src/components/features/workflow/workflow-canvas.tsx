import { FlowChart } from '@/components/ui/flow-chart';
import { type Edge, type Node } from '@xyflow/react';
import { memo } from 'react';

interface WorkflowEditorProps {
  initialNodes: Node[];
  initialEdges: Edge[];
}

export const WorkflowCanvas = memo(({ initialNodes, initialEdges }: WorkflowEditorProps) => {
  return (
    <div className="size-full">
      <FlowChart initialNodes={initialNodes} initialEdges={initialEdges} />
    </div>
  );
});
