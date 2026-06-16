import { Panel, useReactFlow, useStore, type ReactFlowState } from '@xyflow/react';
import { memo, type ReactNode, type SVGProps } from 'react';
import { useWorkflowStore } from '@/store/useWorkflowStore';

export type PaneMode = 'pointer' | 'hand';

const zoomSelector = (state: ReactFlowState) => state.transform[2];

const createNoteId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

const ControlButton = ({
  children,
  onClick,
  disabled,
  active,
  label,
}: {
  children: ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  active?: boolean;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    aria-pressed={active}
    className={`flex size-8 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent ${
      active ? 'bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600' : ''
    }`}
  >
    {children}
  </button>
);

const Divider = () => <span className="mx-1 h-5 w-px shrink-0 bg-gray-200" />;

const UndoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
    <path
      d="M3 5h6.5A3.5 3.5 0 0 1 13 8.5v0A3.5 3.5 0 0 1 9.5 12H5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.5 2.5 3 5l2.5 2.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RedoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
    <path
      d="M13 5H6.5A3.5 3.5 0 0 0 3 8.5v0A3.5 3.5 0 0 0 6.5 12H11"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 2.5 13 5l-2.5 2.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MinusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
    <path d="M3.5 8h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
    <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const PointerIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
    <path
      d="M3.5 2.5 12 6.2l-3.6 1.2L6.9 11 3.5 2.5Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.6"
      strokeLinejoin="round"
    />
  </svg>
);

const HandIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
    <path
      d="M5.5 7V4.4a.9.9 0 0 1 1.8 0V7m0 0V3.6a.9.9 0 0 1 1.8 0V7m0 0V4.4a.9.9 0 0 1 1.8 0v3.7c0 2.3-1.4 4.4-3.7 4.4-1.6 0-2.5-.7-3.3-2L3 9.2c-.4-.7.4-1.5 1.1-1.1l1.4.9V7Z"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FitIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
    <path
      d="M3 6V3.5A.5.5 0 0 1 3.5 3H6M10 3h2.5a.5.5 0 0 1 .5.5V6M13 10v2.5a.5.5 0 0 1-.5.5H10M6 13H3.5a.5.5 0 0 1-.5-.5V10"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NoteIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
    <path
      d="M3.5 2.5h9a.5.5 0 0 1 .5.5v6.5L9.5 13H3.5a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path d="M13 9.5H10a.5.5 0 0 0-.5.5V13" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);

interface WorkflowCanvasControlsProps {
  paneMode: PaneMode;
  onPaneModeChange: (mode: PaneMode) => void;
}

export const WorkflowCanvasControls = memo(
  ({ paneMode, onPaneModeChange }: WorkflowCanvasControlsProps) => {
    const { zoomIn, zoomOut, fitView, screenToFlowPosition, addNodes } = useReactFlow();
    const zoom = useStore(zoomSelector);
    const past = useWorkflowStore((s) => s.past);
    const future = useWorkflowStore((s) => s.future);
    const undo = useWorkflowStore((s) => s.undo);
    const redo = useWorkflowStore((s) => s.redo);

    const handleAddNote = (e: React.MouseEvent<HTMLButtonElement>) => {
      const pane = e.currentTarget.closest('.react-flow');
      const rect = pane?.getBoundingClientRect();
      const position = rect
        ? screenToFlowPosition({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 })
        : { x: 0, y: 0 };

      addNodes({
        id: createNoteId(),
        type: 'NOTE',
        position: { x: position.x - 90, y: position.y - 60 },
        data: { label: '노트', text: '' },
      });
    };

    return (
      <Panel position="bottom-center">
        <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-md">
          <ControlButton label="실행 취소 (Undo)" onClick={() => undo()} disabled={past.length === 0}>
            <UndoIcon />
          </ControlButton>
          <ControlButton label="다시 실행 (Redo)" onClick={() => redo()} disabled={future.length === 0}>
            <RedoIcon />
          </ControlButton>

          <Divider />

          <ControlButton label="축소" onClick={() => zoomOut()}>
            <MinusIcon />
          </ControlButton>
          <span className="w-11 text-center text-xs font-medium tabular-nums text-gray-700">
            {Math.round(zoom * 100)}%
          </span>
          <ControlButton label="확대" onClick={() => zoomIn()}>
            <PlusIcon />
          </ControlButton>

          <Divider />

          <ControlButton
            label="포인터 모드"
            onClick={() => onPaneModeChange('pointer')}
            active={paneMode === 'pointer'}
          >
            <PointerIcon />
          </ControlButton>
          <ControlButton
            label="핸드 모드 (화면 이동)"
            onClick={() => onPaneModeChange('hand')}
            active={paneMode === 'hand'}
          >
            <HandIcon />
          </ControlButton>

          <Divider />

          <ControlButton label="화면에 맞추기 (Zoom to fit)" onClick={() => fitView({ padding: 0.2 })}>
            <FitIcon />
          </ControlButton>
          <ControlButton label="노트 블록 추가" onClick={handleAddNote}>
            <NoteIcon />
          </ControlButton>
        </div>
      </Panel>
    );
  }
);

WorkflowCanvasControls.displayName = 'WorkflowCanvasControls';
