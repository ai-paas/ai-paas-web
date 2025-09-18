import { useState } from 'react';
import type { ChangeEvent } from '@innogrid/ui';
import { BreadCrumb, Button, Input, Textarea } from '@innogrid/ui';
import { useNavigate } from 'react-router';

export default function PromptCreatePage() {
  const navigate = useNavigate();
  const [value, setValue] = useState<string>('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  //textarea
  const [text, setText] = useState<string>('');
  const onTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <main>
      <BreadCrumb
        items={[{ label: '프롬프트', path: '/prompt' }, { label: '프롬프트 생성' }]}
        className="breadcrumbBox"
        onNavigate={navigate}
      />
      <div className="page-title-box">
        <h2 className="page-title">프롬프트 생성</h2>
      </div>
      <div className="page-content page-pb-40">
        <div className="page-input-box">
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">이름</div>
            <div className="page-input_item-data">
              <Input placeholder="이름을 입력해주세요." value={value} onChange={onChange} />
              <p className="page-input_item-input-desc">이름 입력에 대한 설명글이 들어갑니다.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">설명</div>
            <div className="page-input_item-data">
              <Textarea value={text} onChange={onTextChange} placeholder="설명을 입력해주세요." />
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">프롬프트 입력</div>
            <div className="page-input_item-data">
              <pre className="page-input_item-code">
                <code>
                  function myFunction(){' '}
                  {
                    // 코드 로직
                  }
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
      <div className="page-footer">
        <div className="page-footer_btn-box">
          <div />
          <div>
            <Button size="large" color="secondary" onClick={() => navigate('/prompt')}>
              취소
            </Button>
            <Button size="large" color="primary" onClick={() => alert('Button clicked!')}>
              생성
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
