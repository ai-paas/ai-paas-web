import { Button, Input, Modal, Textarea, useToast } from '@innogrid/ui';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGetPrompt, useUpdatePrompt } from '@/hooks/service/prompts';

const schema = z.object({
  name: z.string().min(1, '이름은 필수입니다.'),
  description: z.string().optional(),
  content: z.string().min(1, '프롬프트 내용은 필수입니다.'),
});

type Schema = z.infer<typeof schema>;

export const EditPromptButton = ({ promptId }: { promptId?: number }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { prompt } = useGetPrompt(promptId);
  const { updatePrompt, isPending } = useUpdatePrompt();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', content: '' },
  });

  const descriptionValue = watch('description') ?? '';
  const contentValue = watch('content') ?? '';

  const openModal = useCallback(() => {
    if (!promptId) return;
    setIsModalOpen(true);
  }, [promptId]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    reset({ name: '', description: '', content: '' });
  }, [reset]);

  const onSubmit = (data: Schema) => {
    if (!promptId) return;
    updatePrompt(
      {
        surro_prompt_id: promptId,
        name: data.name,
        description: data.description ?? '',
        content: data.content,
        prompt_variable: prompt?.prompt_variable?.map((v) => v.name) ?? [],
      },
      {
        onSuccess: () => {
          toast.open({
            status: 'positive',
            title: '프롬프트 편집 성공',
            children: '프롬프트가 성공적으로 편집되었습니다.',
          });
          closeModal();
        },
        onError: () => {
          toast.open({
            status: 'negative',
            title: '프롬프트 편집 실패',
            children: '프롬프트 편집 중 오류가 발생했습니다.',
          });
        },
      }
    );
  };

  useEffect(() => {
    if (prompt && isModalOpen) {
      reset({
        name: prompt.name,
        description: prompt.description ?? '',
        content: prompt.content ?? '',
      });
    }
  }, [prompt, isModalOpen, reset]);

  return (
    <>
      <Button size="medium" color="secondary" disabled={!promptId} onClick={openModal}>
        편집
      </Button>
      <Modal
        allowOutsideInteraction
        isOpen={isModalOpen}
        isButtonLoading={isPending}
        buttonDisabled={isPending}
        size="small"
        title="프롬프트 편집"
        buttonTitle="확인"
        onRequestClose={closeModal}
        action={handleSubmit(onSubmit)}
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
              <Input
                placeholder="이름을 입력해주세요."
                errMessage={errors.name?.message}
                {...register('name')}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="page-input_item-name">설명</div>
            <div className="page-input_item-data">
              <Textarea
                placeholder="설명을 입력해주세요."
                errMessage={errors.description?.message}
                {...register('description')}
                value={descriptionValue}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="page-input_item-name page-icon-requisite">프롬프트 내용</div>
            <div className="page-input_item-data">
              <Textarea
                placeholder="프롬프트를 입력해주세요."
                errMessage={errors.content?.message}
                {...register('content')}
                value={contentValue}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
