import { IconDel, IconFileUp } from '@/assets/img/icon';
import { useCreateDataset, useGetDatasets, useValidateDataset } from '@/hooks/service/datasets';
import { useSubmitTraining } from '@/hooks/service/learning';
import { useGetModels } from '@/hooks/service/models';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Accordion,
  BreadCrumb,
  Button,
  Input,
  RadioButton,
  RadioGroupButton,
  Select,
  Stepper,
  Textarea,
  useToast,
} from '@innogrid/ui';
import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  useWatch,
  type SubmitHandler,
} from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import * as z from 'zod';

const schema = z.object({
  train_name: z.string().min(1, '이름은 필수입니다.'),
  description: z.string().optional(),
  source_type: z.enum(['upload', 'select']),
  dataset_id: z.number({ error: '데이터 셋을 선택해주세요.' }).optional(),
  model_id: z.number({ error: '모델을 선택해주세요.' }),
  epochs: z.string().min(1, 'Epochs는 필수입니다.'),
  batch_size: z.string().min(1, 'Batch는 필수입니다.'),
  save_period: z.string().min(1, 'Save period는 필수입니다.'),
  gpus: z.string().min(1, 'Gpus는 필수입니다.'),
  lr0: z.string().min(1, 'Lr0는 필수입니다.'),
  lrf: z.string().min(1, 'Lrf는 필수입니다.'),
  weight_decay: z.string().min(1, 'Weight decay는 필수입니다.'),
});

type FormValues = z.infer<typeof schema>;

const STEP_FIELDS: Record<number, (keyof FormValues)[]> = {
  0: ['train_name', 'description'],
  1: [],
  2: ['model_id', 'epochs', 'batch_size', 'save_period', 'gpus', 'lr0', 'lrf', 'weight_decay'],
  3: [],
};

const GPU_OPTIONS = [
  { text: '1개', value: '1' },
  { text: '2개', value: '2' },
  { text: '4개', value: '4' },
  { text: '8개', value: '8' },
];

export default function LearningCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isFileValidated, setIsFileValidated] = useState(false);
  const { submitTraining, isPending: isSubmittingTraining } = useSubmitTraining();
  const { createDataset, isPending: isCreatingDataset } = useCreateDataset();
  const isPending = isSubmittingTraining || isCreatingDataset;

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      train_name: '',
      description: '',
      source_type: 'select',
      epochs: '100',
      batch_size: '16',
      save_period: '-1',
      gpus: '1',
      lr0: '0.01',
      lrf: '0.01',
      weight_decay: '0.0005',
    },
    mode: 'onChange',
  });

  const handleClickNext = async () => {
    if (step === 1) {
      const sourceType = methods.getValues('source_type');
      if (sourceType === 'upload') {
        if (!uploadedFile) {
          toast.open({
            status: 'negative',
            title: '파일이 없습니다.',
            children: '먼저 파일을 업로드해주세요.',
          });
          return;
        }
        if (!isFileValidated) {
          toast.open({
            status: 'negative',
            title: '유효성 검증이 필요합니다.',
            children: '유효성 검증을 완료해주세요.',
          });
          return;
        }
        setStep((prev) => prev + 1);
        return;
      }
      const datasetId = methods.getValues('dataset_id');
      if (typeof datasetId !== 'number') {
        methods.setError('dataset_id', { type: 'manual', message: '데이터 셋을 선택해주세요.' });
        return;
      }
      setStep((prev) => prev + 1);
      return;
    }

    const fields = STEP_FIELDS[step];
    const valid = fields.length === 0 ? true : await methods.trigger(fields);
    if (valid && step < 3) setStep((prev) => prev + 1);
  };

  const handleClickPrevious = () => {
    if (step !== 0) setStep((prev) => prev - 1);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      let datasetId = data.dataset_id;

      if (data.source_type === 'upload') {
        if (!uploadedFile) {
          toast.open({
            status: 'negative',
            title: '파일이 없습니다.',
            children: '먼저 파일을 업로드해주세요.',
          });
          return;
        }
        const formData = new FormData();
        formData.append('name', data.train_name);
        formData.append('description', data.description ?? '');
        formData.append('file', uploadedFile);
        const dataset = await createDataset(formData);
        datasetId = dataset.id;
      }

      if (typeof datasetId !== 'number') {
        toast.open({
          status: 'negative',
          title: '데이터셋이 없습니다.',
          children: '데이터셋을 선택하거나 업로드해주세요.',
        });
        return;
      }

      await submitTraining({
        model_id: data.model_id,
        dataset_id: datasetId,
        train_name: data.train_name,
        description: data.description ?? '',
        gpus: data.gpus,
        batch_size: data.batch_size,
        epochs: data.epochs,
        save_period: data.save_period,
        weight_decay: data.weight_decay,
        lr0: data.lr0,
        lrf: data.lrf,
      });
      toast.open({
        status: 'positive',
        title: '학습 생성 성공',
        children: '학습이 성공적으로 생성되었습니다.',
      });
      navigate('/learning');
    } catch (error) {
      toast.open({
        status: 'negative',
        title: '학습 생성 실패',
        children: error instanceof Error ? error.message : '학습 생성 중 오류가 발생했습니다.',
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <main>
        <div className="breadcrumbBox">
          <BreadCrumb
            items={[{ label: '학습', path: '/learning' }, { label: '학습 생성' }]}
            onNavigate={navigate}
          />
        </div>
        <div className="page-title-box">
          <h2 className="page-title">학습 생성</h2>
        </div>
        <div className="page-content-stepper">
          <div className="page-stepper-box">
            <Stepper
              step={step}
              steps={[
                { title: '기본 설정' },
                { title: '데이터 설정' },
                { title: '모델 학습 설정' },
                { title: '검토' },
              ]}
            />
          </div>
          <div className="page-content-stepper-desc">
            {step === 0 && <Step1 />}
            {step === 1 && (
              <Step2
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
                isFileValidated={isFileValidated}
                setIsFileValidated={setIsFileValidated}
              />
            )}
            {step === 2 && <Step3 />}
            {step === 3 && <Step4 uploadedFile={uploadedFile} />}

            <div className="page-footer">
              <div className="page-footer_btn-box">
                <Button size="large" color="secondary" onClick={() => navigate('/learning')}>
                  취소
                </Button>
                <div className="flex gap-1.5">
                  <Button
                    size="large"
                    color="tertiary"
                    disabled={step === 0}
                    onClick={handleClickPrevious}
                  >
                    이전
                  </Button>
                  {step === 3 ? (
                    <Button
                      size="large"
                      color="primary"
                      disabled={isPending}
                      isLoading={isPending}
                      onClick={methods.handleSubmit(onSubmit)}
                    >
                      생성
                    </Button>
                  ) : (
                    <div className="btn-next">
                      <Button size="large" color="primary" onClick={handleClickNext}>
                        다음
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </FormProvider>
  );
}

const Step1 = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormValues>();

  return (
    <div className="page-content page-pb-40">
      <div className="page-input-box">
        <div className="page-input_title">기본 설정</div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">이름</div>
          <div className="page-input_item-data">
            <Input
              placeholder="이름을 입력해주세요."
              errMessage={errors.train_name?.message}
              {...register('train_name')}
            />
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
  );
};

type Step2Props = {
  uploadedFile: File | null;
  setUploadedFile: Dispatch<SetStateAction<File | null>>;
  isFileValidated: boolean;
  setIsFileValidated: Dispatch<SetStateAction<boolean>>;
};

const Step2 = ({
  uploadedFile,
  setUploadedFile,
  isFileValidated,
  setIsFileValidated,
}: Step2Props) => {
  const { control } = useFormContext<FormValues>();
  const toast = useToast();
  const { datasets, isPending } = useGetDatasets({ size: 100 });
  const { validateDataset } = useValidateDataset();
  const sourceType = useWatch({ control, name: 'source_type' });
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const datasetOptions = useMemo(
    () => datasets.map((d) => ({ text: d.name, value: d.id })),
    [datasets]
  );

  const handleValidate = async () => {
    if (!uploadedFile) {
      toast.open({
        status: 'negative',
        title: '파일이 없습니다.',
        children: '먼저 파일을 업로드해주세요.',
      });
      return;
    }
    setIsValidating(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      const response = await validateDataset(formData);
      setIsFileValidated(response.is_valid);
      toast.open({
        status: response.is_valid ? 'positive' : 'negative',
        title: response.is_valid ? '유효성 검증 성공' : '유효성 검증 실패',
        children:
          response.message ||
          (response.is_valid ? '유효한 파일입니다.' : '유효하지 않은 파일입니다.'),
      });
    } catch (error) {
      setIsFileValidated(false);
      toast.open({
        status: 'negative',
        title: '유효성 검증 실패',
        children: error instanceof Error ? error.message : '파일 검증 중 오류가 발생했습니다.',
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="page-content page-pb-40">
      <div className="page-input-box">
        <div className="page-input_title">데이터 설정</div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">데이터 유형</div>
          <div className="page-input_item-data">
            <div className="page-input_item_round-box">
              <div className="page-input_item_round-name">이미지 데이터 셋</div>
              <div className="page-input_item_round-data">
                <RadioButton id="type-object" label="객체감지" value="object" checked readOnly />
              </div>
            </div>
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">데이터 셋</div>
          <div className="page-input_item-data">
            <div className="page-input_item-col2">
              <Controller
                control={control}
                name="source_type"
                render={({ field }) => (
                  <RadioGroupButton
                    id="source-type"
                    options={[
                      { label: '파일 업로드', value: 'upload' },
                      { label: '데이터 셋 설정', value: 'select' },
                    ]}
                    orientation="vertical"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        </div>
        {sourceType === 'upload' && (
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">파일 업로드</div>
            <div className="page-input_item-data">
              <div className="page-input_item-data_fileUpload">
                <label className="fileUpload-preview">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    className="fileUpload-file"
                    onChange={(e) => {
                      setUploadedFile(e.target.files?.[0] ?? null);
                      setIsFileValidated(false);
                    }}
                  />
                  <IconFileUp />
                  <p className="fileUpload-preview_msg">
                    파일을 여기에 드래그하거나 <b>클릭하여 업로드</b>하세요. (파일당 최대 크기 15MB)
                    <br />
                    허용되는 파일 형식:zip
                  </p>
                </label>
                {uploadedFile && (
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3.5 text-[13px]">
                      <span className="shrink cursor-default text-ellipsis whitespace-nowrap text-[#525252]">
                        {uploadedFile.name}
                      </span>
                      <span className="shrink-0 cursor-default leading-5 whitespace-nowrap text-[#999]">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        setIsFileValidated(false);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="flex size-7 items-center justify-center fill-gray-600 hover:fill-[#dc4646]"
                    >
                      <IconDel />
                    </button>
                  </div>
                )}
              </div>
              <div className="page-flex-right page-pt-10">
                <Button
                  color="secondary"
                  onClick={handleValidate}
                  disabled={!uploadedFile || isValidating || isFileValidated}
                  isLoading={isValidating}
                >
                  {isFileValidated ? '검증 완료' : '유효성 검증'}
                </Button>
              </div>
            </div>
          </div>
        )}
        {sourceType === 'select' && (
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">데이터 셋 선택</div>
            <div className="page-input_item-data">
              <Controller
                control={control}
                name="dataset_id"
                render={({ field, fieldState }) => (
                  <Select
                    className="page-input_item-data_select"
                    options={datasetOptions}
                    getOptionLabel={(option) => option.text}
                    getOptionValue={(option) => String(option.value)}
                    value={datasetOptions.find((o) => o.value === field.value) ?? null}
                    onChange={(option) => field.onChange(option?.value)}
                    placeholder={isPending ? '불러오는 중...' : '데이터 셋을 선택해주세요.'}
                    errMessage={fieldState.error?.message}
                  />
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Step3 = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<FormValues>();
  const { models, isPending } = useGetModels({ size: 100 }, {});

  const modelOptions = useMemo(() => models.map((m) => ({ text: m.name, value: m.id })), [models]);

  return (
    <div className="page-content page-pb-40">
      <div className="page-input-box">
        <div className="page-input_title">모델 설정</div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">모델</div>
          <div className="page-input_item-data">
            <Controller
              control={control}
              name="model_id"
              render={({ field, fieldState }) => (
                <Select
                  className="page-input_item-data_select"
                  options={modelOptions}
                  getOptionLabel={(option) => option.text}
                  getOptionValue={(option) => String(option.value)}
                  value={modelOptions.find((o) => o.value === field.value) ?? null}
                  onChange={(option) => field.onChange(option?.value)}
                  placeholder={isPending ? '불러오는 중...' : '모델을 선택해주세요.'}
                  errMessage={fieldState.error?.message}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="page-input-box page-input-hr">
        <div className="page-input_title">하이퍼 파라미터 설정</div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">Epochs</div>
          <div className="page-input_item-data">
            <Input
              type="number"
              placeholder="Epochs 값을 입력해주세요."
              errMessage={errors.epochs?.message}
              {...register('epochs')}
            />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">Batch</div>
          <div className="page-input_item-data">
            <Input
              type="number"
              placeholder="Batch 값을 입력해주세요."
              errMessage={errors.batch_size?.message}
              {...register('batch_size')}
            />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">Save period</div>
          <div className="page-input_item-data">
            <Input
              type="number"
              placeholder="Save period 값을 입력해주세요."
              errMessage={errors.save_period?.message}
              {...register('save_period')}
            />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">Gpus</div>
          <div className="page-input_item-data">
            <Controller
              control={control}
              name="gpus"
              render={({ field, fieldState }) => (
                <Select
                  className="page-input_item-data_select"
                  options={GPU_OPTIONS}
                  getOptionLabel={(option) => option.text}
                  getOptionValue={(option) => option.value}
                  value={GPU_OPTIONS.find((o) => o.value === field.value) ?? null}
                  onChange={(option) => field.onChange(option?.value)}
                  errMessage={fieldState.error?.message}
                />
              )}
            />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">Lr0</div>
          <div className="page-input_item-data">
            <Input
              type="number"
              step="0.01"
              placeholder="Lr0 값을 입력해주세요."
              errMessage={errors.lr0?.message}
              {...register('lr0')}
            />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">Lrf</div>
          <div className="page-input_item-data">
            <Input
              type="number"
              step="0.01"
              placeholder="Lrf 값을 입력해주세요."
              errMessage={errors.lrf?.message}
              {...register('lrf')}
            />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">Weight decay</div>
          <div className="page-input_item-data">
            <Input
              type="number"
              step="0.0001"
              placeholder="Weight decay 값을 입력해주세요."
              errMessage={errors.weight_decay?.message}
              {...register('weight_decay')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

type Step4Props = {
  uploadedFile: File | null;
};

const Step4 = ({ uploadedFile }: Step4Props) => {
  const { control } = useFormContext<FormValues>();
  const values = useWatch({ control });
  const { datasets } = useGetDatasets({ size: 100 });
  const { models } = useGetModels({ size: 100 }, {});

  const datasetDisplay =
    values.source_type === 'upload'
      ? (uploadedFile?.name ?? '-')
      : (datasets.find((d) => d.id === values.dataset_id)?.name ?? '-');
  const modelName = models.find((m) => m.id === values.model_id)?.name ?? '-';

  const accordionItems1 = [
    {
      label: '기본 정보',
      component: (
        <div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">이름</div>
            <div className="page-accordion_item-data">{values.train_name || '-'}</div>
          </div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">설명</div>
            <div className="page-accordion_item-data">{values.description || '-'}</div>
          </div>
        </div>
      ),
    },
  ];

  const accordionItems2 = [
    {
      label: '데이터 설정',
      component: (
        <div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">데이터 유형</div>
            <div className="page-accordion_item-data">객체 감지</div>
          </div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">
              {values.source_type === 'upload' ? '업로드 파일' : '데이터 셋'}
            </div>
            <div className="page-accordion_item-data">{datasetDisplay}</div>
          </div>
        </div>
      ),
    },
  ];

  const accordionItems3 = [
    {
      label: '모델 설정',
      component: (
        <div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">모델</div>
            <div className="page-accordion_item-data">{modelName}</div>
          </div>
          <div className="page-accordion_item-box">하이퍼파라미터</div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">Epochs</div>
            <div className="page-accordion_item-data">{values.epochs}</div>
          </div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">Batch</div>
            <div className="page-accordion_item-data">{values.batch_size}</div>
          </div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">Save period</div>
            <div className="page-accordion_item-data">{values.save_period}</div>
          </div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">Gpus</div>
            <div className="page-accordion_item-data">{values.gpus}개</div>
          </div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">Lr0</div>
            <div className="page-accordion_item-data">{values.lr0}</div>
          </div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">Lrf</div>
            <div className="page-accordion_item-data">{values.lrf}</div>
          </div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">Weight decay</div>
            <div className="page-accordion_item-data">{values.weight_decay}</div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="page-content page-pb-40">
      <div className="page-accordion-box">
        <Accordion components={accordionItems1} defaultValue="0" />
        <Accordion components={accordionItems2} defaultValue="0" />
        <Accordion components={accordionItems3} defaultValue="0" />
      </div>
    </div>
  );
};
