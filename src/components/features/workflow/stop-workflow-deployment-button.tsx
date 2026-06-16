import { Button, Modal, useToast } from '@innogrid/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useCleanupWorkflow, useFinalizeWorkflowCleanup } from '@/hooks/service/workflows';
import { queryKeys } from '@/lib/query-keys';

interface StopWorkflowDeploymentButtonProps {
  workflowId?: string;
}

export const StopWorkflowDeploymentButton = ({ workflowId }: StopWorkflowDeploymentButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cleanupRunId, setCleanupRunId] = useState<string>();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { cleanupWorkflow, isPending } = useCleanupWorkflow();
  const { status, result, isPolling, isError } = useFinalizeWorkflowCleanup({
    surro_workflow_id: workflowId,
    run_id: cleanupRunId,
    enabled: Boolean(cleanupRunId),
  });

  const isWorking = isPending || (Boolean(cleanupRunId) && isPolling);

  const handleStop = () => {
    if (!workflowId) return;

    cleanupWorkflow(
      { surro_workflow_id: workflowId },
      {
        onSuccess: (data) => {
          setCleanupRunId(data.cleanup_run_id);
        },
        onError: () => {
          toast.open({
            status: 'negative',
            title: '배포 중지 실패',
            children: '워크플로우 배포 중지 중 오류가 발생했습니다.',
          });
        },
      }
    );
  };

  useEffect(() => {
    if (!cleanupRunId) return;

    if (status === 'completed') {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
      toast.open({
        status: 'positive',
        title: '배포 중지 성공',
        children: '워크플로우 리소스 정리가 완료되었습니다.',
      });
      setCleanupRunId(undefined);
      setIsOpen(false);
      return;
    }

    if (status === 'failed' || isError) {
      toast.open({
        status: 'negative',
        title: '배포 중지 실패',
        children: result?.message ?? '워크플로우 리소스 정리에 실패했습니다.',
      });
      setCleanupRunId(undefined);
    }
  }, [status, isError, cleanupRunId, result?.message, queryClient, toast]);

  const handleClose = () => {
    if (isWorking) return;
    setIsOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="medium"
        color="negative"
        disabled={!workflowId || isWorking}
      >
        배포 중지
      </Button>
      <Modal
        allowOutsideInteraction
        isOpen={isOpen}
        isButtonLoading={isWorking}
        buttonDisabled={isWorking}
        title="배포 중지"
        size="small"
        onRequestClose={handleClose}
        action={handleStop}
        buttonTitle="확인"
        subButton={
          <Button size="large" color="secondary" onClick={handleClose}>
            취소
          </Button>
        }
      >
        <div>워크플로우 배포를 중지하시겠습니까?</div>
      </Modal>
    </>
  );
};
