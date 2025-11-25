import { Button, Input, Modal, Textarea } from '@innogrid/ui';
import { useCallback, useEffect, useState } from 'react';
import styles from '../../../pages/service/service.module.scss';
import { useGetService, useUpdateService } from '@/hooks/service/services';

interface ServiceFormData {
  name: string;
  description: string;
  tags: string;
}

const INITIAL_FORM_DATA: ServiceFormData = {
  name: '',
  description: '',
  tags: '',
};

export const EditServiceButton = ({ serviceId }: { serviceId?: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { service } = useGetService(serviceId, isModalOpen && !!serviceId);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const { updateService } = useUpdateService();

  const openModal = useCallback(() => {
    if (!serviceId) return;
    setIsModalOpen(true);
  }, [serviceId]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setFormData(INITIAL_FORM_DATA);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!serviceId) return;
    updateService({
      surro_service_id: serviceId,
      ...formData,
      tags: formData.tags.split(',').map((tag) => tag.trim()),
    });
    closeModal();
  };

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        tags: service.tags?.join(', ') ?? '',
      });
    }
  }, [service, isModalOpen]);

  return (
    <>
      <Button size="medium" color="secondary" disabled={!serviceId} onClick={openModal}>
        편집
      </Button>
      <Modal
        allowOutsideInteraction
        isOpen={isModalOpen}
        title="서비스 편집"
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
              placeholder="이름을 입력해주세요."
              name="name"
              value={formData.name}
              onChange={handleChange}
              size={{ width: '100%', height: '32px' }}
            />
          </div>
          <div className={styles.inputBox}>
            <span>설명</span>
            <Textarea name="description" value={formData.description} onChange={handleChange} />
          </div>
          <div className={styles.inputBox}>
            <span>태그</span>
            <Input
              size={{ width: '100%', height: '32px' }}
              placeholder="태그 내용을 입력해주세요."
              name="tags"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
