import { useStore, type ReactFlowState } from '@xyflow/react';
import { useEffect, useState } from 'react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { DEFAULT_LABEL } from './workflow-node-defaults';
import { WorkflowNodeCard } from './workflow-node-card';

const zoomSelector = (state: ReactFlowState) => state.transform[2];

/**
 * 컴포넌트 배치 대기 중 마우스를 따라다니는 미리보기.
 * 캔버스뿐 아니라 컴포넌트 패널 등 화면 전역에서 표시되며,
 * 우클릭 또는 ESC 로 배치를 취소한다.
 */
export const WorkflowPlacementGhost = () => {
  const pendingNodeType = useWorkflowStore((s) => s.pendingNodeType);
  const setPendingNodeType = useWorkflowStore((s) => s.setPendingNodeType);
  const zoom = useStore(zoomSelector);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!pendingNodeType) {
      setPosition(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setPendingNodeType(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPendingNodeType(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pendingNodeType, setPendingNodeType]);

  if (!pendingNodeType || !position) return null;

  return (
    <div
      className="pointer-events-none fixed z-9999 opacity-80 shadow-lg"
      style={{
        left: position.x,
        top: position.y,
        // 캔버스 줌 배율에 맞춰 실제 노드와 동일한 크기로 보이게 한다.
        transform: `translate(-50%, -50%) scale(${zoom})`,
      }}
    >
      <WorkflowNodeCard type={pendingNodeType} name={DEFAULT_LABEL[pendingNodeType]} />
    </div>
  );
};
