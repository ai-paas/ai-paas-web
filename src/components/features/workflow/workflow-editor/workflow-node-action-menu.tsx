import { useState } from 'react';
import { DropdownMenu, useToast } from '@innogrid/ui';
import { useWorkflowStore } from '@/store/useWorkflowStore';

interface WorkflowNodeActionMenuProps {
  nodeId: string;
  /** 노드가 선택된 상태면 hover 없이도 버튼을 노출한다 */
  selected?: boolean;
}

/** 메뉴 라벨 + 우측 단축키 힌트. 단축키는 스크린리더용 이름에서 제외한다. */
const menuLabel = (text: string, shortcut: string) => (
  <span className="flex w-full items-center justify-between gap-6">
    {text}
    <span aria-hidden className="text-xs text-gray-400">
      {shortcut}
    </span>
  </span>
);

/**
 * 노드 hover 시(또는 노드가 선택된 동안) 오른쪽 위에 나타나는 ⋯ 버튼.
 * 클릭하면 복사/복제/삭제 메뉴가 열린다.
 * 복사한 노드는 캔버스에서 Ctrl+V(⌘V)로 붙여넣는다.
 */
export const WorkflowNodeActionMenu = ({ nodeId, selected }: WorkflowNodeActionMenuProps) => {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const copyNode = useWorkflowStore((s) => s.copyNode);
  const duplicateNode = useWorkflowStore((s) => s.duplicateNode);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);

  const menus = [
    {
      label: menuLabel('복사', 'Ctrl+C'),
      onSelect: () => {
        copyNode(nodeId);
        toast.open({
          status: 'positive',
          title: '노드 복사됨',
          children: 'Ctrl+V로 캔버스에 붙여넣을 수 있습니다.',
        });
      },
    },
    {
      label: menuLabel('복제', 'Ctrl+D'),
      // hasSeparator는 아이템 "아래"에 선을 그린다 — 삭제 위 구분선은 여기에 붙인다
      hasSeparator: true,
      onSelect: () => duplicateNode(nodeId),
    },
    {
      label: menuLabel('삭제', 'Del'),
      color: 'negative' as const,
      onSelect: () => deleteNode(nodeId),
    },
  ];

  return (
    // 메뉴가 열려 있거나 노드가 선택된 동안엔 hover가 벗어나도 버튼을 유지한다.
    // stopPropagation: 버튼 클릭이 onNodeClick(노드 선택)으로 번지지 않게 한다.
    <div
      className={`workflow-node-action-menu nodrag nopan absolute -top-7 right-0 transition-opacity ${
        open || selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <DropdownMenu menus={menus} open={open} onOpenChange={setOpen} align="end" zIndex={1000}>
        <button
          type="button"
          aria-label="노드 메뉴"
          className="flex h-6 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 shadow-xs hover:bg-gray-50 hover:text-gray-900"
        >
          <span className="text-base leading-none font-bold">⋯</span>
        </button>
      </DropdownMenu>
    </div>
  );
};
