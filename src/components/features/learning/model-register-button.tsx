import { useRegisterModel } from '@/hooks/service/learning';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Modal, Textarea, useToast } from '@innogrid/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const schema = z.object({
  model_name: z.string().min(1, '이름은 필수입니다.'),
  description: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

export const ModelRegisterButton = ({ experimentId }: { experimentId?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { registerModel, isPending } = useRegisterModel();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<Schema>({ resolver: zodResolver(schema), defaultValues: { description: '' } });

  const description = watch('description');

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  const onSubmit = async (data: Schema) => {
    if (!experimentId) return;

    try {
      await registerModel({
        model_name: data.model_name,
        description: data.description ?? '',
        experiment_id: experimentId,
      });
      toast.open({
        status: 'positive',
        title: '모델 등록 성공',
        children: '모델이 성공적으로 등록되었습니다.',
      });
      handleClose();
    } catch {
      toast.open({
        status: 'negative',
        title: '모델 등록 실패',
        children: '모델 등록 중 오류가 발생했습니다.',
      });
    }
  };

  return (
    <>
      <div style={{ marginLeft: '20px' }}>
        <Button
          onClick={() => setIsOpen(true)}
          size="medium"
          color="secondary"
          disabled={!experimentId}
        >
          모델 등록
        </Button>
      </div>
      <Modal
        allowOutsideInteraction
        isOpen={isOpen}
        buttonDisabled={isPending}
        title="모델 등록"
        size="small"
        onRequestClose={handleClose}
        action={handleSubmit(onSubmit)}
        buttonTitle="확인"
        subButton={
          <Button size="large" color="secondary" onClick={handleClose}>
            취소
          </Button>
        }
      >
        <div className="space-y-[18px]">
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">이름</div>
            <div className="page-input_item-data mt-2.5">
              <Input
                placeholder="이름을 입력해주세요."
                errMessage={errors.model_name?.message}
                {...register('model_name')}
              />
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">설명</div>
            <div className="page-input_item-data mt-2.5">
              <Textarea
                placeholder="설명을 입력해주세요."
                value={description ?? ''}
                errMessage={errors.description?.message}
                {...register('description')}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
