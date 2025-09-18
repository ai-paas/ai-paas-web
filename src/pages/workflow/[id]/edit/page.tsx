import { useState, type ChangeEvent } from "react";
import type { SelectSingleValue, CheckboxCheckedState } from "@innogrid/ui";
import {
  Accordion,
  BreadCrumb,
  Button,
  Checkbox,
  Input,
  RadioButton,
  SearchInput,
  Select,
  useSearchInputState,
} from "@innogrid/ui";

import styles from "../../workflow.module.scss";
import { IconArrCount, IconDel } from "../../../../assets/img/icon";

//breadcrumb
const items = [{ label: "워크플로우", path: "/workflow" }];

//select option
const options = [
  { text: "옵션 1", value: "option1" },
  { text: "옵션 2", value: "option2" },
  { text: "옵션 3", value: "option3" },
];

export default function WorkflowEditPage() {
  //searchInput
  const { searchValue, ...restProps } = useSearchInputState();

  //input
  const [value, setValue] = useState<string>("");

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
    console.log("checked :", checked);
  };

  //accordion
  const accordionItems = [
    {
      label: "타이틀",
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
                  txt, MD, MDX, MARKDOWN, PDF, HTML, XLSX, XLS, DOC, DOCX, CSV,
                  EML, MSG, PPTX, PPT, XML, EPUB
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
                  <Input
                    placeholder="텍스트 필드"
                    value={value}
                    onChange={onChange}
                  />
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
              <RadioButton
                id="radio"
                label="URL"
                value="basic"
                onCheckedChange={onCheckedChange}
              />
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
                {/* 게이지 드래그시 gaugeActionBar 필요 */}
                <div className={styles.gauge}>
                  <span className={styles.gaugePointer}></span>
                  <span className={styles.gaugeActionBar}></span>
                  <span className={styles.gaugeBar}></span>
                </div>
                {/* numCount disabled 일때 클래스네임 disabled 추가 */}
                <div className={`${styles.numCount} ${styles.disabled}`}>
                  {/* ${styles.disabled} */}
                  <input type="number" placeholder="0" />
                  <div className={styles.numCountControl}>
                    <button type="button" className={styles.btnNum}>
                      <IconArrCount
                        className={`${styles.iconArr} ${styles.iconArrUp}`}
                      />
                    </button>
                    <button type="button" className={styles.btnNum}>
                      <IconArrCount
                        className={`${styles.iconArr} ${styles.iconArrDown}`}
                      />
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
    <main>
      <BreadCrumb
        items={items}
        onNavigate={(path: string) => {}}
        className="breadcrumbBox"
      />
      <div className={styles.container}>
        <div className={styles.leftSearchBox}>
          <div className={styles.titleBox}>
            <div className={styles.title}>테스트 템플릿 001</div>
          </div>
          <div className={styles.searchInputBox}>
            <SearchInput
              variant="default"
              placeholder="검색어를 입력해주세요"
              {...restProps}
            />
          </div>
          <div className={styles.list}>
            <div className={styles.item}>
              <div className={styles.itemName}>
                <button type="button" className={styles.btnMore}>
                  <span>시작</span>
                </button>
              </div>
            </div>
            {/* 클릭 시 클래스네임 active 추가 */}
            <div className={`${styles.item} ${styles.active}`}>
              <div className={styles.itemName}>
                <button type="button" className={styles.btnMore}>
                  <span>모델</span>
                </button>
                <button type="button" className={styles.btnPlus}>
                  <span>생성</span>
                </button>
              </div>
              <div className={styles.itemList}>
                <div>meta-liama/Meta-Liama-3-8B lim ank dn sdkd ndf nv</div>
                <div>meta-liama/Meta-Liama-3-8B</div>
                <div>meta-liama/Meta-Liama-3-8B</div>
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.itemName}>
                <button type="button" className={styles.btnMore}>
                  <span>데이터 셋</span>
                </button>
                <button type="button" className={styles.btnPlus}>
                  <span>생성</span>
                </button>
              </div>
              <div className={styles.itemList}>
                <div>meta-liama/Meta-Liama-3-8B</div>
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.itemName}>
                <button type="button" className={styles.btnMore}>
                  <span>도구</span>
                </button>
                <button type="button" className={styles.btnPlus}>
                  <span>생성</span>
                </button>
              </div>
              <div className={styles.itemList}>
                <div>meta-liama/Meta-Liama-3-8B</div>
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.itemName}>
                <button type="button" className={styles.btnMore}>
                  <span>끝</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.contentBox}>
          <div className={styles.topBtnBox}>
            <Button
              onClick={() => alert("Button clicked!")}
              size="medium"
              color="tertiary"
            >
              체크리스트
            </Button>
            <Button
              onClick={() => alert("Button clicked!")}
              size="medium"
              color="primary"
            >
              생성
            </Button>
          </div>
          <div className="absolute top-[70px] right-5 bottom-8 w-[340px] rounded-lg bg-white py-[30px] shadow-[4px_8px_18px_0px_rgba(0,0,0,0.2)]">
            <button type="button" className={styles.btnClose}>
              <span>닫기</span>
            </button>
            <div className={styles.addInner}>
              <div className={styles.addTopBox}>
                <input
                  type="text"
                  placeholder="이름을 입력해주세요."
                  value={"시작, 끝"}
                  className={styles.addTitleInput}
                />
              </div>
              <div className={styles.addItemBox}>
                <div className={styles.addItemNameBox}>
                  <div className={styles.addItemName}>설명</div>
                </div>
                <Input
                  placeholder="설명을 입력해주세요."
                  value={value}
                  onChange={onChange}
                />
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
                    <span>{"{X}"}</span>
                    <span className={styles.addItemFieldId}>app_id</span>
                  </div>
                  <span className={styles.addItemFieldText}>String</span>
                  <button type="button" className={styles.btnIconDel}>
                    <IconDel className={styles.iconDel} />
                  </button>
                </div>
                <div className={`${styles.addItemField}`}>
                  <div>
                    <span>{"{X}"}</span>
                    <span className={styles.addItemFieldId}>app_id</span>
                  </div>
                  <span className={styles.addItemFieldText}>String</span>
                  <button type="button" className={styles.btnIconDel}>
                    <IconDel className={styles.iconDel} />
                  </button>
                </div>
                <div className={`${styles.addItemField}`}>
                  <div>
                    <span>{"{X}"}</span>
                    <span className={styles.addItemFieldId}>app_id</span>
                  </div>
                  <span className={styles.addItemFieldText}>String</span>
                  <button type="button" className={styles.btnIconDel}>
                    <IconDel className={styles.iconDel} />
                  </button>
                </div>
              </div>
              <div className={styles.addItemBox}>
                <div className={styles.addItemNameBox}>
                  <div className={styles.addItemName}>출력변수</div>
                  <button type="button" className={styles.btnPlus}>
                    <span>생성</span>
                  </button>
                </div>
                <div className={styles.row3}>
                  <Input
                    placeholder="설명을 입력해주세요."
                    value={value}
                    onChange={onChange}
                  />
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
                  <Input
                    placeholder="설명을 입력해주세요."
                    value={value}
                    onChange={onChange}
                  />
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
                  <Input
                    placeholder="설명을 입력해주세요."
                    value={value}
                    onChange={onChange}
                  />
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
              <div className={`${styles.addItemBox} ${styles.addItemHr}`}>
                <div className={styles.addItemNameBox}>
                  <div className={styles.addItemName}>입력필드 설정</div>
                  <div className={styles.row2}>
                    <Button
                      onClick={() => alert("Button clicked!")}
                      size="small"
                      color="tertiary"
                    >
                      취소
                    </Button>
                    <Button
                      onClick={() => alert("Button clicked!")}
                      size="small"
                      color="primary"
                    >
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
                <Input
                  placeholder="변수명을 입력해주세요."
                  value={value}
                  onChange={onChange}
                />
              </div>
              <div className={styles.addItemBox}>
                <div className={styles.addItemNameBox}>
                  <div className={styles.addItemName}>레이블명</div>
                </div>
                <Input
                  placeholder="레이블명을 입력해주세요."
                  value={value}
                  onChange={onChange}
                />
              </div>
              <div className={styles.addItemBox}>
                <Accordion
                  className={styles.accordion}
                  components={accordionItems}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
