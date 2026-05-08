import { Button, useToast } from '@innogrid/ui';
import { useNavigate } from 'react-router';
import { useUpdateWorkflow } from '@/hooks/service/workflows';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import type { WorkflowStatus } from '@/types/workflow';
import { buildWorkflowDefinition } from './build-workflow-definition';
import { parseWorkflowError } from './parse-workflow-error';

interface UpdateWorkflowButtonProps {
  workflowId: string;
  status?: WorkflowStatus;
  serviceId?: string;
}

export const UpdateWorkflowButton = ({
  workflowId,
  status,
  serviceId,
}: UpdateWorkflowButtonProps) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { name, nodes, edges } = useWorkflowStore();
  const { updateWorkflow, isPending } = useUpdateWorkflow();

  const handleUpdate = () => {
    updateWorkflow(
      {
        workflowId,
        name,
        status,
        service_id: serviceId,
        workflow_definition: buildWorkflowDefinition(nodes, edges),
      },
      {
        onSuccess: () => {
          toast.open({
            status: 'positive',
            title: '워크플로우 업데이트 성공',
            children: '워크플로우가 성공적으로 업데이트되었습니다.',
          });
          navigate(`/workflow/${workflowId}`);
        },
        onError: async (error) => {
          toast.open({
            status: 'negative',
            title: '워크플로우 업데이트 실패',
            children: await parseWorkflowError(
              error,
              '워크플로우 업데이트 중 오류가 발생했습니다.'
            ),
          });
        },
      }
    );
  };

  return (
    <Button onClick={handleUpdate} size="medium" color="primary" disabled={isPending}>
      확인
    </Button>
  );
};
