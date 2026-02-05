import { Button, Input, Modal, Textarea } from '@innogrid/ui';
import { useState, useCallback } from 'react';
import styles from '@/pages/service/service.module.scss';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setService((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
        <div className={styles.modalBox}>
          <div className={styles.inputBox}>
            <span>이름</span>
            <Input
              name="name"
              size={{ width: '100%', height: '32px' }}
              placeholder="이름을 입력해주세요."
              value={service.name}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputBox}>
            <span>설명</span>
            <Textarea
              name="description"
              placeholder="설명을 입력해주세요."
              value={service.description}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputBox}>
            <span>태그</span>
            <Input
              name="tags"
              size={{ width: '100%', height: '32px' }}
              placeholder="태그 내용을 입력해주세요."
              value={service.tags}
              onChange={handleChange}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
