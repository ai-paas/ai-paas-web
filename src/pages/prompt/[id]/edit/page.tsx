import { useUpdatePrompt, useGetPromptVariableTypes } from '@/hooks/service/prompts';
import { PromptEditor } from '@/components/ui/prompt-editor';
import { BreadCrumb, Button, Input, Textarea } from '@innogrid/ui';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

interface PromptBody {
  prompt: {
    name: string;
    description: string;
    content: string;
  };
  prompt_variable: string[];
}

export default function PromptEditPage() {
  const { id } = useParams();
  const promptId = Number(id);
  // const { prompt } = useGetPrompt(promptId);
  const { updatePrompt, isPending } = useUpdatePrompt();
  const { availableTypes } = useGetPromptVariableTypes();
  const [prompt, setPrompt] = useState<PromptBody>({} as PromptBody);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPrompt({
      ...prompt,
      prompt: {
        ...prompt.prompt,
        [e.target.name]: e.target.value,
      },
    });
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.matchAll(/\{\{#\s*([^{}#]+?)\s*#\}\}/g);
    return [...new Set([...matches].map((match) => match[1]))];
  };

  const handleSubmit = () => {
    if (!prompt.prompt.name || !prompt.prompt.description || !prompt.prompt.content) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const variables = extractVariables(prompt.prompt.content);
    const invalidVariables = variables.filter((v) => !availableTypes.includes(v));
    if (invalidVariables.length > 0) {
      alert(
        `사용할 수 없는 변수입니다: ${invalidVariables.join(', ')}\n사용 가능한 변수: ${availableTypes.join(', ')}`
      );
      return;
    }

    updatePrompt({
      surro_prompt_id: promptId,
      name: prompt.prompt.name,
      description: prompt.prompt.description,
      content: prompt.prompt.content,
      prompt_variable: variables,
    });
    navigate('/prompt');
  };

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[{ label: '프롬프트', path: '/prompt' }, { label: '프롬프트 생성' }]}
          onNavigate={navigate}
        />
      </div>
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
              <PromptEditor
                value={prompt.prompt?.content ?? ''}
                onChange={handleChange}
                placeholder={'예) 당신은 친절한 고객 상담원입니다. 다음 질문에 정중하게 답변해주세요: {{#context#}}'}
                name="content"
                height={320}
                allowedVariables={availableTypes}
              />
              <p className="page-input_item-input-desc">
                {'{{#변수명#}}'} 형식으로 변수를 지정할 수 있습니다. 사용 가능한 변수:{' '}
                {availableTypes.length > 0
                  ? availableTypes.map((type) => `{{#${type}#}}`).join(', ')
                  : '없음'}
              </p>
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
