import { useDeleteKnowledgeBase } from '@/hooks/service/knowledgebase';
import { AlertDialog, Button } from '@innogrid/ui';
import { useState } from 'react';

export const DeleteKnowledgeBaseButton = ({ knowledgeBaseId }: { knowledgeBaseId?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { deleteKnowledgeBase } = useDeleteKnowledgeBase();

  const handleClickConfirm = () => {
    if (!knowledgeBaseId) return;
    deleteKnowledgeBase(knowledgeBaseId);
  };

  return (
    <>
      <Button
        disabled={!knowledgeBaseId}
        size="medium"
        color="negative"
        onClick={() => setIsOpen(true)}
      >
        삭제
      </Button>
      <AlertDialog
        isOpen={isOpen}
        confirmButtonText="확인"
        cancelButtonText="취소"
        onClickConfirm={handleClickConfirm}
        onClickClose={() => setIsOpen(false)}
        size="small"
      >
        <span>지식 베이스를 삭제하시겠습니까?</span>
      </AlertDialog>
    </>
  );
};
