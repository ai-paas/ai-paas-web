import { Accordion, Input, Select, Slider } from 'innogrid-ui';
import styles from '../../../pages/workflow/workflow.module.scss';
import { useState, type ChangeEvent } from 'react';
import { IconArrCount, IconSet } from '@/assets/img/icon';

//select option
const options = [
  { text: '옵션 1', value: 'option1' },
  { text: '옵션 2', value: 'option2' },
  { text: '옵션 3', value: 'option3' },
];

type OptionType = { text: string; value: string };

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

export const KnowledgeBaseSetting = () => {
  const [value, setValue] = useState<string>('');
  const [value2, setValue2] = useState<number[]>([30]);
  const [selectedValue3, setSelectedValue3] = useState([]);
  //select
  const [selectedValue, setSelectedValue] = useState();

  const onChangeSelect = (option) => {
    setSelectedValue(option);
  };

  const onChangeSelect3 = (option) => {
    setSelectedValue3(option);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
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
