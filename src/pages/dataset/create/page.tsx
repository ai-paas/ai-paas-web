import { useState } from 'react';
import type { ChangeEvent, SelectSingleValue } from 'innogrid-ui';
import { BreadCrumb, Button, Select, Input, Textarea } from 'innogrid-ui';
import { IconFileUp } from '../../../assets/img/icon';
import { useNavigate } from 'react-router';

const items = [{ label: '데이터 셋', path: '/dataset' }, { label: '데이터 셋 생성' }];

type OptionType = { text: string; value: string };

const options = [
  { text: '옵션 1', value: 'option1' },
  { text: '옵션 2', value: 'option2' },
  { text: '옵션 3', value: 'option3' },
];

export default function DatasetCreatePage() {
  const navigate = useNavigate();
  const [value, setValue] = useState<string>('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const [text, setText] = useState<string>('');
  const onTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const [selectedValue, setSelectedValue] = useState<OptionType>();

  const onChangeSelect = (option: SelectSingleValue<OptionType>) => {
    setSelectedValue(option);
  };

  return (
    <main>
      <BreadCrumb items={items} onNavigate={navigate} className="breadcrumbBox" />
      <div className="page-title-box">
        <h2 className="page-title">데이터 셋 생성</h2>
      </div>
      <div className="page-content page-pb-40">
        <div className="page-input-box">
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">이름</div>
            <div className="page-input_item-data">
              <Input placeholder="이름을 입력해주세요." value={value} onChange={onChange} />
              <p className="page-input_item-input-desc">이름 입력에 대한 설명글이 들어갑니다.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">학습 파일</div>
            <div className="page-input_item-data">
              <div className="page-input_item-data_fileUpload">
                <label className="fileUpload-preview">
                  <input type="file" className="fileUpload-file" />
                  <IconFileUp />
                  <p className="fileUpload-preview_msg">
                    파일을 여기에 드래그하거나 클릭하여 업로드하세요.
                    <br />
                    (jpg/jpeg 50MB 이하)
                  </p>
                </label>
              </div>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">설명</div>
            <div className="page-input_item-data">
              <Textarea value={text} onChange={onTextChange} placeholder="설명을 입력해주세요." />
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
            <Button size="large" color="primary" onClick={() => alert('Button clicked!')}>
              생성
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
