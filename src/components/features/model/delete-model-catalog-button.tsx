import { useDeleteModel } from '@/hooks/service/models';
import { AlertDialog, Button } from '@innogrid/ui';
import { useState } from 'react';

export const DeleteModelCatalogButton = ({ modelCatalogId }: { modelCatalogId: number | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { deleteModel } = useDeleteModel();

  const handleClickConfirm = () => {
    if (!modelCatalogId) return;
    deleteModel(modelCatalogId);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="medium"
        color="negative"
        disabled={!modelCatalogId}
      >
        삭제
      </Button>
      <AlertDialog
        isOpen={isOpen}
        confirmButtonText="확인"
        cancelButtonText="취소"
        onClickConfirm={handleClickConfirm}
        onClickClose={() => setIsOpen(false)}
      >
        <span>모델 카탈로그를 삭제하시겠습니까?</span>
      </AlertDialog>
    </>
  );
};
