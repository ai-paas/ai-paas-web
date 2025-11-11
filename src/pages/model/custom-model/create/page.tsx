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

export default function CustomModelCreatePage() {
  const { modelProviders } = useGetModelProviders();
  const { modelTypes } = useGetModelTypes();
  const { modelFormats } = useGetModelFormats();
  const navigate = useNavigate();
  const { createModel, isPending, isSuccess } = useCreateModel();

  const [modelName, setModelName] = useState<string>('');
  const [modelId, setModelId] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<ModelProvider | null>(null);
  const [selectedType, setSelectedType] = useState<ModelType | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ModelFormat | null>(null);
  const [description, setDescription] = useState<string>('');
  const [sampleCode, setSampleCode] = useState<string>('');

  const handleSubmit = () => {
    if (!modelName || !description || !selectedProvider || !selectedType || !selectedFormat) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    createModel({
      name: modelName,
      description,
      provider_id: selectedProvider.id,
      type_id: selectedType.id,
      format_id: selectedFormat.id,
    });
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
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />
              <p className="page-input_item-input-desc">설명글이 들어갑니다.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모델 ID</div>
            <div className="page-input_item-data">
              <Input
                placeholder="모델 ID를 입력해주세요."
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
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
                value={selectedProvider}
                onChange={(option: ModelProvider | null) => setSelectedProvider(option)}
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
                value={selectedType}
                onChange={(option: ModelType | null) => setSelectedType(option)}
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
                value={selectedFormat}
                onChange={(option: ModelFormat | null) => setSelectedFormat(option)}
              />
              <p className="page-input_item-input-desc">설명글이 들어갑니다.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">파일</div>
            <div className="page-input_item-data">
              <div className="page-input_item-data_fileUpload">
                <label className="fileUpload-preview">
                  <input type="file" className="fileUpload-file" />
                  <IconFileUp />
                  <p className="fileUpload-preview_msg">
                    파일을 여기에 드래그하거나 클릭하여 업로드하세요. (파일당 최대 크기 15MB)
                    <br />
                    허용되는 파일 형식: txt, markdown, mdx, pdf, html, xlsx, xls, docx, csv,md,htm
                  </p>
                </label>
              </div>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모델 소개</div>
            <div className="page-input_item-data">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="설명을 입력해주세요."
              />
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">샘플 코드</div>
            <div className="page-input_item-data">
              <Textarea
                value={sampleCode}
                onChange={(e) => setSampleCode(e.target.value)}
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
