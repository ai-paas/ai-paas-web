import { useGetModelForOptimizer, useGetOptimizers, useOptimize } from '@/hooks/service/models';
import type { OptimizeRequest } from '@/types/model';
import { Button, Modal, Select } from '@innogrid/ui';
import { useState } from 'react';

const INITIAL_HARDWARE_OPTIMIZATION = {
  optimizer_id: 0,
  saved_model_run_id: '',
  saved_model_path: '',
  model_name: '',
  args: {},
};

export const HardwareOptimizationButton = ({ customModelId }: { customModelId?: number }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { modelForOptimizer } = useGetModelForOptimizer(customModelId);
  const { optimizers } = useGetOptimizers({ model_id: customModelId });
  const [hardwareOptimization, setHardwareOptimization] = useState<OptimizeRequest>(
    INITIAL_HARDWARE_OPTIMIZATION
  );
  const { optimize, isPending } = useOptimize();

  const handleOptimize = async () => {
    console.log(hardwareOptimization);
    if (
      !hardwareOptimization.optimizer_id ||
      !hardwareOptimization.model_name ||
      !hardwareOptimization.saved_model_run_id ||
      !hardwareOptimization.saved_model_path
    )
      return;

    await optimize(hardwareOptimization);
    setIsModalOpen(false);
  };

  return (
    <>
      <div style={{ marginLeft: '20px' }}>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="medium"
          color="secondary"
          disabled={!customModelId}
        >
          하드웨어 최적화
        </Button>
      </div>
      <Modal
        allowOutsideInteraction
        isOpen={isModalOpen}
        title="하드웨어 최적화"
        size="small"
        onRequestClose={() => setIsModalOpen(false)}
        action={handleOptimize}
        isButtonLoading={isPending}
        buttonTitle="확인"
        subButton={
          <Button size="large" color="secondary" onClick={() => setIsModalOpen(false)}>
            취소
          </Button>
        }
      >
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">최적화 방식</div>
          <div className="page-input_item-data mt-2.5">
            <Select
              size="m-full"
              menuPosition="fixed"
              options={optimizers}
              getOptionLabel={(option) => option.optimizer_name}
              getOptionValue={(option) => option.id.toString()}
              value={optimizers.find((option) => option.id === hardwareOptimization.optimizer_id)}
              onChange={(option) => {
                setHardwareOptimization({
                  optimizer_id: option?.id || 0,
                  saved_model_run_id: modelForOptimizer?.run_id ?? '',
                  saved_model_path: modelForOptimizer?.path ?? '',
                  model_name: modelForOptimizer?.model_name ?? '',
                  args: option?.argument,
                });
              }}
              styles={{ menuPortal: (base) => ({ ...base, top: 'unset', left: 'unset' }) }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
