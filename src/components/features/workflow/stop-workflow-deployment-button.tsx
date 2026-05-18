import { Button, Modal, useToast } from '@innogrid/ui';
import { useState } from 'react';
import { useCleanupWorkflow, useFinalizeWorkflowCleanup } from '@/hooks/service/workflows';

interface StopWorkflowDeploymentButtonProps {
  workflowId?: string;
}

export const StopWorkflowDeploymentButton = ({ workflowId }: StopWorkflowDeploymentButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { cleanupWorkflow, isPending } = useCleanupWorkflow();
  const { finalizeWorkflowCleanup, isPending: isFinalizePending } = useFinalizeWorkflowCleanup();
  const toast = useToast();
  const isWorking = isPending || isFinalizePending;

  const handleClose = () => {
    if (isWorking) return;
    setIsOpen(false);
  };

  const handleStop = () => {
    if (!workflowId) return;

    cleanupWorkflow(
      { surro_workflow_id: workflowId },
      {
        onSuccess: () => {
          finalizeWorkflowCleanup(
            {
              surro_workflow_id: workflowId,
            },
            {
              onSuccess: () => {
                toast.open({
                  status: 'positive',
                  title: '배포 중지 성공',
                  children: '워크플로우 리소스 정리 완료 처리가 요청되었습니다.',
                });
                setIsOpen(false);
              },
              onError: () => {
                toast.open({
                  status: 'positive',
                  title: '배포 중지 시작',
                  children:
                    '리소스 정리가 시작되었습니다. 잠시 후 정리 완료 처리를 다시 시도해주세요.',
                });
                setIsOpen(false);
              },
            }
          );
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
