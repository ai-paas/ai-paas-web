import { AlertDialog, Button } from '@innogrid/ui';
import { useState } from 'react';

export const DeleteCustomModelButton = ({ customModelId }: { customModelId: number | null }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClickConfirm = () => {
    console.log('삭제');
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="medium"
        color="negative"
        disabled={!customModelId}
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
        <span>커스텀 모델을 삭제하시겠습니까?</span>
      </AlertDialog>
    </>
  );
};
