import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SearchInput, useSearchInputState } from '@innogrid/ui';
import { useEffect } from 'react';
import { useGetWorkflowComponentTypes } from '@/hooks/service/workflows';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { DEFAULT_LABEL } from './workflow-node-defaults';
import type { WorkflowComponentType } from '@/types/workflow';

interface WorkflowComponentPanelProps {
  initialName?: string;
}

export const WorkflowComponentPanel = ({ initialName }: WorkflowComponentPanelProps) => {
  const { workflowComponentTypes } = useGetWorkflowComponentTypes();
  const { searchValue, ...restProps } = useSearchInputState();
  const nodes = useWorkflowStore((s) => s.nodes);
  const name = useWorkflowStore((s) => s.name);
  const setName = useWorkflowStore((s) => s.setName);
  const pendingNodeType = useWorkflowStore((s) => s.pendingNodeType);
  const setPendingNodeType = useWorkflowStore((s) => s.setPendingNodeType);

  useEffect(() => {
    // 전역 store 에 남은 이전 이름을 비우고, 템플릿이면 그 이름으로 시작한다.
    setName(initialName ?? '');
  }, [initialName, setName]);

  const handleClick = (type: WorkflowComponentType) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    // 다시 클릭하면 배치 모드 해제, 아니면 캔버스 클릭으로 배치하도록 대기 상태 진입
    setPendingNodeType(pendingNodeType === type ? null : type);
  };

  return (
    <div className="flex h-[calc(100vh-98px)] w-[270px] flex-col border-r border-gray-200">
      <div className="flex h-[50px] w-full flex-shrink-0 items-center border-b border-gray-200 bg-white px-4 py-2.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="워크플로우 이름"
          className="truncate text-base !font-bold -tracking-[0.5px] text-gray-900 outline-none"
        />
      </div>
      <div className="flex-shrink-0 px-2.5 pt-2.5 [&>[data-size='m-medium']]:w-full">
        <SearchInput variant="default" placeholder="검색어를 입력해주세요" {...restProps} />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-4 py-1">
        <Accordion type="multiple" className="space-y-1">
          {workflowComponentTypes.map((component) => (
            <AccordionItem key={component.component_id} value={component.type}>
              <AccordionTrigger asChild>
                <div className="flex cursor-pointer items-center justify-between">
                  <button
                    type="button"
                    className="relative flex h-7 flex-1 items-center after:absolute after:top-1/2 after:left-0 after:h-[7px] after:w-[7px] after:-translate-y-1/2 after:rotate-[-45deg] after:border-r after:border-b after:border-[#666] after:transition-all after:duration-300 after:ease-in-out after:content-[''] hover:after:border-[#1a1a1a]"
                  >
                    <span className="ml-[18px] inline-block text-sm font-semibold tracking-[-0.5px] text-[#1a1a1a]">
                      {DEFAULT_LABEL[component.type]}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClick(component.type)}
                    aria-pressed={pendingNodeType === component.type}
                    className={`relative size-7 rounded border-transparent transition-all duration-300 ease-in-out after:absolute after:top-[48%] after:left-[52%] after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:text-xl after:font-extralight after:content-['×'] hover:border hover:bg-[#f2f2f2] hover:after:text-[#1a1a1a] ${
                      pendingNodeType === component.type
                        ? 'bg-[#f2f2f2] after:text-[#1a1a1a]'
                        : 'after:text-[#666]'
                    }`}
                  >
                    <span className="sr-only">생성</span>
                  </button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="mt-2 w-full flex-col space-y-2 px-[22px] text-xs leading-[1.5] tracking-[-0.5px] text-[#525252]">
                  {nodes
                    .filter((n) => n.type === component.type)
                    .filter((node) =>
                      node.data.name?.toLowerCase().includes(searchValue.toLowerCase())
                    )
                    .map((node) => (
                      <div key={node.id} className="line-clamp-2">
                        {node.data.name}
                      </div>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
