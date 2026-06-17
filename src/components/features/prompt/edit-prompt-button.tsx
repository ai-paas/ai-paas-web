import { Button, Input, Modal, Textarea, useToast } from '@innogrid/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGetPrompt, useGetPromptVariableTypes, useUpdatePrompt } from '@/hooks/service/prompts';
import { PromptEditor } from '@/components/ui/prompt-editor';

const schema = z.object({
  name: z.string().min(1, '이름은 필수입니다.'),
  description: z.string().optional(),
  content: z.string().min(1, '프롬프트 내용은 필수입니다.'),
});

type Schema = z.infer<typeof schema>;

const extractVariables = (content: string): string[] => {
  const matches = content.matchAll(/\{\{#\s*([^{}#]+?)\s*#\}\}/g);
  return [...new Set([...matches].map((match) => match[1]))];
};

export const EditPromptButton = ({ promptId }: { promptId?: number }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { prompt } = useGetPrompt(isModalOpen ? promptId : undefined);
  const { updatePrompt, isPending } = useUpdatePrompt();
  const { availableTypes } = useGetPromptVariableTypes();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', content: '' },
  });

  const content = watch('content');
  const variables = useMemo(() => extractVariables(content ?? ''), [content]);
  const invalidVariables = useMemo(
    () => variables.filter((v) => !availableTypes.includes(v)),
    [variables, availableTypes]
  );

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
    if (invalidVariables.length > 0) {
      toast.open({
        status: 'negative',
        title: '사용할 수 없는 변수',
        children: `사용할 수 없는 변수입니다: ${invalidVariables.map((v) => `{{#${v}#}}`).join(', ')}`,
      });
      return;
    }
    updatePrompt(
      {
        surro_prompt_id: promptId,
        name: data.name,
        description: data.description ?? '',
        content: data.content,
        prompt_variable: variables,
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
        buttonDisabled={isPending || invalidVariables.length > 0}
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
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    placeholder="설명을 입력해주세요."
                    errMessage={errors.description?.message}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="page-input_item-name page-icon-requisite">프롬프트 내용</div>
            <div className="page-input_item-data">
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <PromptEditor
                    placeholder="프롬프트를 입력해주세요."
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    height={240}
                    allowedVariables={availableTypes}
                  />
                )}
              />
              {invalidVariables.length > 0 ? (
                <p className="page-input_item-input-desc" style={{ color: '#d92d20' }}>
                  사용할 수 없는 변수입니다: {invalidVariables.map((v) => `{{#${v}#}}`).join(', ')}
                </p>
              ) : (
                <p className="page-input_item-input-desc">
                  {'{{#변수명#}}'} 형식으로 변수를 지정할 수 있습니다. 사용 가능한 변수:{' '}
                  {availableTypes.length > 0
                    ? availableTypes.map((type) => `{{#${type}#}}`).join(', ')
                    : '없음'}
                </p>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
