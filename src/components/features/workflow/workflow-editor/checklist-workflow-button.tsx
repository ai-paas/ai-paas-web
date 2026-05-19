import { Button, useToast } from '@innogrid/ui';
import { useValidateWorkflow } from '@/hooks/service/workflows';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { buildWorkflowDefinition } from './build-workflow-definition';
import { parseWorkflowError } from './parse-workflow-error';
import type { ValidationCheck } from '@/types/workflow';

const formatFailedChecks = (checks: ValidationCheck[]) =>
  checks
    .filter((c) => !c.passed)
    .map((c) => `• ${c.rule}${c.message ? `: ${c.message}` : ''}`)
    .join('\n');

export const ChecklistWorkflowButton = () => {
  const toast = useToast();
  const { nodes, edges } = useWorkflowStore();
  const { validateWorkflow, isPending } = useValidateWorkflow();

  const handleChecklist = () => {
    validateWorkflow(
      { workflow_definition: buildWorkflowDefinition(nodes, edges) },
      {
        onSuccess: (result) => {
          if (result.valid) {
            toast.open({
              status: 'positive',
              title: '체크리스트 통과',
              children: '모든 검증 규칙을 통과했습니다.',
            });
            return;
          }

          toast.open({
            status: 'negative',
            title: '체크리스트 실패',
            children: formatFailedChecks(result.checks) || '검증에 실패했습니다.',
          });
        },
        onError: async (error) => {
          toast.open({
            status: 'negative',
            title: '체크리스트 실패',
            children: await parseWorkflowError(error, '검증 요청 중 오류가 발생했습니다.'),
          });
        },
      }
    );
  };

  return (
    <Button onClick={handleChecklist} size="medium" color="tertiary" disabled={isPending}>
      체크리스트
    </Button>
  );
};
