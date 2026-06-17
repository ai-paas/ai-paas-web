import { useAddFileToKnowledgeBase } from '@/hooks/service/knowledgebase';
import { Button, FileDrop, Modal, useToast } from '@innogrid/ui';
import { useCallback, useState } from 'react';

export const CreateKnowledgeBaseFileButton = ({
  knowledgeBaseId,
}: {
  knowledgeBaseId?: number;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { addFileAsync, isPending } = useAddFileToKnowledgeBase(knowledgeBaseId ?? 0);
  const toast = useToast();

  const openModal = useCallback(() => {
    if (!knowledgeBaseId) return;
    setIsModalOpen(true);
  }, [knowledgeBaseId]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setFiles([]);
  }, []);

  const handleAddFile = (added: File[]) => {
    setFiles((prev) => [...prev, ...added]);
  };

  const handleDeleteFile = ({ fileIndex }: { file: File; fileIndex: number }) => {
    setFiles((prev) => prev.filter((_, index) => index !== fileIndex));
  };

  const handleSubmit = async () => {
    if (!knowledgeBaseId || files.length === 0) return;

    try {
      for (const file of files) {
        await addFileAsync({ file });
      }
      toast.open({
        status: 'positive',
        title: '파일 생성 성공',
        children: '파일이 성공적으로 생성되었습니다.',
      });
      closeModal();
    } catch {
      toast.open({
        status: 'negative',
        title: '파일 생성 실패',
        children: '파일 생성 중 오류가 발생했습니다.',
      });
    }
  };

  return (
    <>
      <Button size="medium" color="primary" disabled={!knowledgeBaseId} onClick={openModal}>
        생성
      </Button>
      <Modal
        allowOutsideInteraction
        isOpen={isModalOpen}
        isButtonLoading={isPending}
        buttonDisabled={isPending || files.length === 0}
        size="small"
        title="파일 생성"
        buttonTitle="확인"
        onRequestClose={closeModal}
        action={handleSubmit}
        subButton={
          <Button size="large" color="secondary" onClick={closeModal}>
            취소
          </Button>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <div className="page-input_item-name page-icon-requisite">파일</div>
            <div className="page-input_item-data">
              <div className="page-input_item-data_fileUpload">
                <FileDrop
                  id="create-knowledge-base-file"
                  extensions={['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv']}
                  description={
                    <>
                      파일을 여기에 드래그하거나 클릭하여 업로드하세요. (파일당 최대 크기 15MB)
                      <br />
                      허용되는 파일 형식: pdf, doc, docx, xls, xlsx, ppt, pptx, csv
                    </>
                  }
                  files={files}
                  onAddFile={handleAddFile}
                  onDeleteFile={handleDeleteFile}
                  onError={({ errorMessage }) =>
                    toast.open({
                      status: 'negative',
                      title: '파일 업로드 실패',
                      children: errorMessage,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
