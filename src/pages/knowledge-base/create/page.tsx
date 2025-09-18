import {
  Accordion,
  BreadCrumb,
  Button,
  Input,
  RadioButton,
  Select,
  Stepper,
  Textarea,
  type SelectSingleValue,
} from '@innogrid/ui';
import { useNavigate } from 'react-router';
import { IconArrCount, IconDocument, IconFileUp } from '../../../assets/img/icon';
import { useState, type ChangeEvent } from 'react';

export default function KnowledgeBaseCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(0);

  const handleClickNext = () => {
    if (step < 2) setStep((prev) => prev + 1);
  };

  const handleClickPrevious = () => {
    if (step !== 0) setStep((prev) => prev - 1);
  };

  const handleClickCreate = () => {
    navigate('/knowledge-base');
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
            steps={[
              { title: '지식 베이스 스텝 001' },
              { title: '지식 베이스 스텝 002' },
              { title: '지식 베이스 스텝 003' },
            ]}
          />
        </div>
        <div className="page-content-stepper-desc">
          {step === 0 && <Step1 />}
          {step === 1 && <Step2 />}
          {step === 2 && <Step3 />}

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
  const [value, setValue] = useState<string>('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const [text, setText] = useState<string>('');
  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <div className="page-content page-pb-40">
      <div className="page-input-box">
        <div className="page-input_title">기본 설정</div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">이름</div>
          <div className="page-input_item-data">
            <Input placeholder="이름을 입력해주세요." value={value} onChange={onChange} />
            <p className="page-input_item-input-desc">이름 입력에 대한 설명글이 들어갑니다.</p>
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">설명</div>
          <div className="page-input_item-data">
            <Textarea value={text} onChange={onTextChange} placeholder="설명을 입력해주세요." />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">파일</div>
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
      </div>
    </div>
  );
};

const options = [
  { text: '옵션 1', value: 'option1' },
  { text: '옵션 2', value: 'option2' },
  { text: '옵션 3', value: 'option3' },
];

const Step2 = () => {
  const [value, setValue] = useState<string>('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  //textarea
  const [text, setText] = useState<string>('');
  const onTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  //select
  const [selectedValue, setSelectedValue] = useState();

  const onChangeSelect = (option: SelectSingleValue<any>) => {
    setSelectedValue(option);
  };

  //radio button
  const onCheckedChange = (checked: boolean) => {
    console.log('checked :', checked);
  };

  return (
    <div className="page-content page-pb-40">
      <div className="page-input-box">
        <div className="page-input_title">청크 설정</div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">청크 길이</div>
          <div className="page-input_item-data">
            <Input placeholder="청크 길이를 입력해주세요." value={value} onChange={onChange} />
            <p className="page-input_item-input-desc">청크 길이 입력에 대한 설명글이 들어갑니다.</p>
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">청크 중첩</div>
          <div className="page-input_item-data">
            <Input placeholder="청크 중첩을 입력해주세요." value={value} onChange={onChange} />
            <p className="page-input_item-input-desc">청크 중첩 입력에 대한 설명글이 들어갑니다.</p>
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">청크 타입</div>
          <div className="page-input_item-data">
            <Select
              className="page-input_item-data_select"
              options={options}
              getOptionLabel={(option) => option.text}
              getOptionValue={(option) => option.value}
              value={selectedValue}
              onChange={onChangeSelect}
            />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">언어</div>
          <div className="page-input_item-data">
            <div className="page-input_item-col2">
              <RadioButton
                id="radio1"
                label="한국어"
                value="basic"
                onCheckedChange={onCheckedChange}
              />
              <RadioButton
                id="radio2"
                label="영어"
                value="basic"
                onCheckedChange={onCheckedChange}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="page-input-box page-input-hr">
        <div className="page-input_title">임베딩 설정</div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">임베딩 모델</div>
          <div className="page-input_item-data">
            <Select
              className="page-input_item-data_select"
              options={options}
              getOptionLabel={(option) => option.text}
              getOptionValue={(option) => option.value}
              value={selectedValue}
              onChange={onChangeSelect}
            />
          </div>
        </div>
      </div>
      <div className="page-input-box page-input-hr">
        <div className="page-input_title">검색 설정</div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">검색 타입</div>
          <div className="page-input_item-data">
            <Select
              className="page-input_item-data_select"
              options={options}
              getOptionLabel={(option) => option.text}
              getOptionValue={(option) => option.value}
              value={selectedValue}
              onChange={onChangeSelect}
            />
          </div>
        </div>
        <div className="page-input_item-box">
          <div className="page-input_item-name">상위 K</div>
          <div className="page-input_item-data">
            <div className="page-input_item-row2">
              {/* 게이지 드래그시 gaugeActionBar 필요 */}
              <div className="page-gauge">
                <span className="page-gauge-pointer"></span>
                <span className="page-gauge-actionBar"></span>
                <span className="page-gauge-bar"></span>
              </div>
              {/* numCount disabled 일때 클래스네임 disabled 추가 */}
              <div className="page-num-count">
                {/* ${styles.disabled} */}
                <input type="number" placeholder="0" />
                <div className="page-num-count-control">
                  <button type="button" className="btn-num">
                    <IconArrCount className="icon-arr icon-arrUp" />
                  </button>
                  <button type="button" className="btn-num">
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
              <div className="page-gauge">
                <span className="page-gauge-pointer"></span>
                <span className="page-gauge-actionBar"></span>
                <span className="page-gauge-bar"></span>
              </div>
              {/* numCount disabled 일때 클래스네임 disabled 추가 */}
              <div className="page-num-count">
                {/* ${styles.disabled} */}
                <input type="number" placeholder="0" />
                <div className="page-num-count-control">
                  <button type="button" className="btn-num">
                    <IconArrCount className="icon-arr icon-arrUp" />
                  </button>
                  <button type="button" className="btn-num">
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

//accordion
const accordionItems1 = [
  {
    label: '기본 정보',
    component: (
      <div>
        <div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">데이터 셋 이름</div>
            <div className="page-accordion_item-data">테스트용</div>
          </div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">설명</div>
            <div className="page-accordion_item-data">테스트를 위한 데이터 셋</div>
          </div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">파일</div>
            <div className="page-accordion_item-data">
              <IconDocument className="page-icon-document" /> text.txt
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
            <div className="page-accordion_item-data">RecursiveTextSplit</div>
          </div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">청크 길이</div>
            <div className="page-accordion_item-data">100</div>
          </div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">언어</div>
            <div className="page-accordion_item-data">Ko</div>
          </div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">청크 중첩</div>
            <div className="page-accordion_item-data">50</div>
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
            <div className="page-accordion_item-data">임베딩 모델</div>
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
            <div className="page-accordion_item-data">Vector</div>
          </div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">Top K</div>
            <div className="page-accordion_item-data">3</div>
          </div>
          <div className="page-accordion_item-box">
            <div className="page-accordion_item-name">점수 임계값</div>
            <div className="page-accordion_item-data">0.5</div>
          </div>
        </div>
      </div>
    ),
  },
];

const Step3 = () => {
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
