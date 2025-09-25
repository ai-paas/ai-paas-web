import { useState } from "react";
import type { SelectSingleValue } from "@innogrid/ui";
import { BreadCrumb, Button, Select, Stepper, Input } from "@innogrid/ui";

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

export default function LearningAssignmentStep3Page() {
  //stepper
  const [step, setStep] = useState<number>(2);

  //select
  const [selectedValue, setSelectedValue] = useState<OptionType>();

  const onChangeSelect = (option: SelectSingleValue<OptionType>) => {
    setSelectedValue(option);
  };

  //input
  const [value, setValue] = useState<string>("");

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

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
              <div className="page-input_title">모델 설정</div>
              <div className="page-input_item-box">
                <div className="page-input_item-name page-icon-requisite">
                  모델
                </div>
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
              <div className="page-input_title">하이퍼 파라미터 설정</div>
              <div className="page-input_item-box">
                <div className="page-input_item-name">Time</div>
                <div className="page-input_item-data">
                  <div className="page-input_item-row2 page-gap-6">
                    <Select
                      className="page-input_item-data_select page-w-100per"
                      options={options}
                      getOptionLabel={(option) => option.text}
                      getOptionValue={(option) => option.value}
                      value={selectedValue}
                      onChange={onChangeSelect}
                    />
                    <Select
                      className="page-input_item-data_select page-w-100per"
                      options={options}
                      getOptionLabel={(option) => option.text}
                      getOptionValue={(option) => option.value}
                      value={selectedValue}
                      onChange={onChangeSelect}
                    />
                  </div>
                </div>
              </div>
              <div className="page-input_item-box">
                <div className="page-input_item-name">Imagsz</div>
                <div className="page-input_item-data">
                  <div className="page-input_item-row3">
                    <Select
                      className="page-input_item-data_select"
                      options={options}
                      getOptionLabel={(option) => option.text}
                      getOptionValue={(option) => option.value}
                      value={selectedValue}
                      onChange={onChangeSelect}
                    />
                    <Input
                      placeholder="가로"
                      value={value}
                      onChange={onChange}
                    />
                    <Input
                      placeholder="세로"
                      value={value}
                      onChange={onChange}
                    />
                  </div>
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
