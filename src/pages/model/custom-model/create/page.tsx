import { IconFileUp } from '@/assets/img/icon';
import { BreadCrumb, Button, Input, Select, Textarea, type SelectSingleValue } from '@innogrid/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';

type OptionType = { text: string; value: string };

const options = [
  { text: '옵션 1', value: 'option1' },
  { text: '옵션 2', value: 'option2' },
  { text: '옵션 3', value: 'option3' },
];

export default function CustomModelCreatePage() {
  const navigate = useNavigate();
  const [value, setValue] = useState<string>('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const [text, setText] = useState<string>('');
  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const [selectedValue, setSelectedValue] = useState<OptionType>();

  const onChangeSelect = (option: SelectSingleValue<OptionType>) => {
    setSelectedValue(option);
  };

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
                options={options}
                getOptionLabel={(option) => option.text}
                getOptionValue={(option) => option.value}
                value={selectedValue}
                onChange={onChangeSelect}
              />
              <p className="page-input_item-input-desc">설명글이 들어갑니다.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모델 타입 ID</div>
            <div className="page-input_item-data">
              <Select
                className="page-input_item-data_select"
                options={options}
                getOptionLabel={(option) => option.text}
                getOptionValue={(option) => option.value}
                value={selectedValue}
                onChange={onChangeSelect}
              />
              <p className="page-input_item-input-desc">설명글이 들어갑니다.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모델 포맷 ID</div>
            <div className="page-input_item-data">
              <Select
                className="page-input_item-data_select"
                options={options}
                getOptionLabel={(option) => option.text}
                getOptionValue={(option) => option.value}
                value={selectedValue}
                onChange={onChangeSelect}
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
            <Button size="large" color="secondary" onClick={() => navigate('/model/custom-model')}>
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
