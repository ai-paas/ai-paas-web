import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { IconDocument, IconFileUp } from '@/assets/img/icon';
import { Button, Input, Textarea, useToast } from '@innogrid/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useValidateDataset, useCreateDataset } from '@/hooks/service/datasets';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(1, '이름은 필수입니다.'),
  description: z.string().optional(),
  file: z
    .instanceof(File, { error: '파일이 필요합니다.' })
    .refine((file) => {
      const isZip =
        file.name.endsWith('.zip') ||
        file.type === 'application/zip' ||
        file.type === 'application/x-zip-compressed';
      return isZip;
    }, 'zip 파일만 업로드 가능합니다.')
    .refine((file) => file.size <= 50 * 1024 * 1024, '파일 크기는 50MB 이하여야 합니다.'),
});

type Schema = z.infer<typeof schema>;

export const DatasetForm = () => {
  const navigate = useNavigate();
  const { validateDataset } = useValidateDataset();
  const { createDataset, isPending } = useCreateDataset();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    resetField,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Schema>({ resolver: zodResolver(schema) });

  const selectedFile = watch('file');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await validateDataset(formData);

      if (!response.is_valid) {
        setError('file', { type: 'manual', message: '유효하지 않은 데이터셋 구조입니다.' });
        e.target.value = '';
        resetField('file');
        return;
      }

      clearErrors('file');
      setValue('file', file, { shouldValidate: true });
    } catch (error) {
      setError('file', { type: 'manual', message: '파일 검증 중 서버 오류가 발생했습니다.' });
      e.target.value = '';
    }
  };

  const onSubmit = async (data: Schema) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('file', data.file);

    try {
      await createDataset(formData);
      toast.open({
        status: 'positive',
        title: '데이터셋 생성 성공',
        children: '데이터셋이 성공적으로 생성되었습니다.',
      });
      navigate('/dataset');
    } catch {
      toast.open({
        status: 'negative',
        title: '데이터셋 생성 실패',
        children: '데이터셋 생성 중 오류가 발생했습니다.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="page-title-box">
        <h2 className="page-title">데이터 셋 생성</h2>
      </div>
      <div className="page-content page-pb-40">
        <div className="page-input-box">
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">이름</div>
            <div className="page-input_item-data">
              <Input
                placeholder="이름을 입력해주세요."
                errMessage={errors.name?.message}
                {...register('name')}
              />
              {!errors.name?.message && (
                <p className="page-input_item-input-desc">데이터셋의 이름을 입력하세요.</p>
              )}
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">학습 파일</div>
            <div className="page-input_item-data">
              <div className="page-input_item-data_fileUpload">
                <label className="fileUpload-preview">
                  <input
                    type="file"
                    accept=".zip, application/zip, application/x-zip-compressed"
                    onChange={handleFileChange}
                    className="fileUpload-file"
                  />
                  <IconFileUp />
                  <p className="fileUpload-preview_msg">
                    파일을 여기에 드래그하거나 클릭하여 업로드하세요.
                    <br />
                    (zip 50MB 이하)
                  </p>
                </label>
                {selectedFile && (
                  <div className="flex items-center gap-2">
                    <IconDocument className="page-icon-document" />
                    <span>{selectedFile.name}</span>
                  </div>
                )}
                {errors.file && (
                  <p className="mt-1 text-xs leading-[1.5] -tracking-[.5px] text-[#dc4646]">
                    {errors.file.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">설명</div>
            <div className="page-input_item-data">
              <Textarea
                placeholder="설명을 입력해주세요."
                errMessage={errors.description?.message}
                {...register('description')}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="page-footer">
        <div className="page-footer_btn-box">
          <div />
          <div>
            <Button size="large" color="secondary" onClick={() => navigate('/dataset')}>
              취소
            </Button>
            <Button
              type="submit"
              size="large"
              color="primary"
              disabled={isPending}
              isLoading={isPending}
            >
              생성
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
