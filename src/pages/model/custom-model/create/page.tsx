import {
  useCreateModel,
  useGetModelFormats,
  useGetModelProviders,
  useGetModelTypes,
} from '@/hooks/service/models';
import type { HubModel, ModelFormat, ModelProvider, ModelType } from '@/types/model';
import { BreadCrumb, Button, FileDrop, Input, Select, Textarea } from '@innogrid/ui';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

interface CustomModel {
  name: string | null;
  repo_id: string | null;
  provider_id: number | null;
  type_id: number | null;
  format_id: number | null;
  description?: string;
  parent_model_id?: number;
  task?: string;
  parameter?: string;
  sample_code?: string;
  model_registry_schema?: string;
  file?: File;
}

const INITIAL_CUSTOM_MODEL = {
  name: null,
  repo_id: null,
  provider_id: null,
  type_id: null,
  format_id: null,
};

export default function CustomModelCreatePage() {
  const location = useLocation();
  const selectedModel = location.state?.selectedModel as HubModel;
  const { modelProviders } = useGetModelProviders();
  const { modelTypes } = useGetModelTypes();
  const { modelFormats } = useGetModelFormats();
  const [customModel, setCustomModel] = useState<CustomModel>(INITIAL_CUSTOM_MODEL);
  const navigate = useNavigate();
  const { createModel, isPending } = useCreateModel();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomModel({
      ...customModel,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddFile = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setCustomModel((prev) => ({ ...prev, file }));
  };

  const handleDeleteFile = () => {
    setCustomModel((prev) => ({ ...prev, file: undefined }));
  };

  const handleSubmit = async () => {
    if (
      !customModel.name ||
      !customModel.repo_id ||
      !customModel.provider_id ||
      !customModel.type_id ||
      !customModel.format_id
    ) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('name', customModel.name);
    formData.append('repo_id', customModel.repo_id);
    formData.append('provider_id', String(customModel.provider_id));
    formData.append('type_id', String(customModel.type_id));
    formData.append('format_id', String(customModel.format_id));
    formData.append('description', customModel.description ?? '');
    formData.append('sample_code', customModel.sample_code ?? '');
    if (customModel.file) formData.append('file', customModel.file);

    await createModel(formData);
    navigate('/model/custom-model');
  };

  useEffect(() => {
    if (!selectedModel) return;
    console.log(selectedModel);
    setCustomModel((prev) => ({
      ...prev,
      repo_id: selectedModel.id,
      provider_id: 1,
    }));
  }, [location]);

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[
            { label: '모델' },
            { label: '커스텀 모델', path: '/model/custom-model' },
            { label: '커스텀 모델 생성' },
          ]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">커스텀 모델 생성</h2>
      </div>
      <div className="page-content page-p-40">
        <div className="page-input-box">
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모델명</div>
            <div className="page-input_item-data">
              <Input
                placeholder="모델명을 입력해주세요."
                name="name"
                value={customModel.name ?? ''}
                onChange={handleChange}
              />
              <p className="page-input_item-input-desc">
                화면에 표시될 커스텀 모델의 이름을 입력해주세요.
              </p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모델 ID</div>
            <div className="page-input_item-data">
              <Input
                name="repo_id"
                placeholder="모델 ID를 입력해주세요."
                disabled={!!selectedModel}
                value={customModel.repo_id ?? ''}
                onChange={handleChange}
              />
              <p className="page-input_item-input-desc">
                모델 저장소(Repository)의 고유 ID를 입력해주세요.
              </p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모델 공급자 ID</div>
            <div className="page-input_item-data">
              <Select
                isDisabled={!!selectedModel}
                options={modelProviders}
                getOptionLabel={(option: ModelProvider) => option.name}
                getOptionValue={(option: ModelProvider) => String(option.id)}
                value={
                  modelProviders.find((provider) => provider.id === customModel.provider_id) ??
                  null
                }
                onChange={(option: ModelProvider | null) =>
                  setCustomModel((prev) => ({
                    ...prev,
                    provider_id: option?.id ?? null,
                  }))
                }
              />
              <p className="page-input_item-input-desc">모델을 제공하는 공급자를 선택해주세요.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모델 타입 ID</div>
            <div className="page-input_item-data">
              <Select
                options={modelTypes}
                getOptionLabel={(option: ModelType) => option.name}
                getOptionValue={(option: ModelType) => String(option.id)}
                value={modelTypes.find((type) => type.id === customModel.type_id) ?? null}
                onChange={(option: ModelType | null) =>
                  setCustomModel((prev) => ({
                    ...prev,
                    type_id: option?.id ?? null,
                  }))
                }
              />
              <p className="page-input_item-input-desc">모델의 용도에 맞는 타입을 선택해주세요.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모델 포맷 ID</div>
            <div className="page-input_item-data">
              <Select
                options={modelFormats}
                getOptionLabel={(option: ModelFormat) => option.name}
                getOptionValue={(option: ModelFormat) => String(option.id)}
                value={modelFormats.find((format) => format.id === customModel.format_id) ?? null}
                onChange={(option: ModelFormat | null) =>
                  setCustomModel((prev) => ({
                    ...prev,
                    format_id: option?.id ?? null,
                  }))
                }
              />
              <p className="page-input_item-input-desc">모델 가중치 파일의 포맷을 선택해주세요.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">파일</div>
            <div className="page-input_item-data">
              <div className="page-input_item-data_fileUpload">
                <FileDrop
                  id="custom-model-file"
                  description={
                    selectedModel
                      ? selectedModel.id
                      : '파일을 여기에 드래그하거나 클릭하여 업로드하세요. (파일당 최대 크기 15MB)'
                  }
                  files={!selectedModel && customModel.file ? [customModel.file] : []}
                  onAddFile={selectedModel ? () => {} : handleAddFile}
                  onDeleteFile={handleDeleteFile}
                />
              </div>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">모델 소개</div>
            <div className="page-input_item-data">
              <Textarea
                name="description"
                value={customModel.description ?? ''}
                onChange={handleChange}
                placeholder="설명을 입력해주세요."
              />
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">샘플 코드</div>
            <div className="page-input_item-data">
              <Textarea
                name="sample_code"
                value={customModel.sample_code ?? ''}
                onChange={handleChange}
                placeholder="샘플 코드를 입력해주세요."
              />
            </div>
          </div>
        </div>
      </div>
      <div className="page-footer">
        <div className="page-footer_btn-box">
          <div />
          <div>
            <Button size="large" color="secondary" onClick={() => navigate('/model/custom-model')}>
              취소
            </Button>
            <Button size="large" color="primary" onClick={handleSubmit} disabled={isPending}>
              {isPending ? '생성 중...' : '생성'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
