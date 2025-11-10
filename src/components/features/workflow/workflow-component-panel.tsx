import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useReactFlow } from '@xyflow/react';
import { SearchInput, useSearchInputState } from '@innogrid/ui';

const DEFAULT_LABEL = {
  start: '시작',
  model: '모델',
  knowledgebase: '지식베이스',
  end: '끝',
};

export const WorkflowComponentPanel = () => {
  const { searchValue, ...restProps } = useSearchInputState();
  const { addNodes } = useReactFlow();

  const handleClick =
    (type: 'start' | 'model' | 'knowledgebase' | 'end') =>
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      addNodes([
        {
          id: `n${Math.floor(Math.random() * 1000)}`,
          position: { x: 0, y: 200 },
          data: { label: DEFAULT_LABEL[type] },
          type,
        },
      ]);
    };

  return (
    <div className="flex h-[calc(100vh-98px)] w-[270px] flex-col border-r border-gray-200">
      <div className="flex h-[50px] w-full flex-shrink-0 items-center border-b border-gray-200 bg-white px-4 py-2.5">
        <div className="truncate text-base font-bold -tracking-[0.5px] text-gray-900">
          테스트 템플릿 001
        </div>
      </div>
      <div className="flex-shrink-0 px-2.5 pt-2.5 [&>[data-size='m-medium']]:w-full">
        <SearchInput
          variant="default"
          placeholder="검색어를 입력해주세요"
          className="[&>[data-size='m-medium']]:!w-full"
          {...restProps}
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-4 py-1">
        <Accordion type="multiple" className="space-y-1">
          <AccordionItem value="start" className="">
            <AccordionTrigger asChild>
              <div className="flex cursor-pointer items-center justify-between">
                <button
                  type="button"
                  className="relative flex h-7 flex-1 items-center after:absolute after:top-1/2 after:left-0 after:h-[7px] after:w-[7px] after:-translate-y-1/2 after:rotate-[-45deg] after:border-r after:border-b after:border-[#666] after:transition-all after:duration-300 after:ease-in-out after:content-[''] hover:after:border-[#1a1a1a]"
                >
                  <span className="ml-[18px] inline-block text-sm font-semibold tracking-[-0.5px] text-[#1a1a1a]">
                    시작
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleClick('start')}
                  className="relative size-7 rounded border-transparent transition-all duration-300 ease-in-out after:absolute after:top-[48%] after:left-[52%] after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:text-xl after:font-extralight after:text-[#666] after:content-['×'] hover:border hover:bg-[#f2f2f2] hover:after:text-[#1a1a1a]"
                >
                  <span className="sr-only">생성</span>
                </button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mt-2 w-full flex-col space-y-2 px-[22px] text-xs leading-[1.5] tracking-[-0.5px] text-[#525252]">
                <div className="line-clamp-2">
                  meta-liama/Meta-Liama-3-8B lim ank dn sdkd ndf nv
                </div>
                <div className="line-clamp-2">meta-liama/Meta-Liama-3-8B</div>
                <div className="line-clamp-2">meta-liama/Meta-Liama-3-8B</div>
                <div className="line-clamp-2">meta-liama/Meta-Liama-3-8B</div>
                <div className="line-clamp-2">meta-liama/Meta-Liama-3-8B</div>
                <div className="line-clamp-2">meta-liama/Meta-Liama-3-8B</div>
                <div className="line-clamp-2">meta-liama/Meta-Liama-3-8B</div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="model">
            <AccordionTrigger asChild>
              <div className="flex cursor-pointer items-center justify-between gap-5">
                <button
                  type="button"
                  className="relative flex h-7 flex-1 items-center after:absolute after:top-1/2 after:left-0 after:h-[7px] after:w-[7px] after:-translate-y-1/2 after:rotate-[-45deg] after:border-r after:border-b after:border-[#666] after:transition-all after:duration-300 after:ease-in-out after:content-[''] hover:after:border-[#1a1a1a]"
                >
                  <span className="ml-[18px] inline-block text-sm font-semibold tracking-[-0.5px] text-[#1a1a1a]">
                    모델
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleClick('model')}
                  className="relative size-7 rounded border-transparent transition-all duration-300 ease-in-out after:absolute after:top-[48%] after:left-[52%] after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:text-xl after:font-extralight after:text-[#666] after:content-['×'] hover:border hover:bg-[#f2f2f2] hover:after:text-[#1a1a1a]"
                >
                  <span className="sr-only">생성</span>
                </button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mt-2 w-full flex-col space-y-2 px-[22px] text-xs leading-[1.5] tracking-[-0.5px] text-[#525252]">
                <div className="line-clamp-2">
                  meta-liama/Meta-Liama-3-8B lim ank dn sdkd ndf nv
                </div>
                <div className="line-clamp-2">meta-liama/Meta-Liama-3-8B</div>
                <div className="line-clamp-2">meta-liama/Meta-Liama-3-8B</div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="knowledge-base">
            <AccordionTrigger asChild>
              <div className="flex cursor-pointer items-center justify-between gap-5">
                <button
                  type="button"
                  className="relative flex h-7 flex-1 items-center after:absolute after:top-1/2 after:left-0 after:h-[7px] after:w-[7px] after:-translate-y-1/2 after:rotate-[-45deg] after:border-r after:border-b after:border-[#666] after:transition-all after:duration-300 after:ease-in-out after:content-[''] hover:after:border-[#1a1a1a]"
                >
                  <span className="ml-[18px] inline-block text-sm font-semibold tracking-[-0.5px] text-[#1a1a1a]">
                    지식베이스
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleClick('knowledgebase')}
                  className="relative size-7 rounded border-transparent transition-all duration-300 ease-in-out after:absolute after:top-[48%] after:left-[52%] after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:text-xl after:font-extralight after:text-[#666] after:content-['×'] hover:border hover:bg-[#f2f2f2] hover:after:text-[#1a1a1a]"
                >
                  <span className="sr-only">생성</span>
                </button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mt-2 w-full flex-col space-y-2 px-[22px] text-xs leading-[1.5] tracking-[-0.5px] text-[#525252]">
                <div className="line-clamp-2">
                  meta-liama/Meta-Liama-3-8B lim ank dn sdkd ndf nv
                </div>
                <div className="line-clamp-2">meta-liama/Meta-Liama-3-8B</div>
                <div className="line-clamp-2">meta-liama/Meta-Liama-3-8B</div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="end">
            <AccordionTrigger asChild>
              <div className="flex cursor-pointer items-center justify-between gap-5">
                <button
                  type="button"
                  className="relative flex h-7 flex-1 items-center after:absolute after:top-1/2 after:left-0 after:h-[7px] after:w-[7px] after:-translate-y-1/2 after:rotate-[-45deg] after:border-r after:border-b after:border-[#666] after:transition-all after:duration-300 after:ease-in-out after:content-[''] hover:after:border-[#1a1a1a]"
                >
                  <span className="ml-[18px] inline-block text-sm font-semibold tracking-[-0.5px] text-[#1a1a1a]">
                    끝
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleClick('end')}
                  className="relative size-7 rounded border-transparent transition-all duration-300 ease-in-out after:absolute after:top-[48%] after:left-[52%] after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:text-xl after:font-extralight after:text-[#666] after:content-['×'] hover:border hover:bg-[#f2f2f2] hover:after:text-[#1a1a1a]"
                >
                  <span className="sr-only">생성</span>
                </button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mt-2 w-full flex-col space-y-2 px-[22px] text-xs leading-[1.5] tracking-[-0.5px] text-[#525252]">
                <div className="line-clamp-2">
                  meta-liama/Meta-Liama-3-8B lim ank dn sdkd ndf nv
                </div>
                <div className="line-clamp-2">meta-liama/Meta-Liama-3-8B</div>
                <div className="line-clamp-2">meta-liama/Meta-Liama-3-8B</div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
