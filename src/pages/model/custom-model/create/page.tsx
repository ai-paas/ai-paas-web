import { IconFileUp } from '@/assets/img/icon';
import {
  useCreateModel,
  useGetModelFormats,
  useGetModelProviders,
  useGetModelTypes,
} from '@/hooks/service/models';
import type { ModelFormat, ModelProvider, ModelType } from '@/types/model';
import { BreadCrumb, Button, Input, Select, Textarea } from '@innogrid/ui';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

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
  const { modelProviders } = useGetModelProviders();
  const { modelTypes } = useGetModelTypes();
  const { modelFormats } = useGetModelFormats();
  const [customModel, setCustomModel] = useState<CustomModel>(INITIAL_CUSTOM_MODEL);
  const navigate = useNavigate();
  const { createModel, isPending, isSuccess } = useCreateModel();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomModel({
      ...customModel,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedExtensions = ['safetensors', 'onnx'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        alert('허용되지 않는 파일 형식입니다.');
        return;
      }

      setCustomModel((prev) => ({
        ...prev,
        file,
      }));
    }
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
  };

  useEffect(() => {
    if (isSuccess) {
      navigate('/model/custom-model');
    }
  }, [isSuccess, navigate]);

  return (
    <main>
      <BreadCrumb
        items={[
          { label: '모델' },
          { label: '커스텀 모델', path: '/model/custom-model' },
          { label: '커스텀 모델 생성' },
        ]}
        className="breadcrumbBox"
        onNavigate={navigate}
      />
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
              <p className="page-input_item-input-desc">설명글이 들어갑니다.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모델 ID</div>
            <div className="page-input_item-data">
              <Input
                name="repo_id"
                placeholder="모델 ID를 입력해주세요."
                value={customModel.repo_id ?? ''}
                onChange={handleChange}
              />
              <p className="page-input_item-input-desc">설명글이 들어갑니다.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모델 공급자 ID</div>
            <div className="page-input_item-data">
              <Select
                className="page-input_item-data_select"
                options={modelProviders}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => String(option.id)}
                value={modelProviders.find((provider) => provider.id === customModel.provider_id)}
                onChange={(option: ModelProvider | null) =>
                  setCustomModel((prev) => ({
                    ...prev,
                    provider_id: option?.id ?? null,
                  }))
                }
              />
              <p className="page-input_item-input-desc">설명글이 들어갑니다.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모델 타입 ID</div>
            <div className="page-input_item-data">
              <Select
                className="page-input_item-data_select"
                options={modelTypes}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => String(option.id)}
                value={modelTypes.find((type) => type.id === customModel.type_id)}
                onChange={(option: ModelType | null) =>
                  setCustomModel((prev) => ({
                    ...prev,
                    type_id: option?.id ?? null,
                  }))
                }
              />
              <p className="page-input_item-input-desc">설명글이 들어갑니다.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모델 포맷 ID</div>
            <div className="page-input_item-data">
              <Select
                className="page-input_item-data_select"
                options={modelFormats}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => String(option.id)}
                value={modelFormats.find((format) => format.id === customModel.format_id)}
                onChange={(option: ModelFormat | null) =>
                  setCustomModel((prev) => ({
                    ...prev,
                    format_id: option?.id ?? null,
                  }))
                }
              />
              <p className="page-input_item-input-desc">설명글이 들어갑니다.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">파일</div>
            <div className="page-input_item-data">
              <div className="page-input_item-data_fileUpload">
                <label className="fileUpload-preview">
                  <input type="file" className="fileUpload-file" onChange={handleFileChange} />
                  <IconFileUp />
                  {customModel.file?.name ?? (
                    <p className="fileUpload-preview_msg">
                      파일을 여기에 드래그하거나 클릭하여 업로드하세요. (파일당 최대 크기 15MB)
                      <br />
                      허용되는 파일 형식: txt, markdown, mdx, pdf, html, xlsx, xls, docx, csv,md,htm
                    </p>
                  )}
                </label>
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
