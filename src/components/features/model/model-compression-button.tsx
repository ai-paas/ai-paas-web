import { Button, Modal, Select, type SelectSingleValue } from 'innogrid-ui';
import { useState } from 'react';

type OptionType = { text: string; value: string };

const options = [
  { text: '옵션 1', value: 'option1' },
  { text: '옵션 2', value: 'option2' },
  { text: '옵션 3', value: 'option3' },
];

export const ModelCompressionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<OptionType>();

  const onChangeSelect = (option: SelectSingleValue<OptionType>) => {
    setSelectedValue(option);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="medium" color="secondary">
        모델 경량화
      </Button>
      <Modal
        allowOutsideInteraction
        isOpen={isOpen}
        title="모델 경량화"
        size="small"
        onRequestClose={() => setIsOpen(false)}
        action={() => alert('확인!')}
        buttonTitle="확인"
        subButton={
          <Button size="large" color="secondary" onClick={() => alert('취소!')}>
            취소
          </Button>
        }
      >
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">경량화 방식</div>
          <div className="page-input_item-data mt-2.5">
            <Select
              size="m-full"
              options={options}
              getOptionLabel={(option) => option.text}
              getOptionValue={(option) => option.value}
              value={selectedValue}
              onChange={onChangeSelect}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
