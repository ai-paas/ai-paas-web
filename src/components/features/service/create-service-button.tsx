import { Button, Input, Modal, Textarea } from '@innogrid/ui';
import { useState, useCallback } from 'react';
import { useCreateService } from '@/hooks/service/services';

interface ServiceState {
  name: string;
  description: string;
  tags: string;
}

const INITIAL_SERVICE_STATE: ServiceState = {
  name: '',
  description: '',
  tags: '',
};

export const CreateServiceButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [service, setService] = useState<ServiceState>(INITIAL_SERVICE_STATE);
  const { createService } = useCreateService();

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setService(INITIAL_SERVICE_STATE);
  }, []);

  const handleSubmit = useCallback(() => {
    createService({
      name: service.name,
      description: service.description,
      tags: service.tags ? service.tags.split(',').map((tag) => tag.trim()) : [],
    });
    closeModal();
  }, [createService, service, closeModal]);

  return (
    <>
      <Button onClick={openModal} size="medium" color="primary">
        생성
      </Button>
      <Modal
        allowOutsideInteraction
        isOpen={isModalOpen}
        title="서비스 생성"
        size="small"
        onRequestClose={closeModal}
        action={handleSubmit}
        buttonTitle="확인"
        subButton={
          <Button size="large" color="secondary" onClick={closeModal}>
            취소
          </Button>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <div className="page-input_item-name page-icon-requisite">이름</div>
            <div className="page-input_item-data">
              <Input placeholder="이름을 입력해주세요." />
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="page-input_item-name">설명</div>
            <div className="page-input_item-data">
              <Textarea value="" placeholder="설명을 입력해주세요." />
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="page-input_item-name">태그</div>
            <div className="page-input_item-data">
              <Input placeholder="태그 내용을 입력해주세요." />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
