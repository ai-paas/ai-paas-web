import { IconDocument, IconFileUp } from '@/assets/img/icon';
import {
  Accordion,
  BreadCrumb,
  Button,
  Input,
  RadioButton,
  Select,
  Stepper,
  Textarea,
} from 'innogrid-ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function LearningCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(0);

  const handleClickNext = () => {
    if (step < 3) setStep((prev) => prev + 1);
  };

  const handleClickPrevious = () => {
    if (step !== 0) setStep((prev) => prev - 1);
  };

  const handleClickCreate = () => {
    // Handle create logic here
    navigate('/learning/test');
  };

  return (
    <main>
      <BreadCrumb
        items={[{ label: '학습', path: '/learning' }, { label: '학습 생성' }]}
        className="breadcrumbBox"
        onNavigate={navigate}
      />
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
          {step === 1 && <Step2 />}
          {step === 2 && <Step3 />}
          {step === 3 && <Step4 />}

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
                  <Button size="large" color="primary" onClick={handleClickCreate}>
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
  );
}

const Step1 = () => {
  const [value, setValue] = useState();

  return (
    <div className="page-content page-pb-40">
      <div className="page-input-box">
        <div className="page-input_title">기본 설정</div>

        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">이름</div>
          <div className="page-input_item-data">
            <Input placeholder="이름을 입력해주세요." value={value} onChange={() => {}} />
          </div>
        </div>

        <div className="page-input_item-box">
          <div className="page-input_item-name">설명</div>
          <div className="page-input_item-data">
            <Textarea placeholder="설명을 입력해주세요." value="" onChange={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Step2 = () => {
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
                <RadioButton id="radio" label="객체감지" value="basic" onCheckedChange={() => {}} />
              </div>
            </div>
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">데이터 셋</div>
          <div className="page-input_item-data">
            <div className="page-input_item-col2">
              <RadioButton
                id="radio"
                label="파일 업로드"
                value="basic"
                onCheckedChange={() => {}}
              />
              <RadioButton
                id="radio"
                label="데이터 셋 설정"
                value="basic"
                onCheckedChange={() => {}}
              />
            </div>
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">파일 업로드</div>
          <div className="page-input_item-data">
            <div className="page-input_item-data_fileUpload">
              <label className="fileUpload-preview">
                <input type="file" className="fileUpload-file" />
                <IconFileUp />
                <p className="fileUpload-preview_msg">
                  파일을 여기에 드래그하거나 <b>클릭하여 업로드</b>하세요. (파일당 최대 크기 15MB)
                  <br />
                  허용되는 파일 형식:zip
                </p>
              </label>
            </div>
            <div className="page-flex-right page-pt-10">
              <Button color="secondary" onClick={() => alert('Button clicked!')}>
                유효성 검증
              </Button>
            </div>
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">이미지 데이터 셋</div>
          <div className="page-input_item-data">
            <Select
              className="page-input_item-data_select"
              options={[{ text: '객체 감지', value: 'object_detection' }]}
              getOptionLabel={(option) => option.text}
              getOptionValue={(option) => option.value}
              value={{ text: '객체 감지', value: 'object_detection' }}
              onChange={() => {}}
            />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">데이터 셋 선택</div>
          <div className="page-input_item-data">
            <div className="page-input_item-row2 page-gap-6">
              <Select
                className="page-input_item-data_select"
                options={[]}
                getOptionLabel={(option) => option.text}
                getOptionValue={(option) => option.value}
                value={{ text: '객체 감지', value: 'object_detection' }}
                onChange={() => {}}
              />
              <Button color="secondary" onClick={() => alert('Button clicked!')}>
                유효성 검증
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Step3 = () => {
  const [value, setValue] = useState('');
  const [selectedValue, setSelectedValue] = useState<{ text: string; value: string }>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <div className="page-content page-pb-40">
      <div className="page-input-box">
        <div className="page-input_title">모델 설정</div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">모델</div>
          <div className="page-input_item-data">
            <Select
              className="page-input_item-data_select"
              options={[]}
              getOptionLabel={(option) => option.text}
              getOptionValue={(option) => option.value}
              value={{ text: '객체 감지', value: 'object_detection' }}
              onChange={() => {}}
            />
          </div>
        </div>
      </div>
      <div className="page-input-box page-input-hr">
        <div className="page-input_title">하이퍼 파라미터 설정</div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">Epochs</div>
          <div className="page-input_item-data">
            <Input placeholder="Epochs 값을 입력해주세요." value={value} onChange={handleChange} />
            <p className="page-input_item-input-desc">설명이 들어갑니다.</p>
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">Batch</div>
          <div className="page-input_item-data">
            <Input placeholder="Batch 값을 입력해주세요." value={value} onChange={handleChange} />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">Save period</div>
          <div className="page-input_item-data">
            <Input
              placeholder="Save period 값을 입력해주세요."
              value={value}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">Gpus</div>
          <div className="page-input_item-data">
            <Select
              className="page-input_item-data_select"
              options={[]}
              getOptionLabel={(option) => option.text}
              getOptionValue={(option) => option.value}
              value={selectedValue}
              onChange={() => {}}
            />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">Lr0</div>
          <div className="page-input_item-data">
            <Input placeholder="Lr0 값을 입력해주세요." value={value} onChange={handleChange} />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">Lrf</div>
          <div className="page-input_item-data">
            <Input placeholder="Lrf 값을 입력해주세요." value={value} onChange={handleChange} />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">Weight decay</div>
          <div className="page-input_item-data">
            <Input
              placeholder="Weight decay 값을 입력해주세요."
              value={value}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

//accordion
const accordionItems1 = [
  {
    label: '기본 정보',
    component: (
      <div>
        <div className="page-accordion_item-box">
          <div className="page-accordion_item-name">데이터 셋 이름</div>
          <div className="page-accordion_item-data">테스트용</div>
        </div>
        <div className="page-accordion_item-box">
          <div className="page-accordion_item-name">설명</div>
          <div className="page-accordion_item-data">테스트를 위한 데이터 셋</div>
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
          <div className="page-accordion_item-name">데이터셋</div>
          <div className="page-accordion_item-data">
            <IconDocument className="page-icon-document" /> test.zip
          </div>
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
          <div className="page-accordion_item-data">YOLOX</div>
        </div>
        <div className="page-accordion_item-box">하이퍼파라미터</div>
        <div className="page-accordion_item-box">
          <div className="page-accordion_item-name">Epochs</div>
          <div className="page-accordion_item-data">100</div>
        </div>
        <div className="page-accordion_item-box">
          <div className="page-accordion_item-name">Batch</div>
          <div className="page-accordion_item-data">16</div>
        </div>
        <div className="page-accordion_item-box">
          <div className="page-accordion_item-name">Save period</div>
          <div className="page-accordion_item-data">-1</div>
        </div>
        <div className="page-accordion_item-box">
          <div className="page-accordion_item-name">Gpus</div>
          <div className="page-accordion_item-data">1개</div>
        </div>
        <div className="page-accordion_item-box">
          <div className="page-accordion_item-name">Lr0</div>
          <div className="page-accordion_item-data">0.01</div>
        </div>
        <div className="page-accordion_item-box">
          <div className="page-accordion_item-name">Lrf</div>
          <div className="page-accordion_item-data">0.01</div>
        </div>
        <div className="page-accordion_item-box">
          <div className="page-accordion_item-name">Weight decay</div>
          <div className="page-accordion_item-data">0.00005</div>
        </div>
      </div>
    ),
  },
];

const Step4 = () => {
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
