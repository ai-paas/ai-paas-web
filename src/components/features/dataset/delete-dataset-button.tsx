import { useDeleteDataset } from '@/hooks/service/datasets';
import { AlertDialog, Button } from '@innogrid/ui';
import { useState } from 'react';

export const DeleteDatasetButton = ({ datasetId }: { datasetId?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { deleteDataset } = useDeleteDataset();

  const handleClickConfirm = () => {
    if (!datasetId) return;

    deleteDataset(datasetId);
  };

  return (
    <>
      <Button disabled={!datasetId} size="medium" color="negative" onClick={() => setIsOpen(true)}>
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
        <span>데이터셋을 삭제하시겠습니까?</span>
      </AlertDialog>
    </>
  );
};
