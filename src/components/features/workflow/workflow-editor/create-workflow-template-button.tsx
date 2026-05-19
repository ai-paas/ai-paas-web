import { Button, Input, Modal, Textarea, useToast } from '@innogrid/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import * as z from 'zod';
import { useCreateWorkflowTemplate } from '@/hooks/service/workflows';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { buildWorkflowDefinition } from './build-workflow-definition';
import { parseWorkflowError } from './parse-workflow-error';

const schema = z.object({
  name: z.string().min(1, '이름은 필수입니다.'),
  description: z.string().optional(),
  category: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

interface CreateWorkflowTemplateButtonProps {
  buttonTitle?: string;
  redirect?: string;
}

export const CreateWorkflowTemplateButton = ({
  buttonTitle = '생성',
  redirect,
}: CreateWorkflowTemplateButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { nodes, edges } = useWorkflowStore();
  const { createWorkflowTemplate, isPending } = useCreateWorkflowTemplate();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', category: '' },
  });

  const descriptionValue = watch('description') ?? '';

  const openModal = useCallback(() => {
    reset({ name: '', description: '', category: '' });
    setIsModalOpen(true);
  }, [reset]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    reset({ name: '', description: '', category: '' });
  }, [reset]);

  const handleCreateTemplate = (data: Schema) => {
    createWorkflowTemplate(
      {
        name: data.name,
        description: data.description ?? '',
        category: data.category ?? '',
        workflow_definition: buildWorkflowDefinition(nodes, edges),
      },
      {
        onSuccess: () => {
          toast.open({
            status: 'positive',
            title: '템플릿 생성 성공',
            children: '워크플로우 템플릿이 성공적으로 생성되었습니다.',
          });
          closeModal();
          if (redirect) {
            navigate(redirect);
          }
        },
        onError: async (error) => {
          toast.open({
            status: 'negative',
            title: '템플릿 생성 실패',
            children: await parseWorkflowError(error, '템플릿 생성 중 오류가 발생했습니다.'),
          });
        },
      }
    );
  };

  return (
    <>
      <Button onClick={openModal} size="medium" color="secondary" disabled={isPending}>
        {buttonTitle}
      </Button>
      <Modal
        allowOutsideInteraction
        isOpen={isModalOpen}
        isButtonLoading={isPending}
        buttonDisabled={isPending}
        title="템플릿 생성"
        size="small"
        onRequestClose={closeModal}
        action={handleSubmit(handleCreateTemplate)}
        buttonTitle="확인"
        subButton={
          <Button size="large" color="secondary" onClick={closeModal}>
            취소
          </Button>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <div className="page-input_item-name page-icon-requisite">템플릿 이름</div>
            <div className="page-input_item-data">
              <Input
                placeholder="템플릿 이름을 입력해주세요."
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
            <div className="page-input_item-name">카테고리</div>
            <div className="page-input_item-data">
              <Input
                placeholder="카테고리를 입력해주세요."
                errMessage={errors.category?.message}
                {...register('category')}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
