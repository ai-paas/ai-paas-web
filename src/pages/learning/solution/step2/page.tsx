import { useState } from "react";
import type { SelectSingleValue } from "@innogrid/ui";
import {
  BreadCrumb,
  Button,
  Select,
  Stepper,
  RadioButton,
  Accordion,
} from "@innogrid/ui";

import styles from "../../learning.module.scss";
import { IconArrCount, IconFileUp } from "../../../../assets/img/icon";

//breadcrumb
const items = [{ label: "학습", path: "/learning" }, { label: "학습 생성" }];

//stepper
const steps = [
  { title: "학습 생성 001" },
  { title: "학습 생성 002" },
  { title: "학습 생성 003" },
  { title: "학습 생성 004" },
];

//select option
type OptionType = { text: string; value: string };

const options = [
  { text: "옵션 1", value: "option1" },
  { text: "옵션 2", value: "option2" },
  { text: "옵션 3", value: "option3" },
];

export default function LearningSolutionStep2Page() {
  //stepper
  const [step, setStep] = useState<number>(1);

  //select
  const [selectedValue, setSelectedValue] = useState<OptionType>();

  const onChangeSelect = (option: SelectSingleValue<OptionType>) => {
    setSelectedValue(option);
  };

  //radio button
  const onCheckedChange = (checked: boolean) => {
    console.log("checked :", checked);
  };

  //accordion
  const accordionItems1 = [
    {
      label: "타이틀",
      component: (
        <div>
          <div>
            <div className="page-input_item-col2">
              <RadioButton
                id="radio"
                label="회귀"
                value="basic"
                onCheckedChange={onCheckedChange}
              />
              <RadioButton
                id="radio"
                label="분류"
                value="basic"
                onCheckedChange={onCheckedChange}
              />
            </div>
          </div>
        </div>
      ),
    },
  ];
  const accordionItems2 = [
    {
      label: "이미지 데이터 셋",
      component: (
        <div>
          <div>
            <div className="page-input_item-col2">
              <RadioButton
                id="radio"
                label="객체감지"
                value="basic"
                onCheckedChange={onCheckedChange}
              />
              <RadioButton
                id="radio"
                label="단일 라벨 분류"
                value="basic"
                onCheckedChange={onCheckedChange}
              />
              <RadioButton
                id="radio"
                label="멀티 라벨 분류"
                value="basic"
                onCheckedChange={onCheckedChange}
              />
              <RadioButton
                id="radio"
                label="분할"
                value="basic"
                onCheckedChange={onCheckedChange}
              />
            </div>
          </div>
        </div>
      ),
    },
  ];
  const accordionItems3 = [
    {
      label: "동영상 데이터 셋",
      component: (
        <div>
          <div>
            <div className="page-input_item-col2">
              <RadioButton
                id="radio"
                label="동작 인식"
                value="basic"
                onCheckedChange={onCheckedChange}
              />
              <RadioButton
                id="radio"
                label="분류"
                value="basic"
                onCheckedChange={onCheckedChange}
              />
              <RadioButton
                id="radio"
                label="객체 추적"
                value="basic"
                onCheckedChange={onCheckedChange}
              />
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
      <div className="page-title-box">
        <h2 className="page-title">학습 생성</h2>
      </div>
      <div className="page-content-stepper">
        <div className="page-stepper-box">
          <Stepper step={step} steps={steps} />
        </div>
        <div className="page-content-stepper-desc">
          <div className="page-content page-p-40">
            <div className="page-input-box">
              <div className="page-input_title">데이터 설정</div>
              <div className="page-input_item-box">
                <div className="page-input_item-name page-icon-requisite">
                  데이터 유형
                </div>
                <div className="page-input_item-data">
                  <Accordion
                    className="page-input_item_round-box"
                    components={accordionItems1}
                    defaultValue="0"
                  />
                </div>
                <div className="page-input_item-data">
                  <Accordion
                    className="page-input_item_round-box"
                    components={accordionItems2}
                    defaultValue="0"
                  />
                </div>
                <div className="page-input_item-data">
                  <Accordion
                    className="page-input_item_round-box"
                    components={accordionItems3}
                    defaultValue="0"
                  />
                </div>
              </div>
              <div className="page-input_item-box">
                <div className="page-input_item-name page-icon-requisite">
                  데이터 셋
                </div>
                <div className="page-input_item-data">
                  <div className="page-input_item-col2">
                    <RadioButton
                      id="radio"
                      label="파일 업로드"
                      value="basic"
                      onCheckedChange={onCheckedChange}
                    />
                    <RadioButton
                      id="radio"
                      label="데이터 셋 설정"
                      value="basic"
                      onCheckedChange={onCheckedChange}
                    />
                  </div>
                </div>
              </div>
              <div className="page-input_item-box">
                <div className="page-input_item-name page-icon-requisite">
                  파일 업로드
                </div>
                <div className="page-input_item-data">
                  <div className="page-input_item-data_fileUpload">
                    <label className="fileUpload-preview">
                      <input type="file" className="fileUpload-file" />
                      <IconFileUp />
                      <p className="fileUpload-preview_msg">
                        파일을 여기에 드래그하거나 클릭하여 업로드하세요.
                        (파일당 최대 크기 15MB)
                        <br />
                        허용되는 파일 형식: txt, markdown, mdx, pdf, html, xlsx,
                        xls, docx, csv,md,htm
                      </p>
                    </label>
                  </div>
                  <div className="page-flex-right page-pt-10">
                    <Button
                      color="secondary"
                      onClick={() => alert("Button clicked!")}
                    >
                      유효성 검증
                    </Button>
                  </div>
                </div>
              </div>
              <div className="page-input_item-box">
                <div className="page-input_item-name page-icon-requisite">
                  데이터 분할
                </div>
                <div className="page-input_item-data">
                  <div className="page-input_item-col2">
                    <RadioButton
                      id="radio"
                      label="고정"
                      value="basic"
                      onCheckedChange={onCheckedChange}
                    />
                    <RadioButton
                      id="radio"
                      label="수동"
                      value="basic"
                      onCheckedChange={onCheckedChange}
                    />
                    <RadioButton
                      id="radio"
                      label="시간순"
                      value="basic"
                      onCheckedChange={onCheckedChange}
                    />
                  </div>
                </div>
                {/* 데이터 분할이 고정 일때 */}
                <div className="page-input_item-data">
                  <div className="page-detail-round-box">
                    <div className="page-detail-round-data">
                      <div className="page-input_item-row2">
                        <div className={styles.chartBox}>차트영역</div>
                        <div className={styles.chartLegendBox}>
                          <div className={styles.chartLegend}>
                            <div className={styles.legend}>
                              <div>
                                <i
                                  className={`${styles.legendMark} ${styles.legendMark1}`}
                                />
                                <span>테스트</span>
                              </div>
                              <em>10%</em>
                            </div>
                            <div className={styles.legend}>
                              <div>
                                <i
                                  className={`${styles.legendMark} ${styles.legendMark2}`}
                                />
                                <span>검증</span>
                              </div>
                              <em>10%</em>
                            </div>
                            <div className={styles.legend}>
                              <div>
                                <i
                                  className={`${styles.legendMark} ${styles.legendMark3}`}
                                />
                                <span>학습</span>
                              </div>
                              <em>80%</em>
                            </div>
                          </div>
                          <p>
                            데이터의 80%는 학습에, 10%는 검증에, 10%는 테스트에
                            무작위로 할당됩니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 데이터 분할이 수동 일때 */}
                <div className="page-input_item-data">
                  <div className="page-detail-round-box">
                    <div className="page-detail-round-data">
                      <div className="page-input_item-row2">
                        <div className={styles.numCountBox}>
                          <div>
                            <div className={styles.numCountName}>학습</div>
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
                        <div className={styles.numCountBox}>
                          <div>
                            <div className={styles.numCountName}>검증</div>
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
                        <div className={styles.numCountBox}>
                          <div>
                            <div className={styles.numCountName}>테스트</div>
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
                </div>
                {/* 데이터 분할이 시간순 일때 */}
                <div className="page-input_item-data">
                  <div className="page-detail-round-box">
                    <div className="page-detail-round-data">
                      <div className={styles.graphBox}>
                        <div className={styles.graph}>
                          <div className={styles.graph1}>
                            <div className={styles.graphName}>
                              <span>학습</span>
                              <em>80%</em>
                            </div>
                            <div className={styles.graphBar}></div>
                          </div>
                          <div className={styles.graph2}>
                            <div className={styles.graphName}>
                              <span>검증</span>
                              <em>10%</em>
                            </div>
                            <div className={styles.graphBar}></div>
                          </div>
                          <div className={styles.graph3}>
                            <div className={styles.graphName}>
                              <span>테스트</span>
                              <em>10%</em>
                            </div>
                            <div className={styles.graphBar}></div>
                          </div>
                        </div>
                        <div className={styles.graphLegend}>
                          <div>Start time</div>
                          <div>End time</div>
                        </div>
                        <p>
                          데이터의 80%는 학습에, 10%는 검증에, 10%는 테스트에
                          무작위로 할당됩니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="page-input_item-box">
                <div className="page-input_item-name">이미지 데이터 셋</div>
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
          </div>
          <div className="page-footer">
            <div className="page-footer_btn-box">
              <Button
                size="large"
                color="secondary"
                onClick={() => alert("Button clicked!")}
              >
                취소
              </Button>
              <div>
                <Button
                  size="large"
                  color="tertiary"
                  onClick={() => alert("Button clicked!")}
                >
                  이전
                </Button>
                <div className="btn-next">
                  <Button
                    size="large"
                    color="primary"
                    onClick={() => alert("Button clicked!")}
                  >
                    다음
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
