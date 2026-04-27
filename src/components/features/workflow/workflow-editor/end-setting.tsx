import { useState, type ChangeEvent } from 'react';
import styles from '@/pages/workflow/workflow.module.scss';
import { Input, Select } from '@innogrid/ui';
import { IconDel } from '@/assets/img/icon';

//select option
const options = [
  { text: '옵션 1', value: 'option1' },
  { text: '옵션 2', value: 'option2' },
  { text: '옵션 3', value: 'option3' },
];

type SelectOption = { text: string; value: string };

export const EndSetting = () => {
  //input
  const [value, setValue] = useState<string>('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  //select
  const [selectedValue, setSelectedValue] = useState<SelectOption | null>(null);

  const onChangeSelect = (option: SelectOption | null) => {
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
            options={options}
            getOptionLabel={(option) => option?.text ?? ''}
            getOptionValue={(option) => option?.value ?? ''}
            value={selectedValue}
            onChange={onChangeSelect}
            menuPosition="fixed"
          />
          <button type="button" className={styles.btnIconDel}>
            <span className={styles.iconDel}><IconDel /></span>
          </button>
        </div>
        <div className={styles.row3}>
          <Input placeholder="설명을 입력해주세요." value={value} onChange={onChange} />
          <Select
            options={options}
            getOptionLabel={(option) => option?.text ?? ''}
            getOptionValue={(option) => option?.value ?? ''}
            value={selectedValue}
            onChange={onChangeSelect}
            menuPosition="fixed"
          />
          <button type="button" className={styles.btnIconDel}>
            <span className={styles.iconDel}><IconDel /></span>
          </button>
        </div>
        <div className={styles.row3}>
          <Input placeholder="설명을 입력해주세요." value={value} onChange={onChange} />
          <Select
            options={options}
            getOptionLabel={(option) => option?.text ?? ''}
            getOptionValue={(option) => option?.value ?? ''}
            value={selectedValue}
            onChange={onChangeSelect}
            menuPosition="fixed"
          />
          <button type="button" className={styles.btnIconDel}>
            <span className={styles.iconDel}><IconDel /></span>
          </button>
        </div>
      </div>
    </div>
  );
};
