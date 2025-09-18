import { Button, Modal, Select, type SelectSingleValue } from '@innogrid/ui';
import { useState } from 'react';

type OptionType = { text: string; value: string };

const options = [
  { text: '옵션 1', value: 'option1' },
  { text: '옵션 2', value: 'option2' },
  { text: '옵션 3', value: 'option3' },
  { text: '옵션 3', value: 'option3' },
  { text: '옵션 3', value: 'option3' },
  { text: '옵션 3', value: 'option3' },
];

export const HardwareOptimizationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<OptionType>();

  const onChangeSelect = (option: SelectSingleValue<OptionType>) => {
    setSelectedValue(option);
  };

  return (
    <>
      <div style={{ marginLeft: '20px' }}>
        <Button onClick={() => setIsOpen(true)} size="medium" color="secondary">
          하드웨어 최적화
        </Button>
      </div>
      <Modal
        allowOutsideInteraction
        isOpen={isOpen}
        title="하드웨어 최적화"
        size="small"
        onRequestClose={() => setIsOpen(false)}
        action={() => alert('확인!')}
        buttonTitle="확인"
        subButton={
          <Button size="large" color="secondary" onClick={() => setIsOpen(false)}>
            취소
          </Button>
        }
      >
        <div className="page-input_item-box">
          <div className="page-input_item-name page-icon-requisite">최적화 방식</div>
          <div className="page-input_item-data mt-2.5">
            <Select
              size="m-full"
              menuPosition="fixed"
              options={options}
              getOptionLabel={(option) => option.text}
              getOptionValue={(option) => option.value}
              value={selectedValue}
              onChange={onChangeSelect}
              styles={{ menuPortal: (base) => ({ ...base, top: 'unset', left: 'unset' }) }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
