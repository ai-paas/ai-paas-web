import { AlertDialog, Button } from '@innogrid/ui';
import { useState } from 'react';
import { useDeleteCluster } from '@/hooks/service/clusters';

interface DeleteClusterButtonProps {
  clusterId?: string | null;
  onDeleteSuccess?: () => void;
}

export const DeleteClusterButton = ({ clusterId, onDeleteSuccess }: DeleteClusterButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { deleteCluster, isPending } = useDeleteCluster({
    onSuccess: () => {
      setIsOpen(false);
      onDeleteSuccess?.();
    },
  });

  const handleClickConfirm = () => {
    if (clusterId) {
      deleteCluster(clusterId);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="medium"
        color="negative"
        disabled={!clusterId || isPending}
      >
        {isPending ? '삭제 중...' : '삭제'}
      </Button>
      <AlertDialog
        isOpen={isOpen}
        confirmButtonText="확인"
        cancelButtonText="취소"
        onClickConfirm={handleClickConfirm}
        onClickClose={() => setIsOpen(false)}
        size="small"
      >
        <span>클러스터를 삭제하시겠습니까?</span>
      </AlertDialog>
    </>
  );
};
