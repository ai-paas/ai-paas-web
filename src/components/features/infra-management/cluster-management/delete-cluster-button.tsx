import { Button } from '@innogrid/ui';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { useRef, useState } from 'react';
import { useDeleteCluster } from '@/hooks/service/clusters';

interface DeleteClusterButtonProps {
  // 단일 모드는 string, 다중 모드는 배열. 둘 다 받아 호환성 유지.
  clusterId?: string | null;
  clusterIds?: string[];
  onDeleteSuccess?: () => void;
  /** 단건 삭제 확인 창에 함께 사라지는 것을 적는다. 노드 수처럼 실제 값. */
  consequence?: string;
}

export const DeleteClusterButton = ({
  clusterId,
  clusterIds,
  onDeleteSuccess,
  consequence,
}: DeleteClusterButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  // onDeleteSuccess는 navigate 등 비멱등 콜백일 수 있어 setState 업데이터 밖에서 호출한다.
  // (StrictMode는 업데이터를 두 번 실행한다)
  const remainingRef = useRef(0);

  const ids: string[] = clusterIds && clusterIds.length > 0 ? clusterIds : clusterId ? [clusterId] : [];

  const { deleteCluster } = useDeleteCluster({
    onSuccess: () => {
      remainingRef.current = Math.max(0, remainingRef.current - 1);
      setPendingCount(remainingRef.current);
      if (remainingRef.current === 0) {
        setIsOpen(false);
        onDeleteSuccess?.();
      }
    },
    onError: () => {
      remainingRef.current = Math.max(0, remainingRef.current - 1);
      setPendingCount(remainingRef.current);
    },
  });

  const isPending = pendingCount > 0;

  const handleClickConfirm = () => {
    if (ids.length === 0) return;
    remainingRef.current = ids.length;
    setPendingCount(ids.length);
    ids.forEach((id) => deleteCluster(id));
  };

  const label = isPending ? `삭제 중... (${pendingCount})` : ids.length > 1 ? `삭제 (${ids.length})` : '삭제';

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="medium"
        color="negative"
        disabled={ids.length === 0 || isPending}
      >
        {label}
      </Button>
      {/* 단건은 이름을 쳐야 지워진다. 여러 건은 이름을 다 치게 하면 일괄 삭제가 막힌다. */}
      <ConfirmDeleteDialog
        isOpen={isOpen}
        resourceType="클러스터"
        resourceName={ids.length === 1 ? ids[0] : undefined}
        count={ids.length}
        consequence={ids.length === 1 ? consequence : undefined}
        isPending={isPending}
        onConfirm={handleClickConfirm}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};