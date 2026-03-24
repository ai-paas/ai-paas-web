import { Button } from '@innogrid/ui';
import { useReactFlow } from '@xyflow/react';

export const WorkflowCreateButton = () => {
  const { getNodes, getEdges } = useReactFlow();

  const handleCreate = () => {
    const nodes = getNodes();
    const edges = getEdges();
    console.log('Creating workflow with nodes:', nodes, 'and edges:', edges);
  };

  return (
    <Button onClick={handleCreate} size="medium" color="primary">
      생성
    </Button>
  );
};
