import { useDeletePrompt } from '@/hooks/service/prompts';
import { AlertDialog, Button, useToast } from '@innogrid/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export const DeletePromptButton = ({
  promptId,
  redirect,
}: {
  promptId?: number;
  redirect?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { deletePrompt } = useDeletePrompt();
  const navigate = useNavigate();
  const toast = useToast();

  const handleConfirm = () => {
    if (!promptId) return;
    deletePrompt(promptId, {
      onSuccess: () => {
        if (redirect) {
          navigate(redirect, { replace: true });
        }
      },
      onError: () => {
        toast.open({
          status: 'negative',
          title: '프롬프트 삭제 실패',
          children: '프롬프트 삭제 중 오류가 발생했습니다.',
        });
      },
    });
  };

  return (
    <>
      <Button disabled={!promptId} onClick={() => setIsOpen(true)} size="medium" color="negative">
        삭제
      </Button>
      <AlertDialog
        isOpen={isOpen}
        confirmButtonText="확인"
        cancelButtonText="취소"
        onClickConfirm={handleConfirm}
        onClickClose={() => setIsOpen(false)}
      >
        <span>프롬프트를 삭제하시겠습니까?</span>
      </AlertDialog>
    </>
  );
};
