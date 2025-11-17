import { IconFileUp } from '@/assets/img/icon';
import { useGetModelFormats, useGetModelProviders, useGetModelTypes } from '@/hooks/service/models';
import type { ModelFormat, ModelProvider, ModelType } from '@/types/model';
import { BreadCrumb, Button, Input, Select, Textarea } from '@innogrid/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function ModelCatalogCreatePage() {
  const { modelProviders } = useGetModelProviders();
  const { modelTypes } = useGetModelTypes();
  const { modelFormats } = useGetModelFormats();
  const navigate = useNavigate();

  const [selectedProvider, setSelectedProvider] = useState<ModelProvider | null>(null);
  const [selectedType, setSelectedType] = useState<ModelType | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ModelFormat | null>(null);

  const [value, setValue] = useState<string>('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const [text, setText] = useState<string>('');
  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <main>
      <BreadCrumb
        items={[
          { label: '모델' },
          { label: '모델 카탈로그', path: '/model/model-catalog' },
          { label: '모델 카탈로그 생성' },
        ]}
        className="breadcrumbBox"
        onNavigate={navigate}
      />
      <div className="page-title-box">
        <h2 className="page-title">모델 카탈로그 생성</h2>
      </div>
      <div className="page-content page-p-40">
        <div className="page-input-box">
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모델명</div>
            <div className="page-input_item-data">
              <Input placeholder="모델명을 입력해주세요." value={value} onChange={onChange} />
              <p className="page-input_item-input-desc">설명글이 들어갑니다.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모델 ID</div>
            <div className="page-input_item-data">
              <Input placeholder="모델 ID를 입력해주세요." value={value} onChange={onChange} />
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
            <div className="page-input_item-name">모델 소개</div>
            <div className="page-input_item-data">
              <Textarea value={text} onChange={onTextChange} placeholder="설명을 입력해주세요." />
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">샘플 코드</div>
            <div className="page-input_item-data">
              <Textarea
                value={text}
                onChange={onTextChange}
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
            <Button size="large" color="secondary" onClick={() => navigate('/model/model-catalog')}>
              취소
            </Button>
            <Button size="large" color="primary" onClick={() => alert('Button clicked!')}>
              생성
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
