import { useDeleteFileFromKnowledgeBase } from '@/hooks/service/knowledgebase';
import { AlertDialog, Button, useToast } from '@innogrid/ui';
import { useState } from 'react';

export const DeleteKnowledgeBaseFileButton = ({
  knowledgeBaseId,
  fileIds,
  onDeleted,
}: {
  knowledgeBaseId?: number;
  fileIds: number[];
  onDeleted?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { deleteFileAsync, isPending } = useDeleteFileFromKnowledgeBase(knowledgeBaseId ?? 0);
  const toast = useToast();

  const handleClickConfirm = async () => {
    if (!knowledgeBaseId || fileIds.length === 0) return;

    try {
      for (const fileId of fileIds) {
        await deleteFileAsync(fileId);
      }
      toast.open({
        status: 'positive',
        title: '파일 삭제 성공',
        children: '파일이 성공적으로 삭제되었습니다.',
      });
      onDeleted?.();
    } catch {
      toast.open({
        status: 'negative',
        title: '파일 삭제 실패',
        children: '파일 삭제 중 오류가 발생했습니다.',
      });
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        disabled={!knowledgeBaseId || fileIds.length === 0 || isPending}
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
      >
        <span>선택한 파일 {fileIds.length}개를 삭제하시겠습니까?</span>
      </AlertDialog>
    </>
  );
};
