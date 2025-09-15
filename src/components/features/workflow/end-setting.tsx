import { useState, type ChangeEvent } from 'react';
import styles from '../../../pages/workflow/workflow.module.scss';
import { Input, Select } from 'innogrid-ui';
import { IconDel } from '@/assets/img/icon';

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

export const EndSetting = () => {
  //input
  const [value, setValue] = useState<string>('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  //select
  const [selectedValue, setSelectedValue] = useState();

  const onChangeSelect = (option) => {
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
