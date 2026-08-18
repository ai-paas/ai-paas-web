import { Button, Input, Modal, Select, Textarea, useToast } from '@innogrid/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import * as z from 'zod';
import { useGetServices } from '@/hooks/service/services';
import { useUpdateWorkflow } from '@/hooks/service/workflows';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import type { WorkflowStatus } from '@/types/workflow';
import { buildWorkflowDefinition } from './build-workflow-definition';
import { parseWorkflowError } from './parse-workflow-error';

type SelectOption = { text: string; value: string };

const schema = z.object({
  name: z.string().min(1, '이름은 필수입니다.'),
  service_id: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

interface UpdateWorkflowButtonProps {
  workflowId: string;
  status?: WorkflowStatus;
  serviceId?: string;
  category?: string;
  description?: string;
}

export const UpdateWorkflowButton = ({
  workflowId,
  status,
  serviceId,
  category,
  description,
}: UpdateWorkflowButtonProps) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { name, nodes, edges, setName } = useWorkflowStore();
  const { updateWorkflow, isPending } = useUpdateWorkflow();

  const [isOpen, setIsOpen] = useState(false);
  const { services } = useGetServices({ size: 100 });
  const serviceOptions = useMemo<SelectOption[]>(
    () => services.map((service) => ({ text: service.name, value: service.surro_service_id })),
    [services]
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', service_id: '', category: '', description: '' },
  });

  const selectedServiceId = watch('service_id') ?? '';
  const descriptionValue = watch('description') ?? '';
  const selectedServiceOption =
    serviceOptions.find((option) => option.value === selectedServiceId) ?? null;

  const openModal = useCallback(() => {
    // 캔버스 패널의 이름과 워크플로우의 기존 메타 정보를 모달 기본값으로 채운다.
    reset({
      name,
      service_id: serviceId ?? '',
      category: category ?? '',
      description: description ?? '',
    });
    setIsOpen(true);
  }, [name, serviceId, category, description, reset]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleUpdate = (data: Schema) => {
    updateWorkflow(
      {
        workflowId,
        name: data.name.trim(),
        // 부분 업데이트 API지만 폼에 보이는 값이 곧 저장값이 되도록 빈 값도 그대로 보낸다.
        description: data.description?.trim() ?? '',
        category: data.category?.trim() ?? '',
        // Select에 해제 옵션이 없어 빈 값은 '변경 없음'(필드 생략)으로 보낸다.
        service_id: data.service_id || undefined,
        status,
        workflow_definition: buildWorkflowDefinition(nodes, edges),
      },
      {
        onSuccess: () => {
          // 캔버스 이름도 최종 입력값으로 동기화한다.
          setName(data.name.trim());
          toast.open({
            status: 'positive',
            title: '워크플로우 업데이트 성공',
            children: '워크플로우가 성공적으로 업데이트되었습니다.',
          });
          closeModal();
          navigate('/workflow/workflow');
        },
        onError: async (error) => {
          toast.open({
            status: 'negative',
            title: '워크플로우 업데이트 실패',
            children: await parseWorkflowError(
              error,
              '워크플로우 업데이트 중 오류가 발생했습니다.'
            ),
          });
        },
      }
    );
  };

  return (
    <>
      <Button onClick={openModal} size="medium" color="primary" disabled={isPending}>
        수정
      </Button>
      <Modal
        allowOutsideInteraction
        isOpen={isOpen}
        isButtonLoading={isPending}
        buttonDisabled={isPending}
        title="워크플로우 수정"
        size="small"
        onRequestClose={closeModal}
        action={handleSubmit(handleUpdate)}
        buttonTitle="확인"
        subButton={
          <Button size="large" color="secondary" onClick={closeModal}>
            취소
          </Button>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <div className="page-input_item-name page-icon-requisite">워크플로우 이름</div>
            <div className="page-input_item-data">
              <Input
                placeholder="워크플로우 이름을 입력해주세요."
                errMessage={errors.name?.message}
                {...register('name')}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="page-input_item-name">서비스</div>
            <div className="page-input_item-data">
              <Select
                options={serviceOptions}
                getOptionLabel={(option: SelectOption) => option?.text ?? ''}
                getOptionValue={(option: SelectOption) => option?.value ?? ''}
                value={selectedServiceOption}
                placeholder="서비스를 선택해주세요."
                onChange={(option: SelectOption | null) =>
                  setValue('service_id', option?.value ?? '')
                }
                menuPosition="fixed"
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
        </div>
      </Modal>
    </>
  );
};
