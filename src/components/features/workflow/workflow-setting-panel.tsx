import {
  Input,
  RadioButton,
  Select,
  Textarea,
  Accordion,
  type SelectSingleValue,
  type SelectMultiValue,
  Button,
  Checkbox,
  type CheckboxCheckedState,
  Slider,
  Switch,
} from '@innogrid/ui';
import styles from '../../../pages/workflow/workflow.module.scss';
import { IconArrCount, IconDel, IconSet } from '../../../assets/img/icon';
import { useState, type ChangeEvent } from 'react';

//select option
const options = [
  { text: '옵션 1', value: 'option1' },
  { text: '옵션 2', value: 'option2' },
  { text: '옵션 3', value: 'option3' },
];

type OptionType = { text: string; value: string };
type GroupType = SelectGroup<OptionType>;

const options2 = [
  {
    label: '추천 모델',
    value: 'recommendation',
    options: [
      { value: 'option1', text: 'Meta-Liama-3-8B' },
      { value: 'option2', text: 'gemma3:4b' },
    ],
  },
  {
    label: '모든 모델',
    value: 'all',
    options: [
      { value: 'option1', text: 'openchat-3.6-8b-20240522' },
      { value: 'option2', text: 'Qwen2-7B-Instruct' },
    ],
  },
];

const options3 = [
  { text: '지식 베이스 001', value: 'option1' },
  { text: '지식 베이스 002', value: 'option2' },
  { text: '지식 베이스 003', value: 'option3' },
];

export const WorkflowSettingPanel = ({
  type = 'MODEL',
}: {
  type?: 'START' | 'MODEL' | 'KNOWLEDGEBASE' | 'END';
}) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="absolute top-[70px] right-5 bottom-8 w-[340px] rounded-lg bg-white py-[30px] shadow-[4px_8px_18px_0px_rgba(0,0,0,0.2)]">
      <button type="button" onClick={() => setIsOpen(false)} className={styles.btnClose}>
        <span>닫기</span>
      </button>

      {type === 'START' && <StartSetting />}
      {type === 'MODEL' && <ModelSetting />}
      {type === 'KNOWLEDGEBASE' && <KnowledgeBaseSetting />}
      {type === 'END' && <EndSetting />}
    </div>
  );
};

const StartSetting = () => {
  //input
  const [value, setValue] = useState<string>('');

  //slider
  const [value2, setValue2] = useState<number[]>([30]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  //select
  const [selectedValue, setSelectedValue] = useState<OptionType>();

  const onChangeSelect = (option: SelectSingleValue<OptionType>) => {
    setSelectedValue(option);
  };

  //checkBox
  const [checked, setChecked] = useState<CheckboxCheckedState>(true);

  //radio button
  const onCheckedChange = (checked: boolean) => {
    console.log('checked :', checked);
  };

  //accordion
  const accordionItems = [
    {
      label: '타이틀',
      component: (
        <div className={styles.accordionAddBox}>
          <div className={styles.accordionAdd}>
            <div className={styles.accordionAddItem}>
              <div className={styles.accordionAddCheckBox}>
                <Checkbox
                  id="checkbox-id"
                  label="문서"
                  checked={checked}
                  onCheckedChange={(value) => setChecked(value)}
                />
                <p>
                  txt, MD, MDX, MARKDOWN, PDF, HTML, XLSX, XLS, DOC, DOCX, CSV, EML, MSG, PPTX, PPT,
                  XML, EPUB
                </p>
              </div>
              <div className={styles.accordionAddCheckBox}>
                <Checkbox
                  id="checkbox-id"
                  label="이미지"
                  checked={checked}
                  onCheckedChange={(value) => setChecked(value)}
                />
                <p>JPG, JPEG, PNG, GIF, WEBP, SVG</p>
              </div>
              <div className={styles.accordionAddCheckBox}>
                <Checkbox
                  id="checkbox-id"
                  label="오디오"
                  checked={checked}
                  onCheckedChange={(value) => setChecked(value)}
                />
                <p>MP3, M4A, WAV, AMR, MPGA</p>
              </div>
              <div className={styles.accordionAddCheckBox}>
                <Checkbox
                  id="checkbox-id"
                  label="비디오"
                  checked={checked}
                  onCheckedChange={(value) => setChecked(value)}
                />
                <p>MP4, MOV, MPEG, WEBM</p>
              </div>
              <div className={styles.accordionAddCheckBox}>
                <Checkbox
                  id="checkbox-id"
                  label="기타"
                  checked={checked}
                  onCheckedChange={(value) => setChecked(value)}
                />
                <div className={styles.accordionAddCheckInput}>
                  <Input placeholder="텍스트 필드" value={value} onChange={onChange} />
                  <button type="button" className={styles.btnIconPlusSm}>
                    <span>생성</span>
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.accordionAddItem}>
              <div className={styles.addItemNameBox}>
                <div className={styles.addItemName}>파일 업로드 방식</div>
              </div>
              <RadioButton
                id="radio"
                label="파일 업로드"
                value="basic"
                onCheckedChange={onCheckedChange}
              />
              <RadioButton id="radio" label="URL" value="basic" onCheckedChange={onCheckedChange} />
              <RadioButton
                id="radio"
                label="모두 사용"
                value="basic"
                onCheckedChange={onCheckedChange}
              />
            </div>
            <div className={styles.accordionAddItem}>
              <div className={styles.addItemNameBox}>
                <div className={styles.addItemName}>최대 파일 수</div>
              </div>
              <div className={styles.accordionAddItemSet}>
                <div className={styles.slider}>
                  <Slider value={value2} onValueChange={setValue2} />
                </div>
                {/* numCount disabled 일때 클래스네임 disabled 추가 */}
                <div className={`${styles.numCount} ${styles.disabled}`}>
                  {/* ${styles.disabled} */}
                  <input type="number" placeholder="0" />
                  <div className={styles.numCountControl}>
                    <button type="button" className={styles.btnNum}>
                      <IconArrCount className={`${styles.iconArr} ${styles.iconArrUp}`} />
                    </button>
                    <button type="button" className={styles.btnNum}>
                      <IconArrCount className={`${styles.iconArr} ${styles.iconArrDown}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.addInner}>
      <div className={styles.addTopBox}>
        <input type="text" placeholder="이름을 입력해주세요." className={styles.addTitleInput} />
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={styles.addItemName}>입력필드</div>
          <button type="button" className={styles.btnPlus}>
            <span>생성</span>
          </button>
        </div>
        {/* 내용 없을때 */}
        {/* <div className={styles.emptyBox}>
                  <span>생성된 입력필드가 없습니다.</span>
                </div> */}

        {/* 입력필드 선택시 클래스네임 active 추가 */}
        <div className={`${styles.addItemField} ${styles.active}`}>
          {/* ${styles.active} */}
          <div>
            <span>{'{X}'}</span>
            <span className={styles.addItemFieldId}>app_id</span>
          </div>
          <span className={styles.addItemFieldText}>String</span>
          <button type="button" className={styles.btnIconDel}>
            <IconDel className={styles.iconDel} />
          </button>
        </div>
        <div className={`${styles.addItemField}`}>
          <div>
            <span>{'{X}'}</span>
            <span className={styles.addItemFieldId}>app_id</span>
          </div>
          <span className={styles.addItemFieldText}>String</span>
          <button type="button" className={styles.btnIconDel}>
            <IconDel className={styles.iconDel} />
          </button>
        </div>
        <div className={`${styles.addItemField}`}>
          <div>
            <span>{'{X}'}</span>
            <span className={styles.addItemFieldId}>app_id</span>
          </div>
          <span className={styles.addItemFieldText}>String</span>
          <button type="button" className={styles.btnIconDel}>
            <IconDel className={styles.iconDel} />
          </button>
        </div>
      </div>
      <div className={`${styles.addItemBox} ${styles.addItemHr}`}>
        <div className={styles.addItemNameBox}>
          <div className={styles.addItemName}>입력필드 설정</div>
          <div className={styles.row2}>
            <Button onClick={() => alert('Button clicked!')} size="small" color="tertiary">
              취소
            </Button>
            <Button onClick={() => alert('Button clicked!')} size="small" color="primary">
              저장
            </Button>
          </div>
        </div>
        {/* 내용 없을때 */}
        {/* <div className={styles.emptyBox}>
                  <span>입력필드를 생성하거나 선택해주세요.</span>
                </div> */}
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={styles.addItemName}>필드 타입</div>
        </div>
        <Select
          className={styles.select}
          options={options}
          getOptionLabel={(option) => option.text}
          getOptionValue={(option) => option.value}
          value={selectedValue}
          onChange={onChangeSelect}
          menuPosition="fixed"
        />
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={styles.addItemName}>변수명</div>
        </div>
        <Input placeholder="변수명을 입력해주세요." value={value} onChange={onChange} />
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={styles.addItemName}>레이블명</div>
        </div>
        <Input placeholder="레이블명을 입력해주세요." value={value} onChange={onChange} />
      </div>
      <div className={styles.addItemBox}>
        <Accordion className={styles.accordion} components={accordionItems} />
      </div>
    </div>
  );
};

const ModelSetting = () => {
  const [value, setValue] = useState<string>('');
  //switch
  const [checked, setChecked] = useState<boolean>(false);

  //slider
  const [value2, setValue2] = useState<number[]>([30]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  //select
  const [selectedValue, setSelectedValue] = useState<OptionType>();

  const onChangeSelect = (option: SelectSingleValue<OptionType>) => {
    setSelectedValue(option);
  };

  const [selectedValue3, setSelectedValue3] = useState<OptionType[]>([]);

  const onChangeSelect3 = (option: SelectMultiValue<OptionType>) => {
    setSelectedValue3(option);
  };

  //textarea
  const [text, setText] = useState<string>('');
  const onTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  //radio button
  const onCheckedChange = (checked: boolean) => {
    console.log('checked :', checked);
  };

  //accordion
  const accordionItems = [
    {
      label: '출력 변수',
      component: (
        <div className={styles.accordionContBox}>
          <div className={styles.accordionCont}>
            <div className={styles.accordionContItem}>
              <div className={styles.accordionContName}>Text</div>
              <div className={styles.accordionContValue}>String</div>
            </div>
            <div className={styles.accordionContItem}>
              <div className={styles.accordionContName}>Value data</div>
              <div className={styles.accordionContValue}>Value data name</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.addInner}>
      <div className={styles.addTopBox}>
        <input type="text" placeholder="이름을 입력해주세요." className={styles.addTitleInput} />
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={styles.addItemName}>설명</div>
        </div>
        <Input placeholder="설명을 입력해주세요." value={value} onChange={onChange} />
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={`${styles.addItemName} page-icon-requisite`}>모델 유형</div>
        </div>
        <div className={styles.col2}>
          <RadioButton
            id="radio1"
            label="커스텀 모델"
            value="basic"
            onCheckedChange={onCheckedChange}
          />
          <RadioButton
            id="radio2"
            label="모델 카탈로그"
            value="basic"
            onCheckedChange={onCheckedChange}
          />
        </div>
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={`${styles.addItemName} page-icon-requisite`}>모델</div>
        </div>
        <div className={styles.row2}>
          <Select
            className={styles.select}
            options={options2}
            getOptionLabel={(option) => option.text}
            getOptionValue={(option) => option.value}
            value={selectedValue}
            onChange={onChangeSelect}
            menuPosition="fixed"
          />
          <Button onClick={() => alert('Button clicked!')} size="medium" color="tertiary">
            설정
          </Button>
        </div>
      </div>

      {/* 설정btn 클릭시 활성화 클래스네임 active 추가 */}
      <div className={`${styles.setBox} ${styles.active}`}>
        <div className={styles.setName}>매개변수</div>
        <div className={styles.setInner}>
          <div className={styles.setItem}>
            <div className={styles.setItemName}>Temperature</div>
            <Switch checked={checked} onCheckedChange={setChecked} />
            <div className={styles.slider}>
              <Slider value={value2} onValueChange={setValue2} />
            </div>
            {/* numCount disabled 일때 클래스네임 disabled 추가 */}
            <div className={`${styles.numCount} ${styles.disabled}`}>
              {/* ${styles.disabled} */}
              <input type="number" placeholder="0" />
              <div className={styles.numCountControl}>
                <button type="button" className={styles.btnNum}>
                  <IconArrCount className={`${styles.iconArr} ${styles.iconArrUp}`} />
                </button>
                <button type="button" className={styles.btnNum}>
                  <IconArrCount className={`${styles.iconArr} ${styles.iconArrDown}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.setInner}>
          <div className={styles.setItem}>
            <div className={styles.setItemName}>Top P</div>

            <Switch checked={checked} onCheckedChange={setChecked} />
            <div className={styles.slider}>
              <Slider value={value2} onValueChange={setValue2} />
            </div>
            {/* numCount disabled 일때 클래스네임 disabled 추가 */}
            <div className={`${styles.numCount}`}>
              {/* ${styles.disabled} */}
              <input type="number" placeholder="0" />
              <div className={styles.numCountControl}>
                <button type="button" className={styles.btnNum}>
                  <IconArrCount className={`${styles.iconArr} ${styles.iconArrUp}`} />
                </button>
                <button type="button" className={styles.btnNum}>
                  <IconArrCount className={`${styles.iconArr} ${styles.iconArrDown}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.setInner}>
          <div className={styles.setItem}>
            <div className={styles.setItemName}>Presence penalty</div>
            <Switch checked={checked} onCheckedChange={setChecked} />
            <div className={styles.slider}>
              <Slider value={value2} onValueChange={setValue2} />
            </div>
            {/* numCount disabled 일때 클래스네임 disabled 추가 */}
            <div className={`${styles.numCount}`}>
              {/* ${styles.disabled} */}
              <input type="number" placeholder="0" />
              <div className={styles.numCountControl}>
                <button type="button" className={styles.btnNum}>
                  <IconArrCount className={`${styles.iconArr} ${styles.iconArrUp}`} />
                </button>
                <button type="button" className={styles.btnNum}>
                  <IconArrCount className={`${styles.iconArr} ${styles.iconArrDown}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.setInner}>
          <div className={styles.setItem}>
            <div className={styles.setItemName}>Frequency penalty</div>
            <Switch checked={checked} onCheckedChange={setChecked} />
            <div className={styles.slider}>
              <Slider value={value2} onValueChange={setValue2} />
            </div>
            {/* numCount disabled 일때 클래스네임 disabled 추가 */}
            <div className={`${styles.numCount}`}>
              {/* ${styles.disabled} */}
              <input type="number" placeholder="0" />
              <div className={styles.numCountControl}>
                <button type="button" className={styles.btnNum}>
                  <IconArrCount className={`${styles.iconArr} ${styles.iconArrUp}`} />
                </button>
                <button type="button" className={styles.btnNum}>
                  <IconArrCount className={`${styles.iconArr} ${styles.iconArrDown}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.setInner}>
          <div className={styles.setItem}>
            <div className={styles.setItemName}>Max tokens</div>
            <Switch checked={checked} onCheckedChange={setChecked} />
            <div className={styles.slider}>
              <Slider value={value2} onValueChange={setValue2} />
            </div>
            {/* numCount disabled 일때 클래스네임 disabled 추가 */}
            <div className={`${styles.numCount}`}>
              {/* ${styles.disabled} */}
              <input type="number" placeholder="0" />
              <div className={styles.numCountControl}>
                <button type="button" className={styles.btnNum}>
                  <IconArrCount className={`${styles.iconArr} ${styles.iconArrUp}`} />
                </button>
                <button type="button" className={styles.btnNum}>
                  <IconArrCount className={`${styles.iconArr} ${styles.iconArrDown}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={`${styles.addItemName} page-icon-requisite`}>컨텍스트</div>
        </div>
        <Select
          className={styles.select}
          options={options}
          getOptionLabel={(option) => option.text}
          getOptionValue={(option) => option.value}
          value={selectedValue}
          onChange={onChangeSelect}
          menuPosition="fixed"
        />
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={`${styles.addItemName} page-icon-requisite`}>프롬프트</div>
        </div>
        <Select
          className={styles.select}
          options={options}
          getOptionLabel={(option) => option.text}
          getOptionValue={(option) => option.value}
          value={selectedValue}
          onChange={onChangeSelect}
          menuPosition="fixed"
        />
        <Textarea
          onChange={onTextChange}
          value={
            'Here are the chat histories between human and assistant, inside <histories></histories> XML tags.'
          }
        />
      </div>
      <div className={styles.addItemBox}>
        <Accordion className={styles.accordion} components={accordionItems} />
      </div>
    </div>
  );
};

const KnowledgeBaseSetting = () => {
  const [value, setValue] = useState<string>('');
  const [value2, setValue2] = useState<number[]>([30]);
  const [selectedValue3, setSelectedValue3] = useState<OptionType[]>([]);
  //select
  const [selectedValue, setSelectedValue] = useState<OptionType>();

  const onChangeSelect = (option: SelectSingleValue<OptionType>) => {
    setSelectedValue(option);
  };

  const onChangeSelect3 = (option: SelectMultiValue<OptionType>) => {
    setSelectedValue3(option);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  //accordion
  const accordionItems = [
    {
      label: '출력 변수',
      component: (
        <div className={styles.accordionContBox}>
          <div className={styles.accordionCont}>
            <div className={styles.accordionContItem}>
              <div className={styles.accordionContName}>Text</div>
              <div className={styles.accordionContValue}>String</div>
            </div>
            <div className={styles.accordionContItem}>
              <div className={styles.accordionContName}>Value data</div>
              <div className={styles.accordionContValue}>Value data name</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.addInner}>
      <div className={styles.addTopBox}>
        <input type="text" placeholder="이름을 입력해주세요." className={styles.addTitleInput} />
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={styles.addItemName}>설명</div>
        </div>
        <Input placeholder="설명을 입력해주세요." value={value} onChange={onChange} />
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={`${styles.addItemName} page-icon-requisite`}>쿼리변수</div>
        </div>
        <Select
          className={styles.select}
          options={options}
          getOptionLabel={(option) => option.text}
          getOptionValue={(option) => option.value}
          value={selectedValue}
          onChange={onChangeSelect}
          menuPosition="fixed"
        />
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={`${styles.addItemName} page-icon-requisite`}>지식 베이스</div>
          <button type="button" className={styles.btnSet}>
            <IconSet className={styles.iconSet} />
          </button>
        </div>
        <Select
          className={styles.select}
          isMulti
          useCheckboxOption
          options={options3}
          getOptionLabel={(option) => option.text}
          getOptionValue={(option) => option.value}
          value={selectedValue3}
          onChange={onChangeSelect3}
        />
      </div>
      <div className={styles.addItemBox}>
        <Accordion className={styles.accordion} components={accordionItems} />
      </div>

      {/* 지식 베이스 btn 클릭시 활성화 클래스네임 active 추가 */}
      <div className={`${styles.setBox} ${styles.setBoxSm} ${styles.active}`}>
        <div className={styles.setName}>검색 설정</div>
        <div className={styles.setInner}>
          <div className={styles.setItem}>
            <div className={styles.setItemName}>
              <Slider value={value2} onValueChange={setValue2} /> K
            </div>
            {/* numCount disabled 일때 클래스네임 disabled 추가 */}
            <div className={`${styles.numCount}`}>
              {/* ${styles.disabled} */}
              <input type="number" placeholder="0" />
              <div className={styles.numCountControl}>
                <button type="button" className={styles.btnNum}>
                  <IconArrCount className={`${styles.iconArr} ${styles.iconArrUp}`} />
                </button>
                <button type="button" className={styles.btnNum}>
                  <IconArrCount className={`${styles.iconArr} ${styles.iconArrDown}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EndSetting = () => {
  //input
  const [value, setValue] = useState<string>('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  //select
  const [selectedValue, setSelectedValue] = useState<OptionType>();

  const onChangeSelect = (option: SelectSingleValue<OptionType>) => {
    setSelectedValue(option);
  };

  return (
    <div className={styles.addInner}>
      <div className={styles.addTopBox}>
        <input type="text" placeholder="이름을 입력해주세요." className={styles.addTitleInput} />
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={styles.addItemName}>설명</div>
        </div>
        <Input placeholder="설명을 입력해주세요." value={value} onChange={onChange} />
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={styles.addItemName}>출력변수</div>
          <button type="button" className={styles.btnPlus}>
            <span>생성</span>
          </button>
        </div>
        <div className={styles.row3}>
          <Input placeholder="설명을 입력해주세요." value={value} onChange={onChange} />
          <Select
            className={styles.select}
            options={options}
            getOptionLabel={(option) => option.text}
            getOptionValue={(option) => option.value}
            value={selectedValue}
            onChange={onChangeSelect}
            menuPosition="fixed"
          />
          <button type="button" className={styles.btnIconDel}>
            <IconDel className={styles.iconDel} />
          </button>
        </div>
        <div className={styles.row3}>
          <Input placeholder="설명을 입력해주세요." value={value} onChange={onChange} />
          <Select
            className={styles.select}
            options={options}
            getOptionLabel={(option) => option.text}
            getOptionValue={(option) => option.value}
            value={selectedValue}
            onChange={onChangeSelect}
            menuPosition="fixed"
          />
          <button type="button" className={styles.btnIconDel}>
            <IconDel className={styles.iconDel} />
          </button>
        </div>
        <div className={styles.row3}>
          <Input placeholder="설명을 입력해주세요." value={value} onChange={onChange} />
          <Select
            className={styles.select}
            options={options}
            getOptionLabel={(option) => option.text}
            getOptionValue={(option) => option.value}
            value={selectedValue}
            onChange={onChangeSelect}
            menuPosition="fixed"
          />
          <button type="button" className={styles.btnIconDel}>
            <IconDel className={styles.iconDel} />
          </button>
        </div>
      </div>
    </div>
  );
};
