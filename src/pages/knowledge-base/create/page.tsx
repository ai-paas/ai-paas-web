import {
  Accordion,
  BreadCrumb,
  Button,
  FileDrop,
  Input,
  RadioGroupButton,
  Select,
  Slider,
  Stepper,
  Textarea,
  useToast,
} from '@innogrid/ui';
import { useNavigate } from 'react-router';
import { IconArrCount, IconDocument } from '../../../assets/img/icon';
import { useState } from 'react';
import {
  useCreateKnowledgeBase,
  useGetChunkTypes,
  useGetLanguages,
  useGetSearchMethods,
} from '@/hooks/service/knowledgebase';
import { useGetModels, useGetModelTypes } from '@/hooks/service/models';
import type { ChunkType, SearchMethod } from '@/types/knowledgebase';
import type { Model } from '@/types/model';
import {
  KNOWLEDGE_BASE_DEFAULTS,
  KNOWLEDGE_BASE_FILE_EXTENSIONS,
  KNOWLEDGE_BASE_LIMITS,
  VERIFIED_EMBEDDING_MODEL_IDS,
  buildKnowledgeBaseCreatePayload,
  createInitialKnowledgeBaseFormValues,
  getFirstKnowledgeBaseFormError,
  getKnowledgeBaseCreateErrorMessage,
  validateKnowledgeBaseForm,
  type KnowledgeBaseFormErrors,
  type KnowledgeBaseFormField,
  type KnowledgeBaseFormValues,
} from './knowledge-base-form';

export default function KnowledgeBaseCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState<number>(0);
  const { createKnowledgeBase, isPending } = useCreateKnowledgeBase();
  const [formData, setFormData] = useState<KnowledgeBaseFormValues>(
    createInitialKnowledgeBaseFormValues
  );
  const [errors, setErrors] = useState<KnowledgeBaseFormErrors>({});

  const clearError = (field: KnowledgeBaseFormField) => {
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const showValidationErrors = (nextErrors: KnowledgeBaseFormErrors) => {
    const message = getFirstKnowledgeBaseFormError(nextErrors);
    setErrors(nextErrors);
    if (!message) return false;

    toast.open({
      status: 'negative',
      title: '입력값을 확인해주세요.',
      children: message,
    });
    return true;
  };

  const handleClickNext = () => {
    if (step >= 2) return;

    const nextErrors = validateKnowledgeBaseForm(formData, step === 0 ? 'basic' : 'embedding');
    if (showValidationErrors(nextErrors)) return;

    setErrors({});
    setStep((prev) => prev + 1);
  };

  const handleClickPrevious = () => {
    if (step !== 0) setStep((prev) => prev - 1);
  };

  const handleClickCreate = async () => {
    const nextErrors = validateKnowledgeBaseForm(formData, 'all');
    if (showValidationErrors(nextErrors)) {
      const basicFields: KnowledgeBaseFormField[] = ['name', 'description', 'file'];
      const hasBasicError = basicFields.some((field) => nextErrors[field]);
      setStep(hasBasicError ? 0 : 1);
      return;
    }

    setErrors({});
    try {
      const created = await createKnowledgeBase(buildKnowledgeBaseCreatePayload(formData));
      toast.open({
        status: 'positive',
        title: '지식 베이스 생성 성공',
        children: '지식 베이스가 성공적으로 생성되었습니다.',
      });
      navigate(`/knowledge-base/${created.surro_knowledge_id}`);
    } catch (error) {
      toast.open({
        status: 'negative',
        title: '지식 베이스 생성 실패',
        children: (
          <>
            {getKnowledgeBaseCreateErrorMessage(error)}
            <br />
            다시 시도하면 파일이 다시 업로드됩니다.
          </>
        ),
      });
    }
  };

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[{ label: '지식 베이스', path: '/knowledge-base' }, { label: '지식 베이스 생성' }]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">지식 베이스</h2>
      </div>
      <div className="page-content-stepper">
        <div className="page-stepper-box">
          <Stepper
            step={step}
            steps={[{ title: '기본 설정' }, { title: '임베딩 설정' }, { title: '검토' }]}
          />
        </div>
        <div className="page-content-stepper-desc">
          {step === 0 && (
            <Step1
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              clearError={clearError}
            />
          )}
          {step === 1 && (
            <Step2
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              clearError={clearError}
            />
          )}
          {step === 2 && <Step3 formData={formData} />}
          {step === 2 && isPending && (
            <div
              className="mx-10 mb-10 rounded-lg border border-[#d9dee8] bg-[#f7f9fc] p-5"
              role="status"
              aria-live="polite"
            >
              <div className="mb-2 text-sm font-semibold">
                파일을 업로드하고 문서를 처리하고 있습니다.
              </div>
              <p className="mt-2 text-xs leading-5 text-[#667085]">
                대용량 파일은 업로드와 임베딩에 수 분 이상 걸릴 수 있습니다. 생성 결과가 확인될
                때까지 이 화면을 유지해주세요.
              </p>
            </div>
          )}

          <div className="page-footer">
            <div className="page-footer_btn-box">
              <Button
                size="large"
                color="secondary"
                disabled={isPending}
                onClick={() => navigate('/knowledge-base')}
              >
                취소
              </Button>
              <div className="flex gap-1.5">
                <Button
                  size="large"
                  color="tertiary"
                  disabled={step === 0 || isPending}
                  onClick={handleClickPrevious}
                >
                  이전
                </Button>
                {step === 2 ? (
                  <Button
                    size="large"
                    color="primary"
                    onClick={handleClickCreate}
                    disabled={isPending}
                  >
                    {isPending ? '생성 중...' : '생성'}
                  </Button>
                ) : (
                  <div className="btn-next">
                    <Button
                      size="large"
                      color="primary"
                      disabled={isPending}
                      onClick={handleClickNext}
                    >
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
  );
}

interface Step1Props {
  formData: KnowledgeBaseFormValues;
  setFormData: React.Dispatch<React.SetStateAction<KnowledgeBaseFormValues>>;
  errors: KnowledgeBaseFormErrors;
  clearError: (field: KnowledgeBaseFormField) => void;
}

const Step1 = ({ formData, setFormData, errors, clearError }: Step1Props) => {
  const toast = useToast();

  const handleAddFile = (files: File[]) => {
    setFormData((prev) => ({ ...prev, file: files[0] ?? null }));
    clearError('file');
  };

  const handleDeleteFile = () => {
    setFormData((prev) => ({ ...prev, file: null }));
  };

  return (
    <div className="page-content page-pb-40">
      <div className="page-input-box">
        <div className="page-input_title">기본 설정</div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">이름</div>
          <div className="page-input_item-data">
            <Input
              placeholder="이름을 입력해주세요."
              value={formData.name}
              errMessage={errors.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                clearError('name');
              }}
            />
            {!errors.name && (
              <p className="page-input_item-input-desc">지식 베이스 이름을 입력해주세요.</p>
            )}
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">설명</div>
          <div className="page-input_item-data">
            <Textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="설명을 입력해주세요."
            />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">파일</div>
          <div className="page-input_item-data">
            <div className="page-input_item-data_fileUpload">
              <FileDrop
                id="knowledge-base-file"
                extensions={[...KNOWLEDGE_BASE_FILE_EXTENSIONS]}
                description={
                  <>
                    파일을 여기에 드래그하거나 클릭하여 업로드하세요.
                    <br />
                    허용되는 파일 형식: pdf, doc, docx, xls, xlsx, ppt, pptx, csv
                  </>
                }
                files={formData.file ? [formData.file] : []}
                onAddFile={handleAddFile}
                onDeleteFile={handleDeleteFile}
                onError={({ errorMessage }) =>
                  toast.open({
                    status: 'negative',
                    title: '파일 업로드 실패',
                    children: errorMessage,
                  })
                }
              />
              {errors.file ? (
                <p className="mt-1 text-xs leading-normal text-[#dc4646]">{errors.file}</p>
              ) : (
                <p className="mt-2 text-xs leading-5 text-[#667085]">
                  대용량 파일은 업로드·임베딩에 수 분 이상 걸릴 수 있으며, 서버 처리 실패 시 다시
                  업로드해야 할 수 있습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Step2Props {
  formData: KnowledgeBaseFormValues;
  setFormData: React.Dispatch<React.SetStateAction<KnowledgeBaseFormValues>>;
  errors: KnowledgeBaseFormErrors;
  clearError: (field: KnowledgeBaseFormField) => void;
}

const parseNumericInput = (value: string) => (value === '' ? Number.NaN : Number(value));
const displayNumericInput = (value: number) => (Number.isFinite(value) ? String(value) : '');
const roundToOneDecimal = (value: number) => Math.round(value * 10) / 10;
const getSliderValue = (value: number, fallback: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : fallback));

const Step2 = ({ formData, setFormData, errors, clearError }: Step2Props) => {
  const { chunkTypes } = useGetChunkTypes();
  const { languages } = useGetLanguages();
  const { searchMethods } = useGetSearchMethods();
  const { modelTypes } = useGetModelTypes({ type_name: 'Embedding' });
  const { models } = useGetModels(
    { page: 1, size: 999, model_type_id: modelTypes[0]?.id },
    { enabled: !!modelTypes.length }
  );
  const verifiedModels = models.filter((model) =>
    VERIFIED_EMBEDDING_MODEL_IDS.includes(model.id as (typeof VERIFIED_EMBEDDING_MODEL_IDS)[number])
  );

  return (
    <div className="page-content page-pb-40">
      <div className="page-input-box">
        <div className="page-input_title">청크 설정</div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">청크 길이</div>
          <div className="page-input_item-data">
            <Input
              type="number"
              placeholder="청크 길이를 입력해주세요."
              min={KNOWLEDGE_BASE_LIMITS.chunkSize.min}
              max={KNOWLEDGE_BASE_LIMITS.chunkSize.max}
              step={1}
              value={displayNumericInput(formData.chunk_size)}
              errMessage={errors.chunk_size}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData((prev) => ({
                  ...prev,
                  chunk_size: parseNumericInput(e.target.value),
                }));
                clearError('chunk_size');
              }}
            />
            {!errors.chunk_size && (
              <p className="page-input_item-input-desc">300~1,000자 범위에서 500자를 권장합니다.</p>
            )}
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">청크 중첩</div>
          <div className="page-input_item-data">
            <Input
              type="number"
              placeholder="청크 중첩을 입력해주세요."
              min={0}
              max={
                Number.isFinite(formData.chunk_size)
                  ? Math.max(0, formData.chunk_size - 1)
                  : undefined
              }
              step={1}
              value={displayNumericInput(formData.chunk_overlap)}
              errMessage={errors.chunk_overlap}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData((prev) => ({
                  ...prev,
                  chunk_overlap: parseNumericInput(e.target.value),
                }));
                clearError('chunk_overlap');
              }}
            />
            {!errors.chunk_overlap && (
              <p className="page-input_item-input-desc">
                청크 길이보다 작아야 하며, 청크 길이의 10~20%를 권장합니다.
              </p>
            )}
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">청크 타입</div>
          <div className="page-input_item-data">
            <Select
              classNames={{ container: () => 'page-input_item-data_select' }}
              options={chunkTypes}
              getOptionLabel={(option: ChunkType) => option.name}
              getOptionValue={(option: ChunkType) => option.id.toString()}
              value={
                chunkTypes.find((type: ChunkType) => type.id === formData.chunk_type.id) ?? null
              }
              isError={!!errors.chunk_type}
              errMessage={errors.chunk_type}
              onChange={(option: ChunkType | null) => {
                if (option) {
                  setFormData((prev) => ({ ...prev, chunk_type: option }));
                  clearError('chunk_type');
                }
              }}
            />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">언어</div>
          <div className="page-input_item-data">
            <div className="page-input_item-col2">
              <RadioGroupButton
                id="language"
                options={languages.map((lang) => ({
                  label: lang.description,
                  value: String(lang.id),
                }))}
                orientation="vertical"
                value={String(formData.language.id)}
                onValueChange={(languageId: string) => {
                  const selectedLanguage = languages.find((lang) => lang.id === Number(languageId));
                  if (selectedLanguage) {
                    setFormData((prev) => ({ ...prev, language: selectedLanguage }));
                    clearError('language');
                  }
                }}
              />
              {errors.language && (
                <p className="mt-1 text-xs leading-normal text-[#dc4646]">{errors.language}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="page-input-box page-input-hr">
        <div className="page-input_title">임베딩 설정</div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">임베딩 모델</div>
          <div className="page-input_item-data">
            <Select
              classNames={{ container: () => 'page-input_item-data_select' }}
              options={verifiedModels}
              getOptionLabel={(option: Model) => option.name}
              getOptionValue={(option: Model) => option.id.toString()}
              value={
                verifiedModels.find((model: Model) => model.id === formData.embedding_model.id) ??
                null
              }
              isDisabled={verifiedModels.length <= 1}
              isError={!!errors.embedding_model}
              errMessage={errors.embedding_model}
              onChange={(option: Model | null) => {
                if (option) {
                  setFormData((prev) => ({ ...prev, embedding_model: option }));
                  clearError('embedding_model');
                }
              }}
            />
            {!errors.embedding_model && (
              <p className="page-input_item-input-desc">
                현재 배포가 확인된 bge-m3 모델만 사용할 수 있습니다.
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="page-input-box page-input-hr">
        <div className="page-input_title">검색 설정</div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">검색 타입</div>
          <div className="page-input_item-data">
            <Select
              classNames={{ container: () => 'page-input_item-data_select' }}
              options={searchMethods}
              getOptionLabel={(option: SearchMethod) => option.name}
              getOptionValue={(option: SearchMethod) => option.id.toString()}
              value={
                searchMethods.find(
                  (method: SearchMethod) => method.id === formData.search_method.id
                ) ?? null
              }
              isError={!!errors.search_method}
              errMessage={errors.search_method}
              onChange={(option: SearchMethod | null) => {
                if (option) {
                  setFormData((prev) => ({ ...prev, search_method: option }));
                  clearError('search_method');
                }
              }}
            />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">Top K</div>
          <div className="page-input_item-data">
            <div className="page-input_item-row2">
              {/* 게이지 드래그시 gaugeActionBar 필요 */}
              <div className="w-54">
                <Slider
                  step={1}
                  min={KNOWLEDGE_BASE_LIMITS.topK.min}
                  max={KNOWLEDGE_BASE_LIMITS.topK.max}
                  value={[
                    getSliderValue(
                      formData.top_k,
                      KNOWLEDGE_BASE_DEFAULTS.topK,
                      KNOWLEDGE_BASE_LIMITS.topK.min,
                      KNOWLEDGE_BASE_LIMITS.topK.max
                    ),
                  ]}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, top_k: value[0] ?? prev.top_k }));
                    clearError('top_k');
                  }}
                />
              </div>
              {/* numCount disabled 일때 클래스네임 disabled 추가 */}
              <div className="page-num-count">
                <input
                  type="number"
                  min={KNOWLEDGE_BASE_LIMITS.topK.min}
                  max={KNOWLEDGE_BASE_LIMITS.topK.max}
                  step={1}
                  placeholder="3"
                  value={displayNumericInput(formData.top_k)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData((prev) => ({
                      ...prev,
                      top_k: parseNumericInput(e.target.value),
                    }));
                    clearError('top_k');
                  }}
                />
                <div className="page-num-count-control">
                  <button
                    type="button"
                    className="btn-num"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        top_k: Math.min(
                          KNOWLEDGE_BASE_LIMITS.topK.max,
                          (Number.isFinite(prev.top_k) ? prev.top_k : 0) + 1
                        ),
                      }));
                      clearError('top_k');
                    }}
                  >
                    <span className="icon-arr icon-arrUp">
                      <IconArrCount />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="btn-num"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        top_k: Math.max(
                          KNOWLEDGE_BASE_LIMITS.topK.min,
                          (Number.isFinite(prev.top_k) ? prev.top_k : 2) - 1
                        ),
                      }));
                      clearError('top_k');
                    }}
                  >
                    <span className="icon-arr icon-arrDown">
                      <IconArrCount />
                    </span>
                  </button>
                </div>
              </div>
            </div>
            {errors.top_k ? (
              <p className="mt-1 text-xs leading-normal text-[#dc4646]">{errors.top_k}</p>
            ) : (
              <p className="page-input_item-input-desc">1~20 범위에서 3~5를 권장합니다.</p>
            )}
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">점수 임계값</div>
          <div className="page-input_item-data">
            <div className="page-input_item-row2">
              {/* 게이지 드래그시 gaugeActionBar 필요 */}
              <div className="w-54">
                <Slider
                  step={0.1}
                  min={0}
                  max={1}
                  value={[
                    getSliderValue(
                      formData.threshold,
                      KNOWLEDGE_BASE_DEFAULTS.threshold,
                      KNOWLEDGE_BASE_LIMITS.threshold.min,
                      KNOWLEDGE_BASE_LIMITS.threshold.max
                    ),
                  ]}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      threshold: value[0] ?? prev.threshold,
                    }));
                    clearError('threshold');
                  }}
                />
              </div>
              {/* numCount disabled 일때 클래스네임 disabled 추가 */}
              <div className="page-num-count">
                <input
                  type="number"
                  placeholder="0"
                  min={0}
                  max={1}
                  step={0.1}
                  value={displayNumericInput(formData.threshold)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData((prev) => ({
                      ...prev,
                      threshold: parseNumericInput(e.target.value),
                    }));
                    clearError('threshold');
                  }}
                />
                <div className="page-num-count-control">
                  <button
                    type="button"
                    className="btn-num"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        threshold: Math.min(
                          1,
                          roundToOneDecimal(
                            (Number.isFinite(prev.threshold) ? prev.threshold : 0) + 0.1
                          )
                        ),
                      }));
                      clearError('threshold');
                    }}
                  >
                    <span className="icon-arr icon-arrUp">
                      <IconArrCount />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="btn-num"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        threshold: Math.max(
                          0,
                          roundToOneDecimal(
                            (Number.isFinite(prev.threshold) ? prev.threshold : 0.1) - 0.1
                          )
                        ),
                      }));
                      clearError('threshold');
                    }}
                  >
                    <span className="icon-arr icon-arrDown">
                      <IconArrCount />
                    </span>
                  </button>
                </div>
              </div>
            </div>
            {errors.threshold ? (
              <p className="mt-1 text-xs leading-normal text-[#dc4646]">{errors.threshold}</p>
            ) : (
              <p className="page-input_item-input-desc">
                0.3~0.5를 권장합니다. 0은 유사도 필터를 적용하지 않습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface Step3Props {
  formData: KnowledgeBaseFormValues;
}

const Step3 = ({ formData }: Step3Props) => {
  const accordionItems1 = [
    {
      label: '기본 정보',
      component: (
        <div>
          <div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">이름</div>
              <div className="page-accordion_item-data">{formData.name || '-'}</div>
            </div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">설명</div>
              <div className="page-accordion_item-data">{formData.description || '-'}</div>
            </div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">파일</div>
              <div className="page-accordion_item-data">
                {formData.file ? (
                  <div className="flex items-center gap-2">
                    <IconDocument /> {formData.file.name}
                  </div>
                ) : (
                  '-'
                )}
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const accordionItems2 = [
    {
      label: '청크 설정',
      component: (
        <div>
          <div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">청크 타입</div>
              <div className="page-accordion_item-data">{formData.chunk_type.name || '-'}</div>
            </div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">청크 길이</div>
              <div className="page-accordion_item-data">{formData.chunk_size}</div>
            </div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">언어</div>
              <div className="page-accordion_item-data">{formData.language.name || '-'}</div>
            </div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">청크 중첩</div>
              <div className="page-accordion_item-data">{formData.chunk_overlap}</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const accordionItems3 = [
    {
      label: '임베딩 설정',
      component: (
        <div>
          <div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">모델</div>
              <div className="page-accordion_item-data">{formData.embedding_model.name || '-'}</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const accordionItems4 = [
    {
      label: '검색 설정',
      component: (
        <div>
          <div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">검색 타입</div>
              <div className="page-accordion_item-data">{formData.search_method.name || '-'}</div>
            </div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">Top K</div>
              <div className="page-accordion_item-data">{formData.top_k}</div>
            </div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">점수 임계값</div>
              <div className="page-accordion_item-data">{formData.threshold}</div>
            </div>
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
        <Accordion components={accordionItems4} defaultValue="0" />
      </div>
    </div>
  );
};
