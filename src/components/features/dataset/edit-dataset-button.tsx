import { Button, Modal } from '@innogrid/ui';
import { useCallback, useState } from 'react';

interface DatasetFormData {
  name: string;
  description: string;
}

const INITIAL_FORM_DATA: DatasetFormData = {
  name: '',
  description: '',
};

export const EditDatasetButton = ({ datasetId }: { datasetId?: number }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const openModal = useCallback(() => {
    if (!datasetId) return;
    setIsModalOpen(true);
  }, [datasetId]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setFormData(INITIAL_FORM_DATA);
  }, []);

  const handleSubmit = () => {
    if (!datasetId) return;
    closeModal();
  };

  return (
    <>
      <Button size="medium" color="secondary" disabled={!datasetId} onClick={openModal}>
        편집
      </Button>
      <Modal
        allowOutsideInteraction
        isOpen={isModalOpen}
        size="small"
        title="데이터셋 편집"
        buttonTitle="확인"
        onRequestClose={closeModal}
        action={handleSubmit}
        subButton={
          <Button size="large" color="secondary" onClick={closeModal}>
            취소
          </Button>
        }
      >
        <div>hello</div>
      </Modal>
    </>
  );
};
