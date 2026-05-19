import { Button, Modal, useToast } from '@innogrid/ui';
import { useState } from 'react';
import { isExecuteTimeoutError, useExecuteWorkflow } from '@/hooks/service/workflows';

interface ExecuteWorkflowButtonProps {
  workflowId?: string;
  onStarted?: () => void;
}

export const ExecuteWorkflowButton = ({ workflowId, onStarted }: ExecuteWorkflowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { executeWorkflow, isPending } = useExecuteWorkflow();
  const toast = useToast();

  const handleClose = () => {
    if (isPending) return;
    setIsOpen(false);
  };

  const handleExecute = () => {
    if (!workflowId) return;

    executeWorkflow(
      { surro_workflow_id: workflowId },
      {
        onSuccess: () => {
          toast.open({
            status: 'positive',
            title: '워크플로우 실행 성공',
            children: '워크플로우 실행이 시작되었습니다.',
          });
          setIsOpen(false);
          onStarted?.();
        },
        onError: async (error) => {
          if (await isExecuteTimeoutError(error)) {
            toast.open({
              status: 'positive',
              title: '워크플로우 실행 확인 중',
              children: '응답 시간이 초과되어 배포 상태 확인으로 전환합니다.',
            });
            setIsOpen(false);
            onStarted?.();
            return;
          }

          toast.open({
            status: 'negative',
            title: '워크플로우 실행 실패',
            children: '워크플로우 실행 중 오류가 발생했습니다.',
          });
        },
      }
    );
  };

  return (
    <>
      <div style={{ marginLeft: '20px' }}>
        <Button
          onClick={() => setIsOpen(true)}
          size="medium"
          color="secondary"
          disabled={!workflowId || isPending}
        >
          실행
        </Button>
      </div>
      <Modal
        allowOutsideInteraction
        isOpen={isOpen}
        isButtonLoading={isPending}
        buttonDisabled={isPending}
        title="워크플로우 실행"
        size="small"
        onRequestClose={handleClose}
        action={handleExecute}
        buttonTitle="확인"
        subButton={
          <Button size="large" color="secondary" onClick={handleClose}>
            취소
          </Button>
        }
      >
        <div>워크플로우를 실행하시겠습니까?</div>
      </Modal>
    </>
  );
};
