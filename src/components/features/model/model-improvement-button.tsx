import { useGetImprovementTaskTypes, useSubmitImprovement } from '@/hooks/service/models';
import type { ModelImprovementCategory, ModelImprovementTaskType } from '@/types/model';
import { Button, Modal, Select, useToast } from '@innogrid/ui';
import { useState } from 'react';

interface ModelImprovementButtonProps {
  /** 대상 모델 ID */
  customModelId?: number;
  /** optimization(하드웨어 최적화) 또는 lightweight(모델 경량화) */
  category: ModelImprovementCategory;
  /** 버튼/모달 제목 */
  title: string;
  /** Select 라벨 (예: "최적화 방식", "경량화 방식") */
  selectLabel: string;
  /** 모달을 감싸는 바깥 wrapper 스타일 */
  wrapperStyle?: React.CSSProperties;
}

export const ModelImprovementButton = ({
  customModelId,
  category,
  title,
  selectLabel,
  wrapperStyle,
}: ModelImprovementButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState<ModelImprovementTaskType>();
  const toast = useToast();

  const { taskTypes } = useGetImprovementTaskTypes(
    { category, source_model_id: customModelId },
    { enabled: isModalOpen && !!customModelId }
  );
  const { submitImprovement, isPending } = useSubmitImprovement();

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTaskType(undefined);
  };

  const handleSubmit = async () => {
    if (!customModelId || !selectedTaskType) return;

    try {
      await submitImprovement({
        source_model_id: customModelId,
        task_type: selectedTaskType.name,
      });
      toast.open({
        status: 'positive',
        title: `${title} 요청 완료`,
        children: `${title} task가 생성되었습니다. 처리가 완료되면 결과 모델이 등록됩니다.`,
      });
      closeModal();
    } catch {
      toast.open({
        status: 'negative',
        title: `${title} 요청 실패`,
        children: `${title} task 생성 중 오류가 발생했습니다.`,
      });
    }
  };

  return (
    <>
      <div style={wrapperStyle}>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="medium"
          color="secondary"
          disabled={!customModelId}
        >
          {title}
        </Button>
      </div>
      <Modal
        allowOutsideInteraction
        isOpen={isModalOpen}
        title={title}
        size="small"
        onRequestClose={closeModal}
        action={handleSubmit}
        isButtonLoading={isPending}
        buttonTitle="확인"
        subButton={
          <Button size="large" color="secondary" onClick={closeModal}>
            취소
          </Button>
        }
      >
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">{selectLabel}</div>
          <div className="page-input_item-data mt-2.5">
            <Select
              menuPosition="fixed"
              options={taskTypes}
              getOptionLabel={(option: ModelImprovementTaskType) => option.name}
              getOptionValue={(option: ModelImprovementTaskType) => option.name}
              value={selectedTaskType ?? null}
              onChange={(option: ModelImprovementTaskType | null) =>
                setSelectedTaskType(option ?? undefined)
              }
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
