import { Button, useToast } from '@innogrid/ui';
import { useNavigate } from 'react-router';
import { useCreateWorkflow } from '@/hooks/service/workflows';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { buildWorkflowDefinition } from './build-workflow-definition';
import { parseWorkflowError } from './parse-workflow-error';

export const SubmitWorkflowButton = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { name, nodes, edges } = useWorkflowStore();
  const { createWorkflow, isPending } = useCreateWorkflow();

  const handleCreate = () => {
    createWorkflow(
      { name, workflow_definition: buildWorkflowDefinition(nodes, edges) },
      {
        onSuccess: () => {
          toast.open({
            status: 'positive',
            title: '워크플로우 생성 성공',
            children: '워크플로우가 성공적으로 생성되었습니다.',
          });
          navigate('/workflow/workflow');
        },
        onError: async (error) => {
          toast.open({
            status: 'negative',
            title: '워크플로우 생성 실패',
            children: await parseWorkflowError(error, '워크플로우 생성 중 오류가 발생했습니다.'),
          });
        },
      }
    );
  };

  return (
    <Button onClick={handleCreate} size="medium" color="primary" disabled={isPending}>
      생성
    </Button>
  );
};
