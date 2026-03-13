import {
  Accordion,
  BreadCrumb,
  Button,
  Input,
  RadioGroupButton,
  Select,
  Slider,
  Stepper,
  Textarea,
} from '@innogrid/ui';
import { useNavigate } from 'react-router';
import { IconArrCount, IconDocument, IconFileUp } from '../../../assets/img/icon';
import { useEffect, useState } from 'react';
import {
  useCreateKnowledgeBase,
  useGetChunkTypes,
  useGetLanguages,
  useGetSearchMethods,
} from '@/hooks/service/knowledgebase';
import { useGetModels, useGetModelTypes } from '@/hooks/service/models';

interface FormData {
  name: string;
  description?: string;
  files: File[];
  chunk_size?: number;
  chunk_overlap?: number;
  chunk_type?: {
    id: number;
    name: string;
    description?: string;
  };
  language: {
    id: number;
    name: string;
    description?: string;
  };
  embedding_model: {
    id: number;
    name: string;
    description?: string;
  };
  search_method: {
    id: number;
    name: string;
    description?: string;
  };
  top_k: number[];
  threshold: number[];
}

export default function KnowledgeBaseCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(0);
  const { createKnowledgeBase, isPending } = useCreateKnowledgeBase();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    files: [],
    chunk_type: { id: 0, name: '' },
    language: { id: 0, name: '' },
    embedding_model: { id: 0, name: '' },
    search_method: { id: 0, name: '' },
    top_k: [0],
    threshold: [0],
  });

  const handleClickNext = () => {
    if (step < 2) setStep((prev) => prev + 1);
  };

  const handleClickPrevious = () => {
    if (step !== 0) setStep((prev) => prev - 1);
  };

  const handleClickCreate = async () => {
    if (!formData.chunk_type) return;

    const form = new FormData();
    form.append('name', formData.name);
    form.append('description', formData.description ?? '');
    form.append('language_id', String(formData.language.id));
    form.append('embedding_model_id', String(formData.embedding_model.id));
    form.append('chunk_size', String(formData.chunk_size));
    form.append('chunk_overlap', String(formData.chunk_overlap));
    form.append('chunk_type_id', String(formData.chunk_type.id));
    form.append('search_method_id', String(formData.search_method.id));
    form.append('top_k', String(formData.top_k[0]));
    form.append('threshold', String(formData.threshold[0]));
    formData.files.forEach((file) => {
      form.append('file', file);
    });

    await createKnowledgeBase(form, {
      onSuccess: () => {
        navigate('/knowledge-base');
      },
      onError: (error) => {
        console.error('지식베이스 생성 실패:', error);
        alert('지식베이스 생성에 실패했습니다.');
      },
    });
  };

  return (
    <main>
      <BreadCrumb
        items={[{ label: '지식 베이스', path: '/knowledge-base' }, { label: '지식 베이스 생성' }]}
        className="breadcrumbBox"
        onNavigate={navigate}
      />
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
          {step === 0 && <Step1 formData={formData} setFormData={setFormData} />}
          {step === 1 && <Step2 formData={formData} setFormData={setFormData} />}
          {step === 2 && <Step3 formData={formData} />}

          <div className="page-footer">
            <div className="page-footer_btn-box">
              <Button size="large" color="secondary" onClick={() => navigate('/knowledge-base')}>
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
  );
}

interface Step1Props {
  formData?: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const Step1 = ({ formData, setFormData }: Step1Props) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData((prev) => ({ ...prev, files: [...(prev?.files || []), ...filesArray] }));
    }
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
              value={formData?.name ?? ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
            <p className="page-input_item-input-desc">이름 입력에 대한 설명글이 들어갑니다.</p>
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">설명</div>
          <div className="page-input_item-data">
            <Textarea
              value={formData?.description ?? ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="설명을 입력해주세요."
            />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">파일</div>
          <div className="page-input_item-data">
            <div className="page-input_item-data_fileUpload">
              <label className="fileUpload-preview">
                <input
                  type="file"
                  className="fileUpload-file"
                  onChange={handleFileChange}
                  multiple
                />
                <IconFileUp />
                <p className="fileUpload-preview_msg">
                  파일을 여기에 드래그하거나 클릭하여 업로드하세요. (파일당 최대 크기 15MB)
                  <br />
                  허용되는 파일 형식: txt, markdown, mdx, pdf, html, xlsx, xls, docx, csv,md,htm
                </p>
              </label>
              {!!formData?.files && (
                <div className="mt-2">
                  {formData?.files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <IconDocument className="page-icon-document" />
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Step2Props {
  formData?: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const Step2 = ({ formData, setFormData }: Step2Props) => {
  const { chunkTypes } = useGetChunkTypes();
  const { languages, isFetched } = useGetLanguages();
  const { searchMethods } = useGetSearchMethods();
  const { modelTypes } = useGetModelTypes({ type_name: 'Embedding' });
  const { models } = useGetModels(
    { model_type_id: modelTypes[0]?.id },
    { enabled: !!modelTypes.length }
  );

  useEffect(() => {
    if (isFetched) {
      setFormData((prev) => ({ ...prev, language: languages[0] }));
    }
  }, [isFetched]);

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
              value={formData?.chunk_size?.toString()}
              onChange={(e) => setFormData((prev) => ({ ...prev, chunk_size: +e.target.value }))}
            />
            <p className="page-input_item-input-desc">청크 길이를 입력해주세요.</p>
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">청크 중첩</div>
          <div className="page-input_item-data">
            <Input
              type="number"
              placeholder="청크 중첩을 입력해주세요."
              value={formData?.chunk_overlap?.toString()}
              onChange={(e) => setFormData((prev) => ({ ...prev, chunk_overlap: +e.target.value }))}
            />
            <p className="page-input_item-input-desc">청크 중첩을 입력해주세요.</p>
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">청크 타입</div>
          <div className="page-input_item-data">
            <Select
              className="page-input_item-data_select"
              options={chunkTypes}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id.toString()}
              value={chunkTypes.find((type) => type.id === formData?.chunk_type?.id)}
              onChange={(option) => {
                if (option) setFormData((prev) => ({ ...prev, chunk_type: option }));
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
                options={languages.map((lang) => ({ label: lang.description, value: lang.id }))}
                orientation="vertical"
                value={languages.find((lang) => lang.id === formData?.language.id)?.id}
                onValueChange={(languageId: number) => {
                  const selectedLanguage = languages.find((lang) => lang.id === languageId);
                  if (selectedLanguage) {
                    setFormData((prev) => ({ ...prev, language: selectedLanguage }));
                  }
                }}
              />
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
              className="page-input_item-data_select"
              options={models}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id.toString()}
              value={models.find((model) => model.id === formData?.embedding_model?.id)}
              onChange={(option) => {
                if (option) setFormData((prev) => ({ ...prev, embedding_model: option }));
              }}
            />
          </div>
        </div>
      </div>
      <div className="page-input-box page-input-hr">
        <div className="page-input_title">검색 설정</div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">검색 타입</div>
          <div className="page-input_item-data">
            <Select
              className="page-input_item-data_select"
              options={searchMethods}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id.toString()}
              value={searchMethods?.find((method) => method.id === formData?.search_method.id)}
              onChange={(option) => {
                if (option) setFormData((prev) => ({ ...prev, search_method: option }));
              }}
            />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">상위 K</div>
          <div className="page-input_item-data">
            <div className="page-input_item-row2">
              {/* 게이지 드래그시 gaugeActionBar 필요 */}
              <div className="w-54">
                <Slider
                  step={1}
                  min={1}
                  max={50}
                  value={formData?.top_k ?? [0]}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, top_k: [value] }))}
                />
              </div>
              {/* numCount disabled 일때 클래스네임 disabled 추가 */}
              <div className="page-num-count">
                <input
                  type="number"
                  placeholder="0"
                  value={formData?.top_k[0]}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, top_k: [Number(e.target.value)] }));
                  }}
                />
                <div className="page-num-count-control">
                  <button
                    type="button"
                    className="btn-num"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, top_k: [(prev.top_k[0] || 0) + 1] }))
                    }
                  >
                    <IconArrCount className="icon-arr icon-arrUp" />
                  </button>
                  <button
                    type="button"
                    className="btn-num"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        top_k: [Math.max(0, (prev.top_k[0] || 0) - 1)],
                      }))
                    }
                  >
                    <IconArrCount className="icon-arr icon-arrDown" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">점수 임계값</div>
          <div className="page-input_item-data">
            <div className="page-input_item-row2">
              {/* 게이지 드래그시 gaugeActionBar 필요 */}
              <div className="w-54">
                <Slider
                  step={0.1}
                  min={0}
                  max={1}
                  value={formData?.threshold ?? [0]}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, threshold: [value] }))
                  }
                />
              </div>
              {/* numCount disabled 일때 클래스네임 disabled 추가 */}
              <div className="page-num-count">
                <input
                  type="number"
                  placeholder="0"
                  step={0.1}
                  value={formData?.threshold ?? [0]}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, threshold: [Number(e.target.value)] }))
                  }
                />
                <div className="page-num-count-control">
                  <button
                    type="button"
                    className="btn-num"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        threshold: [Math.min(1, (prev.threshold[0] || 0) + 0.1)],
                      }))
                    }
                  >
                    <IconArrCount className="icon-arr icon-arrUp" />
                  </button>
                  <button
                    type="button"
                    className="btn-num"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        threshold: [Math.max(0, (prev.threshold[0] || 0) - 0.1)],
                      }))
                    }
                  >
                    <IconArrCount className="icon-arr icon-arrDown" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Step3Props {
  formData?: FormData;
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
              <div className="page-accordion_item-data">{formData?.name || '-'}</div>
            </div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">설명</div>
              <div className="page-accordion_item-data">{formData?.description || '-'}</div>
            </div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">파일</div>
              <div className="page-accordion_item-data">
                {formData?.files.length > 0
                  ? formData?.files.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <IconDocument /> {item.name}
                      </div>
                    ))
                  : '-'}
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
              <div className="page-accordion_item-data">{formData?.chunk_type?.name || '-'}</div>
            </div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">청크 길이</div>
              <div className="page-accordion_item-data">{formData?.chunk_size || '-'}</div>
            </div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">언어</div>
              <div className="page-accordion_item-data">{formData?.language?.name || '-'}</div>
            </div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">청크 중첩</div>
              <div className="page-accordion_item-data">{formData?.chunk_overlap || '-'}</div>
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
              <div className="page-accordion_item-data">
                {formData?.embedding_model?.name || '-'}
              </div>
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
              <div className="page-accordion_item-data">{formData?.search_method.name || '-'}</div>
            </div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">Top K</div>
              <div className="page-accordion_item-data">{formData?.top_k || '-'}</div>
            </div>
            <div className="page-accordion_item-box">
              <div className="page-accordion_item-name">점수 임계값</div>
              <div className="page-accordion_item-data">{formData?.threshold || '-'}</div>
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
