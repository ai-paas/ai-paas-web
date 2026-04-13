import { useCreateWorkflow } from '@/hooks/service/workflows';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { Button } from '@innogrid/ui';

export const SubmitWorkflowButton = () => {
  const { name, nodes, edges } = useWorkflowStore();
  const { createWorkflow } = useCreateWorkflow();

  const handleCreate = async () => {
    console.log('Creating workflow with nodes:', nodes, 'and edges:', edges, 'name:', name);
  };

  return (
    <Button onClick={handleCreate} size="medium" color="primary">
      생성
    </Button>
  );
};
