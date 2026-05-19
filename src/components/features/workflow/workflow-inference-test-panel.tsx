import { Button, useToast } from '@innogrid/ui';
import { useState, type ChangeEvent } from 'react';
import { useTestMLWorkflow, useTestRagWorkflow } from '@/hooks/service/workflows';
import { parseWorkflowError } from './workflow-editor/parse-workflow-error';

interface WorkflowInferenceTestPanelProps {
  workflowId?: string;
}

export const WorkflowInferenceTestPanel = ({ workflowId }: WorkflowInferenceTestPanelProps) => {
  const toast = useToast();
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const { testRagWorkflow, testResult: ragResult, isPending: isRagPending } = useTestRagWorkflow();
  const { testMLWorkflow, testResult: mlResult, isPending: isMLPending } = useTestMLWorkflow();

  const handleRagTest = () => {
    if (!workflowId || !text.trim()) return;

    testRagWorkflow(
      { surro_workflow_id: workflowId, text: text.trim() },
      {
        onSuccess: () => {
          toast.open({
            status: 'positive',
            title: 'RAG 테스트 성공',
            children: '워크플로우 추론 테스트가 완료되었습니다.',
          });
        },
        onError: async (error) => {
          toast.open({
            status: 'negative',
            title: 'RAG 테스트 실패',
            children: await parseWorkflowError(
              error,
              '워크플로우 추론 테스트 중 오류가 발생했습니다.'
            ),
          });
        },
      }
    );
  };

  const handleMLTest = () => {
    if (!workflowId || !image) return;

    testMLWorkflow(
      { surro_workflow_id: workflowId, image },
      {
        onSuccess: () => {
          toast.open({
            status: 'positive',
            title: 'ML 테스트 성공',
            children: '워크플로우 이미지 추론 테스트가 완료되었습니다.',
          });
        },
        onError: async (error) => {
          toast.open({
            status: 'negative',
            title: 'ML 테스트 실패',
            children: await parseWorkflowError(
              error,
              '워크플로우 이미지 테스트 중 오류가 발생했습니다.'
            ),
          });
        },
      }
    );
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files?.[0] ?? null);
  };

  return (
    <div className="tabs-Content">
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-3 font-semibold">RAG / LLM 테스트</div>
          <textarea
            className="h-32 w-full resize-none rounded border border-gray-300 p-3"
            placeholder="테스트할 텍스트를 입력해주세요."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-3">
            <Button
              size="medium"
              color="primary"
              disabled={!workflowId || !text.trim() || isRagPending}
              onClick={handleRagTest}
            >
              RAG 테스트
            </Button>
          </div>
          {ragResult && (
            <div className="mt-4 rounded border border-gray-200 p-4">
              <div className="mb-2 text-sm font-semibold">결과</div>
              <div className="text-sm whitespace-pre-wrap">{ragResult.final_result || '-'}</div>
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 font-semibold">ML / ODM 테스트</div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
          />
          <div className="mt-3">
            <Button
              size="medium"
              color="primary"
              disabled={!workflowId || !image || isMLPending}
              onClick={handleMLTest}
            >
              ML 테스트
            </Button>
          </div>
          {mlResult && (
            <div className="mt-4 rounded border border-gray-200 p-4">
              <div className="mb-2 text-sm font-semibold">결과</div>
              {mlResult.final_result ? (
                <img
                  className="max-h-80 max-w-full"
                  alt="워크플로우 이미지 추론 결과"
                  src={`data:image/jpeg;base64,${mlResult.final_result}`}
                />
              ) : (
                <div className="text-sm">-</div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
