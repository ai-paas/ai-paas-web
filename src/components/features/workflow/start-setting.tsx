import {
  Accordion,
  Button,
  Checkbox,
  Input,
  RadioButton,
  Select,
  Slider,
  type CheckboxCheckedState,
} from '@innogrid/ui';
import { useState, type ChangeEvent } from 'react';
import styles from '../../../pages/workflow/workflow.module.scss';
import { IconArrCount, IconDel } from '@/assets/img/icon';

interface InputField {
  name: string;
}

const FIELD_TYPE_OPTIONS = [
  { text: '짧은 텍스트', value: 'string' },
  { text: '파일 리스트', value: 'files' },
];

export const StartSetting = () => {
  const [inputFields, setInputFields] = useState<InputField[]>([]);
  const [value, setValue] = useState<string>('');
  const [value2, setValue2] = useState<number[]>([30]);
  const [selectedValue, setSelectedValue] = useState();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const onChangeSelect = (option) => {
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
          <button
            type="button"
            className={styles.btnPlus}
            onClick={() => setInputFields([...inputFields, { name: 'sd' }])}
          >
            <span>생성</span>
          </button>
        </div>
        {inputFields.length > 0 ? (
          inputFields.map((field, idx) => (
            <div
              key={field.name ? field.name : idx}
              className={`${styles.addItemField} ${styles.active}`}
            >
              <div>
                <span>{'{X}'}</span>
                <span className={styles.addItemFieldId}>app_id</span>
              </div>
              <span className={styles.addItemFieldText}>String</span>
              <button type="button" className={styles.btnIconDel}>
                <IconDel className={styles.iconDel} />
              </button>
            </div>
          ))
        ) : (
          <div className={styles.emptyBox}>
            <span>생성된 입력필드가 없습니다.</span>
          </div>
        )}
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
      </div>
      {inputFields.length > 0 ? (
        <>
          <div className={styles.addItemBox}>
            <div className={styles.addItemNameBox}>
              <div className={styles.addItemName}>필드 타입</div>
            </div>
            <Select
              className={styles.select}
              options={FIELD_TYPE_OPTIONS}
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
        </>
      ) : (
        <div className={styles.emptyBox}>
          <span>입력필드를 생성하거나 선택해주세요.</span>
        </div>
      )}
    </div>
  );
};
