import { Button, Input, Modal, Textarea } from '@innogrid/ui';
import { useState } from 'react';

export const ModelRegisterButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');
  const [text, setText] = useState('');

  return (
    <>
      <div style={{ marginLeft: '20px' }}>
        <Button onClick={() => setIsOpen(true)} size="medium" color="secondary">
          모델 등록
        </Button>
      </div>
      <Modal
        allowOutsideInteraction
        isOpen={isOpen}
        title="모델 등록"
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
        <div className="space-y-[18px]">
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">이름</div>
            <div className="page-input_item-data mt-2.5">
              <Input
                size="m-medium"
                placeholder="이름을 입력해주세요."
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">설명</div>
            <div className="page-input_item-data mt-2.5">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="설명을 입력해주세요."
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
