import { Button, useToast } from '@innogrid/ui';
import { useNavigate } from 'react-router';
import { useUpdateWorkflowTemplate } from '@/hooks/service/workflows';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import type { WorkflowStatus } from '@/types/workflow';
import { buildWorkflowDefinition } from './build-workflow-definition';
import { parseWorkflowError } from './parse-workflow-error';

interface UpdateWorkflowTemplateButtonProps {
  templateId: string;
  description?: string;
  category?: string;
  status?: WorkflowStatus;
}

export const UpdateWorkflowTemplateButton = ({
  templateId,
  description,
  category,
  status,
}: UpdateWorkflowTemplateButtonProps) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { name, nodes, edges } = useWorkflowStore();
  const { updateWorkflowTemplate, isPending } = useUpdateWorkflowTemplate();

  const handleUpdate = () => {
    updateWorkflowTemplate(
      {
        templateId,
        name,
        description,
        category,
        status,
        workflow_definition: buildWorkflowDefinition(nodes, edges),
      },
      {
        onSuccess: () => {
          toast.open({
            status: 'positive',
            title: '템플릿 업데이트 성공',
            children: '워크플로우 템플릿이 성공적으로 업데이트되었습니다.',
          });
          navigate('/workflow/templates');
        },
        onError: async (error) => {
          toast.open({
            status: 'negative',
            title: '템플릿 업데이트 실패',
            children: await parseWorkflowError(error, '템플릿 업데이트 중 오류가 발생했습니다.'),
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
