import type { ReactNode } from 'react';
import {
  AnswerIcon,
  HomeIcon,
  KnowledgeRetrievalIcon,
  LlmIcon,
} from '@/components/features/workflow/icons/workflow-icons';
import type { WorkflowComponentType } from '@/types/workflow';

const NODE_CARD_VISUAL: Record<WorkflowComponentType, { icon: ReactNode; iconBg: string }> =
  {
    START: { icon: <HomeIcon />, iconBg: 'bg-blue-500' },
    MODEL: { icon: <LlmIcon />, iconBg: 'bg-indigo-500' },
    KNOWLEDGE_BASE: { icon: <KnowledgeRetrievalIcon />, iconBg: 'bg-emerald-500' },
    END: { icon: <AnswerIcon />, iconBg: 'bg-amber-500' },
  };

interface WorkflowNodeCardProps {
  type: WorkflowComponentType;
  name?: ReactNode;
  /** 헤더 아래에 표시되는 부가 콘텐츠(예: 모델 노드에 설정된 모델). */
  children?: ReactNode;
}

/**
 * 워크플로우 노드의 카드 본문. 실제 캔버스 노드와 배치 미리보기(ghost)가
 * 동일하게 보이도록 두 곳에서 공유한다.
 */
export const WorkflowNodeCard = ({ type, name, children }: WorkflowNodeCardProps) => {
  const { icon, iconBg } = NODE_CARD_VISUAL[type];

  return (
    <div className="group relative w-[240px] rounded-[15px] border border-transparent bg-white pb-1 shadow-xs hover:shadow-lg">
      <div className="flex items-center rounded-t-2xl px-3 pt-3 pb-2">
        <div
          className={`mr-2 flex size-6 shrink-0 items-center justify-center rounded-lg border-[0.5px] border-white/2 text-white shadow-md ${iconBg}`}
        >
          {icon}
        </div>
        <div className="mr-1 flex grow items-center truncate">{name}</div>
      </div>
      {children}
    </div>
  );
};
