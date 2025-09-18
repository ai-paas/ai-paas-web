import { Button, Input, Modal, Textarea } from '@innogrid/ui';
import { useState, useCallback } from 'react';
import styles from '@/pages/service/service.module.scss';
import { useCreateService } from '@/hooks/service/services';

interface ServiceFormData {
  name: string;
  description: string;
  tag: string;
}

const INITIAL_FORM_DATA: ServiceFormData = {
  name: '',
  description: '',
  tag: '',
};

export const CreateServiceButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>(INITIAL_FORM_DATA);
  const { createService } = useCreateService();

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setFormData(INITIAL_FORM_DATA);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = useCallback(() => {
    createService(formData);
    closeModal();
  }, [createService, formData, closeModal]);

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
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputBox}>
            <span>설명</span>
            <Textarea
              name="description"
              placeholder="설명을 입력해주세요."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputBox}>
            <span>태그</span>
            <Input
              name="tag"
              size={{ width: '100%', height: '32px' }}
              placeholder="태그 내용을 입력해주세요."
              value={formData.tag}
              onChange={handleChange}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
