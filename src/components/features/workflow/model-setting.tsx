import { useState, type ChangeEvent } from 'react';
import styles from '../../../pages/workflow/workflow.module.scss';
import {
  Accordion,
  Button,
  Input,
  RadioButton,
  Select,
  Slider,
  Switch,
  Textarea,
} from 'innogrid-ui';
import { IconArrCount } from '@/assets/img/icon';

export const ModelSetting = () => {
  const [value, setValue] = useState<string>('');
  //switch
  const [checked, setChecked] = useState<boolean>(false);

  //slider
  const [value2, setValue2] = useState<number[]>([30]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  //select
  const [selectedValue, setSelectedValue] = useState();

  const onChangeSelect = (option) => {
    setSelectedValue(option);
  };

  const [selectedValue3, setSelectedValue3] = useState([]);

  const onChangeSelect3 = (option) => {
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
            options={[]}
            getOptionLabel={(option) => option.text}
            getOptionValue={(option) => option.value}
            value={selectedValue}
            onChange={onChangeSelect}
            menuPosition="fixed"
          />
          <div className="relative">
            <Button onClick={() => alert('Button clicked!')} size="medium" color="tertiary">
              설정
            </Button>
          </div>
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
          options={[]}
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
          options={[]}
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
