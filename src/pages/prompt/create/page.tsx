import { useState, type ChangeEvent } from 'react';
import { BreadCrumb, Button, Input, Textarea } from '@innogrid/ui';
import { useNavigate } from 'react-router';
import { useCreatePrompt } from '@/hooks/service/prompts';

interface PromptBody {
  prompt: {
    name: string;
    description: string;
    content: string;
  };
  prompt_variable: string[];
}

export default function PromptCreatePage() {
  const { createPrompt, isPending } = useCreatePrompt();
  const [prompt, setPrompt] = useState<PromptBody>({} as PromptBody);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPrompt({
      ...prompt,
      prompt: {
        ...prompt.prompt,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleSubmit = async () => {
    console.log('prompt:', prompt);
    if (!prompt.prompt.name || !prompt.prompt.description || !prompt.prompt.content) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    await createPrompt({
      prompt: {
        name: prompt.prompt.name,
        description: prompt.prompt.description,
        content: prompt.prompt.content,
      },
      prompt_variable: [],
    });
    navigate('/prompt');
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
              <Input
                placeholder="이름을 입력해주세요."
                value={prompt.prompt?.name ?? ''}
                onChange={handleChange}
                name="name"
              />
              <p className="page-input_item-input-desc">이름 입력에 대한 설명글이 들어갑니다.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">설명</div>
            <div className="page-input_item-data">
              <Textarea
                value={prompt.prompt?.description ?? ''}
                onChange={handleChange}
                placeholder="설명을 입력해주세요."
                name="description"
              />
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">프롬프트 입력</div>
            <div className="page-input_item-data">
              <input
                value={prompt.prompt?.content ?? ''}
                onChange={handleChange}
                placeholder="프롬프트를 입력해주세요."
                name="content"
              />
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
            <Button size="large" color="primary" onClick={handleSubmit} disabled={isPending}>
              생성
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
