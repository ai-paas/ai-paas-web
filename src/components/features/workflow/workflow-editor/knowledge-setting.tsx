import { Accordion, Input, Select, Slider, type SelectMultiValue } from '@innogrid/ui';
import styles from '@/pages/workflow/workflow.module.scss';
import { useState, type ChangeEvent } from 'react';
import { IconArrCount, IconSet } from '@/assets/img/icon';
import { Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@radix-ui/react-popover';

//select option
const options = [
  { text: '옵션 1', value: 'option1' },
  { text: '옵션 2', value: 'option2' },
  { text: '옵션 3', value: 'option3' },
];

const options3 = [
  { text: '지식 베이스 001', value: 'option1' },
  { text: '지식 베이스 002', value: 'option2' },
  { text: '지식 베이스 003', value: 'option3' },
];

type SelectOption = { text: string; value: string };

export const KnowledgeBaseSetting = () => {
  const [value, setValue] = useState<string>('');
  const [value2, setValue2] = useState<number[]>([30]);
  const [selectedValue3, setSelectedValue3] = useState<SelectOption[]>([]);
  //select
  const [selectedValue, setSelectedValue] = useState<SelectOption | null>(null);

  const onChangeSelect = (option: SelectOption | null) => {
    setSelectedValue(option);
  };

  const onChangeSelect3 = (newValue: SelectMultiValue<SelectOption>) => {
    setSelectedValue3([...newValue]);
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
          options={options}
          getOptionLabel={(option) => option?.text ?? ''}
          getOptionValue={(option) => option?.value ?? ''}
          value={selectedValue}
          onChange={onChangeSelect}
          menuPosition="fixed"
        />
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={`${styles.addItemName} page-icon-requisite`}>지식 베이스</div>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className={styles.btnSet}>
                <span className={styles.iconSet}><IconSet /></span>
              </button>
            </PopoverTrigger>
            <PopoverPortal>
              <PopoverContent sideOffset={5}>
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
                            <span className={`${styles.iconArr} ${styles.iconArrUp}`}><IconArrCount /></span>
                          </button>
                          <button type="button" className={styles.btnNum}>
                            <span className={`${styles.iconArr} ${styles.iconArrDown}`}><IconArrCount /></span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </PopoverPortal>
          </Popover>
        </div>
        <Select
          isMulti
          options={options3}
          getOptionLabel={(option) => option?.text ?? ''}
          getOptionValue={(option) => option?.value ?? ''}
          value={selectedValue3}
          onChange={onChangeSelect3}
        />
      </div>
      <div className={styles.addItemBox}>
        <div>
          <Accordion components={accordionItems} />
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
