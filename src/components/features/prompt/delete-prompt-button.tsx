import { useDeletePrompt } from '@/hooks/service/prompts';
import { AlertDialog, Button } from '@innogrid/ui';
import { useState } from 'react';

export const DeletePromptButton = ({ promptId }: { promptId?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { deletePrompt } = useDeletePrompt();

  const handleConfirm = () => {
    if (!promptId) return;
    deletePrompt(promptId);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="medium" color="negative" disabled={!promptId}>
        삭제
      </Button>
      <AlertDialog
        isOpen={isOpen}
        confirmButtonText="확인"
        cancelButtonText="취소"
        onClickConfirm={handleConfirm}
        onClickClose={() => setIsOpen(false)}
        size="small"
      >
        <span>프롬프트를 삭제하시겠습니까?</span>
      </AlertDialog>
    </>
  );
};
