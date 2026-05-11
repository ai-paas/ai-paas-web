import { useDeleteWorkflow } from '@/hooks/service/workflows';
import { AlertDialog, Button, useToast } from '@innogrid/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';

interface DeleteWorkflowButtonProps {
  workflowId?: string;
  workflowName?: string;
  redirect?: string;
  onDeleted?: () => void;
}

export const DeleteWorkflowButton = ({
  workflowId,
  workflowName,
  redirect,
  onDeleted,
}: DeleteWorkflowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { deleteWorkflow, isPending } = useDeleteWorkflow();
  const navigate = useNavigate();
  const toast = useToast();

  const hasWorkflow = workflowId !== undefined && workflowId !== null && `${workflowId}` !== '';

  const handleOpen = () => {
    if (!hasWorkflow) return;
    setIsOpen(true);
  };

  const handleClickConfirm = () => {
    if (!hasWorkflow) return;

    deleteWorkflow(workflowId, {
      onSuccess: () => {
        toast.open({
          status: 'positive',
          title: '워크플로우 삭제 성공',
          children: '워크플로우가 성공적으로 삭제되었습니다.',
        });
        setIsOpen(false);
        onDeleted?.();
        if (redirect) {
          navigate(redirect);
        }
      },
      onError: () => {
        toast.open({
          status: 'negative',
          title: '워크플로우 삭제 실패',
          children: '워크플로우 삭제 중 오류가 발생했습니다.',
        });
      },
    });
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        size="medium"
        color="negative"
        disabled={!hasWorkflow || isPending}
      >
        삭제
      </Button>
      <AlertDialog
        isOpen={isOpen}
        confirmButtonText={isPending ? '삭제 중...' : '확인'}
        cancelButtonText="취소"
        onClickConfirm={handleClickConfirm}
        onClickClose={() => !isPending && setIsOpen(false)}
      >
        <span>
          {workflowName
            ? `${workflowName} 워크플로우를 삭제하시겠습니까?`
            : '워크플로우를 삭제하시겠습니까?'}
        </span>
      </AlertDialog>
    </>
  );
};
